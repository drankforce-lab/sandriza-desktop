'use strict';

/*
 * FENÊTRE « QUESTIONS SUR LES PRODUITS » — NATIVE (8.28.0, sa demande du 2026-11-05)
 * =============================================================================
 * Une visiteuse pose une question sur la fiche d'un produit (« la robe est-elle
 * doublée ? ») ; l'équipe y répond ICI, et la réponse PUBLIÉE reste visible sur la
 * fiche pour les suivantes. Rien ne paraît en boutique avant la réponse.
 *
 * À GAUCHE, la file (pages mesurées, jamais de glissière) ; À DROITE, la question
 * choisie : le produit, la question, le prénom, et la réponse à rédiger.
 * Boutons : « Publier la réponse », « Enregistrer sans publier », « Masquer » /
 * « Republier », « Supprimer » (boîte de confirmation à part).
 *
 * ⚠ LA FENÊTRE NE DÉCIDE RIEN : le cœur vit dans le site (assets/js/questions.js,
 * ops questions:*), et le serveur ne laisse changer que la réponse et le statut.
 * ⚠ Les boutons de filtre portent le MOT SEUL, jamais un compte (sa règle).
 * ⚠ AUCUN CARACTÈRE accent grave NI ANTISLASH dans la portion de script.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('questions');

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
button,textarea{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px}
button{padding:.3rem .65rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button:focus,textarea:focus{outline:none;border-color:var(--or)}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
button.danger{color:var(--tx-err2)}
.onglets{flex:0 0 auto;display:flex;gap:.25rem;flex-wrap:wrap;align-items:center;border-bottom:1px solid var(--v08);padding:0 0 .5rem}
.onglets > button{background:transparent;border:1px solid transparent;color:var(--tx2);padding:.38rem .7rem;font-weight:600;font-size:.82rem}
.onglets > button:hover{background:var(--v05);color:var(--tx)}
.duo{flex:1 1 0;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:.9rem;grid-template-rows:minmax(0,1fr)}
.duo > div{display:flex;flex-direction:column;min-width:0;min-height:0}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:12px;padding:.8rem .9rem;display:flex;flex-direction:column;gap:.55rem;min-height:0}
.carte.pleine{flex:1 1 0}
.carte h2{margin:0;font-size:.86rem;font-weight:700}
.pile{display:flex;flex-direction:column;gap:.4rem}
.q{border:1px solid var(--v07);border-radius:10px;padding:.5rem .65rem;cursor:pointer;background:var(--v03)}
.q:hover{border-color:var(--or)}
.q.sel{border-color:var(--or);background:rgba(var(--or-rgb),.10)}
.q .h{display:flex;align-items:center;gap:.5rem;font-size:.74rem;color:var(--tx2)}
.q .h .p{font-weight:650;color:var(--tx);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.q .h .d{margin-left:auto;white-space:nowrap}
.q .t{font-size:.84rem;margin-top:.15rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.prod{display:flex;align-items:center;gap:.7rem}
.prod .nm{font-weight:700}
.prod .sk{font-size:.74rem;color:var(--tx2);font-family:'Courier New',monospace}
.texte{font-size:.92rem;line-height:1.55;white-space:pre-wrap}
.meta{font-size:.74rem;color:var(--tx2)}
.lbl{font-size:.74rem;font-weight:650;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em}
textarea{width:100%;min-height:7.5rem;padding:.55rem .65rem;resize:none;line-height:1.5}
.cpt{font-size:.72rem;color:var(--tx2);text-align:right}
.actions{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}
.actions .droite{margin-left:auto}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (max-width:1000px){.duo{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page de la fenêtre. `ouverture` : '' (à répondre), ou 'publiee' / 'masquee' / 'toutes' — pour le
 * garde-fou de rendu, qui ne simule aucun clic.
 */
function pageQuestions(ouverture) {
  const ok = ['publiee', 'masquee', 'toutes'];
  const filtre = ok.indexOf(String(ouverture || '')) >= 0 ? String(ouverture) : 'attente';
  return `${TETE()}
<title>${T("Questions sur les produits — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.support}</span><h1>${T("Questions sur les produits")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var elSous = document.getElementById('sous');

  var D = null, OCCUPE = false;
  var FILTRE = '${filtre}';
  var CHOIX = '';
  var BROUILLON = {};   /* la réponse en cours de frappe, par question : un redessin ne la perd pas */

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  var MOTIFS = {
    session:           '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:             '${T("Votre rôle ne permet pas de modérer les questions.")}',
    indisponible:      '${T("Le module des questions n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}',
    delai:             '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue:'${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:       '${T("Cette question n’existe plus.")}',
    reponse_requise:   '${T("Écrivez une réponse avant de publier : une question sans réponse ne paraît jamais en boutique.")}',
    nuage:             '${T("Le serveur n’a pas pris la modification. Réessayez.")}',
    echec:             '${T("L’opération a échoué.")}'
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
  var NOMS = { attente: '${T("À répondre")}', publiee: '${T("Publiées")}', masquee: '${T("Masquées")}', toutes: '${T("Toutes")}' };
  var ETATS = { attente: '${T("en attente")}', publiee: '${T("publiée")}', masquee: '${T("masquée")}' };

  function choisie(){
    var l = (D && D.questions) || [];
    for (var i = 0; i < l.length; i++) if (l[i].id === CHOIX) return l[i];
    return null;
  }

  function dessiner(){
    if (!D) return;
    var l = D.questions || [];
    if (!choisie()) CHOIX = l.length ? l[0].id : '';
    var n = (D.comptes && D.comptes.attente) || 0;
    elSous.textContent = n ? '${T("{0} en attente de réponse")}'.replace('{0}', String(n)) : '${T("Aucune question en attente")}';
    var h = '<div class="onglets">' + ['attente', 'publiee', 'masquee', 'toutes'].map(function(f){
      return '<button type="button" data-filtre="' + f + '" class="' + (FILTRE === f ? 'actif' : '') + '">' + NOMS[f] + '</button>';
    }).join('') + '</div>';
    h += '<div class="duo"><div><div class="carte pleine">';
    if (!l.length) {
      h += '<div class="vide">' + (FILTRE === 'attente' ? '${T("Aucune question n’attend de réponse.")}' : '${T("Aucune question ici.")}') + '</div>';
    } else {
      h += '<div class="sz-pagee"><div class="pile" data-pages="questions-' + FILTRE + '">' + l.map(function(q){
        return '<div class="q' + (q.id === CHOIX ? ' sel' : '') + '" data-q="' + esc(q.id) + '" data-ctx-ligne="1">'
          + '<div class="h"><span class="p">' + esc(q.produit || '—') + '</span><span>' + esc(q.nom) + '</span>'
          + '<span class="d">' + esc(szJour(q.creeLe) || '') + '</span></div>'
          + '<div class="t">' + esc(q.question) + '</div></div>';
      }).join('') + '</div></div>';
    }
    h += '</div></div><div>' + detail() + '</div></div>';
    corps.innerHTML = h;
    var ta = document.getElementById('rep');
    if (ta) {
      ta.oninput = function(){ BROUILLON[CHOIX] = ta.value; majCompte(); };
      majCompte();
    }
  }
  function majCompte(){
    var ta = document.getElementById('rep'), c = document.getElementById('rep-cpt');
    if (ta && c) c.textContent = String(ta.value.length) + ' / 1500';
  }
  function detail(){
    var q = choisie();
    if (!q) return '<div class="carte pleine"><div class="vide">${T("Choisissez une question à gauche.")}</div></div>';
    var rep = (BROUILLON[q.id] != null) ? BROUILLON[q.id] : (q.reponse || '');
    var ro = !D.peutEcrire;
    var h = '<div class="carte pleine">'
      + '<div class="prod">' + szVignette(q.image, q.produit, '', q.produit)
      + '<div><div class="nm">' + esc(q.produit || '—') + '</div>' + (q.sku ? '<div class="sk">' + esc(q.sku) + '</div>' : '') + '</div></div>'
      + '<div class="lbl">${T("Question")}</div>'
      + '<div class="texte">' + esc(q.question) + '</div>'
      + '<div class="meta">' + esc(q.nom) + ' · ' + esc(szJour(q.creeLe) || '') + ' · ' + esc(ETATS[q.statut] || q.statut) + '</div>'
      + '<div class="lbl">${T("Réponse de l’équipe")}</div>'
      + '<textarea id="rep" maxlength="1500"' + (ro ? ' disabled' : '') + ' aria-label="${T("Réponse de l’équipe")}">' + esc(rep) + '</textarea>'
      + '<div class="cpt" id="rep-cpt"></div>'
      + (q.reponduLe ? '<div class="meta">' + '${T("Répondu le {0} par {1}")}'.replace('{0}', esc(szJour(q.reponduLe) || '')).replace('{1}', esc(q.reponduPar || '—')) + '</div>' : '')
      + '<div class="actions">'
      + '<button type="button" class="prim" data-a="publier"' + (ro ? ' disabled' : '') + '>' + (q.statut === 'publiee' ? '${T("Mettre à jour la réponse publiée")}' : '${T("Publier la réponse")}') + '</button>'
      + (q.statut !== 'publiee' ? '<button type="button" data-a="garder"' + (ro ? ' disabled' : '') + '>${T("Enregistrer sans publier")}</button>' : '')
      + (q.statut === 'publiee' ? '<button type="button" data-a="masquer"' + (ro ? ' disabled' : '') + '>${T("Masquer de la boutique")}</button>' : '')
      + (q.statut === 'masquee' && q.reponse ? '<button type="button" data-a="republier"' + (ro ? ' disabled' : '') + '>${T("Republier")}</button>' : '')
      + (D.peutSupprimer ? '<button type="button" class="danger droite" data-a="supprimer">${T("Supprimer")}</button>' : '')
      + '</div></div>';
    return h;
  }

  function agir(a){
    var q = choisie(); if (!q || OCCUPE) return;
    var ta = document.getElementById('rep');
    var rep = ta ? ta.value : (q.reponse || '');
    if (a === 'supprimer') {
      szConfirmer({ titre: '${T("Supprimer la question")}',
        texte: '${T("La question de {0} sur « {1} » sera supprimée définitivement, avec sa réponse. Elle disparaît de la boutique.")}'.replace('{0}', q.nom).replace('{1}', q.produit || '—'),
        oui: '${T("Supprimer la question")}', danger: true }).then(function(ok){ if (ok) envoyer('questions:supprimer', [q.id], '${T("Question supprimée.")}'); });
      return;
    }
    if (a === 'publier') {
      if (!String(rep).trim()) { dire(MOTIFS.reponse_requise, 'err'); if (ta) ta.focus(); return; }
      envoyer('questions:repondre', [q.id, rep, true], '${T("Réponse publiée : elle paraît sur la fiche du produit.")}');
    } else if (a === 'garder') {
      envoyer('questions:repondre', [q.id, rep, false], '${T("Réponse enregistrée, pas encore publiée.")}');
    } else if (a === 'masquer') {
      envoyer('questions:statut', [q.id, 'masquee'], '${T("Question masquée de la boutique.")}');
    } else if (a === 'republier') {
      envoyer('questions:statut', [q.id, 'publiee'], '${T("Question republiée.")}');
    }
  }
  function envoyer(op, args, bravo){
    OCCUPE = true; dire('${T("Enregistrement…")}', 'att');
    appeler(op, args).then(function(r){
      OCCUPE = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      delete BROUILLON[args[0]];
      dire(bravo, 'bon');
      charger(true);
    });
  }

  corps.onclick = function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var f = t.closest('[data-filtre]');
    if (f) { FILTRE = f.getAttribute('data-filtre'); CHOIX = ''; charger(false); return; }
    var a = t.closest('[data-a]');
    if (a && !a.disabled) { agir(a.getAttribute('data-a')); return; }
    var li = t.closest('[data-q]');
    if (li) { CHOIX = li.getAttribute('data-q'); dessiner(); }
  };

  function charger(garder){
    if (!garder) dire('${T("Lecture…")}', 'att');
    appeler('questions:donnees', [FILTRE]).then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; dire(expliquer(r), 'err'); return; }
      D = r;
      if (!garder) dire('');
      dessiner();
    });
  }
  window.szRevenir = function(){ charger(true); };
  document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); } });
  charger(false);
})();
</script>
</body></html>`;
}

module.exports = { pageQuestions };
