'use strict';

/*
 * SOCLE COMMUN DES FENÊTRES NATIVES
 * =============================================================================
 * Une feuille de style, un mécanisme d'assistant par étapes et quelques aides,
 * partagés par toutes les fenêtres écrites dans l'application.
 *
 * ⚠ POURQUOI UN SOCLE PLUTÔT QU'UNE COPIE PAR FENÊTRE.
 * Le menu détaché a déjà vécu le contraire : sa feuille avait été recopiée, puis
 * le rail ancré a gagné des emojis, un pied aligné, des espacements revus — et
 * les deux menus, censés être le même, ne se ressemblaient plus. Ici, une
 * fenêtre ajoutée demain hérite du même dessin et du même déroulé.
 *
 * ⚠ LE DÉFILEMENT EST UN DÉFAUT, PAS UNE SOLUTION (demandé le 2026-08-06).
 * Un formulaire qu'on fait défiler cache la moitié de ses champs et son bouton
 * d'action. D'où l'assistant : une étape tient dans la fenêtre, on avance. Les
 * listes qui peuvent grandir — produits, variantes — sont PAGINÉES : une liste
 * qui défile dans une étape qui ne défile pas est le même défaut, en plus petit.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) hors des gabarits eux-mêmes, y compris dans
 * les commentaires CSS : le contenu part dans des littéraux de gabarit, et un
 * accent grave égaré referme la chaîne. Ça s'est produit trois fois sur ce projet.
 */

const CSS_SOCLE = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}

