/* ============================================================================
   debordement-coeur.js — CE QUI SORT DE L'ECRAN, MESURE AU RENDU (2026-10-11)
   ----------------------------------------------------------------------------
   ⚠ CE FICHIER N'EST PAS UN MODULE NODE : c'est un FRAGMENT de JavaScript que
   `banc-debordement.js` colle dans la page a mesurer, a la place de
   `__COEUR__`. Il n'est ni require, ni execute ici.

   MEME CONTRAT que `zones-mortes-coeur.js` (le gabarit de page appelle, dans
   cet ordre, mesurer(racine, contexte), puis enumere `trouve`, puis ecrit
   `comptes` SANS try) : on declare les trois.

   ── CE QU'IL MESURE ─────────────────────────────────────────────────────────
   La regle de la maison : « aucune barre de defilement, tout tient en
   1400 × 833 ». Deux questions, posees au moteur et pas au CSS :
     · LA PAGE DEFILE-T-ELLE ? (hauteur du document au-dela de la fenetre) ;
     · UN CONTROLE EST-IL HORS D'ATTEINTE ? Un bouton, un champ, une liste
       deroulante dont le bas sort de la fenetre ALORS qu'aucun ancetre ne
       defile pour l'amener a l'ecran. Un controle dans une liste qui defile
       (une table paginee, un volet qui a sa barre) est ATTEIGNABLE : ce n'est
       pas un debordement, on ne le compte pas.
   On ne regarde que ce qui est VISIBLE (pas display:none, pas hidden, taille
   non nulle) : un panneau d'onglet masque n'est pas a l'ecran.
   ============================================================================ */

var trouve = {};
var comptes = { vus: 0, invisibles: 0, voile: 0, image: 0, illisible: 0,
  inactifs: 0, souVoile: 0, decoratifs: 0, filtre: 0 };

function dit(s) { try { console.log('ELG-CR|' + s); } catch (x) {} }

function _visible(el) {
  if (!el || !el.getBoundingClientRect) return false;
  var r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return false;
  var cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
  for (var p = el; p && p !== document.body; p = p.parentElement) {
    if (p.hidden) return false;
    var c = getComputedStyle(p);
    if (c.display === 'none' || c.visibility === 'hidden') return false;
  }
  return true;
}
// Un ancetre qui defile pour de vrai (overflow auto/scroll ET contenu plus haut que lui).
function _ancetreDefilant(el) {
  for (var p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
    var c = getComputedStyle(p);
    if (/(auto|scroll)/.test(c.overflowY) && p.scrollHeight > p.clientHeight + 2) return p;
  }
  return null;
}
function _nomCourt(el) {
  var t = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || el.id || el.name || el.tagName || '').replace(/\s+/g, ' ').trim();
  return (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ' « ' + t.slice(0, 30) + ' »').replace(/\|/g, ' ');
}

function mesurer(racine, contexte) {
  var vh = window.innerHeight, vw = window.innerWidth;
  var docH = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
  var docW = Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0);
  var pageH = Math.max(0, docH - vh), pageW = Math.max(0, docW - vw);
  var hors = [], n = 0, defilants = 0, vus = 0;
  var ctrl = racine.querySelectorAll('button, input:not([type=hidden]), select, textarea, a[href], [role=button], [role=tab]');
  for (var i = 0; i < ctrl.length; i++) {
    var el = ctrl[i];
    if (!_visible(el)) continue;
    vus++;
    var r = el.getBoundingClientRect();
    if (r.bottom <= vh + 1 && r.right <= vw + 1) continue;
    if (_ancetreDefilant(el)) { defilants++; continue; }
    n++;
    if (hors.length < 4) hors.push(_nomCourt(el) + ' bas=' + Math.round(r.bottom) + ' droite=' + Math.round(r.right));
  }
  comptes.vus = vus;
  /* ── LES ZONES QUI DEFILENT (2026-10-12, sa regle : << aucun scroll bar dans l application >>,
     << les ajouts de donnees sous controle de pagination >>). Un controle dans une liste qui defile
     est atteignable — mais la glissiere elle-meme est le defaut qu il refuse. On les NOMME toutes :
     overflow auto/scroll ET contenu reellement plus grand que la boite, en hauteur ou en largeur. */
  var zones = [], toutes = racine.querySelectorAll('*');
  for (var z = 0; z < toutes.length; z++) {
    var ze = toutes[z], zc = getComputedStyle(ze);
    var dv = /(auto|scroll)/.test(zc.overflowY) && ze.scrollHeight > ze.clientHeight + 2;
    var dh = /(auto|scroll)/.test(zc.overflowX) && ze.scrollWidth > ze.clientWidth + 2;
    if (!dv && !dh) continue;
    if (!_visible(ze)) continue;
    if (ze.tagName === 'TEXTAREA') continue;   // une zone de saisie longue defile par nature
    var zn = ze.tagName.toLowerCase() + (ze.id ? '#' + ze.id : '') + (ze.classList && ze.classList.length ? '.' + ze.classList[0] : '');
    zones.push(zn + (dv ? ' V+' + (ze.scrollHeight - ze.clientHeight) : '') + (dh ? ' H+' + (ze.scrollWidth - ze.clientWidth) : ''));
  }
  dit('ZON|' + contexte + '|' + zones.length + '|' + zones.slice(0, 6).join(' ; ').replace(/\|/g, ' '));
  dit('DEB|' + contexte + '|' + vw + 'x' + vh + '|' + pageH + '|' + pageW + '|' + n + '|' + defilants + '|' + vus + '|' + hors.join(' ; '));
}
