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

/* ⚠ LES ICONES TRACEES. Voir la regle de `.ico` dans CSS_JOUR : un trace, une
   seule couleur, aucun fond. Le dessin est celui de la table `IC` d admin.js,
   pour qu un ecran se reconnaisse du site a la fenetre.
   ⚠ AUCUN ACCENT GRAVE ICI NON PLUS : ces chaines partent dans des gabarits. */
const ICO = {
  /* ⚠ UN BADGE, ET C EST POUR NE PAS CONFONDRE TROIS ECRANS. « Acces
     Utilisateurs » portait le meme groupe de bustes que « Clients » — or l un
     gere le PERSONNEL et l autre la CLIENTELE. Et trois ecrans de securite
     (Acces, Mon profil, Reglages) se seraient partage deux boucliers. Chacun a
     donc le sien : badge ici, `staffaccess` (bouclier + personne) pour Mon
     profil, `securite` (bouclier + cadenas) pour les Reglages. */
  acces: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9.3" cy="10" r="2.4"/><path d="M5.7 16.6a4 4 0 017.2 0"/><line x1="16" y1="9.5" x2="18.8" y2="9.5"/><line x1="16" y1="13" x2="18.8" y2="13"/></svg>',
  acctlink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 13.5a3.5 3.5 0 005 0l2.5-2.5a3.54 3.54 0 00-5-5l-1 1"/><path d="M14.5 10.5a3.5 3.5 0 00-5 0L7 13a3.54 3.54 0 005 5l1-1"/><rect x="15.5" y="15.5" width="7" height="5.5" rx="1.2"/><path d="M17.4 15.5v-1.3a1.6 1.6 0 013.2 0v1.3"/></svg>',
  analytics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  apparence: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 010 18z" fill="currentColor" stroke="none"/></svg>',
  archives: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v9a2 2 0 002 2h12a2 2 0 002-2V9"/><line x1="10" y1="13" x2="14" y2="13"/></svg>',
  argent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M14.8 9.2a3 3 0 00-2.8-1.7c-1.7 0-2.8.9-2.8 2.2 0 3 5.8 1.6 5.8 4.6 0 1.4-1.2 2.4-3 2.4a3.2 3.2 0 01-3-1.8"/><line x1="12" y1="5.6" x2="12" y2="18.4"/></svg>',
  bankrec: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="M7 15h2m4 0h2"/><path d="M8 20l2-3m4 3l-2-3"/></svg>',
  barcode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="1"/><line x1="7" y1="9" x2="7" y2="15"/><line x1="10" y1="9" x2="10" y2="15"/><line x1="13.5" y1="9" x2="13.5" y2="15"/><line x1="17" y1="9" x2="17" y2="15"/></svg>',
  billing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  blacklist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
  catalogio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h4"/><polyline points="14 3 14 8 19 8"/><path d="M19 8v3"/><path d="M14 18h7"/><polyline points="18 15 21 18 18 21"/></svg>',
  // ⚠ Pas d entree dans `IC` : l assistant IA n existe pas cote site. Deux lobes
  // ouverts plutot qu un cerveau detaille — a 17 px, le detail devient une tache.
  cerveau: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.6a2.6 2.6 0 00-4.8-1.1A3 3 0 005 6.6a3 3 0 00-1.1 4.6 2.9 2.9 0 001.4 4.5A2.7 2.7 0 009 19.9a2.6 2.6 0 003-1.3z"/><path d="M12 4.6a2.6 2.6 0 014.8-1.1A3 3 0 0119 6.6a3 3 0 011.1 4.6 2.9 2.9 0 01-1.4 4.5A2.7 2.7 0 0115 19.9a2.6 2.6 0 01-3-1.3z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
  // Une VRAIE cle. `acctlink` porte deja un cadenas sur un maillon — c est le
  // rattachement d un compte, pas les cles d interface.
  cles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.2"/><line x1="10.5" y1="12.5" x2="20.5" y2="2.5"/><line x1="17" y1="6" x2="19.5" y2="8.5"/><line x1="14.3" y1="8.7" x2="16.8" y2="11.2"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>',
  collections: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
  config: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="8" cy="6" r="2.25" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="2.25" fill="currentColor" stroke="none"/><circle cx="8" cy="18" r="2.25" fill="currentColor" stroke="none"/></svg>',
  customers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
  depenses: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 010-4h12v4"/><path d="M4 6v12a2 2 0 002 2h14v-4"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>',
  explorateur: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><circle cx="9.5" cy="12" r="1.3"/><path d="M19 17l-4-4-3 3-1.5-1.5L7 18"/></svg>',
  fusee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.2c3 2.7 4.6 6.3 4.6 10.3l-1.8 3H9.2l-1.8-3C7.4 8.5 9 4.9 12 2.2z"/><circle cx="12" cy="9.4" r="1.8"/><path d="M9.3 15.5L6 18l1.5 3.5"/><path d="M14.7 15.5L18 18l-1.5 3.5"/></svg>',
  gabarit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></svg>',
  giftcards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>',
  homepage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 16l-5-5-5 5-2-2-6 6"/></svg>',
  impot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  imprimante: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 16h10v5H7z"/></svg>',
  inventory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8M10 12h4"/></svg>',
  invmeta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
  journaux: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4H7a2 2 0 00-2 2v13a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-2"/><rect x="9" y="2.5" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>',
  // Un maillon NU. `acctlink` porte un cadenas — il dit « compte rattache »,
  // pas « lien ». Deux dessins proches disent deux choses differentes.
  lien: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.5.6l3-3a5 5 0 00-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 00-7.5-.6l-3 3a5 5 0 007 7L12.2 18.7"/></svg>',
  liquidation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 002.5 2.5z"/></svg>',
  loupe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="16" y1="16" x2="21" y2="21"/></svg>',
  loyalty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  mktstats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>',
  navmenu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="16" y2="12"/><polyline points="18 15 21 18 18 21"/></svg>',
  newsletter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  // Un crayon SUR la feuille. Une feuille seule serait `pages` ou `impot` — trois
  // ecrans qui se ressembleraient a l en-tete.
  note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5"/><path d="M18.4 2.6a2 2 0 012.8 2.8L12.8 13.8l-3.5 1 1-3.5z"/></svg>',
  nuage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 000-9h-.3A6 6 0 005.9 11.6 3.7 3.7 0 006.5 19z"/></svg>',
  orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  pages: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
  payments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="7" y1="15" x2="11" y2="15"/><line x1="15" y1="15" x2="17" y2="15"/></svg>',
  // Une silhouette DEBOUT, bras ecartes : un mannequin. `customers` est un groupe
  // de bustes — ce n est pas la meme chose qu un modele de defile.
  personne: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5.2" r="3"/><line x1="12" y1="8.2" x2="12" y2="15.5"/><line x1="7.5" y1="11" x2="16.5" y2="11"/><path d="M9.2 21.5L12 15.5l2.8 6"/></svg>',
  // ⚠ LE PIED DE PAGE, PAS UN PIED. Le pictogramme remplace etait 🦶, et un pied
  // dessine a 17 px ne se lit pas ; la bande BASSE d une page, si — et c est ce
  // que l ecran regle. On remplace ce que l image VEUT DIRE, pas sa forme.
  pied: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="6.5" y1="19" x2="11" y2="19"/><line x1="14" y1="19" x2="17.5" y2="19"/></svg>',
  products: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7" stroke-width="3"/></svg>',
  promoprint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4z"/><line x1="14" y1="6" x2="14" y2="18" stroke-dasharray="2 2"/></svg>',
  promotions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
  reco: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.8L20 10.7l-4.9 3.6L17 20l-5-3.6L7 20l1.9-5.7L4 10.7l6.1-1.9z"/></svg>',
  refunds: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.82"/></svg>',
  returns: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>',
  sauvegarde: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  secincident: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="16" r="0.6" fill="currentColor" stroke="none"/></svg>',
  securite: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect x="9" y="10.5" width="6" height="4.5" rx="1"/><path d="M10.2 10.5V9.2a1.8 1.8 0 013.6 0v1.3"/></svg>',
  shipping: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  social: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  staffaccess: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="10" r="2.3"/><path d="M8.5 16.2a3.5 3.5 0 017 0"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  studio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l9-9"/><path d="M14 4l1.2 2.6L18 8l-2.8 1.4L14 12l-1.2-2.6L10 8l2.8-1.4z"/><path d="M19 15l.7 1.5L21 17l-1.3.6L19 19l-.7-1.4L17 17l1.3-.5z"/></svg>',
  suppliers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><rect x="9" y="12" width="6" height="9"/><path d="M3 9v11"/><path d="M21 9v11"/></svg>',
  support: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  tableau: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
  telephone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .3 1.9.6 2.8a2 2 0 01-.5 2.1L8.1 9.8a16 16 0 006 6l1.2-1.1a2 2 0 012.1-.5c.9.3 1.8.5 2.8.6a2 2 0 011.8 2z"/></svg>',
  // ⚠ L ANSE EST OUVERTE, ET C EST LE SENS DE L ECRAN. `securite` porte un cadenas
  // FERME (ce qui est protege) ; ici on gere les verrous qu on LEVE. Deux cadenas
  // identiques auraient dit le contraire l un de l autre.
  verrou: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="11" width="14" height="10" rx="2"/><path d="M7.5 11V7a5 5 0 019.9-1"/></svg>',
};

/* ══ LE BROUILLON D UNE FENETRE D EDITION ═══════════════════════
 * ⚠⚠ POURQUOI UNE AIDE PARTAGEE PLUTOT QU UN TROISIEME BLOC A LA MAIN.
 * L inventaire du 2026-08-20 a compte DEUX fenetres sur 88 protegees contre la
 * perte de saisie (l assistant Produit, les Depenses) et une vingtaine de
 * formulaires longs qui ne le sont pas. Les deux blocs existants ont chacun paye
 * ses erreurs ; les recopier vingt fois, c est vingt occasions d en oublier une.
 * Les cinq regles qu ils ont apprises sont donc ICI, une fois :
 *
 *  ① ETRANGLE SUR GESTE, JAMAIS SUR MINUTERIE SEULE. Une ecriture periodique
 *    passe pour de l activite et garde la session ouverte toute la nuit (vecu,
 *    corrige en 1.20.8 : le minuteur d inactivite n ecoute que la page).
 *  ② IMMEDIAT AVANT TOUTE FERMETURE, et LES VALEURS SONT PRISES MAINTENANT.
 *    C etait le defaut n°1 des Depenses : l ecriture etait differee de 3 s et la
 *    fermeture vidait le formulaire avant que la minuterie ne parte. Seul ce qui
 *    avait ete ecrit AVANT survivait — la categorie, et rien d autre.
 *  ③ UN FORMULAIRE VIDE NE MERITE AUCUNE QUESTION.
 *  ④ ON DEMANDE, ON NE DECIDE PAS. Fermer en gardant en silence est aussi
 *    surprenant que fermer en jetant : dans les deux cas la personne ne sait pas
 *    ce qu il est advenu de son travail.
 *  ⑤ UN ECHEC D ENREGISTREMENT SE DIT. Se croire a l abri est pire que de savoir
 *    qu on ne l est pas.
 *
 * ⚠ LE BROUILLON NE VIT PAS ICI. Une fenetre native est chargee en
 * data:text/html : son origine est null et localStorage y leve SecurityError
 * (MESURE — banc-executer-page.js en fait un cas d epreuve). Il vit dans le
 * stockage du SITE, par le pont, sous une entree par (portee, cle) et par profil.
 *
 * ⚠ LA QUESTION DE FERMETURE N EST PAS DESSINEE ICI, et c est le point le plus
 * important du montage. Le bouton << Fermer >> dessine dans la page passe par
 * szPont.fermer() → pont:fermer → win.close(), et le bouton X du cadre de Windows
 * arrive au MEME endroit : le garde de close() dans ouvrirNative. Une question
 * dessinee ici ferait DEUX habillages pour la meme question, dont un seul
 * couvrirait le X — c est-a-dire le chemin le plus courant. La page se contente
 * donc de LEVER UN DRAPEAU (szPont.brouillonSale) et de repondre a deux appels
 * que le principal lui fait au moment de fermer.
 *
 * MODE D EMPLOI, dans la fenetre :
 *   szBrouillonBrancher({
 *     portee: 'client',                  // nomme le formulaire
 *     cle:     function(){ return ID || '__new__'; },   // nomme CE QU ON EDITE
 *     actif:   function(){ return !!FORM; },            // un formulaire est ouvert
 *     rempli:  function(){ return ...; },               // y a-t-il quelque chose a perdre
 *     valeurs: function(){ return {...}; },             // SYNCHRONE, appele MAINTENANT
 *     remplir: function(v){ ... },                      // restaure
 *     ttlMin:  720
 *   });
 *   szBrouillonEcouter();      // une fois : delegue sur document, survit aux redessins
 *   szBrouillonProposer();     // a l ouverture du formulaire
 *   szBrouillonJeter();        // apres un enregistrement REUSSI
 */
const JS_BROUILLON = `
var _BR = null;          // la declaration de la fenetre
var _BR_T = null;        // minuterie de l ecriture differee
var _BR_DERNIER = '';    // derniere valeur ecrite : on n envoie rien d inutile
var _BR_SALE = false;    // etat annonce a la coquille
var _BR_ECOUTE = false;
/* ⚠ LE TIROIR DE CETTE FENETRE. Appris a l ouverture, pendant que la session est
   encore la, et repasse a chaque ecriture. C est ce qui fait qu une saisie
   survit a une session tombee ET revient a la bonne personne — voir la note de
   _brsProfil dans pont.js. */
var _BR_PROFIL = '';

function szBrouillonBrancher(cfg){ _BR = cfg || null; }

function _brPont(){ return (window.szPont && window.szPont.appeler) ? window.szPont : null; }
function _brActif(){
  if (!_BR || !_brPont()) return false;
  try { return _BR.actif ? !!_BR.actif() : true; } catch (e) { return false; }
}
function _brRempli(){ try { return !!(_BR && _BR.rempli && _BR.rempli()); } catch (e) { return false; } }
function _brCle(){
  try { return String((_BR && _BR.cle ? _BR.cle() : '') || '') || '__new__'; }
  catch (e) { return '__new__'; }
}
function _brValeurs(){ try { return (_BR && _BR.valeurs) ? _BR.valeurs() : null; } catch (e) { return null; } }

/* Le drapeau vers la coquille. C est LUI qui fait poser la question au bouton X
   du cadre : sans lui, le principal ferme la fenetre sans rien demander et
   l ecriture differee n a jamais lieu. */
function _brSale(on){
  var v = !!on;
  if (v === _BR_SALE) return;
  _BR_SALE = v;
  try { if (window.szPont && window.szPont.brouillonSale) window.szPont.brouillonSale(v); } catch (e) {}
}
function szBrouillonEtat(){ return _BR_SALE; }

function _brEcrire(v){
  var txt = '';
  try { txt = JSON.stringify(v); } catch (e) { txt = ''; }
  /* ON N ENVOIE QUE SI QUELQUE CHOSE A CHANGE : un brouillon peut porter une
     image en base64, et le pont n a pas a la reporter a chaque frappe. */
  if (txt && txt === _BR_DERNIER) return Promise.resolve({ ok: true });
  return _brPont().appeler('brouillon:ecrire', _BR.portee, _brCle(), v, _BR.ttlMin || 0, _BR_PROFIL)
    .then(function(r){
      if (r && r.ok) { _BR_DERNIER = txt; return r; }
      /* ⚠ UN ECHEC SE DIT, ET ON NOMME LA VRAIE RAISON : << trop gros >> et
         << stockage plein >> ne se corrigent pas de la meme facon (enregistrer
         maintenant, ou fermer un autre formulaire). Les confondre ferait chercher
         au mauvais endroit.
         ⚠ UN ECHEC SE DIT. Le site avale l echec du stockage plein ; ici on le
         montre, sinon on croit son travail a l abri alors qu il ne l est pas. */
      if (typeof szDire === 'function') {
        szDire(r && r.motif === 'trop_gros'
          ? '⚠ Cette saisie est trop volumineuse pour etre gardee en brouillon (images). Enregistrez pour ne rien perdre.'
          : '⚠ Le brouillon n’a pas pu être conservé (stockage du poste plein).', 'att');
      }
      return r || { ok: false };
    }, function(){ return { ok: false }; });
}

/* Sur geste, etrangle a 3 s. ⚠ Le drapeau, lui, est leve TOUT DE SUITE : entre la
   frappe et l ecriture il y a trois secondes pendant lesquelles le bouton X doit
   deja poser la question. */
function szBrouillonPoser(){
  if (!_brActif()) { _brSale(false); return; }
  _brSale(_brRempli());
  clearTimeout(_BR_T);
  _BR_T = setTimeout(function(){ _BR_T = null; szBrouillonMaintenant(); }, 3000);
}

/* Immediat, et les valeurs sont prises MAINTENANT. Rend une promesse : le
   principal attend cette ecriture avant de laisser la fenetre partir. */
function szBrouillonMaintenant(){
  clearTimeout(_BR_T); _BR_T = null;
  if (!_brActif() || !_brRempli()) return Promise.resolve({ ok: true });
  var v = _brValeurs();
  if (!v) return Promise.resolve({ ok: true });
  return _brEcrire(v);
}

function szBrouillonJeter(){
  clearTimeout(_BR_T); _BR_T = null;
  _BR_DERNIER = ''; _brSale(false);
  if (!_BR || !_brPont()) return Promise.resolve({ ok: true });
  return _brPont().appeler('brouillon:jeter', _BR.portee, _brCle(), _BR_PROFIL)
    .then(function(r){ return r || { ok: true }; }, function(){ return { ok: true }; });
}

/* ⚠ DELEGUE SUR document, ET UNE SEULE FOIS. Les fenetres redessinent leur
   formulaire entier a chaque etape : des ecouteurs poses sur les champs
   dispararaitraient avec eux, et le brouillon cesserait de suivre la saisie sans
   que rien ne le dise. */
function szBrouillonEcouter(){
  if (_BR_ECOUTE) return;
  _BR_ECOUTE = true;
  document.addEventListener('input', szBrouillonPoser, true);
  document.addEventListener('change', szBrouillonPoser, true);
}

/* ══ LIRE ET REPOSER UN FORMULAIRE QUI NE VIT QUE DANS LE DOM ═══════════
   ⚠ C EST LE CAS DE PRESQUE TOUTES LES FENETRES, et c est la raison de fond du
   probleme : l etat du formulaire n est ni dans une variable ni dans le stockage.
   Il est dans les champs. Un redessin, une fermeture, et il n existe plus.
   Ces deux aides sont ici pour que chaque fenetre n ait qu a NOMMER ses champs :
   recopier la boucle vingt fois, c est vingt occasions d en oublier un.
   ⚠ ELLE REND null SI LE FORMULAIRE N EST PAS DESSINE. Sans ce garde, la
   fermeture ecrirait un brouillon de champs vides PAR-DESSUS le vrai — la
   << perte >> la plus vicieuse, puisqu elle passe par le mecanisme qui devait
   proteger.
   ⚠ ET ON NE MET JAMAIS UN MOT DE PASSE DEDANS. Le brouillon vit dans le
   stockage du navigateur : y deposer un mot de passe en clair serait creer une
   fuite pour eviter une contrariete. Les fenetres qui en portent un l excluent
   de leur liste de champs, et le disent a cet endroit-la. */
function szBrouillonDuDom(champs, cases){
  var l = champs || [], c = cases || [];
  if (!l.length || !document.getElementById(l[0])) return null;
  var v = { _c: {} };
  l.forEach(function(id){ var e = document.getElementById(id); if (e) v[id] = e.value; });
  c.forEach(function(id){ var e = document.getElementById(id); if (e) v._c[id] = !!e.checked; });
  return v;
}
function szBrouillonAuDom(v){
  if (!v) return;
  Object.keys(v).forEach(function(k){
    if (k === '_c') return;
    var e = document.getElementById(k); if (e) e.value = v[k];
  });
  Object.keys(v._c || {}).forEach(function(k){
    var e = document.getElementById(k); if (e) e.checked = !!v._c[k];
  });
}
/* Y a-t-il quelque chose a perdre ? Vrai des qu UN des champs nommes porte
   quelque chose. ⚠ Pour un formulaire de MODIFICATION, une fenetre passe plutot
   sa propre comparaison : un formulaire identique a la fiche enregistree n a rien
   a proposer, et proposer de << reprendre >> l etat deja en base ne ferait
   qu inquieter. */
function szBrouillonQuelqueChose(v, champs){
  if (!v) return false;
  var l = champs && champs.length ? champs : Object.keys(v);
  for (var i = 0; i < l.length; i++) {
    if (l[i] === '_c') continue;
    if (String(v[l[i]] == null ? '' : v[l[i]]).trim()) return true;
  }
  return false;
}

function _brIlYa(min){
  var m = Math.max(1, Math.round(min || 1));
  if (m < 60) return 'il y a ' + m + ' minute' + (m > 1 ? 's' : '');
  var h = Math.round(m / 60);
  return 'il y a ' + h + ' heure' + (h > 1 ? 's' : '');
}

/* ══ LA QUESTION DE LA FERMETURE, DESSINEE ICI ════════════════════
   ⚠⚠ ELLE ETAIT POSEE PAR WINDOWS, ET C ETAIT UNE FAUTE. La 3.72.0 utilisait
   dialog.showMessageBoxSync : une boite du SYSTEME, donc fond clair, accent bleu
   et boutons de Windows au milieu d une application sombre. Signale le 2026-08-20,
   capture a l appui : << les fenetre doivent etre native ici et suivre notre
   theme >>. C est mot pour mot la lecon du menu systeme de la 1.55.1 (<< je perds
   mon theme et je dois cliquer >>), dont la reponse avait deja ete d abandonner le
   composant du systeme.

   ⚠ POURQUOI DANS LA PAGE PLUTOT QUE DANS UNE FENETRE A NOUS. Pendant un close
   EMPECHE, la page est encore vivante : elle a deja sa feuille de style, son
   theme jour/nuit, sa police. Une petite fenetre sans cadre marcherait aussi,
   mais il faudrait la placer, la centrer, la fermer, lui faire suivre le theme et
   lui parler par un canal de plus — pour obtenir exactement ce que la page a
   deja. Le principal GARDE LA DECISION : il demande seulement a la page
   d afficher et de rapporter le choix.

   Rend 0 = conserver, 1 = jeter, 2 = revenir. Ne rend jamais rien d autre. */
function szBrouillonDemander(){
  return new Promise(function(resoudre){
    var v = document.createElement('div');
    v.className = 'szbr-voile';
    v.innerHTML = '<div class="szbr-boite" role="dialog" aria-modal="true">'
      /* ⚠ UN TRACE, PAS UN EMOJI GRISE — et je viens de refaire l erreur corrigee
         le matin meme dans les 23 en-tetes : le crayon-sur-papier est un dessin
         CLAIR, et le filtre monochrome ne lui laisse que son fond. On ne grise pas
         un pictogramme, on le remplace. */
      + '<h3><span class="ico">${ICO.gabarit}</span> Vous avez une saisie en cours</h3>'
      + '<p>Conserv\u00e9e, elle vous sera propos\u00e9e \u00e0 la r\u00e9ouverture de cette fen\u00eatre. '
      + 'Jet\u00e9e, elle est perdue.</p>'
      + '<div class="szbr-pied">'
      + '<button type="button" id="szbr-f-jeter">Jeter la saisie</button>'
      + '<button type="button" id="szbr-f-revenir">Revenir au formulaire</button>'
      + '<button type="button" class="prim" id="szbr-f-garder">Conserver le brouillon</button>'
      + '</div></div>';
    document.body.appendChild(v);
    var fini = function(choix){
      if (v.parentNode) v.parentNode.removeChild(v);
      document.removeEventListener('keydown', clavier, true);
      resoudre(choix);
    };
    /* ⚠ ECHAP REVIENT AU FORMULAIRE, il ne jette pas. Une touche qui ferait perdre
       une saisie serait la pire des surprises — et Echap est justement la touche
       qu on presse quand on ne sait pas ce qui se passe. */
    var clavier = function(ev){
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fini(2); }
    };
    document.addEventListener('keydown', clavier, true);
    document.getElementById('szbr-f-garder').onclick = function(){ fini(0); };
    document.getElementById('szbr-f-jeter').onclick = function(){ fini(1); };
    document.getElementById('szbr-f-revenir').onclick = function(){ fini(2); };
    /* Le bouton par defaut prend le focus : la touche Entree conserve. */
    try { document.getElementById('szbr-f-garder').focus(); } catch (e) {}
  });
}

/* La question de la REOUVERTURE. Rend une promesse resolue a true si la saisie a
   ete reprise. ⚠ Rien n est restaure sans le demander : un formulaire qui se
   remplirait tout seul de la saisie d hier est aussi surprenant qu un formulaire
   vide apres une heure de travail. */
function szBrouillonProposer(){
  if (!_brActif()) return Promise.resolve(false);
  return _brPont().appeler('brouillon:lire', _BR.portee, _brCle()).then(function(r){
    /* On retient le tiroir DES MAINTENANT, meme s il n y a rien a reprendre : si
       la session tombe plus tard, c est la seule chose qui dira ou ecrire. */
    if (r && r.profil) _BR_PROFIL = String(r.profil);
    if (!r || !r.ok || !r.brouillon) return false;
    return new Promise(function(resoudre){
      var v = document.createElement('div');
      v.className = 'szbr-voile';
      var quoi = (_BR.libelle ? _BR.libelle : 'Une saisie');
      v.innerHTML = '<div class="szbr-boite" role="dialog" aria-modal="true">'
        + '<h3><span class="ico">${ICO.gabarit}</span> Une saisie non termin\u00e9e</h3>'
        + '<p>' + quoi + ' a \u00e9t\u00e9 laiss\u00e9e en cours <strong>'
        + _brIlYa(r.ilYaMin) + '</strong>. La reprendre, ou repartir \u00e0 neuf ?</p>'
        + '<p class="szbr-note">Un brouillon dispara\u00eet de lui-m\u00eame apr\u00e8s '
        + Math.round((_BR.ttlMin || 720) / 60) + ' heures, et il est jet\u00e9 d\u00e8s que la fiche est enregistr\u00e9e.</p>'
        + '<div class="szbr-pied">'
        + '<button type="button" id="szbr-non">Repartir \u00e0 neuf</button>'
        + '<button type="button" class="prim" id="szbr-oui">Reprendre</button>'
        + '</div></div>';
      document.body.appendChild(v);
      var fini = function(repris){ if (v.parentNode) v.parentNode.removeChild(v); resoudre(repris); };
      document.getElementById('szbr-oui').onclick = function(){
        try { if (_BR.remplir) _BR.remplir(r.brouillon); } catch (e) {}
        /* La valeur restauree EST celle du stockage : sans cette ligne, le
           premier geste reecrirait a l identique un brouillon deja la. */
        try { _BR_DERNIER = JSON.stringify(r.brouillon); } catch (e) { _BR_DERNIER = ''; }
        _brSale(true);
        fini(true);
      };
      document.getElementById('szbr-non').onclick = function(){ szBrouillonJeter(); fini(false); };
    });
  }, function(){ return false; });
}

/* == LES TROIS PORTES QUE LE PROCESSUS PRINCIPAL APPELLE ===================
   ⚠⚠ SANS CES TROIS LIGNES, TOUT CE FICHIER EST INJOIGNABLE DEPUIS LA COQUILLE,
   ET LE MECANISME NE FAIT RIEN. Ce bloc est injecte DANS L IIFE de chaque
   fenetre : une declaration << function szBrouillonMaintenant() >> y est une
   liaison LEXICALE, pas une propriete du global. Le principal, lui, appelle
   << window.szBrouillonMaintenant >> par executeJavaScript — qui trouvait
   undefined, retombait sur null, et fermait la fenetre SANS ECRIRE. La question
   s affichait, on repondait << Conserver le brouillon >>, et rien n etait
   conserve. Vecu en 3.72.0.
   ⚠ C EST LE MEME PIEGE QUE << const Newsletter = ... >> ou << window.Admin >>,
   deja note deux fois dans ce depot et dans les bancs : une liaison lexicale
   n est PAS une propriete du global. Il se represente des qu on fait appeler du
   code de page par la coquille.
   ⚠ ON N EXPOSE QUE CES TROIS-LA, et pas tout le bloc : ce sont les seules que
   le principal a besoin d appeler. Le reste appartient a la fenetre. */
window.szBrouillonDemander = szBrouillonDemander;
window.szBrouillonMaintenant = szBrouillonMaintenant;
window.szBrouillonJeter = szBrouillonJeter;
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

/* ══ LE TITRE DES FENETRES, QUATRIEME PASSE ═══════════════════════════
   Quatre demandes le meme jour, le 2026-08-19. Les garder toutes explique ou
   l on est arrive, et surtout POURQUOI ce n est aucune des trois polices qu il
   a nommees.
     1. << plus visible et moderne >> -> 3.53.0, Segoe UI Variable Display.
        Ecartee : trop neutre.
     2. << une police qui ressemble a Ironclad >> -> display geometrique ART DECO,
        capitales seulement. COMMERCIALE et absente du poste. League Spartan
        (ATF Spartan, 1939) avait ete posee en capitales espacees ; non livree,
        il a change d avis avant la publication.
     3. << prend cette police finalement verandah_reverie >> -> un script
        calligraphique. Sa version installee est la DEMO, et elle REMPLACE CHACUN
        DE SES CHIFFRES PAR UN ENCART PUBLICITAIRE : << Commande 1042 >> se
        composait en << Commande >> suivi de quatre reclames. Livre a la place :
        Pinyon Script (3.59.0), la plus lisible des anglaises libres.
     4. << change la police pour Sweet Cucumber Mocktail >> -> une manuscrite au
        feutre. Elle FONCTIONNE (chiffres, accents, aucun tatouage — verifie),
        mais Misti s Fonts la donne gratuite pour l usage PERSONNEL seulement :
        << If you make money from using this font, you must purchase a license. >>
        Sandriza est une entreprise, et embarquer une police dans un installateur
        distribue est un usage professionnel.

   PATRICK HAND tient donc la place : manuscrite au feutre sous licence libre
   (OFL), donc redistribuable, et la plus proche de Sweet Cucumber Mocktail des
   six candidates comparees sur de vrais titres — meme allure droite, memes
   proportions, meme nettete. C est une RESSEMBLANCE, pas une copie.
   S il achete la licence de Sweet Cucumber Mocktail, poser le fichier dans
   src/polices/ et relancer << node tools/police-en-base64.js >> suffit.

   ⚠⚠ LA REGLE QUI NE DOIT PAS SE DEFAIRE : text-transform:none et
   letter-spacing:0 sont ECRITS, pas omis. Ils ont ete poses pour Pinyon Script
   — une anglaise dont les liaisons vivent dans les minuscules et que le moindre
   espacement casse — et ils restent justes pour une manuscrite. Une geometrique
   en capitales espacees voudrait l inverse : c est un choix a REFAIRE si la
   police change de nature, pas un reglage a recopier.

   ⚠ 1.3rem, ET LA TAILLE A ETE MESUREE, PAS DEVINEE. Rendue a quatre valeurs
   avec les regles reelles de .tete, sur les deux fonds. Patrick Hand se lit
   des 1.18rem — c est un feutre, pas une anglaise — donc 1.3rem suffit, et le
   bandeau des 91 fenetres retrouve presque sa hauteur d origine : Pinyon Script
   exigeait 1.5rem pour la meme lisibilite.

   ⚠ LA CHAINE DE REPLI RESTE. Si le base64 est un jour tronque, le titre doit
   rester LISIBLE au lieu de disparaitre — et verifier-fenetres.js refuse de
   publier dans ce cas. font-display:block evite le clignotement : la police
   est locale, prete tout de suite.

   ⚠ CETTE REGLE VIT ICI, UNE SEULE FOIS. Les 86 declarations locales << .tete h1 >>
   ont ete retirees en 3.53.0 : la meme decision ecrite 86 fois, c est 85 endroits
   qu on oubliera. CSS_JOUR est appende APRES le CSS de chaque fenetre, donc il
   commande. */
.tete h1{margin:0;
  font-family:"SzTitre","Segoe UI Variable Display","Segoe UI",Georgia,serif;
  font-size:1.3rem;font-weight:400;line-height:1.3;
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

/* ⚠⚠ ET LA LIMITE DE LA REGLE AU-DESSUS, TROUVEE LE 2026-08-20 : GRISER UN
   EMOJI NE LE REND PAS LISIBLE, CA PEUT L EFFACER. Sa capture montrait l en-tete
   du Tableau de bord : un rectangle clair, presque vide, ou l on ne distinguait
   plus rien. Le fautif etait le graphique a barres, dont le dessin est un fond
   BLANC avec trois barres de couleur ; passe en niveaux de gris puis eclairci de
   moitie, il ne reste que le fond. Le filtre n a rien casse — il a fait
   exactement ce qu on lui demandait, sur un dessin qui ne pouvait pas y survivre.
   D ou la regle du carnet, qui disait deja la bonne chose : ON RETIRE le
   pictogramme, ON NE LE GRISE PAS.

   Une icone d ici est un TRACE : pas de fond, une seule couleur, qui suit celle
   du texte (<< currentColor >>). Elle est donc lisible de nuit comme de jour sans
   qu on ait rien a declarer, et elle ne peut pas s effacer sous un filtre.

   ⚠ LE MEME DESSIN QUE LE SITE, et ce n est pas de la coquetterie : la barre
   laterale de l administration web porte sa propre table (la table << IC >> d admin.js).
   Deux dessins pour la meme chose, c est ce qui fait qu on ne reconnait plus un
   ecran d une fenetre a l autre — le meme travers que les deux menus qui avaient
   deja derive et qui ont fait naitre ce socle.

   ⚠ IL RESTE 86 EN-TETES A PASSER. Ils portent tous un emoji dans
   <span class="ic">, et le probleme ne se voit que sur ceux dont le dessin est
   clair (le graphique a barres, la page blanche, l enveloppe). Le reste tient
   encore, donc on n a pas a tout faire d un coup — mais on a a le faire par ICI,
   une entree a la fois, pas par une seconde table dans chaque fenetre. */
.ico{display:inline-flex;align-items:center;justify-content:center;color:#cbd5e1}
.ico svg{width:17px;height:17px;display:block}
.tete .ico{opacity:.95}
html.jour .ico{color:#414e66}

/* ══ LA BOITE DU BROUILLON ══════════════════════════════════
   ⚠ SES PROPRES CLASSES, ET C EST VOULU. La boite de reprise de l assistant
   Produit emprunte les classes .voile/.boite/.pied2 de SA feuille — elles
   n existent pas dans les 87 autres fenetres. Une aide partagee qui s appuierait
   dessus se dessinerait donc n importe comment ailleurs, ou pas du tout. Les
   classes .szbr-* vivent ici, avec le reste du socle : une fenetre qui branche
   un brouillon demain n a rien a declarer.
   ⚠ UNE BOITE, PAS UN BANDEAU (meme raison que dans l assistant Produit) : une
   etape doit tenir dans la fenetre, et un bandeau permanent volerait la place
   d une carte. La question se pose une fois, a l ouverture, et disparait. */
.szbr-voile{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;
  justify-content:center;padding:1.2rem;background:rgba(6,10,18,.62)}
.szbr-boite{max-width:33rem;width:100%;background:#131c2b;color:#e8edf5;
  border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:1rem 1.1rem;
  box-shadow:0 18px 44px rgba(0,0,0,.45)}
.szbr-boite h3{margin:0 0 .5rem;display:flex;align-items:center;gap:.45rem;
  font:700 1rem/1.25 Georgia,serif;color:#e8dcc6}
.szbr-boite p{margin:.35rem 0;font-size:.86rem;line-height:1.5}
.szbr-note{font-size:.78rem;color:#8fa1b8}
.szbr-pied{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.9rem}
.szbr-pied button{font:inherit;font-size:.84rem;padding:.4rem .8rem;border-radius:6px;
  cursor:pointer;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);
  color:#e8edf5;white-space:nowrap}
/* ⚠ white-space:nowrap ET une boite plus large : a trois boutons, << Conserver le
   brouillon >> se coupait en deux lignes et la question avait l air bricolee. Un
   libelle qui se casse en deux se lit deux fois moins vite, et c est une question
   qu on lit dans l urgence. */
.szbr-pied button.prim{background:#C49A6C;border-color:#C49A6C;color:#1b1206;font-weight:700}
html.jour .szbr-voile{background:rgba(29,36,51,.35)}
html.jour .szbr-boite{background:#ffffff;color:#1d2433;border-color:rgba(15,23,42,.14)}
html.jour .szbr-boite h3{color:#141c28}
html.jour .szbr-note{color:#414e66}
html.jour .szbr-pied button{background:rgba(15,23,42,.05);border-color:rgba(15,23,42,.18);color:#1d2433}
html.jour .szbr-pied button.prim{background:#C49A6C;border-color:#C49A6C;color:#1b1206}

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
  JS_SOCLE, JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_THEMES, ICO };
