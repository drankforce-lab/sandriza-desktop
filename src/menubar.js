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

  var marque=document.createElement('div'); marque.className='sz-marque';
  marque.innerHTML='<div class="sz-pastille">S</div><span class="sz-nom">Sandriza</span>';
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

module.exports = { pageDetachee };
