'use strict';

/*
 * SOCLE COMMUN DES FENÊTRES NATIVES
 * =============================================================================
 * Une feuille de style et quelques aides, partagées par toutes les fenêtres
 * écrites dans l'application.
 *
 * ⚠ POURQUOI UN SOCLE PLUTÔT QU'UNE COPIE PAR FENÊTRE.
 * Le menu détaché a déjà vécu ce problème : sa feuille avait été recopiée, puis
 * le rail ancré a gagné des emojis, un pied aligné, des espacements revus — et
 * les deux menus, censés être le même, ne se ressemblaient plus. Ici, une
 * fenêtre ajoutée demain hérite du même dessin sans que personne y pense.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) DANS CE FICHIER hors des gabarits eux-mêmes,
 * y compris dans les commentaires CSS : le contenu part dans des littéraux de
 * gabarit, et un accent grave égaré referme la chaîne. Ça s'est produit trois
 * fois sur ce projet.
 */

const CSS_SOCLE = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;
  font:14px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}

/* Bandeau : titre a gauche, etat a droite. Volontairement bas — c'est une
   fenetre de travail, la place appartient au formulaire. */
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.7rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.1rem}
.tete h1{margin:0;font:700 1rem/1.2 Georgia,serif}
.tete .sous{margin-left:auto;font-size:.74rem;color:#8fa1b8}

.corps{flex:1 1 auto;overflow-y:auto;padding:1rem 1.1rem}
.corps::-webkit-scrollbar{width:9px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.13);border-radius:9px}

.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.95rem 1.05rem;margin-bottom:.85rem}
.carte h2{margin:0 0 .7rem;font-size:.74rem;text-transform:uppercase;
  letter-spacing:.09em;color:#8fa1b8;font-weight:700}

.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.75rem}
.ch{display:flex;flex-direction:column;gap:.28rem;min-width:0}
.ch.large{grid-column:1/-1}
.ch label{font-size:.74rem;color:#8fa1b8}
.ch .req{color:#c9a97e}
input,select,textarea{font:inherit;color:#e8edf5;background:#0f1826;
  border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:.42rem .6rem;
  width:100%;min-width:0}
input:focus,select:focus,textarea:focus{outline:none;border-color:#c9a97e}
textarea{resize:vertical;min-height:64px}
input.manque{border-color:#f87171}
.cases{display:flex;flex-wrap:wrap;gap:.5rem .9rem}
.cases label{display:inline-flex;align-items:center;gap:.35rem;font-size:.85rem;
  color:#e8edf5;cursor:pointer}
.cases input{width:auto}

button{font:inherit;cursor:pointer;border-radius:8px;padding:.4rem .85rem;
  border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);
  color:#e8edf5;transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
button.prim:hover:not(:disabled){background:#d8bd97;border-color:#d8bd97}

.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.65rem 1.1rem;border-top:1px solid rgba(255,255,255,.08);
  background:#0b1220}
.msg{font-size:.8rem;color:#8fa1b8;min-height:1.2em;flex:1 1 auto;min-width:0}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
.actions{flex:0 0 auto;display:flex;gap:.45rem}

.vide{padding:2.2rem 1rem;text-align:center;color:#8fa1b8}
.vide .gros{font-size:1.02rem;color:#e8edf5;margin-bottom:.4rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/*
 * Traductions des motifs de refus du pont.
 * ⚠ Une fenetre qui ne sait pas doit le DIRE. Un ecran qui reste muet sur un
 * refus de droit ressemble a une panne, et on cherche au mauvais endroit.
 */
const JS_SOCLE = `
var P = window.szPont;
var MOTIFS = {
  session:            'Aucune session ouverte dans l application. Connectez-vous dans la fenetre principale.',
  droit:              'Votre role ne donne pas acces a cette operation.',
  indisponible:       'L administration n est pas encore chargee dans la fenetre principale.',
  pont_indisponible:  'La fenetre principale ne repond pas.',
  operation_inconnue: 'Cette version de l application ne connait pas cette operation.',
  introuvable:        'Cette fiche n existe plus.',
  nom_requis:         'Le nom est obligatoire.',
  verrou:             'Fiche ouverte par quelqu un d autre.',
  echec:              'L operation a echoue.'
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
`;

module.exports = { CSS_SOCLE, JS_SOCLE };
