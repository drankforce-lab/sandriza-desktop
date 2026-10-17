'use strict';

/*
 * FENÊTRE « ATELIER DE CRÉATION » — NATIVE (2026-10-16)
 * =============================================================================
 * Sa demande : « un moteur et éditeur pour m'aider dans la création de vêtement
 * et l'enregistrement de modèle et l'impression aussi dans les différents
 * formats ». Esquisses approuvées (« go code le module ») :
 * https://claude.ai/artifact/P9nkurdJFtCvvSTgojfrae
 *
 * LOT 1 (cette version) : la BIBLIOTHÈQUE des modèles et le MOTEUR — créer un
 * modèle depuis un patron de base (robe, chemisier, jupe, pantalon), régler ses
 * options, son tableau de tailles et ses aisances, voir le patron se tracer en
 * direct, dans une taille ou toutes emboîtées, et l'enregistrer (versions).
 * Les lots suivants : l'éditeur de patron interactif, l'impression et l'export,
 * l'aperçu 3D, l'éditeur de motif.
 *
 * ⚠ LA FENÊTRE NE TRACE RIEN. Toute la géométrie (pièces, pinces, crans, tête
 * de manche, gradation par taille, tissu estimé) vient du site (assets/js/
 * atelier.js, op atelier:apercu) ; la fenêtre ne fait que DESSINER les contours
 * reçus, en centimètres, à l'échelle de sa zone.
 *
 * ⚠ ON N'ENVOIE JAMAIS UN TEXTE TRADUIT : bases, catégories, états, options et
 * mesures voyagent par leur CLÉ ; la fenêtre les met en mots avec ses propres
 * libellés (src/langue/atelier.js).
 *
 * ⚠ AUCUN CARACTÈRE accent grave NI ANTISLASH dans la portion de script : elle
 * vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU, SEP_DEC } = require('./socle.js');
const T = require('../langue').tr('atelier');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
#corps{overflow:hidden}
input,select,textarea,button{font:inherit;color:var(--tx)}
input,select,textarea{background:var(--f-champ);border:1px solid var(--v16);border-radius:8px;padding:.32rem .5rem;min-width:0}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--or)}
button{cursor:pointer;background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.32rem .7rem}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#17202c;font-weight:600}
button.danger{border-color:rgba(239,68,68,.55);color:var(--tx-err2)}
button.mini{padding:.12rem .5rem;font-size:.76rem}
.ed-seg button{border:none}
.cx-barre .rf-rch{width:18rem;flex:0 0 auto}
.vide{padding:1.4rem .8rem;text-align:center;color:var(--tx2);font-size:.86rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}

/* ── La bibliothèque ── */
.at-grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(11.5rem,1fr));grid-auto-rows:15.5rem;gap:.8rem;align-content:start}
.at-carte{display:flex;flex-direction:column;border:1px solid var(--sz-bord);border-radius:14px;background:var(--f-carte2);overflow:hidden;
  cursor:pointer;text-align:left;padding:0;min-width:0}
