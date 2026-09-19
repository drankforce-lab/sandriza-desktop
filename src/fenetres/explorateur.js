'use strict';

/*
 * FENÊTRE « EXPLORATEUR DE PHOTOS » — NATIVE (#32)
 * =============================================================================
 * Sa demande, capture à l'appui : « ça doit être dans une fenêtre détachée
 * quand on clique depuis la photothèque […] un affichage par liste peut
 * suffire, mais je dois vraiment pouvoir sélectionner mes 500 photos
 * facilement et voir l'aperçu de la photo — comme un explorateur Windows ».
 *
 * ⚠ LA VRAIE RAISON DE CETTE FENÊTRE : le sélecteur du Studio vit DANS sa
 * colonne de gauche. Il est étroit, les vignettes y sont minuscules et il n'y
 * a aucune place pour un aperçu. Aucun réglage ne corrige ça — il fallait
 * sortir l'écran de la colonne.
 *
 * ⚠ LE CŒUR NE CHANGE PAS. Filtres, tris et `tousLesIds` viennent de
 * `studio:explorer` (#28), déjà en place. C'est la PRÉSENTATION qui change :
 * deux affichages (liste et grille), un volet d'aperçu, et une sélection qui
 * se manie au clavier comme celle d'un explorateur.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');

/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la langue du
   poste, elle ne se traduit pas dans le navigateur.
   ⚠⚠ ON NE TRADUIT QUE CE QUI SE LIT : le nom d'une photo, son code, le nom du
   produit lié et le nom d'un lot d'import viennent de la photothèque — ce sont
   des DONNÉES. Voir l'en-tête de src/langue/explorateur.js. */
const T = require('../langue').tr('explorateur');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.05rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.barre{flex:0 0 auto;display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;
  padding:.5rem 1.05rem;border-bottom:1px solid var(--v06)}
input[type=search],select,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.28rem .5rem}
input[type=search]{flex:1 1 14rem;min-width:9rem}
button{cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
.jeton{font-size:.73rem;padding:.14rem .5rem;border-radius:99px}
.jeton.on{background:rgba(201,169,126,.2);border-color:#c9a97e;color:var(--tx-creme);font-weight:600}
.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
.vues{display:flex;gap:.15rem;margin-left:auto}
.vues button.on{border-color:#c9a97e;background:rgba(201,169,126,.16)}
/* Le corps : la liste a gauche, l apercu a droite — comme un explorateur. */
.corps{flex:1 1 auto;min-height:0;display:flex}
.zone{flex:1 1 auto;min-width:0;overflow-y:auto;padding:.5rem .7rem}
.zone::-webkit-scrollbar{width:9px}
.zone::-webkit-scrollbar-thumb{background:var(--v14);border-radius:8px}
/* Affichage LISTE : dense, une ligne par photo — c est celui qui permet de
   parcourir 500 photos sans defiler pendant une minute. */
table{width:100%;border-collapse:collapse;font-size:.82rem}
thead th{position:sticky;top:0;z-index:1;text-align:left;padding:.26rem .4rem;
  font-size:.67rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);
  font-weight:700;background:var(--f-page);border-bottom:1px solid var(--v12)}
/* ⚠ AUCUNE LIGNE DE TABLEAU, ET UN SURVOL DISCRET (demande du 2026-08-14 :
   << l effet de survol est affreux, on ne devrait pas voir les lignes du
   tableau >>). Le cadre dore posé cellule par cellule (box-shadow inset sur
   chaque td) redessinait la grille entiere autour de la ligne active : c est
   ce qui faisait sale. La ligne courante se marque maintenant par un LISERE a
   gauche, et le survol par un fond a peine visible. */
tbody tr{cursor:pointer}
tbody td{padding:.26rem .4rem;border:0;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:16rem}
tbody tr:hover td{background:var(--v03)}
tbody tr.pris td{background:rgba(201,169,126,.1)}
tbody tr.actif td:first-child{box-shadow:inset 2px 0 0 0 #c9a97e}
/* La case a cocher : visible, cliquable, et distincte du clic sur la ligne. */
th.ck,td.ck{width:1.9rem;max-width:1.9rem;padding:.12rem .2rem;text-align:center}
.coche{display:inline-flex;align-items:center;justify-content:center;
  width:1.05rem;height:1.05rem;border-radius:5px;cursor:pointer;
  border:1px solid var(--v40);background:var(--v06);
  font-size:.72rem;line-height:1;color:#17202c}
.coche:hover{border-color:#c9a97e}
.coche.on{background:#c9a97e;border-color:#c9a97e;font-weight:700}
.coche.flot{position:absolute;top:.25rem;left:.25rem;z-index:2;
  background:rgba(8,12,20,.72);color:var(--tx)}
.coche.flot.on{background:#c9a97e;color:#17202c}
.liste{max-height:calc(100vh - 15rem);overflow-y:auto}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding:.45rem .2rem 0;font-size:.75rem;color:var(--tx2)}
td.vig{width:2.4rem;max-width:2.4rem;padding:.1rem .2rem}
td.vig img{width:2rem;height:2rem;object-fit:contain;border-radius:4px;background:var(--f-pied);display:block}
/* La vignette de liste ne porte NI cadre NI contour : c est une image, pas un
   bouton — l encadrer ajoutait un rectangle de plus a une ligne deja chargee. */
td.vig img{border:0;outline:0}
/* Affichage GRILLE : quand on cherche a l oeil plutot qu au nom. */
.grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(8rem,1fr));gap:.5rem}
.vig{background:var(--f-carte);border:1px solid var(--v10);border-radius:9px;
  overflow:hidden;cursor:pointer;position:relative}
.vig.pris{border-color:#c9a97e;box-shadow:0 0 0 1px #c9a97e inset}
.vig.actif{outline:2px solid #c9a97e;outline-offset:-2px}
.vig img{width:100%;height:6rem;object-fit:contain;background:var(--f-pied);display:block}
.vig .nm{font-size:.68rem;color:var(--tx2);padding:.18rem .3rem;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis}
.pastilles{display:flex;gap:.15rem}
/* ⚠ CETTE PASTILLE PORTE PARFOIS UN PICTOGRAMME SEUL (le maillon « produit
   lié », dont le sens tient dans son attribut title). On ne peut donc pas la déclarer
   décorative : elle doit se LIRE. --tx2 la laissait à 4.2 sur les fonds des
   thèmes sombres ; --tx-bleute passe partout. */
.pt{font-size:.62rem;padding:.02rem .26rem;border-radius:4px;
  background:var(--v08);color:var(--tx-bleute)}
.pt.fait{color:var(--tx-ok)}
/* Le retour en arriere possible — dore, comme tout ce qui se decide ici. */
.pt.ret{color:var(--tx-or)}
/* La fiche produit en retard : c est un avertissement, pas un etat neutre. */
.pt.retard{color:#f0a05a;border:1px solid rgba(240,160,90,.4)}
/* Le volet d APERCU : la raison d etre de cette fenetre. */
.apercu{flex:0 0 19rem;border-left:1px solid var(--v08);
  background:var(--f-pill);display:flex;flex-direction:column;overflow-y:auto}
.apercu .img{padding:.6rem;text-align:center;background:var(--f-pied)}
.apercu .img img{max-width:100%;max-height:15rem;border-radius:8px}
.apercu .vide{padding:2rem .8rem;text-align:center;color:var(--tx2);font-size:.82rem}
.apercu .infos{padding:.55rem .7rem;font-size:.78rem;display:flex;flex-direction:column;gap:.3rem}
.apercu .infos .l{display:flex;gap:.5rem;justify-content:space-between}
.apercu .infos .k{color:var(--tx2)}
.apercu .infos .v{text-align:right;word-break:break-word}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.pied .cpt{font-size:.8rem}
.pied .cpt.on{color:var(--tx-creme);font-weight:700}
.pied .droite{margin-left:auto;display:flex;gap:.4rem}
.msg{font-size:.78rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
.vide{padding:2rem .8rem;text-align:center;color:var(--tx2);font-size:.84rem}
.aide{font-size:.72rem;color:var(--tx2)}
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.voile .boite{background:var(--f-carte);border:1px solid var(--v12);
  border-radius:13px;max-width:30rem;width:100%;padding:.9rem 1rem}
.voile h3{margin:0 0 .55rem;font:700 1.02rem/1.25 Georgia,serif}
.voile p{margin:.35rem 0;font-size:.85rem;line-height:1.5}
.voile .ch{margin:.5rem 0}
.voile .ch label{display:block;font-size:.72rem;color:var(--tx2);margin-bottom:.15rem}
.voile .ch input,.voile .ch select{width:100%}
.voile label.rc{display:flex;align-items:flex-start;gap:.5rem;margin-top:.6rem;
  font-size:.81rem;line-height:1.5;cursor:pointer}
.voile label.rc input{width:auto;margin-top:2px}
.voile .fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.9rem}

/* ── LA VISIONNEUSE (#143) : la photo en grand, au double-clic ───────────────
   ⚠ Elle couvre TOUTE la fenetre et se place au-dessus du voile des lots
   (z-index 60 contre 50) : ouverte par-dessus, elle doit se fermer la premiere,
   sinon on clique un bouton qu on ne voit plus. */
.vis{position:fixed;inset:0;z-index:60;background:rgba(6,10,18,.93);
  display:flex;flex-direction:column}
.vis .vtete{flex:0 0 auto;display:flex;align-items:center;gap:.5rem;
  padding:.5rem .8rem;border-bottom:1px solid var(--v08);background:var(--f-carte)}
.vis .vnom{flex:1 1 auto;font-size:.85rem;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap}
.vis .vtete button{border:1px solid var(--v12);border-radius:7px;
  background:var(--v04);color:var(--tx);font:inherit;font-size:.8rem;
  padding:.24rem .55rem;cursor:pointer}
.vis .vtete button:hover{background:var(--v10)}
.vis .vpct{font-variant-numeric:tabular-nums;font-size:.8rem;color:var(--tx2);
  min-width:3.4rem;text-align:center}
/* ⚠ overflow:hidden ET NON auto : le deplacement se fait a la souris, par
   transform. Une barre de defilement par-dessus se disputerait le glisser. */
.vis .vcadre{flex:1 1 auto;overflow:hidden;position:relative;
  display:flex;align-items:center;justify-content:center;cursor:grab}
.vis .vcadre.tire{cursor:grabbing}
/* ⚠ transform-origin au centre : le zoom part de ce qu on regarde, pas du coin
   haut-gauche — sinon l image fuit hors de l ecran des le premier cran. */
.vis .vcadre img{max-width:none;max-height:none;transform-origin:center center;
  user-select:none;-webkit-user-drag:none}
.vis .vvide{color:var(--tx2);font-size:.85rem;padding:2rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Explorateur de photos ». */
function pageExplorateur(mode) {
  /* ⚠ IDENTIFIANT D OUVERTURE << annuler >>. Le voile qui confirme un retour en
     arriere n existe qu apres avoir COCHE des photos puis CLIQUE — et le banc
     dessine, il ne clique pas. Or c est l ecran qui remplace cinq cents images
     d un coup : le laisser hors de tout controle serait exactement la panne
     muette du lanceur de lot, mort pendant deux versions sans que rien ne le
     signale. Ce mode coche tout, puis ouvre le voile. */
  const annulerTemoin = String(mode || '') === 'annuler';
  /* ⚠ IDENTIFIANT D OUVERTURE << appliquer >>. Meme raison que ci-dessus, et
     l enjeu est plus grand encore : ce voile-ci met a jour LA VITRINE. */
  const appliquerTemoin = String(mode || '') === 'appliquer';
  return `${TETE()}
<title>${T("Explorateur de photos — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.explorateur}</span><h1>${T("Explorateur de photos")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="barre" id="barre"></div>
<div class="corps" id="corps">
  <div class="zone" id="liste"><div class="vide charge">${T("Lecture de la photothèque…")}</div></div>
  <div class="apercu" id="apercu"><div class="vide">${T("Cliquez une photo pour la voir ici.")}</div></div>
</div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="cpt" id="cpt"></span>
  <span class="droite" id="actions"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var zone = document.getElementById('liste');
  var barreEl = document.getElementById('barre');
  var apercuEl = document.getElementById('apercu');
  var cptEl = document.getElementById('cpt');
  var actionsEl = document.getElementById('actions');

  var D = null;            // derniere reponse de studio:explorer
  var VUE = 'liste';       // liste | grille
  var Q = '', FILTRES = [], SANS = '', LOT = '', TRI = 'recent';
  var SEL = {};            // { id: true }
  var ANCRE = null;        // index de depart pour la selection Maj-clic
  // Pagination (#30) : le nombre de lignes est MESURE sur la hauteur reelle.
  // ⚠ SEL est keye par IDENTIFIANT : changer de page n y touche pas.
  var PAGE = 0, PARPAGE = 25;
  var COURANT = null;      // la photo affichee dans l apercu
  var OCC = false;
  /* ⚠⚠ LES VIGNETTES SE DEMANDENT A PART (#143). L op studio:explorer ne
     remplit son champ apercu que pour une photo rangee sur le RESEAU ; une photo
     importee vit en data: URL cote site, et cette fenetre n affichait alors
     RIEN — ni la colonne de la liste, ni les tuiles de la grille, ni le volet
     d apercu. La fenetre paraissait morte alors qu elle recevait bien ses 500
     lignes.
     ⚠ ON NE DEMANDE QUE LA PAGE AFFICHEE. La reponse porte jusqu a 500 lignes,
     mais on n en montre que PARPAGE : rapatrier les 500 images serait payer
     vingt fois ce qui se voit.
     ⚠ '' = demandee, rien a montrer. C est indefini qui veut dire jamais
     demandee — sans cette distinction on redemanderait a chaque repeinture. */
  var VIGN = {};
  var VIGN_OCC = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  /* L adresse du reseau si la photo en a une, sinon la vignette rapatriee.
     ⚠ UN SEUL ENDROIT QUI TRANCHE : les trois surfaces (colonne de la liste,
     tuile de la grille, volet d apercu) l appellent, sinon l une des trois
     finirait par rester sur l ancien champ — c est exactement ainsi que le
     defaut a vecu. */
  function vignetteDe(p){ return (p && (p.apercu || VIGN[p.id])) || ''; }
  /* ⚠ Le tiret quand il n y a rien reste ICI : c est une decision d affichage
     propre a cette fenetre, pas une mesure. Le reste vient de szOctets. */
  function poids(n){
    var o = Number(n) || 0;
    if (!o) return '—';
    return szOctets(o);
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application.")}',
    droit:              '${T("Votre rôle ne donne pas accès à la photothèque.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    module_photos:      '${T("La photothèque n’a pas pu être chargée.")}',
    aucune_photo:       '${T("Aucune photo choisie.")}',
    toutes_deja_faites: '${T("Toutes ces photos ont déjà ce traitement.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 120)) + ')';
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  /* ══ LA BARRE ═══════════════════════════════════════════════════════════ */
  function dessinerBarre(){
    var h = '<input type="search" id="q" aria-label="${T("Rechercher (nom, code, produit, ")}${T("SKU")})" placeholder="${T("Rechercher (nom, code, produit, SKU)…")}" value="'
      + esc(Q) + '">';
    h += (D && D.filtres ? D.filtres : []).map(function(f){
      return '<button class="jeton' + (FILTRES.indexOf(f.cle) >= 0 ? ' on' : '') + '"'
        + ' data-filtre="' + esc(f.cle) + '">' + esc(f.nom) + '</button>'; }).join('');
    h += '<select id="sans" aria-label="${T("Filtrer les photos sans un traitement donné")}">'
      + '<option value="">${T("Traitement — tous")}</option>'
      + (D && D.traitements ? D.traitements : []).map(function(t){
          return '<option value="' + esc(t.cle) + '"' + (SANS === t.cle ? ' selected' : '')
            + '>${T("Sans « ")}' + esc(t.nom) + ' »</option>'; }).join('') + '</select>';
    if (D && (D.lots || []).length) {
      h += '<select id="lot"><option value="">${T("Tous les lots")}</option>'
        + D.lots.map(function(l){
            return '<option value="' + esc(l.cle) + '"' + (LOT === l.cle ? ' selected' : '')
              + '>' + esc(l.nom) + '</option>'; }).join('') + '</select>';
    }
    h += '<select id="tri" aria-label="${T("Ordre de tri")}">' + [['recent', '${T("Plus récentes")}'], ['code', '${T("Code")}'], ['name', '${T("Nom")}'],
        ['linked', '${T("Liées d’abord")}'], ['size', '${T("Plus lourdes")}']].map(function(t){
        return '<option value="' + t[0] + '"' + (TRI === t[0] ? ' selected' : '') + '>'
          + t[1] + '</option>'; }).join('') + '</select>';
    h += '<span class="vues">'
      + '<button id="v-liste"' + (VUE === 'liste' ? ' class="on"' : '') + ' title="${T("Affichage en liste")}">☰</button>'
      + '<button id="v-grille"' + (VUE === 'grille' ? ' class="on"' : '') + ' title="${T("Affichage en vignettes")}">▦</button>'
      + '</span>';
    barreEl.innerHTML = h;
    brancherBarre();
  }

  function brancherBarre(){
    var q = document.getElementById('q');
    if (q) {
      q.oninput = function(){
        Q = q.value;
        clearTimeout(window._eq);
        window._eq = setTimeout(charger, 280);
      };
    }
    barreEl.querySelectorAll('[data-filtre]').forEach(function(el){
      el.onclick = function(){
        var c = el.getAttribute('data-filtre');
        var i = FILTRES.indexOf(c);
        if (i >= 0) FILTRES.splice(i, 1); else FILTRES.push(c);
        charger();
      };
    });
    var s = document.getElementById('sans');
    if (s) s.onchange = function(){ SANS = s.value; charger(); };
    var l = document.getElementById('lot');
    if (l) l.onchange = function(){ LOT = l.value; charger(); };
    var t = document.getElementById('tri');
    if (t) t.onchange = function(){ TRI = t.value; charger(); };
    var vl = document.getElementById('v-liste');
    if (vl) vl.onclick = function(){ VUE = 'liste'; dessiner(); };
    var vg = document.getElementById('v-grille');
    if (vg) vg.onclick = function(){ VUE = 'grille'; dessiner(); };
  }

  /* ══ LA LISTE ET LA GRILLE ══════════════════════════════════════════════ */
  function pastilles(p){
    var h = '';
    if ((p.faits || []).length) h += '<span class="pt fait" title="${T("Déjà traitée")}">✓</span>';
    /* ⚠ LA PASTILLE DIT CE QU ON DEFERAIT, pas seulement qu on peut defaire. Sur
       une photo passee par trois gestes, << annulable >> tout seul laisse
       exactement la question qu on se pose avant de cliquer. */
    if (p.annulable) {
      h += '<span class="pt ret" title="' + esc((p.annulableRetabli ? '${T("Rétablir « ")}' : '${T("Annuler « ")}')
        + nomTraitement(p.annulableQuoi) + ' »') + '">↩</span>';
    }
    /* ⚠ LA FICHE PRODUIT EN RETARD (lot 3f). C est la pastille qui compte le
       plus commercialement : elle dit que la BOUTIQUE affiche encore l image
       d avant le dernier traitement — donc qu on a paye un rendu que personne ne
       voit. Sans elle, rien a l ecran ne le laissait soupconner. */
    if (p.produitEnRetard) {
      /* ⚠ LA PHRASE D UN SEUL TENANT. Coupee en deux morceaux par la
         concatenation, elle donnait au poseur des cles generiques (« fiche »,
         « montre ») qui allaient se poser AILLEURS. Une infobulle est un texte
         comme un autre : il lui faut SA cle, entiere. */
      h += '<span class="pt retard" title="${T("La fiche produit montre encore l’image d’avant le dernier traitement")}">'
        + '<span class="ic">⚠</span>${T(" fiche")}</span>';
    }
    if (p.isole) h += '<span class="pt" title="${T("Détourée")}">◇</span>';
    if (p.lieId) h += '<span class="pt ic" title="' + esc(p.lieNom || '${T("Produit lié")}') + '"><span class="ic">🔗</span></span>';
    return h ? '<span class="pastilles">' + h + '</span>' : '';
  }

  /* ⚠ PAGINATION, MAIS LA SELECTION EST GARDEE (demande du 2026-08-14 :
     << une retenue des cases en cas de changement de page >>). SEL est keye par
     IDENTIFIANT, pas par position : changer de page, trier ou filtrer n y
     touche pas. C est ce qui permet de cocher trente photos page 1, dix page 4,
     et de lancer les quarante d un coup.
     ⚠ LES INDICES SONT GLOBAUX, pas ceux de la page : le Maj-clic peut donc
     prendre une plage qui TRAVERSE plusieurs pages. */
  /* Les libelles viennent du serveur quand il les donne (D.traitements), sinon
     de cette table de secours : une pastille qui dirait << fantome >> parlerait
     le langage du code, pas celui de l ecran. */
  var NOMS_TR = { detourage: '${T("Détourage")}', fantome: '${T("Mannequin retiré")}',
    humain: '${T("Porté par un mannequin")}', filigrane: '${T("Filigrane / logo")}' };
  function nomTraitement(cle){
    var c = String(cle || '');
    var l = ((D && D.traitements) || []).filter(function(t){ return t.cle === c; })[0];
    return (l && l.nom) || NOMS_TR[c] || c || '${T("dernier traitement")}';
  }

  function pageCourante(){
    var ph = (D && D.photos) || [];
    var pages = Math.max(1, Math.ceil(ph.length / PARPAGE));
    if (PAGE >= pages) PAGE = pages - 1;
    if (PAGE < 0) PAGE = 0;
    return { ph: ph, pages: pages, debut: PAGE * PARPAGE,
      vue: ph.slice(PAGE * PARPAGE, PAGE * PARPAGE + PARPAGE) };
  }

  function pagerHtml(pc){
    if (pc.pages <= 1) return '';
    return '<div class="pagi"><button class="jeton" id="p-prec"' + (PAGE <= 0 ? ' disabled' : '')
      + '>${T("‹ Précédent")}</button><span>${T("Page")} ' + (PAGE + 1) + '${T(" sur ")}' + pc.pages
      + ' — ' + pc.ph.length + ' ' + (pc.ph.length > 1 ? '${T("photos")}' : '${T("photo")}') + '</span>'
      + '<button class="jeton" id="p-suiv"' + (PAGE >= pc.pages - 1 ? ' disabled' : '')
      + '>${T("Suivant ›")}</button></div>';
  }

  // Toutes les photos de la PAGE sont-elles cochees ? (pour la case d en-tete)
  function pageToutePrise(pc){
    return pc.vue.length > 0 && pc.vue.every(function(p){ return !!SEL[p.id]; });
  }

  function dessinerListe(){
    var pc = pageCourante();
    if (!pc.ph.length) return vueVide();
    return '<div class="liste"><table><thead><tr>'
      // ⚠ UNE CASE D EN-TETE : cocher toute la page d un geste. Sans elle, la
      // case par ligne n aiderait pas beaucoup sur une page de trente.
      + '<th class="ck"><span class="coche' + (pageToutePrise(pc) ? ' on' : '')
      + '" id="ck-page" title="${T("Cocher toute la page")}">' + (pageToutePrise(pc) ? '✓' : '') + '</span></th>'
      + '<th></th><th>${T("Nom")}</th><th>${T("Code")}</th><th>${T("Produit lié")}</th>'
      + '<th>${T("État")}</th><th>${T("Poids")}</th></tr></thead><tbody>'
      + pc.vue.map(function(p, k){
          var i = pc.debut + k;
          return '<tr data-i="' + i + '" data-id="' + esc(p.id) + '"'
            + (SEL[p.id] ? ' class="pris' + (COURANT === p.id ? ' actif' : '') + '"'
                         : (COURANT === p.id ? ' class="actif"' : '')) + '>'
            + '<td class="ck"><span class="coche' + (SEL[p.id] ? ' on' : '') + '" data-ck="'
              + esc(p.id) + '">' + (SEL[p.id] ? '✓' : '') + '</span></td>'
            + '<td class="vig">' + (vignetteDe(p) ? '<img src="' + esc(vignetteDe(p)) + '" loading="lazy" alt="">' : '') + '</td>'
            + '<td>' + esc(p.nom) + '</td>'
            + '<td>' + esc(p.code || '') + '</td>'
            + '<td>' + esc(p.lieNom || '—') + '</td>'
            + '<td>' + pastilles(p) + '</td>'
            + '<td>' + poids(p.poids) + '</td></tr>'; }).join('')
      + '</tbody></table></div>' + pagerHtml(pc);
  }

  function dessinerGrille(){
    var pc = pageCourante();
    if (!pc.ph.length) return vueVide();
    return '<div class="liste"><div class="grille">' + pc.vue.map(function(p, k){
      var i = pc.debut + k;
      return '<div class="vig' + (SEL[p.id] ? ' pris' : '') + (COURANT === p.id ? ' actif' : '')
        + '" data-i="' + i + '" data-id="' + esc(p.id) + '" title="' + esc(p.nom) + '">'
        + '<span class="coche flot' + (SEL[p.id] ? ' on' : '') + '" data-ck="' + esc(p.id) + '">'
        + (SEL[p.id] ? '✓' : '') + '</span>'
        + (vignetteDe(p) ? '<img src="' + esc(vignetteDe(p)) + '" loading="lazy" alt="">'
                         : '<div style="height:6rem"></div>')
        + '<div class="nm">' + esc(p.nom) + '</div></div>'; }).join('')
      + '</div></div>' + pagerHtml(pc);
  }

  function vueVide(){
    if (D && D.charge === false) return '<div class="vide charge">${T("Lecture de la photothèque…")}</div>';
    var filtre = Q || FILTRES.length || SANS || LOT;
    return '<div class="vide">' + (filtre
      ? '${T("Aucune photo ne correspond à ces critères.")}'
      : '${T("Aucune photo dans la photothèque. Importez-en depuis l’écran Photothèque.")}') + '</div>';
  }

  /* ══ L APERCU ═══════════════════════════════════════════════════════════ */
  function dessinerApercu(){
    var p = null;
    ((D && D.photos) || []).forEach(function(x){ if (x.id === COURANT) p = x; });
    if (!p) { apercuEl.innerHTML = '<div class="vide">${T("Cliquez une photo pour la voir ici.")}</div>'; return; }
    var faits = (p.faits || []).map(function(f){
      var n = f;
      ((D && D.traitements) || []).forEach(function(t){ if (t.cle === f) n = t.nom; });
      return n;
    }).join(', ');
    var ligne = function(k, v){
      return '<div class="l"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + '</span></div>';
    };
    apercuEl.innerHTML = '<div class="img">'
      + (vignetteDe(p)
          /* ⚠ CLIQUABLE, ET IL FAUT LE DIRE. Le volet montre une image reduite ;
             sans un curseur qui change et une infobulle, personne ne devine
             qu elle s ouvre en grand. Le double-clic de la liste fait la meme
             chose — deux chemins vers le meme geste, aucun des deux cache. */
          ? '<img src="' + esc(vignetteDe(p)) + '" alt="' + esc(p.nom) + '"'
            + ' id="ap-img" style="cursor:zoom-in"'
            + ' title="${T("Cliquez pour voir en grand (zoom)")}">'
          /* ⚠ DEUX ETATS, PAS UN (#143). Tant que la vignette n est pas
             revenue, on attend ; quand elle est revenue VIDE, la photo est
             illisible et le dire vaut mieux que de laisser tourner un
             << televersement >> qui n aura jamais lieu. */
          : (VIGN[p.id] === ''
              ? '<div class="vide">${T("Aperçu indisponible pour cette photo.")}</div>'
              : '<div class="vide charge">${T("Téléversement en cours…")}</div>'))
      + '</div><div class="infos">'
      + ligne('${T("Nom")}', p.nom)
      + ligne('${T("Code")}', p.code || '—')
      + ligne('${T("Produit lié")}', p.lieNom || '${T("aucun")}')
      + (p.lieSku ? ligne('${T("SKU")}', p.lieSku) : '')
      + ligne('${T("Traitements")}', faits || '${T("aucun")}')
      + ligne('${T("Détourée")}', p.isole ? 'oui' : 'non')
      + ligne('${T("Poids")}', poids(p.poids))
      + (p.lotNom ? ligne('${T("Lot d’import")}', p.lotNom) : '')
      + '</div>';
    var ai = document.getElementById('ap-img');
    if (ai) ai.onclick = function(){ ouvrirGrand(p.id); };
  }

  /* ══ LA SELECTION ═══════════════════════════════════════════════════════
     ⚠ TROIS GESTES, COMME UN EXPLORATEUR, ET IL FAUT LES TROIS :
       clic        = ne garder que celle-ci (et l afficher) ;
       Ctrl-clic   = ajouter ou retirer une photo ;
       Maj-clic    = prendre toute la PLAGE depuis la derniere cliquee.
     C est le Maj-clic qui rend 500 photos selectionnables en deux gestes —
     sans lui, il faudrait 500 clics, ce qui est exactement le probleme. */
  function surClicLigne(i, id, ev){
    var ph = (D && D.photos) || [];
    if (ev.shiftKey && ANCRE != null) {
      var a = Math.min(ANCRE, i), b = Math.max(ANCRE, i);
      for (var k = a; k <= b; k++) if (ph[k]) SEL[ph[k].id] = true;
    } else {
      /* ⚠ UN CLIC COCHE, UN AUTRE DECOCHE (demande du 2026-08-14 : << quand on
         clique sur une photo ça devrait automatiquement la cocher et un autre
         clic la décocher >>). Le comportement d origine — clic = ne garder que
         celle-ci — venait de l explorateur Windows, mais ici on vient CHOISIR
         un lot : perdre trente photos cochees en cliquant la trente-et-unieme
         pour la regarder etait exactement le mauvais reflexe. */
      if (SEL[id]) delete SEL[id]; else SEL[id] = true;
      ANCRE = i;
    }
    COURANT = id;
    dessiner();
  }

  function brancherZone(){
    /* ⚠ LA CASE A COCHER EST UN GESTE A PART, et elle doit arreter l evenement :
       sans stopPropagation, le clic remonterait a la ligne, qui remet la
       selection a UNE SEULE photo — donc cocher aurait decoche tout le reste. */
    zone.querySelectorAll('[data-ck]').forEach(function(el){
      el.onclick = function(ev){
        ev.stopPropagation();
        var id = el.getAttribute('data-ck');
        if (SEL[id]) delete SEL[id]; else SEL[id] = true;
        dessiner();
      };
    });
    var ckp = document.getElementById('ck-page');
    if (ckp) ckp.onclick = function(ev){
      ev.stopPropagation();
      var pc = pageCourante();
      var tout = pageToutePrise(pc);
      pc.vue.forEach(function(p){ if (tout) delete SEL[p.id]; else SEL[p.id] = true; });
      dessiner();
    };
    zone.querySelectorAll('[data-i]').forEach(function(el){
      el.onclick = function(ev){
        surClicLigne(parseInt(el.getAttribute('data-i'), 10), el.getAttribute('data-id'), ev);
      };
    });
    /* LE DOUBLE-CLIC OUVRE EN GRAND (#143) — sa demande, dans ses mots :
       << un double clic peux nous ouvrir la photo en plus grand comme un
       explorateur de fichier >>.
       ⚠ Il vit A COTE du simple clic, qui garde son role (choisir la photo du
       volet). Les deux ne se genent pas : le navigateur envoie dblclick APRES
       les deux click, donc la photo visee est deja celle du volet. */
    zone.querySelectorAll('[data-i]').forEach(function(el){
      el.ondblclick = function(ev){
        ev.preventDefault();
        ouvrirGrand(el.getAttribute('data-id'));
      };
    });
    var pp = document.getElementById('p-prec');
    if (pp) pp.onclick = function(){ PAGE = Math.max(0, PAGE - 1); dessiner(); };
    var ps = document.getElementById('p-suiv');
    if (ps) ps.onclick = function(){ PAGE = PAGE + 1; dessiner(); };
  }

  /* ══ LA VISIONNEUSE — LA PHOTO EN GRAND, AVEC SON ZOOM (#143) ═════════════
     ⚠⚠ ELLE DEMANDE L IMAGE ENTIERE, pas la vignette. Agrandir une vignette de
     320 px donnerait une bouillie a 200 %, et le zoom ne servirait a rien : ce
     qu on veut voir en grand, c est justement le detail que la reduction a
     jete. D ou le drapeau plein sur l op des vignettes.
     ⚠ UNE SEULE PHOTO A LA FOIS, et seulement sur demande : l image entiere
     peut peser plusieurs megaoctets, on ne la rapatrie donc jamais pour garnir
     une grille. */
  var VIS_ID = '', VIS_Z = 1, VIS_X = 0, VIS_Y = 0;

  function visImg(){ var v = document.getElementById('vis-img'); return v; }
  function visAppliquer(){
    var im = visImg();
    if (im) im.style.transform = 'translate(' + VIS_X + 'px,' + VIS_Y + 'px) scale(' + VIS_Z + ')';
    var pct = document.getElementById('vis-pct');
    if (pct) pct.textContent = Math.round(VIS_Z * 100) + ' %';
  }
  /* ⚠ BORNEE DES DEUX COTES. Sans plancher on atteint une image de zero pixel
     qu on ne retrouve plus ; sans plafond, un coup de molette appuye fige la
     fenetre sur une image de trente mille pixels de large. */
  function visZoom(f, garderCentre){
    var av = VIS_Z;
    VIS_Z = Math.max(0.1, Math.min(8, VIS_Z * f));
    if (!garderCentre && av) { VIS_X = VIS_X * (VIS_Z / av); VIS_Y = VIS_Y * (VIS_Z / av); }
    visAppliquer();
  }
  function visAjuster(){ VIS_Z = 1; VIS_X = 0; VIS_Y = 0; visAppliquer(); }

  function fermerGrand(){
    VIS_ID = '';
    var v = document.getElementById('vis');
    if (v && v.parentNode) v.parentNode.removeChild(v);
  }

  function ouvrirGrand(id){
    if (!id) return;
    var ph = (D && D.photos) || [];
    var p = null;
    for (var i = 0; i < ph.length; i++) { if (ph[i].id === id) { p = ph[i]; break; } }
    if (!p) return;
    fermerGrand();
    VIS_ID = id; VIS_Z = 1; VIS_X = 0; VIS_Y = 0;

    var v = document.createElement('div');
    v.className = 'vis'; v.id = 'vis';
    v.innerHTML = '<div class="vtete">'
      + '<span class="vnom">' + esc(p.nom || '') + '</span>'
      + '<button id="vis-moins" title="${T("Réduire")}">−</button>'
      + '<span class="vpct" id="vis-pct">100 %</span>'
      + '<button id="vis-plus" title="${T("Agrandir")}">+</button>'
      + '<button id="vis-ajuster">${T("Ajuster")}</button>'
      + '<button id="vis-fermer" title="${T("Fermer")}">✕</button></div>'
      + '<div class="vcadre" id="vis-cadre">'
      + '<div class="vvide" id="vis-attente">${T("Chargement de l’image…")}</div></div>';
    document.body.appendChild(v);

    document.getElementById('vis-fermer').onclick = fermerGrand;
    document.getElementById('vis-plus').onclick = function(){ visZoom(1.25); };
    document.getElementById('vis-moins').onclick = function(){ visZoom(0.8); };
    document.getElementById('vis-ajuster').onclick = visAjuster;
    /* ⚠ ON NE FERME QUE SUR LE FOND. Sans ce test, relacher un glisser au-dessus
       de l image refermerait la visionneuse au milieu d un deplacement. */
    v.onclick = function(ev){ if (ev.target === v) fermerGrand(); };

    var cadre = document.getElementById('vis-cadre');
    cadre.onwheel = function(ev){ ev.preventDefault(); visZoom(ev.deltaY < 0 ? 1.12 : 0.89); };
    var tire = false, x0 = 0, y0 = 0;
    cadre.onmousedown = function(ev){
      tire = true; x0 = ev.clientX - VIS_X; y0 = ev.clientY - VIS_Y;
      cadre.classList.add('tire'); ev.preventDefault();
    };
    /* ⚠ SUR LA FENETRE, PAS SUR LE CADRE : relacher hors du cadre laisserait
       sinon l image collee au curseur pour toujours. */
    window.onmousemove = function(ev){
      if (!tire) return;
      VIS_X = ev.clientX - x0; VIS_Y = ev.clientY - y0; visAppliquer();
    };
    window.onmouseup = function(){ tire = false; cadre.classList.remove('tire'); };

    // L image entiere, demandee maintenant et pour celle-ci seulement.
    appeler('studio:vignettes', [{ ids: [id], plein: true }]).then(function(r){
      if (VIS_ID !== id) return;   // on a change de photo (ou ferme) entre-temps
      var src = (r && r.ok && r.vignettes && r.vignettes[id]) || vignetteDe(p);
      var c = document.getElementById('vis-cadre');
      if (!c) return;
      if (!src) { c.innerHTML = '<div class="vvide">${T("Cette photo n’a pas pu être lue.")}</div>'; return; }
      c.innerHTML = '<img id="vis-img" alt="' + esc(p.nom || '') + '">';
      document.getElementById('vis-img').src = src;
      visAppliquer();
    });
  }

  /* Combien, parmi les photos choisies, ont vraiment quelque chose à défaire.
     ⚠ ON NE COMPTE QUE CE QU ON CONNAIT. La selection survit au changement de
     page (elle est keyee par identifiant), mais l ecran ne detient que les
     photos chargees : une selection faite puis filtree peut contenir des
     identifiants dont on ignore l etat. Le compte est donc un MINIMUM — et le
     compte rendu du serveur, lui, dit la verite (voir << sansPrecedent >>). */
  function nAnnulables(){
    var ph = (D && D.photos) || [];
    var k = 0;
    ph.forEach(function(p){ if (SEL[p.id] && p.annulable) k++; });
    return k;
  }
  // Ce qu on s apprete a defaire, dit par son nom quand il n y en a qu un seul.
  function gesteAnnule(){
    var ph = (D && D.photos) || [];
    var vus = [];
    ph.forEach(function(p){
      if (SEL[p.id] && p.annulable && vus.indexOf(p.annulableQuoi) < 0) vus.push(p.annulableQuoi);
    });
    return vus;
  }

  /* ⚠⚠ UNE CONFIRMATION, ET PAS UN CLIC SEC. Annuler un lot de cinq cents
     remplace cinq cents images par leur etat d avant : c est le geste le plus
     lourd de cet ecran. ⚠ MAIS IL EST REVERSIBLE, et le voile le DIT — sans
     cela on hesiterait devant le seul bouton qui repare, ce qui est exactement
     l inverse du but. */
  function ouvrirAnnulerVoile(){
    var ids = Object.keys(SEL);
    if (!ids.length) return;
    var k = nAnnulables();
    var gestes = gesteAnnule();
    var quoi = (gestes.length === 1)
      ? ('« <strong>' + esc(nomTraitement(gestes[0])) + '</strong> »')
      : ('${T("leur ")}<strong>${T("dernier traitement")}</strong>');
    voile('<h3>${T("↩ Revenir à l’état précédent")}</h3>'
      + '<p>' + k + ' ' + (k > 1 ? '${T("photos")}' : '${T("photo")}') + '${T(" sur ")}' + ids.length
      + ' ' + (ids.length > 1 ? '${T("choisies")}' : '${T("choisie")}')
      + ' ' + (k > 1 ? '${T("retrouveront")}' : '${T("retrouvera")}')
      + ' ${T("l’état d’avant")} ' + quoi + '.</p>'
      + '<p><strong>${T("Aucun crédit n’est dépensé")}</strong>${T(" : l’image d’avant est déjà rangée, ")}'
      + '${T("on ne fait que la remettre en place.")}</p>'
      + '<p>${T("Le geste est ")}<strong>${T("réversible")}</strong>${T(" — le même bouton rétablira ce que ")}${T("vous")} '
      + '${T("venez d’annuler.")}</p>'
      /* ⚠ CE QU ON NE PEUT PAS DEFAIRE EST DIT AVANT, pas apres coup : une photo
         traitee deux fois n a gardé qu UN état, celui d avant le dernier geste. */
      + '<p style="color:var(--tx2)">${T("Un seul pas en arrière est conservé par photo : une photo")} '
      + '${T("passée par deux traitements ne remonte qu’au précédent, pas à l’originale.")}</p>'
      + (k < ids.length
          ? ('<p style="color:var(--tx-or)"><span class="ic">⚠</span> ' + (ids.length - k) + '${T(" photo")}'
             + ((ids.length - k) > 1 ? '${T("s n’ont")}' : '${T(" n’a")}') + ' ${T("rien à annuler et ne bougera")}'
             + ((ids.length - k) > 1 ? 'nt' : '') + '${T(" pas.")}</p>')
          : '')
      + '<div class="fin2"><button id="an-non">${T("Annuler")}</button>'
      + '<button class="prim" id="an-oui">${T("Revenir en arrière")}</button></div>',
      function(fermer){
        var non = document.getElementById('an-non');
        var oui = document.getElementById('an-oui');
        if (non) non.onclick = fermer;
        if (oui) oui.onclick = function(){
          oui.disabled = true;
          dire('${T("Retour en arrière…")}');
          appeler('photos:annulerLot', [ids]).then(function(r){
            fermer();
            if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
            var m = r.faites + ' '
              + (r.faites > 1 ? '${T("photos revenues")}' : '${T("photo revenue")}')
              + ' ${T("à l’état précédent.")}';
            if (r.sansPrecedent) m += ' ' + r.sansPrecedent + ' '
              + (r.sansPrecedent > 1 ? '${T("n’avaient rien à annuler.")}' : '${T("n’avait rien à annuler.")}');
            if (r.echecs && r.echecs.length) m += ' ' + r.echecs.length + ' ${T("en échec.")}';
            dire(m, (r.echecs && r.echecs.length) ? 'att' : 'bon');
            charger();   // les vignettes ont changé : on relit
          });
        };
      });
  }

  /* ══ PORTER LE RESULTAT DANS LA FICHE PRODUIT (lot 3f du #29) ══════════════
     Une photo rattachee a un article puis RETRAITEE ne remontait jamais jusqu a
     la fiche : la boutique continuait d afficher la copie faite au moment du
     rattachement. On payait un traitement que personne ne voyait. */
  function nAppliquer(){
    var ph = (D && D.photos) || [];
    var k = 0;
    ph.forEach(function(p){ if (SEL[p.id] && p.lieId) k++; });
    return k;
  }
  function nEnRetard(){
    var ph = (D && D.photos) || [];
    var k = 0;
    ph.forEach(function(p){ if (SEL[p.id] && p.produitEnRetard) k++; });
    return k;
  }

  function ouvrirAppliquerVoile(){
    var ids = Object.keys(SEL);
    if (!ids.length) return;
    var k = nAppliquer();
    var r = nEnRetard();
    voile('<h3><span class="ic">📦</span> ${T("Mettre à jour la fiche produit")}</h3>'
      + '<p>${T("L’image courante de")} ' + k + ' ' + (k > 1 ? '${T("photos")}' : '${T("photo")}')
      + ' ${T("sera portée dans la fiche de l’article auquel elle est rattachée.")}</p>'
      /* ⚠ ON DIT QUE C EST LA VITRINE. Un compte rendu qui parlerait de
         << fiches mises a jour >> laisserait croire a un rangement interne : ce
         qui change ici, c est ce qu une cliente voit sur la boutique. */
      + '<p><strong>${T("C’est ce que la boutique affichera")}</strong>${T(" — la photo du produit change ")}'
      + '${T("pour de bon, en ligne.")}</p>'
      /* ⚠ LE SINGULIER ET LE PLURIEL, CHACUN ENTIER. Decoupe en « fiche » + « s »
         + « montre » + « nt », la phrase ne laissait au poseur que des morceaux
         generiques, qui se posaient dans d autres phrases. */
      + (r ? ('<p style="color:var(--tx-or)">' + r
              + (r > 1 ? '${T(" fiches montrent")}' : '${T(" fiche montre")}')
              + '${T(" encore l’image d’<strong>avant</strong> le dernier ")}'
              + '${T("traitement — c’est justement ce qu’on répare.")}</p>')
           : '<p style="color:var(--tx2)">${T("Aucune de ces fiches n’est en retard : elles montrent déjà")} '
             + '${T("l’image courante. Rien ne changera visiblement.")}</p>')
      /* ⚠ LE CAS AMBIGU EST ANNONCE AVANT, pas decouvert dans le compte rendu :
         une fiche qui porte plusieurs images et dont on ignore laquelle vient de
         cette photo est REFUSEE, jamais devinee. */
      + '<p style="color:var(--tx2)">${T("Une photo rattachée avant la version 3.49 dont la fiche porte")} '
      + '<strong>${T("plusieurs images")}</strong>${T(" sera laissée de côté : on ne peut pas savoir laquelle ")}'
      + '${T("lui appartient, et remplacer la mauvaise mettrait un vêtement à la place d’un autre.")} '
      + '${T("Rattachez-la de nouveau pour lever le doute.")}</p>'
      + (k < ids.length
          ? ('<p style="color:var(--tx-or)"><span class="ic">⚠</span> ' + (ids.length - k) + ' '
             + ((ids.length - k) > 1
                 ? '${T("photos ne sont rattachées à aucun article et ne bougeront pas.")}'
                 : '${T("photo n’est rattachée à aucun article et ne bougera pas.")}') + '</p>')
          : '')
      + '<div class="fin2"><button id="ap-non">${T("Annuler")}</button>'
      + '<button class="prim" id="ap-oui">${T("Mettre à jour la vitrine")}</button></div>',
      function(fermer){
        var non = document.getElementById('ap-non');
        var oui = document.getElementById('ap-oui');
        if (non) non.onclick = fermer;
        if (oui) oui.onclick = function(){
          oui.disabled = true;
          dire('${T("Mise à jour des fiches…")}');
          appeler('photos:appliquerLot', [ids]).then(function(res){
            fermer();
            if (!res || !res.ok) { dire(expliquer(res), 'err'); return; }
            var m = res.faites + (res.faites > 1 ? '${T(" fiches mises à jour.")}' : '${T(" fiche mise à jour.")}');
            if (res.nonLiees) m += ' ' + res.nonLiees + '${T(" photo")}'
              + (res.nonLiees > 1 ? '${T("s non rattachées")}' : ' ${T("non rattachée")}') + '.';
            if (res.incertaines) m += ' ' + res.incertaines + (res.incertaines > 1
              ? '${T(" laissées de côté (plusieurs images, lien incertain).")}'
              : '${T(" laissée de côté (plusieurs images, lien incertain).")}');
            if (res.echecs && res.echecs.length) m += ' ' + res.echecs.length + ' ${T("en échec.")}';
            dire(m, ((res.echecs && res.echecs.length) || res.incertaines) ? 'att' : 'bon');
            charger();
          });
        };
      });
  }

  function dessinerPied(){
    var n = Object.keys(SEL).length;
    var dispo = (D && D.tousLesIds) ? D.tousLesIds.length : 0;
    cptEl.className = 'cpt' + (n ? ' on' : '');
    cptEl.textContent = n
      ? (n + ' ' + (n > 1 ? '${T("sélectionnées")}' : '${T("sélectionnée")}'))
      : '${T("Aucune sélection")}';
    actionsEl.innerHTML =
      '<button class="jeton" id="a-tout"' + (dispo ? '' : ' disabled') + '>${T("Tout (")}' + dispo + ')</button>'
      + '<button class="jeton" id="a-inv"' + (dispo ? '' : ' disabled') + '>${T("Inverser")}</button>'
      + '<button class="jeton" id="a-rien"' + (n ? '' : ' disabled') + '>${T("Vider")}</button>'
      /* ⚠ LE RETOUR EN ARRIERE EST ICI, ET PAS DANS LE STUDIO. Le Studio traite
         UNE photo a la fois ; le cas qui a motive ce lot-ci, c est cinq cents
         photos parties avec la mauvaise mise en scene. On repare la ou l on
         choisit, sur la meme selection qui a servi a lancer le lot. */
      + '<button class="jeton" id="a-annuler"' + (nAnnulables() ? '' : ' disabled')
      + ' title="${T("Revenir à l’état d’avant le dernier traitement")}">${T("↩ Annuler (")}'
      + nAnnulables() + ')</button>'
      /* ⚠ LE MOT << VITRINE >> EST SUR LE BOUTON, ET C EST VOULU : ce geste-ci
         ne touche pas a la phototheque, il change ce que la CLIENTE voit. Le
         libelle doit le dire avant le clic, pas le voile apres. */
      + '<button class="jeton" id="a-appliquer"' + (nAppliquer() ? '' : ' disabled')
      + ' title="${T("Porter l’image courante dans la fiche de l’article — c’est ce que la boutique montrera")}">'
      + '<span class="ic">📦</span> ${T("Mettre à jour la fiche (")}' + nAppliquer() + ')</button>'
      /* ⚠ ON N EXECUTE PLUS LE LOT ICI (corrige le 2026-08-14, sa demande :
         << la selection doit etre ramenee au studio virtuel et l on execute le
         lot a cet endroit >>). L explorateur CHOISIT, le Studio DECIDE — c est
         la ou l on voit la voie, l ambiance et le modele, donc la ou le choix
         du traitement a du sens. */
      + '<button class="prim" id="a-envoyer"' + (n ? '' : ' disabled') + '>'
      + '${T("→ Envoyer au Studio")}' + (n ? ' (' + n + ')' : '') + '</button>';
    var t = document.getElementById('a-tout');
    if (t) t.onclick = function(){
      ((D && D.tousLesIds) || []).forEach(function(id){ SEL[id] = true; }); dessiner(); };
    var iv = document.getElementById('a-inv');
    if (iv) iv.onclick = function(){
      ((D && D.tousLesIds) || []).forEach(function(id){
        if (SEL[id]) delete SEL[id]; else SEL[id] = true; }); dessiner(); };
    var r = document.getElementById('a-rien');
    if (r) r.onclick = function(){ SEL = {}; dessiner(); };
    var ann = document.getElementById('a-annuler');
    if (ann) ann.onclick = ouvrirAnnulerVoile;
    var app = document.getElementById('a-appliquer');
    if (app) app.onclick = ouvrirAppliquerVoile;
    var en = document.getElementById('a-envoyer');
    if (en) en.onclick = function(){
      var ids = Object.keys(SEL);
      if (!ids.length) return;
      en.disabled = true;
      appeler('panier:poser', [ids]).then(function(r){
        en.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.combien + ' '
          + (r.combien > 1 ? '${T("photos envoyées")}' : '${T("photo envoyée")}')
          + '${T(" au Studio — le traitement se lance là-bas.")}', 'bon');
        /* ⚠ ON FERME, ET C EST LE GESTE JUSTE (demande du 2026-08-14 : << quand
           on fait envoyer au studio ca devrait fermer l explorateur
           automatiquement >>). L explorateur est un SELECTEUR : une fois la
           selection remise au Studio, il n a plus rien a dire, et le laisser
           ouvert masque justement la fenetre ou le travail continue. Le Studio
           relit son panier tout seul — il n a pas besoin qu on le previenne.
           ⚠ Un court delai, pour que le message de confirmation se lise avant
           que la fenetre disparaisse : fermer dans la meme milliseconde donne
           l impression que rien ne s est passe. */
        setTimeout(function(){ if (P && P.fermer) P.fermer(); }, 700);
      });
    };
  }

  function dessiner(){
    zone.innerHTML = (VUE === 'liste') ? dessinerListe() : dessinerGrille();
    brancherZone();
    dessinerApercu();
    dessinerPied();
    var s = document.getElementById('sous');
    if (s && D) s.textContent = (D.trouvees || 0) + '${T(" sur ")}' + (D.total || 0);
    /* ⚠ LA MESURE VIENT APRES LE DESSIN : la hauteur reelle n existe qu une
       fois le tableau dans la page. Le socle ne rappelle que si le compte a
       CHANGE — sinon on redessinerait en boucle. La grille n est pas mesuree
       (ses tuiles n ont pas de hauteur de ligne) : elle garde son compte. */
    if (VUE === 'liste') {
      szAutoPagination('.liste', function(n){ PARPAGE = n; PAGE = 0; dessiner(); });
    }
    chargerVignettes();
  }

  /* La page affichee, plus la photo du volet d apercu — celle-ci en plus grand,
     puisqu elle occupe 19 rem et non une case de tableau.
     ⚠ La repeinture rappelle cette fonction : la recursion s arrete quand plus
     aucune case n est indefinie. ⚠ On marque MEME en cas d echec, sans quoi une
     reponse en erreur relancerait le meme paquet a chaque dessin. */
  function chargerVignettes(){
    if (VIGN_OCC || !D) return;
    var pc = pageCourante();
    var manque = [], vus = {};
    for (var i = 0; i < pc.vue.length; i++) {
      var p = pc.vue[i];
      if (!p || p.apercu || VIGN[p.id] !== undefined || vus[p.id]) continue;
      vus[p.id] = true; manque.push(p.id);
    }
    if (!manque.length) return;
    VIGN_OCC = true;
    appeler('studio:vignettes', [{ ids: manque, cote: 320 }]).then(function(r){
      VIGN_OCC = false;
      var v = (r && r.ok && r.vignettes) ? r.vignettes : {};
      for (var j = 0; j < manque.length; j++) {
        if (VIGN[manque[j]] === undefined) VIGN[manque[j]] = v[manque[j]] || '';
      }
      dessiner();
    });
  }

  /* ══ LANCER UN LOT ══════════════════════════════════════════════════════
     ⚠ ON DIT CE QUE CA COUTE AVANT. Chaque photo est un appel facture. */
  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    if (apres) apres(fermer);
    return fermer;
  }

  /* ⚠⚠ << ouvrirLot >> A ETE RETIREE a la cloture du chantier #29 (3.49.0). Elle
     lancait un lot DEPUIS ICI, avec son propre voile, son propre selecteur de
     traitement et son propre appel a lots:creer. Elle etait morte depuis le
     2026-08-14 : sa demande, ce jour-la, etait << la selection doit etre ramenee
     au studio virtuel et l on execute le lot a cet endroit >>. Le bouton avait
     ete remplace par << Envoyer au Studio >>, mais la fonction et son voile sont
     restes en place, injoignables.
     ⚠ POURQUOI LA SUPPRIMER PLUTOT QUE LA LAISSER DORMIR : c etait une SECONDE
     facon de lancer un lot, avec ses propres libelles et ses propres reglages.
     Laissee la, elle finit par etre rebranchee un jour << pour aller plus vite >>
     — et l on reintroduit exactement ce qu il avait demande de retirer, en plus
     d une geometrie de prix ecrite deux fois. L explorateur CHOISIT, le Studio
     DECIDE. */

  /* ══ CHARGEMENT ════════════════════════════════════════════════════════ */
  function charger(){
    if (OCC) return;
    OCC = true;
    /* ⚠ TAILLE 500 : c est un explorateur, pas un defilement infini. Charger
       page par page rendrait le Maj-clic inutile — on ne peut pas prendre une
       plage qui traverse une page pas encore lue. */
    appeler('studio:explorer', [{ q: Q, filtres: FILTRES, sansTraitement: SANS, lot: LOT,
      tri: TRI, page: 0, taille: 500 }]).then(function(r){
      OCC = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      D = r;
      dessinerBarre();
      dessiner();
      dire('');
      // Le crochet du banc (mode << annuler >>) : il n a rien a dire tant que la
      // photothèque n est pas la, sinon il compterait zero photo concernee.
      if (window.szApresCharge) { try { window.szApresCharge(); } catch (e) {} }
    });
  }

  window.szActualiser = function(){
    // Ne jamais recharger pendant qu on tape dans la recherche.
    var q = document.getElementById('q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ charger(); };

  document.addEventListener('keydown', function(ev){
    /* ⚠ LA VISIONNEUSE SE FERME LA PREMIERE (#143). Sans ce cas AVANT l autre,
       Echap fermerait LA FENETRE sous une photo ouverte en grand — on perdrait
       l explorateur, sa recherche et sa selection pour avoir voulu refermer une
       image. Meme raison que le test sur la classe voile, juste apres. */
    if (ev.key === 'Escape' && document.getElementById('vis')) {
      ev.preventDefault(); fermerGrand(); return;
    }
    if (ev.key === 'Escape' && !document.querySelector('.voile')) { ev.preventDefault(); P.fermer(); }
    // Ctrl+A : tout selectionner, comme partout ailleurs.
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'a' || ev.key === 'A')) {
      ev.preventDefault();
      ((D && D.tousLesIds) || []).forEach(function(id){ SEL[id] = true; });
      dessiner();
    }
  });

  charger();
  if (${annulerTemoin ? 'true' : 'false'}) {
    /* On attend que la photothèque soit là : ouvert avant, le voile ne saurait
       ni combien de photos sont concernées ni quel geste il défait — c est-à-dire
       tout ce qu on veut justement pouvoir relire avant de cliquer. */
    window.szApresCharge = function(){
      window.szApresCharge = null;
      ((D && D.tousLesIds) || []).forEach(function(id){ SEL[id] = true; });
      dessiner();
      ouvrirAnnulerVoile();
    };
  }
  if (${appliquerTemoin ? 'true' : 'false'}) {
    window.szApresCharge = function(){
      window.szApresCharge = null;
      ((D && D.tousLesIds) || []).forEach(function(id){ SEL[id] = true; });
      dessiner();
      ouvrirAppliquerVoile();
    };
  }
})();
</script>
</body></html>`;
}

module.exports = { pageExplorateur };
