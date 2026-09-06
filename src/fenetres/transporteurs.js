'use strict';

/*
 * FENÊTRE « TRANSPORTEURS » — NATIVE (Livraison, palier 5)
 * =============================================================================
 * Les identifiants des cinq transporteurs (Postes Canada, Purolator, FedEx, UPS,
 * Canpar), le jeton Mapbox (autocomplétion d'adresse à la caisse) et l'adresse
 * expéditeur.
 *
 * ⚠⚠ UN SECRET NE TRAVERSE PAS LE PONT : les mots de passe / secrets ne sont
 * rendus que « défini + 4 derniers ». Un champ secret laissé VIDE veut dire
 * « garde celui qui est enregistré ». Les identifiants NON secrets (utilisateur,
 * Client ID, n° de compte, environnement, adresse, jeton Mapbox public) voyagent
 * en clair — on doit pouvoir les corriger.
 *
 * ⚠⚠ FILET ANTI-PERTE : si la config complète (avec secrets) n'a pas pu être
 * rechargée cette session, le cœur REFUSE d'écrire et rend `charge:false`. La
 * fenêtre affiche alors « Identifiants non chargés » + « Réessayer » plutôt que
 * de laisser enregistrer un formulaire dépouillé (qui effacerait les secrets).
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
.avert{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(248,113,113,.4);
  background:rgba(248,113,113,.1);color:var(--tx-err2);border-radius:9px;padding:.7rem .85rem;font-size:.8rem;line-height:1.5}
.avert b{color:var(--tx-err2)}
.avert .g{margin-top:.55rem}
.avert button{font:inherit;font-size:.78rem;color:var(--tx-err2);background:rgba(248,113,113,.08);
  border:1px solid rgba(248,113,113,.4);border-radius:7px;padding:.24rem .6rem;cursor:pointer}
.avert button:hover:not(:disabled){background:rgba(248,113,113,.16)}
/* Disposition en COLONNES (type maçonnerie) : les cartes courtes (Purolator, UPS…)
   s'empilent sous la précédente au lieu de s'aligner par rangée sur la hauteur de
   Postes Canada — plus d'espace mort sous une carte courte. */
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  columns:30rem;column-gap:1rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.9rem 1rem;min-width:0;display:flex;flex-direction:column;
  break-inside:avoid;-webkit-column-break-inside:avoid;margin-bottom:1rem}
.carte .th{display:flex;align-items:center;gap:.5rem;margin:0 0 .3rem}
/* ⚠ Emoji en GRIS, jamais en couleur (préférence 2026-08-11). */
.carte h2{margin:0;font:700 .85rem/1.2 system-ui}
.carte .bascule{margin-left:auto;display:flex;align-items:center;gap:.4rem;font-size:.8rem;cursor:pointer;
  -webkit-user-select:none;user-select:none}
.carte .bascule input{accent-color:#c9a97e;cursor:pointer}
.info{background:rgba(80,120,190,.1);border:1px solid rgba(120,160,220,.28);color:#bcd2f0;
  border-radius:8px;padding:.5rem .65rem;font-size:.74rem;line-height:1.5;margin:0 0 .7rem}
.gr2{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.ch{margin:0 0 .6rem}
.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.22rem;font-size:.75rem;color:var(--tx2)}
.ch input,.ch select{width:100%;font:inherit;font-size:.83rem;color:var(--tx);background:var(--f-champ);
  border:1px solid var(--v12);border-radius:8px;padding:.4rem .5rem}
.ch input.mono{font-family:ui-monospace,Consolas,monospace}
.ch input:focus,.ch select:focus{outline:none;border-color:#c9a97e}
.ch input:disabled,.ch select:disabled{opacity:.55}
.ch .etat{font-size:.72rem;color:var(--tx2);margin-top:.2rem}
.ch .etat b{color:var(--tx-ok)}
.ch .etat.non b{color:var(--tx-jaune)}
.ch .aide{font-size:.7rem;color:var(--tx3);margin-top:.18rem}
.sep{border:0;border-top:1px solid var(--v08);margin:.7rem 0 .5rem}
.stitre{font-size:.78rem;font-weight:700;color:var(--tx-bleute);margin:0 0 .5rem}
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

function pageTransporteurs() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Transporteurs — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.shipping}</span><h1>Transporteurs</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
<div class="avert" id="avert" hidden></div>
<div class="corps" id="corps"><div class="carte"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div></div>
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
      b.id = 'sz-detacher'; b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);'
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
      t.appendChild(b);
    }
    if (actif) { b.textContent = '⧉ Détacher'; b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); }; }
    else { b.textContent = '⚓ Ancrer'; b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var bsave = document.getElementById('b-save');
  var avertEl = document.getElementById('avert');
  var D = null, RO = false, OCCUPE = false;
  var PROVS = ['QC','ON','BC','AB','MB','SK','NS','NB','NL','PE','NT','NU','YT'];

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule.',
    non_charge:         'Les identifiants n’ont pas pu être rechargés. Cliquez « Réessayer » avant d’enregistrer.',
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
  function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }
  function chk(id){ var e = document.getElementById(id); return !!(e && e.checked); }

  // Un champ SECRET (masqué) : « inchangé » si déjà défini, vide = conservé.
  function secretHtml(id, label, mask, place){
    var m = mask || { defini: false, fin: '' };
    return '<div class="ch"><label>' + esc(label) + '</label>'
      + '<input class="mono" id="' + id + '" type="password" value="" placeholder="'
      + (m.defini ? 'inchangé' : esc(place || '')) + '" autocomplete="off"' + (RO ? ' disabled' : '') + '>'
      + '<div class="etat' + (m.defini ? '' : ' non') + '">'
      + (m.defini ? 'Enregistré (se termine par <b>' + esc(m.fin) + '</b>). Vide = conservé.'
                  : 'Aucun secret <b>enregistré</b>.') + '</div></div>';
  }
  function texteHtml(id, label, v, place, mono, aide){
    return '<div class="ch"><label>' + esc(label) + '</label>'
      + '<input' + (mono ? ' class="mono"' : '') + ' id="' + id + '" value="' + esc(v || '') + '" placeholder="'
      + esc(place || '') + '"' + (RO ? ' disabled' : '') + '>'
      + (aide ? '<div class="aide">' + aide + '</div>' : '') + '</div>';
  }
  function basculeHtml(id, actif){
    return '<label class="bascule"><input type="checkbox" id="' + id + '"' + (actif ? ' checked' : '')
      + (RO ? ' disabled' : '') + '> Activer</label>';
  }

  // Les quatre transporteurs « simples » (identifiant + secret + n° de compte).
  var SIMPLES = [
    { cle: 'purolator', titre: 'Purolator', enId: 'pur-en',
      user: { id: 'pur-user', label: 'Nom d’utilisateur', champ: 'apiUsername', place: 'votre_identifiant' },
      sec:  { id: 'pur-pass', label: 'Mot de passe', champ: 'motDePasse', place: '••••••••' },
      acct: { id: 'pur-acct', label: 'Numéro de compte', place: 'Ex : 12345678' } },
    { cle: 'fedex', titre: 'FedEx', enId: 'fdx-en',
      user: { id: 'fdx-cid', label: 'Client ID', champ: 'clientId', place: 'l7xxXXXXXXXX' },
      sec:  { id: 'fdx-sec', label: 'Client Secret', champ: 'clientSecret', place: '••••••••' },
      acct: { id: 'fdx-acct', label: 'Numéro de compte', place: 'Ex : 123456789' },
      mode: { id: 'fdx-mode' } },
    { cle: 'ups', titre: 'UPS', enId: 'ups-en',
      user: { id: 'ups-cid', label: 'Client ID', champ: 'clientId', place: 'votre_client_id' },
      sec:  { id: 'ups-sec', label: 'Client Secret', champ: 'clientSecret', place: '••••••••' },
      acct: { id: 'ups-acct', label: 'Numéro de compte (optionnel)', place: 'Ex : A1B2C3' } },
    { cle: 'canpar', titre: 'Canpar', enId: 'can-en',
      user: { id: 'can-user', label: 'Nom d’utilisateur', champ: 'apiUsername', place: 'votre@courriel.com' },
      sec:  { id: 'can-pass', label: 'Mot de passe', champ: 'motDePasse', place: '••••••••' },
      acct: { id: 'can-acct', label: 'Numéro de compte (optionnel)', place: 'Ex : 99999' } },
  ];

  function carteSimpleHtml(sp){
    var d = (D.carriers || {})[sp.cle] || {};
    var h = '<div class="carte"><div class="th">'
      + '<h2>' + esc(sp.titre) + '</h2>' + basculeHtml(sp.enId, d.enabled) + '</div>';
    h += '<div class="gr2">'
      + texteHtml(sp.user.id, sp.user.label, d[sp.user.champ], sp.user.place, true)
      + secretHtml(sp.sec.id, sp.sec.label, d[sp.sec.champ], sp.sec.place) + '</div>';
    if (sp.mode) {
      h += '<div class="gr2">'
        + texteHtml(sp.acct.id, sp.acct.label, d.accountNumber, sp.acct.place, false)
        + '<div class="ch"><label>Environnement</label><select id="' + sp.mode.id + '"' + (RO ? ' disabled' : '') + '>'
        + '<option value="sandbox"' + ((d.mode || 'sandbox') === 'sandbox' ? ' selected' : '') + '>Test (sandbox)</option>'
        + '<option value="production"' + (d.mode === 'production' ? ' selected' : '') + '>Production</option>'
        + '</select></div></div>';
    } else {
      h += texteHtml(sp.acct.id, sp.acct.label, d.accountNumber, sp.acct.place, false);
    }
    return h + '</div>';
  }

  function cartePcHtml(){
    var pc = (D.carriers || {})['postes-canada'] || {};
    var m = pc.cle || { defini: false, fin: '' };
    var h = '<div class="carte"><div class="th">'
      + '<h2>Postes Canada</h2>' + basculeHtml('cp-en', pc.enabled) + '</div>';
    h += '<div class="info">Identifiants sur <b>developer.canadapost-postescanada.ca</b>. La clé API est au '
      + 'format <b>utilisateur:motdepasse</b>. Valeurs de test : '
      + '6e93d53968881714:0bfa9fcb9853d1f51ee57a · client 2004381 · contrat 42708517.</div>';
    // La clé API complète = utilisateur:motdepasse ; secret (vide = conservé).
    h += secretHtml('cp-cle', 'Clé API complète (utilisateur:motdepasse)', m, '6e93…:0bfa…');
    h += '<div class="gr2">'
      + texteHtml('cp-cust', 'Numéro client', pc.customerNumber, 'Ex : 2004381', false)
      + texteHtml('cp-contract', 'ID contrat', pc.contractId, 'Ex : 42708517', false) + '</div>';
    h += '<div class="ch"><label>Environnement</label><select id="cp-mode"' + (RO ? ' disabled' : '') + '>'
      + '<option value="sandbox"' + ((pc.mode || 'sandbox') === 'sandbox' ? ' selected' : '') + '>Bac à sable (test)</option>'
      + '<option value="production"' + (pc.mode === 'production' ? ' selected' : '') + '>Production</option></select></div>';
    // Mapbox (jeton public) + adresse expéditeur.
    h += '<hr class="sep"><div class="stitre">Autocomplétion d’adresse à la caisse</div>';
    h += texteHtml('mapbox', 'Jeton Mapbox (public, pk.*)', D.mapbox, 'pk.xxxxxxxx', true,
      'Gratuit sur account.mapbox.com. S’il est renseigné, il remplace AddressComplete (plus précis au Canada).');
    h += '<hr class="sep"><div class="stitre">Adresse expéditeur (entrepôt / boutique)</div>';
    h += '<div class="gr2">'
      + texteHtml('cp-oname', 'Nom / Boutique', pc.originName, 'SANDRIZA', false)
      + texteHtml('cp-ophone', 'Téléphone (sans tirets)', pc.originPhone, '5140000000', false) + '</div>';
    h += texteHtml('cp-oaddr', 'Adresse (rue)', pc.originAddress, '', false);
    h += '<div class="gr2">'
      + texteHtml('cp-ocity', 'Ville', pc.originCity, 'Montréal', false)
      + '<div class="ch"><label>Province</label><select id="cp-oprov"' + (RO ? ' disabled' : '') + '>'
      + PROVS.map(function(p){ return '<option' + ((pc.originProvince || 'QC') === p ? ' selected' : '') + '>' + p + '</option>'; }).join('')
      + '</select></div></div>';
    h += texteHtml('cp-opostal', 'Code postal (sans espace)', pc.originPostal, 'H1A1A1', false);
    return h + '</div>';
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    // Filet : identifiants non chargés → on avertit et on n'écrit pas.
    if (D && D.charge === false) {
      avertEl.hidden = false;
      avertEl.innerHTML = '<b><span class="ic">⚠</span> Identifiants non chargés</b> — les identifiants API n’ont pas pu être '
        + 'rechargés depuis le nuage cette session' + (D.raison ? ' (' + esc(D.raison) + ')' : '')
        + '. <strong>N’enregistrez pas</strong> sans avoir cliqué « Réessayer », sinon vous risqueriez '
        + 'd’effacer vos identifiants.<div class="g"><button id="b-retry">↻ Réessayer le chargement</button></div>';
    } else { avertEl.hidden = true; }

    var h = [cartePcHtml()];
    SIMPLES.forEach(function(sp){ h.push(carteSimpleHtml(sp)); });
    corps.innerHTML = h.join('');
    brancher();
    // On n'autorise l'enregistrement que si la config complète est chargée.
    bsave.disabled = RO || OCCUPE || (D && D.charge === false);
  }

  function brancher(){
    var r = document.getElementById('b-retry');
    if (r) r.onclick = reessayer;
  }

  function saisie(){
    var s = {};
    s['postes-canada'] = {
      enabled: chk('cp-en'), cle: val('cp-cle'),
      customerNumber: val('cp-cust'), contractId: val('cp-contract'), mode: val('cp-mode'),
      originName: val('cp-oname'), originPhone: val('cp-ophone'), originAddress: val('cp-oaddr'),
      originCity: val('cp-ocity'), originProvince: val('cp-oprov'), originPostal: val('cp-opostal'),
    };
    SIMPLES.forEach(function(sp){
      var o = { enabled: chk(sp.enId), accountNumber: val(sp.acct.id) };
      o[sp.user.champ] = val(sp.user.id);
      o[sp.sec.champ] = val(sp.sec.id);
      if (sp.mode) o.mode = val(sp.mode.id);
      s[sp.cle] = o;
    });
    s.mapbox = val('mapbox');
    return s;
  }

  function occuper(o){ OCCUPE = o; bsave.disabled = o || RO || (D && D.charge === false); }

  function enregistrer(){
    if (RO || OCCUPE || (D && D.charge === false)) return;
    occuper(true); dire('Enregistrement…');
    appeler('config:transporteurs:ecrire', [saisie()]).then(function(r){
      occuper(false);
      if (r && r.ok) { D = r; RO = !r.peutModifier; dessiner(); dire('Transporteurs enregistrés.', 'bon'); }
      else if (r && r.motif === 'non_charge') { charger(); dire('Identifiants non chargés — rechargez puis réessayez.', 'err'); }
      else dire(expliquer(r), 'err');
    });
  }
  bsave.onclick = enregistrer;

  function reessayer(){
    if (OCCUPE) return;
    occuper(true); dire('Rechargement des identifiants…');
    appeler('config:transporteurs:reessayer').then(function(r){
      occuper(false);
      if (r && r.ok) { D = r; RO = !r.peutModifier; dessiner();
        dire(r.charge ? 'Identifiants rechargés.' : 'Toujours pas chargés.', r.charge ? 'bon' : 'err'); }
      else dire(expliquer(r), 'err');
    });
  }

  function charger(){
    dire('Lecture…');
    appeler('config:transporteurs:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide m-' + ((r && r.motif) || 'echec') + '">' + expliquer(r) + '</div></div>';
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

module.exports = { pageTransporteurs };
