'use strict';

/*
 * FENÊTRE « CORBEILLE DES COMMANDES » — NATIVE (#113, 5.71.0)
 * =============================================================================
 * Sa demande du 2026-09-14 : « il faudrait que tu me créer un historique des
 * commande effacé aussi comme sa si il y a une commande effacer par erreur ou
 * pourra la restauré ».
 *
 * ⚠⚠ POURQUOI CETTE FENÊTRE DOIT EXISTER, ET PAS SEULEMENT LE DOSSIER.
 * Le dossier de corbeille est écrit par `deleteOrder` (site, data.js) avant que
 * quoi que ce soit soit détruit. Sans écran, il serait parfaitement conservé et
 * parfaitement inatteignable : un filet que personne ne peut décrocher. C'est
 * la même faute que « Afficher la barre latérale », dont le seul contrôle avait
 * disparu avec elle — sauf qu'ici ce qui reste hors de portée, ce sont des
 * commandes.
 *
 * ⚠ ELLE MONTRE CE QU'ELLE NE PEUT PAS RENDRE, AVANT LE CLIC. Si un
 * remboursement Square est parti, l'argent est chez le client : remettre la
 * commande en place ne le rappelle pas. La ligne le dit dans la LISTE, le
 * dossier le redit, et le compte rendu de restauration le redit encore. Trois
 * fois, parce qu'une seule se rate.
 *
 * ⚠ DEUX DROITS. Lire demande `orders:view` — interdire la lecture empêcherait
 * de CONSTATER qu'une commande a été supprimée. Remettre et purger demandent
 * `orders:delete` : remettre est le geste inverse de supprimer, et purger est
 * plus définitif que supprimer.
 *
 * ⚠ LA PURGE EST LE SEUL GESTE QUI EFFACE POUR DE BON — y compris les photos
 * des demandes de retour, gardées exprès jusque-là. Elle se confirme en deux
 * temps, comme la suppression d'un compte.
 *
 * ⚠ AUCUNE PURGE AUTOMATIQUE, NULLE PART. Un filet qui se vide seul au bout de
 * N jours aura disparu le jour où on lève enfin les yeux.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit — jamais un numero de commande ni
   un nom de client (voir src/langue/corbeille.js). */
const T = require('../langue').tr('corbeille');

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
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:220px}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.prim{border-color:rgba(74,222,128,.45);color:var(--tx-ok2)}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
/* ══ LA REFONTE DE L INVENTAIRE, APPLIQUEE A LA CORBEILLE (2026-09-25) ══════
   Tuiles aux mesures communes (le chiffre en grand, plus de capitales), barre
   a loupe sur une ligne, ligne riche aux initiales du client ; les pieces
   gardees en pastilles a point. Crochets gardes : #cb-q, data-ouvrir,
   data-remettre, data-purger, tr[data-dossier]. */
.tuiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);min-width:0}
.tuile .val.att{color:var(--tx-att)}
.tuile .sub{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pieces{display:flex;flex-wrap:wrap;gap:.3rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:var(--tx2);font-weight:700}
table{width:100%;border-collapse:collapse;font-size:.86rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.34rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody tr:hover td{background:var(--v04)}
.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.fin{width:1%;white-space:nowrap;text-align:right}
.fin .b + .b{margin-left:.45rem}
.dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;padding:.04rem .42rem;border-radius:99px;font-size:.68rem;
  border:1px solid var(--v16);color:var(--tx2);white-space:nowrap}
.pill.att{border-color:rgba(251,191,36,.45);color:var(--tx-att)}
.pill.bon{border-color:rgba(74,222,128,.4);color:var(--tx-ok2)}
.pieces{display:flex;gap:.3rem;flex-wrap:wrap}
.fiche{background:var(--f-carte2);border:1px solid var(--v10);border-radius:11px;
  padding:.7rem .85rem;display:flex;flex-direction:column;gap:.5rem}
.fiche .lgn{display:flex;gap:.6rem;font-size:.84rem}
.fiche .lgn .k{flex:0 0 11rem;color:var(--tx2);font-size:.78rem}
.avis{border-radius:9px;padding:.5rem .7rem;font-size:.82rem;
  border:1px solid rgba(251,191,36,.45);background:rgba(251,191,36,.08);color:var(--tx-att)}
.avis.mal{border-color:rgba(239,68,68,.5);background:rgba(239,68,68,.08);color:var(--tx-err2)}
.vide{padding:1.6rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Corbeille des commandes ». */
function pageCorbeille() {
  return `${TETE()}
<title>${T("Corbeille des commandes — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.corbeille}</span><h1>${T("Corbeille des commandes")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('corbeille')}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;          // la liste
  var FICHE = null;      // le dossier ouvert, ou null
  var Q = '';
  var ARME = '';         // id du dossier dont la PURGE est armee

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  /* ⚠ LE MONTANT ET LA DATE PASSENT PAR LES PIECES COMMUNES (szArgent, LIEU) :
     en anglais il faut << $12.50 >> et non << 12,50 $ >>. */
  function argent(n){ return szArgent(n); }
  function quand(iso){
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('${LIEU()}', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (e) { return String(iso); }
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas ce geste sur la corbeille.")}',
    introuvable:        '${T("Ce dossier n’est plus dans la corbeille.")}',
    deja_presente:      '${T("Cette commande existe déjà : elle a été recréée depuis la suppression.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
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
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  function initiales(nom){
    var m = String(nom || '').trim().split(' ').filter(Boolean);
    if (!m.length || m[0] === '—') return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
  }
  function filtres(){
    var q = Q.trim().toLowerCase();
    var l = (D && D.dossiers) || [];
    if (!q) return l;
    return l.filter(function(d){
      return (String(d.orderNumber || '') + ' ' + String(d.client || '') + ' '
            + String(d.parNom || '') + ' ' + String(d.motif || '')).toLowerCase().indexOf(q) !== -1;
    });
  }

  /* Les pastilles de pieces : on ne montre que ce qui EXISTE. Une rangee de
     zeros ne dit rien et se cesse d etre lue. */
  function pieces(p){
    p = p || {};
    var out = [];
    /* Deux formes ENTIERES a chaque fois : un << s >> colle a part ne se
       traduit pas. */
    if (p.factures)       out.push(p.factures + (p.factures > 1 ? '${T(" factures")}' : '${T(" facture")}'));
    if (p.remboursements) out.push(p.remboursements + (p.remboursements > 1 ? '${T(" remboursements")}' : '${T(" remboursement")}'));
    if (p.credits)        out.push(p.credits + (p.credits > 1 ? '${T(" crédits")}' : '${T(" crédit")}'));
    if (p.retours)        out.push(p.retours + (p.retours > 1 ? '${T(" retours")}' : '${T(" retour")}'));
    if (p.billets)        out.push(p.billets + (p.billets > 1 ? '${T(" billets")}' : '${T(" billet")}'));
    if (p.lignesStock)    out.push(p.lignesStock + (p.lignesStock > 1 ? '${T(" variantes")}' : '${T(" variante")}'));
    if (!out.length) return '<span class="dt">${T("la commande seule")}</span>';
    return '<span class="pieces">' + out.map(function(x){
      return '<span class="rf-pill">' + esc(x) + '</span>'; }).join('') + '</span>';
  }

  function vueListe(){
    var l = (D && D.dossiers) || [];
    var rows = filtres();
    if (sous) sous.textContent = D && D.peutRestaurer ? '' : '${T("consultation seulement")}';

    var sq = l.filter(function(d){ return d.squareRembourse; }).length;
    /* ⚠ szTuiles(...) ENVELOPPE, il ne remplace rien : le bandeau est ecrit tel
       quel, la piece commune y ajoute le bouton de repli et l etat retenu pour
       ce poste. Voir JS_TUILES dans socle.js. */
    var h = szTuiles('<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">${T("Dossiers conservés")}</div><div class="val">' + l.length + '</div>'
      + '<div class="sub">${T("aucune purge automatique")}</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Valeur des commandes")}</div><div class="val">'
      + argent(l.reduce(function(s, d){ return s + (d.total || 0); }, 0)) + '</div>'
      + '<div class="sub">${T("telles qu’elles étaient")}</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Remboursement déjà parti")}</div><div class="val'
      + (sq ? ' att' : '') + '">' + sq + '</div>'
      + '<div class="sub">${T("ne revient pas à la restauration")}</div></div>'
      + '</div>');

    h += '<div class="carte"><div class="rf-tb">'
      + '<label class="rf-rch" style="max-width:none">${ICO.loupe}<input aria-label="${T("Numéro, client, qui a supprimé")}" type="search" id="cb-q" placeholder="${T("Numéro, client, qui a supprimé…")}" value="' + esc(Q) + '"></label>'
      + '<span class="rf-droite"><span class="dt">' + rows.length
      + (rows.length > 1 ? '${T(" dossiers")}' : '${T(" dossier")}') + '</span></span></div></div>';

    h += '<div class="carte"><h2>${T("Commandes supprimées")}</h2>';
    if (!rows.length) {
      h += '<div class="vide">' + (Q ? '${T("Rien ne correspond.")}'
        : '${T("Aucune commande supprimée. C’est la bonne nouvelle — la corbeille existe pour le jour où ça arrive.")}') + '</div>';
    } else {
      h += '<table><thead><tr><th>${T("Client et commande")}</th>'
        + '<th class="num">${T("Total")}</th><th>${T("Supprimée")}</th>'
        + '<th>${T("Ce qui est gardé")}</th><th></th></tr></thead><tbody>'
        + rows.map(function(d){
            return '<tr data-dossier="' + esc(d.id) + '">'
              + '<td><div class="rf-prod"><span class="rf-av" aria-hidden="true">' + esc(initiales(d.client)) + '</span>'
              + '<div style="min-width:0"><div class="rf-nom">' + esc(d.client || '—')
              + (d.dejaPresente ? ' <span class="rf-pill vert">${T("recréée")}</span>' : '')
              + (d.squareRembourse ? ' <span class="rf-pill ambre">${T("remboursée")}</span>' : '') + '</div>'
              + '<div class="rf-sous"><span class="rf-code">' + esc(d.orderNumber || d.orderId) + '</span></div></div></div></td>'
              + '<td class="num"><span class="rf-mont">' + argent(d.total) + '</span></td>'
              + '<td><div>' + esc(quand(d.supprimeeLe)) + '</div>'
              + '<div class="rf-sous">${T("par ")}' + esc(d.parNom || '—') + '</div></td>'
              + '<td>' + pieces(d.pieces) + '</td>'
              + '<td class="fin">'
              + '<button class="mini b" data-ouvrir="' + esc(d.id) + '">${T("Ouvrir")}</button>'
              + (D.peutRestaurer && !d.dejaPresente
                  ? '<button class="mini prim b" data-remettre="' + esc(d.id) + '">${T("Remettre")}</button>' : '')
              + (D.peutRestaurer
                  ? '<button class="mini danger b" data-purger="' + esc(d.id) + '">'
                    + (ARME === d.id ? '${T("Confirmer ?")}' : '${T("Purger")}') + '</button>' : '')
              + '</td></tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';

    if (!D.peutRestaurer) {
      h += '<div class="avis">${T("Votre rôle vous laisse consulter la corbeille, mais pas remettre une commande en place ni purger un dossier.")}</div>';
    }
    corps.innerHTML = h;
    lierListe();
  }

  function vueFiche(){
    var d = FICHE.dossier || {};
    var c = d.commande || {};
    var h = '<div class="barreoutils">'
      + '<button class="mini" id="cb-retour">${T("← Retour à la liste")}</button>'
      + '<div class="droite">'
      + (FICHE.peutRestaurer && !FICHE.dejaPresente
          ? '<button class="mini prim" data-remettre="' + esc(d.id) + '">${T("Remettre cette commande en place")}</button>' : '')
      + '</div></div>';

    if (FICHE.dejaPresente) {
      h += '<div class="avis">${T("Une commande portant ce numéro existe déjà : elle a été recréée depuis. Ce dossier ne peut plus être remis en place — il ne reste qu’à le consulter ou à le purger.")}</div>';
    }
    /* ⚠ L AVERTISSEMENT SUR L ARGENT EST AU-DESSUS DU BOUTON, pas en dessous.
       Une mise en garde qu on lit apres avoir cliqué n est pas une mise en garde. */
    if (d.square && d.square.etat === 'initie') {
      h += '<div class="avis mal">${T("Un remboursement Square de ")}' + argent(d.square.montant)
        + '${T(" est parti au moment de la suppression. L’argent est chez le client : remettre la commande en place ne le rappellera pas.")}</div>';
    }

    h += '<div class="fiche">'
      + '<div class="lgn"><span class="k">${T("Commande")}</span><strong>' + esc(d.orderNumber || d.orderId) + '</strong></div>'
      + '<div class="lgn"><span class="k">${T("Client")}</span><span>'
      + esc([(c.shipping || {}).firstName, (c.shipping || {}).lastName].filter(Boolean).join(' ') || '—')
      + ' <span class="dt">' + esc((c.shipping || {}).email || '') + '</span></span></div>'
      + '<div class="lgn"><span class="k">${T("Total")}</span><span>' + argent(c.total) + '</span></div>'
      + '<div class="lgn"><span class="k">${T("Passée le")}</span><span class="dt">' + esc(quand(c.createdAt)) + '</span></div>'
      + '<div class="lgn"><span class="k">${T("Supprimée le")}</span><span class="dt">' + esc(quand(d.supprimeeLe)) + '</span></div>'
      + '<div class="lgn"><span class="k">${T("Supprimée par")}</span><span class="dt">'
      + esc(d.parNom || d.parCourriel || '—') + '</span></div>'
      + (d.motif ? '<div class="lgn"><span class="k">${T("Motif")}</span><span>' + esc(d.motif) + '</span></div>' : '')
      + '</div>';

    /* CE QUI EST AU DOSSIER — la liste exacte de ce qui reviendra. */
    h += '<div class="carte"><h2>${T("Ce que le dossier conserve")}</h2><table><tbody>'
      + lgnPiece('${T("Articles de la commande")}', (c.items || []).length)
      + lgnPiece('${T("Factures")}', (d.factures || []).length)
      + lgnPiece('${T("Remboursements")}', (d.remboursements || []).length)
      + lgnPiece('${T("Crédits nés d’un remboursement")}', (d.creditsNes || []).length)
      + lgnPiece('${T("Crédits dépensés sur cette commande")}', (d.creditsUtilises || []).length)
      + lgnPiece('${T("Billets de messagerie")}', (d.billets || []).length)
      + lgnPiece('${T("Demandes de retour")}', (d.retoursActifs || []).length)
      + lgnPiece('${T("Retours archivés")}', (d.retoursArchives || []).length)
      + lgnPiece('${T("Variantes dont le stock a été rendu")}', (d.stock || []).length)
      + '</tbody></table></div>';

    if ((d.stock || []).length) {
      h += '<div class="carte"><h2>${T("Stock rendu à la suppression")}</h2>'
        + '<div class="dt" style="margin-bottom:.4rem">${T("Remettre la commande en place retirera de nouveau ces unités, à partir du stock d’aujourd’hui — une réception faite entre-temps est conservée.")}</div>'
        + '<table><thead><tr><th>${T("Variante")}</th><th class="num">${T("Unités")}</th></tr></thead><tbody>'
        + d.stock.map(function(m){
            return '<tr><td>' + esc(m.cle) + ' <span class="dt">' + esc(m.productId) + '</span></td>'
              + '<td class="num">' + (m.quantite || 0) + '</td></tr>'; }).join('')
        + '</tbody></table></div>';
    }
    corps.innerHTML = h;
    lierFiche();
  }

  function lgnPiece(nom, n){
    if (!n) return '';
    return '<tr><td>' + esc(nom) + '</td><td class="num">' + n + '</td></tr>';
  }

  function dessiner(){
    if (FICHE) { vueFiche(); return; }
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    vueListe();
  }

  function lierListe(){
    var q = document.getElementById('cb-q');
    if (q) q.oninput = function(){ Q = q.value; redessinerSansPerdreLaSaisie(); };
  }
  function lierFiche(){
    var b = document.getElementById('cb-retour');
    if (b) b.onclick = function(){ FICHE = null; dessiner(); };
  }

  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('cb-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('cb-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  /* ⚠ LE COMPTE RENDU DE RESTAURATION — il dit ce qui est revenu ET ce qui ne
     revient pas. Une restauration silencieuse laisserait croire que l argent de
     Square est rentré avec le reste. */
  function direRestauration(rap){
    var r = rap || {};
    var m = r.remis || {};
    var bouts = [];
    if (m.factures)       bouts.push(m.factures + (m.factures > 1 ? '${T(" factures")}' : '${T(" facture")}'));
    if (m.remboursements) bouts.push(m.remboursements + (m.remboursements > 1 ? '${T(" remboursements")}' : '${T(" remboursement")}'));
    if (m.creditsRecrees) bouts.push(m.creditsRecrees + (m.creditsRecrees > 1 ? '${T(" crédits recréés")}' : '${T(" crédit recréé")}'));
    if (m.creditsRepris)  bouts.push(m.creditsRepris + (m.creditsRepris > 1 ? '${T(" crédits repris")}' : '${T(" crédit repris")}'));
    if (m.billets)        bouts.push(m.billets + (m.billets > 1 ? '${T(" billets")}' : '${T(" billet")}'));
    if (m.retoursActifs)  bouts.push(m.retoursActifs + (m.retoursActifs > 1 ? '${T(" retours")}' : '${T(" retour")}'));
    if (m.stock)          bouts.push(m.stock + (m.stock > 1 ? '${T(" unités reprises")}' : '${T(" unité reprise")}'));

    var t = '${T("Commande ")}' + (r.orderNumber || '') + '${T(" remise en place")}'
      + (bouts.length ? ' — ' + bouts.join(' · ') : '') + '.';
    var sq = (r.manque || []).filter(function(x){ return x.quoi === 'square'; })[0];
    if (sq) {
      /* ⚠ PAS DE PICTOGRAMME DANS CE TEXTE : le bandeau de message est posé en
         texte brut (szDire), et un signe hors de la règle .ic revient en couleur
         au milieu d un parc en noir et blanc — banc-pictogrammes le refuse, à
         raison. La couleur « att » du bandeau porte déjà l alerte. */
      dire(t + '${T(" Le remboursement Square de ")}' + argent(sq.montant)
        + '${T(" ne revient pas : l’argent est chez le client.")}', 'att');
    } else {
      dire(t, 'bon');
    }
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;

    var bo = t.closest('[data-ouvrir]');
    if (bo) {
      appeler('commandes:corbeille:fiche', [bo.getAttribute('data-ouvrir')]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        FICHE = r; ARME = ''; dessiner();
      });
      return;
    }

    var br = t.closest('[data-remettre]');
    if (br) {
      br.disabled = true;
      dire('${T("Remise en place en cours…")}', 'att');
      appeler('commandes:corbeille:restaurer', [br.getAttribute('data-remettre')]).then(function(r){
        if (!r.ok) { br.disabled = false; dire(expliquer(r), 'err'); return; }
        FICHE = null; ARME = '';
        direRestauration(r.rapport);
        charger();
      });
      return;
    }

    /* ⚠ LA PURGE EN DEUX TEMPS, comme la suppression d un compte : elle emporte
       aussi les PHOTOS des demandes de retour, gardées exprès jusqu ici. */
    var bp = t.closest('[data-purger]');
    if (bp) {
      var id = bp.getAttribute('data-purger');
      if (ARME !== id) {
        ARME = id; dessiner();
        dire('${T("Cliquez « Confirmer ? » — le dossier et les photos des retours partent pour de bon, et cette commande ne pourra plus être remise en place.")}', 'att');
        return;
      }
      ARME = '';
      bp.disabled = true;
      appeler('commandes:corbeille:purger', [id]).then(function(r){
        if (!r.ok) { bp.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('${T("Dossier purgé")}'
          + (r.photos ? (' — ' + r.photos + (r.photos > 1 ? '${T(" photos effacées")}' : '${T(" photo effacée")}')) : '')
          + '.', 'bon');
        charger();
      });
      return;
    }

    if (t.closest('button, input, select, label')) return;
    if (ARME) { ARME = ''; dessiner(); }
  });

  function charger(){
    appeler('commandes:corbeille:liste', []).then(function(r){
      if (!r || !r.ok) { vide('${T("Corbeille indisponible")}', expliquer(r)); return; }
      D = r;
      dessiner();
    });
  }

  window.szActualiser = function(){
    var q = document.getElementById('cb-q');
    if (q && document.activeElement === q && q.value) return;
    if (ARME) return;
    if (FICHE) return;
    charger();
  };
  window.szRevenir = function(){ FICHE = null; charger(); };

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
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (ARME) { ARME = ''; dessiner(); return; }
      if (FICHE) { FICHE = null; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageCorbeille };
