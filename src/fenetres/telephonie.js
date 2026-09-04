'use strict';

/*
 * FENÊTRE « TÉLÉPHONIE » — NATIVE (Communications, palier 5)
 * =============================================================================
 * Le standard téléphonique Twilio : identifiants, accueil et routage, robot de
 * réception (menu IVR), redirection d'appel, messagerie vocale, SMS et file
 * d'attente. Plus un bandeau vivant (solde Twilio, file en direct) et deux boîtes
 * de réception (messages vocaux + SMS) relues à l'ouverture.
 *
 * ⚠⚠ LES SECRETS NE TRAVERSENT PAS EN CLAIR : Account SID et Auth Token ne sont
 * rendus que par un indicateur « configuré » (booléen). Un champ secret laissé
 * VIDE veut dire « garde celui qui est enregistré » — la conservation est faite
 * PAR LE SERVEUR (turso-proxy « phone_save »), donc pas de filet « non chargé »
 * comme les transporteurs : le reste de la config (non secret) est toujours là.
 *
 * ⚠ LE BANDEAU ET LES BOÎTES sont relus à travers le pont (ops « tel:* »), car la
 * fenêtre native n'a ni origine ni session pour appeler « twilio-api.php » elle-
 * même : c'est la fenêtre principale qui relaie.
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
  padding:.55rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522);flex-wrap:wrap}
.tete .solde{display:flex;align-items:center;gap:.35rem;font-size:.8rem;color:var(--tx2)}
.tete .solde b{color:var(--tx-or);font-size:.95rem}
.tete .qlive{font-size:.76rem;color:var(--tx-jaune);background:rgba(250,204,21,.12);
  border:1px solid rgba(250,204,21,.35);border-radius:99px;padding:1px 9px}
.tete .actif{margin-left:auto;display:inline-flex;align-items:center;gap:.45rem;
  cursor:pointer;font-weight:600;font-size:.82rem;-webkit-user-select:none;user-select:none}
.tete .actif input{accent-color:#c9a97e;cursor:pointer}
.tete button.mini{font:inherit;font-size:.74rem;padding:.16rem .55rem;
  border:1px solid var(--v16);border-radius:7px;background:var(--v05);
  color:var(--tx);cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none}
.tete button.mini:hover:not(:disabled){background:var(--v10)}
.tete a.credit{font:inherit;font-size:.74rem;padding:.16rem .55rem;border-radius:7px;
  background:#c9a97e;border:1px solid #c9a97e;color:#1a1208;font-weight:700;text-decoration:none;flex:0 0 auto}
.ro{flex:0 0 auto;margin:.6rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.onglets{flex:0 0 auto;display:flex;gap:.1rem;flex-wrap:wrap;overflow-x:auto;
  padding:.5rem 1rem 0;border-bottom:1px solid var(--v08)}
.onglets button{font:inherit;font-size:.82rem;white-space:nowrap;background:none;
  border:0;border-bottom:2px solid transparent;color:var(--tx2);padding:.5rem .7rem;cursor:pointer}
.onglets button.on{color:var(--tx-or);border-bottom-color:#c9a97e;font-weight:700}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
/* ⚠ ANCRÉE = PLEINE PAGE : pas de cap ; les champs (gr2) s'étendent sur la largeur. */
.panneau{width:100%}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.9rem 1rem;margin:0 0 .9rem;min-width:0}
.stitre{font-size:.86rem;font-weight:700;color:var(--tx-bleute);margin:0 0 .6rem}
.info{background:rgba(80,120,190,.1);border:1px solid rgba(120,160,220,.28);color:#bcd2f0;
  border-radius:8px;padding:.55rem .7rem;font-size:.75rem;line-height:1.5;margin:0 0 .8rem}
.info code{background:var(--f-champ);border:1px solid var(--v12);border-radius:5px;padding:1px 6px;font-size:.72rem}
.note{background:var(--v03);border:1px solid var(--v07);color:var(--tx2);
  border-radius:8px;padding:.45rem .7rem;font-size:.73rem;line-height:1.5;margin:0 0 .7rem}
.gr2{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
@media (max-width:640px){.gr2{grid-template-columns:1fr}}
.ch{margin:0 0 .6rem}
.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.22rem;font-size:.75rem;color:var(--tx2)}
.ch input,.ch select,.ch textarea{width:100%;font:inherit;font-size:.83rem;color:var(--tx);background:var(--f-champ);
  border:1px solid var(--v12);border-radius:8px;padding:.4rem .5rem}
.ch textarea{resize:vertical;min-height:2.4rem}
.ch input.mono{font-family:ui-monospace,Consolas,monospace}
.ch input:focus,.ch select:focus,.ch textarea:focus{outline:none;border-color:#c9a97e}
.ch input:disabled,.ch select:disabled,.ch textarea:disabled{opacity:.55}
.ch .etat{font-size:.72rem;color:var(--tx2);margin-top:.2rem}
.ch .etat b{color:var(--tx-ok)}
.ch .etat.non b{color:var(--tx-jaune)}
.ch .aide{font-size:.7rem;color:var(--tx3);margin-top:.18rem}
.bascule{display:inline-flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.82rem;
  -webkit-user-select:none;user-select:none;margin:0 0 .6rem}
.bascule input{accent-color:#c9a97e;cursor:pointer}
.mrow{background:var(--f-champ);border:1px solid var(--v12);border-radius:9px;padding:.6rem .7rem;margin:0 0 .55rem}
.mrow .l1{display:flex;gap:.5rem;flex-wrap:wrap;align-items:flex-end}
.mrow .l2{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.45rem}
.mrow .l2 .ch{flex:1;min-width:12rem;margin:0}
.smsbox{display:flex;gap:.4rem;flex-wrap:wrap;margin:0 0 .6rem}
.smsbox input.to{width:11rem}.smsbox input.body{flex:1;min-width:14rem}
.liste{margin-top:.3rem}
.item{background:var(--f-champ);border:1px solid var(--v12);border-radius:9px;padding:.55rem .7rem;margin:0 0 .5rem}
.item.neuf{border-left:3px solid #c9a97e}
.item .haut{display:flex;justify-content:space-between;align-items:center;gap:.6rem;flex-wrap:wrap}
.item .qui{font-size:.83rem}
.item .meta{font-size:.72rem;color:var(--tx2)}
.item .corpsmsg{font-size:.82rem;margin-top:.2rem}
.item .actes{display:flex;gap:.3rem;flex-wrap:wrap}
.sep{border:0;border-top:1px solid var(--v08);margin:.8rem 0 .6rem}
/* Adresse de rappel Twilio : selectionnable a la souris, copiable en un clic. */
.crochet{display:flex;align-items:center;gap:.45rem}
.crochet code{flex:1 1 auto;min-width:0;overflow-x:auto;white-space:nowrap;
  font-family:Consolas,"Courier New",monospace;font-size:.78rem;color:#dcc39b;
  background:var(--v05);border:1px solid var(--v14);
  border-radius:7px;padding:.28rem .5rem;user-select:text}
.crochet button{flex:0 0 auto}
.tbl{width:100%;border-collapse:collapse;font-size:.78rem}
.tbl th{text-align:left;color:var(--tx2);font-weight:600;padding:.35rem .5rem;border-bottom:1px solid var(--v08)}
.tbl td{padding:.35rem .5rem;border-bottom:1px solid var(--v05)}
.vide{padding:.8rem;text-align:center;color:var(--tx2);font-size:.82rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button.b{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.32rem .7rem;cursor:pointer;font-size:.78rem}
button.b:hover:not(:disabled){background:var(--v10)}
button.b:disabled{opacity:.5;cursor:default}
button.b.dgr{color:var(--tx-err2);border-color:rgba(248,113,113,.4)}
button.prim{font:inherit;background:#c9a97e;border:1px solid #c9a97e;color:#1a1208;font-weight:700;
  border-radius:8px;padding:.42rem .9rem;cursor:pointer}
button.prim:hover:not(:disabled){background:#d8bd97}
button.prim:disabled{opacity:.5;cursor:default}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageTelephonie() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Téléphonie — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.telephone}</span><h1>Téléphonie</h1>
  <span class="solde">Solde&nbsp;: <b id="t-solde">…</b></span>
  <span id="t-qlive"></span>
  <a class="credit" href="https://console.twilio.com/us1/billing/manage-billing/billing-overview" target="_blank" rel="noopener">Crédits</a>
  <button class="mini" id="t-refresh" title="Actualiser le solde, la file et les messages">↻</button>
  <label class="actif"><input type="checkbox" id="t-enabled"> Active</label>
</div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
<div class="onglets" id="onglets"></div>
<div class="corps"><div class="panneau" id="corps"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-save" disabled>Enregistrer</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  /* ── MODE ANCRE ── meme bouton d'ancrage/detachement que les autres ecrans. */
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher'; b.type = 'button'; b.className = 'mini';
      b.style.marginLeft = '.2rem';
      t.appendChild(b);
    }
    if (actif) { b.textContent = '⧉ Détacher'; b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); }; }
    else { b.textContent = '⚓ Ancrer'; b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var ongletsEl = document.getElementById('onglets');
  var bsave = document.getElementById('b-save');
  var soldeEl = document.getElementById('t-solde');
  var qliveEl = document.getElementById('t-qlive');
  var enabledEl = document.getElementById('t-enabled');
  var D = null, C = null, RO = false, OCCUPE = false;
  var ONGLET = 'general';
  var MENU = [];   // options du menu IVR, tenues en memoire entre les redessins
  var RESUME = null; // dernier retour de tel:resume (solde, appels, vm, sms)

  var ONGLETS = [
    ['general', 'Général'], ['accueil', 'Accueil & routage'], ['menu', 'Menu IVR'],
    ['redirection', 'Redirection'], ['messagerie', 'Messagerie'], ['sms', 'SMS'], ['file', "File d'attente"],
  ];
  var VOIX_FR = [
    ['Polly.Gabrielle-Neural', 'Gabrielle — femme, naturelle (neuronale)'],
    ['Polly.Liam-Neural', 'Liam — homme, naturel (neuronale)'],
    ['Polly.Chantal', 'Chantal — femme (standard)'],
    ['default', 'Voix de base Twilio (robotique)'],
  ];
  var VOIX_EN = [
    ['Polly.Joanna-Neural', 'Joanna — female, natural (neural)'],
    ['Polly.Matthew-Neural', 'Matthew — male, natural (neural)'],
    ['Polly.Joanna', 'Joanna — female (standard)'],
    ['default', 'Basic Twilio voice'],
  ];
  var MUSIQUES = [
    ['', 'Guitare douce élégante (~1½ min) — défaut'],
    ['http://com.twilio.music.electronica.s3.amazonaws.com/teru_-_110_Downtempo_Electronic_4.mp3', 'Électro downtempo (~1½ min)'],
    ['http://com.twilio.music.electronica.s3.amazonaws.com/Kaer_Trouz_-_Seawall_Stepper.mp3', 'Lounge électro (~1½ min)'],
    ['http://com.twilio.music.guitars.s3.amazonaws.com/Pitx_-_Long_Winter.mp3', 'Guitare feutrée (~2½ min)'],
    ['http://com.twilio.music.classical.s3.amazonaws.com/ith_chopin-15-2.mp3', 'Chopin — élégance (~6 min · sonneries espacées)'],
    ['http://com.twilio.music.ambient.s3.amazonaws.com/aerosolspray_-_Living_Taciturn.mp3', 'Ambiance zen / spa (~6 min · espacées)'],
  ];

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function val(id){ var e = document.getElementById(id); return e ? String(e.value).trim() : ''; }
  function chk(id){ var e = document.getElementById(id); return !!(e && e.checked); }

  // Taux de change indicatif USD -> CAD pour l'affichage du solde et des couts
  // Twilio (facturés en USD). Approximatif (marqué « ≈ ») ; à ajuster au besoin.
  var USD_CAD = 1.37;
  function soldeCadUsd(usdStr){
    var usd = Number(usdStr);
    if (!isFinite(usd)) return String(usdStr || '');
    var cad = (usd * USD_CAD).toFixed(2).replace('.', ',');
    return '≈ ' + cad + ' $ CA (' + String(usdStr) + ' USD)';
  }

  // Masque de numéro NANP : chiffres seulement, affiché (418) 858-0455 ; stocké en
  // E.164 (+1XXXXXXXXXX) pour que Twilio compose correctement.
  function fmtTel(v){
    var d = String(v == null ? '' : v).replace(/[^0-9]/g, '');
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    d = d.slice(0, 10);
    if (!d) return '';
    if (d.length <= 3) return '(' + d;
    if (d.length <= 6) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }
  function telE164(v){
    var d = String(v == null ? '' : v).replace(/[^0-9]/g, '');
    if (!d) return '';
    if (d.length === 11 && d.charAt(0) === '1') return '+' + d;
    if (d.length === 10) return '+1' + d;
    return '+' + d;
  }
  function brancherTels(){
    var sels = corps.querySelectorAll('[data-mf="number"], #t-number, #t-sms-to');
    for (var i = 0; i < sels.length; i++) {
      (function(el){
        el.value = fmtTel(el.value);
        el.setAttribute('inputmode', 'tel');
        el.addEventListener('input', function(){ el.value = fmtTel(el.value); });
      })(sels[i]);
    }
  }

  var MOTIFS = {
    session:            'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule.',
    indisponible:       "L'administration n'est pas encore chargée dans la fenêtre principale.",
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              "La fenêtre principale n'a pas répondu à temps.",
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    nuage:              "L'enregistrement dans le nuage a échoué. Réessayez.",
    tel_desactive:      'La téléphonie est désactivée.',
    tel_sans_compte:    'Aucun identifiant Twilio enregistré (onglet Général).',
    refus:              'Twilio a refusé la requête. Vérifiez les identifiants.',
    reseau:             'Erreur réseau en joignant Twilio.',
    echec:              "L'opération a échoué.",
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

  // ── FABRIQUES DE CHAMPS ────────────────────────────────────────────────────
  function texteHtml(id, label, v, place, mono, aide, type){
    return '<div class="ch"><label>' + esc(label) + '</label>'
      + '<input' + (mono ? ' class="mono"' : '') + ' id="' + id + '"' + (type ? ' type="' + type + '"' : '')
      + ' value="' + esc(v == null ? '' : v) + '" placeholder="' + esc(place || '') + '"'
      + (RO ? ' disabled' : '') + '>'
      + (aide ? '<div class="aide">' + esc(aide) + '</div>' : '') + '</div>';
  }
  function secretHtml(id, label, defini, place){
    return '<div class="ch"><label>' + esc(label) + '</label>'
      + '<input class="mono" id="' + id + '" type="password" value="" placeholder="'
      + (defini ? 'inchangé (laisser vide pour conserver)' : esc(place || '')) + '" autocomplete="off"'
      + (RO ? ' disabled' : '') + '>'
      + '<div class="etat' + (defini ? '' : ' non') + '">'
      + (defini ? 'Enregistré. <b>Vide = conservé.</b>' : 'Aucun secret <b>enregistré</b>.') + '</div></div>';
  }
  function selectHtml(id, label, cur, opts, aide){
    var h = '<div class="ch"><label>' + esc(label) + '</label><select id="' + id + '"' + (RO ? ' disabled' : '') + '>';
    for (var i = 0; i < opts.length; i++) {
      h += '<option value="' + esc(opts[i][0]) + '"' + (String(cur) === String(opts[i][0]) ? ' selected' : '') + '>'
        + esc(opts[i][1]) + '</option>';
    }
    return h + '</select>' + (aide ? '<div class="aide">' + esc(aide) + '</div>' : '') + '</div>';
  }
  function taHtml(id, label, v, place){
    return '<div class="ch"><label>' + esc(label) + '</label>'
      + '<textarea id="' + id + '" rows="2" placeholder="' + esc(place || '') + '"' + (RO ? ' disabled' : '') + '>'
      + esc(v == null ? '' : v) + '</textarea></div>';
  }
  function checkHtml(id, texte, actif){
    return '<label class="bascule"><input type="checkbox" id="' + id + '"' + (actif ? ' checked' : '')
      + (RO ? ' disabled' : '') + '> ' + esc(texte) + '</label>';
  }

  // ── PANNEAUX ────────────────────────────────────────────────────────────────
  function panGeneral(){
    var h = '<div class="carte">';
    h += '<div class="gr2">'
      + texteHtml('t-number', 'Numéro Twilio', C.twilioNumber, '+1 514 555 0123', true)
      + selectHtml('t-langmode', 'Mode de langue', C.langMode || 'fr', [
          ['fr', 'Français'], ['en', 'Anglais'],
          ['bilingual', 'Bilingue (FR + EN)'], ['select', "Français d'abord, anglais sur le #"]]) + '</div>';
    h += '<div class="gr2">'
      + selectHtml('t-voice-fr', 'Voix française (fr-CA)', C.voiceFr || 'Polly.Gabrielle-Neural', VOIX_FR)
      + selectHtml('t-voice-en', 'Voix anglaise (en-US)', C.voiceEn || 'Polly.Joanna-Neural', VOIX_EN) + '</div>';
    h += '<hr class="sep"><div class="stitre">Identifiants Twilio</div>';
    h += '<div class="gr2">'
      + secretHtml('t-sid', 'Account SID', !!C.hasAccountSid, 'ACxxxxxxxx')
      + secretHtml('t-token', 'Auth Token', !!C.hasAuthToken, 'votre Auth Token') + '</div>';

    /* ⚠ LES DEUX URL DE RAPPEL — SANS ELLES, RIEN NE FONCTIONNE, ET LA
       CONFIGURATION ETAIT IMPOSSIBLE DEPUIS L APPLICATION. Twilio ne devine
       pas ou joindre le site : ces adresses se collent dans la fiche du
       NUMERO, chez Twilio. Le coeur du site les fournissait deja (webhookVoice
       / webhookSms) — cette fenetre ne les affichait simplement pas.
       ⚠ Elles se collent sur le NUMERO, pas dans Monitor > Errors : c est
       l erreur qui a fait perdre du temps la premiere fois. */
    h += '<hr class="sep"><div class="stitre">Adresses de rappel (webhooks)</div>'
      + '<div class="note">À coller dans <strong>Twilio → Phone Numbers → votre numéro</strong>. '
      + 'Sans elles, Twilio ne sait pas où joindre le site : les appels et les SMS '
      + 'n’arriveront jamais. <strong>Ce n’est pas dans Monitor → Errors.</strong></div>';
    h += crochetHtml('A CALL COMES IN (Voice)', D.webhookVoice || '', 't-wh-voice');
    h += crochetHtml('A MESSAGE COMES IN (Messaging)', D.webhookSms || '', 't-wh-sms');
    return h + '</div>';
  }

  // Une adresse de rappel : lisible, selectionnable, et copiable en un clic.
  function crochetHtml(titre, url, id){
    if (!url) {
      return '<div class="ch"><label>' + esc(titre) + '</label>'
        + '<div class="aide">Adresse indisponible — la fenêtre principale ne l’a pas fournie.</div></div>';
    }
    return '<div class="ch"><label>' + esc(titre) + '</label>'
      + '<div class="crochet"><code id="' + id + '">' + esc(url) + '</code>'
      + '<button type="button" class="mini" data-copier="' + id + '">Copier</button></div></div>';
  }

  function panAccueil(){
    var hr = C.hoursRouting || {};
    var cm = hr.closedMessage || {};
    var g = C.greeting || {};
    var ni = C.noInputMessage || {};
    var h = '<div class="carte"><div class="stitre">Message d’accueil</div>';
    h += '<div class="gr2">'
      + taHtml('t-greet-fr', 'Accueil (FR)', g.fr, "Bonjour et merci d'avoir appelé…")
      + taHtml('t-greet-en', 'Accueil (EN)', g.en, 'Hello and thank you for calling…') + '</div>';
    h += '<div class="gr2">'
      + texteHtml('t-greet-pause', "Délai après l'accueil (secondes)", (C.greetingPause != null ? C.greetingPause : 5), '5', false, '', 'number')
      + texteHtml('t-menu-timeout', 'Attente au menu avant de raccrocher (secondes)', (C.menuTimeout != null ? C.menuTimeout : 10), '10', false, '', 'number') + '</div>';
    h += '</div><div class="carte"><div class="stitre">Aucun choix au menu</div>'
      + '<div class="note">Si l’appelant ne fait aucun choix après le délai, on joue ce message (FR + EN) puis on raccroche.</div>';
    h += '<div class="gr2">'
      + taHtml('t-noinput-fr', 'Message « aucun choix » (FR)', ni.fr, "Merci d'avoir contacté SANDRIZA. Au revoir !")
      + taHtml('t-noinput-en', 'Message « aucun choix » (EN)', ni.en, 'Thank you for contacting SANDRIZA. Goodbye!') + '</div>';
    h += selectHtml('t-default', "Action par défaut (à l'ouverture)", C.defaultAction || 'menu', [
        ['menu', 'Robot / menu (IVR)'], ['forward', 'Rediriger directement'], ['voicemail', 'Messagerie vocale']]);
    h += '</div><div class="carte"><div class="stitre">Heures d’ouverture</div>';
    h += checkHtml('t-usehours', "Utiliser les heures d'ouverture — hors heures, message + messagerie", !!hr.useHours);
    h += '<div class="gr2">'
      + taHtml('t-closed-fr', 'Message « fermé » (FR)', cm.fr, 'Nos bureaux sont fermés…')
      + taHtml('t-closed-en', 'Message « fermé » (EN)', cm.en, 'Our offices are closed…') + '</div>';
    return h + '</div>';
  }

  function menuRowHtml(o, i){
    o = o || {};
    var m = o.message || {};
    var h = '<div class="mrow" data-mrow="' + i + '"><div class="l1">'
      + '<div class="ch" style="margin:0"><label>Touche</label><input data-mf="digit" style="width:4rem" value="' + esc(o.digit || '') + '"' + (RO ? ' disabled' : '') + '></div>'
      + '<div class="ch" style="margin:0"><label>Libellé FR</label><input data-mf="label" style="width:9rem" value="' + esc(o.label || '') + '"' + (RO ? ' disabled' : '') + '></div>'
      + '<div class="ch" style="margin:0"><label>Libellé EN</label><input data-mf="labelEN" style="width:9rem" value="' + esc(o.labelEN || '') + '"' + (RO ? ' disabled' : '') + '></div>'
      + '<div class="ch" style="margin:0"><label>Action</label><select data-mf="action"' + (RO ? ' disabled' : '') + '>'
        + '<option value="forward"' + (o.action === 'forward' ? ' selected' : '') + '>Rediriger</option>'
        + '<option value="queue"' + (o.action === 'queue' ? ' selected' : '') + '>File d’attente</option>'
        + '<option value="voicemail"' + (o.action === 'voicemail' ? ' selected' : '') + '>Messagerie</option>'
        + '<option value="message"' + (o.action === 'message' ? ' selected' : '') + '>Message vocal</option>'
        + '<option value="repeat"' + (o.action === 'repeat' ? ' selected' : '') + '>Répéter l’accueil</option></select></div>'
      + '<div class="ch" style="margin:0"><label>Numéro (Rediriger / File)</label><input data-mf="number" style="width:10rem" value="' + esc(o.number || '') + '" placeholder="+1…"' + (RO ? ' disabled' : '') + '></div>'
      + (RO ? '' : '<button class="b dgr" type="button" data-mdel="' + i + '" title="Retirer"><span class="ic">🗑</span></button>')
      + '</div><div class="l2">'
      + '<div class="ch"><textarea data-mf="messageFr" rows="1" placeholder="Message vocal FR (si action = Message)"' + (RO ? ' disabled' : '') + '>' + esc(m.fr || '') + '</textarea></div>'
      + '<div class="ch"><textarea data-mf="messageEn" rows="1" placeholder="Message vocal EN"' + (RO ? ' disabled' : '') + '>' + esc(m.en || '') + '</textarea></div>'
      + '</div></div>';
    return h;
  }
  function panMenu(){
    var h = '<div class="carte"><div class="stitre"><span class="ic">🤖</span> Robot de réception (menu IVR)</div>';
    if (!MENU.length) h += '<div class="note">Aucune option — ajoutez-en pour activer le robot de réception.</div>';
    else { for (var i = 0; i < MENU.length; i++) h += menuRowHtml(MENU[i], i); }
    if (!RO) h += '<button class="b" type="button" id="t-menu-add">+ Ajouter une option de menu</button>';
    return h + '</div>';
  }

  function panRedirection(){
    var f = C.forward || {};
    var h = '<div class="carte"><div class="stitre">Redirection (transfert d’appel direct)</div>';
    h += '<div class="gr2">'
      + texteHtml('t-forward', 'Numéro(s) (séparés par des virgules)', (f.numbers || []).join(', '), '+1 514 555 0100, +1 514 555 0101', true)
      + texteHtml('t-timeout', 'Délai de sonnerie (secondes)', (f.timeout != null ? f.timeout : 20), '20', false, '', 'number') + '</div>';
    h += selectHtml('t-strategy', 'Stratégie (si plusieurs numéros)', f.strategy || 'simul', [
        ['simul', 'Simultané — tous sonnent en même temps'], ['cascade', "Cascade — l'un après l'autre"]]);
    h += selectHtml('t-callerid', 'Afficheur lors des transferts', f.callerIdMode || 'business', [
        ['business', 'Numéro SANDRIZA (recommandé)'], ['caller', "Numéro réel de l'appelant"]],
        'Numéro SANDRIZA : enregistrez votre numéro Twilio comme contact « SANDRIZA » pour voir le nom.');
    h += checkHtml('t-no-forward', "Pas de numéro de renvoi pour l'instant — messagerie directe (ne plus avertir)", !!f.noForwardAck);
    return h + '</div>';
  }

  function panMessagerie(){
    var vp = C.voicemailPrompt || {};
    var vpc = C.voicemailPromptClosed || {};
    var h = '<div class="carte"><div class="stitre">Messagerie vocale</div>'
      + '<div class="note"><span class="ic">🎧</span> Chaque message vocal est joint en MP3 au courriel ci-dessous, puis supprimé de Twilio. Un courriel valide est requis.</div>';
    h += texteHtml('t-vm-email', 'Courriel de notification (reçoit le MP3)', C.voicemailEmail, 'vous@exemple.com');
    h += '<div class="gr2">'
      + taHtml('t-vm-fr', 'Invite — heures ouverture (FR)', vp.fr, 'Laissez votre message après le bip…')
      + taHtml('t-vm-en', 'Invite — heures ouverture (EN)', vp.en, 'Leave your message after the tone…') + '</div>';
    h += '<div class="note"><span class="ic">🌙</span> Invite hors heures (laisser vide pour reprendre celle du dessus).</div>';
    h += '<div class="gr2">'
      + taHtml('t-vm-closed-fr', 'Invite — hors heures (FR)', vpc.fr, 'Nos bureaux sont fermés. Laissez un message…')
      + taHtml('t-vm-closed-en', 'Invite — hors heures (EN)', vpc.en, "Our offices are closed. Leave a message…") + '</div>';
    h += '</div><div class="carte"><div class="stitre"><span class="ic">🎙️</span> Boîte de réception vocale <span id="t-vm-badge"></span></div>'
      + '<div class="liste" id="t-vm-inbox"><div class="vide">Chargement…</div></div></div>';
    return h;
  }

  function panSms(){
    var sms = C.sms || {};
    var ar = sms.autoReply || {};
    var h = '<div class="carte"><div class="stitre">Réglages SMS</div>';
    h += checkHtml('t-sms-enabled', 'Activer les SMS (réponse automatique aux entrants)', !!sms.enabled);
    h += '<div class="gr2">'
      + taHtml('t-sms-fr', 'Réponse automatique (FR)', ar.fr, 'Merci pour votre message, nous vous répondrons bientôt.')
      + taHtml('t-sms-en', 'Réponse automatique (EN)', ar.en, "Thanks for your message, we'll reply soon.") + '</div>';
    h += texteHtml('t-sms-email', 'Courriel de notification des SMS reçus', sms.notifyEmail, 'vous@exemple.com');
    h += '</div><div class="carte"><div class="stitre"><span class="ic">💬</span> Messages SMS <span id="t-sms-badge"></span> <button class="b" type="button" id="t-sms-journaux" title="Voir les SMS dans le module Journaux" style="float:right;font-size:.76rem"><span class="ic">🔎</span> Dans Journaux</button></div>';
    h += '<div class="smsbox">'
      + '<input class="to" id="t-sms-to" placeholder="+1…"' + (RO ? ' disabled' : '') + '>'
      + '<input class="body" id="t-sms-body" placeholder="Votre message…"' + (RO ? ' disabled' : '') + '>'
      + '<button class="b" type="button" id="t-sms-send"' + (RO ? ' disabled' : '') + '>Envoyer</button></div>';
    h += '<div class="liste" id="t-sms-inbox"><div class="vide">Chargement…</div></div></div>';
    return h;
  }

  function panFile(){
    var q = C.queue || {};
    var curMus = q.holdMusicUrl || '';
    var estPreset = false; for (var i = 0; i < MUSIQUES.length; i++) if (MUSIQUES[i][0] === curMus) estPreset = true;
    var selMus = estPreset ? curMus : (curMus ? 'custom' : '');
    var h = '<div class="carte"><div class="stitre">⏳ File d’attente d’appels</div>';
    h += checkHtml('t-q-enabled', 'Activer la file (faire patienter avec musique quand la ligne est occupée)', !!q.enabled);
    h += '<div class="note">L’appel retente vos numéros de redirection et branche l’appelant dès qu’un agent se libère. Aucun appel sortant facturé, aucun webhook de plus.</div>';
    h += '<div class="gr2">'
      + texteHtml('t-q-maxwait', 'Attente max avant messagerie (minutes)', Math.round((q.maxWaitSec || 180) / 60), '3', false, '', 'number')
      + texteHtml('t-q-firstdelay', 'Délai avant la 1re sonnerie (secondes)', (q.firstRingDelaySec != null ? q.firstRingDelaySec : 30), '30', false, '', 'number') + '</div>';
    h += '<div class="gr2">'
      + texteHtml('t-q-dialto', "Durée de sonnerie de l'agent (secondes)", (q.dialTimeout || 15), '15', false, '', 'number')
      + texteHtml('t-q-vmdigit', 'Touche pour laisser un message pendant l’attente', (q.vmDigit || '9'), '9') + '</div>';
    var opts = MUSIQUES.slice(); opts.push(['custom', 'URL personnalisée…']);
    h += selectHtml('t-q-music-preset', 'Musique d’attente', selMus, opts);
    h += '<div class="ch" id="t-q-music-wrap"' + (selMus === 'custom' ? '' : ' style="display:none"') + '>'
      + '<label>URL personnalisée (MP3)</label><input class="mono" id="t-q-music" value="' + esc(selMus === 'custom' ? curMus : '') + '" placeholder="https://…/musique.mp3"' + (RO ? ' disabled' : '') + '></div>';
    h += checkHtml('t-q-pos', 'Annoncer la position dans la file (« vous êtes en position 2… »)', q.announcePosition !== false);
    h += '<div class="gr2">'
      + taHtml('t-q-msg-fr', 'Message d’attente (FR)', (q.waitMessage || {}).fr, 'Merci de patienter, toutes nos lignes sont occupées…')
      + taHtml('t-q-msg-en', 'Message d’attente (EN)', (q.waitMessage || {}).en, 'Please hold, all our lines are busy…') + '</div>';
    return h + '</div>';
  }

  var PANNEAUX = { general: panGeneral, accueil: panAccueil, menu: panMenu,
    redirection: panRedirection, messagerie: panMessagerie, sms: panSms, file: panFile };

  // ── LECTURE DES CHAMPS DU PANNEAU ACTIF vers la config en memoire ────────────
  function lireMenuDom(){
    var rows = corps.querySelectorAll('[data-mrow]');
    if (!rows.length) return; // panneau menu pas affiche : ne pas ecraser MENU
    var out = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], o = { message: {} };
      var champs = r.querySelectorAll('[data-mf]');
      for (var j = 0; j < champs.length; j++) {
        var f = champs[j].getAttribute('data-mf'), v = String(champs[j].value).trim();
        if (f === 'messageFr') o.message.fr = v;
        else if (f === 'messageEn') o.message.en = v;
        else if (f === 'number') o.number = telE164(v);   // stocké en E.164
        else o[f] = v;
      }
      out.push(o);
    }
    MENU = out;
  }
  // Fusionne les champs de l'onglet couramment affiche dans C (les autres onglets
  // gardent leur valeur d'origine dans C, non redessinee).
  function fusionnerOngletActif(){
    if (RO) return;
    if (ONGLET === 'menu') { lireMenuDom(); return; }
    if (ONGLET === 'general') {
      C.twilioNumber = telE164(val('t-number')); C.langMode = val('t-langmode');
      C.voiceFr = val('t-voice-fr'); C.voiceEn = val('t-voice-en');
      C._sid = val('t-sid'); C._token = val('t-token');
    } else if (ONGLET === 'accueil') {
      C.greeting = { fr: val('t-greet-fr'), en: val('t-greet-en') };
      C.greetingPause = val('t-greet-pause'); C.menuTimeout = val('t-menu-timeout');
      C.noInputMessage = { fr: val('t-noinput-fr'), en: val('t-noinput-en') };
      C.defaultAction = val('t-default');
      C.hoursRouting = { useHours: chk('t-usehours'), closedMessage: { fr: val('t-closed-fr'), en: val('t-closed-en') } };
    } else if (ONGLET === 'redirection') {
      C.forward = { numbers: val('t-forward'), timeout: val('t-timeout'),
        strategy: val('t-strategy'), callerIdMode: val('t-callerid'), noForwardAck: chk('t-no-forward') };
    } else if (ONGLET === 'messagerie') {
      C.voicemailEmail = val('t-vm-email');
      C.voicemailPrompt = { fr: val('t-vm-fr'), en: val('t-vm-en') };
      C.voicemailPromptClosed = { fr: val('t-vm-closed-fr'), en: val('t-vm-closed-en') };
    } else if (ONGLET === 'sms') {
      C.sms = { enabled: chk('t-sms-enabled'), autoReply: { fr: val('t-sms-fr'), en: val('t-sms-en') }, notifyEmail: val('t-sms-email') };
    } else if (ONGLET === 'file') {
      var preset = val('t-q-music-preset');
      C.queue = { enabled: chk('t-q-enabled'), maxWaitMin: val('t-q-maxwait'),
        firstRingDelaySec: val('t-q-firstdelay'), dialTimeout: val('t-q-dialto'),
        holdMusicUrl: (preset === 'custom' ? val('t-q-music') : preset),
        announcePosition: chk('t-q-pos'), vmDigit: val('t-q-vmdigit'),
        waitMessage: { fr: val('t-q-msg-fr'), en: val('t-q-msg-en') } };
    }
  }

  // ── DESSIN ────────────────────────────────────────────────────────────────
  function dessinerOnglets(){
    var h = '';
    for (var i = 0; i < ONGLETS.length; i++) {
      h += '<button type="button" data-ong="' + ONGLETS[i][0] + '" class="' + (ONGLET === ONGLETS[i][0] ? 'on' : '') + '">'
        + esc(ONGLETS[i][1]) + '</button>';
    }
    ongletsEl.innerHTML = h;
    var bs = ongletsEl.querySelectorAll('[data-ong]');
    for (var j = 0; j < bs.length; j++) bs[j].onclick = function(){ changerOnglet(this.getAttribute('data-ong')); };
  }
  // Les zones de texte grandissent a la hauteur de leur contenu (voir tout d'un
  // coup, sans barre de defilement interne). Rejoue a chaque saisie.
  function autogrow(t){ t.style.height = 'auto'; t.style.height = Math.max(t.scrollHeight, 40) + 'px'; t.style.overflowY = 'hidden'; }
  function autogrowTous(){ var ts = corps.querySelectorAll('textarea'); for (var i = 0; i < ts.length; i++) { (function(t){ autogrow(t); t.addEventListener('input', function(){ autogrow(t); }); })(ts[i]); } }
  function dessinerCorps(){
    corps.innerHTML = (PANNEAUX[ONGLET] || panGeneral)();
    brancherCorps();
    autogrowTous();
    brancherTels();
    if (ONGLET === 'messagerie') rendreVm();
    if (ONGLET === 'sms') rendreSms();
  }
  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    enabledEl.checked = !!C.enabled; enabledEl.disabled = RO;
    dessinerOnglets(); dessinerCorps();
    bsave.disabled = RO || OCCUPE;
  }
  function changerOnglet(id){
    fusionnerOngletActif();
    ONGLET = id;
    dessinerOnglets(); dessinerCorps();
  }
  function brancherCorps(){
    if (ONGLET === 'menu') {
      var add = document.getElementById('t-menu-add');
      if (add) add.onclick = function(){ lireMenuDom(); MENU.push({ digit: '', label: '', labelEN: '', action: 'forward', number: '', message: {} }); dessinerCorps(); };
      var dels = corps.querySelectorAll('[data-mdel]');
      for (var i = 0; i < dels.length; i++) dels[i].onclick = function(){ lireMenuDom(); MENU.splice(parseInt(this.getAttribute('data-mdel'), 10), 1); dessinerCorps(); };
    }
    if (ONGLET === 'file') {
      var sel = document.getElementById('t-q-music-preset');
      if (sel) sel.onchange = function(){ var w = document.getElementById('t-q-music-wrap'); if (w) w.style.display = (this.value === 'custom' ? 'block' : 'none'); };
    }
    if (ONGLET === 'sms') {
      var sb = document.getElementById('t-sms-send'); if (sb) sb.onclick = smsEnvoyer;
      var sj = document.getElementById('t-sms-journaux'); if (sj) sj.onclick = function(){ if (P && P.ouvrirJournaux) P.ouvrirJournaux('sms'); };
    }
    // Copier une adresse de rappel. ⚠ On SELECTIONNE aussi le texte : si le
    // presse-papiers est refuse, il reste le Ctrl+C, plutot qu un bouton mort.
    var cps = corps.querySelectorAll('[data-copier]');
    for (var k = 0; k < cps.length; k++) {
      cps[k].onclick = function(){
        var el = document.getElementById(this.getAttribute('data-copier'));
        if (!el) return;
        var txt = el.textContent || '';
        try {
          var s = window.getSelection(), r = document.createRange();
          r.selectNodeContents(el); s.removeAllRanges(); s.addRange(r);
        } catch (e) {}
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(function(){ dire('Adresse copiée.', 'bon'); },
            function(){ dire('Copie refusée — l’adresse est sélectionnée, faites Ctrl+C.', 'att'); });
        } else {
          dire('L’adresse est sélectionnée, faites Ctrl+C.', 'att');
        }
      };
    }
  }

  // ── BOÎTES VIVANTES (messagerie + SMS) ──────────────────────────────────────
  function rendreVm(){
    var box = document.getElementById('t-vm-inbox'); if (!box) return;
    var badge = document.getElementById('t-vm-badge');
    if (!RESUME) { box.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    if (RESUME.erreur) { box.innerHTML = '<div class="vide">' + esc(RESUME.erreur) + '</div>'; return; }
    var vms = RESUME.voicemails || [];
    var nonlus = 0; for (var k = 0; k < vms.length; k++) if (!vms[k].read) nonlus++;
    if (badge) badge.innerHTML = nonlus ? '<span class="qlive">' + nonlus + ' non lu' + (nonlus > 1 ? 's' : '') + '</span>' : '';
    if (!vms.length) { box.innerHTML = '<div class="vide">Aucun message vocal.</div>'; return; }
    var h = '';
    for (var i = 0; i < vms.length; i++) {
      var v = vms[i];
      h += '<div class="item' + (v.read ? '' : ' neuf') + '"><div class="haut">'
        + '<div><span class="qui">' + (v.read ? '' : '<span class="ic">🔵</span> ') + '<b>' + esc(v.from || 'Inconnu') + '</b></span>'
        + ' <span class="meta">· ' + esc(v.duration || '?') + ' s · ' + esc(String(v.date || '').replace('T', ' ').replace('Z', '')) + '</span></div>'
        + '<div class="actes">'
        + (v.read || RO ? '' : '<button class="b" type="button" data-vmlu="' + esc(v.id) + '">✓ Marquer lu</button>')
        + (RO ? '' : '<button class="b dgr" type="button" data-vmdel="' + esc(v.id) + '"><span class="ic">🗑</span></button>')
        + '</div></div>'
        + '<div class="meta" style="margin-top:.25rem">' + (v.emailed === false ? '⚠ Échec de l’envoi courriel' : '<span class="ic">🎧</span> Audio envoyé par courriel (MP3), non conservé') + '</div></div>';
    }
    box.innerHTML = h;
    var lus = box.querySelectorAll('[data-vmlu]'); for (var a = 0; a < lus.length; a++) lus[a].onclick = function(){ vmAction('vm:lu', this.getAttribute('data-vmlu')); };
    var dels = box.querySelectorAll('[data-vmdel]'); for (var b = 0; b < dels.length; b++) dels[b].onclick = function(){ vmAction('vm:suppr', this.getAttribute('data-vmdel')); };
  }
  function rendreSms(){
    var box = document.getElementById('t-sms-inbox'); if (!box) return;
    var badge = document.getElementById('t-sms-badge');
    if (!RESUME) { box.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    if (RESUME.erreur) { box.innerHTML = '<div class="vide">' + esc(RESUME.erreur) + '</div>'; return; }
    var sms = RESUME.sms || [];
    var nonlus = 0; for (var k = 0; k < sms.length; k++) if (sms[k].direction === 'inbound' && !sms[k].read) nonlus++;
    if (badge) badge.innerHTML = nonlus ? '<span class="qlive">' + nonlus + ' non lu' + (nonlus > 1 ? 's' : '') + '</span>' : '';
    if (!sms.length) { box.innerHTML = '<div class="vide">Aucun SMS.</div>'; return; }
    var h = '';
    for (var i = 0; i < sms.length; i++) {
      var m = sms[i], entrant = (m.direction === 'inbound');
      h += '<div class="item' + (entrant && !m.read ? ' neuf' : '') + '">'
        + '<div class="meta">' + (entrant ? '⬅ Reçu de ' : '➡ Envoyé à ') + '<b>' + esc(entrant ? m.from : m.to) + '</b> · '
        + esc(String(m.date || '').replace('T', ' ').replace('Z', '')) + (entrant && !m.read ? ' · <span class="ic">🔵</span>' : '') + '</div>'
        + '<div class="corpsmsg">' + esc(m.body || '') + '</div>'
        + '<div class="actes" style="margin-top:.25rem">'
        + (entrant ? '<button class="b" type="button" data-smsrep="' + esc(m.from) + '">↩ Répondre</button>' : '')
        + (entrant && !m.read ? '<button class="b" type="button" data-smslu="' + esc(m.id) + '">✓</button>' : '')
        + (RO ? '' : '<button class="b dgr" type="button" data-smsdel="' + esc(m.id) + '"><span class="ic">🗑</span></button>')
        + '</div></div>';
    }
    box.innerHTML = h;
    var reps = box.querySelectorAll('[data-smsrep]'); for (var a = 0; a < reps.length; a++) reps[a].onclick = function(){ var t = document.getElementById('t-sms-to'); if (t) { t.value = this.getAttribute('data-smsrep'); var bd = document.getElementById('t-sms-body'); if (bd) bd.focus(); } };
    var lus = box.querySelectorAll('[data-smslu]'); for (var b = 0; b < lus.length; b++) lus[b].onclick = function(){ smsAction('sms:lu', this.getAttribute('data-smslu')); };
    var dels = box.querySelectorAll('[data-smsdel]'); for (var c = 0; c < dels.length; c++) dels[c].onclick = function(){ smsAction('sms:suppr', this.getAttribute('data-smsdel')); };
  }

  function majBandeau(){
    if (!RESUME) { soldeEl.textContent = '…'; return; }
    if (RESUME.erreur) { soldeEl.innerHTML = '<span style="color:var(--tx-err);font-size:.8rem">indisponible</span>'; qliveEl.innerHTML = ''; return; }
    var b = RESUME.balance;
    if (b && b.balance != null && b.balance !== '') {
      var cur = String(b.currency || 'USD');
      soldeEl.textContent = (cur === 'USD') ? soldeCadUsd(b.balance) : (String(b.balance) + ' ' + cur);
    } else soldeEl.textContent = '—';
    var qw = (typeof RESUME.queueWaiting === 'number') ? RESUME.queueWaiting : 0;
    qliveEl.innerHTML = (qw > 0) ? '<span class="qlive">⏳ ' + qw + ' en attente</span>' : '';
  }
  function chargerResume(){
    soldeEl.textContent = '…';
    appeler('tel:resume').then(function(r){
      if (!r || !r.ok) { RESUME = { erreur: expliquer(r) }; }
      else { RESUME = r; }
      majBandeau();
      if (ONGLET === 'messagerie') rendreVm();
      if (ONGLET === 'sms') rendreSms();
    });
  }
  // ⚠ On VÉRIFIE le résultat : sans ça, un échec (session, réseau, Twilio) était
  // avalé en silence et le message restait — « la suppression ne marche pas ».
  function vmAction(op, id){
    dire('…');
    appeler('tel:' + op, [{ id: id }]).then(function(r){
      if (r && r.ok) { chargerResume(); dire(op === 'vm:suppr' ? 'Message supprimé.' : 'Marqué lu.', 'bon'); }
      else dire('Échec : ' + expliquer(r), 'err');
    });
  }
  function smsAction(op, id){
    dire('…');
    appeler('tel:' + op, [{ id: id }]).then(function(r){
      if (r && r.ok) { chargerResume(); dire(op === 'sms:suppr' ? 'SMS supprimé.' : 'Marqué lu.', 'bon'); }
      else dire('Échec : ' + expliquer(r), 'err');
    });
  }
  function smsEnvoyer(){
    var to = telE164(val('t-sms-to')), body = val('t-sms-body');
    if (!to || !body) { dire('Numéro et message requis.', 'err'); return; }
    dire('Envoi du SMS…');
    appeler('tel:sms:envoyer', [{ to: to, body: body }]).then(function(r){
      if (r && r.ok) { dire('SMS envoyé.', 'bon'); var bd = document.getElementById('t-sms-body'); if (bd) bd.value = ''; chargerResume(); }
      else dire('Échec SMS : ' + expliquer(r), 'err');
    });
  }

  // ── ENREGISTREMENT ──────────────────────────────────────────────────────────
  function occuper(o){ OCCUPE = o; bsave.disabled = o || RO; }
  function saisie(){
    fusionnerOngletActif();
    var f = C.forward || {};
    var q = C.queue || {};
    var s = {
      enabled: !!enabledEl.checked,
      twilioNumber: C.twilioNumber || '', langMode: C.langMode || 'fr',
      voiceFr: C.voiceFr || 'Polly.Gabrielle-Neural', voiceEn: C.voiceEn || 'Polly.Joanna-Neural',
      greeting: C.greeting || {}, greetingPause: C.greetingPause,
      menuTimeout: C.menuTimeout, noInputMessage: C.noInputMessage || {},
      defaultAction: C.defaultAction || 'menu', hoursRouting: C.hoursRouting || {},
      menu: MENU,
      forward: { numbers: f.numbers, timeout: f.timeout, strategy: f.strategy,
        callerIdMode: f.callerIdMode, noForwardAck: !!f.noForwardAck },
      voicemailEmail: C.voicemailEmail || '', voicemailPrompt: C.voicemailPrompt || {},
      voicemailPromptClosed: C.voicemailPromptClosed || {},
      sms: C.sms || {}, queue: q,
    };
    // Secrets : seulement s'ils ont ete saisis (vide = conserver cote serveur).
    if (C._sid) s.accountSid = C._sid;
    if (C._token) s.authToken = C._token;
    return s;
  }
  function enregistrer(){
    if (RO || OCCUPE) return;
    occuper(true); dire('Enregistrement…');
    appeler('config:telephonie:ecrire', [saisie()]).then(function(r){
      occuper(false);
      if (r && r.ok) { adopter(r); dessiner(); dire('Téléphonie enregistrée.', 'bon'); avertirRedirection(); }
      else dire(expliquer(r), 'err');
    });
  }
  bsave.onclick = enregistrer;
  enabledEl.onchange = function(){ if (!RO) C.enabled = enabledEl.checked; };

  function avertirRedirection(){
    var hasGeneral = !!(C.forward && String(C.forward.numbers || '').trim());
    var optNeedsNum = false; for (var i = 0; i < MENU.length; i++) { var a = MENU[i].action; if ((a === 'queue' || a === 'forward') && !String(MENU[i].number || '').trim()) optNeedsNum = true; }
    var defNeedsNum = (C.defaultAction === 'forward') || !!(C.queue && C.queue.enabled);
    var ack = !!(C.forward && C.forward.noForwardAck);
    if (!hasGeneral && (optNeedsNum || defNeedsNum) && !ack) {
      setTimeout(function(){ dire('⚠ Aucun numéro à composer (onglet Redirection) — les appels iront en messagerie.', 'att'); }, 900);
    }
  }

  // Adopte un retour de config:telephonie:donnees / ecrire dans l'etat local.
  function adopter(r){
    D = r; RO = !r.peutModifier;
    C = r.cfg || {};
    MENU = Array.isArray(C.menu) ? C.menu.slice() : [];
  }

  function charger(){
    dire('Lecture…');
    appeler('config:telephonie:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err'); return;
      }
      adopter(r); dessiner(); dire('');
      chargerResume();
    });
  }

  document.getElementById('t-refresh').onclick = function(){ chargerResume(); };

  charger();
})();
</script></body></html>`;
}

module.exports = { pageTelephonie };
