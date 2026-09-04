'use strict';

/*
 * ASSISTANT « COLLECTION » — NATIF, PAR ÉTAPES
 * =============================================================================
 * Trois étapes : la collection, son image, ses produits. Aucune page du site
 * chargée, aucun appel web.
 *
 * ⚠ LES PRODUITS ONT LEUR PROPRE ÉTAPE, ET ILS SONT PAGINÉS (demandé le
 * 2026-08-06). Ils étaient en bas d'un formulaire qu'il fallait faire défiler,
 * dans une liste qui défilait elle aussi. Une boutique de deux cents références
 * y aurait été inutilisable : on cherche un produit, on ne parcourt pas un mur.
 * Le nombre de lignes par page se MESURE d'après la place réelle — une valeur
 * fixe déborde sur un petit écran et laisse du vide sur un grand.
 *
 * ⚠ L'IMAGE EST LUE ICI, MAIS DÉPOSÉE PAR LE SITE. Une fenêtre native n'a aucun
 * moyen de parler au stockage — et ne doit pas en avoir un : ce serait une
 * deuxième porte, avec ses propres identifiants à protéger.
 *
 * ⚠ LE COIN DROIT DE L'EN-TÊTE EST RÉSERVÉ AU VERROU.
 */

const { CSS_SOCLE, JS_SOCLE, JS_BROUILLON, ICO } = require('./socle');

const CSS_PROPRE = `
.photo{display:flex;gap:.85rem;align-items:flex-start}
.photo .vign{flex:0 0 auto;width:140px;height:140px;border-radius:10px;
  border:1px dashed var(--v16);display:flex;align-items:center;
  justify-content:center;color:var(--tx2);font-size:.75rem;overflow:hidden;text-align:center}
.photo .vign img{width:100%;height:100%;object-fit:cover}
.photo .cmd{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:.45rem}
`;

/** Page complète de l'assistant. `id` vide = création. */
function pageCollection(id) {
  const ident = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Collection — Administration Sandriza</title>
<style>${CSS_SOCLE}${CSS_PROPRE}</style></head><body>
<div class="tete"><span class="ico">${ICO.collections}</span><h1 id="titre">Collection</h1>
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
  var CTX = null, IMAGE = '', CHOISIS = {}, PAGI = null;

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

  function nbChoisis(){ return Object.keys(CHOISIS).filter(function(k){ return CHOISIS[k]; }).length; }

  function dessiner(fiche){
    var h = [];

    h.push('<div class="etape"><div class="carte"><h2>La collection</h2><div class="grille">'
      + '<div class="ch large"><label for="c-nom">Nom <span class="req">*</span></label><input id="c-nom"></div>'
      + '<div class="ch large"><label for="c-desc">Description</label>'
      + '<textarea id="c-desc" rows="4"></textarea>'
      + '<div style="margin-top:.35rem">'
      + '<button type="button" id="c-ia">✨ Rédiger avec l’IA</button></div></div>'
      + '<div class="ch"><label for="c-saison">Saison</label><select id="c-saison">'
      + CTX.saisons.map(function(s){ return '<option value="' + esc(s) + '">' + (s ? esc(s) : '—') + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="c-annee">Année</label><select id="c-annee">'
      + CTX.annees.map(function(a){ return '<option value="' + a + '">' + a + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="c-actif">Statut</label><select id="c-actif">'
      + '<option value="1">Active</option><option value="0">Inactive</option></select></div>'
      + '</div></div></div>');

    h.push('<div class="etape"><div class="carte"><h2>Image de couverture</h2><div class="photo">'
      + '<div class="vign" id="c-vign">aucune image</div><div class="cmd">'
      + '<input type="file" id="c-fichier" accept="image/*">'
      + '<button type="button" id="c-vider">Retirer l’image</button>'
      + '<div class="aide">L’image est déposée dans le stockage au moment de l’enregistrement, '
      + 'comme partout ailleurs dans l’administration. Maximum 8 Mo.</div>'
      + '</div></div></div></div>');

    h.push('<div class="etape"><div class="carte plein" id="c-zone"><h2>Produits de la collection</h2>'
      + '<div class="rech"><input placeholder="Filtrer par nom…"><span class="cpt" id="c-cpt"></span></div>'
      + '<div class="liste"></div><div class="pagi"></div></div></div>');

    document.getElementById('corps').innerHTML = h.join('');

    if (fiche) {
      poser('c-nom', fiche.name); poser('c-desc', fiche.description);
      poser('c-saison', fiche.season || '');
      poser('c-annee', String(fiche.year || CTX.anneeParDefaut));
      poser('c-actif', fiche.active === false ? '0' : '1');
      if (fiche.coverImage) { IMAGE = fiche.coverImage; montrerImage(IMAGE); }
      (fiche.productIds || []).forEach(function(pid){ CHOISIS[pid] = true; });
    } else {
      poser('c-annee', String(CTX.anneeParDefaut));
    }

    var n = document.getElementById('c-nom');
    if (n) n.oninput = function(){ this.classList.remove('manque'); Assist.fil(); };
    document.getElementById('c-fichier').onchange = lireFichier;
    var bIa = document.getElementById('c-ia');
    if (bIa) bIa.onclick = rediger;
    majIa();
    document.getElementById('c-vider').onclick = function(){
      IMAGE = ''; montrerImage(''); document.getElementById('c-fichier').value = ''; majIa();
    };

    // ── Liste paginée des produits ─────────────────────────────────────────
    var zone = document.getElementById('c-zone');
    PAGI = new Pagi(zone, {
      ligne: function(p){
        return '<label class="lg"><input type="checkbox" class="c-prod" value="' + esc(p.id) + '"'
          + (CHOISIS[p.id] ? ' checked' : '') + '>'
          + '<span>' + esc(p.nom) + '</span><span class="fin">' + esc(p.categorie) + '</span></label>';
      },
      surMaj: function(){
        var n = nbChoisis();
        var c = document.getElementById('c-cpt');
        if (c) c.textContent = n + (n > 1 ? ' produits choisis' : ' produit choisi');
      }
    });
    PAGI.tout = CTX.produits;
    PAGI.brancher();
    // ⚠ LE CHOIX SE GARDE HORS DE LA LISTE. Elle est redessinee a chaque page et
    // a chaque filtre : lire les cases cochees a l enregistrement n aurait rendu
    // que la page affichee, et tout le reste aurait ete silencieusement perdu.
    zone.querySelector('.liste').addEventListener('change', function(ev){
      var c = ev.target.closest('.c-prod'); if (!c) return;
      CHOISIS[c.value] = c.checked;
      PAGI.surMaj();
    });

    Assist.poser([
      { t: 'La collection', obl: ['c-nom'] },
      { t: 'Image',         obl: [] },
      { t: 'Produits',      obl: [] }
    ], function(i){ if (i === 2 && PAGI) PAGI.dessiner(); });

    bEnr.disabled = !(ID ? CTX.peutModifier : CTX.peutAjouter);
    if (bEnr.disabled) dire('Consultation seulement — votre rôle ne permet pas d’enregistrer.', 'att');
  }

  // Le bouton n a de sens qu avec une image : le service la regarde. On le DIT
  // au lieu de laisser cliquer pour rien.
  function majIa(){
    var b = document.getElementById('c-ia');
    if (!b) return;
    b.disabled = !IMAGE;
    b.title = IMAGE
      ? 'Analyse l’image de couverture et propose une description.'
      : 'Ajoutez d’abord une image à l’étape « Image » : le service la regarde.';
  }
  function rediger(){
    var b = document.getElementById('c-ia');
    b.disabled = true; dire('Rédaction en cours…');
    P.appeler('collection:decrire', { nom: val('c-nom'), imageDataUrl: IMAGE }).then(function(r){
      b.disabled = false;
      if (!r || !r.ok) { dire(expliquer(r) + (r && r.detail ? ' — ' + r.detail : ''), 'err'); return; }
      poser('c-desc', r.texte);
      dire('Description rédigée — relisez-la avant d’enregistrer.', 'bon');
    });
  }

  function montrerImage(src){
    var v = document.getElementById('c-vign'); if (!v) return;
    v.innerHTML = src ? '<img src="' + esc(src) + '" alt="">' : 'aucune image';
  }

  // ⚠ UNE BORNE SUR LA TAILLE, ET ELLE EST DITE. Sans elle, une photo d appareil
  // de 12 Mo part en base64 — un tiers plus lourd encore — dans un message entre
  // fenetres, puis dans le televersement. La fenetre parait figee, sans raison.
  var MAX_MO = 8;
  function lireFichier(){
    var f = this.files && this.files[0]; if (!f) return;
    if (f.size > MAX_MO * 1024 * 1024) {
      dire('Image trop lourde (' + Math.round(f.size / 1048576) + ' Mo). Maximum ' + MAX_MO + ' Mo.', 'err');
      this.value = ''; return;
    }
    var l = new FileReader();
    l.onload = function(){ IMAGE = String(l.result || ''); montrerImage(IMAGE); dire(''); majIa(); };
    l.onerror = function(){ dire('Lecture du fichier impossible.', 'err'); };
    l.readAsDataURL(f);
  }

  function verrou(){
    if (!ID) return Promise.resolve();
    return P.appeler('verrou:prendre', 'collections', ID).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      if (v.obtenu) { sous.textContent = v.horsLigne ? '🔓 hors ligne' : '🔒 Section verrouillée en modification par : ' + (v.par || 'vous'); return; }
      sous.textContent = '⚠ ouverte par ' + (v.parQui || 'quelqu’un d’autre');
      bEnr.disabled = true;
      dire('Enregistrement bloqué : cette fiche est ouverte ailleurs.', 'err');
    });
  }

  function charger(){
    P.appeler('collection:contexte').then(function(c){
      if (!c || !c.ok) { vide('Formulaire indisponible', expliquer(c)); return; }
      CTX = c;
      return P.appeler('collection:lire', ID).then(function(r){
        if (!r || !r.ok) { vide('Fiche indisponible', expliquer(r)); return; }
        document.getElementById('titre').textContent = ID ? 'Modifier la collection' : 'Nouvelle collection';
        dessiner(r.fiche);
        szBrouillonProposer();
        return verrou();
      });
    });
  }

  /* ══ LE BROUILLON DE L ASSISTANT COLLECTION ═════════════════════
     Le nom, une description en texte libre (souvent redigee par l IA, donc payee),
     la saison, l annee, et LE CHOIX DES PRODUITS — qui peut representer plusieurs
     minutes de selection dans un catalogue entier. Le tout ne vit que dans le DOM
     et dans deux variables de la page.
     ⚠ L IMAGE DE COUVERTURE N ENTRE PAS DANS LE BROUILLON. Une image deposee est
     une chaine base64 de plusieurs centaines de kilo-octets : la mettre dans le
     brouillon ferait tomber le quota du stockage a chaque frappe, et sacrifierait
     les brouillons des autres formulaires pour garder une vignette qu on peut
     redeposer en un clic. On garde le TRAVAIL, pas le fichier.
     ⚠ Comme pour l assistant Fournisseur, on ne branche AUCUN chemin de
     fermeture : Annuler, Echap et le X du cadre aboutissent tous au garde de la
     coquille, qui pose la question une seule fois. */
  var BR_CHAMPS = ['c-nom', 'c-desc', 'c-saison', 'c-annee', 'c-actif'];
  szBrouillonBrancher({
    portee: 'collection',
    libelle: ID ? 'Une modification de cette collection' : 'Une collection',
    ttlMin: 720,
    cle: function(){ return ID ? ('col:' + ID) : '__new__'; },
    actif: function(){ return !!document.getElementById('c-nom'); },
    valeurs: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, []);
      if (v) v._prods = Object.keys(CHOISIS).filter(function(k){ return CHOISIS[k]; });
      return v;
    },
    rempli: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, []); if (!v) return false;
      if (szBrouillonQuelqueChose(v, ['c-nom', 'c-desc'])) return true;
      return Object.keys(CHOISIS).some(function(k){ return CHOISIS[k]; });
    },
    remplir: function(v){
      szBrouillonAuDom(v);
      /* On repose la selection dans la variable qui fait foi, puis on redessine la
         liste : cocher les cases sans toucher CHOISIS donnerait un ecran qui montre
         une selection que l enregistrement ignorerait. */
      CHOISIS = {};
      (v._prods || []).forEach(function(k){ CHOISIS[k] = true; });
      /* ⚠ PAGI.dessiner(), PAS brancher() : brancher pose les ecouteurs, et le
         rappeler les poserait une seconde fois — un clic compterait double. C est
         dessiner qui repeint les lignes, donc les cases cochees. */
      if (PAGI && PAGI.dessiner) PAGI.dessiner();
    },
  });
  szBrouillonEcouter();

  function enregistrer(){
    if (!Assist.toutValide()) return;
    bEnr.disabled = true;
    dire(IMAGE && IMAGE.indexOf('data:') === 0 ? 'Dépôt de l’image et enregistrement…' : 'Enregistrement…');
    P.appeler('collection:enregistrer', ID, {
      name: val('c-nom').trim(),
      description: val('c-desc'),
      season: val('c-saison'),
      year: parseInt(val('c-annee'), 10) || CTX.anneeParDefaut,
      active: val('c-actif') === '1',
      coverImage: IMAGE,
      productIds: Object.keys(CHOISIS).filter(function(k){ return CHOISIS[k]; })
    }).then(function(r){
      if (!r || !r.ok) { bEnr.disabled = false; dire(expliquer(r), 'err'); return; }
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

module.exports = { pageCollection };