.at-carte:hover{border-color:rgba(var(--or-rgb),.6)}
.at-carte.on{border:2px solid var(--or)}
.at-carte .vig{flex:1 1 auto;min-height:0;background:#EFE8DD;color:#1C1B18;display:flex;align-items:center;justify-content:center}
.at-carte .vig svg{display:block}
.at-carte .tx{padding:.5rem .7rem}
.at-carte .tx b{display:block;font-size:.86rem;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.at-carte .tx span{display:block;font-size:.74rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.at-carte.nouveau{border-style:dashed;background:transparent;align-items:center;justify-content:center;gap:.4rem;padding:1rem;text-align:center;color:var(--tx2)}
.at-carte.nouveau b{color:var(--tx);font-size:.9rem}
.at-puce{display:inline-flex;align-items:center;font-size:.72rem;padding:.1rem .6rem;border-radius:999px;border:1px solid var(--v16);white-space:nowrap}
.at-puce.pret{border-color:color-mix(in srgb,var(--tx-ok) 40%,transparent);color:color-mix(in srgb,var(--tx-ok) 80%,var(--tx))}
.at-puce.brouillon{border-color:color-mix(in srgb,var(--tx-att) 40%,transparent);color:color-mix(in srgb,var(--tx-att) 80%,var(--tx))}
.at-puce.base{border-color:var(--or);color:var(--tx)}
.at-tailles{display:flex;flex-wrap:wrap;gap:.35rem}
.at-gestes{margin-top:auto;display:flex;gap:.5rem;flex-wrap:wrap}
.at-gestes button{flex:1 1 auto}

/* ── Le modèle (moteur) ── */
.at-trois{display:grid;grid-template-columns:19rem minmax(0,1fr) 23rem;gap:.9rem}
.cx>.at-trois{flex:1 1 0;min-height:0}
.at-bases{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem}
.at-base{display:flex;align-items:center;gap:.55rem;padding:.45rem .55rem;border-radius:10px;text-align:left;background:var(--f-carte2);min-width:0}
.at-base.on{border:2px solid var(--or)}
.at-base svg{width:1.6rem;height:2rem;flex:0 0 auto}
.at-base b{display:block;font-size:.82rem}
.at-champs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem .6rem}
.at-champs label{display:flex;flex-direction:column;gap:.2rem;font-size:.74rem;color:var(--tx2);min-width:0}
.at-champs label.large{grid-column:1/-1}
.at-champs input,.at-champs select,.at-champs textarea{font-size:.84rem;width:100%}
.at-champs textarea{resize:none;height:3.4em}
table.at-tab{width:100%;border-collapse:collapse;font-size:.8rem;font-variant-numeric:tabular-nums}
.at-tab th{font-weight:600;color:var(--tx2);text-align:center;padding:.2rem .25rem;white-space:nowrap}
.at-tab th:first-child,.at-tab td:first-child{text-align:left}
.at-tab td{padding:.12rem .25rem;border-top:1px solid var(--v055)}
.at-tab input[type=text]{width:4.2rem;text-align:right;padding:.16rem .35rem;font-size:.8rem}
.at-tab th label{display:inline-flex;align-items:center;gap:.25rem;cursor:pointer}
.at-tab th.base{color:var(--tx-or)}
.at-ais{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}
.at-ais label{display:flex;flex-direction:column;gap:.2rem;font-size:.74rem;color:var(--tx2)}
.cx-carte>.at-apercu{flex:1 1 0;min-height:0}
.at-apercu{border-radius:12px;background:#F3EEE5;color:#1C1B18;display:flex;align-items:center;justify-content:center;overflow:hidden}
.at-apercu svg{display:block}
.at-ligne{display:flex;justify-content:space-between;gap:.6rem;font-size:.8rem}
.at-ligne span:first-child{color:var(--tx2)}
.at-ligne span:last-child{font-variant-numeric:tabular-nums;text-align:right}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Atelier de création ». */
function pageAtelier(ouverture) {
  const depart = JSON.stringify(String(ouverture || ''));
  return `${TETE()}
<title>${T("Atelier de création — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.atelier}</span><h1 id="titre">${T("Atelier de création")}</h1>
  <span class="cx-resume" id="sous"></span>
  <div class="cx-actions" id="actions"></div></div>
<div class="cx" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var DEPART = ${depart};

  var D = null;            // atelier:donnees
  var VUE = 'biblio';      // 'biblio' | 'modele'
  var CAT = '', ETAT = '', Q = '';
  var SEL = '';            // modèle choisi dans la bibliothèque
  var M = null;            // le modèle en création ou en modification
  var TRACE = false;       // base, options, tableau ou aisances changés : retracer à l enregistrement
  var AP = null;           // dernier aperçu reçu
  var TAP = 'M';           // taille montrée dans l aperçu
  var TOUTES = false;      // toutes les tailles emboîtées
  var OCCUPE = false;

  /* Les mots de la fenêtre, par CLÉ (voir l en-tête). */
  var LBASE = { robe: '${T("Robe droite")}', chemisier: '${T("Chemisier")}', jupe: '${T("Jupe")}', pantalon: '${T("Pantalon")}' };
  var LBASED = { robe: '${T("devant, dos, pinces de taille")}', chemisier: '${T("devant, dos, manche")}',
    jupe: '${T("devant, dos, pinces")}', pantalon: '${T("devant, dos")}' };
  var LCAT = { robes: '${T("Robes")}', hauts: '${T("Hauts")}', pantalons: '${T("Pantalons")}', jupes: '${T("Jupes")}',
    manteaux: '${T("Manteaux")}', motifs: '${T("Motifs")}' };
  var LETAT = { brouillon: '${T("Brouillon")}', pret: '${T("Prêt à couper")}', archive: '${T("Archivé")}' };
  var LETATS = { brouillon: '${T("Brouillons")}', pret: '${T("Prêts à couper")}', archive: '${T("Archivés")}' };
  var LMES = { poitrine: '${T("Tour de poitrine")}', taille: '${T("Tour de taille")}', hanches: '${T("Tour de hanches")}',
    longDos: '${T("Longueur taille-dos")}', carrure: '${T("Carrure dos")}', hautPoitrine: '${T("Hauteur de poitrine")}',
    cou: '${T("Tour de cou")}', tourBras: '${T("Tour de bras")}', longBras: '${T("Longueur de bras")}',
    montant: '${T("Hauteur de montant")}', entrejambe: '${T("Longueur d’entrejambe")}' };
  var LOPT = {
    encolure: { ronde: '${T("Ronde")}', v: '${T("En V")}', bateau: '${T("Bateau")}' },
    manche: { sans: '${T("Sans manche")}', courte: '${T("Courte")}', longue: '${T("Longue")}' },
    formeJupe: { droite: '${T("Droite")}', crayon: '${T("Crayon")}', evasee: '${T("Évasée")}' },
    formePantalon: { droit: '${T("Droit")}', large: '${T("Large")}', fusele: '${T("Fuselé")}' }
  };
  var LPIECE = { devant: '${T("Devant")}', dos: '${T("Dos")}', manche: '${T("Manche")}' };
  var LCTRL = { emmanchure: '${T("Emmanchure")}', cote: '${T("Couture de côté")}', tete: '${T("Tête de manche")}',
    embu: '${T("Embu de la manche")}', fourche: '${T("Fourche")}', entrejambe: '${T("Entrejambe")}' };
  /* Les pictogrammes des bases : un croquis à plat, trait seul. */
  var PICTO = {
    robe: '<svg viewBox="0 0 120 160" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M44 10l-22 14 6 30 10-4-4 100h52l-4-100 10 4 6-30-22-14c-2 8-9 12-16 12s-14-4-16-12z"/></svg>',
    chemisier: '<svg viewBox="0 0 130 120" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M48 8L14 22l-8 44 16 4 6-26v68h74V44l6 26 16-4-8-44L82 8c-3 8-10 12-17 12S51 16 48 8z"/></svg>',
    jupe: '<svg viewBox="0 0 120 130" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M30 8h60l22 112H8z"/></svg>',
    pantalon: '<svg viewBox="0 0 100 170" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M18 6h64l8 156H58L50 50l-8 112H10z"/></svg>'
  };

  var MOTIFS = {
    session: '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit: '${T("Votre rôle ne permet pas ce geste dans l’atelier.")}',
    indisponible: '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}',
    delai: '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    nom: '${T("Donnez un nom au modèle.")}',
    base: '${T("Choisissez un patron de base.")}',
    ref_prise: '${T("Cette référence est déjà prise par un autre modèle.")}',
    tailles: '${T("Gardez au moins une taille, dont la taille de base.")}',
    introuvable: '${T("Ce modèle n’existe plus.")}',
    nuage: '${T("Enregistré sur ce poste seulement : le serveur n’a pas confirmé. Réessayez.")}',
    echec: '${T("L’opération a échoué.")}'
  };
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ((r && r.detail) ? String(r.detail) : ('${T("Erreur inattendue (")}' + esc(m || '?') + ').')); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function nombre(v, d){ var n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : d; }
  function cm(v){
    var n = Math.round((Number(v) || 0) * 10) / 10;
    return String(n).replace('.', '${SEP_DEC()}') + ' cm';
  }
  function jour(iso){
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('${LIEU()}', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { return String(iso).slice(0, 10); }
  }
  function nomPiece(p){ return LPIECE[p.id] || szTd(p.nom || ''); }

  /* ══ LE DESSIN DES PIÈCES (SVG, en cm mis à l échelle) ═══════════════════
     « jeux » : une liste de { pieces, style } — plusieurs jeux se superposent
     (tailles emboîtées). La mise en page (une pièce à côté de l autre) se fait
     sur l union des boîtes de tous les jeux, pour que les tailles s alignent. */
  function boitePiece(p){
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    (p.contour || []).forEach(function(n){
      [n, n.c1, n.c2].forEach(function(q){ if (!q) return;
        if (q.x < x0) x0 = q.x; if (q.y < y0) y0 = q.y; if (q.x > x1) x1 = q.x; if (q.y > y1) y1 = q.y; });
    });
    return { x0: x0, y0: y0, x1: x1, y1: y1 };
  }
  function chemin(contour, X, Y){
    if (!contour || !contour.length) return '';
    var d = 'M' + X(contour[0].x) + ' ' + Y(contour[0].y);
    for (var i = 1; i < contour.length; i++) {
      var n = contour[i];
      d += n.c1 && n.c2 ? ' C' + X(n.c1.x) + ' ' + Y(n.c1.y) + ' ' + X(n.c2.x) + ' ' + Y(n.c2.y) + ' ' + X(n.x) + ' ' + Y(n.y)
                        : ' L' + X(n.x) + ' ' + Y(n.y);
    }
    var f = contour[0];
    if (f.c1 && f.c2) d += ' C' + X(f.c1.x) + ' ' + Y(f.c1.y) + ' ' + X(f.c2.x) + ' ' + Y(f.c2.y) + ' ' + X(f.x) + ' ' + Y(f.y);
    return d + ' Z';
  }
  function svgPieces(jeux, W, H, o){
    o = o || {};
    var ref = jeux[0] ? jeux[0].pieces : [];
    if (!ref || !ref.length) return '';
    var boites = ref.map(function(p, i){
      var b = boitePiece(p);
      jeux.forEach(function(j){ var q = j.pieces[i]; if (!q) return; var c = boitePiece(q);
        b.x0 = Math.min(b.x0, c.x0); b.y0 = Math.min(b.y0, c.y0); b.x1 = Math.max(b.x1, c.x1); b.y1 = Math.max(b.y1, c.y1); });
      return b;
    });
    var ecart = o.mini ? 4 : 7;
    var largeur = 0, hauteur = 0;
    boites.forEach(function(b){ largeur += (b.x1 - b.x0); hauteur = Math.max(hauteur, b.y1 - b.y0); });
    largeur += ecart * (boites.length - 1);
    var marge = o.mini ? 8 : 18;
    var k = Math.min((W - 2 * marge) / Math.max(1, largeur), (H - 2 * marge - (o.mini ? 0 : 16)) / Math.max(1, hauteur));
    var ox0 = (W - largeur * k) / 2, oy0 = (H - hauteur * k) / 2 - (o.mini ? 0 : 6);
    var r1 = function(v){ return Math.round(v * 10) / 10; };
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" fill="none" stroke-linejoin="round" role="img" aria-label="' + esc(o.titre || '${T("Pièces du patron")}') + '">';
    var cur = 0;
    boites.forEach(function(b, i){
      var bx = cur; cur += (b.x1 - b.x0) + ecart;
      var X = function(x){ return r1(ox0 + (bx + x - b.x0) * k); };
      var Y = function(y){ return r1(oy0 + (y - b.y0) * k); };
      jeux.forEach(function(j){
        var p = j.pieces[i]; if (!p) return;
        s += '<path d="' + chemin(p.contour, X, Y) + '" stroke="' + (j.trait || '#1C1B18') + '" stroke-width="' + (j.epais || 1.6) + '"'
          + (j.tirets ? ' stroke-dasharray="' + j.tirets + '"' : '') + '/>';
      });
      var p0 = jeux[0].pieces[i];
      if (o.mini || !p0) return;
      if (p0.pli) s += '<path d="M' + X(p0.pli.a.x) + ' ' + Y(p0.pli.a.y) + ' L' + X(p0.pli.b.x) + ' ' + Y(p0.pli.b.y) + '" stroke="#1C1B18" stroke-width="1.2" stroke-dasharray="8 4"/>';
      (p0.pinces || []).forEach(function(pc){
        s += '<path d="M' + X(pc.gauche.x) + ' ' + Y(pc.gauche.y) + ' L' + X(pc.sommet.x) + ' ' + Y(pc.sommet.y) + ' L' + X(pc.droite.x) + ' ' + Y(pc.droite.y)
          + (pc.bas ? ' L' + X(pc.bas.x) + ' ' + Y(pc.bas.y) + ' L' + X(pc.gauche.x) + ' ' + Y(pc.gauche.y) : '') + '" stroke="#A04A3A" stroke-width="1.3"/>';
      });
      if (p0.droitFil) {
        var a = p0.droitFil.a, z = p0.droitFil.b;
        s += '<path d="M' + X(a.x) + ' ' + Y(a.y) + ' L' + X(z.x) + ' ' + Y(z.y) + ' M' + r1(X(a.x) - 4) + ' ' + r1(Y(a.y) + 6) + ' L' + X(a.x) + ' ' + Y(a.y) + ' L' + r1(X(a.x) + 4) + ' ' + r1(Y(a.y) + 6)
          + ' M' + r1(X(z.x) - 4) + ' ' + r1(Y(z.y) - 6) + ' L' + X(z.x) + ' ' + Y(z.y) + ' L' + r1(X(z.x) + 4) + ' ' + r1(Y(z.y) - 6) + '" stroke="#1C1B18" stroke-width="1.1"/>';
      }
      (p0.crans || []).forEach(function(c){ s += '<circle cx="' + X(c.x) + '" cy="' + Y(c.y) + '" r="2.2" fill="#1C1B18" stroke="none"/>'; });
      var cxm = X((b.x0 + b.x1) / 2), cym = r1(oy0 + hauteur * k + 14);
      s += '<text x="' + cxm + '" y="' + cym + '" text-anchor="middle" fill="#1C1B18" stroke="none" font-size="11" font-weight="700" font-family="Segoe UI, sans-serif">'
        + esc(nomPiece(p0).toUpperCase()) + '</text>';
    });
    return s + '</svg>';
  }

  /* ══ LA BIBLIOTHÈQUE ═══════════════════════════════════════════════════ */
  function filtres(){
    var q = Q.trim().toLowerCase();
    return (D.modeles || []).filter(function(m){
      if (CAT && m.categorie !== CAT) return false;
      if (ETAT && m.etat !== ETAT) return false;
      if (!ETAT && m.etat === 'archive') return false;
      if (!q) return true;
      return (m.nom + ' ' + m.ref + ' ' + (LBASE[m.base] || '')).toLowerCase().indexOf(q) >= 0;
    });
  }
  function dessinerBiblio(){
    var tous = D.modeles || [];
    var nbBr = tous.filter(function(m){ return m.etat === 'brouillon'; }).length;
    document.getElementById('titre').textContent = '${T("Atelier de création")}';
    document.getElementById('sous').textContent = (tous.length > 1 ? '${T("{0} modèles")}'.split('{0}').join(tous.length) : '${T("{0} modèle")}'.split('{0}').join(tous.length))
      + (nbBr ? ' · ' + (nbBr > 1 ? '${T("{0} brouillons")}'.split('{0}').join(nbBr) : '${T("1 brouillon")}') : '');
    document.getElementById('actions').innerHTML = D.peutAjouter ? '<button type="button" class="prim" id="a-nouveau">${T("Nouveau modèle")}</button>' : '';

    var seg = function(attr, v, lib, actif){
      return '<button type="button" class="' + (actif ? 'on' : '') + '" ' + attr + '="' + v + '">' + lib + '</button>';
    };
    var h = '<div class="cx-barre"><div class="ed-seg" role="group" aria-label="${T("Catégorie")}">'
      + seg('data-cat', '', '${T("Tous")}', !CAT)
      + (D.categories || []).map(function(c){ return seg('data-cat', c.cle, LCAT[c.cle] || szTd(c.nom), CAT === c.cle); }).join('')
      + '</div><div class="ed-seg" role="group" aria-label="${T("État")}">'
      + (D.etats || []).map(function(e){ return seg('data-etat', e.cle, LETATS[e.cle] || szTd(e.nom), ETAT === e.cle); }).join('')
      + '</div><div class="droite"><label class="rf-rch">${ICO.loupe}<input type="search" id="a-q" maxlength="60" aria-label="${T("Rechercher un modèle")}" placeholder="${T("Nom, référence, base…")}" value="' + esc(Q) + '"></label></div></div>';

    var liste = filtres();
    var t = '<div class="cx-carte sz-pagee">';
    if (!tous.length) {
      t += '<div class="vide">${T("Aucun modèle pour l’instant. Partez d’un patron de base : il se trace à vos mesures.")}</div>';
    }
    t += '<div class="at-grille" data-pages="atelier">';
    t += liste.map(function(m){
      return '<button type="button" class="at-carte' + (SEL === m.id ? ' on' : '') + '" data-sel="' + esc(m.id) + '" data-ctx-ligne="' + esc(m.id) + '" title="${T("Clic : détails · double-clic : ouvrir")}">'
        + '<span class="vig">' + svgPieces([{ pieces: m.pieces || [] }], 176, 150, { mini: true, titre: m.nom }) + '</span>'
        + '<span class="tx"><b>' + esc(m.nom) + '</b><span>' + esc((m.ref ? m.ref + ' · ' : '') + 'v' + (m.version || 1) + ' · ' + (m.tailles || []).join(' ')) + '</span></span></button>';
    }).join('');
    if (D.peutAjouter) t += '<button type="button" class="at-carte nouveau" id="a-nouveau2"><b>${T("Partir d’un patron de base")}</b><span>${T("Robe, chemisier, jupe, pantalon — tracé à vos mesures")}</span></button>';
    t += '</div>';
    if (tous.length && !liste.length) t += '<div class="vide">${T("Aucun modèle ne correspond.")}</div>';
    t += '<div class="cx-pied"><span>' + liste.length + ' ' + (liste.length > 1 ? '${T("modèles")}' : '${T("modèle")}') + '</span></div></div>';

    var m = SEL ? (D.modeles || []).filter(function(x){ return x.id === SEL; })[0] : null;
    var p = '<div class="cx-carte">';
    if (!m) {
      p += '<h2>${T("Modèle choisi")}</h2><div class="cx-sub">${T("Cliquez une carte pour voir ses pièces, ses tailles et ses versions.")}</div>';
    } else {
      p += '<h2>' + esc(m.nom) + ' <span class="at-puce ' + esc(m.etat) + '">' + esc(LETAT[m.etat] || m.etat) + '</span></h2>'
        + '<div class="cx-sub">' + esc((m.ref ? m.ref + ' · ' : '') + (LBASE[m.base] || '') + ' · ' + '${T("modifié le {0}")}'.split('{0}').join(jour(m.updatedAt))) + '</div>'
        + '<div class="cx-sep"></div><h2>${T("Pièces du patron")}</h2>'
        + (m.pieces || []).map(function(pc){
            return '<div class="cx-etat"><span>' + esc(nomPiece(pc)) + ' · ×' + (pc.qte || 1) + (pc.aupli ? ' ${T("au pli")}' : '') + '</span><span class="cx-gris">' + (pc.pinces && pc.pinces.length ? '${T("pince")}' : '') + '</span></div>';
          }).join('')
        + '<div class="cx-sep"></div><h2>${T("Tailles gradées")}</h2><div class="at-tailles">'
        + (m.tailles || []).map(function(tl){ return '<span class="at-puce' + (tl === m.tailleBase ? ' base' : '') + '">' + esc(tl) + (tl === m.tailleBase ? ' · ${T("base")}' : '') + '</span>'; }).join('')
        + '</div>'
        + '<div class="cx-etat"><span>${T("Tissu estimé (laize 140 cm)")}</span><span>' + (m.tissu ? String(m.tissu.metres).replace('.', '${SEP_DEC()}') + ' m' : '—') + '</span></div>'
        + '<div class="cx-sep"></div><h2>${T("Versions")}</h2>'
        + (m.versions || []).slice(-4).reverse().map(function(v){
            return '<div class="cx-etat"><span>v' + v.n + ' — ' + esc(v.note || '') + '</span><span class="cx-gris">' + esc(jour(v.date)) + '</span></div>';
          }).join('')
        + '<div class="at-gestes">'
        + (D.peutSupprimer ? '<button type="button" class="danger" data-suppr="' + esc(m.id) + '">${T("Supprimer")}</button>' : '')
        + (D.peutAjouter ? '<button type="button" data-dupl="' + esc(m.id) + '">${T("Dupliquer")}</button>' : '')
        + '<button type="button" class="prim" data-ouvrir="' + esc(m.id) + '">${T("Ouvrir le modèle")}</button></div>';
    }
    p += '</div>';
    corps.innerHTML = h + '<div class="cx-deux">' + t + p + '</div>';
  }

  /* ══ LE MODÈLE (le moteur) ═════════════════════════════════════════════ */
  function copie(o){ return JSON.parse(JSON.stringify(o || {})); }
  function modeleNeuf(base){
    var b = (D.bases || []).filter(function(x){ return x.cle === base; })[0] || D.bases[0];
    return { id: '', nom: '', ref: '', categorie: b.categorie, etat: 'brouillon', base: b.cle, options: copie(b.options),
      tableau: copie(D.standard), aisances: copie(D.aisances), tailleBase: 'M', tailles: (D.tailles || []).slice(),
      produitId: '', notes: '' };
  }
  function optionsBase(){
    var o = M.options || {};
    var sel = function(id, lib, liste, cle, val){
      return '<label>' + lib + '<select id="' + id + '">' + Object.keys(liste).map(function(k){
        return '<option value="' + k + '"' + (val === k ? ' selected' : '') + '>' + liste[k] + '</option>'; }).join('') + '</select></label>';
    };
    var h = '';
    if (M.base === 'robe' || M.base === 'chemisier') {
      h += sel('o-encolure', '${T("Encolure")}', LOPT.encolure, 'encolure', o.encolure || 'ronde');
      h += sel('o-manche', '${T("Manche")}', LOPT.manche, 'manche', o.manche || (M.base === 'robe' ? 'sans' : 'longue'));
    }
    if (M.base === 'jupe') h += sel('o-forme', '${T("Forme")}', LOPT.formeJupe, 'forme', o.forme || 'droite');
    if (M.base === 'pantalon') h += sel('o-forme', '${T("Forme")}', LOPT.formePantalon, 'forme', o.forme || 'droit');
    var libL = M.base === 'pantalon' ? '${T("Longueur de jambe (0 = entrejambe)")}' : (M.base === 'chemisier' ? '${T("Longueur sous la taille")}' : '${T("Longueur sous la taille")}');
    h += '<label>' + libL + '<input type="text" id="o-longueur" maxlength="5" inputmode="decimal" value="' + esc(o.longueur != null ? String(o.longueur).replace('.', '${SEP_DEC()}') : '') + '"></label>';
    return h;
  }
  function dessinerModele(){
    var neuf = !M.id;
    document.getElementById('titre').textContent = neuf ? '${T("Nouveau modèle")}' : (M.nom || '${T("Modèle")}');
    document.getElementById('sous').textContent = neuf ? '${T("Tracé à partir d’un patron de base et de vos mesures")}'
      : ((M.ref ? M.ref + ' · ' : '') + 'v' + (M.version || 1));
    document.getElementById('actions').innerHTML = '<button type="button" id="m-retour">${T("← Bibliothèque")}</button>'
      + ((neuf ? D.peutAjouter : D.peutModifier) ? '<button type="button" class="prim" id="m-enreg">' + (neuf ? '${T("Créer le modèle")}' : '${T("Enregistrer la version")}') + '</button>' : '');

    var g = '<div class="cx-carte"><h2>${T("Patron de base")}</h2><div class="at-bases">'
      + (D.bases || []).map(function(b){
          return '<button type="button" class="at-base' + (M.base === b.cle ? ' on' : '') + '" data-base="' + b.cle + '">' + (PICTO[b.cle] || '')
            + '<span><b>' + esc(LBASE[b.cle] || szTd(b.nom)) + '</b><span class="cx-sub">' + esc(LBASED[b.cle] || '') + '</span></span></button>';
        }).join('') + '</div>'
      + '<div class="at-champs">' + optionsBase() + '</div>'
      + '<div class="cx-sep"></div><h2>${T("Le modèle")}</h2><div class="at-champs">'
      + '<label class="large">${T("Nom")}<input type="text" id="m-nom" maxlength="80" value="' + esc(M.nom) + '"></label>'
      + '<label>${T("Référence")}<input type="text" id="m-ref" maxlength="24" value="' + esc(M.ref) + '" placeholder="RB-014"></label>'
      + '<label>${T("Catégorie")}<select id="m-cat">' + (D.categories || []).map(function(c){
          return '<option value="' + c.cle + '"' + (M.categorie === c.cle ? ' selected' : '') + '>' + esc(LCAT[c.cle] || szTd(c.nom)) + '</option>'; }).join('') + '</select></label>'
      + '<label>${T("État")}<select id="m-etat">' + (D.etats || []).map(function(e){
          return '<option value="' + e.cle + '"' + (M.etat === e.cle ? ' selected' : '') + '>' + esc(LETAT[e.cle] || szTd(e.nom)) + '</option>'; }).join('') + '</select></label>'
      + '<label>${T("Produit lié")}<select id="m-prod"><option value="">${T("— Aucun —")}</option>' + (D.produits || []).map(function(pr){
          return '<option value="' + esc(pr.id) + '"' + (M.produitId === pr.id ? ' selected' : '') + '>' + esc(pr.nom) + '</option>'; }).join('') + '</select></label>'
      + '<label class="large">${T("Notes")}<textarea id="m-notes" maxlength="600">' + esc(M.notes) + '</textarea></label>'
      + '</div></div>';

    var tl = D.tailles || [];
    var c = '<div class="cx-carte"><h2>${T("Tableau de tailles")} <span class="cx-sub">${T("mesures du corps, en cm")}</span>'
      + '<span class="droite"><button type="button" class="mini" id="m-standard">${T("Tableau standard")}</button></span></h2>'
      + '<table class="at-tab"><thead><tr><th>${T("Mesure")}</th>'
      + tl.map(function(t){
          var inclus = (M.tailles || []).indexOf(t) >= 0;
          return '<th class="' + (M.tailleBase === t ? 'base' : '') + '"><label><input type="checkbox" data-taille="' + t + '"' + (inclus ? ' checked' : '') + ' aria-label="${T("Taille gardée :")} ' + t + '">' + t + '</label></th>';
        }).join('') + '</tr></thead><tbody>'
      + (D.mesures || []).map(function(m){
          return '<tr><td>' + esc(LMES[m.cle] || szTd(m.nom)) + '</td>' + tl.map(function(t){
            var v = ((M.tableau || {})[t] || {})[m.cle];
            return '<td><input type="text" inputmode="decimal" maxlength="5" data-t="' + t + '" data-m="' + m.cle + '" aria-label="' + esc((LMES[m.cle] || m.nom) + ' ' + t) + '" value="' + esc(v != null ? String(v).replace('.', '${SEP_DEC()}') : '') + '"></td>';
          }).join('') + '</tr>';
        }).join('')
      + '</tbody></table>'
      + '<div class="at-champs"><label>${T("Taille de base (tracé de référence)")}<select id="m-tbase">' + tl.map(function(t){
          return '<option value="' + t + '"' + (M.tailleBase === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></label></div>'
      + '<div class="cx-sep"></div><h2>${T("Aisances")} <span class="cx-sub">${T("ajoutées au tour, en cm")}</span></h2><div class="at-ais">'
      + ['poitrine', 'taille', 'hanches'].map(function(k){
          return '<label>' + esc(LMES[k]) + '<input type="text" inputmode="decimal" maxlength="4" id="a-' + k + '" value="' + esc(String((M.aisances || {})[k] != null ? M.aisances[k] : '').replace('.', '${SEP_DEC()}')) + '"></label>';
        }).join('') + '</div></div>';

    var a = '<div class="cx-carte"><h2>${T("Aperçu")}<span class="droite"><span class="ed-seg" role="group" aria-label="${T("Taille de l’aperçu")}">'
      + tl.map(function(t){ return '<button type="button" class="' + (!TOUTES && TAP === t ? 'on' : '') + '" data-tap="' + t + '">' + t + '</button>'; }).join('')
      + '<button type="button" class="' + (TOUTES ? 'on' : '') + '" data-toutes="1">${T("Toutes")}</button></span></span></h2>'
      + '<div class="at-apercu" id="m-apercu"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div></div>'
      + '<div id="m-ctrl"></div></div>';

    corps.innerHTML = '<div class="at-trois">' + g + c + a + '</div>';
    if (!neuf && TRACE) dire('${T("Base, options ou mesures changées : les pièces seront retracées à l’enregistrement.")}', 'att');
    demanderApercu();
  }

  /* L aperçu : redemandé au site à chaque réglage (après une pause de frappe). */
  var apT = null, apN = 0;
  function demanderApercu(){
    clearTimeout(apT);
    apT = setTimeout(function(){
      var n = ++apN;
      appeler('atelier:apercu', [{ base: M.base, options: M.options, tableau: M.tableau, aisances: M.aisances,
        taille: TAP, toutes: TOUTES }]).then(function(r){
        if (n !== apN) return;                      // une réponse dépassée par une plus récente
        AP = r && r.ok ? r : null;
        peindreApercu(r);
      });
    }, 220);
  }
  function peindreApercu(r){
    var z = document.getElementById('m-apercu'); if (!z) return;
    var ctrl = document.getElementById('m-ctrl');
    if (!r || !r.ok) { z.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; if (ctrl) ctrl.innerHTML = ''; return; }
    var W = Math.max(200, z.clientWidth || 340), H = Math.max(200, z.clientHeight || 420);
    var jeux;
    if (TOUTES && r.tailles) {
      jeux = [{ pieces: r.tailles[M.tailleBase] || r.pieces, trait: '#1C1B18', epais: 1.8 }];
      (M.tailles || []).forEach(function(t){
        if (t === M.tailleBase || !r.tailles[t]) return;
        jeux.push({ pieces: r.tailles[t], trait: '#8F897D', epais: 0.9, tirets: '4 3' });
      });
    } else jeux = [{ pieces: r.pieces }];
    z.innerHTML = svgPieces(jeux, W, H, { titre: TOUTES ? '${T("Toutes les tailles emboîtées")}' : '${T("Pièces de la taille")} ' + TAP });
    if (!ctrl) return;
    var lignes = '<div class="at-ligne"><span>${T("Tissu estimé (laize 140 cm)")}</span><span>' + String(r.tissu ? r.tissu.metres : 0).replace('.', '${SEP_DEC()}') + ' m</span></div>';
    (r.pieces || []).forEach(function(p){
      Object.keys(p.mesures || {}).forEach(function(k){
        lignes += '<div class="at-ligne"><span>' + esc(nomPiece(p) + ' · ' + (LCTRL[k] || k)) + '</span><span>' + cm(p.mesures[k]) + '</span></div>';
      });
    });
    ctrl.innerHTML = lignes;
  }

  /* Ramasse la saisie du formulaire dans M (sans redessiner : on garde le curseur). */
  function ramasser(cible){
    if (!M || !cible) return;
    var id = cible.id || '';
    if (id === 'm-nom') M.nom = cible.value;
    else if (id === 'm-ref') M.ref = cible.value;
    else if (id === 'm-cat') M.categorie = cible.value;
    else if (id === 'm-etat') M.etat = cible.value;
    else if (id === 'm-prod') M.produitId = cible.value;
    else if (id === 'm-notes') M.notes = cible.value;
    else if (id === 'm-tbase') { M.tailleBase = cible.value; if ((M.tailles || []).indexOf(cible.value) < 0) M.tailles.push(cible.value); TRACE = true; dessinerModele(); return; }
    else if (id === 'o-encolure' || id === 'o-manche' || id === 'o-forme') { M.options = M.options || {}; M.options[id.slice(2)] = cible.value; TRACE = true; demanderApercu(); }
    else if (id === 'o-longueur') { M.options = M.options || {}; var L = nombre(cible.value, NaN); if (isFinite(L)) { M.options.longueur = L; TRACE = true; demanderApercu(); } }
    else if (id.indexOf('a-') === 0 && id !== 'a-q') { var v = nombre(cible.value, NaN); if (isFinite(v)) { M.aisances[id.slice(2)] = v; TRACE = true; demanderApercu(); } }
    else if (cible.hasAttribute('data-t')) {
      var t = cible.getAttribute('data-t'), mk = cible.getAttribute('data-m'), x = nombre(cible.value, NaN);
      if (isFinite(x)) { M.tableau[t] = M.tableau[t] || {}; M.tableau[t][mk] = x; TRACE = true; demanderApercu(); }
    }
  }

  function enregistrer(btn){
    if (OCCUPE || !M) return;
    if (!String(M.nom || '').trim()) { dire(MOTIFS.nom, 'err'); var n = document.getElementById('m-nom'); if (n) n.focus(); return; }
    OCCUPE = true; if (btn) btn.disabled = true;
    dire('${T("Enregistrement…")}');
    var s = copie(M); s.regenerer = TRACE;
    appeler('atelier:ecrire', [s]).then(function(r){
      OCCUPE = false; if (btn) btn.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      SEL = r.id || SEL; TRACE = false; VUE = 'biblio'; M = null;
      charger(function(){ dire('${T("Modèle enregistré.")}', 'bon'); });
    });
  }

  /* ══ LES GESTES ═══════════════════════════════════════════════════════ */
  corps.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var b;
    if ((b = t.closest('[data-cat]'))) { CAT = b.getAttribute('data-cat'); dessiner(); return; }
    if ((b = t.closest('[data-etat]'))) { var e = b.getAttribute('data-etat'); ETAT = ETAT === e ? '' : e; dessiner(); return; }
    if ((b = t.closest('#a-nouveau2'))) { ouvrirNeuf(); return; }
    if ((b = t.closest('[data-ouvrir]'))) { ouvrirModele(b.getAttribute('data-ouvrir')); return; }
    if ((b = t.closest('[data-dupl]'))) { dupliquer(b.getAttribute('data-dupl')); return; }
    if ((b = t.closest('[data-suppr]'))) { supprimer(b.getAttribute('data-suppr')); return; }
    if ((b = t.closest('[data-sel]'))) { SEL = b.getAttribute('data-sel'); dessiner(); return; }
    if ((b = t.closest('[data-base]'))) {
      var nb = b.getAttribute('data-base'); if (nb === M.base) return;
      var bs = (D.bases || []).filter(function(x){ return x.cle === nb; })[0];
      M.base = nb; M.options = copie(bs ? bs.options : {}); if (!M.id && bs) M.categorie = bs.categorie;
      TRACE = true; dessinerModele(); return;
    }
    if ((b = t.closest('[data-tap]'))) { TAP = b.getAttribute('data-tap'); TOUTES = false; dessinerModele(); return; }
    if ((b = t.closest('[data-toutes]'))) { TOUTES = !TOUTES; dessinerModele(); return; }
    if ((b = t.closest('#m-standard'))) { M.tableau = copie(D.standard); TRACE = true; dessinerModele(); dire('${T("Tableau standard remis.")}', 'bon'); return; }
  });
  corps.addEventListener('dblclick', function(ev){
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-sel]') : null;
    if (b) ouvrirModele(b.getAttribute('data-sel'));
  });
  corps.addEventListener('input', function(ev){
    var t = ev.target;
    if (t && t.id === 'a-q') { Q = t.value; clearTimeout(window._atQ); window._atQ = setTimeout(redessinerSansPerdreLaSaisie, 200); return; }
    ramasser(t);
  });
  corps.addEventListener('change', function(ev){
    var t = ev.target; if (!t) return;
    if (t.hasAttribute && t.hasAttribute('data-taille')) {
      var tl = t.getAttribute('data-taille');
      var ls = (M.tailles || []).filter(function(x){ return x !== tl; });
      if (t.checked) ls.push(tl);
      if (tl === M.tailleBase && !t.checked) { t.checked = true; dire(MOTIFS.tailles, 'att'); return; }
      M.tailles = (D.tailles || []).filter(function(x){ return ls.indexOf(x) >= 0; });
      if (TOUTES) demanderApercu();
      return;
    }
    if (t.tagName === 'SELECT') ramasser(t);
  });
  document.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    if (t.closest('#a-nouveau')) { ouvrirNeuf(); return; }
    if (t.closest('#m-retour')) { revenir(); return; }
    if (t.closest('#m-enreg')) { enregistrer(t.closest('#m-enreg')); return; }
  });

  function ouvrirNeuf(){ if (!D) return; M = modeleNeuf('robe'); TRACE = true; TAP = 'M'; TOUTES = false; VUE = 'modele'; dessiner(); var n = document.getElementById('m-nom'); if (n) n.focus(); }
  function ouvrirModele(id){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0];
    if (!m) { dire(MOTIFS.introuvable, 'err'); return; }
    SEL = id; M = copie(m); TRACE = false; TAP = m.tailleBase || 'M'; TOUTES = false; VUE = 'modele'; dessiner();
  }
  function revenir(){
    if (TRACE && M && M.id) {
      szConfirmer({ titre: '${T("Quitter sans enregistrer ?")}', texte: '${T("Les changements de base, d’options ou de mesures seront perdus.")}', oui: '${T("Quitter")}', danger: true })
        .then(function(ok){ if (ok) { M = null; TRACE = false; VUE = 'biblio'; dessiner(); } });
      return;
    }
    M = null; TRACE = false; VUE = 'biblio'; dessiner();
  }
  function dupliquer(id){
    if (OCCUPE) return; OCCUPE = true; dire('${T("Copie…")}');
    appeler('atelier:dupliquer', [id]).then(function(r){
      OCCUPE = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      SEL = r.id || SEL; charger(function(){ dire('${T("Copie créée, en brouillon.")}', 'bon'); });
    });
  }
  function supprimer(id){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0]; if (!m) return;
    szConfirmer({ titre: '${T("Supprimer ce modèle ?")}', texte: '${T("Le modèle, ses pièces et ses versions disparaissent. Les produits liés ne sont pas touchés.")}',
      details: [['${T("Modèle")}', m.nom + (m.ref ? ' (' + m.ref + ')' : '')], ['${T("Versions")}', String((m.versions || []).length)]],
      oui: '${T("Supprimer le modèle")}', danger: true }).then(function(ok){
      if (!ok) return;
      dire('${T("Suppression…")}');
      appeler('atelier:supprimer', [id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        if (SEL === id) SEL = '';
        charger(function(){ dire('${T("Modèle supprimé.")}', 'att'); });
      });
    });
  }

  /* Le clic droit du socle : les gestes de la carte. */
  /* Mêmes gestes, mêmes droits que les boutons du panneau (règle #110). */
  window.szCtxEntrees = function(el){
    var id = el && el.getAttribute ? el.getAttribute('data-ctx-ligne') : '';
    if (!id || !D) return null;
    var out = [{ lib: '${T("Ouvrir le modèle")}', fn: function(){ ouvrirModele(id); } }];
    if (D.peutAjouter) out.push({ lib: '${T("Dupliquer")}', fn: function(){ dupliquer(id); } });
    if (D.peutSupprimer) { out.push({ trait: true }); out.push({ lib: '${T("Supprimer")}', dgr: true, fn: function(){ supprimer(id); } }); }
    return out;
  };

  function dessiner(){
    if (!D) return;
    if (VUE === 'modele' && M) dessinerModele(); else dessinerBiblio();
  }
  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('a-q');
    var d0 = q ? q.selectionStart : null, f0 = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('a-q');
    if (q2) { q2.focus({ preventScroll: true }); try { if (d0 != null) q2.setSelectionRange(d0, f0); } catch (e) {} }
  }
  function charger(apres){
    appeler('atelier:donnees', []).then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="vide"><strong>${T("Atelier indisponible")}</strong><div style="margin-top:.4rem">' + esc(expliquer(r)) + '</div></div>';
        dire(expliquer(r), 'err'); return;
      }
      D = r;
      if (SEL && !(D.modeles || []).some(function(m){ return m.id === SEL; })) SEL = '';
      if (DEPART === 'nouveau' && D.peutAjouter) { DEPART = ''; ouvrirNeuf(); }
      else dessiner();
      if (apres) apres(); else dire('');
    });
  }

  window.addEventListener('resize', function(){
    clearTimeout(window._atR);
    window._atR = setTimeout(function(){ if (VUE === 'modele' && AP) peindreApercu(AP); }, 160);
  });
  /* ⚠ JAMAIS PENDANT UNE SAISIE : recharger remettrait le formulaire à zéro. */
  window.szActualiser = function(){ if (VUE === 'biblio' && !OCCUPE) charger(); };
  window.szRevenir = window.szActualiser;
  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    if (VUE === 'modele') { revenir(); return; }
    if (P && P.fermer) P.fermer();
  });

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);'
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto');
      t.appendChild(b);
    }
    if (actif) {
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageAtelier };
