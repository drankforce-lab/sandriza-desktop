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
.tete h1{margin:0;
  font-family:"Segoe UI Variable Display","Segoe UI Semibold","Segoe UI",
    system-ui,-apple-system,Roboto,sans-serif;
  font-size:1.18rem;font-weight:600;line-height:1.2;letter-spacing:-.015em;
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