.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{margin-left:auto;font-size:.73rem;color:#8fa1b8}

/* Fil des etapes : cliquable, et il dit ce qui est FAIT — pas ce qui est passe. */
.pas{flex:0 0 auto;display:flex;gap:.2rem;padding:.45rem 1.1rem;
  border-bottom:1px solid rgba(255,255,255,.07);background:#111a28;
  overflow-x:auto;scrollbar-width:none}
.pas::-webkit-scrollbar{display:none}
.pas button{flex:0 0 auto;font:inherit;font-size:.76rem;padding:.24rem .58rem;
  border-radius:7px;border:1px solid transparent;background:transparent;
  color:#8fa1b8;cursor:pointer;white-space:nowrap}
.pas button:hover{color:#cbd8e6}
.pas button.on{background:rgba(201,169,126,.16);border-color:rgba(201,169,126,.45);color:#e8dcc6}
.pas button.fait{color:#4ade80}
.pas .n{display:inline-block;min-width:1.05rem;text-align:center;font-variant-numeric:tabular-nums}

/* ⚠ LE CORPS NE DEFILE PAS. Une etape doit tenir dans la fenetre ; si elle
   deborde, c est qu il faut la couper en deux, pas ajouter une glissiere. */
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.1rem;overflow:hidden;display:flex}
.etape{display:none;flex:1 1 auto;min-height:0;flex-direction:column;gap:.7rem}
.etape.on{display:flex}

.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.85rem .95rem;min-height:0;flex:0 0 auto}
/* « plein » : pour les cartes qui portent une LISTE, qui doit occuper la place
   disponible pour montrer le plus de lignes possible. Une carte ordinaire epouse
   son contenu — sinon quatorze jetons laissent quatre cents pixels de vide. */
.carte.plein{flex:1 1 auto;display:flex;flex-direction:column;min-height:0}
/* Une etape dont AUCUNE carte n est « plein » se tasse en haut au lieu de s etirer. */
.etape{justify-content:flex-start}
.carte h2{margin:0 0 .6rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.09em;color:#8fa1b8;font-weight:700}

.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.65rem .75rem}
.ch{display:flex;flex-direction:column;gap:.24rem;min-width:0}
.ch.large{grid-column:1/-1}
.ch label{font-size:.73rem;color:#8fa1b8}
.ch .req{color:#c9a97e}
input,select,textarea{font:inherit;color:#e8edf5;background:#0f1826;
  border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:.38rem .55rem;
  width:100%;min-width:0}
input:focus,select:focus,textarea:focus{outline:none;border-color:#c9a97e}
textarea{resize:none}
input.manque{border-color:#f87171}
input[type=checkbox]{width:auto}
.cases{display:flex;flex-wrap:wrap;gap:.4rem .85rem}
.cases label{display:inline-flex;align-items:center;gap:.35rem;font-size:.84rem;
  color:#e8edf5;cursor:pointer}

button{font:inherit;cursor:pointer;border-radius:8px;padding:.36rem .8rem;
  border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);
  color:#e8edf5;transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
button.prim:hover:not(:disabled){background:#d8bd97;border-color:#d8bd97}

.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.55rem 1.1rem;border-top:1px solid rgba(255,255,255,.08);
  background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;min-height:1.15em;flex:1 1 auto;min-width:0;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
.actions{flex:0 0 auto;display:flex;gap:.4rem}

/* Listes PAGINEES : hauteur fixe, jamais de glissiere. Le nombre de lignes est
   calcule par la fenetre selon la place reelle, pas devine a l avance. */
.liste{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:.3rem;overflow:hidden}
.liste .lg{display:flex;align-items:center;gap:.5rem;padding:.26rem .3rem;
  border-radius:6px;font-size:.86rem;cursor:pointer}
.liste .lg:hover{background:rgba(255,255,255,.04)}
.liste .lg .fin{margin-left:auto;font-size:.72rem;color:#8fa1b8;flex:0 0 auto}
.pagi{flex:0 0 auto;display:flex;align-items:center;gap:.5rem;padding-top:.5rem;
  margin-top:.35rem;border-top:1px solid rgba(255,255,255,.07);font-size:.78rem;color:#8fa1b8}
.pagi button{padding:.2rem .55rem;font-size:.78rem}
.pagi .pos{margin-left:auto}

.rech{display:flex;gap:.5rem;align-items:center;margin-bottom:.5rem;flex:0 0 auto}
.rech input{flex:1 1 auto}
.rech .cpt{flex:0 0 auto;font-size:.77rem;color:#8fa1b8;white-space:nowrap}

.aide{font-size:.75rem;color:#8fa1b8;line-height:1.45}
.vide{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;
  justify-content:center;text-align:center;color:#8fa1b8;gap:.3rem}
.vide .gros{font-size:1rem;color:#e8edf5}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/*
 * Aides communes : traductions des refus du pont, et le moteur d'assistant.
 * ⚠ Une fenetre qui ne sait pas doit le DIRE. Un ecran muet sur un refus de
 * droit ressemble a une panne, et on cherche au mauvais endroit.
 */
/*
 * ⚠ CE BLOC EST A PART, ET C EST VOULU : toutes les fenetres n incluent PAS le
 * socle. << Imprimantes >>, << Affichage client >> et << Caisse >> sont des ecrans
 * d etat ou d operation, pas des assistants a etapes : leur imposer le moteur
 * d etapes aurait produit de faux assistants a une seule etape pour satisfaire une
 * uniformite. Elles ont pourtant TOUTES besoin de dire << il y a quelqu un >> —
 * la caisse plus que les autres, puisqu on y travaille des heures.
 * Recopier ce bloc dans chaque fenetre l aurait fait diverger au premier
 * ajustement, et une fenetre oubliee aurait continue de faire deconnecter son
 * usager sans qu on comprenne pourquoi.
 */
const JS_ACTIVITE = `
// ⚠⚠ << IL Y A QUELQU UN >> — CE BLOC EMPECHE DE DECONNECTER UNE PERSONNE AFFAIREE.
// Le minuteur d inactivite du site n ecoute que les evenements de SA page. Une
// fenetre native est un document separe : ses clics et ses frappes ne l atteignent
// jamais. Quelqu un qui saisit une fiche pendant vingt minutes etait donc traite
// comme absent depuis vingt minutes, et renvoye a l ecran de connexion — sans
// meme voir le decompte, qui s ouvrait DERRIERE cette fenetre. Signale par
// l utilisateur le 2026-08-07 : << je suis constamment deconnecte >>.
//
// ⚠ SUR DE VRAIS GESTES SEULEMENT, JAMAIS SUR UNE MINUTERIE. Un envoi periodique
// — l enregistrement automatique du brouillon part toutes les 5 secondes —
// maintiendrait la session ouverte toute la nuit, et le minuteur ne protegerait
// plus rien du tout. On n ecoute donc que clic, frappe et saisie.
//
// ⚠ ETRANGLE A 20 SECONDES. Le site se protege deja (une ecriture par 5 s au
// plus), mais chaque appel traverse le pont jusqu a la fenetre principale : le
// faire a chaque touche encombrerait ce passage pour rien. Vingt secondes restent
// tres en dessous des quinze minutes d inactivite tolerees.
var _derniereActivite = 0;
function signalerActivite(){
  var t = Date.now();
  if (t - _derniereActivite < 20000) return;
  _derniereActivite = t;
  // Sans rattrapage visible : si ce signal echoue, ce n est pas a l usager de le
  // savoir — au pire l avertissement d inactivite paraitra, ce qui est le
  // comportement d avant et non une panne nouvelle.
  try { var p = P.appeler('session:activite'); if (p && p.then) p.then(function(){}, function(){}); }
  catch (e) {}
}
// En phase de CAPTURE, pour que rien ne puisse l empecher d etre vu — un
// gestionnaire qui arrete la propagation ne doit pas faire passer son usager pour
// un absent.
document.addEventListener('mousedown', signalerActivite, true);
document.addEventListener('keydown', signalerActivite, true);
document.addEventListener('input', signalerActivite, true);
// L ouverture de la fenetre EST un geste : on le dit tout de suite, sinon les
// vingt premieres secondes ne compteraient pas.
signalerActivite();
`;

/*
 * ⚠ LE BANDEAU DE MESSAGE S EFFACE SEUL — UNE SEULE SOURCE POUR TOUTES LES
 * FENETRES.
 *
 * Le patron d origine n effacait que les SUCCES. Un avertissement comme
 * << Aucune photo trouvee sur une cle USB. >> restait donc au bas de la fenetre
 * POUR TOUJOURS, et l on finissait par le lire comme l etat courant de l ecran
 * plutot que comme le verdict d un geste fait cinq minutes plus tot. Releve par
 * l utilisateur le 2026-08-09, capture a l appui.
 *
 * ⚠ SAUF CE QUI EST EN COURS, et c est la seule exception. Un message qui se
 * termine par des points de suspension annonce un TRAVAIL, pas un resultat :
 * << Import 3 / 12 - robe.jpg... >>, << Isolation du vetement... >>. L effacer
 * au bout de cinq secondes ferait passer une operation longue pour une fenetre
 * inerte — exactement le contraire de ce qu on cherche.
 *
 * ⚠ ON N EFFACE QUE CE QU ON A ECRIT : si un autre message est arrive entre
 * temps, le minuteur ne touche a rien. Sans ce controle, un verdict tout frais
 * disparaitrait parce qu un message anterieur arrive a echeance.
 *
 * ⚠ POURQUOI ICI ET PAS DANS CHAQUE FENETRE : il y en a QUARANTE-DEUX, et la
 * regle etait deja ecrite quarante-deux fois, avec quatre variantes (4 s, 10 s,
 * aucune, et deux jeux de genres differents). En corriger une par une, c est en
 * oublier une.
 */
/* Le compagnon JS du plein écran. ⚠ IL N'EST PLUS À INCLURE À LA MAIN : il est
   joint à JS_DIRE, que les 78 fenêtres incluent (directement ou via JS_SOCLE).
   L'inclure une seconde fois redéclarerait ses fonctions.
   ⚠ szPleinReinit est appelé tout seul par l'observateur dès qu'il n'y a plus de
   surcouche — la classe de zoom vit sur <html>, pas sur la boîte. */
const JS_PLEIN = `
var _szPleinOn = false;
function szPleinEtat(){ return _szPleinOn; }
function szPleinBasculer(boite, bouton){
  _szPleinOn = !_szPleinOn;
  if (boite) boite.classList.toggle('sz-plein', _szPleinOn);
  document.documentElement.classList.toggle('sz-zoom', _szPleinOn);
  if (bouton){
    bouton.textContent = _szPleinOn ? '⤡ Réduire' : '⛶ Plein écran';
    bouton.title = _szPleinOn ? 'Revenir à la taille normale' : 'Occuper toute la fenêtre';
  }
}
function szPleinReinit(){
  _szPleinOn = false;
  document.documentElement.classList.remove('sz-zoom');
}
`;

/* ⚠ LE MESSAGE PART D'ABORD DANS LA SURCOUCHE OUVERTE, ET SEULEMENT ENSUITE AU
   PIED DE LA FENÊTRE. Le pied est DERRIÈRE le voile : un avertissement de saisie
   s'y affichait tout en bas, hors du champ de vision, sous le panneau qu'on est
   justement en train de remplir (signalé le 2026-08-13, capture à l'appui, sur
   l'assistant des incidents — mais le défaut valait pour TOUTES les fenêtres).
   ⚠ Le repli sur `#msg` est passé APRÈS : il sortait par `return` quand la
   fenêtre n'a pas de pied, ce qui aurait sauté aussi le routage. */
const JS_DIRE_BASE = `
var _szDireT = null;
function szDire(texte, genre){
  var t = texte == null ? '' : String(texte);
  szDireSurcouche(t, genre);
  var m = document.getElementById('msg');
  if (!m) return;
  m.textContent = t;
  m.className = 'msg' + (genre ? ' ' + genre : '');
  clearTimeout(_szDireT);
  if (!t) return;
  if (t.charAt(t.length - 1) === '…' || t.slice(-3) === '...') return;
  _szDireT = setTimeout(function(){
    var m2 = document.getElementById('msg');
    if (m2 && m2.textContent === t) { m2.textContent = ''; m2.className = 'msg'; }
    szDireSurcouche('', '');
  }, 5000);
}
`;

/* ── LE PLEIN ÉCRAN S'INSTALLE TOUT SEUL, DANS TOUTES LES FENÊTRES ───────────
   Il l'a demandé « pour tous les assistants ou fenêtres ». Il y a 78 fenêtres et
   leurs surcouches n'ont PAS la même structure : `.voile > .boite` pour la
   plupart, `.sur > .boite` pour les plus récentes, `.asst > .bo` pour la
   photothèque, et l'en-tête est tantôt une barre `.tt`, tantôt un simple `h3`.
   Poser un bouton à la main dans chacune, c'était 22 modifications à refaire à
   chaque nouvelle surcouche — et une oubliée ne se voit pas.

   On observe donc le document : dès qu'une surcouche paraît, elle reçoit son
   bouton. Une surcouche écrite demain l'aura sans que personne y pense.

   ⚠ ON RETIRE LE ZOOM DÈS QU'IL N'Y A PLUS DE SURCOUCHE. La classe vit sur
   <html>, et la plupart des fenêtres retirent leur voile sans rien nous dire :
   sans ce filet, la fenêtre entière resterait en gros caractères après la
   fermeture, sans rien pour l'expliquer. */
const JS_PLEIN_AUTO = `
var SZ_VOILES = '.voile,.sur,.asst';
function _szVoileVisible(){
  var l = document.querySelectorAll(SZ_VOILES);
  for (var i = 0; i < l.length; i++){
    if (l[i].getClientRects().length) return l[i];
  }
  return null;
}
function _szBoite(v){
  return v.querySelector('.boite') || v.querySelector('.bo') || v.firstElementChild;
}
/* Le message dans la surcouche. Si la fenêtre a DÉJÀ sa propre zone (.msgsur),
   on n'y touche pas : elle sait mieux que nous où le poser. */
function szDireSurcouche(t, genre){
  var v = _szVoileVisible(); if (!v) return;
  var b = _szBoite(v); if (!b) return;
  if (b.querySelector('.msgsur')) return;
  var z = b.querySelector('.sz-msgauto');
  if (!z){
    if (!t) return;
    z = document.createElement('div');
    b.appendChild(z);
  }
  z.textContent = t || '';
  z.className = 'sz-msgauto' + (genre ? ' ' + genre : '');
  z.style.display = t ? '' : 'none';
}
function _szPoserBouton(v){
  if (v.getAttribute('data-szplein') === '1') return;
  var b = _szBoite(v); if (!b) return;
  v.setAttribute('data-szplein', '1');
  // La fenêtre a posé le sien (incidents, sauvegarde) : on la laisse faire.
  if (b.querySelector('.sz-btnplein')) return;
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'sz-btnplein';
  btn.textContent = '⛶ Plein écran';
  btn.title = 'Occuper toute la fenêtre';
  var tt = b.querySelector('.tt');
  if (tt) { tt.appendChild(btn); }
  else {
    // Pas de barre d'en-tête : on le pose en surimpression au coin, et on
    // RÉSERVE la place à droite du titre — sinon un titre long passe dessous.
    btn.className = 'sz-btnplein flottant';
    try { if (getComputedStyle(b).position === 'static') b.style.position = 'relative'; } catch(e){}
    var h = b.querySelector('h1,h2,h3');
    if (h) h.style.paddingRight = '8rem';
    b.appendChild(btn);
  }
  btn.onclick = function(){ szPleinBasculer(b, btn); };
}
var _szAutoEnCours = false;
function _szAutoPasse(){
  _szAutoEnCours = false;
  var l = document.querySelectorAll(SZ_VOILES);
  for (var i = 0; i < l.length; i++) _szPoserBouton(l[i]);
  if (!l.length && szPleinEtat()) szPleinReinit();
}
function szPleinAuto(){
  if (window._szPleinAutoOn) return;
  window._szPleinAutoOn = true;
  _szAutoPasse();
  // Différé : un écran qui se redessine produit des centaines de mutations, et
  // il n'y a aucune raison de reparcourir le document pour chacune.
  try {
    new MutationObserver(function(){
      if (_szAutoEnCours) return;
      _szAutoEnCours = true;
      setTimeout(_szAutoPasse, 0);
    }).observe(document.body, { childList: true, subtree: true });
  } catch(e){}
}
szPleinAuto();
`;

/* ── LE PLEIN ÉCRAN DE LA FENÊTRE ELLE-MÊME ──────────────────────────────────
   ⚠⚠ CE N'EST PAS LE MÊME PLEIN ÉCRAN QUE CELUI DE #28, ET C'EST TOUT LE POINT.
   L'installateur ci-dessus (JS_PLEIN_AUTO) équipe les SURCOUCHES : il fait
   remplir la fenêtre par une boîte qui flottait au milieu. Il ne peut rien pour
   une fenêtre dont l'assistant EST la page — « Préparation de commande » n'a
   aucune surcouche à agrandir, donc aucun bouton n'y paraissait jamais. Le
   défaut a été signalé là, mais il valait pour 82 fenêtres sur 84.

   Le vrai plein écran de fenêtre existait déjà (szPont.pleinEcran →
   `fenetre:pleinecran` → setFullScreen), et DEUX fenêtres seulement l'offraient :
   produit.js et photos.js, chacune avec son bouton écrit à la main. On le pose
   donc ici, une fois, pour toutes celles qui ont une barre de titre.

   ⚠ LE LIBELLÉ SE SYNCHRONISE SUR LA CLASSE, PAS SUR NOS CLICS. La coquille pose
   « sz-zoom-fen » sur <html> quand la fenêtre entre en plein écran, par quelque
   chemin que ce soit (notre bouton, le menu, la touche du système). Un bouton qui
   ne suivrait que ses propres clics mentirait dès que l'utilisateur sort du plein
   écran autrement. On observe donc la classe.
   ⚠ ET L'ÉTAT RENDU PAR LA COQUILLE PASSE EN PREMIER : la classe arrive par un
   aller-retour, un instant plus tard. Sans cela le bouton clignoterait à l'envers.

   ⚠ AUCUN BOUTON MORT : sans szPont.pleinEcran (coquille antérieure à 1.19.0,
   ou page ouverte dans un navigateur), on ne pose rien du tout. Un bouton qui
   reste là sans rien faire est un défaut qu'on ne peut pas diagnostiquer. */
const JS_FENPLEIN = `
function _szFenEtat(){ return document.documentElement.classList.contains('sz-zoom-fen'); }
function _szFenLibelle(b, on){
  if (on === undefined) on = _szFenEtat();
  b.textContent = on ? '⤡' : '⛶';
  b.title = on ? 'Quitter le plein écran' : 'Plein écran — toute la fenêtre';
}
function szFenPleinPoser(){
  var t = document.querySelector('.tete');
  if (!t) return;
  // Déjà posé, ou la fenêtre a le sien (produit.js) : on ne double pas.
  if (t.querySelector('[data-szfen]') || t.querySelector('#btn-fs')) return;
  if (!window.szPont || !window.szPont.pleinEcran) return;
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'sz-btnfen';
  b.setAttribute('data-szfen', '1');
  _szFenLibelle(b);
  b.onclick = function(){
    window.szPont.pleinEcran().then(function(etat){
      if (etat === null) return;          // la coquille n'a pas répondu
      _szFenLibelle(b, etat);
    });
  };
  t.appendChild(b);
  try {
    new MutationObserver(function(){ _szFenLibelle(b); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  } catch(e){}
}
szFenPleinPoser();
document.addEventListener('DOMContentLoaded', szFenPleinPoser);
`;

/* Ce que les fenêtres reçoivent réellement sous le nom `JS_DIRE` : le message,
   le plein écran des surcouches et son installateur, et le plein écran de la
   fenêtre. Elles n'ont RIEN à changer — c'est tout l'intérêt de le brancher ici
   plutôt que dans chacune. */
/* ══ CADENAS SUR LES LIGNES D UNE LISTE (#22) ═══════════════════════════════
   Signale avec capture : la fiche client OUVERTE disait bien << verrouillee
   par broubob >>, mais la LIGNE dans la liste ne montrait rien — un collegue
   devait cliquer pour decouvrir que la fiche etait prise. L information
   existait ; elle n etait simplement pas la ou l on regarde.

   #38 avait fait ce travail pour le seul tableau de bord. Il est ici pour que
   TOUTE liste en herite, sans le reinventer — et pour qu il n y ait qu un
   endroit a corriger.

   Usage dans une fenetre de liste :
     1. dans chaque ligne :  szVerrouCase('users', u.id)
     2. une fois, au demarrage :  szVerrousSuivre(['users'])
     3. apres chaque redessin :  szVerrousPeindre()

   ⚠ ON NE REDESSINE JAMAIS LA LISTE POUR UN CADENAS. Le sondage repeint les
   seules cases concernees : pas de clignotement, pas de perte de focus, pas de
   selection perdue pendant qu on tape. C est la regle du temps reel du projet.
   ⚠ Le minuteur s arrete a `pagehide` : une vue ancree dechargee laisserait
   sinon un sondage vivant pour rien.                                        */
const CSS_VERROUS = `
.cadslot{display:inline}
.cad{margin-left:.35rem;font-size:.8rem;color:#fbbf24;vertical-align:middle;cursor:default}
.cad.mine{color:#c9a97e}
`;

const JS_VERROUS = `
var _szVerrous = {};      // { 'portee|id': { par, mine, depuis } }
var _szVerrousT = null;
var _szVerrousP = [];

function szVerrouCase(portee, id){
  return '<span class="cadslot" data-cad="' + String(portee) + '|' + String(id == null ? '' : id) + '"></span>';
}

function _szVerrouInner(cle){
  var v = _szVerrous[cle];
  if (!v) return '';
  var t = v.mine ? 'Vous tenez cette fiche en modification'
    : ('En traitement par ' + (v.par || 'un collegue') + (v.depuis ? ' — ' + v.depuis : ''));
  return '<span class="cad' + (v.mine ? ' mine' : '') + '" title="'
    + String(t).replace(/"/g, '&quot;') + '"><span class="ic">🔒</span></span>';
}

function szVerrousPeindre(){
  var s = document.querySelectorAll('.cadslot');
  for (var i = 0; i < s.length; i++){
    s[i].innerHTML = _szVerrouInner(s[i].getAttribute('data-cad'));
  }
}

function szVerrousLire(){
  if (!_szVerrousP.length) return;
  if (!window.szPont || !window.szPont.appeler) return;
  var p;
  try { p = window.szPont.appeler('verrous:liste', _szVerrousP); }
  catch (e) { return; }
  if (!p || typeof p.then !== 'function') return;
  p.then(function(r){
    if (!r || !r.ok || !r.portees) return;
    var n = {};
    for (var portee in r.portees){
      if (!Object.prototype.hasOwnProperty.call(r.portees, portee)) continue;
      var ids = r.portees[portee];
      for (var id in ids){
        if (Object.prototype.hasOwnProperty.call(ids, id)) n[portee + '|' + id] = ids[id];
      }
    }
    _szVerrous = n;
    szVerrousPeindre();
  }).catch(function(){});
}

function szVerrousSuivre(portees){
  _szVerrousP = (portees || []).slice();
  if (_szVerrousT) return;
  szVerrousLire();
  _szVerrousT = setInterval(szVerrousLire, 3000);
}

window.addEventListener('pagehide', function(){
  if (_szVerrousT) { clearInterval(_szVerrousT); _szVerrousT = null; }
});
`;

/* ══ LE BANDEAU DE TRAITEMENT, DANS TOUTES LES FENETRES (#27) ═══════════════
   Sa demande, mot pour mot : << le traitement doit pouvoir me suivre dans
   differents modules dans l application, autrement dit quand ses un traitement
   sa doit etre au premier plan >>.

   Le moteur vit dans la page principale ; ce bandeau n est qu un temoin. Il
   est pose ICI, dans le socle, pour qu AUCUNE fenetre n ait a y penser : un
   ecran ajoute demain l aura sans rien faire.

   ⚠ IL NE PARAIT QUE QUAND IL Y A QUELQUE CHOSE A DIRE. Une barre permanente
   qui annonce << rien en cours >> n apprend rien et vole de la place a chaque
   ecran. Pas de lot en marche : rien du tout.
   ⚠ IL NE SONDE PAS TANT QUE LA FENETRE EST CACHEE (document.hidden) : vingt
   fenetres ouvertes qui interrogent toutes les deux secondes, c est dix appels
   par seconde pour un temoin que personne ne regarde.
   ⚠ IL NE FAIT QUE MONTRER. Mettre en pause ou arreter se fait dans le Studio,
   ou l on voit CE QU ON arrete. Un bouton d arret sur un bandeau minuscule,
   au-dessus d un ecran sans rapport, est une facon de detruire un travail de
   500 photos par megarde.                                                    */
const CSS_LOTS = `
.sz-lots{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;align-items:center;
  gap:.6rem;padding:.3rem .8rem;font-size:.76rem;color:#e8dcc6;
  background:linear-gradient(180deg,#1b2434,#141c29);
  border-top:1px solid rgba(201,169,126,.45);box-shadow:0 -4px 14px rgba(0,0,0,.35)}
.sz-lots .nom{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:16rem}
.sz-lots .jauge{flex:1 1 auto;min-width:4rem;height:.42rem;border-radius:99px;
  background:rgba(255,255,255,.12);overflow:hidden}
.sz-lots .jauge i{display:block;height:100%;background:#c9a97e;transition:width .3s}
.sz-lots .cpt{white-space:nowrap;font-variant-numeric:tabular-nums}
.sz-lots .file{white-space:nowrap;color:#8fa1b8}
/* ⚠⚠ IL RECOUVRAIT LE BAS DE CHAQUE FENETRE. Le bandeau est en position FIXE :
   il ne pousse rien, il passe par-dessus. Dans le Studio il masquait a moitie
   << Generer en pleine qualite >> — le bouton qui depense — et ailleurs la
   derniere ligne d une liste. On lui reserve donc sa hauteur, et seulement
   quand il est la : la classe est posee a sa creation et retiree avec lui. */
html.sz-lots-on body{padding-bottom:1.9rem}
html.jour .sz-lots{background:linear-gradient(180deg,#fbf8f2,#f2ece1);color:#3a2f20;
  border-top-color:rgba(143,111,66,.5)}
html.jour .sz-lots .jauge{background:rgba(0,0,0,.1)}
html.jour .sz-lots .file{color:#6b5c47}
`;

const JS_LOTS = `
var _szLotsT = null, _szLotsEl = null;

function _szLotsPeindre(r){
  var actif = r && r.ok && r.resume;
  if (!actif) {
    if (_szLotsEl && _szLotsEl.parentNode) { _szLotsEl.parentNode.removeChild(_szLotsEl); _szLotsEl = null; }
    document.documentElement.classList.remove('sz-lots-on');
    return;
  }
  if (!_szLotsEl) {
    _szLotsEl = document.createElement('div');
    _szLotsEl.className = 'sz-lots';
    document.body.appendChild(_szLotsEl);
  }
  // La place qu il occupe, reservee tant qu il est la (voir CSS_LOTS).
  document.documentElement.classList.add('sz-lots-on');
  var s = r.resume;
  var pct = s.total ? Math.round((s.fait / s.total) * 100) : 0;
  var enFile = s.enFile ? ('<span class="file">+ ' + s.enFile + ' en file</span>') : '';
  _szLotsEl.innerHTML = '<span>⚙</span>'
    + '<span class="nom">' + String(s.nom || 'Traitement').replace(/[&<>"]/g, '') + '</span>'
    + '<span class="jauge"><i style="width:' + pct + '%"></i></span>'
    + '<span class="cpt">' + s.fait + ' / ' + s.total + '</span>' + enFile;
}

function _szLotsLire(){
  if (document.hidden) return;
  if (!window.szPont || !window.szPont.appeler) return;
  var p;
  try { p = window.szPont.appeler('lots:etat'); } catch (e) { return; }
  if (!p || typeof p.then !== 'function') return;
  p.then(_szLotsPeindre).catch(function(){});
}

function szLotsSuivre(){
  if (_szLotsT) return;
  _szLotsLire();
  _szLotsT = setInterval(_szLotsLire, 2000);
}

// Toute fenetre en herite : aucune n a a y penser.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', szLotsSuivre);
} else { szLotsSuivre(); }
document.addEventListener('visibilitychange', function(){ if (!document.hidden) _szLotsLire(); });
window.addEventListener('pagehide', function(){
  if (_szLotsT) { clearInterval(_szLotsT); _szLotsT = null; }
});
`;

/* ══ PAGINATION AUTOMATIQUE (#30) ═══════════════════════════════════════════
   Sa demande : << tous les journaux devraient avoir de la pagination auto >>,
   et la meme chose dans les liens.

   Le patron existait DEJA, dans commandes.js : autant de lignes que la hauteur
   REELLE le permet — mesuree, jamais devinee — donc jamais de glissiere, et
   une fenetre agrandie montre plus de lignes au lieu de laisser du vide. Il
   est ici pour que les autres ecrans en heritent au lieu de le recopier : une
   regle recopiee diverge au premier ajustement.

   Usage :
     szAutoPagination('.liste', function(n){ F.parPage = n; F.page = 0; charger(); });
   Le rappel n est appele QUE si le compte a change — sinon on rechargerait la
   liste a chaque redimensionnement d un pixel.

   ⚠ ON NE TOUCHE A RIEN SI LA MESURE EST ABSURDE (hauteur nulle ou NaN) :
   c est le cas au banc, ou rien n est reellement dispose. Un compte devine
   dans ces conditions ferait recharger la liste avec une valeur inventee. */
const JS_AUTOPAGE = `
var _szAutoT = null, _szAutoDernier = 0;

function szAutoPagination(selecteur, surChangement){
  function mesurer(){
    var g = document.querySelector(selecteur);
    if (!g) return;
    var th = g.querySelector('thead');
    var tr = g.querySelector('tbody tr');
    var hL = tr ? tr.offsetHeight : 0;
    if (!(hL > 0)) hL = 36;
    var dispo = g.clientHeight - ((th && th.offsetHeight) || 30);
    if (!(dispo > 0)) return;
    var n = Math.max(5, Math.floor(dispo / hL));
    if (!isFinite(n) || n === _szAutoDernier) return;
    _szAutoDernier = n;
    try { surChangement(n); } catch (e) {}
  }
  mesurer();
  if (!_szAutoT) {
    window.addEventListener('resize', function(){
      clearTimeout(_szAutoT);
      _szAutoT = setTimeout(mesurer, 180);
    });
    _szAutoT = -1;   // l ecouteur n est pose qu une fois
  }
  return mesurer;
}
`;

const JS_DIRE = JS_DIRE_BASE + JS_PLEIN + JS_PLEIN_AUTO + JS_FENPLEIN + JS_VERROUS + JS_LOTS + JS_AUTOPAGE;

const JS_SOCLE = `
var P = window.szPont;
` + JS_ACTIVITE + JS_DIRE + `
var MOTIFS = {
  session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
  droit:              'Votre rôle ne donne pas accès à cette opération.',
  indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
  pont_indisponible:  'La fenêtre principale ne répond pas.',
  delai:              'La fenêtre principale n’a pas répondu à temps. Réessayez ; si cela persiste, rechargez-la (Ctrl+R).',
  operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
  introuvable:        'Cette fiche n’existe plus.',
  nom_requis:         'Le nom est obligatoire.',
  televersement:      'Le dépôt de l’image a échoué. Rien n’a été enregistré.',
  verrou:             'Fiche ouverte par quelqu’un d’autre.',
  module_photos:      'La photothèque n’a pas pu être chargée dans la fenêtre principale. Rechargez-la (Ctrl+R) ; si le message revient, la session du personnel a peut-être expiré — reconnectez-vous.',
  echec:              'L’opération a échoué.'
};
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
  return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
function expliquer(r){
  var m = r && r.motif;
  if (m === 'verrou') return MOTIFS.verrou + (r.parQui ? ' (' + r.parQui + ')' : '');
  return MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
}
function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }
function poser(id, v){ var e = document.getElementById(id); if (e) e.value = (v == null ? '' : v); }
function coché(id){ var e = document.getElementById(id); return !!(e && e.checked); }

/* ── MOTEUR D ASSISTANT ────────────────────────────────────────────────────
   ETAPES : [{ t: 'Titre', obl: ['id-champ', …] }]
   ⚠ Une etape n est « faite » que si TOUS ses champs obligatoires sont remplis.
   Un fil qui verdit a mesure qu on avance, sans regarder le contenu, annonce un
   formulaire pret alors qu il ne l est pas. */
var Assist = {
  etapes: [], i: 0, surEtape: null,
  /* ⚠ LES ETAPES DEJA TRAVERSEES, et pourquoi il en faut la trace.
     Une etape sans champ obligatoire est « complete » des le depart :
     every sur une liste vide rend TRUE. Se fier a la seule completude
     verdissait donc « Tailles et couleurs », « Photo », « Mise en marche » et
     « Stock » AVANT qu on les ait ouvertes — un formulaire vierge s annoncait
     pret aux quatre cinquiemes. Le critere est double : VISITEE et complete. */
  vus: {},
  etapes_: null,
  poser: function(etapes, surEtape){
    this.etapes = etapes; this.surEtape = surEtape || null; this.i = 0;
    this.vus = {};
    var self = this;
    document.getElementById('pas').addEventListener('click', function(ev){
      var b = ev.target.closest('[data-etape]'); if (!b) return;
      var cible = parseInt(b.getAttribute('data-etape'), 10) || 0;
      /* ⚠ LE FIL NE SAUTE PAS PAR-DESSUS UNE ETAPE INACHEVEE (2026-08-07).
         « Suivant » etait garde, mais cliquer directement une etape du fil
         passait outre — la meme porte, sans le meme gardien. Pour avancer,
         chaque etape traversee doit accepter qu on la quitte ; on s arrete sur
         la PREMIERE qui refuse, la ou le travail reste. Reculer est libre. */
      if (cible > self.i) {
        for (var k = self.i; k < cible; k++) {
          var m = self.manquant(k);
          if (m) { self.aller(k); self.pointer(m, 'Remplissez ce champ pour continuer.'); return; }
          var f = self.freine(k);
          if (f) { self.aller(k); dire(f, 'att'); return; }
        }
      }
      self.aller(cible);
    });
    document.getElementById('btn-prec').onclick = function(){ self.bouger(-1); };
    document.getElementById('btn-suiv').onclick = function(){ self.bouger(1); };
    /* ⚠ UN SEUL ENDROIT QUI RAFRAICHIT LE FIL — delegue sur tout le corps.
       Sans lui, une etape ne verdissait qu au prochain deplacement : le fil
       affirmait « incomplet » alors que le dernier champ obligatoire venait
       d etre rempli sous les yeux. Le brancher champ par champ revient a en
       oublier un a chaque champ ajoute ; ici, ce qui arrive demain est couvert.
       Le fil ne reecrit que la barre d etapes, jamais le formulaire : le rendre
       a chaque frappe ne peut donc pas deplacer un curseur en cours de saisie. */
    var corps = document.getElementById('corps');
    if (corps && !corps._filBranche) {
      corps._filBranche = true;
      var rafraichir = function(){ self.fil(); };
      corps.addEventListener('input', rafraichir);
      corps.addEventListener('change', rafraichir);
    }
    this.aller(0);
  },
  /* ⚠ UNE ETAPE PEUT PORTER SA PROPRE REGLE D ACHEVEMENT — fait: function() —
     quand sa completude ne se lit pas dans des champs. Ajoute le 2026-08-07 pour
     la verification d un colis : elle vit dans un COMPTEUR, pas dans un
     formulaire, et « Suivant » laissait donc passer un colis a 0 sur 2. La regle
     sert aux DEUX endroits qui doivent dire la meme chose : le vert du fil, et
     le refus d avancer. refus (texte ou fonction) explique le blocage — un
     bouton qui refuse sans dire pourquoi se lit comme une panne. */
  freine: function(k){
    var e = this.etapes[k];
    if (e.fait && !e.fait()) {
      return (typeof e.refus === 'function' ? e.refus() : e.refus)
        || ('Terminez l’étape « ' + e.t + ' » pour continuer.');
    }
    return '';
  },
  faite: function(k){
    var e = this.etapes[k];
    if (e.fait && !e.fait()) return false;
    return e.obl.every(function(c){ return String(val(c) || '').trim() !== ''; });
  },
  /* ⚠ VERT = VISITEE **ET** COMPLETE, et il faut les DEUX conditions.
     — Sans « complete » : on verdirait une etape dont il manque un champ.
     — Sans « visitee » : une etape sans champ obligatoire est complete d office
       (every sur une liste vide rend TRUE), donc verte avant d etre ouverte.
     Et le vert NE DEPEND PAS de l endroit ou l on se trouve : c est tout le
     point. Le code d origine exigeait k < i, si bien que revenir a l etape 1
     eteignait des etapes reellement validees — une validite ne se perd pas parce
     qu on a recule. La pastille ✓ et la couleur suivent desormais LE MEME
     critere ; elles obeissaient a deux regles differentes, et l ecran affirmait
     donc deux choses contraires en meme temps. */
  fil: function(){
    var self = this;
    document.getElementById('pas').innerHTML = this.etapes.map(function(e, k){
      var faite = !!self.vus[k] && self.faite(k);
      var cl = k === self.i ? ' class="on"' : (faite ? ' class="fait"' : '');
      return '<button type="button" data-etape="' + k + '"' + cl + '><span class="n">'
        + (faite && k !== self.i ? '✓' : (k + 1)) + '</span> ' + esc(e.t) + '</button>';
    }).join('');
  },
  aller: function(k){
    this.i = Math.max(0, Math.min(this.etapes.length - 1, k));
    /* On marque l etape A L ARRIVEE, pas au depart : « visitee » veut dire
       « on l a eue sous les yeux ». Marquer au depart n aurait jamais marque la
       derniere, et marquer toutes celles qu on survole en cliquant le fil aurait
       verdi un chemin qu on n a pas parcouru. */
    this.vus[this.i] = true;
    var self = this;
    Array.prototype.forEach.call(document.querySelectorAll('.etape'), function(el, n){
      el.classList.toggle('on', n === self.i);
    });
    document.getElementById('btn-prec').disabled = this.i === 0;
    document.getElementById('btn-suiv').disabled = this.i === this.etapes.length - 1;
    this.fil();
    if (this.surEtape) this.surEtape(this.i);
    var p = document.querySelector('.etape.on input, .etape.on select, .etape.on textarea');
    if (p) p.focus();
  },
  bouger: function(d){
    // ⚠ On BLOQUE l avance tant que l etape est incomplete, et l on dit lequel
    // manque. Laisser passer puis refuser a l enregistrement oblige a revenir sur
    // ses pas sans savoir ou.
    if (d > 0) {
      var m = this.manquant(this.i);
      if (m) { this.pointer(m, 'Remplissez ce champ pour continuer.'); return; }
      var f = this.freine(this.i);
      if (f) { dire(f, 'att'); return; }
    }
    dire(''); this.aller(this.i + d);
  },
  manquant: function(k){
    var m = this.etapes[k].obl.filter(function(c){ return String(val(c) || '').trim() === ''; });
    return m.length ? m[0] : null;
  },
  pointer: function(id, texte){
    var e = document.getElementById(id);
    if (e) { e.classList.add('manque'); e.focus(); }
    dire(texte, 'err');
  },
  // Verifie TOUTES les etapes : on peut enregistrer depuis n importe laquelle.
  toutValide: function(){
    for (var k = 0; k < this.etapes.length; k++) {
      var m = this.manquant(k);
      if (m) { this.aller(k); this.pointer(m, 'Il manque un renseignement à l’étape « ' + this.etapes[k].t + ' ».'); return false; }
    }
    return true;
  }
};

/* ── LISTE PAGINEE ─────────────────────────────────────────────────────────
   ⚠ LE NOMBRE DE LIGNES SE MESURE, il ne se devine pas : une valeur fixe
   deborde sur un petit ecran et laisse du vide sur un grand. On calcule
   d apres la hauteur reellement disponible. */
function Pagi(zone, opts){
  this.zone = zone; this.tout = []; this.filtre = ''; this.page = 0;
  this.ligne = opts.ligne; this.parPage = opts.parPage || 0; this.surMaj = opts.surMaj || null;
}
Pagi.prototype.mesurer = function(){
  var l = this.zone.querySelector('.liste');
  if (!l) return 8;
  var h = l.clientHeight;
  return Math.max(3, Math.floor(h / 30));
};
Pagi.prototype.filtrees = function(){
  var q = this.filtre.trim().toLowerCase();
  if (!q) return this.tout;
  return this.tout.filter(function(x){ return String(x.nom || '').toLowerCase().indexOf(q) >= 0; });
};
Pagi.prototype.dessiner = function(){
  var f = this.filtrees();
  var pp = this.parPage || this.mesurer();
  var nb = Math.max(1, Math.ceil(f.length / pp));
  if (this.page >= nb) this.page = nb - 1;
  var deb = this.page * pp;
  var vues = f.slice(deb, deb + pp);
  var l = this.zone.querySelector('.liste');
  var self = this;
  l.innerHTML = vues.length ? vues.map(function(x){ return self.ligne(x); }).join('')
    : '<div class="aide" style="padding:.4rem .3rem">Aucun résultat.</div>';
  var p = this.zone.querySelector('.pagi');
  if (p) {
    p.innerHTML = '<button type="button" data-pg="-1"' + (this.page === 0 ? ' disabled' : '') + '>Précédent</button>'
      + '<button type="button" data-pg="1"' + (this.page >= nb - 1 ? ' disabled' : '') + '>Suivant</button>'
      + '<span class="pos">' + (f.length ? (deb + 1) + '–' + Math.min(deb + pp, f.length) : 0)
      + ' sur ' + f.length + (nb > 1 ? '  ·  page ' + (this.page + 1) + ' / ' + nb : '') + '</span>';
  }
  if (this.surMaj) this.surMaj();
};
Pagi.prototype.brancher = function(){
  var self = this;
  var p = this.zone.querySelector('.pagi');
  if (p) p.addEventListener('click', function(ev){
    var b = ev.target.closest('[data-pg]'); if (!b || b.disabled) return;
    self.page += parseInt(b.getAttribute('data-pg'), 10); self.dessiner();
  });
  var r = this.zone.querySelector('.rech input');
  if (r) r.oninput = function(){ self.filtre = this.value; self.page = 0; self.dessiner(); };
  // Redessiner au redimensionnement : le nombre de lignes tenables change.
  window.addEventListener('resize', function(){ self.dessiner(); });
};
`;


/* ── LE MODE JOUR DES FENÊTRES NATIVES (1.58.1) ─────────────────────────────
   Les fenêtres sont dessinées NUIT d'abord ; quand l'administration est en
   mode jour (le thème du site), la coquille pose la classe `jour` sur <html>
   et cette feuille remappe le VOCABULAIRE COMMUN des fenêtres. UNE SEULE
   SOURCE pour toutes : une couleur oubliée se corrige ici, pas fenêtre par
   fenêtre. */
const CSS_JOUR = `
/* ══ LE TITRE DES FENETRES ══════════════════════════════════════════════════
   Sa demande du 2026-08-19, capture a l appui : << l affichage des titres dans
   l ensemble des fenetres natives, je veux que ce soit plus visible et
   moderne >>, puis << prend une belle police >>.

   AVANT : font:700 .98rem/1.2 Georgia,serif — un petit serif de 15,7 px, plus
   discret que le contenu qu il annonce.

   ⚠⚠ PAS DE POLICE TELECHARGEE, ET C EST UNE CONTRAINTE, PAS UN GOUT.
   L application tourne HORS LIGNE : une police servie par un tiers ne serait pas
   la au lancement suivant sans reseau, et le titre retomberait sur un repli
   qu on n aurait jamais regarde. On prend donc la police d AFFICHAGE de Windows
   11 — Segoe UI Variable Display —, dessinee exactement pour ca : des titres
   nets, un dessin moderne, presente sur le poste. La chaine de repli descend
   proprement jusqu a system-ui.

   ⚠ CETTE REGLE VIT ICI, UNE SEULE FOIS. Les 86 declarations locales
   << .tete h1 >> ont ete retirees : la meme decision ecrite 86 fois, c est 85
   endroits qu on oubliera. CSS_JOUR est appende APRES le CSS de chaque fenetre,
   donc il commande. */
/* ══ LA POLICE DES TITRES EST EMBARQUEE ═══════════════════════════════════════
   ⚠⚠ ENTRE CES DEUX MARQUEURS, C EST DE LA MACHINE. tools/police-en-base64.js
   reecrit ce bloc a partir de src/polices/*.woff2 : ne pas l editer a la main,
   le prochain passage de l outil ecraserait la retouche.

   ⚠⚠ POURQUOI DU BASE64 ET PAS UN CHEMIN. Les 91 fenetres sont chargees par
   win.loadURL("data:text/html;..."). Un document data: a une ORIGINE OPAQUE :
   il n y a pas d URL de base, donc url("polices/x.woff2") ne resout RIEN, et un
   file:// depuis un document data: est bloque par Chromium. Les fenetres sont
   en plus en sandbox: true. La police inlinee est la seule voie qui marche.

   ⚠ ET L APPLICATION TOURNE HORS LIGNE : pas de Google Fonts, jamais. Une police
   servie par un tiers ne serait pas la au lancement suivant sans reseau, et le
   titre retomberait sur un repli que personne n aurait regarde.
   ── DEBUT POLICE TITRES ── */
@font-face{font-family:"SzTitre";font-style:normal;font-weight:400;
  font-display:block;
  src:url(data:font/woff2;base64,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) format("woff2")}
/* ── FIN POLICE TITRES ── */

/* ══ LE TITRE DES FENETRES, TROISIEME PASSE ═══════════════════════════════════
   Trois demandes le meme jour, le 2026-08-19, et il faut les garder toutes les
   trois : c est ce qui explique ou l on est arrive.
     1. << plus visible et moderne >>, << prend une belle police >>
        -> 3.53.0, Segoe UI Variable Display. Ecartee : trop neutre.
     2. << je cherche plus une police qui ressemble a Ironclad >>
        -> Ironclad est un display geometrique ART DECO, capitales seulement.
           League Spartan (ATF Spartan, 1939) avait ete posee en capitales
           espacees. Non livree : il a change d avis avant la publication.
     3. << prend cette police finalement verandah_reverie je l ai installe >>
        -> un SCRIPT CALLIGRAPHIQUE copperplate. Voir plus bas pourquoi ce
           n est PAS Verandah Reverie qui est ici.

   ⚠⚠ POURQUOI PAS VERANDAH REVERIE, ALORS QU IL L A INSTALLEE. Le fichier du
   poste est la version de DEMONSTRATION, et elle ne se contente pas d etre
   bridee juridiquement : elle REMPLACE CHACUN DE SES CHIFFRES par un encart
   publicitaire. << Commande 1042 >> se composait en << Commande >> suivi de
   quatre reclames. Les titres de fenetre sont pleins de chiffres — numero de
   commande, heure, montant : cette police aurait affiche de la publicite dans
   l administration. Et la licence l interdit deux fois, dont dans le champ de
   licence inscrit DANS la police : << obtain a commercial license >>.
   S il achete la licence, la version complete n a pas le tatouage et il n y aura
   qu a relancer « node tools/police-en-base64.js ».

   ⚠ LA LEÇON QUI VAUT POUR TOUTE POLICE GRATUITE : une version << personal use >>
   peut etre SABOTEE expres, et le sabotage se cache la ou on ne regarde pas.
   Composer une ligne AVEC CHIFFRES, accents et ponctuation avant de croire
   qu une police convient.

   PINYON SCRIPT tient donc la place : copperplate sous licence libre (OFL), donc
   redistribuable, et la plus lisible des six candidates calligraphiques a la
   taille d un bandeau — ses pleins sont plus francs, ses delies moins tenus.

   ⚠⚠ UN SCRIPT NE SE MET NI EN CAPITALES NI ESPACE. text-transform:uppercase
   jetterait les minuscules, qui sont justement la ou vivent les liaisons ; et le
   moindre letter-spacing DECOLLE les lettres les unes des autres et casse ces
   liaisons. Les deux sont donc poses EXPLICITEMENT a none/0 — pas omis, ecrits :
   c est ce qui empechera de les remettre par habitude en changeant de police.

   ⚠ 1.5rem, ET LA TAILLE A ETE MESUREE, PAS DEVINEE. Un script a une hauteur
   d oeil basse et de longues hampes : a 1.18rem il est illisible, a 1.8rem le
   bandeau des 91 fenetres grossit visiblement. Rendu aux cinq tailles, sur les
   deux fonds, avec les regles reelles de .tete — 1.5rem est le point ou le
   titre se lit sans que les hampes se coupent ni que la barre enfle.

   ⚠ LA CHAINE DE REPLI RESTE, ET CE N EST PAS DE LA POLITESSE. Si le base64 est
   un jour tronque, le titre doit rester LISIBLE au lieu de disparaitre.
   font-display:block evite le clignotement : la police est locale, prete tout
   de suite.

   ⚠ CETTE REGLE VIT ICI, UNE SEULE FOIS. Les 86 declarations locales << .tete h1 >>
   ont ete retirees en 3.53.0 : la meme decision ecrite 86 fois, c est 85 endroits
   qu on oubliera. CSS_JOUR est appende APRES le CSS de chaque fenetre, donc il
   commande. */
.tete h1{margin:0;
  font-family:"SzTitre","Segoe UI Variable Display","Segoe UI",Georgia,serif;
  font-size:1.5rem;font-weight:400;line-height:1.25;
  letter-spacing:0;text-transform:none;
  color:#f4f7fb}
html.jour .tete h1{color:#141c28}

/* ⚠⚠ TOUT PICTOGRAMME EST MONOCHROME, SANS EXCEPTION — ET LA REGLE EST ICI, UNE
   SEULE FOIS. Sa regle, posee le 2026-08-19 devant une capture : << les emojis
   sont pas encore en noir et blanc, sa devrais toujours etre comme sa >>.

   ⚠ POURQUOI DANS LE SOCLE ET PAS DANS CHAQUE FENETRE. Premiere ecriture : je
   l avais posee dans les 88 feuilles de style, une copie chacune. C est
   exactement le defaut que ce depot traque — la meme decision ecrite quatre-vingt
   -huit fois, dont quatre-vingt-sept qu on oubliera de corriger le jour ou le
   gris ne convient plus. Les 91 fenetres importent CSS_JOUR ou CSS_SOCLE, et
   CSS_JOUR entre dans les deux : une ligne ici les couvre toutes.

   ⚠ MODE D EMPLOI, ET IL N Y EN A QU UN : tout ce qui affiche un emoji le met
   dans <span class="ic">. Rien a declarer, rien a importer.

   ⚠ CE QUE CETTE REGLE NE PEUT PAS FAIRE : un emoji pose par textContent n a pas
   d element a lui, donc pas de filtre possible. Passer ces endroits en innerHTML
   serait une INJECTION la ou un nom d usager est interpole — voir la liste qui
   reste dans le carnet.

   ⚠⚠ ET AUCUN ACCENT GRAVE DANS CE COMMENTAIRE : il vit dans un litteral de
   gabarit, et un seul refermerait CSS_JOUR — donc les 91 fenetres d un coup.
   Mordu trois fois le 2026-08-19, dont ici. */
.ic{display:inline-block;filter:grayscale(1) brightness(1.6);opacity:.9;font-style:normal}

/* ⚠⚠ LA LISTE DEROULEE D UN <select> EST DESSINEE PAR LE SYSTEME, PAS PAR NOUS.
   Elle ne prend NI le fond ni la couleur de la fenetre : les fenetres ecrivent
   << select{color:#e8edf5;background:rgba(255,255,255,.05)} >>, et un fond
   TRANSPARENT pose sur du blanc redonne du blanc. On obtenait donc, en mode
   nuit, une liste blanche a texte gris tres pale — illisible (releve le
   2026-08-09 sur le filtre de statut des Factures).
   Remede : les <option> portent un fond OPAQUE et leur propre couleur. Ces deux
   regles-ci ne sont PAS sous html.jour — elles valent en mode nuit, qui est le
   defaut ; la bascule jour les reprend plus bas. Comme cette feuille est ajoutee
   a TOUTES les fenetres, une liste deroulante ecrite demain est couverte
   d office. */
select{color-scheme:dark}
select option,select optgroup{background:#16202f;color:#e8edf5}
html.jour select{color-scheme:light}
html.jour select option,html.jour select optgroup{background:#ffffff;color:#1d2433}

html.jour body{background:#f4f2ec;color:#1d2433}
html.jour .tete{background:linear-gradient(180deg,#ffffff,#f4f2ec);border-bottom-color:rgba(15,23,42,.12)}
html.jour .tete .sous{color:#414e66}
html.jour .tete .ic{filter:grayscale(1);opacity:.8}
html.jour .tuile .lbl{filter:grayscale(1)}
html.jour .corps::-webkit-scrollbar-thumb{background:rgba(15,23,42,.22)}
html.jour .barreoutils .droite{color:#414e66}
html.jour input,html.jour select,html.jour button,html.jour textarea{
  color:#1d2433;background:#ffffff;border-color:rgba(15,23,42,.18)}
html.jour button:hover:not(:disabled){background:#efece4}
html.jour button.actif{border-color:#8a6a3e;background:rgba(138,106,62,.12)}
html.jour button.prim{background:#C49A6C;border-color:#C49A6C;color:#241703}
html.jour button.prim:hover:not(:disabled){background:#d4ad80}
html.jour button.danger{border-color:rgba(185,28,28,.45);color:#b91c1c}
html.jour button .n{background:rgba(15,23,42,.08);color:#1d2433}
html.jour button .n.hi{background:rgba(180,120,10,.18);color:#92610c}
html.jour .carte,html.jour .ligne,html.jour .tuile,html.jour .panneau{
  background:#ffffff;border-color:rgba(15,23,42,.12)}
html.jour .tuile:hover,html.jour .ligne:hover{border-color:#8a6a3e}
html.jour .carte h2{color:#414e66}
html.jour thead th{color:#414e66;border-bottom-color:rgba(15,23,42,.14)}
html.jour tbody td{border-top-color:rgba(15,23,42,.08)}
html.jour tbody tr:hover td{background:rgba(15,23,42,.045)}
html.jour tfoot td{border-top-color:rgba(15,23,42,.25)}
html.jour .dt,html.jour .sub,html.jour .pagi,html.jour .vide,html.jour .msg{color:#414e66}
html.jour .msg.err{color:#b91c1c}
html.jour .msg.bon{color:#15803d}
html.jour .num{color:#1d2433}
html.jour .sku,html.jour .etoile{color:#8a6a3e}
html.jour .prixbarre{color:#414e66}
html.jour .pill.bon{background:rgba(21,128,61,.12);color:#15803d}
html.jour .pill.att{background:rgba(180,120,10,.14);color:#92610c}
html.jour .pill.err{background:rgba(185,28,28,.1);color:#b91c1c}
html.jour .pill.info{background:rgba(30,64,175,.1);color:#1e40af}
html.jour .pill.neutre{background:rgba(91,103,121,.12);color:#414e66}
html.jour .pied{background:#efece4;border-top-color:rgba(15,23,42,.12)}
html.jour .voile{background:rgba(29,36,51,.35)}
html.jour .boite{background:#ffffff;border-color:rgba(15,23,42,.16);color:#1d2433}
html.jour .boite .grille{border-color:rgba(15,23,42,.1)}
html.jour .boite .grille .l{color:#414e66}
html.jour .boite .texte{background:rgba(15,23,42,.03);border-color:rgba(15,23,42,.1)}
html.jour .boite .reponse{background:rgba(138,106,62,.08);border-left-color:#8a6a3e}
html.jour .boite .rang{border-top-color:rgba(15,23,42,.08)}
html.jour .stats .s{background:rgba(15,23,42,.05)}
html.jour .stats .s .n{color:#8a6a3e}
html.jour .stats .s .l{color:#414e66}
html.jour .avis{background:rgba(180,120,10,.1);border-color:rgba(180,120,10,.4);color:#7a5410}
html.jour .fileligne{border-top-color:rgba(15,23,42,.08)}
html.jour .tuile .lbl,html.jour .tuile .sub{color:#414e66}
html.jour .tuile .val{color:#1d2433}
html.jour .tuile .val.att{color:#92610c}
html.jour .tuile .val.err{color:#b91c1c}
/* Vocabulaire de la fenetre Commandes/Expeditions (en-tete collant, etats
   bordes, jetons de filtre, priorites) — trop pale en jour (2026-08-09). */
html.jour thead th{background:#e9e5da}
html.jour .liste::-webkit-scrollbar-thumb{background:rgba(15,23,42,.22)}
html.jour tbody .num{color:#7a5a2e}
html.jour tbody .det,html.jour .det{color:#414e66}
html.jour .filtres .lbl{color:#414e66}
html.jour .jetons button.on{background:rgba(138,106,62,.14);border-color:#8a6a3e;color:#5c4620}
html.jour button.prio{color:#414e66;border-color:rgba(180,120,10,.5)}
html.jour button.prio.on{background:rgba(180,120,10,.16);border-color:#b47a0a;color:#7a5410;
  box-shadow:0 0 0 1px rgba(180,120,10,.3) inset}
html.jour button.traite{background:#fef3c7;color:#92400e;border-color:#d97706}
html.jour .et{color:#414e66;border-color:rgba(15,23,42,.28)}
html.jour .et.vert{border-color:rgba(21,128,61,.55);color:#15803d}
html.jour .et.bleu{border-color:rgba(30,64,175,.5);color:#1e40af}
html.jour .et.jaune{border-color:rgba(180,120,10,.55);color:#92610c}
html.jour .et.rouge{border-color:rgba(185,28,28,.5);color:#b91c1c}
html.jour .badge2{background:rgba(15,23,42,.1);color:#1d2433}
html.jour .bloc h3{color:#414e66}
html.jour .bloc .mut{color:#414e66}
html.jour tbody tr.attente{background:rgba(124,92,255,.08)}
html.jour input,html.jour select{background:#ffffff}
`;

/* ── PLEIN ÉCRAN DES ASSISTANTS ET DES PANNEAUX (demandé le 2026-08-13) ──────
   DEUX effets, et le second compte autant que le premier : la boîte prend toute
   la fenêtre, ET le texte grossit. Agrandir un panneau sans grossir ce qu'il
   contient ne fait qu'étirer du vide — c'est la lisibilité qu'on vient chercher
   en passant en plein écran, pas la surface.

   ⚠ LE GROSSISSEMENT PASSE PAR LA RACINE, PAS PAR DES TAILLES RÉÉCRITES. Toutes
   les fenêtres dimensionnent en `rem` ; changer la police de <html> les emmène
   donc TOUTES d'un coup, sans qu'aucune ait à retoucher sa feuille — et revenir
   à la taille normale se fait en retirant une classe, donc il n'y a rien à
   défaire champ par champ. Écrire des tailles « en plein écran » aurait exigé de
   les tenir à jour dans chaque fenêtre, à perpétuité.

   Cette feuille est jointe à TOUTES les fenêtres (via CSS_JOUR) : une surcouche
   écrite demain n'a qu'à appeler szPleinBasculer pour en hériter. */
const CSS_PLEIN = `
/* DEUX classes, et il en faut deux : « sz-zoom » est la surcouche mise en plein
   écran par son bouton, « sz-zoom-fen » est la FENÊTRE passée en plein écran par
   le système. Une seule classe partagée ferait que fermer une surcouche annule
   le grossissement d'une fenêtre encore en plein écran — l'écran rapetisserait
   sans que rien ne l'explique. Même valeur, donc elles ne se cumulent pas. */
html.sz-zoom, html.sz-zoom-fen{font-size:112.5%}
.sz-plein{
  position:fixed!important; inset:0!important;
  width:100%!important; max-width:none!important;
  height:100%!important; max-height:none!important;
  border-radius:0!important; border-width:0!important;
}
/* Le bouton de bascule : discret, à côté de « Fermer ». */
.sz-btnplein{font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-right:.35rem;
  border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);
  color:#e8edf5;cursor:pointer;-webkit-user-select:none;user-select:none}
.sz-btnplein:hover{background:rgba(255,255,255,.09)}
html.jour .sz-btnplein{color:#1d2433;background:#ffffff;border-color:rgba(15,23,42,.18)}
html.jour .sz-btnplein:hover{background:#efece4}
/* Surcouches SANS barre d'en-tête : le bouton se pose en surimpression au coin.
   L'installateur réserve la place à droite du titre pour qu'il ne passe pas
   dessous. */
.sz-btnplein.flottant{position:absolute;top:.55rem;right:.6rem;margin-right:0;z-index:3}
/* Le bouton du plein écran DE LA FENÊTRE, posé dans la barre de titre de chaque
   fenêtre par son installateur (voir JS_FENPLEIN).
   ⚠ IL NE PEUT PAS EMPRUNTER la règle « .tete .outils button » : elle est locale
   à produit.js, la seule fenêtre qui avait son bouton écrit à la main. Une règle
   locale ne s'applique pas à un bouton posé dans les 82 autres.
   ⚠ « user-select:none » comme tous les contrôles cliquables : la sélection du
   texte avalait le clic de la souris (le clic sur le libellé ne faisait rien,
   à côté du libellé fonctionnait). */
.sz-btnfen{flex:0 0 auto;font:inherit;font-size:.78rem;line-height:1.35;padding:.14rem .45rem;
  margin-left:.4rem;border:1px solid rgba(255,255,255,.16);border-radius:7px;
  background:rgba(255,255,255,.05);color:#e8edf5;cursor:pointer;
  -webkit-user-select:none;user-select:none}
.sz-btnfen:hover{background:rgba(255,255,255,.09)}
html.jour .sz-btnfen{color:#1d2433;background:#ffffff;border-color:rgba(15,23,42,.18)}
html.jour .sz-btnfen:hover{background:#efece4}
/* Message posé DANS la surcouche par szDire, quand la fenêtre n'a pas déjà sa
   propre zone (.msgsur). */
.sz-msgauto{margin-top:.75rem;padding:.5rem .7rem;border-radius:8px;font-size:.8rem;
  line-height:1.5;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:#cbd8e6}
.sz-msgauto.err{background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.35);color:#fca5a5}
.sz-msgauto.bon{background:rgba(22,163,74,.14);border-color:rgba(22,163,74,.32);color:#6ee7a0}
.sz-msgauto.att{background:rgba(234,179,8,.12);border-color:rgba(234,179,8,.35);color:#f0d6a0}
html.jour .sz-msgauto{background:rgba(15,23,42,.05);border-color:rgba(15,23,42,.14);color:#1d2433}
`;

/* ══ LES JEUX DE COULEURS (#26) ═══════════════════════════════════════════════
   L ancien reglage << couleur de la barre laterale gauche >> ne s appliquait
   plus a rien : il teintait la barre de l ecran WEB, disparue avec le lot 5.
   Et il ne changeait qu une bande — les boutons restaient dores, le survol
   blanc, les menus identiques. Sa demande : que le theme prenne AUSSI les
   BOUTONS, le SURVOL et les MENUS.

   ⚠⚠ LE VRAI TRAVAIL N EST PAS LA PALETTE, C EST L ACCROCHE. Chaque fenetre
   ecrit ses couleurs EN DUR (#0e1522, #16202f, #c9a97e, rgba(255,255,255,.1)
   au survol...). Un theme n a d effet que si ces valeurs passent par des
   variables. On ne reecrit pas les quarante fenetres : on REDECLARE ici les
   memes selecteurs avec des variables, et comme ce bloc est appende APRES le
   CSS de chaque fenetre, il gagne par ordre de cascade. C est exactement le
   mecanisme deja eprouve par CSS_JOUR.

   ⚠ PORTEE ASSUMEE : les themes habillent le mode SOMBRE, celui de tous les
   jours. En mode JOUR, les regles `html.jour` de CSS_JOUR sont plus
   specifiques et gagnent : l application reste claire et lisible, sans
   teinte. Habiller aussi le mode jour demanderait une seconde palette par
   theme — a faire si le besoin vient, pas avant.

   ⚠ AUCUN THEME NE TOUCHE AU ROUGE, A L AMBRE NI AU VERT des etats : une
   erreur doit rester rouge dans tous les jeux de couleurs. Teinter un
   avertissement en violet parce qu on a choisi << Violet >> le rendrait
   invisible en tant qu avertissement.                                        */
const CSS_THEMES = `
:root{
  --sz-fond:#0e1522; --sz-fond2:#131c2b; --sz-pied:#0b1220;
  --sz-surface:#16202f; --sz-surface2:#141d2c;
  --sz-bord:rgba(255,255,255,.09); --sz-bord-fort:rgba(255,255,255,.16);
  --sz-texte:#e8edf5; --sz-attenue:#8fa1b8;
  --sz-accent:#c9a97e; --sz-accent-fort:#a3824f; --sz-accent-txt:#17202c;
  --sz-accent-doux:rgba(201,169,126,.16);
  --sz-btn:rgba(255,255,255,.05); --sz-survol:rgba(255,255,255,.1);
}
html[data-sz-theme="ocean"]{
  --sz-fond:#0a1620; --sz-fond2:#0f2030; --sz-pied:#081219;
  --sz-surface:#122536; --sz-surface2:#102232;
  --sz-accent:#38bdf8; --sz-accent-fort:#0ea5e9; --sz-accent-txt:#05202e;
  --sz-accent-doux:rgba(56,189,248,.16);
}
html[data-sz-theme="violet"]{
  --sz-fond:#140f22; --sz-fond2:#1d1533; --sz-pied:#100c1c;
  --sz-surface:#1f1838; --sz-surface2:#1c1633;
  --sz-accent:#a78bfa; --sz-accent-fort:#8b5cf6; --sz-accent-txt:#160f2b;
  --sz-accent-doux:rgba(167,139,250,.18);
}
html[data-sz-theme="ardoise"]{
  --sz-fond:#0f172a; --sz-fond2:#16213c; --sz-pied:#0b1120;
  --sz-surface:#1b263f; --sz-surface2:#182238;
  --sz-accent:#7dd3fc; --sz-accent-fort:#38bdf8; --sz-accent-txt:#0b2233;
  --sz-accent-doux:rgba(125,211,252,.16);
}
html[data-sz-theme="graphite"]{
  --sz-fond:#121212; --sz-fond2:#1c1c1c; --sz-pied:#0d0d0d;
  --sz-surface:#1e1e1e; --sz-surface2:#1a1a1a;
  --sz-bord:rgba(255,255,255,.1); --sz-bord-fort:rgba(255,255,255,.18);
  --sz-accent:#fbbf24; --sz-accent-fort:#f59e0b; --sz-accent-txt:#211703;
  --sz-accent-doux:rgba(251,191,36,.16);
}
html[data-sz-theme="emeraude"]{
  --sz-fond:#08170f; --sz-fond2:#0d2318; --sz-pied:#06120b;
  --sz-surface:#102a1c; --sz-surface2:#0e2519;
  --sz-accent:#34d399; --sz-accent-fort:#10b981; --sz-accent-txt:#042315;
  --sz-accent-doux:rgba(52,211,153,.16);
}

/* ── L ACCROCHE : les memes selecteurs, en variables ─────────────────────── */
body{background:var(--sz-fond);color:var(--sz-texte)}
.tete{background:linear-gradient(180deg,var(--sz-fond2),var(--sz-fond));
  border-bottom-color:var(--sz-bord)}
.pied{background:var(--sz-pied);border-top-color:var(--sz-bord)}
.carte,.tuile,.boite,.ctx,.lotc,.repcarte,.phvig,.etapef{background:var(--sz-surface);
  border-color:var(--sz-bord)}
.voile .boite{background:var(--sz-surface2)}
.dt,.mut,.note,.aide,.sous,.phinfo,.msg{color:var(--sz-attenue)}
input,select,textarea,button{color:var(--sz-texte);background:var(--sz-btn);
  border-color:var(--sz-bord-fort)}
button:hover:not(:disabled),.ctx button:hover{background:var(--sz-survol);
  border-color:var(--sz-accent)}
input:focus,select:focus,textarea:focus,button:focus{border-color:var(--sz-accent);outline:none}
button.prim,.jeton.prim,button.paie{background:var(--sz-accent);border-color:var(--sz-accent);
  color:var(--sz-accent-txt);font-weight:600}
button.prim:hover:not(:disabled),.jeton.prim:hover:not(:disabled){background:var(--sz-accent-fort);
  border-color:var(--sz-accent-fort)}
button.actif,.jeton.on,.mini.actif{border-color:var(--sz-accent);background:var(--sz-accent-doux);
  color:var(--sz-texte)}
.onglets button.on{color:var(--sz-accent);border-bottom-color:var(--sz-accent)}
.pill.acc,.badge2.or{background:var(--sz-accent-doux);color:var(--sz-accent)}
.cad.mine,.crochet code,.stats .s .n{color:var(--sz-accent)}
.jauge i,.sz-lots .jauge i{background:var(--sz-accent)}
.sz-lots{background:linear-gradient(180deg,var(--sz-fond2),var(--sz-surface));
  border-top-color:var(--sz-accent);color:var(--sz-texte)}
.phvig.pris{border-color:var(--sz-accent);box-shadow:0 0 0 1px var(--sz-accent) inset}
.phvig:hover,.ligne:hover,.repcarte:hover{border-color:var(--sz-accent)}
.portee{background:var(--sz-accent-doux);border-color:var(--sz-accent);color:var(--sz-texte)}
`;

module.exports = { CSS_SOCLE: CSS_SOCLE + CSS_JOUR + CSS_PLEIN + CSS_VERROUS + CSS_LOTS + CSS_THEMES,
  CSS_JOUR: CSS_JOUR + CSS_PLEIN + CSS_VERROUS + CSS_LOTS + CSS_THEMES,
  JS_SOCLE, JS_ACTIVITE, JS_DIRE, CSS_THEMES };
