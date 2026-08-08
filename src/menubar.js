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
body{background:var(--sz-bg,${sombre ? '#131b2a' : '#ffffff'})}
/* Le panneau vit seul dans sa fenêtre : on neutralise le positionnement volant
   que la feuille du site lui donne quand il vit dans une page — et il garde sa
   LARGEUR NATURELLE, que la fenêtre épouse (panneau:taille). */
.sz-panneau{position:static!important;margin:0!important;
  box-shadow:none!important;border:0!important;border-radius:0!important;
  max-width:none!important;width:max-content!important;
  max-height:none!important;animation:none!important;overflow:visible!important}
${css}
</style></head><body>
<script>
(function(){
  var D = ${JSON.stringify({ menus })};
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

  var panneaux = {};
  D.menus.forEach(function(m){
    var pan=document.createElement('div');
    pan.className='sz-panneau${sombre ? ' sz-sombre' : ''}';
    pan.style.display='none';
    (m.items||[]).forEach(function(it){
      if(it.sub){
        // Sous-groupe aplati d'un cran, avec son libelle en intertitre — comme
        // la palette : un panneau volant DANS un panneau volant serait coupe.
        var t=document.createElement('div'); t.className='sz-titre'; t.textContent=it.label;
        pan.appendChild(t);
        it.sub.forEach(function(si){ pan.appendChild(entree(si)); });
        return;
      }
      pan.appendChild(entree(it));
    });
    document.body.appendChild(pan);
    panneaux[m.label]=pan;
  });

  // Bascule instantanee d'un menu a l'autre, et la fenetre epouse le contenu
  // REEL (jamais de barre de defilement).
  window.montrer = function(label){
    Object.keys(panneaux).forEach(function(k){
      panneaux[k].style.display = (k === label) ? 'block' : 'none';
    });
    var pan = panneaux[label];
    if (!pan) return;
    try {
      window.szPalette.taille(Math.ceil(pan.offsetWidth) + 2, Math.ceil(pan.offsetHeight) + 2);
    } catch(e){}
  };

  // Le survol tient le panneau ouvert — le quitter le referme, en differe court.
  document.addEventListener('mouseenter', function(){ try{ window.szPalette.survol(true); }catch(e){} });
  document.addEventListener('mouseleave', function(){ try{ window.szPalette.survol(false); }catch(e){} });
})();
</script></body></html>`;
}

module.exports = { pageDetachee, pagePanneau };
