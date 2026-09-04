'use strict';

/*
 * FENÊTRE « OFFRES ET ANNONCES » — NATIVE (1.68.0, palier 4)
 * =============================================================================
 * Deux onglets : OFFRES ET RABAIS (réductions automatiques — pourcentage,
 * montant fixe, « 2 pour 1 », paliers de quantité) et ANNONCES ET BADGES
 * (bandeaux de la boutique, badges de fiche produit), plus le réglage du
 * défilement du bandeau.
 *
 * ⚠ CES RÈGLES DÉCIDENT DE CE QUE LA CLIENTE PAIE. Rien n'est tranché ici : la
 * fenêtre porte la saisie, le site valide (Promo._offreEcrire /
 * _annonceEcrire) — quantités « 2 pour 1 » cohérentes, paliers valables,
 * portée non vide. La fenêtre se contente d'annoncer le verdict.
 *
 * ⚠ LE CATALOGUE VOYAGE ALLÉGÉ (id, nom, SKU, catégorie) : choisir un produit
 * ne demande pas sa fiche entière, et la liste peut compter des centaines
 * d'articles.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_JOUR, ICO } = require('./socle.js');

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
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input,select,button,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:190px}
input[type=checkbox]{width:auto;margin:0}
input[type=color]{padding:.1rem;height:2rem;cursor:pointer}
select,button{cursor:pointer}
input:focus,select:focus,button:focus,textarea:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:var(--tx2);font-weight:700}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.32rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody tr:hover td{background:var(--v04)}
.fin{white-space:nowrap;text-align:right}
.dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx2)}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:var(--f-carte2);border:1px solid var(--v14);border-radius:13px;
  max-width:46rem;width:100%;max-height:90vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .7rem;font:700 .98rem/1.3 Georgia,serif}
.boite h4{margin:.8rem 0 .35rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.07em;color:var(--tx-or);font-weight:700}
.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.55rem}
.ch{display:flex;flex-direction:column;gap:.22rem;min-width:0}
.ch.large{grid-column:1/-1}
.ch label{font-size:.72rem;color:var(--tx2)}
.ch input,.ch select,.ch textarea{width:100%}
.ch .req{color:var(--tx-or)}
.ch .aide{font-size:.68rem;color:var(--tx3)}
.cases{display:flex;flex-wrap:wrap;gap:.4rem 1rem;margin-top:.45rem}
.cases label{display:inline-flex;align-items:center;gap:.4rem;font-size:.83rem;cursor:pointer}
.choix{max-height:11rem;overflow:auto;border:1px solid var(--v10);
  border-radius:9px;padding:.4rem .5rem;margin-top:.3rem}
.choix .lg{display:flex;align-items:center;gap:.45rem;padding:.12rem 0;font-size:.82rem}
.choix .lg .sku{font-family:'Courier New',monospace;font-size:.72rem;color:var(--tx2);margin-left:auto}
.paliers .lg{display:flex;gap:.4rem;align-items:center;margin-bottom:.3rem}
.paliers .lg input{width:6rem}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.9rem;flex-wrap:wrap}
.vide{padding:1.3rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Offres et annonces ». */
function pagePromotions() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Offres et annonces — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.promotions}</span><h1>Offres et annonces</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}${JS_BROUILLON}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var ONGLET = 'offres';    // offres | annonces
  var D = null;             // le jeu de l onglet courant
  var Q = '';
  var FORM = null;          // objet en cours d edition (ou {} pour une creation)
  var SUPPR_ARME = '';
  var PALIERS = [];         // paliers en cours de saisie (offre << tiered >>)
  var CHOISIS = [];         // produits choisis (portee << produits >>)
  var QPROD = '';           // recherche dans le catalogue

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function jour(d){
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-CA'); } catch (e) { return String(d); }
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux promotions.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cet élément n’existe plus.',
    nom:                'Un nom interne est requis.',
    valeur:             'La valeur du rabais doit être supérieure à zéro.',
    bogo:               'Quantités « 2 pour 1 » invalides — la quantité gratuite doit être inférieure à la quantité achetée, qui vaut au moins 2.',
    paliers:            'Ajoutez au moins un palier valable : quantité d’au moins 2, rabais entre 1 et 100 %.',
    categories:         'Choisissez au moins une catégorie.',
    produits:           'Choisissez au moins un produit.',
    message:            'Le message du bandeau est requis.',
    badge:              'Le texte du badge est requis.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 140)) + ')';
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }
  function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }
  function coche(id){ var e = document.getElementById(id); return !!(e && e.checked); }

  function lignes(){
    var pile = (ONGLET === 'offres' ? (D.offres || []) : (D.annonces || []));
    var q = Q.trim().toLowerCase();
    if (!q) return pile;
    return pile.filter(function(x){
      return (String(x.nom) + ' ' + String(x.rabais || x.message || x.badge || ''))
        .toLowerCase().indexOf(q) !== -1;
    });
  }

  /* ── Le choix de la portée : catégories ou produits ── */
  function blocPortee(prefixe, appliqueA, cats){
    var h = '<div class="ch large"><label>S’applique à</label>'
      + '<select id="' + prefixe + '-appli">'
      + '<option value="all"' + (appliqueA === 'all' ? ' selected' : '') + '>Tous les produits</option>'
      + '<option value="category"' + (appliqueA === 'category' ? ' selected' : '') + '>Certaines catégories</option>'
      + '<option value="products"' + (appliqueA === 'products' ? ' selected' : '') + '>Des produits nommés</option>'
      + '</select></div>';

    h += '<div class="ch large" id="' + prefixe + '-bloc-cats"'
      + (appliqueA === 'category' ? '' : ' style="display:none"') + '>'
      + '<label>Catégories</label><div class="cases">'
      + (D.categories || []).map(function(c){
          return '<label><input type="checkbox" class="' + prefixe + '-cat" value="' + esc(c.cle) + '"'
            + (cats.indexOf(c.cle) >= 0 ? ' checked' : '') + '> ' + esc(c.libelle) + '</label>';
        }).join('')
      + '</div></div>';

    h += '<div class="ch large" id="' + prefixe + '-bloc-prods"'
      + (appliqueA === 'products' ? '' : ' style="display:none"') + '>'
      + '<label>Produits <span class="req">*</span></label>'
      + '<input type="search" id="' + prefixe + '-qprod" placeholder="Chercher un nom ou un SKU…" value="' + esc(QPROD) + '">'
      + '<div class="choix" id="' + prefixe + '-choix">' + listeCatalogue(prefixe) + '</div>'
      + '<span class="aide" id="' + prefixe + '-cpt">' + CHOISIS.length + ' produit'
      + (CHOISIS.length > 1 ? 's choisis' : ' choisi') + '</span></div>';
    return h;
  }

  function listeCatalogue(prefixe){
    var q = QPROD.trim().toLowerCase();
    /* Les produits DEJA CHOISIS restent en tete, meme hors recherche : sans
       cela, chercher autre chose donnait l impression de les avoir perdus. */
    var tout = (D.catalogue || []);
    var choisis = tout.filter(function(p){ return CHOISIS.indexOf(p.id) >= 0; });
    var reste = tout.filter(function(p){
      if (CHOISIS.indexOf(p.id) >= 0) return false;
      if (!q) return true;
      return (String(p.nom) + ' ' + String(p.sku)).toLowerCase().indexOf(q) !== -1;
    });
    // Sans recherche, on ne deverse pas tout le catalogue : les 40 premiers.
    var vus = choisis.concat(q ? reste.slice(0, 120) : reste.slice(0, 40));
    if (!vus.length) return '<div class="dt">Aucun produit ne correspond.</div>';
    return vus.map(function(p){
      return '<label class="lg"><input type="checkbox" class="' + prefixe + '-prod" value="' + esc(p.id) + '"'
        + (CHOISIS.indexOf(p.id) >= 0 ? ' checked' : '') + '> ' + esc(p.nom)
        + '<span class="sku">' + esc(p.sku || '') + '</span></label>';
    }).join('');
  }

  function boiteOffre(){
    var o = FORM || {};
    var genre = o.genre || 'percent';
    var h = '<div class="voile" id="pr-voile"><div class="boite">'
      + '<h3>' + (o.id ? 'Modifier l’offre' : 'Nouvelle offre') + '</h3>'
      + '<div class="grille">'
      + '<div class="ch"><label>Nom interne <span class="req">*</span></label>'
      + '<input id="of-nom" value="' + esc(o.nom || '') + '" placeholder="Solde du printemps"></div>'
      + '<div class="ch"><label>Statut</label><select id="of-actif">'
      + '<option value="1"' + (o.actif !== false ? ' selected' : '') + '>Actif</option>'
      + '<option value="0"' + (o.actif === false ? ' selected' : '') + '>Inactif</option></select></div>'
      + '<div class="ch"><label>Type de rabais</label><select id="of-genre">'
      + '<option value="percent"' + (genre === 'percent' ? ' selected' : '') + '>Pourcentage (%)</option>'
      + '<option value="fixed"' + (genre === 'fixed' ? ' selected' : '') + '>Montant fixe ($)</option>'
      + '<option value="bogo"' + (genre === 'bogo' ? ' selected' : '') + '>« 2 pour 1 » (quantité)</option>'
      + '<option value="tiered"' + (genre === 'tiered' ? ' selected' : '') + '>Paliers de quantité</option>'
      + '</select></div>'
      + '<div class="ch" id="of-bloc-val"' + (genre === 'bogo' || genre === 'tiered' ? ' style="display:none"' : '') + '>'
      + '<label>Valeur <span class="req">*</span></label>'
      + '<input type="number" id="of-valeur" min="0" step="0.01" value="' + esc(o.valeur || '') + '"></div>'
      + '</div>';

    h += '<div id="of-bloc-bogo"' + (genre === 'bogo' ? '' : ' style="display:none"') + '>'
      + '<h4>« 2 pour 1 »</h4><div class="grille">'
      + '<div class="ch"><label>Quantité achetée</label>'
      + '<input type="number" id="of-bogo-achat" min="2" step="1" value="' + esc(o.bogoAchat || 2) + '"></div>'
      + '<div class="ch"><label>Quantité gratuite</label>'
      + '<input type="number" id="of-bogo-gratuit" min="1" step="1" value="' + esc(o.bogoGratuit || 1) + '">'
      + '<span class="aide">Doit rester inférieure à la quantité achetée.</span></div>'
      + '<div class="ch"><label>&nbsp;</label><label style="display:inline-flex;align-items:center;gap:.4rem">'
      + '<input type="checkbox" id="of-parclient"' + (o.parClient ? ' checked' : '') + '> Une fois par client</label></div>'
      + '</div></div>';

    h += '<div id="of-bloc-paliers"' + (genre === 'tiered' ? '' : ' style="display:none"') + '>'
      + '<h4>Paliers de quantité</h4><div class="paliers" id="of-paliers">' + listePaliers() + '</div>'
      + '<button class="mini" id="of-palier-plus">+ Ajouter un palier</button></div>';

    h += '<h4>Portée</h4><div class="grille">'
      + blocPortee('of', o.appliqueA || 'all', o.categoriesChoisies || [])
      + '</div>';

    h += '<h4>Bandeau de la boutique</h4><div class="grille">'
      + '<div class="ch large"><label>Message</label>'
      + '<input id="of-bandeau" value="' + esc(o.bandeau || '') + '" placeholder="Jusqu’à 30 % sur les robes"></div>'
      + '<div class="ch large"><label>Message (anglais)</label>'
      + '<input id="of-bandeau-en" value="' + esc(o.bandeauEN || '') + '"></div>'
      + '<div class="ch"><label>Couleur du fond</label>'
      + '<input type="color" id="of-fond" value="' + esc(o.bandeauFond || '#1a1a2e') + '"></div>'
      + '<div class="ch"><label>Couleur du texte</label>'
      + '<input type="color" id="of-texte" value="' + esc(o.bandeauTexte || '#ffffff') + '"></div>'
      + '<div class="ch"><label>Texte du bouton</label>'
      + '<input id="of-cta" value="' + esc(o.bandeauCta || '') + '" placeholder="Voir les articles"></div>'
      + '<div class="ch"><label>Texte du bouton (anglais)</label>'
      + '<input id="of-cta-en" value="' + esc(o.bandeauCtaEN || '') + '"></div>'
      + '<div class="ch"><label>Lien du bouton</label>'
      + '<input id="of-url" value="' + esc(o.bandeauUrl || '#shop') + '"></div>'
      + '<div class="ch"><label>Priorité d’affichage</label>'
      + '<input type="number" id="of-priorite" min="1" max="99" value="' + esc(o.priorite || 5) + '"></div>'
      + '<div class="ch"><label>Début</label><input type="date" id="of-debut" value="' + esc(o.debut || '') + '"></div>'
      + '<div class="ch"><label>Fin</label><input type="date" id="of-fin" value="' + esc(o.fin || '') + '"></div>'
      + '</div>';

    h += '<div class="pied-boite"><button class="mini" id="pr-annuler">Annuler</button>'
      + '<button class="mini prim" id="of-enr">' + (o.id ? 'Enregistrer' : 'Créer l’offre') + '</button></div>'
      + '</div></div>';
    return h;
  }

  function listePaliers(){
    if (!PALIERS.length) return '<div class="dt">Aucun palier — ajoutez-en au moins un.</div>';
    return PALIERS.map(function(t, i){
      return '<div class="lg"><span class="dt">à partir de</span>'
        + '<input type="number" min="2" step="1" class="pal-qty" data-i="' + i + '" value="' + esc(t.qty || '') + '">'
        + '<span class="dt">articles :</span>'
        + '<input type="number" min="1" max="100" step="1" class="pal-pct" data-i="' + i + '" value="' + esc(t.percent || '') + '">'
        + '<span class="dt">%</span>'
        + '<button class="mini danger" data-pal-moins="' + i + '">Retirer</button></div>';
    }).join('');
  }

  function boiteAnnonce(){
    var a = FORM || {};
    var genre = a.genre || 'announcement';
    var h = '<div class="voile" id="pr-voile"><div class="boite">'
      + '<h3>' + (a.id ? 'Modifier' : 'Nouvelle annonce') + '</h3>'
      + '<div class="grille">'
      + '<div class="ch"><label>Nom interne <span class="req">*</span></label>'
      + '<input id="an-nom" value="' + esc(a.nom || '') + '"></div>'
      + '<div class="ch"><label>Genre</label><select id="an-genre">'
      + '<option value="announcement"' + (genre === 'announcement' ? ' selected' : '') + '>Bandeau de la boutique</option>'
      + '<option value="badge"' + (genre === 'badge' ? ' selected' : '') + '>Badge de fiche produit</option>'
      + '</select></div>'
      + '<div class="ch"><label>Statut</label><select id="an-actif">'
      + '<option value="1"' + (a.actif !== false ? ' selected' : '') + '>Actif</option>'
      + '<option value="0"' + (a.actif === false ? ' selected' : '') + '>Inactif</option></select></div>'
      + '<div class="ch"><label>Priorité</label>'
      + '<input type="number" id="an-priorite" min="1" max="99" value="' + esc(a.priorite || 5) + '"></div>'
      + '<div class="ch"><label>Début</label><input type="date" id="an-debut" value="' + esc(a.debut || '') + '"></div>'
      + '<div class="ch"><label>Fin</label><input type="date" id="an-fin" value="' + esc(a.fin || '') + '"></div>'
      + '</div>';

    h += '<div id="an-bloc-bandeau"' + (genre === 'announcement' ? '' : ' style="display:none"') + '>'
      + '<h4>Bandeau</h4><div class="grille">'
      + '<div class="ch large"><label>Message <span class="req">*</span></label>'
      + '<input id="an-message" value="' + esc(a.message || '') + '"></div>'
      + '<div class="ch large"><label>Message (anglais)</label>'
      + '<input id="an-message-en" value="' + esc(a.messageEN || '') + '"></div>'
      + '<div class="ch"><label>Couleur du fond</label>'
      + '<input type="color" id="an-fond" value="' + esc(a.fond || '#1a1a2e') + '"></div>'
      + '<div class="ch"><label>Couleur du texte</label>'
      + '<input type="color" id="an-texte" value="' + esc(a.texte || '#ffffff') + '"></div>'
      + '<div class="ch"><label>Texte du bouton</label><input id="an-cta" value="' + esc(a.cta || '') + '"></div>'
      + '<div class="ch"><label>Texte du bouton (anglais)</label><input id="an-cta-en" value="' + esc(a.ctaEN || '') + '"></div>'
      + '<div class="ch large"><label>Lien du bouton</label><input id="an-url" value="' + esc(a.url || '#shop') + '"></div>'
      + '</div></div>';

    h += '<div id="an-bloc-badge"' + (genre === 'badge' ? '' : ' style="display:none"') + '>'
      + '<h4>Badge</h4><div class="grille">'
      + '<div class="ch"><label>Texte <span class="req">*</span></label>'
      + '<input id="an-badge" value="' + esc(a.badge || '') + '" placeholder="Nouveauté"></div>'
      + '<div class="ch"><label>Texte (anglais)</label><input id="an-badge-en" value="' + esc(a.badgeEN || '') + '"></div>'
      + '<div class="ch"><label>Couleur</label><select id="an-badge-couleur">'
      + [['accent', 'Or (accent)'], ['success', 'Vert'], ['error', 'Rouge'], ['info', 'Bleu'], ['warning', 'Orange']]
          .map(function(c){
            return '<option value="' + c[0] + '"' + ((a.badgeCouleur || 'accent') === c[0] ? ' selected' : '') + '>' + c[1] + '</option>';
          }).join('')
      + '</select></div>'
      + blocPortee('an', a.appliqueA || 'all', a.categoriesChoisies || [])
      + '<div class="ch"><label>&nbsp;</label><label style="display:inline-flex;align-items:center;gap:.4rem">'
      + '<input type="checkbox" id="an-expire"' + (a.expireAuto ? ' checked' : '') + '> Expire par produit</label></div>'
      + '<div class="ch"><label>Après (jours)</label>'
      + '<input type="number" id="an-expire-jours" min="1" value="' + esc(a.expireJours || 7) + '"></div>'
      + '</div></div>';

    h += '<div class="pied-boite"><button class="mini" id="pr-annuler">Annuler</button>'
      + '<button class="mini prim" id="an-enr">' + (a.id ? 'Enregistrer' : 'Créer') + '</button></div>'
      + '</div></div>';
    return h;
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var rows = lignes();

    var h = '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'offres' ? ' actif' : '') + '" data-onglet="offres">Offres et rabais</button>'
      + '<button class="mini' + (ONGLET === 'annonces' ? ' actif' : '') + '" data-onglet="annonces">Annonces et badges</button>'
      + '<input type="search" id="pr-q" placeholder="Rechercher…" value="' + esc(Q) + '">'
      + '<div class="droite">'
      + (D.peutModifier ? '<button class="mini prim" id="pr-nouveau">+ '
          + (ONGLET === 'offres' ? 'Nouvelle offre' : 'Nouvelle annonce') + '</button>' : '')
      + '<span>' + rows.length + '</span></div></div>';

    if (ONGLET === 'annonces' && D.peutModifier) {
      h += '<div class="carte"><h2>Défilement du bandeau</h2>'
        + '<div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">'
        + '<span class="dt">Quand plusieurs bandeaux sont actifs, ils se succèdent toutes les</span>'
        + '<input type="number" id="pr-interv" min="2" max="60" style="width:5rem" value="' + esc(D.intervalle || 6) + '">'
        + '<span class="dt">secondes.</span>'
        + '<button class="mini" id="pr-interv-enr">Enregistrer</button></div></div>';
    }

    h += '<div class="carte">';
    if (!rows.length) {
      h += '<div class="vide">' + (Q ? 'Rien ne correspond.'
        : ONGLET === 'offres' ? 'Aucune offre. Créez la première.' : 'Aucune annonce. Créez la première.') + '</div>';
    } else if (ONGLET === 'offres') {
      h += '<table><thead><tr><th>Nom</th><th>Rabais</th><th>Portée</th><th>Période</th>'
        + '<th>État</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + rows.map(function(o){
            return '<tr><td><strong>' + esc(o.nom) + '</strong></td>'
              + '<td style="font-weight:700;color:var(--tx-or)">' + esc(o.rabais) + '</td>'
              + '<td class="dt">' + esc(o.portee) + '</td>'
              + '<td class="dt">' + (o.debut ? esc(jour(o.debut)) : '—')
              + (o.fin ? ' → ' + esc(jour(o.fin)) : '') + '</td>'
              + '<td><span class="pill ' + (o.enCours ? 'bon' : 'neutre') + '">'
              + (o.enCours ? 'En cours' : 'Hors service') + '</span></td>'
              + (D.peutModifier ? '<td class="fin">' + gestes(o) + '</td>' : '') + '</tr>';
          }).join('')
        + '</tbody></table>';
    } else {
      h += '<table><thead><tr><th>Nom</th><th>Genre</th><th>Contenu</th><th>Priorité</th>'
        + '<th>Période</th><th>État</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + rows.map(function(a){
            return '<tr><td><strong>' + esc(a.nom) + '</strong>'
              + (a.expireAuto ? '<div class="dt">expire après ' + a.expireJours + ' j par produit</div>' : '') + '</td>'
              + '<td><span class="pill neutre">' + (a.genre === 'announcement' ? 'Bandeau' : 'Badge') + '</span></td>'
              + '<td class="dt" style="max-width:18rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'
              + esc(a.genre === 'announcement' ? a.message : a.badge) + '</td>'
              + '<td>' + a.priorite + '</td>'
              + '<td class="dt">' + (a.debut ? esc(jour(a.debut)) : '—')
              + (a.fin ? ' → ' + esc(jour(a.fin)) : '') + '</td>'
              + '<td><span class="pill ' + (a.enCours ? 'bon' : 'neutre') + '">'
              + (a.enCours ? 'En cours' : 'Hors service') + '</span></td>'
              + (D.peutModifier ? '<td class="fin">' + gestes(a) + '</td>' : '') + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';

    if (FORM) h += (ONGLET === 'offres' ? boiteOffre() : boiteAnnonce());
    corps.innerHTML = h;
    brancher();
  }

  function gestes(x){
    return '<button class="mini geste" data-modifier="' + esc(x.id) + '">Modifier</button> '
      + '<button class="mini geste" data-basculer="' + esc(x.id) + '">'
      + (x.actif ? 'Désactiver' : 'Activer') + '</button> '
      + '<button class="mini geste danger" data-suppr="' + esc(x.id) + '">'
      + (SUPPR_ARME === x.id ? 'Confirmer ?' : 'Supprimer') + '</button>';
  }

  function brancherPortee(prefixe){
    var ap = document.getElementById(prefixe + '-appli');
    if (ap) ap.onchange = function(){
      var c = document.getElementById(prefixe + '-bloc-cats');
      var p = document.getElementById(prefixe + '-bloc-prods');
      if (c) c.style.display = ap.value === 'category' ? '' : 'none';
      if (p) p.style.display = ap.value === 'products' ? '' : 'none';
    };
    var qp = document.getElementById(prefixe + '-qprod');
    if (qp) qp.oninput = function(){
      QPROD = qp.value;
      var z = document.getElementById(prefixe + '-choix');
      if (z) z.innerHTML = listeCatalogue(prefixe);
      brancherCases(prefixe);
    };
    brancherCases(prefixe);
  }
  function brancherCases(prefixe){
    var cpt = document.getElementById(prefixe + '-cpt');
    [].forEach.call(document.querySelectorAll('.' + prefixe + '-prod'), function(cb){
      cb.onchange = function(){
        var i = CHOISIS.indexOf(cb.value);
        if (cb.checked && i < 0) CHOISIS.push(cb.value);
        if (!cb.checked && i >= 0) CHOISIS.splice(i, 1);
        if (cpt) cpt.textContent = CHOISIS.length + ' produit' + (CHOISIS.length > 1 ? 's choisis' : ' choisi');
      };
    });
  }
  function catsCochees(prefixe){
    return [].map.call(document.querySelectorAll('.' + prefixe + '-cat:checked'), function(c){ return c.value; });
  }

  /* == LE BROUILLON DES OFFRES ET DES ANNONCES ==============================
     C'est le plus gros formulaire de l'application apres l'assistant Produit :
     une trentaine de champs, deux langues, des couleurs, des dates, des paliers
     de quantite, et une selection de produits ou de categories. Plusieurs minutes
     de travail, dont rien n'existait ailleurs que dans la boite — qui se ferme au
     moindre clic a cote.

     ⚠ DEUX FORMULAIRES, UN SEUL ETAT. << FORM >> sert aux offres ET aux annonces,
     et les deux n'ont pas les memes champs. La cle porte donc l'onglet : sans lui,
     une annonce a moitie redigee serait proposee dans le formulaire d'une offre,
     ou l'inverse — un formulaire aux champs a moitie remplis, dont on ne
     comprendrait pas d'ou ils viennent.

     ⚠ LES PALIERS ET LES PRODUITS CHOISIS NE VIVENT PAS DANS LE DOM mais dans
     PALIERS et CHOISIS. Les lire depuis l'ecran ne rendrait que la page affichee
     du catalogue — c'est le piege que le code note deja pour l'enregistrement.
     On garde donc les deux VARIABLES, et on les repose telles quelles.

     ⚠ ET LES CATEGORIES COCHEES SONT DES CASES SANS IDENTIFIANT (classe
     <prefixe>-cat) : liste explicite, comme pour les reseaux des patrons. */
  var BR_OF = ['of-nom', 'of-actif', 'of-genre', 'of-valeur', 'of-bogo-achat',
    'of-bogo-gratuit', 'of-appli', 'of-bandeau', 'of-bandeau-en', 'of-fond',
    'of-texte', 'of-cta', 'of-cta-en', 'of-url', 'of-priorite', 'of-debut', 'of-fin'];
  var BR_OF_CASES = ['of-parclient'];
  var BR_AN = ['an-nom', 'an-genre', 'an-actif', 'an-priorite', 'an-debut', 'an-fin',
    'an-message', 'an-message-en', 'an-fond', 'an-texte', 'an-cta', 'an-cta-en',
    'an-url', 'an-badge', 'an-badge-en', 'an-badge-couleur', 'an-appli', 'an-expire-jours'];
  var BR_AN_CASES = ['an-expire'];
  function brPrefixe(){ return ONGLET === 'annonces' ? 'an' : 'of'; }
  function brListes(){
    return ONGLET === 'annonces' ? [BR_AN, BR_AN_CASES] : [BR_OF, BR_OF_CASES];
  }
  function brCats(){
    var pr = brPrefixe();
    return [].map.call(document.querySelectorAll('.' + pr + '-cat:checked'), function(c){ return c.value; });
  }
  szBrouillonBrancher({
    portee: 'promotion',
    libelle: 'Une saisie',
    ttlMin: 720,
    cle: function(){
      if (!FORM) return '';
      return brPrefixe() + ':' + (FORM.id || '__new__');
    },
    actif: function(){ return !!FORM; },
    valeurs: function(){
      var l = brListes();
      var v = szBrouillonDuDom(l[0], l[1]);
      if (!v) return null;
      v._cats = brCats();
      v._paliers = PALIERS;
      v._prods = CHOISIS;
      return v;
    },
    /* Le nom suffit, comme partout ailleurs — mais un palier pose ou un produit
       choisi compte AUSSI : c'est du travail, meme sans un mot tape. */
    rempli: function(){
      var l = brListes();
      var v = szBrouillonDuDom(l[0], l[1]); if (!v) return false;
      var texte = ONGLET === 'annonces'
        ? ['an-nom', 'an-message', 'an-message-en', 'an-badge', 'an-cta', 'an-url']
        : ['of-nom', 'of-valeur', 'of-bandeau', 'of-bandeau-en', 'of-cta', 'of-url'];
      if (szBrouillonQuelqueChose(v, texte)) return true;
      return (PALIERS && PALIERS.length > 0) || (CHOISIS && CHOISIS.length > 0);
    },
    remplir: function(v){
      szBrouillonAuDom(v);
      var pr = brPrefixe(), cats = v._cats || [];
      [].forEach.call(document.querySelectorAll('.' + pr + '-cat'), function(c){
        c.checked = cats.indexOf(c.value) >= 0;
      });
      PALIERS = v._paliers || [];
      CHOISIS = v._prods || [];
      /* Les blocs qui s'affichent selon le type de rabais, et la liste des
         paliers, sont dessines a partir de ces valeurs : les reposer sans
         redessiner donnerait un ecran qui ne montre pas ce qui sera enregistre. */
      dessiner();
    },
  });
  szBrouillonEcouter();

  function brancher(){
    var q = document.getElementById('pr-q');
    if (q) q.oninput = function(){ Q = q.value; redessinerSansPerdreLaSaisie(); };
    var bn = document.getElementById('pr-nouveau');
    if (bn) bn.onclick = function(){ FORM = {}; PALIERS = []; CHOISIS = []; QPROD = ''; dessiner(); szBrouillonProposer(); };
    var ba = document.getElementById('pr-annuler');
    /* ⚠ TROIS CHEMINS FERMENT CETTE BOITE (Annuler, le clic a cote, Echap) : les
       trois ecrivent MAINTENANT, avec les valeurs prises avant qu'elle ne
       disparaisse. Le clic a cote est celui qui arrive le plus par accident,
       donc celui qui coute le plus cher. */
    if (ba) ba.onclick = function(){ szBrouillonMaintenant(); FORM = null; dessiner(); };
    var vo = document.getElementById('pr-voile');
    if (vo) vo.onclick = function(ev){ if (ev.target === vo) { szBrouillonMaintenant(); FORM = null; dessiner(); } };

    var bi = document.getElementById('pr-interv-enr');
    if (bi) bi.onclick = function(){
      bi.disabled = true;
      appeler('promos:bandeau', [val('pr-interv')]).then(function(r){
        bi.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Défilement réglé à ' + r.intervalle + ' secondes.', 'bon');
        charger();
      });
    };

    if (!FORM) return;

    if (ONGLET === 'offres') {
      var gr = document.getElementById('of-genre');
      if (gr) gr.onchange = function(){
        var g = gr.value;
        var bv = document.getElementById('of-bloc-val');
        var bb = document.getElementById('of-bloc-bogo');
        var bp = document.getElementById('of-bloc-paliers');
        if (bv) bv.style.display = (g === 'bogo' || g === 'tiered') ? 'none' : '';
        if (bb) bb.style.display = g === 'bogo' ? '' : 'none';
        if (bp) bp.style.display = g === 'tiered' ? '' : 'none';
      };
      var bpl = document.getElementById('of-palier-plus');
      if (bpl) bpl.onclick = function(){ lirePaliers(); PALIERS.push({ qty: '', percent: '' }); redessinerPaliers(); };
      brancherPaliers();
      brancherPortee('of');

      var be = document.getElementById('of-enr');
      if (be) be.onclick = function(){
        lirePaliers();
        be.disabled = true;
        appeler('offres:enregistrer', [(FORM && FORM.id) || '', {
          nom: val('of-nom'), actif: val('of-actif') === '1',
          genre: val('of-genre'), valeur: val('of-valeur'),
          bogoAchat: val('of-bogo-achat'), bogoGratuit: val('of-bogo-gratuit'),
          parClient: coche('of-parclient'), paliers: PALIERS,
          appliqueA: val('of-appli'), categoriesChoisies: catsCochees('of'), produitsChoisis: CHOISIS,
          bandeau: val('of-bandeau'), bandeauEN: val('of-bandeau-en'),
          bandeauFond: val('of-fond'), bandeauTexte: val('of-texte'),
          bandeauCta: val('of-cta'), bandeauCtaEN: val('of-cta-en'), bandeauUrl: val('of-url'),
          priorite: val('of-priorite'), debut: val('of-debut'), fin: val('of-fin')
        }]).then(function(r){
          be.disabled = false;
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          szBrouillonJeter();
          FORM = null;
          dire('Offre « ' + r.nom + ' » ' + (r.creation ? 'créée.' : 'mise à jour.'), 'bon');
          charger();
        });
      };
    } else {
      var ag = document.getElementById('an-genre');
      if (ag) ag.onchange = function(){
        var ban = document.getElementById('an-bloc-bandeau');
        var bad = document.getElementById('an-bloc-badge');
        if (ban) ban.style.display = ag.value === 'announcement' ? '' : 'none';
        if (bad) bad.style.display = ag.value === 'badge' ? '' : 'none';
      };
      brancherPortee('an');

      var ae = document.getElementById('an-enr');
      if (ae) ae.onclick = function(){
        ae.disabled = true;
        appeler('annonces:enregistrer', [(FORM && FORM.id) || '', {
          nom: val('an-nom'), genre: val('an-genre'), actif: val('an-actif') === '1',
          priorite: val('an-priorite'), debut: val('an-debut'), fin: val('an-fin'),
          message: val('an-message'), messageEN: val('an-message-en'),
          fond: val('an-fond'), texte: val('an-texte'),
          cta: val('an-cta'), ctaEN: val('an-cta-en'), url: val('an-url'),
          badge: val('an-badge'), badgeEN: val('an-badge-en'), badgeCouleur: val('an-badge-couleur'),
          appliqueA: val('an-appli'), categoriesChoisies: catsCochees('an'), produitsChoisis: CHOISIS,
          expireAuto: coche('an-expire'), expireJours: val('an-expire-jours')
        }]).then(function(r){
          ae.disabled = false;
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          szBrouillonJeter();
          FORM = null;
          dire('« ' + r.nom + ' » ' + (r.creation ? 'créée.' : 'mise à jour.'), 'bon');
          charger();
        });
      };
    }
  }

  /* Les paliers sont RELUS avant tout redessin : sinon une saisie en cours
     disparaissait au moindre ajout de ligne. */
  function lirePaliers(){
    var qs = document.querySelectorAll('.pal-qty');
    var ps = document.querySelectorAll('.pal-pct');
    for (var i = 0; i < qs.length; i++) {
      var k = parseInt(qs[i].getAttribute('data-i'), 10);
      if (PALIERS[k]) { PALIERS[k].qty = qs[i].value; PALIERS[k].percent = ps[i] ? ps[i].value : ''; }
    }
  }
  function redessinerPaliers(){
    var z = document.getElementById('of-paliers');
    if (z) { z.innerHTML = listePaliers(); brancherPaliers(); }
  }
  function brancherPaliers(){
    [].forEach.call(document.querySelectorAll('[data-pal-moins]'), function(b){
      b.onclick = function(){
        lirePaliers();
        PALIERS.splice(parseInt(b.getAttribute('data-pal-moins'), 10), 1);
        redessinerPaliers();
      };
    });
  }

  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('pr-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('pr-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest || t.closest('.boite')) return;

    var og = t.closest('[data-onglet]');
    if (og) {
      ONGLET = og.getAttribute('data-onglet');
      Q = ''; FORM = null; SUPPR_ARME = '';
      charger();
      return;
    }
    var bm = t.closest('[data-modifier]');
    if (bm) {
      var idM = bm.getAttribute('data-modifier');
      var pile = ONGLET === 'offres' ? D.offres : D.annonces;
      var x = pile.filter(function(y){ return y.id === idM; })[0];
      if (x) {
        FORM = x;
        PALIERS = (x.paliers || []).map(function(p){ return { qty: p.qty, percent: p.percent }; });
        CHOISIS = (x.produitsChoisis || []).slice();
        QPROD = ''; SUPPR_ARME = '';
        dessiner();
      }
      return;
    }
    var bb = t.closest('[data-basculer]');
    if (bb) {
      SUPPR_ARME = '';
      bb.disabled = true;
      appeler('promos:basculer', [bb.getAttribute('data-basculer')]).then(function(r){
        if (!r.ok) { bb.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('« ' + (r.nom || '') + ' » ' + (r.actif ? 'activée.' : 'désactivée.'), 'bon');
        charger();
      });
      return;
    }
    var bs = t.closest('[data-suppr]');
    if (bs) {
      var idS = bs.getAttribute('data-suppr');
      if (SUPPR_ARME !== idS) {
        SUPPR_ARME = idS;
        dessiner();
        dire('Cliquez « Confirmer ? » pour supprimer — la bannière de la boutique sera retirée avec.', 'att');
        return;
      }
      SUPPR_ARME = '';
      appeler('promos:supprimer', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire('« ' + (r.nom || '') + ' » supprimée.', 'bon');
        charger();
      });
      return;
    }
    if (SUPPR_ARME) { SUPPR_ARME = ''; dessiner(); }
  });

  function charger(){
    appeler(ONGLET === 'offres' ? 'offres:liste' : 'annonces:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Promotions indisponibles', expliquer(r)); return; }
      D = r;
      if (sous) sous.textContent = D.peutModifier ? '' : 'consultation seulement';
      dessiner();
    });
  }

  window.szActualiser = function(){
    var q = document.getElementById('pr-q');
    if (q && document.activeElement === q && q.value) return;
    if (FORM) return;
    charger();
  };
  window.szRevenir = function(){ if (!FORM) charger(); };

  /* ── MODE ANCRE ── Le meme bouton que les autres ecrans. */
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
      b.textContent = '⧉ Détacher';
      b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '⚓ Ancrer';
      b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (FORM) { szBrouillonMaintenant(); FORM = null; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pagePromotions };
