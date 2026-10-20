'use strict';

/*
 * FENÊTRE « PAIEMENTS SQUARE » — NATIVE (1.62.0, palier 4)
 * =============================================================================
 * Deux onglets : TRANSACTIONS (les encaissements et les remboursements de
 * l'année, avec les quatre tuiles) et RÉCONCILIATION (la comparaison entre le
 * système et Square, avec le verdict d'équilibre). Le choix de l'année vit ici.
 *
 * ⚠ LIRE ET CHARGER SONT DEUX OPÉRATIONS. `paiements:lire` sert ce qui est en
 * cache — instantané, jamais de réseau. `paiements:charger` va chez Square : ça
 * prend du temps et ça peut échouer. Depuis le 2026-10-15 (sa demande), la
 * lecture chez Square part D'ELLE-MÊME à l'ouverture et à la première visite de
 * chaque année ; le bouton reste pour actualiser (« Charger » / « Actualiser »).
 *
 * ⚠ MASQUER DES TRANSACTIONS EST RÉSERVÉ AU BAC À SABLE. Masquer un
 * encaissement réel fausserait le revenu, donc la conciliation, donc les
 * chiffres remis au comptable. Les boutons disparaissent en production — et le
 * cœur du site refuse de toute façon.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('paiements');

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
/* LA GRAMMAIRE DE LA COMPTABILITE (2026-10-16) : la tete porte le mode (resume) et les gestes (annee,
   reafficher, masquer, charger), puis quatre chiffres, les onglets segmentes, le travail et son panneau
   d appui (CSS_COMPTA du socle). Aucune glissiere : les listes vont en PAGES mesurees (data-pages). */
#corps{overflow:hidden}
.cx-col{display:flex;flex-direction:column;gap:.9rem;min-height:0;min-width:0}
.cx-col>.cx-carte{flex:1 1 0;min-height:7rem}
.cx-col>.cx-carte.court{flex:0 1 auto}
.ed-seg button{border:none}
.ed-seg .n{margin-left:.4rem;font-size:.7rem;color:var(--tx3);font-variant-numeric:tabular-nums}
/* Contrastes Linux 7.37.0 : --tx2 sur le segment actif du jour tombait a 4.24. */
.ed-seg button.on .n{color:var(--tx)}
details.cx-detail{min-width:0}
details.cx-detail>summary{cursor:pointer;list-style:none}
details.cx-detail>summary::-webkit-details-marker{display:none}
details.cx-detail>.cx-sub{margin:.5rem .2rem 0;line-height:1.5}
.cx-carte .vide{margin:auto 0}
select,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
select:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
table{width:100%;font-size:.84rem}
thead th{text-align:left}
tbody td{vertical-align:middle}
.num{font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}
.tot td{font-weight:800;background:var(--v03)}
.err{color:var(--tx-err)}.bon{color:var(--tx-ok)}.att{color:var(--tx-att)}
.pill{display:inline-flex;align-items:center;gap:.4rem;font-size:.72rem;font-weight:600;padding:.22rem .65rem;
  border-radius:99px;white-space:nowrap}
.pill::before{content:"";width:6px;height:6px;border-radius:99px;background:currentColor;flex:0 0 auto}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.vide{padding:1.4rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.vide .gros{font-size:1.4rem;margin-bottom:.4rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Paiements Square ». */
function pagePaiements() {
  return `${TETE()}
<title>${T("Paiements Square — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.payments}</span><h1>${T("Paiements Square")}</h1>
  <span class="cx-resume" id="sous"></span>
  <div class="cx-actions" id="p-actions"></div></div>
<div class="cx" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('paiements')}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var ONGLET = 'transactions';   // transactions | reconciliation
  var ANNEE = 0;                 // 0 = celle que le site propose
  var OCCUPE = false;            // une requete Square est en cours

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function fmt(n){
    return szArgent(n);   /* voir szArgent (socle) : le repli aussi place le symbole */
  }
  function signe(n){ return (Number(n) >= 0 ? '+' : '') + fmt(n); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux paiements.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    non_configure:      '${T("La connexion Square n’est pas configurée (Configuration → Paiement).")}',
    production:         '${T("Réservé au bac à sable — on ne masque pas des paiements réels.")}',
    rien_en_cache:      '${T("Aucune transaction en mémoire à masquer.")}',
    square:             '${T("Square n’a pas répondu.")}',
    quota:              '${T("La mémoire du poste est pleine : ces paiements sont affichés, mais ne seront pas gardés après la fermeture.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
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

  function kpi(lbl, val, ton, sub){
    return '<div class="cx-kpi' + (ton ? ' ' + ton : '') + '"><span>' + lbl + '</span><b>' + val + '</b>'
      + '<small>' + (sub || '&nbsp;') + '</small></div>';
  }
  function pctTexte(v){
    try { return v.toLocaleString('${LIEU()}', { maximumFractionDigits: 1 }); }
    catch (e) { return String(Math.round(v)); }
  }

  /* LES GESTES DANS LA TETE (2026-10-16) : l annee (#p-annee), reafficher (#p-reafficher), masquer
     (#p-masquer) et le geste principal (#p-charger) montent dans .cx-actions — memes ids, memes
     conditions qu avant. Les onglets restent dans le corps (data-onglet). */
  function gestes(){
    var h = '<select id="p-annee" title="${T("Année")}" aria-label="${T("Année")}">'
      + (D.annees || []).map(function(a){
          return '<option value="' + a + '"' + (a === D.annee ? ' selected' : '') + '>' + a + '</option>';
        }).join('')
      + '</select>';
    if (D.bacASable && D.masquees) {
      h += '<button id="p-reafficher" title="${T("Réafficher les transactions masquées (bac à sable seulement)")}">${T("↺ Réafficher (")}' + D.masquees + ')</button>';
    }
    if (D.bacASable && D.charge && D.tuiles && D.tuiles.nb > 0) {
      h += '<button id="p-masquer" title="${T("Masquer ces transactions d’essai — bac à sable seulement")}">${T("Masquer tout")}</button>';
    }
    h += '<button class="prim" id="p-charger"' + (OCCUPE ? ' disabled' : '') + '>'
      + (OCCUPE ? '${T("Lecture chez Square…")}' : (D.charge ? '${T("↻ Actualiser")}' : '${T("⬇ Charger les transactions")}'))
      + '</button>';
    return h;
  }

  function barre(){
    return '<div class="cx-barre"><div class="ed-seg">'
      + '<button type="button" class="' + (ONGLET === 'transactions' ? 'on' : '') + '" data-onglet="transactions">${T("Transactions")}'
      + (D.charge ? '<span class="n">' + (D.paiements || []).length + '</span>' : '') + '</button>'
      + '<button type="button" class="' + (ONGLET === 'reconciliation' ? 'on' : '') + '" data-onglet="reconciliation">${T("Réconciliation")}</button>'
      + '</div></div>';
  }

  function vueTransactions(){
    var h = '';
    var t = D.tuiles;
    if (t) {
      /* Les quatre chiffres : le nombre de transactions passe sous le brut ; les frais, le net et
         le rembourse gardent leur sous-ligne d avant. */
      h += '<div class="cx-kpis">'
        + kpi('${T("Revenu brut")}', fmt(t.brut), '',
            (t.nb > 1 ? '${T("{0} transactions complétées")}'.split('{0}').join(t.nb) : '${T("{0} transaction complétée")}'.split('{0}').join(t.nb || 0))
            + ' · ' + D.annee)
        + kpi('${T("Frais Square")}', '−' + fmt(t.frais), 'err',
            t.fraisRecuperes > 0 ? ('${T("dont ")}' + fmt(t.fraisRecuperes) + '${T(" récupérés · nets ")}' + fmt(t.fraisNets)) : '${T("déductibles d’impôt")}')
        + kpi('${T("Revenu net")}', fmt(t.net), 'ok', '${T("après remb. et frais nets")}')
        + kpi('${T("Remboursé")}', (t.rembourse > 0 ? '−' : '') + fmt(t.rembourse || 0), '',
            (t.nbRemboursements || 0) + ((t.nbRemboursements || 0) > 1 ? '${T(" remboursements")}' : '${T(" remboursement")}'))
        + '</div>';
    }
    h += barre();

    // Transactions et remboursements en PAGES mesurees, chaque carte prend sa part de hauteur (2026-10-12).
    var g = '<div class="cx-col">';
    /* (2026-10-16, vu a la capture) Moitie-moitie, la carte des transactions n en montrait qu UNE :
       chaque carte prend une part de hauteur selon ses lignes (bornee de 1 a 3). */
    var part = function(n){ return Math.min(3, Math.max(1, n + 1)); };
    g += '<div class="cx-carte sz-pagee" style="flex-grow:' + part(D.paiements.length) + '"><h2>${T("Transactions — ")}' + D.annee + '</h2>';
    if (!D.paiements.length) {
      g += '<div class="vide">${T("Aucune transaction pour ")}' + D.annee + '.</div>';
    } else {
      g += '<div class="cx-pages" data-pages="paiements-transactions"><table><thead><tr><th>${T("Date")}</th><th>${T("Réf. Square")}</th><th>${T("Mode de paiement")}</th>'
        + '<th class="num">${T("Brut")}</th><th class="num">${T("Frais")}</th><th class="num">${T("Net reçu")}</th></tr></thead><tbody>'
        + D.paiements.map(function(p){
            return '<tr><td style="white-space:nowrap">' + esc(p.date) + '</td>'
              + '<td><span class="cx-code">' + esc(p.ref) + '</span></td>'
              + '<td>' + esc(p.moyen) + '</td>'
              + '<td class="num">' + fmt(p.brut) + '</td>'
              + '<td class="num err">' + (p.frais > 0 ? '−' + fmt(p.frais) : '—') + '</td>'
              + '<td class="num bon"><b>' + fmt(p.net) + '</b></td></tr>';
          }).join('')
        + '<tr class="tot"><td colspan="3">${T("Total ")}' + D.annee + '</td>'
        + '<td class="num">' + fmt(t.brut) + '</td>'
        + '<td class="num err">−' + fmt(t.frais) + '</td>'
        /* Le total d une colonne est la somme de SES lignes (2026-09-29) : t.net +
           t.rembourse y ajoutait les frais recuperes sur remboursement, que les
           lignes n ont pas - 238,06 $ sous 149,49 + 87,47. Le recupere est dit
           dans la tuile << Frais Square >>. */
        + '<td class="num bon">' + fmt(Math.round((t.brut - t.frais) * 100) / 100) + '</td></tr>'
        + '</tbody></table></div>';
    }
    if (D.bacASable) g += '<div class="cx-pied"><span>${T("Transactions d’essai : masquables en bac à sable seulement.")}</span></div>';
    g += '</div>';

    /* Les remboursements restent A LEUR PLACE : sous les transactions, dans la meme colonne. */
    if (D.remboursements.length) {
      g += '<div class="cx-carte sz-pagee" style="flex-grow:' + part(D.remboursements.length) + '"><h2>${T("Remboursements — ")}' + D.annee
        + ' <span class="rf-pill">' + D.remboursements.length + '</span></h2>'
        + '<div class="cx-pages" data-pages="paiements-remboursements"><table><thead><tr><th>${T("Date")}</th><th>${T("Réf.")}</th><th>${T("Paiement d’origine")}</th><th>${T("Motif")}</th>'
        + '<th class="num">${T("Montant")}</th></tr></thead><tbody>'
        + D.remboursements.map(function(r){
            return '<tr><td style="white-space:nowrap">' + esc(r.date) + '</td>'
              + '<td><span class="cx-code">' + esc(r.ref) + '</span></td>'
              + '<td><span class="cx-code">' + esc(r.paiement) + '</span></td>'
              + '<td>' + esc(r.motif || '—')
              + (r.enAttente ? ' <span class="rf-pill ambre">${T("en attente")}</span>' : '') + '</td>'
              + '<td class="num err">−' + fmt(r.montant) + '</td></tr>';
          }).join('')
        + '<tr class="tot"><td colspan="4">${T("Total des remboursements")}</td>'
        + '<td class="num err">−' + fmt(t.rembourse) + '</td></tr>'
        + '</tbody></table></div></div>';
    }
    g += '</div>';

    /* ── LE PANNEAU D APPUI : ou va chaque dollar, et le chemin du brut au net — tout depuis les
       tuiles deja recues. ── */
    if (t) {
      var brut = Number(t.brut) || 0, frais = Number(t.frais) || 0;
      var pNet = brut > 0 ? Math.max(0, Math.min(100, (brut - frais) / brut * 100)) : 0;
      var pFr = brut > 0 ? Math.max(0, Math.min(100, frais / brut * 100)) : 0;
      var fraisN = (t.fraisNets != null) ? t.fraisNets : t.frais;
      var p = '<div class="cx-carte">'
        + '<h2>${T("Où va chaque dollar")}</h2>'
        + '<div class="cx-ligne"><span>${T("Net reçu")}</span><div class="cx-piste"><i class="ok" style="width:' + Math.round(pNet) + '%"></i></div>'
        + '<span>' + '${T("{0} %")}'.split('{0}').join(pctTexte(pNet)) + '</span></div>'
        + '<div class="cx-ligne"><span>${T("Frais Square")}</span><div class="cx-piste"><i class="err" style="width:' + Math.round(pFr) + '%"></i></div>'
        + '<span>' + '${T("{0} %")}'.split('{0}').join(pctTexte(pFr)) + '</span></div>'
        + '<div class="cx-sep"></div>'
        + '<h2>${T("Du brut au net")}</h2>'
        + '<div class="cx-etat"><span>${T("Revenu brut")}</span><span>' + fmt(t.brut) + '</span></div>'
        + '<div class="cx-etat ret"><span>${T("Remboursements")}</span><span class="cx-neg">' + (t.rembourse > 0 ? '−' + fmt(t.rembourse) : '—') + '</span></div>'
        + '<div class="cx-etat ret"><span>${T("Frais nets")}</span><span class="cx-neg">' + (fraisN > 0 ? '−' + fmt(fraisN) : '—') + '</span></div>'
        + '<div class="cx-etat fort"><span>${T("Revenu net")}</span><span class="cx-pos">' + fmt(t.net) + '</span></div>'
        + '</div>';
      h += '<div class="cx-deux">' + g + p + '</div>';
    } else {
      h += g.split('<div class="cx-col">').join('<div class="cx-col cx-plein">');
    }
    return h;
  }

  function vueReconciliation(){
    var R = D.reconciliation;
    if (!R) return barre() + '<div class="vide">${T("Chargez d’abord les transactions, dans l’onglet Transactions.")}</div>';
    var ton = R.equilibre ? 'ok' : 'att';
    var h = '<div class="cx-kpis">'
      + kpi('${T("Commandes ")}' + esc(R.marque), String(R.nbCommandes), '', '${T("non annulées · ")}' + D.annee)
      + kpi('${T("Transactions Square")}', String(R.nbSquare)
          + (R.nbRemboursementsSquare ? ' / ' + R.nbRemboursementsSquare + '${T(" remb.")}' : ''), '', '${T("complétées · ")}' + D.annee)
      + kpi('${T("Écart")}', fmt(Math.abs(R.ecart)), ton, R.equilibre ? '${T("Équilibré")}' : '${T("Vérification requise")}')
      + kpi('${T("Net Square")}', fmt(R.square.net), '', '${T("Square (données réelles)")}')
      + '</div>';
    h += barre();

    h += '<div class="cx-carte"><h2>${T("Comparaison système et Square — ")}' + D.annee + '</h2>'
      + '<table><thead><tr><th>${T("Source")}</th><th class="num">${T("Brut")}</th><th class="num">${T("Remboursements")}</th>'
      + '<th class="num">${T("Frais Square")}</th><th class="num">${T("Net")}</th><th class="num">${T("Nb")}</th></tr></thead><tbody>'
      + '<tr><td style="font-weight:600">${T("Système ")}' + esc(R.marque) + '</td>'
      + '<td class="num">' + fmt(R.site.brut) + '</td>'
      + '<td class="num err">' + (R.site.rembourse > 0 ? '−' + fmt(R.site.rembourse) : '—') + '</td>'
      + '<td class="num err">' + ((R.site.fraisRetenus > 0 || R.site.fraisRembourses > 0)
          ? ((R.site.fraisRetenus > 0 ? '−' + fmt(R.site.fraisRetenus) : '')
            + (R.site.fraisRembourses > 0 ? '<div style="font-size:.85em">−' + fmt(R.site.fraisRembourses) + '${T(" remb.")}</div>' : ''))
          : '—') + '</td>'
      + '<td class="num" style="font-weight:800">' + fmt(R.site.net) + '</td>'
      + '<td class="num">' + R.nbCommandes + '</td></tr>'
      + '<tr><td style="font-weight:600">${T("Square (données réelles)")}</td>'
      + '<td class="num">' + fmt(R.square.brut) + '</td>'
      + '<td class="num err">' + (R.square.rembourse > 0 ? '−' + fmt(R.square.rembourse) : '—') + '</td>'
      + '<td class="num err">' + (R.square.frais > 0 ? '−' + fmt(R.square.frais) : '—') + '</td>'
      + '<td class="num bon" style="font-weight:800">' + fmt(R.square.net) + '</td>'
      + '<td class="num">' + R.nbSquare + '</td></tr>'
      + '<tr class="tot"><td>${T("Écart")}</td>'
      + '<td class="num ' + (R.equilibre ? 'bon' : 'att') + '">' + signe(R.square.brut - R.site.brut) + '</td>'
      + '<td class="num">' + signe(R.square.rembourse - R.site.rembourse) + '</td>'
      + '<td class="num">' + signe(-R.square.frais + (R.site.fraisRetenus + R.site.fraisRembourses)) + '</td>'
      + '<td class="num ' + (R.equilibre ? 'bon' : 'att') + '">' + signe(R.ecart) + '</td>'
      + '<td class="num">' + (R.nbSquare >= R.nbCommandes ? '+' : '') + (R.nbSquare - R.nbCommandes) + '</td></tr>'
      + '</tbody></table>';

    /* Le verdict : une PASTILLE courte (plus de bandeau) ; le detail entier se deplie dessous. */
    h += R.equilibre
      ? '<details class="cx-detail"><summary class="cx-bon"><b>${T("Réconciliation équilibrée")}</b></summary>'
        + '<div class="cx-sub">${T("Réconciliation équilibrée")}${T(" — les montants de Square et ceux du système correspondent (écart de moins d’un dollar).")}</div></details>'
      : '<details class="cx-detail"><summary class="cx-averti"><b>${T("Écart de ")}' + fmt(Math.abs(R.ecart)) + '</b><span>${T("Vérification requise")}</span></summary>'
        + '<div class="cx-sub"><b>${T("Écart de ")}' + fmt(Math.abs(R.ecart)) + '</b>${T(" — causes possibles : ")}'
        + '${T("transactions faites hors du système, remboursements partiels, paiements par carte-cadeau, ")}'
        + '${T("ou commandes réglées par un autre moyen.")}</div></details>';
    h += '</div>';
    return h;
  }

  function dessiner(){
    var act = document.getElementById('p-actions');
    if (!D) { if (act) act.innerHTML = ''; corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    if (sous) {
      sous.innerHTML = D.connecte
        ? '<span class="rf-pill vert">' + (D.mode === 'production' ? '${T("Production")}' : '${T("Bac à sable")}') + '</span>'
        : '<span class="rf-pill">${T("non configuré")}</span>';
    }
    if (!D.connecte) {
      if (act) act.innerHTML = '';
      corps.innerHTML = '<div class="vide"><div class="gros"><span class="ic">🔑</span></div>'
        + '${T("Configurez d’abord la connexion Square dans <strong>Configuration → Paiement</strong>, ")}'
        + '${T("dans la fenêtre principale.")}</div>';
      return;
    }

    if (act) act.innerHTML = gestes();
    var h = '';
    if (!D.charge && !OCCUPE) {
      h += barre() + '<div class="vide">${T("Aucune donnée pour ")}' + D.annee + '.'
        + '<div style="margin-top:.4rem">${T("Cliquez « Charger les transactions » pour les lire chez Square.")}</div></div>';
    } else if (OCCUPE && !D.charge) {
      h += barre() + '<div class="vide charge">${T("Lecture des paiements et des remboursements chez Square pour ")}' + D.annee + '…</div>';
    } else {
      h += ONGLET === 'reconciliation' ? vueReconciliation() : vueTransactions();
    }
    corps.innerHTML = h;

    var sel = document.getElementById('p-annee');
    if (sel) sel.onchange = function(){ ANNEE = +sel.value; charger(); };
    var bc = document.getElementById('p-charger');
    if (bc) bc.onclick = chercherChezSquare;
    var bm = document.getElementById('p-masquer');
    if (bm) bm.onclick = function(){
      bm.disabled = true;
      appeler('paiements:masquer', [D.annee]).then(function(r){
        if (!r.ok) { bm.disabled = false; dire(expliquer(r), 'err'); return; }
        /* ⚠ Le singulier et le pluriel, chacun entier. */
        dire(r.nb + (r.nb > 1 ? '${T(" entrées masquées.")}' : '${T(" entrée masquée.")}'), 'bon');
        charger();
      });
    };
    var br = document.getElementById('p-reafficher');
    if (br) br.onclick = function(){
      br.disabled = true;
      appeler('paiements:reafficher', []).then(function(r){
        if (!r.ok) { br.disabled = false; dire(expliquer(r), 'err'); return; }
        dire(r.nb + (r.nb > 1 ? '${T(" entrées de nouveau visibles.")}' : '${T(" entrée de nouveau visible.")}'), 'bon');
        charger();
      });
    };
  }

  /* (2026-10-19, audit — lot VOLUME) MOIS PAR MOIS, AVEC LA PROGRESSION. Une annee de 10 000 paiements, c etait
     50 pages lues en serie dans UN appel du pont borne a 60 s : il expirait, et la fenetre disait << Square n a
     pas repondu >> alors que Square repondait tres bien, lentement. Chaque mois est maintenant son propre appel
     (court), le compte monte a l ecran, et un echec dit A QUEL MOIS il s est arrete — les mois deja lus restent.
     L annee en cours s arrete au mois courant (rien a lire dans le futur). */
  function chercherChezSquare(){
    if (OCCUPE) return;
    OCCUPE = true;
    var an = D ? D.annee : ANNEE;
    var maint = new Date();
    var dernier = (+an === maint.getFullYear()) ? (maint.getMonth() + 1) : 12;
    if (+an > maint.getFullYear()) dernier = 1;
    var nb = 0, nbR = 0, quota = false;
    dire('${T("Lecture chez Square…")}', 'att');
    dessiner();
    function mois(m){
      if (m > dernier) {
        OCCUPE = false;
        dire(nb + (nb > 1 ? '${T(" paiements")}' : '${T(" paiement")}')
          + (nbR
              ? '${T(" et ")}' + nbR
                + (nbR > 1 ? '${T(" remboursements")}' : '${T(" remboursement")}')
              : '')
          + '${T(" relus chez Square.")}'
          + (quota ? ' ' + MOTIFS.quota : ''), quota ? 'err' : 'bon');
        charger();
        return;
      }
      dire('${T("Lecture chez Square…")} ' + '${T("mois")} ' + m + '/' + dernier
        + ' · ' + nb + (nb > 1 ? '${T(" paiements")}' : '${T(" paiement")}'), 'att');
      appeler('paiements:charger', [an, m]).then(function(r){
        if (!r.ok) {
          /* ⚠ UN ECHEC RESEAU N EFFACE RIEN : ce qui etait en memoire reste
             affiche. Dire << aucune donnee >> apres un refus de Square ferait
             croire a des transactions disparues. */
          OCCUPE = false;
          dire('${T("Arrêté au mois")} ' + m + '/' + dernier + ' — ' + expliquer(r), 'err');
          dessiner();
          if (m > 1) charger();
          return;
        }
        nb += (+r.nb || 0); nbR += (+r.nbRemboursements || 0);
        if (r.quota) quota = true;
        mois(m + 1);
      });
    }
    mois(1);
  }

  /* (2026-10-15, sa demande : « le chargement des données doit se faire automatiquement au lancement
     du module ») A l ouverture, et a la premiere visite de chaque annee, on va chez Square SANS attendre
     le clic : le cache s affiche aussitot (s il existe), puis la lecture fraiche le remplace. Une seule
     fois par annee et par ouverture — le bouton reste pour actualiser a la main. */
  var LU_AUTO = {};
  function charger(){
    appeler('paiements:lire', [ANNEE || undefined]).then(function(r){
      if (!r || !r.ok) { vide('${T("Paiements indisponibles")}', expliquer(r)); return; }
      D = r;
      ANNEE = r.annee;
      // chercherChezSquare dessine lui-meme l etat « Lecture chez Square… » : pas d eclair de « Cliquez… » avant.
      if (!OCCUPE && !LU_AUTO[D.annee]) { LU_AUTO[D.annee] = true; chercherChezSquare(); return; }
      dessiner();
    });
  }

  window.szActualiser = function(){ if (!OCCUPE) charger(); };
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

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); dessiner(); }
  });

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pagePaiements };
