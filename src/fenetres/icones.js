'use strict';

/*
 * FENÊTRE « ICÔNES PERSONNALISÉES » — NATIVE (Configuration, palier 5, 5e onglet)
 * =============================================================================
 * Les petites images réutilisables par leur code dans n'importe quel texte du
 * site, et le convertisseur d'image en fichier .ico. Aucun secret.
 *
 * ⚠ AUCUN TRAITEMENT D'IMAGE ICI. La fenêtre lit un fichier et n'envoie qu'un
 * `data:` ; le redimensionnement, le retrait de fond, le dépôt dans le stockage
 * et la conversion .ico se font au cœur, dans la fenêtre principale. C'est le
 * patron de la photothèque, et il vaut aussi pour le TÉLÉCHARGEMENT : un .ico
 * demandé d'ici part de la fenêtre principale, où vit le suivi des fichiers
 * téléchargés. La fenêtre n'obtient qu'un verdict et le nom du fichier.
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
.tete .cpt{font-size:.73rem;color:#8fa1b8;margin-left:auto}
/* ⚠ LE BANDEAU DE LECTURE SEULE VIT HORS DE LA GRILLE (voir marque.js) :
   dedans, il occuperait une piste et empecherait les cartes de remplir. */
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:#f0d6a0;border-radius:9px;
  padding:.5rem .7rem;font-size:.78rem}
/* ⚠⚠ PAS DE << grid-column:1/-1 >> DANS UNE GRILLE auto-fit. Une carte qui
   s etend sur toute la ligne OCCUPE la derniere piste : auto-fit ne la voit plus
   vide, ne la replie plus, et les cartes voisines cessent de remplir la largeur
   (vu au rendu le 2026-08-10, deux fois : le bandeau de lecture seule, puis la
   liste des icones). Le corps est donc une COLONNE, et seules les cartes qui
   doivent se partager une ligne vivent dans une << rangee >>. */
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:1rem}
/* ⚠ LES CARTES D UNE MEME RANGEE SE TERMINENT A LA MEME HAUTEUR (2026-08-10,
   capture a l appui). Avec << align-items:start >>, chacune prenait sa hauteur
   naturelle et la rangee finissait en escalier. On laisse donc l etirement par
   defaut, et les contenus restent en haut de leur carte. */
.rangee{display:grid;grid-template-columns:repeat(auto-fit,minmax(28rem,1fr));gap:1rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:1rem 1.1rem;margin:0;min-width:0}
.carte h2{margin:0 0 .2rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8}
.carte .sous{margin:0 0 .9rem;font-size:.78rem;color:#6d7f96}
.ch{margin:0 0 .8rem}
.ch label{display:block;margin-bottom:.25rem;font-size:.78rem;color:#8fa1b8}
.ch input[type=text]{width:100%;font:inherit;color:#e8edf5;background:#0f1724;
  border:1px solid #2b3444;border-radius:8px;padding:.42rem .55rem}
.ch input[type=text]:focus{outline:none;border-color:#c9a97e}
.bascule{display:flex;align-items:center;gap:.5rem;font-size:.82rem;cursor:pointer;
  margin:0 0 .8rem;-webkit-user-select:none;user-select:none}
.bascule input{width:1rem;height:1rem;accent-color:#c9a97e;cursor:pointer}
.bascule:has(input:disabled){opacity:.55;cursor:default}
/* Le bloc de depot : vignette a gauche, formulaire a droite. */
.pose{display:grid;grid-template-columns:7rem 1fr;gap:1rem;align-items:start}
@media (max-width:620px){.pose{grid-template-columns:1fr}}
.vig{height:7rem;border-radius:10px;background:#f5f2ec;display:flex;align-items:center;
  justify-content:center;padding:.6rem;overflow:hidden;border:1px dashed rgba(255,255,255,.18);
  cursor:pointer;-webkit-user-select:none;user-select:none}
.vig.fige{cursor:default}
.vig img{max-width:100%;max-height:100%;object-fit:contain;display:block}
.vig .rien{font-size:.72rem;color:#6d7f96;text-align:center;line-height:1.35}
/* La liste des icones. */
.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:.7rem}
.ico{display:grid;grid-template-columns:3.4rem 1fr;gap:.7rem;align-items:center;min-width:0;
  border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:.6rem .7rem;background:#111a29}
.ico .im{width:3.4rem;height:3.4rem;border-radius:8px;background:#f5f2ec;display:flex;
  align-items:center;justify-content:center;padding:.3rem;overflow:hidden}
.ico .im img{max-width:100%;max-height:100%;object-fit:contain;display:block}
.ico .nm{font-size:.84rem;font-weight:700;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ico .gestes{display:flex;gap:.35rem;flex-wrap:wrap;align-items:center;margin-top:.3rem}
code{font-family:ui-monospace,Consolas,monospace;font-size:.75rem;color:#cfe0f5;
  background:#0f1724;border:1px solid #2b3444;border-radius:5px;padding:.1rem .35rem;
  cursor:pointer;-webkit-user-select:none;user-select:none}
code:hover{border-color:#c9a97e}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.4rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
button.pt{font-size:.76rem;padding:.25rem .55rem}
button.dgr{color:#f87171;border-color:rgba(248,113,113,.4)}
.vide{padding:1.1rem .6rem;text-align:center;color:#8fa1b8;font-size:.82rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageIcones() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Icônes personnalisées — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🖼️</span><h1>Icônes personnalisées</h1>
  <span class="cpt" id="cpt"></span></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter les icônes, pas les modifier.</div>
<div class="corps" id="corps"><div class="carte"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
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
  var cpt = document.getElementById('cpt');
  var D = null, RO = false, OCCUPE = false;
  // Les deux images choisies, EN MEMOIRE, en attendant leur geste.
  var POSE = null;      // l icone a ajouter
  var CONV = null;      // l image a convertir en .ico

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule : les icônes ne peuvent pas être modifiées.',
    nom_requis:         'Donnez un nom à l’icône.',
    pas_une_image:      'Ce fichier n’est pas une image.',
    image_illisible:    'Cette image n’a pas pu être lue.',
    depot:              'Le dépôt de l’icône dans le stockage a échoué. Rien n’a été ajouté.',
    conversion:         'La conversion en .ico a échoué.',
    introuvable:        'Cette icône n’existe plus.',
    indisponible:       'La configuration n’est pas prête dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    nuage:              'L’enregistrement dans le nuage a échoué. Réessayez.',
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

  // Choisir un fichier image et le garder en memoire. Le traitement est au coeur.
  function choisir(quoi){
    if (RO && quoi === 'pose') return;
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = function(){
      var f = inp.files && inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function(){
        if (quoi === 'pose') POSE = String(r.result || '');
        else CONV = String(r.result || '');
        dessiner();
        dire('Image prête.', 'att');
      };
      r.onerror = function(){ dire('Ce fichier n’a pas pu être lu.', 'err'); };
      r.readAsDataURL(f);
    };
    inp.click();
  }

  function vignette(id, src, fige){
    return '<div class="vig' + (fige ? ' fige' : '') + '" data-choisir="' + esc(id) + '">'
      + (src ? '<img src="' + esc(src) + '" alt="">'
             : '<span class="rien">Choisir<br>une image</span>') + '</div>';
  }

  function dessiner(){
    var av = document.getElementById('ro');
    if (av) av.hidden = !RO;
    var liste = (D && D.icones) || [];
    cpt.textContent = liste.length ? (liste.length + (liste.length > 1 ? ' icônes' : ' icône')) : '';
    var h = [];

    // ── Ajouter et convertir : deux cartes qui se partagent une ligne ──────
    h.push('<div class="rangee">');
    h.push('<div class="carte"><h2>Ajouter une icône</h2>');
    h.push('<p class="sous">Insérez ensuite son code dans n’importe quel texte du site : il devient l’image.</p>');
    h.push('<div class="pose">' + vignette('pose', POSE, RO) + '<div>');
    h.push('<div class="ch"><label>Nom</label><input id="i-nom" type="text" placeholder="coeur, etoile, feu…"'
      + (RO ? ' disabled' : '') + '></div>');
    h.push('<label class="bascule"><input type="checkbox" id="i-fond"' + (RO ? ' disabled' : '')
      + '> Retirer le fond de l’image</label>');
    h.push('<button class="prim" id="b-ajouter"' + (RO ? ' disabled' : '') + '>Ajouter l’icône</button>');
    h.push('</div></div></div>');

    // ── Convertisseur .ico ─────────────────────────────────────────────────
    h.push('<div class="carte"><h2>Convertir une image en .ico</h2>');
    h.push('<p class="sous">Toutes les tailles de 16 à 256 px, reprises de l’image d’origine — indépendant des icônes ci-contre.</p>');
    h.push('<div class="pose">' + vignette('conv', CONV, false) + '<div>');
    h.push('<label class="bascule"><input type="checkbox" id="c-fond"> Retirer le fond de l’image</label>');
    h.push('<button class="prim" id="b-convertir"' + (CONV ? '' : ' disabled') + '>Télécharger le .ico</button>');
    h.push('</div></div></div>');
    h.push('</div>');

    // ── La liste ───────────────────────────────────────────────────────────
    h.push('<div class="carte"><h2>Les icônes du site</h2>');
    if (!liste.length) {
      h.push('<div class="vide">Aucune icône pour l’instant.</div>');
    } else {
      h.push('<div class="grille">');
      liste.forEach(function(ic){
        h.push('<div class="ico"><div class="im">'
          + (ic.url ? '<img src="' + esc(ic.url) + '" alt="">' : '') + '</div><div style="min-width:0">'
          + '<p class="nm" title="' + esc(ic.name) + '">' + esc(ic.name) + '</p>'
          + '<div class="gestes"><code data-copier="' + esc(ic.tag) + '" title="Copier le code">[icon:'
          + esc(ic.tag) + ']</code>'
          + '<button class="pt" data-ico="' + esc(ic.id) + '">.ico</button>'
          + '<button class="pt dgr" data-suppr="' + esc(ic.id) + '"' + (RO ? ' disabled' : '') + '>Supprimer</button>'
          + '</div></div></div>');
      });
      h.push('</div>');
    }
    h.push('</div>');
    corps.innerHTML = h.join('');
    brancher();
  }

  function surTous(sel, gest){
    var n = corps.querySelectorAll(sel);
    for (var i = 0; i < n.length; i++) n[i].onclick = gest;
  }
  function brancher(){
    surTous('[data-choisir]', function(e){ choisir(e.currentTarget.getAttribute('data-choisir')); });
    surTous('[data-copier]', function(e){ copier(e.currentTarget.getAttribute('data-copier')); });
    surTous('[data-ico]', function(e){ enIco(e.currentTarget.getAttribute('data-ico')); });
    surTous('[data-suppr]', function(e){ supprimer(e.currentTarget.getAttribute('data-suppr')); });
    var ba = document.getElementById('b-ajouter'); if (ba) ba.onclick = ajouter;
    var bc = document.getElementById('b-convertir'); if (bc) bc.onclick = convertir;
  }

  function copier(tag){
    var texte = '[icon:' + tag + ']';
    try {
      navigator.clipboard.writeText(texte)
        .then(function(){ dire('Code copié : ' + texte, 'bon'); })
        .catch(function(){ dire(texte, 'att'); });
    } catch (e) { dire(texte, 'att'); }
  }

  function occuper(o){
    OCCUPE = o;
    var ba = document.getElementById('b-ajouter'); if (ba) ba.disabled = o || RO;
    var bc = document.getElementById('b-convertir'); if (bc) bc.disabled = o || !CONV;
  }

  function ajouter(){
    if (RO || OCCUPE) return;
    var nom = (document.getElementById('i-nom') || {}).value || '';
    var fond = !!(document.getElementById('i-fond') || {}).checked;
    if (!nom.trim()) { dire(MOTIFS.nom_requis, 'err'); return; }
    if (!POSE) { dire('Choisissez d’abord une image.', 'err'); return; }
    occuper(true);
    dire('Ajout de l’icône…');
    appeler('config:icones:ajouter', [{ nom: nom, image: POSE, retirerFond: fond }]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        // ⚠ On ne vide POSE qu APRES un ajout reussi : un depot refuse ne doit
        // pas faire perdre le fichier que la personne vient de choisir.
        POSE = null;
        D = r; RO = !r.peutModifier;
        dessiner();
        dire('Icône ajoutée : [icon:' + r.tag + ']', 'bon');
      } else dire(expliquer(r), 'err');
    });
  }

  function supprimer(id){
    if (RO || OCCUPE) return;
    occuper(true);
    dire('Suppression…');
    appeler('config:icones:supprimer', [id]).then(function(r){
      occuper(false);
      if (r && r.ok) { D = r; RO = !r.peutModifier; dessiner(); dire('Icône supprimée.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }

  function enIco(id){
    if (OCCUPE) return;
    occuper(true);
    dire('Conversion…');
    appeler('config:icones:ico', [id]).then(function(r){
      occuper(false);
      dire(r && r.ok ? 'Fichier ' + esc(r.fichier) + ' téléchargé.' : expliquer(r), r && r.ok ? 'bon' : 'err');
    });
  }

  function convertir(){
    if (OCCUPE || !CONV) return;
    var fond = !!(document.getElementById('c-fond') || {}).checked;
    var nom = ((document.getElementById('i-nom') || {}).value || 'icone');
    occuper(true);
    dire('Conversion…');
    appeler('config:icones:convertir', [{ image: CONV, retirerFond: fond, nom: nom }]).then(function(r){
      occuper(false);
      dire(r && r.ok ? 'Fichier ' + esc(r.fichier) + ' téléchargé.' : expliquer(r), r && r.ok ? 'bon' : 'err');
    });
  }

  function charger(){
    dire('Lecture…');
    appeler('config:icones:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r;
      RO = !r.peutModifier;
      dessiner();
      dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageIcones };
