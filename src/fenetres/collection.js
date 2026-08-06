'use strict';

/*
 * ASSISTANT « COLLECTION » — NATIF
 * =============================================================================
 * Même principe que l'assistant fournisseur : écrit ici, aucune page du site
 * chargée, aucun appel web. La saisie part au pont, qui valide et écrit.
 *
 * ⚠ L'IMAGE DE COUVERTURE EST LUE ICI, MAIS DÉPOSÉE PAR LE SITE.
 * Cette fenêtre lit le fichier en base64 et l'envoie tel quel ; c'est le pont
 * qui le téléverse vers R2, comme partout ailleurs. La fenêtre native n'a aucun
 * moyen de parler à R2 — et ne doit pas en avoir un : ce serait une deuxième
 * porte vers le stockage, avec ses propres identifiants à protéger.
 *
 * ⚠ LE VERROU est demandé par le site en modification, avant toute écriture.
 */

const { CSS_SOCLE, JS_SOCLE } = require('./socle');

const CSS_PROPRE = `
.rech{display:flex;gap:.5rem;align-items:center;margin-bottom:.6rem}
.rech input{flex:1 1 auto}
.rech .cpt{flex:0 0 auto;font-size:.78rem;color:#8fa1b8;white-space:nowrap}
.prods{max-height:230px;overflow-y:auto;border:1px solid rgba(255,255,255,.09);
  border-radius:8px;padding:.4rem .55rem}
.prods::-webkit-scrollbar{width:8px}
.prods::-webkit-scrollbar-thumb{background:rgba(255,255,255,.13);border-radius:8px}
.prods label{display:flex;align-items:center;gap:.5rem;padding:.24rem 0;font-size:.86rem;cursor:pointer}
.prods label.cache{display:none}
.prods input{width:auto;flex:0 0 auto}
.prods .cat{margin-left:auto;font-size:.72rem;color:#8fa1b8;flex:0 0 auto}
.apercu{display:flex;gap:.8rem;align-items:flex-start}
.apercu .vign{flex:0 0 auto;width:118px;height:118px;border-radius:9px;
  border:1px dashed rgba(255,255,255,.18);display:flex;align-items:center;
  justify-content:center;color:#8fa1b8;font-size:.75rem;overflow:hidden;text-align:center}
.apercu .vign img{width:100%;height:100%;object-fit:cover}
.apercu .cmd{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:.45rem}
.apercu .aide{font-size:.75rem;color:#8fa1b8;line-height:1.45}
`;

/** Page complète de l'assistant. `id` vide = création. */
function pageCollection(id) {
  const ident = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Collection — Administration Sandriza</title>
<style>${CSS_SOCLE}${CSS_PROPRE}</style></head><body>
<div class="tete"><span class="ic">🗂</span><h1 id="titre">Collection</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions">
    <button id="btn-annuler">Annuler</button>
    <button id="btn-enr" class="prim" disabled>Enregistrer</button>
  </span></div>
<script>
(function(){
  'use strict';
  ${JS_SOCLE}
  MOTIFS.televersement = 'Le dépôt de l image a échoué. La collection n a pas été enregistrée.';

  var ID    = ${ident};
  var corps = document.getElementById('corps');
  var msg   = document.getElementById('msg');
  var sous  = document.getElementById('sous');
  var bEnr  = document.getElementById('btn-enr');
  var CTX   = null;
  var IMAGE = '';

  function dire(t, genre){ msg.textContent = t || ''; msg.className = 'msg' + (genre ? ' ' + genre : ''); }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><div class="gros">' + esc(titre) + '</div><div>' + esc(detail || '') + '</div></div>';
    bEnr.disabled = true;
  }

  function majCompteur(){
    var n = document.querySelectorAll('.c-prod:checked').length;
    var el = document.getElementById('c-cpt');
    if (el) el.textContent = n + (n > 1 ? ' produits choisis' : ' produit choisi');
  }

  function dessiner(fiche){
    var h = [];
    h.push('<div class="carte"><h2>La collection</h2><div class="grille">');
    h.push('<div class="ch large"><label for="c-nom">Nom <span class="req">*</span></label><input id="c-nom"></div>');
    h.push('<div class="ch large"><label for="c-desc">Description</label><textarea id="c-desc" rows="3"></textarea></div>');
    h.push('<div class="ch"><label for="c-saison">Saison</label><select id="c-saison">'
      + CTX.saisons.map(function(s){ return '<option value="' + esc(s) + '">' + (s ? esc(s) : '—') + '</option>'; }).join('')
      + '</select></div>');
    h.push('<div class="ch"><label for="c-annee">Année</label><select id="c-annee">'
      + CTX.annees.map(function(a){ return '<option value="' + a + '">' + a + '</option>'; }).join('')
      + '</select></div>');
    h.push('<div class="ch"><label for="c-actif">Statut</label><select id="c-actif">'
      + '<option value="1">Active</option><option value="0">Inactive</option></select></div>');
    h.push('</div></div>');

    h.push('<div class="carte"><h2>Image de couverture</h2><div class="apercu">'
      + '<div class="vign" id="c-vign">aucune image</div>'
      + '<div class="cmd">'
      + '<input type="file" id="c-fichier" accept="image/*">'
      + '<button type="button" id="c-vider">Retirer l image</button>'
      + '<div class="aide">L image est déposée dans le stockage au moment de l enregistrement, '
      + 'comme partout ailleurs dans l administration.</div>'
      + '</div></div></div>');

    h.push('<div class="carte"><h2>Produits de la collection</h2>');
    h.push('<div class="rech"><input id="c-rech" placeholder="Filtrer par nom…"><span class="cpt" id="c-cpt">0 produit choisi</span></div>');
    h.push('<div class="prods" id="c-prods">');
    if (!CTX.produits.length) {
      h.push('<div style="color:#8fa1b8;font-size:.85rem;padding:.4rem 0">Aucun produit actif à proposer.</div>');
    } else {
      h.push(CTX.produits.map(function(p){
        return '<label data-nom="' + esc(String(p.nom).toLowerCase()) + '">'
          + '<input type="checkbox" class="c-prod" value="' + esc(p.id) + '">'
          + '<span>' + esc(p.nom) + '</span>'
          + '<span class="cat">' + esc(p.categorie) + '</span></label>';
      }).join(''));
    }
    h.push('</div></div>');
    corps.innerHTML = h.join('');

    if (fiche) {
      poser('c-nom', fiche.name); poser('c-desc', fiche.description);
      poser('c-saison', fiche.season || '');
      poser('c-annee', String(fiche.year || CTX.anneeParDefaut));
      poser('c-actif', fiche.active === false ? '0' : '1');
      if (fiche.coverImage) { IMAGE = fiche.coverImage; montrerImage(IMAGE); }
      var choisis = fiche.productIds || [];
      Array.prototype.forEach.call(document.querySelectorAll('.c-prod'), function(c){
        c.checked = choisis.indexOf(c.value) >= 0;
      });
    } else {
      poser('c-annee', String(CTX.anneeParDefaut));
    }
    majCompteur();

    document.getElementById('c-rech').oninput = function(){
      var q = this.value.trim().toLowerCase();
      Array.prototype.forEach.call(document.querySelectorAll('#c-prods label'), function(l){
        l.classList.toggle('cache', !!q && l.getAttribute('data-nom').indexOf(q) < 0);
      });
    };
    document.getElementById('c-prods').addEventListener('change', majCompteur);
    document.getElementById('c-fichier').onchange = lireFichier;
    document.getElementById('c-vider').onclick = function(){
      IMAGE = ''; montrerImage(''); document.getElementById('c-fichier').value = '';
    };

    bEnr.disabled = !(ID ? CTX.peutModifier : CTX.peutAjouter);
    if (bEnr.disabled) dire('Consultation seulement — votre rôle ne permet pas d enregistrer.', 'att');
    var n = document.getElementById('c-nom'); if (n) n.focus();
  }

  function montrerImage(src){
    var v = document.getElementById('c-vign'); if (!v) return;
    v.innerHTML = src ? '<img src="' + esc(src) + '" alt="">' : 'aucune image';
  }

  // ⚠ UNE BORNE SUR LA TAILLE, ET ELLE EST DITE. Sans elle, une photo d appareil
  // de 12 Mo part en base64 — un tiers plus lourd encore — dans un message entre
  // fenetres, puis dans le televersement. La fenetre parait figee, et rien
  // n explique pourquoi.
  var MAX_MO = 8;
  function lireFichier(){
    var f = this.files && this.files[0];
    if (!f) return;
    if (f.size > MAX_MO * 1024 * 1024) {
      dire('Image trop lourde (' + Math.round(f.size / 1048576) + ' Mo). Maximum ' + MAX_MO + ' Mo.', 'err');
      this.value = ''; return;
    }
    var l = new FileReader();
    l.onload = function(){ IMAGE = String(l.result || ''); montrerImage(IMAGE); dire(''); };
    l.onerror = function(){ dire('Lecture du fichier impossible.', 'err'); };
    l.readAsDataURL(f);
  }

  function charger(){
    P.appeler('collection:contexte').then(function(c){
      if (!c || !c.ok) { vide('Formulaire indisponible', expliquer(c)); return; }
      CTX = c;
      return P.appeler('collection:lire', ID).then(function(r){
        if (!r || !r.ok) { vide('Fiche indisponible', expliquer(r)); return; }
        document.getElementById('titre').textContent = ID ? 'Modifier la collection' : 'Nouvelle collection';
        sous.textContent = ID ? 'modification' : 'création';
        dessiner(r.fiche);
      });
    });
  }

  function enregistrer(){
    var nom = val('c-nom').trim();
    var champNom = document.getElementById('c-nom');
    if (!nom) {
      if (champNom) { champNom.classList.add('manque'); champNom.focus(); }
      dire(MOTIFS.nom_requis, 'err'); return;
    }
    if (champNom) champNom.classList.remove('manque');
    bEnr.disabled = true;
    dire(IMAGE && IMAGE.indexOf('data:') === 0 ? 'Dépôt de l image et enregistrement…' : 'Enregistrement…');
    P.appeler('collection:enregistrer', ID, {
      name: nom,
      description: val('c-desc'),
      season: val('c-saison'),
      year: parseInt(val('c-annee'), 10) || CTX.anneeParDefaut,
      active: val('c-actif') === '1',
      coverImage: IMAGE,
      productIds: Array.prototype.filter.call(document.querySelectorAll('.c-prod'), function(c){ return c.checked; })
                    .map(function(c){ return c.value; })
    }).then(function(r){
      if (!r || !r.ok) { bEnr.disabled = false; dire(expliquer(r), 'err'); return; }
      dire('Enregistré.', 'bon');
      setTimeout(function(){ P.fermer(); }, 550);
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

module.exports = { pageCollection };
