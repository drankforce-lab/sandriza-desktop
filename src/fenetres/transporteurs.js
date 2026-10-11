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

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('transporteurs');

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
/* Sur UNE ligne, le bouton a droite : trois lignes de bandeau poussaient le
   formulaire hors de la fenetre (2026-09-26). Le texte ne perd rien. */
.avert{display:flex;align-items:center;gap:.8rem;padding:.45rem .8rem;margin-top:.45rem}
.avert[hidden]{display:none}
.avert .g{margin:0 0 0 auto;flex:0 0 auto}
.avert button{font:inherit;font-size:.78rem;color:var(--tx-err2);background:rgba(248,113,113,.08);
  border:1px solid rgba(248,113,113,.4);border-radius:7px;padding:.24rem .6rem;cursor:pointer}
.avert button:hover:not(:disabled){background:rgba(248,113,113,.16)}
/* Disposition en COLONNES (type maçonnerie) : les cartes courtes (Purolator, UPS…)
   s'empilent sous la précédente au lieu de s'aligner par rangée sur la hauteur de
   Postes Canada — plus d'espace mort sous une carte courte. */
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.05rem 1.2rem;overflow-y:auto}
/* ⚠ CLASSE tr-ong, PAS onglets : le socle (CSS_REFONTE) peint .onglets button.on en pastille or
   pleine, a specificite egale et APRES nous — l onglet actif perdait son dessin d intercalaire.
   ══ UN ONGLET PAR TRANSPORTEUR, LES CHAMPS EN TABLEAU (2026-10-11, sa demande : « des onglets
   par transporteur, et espacer les champs dans un beau tableau par onglet ») ══════════════════
   Tous les panneaux restent DANS la page (masqués) : saisie() lit chaque champ par son id,
   quel que soit l'onglet ouvert — passer d'un onglet à l'autre ne perd rien. Chaque champ
   devient une LIGNE : le libellé à gauche, la valeur à droite, l'aide sous la valeur. */
.tr-ong{flex:0 0 auto;display:flex;gap:.2rem;flex-wrap:wrap;align-items:flex-end;padding:.45rem 1.05rem 0;
  border-bottom:1px solid var(--v08);background:var(--f-page)}
.tr-ong button{display:inline-flex;align-items:center;gap:.45rem;border:1px solid transparent;
  border-bottom:0;border-radius:9px 9px 0 0;background:none;padding:.42rem 1rem;margin-bottom:-1px;
  height:2.3rem;line-height:1;color:var(--tx2);font-weight:600;font-size:.84rem}
.tr-ong button:hover:not(:disabled){background:var(--v05);color:var(--tx)}
.tr-ong button.on{background:var(--f-carte);border-color:var(--v08);color:var(--tx)}
.tr-ong .pt{width:.5rem;height:.5rem;border-radius:50%;background:var(--v16);flex:0 0 auto}
.tr-ong .pt.actif{background:#c9a97e}.tr-ong .pt.bon{background:var(--tx-ok)}.tr-ong .pt.mal{background:var(--tx-err)}
.pan[hidden]{display:none}
/* 7.18.4 (2026-10-11, sa capture : « toutes pognées ») : plus de carte unique coupée en deux colonnes.
   Chaque onglet = un en-tête (szr-tete) + des cartes de section côte à côte (szr-sections, socle). */
.pan{max-width:none;margin:0}
.pan .cot{margin:0}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.75rem .9rem;min-width:0;display:flex;flex-direction:column;margin-bottom:.7rem}
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
.ch .secret{display:flex;gap:.35rem;align-items:center}
.ch .secret input{flex:1 1 auto;min-width:0}
.ch .secret .voir{flex:0 0 auto}
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
/* L etat de la cotation a la caisse (2026-10-04). */
.cot{display:flex;align-items:center;flex-wrap:wrap;gap:.4rem;font-size:.74rem;line-height:1.3;margin:-.2rem 0 .4rem;
  padding:.25rem .55rem;border-radius:8px;border:1px solid var(--v08);background:var(--v03);color:var(--tx2)}
.cot .pt{width:.5rem;height:.5rem;border-radius:50%;background:var(--tx3);flex:0 0 auto}
.cot.bon .pt{background:var(--tx-ok)}
.cot.mal{border-color:rgba(239,68,68,.35);color:var(--tx-err2)}
.cot.mal .pt{background:var(--tx-err)}
.cot.mal b{color:var(--tx-err)}
.cot.mal{flex-wrap:nowrap}
.cot .mt{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`;

function pageTransporteurs() {
  return `${TETE()}
<title>${T("Transporteurs — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.shipping}</span><h1>${T("Transporteurs")}</h1></div>
<div class="ro" id="ro" hidden>${T("Lecture seule : vous pouvez consulter, pas modifier.")}</div>
<div class="avert" id="avert" hidden></div>
<div class="tr-ong" id="onglets" role="tablist" aria-label="${T("Transporteurs")}"></div>
<div class="corps" id="corps"><div class="carte"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button id="b-tester" title="${T("Une vraie cotation vers Québec, 1 kg, pour chaque transporteur actif")}">${T("Tester la cotation")}</button>
  <button class="prim" id="b-save" disabled>${T("Enregistrer")}</button></div>
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
    if (actif) { b.textContent = '${T("⧉ Détacher")}'; b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); }; }
    else { b.textContent = '${T("⚓ Ancrer")}'; b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); }; }
  };
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var bsave = document.getElementById('b-save');
  var avertEl = document.getElementById('avert');
  var D = null, RO = false, OCCUPE = false, ONGLET = 'general';
  var PROVS = ['QC','ON','BC','AB','MB','SK','NS','NB','NL','PE','NT','NU','YT'];

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    secret_egal_id: '${T("Le Client Secret est identique au Client ID — il a sans doute été collé dans la mauvaise case.")}',
    session:            '${T("Aucune session ouverte. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès à la configuration.")}',
    lecture_seule:      '${T("Votre rôle est en lecture seule.")}',
    non_charge:         '${T("Les identifiants n’ont pas pu être rechargés. Cliquez « Réessayer » avant d’enregistrer.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    nuage:              '${T("L’enregistrement dans le nuage a échoué. Réessayez.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').'))
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
  // « Afficher » / « Masquer » : une seule écoute pour tous les champs secrets.
  document.addEventListener('click', function(ev){
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-voir]') : null;
    if (!b) return;
    var i = document.getElementById(b.getAttribute('data-voir'));
    if (!i) return;
    var montre = i.type === 'password';
    i.type = montre ? 'text' : 'password';
    b.textContent = montre ? '${T("Masquer")}' : '${T("Afficher")}';
  });
  function chk(id){ var e = document.getElementById(id); return !!(e && e.checked); }

  // Un champ SECRET (masqué) : « inchangé » si déjà défini, vide = conservé.
  function secretHtml(id, label, mask, place){
    var m = mask || { defini: false, fin: '' };
    return '<div class="ch"><label for="' + id + '">' + esc(label) + '</label>'
      /* ⚠ « AFFICHER » (2026-10-05) : coller une clé dans un champ masqué, c'est
         l'enregistrer sans l'avoir vue — la clé de test a été recollée à la place
         de celle de production sans que rien ne le montre. Le bouton ne montre
         QUE ce qui vient d'être tapé : la valeur enregistrée ne quitte jamais le
         site (« défini + 4 derniers »). */
      + '<div class="secret"><input class="mono" id="' + id + '" type="password" value="" placeholder="'
      + (m.defini ? '${T("inchangé")}' : esc(place || '')) + '" autocomplete="new-password"' + (RO ? ' disabled' : '') + '>'
      + '<button type="button" class="mini voir" data-voir="' + id + '"' + (RO ? ' disabled' : '') + '>${T("Afficher")}</button></div>'
      + '<div class="etat' + (m.defini ? '' : ' non') + '">'
      + (m.defini ? '<span class="rf-pill vert">${T("Enregistré")}</span><span class="rf-code">…' + esc(m.fin) + '</span>'
                  : '<span class="rf-pill ambre">${T("Aucun secret enregistré")}</span>') + '</div></div>';
  }
  function texteHtml(id, label, v, place, mono, aide){
    return '<div class="ch"><label for="' + id + '">' + esc(label) + '</label>'
      + '<input' + (mono ? ' class="mono"' : '') + ' id="' + id + '" value="' + esc(v || '') + '" placeholder="'
      + esc(place || '') + '"' + (RO ? ' disabled' : '') + '>'
      + (aide ? '<div class="aide">' + aide + '</div>' : '') + '</div>';
  }
  /* Mini-interrupteur (2026-10-04) : la case reste dessous, lue par .checked. */
  function basculeHtml(id, actif){
    return '<label class="bascule sz-inter-mini"><input type="checkbox" role="switch" id="' + id + '"' + (actif ? ' checked' : '')
      + (RO ? ' disabled' : '') + '><span class="sz-inter-g" aria-hidden="true"></span><span class="lbl-on">${T("Activer")}</span></label>';
  }

  // Les quatre transporteurs « simples » (identifiant + secret + n° de compte).
  var SIMPLES = [
    /* ⚠ PUROLATOR (2026-10-11, sa question : « on me demande un compte et un mot de passe, mais où
       mettre mon ID client et mon secret ? ») : c'est la MÊME paire sous deux noms. Le portail des
       développeurs Purolator donne une clé (Client ID / Key) et son mot de passe (Secret / Key
       Password) ; l'environnement de test fournit en plus trois comptes d'essai. Le compte
       EXPÉDITEUR de test se met dans « Numéro de compte » en mode test ; les deux autres sont gardés
       pour les essais (destinataire payeur, fret). */
    { cle: 'purolator', titre: 'Purolator', enId: 'pur-en',
      user: { id: 'pur-user', label: '${T("Client ID (clé)")}', champ: 'apiUsername', place: '${T("Client ID / Key fourni par Purolator")}' },
      sec:  { id: 'pur-pass', label: '${T("Secret (mot de passe de la clé)")}', champ: 'motDePasse', place: '••••••••' },
      acct: { id: 'pur-acct', label: '${T("Numéro de compte (en test : compte expéditeur de test)")}', place: '${T("Ex : 12345678")}' },
      mode: { id: 'pur-mode' },
      // La CLÉ du portail (3ᵉ identifiant, sa capture du 2026-10-11) : un secret, masqué comme les autres.
      // ⚠⚠ cleApi, JAMAIS cle : sp.cle EST le nom du transporteur (« purolator »). Nommée cle en 7.18.0,
      // elle l'écrasait — la fenêtre n'envoyait plus Purolator, la carte se redessinait vide (interrupteur qui
      // se désactive seul) et une case « Clé » sans identifiant paraissait sur les quatre cartes.
      cleApi: { id: 'pur-cle', label: '${T("Clé")}', champ: 'cleApi', place: '${T("Clé du portail Purolator")}' },
      tests: [{ id: 'pur-trecv', champ: 'testReceiverAccount', label: '${T("Compte destinataire de test")}' },
              { id: 'pur-tfret', champ: 'testFreightAccount', label: '${T("Numéro de compte de fret de test")}' }] },
    /* INTELCOM (2026-10-11, sa demande) : une clé d API (en-tête x-api-key) par environnement, le code
       client et le PRÉFIXE des numéros de suivi, choisis à l intégration avec Intelcom (le marchand
       fabrique ses numéros : 18 caractères au plus, préfixe compris). */
    { cle: 'intelcom', titre: 'Intelcom', enId: 'int-en',
      user: { id: 'int-client', label: '${T("Code client")}', champ: 'clientCode', place: '${T("Ex : SANDRIZA")}' },
      sec:  { id: 'int-cle', label: '${T("Clé API (x-api-key)")}', champ: 'cleApi', place: '••••••••' },
      acct: { id: 'int-prefixe', label: '${T("Préfixe des numéros de suivi")}', place: '${T("Ex : SZ")}' },
      mode: { id: 'int-mode' } },
    /* ESHIPPER (2026-10-11, sa décision) : courtier qui revend Purolator, UPS, FedEx, Canpar… à ses
       tarifs négociés. L API XML s authentifie par le nom d utilisateur et le mot de passe API donnés
       dans « My Account » du compte eShipper ; test.eshipper.com en essai, web.eshipper.com en réel.
       Cote au Canada et aux États-Unis ; le moins cher de ses services réguliers l emporte. */
    { cle: 'eshipper', titre: 'eShipper', enId: 'esh-en',
      user: { id: 'esh-user', label: '${T("Nom d’utilisateur API")}', champ: 'apiUsername', place: '${T("Dans « My Account » d’eShipper")}' },
      sec:  { id: 'esh-pass', label: '${T("Mot de passe API")}', champ: 'motDePasse', place: '••••••••' },
      acct: { id: 'esh-acct', label: '${T("Numéro de client (facultatif)")}', place: '${T("Ex : 123456")}' },
      mode: { id: 'esh-mode' } },
    { cle: 'fedex', titre: 'FedEx', enId: 'fdx-en',
      user: { id: 'fdx-cid', label: 'Client ID', champ: 'clientId', place: 'l7xxXXXXXXXX' },
      sec:  { id: 'fdx-sec', label: 'Client Secret', champ: 'clientSecret', place: '••••••••' },
      acct: { id: 'fdx-acct', label: '${T("Numéro de compte")}', place: '${T("Ex : 123456789")}' },
      mode: { id: 'fdx-mode' } },
    { cle: 'ups', titre: 'UPS', enId: 'ups-en',
      user: { id: 'ups-cid', label: 'Client ID', champ: 'clientId', place: 'votre_client_id' },
      sec:  { id: 'ups-sec', label: 'Client Secret', champ: 'clientSecret', place: '••••••••' },
      acct: { id: 'ups-acct', label: '${T("Numéro de compte (optionnel)")}', place: '${T("Ex : A1B2C3")}' } },
    { cle: 'canpar', titre: 'Canpar', enId: 'can-en',
      user: { id: 'can-user', label: '${T("Nom d’utilisateur")}', champ: 'apiUsername', place: '${T("votre@courriel.com")}' },
      sec:  { id: 'can-pass', label: '${T("Mot de passe")}', champ: 'motDePasse', place: '••••••••' },
      acct: { id: 'can-acct', label: '${T("Numéro de compte (optionnel)")}', place: '${T("Ex : 99999")}' } },
  ];

  /* ── L ETAT DE LA COTATION A LA CAISSE (2026-10-04) ─────────────────────
     FedEx etait active et rempli, mais absent de la caisse : ses identifiants
     d essai etaient refuses a la cotation, et rien ne le disait. La carte dit
     maintenant le dernier resultat — et le motif du transporteur, tel quel. */
  function etatCotationHtml(cle){
    var e = (D.cotation || {})[cle];
    if (!e || e.actif === false) return '';
    var quand = e.au ? ' · ' + esc(szQuand(e.au)) : '';
    /* Le mode test est un CHOIX, pas une faute (sa question du 2026-10-04) :
       pastille neutre, et l etat « jamais » dit quoi faire. */
    var env = e.mode === 'production' ? '' : ' <span class="rf-pill bleu">${T("mode test (sandbox)")}</span>';
    if (e.jamais) return '<div class="cot neutre">${T("Pas encore coté — cliquez « Tester la cotation » en bas de la fenêtre.")}' + env + '</div>';
    if (e.ok) return '<div class="cot bon"><span class="pt"></span>${T("Cote à la caisse")}'
      + (e.essai ? ' — ' + esc(e.essai.service || '') + ' : ' + esc(szArgent(e.essai.prix)) : '') + quand + env + '</div>';
    // Une seule ligne (la colonne ne doit pas defiler) ; le motif entier au survol.
    var motif = (e.code ? e.code + ' · ' : '') + (e.message || '');
    return '<div class="cot mal" title="' + esc(motif) + '"><span class="pt"></span><b>${T("Absent de la caisse")}</b>'
      + env + '<span class="mt">' + esc(motif) + '</span></div>';
  }
  /* LES ONGLETS EN SECTIONS (7.18.4) : en-tête (nom, interrupteur, état de cotation) puis des cartes
     par SUJET, côte à côte sur toute la largeur — Identifiants API, Compte et environnement, Comptes
     d essai. Mêmes ids qu avant : saisie() ne change pas. */
  function teteHtml(titre, enId, actif, cle){
    return '<div class="szr-tete"><h2>' + esc(titre) + '</h2>' + basculeHtml(enId, actif) + etatCotationHtml(cle) + '</div>';
  }
  function envHtml(id, mode, libTest){
    return '<div class="ch"><label for="' + id + '">${T("Environnement")}</label><select id="' + id + '"' + (RO ? ' disabled' : '') + '>'
      + '<option value="sandbox"' + ((mode || 'sandbox') === 'sandbox' ? ' selected' : '') + '>' + libTest + '</option>'
      + '<option value="production"' + (mode === 'production' ? ' selected' : '') + '>${T("Production")}</option></select></div>';
  }
  function carteSimpleHtml(sp){
    var d = (D.carriers || {})[sp.cle] || {};
    var h = teteHtml(sp.titre, sp.enId, d.enabled, sp.cle) + '<div class="szr-sections">';
    h += '<section class="szr-sec"><h3>${T("Identifiants API")}</h3><p class="szr-sous">${T("Fournis par le portail des développeurs du transporteur.")}</p>'
      + texteHtml(sp.user.id, sp.user.label, d[sp.user.champ], sp.user.place, true)
      + secretHtml(sp.sec.id, sp.sec.label, d[sp.sec.champ], sp.sec.place)
      + (sp.cleApi ? secretHtml(sp.cleApi.id, sp.cleApi.label, d[sp.cleApi.champ], sp.cleApi.place) : '')
      + '</section>';
    h += '<section class="szr-sec"><h3>${T("Compte et environnement")}</h3><p class="szr-sous">${T("Le numéro de compte facturé, et l’environnement d’essai ou réel.")}</p>'
      + texteHtml(sp.acct.id, sp.acct.label, d.accountNumber, sp.acct.place, false)
      + (sp.mode ? envHtml(sp.mode.id, d.mode, '${T("Test (sandbox)")}') : '')
      + '</section>';
    if (sp.tests) h += '<section class="szr-sec"><h3>${T("Comptes d’essai")}</h3><p class="szr-sous">${T("Donnés par le portail pour l’environnement de test : facturation au destinataire et fret.")}</p>'
      + sp.tests.map(function(t){ return texteHtml(t.id, t.label, d[t.champ], '', false); }).join('') + '</section>';
    return h + '</div>';
  }

  function cartePcHtml(){
    var pc = (D.carriers || {})['postes-canada'] || {};
    var m = pc.cle || { defini: false, fin: '' };
    var h = teteHtml('${T("Postes Canada")}', 'cp-en', pc.enabled, 'postes-canada') + '<div class="szr-sections">';
    /* ⚠ LA NOUVELLE PLATEFORME (2026-10-05) : Clé API et Secret collés ensemble, « clé:secret ». */
    h += '<section class="szr-sec"><h3>${T("Identifiants API")}</h3>'
      + '<div class="info">${T("Sur <b>developer-developpeur.canadapost-postescanada.ca</b>, ouvrez votre projet de ")}'
      + '${T("<b>production</b> : collez sa <b>Clé API</b> et son <b>Secret</b> ensemble, séparés par un deux-points ")}'
      + '${T("(clé:secret). Une clé de test ne donne que des prix d’exemple. L’ID contrat est à laisser vide sans entente commerciale.")}</div>'
      + secretHtml('cp-cle', '${T("Clé API:Secret")}', m, '${T("clé:secret")}') + '</section>';
    h += '<section class="szr-sec"><h3>${T("Compte et environnement")}</h3><p class="szr-sous">${T("Le numéro de client Postes Canada et, s’il y a lieu, le contrat commercial.")}</p>'
      + texteHtml('cp-cust', '${T("Numéro client")}', pc.customerNumber, '${T("Ex : 0001234567")}', false)
      + texteHtml('cp-contract', '${T("ID contrat")}', pc.contractId, '${T("Vide sans entente commerciale")}', false)
      + envHtml('cp-mode', pc.mode, '${T("Bac à sable (test)")}') + '</section>';
    return h + '</div>';
  }
  /* L ONGLET « GÉNÉRAL » : ce qui sert à TOUS les transporteurs — l adresse d expédition (enregistrée
     avec Postes Canada, lue par tous) et l autocomplétion d adresse à la caisse. */
  function carteGeneraleHtml(){
    var pc = (D.carriers || {})['postes-canada'] || {};
    var h = '<div class="szr-tete"><h2>${T("Général")}</h2></div><div class="szr-sections">';
    h += '<section class="szr-sec"><h3>${T("Adresse expéditeur (entrepôt / boutique)")}</h3><p class="szr-sous">${T("Le point de départ des colis : il sert à la cotation de tous les transporteurs.")}</p>'
      + '<div class="szr-duo">' + texteHtml('cp-oname', '${T("Nom / Boutique")}', pc.originName, 'SANDRIZA', false)
      + texteHtml('cp-ophone', '${T("Téléphone (sans tirets)")}', pc.originPhone, '5140000000', false) + '</div>'
      + texteHtml('cp-oaddr', '${T("Adresse (rue)")}', pc.originAddress, '', false)
      + '<div class="szr-duo">' + texteHtml('cp-ocity', '${T("Ville")}', pc.originCity, '${T("Montréal")}', false)
      + '<div class="ch"><label for="cp-oprov">${T("Province")}</label><select id="cp-oprov"' + (RO ? ' disabled' : '') + '>'
      + PROVS.map(function(p){ return '<option' + ((pc.originProvince || 'QC') === p ? ' selected' : '') + '>' + p + '</option>'; }).join('')
      + '</select></div></div>'
      + texteHtml('cp-opostal', '${T("Code postal (sans espace)")}', pc.originPostal, 'H1A1A1', false) + '</section>';
    h += '<section class="szr-sec"><h3>${T("Autocomplétion d’adresse à la caisse")}</h3><p class="szr-sous">${T("Propose l’adresse complète pendant que le client tape la sienne.")}</p>'
      + texteHtml('mapbox', '${T("Jeton Mapbox (public, pk.*)")}', D.mapbox, 'pk.xxxxxxxx', true,
      '${T("Gratuit sur account.mapbox.com. S’il est renseigné, il remplace AddressComplete (plus précis au Canada).")}') + '</section>';
    return h + '</div>';
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    // Filet : identifiants non chargés → on avertit et on n'écrit pas.
    if (D && D.charge === false) {
      avertEl.hidden = false;
      avertEl.innerHTML = '<b><span class="ic">⚠</span> ${T("Identifiants non chargés")}</b>${T(" — les identifiants API n’ont pas pu être ")}'
        + '${T("rechargés depuis le nuage cette session")}' + (D.raison ? ' (' + esc(D.raison) + ')' : '')
        + '${T(". <strong>N’enregistrez pas</strong> sans avoir cliqué « Réessayer », sinon vous risqueriez ")}'
        + '${T("d’effacer vos identifiants.")}<div class="g"><button id="b-retry">${T("↻ Réessayer le chargement")}</button></div>';
    } else { avertEl.hidden = true; }

    var pans = [{ k: 'general', n: '${T("Général")}', h: carteGeneraleHtml() },
                { k: 'postes-canada', n: '${T("Postes Canada")}', h: cartePcHtml() }];
    SIMPLES.forEach(function(sp){ pans.push({ k: sp.cle, n: sp.titre, h: carteSimpleHtml(sp) }); });
    if (!pans.some(function(p){ return p.k === ONGLET; })) ONGLET = 'general';
    corps.innerHTML = pans.map(function(p){
      return '<section class="pan" role="tabpanel" id="pan-' + p.k + '" aria-labelledby="ong-' + p.k + '"' + (p.k === ONGLET ? '' : ' hidden') + '>' + p.h + '</section>';
    }).join('');
    var ob = document.getElementById('onglets');
    if (ob) {
      ob.innerHTML = pans.map(function(p){
        var c = (D.carriers || {})[p.k], e = (D.cotation || {})[p.k];
        var pt = p.k === 'general' ? '' : (!c || !c.enabled) ? 'pt' : (e && e.ok) ? 'pt bon' : (e && e.actif !== false && !e.jamais && !e.ok) ? 'pt mal' : 'pt actif';
        var tit = p.k === 'general' ? '' : (!c || !c.enabled) ? '${T("Désactivé")}' : (e && e.ok) ? '${T("Actif — cote à la caisse")}' : (e && !e.jamais && !e.ok) ? '${T("Actif — ne cote pas")}' : '${T("Actif")}';
        return '<button type="button" role="tab" id="ong-' + p.k + '" data-ong="' + p.k + '" aria-controls="pan-' + p.k + '" aria-selected="' + (p.k === ONGLET) + '"'
          + ' class="' + (p.k === ONGLET ? 'on' : '') + '"' + (tit ? ' title="' + esc(tit) + '"' : '') + '>'
          + (pt ? '<span class="' + pt + '" aria-hidden="true"></span>' : '') + esc(p.n) + '</button>';
      }).join('');
      Array.prototype.forEach.call(ob.querySelectorAll('[data-ong]'), function(b){
        b.onclick = function(){ montrerOnglet(b.getAttribute('data-ong')); };
      });
    }
    brancher();
    // On n'autorise l'enregistrement que si la config complète est chargée.
    bsave.disabled = RO || OCCUPE || (D && D.charge === false);
  }

  // Changer d onglet ne redessine rien : les champs gardent ce qui vient d etre tapé.
  function montrerOnglet(k){
    ONGLET = k;
    Array.prototype.forEach.call(document.querySelectorAll('.pan'), function(p){ p.hidden = p.id !== 'pan-' + k; });
    Array.prototype.forEach.call(document.querySelectorAll('#onglets [data-ong]'), function(b){
      var on = b.getAttribute('data-ong') === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  function brancher(){
    var r = document.getElementById('b-retry');
    if (r) r.onclick = reessayer;
    var bt = document.getElementById('b-tester');
    if (bt) { bt.disabled = RO; bt.onclick = function(){
      bt.disabled = true; dire('${T("Cotation d’essai en cours… (jusqu’à 30 s)")}');
      appeler('config:transporteurs:tester').then(function(x){
        bt.disabled = false;
        if (!x || !x.ok) { dire(expliquer(x), 'err'); return; }
        D.cotation = x.cotation || {};
        dessiner();
        var mal = Object.keys(D.cotation).filter(function(k){ var e = D.cotation[k]; return e && e.actif !== false && !e.ok; });
        dire(mal.length ? '${T("Un transporteur actif n’a pas coté — voir sa carte.")}' : '${T("Tous les transporteurs actifs ont coté.")}', mal.length ? 'err' : 'bon');
      });
    }; }
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
      (sp.tests || []).forEach(function(t){ o[t.champ] = val(t.id); });
      if (sp.cleApi) o[sp.cleApi.champ] = val(sp.cleApi.id);
      s[sp.cle] = o;
    });
    s.mapbox = val('mapbox');
    return s;
  }

  function occuper(o){ OCCUPE = o; bsave.disabled = o || RO || (D && D.charge === false); }

  function enregistrer(){
    if (RO || OCCUPE || (D && D.charge === false)) return;
    occuper(true); dire('${T("Enregistrement…")}');
    appeler('config:transporteurs:ecrire', [saisie()]).then(function(r){
      occuper(false);
      /* ⚠ APRES L ENREGISTREMENT, ON RE-TESTE (2026-10-04) : la carte gardait
         l etat lu a l ouverture — « Absent de la caisse, 401 » alors que le
         nouveau secret fonctionnait deja. Une cotation d essai la met a jour. */
      if (r && r.ok) { D = r; RO = !r.peutModifier; dessiner(); dire('${T("Transporteurs enregistrés — vérification de la cotation…")}', 'bon');
        appeler('config:transporteurs:tester').then(function(x){
          if (!x || !x.ok) { dire('${T("Transporteurs enregistrés.")}', 'bon'); return; }
          D.cotation = x.cotation || {}; dessiner();
          var mal = Object.keys(D.cotation).filter(function(k){ var e = D.cotation[k]; return e && e.actif !== false && !e.ok; });
          dire(mal.length ? '${T("Enregistré — mais un transporteur actif ne cote pas : voir sa carte.")}' : '${T("Enregistré — tous les transporteurs actifs cotent.")}', mal.length ? 'err' : 'bon');
        }); }
      else if (r && r.motif === 'non_charge') { charger(); dire('${T("Identifiants non chargés — rechargez puis réessayez.")}', 'err'); }
      else dire(expliquer(r), 'err');
    });
  }
  bsave.onclick = enregistrer;

  function reessayer(){
    if (OCCUPE) return;
    occuper(true); dire('${T("Rechargement des identifiants…")}');
    appeler('config:transporteurs:reessayer').then(function(r){
      occuper(false);
      if (r && r.ok) { D = r; RO = !r.peutModifier; dessiner();
        dire(r.charge ? '${T("Identifiants rechargés.")}' : '${T("Toujours pas chargés.")}', r.charge ? 'bon' : 'err'); }
      else dire(expliquer(r), 'err');
    });
  }

  function charger(){
    dire('${T("Lecture…")}');
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
