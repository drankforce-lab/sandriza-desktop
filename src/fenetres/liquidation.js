'use strict';

/*
 * FENÊTRE « LIQUIDATION / VENTE FINALE » — NATIVE (3.12.0, #30)
 * =============================================================================
 * Le dernier lot des écrans qui n'existaient qu'en version web. Deux onglets —
 * LIQUIDATION (prix réduits pour écouler le stock) et VENTE FINALE — plus les
 * deux façons d'y mettre des produits : en LOT (on choisit les produits un par
 * un) ou PAR CATÉGORIE (tous ceux d'une catégorie d'un coup).
 *
 * ⚠⚠ LE RÉGIME N'EST PAS UN CHAMP, C'EST UNE COMBINAISON de `finalSale` et
 * `liquidation`. La fenêtre ne le calcule JAMAIS elle-même : les six cœurs
 * d'admin.js le font, et ils servent aussi l'écran du site. C'est ce qui
 * empêche les deux de compter différemment.
 *
 * ⚠ CE QUE L'ON CHANGE ICI EST VU PAR LE CLIENT : la fiche produit de la
 * boutique annonce « Offre valide jusqu'au … » (période fixe) ou « Jusqu'à
 * épuisement de l'inventaire », et le régime interdit le retour. Ce n'est donc
 * pas un classement interne — d'où le retrait ARMÉ en deux clics, et le résumé
 * avant d'appliquer un lot.
 *
 * ⚠ AUCUNE IMAGE NE PASSE PAR LE PONT (voir _produitLigne) : une liste n'a pas
 * à faire transiter des photos. La pastille de couleur est celle de la
 * catégorie, elle vient de l'inventaire.
 *
 * ⚠ LES DATES SONT DES `input type=date`, pas un calendrier maison. L'écran du
 * site en avait bâti un (popover, navigation par mois, plage en deux clics)
 * parce qu'il vivait dans une page à lui ; ici le système en fournit un, déjà
 * traduit et déjà accessible. Le refaire n'aurait ajouté que des défauts.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

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
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:#8fa1b8}
input,button,select{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
button{cursor:pointer;-webkit-user-select:none;user-select:none}
input:focus,button:focus,select:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
.rech{flex:1 1 16rem;min-width:11rem}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.5rem .65rem;border-left-width:3px;border-left-style:solid}
/* ⚠ « vfin », PAS « fin » : la classe « .fin » existe déjà plus bas pour aligner à
   droite la dernière cellule d'un tableau, et un modificateur qui porte le même
   nom hérite de son alignement. Vu en capture : la tuile « En vente finale » avait tout
   son contenu collé à droite, sans rien dans son propre bloc pour l'expliquer.
   Deux noms de classe identiques pour deux intentions, c'est le piège CSS du
   projet — et il ne se voit qu'à l'écran. */
.tuile.liq{border-left-color:#d97706}
.tuile.vfin{border-left-color:#dc2626}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .sub{font-size:.66rem;color:#8fa1b8;margin-top:.1rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:#8fa1b8;font-weight:700;display:flex;align-items:center;gap:.5rem}
.carte h2 .pt{width:10px;height:10px;border-radius:50%;flex:0 0 auto}
.carte h2 .cpt{margin-left:auto;font-weight:800;font-size:.8rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.32rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody tr:hover td{background:rgba(255,255,255,.04)}
.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.fin{white-space:nowrap;text-align:right}
.pastille{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:.4rem;
  vertical-align:middle}
.dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.liq{background:rgba(217,119,6,.18);color:#fbbf24}
.pill.vfin{background:rgba(220,38,38,.18);color:#fca5a5}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pager{display:flex;align-items:center;gap:.6rem;justify-content:flex-end;margin-top:.5rem;
  font-size:.75rem;color:#8fa1b8;flex-wrap:wrap}
.pager .gauche{margin-right:auto;display:flex;align-items:center;gap:.35rem}
.pager select{padding:.1rem .3rem;font-size:.74rem}
.vide{padding:1.3rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.avis{background:rgba(148,163,184,.1);border:1px solid rgba(148,163,184,.22);
  border-radius:10px;padding:.45rem .6rem;font-size:.78rem;color:#cbd8e6}
/* ── Les surcouches ─────────────────────────────────────────────────────────
   Structure .voile > .boite : c'est celle que l'installateur du socle reconnait,
   donc le bouton de plein ecran s y pose tout seul. */
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:52rem;width:100%;max-height:88vh;overflow:auto;padding:.9rem 1rem}
.boite.etroite{max-width:34rem}
.boite h3{margin:0 0 .6rem;font:700 .98rem/1.3 Georgia,serif;display:flex;
  align-items:center;gap:.5rem;flex-wrap:wrap}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.85rem;flex-wrap:wrap}
.pied-boite .gauche{margin-right:auto}
.deux{display:flex;gap:.7rem;align-items:flex-start;flex-wrap:wrap}
.deux>.col{flex:1 1 20rem;min-width:0}
.bloc{border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:.5rem .6rem}
.bloc .titre{font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;
  color:#8fa1b8;font-weight:700;margin:0 0 .4rem}
.liste{max-height:15rem;overflow-y:auto;display:flex;flex-direction:column;gap:.25rem}
.liste::-webkit-scrollbar{width:8px}
.liste::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
label.case{display:flex;align-items:center;gap:.45rem;font-size:.82rem;cursor:pointer;
  border:1px solid rgba(255,255,255,.12);border-radius:9px;padding:.28rem .5rem;
  background:rgba(255,255,255,.03);-webkit-user-select:none;user-select:none}
label.case:hover{background:rgba(255,255,255,.07)}
label.case.pris{border-color:#c9a97e;background:rgba(201,169,126,.13)}
label.case input{width:15px;height:15px;accent-color:#c9a97e;margin:0;flex:0 0 auto}
label.case .nom{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;font-weight:500}
label.case .app{font-size:.71rem;color:#8fa1b8;white-space:nowrap}
label.mode{display:flex;align-items:center;gap:.5rem;font-size:.84rem;cursor:pointer;
  border:2px solid rgba(255,255,255,.12);border-radius:9px;padding:.4rem .55rem;
  font-weight:600;-webkit-user-select:none;user-select:none}
label.mode.pris{border-color:#c9a97e;background:rgba(201,169,126,.1)}
label.mode input{margin:0;accent-color:#c9a97e}
label.duree{display:flex;align-items:center;gap:.45rem;font-size:.82rem;cursor:pointer;
  -webkit-user-select:none;user-select:none}
label.duree input{margin:0;accent-color:#c9a97e}
.dates{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.4rem;padding:.5rem .6rem;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:9px}
.dates label{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;
  color:#8fa1b8;margin:0 0 .18rem}
.dates input{width:11rem}
.choisi{display:flex;align-items:center;gap:.4rem;padding:.24rem .45rem;border-radius:7px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);font-size:.79rem}
.choisi .nom{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.resume{padding:.55rem .7rem;border-radius:9px;border-left:3px solid;margin:0 0 .6rem}
.resume.liq{background:rgba(217,119,6,.12);border-left-color:#d97706}
.resume.vfin{background:rgba(220,38,38,.12);border-left-color:#dc2626}
.resume .quoi{font-weight:700;font-size:.9rem}
.resume .quand{font-size:.78rem;color:#cbd8e6;margin-top:.12rem}
.gare{padding:.5rem .65rem;border-radius:9px;background:rgba(239,68,68,.1);
  border:1px solid rgba(239,68,68,.28);font-size:.79rem;color:#fca5a5;margin-top:.6rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre « Liquidation / Vente finale ».
 * `ouverture` : '' ou 'liq' (onglet Liquidation) · 'final' (Vente finale) ·
 * 'lot' (surcouche d'ajout en lot) · 'lot-resume' (la MÊME, à son étape 2) ·
 * 'categories' (surcouche par catégorie).
 * ⚠ CHAQUE SURCOUCHE — ET CHAQUE ÉTAPE — A SON IDENTIFIANT D'OUVERTURE : le banc
 * ne clique pas. Sans eux, l'ajout en lot, son écran de résumé et l'ajout par
 * catégorie lui resteraient invisibles — c'est exactement ce qui avait laissé
 * passer les six trous de l'audit #32. Le résumé est le plus important des
 * trois : c'est le dernier écran avant une écriture qui touche tout un lot.
 */
function pageLiquidation(ouverture) {
  const ouv = String(ouverture || '');
  const depart = (ouv === 'final') ? 'final' : 'liq';
  const ouvreLot = (ouv === 'lot');
  const ouvreResume = (ouv === 'lot-resume');
  const ouvreCat = (ouv === 'categories');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Liquidation / Vente finale — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.liquidation}</span><h1>Liquidation / Vente finale</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var sous  = document.getElementById('sous');

  var D = null;
  var ONGLET = '${depart}';   // liq | final
  var Q = '';                 // la recherche, qui porte sur LES DEUX regimes
  var PLIQ = 0, PFIN = 0, TAILLE = 20;
  var ARME = '';              // id du produit dont le retrait est arme
  var LOT = null;             // surcouche << ajout en lot >>
  var CAT = null;             // surcouche << par categorie >>

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function argent(n){ return (Math.round((Number(n)||0)*100)/100).toFixed(2) + ' $'; }

  var MOTIFS = {
    session:        'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:          'Votre rôle ne donne pas accès à cette opération.',
    indisponible:   'L’administration n’est pas encore chargée dans la fenêtre principale.',
    introuvable:    'Ce produit n’existe plus.',
    aucun_produit:  'Aucun produit choisi.',
    aucune_categorie:'Aucune catégorie choisie.',
    dates_requises: 'Indiquez la date de début et celle de fin.',
    dates_inversees:'La date de fin doit venir après celle de début.',
    echec:          'L’opération a échoué.'
  };
  function expliquer(r){
    if (!r) return 'Aucune réponse de la fenêtre principale.';
    return MOTIFS[r.motif] || (r.detail ? String(r.detail) : MOTIFS.echec);
  }

  function appeler(op, arg){
    if (!P || !P.appeler) return Promise.resolve({ ok:false, motif:'indisponible' });
    return P.appeler(op, arg).catch(function(){ return { ok:false, motif:'echec' }; });
  }

  /* ══ LECTURE ═══════════════════════════════════════════════════════════════ */
  function charger(){
    return appeler('liquidation:donnees', { q:Q, pageLiq:PLIQ, pageFinale:PFIN, taille:TAILLE })
      .then(function(r){
        if (!r || !r.ok) { vide('Liquidation indisponible', expliquer(r)); return false; }
        D = r; PLIQ = r.liq.page; PFIN = r.finale.page;
        return true;
      });
  }
  function vide(titre, detail){
    D = null;
    corps.innerHTML = '<div class="vide"><div style="font:700 1.3rem/1 Georgia,serif;color:#e8dcc6">'
      + esc(titre) + '</div><div style="margin-top:.35rem">' + esc(detail || '') + '</div></div>';
  }

  /* ══ L ECRAN ═══════════════════════════════════════════════════════════════ */
  function ligneProduit(l){
    var arme = (ARME === l.id);
    var geste = '';
    if (D.peut.edition) {
      geste = arme
        ? '<button class="geste danger" data-confirmer="' + esc(l.id) + '">✓ Confirmer le retrait</button>'
        : '<button class="geste" data-retirer="' + esc(l.id) + '" title="Ramener au régime normal">✕ Retirer</button>';
    }
    var quand = l.au
      ? '<span class="pill neutre" title="La boutique annonce cette date au client">jusqu’au ' + esc(l.au) + '</span>'
      : '<span class="dt">jusqu’à épuisement</span>';
    return '<tr>'
      + '<td><span class="pastille" style="background:' + esc(l.couleur) + '"></span>'
      +   '<strong>' + esc(l.nom) + '</strong>'
      +   (l.sku ? ' <span class="dt">· ' + esc(l.sku) + '</span>' : '')
      +   '<div class="dt">' + esc(l.categorie) + '</div></td>'
      + '<td>' + quand + '</td>'
      + '<td class="num">' + l.stock + '</td>'
      + '<td class="num">' + argent(l.prix) + '</td>'
      + '<td class="fin">' + geste + '</td>'
      + '</tr>';
  }

  function pager(g, quel){
    var opts = [20,50,100,200].map(function(n){
      return '<option value="' + n + '"' + (TAILLE === n ? ' selected' : '') + '>' + n + '</option>'; }).join('');
    var nav = '';
    if (g.pages > 1) {
      nav = '<button class="mini" data-page="' + quel + ':' + (g.page - 1) + '"'
        + (g.page === 0 ? ' disabled' : '') + '>← Précédent</button>'
        + '<span>Page ' + (g.page + 1) + ' / ' + g.pages + '</span>'
        + '<button class="mini" data-page="' + quel + ':' + (g.page + 1) + '"'
        + (g.page >= g.pages - 1 ? ' disabled' : '') + '>Suivant →</button>';
    }
    return '<div class="pager"><span class="gauche">Afficher '
      + '<select id="taille">' + opts + '</select> par page · ' + g.total + ' produit'
      + (g.total === 1 ? '' : 's') + '</span>' + nav + '</div>';
  }

  function carte(quel, titre, sousTitre, g){
    var accent = quel === 'liq' ? '#d97706' : '#dc2626';
    var corpsCarte = g.lignes.length
      ? '<table><thead><tr><th>Produit</th><th>Durée</th><th class="num">Stock</th>'
        + '<th class="num">Prix</th><th></th></tr></thead><tbody>'
        + g.lignes.map(ligneProduit).join('') + '</tbody></table>' + pager(g, quel)
      : '<div class="vide">' + esc(sousTitre.vide) + '</div>';
    return '<div class="carte"><h2><span class="pt" style="background:' + accent + '"></span>'
      + esc(titre) + '<span class="cpt" style="color:' + accent + '">' + g.total + '</span></h2>'
      + '<div class="dt" style="margin:-.25rem 0 .5rem">' + esc(sousTitre.texte) + '</div>'
      + corpsCarte + '</div>';
  }

  var TEXTES = {
    liq:   { texte:'Prix réduits pour écouler le stock — aucun retour possible.',
             vide:'Aucun produit en liquidation.' },
    final: { texte:'Aucun retour ni échange accepté sur ces produits.',
             vide:'Aucun produit en vente finale.' }
  };

  function dessiner(){
    if (!D) return;
    var c = D.compteurs;
    sous.textContent = (c.liquidation + c.finale) + ' produit'
      + ((c.liquidation + c.finale) === 1 ? '' : 's') + ' hors régime normal';

    var h = '<div class="tuiles">'
      + '<div class="tuile liq"><div class="lbl"><span class="ic">🟡</span> En liquidation</div><div class="val">'
      +   c.liquidation + '</div><div class="sub">produit' + (c.liquidation === 1 ? '' : 's') + '</div></div>'
      + '<div class="tuile vfin"><div class="lbl"><span class="ic">🔴</span> En vente finale</div><div class="val">'
      +   c.finale + '</div><div class="sub">produit' + (c.finale === 1 ? '' : 's') + '</div></div>'
      + '</div>';

    h += '<div class="barreoutils">'
      + '<input class="rech" id="rech" type="search" placeholder="Rechercher un produit (nom, SKU, catégorie) — les deux régimes…" value="'
      +   esc(Q) + '">';
    if (D.peut.ajout) {
      h += '<button class="geste" data-ouvrir="lot">＋ Ajouter en lot</button>'
        +  '<button class="geste" data-ouvrir="cat">＋ Par catégorie</button>';
    }
    h += '</div>';

    if (!D.peut.ajout && !D.peut.edition) {
      h += '<div class="avis">Lecture seule : votre rôle ne permet ni de mettre des produits '
        +  'en liquidation ou en vente finale, ni de les en retirer.</div>';
    }

    if (Q) {
      /* ⚠ LA RECHERCHE MONTRE LES DEUX REGIMES, en groupes distincts : on cherche
         un produit sans savoir dans lequel il a ete mis. */
      h += '<div class="dt">Résultats pour « <strong>' + esc(Q) + '</strong> » — '
        + (D.liq.total + D.finale.total) + ' produit'
        + ((D.liq.total + D.finale.total) === 1 ? '' : 's') + '.</div>'
        + carte('liq', 'Liquidation', { texte:TEXTES.liq.texte, vide:'Aucun résultat en liquidation.' }, D.liq)
        + carte('final', 'Vente finale', { texte:TEXTES.final.texte, vide:'Aucun résultat en vente finale.' }, D.finale);
    } else {
      h += '<div class="barreoutils">'
        + '<button class="geste' + (ONGLET === 'liq' ? ' actif' : '') + '" data-onglet="liq"><span class="ic">🟡</span> Liquidation'
        +   '<span class="n">' + c.liquidation + '</span></button>'
        + '<button class="geste' + (ONGLET === 'final' ? ' actif' : '') + '" data-onglet="final"><span class="ic">🔴</span> Vente finale'
        +   '<span class="n">' + c.finale + '</span></button>'
        + '</div>';
      h += (ONGLET === 'liq')
        ? carte('liq', 'Liquidation', TEXTES.liq, D.liq)
        : carte('final', 'Vente finale', TEXTES.final, D.finale);
    }

    /* ⚠ UNE SEULE ECRITURE, surcouches comprises : les ajouter apres coup
       demandait insertAdjacentHTML, que le faux document du banc n a pas — la
       fenetre passait le controle de syntaxe et mourait a l execution. Et deux
       ecritures pour un meme dessin, c est deux occasions de divergence. */
    if (LOT) h += vueLot();
    if (CAT) h += vueCat();
    corps.innerHTML = h;
    brancherRecherche();
  }

  /* ⚠ ON NE REDESSINE PAS PENDANT LA SAISIE : le champ garderait le focus mais
     perdrait le curseur. On le remet ou il etait, comme le fait l ecran du site. */
  var TR = null;
  function brancherRecherche(){
    var r = document.getElementById('rech');
    if (!r) return;
    r.oninput = function(){
      var v = r.value, pos = r.selectionStart;
      clearTimeout(TR);
      TR = setTimeout(function(){
        Q = v; PLIQ = 0; PFIN = 0; ARME = '';
        charger().then(function(ok){
          if (!ok) return;
          dessiner();
          var n = document.getElementById('rech');
          if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch(e){} }
        });
      }, 250);
    };
    var t = document.getElementById('taille');
    if (t) t.onchange = function(){
      TAILLE = parseInt(t.value, 10) || 20; PLIQ = 0; PFIN = 0;
      charger().then(function(ok){ if (ok) dessiner(); });
    };
  }

  /* ══ RETIRER (arme en deux clics) ══════════════════════════════════════════ */
  function retirer(id){
    dire('Retrait…');
    appeler('liquidation:retirer', id).then(function(r){
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
      ARME = '';
      return charger().then(function(ok){
        if (ok) dessiner();
        dire('Retiré de la ' + (r.etait === 'liquidation' ? 'liquidation' : 'vente finale') + '.', 'bon');
      });
    });
  }

  /* ══ SURCOUCHE : AJOUT EN LOT ══════════════════════════════════════════════
     Deux etapes. La premiere choisit les produits et le regime ; la seconde
     RESUME avant d ecrire — ce que l on applique ici change ce que la boutique
     annonce au client, et sa politique de retour. */
  // ⚠ Elle REND sa promesse : l ouverture directe sur le resume (identifiant
  // << lot-resume >>) doit attendre que le choix soit charge avant de sauter a
  // l etape 2. Sans cela le banc ne verrait jamais l ecran de resume.
  function ouvrirLot(){
    LOT = { q:'', cats:[], page:0, taille:10, choix:{}, ordre:[], mode:'final',
            duree:'depletion', du:'', au:'', etape:1, data:null };
    return chargerLot();
  }
  function chargerLot(){
    return appeler('liquidation:choix', { q:LOT.q, cats:LOT.cats, page:LOT.page, taille:LOT.taille })
      .then(function(r){
        if (!r || !r.ok) { LOT = null; dire('⚠ ' + expliquer(r), 'err'); dessiner(); return false; }
        LOT.data = r; LOT.page = r.page;
        dessiner();
        return true;
      });
  }
  function nbChoisis(){ return LOT ? LOT.ordre.length : 0; }

  function vueLot(){
    if (!LOT.data) return '';
    if (LOT.etape === 2) return vueLotResume();
    var d = LOT.data;
    var pilCats = d.categories.map(function(c){
      var pris = LOT.cats.indexOf(c.cle) >= 0;
      return '<button class="mini' + (pris ? ' actif' : '') + '" data-lotcat="' + esc(c.cle) + '">'
        + '<span class="pastille" style="background:' + esc(c.couleur) + '"></span>' + esc(c.nom) + '</button>';
    }).join('');
    var lignes = d.lignes.length ? d.lignes.map(function(l){
      var pris = !!LOT.choix[l.id];
      var deja = l.regime === 'liq_no' ? '<span class="pill liq"><span class="ic">🟡</span> déjà</span>'
        : l.regime === 'final' ? '<span class="pill vfin"><span class="ic">🔴</span> déjà</span>' : '';
      return '<label class="case' + (pris ? ' pris' : '') + '">'
        + '<input type="checkbox" data-lotprod="' + esc(l.id) + '"' + (pris ? ' checked' : '') + '>'
        + '<span class="pastille" style="background:' + esc(l.couleur) + '"></span>'
        + '<span class="nom">' + esc(l.nom) + '</span>'
        + '<span class="app">' + esc(l.categorie) + (l.sku ? ' · ' + esc(l.sku) : '') + ' ' + deja + '</span>'
        + '</label>';
    }).join('') : '<div class="vide">Aucun produit trouvé.</div>';
    var nav = d.pages > 1
      ? '<div class="pager"><span class="gauche">' + d.total + ' produit' + (d.total === 1 ? '' : 's') + '</span>'
        + '<button class="mini" data-lotpage="' + (d.page - 1) + '"' + (d.page === 0 ? ' disabled' : '') + '>←</button>'
        + '<span>Page ' + (d.page + 1) + ' / ' + d.pages + '</span>'
        + '<button class="mini" data-lotpage="' + (d.page + 1) + '"'
        + (d.page >= d.pages - 1 ? ' disabled' : '') + '>→</button></div>'
      : '<div class="pager"><span class="gauche">' + d.total + ' produit' + (d.total === 1 ? '' : 's') + '</span></div>';

    var mode = function(v, txt){
      return '<label class="mode' + (LOT.mode === v ? ' pris' : '') + '">'
        + '<input type="radio" name="lot-mode" data-lotmode="' + v + '"'
        + (LOT.mode === v ? ' checked' : '') + '> ' + txt + '</label>';
    };
    var choisis = LOT.ordre.length ? LOT.ordre.map(function(id){
      var it = LOT.choix[id];
      return '<div class="choisi"><span class="nom">' + esc(it.nom) + '</span>'
        + '<button class="mini" data-lototer="' + esc(id) + '" title="Enlever de la sélection">✕</button></div>';
    }).join('') : '<div class="vide" style="padding:.8rem">Cochez des produits à gauche.</div>';

    /* ⚠ CHAQUE MORCEAU CONDITIONNEL DANS SA VARIABLE, jamais un ternaire a cheval
       sur plusieurs lignes de concatenation. Deux fautes s y sont glissees en
       ecrivant cette fenetre — un << + + >> qui rendait NaN, et un << + ? >> qui
       est une faute de syntaxe. Et comme tout ce script vit dans un litteral de
       gabarit, un controle de syntaxe du FICHIER ne voit NI l un NI l autre :
       la fenetre serait restee blanche, sans un mot. */
    var btnRien = LOT.ordre.length ? '<button class="mini" data-lotrien="1">Tout décocher</button>' : '';
    var btnCatsRien = LOT.cats.length ? '<button class="mini" data-lotcatrien="1">Toutes</button>' : '';
    var barreCats = pilCats
      ? '<div class="barreoutils" style="margin-bottom:.45rem">' + pilCats + btnCatsRien + '</div>'
      : '';
    var chkDep = (LOT.duree !== 'period') ? ' checked' : '';
    var chkPer = (LOT.duree === 'period') ? ' checked' : '';
    var blocDates = (LOT.duree === 'period')
      ? '<div class="dates">'
        + '<div><label>Du</label><input type="date" id="lot-du" value="' + esc(LOT.du) + '"></div>'
        + '<div><label>Au</label><input type="date" id="lot-au" value="' + esc(LOT.au) + '"></div>'
        + '</div>'
      : '';
    return '<div class="voile" id="lot-voile"><div class="boite">'
      + '<h3>＋ Mettre des produits en régime<span class="dt" style="margin-left:auto">étape 1 sur 2</span></h3>'
      + '<div class="deux">'
      +   '<div class="col"><div class="bloc"><div class="titre">Les produits</div>'
      +     '<div class="barreoutils" style="margin-bottom:.45rem">'
      +       '<input class="rech" id="lot-rech" type="search" placeholder="Nom, SKU…" value="' + esc(LOT.q) + '">'
      +       '<button class="mini" data-lottout="1">Tout cocher <span class="n">' + d.total + '</span></button>'
      +       btnRien
      +     '</div>'
      +     barreCats
      +     '<div class="liste">' + lignes + '</div>' + nav
      +   '</div></div>'
      +   '<div class="col"><div class="bloc"><div class="titre">Le régime</div>'
      +     '<div style="display:flex;flex-direction:column;gap:.35rem">'
      +       mode('liq_no', '🟡 Liquidation') + mode('final', '🔴 Vente finale')
      +     '</div>'
      +     '<div class="titre" style="margin:.7rem 0 .4rem">Durée</div>'
      +     '<label class="duree"><input type="radio" name="lot-duree" data-lotduree="depletion"'
      +       chkDep + '> Jusqu’à épuisement de l’inventaire</label>'
      +     '<label class="duree" style="margin-top:.25rem"><input type="radio" name="lot-duree" data-lotduree="period"'
      +       chkPer + '> Période fixe</label>'
      +     blocDates
      +     '<div class="titre" style="margin:.7rem 0 .4rem">Choisis <span class="n">' + LOT.ordre.length + '</span></div>'
      +     '<div class="liste" style="max-height:11rem">' + choisis + '</div>'
      +   '</div></div>'
      + '</div>'
      + '<div class="pied-boite">'
      +   '<button class="gauche" data-lotfermer="1">Annuler</button>'
      +   '<button class="prim" data-lotsuite="1"' + (LOT.ordre.length ? '' : ' disabled') + '>Continuer →</button>'
      + '</div>'
      + '</div></div>';
  }

  function vueLotResume(){
    var estLiq = LOT.mode === 'liq_no';
    var quand = LOT.duree === 'period'
      ? 'Du ' + esc(LOT.du) + ' au ' + esc(LOT.au)
      : 'Jusqu’à épuisement de l’inventaire';
    var liste = LOT.ordre.map(function(id){
      return '<div class="choisi"><span class="nom">' + esc(LOT.choix[id].nom) + '</span></div>'; }).join('');
    return '<div class="voile" id="lot-voile"><div class="boite etroite">'
      + '<h3>Résumé avant d’appliquer<span class="dt" style="margin-left:auto">étape 2 sur 2</span></h3>'
      + '<div class="resume ' + (estLiq ? 'liq' : 'vfin') + '">'
      +   '<div class="quoi">' + (estLiq ? '<span class="ic">🟡</span> Liquidation — aucun retour' : '<span class="ic">🔴</span> Vente finale — aucun retour') + '</div>'
      +   '<div class="quand">⏳ ' + quand + '</div></div>'
      + '<div class="titre" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8;font-weight:700;margin:0 0 .4rem">'
      +   LOT.ordre.length + ' produit' + (LOT.ordre.length === 1 ? '' : 's') + ' qui changent de régime</div>'
      + '<div class="liste">' + liste + '</div>'
      + '<div class="gare">⚠ Ces produits n’accepteront plus de retour, et la boutique l’annoncera sur '
      +   'leur fiche. Vous pourrez les retirer un par un depuis cet écran.</div>'
      + '<div class="pied-boite">'
      +   '<button class="gauche" data-lotretour="1">← Modifier la sélection</button>'
      +   '<button data-lotfermer="1">Annuler</button>'
      +   '<button class="prim" data-lotappliquer="1">✅ Appliquer</button>'
      + '</div>'
      + '</div></div>';
  }

  function appliquerLot(){
    dire('Application…');
    appeler('liquidation:lot', { ids:LOT.ordre, mode:LOT.mode, duree:LOT.duree, du:LOT.du, au:LOT.au })
      .then(function(r){
        if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
        var n = r.n;
        LOT = null; PLIQ = 0; PFIN = 0;
        ONGLET = (r.mode === 'liq_no') ? 'liq' : 'final';
        return charger().then(function(ok){
          if (ok) dessiner();
          dire(n + ' produit' + (n === 1 ? '' : 's') + ' en '
            + (r.mode === 'liq_no' ? 'liquidation' : 'vente finale') + '.', 'bon');
        });
      });
  }

  /* ══ SURCOUCHE : PAR CATEGORIE ═════════════════════════════════════════════ */
  function ouvrirCat(){
    CAT = { q:'', regime:'', mode:(ONGLET === 'final' ? 'final' : 'liq_no'), pris:{}, data:null };
    chargerCat();
  }
  function chargerCat(){
    return appeler('liquidation:cats', { q:CAT.q, regime:CAT.regime }).then(function(r){
      if (!r || !r.ok) { CAT = null; dire('⚠ ' + expliquer(r), 'err'); dessiner(); return false; }
      CAT.data = r; dessiner(); return true;
    });
  }
  function nbCatPris(){ return CAT ? Object.keys(CAT.pris).length : 0; }

  function vueCat(){
    if (!CAT.data) return '';
    var cs = CAT.data.categories;
    var mode = function(v, txt){
      return '<label class="mode' + (CAT.mode === v ? ' pris' : '') + '">'
        + '<input type="radio" name="cat-mode" data-catmode="' + v + '"'
        + (CAT.mode === v ? ' checked' : '') + '> ' + txt + '</label>';
    };
    var fil = function(v, txt){
      return '<button class="mini' + (CAT.regime === v ? ' actif' : '') + '" data-catfil="' + v + '">'
        + txt + '</button>';
    };
    var lignes = cs.length ? cs.map(function(c){
      var pris = !!CAT.pris[c.cle];
      var deja = [];
      if (c.liq) deja.push(c.liq + ' en liquidation');
      if (c.finale) deja.push(c.finale + ' en vente finale');
      return '<label class="case' + (pris ? ' pris' : '') + '">'
        + '<input type="checkbox" data-catcle="' + esc(c.cle) + '"' + (pris ? ' checked' : '') + '>'
        + '<span class="pastille" style="background:' + esc(c.couleur) + '"></span>'
        + '<span class="nom">' + esc(c.nom) + '</span>'
        + '<span class="app">' + c.produits + ' produit' + (c.produits === 1 ? '' : 's')
        + (deja.length ? ' · ' + esc(deja.join(' · ')) : '') + '</span>'
        + '</label>';
    }).join('') : '<div class="vide">Aucune catégorie trouvée.</div>';
    var n = nbCatPris();
    return '<div class="voile" id="cat-voile"><div class="boite etroite">'
      + '<h3>＋ Par catégorie</h3>'
      + '<div class="dt" style="margin:-.35rem 0 .55rem">Choisissez le régime, puis les catégories à y placer. '
      +   'Les produits concernés sont ceux qui s’y trouvent <strong>maintenant</strong>.</div>'
      + '<div style="display:flex;gap:.5rem;margin-bottom:.6rem;flex-wrap:wrap">'
      +   mode('liq_no', '<span class="ic">🟡</span> Liquidation') + mode('final', '<span class="ic">🔴</span> Vente finale') + '</div>'
      + '<div class="barreoutils" style="margin-bottom:.5rem">'
      +   '<input class="rech" id="cat-rech" type="search" placeholder="Rechercher une catégorie…" value="' + esc(CAT.q) + '">'
      +   fil('', 'Toutes') + fil('liq', '<span class="ic">🟡</span> déjà') + fil('final', '<span class="ic">🔴</span> déjà') + '</div>'
      + '<div class="liste">' + lignes + '</div>'
      + '<div class="pied-boite">'
      +   '<button class="gauche" data-catfermer="1">Annuler</button>'
      +   '<button class="danger" data-catappliquer="normal"' + (n ? '' : ' disabled') + '>Retirer du régime</button>'
      +   '<button class="prim" data-catappliquer="mode"' + (n ? '' : ' disabled') + '>Appliquer'
      +     '<span class="n">' + n + '</span></button>'
      + '</div>'
      + '</div></div>';
  }

  function appliquerCat(quoi){
    var cles = Object.keys(CAT.pris);
    var mode = (quoi === 'normal') ? 'normal' : CAT.mode;
    dire('Application…');
    appeler('liquidation:parCategorie', { cats:cles, mode:mode }).then(function(r){
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
      var n = r.n, nc = r.cats;
      CAT = null; PLIQ = 0; PFIN = 0;
      if (mode !== 'normal') ONGLET = (mode === 'liq_no') ? 'liq' : 'final';
      return charger().then(function(ok){
        if (ok) dessiner();
        var quoiTxt = mode === 'normal' ? 'régime retiré'
          : mode === 'liq_no' ? 'liquidation' : 'vente finale';
        dire(n + ' produit' + (n === 1 ? '' : 's') + ' dans ' + nc + ' catégorie'
          + (nc === 1 ? '' : 's') + ' — ' + quoiTxt + '.', 'bon');
      });
    });
  }

  /* ══ LES GESTES ════════════════════════════════════════════════════════════
     Un seul ecouteur pour toute la fenetre : les surcouches se redessinent en
     entier, donc brancher chaque bouton un par un les perdrait a chaque passe. */
  document.addEventListener('click', function(e){
    var t = e.target;
    if (!t || !t.closest) return;
    var b = t.closest('button');

    // ── Surcouche << par categorie >>
    if (CAT) {
      if (b && b.hasAttribute('data-catfermer')) { CAT = null; dessiner(); return; }
      if (b && b.hasAttribute('data-catappliquer')) { appliquerCat(b.getAttribute('data-catappliquer')); return; }
      if (b && b.hasAttribute('data-catfil')) { CAT.regime = b.getAttribute('data-catfil'); chargerCat(); return; }
      return;
    }
    // ── Surcouche << ajout en lot >>
    if (LOT) {
      if (b && b.hasAttribute('data-lotfermer')) { LOT = null; dessiner(); return; }
      if (b && b.hasAttribute('data-lotretour')) { LOT.etape = 1; dessiner(); return; }
      if (b && b.hasAttribute('data-lotappliquer')) { appliquerLot(); return; }
      if (b && b.hasAttribute('data-lotsuite')) {
        if (!LOT.ordre.length) { dire('⚠ ' + MOTIFS.aucun_produit, 'err'); return; }
        if (LOT.duree === 'period') {
          var du = document.getElementById('lot-du'), au = document.getElementById('lot-au');
          LOT.du = du ? du.value : ''; LOT.au = au ? au.value : '';
          if (!LOT.du || !LOT.au) { dire('⚠ ' + MOTIFS.dates_requises, 'err'); return; }
          if (LOT.du > LOT.au) { dire('⚠ ' + MOTIFS.dates_inversees, 'err'); return; }
        }
        LOT.etape = 2; dessiner(); return;
      }
      if (b && b.hasAttribute('data-lotpage')) { LOT.page = Math.max(0, parseInt(b.getAttribute('data-lotpage'), 10) || 0); chargerLot(); return; }
      if (b && b.hasAttribute('data-lotcat')) {
        var k = b.getAttribute('data-lotcat'), i = LOT.cats.indexOf(k);
        if (i >= 0) LOT.cats.splice(i, 1); else LOT.cats.push(k);
        LOT.page = 0; chargerLot(); return;
      }
      if (b && b.hasAttribute('data-lotcatrien')) { LOT.cats = []; LOT.page = 0; chargerLot(); return; }
      if (b && b.hasAttribute('data-lototer')) { oterDuLot(b.getAttribute('data-lototer')); return; }
      if (b && b.hasAttribute('data-lotrien')) { LOT.choix = {}; LOT.ordre = []; dessiner(); return; }
      if (b && b.hasAttribute('data-lottout')) { toutCocherLot(); return; }
      return;
    }

    // ── L ecran
    if (b && b.hasAttribute('data-ouvrir')) {
      if (b.getAttribute('data-ouvrir') === 'lot') ouvrirLot(); else ouvrirCat();
      return;
    }
    if (b && b.hasAttribute('data-onglet')) {
      ONGLET = b.getAttribute('data-onglet'); ARME = ''; dessiner(); return;
    }
    if (b && b.hasAttribute('data-page')) {
      var p = b.getAttribute('data-page').split(':');
      if (p[0] === 'liq') PLIQ = Math.max(0, parseInt(p[1], 10) || 0);
      else PFIN = Math.max(0, parseInt(p[1], 10) || 0);
      charger().then(function(ok){ if (ok) dessiner(); });
      return;
    }
    if (b && b.hasAttribute('data-retirer')) { ARME = b.getAttribute('data-retirer'); dessiner(); return; }
    if (b && b.hasAttribute('data-confirmer')) { retirer(b.getAttribute('data-confirmer')); return; }
    // Un clic ailleurs desarme : un bouton reste arme, on finit par cliquer dessus
    // en croyant faire autre chose.
    if (ARME) { ARME = ''; dessiner(); }
  });

  /* Les cases et les boutons radio ecoutent « change », jamais « click » :
     cocher au clavier ne passe pas par un clic. */
  document.addEventListener('change', function(e){
    var t = e.target;
    if (!t || !t.getAttribute) return;
    if (LOT) {
      var pid = t.getAttribute('data-lotprod');
      if (pid) { basculerLot(pid, t.checked); return; }
      var m = t.getAttribute('data-lotmode');
      if (m) { LOT.mode = m; dessiner(); return; }
      var du = t.getAttribute('data-lotduree');
      if (du) { LOT.duree = du; dessiner(); return; }
    }
    if (CAT) {
      var cle = t.getAttribute('data-catcle');
      if (cle) { if (t.checked) CAT.pris[cle] = 1; else delete CAT.pris[cle]; dessiner(); return; }
      var cm = t.getAttribute('data-catmode');
      if (cm) { CAT.mode = cm; dessiner(); return; }
    }
  });

  /* ⚠ LE NOM EST GARDE AVEC L IDENTIFIANT. La selection survit au changement de
     page et de filtre : sans le nom sous la main, le resume de l etape 2 devrait
     redemander au site des produits qui ne sont plus dans la page affichee. */
  function basculerLot(id, coche){
    var l = (LOT.data.lignes || []).filter(function(x){ return x.id === id; })[0];
    if (coche) {
      if (!LOT.choix[id]) { LOT.choix[id] = { nom: l ? l.nom : id }; LOT.ordre.push(id); }
    } else { oterDuLot(id); return; }
    dessiner();
  }
  function oterDuLot(id){
    delete LOT.choix[id];
    var i = LOT.ordre.indexOf(id);
    if (i >= 0) LOT.ordre.splice(i, 1);
    dessiner();
  }
  /* ⚠ << TOUT COCHER >> PREND TOUS LES RESULTATS DU FILTRE, pas la page : le
     bouton annonce le total, et n en prendre que dix serait un mensonge. Le nom
     n est connu que pour la page affichee ; les autres portent leur identifiant
     jusqu au resume, ce qui est sans consequence (le site ecrit par identifiant). */
  function toutCocherLot(){
    var connus = {};
    (LOT.data.lignes || []).forEach(function(l){ connus[l.id] = l.nom; });
    (LOT.data.ids || []).forEach(function(id){
      if (!LOT.choix[id]) { LOT.choix[id] = { nom: connus[id] || ('produit ' + id) }; LOT.ordre.push(id); }
    });
    dessiner();
  }

  document.addEventListener('input', function(e){
    var t = e.target;
    if (!t || !t.id) return;
    if (LOT && t.id === 'lot-rech') {
      clearTimeout(TR);
      var v = t.value, pos = t.selectionStart;
      TR = setTimeout(function(){
        LOT.q = v; LOT.page = 0;
        chargerLot().then(function(){
          var n = document.getElementById('lot-rech');
          if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch(e){} }
        });
      }, 250);
      return;
    }
    if (CAT && t.id === 'cat-rech') {
      clearTimeout(TR);
      var cv = t.value, cpos = t.selectionStart;
      TR = setTimeout(function(){
        CAT.q = cv;
        chargerCat().then(function(){
          var cn = document.getElementById('cat-rech');
          if (cn) { cn.focus(); try { cn.setSelectionRange(cpos, cpos); } catch(e){} }
        });
      }, 250);
    }
    if (LOT && (t.id === 'lot-du' || t.id === 'lot-au')) {
      // On retient sans redessiner : redessiner fermerait le calendrier du systeme.
      if (t.id === 'lot-du') LOT.du = t.value; else LOT.au = t.value;
    }
  });

  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    if (LOT) { LOT = null; dessiner(); return; }
    if (CAT) { CAT = null; dessiner(); return; }
    if (ARME) { ARME = ''; dessiner(); return; }
    if (P && P.fermer) P.fermer();
  });

  /* ⚠ MODE ANCRE : la coquille le dit, et la fenetre n a qu a s y plier. */
  window.szModeAncre = function(actif){
    document.documentElement.classList.toggle('ancre', !!actif);
  };

  charger().then(function(ok){
    if (!ok) return;
    dessiner();
    ${ouvreLot ? 'if (D.peut.ajout) ouvrirLot();' : ''}
    ${ouvreResume ? 'if (D.peut.ajout) ouvrirLot().then(function(pret){ if (!pret) return; toutCocherLot(); LOT.duree = "period"; LOT.du = "2026-09-01"; LOT.au = "2026-09-30"; LOT.mode = "liq_no"; LOT.etape = 2; dessiner(); });' : ''}
    ${ouvreCat ? 'if (D.peut.ajout) ouvrirCat();' : ''}
  });
})();
</script></body></html>`;
}

module.exports = { pageLiquidation };
