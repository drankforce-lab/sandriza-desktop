'use strict';

/*
 * LES IMAGES DE LA BOUTIQUE (2026-11-28, lot A)
 * =============================================================================
 * Sa demande : « comme l'ensemble de ces images risque de changer chaque année, une section où tout serait regroupé,
 * et en un clic une nouvelle génération de tout ce contenu ». Maquette approuvée :
 * https://claude.ai/artifact/3i1KqvCVaLs958rncTikpP
 * LOT A (ici) : l'inventaire de TOUTES les images du site, groupées comme la maquette, avec pour chacune « Remplacer… »
 * (un fichier du poste, déposé sur R2) et « Rétablir » (l'image d'origine). Le manifeste images_cfg est un réglage
 * PUBLIABLE : depuis l'application, il s'écrit dans la boutique préparée ; « Publication » l'envoie en ligne.
 * LOTS B et C (à venir) : l'assistant de collection annuelle — questions, aperçu, génération, test puis production.
 * ⚠ AUCUN CARACTÈRE accent grave dans la portion de script, COMMENTAIRES COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('images-boutique');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522);flex-wrap:wrap}
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.tete .cx-resume{color:var(--tx2);font-size:.8rem}
.seg{margin-left:auto;display:inline-flex;background:var(--v05);border:1px solid var(--v10);border-radius:10px;padding:3px}
.seg button{background:transparent;border:0;color:var(--tx2);font:600 .8rem system-ui;padding:.3rem .75rem;border-radius:7px;cursor:pointer}
.seg button.on{background:var(--v10);color:var(--tx)}
button{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:9px;padding:.3rem .65rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:var(--sz-btn-prim,var(--or));border-color:transparent;color:var(--sz-btn-prim-txt,#1a1208);font-weight:800}
button:focus-visible{outline:2px solid var(--or);outline-offset:2px}
#corps{flex:1 1 auto;min-height:0;overflow:auto;padding:1rem 1.2rem 1.4rem}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.8rem}
.msg.bon{color:var(--tx-ok)} .msg.err{color:var(--tx-err)} .msg.att{color:var(--tx-att)}
.im-resume{display:flex;align-items:center;flex-wrap:wrap;gap:0;padding-bottom:.8rem;margin-bottom:1rem;border-bottom:1px solid var(--v08)}
.im-resume .k{font-size:.8rem;color:var(--tx2)} .im-resume .k b{color:var(--tx);font-size:1rem;margin-right:.25rem;font-variant-numeric:tabular-nums}
.im-resume .k+.k::before{content:"";display:inline-block;width:3px;height:3px;border-radius:50%;background:var(--tx2);opacity:.6;margin:0 .75rem;vertical-align:middle}
.im-resume .esp{margin-left:auto;display:flex;gap:.5rem}
.im-g{margin-bottom:1.4rem}
.im-g h2{display:flex;align-items:baseline;gap:.6rem;margin:0 0 .6rem;font-size:.78rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--tx2)}
.im-g h2 span{font-weight:500;letter-spacing:0;text-transform:none;font-size:.78rem;opacity:.8}
.im-grille{display:grid;gap:.65rem}
.im-grille.l{grid-template-columns:repeat(auto-fill,minmax(10rem,1fr))}
.im-grille.p{grid-template-columns:repeat(auto-fill,minmax(7rem,1fr))}
.im-v{position:relative;border-radius:10px;overflow:hidden;background:var(--v05);border:1px solid var(--v08)}
.im-v img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:var(--v05)}
.im-grille.p .im-v img{aspect-ratio:3/4}
.im-v .lb{display:flex;flex-direction:column;gap:.1rem;padding:.4rem .55rem .5rem}
.im-v .lb b{font-size:.78rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.im-v .lb span{font-size:.7rem;color:var(--tx2)}
.im-v .past{position:absolute;top:.4rem;left:.4rem;font-size:.62rem;font-weight:700;padding:.1rem .45rem;border-radius:99px;background:var(--f-page);color:var(--tx);box-shadow:0 1px 4px rgba(0,0,0,.25)}
.im-v .past.neuve{color:var(--tx-att,var(--tx))}
.im-v .gest{display:flex;gap:.3rem;padding:0 .55rem .55rem}
.im-v .gest button{font-size:.72rem;padding:.2rem .5rem}
.im-v.occupe{opacity:.5;pointer-events:none}
.im-s{display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:.7rem}
.im-saison{background:var(--v05);border:1px solid var(--v08);border-radius:12px;padding:.6rem}
.im-saison .t{display:flex;justify-content:space-between;align-items:baseline;margin:0 .1rem .45rem}
.im-saison .t b{font-size:.9rem} .im-saison .t span{font-size:.7rem;color:var(--tx2)}
.im-saison .plans{display:grid;grid-template-columns:repeat(4,1fr);gap:.25rem}
.im-saison .plans img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:5px;display:block}
.im-note{font-size:.76rem;color:var(--tx2);margin:.4rem 0 0}
.im-bientot{max-width:40rem;margin:2rem auto;text-align:center;color:var(--tx2);display:flex;flex-direction:column;gap:.6rem;align-items:center}
.im-bientot b{color:var(--tx);font-size:1rem}

`;

/* L'INVENTAIRE : chaque image du site, par son chemin d'origine (la clé du manifeste images_cfg). */
const INVENTAIRE = {
  saisons: [['printemps', 'Printemps', 'printemps'], ['ete', 'Été', 'ete'], ['automne', 'Automne', 'automne2'], ['hiver', 'Hiver', 'hiver2']],
  categories: [['robes', 'Robes'], ['hauts', 'Hauts & Blouses'], ['pantalons', 'Pantalons & Jeans'], ['jupes', 'Jupes'], ['manteaux', 'Manteaux & Vestes'], ['chaussures', 'Chaussures'], ['accessoires', 'Accessoires']],
  pages: [['livraison', 'Livraison'], ['retours', 'Retours'], ['tailles', 'Guide des tailles'], ['faq', 'FAQ'], ['contact', 'Nous joindre'], ['compte', 'Mon compte'],
    ['cartes-cadeaux', 'Cartes-cadeaux'], ['parrainage', 'Parrainage'], ['politiques', 'Politiques'], ['boite', 'Boîte de style'], ['boite-decouverte', 'Boîte · Découverte'],
    ['boite-classique', 'Boîte · Classique'], ['boite-prestige', 'Boîte · Prestige'], ['anticipe', 'Accès anticipé'], ['ambassadrices', 'Ambassadrices'], ['seconde-main', 'Seconde main'], ['vip', 'Liste VIP']],
  apropos: [['hiver', 'Ouverture'], ['bureau', 'Notre histoire'], ['accessoires', 'Choisie avec soin'], ['soiree', 'Moment · soirée'], ['weekend', 'Moment · week-end']],
  vides: [['favoris-vide', 'Favoris vides'], ['introuvable', 'Page introuvable'], ['panier-vide', 'Panier vide']]
};

// Les libelles de l'inventaire, dans la langue de la fenetre (ils vivent dans le JSON envoye a la page).
function inventaireTraduit() {
  const tr = (l) => l.map((x) => x.map((v, i) => (i === 1 ? T(v) : v)));
  return { saisons: tr(INVENTAIRE.saisons), categories: tr(INVENTAIRE.categories), pages: tr(INVENTAIRE.pages), apropos: tr(INVENTAIRE.apropos), vides: tr(INVENTAIRE.vides) };
}

function pageImagesBoutique() {
  return `${TETE()}
<title>${T("Images de la boutique — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.image}</span><h1>${T("Images de la boutique")}</h1>
  <span class="cx-resume" id="sous"></span>
  <div class="seg" role="group" aria-label="${T("Vue")}"><button type="button" id="v-col" class="on">${T("Collection en ligne")}</button><button type="button" id="v-neuve">${T("Nouvelle collection")}</button></div></div>
<div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<input type="file" id="fichier" accept="image/webp,image/jpeg,image/png" hidden>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var INV = ${JSON.stringify(inventaireTraduit())};
  var corps = document.getElementById('corps'), elSous = document.getElementById('sous');
  var D = null, VUE = 'col', CIBLE = '';
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  var MOTIFS = {
    session: '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit: '${T("Votre rôle ne permet pas de changer les images de la boutique.")}',
    indisponible: '${T("La fenêtre principale ne répond pas. Rechargez-la (Ctrl+R).")}',
    format: '${T("Choisissez une image WebP, JPEG ou PNG.")}',
    parametre: '${T("Cette image ne peut pas être remplacée ici.")}',
    echec: '${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m = r && r.motif; return (MOTIFS[m] || MOTIFS.echec) + (r && r.detail ? ' (' + r.detail + ')' : ''); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); } catch (e) { return Promise.resolve({ ok: false, motif: 'indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; }).catch(function(){ return { ok: false, motif: 'echec' }; });
  }
  function src(chemin){ var u = D && D.images && D.images[chemin]; return u || ((D && D.site) || '') + '/' + chemin; }
  function carte(chemin, nom, info, remplacable){
    var neuve = !!(D && D.images && D.images[chemin]);
    return '<div class="im-v" data-c="' + esc(chemin) + '"><span class="past' + (neuve ? ' neuve' : '') + '">' + (neuve ? '${T("Remplacée")}' : '${T("Origine")}') + '</span>'
      + '<img src="' + esc(src(chemin)) + '" alt="" loading="lazy"><div class="lb"><b>' + esc(nom) + '</b><span>' + esc(info) + '</span></div>'
      + (remplacable && D && D.peutModifier ? '<div class="gest"><button type="button" data-rempl="' + esc(chemin) + '">${T("Remplacer…")}</button>'
        + (neuve ? '<button type="button" data-retab="' + esc(chemin) + '">${T("Rétablir")}</button>' : '') + '</div>' : '') + '</div>';
  }
  function dessiner(){
    if (!D) return;
    var n = Object.keys(D.images || {}).length;
    elSous.textContent = '${T("Collection")} ' + (D.collection || '2026') + (n ? ' · ' + n + ' ' + (n > 1 ? '${T("images remplacées")}' : '${T("image remplacée")}') : '');
    if (VUE === 'neuve') {
      corps.innerHTML = '<div class="im-bientot"><b>${T("La nouvelle collection arrive dans une prochaine version")}</b>'
        + '<span>${T("Questions sur vos goûts, aperçu de six images, génération de toute la collection, puis test et publication. En attendant, chaque image peut être remplacée une à une dans la collection en ligne.")}</span>'
        + '<button type="button" id="b-retour">${T("Voir la collection en ligne")}</button></div>';
      return;
    }
    var h = '<div class="im-resume"><span class="k"><b>' + (INV.categories.length * 2 + INV.pages.length + INV.apropos.length + INV.vides.length) + '</b>${T("photos")}</span>'
      + '<span class="k"><b>16</b>${T("vidéos de saison")}</span><span class="k"><b>' + n + '</b>${T("remplacées")}</span></div>';
    h += '<div class="im-g"><h2>${T("Bannières des saisons")} <span>${T("4 plans vidéo par saison — refaits par la nouvelle collection")}</span></h2><div class="im-s">'
      + INV.saisons.map(function(s){ return '<div class="im-saison"><div class="t"><b>' + esc(s[1]) + '</b><span>${T("vidéo")}</span></div><div class="plans">'
        + [1, 2, 3, 4].map(function(i){ return '<img src="' + esc(src('assets/video/saisons/' + s[2] + '-' + i + '.webp')) + '" alt="" loading="lazy">'; }).join('') + '</div></div>'; }).join('') + '</div></div>';
    h += '<div class="im-g"><h2>${T("Catégories")} <span>${T("2 photos par catégorie · 1200 × 1600")}</span></h2><div class="im-grille p">'
      + INV.categories.map(function(c){
          var a = c[0] === 'accessoires' ? 'cat-accessoires-e' : 'cat-' + c[0] + '-a', b = c[0] === 'accessoires' ? 'cat-accessoires-f' : 'cat-' + c[0] + '-b';
          return carte('assets/img/pages/' + a + '-2x.webp', c[1], '${T("photo 1")}', true) + carte('assets/img/pages/' + b + '-2x.webp', c[1], '${T("photo 2")}', true);
        }).join('') + '</div></div>';
    h += '<div class="im-g"><h2>${T("Pages")} <span>${T("bannière en tête de page · 2400 px")}</span></h2><div class="im-grille l">'
      + INV.pages.map(function(p){ return carte('assets/img/pages/' + p[0] + '-2400.webp', p[1], '2400 px', true); }).join('') + '</div>'
      + '<p class="im-note">${T("Une page remplacée garde la même image sur ordinateur, tablette et téléphone.")}</p></div>';
    h += '<div class="im-g"><h2>${T("À propos")}</h2><div class="im-grille l">'
      + INV.apropos.map(function(a){ var ch = (a[0] === 'soiree' || a[0] === 'weekend') ? 'assets/img/apropos/' + a[0] + '-1600.webp' : 'assets/img/apropos/' + a[0] + '-2400.webp'; return carte(ch, a[1], '', true); }).join('') + '</div></div>';
    h += '<div class="im-g"><h2>${T("Écrans vides")}</h2><div class="im-grille p">'
      + INV.vides.map(function(e){ return carte('assets/img/pages/' + e[0] + '-2x.webp', e[1], '', true); }).join('') + '</div></div>';
    corps.innerHTML = h;
  }
  function charger(){
    appeler('imagesboutique:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; return; }
      D = r; dessiner();
    });
  }
  function occupe(chemin, on){ var v = corps.querySelector('[data-c="' + chemin.replace(/"/g, '') + '"]'); if (v) v.classList.toggle('occupe', !!on); }
  /* Une page « 2400 » est aussi servie en 1400 et en 800 : la même image remplace les trois tailles (le site prend la plus grande). */
  function cheminsDe(chemin){
    var m = /^(assets\\/img\\/(?:pages|apropos)\\/[a-z0-9-]+)-(2400|1600)\\.webp$/.exec(chemin);
    if (!m) return [chemin];
    return m[2] === '2400' ? [m[1] + '-2400.webp', m[1] + '-1600.webp', m[1] + '-1400.webp', m[1] + '-800.webp'] : [m[1] + '-1600.webp', m[1] + '-800.webp'];
  }
  var fichier = document.getElementById('fichier');
  fichier.addEventListener('change', function(){
    var f = fichier.files && fichier.files[0]; var chemin = CIBLE; fichier.value = '';
    if (!f || !chemin) return;
    if (f.size > 15 * 1024 * 1024) { dire('${T("Image trop lourde (15 Mo au plus).")}', 'err'); return; }
    var lu = new FileReader();
    lu.onload = function(){
      occupe(chemin, true); dire('${T("Dépôt de l’image…")}');
      var autres = cheminsDe(chemin).filter(function(c){ return c !== chemin; });
      appeler('imagesboutique:remplacer', [chemin, lu.result, autres]).then(function(r){
        occupe(chemin, false);
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('${T("Image remplacée dans la boutique préparée — publiez-la depuis Publication.")}', 'bon');
        charger();
      });
    };
    lu.onerror = function(){ dire('${T("Ce fichier n’a pas pu être lu.")}', 'err'); };
    lu.readAsDataURL(f);
  });
  corps.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var b;
    if ((b = t.closest('[data-rempl]'))) { CIBLE = b.getAttribute('data-rempl'); fichier.click(); return; }
    if ((b = t.closest('[data-retab]'))) {
      var chemin = b.getAttribute('data-retab');
      szConfirmer({ titre: '${T("Rétablir l’image d’origine")}', texte: '${T("L’image remplacée est retirée de la boutique préparée ; l’image d’origine revient. À publier ensuite depuis Publication.")}', oui: '${T("Rétablir")}' })
        .then(function(oui){
          if (!oui) return;
          occupe(chemin, true);
          appeler('imagesboutique:retablir', [chemin, cheminsDe(chemin).filter(function(c){ return c !== chemin; })]).then(function(r){
            occupe(chemin, false);
            if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
            dire('${T("Image d’origine rétablie dans la boutique préparée.")}', 'bon'); charger();
          });
        });
      return;
    }
    if (t.id === 'b-retour') { basculer('col'); return; }
  });
  function basculer(v){
    VUE = v;
    document.getElementById('v-col').classList.toggle('on', v === 'col');
    document.getElementById('v-neuve').classList.toggle('on', v === 'neuve');
    dessiner();
  }
  document.getElementById('v-col').onclick = function(){ basculer('col'); };
  document.getElementById('v-neuve').onclick = function(){ basculer('neuve'); };
  window.szActualiser = function(){ charger(); };
  window.szRevenir = function(){ return charger(); };
  charger();
})();
</script></body></html>`;
}

module.exports = { pageImagesBoutique };
