'use strict';

/*
 * FENÊTRE « GARDIEN » — NATIVE (2026-10-08, défense contre un intrus, palier 2)
 * =============================================================================
 * Le gardien vit AU SERVEUR (lib-gardien.php) : il compte les gestes lourds de
 * chaque compte du personnel (suppressions de factures, d inventaire, de
 * clients, de photos, de listes de configuration, lectures complètes) sur une
 * fenêtre glissante. Au-delà du seuil, il refuse, ferme les sessions du compte,
 * le VERROUILLE et envoie une alerte par texto et par courriel.
 *
 * Cette fenêtre en montre trois choses, et n en décide aucune :
 *   1. les comptes verrouillés — et le geste qui les rouvre (deux clics) ;
 *   2. les 50 derniers gestes comptés (les lectures complètes exceptées : elles
 *      sont trop nombreuses et noieraient le reste) ;
 *   3. les réglages : interrupteur, fenêtre, seuils, destinataires des alertes.
 *
 * ⚠⚠ ENREGISTRER LES RÉGLAGES DÉCLENCHE UNE ALERTE, vers les ANCIENS et les
 * NOUVEAUX destinataires. C est voulu (turso-proxy.php, gardien_regler) : un
 * intrus qui a pris un compte super-administrateur et relève les seuils, ou
 * remplace le numéro d alerte par le sien, est vu. Le bouton le dit avant le
 * second clic — sans quoi la première alerte reçue ferait croire à une attaque.
 *
 * ⚠ SON PROPRE COMPTE NE SE DÉVERROUILLE PAS D ICI : il se rouvre par le lien
 * signé de l alerte. (Et une session verrouillée n ouvrirait pas cette fenêtre.)
 *
 * ⚠ SUPER-ADMINISTRATEUR SEULEMENT — vérifié dans le cœur (staff.js) ET au
 * serveur (require_superadmin). Cette fenêtre ne fait que dire le refus.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');

/* La langue du poste, résolue À LA GÉNÉRATION (voir src/langue/gardien.js).
   ⚠ Les noms, courriels, numéros et détails viennent du serveur : des DONNÉES. */
const T = require('../langue').tr('gardien');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.05rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barre{display:flex;gap:.45rem;align-items:center;flex-wrap:wrap}
button{font:inherit;color:var(--tx);background:var(--v05);cursor:pointer;
  border:1px solid var(--v16);border-radius:8px;padding:.28rem .55rem}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button:focus{outline:none;border-color:#c9a97e}
button.dgr{border-color:rgba(239,68,68,.5);color:var(--tx-err)}
button.dgr:hover:not(:disabled){background:rgba(239,68,68,.14)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d6b98f}
button.mini{font-size:.74rem;padding:.14rem .45rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h3{margin:0 0 .5rem;font:700 .92rem/1.2 Georgia,serif}
.note{font-size:.78rem;color:var(--tx2);line-height:1.6;background:var(--v03);
  border:1px solid var(--v07);border-radius:10px;padding:.5rem .7rem}
table{width:100%;border-collapse:collapse;font-size:.82rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.67rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.3rem .4rem;border-top:1px solid var(--v05);vertical-align:top}
.sub{font-size:.71rem;color:var(--tx2)}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.72rem}
.mut{color:var(--tx2)}
.tuiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem;flex:0 0 auto}
.tuile{background:var(--f-carte);border:1px solid var(--v07);min-width:0}
.tuile .sub{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.val.att{color:var(--tx-att)}
.val.err{color:var(--tx-err)}
.vide{padding:1.1rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.grille{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.55rem .8rem}
.champ{display:flex;flex-direction:column;gap:.2rem;min-width:0}
.champ label{font-size:.74rem;color:var(--tx2)}
.champ input,.champ textarea{font:inherit;font-size:.84rem;color:var(--tx);background:var(--v03);
  border:1px solid var(--v12);border-radius:8px;padding:.3rem .5rem;width:100%}
.champ textarea{min-height:4.2rem;resize:vertical;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
.champ input:focus,.champ textarea:focus{outline:none;border-color:#c9a97e}
.deux{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem .8rem;margin-top:.6rem}
.inter{display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem;font-size:.86rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Gardien ». */
function pageGardien() {
  return `${TETE()}
<title>${T("Gardien — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.securite}</span><h1>${T("Gardien")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide charge">${T("Lecture du gardien…")}</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES()}
  var corps = document.getElementById('corps');
  var sousEl = document.getElementById('sous');

  var ETAT = null;      // null = pas encore lu ; sinon { cfg, verrous, evenements }
  var CONF = '';        // confirmation deux clics : '' | 'regler' | user_id
  var SALE = false;     // le formulaire des réglages a été touché : on ne le redessine pas
  var OCC = false;
  var TIMER = null;
  var CATS = ['finances', 'inventaire', 'clients', 'photos', 'donnees', 'export'];
  var NOMS = {
    finances:   '${T("Finances (factures, remboursements, crédits)")}',
    inventaire: '${T("Inventaire (produits, stock mis à zéro)")}',
    clients:    '${T("Clients")}',
    photos:     '${T("Photos")}',
    donnees:    '${T("Listes de configuration")}',
    export:     '${T("Lectures complètes (alerte seulement)")}'
  };
  var COURTS = {
    finances: '${T("Finances")}', inventaire: '${T("Inventaire")}', clients: '${T("Clients")}',
    photos: '${T("Photos")}', donnees: '${T("Configuration")}', export: '${T("Lectures complètes")}'
  };

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function fdate(sec){
    var n = Number(sec); if (!n) return '';
    try { return new Date(n * 1000).toLocaleString('${LIEU()}', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return ''; }
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application.")}',
    droit:              '${T("Seul un super-administrateur peut voir et régler le gardien.")}',
    soi:                '${T("Votre propre compte se déverrouille par le lien reçu dans l’alerte.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 120)) + ')';
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

  function qui(l){
    var h = '<div class="rf-nom">' + (l.nom ? esc(l.nom) : '<em class="mut">${T("compte inconnu")}</em>')
      + (l.moi ? ' <span class="rf-pill bleu">${T("vous")}</span>' : '') + '</div>';
    h += '<div class="sub">' + (l.courriel ? esc(l.courriel) + ' · ' : '') + '<span class="mono">' + esc(l.user_id || '') + '</span></div>';
    return h;
  }

  /* ── LES COMPTES VERROUILLÉS ─────────────────────────────────────────── */
  function zoneVerrous(){
    var v = ETAT.verrous || [];
    var h = '<div class="carte"><h3>${T("Comptes verrouillés (")}' + v.length + ')</h3>';
    if (!v.length) return h + '<div class="vide">${T("Aucun compte verrouillé.")}</div></div>';
    h += '<table><thead><tr><th>${T("Compte")}</th><th>${T("Depuis")}</th><th>${T("Motif")}</th><th></th></tr></thead><tbody>';
    for (var i = 0; i < v.length; i++) {
      var l = v[i];
      h += '<tr><td>' + qui(l) + '</td>'
        + '<td style="white-space:nowrap">' + esc(fdate(l.le)) + '</td>'
        + '<td>' + esc(COURTS[l.cat] || l.cat || '') + (l.total ? ' · ' + esc(l.total) + '${T(" gestes")}' : '')
        + (l.detail ? '<div class="sub">' + esc(String(l.detail).slice(0, 160)) + '</div>' : '') + '</td>'
        + '<td style="text-align:right">' + (l.moi
            ? '<span class="sub">${T("par le lien de l’alerte")}</span>'
            : '<button class="mini dgr" data-dev="' + esc(l.user_id) + '">'
              + (CONF === String(l.user_id) ? '${T("✓ Confirmer")}' : '<span class="ic" aria-hidden="true">🔓</span>${T(" Déverrouiller")}')
              + '</button>') + '</td></tr>';
    }
    return h + '</tbody></table>'
      + '<div class="sub" style="margin-top:.45rem">${T("Déverrouiller rouvre la connexion de ce compte et remet son compteur à zéro. Vérifiez d’abord, dans les événements ci-dessous, que les gestes étaient bien les siens.")}</div></div>';
  }

  /* ── LES DERNIERS ÉVÉNEMENTS ─────────────────────────────────────────── */
  function zoneEvenements(){
    var e = ETAT.evenements || [];
    var h = '<div class="carte"><h3>${T("Derniers gestes comptés (")}' + e.length + ')</h3>'
      + '<div class="sub" style="margin:0 0 .5rem">${T("Les 50 plus récents. Les lectures complètes n’y figurent pas : trop nombreuses, elles noieraient le reste.")}</div>';
    if (!e.length) return h + '<div class="vide">${T("Aucun geste compté.")}</div></div>';
    h += '<table><thead><tr><th>${T("Quand")}</th><th>${T("Compte")}</th><th>${T("Catégorie")}</th><th>${T("Nombre")}</th><th>${T("Détail")}</th><th>${T("Adresse IP")}</th></tr></thead><tbody>';
    for (var i = 0; i < e.length; i++) {
      var l = e[i];
      h += '<tr><td style="white-space:nowrap">' + esc(fdate(l.ts)) + '</td>'
        + '<td>' + qui(l) + '</td>'
        + '<td>' + esc(COURTS[l.cat] || l.cat || '') + '</td>'
        + '<td>' + esc(l.n || '') + '</td>'
        + '<td class="sub">' + esc(String(l.detail || '').slice(0, 160)) + '</td>'
        + '<td class="mono">' + esc(l.ip || '') + '</td></tr>';
    }
    return h + '</tbody></table></div>';
  }

  /* ── LE JOURNAL INVIOLABLE (palier 3) ─────────────────────────────────
     Écrit par le serveur seul, jamais réécrit. Les lignes qui disent qu on a
     TOUCHÉ au journal d accès (entrée réécrite, retirée, journal remplacé en
     bloc) sont mises en avant : c est exactement ce qu un intrus ferait. */
  var SOURCES = {
    serveur: '${T("Serveur")}', poste: '${T("Poste")}',
    reecrit: '${T("Entrée réécrite")}', retrait: '${T("Entrée retirée")}', bloc: '${T("Journal remplacé")}'
  };
  function zoneJournal(){
    var j = ETAT.journal || [];
    var touches = j.filter(function(l){ return l.src === 'reecrit' || l.src === 'retrait' || l.src === 'bloc'; }).length;
    var h = '<div class="carte"><h3>${T("Journal inviolable (")}' + j.length + ')</h3>'
      + '<div class="sub" style="margin:0 0 .5rem">${T("Les 100 dernières entrées. Écrit par le serveur seul : aucune session, même super-administrateur, ne peut le modifier ni le vider. Une entrée du journal d’accès réécrite ou retirée y laisse une trace.")}</div>';
    if (touches) h += '<div class="note" style="margin:0 0 .5rem;color:var(--tx-att)">' + touches
      + (touches > 1 ? '${T(" modifications du journal d’accès dans ces entrées — vérifiez qui les a faites.")}'
                     : '${T(" modification du journal d’accès dans ces entrées — vérifiez qui l’a faite.")}') + '</div>';
    if (!j.length) return h + '<div class="vide">${T("Aucune entrée pour l’instant.")}</div></div>';
    h += '<table><thead><tr><th>${T("Quand")}</th><th>${T("Compte")}</th><th>${T("Action")}</th><th>${T("Origine")}</th><th>${T("Adresse IP")}</th></tr></thead><tbody>';
    for (var i = 0; i < j.length; i++) {
      var l = j[i];
      var vif = l.src === 'reecrit' || l.src === 'retrait' || l.src === 'bloc';
      h += '<tr><td style="white-space:nowrap">' + esc(fdate(l.ts)) + '</td>'
        + '<td>' + (l.user_id ? qui(l) : '<span class="mut">—</span>') + '</td>'
        + '<td>' + esc(String(l.action || '').slice(0, 220))
        + (l.section ? '<div class="sub">' + esc(l.section) + '</div>' : '') + '</td>'
        + '<td style="white-space:nowrap' + (vif ? ';color:var(--tx-att);font-weight:700' : '') + '">' + (vif ? '<span class="ic" aria-hidden="true">⚠</span> ' : '') + esc(SOURCES[l.src] || l.src || '') + '</td>'
        + '<td class="mono">' + esc(l.ip || '') + '</td></tr>';
    }
    return h + '</tbody></table></div>';
  }

  /* ── LES RÉGLAGES ────────────────────────────────────────────────────── */
  function zoneReglages(){
    var c = ETAT.cfg || {};
    var s = c.seuils || {};
    var h = '<div class="carte" id="z-cfg"><h3>${T("Réglages")}</h3>'
      + '<label class="inter"><input type="checkbox" id="g-actif"' + (c.actif !== false ? ' checked' : '') + '> '
      + '${T("Gardien actif")}</label>'
      + '<div class="grille"><div class="champ"><label for="g-fen">${T("Fenêtre de comptage (minutes)")}</label>'
      + '<input id="g-fen" type="number" min="1" max="1440" value="' + esc(c.fenetreMin || 10) + '"></div></div>'
      + '<div class="sub" style="margin:.6rem 0 .35rem">${T("Seuils : au-delà, dans la fenêtre, le geste est refusé et le compte verrouillé.")}</div>'
      + '<div class="grille">';
    for (var i = 0; i < CATS.length; i++) {
      h += '<div class="champ"><label for="g-s-' + CATS[i] + '">' + NOMS[CATS[i]] + '</label>'
        + '<input id="g-s-' + CATS[i] + '" type="number" min="1" max="100000" value="' + esc(s[CATS[i]] || '') + '"></div>';
    }
    h += '</div><div class="deux">'
      + '<div class="champ"><label for="g-tel">${T("Textos d’alerte (un numéro par ligne, ex. +14185551234)")}</label>'
      + '<textarea id="g-tel">' + esc((c.alerteTel || []).join('\\n')) + '</textarea></div>'
      + '<div class="champ"><label for="g-mel">${T("Courriels d’alerte (un par ligne)")}</label>'
      + '<textarea id="g-mel">' + esc((c.alerteCourriel || []).join('\\n')) + '</textarea></div></div>'
      + '<div class="sub" style="margin-top:.45rem">${T("Le courriel de l’entreprise reçoit aussi chaque alerte.")}</div>'
      + '<div class="barre" style="margin-top:.6rem"><button class="prim" id="g-save">'
      + (CONF === 'regler' ? '${T("✓ Confirmer — une alerte partira")}' : '${T("Enregistrer les réglages")}') + '</button>'
      + (SALE ? '<button id="g-annuler">${T("Annuler les modifications")}</button>' : '') + '</div>'
      + '<div class="note" style="margin-top:.6rem">${T("Chaque enregistrement envoie une alerte aux anciens ET aux nouveaux destinataires : personne ne peut changer les seuils ou les numéros en silence.")}</div>'
      + '</div>';
    return h;
  }

  function lignes(id){
    var el = document.getElementById(id);
    return String(el ? el.value : '').split(/[\\n,;]+/).map(function(x){ return x.trim(); }).filter(Boolean);
  }
  function lireForm(){
    var cfg = { actif: !!(document.getElementById('g-actif') || {}).checked, seuils: {} };
    var fen = parseInt((document.getElementById('g-fen') || {}).value, 10);
    if (!(fen >= 1 && fen <= 1440)) return { faute: '${T("La fenêtre doit être entre 1 et 1440 minutes.")}' };
    cfg.fenetreMin = fen;
    for (var i = 0; i < CATS.length; i++) {
      var n = parseInt((document.getElementById('g-s-' + CATS[i]) || {}).value, 10);
      if (!(n >= 1 && n <= 100000)) return { faute: '${T("Chaque seuil doit être un nombre entre 1 et 100000 : ")}' + NOMS[CATS[i]] };
      cfg.seuils[CATS[i]] = n;
    }
    var tel = lignes('g-tel').map(function(t){ return t.replace(/[\\s().-]/g, ''); });
    for (var j = 0; j < tel.length; j++) {
      if (!/^\\+[1-9][0-9]{7,14}$/.test(tel[j])) return { faute: '${T("Numéro invalide (forme +14185551234) : ")}' + esc(tel[j]) };
    }
    var mel = lignes('g-mel');
    for (var k = 0; k < mel.length; k++) {
      if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(mel[k])) return { faute: '${T("Courriel invalide : ")}' + esc(mel[k]) };
    }
    if (!tel.length && !mel.length) return { faute: '${T("Gardez au moins un destinataire : sans lui, une alerte ne partirait que vers le courriel de l’entreprise.")}' };
    cfg.alerteTel = tel; cfg.alerteCourriel = mel;
    return { cfg: cfg };
  }

  function dessiner(){
    if (ETAT === null) { corps.innerHTML = '<div class="vide charge">${T("Lecture du gardien…")}</div>'; return; }
    var c = ETAT.cfg || {};
    var nv = (ETAT.verrous || []).length;
    sousEl.textContent = c.actif === false ? '${T("gardien ÉTEINT")}'
      : (nv ? (nv + (nv > 1 ? '${T(" comptes verrouillés")}' : '${T(" compte verrouillé")}')) : '${T("actif · aucun compte verrouillé")}');

    var tu = function(lib, val, sous, ton){
      return '<div class="tuile"><div class="lbl">' + lib + '</div><div class="val' + (ton ? ' ' + ton : '') + '">'
        + val + '</div><div class="sub">' + sous + '</div></div>';
    };
    var h = szTuiles('<div class="tuiles">'
      + tu('${T("État")}', c.actif === false ? '${T("Éteint")}' : '${T("Actif")}', '${T("le serveur compte les gestes lourds")}', c.actif === false ? 'err' : '')
      + tu('${T("Comptes verrouillés")}', nv, '${T("connexion refusée")}', nv ? 'att' : '')
      + tu('${T("Fenêtre")}', esc(c.fenetreMin || 10) + ' min', '${T("durée de comptage")}', '')
      + '</div>');
    if (c.actif === false) h += '<div class="note">${T("Le gardien est éteint : aucun geste n’est compté, aucun compte ne sera verrouillé, aucune alerte ne partira.")}</div>';
    h += '<div class="barre"><button class="mini" id="g-reload"><span class="ic">🔄</span>${T(" Actualiser")}</button></div>';
    h += '<div id="z-vivant">' + zoneVerrous() + '<div style="height:.7rem"></div>' + zoneEvenements() + '<div style="height:.7rem"></div>' + zoneJournal() + '</div>';
    h += zoneReglages();
    corps.innerHTML = h;
    brancher();
  }
  /* Le rafraîchissement automatique ne touche QUE la partie vivante : un
     formulaire qu on est en train de remplir ne se réécrit pas sous les doigts. */
  function redessinerVivant(){
    var z = document.getElementById('z-vivant');
    if (!z || !SALE) { dessiner(); return; }
    z.innerHTML = zoneVerrous() + '<div style="height:.7rem"></div>' + zoneEvenements() + '<div style="height:.7rem"></div>' + zoneJournal();
    brancherVivant();
  }

  function brancherVivant(){
    var us = corps.querySelectorAll('[data-dev]');
    for (var u = 0; u < us.length; u++) {
      us[u].onclick = function(){
        var id = this.getAttribute('data-dev');
        if (CONF === id) { CONF = ''; deverrouiller(id); }
        else { CONF = id; redessinerVivant(); dire('${T("Cliquez encore pour rouvrir ce compte.")}', 'att'); }
      };
    }
  }
  function brancher(){
    brancherVivant();
    var gr = document.getElementById('g-reload');
    if (gr) gr.onclick = function(){ CONF = ''; charger(true); };
    var zc = document.getElementById('z-cfg');
    if (zc) zc.addEventListener('input', function(){
      if (!SALE) { SALE = true; var b = document.getElementById('g-save'); if (b && b.parentNode && !document.getElementById('g-annuler')) {
        var a = document.createElement('button'); a.id = 'g-annuler'; a.textContent = '${T("Annuler les modifications")}';
        a.onclick = annuler; b.parentNode.appendChild(a); } }
      if (CONF === 'regler') { CONF = ''; var bs = document.getElementById('g-save'); if (bs) bs.textContent = '${T("Enregistrer les réglages")}'; }
    });
    var ga = document.getElementById('g-annuler');
    if (ga) ga.onclick = annuler;
    var gs = document.getElementById('g-save');
    if (gs) gs.onclick = function(){
      var f = lireForm();
      if (f.faute) { CONF = ''; this.textContent = '${T("Enregistrer les réglages")}'; dire(f.faute, 'err'); return; }
      if (CONF === 'regler') { CONF = ''; regler(f.cfg); return; }
      CONF = 'regler';
      this.textContent = '${T("✓ Confirmer — une alerte partira")}';
      dire('${T("Cliquez encore : une alerte partira aux anciens et aux nouveaux destinataires.")}', 'att');
    };
  }
  function annuler(){ SALE = false; CONF = ''; dessiner(); dire(''); }

  function deverrouiller(id){
    if (OCC) return; OCC = true; dire('${T("Déverrouillage…")}');
    appeler('gardien:deverrouiller', [id]).then(function(r){
      OCC = false;
      if (!r.ok) { dire(expliquer(r), 'err'); redessinerVivant(); return; }
      ETAT = { cfg: SALE ? ETAT.cfg : r.cfg, verrous: r.verrous || [], evenements: r.evenements || [], journal: r.journal || [] };
      redessinerVivant();
      dire('${T("Compte rouvert : il peut se connecter de nouveau.")}', 'bon');
    });
  }
  function regler(cfg){
    if (OCC) return; OCC = true; dire('${T("Enregistrement…")}');
    appeler('gardien:regler', [cfg]).then(function(r){
      OCC = false;
      if (!r.ok) { dire(expliquer(r), 'err'); dessinerBouton(); return; }
      ETAT = { cfg: r.cfg, verrous: r.verrous || [], evenements: r.evenements || [], journal: r.journal || [] };
      SALE = false; dessiner();
      dire('${T("Réglages enregistrés — l’alerte de changement est partie.")}', 'bon');
    });
  }
  function dessinerBouton(){ var b = document.getElementById('g-save'); if (b) b.textContent = '${T("Enregistrer les réglages")}'; }

  function charger(fort){
    if (OCC) return;
    appeler('gardien:etat', []).then(function(r){
      if (!r || !r.ok) {
        if (ETAT === null) corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        if (fort) dire(expliquer(r), 'err');
        return;
      }
      var premier = ETAT === null;
      ETAT = { cfg: (SALE && ETAT) ? ETAT.cfg : r.cfg, verrous: r.verrous || [], evenements: r.evenements || [], journal: r.journal || [] };
      if (premier || (fort && !SALE)) dessiner(); else redessinerVivant();
      if (fort) dire('');
    });
  }

  /* Suivi toutes les 15 s : un verrouillage doit se voir sans cliquer. On ne
     redessine pas pendant une confirmation (le bouton armé disparaîtrait). */
  function suivre(){
    if (TIMER) return;
    TIMER = setInterval(function(){
      if (document.hidden || OCC || CONF) return;
      charger(false);
    }, 15000);
  }
  window.addEventListener('pagehide', function(){ if (TIMER) { clearInterval(TIMER); TIMER = null; } });

  window.szActualiser = function(){ if (!CONF) charger(false); };
  window.szRevenir = function(){ charger(!SALE); };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  charger(true);
  suivre();
})();
</script>
</body></html>`;
}

module.exports = { pageGardien };
