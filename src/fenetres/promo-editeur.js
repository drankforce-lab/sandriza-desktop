'use strict';

/*
 * FENÊTRE « ÉDITEUR VISUEL » — le dernier écran d'administration qui vivait en web
 * =============================================================================
 * Le plan de travail d'un modèle promotionnel : l'aperçu, les poignées, la liste
 * des éléments et l'inspecteur. C'est le SEUL écran d'administration qui n'avait
 * pas d'équivalent natif, et c'est lui qui empêchait de retirer le panneau web.
 *
 * ⚠⚠ LE MODÈLE VOYAGE, LE RENDU RESTE — ET CE N'EST PAS UN COMPROMIS.
 * On a cru pendant des semaines que cet éditeur ne POUVAIT PAS être natif. La
 * raison écrite était juste : le rendu d'un objet promotionnel est un CANEVAS,
 * et seule la fenêtre principale a l'origine du site — donc le droit de relire
 * une image du stockage sans TEINDRE le canevas, ce qui interdirait ensuite
 * toDataURL, donc l'aperçu et l'impression. La conclusion, elle, était fausse :
 * ce n'est pas l'ÉDITEUR qui a besoin de l'origine, c'est le RENDU.
 *
 * Cette fenêtre ne peint donc RIEN. Elle reçoit :
 *   · le MODÈLE, une structure plate dont la géométrie est en POURCENTAGES ;
 *   · l'IMAGE déjà peinte par la fenêtre principale (promo:modeleLire).
 * Elle pose ses poignées PAR-DESSUS l'image, en calculant sur des nombres, et
 * renvoie le modèle modifié. L'impression et l'aperçu ne bougent pas d'un pouce.
 *
 * ⚠ POURQUOI LES POIGNÉES SONT DES BOÎTES HTML ET NON UN CANEVAS. Un canevas
 * pour dessiner huit rectangles ramènerait exactement le problème qu'on vient
 * d'éviter, et coûterait sa propre gestion du clic. Des div positionnées en
 * pourcentage se placent toutes seules quand la fenêtre change de taille — ce
 * que le plan de travail web devait recalculer à la main.
 *
 * ⚠ CE QUE CETTE PREMIÈRE VERSION NE FAIT PAS, ET LE DIT : ajouter ou supprimer
 * un élément, changer le fond, importer une image. Ces gestes restent dans le
 * Centre d'impression et l'écran web tant qu'ils ne sont pas portés. Un éditeur
 * qui prétend tout faire et échoue à la moitié est pire que celui qui annonce sa
 * portée : on découvre le trou après avoir fait le travail.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, il se refermerait.
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
.tete h1{font-size:1rem;margin:0;font-weight:650}
.tete .sous{font-size:.73rem;color:var(--tx2)}
.tete .fin{margin-left:auto;display:flex;gap:.5rem;align-items:center}
.zone{flex:1 1 auto;min-height:0;display:flex;gap:0}

/* ── LE PLAN DE TRAVAIL ────────────────────────────────────────────────────
   Le damier dit ce qui est TRANSPARENT : sans lui, un fond blanc et un fond
   absent se ressemblent, et l on imprime du vide en croyant imprimer du blanc. */
.plan{flex:1 1 auto;min-width:0;display:flex;align-items:center;justify-content:center;
  padding:1.2rem;overflow:auto;
  background:
    linear-gradient(45deg,var(--v04) 25%,transparent 25%,transparent 75%,var(--v04) 75%),
    linear-gradient(45deg,var(--v04) 25%,transparent 25%,transparent 75%,var(--v04) 75%);
  background-size:18px 18px;background-position:0 0,9px 9px}
/* ⚠ LE BLANC DE LA SCENE EST VOLONTAIRE, ET IL NE SUIT PAS LE THEME : c est le
   PAPIER. Une etiquette imprimee est blanche de jour comme de nuit, et teinter
   le plan de travail montrerait des couleurs qui ne sortiront jamais de
   l imprimante — on choisirait un texte lisible sur un fond qui n existe pas.
   Declare dans tools/contraste-jour-declare.js pour la meme raison. */
