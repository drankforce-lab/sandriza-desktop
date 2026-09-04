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
 * ⚠ DEUX BLOCS, ET DEUX CHOSES DIFFÉRENTES (le second ajouté le 2026-08-20) :
 *   1. MODÈLES PAR VUE — quatre angles fixes, une photo par angle.
 *   2. MANNEQUINS (habillage IA) — une liste OUVERTE : c'est la photo humaine
 *      que fal.ai habille (idm-vton). Elle vivait UNIQUEMENT dans la modale
 *      « Générer une photo » de l'écran web de l'éditeur produit, et rien
 *      d'autre ne pouvait l'alimenter. La fenêtre Produit renvoyait déjà ici
 *      (« gérez la photothèque de modèles dans Configuration ») — ce renvoi
 *      était FAUX jusqu'à aujourd'hui.
 * ⚠ La génération de MANNEQUINS, elle, est passée à Photoroom (fenêtre Studio,
 *   16 modèles préréglés) : fal.ai ne sert plus qu'à l'habillage.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.intro{max-width:52rem;color:var(--tx2);font-size:.8rem;line-height:1.55;margin:0 0 1rem}
.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1rem}
.slot{display:flex;flex-direction:column;gap:.35rem}
.slot .lbl{font-size:.7rem;font-weight:700;color:var(--tx-bleute);text-transform:uppercase;letter-spacing:.05em;text-align:center}
.cadre{aspect-ratio:3/4;border:1.5px dashed var(--v12);border-radius:9px;cursor:pointer;position:relative;
  overflow:hidden;background:var(--f-champ);transition:border-color .15s;display:flex;align-items:center;justify-content:center}
.cadre:hover{border-color:#c9a97e}
.cadre.ro{cursor:default;opacity:.7}
.cadre img{width:100%;height:100%;object-fit:cover;display:block}
.cadre .vide{display:flex;flex-direction:column;align-items:center;gap:.3rem;color:var(--tx3);font-size:.72rem;text-align:center}
.cadre .vide .em{font-size:1.4rem;filter:grayscale(1) brightness(1.6)}
.cadre .surv{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;
  color:var(--tx-blanc);font-size:.72rem;font-weight:600;opacity:0;transition:opacity .15s}
.cadre:hover .surv{opacity:1}
.souspied{min-height:1.4rem;display:flex;justify-content:center;align-items:center}
.retirer{background:none;border:0;padding:0;font-size:.7rem;color:var(--tx-err2);opacity:.7;cursor:pointer;font-family:inherit}
.retirer:hover{opacity:1}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
.vide-page{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
/* ── Le SECOND bloc : les mannequins de l'habillage IA. Liste OUVERTE, donc une
   grille de vignettes plus petites et une tuile d'ajout, au lieu de slots fixes. */
.sect{display:flex;align-items:center;gap:.5rem;margin:1.6rem 0 .5rem}
.sect:first-of-type{margin-top:0}
.sect h2{font-size:.82rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;
  color:var(--tx-or);margin:0;flex:0 0 auto}
.sect .tr{flex:1 1 auto;height:1px;background:var(--v12)}
.mqs{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.5rem,1fr));gap:.85rem}
.mq{display:flex;flex-direction:column;gap:.3rem}
.mq .cd{aspect-ratio:3/4;border:1.5px solid var(--v12);border-radius:9px;overflow:hidden;
  background:var(--f-champ);display:flex;align-items:center;justify-content:center}
.mq .cd img{width:100%;height:100%;object-fit:cover;display:block}
.mq .nm{font-size:.72rem;color:var(--tx-bleute);text-align:center;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.mq .sp{min-height:1.2rem;display:flex;justify-content:center;align-items:center}
.ajout{aspect-ratio:3/4;border:1.5px dashed var(--v12);border-radius:9px;cursor:pointer;
  background:var(--f-champ);display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:.3rem;color:var(--tx3);font-size:.72rem;text-align:center;padding:.4rem;transition:border-color .15s}
.ajout:hover{border-color:#c9a97e}
.ajout .em{font-size:1.4rem;filter:grayscale(1) brightness(1.6)}
.nomq{width:100%;font:inherit;font-size:.74rem;padding:.2rem .35rem;margin-top:.3rem;
  border:1px solid var(--v16);border-radius:6px;background:var(--f-pied);color:var(--tx)}
button.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;
  border:1px solid var(--v16);border-radius:7px;background:var(--v05);
  color:var(--tx);cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none}
button.mini:hover:not(:disabled){background:var(--v10)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageModeles() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Modèles par vue — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.personne}</span><h1>Modèles par vue</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
<div class="corps">
  <div class="sect"><h2>Modèles par vue</h2><span class="tr"></span></div>
  <p class="intro">Une photo de mannequin par angle de prise de vue. Elles sont chargées automatiquement lors de la génération IA dans l’éditeur produit. Choisissez des poses neutres sur fond clair. Chaque dépôt est enregistré immédiatement.</p>
  <div class="grille" id="corps"><div class="vide-page">Chargement…</div></div>

  <div class="sect"><h2>Mannequins (habillage IA)</h2><span class="tr"></span></div>
  <p class="intro">La photo de la personne que l’intelligence artificielle <strong>habille</strong> avec votre vêtement — c’est le choix offert par « ✨ Mannequin IA » dans l’assistant Produit. Une photo nette, de face, cadrée en pied donne le meilleur résultat. <span id="mq-cle"></span></p>
  <div class="mqs" id="mqs"><div class="vide-page">Chargement…</div></div>
</div>
<input type="file" id="fichier" accept="image/*" style="display:none">
<input type="file" id="fichier-mq" accept="image/*" style="display:none">
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
  // Le SECOND bloc a son propre etat : les deux listes se chargent et s ecrivent
  // separement, donc un echec sur l une ne doit pas effacer l autre a l ecran.
  var grilleMq = document.getElementById('mqs');
  var fichierMq = document.getElementById('fichier-mq');
  var DM = null, ROM = false, OCCUPE_MQ = false;

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
    introuvable:        'Ce mannequin n’existe plus — rechargez la fenêtre.',
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
            : '<div class="vide"><span class="em"><span class="ic">📸</span></span><span>' + (RO ? 'Non configuré' : 'Cliquer ou glisser') + '</span></div>')
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

  /* ══ MANNEQUINS DE L HABILLAGE IA ══════════════════════════════════════════
     Liste OUVERTE, contrairement aux quatre angles fixes du bloc du dessus. On
     nomme AVANT de choisir la photo : le nom est le seul repere dans la liste que
     l assistant Produit affiche, et il n y a pas d operation pour le changer
     apres coup — le demander au moment du depot evite une entree << Mannequin >>
     de plus a chaque fois.
     ⚠ AUCUNE boite de dialogue du systeme (regle du projet) : le champ du nom vit
     dans la tuile d ajout. */
  function dessinerMq(){
    var av = document.getElementById('mq-cle');
    if (av) {
      // On ne parle de la cle QUE si elle manque : sans elle, l habillage refusera,
      // et le dire ici evite de chercher pourquoi le bouton ne rend rien.
      av.innerHTML = (DM && DM.cleConfiguree === false)
        ? '<strong style="color:var(--tx-att)"><span class="ic">⚠</span> Aucune clé Fal.ai n’est enregistrée</strong> — l’habillage refusera tant qu’elle n’est pas posée dans Configuration → Clés API.'
        : '';
    }
    var l = (DM && DM.mannequins) || [];
    var h = '';
    for (var i = 0; i < l.length; i++) {
      var m = l[i];
      h += '<div class="mq"><div class="cd"><img src="' + esc(m.image) + '" alt="' + esc(m.nom) + '"></div>'
        + '<div class="nm" title="' + esc(m.nom) + '">' + esc(m.nom) + '</div>'
        + '<div class="sp">'
        + (ROM ? '' : '<button class="retirer" data-delmq="' + esc(m.id) + '">✕ Supprimer</button>')
        + '</div></div>';
    }
    if (!ROM) {
      h += '<div class="mq"><div class="ajout" id="mq-plus">'
        + '<span class="em"><span class="ic">📸</span></span><span>Ajouter un mannequin</span></div>'
        + '<input class="nomq" id="mq-nom" type="text" maxlength="40" placeholder="Nom (ex : Ana)"></div>';
    }
    if (!l.length && ROM) h = '<div class="vide-page">Aucun mannequin enregistré.</div>';
    grilleMq.innerHTML = h;
    brancherMq();
  }
  function brancherMq(){
    if (ROM) return;
    var plus = document.getElementById('mq-plus');
    if (plus) {
      plus.onclick = function(){ if (OCCUPE_MQ) return; fichierMq.click(); };
      plus.ondragover = function(e){ e.preventDefault(); plus.style.borderColor = '#c9a97e'; };
      plus.ondragleave = function(){ plus.style.borderColor = ''; };
      plus.ondrop = function(e){ e.preventDefault(); plus.style.borderColor = '';
        if (OCCUPE_MQ) return;
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) deposerMq(f); };
    }
    var dels = grilleMq.querySelectorAll('[data-delmq]');
    for (var j = 0; j < dels.length; j++) {
      dels[j].onclick = function(e){ e.stopPropagation(); retirerMq(this.getAttribute('data-delmq')); };
    }
  }

  fichierMq.onchange = function(){
    var f = fichierMq.files && fichierMq.files[0];
    fichierMq.value = '';
    if (f) deposerMq(f);
  };

  function deposerMq(f){
    if (ROM || OCCUPE_MQ) return;
    if (String(f.type || '').indexOf('image/') !== 0) { dire('Le fichier choisi n’est pas une image.', 'err'); return; }
    // Le nom est lu MAINTENANT : la tuile est redessinee apres l enregistrement,
    // donc le champ n existera plus quand la reponse arrivera.
    var champ = document.getElementById('mq-nom');
    var nom = champ ? String(champ.value || '').trim() : '';
    OCCUPE_MQ = true; dire('Lecture de l’image…');
    var fr = new FileReader();
    fr.onerror = function(){ OCCUPE_MQ = false; dire('Lecture du fichier impossible.', 'err'); };
    fr.onload = function(){
      dire('Téléversement…');
      appeler('config:mannequins:ajouter', [{ nom: nom, dataUrl: String(fr.result || '') }]).then(function(r){
        OCCUPE_MQ = false;
        if (r && r.ok) { DM = r; ROM = !r.peutModifier; dessinerMq(); dire('Mannequin ajouté.', 'bon'); }
        else dire(expliquer(r), 'err');
      });
    };
    fr.readAsDataURL(f);
  }
  function retirerMq(id){
    if (ROM || OCCUPE_MQ) return;
    OCCUPE_MQ = true; dire('Suppression…');
    appeler('config:mannequins:retirer', [id]).then(function(r){
      OCCUPE_MQ = false;
      if (r && r.ok) { DM = r; ROM = !r.peutModifier; dessinerMq(); dire('Mannequin retiré.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }
  function chargerMq(){
    appeler('config:mannequins:donnees').then(function(r){
      if (!r || !r.ok) { grilleMq.innerHTML = '<div class="vide-page">' + expliquer(r) + '</div>'; return; }
      DM = r; ROM = !r.peutModifier; dessinerMq();
    });
  }

  charger();
  chargerMq();
})();
</script></body></html>`;
}

module.exports = { pageModeles };
