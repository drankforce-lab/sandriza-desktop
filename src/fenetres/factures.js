'use strict';

/*
 * FENÊTRE « FACTURES » — NATIVE
 * =============================================================================
 * La LISTE des factures, en fenêtre de consultation : recherche, filtre par
 * statut, pages mesurees (JS_PAGES). Cliquer une ligne ouvre la facture dans SA
 * fenêtre native (une par facture, celle qui existe déjà — factures:ouvrir).
 * Depuis 1.61.0, c'est l'écran FACTURATION AU COMPLET : les six tuiles,
 * encaisser/annuler un paiement (factures:payer), supprimer (confirmée dans
 * une boîte à part, szConfirmer, factures:supprimer) et l'état de compte client (factures:etat).
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

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit — jamais un numero de facture, un
   nom de client ni un montant (voir src/langue/factures.js). */
const T = require('../langue').tr('factures');

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
/* LA GRAMMAIRE DE LA COMPTABILITE (2026-10-16) : tete (resume, geste principal), bande de 4 chiffres,
   onglets segmentes, puis le tableau et son panneau d appui (CSS_COMPTA du socle). Aucune glissiere :
   la liste va en PAGES mesurees (data-pages). */
#corps{overflow:hidden}
input[type=search],select,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
select,button{cursor:pointer}
.ed-seg button{border:none}
.ed-seg .n{margin-left:.4rem;font-size:.7rem;color:var(--tx3);font-variant-numeric:tabular-nums}
/* Contrastes Linux 7.37.0 : --tx2 sur le segment actif du jour tombait a 4.24. */
.ed-seg button.on .n{color:var(--tx)}
.cx-barre .rf-rch{width:18rem;flex:0 0 auto}
th.r,td.r{text-align:right;font-variant-numeric:tabular-nums}
td .cx-num{font-weight:700;white-space:nowrap}
.cx-qui b{font-weight:650}
.cx-etat>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
input:focus,select:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.bon{border-color:rgba(34,197,94,.5);color:var(--tx-ok)}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
tbody .fin{white-space:nowrap;text-align:right}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:var(--f-carte2);border:1px solid var(--v14);border-radius:13px;
  max-width:26rem;width:100%;padding:.9rem 1rem}
.boite h3{margin:0 0 .6rem;font:700 .95rem/1.3 Georgia,serif}
.boite select{width:100%;font:inherit;color:var(--tx);background:var(--f-0f1826);
  border:1px solid var(--v14);border-radius:8px;padding:.38rem .55rem}
.boite .pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.8rem}
table{width:100%;font-size:.84rem}
thead th{text-align:left}
tbody tr{cursor:pointer}
tbody td{vertical-align:middle}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Factures ». */
function pageFactures() {
  return `${TETE()}
<title>${T("Factures — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.billing}</span><h1>${T("Factures")}</h1>
  <span class="cx-resume" id="sous"></span>
  <div class="cx-actions" id="f-actions"></div></div>
<div class="cx" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('factures')}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var LIGNES = null;       // toutes les lignes (factures:liste), filtrees ici
  var Q = '';              // texte de recherche
  var STATUT = '';         // '' = tous
  /* Plus de pages fixes de 25 (2026-10-12) : toutes les lignes sont ecrites, le socle
     les met en pages a la hauteur reelle de la fenetre (data-pages="factures"). */
  var TUILES = null;                     // absentes sur un vieux site
  var PEUT_ENC = false, PEUT_SUP = false;
  var CLIENTS = [];                      // pour l'etat de compte
  var SUPPR_ARME = '';                   // id de la facture a confirmer
  var ETAT_OUVERT = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function fmt(n){
    return szArgent(n);   /* voir szArgent (socle) : le repli aussi place le symbole */
  }
  function fmtDate(d){
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('${LIEU()}', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch (e) { return String(d || ''); }
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux factures.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cette facture n’existe plus.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    return MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
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

  /* La pastille a point de l Inventaire (rf-pill, refonte du 2026-09-25) : payee
     en vert, a recevoir en ambre, en retard en rouge, annulee en gris. */
  function pilule(statut, libelle){
    var ton = { paid: 'vert', demo: 'vert', unpaid: 'ambre', overdue: 'rouge', cancelled: '' }[statut] || '';
    return '<span class="rf-pill ' + ton + '">' + esc(libelle || statut) + '</span>';
  }
  /* Les initiales du client (Marie Tremblay -> MT) ; decoupe sur l espace. */
  function initiales(nom){
    var m = String(nom || '').trim().split(' ').filter(Boolean);
    if (!m.length || m[0] === '—') return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
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
    if (!LIGNES) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    var rows = filtrees();
    var vue = rows;

    var h = '';
    var nbTout = (LIGNES || []).length;
    var compte = { '': nbTout, paid: 0, unpaid: 0, overdue: 0, cancelled: 0 };
    var aRec = [];                       // non payees et en retard, pour l echeance
    (LIGNES || []).forEach(function(r){
      if (compte[r.statut] != null) compte[r.statut]++;
      if (r.statut === 'unpaid' || r.statut === 'overdue') aRec.push(r);
    });
    aRec.sort(function(a, b){ return String(a.echeance || '').localeCompare(String(b.echeance || '')); });
    function nbFact(n){ return n + ' ' + (n > 1 ? '${T("factures")}' : '${T("facture")}'); }
    function pct(part, tout){
      var v = tout > 0 ? Math.max(0, Math.min(100, part / tout * 100)) : 0;
      return v;
    }
    function pctTexte(v){
      try { return v.toLocaleString('${LIEU()}', { maximumFractionDigits: 1 }); }
      catch (e) { return String(Math.round(v)); }
    }

    /* ── LA TETE : le resume a gauche, le geste principal a droite (#f-etat, meme id qu avant). ── */
    var sousT = document.getElementById('sous');
    if (sousT) sousT.textContent = nbFact(nbTout)
      + (TUILES ? ' · ' + '${T("{0} à recevoir")}'.split('{0}').join(fmt(TUILES.aRecevoir)) : '');
    var act = document.getElementById('f-actions');
    if (act) act.innerHTML = CLIENTS.length ? '<button class="prim" id="f-etat">${T("État de compte client")}</button>' : '';

    /* ── LES QUATRE CHIFFRES (.cx-kpis) — les six tuiles d avant y sont toutes : le nombre de factures
       sous « Facturé », les depenses dans le panneau d appui. Absents sur un vieux site. ── */
    if (TUILES) {
      var kpi = function(lbl, val, ton, sub){
        return '<div class="cx-kpi' + (ton ? ' ' + ton : '') + '"><span>' + lbl + '</span><b>' + val + '</b>'
          + '<small>' + (sub || '&nbsp;') + '</small></div>';
      };
      var nbR = TUILES.nbRemboursements || 0;
      var tot = Number(TUILES.total) || 0;
      var proch = aRec.length ? aRec[0] : null;
      h += '<div class="cx-kpis">'
        + kpi('${T("Total facturé")}', esc(fmt(TUILES.total)), '', esc(nbFact(TUILES.nb || 0)))
        + kpi('${T("Encaissé")}', esc(fmt(TUILES.encaisse)), 'ok',
            esc('${T("{0} % du facturé")}'.split('{0}').join(pctTexte(pct(Number(TUILES.encaisse) || 0, tot)))))
        + kpi('${T("À recevoir")}', esc(fmt(TUILES.aRecevoir)), 'att',
            esc(!aRec.length ? '${T("Aucune facture impayée")}'
              : (aRec.length > 1 ? '${T("{0} factures impayées")}'.split('{0}').join(aRec.length) : '${T("1 facture impayée")}')
                + (proch && proch.echeance ? ' · ' + '${T("échéance {0}")}'.split('{0}').join(fmtDate(proch.echeance)) : '')))
        /* Deux formes ENTIERES : un << s >> colle a part ne se traduit pas. */
        + kpi('${T("Remboursé")}', esc(fmt(TUILES.rembourse)), '',
            esc(nbR + (nbR > 1 ? '${T(" remboursements")}' : '${T(" remboursement")}')))
        + '</div>';
    }

    /* ── LA BARRE : les statuts en onglets segmentes (data-fst, comme avant), la recherche a droite (#f-q). ── */
    var seg = function(v, lib){
      return '<button type="button" class="' + (STATUT === v ? 'on' : '') + '" data-fst="' + v + '">' + lib
        + '<span class="n">' + (compte[v] || 0) + '</span></button>';
    };
    h += '<div class="cx-barre"><div class="ed-seg">'
      + seg('', '${T("Toutes")}') + seg('unpaid', '${T("Non payées")}') + seg('overdue', '${T("En retard")}')
      + seg('paid', '${T("Payées")}') + seg('cancelled', '${T("Annulées")}')
      + '</div><div class="droite">'
      + '<label class="rf-rch">${ICO.loupe}<input aria-label="${T("Numéro, commande ou client")}" type="search" id="f-q" placeholder="${T("Numéro, commande ou client…")}" value="' + esc(Q) + '"></label>'
      + '</div></div>';

    /* ── LE TABLEAU (data-pages="factures") ── */
    var t = '<div class="cx-carte sz-pagee' + (TUILES ? '' : ' cx-plein') + '">';
    if (!vue.length) {
      t += '<div class="vide">${T("Aucune facture ne correspond.")}</div>';
    } else {
      var avecGestes = PEUT_ENC || PEUT_SUP;
      t += '<div class="cx-pages" data-pages="factures"><table><thead><tr><th>${T("Facture")}</th><th>${T("Client")}</th>'
        + '<th>${T("Échéance")}</th><th class="r">${T("Total")}</th><th>${T("Statut")}</th>' + (avecGestes ? '<th></th>' : '') + '</tr></thead><tbody>'
        + vue.map(function(r){
            var gestes = '';
            if (PEUT_ENC) {
              if (r.statut === 'unpaid' || r.statut === 'overdue') gestes += '<button class="mini geste bon" data-payer="' + esc(r.id) + '" title="${T("Marquer la facture comme payée")}">${T("✓ Marquer payée")}</button> ';
              /* ⚠ L infobulle ENTIERE : une cle courte posee dans une phrase
                 plus longue laisse l autre moitie en francais. */
              else if (r.statut === 'paid') gestes += '<button class="mini geste" data-depayer="' + esc(r.id) + '" title="${T("Annuler le statut de paiement")}">${T("Annuler le paiement")}</button> ';
            }
            if (PEUT_SUP) gestes += '<button class="mini geste danger" data-suppr="' + esc(r.id) + '">' + '${T("Supprimer")}' + '</button>';
            return '<tr data-id="' + esc(r.id) + '" title="${T("Ouvrir la facture")}">'
              + '<td><span class="cx-num">' + esc(r.numero) + '</span>'
              + '<span class="cx-l2">' + (r.commande ? esc(r.commande) + ' · ' : '') + esc(fmtDate(r.date)) + '</span></td>'
              // ⚠ Le cadenas d une facture est celui de SA COMMANDE : c est
              // elle qui se verrouille (detail, expedition, remboursement).
              + '<td><div class="cx-qui"><span class="cx-av" aria-hidden="true">' + esc(initiales(r.client)) + '</span>'
              + '<div style="min-width:0"><b>' + esc(r.client || '—') + '</b>'
              + szVerrouCase('orders', r.commandeId || '')
              + (r.courriel ? '<span class="cx-l2">' + esc(r.courriel) + '</span>' : '') + '</div></div></td>'
              + '<td>' + esc(fmtDate(r.echeance)) + '</td>'
              + '<td class="r"><b>' + esc(fmt(r.total)) + '</b></td>'
              + '<td>' + pilule(r.statut, szTd(r.statutLibelle)) + '</td>'
              + (avecGestes ? '<td class="fin">' + gestes + '</td>' : '') + '</tr>';
          }).join('')
        + '</tbody></table></div>';
    }
    t += '<div class="cx-pied"><span>' + esc(nbFact(rows.length)) + '</span></div>';
    t += '</div>';

    /* ── LE PANNEAU D APPUI : encaissement, prochaines echeances, depenses — tout depuis la liste et
       les tuiles deja recues ; aucune donnee de plus. Absent sur un vieux site. ── */
    if (TUILES) {
      var totP = Number(TUILES.total) || 0;
      var p = '<div class="cx-carte">'
        + '<h2>${T("Encaissement")}</h2>'
        + '<div class="cx-ligne"><span>${T("Encaissé")}</span><div class="cx-piste"><i class="ok" style="width:'
        + pct(Number(TUILES.encaisse) || 0, totP).toFixed(0) + '%"></i></div><span>' + esc(fmt(TUILES.encaisse)) + '</span></div>'
        + '<div class="cx-ligne"><span>${T("À recevoir")}</span><div class="cx-piste"><i style="width:'
        + pct(Number(TUILES.aRecevoir) || 0, totP).toFixed(0) + '%"></i></div><span>' + esc(fmt(TUILES.aRecevoir)) + '</span></div>'
        + '<div class="cx-sep"></div>'
        + '<h2>${T("Prochaines échéances")}</h2>';
      if (!aRec.length) p += '<div class="cx-sub">${T("Aucune facture à recevoir.")}</div>';
      else {
        p += aRec.slice(0, 4).map(function(r){
          return '<div class="cx-etat"><span>' + esc(r.client || '—') + ' · ' + esc(r.numero) + '</span>'
            + '<span><span class="rf-pill ' + (r.statut === 'overdue' ? 'rouge' : 'ambre') + '">' + esc(fmtDate(r.echeance)) + '</span></span></div>';
        }).join('');
        p += '<div class="cx-sub">' + (compte.overdue
          ? esc(compte.overdue > 1 ? '${T("{0} factures en retard.")}'.split('{0}').join(compte.overdue) : '${T("1 facture en retard.")}')
          : '${T("Aucune facture en retard.")}') + '</div>';
      }
      p += '<div class="cx-sep"></div>'
        + '<h2>' + esc('${T("Dépenses ")}' + (TUILES.annee || '')) + '</h2>'
        + '<div class="cx-etat"><span>${T("Total saisi")}</span><span>' + esc(fmt(TUILES.depenses)) + '</span></div>'
        + '</div>';
      h += '<div class="cx-deux">' + t + p + '</div>';
    } else {
      h += t;
    }

    if (ETAT_OUVERT) {
      h += '<div class="voile" id="f-voile"><div class="boite">'
        + '<h3>${T("État de compte client")}</h3>'
        + '<select id="f-client" aria-label="${T("Client de la facture")}">'
        + '<option value="">${T("— Choisir un client —")}</option>'
        + CLIENTS.map(function(c){
            return '<option value="' + esc(c.id) + '">' + esc(c.nom) + ' (' + esc(c.courriel) + ')</option>';
          }).join('')
        + '</select>'
        + '<div class="pied-boite"><button class="mini" id="f-etat-annuler">${T("Annuler")}</button>'
        + '<button class="mini geste bon" id="f-etat-generer">${T("Générer l’état")}</button></div>'
        + '</div></div>';
    }
    corps.innerHTML = h;
    szVerrousPeindre();   // reposer les cadenas connus sur la liste fraiche

    var be = document.getElementById('f-etat');
    if (be) be.onclick = function(){ ETAT_OUVERT = true; dessiner(); };
    var bea = document.getElementById('f-etat-annuler');
    if (bea) bea.onclick = function(){ ETAT_OUVERT = false; dessiner(); };
    var beg = document.getElementById('f-etat-generer');
    if (beg) beg.onclick = function(){
      var sel = document.getElementById('f-client');
      var v = sel ? sel.value : '';
      if (!v) { dire('${T("Choisissez un client.")}', 'err'); return; }
      beg.disabled = true;
      appeler('factures:etat', [v]).then(function(r){
        ETAT_OUVERT = false; dessiner();
        dire(r.ok ? '${T("État de compte envoyé à l’impression (fenêtre principale).")}' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
    var vo = document.getElementById('f-voile');

    var q = document.getElementById('f-q');
    if (q) {
      q.oninput = function(){ Q = q.value; redessinerSansPerdreLaSaisie(); };
    }
    var s = document.getElementById('f-statut');
    if (s) s.onchange = function(){ STATUT = s.value; dessiner(); };
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
    var fst = t.closest('[data-fst]');
    if (fst) { STATUT = fst.getAttribute('data-fst') || ''; dessiner(); return; }
    var bpay = t.closest('[data-payer]');
    if (bpay) {
      SUPPR_ARME = '';
      bpay.disabled = true;
      appeler('factures:payer', [bpay.getAttribute('data-payer'), true]).then(function(r){
        if (!r.ok) { bpay.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('${T("Facture ")}' + (r.num || '') + '${T(" marquée comme payée.")}', 'bon');
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
        dire('${T("Statut de paiement annulé pour ")}' + (r.num || '${T("la facture")}') + '.', 'bon');
        charger();
      });
      return;
    }
    var bsup = t.closest('[data-suppr]');
    if (bsup) {
      var idS = bsup.getAttribute('data-suppr');
      /* Suppression CONFIRMEE dans une boite a part (szConfirmer, 2026-10-15) :
         jamais un seul clic pour un geste irreversible (la facture est retiree
         de partout, y compris du compte client et du nuage). */
      if (SUPPR_ARME !== idS) {
        var fS = (LIGNES || []).filter(function(x){ return x.id === idS; })[0] || {};
        szConfirmer({ danger: true, titre: '${T("Supprimer la facture")}',
          texte: '${T("La facture")}' + ' ' + (fS.numero || '') + ' ' + '${T("sera supprimée définitivement. Elle sera retirée de partout, y compris du compte client. Cette action est irréversible.")}',
          details: [['${T("Client")}', fS.client || '—'], ['${T("Commande")}', fS.commande || '—'],
            ['${T("Total")}', fmt(fS.total)], ['${T("Statut")}', szTd(fS.statutLibelle) || '—']],
          oui: '${T("Supprimer la facture")}' }).then(function(ok){ if (ok) { SUPPR_ARME = idS; bsup.click(); } });
        return;
      }
      SUPPR_ARME = '';
      appeler('factures:supprimer', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire('${T("Facture ")}' + (r.num || '') + '${T(" supprimée.")}', 'bon');
        charger();
      });
      return;
    }
    if (SUPPR_ARME) { SUPPR_ARME = ''; dessiner(); }
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-id]');
    if (!tr) return;
    dire('${T("Ouverture…")}');
    appeler('factures:ouvrir', [tr.getAttribute('data-id')]).then(function(r){
      dire(r.ok ? '${T("Facture ouverte dans sa fenêtre.")}' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  };

  function charger(){
    appeler('factures:liste', []).then(function(r){
      if (!r || !r.ok) { vide('${T("Factures indisponibles")}', expliquer(r)); return; }
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
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);'
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto');
      t.appendChild(b);
    }
    if (actif) {
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
  szVerrousSuivre(['orders']);
})();
</script>
</body></html>`;
}

module.exports = { pageFactures };
