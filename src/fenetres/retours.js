'use strict';

/*
 * FENÊTRE « NOS RETOURS » — NATIVE
 * =============================================================================
 * La liste des demandes de retour : les neuf onglets de statut avec compteurs
 * (la sémantique — « complétées » = remboursées + complétées, « expire
 * bientôt » — vit dans le cœur du site, Admin._retoursDonnees), la recherche
 * (nom, courriel, numéro de commande), l'alerte d'expiration. Cliquer une
 * ligne ouvre la FENÊTRE DE RETOUR native (retours:ouvrir). AUCUNE écriture
 * ici : approuver, rembourser, marquer reçu sont des gestes de la fenêtre.
 *
 * ⚠ retours:liste ATTEND LA RESYNCHRONISATION des demandes avant de répondre
 * (le site relit le nuage, comme son écran) : le premier chargement peut
 * prendre quelques secondes — c'est la fraîcheur, pas une panne.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit — jamais le motif, qui est ce que
   la cliente a ecrit (voir src/langue/retours.js). */
const T = require('../langue').tr('retours');

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
/* LA GRAMMAIRE DES FACTURES (2026-10-16, sa demande : « le meme look ») : tete (resume, export a
   droite), les cinq etats qui demandent un geste en chiffres CLIQUABLES, les autres en boutons a choix
   (le mot seul : les comptes vivent dans les chiffres et le panneau), puis le tableau en pages et son
   panneau d appui (CSS_COMPTA du socle). */
#corps{overflow:hidden}
input[type=search],button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button.mini{padding:.12rem .42rem;font-size:.74rem}
.ed-seg button{border:none}
.cx-barre .rf-rch{width:18rem;flex:0 0 auto}
.cx-kpis.cinq{grid-template-columns:repeat(5,minmax(0,1fr))}
.cx-kpi[data-onglet]{cursor:pointer;user-select:none}
.cx-kpi[data-onglet]:hover{border-color:rgba(var(--or-rgb),.6)}
.cx-kpi.on{border-color:var(--or)}
[data-onglet].cx-averti,[data-onglet].cx-bon{cursor:pointer}
table{width:100%;font-size:.84rem}
thead th{text-align:left}
th.r,td.r{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
tbody tr{cursor:pointer}
tbody td{vertical-align:middle}
td .cx-num{font-weight:700;white-space:nowrap}
.cx-qui b{font-weight:650}
td.motif{max-width:16rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pastilles{display:flex;flex-wrap:wrap;gap:.3rem;align-items:center}
.pill{display:inline-block;font-size:.6875rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.pill.info{background:rgba(59,130,246,.16);color:var(--tx-bleu)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Nos retours ». */
function pageRetours() {
  return `${TETE()}
<title>${T("Nos retours — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.returns}</span><h1>${T("Nos retours")}</h1>
  <span class="cx-resume" id="sous"></span>
  <div class="cx-actions" id="r-actions"></div></div>
<div class="cx" id="corps"><div class="vide charge">${T("Chargement… (les demandes se resynchronisent)")}</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES()}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;
  var ONGLET = 'pending';
  var Q = '';

  var ONGLETS = [
    ['pending', '${T("En attente")}'], ['approved', '${T("Approuvées")}'], ['in_transit', '${T("En transit")}'],
    ['expiring_soon', '${T("Expire bientôt")}'], ['received', '${T("Reçues")}'], ['disputed', '${T("À analyser")}'],
    ['rejected', '${T("Rejetées")}'], ['completed', '${T("Complétées")}'], ['all', '${T("Toutes")}']
  ];
  /* La pastille a point de l Inventaire (rf-pill, refonte du 2026-09-25) : ambre
     ce qui attend un geste, bleu ce qui avance, vert ce qui est regle, rouge ce
     qui est refuse ou conteste, gris le reste. */
  var TONS = { pending: 'ambre', approved: 'vert', in_transit: 'bleu', received: 'ambre',
    refunded: 'vert', completed: 'vert', rejected: 'rouge', disputed: 'rouge', awaiting_photo: '' };
  /* Les cinq etats qui DEMANDENT UN GESTE deviennent des tuiles ; les quatre
     autres restent en pastilles dans la barre. Neuf pastilles et la recherche
     ne tenaient pas sur une ligne en anglais. Rien ne se perd : les neuf listes
     restent a un clic. */
  var EN_TUILE = { pending: '${T("à traiter")}', in_transit: '${T("en route vers nous")}',
    received: '${T("à inspecter")}', disputed: '${T("à trancher")}', expiring_soon: '${T("délai qui s’achève")}' };
  function initiales(nom){
    var m = String(nom || '').trim().split(' ').filter(Boolean);
    if (!m.length || m[0] === '—') return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
  }

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function fmtDate(d){
    try { return (String(d).length === 10 && String(d).charAt(4) === '-' ? new Date(+String(d).slice(0, 4), +String(d).slice(5, 7) - 1, +String(d).slice(8, 10)) : new Date(d)).toLocaleDateString('${LIEU()}', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return String(d || ''); }
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux retours.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cette demande n’existe plus.")}',
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

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide charge">${T("Chargement… (les demandes se resynchronisent)")}</div>'; return; }
    var c = D.comptes || {};
    var tout = c.all || 0;
    function nbDem(n){ return n + ' ' + (n > 1 ? '${T("demandes")}' : '${T("demande")}'); }

    /* ══ LA GRAMMAIRE DES FACTURES, APPLIQUEE AUX RETOURS (2026-10-16, sa demande) ═══════════
       Crochets gardes : data-onglet (chiffres, boutons, pastilles du panneau), #r-q, le verrou,
       #r-exporter (passe dans la tete), et la ligne — devenue tr[data-id]. */

    /* ── LA TETE : le resume a gauche, l export a droite. ── */
    var sousT = document.getElementById('sous');
    if (sousT) sousT.textContent = nbDem(tout)
      + (c.pending ? ' · ' + '${T("{0} en attente")}'.split('{0}').join(c.pending) : '');
    var act = document.getElementById('r-actions');
    if (act) act.innerHTML = '<button class="mini" id="r-exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>';

    /* ── LES CHIFFRES : les cinq etats qui DEMANDENT UN GESTE (les tuiles d avant), toujours
       cliquables. Ambre des qu il y en a ; rouge pour ce qui expire et ce qui est conteste. ── */
    var h = '<div class="cx-kpis cinq">' + ONGLETS.filter(function(o){ return EN_TUILE[o[0]]; }).map(function(o){
        var n = c[o[0]] || 0;
        var ton = !n ? '' : ((o[0] === 'disputed' || o[0] === 'expiring_soon') ? 'err' : 'att');
        return '<div class="cx-kpi' + (ton ? ' ' + ton : '') + (ONGLET === o[0] ? ' on' : '') + '" data-onglet="' + o[0] + '"'
          + ' title="${T("Cliquer pour afficher")}"><span>' + o[1] + '</span><b>' + n + '</b>'
          + '<small>' + EN_TUILE[o[0]] + '</small></div>';
      }).join('') + '</div>';

    /* ── LA BARRE : les quatre autres listes en boutons a choix — le mot seul (sa regle du
       2026-10-15 : les comptes vivent dans les chiffres) —, la recherche a droite. ── */
    var seg = function(v, lib){
      return '<button type="button" class="' + (ONGLET === v ? 'on' : '') + '" data-onglet="' + v + '">' + lib + '</button>';
    };
    h += '<div class="cx-barre"><div class="ed-seg">'
      + seg('all', '${T("Toutes")}') + seg('approved', '${T("Approuvées")}')
      + seg('rejected', '${T("Rejetées")}') + seg('completed', '${T("Complétées")}')
      + '</div><div class="droite">'
      + '<label class="rf-rch">${ICO.loupe}<input aria-label="${T("Nom, courriel, n° commande")}" type="search" id="r-q" placeholder="${T("Nom, courriel, n° commande…")}" value="' + esc(Q) + '"></label>'
      + '</div></div>';

    /* ── LE TABLEAU (data-pages="retours") ── */
    var rows = D.lignes || [];
    var t = '<div class="cx-carte sz-pagee">';
    if (!rows.length) {
      /* Deux phrases ENTIERES, pas un fragment recolle. */
      t += '<div class="vide">'
        + (ONGLET !== 'all' ? '${T("Aucune demande dans cette catégorie.")}' : '${T("Aucune demande.")}')
        + '</div>';
    } else {
      t += '<div class="cx-pages" data-pages="retours"><table><thead><tr><th>${T("Client")}</th><th>${T("Commande")}</th>'
        + '<th>${T("Motif")}</th><th>${T("Statut")}</th><th class="r">${T("Date")}</th></tr></thead><tbody>'
        + rows.map(function(r){
            var badges = '<span class="rf-pill ' + (TONS[r.statut] || '') + '">' + esc(szTd(r.statutLibelle)) + '</span>';
            if (r.expireAuto) badges += '<span class="rf-pill rouge">${T("Expirée automatiquement")}</span>';
            if (r.expireBientot) badges += '<span class="rf-pill rouge">${T("Expire le ")}' + esc(szQuand(r.expireLe)) + '</span>';
            if (r.etiquette === 'reelle') badges += '<span class="rf-pill bleu">${T("Étiquette réelle")}</span>';
            else if (r.etiquette === 'generee') badges += '<span class="rf-pill bleu">${T("Étiquette générée")}</span>';
            if (r.fraisBoutique) badges += '<span class="rf-pill bleu">${T("Frais pris en charge")}</span>';
            return '<tr data-id="' + esc(r.id) + '" title="${T("Ouvrir la demande de retour")}">'
              + '<td><div class="cx-qui"><span class="cx-av" aria-hidden="true">' + esc(initiales(r.client)) + '</span>'
              + '<div style="min-width:0"><b>' + esc(r.client || '—') + '</b>' + szVerrouCase('return_reqs', r.id)
              + (r.courriel ? '<span class="cx-l2">' + esc(r.courriel) + '</span>' : '') + '</div></div></td>'
              + '<td><span class="cx-num">' + esc(r.commande) + '</span>'
              + (r.suivi ? '<span class="cx-l2">' + esc(r.suivi) + '</span>' : '') + '</td>'
              + '<td class="motif" title="' + esc(r.motif || '') + '">' + esc(r.motif || '–') + '</td>'
              + '<td><div class="pastilles">' + badges + '</div></td>'
              + '<td class="r">' + esc(fmtDate(r.date)) + '</td></tr>';
          }).join('')
        + '</tbody></table></div>';
    }
    t += '<div class="cx-pied"><span>' + esc(nbDem(rows.length)) + '</span></div></div>';

    /* ── LE PANNEAU D APPUI : ou en sont les retours, et ce qui presse — tout depuis les comptes
       deja recus (retours:liste) ; aucune donnee de plus. ── */
    var piste = function(cle, lib, ton){
      var n = c[cle] || 0;
      var v = tout > 0 ? Math.max(0, Math.min(100, n / tout * 100)) : 0;
      return '<div class="cx-ligne"><span>' + lib + '</span><div class="cx-piste"><i' + (ton ? ' class="' + ton + '"' : '')
        + ' style="width:' + v.toFixed(0) + '%"></i></div><span>' + n + '</span></div>';
    };
    var p = '<div class="cx-carte">'
      + '<h2>${T("Parcours des retours")}</h2>'
      + piste('pending', '${T("En attente")}', '') + piste('approved', '${T("Approuvées")}', 'info')
      + piste('in_transit', '${T("En transit")}', 'info') + piste('received', '${T("Reçues")}', '')
      + piste('completed', '${T("Complétées")}', 'ok') + piste('rejected', '${T("Rejetées")}', 'err')
      + '<div class="cx-sep"></div>'
      + '<h2>${T("À surveiller")}</h2>';
    var nExp = c.expiring_soon || 0, nDis = c.disputed || 0;
    if (nExp) p += '<div class="cx-averti" data-onglet="expiring_soon" title="${T("Cliquer pour afficher")}"><span>'
      + esc(nExp > 1 ? '${T("{0} demandes expirent bientôt.")}'.split('{0}').join(nExp) : '${T("1 demande expire bientôt.")}') + '</span></div>';
    if (nDis) p += '<div class="cx-averti" data-onglet="disputed" title="${T("Cliquer pour afficher")}"><span>'
      + esc(nDis > 1 ? '${T("{0} demandes à trancher.")}'.split('{0}').join(nDis) : '${T("1 demande à trancher.")}') + '</span></div>';
    if (!nExp && !nDis) p += '<div class="cx-bon"><span>${T("Aucune demande à surveiller.")}</span></div>';
    p += '</div>';
    h += '<div class="cx-deux">' + t + p + '</div>';

    corps.innerHTML = h;
    szVerrousPeindre();   // reposer les cadenas connus sur la liste fraiche

    /* ⚠ LES PASTILLES DEVIENNENT DES COLONNES. A l ecran, << expiree
       automatiquement >>, << frais pris en charge >> et le mode d etiquette
       sont des marques posees a cote du nom ; dans un fichier ce sont les
       criteres sur lesquels on va trier et compter. Une pastille perdue dans
       un export, c est une question a laquelle le fichier ne repondra pas. */
    var exr = document.getElementById('r-exporter');
    if (exr) exr.onclick = function(){
      var lignes = (D.lignes || []).map(function(r){
        return [r.commande || '', r.client || '', r.courriel || '', r.motif || '',
          r.statutLibelle || '', fmtDate(r.date), r.suivi || '',
          r.etiquette || '',
          r.expireAuto ? '${T("Oui")}' : '${T("Non")}',
          r.fraisBoutique ? '${T("Oui")}' : '${T("Non")}'];
      });
      if (!lignes.length) { dire('${T("Rien à exporter.")}', 'att'); return; }
      var csv = szCSV(['${T("Commande")}', '${T("Client")}', '${T("Courriel")}',
        '${T("Motif")}', '${T("Statut")}', '${T("Date")}', '${T("Suivi")}',
        '${T("Étiquette")}', '${T("Expirée automatiquement")}',
        '${T("Frais pris en charge")}'], lignes);
      szExporter('retours-' + new Date().toISOString().slice(0, 10) + '.csv', csv,
        '${T("La liste des retours")}');
    };

    var q = document.getElementById('r-q');
    if (q) {
      q.oninput = function(){
        Q = q.value;
        clearTimeout(window._rq);
        window._rq = setTimeout(function(){ charger(true); }, 300);
      };
    }
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); charger(); return; }
    if (t.closest('button') || t.closest('input')) return;
    var li = t.closest('tr[data-id]');
    if (!li) return;
    dire('${T("Ouverture…")}');
    appeler('retours:ouvrir', [li.getAttribute('data-id')]).then(function(r){
      dire(r.ok ? '${T("Demande ouverte dans sa fenêtre.")}' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  };

  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('retours:liste', [{ onglet: ONGLET, q: Q }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('${T("Retours indisponibles")}', expliquer(r)); return; }
      D = r;
      dire('');
      if (garderSaisie) redessinerSansPerdreLaSaisie();
      else dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('r-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('r-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : un retour enregistré, reçu ou
     finalisé fait relire la liste — jamais pendant une saisie. */
  window.szActualiser = function(){
    var q = document.getElementById('r-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ charger(); };

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

  charger();
  szVerrousSuivre(['return_reqs']);
})();
</script>
</body></html>`;
}

module.exports = { pageRetours };
