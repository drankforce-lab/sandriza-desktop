'use strict';

/*
 * FENÊTRE « AJUSTEMENT DE STOCK » — NATIVE
 * =============================================================================
 * On y fait le geste le plus banal et le plus lourd de conséquences de la
 * boutique : entrer les quantités réelles de l'étagère. Elle ne charge aucune
 * page du site et ne fait aucun appel web — tout passe par le pont, qui
 * interroge la fenêtre principale, seule porteuse de la session.
 *
 * ⚠⚠ CE QU'IL A FALLU FAIRE AVANT D'ÉCRIRE UNE SEULE LIGNE D'ICI.
 * `Admin.saveStock` LISAIT LE DOM : elle allait chercher, pour chaque taille ×
 * couleur, les champs `stock-…`, `seuil-…`, `wh-…` de la modale du site. Appelée
 * depuis une fenêtre native — où aucun de ces champs n'existe — chaque lecture
 * aurait rendu `0`. Résultat : l'inventaire ENTIER du produit remis à zéro, sans
 * une erreur, sous un « Inventaire mis à jour. » vert. Une vente ratée se voit
 * dans la minute ; un stock effacé ne se découvre qu'au réassort, des semaines
 * plus tard, quand il n'y a plus rien à quoi le comparer.
 * La règle vit donc dans `Admin._stockEcrire`, qui ne touche à aucun élément
 * d'écran, et la modale du site en est devenue un simple lecteur de grille. Les
 * deux écrans enregistrent par le MÊME chemin.
 *
 * ⚠⚠ L'ÉTAT VIT HORS DE LA LISTE, ET C'EST VITAL ICI.
 * La grille est paginée et filtrable. Si l'on lisait les champs à
 * l'enregistrement, on n'obtiendrait que la PAGE AFFICHÉE — et le cœur, qui
 * exige une grille complète, refuserait ; ou pire, sans ce garde, on écrirait des
 * zéros partout ailleurs. Toute saisie est donc recopiée dans `VARS` à l'instant
 * où elle se fait, et c'est `VARS` — entier — qui part.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, et un accent grave égaré
 * referme la chaîne et casse toute la fenêtre. C'est arrivé six fois ici.
 */

const { JS_ACTIVITE } = require('./socle.js');

