'use strict';

/*
 * FENÊTRE « FIDÉLISATION ET SONDAGES » — NATIVE (1.71.0, palier 4)
 * =============================================================================
 * Trois onglets : SONDAGES (avec leur taux de réponse et le dépouillement
 * question par question), RÉCOMPENSES (les codes émis et leur usage) et
 * INVITATIONS (celles qui sont parties, répondues ou non).
 *
 * ⚠ NE COUVRE PAS LA CRÉATION D'UN SONDAGE : son bâtisseur de questions est un
 * formulaire à part entière, qui mérite son propre passage. Une fenêtre qui
 * fait bien ce qu'elle annonce vaut mieux qu'une qui fait tout à moitié.
 *
 * ⚠ SUPPRIMER UN SONDAGE DÉTRUIT SES RÉPONSES. Elles ne se reconstituent pas :
 * la confirmation annonce combien vont disparaître. Supprimer des invitations,
 * en revanche, laisse les réponses déjà reçues — et le dit aussi.
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
input,button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:#4ade80}
.tuile .sub{font-size:.66rem;color:#8fa1b8;margin-top:.1rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:#8fa1b8;font-weight:700}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.32rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody tr:hover td{background:rgba(255,255,255,.04)}
tbody tr[data-sondage]{cursor:pointer}
.num{text-align:right;white-space:nowrap}
.fin{white-space:nowrap;text-align:right}
.code{font-family:'Courier New',monospace;letter-spacing:1px;font-weight:700;
  background:rgba(255,255,255,.06);border-radius:4px;padding:.06rem .4rem}
.dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:42rem;width:100%;max-height:88vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .6rem;font:700 .98rem/1.3 Georgia,serif;display:flex;
  align-items:center;gap:.5rem;flex-wrap:wrap}
.q{border-top:1px solid rgba(255,255,255,.07);padding:.5rem 0}
.q:first-of-type{border-top:0}
.q .txt{font-weight:600;font-size:.88rem}
.q .mots{margin-top:.3rem;display:flex;flex-direction:column;gap:.25rem}
.q .mot{font-size:.83rem;background:rgba(255,255,255,.04);border-radius:8px;
  padding:.25rem .5rem;white-space:pre-wrap;overflow-wrap:anywhere}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.85rem;flex-wrap:wrap}
.vide{padding:1.3rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Fidélisation et sondages ». */
function pageFidelisation() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Fidélisation et sondages — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🎯</span><h1>Fidélisation et sondages</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement… (les réponses se resynchronisent)</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var ONGLET = 'sondages';   // sondages | recompenses | invitations
  var DETAIL = null;
  var ARME = '';             // id de sondage armé, ou '__invites'

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
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
    droit:              'Votre rôle ne donne pas accès à la fidélisation.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cet élément n’existe plus.',
    courriel:           'Adresse courriel invalide.',
    rien:               'Il n’y a aucune invitation à supprimer.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 140)) + ')';
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

  function vueSondages(){
    var t = D.tuiles || {};
    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">Invitations</div><div class="val">' + (t.invitations || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Réponses</div><div class="val bon">' + (t.reponses || 0) + '</div>'
      + '<div class="sub">taux de ' + (t.taux || 0) + ' %</div></div>'
      + '<div class="tuile"><div class="lbl">Note moyenne</div><div class="val">'
      + (t.note == null ? '—' : t.note + ' / 5') + '</div>'
      + '<div class="sub">' + (t.nbNotes || 0) + ' évaluation' + ((t.nbNotes || 0) > 1 ? 's' : '') + '</div></div>'
      + '<div class="tuile"><div class="lbl">Codes récompense</div><div class="val">' + (t.codes || 0) + '</div>'
      + '<div class="sub">' + (t.codesUtilises || 0) + ' utilisé' + ((t.codesUtilises || 0) > 1 ? 's' : '') + '</div></div>'
      + '</div>';

    if (D.peutModifier) {
      h += '<div class="carte"><h2>Notification des commentaires</h2>'
        + '<div class="dt" style="margin-bottom:.4rem">Quand une cliente laisse un commentaire, '
        + 'il vous est transféré à cette adresse. Laissez vide pour ne rien recevoir.</div>'
        + '<div style="display:flex;gap:.5rem;flex-wrap:wrap">'
        + '<input type="email" id="fi-mail" style="flex:1 1 16rem" value="' + esc(D.courrielNotification || '') + '" placeholder="sondages@exemple.com">'
        + '<button class="mini" id="fi-mail-enr">Enregistrer</button></div></div>';
    }

    h += '<div class="carte"><h2>Sondages</h2>';
    if (!(D.sondages || []).length) {
      h += '<div class="vide">Aucun sondage configuré.'
        + '<div style="margin-top:.35rem">La création se fait dans l’écran Fidélisation de la fenêtre principale.</div></div>';
    } else {
      h += '<table><thead><tr><th>Nom</th><th>Déclencheur</th><th class="num">Questions</th>'
        + '<th class="num">Invitations</th><th class="num">Réponses</th><th class="num">Taux</th>'
        + '<th>Récompense</th><th>État</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + D.sondages.map(function(s){
            return '<tr data-sondage="' + esc(s.id) + '" title="Voir le dépouillement">'
              + '<td><strong>' + esc(s.nom) + '</strong></td>'
              + '<td class="dt">' + esc(s.declencheur) + '</td>'
              + '<td class="num">' + s.nbQuestions + '</td>'
              + '<td class="num">' + s.invitations + '</td>'
              + '<td class="num">' + s.reponses + '</td>'
              + '<td class="num">' + s.taux + ' %</td>'
              + '<td>' + (s.recompense ? '<span class="pill bon">' + esc(s.recompense) + '</span>'
                                       : '<span class="dt">aucune</span>') + '</td>'
              + '<td><span class="pill ' + (s.actif ? 'bon' : 'neutre') + '">'
              + (s.actif ? 'Actif' : 'Inactif') + '</span></td>'
              + (D.peutModifier
                  ? '<td class="fin"><button class="mini geste danger" data-suppr-sondage="' + esc(s.id) + '">'
                    + (ARME === s.id ? 'Confirmer ?' : 'Supprimer') + '</button></td>'
                  : '')
              + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';
    return h;
  }

  function vueRecompenses(){
    var rs = D.recompenses || [];
    var h = '<div class="carte"><h2>Codes de récompense</h2>';
    if (!rs.length) {
      h += '<div class="vide">Aucune récompense générée pour l’instant.</div>';
    } else {
      h += '<table><thead><tr><th>Code</th><th>Sondage</th><th>Commande</th>'
        + '<th>Répondu le</th><th>Utilisé</th></tr></thead><tbody>'
        + rs.map(function(r){
            return '<tr><td><span class="code">' + esc(r.code) + '</span></td>'
              + '<td>' + esc(r.sondage) + '</td>'
              + '<td class="dt">' + esc(r.commande || '—') + '</td>'
              + '<td class="dt">' + esc(r.date) + '</td>'
              + '<td>' + (r.utilise ? '<span class="pill bon">utilisé</span>'
                                    : '<span class="pill neutre">non</span>') + '</td></tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';
    return h;
  }

  function vueInvitations(){
    var iv = D.invitations || [];
    var h = '<div class="barreoutils"><div class="droite">'
      + (D.peutModifier && iv.length
          ? '<button class="mini danger" id="fi-vider">'
            + (ARME === '__invites' ? 'Confirmer ?' : 'Tout supprimer') + '</button>' : '')
      + '<span>' + iv.length + ' invitation' + (iv.length > 1 ? 's' : '') + '</span></div></div>';
    h += '<div class="carte">';
    if (!iv.length) {
      h += '<div class="vide">Aucune invitation.'
        + '<div style="margin-top:.35rem">Elles partent d’elles-mêmes à la confirmation d’une commande '
        + 'ou à son passage en « Livrée ».</div></div>';
    } else {
      h += '<table><thead><tr><th>Date</th><th>Sondage</th><th>Destinataire</th>'
        + '<th>Déclencheur</th><th>État</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + iv.map(function(i){
            return '<tr><td class="dt">' + esc(i.date) + '</td>'
              + '<td>' + esc(i.sondage) + '</td>'
              + '<td>' + esc(i.courriel || '—') + '</td>'
              + '<td class="dt">' + esc(i.declencheur) + '</td>'
              + '<td><span class="pill ' + (i.repondu ? 'bon' : 'att') + '">'
              + (i.repondu ? 'Répondu' : 'En attente') + '</span></td>'
              + (D.peutModifier
                  ? '<td class="fin"><button class="mini geste danger" data-suppr-invite="' + esc(i.id) + '">Supprimer</button></td>'
                  : '')
              + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';
    return h;
  }

  function boiteDetail(){
    var s = DETAIL;
    if (!s) return '';
    var h = '<div class="voile" id="fi-voile"><div class="boite">'
      + '<h3>' + esc(s.nom)
      + ' <span class="pill ' + (s.actif ? 'bon' : 'neutre') + '">' + (s.actif ? 'Actif' : 'Inactif') + '</span></h3>'
      + '<div class="dt" style="margin-bottom:.5rem">' + esc(s.declencheur)
      + ' · ' + s.nbReponses + ' réponse' + (s.nbReponses > 1 ? 's' : '') + '</div>';
    if (!s.questions.length) {
      h += '<div class="vide">Ce sondage n’a aucune question.</div>';
    } else {
      h += s.questions.map(function(q){
        var b = '<div class="q"><div class="txt">' + esc(q.texte) + '</div>'
          + '<div class="dt">' + q.nbReponses + ' réponse' + (q.nbReponses > 1 ? 's' : '')
          + (q.moyenne != null ? ' · moyenne ' + q.moyenne + ' / 5' : '') + '</div>';
        if (q.textes.length) {
          /* Les mots des clientes, tels qu elles les ont ecrits : c est la
             seule partie d un sondage qui dise pourquoi. */
          b += '<div class="mots">' + q.textes.map(function(x){
            return '<div class="mot">' + esc(x) + '</div>';
          }).join('') + '</div>';
        }
        return b + '</div>';
      }).join('');
    }
    h += '<div class="pied-boite"><button class="mini" id="fi-fermer">Fermer</button></div>'
      + '</div></div>';
    return h;
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    if (sous) sous.textContent = D.peutModifier ? '' : 'consultation seulement';

    var h = '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'sondages' ? ' actif' : '') + '" data-onglet="sondages">Sondages'
      + ((D.sondages || []).length ? '<span class="n">' + D.sondages.length + '</span>' : '') + '</button>'
      + '<button class="mini' + (ONGLET === 'recompenses' ? ' actif' : '') + '" data-onglet="recompenses">Récompenses'
      + ((D.recompenses || []).length ? '<span class="n">' + D.recompenses.length + '</span>' : '') + '</button>'
      + '<button class="mini' + (ONGLET === 'invitations' ? ' actif' : '') + '" data-onglet="invitations">Invitations'
      + ((D.invitations || []).length ? '<span class="n">' + D.invitations.length + '</span>' : '') + '</button>'
      + '</div>';

    h += ONGLET === 'recompenses' ? vueRecompenses()
       : ONGLET === 'invitations' ? vueInvitations() : vueSondages();
    if (DETAIL) h += boiteDetail();
    corps.innerHTML = h;
    brancher();
  }

  function brancher(){
    var bm = document.getElementById('fi-mail-enr');
    if (bm) bm.onclick = function(){
      var e = document.getElementById('fi-mail');
      bm.disabled = true;
      appeler('fidelisation:notification', [e ? e.value : '']).then(function(r){
        bm.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.courriel ? 'Les commentaires partiront à ' + r.courriel + '.'
                        : 'Plus aucune notification de commentaire.', 'bon');
        charger();
      });
    };
    var bf = document.getElementById('fi-fermer');
    if (bf) bf.onclick = function(){ DETAIL = null; dessiner(); };
    var vo = document.getElementById('fi-voile');
    if (vo) vo.onclick = function(ev){ if (ev.target === vo) { DETAIL = null; dessiner(); } };

    var bv = document.getElementById('fi-vider');
    if (bv) bv.onclick = function(){
      if (ARME !== '__invites') {
        ARME = '__invites'; dessiner();
        dire('Cliquez « Confirmer ? » — les invitations partent, les réponses déjà reçues restent.', 'att');
        return;
      }
      ARME = '';
      appeler('fidelisation:viderInvites', []).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(r.efface + ' invitation' + (r.efface > 1 ? 's supprimées' : ' supprimée') + '.', 'bon');
        charger();
      });
    };
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest || t.closest('.boite')) return;

    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); ARME = ''; dessiner(); return; }

    var bs = t.closest('[data-suppr-sondage]');
    if (bs) {
      ev.stopPropagation();
      var idS = bs.getAttribute('data-suppr-sondage');
      var s = (D.sondages || []).filter(function(x){ return x.id === idS; })[0];
      /* Deux clics, et l on DIT combien de reponses disparaissent : elles ne
         se reconstituent pas. */
      if (ARME !== idS) {
        ARME = idS; dessiner();
        dire('Cliquez « Confirmer ? » — le sondage et ses '
          + ((s && s.reponses) || 0) + ' réponse' + (((s && s.reponses) || 0) > 1 ? 's' : '')
          + ' seront détruits, sans retour possible.', 'att');
        return;
      }
      ARME = '';
      appeler('fidelisation:supprimerSondage', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire('« ' + (r.nom || '') + ' » supprimé avec ses ' + r.reponsesPerdues + ' réponse'
          + (r.reponsesPerdues > 1 ? 's' : '') + '.', 'bon');
        charger();
      });
      return;
    }

    var bi = t.closest('[data-suppr-invite]');
    if (bi) {
      bi.disabled = true;
      appeler('fidelisation:supprimerInvite', [bi.getAttribute('data-suppr-invite')]).then(function(r){
        if (!r.ok) { bi.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('Invitation à ' + (r.courriel || 'ce client') + ' supprimée.', 'bon');
        charger();
      });
      return;
    }

    var tr = t.closest('tr[data-sondage]');
    if (tr) {
      appeler('fidelisation:sondage', [tr.getAttribute('data-sondage')]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        DETAIL = r.sondage; ARME = ''; dessiner();
      });
      return;
    }

    if (ARME) { ARME = ''; dessiner(); }
  });

  function charger(){
    appeler('fidelisation:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Fidélisation indisponible', expliquer(r)); return; }
      D = r;
      dessiner();
    });
  }

  window.szActualiser = function(){
    var e = document.getElementById('fi-mail');
    if (e && document.activeElement === e) return;
    if (DETAIL || ARME) return;
    charger();
  };
  window.szRevenir = function(){ if (!DETAIL) charger(); };

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
      if (DETAIL) { DETAIL = null; dessiner(); return; }
      if (ARME) { ARME = ''; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageFidelisation };
