'use strict';

/*
 * FENÊTRE DE MENU DÉTACHÉE
 * =============================================================================
 * Le menu ancré est dessiné par le SITE (assets/js/appbar.js). Cette fenêtre-ci
 * est un document LOCAL : elle ne peut pas charger ce module. Elle reçoit donc
 * du site, avec le modèle, sa FEUILLE DE STYLE (`cssRail`) et se contente de
 * bâtir la même structure de balises.
 *
 * ⚠ POURQUOI LA FEUILLE VOYAGE PLUTÔT QUE D'ÊTRE RECOPIÉE ICI.
 * Elle l'a été, et elle a dérivé : le rail ancré a gagné des emojis, un pied de
 * colonne aligné, des espacements revus — la fenêtre détachée, elle, est restée
 * à la version d'origine. Deux menus qui ne se ressemblaient plus alors qu'ils
 * sont censés être le même. Une seule source, envoyée à chaque mise à jour du
 * modèle.
 *
 * ⚠ ET UNE SEULE DIVERGENCE ASSUMÉE : les sous-menus s'ouvrent EN ACCORDÉON,
 * pas en panneau volant. Dans une palette de 260 px, un panneau qui sort sur le
 * côté serait coupé par le bord de la fenêtre.
 */

/* ⚠ LA LANGUE DE LA PAGE, PAS SON TEXTE. Le contenu de ces deux pages arrive
   DÉJÀ traduit — `main.js` passe les entrées par `trItems` avant de les envoyer.
   Seul l'attribut `lang` restait figé à « fr », et c'est lui, pas le texte, que
   lisent la coupure des mots, le correcteur et le lecteur d'écran : un menu
   anglais annoncé français se fait épeler à la française. */
const LANG = () => { try { return require('./langue').langueCourante(); } catch (e) { return 'fr'; } };

/** Page complète de la fenêtre détachée. */
function pageDetachee(desc) {
  const menus = desc.menus || [];
  const css = desc.cssRail || '';
  const sombre = !!desc.sombre;
  // Le jeu de couleurs du poste (Carbone…) : la feuille du site le lit sur data-sz-th (2026-10-12).
  const th = String(desc.theme || 'lin').replace(/[^a-z]/g, '');

  return `<!doctype html><html lang="${LANG()}"><head><meta charset="utf-8">
<title>Menu — Administration Sandriza</title>
<style>
html,body{margin:0;height:100%;overflow:hidden}
body{background:var(--sz-bg,#131b2a)}
/* La barre occupe toute la fenêtre : on neutralise le positionnement fixe que
   la feuille du site lui donne quand elle est ancrée dans une page. */
#sz-menubar{position:static!important;top:auto!important;bottom:auto!important;
  left:auto!important;right:auto!important;width:100%!important;height:100%!important;
  border:0!important;overflow-y:auto}
/* Sous-menus en accordéon : dans 260 px, un panneau volant sortirait du cadre. */
.sz-panneau{position:static!important;box-shadow:none!important;border:0!important;
  padding:2px 0 6px 10px!important;min-width:0!important;max-width:none!important;
  background:transparent!important;animation:none!important}
#sz-menubar .sz-marque{background:none;border:0;font:inherit;color:inherit;
  cursor:pointer;width:100%;text-align:left}
#sz-menubar .sz-marque:hover{opacity:.82}
.sz-corps{display:none}
.sz-corps.sz-on{display:block}
.sz-pied{display:flex;gap:4px;justify-content:space-between;padding:10px 8px 4px;
  border-top:1px solid var(--sz-bord);margin-top:auto}
${css}
</style></head><body>
<div id="sz-menubar" class="${sombre ? 'sz-sombre' : ''}" data-sz-th="${th}"></div>
<script>
(function(){
  var D = ${JSON.stringify({ menus, version: desc.version || '' })};
  var bar = document.getElementById('sz-menubar');

  function envoyer(it){ try{ window.szPalette && window.szPalette.action(it); }catch(e){} }

  function entree(it){
    if(it.sep){ var h=document.createElement('div'); h.className='sz-sep'; return h; }
    var b=document.createElement('button'); b.type='button'; b.className='sz-item';
    if(it.coche!==undefined){ var c=document.createElement('span'); c.className='sz-coche';
      c.textContent=it.coche?'\\u2713':''; b.appendChild(c); }
    var l=document.createElement('span'); l.className='sz-lbl'; l.textContent=it.label; b.appendChild(l);
    /* (2026-11-22, sa demande) plus de raccourci à côté des entrées : Ctrl+K maintenu les rappelle. */
    b.onclick=function(){ envoyer(it); };
    return b;
  }

  function panneau(items){
    var pan=document.createElement('div'); pan.className='sz-panneau${sombre ? ' sz-sombre' : ''}'; pan.setAttribute('data-sz-th','${th}');
    items.forEach(function(it){
      if(it.sub){
        // Sous-groupe (Configuration > Apparence...) : on aplatit d'un cran,
        // avec son libelle en intertitre. Empiler deux accordeons dans une
        // colonne aussi etroite rendrait la navigation penible.
        var t=document.createElement('div'); t.className='sz-titre'; t.textContent=it.label;
        pan.appendChild(t);
        it.sub.forEach(function(si){ pan.appendChild(entree(si)); });
        return;
      }
      pan.appendChild(entree(it));
    });
    return pan;
  }

  // La marque ramene au tableau de bord, comme dans la barre ancree. Une meme
  // chose au meme endroit doit faire la meme chose, sinon on apprend deux
  // comportements pour un seul element.
  var marque=document.createElement('button'); marque.type='button'; marque.className='sz-marque';
  marque.title='Tableau de bord';
  marque.setAttribute('aria-label','Revenir au tableau de bord');
  // le MONOGRAMME du nouveau logo (2026-10-18), comme la barre ancrée (appbar.js)
  marque.innerHTML='<div class="sz-pastille" aria-hidden="true"><span class="sz-s">S</span><span class="sz-z">z</span></div><span class="sz-nom">Sandriza</span>';
  marque.onclick=function(){ envoyer({section:'dashboard'}); };
  bar.appendChild(marque);

  D.menus.forEach(function(m){
    var b=document.createElement('button'); b.type='button'; b.className='sz-btn';
    if(m.emoji){ var e=document.createElement('span'); e.className='sz-emoji'; e.textContent=m.emoji; b.appendChild(e); }
    var lb=document.createElement('span'); lb.style.flex='1'; lb.textContent=m.label; b.appendChild(lb);
    var fl=document.createElement('span'); fl.className='sz-fleche'; fl.textContent='\\u25B8'; b.appendChild(fl);
    var corps=document.createElement('div'); corps.className='sz-corps';
    corps.appendChild(panneau(m.items||[]));
    b.onclick=function(){
      // Un seul groupe ouvert a la fois : sinon la colonne devient une liste
      // interminable ou l'on ne retrouve rien.
      var ouverts=bar.querySelectorAll('.sz-corps.sz-on');
      for(var i=0;i<ouverts.length;i++){ if(ouverts[i]!==corps){ ouverts[i].classList.remove('sz-on'); } }
      var on=corps.classList.toggle('sz-on');
      fl.textContent=on?'\\u25BE':'\\u25B8';
    };
    bar.appendChild(b);
    bar.appendChild(corps);
  });

  var pied=document.createElement('div'); pied.className='sz-pied';
  [['En haut','dock:haut'],['À gauche','dock:gauche'],['À droite','dock:droite']].forEach(function(p){
    var b=document.createElement('button'); b.type='button'; b.className='sz-btn';
    b.textContent=p[0]; b.style.flex='1'; b.style.justifyContent='center';
    b.onclick=function(){ envoyer({app:p[1]}); };
    pied.appendChild(b);
  });
  bar.appendChild(pied);
})();
</script></body></html>`;
}

/*
 * PANNEAU FLOTTANT D'UN MENU (1.56.1)
 * =============================================================================
 * Quand un écran est ANCRÉ, un panneau dessiné dans la page passe DESSOUS la
 * vue native ; et le menu du SYSTÈME (1.55.1) imposait le thème de Windows et
 * ne s'ouvrait qu'au clic. Ce panneau-ci est une petite fenêtre SANS CADRE de
 * l'application : le THÈME DU SITE (cssRail voyage avec le modèle, comme la
 * palette), l'ouverture au survol (montrée sans voler le focus), et il passe
 * au-dessus de tout puisque c'est une fenêtre.
 * Les clics passent par palette:action — les mêmes chemins que la palette.
 */
function pagePanneau(desc) {
  // (2026-11-18, maquette) La police d'Épuré, EMBARQUÉE : ce panneau est une page locale, il ne voit pas les fichiers du site.
  let POLICE = ''; try { if (String(desc.theme || '') === 'epure') POLICE = require('./police-epure'); } catch (e) { POLICE = ''; }
  const menus = desc.menus || [];
  const css = desc.cssRail || '';
  const sombre = !!desc.sombre;
  // Le jeu de couleurs du poste (Carbone…) : la feuille du site le lit sur data-sz-th (2026-10-12).
  const th = String(desc.theme || 'lin').replace(/[^a-z]/g, '');
  const te = String(desc.teinte || 'epure').replace(/[^a-z]/g, '');   // (2026-11-18) le THÈME du look : l'accent suit

  /* ⚠ TOUS LES MENUS SONT CONSTRUITS D'AVANCE, UNE FOIS. La première version
     rechargeait la page a CHAQUE survol d'un bouton de la barre — c'était le
     « lag » relevé le 2026-08-09. Ici, `montrer(label)` ne fait que basculer
     l'affichage : instantané.
     ⚠ AUCUNE ÉCHELLE APPLIQUÉE ICI : la feuille du site (cssRail) porte DÉJÀ
     la taille du menu (d.police inclut menuTaille) — le zoom ajouté par-dessus
     doublait l'échelle (« c'est beaucoup trop gros »). Le facteur de zoom de
     la fenêtre principale est posé par la coquille (setZoomFactor), pour que
     panneau et barre paraissent à la même taille. */
  /* (2026-11-19, sa capture du panneau « Catalogue » : « il faudrait une couleur de fond des menus différente, ça devient
     confondant, la même couleur partout ») Le panneau avait EXACTEMENT la couleur des cartes (#181e29 la nuit, blanc le
     jour) : posé sur le tableau de bord, il s'y fondait. Il prend une surface À LUI, « surélevée » et teintée du thème —
     un cran plus claire la nuit, une pointe de l'accent le jour — et une bordure à l'accent. Contrastes mesurés dans les
     8 thèmes : libellé gris ≥ 5,4, survol ≥ 8,2. */
  let PAN = '';
  try {
    const T = require('./teintes'); const t = T.teinte(te) || {};
    const mix = (a, b, k) => { const h = (x) => [1, 3, 5].map((i) => parseInt(String(x).slice(i, i + 2), 16)); const A = h(a), B = h(b);
      return '#' + A.map((v, i) => Math.round(v * k + B[i] * (1 - k)).toString(16).padStart(2, '0')).join(''); };
    const rgb = (x) => [1, 3, 5].map((i) => parseInt(String(x).slice(i, i + 2), 16)).join(',');
    const pj = t.prim || '#8a5a2b', pn = t.primN || '#c9a27a';
    PAN = '.sz-panneau.ep-pan{background:' + mix(pj, '#ffffff', 0.06) + '!important;border-color:rgba(' + rgb(pj) + ',.24)!important}'
      + '.ep-pan .ep-col .sz-item{border-bottom-color:' + mix(pj, '#e9ebf1', 0.10) + '!important}'
      + '.ep-pan .ep-col .sz-item:hover{background:' + mix(pj, '#ffffff', 0.13) + '!important}'
      + '.ep-pan .ep-col+.ep-col{border-left-color:' + mix(pj, '#e4e7ee', 0.10) + '}'
      + '.ep-pan .ep-tete .x{background:transparent;border-color:rgba(' + rgb(pj) + ',.24)}'
      + '.sz-panneau.ep-pan.sz-sombre{background:' + mix(pn, '#252d3d', 0.08) + '!important;border-color:rgba(' + rgb(pn) + ',.30)!important}'
      + '.sz-sombre.ep-pan .ep-col .sz-item{border-bottom-color:' + mix(pn, '#323b4d', 0.08) + '!important}'
      + '.sz-sombre.ep-pan .ep-col .sz-item:hover{background:' + mix(pn, '#252d3d', 0.16) + '!important}'
      + '.sz-sombre.ep-pan .ep-col+.ep-col{border-left-color:' + mix(pn, '#36404f', 0.08) + '}'
      + '.sz-sombre.ep-pan .ep-tete .x{background:transparent;border-color:rgba(' + rgb(pn) + ',.30)}'
      + '.sz-sombre .ep-tete .nb,.sz-sombre .ep-col .t{color:#a9b2c1}';
  } catch (e) { PAN = ''; }
  return `<!doctype html><html lang="${LANG()}" data-sz-teinte="${te}"><head><meta charset="utf-8">
<style>${POLICE}
html,body{margin:0;overflow:hidden}
/* ⚠ FENETRE TRANSPARENTE : chaque panneau porte SON fond, sa bordure et son
   ombre — le sous-menu est une vraie boite a la hauteur de ses elements, et
   le fond ne << se poursuit >> plus derriere (releve du 2026-08-09). */
body{background:transparent;padding:7px}
.sz-panneau{position:static!important;margin:0!important;
  max-width:none!important;width:max-content!important;
  max-height:none!important;animation:none!important;overflow:visible!important}
${css}
/* ⚠ COMPACT, ET APRES la feuille du site pour la battre : le panneau herite
   de l echelle du MENU (d.police x menuTaille), pensee pour une barre — en
   panneau vertical c etait trop gros ; 12 px etait trop petit (2026-08-09).
   ⚠ REGLE INDEPENDAMMENT DE LA BARRE, et c est la demande du 2026-08-09 :
   << grossir mon menu, pas la barre des menus mais les options en dessous >>.
   Les deux tailles ne sont donc PAS liees : la barre garde la sienne (menuTaille,
   reglable dans Affichage), le panneau a celle-ci. 13,5 -> 15 px, avec les
   retraits et l interligne remontes d autant, sinon on grossit le texte dans une
   boite restee etroite. Ces reglages ne vivent QUE dans cette fenetre : la barre
   et les panneaux des ecrans web gardent les leurs. */
.sz-panneau{font-size:15px!important;line-height:1.36!important;padding:.34rem .28rem!important}
.sz-panneau .sz-item{padding:.32em .95em!important;line-height:1.36!important;min-height:0!important;gap:.55em!important;width:100%!important}
.sz-panneau .sz-lbl{font-size:15px!important}
.sz-panneau .sz-acc{font-size:12px!important}
.sz-panneau .sz-titre{font-size:11.5px!important;padding:.55em .95em .2em!important;margin:0!important}
.sz-panneau .sz-sep{margin:.32em .55em!important}
/* Chaque panneau est une BOITE a lui : fond, bordure, coins ronds, ombre —
   apres la feuille du site pour la battre. */
.sz-panneau{background:var(--sz-bg,${sombre ? '#131b2a' : '#ffffff'})!important;
  border:1px solid var(--sz-bord,rgba(255,255,255,.09))!important;
  border-radius:10px!important;
  box-shadow:0 10px 26px rgba(0,0,0,${sombre ? '.5' : '.18'})!important}
/* Les SOUS-MENUS volants : la colonne principale et le sous-panneau vivent
   cote a cote dans la meme fenetre, qui s elargit quand un sous-menu s ouvre.
   ⚠ INLINE-flex, et c est LA correction : un bloc remplit la fenetre, sa
   mesure renvoyait donc la largeur de la FENETRE — elle ne se resserrait
   jamais (grand fond vide a droite, releve du 2026-08-09). En inline-flex,
   la rangee a la largeur de son CONTENU, et la fenetre l epouse. Le
   sous-panneau, ALIGNE EN HAUT DE SON PARENT, a la hauteur de ses elements. */
#rangee{display:inline-flex;align-items:flex-start;vertical-align:top}
/* ══ LE PANNEAU DE LA MAQUETTE (Épuré, 2026-11-18) ══ carte blanche, en-tête (carré, titre, « N entrées », ✕),
   colonnes à filet gauche, titre de groupe en petites capitales, lignes de 38 px soulignées. Chaque colonne a la
   largeur de son plus long libellé : RIEN n'est coupé. */
.sz-panneau.ep-pan{background:#ffffff!important;border:1px solid #e4e7ee!important;border-radius:16px!important;
  box-shadow:0 24px 48px -16px rgba(16,24,40,.28)!important;padding:16px 18px 14px!important;display:block;
  font-family:"SzEpure","Plus Jakarta Sans","Segoe UI",system-ui,sans-serif!important;color:#1f2533}
.sz-panneau.ep-pan.sz-sombre{background:#181e29!important;border-color:#283142!important;color:#e8ecf2;box-shadow:0 24px 48px -16px rgba(0,0,0,.6)!important}
.ep-tete{display:flex;align-items:center;gap:10px;margin:0 0 12px}
.ep-tete .ic{width:26px;height:26px;border-radius:7px;background:#3d4456;color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center}
.ep-tete .ic.svg{background:transparent;color:#94704A}
.sz-sombre .ep-tete .ic.svg{color:#C9A57E}
.ep-tete b{font-size:16px;font-weight:800;white-space:nowrap}
.ep-tete .nb{font-size:12px;color:#5b6273;white-space:nowrap}
.sz-sombre .ep-tete .nb{color:#9aa4b5}
.ep-tete .x{margin-left:auto;width:30px;height:30px;border-radius:8px;border:1px solid #e4e7ee;background:#fff;color:#3d4456;font:inherit;cursor:pointer;padding:0}
.sz-sombre .ep-tete .x{background:#1c2330;border-color:#283142;color:#c9d1dd}
.ep-cols{display:grid;grid-auto-flow:column;grid-auto-columns:max-content;align-items:start}
.ep-col{display:flex;flex-direction:column;padding:0 14px;min-width:13rem}
.ep-col+.ep-col{border-left:1px solid #e4e7ee}
.sz-sombre .ep-col+.ep-col{border-left-color:#283142}
.ep-col .t{font-size:11px;font-weight:700;color:#5b6273;text-transform:uppercase;letter-spacing:.06em;padding:0 8px 8px;white-space:nowrap}
.sz-sombre .ep-col .t{color:#9aa4b5}
.ep-pan .ep-col .sz-item{height:38px!important;min-height:38px!important;padding:0 8px!important;border-radius:0!important;border-bottom:1px solid #eef0f4!important;
  font-size:13px!important;font-weight:500!important;white-space:nowrap!important;width:auto!important;gap:12px!important}
.sz-sombre.ep-pan .ep-col .sz-item{border-bottom-color:#222a38!important}
.ep-pan .ep-col .sz-item .sz-lbl{font-size:13px!important;overflow:visible!important;text-overflow:clip!important}
.ep-nb{flex:0 0 auto;margin-left:auto;min-width:26px;height:22px;padding:0 8px;box-sizing:border-box;border-radius:99px;
  display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;background:#eef0f4;color:#3d4456}
.ep-nb.a{background:#fdebd3;color:#8a3f00}
.sz-sombre .ep-nb{background:#252d3b;color:#c9d1dd}
.sz-sombre .ep-nb.a{background:#33270f;color:#f2c27e}
/* Autonome : les lignes ne dépendent pas de la feuille du site (cssRail) pour leur apparence. */
.ep-pan .ep-col .sz-item{display:flex!important;align-items:center;justify-content:flex-start;background:transparent!important;border-top:0!important;
  border-left:0!important;border-right:0!important;color:inherit!important;font-family:inherit!important;text-align:left;cursor:pointer;box-shadow:none!important}
.ep-pan .ep-col .sz-item:hover{background:#f4f5f9!important;color:var(--ep-doux-t,#6b431e)!important}
.sz-sombre.ep-pan .ep-col .sz-item:hover{background:#222a38!important;color:var(--ep-douxN-t,#e3c29e)!important}
.ep-pan .sz-coche{display:inline-block;width:1em;flex:none;color:var(--ep-a,#8a5a2b);font-weight:800}
/* (2026-11-28, sa capture d'Affichage : « c'est beaucoup trop grand ») Le panneau COMPACT : lignes de 30 px, colonnes
   étroites, petits groupes empilés dans une même colonne (voir panneauMaquette). */
.ep-pan.ep-compact{padding:12px 12px 10px!important}
.ep-compact .ep-tete{margin:0 0 8px}
.ep-compact .ep-col{min-width:8.5rem;padding:0 10px}
.ep-pan.ep-compact .ep-col .sz-item{height:30px!important;min-height:30px!important;font-size:12.5px!important;gap:8px!important}
.ep-pan.ep-compact .ep-col .sz-item .sz-lbl{font-size:12.5px!important}
.ep-compact .ep-col .t{padding:0 8px 4px;font-size:10.5px}
.ep-col .t.suite{padding-top:12px}
.sz-sombre.ep-pan .sz-coche{color:var(--ep-aN,#c9a27a)}
#sous{display:none;margin-left:7px}
.sz-item .sz-fleche{margin-left:auto;opacity:.6;font-size:.8em;padding-left:1.2em}
${PAN}
</style></head><body>
<script>
(function(){
  var D = ${JSON.stringify({ menus })};
  function envoyer(it){ try{ window.szPalette && window.szPalette.action(it); }catch(e){} }

  var rangee=document.createElement('div'); rangee.id='rangee';
  var sous=document.createElement('div'); sous.id='sous';
  sous.className='sz-panneau${sombre ? ' sz-sombre' : ''}'; sous.setAttribute('data-sz-th','${th}');

  function mesurer(){
    // + les 7 px de marge transparente de chaque cote (l ombre y respire).
    try {
      window.szPalette.taille(Math.ceil(rangee.scrollWidth) + 16, Math.ceil(rangee.scrollHeight) + 16);
    } catch(e){}
  }
  function cacherSous(){
    if (sous.style.display !== 'block') return;
    sous.style.display='none'; sous.innerHTML='';
    mesurer();
  }
  /* LES SOUS-MENUS VOLANTS (« je n'ai plus mes sous-menus », 2026-08-09) :
     survoler un parent ouvre son panneau A DROITE, aligne sur lui — la
     fenetre s elargit d autant, et se resserre quand il se referme. */
  function montrerSous(it, parent){
    sous.innerHTML='';
    (it.sub||[]).forEach(function(si){ sous.appendChild(entree(si, true)); });
    sous.style.display='block';
    /* PARALLELE A SON PARENT (releve du 2026-08-09 : le sous-menu s ouvrait
       en haut de la colonne). Mesure ABSOLUE — rect du parent moins rect de
       la rangee — plutot qu offsetTop, dont l origine depend de l arbre.
       ⚠ setProperty(..., 'important') : la neutralisation ci-dessus pose
       margin:0!important sur .sz-panneau, et un !important de FEUILLE bat un
       style inline ordinaire — la marge calculee ne prenait jamais. */
    var rp = parent.getBoundingClientRect();
    var rr = rangee.getBoundingClientRect();
    sous.style.setProperty('margin-top', Math.max(0, Math.round(rp.top - rr.top) - 3) + 'px', 'important');
    sous.style.setProperty('margin-left', '7px', 'important');
    mesurer();
  }

  function entree(it, dansSous){
    if(it.sep){ var h=document.createElement('div'); h.className='sz-sep'; return h; }
    var b=document.createElement('button'); b.type='button'; b.className='sz-item';
    if(it.coche!==undefined){ var c=document.createElement('span'); c.className='sz-coche';
      c.textContent=it.coche?'\\u2713':''; b.appendChild(c); }
    var l=document.createElement('span'); l.className='sz-lbl'; l.textContent=it.label; b.appendChild(l);
    // (2026-11-18, maquette) le compteur de l'entrée, dans une pastille nette (ambre : une action attend ; gris : information)
    if(it.nb){ var nb=document.createElement('span'); nb.className='ep-nb'+(it.ton==='a'?' a':''); nb.textContent=it.nb>99?'99+':String(it.nb); b.appendChild(nb); }
    /* (2026-11-22, sa demande) plus de raccourci à côté des entrées : Ctrl+K maintenu les rappelle. */
    if(it.sub){
      var f=document.createElement('span'); f.className='sz-fleche'; f.textContent='\\u25B8'; b.appendChild(f);
      b.onmouseenter=function(){ montrerSous(it, b); };
      b.onclick=function(){ montrerSous(it, b); };
    } else {
      b.onclick=function(){ envoyer(it); };
      // Passer sur un element SANS sous-menu referme le sous-panneau — sauf
      // dans le sous-panneau lui-meme, evidemment.
      if(!dansSous) b.onmouseenter=cacherSous;
    }
    return b;
  }

  /* ⚠ L EN-TETE DU COMPTE (1.66.0). Le panneau du compte se dessinait dans la
     PAGE : sur un ecran ancre il fallait voiler la vue native, et l ecran
     disparaissait sous les yeux. Il emprunte desormais ce panneau flottant —
     encore faut-il savoir dessiner son bloc de tete. Les classes .sz-cpt* sont
     deja portees par la feuille du rail, qui voyage avec le modele. */
  function enteteCompte(e){
    var bloc=document.createElement('div'); bloc.className='sz-cpt';
    var av=document.createElement('div'); av.className='sz-cpt-av';
    av.style.background='linear-gradient(135deg,'+(e.couleur||'#C49A6C')+','+(e.couleur||'#C49A6C')+'b0)';
    av.textContent=e.initiales||'?';
    bloc.appendChild(av);
    var txt=document.createElement('div'); txt.className='sz-cpt-txt';
    var l1=document.createElement('div'); l1.className='sz-cpt-nom'; l1.textContent=e.nom||''; txt.appendChild(l1);
    if(e.role){
      var l2=document.createElement('div'); l2.className='sz-cpt-role';
      var pt=document.createElement('span'); pt.className='sz-cpt-pt'; pt.style.background=e.couleur||'#C49A6C';
      l2.appendChild(pt);
      var lb=document.createElement('span'); lb.textContent=e.role; l2.appendChild(lb);
      txt.appendChild(l2);
    }
    if(e.courriel){
      var l3=document.createElement('div'); l3.className='sz-cpt-mail'; l3.textContent=e.courriel; txt.appendChild(l3);
    }
    bloc.appendChild(txt);
    return bloc;
  }

  var panneaux = {};
  /* (2026-11-18, relooking « Épuré ») Rien ne se déplie au survol : les groupes deviennent des cartes. */
  function cartes(pan, items){
    // ⚠ 'block' et pas 'grid' : la feuille du site range les cartes en COLONNES ÉQUILIBRÉES (column-count) ;
    // un display:grid posé ici l'écraserait (mesuré côté site : 1268 px de haut en grille, 527 en colonnes).
    pan.classList.add('sz-cartes'); pan.dataset.aff='block';
    var libres=[];
    items.forEach(function(it){
      if(it.sep) return;
      if(!it.sub){ libres.push(it); return; }
      var c=document.createElement('div'); c.className='sz-carte';
      var h=document.createElement('div'); h.className='sz-carte-t'; h.textContent=it.label; c.appendChild(h);
      it.sub.forEach(function(si){ if(!si.sep && !si.sub) c.appendChild(entree(si, true)); });
      pan.appendChild(c);
    });
    if(libres.length){
      var c=document.createElement('div'); c.className='sz-carte';
      var h=document.createElement('div'); h.className='sz-carte-t'; h.textContent=D.systeme||'Système'; c.appendChild(h);
      libres.forEach(function(it){ c.appendChild(entree(it, true)); });
      pan.appendChild(c);
    }
  }
  var EP_EN = (document.documentElement.lang || 'fr') === 'en';
  /* (2026-11-27, sa demande : icônes « plus professionnelles », couleurs « trop flash » → « 2 · Or Sandriza ») Le même jeu
     que la colonne du site (appbar.js ICO_SECTION) : trait fin, une forme par métier, style Lucide (licence ISC). */
  var _IC_BOUT='<path d="M3.5 9.5 5 4.5h14l1.5 5"/><path d="M3.5 9.5h17"/><path d="M3.5 9.5a2.83 2.83 0 0 0 5.67 0a2.83 2.83 0 0 0 5.66 0a2.83 2.83 0 0 0 5.67 0"/><path d="M5 12.6V20h14v-7.4"/><path d="M10 20v-4.5h4V20"/>',
      _IC_STK='<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="m7.5 4.27 9 5.15"/>',
      _IC_PHO='<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
      _IC_CAT='<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
      _IC_MKT='<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
      _IC_CPT='<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
      _IC_AFF='<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
      _IC_CONF='<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>';
  var ICO_SECTION={ 'Boutique':_IC_BOUT, 'Shop':_IC_BOUT, 'Catalogue':_IC_CAT, 'Produits':_IC_CAT, 'Products':_IC_CAT, 'Stock et achats':_IC_STK, 'Stock & purchasing':_IC_STK, 'Photos et création':_IC_PHO, 'Photos & creation':_IC_PHO, 'Marketing':_IC_MKT, 'Comptabilité':_IC_CPT, 'Accounting':_IC_CPT,
    'Affichage':_IC_AFF, 'View':_IC_AFF, 'Configuration':_IC_CONF };
  function panneauMaquette(pan, m){
    pan.classList.add('ep-pan'); pan.dataset.aff='block';
    // (2026-11-18, « trop d'options ») epCache : gardée dans le modèle (raccourcis, Ctrl K), absente du panneau Épuré.
    var its=(m.items||[]).filter(function(it){ return it && !it.sep && !it.epCache; });
    var cols=[], libres=[];
    its.forEach(function(it){
      if (it.sub) cols.push({ t: it.label, items: it.sub.filter(function(x){ return x && !x.sep && !x.epCache; }) });
      else libres.push(it);
    });
    if (libres.length) {
      // une liste plate se range en colonnes égales : 1 jusqu'à 8 entrées, 2 jusqu'à 16, 3 au-delà
      var k = libres.length <= 8 ? 1 : (libres.length <= 16 ? 2 : 3), per = Math.ceil(libres.length / k), plates=[];
      for (var i = 0; i < libres.length; i += per) plates.push({ t: '', items: libres.slice(i, i + per) });
      cols = plates.concat(cols);
    }
    var n = 0; cols.forEach(function(c){ n += c.items.length; });
    /* (2026-11-28, « beaucoup trop grand ») AFFICHAGE en compact : un groupe long (> 6) se coupe en deux colonnes, et
       les petits groupes (≤ 3) se partagent une colonne, jusqu'à 6 entrées. Les autres panneaux gardent leur rangement. */
    var compact = /^(Affichage|View)$/.test(String(m.label||'').trim());
    var colonnes = cols.map(function(c){ return { groupes: [c], n: c.items.length, pile: false }; });
    if (compact) {
      pan.classList.add('ep-compact');
      colonnes = [];
      cols.forEach(function(c){
        var der = colonnes[colonnes.length - 1];
        if (c.items.length > 6) {
          var moit = Math.ceil(c.items.length / 2);
          colonnes.push({ groupes: [{ t: c.t, items: c.items.slice(0, moit) }], n: moit, pile: false });
          colonnes.push({ groupes: [{ t: c.t ? ' ' : '', items: c.items.slice(moit) }], n: c.items.length - moit, pile: false });
        } else if (c.items.length <= 3 && der && der.pile && der.n + c.items.length <= 6) {
          der.groupes.push(c); der.n += c.items.length;
        } else colonnes.push({ groupes: [c], n: c.items.length, pile: c.items.length <= 3 });
      });
    }
    var tete=document.createElement('div'); tete.className='ep-tete';
    /* (2026-11-20, sa demande) Une icône au trait, la même que la colonne du site (appbar.js ICO_SECTION) ; la lettre reste le repli. */
    var ic=document.createElement('span'); ic.className='ic'; var _sv=ICO_SECTION[String(m.label||'').trim()];
    if(_sv){ ic.className='ic svg'; ic.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+_sv+'</svg>'; }
    else ic.textContent=String(m.label||'?').trim().charAt(0).toUpperCase();
    tete.appendChild(ic);
    var b=document.createElement('b'); b.textContent=m.label; tete.appendChild(b);
    var nb=document.createElement('span'); nb.className='nb'; nb.textContent=n + ' ' + (EP_EN ? (n > 1 ? 'entries' : 'entry') : (n > 1 ? 'entrées' : 'entrée')); tete.appendChild(nb);
    var x=document.createElement('button'); x.type='button'; x.className='x'; x.textContent='\u2715';
    x.setAttribute('aria-label', EP_EN ? 'Close the panel' : 'Fermer le panneau');
    x.onclick=function(){ try{ window.szPalette.fermer(); }catch(e){} };
    tete.appendChild(x);
    pan.appendChild(tete);
    var grille=document.createElement('div'); grille.className='ep-cols';
    /* (2026-11-18, sa capture d'Affichage : six colonnes, le panneau sortait de la fenêtre et couvrait la colonne)
       Au-delà de QUATRE groupes, les colonnes passent sur deux rangées au lieu d'élargir le panneau. */
    var parRang = colonnes.length > 4 ? Math.ceil(colonnes.length / Math.ceil(colonnes.length / 4)) : colonnes.length;
    if (colonnes.length > 4) {
      grille.style.gridAutoFlow = 'row';
      grille.style.gridTemplateColumns = 'repeat(' + parRang + ', max-content)';
      grille.style.rowGap = '18px';
    }
    colonnes.forEach(function(cc, ci){
      var col=document.createElement('div'); col.className='ep-col';
      if (colonnes.length > 4 && ci % parRang === 0) col.style.borderLeft = '0';
      cc.groupes.forEach(function(c, gi){
        if (c.t) { var t=document.createElement('span'); t.className='t' + (gi ? ' suite' : ''); t.textContent=c.t; col.appendChild(t); }
        c.items.forEach(function(it){ col.appendChild(entree(it, false)); });
      });
      grille.appendChild(col);
    });
    pan.appendChild(grille);
  }
  D.menus.forEach(function(m){
    var pan=document.createElement('div');
    pan.className='sz-panneau${sombre ? ' sz-sombre' : ''}'; pan.setAttribute('data-sz-th','${th}');
    pan.style.display='none';
    if (m.entete) pan.appendChild(enteteCompte(m.entete));
    var its=(m.items||[]);
    var nSous=its.filter(function(it){ return it && it.sub; }).length;
    var nEnt=its.filter(function(it){ return it && !it.sep; }).length;
    if ('${th}' === 'epure' && !m.entete) panneauMaquette(pan, m);
    else if ('${th}' === 'epure' && nSous >= 3) cartes(pan, its);
    else {
      if ('${th}' === 'epure' && nEnt > 10) { pan.classList.add('sz-colonnes'); pan.style.setProperty('--sz-rangs', String(Math.ceil(nEnt / 3))); pan.dataset.aff='grid'; }
      its.forEach(function(it){ pan.appendChild(entree(it, false)); });
    }
    rangee.appendChild(pan);
    panneaux[m.label]=pan;
  });
  rangee.appendChild(sous);
  document.body.appendChild(rangee);

  // Bascule instantanee d'un menu a l'autre, et la fenetre epouse le contenu
  // REEL (jamais de barre de defilement).
  window.montrer = function(label){
    sous.style.display='none'; sous.innerHTML='';
    Object.keys(panneaux).forEach(function(k){
      // (2026-11-18) un panneau Epure en colonnes ou en cartes se montre en GRILLE, pas en bloc
      panneaux[k].style.display = (k === label) ? (panneaux[k].dataset.aff || 'block') : 'none';
    });
    if (panneaux[label]) mesurer();
  };

  // Le survol tient le panneau ouvert — le quitter le referme, en differe court.
  document.addEventListener('mouseenter', function(){ try{ window.szPalette.survol(true); }catch(e){} });
  document.addEventListener('mouseleave', function(){ try{ window.szPalette.survol(false); }catch(e){} });
})();
</script></body></html>`;
}

module.exports = { pageDetachee, pagePanneau };