.scene{position:relative;box-shadow:0 8px 30px rgba(0,0,0,.45);
  outline:1px solid var(--v12);background:#fff}
.scene img{display:block;width:100%;height:100%;object-fit:fill;
  -webkit-user-drag:none;user-select:none}
.boite{position:absolute;border:1px dashed var(--v50);
  mix-blend-mode:difference;cursor:move}
.boite.sel{border:1.5px solid #7AA7FF;mix-blend-mode:normal;
  box-shadow:0 0 0 1px rgba(0,0,0,.35)}
.boite.cache{opacity:.35;border-style:dotted}
.boite.verr{cursor:not-allowed}
.poi{position:absolute;width:11px;height:11px;background:#7AA7FF;
  border:1px solid #0b1220;border-radius:2px}
.poi.br{right:-6px;bottom:-6px;cursor:nwse-resize}
.etiq{position:absolute;left:0;top:-19px;font-size:.62rem;white-space:nowrap;
  background:#7AA7FF;color:#0b1220;padding:0 .3rem;border-radius:3px;font-weight:700}

/* ── L INSPECTEUR ─────────────────────────────────────────────────────────── */
.insp{flex:0 0 320px;border-left:1px solid var(--v08);display:flex;flex-direction:column;
  background:var(--f-carte);min-height:0}
.insp .lst{flex:0 0 auto;max-height:34%;overflow-y:auto;border-bottom:1px solid var(--v08)}
.insp .prop{flex:1 1 auto;overflow-y:auto;padding:.7rem .8rem}
.el{display:flex;align-items:center;gap:.45rem;padding:.34rem .7rem;cursor:pointer;
  border-bottom:1px solid var(--v04);font-size:.79rem}
.el:hover{background:var(--v04)}
.el.sel{background:var(--v08);font-weight:650}
.el .k{font-size:.66rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.04em}
.el .n{flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* ⚠ PAS D OPACITE ICI. Ces deux marqueurs disent qu un element est MASQUE ou
   VERROUILLE — c est-a-dire pourquoi il ne bouge pas quand on le tire. Estompes
   a 0,6 ils tombaient a 4,21:1 sur le fond de jour, sous le seuil, et c est le
   banc AU RENDU qui l a mesure : le CSS seul ne pouvait pas le dire. Rendre
   discret ce qui explique une impossibilite, c est cacher la reponse a la
   question qu on se pose a cet instant. */
.el .oeil{color:var(--tx)}
.bloc{margin-bottom:.7rem}
.bloc>label{display:block;font-size:.68rem;color:var(--tx2);margin-bottom:.2rem;
  text-transform:uppercase;letter-spacing:.04em}
.bloc input[type=text],.bloc textarea,.bloc select{width:100%;padding:.34rem .45rem;
  background:var(--f-champ);color:var(--tx);border:1px solid var(--v12);border-radius:6px;
  font:inherit;font-size:.82rem}
.bloc textarea{min-height:56px;resize:vertical}
.rang{display:flex;gap:.4rem}
.rang>div{flex:1 1 0;min-width:0}
.rang input[type=number]{width:100%;padding:.3rem .4rem;background:var(--f-champ);
  color:var(--tx);border:1px solid var(--v12);border-radius:6px;font:inherit;font-size:.8rem}
.btn{padding:.34rem .7rem;border-radius:7px;border:1px solid var(--v12);
  background:var(--v04);color:var(--tx);font:inherit;font-size:.8rem;cursor:pointer}
.btn:hover{background:var(--v08)}
.btn.plein{background:#2f6f4f;border-color:#2f6f4f;color:#fff;font-weight:650}
.btn.plein[disabled]{opacity:.45;cursor:default}
.vide{padding:1.1rem;color:var(--tx2);font-size:.83rem;text-align:center}
.note{font-size:.71rem;color:var(--tx2);line-height:1.35;margin-top:.2rem}
.pied{flex:0 0 auto;padding:.42rem 1.05rem;border-top:1px solid var(--v08);
  font-size:.76rem;min-height:1.9rem;background:var(--f-carte)}

/* ── LA REPRISE DE JOUR ────────────────────────────────────────────────────
   ⚠ EN MODE JOUR LA FENETRE PASSE EN CLAIR, et une piece laissee sombre y
   reste sombre : le vert du bouton d enregistrement et le liset des poignees
   devenaient deux taches de nuit sur un ecran de jour. Le banc des fonds l a
   refuse, et il a eu raison — c est le genre de detail qu on ne voit jamais
   parce qu on developpe dans un seul des deux modes. */
html.jour .btn.plein{background:#1f5a3d;border-color:#1f5a3d;color:#fff}
html.jour .poi{background:#2f5fb5;border-color:#ffffff}
html.jour .etiq{background:#2f5fb5;color:#fff}
html.jour .boite.sel{border-color:#2f5fb5}
`;

function pagePromoEditeur(id) {
  const cible = String(id || '');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Éditeur visuel — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.promoprint}</span><h1 id="titre">Éditeur visuel</h1>
  <span class="sous" id="sous"></span>
  <span class="fin"><button class="btn" id="b-recharger" type="button">↻ Recharger</button>
  <button class="btn plein" id="b-enr" type="button" disabled>Enregistrer</button></span></div>
<div class="zone" id="corps">
  <div class="plan" id="plan"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div>
  <div class="insp"><div class="lst" id="lst"></div><div class="prop" id="prop"></div></div>
</div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var ID = '${cible}';
  var M = null;          // le modele, tel qu il voyage
  var SEL = '';          // id de l element choisi
  var SALE = false;      // des modifications non enregistrees
  var IMG = '';          // l apercu deja peint par la fenetre principale

  var plan = document.getElementById('plan');
  var lst = document.getElementById('lst');
  var prop = document.getElementById('prop');
  var bEnr = document.getElementById('b-enr');

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:     'Aucune session ouverte dans l application. Connectez-vous dans la fenetre principale.',
    droit:       'Votre compte n a pas le droit de modifier les objets promotionnels.',
    module_promo:'Le module d impression n est pas charge dans la fenetre principale.',
    introuvable: 'Ce modele n existe plus — il a peut-etre ete supprime ailleurs.',
    parametre:   'Demande incomplete.',
    trop_long:   'Le modele depasse la taille permise (8 Mo d elements).',
    pont_indisponible:'La fenetre principale ne repond pas.',
    echec:       'L operation a echoue.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 120)) + ')';
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  function els(){ return (M && Array.isArray(M.elements)) ? M.elements : []; }
  function selEl(){ var l = els(); for (var i = 0; i < l.length; i++) if (l[i].id === SEL) return l[i]; return null; }
  function nb(v, d){ var n = parseFloat(v); return isFinite(n) ? n : d; }
  /* Une geometrie hors du plan de travail ne se recupere pas a la souris : on
     borne a l enregistrement, pas a l affichage, pour ne pas deplacer sous les
     doigts un element qu on est en train de tirer. */
  function borner(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function salir(){ SALE = true; bEnr.disabled = false; }

  /* ══ LE PLAN DE TRAVAIL ═══════════════════════════════════════════════════
     ⚠ LA SCENE GARDE LES PROPORTIONS DU MODELE, et c est la seule mesure qui
     compte : les pourcentages du modele n ont de sens que sur une boite dont le
     rapport largeur/hauteur est celui de l objet imprime. Une scene carree pour
     une etiquette 2 x 1 po placerait chaque poignee a cote. */
  function dessinerPlan(){
    if (!M) return;
    var rap = (nb(M.h, 1) || 1) / (nb(M.w, 1) || 1);
    var dispoL = Math.max(160, plan.clientWidth - 40);
    var dispoH = Math.max(120, plan.clientHeight - 40);
    var L = dispoL, H = Math.round(L * rap);
    if (H > dispoH) { H = dispoH; L = Math.round(H / rap); }
    var h = '<div class="scene" id="scene" style="width:' + L + 'px;height:' + H + 'px">';
    if (IMG) h += '<img src="' + esc(IMG) + '" alt="Apercu du modele">';
    els().forEach(function(el){
      var cl = 'boite' + (el.id === SEL ? ' sel' : '') + (el.hidden ? ' cache' : '') + (el.locked ? ' verr' : '');
      h += '<div class="' + cl + '" data-el="' + esc(el.id) + '" style="left:' + nb(el.xPct, 0) + '%;top:'
        + nb(el.yPct, 0) + '%;width:' + nb(el.wPct, 10) + '%;height:' + nb(el.hPct, 10) + '%">';
      if (el.id === SEL) {
        h += '<span class="etiq">' + esc(el.name || el.kind || 'Element') + '</span>';
        if (!el.locked) h += '<span class="poi br" data-poi="br"></span>';
      }
      h += '</div>';
    });
    h += '</div>';
    plan.innerHTML = h;
  }

  function dessinerListe(){
    var l = els();
    if (!l.length) { lst.innerHTML = '<div class="vide">Ce modele n a aucun element.</div>'; return; }
    /* Le haut de la pile en premier : c est l ordre ou on le voit a l ecran. */
    var h = '';
    l.slice().reverse().forEach(function(el){
      h += '<div class="el' + (el.id === SEL ? ' sel' : '') + '" data-sel="' + esc(el.id) + '">'
        + '<span class="k">' + esc(el.kind === 'text' ? 'Txt' : (el.kind === 'image' ? 'Img' : 'Frm')) + '</span>'
        + '<span class="n">' + esc(el.name || el.text || 'Sans nom') + '</span>'
        + (el.hidden ? '<span class="oeil" title="Masque">◌</span>' : '')
        + (el.locked ? '<span class="oeil" title="Verrouille">⌧</span>' : '')
        + '</div>';
    });
    lst.innerHTML = h;
  }

  function champNum(cle, lbl, el, pas){
    return '<div><label style="font-size:.64rem;color:var(--tx2)">' + esc(lbl) + '</label>'
      + '<input type="number" data-num="' + cle + '" step="' + (pas || 1) + '" value="'
      + (Math.round(nb(el[cle], 0) * 10) / 10) + '"></div>';
  }

  function dessinerProp(){
    var el = selEl();
    if (!el) {
      prop.innerHTML = '<div class="vide">Choisissez un element dans la liste ou sur le plan.'
        + '<div class="note" style="margin-top:.6rem">Cet editeur modifie les elements existants :'
        + ' texte, position, taille, rotation, opacite. Ajouter ou supprimer un element,'
        + ' changer le fond et importer une image restent dans le Centre d impression.</div></div>';
      return;
    }
    var h = '';
    h += '<div class="bloc"><label>Nom</label><input type="text" data-txt="name" value="' + esc(el.name || '') + '"></div>';
    if (el.kind === 'text') {
      h += '<div class="bloc"><label>Texte</label><textarea data-txt="text">' + esc(el.text || '') + '</textarea></div>';
      h += '<div class="bloc"><label>Taille (% de la hauteur)</label><div class="rang">'
        + champNum('fontPct', 'Corps', el, .5) + champNum('weight', 'Graisse', el, 100) + '</div></div>';
      h += '<div class="bloc"><label>Couleur</label><input type="text" data-txt="color" value="' + esc(el.color || '') + '">'
        + '<div class="note">Notation CSS : #111827, rgb(...), ou un nom.</div></div>';
      h += '<div class="bloc"><label>Alignement</label><select data-sel-champ="align">'
        + ['left', 'center', 'right'].map(function(v){
            return '<option value="' + v + '"' + (el.align === v ? ' selected' : '') + '>'
              + (v === 'left' ? 'Gauche' : (v === 'center' ? 'Centre' : 'Droite')) + '</option>'; }).join('')
        + '</select></div>';
    }
    h += '<div class="bloc"><label>Position et taille (% du modele)</label><div class="rang">'
      + champNum('xPct', 'X', el, .5) + champNum('yPct', 'Y', el, .5) + '</div>'
      + '<div class="rang" style="margin-top:.3rem">'
      + champNum('wPct', 'Largeur', el, .5) + champNum('hPct', 'Hauteur', el, .5) + '</div></div>';
    h += '<div class="bloc"><div class="rang">'
      + champNum('rot', 'Rotation', el, 1) + champNum('opacity', 'Opacite', el, 5) + '</div></div>';
    h += '<div class="bloc"><label>Etat</label>'
      + '<button class="btn" type="button" data-bascule="hidden">' + (el.hidden ? 'Afficher' : 'Masquer') + '</button> '
      + '<button class="btn" type="button" data-bascule="locked">' + (el.locked ? 'Deverrouiller' : 'Verrouiller') + '</button>'
      + '<div class="note">Un element verrouille ne se deplace plus a la souris — il reste modifiable ici.</div></div>';
    prop.innerHTML = h;
  }

  function dessiner(){ dessinerPlan(); dessinerListe(); dessinerProp(); }

  /* ══ CHARGEMENT ══════════════════════════════════════════════════════════ */
  function charger(){
    dire('Lecture du modele...');
    appeler('promo:modeleLire', [ID, 520]).then(function(r){
      if (!r.ok) {
        plan.innerHTML = '<div class="vide"><strong>Modele non ouvert</strong><div style="margin-top:.4rem">'
          + esc(expliquer(r)) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      M = r.modele || null;
      IMG = r.image || '';
      SEL = '';
      SALE = false; bEnr.disabled = true;
      document.getElementById('titre').textContent = (M && M.name) || 'Editeur visuel';
      document.getElementById('sous').textContent = M ? (M.w + ' x ' + M.h + ' po - ' + els().length + ' element(s)') : '';
      /* ⚠ UN APERCU QUI N A PAS PU SE PEINDRE SE DIT. Sans ca, on editerait des
         poignees sur un fond vide en croyant que le modele est vide. */
      if (!r.rendable) dire('L apercu n a pas pu etre peint' + (r.detail ? ' : ' + r.detail : '') + '. Les poignees restent utilisables.', 'att');
      else dire('Modele ouvert.', 'bon');
      dessiner();
    });
  }

  /* ══ ENREGISTREMENT ══════════════════════════════════════════════════════
     ⚠ ON RELIT APRES AVOIR ECRIT, et ce n est pas de la prudence de principe :
     l ecriture FUSIONNE cote site (elle ne remplace pas), et l apercu est repeint
     la-bas. Garder l ancienne image apres un enregistrement montrerait un modele
     qui n existe plus — le pire des deux, puisqu il ressemble au bon. */
  function enregistrer(){
    if (!M || !SALE) return;
    bEnr.disabled = true;
    dire('Enregistrement...');
    els().forEach(function(el){
      el.xPct = borner(nb(el.xPct, 0), -50, 150);
      el.yPct = borner(nb(el.yPct, 0), -50, 150);
      el.wPct = borner(nb(el.wPct, 10), 1, 200);
      el.hPct = borner(nb(el.hPct, 10), 1, 200);
      el.opacity = borner(nb(el.opacity, 100), 0, 100);
    });
    appeler('promo:modeleEcrire', [ID, M]).then(function(r){
      if (!r.ok) { bEnr.disabled = false; dire(expliquer(r), 'err'); return; }
      SALE = false;
      dire('Enregistre — ' + r.elements + ' element(s).', 'bon');
      var garde = SEL;
      charger();
      setTimeout(function(){ SEL = garde; dessiner(); }, 0);
    });
  }

  /* ══ LA SOURIS SUR LE PLAN ════════════════════════════════════════════════
     ⚠ LE DEPLACEMENT SE CALCULE EN POURCENTAGES DE LA SCENE, jamais en pixels
     gardes de cote : la fenetre peut changer de taille pendant un glissement
     (un ecran partage, un redimensionnement), et des pixels memorises feraient
     sauter l element. On relit donc la scene a chaque mouvement. */
  var GLISSE = null;
  plan.addEventListener('pointerdown', function(ev){
    var poi = ev.target.closest('.poi');
    var boite = ev.target.closest('.boite');
    if (!boite) return;
    var id = boite.getAttribute('data-el');
    var el = null, l = els();
    for (var i = 0; i < l.length; i++) if (l[i].id === id) el = l[i];
    if (!el) return;
    if (SEL !== id) { SEL = id; dessiner(); }
    if (el.locked) { dire('Element verrouille — deverrouillez-le pour le deplacer.', 'att'); return; }
    var scene = document.getElementById('scene');
    if (!scene) return;
    GLISSE = { id: id, mode: poi ? 'taille' : 'place', x0: ev.clientX, y0: ev.clientY,
      xPct: nb(el.xPct, 0), yPct: nb(el.yPct, 0), wPct: nb(el.wPct, 10), hPct: nb(el.hPct, 10) };
    try { plan.setPointerCapture(ev.pointerId); } catch (e) {}
    ev.preventDefault();
  });
  plan.addEventListener('pointermove', function(ev){
    if (!GLISSE) return;
    var scene = document.getElementById('scene');
    if (!scene) return;
    var r = scene.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var dx = (ev.clientX - GLISSE.x0) / r.width * 100;
    var dy = (ev.clientY - GLISSE.y0) / r.height * 100;
    var el = null, l = els();
    for (var i = 0; i < l.length; i++) if (l[i].id === GLISSE.id) el = l[i];
    if (!el) return;
    if (GLISSE.mode === 'place') {
      el.xPct = Math.round((GLISSE.xPct + dx) * 10) / 10;
      el.yPct = Math.round((GLISSE.yPct + dy) * 10) / 10;
    } else {
      el.wPct = Math.round(Math.max(1, GLISSE.wPct + dx) * 10) / 10;
      el.hPct = Math.round(Math.max(1, GLISSE.hPct + dy) * 10) / 10;
    }
    salir();
    dessinerPlan();
    dessinerProp();
  });
  function finGlisse(){ if (GLISSE) { GLISSE = null; dire('Modifie — pensez a enregistrer.', 'att'); } }
  plan.addEventListener('pointerup', finGlisse);
  plan.addEventListener('pointercancel', finGlisse);

  /* ══ LA LISTE ET L INSPECTEUR ════════════════════════════════════════════ */
  lst.addEventListener('click', function(ev){
    var t = ev.target.closest('[data-sel]');
    if (!t) return;
    SEL = t.getAttribute('data-sel');
    dessiner();
  });
  prop.addEventListener('input', function(ev){
    var el = selEl();
    if (!el) return;
    var t = ev.target;
    if (t.hasAttribute('data-num')) { el[t.getAttribute('data-num')] = nb(t.value, 0); salir(); dessinerPlan(); return; }
    if (t.hasAttribute('data-txt')) { el[t.getAttribute('data-txt')] = t.value; salir(); dessinerListe(); return; }
  });
  prop.addEventListener('change', function(ev){
    var el = selEl();
    if (!el) return;
    var t = ev.target;
    if (t.hasAttribute('data-sel-champ')) { el[t.getAttribute('data-sel-champ')] = t.value; salir(); return; }
  });
  prop.addEventListener('click', function(ev){
    var b = ev.target.closest('[data-bascule]');
    if (!b) return;
    var el = selEl();
    if (!el) return;
    var cle = b.getAttribute('data-bascule');
    el[cle] = !el[cle];
    salir();
    dessiner();
  });

  document.getElementById('b-enr').addEventListener('click', enregistrer);
  document.getElementById('b-recharger').addEventListener('click', function(){
    /* ⚠ RECHARGER JETTE CE QUI N EST PAS ENREGISTRE : on le demande avant, une
       seule fois. Un bouton qui efface sans prevenir est une porte piegee. */
    if (SALE && !window.confirm('Des modifications ne sont pas enregistrees. Les abandonner ?')) return;
    charger();
  });

  /* ⚠ LA SCENE SE REFAIT AU REDIMENSIONNEMENT : ses pixels dependent de la
     fenetre, et une scene figee laisserait les poignees a cote de l image. */
  window.addEventListener('resize', function(){ if (M) dessinerPlan(); });

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (SALE) { dire('Modifications non enregistrees — Enregistrer, ou Recharger pour abandonner.', 'att'); return; }
      P.fermer();
    }
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 's' || ev.key === 'S')) { ev.preventDefault(); enregistrer(); }
  });

  /* ⚠ LA FERMETURE PAR LA CROIX NE PASSE PAS PAR Escape. Sans ce garde, tout le
     travail non enregistre part sans un mot. */
  window.addEventListener('beforeunload', function(ev){
    if (!SALE) return;
    ev.preventDefault();
    ev.returnValue = '';
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pagePromoEditeur };
