/* ============================================================================
   zones-mortes-coeur.js — L'ESPACE PERDU, MESURE A L'ECRAN
   ----------------------------------------------------------------------------
   ⚠ CE FICHIER N'EST PAS UN MODULE NODE : c'est un FRAGMENT de JavaScript que
   `banc-zones-mortes.js` colle dans la page a mesurer, a la place de
   `__COEUR__`. Il n'est ni require, ni execute ici.

   Il respecte le MEME CONTRAT que `contraste-rendu-coeur.js`, parce que le
   gabarit de page est le meme et qu'il appelle, dans cet ordre :
     · mesurer(racine, contexte)   — notre mesure ;
     · trouve   (objet)            — il l'enumere ;
     · comptes  (objet)            — il l'ecrit SANS try : absent, la page meurt
       avant d'annoncer sa fin, et le pilote attend son delai pour rien.
   On les declare donc tous les trois, meme vides. Un contrat partiellement
   honore se lit comme une page qui n'a rien trouve.

   ── CE QU'IL MESURE, ET POURQUOI PAS AUTREMENT ─────────────────────────────
   On ne DEDUIT pas le vide du CSS. On demande au navigateur ce qui est
   REELLEMENT peint a chaque point (elementFromPoint), sur une grille.

   ⚠⚠ ET LA DEFINITION DU VIDE A DU ETRE REPRISE — la premiere etait trop
   faible, et elle rendait << 0,0 % de vide >> pour le Studio, ce qui est
   visiblement faux. `elementFromPoint` rend l element LE PLUS PROFOND : un
   point pose sur le REMBOURRAGE d une carte rend la carte, qui n est ni le
   corps ni la page — donc comptee << peinte >>. Tout ecran couvert d un grand
   conteneur mesurait alors 0 % de vide.
   ➡ UN POINT EST VIVANT s il tombe sur quelque chose qui porte VRAIMENT du
   contenu : un texte en propre, un element remplace (image, champ, toile), ou
   une feuille qui peint un fond, une image ou une bordure. Un point qui tombe
   sur un CONTENEUR (il a des enfants, et pas de texte a lui) tombe dans SON
   VIDE — c est precisement ce qu on cherche.
   ⚠ Consequence assumee : le rembourrage confortable d une carte compte comme
   vide. C est voulu — on classe des ecrans les uns par rapport aux autres, et
   ce sont les BANDES continues qui nomment un vrai probleme, pas le pourcentage
   seul.

   ⚠ POURQUOI UNE GRILLE ET PAS UNE SOMME DE SURFACES. Additionner les
   rectangles des elements compte DEUX FOIS ce qui se chevauche (et tout se
   chevauche : une carte contient ses lignes, qui contiennent leurs textes), et
   compte comme PLEINE une carte de 800x400 entierement creuse. La grille repond
   a la seule question qui nous interesse : a cet endroit precis de l'ecran,
   y a-t-il quelque chose ?

   ⚠ ET LE TEMOIN DE PAGE VIDE. Une fenetre qui n'a rien rendu mesurerait 100 %
   de vide et serait en tete du classement — le pire des faux positifs, puisque
   c'est justement celle qu'il ne faut PAS relooker. On compte donc les elements
   visibles, et on le DIT quand il y en a trop peu.
   ============================================================================ */

var trouve = {};
var comptes = { vus: 0, invisibles: 0, voile: 0, image: 0, illisible: 0,
  inactifs: 0, souVoile: 0, decoratifs: 0, filtre: 0 };

function dit(s) { try { console.log('ELG-CR|' + s); } catch (x) {} }

/* Les elements REELLEMENT visibles, pour le temoin et pour le cadre occupe. */
function _visibles(racine) {
  var out = [];
  var n;
  try { n = racine.querySelectorAll('*'); } catch (e) { return out; }
  for (var i = 0; i < n.length; i++) {
    var el = n[i];
    var b;
    try { b = el.getBoundingClientRect(); } catch (e) { continue; }
    if (b.width < 2 || b.height < 2) continue;
    var cs;
    try { cs = window.getComputedStyle(el); } catch (e) { continue; }
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (parseFloat(cs.opacity) === 0) continue;
    out.push({ el: el, b: b });
  }
  return out;
}

