'use strict';

/*
 * FENÊTRE « STUDIO VIRTUEL » — NATIVE (Catalogue, palier 5, chantier #14)
 * =============================================================================
 * Mise en scène guidée d'une photo studio (fond blanc) par Photoroom. On importe
 * une photo, on choisit UNE des trois voies, une AMBIANCE de marque, et l'on juge
 * d'abord en APERÇU GRATUIT (sandbox, filigrané) avant de dépenser un crédit.
 *
 *   👗 Mannequin virtuel — le vêtement porté par un modèle réel, décor et lumière
 *      intégrés (un seul appel). C'est la voie « pieds dans le sable ».
 *   👻 Fantôme habillé — le mannequin disparaît, puis un décor pro est posé
 *      (fond + ombre ancrée + relumière ; deux appels).
 *   📦 Produit à plat — détourage + décor + ombre + relumière (un appel).
 *
 * ⚠ TOUT LE TRAVAIL EST AU RELAIS (photoroom-proxy.php) : cette fenêtre n'envoie
 * qu'une image, une voie, une ambiance et le drapeau « aperçu ». Les clés ne la
 * traversent jamais, les crédits se comptent là-bas, l'ambiance s'y résout.
 *
 * ⚠ L'APERÇU SANDBOX EST GRATUIT ET FILIGRANÉ : c'est le levier crédits. Le bouton
 * payant s'arme en deux temps pour qu'aucun crédit ne parte par mégarde.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .credits{margin-left:auto;font-size:.74rem;color:#8fa1b8}
.tete .credits b{color:#c9a97e}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:#f0d6a0;border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-content:start}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.9rem 1rem;min-width:0;display:flex;flex-direction:column}
.carte.large{grid-column:1/-1}
.carte h2{margin:0 0 .1rem;font:700 .74rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8}
.carte .sous{margin:0 0 .7rem;font-size:.75rem;color:#6d7f96}
/* Dépôt de photo */
.depot{border:1.5px dashed #2b3444;border-radius:10px;background:#0f1724;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem;
  min-height:9rem;text-align:center;color:#8fa1b8;font-size:.82rem;padding:1rem;-webkit-user-select:none;user-select:none}
.depot:hover,.depot.survol{border-color:#c9a97e;color:#cbd8e6}
.depot .gros{font-size:1.6rem;filter:grayscale(1) brightness(1.6)}
.depot img{max-width:100%;max-height:14rem;border-radius:8px}
.depot .refaire{font-size:.72rem;color:#8fa1b8;text-decoration:underline;margin-top:.3rem}
/* Choix dans la photothèque */
.phbarre{display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem}
.phbarre .phinfo{font-size:.74rem;color:#8fa1b8;margin-left:auto;white-space:nowrap}
.phbarre #ph-q{flex:1 1 auto;min-width:6rem;max-width:22rem;font:inherit;color:#e8edf5;
  background:#0f1724;border:1px solid #2b3444;border-radius:8px;padding:.34rem .55rem}
.phbarre #ph-q:focus{outline:none;border-color:#c9a97e}
.phgrille{display:grid;grid-template-columns:repeat(auto-fill,minmax(5.5rem,1fr));gap:.5rem;
  max-height:18rem;overflow-y:auto;padding-right:.2rem}
.phgrille::-webkit-scrollbar{width:8px}
.phgrille::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.phvig{background:#0f1724;border:1px solid #2b3444;border-radius:8px;overflow:hidden;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;transition:border-color .12s}
.phvig:hover{border-color:#c9a97e}
.phvig img{width:100%;height:4.6rem;object-fit:contain;background:#0b1220}
.phvig .attente{font-size:.68rem;color:#6d7f96;padding:1.6rem .3rem}
.phvig .phnom{font-size:.64rem;color:#8fa1b8;padding:.15rem .25rem;max-width:100%;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Voies + ambiances : tuiles cliquables */
.tuiles{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.45rem}
.tuile{background:#111a29;border:1px solid rgba(255,255,255,.09);border-radius:9px;
  padding:.5rem .6rem;cursor:pointer;-webkit-user-select:none;user-select:none;
  display:flex;align-items:center;gap:.5rem;text-align:left;
  transition:border-color .12s,background .12s}
.tuile:hover{border-color:rgba(201,169,126,.5)}
.tuile.on{border-color:#c9a97e;background:rgba(201,169,126,.14)}
/* ⚠ Emoji en GRIS (comme le reste de l administration), jamais en couleur. */
.tuile .em{font-size:1.15rem;line-height:1;flex:0 0 auto;filter:grayscale(1) brightness(1.45);opacity:.9}
.tuile .txt{display:flex;flex-direction:column;min-width:0}
.tuile .t{font-size:.8rem;font-weight:700;line-height:1.2}
.tuile .d{font-size:.68rem;color:#6d7f96;line-height:1.22;margin-top:.06rem}
.amb{grid-template-columns:1fr 1fr}
/* Galerie de modèles */
.mgal{margin-top:.6rem;border-top:1px solid rgba(255,255,255,.08);padding-top:.6rem}
.mgal-barre{display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem;flex-wrap:wrap}
.mgal-info{font-size:.72rem;color:#8fa1b8;flex:1 1 12rem;min-width:0}
.mgrille{display:grid;grid-template-columns:repeat(auto-fill,minmax(6rem,1fr));gap:.5rem;
  max-height:20rem;overflow-y:auto;padding-right:.2rem}
.mvig{background:#0f1724;border:1px solid #2b3444;border-radius:9px;overflow:hidden;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;transition:border-color .12s}
.mvig:hover{border-color:rgba(201,169,126,.6)}
.mvig.on{border-color:#c9a97e;box-shadow:0 0 0 1px #c9a97e inset}
.mvig img{width:100%;height:7rem;object-fit:cover;object-position:top;background:#0b1220}
.mvig .matt{height:7rem;display:flex;align-items:center;justify-content:center;color:#6d7f96;font-size:.72rem;width:100%}
.mvig .mnom{font-size:.7rem;color:#cbd8e6;padding:.2rem .3rem}
.ch{margin:.7rem 0 0}
.ch label{display:block;margin-bottom:.25rem;font-size:.76rem;color:#8fa1b8}
select{width:100%;font:inherit;color:#e8edf5;background:#0f1724;border:1px solid #2b3444;
  border-radius:8px;padding:.4rem .5rem}
select:focus{outline:none;border-color:#c9a97e}
.bascule{display:flex;align-items:flex-start;gap:.55rem;font-size:.82rem;cursor:pointer;
  -webkit-user-select:none;user-select:none;margin:.2rem 0 0}
.bascule input{width:1.05rem;height:1.05rem;accent-color:#c9a97e;cursor:pointer;margin-top:.12rem;flex:0 0 auto}
.bascule .d{font-size:.72rem;color:#6d7f96;display:block;margin-top:.08rem}
/* Résultat */
.res{align-items:center;justify-content:center;min-height:12rem;text-align:center;color:#8fa1b8}
.res img{max-width:100%;max-height:22rem;border-radius:9px;border:1px solid rgba(255,255,255,.1)}
.res .filig{margin-top:.5rem;font-size:.74rem;color:#facc15}
.res .avis{margin-top:.4rem;font-size:.74rem;color:#8fa1b8}
.res .dims{font-size:.7rem;color:#6d7f96;margin-top:.2rem}
.res .dl{margin-top:.6rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.55rem;
  padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.42rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
button.conf{background:#f0a05a;border-color:#f0a05a;color:#241703;font-weight:700}
.vide{padding:1rem;text-align:center;color:#8fa1b8;font-size:.82rem}
@media (max-width:720px){.corps{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageStudio() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Studio virtuel — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🎨</span><h1>Studio virtuel</h1>
  <span class="credits" id="credits"></span></div>
<div class="ro" id="ro" hidden>Lecture seule : votre rôle ne permet pas de lancer de traitement.</div>
<div class="corps" id="corps"><div class="carte large"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button id="b-apercu" disabled>Aperçu gratuit</button>
  <button class="prim" id="b-final" disabled>Générer en pleine qualité</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  /* ── MODE ANCRE ── le meme bouton d'ancrage/detachement que les autres ecrans.
     La coquille appelle szModeAncre(true) quand la vue est ANCREE, (false) quand
     elle est DETACHEE ; on montre le bon libelle et on route vers le pont. */
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);'
        + 'color:#e8edf5;cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
      t.appendChild(b);
    }
    if (actif) {
      b.textContent = '⧉ Détacher';
      b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '⚓ Ancrer';
      b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var bApercu = document.getElementById('b-apercu');
  var bFinal = document.getElementById('b-final');
  var creditsEl = document.getElementById('credits');
  var RO = false, OCCUPE = false, ARME = false;
  var PHOTO = null;      // data URL d une photo importee (fichier), reduite
  var PHOTO_ID = '';     // id d une photo CHOISIE dans la phototheque (l image reste au site)
  var PHOTO_URL = '';    // adresse de la vignette choisie (affichage seulement)
  var PICKER = false;    // le choix dans la phototheque est-il ouvert ?
  var PHOTHQ = [];       // [{id,nom,apercu,enAttente}] cumule (defilement infini)
  var PH_Q = '';         // recherche courante (nom / code)
  var PH_PAGE = 0;       // derniere page chargee
  var PH_TAILLE = 60;    // photos par page
  var PH_TOTAL = 0;      // total correspondant a la recherche
  var PH_FIN = false;    // plus rien a charger
  var PH_OCC = false;    // une page est-elle en cours de chargement ?
  var PH_DEB = null;     // minuterie anti-rebond de la recherche
  var VOIE = 'humain';   // humain | fantome | plat
  var PRESET = '';       // cle d ambiance
  var PRESETS = [];      // [{cle,label,emoji,desc}]
  var RESULT = null;     // { image, essai, decorErreur, upNote, largeur, hauteur }
  var ENREG = false;     // le resultat a-t-il ete enregistre dans la phototheque ?
  // Galerie de modeles : apercus SANDBOX (gratuits) du vetement sur chaque modele,
  // pour choisir AVANT de generer en pleine qualite.
  var MODELE_SEL = 'sophia'; // modele choisi (persiste entre les rendus)
  var COMPARE = false;       // la grille de comparaison est-elle ouverte ?
  var APM = {};              // cache : modele -> data URL de l apercu
  var APM_SIG = '';          // empreinte (photo+ambiance) pour invalider le cache
  var COMPARE_STOP = false;  // demande d arret de la generation en cours

  var VOIES = [
    { cle: 'humain',  em: '👗', t: 'Mannequin virtuel', d: 'Porté par un modèle, décor intégré' },
    { cle: 'fantome', em: '👻', t: 'Fantôme habillé',   d: 'Sans mannequin, décor pro ajouté' },
    { cle: 'plat',    em: '📦', t: 'Produit à plat',    d: 'Détourage + décor + ombre' }
  ];
  // Quelques modèles (mannequin virtuel). Le relais accepte tout nom connu.
  // Les 16 modeles REELS de Photoroom (virtualModel.model.preset.name, verifies
  // dans la doc 2026-08-11). Sophia en tete = choix par defaut. Photoroom ne
  // publie pas l apparence de chaque modele : le bouton << Comparer >> genere un
  // apercu sandbox gratuit du VRAI vetement sur chacun pour choisir a l oeil.
  var MODELES = ['sophia','emma','ava','zoe','maya','lena','julia','fiona',
                 'avery','taylor','kendall','casey','sam','jordan','jackson','reece'];

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès au traitement d’image.',
    photo_absente:      'Importez d’abord une photo.',
    non_configure:      'Aucune clé Photoroom configurée (Configuration ▸ Clés API).',
    indisponible:       'Le service n’est pas prêt dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    module_photos:      'La photothèque n’a pas pu être chargée. Rechargez (Ctrl+R) ; si cela revient, reconnectez-vous.',
    version_coquille:   'Cette version de l’application ne sait pas encore ouvrir cet écran.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').'))
      + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  // Réduction locale avant l envoi : un cliché de téléphone pèserait plusieurs Mo
  // sur le pont. 3000 px sur le grand côté suffit (Photoroom rend 1K a 4K), et le
  // fond studio étant opaque, le JPEG ne coûte aucune transparence.
  function reduire(dataUrl, cb){
    try {
      var im = new Image();
      im.onload = function(){
        try {
          var max = 3000, w = im.naturalWidth, h = im.naturalHeight;
          var ech = Math.min(1, max / Math.max(w, h));
          var cw = Math.max(1, Math.round(w * ech)), chh = Math.max(1, Math.round(h * ech));
          var c = document.createElement('canvas'); c.width = cw; c.height = chh;
          c.getContext('2d').drawImage(im, 0, 0, cw, chh);
          cb(c.toDataURL('image/jpeg', 0.92));
        } catch (e) { cb(dataUrl); }
      };
      im.onerror = function(){ cb(dataUrl); };
      im.src = dataUrl;
    } catch (e) { cb(dataUrl); }
  }

  function majBoutons(){
    var pret = aUnePhoto() && !!PRESET && !RO && !OCCUPE;
    bApercu.disabled = !pret;
    bFinal.disabled = !pret;
    if (!pret && ARME) { ARME = false; bFinal.className = 'prim'; bFinal.textContent = 'Générer en pleine qualité'; }
  }

  function aUnePhoto(){ return !!PHOTO || !!PHOTO_ID; }

  function depotHtml(){
    // Une photo est déjà choisie (fichier OU photothèque) : on la montre.
    if (aUnePhoto()) {
      var apercu = PHOTO || PHOTO_URL;
      var vue = apercu
        ? '<img src="' + apercu + '" alt="photo">'
        : '<span class="gros">🖼️</span><span>Photo de la photothèque sélectionnée</span>';
      return '<div class="depot" id="depot">' + vue
        + '<span class="refaire">Choisir une autre photo</span></div>'
        + '<input type="file" id="fichier" accept="image/*" hidden>';
    }
    // Le choix dans la photothèque est ouvert : recherche + grille de vignettes,
    // chargée par pages (défilement infini) pour tenir des milliers de photos.
    if (PICKER) {
      var grille = '<div class="phgrille" id="ph-grille">' + phVignettesHtml() + '</div>';
      return '<div class="phbarre"><button id="ph-retour">← Retour</button>'
        + '<input type="search" id="ph-q" placeholder="Rechercher (nom, code)…" value="' + esc(PH_Q) + '"'
        + (RO ? ' disabled' : '') + '>'
        + '<span class="phinfo" id="ph-info"></span></div>' + grille;
    }
    // Rien de choisi : dépôt de fichier + accès à la photothèque.
    return '<div class="depot" id="depot"><span class="gros">📷</span>'
      + '<span>Glissez une photo studio ici, ou cliquez pour choisir un fichier</span>'
      + '<span style="font-size:.7rem;color:#6d7f96">Fond blanc, un vêtement — JPEG ou PNG</span></div>'
      + '<input type="file" id="fichier" accept="image/*" hidden>'
      + '<div style="text-align:center;margin-top:.5rem">'
      + '<button id="ph-ouvrir">📚 Depuis la photothèque</button></div>';
  }

  function voiesHtml(){
    return VOIES.map(function(v){
      return '<div class="tuile' + (VOIE === v.cle ? ' on' : '') + '" data-voie="' + v.cle + '">'
        + '<span class="em">' + v.em + '</span><span class="t">' + esc(v.t) + '</span>'
        + '<span class="d">' + esc(v.d) + '</span></div>';
    }).join('');
  }

  function nomModele(m){ return m.charAt(0).toUpperCase() + m.slice(1); }
  function sigActuelle(){
    var p = PHOTO_ID || (PHOTO ? (PHOTO.length + ':' + PHOTO.slice(0, 40)) : '');
    return p + '|' + PRESET;
  }
  function modeleHtml(){
    if (VOIE !== 'humain') return '';
    var h = '<div class="ch"><label>Modèle</label><select id="modele"' + (RO ? ' disabled' : '') + '>'
      + MODELES.map(function(m){ return '<option value="' + m + '"' + (MODELE_SEL === m ? ' selected' : '') + '>'
          + nomModele(m) + '</option>'; }).join('') + '</select>';
    if (aUnePhoto()) {
      h += '<div style="margin-top:.4rem"><button id="b-compare">👥 '
        + (COMPARE ? 'Masquer la comparaison' : 'Comparer les modèles (aperçu gratuit)') + '</button></div>';
    } else {
      h += '<div class="aide" style="margin-top:.3rem;font-size:.7rem;color:#6d7f96">Importez une photo pour comparer les modèles.</div>';
    }
    h += '</div>';
    if (COMPARE && aUnePhoto()) h += comparerHtml();
    return h;
  }
  function comparerHtml(){
    if (APM_SIG !== sigActuelle()) { APM = {}; APM_SIG = sigActuelle(); } // photo/ambiance changée → cache vidé
    var h = '<div class="mgal"><div class="mgal-barre">'
      + '<span class="mgal-info">Aperçus gratuits (filigranés) de votre vêtement sur chaque modèle. Cliquez-en un pour le choisir.</span>'
      + '<button id="b-mgen">Générer les aperçus</button></div><div class="mgrille">';
    h += MODELES.map(function(m){
      var im = APM[m];
      var vis = im ? '<img src="' + im + '" alt="' + esc(m) + '">' : '<span class="matt">à générer</span>';
      return '<div class="mvig' + (MODELE_SEL === m ? ' on' : '') + '" data-mod="' + esc(m) + '">' + vis
        + '<span class="mnom">' + esc(nomModele(m)) + '</span></div>';
    }).join('');
    return h + '</div></div>';
  }
  function majVig(m){
    var v = corps.querySelector('[data-mod="' + m + '"]');
    if (v && APM[m]) v.innerHTML = '<img src="' + APM[m] + '" alt="' + esc(m) + '">'
      + '<span class="mnom">' + esc(nomModele(m)) + '</span>';
  }

  function ambiancesHtml(){
    if (!PRESETS.length) return '<div class="vide">Aucune ambiance.</div>';
    return '<div class="tuiles amb">' + PRESETS.map(function(p){
      return '<div class="tuile' + (PRESET === p.cle ? ' on' : '') + '" data-preset="' + esc(p.cle) + '">'
        + '<span class="em">' + (p.emoji || '🎨') + '</span><span class="t">' + esc(p.label) + '</span>'
        + '<span class="d">' + esc(p.desc || '') + '</span></div>';
    }).join('') + '</div>';
  }

  function resultatHtml(){
    if (!RESULT) return '<div class="vide">L’image apparaîtra ici. Commencez par un <strong>aperçu gratuit</strong>.</div>';
    var h = '<img src="' + RESULT.image + '" alt="résultat">';
    if (RESULT.essai) h += '<div class="filig">⚠ Aperçu filigrané (sandbox) — gratuit. « Générer en pleine qualité » retire le filigrane.</div>';
    if (RESULT.decorErreur) h += '<div class="filig">⚠ Le décor n’a pas pu être appliqué : ' + esc(RESULT.decorErreur) + '</div>';
    if (RESULT.upNote) h += '<div class="avis">' + esc(RESULT.upNote) + '</div>';
    if (RESULT.largeur) h += '<div class="dims">' + RESULT.largeur + ' × ' + RESULT.hauteur + ' px</div>';
    h += '<div class="dl"><button id="b-dl">Télécharger l’image</button> '
      + '<button id="b-save"' + (ENREG ? ' disabled' : '') + '>' + (ENREG ? '✓ Dans la photothèque' : '💾 Enregistrer dans la photothèque') + '</button></div>';
    return h;
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    var h = [];
    h.push('<div class="carte"><h2>1 · Photo</h2>'
      + '<p class="sous">La photo de départ, prise en studio sur fond blanc.</p>' + depotHtml() + '</div>');
    h.push('<div class="carte"><h2>2 · Voie</h2>'
      + '<p class="sous">Comment mettre le vêtement en valeur.</p>'
      + '<div class="tuiles">' + voiesHtml() + '</div>' + modeleHtml() + '</div>');
    h.push('<div class="carte large"><h2>3 · Ambiance</h2>'
      + '<p class="sous">Un clic règle décor, ombre ancrée et lumière. Réglable au besoin plus tard.</p>'
      + ambiancesHtml() + '</div>');
    h.push('<div class="carte large res" id="res">' + resultatHtml() + '</div>');
    corps.innerHTML = h.join('');
    brancher();
    majBoutons();
  }

  function brancher(){
    var depot = document.getElementById('depot');
    var fichier = document.getElementById('fichier');
    if (depot && fichier && !RO && !aUnePhoto()) {
      depot.onclick = function(){ fichier.click(); };
      depot.ondragover = function(e){ e.preventDefault(); depot.classList.add('survol'); };
      depot.ondragleave = function(){ depot.classList.remove('survol'); };
      depot.ondrop = function(e){ e.preventDefault(); depot.classList.remove('survol');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) lireFichier(e.dataTransfer.files[0]); };
      fichier.onchange = function(){ if (fichier.files && fichier.files[0]) lireFichier(fichier.files[0]); };
    }
    // « Choisir une autre photo » : on repart de zéro.
    if (depot && aUnePhoto() && !RO) { depot.onclick = function(){ reinitPhoto(); }; }
    var phO = document.getElementById('ph-ouvrir'); if (phO) phO.onclick = ouvrirPicker;
    var phR = document.getElementById('ph-retour'); if (phR) phR.onclick = function(){ PICKER = false; PHOTHQ = []; PH_Q = ''; dessiner(); };
    var phQ = document.getElementById('ph-q');
    if (phQ) {
      phQ.oninput = function(){ phRecherche(phQ.value); };
      phQ.onsearch = function(){ if (PH_DEB) { clearTimeout(PH_DEB); PH_DEB = null; } PH_Q = String(phQ.value || '').trim(); PH_PAGE = 0; PH_FIN = false; phChargerPage(true); };
    }
    var phG = document.getElementById('ph-grille');
    if (phG) {
      phBrancherVignettes(phG);
      phG.onscroll = function(){
        if (PH_OCC || PH_FIN) return;
        if (phG.scrollTop + phG.clientHeight >= phG.scrollHeight - 120) phChargerPage(false);
      };
      majPhInfo();
    }
    corps.querySelectorAll('[data-voie]').forEach(function(el){
      el.onclick = function(){ if (RO || OCCUPE) return; VOIE = el.getAttribute('data-voie'); RESULT = null; dessiner();
        dire('Voie : ' + VOIE + '.', 'att'); };
    });
    corps.querySelectorAll('[data-preset]').forEach(function(el){
      el.onclick = function(){ if (RO || OCCUPE) return; PRESET = el.getAttribute('data-preset'); dessiner(); };
    });
    var mod = document.getElementById('modele');
    if (mod) mod.onchange = function(){ MODELE_SEL = mod.value; };
    var bc = document.getElementById('b-compare');
    if (bc) bc.onclick = function(){ if (RO) return; COMPARE = !COMPARE; dessiner(); };
    var bm = document.getElementById('b-mgen');
    if (bm) bm.onclick = genererApercusModeles;
    corps.querySelectorAll('[data-mod]').forEach(function(el){
      el.onclick = function(){ choisirModele(el.getAttribute('data-mod')); };
    });
    var dl = document.getElementById('b-dl');
    if (dl && RESULT) dl.onclick = telecharger;
    var sv = document.getElementById('b-save');
    if (sv && RESULT) sv.onclick = enregistrerResultat;
  }

  function choisirModele(m){
    MODELE_SEL = m;
    COMPARE_STOP = true;       // si une génération tourne, on l'arrête
    COMPARE = false;
    dessiner();
    dire('Modèle : ' + nomModele(m) + '.', 'bon');
  }

  // Génère (ou arrête) les aperçus SANDBOX du vêtement sur chaque modèle. Séquentiel
  // (le pont porte une image à la fois), avec progression et arrêt.
  var COMPARE_OCC = false;
  function genererApercusModeles(){
    if (COMPARE_OCC) { COMPARE_STOP = true; return; }   // 2e clic = Arrêter
    if (RO || OCCUPE || !aUnePhoto()) return;
    if (APM_SIG !== sigActuelle()) { APM = {}; APM_SIG = sigActuelle(); }
    var todo = MODELES.filter(function(m){ return !APM[m]; });
    if (!todo.length) { dire('Tous les aperçus sont déjà générés — cliquez un modèle.', 'att'); return; }
    COMPARE_OCC = true; COMPARE_STOP = false;
    bApercu.disabled = true; bFinal.disabled = true;
    var bm = document.getElementById('b-mgen'); if (bm) bm.textContent = 'Arrêter';
    var i = 0;
    function fini(msg, cl){
      COMPARE_OCC = false; bApercu.disabled = RO; bFinal.disabled = RO;
      var b = document.getElementById('b-mgen'); if (b) b.textContent = 'Générer les aperçus';
      majBoutons(); dire(msg, cl);
    }
    function suite(){
      if (COMPARE_STOP) { fini('Arrêté.', 'att'); return; }
      if (i >= todo.length) { fini('Aperçus prêts — cliquez le modèle qui vous plaît.', 'bon'); return; }
      var m = todo[i]; i++;
      dire('Aperçu ' + i + '/' + todo.length + ' — ' + nomModele(m) + '…');
      var s = { geste: 'humain', preset: PRESET, apercu: true, options: { modele: m } };
      if (PHOTO_ID) s.photoId = PHOTO_ID; else s.image = PHOTO;
      appeler('studio:traiter', [s]).then(function(r){
        if (r && r.ok && r.image) { APM[m] = r.image; majVig(m); }
        suite();
      });
    }
    suite();
  }

  function reinitPhoto(){
    PHOTO = null; PHOTO_ID = ''; PHOTO_URL = ''; PICKER = false; RESULT = null; ENREG = false;
    dessiner();
  }

  function lireFichier(f){
    if (!f || String(f.type).indexOf('image/') !== 0) { dire('Ce n’est pas une image.', 'err'); return; }
    dire('Lecture de la photo…');
    var fr = new FileReader();
    fr.onload = function(){ reduire(String(fr.result || ''), function(petite){
      PHOTO = petite; PHOTO_ID = ''; PHOTO_URL = ''; PICKER = false; RESULT = null; ENREG = false;
      dessiner(); dire('Photo prête.', 'bon'); }); };
    fr.onerror = function(){ dire('Lecture impossible.', 'err'); };
    fr.readAsDataURL(f);
  }

  // Grille de vignettes (partagee : rendu initial + rafraichissements de page).
  function phVignettesHtml(){
    if (!PHOTHQ.length) {
      return '<div class="vide" style="grid-column:1/-1">'
        + (PH_Q ? 'Aucune photo ne correspond à « ' + esc(PH_Q) + ' ».' : 'Photothèque vide.') + '</div>';
    }
    return PHOTHQ.map(function(p){
      var img = p.apercu
        ? '<img src="' + esc(p.apercu) + '" alt="' + esc(p.nom) + '" loading="lazy">'
        : '<span class="attente">en cours…</span>';
      return '<div class="phvig" data-ph="' + esc(p.id) + '" title="' + esc(p.nom) + '">'
        + img + '<span class="phnom">' + esc(p.nom) + '</span></div>';
    }).join('');
  }
  function majPhInfo(txt){
    var el = document.getElementById('ph-info');
    if (!el) return;
    if (txt != null) { el.textContent = txt; return; }
    if (PH_TOTAL <= 0) { el.textContent = PH_Q ? '0 résultat' : ''; return; }
    el.textContent = PHOTHQ.length + ' sur ' + PH_TOTAL + (PH_FIN ? '' : ' — défilez pour en voir plus');
  }
  // Rafraichit UNIQUEMENT la grille + le compteur (garde le focus dans la recherche).
  function phMajGrille(){
    var g = document.getElementById('ph-grille');
    if (g) { g.innerHTML = phVignettesHtml(); phBrancherVignettes(g); }
    majPhInfo();
  }
  function phBrancherVignettes(g){
    g.querySelectorAll('[data-ph]').forEach(function(el){
      el.onclick = function(){ if (OCCUPE) return; choisirPhoto(el.getAttribute('data-ph')); };
    });
  }
  // Charge une page. reset=true : nouvelle recherche (remplace) ; sinon : ajoute la suivante.
  function phChargerPage(reset){
    if (PH_OCC || RO) return;
    if (!reset && PH_FIN) return;
    PH_OCC = true;
    var page = reset ? 0 : (PH_PAGE + 1);
    majPhInfo(reset ? 'Recherche…' : 'Chargement…');
    appeler('studio:phototheque', [{ q: PH_Q, page: page, taille: PH_TAILLE }]).then(function(r){
      PH_OCC = false;
      if (!PICKER) return;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); majPhInfo(''); return; }
      var lot = r.photos || [];
      PHOTHQ = reset ? lot : PHOTHQ.concat(lot);
      PH_PAGE = (r.page != null) ? r.page : page;
      PH_TOTAL = (r.total != null) ? r.total : PHOTHQ.length;
      PH_FIN = (PHOTHQ.length >= PH_TOTAL) || (lot.length === 0);
      phMajGrille();
      dire('');
      // La page etait pleine mais la grille ne deborde pas encore : on tire la suivante.
      if (!PH_FIN && reset) phPeutEtreEncore();
    });
  }
  // Si la grille n'est pas encore assez remplie pour defiler, charge une page de plus.
  function phPeutEtreEncore(){
    var g = document.getElementById('ph-grille');
    if (g && !PH_FIN && !PH_OCC && g.scrollHeight <= g.clientHeight + 4) phChargerPage(false);
  }
  function ouvrirPicker(){
    if (RO || OCCUPE) return;
    PICKER = true; PHOTHQ = []; PH_Q = ''; PH_PAGE = 0; PH_TOTAL = 0; PH_FIN = false; PH_OCC = false;
    dessiner(); dire('Chargement de la photothèque…');
    phChargerPage(true);
    var q = document.getElementById('ph-q'); if (q) { try { q.focus(); } catch (e) {} }
  }
  function phRecherche(v){
    if (PH_DEB) clearTimeout(PH_DEB);
    PH_DEB = setTimeout(function(){
      PH_DEB = null;
      PH_Q = String(v || '').trim();
      PH_PAGE = 0; PH_FIN = false;
      phChargerPage(true);
    }, 250);
  }

  function choisirPhoto(id){
    var p = null;
    for (var i = 0; i < PHOTHQ.length; i++) { if (PHOTHQ[i].id === id) { p = PHOTHQ[i]; break; } }
    if (!p) return;
    PHOTO = null; PHOTO_ID = id; PHOTO_URL = p.apercu || ''; PICKER = false; RESULT = null; ENREG = false;
    dessiner(); dire('Photo choisie : ' + (p.nom || id) + '.', 'bon');
  }

  function occuper(o){
    OCCUPE = o;
    corps.querySelectorAll('button, [data-voie], [data-preset], [data-ph], .depot').forEach(function(b){
      if (b.tagName === 'BUTTON') b.disabled = o; });
    majBoutons();
    var pret = aUnePhoto() && !!PRESET && !RO;
    bApercu.disabled = o || !pret;
    bFinal.disabled = o || !pret;
  }

  function saisie(apercu){
    var s = { geste: VOIE, preset: PRESET, apercu: apercu };
    if (PHOTO_ID) { s.photoId = PHOTO_ID; } else { s.image = PHOTO; }
    if (VOIE === 'humain') {
      var sel = document.getElementById('modele');
      if (sel) MODELE_SEL = sel.value;   // le menu déroulant reste la source si présent
      s.options = { modele: MODELE_SEL || 'sophia' };
    }
    return s;
  }

  function enregistrerResultat(){
    if (!RESULT || !RESULT.image || OCCUPE) return;
    if (ENREG) { dire('Déjà enregistrée dans la photothèque.', 'att'); return; }
    occuper(true); dire('Enregistrement dans la photothèque…');
    appeler('studio:enregistrer', [{ image: RESULT.image, nom: 'studio-' + VOIE + '-' + PRESET }]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        ENREG = true;
        var sv = document.getElementById('b-save');
        if (sv) { sv.textContent = '✓ Dans la photothèque'; sv.disabled = true; }
        dire('Enregistrée dans la photothèque — vous pouvez l’attacher à un article de là.', 'bon');
      } else dire(expliquer(r), 'err');
    });
  }

  function lancer(apercu){
    if (RO || OCCUPE) return;
    if (!aUnePhoto()) { dire('Importez d’abord une photo.', 'err'); return; }
    if (!PRESET) { dire('Choisissez une ambiance.', 'err'); return; }
    occuper(true);
    dire(apercu ? 'Aperçu gratuit en cours…' : 'Génération en pleine qualité…');
    appeler('studio:traiter', [saisie(apercu)]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        ENREG = false;
        RESULT = { image: r.image, essai: !!r.essai, decorErreur: r.decorErreur || '',
                   upNote: r.upNote || '', largeur: r.largeur || 0, hauteur: r.hauteur || 0 };
        var res = document.getElementById('res');
        if (res) {
          res.innerHTML = resultatHtml();
          var dl = document.getElementById('b-dl'); if (dl) dl.onclick = telecharger;
          var sv = document.getElementById('b-save'); if (sv) sv.onclick = enregistrerResultat;
        }
        dire(apercu ? 'Aperçu prêt (gratuit).' : 'Image générée.', 'bon');
        if (!apercu) chargerCredits();
      } else {
        dire(expliquer(r), 'err');
      }
    });
  }

  // Aperçu : gratuit, part directement.
  bApercu.onclick = function(){ lancer(true); };
  // Pleine qualité : consomme des crédits → armement en deux temps.
  bFinal.onclick = function(){
    if (RO || OCCUPE) return;
    if (!ARME) {
      ARME = true; bFinal.className = 'prim conf'; bFinal.textContent = 'Confirmer (consomme des crédits)';
      dire('Un clic de plus lance un vrai rendu payant.', 'att');
      return;
    }
    ARME = false; bFinal.className = 'prim'; bFinal.textContent = 'Générer en pleine qualité';
    lancer(false);
  };

  function telecharger(){
    if (!RESULT || !RESULT.image) return;
    try {
      var a = document.createElement('a');
      a.href = RESULT.image;
      a.download = 'studio-' + VOIE + '-' + PRESET + '.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      dire('Téléchargement lancé.', 'bon');
    } catch (e) { dire('Téléchargement impossible.', 'err'); }
  }

  function chargerCredits(){
    appeler('studio:compte').then(function(r){
      if (!r || !r.ok) { creditsEl.textContent = ''; return; }
      var dispo = r.compte && r.compte.available != null ? r.compte.available : null;
      var sb = r.sandbox || {};
      var t = '';
      if (dispo != null) t += 'Crédits : <b>' + dispo + '</b>';
      if (sb.utilise != null) t += (t ? ' · ' : '') + 'Aperçus ce mois : ' + sb.utilise + (sb.quotaMois ? ' / ' + sb.quotaMois : '');
      creditsEl.innerHTML = t;
    });
  }

  function charger(){
    dire('Chargement des ambiances…');
    appeler('studio:presets').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte large"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      PRESETS = r.presets || [];
      dessiner();
      dire('');
      chargerCredits();
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageStudio };
