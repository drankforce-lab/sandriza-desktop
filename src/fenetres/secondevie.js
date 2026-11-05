'use strict';

/*
 * FENÊTRE « SECONDE VIE » — NATIVE (8.29.0, sa demande du 2026-11-05)
 * =============================================================================
 * Deux sections DISTINCTES, chacune avec son interrupteur :
 *   · REPRISES : les demandes des clientes (un vêtement acheté chez nous, contre un
 *     crédit boutique de X % de sa valeur AU PLUS). Accepter (offre ≤ plafond) →
 *     Article reçu (le serveur crée le crédit) — ou Refuser (motif) ;
 *   · RÉGLAGES : la reprise (active, % maximal — 15 par défaut —, conditions FR/EN)
 *     et la section seconde main de la boutique (active, titre, texte FR/EN).
 * Les articles de seconde main se marquent dans la fiche produit (Mise en marché).
 *
 * ⚠ L'ARGENT EST AU SERVEUR (reprise_traiter) : le plafond est recalculé d'après la
 *   demande figée ; la fenêtre ne fait qu'en proposer le montant.
 * ⚠ Confirmations dans une boîte à part (szConfirmer) ; boutons de filtre = le mot seul.
 * ⚠ AUCUN CARACTÈRE accent grave NI ANTISLASH dans la portion de script.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('secondevie');

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
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow:hidden;display:flex;flex-direction:column;gap:.6rem}
button,select,input,textarea{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px}
button{padding:.3rem .65rem;cursor:pointer}
input,select{padding:.28rem .5rem}
textarea{width:100%;padding:.45rem .55rem;resize:none;line-height:1.45}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button:focus,select:focus,input:focus,textarea:focus{outline:none;border-color:var(--or)}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
button.danger{color:var(--tx-err2)}
.onglets{flex:0 0 auto;display:flex;gap:.25rem;flex-wrap:wrap;align-items:center;border-bottom:1px solid var(--v08);padding:0 0 .5rem}
.onglets > button{background:transparent;border:1px solid transparent;color:var(--tx2);padding:.38rem .7rem;font-weight:600;font-size:.82rem}
.onglets > button:hover{background:var(--v05);color:var(--tx)}
.onglets .sep{width:1px;height:1.2rem;background:var(--v12);margin:0 .4rem}
.duo{flex:1 1 0;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:.9rem;grid-template-rows:minmax(0,1fr)}
.duo > div{display:flex;flex-direction:column;min-width:0;min-height:0}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:12px;padding:.8rem .9rem;display:flex;flex-direction:column;gap:.55rem;min-height:0}
.carte.pleine{flex:1 1 0}
.carte h2{margin:0;font-size:.88rem;font-weight:700}
.pile{display:flex;flex-direction:column;gap:.4rem}
.rp{border:1px solid var(--v07);border-radius:10px;padding:.5rem .65rem;cursor:pointer;background:var(--v03)}
.rp:hover{border-color:var(--or)}
.rp.sel{border-color:var(--or);background:rgba(var(--or-rgb),.10)}
.rp .h{display:flex;align-items:center;gap:.5rem;font-size:.74rem;color:var(--tx2)}
.rp .h .p{font-weight:650;color:var(--tx);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.rp .h .d{margin-left:auto;white-space:nowrap}
.rp .t{font-size:.82rem;margin-top:.12rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pill{display:inline-block;font-size:.66rem;font-weight:700;padding:.06rem .45rem;border-radius:99px;white-space:nowrap}
.pill.demandee{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.acceptee{background:rgba(var(--or-rgb),.16);color:var(--tx-or)}
.pill.creditee{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.refusee{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.prod{display:flex;align-items:center;gap:.7rem}
.prod .nm{font-weight:700}
.prod .sk{font-size:.74rem;color:var(--tx2)}
.lignes{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.2rem .9rem;font-size:.84rem}
.lignes .l{color:var(--tx2)}
.lignes .v{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}
.note{font-size:.86rem;line-height:1.5;white-space:pre-wrap}
.ch{display:flex;flex-direction:column;gap:.25rem}
.ch label{font-size:.74rem;font-weight:650;color:var(--tx2)}
.actions{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}
.actions .droite{margin-left:auto}
.aide{font-size:.75rem;color:var(--tx2);line-height:1.45}
.grille2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,26rem),1fr));gap:.9rem;align-content:start}
.bascule{display:flex;align-items:center;gap:.5rem;font-size:.88rem;cursor:pointer;font-weight:650}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (max-width:1000px){.duo{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page de la fenêtre. `ouverture` : '' (les reprises ouvertes) ou 'reglages'. */
function pageSecondeVie(ouverture) {
  const vue = String(ouverture || '') === 'reglages' ? 'reglages' : 'ouvertes';
  return `${TETE()}
<title>${T("Seconde vie — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.returns}</span><h1>${T("Seconde vie")}</h1><span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var elSous = document.getElementById('sous');
  var VUE = '${vue}';          /* ouvertes | demandee | acceptee | creditee | refusee | toutes | reglages */
  var D = null, CHOIX = '', OCCUPE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  var MOTIFS = {
    session:              '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:                '${T("Votre rôle ne permet pas ce geste.")}',
    lecture_seule:        '${T("Votre rôle est en lecture seule.")}',
    indisponible:         '${T("Le module Seconde vie n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible:    '${T("La fenêtre principale ne répond pas.")}',
    delai:                '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue:   '${T("Cette version de l’application ne connaît pas cette opération.")}',
    montant_hors_plafond: '${T("Le montant dépasse le plafond de cette reprise : le serveur l’a refusé.")}',
    etat_invalide:        '${T("Cette reprise a changé d’état entre-temps. Rechargez la liste.")}',
    modifiee_ailleurs:    '${T("Cette reprise a été traitée sur un autre poste. Rechargez la liste.")}',
    droit_insuffisant:    '${T("Le serveur a refusé : droit manquant.")}',
    nuage:                '${T("Le serveur n’a pas pris la modification. Réessayez.")}',
    echec:                '${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').'); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(){ return { ok: false, motif: 'echec' }; });
  }
  var NOMS = { ouvertes: '${T("À traiter")}', creditee: '${T("Créditées")}', refusee: '${T("Refusées")}', toutes: '${T("Toutes")}', reglages: '${T("Réglages")}' };
  var ETATS = { demandee: '${T("Demandée")}', acceptee: '${T("Acceptée")}', creditee: '${T("Créditée")}', refusee: '${T("Refusée")}' };
  var USURE = { neuf: '${T("Comme neuf")}', tresbon: '${T("Très bon état")}', bon: '${T("Bon état")}' };

  function choisie(){ var l = (D && D.reprises) || []; for (var i = 0; i < l.length; i++) if (l[i].id === CHOIX) return l[i]; return null; }

  function dessiner(){
    if (!D) return;
    elSous.textContent = D.enAttente === 1 ? '${T("Une demande à évaluer")}' : D.enAttente > 1 ? '${T("{0} demandes à évaluer")}'.replace('{0}', String(D.enAttente)) : '';
    var h = '<div class="onglets">' + ['ouvertes', 'creditee', 'refusee', 'toutes'].map(function(f){
      return '<button type="button" data-vue="' + f + '" class="' + (VUE === f ? 'actif' : '') + '">' + NOMS[f] + '</button>';
    }).join('') + '<span class="sep"></span><button type="button" data-vue="reglages" class="' + (VUE === 'reglages' ? 'actif' : '') + '">' + NOMS.reglages + '</button></div>';
    h += VUE === 'reglages' ? reglages() : reprises();
    corps.innerHTML = h;
  }

  function reprises(){
    var l = D.reprises || [];
    if (!choisie()) CHOIX = l.length ? l[0].id : '';
    var h = '<div class="duo"><div><div class="carte pleine">';
    if (!D.cfg.reprise.actif) h += '<div class="aide">${T("La reprise est désactivée : la boutique n’accepte aucune nouvelle demande (Réglages).")}</div>';
    if (!l.length) h += '<div class="vide">' + (VUE === 'ouvertes' ? '${T("Aucune reprise à traiter.")}' : '${T("Aucune reprise ici.")}') + '</div>';
    else h += '<div class="sz-pagee"><div class="pile" data-pages="reprises-' + VUE + '">' + l.map(function(r){
      return '<div class="rp' + (r.id === CHOIX ? ' sel' : '') + '" data-rp="' + esc(r.id) + '" data-ctx-ligne="1">'
        + '<div class="h"><span class="p">' + esc(r.nom) + '</span><span class="pill ' + esc(r.statut) + '">' + (ETATS[r.statut] || esc(r.statut)) + '</span>'
        + '<span class="d">' + esc(szJour(r.creeLe) || '') + '</span></div>'
        + '<div class="t">' + esc(r.client || '—') + ' · ' + esc(r.commande) + ' · ' + esc(USURE[r.etat] || r.etat) + '</div></div>';
    }).join('') + '</div></div>';
    return h + '</div></div><div>' + detail() + '</div></div>';
  }

  function detail(){
    var r = choisie();
    if (!r) return '<div class="carte pleine"><div class="vide">${T("Choisissez une reprise à gauche.")}</div></div>';
    var ro = !D.peutTraiter;
    var h = '<div class="carte pleine">'
      + '<div class="prod">' + szVignette(r.image, r.nom, '', r.nom) + '<div><div class="nm">' + esc(r.nom) + '</div>'
      + '<div class="sk">' + esc([r.taille, r.couleur].filter(Boolean).join(' · ')) + '</div></div></div>'
      + '<div class="lignes">'
      + '<span class="l">${T("Client")}</span><span class="v">' + esc(r.client || '—') + '</span>'
      + '<span class="l">${T("Commande")}</span><span class="v">' + esc(r.commande) + '</span>'
      + '<span class="l">${T("État déclaré")}</span><span class="v">' + esc(USURE[r.etat] || r.etat) + '</span>'
      + '<span class="l">${T("Prix payé")}</span><span class="v">' + esc(szArgent(r.base)) + '</span>'
      + '<span class="l">' + '${T("Plafond ({0} %)")}'.replace('{0}', String(r.pctMax)) + '</span><span class="v">' + esc(szArgent(r.offreMax)) + '</span>'
      + (r.offre != null ? '<span class="l">${T("Offre acceptée")}</span><span class="v">' + esc(szArgent(r.offre)) + '</span>' : '')
      + (r.creditNumber ? '<span class="l">${T("Crédit versé")}</span><span class="v">' + esc(r.creditNumber) + '</span>' : '')
      + '</div>'
      + (r.note ? '<div class="ch"><label>${T("Précisions du client")}</label><div class="note">' + esc(r.note) + '</div></div>' : '')
      + (r.motif ? '<div class="ch"><label>${T("Motif du refus")}</label><div class="note">' + esc(r.motif) + '</div></div>' : '');
    if (r.statut === 'demandee') {
      h += '<div class="ch"><label for="rp-montant">${T("Crédit offert (au plus le plafond)")}</label>'
        + '<input id="rp-montant" type="number" min="0.01" step="0.01" max="' + r.offreMax + '" value="' + r.offreMax.toFixed(2) + '" style="max-width:9rem"' + (ro ? ' disabled' : '') + '></div>'
        + '<div class="actions"><button type="button" class="prim" data-a="accepter"' + (ro ? ' disabled' : '') + '>${T("Accepter la reprise")}</button>'
        + '<button type="button" class="danger droite" data-a="refuser"' + (ro ? ' disabled' : '') + '>${T("Refuser")}</button></div>'
        + '<div class="aide">${T("Accepter fixe l’offre ; le crédit n’est versé qu’à la réception de l’article (bouton « Article reçu »).")}</div>';
    } else if (r.statut === 'acceptee') {
      h += '<div class="actions"><button type="button" class="prim" data-a="recevoir"' + (ro ? ' disabled' : '') + '>${T("Article reçu : verser le crédit")}</button>'
        + '<button type="button" class="danger droite" data-a="refuser"' + (ro ? ' disabled' : '') + '>${T("Refuser")}</button></div>';
    }
    if (r.statut === 'demandee' || r.statut === 'acceptee') {
      h += '<div class="ch"><label for="rp-motif">${T("Motif en cas de refus (vu par le client)")}</label>'
        + '<textarea id="rp-motif" rows="2" maxlength="400"' + (ro ? ' disabled' : '') + '></textarea></div>';
    }
    return h + '</div>';
  }

  function reglages(){
    var c = D.cfg, ro = !D.peutRegler, dis = ro ? ' disabled' : '';
    return '<div class="grille2">'
      + '<div class="carte"><h2>${T("Reprise des vêtements")}</h2>'
      + '<label class="bascule"><input type="checkbox" id="g-rp"' + (c.reprise.actif ? ' checked' : '') + dis + '> ${T("Accepter les demandes de reprise (page Reprise de la boutique)")}</label>'
      + '<div class="ch"><label for="g-pct">${T("Crédit maximal, en % du prix payé")}</label><input id="g-pct" type="number" min="1" max="50" step="1" value="' + c.reprise.pctMax + '" style="max-width:7rem"' + dis + '></div>'
      + '<div class="ch"><label for="g-cond">${T("Conditions (français)")}</label><textarea id="g-cond" rows="3" maxlength="600"' + dis + '>' + esc(c.reprise.conditions) + '</textarea></div>'
      + '<div class="ch"><label for="g-cond-en">${T("Conditions (anglais)")}</label><textarea id="g-cond-en" rows="3" maxlength="600"' + dis + '>' + esc(c.reprise.conditionsEN) + '</textarea></div>'
      + '<div class="aide">${T("Le % est figé sur chaque demande au moment où elle est faite : le changer ne modifie pas les demandes en cours.")}</div></div>'
      + '<div class="carte"><h2>${T("Section seconde main")}</h2>'
      + '<label class="bascule"><input type="checkbox" id="g-sm"' + (c.secondeMain.actif ? ' checked' : '') + dis + '> ${T("Afficher la section Seconde main dans la boutique")}</label>'
      + '<div class="ch"><label for="g-titre">${T("Titre (français)")}</label><input id="g-titre" maxlength="60" value="' + esc(c.secondeMain.titre) + '"' + dis + '></div>'
      + '<div class="ch"><label for="g-titre-en">${T("Titre (anglais)")}</label><input id="g-titre-en" maxlength="60" value="' + esc(c.secondeMain.titreEN) + '"' + dis + '></div>'
      + '<div class="ch"><label for="g-texte">${T("Texte (français)")}</label><textarea id="g-texte" rows="3" maxlength="600"' + dis + '>' + esc(c.secondeMain.texte) + '</textarea></div>'
      + '<div class="ch"><label for="g-texte-en">${T("Texte (anglais)")}</label><textarea id="g-texte-en" rows="3" maxlength="600"' + dis + '>' + esc(c.secondeMain.texteEN) + '</textarea></div>'
      + '<div class="aide">${T("Un article se marque « seconde main » dans sa fiche (Mise en marché) : il ne paraît alors que dans cette section. Section désactivée : ces articles disparaissent de la boutique.")}</div></div>'
      + '</div><div class="actions"><button type="button" class="prim droite" data-a="regler"' + dis + '>${T("Enregistrer les réglages")}</button></div>';
  }

  function traiter(action){
    var r = choisie(); if (!r || OCCUPE) return;
    if (action === 'accepter') {
      var m = parseFloat((document.getElementById('rp-montant') || {}).value);
      if (!(m > 0) || m > r.offreMax + 0.001) { dire(MOTIFS.montant_hors_plafond, 'err'); return; }
      szConfirmer({ titre: '${T("Accepter la reprise")}',
        texte: '${T("Vous offrez {0} en crédit boutique pour « {1} ». Le crédit sera versé à la réception de l’article.")}'.replace('{0}', szArgent(m)).replace('{1}', r.nom),
        oui: '${T("Accepter et offrir {0}")}'.replace('{0}', szArgent(m)) }).then(function(ok){ if (ok) envoyer(r.id, 'accepter', m, '', '${T("Reprise acceptée.")}'); });
    } else if (action === 'recevoir') {
      szConfirmer({ titre: '${T("Verser le crédit")}',
        texte: '${T("L’article est arrivé et convient : un crédit boutique de {0} sera créé au compte de {1}. Ce geste ne s’annule pas.")}'.replace('{0}', szArgent(r.offre || 0)).replace('{1}', r.client || '—'),
        oui: '${T("Verser {0}")}'.replace('{0}', szArgent(r.offre || 0)) }).then(function(ok){ if (ok) envoyer(r.id, 'recevoir', r.offre, '', '${T("Crédit versé.")}'); });
    } else if (action === 'refuser') {
      var motif = String((document.getElementById('rp-motif') || {}).value || '').trim();
      szConfirmer({ titre: '${T("Refuser la reprise")}', danger: true,
        texte: '${T("La demande pour « {0} » sera refusée. Le client verra le motif dans sa page Reprise.")}'.replace('{0}', r.nom),
        oui: '${T("Refuser la reprise")}' }).then(function(ok){ if (ok) envoyer(r.id, 'refuser', 0, motif, '${T("Reprise refusée.")}'); });
    }
  }
  function envoyer(id, action, montant, motif, bravo){
    OCCUPE = true; dire('${T("Enregistrement…")}', 'att');
    appeler('secondevie:traiter', [id, action, montant, motif]).then(function(r){
      OCCUPE = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire(bravo, 'bon'); charger(true);
    });
  }
  function regler(){
    if (OCCUPE) return;
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    var c = function(id){ var e = document.getElementById(id); return !!(e && e.checked); };
    OCCUPE = true; dire('${T("Enregistrement…")}', 'att');
    appeler('secondevie:regler', [{ reprise: { actif: c('g-rp'), pctMax: v('g-pct'), conditions: v('g-cond'), conditionsEN: v('g-cond-en') },
      secondeMain: { actif: c('g-sm'), titre: v('g-titre'), titreEN: v('g-titre-en'), texte: v('g-texte'), texteEN: v('g-texte-en') } }]).then(function(r){
      OCCUPE = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      D = r; dire('${T("Réglages enregistrés.")}', 'bon'); dessiner();
    });
  }

  corps.onclick = function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var v = t.closest('[data-vue]');
    if (v) { VUE = v.getAttribute('data-vue'); CHOIX = ''; if (VUE === 'reglages') dessiner(); else charger(false); return; }
    var a = t.closest('[data-a]');
    if (a && !a.disabled) { var k = a.getAttribute('data-a'); if (k === 'regler') regler(); else traiter(k); return; }
    var li = t.closest('[data-rp]');
    if (li) { CHOIX = li.getAttribute('data-rp'); dessiner(); }
  };
  function charger(garder){
    if (!garder) dire('${T("Lecture…")}', 'att');
    appeler('secondevie:donnees', [VUE === 'reglages' ? 'ouvertes' : VUE]).then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; dire(expliquer(r), 'err'); return; }
      D = r; if (!garder) dire(''); dessiner();
    });
  }
  window.szRevenir = function(){ charger(true); };
  document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); } });
  charger(false);
})();
</script>
</body></html>`;
}

module.exports = { pageSecondeVie };
