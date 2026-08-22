'use strict';

/*
 * FENÊTRE « PIED DE PAGE » — NATIVE (Configuration, palier 5, 2e onglet)
 * =============================================================================
 * Les coordonnées de la boutique et les numéros de taxes affichés au pied de
 * page (et repris sur les documents). Aucun secret.
 *
 * ⚠ AUCUNE RÈGLE ICI. Lecture `config:footer:donnees`, écriture
 * `config:footer:ecrire` ; le cœur `Admin._footerEcrire` valide et persiste. Le
 * droit d'écriture (`config:edit`) est décidé au cœur, jamais dans la fenêtre.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

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
/* ⚠ LA ZONE EST PLEINE PAGE, ET LES CARTES DOIVENT LA REMPLIR (2026-08-10) :
   plafonnees en largeur, elles laissaient la moitie de l ecran vide une fois la
   fenetre ANCREE. On repartit en colonnes qui se replient seules. */
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:grid;grid-template-columns:repeat(auto-fit,minmax(28rem,1fr));
  gap:1rem;align-content:start}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:1rem 1.1rem;margin:0;min-width:0}
.pleine{grid-column:1/-1}
.carte h2{margin:0 0 .8rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8}
.ch{margin:0 0 .8rem}
.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.25rem;font-size:.78rem;color:#8fa1b8}
.ch label .pt{color:#6d7f96;font-size:.72rem}
.ch input{width:100%;box-sizing:border-box;font:inherit;color:#e8edf5;background:#0f1724;
  border:1px solid #2b3444;border-radius:8px;padding:.42rem .55rem}
.ch input:focus{outline:none;border-color:#c9a97e}
.deux{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
@media (max-width:560px){.deux{grid-template-columns:1fr}}
.apercu{background:#0f1724;border:1px solid rgba(255,255,255,.07);border-radius:9px;
  padding:.6rem .75rem;font-size:.82rem;color:#8fa1b8;line-height:1.5}
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
.vide{padding:1.1rem .6rem;text-align:center;color:#8fa1b8;font-size:.82rem}
/* ⚠ LE BANDEAU DE LECTURE SEULE VIT HORS DE LA GRILLE. Place dedans avec
   << grid-column:1/-1 >>, il OCCUPE la derniere piste : auto-fit ne la voit plus
   vide, ne la replie plus, et les cartes cessent de remplir la largeur (releve
   au rendu le 2026-08-10). */
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:#f0d6a0;border-radius:9px;
  padding:.5rem .7rem;font-size:.78rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageFooter() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Pied de page — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.pied}</span><h1>Pied de page</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter le pied de page, pas le modifier.</div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-save" disabled>Enregistrer</button></div>
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
  var bsave = document.getElementById('b-save');
  var D = null, RO = false, MARQUE = 'SANDRIZA', ANNEE = 2026;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule : le pied de page ne peut pas être modifié.',
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

  function champ(id, lib, val, pt, type){
    return '<div class="ch"><label>' + esc(lib) + (pt ? ' <span class="pt">' + esc(pt) + '</span>' : '')
      + '</label><input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(val || '') + '"'
      + (RO ? ' disabled' : '') + '></div>';
  }

  function dessiner(){
    var c = D || {};
    var h = [];
    var av = document.getElementById('ro');
    if (av) av.hidden = !RO;
    h.push('<div class="carte"><h2>Colonne marque</h2>');
    h.push(champ('fc-tagline', 'Tagline', c.tagline));
    h.push(champ('fc-address', 'Adresse complète (FR)', c.address));
    h.push(champ('fc-address-en', 'Adresse complète (EN)', c.addressEN, 'affichée en mode anglais'));
    h.push('<div class="deux">' + champ('fc-email', 'Courriel de contact', c.email, '', 'email')
      + champ('fc-phone', 'Téléphone', c.phone) + '</div>');
    h.push('</div>');
    h.push('<div class="carte"><h2>Copyright et numéros de taxes</h2>');
    h.push('<div class="deux">' + champ('fc-tps', 'Numéro TPS', c.tps, 'ex. 123456789 RT0001')
      + champ('fc-tvq', 'Numéro TVQ', c.tvq, 'ex. 9876543210 TQ0001') + '</div>');
    h.push('<div class="apercu" id="apercu"></div></div>');
    corps.innerHTML = h.join('');
    // Aperçu du copyright, mis à jour à la frappe.
    function maj(){
      var tps = (document.getElementById('fc-tps') || {}).value || '';
      var tvq = (document.getElementById('fc-tvq') || {}).value || '';
      var el = document.getElementById('apercu');
      if (el) el.textContent = 'Aperçu : © ' + ANNEE + ' ' + MARQUE + '. Tous droits réservés.'
        + (tps ? ' | TPS: ' + tps : '') + (tvq ? ' | TVQ: ' + tvq : '');
    }
    ['fc-tps', 'fc-tvq'].forEach(function(id){
      var e = document.getElementById(id); if (e) e.oninput = maj;
    });
    maj();
    bsave.disabled = RO;
  }

  function lire(){
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    return { tagline: v('fc-tagline'), address: v('fc-address'), addressEN: v('fc-address-en'),
             email: v('fc-email'), phone: v('fc-phone'), tps: v('fc-tps'), tvq: v('fc-tvq') };
  }

  function enregistrer(){
    if (RO) return;
    bsave.disabled = true;
    dire('Enregistrement…');
    appeler('config:footer:ecrire', [lire()]).then(function(r){
      bsave.disabled = false;
      if (r && r.ok) { D = r.cfg || D; dire('Pied de page enregistré.', 'bon'); }
      else { dire(expliquer(r), 'err'); }
    });
  }
  bsave.onclick = enregistrer;

  function charger(){
    dire('Lecture…');
    appeler('config:footer:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte pleine"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r.cfg || {};
      RO = !r.peutModifier;
      MARQUE = r.marque || 'SANDRIZA';
      ANNEE = r.annee || ANNEE;
      dessiner();
      dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageFooter };
