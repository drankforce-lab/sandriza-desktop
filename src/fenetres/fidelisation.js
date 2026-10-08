'use strict';

/*
 * FENÊTRE « FIDÉLISATION ET SONDAGES » — NATIVE (1.71.0, palier 4)
 * =============================================================================
 * Trois onglets : SONDAGES (avec leur taux de réponse et le dépouillement
 * question par question), RÉCOMPENSES (les codes émis et leur usage) et
 * INVITATIONS (celles qui sont parties, répondues ou non).
 *
 * ⚠⚠ LA CRÉATION D'UN SONDAGE EST ICI DEPUIS #33. Cet en-tête disait qu'elle
 * « méritait son propre passage » — passage qui n'est jamais venu, tandis que
 * cette fenêtre renvoyait vers « l'écran Fidélisation de la fenêtre
 * principale », inatteignable depuis que la section est ancrable (1.71.0). On
 * pouvait consulter des sondages sans jamais pouvoir en faire un. Trouvé par
 * l'audit de couverture (#32).
 *
 * ⚠ SUPPRIMER UN SONDAGE DÉTRUIT SES RÉPONSES. Elles ne se reconstituent pas :
 * la confirmation annonce combien vont disparaître. Supprimer des invitations,
 * en revanche, laisse les réponses déjà reçues — et le dit aussi.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('fidelisation');

const CSS = `
/* L'onglet Ambassadrices (2026-10-07) : trois vues (ambassadrices et bilan, programme, candidatures). */
.amb-zone{display:flex;flex-direction:column;gap:.7rem;flex:1 1 auto;min-height:0}
.amb-sous{display:flex;gap:.3rem;align-items:center;flex-wrap:wrap}
.amb-sous button{padding:.26rem .8rem;border-radius:99px;font-size:.8rem;font-weight:600;color:var(--tx2);background:transparent}
.amb-sous button.actif{color:var(--tx)}
.amb-sous .droite{margin-left:auto}
.amb-grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.7rem 1rem}
.amb-deux{display:grid;grid-template-columns:1fr 1fr;gap:.7rem 1rem;margin-top:.7rem}
.amb-grille label,.amb-deux label{display:flex;flex-direction:column;gap:.3rem;font-size:.8rem;color:var(--tx2)}
.amb-grille input,.amb-grille select,.amb-deux input,.amb-deux textarea{font:inherit;font-size:.85rem;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.4rem .55rem}
.amb-deux textarea{resize:vertical;min-height:5.2rem;line-height:1.45}
.amb-exemple{margin:.8rem 0;padding:.6rem .8rem;border-radius:10px;background:var(--v05);font-size:.86rem;line-height:1.5}
.amb-raison{text-align:right}
.amb-zone .carte.plein{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
.amb-zone .liste{flex:1 1 auto;min-height:0;overflow:hidden}
tr.amb-detail td{background:var(--v04);font-size:.78rem}
.amb-pages{display:flex;gap:.5rem;align-items:center;justify-content:flex-end;margin-top:.5rem;font-size:.78rem;color:var(--tx2)}
.amb-actions{display:flex;gap:.5rem;align-items:center;margin-top:.7rem}

/* L'onglet Points (2026-10-06) */
.pt-ligne{display:flex;align-items:center;gap:.5rem;margin:.2rem 0 .9rem}
.pt-grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:.8rem 1rem}
.pt-grille label{display:flex;flex-direction:column;gap:.3rem;font-size:.8rem;color:var(--tx2)}
.pt-grille input{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.4rem .55rem}
.pt-exemple{margin:.9rem 0;padding:.7rem .85rem;border-radius:10px;background:var(--v05);font-size:.86rem;line-height:1.5}
/* Les avis récompensés (2026-10-07) : un sous-titre dans la même carte. */
.pt-sous{margin:1rem 0 .5rem;font-size:.92rem;font-weight:600}
/* Les soldes (2026-10-06, refaits pour des centaines de clients) : recherche, filtre, tri,
   pages ; l ajustement s ouvre SOUS la ligne, avec la bascule Ajouter / Retirer. */
.pt-outils{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin:.1rem 0 .6rem}
.pt-outils input[type=search]{flex:1 1 260px;min-width:0;padding:0 .7rem}
.pt-outils select{color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:0 .5rem}
/* Même hauteur et même police pour la recherche et les deux listes (elles différaient). */
.pt-outils input[type=search],.pt-outils select{height:2.15rem;box-sizing:border-box;font:inherit;font-size:.84rem}
.pt-zone{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
.pt-zone>.liste{flex:1 1 auto;min-height:0;overflow:hidden}
.pt-zone>.pt-pages{flex:0 0 auto}
table.pt-soldes col.pt-c-num{width:8.5rem}
table.pt-soldes col.pt-c-geste{width:7.5rem}
.pt-valeur{color:var(--tx2)}
.pt-tete{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.5rem}
.pt-tete h2{margin:0}
.pt-nom{font-weight:600}
.pt-zero{color:var(--tx2)}
tr.pt-ouvert td,tr.pt-ligne-ouverte td{background:var(--v04)}
.pt-panneau{display:flex;flex-wrap:wrap;gap:.55rem;align-items:center;padding:.35rem .1rem}
.pt-sens{display:inline-flex;border:1px solid var(--v16);border-radius:99px;padding:2px;background:var(--v05)}
.pt-sens button{border:0;border-radius:99px;background:transparent;padding:.26rem .85rem;font-weight:600;color:var(--tx2)}
.pt-sens button.on-plus{background:rgba(34,197,94,.18);color:var(--tx-ok)}
html.jour .pt-sens button.on-plus{color:#1f5f37}
.pt-sens button.on-moins{background:rgba(239,68,68,.16);color:var(--tx-err2)}
html.jour .pt-sens button.on-moins{color:#7a2a24}
.pt-panneau input[type=number]{width:6.5rem}
.pt-panneau input[type=text]{flex:1 1 220px;min-width:0}
.pt-vite{display:inline-flex;gap:.25rem}
.pt-apres{font-size:.8rem;color:var(--tx2);white-space:nowrap}
.pt-apres b{color:var(--tx)}
.pt-pages{display:flex;gap:.5rem;align-items:center;justify-content:flex-end;margin-top:.55rem;font-size:.78rem;color:var(--tx2)}

:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
/* Refonte fine (2026-09-26) : la barre d onglets de toutes les fenetres — et
   non trois petits boutons. L actif prend l or du socle (.onglets .actif). */
.onglets{display:flex;gap:.25rem;flex-wrap:wrap;align-items:center;border-bottom:1px solid var(--v08);padding:0 0 .5rem}
.onglets > button{background:transparent;border:1px solid transparent;color:var(--tx2);padding:.38rem .7rem;
  font:inherit;font-weight:600;font-size:.82rem;cursor:pointer}
.onglets > button:hover{background:var(--v05);color:var(--tx)}
.onglets .droite{margin-left:auto}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:var(--tx-ok)}
/* ── La refonte de l Inventaire (2026-09-25) : la jauge de reponse ── */
.jauger{height:5px;border-radius:3px;background:var(--v10);margin-top:.35rem;max-width:6rem;overflow:hidden;margin-left:auto}
.jauger i{display:block;height:100%;border-radius:3px;background:color-mix(in srgb,var(--tx-ok,#4ade80) 55%,transparent)}
.tuile .sub{font-size:.66rem;color:var(--tx2);margin-top:.1rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:var(--tx2);font-weight:700}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.32rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody tr:hover td{background:var(--v04)}
tbody tr[data-sondage]{cursor:pointer}
.num{text-align:right;white-space:nowrap}
.fin{white-space:nowrap;text-align:right}
.code{font-family:'Courier New',monospace;letter-spacing:1px;font-weight:700;
  background:var(--v06);border-radius:4px;padding:.06rem .4rem}
.dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:var(--f-carte2);border:1px solid var(--v14);border-radius:13px;
  max-width:42rem;width:100%;max-height:88vh;overflow:auto;padding:.9rem 1rem}
/* L editeur : large et en deux colonnes (2026-09-26). */
.boite:has(.ed2){max-width:min(74rem,96vw)}
.ed2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:1rem;align-items:start}
.ed2 .qs{margin-top:0}
@media (max-width:900px){.ed2{grid-template-columns:1fr}}
.boite h3{margin:0 0 .6rem;font:700 .98rem/1.3 Georgia,serif;display:flex;
  align-items:center;gap:.5rem;flex-wrap:wrap}
.q{border-top:1px solid var(--v07);padding:.5rem 0}
.q:first-of-type{border-top:0}
.q .txt{font-weight:600;font-size:.88rem}
.q .mots{margin-top:.3rem;display:flex;flex-direction:column;gap:.25rem}
.q .mot{font-size:.83rem;background:var(--v04);border-radius:8px;
  padding:.25rem .5rem;white-space:pre-wrap;overflow-wrap:anywhere}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.85rem;flex-wrap:wrap}
/* ── Editeur de sondage (#33) ── */
label.champ{display:block;margin:0 0 .6rem}
label.champ .lbl{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;
  color:var(--tx2);margin:0 0 .22rem}
input.t,select.t,textarea.t{width:100%;background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;
  color:var(--tx);font:inherit;font-size:.85rem;padding:.4rem .55rem}
textarea.t{resize:vertical;line-height:1.5}
input.t:focus,select.t:focus,textarea.t:focus{outline:none;border-color:#c9a97e}
label.case{display:inline-flex;align-items:center;gap:.35rem;font-size:.82rem;cursor:pointer;
  border:1px solid var(--v12);border-radius:9px;padding:.22rem .55rem;margin:0 0 .6rem;
  background:var(--v03);-webkit-user-select:none;user-select:none}
label.case input{width:15px;height:15px;accent-color:#c9a97e;margin:0}
.qs{border:1px solid var(--v10);border-radius:10px;padding:.5rem .6rem;margin:0 0 .7rem}
.qstitre{display:flex;align-items:center;gap:.5rem;font-size:.7rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;margin:0 0 .45rem}
.qstitre button{margin-left:auto}
.qed{background:var(--v03);border-radius:9px;padding:.45rem .55rem;margin:0 0 .45rem}
.qedh{display:flex;align-items:center;gap:.5rem;margin:0 0 .3rem}
.qedh button{margin-left:auto}
.qedr{display:flex;gap:.5rem;align-items:flex-end;flex-wrap:wrap;margin-top:.4rem}
.qedr .case{margin:0}
.vide{padding:1.3rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}

.pagi{display:flex;align-items:center;justify-content:center;gap:.6rem;padding:.45rem 0 0;font-size:.78rem;color:var(--tx2)}
`;

/**
 * Page complète de la fenêtre native « Fidélisation et sondages ».
 * `ouverture` = 'recompenses' / 'invitations' pour un onglet, ou 'sondage-nouveau'
 * pour ouvrir directement l'éditeur.
 * ⚠ L'éditeur s'atteint par un CLIC : sans ce paramètre, le garde-fou ne le
 * verrait jamais — et c'est précisément lui qui manquait.
 */
function pageFidelisation(ouverture) {
  const ouv = String(ouverture || '');
  const depart = (['recompenses', 'invitations', 'ambassadrices', 'parrainage', 'paliers'].indexOf(ouv) >= 0) ? ouv : 'sondages';
  const editeur = (ouv === 'sondage-nouveau');
  return `${TETE()}
<title>${T("Fidélisation et sondages — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.loyalty}</span><h1>${T("Fidélisation et sondages")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide charge">${T("Chargement… (les réponses se resynchronisent)")}</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_BROUILLON()}${JS_TUILES('fidelisation')}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var ONGLET = '${depart}';  // sondages | recompenses | invitations
  var DETAIL = null;
  var ARME = '';             // id de sondage armé, ou '__invites'

  /* « 4,3 / 5 » : la virgule du francais (le point sortait tel quel du nombre). */
  function note5(n){
    var v = Number(n);
    return (isFinite(v) ? v.toLocaleString('${LIEU()}', { maximumFractionDigits: 1 }) : String(n)) + ' / 5';
  }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès à la fidélisation.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cet élément n’existe plus.")}',
    courriel:           '${T("Adresse courriel invalide.")}',
    rien:               '${T("Il n’y a aucune invitation à supprimer.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
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

  function initiales(nom){
    var m = String(nom || '').trim().split(' ').filter(Boolean);
    if (!m.length) return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
  }
  function vueSondages(){
    var t = D.tuiles || {};
    /* ⚠ szTuiles(...) ENVELOPPE, il ne remplace rien : le bandeau est ecrit tel
       quel, la piece commune y ajoute le bouton de repli et l etat retenu pour
       ce poste. Voir JS_TUILES dans socle.js. */
    var h = szTuiles('<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">${T("Invitations")}</div><div class="val">' + (t.invitations || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Réponses")}</div><div class="val">' + (t.reponses || 0) + '</div>'
      + '<div class="sub">${T("taux de ")}' + (t.taux || 0) + ' %</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Note moyenne")}</div><div class="val">'
      + (t.note == null ? '—' : note5(t.note)) + '</div>'
      + '<div class="sub">' + (t.nbNotes || 0) + ((t.nbNotes || 0) > 1 ? '${T(" évaluations")}' : '${T(" évaluation")}') + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Codes récompense")}</div><div class="val">' + (t.codes || 0) + '</div>'
      + '<div class="sub">' + (t.codesUtilises || 0) + ((t.codesUtilises || 0) > 1 ? '${T(" utilisés")}' : '${T(" utilisé")}') + '</div></div>'
      + '</div>');

    /* LE JOURNAL DES COMMENTAIRES (2026-10-06, sa demande) : plus de courriel à chaque
       commentaire — ils se lisent ICI, les 365 derniers jours ; le serveur efface les plus
       anciens chaque nuit. Les avis sur les articles ne sont pas concernés. */
    var com = D.commentaires || [];
    h += '<div class="carte"><h2>${T("Journal des commentaires")}</h2>'
      + '<div class="dt" style="margin-bottom:.4rem">${T("Les commentaires des 365 derniers jours. Plus anciens : effacés automatiquement.")}</div>';
    if (!com.length) {
      h += '<div class="vide">${T("Aucun commentaire pour l’instant.")}</div>';
    } else {
      h += '<div class="journal-com" style="max-height:16rem;overflow:auto"><table><thead><tr><th>${T("Date")}</th><th>${T("Client")}</th><th>${T("Note")}</th><th>${T("Commentaire")}</th></tr></thead><tbody>'
        + com.map(function(c){
            return '<tr><td style="white-space:nowrap">' + esc(String(c.date || '').slice(0, 10)) + '</td>'
              + '<td>' + esc(c.client || '—') + (c.commande ? '<div class="dt">' + esc(c.commande) + '</div>' : '') + '</td>'
              + '<td style="white-space:nowrap">' + (c.note == null ? '—' : note5(c.note)) + '</td>'
              + '<td>' + esc(c.texte) + '<div class="dt">' + esc(c.sondage || '') + '</div></td></tr>';
          }).join('')
        + '</tbody></table></div>';
    }
    h += '</div>';

    /* ⚠ LA DERNIERE CARTE PREND LA HAUTEUR QUI RESTE (#151, 2026-09-24). Les
       tuiles et la carte de notification gardent leur taille naturelle ; c est
       la LISTE qui s etire, comme sur clients et produits. */
    h += '<div class="carte plein"><h2>${T("Sondages")}</h2>';
    if (!(D.sondages || []).length) {
      h += '<div class="vide">${T("Aucun sondage configuré.")}'
        + (D.peutModifier
            ? '<div style="margin-top:.45rem"><button class="mini prim" id="fi-premier">${T("Créer le premier")}</button></div>'
            : '') + '</div>';
    } else {
      h += '<div class="liste"><table><thead><tr><th>${T("Sondage")}</th>'
        + '<th class="num">${T("Invitations")}</th><th class="num">${T("Réponses")}</th><th class="num">${T("Taux")}</th>'
        + '<th>${T("Récompense")}</th><th>${T("État")}</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + pageSondages().map(function(s){
            return '<tr data-sondage="' + esc(s.id) + '" title="${T("Voir le dépouillement")}">'
              /* ══ LA REFONTE DE L INVENTAIRE (2026-09-25) : la ligne riche (initiales,
                 nom, declencheur et nombre de questions dessous) et la jauge du taux
                 de reponse. Crochets gardes : tr[data-sondage], data-modifier-sondage,
                 data-suppr-sondage. */
              + '<td><div class="rf-prod"><span class="rf-av" aria-hidden="true">' + esc(initiales(s.nom)) + '</span>'
              + '<div style="min-width:0"><div class="rf-nom">' + esc(s.nom) + '</div>'
              + '<div class="rf-sous"><span>' + esc(s.declencheur) + '</span><span>·</span><span>' + s.nbQuestions
              + (s.nbQuestions > 1 ? '${T(" questions")}' : '${T(" question")}') + '</span></div></div></div></td>'
              + '<td class="num">' + s.invitations + '</td>'
              + '<td class="num">' + s.reponses + '</td>'
              + '<td class="num"><span class="rf-mont">' + szNombre(s.taux, 1) + ' %</span>'
              + '<div class="jauger"><i style="width:' + Math.max(0, Math.min(100, Number(s.taux) || 0)) + '%"></i></div></td>'
              + '<td>' + (s.recompense ? '<span class="rf-pill bleu">' + esc(s.recompense) + '</span>'
                                       : '<span class="dt">${T("aucune")}</span>') + '</td>'
              + '<td><span class="rf-pill ' + (s.actif ? 'vert' : '') + '">'
              + (s.actif ? '${T("Actif")}' : '${T("Inactif")}') + '</span></td>'
              + (D.peutModifier
                  ? '<td class="fin"><button class="mini geste" data-modifier-sondage="' + esc(s.id) + '">${T("Modifier")}</button> '
                    + '<button class="mini geste danger" data-suppr-sondage="' + esc(s.id) + '">'
                    + (ARME === s.id ? '${T("Confirmer ?")}' : '${T("Supprimer")}') + '</button></td>'
                  : '')
              + '</tr>';
          }).join('')
        + '</tbody></table></div>';
      /* ⚠ PAGINEE, JAMAIS DE GLISSIERE (sa demande du 2026-09-26) : autant de
         lignes que la hauteur MESUREE en permet (szAutoPagination, socle). */
      var pages = Math.max(1, Math.ceil(D.sondages.length / SPARPAGE));
      if (pages > 1) h += '<div class="pagi"><button class="mini" id="fi-prec"' + (SPAGE <= 0 ? ' disabled' : '') + '>${T("‹ Précédent")}</button>'
        + '<span>${T("Page")} ' + (SPAGE + 1) + ' / ' + pages + '</span>'
        + '<button class="mini" id="fi-suiv"' + (SPAGE >= pages - 1 ? ' disabled' : '') + '>${T("Suivant ›")}</button></div>';
    }
    h += '</div>';
    return h;
  }
  var SPAGE = 0, SPARPAGE = 50;
  function pageSondages(){
    var tout = D.sondages || [], pages = Math.max(1, Math.ceil(tout.length / SPARPAGE));
    if (SPAGE >= pages) SPAGE = pages - 1;
    return tout.slice(SPAGE * SPARPAGE, SPAGE * SPARPAGE + SPARPAGE);
  }

  /* Les listes de ce cœur sont PLAFONNEES a 100 (la reponse traverserait le pont
     autrement). Afficher << 100 invitations >> quand il y en a 4 500 fait mentir
     l ecran : la tuile du haut, elle, annonce le vrai compte, et les deux se
     contredisent sous les yeux. On dit donc << 100 sur 4 500 >> des que le
     plafond mord, et le compte simple sinon.
     Aucun accent grave ici : le tout part dans un litteral de gabarit. */
  /* ⚠ LA FORMULE A DÉMÉNAGÉ DANS JS_COMPTE (socle.js), sous le nom szCompte,
     le 2026-09-05 : elle n'existait qu'ici alors que six autres listes en avaient
     besoin, et une deuxième copie aurait suffi à faire diverger la phrase. On
     garde compte comme simple renvoi — la fenêtre l'appelle à cinq endroits, et
     renommer cinq appels pour le plaisir n'apporte rien. */
  function compte(n, tot, sing, plur){ return szCompte(n, tot, sing, plur); }

  /* ── L'ONGLET « POINTS » (2026-10-06, son cahier des charges) ───────────────────────────────
     Ses mots : « configurable de notre côté : le nombre de points gagnés par dollar dépensé, et
     l'échelle d'utilisation — seulement 25 % du total de la commande retiré en points ».
     Les réglages, un exemple chiffré qui se recalcule en tapant, les soldes, l'ajustement manuel.
     ⚠ Le serveur décide de tout (lib-points.php) : cette fenêtre ne fait qu'écrire les réglages. */
  var PTS = null;
  function chargerPoints(){
    appeler('fidelisation:points', []).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      PTS = r; if (ONGLET === 'points') dessiner();
    });
  }
  function ptsExemple(){
    var v = function(id, d){ var e = document.getElementById(id); var x = e ? parseFloat(String(e.value).replace(',', '.')) : NaN; return isFinite(x) ? x : d; };
    var ppd = v('pt-ppd', 1), vp = v('pt-vp', 0.01), pl = v('pt-pl', 25);
    var gagne = Math.floor(100 * ppd), valeur = Math.round(gagne * vp * 100) / 100;
    var max = Math.round(100 * pl) / 100;
    return '${T("Exemple : 100 $ d’articles donnent")} <b>' + gagne + ' ${T("points")}</b> (' + valeur.toFixed(2) + ' $). '
      + '${T("Un client qui a 100 $ en points ne peut en utiliser que")} <b>' + max.toFixed(2) + ' $</b> ${T("sur une commande de 100 $")} (' + pl + ' %).';
  }
  function vuePoints(){
    if (!PTS) return '<div class="carte plein"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div></div>';
    var cf = PTS.cfg || {}, ro = !PTS.peutModifier;
    var dis = ro ? ' disabled' : '';
    var h = '<div class="carte"><h2>${T("Réglages du programme")}</h2>'
      + '<label class="pt-ligne"><input type="checkbox" id="pt-actif"' + (cf.actif ? ' checked' : '') + dis + '> <b>${T("Programme actif")}</b> <span class="dt">${T("— les clients gagnent et utilisent des points")}</span></label>'
      + '<div class="pt-grille">'
      + '<label>${T("Points gagnés par dollar")}<input type="number" id="pt-ppd" min="0" max="100" step="0.1" value="' + esc(cf.ptsParDollar) + '"' + dis + '><span class="dt">${T("sur les articles, après rabais, sans taxes ni livraison")}</span></label>'
      + '<label>${T("Valeur d’un point ($)")}<input type="number" id="pt-vp" min="0.001" max="10" step="0.001" value="' + esc(cf.valeurPoint) + '"' + dis + '><span class="dt">${T("0,01 = 100 points pour 1 $")}</span></label>'
      + '<label>${T("Plafond par commande (%)")}<input type="number" id="pt-pl" min="0" max="100" step="1" value="' + esc(cf.plafondPct) + '"' + dis + '><span class="dt">${T("part maximale du total payable en points")}</span></label>'
      + '<label>${T("Solde minimal pour utiliser")}<input type="number" id="pt-min" min="0" step="1" value="' + esc(cf.minPoints) + '"' + dis + '><span class="dt">${T("en points (0 = dès le premier)")}</span></label>'
      + '</div>'
      + '<p class="pt-exemple" id="pt-exemple">' + ptsExemple() + '</p>'
      /* LES AVIS RÉCOMPENSÉS (2026-10-07) : un avis publié verse ses points une seule fois (le
         serveur décide, à la publication). Avec photo : le second nombre REMPLACE le premier. */
      + '<h3 class="pt-sous">${T("Avis récompensés")}</h3>'
      + '<label class="pt-ligne"><input type="checkbox" id="pt-avis"' + (cf.avisActif ? ' checked' : '') + dis + '> <b>${T("Récompenser les avis publiés")}</b></label>'
      + '<div class="pt-grille">'
      + '<label>${T("Points par avis")}<input type="number" id="pt-avis-pts" min="0" max="100000" step="1" value="' + esc(cf.avisPts != null ? cf.avisPts : 100) + '"' + dis + '><span class="dt">${T("avis publié sans photo")}</span></label>'
      + '<label>${T("Points par avis avec photo")}<input type="number" id="pt-avis-photo" min="0" max="100000" step="1" value="' + esc(cf.avisPhotoPts != null ? cf.avisPhotoPts : 200) + '"' + dis + '><span class="dt">${T("au moins une photo — remplace le nombre sans photo")}</span></label>'
      + '</div>'
      + '<p class="dt">${T("Ne s’applique qu’une fois la boutique lancée.")}</p>'
      + (ro ? '' : '<button class="prim" id="pt-enr">${T("Enregistrer les réglages")}</button>')
      + '<p class="dt">${T("Les points sont attribués quand la commande passe « livrée », une seule fois. Le solde de chaque client est tenu par le serveur.")}</p>'
      + '</div>';
    var tous = ptsListe();
    var avec = tous.filter(function(u){ return u.points > 0; }).length;
    /* Les tuiles se MASQUENT (2026-10-06, sa demande) : le choix reste sur ce poste. */
    var tuilesVues = true; try { tuilesVues = localStorage.getItem('fid_pts_tuiles') !== 'non'; } catch (e) {}
    h += '<div class="carte plein"><div class="pt-tete"><h2>${T("Soldes des clients")}</h2>'
      + '<button type="button" class="mini" id="pt-tuiles">' + (tuilesVues ? '${T("Masquer les tuiles")}' : '${T("Afficher les tuiles")}') + '</button></div>'
      + '<div class="tuiles" style="margin-bottom:.7rem' + (tuilesVues ? '' : ';display:none') + '">'
      + '<div class="tuile"><div class="lbl">${T("Clients")}</div><div class="val">' + szNombre(tous.length, 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Avec des points")}</div><div class="val">' + szNombre(avec, 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Points en circulation")}</div><div class="val">' + szNombre(PTS.enCirculation || 0, 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Valeur")}</div><div class="val">' + szArgent(PTS.valeurEnCirculation || 0) + '</div></div>'
      + '</div>'
      + '<div class="pt-outils">'
      + '<input type="search" id="pt-q" value="' + esc(PQ) + '" placeholder="${T("Rechercher un client : nom ou courriel")}" aria-label="${T("Rechercher un client")}">'
      + '<select id="pt-filtre" aria-label="${T("Filtrer")}">'
      + '<option value="tous"' + (PF === 'tous' ? ' selected' : '') + '>${T("Tous les clients")}</option>'
      + '<option value="avec"' + (PF === 'avec' ? ' selected' : '') + '>${T("Avec des points")}</option>'
      + '<option value="sans"' + (PF === 'sans' ? ' selected' : '') + '>${T("Sans points")}</option></select>'
      + '<select id="pt-tri" aria-label="${T("Trier")}">'
      + '<option value="pts"' + (PTRI === 'pts' ? ' selected' : '') + '>${T("Plus de points d’abord")}</option>'
      + '<option value="nom"' + (PTRI === 'nom' ? ' selected' : '') + '>${T("Nom (A à Z)")}</option></select>'
      + '</div>'
      + '<div id="pt-zone" class="pt-zone"><div id="pt-table" class="liste">' + ptsTable() + '</div>'
      + '<div id="pt-pages" class="pt-pages">' + ptsPages() + '</div></div>';
    return h + '</div>';
  }
  /* ── LES SOLDES : une liste qui tient des centaines de clients ──────────────────────────────
     Tous les clients (pas seulement ceux qui ont des points : on ajuste aussi un solde à zéro),
     filtrés et triés ici, par pages. L ajustement s ouvre SOUS la ligne choisie : une bascule
     Ajouter / Retirer au lieu d un signe à taper, des montants rapides, le nouveau solde annoncé. */
  var PQ = '', PF = 'tous', PTRI = 'pts', PPAGE = 0, PPARPAGE = 25, POUV = '', PSENS = 1;
  function ptsListe(){
    var parId = {};
    (PTS.clients || []).forEach(function(u){ parId[u.id] = u.points || 0; });
    var tous = (PTS.tousClients && PTS.tousClients.length) ? PTS.tousClients : (PTS.clients || []);
    return tous.map(function(u){
      return { id: u.id, nom: u.nom || '', courriel: u.courriel || '', points: u.points != null ? (u.points || 0) : (parId[u.id] || 0) };
    });
  }
  function ptsPlier(x){ return String(x || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, ''); }
  function ptsFiltres(){
    var q = ptsPlier(PQ).trim();
    var l = ptsListe().filter(function(u){
      if (PF === 'avec' && !(u.points > 0)) return false;
      if (PF === 'sans' && u.points > 0) return false;
      return !q || ptsPlier(u.nom + ' ' + u.courriel).indexOf(q) >= 0;
    });
    l.sort(PTRI === 'nom'
      ? function(a, b){ return (a.nom || a.courriel).localeCompare(b.nom || b.courriel, '${LIEU()}'); }
      : function(a, b){ return (b.points - a.points) || (a.nom || a.courriel).localeCompare(b.nom || b.courriel, '${LIEU()}'); });
    return l;
  }
  function ptsPanneau(u){
    var vp = (PTS.cfg || {}).valeurPoint || 0;
    return '<tr class="pt-ouvert"><td colspan="4"><div class="pt-panneau">'
      + '<div class="pt-sens" role="radiogroup" aria-label="${T("Sens de l’ajustement")}">'
      + '<button type="button" role="radio" aria-checked="' + (PSENS > 0) + '" data-pt-sens="1" class="' + (PSENS > 0 ? 'on-plus' : '') + '">${T("Ajouter")}</button>'
      + '<button type="button" role="radio" aria-checked="' + (PSENS < 0) + '" data-pt-sens="-1" class="' + (PSENS < 0 ? 'on-moins' : '') + '">${T("Retirer")}</button></div>'
      + '<input type="number" id="pt-n" min="1" step="1" inputmode="numeric" aria-label="${T("Nombre de points")}" placeholder="${T("Points")}">'
      + '<span class="pt-vite">' + [25, 50, 100, 250, 500].map(function(n){ return '<button type="button" class="mini" data-pt-vite="' + n + '">' + szNombre(n, 0) + '</button>'; }).join('') + '</span>'
      + '<input type="text" id="pt-motif" maxlength="120" list="pt-motifs" aria-label="${T("Motif de l’ajustement")}" placeholder="${T("Motif (obligatoire)")}">'
      + '<datalist id="pt-motifs"><option value="${T("Geste commercial")}"><option value="${T("Correction d’erreur")}"><option value="${T("Retour de commande")}"><option value="${T("Concours")}"><option value="${T("Anniversaire")}"></datalist>'
      + '<span class="pt-apres" id="pt-apres" data-solde="' + u.points + '" data-vp="' + vp + '">${T("Solde actuel :")} <b>' + szNombre(u.points, 0) + '</b></span>'
      + '<button type="button" class="prim" id="pt-ok" data-pt-id="' + esc(u.id) + '">${T("Confirmer")}</button>'
      + '<button type="button" id="pt-annuler">${T("Annuler")}</button>'
      + '</div></td></tr>';
  }
  function ptsTable(){
    var ro = !PTS.peutModifier, vp = (PTS.cfg || {}).valeurPoint || 0;
    var l = ptsFiltres(), n = l.length, pp = ptsParPage();
    var pages = Math.max(1, Math.ceil(n / pp));
    if (PPAGE >= pages) PPAGE = pages - 1;
    if (PPAGE < 0) PPAGE = 0;
    var de = PPAGE * pp, morceau = l.slice(de, de + pp);
    if (!n) return '<div class="vide">' + (PQ ? '${T("Aucun client ne correspond à cette recherche.")}' : '${T("Aucun client dans cette liste.")}') + '</div>';
    /* ⚠ LES COLONNES SONT TENUES (2026-10-07, sa capture : « affreux et tout déformé ») : sans
       largeur, le tableau répartissait la place libre entre les quatre colonnes — 300 px de vide
       entre Points, Valeur et Ajuster sur une fenêtre large. Le client prend le reste. */
    var h = '<table class="pt-soldes"><colgroup><col><col class="pt-c-num"><col class="pt-c-num"><col class="pt-c-geste"></colgroup>'
      + '<thead><tr><th>${T("Client")}</th><th class="num">${T("Points")}</th><th class="num">${T("Valeur")}</th><th></th></tr></thead><tbody>'
      + morceau.map(function(u){
          var ouvert = POUV === u.id;
          return '<tr' + (ouvert ? ' class="pt-ligne-ouverte"' : '') + '><td><div class="pt-nom">' + esc(u.nom || u.courriel) + '</div>'
            + (u.nom && u.courriel ? '<div class="dt">' + esc(u.courriel) + '</div>' : '') + '</td>'
            + '<td class="num' + (u.points > 0 ? '' : ' pt-zero') + '"><b>' + szNombre(u.points, 0) + '</b></td>'
            + '<td class="num pt-valeur">' + szArgent(u.points * vp) + '</td>'
            + '<td class="fin">' + (ro ? '' : '<button type="button" class="mini geste' + (ouvert ? ' actif' : '') + '" data-pt-ouvrir="' + esc(u.id) + '">${T("Ajuster")}</button>') + '</td></tr>'
            + (ouvert && !ro ? ptsPanneau(u) : '');
        }).join('')
      + '</tbody></table>';
    return h;
  }
  /* ⚠ AUTANT DE LIGNES QUE LA HAUTEUR EN PERMET (szAutoPagination), jamais de glissière : la
     3e ligne passait sous le bas de la fenêtre. Le panneau d ajustement prend la place d une ligne. */
  function ptsParPage(){
    var pp = Math.max(1, PPARPAGE);
    var l = ptsFiltres(), de = PPAGE * pp;
    var ouvertIci = POUV && l.slice(de, de + pp).some(function(u){ return u.id === POUV; });
    return ouvertIci ? Math.max(1, pp - 1) : pp;
  }
  function ptsPages(){
    var n = ptsFiltres().length, pp = ptsParPage();
    if (!n) return '';
    var pages = Math.max(1, Math.ceil(n / pp)), de = PPAGE * pp;
    return '<span>' + szNombre(de + 1, 0) + '–' + szNombre(Math.min(n, de + pp), 0) + ' ${T("sur")} ' + szNombre(n, 0) + '</span>'
      + (pages > 1 ? '<button type="button" class="mini" data-pt-page="-1"' + (PPAGE ? '' : ' disabled') + ' aria-label="${T("Page précédente")}">‹</button>'
        + '<span>' + (PPAGE + 1) + ' / ' + pages + '</span>'
        + '<button type="button" class="mini" data-pt-page="1"' + (PPAGE < pages - 1 ? '' : ' disabled') + ' aria-label="${T("Page suivante")}">›</button>' : '');
  }
  function ptsRedessinerTable(focus){
    var z = document.getElementById('pt-table'); if (!z) return;
    z.innerHTML = ptsTable();
    var pg = document.getElementById('pt-pages'); if (pg) pg.innerHTML = ptsPages();
    if (focus) { var e = document.getElementById(focus); if (e) e.focus(); }
  }
  function ptsApres(){
    var a = document.getElementById('pt-apres'); if (!a) return;
    var solde = Number(a.getAttribute('data-solde')) || 0, vp = Number(a.getAttribute('data-vp')) || 0;
    var n = parseInt((document.getElementById('pt-n') || {}).value, 10);
    if (!(n > 0)) { a.innerHTML = '${T("Solde actuel :")} <b>' + szNombre(solde, 0) + '</b>'; return; }
    var nouv = PSENS > 0 ? solde + n : Math.max(0, solde - n);
    a.innerHTML = '${T("Nouveau solde :")} <b>' + szNombre(nouv, 0) + '</b> (' + szArgent(nouv * vp) + ')'
      + (PSENS < 0 && n > solde ? ' — ${T("on ne retire pas plus que le solde")}' : '');
  }
  function ptsConfirmer(){
    var ok = document.getElementById('pt-ok'); if (!ok || ok.disabled) return;
    var a = document.getElementById('pt-apres');
    var solde = a ? Number(a.getAttribute('data-solde')) || 0 : 0;
    var n = parseInt((document.getElementById('pt-n') || {}).value, 10);
    var m = ((document.getElementById('pt-motif') || {}).value || '').trim();
    if (!(n > 0)) { dire('${T("Indiquez un nombre de points.")}', 'att'); return; }
    if (!m) { dire('${T("Le motif est obligatoire.")}', 'att'); var em = document.getElementById('pt-motif'); if (em) em.focus(); return; }
    if (PSENS < 0) n = Math.min(n, solde);
    if (!n) { dire('${T("Ce client n’a aucun point à retirer.")}', 'att'); return; }
    ok.disabled = true;
    appeler('fidelisation:points:ajuster', [ok.getAttribute('data-pt-id'), PSENS * n, m]).then(function(r){
      ok.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('${T("Solde ajusté : ")}' + szNombre(r.solde, 0) + ' ${T("points au total")}', 'bon');
      POUV = ''; chargerPoints();
    });
  }
  function brancherPoints(){
    var bt = document.getElementById('pt-tuiles');
    if (bt) bt.onclick = function(){
      var vues = true; try { vues = localStorage.getItem('fid_pts_tuiles') !== 'non'; localStorage.setItem('fid_pts_tuiles', vues ? 'non' : 'oui'); } catch (e) {}
      dessiner();
    };
    var q = document.getElementById('pt-q');
    if (q) q.oninput = function(){ PQ = q.value; PPAGE = 0; POUV = ''; ptsRedessinerTable(); };
    var f = document.getElementById('pt-filtre');
    if (f) f.onchange = function(){ PF = f.value; PPAGE = 0; POUV = ''; ptsRedessinerTable(); };
    var t = document.getElementById('pt-tri');
    if (t) t.onchange = function(){ PTRI = t.value; PPAGE = 0; ptsRedessinerTable(); };
    var z = document.getElementById('pt-zone');
    if (z) {
      z.onclick = function(e){
        var b = e.target.closest ? e.target.closest('button') : null; if (!b || b.disabled) return;
        if (b.hasAttribute('data-pt-ouvrir')) {
          var id = b.getAttribute('data-pt-ouvrir');
          POUV = POUV === id ? '' : id; PSENS = 1;
          ptsRedessinerTable(POUV ? 'pt-n' : '');
        } else if (b.hasAttribute('data-pt-sens')) {
          PSENS = Number(b.getAttribute('data-pt-sens')) < 0 ? -1 : 1;
          z.querySelectorAll('[data-pt-sens]').forEach(function(x){
            var on = (Number(x.getAttribute('data-pt-sens')) < 0 ? -1 : 1) === PSENS;
            x.className = on ? (PSENS > 0 ? 'on-plus' : 'on-moins') : '';
            x.setAttribute('aria-checked', String(on));
          });
          ptsApres();
        } else if (b.hasAttribute('data-pt-vite')) {
          var en = document.getElementById('pt-n'); if (en) { en.value = b.getAttribute('data-pt-vite'); ptsApres(); }
        } else if (b.hasAttribute('data-pt-page')) {
          PPAGE += Number(b.getAttribute('data-pt-page')); POUV = ''; ptsRedessinerTable();
        } else if (b.id === 'pt-ok') { ptsConfirmer(); }
        else if (b.id === 'pt-annuler') { POUV = ''; ptsRedessinerTable(); }
      };
      z.oninput = function(e){ if (e.target && e.target.id === 'pt-n') ptsApres(); };
      z.onkeydown = function(e){
        if (!e.target || (e.target.id !== 'pt-n' && e.target.id !== 'pt-motif')) return;
        if (e.key === 'Enter') { e.preventDefault(); ptsConfirmer(); }
        else if (e.key === 'Escape') { POUV = ''; ptsRedessinerTable(); }
      };
    }

    ['pt-ppd', 'pt-vp', 'pt-pl'].forEach(function(id){ var e = document.getElementById(id); if (e) e.oninput = function(){ var x = document.getElementById('pt-exemple'); if (x) x.innerHTML = ptsExemple(); }; });
    var be = document.getElementById('pt-enr');
    if (be) be.onclick = function(){
      var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
      be.disabled = true;
      appeler('fidelisation:points:ecrire', [{ actif: !!(document.getElementById('pt-actif') || {}).checked, ptsParDollar: g('pt-ppd'), valeurPoint: g('pt-vp'), plafondPct: g('pt-pl'), minPoints: g('pt-min'),
        avisActif: !!(document.getElementById('pt-avis') || {}).checked, avisPts: g('pt-avis-pts'), avisPhotoPts: g('pt-avis-photo') }]).then(function(r){
        be.disabled = false;
        if (!r.ok) { dire(r.motif === 'pts_par_dollar' ? '${T("Points par dollar : entre 0 et 100.")}' : r.motif === 'valeur_point' ? '${T("Valeur d’un point : plus de 0 et au plus 10 $.")}' : r.motif === 'plafond' ? '${T("Plafond : entre 0 et 100 %.")}' : (r.motif === 'avis_pts' || r.motif === 'avis_photo_pts') ? '${T("Points d’un avis : un nombre entier de 0 à 100 000.")}' : expliquer(r), 'err'); return; }
        dire('${T("Réglages enregistrés.")}', 'bon'); chargerPoints();
      });
    };
  }

  /* ── L'ONGLET « AMBASSADRICES » (2026-10-07, sa demande) ────────────────────────────────────
     Le programme (interrupteur, textes FR/EN, rabais offert, récompense, délai), les ambassadrices
     avec leur bilan, les candidatures reçues par la boutique, et le versement des récompenses dues.
     ⚠ Le SERVEUR décide de tout (lib-ambassadrices.php) : quelle commande compte, ce qui est dû, et
     qu une commande n est jamais payée deux fois. Le versement exige en plus le rôle admin ou
     super-admin ET la boutique lancée — le bouton le dit au lieu de se taire.
     ⚠ Les saisies vivent dans AMBED / AMBCFG (moissonnées à chaque frappe) : un redessin ne perd rien. */
  var AMB = null, AMBCHARGE = false, AMBV = 'liste', AMBED = null, AMBCFG = null, AMBARME = '', AMBOUV = '';
  var AMBPAGE = 0, AMBPP = 12;
  var AMBMOTIFS = {
    role:        '${T("Réservé à l’administration (rôle admin ou super-admin).")}',
    pas_lance:   '${T("Les versements commencent au lancement de la boutique.")}',
    reseau:      '${T("Le serveur ne répond pas — rien n’a été écrit. Réessayez.")}',
    version_site:'${T("Le site ne connaît pas encore ce programme : rechargez la fenêtre principale.")}',
    nom:         '${T("Le nom est obligatoire.")}',
    courriel:    '${T("Adresse courriel invalide.")}',
    code:        '${T("Code promo invalide : 3 à 24 lettres, chiffres, tirets.")}',
    code_pris:   '${T("Ce code appartient déjà à une autre ambassadrice ou à un autre coupon.")}',
    titre:       '${T("Le titre (français) est obligatoire.")}',
    rabais:      '${T("Rabais : entre 1 et 90 %.")}',
    valeur:      '${T("Valeur de la récompense hors limites.")}',
    delai:       '${T("Délai : entre 0 et 365 jours.")}'
  };
  function ambExpliquer(r){ return AMBMOTIFS[r && r.motif] || expliquer(r); }
  var AMBTYPES = [
    { v: 'credit',      l: '${T("Crédit boutique (% des articles)")}',            u: '${T("% des articles")}' },
    { v: 'points',      l: '${T("Points de fidélité (par dollar)")}',             u: '${T("points par dollar")}' },
    { v: 'pourcentage', l: '${T("Commission en % (payée à la main)")}',           u: '${T("% des articles")}' },
    { v: 'fixe',        l: '${T("Montant fixe par commande (payé à la main)")}',  u: '${T("$ par commande")}' }
  ];
  function ambType(v){ return AMBTYPES.filter(function(t){ return t.v === v; })[0] || AMBTYPES[0]; }
  function chargerAmb(){
    AMBCHARGE = true;
    appeler('fidelisation:amb:donnees', []).then(function(r){
      AMBCHARGE = false;
      AMB = r.ok ? r : { erreur: ambExpliquer(r) };
      if (r.ok) AMBCFG = null;
      if (ONGLET === 'ambassadrices') dessiner();
    });
  }
  function ambVal(m, p){
    var t = [];
    if (p) t.push(szNombre(p, 0) + ' ${T("points")}');
    if (m || !p) t.push(szArgent(m || 0));
    return t.join(' · ');
  }
  function ambOccupe(){ return !!(AMBED || AMBCFG || AMBARME); }
  function ambTotaux(){
    var t = { du: 0, duP: 0, att: 0, attP: 0, ver: 0, verP: 0, nb: 0 };
    (AMB.ambassadrices || []).forEach(function(a){
      var b = a.bilan || {};
      t.du += b.du || 0; t.duP += b.duPoints || 0; t.att += b.attente || 0; t.attP += b.attentePoints || 0;
      t.ver += b.verse || 0; t.verP += b.versePoints || 0; t.nb += b.nbDues || 0;
    });
    return t;
  }
  function ambRaisonVerser(t){
    if (!AMB.lance) return AMBMOTIFS.pas_lance;
    if (!AMB.peutVerser) return AMBMOTIFS.role;
    if (!t.nb) return '${T("Aucune récompense due pour l’instant.")}';
    return '';
  }
  function ambPages(n){
    var pp = Math.max(1, AMBPP), pages = Math.max(1, Math.ceil(n / pp));
    if (AMBPAGE >= pages) AMBPAGE = pages - 1;
    if (AMBPAGE < 0) AMBPAGE = 0;
    if (pages < 2) return '';
    return '<div class="amb-pages"><button type="button" class="mini" data-amb-page="-1"' + (AMBPAGE ? '' : ' disabled') + ' aria-label="${T("Page précédente")}">‹</button>'
      + '<span>' + (AMBPAGE + 1) + ' / ' + pages + '</span>'
      + '<button type="button" class="mini" data-amb-page="1"' + (AMBPAGE < pages - 1 ? '' : ' disabled') + ' aria-label="${T("Page suivante")}">›</button></div>';
  }
  function ambMorceau(l){ var pp = Math.max(1, AMBPP); return l.slice(AMBPAGE * pp, AMBPAGE * pp + pp); }
  var AMBETATS = {
    due: '${T("Due")}', versee: '${T("Versée")}', annulee: '${T("Annulée")}', remboursee: '${T("Remboursée")}',
    propre_code: '${T("Sa propre commande")}', non_livree: '${T("Pas encore livrée")}',
    date_livraison: '${T("Date de livraison inconnue")}', zero: '${T("Aucune récompense")}'
  };
  function ambEtat(d){
    if (d.etat === 'attente' && d.motif === 'delai') return '${T("Délai de retour jusqu’au")}' + ' ' + esc(d.disponibleLe);
    return AMBETATS[d.etat === 'due' || d.etat === 'versee' ? d.etat : d.motif] || esc(d.motif || d.etat);
  }
  function ambFormulaire(){
    var e = AMBED;
    return '<div class="carte"><h2>' + (e.id ? '${T("Modifier l’ambassadrice")}' : '${T("Nouvelle ambassadrice")}') + '</h2>'
      + '<div class="amb-grille">'
      + '<label>${T("Nom")}<input data-amb-champ="nom" id="amb-ed-nom" maxlength="120" value="' + esc(e.nom) + '"></label>'
      + '<label>${T("Courriel")}<input data-amb-champ="courriel" type="email" maxlength="160" value="' + esc(e.courriel) + '"></label>'
      + '<label>${T("Code promo")}<input data-amb-champ="code" maxlength="24" value="' + esc(e.code) + '" placeholder="SOPHIE15" style="text-transform:uppercase"></label>'
      + '</div><div class="amb-deux">'
      + '<label>${T("Liens des réseaux sociaux")}<textarea data-amb-champ="reseaux" maxlength="600">' + esc(e.reseaux) + '</textarea></label>'
      + '<label>${T("Notes internes")}<textarea data-amb-champ="notes" maxlength="2000">' + esc(e.notes) + '</textarea></label>'
      + '</div>'
      + '<label class="pt-ligne"><input type="checkbox" data-amb-champ="actif"' + (e.actif !== false ? ' checked' : '') + '> <b>${T("Active")}</b>' + ' <span class="dt">${T("— désactivée, son code ne fonctionne plus à la caisse")}</span></label>'
      + '<p class="dt">${T("Le coupon est créé ou mis à jour : le rabais du programme, une fois par client. Le crédit et les points se versent au compte client qui porte ce courriel.")}</p>'
      + '<div class="amb-actions"><button type="button" class="prim" data-amb="enregistrer-ed">${T("Enregistrer")}</button>'
      + '<button type="button" data-amb="annuler-ed">${T("Annuler")}</button></div></div>';
  }
  function ambVueListe(){
    var l = AMB.ambassadrices || [], ro = !AMB.peutModifier, t = ambTotaux(), raison = ambRaisonVerser(t);
    var compte = (AMB.cfg && (AMB.cfg.recompense || {}).type) || 'credit';
    var h = '<div class="barreoutils">'
      + (ro ? '' : '<button type="button" class="mini prim" data-amb="ajouter">${T("+ Ajouter une ambassadrice")}</button>')
      + '<div class="droite"><span>${T("En attente :")} <b>' + ambVal(t.att, t.attP) + '</b></span>'
      + '<span>${T("Dû :")} <b>' + ambVal(t.du, t.duP) + '</b></span>'
      + (ro ? '' : '<button type="button" class="mini ' + (AMBARME === 'verser' ? 'danger' : 'prim') + '" data-amb="verser"'
          + (raison ? ' disabled title="' + esc(raison) + '"' : '') + '>'
          + (AMBARME === 'verser' ? '${T("Confirmer le versement ?")}' : '${T("Verser les récompenses dues")}') + '</button>')
      + '</div></div>';
    if (raison && !ro) h += '<div class="dt amb-raison">' + esc(raison) + '</div>';
    if (AMBED) h += ambFormulaire();
    h += '<div class="carte plein"><h2>${T("Ambassadrices")}</h2>';
    if (!l.length) {
      h += '<div class="vide">${T("Aucune ambassadrice pour l’instant.")}' + '<div style="margin-top:.35rem">${T("Ajoutez-en une, ou créez-la depuis une candidature.")}</div></div>';
      return h + '</div>';
    }
    /* Une cellule d en-tete par chaine : le banc des langues lit chaque chaine comme un texte. */
    h += '<div id="amb-table" class="liste"><table><thead><tr><th>${T("Ambassadrice")}</th>' + '<th>${T("Code")}</th>'
      + '<th class="num">${T("Commandes")}</th>' + '<th class="num">${T("Ventes")}</th>' + '<th class="num">${T("En attente")}</th>'
      + '<th class="num">${T("Dû")}</th>' + '<th class="num">${T("Versé")}</th>' + '<th>${T("État")}</th><th></th></tr></thead><tbody>'
      + ambMorceau(l).map(function(a){
          var b = a.bilan || {};
          var sansCompte = !a.userId && (compte === 'credit' || compte === 'points');
          var ligne = '<tr><td><div class="pt-nom">' + esc(a.nom) + '</div>'
            + (a.courriel ? '<div class="dt">' + esc(a.courriel) + '</div>' : '')
            + (sansCompte ? '<span class="rf-pill ambre" title="${T("Aucun compte client ne porte ce courriel : rien ne peut lui être versé.")}">${T("sans compte")}</span>' : '') + '</td>'
            + '<td><span class="code">' + esc(a.code) + '</span></td>'
            + '<td class="num">' + szNombre(b.commandes || 0, 0) + '</td>'
            + '<td class="num">' + szArgent(b.ventes || 0) + '</td>'
            + '<td class="num">' + ambVal(b.attente, b.attentePoints) + '</td>'
            + '<td class="num"><b>' + ambVal(b.du, b.duPoints) + '</b></td>'
            + '<td class="num">' + ambVal(b.verse, b.versePoints) + '</td>'
            + '<td><span class="rf-pill ' + (a.actif ? 'vert' : '') + '">' + (a.actif ? '${T("Active")}' : '${T("Inactive")}') + '</span></td>'
            + '<td class="fin"><button type="button" class="mini geste' + (AMBOUV === a.id ? ' actif' : '') + '" data-amb="detail" data-id="' + esc(a.id) + '">${T("Détail")}</button>'
            + (ro ? '' : ' <button type="button" class="mini geste" data-amb="modifier" data-id="' + esc(a.id) + '">${T("Modifier")}</button>'
              + ' <button type="button" class="mini geste" data-amb="basculer" data-id="' + esc(a.id) + '">' + (a.actif ? '${T("Désactiver")}' : '${T("Réactiver")}') + '</button>')
            + '</td></tr>';
          if (AMBOUV === a.id) {
            var det = (b.detail || []).slice(0, 8);
            ligne += '<tr class="amb-detail"><td colspan="9">'
              + (det.length ? '<table><thead><tr><th>${T("Commande")}</th>' + '<th>${T("Date")}</th>' + '<th class="num">${T("Base")}</th>' + '<th class="num">${T("Récompense")}</th>' + '<th>${T("État")}</th></tr></thead><tbody>'
                  + det.map(function(d){
                      return '<tr><td>' + esc(d.commande) + '</td><td class="dt">' + esc(d.date) + '</td><td class="num">' + szArgent(d.base || 0) + '</td>'
                        + '<td class="num">' + ambVal(d.montant, d.points) + '</td><td>' + ambEtat(d) + '</td></tr>';
                    }).join('') + '</tbody></table>'
                  : '<div class="dt">${T("Aucune commande avec son code pour l’instant.")}</div>')
              + ((a.versements || []).length ? '<div class="dt" style="margin-top:.35rem">${T("Dernier versement :")} ' + esc(String(a.versements[0].at || '').slice(0, 10)) + ' — ' + ambVal(a.versements[0].montant, a.versements[0].points) + '</div>' : '')
              + '</td></tr>';
          }
          return ligne;
        }).join('')
      + '</tbody></table></div>' + ambPages(l.length);
    return h + '</div>';
  }
  function ambExemple(c){
    var v = parseFloat(String(c.valeur).replace(',', '.')) || 0, pct = parseFloat(String(c.rabaisClientPct).replace(',', '.')) || 0;
    var base = Math.round((100 - pct) * 100) / 100, rec;
    if (c.type === 'points') rec = szNombre(Math.floor(base * v), 0) + ' ${T("points")}';
    else if (c.type === 'fixe') rec = szArgent(v);
    else rec = szArgent(Math.floor(base * v) / 100);
    return '${T("Exemple : un client achète 100 $ d’articles avec un code ; après son rabais, la base est de")} <b>' + szArgent(base) + '</b>. '
      + '${T("L’ambassadrice reçoit")} <b>' + rec + '</b>' + ((c.type === 'pourcentage' || c.type === 'fixe') ? ' ${T("(à payer à la main)")}' : '') + '.';
  }
  function ambVueProgramme(){
    var ro = !AMB.peutModifier, dis = ro ? ' disabled' : '';
    if (!AMBCFG) {
      var s = AMB.cfg || {}, r = s.recompense || {};
      AMBCFG = { actif: !!s.actif, titre: s.titre || '', titreEN: s.titreEN || '', texte: s.texte || '', texteEN: s.texteEN || '',
        rabaisClientPct: s.rabaisClientPct, type: r.type || 'credit', valeur: r.valeur, delaiJours: s.delaiJours, _vierge: true };
    }
    var c = AMBCFG;
    return '<div class="carte"><h2>${T("Le programme")}</h2>'
      + szInter('amb-actif', '${T("Programme actif")}', '${T("La page de la boutique, le lien du pied de page et les codes des ambassadrices.")}', !!c.actif, ro ? 'disabled' : '')
      + '<div class="amb-grille" style="margin-top:.6rem">'
      + '<label>${T("Rabais offert à la clientèle (%)")}<input type="number" data-amb-cfg="rabaisClientPct" min="1" max="90" step="1" value="' + esc(c.rabaisClientPct) + '"' + dis + '></label>'
      + '<label>${T("Récompense")}<select data-amb-cfg="type"' + dis + '>'
      + AMBTYPES.map(function(t){ return '<option value="' + t.v + '"' + (c.type === t.v ? ' selected' : '') + '>' + t.l + '</option>'; }).join('')
      + '</select></label>'
      + '<label>${T("Valeur")}<input type="number" data-amb-cfg="valeur" min="0" step="0.5" value="' + esc(c.valeur) + '"' + dis + '><span class="dt" id="amb-unite">' + ambType(c.type).u + '</span></label>'
      + '<label>${T("Délai avant de compter (jours)")}<input type="number" data-amb-cfg="delaiJours" min="0" max="365" step="1" value="' + esc(c.delaiJours) + '"' + dis + '><span class="dt">${T("après la livraison — la fenêtre de retour")}</span></label>'
      + '</div>'
      + '<p class="amb-exemple" id="amb-exemple">' + ambExemple(c) + '</p>'
      + '<div class="amb-deux">'
      + '<label>${T("Titre (français)")}<input data-amb-cfg="titre" maxlength="120" value="' + esc(c.titre) + '"' + dis + '></label>'
      + '<label>${T("Titre (anglais)")}<input data-amb-cfg="titreEN" maxlength="120" value="' + esc(c.titreEN) + '"' + dis + '></label>'
      + '<label>${T("Description du programme (français)")}<textarea data-amb-cfg="texte" maxlength="4000"' + dis + '>' + esc(c.texte) + '</textarea></label>'
      + '<label>${T("Description du programme (anglais)")}<textarea data-amb-cfg="texteEN" maxlength="4000"' + dis + '>' + esc(c.texteEN) + '</textarea></label>'
      + '</div>'
      + (ro ? '' : '<div class="amb-actions"><button type="button" class="prim" data-amb="cfg-enr">${T("Enregistrer les réglages")}</button>'
          + (c._vierge ? '' : '<button type="button" data-amb="cfg-annuler">${T("Annuler les changements")}</button>') + '</div>')
      + '<p class="dt">${T("La page Ambassadrices de la boutique et la politique du programme suivent ces réglages. Éteindre le programme éteint aussi les codes des ambassadrices.")}</p>'
      + '</div>';
  }
  function ambVueDemandes(){
    var l = AMB.demandes || [], ro = !AMB.peutModifier;
    var h = '<div class="carte plein"><h2>${T("Candidatures reçues")}</h2>';
    if (!l.length) return h + '<div class="vide">${T("Aucune candidature pour l’instant.")}' + '<div style="margin-top:.35rem">${T("Elles arrivent par le formulaire de la page Ambassadrices de la boutique.")}</div></div></div>';
    var PILL = { nouvelle: 'ambre', acceptee: 'vert', refusee: '' };
    var LIB = { nouvelle: '${T("Nouvelle")}', acceptee: '${T("Acceptée")}', refusee: '${T("Refusée")}' };
    h += '<div id="amb-table" class="liste"><table><thead><tr><th>${T("Date")}</th>' + '<th>${T("Candidate")}</th>' + '<th>${T("Réseaux")}</th>'
      + '<th>${T("Message")}</th>' + '<th>${T("État")}</th><th></th></tr></thead><tbody>'
      + ambMorceau(l).map(function(d){
          var msg = String(d.message || '');
          return '<tr><td class="dt" style="white-space:nowrap">' + esc(String(d.createdAt || '').slice(0, 10)) + '</td>'
            + '<td><div class="pt-nom">' + esc(d.nom) + '</div><div class="dt">' + esc(d.courriel) + (d.lang === 'en' ? ' · EN' : '') + '</div></td>'
            + '<td class="dt" style="overflow-wrap:anywhere">' + esc(d.reseaux).replace(/\\n/g, '<br>') + '</td>'
            + '<td class="dt" title="' + esc(msg) + '">' + esc(msg.length > 140 ? msg.slice(0, 140) + '…' : msg) + '</td>'
            + '<td><span class="rf-pill ' + (PILL[d.statut] || '') + '">' + (LIB[d.statut] || esc(d.statut)) + '</span></td>'
            + '<td class="fin">' + (ro ? '' : (d.statut !== 'acceptee' ? '<button type="button" class="mini geste" data-amb="creer-de" data-id="' + esc(d.id) + '">${T("Créer l’ambassadrice")}</button> ' : '')
              + (d.statut === 'nouvelle' ? '<button type="button" class="mini geste" data-amb="refuser" data-id="' + esc(d.id) + '">${T("Refuser")}</button> ' : '')
              + '<button type="button" class="mini geste danger" data-amb="suppr-dem" data-id="' + esc(d.id) + '">' + (AMBARME === 'sup:' + d.id ? '${T("Confirmer ?")}' : '${T("Supprimer")}') + '</button>') + '</td></tr>';
        }).join('')
      + '</tbody></table></div>' + ambPages(l.length);
    return h + '</div>';
  }
  function vueAmb(){
    if (!AMB) {
      if (!AMBCHARGE) chargerAmb();
      return '<div class="carte plein"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div></div>';
    }
    if (AMB.erreur) return '<div class="carte plein"><div class="vide">' + esc(AMB.erreur) + '</div></div>';
    var nouv = (AMB.demandes || []).filter(function(d){ return d.statut === 'nouvelle'; }).length;
    var actif = !!(AMB.cfg && AMB.cfg.actif);
    var sous = function(v, lib, n){ return '<button type="button" class="' + (AMBV === v ? 'actif' : '') + '" data-amb-vue="' + v + '">' + lib + (n ? '<span class="n">' + n + '</span>' : '') + '</button>'; };
    return '<div class="amb-zone" id="amb-zone"><div class="amb-sous">'
      + sous('liste', '${T("Ambassadrices et bilan")}', (AMB.ambassadrices || []).length)
      + sous('programme', '${T("Programme")}', 0)
      + sous('demandes', '${T("Candidatures")}', nouv)
      + '<span class="droite"><span class="rf-pill ' + (actif ? 'vert' : '') + '">' + (actif ? '${T("Programme actif")}' : '${T("Programme inactif")}') + '</span></span></div>'
      + (AMBV === 'programme' ? ambVueProgramme() : AMBV === 'demandes' ? ambVueDemandes() : ambVueListe())
      + '</div>';
  }
  function ambApres(r, bon){
    if (!r.ok) { dire(ambExpliquer(r), 'err'); return false; }
    AMB = r; if (bon) dire(bon, 'bon');
    dessiner();
    return true;
  }
  function ambEnregistrer(e, bouton){
    if (!String(e.nom || '').trim()) { dire(AMBMOTIFS.nom, 'att'); return; }
    if (!String(e.code || '').trim()) { dire(AMBMOTIFS.code, 'att'); return; }
    if (bouton) bouton.disabled = true;
    var dem = e.demandeId || '';
    appeler('fidelisation:amb:ecrire', [e]).then(function(r){
      if (bouton) bouton.disabled = false;
      if (!r.ok) { dire(ambExpliquer(r), 'err'); return; }
      AMBED = null;
      var type = (r.cfg && (r.cfg.recompense || {}).type) || 'credit';
      ambApres(r);
      if (r.sansCompte && (type === 'credit' || type === 'points')) dire('${T("Enregistrée. Aucun compte client ne porte ce courriel : le crédit ou les points ne pourront pas lui être versés.")}', 'att');
      else dire('${T("Ambassadrice enregistrée — son code est prêt.")}', 'bon');
      if (dem) appeler('fidelisation:amb:demande', [dem, 'acceptee']).then(function(r2){ if (r2.ok) { AMB = r2; dessiner(); } });
    });
  }
  function ambVerser(b){
    var t = ambTotaux();
    if (AMBARME !== 'verser') {
      AMBARME = 'verser'; dessiner();
      dire('${T("Cliquez « Confirmer le versement ? » —")}' + ' ' + ambVal(t.du, t.duP) + ' ${T("pour")} ' + t.nb + ' ${T("commande(s). Ce geste ne se défait pas.")}', 'att');
      return;
    }
    AMBARME = ''; if (b) b.disabled = true;
    dire('${T("Versement en cours…")}');
    appeler('fidelisation:amb:verser', []).then(function(r){
      if (!r.ok) { dire(ambExpliquer(r), 'err'); dessiner(); return; }
      var res = r.resultat || {}, v = res.verse || [], s = res.sautees || [];
      var RAISONS = { sans_compte: '${T("sans compte client")}', compte_introuvable: '${T("compte introuvable")}', reseau: '${T("erreur réseau")}' };
      AMB = r; dessiner();
      dire('${T("Récompenses versées :")}' + ' ' + v.length + ' ${T("ambassadrice(s).")}'
        + (s.length ? ' ${T("Non versées :")} ' + s.map(function(x){ return esc(x.nom) + ' (' + (RAISONS[x.motif] || esc(x.motif)) + ')'; }).join(', ') + '.' : ''), s.length ? 'att' : 'bon');
    });
  }
  function brancherAmb(){
    var z = document.getElementById('amb-zone'); if (!z) return;
    z.onclick = function(ev){
      var b = ev.target.closest ? ev.target.closest('button') : null; if (!b || b.disabled) return;
      var vue = b.getAttribute('data-amb-vue'), g = b.getAttribute('data-amb'), id = b.getAttribute('data-id') || '';
      var pg = b.getAttribute('data-amb-page');
      if (vue) { AMBV = vue; AMBPAGE = 0; AMBARME = ''; AMBOUV = ''; dessiner(); return; }
      if (pg) { AMBPAGE += Number(pg); AMBOUV = ''; dessiner(); return; }
      if (g !== 'verser' && g !== 'suppr-dem' && AMBARME) AMBARME = '';
      var parId = function(l){ return (l || []).filter(function(x){ return x.id === id; })[0]; };
      if (g === 'ajouter') { AMBED = { id: '', nom: '', courriel: '', code: '', reseaux: '', notes: '', actif: true }; dessiner(); var n = document.getElementById('amb-ed-nom'); if (n) n.focus(); }
      else if (g === 'modifier') { var a = parId(AMB.ambassadrices); if (a) { AMBED = { id: a.id, nom: a.nom, courriel: a.courriel, code: a.code, reseaux: a.reseaux, notes: a.notes, actif: a.actif, userId: a.userId }; dessiner(); } }
      else if (g === 'basculer') { var x = parId(AMB.ambassadrices); if (x) ambEnregistrer({ id: x.id, nom: x.nom, courriel: x.courriel, code: x.code, reseaux: x.reseaux, notes: x.notes, userId: x.userId, actif: !x.actif }, b); }
      else if (g === 'detail') { AMBOUV = AMBOUV === id ? '' : id; dessiner(); }
      else if (g === 'annuler-ed') { AMBED = null; dessiner(); }
      else if (g === 'enregistrer-ed') { ambEnregistrer(AMBED, b); }
      else if (g === 'verser') { ambVerser(b); }
      else if (g === 'cfg-annuler') { AMBCFG = null; dessiner(); }
      else if (g === 'cfg-enr') {
        b.disabled = true;
        var c = AMBCFG || {};
        appeler('fidelisation:amb:reglages', [{ actif: !!c.actif, titre: c.titre, titreEN: c.titreEN, texte: c.texte, texteEN: c.texteEN,
          rabaisClientPct: c.rabaisClientPct, type: c.type, valeur: c.valeur, delaiJours: c.delaiJours }]).then(function(r){
          b.disabled = false;
          if (!r.ok) { dire(ambExpliquer(r), 'err'); return; }
          AMBCFG = null; ambApres(r, '${T("Réglages du programme enregistrés.")}');
        });
      }
      else if (g === 'creer-de') {
        var d = parId(AMB.demandes);
        if (d) { AMBED = { id: '', nom: d.nom, courriel: d.courriel, code: '', reseaux: d.reseaux, notes: d.message || '', actif: true, demandeId: d.id }; AMBV = 'liste'; AMBPAGE = 0; dessiner(); dire('${T("Choisissez son code promo, puis enregistrez.")}', 'att'); }
      }
      else if (g === 'refuser') {
        b.disabled = true;
        appeler('fidelisation:amb:demande', [id, 'refusee']).then(function(r){ b.disabled = false; ambApres(r, '${T("Candidature refusée.")}'); });
      }
      else if (g === 'suppr-dem') {
        if (AMBARME !== 'sup:' + id) { AMBARME = 'sup:' + id; dessiner(); dire('${T("Cliquez « Confirmer ? » — la candidature sera effacée.")}', 'att'); return; }
        AMBARME = ''; b.disabled = true;
        appeler('fidelisation:amb:demande', [id, 'supprimer']).then(function(r){ ambApres(r, '${T("Candidature supprimée.")}'); });
      }
    };
    var moissonner = function(ev){
      var t = ev.target; if (!t || !t.getAttribute) return;
      var k = t.getAttribute('data-amb-champ');
      if (k && AMBED) { AMBED[k] = t.type === 'checkbox' ? t.checked : (k === 'code' ? String(t.value).toUpperCase() : t.value); return; }
      k = t.getAttribute('data-amb-cfg') || (t.id === 'amb-actif' ? 'actif' : '');
      if (k && AMBCFG) {
        AMBCFG[k] = t.type === 'checkbox' ? t.checked : t.value; AMBCFG._vierge = false;
        if (k === 'type') { var u = document.getElementById('amb-unite'); if (u) u.textContent = ambType(t.value).u; }
        var ex = document.getElementById('amb-exemple'); if (ex) ex.innerHTML = ambExemple(AMBCFG);
      }
    };
    z.oninput = moissonner; z.onchange = moissonner;
    if (document.getElementById('amb-table')) {
      _szAutoDernier = 0;
      szAutoPagination('#amb-table', function(n){ var m = Math.max(3, n - 1); if (m !== AMBPP) { AMBPP = m; AMBPAGE = 0; dessiner(); } });
    }
  }

  /* ══ L ONGLET PARRAINAGE (2026-10-07) ══════════════════════════════════════
     « Offrez 10 $ a une amie, recevez 10 $ a sa premiere commande. » Deux vues :
     les amies invitees (chaque coupon emis, sa commande, son verdict) et les
     reglages. ⚠ LE SERVEUR DECIDE (lib-parrainage.php) : qui est nouvelle, ce
     qui est un abus, ce qui est du — et une commande n est jamais payee deux
     fois. Le versement exige en plus admin ou super-admin ET la boutique lancee ;
     le cron des livraisons verse aussi, de lui-meme.
     ⚠ Les saisies vivent dans PARCFG (moissonnees a chaque frappe) : un redessin ne perd rien. */
  var PAR = null, PARCHARGE = false, PARV = 'liste', PARCFG = null, PARARME = '', PARPAGE = 0, PARPP = 12;
  var PARMOTIFS = {
    role:             '${T("Réservé à l’administration (rôle admin ou super-admin).")}',
    pas_lance:        '${T("Les versements commencent au lancement de la boutique.")}',
    inactif:          '${T("Le programme est inactif : rien ne se verse.")}',
    reseau:           '${T("Le serveur ne répond pas — rien n’a été écrit. Réessayez.")}',
    version_site:     '${T("Le site ne connaît pas encore ce programme : rechargez la fenêtre principale.")}',
    montant_amie:     '${T("Rabais de l’amie : entre 1 et 500 $.")}',
    montant_marraine: '${T("Récompense de la marraine : entre 0 et 500 $.")}',
    minimum:          '${T("Commande minimale : entre 0 et 5 000 $.")}',
    delai:            '${T("Délai : entre 0 et 365 jours.")}'
  };
  function parExpliquer(r){ return PARMOTIFS[r && r.motif] || expliquer(r); }
  function chargerPar(){
    PARCHARGE = true;
    appeler('fidelisation:par:donnees', []).then(function(r){
      PARCHARGE = false;
      PAR = r.ok ? r : { erreur: parExpliquer(r) };
      if (r.ok) PARCFG = null;
      if (ONGLET === 'parrainage') dessiner();
    });
  }
  function parOccupe(){ return !!((PARCFG && !PARCFG._vierge) || PARARME); }
  function parRaisonVerser(){
    var t = PAR.totaux || {};
    if (!(PAR.cfg && PAR.cfg.actif)) return PARMOTIFS.inactif;
    if (!PAR.lance) return PARMOTIFS.pas_lance;
    if (!PAR.peutVerser) return PARMOTIFS.role;
    if (!t.nbDues) return '${T("Aucune récompense due pour l’instant.")}';
    return '';
  }
  var PARETATS = {
    emis: '${T("Code émis, pas encore de commande")}', due: '${T("Due")}', versee: '${T("Versée")}',
    annulee: '${T("Annulée")}', remboursee: '${T("Remboursée")}', sous_minimum: '${T("Sous le minimum après retour")}',
    soi_meme: '${T("Commande de la marraine")}', meme_adresse: '${T("Adresse de la marraine")}',
    pas_premiere: '${T("Pas sa première commande")}', non_livree: '${T("Pas encore livrée")}',
    date_livraison: '${T("Date de livraison inconnue")}', zero: '${T("Aucune récompense")}',
    marraine_introuvable: '${T("Marraine introuvable")}',
    marraine_supprimee: '${T("Compte de la marraine supprimé")}'
  };
  function parEtat(l){
    if (l.etat === 'attente' && l.motif === 'delai') return '${T("Délai de retour jusqu’au")}' + ' ' + esc(l.disponibleLe);
    var k = (l.etat === 'due' || l.etat === 'versee' || l.etat === 'emis') ? l.etat : l.motif;
    return PARETATS[k] || esc(l.motif || l.etat);
  }
  function parPill(l){
    return l.etat === 'versee' ? 'vert' : l.etat === 'due' ? 'ambre' : l.etat === 'attente' ? 'bleu' : '';
  }
  function parPages(n){
    var pp = Math.max(1, PARPP), pages = Math.max(1, Math.ceil(n / pp));
    if (PARPAGE >= pages) PARPAGE = pages - 1;
    if (PARPAGE < 0) PARPAGE = 0;
    if (pages < 2) return '';
    return '<div class="amb-pages"><button type="button" class="mini" data-par-page="-1"' + (PARPAGE ? '' : ' disabled') + ' aria-label="${T("Page précédente")}">‹</button>'
      + '<span>' + (PARPAGE + 1) + ' / ' + pages + '</span>'
      + '<button type="button" class="mini" data-par-page="1"' + (PARPAGE < pages - 1 ? '' : ' disabled') + ' aria-label="${T("Page suivante")}">›</button></div>';
  }
  function parVueListe(){
    var l = PAR.lignes || [], ro = !PAR.peutModifier, t = PAR.totaux || {}, raison = parRaisonVerser();
    var h = '<div class="barreoutils"><span class="dt">' + szNombre(t.invitees || 0, 0) + ' ${T("code(s) émis")}' + ' · ' + szNombre(t.commandes || 0, 0) + ' ${T("commande(s)")}' + '</span>'
      + '<div class="droite"><span>${T("En attente :")} <b>' + szArgent(t.attente || 0) + '</b></span>'
      + '<span>${T("Dû :")} <b>' + szArgent(t.du || 0) + '</b></span>'
      + '<span>${T("Versé :")} <b>' + szArgent(t.verse || 0) + '</b></span>'
      + (ro ? '' : '<button type="button" class="mini ' + (PARARME === 'verser' ? 'danger' : 'prim') + '" data-par="verser"'
          + (raison ? ' disabled title="' + esc(raison) + '"' : '') + '>'
          + (PARARME === 'verser' ? '${T("Confirmer le versement ?")}' : '${T("Verser les récompenses dues")}') + '</button>')
      + '</div></div>';
    if (raison && !ro) h += '<div class="dt amb-raison">' + esc(raison) + '</div>';
    h += '<div class="carte plein"><h2>${T("Amies invitées")}</h2>';
    if (!l.length) {
      return h + '<div class="vide">${T("Aucune amie invitée pour l’instant.")}' + '<div style="margin-top:.35rem">${T("Un code s’émet quand une amie arrivée par un lien de parrainage demande son rabais à la caisse.")}</div></div></div>';
    }
    var pp = Math.max(1, PARPP), morceau = l.slice(PARPAGE * pp, PARPAGE * pp + pp);
    h += '<div id="par-table" class="liste"><table><thead><tr><th>${T("Émis le")}</th>' + '<th>${T("Marraine")}</th>' + '<th>${T("Amie")}</th>'
      + '<th>${T("Commande")}</th>' + '<th class="num">${T("Récompense")}</th>' + '<th>${T("État")}</th></tr></thead><tbody>'
      + morceau.map(function(x){
          return '<tr><td class="dt" style="white-space:nowrap">' + esc(x.emisLe) + '</td>'
            + '<td><div class="pt-nom">' + esc(x.marraine || '—') + '</div><div class="dt">' + esc(x.marraineCourriel) + '</div></td>'
            + '<td>' + esc(x.amie) + '<div class="dt"><span class="code">' + esc(x.coupon) + '</span></div></td>'
            + '<td>' + (x.commande ? esc(x.commande) + '<div class="dt">' + esc(x.date) + '</div>' : '<span class="dt">—</span>') + '</td>'
            + '<td class="num">' + (x.montant ? szArgent(x.montant) : '—') + '</td>'
            + '<td><span class="rf-pill ' + parPill(x) + '">' + parEtat(x) + '</span></td></tr>';
        }).join('')
      + '</tbody></table></div>' + parPages(l.length);
    return h + '</div>';
  }
  function parExemple(c){
    var a = parseFloat(String(c.montantAmie).replace(',', '.')) || 0, m = parseFloat(String(c.montantMarraine).replace(',', '.')) || 0;
    var mi = parseFloat(String(c.minimumCommande).replace(',', '.')) || 0, dl = parseInt(c.delaiJours, 10) || 0;
    return '${T("Exemple : une amie arrive par le lien, commande pour")} <b>' + szArgent(Math.max(mi, 60)) + '</b> ${T("d’articles et paie")} <b>' + szArgent(Math.max(0, Math.max(mi, 60) - a)) + '</b>. '
      + '${T("Sa commande livrée, après")} ' + szNombre(dl, 0) + ' ${T("jours sans retour, la marraine reçoit")} <b>' + szArgent(m) + '</b> ${T("en crédit boutique.")}';
  }
  function parVueProgramme(){
    var ro = !PAR.peutModifier, dis = ro ? ' disabled' : '';
    if (!PARCFG) {
      var s = PAR.cfg || {};
      PARCFG = { actif: !!s.actif, montantAmie: s.montantAmie, montantMarraine: s.montantMarraine, minimumCommande: s.minimumCommande, delaiJours: s.delaiJours, _vierge: true };
    }
    var c = PARCFG;
    return '<div class="carte"><h2>${T("Le programme")}</h2>'
      + szInter('par-actif', '${T("Programme actif")}', '${T("Le lien de chaque compte client, le rabais de l’amie à la caisse et la récompense de la marraine.")}', !!c.actif, ro ? 'disabled' : '')
      + '<div class="amb-grille" style="margin-top:.6rem">'
      + '<label>${T("Rabais offert à l’amie ($)")}<input type="number" data-par-cfg="montantAmie" min="1" max="500" step="1" value="' + esc(c.montantAmie) + '"' + dis + '></label>'
      + '<label>${T("Commande minimale de l’amie ($)")}<input type="number" data-par-cfg="minimumCommande" min="0" max="5000" step="1" value="' + esc(c.minimumCommande) + '"' + dis + '><span class="dt">${T("articles, avant taxes et livraison")}</span></label>'
      + '<label>${T("Récompense de la marraine ($)")}<input type="number" data-par-cfg="montantMarraine" min="0" max="500" step="1" value="' + esc(c.montantMarraine) + '"' + dis + '><span class="dt">${T("en crédit boutique")}</span></label>'
      + '<label>${T("Délai avant de verser (jours)")}<input type="number" data-par-cfg="delaiJours" min="0" max="365" step="1" value="' + esc(c.delaiJours) + '"' + dis + '><span class="dt">${T("après la livraison — la fenêtre de retour")}</span></label>'
      + '</div>'
      + '<p class="amb-exemple" id="par-exemple">' + parExemple(c) + '</p>'
      + (ro ? '' : '<div class="amb-actions"><button type="button" class="prim" data-par="cfg-enr">${T("Enregistrer les réglages")}</button>'
          + (c._vierge ? '' : '<button type="button" data-par="cfg-annuler">${T("Annuler les changements")}</button>') + '</div>')
      + '<p class="dt">${T("Le rabais de l’amie est un coupon à usage unique, réservé à son courriel et non cumulable. Refusés par le serveur : la marraine elle-même, son adresse de livraison, et toute personne qui a déjà commandé.")}</p>'
      + '</div>';
  }
  function vuePar(){
    if (!PAR) {
      if (!PARCHARGE) chargerPar();
      return '<div class="carte plein"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div></div>';
    }
    if (PAR.erreur) return '<div class="carte plein"><div class="vide">' + esc(PAR.erreur) + '</div></div>';
    var actif = !!(PAR.cfg && PAR.cfg.actif);
    var sous = function(v, lib, n){ return '<button type="button" class="' + (PARV === v ? 'actif' : '') + '" data-par-vue="' + v + '">' + lib + (n ? '<span class="n">' + n + '</span>' : '') + '</button>'; };
    return '<div class="amb-zone" id="par-zone"><div class="amb-sous">'
      + sous('liste', '${T("Amies invitées et bilan")}', (PAR.totaux || {}).nbDues || 0)
      + sous('programme', '${T("Programme")}', 0)
      + '<span class="droite"><span class="rf-pill ' + (actif ? 'vert' : '') + '">' + (actif ? '${T("Programme actif")}' : '${T("Programme inactif")}') + '</span></span></div>'
      + (PARV === 'programme' ? parVueProgramme() : parVueListe())
      + '</div>';
  }
  function parVerser(b){
    if (PARARME !== 'verser') {
      PARARME = 'verser'; dessiner();
      dire('${T("Cliquez « Confirmer le versement ? » —")}' + ' ' + szArgent((PAR.totaux || {}).du || 0) + ' ${T("en crédit boutique. Ce geste ne se défait pas.")}', 'att');
      return;
    }
    PARARME = ''; if (b) b.disabled = true;
    dire('${T("Versement en cours…")}');
    appeler('fidelisation:par:verser', []).then(function(r){
      if (!r.ok) { dire(parExpliquer(r), 'err'); dessiner(); return; }
      var res = r.resultat || {}, v = res.verse || [], s = res.sautees || [];
      PAR = r; dessiner();
      dire('${T("Récompenses versées :")}' + ' ' + szNombre(v.length, 0) + (s.length ? ' · ' + '${T("non versées :")}' + ' ' + szNombre(s.length, 0) : '') + '.', s.length ? 'att' : 'bon');
    });
  }
  function brancherPar(){
    var z = document.getElementById('par-zone'); if (!z) return;
    z.onclick = function(ev){
      var b = ev.target.closest ? ev.target.closest('button') : null; if (!b || b.disabled) return;
      var vue = b.getAttribute('data-par-vue'), g = b.getAttribute('data-par'), pg = b.getAttribute('data-par-page');
      if (vue) { PARV = vue; PARPAGE = 0; PARARME = ''; dessiner(); return; }
      if (pg) { PARPAGE += Number(pg); dessiner(); return; }
      if (g !== 'verser' && PARARME) PARARME = '';
      if (g === 'verser') { parVerser(b); }
      else if (g === 'cfg-annuler') { PARCFG = null; dessiner(); }
      else if (g === 'cfg-enr') {
        b.disabled = true;
        var c = PARCFG || {};
        appeler('fidelisation:par:reglages', [{ actif: !!c.actif, montantAmie: c.montantAmie, montantMarraine: c.montantMarraine,
          minimumCommande: c.minimumCommande, delaiJours: c.delaiJours }]).then(function(r){
          b.disabled = false;
          if (!r.ok) { dire(parExpliquer(r), 'err'); return; }
          PARCFG = null; PAR = r; dessiner(); dire('${T("Réglages du parrainage enregistrés.")}', 'bon');
        });
      }
    };
    var moissonner = function(ev){
      var t = ev.target; if (!t || !t.getAttribute) return;
      var k = t.getAttribute('data-par-cfg') || (t.id === 'par-actif' ? 'actif' : '');
      if (k && PARCFG) {
        PARCFG[k] = t.type === 'checkbox' ? t.checked : t.value; PARCFG._vierge = false;
        var ex = document.getElementById('par-exemple'); if (ex) ex.innerHTML = parExemple(PARCFG);
      }
    };
    z.oninput = moissonner; z.onchange = moissonner;
    if (document.getElementById('par-table')) {
      _szAutoDernier = 0;
      szAutoPagination('#par-table', function(n){ var m = Math.max(3, n - 1); if (m !== PARPP) { PARPP = m; PARPAGE = 0; dessiner(); } });
    }
  }

  /* ══ L ONGLET PALIERS (2026-10-07) ═════════════════════════════════════════
     Les statuts de fidelite (« Initiee », puis « Privilege » des 500 $ d achats
     sur 12 mois) et leurs avantages : livraison gratuite sans minimum, acces
     anticipe aux nouveautes, points en prime. ⚠ LE PALIER SE CALCULE AU SERVEUR
     (lib-paliers.php) ; ici on ne regle que la grille. La liste des paliers vit
     dans PALED pendant l edition (moissonnee a chaque frappe).
     ⚠ Les produits en acces anticipe se marquent dans la fenetre Produit. */
  var PAL = null, PALED = null, PALMAX = 6;
  var PALMOTIFS = {
    aucun_palier:     '${T("Il faut au moins un palier.")}',
    trop_de_paliers:  '${T("Six paliers au plus.")}',
    nom:              '${T("Chaque palier a besoin d’un nom (français).")}',
    seuil:            '${T("Seuil : entre 0 et 100 000 $.")}',
    seuil_double:     '${T("Deux paliers ne peuvent pas avoir le même seuil.")}',
    bonus:            '${T("Points en prime : entre 0 et 100 %.")}',
    version_site:     '${T("Le site ne connaît pas encore ce programme : rechargez la fenêtre principale.")}'
  };
  function palExpliquer(r){ return PALMOTIFS[r && r.motif] || expliquer(r); }
  function chargerPal(){
    appeler('fidelisation:pal:donnees', []).then(function(r){
      PAL = r.ok ? r : { erreur: palExpliquer(r) };
      if (r.ok) PALED = null;
      if (ONGLET === 'paliers') dessiner();
    });
  }
  function palOccupe(){ return !!(PALED && !PALED._vierge); }
  function palCopie(){
    var c = PAL.cfg || {};
    return { actif: !!c.actif, _vierge: true,
      /* L acces anticipe AUTOMATIQUE (2026-10-07) : tout produit mis en vente y entre d office. */
      anticipeAuto: c.anticipeAuto !== false, anticipeHeures: c.anticipeHeures || 48,
      paliers: (c.paliers || []).map(function(p){
      var a = p.avantages || {};
      return { nom: p.nom || '', nomEN: p.nomEN || '', seuil: p.seuil, livraisonGratuite: !!a.livraisonGratuite, accesAnticipe: !!a.accesAnticipe, bonusPointsPct: a.bonusPointsPct || 0 };
    }) };
  }
  function vuePal(){
    if (!PAL) { chargerPal(); return '<div class="carte plein"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div></div>'; }
    if (PAL.erreur) return '<div class="carte plein"><div class="vide">' + esc(PAL.erreur) + '</div></div>';
    if (!PALED) PALED = palCopie();
    var ro = !PAL.peutModifier, dis = ro ? ' disabled' : '', e = PALED;
    var h = '<div class="amb-zone" id="pal-zone"><div class="carte"><h2>${T("Les paliers")}</h2>'
      + szInter('pal-actif', '${T("Paliers actifs")}', '${T("Le statut dans le compte client, la livraison gratuite à la caisse, l’accès anticipé et les points en prime.")}', !!e.actif, ro ? 'disabled' : '')
      + '<table style="margin-top:.6rem"><thead><tr><th>${T("Nom (français)")}</th>' + '<th>${T("Nom (anglais)")}</th>' + '<th class="num">${T("Dès ($ sur 12 mois)")}</th>'
      + '<th>${T("Livraison gratuite")}</th>' + '<th>${T("Accès anticipé")}</th>' + '<th class="num">${T("Points en prime (%)")}</th><th></th></tr></thead><tbody>'
      + e.paliers.map(function(p, i){
          return '<tr>'
            + '<td><input data-pal-i="' + i + '" data-pal-k="nom" maxlength="40" value="' + esc(p.nom) + '" aria-label="${T("Nom (français)")}"' + dis + '></td>'
            + '<td><input data-pal-i="' + i + '" data-pal-k="nomEN" maxlength="40" value="' + esc(p.nomEN) + '" aria-label="${T("Nom (anglais)")}"' + dis + '></td>'
            + '<td class="num"><input type="number" style="width:7rem" data-pal-i="' + i + '" data-pal-k="seuil" min="0" max="100000" step="10" value="' + esc(p.seuil) + '" aria-label="${T("Dès ($ sur 12 mois)")}"' + dis + '></td>'
            + '<td><input type="checkbox" data-pal-i="' + i + '" data-pal-k="livraisonGratuite"' + (p.livraisonGratuite ? ' checked' : '') + ' aria-label="${T("Livraison gratuite")}"' + dis + '></td>'
            + '<td><input type="checkbox" data-pal-i="' + i + '" data-pal-k="accesAnticipe"' + (p.accesAnticipe ? ' checked' : '') + ' aria-label="${T("Accès anticipé")}"' + dis + '></td>'
            + '<td class="num"><input type="number" style="width:5.5rem" data-pal-i="' + i + '" data-pal-k="bonusPointsPct" min="0" max="100" step="1" value="' + esc(p.bonusPointsPct) + '" aria-label="${T("Points en prime (%)")}"' + dis + '></td>'
            + '<td class="fin">' + (ro || e.paliers.length < 2 ? '' : '<button type="button" class="mini geste danger" data-pal="retirer" data-i="' + i + '">${T("Retirer")}</button>') + '</td></tr>';
        }).join('')
      + '</tbody></table>'
      + (ro ? '' : '<div class="amb-actions">'
          + (e.paliers.length < PALMAX ? '<button type="button" class="mini" data-pal="ajouter">${T("+ Ajouter un palier")}</button>' : '')
          + '<button type="button" class="prim" data-pal="enr">${T("Enregistrer les paliers")}</button>'
          + (e._vierge ? '' : '<button type="button" data-pal="annuler">${T("Annuler les changements")}</button>') + '</div>')
      + '<p class="dt">${T("Le palier d’un client se calcule au serveur sur ses achats des 12 derniers mois : articles après rabais, sans taxes ni livraison, commandes payées et non annulées, moins les remboursements. Les points en prime s’ajoutent au gel des points d’une commande.")}</p>'
      + '<p class="dt">${T("La livraison gratuite et l’accès anticipé s’appliquent dans la boutique, à partir du palier calculé par le serveur ; les frais de livraison d’une commande ne sont pas revérifiés au serveur.")}</p>'
      + '</div>';
    var an = PAL.anticipes || [];
    h += '<div class="carte"><h2>${T("Produits en accès anticipé")}</h2>'
      /* Sa demande du 2026-10-07 : << des que j ajoute de nouveaux produits, ils doivent tomber dans cet acces >>. */
      + szInter('pal-anticipe-auto', '${T("Les nouveaux produits passent d’office en accès anticipé")}',
          '${T("Dès sa mise en vente, un produit est réservé aux paliers qui ont droit à l’accès anticipé, puis il s’ouvre à tous après le délai ci-dessous. La page « Accès anticipé » de la boutique les présente.")}', !!e.anticipeAuto, ro ? 'disabled' : '')
      + '<div class="ch" style="max-width:16rem;margin-top:.5rem"><label for="pal-anticipe-heures">${T("Durée de l’accès anticipé (heures)")}</label>'
      + '<input id="pal-anticipe-heures" type="number" min="1" max="720" step="1" value="' + esc(e.anticipeHeures) + '"' + dis + '></div>'
      + '<p class="dt">${T("Un produit coché « Accès anticipé » dans la fenêtre Produit garde la date que vous lui donnez. Le changement s’applique quand vous enregistrez les paliers.")}</p>';
    if (!an.length) h += '<div class="vide">${T("Aucun produit en accès anticipé pour le moment.")}</div>';
    else h += '<table><thead><tr><th>${T("Produit")}</th>' + '<th>${T("Ouvert à tous le")}</th>' + '<th>${T("Origine")}</th>' + '<th>${T("État")}</th></tr></thead><tbody>'
      + an.map(function(p){
          return '<tr><td>' + esc(p.nom) + (p.actif ? '' : ' <span class="dt">${T("(inactif)")}</span>') + '</td><td class="dt">' + esc(p.publieLe || '—') + '</td>'
            + '<td class="dt">' + (p.auto ? '${T("Automatique")}' : '${T("Date choisie")}') + '</td>'
            + '<td><span class="rf-pill ' + (p.enCours ? 'ambre' : 'vert') + '">' + (p.enCours ? '${T("Réservé aux paliers")}' : '${T("Ouvert à tous")}') + '</span></td></tr>';
        }).join('') + '</tbody></table>';
    return h + '</div></div>';
  }
  function brancherPal(){
    var z = document.getElementById('pal-zone'); if (!z) return;
    z.onclick = function(ev){
      var b = ev.target.closest ? ev.target.closest('button') : null; if (!b || b.disabled) return;
      var g = b.getAttribute('data-pal');
      if (g === 'ajouter' && PALED.paliers.length < PALMAX) {
        var dernier = PALED.paliers[PALED.paliers.length - 1];
        PALED.paliers.push({ nom: '', nomEN: '', seuil: (dernier ? (Number(dernier.seuil) || 0) + 500 : 0), livraisonGratuite: false, accesAnticipe: false, bonusPointsPct: 0 });
        PALED._vierge = false; dessiner();
      }
      else if (g === 'retirer') { PALED.paliers.splice(Number(b.getAttribute('data-i')), 1); PALED._vierge = false; dessiner(); }
      else if (g === 'annuler') { PALED = null; dessiner(); }
      else if (g === 'enr') {
        b.disabled = true;
        appeler('fidelisation:pal:reglages', [{ actif: !!PALED.actif, anticipeAuto: !!PALED.anticipeAuto, anticipeHeures: PALED.anticipeHeures, paliers: PALED.paliers.map(function(p){
          return { nom: p.nom, nomEN: p.nomEN, seuil: p.seuil, avantages: { livraisonGratuite: !!p.livraisonGratuite, accesAnticipe: !!p.accesAnticipe, bonusPointsPct: p.bonusPointsPct } };
        }) }]).then(function(r){
          b.disabled = false;
          if (!r.ok) { dire(palExpliquer(r), 'err'); return; }
          PAL = r; PALED = null; dessiner(); dire('${T("Paliers enregistrés.")}', 'bon');
        });
      }
    };
    var moissonner = function(ev){
      var t = ev.target; if (!t || !t.getAttribute || !PALED) return;
      if (t.id === 'pal-actif') { PALED.actif = t.checked; PALED._vierge = false; return; }
      if (t.id === 'pal-anticipe-auto') { PALED.anticipeAuto = t.checked; PALED._vierge = false; return; }
      if (t.id === 'pal-anticipe-heures') { PALED.anticipeHeures = t.value; PALED._vierge = false; return; }
      var i = t.getAttribute('data-pal-i'), k = t.getAttribute('data-pal-k');
      if (i === null || !k || !PALED.paliers[Number(i)]) return;
      PALED.paliers[Number(i)][k] = t.type === 'checkbox' ? t.checked : t.value; PALED._vierge = false;
    };
    z.oninput = moissonner; z.onchange = moissonner;
  }

  function vueRecompenses(){
    var rs = D.recompenses || [];
    var h = '<div class="barreoutils"><div class="droite"><span>'
      + compte(rs.length, D.recompensesTotal, '${T("récompense")}', '${T("récompenses")}') + '</span></div></div>';
    h += '<div class="carte plein"><h2>${T("Codes de récompense")}</h2>';
    if (!rs.length) {
      h += '<div class="vide">${T("Aucune récompense générée pour l’instant.")}</div>';
    } else {
      h += '<table><thead><tr><th>${T("Code")}</th><th>${T("Sondage")}</th><th>${T("Commande")}</th>'
        + '<th>${T("Répondu le")}</th><th>${T("Utilisé")}</th></tr></thead><tbody>'
        + rs.map(function(r){
            return '<tr><td><span class="rf-code" style="font-size:.84rem;color:var(--tx)">' + esc(r.code) + '</span></td>'
              + '<td>' + esc(r.sondage) + '</td>'
              + '<td class="dt">' + esc(r.commande || '—') + '</td>'
              + '<td class="dt">' + esc(r.date) + '</td>'
              + '<td>' + (r.utilise ? '<span class="rf-pill vert">${T("utilisé")}</span>'
                                    : '<span class="rf-pill">${T("non")}</span>') + '</td></tr>';
          }).join('')
        + '</tbody></table></div>';
    }
    h += '</div>';
    return h;
  }

  function vueInvitations(){
    var iv = D.invitations || [];
    var h = '<div class="barreoutils"><div class="droite">'
      + (D.peutModifier && iv.length
          ? '<button class="mini danger" id="fi-vider">'
            + (ARME === '__invites' ? '${T("Confirmer ?")}' : '${T("Tout supprimer")}') + '</button>' : '')
      + '<span>' + compte(iv.length, D.invitationsTotal, '${T("invitation")}', '${T("invitations")}') + '</span></div></div>';
    h += '<div class="carte plein">';
    if (!iv.length) {
      h += '<div class="vide">${T("Aucune invitation.")}'
        + '<div style="margin-top:.35rem">${T("Elles partent d’elles-mêmes à la confirmation d’une commande ")}'
        + '${T("ou à son passage en « Livrée ».")}</div></div>';
    } else {
      h += '<table><thead><tr><th>${T("Date")}</th><th>${T("Sondage")}</th><th>${T("Destinataire")}</th>'
        + '<th>${T("Déclencheur")}</th><th>${T("État")}</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + iv.map(function(i){
            return '<tr><td class="dt">' + esc(i.date) + '</td>'
              + '<td>' + esc(i.sondage) + '</td>'
              + '<td>' + esc(i.courriel || '—') + '</td>'
              + '<td class="dt">' + esc(i.declencheur) + '</td>'
              + '<td><span class="rf-pill ' + (i.repondu ? 'vert' : 'ambre') + '">'
              + (i.repondu ? '${T("Répondu")}' : '${T("En attente")}') + '</span></td>'
              + (D.peutModifier
                  ? '<td class="fin"><button class="mini geste danger" data-suppr-invite="' + esc(i.id) + '">${T("Supprimer")}</button></td>'
                  : '')
              + '</tr>';
          }).join('')
        + '</tbody></table></div>';
    }
    h += '</div>';
    return h;
  }

  /* ══ CREER ET MODIFIER UN SONDAGE (#33) ════════════════════════════════════
     ⚠ CE GESTE MANQUAIT, ET LA FENETRE Y RENVOYAIT : << Creer un sondage :
     ecran Fidelisation, fenetre principale >>, plus << La creation se fait dans
     l ecran Fidelisation >> quand la liste etait vide. Cet ecran ne s ouvre
     plus depuis que la section est ancrable (1.71.0) : on pouvait consulter
     des sondages sans jamais pouvoir en creer un. Trouve par l audit #32.
     ⚠ LES QUESTIONS VIVENT EN MEMOIRE jusqu a l enregistrement : les ecrire
     une par une ferait autant d ecritures que de frappes, et un sondage a
     moitie ecrit partirait quand meme au prochain declenchement. */
  var EDIT = null;      // { id, nom, declencheur, intro, actif, questions[], recompense{} }
  var FORM = null;      // fidelisation:sondage:form — listes de choix

  function boiteEditeur(){
    var e = EDIT;
    /* RELOOKING 2026 (2026-10-04) : en-tete et pied separes, sections en cartes,
       « actif » et « recompense » en interrupteurs. Identifiants inchanges. */
    var h = '<div class="voile" id="fi-voile-ed"><div class="boite sz-fiche" role="dialog" aria-modal="true" style="max-width:66rem">'
      + '<div class="sz-fiche-tete"><h3>' + (e.id ? '${T("Modifier le sondage")}' : '${T("Nouveau sondage")}') + '</h3>'
      + '<span class="st">${T("Un courriel de questions envoyé au client au moment choisi.")}</span></div>'
      /* ⚠ DEUX COLONNES (sa demande : aucune barre de defilement) — reglages et
         recompense a gauche, questions a droite. Empilee dans une boite de
         42 rem, l edition d un sondage depassait l ecran de 312 px. */
      + '<div class="sz-fiche-corps"><div class="sz-fiche-col"><section class="sz-sect"><h4>${T("Le sondage")}</h4>'
      + '<label class="champ"><span class="lbl">${T("Nom")}</span>'
      + '<input class="t" id="sd-nom" value="' + esc(e.nom) + '" placeholder="${T("Satisfaction après livraison")}"></label>'
      + '<label class="champ"><span class="lbl">${T("Envoyé quand")}</span><select class="t" id="sd-decl">'
      + (FORM.declencheurs || []).map(function(d){
          return '<option value="' + esc(d.v) + '"' + (e.declencheur === d.v ? ' selected' : '') + '>'
            + esc(d.l) + '</option>'; }).join('')
      + '</select></label>'
      + '<label class="champ"><span class="lbl">${T("Texte d’introduction du courriel")}</span>'
      + '<textarea class="t" id="sd-intro" rows="3">' + esc(e.intro) + '</textarea></label>'
      + szInter('sd-actif', '${T("Sondage actif")}', '${T("Il part tout seul à chaque déclenchement.")}', !!e.actif)
      + '</section>';

    var hq = '<section class="sz-sect qs"><div class="qstitre">${T("Questions")}<span class="dt">'
      + e.questions.length + '</span>'
      + '<button class="mini" id="sd-q-plus">${T("+ Ajouter une question")}</button></div>';
    if (!e.questions.length) {
      hq += '<div class="vide" style="padding:.8rem">${T("Aucune question — un sondage vide partirait quand même par courriel.")}</div>';
    }
    hq += e.questions.map(function(q, i){
      return '<div class="qed">'
        + '<div class="qedh"><span class="dt">${T("Question ")}' + (i + 1) + '</span>'
        + '<button class="mini danger" data-q-suppr="' + i + '">✕</button></div>'
        + '<input aria-label="${T("Que pensez-vous de votre achat ?")}" class="t" data-q-lib="' + i + '" value="' + esc(q.libelle) + '" placeholder="${T("Que pensez-vous de votre achat ?")}">'
        + '<div class="qedr"><select class="t" data-q-type="' + i + '"'
          + ' aria-label="${T("Type de la question ")}' + (i + 1) + '">'
        + (FORM.typesQuestion || []).map(function(t){
            return '<option value="' + esc(t.v) + '"' + (q.type === t.v ? ' selected' : '') + '>'
              + esc(t.l) + '</option>'; }).join('')
        + '</select>'
        + '<label class="case"><input type="checkbox" data-q-obl="' + i + '"'
        + (q.obligatoire ? ' checked' : '') + '> ${T("Obligatoire")}</label></div>'
        + (q.type === 'choice'
            ? '<textarea aria-label="${T("Un choix par ligne")}" class="t" data-q-opt="' + i + '" rows="3" placeholder="${T("Un choix par ligne")}">'
              + esc((q.options || []).join('\\n')) + '</textarea>'
            : '')
        + '</div>';
    }).join('');
    hq += '</section>';

    var r = e.recompense;
    h += '<section class="sz-sect"><h4>${T("Récompense")}</h4>'
      + szInter('sd-rec', '${T("Offrir une récompense pour la réponse")}', '${T("Un code de réduction est envoyé à qui répond.")}', !!r.active);
    if (r.active) {
      h += '<div class="qedr">'
        + '<label class="champ" style="flex:1 1 10rem"><span class="lbl">${T("Type")}</span>'
        + '<select class="t" id="sd-rec-type">'
        + (FORM.typesRecompense || []).map(function(t){
            return '<option value="' + esc(t.v) + '"' + (r.type === t.v ? ' selected' : '') + '>'
              + esc(t.l) + '</option>'; }).join('')
        + '</select></label>'
        + '<label class="champ" style="flex:0 0 7rem"><span class="lbl">${T("Valeur")}</span>'
        + '<input class="t" id="sd-rec-val" type="number" min="1" value="' + esc(r.valeur) + '"></label>'
        + '<label class="champ" style="flex:0 0 8rem"><span class="lbl">${T("Valide (jours)")}</span>'
        + '<input class="t" id="sd-rec-j" type="number" min="1" value="' + esc(r.jours) + '"></label>'
        + '</div>'
        + '<label class="champ"><span class="lbl">${T("Message accompagnant le code")}</span>'
        + '<input class="t" id="sd-rec-msg" value="' + esc(r.message) + '" placeholder="${T("Merci ! Voici un code pour votre prochaine commande.")}"></label>';
    }

    h += '</section></div><div class="sz-fiche-col">' + hq + '</div></div>';
    h += '<div class="pied-boite">'
      + '<button class="mini" id="sd-annuler">${T("Annuler")}</button>'
      + '<button class="mini prim" id="sd-enr">' + (e.id ? '${T("Enregistrer")}' : '${T("Créer le sondage")}') + '</button>'
      + '</div></div></div>';
    return h;
  }

  /* ⚠ ON RELIT LES CHAMPS AVANT CHAQUE REDESSIN. Cocher << recompense >> ou
     changer un type de question redessine la boite : sans cette relecture, tout
     ce qui a ete tape avant le clic serait perdu. */
  function moissonner(){
    if (!EDIT) return;
    var v = function(id){ var el = document.getElementById(id); return el ? el.value : null; };
    var c = function(id){ var el = document.getElementById(id); return el ? el.checked : null; };
    if (v('sd-nom') !== null) EDIT.nom = v('sd-nom');
    if (v('sd-decl') !== null) EDIT.declencheur = v('sd-decl');
    if (v('sd-intro') !== null) EDIT.intro = v('sd-intro');
    if (c('sd-actif') !== null) EDIT.actif = c('sd-actif');
    if (c('sd-rec') !== null) EDIT.recompense.active = c('sd-rec');
    if (v('sd-rec-type') !== null) EDIT.recompense.type = v('sd-rec-type');
    if (v('sd-rec-val') !== null) EDIT.recompense.valeur = v('sd-rec-val');
    if (v('sd-rec-j') !== null) EDIT.recompense.jours = v('sd-rec-j');
    if (v('sd-rec-msg') !== null) EDIT.recompense.message = v('sd-rec-msg');
    EDIT.questions.forEach(function(q, i){
      var l = document.querySelector('[data-q-lib="' + i + '"]');
      var t = document.querySelector('[data-q-type="' + i + '"]');
      var o = document.querySelector('[data-q-obl="' + i + '"]');
      var p = document.querySelector('[data-q-opt="' + i + '"]');
      if (l) q.libelle = l.value;
      if (t) q.type = t.value;
      if (o) q.obligatoire = o.checked;
      if (p) q.options = p.value.split('\\n').map(function(x){ return x.trim(); }).filter(Boolean);
    });
  }

  function ouvrirEditeur(id){
    var apres = function(){
      EDIT = (FORM && FORM.sondage) || { id: '', nom: '', declencheur: 'delivered', intro: '',
        actif: true, questions: [], recompense: { active: false, type: 'percent', valeur: 10, jours: 30, message: '' } };
      DETAIL = null; dessiner();
      /* Apres le dessin : la boite de reprise remplit des champs qui n'existent
         qu'une fois l'editeur pose. */
      szBrouillonProposer();
    };
    appeler('fidelisation:sondage:form', [id || '']).then(function(r){
      if (!r || !r.ok) { dire('${T("Éditeur indisponible : ")}' + expliquer(r), 'err'); return; }
      FORM = r; apres();
    });
  }

  /* == LE BROUILLON D'UN SONDAGE ============================================
     Un sondage se compose : nom, declencheur, texte d'introduction du courriel,
     et une LISTE DE QUESTIONS redigees une par une, avec leurs options. C'est du
     texte libre, ecrit pour etre lu par des clientes — on ne le refait pas de
     memoire.
     ⚠ TOUT VIT DANS L'OBJET << EDIT >>, pas dans le DOM, et il ne se synchronise qu'a
     l'appel de << moissonner() >>. On l'appelle donc AVANT de garder : sans cela, la
     derniere question tapee serait absente du brouillon alors qu'elle est a
     l'ecran. C'est la meme mecanique que les etapes d'une chaine.
     ⚠ ET ON GARDE L'OBJET ENTIER : c'est exactement ce que l'enregistrement
     envoie, donc rien ne peut diverger entre ce qu'on garde et ce qu'on ecrirait. */
  szBrouillonBrancher({
    portee: 'sondage',
    libelle: '${T("Un sondage")}',
    ttlMin: 720,
    cle: function(){ return EDIT ? ((EDIT.id || '__new__')) : ''; },
    actif: function(){ return !!EDIT && !!document.getElementById('sd-nom'); },
    valeurs: function(){
      if (!EDIT) return null;
      if (typeof moissonner === 'function') moissonner();
      try { return { _edit: JSON.parse(JSON.stringify(EDIT)) }; } catch (e) { return null; }
    },
    rempli: function(){
      if (!EDIT) return false;
      if (typeof moissonner === 'function') moissonner();
      if (String(EDIT.nom || '').trim() || String(EDIT.intro || '').trim()) return true;
      /* Une question dont le libelle est ecrit compte : c'est du travail, meme
         sans nom de sondage. */
      return (EDIT.questions || []).some(function(q){ return String(q.libelle || '').trim(); });
    },
    remplir: function(v){
      if (!v._edit) return;
      /* On garde l'identifiant COURANT : reprendre un brouillon ne doit pas
         changer la fiche qu'on modifie. */
      var id = EDIT ? EDIT.id : '';
      EDIT = v._edit;
      EDIT.id = id;
      /* L'editeur est DESSINE depuis EDIT : le reposer sans redessiner donnerait
         un ecran qui ne montre pas ce qui sera enregistre. */
      dessiner();
    },
  });
  szBrouillonEcouter();

  function enregistrerSondage(){
    moissonner();
    dire('${T("Enregistrement…")}');
    appeler('fidelisation:sondage:ecrire', [EDIT]).then(function(r){
      if (!r || !r.ok) { dire('${T("Échec : ")}' + expliquer(r), 'err'); return; }
      szBrouillonJeter();
      EDIT = null; FORM = null;
      charger();
      dire('« ' + r.nom + ' » ' + (r.nouveau ? '${T("créé")}' : '${T("enregistré")}') + ' — '
        + r.questions + (r.questions > 1 ? '${T(" questions.")}' : '${T(" question.")}'), 'bon');
    });
  }

  function boiteDetail(){
    var s = DETAIL;
    if (!s) return '';
    var h = '<div class="voile" id="fi-voile"><div class="boite">'
      + '<h3>' + esc(s.nom)
      + ' <span class="rf-pill ' + (s.actif ? 'vert' : '') + '">' + (s.actif ? '${T("Actif")}' : '${T("Inactif")}') + '</span></h3>'
      + '<div class="dt" style="margin-bottom:.5rem">' + esc(s.declencheur)
      + ' · ' + s.nbReponses + (s.nbReponses > 1 ? '${T(" réponses")}' : '${T(" réponse")}') + '</div>';
    if (!s.questions.length) {
      h += '<div class="vide">${T("Ce sondage n’a aucune question.")}</div>';
    } else {
      h += s.questions.map(function(q){
        var b = '<div class="q"><div class="txt">' + esc(q.texte) + '</div>'
          + '<div class="dt">' + q.nbReponses + (q.nbReponses > 1 ? '${T(" réponses")}' : '${T(" réponse")}')
          + (q.moyenne != null ? '${T(" · moyenne ")}' + note5(q.moyenne) : '') + '</div>';
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
    h += '<div class="pied-boite"><button class="mini" id="fi-fermer">${T("Fermer")}</button></div>'
      + '</div></div>';
    return h;
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    if (sous) sous.textContent = D.peutModifier ? '' : 'consultation seulement';

    var h = '<div class="onglets">'
      + '<button type="button" class="' + (ONGLET === 'sondages' ? 'actif' : '') + '" data-onglet="sondages">${T("Sondages")}'
      + ((D.sondages || []).length ? '<span class="n">' + D.sondages.length + '</span>' : '') + '</button>'
      + '<button type="button" class="' + (ONGLET === 'recompenses' ? 'actif' : '') + '" data-onglet="recompenses">${T("Récompenses")}'
      + ((D.recompenses || []).length ? '<span class="n">' + (D.recompensesTotal || D.recompenses.length) + '</span>' : '') + '</button>'
      + '<button type="button" class="' + (ONGLET === 'invitations' ? 'actif' : '') + '" data-onglet="invitations">${T("Invitations")}'
      + ((D.invitations || []).length ? '<span class="n">' + (D.invitationsTotal || D.invitations.length) + '</span>' : '') + '</button>'
      + '<button type="button" class="' + (ONGLET === 'points' ? 'actif' : '') + '" data-onglet="points">${T("Points")}</button>'
      + '<button type="button" class="' + (ONGLET === 'ambassadrices' ? 'actif' : '') + '" data-onglet="ambassadrices">${T("Ambassadrices")}</button>'
      + '<button type="button" class="' + (ONGLET === 'parrainage' ? 'actif' : '') + '" data-onglet="parrainage">${T("Parrainage")}</button>'
      + '<button type="button" class="' + (ONGLET === 'paliers' ? 'actif' : '') + '" data-onglet="paliers">${T("Paliers")}</button>'
      + '<div class="droite">'
      + (D.peutModifier ? '<button class="mini prim" id="fi-nouveau">${T("+ Nouveau sondage")}</button>' : '')
      + '</div>'
      + '</div>';

    /* 🔴 IL Y AVAIT ICI << ONGLET === '${'$'}{T("invitations")}' >> — une VALEUR
       INTERNE comparee a sa TRADUCTION. Le bouton pose data-onglet="invitations"
       en clair ; la comparaison, elle, passait par le dictionnaire.
       ⚠ Ca ne mord pas AUJOURD HUI parce que les deux mots coincident
       (<< invitations >> se dit pareil dans les deux langues) — c est bien le
       probleme : rien ne le signale. Le jour ou ce mot est traduit autrement,
       l onglet Invitations dessinerait SILENCIEUSEMENT les Sondages, sur la
       page anglaise seulement.
       ⚠ La regle du depot est ecrite dans l en-tete de chaque fenetre : on ne
       traduit QUE ce qui se LIT, jamais une valeur. Trouve le 2026-09-24 en
       relisant ce repartiteur pour #151. */
    h += ONGLET === 'recompenses' ? vueRecompenses()
       : ONGLET === 'invitations' ? vueInvitations()
       : ONGLET === 'points' ? vuePoints()
       : ONGLET === 'ambassadrices' ? vueAmb()
       : ONGLET === 'parrainage' ? vuePar()
       : ONGLET === 'paliers' ? vuePal() : vueSondages();
    if (EDIT) h += boiteEditeur();
    else if (DETAIL) h += boiteDetail();
    /* ⚠⚠ LA PLEINE HAUTEUR, MESUREE AVANT ET APRES (#151, 2026-09-24). Cet
       ecran laissait 314 px de bande morte — 41 % de la fenetre. Le chiffre
       qu on lui attribuait (121 px) etait un MIRAGE : son jeu d epreuve
       n ouvrait qu une boite modale, et le voile se lisait comme du vide.
       ⚠ LES TROIS ONGLETS Y ONT DROIT : chacun est une table dans une carte,
       la forme exacte que CSS_HAUTEUR couvre (comme clients et produits).
       ⚠ ET LES DEUX BOITES NE CRAIGNENT RIEN : editeur et depouillement sont
       des .voile en position:fixed — elles flottent au-dessus, donc
       overflow:hidden ne peut pas les rogner. C est ce qu il fallait verifier
       avant d adopter, parce qu une vue coupee ne previent jamais. */
    corps.className = 'corps plein';
    corps.innerHTML = h;
    if (ONGLET !== 'recompenses' && ONGLET !== 'invitations' && ONGLET !== 'points' && ONGLET !== 'ambassadrices' && ONGLET !== 'parrainage' && ONGLET !== 'paliers') {
      var bp = document.getElementById('fi-prec'), bs = document.getElementById('fi-suiv');
      if (bp) bp.onclick = function(){ SPAGE = Math.max(0, SPAGE - 1); dessiner(); };
      if (bs) bs.onclick = function(){ SPAGE = SPAGE + 1; dessiner(); };
      /* Une ligne de moins : la place de la barre de pages, qui n existe pas encore
         au moment ou l on mesure. */
      szAutoPagination('.liste', function(n){ SPARPAGE = Math.max(3, n - 1); SPAGE = 0; dessiner(); });
    }
    brancher();
    if (ONGLET === 'ambassadrices') brancherAmb();
    if (ONGLET === 'parrainage') brancherPar();
    if (ONGLET === 'paliers') brancherPal();
    if (ONGLET === 'points') {
      brancherPoints();
      /* Remis à zéro : la mesure d un autre onglet garderait sinon le même compte, et le rappel
         ne serait pas appelé — la liste resterait à 25 lignes, coupée. */
      _szAutoDernier = 0;
      szAutoPagination('#pt-table', function(n){ if (n !== PPARPAGE) { PPARPAGE = n; PPAGE = 0; ptsRedessinerTable(); } });
    }
  }

  function brancher(){
    var bm = document.getElementById('fi-mail-enr');
    if (bm) bm.onclick = function(){
      var e = document.getElementById('fi-mail');
      bm.disabled = true;
      appeler('fidelisation:notification', [e ? e.value : '']).then(function(r){
        bm.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.courriel ? '${T("Les commentaires partiront à ")}' + r.courriel + '.'
                        : '${T("Plus aucune notification de commentaire.")}', 'bon');
        charger();
      });
    };
    var bf = document.getElementById('fi-fermer');
    if (bf) bf.onclick = function(){ DETAIL = null; dessiner(); };
    var vo = document.getElementById('fi-voile');

    var bv = document.getElementById('fi-vider');
    if (bv) bv.onclick = function(){
      if (ARME !== '__invites') {
        ARME = '__invites'; dessiner();
        dire('${T("Cliquez « Confirmer ? » — les invitations partent, les réponses déjà reçues restent.")}', 'att');
        return;
      }
      ARME = '';
      appeler('fidelisation:viderInvites', []).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(r.efface + (r.efface > 1 ? '${T(" invitations supprimées.")}' : '${T(" invitation supprimée.")}'), 'bon');
        charger();
      });
    };
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest || t.closest('.boite')) return;

    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); ARME = ''; AMBARME = ''; PARARME = ''; dessiner(); if (ONGLET === 'points') chargerPoints(); return; }

    var bs = t.closest('[data-suppr-sondage]');
    if (bs) {
      ev.stopPropagation();
      var idS = bs.getAttribute('data-suppr-sondage');
      var s = (D.sondages || []).filter(function(x){ return x.id === idS; })[0];
      /* Deux clics, et l on DIT combien de reponses disparaissent : elles ne
         se reconstituent pas. */
      if (ARME !== idS) {
        ARME = idS; dessiner();
        dire('${T("Cliquez « Confirmer ? » — le sondage et ses ")}'
          + ((s && s.reponses) || 0)
          + (((s && s.reponses) || 0) > 1 ? '${T(" réponses seront détruits, sans retour possible.")}'
                                          : '${T(" réponse seront détruits, sans retour possible.")}'), 'att');
        return;
      }
      ARME = '';
      appeler('fidelisation:supprimerSondage', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire('« ' + (r.nom || '') + '${T(" » supprimé avec ses ")}' + r.reponsesPerdues
          + (r.reponsesPerdues > 1 ? '${T(" réponses.")}' : '${T(" réponse.")}'), 'bon');
        charger();
      });
      return;
    }

    var bi = t.closest('[data-suppr-invite]');
    if (bi) {
      bi.disabled = true;
      appeler('fidelisation:supprimerInvite', [bi.getAttribute('data-suppr-invite')]).then(function(r){
        if (!r.ok) { bi.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('${T("Invitation à ")}' + (r.courriel || '${T("ce client")}') + '${T(" supprimée.")}', 'bon');
        charger();
      });
      return;
    }

    /* ── Gestes de l editeur de sondage (#33) ── */
    if (t.closest('#fi-nouveau') || t.closest('#fi-premier')) { ouvrirEditeur(''); return; }
    var mo = t.closest('[data-modifier-sondage]');
    if (mo) { ouvrirEditeur(mo.getAttribute('data-modifier-sondage')); return; }
    if (EDIT) {
      /* ⚠ << Annuler >> N'EFFACE PAS LE BROUILLON : on ferme un editeur, on ne
         declare pas jeter son texte. L'ecriture est immediate, valeurs prises
         maintenant. */
      if (t.closest('#sd-annuler')) { szFermerBoite(function(){ EDIT = null; FORM = null; dessiner(); dire(''); }); return; }
      if (t.closest('#sd-enr')) { enregistrerSondage(); return; }
      if (t.closest('#sd-q-plus')) {
        moissonner();
        EDIT.questions.push({ id: '', type: 'rating', libelle: '', obligatoire: true, options: [] });
        dessiner();
        return;
      }
      var qs = t.closest('[data-q-suppr]');
      if (qs) { moissonner(); EDIT.questions.splice(Number(qs.getAttribute('data-q-suppr')), 1); dessiner(); return; }
      /* ⚠ LE VOILE NE FERME PAS L EDITEUR. Un clic a cote perdrait un sondage
         qu on vient de composer ; le detail, lui, ne contient rien a perdre. */
      if (t.closest('#fi-voile-ed') && !t.closest('.boite')) {
        dire('${T("Cliquez « Annuler » pour fermer — la saisie serait perdue.")}', 'att');
        return;
      }
    }

    var tr = t.closest('tr[data-sondage]');
    if (tr) {
      appeler('fidelisation:sondage', [tr.getAttribute('data-sondage')]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        DETAIL = r.sondage; ARME = ''; dessiner();
      });
      return;
    }

    /* ⚠⚠ UN CLIC SUR UN BOUTON NE DOIT PAS DÉSARMER CE QU'IL VIENT D'ARMER.
       Les boutons branches par la fonction de branchement posent l armement,
       puis le clic REMONTE jusqu ici : la ligne de desarmement ci-dessous
       s executait dans la foulee, et le bouton revenait a son libelle
       d origine : on voyait l avertissement sans jamais voir Confirmer ?
       (2026-08-09). Un clic sur une commande est traite par SA commande. */
    if (t.closest('button, input, select, label')) return;
    if (ARME) { ARME = ''; dessiner(); }
  });

  /* ⚠ CHANGER LE TYPE D UNE QUESTION OU COCHER << recompense >> REDESSINE la
     boite (un choix multiple fait apparaitre sa liste d options) : on moissonne
     d abord, sinon tout ce qui est tape avant le changement disparait. */
  corps.addEventListener('change', function(ev){
    if (!EDIT) return;
    var t = ev.target;
    if (!t) return;
    if (t.id === 'sd-rec' || (t.getAttribute && t.getAttribute('data-q-type') !== null)) {
      moissonner(); dessiner();
    }
  });

  function charger(){
    appeler('fidelisation:liste', []).then(function(r){
      if (!r || !r.ok) { vide('${T("Fidélisation indisponible")}', expliquer(r)); return; }
      D = r;
      dessiner();
      /* ⚠ Ouverture directe sur l editeur (id d ouverture) : le banc
         n a aucun moyen de cliquer, et c est justement l editeur qui
         manquait. */
      if (${JSON.stringify(editeur)} && !EDIT) ouvrirEditeur('');
    });
  }

  window.szActualiser = function(){
    var e = document.getElementById('fi-mail');
    if (e && document.activeElement === e) return;
    if (DETAIL || ARME) return;
    // L onglet Ambassadrices : une saisie ou une confirmation en cours n est pas redessinée.
    if (ONGLET === 'ambassadrices' && ambOccupe()) return;
    charger();
    if (ONGLET === 'ambassadrices' && AMB && !AMBCHARGE) chargerAmb();
    // Parrainage et paliers (2026-10-07) : même règle — une saisie ou une confirmation en cours reste.
    if (ONGLET === 'parrainage' && PAR && !PARCHARGE && !parOccupe()) chargerPar();
    if (ONGLET === 'paliers' && PAL && !palOccupe()) chargerPal();
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
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);'
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto');
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

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (DETAIL) { DETAIL = null; dessiner(); return; }
      if (ARME) { ARME = ''; dessiner(); return; }
      if (AMBARME || AMBED) { AMBARME = ''; AMBED = null; dessiner(); return; }
      if (PARARME) { PARARME = ''; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageFidelisation };
