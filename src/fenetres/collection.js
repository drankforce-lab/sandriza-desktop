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

const { CSS_SOCLE, CSS_JOUR, CSS_FICHE, JS_SOCLE, JS_BROUILLON, ICO, TETE } = require('./socle');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit — jamais le nom, la description ni
   la saison d une collection (voir src/langue/collection.js). */
const T = require('../langue').tr('collection');

const CSS_PROPRE = `
.photo{display:flex;gap:.85rem;align-items:flex-start}
.photo .vign{flex:0 0 auto;width:140px;height:140px;border-radius:10px;
  border:1px dashed var(--v18);display:flex;align-items:center;
  justify-content:center;color:var(--tx2);font-size:.75rem;overflow:hidden;text-align:center}
.photo .vign img{width:100%;height:100%;object-fit:cover}
.photo .cmd{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:.45rem}
`;

/** Page complète de l'assistant. `id` vide = création. */
function pageCollection(id) {
  const ident = JSON.stringify(String(id || ''));
  return `${TETE()}
<title>${T("Collection — Administration Sandriza")}</title>
<style>${CSS_SOCLE}${CSS_FICHE}${CSS_PROPRE}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.collections}</span><h1 id="titre">${T("Collection")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="pas" id="pas"></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions">
    <button id="btn-prec">${T("Précédent")}</button>
    <button id="btn-suiv">${T("Suivant")}</button>
    <button id="btn-annuler">${T("Annuler")}</button>
    <button id="btn-enr" class="prim" disabled>${T("Enregistrer")}</button>
  </span></div>
<script>
(function(){
  'use strict';
  ${JS_SOCLE()}
  ${JS_BROUILLON()}

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

    h.push('<div class="etape"><div class="carte"><h2>${T("La collection")}</h2><div class="grille">'
      + '<div class="ch large"><label for="c-nom">Nom <span class="req">*</span></label><input id="c-nom"></div>'
      + '<div class="ch large"><label for="c-desc">Description</label>'
      + '<textarea id="c-desc" rows="4"></textarea>'
      + '<div style="margin-top:.35rem">'
      + '<button type="button" id="c-ia"><span class="ic">✨</span>${T(" Rédiger avec l’IA")}</button></div></div>'
      + '<div class="ch"><label for="c-saison">${T("Saison")}</label><select id="c-saison">'
      + CTX.saisons.map(function(s){ return '<option value="' + esc(s) + '">' + (s ? esc(s) : '—') + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="c-annee">${T("Année")}</label><select id="c-annee">'
      + CTX.annees.map(function(a){ return '<option value="' + a + '">' + a + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="c-actif">${T("Statut")}</label><select id="c-actif">'
      + '<option value="1">${T("Active")}</option><option value="0">${T("Inactive")}</option></select></div>'
      + '</div></div></div>');

    h.push('<div class="etape"><div class="carte"><h2>${T("Image de couverture")}</h2><div class="photo">'
      + '<div class="vign" id="c-vign">${T("aucune image")}</div><div class="cmd">'
      + '<input type="file" id="c-fichier" accept="image/*">'
      + '<button type="button" id="c-vider">${T("Retirer l’image")}</button>'
      + '<div class="aide">'
      + '${T("L’image est déposée dans le stockage au moment de l’enregistrement, comme partout ailleurs dans l’administration. Maximum 8 Mo.")}'
      + '</div>'
      + '</div></div></div></div>');

    h.push('<div class="etape"><div class="carte plein" id="c-zone"><h2>${T("Produits de la collection")}</h2>'
      + '<div class="rech"><input aria-label="${T("Filtrer par nom")}" placeholder="${T("Filtrer par nom…")}"><span class="cpt" id="c-cpt"></span></div>'
      + '<div class="liste"></div><div class="pagi"></div></div></div>');

    document.getElementById('corps').innerHTML = h.join('')
      + '<aside class="pf-fiche" id="pf-fiche" aria-label="${T("Fiche de la collection")}"></aside>';
    // Le volet suit chaque saisie ; l image et le choix des produits, qui ne
    // passent pas tous par un champ, le rappellent eux-memes.
    var corpsEl = document.getElementById('corps');
    corpsEl.addEventListener('input', majFicheBientot);
    corpsEl.addEventListener('change', majFicheBientot);

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
      majFicheBientot();
    });

    Assist.poser([
      { t: '${T("La collection")}', obl: ['c-nom'] },
      { t: 'Image',         obl: [] },
      { t: '${T("Produits")}',      obl: [] }
    ], function(i){ if (i === 2 && PAGI) PAGI.dessiner(); });
    majFiche();

    bEnr.disabled = !(ID ? CTX.peutModifier : CTX.peutAjouter);
    if (bEnr.disabled) dire('${T("Consultation seulement — votre rôle ne permet pas d’enregistrer.")}', 'att');
  }

  /* ══ LE VOLET « FICHE » (2026-10-01, le meme que celui du Produit) ══════
     ⚠ IL NE DECIDE RIEN : il relit les champs, IMAGE et CHOISIS — les memes
     sources que enregistrer(). « Pour enregistrer » reprend son seul garde
     (le nom, exige aussi par le pont) ; un clic mene a l etape. */
  var FICHE_T = null;
  function majFicheBientot(){ clearTimeout(FICHE_T); FICHE_T = setTimeout(majFiche, 60); }
  function majFiche(){
    var z = document.getElementById('pf-fiche');
    if (!z || !CTX) return;
    var nom = String(val('c-nom') || '').trim();
    var quand = [val('c-saison'), val('c-annee')].filter(Boolean).join(' ');
    var ids = Object.keys(CHOISIS).filter(function(k){ return CHOISIS[k]; });
    var parId = {}; (CTX.produits || []).forEach(function(p){ parId[p.id] = p; });
    var actif = val('c-actif') !== '0';
    var h = '<div class="ph">' + (IMAGE ? '<img src="' + esc(IMAGE) + '" alt="">'
          : '<span><span class="ico">${ICO.image}</span><br>${T("Aucune image de couverture")}</span>') + '</div>';
    h += '<div><div class="nm' + (nom ? '' : ' sansnom') + '">' + esc(nom || '${T("Sans nom")}') + '</div>'
      + (quand ? '<div class="so">' + esc(quand) + '</div>' : '') + '</div>';
    var ligne = function(k, v){ return '<div class="l"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; };
    h += ligne('${T("Produits")}', ids.length ? esc(szNombre(ids.length) + ' ' + szPl(ids.length, '${T("produit")}', '${T("produits")}')) : '—');
    h += ligne('${T("Boutique")}', '<span class="etat ' + (actif ? 'on">${T("Active")}' : 'off">${T("Inactive")}') + '</span>');
    // Les premiers produits choisis, dans l ordre du catalogue : on voit la
    // collection prendre forme sans retourner a l etape 3.
    var noms = (CTX.produits || []).filter(function(p){ return CHOISIS[p.id]; }).map(function(p){ return p.nom; });
    var hors = ids.filter(function(k){ return !parId[k]; }).length;
    if (noms.length || hors) {
      var MAXL = 6, vus = noms.slice(0, MAXL), reste = noms.length - vus.length + hors;
      h += '<div class="sel"><div class="t">${T("Dans la collection")}</div>'
        + vus.map(function(n){ return '<div>' + esc(n) + '</div>'; }).join('')
        + (reste > 0 ? '<div class="plus">+ ' + esc(szNombre(reste) + ' ' + szPl(reste, '${T("autre")}', '${T("autres")}')) + '</div>' : '')
        + '</div>';
    }
    var manque = [];
    if (!nom) manque.push([0, '${T("Nom de la collection")}']);
    h += '<div class="reste">' + (manque.length
      ? '<div class="t">${T("Pour enregistrer")}</div>' + manque.map(function(m){
          return '<button type="button" data-pfaller="' + m[0] + '"><span class="o"></span>' + m[1] + '</button>'; }).join('')
      : '<div class="ok"><span class="ic">✓</span> ${T("Prête à enregistrer")}</div>') + '</div>';
    z.innerHTML = h;
    z.querySelectorAll('[data-pfaller]').forEach(function(b){
      b.onclick = function(){ Assist.aller(parseInt(b.getAttribute('data-pfaller'), 10) || 0); };
    });
  }

  // Le bouton n a de sens qu avec une image : le service la regarde. On le DIT
  // au lieu de laisser cliquer pour rien.
  function majIa(){
    var b = document.getElementById('c-ia');
    if (!b) return;
    b.disabled = !IMAGE;
    b.title = IMAGE
      ? '${T("Analyse l’image de couverture et propose une description.")}'
      : '${T("Ajoutez d’abord une image à l’étape « Image » : le service la regarde.")}';
  }
  function rediger(){
    var b = document.getElementById('c-ia');
    b.disabled = true; dire('${T("Rédaction en cours…")}');
    P.appeler('collection:decrire', { nom: val('c-nom'), imageDataUrl: IMAGE }).then(function(r){
      b.disabled = false;
      if (!r || !r.ok) { dire(expliquer(r) + (r && r.detail ? ' — ' + r.detail : ''), 'err'); return; }
      poser('c-desc', r.texte);
      dire('${T("Description rédigée — relisez-la avant d’enregistrer.")}', 'bon');
    });
  }

  function montrerImage(src){
    var v = document.getElementById('c-vign'); if (!v) return;
    v.innerHTML = src ? '<img src="' + esc(src) + '" alt="">' : '${T("aucune image")}';
    majFicheBientot();
  }

  // ⚠ UNE BORNE SUR LA TAILLE, ET ELLE EST DITE. Sans elle, une photo d appareil
  // de 12 Mo part en base64 — un tiers plus lourd encore — dans un message entre
  // fenetres, puis dans le televersement. La fenetre parait figee, sans raison.
  var MAX_MO = 8;
  function lireFichier(){
    var f = this.files && this.files[0]; if (!f) return;
    if (f.size > MAX_MO * 1024 * 1024) {
      dire('${T("Image trop lourde (")}' + Math.round(f.size / 1048576) + '${T(" Mo). Maximum ")}' + MAX_MO + ' Mo.', 'err');
      this.value = ''; return;
    }
    var l = new FileReader();
    l.onload = function(){ IMAGE = String(l.result || ''); montrerImage(IMAGE); dire(''); majIa(); };
    l.onerror = function(){ dire('${T("Lecture du fichier impossible.")}', 'err'); };
    l.readAsDataURL(f);
  }

  function verrou(){
    if (!ID) return Promise.resolve();
    return P.appeler('verrou:prendre', 'collections', ID).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      /* ⚠ AUCUN PICTOGRAMME ICI, ET C EST LA REGLE DE TOUTE L INTERFACE. Ces
         trois signes (verrou ouvert, verrou ferme, attention) reviennent EN
         COULEUR sur certains postes, alors que l interface tient les siens en
         gris par la classe ic — et textContent ne peut pas porter de balise.
         Les onze autres fenetres a verrou ecrivent deja cette phrase sans
         signe ; celle-ci etait la seule a diverger, cachee au banc des
         pictogrammes par le faux commentaire qu ouvrait le type de fichier
         accepte par le selecteur d image, 110 lignes plus haut. */
      if (v.obtenu) { sous.textContent = v.horsLigne ? '${T("hors ligne")}' : '${T("Section verrouillée en modification par :")} ' + (v.par || '${T("vous")}'); return; }
      sous.textContent = '${T("ouverte par ")}' + (v.parQui || '${T("quelqu’un d’autre")}');
      bEnr.disabled = true;
      dire('${T("Enregistrement bloqué : cette fiche est ouverte ailleurs.")}', 'err');
    });
  }

  function charger(){
    P.appeler('collection:contexte').then(function(c){
      if (!c || !c.ok) { vide('${T("Formulaire indisponible")}', expliquer(c)); return; }
      CTX = c;
      return P.appeler('collection:lire', ID).then(function(r){
        if (!r || !r.ok) { vide('${T("Fiche indisponible")}', expliquer(r)); return; }
        document.getElementById('titre').textContent = ID ? '${T("Modifier la collection")}' : '${T("Nouvelle collection")}';
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
    libelle: ID ? '${T("Une modification de cette collection")}' : '${T("Une collection")}',
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
      majFicheBientot();
    },
  });
  szBrouillonEcouter();

  function enregistrer(){
    if (!Assist.toutValide()) return;
    bEnr.disabled = true;
    dire(IMAGE && IMAGE.indexOf('data:') === 0 ? '${T("Dépôt de l’image et enregistrement…")}' : '${T("Enregistrement…")}');
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
      dire('${T("Enregistré.")}', 'bon');
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
