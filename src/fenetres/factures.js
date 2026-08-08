'use strict';

/*
 * FENÊTRE « FACTURES » — NATIVE
 * =============================================================================
 * La LISTE des factures, en fenêtre de consultation : recherche, filtre par
 * statut, pagination locale. Cliquer une ligne ouvre la facture dans SA
 * fenêtre native (une par facture, celle qui existe déjà — factures:ouvrir).
 * Depuis 1.61.0, c'est l'écran FACTURATION AU COMPLET : les six tuiles,
 * encaisser/annuler un paiement (factures:payer), supprimer (confirmée en
 * deux clics, factures:supprimer) et l'état de compte client (factures:etat).
 * Les règles vivent au site (Billing._facture*Coeur) — la fenêtre ne décide
 * de rien. Sur un VIEUX site, tuiles et gestes sont absents de la réponse :
 * la fenêtre les cache et reste la liste de consultation qu'elle était.
 *
 * ⚠ LA LISTE SE CHARGE UNE FOIS (factures:liste, lignes allégées — jamais les
 * articles) puis se filtre ICI, à chaque frappe, sans repasser par le pont.
 * L'écran se tient à jour tout seul (szActualiser après une vente, un
 * remboursement, un statut) — mais JAMAIS pendant une saisie dans la recherche.
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
input[type=search],select,button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:220px}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.bon{border-color:rgba(34,197,94,.5);color:#4ade80}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:.5rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:#4ade80}.tuile .val.att{color:#fbbf24}.tuile .val.err{color:#f87171}
.tuile .sub{font-size:.66rem;color:#8fa1b8}
tbody .fin{white-space:nowrap;text-align:right}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:26rem;width:100%;padding:.9rem 1rem}
.boite h3{margin:0 0 .6rem;font:700 .95rem/1.3 Georgia,serif}
.boite select{width:100%;font:inherit;color:#e8edf5;background:#0f1826;
  border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:.38rem .55rem}
.boite .pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.8rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:rgba(255,255,255,.04)}
tbody td{padding:.34rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.err{background:rgba(239,68,68,.16);color:#f87171}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:#8fa1b8}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Factures ». */
function pageFactures() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Factures — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🧾</span><h1>Factures</h1>
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

  var LIGNES = null;       // toutes les lignes (factures:liste), filtrees ici
  var Q = '';              // texte de recherche
  var STATUT = '';         // '' = tous
  var PAGE = 0;
  var PAR_PAGE = 25;
  var TUILES = null;                     // absentes sur un vieux site
  var PEUT_ENC = false, PEUT_SUP = false;
  var CLIENTS = [];                      // pour l'etat de compte
  var SUPPR_ARME = '';                   // id de la facture a confirmer
  var ETAT_OUVERT = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var _direT = null;
  function dire(t, cl){
    msg.className = 'msg' + (cl ? ' ' + cl : ''); msg.textContent = t || '';
    clearTimeout(_direT);
    /* Un message de SUCCES s'efface seul apres quelques secondes : il restait
       sinon a l'ecran pour toujours (2026-08-09, << Facture ouverte dans sa
       fenetre >>). Les ERREURS restent : on doit pouvoir les lire. */
    if (t && cl === 'bon') _direT = setTimeout(function(){
      if (msg.textContent === t) { msg.textContent = ''; msg.className = 'msg'; }
    }, 4000);
  }
  function fmt(n){
    try { return (Number(n) || 0).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }); }
    catch (e) { return (Number(n) || 0).toFixed(2) + ' $'; }
  }
  function fmtDate(d){
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch (e) { return String(d || ''); }
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux factures.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette facture n’existe plus.',
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
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  function pilule(statut, libelle){
    var ton = { paid: 'bon', demo: 'bon', unpaid: 'att', overdue: 'err', cancelled: 'err' }[statut] || 'neutre';
    return '<span class="pill ' + ton + '">' + esc(libelle || statut) + '</span>';
  }

  function filtrees(){
    var q = Q.trim().toLowerCase();
    return (LIGNES || []).filter(function(r){
      if (STATUT && r.statut !== STATUT) return false;
      if (!q) return true;
      return (String(r.numero) + ' ' + String(r.commande) + ' ' + String(r.client)
        + ' ' + String(r.courriel || ''))
        .toLowerCase().indexOf(q) !== -1;
    });
  }

  function dessiner(){
    if (!LIGNES) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var rows = filtrees();
    var pages = Math.max(1, Math.ceil(rows.length / PAR_PAGE));
    var p = Math.min(Math.max(0, PAGE), pages - 1);
    PAGE = p;
    var vue = rows.slice(p * PAR_PAGE, p * PAR_PAGE + PAR_PAGE);

    var h = '';
    if (TUILES) {
      var tuile = function(lbl, val, ton, sub){
        return '<div class="tuile"><div class="lbl">' + lbl + '</div>'
          + '<div class="val' + (ton ? ' ' + ton : '') + '">' + val + '</div>'
          + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>';
      };
      var nbR = TUILES.nbRemboursements || 0;
      h += '<div class="tuiles">'
        + tuile('Total facturé', fmt(TUILES.total), '')
        + tuile('Encaissé', fmt(TUILES.encaisse), 'bon')
        + tuile('À recevoir', fmt(TUILES.aRecevoir), 'att')
        + tuile('Remboursé', fmt(TUILES.rembourse), 'att', nbR + ' remboursement' + (nbR > 1 ? 's' : ''))
        + tuile('Dépenses ' + (TUILES.annee || ''), fmt(TUILES.depenses), 'err')
        + tuile('Nb factures', String(TUILES.nb || 0), '')
        + '</div>';
    }
    h += '<div class="barreoutils">'
      + '<input type="search" id="f-q" placeholder="Numéro, commande ou client…" value="' + esc(Q) + '">'
      + '<select id="f-statut">'
      + '<option value=""' + (STATUT === '' ? ' selected' : '') + '>Tous les statuts</option>'
      + '<option value="paid"' + (STATUT === 'paid' ? ' selected' : '') + '>Payée</option>'
      + '<option value="unpaid"' + (STATUT === 'unpaid' ? ' selected' : '') + '>Non payée</option>'
      + '<option value="overdue"' + (STATUT === 'overdue' ? ' selected' : '') + '>En retard</option>'
      + '<option value="cancelled"' + (STATUT === 'cancelled' ? ' selected' : '') + '>Annulée</option>'
      + '</select>'
      + '<span class="droite">'
      + (CLIENTS.length ? '<button class="mini" id="f-etat">État de compte client</button>' : '')
      + rows.length + ' facture' + (rows.length > 1 ? 's' : '') + '</span>'
      + '</div>';

    h += '<div class="carte">';
    if (!vue.length) {
      h += '<div class="vide">Aucune facture ne correspond.</div>';
    } else {
      var avecGestes = PEUT_ENC || PEUT_SUP;
      h += '<table><thead><tr><th>Numéro</th><th>Commande</th><th>Client</th>'
        + '<th>Échéance</th><th>Total</th><th>Statut</th>' + (avecGestes ? '<th></th>' : '') + '</tr></thead><tbody>'
        + vue.map(function(r){
            var gestes = '';
            if (PEUT_ENC) {
              if (r.statut === 'unpaid' || r.statut === 'overdue') gestes += '<button class="mini geste bon" data-payer="' + esc(r.id) + '" title="Marquer la facture comme payée">Payée</button> ';
              else if (r.statut === 'paid') gestes += '<button class="mini geste" data-depayer="' + esc(r.id) + '" title="Annuler le statut de paiement">Annuler</button> ';
            }
            if (PEUT_SUP) gestes += '<button class="mini geste danger" data-suppr="' + esc(r.id) + '">' + (SUPPR_ARME === r.id ? 'Confirmer ?' : 'Supprimer') + '</button>';
            return '<tr data-id="' + esc(r.id) + '" title="Ouvrir la facture">'
              + '<td><span class="num">' + esc(r.numero) + '</span>'
              + '<div class="dt">' + esc(fmtDate(r.date)) + '</div></td>'
              + '<td>' + esc(r.commande || '—') + '</td>'
              + '<td>' + esc(r.client || '—') + '</td>'
              + '<td>' + esc(fmtDate(r.echeance)) + '</td>'
              + '<td>' + esc(fmt(r.total)) + '</td>'
              + '<td>' + pilule(r.statut, r.statutLibelle) + '</td>'
              + (avecGestes ? '<td class="fin">' + gestes + '</td>' : '') + '</tr>';
          }).join('')
        + '</tbody></table>';
      if (pages > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="f-prec"' + (p <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (p + 1) + ' / ' + pages + '</span>'
          + '<button class="mini" id="f-suiv"' + (p >= pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';

    if (ETAT_OUVERT) {
      h += '<div class="voile" id="f-voile"><div class="boite">'
        + '<h3>État de compte client</h3>'
        + '<select id="f-client"><option value="">— Choisir un client —</option>'
        + CLIENTS.map(function(c){
            return '<option value="' + esc(c.id) + '">' + esc(c.nom) + ' (' + esc(c.courriel) + ')</option>';
          }).join('')
        + '</select>'
        + '<div class="pied-boite"><button class="mini" id="f-etat-annuler">Annuler</button>'
        + '<button class="mini geste bon" id="f-etat-generer">Générer l’état</button></div>'
        + '</div></div>';
    }
    corps.innerHTML = h;

    var be = document.getElementById('f-etat');
    if (be) be.onclick = function(){ ETAT_OUVERT = true; dessiner(); };
    var bea = document.getElementById('f-etat-annuler');
    if (bea) bea.onclick = function(){ ETAT_OUVERT = false; dessiner(); };
    var beg = document.getElementById('f-etat-generer');
    if (beg) beg.onclick = function(){
      var sel = document.getElementById('f-client');
      var v = sel ? sel.value : '';
      if (!v) { dire('Choisissez un client.', 'err'); return; }
      beg.disabled = true;
      appeler('factures:etat', [v]).then(function(r){
        ETAT_OUVERT = false; dessiner();
        dire(r.ok ? 'État de compte envoyé à l’impression (fenêtre principale).' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
    var vo = document.getElementById('f-voile');
    if (vo) vo.onclick = function(ev){ if (ev.target === vo) { ETAT_OUVERT = false; dessiner(); } };

    var q = document.getElementById('f-q');
    if (q) {
      q.oninput = function(){ Q = q.value; PAGE = 0; redessinerSansPerdreLaSaisie(); };
    }
    var s = document.getElementById('f-statut');
    if (s) s.onchange = function(){ STATUT = s.value; PAGE = 0; dessiner(); };
    var bp = document.getElementById('f-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, PAGE - 1); dessiner(); };
    var bs = document.getElementById('f-suiv');
    if (bs) bs.onclick = function(){ PAGE = PAGE + 1; dessiner(); };
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS : a chaque frappe on ne
     reecrit que la carte des resultats, pas la barre d outils — le curseur et
     la selection restent ou ils sont. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('f-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('f-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var bpay = t.closest('[data-payer]');
    if (bpay) {
      SUPPR_ARME = '';
      bpay.disabled = true;
      appeler('factures:payer', [bpay.getAttribute('data-payer'), true]).then(function(r){
        if (!r.ok) { bpay.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('Facture ' + (r.num || '') + ' marquée comme payée.', 'bon');
        charger();
      });
      return;
    }
    var bdep = t.closest('[data-depayer]');
    if (bdep) {
      SUPPR_ARME = '';
      bdep.disabled = true;
      appeler('factures:payer', [bdep.getAttribute('data-depayer'), false]).then(function(r){
        if (!r.ok) { bdep.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('Statut de paiement annulé pour ' + (r.num || 'la facture') + '.', 'bon');
        charger();
      });
      return;
    }
    var bsup = t.closest('[data-suppr]');
    if (bsup) {
      var idS = bsup.getAttribute('data-suppr');
      /* Suppression ARMEE en deux clics : pas de boite, mais jamais un seul
         clic pour un geste irreversible (la facture est retiree de partout,
         y compris du compte client et du nuage). */
      if (SUPPR_ARME !== idS) {
        SUPPR_ARME = idS;
        dessiner();
        dire('Cliquez « Confirmer ? » pour supprimer définitivement — la facture sera retirée de partout, y compris du compte client.', 'att');
        return;
      }
      SUPPR_ARME = '';
      appeler('factures:supprimer', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire('Facture ' + (r.num || '') + ' supprimée.', 'bon');
        charger();
      });
      return;
    }
    if (SUPPR_ARME) { SUPPR_ARME = ''; dessiner(); }
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-id]');
    if (!tr) return;
    dire('Ouverture…');
    appeler('factures:ouvrir', [tr.getAttribute('data-id')]).then(function(r){
      dire(r.ok ? 'Facture ouverte dans sa fenêtre.' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  };

  function charger(){
    appeler('factures:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Factures indisponibles', expliquer(r)); return; }
      LIGNES = r.lignes || [];
      TUILES = r.tuiles || null;
      PEUT_ENC = !!r.peutEncaisser;
      PEUT_SUP = !!r.peutSupprimer;
      CLIENTS = r.clients || [];
      dire('');
      dessiner();
    });
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : une vente, un remboursement ou
     un statut de commande font relire la liste sans geste — mais jamais
     pendant une saisie dans la recherche (on redessinerait sous les doigts). */
  window.szActualiser = function(){
    var q = document.getElementById('f-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  // Ramenee au premier plan par le menu ou << Tout voir >> : la liste se relit.
  window.szRevenir = function(){ charger(); };

  /* ── MODE ANCRE (1.55.0) ── Le meme bouton que les autres ecrans : detacher
     la vue ancree, ou RAMENER la vue detachee dans la fenetre principale. */
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
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageFactures };
