'use strict';

/*
 * FENÊTRE « CAMPAGNES ET CHAÎNES » — NATIVE (2.1.0, palier 4)
 * =============================================================================
 * Deux onglets : les CAMPAGNES (un envoi, toute la liste, une fois) et les
 * CHAÎNES (des séquences qui partent toutes seules, selon un déclencheur).
 *
 * ⚠⚠ CE SONT DE VRAIS COURRIELS VERS DE VRAIES PERSONNES, et ils ne se
 * rattrapent pas. Les deux gestes qui envoient — « Envoyer » et « Traiter les
 * étapes échues » — sont armés en deux clics, annoncent d'avance combien de
 * personnes sont concernées, et rendent le verdict RÉEL (partis / échoués).
 *
 * ⚠ TROIS PIÈGES ANNONCÉS DANS LA FENÊTRE, parce qu'ils se paient en courriels :
 *   ① suspendre une chaîne n'arrête pas seulement ses envois — au traitement
 *      suivant, ses inscriptions en cours sont abandonnées pour de bon ;
 *   ② si « Séquences automatisées » est en pause dans les contrôles d'envoi,
 *      traiter ne ferait que brûler les inscriptions : c'est refusé, et dit ;
 *   ③ « en attente » n'est pas « échu » : seules les étapes dont le délai est
 *      écoulé partiront.
 *
 * ⚠ PÉRIMÈTRE PARTIEL, ET LA FENÊTRE LE DIT : la RÉDACTION du contenu (éditeur
 * visuel par blocs), la configuration Resend et l'offre de bienvenue restent à
 * l'écran Infolettre de la fenêtre principale.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:#8fa1b8}
input,button,textarea,select{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
button{cursor:pointer}
input:focus,button:focus,select:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
button.arme{border-color:#fbbf24;background:rgba(251,191,36,.16);color:#fde68a}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:#4ade80}.tuile .val.neutre{color:#8fa1b8}
.tuile .val.att{color:#fbbf24}.tuile .val.mal{color:#f87171}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte + .carte{margin-top:.5rem}
.chaine .entete{display:flex;align-items:flex-start;gap:.6rem;flex-wrap:wrap}
.chaine .entete h3{margin:0;font:700 .9rem/1.3 Georgia,serif}
.chaine .entete .gestes{margin-left:auto;display:flex;gap:.4rem;flex-wrap:wrap}
.chaine .desc{font-size:.76rem;color:#8fa1b8;margin-top:.1rem}
.chaine .compte{font-size:.74rem;color:#8fa1b8;margin:.45rem 0 .35rem}
.etapes{display:flex;flex-wrap:wrap;gap:.35rem}
.etape{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
  border-radius:8px;padding:.28rem .5rem;font-size:.72rem;max-width:15rem}
.etape .no{color:#c9a97e;font-weight:700}
.etape .suj{color:#cbd5e1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
table{width:100%;border-collapse:collapse;font-size:.85rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.3rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody tr:hover td{background:rgba(255,255,255,.04)}
.fin{white-space:nowrap;text-align:right}
.num{text-align:right;white-space:nowrap}
.dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pill.att{background:rgba(251,191,36,.16);color:#fbbf24}
.pill.acc{background:rgba(201,169,126,.16);color:#dcc39b}
.avis{border-radius:9px;padding:.42rem .65rem;font-size:.78rem;line-height:1.55}
.avis.att{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.32);color:#fde68a}
.avis.mal{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.34);color:#fca5a5}
.note{font-size:.73rem;color:#8fa1b8;line-height:1.6;border-top:1px solid rgba(255,255,255,.07);
  padding-top:.5rem;margin-top:.2rem}
.vide{padding:1.4rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Campagnes et chaînes ». */
function pageCampagnes(ongletDepart) {
  const dep = (ongletDepart === 'chaines') ? 'chaines' : 'campagnes';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Campagnes et chaînes — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">📣</span><h1>Campagnes et chaînes</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var ONGLET = ${JSON.stringify(dep)};   // campagnes | chaines
  var DC = null;             // donnees des campagnes
  var DH = null;             // donnees des chaines
  var Q = '';
  var ARME = '';             // un seul geste arme a la fois
  var OCCUPE = false;        // un envoi est en cours : on ne redessine pas

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function pluriel(n, mot){ return n + ' ' + mot + (n > 1 ? 's' : ''); }

  var _direT = null;
  function dire(t, cl){
    msg.className = 'msg' + (cl ? ' ' + cl : ''); msg.textContent = t || '';
    clearTimeout(_direT);
    if (t && cl === 'bon') _direT = setTimeout(function(){
      if (msg.textContent === t) { msg.textContent = ''; msg.className = 'msg'; }
    }, 4000);
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à l’infolettre.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps. L’envoi peut avoir continué : vérifiez le journal d’envoi avant de recommencer.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cet élément n’existe plus.',
    deja_envoyee:       'Cette campagne est déjà partie. Une campagne ne s’envoie pas deux fois.',
    resend_absent:      'Aucune clé Resend n’est configurée : rien ne peut partir. Écran Infolettre, onglet Configuration.',
    envois_suspendus:   'Les « Séquences automatisées » sont en pause dans les contrôles d’envoi. Traiter maintenant abandonnerait les inscriptions sans rien envoyer.',
    rien_en_attente:    'Aucune inscription en attente.',
    rien_echu:          'Des inscriptions attendent, mais aucune étape n’est échue : leur délai n’est pas écoulé.',
    refus:              'L’envoi a été refusé.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' ' + esc(String(r.detail).slice(0, 160));
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  function onglets(){
    return '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'campagnes' ? ' actif' : '') + '" data-onglet="campagnes">Campagnes</button>'
      + '<button class="mini' + (ONGLET === 'chaines' ? ' actif' : '') + '" data-onglet="chaines">Chaînes automatisées</button>'
      + (ONGLET === 'campagnes'
          ? '<input type="search" id="cp-q" placeholder="Nom ou sujet…" value="' + esc(Q) + '">' : '')
      + '</div>';
  }

  /* ── LE RENVOI VERS LE RESTE DE L ECRAN ───────────────────────────────────
     Regle nee de << ou sont mes configurations ? >> : une fenetre qui ne
     couvre qu une partie d un ecran doit dire ou trouver le reste. */
  function renvoi(){
    return '<div class="note">La <strong>rédaction du contenu</strong> (éditeur visuel), '
      + 'la <strong>configuration Resend</strong> et l’<strong>offre de bienvenue</strong> '
      + 'restent à l’écran Infolettre, dans la fenêtre principale. '
      + 'Le détail des envois se lit dans la fenêtre <strong>Journal d’envoi</strong>.</div>';
  }

  /* ══ ONGLET CAMPAGNES ═══════════════════════════════════════════════════ */
  function vueCampagnes(){
    var D = DC;
    if (!D) return '<div class="vide">Chargement…</div>';
    var q = Q.trim().toLowerCase();
    var rows = (D.campagnes || []).filter(function(c){
      if (!q) return true;
      return (String(c.nom) + ' ' + String(c.sujet)).toLowerCase().indexOf(q) !== -1;
    });

    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">Abonnés actifs</div><div class="val bon">'
      + (D.abonnesActifs || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Brouillons</div><div class="val neutre">'
      + (D.brouillons || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Campagnes parties</div><div class="val">'
      + (D.envoyees || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Courriels partis</div><div class="val">'
      + (D.courrielsEnvoyes || 0) + '</div>'
      + (D.courrielsEchoues ? '<div class="dt">' + pluriel(D.courrielsEchoues, 'échec') + '</div>' : '')
      + '</div></div>';

    /* Ce qui empeche un envoi, ou le detourne, se dit AVANT le clic. */
    if (!D.resendPret) {
      h += '<div class="avis mal">Aucune clé Resend n’est configurée : <strong>rien ne peut partir</strong>. '
        + 'Écran Infolettre → Configuration, dans la fenêtre principale.</div>';
    } else if (D.modeTest) {
      h += '<div class="avis att">Mode test allumé : les courriels partiront <strong>uniquement</strong> à '
        + esc(D.courrielTest) + ', et la campagne restera en brouillon. Les SMS, eux, ne partent pas du tout.</div>';
    }
    if (D.resendPret && D.expediteur) {
      h += '<div class="dt">Expéditeur : ' + esc(D.expediteur) + '</div>';
    }

    h += '<div class="carte">';
    if (!rows.length) {
      h += '<div class="vide">' + (q ? 'Rien ne correspond.'
        : 'Aucune campagne. Elles se rédigent à l’écran Infolettre, fenêtre principale.') + '</div>';
    } else {
      h += '<table><thead><tr><th>Campagne</th><th>Envoyé à</th><th>Canal</th>'
        + '<th class="num">Destinataires</th><th>État</th><th class="num">Partis / échecs</th>'
        + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + rows.map(function(c){
            var gestes = '';
            if (D.peutModifier) {
              if (c.etat !== 'sent') {
                var armeE = (ARME === 'env:' + c.id);
                gestes += '<button class="mini geste' + (armeE ? ' arme' : ' prim') + '" data-envoyer="'
                  + esc(c.id) + '"' + (D.resendPret || c.canal === 'sms' ? '' : ' disabled')
                  + '>' + (armeE ? 'Confirmer l’envoi ?' : 'Envoyer') + '</button> ';
              }
              var armeS = (ARME === 'sup:' + c.id);
              gestes += '<button class="mini geste danger' + (armeS ? ' arme' : '') + '" data-suppr="'
                + esc(c.id) + '">' + (armeS ? 'Confirmer ?' : 'Supprimer') + '</button>';
            }
            return '<tr><td><strong>' + esc(c.nom) + '</strong>'
              + '<div class="dt">' + esc(c.sujet) + '</div></td>'
              + '<td class="dt">' + esc(c.segmentLibelle) + '</td>'
              + '<td class="dt">' + esc(c.canalLibelle) + '</td>'
              + '<td class="num">' + (c.canal === 'sms' ? (D.smsDestinataires || 0) : c.destinataires)
              + (c.canal === 'both' ? ' + ' + (D.smsDestinataires || 0) + ' SMS' : '') + '</td>'
              + '<td><span class="pill ' + (c.etat === 'sent' ? 'bon' : (c.etat === 'sending' ? 'att' : 'neutre'))
              + '">' + esc(c.etatLibelle) + '</span>'
              + (c.date ? '<div class="dt">' + esc(c.date) + '</div>' : '') + '</td>'
              + '<td class="num">' + c.envoyes
              + (c.echecs ? ' / <span style="color:#f87171">' + c.echecs + '</span>' : '') + '</td>'
              + (D.peutModifier ? '<td class="fin">' + gestes + '</td>' : '') + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>' + renvoi();
    return h;
  }

  /* ══ ONGLET CHAINES ═════════════════════════════════════════════════════ */
  function vueChaines(){
    var D = DH;
    if (!D) return '<div class="vide">Chargement…</div>';

    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">Chaînes actives</div><div class="val bon">'
      + (D.actives || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Inscriptions en cours</div><div class="val">'
      + (D.enAttente || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Étapes échues</div><div class="val '
      + (D.dues ? 'att' : 'neutre') + '">' + (D.dues || 0) + '</div>'
      + '<div class="dt">prêtes à partir</div></div>'
      + '</div>';

    if (!D.envoisPermis) {
      h += '<div class="avis mal">Les « Séquences automatisées » sont <strong>en pause</strong> dans les '
        + 'contrôles d’envoi (écran Infolettre → Configuration). Aucune étape ne partira, et les traiter '
        + 'dans cet état abandonnerait les inscriptions sans rien envoyer.</div>';
    }

    if (D.peutModifier) {
      var armeT = (ARME === 'traiter');
      h += '<div class="barreoutils"><button class="mini' + (armeT ? ' arme' : ' prim') + '" id="cp-traiter"'
        + ((!D.dues || !D.envoisPermis) ? ' disabled' : '') + '>'
        + (armeT ? 'Confirmer — envoyer ' + pluriel(D.dues || 0, 'étape') + ' ?' : 'Traiter les étapes échues')
        + '</button>'
        + '<div class="droite">' + (D.dues
            ? pluriel(D.dues, 'étape') + ' échue' + ((D.dues > 1) ? 's' : '')
            : 'Rien d’échu pour l’instant') + '</div></div>';
    }

    if (!(D.chaines || []).length) {
      h += '<div class="carte"><div class="vide">Aucune chaîne. Elles se créent à l’écran Infolettre, '
        + 'fenêtre principale.</div></div>';
    } else {
      h += (D.chaines || []).map(function(ch){
        var gestes = '';
        if (D.peutModifier) {
          var armeB = (ARME === 'bas:' + ch.id);
          gestes += '<button class="mini geste' + (armeB ? ' arme' : '') + '" data-basculer="' + esc(ch.id)
            + '" data-active="' + (ch.active ? '0' : '1') + '">'
            + (armeB ? 'Confirmer ?' : (ch.active ? 'Suspendre' : 'Activer')) + '</button>';
          var armeS = (ARME === 'chsup:' + ch.id);
          gestes += '<button class="mini geste danger' + (armeS ? ' arme' : '') + '" data-chsuppr="'
            + esc(ch.id) + '">' + (armeS ? 'Confirmer ?' : 'Supprimer') + '</button>';
        }
        return '<div class="carte chaine">'
          + '<div class="entete"><div><h3>' + esc(ch.nom) + '</h3>'
          + (ch.description ? '<div class="desc">' + esc(ch.description) + '</div>' : '') + '</div>'
          + '<span class="pill ' + (ch.active ? 'bon' : 'neutre') + '">'
          + (ch.active ? 'Active' : 'Suspendue') + '</span>'
          + '<span class="pill acc">' + esc(ch.declencheurLibelle) + '</span>'
          + '<div class="gestes">' + gestes + '</div></div>'
          + '<div class="compte">' + pluriel((ch.etapes || []).length, 'étape') + ' · '
          + ch.inscriptionsActives + ' en cours · ' + ch.inscriptionsFinies + ' terminée'
          + (ch.inscriptionsFinies > 1 ? 's' : '') + '</div>'
          + ((ch.etapes || []).length
              ? '<div class="etapes">' + ch.etapes.map(function(e){
                  return '<div class="etape"><span class="no">' + e.no + '.</span> '
                    + esc(e.delai) + '<div class="suj">' + esc(e.sujet) + '</div></div>';
                }).join('') + '</div>'
              : '<div class="dt">Aucune étape : cette chaîne n’enverra rien.</div>')
          + '</div>';
      }).join('');
    }

    h += renvoi();
    return h;
  }

  function dessiner(){
    if (OCCUPE) return;
    if (sous) sous.textContent = (DC && !DC.peutModifier) || (DH && !DH.peutModifier)
      ? 'consultation seulement' : '';
    corps.innerHTML = onglets() + (ONGLET === 'chaines' ? vueChaines() : vueCampagnes());
    brancher();
  }

  function brancher(){
    var q = document.getElementById('cp-q');
    if (q) q.oninput = function(){ Q = q.value; redessinerSansPerdreLaSaisie(); };
    var bt = document.getElementById('cp-traiter');
    if (bt) bt.onclick = function(){
      if (ARME !== 'traiter') {
        ARME = 'traiter';
        dessiner();
        dire('Ces étapes partiront pour de bon, par courriel. Cliquez pour confirmer.', 'att');
        return;
      }
      ARME = '';
      OCCUPE = true;
      bt.disabled = true;
      bt.textContent = 'Envoi en cours…';
      dire('Envoi des étapes échues… ne fermez pas cette fenêtre.', 'att');
      appeler('chaines:traiter', []).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); charger(); return; }
        /* Le verdict dit ce qui est PARTI, pas ce qui a ete tente. */
        dire(pluriel(r.envoyes, 'courriel') + ' parti' + (r.envoyes > 1 ? 's' : '')
          + (r.echecs ? ', ' + pluriel(r.echecs, 'échec') : '')
          + ' sur ' + pluriel(r.traitees, 'étape') + ' traitée' + (r.traitees > 1 ? 's' : '') + '.',
          r.echecs ? 'att' : 'bon');
        charger();
      });
    };
  }

  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('cp-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('cp-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;

    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); ARME = ''; charger(); return; }

    var be = t.closest('[data-envoyer]');
    if (be && !be.disabled) {
      var idE = be.getAttribute('data-envoyer');
      var camp = (DC && DC.campagnes || []).filter(function(c){ return c.id === idE; })[0];
      if (ARME !== 'env:' + idE) {
        ARME = 'env:' + idE;
        dessiner();
        /* ⚠ On annonce le nombre et le canal AVANT : c est la derniere
           occasion de se raviser, et rien ne se rattrape apres. */
        var combien = camp
          ? (camp.canal === 'sms' ? ((DC.smsDestinataires || 0) + ' SMS')
             : (pluriel(camp.destinataires, 'courriel')
                + (camp.canal === 'both' ? ' et ' + (DC.smsDestinataires || 0) + ' SMS' : '')))
          : 'les destinataires';
        dire((DC && DC.modeTest)
          ? ('Mode test : un seul courriel partira, à ' + (DC.courrielTest || 'l’adresse de test') + '.')
          : ('Cliquez pour confirmer : ' + combien + ' vont partir, sans retour possible.'), 'att');
        return;
      }
      ARME = '';
      OCCUPE = true;
      be.disabled = true;
      be.textContent = 'Envoi…';
      dire('Envoi en cours… ne fermez pas cette fenêtre.', 'att');
      appeler('campagnes:envoyer', [idE]).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); charger(); return; }
        dire(esc(r.nom) + ' — ' + pluriel(r.envoyes, 'envoi') + ' réussi' + (r.envoyes > 1 ? 's' : '')
          + (r.echecs ? ', ' + pluriel(r.echecs, 'échec') : '')
          + (r.modeTest ? ' (mode test : la campagne reste en brouillon).' : '.'),
          r.echecs ? 'att' : 'bon');
        charger();
      });
      return;
    }

    var bs = t.closest('[data-suppr]');
    if (bs) {
      var idS = bs.getAttribute('data-suppr');
      if (ARME !== 'sup:' + idS) {
        ARME = 'sup:' + idS;
        dessiner();
        dire('Cliquez « Confirmer ? » — la campagne et ses images sont supprimées pour de bon.', 'att');
        return;
      }
      ARME = '';
      appeler('campagnes:supprimer', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(esc(r.nom) + ' supprimée.', 'bon');
        charger();
      });
      return;
    }

    var bb = t.closest('[data-basculer]');
    if (bb) {
      var idB = bb.getAttribute('data-basculer');
      var versActive = bb.getAttribute('data-active') === '1';
      var ch = (DH && DH.chaines || []).filter(function(c){ return c.id === idB; })[0];
      var enCours = ch ? ch.inscriptionsActives : 0;
      /* ⚠ SUSPENDRE N EST PAS METTRE EN PAUSE : au traitement suivant, les
         inscriptions en cours sont marquees faites et ne repartiront jamais.
         On ne l arme que s il y a vraiment quelque chose a perdre. */
      if (!versActive && enCours && ARME !== 'bas:' + idB) {
        ARME = 'bas:' + idB;
        dessiner();
        dire('Suspendre abandonnera ' + pluriel(enCours, 'inscription') + ' en cours : '
          + (enCours > 1 ? 'ces personnes ne recevront jamais' : 'cette personne ne recevra jamais')
          + ' la suite de la séquence. Cliquez pour confirmer.', 'att');
        return;
      }
      ARME = '';
      bb.disabled = true;
      appeler('chaines:basculer', [idB, versActive]).then(function(r){
        if (!r.ok) { bb.disabled = false; dire(expliquer(r), 'err'); return; }
        dire(esc(r.nom) + (r.active ? ' est active.' : ' est suspendue.')
          + (r.nuage ? '' : ' ⚠ Enregistré sur ce poste seulement — le nuage n’a pas confirmé.'),
          r.nuage ? 'bon' : 'att');
        charger();
      });
      return;
    }

    var bcs = t.closest('[data-chsuppr]');
    if (bcs) {
      var idC = bcs.getAttribute('data-chsuppr');
      var chS = (DH && DH.chaines || []).filter(function(c){ return c.id === idC; })[0];
      if (ARME !== 'chsup:' + idC) {
        ARME = 'chsup:' + idC;
        dessiner();
        dire('Cliquez « Confirmer ? » — la chaîne, ses étapes et '
          + pluriel(chS ? chS.inscriptionsActives : 0, 'inscription') + ' en cours disparaissent.', 'att');
        return;
      }
      ARME = '';
      appeler('chaines:supprimer', [idC]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(esc(r.nom) + ' supprimée'
          + (r.perdues ? ' — ' + pluriel(r.perdues, 'inscription') + ' abandonnée'
             + (r.perdues > 1 ? 's' : '') + '.' : '.')
          + (r.nuage ? '' : ' ⚠ Retiré sur ce poste seulement — le nuage n’a pas confirmé.'),
          r.nuage ? 'bon' : 'att');
        charger();
      });
      return;
    }

    /* Un clic sur une commande est traite par SA commande : sans cette garde,
       le clic remonterait ici et desarmerait ce qu il vient d armer. */
    if (t.closest('button, input, select, label')) return;
    if (ARME) { ARME = ''; dessiner(); }
  });

  function charger(){
    var op = (ONGLET === 'chaines') ? 'chaines:liste' : 'campagnes:liste';
    appeler(op, []).then(function(r){
      if (!r || !r.ok) {
        vide(ONGLET === 'chaines' ? 'Chaînes indisponibles' : 'Campagnes indisponibles', expliquer(r));
        return;
      }
      if (ONGLET === 'chaines') DH = r; else DC = r;
      dessiner();
    });
  }

  window.szActualiser = function(){
    if (OCCUPE || ARME) return;
    var q = document.getElementById('cp-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ if (!OCCUPE) charger(); };

  /* ── MODE ANCRE ── Le meme bouton que les autres ecrans. */
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);'
        + 'color:#e8edf5;cursor:pointer;flex:0 0 auto');
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

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      /* ⚠ Un envoi en cours ne se ferme pas d un coup d Echap. */
      if (OCCUPE) { dire('Un envoi est en cours : attendez le compte rendu.', 'att'); return; }
      if (ARME) { ARME = ''; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageCampagnes };
