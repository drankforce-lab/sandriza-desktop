'use strict';

/*
 * FENÊTRE « RÉSEAUX SOCIAUX » — NATIVE (1.70.0, palier 4)
 * =============================================================================
 * La FILE d'attente et l'HISTORIQUE des publications : quatre compteurs, chaque
 * entrée avec son contenu et ses réseaux, publier une entrée ou toute la file,
 * ignorer, vider le journal.
 *
 * ⚠ NE COUVRE QUE LES OPÉRATIONS. Les patrons de publication et les clés des
 * réseaux sont des RÉGLAGES : ils restent à l'écran web et suivront avec la
 * Configuration, au palier 5 — même découpe que le chat (1.69.0).
 *
 * ⚠ PUBLIER ENGAGE L'EXTÉRIEUR. Le message part chez Facebook, Instagram ou X
 * et ne se rattrape pas : le bouton s'arme en deux clics, et le verdict est
 * donné RÉSEAU PAR RÉSEAU. Annoncer « publié » sur un envoi partiel enverrait
 * chercher longtemps une publication qui n'est jamais partie.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, CSS_JOUR } = require('./socle.js');

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
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:#8fa1b8}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
button .n.hi{background:rgba(245,158,11,.25);color:#fbbf24}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.att{color:#fbbf24}.tuile .val.bon{color:#4ade80}.tuile .val.err{color:#f87171}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:#8fa1b8;font-weight:700}
.entree{border-top:1px solid rgba(255,255,255,.055);padding:.5rem .1rem}
.entree:first-of-type{border-top:0}
.entree .haut{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.entree .droite{margin-left:auto;display:flex;gap:.35rem;align-items:center}
.entree .texte{font-size:.84rem;white-space:pre-wrap;overflow-wrap:anywhere;
  margin-top:.25rem;color:#cbd8e6;max-height:5.5rem;overflow:auto}
.res{display:inline-flex;gap:.3rem;align-items:center}
.res span{font-size:1rem}
.dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.err{background:rgba(239,68,68,.16);color:#f87171}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.detail{margin-top:.35rem;display:flex;gap:.4rem;flex-wrap:wrap}
.vide{padding:1.3rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Réseaux sociaux ». */
function pageSociaux() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Réseaux sociaux — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">📡</span><h1>Réseaux sociaux</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var ONGLET = 'file';       // file | historique
  var ARME = '';             // id arme pour publication, ou '__tout', ou '__vider'
  var OCCUPE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var _direT = null;
  function dire(t, cl){
    msg.className = 'msg' + (cl ? ' ' + cl : ''); msg.textContent = t || '';
    clearTimeout(_direT);
    if (t && cl === 'bon') _direT = setTimeout(function(){
      if (msg.textContent === t) { msg.textContent = ''; msg.className = 'msg'; }
    }, 4000);
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux réseaux sociaux.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette publication n’existe plus.',
    file_vide:          'Il n’y a rien à publier.',
    publication:        'La publication a échoué.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 160)) + ')';
    return t;
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

  var LIB = { published: 'Publiée', partial: 'Partielle', failed: 'Échouée',
              skipped: 'Ignorée', pending: 'En attente' };
  var TONS = { published: 'bon', partial: 'att', failed: 'err',
               skipped: 'neutre', pending: 'att' };

  function reseaux(list){
    if (!list.length) return '<span class="dt">aucun réseau</span>';
    return '<span class="res">' + list.map(function(r){
      return '<span title="' + esc(r.nom) + '">' + esc(r.icone || r.nom) + '</span>';
    }).join('') + '</span>';
  }

  /* Le detail PAR RESEAU : c est lui qui distingue << tout est parti >> de
     << deux sur trois >>. Sans lui, une publication partielle passe pour un
     succes et l on cherche longtemps ce qui n est jamais parti. */
  function detailResultats(rs){
    if (!rs || !rs.length) return '';
    return '<div class="detail">' + rs.map(function(x){
      return '<span class="pill ' + (x.ok ? 'bon' : 'err') + '" title="' + esc(x.detail || '') + '">'
        + esc(x.reseau) + (x.ok ? ' ✓' : ' ✕') + '</span>';
    }).join('') + '</div>';
  }

  function entree(e, avecGestes){
    var h = '<div class="entree"><div class="haut">'
      + '<strong>' + esc(e.patron || 'Publication') + '</strong>'
      + '<span class="pill ' + (TONS[e.statut] || 'neutre') + '">' + esc(LIB[e.statut] || e.statut) + '</span>'
      + reseaux(e.reseaux || [])
      + (e.image ? '<span class="pill neutre">image</span>' : '')
      + '<span class="droite">';
    if (avecGestes && D.peutModifier) {
      h += '<button class="mini geste prim" data-publier="' + esc(e.id) + '">'
        + (ARME === e.id ? 'Confirmer l’envoi ?' : 'Publier') + '</button>'
        + '<button class="mini geste" data-ignorer="' + esc(e.id) + '">Ignorer</button>';
    }
    h += '<span class="dt">' + esc(e.partie || e.creee) + '</span>'
      + '</span></div>'
      + '<div class="texte">' + esc(e.contenu || '') + '</div>'
      + detailResultats(e.resultats)
      + '</div>';
    return h;
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var t = D.tuiles || {};
    if (sous) {
      sous.innerHTML = (D.reseauxActifs || []).length
        ? (D.reseauxActifs || []).map(function(r){
            return '<span title="' + esc(r.nom) + '">' + esc(r.icone || '') + '</span>';
          }).join(' ')
        : '<span class="pill neutre">aucun réseau branché</span>';
    }

    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">En attente</div><div class="val att">' + (t.enAttente || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Publiées</div><div class="val bon">' + (t.publiees || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Échouées</div><div class="val err">' + (t.echouees || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Ignorées</div><div class="val">' + (t.ignorees || 0) + '</div></div>'
      + '</div>';

    h += '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'file' ? ' actif' : '') + '" data-onglet="file">File d’attente'
      + ((D.file || []).length ? '<span class="n hi">' + D.file.length + '</span>' : '') + '</button>'
      + '<button class="mini' + (ONGLET === 'historique' ? ' actif' : '') + '" data-onglet="historique">Historique'
      + ((D.historique || []).length ? '<span class="n">' + D.historique.length + '</span>' : '') + '</button>'
      + '<div class="droite">';
    if (ONGLET === 'file' && D.peutModifier && (D.file || []).length) {
      h += '<button class="mini prim" id="so-tout"' + (OCCUPE ? ' disabled' : '') + '>'
        + (OCCUPE ? 'Publication…' : (ARME === '__tout' ? 'Confirmer — tout publier ?' : 'Tout publier')) + '</button>';
    }
    if (ONGLET === 'historique' && D.peutModifier && (D.historique || []).length) {
      h += '<button class="mini danger" id="so-vider">'
        + (ARME === '__vider' ? 'Confirmer ?' : 'Vider le journal') + '</button>';
    }
    h += '</div></div>';

    var pile = ONGLET === 'file' ? (D.file || []) : (D.historique || []);
    h += '<div class="carte">';
    if (!pile.length) {
      h += '<div class="vide">' + (ONGLET === 'file'
        ? 'Aucune publication en attente.' : 'Rien au journal pour l’instant.') + '</div>';
    } else {
      h += pile.map(function(e){ return entree(e, ONGLET === 'file'); }).join('');
    }
    h += '</div>';

    corps.innerHTML = h;

    var bt = document.getElementById('so-tout');
    if (bt) bt.onclick = function(){
      if (ARME !== '__tout') {
        ARME = '__tout'; dessiner();
        dire('Cliquez de nouveau pour publier toute la file — les messages partent chez les réseaux et ne se rattrapent pas.', 'att');
        return;
      }
      ARME = ''; OCCUPE = true; dessiner();
      dire('Publication de la file…', 'att');
      appeler('sociaux:publierTout', []).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        var bilan = r.completes + ' publiée' + (r.completes > 1 ? 's' : '')
          + (r.partielles ? ', ' + r.partielles + ' partielle' + (r.partielles > 1 ? 's' : '') : '')
          + (r.echecs ? ', ' + r.echecs + ' en échec' : '')
          + ' sur ' + r.tentees + '.';
        dire(bilan, (r.partielles || r.echecs) ? 'att' : 'bon');
        ONGLET = 'historique';
        charger();
      });
    };

    var bv = document.getElementById('so-vider');
    if (bv) bv.onclick = function(){
      if (ARME !== '__vider') {
        ARME = '__vider'; dessiner();
        dire('Cliquez « Confirmer ? » — le journal est effacé, mais les publications restent en ligne sur les réseaux.', 'att');
        return;
      }
      ARME = '';
      appeler('sociaux:viderHistorique', []).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(r.efface + ' entrée' + (r.efface > 1 ? 's effacées' : ' effacée') + ' du journal.', 'bon');
        charger();
      });
    };
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;

    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); ARME = ''; dessiner(); return; }

    var bp = t.closest('[data-publier]');
    if (bp) {
      var idP = bp.getAttribute('data-publier');
      /* ARME EN DEUX CLICS : le message part a l exterieur et ne revient pas. */
      if (ARME !== idP) {
        ARME = idP; dessiner();
        dire('Cliquez « Confirmer l’envoi ? » — la publication part chez les réseaux et ne se rattrape pas.', 'att');
        return;
      }
      ARME = '';
      bp.disabled = true;
      dire('Publication…', 'att');
      appeler('sociaux:publier', [idP]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        if (r.complet) {
          dire('« ' + (r.patron || '') + ' » publiée sur tous les réseaux.', 'bon');
        } else {
          var rates = (r.resultats || []).filter(function(x){ return !x.ok; })
            .map(function(x){ return x.reseau; }).join(', ');
          dire('Envoi partiel — ' + (rates || 'un réseau') + ' n’a pas reçu la publication. Voir le journal.', 'att');
        }
        charger();
      });
      return;
    }

    var bi = t.closest('[data-ignorer]');
    if (bi) {
      ARME = '';
      bi.disabled = true;
      appeler('sociaux:ignorer', [bi.getAttribute('data-ignorer')]).then(function(r){
        if (!r.ok) { bi.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('« ' + (r.patron || '') + ' » retirée de la file.', 'bon');
        charger();
      });
      return;
    }

    /* ⚠⚠ UN CLIC SUR UN BOUTON NE DOIT PAS DÉSARMER CE QU'IL VIENT D'ARMER.
       Les boutons branches par la fonction de branchement posent l armement,
       puis le clic REMONTE jusqu ici : la ligne de desarmement ci-dessous
       s executait dans la foulee, et le bouton revenait a son libelle
       d origine : on voyait l avertissement sans jamais voir Confirmer ?
       (2026-08-09). Un clic sur une commande est traite par SA commande. */
    if (t.closest('button, input, select, label')) return;
    if (ARME) { ARME = ''; dessiner(); }
  });

  function charger(){
    appeler('sociaux:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Réseaux sociaux indisponibles', expliquer(r)); return; }
      D = r;
      dessiner();
    });
  }

  window.szActualiser = function(){ if (!OCCUPE && !ARME) charger(); };
  window.szRevenir = function(){ if (!OCCUPE) charger(); };

  /* ── MODE ANCRE ── Le meme bouton que les autres ecrans. */
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
        + 'color:#e8edf5;cursor:pointer;flex:0 0 auto');
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

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (ARME) { ARME = ''; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageSociaux };
