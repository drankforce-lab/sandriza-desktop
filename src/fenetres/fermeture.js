'use strict';
/*
 * FERMETURE DE CAISSE — fenêtre native (2026-11-21)
 * =============================================================================
 * Module choisi sur la page « Douze nouveaux modules ». Le moteur vit côté site
 * (assets/js/fermeture.js) : il relit les ventes de comptoir du jour par mode de
 * paiement, et enregistre la fermeture (rapport Z) telle qu'elle est au moment
 * où on la fait. Cette fenêtre fait COMPTER le tiroir et montre l'écart en direct.
 *
 *   fermeture:donnees  (jour?)  → { journee, fondPropose, deja, historique, modes, coupures, peutFermer }
 *   fermeture:fermer   (saisie) → { ok, id, ecart }
 *   fermeture:imprimer (id)     → { ok }
 *
 * ⚠ Le calcul affiché ici (attendu, écart) est un APERÇU : le site le refait à
 * l'enregistrement, et c'est le sien qui fait foi.
 * ⚠ AUCUNE GLISSIÈRE : l'historique est paginé par le socle (data-pages).
 *
 * États d'ouverture (bancs de rendu) : 'fermee', 'historique'.
 */
const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
const T = require('../langue').tr('fermeture');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.tete .cx-resume{color:var(--tx2);font-size:.8rem}
.tete .cx-actions{margin-left:auto;display:flex;gap:.5rem;align-items:center}
select,input,button,textarea{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;
  padding:.3rem .5rem;cursor:pointer}
input,textarea{cursor:text}
textarea{resize:none}
select:focus,input:focus,button:focus,textarea:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
#corps{flex:1 1 auto;min-height:0;overflow:hidden;padding:.8rem 1.1rem .7rem;display:flex;flex-direction:column;gap:.7rem}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.8rem}
.msg.bon{color:var(--tx-ok)} .msg.err{color:var(--tx-err)}
.onglets{display:flex;gap:1rem;border-bottom:1px solid var(--v08);flex:0 0 auto}
.onglets button{background:transparent;border:0;border-bottom:2px solid transparent;border-radius:0;padding:.3rem 0;color:var(--tx2);font-weight:600}
.onglets button.actif{color:var(--tx);border-bottom-color:var(--or)}
.deux{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:.9rem;flex:1 1 auto;min-height:0}
.fc{background:var(--f-carte);border:1px solid var(--v08);border-radius:14px;padding:.85rem 1rem;display:flex;flex-direction:column;gap:.5rem;min-width:0;min-height:0}
.fc h2{margin:0;font-size:.95rem}
.fc h3{margin:.3rem 0 0;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--tx2)}
.lg{display:flex;align-items:baseline;gap:.5rem;font-size:.86rem;padding:.12rem 0}
.lg span{flex:1;min-width:0;color:var(--tx2)}
.lg b{font-variant-numeric:tabular-nums;white-space:nowrap}
.lg.fort span,.lg.fort b{color:var(--tx);font-weight:800}
.lg.fort{border-top:1px solid var(--v08);padding-top:.35rem;margin-top:.15rem}
.coup{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.35rem .45rem}
.coup label{display:flex;flex-direction:column;gap:.1rem;font-size:.72rem;color:var(--tx2);min-width:0}
.coup input{width:100%;text-align:right;padding:.22rem .4rem}
.lig{display:flex;gap:.45rem;align-items:center}
.lig label{font-size:.78rem;color:var(--tx2);min-width:9.5rem}
.lig input{flex:1;min-width:0;text-align:right}
.sort{display:flex;gap:.4rem}
.sort input:first-child{flex:1;min-width:0}
.sort input:last-child{width:6.5rem;text-align:right}
.res{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem;margin-top:.2rem}
.res div{border-radius:10px;padding:.45rem .6rem;background:var(--v05);display:flex;flex-direction:column}
.res span{font-size:.72rem;color:var(--tx2)}
.res b{font-size:1.15rem;font-variant-numeric:tabular-nums}
.res .ec.zero{background:rgba(74,222,128,.12)} .res .ec.zero b{color:var(--tx-ok)}
.res .ec.moins{background:rgba(248,113,113,.12)} .res .ec.moins b{color:var(--tx-err2)}
.res .ec.plus{background:rgba(251,191,36,.12)} .res .ec.plus b{color:var(--tx-att)}
html.jour .res .ec.zero b{color:#1d6a3b} html.jour .res .ec.moins b{color:#a3302b} html.jour .res .ec.plus b{color:#8a5a00}
.act{display:flex;gap:.5rem;justify-content:flex-end;margin-top:auto;padding-top:.4rem}
.ferme{display:flex;flex-direction:column;gap:.5rem}
.avis{font-size:.82rem;color:var(--tx2);margin:0}
.tab-z{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2);padding:.45rem .5rem;border-bottom:1px solid var(--v08);font-weight:700}
tbody td{padding:.45rem .5rem;border-bottom:1px solid var(--v05)}
td.num{font-variant-numeric:tabular-nums;white-space:nowrap}
.pill{display:inline-flex;font-size:.72rem;font-weight:700;padding:.1rem .5rem;border-radius:999px;background:var(--v08);color:var(--tx2);white-space:nowrap}
.pill.zero{background:rgba(74,222,128,.14);color:var(--tx-ok)} .pill.moins{background:rgba(248,113,113,.14);color:var(--tx-err2)} .pill.plus{background:rgba(251,191,36,.14);color:var(--tx-att)}
html.jour .pill{color:#47505e} html.jour .pill.zero{color:#1d6a3b} html.jour .pill.moins{color:#a3302b} html.jour .pill.plus{color:#8a5a00}
`;

function pageFermeture(ouverture) {
  const ok = ['fermee', 'historique'];
  const etat = ok.indexOf(String(ouverture || '')) >= 0 ? String(ouverture) : '';
  return `${TETE()}
<title>${T("Fermeture de caisse — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.fermeture}</span><h1>${T("Fermeture de caisse")}</h1>
  <span class="cx-resume" id="sous"></span><div class="cx-actions" id="outils"></div></div>
<div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var elOutils = document.getElementById('outils');
  var elSous = document.getElementById('sous');
  var LIEU = '${LIEU()}';
  var D = null;
  var ETAT = '${etat}';
  var ONGLET = 'jour';
  var JOUR = '';
  var OCCUPE = false;
  var REFAIRE = false;
  var S = null;   /* la saisie : fond, coupures, sorties, terminal, fond suivant, note */

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

  var MOTIFS = {
    maj_en_cours:       '${T("Une mise à jour s’installe : cette opération est suspendue jusqu’au redémarrage de l’application.")}',
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas de fermer la caisse.")}',
    indisponible:       '${T("Le module de fermeture n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    deja:               '${T("Cette journée est déjà fermée.")}',
    futur:              '${T("On ne peut pas fermer une journée qui n’est pas encore arrivée.")}',
    compte:             '${T("Comptez le tiroir avant de fermer.")}',
    impression:         '${T("L’impression n’a pas pu s’ouvrir.")}',
    introuvable:        '${T("Cette fermeture n’existe plus.")}',
    nuage:              '${T("Le nuage a refusé l’écriture : elle n’existe que sur ce poste. Vérifiez la connexion, puis refaites le geste.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').');
    if (r && r.detail && m === 'echec') t += ' (' + String(r.detail).slice(0, 150) + ')';
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
  function nombre(v){ var n = Number(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : 0; }
  function r2(n){ return Math.round((Number(n) || 0) * 100) / 100; }
  function jourLong(s){
    var p = String(s || '').split('-'); if (p.length !== 3) return String(s || '');
    try { return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(LIEU, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return s; }
  }
  function coupure(v){ return szArgent(v); }
  function heure(s){ var t = Date.parse(s || ''); if (!t) return ''; try { return new Date(t).toLocaleTimeString(LIEU, { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }
  function ton(e){ return Math.abs(e) < 0.005 ? 'zero' : (e < 0 ? 'moins' : 'plus'); }

  /* Le même calcul que le site (assets/js/fermeture.js, calculer) — APERÇU seulement. */
  function calcul(){
    var j = D.journee;
    var fond = r2(nombre(S.fond));
    var sorties = 0; S.sorties.forEach(function(x){ sorties += Math.max(0, nombre(x.montant)); });
    var attendu = r2(fond + j.parMode.comptant.total - j.rembComptant - sorties);
    var compte = 0; (D.coupures || []).forEach(function(v){ compte += v * Math.max(0, Math.round(nombre(S.coupures[String(v)]))); });
    compte = r2(compte);
    return { attendu: attendu, compte: compte, ecart: r2(compte - attendu), sorties: r2(sorties) };
  }

  function carteJour(){
    var j = D.journee, h = '<section class="fc"><h2>${T("Les ventes au comptoir")}</h2>';
    (D.modes || []).forEach(function(m){
      var x = j.parMode[m.cle] || { nb: 0, total: 0 };
      h += '<div class="lg"><span>' + esc(szTd(m.nom)) + ' (' + x.nb + ')</span><b>' + esc(szArgent(x.total)) + '</b></div>';
    });
    h += '<div class="lg fort"><span>' + '${T("Total ({0} ventes)")}'.split('{0}').join(String(j.nbVentes)) + '</span><b>' + esc(szArgent(j.total)) + '</b></div>'
      + '<h3>${T("Le détail")}</h3>'
      + '<div class="lg"><span>${T("dont TPS")}</span><b>' + esc(szArgent(j.tps)) + '</b></div>'
      + '<div class="lg"><span>${T("dont TVQ")}</span><b>' + esc(szArgent(j.tvq)) + '</b></div>'
      + '<div class="lg"><span>${T("Rabais accordés")}</span><b>' + esc(szArgent(j.rabais)) + '</b></div>'
      + '<div class="lg"><span>${T("Articles vendus")}</span><b>' + j.articles + '</b></div>'
      + '<div class="lg"><span>${T("Panier moyen")}</span><b>' + esc(szArgent(j.panier)) + '</b></div>'
      + (j.liens ? '<div class="lg"><span>' + '${T("Liens de paiement en attente ({0})")}'.split('{0}').join(String(j.liens)) + '</span><b>' + esc(szArgent(j.liensTotal)) + '</b></div>' : '')
      + (j.nbRemb ? '<div class="lg"><span>' + '${T("Remboursements ({0})")}'.split('{0}').join(String(j.nbRemb)) + '</span><b>' + esc(szArgent(j.rembComptant + j.rembAutres)) + '</b></div>' : '');
    return h + '</section>';
  }
  function carteTiroir(){
    var c = calcul(), j = D.journee;
    var h = '<section class="fc" id="f-tir"><h2>${T("Le tiroir-caisse")}</h2>'
      + '<div class="lig"><label for="t-fond">${T("Fond au départ")}</label><input id="t-fond" inputmode="decimal" value="' + esc(S.fond) + '"></div>'
      + '<h3>${T("Comptez les billets et les pièces")}</h3><div class="coup">'
      + (D.coupures || []).map(function(v){ return '<label>' + esc(coupure(v)) + '<input data-coup="' + v + '" inputmode="numeric" value="' + esc(S.coupures[String(v)] || '') + '" aria-label="' + esc(coupure(v)) + '"></label>'; }).join('')
      + '</div><h3>${T("Sorties de caisse")}</h3>'
      + S.sorties.map(function(x, i){ return '<div class="sort"><input data-smotif="' + i + '" maxlength="80" value="' + esc(x.motif) + '" placeholder="${T("Motif (ex. : café, timbres)")}" aria-label="${T("Motif de la sortie")}"><input data-smontant="' + i + '" inputmode="decimal" value="' + esc(x.montant) + '" placeholder="0,00" aria-label="${T("Montant de la sortie")}"></div>'; }).join('')
      + '<div class="lig"><label for="t-term">${T("Total du terminal Square")}</label><input id="t-term" inputmode="decimal" value="' + esc(S.terminal) + '" placeholder="' + esc(szArgent(j.parMode.terminal.total)) + '"></div>'
      + '<div class="res"><div><span>${T("Attendu")}</span><b>' + esc(szArgent(c.attendu)) + '</b></div><div><span>${T("Compté")}</span><b>' + esc(szArgent(c.compte)) + '</b></div>'
      + '<div class="ec ' + ton(c.ecart) + '"><span>${T("Écart")}</span><b>' + (c.ecart > 0 ? '+' : '') + esc(szArgent(c.ecart)) + '</b></div></div>'
      + '<div class="lig"><label for="t-suiv">${T("Fond laissé pour demain")}</label><input id="t-suiv" inputmode="decimal" value="' + esc(S.fondSuivant) + '"></div>'
      + '<div class="act">' + (REFAIRE ? '<button type="button" id="t-annuler">${T("Annuler")}</button>' : '')
      + (D.peutFermer ? '<button type="button" class="prim" id="t-fermer">${T("Fermer la journée")}</button>' : '') + '</div>';
    return h + '</section>';
  }
  function carteFermee(){
    var f = D.deja;
    return '<section class="fc ferme"><h2>${T("Journée fermée")}</h2>'
      + '<p class="avis">' + '${T("Fermée par {0} à {1}.")}'.split('{0}').join(esc(f.par || '—')).split('{1}').join(esc(heure(f.fermeLe))) + '</p>'
      + '<div class="res"><div><span>${T("Attendu")}</span><b>' + esc(szArgent(f.attendu)) + '</b></div><div><span>${T("Compté")}</span><b>' + esc(szArgent(f.compte)) + '</b></div>'
      + '<div class="ec ' + ton(f.ecart) + '"><span>${T("Écart")}</span><b>' + (f.ecart > 0 ? '+' : '') + esc(szArgent(f.ecart)) + '</b></div></div>'
      + (f.ecartTerminal != null ? '<div class="lg"><span>${T("Écart du terminal Square")}</span><b>' + esc(szArgent(f.ecartTerminal)) + '</b></div>' : '')
      + '<div class="lg"><span>${T("Fond laissé pour demain")}</span><b>' + esc(szArgent(f.fondSuivant)) + '</b></div>'
      + (f.note ? '<p class="avis">' + esc(f.note) + '</p>' : '')
      + '<div class="act">' + (D.peutFermer ? '<button type="button" id="t-refaire">${T("Refaire la fermeture")}</button>' : '')
      + '<button type="button" class="prim" data-imprimer="' + esc(f.id) + '">${T("Imprimer le rapport Z")}</button></div></section>';
  }
  function historique(){
    var L = D.historique || [];
    if (!L.length) return '<p class="avis">${T("Aucune journée fermée pour l’instant.")}</p>';
    return '<div class="tab-z"><table><thead><tr><th>${T("Journée")}</th><th>${T("Ventes")}</th><th>${T("Attendu")}</th><th>${T("Compté")}</th><th>${T("Écart")}</th><th>${T("Par")}</th><th></th></tr></thead><tbody data-pages="fermetures">'
      + L.map(function(f){
        return '<tr><td>' + esc(jourLong(f.jour)) + '</td><td class="num">' + esc(szArgent(f.total)) + '</td><td class="num">' + esc(szArgent(f.attendu)) + '</td>'
          + '<td class="num">' + esc(szArgent(f.compte)) + '</td><td><span class="pill ' + ton(f.ecart) + '">' + (f.ecart > 0 ? '+' : '') + esc(szArgent(f.ecart)) + '</span></td>'
          + '<td>' + esc(f.par || '—') + '</td><td><button type="button" data-imprimer="' + esc(f.id) + '">${T("Rapport Z")}</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function outils(){
    elOutils.innerHTML = D ? '<input type="date" id="t-jour" max="' + esc(D.aujourdhui) + '" value="' + esc(D.jour) + '" aria-label="${T("Journée")}">' : '';
  }
  function dessiner(){
    outils();
    if (!D) return;
    elSous.textContent = jourLong(D.jour);
    var h = '<div class="onglets" role="tablist"><button type="button" role="tab" data-onglet="jour" class="' + (ONGLET === 'jour' ? 'actif' : '') + '">${T("La journée")}</button>'
      + '<button type="button" role="tab" data-onglet="historique" class="' + (ONGLET === 'historique' ? 'actif' : '') + '">${T("Journées fermées")}</button></div>';
    if (ONGLET === 'historique') { corps.innerHTML = h + historique(); return; }
    if (!D.peutFermer && !D.deja) h += '<p class="avis">${T("Lecture seule : votre rôle ne permet pas de fermer la caisse.")}</p>';
    h += '<div class="deux">' + carteJour() + ((D.deja && !REFAIRE) ? carteFermee() : carteTiroir()) + '</div>';
    corps.innerHTML = h;
  }
  /* Redessine seulement le résultat, pour ne pas voler le focus pendant la frappe. */
  function majResultat(){
    var c = calcul(), res = document.querySelector('#f-tir .res');
    if (!res) return;
    res.innerHTML = '<div><span>${T("Attendu")}</span><b>' + esc(szArgent(c.attendu)) + '</b></div><div><span>${T("Compté")}</span><b>' + esc(szArgent(c.compte)) + '</b></div>'
      + '<div class="ec ' + ton(c.ecart) + '"><span>${T("Écart")}</span><b>' + (c.ecart > 0 ? '+' : '') + esc(szArgent(c.ecart)) + '</b></div>';
  }
  function saisieVide(){
    var f = D.deja;
    var s = { fond: String(f && REFAIRE ? f.fond : D.fondPropose), coupures: {}, sorties: [], terminal: '', fondSuivant: String(f && REFAIRE ? f.fondSuivant : D.fondPropose), note: '' };
    if (f && REFAIRE) {
      Object.keys(f.coupures || {}).forEach(function(k){ s.coupures[k] = String(f.coupures[k]); });
      (f.sorties || []).forEach(function(x){ s.sorties.push({ motif: x.motif, montant: String(x.montant) }); });
      s.terminal = f.terminalRapport != null ? String(f.terminalRapport) : '';
    }
    s.sorties.push({ motif: '', montant: '' });
    return s;
  }
  function charger(jour){
    appeler('fermeture:donnees', [jour || JOUR || '']).then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; elOutils.innerHTML = ''; return; }
      D = r; JOUR = r.jour;
      if (ETAT === 'historique') ONGLET = 'historique';
      ETAT = '';
      REFAIRE = false;
      S = saisieVide();
      dessiner();
    });
  }
  function fermer(btn){
    if (OCCUPE) return;
    var c = calcul();
    var coup = {}; Object.keys(S.coupures).forEach(function(k){ var n = Math.round(nombre(S.coupures[k])); if (n > 0) coup[k] = n; });
    var saisie = { jour: D.jour, fond: nombre(S.fond), coupures: coup, terminalRapport: S.terminal === '' ? '' : nombre(S.terminal),
      sorties: S.sorties.filter(function(x){ return nombre(x.montant) > 0; }).map(function(x){ return { motif: x.motif, montant: nombre(x.montant) }; }),
      fondSuivant: nombre(S.fondSuivant), remplacer: REFAIRE };
    var texte = '${T("Attendu {0}, compté {1}, écart {2}. La journée sera fermée et son rapport Z gardé.")}'
      .split('{0}').join(szArgent(c.attendu)).split('{1}').join(szArgent(c.compte)).split('{2}').join(szArgent(c.ecart));
    szConfirmer({ titre: '${T("Fermer la journée")}', texte: texte, oui: '${T("Fermer la journée")}', prudent: Math.abs(c.ecart) >= 0.005 }).then(function(oui){
      if (!oui) return;
      OCCUPE = true; if (btn) btn.disabled = true;
      appeler('fermeture:fermer', [saisie]).then(function(r){
        OCCUPE = false; if (btn) btn.disabled = false;
        if (!r.ok) { szDire(expliquer(r), 'err'); return; }
        szDire('${T("Journée fermée. Le rapport Z est gardé.")}', 'bon');
        charger(D.jour);
      });
    });
  }

  document.addEventListener('click', function(ev){
    var t = ev.target && ev.target.closest ? ev.target.closest('button') : null;
    if (!t) return;
    var x;
    if ((x = t.getAttribute('data-onglet'))) { ONGLET = x; dessiner(); return; }
    if (t.id === 't-fermer') { fermer(t); return; }
    if (t.id === 't-refaire') { REFAIRE = true; S = saisieVide(); dessiner(); return; }
    if (t.id === 't-annuler') { REFAIRE = false; dessiner(); return; }
    if ((x = t.getAttribute('data-imprimer'))) {
      appeler('fermeture:imprimer', [x]).then(function(r){ if (!r.ok) szDire(expliquer(r), 'err'); else szDire('${T("Rapport Z envoyé à l’impression.")}', 'bon'); });
      return;
    }
  });
  document.addEventListener('input', function(ev){
    var t = ev.target; if (!t || !S) return;
    var k;
    if (t.id === 't-fond') S.fond = t.value;
    else if (t.id === 't-term') S.terminal = t.value;
    else if (t.id === 't-suiv') S.fondSuivant = t.value;
    else if ((k = t.getAttribute('data-coup')) != null) S.coupures[k] = t.value;
    else if ((k = t.getAttribute('data-smotif')) != null) S.sorties[+k].motif = t.value;
    else if ((k = t.getAttribute('data-smontant')) != null) {
      S.sorties[+k].montant = t.value;
      /* Une ligne de sortie vide de plus apparaît dès que la dernière est remplie. */
      if (+k === S.sorties.length - 1 && t.value) { S.sorties.push({ motif: '', montant: '' }); dessiner(); var e = document.querySelector('[data-smontant="' + k + '"]'); if (e) { e.focus(); e.setSelectionRange(e.value.length, e.value.length); } return; }
    }
    majResultat();
  });
  document.addEventListener('change', function(ev){
    var t = ev.target;
    if (t && t.id === 't-jour' && t.value) charger(t.value);
  });
  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape') return;
    if (document.querySelector('.szc-voile')) return;
    ev.preventDefault();
    if (REFAIRE) { REFAIRE = false; dessiner(); return; }
    if (P && P.fermer) P.fermer();
  });
  function rechargerSiLibre(){
    var dedans = document.activeElement && document.activeElement.closest && document.activeElement.closest('#f-tir');
    if (!OCCUPE && !REFAIRE && !dedans) charger();
  }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) rechargerSiLibre(); });
  window.szActualiser = rechargerSiLibre;
  window.szRevenir = rechargerSiLibre;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;flex:0 0 auto');
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

  charger();
})();
</script></body></html>`;
}

module.exports = { pageFermeture };
