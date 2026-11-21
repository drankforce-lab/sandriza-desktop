'use strict';
/*
 * RELANCE DES CLIENTS ENDORMIS — fenêtre native (2026-11-20)
 * =============================================================================
 * Module choisi sur la page « Douze nouveaux modules ». Le moteur vit côté site
 * (assets/js/relance.js) : il trouve les clients qui ont acheté mais plus depuis
 * `seuil` jours, choisit trois nouveautés de leur taille, compose le courriel et
 * l'envoie par l'infolettre. Cette fenêtre affiche, coche et demande.
 *
 *   relance:donnees  → { candidats[], bilan, reglages, envoiPossible, peutEnvoyer }
 *   relance:apercu   (id)        → { sujet, html, courriel }
 *   relance:envoyer  ([ids])     → { envoyes, echecs[] }
 *   relance:reglages (reglages)  → { ok }
 *
 * ⚠ CONSENTEMENT : seuls les abonnés actifs de l'infolettre sont cochables ; les
 * autres restent visibles, grisés, avec la raison.
 * ⚠ AUCUNE GLISSIÈRE : la liste est paginée par le socle (data-pages).
 *
 * États d'ouverture (bancs de rendu) : 'reglages', 'apercu', 'historique'.
 */
const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
const T = require('../langue').tr('relance');

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
.tete .cx-actions{margin-left:auto;display:flex;gap:.5rem}
select,input,button,textarea{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;
  padding:.32rem .55rem;cursor:pointer}
input,textarea{cursor:text}
input[type=checkbox]{width:auto;padding:0;cursor:pointer}
textarea{resize:none}
select:focus,input:focus,button:focus,textarea:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
#corps{flex:1 1 auto;min-height:0;overflow:hidden;padding:.9rem 1.1rem .7rem;display:flex;flex-direction:column;gap:.75rem}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.8rem}
.msg.bon{color:var(--tx-ok)} .msg.err{color:var(--tx-err)}
.onglets{display:flex;gap:1rem;border-bottom:1px solid var(--v08)}
.onglets button{background:transparent;border:0;border-bottom:2px solid transparent;border-radius:0;padding:.35rem 0;color:var(--tx2);font-weight:600}
.onglets button.actif{color:var(--tx);border-bottom-color:var(--or)}
.onglets button span{margin-left:.35rem;font-size:.7rem;padding:0 .4rem;border-radius:99px;background:var(--v08);color:var(--tx2)}
.bilan{font-size:.84rem;color:var(--tx2)}
.bilan b{color:var(--tx)}
.avis{font-size:.82rem;color:var(--tx-att);margin:0}
.reg{background:var(--f-carte);border:1px solid rgba(var(--or-rgb),.35);border-radius:14px;padding:.9rem 1rem;flex:0 0 auto}
.reg h2{margin:0 0 .7rem;font-size:.95rem}
.chps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem .8rem}
.ch{display:flex;flex-direction:column;gap:.22rem;min-width:0}
.ch.l3{grid-column:1/-1}
.ch label{font-size:.75rem;color:var(--tx2);font-weight:600}
.ch input,.ch textarea{width:100%}
.ch small{font-size:.72rem;color:var(--tx3)}
.f-act{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.8rem}
.tab-z{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2);padding:.45rem .5rem;border-bottom:1px solid var(--v08);font-weight:700}
tbody td{padding:.5rem .5rem;border-bottom:1px solid var(--v05);vertical-align:middle}
/* Les lignes non cochables ne sont PAS estompées (le contraste tomberait sous 4,5) : la pastille et l absence de case suffisent. */
.cl{display:flex;align-items:center;gap:.55rem;min-width:0}
.rl-av{width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:800;flex:0 0 auto;
  background:var(--v08);color:var(--tx2)}
.cl>div>b{display:block;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}
.cl>div>span{display:block;font-size:.74rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}
.num{font-variant-numeric:tabular-nums;white-space:nowrap}
.sug{font-size:.74rem;color:var(--tx2);max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pill{display:inline-flex;font-size:.7rem;font-weight:700;padding:.1rem .5rem;border-radius:999px;white-space:nowrap;background:var(--v08);color:var(--tx2)}
.pill.pret{background:rgba(96,165,250,.14);color:var(--tx-bleu)}
.pill.revenu{background:rgba(74,222,128,.14);color:var(--tx-ok)}
html.jour .pill,html.jour .onglets button span,html.jour .rl-av{color:#47505e} html.jour .pill.pret{color:#2f5f96} html.jour .pill.revenu{color:#1d6a3b}
.vide-r{display:flex;flex-direction:column;align-items:center;text-align:center;gap:.6rem;padding:2rem 1rem}
.vide-r .vr-ic{width:56px;height:56px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;
  background:rgba(var(--or-rgb),.14);color:var(--or);box-shadow:inset 0 0 0 1px rgba(var(--or-rgb),.3)}
.vide-r .vr-ic svg{width:28px;height:28px}
.vide-r h2{margin:.2rem 0 0;font-size:1.05rem}
.vide-r p{margin:0;max-width:34rem;color:var(--tx2)}
.voile{position:fixed;inset:0;background:rgba(5,8,14,.62);display:flex;align-items:center;justify-content:center;z-index:50;padding:1.2rem}
.boite{background:var(--f-carte);border:1px solid var(--v16);border-radius:16px;width:min(720px,100%);height:min(640px,100%);display:flex;flex-direction:column;overflow:hidden}
.boite .bt{display:flex;align-items:center;gap:.6rem;padding:.75rem 1rem;border-bottom:1px solid var(--v08)}
.boite .bt div{flex:1;min-width:0}
.boite .bt b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.boite .bt span{font-size:.76rem;color:var(--tx2)}
.boite iframe{flex:1 1 auto;border:0;background:#ffffff;width:100%}
.boite .bb{display:flex;gap:.5rem;justify-content:flex-end;padding:.7rem 1rem;border-top:1px solid var(--v08)}
`;

/* ⚠ (2026-11-22, sa décision : « déplacer vraiment ») LES RÉGLAGES DE LA RELANCE NE SONT PLUS DANS LE MODULE : ils vivent
   dans Configuration › Modules › Relance des clients, qui ouvre CETTE page en mode 'config-seul' (le formulaire seul).
   Le module n a plus de bouton « Réglages ». */
function pageRelance(ouverture) {
  const ok = ['reglages', 'apercu', 'historique', 'config-seul'];
  const etat = ok.indexOf(String(ouverture || '')) >= 0 ? String(ouverture) : '';
  const seul = (etat === 'config-seul');
  return `${TETE()}
<title>${seul ? T("Réglages de la relance — Administration Sandriza") : T("Relance des clients endormis — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.relance}</span><h1>${seul ? T("Réglages de la relance") : T("Relance des clients endormis")}</h1>
  <span class="cx-resume" id="sous"></span><div class="cx-actions" id="outils"></div></div>
<div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<div id="voile"></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var elOutils = document.getElementById('outils');
  var elSous = document.getElementById('sous');
  var elVoile = document.getElementById('voile');
  var D = null;
  var ETAT = '${etat}';
  var LIEU = '${LIEU()}';
  var ONGLET = 'liste';
  var SEUL = ${seul ? 'true' : 'false'};
  var REG = null;            /* les réglages en cours de saisie (null : panneau fermé) */
  var SEL = {};              /* les clients cochés */
  var OCCUPE = false;
  var APERCU = null;         /* { id, sujet, html, courriel } */

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

  var MOTIFS = {
    maj_en_cours:       '${T("Une mise à jour s’installe : cette opération est suspendue jusqu’au redémarrage de l’application.")}',
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas d’envoyer des relances.")}',
    indisponible:       '${T("Le module de relance n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    resend:             '${T("L’envoi de courriels n’est pas configuré (Infolettre, Configuration : clé Resend et adresse d’envoi).")}',
    pause:              '${T("Les envois automatiques sont en pause dans les réglages des courriels.")}',
    plafond:            '${T("Le plafond doit être plus grand que le seuil.")}',
    introuvable:        '${T("Ce client n’est plus dans la liste des endormis. La liste a été relue.")}',
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

  var ETATS = {
    pret: '${T("Prêt")}',
    sans_consentement: '${T("Sans consentement")}',
    deja_relance: '${T("Relancé le {0}")}'
  };
  function initiales(n){
    var p = String(n || '?').trim().split(' ').filter(function(x){ return x; });
    return ((p[0] || '?').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase();
  }
  function jour(s){
    var p = String(s || '').slice(0, 10).split('-');
    if (p.length !== 3) return String(s || '');
    try { return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(LIEU, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return s; }
  }
  function cat(c){ c = String(c || ''); return c ? szTd(c.charAt(0).toUpperCase() + c.slice(1)) : ''; }
  function nb(v){ try { return Number(v || 0).toLocaleString(LIEU, { maximumFractionDigits: 1 }); } catch (e) { return String(v); } }
  function prets(){ return ((D && D.candidats) || []).filter(function(c){ return c.etat === 'pret'; }); }
  function nbSel(){ return Object.keys(SEL).filter(function(k){ return SEL[k]; }).length; }

  function outils(){
    if (!D) { elOutils.innerHTML = ''; return; }
    var n = nbSel();
    if (SEUL) { elOutils.innerHTML = ''; return; }
    elOutils.innerHTML = ''
      + (D.peutEnvoyer ? '<button type="button" class="prim" id="r-envoyer"' + (n ? '' : ' disabled') + '>' + '${T("Relancer la sélection ({0})")}'.split('{0}').join(String(n)) + '</button>' : '');
  }
  function bilan(){
    var b = (D && D.bilan) || {};
    if (!b.envoyes90) return '<div class="bilan">${T("Aucune relance ces 90 derniers jours : le résultat de chaque envoi s’affichera ici.")}</div>';
    return '<div class="bilan">' + '${T("90 derniers jours : {0} relancés, {1} revenus ({2} %), {3} de ventes.")}'
      .split('{0}').join('<b>' + b.envoyes90 + '</b>').split('{1}').join('<b>' + b.revenus + '</b>')
      .split('{2}').join('<b>' + esc(nb(b.taux)) + '</b>').split('{3}').join('<b>' + esc(szArgent(b.montant)) + '</b>') + '</div>';
  }
  function reglages(){
    var r = REG;
    return '<form class="reg" id="f-reg" onsubmit="return false"><h2>${T("Réglages de la relance")}</h2><div class="chps">'
      + '<div class="ch"><label for="g-seuil">${T("Endormi après (jours)")}</label><input id="g-seuil" inputmode="numeric" value="' + esc(r.seuil) + '"></div>'
      + '<div class="ch"><label for="g-plafond">${T("Ignoré après (jours)")}</label><input id="g-plafond" inputmode="numeric" value="' + esc(r.plafond) + '"><small>${T("Au-delà, le client est perdu de vue.")}</small></div>'
      + '<div class="ch"><label for="g-delai">${T("Pas de nouvelle relance avant (jours)")}</label><input id="g-delai" inputmode="numeric" value="' + esc(r.delai) + '"></div>'
      + '<div class="ch l3"><label for="g-sujet">${T("Objet du courriel")}</label><input id="g-sujet" maxlength="140" value="' + esc(r.sujet) + '"><small>${T("{prenom} est remplacé par le prénom du client.")}</small></div>'
      + '<div class="ch l3"><label for="g-mot">${T("Le mot d’introduction")}</label><textarea id="g-mot" rows="2" maxlength="600">' + esc(r.mot) + '</textarea></div>'
      + '<div class="ch"><label for="g-code">${T("Code promo offert (facultatif)")}</label><input id="g-code" maxlength="30" value="' + esc(r.code) + '"></div>'
      + '</div><div class="f-act"><button type="button" id="g-annuler">${T("Annuler")}</button><button type="button" class="prim" id="g-ok">${T("Enregistrer")}</button></div></form>';
  }
  function ligne(c){
    var coch = c.etat === 'pret' && D.peutEnvoyer;
    var et = c.etat === 'deja_relance' ? ETATS.deja_relance.split('{0}').join(jour(c.dateRelance)) : (ETATS[c.etat] || '');
    var sug = (c.suggestions || []).map(function(p){ return p.nom; }).join(' · ');
    var gout = [c.taille ? '${T("Taille")} ' + c.taille : '', c.categorie ? cat(c.categorie) : ''].filter(function(x){ return x; }).join(' · ');
    return '<tr data-cl="' + esc(c.id) + '"' + (c.etat === 'pret' ? '' : ' class="non"') + '>'
      + '<td>' + (coch ? '<input type="checkbox" data-coche="' + esc(c.id) + '"' + (SEL[c.id] ? ' checked' : '') + ' aria-label="' + esc(c.nom) + '">' : '') + '</td>'
      + '<td><div class="cl"><span class="rl-av">' + esc(initiales(c.nom)) + '</span><div><b>' + esc(c.nom) + '</b><span>' + esc(c.courriel) + '</span></div></div></td>'
      + '<td class="num">' + '${T("il y a {0} jours")}'.split('{0}').join(String(c.joursDepuis)) + '</td>'
      + '<td class="num">' + c.commandes + '</td>'
      + '<td class="num">' + esc(szArgent(c.total)) + '</td>'
      + '<td><div class="sug">' + esc(gout) + (sug ? '<br>' + esc(sug) : '') + '</div></td>'
      + '<td><span class="pill ' + esc(c.etat === 'pret' ? 'pret' : '') + '">' + esc(et) + '</span></td>'
      + '<td>' + (c.etat === 'pret' ? '<button type="button" data-apercu="' + esc(c.id) + '">${T("Aperçu")}</button>' : '') + '</td></tr>';
  }
  function historique(){
    var L = ((D && D.bilan) || {}).historique || [];
    if (!L.length) return '<div class="vide-r"><span class="vr-ic" aria-hidden="true">${ICO.relance}</span><h2>${T("Aucune relance envoyée")}</h2><p>${T("Chaque envoi apparaîtra ici, avec la commande qui a suivi s’il y en a une.")}</p></div>';
    return '<div class="tab-z"><table><thead><tr><th>${T("Client")}</th><th>${T("Relancé le")}</th><th>${T("Résultat")}</th><th>${T("Ventes qui ont suivi")}</th></tr></thead><tbody data-pages="relance-hist">'
      + L.map(function(h){
        return '<tr><td>' + esc(h.nom) + '</td><td class="num">' + esc(jour(h.date)) + '</td>'
          + '<td><span class="pill ' + (h.revenu ? 'revenu' : '') + '">' + (h.revenu ? '${T("Revenu")}' : '${T("Pas encore")}') + '</span></td>'
          + '<td class="num">' + (h.revenu ? esc(szArgent(h.montant)) : '—') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function dessiner(){
    outils();
    if (!D) return;
    if (SEUL) {
      if (!REG) REG = Object.assign({}, D.reglages || {});
      elSous.textContent = '';
      corps.innerHTML = '<p class="avis" style="color:var(--tx2)">${T("Ces réglages s’appliquent au module Relance des clients endormis (menu Marketing).")}</p>' + reglages();
      return;
    }
    var C = D.candidats || [];
    var np = prets().length;
    elSous.textContent = C.length ? '${T("{0} endormis · {1} prêts à relancer")}'.split('{0}').join(String(C.length)).split('{1}').join(String(np)) : '';
    var h = '';
    if (!D.envoiPossible) h += '<p class="avis">' + esc(MOTIFS.resend) + '</p>';
    if (REG) h += reglages();
    h += '<div class="onglets" role="tablist"><button type="button" role="tab" data-onglet="liste" class="' + (ONGLET === 'liste' ? 'actif' : '') + '">${T("À relancer")}<span>' + np + '</span></button>'
      + '<button type="button" role="tab" data-onglet="historique" class="' + (ONGLET === 'historique' ? 'actif' : '') + '">${T("Historique")}</button></div>';
    h += bilan();
    if (ONGLET === 'historique') { corps.innerHTML = h + historique(); return; }
    if (!C.length) {
      h += '<div class="vide-r"><span class="vr-ic" aria-hidden="true">${ICO.relance}</span><h2>${T("Personne ne dort")}</h2>'
        + '<p>' + '${T("Aucun client n’a laissé passer plus de {0} jours sans acheter. Revenez la semaine prochaine.")}'.split('{0}').join(String((D.reglages || {}).seuil || 90)) + '</p></div>';
      corps.innerHTML = h; return;
    }
    var tousCoches = np > 0 && prets().every(function(c){ return SEL[c.id]; });
    h += '<div class="tab-z"><table><thead><tr><th>' + (np && D.peutEnvoyer ? '<input type="checkbox" id="r-tout"' + (tousCoches ? ' checked' : '') + ' aria-label="${T("Tout cocher")}">' : '') + '</th>'
      + '<th>${T("Client")}</th><th>${T("Dernier achat")}</th><th>${T("Commandes")}</th><th>${T("Achats")}</th><th>${T("Ses goûts et nos suggestions")}</th><th>${T("État")}</th><th></th></tr></thead>'
      + '<tbody data-pages="relance">' + C.map(ligne).join('') + '</tbody></table></div>';
    corps.innerHTML = h;
  }
  function boite(){
    if (!APERCU) { elVoile.innerHTML = ''; return; }
    elVoile.innerHTML = '<div class="voile"><div class="boite" role="dialog" aria-label="${T("Aperçu du courriel")}"><div class="bt"><div><b>' + esc(APERCU.sujet) + '</b><span>' + '${T("À : {0}")}'.split('{0}').join(esc(APERCU.courriel)) + '</span></div></div>'
      + '<iframe id="r-cadre" sandbox="" title="${T("Aperçu du courriel")}"></iframe>'
      + '<div class="bb"><button type="button" id="a-fermer">${T("Fermer")}</button>' + (D && D.peutEnvoyer ? '<button type="button" class="prim" id="a-envoyer">${T("Envoyer à ce client")}</button>' : '') + '</div></div></div>';
    var f = document.getElementById('r-cadre'); if (f) f.srcdoc = APERCU.html || '';
  }

  function charger(){
    appeler('relance:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; elOutils.innerHTML = ''; return; }
      D = r;
      var gardes = {}; prets().forEach(function(c){ if (SEL[c.id]) gardes[c.id] = true; }); SEL = gardes;
      if (ETAT === 'reglages') REG = Object.assign({}, D.reglages || {});
      if (ETAT === 'historique') ONGLET = 'historique';
      var ouvrir = ETAT === 'apercu' && prets()[0] ? prets()[0].id : '';
      ETAT = '';
      dessiner();
      if (ouvrir) apercu(ouvrir);
    });
  }
  function apercu(id){
    appeler('relance:apercu', [id]).then(function(r){
      if (!r.ok) { szDire(expliquer(r), 'err'); return; }
      APERCU = { id: id, sujet: r.sujet, html: r.html, courriel: r.courriel };
      boite();
    });
  }
  function envoyer(ids, btn){
    if (OCCUPE || !ids.length) return;
    szConfirmer({ titre: '${T("Envoyer les relances")}',
      texte: '${T("{0} courriel(s) partiront maintenant, chacun avec ses suggestions et son lien de désabonnement.")}'.split('{0}').join(String(ids.length)),
      oui: '${T("Envoyer")}' }).then(function(oui){
      if (!oui) return;
      OCCUPE = true; if (btn) btn.disabled = true;
      szDire('${T("Envoi en cours…")}');
      appeler('relance:envoyer', [ids]).then(function(r){
        OCCUPE = false; if (btn) btn.disabled = false;
        if (!r.ok) { szDire(expliquer(r), 'err'); return; }
        var t = '${T("{0} relance(s) envoyée(s).")}'.split('{0}').join(String(r.envoyes || 0));
        if (r.echecs && r.echecs.length) t += ' ' + '${T("{0} non envoyée(s).")}'.split('{0}').join(String(r.echecs.length));
        if (r.nuage === false) t += ' ' + MOTIFS.nuage;
        szDire(t, (r.echecs && r.echecs.length) || r.nuage === false ? 'err' : 'bon');
        SEL = {}; APERCU = null; boite(); charger();
      });
    });
  }
  function ramasserReg(){
    if (!REG) return;
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : null; };
    var x;
    if ((x = v('g-seuil')) != null) REG.seuil = x;
    if ((x = v('g-plafond')) != null) REG.plafond = x;
    if ((x = v('g-delai')) != null) REG.delai = x;
    if ((x = v('g-sujet')) != null) REG.sujet = x;
    if ((x = v('g-mot')) != null) REG.mot = x;
    if ((x = v('g-code')) != null) REG.code = x;
  }

  document.addEventListener('click', function(ev){
    var t = ev.target && ev.target.closest ? ev.target.closest('button') : null;
    if (!t) return;
    if (t.id === 'r-reglages') { REG = REG ? null : Object.assign({}, (D && D.reglages) || {}); dessiner(); return; }
    if (t.id === 'g-annuler') { REG = null; dessiner(); if (SEUL && P && P.fermer) P.fermer(); return; }
    if (t.id === 'g-ok') {
      ramasserReg(); if (OCCUPE) return; OCCUPE = true; t.disabled = true;
      appeler('relance:reglages', [REG]).then(function(r){
        OCCUPE = false; t.disabled = false;
        if (!r.ok) { szDire(expliquer(r), 'err'); return; }
        szDire('${T("Réglages enregistrés.")}', 'bon'); REG = null; charger();
      });
      return;
    }
    if (t.id === 'r-envoyer') { envoyer(Object.keys(SEL).filter(function(k){ return SEL[k]; }), t); return; }
    if (t.id === 'a-fermer') { APERCU = null; boite(); return; }
    if (t.id === 'a-envoyer' && APERCU) { envoyer([APERCU.id], t); return; }
    var x;
    if ((x = t.getAttribute('data-apercu'))) { apercu(x); return; }
    if ((x = t.getAttribute('data-onglet'))) { ONGLET = x; dessiner(); return; }
  });
  document.addEventListener('change', function(ev){
    var t = ev.target; if (!t) return;
    if (t.id === 'r-tout') { var on = !!t.checked; SEL = {}; if (on) prets().forEach(function(c){ SEL[c.id] = true; }); dessiner(); return; }
    var id = t.getAttribute && t.getAttribute('data-coche');
    if (id) { SEL[id] = !!t.checked; outils(); return; }
  });
  document.addEventListener('input', function(){ ramasserReg(); });
  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape') return;
    if (document.querySelector('.szc-voile')) return;
    ev.preventDefault();
    if (APERCU) { APERCU = null; boite(); return; }
    if (REG && !SEUL) { REG = null; dessiner(); return; }
    if (P && P.fermer) P.fermer();
  });
  function rechargerSiLibre(){ if (!OCCUPE && !REG && !APERCU) charger(); }
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

module.exports = { pageRelance };
