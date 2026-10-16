'use strict';

/*
 * FENÊTRE « REMBOURSEMENTS ET CRÉDITS » — NATIVE (2.7.0)
 * =============================================================================
 * Deux tables qui répondent à deux questions différentes : ce qui est SORTI
 * (les remboursements) et ce qu'on DOIT ENCORE (les crédits boutique — un crédit
 * non dépensé est un passif, pas une dépense passée).
 *
 * ⚠ ÉCRAN DE CONSULTATION, ET C'EST DÉLIBÉRÉ. Rembourser engage de l'argent et
 * se fait depuis la COMMANDE, dans la fenêtre Remboursement qui existe déjà et
 * qui porte toutes les gardes (montant restant, frais retenus, code
 * d'autorisation). Doubler ce geste ici aurait donné deux chemins pour sortir de
 * l'argent, donc deux règles à tenir d'accord. Le clic sur une ligne ouvre la
 * commande concernée.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit — jamais un numero, un nom de
   cliente ni un montant (voir src/langue/remboursements.js). */
const T = require('../langue').tr('remboursements');

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
/* LA GRAMMAIRE DE LA COMPTABILITE (2026-10-16) : tete (resume), bande de 4 chiffres, onglets segmentes,
   puis le tableau et son panneau d appui (CSS_COMPTA du socle).
   << Aucun scroll bar dans l application >> (2026-10-12) : le corps ne defile
   plus ; la carte de la liste prend la hauteur qui reste et c est la hauteur
   reelle de la liste qui decide du nombre de lignes demandees au site. */
#corps{overflow:hidden}
.cx-carte>.liste{flex:1 1 0;min-height:0;overflow:hidden}
input[type=search],button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
button{cursor:pointer}
.ed-seg button{border:none}
.ed-seg .n{margin-left:.4rem;font-size:.7rem;color:var(--tx3);font-variant-numeric:tabular-nums}
/* Contrastes Linux 7.37.0 : --tx2 sur le segment actif du jour tombait a 4.24. */
.ed-seg button.on .n{color:var(--tx)}
.cx-barre .rf-rch{width:18rem;flex:0 0 auto}
th.r,td.r{text-align:right;font-variant-numeric:tabular-nums}
.cx-qui b{font-weight:650}
.cx-etat>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cx-pied .pagi{padding-top:0}
input:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
table{width:100%;font-size:.84rem}
thead th{text-align:left}
tbody tr{cursor:pointer}
tbody td{vertical-align:middle}
tbody .arg{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
tbody .dt{font-size:.78rem;color:var(--tx2)}
/* ⚠ UNE LIGNE EXPIREE N EST PLUS ESTOMPEE (refonte du 2026-09-25) : l opacite
   de .55 rendait sa pastille et son numero illisibles (2,27 en jour, 2,75 la
   nuit — banc des contrastes). C est la pastille << Expire >> qui dit l etat. */
tr.eteint td{opacity:1}
.usages{margin-top:.2rem;display:flex;flex-direction:column;gap:1px;align-items:flex-end}
.usages span{font-size:.7rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:13rem}
.usages b{color:var(--tx-err)}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:var(--tx2)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.aide{font-size:.75rem;color:var(--tx2);line-height:1.45}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Remboursements et crédits ».
 * `onglet` = 'credits' pour ouvrir sur les crédits boutique.
 * ⚠ Il n'est pas décoratif : le garde-fou ne simule aucun clic, donc sans lui
 * la table des CRÉDITS — la moitié de cette fenêtre, et celle qui porte le
 * passif — ne serait jamais dessinée par un jeu d'essai.
 */
function pageRemboursements(onglet) {
  const depart = (String(onglet || '') === 'credits') ? 'credits' : 'remboursements';
  return `${TETE()}
<title>${T("Remboursements et crédits — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.refunds}</span><h1>${T("Remboursements et crédits")}</h1>
  <span class="cx-resume" id="sous"></span></div>
<div class="cx" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('remboursements')}
  var corps = document.getElementById('corps');

  var D = null;
  var ONGLET = '${depart}';
  var Q = '';
  var PAGE = 0;
  /* La taille de page est MESUREE (szAutoPagination, apres chaque dessin) :
     25 n est que le repli tant que la liste n a pas encore ete disposee. */
  var TAILLE = 25;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux remboursements.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cette commande n’existe plus.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 150)) + ')';
    return t;
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
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    var t = D.tuiles || {}, c = D.comptes || {};
    /* ══ LA GRAMMAIRE DE LA COMPTABILITE (2026-10-16) ═══════════════════════════
       Quatre chiffres, les deux listes en onglets segmentes, la recherche a
       droite, le tableau et son panneau d appui. Crochets gardes : data-onglet,
       #r-q, #r-prec, #r-suiv, tr[data-cmd], le verrou de la commande, .liste
       (mesuree par szAutoPagination). */

    /* ⚠ QUATRE CHIFFRES QUI NE DISENT PAS LA MEME CHOSE. << Rembourse >> est de
       l argent SORTI ; << Solde a honorer >> est de l argent qu on DOIT ENCORE.
       Les melanger dans un total unique donnerait un chiffre qui ne veut rien
       dire ni pour la caisse ni pour le comptable. Le solde est en AMBRE (a
       surveiller : c est une dette envers les clients), jamais en vert. */
    var kpi = function(lbl, val, ton, sub){
      return '<div class="cx-kpi' + (ton ? ' ' + ton : '') + '"><span>' + lbl + '</span><b>' + esc(val) + '</b>'
        + '<small>' + sub + '</small></div>';
    };
    var h = '<div class="cx-kpis">'
      /* Deux formes ENTIERES : un << s >> colle a part ne se traduit pas. */
      + kpi('${T("Total remboursé")}', t.rembourse, '', (t.nbRemb || 0)
          + ((t.nbRemb || 0) > 1 ? '${T(" remboursements")}' : '${T(" remboursement")}'))
      + kpi('${T("Solde à honorer")}', t.solde, 'att', '${T("passif · ")}' + (t.nbActifs || 0)
          + ((t.nbActifs || 0) > 1 ? '${T(" actifs")}' : '${T(" actif")}'))
      + kpi('${T("Crédits émis")}', t.emis, '', (t.nbCredits || 0)
          + ((t.nbCredits || 0) > 1 ? '${T(" crédits")}' : '${T(" crédit")}'))
      + kpi('${T("Crédits utilisés")}', t.utilise, '', '${T("déjà dépensés")}')
      + '</div>';

    h += '<div class="cx-barre"><div class="ed-seg">'
      + '<button type="button" class="' + (ONGLET === 'remboursements' ? 'on' : '') + '" data-onglet="remboursements">'
      + '${T("Remboursements")}<span class="n">' + (c.remboursements || 0) + '</span></button>'
      + '<button type="button" class="' + (ONGLET === 'credits' ? 'on' : '') + '" data-onglet="credits">'
      + '${T("Crédits boutique")}<span class="n">' + (c.credits || 0) + '</span></button>'
      + '</div><div class="droite">'
      + '<label class="rf-rch">${ICO.loupe}<input aria-label="${T("Numéro, commande, client")}" type="search" id="r-q" placeholder="${T("Numéro, commande, client…")}" value="' + esc(Q) + '"></label>'
      + '</div></div>';

    var rows = D.lignes || [];
    var carte = '<div class="cx-carte">';
    if (!rows.length) {
      carte += '<div class="vide">' + (ONGLET === 'credits'
        ? '${T("Aucun crédit boutique.")}' : '${T("Aucun remboursement.")}') + '</div>';
    } else {
      carte += '<div class="liste" data-pages="remboursements">' + (ONGLET === 'credits' ? tableCredits(rows) : tableRemb(rows)) + '</div>';
    }
    /* ⚠ Le pied de pages est TOUJOURS pose, meme sur une seule page : s il
       apparaissait apres la mesure, il mangerait la hauteur deja comptee. */
    var nb = ONGLET === 'credits' ? (c.credits || 0) : (c.remboursements || 0);
    carte += '<div class="cx-pied"><span>' + nb + (ONGLET === 'credits'
        ? (nb > 1 ? '${T(" crédits")}' : '${T(" crédit")}')
        : (nb > 1 ? '${T(" remboursements")}' : '${T(" remboursement")}')) + '</span>';
    if (rows.length) {
      carte += '<div class="droite pagi">'
        + '<button class="mini" id="r-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
        + '<span>${T("Page ")}' + (D.page + 1) + ' / ' + D.pages + '</span>'
        + '<button class="mini" id="r-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
        + '</div>';
    }
    carte += '</div></div>';

    /* ── LE PANNEAU D APPUI — depuis les lignes recues, rien de plus. La liste
       est paginee par le site : quand il y a plusieurs pages, le panneau le dit
       (<< sur cette page >>) plutot que faire passer une page pour le tout. ── */
    var p = '<div class="cx-carte">';
    var surPage = (D.pages || 1) > 1 ? '<div class="cx-sub">${T("Sur cette page.")}</div>' : '';
    if (ONGLET === 'credits') {
      var ouverts = rows.filter(function(x){ return x.statut === 'actif'; });
      p += '<h2>${T("Crédits ouverts")}</h2>'
        + (ouverts.length
            ? ouverts.slice(0, 6).map(function(x){
                return '<div class="cx-etat"><span>' + esc(x.client || '—') + ' · ' + esc(x.numero) + '</span>'
                  + '<span>' + esc(x.solde) + '</span></div>';
              }).join('')
            : '<div class="cx-sub">${T("Aucun crédit ouvert.")}</div>')
        + surPage
        + '<div class="cx-sep"></div>'
        + '<div class="cx-sub">${T("Un crédit non dépensé est un passif : de l’argent qu’on doit encore.")}</div>';
    } else {
      var modes = [['original', '${T("Moyen original")}', ''], ['credit', '${T("Crédit")}', 'info'], ['fees_refund', '${T("Frais")}', '']];
      var somme = {}, tout = 0;
      rows.forEach(function(x){
        var k = (x.type === 'credit' || x.type === 'fees_refund') ? x.type : 'original';
        var v = Number(x.totalN) || 0;
        somme[k] = (somme[k] || 0) + v; tout += v;
      });
      p += '<h2>${T("Par mode")}</h2>'
        + modes.map(function(m){
            var v = somme[m[0]] || 0;
            var w = tout > 0 ? Math.round(Math.max(0, v) / tout * 100) : 0;
            return '<div class="cx-ligne"><span>' + m[1] + '</span><div class="cx-piste"><i'
              + (m[2] ? ' class="' + m[2] + '"' : '') + ' style="width:' + w + '%"></i></div>'
              + '<span>' + esc(szArgent(v)) + '</span></div>';
          }).join('')
        + surPage
        + '<div class="cx-sep"></div>'
        + '<div class="cx-sub">${T("Écran de consultation : on rembourse depuis la commande. Un clic sur une ligne l’ouvre.")}</div>';
    }
    p += '</div>';
    h += '<div class="cx-deux">' + carte + p + '</div>';

    corps.innerHTML = h;
    szVerrousPeindre();   // reposer les cadenas connus sur la liste fraiche
    brancher();
    // La mesure : combien de lignes tiennent VRAIMENT dans la liste bornee.
    szAutoPagination('.liste', function(n){ if (n === TAILLE) return; TAILLE = n; PAGE = 0; charger(); });
  }

  function typePastille(t){
    if (t === 'credit') return '<span class="rf-pill bleu">${T("Crédit")}</span>';
    if (t === 'fees_refund') return '<span class="rf-pill ambre">${T("Frais")}</span>';
    return '<span class="rf-pill">${T("Moyen original")}</span>';
  }
  /* Les initiales du client (decoupe sur l espace). */
  function initiales(nom){
    var m = String(nom || '').trim().split(' ').filter(Boolean);
    if (!m.length || m[0] === '—') return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
  }
  /* Le detail des taxes n a plus ses trois colonnes : il passe SOUS le total
     (sous-total + TPS + TVQ), lisible d un coup d oeil, rien n est retire. */
  function tableRemb(rows){
    return '<table><thead><tr><th>${T("Client et remboursement")}</th>'
      + '<th>${T("Mode")}</th><th>${T("Motif")}</th>'
      + '<th class="r">Total</th></tr></thead><tbody>'
      + rows.map(function(r){
          return '<tr data-cmd="' + esc(r.commandeId) + '" title="${T("Ouvrir la commande")}">'
            // ⚠ LE VERROU EST CELUI DE LA COMMANDE, pas du remboursement : la
            // fenetre de remboursement verrouille la COMMANDE (deux personnes
            // qui remboursent la meme, c est un double remboursement). Un
            // cadenas sur une portee << refunds >> ne pourrait jamais
            // s allumer — il a d ailleurs ete retire du site pour cette raison.
            + '<td><div class="cx-qui"><span class="cx-av" aria-hidden="true">' + esc(initiales(r.client)) + '</span>'
            + '<div style="min-width:0"><b>' + esc(r.client || '—') + '</b>'
            + szVerrouCase('orders', r.commandeId)
            + '<span class="cx-l2">' + esc(r.numero)
            + (r.commande ? ' · ' + esc(r.commande) : '')
            + ' · ' + esc(r.date) + '</span></div></div></td>'
            + '<td>' + typePastille(r.type) + '</td>'
            + '<td class="dt" style="max-width:13rem;overflow:hidden;text-overflow:ellipsis;'
            + 'white-space:nowrap" title="' + esc(r.motif) + '">' + esc(r.motif || '—') + '</td>'
            + '<td class="arg"><b>' + esc(r.total) + '</b>'
            + '<span class="cx-l2">' + esc(r.sousTotal) + ' + TPS ' + esc(r.tps) + ' + TVQ ' + esc(r.tvq) + '</span></td></tr>';
        }).join('') + '</tbody></table>';
  }
  function tableCredits(rows){
    var STATUT = { actif: ['vert', '${T("Actif")}'], epuise: ['', '${T("Épuisé")}'], expire: ['', '${T("Expiré")}'] };
    return '<table><thead><tr><th>${T("Client et crédit")}</th><th>${T("Émis le")}</th>'
      + '<th class="r">${T("Montant")}</th><th class="r">${T("Utilisé")}</th>'
      + '<th class="r">${T("Solde")}</th><th>${T("Statut")}</th></tr></thead><tbody>'
      + rows.map(function(c){
          var st = STATUT[c.statut] || STATUT.actif;
          return '<tr class="' + (c.statut === 'expire' ? 'eteint' : '') + '">'
            + '<td><div class="cx-qui"><span class="cx-av" aria-hidden="true">' + esc(initiales(c.client)) + '</span>'
            + '<div style="min-width:0"><b>' + esc(c.client || '—') + '</b>'
            + '<span class="cx-l2">' + esc(c.numero)
            + (c.refund ? ' · ' + esc(c.refund) : '')
            + (c.commande ? ' · ' + esc(c.commande) : '') + '</span></div></div></td>'
            /* L expiration passe SOUS la date d emission (une colonne de moins). */
            + '<td class="dt">' + esc(c.emisLe)
            + '<span class="cx-l2">' + esc('${T("Expiration : {0}")}'.split('{0}').join(c.expiration || '—')) + '</span></td>'
            + '<td class="arg">' + esc(c.montant) + '</td>'
            + '<td class="arg">' + esc(c.utilise)
            /* ⚠ LE DETAIL DES UTILISATIONS EST VISIBLE, pas cache derriere un
               depliant : c est la seule piece qui explique pourquoi un solde a
               baisse, et c est exactement la question qu on se pose. */
            /* ⚠ UNE SEULE LIGNE D UTILISATION (2026-10-12) : la liste est paginee
               a la mesure d une ligne, et une ligne qui s allonge de trois
               utilisations ferait deborder la page. La premiere reste visible,
               les autres sont comptees (<< +2 >>) et toutes se lisent au survol. */
            + (c.usages && c.usages.length
                ? '<div class="usages" title="' + esc(c.usages.map(function(u){
                    return u.date + ' · ' + u.commande + ' −' + u.montant; }).join(' | ')) + '">'
                  + '<span>' + esc(c.usages[0].date) + ' · ' + esc(c.usages[0].commande)
                  + ' <b>−' + esc(c.usages[0].montant) + '</b>'
                  + (c.usages.length > 1 ? ' +' + (c.usages.length - 1) : '') + '</span></div>'
                : '') + '</td>'
            + '<td class="arg"><b>' + esc(c.solde) + '</b></td>'
            + '<td><span class="rf-pill ' + st[0] + '">' + st[1] + '</span></td></tr>';
        }).join('') + '</tbody></table>';
  }

  function brancher(){
    var q = document.getElementById('r-q');
    if (q) q.oninput = function(){
      Q = q.value; PAGE = 0;
      clearTimeout(window._rq);
      window._rq = setTimeout(function(){ charger(true); }, 300);
    };
    var bp = document.getElementById('r-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, (D.page || 0) - 1); charger(); };
    var bs = document.getElementById('r-suiv');
    if (bs) bs.onclick = function(){ PAGE = (D.page || 0) + 1; charger(); };
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); PAGE = 0; charger(); return; }
    if (t.closest('button') || t.closest('input')) return;
    var tr = t.closest('tr[data-cmd]');
    if (tr) {
      var id = tr.getAttribute('data-cmd');
      if (!id) { dire('${T("Ce remboursement n’est rattaché à aucune commande.")}', 'att'); return; }
      dire('${T("Ouverture de la commande…")}');
      appeler('remboursements:ouvrir', [id]).then(function(r){
        dire(r.ok ? '${T("Commande ouverte.")}' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    }
  };

  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('remboursements:liste', [{ onglet: ONGLET, q: Q, page: PAGE, taille: TAILLE }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('${T("Remboursements indisponibles")}', expliquer(r)); return; }
      D = r;
      ONGLET = D.onglet;
      var s = document.getElementById('sous');
      if (s) s.textContent = (D.tuiles || {}).rembourse + '${T(" remboursés · ")}'
        + (D.tuiles || {}).solde + '${T(" à honorer")}';
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
  szVerrousSuivre(['orders']);
})();
</script>
</body></html>`;
}

module.exports = { pageRemboursements };
