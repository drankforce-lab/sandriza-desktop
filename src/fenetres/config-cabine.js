'use strict';

/*
 * FENÊTRE « CABINE D'ESSAYAGE » — NATIVE (Configuration, 2026-10-30)
 * =============================================================================
 * Sa demande : « la gestion de la cabine aussi dans l'administration, comme les
 * fonds par défaut etc. — tout doit être modifiable ». Ici :
 *   · la cabine OUVERTE ou FERMÉE (fermée : la boutique ne la montre plus, et la
 *     base n'exige plus de cabine pour enregistrer un vêtement — la fenêtre le dit) ;
 *   · les TYPES de hauts que la cabine distingue (t-shirt, veston…) ;
 *   · les SUPERPOSITIONS permises : les paires de types qu'une cliente peut porter
 *     l'une sur l'autre (sa règle : « seulement des combinaisons autorisées ») ;
 *   · le FOND par défaut (le studio d'origine, ou une image) et les fonds
 *     PROGRAMMÉS (dates MM-JJ ; une promotion passe devant une saison).
 * Le type d'un article se choisit dans sa fiche (Produit) ; sans choix, il est
 * déduit de son nom.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('config-cabine');

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
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:grid;grid-template-columns:repeat(auto-fit,minmax(26rem,1fr));gap:1rem;align-content:start}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:1rem 1.1rem;min-width:0;display:flex;flex-direction:column;gap:.55rem}
.carte.large{grid-column:1/-1}
.carte h2{margin:0;font:700 .8rem/1.2 system-ui;text-transform:uppercase;letter-spacing:.05em;color:var(--tx-bleute)}
.carte .sous{margin:0;font-size:.78rem;color:var(--tx3)}
.bascule{display:flex;align-items:flex-start;gap:.6rem;font-size:.86rem;cursor:pointer;-webkit-user-select:none;user-select:none}
.bascule input{width:1.1rem;height:1.1rem;accent-color:var(--or);cursor:pointer;margin-top:.15rem;flex:0 0 auto}
.bascule .d{font-size:.74rem;color:var(--tx3);display:block;margin-top:.1rem}
.puces{display:flex;flex-wrap:wrap;gap:.35rem}
.puce{display:inline-flex;align-items:center;gap:.3rem;border:1px solid var(--v12);border-radius:999px;padding:.15rem .25rem .15rem .65rem;font-size:.82rem;background:var(--v05)}
.puce button{border:0;background:none;padding:0 .35rem;font-size:1rem;line-height:1;color:var(--tx3)}
.ajout{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center}
input[type=text],select{font:inherit;color:var(--tx);background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;padding:.38rem .5rem}
input[type=text]:focus,select:focus{outline:none;border-color:var(--or)}
input.mmjj{width:5.4rem}
.ligne{display:grid;grid-template-columns:64px minmax(8rem,1fr) auto auto auto auto;gap:.5rem;align-items:center;padding:.45rem 0;border-bottom:1px solid var(--v07)}
.vign{width:64px;height:48px;border-radius:7px;background:var(--v06) center/cover no-repeat;border:1px solid var(--v10)}
.fondchoix{display:flex;gap:.8rem;align-items:center;flex-wrap:wrap}
.vide{padding:.6rem;text-align:center;color:var(--tx3);font-size:.8rem}
.alerte{border:1px solid rgba(240,180,80,.35);background:rgba(200,140,40,.08);color:var(--tx-or2);border-radius:9px;padding:.45rem .65rem;font-size:.78rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.38rem .75rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageConfigCabine() {
  return `${TETE()}
<title>${T("Cabine d’essayage — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.config || ''}</span><h1>${T("Cabine d’essayage")}</h1></div>
<div class="ro" id="ro" hidden>${T("Lecture seule : vous pouvez consulter les réglages, pas les modifier.")}</div>
<div class="corps" id="corps"><div class="carte"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-save" disabled>${T("Enregistrer")}</button></div>
<input type="file" id="f-fichier" accept="image/jpeg,image/png,image/webp" hidden>
<script>
(function(){
  'use strict';
  var P = window.szPont;
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button'); b.id = 'sz-detacher'; b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;flex:0 0 auto');
      t.appendChild(b);
    }
    b.textContent = actif ? '${T("⧉ Détacher")}' : '${T("⚓ Ancrer")}';
    b.title = actif ? '${T("Ouvrir cet écran dans sa propre fenêtre")}' : '${T("Ramener cet écran dans la fenêtre principale")}';
    b.onclick = function(){ if (actif) { if (P && P.detacher) P.detacher(); } else if (P && P.ancrer) P.ancrer(); };
  };
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps'), bsave = document.getElementById('b-save'), fichier = document.getElementById('f-fichier');
  var D = null, R = null, RO = false, OCCUPE = false, CIBLE = null;
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return '&#' + c.charCodeAt(0) + ';'; }); }
  function dire(t, cl){ szDire(t, cl); }
  var MOTIFS = {
    session: '${T("Aucune session ouverte. Connectez-vous dans la fenêtre principale.")}',
    droit: '${T("Votre rôle ne permet pas de modifier la cabine d’essayage.")}',
    serveur: '${T("Les réglages de la cabine n’ont pas pu être lus.")}',
    nuage: '${T("L’enregistrement dans le nuage a échoué. Réessayez.")}',
    types_vides: '${T("Il faut au moins un type de haut.")}',
    photo_format: '${T("Image illisible : choisissez un JPEG, un PNG ou un WebP.")}',
    stockage: '${T("L’image n’a pas pu être déposée.")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}',
    delai: '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec: '${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m = r && r.motif; return (MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').')) + (r && r.detail ? ' (' + r.detail + ')' : ''); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); } catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; }).catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function sale(){ bsave.disabled = RO || OCCUPE; }

  function dessiner(){
    document.getElementById('ro').hidden = !RO;
    var dis = RO ? ' disabled' : '', h = [], types = R.types || [];
    h.push('<div class="carte"><h2>${T("État")}</h2>'
      + '<label class="bascule"><input type="checkbox" id="f-ouverte"' + (D.ouverte ? ' checked' : '') + dis + '><span><strong>${T("Cabine ouverte")}</strong>'
      + '<span class="d">${T("Ouverte : la boutique montre la cabine (menu Vêtements), et un vêtement ou un chapeau ne s’enregistre qu’avec sa cabine prête. Fermée : la cabine disparaît de la boutique, et rien n’est plus exigé.")}</span></span></label>'
      + (D.ouverte ? '' : '<div class="alerte">${T("La cabine est fermée.")}</div>') + '</div>');
    h.push('<div class="carte"><h2>${T("Types de hauts")}</h2><p class="sous">${T("Les sortes de hauts que la cabine distingue. Le type d’un article se choisit dans sa fiche ; sans choix, il est déduit de son nom.")}</p>'
      + '<div class="puces">' + types.map(function(t, i){ return '<span class="puce">' + esc(t) + (RO ? '' : '<button type="button" data-rt="' + i + '" aria-label="${T("Retirer")} ' + esc(t) + '">×</button>') + '</span>'; }).join('') + '</div>'
      + (RO ? '' : '<div class="ajout"><input type="text" id="f-type" maxlength="30" placeholder="${T("Nouveau type (ex. polo)")}" aria-label="${T("Nouveau type (ex. polo)")}"><button type="button" id="b-type">${T("Ajouter")}</button></div>') + '</div>');
    var opts = types.map(function(t){ return '<option>' + esc(t) + '</option>'; }).join('');
    h.push('<div class="carte"><h2>${T("Superpositions permises")}</h2><p class="sous">${T("Deux hauts portés l’un sur l’autre dans la cabine — seulement ces paires. Hors liste, le second haut remplace le premier.")}</p>'
      + ((R.superpositions || []).length ? '<div class="puces">' + R.superpositions.map(function(p, i){ return '<span class="puce">' + esc(p[0]) + ' + ' + esc(p[1]) + (RO ? '' : '<button type="button" data-rs="' + i + '" aria-label="${T("Retirer")}">×</button>') + '</span>'; }).join('') + '</div>'
        : '<div class="vide">${T("Aucune superposition : un seul haut à la fois.")}</div>')
      + (RO ? '' : '<div class="ajout"><select id="f-sa" aria-label="${T("Premier haut")}">' + opts + '</select> + <select id="f-sb" aria-label="${T("Second haut")}">' + opts + '</select><button type="button" id="b-sup">${T("Permettre")}</button></div>') + '</div>');
    var studio = (R.fond || 'studio') === 'studio';
    h.push('<div class="carte large"><h2>${T("Fond par défaut")}</h2><p class="sous">${T("Derrière la mannequin quand aucun fond programmé n’est en cours.")}</p>'
      + '<div class="fondchoix"><label class="bascule"><input type="radio" name="fond" value="studio"' + (studio ? ' checked' : '') + dis + '><span>${T("Studio (la photo d’origine)")}</span></label>'
      + '<label class="bascule"><input type="radio" name="fond" value="image"' + (studio ? '' : ' checked') + dis + '><span>${T("Une image")}</span></label>'
      + (studio ? '' : '<span class="vign" style="background-image:url(' + esc(R.fond) + ')"></span>')
      + (RO ? '' : '<button type="button" id="b-fond">${T("Choisir une image…")}</button>') + '</div></div>');
    var fonds = R.fonds || [];
    h.push('<div class="carte large"><h2>${T("Fonds programmés")}</h2><p class="sous">${T("Une image pour une période (mois-jour, ex. 06-21 → 08-31 ; d’une année à l’autre si la fin précède le début). Une promotion passe devant une saison.")}</p>'
      + (fonds.length ? fonds.map(function(f, i){
          return '<div class="ligne"><span class="vign" style="background-image:url(' + esc(f.image) + ')"></span>'
            + '<input type="text" data-f="' + i + '" data-c="nom" value="' + esc(f.nom) + '" maxlength="40" placeholder="${T("Nom (ex. Été)")}" aria-label="${T("Nom (ex. Été)")}"' + dis + '>'
            + '<input type="text" class="mmjj" data-f="' + i + '" data-c="debut" value="' + esc(f.debut) + '" placeholder="06-21" aria-label="${T("Début")}"' + dis + '>'
            + '<input type="text" class="mmjj" data-f="' + i + '" data-c="fin" value="' + esc(f.fin) + '" placeholder="08-31" aria-label="${T("Fin")}"' + dis + '>'
            + '<label class="bascule"><input type="checkbox" data-f="' + i + '" data-c="promo"' + (f.promo ? ' checked' : '') + dis + '><span>${T("Promotion")}</span></label>'
            + (RO ? '<span></span>' : '<button type="button" data-rf="' + i + '" aria-label="${T("Retirer")}">×</button>') + '</div>'; }).join('')
        : '<div class="vide">${T("Aucun fond programmé.")}</div>')
      + (RO ? '' : '<div class="ajout"><button type="button" id="b-fprog">${T("Ajouter un fond…")}</button></div>') + '</div>');
    corps.innerHTML = h.join('');
    lier(); sale();
  }
  function lier(){
    function on(id, f){ var e = document.getElementById(id); if (e) e.onclick = f; }
    var ouv = document.getElementById('f-ouverte'); if (ouv) ouv.onchange = function(){ D.ouverteVoulue = ouv.checked; sale(); };
    Array.prototype.forEach.call(corps.querySelectorAll('[data-rt]'), function(b){ b.onclick = function(){
      var t = R.types[+b.getAttribute('data-rt')]; R.types.splice(+b.getAttribute('data-rt'), 1);
      R.superpositions = (R.superpositions || []).filter(function(p){ return p[0] !== t && p[1] !== t; }); dessiner(); }; });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-rs]'), function(b){ b.onclick = function(){ R.superpositions.splice(+b.getAttribute('data-rs'), 1); dessiner(); }; });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-rf]'), function(b){ b.onclick = function(){ R.fonds.splice(+b.getAttribute('data-rf'), 1); dessiner(); }; });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-f]'), function(e){ e.onchange = function(){
      var f = R.fonds[+e.getAttribute('data-f')], c = e.getAttribute('data-c'); f[c] = c === 'promo' ? e.checked : e.value.trim(); sale(); }; });
    on('b-type', function(){ var e = document.getElementById('f-type'), v = (e.value || '').trim().toLowerCase();
      if (v && R.types.indexOf(v) < 0) R.types.push(v); dessiner(); });
    on('b-sup', function(){ var a = document.getElementById('f-sa').value, b = document.getElementById('f-sb').value;
      if (a === b) { dire('${T("Choisissez deux types différents.")}', 'err'); return; }
      var deja = (R.superpositions || []).some(function(p){ return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a); });
      if (!deja) (R.superpositions = R.superpositions || []).push([a, b]); dessiner(); });
    Array.prototype.forEach.call(corps.querySelectorAll('input[name=fond]'), function(e){ e.onchange = function(){
      if (e.value === 'studio') { R.fond = 'studio'; dessiner(); } else if (R.fond === 'studio') { CIBLE = 'defaut'; fichier.click(); } }; });
    on('b-fond', function(){ CIBLE = 'defaut'; fichier.click(); });
    on('b-fprog', function(){ CIBLE = 'nouveau'; fichier.click(); });
  }
  fichier.onchange = function(){
    var f = fichier.files && fichier.files[0]; fichier.value = '';
    if (!f) { dessiner(); return; }
    var lect = new FileReader();
    lect.onload = function(){
      dire('${T("Dépôt de l’image…")}');
      appeler('cabine:fond:deposer', [String(lect.result)]).then(function(r){
        if (!r || !r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        if (CIBLE === 'defaut') R.fond = r.url;
        else (R.fonds = R.fonds || []).push({ nom: '', image: r.url, debut: '', fin: '', promo: false });
        dire('${T("Image déposée — pensez à enregistrer.")}', 'att'); dessiner();
      });
    };
    lect.readAsDataURL(f);
  };
  bsave.onclick = function(){
    if (RO || OCCUPE) return;
    var mauvais = (R.fonds || []).filter(function(f){ return !/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(f.debut) || !/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(f.fin); });
    if (mauvais.length) { dire('${T("Chaque fond programmé doit avoir un début et une fin au format mois-jour (ex. 06-21).")}', 'err'); return; }
    var ouv = document.getElementById('f-ouverte'), ouverte = ouv ? ouv.checked : D.ouverte;
    var envoyer = function(){
      OCCUPE = true; sale(); dire('${T("Enregistrement…")}');
      appeler('cabine:reglages:ecrire', [{ ouverte: ouverte, types: R.types, superpositions: R.superpositions, fond: R.fond, fonds: R.fonds }]).then(function(r){
        OCCUPE = false;
        if (r && r.ok) { recevoir(r); dire('${T("Réglages de la cabine enregistrés.")}', 'bon'); } else { sale(); dire(expliquer(r), 'err'); }
      });
    };
    if (D.ouverte && !ouverte && typeof szConfirmer === 'function') {
      szConfirmer({ prudent: true, titre: '${T("Fermer la cabine d’essayage")}', texte: '${T("La cabine disparaît de la boutique, et la base n’exige plus de cabine pour enregistrer un vêtement.")}', oui: '${T("Fermer la cabine")}' })
        .then(function(ok){ if (ok) envoyer(); });
    } else envoyer();
  };
  function recevoir(r){
    D = r; RO = !r.peutModifier;
    var g = r.reglages || {};
    R = { types: (g.types || []).slice(), superpositions: (g.superpositions || []).map(function(p){ return [p[0], p[1]]; }), fond: g.fond || 'studio',
      fonds: (g.fonds || []).map(function(f){ return { nom: f.nom || '', image: f.image, debut: f.debut, fin: f.fin, promo: !!f.promo }; }) };
    dessiner();
  }
  dire('${T("Lecture…")}');
  appeler('cabine:reglages').then(function(r){
    if (!r || !r.ok) { corps.innerHTML = '<div class="carte"><div class="vide">' + esc(expliquer(r)) + '</div></div>'; dire(expliquer(r), 'err'); return; }
    recevoir(r); dire('');
  });
})();
</script></body></html>`;
}

module.exports = { pageConfigCabine };
