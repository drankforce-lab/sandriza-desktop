'use strict';

/*
 * ASSISTANT « FOURNISSEUR » — NATIF, PAR ÉTAPES
 * =============================================================================
 * Écrit ici, en entier. Aucune page du site n'est chargée, aucun appel web n'est
 * fait : la fenêtre demande son contexte au pont, affiche, et renvoie la saisie.
 * La validation et l'écriture restent dans le site, qui possède les règles.
 *
 * ⚠ TROIS ÉTAPES, AUCUN DÉFILEMENT. La version d'avant tenait tout sur une page
 * qu'il fallait faire défiler : on perdait de vue les boutons et la moitié des
 * champs. Une étape tient dans la fenêtre — c'est la règle du socle.
 *
 * ⚠ LE COIN DROIT DE L'EN-TÊTE EST RÉSERVÉ AU VERROU, et à rien d'autre. Il y
 * affichait « création » / « modification », ce que le titre disait déjà. Cet
 * emplacement sert maintenant à la seule chose qu'on ne peut pas deviner :
 * est-ce que quelqu'un d'autre tient cette fiche.
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

  var ID   = ${ident};
  var bEnr = document.getElementById('btn-enr');
  var sous = document.getElementById('sous');
  var CTX = null;

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
                   + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') + '>')
      + '</div>';
  }
  function sel(id, lbl, valeurs){
    return '<div class="ch"><label for="' + id + '">' + esc(lbl) + '</label><select id="' + id + '">'
      + valeurs.map(function(v){ return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join('')
      + '</select></div>';
  }

  function dessiner(fiche){
    var h = [];
    h.push('<div class="etape"><div class="carte"><h2>Identification</h2><div class="grille">'
      + ch('f-nom', 'Nom du fournisseur', { requis: true, large: true })
      + ch('f-contact', 'Personne-ressource')
      + ch('f-courriel', 'Courriel', { type: 'email' })
      + ch('f-tel', 'Téléphone', { type: 'tel' })
      + ch('f-web', 'Site web', { placeholder: 'https://…' })
      + '</div></div></div>');

    h.push('<div class="etape"><div class="carte"><h2>Adresse</h2><div class="grille">'
      + ch('f-rue', 'Rue', { large: true })
      + ch('f-ville', 'Ville')
      + sel('f-prov', 'Province', CTX.provinces)
      + ch('f-cp', 'Code postal', { placeholder: 'G1H 1T4' })
      + '</div></div></div>');

    h.push('<div class="etape"><div class="carte"><h2>Approvisionnement</h2>'
      + '<div class="ch large" style="margin-bottom:.65rem"><label>Catégories fournies</label><div class="cases">'
      + CTX.categories.map(function(c){
          return '<label><input type="checkbox" class="f-cat" value="' + esc(c.cle) + '">' + esc(c.libelle) + '</label>';
        }).join('')
      + '</div></div><div class="grille">'
      + sel('f-delai', 'Délai de livraison moyen', CTX.delais)
      + '<div class="ch"><label for="f-actif">Statut</label><select id="f-actif">'
      + '<option value="1">Actif</option><option value="0">Inactif</option></select></div>'
      + ch('f-notes', 'Notes internes', { multi: true, large: true, rows: 3 })
      + '</div></div></div>');

    document.getElementById('corps').innerHTML = h.join('');

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
    var n = document.getElementById('f-nom');
    if (n) n.oninput = function(){ this.classList.remove('manque'); Assist.fil(); };

    Assist.poser([
      { t: 'Identification', obl: ['f-nom'] },
      { t: 'Adresse',        obl: [] },
      { t: 'Approvisionnement', obl: [] }
    ]);

    bEnr.disabled = !(ID ? CTX.peutModifier : CTX.peutAjouter);
    if (bEnr.disabled) dire('Consultation seulement — votre rôle ne permet pas d’enregistrer.', 'att');
  }

  // ⚠ LE VERROU EST PRIS A L OUVERTURE, pas seulement a l enregistrement.
  // Le decouvrir apres avoir tout saisi, c est perdre la saisie. On le demande
  // des l ouverture et on le DIT dans l en-tete.
  function verrou(){
    if (!ID) return Promise.resolve();
    return P.appeler('verrou:prendre', 'suppliers', ID).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      if (v.obtenu) { sous.textContent = v.horsLigne ? '🔓 hors ligne' : '🔒 Section verrouillée en modification par : ' + (v.par || 'vous'); return; }
      sous.textContent = '⚠ ouverte par ' + (v.parQui || 'quelqu’un d’autre');
      bEnr.disabled = true;
      dire('Enregistrement bloqué : cette fiche est ouverte ailleurs.', 'err');
    });
  }

  function charger(){
    P.appeler('fournisseur:contexte').then(function(c){
      if (!c || !c.ok) { vide('Formulaire indisponible', expliquer(c)); return; }
      CTX = c;
      return P.appeler('fournisseur:lire', ID).then(function(r){
        if (!r || !r.ok) { vide('Fiche indisponible', expliquer(r)); return; }
        document.getElementById('titre').textContent = ID ? 'Modifier le fournisseur' : 'Nouveau fournisseur';
        dessiner(r.fiche);
        return verrou();
      });
    });
  }

  function enregistrer(){
    if (!Assist.toutValide()) return;
    bEnr.disabled = true;
    dire('Enregistrement…');
    P.appeler('fournisseur:enregistrer', ID, {
      name: val('f-nom').trim(),
      contactName: val('f-contact'), email: val('f-courriel'),
      phone: val('f-tel'), website: val('f-web'),
      address: { street: val('f-rue'), city: val('f-ville'), province: val('f-prov'), postalCode: val('f-cp') },
      categories: Array.prototype.filter.call(document.querySelectorAll('.f-cat'), function(c){ return c.checked; })
                    .map(function(c){ return c.value; }),
      leadTime: val('f-delai'), notes: val('f-notes'), active: val('f-actif') === '1'
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

module.exports = { pageFournisseur };
