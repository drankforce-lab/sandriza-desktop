'use strict';

/*
 * FENÊTRE « IMPORT DE PRODUITS FOURNISSEURS » — NATIVE (8.33.0, sa demande du 2026-11-17)
 * =============================================================================
 * « On choisit un site de nos fournisseurs ; selon le nom du produit, le module fait
 *   une recherche sur le site. Nous, on n'a qu'à sélectionner la catégorie. Il
 *   récupère les informations et fait des fiches produit ; si on les valide en
 *   complétant ce qui manque, on enregistre une copie des photos dans notre
 *   photothèque, liée au produit, et on décide de le mettre en ligne ou non. »
 *
 * LE PARCOURS
 *   1. on choisit le FOURNISSEUR (son site et sa famille sont réglés dans sa fiche) et
 *      la CATÉGORIE (seulement celles de sa famille) ;
 *   2. on tape un ou plusieurs NOMS (un par ligne) → « Chercher » : la coquille fouille
 *      le site (src/import-fournisseur.js) ; un résultat net devient une fiche « à
 *      vérifier », plusieurs résultats proches demandent de CHOISIR, aucun le DIT ;
 *   3. dans le volet de droite : les photos à garder (la première est la principale),
 *      la catégorie, la mise en ligne, et ce qui reste à compléter ;
 *   4. « Compléter et créer le produit » ouvre la FICHE PRODUIT préremplie : c'est elle
 *      qui exige le poids, le stock, les emplacements… et qui enregistre. La photothèque
 *      reçoit alors sa copie des photos, liée au produit.
 *
 * ⚠ LA FENÊTRE NE DÉCIDE RIEN : la lecture du site est dans la coquille, la traduction
 *   vers nos tailles et couleurs et la liste des fiches sont dans le site
 *   (assets/js/importfournisseur.js, ops import:*).
 * ⚠ LISTES EN PAGES MESURÉES (data-pages), jamais de glissière.
 * ⚠ AUCUN CARACTÈRE accent grave NI ANTISLASH dans la portion de script.
 * ⚠ LES IMAGES DU FOURNISSEUR s'affichent par leur adresse, sans référent
 *   (referrerpolicy=no-referrer) ; ses TEXTES passent tous par esc().
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
const T = require('../langue').tr('import');

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
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow:hidden;display:flex;flex-direction:column;gap:.6rem}
button,select,input,textarea{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px}
button{padding:.3rem .65rem;cursor:pointer}
select,input{padding:.25rem .45rem}
textarea{padding:.4rem .5rem;resize:none;width:100%}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button:focus,select:focus,input:focus,textarea:focus{outline:none;border-color:var(--or)}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
button.danger{color:var(--tx-err)}
.outils{flex:0 0 auto;display:flex;gap:.7rem;flex-wrap:wrap;align-items:center;font-size:.82rem}
.outils label{display:flex;align-items:center;gap:.4rem;color:var(--tx2)}
.outils select{max-width:17rem}
.badge{display:inline-block;font-size:.68rem;font-weight:700;padding:.08rem .5rem;border-radius:99px;background:var(--v08);color:var(--tx2);white-space:nowrap}
.trio{flex:1 1 0;min-height:0;display:grid;grid-template-columns:19rem minmax(0,1fr) minmax(0,1.35fr);gap:.8rem;grid-template-rows:minmax(0,1fr)}
.col{display:flex;flex-direction:column;min-width:0;min-height:0;gap:.6rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:12px;padding:.7rem .8rem;display:flex;flex-direction:column;gap:.45rem;min-height:0}
.carte.pleine{flex:1 1 0}
.carte h2{margin:0;font:700 .8rem/1.3 system-ui;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em}
.aide{font-size:.75rem;color:var(--tx2);line-height:1.45}
.avance{font-size:.78rem;color:var(--tx2);min-height:1.2em}
.filtres{display:flex;gap:.25rem;flex-wrap:wrap}
.filtres button{background:transparent;border:1px solid transparent;color:var(--tx2);padding:.2rem .55rem;font-size:.76rem;font-weight:600}
.filtres button.actif{border-color:var(--or);color:var(--tx)}
.liste{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:.3rem;overflow:hidden}
.fi{display:grid;grid-template-columns:2.6rem minmax(0,1fr) auto;gap:.55rem;align-items:center;padding:.35rem .4rem;border:1px solid transparent;border-radius:9px;cursor:pointer}
.fi:hover{background:var(--v05)}
.fi.sel{border-color:var(--or);background:var(--v05)}
.fi .vg{width:2.6rem;height:2.6rem;border-radius:7px;background:var(--v08);object-fit:cover;display:block}
.fi .t{min-width:0}
.fi .t b{display:block;font-size:.8rem;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fi .t small{display:block;font-size:.7rem;color:var(--tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pill{display:inline-block;font-size:.64rem;font-weight:700;padding:.06rem .45rem;border-radius:99px;white-space:nowrap}
.pill.a_verifier{background:rgba(212,175,55,.16);color:var(--tx-att)}
.pill.plusieurs{background:rgba(96,165,250,.16);color:var(--tx-info,#93c5fd)}
.pill.introuvable,.pill.erreur{background:rgba(239,68,68,.16);color:var(--tx-err2)}
.pill.creee{background:rgba(34,197,94,.16);color:var(--tx-ok)}
html.jour .pill.a_verifier{color:#7a5a00}
html.jour .pill.plusieurs{color:#1e4f8f}
html.jour .pill.introuvable,html.jour .pill.erreur{color:#7a2e2e}
html.jour .pill.creee{color:#1d5e33}
html.jour .badge{color:#2f3845;background:rgba(0,0,0,.07)}
.detail{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:.55rem;overflow:hidden}
.d-tete{display:flex;gap:.6rem;align-items:flex-start}
.d-tete input{flex:1 1 auto;font-weight:650}
.d-src{font-size:.72rem;color:var(--tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.galerie{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:.4rem}
.ph{position:relative;aspect-ratio:3/4;border-radius:8px;overflow:hidden;border:2px solid transparent;background:var(--v08);cursor:pointer;padding:0}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
.ph.on{border-color:var(--or)}
.ph .n{position:absolute;top:.2rem;left:.2rem;min-width:1.25rem;height:1.25rem;border-radius:99px;background:var(--or);color:#1a1208;font:700 .68rem/1.25rem system-ui;text-align:center;padding:0 .25rem}
.ph:not(.on) img{opacity:.45}
.lignes{display:grid;grid-template-columns:8.5rem minmax(0,1fr);gap:.25rem .8rem;font-size:.8rem}
.lignes .k{color:var(--tx2)}
.lignes .v{min-width:0;overflow:hidden;text-overflow:ellipsis}
.jet{display:inline-block;font-size:.7rem;padding:.04rem .4rem;border-radius:6px;background:var(--v08);margin:0 .2rem .15rem 0}
.jet.inc{background:rgba(245,158,11,.16);color:var(--tx-att)}
html.jour .jet.inc{color:#7a5a00}
.desc{font-size:.76rem;color:var(--tx2);line-height:1.45;white-space:pre-line;overflow:hidden;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical}
.manque{display:flex;flex-wrap:wrap;gap:.3rem}
.manque span{font-size:.7rem;padding:.08rem .45rem;border-radius:99px;border:1px solid var(--v16);color:var(--tx2)}
.cands{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.5rem}
.cand{display:flex;flex-direction:column;gap:.25rem;padding:.4rem;border:1px solid var(--v10);border-radius:10px;cursor:pointer;text-align:left;background:var(--v03,transparent)}
.cand:hover{border-color:var(--or)}
.cand img,.cand .vide-img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:7px;background:var(--v08);display:block}
.cand b{font-size:.74rem;font-weight:650;line-height:1.3;max-height:2.6em;overflow:hidden}
.cand small{font-size:.68rem;color:var(--tx2)}
.actions-d{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:auto}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (max-width:1240px){.trio{grid-template-columns:17rem minmax(0,1fr) minmax(0,1.2fr)}.galerie{grid-template-columns:repeat(4,minmax(0,1fr))}.cands{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page de la fenêtre. */
function pageImport() {
  return `${TETE()}
<title>${T("Import de produits fournisseurs — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.suppliers}</span><h1>${T("Import de produits fournisseurs")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var CTX = null, FID = '', CAT = '', EN_LIGNE = false, FICHES = [], SEL = '', FILTRE = 'attente';
  var OCCUPE = false, ARRET = false, NOMS = '';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  var MOTIFS = {
    session:           '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:             '${T("Votre rôle ne permet pas d’ajouter des produits.")}',
    indisponible:      '${T("Le module d’import n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}',
    pont:              '${T("L’application n’a pas répondu.")}',
    delai:             '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue:'${T("Cette version de l’application ne connaît pas cette opération : mettez-la à jour.")}',
    nuage:             '${T("La base n’a pas confirmé l’enregistrement : réessayez.")}',
    liste_pleine:      '${T("500 fiches d’import en attente : retirez celles qui ne servent plus.")}',
    introuvable:       '${T("Cette fiche n’existe plus.")}',
    deja_creee:        '${T("Ce produit a déjà été créé depuis cette fiche.")}',
    fournisseur_introuvable: '${T("Fournisseur introuvable.")}',
    fournisseur_sans_site:   '${T("Ce fournisseur n’a pas de site configuré.")}',
    categorie_invalide:      '${T("Catégorie inconnue.")}',
    categorie_hors_famille:  '${T("Cette catégorie ne correspond pas à ce que vend ce fournisseur.")}',
    import_sans_fiche:       '${T("Choisissez d’abord le bon produit parmi les résultats.")}',
    import_sans_categorie:   '${T("Choisissez d’abord la catégorie.")}',
    photos_trop:             '${T("Cinq photos au plus.")}',
    site_invalide:     '${T("L’adresse du site du fournisseur est invalide.")}',
    recherche_invalide:'${T("L’adresse de recherche du fournisseur est invalide.")}',
    site_injoignable:  '${T("Le site du fournisseur ne répond pas.")}',
    page_illisible:    '${T("La page du produit n’a pas pu être lue.")}',
    adresse:           '${T("Adresse refusée (locale ou invalide).")}',
    hors_site:         '${T("Ce lien sort du site du fournisseur.")}',
    nom_requis:        '${T("Nom trop court.")}',
    echec:             '${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').'); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(){ return { ok: false, motif: 'echec' }; });
  }
  var STATUT = { a_verifier: '${T("À vérifier")}', plusieurs: '${T("À choisir")}', introuvable: '${T("Introuvable")}', erreur: '${T("Erreur")}', creee: '${T("Créée")}' };
  var MANQUE = { categorie: '${T("catégorie")}', nom: '${T("nom")}', photo: '${T("photo")}', cout: '${T("coût")}', prix: '${T("prix")}',
    tailles: '${T("tailles")}', couleurs: '${T("couleurs")}', poids: '${T("poids")}', stock: '${T("stock")}' };
  function fournisseur(){ return (CTX && CTX.fournisseurs || []).filter(function(f){ return f.id === FID; })[0] || null; }
  function familleLib(cle){ var l = ''; (CTX.familles || []).forEach(function(f){ if (f.cle === cle) l = f.libelle; }); return l; }
  function categories(){
    var f = fournisseur(); if (!f || !f.configure) return [];
    return (CTX.categories || []).filter(function(c){ return f.type === 'mixte' || c.famille === f.type; });
  }
  function catLib(cle){ var l = ''; (CTX.categories || []).forEach(function(c){ if (c.cle === cle) l = c.libelle; }); return l; }
  function argent(n){ return (n == null) ? '—' : szArgent(n); }
  function img(u, cl){ return u ? '<img class="' + (cl || '') + '" src="' + esc(u) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '<span class="' + (cl || '') + ' vide-img"></span>'; }
  function fiche(id){ return FICHES.filter(function(x){ return x.id === id; })[0] || null; }

  /* ══ LE DESSIN ═════════════════════════════════════════════════════════ */
  function dessiner(){
    var f = fournisseur();
    var fs = (CTX.fournisseurs || []);
    var h = '<div class="outils">'
      + '<label>${T("Fournisseur")} <select id="o-fourn">'
      + (fs.length ? '' : '<option value="">${T("Aucun fournisseur")}</option>')
      + fs.map(function(x){ return '<option value="' + esc(x.id) + '"' + (x.id === FID ? ' selected' : '') + '>' + esc(x.nom) + (x.configure ? '' : ' — ${T("site à configurer")}') + '</option>'; }).join('')
      + '</select></label>'
      + (f && f.configure ? '<span class="badge" title="' + esc(f.site) + '">' + esc(familleLib(f.type)) + '</span>' : '')
      + (f && CTX.peutConfigurer ? '<button type="button" data-a="config">' + (f.configure ? '${T("Réglages du fournisseur")}' : '${T("Configurer son site")}') + '</button>' : '')
      + '<label>${T("Catégorie")} <select id="o-cat"><option value="">${T("Choisir…")}</option>'
      + categories().map(function(c){ return '<option value="' + esc(c.cle) + '"' + (c.cle === CAT ? ' selected' : '') + '>' + esc(c.libelle) + '</option>'; }).join('')
      + '</select></label>'
      + '<label title="${T("Le produit est mis en vente dès qu’il est créé ; sinon il reste retiré de la vente.")}"><input type="checkbox" id="o-ligne"' + (EN_LIGNE ? ' checked' : '') + '> ${T("Mettre en ligne à la création")}</label>'
      + '</div>';
    h += '<div class="trio"><div class="col">' + vueChercher(f) + '</div><div class="col">' + vueListe() + '</div><div class="col">' + vueDetail() + '</div></div>';
    corps.innerHTML = h;
    var ta = document.getElementById('o-noms'); if (ta) ta.value = NOMS;
    majSous();
  }
  function majSous(){
    var att = FICHES.filter(function(x){ return x.statut !== 'creee'; }).length;
    document.getElementById('sous').textContent = '${T("{0} fiches en attente")}'.replace('{0}', String(att));
  }

  function vueChercher(f){
    var pret = !!(f && f.configure && CAT && CTX.peutCreer);
    var h = '<div class="carte pleine"><h2>${T("Chercher chez le fournisseur")}</h2>';
    if (!f) return h + '<div class="vide">${T("Ajoutez d’abord un fournisseur (Catalogue › Fournisseurs).")}</div></div>';
    if (!f.configure) return h + '<div class="aide">${T("Ce fournisseur n’a pas de site configuré. Ouvrez ses réglages, étape « Import de produits » : l’adresse de son catalogue et ce qu’il vend (vêtements, accessoires…).")}</div></div>';
    h += '<label class="aide" for="o-noms">${T("Noms des produits, un par ligne (25 au plus). Le nom ou la référence du fournisseur.")}</label>'
      + '<textarea id="o-noms" rows="9" placeholder="${T("Robe Mila fleurie")}"' + (OCCUPE ? ' disabled' : '') + '></textarea>'
      + (OCCUPE ? '<button type="button" data-a="arreter">${T("Arrêter après celui-ci")}</button>'
        : '<button type="button" class="prim" data-a="chercher"' + (pret ? '' : ' disabled') + '>${T("Chercher")}</button>')
      + '<div class="avance" id="avance"></div>'
      + (CAT ? '' : '<div class="aide">${T("Choisissez la catégorie : elle sera celle de toutes les fiches de cette recherche (modifiable ensuite, fiche par fiche).")}</div>')
      + '<div class="aide">${T("Un résultat net devient une fiche « À vérifier » ; plusieurs résultats proches vous laissent choisir. Rien n’est mis en vente sans passer par la fiche produit.")}</div>'
      + '</div>';
    return h;
  }

  function filtrees(){
    return FICHES.filter(function(x){
      if (FILTRE === 'attente') return x.statut !== 'creee';
      if (FILTRE === 'creees') return x.statut === 'creee';
      return true;
    });
  }
  function vueListe(){
    var l = filtrees();
    var h = '<div class="carte pleine"><h2>${T("Fiches importées")}</h2><div class="filtres">'
      + [['attente', '${T("En attente")}'], ['creees', '${T("Créées")}'], ['toutes', '${T("Toutes")}']].map(function(x){
          return '<button type="button" data-filtre="' + x[0] + '" class="' + (FILTRE === x[0] ? 'actif' : '') + '">' + x[1] + '</button>'; }).join('')
      + '</div>';
    if (!l.length) return h + '<div class="vide">' + (FILTRE === 'creees' ? '${T("Aucun produit créé depuis un import.")}' : '${T("Aucune fiche : lancez une recherche.")}') + '</div></div>';
    h += '<div class="liste" data-pages="import-fiches">' + l.map(function(x){
      var fi = x.fiche || {};
      var vg = (fi.photos && fi.photos[0]) || (fi.images && fi.images[0]) || ((x.candidats || [])[0] || {}).image || '';
      var sous = [x.fournisseurNom, catLib(x.categorie) || '${T("sans catégorie")}'].filter(Boolean).join(' · ');
      return '<div class="fi' + (x.id === SEL ? ' sel' : '') + '" data-id="' + esc(x.id) + '" tabindex="0">' + img(vg, 'vg')
        + '<span class="t"><b>' + esc(fi.nom || x.recherche) + '</b><small>' + esc(sous) + '</small></span>'
        + '<span class="pill ' + esc(x.statut) + '">' + STATUT[x.statut] + '</span></div>';
    }).join('') + '</div></div>';
    return h;
  }

  function vueDetail(){
    var x = fiche(SEL);
    var h = '<div class="carte pleine"><div class="detail">';
    if (!x) return h + '<div class="vide">${T("Choisissez une fiche dans la liste.")}</div></div></div>';
    var fi = x.fiche || {};
    if (x.statut === 'creee') {
      h += '<h2>${T("Produit créé")}</h2><div class="lignes">'
        + '<span class="k">${T("Produit")}</span><span class="v">' + esc(x.produitNom) + '</span>'
        + '<span class="k">${T("Photothèque")}</span><span class="v">' + '${T("{0} photos copiées, liées au produit")}'.replace('{0}', String(x.photosCopiees || 0)) + '</span>'
        + '<span class="k">${T("Fournisseur")}</span><span class="v">' + esc(x.fournisseurNom) + '</span></div>'
        + '<div class="actions-d"><button type="button" class="prim" data-a="ouvrirProduit">${T("Ouvrir le produit")}</button>'
        + '<button type="button" data-a="retirer">${T("Retirer de la liste")}</button></div>';
      return h + '</div></div>';
    }
    if (x.statut === 'plusieurs') {
      h += '<h2>${T("Plusieurs produits correspondent")}</h2><div class="aide">' + '${T("Recherche : « {0} ». Choisissez le bon produit.")}'.replace('{0}', esc(x.recherche)) + '</div>'
        + '<div class="cands">' + (x.candidats || []).map(function(c, i){
            return '<button type="button" class="cand" data-cand="' + i + '">' + img(c.image) + '<b>' + esc(c.titre) + '</b><small>'
              + (c.prix != null ? esc(argent(c.prix)) + ' · ' : '') + Math.round((c.score || 0) * 100) + ' %</small></button>'; }).join('') + '</div>'
        + '<div class="actions-d"><button type="button" data-a="retirer">${T("Retirer")}</button></div>';
      return h + '</div></div>';
    }
    if (x.statut === 'introuvable' || x.statut === 'erreur') {
      h += '<h2>' + (x.statut === 'erreur' ? '${T("La recherche a échoué")}' : '${T("Aucun produit trouvé")}') + '</h2>'
        + '<div class="aide">' + '${T("Recherche : « {0} ».")}'.replace('{0}', esc(x.recherche)) + (x.motif ? ' ' + esc(expliquer({ motif: x.motif })) : '') + '</div>'
        + '<label class="aide" for="d-autre">${T("Chercher autrement (un autre nom, la référence du fournisseur) :")}</label>'
        + '<input id="d-autre" value="' + esc(x.recherche) + '">'
        + '<div class="actions-d"><button type="button" class="prim" data-a="rechercher"' + (OCCUPE ? ' disabled' : '') + '>${T("Chercher de nouveau")}</button>'
        + '<button type="button" data-a="retirer">${T("Retirer")}</button></div>';
      return h + '</div></div>';
    }
    // À vérifier
    var photos = fi.photos || [];
    var cats = (function(){ var f = (CTX.fournisseurs || []).filter(function(y){ return y.id === x.fournisseurId; })[0];
      return (CTX.categories || []).filter(function(c){ return !f || !f.type || f.type === 'mixte' || c.famille === f.type; }); })();
    h += '<div class="d-tete"><input id="d-nom" maxlength="160" value="' + esc(fi.nom) + '" aria-label="${T("Nom du produit")}"></div>'
      + '<div class="d-src" title="' + esc(fi.url) + '">' + esc(x.fournisseurNom) + (fi.ref ? ' · ${T("réf.")} ' + esc(fi.ref) : '') + ' · ' + esc(fi.url) + '</div>'
      + '<div class="aide">${T("Cliquez les photos à garder, dans l’ordre (1 = photo principale, 5 au plus).")}</div>'
      + '<div class="galerie">' + (fi.images || []).slice(0, 12).map(function(u){
          var n = photos.indexOf(u);
          return '<button type="button" class="ph' + (n >= 0 ? ' on' : '') + '" data-ph="' + esc(u) + '" aria-pressed="' + (n >= 0) + '">' + img(u) + (n >= 0 ? '<span class="n">' + (n + 1) + '</span>' : '') + '</button>';
        }).join('') + '</div>'
      + '<div class="lignes">'
      + '<span class="k">${T("Catégorie")}</span><span class="v"><select id="d-cat" aria-label="${T("Catégorie")}"><option value="">${T("Choisir…")}</option>'
      + cats.map(function(c){ return '<option value="' + esc(c.cle) + '"' + (c.cle === x.categorie ? ' selected' : '') + '>' + esc(c.libelle) + '</option>'; }).join('') + '</select>'
      + ' <label style="margin-left:.6rem;color:var(--tx2)"><input type="checkbox" id="d-ligne"' + (x.enLigne ? ' checked' : '') + '> ${T("Mettre en ligne")}</label></span>'
      + '<span class="k">${T("Prix du fournisseur")}</span><span class="v">' + (fi.prixFournisseur != null ? esc(argent(fi.prixFournisseur)) + (fi.devise && fi.devise !== 'CAD' ? ' ' + esc(fi.devise) : '') : '—') + '</span>'
      + '<span class="k">${T("Coût / prix proposé")}</span><span class="v">' + esc(argent(fi.cout)) + ' → <b>' + esc(argent(fi.prix)) + '</b></span>'
      + '<span class="k">${T("Tailles")}</span><span class="v">' + jetons(fi.tailles, fi.taillesInconnues) + '</span>'
      + '<span class="k">${T("Couleurs")}</span><span class="v">' + jetons(fi.couleurs, fi.couleursInconnues) + '</span>'
      + '<span class="k">${T("Composition")}</span><span class="v">' + (fi.composition ? esc(fi.composition) + (fi.compositionSure ? '' : ' <span class="jet inc">${T("à vérifier")}</span>') : '—') + '</span>'
      + (fi.marque ? '<span class="k">${T("Marque")}</span><span class="v">' + esc(fi.marque) + '</span>' : '')
      + '</div>'
      + (fi.description ? '<div class="desc">' + esc(fi.description) + '</div>' : '')
      + '<div class="aide">${T("À compléter dans la fiche produit :")}</div><div class="manque">'
      + (x.manquants || []).map(function(m){ return '<span>' + (MANQUE[m] || esc(m)) + '</span>'; }).join('') + '</div>'
      + '<div class="actions-d"><button type="button" class="prim" data-a="creer"' + (CTX.peutCreer ? '' : ' disabled') + '>${T("Compléter et créer le produit")}</button>'
      + '<button type="button" data-a="retirer">${T("Retirer")}</button></div>';
    return h + '</div></div>';
  }
  function jetons(ok, inc){
    var h = (ok || []).map(function(t){ return '<span class="jet">' + esc(t) + '</span>'; }).join('')
      + (inc || []).map(function(t){ return '<span class="jet inc" title="${T("Absente de votre référentiel")}">' + esc(t) + ' ?</span>'; }).join('');
    return h || '—';
  }

  /* ══ LES DONNÉES ═══════════════════════════════════════════════════════ */
  function charger(){
    appeler('import:contexte').then(function(c){
      if (!c || !c.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(c)) + '</div>'; dire(expliquer(c), 'err'); return; }
      CTX = c;
      if (!FID || !fournisseur()) { var pf = (c.fournisseurs || []).filter(function(f){ return f.configure; })[0] || (c.fournisseurs || [])[0]; FID = pf ? pf.id : ''; }
      if (CAT && !categories().some(function(x){ return x.cle === CAT; })) CAT = '';
      chargerFiches();
    });
  }
  function chargerFiches(){
    return appeler('import:fiches', ['']).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      FICHES = r.fiches || [];
      if (SEL && !fiche(SEL)) SEL = '';
      // à l ouverture, la première fiche de la liste montrée est déjà choisie : le volet de droite n est jamais vide pour rien
      if (!SEL) { var p0 = filtrees()[0]; if (p0) SEL = p0.id; }
      garderNoms(); dessiner();
    });
  }
  function garderNoms(){ var ta = document.getElementById('o-noms'); if (ta) NOMS = ta.value; }
  function remplacer(x){
    var i = -1; FICHES.forEach(function(y, k){ if (y.id === x.id) i = k; });
    if (i >= 0) FICHES[i] = x; else FICHES.unshift(x);
  }
  function avance(t){ var a = document.getElementById('avance'); if (a) a.textContent = t || ''; }

  /* ══ CHERCHER : un nom après l autre (le site du fournisseur n est pas pressé) ══ */
  function decider(cands){
    if (!cands.length) return null;
    var a = cands[0], b = cands[1];
    if (a.score >= 0.75 && (!b || b.score <= a.score - 0.08)) return a;
    return null;
  }
  function chercherUn(f, nom, idExistant){
    return P.importFournisseur.chercher({ site: f.site, recherche: f.recherche, nom: nom }).then(function(r){
      var base = { id: idExistant || '', fournisseurId: f.id, recherche: nom, categorie: CAT || (fiche(idExistant) || {}).categorie || '', enLigne: EN_LIGNE };
      if (!r || !r.ok) return appeler('import:preparer', [Object.assign(base, { statut: 'erreur', motif: (r && r.motif) || 'echec' })]);
      var cands = r.candidats || [];
      if (!cands.length) return appeler('import:preparer', [Object.assign(base, { statut: 'introuvable', candidats: [] })]);
      var net = decider(cands);
      var liste = cands.map(function(c){ return { url: c.url, titre: c.titre, image: c.image, prix: c.prix, score: c.score }; });
      if (!net) return appeler('import:preparer', [Object.assign(base, { statut: 'plusieurs', candidats: liste })]);
      return lireFiche(f, net).then(function(e){
        if (!e.ok) return appeler('import:preparer', [Object.assign(base, { statut: 'erreur', motif: e.motif, candidats: liste })]);
        return appeler('import:preparer', [Object.assign(base, { brut: e.fiche, candidats: liste })]);
      });
    });
  }
  function lireFiche(f, c){
    if (c.brut) return Promise.resolve({ ok: true, fiche: c.brut });
    return P.importFournisseur.extraire({ url: c.url, site: f.site });
  }
  function chercher(){
    var f = fournisseur();
    if (!f || !f.configure || !CAT || OCCUPE) return;
    if (!P.importFournisseur) { dire('${T("Cette version de l’application ne sait pas lire un site : mettez-la à jour.")}', 'err'); return; }
    var ta = document.getElementById('o-noms');
    var noms = String(ta ? ta.value : '').split(String.fromCharCode(10)).map(function(s){ return s.trim(); }).filter(function(s){ return s.length >= 2; });
    var vus = {}; noms = noms.filter(function(n){ var k = n.toLowerCase(); if (vus[k]) return false; vus[k] = 1; return true; });
    if (!noms.length) { dire('${T("Tapez au moins un nom de produit.")}', 'att'); return; }
    if (noms.length > 25) { dire('${T("25 noms au plus par recherche.")}', 'att'); return; }
    NOMS = ta.value; OCCUPE = true; ARRET = false; dessiner();
    var i = 0, nets = 0, choix = 0, rates = 0;
    function suivant(){
      if (ARRET || i >= noms.length) {
        OCCUPE = false;
        if (!ARRET) NOMS = '';
        dessiner();
        dire('${T("Recherche terminée : {0} à vérifier, {1} à choisir, {2} sans résultat.")}'.replace('{0}', nets).replace('{1}', choix).replace('{2}', rates), rates ? 'att' : 'bon');
        return;
      }
      var nom = noms[i++];
      avance('${T("{0} sur {1} — {2}…")}'.replace('{0}', i).replace('{1}', noms.length).replace('{2}', nom));
      chercherUn(f, nom, '').then(function(r){
        if (r && r.ok && r.fiche) {
          remplacer(r.fiche); if (!SEL) SEL = r.fiche.id;
          if (r.fiche.statut === 'a_verifier') nets++; else if (r.fiche.statut === 'plusieurs') choix++; else rates++;
        } else { rates++; dire(expliquer(r), 'err'); }
        garderNoms(); var av = (document.getElementById('avance') || {}).textContent; dessiner(); avance(av);
        suivant();
      }, function(){ rates++; suivant(); });
    }
    suivant();
  }
  function rechercher(){
    var x = fiche(SEL); if (!x || OCCUPE) return;
    var f = (CTX.fournisseurs || []).filter(function(y){ return y.id === x.fournisseurId; })[0];
    if (!f || !f.configure) { dire(MOTIFS.fournisseur_sans_site, 'err'); return; }
    var nom = String((document.getElementById('d-autre') || {}).value || '').trim();
    if (nom.length < 2) { dire(MOTIFS.nom_requis, 'att'); return; }
    OCCUPE = true; dire('${T("Recherche…")}');
    chercherUn(f, nom, x.id).then(function(r){
      OCCUPE = false;
      if (r && r.ok && r.fiche) { remplacer(r.fiche); dire(''); } else dire(expliquer(r), 'err');
      dessiner();
    });
  }
  function choisirCandidat(i){
    var x = fiche(SEL); if (!x || OCCUPE) return;
    var c = (x.candidats || [])[i]; if (!c) return;
    var f = (CTX.fournisseurs || []).filter(function(y){ return y.id === x.fournisseurId; })[0];
    if (!f) return;
    OCCUPE = true; dire('${T("Lecture de la fiche du fournisseur…")}');
    P.importFournisseur.extraire({ url: c.url, site: f.site }).then(function(e){
      if (!e || !e.ok) { OCCUPE = false; dire(expliquer(e), 'err'); return; }
      return appeler('import:preparer', [{ id: x.id, fournisseurId: x.fournisseurId, recherche: x.recherche, brut: e.fiche, candidats: x.candidats }]).then(function(r){
        OCCUPE = false;
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        remplacer(r.fiche); dire(''); dessiner();
      });
    });
  }
  function modifier(ch){
    var x = fiche(SEL); if (!x) return Promise.resolve();
    return appeler('import:modifier', [x.id, ch]).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
      remplacer(r.fiche); garderNoms(); dessiner();
    });
  }
  function basculerPhoto(u){
    var x = fiche(SEL); if (!x || !x.fiche) return;
    var l = (x.fiche.photos || []).slice();
    var i = l.indexOf(u);
    if (i >= 0) l.splice(i, 1);
    else { if (l.length >= 5) { dire(MOTIFS.photos_trop, 'att'); return; } l.push(u); }
    x.fiche.photos = l; dessiner();   // tout de suite à l écran ; le nuage suit
    modifier({ photos: l });
  }
  function retirer(){
    var x = fiche(SEL); if (!x) return;
    szConfirmer({ titre: '${T("Retirer la fiche d’import")}',
      texte: x.statut === 'creee' ? '${T("La fiche quitte la liste. Le produit créé et ses photos ne bougent pas.")}' : '${T("La fiche et ce qui a été lu chez le fournisseur sont retirés. Rien n’a été créé.")}',
      oui: '${T("Retirer")}' }).then(function(ok){
      if (!ok) return;
      appeler('import:retirer', [x.id]).then(function(r){
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        FICHES = FICHES.filter(function(y){ return y.id !== x.id; }); SEL = ''; garderNoms(); dessiner();
      });
    });
  }
  function creer(){
    var x = fiche(SEL); if (!x) return;
    if (!x.categorie) { dire(MOTIFS.import_sans_categorie, 'att'); var dc = document.getElementById('d-cat'); if (dc) dc.focus(); return; }
    if (!(x.fiche && x.fiche.photos && x.fiche.photos.length)) { dire('${T("Gardez au moins une photo (la photo principale est obligatoire).")}', 'att'); return; }
    var nom = String((document.getElementById('d-nom') || {}).value || '').trim();
    var avant = (nom && nom !== x.fiche.nom) ? modifier({ nom: nom }) : Promise.resolve();
    avant.then(function(){
      appeler('import:ouvrir', [x.id]).then(function(r){
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        dire('${T("Fiche produit ouverte : complétez-la puis enregistrez. Cette liste se met à jour au retour.")}', 'bon');
      });
    });
  }

  /* ══ LES GESTES ════════════════════════════════════════════════════════ */
  corps.onclick = function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var fl = t.closest('[data-filtre]'); if (fl) { FILTRE = fl.getAttribute('data-filtre'); garderNoms(); dessiner(); return; }
    var li = t.closest('.fi[data-id]'); if (li) { SEL = li.getAttribute('data-id'); garderNoms(); dessiner(); return; }
    var ph = t.closest('[data-ph]'); if (ph) { basculerPhoto(ph.getAttribute('data-ph')); return; }
    var cd = t.closest('[data-cand]'); if (cd) { choisirCandidat(parseInt(cd.getAttribute('data-cand'), 10) || 0); return; }
    var a = t.closest('[data-a]'); if (!a || a.disabled) return;
    var k = a.getAttribute('data-a');
    if (k === 'chercher') chercher();
    else if (k === 'arreter') { ARRET = true; dire('${T("Arrêt après le produit en cours…")}', 'att'); }
    else if (k === 'rechercher') rechercher();
    else if (k === 'retirer') retirer();
    else if (k === 'creer') creer();
    else if (k === 'config') appeler('import:ouvrirFournisseur', [FID]).then(function(r){ if (!r || !r.ok) dire(expliquer(r), 'err'); else dire('${T("Réglez le site à l’étape « Import de produits », enregistrez : cette fenêtre se met à jour au retour.")}'); });
    else if (k === 'ouvrirProduit') { var x = fiche(SEL); if (x) appeler('produits:ouvrir', [x.produitId]).then(function(r){ if (!r || !r.ok) dire(expliquer(r), 'err'); }); }
  };
  corps.addEventListener('keydown', function(ev){
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var li = ev.target && ev.target.closest && ev.target.closest('.fi[data-id]');
    if (li) { ev.preventDefault(); SEL = li.getAttribute('data-id'); garderNoms(); dessiner(); }
  });
  corps.addEventListener('change', function(ev){
    var t = ev.target; if (!t) return;
    if (t.id === 'o-fourn') { FID = t.value; CAT = ''; garderNoms(); dessiner(); }
    else if (t.id === 'o-cat') { CAT = t.value; garderNoms(); dessiner(); }
    else if (t.id === 'o-ligne') EN_LIGNE = !!t.checked;
    else if (t.id === 'd-cat') modifier({ categorie: t.value });
    else if (t.id === 'd-ligne') modifier({ enLigne: !!t.checked });
    else if (t.id === 'd-nom') { var v = String(t.value || '').trim(); if (v) modifier({ nom: v }); }
  });
  // Au retour (une fiche produit vient d être créée, un fournisseur réglé) : on relit.
  window.szRevenir = function(){ if (!OCCUPE) charger(); };
  window.addEventListener('focus', function(){ if (!OCCUPE && CTX) { garderNoms(); charger(); } });
  document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape' && !document.querySelector('.voile')) { ev.preventDefault(); P.fermer(); } });
  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageImport };
