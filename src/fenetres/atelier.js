'use strict';

/*
 * FENÊTRE « ATELIER DE CRÉATION » — NATIVE (2026-10-16)
 * =============================================================================
 * Sa demande : « un moteur et éditeur pour m'aider dans la création de vêtement
 * et l'enregistrement de modèle et l'impression aussi dans les différents
 * formats ». Esquisses approuvées (« go code le module ») :
 * https://claude.ai/artifact/P9nkurdJFtCvvSTgojfrae
 *
 * LOT 1 : la BIBLIOTHÈQUE des modèles et le MOTEUR — créer un
 * modèle depuis un patron de base (robe, chemisier, jupe, pantalon), régler ses
 * options, son tableau de tailles et ses aisances, voir le patron se tracer en
 * direct, dans une taille ou toutes emboîtées, et l'enregistrer (versions).
 * LOT 2 (7.41.0) : l'ÉDITEUR DE PATRON — une toile en cm (zoom, règle, taille
 * réelle) ; glisser points, poignées de courbe, crans, pinces et droit-fil ;
 * ajouter un point, rendre un bord droit ou courbe, poser un cran ou une pince,
 * mesurer ; aimantation ; couture par bord ; pièces ajoutées, dupliquées,
 * supprimées ; historique (Ctrl+Z / Ctrl+Y) ; enregistrer une version.
 * Les lots suivants : la gradation des retouches, l'impression et l'export,
 * l'aperçu 3D, l'éditeur de motif.
 *
 * ⚠ LA FENÊTRE NE TRACE RIEN (sauf le geste de l'éditeur : un point suit la
 * souris ; la ligne de coupe, les longueurs et le tissu reviennent du site par
 * atelier:analyser, et ce qui s'enregistre est renettoyé par le site). Toute la géométrie (pièces, pinces, crans, tête
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

/* ── L éditeur de patron (lot 2) ── */
.ed-cadre{display:grid;grid-template-columns:auto minmax(0,1fr) 21rem;gap:.7rem;min-height:0}
.cx>.ed-cadre{flex:1 1 0}
.ed-outils{display:flex;flex-direction:column;gap:.3rem;padding:.4rem;border:1px solid var(--sz-bord);border-radius:12px;background:var(--f-carte2);overflow:auto}
.ed-outil{display:flex;flex-direction:column;align-items:center;gap:.15rem;padding:.4rem .3rem;font-size:.72rem;min-width:4.6rem;border-radius:9px;background:transparent;border:1px solid transparent}
.ed-outil svg{width:1.3rem;height:1.3rem}
.ed-outil.on{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
.ed-outils hr{width:100%;border:none;border-top:1px solid var(--v08);margin:.2rem 0}
.ed-toile{position:relative;border-radius:12px;background:#F3EEE5;color:#1C1B18;overflow:hidden;min-height:0;user-select:none}
.ed-toile svg{display:block;position:absolute;left:0;top:0}
.ed-toile.o-sel{cursor:default}.ed-toile.o-point,.ed-toile.o-courbe,.ed-toile.o-cran,.ed-toile.o-pince,.ed-toile.o-mesure{cursor:crosshair}
.ed-toile.glisse{cursor:grabbing}
.ed-coin{position:absolute;right:.6rem;bottom:.5rem;font-size:.76rem;color:#3F3A32;background:rgba(243,238,229,.92);padding:.1rem .45rem;border-radius:6px;font-variant-numeric:tabular-nums;pointer-events:none}
.ed-panneau{min-height:0;overflow:auto}
.ed-panneau .ed-seg{margin-bottom:.6rem}
.ed-bas{display:flex;flex-wrap:wrap;align-items:center;gap:.45rem 1.1rem;font-size:.78rem;color:var(--tx2);padding-top:.55rem}
.ed-bas .grp{display:inline-flex;align-items:center;gap:.3rem}
.ed-bas button.mini.on{border-color:var(--or);background:rgba(var(--or-rgb),.14);color:var(--tx)}
.ed-ligne{display:flex;align-items:center;justify-content:space-between;gap:.5rem;width:100%;padding:.35rem .5rem;border-radius:8px;text-align:left;font-size:.82rem;background:transparent;border:1px solid transparent}
.ed-ligne.on{border-color:var(--or)}
.ed-ligne span:last-child{color:var(--tx2);font-size:.74rem;white-space:nowrap}
.ed-gestes{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.5rem}
.ed-note{font-size:.76rem;color:var(--tx2);margin:.35rem 0 .1rem}
.ed-bords{font-variant-numeric:tabular-nums}
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
        + '<button type="button" data-editer="' + esc(m.id) + '">${T("Éditer le patron")}</button>'
        + '<button type="button" class="prim" data-ouvrir="' + esc(m.id) + '">${T("Ouvrir le modèle")}</button></div>'
        + (m.edite ? '<div class="ed-note">${T("Patron retouché dans l’éditeur : « retracer » depuis le modèle effacerait ces retouches.")}</div>' : '');
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
      + (!neuf ? '<button type="button" id="m-editer"' + (TRACE ? ' disabled title="${T("Enregistrez d’abord les changements du modèle.")}"' : '') + '>${T("Éditer le patron")}</button>' : '')
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
    if (!neuf && TRACE) dire(M.edite ? '${T("Attention : retracer effacera les retouches faites dans l’éditeur de patron.")}'
      : '${T("Base, options ou mesures changées : les pièces seront retracées à l’enregistrement.")}', 'att');
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
    if (M.edite && TRACE && !enregistrer.confirme) {
      szConfirmer({ titre: '${T("Retracer le patron ?")}', texte: '${T("Les pièces seront retracées depuis la base : les retouches faites dans l’éditeur de patron seront perdues.")}',
        oui: '${T("Retracer et enregistrer")}', danger: true }).then(function(ok){ if (ok) { enregistrer.confirme = true; enregistrer(btn); enregistrer.confirme = false; } });
      return;
    }
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

  /* ══ L ÉDITEUR DE PATRON (lot 2) ════════════════════════════════════════
     La fenêtre déplace les nœuds elle-même : le geste doit suivre la souris.
     Ce qui se CALCULE (ligne de coupe, longueur des bords, tissu) vient du site
     (atelier:analyser) ; ce qui s ENREGISTRE est renettoyé par le site.
     Coordonnées des pièces en cm ; chaque pièce est posée sur la toile à POS[i]
     (une mise en page de la toile, jamais enregistrée).
     Le bord i va du nœud i − 1 au nœud i ; le bord 0 ferme le contour. */
  var E = null;            // { m: le modèle, pieces, sel, noeud, poignee, bord, cran, pince }
  var OUTIL = 'sel';
  var K = 6, OX = 40, OY = 40;   // zoom (px par cm) et décalage de la toile
  var POS = [];
  var PILE = [], REFAIRE = [];
  var AN = null;           // dernière analyse du site
  var AIM = { points: true, grille: false, a45: true };
  var CALQ = { couture: true, crans: true, constr: true };
  var UNITE = 'cm';
  var SALE = false;
  var MES = null;          // la mesure en cours : { a, b } en cm de toile
  var GLISSE = null;       // le geste de souris en cours
  var ONGLET = 'prop';
  var LTISSU = { principal: '${T("Principal")}', doublure: '${T("Doublure")}', entoilage: '${T("Entoilage")}', contraste: '${T("Contraste")}' };
  var OUTILS = [
    { cle: 'sel', lib: '${T("Sélection")}', touche: 'V', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 3l14 8-6 1.5L10 19z"/></svg>' },
    { cle: 'point', lib: '${T("Point")}', touche: 'P', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 18L21 6"/><rect x="9" y="9" width="6" height="6" fill="currentColor"/></svg>' },
    { cle: 'courbe', lib: '${T("Courbe")}', touche: 'C', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 19C7 3 17 3 21 19"/><circle cx="7" cy="6" r="1.6" fill="currentColor"/><circle cx="17" cy="6" r="1.6" fill="currentColor"/></svg>' },
    { cle: 'cran', lib: '${T("Cran")}', touche: 'N', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 8h18"/><path d="M12 8v8"/><path d="M9 20h6"/></svg>' },
    { cle: 'pince', lib: '${T("Pince")}', touche: 'D', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 20h18"/><path d="M8 20l4-15 4 15"/></svg>' },
    { cle: 'mesure', lib: '${T("Mesure")}', touche: 'M', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></svg>' }
  ];
  var AIDE_OUTIL = {
    sel: '${T("Glissez un point, une poignée, un cran ou une pince ; cliquez un bord pour le régler ; glissez une pièce pour la ranger, le fond pour vous déplacer.")}',
    point: '${T("Cliquez un bord : un point s’y ajoute sans changer la forme.")}',
    courbe: '${T("Cliquez un bord : une droite devient courbe (glissez ensuite ses poignées), une courbe redevient droite.")}',
    cran: '${T("Cliquez le contour pour poser un cran ; cliquez un cran pour le retirer.")}',
    pince: '${T("Cliquez un bord : une pince de 2 cm sur 8 cm s’y pose, à régler en glissant ses pointes.")}',
    mesure: '${T("Cliquez deux points : la distance s’affiche dans les propriétés.")}'
  };

  /* ── Unités ── */
  function enUnite(v){
    var n = Number(v) || 0;
    if (UNITE === 'mm') return String(Math.round(n * 10));
    if (UNITE === 'po') return String(Math.round(n / 2.54 * 100) / 100).replace('.', '${SEP_DEC()}');
    return String(Math.round(n * 10) / 10).replace('.', '${SEP_DEC()}');
  }
  function lUnite(v){ return enUnite(v) + ' ' + (UNITE === 'po' ? '${T("po")}' : UNITE); }
  function depuisUnite(t){
    var n = nombre(t, NaN); if (!isFinite(n)) return NaN;
    return UNITE === 'mm' ? n / 10 : (UNITE === 'po' ? n * 2.54 : n);
  }

  /* ── Géométrie d interaction (le site garde le calcul qui s enregistre) ── */
  function cub(a, b, c, d, t){
    var u = 1 - t;
    return { x: u*u*u*a.x + 3*u*u*t*b.x + 3*u*t*t*c.x + t*t*t*d.x, y: u*u*u*a.y + 3*u*u*t*b.y + 3*u*t*t*c.y + t*t*t*d.y };
  }
  function lerp(a, b, t){ return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
  function r2(v){ return Math.round(v * 100) / 100; }
  function debutBord(p, b){ var L = p.contour.length; return p.contour[(b - 1 + L) % L]; }
  function pointBord(p, b, t){
    var a = debutBord(p, b), z = p.contour[b];
    return z.c1 && z.c2 ? cub(a, z.c1, z.c2, z, t) : lerp(a, z, t);
  }
  function echantillons(p){
    var out = [];
    for (var b = 1; b <= p.contour.length; b++) {
      var bb = b % p.contour.length, z = p.contour[bb];
      if (z.c1 && z.c2) for (var k = 1; k <= 16; k++) out.push(pointBord(p, bb, k / 16));
      else out.push({ x: z.x, y: z.y });
    }
    return out;
  }
  function dedans(p, x, y){
    var pts = echantillons(p), c = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var a = pts[i], b = pts[j];
      if (((a.y > y) !== (b.y > y)) && (x < (b.x - a.x) * (y - a.y) / ((b.y - a.y) || 1e-9) + a.x)) c = !c;
    }
    return c;
  }
  function sensPiece(p){
    var pts = echantillons(p), s = 0;
    for (var i = 0; i < pts.length; i++) { var a = pts[i], b = pts[(i + 1) % pts.length]; s += a.x * b.y - b.x * a.y; }
    return s > 0 ? 1 : -1;
  }
  /* Le point du contour le plus proche de (x, y), en cm de la pièce : { bord, t, pt, d }. */
  function plusProcheBord(p, x, y){
    var best = null;
    for (var b = 0; b < p.contour.length; b++) {
      for (var k = 0; k <= 48; k++) {
        var t = k / 48, q = pointBord(p, b, t), d = Math.hypot(q.x - x, q.y - y);
        if (!best || d < best.d) best = { bord: b, t: t, pt: q, d: d };
      }
    }
    if (best) {                                   // affinage autour du meilleur pas
      var lo = Math.max(0, best.t - 1 / 48), hi = Math.min(1, best.t + 1 / 48);
      for (var n = 0; n <= 20; n++) {
        var tt = lo + (hi - lo) * n / 20, qq = pointBord(p, best.bord, tt), dd = Math.hypot(qq.x - x, qq.y - y);
        if (dd < best.d) best = { bord: best.bord, t: tt, pt: qq, d: dd };
      }
    }
    return best;
  }

  /* ── Toile ↔ écran ── */
  function sx(i, x){ return Math.round(((x + POS[i].x) * K + OX) * 10) / 10; }
  function sy(i, y){ return Math.round(((y + POS[i].y) * K + OY) * 10) / 10; }
  function versPiece(i, mx, my){ return { x: (mx - OX) / K - POS[i].x, y: (my - OY) / K - POS[i].y }; }
  function boiteP(p){
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    echantillons(p).forEach(function(q){ if (q.x < x0) x0 = q.x; if (q.y < y0) y0 = q.y; if (q.x > x1) x1 = q.x; if (q.y > y1) y1 = q.y; });
    return { x0: x0, y0: y0, x1: x1, y1: y1 };
  }
  function ranger(){
    var cur = 0; POS = [];
    E.pieces.forEach(function(p){ var b = boiteP(p); POS.push({ x: cur - b.x0, y: -b.y0 }); cur += (b.x1 - b.x0) + 8; });
  }
  function ajuster(){
    var z = document.getElementById('e-toile'); if (!z || !E.pieces.length) return;
    var W = z.clientWidth || 800, H = z.clientHeight || 600;
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    E.pieces.forEach(function(p, i){ var b = boiteP(p);
      x0 = Math.min(x0, b.x0 + POS[i].x); y0 = Math.min(y0, b.y0 + POS[i].y); x1 = Math.max(x1, b.x1 + POS[i].x); y1 = Math.max(y1, b.y1 + POS[i].y); });
    K = Math.max(1, Math.min((W - 80) / Math.max(1, x1 - x0), (H - 90) / Math.max(1, y1 - y0)));
    OX = (W - (x1 - x0) * K) / 2 - x0 * K; OY = (H - (y1 - y0) * K) / 2 - y0 * K + 10;
  }
  function zoomer(k2, mx, my){
    k2 = Math.max(1, Math.min(80, k2));
    OX = mx - (mx - OX) * k2 / K; OY = my - (my - OY) * k2 / K; K = k2;
    peindre();
  }

  /* ── L historique ── */
  function etat(){ return JSON.stringify({ p: E.pieces, pos: POS }); }
  function memo(lib){
    PILE.push({ lib: lib, e: etat() }); if (PILE.length > 100) PILE.shift();
    REFAIRE = []; SALE = true;
  }
  function remettre(s){ var o = JSON.parse(s); E.pieces = o.p; POS = o.pos; if (E.sel >= E.pieces.length) E.sel = E.pieces.length ? 0 : -1; deselectionner(true); }
  function annuler(){
    if (!PILE.length) return;
    var d = PILE.pop(); REFAIRE.push({ lib: d.lib, e: etat() }); remettre(d.e); SALE = true;
    dire('${T("Annulé :")} ' + d.lib); apresChangement();
  }
  function refaire(){
    if (!REFAIRE.length) return;
    var d = REFAIRE.pop(); PILE.push({ lib: d.lib, e: etat() }); remettre(d.e); SALE = true;
    dire('${T("Refait :")} ' + d.lib); apresChangement();
  }
  function revenirA(n){                       // l historique : revenir avant l action n
    while (PILE.length > n) { var d = PILE.pop(); REFAIRE.push({ lib: d.lib, e: etat() }); remettre(d.e); }
    SALE = true; apresChangement();
  }
  function deselectionner(garderPiece){
    E.noeud = -1; E.poignee = ''; E.bord = -1; E.cran = -1; E.pince = -1;
    if (!garderPiece) E.sel = -1;
  }

  /* ── Les coutures par bord suivent les nœuds qu on ajoute ou retire ── */
  function decalerCoutures(p, i, ajout){
    var c = p.coutures || {}, n = {}, L = p.contour.length;   // L : longueur APRÈS le changement
    Object.keys(c).forEach(function(k){
      var b = parseInt(k, 10);
      if (ajout) {
        if (i === 0) { n[b] = c[k]; if (b === 0) n[L - 1] = c[k]; }       // nœud ajouté à la fin (bord de fermeture)
        else if (b >= i) { n[b + 1] = c[k]; if (b === i) n[i] = c[k]; }
        else n[b] = c[k];
      } else {
        // nœud i retiré (L + 1 nœuds avant) : les bords i et i + 1 fusionnent en un seul, d indice M ;
        // le bord fusionné garde la valeur du premier des deux qui en porte une.
        var L0 = L + 1, M = i === L0 - 1 ? 0 : i, suiv = (i + 1) % L0;
        if (b === i) n[M] = c[k];
        else if (b === suiv) { if (c[i] == null) n[M] = c[k]; }
        else n[b < i ? b : b - 1] = c[k];
      }
    });
    p.coutures = n;
  }
  function ajouterPoint(i, bord, t){
    var p = E.pieces[i], z = p.contour[bord], a = debutBord(p, bord), nv;
    if (z.c1 && z.c2) {                         // de Casteljau : la courbe garde sa forme
      var q0 = lerp(a, z.c1, t), q1 = lerp(z.c1, z.c2, t), q2 = lerp(z.c2, z, t), r0 = lerp(q0, q1, t), r1 = lerp(q1, q2, t), s = lerp(r0, r1, t);
      nv = { x: r2(s.x), y: r2(s.y), c1: { x: r2(q0.x), y: r2(q0.y) }, c2: { x: r2(r0.x), y: r2(r0.y) } };
      z.c1 = { x: r2(r1.x), y: r2(r1.y) }; z.c2 = { x: r2(q2.x), y: r2(q2.y) };
    } else { var m = lerp(a, z, t); nv = { x: r2(m.x), y: r2(m.y) }; }
    var at = bord === 0 ? p.contour.length : bord;
    p.contour.splice(at, 0, nv);
    decalerCoutures(p, bord, true);
    return at;
  }
  /* Un cran posé SUR un point le suit quand le point bouge (un cran de bas d emmanchure reste au bas d emmanchure). */
  function suivreCrans(p, ancien, dx, dy){
    (p.crans || []).forEach(function(c){ if (Math.hypot(c.x - ancien.x, c.y - ancien.y) < 0.15) { c.x = r2(c.x + dx); c.y = r2(c.y + dy); } });
  }
  function retirerPoint(i, n){
    var p = E.pieces[i];
    if (p.contour.length <= 3) { dire('${T("Une pièce garde au moins trois points.")}', 'att'); return false; }
    p.contour.splice(n, 1);
    decalerCoutures(p, n, false);
    return true;
  }

  /* ── Le dessin ── */
  function cheminP(i, p){
    var c = p.contour, d = 'M' + sx(i, c[0].x) + ' ' + sy(i, c[0].y);
    for (var n = 1; n <= c.length; n++) {
      var z = c[n % c.length];
      d += z.c1 && z.c2 ? ' C' + sx(i, z.c1.x) + ' ' + sy(i, z.c1.y) + ' ' + sx(i, z.c2.x) + ' ' + sy(i, z.c2.y) + ' ' + sx(i, z.x) + ' ' + sy(i, z.y)
                        : ' L' + sx(i, z.x) + ' ' + sy(i, z.y);
    }
    return d + ' Z';
  }
  function cheminBord(i, p, b){
    var a = debutBord(p, b), z = p.contour[b];
    return 'M' + sx(i, a.x) + ' ' + sy(i, a.y) + (z.c1 && z.c2
      ? ' C' + sx(i, z.c1.x) + ' ' + sy(i, z.c1.y) + ' ' + sx(i, z.c2.x) + ' ' + sy(i, z.c2.y) + ' ' + sx(i, z.x) + ' ' + sy(i, z.y)
      : ' L' + sx(i, z.x) + ' ' + sy(i, z.y));
  }
  function grille(W, H){
    var s = '', pas = K >= 5 ? 1 : 5, x0 = Math.floor(-OX / K / pas) * pas, x1 = Math.ceil((W - OX) / K), y0 = Math.floor(-OY / K / pas) * pas, y1 = Math.ceil((H - OY) / K);
    for (var x = x0; x <= x1; x += pas) { var X = Math.round(x * K + OX) + 0.5; s += '<path d="M' + X + ' 0V' + H + '" stroke="' + (x % 10 === 0 ? '#D3C8B6' : '#E6DED1') + '" stroke-width="1"/>'; }
    for (var y = y0; y <= y1; y += pas) { var Y = Math.round(y * K + OY) + 0.5; s += '<path d="M0 ' + Y + 'H' + W + '" stroke="' + (y % 10 === 0 ? '#D3C8B6' : '#E6DED1') + '" stroke-width="1"/>'; }
    var reg = '<rect x="0" y="0" width="' + W + '" height="16" fill="#EAE2D5"/>';
    for (var g = Math.ceil(-OX / K / 10) * 10; g <= x1; g += 10) {
      if (K * 10 < 34 && g % 50 !== 0) continue;
      reg += '<text x="' + (Math.round(g * K + OX) + 3) + '" y="12" font-size="10" fill="#4A443A" font-family="Segoe UI, sans-serif">' + g + '</text>';
    }
    return s + reg;
  }
  function fleche(x1, y1, x2, y2){
    var a = Math.atan2(y2 - y1, x2 - x1), L = 7, s = '';
    [[x1, y1, a + Math.PI], [x2, y2, a]].forEach(function(e){
      s += ' M' + r2(e[0] - L * Math.cos(e[2] - 0.45)) + ' ' + r2(e[1] - L * Math.sin(e[2] - 0.45)) + ' L' + e[0] + ' ' + e[1]
        + ' L' + r2(e[0] - L * Math.cos(e[2] + 0.45)) + ' ' + r2(e[1] - L * Math.sin(e[2] + 0.45));
    });
    return '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + s + '" stroke="#1C1B18" stroke-width="1.1" fill="none"/>';
  }
  function dessinPiece(p, i){
    var sel = i === E.sel, s = '', an = analyseDe(i);
    if (CALQ.couture && an && an.coupe && an.coupe.length && !(GLISSE && GLISSE.piece === i && GLISSE.bouge)) {
      s += '<path d="M' + an.coupe.map(function(q){ return sx(i, q.x) + ' ' + sy(i, q.y); }).join(' L') + ' Z" stroke="#6E675B" stroke-width="1" fill="none"/>';
    }
    s += '<path d="' + cheminP(i, p) + '" fill="' + (sel ? '#F6E6DA' : '#F8F4EC') + '" stroke="' + (sel ? '#9A3412' : '#1C1B18') + '" stroke-width="' + (sel ? 2 : 1.6) + '"/>';
    if (sel && E.bord >= 0 && E.bord < p.contour.length) s += '<path d="' + cheminBord(i, p, E.bord) + '" stroke="#2563EB" stroke-width="4" fill="none" stroke-linecap="round"/>';
    if (CALQ.constr) {
      if (p.aupli && p.pli) s += '<path d="M' + sx(i, p.pli.a.x) + ' ' + sy(i, p.pli.a.y) + ' L' + sx(i, p.pli.b.x) + ' ' + sy(i, p.pli.b.y) + '" stroke="#1C1B18" stroke-width="1.2" stroke-dasharray="9 4 2 4"/>';
      if (p.droitFil) s += fleche(sx(i, p.droitFil.a.x), sy(i, p.droitFil.a.y), sx(i, p.droitFil.b.x), sy(i, p.droitFil.b.y));
      (p.pinces || []).forEach(function(d, k){
        s += '<path d="M' + sx(i, d.gauche.x) + ' ' + sy(i, d.gauche.y) + ' L' + sx(i, d.sommet.x) + ' ' + sy(i, d.sommet.y) + ' L' + sx(i, d.droite.x) + ' ' + sy(i, d.droite.y)
          + (d.bas ? ' L' + sx(i, d.bas.x) + ' ' + sy(i, d.bas.y) + ' Z' : '') + '" stroke="' + (sel && E.pince === k ? '#2563EB' : '#A04A3A') + '" stroke-width="' + (sel && E.pince === k ? 2 : 1.3) + '" fill="none"/>';
      });
    }
    if (CALQ.crans) (p.crans || []).forEach(function(c, k){
      s += '<circle cx="' + sx(i, c.x) + '" cy="' + sy(i, c.y) + '" r="' + (sel && E.cran === k ? 4 : 2.6) + '" fill="' + (sel && E.cran === k ? '#2563EB' : '#1C1B18') + '"/>';
    });
    // Le nom aux trois quarts de la hauteur : le milieu est celui des pinces et du droit-fil.
    var b = boiteP(p), cx = sx(i, (b.x0 + b.x1) / 2), cy = sy(i, b.y0 + (b.y1 - b.y0) * 0.74);
    s += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" font-size="13" font-weight="700" fill="#1C1B18" font-family="Segoe UI, sans-serif">' + esc(nomPiece(p).toUpperCase()) + '</text>'
      + '<text x="' + cx + '" y="' + r2(cy + 15) + '" text-anchor="middle" font-size="10.5" fill="#3F3A32" font-family="Segoe UI, sans-serif">'
      + esc(((E.m.ref ? E.m.ref + ' · ' : '') + (E.m.tailleBase || 'M') + ' · ×' + (p.qte || 1) + (p.aupli ? ' ${T("au pli")}' : '') + ' · ' + (LTISSU[p.tissu] || ''))) + '</text>';
    if (sel) {
      if (CALQ.constr) {
        (p.pinces || []).forEach(function(d){ ['gauche', 'sommet', 'droite'].concat(d.bas ? ['bas'] : []).forEach(function(c){
          s += '<rect x="' + r2(sx(i, d[c].x) - 3.5) + '" y="' + r2(sy(i, d[c].y) - 3.5) + '" width="7" height="7" transform="rotate(45 ' + sx(i, d[c].x) + ' ' + sy(i, d[c].y) + ')" fill="#fff" stroke="#A04A3A" stroke-width="1.3"/>'; }); });
        if (p.droitFil) ['a', 'b'].forEach(function(c){ s += '<circle cx="' + sx(i, p.droitFil[c].x) + '" cy="' + sy(i, p.droitFil[c].y) + '" r="3.5" fill="#fff" stroke="#1C1B18" stroke-width="1.2"/>'; });
      }
      var L = p.contour.length;
      if (E.noeud >= 0 && E.noeud < L) {
        var z = p.contour[E.noeud], nx = p.contour[(E.noeud + 1) % L];
        var poig = [];
        if (z.c1 && z.c2) poig.push(['c2', E.noeud, z.c2, z], ['c1', E.noeud, z.c1, debutBord(p, E.noeud)]);
        if (nx.c1 && nx.c2) poig.push(['c1', (E.noeud + 1) % L, nx.c1, z], ['c2', (E.noeud + 1) % L, nx.c2, nx]);
        poig.forEach(function(h){
          s += '<path d="M' + sx(i, h[3].x) + ' ' + sy(i, h[3].y) + ' L' + sx(i, h[2].x) + ' ' + sy(i, h[2].y) + '" stroke="#2563EB" stroke-width="1"/>'
            + '<circle cx="' + sx(i, h[2].x) + '" cy="' + sy(i, h[2].y) + '" r="4" fill="#fff" stroke="#2563EB" stroke-width="1.5"/>';
        });
      }
      p.contour.forEach(function(n, k){
        var on = E.noeud === k;
        s += '<rect x="' + r2(sx(i, n.x) - 4) + '" y="' + r2(sy(i, n.y) - 4) + '" width="8" height="8" fill="' + (on ? '#C2410C' : '#fff') + '" stroke="' + (on ? '#7C2D12' : '#1C1B18') + '" stroke-width="1.3"/>';
      });
    }
    return s;
  }
  function peindre(){
    var z = document.getElementById('e-toile'), svg = document.getElementById('e-svg'); if (!z || !svg || !E) return;
    var W = z.clientWidth || 800, H = z.clientHeight || 600;
    var s = grille(W, H);
    E.pieces.forEach(function(p, i){ if (i !== E.sel) s += dessinPiece(p, i); });
    if (E.sel >= 0 && E.pieces[E.sel]) s += dessinPiece(E.pieces[E.sel], E.sel);
    if (MES && MES.a) {
      var b = MES.b || MES.a, ax = r2(MES.a.x * K + OX), ay = r2(MES.a.y * K + OY), bx = r2(b.x * K + OX), by = r2(b.y * K + OY);
      s += '<path d="M' + ax + ' ' + ay + ' L' + bx + ' ' + by + '" stroke="#2563EB" stroke-width="1.5" stroke-dasharray="6 4"/>'
        + '<circle cx="' + ax + '" cy="' + ay + '" r="3.5" fill="#2563EB"/><circle cx="' + bx + '" cy="' + by + '" r="3.5" fill="#2563EB"/>';
      if (MES.b) s += '<text x="' + r2((ax + bx) / 2 + 8) + '" y="' + r2((ay + by) / 2 - 8) + '" font-size="12" font-weight="700" fill="#1E40AF" font-family="Segoe UI, sans-serif">'
        + esc(lUnite(Math.hypot(MES.b.x - MES.a.x, MES.b.y - MES.a.y))) + '</text>';
    }
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = s;
    var zz = document.getElementById('e-zoom'); if (zz) zz.textContent = Math.round(K / 37.8 * 100) + ' %';
  }

  /* L analyse du site pour la pièce i, seulement si elle décrit encore cette pièce (même id, même nombre de bords). */
  function analyseDe(i){
    var a = AN && AN.pieces ? AN.pieces[i] : null, p = E.pieces[i];
    return a && p && a.id === p.id && a.bords && a.bords.length === p.contour.length ? a : null;
  }

  /* ── Le panneau de droite ── */
  function champ(id, lib, val, attrs){ return '<label>' + lib + '<input type="text" id="' + id + '" value="' + esc(val) + '" ' + (attrs || '') + '></label>'; }
  function panneauProp(){
    var p = E.pieces[E.sel];
    if (MES && MES.b) {
      var dx = MES.b.x - MES.a.x, dy = MES.b.y - MES.a.y;
      return '<h2>${T("Mesure")}</h2><div class="cx-etat"><span>${T("Distance")}</span><span>' + esc(lUnite(Math.hypot(dx, dy))) + '</span></div>'
        + '<div class="cx-etat"><span>${T("Horizontal")}</span><span>' + esc(lUnite(Math.abs(dx))) + '</span></div>'
        + '<div class="cx-etat"><span>${T("Vertical")}</span><span>' + esc(lUnite(Math.abs(dy))) + '</span></div>'
        + '<div class="cx-etat"><span>${T("Angle")}</span><span>' + Math.round(Math.atan2(-dy, dx) * 180 / Math.PI) + '°</span></div>'
        + '<div class="ed-note">${T("Cliquez ailleurs pour une nouvelle mesure.")}</div>';
    }
    if (!p) return '<h2>${T("Propriétés")}</h2><div class="cx-sub">${T("Cliquez une pièce pour la régler.")}</div><div class="ed-note">' + esc(AIDE_OUTIL[OUTIL]) + '</div>';
    var an = analyseDe(E.sel);
    var h = '<h2>' + esc(nomPiece(p)) + ' <span class="cx-sub">' + '${T("pièce {0} / {1}")}'.split('{0}').join(E.sel + 1).split('{1}').join(E.pieces.length) + '</span></h2>';
    if (E.noeud >= 0 && p.contour[E.noeud]) {
      var n = p.contour[E.noeud];
      h += '<div class="at-champs">' + champ('e-nx', '${T("Point · X")} (' + UNITE + ')', enUnite(n.x), 'inputmode="decimal" maxlength="8"')
        + champ('e-ny', '${T("Point · Y")} (' + UNITE + ')', enUnite(n.y), 'inputmode="decimal" maxlength="8"') + '</div>'
        + '<div class="ed-gestes"><button type="button" class="mini danger" id="e-retirer-point">${T("Retirer le point")}</button></div><div class="cx-sep"></div>';
    }
    if (E.cran >= 0) h += '<div class="cx-etat"><span>${T("Cran choisi")}</span><span><button type="button" class="mini danger" id="e-retirer-cran">${T("Retirer le cran")}</button></span></div><div class="cx-sep"></div>';
    if (E.pince >= 0 && p.pinces[E.pince]) {
      var d = p.pinces[E.pince];
      h += '<div class="cx-etat"><span>${T("Pince · ouverture")}</span><span>' + esc(lUnite(Math.hypot(d.droite.x - d.gauche.x, d.droite.y - d.gauche.y))) + '</span></div>'
        + '<div class="cx-etat"><span>${T("Pince · profondeur")}</span><span>' + esc(lUnite(Math.hypot(d.sommet.x - (d.gauche.x + d.droite.x) / 2, d.sommet.y - (d.gauche.y + d.droite.y) / 2))) + '</span></div>'
        + '<div class="ed-gestes"><button type="button" class="mini danger" id="e-retirer-pince">${T("Retirer la pince")}</button></div><div class="cx-sep"></div>';
    }
    if (E.bord >= 0 && p.contour[E.bord]) {
      var z = p.contour[E.bord], cv = (p.coutures || {})[E.bord];
      h += '<h2>' + '${T("Bord {0}")}'.split('{0}').join(E.bord + 1) + ' <span class="cx-sub">' + (z.c1 && z.c2 ? '${T("courbe")}' : '${T("droite")}') + '</span></h2>'
        + '<div class="cx-etat"><span>${T("Longueur")}</span><span>' + (an ? esc(lUnite(an.bords[E.bord])) : '…') + '</span></div>'
        + '<div class="at-champs">' + champ('e-bc', '${T("Couture de ce bord")} (' + UNITE + ')', cv != null ? enUnite(cv) : '', 'inputmode="decimal" maxlength="6" placeholder="' + esc(enUnite(p.couture)) + '"') + '</div>'
        + '<div class="ed-gestes"><button type="button" class="mini" id="e-b-ourlet">${T("Mettre l’ourlet")}</button>'
        + '<button type="button" class="mini" id="e-b-piece">${T("Valeur de la pièce")}</button>'
        + '<button type="button" class="mini" id="e-b-type">' + (z.c1 && z.c2 ? '${T("Rendre droit")}' : '${T("Rendre courbe")}') + '</button></div><div class="cx-sep"></div>';
    }
    h += '<div class="at-champs">'
      + '<label class="large">${T("Nom")}<input type="text" id="e-pnom" maxlength="40" value="' + esc(p.nom || nomPiece(p)) + '"></label>'
      + champ('e-pqte', '${T("Quantité")}', String(p.qte || 1), 'inputmode="numeric" maxlength="2"')
      + '<label>${T("Tissu")}<select id="e-ptissu">' + Object.keys(LTISSU).map(function(k){ return '<option value="' + k + '"' + (p.tissu === k ? ' selected' : '') + '>' + LTISSU[k] + '</option>'; }).join('') + '</select></label>'
      + champ('e-pcout', '${T("Couture")} (' + UNITE + ')', enUnite(p.couture != null ? p.couture : 1), 'inputmode="decimal" maxlength="6"')
      + champ('e-pourl', '${T("Ourlet")} (' + UNITE + ')', enUnite(p.ourlet != null ? p.ourlet : 3), 'inputmode="decimal" maxlength="6"')
      + '<label class="large" style="flex-direction:row;align-items:center;gap:.45rem"><input type="checkbox" id="e-ppli"' + (p.aupli ? ' checked' : '') + (p.pli ? '' : ' disabled') + '>${T("Coupé au pli (le bord du pli ne prend pas de couture)")}</label>'
      + '</div>';
    if (an) {
      var surcharges = Object.keys(p.coutures || {}).length;
      h += '<div class="cx-sep"></div><h2>${T("Contrôle")}</h2>'
        + '<div class="cx-etat"><span>${T("Périmètre (ligne de couture)")}</span><span>' + esc(lUnite(an.perimetre)) + '</span></div>'
        + '<div class="cx-etat"><span>${T("Encombrement")}</span><span>' + esc(enUnite(an.boite.l) + ' × ' + lUnite(an.boite.h)) + '</span></div>'
        + '<div class="cx-etat"><span>${T("Bords à couture propre")}</span><span>' + surcharges + '</span></div>'
        + '<div class="cx-etat"><span>${T("Tissu estimé, tout le patron (laize 140 cm)")}</span><span>' + String(AN.tissu ? AN.tissu.metres : 0).replace('.', '${SEP_DEC()}') + ' m</span></div>'
        + '<div class="ed-bords">' + an.bords.map(function(L, b){
            return '<button type="button" class="ed-ligne' + (E.bord === b ? ' on' : '') + '" data-ebord="' + b + '"><span>' + '${T("Bord {0}")}'.split('{0}').join(b + 1)
              + ((p.coutures || {})[b] != null ? ' · ' + esc(lUnite(p.coutures[b])) : '') + '</span><span>' + esc(lUnite(L)) + '</span></button>';
          }).join('') + '</div>';
    }
    return h;
  }
  function panneauPieces(){
    return '<h2>${T("Pièces")}</h2>' + E.pieces.map(function(p, i){
        return '<button type="button" class="ed-ligne' + (E.sel === i ? ' on' : '') + '" data-epiece="' + i + '" data-ctx-ligne="p:' + i + '"><span>' + esc(nomPiece(p)) + '</span><span>×' + (p.qte || 1) + (p.aupli ? ' ${T("au pli")}' : '') + ' · ' + esc(LTISSU[p.tissu] || '') + '</span></button>';
      }).join('')
      + '<div class="ed-gestes"><button type="button" class="mini" id="e-p-rect">${T("+ Pièce rectangulaire")}</button>'
      + (E.sel >= 0 ? '<button type="button" class="mini" id="e-p-dupl">${T("Dupliquer la pièce")}</button><button type="button" class="mini danger" id="e-p-suppr">${T("Supprimer la pièce")}</button>' : '')
      + '</div><div class="ed-note">${T("Une pièce rectangulaire se pose à 20 × 30 cm : parementure, poche, ceinture… à reformer ensuite.")}</div>';
  }
  function panneauHist(){
    if (!PILE.length) return '<h2>${T("Historique")}</h2><div class="cx-sub">${T("Aucune modification depuis l’ouverture.")}</div>';
    return '<h2>${T("Historique")}</h2><div class="ed-note">${T("Cliquez une étape pour revenir juste avant elle.")}</div>'
      + PILE.map(function(d, n){ return { d: d, n: n }; }).reverse().map(function(o){
          return '<button type="button" class="ed-ligne" data-ehist="' + o.n + '"><span>' + esc(o.d.lib) + '</span><span>' + (o.n + 1) + '</span></button>';
        }).join('');
  }
  function peindrePanneau(force){
    var z = document.getElementById('e-pan'); if (!z || !E) return;
    if (!force && document.activeElement && z.contains(document.activeElement) && /^(INPUT|SELECT)$/.test(document.activeElement.tagName)) return;
    var seg = function(k, lib){ return '<button type="button" class="' + (ONGLET === k ? 'on' : '') + '" data-eonglet="' + k + '">' + lib + '</button>'; };
    z.innerHTML = '<div class="ed-seg" role="group" aria-label="${T("Panneau")}">' + seg('prop', '${T("Propriétés")}') + seg('pieces', '${T("Pièces")}') + seg('hist', '${T("Historique")}') + '</div>'
      + (ONGLET === 'pieces' ? panneauPieces() : ONGLET === 'hist' ? panneauHist() : panneauProp());
  }
  function teteEditeur(){
    document.getElementById('titre').textContent = E.m.nom || '${T("Modèle")}';
    document.getElementById('sous').textContent = (E.m.ref ? E.m.ref + ' · ' : '') + 'v' + (E.m.version || 1)
      + (SALE ? ' · ${T("modifications non enregistrées")}' : '');
    var a = document.getElementById('actions');
    a.innerHTML = '<button type="button" id="e-retour">${T("← Bibliothèque")}</button>'
      + '<button type="button" id="e-annuler" title="${T("Annuler (Ctrl+Z)")}" aria-label="${T("Annuler")}"' + (PILE.length ? '' : ' disabled') + '>↶</button>'
      + '<button type="button" id="e-refaire" title="${T("Refaire (Ctrl+Y)")}" aria-label="${T("Refaire")}"' + (REFAIRE.length ? '' : ' disabled') + '>↷</button>'
      + (D.peutModifier ? '<button type="button" class="prim" id="e-enreg"' + (SALE ? '' : ' disabled') + '>${T("Enregistrer la version")}</button>' : '');
  }
  function dessinerEditeur(){
    teteEditeur();
    var o = '<div class="ed-outils" role="toolbar" aria-label="${T("Outils")}">'
      + OUTILS.map(function(t){
          return '<button type="button" class="ed-outil' + (OUTIL === t.cle ? ' on' : '') + '" data-eoutil="' + t.cle + '" title="' + esc(t.lib + ' (' + t.touche + ')') + '" aria-pressed="' + (OUTIL === t.cle) + '">' + t.ico + '<span>' + t.lib + '</span></button>';
        }).join('') + '</div>';
    var chip = function(attr, k, lib, on){ return '<button type="button" class="mini' + (on ? ' on' : '') + '" ' + attr + '="' + k + '" aria-pressed="' + !!on + '">' + lib + '</button>'; };
    var bas = '<div class="ed-bas">'
      + '<span class="grp">${T("Aimanter :")}' + chip('data-eaim', 'points', '${T("Points")}', AIM.points) + chip('data-eaim', 'grille', '${T("Grille 5 mm")}', AIM.grille) + chip('data-eaim', 'a45', '45°', AIM.a45) + '</span>'
      + '<span class="grp">${T("Calques :")}' + chip('data-ecalq', 'couture', '${T("Ligne de coupe")}', CALQ.couture) + chip('data-ecalq', 'crans', '${T("Crans")}', CALQ.crans) + chip('data-ecalq', 'constr', '${T("Construction")}', CALQ.constr) + '</span>'
      + '<span class="grp">${T("Zoom :")} <b id="e-zoom"></b>' + chip('data-ezoom', '25', '25 %', false) + chip('data-ezoom', '50', '50 %', false) + chip('data-ezoom', '100', '${T("100 % (taille réelle)")}', false) + chip('data-ezoom', 'ajuster', '${T("Tout voir")}', false) + '</span>'
      + '<span class="grp">${T("Unité :")}' + chip('data-eunite', 'cm', 'cm', UNITE === 'cm') + chip('data-eunite', 'mm', 'mm', UNITE === 'mm') + chip('data-eunite', 'po', '${T("po")}', UNITE === 'po') + '</span>'
      + '</div>';
    corps.innerHTML = '<div class="ed-cadre">' + o
      + '<div class="ed-toile o-' + OUTIL + '" id="e-toile"><svg id="e-svg" role="img" aria-label="${T("Toile de l’éditeur de patron")}"></svg><span class="ed-coin" id="e-coin"></span></div>'
      + '<div class="cx-carte ed-panneau" id="e-pan"></div></div>' + bas
      + '<div class="ed-note">' + '${T("Retouches sur la taille de base ({0}). Les autres tailles restent tracées depuis le tableau de tailles : la gradation des retouches vient au prochain lot.")}'.split('{0}').join(esc(E.m.tailleBase || 'M')) + '</div>';
    peindre(); peindrePanneau(true);
    /* La toile change de taille APRÈS le premier dessin (le panneau se remplit, la fenêtre se règle) :
       on redessine à chaque changement de sa taille, sinon la grille s arrête au milieu. */
    var tz = document.getElementById('e-toile');
    if (window.ResizeObserver && tz) {
      if (window._atRO) window._atRO.disconnect();
      window._atRO = new ResizeObserver(function(){ if (VUE === 'editeur' && E) peindre(); });
      window._atRO.observe(tz);
    }
  }
  function apresChangement(){ teteEditeur(); peindre(); peindrePanneau(); analyser(); }

  var anT = null, anN = 0;
  function analyser(){
    clearTimeout(anT);
    anT = setTimeout(function(){
      var n = ++anN;
      appeler('atelier:analyser', [{ pieces: E.pieces, laize: 140 }]).then(function(r){
        if (n !== anN || VUE !== 'editeur' || !E) return;
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        AN = r; peindre(); peindrePanneau();
      });
    }, 180);
  }

  function ouvrirEditeur(id){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0];
    if (!m) { dire(MOTIFS.introuvable, 'err'); return; }
    if (!(m.pieces || []).length) { dire('${T("Ce modèle n’a pas encore de pièces : enregistrez-le d’abord.")}', 'att'); return; }
    SEL = id;
    E = { m: copie(m), pieces: copie(m.pieces), sel: 0, noeud: -1, poignee: '', bord: -1, cran: -1, pince: -1 };
    E.pieces.forEach(function(p){ if (!p.coutures) p.coutures = {}; });
    PILE = []; REFAIRE = []; SALE = false; AN = null; MES = null; OUTIL = 'sel'; ONGLET = 'prop';
    VUE = 'editeur';
    ranger(); dessinerEditeur(); ajuster(); peindre(); analyser();
    dire(AIDE_OUTIL.sel);
  }
  function quitterEditeur(){
    var sortir = function(){ E = null; SALE = false; PILE = []; REFAIRE = []; VUE = 'biblio'; dessiner(); dire(''); };
    if (!SALE) { sortir(); return; }
    szConfirmer({ titre: '${T("Quitter sans enregistrer ?")}', texte: '${T("Les retouches du patron depuis le dernier enregistrement seront perdues.")}', oui: '${T("Quitter")}', danger: true })
      .then(function(ok){ if (ok) sortir(); });
  }
  function enregistrerEditeur(btn){
    if (OCCUPE || !E || !SALE) return;
    OCCUPE = true; if (btn) btn.disabled = true;
    dire('${T("Enregistrement…")}');
    appeler('atelier:ecrire', [{ id: E.m.id, nom: E.m.nom, pieces: E.pieces, piecesEditees: true }]).then(function(r){
      OCCUPE = false;
      if (!r.ok) { if (btn) btn.disabled = false; dire(expliquer(r), 'err'); return; }
      SALE = false;
      appeler('atelier:donnees', []).then(function(d){
        if (d && d.ok) { D = d; var m = (D.modeles || []).filter(function(x){ return x.id === E.m.id; })[0]; if (m && E) E.m = copie(m); }
        if (VUE === 'editeur' && E) { teteEditeur(); dire('${T("Version enregistrée.")}', 'bon'); }
      });
    });
  }

  /* ── La souris sur la toile ── */
  function souris(ev){
    var svg = document.getElementById('e-svg'); var r = svg.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }
  function pres(i, q, m, rayon){ return Math.hypot(sx(i, q.x) - m.x, sy(i, q.y) - m.y) <= (rayon || 7); }
  /* Le point aimanté (cm de la pièce i) pour un nœud qu on glisse : un autre nœud, 45° depuis le voisin, la grille. */
  function aimanter(i, q, m, exclu, ref, force45){
    var p = E.pieces[i];
    if (AIM.points) {
      for (var k = 0; k < p.contour.length; k++) {
        if (k === exclu) continue;
        if (pres(i, p.contour[k], m, 8)) return { x: p.contour[k].x, y: p.contour[k].y };
      }
    }
    var x = q.x, y = q.y;
    if (ref && (force45 || AIM.a45)) {
      var dx = x - ref.x, dy = y - ref.y, L = Math.hypot(dx, dy), a = Math.atan2(dy, dx), a45 = Math.round(a / (Math.PI / 4)) * (Math.PI / 4);
      if (force45 || Math.abs(a - a45) < 0.06) { x = ref.x + L * Math.cos(a45); y = ref.y + L * Math.sin(a45); }
    }
    var pas = AIM.grille ? 0.5 : 0.1;
    return { x: Math.round(x / pas) * pas, y: Math.round(y / pas) * pas };
  }
  function cibleBord(m){
    var best = null;
    var ordre = E.pieces.map(function(p, i){ return i; });
    if (E.sel >= 0) { ordre.splice(E.sel, 1); ordre.unshift(E.sel); }
    ordre.forEach(function(i){
      var pp = versPiece(i, m.x, m.y), b = plusProcheBord(E.pieces[i], pp.x, pp.y);
      if (b && b.d * K <= 9 && (!best || b.d * K < best.d * K - 0.5)) { best = b; best.piece = i; }
    });
    return best;
  }
  function pieceSous(m){                      // la pièce choisie d abord (elle est dessinée par-dessus)
    var ordre = E.sel >= 0 ? [E.sel] : [];
    for (var i = E.pieces.length - 1; i >= 0; i--) if (i !== E.sel) ordre.push(i);
    for (var k = 0; k < ordre.length; k++) { var pp = versPiece(ordre[k], m.x, m.y); if (dedans(E.pieces[ordre[k]], pp.x, pp.y)) return ordre[k]; }
    return -1;
  }
  function choisir(i){ if (E.sel !== i) { E.sel = i; deselectionner(true); } }

  function baisser(ev){
    if (ev.button !== 0 && ev.button !== 1) return;
    var m = souris(ev);
    if (ev.button === 1) { GLISSE = { type: 'vue', m0: m, ox: OX, oy: OY }; ev.preventDefault(); return; }
    var i = E.sel, p = E.pieces[i];
    if (OUTIL === 'mesure') {
      var at = { x: (m.x - OX) / K, y: (m.y - OY) / K };
      E.pieces.forEach(function(pc, k){ pc.contour.forEach(function(n){ if (pres(k, n, m, 8)) at = { x: n.x + POS[k].x, y: n.y + POS[k].y }; }); });
      if (!MES || MES.b) MES = { a: at, b: null }; else MES.b = at;
      if (MES.b) { ONGLET = 'prop'; peindrePanneau(true); }
      peindre(); return;
    }
    if (OUTIL === 'sel' && p) {
      var L = p.contour.length;
      if (E.noeud >= 0 && E.noeud < L) {               // ① les poignées du point choisi
        var z = p.contour[E.noeud], nx = p.contour[(E.noeud + 1) % L], h = null;
        if (z.c2 && pres(i, z.c2, m)) h = [E.noeud, 'c2']; else if (z.c1 && pres(i, z.c1, m)) h = [E.noeud, 'c1'];
        else if (nx.c1 && pres(i, nx.c1, m)) h = [(E.noeud + 1) % L, 'c1']; else if (nx.c2 && pres(i, nx.c2, m)) h = [(E.noeud + 1) % L, 'c2'];
        if (h) { GLISSE = { type: 'poignee', piece: i, n: h[0], c: h[1], avant: etat(), m0: m }; return; }
      }
      for (var k = 0; k < L; k++) if (pres(i, p.contour[k], m)) {   // ② les points
        E.noeud = k; E.bord = -1; E.cran = -1; E.pince = -1;
        GLISSE = { type: 'noeud', piece: i, n: k, avant: etat(), m0: m }; peindre(); peindrePanneau(); return;
      }
      if (CALQ.constr) {
        for (var d = 0; d < (p.pinces || []).length; d++) {        // ③ les pointes de pince
          var pc = p.pinces[d], cles = ['sommet', 'gauche', 'droite'].concat(pc.bas ? ['bas'] : []);
          for (var c = 0; c < cles.length; c++) if (pres(i, pc[cles[c]], m)) {
            E.pince = d; E.noeud = -1; E.bord = -1; E.cran = -1;
            GLISSE = { type: 'pince', piece: i, d: d, c: cles[c], avant: etat(), m0: m }; peindre(); peindrePanneau(); return;
          }
        }
        if (p.droitFil) for (var e = 0; e < 2; e++) { var cl = e ? 'b' : 'a';  // ④ le droit-fil
          if (pres(i, p.droitFil[cl], m)) { GLISSE = { type: 'fil', piece: i, c: cl, avant: etat(), m0: m }; return; } }
      }
      if (CALQ.crans) for (var g = 0; g < (p.crans || []).length; g++) if (pres(i, p.crans[g], m)) {   // ⑤ les crans
        E.cran = g; E.noeud = -1; E.bord = -1; E.pince = -1;
        GLISSE = { type: 'cran', piece: i, c: g, avant: etat(), m0: m }; peindre(); peindrePanneau(); return;
      }
    }
    var cb = cibleBord(m);
    if (OUTIL !== 'sel') {
      if (OUTIL === 'cran' && E.sel >= 0) {             // un clic sur un cran existant le retire
        var pcr = E.pieces[E.sel];
        for (var q = 0; q < (pcr.crans || []).length; q++) if (pres(E.sel, pcr.crans[q], m)) {
          memo('${T("Cran retiré")}'); pcr.crans.splice(q, 1); E.cran = -1; apresChangement(); return; }
      }
      if (!cb) { dire('${T("Cliquez plus près d’un bord.")}', 'att'); return; }
      choisir(cb.piece);
      var pp = E.pieces[cb.piece];
      if (OUTIL === 'point') {
        memo('${T("Point ajouté")}');
        var at2 = ajouterPoint(cb.piece, cb.bord, cb.t); E.noeud = at2; E.bord = -1; apresChangement(); return;
      }
      if (OUTIL === 'courbe') {
        var z2 = pp.contour[cb.bord], a2 = debutBord(pp, cb.bord);
        if (z2.c1 && z2.c2) { memo('${T("Bord rendu droit")}'); delete z2.c1; delete z2.c2; }
        else { memo('${T("Bord rendu courbe")}'); z2.c1 = { x: r2(a2.x + (z2.x - a2.x) / 3), y: r2(a2.y + (z2.y - a2.y) / 3) }; z2.c2 = { x: r2(a2.x + 2 * (z2.x - a2.x) / 3), y: r2(a2.y + 2 * (z2.y - a2.y) / 3) }; }
        E.noeud = cb.bord; E.bord = -1; OUTIL = 'sel'; dessinerEditeur(); analyser();
        dire('${T("Glissez les poignées bleues pour former la courbe.")}'); return;
      }
      if (OUTIL === 'cran') { memo('${T("Cran posé")}'); pp.crans = pp.crans || []; pp.crans.push({ x: r2(cb.pt.x), y: r2(cb.pt.y) }); E.cran = pp.crans.length - 1; apresChangement(); return; }
      if (OUTIL === 'pince') {
        var t0 = Math.max(0, cb.t - 0.01), t1 = Math.min(1, cb.t + 0.01), u0 = pointBord(pp, cb.bord, t0), u1 = pointBord(pp, cb.bord, t1);
        var ux = u1.x - u0.x, uy = u1.y - u0.y, ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
        var sg = sensPiece(pp), nx2 = -sg * uy, ny2 = sg * ux;     // vers l intérieur de la pièce
        memo('${T("Pince posée")}');
        pp.pinces = pp.pinces || [];
        pp.pinces.push({ sommet: { x: r2(cb.pt.x + nx2 * 8), y: r2(cb.pt.y + ny2 * 8) }, gauche: { x: r2(cb.pt.x - ux), y: r2(cb.pt.y - uy) }, droite: { x: r2(cb.pt.x + ux), y: r2(cb.pt.y + uy) }, bas: null });
        E.pince = pp.pinces.length - 1; OUTIL = 'sel'; dessinerEditeur(); analyser(); return;
      }
      return;
    }
    if (cb) { choisir(cb.piece); E.bord = cb.bord; E.noeud = -1; E.cran = -1; E.pince = -1; ONGLET = 'prop'; peindre(); peindrePanneau(true); return; }
    var sous = pieceSous(m);
    if (sous >= 0) { choisir(sous); peindre(); peindrePanneau(true); GLISSE = { type: 'piece', piece: sous, m0: m, avant: etat(), px: POS[sous].x, py: POS[sous].y }; return; }
    E.sel = -1; deselectionner(); MES = null; peindre(); peindrePanneau(true);
    GLISSE = { type: 'vue', m0: m, ox: OX, oy: OY };
  }
  function bouger(ev){
    if (!GLISSE || VUE !== 'editeur') {
      var cz = document.getElementById('e-coin');
      if (cz && VUE === 'editeur' && ev.target && ev.target.closest && ev.target.closest('#e-toile')) {
        var mm = souris(ev), ix = E.sel >= 0 ? E.sel : -1;
        var q0 = ix >= 0 ? versPiece(ix, mm.x, mm.y) : { x: (mm.x - OX) / K, y: (mm.y - OY) / K };
        cz.textContent = 'x ' + enUnite(q0.x) + ' · y ' + lUnite(q0.y);
      }
      return;
    }
    var m = souris(ev), g = GLISSE;
    if (!g.bouge && Math.hypot(m.x - g.m0.x, m.y - g.m0.y) < 3) return;
    g.bouge = true;
    var tz = document.getElementById('e-toile'); if (tz) tz.classList.add('glisse');
    if (g.type === 'vue') { OX = g.ox + m.x - g.m0.x; OY = g.oy + m.y - g.m0.y; peindre(); return; }
    if (g.type === 'piece') { POS[g.piece].x = g.px + (m.x - g.m0.x) / K; POS[g.piece].y = g.py + (m.y - g.m0.y) / K; peindre(); return; }
    var p = E.pieces[g.piece], q = versPiece(g.piece, m.x, m.y);
    if (g.type === 'noeud') {
      var L = p.contour.length, n = p.contour[g.n], prev = p.contour[(g.n - 1 + L) % L], nx = p.contour[(g.n + 1) % L];
      var a = aimanter(g.piece, q, m, g.n, prev, ev.shiftKey), dx = a.x - n.x, dy = a.y - n.y;
      suivreCrans(p, n, dx, dy);
      n.x = r2(a.x); n.y = r2(a.y);
      if (n.c2) { n.c2.x = r2(n.c2.x + dx); n.c2.y = r2(n.c2.y + dy); }
      if (nx.c1 && nx !== n) { nx.c1.x = r2(nx.c1.x + dx); nx.c1.y = r2(nx.c1.y + dy); }
    } else if (g.type === 'poignee') {
      var hp = p.contour[g.n][g.c], ancre = g.c === 'c2' ? p.contour[g.n] : debutBord(p, g.n);
      var a2 = aimanter(g.piece, q, m, -2, ancre, ev.shiftKey); hp.x = r2(a2.x); hp.y = r2(a2.y);
    } else if (g.type === 'pince') {
      var a3 = aimanter(g.piece, q, m, -2, null, false); p.pinces[g.d][g.c] = { x: r2(a3.x), y: r2(a3.y) };
    } else if (g.type === 'fil') {
      var o = p.droitFil[g.c === 'a' ? 'b' : 'a'], a4 = aimanter(g.piece, q, m, -2, o, ev.shiftKey); p.droitFil[g.c] = { x: r2(a4.x), y: r2(a4.y) };
    } else if (g.type === 'cran') {
      var bb = plusProcheBord(p, q.x, q.y); if (bb) p.crans[g.c] = { x: r2(bb.pt.x), y: r2(bb.pt.y) };   // un cran reste sur le contour
    }
    peindre();
    var cz2 = document.getElementById('e-coin'); if (cz2) cz2.textContent = 'x ' + enUnite(q.x) + ' · y ' + lUnite(q.y);
  }
  function lever(){
    var g = GLISSE; GLISSE = null;
    var tz = document.getElementById('e-toile'); if (tz) tz.classList.remove('glisse');
    if (!g || !g.bouge || VUE !== 'editeur') return;
    if (g.type === 'vue') return;
    var LIB = { piece: '${T("Pièce déplacée sur la toile")}', noeud: '${T("Point déplacé")}', poignee: '${T("Courbe reformée")}', pince: '${T("Pince réglée")}', fil: '${T("Droit-fil réglé")}', cran: '${T("Cran déplacé")}' };
    PILE.push({ lib: LIB[g.type] || '${T("Modification")}', e: g.avant }); if (PILE.length > 100) PILE.shift();
    REFAIRE = [];
    if (g.type !== 'piece') SALE = true;
    apresChangement();
  }

  /* ── Le panneau et la barre du bas ── */
  function clicEditeur(ev){
    var t = ev.target, b;
    if ((b = t.closest('[data-eoutil]'))) { OUTIL = b.getAttribute('data-eoutil'); MES = null; dessinerEditeur(); dire(AIDE_OUTIL[OUTIL]); return; }
    if ((b = t.closest('[data-eonglet]'))) { ONGLET = b.getAttribute('data-eonglet'); peindrePanneau(true); return; }
    if ((b = t.closest('[data-eaim]'))) { var a = b.getAttribute('data-eaim'); AIM[a] = !AIM[a]; dessinerEditeur(); return; }
    if ((b = t.closest('[data-ecalq]'))) { var c = b.getAttribute('data-ecalq'); CALQ[c] = !CALQ[c]; dessinerEditeur(); return; }
    if ((b = t.closest('[data-eunite]'))) { UNITE = b.getAttribute('data-eunite'); dessinerEditeur(); return; }
    if ((b = t.closest('[data-ezoom]'))) {
      var zv = b.getAttribute('data-ezoom'), tz = document.getElementById('e-toile');
      if (zv === 'ajuster') { ajuster(); peindre(); } else zoomer(37.8 * parseInt(zv, 10) / 100, tz.clientWidth / 2, tz.clientHeight / 2);
      return;
    }
    if ((b = t.closest('[data-epiece]'))) { choisir(parseInt(b.getAttribute('data-epiece'), 10)); peindre(); peindrePanneau(true); return; }
    if ((b = t.closest('[data-ebord]'))) { E.bord = parseInt(b.getAttribute('data-ebord'), 10); E.noeud = -1; E.cran = -1; E.pince = -1; peindre(); peindrePanneau(true); return; }
    if ((b = t.closest('[data-ehist]'))) { revenirA(parseInt(b.getAttribute('data-ehist'), 10)); dire('${T("Patron remis à cette étape.")}'); return; }
    var p = E.pieces[E.sel];
    if (t.closest('#e-retirer-point') && p) { memo('${T("Point retiré")}'); if (retirerPoint(E.sel, E.noeud)) { E.noeud = -1; apresChangement(); } else PILE.pop(); return; }
    if (t.closest('#e-retirer-cran') && p) { memo('${T("Cran retiré")}'); p.crans.splice(E.cran, 1); E.cran = -1; apresChangement(); return; }
    if (t.closest('#e-retirer-pince') && p) { memo('${T("Pince retirée")}'); p.pinces.splice(E.pince, 1); E.pince = -1; apresChangement(); return; }
    if (t.closest('#e-b-ourlet') && p) { memo('${T("Ourlet posé sur un bord")}'); p.coutures[E.bord] = p.ourlet != null ? p.ourlet : 3; apresChangement(); return; }
    if (t.closest('#e-b-piece') && p) { memo('${T("Couture du bord remise à celle de la pièce")}'); delete p.coutures[E.bord]; apresChangement(); return; }
    if (t.closest('#e-b-type') && p) {
      var z = p.contour[E.bord], a0 = debutBord(p, E.bord);
      if (z.c1 && z.c2) { memo('${T("Bord rendu droit")}'); delete z.c1; delete z.c2; }
      else { memo('${T("Bord rendu courbe")}'); z.c1 = { x: r2(a0.x + (z.x - a0.x) / 3), y: r2(a0.y + (z.y - a0.y) / 3) }; z.c2 = { x: r2(a0.x + 2 * (z.x - a0.x) / 3), y: r2(a0.y + 2 * (z.y - a0.y) / 3) }; E.noeud = E.bord; }
      apresChangement(); return;
    }
    if (t.closest('#e-p-rect')) { nouvellePiece(); return; }
    if (t.closest('#e-p-dupl') && p) { dupliquerPiece(E.sel); return; }
    if (t.closest('#e-p-suppr') && p) { supprimerPiece(E.sel); return; }
  }
  function nouvellePiece(){
    memo('${T("Pièce ajoutée")}');
    var n = E.pieces.length + 1, id = 'piece' + n;
    while (E.pieces.some(function(p){ return p.id === id; })) id += '_';
    E.pieces.push({ id: id, nom: '${T("Nouvelle pièce")}', qte: 1, tissu: 'principal', couture: 1, ourlet: 3, aupli: false, coutures: {},
      contour: [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 30 }, { x: 0, y: 30 }], pinces: [], crans: [], droitFil: { a: { x: 10, y: 5 }, b: { x: 10, y: 25 } }, pli: null, mesures: {} });
    var dern = POS.length ? POS[POS.length - 1] : { x: 0, y: 0 }, bp = E.pieces.length > 1 ? boiteP(E.pieces[E.pieces.length - 2]) : { x1: -8 };
    POS.push({ x: dern.x + bp.x1 + 8, y: 0 });
    E.sel = E.pieces.length - 1; deselectionner(true); ONGLET = 'prop';
    apresChangement();
  }
  function dupliquerPiece(i){
    memo('${T("Pièce dupliquée")}');
    var c = copie(E.pieces[i]), id = c.id + '_2';
    while (E.pieces.some(function(p){ return p.id === id; })) id += '_';
    c.id = id; c.nom = (c.nom || nomPiece(E.pieces[i])) + ' ${T("(copie)")}';
    E.pieces.splice(i + 1, 0, c);
    var b = boiteP(c); POS.splice(i + 1, 0, { x: POS[i].x + (b.x1 - b.x0) + 8, y: POS[i].y + 4 });
    E.sel = i + 1; deselectionner(true); apresChangement();
  }
  function supprimerPiece(i){
    if (E.pieces.length <= 1) { dire('${T("Un patron garde au moins une pièce.")}', 'att'); return; }
    var p = E.pieces[i];
    szConfirmer({ titre: '${T("Supprimer cette pièce ?")}', texte: '${T("La pièce disparaît du patron. « Annuler » la ramène tant que la fenêtre reste ouverte.")}',
      details: [['${T("Pièce")}', nomPiece(p)]], oui: '${T("Supprimer la pièce")}', danger: true }).then(function(ok){
      if (!ok) return;
      memo('${T("Pièce supprimée")}');
      E.pieces.splice(i, 1); POS.splice(i, 1); E.sel = Math.min(i, E.pieces.length - 1); deselectionner(true); apresChangement();
    });
  }
  function changeEditeur(t){
    var p = E.pieces[E.sel]; if (!p) return;
    var id = t.id, v;
    if (id === 'e-nx' || id === 'e-ny') {
      v = depuisUnite(t.value); if (!isFinite(v)) { dire('${T("Nombre illisible.")}', 'err'); return; }
      memo('${T("Point placé au clavier")}');
      var n = p.contour[E.noeud], L = p.contour.length, nx = p.contour[(E.noeud + 1) % L], k = id === 'e-nx' ? 'x' : 'y', dd = r2(v) - n[k];
      suivreCrans(p, n, k === 'x' ? dd : 0, k === 'y' ? dd : 0);
      n[k] = r2(v); if (n.c2) n.c2[k] = r2(n.c2[k] + dd); if (nx.c1 && nx !== n) nx.c1[k] = r2(nx.c1[k] + dd);
    } else if (id === 'e-bc') {
      if (!String(t.value).trim()) { memo('${T("Couture du bord remise à celle de la pièce")}'); delete p.coutures[E.bord]; }
      else { v = depuisUnite(t.value); if (!isFinite(v) || v < 0 || v > 10) { dire('${T("Une couture va de 0 à 10 cm.")}', 'err'); return; } memo('${T("Couture d’un bord")}'); p.coutures[E.bord] = r2(v); }
    } else if (id === 'e-pnom') { memo('${T("Pièce renommée")}'); p.nom = String(t.value).slice(0, 40); }
    else if (id === 'e-pqte') { v = parseInt(t.value, 10); if (!(v >= 1 && v <= 20)) { dire('${T("Une quantité va de 1 à 20.")}', 'err'); return; } memo('${T("Quantité")}'); p.qte = v; }
    else if (id === 'e-ptissu') { memo('${T("Tissu de la pièce")}'); p.tissu = t.value; }
    else if (id === 'e-pcout') { v = depuisUnite(t.value); if (!isFinite(v) || v < 0 || v > 10) { dire('${T("Une couture va de 0 à 10 cm.")}', 'err'); return; } memo('${T("Couture de la pièce")}'); p.couture = r2(v); }
    else if (id === 'e-pourl') { v = depuisUnite(t.value); if (!isFinite(v) || v < 0 || v > 15) { dire('${T("Un ourlet va de 0 à 15 cm.")}', 'err'); return; } memo('${T("Ourlet de la pièce")}'); p.ourlet = r2(v); }
    else if (id === 'e-ppli') { memo(t.checked ? '${T("Pièce coupée au pli")}' : '${T("Pièce coupée en deux")}'); p.aupli = !!t.checked; }
    else return;
    apresChangement(); peindrePanneau(true);
  }
  function toucheEditeur(ev){
    var tag = ev.target && ev.target.tagName;
    var saisie = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
    if ((ev.ctrlKey || ev.metaKey) && !saisie) {
      var k = String(ev.key).toLowerCase();
      if (k === 'z' && !ev.shiftKey) { ev.preventDefault(); annuler(); return true; }
      if (k === 'y' || (k === 'z' && ev.shiftKey)) { ev.preventDefault(); refaire(); return true; }
      if (k === 's') { ev.preventDefault(); enregistrerEditeur(document.getElementById('e-enreg')); return true; }
      return false;
    }
    if (saisie) return false;
    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      var p = E.pieces[E.sel]; if (!p) return false;
      ev.preventDefault();
      if (E.noeud >= 0) { memo('${T("Point retiré")}'); if (retirerPoint(E.sel, E.noeud)) { E.noeud = -1; apresChangement(); } else PILE.pop(); }
      else if (E.cran >= 0) { memo('${T("Cran retiré")}'); p.crans.splice(E.cran, 1); E.cran = -1; apresChangement(); }
      else if (E.pince >= 0) { memo('${T("Pince retirée")}'); p.pinces.splice(E.pince, 1); E.pince = -1; apresChangement(); }
      return true;
    }
    var o = OUTILS.filter(function(x){ return x.touche === String(ev.key).toUpperCase(); })[0];
    if (o && !ev.altKey) { OUTIL = o.cle; MES = null; dessinerEditeur(); dire(AIDE_OUTIL[OUTIL]); return true; }
    return false;
  }

  /* ══ LES GESTES ═══════════════════════════════════════════════════════ */
  corps.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    if (VUE === 'editeur') { if (E) clicEditeur(ev); return; }
    var b;
    if ((b = t.closest('[data-editer]'))) { ouvrirEditeur(b.getAttribute('data-editer')); return; }
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
    if (VUE === 'editeur') return;
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-sel]') : null;
    if (b) ouvrirModele(b.getAttribute('data-sel'));
  });
  corps.addEventListener('input', function(ev){
    if (VUE === 'editeur') return;
    var t = ev.target;
    if (t && t.id === 'a-q') { Q = t.value; clearTimeout(window._atQ); window._atQ = setTimeout(redessinerSansPerdreLaSaisie, 200); return; }
    ramasser(t);
  });
  corps.addEventListener('change', function(ev){
    var t = ev.target; if (!t) return;
    if (VUE === 'editeur') { if (E) changeEditeur(t); return; }
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
  corps.addEventListener('mousedown', function(ev){
    if (VUE === 'editeur' && E && ev.target && ev.target.closest && ev.target.closest('#e-svg')) baisser(ev);
  });
  window.addEventListener('mousemove', function(ev){ if (VUE === 'editeur' && E) bouger(ev); });
  window.addEventListener('mouseup', function(){ if (GLISSE) lever(); });
  corps.addEventListener('wheel', function(ev){
    if (VUE !== 'editeur' || !E || !(ev.target && ev.target.closest && ev.target.closest('#e-toile'))) return;
    ev.preventDefault();
    var m = souris(ev); zoomer(K * (ev.deltaY < 0 ? 1.15 : 1 / 1.15), m.x, m.y);
  }, { passive: false });
  document.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    if (t.closest('#e-retour')) { quitterEditeur(); return; }
    if (t.closest('#e-annuler')) { annuler(); return; }
    if (t.closest('#e-refaire')) { refaire(); return; }
    if (t.closest('#e-enreg')) { enregistrerEditeur(t.closest('#e-enreg')); return; }
    if (t.closest('#m-editer')) { if (M && M.id && !TRACE) { var mid = M.id; M = null; ouvrirEditeur(mid); } return; }
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
    if (id.indexOf('p:') === 0) {                 // une pièce, dans le panneau de l éditeur
      var pi = parseInt(id.slice(2), 10); if (!E || !E.pieces[pi]) return null;
      return [{ lib: '${T("Choisir la pièce")}', fn: function(){ choisir(pi); peindre(); ONGLET = 'prop'; peindrePanneau(true); } },
        { lib: '${T("Dupliquer la pièce")}', fn: function(){ dupliquerPiece(pi); } },
        { trait: true }, { lib: '${T("Supprimer la pièce")}', dgr: true, fn: function(){ supprimerPiece(pi); } }];
    }
    var out = [{ lib: '${T("Ouvrir le modèle")}', fn: function(){ ouvrirModele(id); } },
      { lib: '${T("Éditer le patron")}', fn: function(){ ouvrirEditeur(id); } }];
    if (D.peutAjouter) out.push({ lib: '${T("Dupliquer")}', fn: function(){ dupliquer(id); } });
    if (D.peutSupprimer) { out.push({ trait: true }); out.push({ lib: '${T("Supprimer")}', dgr: true, fn: function(){ supprimer(id); } }); }
    return out;
  };

  function dessiner(){
    if (!D) return;
    if (VUE === 'editeur' && E) dessinerEditeur(); else if (VUE === 'modele' && M) dessinerModele(); else dessinerBiblio();
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
      else if (DEPART.indexOf('editeur:') === 0) { var de = DEPART.slice(8); DEPART = ''; ouvrirEditeur(de); }
      else dessiner();
      if (apres) apres(); else dire('');
    });
  }

  window.addEventListener('resize', function(){
    clearTimeout(window._atR);
    window._atR = setTimeout(function(){ if (VUE === 'modele' && AP) peindreApercu(AP); if (VUE === 'editeur' && E) peindre(); }, 160);
  });
  /* ⚠ JAMAIS PENDANT UNE SAISIE : recharger remettrait le formulaire à zéro. */
  window.szActualiser = function(){ if (VUE === 'biblio' && !OCCUPE) charger(); };
  window.szRevenir = window.szActualiser;
  document.addEventListener('keydown', function(ev){
    if (VUE === 'editeur' && E && ev.key !== 'Escape' && toucheEditeur(ev)) return;
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    if (VUE === 'editeur' && E) {
      if (GLISSE) return;
      if (MES) { MES = null; peindre(); peindrePanneau(true); return; }
      if (E.noeud >= 0 || E.bord >= 0 || E.cran >= 0 || E.pince >= 0) { deselectionner(true); peindre(); peindrePanneau(true); return; }
      if (E.sel >= 0) { E.sel = -1; peindre(); peindrePanneau(true); return; }
      quitterEditeur(); return;
    }
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
