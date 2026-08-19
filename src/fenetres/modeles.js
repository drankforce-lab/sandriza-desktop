'use strict';

/*
 * FENÊTRE « MODÈLES PAR VUE » — NATIVE (Configuration, palier 5)
 * =============================================================================
 * Une photo de mannequin par angle de prise de vue (Face, Derrière, Gauche,
 * Droit), chargée automatiquement lors de la génération IA dans l'éditeur
 * produit. Choisir des poses neutres sur fond clair.
 *
 * La fenêtre lit le fichier en dataURL et l'envoie au cœur (config:modeles:ecrire) :
 * c'est la fenêtre principale qui téléverse dans R2 (dossier « divers », avec
 * compression). Chaque dépôt ou retrait est enregistré tout de suite — pas de
 * bouton « Enregistrer ». Aucun secret.
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
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:#f0d6a0;border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.intro{max-width:52rem;color:#8fa1b8;font-size:.8rem;line-height:1.55;margin:0 0 1rem}
.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1rem}
.slot{display:flex;flex-direction:column;gap:.35rem}
.slot .lbl{font-size:.7rem;font-weight:700;color:#cbd8e6;text-transform:uppercase;letter-spacing:.05em;text-align:center}
.cadre{aspect-ratio:3/4;border:1.5px dashed #2b3444;border-radius:9px;cursor:pointer;position:relative;
  overflow:hidden;background:#0f1724;transition:border-color .15s;display:flex;align-items:center;justify-content:center}
.cadre:hover{border-color:#c9a97e}
.cadre.ro{cursor:default;opacity:.7}
.cadre img{width:100%;height:100%;object-fit:cover;display:block}
.cadre .vide{display:flex;flex-direction:column;align-items:center;gap:.3rem;color:#6d7f96;font-size:.72rem;text-align:center}
.cadre .vide .em{font-size:1.4rem;filter:grayscale(1) brightness(1.6)}
.cadre .surv{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:.72rem;font-weight:600;opacity:0;transition:opacity .15s}
.cadre:hover .surv{opacity:1}
.souspied{min-height:1.4rem;display:flex;justify-content:center;align-items:center}
.retirer{background:none;border:0;padding:0;font-size:.7rem;color:#fca5a5;opacity:.7;cursor:pointer;font-family:inherit}
.retirer:hover{opacity:1}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
.vide-page{padding:1rem;text-align:center;color:#8fa1b8;font-size:.82rem}
button.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;
  border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);
  color:#e8edf5;cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none}
button.mini:hover:not(:disabled){background:rgba(255,255,255,.1)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageModeles() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Modèles par vue — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🧍</span><h1>Modèles par vue</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
<div class="corps">
  <p class="intro">Une photo de mannequin par angle de prise de vue. Elles sont chargées automatiquement lors de la génération IA dans l’éditeur produit. Choisissez des poses neutres sur fond clair. Chaque dépôt est enregistré immédiatement.</p>
  <div class="grille" id="corps"><div class="vide-page">Chargement…</div></div>
</div>
<input type="file" id="fichier" accept="image/*" style="display:none">
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id = 'sz-detacher'; b.type = 'button'; b.className = 'mini'; t.appendChild(b); }
    if (actif) { b.textContent = '⧉ Détacher'; b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); }; }
    else { b.textContent = '⚓ Ancrer'; b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var grille = document.getElementById('corps');
  var fichier = document.getElementById('fichier');
  var D = null, RO = false, OCCUPE = false, CIBLE = '';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule.',
    indisponible:       "L'administration n'est pas encore chargée dans la fenêtre principale.",
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              "La fenêtre principale n'a pas répondu à temps.",
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    image_invalide:     'Le fichier choisi n’est pas une image.',
    vue_inconnue:       'Angle de vue inconnu.',
    nuage:              "Le téléversement a échoué. Réessayez.",
    echec:              "L'opération a échoué.",
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

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    var vues = (D && D.vues) || [];
    if (!vues.length) { grille.innerHTML = '<div class="vide-page">Aucun angle de vue.</div>'; return; }
    var h = '';
    for (var i = 0; i < vues.length; i++) {
      var v = vues[i];
      h += '<div class="slot"><div class="lbl">' + esc(v.label) + '</div>'
        + '<div class="cadre' + (RO ? ' ro' : '') + '" data-vue="' + esc(v.key) + '">'
        + (v.src
            ? '<img src="' + esc(v.src) + '" alt="' + esc(v.label) + '">'
              + (RO ? '' : '<div class="surv"><span class="ic">📸</span> Changer</div>')
            : '<div class="vide"><span class="em">📸</span><span>' + (RO ? 'Non configuré' : 'Cliquer ou glisser') + '</span></div>')
        + '</div>'
        + '<div class="souspied">'
        + ((v.src && !RO) ? '<button class="retirer" data-del="' + esc(v.key) + '">✕ Supprimer</button>' : '')
        + '</div></div>';
    }
    grille.innerHTML = h;
    brancher();
  }
  function brancher(){
    if (RO) return;
    var cadres = grille.querySelectorAll('.cadre');
    for (var i = 0; i < cadres.length; i++) {
      (function(el){
        var vue = el.getAttribute('data-vue');
        el.onclick = function(){ if (OCCUPE) return; CIBLE = vue; fichier.click(); };
        el.ondragover = function(e){ e.preventDefault(); el.style.borderColor = '#c9a97e'; };
        el.ondragleave = function(){ el.style.borderColor = ''; };
        el.ondrop = function(e){ e.preventDefault(); el.style.borderColor = ''; if (OCCUPE) return;
          var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) { CIBLE = vue; deposer(f); } };
      })(cadres[i]);
    }
    var dels = grille.querySelectorAll('[data-del]');
    for (var j = 0; j < dels.length; j++) dels[j].onclick = function(e){ e.stopPropagation(); retirer(this.getAttribute('data-del')); };
  }

  fichier.onchange = function(){ var f = fichier.files && fichier.files[0]; fichier.value = ''; if (f) deposer(f); };

  function deposer(f){
    if (RO || OCCUPE || !CIBLE) return;
    if (String(f.type || '').indexOf('image/') !== 0) { dire('Le fichier choisi n’est pas une image.', 'err'); return; }
    OCCUPE = true; dire('Lecture de l’image…');
    var fr = new FileReader();
    fr.onerror = function(){ OCCUPE = false; dire('Lecture du fichier impossible.', 'err'); };
    fr.onload = function(){
      dire('Téléversement…');
      appeler('config:modeles:ecrire', [{ view: CIBLE, dataUrl: String(fr.result || '') }]).then(function(r){
        OCCUPE = false;
        if (r && r.ok) { D = r; RO = !r.peutModifier; dessiner(); dire('Modèle enregistré.', 'bon'); }
        else dire(expliquer(r), 'err');
      });
    };
    fr.readAsDataURL(f);
  }
  function retirer(vue){
    if (RO || OCCUPE) return;
    OCCUPE = true; dire('Suppression…');
    appeler('config:modeles:retirer', [vue]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) { D = r; RO = !r.peutModifier; dessiner(); dire('Modèle retiré.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }

  function charger(){
    dire('Lecture…');
    appeler('config:modeles:donnees').then(function(r){
      if (!r || !r.ok) { grille.innerHTML = '<div class="vide-page">' + expliquer(r) + '</div>'; dire(expliquer(r), 'err'); return; }
      D = r; RO = !r.peutModifier; dessiner(); dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageModeles };
