'use strict';

/*
 * FENÊTRE « CONFIGURATION DES RETOURS » — NATIVE (Configuration, palier 5)
 * =============================================================================
 * L'adresse où les clientes renvoient leurs colis, le nombre de jours autorisés
 * pour un retour (TOUJOURS un nombre PAIR : la première moitié permet un
 * remboursement au moyen de paiement d'origine, la seconde impose le crédit
 * boutique) et l'interrupteur du remboursement partiel en crédit.
 *
 * ⚠ AUCUN SECRET ICI : ce ne sont qu'une adresse et des réglages. Le cœur du
 * site écrit par la MÊME clé que l'écran web, donc pousse automatiquement vers
 * le nuage — aucun risque de perte, aucune divergence de stockage.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

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
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:grid;grid-template-columns:repeat(auto-fit,minmax(26rem,1fr));gap:1rem;align-content:start}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:1rem 1.1rem;min-width:0;display:flex;flex-direction:column}
.carte h2{margin:0 0 .1rem;font:700 .8rem/1.2 system-ui;text-transform:uppercase;letter-spacing:.05em;color:var(--tx-bleute)}
.carte .sous{margin:0 0 .9rem;font-size:.78rem;color:var(--tx3)}
.ch{margin:0 0 .85rem}
.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.25rem;font-size:.78rem;color:var(--tx2)}
.ch .aide{font-size:.72rem;color:var(--tx3);margin-top:.2rem}
.ch input[type=number]{width:12rem;max-width:100%;font:inherit;color:var(--tx);background:var(--f-champ);
  border:1px solid #2b3444;border-radius:8px;padding:.42rem .55rem}
.ch input[type=text]{width:100%;font:inherit;color:var(--tx);background:var(--f-champ);
  border:1px solid #2b3444;border-radius:8px;padding:.42rem .55rem}
.ch input:focus{outline:none;border-color:#c9a97e}
.ch input:disabled{opacity:.55}
.gr{display:grid;grid-template-columns:1fr 1fr;gap:.6rem .7rem}
.gr .ch{margin:0}
.gr .plein{grid-column:1/-1}
.bascule{display:flex;align-items:flex-start;gap:.6rem;font-size:.86rem;cursor:pointer;
  -webkit-user-select:none;user-select:none}
.bascule input{width:1.1rem;height:1.1rem;accent-color:#c9a97e;cursor:pointer;margin-top:.15rem;flex:0 0 auto}
.bascule .d{font-size:.74rem;color:var(--tx3);display:block;margin-top:.1rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
.vide{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageConfigRetours() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Configuration des retours — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.returns}</span><h1>Configuration des retours</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter les réglages, pas les modifier.</div>
<div class="corps" id="corps"><div class="carte"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-save" disabled>Enregistrer</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  /* ── MODE ANCRE ── le meme bouton d'ancrage/detachement que les autres ecrans. */
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
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
      t.appendChild(b);
    }
    if (actif) {
      b.textContent = '⧉ Détacher';
      b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '⚓ Ancrer';
      b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var bsave = document.getElementById('b-save');
  var D = null, RO = false, OCCUPE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule : les retours ne peuvent pas être modifiés.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    nuage:              'L’enregistrement dans le nuage a échoué. Réessayez.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').'))
      + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  /* Aperçu vivant de la moitie : la moitie des jours (arrondie au pair superieur)
     est la periode ou le remboursement au moyen d'origine reste possible. */
  function majMoitie(){
    var e = document.getElementById('f-days');
    var h = document.getElementById('half');
    if (!e || !h) return;
    var v = parseInt(e.value, 10) || 0;
    if (v % 2 !== 0) v += 1;
    h.textContent = v / 2;
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    var d = D || {};
    var dis = RO ? ' disabled' : '';
    var half = d.halfDays != null ? d.halfDays : (Math.ceil((d.windowDays || 30) / 2));
    var h = [];

    if (!d.configuree) {
      h.push('<div class="carte" style="grid-column:1/-1;border-color:rgba(240,180,80,.35);background:rgba(200,140,40,.08)">'
        + '<div style="font-size:.82rem;color:var(--tx-or2)"><span class="ic">⚠</span> Adresse de retour non configurée — renseignez-la pour pouvoir guider les clients qui renvoient un colis.</div></div>');
    }

    h.push('<div class="carte"><h2>Fenêtre de retour</h2>'
      + '<p class="sous">Compté à partir de la réception de la commande. Doit être un nombre pair.</p>'
      + '<div class="ch"><label>Nombre de jours autorisés pour un retour</label>'
      + '<input id="f-days" type="number" min="2" max="364" step="2" value="' + esc(d.windowDays == null ? '' : d.windowDays) + '"' + dis + '>'
      + '<div class="aide">La <strong>moitié</strong> (<span id="half">' + esc(half) + '</span> jours) permet le remboursement au moyen d’origine ; au-delà, crédit boutique.</div></div>'
      + '<div class="ch" style="margin-top:.85rem"><label class="bascule"><input type="checkbox" id="f-split"' + (d.splitRefundEnabled ? ' checked' : '') + dis + '>'
      + '<span><strong>Remboursement partiel en crédit boutique</strong>'
      + '<span class="d">Durant la première moitié : remboursement au moyen d’origine OU crédit boutique, au choix du client. Ensuite : crédit boutique uniquement. S’affiche dans la politique, les factures, le courriel et le portail client.</span></span></label></div></div>');

    h.push('<div class="carte"><h2>Adresse de renvoi</h2>'
      + '<p class="sous">L’adresse imprimée sur l’étiquette de retour et citée aux clients.</p>'
      + '<div class="gr">'
      + '<div class="ch plein"><label>Nom de l’entreprise</label><input type="text" id="f-name" value="' + esc(d.name) + '"' + dis + '></div>'
      + '<div class="ch plein"><label>Rue</label><input type="text" id="f-street" value="' + esc(d.street) + '"' + dis + '></div>'
      + '<div class="ch"><label>Ville</label><input type="text" id="f-city" value="' + esc(d.city) + '"' + dis + '></div>'
      + '<div class="ch"><label>Province</label><input type="text" id="f-province" value="' + esc(d.province) + '"' + dis + '></div>'
      + '<div class="ch"><label>Code postal</label><input type="text" id="f-postal" value="' + esc(d.postal) + '"' + dis + '></div>'
      + '<div class="ch"><label>Pays</label><input type="text" id="f-country" value="' + esc(d.country) + '"' + dis + '></div>'
      + '</div></div>');

    corps.innerHTML = h.join('');
    var fd = document.getElementById('f-days');
    if (fd) fd.oninput = majMoitie;
    bsave.disabled = RO || OCCUPE;
  }

  function enregistrer(){
    if (RO || OCCUPE) return;
    var chk = function(id){ var e = document.getElementById(id); return !!(e && e.checked); };
    var val = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    OCCUPE = true; bsave.disabled = true; dire('Enregistrement…');
    appeler('config:retours:ecrire', [{
      windowDays: val('f-days'), splitRefundEnabled: chk('f-split'),
      name: val('f-name'), street: val('f-street'), city: val('f-city'),
      province: val('f-province'), postal: val('f-postal'), country: val('f-country') }]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) {
        D = r; RO = !r.peutModifier; dessiner();
        dire(r.ajuste ? 'Enregistré — jours ajustés au pair supérieur (' + r.windowDays + ').' : 'Retours enregistrés.', 'bon');
      } else { bsave.disabled = RO; dire(expliquer(r), 'err'); }
    });
  }
  bsave.onclick = enregistrer;

  function charger(){
    dire('Lecture…');
    appeler('config:retours:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r; RO = !r.peutModifier; dessiner(); dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageConfigRetours };
