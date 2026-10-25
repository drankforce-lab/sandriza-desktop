'use strict';

/*
 * FENÊTRE « RAPPORTS D'ENCAN » — NATIVE (2026-10-25, lot 4 de l'encan)
 * =============================================================================
 * Sa demande (les quatre volets cochés) : le DÉROULEMENT du direct, les VENTES et
 * l'ARGENT, les ACHETEUSES, et la COMPARAISON entre séances (avec un CSV).
 *
 * À GAUCHE, les séances côte à côte (la comparaison) ; À DROITE, la séance
 * choisie, en quatre onglets. Le CSV part dans le dossier des exports.
 *
 * ⚠ LA FENÊTRE NE CALCULE RIEN. Les séances sont écrites par la coquille pendant
 * le direct (src/encan.js), l'argent est relu au serveur, et le calcul est fait
 * par le site (assets/js/encanrapports.js, op encanrapports:donnees).
 * ⚠ PAS DE CASES DE CHIFFRES (sa règle du 2026-10-16 : « sauf dans le tableau de
 * bord », rapports compris) : des tableaux et des lignes « libellé — valeur ».
 * ⚠ AUCUN CARACTÈRE accent grave NI ANTISLASH dans la portion de script.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, SEP_DEC } = require('./socle.js');
const T = require('../langue').tr('encan-rapports');

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
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
#corps{overflow:hidden}
#corps>.duo{flex:1 1 0;min-height:0}
select,input,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.28rem .5rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
button.mini{padding:.1rem .42rem;font-size:.74rem}
button:focus{outline:none;border-color:var(--or)}
.gris{color:var(--tx2)}.bon{color:var(--tx-ok)}.mauvais{color:var(--tx-err2)}
.aide{font-size:.76rem;color:var(--tx2);line-height:1.45}
.appel{display:flex;flex-direction:column;align-items:center;gap:.6rem;padding:1.6rem 1rem;text-align:center}
.appel .aide{max-width:36rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
.pages{display:flex;align-items:center;gap:.4rem;margin-left:auto;font-size:.74rem;font-weight:400;color:var(--tx2)}
.pages button.pgf{min-width:1.9rem;padding:.08rem .45rem;font-size:.95rem;line-height:1.1}
.puces{display:flex;gap:.35rem;flex-wrap:wrap;align-items:center}
.puce{padding:.18rem .62rem;border-radius:999px;font-size:.76rem;background:var(--v05);border:1px solid var(--v12)}
.puce[aria-pressed=true]{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:650}
.cx-carte h2{display:flex;align-items:center;gap:.5rem}
.duo{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:.9rem;grid-template-rows:minmax(0,1fr);align-items:stretch}
.duo>div{display:flex;flex-direction:column;gap:.9rem;min-width:0;min-height:0}
.duo>div>*{flex:0 0 auto}
.duo>div>.cx-carte.grand{flex:1 0 auto}
/* La comparaison : une rangée par séance */
.se,.se-t{display:grid;grid-template-columns:minmax(0,2.4fr) 3.9rem 3.3rem 3.7rem 3.5rem minmax(0,1fr) 3.7rem 4.4rem;gap:.5rem;align-items:center;padding:.42rem .5rem}
.se-t{font-size:.66rem;font-weight:650;color:var(--tx2);text-transform:uppercase;letter-spacing:.04em}
.se{border-top:1px solid var(--v08);font-size:.8rem;border-radius:8px;cursor:pointer}
.se:hover{background:var(--v03)}
.se.sel{background:rgba(var(--or-rgb),.10)}
.se .n,.se-t .n{text-align:right;font-variant-numeric:tabular-nums}
.se .d{display:flex;align-items:center;gap:.35rem;min-width:0}
.se .d>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.se .d .essai{flex:0 0 auto;font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--tx-att)}
/* Le détail : des lignes libellé — valeur */
.lignes{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.15rem .9rem;font-size:.82rem}
.lignes .l{color:var(--tx2)}
.lignes .v{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}
.lignes .sep{grid-column:1/-1;border-top:1px solid var(--v08);margin:.25rem 0}
.tab,.tab-t{display:grid;gap:.45rem;align-items:center;padding:.32rem .3rem;font-size:.78rem}
.tab-t{font-size:.66rem;font-weight:650;color:var(--tx2);text-transform:uppercase;letter-spacing:.04em}
.tab{border-top:1px solid var(--v08)}
.tab .n,.tab-t .n{text-align:right;font-variant-numeric:tabular-nums}
.tab .d{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.ach{grid-template-columns:minmax(0,1fr) 3.4rem 3.4rem 5.2rem 5.8rem}
.art{grid-template-columns:minmax(0,1.4fr) 6.4rem minmax(0,.9fr) 3rem 6rem}
@media (max-width:1100px){.duo{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page de la fenêtre « Rapports d'encan ». `ouverture` : '' (la première séance, déroulement),
 * ou 'argent' / 'acheteuses' / 'articles' (le même rapport, sur cet onglet) — pour le garde-fou de
 * rendu, qui ne simule aucun clic.
 */
function pageEncanRapports(ouverture) {
  const ok = ['argent', 'acheteuses', 'articles'];
  const onglet = ok.indexOf(String(ouverture || '')) >= 0 ? String(ouverture) : 'deroulement';
  return `${TETE()}
<title>${T("Rapports d’encan — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.analytics || ''}</span><h1>${T("Rapports d’encan")}</h1>
  <span class="cx-resume" id="sous"></span><div class="cx-actions" id="outils"></div></div>
<div class="cx" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var elOutils = document.getElementById('outils');
  var elSous = document.getElementById('sous');

  var D = null, OCCUPE = false;
  var PERIODE = 'tout';          /* tout | 90 | 30 (jours) */
  var CHOIX = '';                /* la séance montrée à droite */
  var ONGLET = '${onglet}';
  var PG = 0, BU = 0, PGD = 0;   /* pages : la liste des séances, puis le détail */
  var PAR_DETAIL = 9;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var MOTIFS = {
    session:           '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:             '${T("Votre rôle ne permet pas de consulter les rapports d’encan.")}',
    indisponible:      '${T("Le module des rapports n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}',
    delai:             '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue:'${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:             '${T("La lecture des rapports a échoué.")}'
  };
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').'); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  /* ── Mise en forme ── */
  function iso(ms){ try { return new Date(ms).toISOString(); } catch (e) { return ''; } }
  function duree(min){ min = Math.max(0, Math.round(min || 0)); return min >= 60 ? Math.floor(min / 60) + ' h ' + ('0' + (min % 60)).slice(-2) : min + ' min'; }
  function pct(x){ return x == null ? '—' : String(x).replace('.', szSepDec()) + ' %'; }
  /* Le separateur de la LANGUE DU POSTE, resolu a la generation (2026-10-25, audit) : la locale du
     systeme donnait << 12.5 % >> dans une interface francaise sur un Windows anglais. */
  function szSepDec(){ return '${SEP_DEC()}'; }
  function nb(x){ return String(x == null ? 0 : x).replace('.', szSepDec()); }
  var ISSUES = { vendu: ['${T("vendu")}', 'vert'], adjuge: ['${T("adjugé")}', 'bleu'], remis: ['${T("remis en vente")}', 'ambre'],
    annule: ['${T("annulé")}', ''], en_cours: ['${T("en cours")}', 'bleu'] };
  var STATUTS = { payee: ['${T("payée")}', 'vert'], attente: ['${T("en attente")}', 'ambre'], expiree: ['${T("expirée")}', 'rouge'], annulee: ['${T("annulée")}', ''] };
  function pastille(paire){ return paire ? '<span class="rf-pill ' + paire[1] + '">' + esc(paire[0]) + '</span>' : ''; }

  /* ══ LE CHARGEMENT ═════════════════════════════════════════════════════════ */
  function charger(){
    if (OCCUPE) return Promise.resolve();
    OCCUPE = true;
    szDire('${T("Lecture des séances et des ventes…")}');
    return appeler('encanrapports:donnees', []).then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) {
        D = null; outils();
        corps.innerHTML = '<div class="appel cx-carte"><strong>${T("Rapports indisponibles")}</strong><div class="aide">' + esc(expliquer(r)) + '</div></div>';
        szDire('');
        return;
      }
      D = r;
      if (!CHOIX || !seance(CHOIX)) CHOIX = visibles().length ? visibles()[0].id : '';
      szDire('');
      dessiner();
    });
  }
  function seance(id){ var L = (D && D.seances) || []; for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i]; return null; }
  function visibles(){
    var L = (D && D.seances) || [];
    if (PERIODE === 'tout') return L;
    var jours = parseInt(PERIODE, 10) || 30, limite = Date.now() - jours * 86400000;
    return L.filter(function(s){ return s.debut >= limite; });
  }

  /* ── LA BARRE D OUTILS ── */
  var PERIODES = [['30', '${T("30 jours")}'], ['90', '${T("90 jours")}'], ['tout', '${T("Tout")}']];
  function outils(){
    if (!D) { elOutils.innerHTML = ''; return; }
    elOutils.innerHTML = '<div class="puces" role="group" aria-label="${T("Période")}">'
      + PERIODES.map(function(p){ return '<button type="button" class="puce" data-periode="' + p[0] + '" aria-pressed="' + (PERIODE === p[0]) + '">' + p[1] + '</button>'; }).join('')
      + '</div><button type="button" id="r-csv"' + ((D.seances || []).length ? '' : ' disabled') + ' title="${T("Une ligne par séance, pour Excel")}">${T("Exporter le CSV")}</button>'
      + '<button type="button" id="r-relire" title="${T("Relire les séances et les paiements")}">${T("Actualiser")}</button>';
  }

  /* ══ À GAUCHE : LA COMPARAISON ═════════════════════════════════════════════ */
  function nav(nbp, cle, pg){
    if (nbp <= 1) return '';
    return '<span class="pages">'
      + '<button type="button" class="mini pgf" data-' + cle + '="-1" aria-label="${T("Page précédente")}"' + (pg <= 0 ? ' disabled' : '') + '>‹</button>'
      + '<span>${T("Page")} ' + (pg + 1) + ' / ' + nbp + '</span>'
      + '<button type="button" class="mini pgf" data-' + cle + '="1" aria-label="${T("Page suivante")}"' + (pg >= nbp - 1 ? ' disabled' : '') + '>›</button></span>';
  }
  function rangee(s){
    var a = s.argent, d = s.deroulement, ac = s.acheteuses;
    return '<div class="se' + (CHOIX === s.id ? ' sel' : '') + '" data-se="' + esc(s.id) + '" role="button" tabindex="0">'
      + '<span class="d"><span>' + esc(szQuand(iso(s.debut))) + '</span>' + (s.essai ? '<span class="essai">${T("essai")}</span>' : '') + '</span>'
      + '<span class="n">' + esc(duree(d.dureeMin)) + '</span>'
      + '<span class="n">' + d.articles + '</span>'
      + '<span class="n">' + d.adjuges + '</span>'
      + '<span class="n">' + a.payees + '</span>'
      + '<span class="n">' + esc(szArgent(a.encaisse)) + '</span>'
      + '<span class="n">' + esc(pct(a.tauxPaiement)) + '</span>'
      + '<span class="n">' + ac.gagnantes + ' <span class="gris">(' + ac.nouvelles + ')</span></span>'
      + '</div>';
  }
  function liste(){
    var V = visibles();
    if (!(BU > 0)) BU = Math.max(4, Math.floor(((corps.clientHeight || 640) - 150) / 40));
    var nbp = Math.max(1, Math.ceil(V.length / BU));
    if (PG >= nbp) PG = nbp - 1; if (PG < 0) PG = 0;
    var tot = V.reduce(function(t, s){ return t + (s.essai ? 0 : s.argent.encaisse); }, 0);
    return '<div class="cx-carte grand"><h2>${T("Séances")} <span class="cx-sub">' + V.length + ' · ${T("encaissé")} ' + esc(szArgent(tot)) + '</span>' + nav(nbp, 'pg', PG) + '</h2>'
      + '<div class="se-t"><span>${T("Début")}</span><span class="n">${T("Durée")}</span><span class="n">${T("Encans")}</span><span class="n">${T("Adjugés")}</span>'
      + '<span class="n">${T("Payées")}</span><span class="n">${T("Encaissé")}</span><span class="n">${T("Taux")}</span><span class="n">${T("Gagnantes")}</span></div>'
      + (V.length ? V.slice(PG * BU, (PG + 1) * BU).map(rangee).join('') : '<div class="aide" style="padding:.8rem">${T("Aucune séance dans cette période.")}</div>')
      + (D.horsSeance ? '<div class="aide" style="margin-top:.5rem">' + D.horsSeance + ' ${T("vente(s) d’encan antérieure(s) aux rapports n’appartiennent à aucune séance : elles restent dans les Commandes.")}</div>' : '')
      + '</div>';
  }

  /* ══ À DROITE : UNE SÉANCE, EN QUATRE ONGLETS ══════════════════════════════ */
  var ONGLETS = [['deroulement', '${T("Déroulement")}'], ['argent', '${T("Argent")}'], ['acheteuses', '${T("Acheteuses")}'], ['articles', '${T("Articles")}']];
  function ligne(l, v){ return '<span class="l">' + l + '</span><span class="v">' + v + '</span>'; }
  function deroulement(s){
    var d = s.deroulement, ps = d.parSource || {};
    return '<div class="lignes">'
      + ligne('${T("Durée")}', esc(duree(d.dureeMin)) + ' <span class="gris">(' + esc(szQuand(iso(s.debut))) + ')</span>')
      + ligne('${T("Encans lancés")}', d.articles + ' <span class="gris">· ' + d.articlesDistincts + ' ${T("articles différents")}</span>')
      + ligne('${T("Adjugés")}', d.adjuges)
      + ligne('${T("Sans offre")}', d.sansOffre)
      + ligne('${T("Remis en vente")}', d.remisEnVente)
      + '<span class="sep"></span>'
      + ligne('${T("Offres retenues")}', d.offres + ' <span class="gris">· ' + nb(d.offresParArticle) + ' ${T("par encan")}</span>')
      + ligne('${T("Offres refusées (trop basses, bloquées…)")}', d.offresRefusees)
      + ligne('${T("Hausse moyenne sur le prix de départ")}', '+' + esc(pct(d.hausseMoyenne)))
      + '<span class="sep"></span>'
      + ligne('${T("Commentaires")}', d.commentaires + ' <span class="gris">· ' + nb(d.parMinute) + ' ${T("par minute")}</span>')
      + ligne('${T("Du direct / saisis à la main / essai")}', (ps.direct || 0) + ' / ' + (ps.manuel || 0) + ' / ' + (ps.essai || 0))
      + ligne('${T("Pseudos différents")}', d.pseudos)
      + ligne('${T("« GAGNÉ » écrit dans les commentaires")}', d.gagneEcrits)
      + ligne('${T("Pseudos bloqués")}', d.bloques.length ? esc(d.bloques.join(', ')) : '—')
      + '</div>';
  }
  function argent(s){
    var a = s.argent;
    return (s.essai ? '<div class="aide" style="margin-bottom:.4rem">${T("Séance en mode essai : ces montants ne sont pas de l’argent réel.")}</div>' : '')
      + '<div class="lignes">'
      + ligne('${T("Ventes créées (adjugées)")}', a.ventes)
      + ligne('${T("Payées")}', a.payees)
      + ligne('${T("En attente de paiement")}', a.attente + (a.attente ? ' <span class="gris">· ' + esc(szArgent(a.enAttente)) + '</span>' : ''))
      + ligne('${T("Expirées / annulées")}', a.expirees + ' / ' + a.annulees)
      + '<span class="sep"></span>'
      + ligne('${T("Adjugé (prix gagnants)")}', esc(szArgent(a.adjugeTotal)))
      + ligne('${T("Adjugé payé")}', esc(szArgent(a.adjugePaye)))
      + ligne('${T("Encaissé (livraison et taxes comprises)")}', '<span class="bon">' + esc(szArgent(a.encaisse)) + '</span>')
      + ligne('${T("dont livraison")}', esc(szArgent(a.livraison)))
      + '<span class="sep"></span>'
      + ligne('${T("Taux de paiement (ventes tranchées)")}', esc(pct(a.tauxPaiement)))
      + ligne('${T("Panier moyen (adjugé payé)")}', esc(szArgent(a.panierMoyen)))
      + ligne('${T("Délai moyen entre l’adjudication et le paiement")}', a.delaiPaiementMin == null ? '—' : esc(duree(a.delaiPaiementMin)))
      + '</div>';
  }
  function acheteuses(s){
    var ac = s.acheteuses, L = ac.liste || [];
    var nbp = Math.max(1, Math.ceil(L.length / PAR_DETAIL)); if (PGD >= nbp) PGD = nbp - 1;
    return '<div class="lignes" style="margin-bottom:.5rem">'
      + ligne('${T("Gagnantes")}', ac.gagnantes)
      + ligne('${T("Nouvelles / habituées (déjà payé avant ce direct)")}', ac.nouvelles + ' / ' + ac.habituees)
      + ligne('${T("N’ont jamais payé")}', ac.jamaisPaye.length ? esc(ac.jamaisPaye.slice(0, 6).join(', ')) + (ac.jamaisPaye.length > 6 ? '…' : '') : '—')
      + '</div>'
      + (L.length ? '<div class="tab-t ach"><span>${T("Pseudo")}</span><span class="n">${T("Gagnés")}</span><span class="n">${T("Payés")}</span><span class="n">${T("Payé")}</span><span></span></div>'
        + L.slice(PGD * PAR_DETAIL, (PGD + 1) * PAR_DETAIL).map(function(p){
            return '<div class="tab ach"><span class="d">' + esc(p.pseudo) + '</span><span class="n">' + p.gagnes + '</span><span class="n">' + p.payes + '</span>'
              + '<span class="n">' + esc(szArgent(p.montant)) + '</span><span>' + (p.habituee ? '<span class="rf-pill vert">${T("habituée")}</span>' : '<span class="rf-pill bleu">${T("nouvelle")}</span>') + '</span></div>';
          }).join('') + '<div style="display:flex">' + nav(nbp, 'pgd', PGD) + '</div>'
        : '<div class="aide">${T("Aucune gagnante dans cette séance.")}</div>');
  }
  function articles(s){
    var L = s.detail || [];
    var nbp = Math.max(1, Math.ceil(L.length / PAR_DETAIL)); if (PGD >= nbp) PGD = nbp - 1;
    if (!L.length) return '<div class="aide">${T("Aucun encan lancé dans cette séance.")}</div>';
    return '<div class="tab-t art"><span>${T("Article")}</span><span class="n">${T("Départ › adjugé")}</span><span>${T("Gagnante")}</span><span class="n">${T("Offres")}</span><span>${T("Issue")}</span></div>'
      + L.slice(PGD * PAR_DETAIL, (PGD + 1) * PAR_DETAIL).map(function(e){
          var nom = [e.nom, e.variante].filter(Boolean).join(' · ');
          return '<div class="tab art"><span class="d" title="' + esc(nom) + '">' + esc(nom || '—') + '</span>'
            + '<span class="n">' + esc(szArgent(e.depart)) + (e.adjuge ? ' › ' + esc(szArgent(e.adjuge)) : '') + '</span>'
            + '<span class="d">' + esc(e.pseudo || '—') + '</span><span class="n">' + e.offres + '</span>'
            + '<span>' + (e.vente ? pastille(STATUTS[e.vente.statut]) : pastille(ISSUES[e.issue])) + '</span></div>';
        }).join('') + '<div style="display:flex">' + nav(nbp, 'pgd', PGD) + '</div>';
  }
  function detail(){
    var s = seance(CHOIX);
    if (!s) return '<div class="cx-carte"><h2>${T("Séance")}</h2><div class="aide">${T("Choisissez une séance dans la liste.")}</div></div>';
    var corpsD = ONGLET === 'argent' ? argent(s) : ONGLET === 'acheteuses' ? acheteuses(s) : ONGLET === 'articles' ? articles(s) : deroulement(s);
    return '<div class="cx-carte grand"><h2>${T("Séance du")} ' + esc(szJour(iso(s.debut))) + (s.essai ? ' <span class="rf-pill ambre">${T("essai")}</span>' : '') + '</h2>'
      + '<div class="puces" role="tablist" aria-label="${T("Volets du rapport")}" style="margin-bottom:.6rem">'
      + ONGLETS.map(function(o){ return '<button type="button" class="puce" role="tab" data-onglet="' + o[0] + '" aria-pressed="' + (ONGLET === o[0]) + '" aria-selected="' + (ONGLET === o[0]) + '">' + o[1] + '</button>'; }).join('')
      + '</div>' + corpsD + '</div>';
  }

  /* ══ LE DESSIN ═════════════════════════════════════════════════════════════ */
  function rendu(){
    var L = (D.seances || []);
    if (!L.length) return '<div class="cx-carte appel"><strong>${T("Aucune séance pour l’instant")}</strong>'
      + '<div class="aide">${T("Une séance commence au premier encan lancé dans la console de l’encan, et s’enregistre au fil du direct. Le rapport paraît ici : déroulement, argent, acheteuses, et la comparaison entre directs.")}</div></div>';
    return '<div class="duo"><div>' + liste() + '</div><div>' + detail() + '</div></div>';
  }
  function dessiner(){
    outils();
    if (!D) return;
    var L = D.seances || [];
    var reel = L.filter(function(s){ return !s.essai; });
    elSous.textContent = L.length + ' ' + (L.length > 1 ? '${T("séances")}' : '${T("séance")}')
      + (reel.length ? ' · ' + szArgent(reel.reduce(function(t, s){ return t + s.argent.encaisse; }, 0)) + ' ${T("encaissés")}' : '');
    corps.innerHTML = rendu();
    var tours = 0;
    while (corps.scrollHeight > corps.clientHeight + 1 && BU > 2 && tours < 60) { BU--; tours++; corps.innerHTML = rendu(); }
    tours = 0;
    while (corps.scrollHeight > corps.clientHeight + 1 && PAR_DETAIL > 3 && tours < 20) { PAR_DETAIL--; tours++; corps.innerHTML = rendu(); }
  }

  /* ── LE CSV ── */
  function exporter(b){
    if (!D || !D.csv) return;
    if (!P || typeof P.enregistrerExport !== 'function') { szDire('${T("Cette version de l’application ne sait pas enregistrer de fichier.")}', 'err'); return; }
    b.disabled = true;
    var t = new Date(), z = function(n){ return ('0' + n).slice(-2); };
    var nom = 'rapports-encan-' + t.getFullYear() + '-' + z(t.getMonth() + 1) + '-' + z(t.getDate()) + '.csv';
    Promise.resolve(P.enregistrerExport(nom, D.csv)).then(function(w){
      b.disabled = false;
      if (!w || !w.ok) { szDire(w && w.annule ? '${T("Export annulé.")}' : '${T("L’export a échoué.")}', 'err'); return; }
      szDire('${T("CSV enregistré dans le dossier des exports :")} ' + nom, 'bon');
    });
  }

  /* ── LES GESTES ── */
  document.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var x;
    if ((x = t.closest('[data-periode]'))) { PERIODE = x.getAttribute('data-periode'); PG = 0; var V = visibles(); if (!seance(CHOIX) || V.indexOf(seance(CHOIX)) < 0) CHOIX = V.length ? V[0].id : ''; dessiner(); return; }
    if ((x = t.closest('[data-pg]'))) { PG += parseInt(x.getAttribute('data-pg'), 10) || 0; dessiner(); return; }
    if ((x = t.closest('[data-pgd]'))) { PGD += parseInt(x.getAttribute('data-pgd'), 10) || 0; if (PGD < 0) PGD = 0; dessiner(); return; }
    if ((x = t.closest('[data-onglet]'))) { ONGLET = x.getAttribute('data-onglet'); PGD = 0; dessiner(); return; }
    if ((x = t.closest('[data-se]'))) { CHOIX = x.getAttribute('data-se'); PGD = 0; dessiner(); return; }
    if (t.id === 'r-csv') { exporter(t); return; }
    if (t.id === 'r-relire') { charger(); return; }
  });
  document.addEventListener('keydown', function(ev){
    var t = ev.target;
    if ((ev.key === 'Enter' || ev.key === ' ') && t && t.getAttribute && t.getAttribute('data-se')) { ev.preventDefault(); CHOIX = t.getAttribute('data-se'); PGD = 0; dessiner(); return; }
    if (ev.key === 'Escape' && P && P.fermer) { ev.preventDefault(); P.fermer(); }
  });
  window.addEventListener('resize', function(){
    clearTimeout(window._erT);
    window._erT = setTimeout(function(){ BU = 0; PAR_DETAIL = 9; if (D) dessiner(); }, 180);
  });
  function rechargerSiLibre(){ if (!OCCUPE) charger(); }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) rechargerSiLibre(); });
  window.szActualiser = rechargerSiLibre;
  window.szRevenir = rechargerSiLibre;

  charger();
})();
</script></body></html>`;
}

module.exports = { pageEncanRapports };