const CSS = `
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
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}

/* ⚠ LE CORPS NE DEFILE PAS. Seule la GRILLE des variantes peut defiler, et
   seulement quand une page ne tient pas — la pagination existe justement pour
   que cela n arrive pas. Le bouton d enregistrement reste toujours en vue. */
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow:hidden;
  display:flex;flex-direction:column;gap:.6rem}

.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem;flex:0 0 auto;min-height:0}
.carte.plein{flex:1 1 auto;display:flex;flex-direction:column;min-height:0}
.carte h2{margin:0 0 .45rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.09em;color:#8fa1b8;font-weight:700}
.carte h2 .note{font-weight:400;text-transform:none;letter-spacing:0;color:#6d7f96}

input,select{font:inherit;color:#e8edf5;background:#0f1826;
  border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:.3rem .45rem;
  width:100%;min-width:0}
input:focus,select:focus{outline:none;border-color:#c9a97e}
input.manque,select.manque{border-color:#f87171}
#rech{font-size:1rem;padding:.45rem .6rem}

button{font:inherit;cursor:pointer;border-radius:8px;padding:.32rem .7rem;
  border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);
  color:#e8edf5;transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
button.prim:hover:not(:disabled){background:#d8bd97;border-color:#d8bd97}
button.mini{padding:.12rem .42rem;font-size:.74rem}

/* Encarts d avertissement : le meme jaune que l administration. */
.avis{font-size:.78rem;line-height:1.45;border-radius:9px;padding:.45rem .7rem;
  background:rgba(245,158,11,.11);border:1px solid rgba(245,158,11,.42);color:#f0c987}
.aide{font-size:.73rem;color:#8fa1b8;line-height:1.45}
.aide b{color:#cbd8e6;font-weight:600}

/* ── Filtres couleur / taille ─────────────────────────────────────────────── */
.filtres{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;margin-bottom:.45rem}
.filtres .lbl{font-size:.72rem;color:#8fa1b8}
.menu{position:relative}
.menu .voile2{position:fixed;inset:0;z-index:39}
.menu .liste{position:absolute;top:calc(100% + 5px);left:0;z-index:40;min-width:170px;
  max-height:240px;overflow-y:auto;background:#16202f;border:1px solid rgba(255,255,255,.14);
  border-radius:9px;box-shadow:0 12px 30px rgba(0,0,0,.45);padding:.3rem}
.menu .liste label{display:flex;align-items:center;gap:.5rem;padding:.3rem .45rem;
  cursor:pointer;font-size:.8rem;border-radius:5px}
.menu .liste label:hover{background:rgba(255,255,255,.06)}
.menu .liste input{width:auto}

/* ── La grille des variantes ──────────────────────────────────────────────── */
.grille{flex:1 1 auto;min-height:0;overflow-y:auto}
.grille::-webkit-scrollbar{width:8px}
.grille::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
table{width:100%;border-collapse:collapse;font-size:.86rem}
thead th{position:sticky;top:0;background:#1b2635;text-align:left;
  padding:.34rem .5rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700}
thead th.c{text-align:center}
tbody td{padding:.24rem .5rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody td.c{text-align:center}
tbody tr.a{background:rgba(34,197,94,.07)}
tbody .var{display:inline-flex;align-items:center;gap:.5rem;white-space:nowrap}
tbody .pastille{width:14px;height:14px;border-radius:50%;flex:0 0 auto;
  border:1px solid rgba(0,0,0,.3)}
tbody .pastille.deg{border-radius:4px}
tbody .nom{font-size:.85rem;font-weight:600}
tbody tr.a .nom{color:#4ade80}
tbody .code{font-family:ui-monospace,monospace;font-size:.72rem;color:#c9a97e}
tbody .rien{color:#6d7f96}
td.q input,td.s input{width:4.6rem;text-align:center}
td.e select{min-width:8rem}

.pagi{flex:0 0 auto;display:flex;align-items:center;gap:.55rem;padding-top:.45rem;
  margin-top:.35rem;border-top:1px solid rgba(255,255,255,.07);
  font-size:.78rem;color:#8fa1b8;flex-wrap:wrap}
.pagi .pos{margin-left:auto}
.pagi select{width:auto;padding:.16rem .35rem;font-size:.76rem}

/* ── Liste de reachat et resultats de recherche ───────────────────────────── */
.lignes{flex:1 1 auto;min-height:0;overflow-y:auto}
.lignes::-webkit-scrollbar{width:8px}
.lignes::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.lg{display:flex;align-items:center;gap:.6rem;padding:.3rem .45rem;border-radius:7px;
  cursor:pointer;font-size:.85rem;border-top:1px solid rgba(255,255,255,.05)}
.lg:first-child{border-top:0}
.lg:hover{background:rgba(255,255,255,.055)}
.lg .principal{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lg .det{color:#8fa1b8;font-size:.78rem}
.lg .fin{flex:0 0 auto;font-size:.78rem;color:#8fa1b8;white-space:nowrap}
.lg .q{font-weight:700}
.lg .q.rup{color:#f87171}
.lg .q.bas{color:#fbbf24}

.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);
  background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
.actions{flex:0 0 auto;display:flex;gap:.4rem}
.vide{padding:1.5rem 1rem;text-align:center;color:#8fa1b8;font-size:.86rem}

/* Le compte rendu : un voile, pas une boite du systeme — celle-ci s ouvrirait
   DERRIERE la fenetre, comme le decompte d inactivite l a fait. */
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.5rem;z-index:50}
.voile .boite{background:#16202f;border:1px solid rgba(255,255,255,.12);
  border-radius:13px;padding:1.1rem 1.25rem;max-width:34rem;width:100%;
  max-height:80vh;overflow-y:auto}
.voile h3{margin:0 0 .55rem;font:700 1.05rem/1.25 Georgia,serif}
.voile p{margin:.35rem 0;font-size:.86rem}
.voile .rangee{display:flex;justify-content:space-between;gap:1rem;padding:.22rem 0;
  font-size:.84rem;border-top:1px solid rgba(255,255,255,.06)}
.voile .fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.85rem}
.voile textarea{width:100%;font:inherit;font-size:.78rem;color:#e8edf5;
  background:#0f1826;border:1px solid rgba(255,255,255,.14);border-radius:8px;
  padding:.4rem .5rem;resize:none}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Ajustement de stock ». */
function pageInventaire(id) {
  const depart = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Ajustement de stock — Administration Sandriza</title>
<style>${CSS}</style></head><body>
<div class="tete"><span class="ic">📦</span><h1 id="titre">Ajustement de stock</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions" id="actions"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var actions = document.getElementById('actions');
  var sous = document.getElementById('sous');

  var CTX = null;      // contexte : entrepots, droit d ecriture, seuil general
  var VUE = 'reappro'; // 'reappro' | 'recherche' | 'produit'
  var REAPPRO = [];    // lignes de la liste de reachat
  var TROUVES = [];    // resultats de la recherche par nom
  var PROD = null;     // { id, nom, sku, seuilHerite }
  var VARS = [];       // ⚠ L ETAT DE LA GRILLE, HORS de la liste affichee
  var BASE = null;     // instantane pris a l OUVERTURE — reference du conflit
  var ENTREPOTS = [];
  var FILTRE = { couleur: [], taille: [], menu: null };
  var PAGE = 0, TAILLE_PAGE = 25;
  var enCours = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ msg.className = 'msg' + (cl ? ' ' + cl : ''); msg.textContent = t || ''; }

  // ⚠ CHAQUE REFUS A SA PHRASE. Un ecran muet sur un refus de droit ressemble a
  // une panne, et l on cherche partout sauf dans les permissions.
  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne permet pas de modifier l’inventaire.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps. Réessayez ; si cela persiste, rechargez-la (Ctrl+R).',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Ce produit n’existe plus.',
    verrou:             'Produit ouvert par quelqu’un d’autre.',
    session_expiree:    'Inventaire NON enregistré — session expirée (inactivité, ou même compte utilisé ailleurs). Reconnectez-vous, puis refaites la saisie.',
    reseau:             'Inventaire NON enregistré (réseau). Réessayez.',
    agent_absent:       'Impression indisponible dans cette fenêtre.',
    aucune_etiquette:   'Aucune étiquette à imprimer (quantité 0).',
    imprimante:         'Aucune imprimante de codes-barres prête — voir Configuration puis Imprimantes.',
    impression:         'L’impression a échoué.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    if (m === 'verrou') return MOTIFS.verrou + (r.parQui ? ' (' + r.parQui + ')' : '');
    if ((m === 'imprimante' || m === 'impression') && r.detail) return MOTIFS[m] + ' ' + esc(r.detail);
    return MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
  }

  /* ⚠ UN SEUL POINT D APPEL, AVEC LE RATTRAPAGE CHAINE. Le second argument de
     << then >> ne rattrape que le rejet de la promesse d avant : ce que le premier
     LEVE lui passe a cote et devient un rejet non traite, invisible dans une
     fenetre native. Cette nuance a couche la fenetre Imprimantes pendant quatre
     versions publiees. Ici, tout passe par appeler(). */
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  function vide(titre, detail){
    corps.innerHTML = '<div class="carte plein"><div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div></div>';
    actions.innerHTML = '<button id="btn-fermer">Fermer</button>';
    brancherFermer();
  }

  // ══ DESSIN ════════════════════════════════════════════════════════════════
  // ⚠ TOUT LE DESSIN PASSE PAR ICI, et rien d autre n ecrit dans le corps : c est
  // ce qui rend la fenetre eprouvable au chargement (voir le garde-fou).
  function dessiner(){
    if (VUE === 'produit') { dessinerProduit(); return; }
    dessinerListe();
  }

  function dessinerListe(){
    var enRecherche = VUE === 'recherche';
    var lignes = enRecherche ? TROUVES : REAPPRO;
    var h = '<div class="carte">'
      + '<input id="rech" autocomplete="off" placeholder="Scannez une étiquette, ou tapez un nom de produit…">'
      + '<div class="aide" style="margin-top:.35rem">Un code de variante scanné ouvre directement sa fiche. '
      + 'Trois caractères minimum pour une recherche par nom.</div>'
      + '</div>';

    h += '<div class="carte plein"><h2>' + (enRecherche
        ? 'Résultats <span class="note">— ' + lignes.length + ' produit' + (lignes.length > 1 ? 's' : '') + '</span>'
        : 'À réapprovisionner <span class="note">— ' + lignes.length + ' variante'
          + (lignes.length > 1 ? 's' : '') + ' sous leur seuil</span>') + '</h2>';

    if (!lignes.length) {
      h += '<div class="vide">' + (enRecherche
        ? 'Aucun produit trouvé.'
        : '✓ Aucune variante à réapprovisionner — toutes sont au-dessus de leur seuil.')
        + '</div>';
    } else {
      h += '<div class="lignes">';
      if (enRecherche) {
        lignes.forEach(function(a){
          h += '<div class="lg" data-pid="' + esc(a.id) + '">'
            + '<span class="principal"><strong>' + esc(a.nom) + '</strong>'
            + (a.code ? ' <span class="code">' + esc(a.code) + '</span>' : '')
            + '</span>'
            + '<span class="fin">' + a.unites + ' unité' + (a.unites > 1 ? 's' : '')
            + ' · ' + a.variantes + ' variante' + (a.variantes > 1 ? 's' : '')
            + (a.alertes ? ' · <span class="q bas">' + a.alertes + ' à commander</span>' : '')
            + '</span></div>';
        });
      } else {
        // ⚠ MEME TRI QUE L ECRAN DU SITE (il vient deja trie du pont) : ce qui est
        // a zero d abord, puis le plus proche de la rupture EN PROPORTION.
        lignes.forEach(function(r){
          h += '<div class="lg" data-pid="' + esc(r.produitId) + '">'
            + '<span class="principal"><strong>' + esc(r.nom) + '</strong>'
            + ' <span class="det">' + esc(r.taille) + ' / ' + esc(r.couleur) + '</span>'
            + (r.sku ? ' <span class="code">' + esc(r.sku) + '</span>' : '')
            + '</span>'
            + '<span class="fin"><span class="q ' + (r.rupture ? 'rup' : 'bas') + '">' + r.qte
            + '</span> / seuil ' + r.seuil + '</span></div>';
        });
      }
      h += '</div>';
    }
    h += '</div>';
    corps.innerHTML = h;

    actions.innerHTML = (enRecherche ? '<button id="btn-retour">← Réapprovisionnement</button>' : '')
      + '<button id="btn-fermer">Fermer</button>';
    brancherListe();
  }

  // ── La grille d un produit ────────────────────────────────────────────────
  function visibles(){
    return VARS.filter(function(v){
      return (!FILTRE.couleur.length || FILTRE.couleur.indexOf(v.couleur) >= 0)
          && (!FILTRE.taille.length || FILTRE.taille.indexOf(v.taille) >= 0);
    });
  }

  function dessinerProduit(){
    var lot = visibles();
    var pages = Math.max(1, Math.ceil(lot.length / TAILLE_PAGE));
    if (PAGE > pages - 1) PAGE = pages - 1;
    if (PAGE < 0) PAGE = 0;
    var debut = PAGE * TAILLE_PAGE;
    var page = lot.slice(debut, debut + TAILLE_PAGE);

    var h = '';
    // ⚠ LES DEUX AVERTISSEMENTS DE L ECRAN DU SITE, repris au mot : sans entrepot
    // on ne peut pas assigner d emplacement, et sans SKU de base il n y a ni code
    // de variante ni etiquette.
    if (!ENTREPOTS.length) {
      h += '<div class="avis">⚠ Aucun emplacement configuré — créez-en un dans '
        + 'Inventaire puis Entrepôt pour pouvoir en assigner un aux variantes en stock.</div>';
    }
    if (!PROD.sku) {
      h += '<div class="avis">⚠ Ce produit n’a pas de SKU de base — assignez-lui un SKU '
        + 'dans la liste d’inventaire pour générer les codes de variante et les étiquettes.</div>';
    }

    h += '<div class="carte plein">';
    h += '<h2>' + esc(PROD.nom)
      + (PROD.sku ? ' <span class="note">— ' + esc(PROD.sku) + '</span>' : '')
      + ' <span class="note">· ' + VARS.length + ' variante' + (VARS.length > 1 ? 's' : '')
      + '</span></h2>';

    h += dessinerFiltres();

    if (!lot.length) {
      h += '<div class="vide">Aucune variante ne correspond aux filtres.</div>';
    } else {
      h += '<div class="grille"><table><thead><tr>'
        + '<th>Variante</th><th>Code</th><th class="c">Qté</th>'
        + '<th class="c">Seuil</th><th>Emplacement</th><th class="c"></th>'
        + '</tr></thead><tbody>';
      page.forEach(function(v){
        var i = VARS.indexOf(v);
        var actif = (parseInt(v.qte, 10) || 0) > 0;
        var deg = String(v.teinte || '').indexOf('linear-gradient') === 0;
        var manqueLieu = actif && !v.entrepot && ENTREPOTS.length;
        h += '<tr class="' + (actif ? 'a' : '') + '" data-l="' + i + '">'
          + '<td><span class="var">'
          +   '<span class="pastille' + (deg ? ' deg' : '') + '" style="background:'
          +   esc(v.teinte || '#ccc') + '"></span>'
          +   '<span class="nom">' + esc(v.taille) + ' / ' + esc(v.couleur) + '</span></span></td>'
          + '<td>' + (v.sku ? '<span class="code">' + esc(v.sku) + '</span>'
                            : '<span class="rien">—</span>') + '</td>'
          + '<td class="q"><input type="number" min="0" data-q="' + i + '" value="' + (parseInt(v.qte, 10) || 0) + '"></td>'
          // ⚠ TEXTE DE REMPLACEMENT = LE SEUIL HERITE, jamais une valeur posee dans
          // le champ : la poser en ferait une EXCEPTION que vider n effacerait plus.
          + '<td class="s"><input type="number" min="0" data-s="' + i + '" value="' + esc(v.seuil)
          +   '" placeholder="' + esc(PROD.seuilHerite == null ? '' : PROD.seuilHerite)
          +   '" title="Seuil de cette variante — vide = celui du produit"'
          +   (v.seuil === '' ? ' style="opacity:.6"' : '') + '></td>'
          + '<td class="e"><select data-e="' + i + '"' + (manqueLieu ? ' class="manque"' : '') + '>'
          +   '<option value="">—</option>'
          +   ENTREPOTS.map(function(w){
                return '<option value="' + esc(w.id) + '"' + (v.entrepot === w.id ? ' selected' : '')
                  + '>' + esc(w.code || w.nom || w.id) + '</option>'; }).join('')
          +   '</select></td>'
          + '<td class="c">' + (v.sku
              ? '<button class="mini" data-etiq="' + i + '" title="Imprimer les étiquettes de cette variante">🖨</button>'
              : '') + '</td>'
          + '</tr>';
      });
      h += '</tbody></table></div>';

      h += '<div class="pagi">'
        + '<span>Afficher</span><select id="pg-taille">'
        + [5, 10, 25, 50, 9999].map(function(n){
            return '<option value="' + n + '"' + (TAILLE_PAGE === n ? ' selected' : '') + '>'
              + (n === 9999 ? 'Tout' : n) + '</option>'; }).join('')
        + '</select><span>par page</span>'
        + '<span class="pos">'
        + (pages > 1
            ? '<button class="mini" id="pg-prec"' + (PAGE <= 0 ? ' disabled' : '') + '>← Préc.</button>'
              + ' Page <strong>' + (PAGE + 1) + '</strong> / ' + pages + ' '
              + '<button class="mini" id="pg-suiv"' + (PAGE >= pages - 1 ? ' disabled' : '') + '>Suiv. →</button>'
            : lot.length + ' variante' + (lot.length > 1 ? 's' : ''))
        + '</span></div>';
    }

    h += '<div class="aide" style="margin-top:.4rem">'
      + 'Un <b>emplacement</b> est obligatoire pour chaque variante ayant une quantité. '
      + 'La colonne <b>Seuil</b> ne se remplit que pour une variante qui fait exception ; '
      + 'laissée vide, elle suit le seuil du produit'
      + (PROD.seuilHerite == null ? '' : ' (<b>' + esc(PROD.seuilHerite) + '</b>)') + '.'
      + '</div>';
    h += '</div>';
    corps.innerHTML = h;

    actions.innerHTML = '<button id="btn-retour">← Liste</button>'
      + (PROD.sku ? '<button id="btn-tout">🖨 Tous les codes-barres</button>' : '')
      + '<button class="prim" id="btn-enr">Enregistrer l’inventaire</button>'
      + '<button id="btn-fermer">Fermer</button>';
    brancherProduit();
    majBouton();
  }

  function dessinerFiltres(){
    var couleurs = [], tailles = [];
    VARS.forEach(function(v){
      if (couleurs.indexOf(v.couleur) < 0) couleurs.push(v.couleur);
      if (tailles.indexOf(v.taille) < 0) tailles.push(v.taille);
    });
    function menu(type, libelle, toutes, choisies){
      if (toutes.length < 2) return '';
      var ouvert = FILTRE.menu === type;
      var h = '<div class="menu">';
      if (ouvert) h += '<div class="voile2" data-menu="' + type + '"></div>';
      h += '<button class="mini' + (choisies.length ? ' prim' : '') + '" data-menu="' + type + '"'
        + ' style="position:relative;z-index:41">' + libelle
        + (choisies.length ? ' (' + choisies.length + ')' : '') + (ouvert ? ' ▴' : ' ▾') + '</button>';
      if (ouvert) {
        h += '<div class="liste">';
        if (choisies.length) h += '<button class="mini" data-vider="' + type + '" style="width:100%;margin-bottom:.2rem">Tout afficher</button>';
        toutes.forEach(function(v, k){
          h += '<label><input type="checkbox" data-f="' + type + '" data-fi="' + k + '"'
            + (choisies.indexOf(v) >= 0 ? ' checked' : '') + '><span>' + esc(v) + '</span></label>';
        });
        h += '</div>';
      }
      return h + '</div>';
    }
    // ⚠ FILTRER NE PERD AUCUNE SAISIE : les valeurs vivent dans VARS, pas dans les
    // champs. C etait deja la promesse de l ecran du site, elle est tenue ici par
    // construction et non par precaution.
    var h = '<div class="filtres"><span class="lbl">Filtrer :</span>'
      + menu('couleur', 'Couleur', couleurs, FILTRE.couleur)
      + menu('taille', 'Taille', tailles, FILTRE.taille) + '</div>';
    // Les index servent au clic (voir brancherProduit) : on les retient.
    window._fCouleurs = couleurs; window._fTailles = tailles;
    return h;
  }

  function majBouton(){
    var b = document.getElementById('btn-enr');
    if (!b) return;
    var peut = !!(CTX && CTX.peutEcrire) && !enCours;
    b.disabled = !peut;
    b.textContent = enCours ? 'Enregistrement…'
      : (CTX && CTX.peutEcrire ? 'Enregistrer l’inventaire' : 'Lecture seule');
  }

  // ══ ECOUTEURS ═════════════════════════════════════════════════════════════
  function brancherFermer(){
    var f = document.getElementById('btn-fermer');
    if (f) f.onclick = function(){ quitter(); };
  }

  var rechT = null;
  function brancherListe(){
    brancherFermer();
    var r = document.getElementById('btn-retour');
    if (r) r.onclick = function(){ VUE = 'reappro'; dessiner(); };
    var champ = document.getElementById('rech');
    if (champ) {
      champ.oninput = function(){
        var q = this.value;
        clearTimeout(rechT);
        rechT = setTimeout(function(){ chercher(q); }, 220);
      };
      champ.onkeydown = function(ev){
        if (ev.key === 'Enter') { ev.preventDefault(); clearTimeout(rechT); chercher(this.value); }
      };
      champ.focus();
    }
    // ⚠ ECOUTEUR DELEGUE : les lignes sont redessinees a chaque recherche, un
    // ecouteur pose sur chacune serait reperdu au premier redessin.
    corps.onclick = function(ev){
      var t = ev.target;
      if (!t || !t.closest) return;
      var l = t.closest('.lg');
      if (l) ouvrirProduit(l.getAttribute('data-pid'));
    };
  }

  function brancherProduit(){
    brancherFermer();
    var r = document.getElementById('btn-retour');
    if (r) r.onclick = function(){ rendreVerrou(); VUE = 'reappro'; PROD = null; charger(); };
    var e = document.getElementById('btn-enr');
    if (e) e.onclick = enregistrer;
    var tt = document.getElementById('btn-tout');
    if (tt) tt.onclick = toutesLesEtiquettes;
    var pt = document.getElementById('pg-taille');
    if (pt) pt.onchange = function(){ TAILLE_PAGE = parseInt(this.value, 10) || 25; PAGE = 0; dessiner(); };
    var pp = document.getElementById('pg-prec');
    if (pp) pp.onclick = function(){ PAGE--; dessiner(); };
    var ps = document.getElementById('pg-suiv');
    if (ps) ps.onclick = function(){ PAGE++; dessiner(); };

    /* ⚠⚠ TOUTE SAISIE PART DANS VARS A L INSTANT MEME. C est le point qui rend
       cette fenetre sure : la grille est paginee et filtrable, lire les champs a
       l enregistrement ne rendrait que la page affichee — et le reste partirait a
       zero, sans un mot. On ecoute donc en delegue, sur le corps, et l on recopie. */
    corps.oninput = function(ev){
      var t = ev.target;
      if (!t || !t.getAttribute) return;
      var iq = t.getAttribute('data-q');
      if (iq !== null) {
        var v = VARS[parseInt(iq, 10)];
        if (!v) return;
        v.qte = Math.max(0, parseInt(t.value, 10) || 0);
        var tr = t.closest ? t.closest('tr') : null;
        if (tr) tr.className = v.qte > 0 ? 'a' : '';
        var sel = tr ? tr.querySelector('select') : null;
        if (sel) sel.className = (v.qte > 0 && !v.entrepot && ENTREPOTS.length) ? 'manque' : '';
        return;
      }
      var is = t.getAttribute('data-s');
      if (is !== null) {
        var w = VARS[parseInt(is, 10)];
        if (!w) return;
        w.seuil = String(t.value || '').trim();
        t.style.opacity = w.seuil === '' ? '.6' : '1';
      }
    };
    corps.onchange = function(ev){
      var t = ev.target;
      if (!t || !t.getAttribute) return;
      var ie = t.getAttribute('data-e');
      if (ie === null) return;
      var v = VARS[parseInt(ie, 10)];
      if (!v) return;
      v.entrepot = t.value || '';
      t.className = ((parseInt(v.qte, 10) || 0) > 0 && !v.entrepot && ENTREPOTS.length) ? 'manque' : '';
    };
    corps.onclick = function(ev){
      var t = ev.target;
      if (!t || !t.closest) return;
      var m = t.closest('[data-menu]');
      if (m) { var n = m.getAttribute('data-menu'); FILTRE.menu = (FILTRE.menu === n) ? null : n; dessiner(); return; }
      var vd = t.closest('[data-vider]');
      if (vd) { FILTRE[vd.getAttribute('data-vider')] = []; PAGE = 0; dessiner(); return; }
      if (t.getAttribute && t.getAttribute('data-f')) {
        var type = t.getAttribute('data-f');
        var liste = type === 'couleur' ? (window._fCouleurs || []) : (window._fTailles || []);
        var val = liste[parseInt(t.getAttribute('data-fi'), 10)];
        var k = FILTRE[type].indexOf(val);
        if (k >= 0) FILTRE[type].splice(k, 1); else FILTRE[type].push(val);
        PAGE = 0; dessiner();
        return;
      }
      var et = t.closest('[data-etiq]');
      if (et) etiquettesVariante(parseInt(et.getAttribute('data-etiq'), 10));
    };
  }

  // ══ CHARGEMENT ════════════════════════════════════════════════════════════
  function chercher(texte){
    var q = String(texte || '').trim();
    if (!q) { VUE = 'reappro'; dessinerListe(); return; }
    appeler('stock:chercher', [q]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      if (r.sku) { dire(''); ouvrirProduit(r.sku.produitId, r.sku.cle); return; }
      if (r.court) { dire('Trois caractères minimum.', 'att'); return; }
      dire('');
      TROUVES = r.articles || [];
      VUE = 'recherche';
      // ⚠ ON REDESSINE SANS RENDRE LE FOCUS : la personne est en train de taper.
      var champ = document.getElementById('rech');
      var pos = champ ? champ.selectionStart : null;
      var val = champ ? champ.value : '';
      dessinerListe();
      var neuf = document.getElementById('rech');
      if (neuf) { neuf.value = val; if (pos !== null) { try { neuf.setSelectionRange(pos, pos); } catch (e) {} } }
    });
  }

  function ouvrirProduit(pid, cleEnAvant){
    if (!pid) return;
    dire('Ouverture…');
    appeler('stock:lire', [pid]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      PROD = r.produit;
      ENTREPOTS = r.entrepots || [];
      // ⚠ L INSTANTANE VIENT DU SITE ET NE BOUGE PLUS : c est la reference de la
      // detection de conflit. Le recalculer au moment d enregistrer reviendrait a
      // comparer l etat courant a lui-meme, donc a ne rien detecter du tout.
      BASE = r.base;
      VARS = (r.variantes || []).map(function(v){
        return { cle: v.cle, taille: v.taille, couleur: v.couleur, sku: v.sku,
                 teinte: v.teinte, qte: v.qte, seuil: v.seuil, entrepot: v.entrepot };
      });
      FILTRE = { couleur: [], taille: [], menu: null };
      PAGE = 0;
      // Un code scanne designe une variante : on la met en avant en filtrant sur
      // sa couleur, plutot que de laisser chercher une ligne parmi trente.
      if (cleEnAvant) {
        var v = VARS.filter(function(x){ return x.cle === cleEnAvant; })[0];
        if (v) FILTRE.couleur = [v.couleur];
      }
      VUE = 'produit';
      document.getElementById('titre').textContent = 'Ajustement de stock';
      dire('');
      dessiner();
      prendreVerrou(pid);
    });
  }

  var VERROU_PRIS = false;
  function prendreVerrou(pid){
    // ⚠ A L OUVERTURE, PAS A L ENREGISTREMENT : decouvrir le verrou apres avoir
    // saisi trente quantites, c est perdre la saisie.
    appeler('verrou:prendre', ['products', pid]).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      VERROU_PRIS = !!v.obtenu;
      if (v.obtenu) { sous.textContent = v.horsLigne ? '🔓 hors ligne' : '🔒 fiche réservée'; return; }
      sous.textContent = '⚠ ouverte par ' + (v.parQui || 'quelqu’un d’autre');
      var b = document.getElementById('btn-enr');
      if (b) { b.disabled = true; b.textContent = 'Ouverte ailleurs'; }
      dire('Enregistrement bloqué : ce produit est ouvert ailleurs.', 'err');
    });
  }
  function rendreVerrou(){
    if (!VERROU_PRIS) return;
    VERROU_PRIS = false;
    sous.textContent = '';
    appeler('verrou:rendre');
  }

  function charger(){
    appeler('stock:contexte').then(function(c){
      if (!c || !c.ok) { vide('Inventaire indisponible', expliquer(c)); return; }
      CTX = c;
      sous.textContent = c.peutEcrire ? '' : '👁 Lecture seule';
      return appeler('stock:reappro').then(function(r){
        if (!r || !r.ok) { vide('Inventaire indisponible', expliquer(r)); return; }
        REAPPRO = r.lignes || [];
        dessiner();
      });
    });
  }

  // ══ ENREGISTREMENT ════════════════════════════════════════════════════════
  function enregistrer(){
    if (enCours || !PROD) return;
    enCours = true; majBouton(); dire('Enregistrement…');
    // ⚠ LA GRILLE PART ENTIERE, filtres et pagination ignores. Les cartes stock et
    // lowStockVar font autorite pour le produit : une saisie
    // partielle mettrait le reste a zero. Le coeur refuse d ailleurs une grille
    // incomplete plutot que d ecrire une version amputee.
    var saisie = {
      variantes: VARS.map(function(v){
        return { cle: v.cle, taille: v.taille, couleur: v.couleur,
                 qte: v.qte, seuil: v.seuil, entrepot: v.entrepot };
      }),
      base: BASE
    };
    appeler('stock:enregistrer', [PROD.id, saisie]).then(function(r){
      enCours = false;
      if (r.ok) { majBouton(); apresSucces(r); return; }
      majBouton();
      echec(r);
    });
  }

  function nommer(cle){
    var v = VARS.filter(function(x){ return x.cle === cle; })[0];
    return v ? (v.taille + ' / ' + v.couleur) : cle;
  }

  function echec(r){
    if (r.motif === 'seuil_invalide') {
      dire('Seuil invalide pour : ' + (r.seuilsInvalides || []).map(nommer).join(', ') + '.', 'err');
      return;
    }
    if (r.motif === 'emplacement_requis') {
      var m = r.manquants || [];
      dire('Sélectionnez un emplacement pour : ' + m.map(nommer).join(', ') + '.', 'err');
      // On amene la personne SUR la variante fautive : sans cela, la ligne
      // nommee peut se trouver sur une autre page et le message ne sert a rien.
      if (m.length) {
        FILTRE = { couleur: [], taille: [], menu: null };
        var v = VARS.filter(function(x){ return x.cle === m[0]; })[0];
        if (v) { var k = VARS.indexOf(v); PAGE = Math.floor(k / TAILLE_PAGE); }
        dessiner();
      }
      return;
    }
    if (r.motif === 'conflit') {
      conflit(r);
      return;
    }
    if (r.motif === 'grille_incomplete') {
      dire('Inventaire NON enregistré — la grille est incomplète ('
        + (r.absentes || []).slice(0, 3).join(', ') + '). Rouvrez le produit.', 'err');
      return;
    }
    dire(expliquer(r), 'err');
  }

  /* ⚠ UN CONFLIT N EST PAS UNE PANNE, ET IL SE RACONTE. Le collegue a touche la
     MEME variante que moi : rien n a ete ecrit, et la grille est rechargee avec
     les quantites a jour pour que la saisie se refasse par-dessus, en connaissance
     de cause. (Quand il a touche d AUTRES variantes, le site a deja fusionne et
     rejoue tout seul — on n arrive jamais ici dans ce cas.) */
  function conflit(r){
    var lignes = (r.conflits || []).map(function(c){
      return '<div class="rangee"><span>' + esc(nommer(c.cle)) + '</span><strong>' + c.actuel + '</strong></div>';
    }).join('');
    voile('<h3>⚠ Inventaire non enregistré</h3>'
      + '<p>Un collègue vient de modifier ' + ((r.conflits || []).length > 1 ? 'ces variantes' : 'cette variante')
      + '. <strong>Rien n’a été écrit.</strong></p>'
      + lignes
      + '<p style="color:#8fa1b8;font-size:.8rem">La grille est rechargée avec les quantités à jour : '
      + 'refaites votre saisie par-dessus.</p>'
      + '<div class="fin2"><button class="prim" id="v-ok">Recharger la grille</button></div>',
      function(fermer){
        document.getElementById('v-ok').onclick = function(){
          fermer();
          var pid = PROD.id;
          rendreVerrou();
          ouvrirProduit(pid);
        };
      });
  }

  function apresSucces(r){
    var h = '<h3>✅ Inventaire enregistré</h3><p>' + esc(r.nom || '') + '</p>';
    var c = r.courriels;
    if (c && c.manuel) {
      // ⚠ ON NE PRETEND PAS QUE C EST PARTI. Resend n est pas configure : aucun
      // courriel n a ete envoye, et les demandes restent en attente en base.
      h += '<p class="" style="color:#fbbf24">⚠ ' + c.adresses.length + ' client'
        + (c.adresses.length > 1 ? 's attendent' : ' attend') + ' cette variante, et '
        + '<strong>aucun courriel n’est parti</strong> — la clé d’envoi n’est pas configurée '
        + '(Configuration puis Infolettre). Les demandes restent en attente.</p>'
        + '<textarea rows="2" readonly>' + esc(c.adresses.join(', ')) + '</textarea>';
    } else if (c) {
      h += '<p style="color:#4ade80">✉ ' + c.envoyes + ' courriel' + (c.envoyes > 1 ? 's' : '')
        + ' de retour en inventaire envoyé' + (c.envoyes > 1 ? 's' : '')
        + (c.echecs ? ', <span style="color:#f87171">' + c.echecs + ' échec'
            + (c.echecs > 1 ? 's' : '') + '</span>' : '') + '.</p>';
    }
    var etiq = r.etiquettes || [];
    var total = 0;
    etiq.forEach(function(it){ total += (parseInt(it.qty, 10) || 0); });
    if (etiq.length) {
      h += '<p>Imprimer les étiquettes code-barres selon les quantités saisies ? '
        + '<strong>' + total + '</strong> étiquette' + (total > 1 ? 's' : '')
        + ' pour ' + etiq.length + ' variante' + (etiq.length > 1 ? 's' : '') + '.</p>';
    }
    h += '<div class="fin2">'
      + (etiq.length ? '<button id="v-plus-tard">Plus tard</button>'
                       + '<button class="prim" id="v-imprimer">🖨 Imprimer maintenant</button>'
                     : '<button class="prim" id="v-ok">Fermer</button>')
      + '</div>';
    voile(h, function(fermer){
      var ok = document.getElementById('v-ok');
      if (ok) ok.onclick = function(){ fermer(); retourListe(); };
      var pt = document.getElementById('v-plus-tard');
      if (pt) pt.onclick = function(){ fermer(); retourListe(); };
      var im = document.getElementById('v-imprimer');
      if (im) im.onclick = function(){
        im.disabled = true; im.textContent = 'Impression…';
        appeler('stock:etiquettes', [etiq]).then(function(z){
          fermer();
          dire(z.ok ? (z.envoyees + ' étiquette(s) envoyée(s) à « ' + z.imprimante + ' ».')
                    : expliquer(z), z.ok ? 'bon' : 'err');
          retourListe();
        });
      };
    });
  }

  // Apres un enregistrement reussi on revient a la liste, RECHARGEE : la variante
  // qu on vient de remplir ne doit plus figurer parmi celles a commander.
  function retourListe(){
    rendreVerrou();
    PROD = null; VARS = []; BASE = null;
    VUE = 'reappro';
    charger();
  }

  // ══ ETIQUETTES ════════════════════════════════════════════════════════════
  function etiquettesVariante(i){
    var v = VARS[i];
    if (!v || !v.sku) return;
    var defaut = Math.max(1, parseInt(v.qte, 10) || 1);
    voile('<h3>🏷 Imprimer des étiquettes</h3>'
      + '<p><span class="code">' + esc(v.sku) + '</span> — ' + esc(v.taille) + ' / ' + esc(v.couleur) + '</p>'
      + '<p><label>Nombre d’étiquettes<input type="number" min="1" id="v-qte" value="' + defaut + '"></label></p>'
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="prim" id="v-oui">Imprimer</button></div>',
      function(fermer){
        var champ = document.getElementById('v-qte');
        if (champ) champ.focus();
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){
          var n = parseInt(champ.value, 10);
          if (!(n > 0)) { dire('Quantité invalide.', 'err'); return; }
          fermer();
          imprimer([{ sku: v.sku, name: PROD.nom, size: v.taille, color: v.couleur, qty: n }]);
        };
      });
  }

  // ⚠ LES QUANTITES SAISIES, PAS CELLES EN BASE — comme le bouton de l ecran du
  // site : on imprime pour la marchandise qu on vient de recevoir et d entrer,
  // pas pour celle d avant.
  function toutesLesEtiquettes(){
    var items = [];
    var total = 0;
    VARS.forEach(function(v){
      var q = parseInt(v.qte, 10) || 0;
      if (v.sku && q > 0) { items.push({ sku: v.sku, name: PROD.nom, size: v.taille, color: v.couleur, qty: q }); total += q; }
    });
    if (!items.length) { dire('Aucune variante en stock à imprimer.', 'att'); return; }
    voile('<h3>🏷 Imprimer les étiquettes</h3>'
      + '<p>Imprimer <strong>' + total + '</strong> étiquette' + (total > 1 ? 's' : '')
      + ' pour ' + items.length + ' variante' + (items.length > 1 ? 's' : '') + ' en stock ?</p>'
      + '<p style="color:#8fa1b8;font-size:.8rem">Quantités telles qu’elles sont saisies à l’écran, '
      + 'même si l’inventaire n’est pas encore enregistré.</p>'
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="prim" id="v-oui">Imprimer</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){ fermer(); imprimer(items); };
      });
  }

  function imprimer(items){
    dire('Impression…');
    appeler('stock:etiquettes', [items]).then(function(z){
      dire(z.ok ? (z.envoyees + ' étiquette(s) envoyée(s) à « ' + z.imprimante + ' ».')
                : expliquer(z), z.ok ? 'bon' : 'err');
    });
  }

  // ══ VOILE ═════════════════════════════════════════════════════════════════
  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    if (apres) apres(fermer);
    return fermer;
  }

  function quitter(){ rendreVerrou(); P.fermer(); }

  // Echap ferme, comme partout ailleurs — mais pas quand un voile est ouvert :
  // il fermerait la fenetre entiere au lieu de la question posee.
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && !document.querySelector('.voile')) { ev.preventDefault(); quitter(); }
  });
  window.addEventListener('beforeunload', function(){ rendreVerrou(); });

  var DEPART = ${depart};
  charger();
  if (DEPART) ouvrirProduit(DEPART);
})();
</script>
</body></html>`;
}

module.exports = { pageInventaire };
