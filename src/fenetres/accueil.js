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

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_JOUR, ICO, TETE } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('accueil');

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
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow:hidden}
/* Aucune glissiere (2026-10-12) : la liste des blocs se pagine dans la hauteur
   qui reste (data-pages, JS_PAGES du socle). */
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:1rem 1.1rem;margin:0 0 1rem}
.carte.edit{border-color:var(--or)}
.stitre{font-size:.9rem;font-weight:700;color:var(--tx-bleute);margin:0 0 .2rem}
.sdesc{font-size:.76rem;color:var(--tx2);margin:0 0 .8rem}
.bloc{display:flex;align-items:center;gap:.7rem;padding:.6rem .7rem;background:var(--f-champ);border:1px solid var(--v12);border-radius:9px;margin:0 0 .5rem}
/* ⚠ DES PICTOGRAMMES DU SOCLE, PLUS LES EMOJIS DU SITE (2026-10-01). Passes au
   gris puis eclaircis, 🖼️ 🗂️ 📢 devenaient des TACHES BLANCHES (le piege du
   « carre blanc » de la refonte fine). Au trait, ils suivent la couleur du
   texte, de nuit comme de jour. */
.bloc .em{flex:0 0 auto;width:1.6rem;display:flex;align-items:center;justify-content:center;color:var(--tx2)}
.bloc .em svg{width:20px;height:20px}
.bloc .nom{flex:1;min-width:0}
.bloc .nom b{font-size:.88rem}
.bloc .nom .d{font-size:.73rem;color:var(--tx2)}
/* ⚠ « (masqué) » EST UNE INFORMATION, pas un ornement : c'est ce qui distingue
   une bannière éteinte d'une bannière vivante. --tx-jaune sortait à 4.38 sur
   blanc — juste sous le seuil, donc juste illisible pour qui lit mal. --tx-att
   dit la même chose en un ton plus soutenu. */
.bloc .masq{font-size:.6875rem;color:var(--tx-att);margin-left:.35rem;font-weight:600}
/* ⚠ UN BLOC ÉTEINT SE LIT ENCORE. À .5, le nom de la bannière et sa description
   tombaient sous 2.6 de contraste : on ne pouvait plus savoir LAQUELLE est
   éteinte, ce qui est pourtant la seule raison de regarder cette liste. */
.bloc.off{opacity:.9}
.bloc .actes{display:flex;gap:.3rem;flex-shrink:0}
/* GLISSER POUR RÉORGANISER (2026-10-27, sa demande) : la poignée à gauche ; les flèches restent pour le clavier. */
.bloc[draggable=true]{cursor:grab}
.bloc .poig{flex:0 0 auto;color:var(--tx3);font-size:.9rem;letter-spacing:-.12em;user-select:none;cursor:grab}
.bloc.tire{opacity:.45}
.bloc.cible-av{box-shadow:inset 0 3px 0 var(--or)}
.bloc.cible-ap{box-shadow:inset 0 -3px 0 var(--or)}
/* L APERÇU (2026-10-27, sa demande) : la page d accueil en réduction, dans l ordre des blocs. Un schéma fidèle à
   l ordre et aux textes, pas une copie au pixel : le vrai rendu reste celui de la boutique. */
.acc2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:1rem;height:100%}
.acc2>.carte{margin:0;min-height:0;overflow:hidden;display:flex;flex-direction:column}
.ap{flex:1 1 auto;min-height:0;overflow:hidden;border:1px solid var(--v12);border-radius:9px;background:#fbf8f2;color:#2b2420;
  display:flex;flex-direction:column;font-family:Georgia,serif}
.ap .ap-tete{flex:0 0 auto;display:flex;align-items:center;gap:.8rem;padding:.4rem .7rem;border-bottom:1px solid #e6ddd0;font-size:.62rem;color:#5c5047}
.ap .ap-tete b{font-size:.78rem;letter-spacing:.18em;color:#1f1a16;margin-right:auto}
.ap .ap-b{flex:0 0 auto;position:relative}
.ap .ap-b.off{display:none}
.ap .ap-hero{height:9.5rem;background-size:cover;background-position:center;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff;gap:.15rem;padding:0 1rem}
.ap .ap-hero .v{position:absolute;inset:0}
.ap .ap-hero>*:not(.v){position:relative}
.ap .ap-hero small{font-size:.56rem;letter-spacing:.16em;text-transform:uppercase}
.ap .ap-hero strong{font-size:1.05rem;font-weight:400;line-height:1.15}
.ap .ap-hero span.s{font-size:.6rem;max-width:80%}
.ap .ap-hero .btns{display:flex;gap:.35rem;margin-top:.3rem}
.ap .ap-hero .btns i{font-style:normal;font-size:.55rem;padding:.18rem .55rem;border:1px solid #fff;border-radius:3px}
.ap .ap-hero .btns i:first-child{background:#fff;color:#1f1a16}
.ap .ap-sec{padding:.7rem .8rem;text-align:center}
.ap .ap-sec small{display:block;font-size:.52rem;letter-spacing:.16em;text-transform:uppercase;color:#6e5432}
.ap .ap-sec strong{display:block;font-size:.85rem;font-weight:400;margin:.1rem 0 .45rem}
.ap .ap-grille{display:grid;grid-template-columns:repeat(4,1fr);gap:.35rem}
.ap .ap-grille i{height:2.6rem;border-radius:3px;background:linear-gradient(160deg,#e9e0d3,#d9ccb9)}
.ap .ap-ban{background:#efe6d8;padding:.65rem .8rem;text-align:center}
.ap .ap-ban strong{display:block;font-size:.8rem;font-weight:400}
.ap .ap-ban span{display:block;font-size:.58rem;color:#4f453d;margin:.1rem 0 .3rem}
.ap .ap-ban i{font-style:normal;font-size:.55rem;padding:.16rem .55rem;border-radius:3px;background:#1f1a16;color:#fff}
.ap .ap-pied{margin-top:auto;flex:0 0 auto;padding:.45rem .7rem;border-top:1px solid #e6ddd0;font-size:.55rem;color:#5c5047;text-align:center}
.ap-note{font-size:.72rem;color:var(--tx2);margin:.45rem 0 0}
.gr2{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.gr4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:.5rem}
@media(max-width:720px){.gr2,.gr4{grid-template-columns:1fr 1fr}}
.ch{margin:0 0 .6rem}.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.22rem;font-size:.74rem;color:var(--tx2)}
.ch input,.ch select,.ch textarea{width:100%;font:inherit;font-size:.83rem;color:var(--tx);background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;padding:.4rem .5rem}
.ch textarea{resize:vertical;min-height:2.6rem}
.ch input:focus,.ch select:focus,.ch textarea:focus{outline:none;border-color:var(--or)}
.ch input:disabled,.ch select:disabled,.ch textarea:disabled{opacity:.55}
.diapo{background:var(--f-champ);border:1px solid var(--v12);border-radius:10px;padding:.7rem .8rem;margin:0 0 .7rem}
.diapo .tete2{display:flex;align-items:center;gap:.5rem;margin:0 0 .5rem}
.diapo .apercu{width:3.4rem;height:2.1rem;border-radius:5px;flex-shrink:0;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.diapo .apercu .t{position:relative;color:var(--tx-blanc);font-size:.6875rem;text-shadow:0 1px 2px rgba(0,0,0,.7);padding:0 .2rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.diapo .tete2 .nm{flex:1;font-size:.82rem;font-weight:600}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button.b{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.34rem .6rem;cursor:pointer;font-size:.78rem}
button.b:hover:not(:disabled){background:var(--v10)}
button.b:disabled{opacity:.4;cursor:default}
button.b.dgr{color:var(--tx-err2);border-color:rgba(248,113,113,.4)}
button.prim{font:inherit;background:var(--or);border:1px solid var(--or);color:#1a1208;font-weight:700;border-radius:8px;padding:.42rem .9rem;cursor:pointer;font-size:.82rem}
button.prim:hover:not(:disabled){background:var(--or-clair)}
button.prim:disabled{opacity:.5;cursor:default}
.vide{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.mini:hover:not(:disabled){background:var(--v10)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}

.diapos-choix{display:flex;gap:.35rem;flex-wrap:wrap;margin:0 0 .6rem}
/* Les pastilles des diapos : UNE rangee, les autres en pages (2026-10-12) — sans
   borne, chaque diapo ajoutee repoussait le formulaire sous le pied. */
.diapos-choix[data-pages]{max-height:2.2rem;align-content:flex-start}
.diapos-choix button{font:inherit;font-size:.78rem;font-weight:600;padding:.32rem .75rem;border-radius:99px;
  border:1px solid var(--v12);background:var(--v05);color:var(--tx2);cursor:pointer}
.diapos-choix button.on{background:var(--or);border-color:var(--or);color:#17202c}
`;

function pageAccueil(ouverture) {
  return `${TETE()}
<title>${T("Page d’accueil — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.homepage}</span><h1>${T("Page d’accueil")}</h1>
  <span class="droite"><button class="mini" id="b-reinit" hidden>${T("Réinitialiser")}</button></span></div>
<div class="ro" id="ro" hidden>${T("Lecture seule : vous pouvez consulter, pas modifier.")}</div>
<div class="corps"><div id="corps"><div class="sz-squel tuiles" role="status" aria-label="${T("Chargement du tableau de bord")}"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="sz-squel"><i></i><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  var ICOB = ${JSON.stringify({ hero: ICO.image, categories: ICO.collections, collections: ICO.collections,
    featured: ICO.star, banner: ICO.shipping, _: ICO.homepage })};
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; b.style.marginLeft='.4rem'; document.querySelector('.tete .droite').appendChild(b); }
    if (actif) { b.textContent='${T("⧉ Détacher")}'; b.title='${T("Ouvrir cet écran dans sa propre fenêtre")}'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='${T("⚓ Ancrer")}'; b.title='${T("Ramener cet écran dans la fenêtre principale")}'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE()}${JS_DIRE()}${JS_BROUILLON()}
  var corps = document.getElementById('corps');
  var breinit = document.getElementById('b-reinit');
  var D = null, RO = false, OCCUPE = false;
  var BLOCS = [], GRADS = [];
  // Ouverture directe sur l'éditeur d'un bloc (banc d'essai ; vide en prod).
  var OUVERTURE = ${JSON.stringify(String(ouverture || ''))};
  var EDIT = null;      // id du bloc en cours d'édition (ou null)
  var SLIDES = [];      // diapos héro en cours d'édition

  /* ⚠⚠⚠ CE QUI EST ECRIT DANS LA PAGE D ACCUEIL DE LA BOUTIQUE, PAS DANS
     L INTERFACE. Ces deux textes sont les valeurs PAR DEFAUT d une diapo neuve :
     des qu on enregistre, ils partent dans la configuration et la CLIENTE les
     lit sur la page d accueil. Les traduire ecrirait « New slide » et
     « Discover » dans une boutique francaise — la faute la plus silencieuse du
     lot, parce qu elle ne se decouvre qu en relisant la base.
     ⚠ Mesure du 2026-09-13 : le poseur avait deja enveloppe << Nouvelle diapo >>
     avant cette declaration. Le nom SZ_DONNEES est reconnu par trois outils — le
     compteur et le banc du residuel les ecartent, le poseur en fait une zone
     interdite, et banc-langue-donnees REFUSE qu un de ces textes ait une entree
     de dictionnaire. Voir la fiche de tools/textes-visibles.js. */
  var SZ_DONNEES = {
    diapoTitre: 'Nouvelle diapo',
    diapoBouton: 'Découvrir'
  };
  var CONF_REINIT = false;

  var EFFETS = [['fade','${T("Fondu (Fade)")}'],['slide','${T("Glissement (Slide)")}'],['zoom','${T("Zoom (Ken Burns)")}']];

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function val(id){ var e=document.getElementById(id); return e ? String(e.value) : ''; }
  function chk(id){ var e=document.getElementById(id); return !!(e && e.checked); }

  var MOTIFS = {
    session:'${T("Aucune session ouverte. Connectez-vous dans la fenêtre principale.")}',
    droit:'${T("Votre rôle ne donne pas accès à la configuration.")}',
    lecture_seule:'${T("Votre rôle est en lecture seule.")}',
    indisponible:'${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:'${T("La fenêtre principale ne répond pas.")}',
    delai:'${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue:'${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:'${T("L’opération a échoué.")}',
  };
  // (2026-10-25, audit) Texte BRUT : szDire / ferr l ecrivent en textContent (echappe, « & » s y lisait « &amp; »).
  // Ce qui part dans du HTML est echappe a l endroit ou on l y met.
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('${T("Erreur inattendue (")}'+(m||'?')+').'))+(r&&r.detail?' ('+r.detail+')':''); }
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
  /* (2026-10-25, audit) LE CHANGEMENT SE FAIT SUR UNE COPIE. BLOCS (et b.content) etait modifie AVANT
     l ecriture et jamais restaure sur un echec : l ecran montrait l ancien etat, mais la prochaine ecriture
     (un simple clic sur l oeil ou une fleche) publiait en boutique le contenu abandonne. modif(copie)
     applique le geste a une copie ; seule la reponse du site (adopter) remplace BLOCS. */
  function ecrire(modif, apres){
    var copie = JSON.parse(JSON.stringify(BLOCS));
    if (modif) modif(copie);
    occuper(true); dire('${T("Enregistrement…")}');
    appeler('config:accueil:ecrire', [copie]).then(function(r){
      occuper(false);
      if (r && r.ok) { adopter(r); if (apres) apres(); dessiner(); dire('${T("Page d’accueil enregistrée.")}', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }

  // ── LISTE DES BLOCS ───────────────────────────────────────────────────────
  function listeHtml(){
    var h = '<div class="carte sz-pagee"><div class="stitre">${T("Ordre et visibilité")}</div>'
      + '<div class="sdesc">${T("Glissez un bloc (ou ↑ ↓) pour réorganiser · l’œil masque un bloc sans le supprimer · le crayon modifie le contenu.")}</div>';
    // Les blocs en PAGES mesurees, jamais de glissiere (JS_PAGES du socle, 2026-10-12).
    h += '<div data-pages="accueil-blocs">';
    BLOCS.forEach(function(b, i){
      h += '<div class="bloc' + (b.visible ? '' : ' off') + '"' + (RO ? '' : ' draggable="true" data-glisse="' + esc(b.id) + '"') + '>'
        + (RO ? '' : '<span class="poig" aria-hidden="true" title="${T("Glisser pour déplacer")}">⋮⋮</span>')
        + '<span class="em" aria-hidden="true">' + (ICOB[b.id] || ICOB._) + '</span>'
        + '<div class="nom"><b>' + esc(szTd(b.label)) + '</b>' + (b.visible ? '' : '<span class="masq">${T("(masqué)")}</span>')
        + '<div class="d">' + esc(szTd(b.desc)) + '</div></div>'
        + '<div class="actes">'
        + '<button class="b" type="button" data-ed="' + esc(b.id) + '" title="${T("Modifier")}"><span class="ic">✎</span></button>'
        + (RO ? '' : '<button class="b" type="button" data-vis="' + esc(b.id) + '" title="' + (b.visible ? '${T("Masquer")}' : '${T("Afficher")}') + '">' + (b.visible ? '<span class="ic">👁</span>' : '<span class="ic">🚫</span>') + '</button>'
          + '<button class="b" type="button" data-up="' + esc(b.id) + '"' + (i===0?' disabled':'') + '>↑</button>'
          + '<button class="b" type="button" data-down="' + esc(b.id) + '"' + (i===BLOCS.length-1?' disabled':'') + '>↓</button>')
        + '</div></div>';
    });
    h += '</div></div>';
    return '<div class="acc2">' + h + apercuHtml() + '</div>';
  }

  /* ── L APERÇU (2026-10-27) ── la page en réduction, bloc par bloc, dans l ordre de la liste ; un bloc masqué
     n y paraît pas (c est ce que verra la cliente). Le héro montre SA PREMIÈRE diapo. */
  function apercuHtml(){
    var corpsAp = BLOCS.map(function(b){
      var c = b.content || {}, off = b.visible ? '' : ' off';
      if (b.id === 'hero') {
        var s = (c.slides || [])[0] || {};
        return '<div class="ap-b ap-hero' + off + '" style="' + swatch(s) + '"><span class="v" style="background:rgba(0,0,0,' + (s.overlay != null ? s.overlay : 0.4) + ')"></span>'
          + (s.eyebrow ? '<small>' + esc(s.eyebrow) + '</small>' : '') + '<strong>' + esc(s.title || '') + '</strong>'
          + (s.subtitle ? '<span class="s">' + esc(s.subtitle) + '</span>' : '')
          + ((s.cta1Text || s.cta2Text) ? '<span class="btns">' + (s.cta1Text ? '<i>' + esc(s.cta1Text) + '</i>' : '') + (s.cta2Text ? '<i>' + esc(s.cta2Text) + '</i>' : '') + '</span>' : '')
          + '</div>';
      }
      if (b.id === 'banner') {
        return '<div class="ap-b ap-ban' + off + '">' + (c.eyebrow ? '<span>' + esc(c.eyebrow) + '</span>' : '') + '<strong>' + esc(c.title || '') + '</strong>'
          + (c.subtitle ? '<span>' + esc(c.subtitle) + '</span>' : '') + (c.ctaText ? '<i>' + esc(c.ctaText) + '</i>' : '') + '</div>';
      }
      return '<div class="ap-b ap-sec' + off + '">' + (c.eyebrow ? '<small>' + esc(c.eyebrow) + '</small>' : '') + '<strong>' + esc(c.title || szTd(b.label)) + '</strong>'
        + (b.id === 'categories' ? '<div class="ap-grille"><i></i><i></i><i></i><i></i></div>' : '') + '</div>';
    }).join('');
    return '<div class="carte"><div class="stitre">${T("Aperçu")}</div>'
      + '<div class="ap" aria-label="${T("Aperçu de la page d’accueil")}"><div class="ap-tete"><b>SANDRIZA</b><span>${T("Vêtements")}</span><span>${T("Nouveautés")}</span><span>${T("Soldes")}</span></div>'
      + corpsAp + '<div class="ap-pied">${T("Pied de page de la boutique")}</div></div>'
      + '<div class="ap-note">${T("Un schéma de la page, dans l’ordre des blocs : les blocs masqués n’y paraissent pas.")}</div></div>';
  }

  // ── ÉDITEUR ─────────────────────────────────────────────────────────────────
  /* ⚠ LE for= EST CALCULE, ET C EST SAIN ICI : l identifiant et le libelle
     arrivent dans LA MEME aide, donc les deux cotes portent la MEME expression
     et ne peuvent pas divergrer. Le controle des etiquettes ecarte les
     identifiants calcules (il ne peut pas les verifier en lisant le texte) —
     il ne les REFUSE pas. Ce qu il refuse, c est un for= LITTERAL pose face a un
     id calcule, et c est pour ca que photos.js recoit un nom au lieu d un for=. */
  function chTexte(id, label, v, ph){ return '<div class="ch"><label for="' + id + '">' + esc(label) + '</label><input id="' + id + '" value="' + esc(v||'') + '" placeholder="' + esc(ph||'') + '"' + (RO?' disabled':'') + '></div>'; }
  function chAire(id, label, v, ph){ return '<div class="ch"><label for="' + id + '">' + esc(label) + '</label><textarea id="' + id + '" rows="2" placeholder="' + esc(ph||'') + '"' + (RO?' disabled':'') + '>' + esc(v||'') + '</textarea></div>'; }

  function diapoHtml(s, i){
    var opts = GRADS.map(function(g, gi){ return '<option value="' + gi + '"' + ((s.gradient||gradVal(0))===g.value?' selected':'') + '>' + esc(szTd(g.label)) + '</option>'; }).join('');
    return '<div class="diapo"><div class="tete2">'
      + '<div class="apercu" style="' + swatch(s) + '"><span style="position:absolute;inset:0;background:rgba(0,0,0,' + (s.overlay!=null?s.overlay:0) + ')"></span><span class="t">' + esc(s.title||('${T("Diapo ")}'+(i+1))) + '</span></div>'
      + '<span class="nm">${T("Diapo ")}' + (i+1) + '</span>'
      + (RO ? '' : '<button class="b" type="button" data-sup="' + i + '"' + (i===0?' disabled':'') + '>↑</button>'
        + '<button class="b" type="button" data-sdn="' + i + '"' + (i===SLIDES.length-1?' disabled':'') + '>↓</button>'
        + '<button class="b dgr" type="button" data-sdel="' + i + '" title="${T("Supprimer")}" aria-label="${T("Supprimer")}"><span class="ic">🗑</span></button>')
      + '</div>'
      + '<div class="gr2">'
      + '<div class="ch"><label>${T("Image URL (vide = dégradé)")}</label><input aria-label="${T("Image URL (vide = dégradé)")}" data-sf="image" data-si="' + i + '" value="' + esc(s.image||'') + '" placeholder="https://…"' + (RO?' disabled':'') + '></div>'
      + '<div class="ch"><label>${T("Dégradé de fond")}</label><select aria-label="${T("Dégradé de fond")}" data-sf="grad" data-si="' + i + '"' + (RO?' disabled':'') + '>' + opts + '</select></div>'
      + '</div>'
      + '<div class="ch"><label>${T("Opacité du voile noir (0 = aucun, 0.7 = sombre)")}</label><input aria-label="${T("Opacité du voile noir (0 = aucun, 0.7 = sombre)")}" type="number" min="0" max="1" step="0.05" data-sf="overlay" data-si="' + i + '" value="' + (s.overlay!=null?s.overlay:0.4) + '"' + (RO?' disabled':'') + '></div>'
      + '<div class="gr2">'
      + '<div class="ch"><label>${T("Texte chapeau")}</label><input aria-label="${T("Texte chapeau")}" data-sf="eyebrow" data-si="' + i + '" value="' + esc(s.eyebrow||'') + '"' + (RO?' disabled':'') + '></div>'
      + '<div class="ch"><label>${T("Titre principal")}</label><input aria-label="${T("Titre principal")}" data-sf="title" data-si="' + i + '" value="' + esc(s.title||'') + '"' + (RO?' disabled':'') + '></div>'
      + '</div>'
      + '<div class="ch"><label>${T("Sous-titre")}</label><textarea aria-label="${T("Sous-titre")}" data-sf="subtitle" data-si="' + i + '" rows="2"' + (RO?' disabled':'') + '>' + esc(s.subtitle||'') + '</textarea></div>'
      + '<div class="gr4">'
      + '<div class="ch"><label>${T("Bouton 1 — Texte")}</label><input aria-label="${T("Bouton 1 — Texte")}" data-sf="cta1Text" data-si="' + i + '" value="' + esc(s.cta1Text||'') + '"' + (RO?' disabled':'') + '></div>'
      + '<div class="ch"><label>${T("Bouton 1 — Lien")}</label><input aria-label="${T("Bouton 1 — Lien")}" data-sf="cta1Href" data-si="' + i + '" value="' + esc(s.cta1Href||'') + '"' + (RO?' disabled':'') + '></div>'
      + '<div class="ch"><label>${T("Bouton 2 — Texte (opt.)")}</label><input aria-label="${T("Bouton 2 — Texte (opt.)")}" data-sf="cta2Text" data-si="' + i + '" value="' + esc(s.cta2Text||'') + '"' + (RO?' disabled':'') + '></div>'
      + '<div class="ch"><label>${T("Bouton 2 — Lien")}</label><input aria-label="${T("Bouton 2 — Lien")}" data-sf="cta2Href" data-si="' + i + '" value="' + esc(s.cta2Href||'') + '"' + (RO?' disabled':'') + '></div>'
      + '</div></div>';
  }
  /* ⚠ UNE DIAPO A LA FOIS (sa demande : aucune barre de defilement). Toutes les
     diapos empilees, chacune avec son formulaire complet, depassaient la fenetre
     des la deuxieme. Une rangee de pastilles choisit celle qu on edite ; les
     autres restent dans SLIDES (lireDiapos ne relit que ce qui est a l ecran). */
  var SEL = 0;
  function slidesListHtml(){
    if (!SLIDES.length) return '<div class="vide">${T("Aucune diapo.")}</div>';
    if (SEL >= SLIDES.length) SEL = SLIDES.length - 1;
    if (SEL < 0) SEL = 0;
    var chips = '<div class="diapos-choix" data-pages="accueil-diapos">' + SLIDES.map(function(d, i){
      return '<button type="button" data-sch="' + i + '" class="' + (i === SEL ? 'on' : '') + '">${T("Diapo ")}' + (i + 1)
        + (d.title ? ' · ' + esc(String(d.title).slice(0, 22)) : '') + '</button>'; }).join('') + '</div>';
    return chips + diapoHtml(SLIDES[SEL], SEL);
  }

  function editeurHtml(){
    var b = BLOCS.filter(function(x){ return x.id === EDIT; })[0]; if (!b) { EDIT=null; return listeHtml(); }
    var c = b.content || {};
    var h = '<div class="carte edit"><div class="stitre">${T("Modifier : ")}' + esc(szTd(b.label)) + '</div>';
    if (b.id === 'hero') {
      h += '<div class="gr2">'
        + '<div class="ch"><label for="a-effect">${T("Effet de transition")}</label><select id="a-effect"' + (RO?' disabled':'') + '>'
        + EFFETS.map(function(e){ return '<option value="' + e[0] + '"' + ((c.sliderEffect||'fade')===e[0]?' selected':'') + '>' + esc(e[1]) + '</option>'; }).join('') + '</select></div>'
        + '<div class="ch"><label for="a-interval">${T("Intervalle (secondes)")}</label><input type="number" min="2" max="30" id="a-interval" value="' + (c.sliderInterval||6) + '"' + (RO?' disabled':'') + '></div></div>'
        + '<label class="ch" style="display:flex;align-items:center;gap:.5rem;cursor:pointer"><input type="checkbox" id="a-autoplay"' + (c.sliderAutoplay!==false?' checked':'') + (RO?' disabled':'') + ' style="width:auto;accent-color:var(--or)"> ${T("Lecture automatique")}</label>'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin:.4rem 0 .5rem"><b style="font-size:.82rem">${T("Diapos ")}<span id="a-scount">(' + SLIDES.length + ')</span></b>'
        + (RO ? '' : '<button class="b" type="button" id="a-sadd">${T("+ Ajouter une diapo")}</button>') + '</div>'
        + '<div id="a-slides">' + slidesListHtml() + '</div>';
    } else if (b.id === 'banner') {
      h += chTexte('a-eyebrow','${T("Texte chapeau")}', c.eyebrow) + chTexte('a-title','${T("Titre")}', c.title)
        + chAire('a-subtitle','${T("Sous-titre")}', c.subtitle)
        + '<div class="gr2">' + chTexte('a-ctat','${T("Bouton — Texte")}', c.ctaText) + chTexte('a-ctah','${T("Bouton — Lien")}', c.ctaHref||'#shop') + '</div>';
    } else {
      h += chTexte('a-eyebrow','${T("Texte chapeau")}', c.eyebrow) + chTexte('a-title','${T("Titre de section")}', c.title);
    }
    if (!RO) h += '<div style="display:flex;gap:.6rem;margin-top:.6rem"><button class="prim" id="a-save">${T("Enregistrer")}</button><button class="b" id="a-cancel">${T("Annuler")}</button></div>';
    else h += '<div style="margin-top:.6rem"><button class="b" id="a-cancel">${T("← Retour")}</button></div>';
    return h + '</div>';
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    breinit.hidden = RO || EDIT !== null;
    corps.innerHTML = (EDIT === null) ? listeHtml() : editeurHtml();
    brancher();
    // Le bloc qu on vient de deplacer reste sous les yeux, meme s il change de page.
    if (EDIT === null && VOIR) { montrerNouveau(corps.querySelector('[data-ed="' + VOIR + '"]')); }
    VOIR = null;
    if (EDIT === 'hero') montrerNouveau(corps.querySelector('.diapos-choix .on'));
  }

  /* ⚠ L ELEMENT AJOUTE (OU DEPLACE) DOIT SE VOIR : le socle revient a la page 1
     quand le nombre change, et un deplacement peut l envoyer sur la page
     voisine. On pagine tout de suite, puis on avance page par page (borne)
     jusqu a ce qu il paraisse. */
  var VOIR = null;
  function montrerNouveau(el){
    if (!el || typeof szPagesAjuster !== 'function') return;
    var c = el.closest('[data-pages]'); if (!c) return;
    var it = el; while (it.parentNode && it.parentNode !== c && it.parentNode.tagName !== 'TBODY') it = it.parentNode;
    try { szPagesAjuster(c); } catch (e) { return; }
    for (var n = 0; n < 200 && it.style.display === 'none'; n++) {
      var p = c.nextElementSibling;
      var b = (p && p.classList.contains('sz-pages')) ? p.querySelector('[data-szpg="1"]') : null;
      if (!b || b.disabled) break;
      b.click();
    }
  }

  function brancher(){
    if (EDIT === null) {
      corps.querySelectorAll('[data-ed]').forEach(function(el){ el.onclick = function(){ ouvrirEdit(el.getAttribute('data-ed')); }; });
      corps.querySelectorAll('[data-vis]').forEach(function(el){ el.onclick = function(){ basculer(el.getAttribute('data-vis')); }; });
      corps.querySelectorAll('[data-up]').forEach(function(el){ el.onclick = function(){ deplacer(el.getAttribute('data-up'), -1); }; });
      corps.querySelectorAll('[data-down]').forEach(function(el){ el.onclick = function(){ deplacer(el.getAttribute('data-down'), 1); }; });
      brancherGlisser();
      return;
    }
    var sadd = document.getElementById('a-sadd'); if (sadd) sadd.onclick = ajouterDiapo;
    corps.querySelectorAll('[data-sch]').forEach(function(el){ el.onclick = function(){ lireDiapos(); SEL = parseInt(el.getAttribute('data-sch'),10) || 0; rafraichirDiapos(); }; });
    corps.querySelectorAll('[data-sdel]').forEach(function(el){ el.onclick = function(){ lireDiapos(); SLIDES.splice(parseInt(el.getAttribute('data-sdel'),10),1); SEL = Math.max(0, SEL - 1); rafraichirDiapos(); }; });
    corps.querySelectorAll('[data-sup]').forEach(function(el){ el.onclick = function(){ bougerDiapo(parseInt(el.getAttribute('data-sup'),10), -1); }; });
    corps.querySelectorAll('[data-sdn]').forEach(function(el){ el.onclick = function(){ bougerDiapo(parseInt(el.getAttribute('data-sdn'),10), 1); }; });
    var sv = document.getElementById('a-save'); if (sv) sv.onclick = enregistrerBloc;
    /* ⚠ << Annuler >> N'EFFACE PAS LE BROUILLON : la personne quitte le bloc, elle
       ne declare pas jeter son travail. Il lui sera propose a la reouverture, et la
       boite de reprise a son bouton pour repartir a neuf. L'ecriture est IMMEDIATE,
       avec les valeurs prises MAINTENANT : deux appels plus loin, les champs
       n'existent plus. */
    var cn = document.getElementById('a-cancel'); if (cn) cn.onclick = function(){ szFermerBoite(function(){ EDIT=null; SLIDES=[]; dessiner(); dire(''); }); };
  }

  // ── Actions liste ──
  function basculer(id){
    if (!BLOCS.some(function(x){ return x.id===id; })) return;
    ecrire(function(c){ c.forEach(function(b){ if (b.id===id) b.visible = !b.visible; }); });
  }
  /* GLISSER-DÉPOSER (2026-10-27) : on lâche un bloc sur un autre ; la moitié haute le pose AVANT, la basse APRÈS.
     Une seule écriture, comme une flèche. */
  var TIRE = null;
  function brancherGlisser(){
    var nettoyer = function(){ corps.querySelectorAll('.bloc').forEach(function(x){ x.classList.remove('tire', 'cible-av', 'cible-ap'); }); };
    corps.querySelectorAll('[data-glisse]').forEach(function(el){
      el.ondragstart = function(ev){ TIRE = el.getAttribute('data-glisse'); el.classList.add('tire'); try { ev.dataTransfer.effectAllowed = 'move'; ev.dataTransfer.setData('text/plain', TIRE); } catch (e) {} };
      el.ondragend = function(){ TIRE = null; nettoyer(); };
      el.ondragover = function(ev){
        if (!TIRE || TIRE === el.getAttribute('data-glisse')) return;
        ev.preventDefault();
        var r = el.getBoundingClientRect(), av = ev.clientY < r.top + r.height / 2;
        el.classList.toggle('cible-av', av); el.classList.toggle('cible-ap', !av);
      };
      el.ondragleave = function(){ el.classList.remove('cible-av', 'cible-ap'); };
      el.ondrop = function(ev){
        ev.preventDefault();
        var cible = el.getAttribute('data-glisse'), r = el.getBoundingClientRect(), av = ev.clientY < r.top + r.height / 2;
        var id = TIRE; TIRE = null; nettoyer();
        if (!id || id === cible) return;
        poser(id, cible, av);
      };
    });
  }
  function poser(id, cible, avant){
    var L = BLOCS.map(function(b){ return b.id; }).filter(function(x){ return x !== id; });
    var k = L.indexOf(cible); if (k < 0) return;
    L.splice(avant ? k : k + 1, 0, id);
    if (L.join() === BLOCS.map(function(b){ return b.id; }).join()) return;
    VOIR = id;
    ecrire(function(c){
      c.sort(function(a, b){ return L.indexOf(a.id) - L.indexOf(b.id); });
      c.forEach(function(b, n){ b.order = n; });
    });
  }
  function deplacer(id, dir){
    var i = BLOCS.findIndex(function(x){ return x.id===id; }); var ni=i+dir;
    if (i<0 || ni<0 || ni>=BLOCS.length) return;
    VOIR = id;
    ecrire(function(c){
      var tmp=c[i]; c[i]=c[ni]; c[ni]=tmp;
      c.forEach(function(b,k){ b.order = k; });   // renumérote l'ordre
    });
  }

  // ── Éditeur héro ──
  function ouvrirEdit(id){
    var b = BLOCS.filter(function(x){ return x.id===id; })[0]; if(!b) return;
    EDIT = id; SEL = 0;
    if (id === 'hero') {
      var c = b.content || {};
      SLIDES = (c.slides && c.slides.length) ? JSON.parse(JSON.stringify(c.slides))
        : [{ id:'s1', image:'', gradient:gradVal(0), overlay:0.15, eyebrow:'', title:SZ_DONNEES.diapoTitre, subtitle:'', cta1Text:SZ_DONNEES.diapoBouton, cta1Href:'#shop', cta2Text:'', cta2Href:'' }];
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
    // La pastille choisie (neuve, deplacee ou voisine d une supprimee) reste visible.
    montrerNouveau(corps.querySelector('.diapos-choix .on'));
  }
  function ajouterDiapo(){ lireDiapos(); SEL = SLIDES.length; SLIDES.push({ id:'s'+SLIDES.length+'_'+SLIDES.length, image:'', gradient:gradVal(SLIDES.length % Math.max(1,GRADS.length)), overlay:0.15, eyebrow:'', title:SZ_DONNEES.diapoTitre, subtitle:'', cta1Text:SZ_DONNEES.diapoBouton, cta1Href:'#shop', cta2Text:'', cta2Href:'' }); rafraichirDiapos(); }
  function bougerDiapo(i, dir){ lireDiapos(); var ni=i+dir; if(ni<0||ni>=SLIDES.length)return; var t=SLIDES[i]; SLIDES[i]=SLIDES[ni]; SLIDES[ni]=t; SEL = ni; rafraichirDiapos(); }

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
    libelle: '${T("Une modification de ce bloc")}',
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
      if (v._bloc && v._bloc !== EDIT) return false;
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
    // Le contenu se calcule ici, mais ne s applique qu a la COPIE envoyee (voir ecrire).
    var contenu;
    if (EDIT === 'hero') {
      lireDiapos();
      contenu = { sliderEffect: val('a-effect')||'fade', sliderInterval: parseInt(val('a-interval'),10)||6,
        sliderAutoplay: chk('a-autoplay'), slides: SLIDES };
    } else if (EDIT === 'banner') {
      contenu = Object.assign({}, b.content||{}, { eyebrow:val('a-eyebrow'), title:val('a-title'), subtitle:val('a-subtitle'), ctaText:val('a-ctat'), ctaHref:val('a-ctah') });
    } else {
      contenu = Object.assign({}, b.content||{}, { eyebrow:val('a-eyebrow'), title:val('a-title') });
    }
    var cible = EDIT;
    /* ⚠ LE BROUILLON MEURT DANS LA SUITE D'ecrire(), donc SEULEMENT si l'ecriture
       a abouti : le jeter avant perdrait la saisie en cas d'echec. */
    ecrire(function(c){ c.forEach(function(x){ if (x.id === cible) x.content = JSON.parse(JSON.stringify(contenu)); }); },
      function(){ szBrouillonJeter(); EDIT=null; SLIDES=[]; });
  }

  breinit.onclick = function(){
    if (RO || OCCUPE) return;
    if (!CONF_REINIT) {
      szConfirmer({ danger: true, titre: '${T("Réinitialiser la page d’accueil")}',
        texte: '${T("Tous les blocs de la page d’accueil seront remplacés par la configuration par défaut. Les blocs et diapositives actuels seront perdus. Cette action est irréversible.")}',
        oui: '${T("Réinitialiser les blocs")}' }).then(function(ok){ if (ok) { CONF_REINIT = true; breinit.onclick(); } });
      return;
    }
    CONF_REINIT = false; breinit.textContent='${T("Réinitialiser")}';
    occuper(true); dire('${T("Réinitialisation…")}');
    appeler('config:accueil:reinit').then(function(r){ occuper(false);
      if (r && r.ok) { adopter(r); EDIT=null; dessiner(); dire('${T("Blocs réinitialisés.")}', 'bon'); }
      else dire(expliquer(r), 'err'); });
  };

  function charger(){
    dire('${T("Lecture…")}');
    appeler('config:accueil:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide m-' + esc((r && r.motif) || 'echec') + '">' + esc(expliquer(r)) + '</div>'; dire(expliquer(r), 'err'); return; }
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
