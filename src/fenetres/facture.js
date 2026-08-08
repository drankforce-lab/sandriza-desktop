'use strict';

/*
 * FENÊTRE « FACTURE » — NATIVE
 * =============================================================================
 * Elle AFFICHE, elle n'écrit rien : le document arrive PRÊT du site
 * (`facture:lire` → `Billing.renderInvoiceHTML`, LE gabarit unique de l'écran,
 * de l'impression et du courriel), accompagné des règles `.invoice-*` extraites
 * de la feuille de style VIVANTE et des variables résolues. Dessiner une
 * facture ici en ferait une quatrième version qui dérive des trois autres.
 *
 * ⚠ L'IMPRESSION PASSE PAR LE SITE (`facture:imprimer` → `Billing.printInvoice`),
 * qui connaît l'imprimante « Factures » du poste et rend un VERDICT réel —
 * jamais un second circuit d'impression.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, et un accent grave égaré
 * referme la chaîne et casse toute la fenêtre.
 */

const { JS_ACTIVITE } = require('./socle.js');

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
.tete .ic{font-size:1.05rem}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}

/* Le document defile ; la fenetre, elle, ne bouge pas. */
.corps{flex:1 1 auto;min-height:0;overflow-y:auto;padding:1rem 1.2rem;
  background:#1b2434}
.corps::-webkit-scrollbar{width:9px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.14);border-radius:8px}

/* ⚠ LE PAPIER, C EST .invoice-doc DU SITE (fond blanc, bordure, marges) :
   le doubler d un second cadre blanc donnait une << bande blanche >> vide
   au-dessus de la facture (2026-08-08). Ici on ne fait que centrer, poser
   l ombre et donner la couleur d encre de secours pour tout texte sans
   classe — noir d imprimerie, pas le texte clair de la fenetre. */
.papier{max-width:880px;margin:0 auto;color:#1a1a1a}
.papier .invoice-doc{box-shadow:0 16px 40px rgba(0,0,0,.5);margin:0 auto}

button{font:inherit;cursor:pointer;border-radius:8px;padding:.3rem .7rem;
  border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);
  color:#e8edf5;transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}

.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);
  background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
.actions{flex:0 0 auto;display:flex;gap:.4rem}
.vide{padding:2rem 1rem;text-align:center;color:#8fa1b8;font-size:.88rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Facture ». `invId` est obligatoire. */
function pageFacture(invId) {
  const depart = JSON.stringify(String(invId || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Facture — Administration Sandriza</title>
<style>${CSS}</style></head><body>
<div class="tete"><span class="ic">🧾</span><h1 id="titre">Facture</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions" id="actions"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var actions = document.getElementById('actions');

  var ID = ${depart};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var direT = null;
  function dire(t, cl){
    clearTimeout(direT);
    msg.className = 'msg' + (cl ? ' ' + cl : '');
    msg.textContent = t || '';
    if (cl === 'bon' && t) {
      direT = setTimeout(function(){
        if (msg.textContent === t) { msg.textContent = ''; msg.className = 'msg'; }
      }, 6000);
    }
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux factures.',
    indisponible:       'Le module de facturation n’est pas encore chargé dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette facture n’existe plus.',
    impression:         'L’impression a échoué.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    if (m === 'impression' && r.detail) return MOTIFS.impression + ' ' + esc(r.detail);
    return MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
  }

  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  // ══ DESSIN ════════════════════════════════════════════════════════════════
  function dessiner(d){
    // ⚠ LE STYLE DU SITE D ABORD, LE DOCUMENT ENSUITE. Le document arrive tel
    // que l ecran du site le peint ; ses regles .invoice-* et ses variables
    // resolues voyagent avec lui — c est ce qui garantit LA meme facture.
    corps.innerHTML = '<style>' + (d.css || '') + '</style>'
      + '<div class="papier">' + (d.html || '') + '</div>';
    actions.innerHTML = '<button class="prim" id="btn-imp">🖨 Imprimer</button>';
    var b = document.getElementById('btn-imp');
    if (b) b.onclick = imprimer;
  }

  function chargement(texte){
    corps.innerHTML = '<div class="vide">' + esc(texte) + '</div>';
    actions.innerHTML = '';
  }

  function imprimer(){
    var b = document.getElementById('btn-imp');
    if (b) b.disabled = true;
    dire('Impression…');
    // Le chemin du SITE : imprimante « Factures » du poste, verdict reel.
    appeler('facture:imprimer', [ID]).then(function(r){
      if (b) b.disabled = false;
      dire(r.ok ? 'Facture envoyée à l’impression.' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  }

  function charger(){
    chargement('Chargement…');
    appeler('facture:lire', [ID]).then(function(r){
      if (!r.ok) { chargement(expliquer(r)); dire(expliquer(r), 'err'); return; }
      document.getElementById('titre').textContent = 'Facture ' + (r.numero || '');
      document.title = 'Facture ' + (r.numero || '') + ' — Administration Sandriza';
      dire('');
      dessiner(r);
    });
  }

  // Rouvrir la meme facture ramene cette fenetre : elle RELIT le document.
  window.szRevenir = function(){ charger(); };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageFacture };
