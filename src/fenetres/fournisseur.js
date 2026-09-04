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

const { CSS_SOCLE, CSS_JOUR, JS_SOCLE, JS_BROUILLON, ICO } = require('./socle');

/** Page complète de l'assistant. `id` vide = création. */
function pageFournisseur(id) {
  const ident = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Fournisseur — Administration Sandriza</title>
<style>${CSS_SOCLE}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.suppliers}</span><h1 id="titre">Fournisseur</h1>
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
  ${JS_BROUILLON}

  var ID   = ${ident};
  var bEnr = document.getElementById('btn-enr');
  var sous = document.getElementById('sous');
  var CTX = null;

  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
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
        /* La boite de reprise remplit des champs : ils n existent qu apres le dessin. */
        szBrouillonProposer();
        return verrou();
      });
    });
  }

  /* ══ LE BROUILLON DE L ASSISTANT FOURNISSEUR ════════════════════
     Trois etapes, une douzaine de champs, des notes internes en texte libre : de
     tout ce qu on saisit dans l application, c est parmi ce qu on a le moins envie
     de refaire. Et rien n en gardait trace — les valeurs ne vivent que dans les
     champs, et la fenetre se ferme par cinq chemins (Annuler, Echap, le X du
     cadre, Ctrl+W, le menu).
     ⚠ ON NE BRANCHE AUCUN DE CES CINQ CHEMINS ICI, ET C EST LE POINT DU MONTAGE.
     Annuler et Echap appellent P.fermer(), qui va au meme endroit que le X du
     cadre : le garde de fermeture de la coquille. C est LUI qui pose la question,
     une seule fois, pour tous les chemins. Brancher Annuler ici ferait une
     deuxieme question, et surtout laisserait le X sans la sienne — alors que le X
     est le chemin le plus courant.
     ⚠ LES CATEGORIES SONT DES CASES SANS IDENTIFIANT (classe .f-cat) : elles ne
     passent pas par l aide generique, d ou la liste explicite ci-dessous. */
  var BR_CHAMPS = ['f-nom', 'f-contact', 'f-courriel', 'f-tel', 'f-web',
    'f-rue', 'f-ville', 'f-prov', 'f-cp', 'f-delai', 'f-actif', 'f-notes'];
  function brCats(){
    return Array.prototype.filter.call(document.querySelectorAll('.f-cat'), function(c){ return c.checked; })
      .map(function(c){ return c.value; });
  }
  szBrouillonBrancher({
    portee: 'fournisseur',
    libelle: ID ? 'Une modification de cette fiche' : 'Une fiche de fournisseur',
    ttlMin: 720,
    cle: function(){ return ID ? ('f:' + ID) : '__new__'; },
    actif: function(){ return !!document.getElementById('f-nom'); },
    valeurs: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, []);
      if (v) v._cats = brCats();
      return v;
    },
    /* Le nom ou le contact suffit a rendre la saisie precieuse. On ne compte pas
       les listes deroulantes : elles ont une valeur par defaut, donc elles ne
       disent pas qu on a commence a travailler. */
    rempli: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, []); if (!v) return false;
      return szBrouillonQuelqueChose(v, ['f-nom', 'f-contact', 'f-courriel', 'f-tel',
        'f-web', 'f-rue', 'f-ville', 'f-cp', 'f-notes']) || brCats().length > 0;
    },
    remplir: function(v){
      szBrouillonAuDom(v);
      var cats = v._cats || [];
      Array.prototype.forEach.call(document.querySelectorAll('.f-cat'), function(c){
        c.checked = cats.indexOf(c.value) >= 0;
      });
    },
  });
  szBrouillonEcouter();

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
      /* ⚠ LE BROUILLON MEURT ICI, ET AVANT LE P.fermer() DIFFERE : la fenetre part
         dans 550 ms, et son garde de fermeture demanderait sinon quoi faire d une
         saisie qui vient d etre enregistree. */
      szBrouillonJeter();
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
