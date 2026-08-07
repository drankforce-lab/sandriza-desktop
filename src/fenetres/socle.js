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
.tete .ic{font-size:1.05rem}
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
const JS_SOCLE = `
var P = window.szPont;

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
      self.aller(parseInt(b.getAttribute('data-etape'), 10) || 0);
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
  faite: function(k){
    return this.etapes[k].obl.every(function(c){ return String(val(c) || '').trim() !== ''; });
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

module.exports = { CSS_SOCLE, JS_SOCLE };
