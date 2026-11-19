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
  // Les listes en pages (JS_PAGES) : elements visibles / total, et le pied — preuve que la page n est pas COUPEE.
  var pgs = racine.querySelectorAll('[data-pages]');
  for (var q = 0; q < pgs.length; q++) {
    var pc = pgs[q], tbq = pc.querySelector('tbody'), srcq = tbq || pc, tot = 0, vis = 0;
    for (var w = 0; w < srcq.children.length; w++) { var ew = srcq.children[w]; if (ew.classList && ew.classList.contains('sz-pages')) continue; tot++; if (ew.style.display !== 'none') vis++; }
    var pq = pc.nextElementSibling, ptxt = pq && pq.classList && pq.classList.contains('sz-pages') ? (pq.textContent || '').replace(/\s+/g, ' ').trim() : '';
    dit('PAG|' + contexte + '|' + pc.getAttribute('data-pages') + '|' + vis + '/' + tot + '|' + ptxt.replace(/\|/g, ' '));
  }
  /* ── LES TABLEAUX ROGNÉS (2026-11-19, sa capture des Dépenses : « je t'ai demandé un contrôle de qualité… clairement c'est
     pas fait »). Un tableau plus large que sa carte n'a AUCUN contrôle hors d'atteinte quand ses dernières colonnes ne portent
     que du texte : la carte (overflow:hidden) les coupe sans glissière, et rien ci-dessus ne le voyait. On compare la largeur
     du tableau à celle de son premier ancêtre qui rogne. */
  var rog = [], tabs = racine.querySelectorAll('table');
  for (var ti = 0; ti < tabs.length; ti++) {
    var tb = tabs[ti]; if (!_visible(tb)) continue;
    for (var an = tb.parentElement; an && an !== document.body; an = an.parentElement) {
      var ac = getComputedStyle(an);
      if (ac.overflowX === 'visible') continue;
      if (/(auto|scroll)/.test(ac.overflowX)) break;          // une zone qui défile est déjà comptée plus haut
      var depasse = Math.round(tb.getBoundingClientRect().right - an.getBoundingClientRect().right + 0.5);
      if (depasse > 1) rog.push((an.getAttribute('data-pages') || an.className.split(' ')[0] || an.tagName.toLowerCase()) + ' +' + depasse + 'px');
      break;
    }
  }
  /* ── CE QUI SORT DE SA CARTE (2026-11-19, sa capture de Nouveau produit : « Photo 4 » passée à la ligne, sous la carte —
     « repasse toutes les fenêtres, il y a plein de déformations »). Une carte (bordure ou fond, coins arrondis) qui NE rogne
     pas laisse son contenu déborder à la vue : rien ci-dessus ne le voyait. On prend chaque élément visible qui porte du
     texte, un champ, un bouton ou une image, et sa carte la plus proche ; dépasser de plus de 2 px est un défaut. */
  var sort = [], vus2 = 0;
  var feuilles = racine.querySelectorAll('button,input,select,textarea,img,label,span,b,strong,a,p,h1,h2,h3,td,th,li,div');
  var estCarte = function(e){
    var c = getComputedStyle(e);
    if (!(parseFloat(c.borderTopLeftRadius) > 0)) return false;
    var bord = parseFloat(c.borderTopWidth) > 0 || parseFloat(c.borderLeftWidth) > 0;
    var fond = c.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor);
    return (bord || fond) && e.offsetWidth > 120 && e.offsetHeight > 60;
  };
  for (var fi = 0; fi < feuilles.length; fi++) {
    var fe = feuilles[fi];
    if (fe.tagName === 'DIV' && fe.children.length) continue;               // une boîte : on juge son contenu
    if (fe.tagName !== 'INPUT' && fe.tagName !== 'IMG' && fe.tagName !== 'SELECT' && !(fe.textContent || '').trim()) continue;
    if (!_visible(fe)) continue;
    var fc = getComputedStyle(fe);
    if (fc.position === 'absolute' || fc.position === 'fixed') continue;    // pastilles et bulles posées exprès
    var carte = null;
    for (var an2 = fe.parentElement; an2 && an2 !== document.body; an2 = an2.parentElement) {
      var ac2 = getComputedStyle(an2);
      if (ac2.position === 'fixed') { carte = null; break; }
      if (ac2.overflowX !== 'visible' || ac2.overflowY !== 'visible') { carte = null; break; }   // rogné : jugé ailleurs
      if (estCarte(an2)) { carte = an2; break; }
    }
    if (!carte) continue;
    vus2++;
    var rr = fe.getBoundingClientRect(), rc = carte.getBoundingClientRect();
    var dB = Math.round(rr.bottom - rc.bottom), dR = Math.round(rr.right - rc.right);
    if (dB > 2 || dR > 2) {
      var nomC = (carte.className && typeof carte.className === 'string' ? carte.className.split(' ')[0] : carte.tagName.toLowerCase());
      sort.push(_nomCourt(fe) + ' hors de .' + nomC + (dB > 2 ? ' bas+' + dB : '') + (dR > 2 ? ' droite+' + dR : ''));
    }
  }
  dit('SOR|' + contexte + '|' + sort.length + '|' + sort.slice(0, 4).join(' ; ').replace(/\|/g, ' '));
  dit('ROG|' + contexte + '|' + rog.length + '|' + rog.slice(0, 4).join(' ; ').replace(/\|/g, ' '));
  dit('ZON|' + contexte + '|' + zones.length + '|' + zones.slice(0, 6).join(' ; ').replace(/\|/g, ' '));
  dit('DEB|' + contexte + '|' + vw + 'x' + vh + '|' + pageH + '|' + pageW + '|' + n + '|' + defilants + '|' + vus + '|' + hors.join(' ; '));
}
