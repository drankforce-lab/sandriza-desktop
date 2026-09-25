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
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;font-size:.78rem;color:var(--tx2)}
input[type=search],button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:220px}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
/* ⚠ LES TUILES AUX MESURES DE L INVENTAIRE (refonte du 2026-09-25), par la
   feuille seulement : le balisage (.stats .s .n .l .sub) est garde. Le libelle
   passe AU-DESSUS du chiffre (order), comme partout ailleurs. Une couleur = un
   sens : ambre l argent SORTI, vert le solde encore a honorer, le reste neutre. */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:.6rem}
.stats .s{display:flex;flex-direction:column;background:var(--f-carte);border:1px solid var(--v07);
  border-radius:13px;padding:.75rem .95rem;min-width:0}
.stats .s .l{order:0;font-size:.76rem;font-weight:600;color:var(--tx2)}
.stats .s .n{order:1;font-size:1.6rem;font-weight:800;line-height:1.15;margin:.2rem 0 .1rem;color:var(--tx)}
.stats .s .n.sort{color:var(--tx-att)}
.stats .s .n.du{color:var(--tx-ok)}
.stats .s .sub{order:2;font-size:.72rem;color:var(--tx3)}
/* ⚠ Deux reprises du socle, chargees APRES cette feuille, repeignaient les
   tuiles : l accent du theme sur tout chiffre (.stats .s .n) et, en jour, un
   fond grise et un or. Une tuile neutre reste neutre — plus precis ici. */
.stats .s .n:not(.sort):not(.du){color:var(--tx)}
html.jour div.stats .s{background:var(--f-carte)}
html.jour div.stats .s .n:not(.sort):not(.du){color:var(--tx)}
/* Le compteur d une pastille de liste. */
.rf-jet .n{margin-left:.45rem;font-weight:800;opacity:.8}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:var(--v04)}
tbody td{padding:.3rem .4rem;border-top:1px solid var(--v055);vertical-align:top}
tbody .num{font-weight:700;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
tbody .arg{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
tbody .arg.sort{color:var(--tx-att);font-weight:700}
tbody .dt{font-size:.72rem;color:var(--tx2)}
/* ⚠ UNE LIGNE EXPIREE N EST PLUS ESTOMPEE (refonte du 2026-09-25) : l opacite
   de .55 rendait sa pastille et son numero illisibles (2,27 en jour, 2,75 la
   nuit — banc des contrastes). C est la pastille << Expire >> qui dit l etat. */
tr.eteint td{opacity:1}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.info{background:rgba(59,130,246,.18);color:var(--tx-bleu)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.usages{margin-top:.2rem;display:flex;flex-direction:column;gap:1px}
.usages span{font-size:.7rem;color:var(--tx2);white-space:nowrap}
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
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
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
    /* ══ LA REFONTE DE L INVENTAIRE, APPLIQUEE A REMBOURSEMENTS (2026-09-25) ═
       Barre sur une ligne (loupe, les deux listes en pastilles), tuiles aux
       mesures de l Inventaire, lignes riches. Crochets gardes : data-onglet,
       #r-q, tr[data-cmd], le verrou de la commande. */
    var h = '<div class="carte"><div class="rf-tb">'
      + '<label class="rf-rch">${ICO.loupe}<input aria-label="${T("Numéro, commande, client")}" type="search" id="r-q" placeholder="${T("Numéro, commande, client…")}" value="' + esc(Q) + '"></label>'
      + '<button class="rf-jet' + (ONGLET === 'remboursements' ? ' on' : '') + '" data-onglet="remboursements">'
      + '${T("Remboursements")}<span class="n">' + (c.remboursements || 0) + '</span></button>'
      + '<button class="rf-jet' + (ONGLET === 'credits' ? ' on' : '') + '" data-onglet="credits">'
      + '${T("Crédits boutique")}<span class="n">' + (c.credits || 0) + '</span></button>'
      + '</div></div>';

    /* ⚠ QUATRE CHIFFRES QUI NE DISENT PAS LA MEME CHOSE. << Rembourse >> est de
       l argent SORTI ; << Solde a honorer >> est de l argent qu on DOIT ENCORE.
       Les melanger dans un total unique donnerait un chiffre qui ne veut rien
       dire ni pour la caisse ni pour le comptable. */
    /* ⚠ szTuiles(...) ENVELOPPE, il ne remplace rien : le bandeau est ecrit tel
       quel, la piece commune y ajoute le bouton de repli et l etat retenu pour
       ce poste. Voir JS_TUILES dans socle.js. */
    h += szTuiles('<div class="stats">'
      + '<div class="s"><div class="n sort">' + esc(t.rembourse) + '</div>'
      /* Deux formes ENTIERES : un << s >> colle a part ne se traduit pas. */
      + '<div class="l">${T("Total remboursé")}</div><div class="sub">' + (t.nbRemb || 0)
      + ((t.nbRemb || 0) > 1 ? '${T(" remboursements")}' : '${T(" remboursement")}') + '</div></div>'
      + '<div class="s"><div class="n">' + esc(t.emis) + '</div>'
      + '<div class="l">${T("Crédits émis")}</div><div class="sub">' + (t.nbCredits || 0)
      + ((t.nbCredits || 0) > 1 ? '${T(" crédits")}' : '${T(" crédit")}') + '</div></div>'
      + '<div class="s"><div class="n">' + esc(t.utilise) + '</div>'
      + '<div class="l">${T("Crédits utilisés")}</div><div class="sub">${T("déjà dépensés")}</div></div>'
      + '<div class="s"><div class="n du">' + esc(t.solde) + '</div>'
      + '<div class="l">${T("Solde à honorer")}</div><div class="sub">${T("passif · ")}' + (t.nbActifs || 0)
      + ((t.nbActifs || 0) > 1 ? '${T(" actifs")}' : '${T(" actif")}') + '</div></div>'
      + '</div>');

    h += '<div class="carte">';
    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">' + (ONGLET === 'credits'
        ? '${T("Aucun crédit boutique.")}' : '${T("Aucun remboursement.")}') + '</div>';
    } else {
      h += (ONGLET === 'credits' ? tableCredits(rows) : tableRemb(rows));
      if ((D.pages || 1) > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="r-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>${T("Page ")}' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="r-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';

    h += '';

    corps.innerHTML = h;
    szVerrousPeindre();   // reposer les cadenas connus sur la liste fraiche
    brancher();
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
  function tableRemb(rows){
    return '<table><thead><tr><th>${T("Client et remboursement")}</th>'
      + '<th>${T("Mode")}</th><th>${T("Motif")}</th><th style="text-align:right">${T("Sous-total")}</th>'
      + '<th style="text-align:right">TPS</th><th style="text-align:right">TVQ</th>'
      + '<th style="text-align:right">Total</th></tr></thead><tbody>'
      + rows.map(function(r){
          return '<tr data-cmd="' + esc(r.commandeId) + '" title="${T("Ouvrir la commande")}">'
            // ⚠ LE VERROU EST CELUI DE LA COMMANDE, pas du remboursement : la
            // fenetre de remboursement verrouille la COMMANDE (deux personnes
            // qui remboursent la meme, c est un double remboursement). Un
            // cadenas sur une portee << refunds >> ne pourrait jamais
            // s allumer — il a d ailleurs ete retire du site pour cette raison.
            + '<td><div class="rf-prod"><span class="rf-av" aria-hidden="true">' + esc(initiales(r.client)) + '</span>'
            + '<div style="min-width:0"><div class="rf-nom">' + esc(r.client || '—')
            + szVerrouCase('orders', r.commandeId) + '</div>'
            + '<div class="rf-sous"><span class="rf-code">' + esc(r.numero) + '</span>'
            + (r.commande ? '<span>·</span><span>' + esc(r.commande) + '</span>' : '')
            + '<span>·</span><span>' + esc(r.date) + '</span></div></div></div></td>'
            + '<td>' + typePastille(r.type) + '</td>'
            + '<td class="dt" style="max-width:14rem;overflow:hidden;text-overflow:ellipsis;'
            + 'white-space:nowrap" title="' + esc(r.motif) + '">' + esc(r.motif || '—') + '</td>'
            + '<td class="arg">' + esc(r.sousTotal) + '</td>'
            + '<td class="arg">' + esc(r.tps) + '</td>'
            + '<td class="arg">' + esc(r.tvq) + '</td>'
            + '<td class="arg"><span class="rf-mont">' + esc(r.total) + '</span></td></tr>';
        }).join('') + '</tbody></table>';
  }
  function tableCredits(rows){
    var STATUT = { actif: ['vert', '${T("Actif")}'], epuise: ['', '${T("Épuisé")}'], expire: ['', '${T("Expiré")}'] };
    return '<table><thead><tr><th>${T("Client et crédit")}</th><th>${T("Émis le")}</th><th>${T("Expiration")}</th>'
      + '<th style="text-align:right">${T("Montant")}</th><th style="text-align:right">${T("Utilisé")}</th>'
      + '<th style="text-align:right">${T("Solde")}</th><th>${T("Statut")}</th></tr></thead><tbody>'
      + rows.map(function(c){
          var st = STATUT[c.statut] || STATUT.actif;
          return '<tr class="' + (c.statut === 'expire' ? 'eteint' : '') + '">'
            + '<td><div class="rf-prod"><span class="rf-av" aria-hidden="true">' + esc(initiales(c.client)) + '</span>'
            + '<div style="min-width:0"><div class="rf-nom">' + esc(c.client || '—') + '</div>'
            + '<div class="rf-sous"><span class="rf-code">' + esc(c.numero) + '</span>'
            + (c.refund ? '<span>·</span><span>' + esc(c.refund) + '</span>' : '') + '</div></div></div></td>'
            + '<td class="dt">' + esc(c.emisLe)
            + (c.commande ? '<div class="dt">' + esc(c.commande) + '</div>' : '') + '</td>'
            + '<td class="dt">' + esc(c.expiration) + '</td>'
            + '<td class="arg">' + esc(c.montant) + '</td>'
            + '<td class="arg">' + esc(c.utilise)
            /* ⚠ LE DETAIL DES UTILISATIONS EST VISIBLE, pas cache derriere un
               depliant : c est la seule piece qui explique pourquoi un solde a
               baisse, et c est exactement la question qu on se pose. */
            + (c.usages && c.usages.length
                ? '<div class="usages">' + c.usages.map(function(u){
                    return '<span>' + esc(u.date) + ' · ' + esc(u.commande)
                      + ' <b>−' + esc(u.montant) + '</b></span>'; }).join('') + '</div>'
                : '') + '</td>'
            + '<td class="arg"><span class="rf-mont">' + esc(c.solde) + '</span></td>'
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
    appeler('remboursements:liste', [{ onglet: ONGLET, q: Q, page: PAGE, taille: 25 }]).then(function(r){
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