var REMPLACES = { IMG: 1, SVG: 1, CANVAS: 1, VIDEO: 1, INPUT: 1, SELECT: 1,
  TEXTAREA: 1, IFRAME: 1, PROGRESS: 1, METER: 1, HR: 1 };

/* Un noeud texte NON VIDE directement sous cet element — pas dans un enfant. */
function _aTexteDirect(el) {
  var n = el.childNodes;
  for (var i = 0; i < n.length; i++) {
    if (n[i].nodeType === 3 && String(n[i].nodeValue).trim() !== '') return true;
  }
  return false;
}

function _vivant(el) {
  if (!el || el === document.body || el === document.documentElement) return false;
  if (_aTexteDirect(el)) return true;
  if (REMPLACES[el.tagName]) return true;
  /* Un CONTENEUR : ce point tombe dans son vide, pas sur son contenu. */
  if (el.childElementCount > 0) return false;
  /* Une feuille sans texte n est vivante que si elle PEINT quelque chose. */
  var cs;
  try { cs = window.getComputedStyle(el); } catch (e) { return false; }
  if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
  var bg = cs.backgroundColor || '';
  if (bg && bg !== 'transparent' && !/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(bg)) return true;
  if (parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0
    || parseFloat(cs.borderRightWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0) return true;
  if (cs.boxShadow && cs.boxShadow !== 'none') return true;
  return false;
}

function mesurer(racine, contexte) {
  var vue = { w: window.innerWidth, h: window.innerHeight };
  if (vue.w < 40 || vue.h < 40) { dit('ZM-VIDE|' + contexte + '|fenetre minuscule'); return; }

  var vis = _visibles(racine);
  comptes.vus = vis.length;

  /* ⚠ LE TEMOIN D'ABORD. Sans lui, une fenetre qui n'a pas rendu trone en tete
     du classement des zones mortes — et c'est exactement celle qu'il ne faut
     pas toucher. */
  if (vis.length < 6) {
    dit('ZM-VIDE|' + contexte + '|' + vis.length + ' element(s) visible(s) — la page n a rien rendu');
    dit('COMPTES|' + comptes.vus + '|0|0|0|0|0|0|0|0|' + contexte);
    return;
  }

  /* ── 1. LA GRILLE : ce qui est peint, point par point ─────────────────── */
  var PAS = 12;
  var nx = Math.max(4, Math.floor(vue.w / PAS));
  var ny = Math.max(4, Math.floor(vue.h / PAS));
  var colVide = [], ligVide = [];
  var morts = 0, total = 0;
  var i, j;
  for (i = 0; i < nx; i++) colVide.push(true);
  for (j = 0; j < ny; j++) ligVide.push(true);

  /* La carte des cases mortes, gardee pour le plus grand rectangle vide. */
  var carte = [];
  for (j = 0; j < ny; j++) carte.push(new Array(nx));

  for (i = 0; i < nx; i++) {
    for (j = 0; j < ny; j++) {
      var x = (i + 0.5) * (vue.w / nx);
      var y = (j + 0.5) * (vue.h / ny);
      total++;
      var el = null;
      try { el = document.elementFromPoint(x, y); } catch (e) {}
      var mort = !_vivant(el);
      carte[j][i] = mort ? 1 : 0;
      if (mort) morts++;
      else { colVide[i] = false; ligVide[j] = false; }
    }
  }

  /* ── LE PLUS GRAND RECTANGLE ENTIEREMENT VIDE ──────────────────────────
     ⚠ C'EST LUI QUI NOMME UN VRAI PROBLEME, pas le pourcentage. 85 % de vide
     reparti en rembourrages confortables est une page aeree ; 85 % dont un
     bloc de 600x400 d un seul tenant est un TROU. Le pourcentage classe, le
     rectangle designe.
     Methode classique de l histogramme : pour chaque ligne, la hauteur de vide
     au-dessus de chaque colonne, puis le plus grand rectangle dans cet
     histogramme — en O(nx) par ligne, avec une pile. */
  var haut = new Array(nx).fill(0);
  var best = { aire: 0, x: 0, y: 0, w: 0, h: 0 };
  for (j = 0; j < ny; j++) {
    for (i = 0; i < nx; i++) haut[i] = carte[j][i] ? haut[i] + 1 : 0;
    var pile = [];
    for (i = 0; i <= nx; i++) {
      var cur = (i === nx) ? 0 : haut[i];
      while (pile.length && haut[pile[pile.length - 1]] >= cur) {
        var h0 = haut[pile.pop()];
        var g = pile.length ? pile[pile.length - 1] + 1 : 0;
        var larg = i - g;
        if (h0 * larg > best.aire) {
          best = { aire: h0 * larg, x: g, y: j - h0 + 1, w: larg, h: h0 };
        }
      }
      pile.push(i);
    }
  }
  var caseL = vue.w / nx, caseH = vue.h / ny;
  var trou = {
    w: Math.round(best.w * caseL), h: Math.round(best.h * caseH),
    x: Math.round(best.x * caseL), y: Math.round(best.y * caseH),
  };
  if (!total) { dit('ZM-VIDE|' + contexte + '|aucun point echantillonne'); return; }

  /* ── 2. LES BANDES MORTES : la plus longue suite de colonnes (ou de
        lignes) entierement vides, et celles qui bordent. Une bande au BORD est
        de la marge perdue ; une bande AU MILIEU est une coupure. ─────────── */
  function bandes(vide, pxParCase) {
    var finD = 0, k;
    for (k = vide.length - 1; k >= 0 && vide[k]; k--) finD++;
    var finG = 0;
    for (k = 0; k < vide.length && vide[k]; k++) finG++;
    var max = 0, cour = 0, posMax = 0;
    for (k = 0; k < vide.length; k++) {
      if (vide[k]) { cour++; if (cour > max) { max = cour; posMax = k - cour + 1; } }
      else cour = 0;
    }
    return {
      debut: Math.round(finG * pxParCase),
      fin: Math.round(finD * pxParCase),
      plusLongue: Math.round(max * pxParCase),
      ou: Math.round(posMax * pxParCase),
    };
  }
  var bH = bandes(colVide, vue.w / nx);      // bandes verticales (gauche/droite)
  var bV = bandes(ligVide, vue.h / ny);      // bandes horizontales (haut/bas)

  /* ── 3. LE CADRE REELLEMENT OCCUPE ───────────────────────────────────── */
  var maxD = 0, maxB = 0, minG = vue.w, minH = vue.h;
  for (i = 0; i < vis.length; i++) {
    var r = vis[i].b;
    if (r.right > maxD) maxD = r.right;
    if (r.bottom > maxB) maxB = r.bottom;
    if (r.left < minG) minG = r.left;
    if (r.top < minH) minH = r.top;
  }
  maxD = Math.min(maxD, vue.w); maxB = Math.min(maxB, vue.h);
  minG = Math.max(minG, 0); minH = Math.max(minH, 0);

  var mortPct = Math.round(1000 * morts / total) / 10;

  dit('ZM|' + contexte
    + '|' + vue.w + '|' + vue.h
    + '|' + mortPct
    + '|' + bH.fin + '|' + bV.fin
    + '|' + bH.debut + '|' + bV.debut
    + '|' + bH.plusLongue + '|' + bH.ou
    + '|' + Math.round(maxD - minG) + '|' + Math.round(maxB - minH)
    + '|' + vis.length
    + '|' + trou.w + '|' + trou.h + '|' + trou.x + '|' + trou.y);

  dit('COMPTES|' + comptes.vus + '|0|0|0|0|0|0|0|0|' + contexte);
}
