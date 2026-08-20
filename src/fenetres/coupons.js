'use strict';

/*
 * FENÊTRE « COUPONS » — NATIVE (1.64.0, palier 4)
 * =============================================================================
 * Les codes de réduction appliqués au paiement : la liste complète, la création
 * et la modification DANS la fenêtre, l'activation d'un clic, la suppression
 * armée en deux clics.
 *
 * ⚠ UN COUPON TOUCHE LA CAISSE. Sa valeur, son sous-total minimum et son cumul
 * avec les soldes décident de ce que la cliente paie. Rien n'est décidé ici :
 * la fenêtre porte la saisie, le site tranche (Promo._couponEcrire) — y compris
 * le refus d'un code déjà pris, qui empêche deux réductions de porter le même
 * nom. La fenêtre se contente d'annoncer le verdict.
 *
 * ⚠ « LIVRAISON GRATUITE » N'A PAS DE VALEUR À SAISIR : le champ se retire de
 * lui-même, sinon on demande un chiffre qui ne sera jamais lu.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_JOUR } = require('./socle.js');

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
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:#8fa1b8}
input,select,button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
input[type=checkbox]{width:auto;margin:0}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.32rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody tr:hover td{background:rgba(255,255,255,.04)}
.num{font-family:'Courier New',monospace;text-align:right;white-space:nowrap}
.fin{white-space:nowrap;text-align:right}
.code{font-family:'Courier New',monospace;letter-spacing:1px;background:rgba(255,255,255,.06);
  border-radius:4px;padding:.06rem .4rem;font-weight:700}
.dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:40rem;width:100%;max-height:88vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .7rem;font:700 .98rem/1.3 Georgia,serif}
.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.55rem}
.ch{display:flex;flex-direction:column;gap:.22rem;min-width:0}
.ch.large{grid-column:1/-1}
.ch label{font-size:.72rem;color:#8fa1b8}
.ch input,.ch select{width:100%}
.ch .req{color:#c9a97e}
.ch .aide{font-size:.68rem;color:#6d7f96}
.cases{display:flex;flex-wrap:wrap;gap:.4rem 1rem;margin-top:.5rem}
.cases label{display:inline-flex;align-items:center;gap:.4rem;font-size:.83rem;cursor:pointer}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.9rem;flex-wrap:wrap}
.vide{padding:1.3rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Coupons ». */
function pageCoupons() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Coupons — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🏷️</span><h1>Coupons</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}${JS_BROUILLON}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var Q = '';
  var ETAT = '';            // '' | 'actifs' | 'inactifs'
  var FORM = null;          // null | {} (creation) | {…} (modification)
  var SUPPR_ARME = '';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function fmt(n){
    try { return (Number(n) || 0).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }); }
    catch (e) { return (Number(n) || 0).toFixed(2) + ' $'; }
  }
  function jour(d){
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-CA'); } catch (e) { return String(d); }
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux promotions.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Ce coupon n’existe plus.',
    doublon:            'Ce code est déjà pris par un autre coupon.',
    valeur:             'Un code et une valeur supérieure à zéro sont requis.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 140)) + ')';
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

  function filtres(){
    var q = Q.trim().toLowerCase();
    return (D.coupons || []).filter(function(c){
      if (ETAT === 'actifs' && !c.enCours) return false;
      if (ETAT === 'inactifs' && c.enCours) return false;
      if (!q) return true;
      return (String(c.code) + ' ' + String(c.nom)).toLowerCase().indexOf(q) !== -1;
    });
  }

  function boiteForm(){
    var c = FORM || {};
    var creation = !c.id;
    var type = c.type || 'percent';
    return '<div class="voile" id="cp-voile"><div class="boite">'
      + '<h3>' + (creation ? 'Nouveau coupon' : 'Modifier le coupon') + '</h3>'
      + '<div class="grille">'
      + '<div class="ch"><label>Code <span class="req">*</span></label>'
      + '<input id="cp-code" value="' + esc(c.code || '') + '" placeholder="PROMO20" '
      + 'style="font-family:Courier New,monospace;letter-spacing:1px;text-transform:uppercase">'
      + '<span class="aide">Ce que la cliente tape au paiement.</span></div>'
      + '<div class="ch"><label>Nom interne</label>'
      + '<input id="cp-nom" value="' + esc(c.nom || '') + '" placeholder="Promo printemps"></div>'
      + '<div class="ch"><label>Type de réduction</label><select id="cp-type">'
      + '<option value="percent"' + (type === 'percent' ? ' selected' : '') + '>Pourcentage (%)</option>'
      + '<option value="fixed"' + (type === 'fixed' ? ' selected' : '') + '>Montant fixe ($)</option>'
      + '<option value="freeshipping"' + (type === 'freeshipping' ? ' selected' : '') + '>Livraison gratuite</option>'
      + '</select></div>'
      + '<div class="ch" id="cp-ch-val"' + (type === 'freeshipping' ? ' style="display:none"' : '') + '>'
      + '<label>Valeur <span class="req">*</span></label>'
      + '<input type="number" id="cp-val" min="0" step="0.01" value="' + esc(type === 'freeshipping' ? '' : (c.valeur != null ? c.valeur : '')) + '"></div>'
      + '<div class="ch"><label>Sous-total minimum</label>'
      + '<input type="number" id="cp-min" min="0" step="0.01" value="' + esc(c.minimum || 0) + '">'
      + '<span class="aide">0 = aucun minimum.</span></div>'
      + '<div class="ch"><label>Nombre d’utilisations maximum</label>'
      + '<input type="number" id="cp-max" min="0" step="1" value="' + esc(c.maximum || '') + '" placeholder="illimité"></div>'
      + '<div class="ch"><label>Début</label><input type="date" id="cp-sd" value="' + esc(c.debut || '') + '"></div>'
      + '<div class="ch"><label>Fin</label><input type="date" id="cp-ed" value="' + esc(c.fin || '') + '"></div>'
      + '</div>'
      + '<div class="cases">'
      + '<label><input type="checkbox" id="cp-per"' + (c.parClient ? ' checked' : '') + '> Une seule fois par cliente</label>'
      + '<label><input type="checkbox" id="cp-onsale"' + (c.cumulSolde ? ' checked' : '') + '> Cumulable avec les soldes et promotions</label>'
      + '<label><input type="checkbox" id="cp-act"' + (c.actif !== false ? ' checked' : '') + '> Actif</label>'
      + '</div>'
      + '<div class="pied-boite"><button class="mini" id="cp-annuler">Annuler</button>'
      + '<button class="mini prim" id="cp-enr">' + (creation ? 'Créer le coupon' : 'Enregistrer') + '</button></div>'
      + '</div></div>';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var rows = filtres();

    var h = '<div class="barreoutils">'
      + '<input type="search" id="cp-q" placeholder="Code ou nom…" value="' + esc(Q) + '">'
      + '<button class="mini' + (ETAT === '' ? ' actif' : '') + '" data-etat="">Tous</button>'
      + '<button class="mini' + (ETAT === 'actifs' ? ' actif' : '') + '" data-etat="actifs">En cours</button>'
      + '<button class="mini' + (ETAT === 'inactifs' ? ' actif' : '') + '" data-etat="inactifs">Hors service</button>'
      + '<div class="droite">'
      + (D.peutModifier ? '<button class="mini prim" id="cp-nouveau">+ Nouveau coupon</button>' : '')
      + '<span>' + rows.length + ' coupon' + (rows.length > 1 ? 's' : '') + '</span>'
      + '</div></div>';

    h += '<div class="carte">';
    if (!rows.length) {
      h += '<div class="vide">' + (Q || ETAT ? 'Rien ne correspond.' : 'Aucun coupon. Créez le premier.') + '</div>';
    } else {
      h += '<table><thead><tr><th>Code</th><th>Nom</th><th>Réduction</th>'
        + '<th class="num">Minimum</th><th>Cumul soldes</th><th class="num">Utilisations</th>'
        + '<th>Période</th><th>État</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + rows.map(function(c){
            var gestes = '';
            if (D.peutModifier) {
              gestes = '<button class="mini geste" data-modifier="' + esc(c.id) + '">Modifier</button> '
                + '<button class="mini geste" data-basculer="' + esc(c.id) + '">'
                + (c.actif ? 'Désactiver' : 'Activer') + '</button> '
                + '<button class="mini geste danger" data-suppr="' + esc(c.id) + '">'
                + (SUPPR_ARME === c.id ? 'Confirmer ?' : 'Supprimer') + '</button>';
            }
            return '<tr><td><span class="code">' + esc(c.code) + '</span></td>'
              + '<td>' + esc(c.nom || '—') + '</td>'
              + '<td style="font-weight:700;color:#c9a97e">' + esc(c.reduction) + '</td>'
              + '<td class="num">' + (c.minimum ? fmt(c.minimum) : '—') + '</td>'
              + '<td>' + (c.cumulSolde ? '<span class="pill bon">autorisé</span>'
                                       : '<span class="pill neutre">refusé</span>') + '</td>'
              + '<td class="num">' + c.utilise + (c.maximum ? ' / ' + c.maximum : ' / ∞') + '</td>'
              + '<td class="dt">' + (c.debut ? esc(jour(c.debut)) : '—')
              + (c.fin ? ' → ' + esc(jour(c.fin)) : '') + '</td>'
              + '<td><span class="pill ' + (c.enCours ? 'bon' : 'neutre') + '">'
              + (c.enCours ? 'En cours' : 'Hors service') + '</span></td>'
              + (D.peutModifier ? '<td class="fin">' + gestes + '</td>' : '') + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';

    if (FORM) h += boiteForm();
    corps.innerHTML = h;
    brancher();
  }

  function brancher(){
    var q = document.getElementById('cp-q');
    if (q) q.oninput = function(){ Q = q.value; redessinerSansPerdreLaSaisie(); };
    var bn = document.getElementById('cp-nouveau');
    if (bn) bn.onclick = function(){ FORM = {}; dessiner(); szBrouillonProposer(); };
    var ba = document.getElementById('cp-annuler');
    /* ⚠ TROIS CHEMINS FERMENT CETTE BOITE : le bouton Annuler, le clic a cote,
       et la touche Echap. Les trois doivent ecrire le brouillon MAINTENANT, avec
       les valeurs prises avant que la boite ne disparaisse. En oublier un, c est
       exactement le defaut n°1 des Depenses — et le clic a cote est celui qui
       arrive le plus souvent par accident, donc celui qui cout le plus cher. */
    if (ba) ba.onclick = function(){ szBrouillonMaintenant(); FORM = null; dessiner(); };
    var vo = document.getElementById('cp-voile');
    if (vo) vo.onclick = function(ev){ if (ev.target === vo) { szBrouillonMaintenant(); FORM = null; dessiner(); } };

    // « Livraison gratuite » : le champ de valeur se retire de lui-meme.
    var ty = document.getElementById('cp-type');
    if (ty) ty.onchange = function(){
      var ch = document.getElementById('cp-ch-val');
      if (ch) ch.style.display = (ty.value === 'freeshipping') ? 'none' : '';
    };

    var be = document.getElementById('cp-enr');
    if (be) be.onclick = function(){
      var v = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
      var k = function(id){ var e = document.getElementById(id); return !!(e && e.checked); };
      be.disabled = true;
      appeler('coupons:enregistrer', [(FORM && FORM.id) || '', {
        code: v('cp-code'), nom: v('cp-nom'), type: v('cp-type'), valeur: v('cp-val'),
        minimum: v('cp-min'), maximum: v('cp-max'), debut: v('cp-sd'), fin: v('cp-ed'),
        parClient: k('cp-per'), cumulSolde: k('cp-onsale'), actif: k('cp-act')
      }]).then(function(r){
        be.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        /* Le brouillon meurt a l enregistrement reussi, pas avant. */
        szBrouillonJeter();
        FORM = null;
        dire('Coupon ' + r.code + (r.creation ? ' créé.' : ' mis à jour.'), 'bon');
        charger();
      });
    };
  }

  /* ══ LE BROUILLON DU COUPON ═══════════════════════════════
     Un coupon se remplit en une dizaine de champs, dont deux dates. Ce n est pas
     une heure de travail, mais c est assez pour ne pas vouloir le refaire — et
     rien n en gardait trace : les valeurs ne vivent que dans les champs de la
     boite, qui disparait au moindre clic a cote.
     ⚠ UNE CLE PAR COUPON : une saisie laissee sur un coupon ne doit pas etre
     proposee sur le suivant. */
  var BR_CHAMPS = ['cp-code', 'cp-nom', 'cp-type', 'cp-val', 'cp-min', 'cp-max', 'cp-sd', 'cp-ed'];
  var BR_CASES = ['cp-per', 'cp-onsale', 'cp-act'];
  szBrouillonBrancher({
    portee: 'coupon',
    libelle: 'Un coupon',
    ttlMin: 720,
    cle: function(){ return FORM ? (FORM.id ? ('c:' + FORM.id) : '__new__') : ''; },
    actif: function(){ return !!FORM; },
    valeurs: function(){ return szBrouillonDuDom(BR_CHAMPS, BR_CASES); },
    /* En creation, le code ou le nom suffit. En modification, on compare au
       coupon d origine : un formulaire identique a ce qui est en base n a rien a
       proposer. */
    rempli: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, BR_CASES); if (!v) return false;
      if (!FORM || !FORM.id) return szBrouillonQuelqueChose(v, ['cp-code', 'cp-nom', 'cp-val']);
      var c = FORM;
      return String(v['cp-code'] || '') !== String(c.code || '')
        || String(v['cp-nom'] || '') !== String(c.nom || '')
        || String(v['cp-type'] || '') !== String(c.type || 'percent')
        || String(v['cp-val'] || '') !== String(c.valeur != null ? c.valeur : '');
    },
    remplir: function(v){ szBrouillonAuDom(v); },
  });
  szBrouillonEcouter();

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('cp-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('cp-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest || t.closest('.boite')) return;

    var be = t.closest('[data-etat]');
    if (be) { ETAT = be.getAttribute('data-etat'); SUPPR_ARME = ''; dessiner(); return; }

    var bm = t.closest('[data-modifier]');
    if (bm) {
      var idM = bm.getAttribute('data-modifier');
      var c = (D.coupons || []).filter(function(x){ return x.id === idM; })[0];
      if (c) { FORM = c; SUPPR_ARME = ''; dessiner(); szBrouillonProposer(); }
      return;
    }

    var bb = t.closest('[data-basculer]');
    if (bb) {
      SUPPR_ARME = '';
      bb.disabled = true;
      appeler('coupons:basculer', [bb.getAttribute('data-basculer')]).then(function(r){
        if (!r.ok) { bb.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('Coupon ' + (r.code || '') + (r.actif ? ' activé.' : ' désactivé.'), 'bon');
        charger();
      });
      return;
    }

    var bs = t.closest('[data-suppr]');
    if (bs) {
      var idS = bs.getAttribute('data-suppr');
      /* Suppression ARMEE en deux clics. Elle ne touche pas aux commandes deja
         reglees : le coupon disparait pour l avenir, les reductions passees
         restent — c est ce que dit le message. */
      if (SUPPR_ARME !== idS) {
        SUPPR_ARME = idS;
        dessiner();
        dire('Cliquez « Confirmer ? » pour supprimer — les commandes déjà réglées gardent leur réduction.', 'att');
        return;
      }
      SUPPR_ARME = '';
      appeler('coupons:supprimer', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire('Coupon ' + (r.code || '') + ' supprimé.', 'bon');
        charger();
      });
      return;
    }

    if (SUPPR_ARME) { SUPPR_ARME = ''; dessiner(); }
  });

  function charger(){
    appeler('coupons:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Coupons indisponibles', expliquer(r)); return; }
      D = r;
      if (sous) sous.textContent = D.peutModifier ? '' : 'consultation seulement';
      dessiner();
    });
  }

  window.szActualiser = function(){
    var q = document.getElementById('cp-q');
    if (q && document.activeElement === q && q.value) return;
    if (FORM) return;          // on ne redessine pas sous un formulaire ouvert
    charger();
  };
  window.szRevenir = function(){ if (!FORM) charger(); };

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
      if (FORM) { szBrouillonMaintenant(); FORM = null; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageCoupons };
