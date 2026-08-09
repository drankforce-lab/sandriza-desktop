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

/** Page complète de la fenêtre détachée. */
function pageDetachee(desc) {
  const menus = desc.menus || [];
  const css = desc.cssRail || '';
  const sombre = !!desc.sombre;

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
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
<div id="sz-menubar" class="${sombre ? 'sz-sombre' : ''}"></div>
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
    if(it.accel){ var a=document.createElement('span'); a.className='sz-acc'; a.textContent=it.accel; b.appendChild(a); }
    b.onclick=function(){ envoyer(it); };
    return b;
  }

  function panneau(items){
    var pan=document.createElement('div'); pan.className='sz-panneau';
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
  marque.innerHTML='<div class="sz-pastille">S</div><span class="sz-nom">Sandriza</span>';
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
  const menus = desc.menus || [];
  const css = desc.cssRail || '';
  const sombre = !!desc.sombre;

  /* ⚠ TOUS LES MENUS SONT CONSTRUITS D'AVANCE, UNE FOIS. La première version
     rechargeait la page a CHAQUE survol d'un bouton de la barre — c'était le
     « lag » relevé le 2026-08-09. Ici, `montrer(label)` ne fait que basculer
     l'affichage : instantané.
     ⚠ AUCUNE ÉCHELLE APPLIQUÉE ICI : la feuille du site (cssRail) porte DÉJÀ
     la taille du menu (d.police inclut menuTaille) — le zoom ajouté par-dessus
     doublait l'échelle (« c'est beaucoup trop gros »). Le facteur de zoom de
     la fenêtre principale est posé par la coquille (setZoomFactor), pour que
     panneau et barre paraissent à la même taille. */
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<style>
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
#sous{display:none;margin-left:7px}
.sz-item .sz-fleche{margin-left:auto;opacity:.6;font-size:.8em;padding-left:1.2em}
</style></head><body>
<script>
(function(){
  var D = ${JSON.stringify({ menus })};
  function envoyer(it){ try{ window.szPalette && window.szPalette.action(it); }catch(e){} }

  var rangee=document.createElement('div'); rangee.id='rangee';
  var sous=document.createElement('div'); sous.id='sous';
  sous.className='sz-panneau${sombre ? ' sz-sombre' : ''}';

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
    if(it.accel){ var a=document.createElement('span'); a.className='sz-acc'; a.textContent=it.accel; b.appendChild(a); }
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
  D.menus.forEach(function(m){
    var pan=document.createElement('div');
    pan.className='sz-panneau${sombre ? ' sz-sombre' : ''}';
    pan.style.display='none';
    if (m.entete) pan.appendChild(enteteCompte(m.entete));
    (m.items||[]).forEach(function(it){ pan.appendChild(entree(it, false)); });
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
      panneaux[k].style.display = (k === label) ? 'block' : 'none';
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
