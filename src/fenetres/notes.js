'use strict';

/*
 * FENÊTRE « NOTES DES MISES À JOUR » — NATIVE
 * =============================================================================
 * Les notes de version, en fenêtre de consultation : deux onglets (Récentes /
 * Archives), une entrée par version — dépliable pour lire le détail — et la
 * pastille « installée ici » sur la version de cette application. Les entrées
 * arrivent BRUTES du site (notes:lire) : une seule source, celle des NOTES de
 * pont.js, jamais une copie.
 *
 * C'était la DERNIÈRE surface web atteignable depuis l'application (la boîte
 * askEmpile du site, relevé du 2026-08-09).
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
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.55rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
.ligne{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.55rem .75rem;cursor:pointer}
.ligne:hover{border-color:#c9a97e}
.ligne .haut{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}
.ligne .num{font-weight:800;font-family:'Courier New',monospace}
.ligne .titre{font-weight:600}
.ligne .dt{font-size:.72rem;color:var(--tx2)}
.ligne .droite{margin-left:auto;font-size:.74rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx2)}
.detail{margin-top:.5rem;border-top:1px solid var(--v08);padding-top:.5rem;
  font-size:.86rem;line-height:1.55}
.detail h4{margin:.55rem 0 .2rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:var(--tx-or)}
.detail ul{margin:.15rem 0 .3rem;padding-left:1.1rem}
.detail li{margin:.16rem 0}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Notes des mises à jour ». */
function pageNotes() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Notes des mises à jour — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.note}</span><h1>Notes des mises à jour</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;
  var ONGLET = 'recentes';   // recentes | archives
  var DEPLIE = {};           // v -> true

  /* La mise en forme AUTORISEE dans le corps d une note. On ne rend pas le HTML
     tel quel les yeux fermes : on garde les quelques balises d emphase qui y
     servent et on neutralise tout le reste. Une note reste du texte enrichi,
     pas une page — et si un jour ces textes venaient d ailleurs que du code,
     ce filtre serait deja en place. */
  var BALISES_OK = /^<\\/?(strong|b|em|i|code|br)\\s*\\/?>$/i;
  function nettoyer(s){
    return String(s == null ? '' : s).replace(/<[^>]*>|[&<>"]/g, function(m){
      if (m.charAt(0) === '<') return BALISES_OK.test(m) ? m : '';
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m];
    });
  }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    return MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var toutes = D.entrees || [];
    var n = D.recentes || 12;
    var recentes = toutes.slice(0, n);
    var archives = toutes.slice(n);
    var liste = ONGLET === 'archives' ? archives : recentes;

    var h = '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'recentes' ? ' actif' : '') + '" data-onglet="recentes">'
      + 'Récentes<span class="n">' + recentes.length + '</span></button>'
      + '<button class="mini' + (ONGLET === 'archives' ? ' actif' : '') + '" data-onglet="archives">'
      + 'Archives<span class="n">' + archives.length + '</span></button>'
      + '</div>';

    if (!liste.length) {
      h += '<div class="vide">' + (ONGLET === 'archives'
        ? 'Rien aux archives pour l’instant : les versions au-delà des ' + n + ' dernières viendront ici.'
        : 'Aucune note.') + '</div>';
    } else {
      h += liste.map(function(e){
        var ouverte = !!DEPLIE[e.v];
        var ici = (D.installee && e.v === D.installee)
          ? ' <span class="pill bon">installée ici</span>' : '';
        var det = '';
        if (ouverte) {
          /* ⚠ LE CORPS D UNE NOTE EST DU HTML, ET IL DOIT LE RESTER.
             Il etait ECHAPPE : les <strong> ecrits dans NOTES (pont.js) se
             lisaient en toutes lettres au milieu de la phrase, comme du code
             oublie (signale le 2026-08-14, capture a l appui). Ces textes ne
             viennent d aucun visiteur ni d aucune base : ils sont ecrits dans le
             code du site, au meme titre que les libelles de cette fenetre. Les
             echapper ne protegeait de rien et abimait chaque note.
             ⚠ Le TITRE, la VERSION et la DATE restent echappes : eux ne sont pas
             censes porter de mise en forme, et rien ne justifie d y ouvrir la
             porte au HTML. */
          det = '<div class="detail">' + nettoyer(e.r || '');
          (e.s || []).forEach(function(sec){
            det += (sec.h ? '<h4>' + esc(sec.h) + '</h4>' : '')
              + '<ul>' + (sec.p || []).map(function(par){ return '<li>' + nettoyer(par) + '</li>'; }).join('') + '</ul>';
          });
          det += '</div>';
        }
        return '<div class="ligne" data-v="' + esc(e.v) + '">'
          + '<div class="haut"><span class="num">' + esc(e.v) + '</span>' + ici
          + '<span class="titre">' + esc(e.t || '') + '</span>'
          + '<span class="droite">' + esc(e.d || '') + ' ' + (ouverte ? '▾' : '▸') + '</span></div>'
          + det + '</div>';
      }).join('');
    }
    corps.innerHTML = h;
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); dessiner(); return; }
    var li = t.closest('.ligne[data-v]');
    if (li) {
      var v = li.getAttribute('data-v');
      DEPLIE[v] = !DEPLIE[v];
      dessiner();
    }
  };

  function charger(){
    appeler('notes:lire', []).then(function(r){
      if (!r || !r.ok) { vide('Notes indisponibles', expliquer(r)); return; }
      D = r;
      // La version installee ICI s ouvre d elle-meme : c est celle qu on vient lire.
      if (D.installee && (D.entrees || []).some(function(e){ return e.v === D.installee; })) {
        DEPLIE[D.installee] = true;
      }
      dire('');
      dessiner();
    });
  }

  window.szRevenir = function(){ charger(); };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageNotes };
