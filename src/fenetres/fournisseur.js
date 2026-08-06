'use strict';

/*
 * ASSISTANT « FOURNISSEUR » — NATIF
 * =============================================================================
 * Écrit ici, en entier. Aucune page du site n'est chargée, aucun appel web n'est
 * fait : la fenêtre demande son contexte au pont, affiche, et renvoie la saisie.
 * La validation et l'écriture restent dans le site, qui possède les règles.
 *
 * ⚠ LE VERROU EST PRIS PAR LE SITE, PAS PAR CETTE FENÊTRE.
 * En modification, `fournisseur:enregistrer` demande le verrou avant d'écrire et
 * refuse si quelqu'un d'autre le tient. C'était le point à ne pas rater : une
 * fenêtre native qui écrirait sans verrou serait un chemin d'écriture parallèle,
 * c'est-à-dire deux personnes sur la même fiche — exactement ce que le verrou
 * existe pour empêcher.
 *
 * ⚠ ELLE NE DEVINE RIEN. Sans réponse du pont, elle affiche le motif traduit au
 * lieu d'un formulaire vide qui aurait l'air utilisable.
 */

const { CSS_SOCLE, JS_SOCLE } = require('./socle');

/** Page complète de l'assistant. `id` vide = création. */
function pageFournisseur(id) {
  const ident = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Fournisseur — Administration Sandriza</title>
<style>${CSS_SOCLE}</style></head><body>
<div class="tete"><span class="ic">🏭</span><h1 id="titre">Fournisseur</h1>
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

  var ID    = ${ident};
  var corps = document.getElementById('corps');
  var msg   = document.getElementById('msg');
  var sous  = document.getElementById('sous');
  var bEnr  = document.getElementById('btn-enr');
  var CTX   = null;

  function dire(t, genre){ msg.textContent = t || ''; msg.className = 'msg' + (genre ? ' ' + genre : ''); }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><div class="gros">' + esc(titre) + '</div><div>' + esc(detail || '') + '</div></div>';
    bEnr.disabled = true;
  }

  function champ(id, lbl, opts){
    opts = opts || {};
    return '<div class="ch' + (opts.large ? ' large' : '') + '">'
      + '<label for="' + id + '">' + esc(lbl) + (opts.requis ? ' <span class="req">*</span>' : '') + '</label>'
      + (opts.multi
          ? '<textarea id="' + id + '" rows="3"></textarea>'
          : '<input id="' + id + '" type="' + (opts.type || 'text') + '"'
            + (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') + '>')
      + '</div>';
  }
  function liste(id, lbl, valeurs){
    return '<div class="ch"><label for="' + id + '">' + esc(lbl) + '</label><select id="' + id + '">'
      + valeurs.map(function(v){ return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join('')
      + '</select></div>';
  }

  function dessiner(fiche){
    var h = [];
    h.push('<div class="carte"><h2>Identification</h2><div class="grille">');
    h.push(champ('f-nom', 'Nom du fournisseur', { requis: true, large: true }));
    h.push(champ('f-contact', 'Personne-ressource'));
    h.push(champ('f-courriel', 'Courriel', { type: 'email' }));
    h.push(champ('f-tel', 'Téléphone', { type: 'tel' }));
    h.push(champ('f-web', 'Site web', { placeholder: 'https://…' }));
    h.push('</div></div>');

    h.push('<div class="carte"><h2>Adresse</h2><div class="grille">');
    h.push(champ('f-rue', 'Rue', { large: true }));
    h.push(champ('f-ville', 'Ville'));
    h.push(liste('f-prov', 'Province', CTX.provinces));
    h.push(champ('f-cp', 'Code postal', { placeholder: 'G1H 1T4' }));
    h.push('</div></div>');

    h.push('<div class="carte"><h2>Approvisionnement</h2>');
    h.push('<div class="ch large" style="margin-bottom:.75rem"><label>Catégories fournies</label><div class="cases">');
    h.push(CTX.categories.map(function(c){
      return '<label><input type="checkbox" class="f-cat" value="' + esc(c.cle) + '">' + esc(c.libelle) + '</label>';
    }).join(''));
    h.push('</div></div>');
    h.push('<div class="grille">');
    h.push(liste('f-delai', 'Délai de livraison moyen', CTX.delais));
    h.push('<div class="ch"><label for="f-actif">Statut</label><select id="f-actif">'
      + '<option value="1">Actif</option><option value="0">Inactif</option></select></div>');
    h.push(champ('f-notes', 'Notes internes', { multi: true, large: true }));
    h.push('</div></div>');
    corps.innerHTML = h.join('');

    if (fiche) {
      poser('f-nom', fiche.name); poser('f-contact', fiche.contactName);
      poser('f-courriel', fiche.email); poser('f-tel', fiche.phone); poser('f-web', fiche.website);
      var a = fiche.address || {};
      poser('f-rue', a.street); poser('f-ville', a.city); poser('f-cp', a.postalCode);
      poser('f-prov', a.province || 'QC');
      poser('f-delai', fiche.leadTime || CTX.delais[0]);
      poser('f-actif', fiche.active === false ? '0' : '1');
      poser('f-notes', fiche.notes);
      var choisies = fiche.categories || [];
      Array.prototype.forEach.call(document.querySelectorAll('.f-cat'), function(c){
        c.checked = choisies.indexOf(c.value) >= 0;
      });
    }
    // Le droit d'écrire décide de l'état du bouton — mais il ne remplace pas le
    // contrôle du site, qui reste le seul qui compte.
    bEnr.disabled = !(ID ? CTX.peutModifier : CTX.peutAjouter);
    if (bEnr.disabled) dire('Consultation seulement — votre rôle ne permet pas d’enregistrer.', 'att');
    var n = document.getElementById('f-nom'); if (n) n.focus();
  }

  function charger(){
    P.appeler('fournisseur:contexte').then(function(c){
      if (!c || !c.ok) { vide('Formulaire indisponible', expliquer(c)); return; }
      CTX = c;
      return P.appeler('fournisseur:lire', ID).then(function(r){
        if (!r || !r.ok) { vide('Fiche indisponible', expliquer(r)); return; }
        document.getElementById('titre').textContent = ID ? 'Modifier le fournisseur' : 'Nouveau fournisseur';
        sous.textContent = ID ? 'modification' : 'création';
        dessiner(r.fiche);
      });
    });
  }

  function enregistrer(){
    var nom = val('f-nom').trim();
    var champNom = document.getElementById('f-nom');
    if (!nom) {
      if (champNom) { champNom.classList.add('manque'); champNom.focus(); }
      dire(MOTIFS.nom_requis, 'err');
      return;
    }
    if (champNom) champNom.classList.remove('manque');
    bEnr.disabled = true;
    dire('Enregistrement…');
    P.appeler('fournisseur:enregistrer', ID, {
      name: nom,
      contactName: val('f-contact'), email: val('f-courriel'),
      phone: val('f-tel'), website: val('f-web'),
      address: { street: val('f-rue'), city: val('f-ville'), province: val('f-prov'), postalCode: val('f-cp') },
      categories: Array.prototype.filter.call(document.querySelectorAll('.f-cat'), function(c){ return c.checked; })
                    .map(function(c){ return c.value; }),
      leadTime: val('f-delai'), notes: val('f-notes'), active: val('f-actif') === '1'
    }).then(function(r){
      if (!r || !r.ok) { bEnr.disabled = false; dire(expliquer(r), 'err'); return; }
      dire('Enregistré.', 'bon');
      // On ferme APRES avoir montre le resultat : fermer aussitot laisse un doute
      // sur ce qui s est passe, et c est la seule confirmation qu on recevra.
      setTimeout(function(){ P.fermer(); }, 550);
    });
  }

  bEnr.onclick = enregistrer;
  document.getElementById('btn-annuler').onclick = function(){ P.fermer(); };
  // Ctrl+S : le geste attendu dans une fenetre de saisie.
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

module.exports = { pageFournisseur };
