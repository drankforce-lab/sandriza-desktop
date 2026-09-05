/* ============================================================================
   contraste-rendu-coeur.js — LA MESURE ELLE-MÊME, INJECTÉE DANS LA PAGE
   ----------------------------------------------------------------------------
   ⚠ CE FICHIER N'EST PAS UN MODULE NODE : c'est un FRAGMENT de JavaScript que
   les bancs collent dans la page à mesurer. Il n'est ni `require`é ni exécuté
   ici. Il est le MÊME des deux côtés (site et application) : deux mesures de
   contraste qui divergeraient donneraient deux vérités, et c'est la plus
   indulgente qu'on croirait.

   Il déclare `dit(texte)` — une ligne `ELG-CR` dans la console, que le pilote
   relit dans le journal de Chrome. L'appelant n'a plus qu'à invoquer
   `mesurer(racine, nomDuContexte)` ; les compteurs (`comptes`, `trouve`) et le
   dépliage (`deplier`) vivent ici.

   ── CE QU'IL A APPRIS À LA DURE, LE 2026-09-05 ──────────────────────────────
   · `getComputedStyle` rend `color(srgb …)` ou `oklab(…)` dès qu'il y a un
     `color-mix` → on ne parse pas la syntaxe, on PEINT la couleur sur une toile
     de 1 pixel et on relit le pixel. Tout ce que le navigateur sait afficher, il
     sait le peindre — y compris les espaces de couleur qui n'existaient pas
     quand ce fichier a été écrit.
   · Un DÉGRADÉ n'a pas une couleur : on garde le PIRE arrêt (c'est déjà la règle
     du projet, « au plus clair ET au plus foncé, on garde le pire des deux »).
   · Un dégradé TRANSLUCIDE n'est PAS un fond : il faut continuer à empiler vers
     le haut. Sinon on compose sur du blanc et on invente des paires — un fanion
     d'accent à 13 % faisait juger un libellé « sur #FEF7E3 » dans une barre
     noire.

   ── ET LA LEÇON DU PORTAGE VERS L'APPLICATION ───────────────────────────────
   ⚠⚠ L'OPACITÉ SE COMPOSE, ELLE NE S'ÉCARTE PAS. La première version renonçait
   à juger dès qu'un ancêtre avait `opacity < 1`. Sur le site, cela n'écartait
   que 4 éléments ; sur les fenêtres de l'application, **30 sur 32** — un
   pictogramme à 0.9, un bouton désactivé à 0.4, un bloc éteint à 0.5. Autrement
   dit, le banc renonçait précisément là où la lisibilité est le plus en jeu, et
   se déclarait content.
   L'opacité d'un élément n'a pourtant rien d'indécidable : elle compose son
   sous-arbre — texte ET fond — sur ce qu'il y a derrière. On calcule donc la
   chaîne des fonds avec, pour chaque niveau, le produit des opacités de ce
   niveau jusqu'à la racine, et l'on compose du fond vers le texte.
   ⚠ Ce qui reste indécidable, et qu'on écarte toujours : une animation EN COURS
   (l'appelant doit l'avoir terminée), un fond en `url(...)`, une couleur que le
   navigateur ne sait pas peindre.
   ========================================================================== */

  var dit = function (s) { try { console.log('ELG-CR|' + s); } catch (x) {} };

  /* ── Couleurs ─────────────────────────────────────────────────────────── */
  var _toile = null, _ctx = null;
  function viaToile(s) {
    try {
      if (!_ctx) {
        _toile = document.createElement('canvas');
        _toile.width = _toile.height = 1;
        _ctx = _toile.getContext('2d', { willReadFrequently: true });
      }
      _ctx.clearRect(0, 0, 1, 1);
      _ctx.fillStyle = '#000';
      _ctx.fillStyle = s;                   // refusée ? fillStyle reste '#000'
      if (_ctx.fillStyle === '#000000' && !/^#0{3,6}$|^black$|^rgba?\(\s*0\s*,\s*0\s*,\s*0/i.test(s)) return null;
      _ctx.fillRect(0, 0, 1, 1);
      var d = _ctx.getImageData(0, 0, 1, 1).data;
      return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
    } catch (e) { return null; }
  }

  function lireCouleur(s) {
    if (!s) return null;
    s = String(s).trim();
    if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    var m = /^rgba?\(([^)]*)\)$/i.exec(s);
    if (!m) return viaToile(s);
    var p = m[1].split(/[\s,\/]+/).filter(function (x) { return x !== ''; });
    var n = p.map(parseFloat);
    if (n.length < 3 || n.some(isNaN)) return null;
    var a = n.length > 3 ? n[3] : 1;
    if (/%$/.test(p[3] || '')) a = n[3] / 100;
    return { r: n[0], g: n[1], b: n[2], a: a };
  }

  function poser(dessus, dessous) {         // « source-over », alpha simple
    var a = dessus.a;
    return {
      r: dessus.r * a + dessous.r * (1 - a),
      g: dessus.g * a + dessous.g * (1 - a),
      b: dessus.b * a + dessous.b * (1 - a),
      a: 1
    };
  }
  function hex(c) {
    var f = function (v) {
      var h = Math.round(Math.max(0, Math.min(255, v))).toString(16).toUpperCase();
      return h.length === 1 ? '0' + h : h;
    };
    return '#' + f(c.r) + f(c.g) + f(c.b);
  }
  function canal(v) {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }
  function lum(c) { return 0.2126 * canal(c.r) + 0.7152 * canal(c.g) + 0.0722 * canal(c.b); }
  function ratio(a, b) {
    var la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /* ── LA CHAÎNE DES FONDS, AVEC LES OPACITÉS ───────────────────────────── */
  /* On remonte de l'élément vers la racine en notant, pour chaque niveau, son
     fond (une couleur, ou plusieurs quand c'est un dégradé) et son opacité. On
     s'arrête au premier niveau VRAIMENT opaque — fond plein ET opacité 1.
     Rend `null` quand la couleur ne peut pas être décidée (image de fond,
     syntaxe que le navigateur refuse de peindre). */
  function chaine(el) {
    var out = [], n = el;
    while (n && n.nodeType === 1) {
      var cs = getComputedStyle(n);
      var o = parseFloat(cs.opacity); if (isNaN(o)) o = 1;
      var fonds = [];
      var bi = cs.backgroundImage;
      if (bi && bi !== 'none') {
        if (/url\(/i.test(bi)) return { indet: 'image' };
        var arrets = bi.match(/(?:rgba?|color|oklab|oklch|lab|lch|hsla?)\([^()]*(?:\([^()]*\)[^()]*)*\)|#[0-9a-f]{3,8}\b/gi) || [];
        for (var a = 0; a < arrets.length; a++) {
          var ca = lireCouleur(arrets[a]);
          if (ca && ca.a > 0.001) fonds.push(ca);
        }
      }
      if (!fonds.length) {
        var c = lireCouleur(cs.backgroundColor);
        if (c === null) return { indet: 'illisible' };
        if (c.a > 0.001) fonds.push(c);
      }
      out.push({ o: o, fonds: fonds });
      var plein = fonds.length > 0;
      for (var k = 0; k < fonds.length; k++) if (fonds[k].a < 0.999) plein = false;
      if (plein && o >= 0.999) return { niveaux: out, base: null };
      n = n.parentElement;
    }
    return { niveaux: out, base: { r: 255, g: 255, b: 255, a: 1 } };  // le blanc du navigateur
  }

  /* Rend la liste des fonds RÉELLEMENT vus derrière le texte de `el`, plus le
     facteur d'opacité qui s'applique au texte lui-même. Plusieurs fonds quand un
     dégradé est en jeu : on jugera contre le pire. */
  function fondEffectif(el) {
    var ch = chaine(el);
    if (ch.indet) return { indet: ch.indet };
    var niv = ch.niveaux;
    // Produit des opacités de chaque niveau jusqu'à la racine : c'est lui qui
    // dit de combien le groupe de ce niveau est atténué sur ce qu'il y a derrière.
    var mult = new Array(niv.length);
    var acc = 1;
    for (var i = niv.length - 1; i >= 0; i--) { acc *= niv[i].o; mult[i] = acc; }
    // Composition du FOND vers l'AVANT. `alternatives` borne l'explosion : un
    // dégradé n'apporte que ses deux extrêmes (déjà la règle du projet).
    var fonds = [ch.base || { r: 255, g: 255, b: 255, a: 1 }];
    for (var j = niv.length - 1; j >= 0; j--) {
      var alt = niv[j].fonds;
      if (!alt.length) continue;
      if (alt.length > 2) alt = [alt[0], alt[alt.length - 1]];
      var suiv = [];
      for (var f = 0; f < fonds.length; f++) {
        for (var v = 0; v < alt.length; v++) {
          var couche = { r: alt[v].r, g: alt[v].g, b: alt[v].b, a: alt[v].a * mult[j] };
          suiv.push(couche.a >= 0.999 ? { r: couche.r, g: couche.g, b: couche.b, a: 1 } : poser(couche, fonds[f]));
        }
      }
      fonds = suiv.length > 8 ? suiv.slice(0, 8) : suiv;
    }
    return { fonds: fonds, multTexte: mult.length ? mult[0] : 1 };
  }

  function seuilDe(cs) {
    var px = parseFloat(cs.fontSize);
    var fw = cs.fontWeight;
    var gras = fw === 'bold' || fw === 'bolder' || parseInt(fw, 10) >= 600;
    if (isNaN(px)) return 4.5;
    if (px >= 24) return 3.0;
    if (gras && px >= 18.66) return 3.0;
    return 4.5;
  }

  /* ⚠ LE PARENT FAIT PARTIE DE L'ADRESSE. « span.admin-rail-lbl » ne dit pas si
     l'onglet était actif ou non — et c'est exactement la question quand une
     couleur d'accent apparaît là où on ne l'attend pas. */
  function chemin(el) {
    var pa = el.parentElement;
    return (pa ? chemin1(pa) + ' > ' : '') + chemin1(el);
  }
  function chemin1(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    var cl = (el.className && el.className.baseVal !== undefined) ? el.className.baseVal : el.className;
    if (cl && typeof cl === 'string') {
      var c = cl.trim().split(/\s+/).slice(0, 3).join('.');
      if (c) s += '.' + c;
    }
    return s;
  }

  var SANS_TEXTE = { SCRIPT: 1, STYLE: 1, TITLE: 1, OPTION: 1, NOSCRIPT: 1, TEMPLATE: 1 };

  /* ⚠⚠ DÉPLIER CE QUI SE REPLIE. Sans ça, un banc écrit pour regarder une barre
     latérale n'y voyait qu'un badge : les libellés des groupes repliés sont à
     0x0 (`grid-template-rows:0fr`, et un enfant de grille à 0fr n'a plus aucune
     hauteur). On déplie EXACTEMENT comme le ferait un clic, et l'on ouvre les
     `<details>`. Ce n'est pas forcer un état impossible : c'est l'état que
     l'utilisateur atteint en ouvrant un groupe.
     ⚠ On ne touche PAS aux `.hidden` (onglets non actifs) : ceux-là dépendent
     d'un contenu qu'on n'a pas chargé, et les forcer inventerait des fautes. */
  function deplier(racine) {
    var n = 0;
    try {
      var g = racine.querySelectorAll('.ng-collapsed');
      for (var i = 0; i < g.length; i++) { g[i].classList.remove('ng-collapsed'); n++; }
      var d = racine.querySelectorAll('details:not([open])');
      for (var j = 0; j < d.length; j++) { d[j].open = true; n++; }
    } catch (e) {}
    return n;
  }
  var deplies = 0;
  var nbRails = 0;

  /* ── Le relevé ────────────────────────────────────────────────────────── */
  var trouve = {};                          // clé « fg sur bg @seuil » → dossier
  var comptes = { vus: 0, invisibles: 0, voile: 0, image: 0, illisible: 0, inactifs: 0, souVoile: 0 };

  /* ══ CE QUE LA NORME ELLE-MÊME N'EXIGE PAS — ET LA CAPTURE QUI L'A MONTRÉ ══
     Le premier balayage complet a rendu 138 couples sous le seuil, dont
     « Confirmer le remboursement » à 1.33 et « Expédier » à 1.36 : des BOUTONS
     D'ACTION PRINCIPAUX illisibles, ce qui n'avait aucun sens. Une capture
     d'écran a tranché en une seconde, comme le 2026-09-05 côté site : la fenêtre
     avait ouvert sa MODALE, tout l'écran derrière était assombri, et le bouton
     mesuré était en plus DÉSACTIVÉ. La mesure était juste ; c'est la QUESTION
     qui était mauvaise.

     ⚠⚠ DEUX EXEMPTIONS, ET TOUTES DEUX SONT DANS LA NORME, pas dans mon confort :
       · **Un contrôle inactif n'a aucune exigence de contraste** (WCAG 1.4.3, en
         toutes lettres). Un bouton grisé DOIT se distinguer d'un bouton actif ;
         le lire n'est pas la question.
       · **Ce qui est derrière une modale ouverte n'est pas l'écran** : c'est un
         état transitoire, volontairement estompé, et personne n'est censé le
         lire pendant ce temps-là. Le mesurer, c'est mesurer un fondu.

     ⚠ ET CE N'EST PAS UN RETOUR EN ARRIÈRE SUR L'OPACITÉ. On continue de
     composer les opacités — un pictogramme à 0.9, un bloc éteint à 0.5 restent
     JUGÉS, et c'est là que le portage avait trouvé ses vraies fautes. On écarte
     seulement deux situations NOMMÉES, reconnaissables, et comptées à part : un
     angle mort qu'on annonce n'est pas un angle mort qu'on cache. */
  function estInactif(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (n.disabled === true) return true;
      if (n.getAttribute && n.getAttribute('aria-disabled') === 'true') return true;
      if (n.hasAttribute && n.hasAttribute('disabled')) return true;
    }
    return false;
  }

  /* Les VOILES de la page : un élément fixe qui couvre l'essentiel de la vue.
     C'est la forme d'une modale dans toutes les fenêtres du projet (`.voile`,
     `position:fixed;inset:0`). On les relève UNE fois par page — les chercher
     par élément coûterait un parcours complet du document à chaque texte.
     ⚠ On ne se fie pas au nom de classe : une modale qui s'appellerait autrement
     doit être vue quand même. La FORME (fixe + couvrante + visible) est ce qui
     compte, pas le vocabulaire. */
  function voilesDeLaPage() {
    var out = [];
    var W = window.innerWidth, H = window.innerHeight;
    var tous = document.querySelectorAll('*');
    for (var i = 0; i < tous.length; i++) {
      var e = tous[i], cs = getComputedStyle(e);
      if (cs.position !== 'fixed' && cs.position !== 'absolute') continue;
      if (cs.visibility !== 'visible' || cs.display === 'none') continue;
      if (parseFloat(cs.opacity) < 0.05) continue;
      var r = e.getBoundingClientRect();
      if (r.width >= W * 0.8 && r.height >= H * 0.8) out.push(e);
    }
    return out;
  }
  var VOILES = voilesDeLaPage();
  function derriereUnVoile(el) {
    for (var i = 0; i < VOILES.length; i++) {
      if (VOILES[i] !== el && !VOILES[i].contains(el)) return true;
    }
    return false;
  }

  function mesurer(racine, ou) {
    if (!racine) return;
    deplies += deplier(racine);
    var els = racine.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (SANS_TEXTE[el.tagName]) continue;
      if (estInactif(el)) { comptes.inactifs++; continue; }
      if (derriereUnVoile(el)) { comptes.souVoile++; continue; }
      var txt = '';
      for (var k = 0; k < el.childNodes.length; k++) {
        if (el.childNodes[k].nodeType === 3) txt += el.childNodes[k].nodeValue;
      }
      txt = txt.replace(/\s+/g, ' ').trim();
      if (!txt) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) { comptes.invisibles++; continue; }
      var cs = getComputedStyle(el);
      if (cs.visibility !== 'visible') { comptes.invisibles++; continue; }
      var f = fondEffectif(el);
      if (f.indet) { comptes[f.indet === 'image' ? 'image' : 'illisible']++; continue; }
      var tc = lireCouleur(cs.color);
      if (tc === null) { comptes.illisible++; continue; }
      // L'opacité des ancêtres atténue le TEXTE comme elle atténue son fond.
      var aTexte = tc.a * f.multTexte;
      if (aTexte <= 0.02) { comptes.invisibles++; continue; }  // invisible pour de vrai
      if (f.multTexte < 0.999) comptes.voile++;                 // compté, mais JUGÉ
      // Plusieurs fonds possibles (arrêts d'un dégradé) : ON GARDE LE PIRE.
      // Juger sur le plus favorable serait exactement l'erreur qui a laissé
      // passer les textes du mode jour : « ça passe quelque part » n'est pas
      // « ça se lit ».
      var pire = null, pireR = Infinity, pireFg = null;
      for (var b = 0; b < f.fonds.length; b++) {
        var fond = f.fonds[b];
        var fgb = aTexte >= 0.999 ? { r: tc.r, g: tc.g, b: tc.b, a: 1 }
                                  : poser({ r: tc.r, g: tc.g, b: tc.b, a: aTexte }, fond);
        var rb = ratio(fgb, fond);
        if (rb < pireR) { pireR = rb; pire = fond; pireFg = fgb; }
      }
      comptes.vus++;
      var seuil = seuilDe(cs);
      var cle = hex(pireFg) + ' sur ' + hex(pire) + ' @' + seuil;
      var d = trouve[cle];
      if (!d) {
        d = trouve[cle] = { ratio: pireR, seuil: seuil, n: 0, ou: {}, ex: chemin(el), txt: txt.slice(0, 40) };
      }
      d.n++;
      d.ou[ou] = (d.ou[ou] || 0) + 1;
    }
  }
