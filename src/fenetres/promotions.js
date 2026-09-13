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

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la langue du
   poste. ⚠⚠⚠ CET ÉCRAN EST DÉJÀ BILINGUE PAR SES CHAMPS : le bandeau et le
   badge portent chacun « Message » ET « Message (anglais) ». Ce que la cliente
   lit est traduit À LA MAIN par qui rédige l'offre — ici on ne traduit que les
   LIBELLES. Voir l'en-tête de src/langue/promotions.js. */
const T = require('../langue').tr('promotions');

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
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
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
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
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
  return `${TETE()}
<title>${T("Offres et annonces — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.promotions}</span><h1>${T("Offres et annonces")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_BROUILLON()}
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
    try { return new Date(d).toLocaleDateString('${LIEU()}'); } catch (e) { return String(d); }
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux promotions.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cet élément n’existe plus.")}',
    nom:                '${T("Un nom interne est requis.")}',
    valeur:             '${T("La valeur du rabais doit être supérieure à zéro.")}',
    bogo:               '${T("Quantités « 2 pour 1 » invalides — la quantité gratuite doit être inférieure à la quantité achetée, qui vaut au moins 2.")}',
    paliers:            '${T("Ajoutez au moins un palier valable : quantité d’au moins 2, rabais entre 1 et 100 %.")}',
    categories:         '${T("Choisissez au moins une catégorie.")}',
    produits:           '${T("Choisissez au moins un produit.")}',
    message:            '${T("Le message du bandeau est requis.")}',
    badge:              '${T("Le texte du badge est requis.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
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
    var h = '<div class="ch large"><label>${T("S’applique à")}</label>'
      + '<select aria-label="${T("S’applique à")}" id="' + prefixe + '-appli">'
      + '<option value="all"' + (appliqueA === 'all' ? ' selected' : '') + '>${T("Tous les produits")}</option>'
      + '<option value="category"' + (appliqueA === 'category' ? ' selected' : '') + '>${T("Certaines catégories")}</option>'
      + '<option value="products"' + (appliqueA === 'products' ? ' selected' : '') + '>${T("Des produits nommés")}</option>'
      + '</select></div>';

    h += '<div class="ch large" id="' + prefixe + '-bloc-cats"'
      + (appliqueA === 'category' ? '' : ' style="display:none"') + '>'
      + '<label>${T("Catégories")}</label><div class="cases">'
      + (D.categories || []).map(function(c){
          return '<label><input type="checkbox" class="' + prefixe + '-cat" value="' + esc(c.cle) + '"'
            + (cats.indexOf(c.cle) >= 0 ? ' checked' : '') + '> ' + esc(c.libelle) + '</label>';
        }).join('')
      + '</div></div>';

    h += '<div class="ch large" id="' + prefixe + '-bloc-prods"'
      + (appliqueA === 'products' ? '' : ' style="display:none"') + '>'
      + '<label>${T("Produits ")}<span class="req">*</span></label>'
      + '<input type="search" id="' + prefixe + '-qprod" aria-label="${T("Chercher un produit par nom ou SKU")}" placeholder="${T("Chercher un nom ou un SKU…")}" value="' + esc(QPROD) + '">'
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
    if (!vus.length) return '<div class="dt">${T("Aucun produit ne correspond.")}</div>';
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
      + '<h3>' + (o.id ? '${T("Modifier l’offre")}' : '${T("Nouvelle offre")}') + '</h3>'
      + '<div class="grille">'
      + '<div class="ch"><label>${T("Nom interne ")}<span class="req">*</span></label>'
      + '<input id="of-nom" aria-label="${T("Nom interne de l’offre")}" value="' + esc(o.nom || '') + '" placeholder="${T("Solde du printemps")}"></div>'
      + '<div class="ch"><label for="of-actif">${T("Statut")}</label><select id="of-actif">'
      + '<option value="1"' + (o.actif !== false ? ' selected' : '') + '>${T("Actif")}</option>'
      + '<option value="0"' + (o.actif === false ? ' selected' : '') + '>${T("Inactif")}</option></select></div>'
      + '<div class="ch"><label for="of-genre">${T("Type de rabais")}</label><select id="of-genre">'
      + '<option value="percent"' + (genre === 'percent' ? ' selected' : '') + '>${T("Pourcentage (%)")}</option>'
      + '<option value="fixed"' + (genre === 'fixed' ? ' selected' : '') + '>${T("Montant fixe ($)")}</option>'
      + '<option value="bogo"' + (genre === 'bogo' ? ' selected' : '') + '>${T("« 2 pour 1 » (quantité)")}</option>'
      + '<option value="tiered"' + (genre === 'tiered' ? ' selected' : '') + '>${T("Paliers de quantité")}</option>'
      + '</select></div>'
      + '<div class="ch" id="of-bloc-val"' + (genre === 'bogo' || genre === 'tiered' ? ' style="display:none"' : '') + '>'
      + '<label>${T("Valeur ")}<span class="req">*</span></label>'
      + '<input type="number" id="of-valeur" aria-label="${T("Valeur de l’offre")}" min="0" step="0.01" value="' + esc(o.valeur || '') + '"></div>'
      + '</div>';

    h += '<div id="of-bloc-bogo"' + (genre === 'bogo' ? '' : ' style="display:none"') + '>'
      + '<h4>${T("« 2 pour 1 »")}</h4><div class="grille">'
      + '<div class="ch"><label for="of-bogo-achat">${T("Quantité achetée")}</label>'
      + '<input type="number" id="of-bogo-achat" min="2" step="1" value="' + esc(o.bogoAchat || 2) + '"></div>'
      + '<div class="ch"><label for="of-bogo-gratuit">${T("Quantité gratuite")}</label>'
      + '<input type="number" id="of-bogo-gratuit" min="1" step="1" value="' + esc(o.bogoGratuit || 1) + '">'
      + '<span class="aide">${T("Doit rester inférieure à la quantité achetée.")}</span></div>'
      + '<div class="ch"><label for="of-parclient">&nbsp;</label><label style="display:inline-flex;align-items:center;gap:.4rem">'
      + '<input type="checkbox" id="of-parclient"' + (o.parClient ? ' checked' : '') + '> ${T("Une fois par client")}</label></div>'
      + '</div></div>';

    h += '<div id="of-bloc-paliers"' + (genre === 'tiered' ? '' : ' style="display:none"') + '>'
      + '<h4>${T("Paliers de quantité")}</h4><div class="paliers" id="of-paliers">' + listePaliers() + '</div>'
      + '<button class="mini" id="of-palier-plus">${T("+ Ajouter un palier")}</button></div>';

    h += '<h4>${T("Portée")}</h4><div class="grille">'
      + blocPortee('of', o.appliqueA || 'all', o.categoriesChoisies || [])
      + '</div>';

    h += '<h4>${T("Bandeau de la boutique")}</h4><div class="grille">'
      + '<div class="ch large"><label for="of-bandeau">${T("Message")}</label>'
      + '<input id="of-bandeau" value="' + esc(o.bandeau || '') + '" placeholder="${T("Jusqu’à 30 % sur les robes")}"></div>'
      + '<div class="ch large"><label for="of-bandeau-en">${T("Message (anglais)")}</label>'
      + '<input id="of-bandeau-en" value="' + esc(o.bandeauEN || '') + '"></div>'
      + '<div class="ch"><label for="of-fond">${T("Couleur du fond")}</label>'
      + '<input type="color" id="of-fond" value="' + esc(o.bandeauFond || '#1a1a2e') + '"></div>'
      + '<div class="ch"><label for="of-texte">${T("Couleur du texte")}</label>'
      + '<input type="color" id="of-texte" value="' + esc(o.bandeauTexte || '#ffffff') + '"></div>'
      + '<div class="ch"><label for="of-cta">${T("Texte du bouton")}</label>'
      + '<input id="of-cta" value="' + esc(o.bandeauCta || '') + '" placeholder="${T("Voir les articles")}"></div>'
      + '<div class="ch"><label for="of-cta-en">${T("Texte du bouton (anglais)")}</label>'
      + '<input id="of-cta-en" value="' + esc(o.bandeauCtaEN || '') + '"></div>'
      + '<div class="ch"><label for="of-url">${T("Lien du bouton")}</label>'
      + '<input id="of-url" value="' + esc(o.bandeauUrl || '#shop') + '"></div>'
      + '<div class="ch"><label for="of-priorite">${T("Priorité d’affichage")}</label>'
      + '<input type="number" id="of-priorite" min="1" max="99" value="' + esc(o.priorite || 5) + '"></div>'
      + '<div class="ch"><label for="of-debut">${T("Début")}</label><input type="date" id="of-debut" value="' + esc(o.debut || '') + '"></div>'
      + '<div class="ch"><label for="of-fin">${T("Fin")}</label><input type="date" id="of-fin" value="' + esc(o.fin || '') + '"></div>'
      + '</div>';

    h += '<div class="pied-boite"><button class="mini" id="pr-annuler">${T("Annuler")}</button>'
      + '<button class="mini prim" id="of-enr">' + (o.id ? '${T("Enregistrer")}' : '${T("Créer l’offre")}') + '</button></div>'
      + '</div></div>';
    return h;
  }

  function listePaliers(){
    if (!PALIERS.length) return '<div class="dt">${T("Aucun palier — ajoutez-en au moins un.")}</div>';
    return PALIERS.map(function(t, i){
      return '<div class="lg"><span class="dt">${T("à partir de")}</span>'
        /* ⚠ DEUX CHAMPS DANS UNE PHRASE (<< a partir de N articles : P % >>) : les
         mots qui les separent sont du TEXTE, pas des etiquettes. En tabulant, le
         lecteur d ecran annoncait deux fois << nombre >>. */
      + '<input type="number" min="2" step="1" class="pal-qty" data-i="' + i + '" aria-label="' + esc('${T("Palier ")}' + (i + 1) + '${T(" — nombre d’articles")}') + '" value="' + esc(t.qty || '') + '">'
        + '<span class="dt">${T("articles :")}</span>'
        + '<input type="number" min="1" max="100" step="1" class="pal-pct" data-i="' + i + '" aria-label="' + esc('${T("Palier ")}' + (i + 1) + '${T(" — pourcentage de rabais")}') + '" value="' + esc(t.percent || '') + '">'
        + '<span class="dt">%</span>'
        + '<button class="mini danger" data-pal-moins="' + i + '">${T("Retirer")}</button></div>';
    }).join('');
  }

  function boiteAnnonce(){
    var a = FORM || {};
    var genre = a.genre || 'announcement';
    var h = '<div class="voile" id="pr-voile"><div class="boite">'
      + '<h3>' + (a.id ? '${T("Modifier")}' : '${T("Nouvelle annonce")}') + '</h3>'
      + '<div class="grille">'
      + '<div class="ch"><label>${T("Nom interne ")}<span class="req">*</span></label>'
      + '<input id="an-nom" aria-label="${T("Nom interne de l’annonce")}" value="' + esc(a.nom || '') + '"></div>'
      + '<div class="ch"><label for="an-genre">${T("Genre")}</label><select id="an-genre">'
      + '<option value="announcement"' + (genre === 'announcement' ? ' selected' : '') + '>${T("Bandeau de la boutique")}</option>'
      + '<option value="badge"' + (genre === 'badge' ? ' selected' : '') + '>${T("Badge de fiche produit")}</option>'
      + '</select></div>'
      + '<div class="ch"><label for="an-actif">${T("Statut")}</label><select id="an-actif">'
      + '<option value="1"' + (a.actif !== false ? ' selected' : '') + '>${T("Actif")}</option>'
      + '<option value="0"' + (a.actif === false ? ' selected' : '') + '>${T("Inactif")}</option></select></div>'
      + '<div class="ch"><label for="an-priorite">${T("Priorité")}</label>'
      + '<input type="number" id="an-priorite" min="1" max="99" value="' + esc(a.priorite || 5) + '"></div>'
      + '<div class="ch"><label for="an-debut">${T("Début")}</label><input type="date" id="an-debut" value="' + esc(a.debut || '') + '"></div>'
      + '<div class="ch"><label for="an-fin">${T("Fin")}</label><input type="date" id="an-fin" value="' + esc(a.fin || '') + '"></div>'
      + '</div>';

    h += '<div id="an-bloc-bandeau"' + (genre === 'announcement' ? '' : ' style="display:none"') + '>'
      + '<h4>${T("Bandeau")}</h4><div class="grille">'
      + '<div class="ch large"><label>${T("Message ")}<span class="req">*</span></label>'
      + '<input id="an-message" aria-label="${T("Message")} de l’annonce" value="' + esc(a.message || '') + '"></div>'
      + '<div class="ch large"><label for="an-message-en">${T("Message (anglais)")}</label>'
      + '<input id="an-message-en" value="' + esc(a.messageEN || '') + '"></div>'
      + '<div class="ch"><label for="an-fond">${T("Couleur du fond")}</label>'
      + '<input type="color" id="an-fond" value="' + esc(a.fond || '#1a1a2e') + '"></div>'
      + '<div class="ch"><label for="an-texte">${T("Couleur du texte")}</label>'
      + '<input type="color" id="an-texte" value="' + esc(a.texte || '#ffffff') + '"></div>'
      + '<div class="ch"><label for="an-cta">${T("Texte du bouton")}</label><input id="an-cta" value="' + esc(a.cta || '') + '"></div>'
      + '<div class="ch"><label for="an-cta-en">${T("Texte du bouton (anglais)")}</label><input id="an-cta-en" value="' + esc(a.ctaEN || '') + '"></div>'
      + '<div class="ch large"><label for="an-url">${T("Lien du bouton")}</label><input id="an-url" value="' + esc(a.url || '#shop') + '"></div>'
      + '</div></div>';

    h += '<div id="an-bloc-badge"' + (genre === 'badge' ? '' : ' style="display:none"') + '>'
      + '<h4>${T("Badge")}</h4><div class="grille">'
      + '<div class="ch"><label>${T("Texte ")}<span class="req">*</span></label>'
      + '<input id="an-badge" aria-label="${T("Texte de l’emblème")}" value="' + esc(a.badge || '') + '" placeholder="${T("Nouveauté")}"></div>'
      + '<div class="ch"><label for="an-badge-en">${T("Texte (anglais)")}</label><input id="an-badge-en" value="' + esc(a.badgeEN || '') + '"></div>'
      + '<div class="ch"><label for="an-badge-couleur">${T("Couleur")}</label><select id="an-badge-couleur">'
      + [['accent', '${T("Or (accent)")}'], ['success', '${T("Vert")}'], ['error', '${T("Rouge")}'], ['info', '${T("Bleu")}'], ['warning', '${T("Orange")}']]
          .map(function(c){
            return '<option value="' + c[0] + '"' + ((a.badgeCouleur || 'accent') === c[0] ? ' selected' : '') + '>' + c[1] + '</option>';
          }).join('')
      + '</select></div>'
      + blocPortee('an', a.appliqueA || 'all', a.categoriesChoisies || [])
      + '<div class="ch"><label for="an-expire">&nbsp;</label><label style="display:inline-flex;align-items:center;gap:.4rem">'
      + '<input type="checkbox" id="an-expire"' + (a.expireAuto ? ' checked' : '') + '> ${T("Expire par produit")}</label></div>'
      + '<div class="ch"><label for="an-expire-jours">${T("Après (jours)")}</label>'
      + '<input type="number" id="an-expire-jours" min="1" value="' + esc(a.expireJours || 7) + '"></div>'
      + '</div></div>';

    h += '<div class="pied-boite"><button class="mini" id="pr-annuler">${T("Annuler")}</button>'
      + '<button class="mini prim" id="an-enr">' + (a.id ? '${T("Enregistrer")}' : '${T("Créer")}') + '</button></div>'
      + '</div></div>';
    return h;
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    var rows = lignes();

    var h = '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'offres' ? ' actif' : '') + '" data-onglet="offres">${T("Offres et rabais")}</button>'
      + '<button class="mini' + (ONGLET === 'annonces' ? ' actif' : '') + '" data-onglet="annonces">${T("Annonces et badges")}</button>'
      + '<input aria-label="${T("Rechercher")}" type="search" id="pr-q" placeholder="${T("Rechercher…")}" value="' + esc(Q) + '">'
      + '<div class="droite">'
      + (D.peutModifier ? '<button class="mini prim" id="pr-nouveau">+ '
          + (ONGLET === 'offres' ? '${T("Nouvelle offre")}' : '${T("Nouvelle annonce")}') + '</button>' : '')
      + '<span>' + rows.length + '</span></div></div>';

    if (ONGLET === 'annonces' && D.peutModifier) {
      h += '<div class="carte"><h2>${T("Défilement du bandeau")}</h2>'
        + '<div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">'
        + '<span class="dt">${T("Quand plusieurs bandeaux sont actifs, ils se succèdent toutes les")}</span>'
        + '<input type="number" id="pr-interv" aria-label="${T("Intervalle en secondes")}" min="2" max="60" style="width:5rem" value="' + esc(D.intervalle || 6) + '">'
        + '<span class="dt">secondes.</span>'
        + '<button class="mini" id="pr-interv-enr">${T("Enregistrer")}</button></div></div>';
    }

    h += '<div class="carte">';
    if (!rows.length) {
      h += '<div class="vide">' + (Q ? '${T("Rien ne correspond.")}'
        : ONGLET === 'offres' ? '${T("Aucune offre. Créez la première.")}' : '${T("Aucune annonce. Créez la première.")}') + '</div>';
    } else if (ONGLET === 'offres') {
      h += '<table><thead><tr><th>${T("Nom")}</th><th>${T("Rabais")}</th><th>${T("Portée")}</th><th>${T("Période")}</th>'
        + '<th>${T("État")}</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + rows.map(function(o){
            return '<tr><td><strong>' + esc(o.nom) + '</strong></td>'
              + '<td style="font-weight:700;color:var(--tx-or)">' + esc(o.rabais) + '</td>'
              + '<td class="dt">' + esc(o.portee) + '</td>'
              + '<td class="dt">' + (o.debut ? esc(jour(o.debut)) : '—')
              + (o.fin ? ' → ' + esc(jour(o.fin)) : '') + '</td>'
              + '<td><span class="pill ' + (o.enCours ? 'bon' : 'neutre') + '">'
              + (o.enCours ? '${T("En cours")}' : '${T("Hors service")}') + '</span></td>'
              + (D.peutModifier ? '<td class="fin">' + gestes(o) + '</td>' : '') + '</tr>';
          }).join('')
        + '</tbody></table>';
    } else {
      h += '<table><thead><tr><th>${T("Nom")}</th><th>${T("Genre")}</th><th>${T("Contenu")}</th><th>${T("Priorité")}</th>'
        + '<th>${T("Période")}</th><th>${T("État")}</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + rows.map(function(a){
            return '<tr><td><strong>' + esc(a.nom) + '</strong>'
              + (a.expireAuto ? '<div class="dt">${T("expire après")} ' + a.expireJours + ' ${T("j par produit")}</div>' : '') + '</td>'
              + '<td><span class="pill neutre">' + (a.genre === 'announcement' ? '${T("Bandeau")}' : '${T("Badge")}') + '</span></td>'
              + '<td class="dt" style="max-width:18rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'
              + esc(a.genre === 'announcement' ? a.message : a.badge) + '</td>'
              + '<td>' + a.priorite + '</td>'
              + '<td class="dt">' + (a.debut ? esc(jour(a.debut)) : '—')
              + (a.fin ? ' → ' + esc(jour(a.fin)) : '') + '</td>'
              + '<td><span class="pill ' + (a.enCours ? 'bon' : 'neutre') + '">'
              + (a.enCours ? '${T("En cours")}' : '${T("Hors service")}') + '</span></td>'
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
    return '<button class="mini geste" data-modifier="' + esc(x.id) + '">${T("Modifier")}</button> '
      + '<button class="mini geste" data-basculer="' + esc(x.id) + '">'
      + (x.actif ? '${T("Désactiver")}' : '${T("Activer")}') + '</button> '
      + '<button class="mini geste danger" data-suppr="' + esc(x.id) + '">'
      + (SUPPR_ARME === x.id ? '${T("Confirmer ?")}' : '${T("Supprimer")}') + '</button>';
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
    libelle: '${T("Une saisie")}',
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
        dire('${T("Défilement réglé à ")}' + r.intervalle + '${T(" secondes.")}', 'bon');
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
          dire('${T("Offre « ")}' + r.nom + '${T(" » ")}' + (r.creation ? '${T("créée.")}' : '${T("mise à jour.")}'), 'bon');
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
          dire('« ' + r.nom + '${T(" » ")}' + (r.creation ? '${T("créée.")}' : '${T("mise à jour.")}'), 'bon');
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
        dire('« ' + (r.nom || '') + '${T(" » ")}' + (r.actif ? '${T("activée.")}' : '${T("désactivée.")}'), 'bon');
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
        dire('${T("Cliquez « Confirmer ? » pour supprimer — la bannière de la boutique sera retirée avec.")}', 'att');
        return;
      }
      SUPPR_ARME = '';
      appeler('promos:supprimer', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire('« ' + (r.nom || '') + ' ${T("» supprimée.")}', 'bon');
        charger();
      });
      return;
    }
    if (SUPPR_ARME) { SUPPR_ARME = ''; dessiner(); }
  });

  function charger(){
    appeler(ONGLET === 'offres' ? 'offres:liste' : 'annonces:liste', []).then(function(r){
      if (!r || !r.ok) { vide('${T("Promotions indisponibles")}', expliquer(r)); return; }
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
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
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
