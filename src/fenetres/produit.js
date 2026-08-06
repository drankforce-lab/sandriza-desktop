'use strict';

/*
 * ASSISTANT « PRODUIT » — NATIF, SEPT ÉTAPES
 * =============================================================================
 * La réécriture fidèle de l'éditeur de produit : identité, classement, tailles
 * et couleurs, prix et poids, photo, détails, stock. Écrit ici, aucune page du
 * site chargée, aucun appel web.
 *
 * ⚠ L'ENREGISTREMENT PASSE PAR `Admin._pfDoSave`, LA MÊME FONCTION QUE L'ÉDITEUR
 * DU SITE. Elle prend ses données en paramètre — elle ne lit pas le DOM — donc la
 * fenêtre native peut s'en servir telle quelle. C'est ce qui garantit que la
 * détection de conflit, le dépôt des images vers R2 et le ménage des images
 * orphelines se comportent EXACTEMENT pareil selon la fenêtre d'où l'on part.
 * Réécrire tout cela ici aurait créé une seconde façon d'enregistrer un produit,
 * qui aurait dérivé de la première au premier ajustement.
 *
 * ⚠ CE QUI N'EST PAS ICI, ET POURQUOI.
 * L'aperçu boutique de l'éditeur du site est la fiche RÉELLE, dessinée par les
 * feuilles de style de la boutique. Le reproduire ici en ferait une IMITATION —
 * et une imitation qui diverge est pire qu'aucun aperçu, parce qu'on y croit.
 * Même raison pour la génération d'images par intelligence artificielle et le
 * détourage : ils appellent des services que seul le site sait joindre, avec ses
 * clés. Une porte de plus vers eux depuis un document local n'apporterait qu'un
 * risque. Ces deux étapes du site deviennent ici une étape « Détails » et un
 * renvoi explicite vers l'éditeur de la fenêtre principale.
 *
 * ⚠ LE COIN DROIT DE L'EN-TÊTE EST RÉSERVÉ AU VERROU, et à rien d'autre.
 */

const { CSS_SOCLE, JS_SOCLE } = require('./socle');

const CSS_PROPRE = `
.jetons{display:flex;flex-wrap:wrap;gap:.35rem;align-content:flex-start;
  flex:1 1 auto;min-height:0;overflow:hidden}
.jeton{display:inline-flex;align-items:center;gap:.32rem;padding:.2rem .55rem;
  border:1px solid rgba(255,255,255,.16);border-radius:99px;font-size:.82rem;
  cursor:pointer;user-select:none;height:1.75rem}
.jeton.on{background:rgba(201,169,126,.18);border-color:#c9a97e;color:#f0e4d2}
.jeton .pt{width:10px;height:10px;border-radius:50%;border:1px solid rgba(255,255,255,.3);flex:0 0 auto}
.photo{display:flex;gap:.85rem;align-items:flex-start}
.photo .vign{flex:0 0 auto;width:140px;height:140px;border-radius:10px;
  border:1px dashed rgba(255,255,255,.18);display:flex;align-items:center;
  justify-content:center;color:#8fa1b8;font-size:.75rem;overflow:hidden;text-align:center}
.photo .vign img{width:100%;height:100%;object-fit:cover}
.photo .cmd{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:.45rem}
.vues{display:flex;flex-wrap:wrap;gap:.5rem;align-content:flex-start;overflow:hidden}
.vue{position:relative;width:88px;flex:0 0 auto}
.vue .cadre{width:88px;height:88px;border-radius:9px;border:1px dashed rgba(255,255,255,.18);
  display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;
  background:#0f1826;color:#8fa1b8;font-size:.68rem;text-align:center;padding:.2rem}
.vue .cadre.pleine{border-style:solid;border-color:rgba(255,255,255,.22)}
.vue img{width:100%;height:100%;object-fit:cover}
.vue .lgd{font-size:.68rem;color:#8fa1b8;text-align:center;margin-top:.18rem;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vue .x{position:absolute;top:2px;right:2px;width:18px;height:18px;padding:0;
  border-radius:50%;font-size:.7rem;line-height:1;background:rgba(14,21,34,.85)}
.paire{display:flex;gap:.4rem;align-items:center}
.paire input{flex:1 1 auto}
.paire select{flex:0 0 5rem}
.stk{width:100%;border-collapse:collapse}
.stk th{font-size:.69rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8;
  text-align:left;padding:.22rem .35rem;border-bottom:1px solid rgba(255,255,255,.1)}
.stk td{padding:.14rem .35rem;border-bottom:1px solid rgba(255,255,255,.05)}
.stk input,.stk select{padding:.18rem .35rem;font-size:.83rem}
.stk .q{width:5rem}
.bascules{display:flex;flex-direction:column;gap:.45rem}
`;

/** Page complète de l'assistant. `id` vide = création. */
function pageProduit(id) {
  const ident = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Produit — Administration Sandriza</title>
<style>${CSS_SOCLE}${CSS_PROPRE}</style></head><body>
<div class="tete"><span class="ic">🧵</span><h1 id="titre">Produit</h1>
  <span class="sous" id="sous"></span></div>
<div class="pas" id="pas"></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions">
    <button id="btn-prec">Précédent</button>
    <button id="btn-suiv">Suivant</button>
    <button id="btn-annuler">Annuler</button>
    <button id="btn-enr" class="prim" disabled>Enregistrer</button>
  </span></div>
<script>
(function(){
  'use strict';
  ${JS_SOCLE}
  MOTIFS.prix_invalide  = 'Le prix doit être supérieur à zéro.';
  MOTIFS.cout_requis    = 'Le coût d’acquisition est obligatoire.';
  MOTIFS.poids_requis   = 'Le poids unitaire est obligatoire.';
  MOTIFS.non_enregistre = 'La fiche n’a PAS été enregistrée. Voyez l’avis dans la fenêtre principale — le plus souvent, un collègue vient de modifier la même fiche.';

  var ID   = ${ident};
  var bEnr = document.getElementById('btn-enr');
  var sous = document.getElementById('sous');
  var CTX = null, FICHE = null, IMAGE = '', STOCK = {}, LOCS = {}, PAGI = null;
  // ⚠ CES DEUX-LA ETAIENT DEJA ENVOYES AU PONT MAIS JAMAIS REMPLIS : la fenetre
  // expediait deux objets vides, et modifier une fiche depuis l application lui
  // FAISAIT PERDRE ses photos par couleur. Un defaut qui ne se voit pas a
  // l enregistrement — il se decouvre plus tard, sur la boutique.
  var VUES = {};      // { 'vue-2': dataUrl | url, … }
  var PARCOUL = {};   // { 'Noir': { principale: dataUrl | url }, … }
  var VUES_NOMS = ['Dos', 'Détail', 'Porté', 'Autre'];

  function dire(t, genre){
    var m = document.getElementById('msg');
    m.textContent = t || ''; m.className = 'msg' + (genre ? ' ' + genre : '');
  }
  function vide(titre, detail){
    document.getElementById('corps').innerHTML =
      '<div class="vide"><div class="gros">' + esc(titre) + '</div><div>' + esc(detail || '') + '</div></div>';
    document.getElementById('pas').innerHTML = '';
    ['btn-enr','btn-prec','btn-suiv'].forEach(function(b){ document.getElementById(b).disabled = true; });
  }

  function ch(id, lbl, o){
    o = o || {};
    return '<div class="ch' + (o.large ? ' large' : '') + '">'
      + '<label for="' + id + '">' + esc(lbl) + (o.requis ? ' <span class="req">*</span>' : '') + '</label>'
      + (o.multi ? '<textarea id="' + id + '" rows="' + (o.rows || 4) + '"></textarea>'
                 : '<input id="' + id + '" type="' + (o.type || 'text') + '"'
                   + (o.pas ? ' step="' + o.pas + '"' : '') + (o.min !== undefined ? ' min="' + o.min + '"' : '')
                   + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') + '>')
      + '</div>';
  }
  function sel(id, lbl, opts, o){
    o = o || {};
    return '<div class="ch' + (o.large ? ' large' : '') + '">'
      + '<label for="' + id + '">' + esc(lbl) + (o.requis ? ' <span class="req">*</span>' : '') + '</label>'
      + '<select id="' + id + '">'
      + opts.map(function(x){ return '<option value="' + esc(x.v) + '">' + esc(x.l) + '</option>'; }).join('')
      + '</select></div>';
  }
  function bascule(id, lbl){
    return '<label style="display:flex;align-items:center;gap:.45rem;font-size:.86rem;cursor:pointer">'
      + '<input type="checkbox" id="' + id + '">' + esc(lbl) + '</label>';
  }
  var rien = [{ v: '', l: 'Non précisé' }];
  function opt(l, cV, cL){ return l.map(function(x){ return { v: x[cV], l: x[cL] }; }); }

  function dessiner(){
    var h = [];

    // 1 — Identité ET classement (fusionnées : elles décrivent la même chose,
    // et les séparer obligeait à un aller-retour pour une poignée de listes).
    h.push('<div class="etape">'
      + '<div class="carte"><h2>Identification</h2><div class="grille">'
      + ch('p-nom', 'Nom du produit', { requis: true, large: true, placeholder: 'Ex : Robe fleurie été' })
      + sel('p-cat', 'Catégorie', rien.concat(opt(CTX.categories, 'cle', 'libelle')), { requis: true })
      // ⚠ LE SKU EST VISIBLE, en lecture seule. Un code attribué « quelque part
      // plus tard » ne peut ni être lu, ni recopié sur une étiquette, ni
      // vérifié. Il se calcule dès que la catégorie est choisie.
      + '<div class="ch"><label for="p-sku">Code (SKU)</label>'
      + '<input id="p-sku" readonly style="font-family:ui-monospace,Consolas,monospace;'
      + 'background:#0b1220;color:#c9a97e" placeholder="choisissez une catégorie"></div>'
      + ch('p-marque', 'Marque')
      + '<div class="ch large"><label for="p-desc">Description'
      + '<span id="p-desc-etat" style="float:right;color:#8fa1b8;font-size:.72rem"></span></label>'
      + '<textarea id="p-desc" rows="3"></textarea>'
      // La redaction par IA passe par le PONT : la fenetre envoie la photo et les
      // renseignements, le SITE interroge le service avec sa cle. Rien ne sort
      // d ici, aucune cle ne voyage.
      + '<div style="margin-top:.35rem">'
      + '<button type="button" id="p-ia">✨ Rédiger avec l’IA</button></div></div>'
      + '</div></div>'
      + '<div class="carte"><h2>Classement</h2><div class="grille">'
      + sel('p-genre', 'Genre', rien.concat(opt(CTX.genres, 'cle', 'libelle')))
      + sel('p-age', 'Groupe d’âge', rien.concat(opt(CTX.groupesAge, 'cle', 'libelle')))
      + sel('p-style', 'Style', rien.concat(opt(CTX.styles, 'cle', 'libelle')))
      + sel('p-guide', 'Guide des tailles', rien.concat(opt(CTX.guides, 'id', 'nom')))
      + sel('p-etiq', 'Étiquette', [{ v: '', l: 'Aucune' }, { v: 'Populaire', l: 'Populaire' },
            { v: 'Solde', l: 'Solde' }].concat(opt(CTX.etiquettes, 'cle', 'libelle')))
      + sel('p-fourn', 'Fournisseur', rien.concat(opt(CTX.fournisseurs, 'id', 'nom')))
      + '</div></div></div>');

    // 3 — Tailles et couleurs
    h.push('<div class="etape">'
      + '<div class="carte"><h2>Tailles offertes</h2><div class="jetons" id="p-tailles">'
      + (CTX.tailles.length
          ? CTX.tailles.map(function(t){ return '<span class="jeton" data-t="' + esc(t) + '">' + esc(t) + '</span>'; }).join('')
          : '<span class="aide">Aucune taille au référentiel.</span>')
      + '</div></div>'
      + '<div class="carte plein"><h2>Couleurs offertes</h2>'
      // ⚠ UNE COULEUR HORS REFERENTIEL DOIT POUVOIR ETRE SAISIE. L editeur du site
      // le permet ; ne proposer que les jetons du referentiel bloquait net des
      // qu une nouveaute arrivait, sans autre issue que d aller la creer ailleurs.
      + '<div class="rech" style="margin-bottom:.5rem">'
      + '<input id="p-coul-libre" placeholder="Ajouter une couleur absente de la liste…">'
      + '<button type="button" id="p-coul-add">Ajouter</button></div>'
      + '<div class="jetons" id="p-couleurs">'
      + (CTX.couleurs.length
          ? CTX.couleurs.map(function(c){
              return '<span class="jeton" data-c="' + esc(c.nom) + '">'
                + '<span class="pt" style="background:' + esc(c.hex || '#888') + '"></span>' + esc(c.nom) + '</span>';
            }).join('')
          : '<span class="aide">Aucune couleur au référentiel.</span>')
      + '</div></div></div>');

    // 4 — Prix et poids
    h.push('<div class="etape"><div class="carte"><h2>Prix</h2><div class="grille">'
      + ch('p-prix', 'Prix de vente ($)', { requis: true, type: 'number', pas: '0.01', min: 0 })
      + ch('p-solde', 'Prix soldé ($)', { type: 'number', pas: '0.01', min: 0, placeholder: 'aucun' })
      + ch('p-cout', 'Coût d’acquisition ($)', { requis: true, type: 'number', pas: '0.01', min: 0 })
      + '</div>'
      + '<div id="p-rabais" style="display:flex;gap:.3rem;flex-wrap:wrap;align-items:center;margin-top:.55rem">'
      + '<span class="aide" style="margin-right:.2rem">Rabais rapide :</span></div>'
      + '<div class="aide" id="p-marge" style="margin-top:.5rem"></div>'
      + '<div id="p-alerte" style="display:none;color:#f87171;font-size:.78rem;margin-top:.4rem"></div></div>'
      + '<div class="carte"><h2>Poids unitaire</h2><div class="grille">'
      + '<div class="ch"><label for="p-poids">Poids <span class="req">*</span></label>'
      + '<div class="paire"><input id="p-poids" type="number" step="0.001" min="0">'
      + '<select id="p-unite"><option value="g">g</option><option value="kg">kg</option>'
      + '<option value="lb">lb</option></select></div></div></div>'
      + '<div class="aide" style="margin-top:.5rem">Le poids sert au calcul des frais d’expédition. '
      + 'Il est conservé en kilogrammes, quelle que soit l’unité choisie ici.</div></div></div>');

    // 5 — Photos : principale, vues supplémentaires, et par couleur
    h.push('<div class="etape">'
      + '<div class="carte"><h2>Photo principale</h2><div class="photo">'
      + '<div class="vign" id="p-vign">aucune photo</div><div class="cmd">'
      + '<input type="file" id="p-fichier" accept="image/*">'
      + '<button type="button" id="p-vider">Retirer la photo</button>'
      + '<div class="aide">Maximum 8 Mo. Déposée dans le stockage à l’enregistrement.</div>'
      + '</div></div></div>'
      + '<div class="carte"><h2>Vues supplémentaires</h2>'
      + '<div class="vues" id="p-vues"></div>'
      + '<div class="aide" style="margin-top:.45rem">Dos, détail, porté. Elles apparaissent '
      + 'sur la fiche, après la photo principale.</div></div>'
      + '<div class="carte plein"><h2>Photo par couleur</h2>'
      + '<div class="aide" style="margin-bottom:.5rem">La cliente voit la photo de la couleur '
      + 'qu’elle choisit. Sans photo pour une couleur, c’est la photo principale qui s’affiche.</div>'
      + '<div class="vues" id="p-parcoul"></div></div></div>');

    // 6 — Détails
    // ⚠ LE REGIME DE VENTE EST UN CHOIX A QUATRE ETATS, pas trois cases
    // independantes. Mes cases permettaient « vente finale ET aucun retour ET
    // liquidation » — une combinaison que l editeur du site ne peut pas produire
    // et que la boutique ne sait pas afficher.
    h.push('<div class="etape"><div class="carte"><h2>Mise en marché</h2><div class="bascules">'
      + bascule('p-actif', 'Produit actif (visible en boutique)')
      + '<div class="ch" style="margin-top:.3rem"><label for="p-regime">Régime de vente</label>'
      + '<select id="p-regime">'
      + '<option value="0">✅ Retour accepté</option>'
      + '<option value="4">🚫 Aucun retour</option>'
      + '<option value="3">🟡 Liquidation</option>'
      + '<option value="1">🔴 Vente finale</option>'
      + '</select></div>'
      + bascule('p-finalret', 'Vente finale, mais retour accepté malgré tout')
      + '</div></div>'
      + '<div class="carte"><h2>Repères</h2><div class="grille">'
      + ch('p-emoji', 'Émoji', { placeholder: '👗' })
      + ch('p-hex', 'Couleur d’accent', { type: 'color' })
      + ch('p-seuil', 'Seuil d’alerte de stock', { type: 'number', min: 0, pas: '1' })
      + '</div></div></div>');

    // 7 — Stock
    h.push('<div class="etape"><div class="carte plein" id="p-zone"><h2>Stock par variante</h2>'
      + '<div class="rech"><input placeholder="Filtrer par taille ou couleur…"><span class="cpt" id="p-somme"></span></div>'
      + '<div class="liste"></div><div class="pagi"></div></div></div>');

    document.getElementById('corps').innerHTML = h.join('');
    brancher();
    if (FICHE) remplir(FICHE);
    else {
      document.getElementById('p-actif').checked = true;
      poser('p-seuil', String(CTX.seuilDefaut));
      poser('p-hex', '#c9a97e');
      poser('p-regime', '0');
      // Une categorie deja choisie n emet aucun evenement : on demande le code
      // des l ouverture, sinon il n arrive qu au premier changement.
      if (val('p-cat')) majSku();
    }
    majMarge();

    Assist.poser([
      { t: 'Identité et classement', obl: ['p-nom', 'p-cat'] },
      { t: 'Tailles et couleurs',    obl: [] },
      { t: 'Prix et poids',          obl: ['p-prix', 'p-cout', 'p-poids'] },
      { t: 'Photo',                  obl: [] },
      { t: 'Mise en marché',         obl: [] },
      { t: 'Stock',                  obl: [] }
    ], function(i){ if (i === 3) dessinerVues(); if (i === 5) majStock(); });

    bEnr.disabled = !(ID ? CTX.peutModifier : CTX.peutAjouter);
    if (bEnr.disabled) dire('Consultation seulement — votre rôle ne permet pas d’enregistrer.', 'att');
  }

  function brancher(){
    document.getElementById('corps').addEventListener('click', function(ev){
      var j = ev.target.closest('.jeton');
      if (j) j.classList.toggle('on');
    });
    ['p-prix', 'p-cout', 'p-solde'].forEach(function(i){
      var e = document.getElementById(i); if (e) e.oninput = majMarge;
    });
    ['p-nom', 'p-cat', 'p-poids'].forEach(function(i){
      var e = document.getElementById(i);
      if (e) e.oninput = e.onchange = function(){ this.classList.remove('manque'); Assist.fil(); majNom(); };
    });
    var nm = document.getElementById('p-nom');
    if (nm) nm.setAttribute('maxlength', '70');
    majNom();
    var bIa = document.getElementById('p-ia');
    if (bIa) bIa.onclick = rediger;
    majIa();
    // Le SKU suit la categorie — sauf sur une fiche existante, dont le code est
    // deja attribue : le recalculer lui en donnerait un autre a chaque ouverture.
    var cat = document.getElementById('p-cat');
    if (cat) cat.addEventListener('change', function(){ if (!ID) majSku(); });
    var rab = document.getElementById('p-rabais');
    if (rab) rab.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-pct]'); if (!b || b.disabled) return;
      var pr = parseFloat(val('p-prix')) || 0;
      if (!pr) return;
      poser('p-solde', (pr * (1 - parseInt(b.getAttribute('data-pct'), 10) / 100)).toFixed(2));
      majMarge();
    });
    document.getElementById('p-fichier').onchange = lireFichier;
    document.getElementById('p-vider').onclick = function(){
      IMAGE = ''; montrerImage(''); document.getElementById('p-fichier').value = ''; majIa();
    };
    document.getElementById('corps').addEventListener('click', function(ev){
      var c = ev.target.closest('[data-vue]');
      if (c) { var k = c.getAttribute('data-vue'); choisirFichier(function(d){ VUES[k] = d; dessinerVues(); }); return; }
      var x = ev.target.closest('[data-vuex]');
      if (x) { delete VUES[x.getAttribute('data-vuex')]; dessinerVues(); return; }
      var p = ev.target.closest('[data-coul]');
      if (p) {
        var n = p.getAttribute('data-coul');
        choisirFichier(function(d){ PARCOUL[n] = PARCOUL[n] || {}; PARCOUL[n].principale = d; dessinerVues(); });
        return;
      }
      var px = ev.target.closest('[data-coulx]');
      if (px) { delete PARCOUL[px.getAttribute('data-coulx')]; dessinerVues(); }
    });
    var ca = document.getElementById('p-coul-add');
    if (ca) ca.onclick = ajouterCouleur;
    var cl = document.getElementById('p-coul-libre');
    if (cl) cl.onkeydown = function(ev){ if (ev.key === 'Enter') { ev.preventDefault(); ajouterCouleur(); } };
  }

  // ⚠ La marge se calcule sur le prix REELLEMENT paye : un solde actif remplace
  // le prix de vente. L afficher sur le prix barre donnerait une marge que
  // personne n encaisse.
  // Le prochain code libre pour la categorie choisie. "configure: false" veut
  // dire qu aucun prefixe n est defini pour cette categorie : on le DIT, au lieu
  // de laisser un champ vide qui ressemble a un chargement qui n arrive jamais.
  function majSku(){
    var c = val('p-cat');
    if (!c) { poser('p-sku', ''); return; }
    var e = document.getElementById('p-sku');
    if (e) e.placeholder = 'calcul du code…';
    P.appeler('produit:sku', c).then(function(r){
      if (!e) return;
      // ⚠ UN ECHEC NE DOIT PAS VIDER LE CHAMP EN SILENCE. C est ce que je faisais :
      // le code n apparaissait pas et rien ne disait pourquoi — coquille trop
      // ancienne pour connaitre l operation, droit refuse, ou simplement aucun
      // prefixe configure. Trois causes, un seul symptome, aucun message.
      if (!r || !r.ok) {
        poser('p-sku', '');
        e.placeholder = 'code indisponible';
        dire('Code (SKU) : ' + expliquer(r), 'att');
        return;
      }
      poser('p-sku', r.sku);
      e.placeholder = r.configure ? '' : 'aucun code configuré pour cette catégorie';
      if (!r.configure) {
        dire('Aucun préfixe de code n’est configuré pour cette catégorie — voyez Inventaire → Catégories.', 'att');
      } else { dire(''); }
    });
  }

  function majNom(){
    var e = document.getElementById('p-nom'), z = document.getElementById('p-desc-etat');
    if (e && z) z.textContent = (e.value || '').length + '/70';
  }

  // Le bouton de redaction n a de sens qu avec une photo : le service regarde
  // le vetement. On le DIT plutot que de laisser cliquer pour rien.
  function majIa(){
    var b = document.getElementById('p-ia');
    if (!b) return;
    var pret = !!IMAGE;
    b.disabled = !pret;
    // ⚠ L explication passe par l INFOBULLE, pas par une ligne sous le bouton.
    // Une phrase d aide permanente occupe la place du formulaire pour dire une
    // chose qu on n a besoin de lire qu une fois.
    b.title = pret
      ? 'Analyse la photo du produit et propose une description.'
      : 'Ajoutez d’abord une photo à l’étape « Photo » : le service regarde le vêtement.';
  }

  function rediger(){
    var b = document.getElementById('p-ia');
    b.disabled = true; dire('Rédaction en cours…');
    var cat = (CTX.categories.find(function(c){ return c.cle === val('p-cat'); }) || {}).libelle || '';
    P.appeler('produit:decrire', {
      nom: val('p-nom'), categorie: cat, couleurs: couleurs(), imageDataUrl: IMAGE
    }).then(function(r){
      b.disabled = false;
      if (!r || !r.ok) { dire(expliquer(r) + (r && r.detail ? ' — ' + r.detail : ''), 'err'); return; }
      poser('p-desc', r.texte);
      dire('Description rédigée — relisez-la avant d’enregistrer.', 'bon');
    });
  }

  function ajouterCouleur(){
    var e = document.getElementById('p-coul-libre');
    var v = String(e.value || '').trim();
    if (!v) return;
    var z = document.getElementById('p-couleurs');
    var deja = z.querySelector('.jeton[data-c="' + v.replace(/"/g, '') + '"]');
    if (deja) { deja.classList.add('on'); e.value = ''; dire('Couleur déjà dans la liste — cochée.', ''); return; }
    var j = document.createElement('span');
    j.className = 'jeton on'; j.setAttribute('data-c', v);
    j.innerHTML = '<span class="pt" style="background:#888"></span>' + esc(v);
    z.insertBefore(j, z.firstChild);
    e.value = ''; dire('');
  }

  var PCTS = [10, 15, 20, 25, 30, 40, 50];
  function majMarge(){
    var p = parseFloat(val('p-prix')) || 0;
    var s = parseFloat(val('p-solde')) || 0;
    var c = parseFloat(val('p-cout')) || 0;
    var eff = (s > 0 && s < p) ? s : p;

    // Rabais rapides — un bouton par pourcentage, DESACTIVE si le prix obtenu
    // passe sous le cout. Proposer un rabais qui fait vendre a perte, c est
    // proposer une erreur.
    var z = document.getElementById('p-rabais');
    if (z) {
      var hs = ['<span class="aide" style="margin-right:.2rem">Rabais rapide :</span>'];
      PCTS.forEach(function(pct){
        var sp = p ? +(p * (1 - pct / 100)).toFixed(2) : 0;
        var sousCout = c > 0 && sp > 0 && sp < c;
        var actif = s > 0 && p > 0 && Math.round((1 - s / p) * 100) === pct;
        hs.push('<button type="button" data-pct="' + pct + '"'
          + (!p || sousCout ? ' disabled' : '')
          + ' title="' + (sousCout ? 'sous le coût d’acquisition' : (sp ? sp.toFixed(2) + ' $' : '')) + '"'
          + ' style="padding:.16rem .45rem;font-size:.74rem'
          + (actif ? ';background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600' : '') + '">'
          + '-' + pct + '%</button>');
      });
      if (s > 0 && p > 0 && s < p) {
        hs.push('<span style="margin-left:.3rem;padding:.14rem .45rem;border-radius:99px;'
          + 'background:#c9a97e;color:#17202c;font-size:.74rem;font-weight:700">-'
          + Math.round((1 - s / p) * 100) + '%</span>');
      }
      z.innerHTML = hs.join('');
    }

    // ⚠ ETIQUETTE « SOLDE » AUTOMATIQUE, comme dans l editeur du site — mais
    // JAMAIS sur un produit deja en liquidation ou en vente finale : ces regimes
    // ont leur propre etiquette, et en poser une seconde par-dessus donne deux
    // messages contradictoires sur la meme fiche.
    var etiq = document.getElementById('p-etiq');
    var reg = val('p-regime');
    if (etiq && reg !== '1' && reg !== '3') {
      if (p && s && s < p) etiq.value = 'Solde';
      else if (etiq.value === 'Solde') etiq.value = '';
    }

    var al = document.getElementById('p-alerte');
    if (al) {
      if (c > 0 && eff > 0 && eff < c) {
        al.textContent = '⚠ Le prix de vente effectif (' + eff.toFixed(2) + ' $) est inférieur au coût d’acquisition ('
          + c.toFixed(2) + ' $).';
        al.style.display = 'block';
      } else { al.style.display = 'none'; }
    }

    var el = document.getElementById('p-marge'); if (!el) return;
    if (!(eff > 0) || !(c > 0)) { el.textContent = ''; return; }
    var m = eff - c, pct = Math.round((m / eff) * 100);
    el.innerHTML = 'Marge : <strong>' + m.toFixed(2) + ' $</strong> (' + pct + ' %)'
      + (s > 0 && s < p ? ' — calculée sur le prix soldé' : '')
      + (m <= 0 ? ' <span style="color:#f87171">— vente à perte</span>' : '');
  }

  // Un cadre par vue : on clique, on choisit un fichier. Le « x » retire.
  function dessinerVues(){
    var z = document.getElementById('p-vues');
    if (z) {
      z.innerHTML = VUES_NOMS.map(function(nom, i){
        var cle = 'vue-' + (i + 2);
        var src = VUES[cle] || '';
        return '<div class="vue"><div class="cadre' + (src ? ' pleine' : '') + '" data-vue="' + cle + '">'
          + (src ? '<img src="' + esc(src) + '" alt="">' : 'ajouter') + '</div>'
          + (src ? '<button type="button" class="x" data-vuex="' + cle + '" title="Retirer">×</button>' : '')
          + '<div class="lgd">' + esc(nom) + '</div></div>';
      }).join('');
    }
    var p = document.getElementById('p-parcoul');
    if (!p) return;
    var cs = couleurs();
    if (!cs.length) {
      p.innerHTML = '<div class="aide">Choisissez d’abord des couleurs à l’étape « Tailles et couleurs ».</div>';
      return;
    }
    p.innerHTML = cs.map(function(c){
      var src = (PARCOUL[c] && PARCOUL[c].principale) || '';
      return '<div class="vue"><div class="cadre' + (src ? ' pleine' : '') + '" data-coul="' + esc(c) + '">'
        + (src ? '<img src="' + esc(src) + '" alt="">' : 'ajouter') + '</div>'
        + (src ? '<button type="button" class="x" data-coulx="' + esc(c) + '" title="Retirer">×</button>' : '')
        + '<div class="lgd">' + esc(c) + '</div></div>';
    }).join('');
  }

  // Un seul sélecteur de fichier, réutilisé : en créer un par cadre laisserait
  // autant d’éléments invisibles dans la page, et le navigateur n’en garde pas
  // la trace une fois le cadre redessiné.
  function choisirFichier(surCharge){
    var e = document.createElement('input');
    e.type = 'file'; e.accept = 'image/*';
    e.onchange = function(){
      var f = e.files && e.files[0]; if (!f) return;
      if (f.size > MAX_MO * 1024 * 1024) {
        dire('Image trop lourde (' + Math.round(f.size / 1048576) + ' Mo). Maximum ' + MAX_MO + ' Mo.', 'err');
        return;
      }
      var l = new FileReader();
      l.onload = function(){ surCharge(String(l.result || '')); dire(''); };
      l.onerror = function(){ dire('Lecture du fichier impossible.', 'err'); };
      l.readAsDataURL(f);
    };
    e.click();
  }

  function montrerImage(src){
    var v = document.getElementById('p-vign'); if (!v) return;
    v.innerHTML = src ? '<img src="' + esc(src) + '" alt="">' : 'aucune photo';
  }
  var MAX_MO = 8;
  function lireFichier(){
    var f = this.files && this.files[0]; if (!f) return;
    if (f.size > MAX_MO * 1024 * 1024) {
      dire('Photo trop lourde (' + Math.round(f.size / 1048576) + ' Mo). Maximum ' + MAX_MO + ' Mo.', 'err');
      this.value = ''; return;
    }
    var l = new FileReader();
    l.onload = function(){ IMAGE = String(l.result || ''); montrerImage(IMAGE); dire(''); majIa(); };
    l.onerror = function(){ dire('Lecture du fichier impossible.', 'err'); };
    l.readAsDataURL(f);
  }

  function tailles(){
    return Array.prototype.filter.call(document.querySelectorAll('#p-tailles .jeton'), function(j){
      return j.classList.contains('on'); }).map(function(j){ return j.getAttribute('data-t'); });
  }
  function couleurs(){
    return Array.prototype.filter.call(document.querySelectorAll('#p-couleurs .jeton'), function(j){
      return j.classList.contains('on'); }).map(function(j){ return j.getAttribute('data-c'); });
  }

  // ⚠ LA CLE DE STOCK EST « taille-couleur », exactement comme dans le site. Une
  // autre convention aurait produit un stock que l inventaire ne sait pas lire :
  // invisible, et donc jamais commande.
  // ⚠ LES QUANTITES VIVENT DANS "STOCK", PAS DANS LES CHAMPS. La liste est
  // paginee et redessinee : lire les champs a l enregistrement n aurait rendu
  // que la page affichee, et le reste aurait ete perdu sans un mot.
  function majStock(){
    var t = tailles(), c = couleurs();
    var lignes = [];
    t.forEach(function(ta){ c.forEach(function(co){
      lignes.push({ cle: ta + '-' + co, taille: ta, couleur: co, nom: ta + ' ' + co });
    }); });
    var zone = document.getElementById('p-zone');
    if (!PAGI) {
      PAGI = new Pagi(zone, {
        ligne: function(x){
          var q = STOCK[x.cle] || 0, lo = LOCS[x.cle] || '';
          return '<div class="lg"><span style="flex:0 0 5rem">' + esc(x.taille) + '</span>'
            + '<span style="flex:1 1 auto;min-width:0">' + esc(x.couleur) + '</span>'
            + '<input class="q" type="number" min="0" step="1" data-cle="' + esc(x.cle) + '" value="' + esc(q) + '">'
            + (CTX.entrepots.length
                ? '<select class="loc" data-cle="' + esc(x.cle) + '" style="flex:0 0 9rem"><option value="">—</option>'
                  + CTX.entrepots.map(function(w){
                      return '<option value="' + esc(w.id) + '"' + (lo === w.id ? ' selected' : '') + '>' + esc(w.nom) + '</option>';
                    }).join('') + '</select>'
                : '')
            + '</div>';
        },
        surMaj: function(){
          var n = 0;
          Object.keys(STOCK).forEach(function(k){ n += STOCK[k] || 0; });
          var s = document.getElementById('p-somme');
          if (s) s.textContent = n + (n > 1 ? ' unités au total' : ' unité au total');
        }
      });
      PAGI.brancher();
      zone.querySelector('.liste').addEventListener('input', function(ev){
        var q = ev.target.closest('.q');
        if (q) { STOCK[q.dataset.cle] = parseInt(q.value, 10) || 0; PAGI.surMaj(); return; }
      });
      zone.querySelector('.liste').addEventListener('change', function(ev){
        var l = ev.target.closest('.loc');
        if (l) LOCS[l.dataset.cle] = l.value;
      });
    }
    PAGI.tout = lignes;
    if (!lignes.length) {
      zone.querySelector('.liste').innerHTML =
        '<div class="aide">Choisissez au moins une taille et une couleur à l’étape « Tailles et couleurs ».</div>';
      zone.querySelector('.pagi').innerHTML = '';
      return;
    }
    PAGI.dessiner();
  }

  function remplir(p){
    poser('p-nom', p.name); poser('p-cat', p.category); poser('p-sku', p.sku);
    poser('p-marque', p.brand); poser('p-desc', p.description);
    poser('p-genre', p.genre || ''); poser('p-age', p.ageGroup || '');
    poser('p-style', p.style || ''); poser('p-guide', p.sizeGuideId || '');
    poser('p-etiq', p.tag || ''); poser('p-fourn', p.supplierId || '');
    poser('p-prix', p.price != null ? p.price : '');
    poser('p-solde', p.salePrice != null ? p.salePrice : '');
    poser('p-cout', p.acquisitionCost != null ? p.acquisitionCost : '');
    // Le poids est conserve en KILOGRAMMES : on l affiche en grammes, l unite la
    // plus lisible pour un vetement.
    poser('p-poids', p.weight ? String(Math.round(p.weight * 1000 * 10) / 10) : '');
    poser('p-unite', 'g');
    poser('p-emoji', p.emoji || ''); poser('p-hex', p.colorHex || '#c9a97e');
    poser('p-seuil', p.lowStock != null ? String(p.lowStock) : String(CTX.seuilDefaut));
    document.getElementById('p-actif').checked = p.active !== false;
    document.getElementById('p-finalret').checked = !!p.finalSaleReturnOk;
    poser('p-regime', p.liquidation ? '3' : (p.finalSale ? '1' : (p.noReturn ? '4' : '0')));
    (p.sizes || []).forEach(function(t){
      var j = document.querySelector('#p-tailles .jeton[data-t="' + String(t).replace(/"/g, '') + '"]');
      if (j) j.classList.add('on');
    });
    (p.colors || []).forEach(function(c){
      var j = document.querySelector('#p-couleurs .jeton[data-c="' + String(c).replace(/"/g, '') + '"]');
      if (j) j.classList.add('on');
    });
    STOCK = Object.assign({}, p.stock || {});
    LOCS = Object.assign({}, p.stockLoc || {});
    if (p.image) { IMAGE = p.image; montrerImage(IMAGE); }
    VUES = Object.assign({}, p.additionalImages || {});
    // ⚠ COPIE PROFONDE : chaque couleur porte son propre objet. Une copie de
    // surface les partagerait avec la fiche d origine, et retirer une photo ici
    // la retirerait aussi de la reference qui sert a detecter les conflits.
    PARCOUL = {};
    Object.keys(p.colorVariants || {}).forEach(function(c){
      PARCOUL[c] = Object.assign({}, p.colorVariants[c] || {});
    });
  }

  function enKg(v, u){
    var n = parseFloat(v) || 0;
    if (u === 'kg') return n;
    if (u === 'lb') return n * 0.45359237;
    return n / 1000;
  }

  function verrou(){
    if (!ID) return Promise.resolve();
    return P.appeler('verrou:prendre', 'products', ID).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      if (v.obtenu) { sous.textContent = v.horsLigne ? '🔓 hors ligne' : '🔒 fiche réservée'; return; }
      sous.textContent = '⚠ ouverte par ' + (v.parQui || 'quelqu’un d’autre');
      bEnr.disabled = true;
      dire('Enregistrement bloqué : cette fiche est ouverte ailleurs.', 'err');
    });
  }

  function charger(){
    P.appeler('produit:contexte').then(function(c){
      if (!c || !c.ok) { vide('Formulaire indisponible', expliquer(c)); return; }
      CTX = c;
      return P.appeler('produit:lire', ID).then(function(r){
        if (!r || !r.ok) { vide('Fiche indisponible', expliquer(r)); return; }
        FICHE = r.fiche;
        document.getElementById('titre').textContent = ID ? 'Modifier le produit' : 'Nouveau produit';
        dessiner();
        return verrou();
      });
    });
  }

  function enregistrer(){
    if (!Assist.toutValide()) return;
    // Le stock est purge des variantes qui n existent plus : garder une quantite
    // sur une couleur retiree la ferait compter dans l inventaire sans qu aucun
    // ecran ne la montre.
    var valides = {};
    tailles().forEach(function(t){ couleurs().forEach(function(c){ valides[t + '-' + c] = true; }); });
    var stock = {}, locs = {};
    Object.keys(STOCK).forEach(function(k){ if (valides[k] && STOCK[k] > 0) stock[k] = STOCK[k]; });
    Object.keys(LOCS).forEach(function(k){ if (valides[k] && LOCS[k]) locs[k] = LOCS[k]; });

    bEnr.disabled = true;
    dire(IMAGE && IMAGE.indexOf('data:') === 0 ? 'Dépôt de la photo et enregistrement…' : 'Enregistrement…');
    P.appeler('produit:enregistrer', ID, {
      name: val('p-nom').trim(), category: val('p-cat'), sku: val('p-sku'),
      brand: val('p-marque'), description: val('p-desc'),
      genre: val('p-genre'), ageGroup: val('p-age'), style: val('p-style'),
      sizeGuideId: val('p-guide'), tag: val('p-etiq'), supplierId: val('p-fourn'),
      price: parseFloat(val('p-prix')),
      salePrice: parseFloat(val('p-solde')) || null,
      acquisitionCost: parseFloat(val('p-cout')),
      weight: enKg(val('p-poids'), val('p-unite')),
      emoji: val('p-emoji'), colorHex: val('p-hex'),
      lowStock: parseInt(val('p-seuil'), 10),
      active: coché('p-actif'), regime: val('p-regime'),
      finalSaleReturnOk: coché('p-finalret'),
      sizes: tailles(), colors: couleurs(),
      image: IMAGE,
      additionalImages: VUES,
      // Les photos des couleurs RETIREES ne partent pas : le site les
      // televerserait puis les garderait dans le stockage sans que rien ne les
      // affiche jamais.
      colorVariants: (function(){
        var g = {}, cs = couleurs();
        cs.forEach(function(c){ if (PARCOUL[c]) g[c] = PARCOUL[c]; });
        return g;
      })(),
      stock: stock, stockLoc: locs
    }).then(function(r){
      if (!r || !r.ok) { bEnr.disabled = false; dire(expliquer(r), 'err'); return; }
      dire('Enregistré.', 'bon');
      setTimeout(function(){ P.fermer(); }, 700);
    });
  }

  bEnr.onclick = enregistrer;
  document.getElementById('btn-annuler').onclick = function(){ P.fermer(); };
  document.addEventListener('keydown', function(ev){
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 's' || ev.key === 'S')) {
      ev.preventDefault(); if (!bEnr.disabled) enregistrer();
    }
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });
  charger();
})();
</script></body></html>`;
}

module.exports = { pageProduit };
