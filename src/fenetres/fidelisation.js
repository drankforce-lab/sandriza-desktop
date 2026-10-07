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
/* L'onglet Points (2026-10-06) */
.pt-ligne{display:flex;align-items:center;gap:.5rem;margin:.2rem 0 .9rem}
.pt-grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:.8rem 1rem}
.pt-grille label{display:flex;flex-direction:column;gap:.3rem;font-size:.8rem;color:var(--tx2)}
.pt-grille input{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.4rem .55rem}
.pt-exemple{margin:.9rem 0;padding:.7rem .85rem;border-radius:10px;background:var(--v05);font-size:.86rem;line-height:1.5}
/* Les soldes (2026-10-06, refaits pour des centaines de clients) : recherche, filtre, tri,
   pages ; l ajustement s ouvre SOUS la ligne, avec la bascule Ajouter / Retirer. */
.pt-outils{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin:.1rem 0 .6rem}
.pt-outils input[type=search]{flex:1 1 260px;min-width:0;padding:.42rem .7rem}
.pt-outils select,.pt-pages select{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.36rem .5rem}
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
  const depart = (['recompenses', 'invitations'].indexOf(ouv) >= 0) ? ouv : 'sondages';
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
      + '<div id="pt-table">' + ptsTable() + '</div>';
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
    var l = ptsFiltres(), n = l.length;
    var pages = Math.max(1, Math.ceil(n / PPARPAGE));
    if (PPAGE >= pages) PPAGE = pages - 1;
    if (PPAGE < 0) PPAGE = 0;
    var de = PPAGE * PPARPAGE, morceau = l.slice(de, de + PPARPAGE);
    if (!n) return '<div class="vide">' + (PQ ? '${T("Aucun client ne correspond à cette recherche.")}' : '${T("Aucun client dans cette liste.")}') + '</div>';
    var h = '<table><thead><tr><th>${T("Client")}</th><th class="num">${T("Points")}</th><th class="num">${T("Valeur")}</th><th></th></tr></thead><tbody>'
      + morceau.map(function(u){
          var ouvert = POUV === u.id;
          return '<tr' + (ouvert ? ' class="pt-ligne-ouverte"' : '') + '><td><div class="pt-nom">' + esc(u.nom || u.courriel) + '</div>'
            + (u.nom && u.courriel ? '<div class="dt">' + esc(u.courriel) + '</div>' : '') + '</td>'
            + '<td class="num' + (u.points > 0 ? '' : ' pt-zero') + '"><b>' + szNombre(u.points, 0) + '</b></td>'
            + '<td class="num dt">' + szArgent(u.points * vp) + '</td>'
            + '<td class="fin">' + (ro ? '' : '<button type="button" class="mini geste' + (ouvert ? ' actif' : '') + '" data-pt-ouvrir="' + esc(u.id) + '">${T("Ajuster")}</button>') + '</td></tr>'
            + (ouvert && !ro ? ptsPanneau(u) : '');
        }).join('')
      + '</tbody></table>';
    h += '<div class="pt-pages"><span>' + szNombre(de + 1, 0) + '–' + szNombre(Math.min(n, de + PPARPAGE), 0) + ' ${T("sur")} ' + szNombre(n, 0) + '</span>'
      + '<select id="pt-parpage" aria-label="${T("Clients par page")}">' + [25, 50, 100].map(function(k){ return '<option value="' + k + '"' + (k === PPARPAGE ? ' selected' : '') + '>' + k + ' ${T("par page")}</option>'; }).join('') + '</select>'
      + '<button type="button" class="mini" data-pt-page="-1"' + (PPAGE ? '' : ' disabled') + ' aria-label="${T("Page précédente")}">‹</button>'
      + '<span>' + (PPAGE + 1) + ' / ' + pages + '</span>'
      + '<button type="button" class="mini" data-pt-page="1"' + (PPAGE < pages - 1 ? '' : ' disabled') + ' aria-label="${T("Page suivante")}">›</button></div>';
    return h;
  }
  function ptsRedessinerTable(focus){
    var z = document.getElementById('pt-table'); if (!z) return;
    z.innerHTML = ptsTable();
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
    var z = document.getElementById('pt-table');
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
      z.onchange = function(e){ if (e.target && e.target.id === 'pt-parpage') { PPARPAGE = Number(e.target.value) || 25; PPAGE = 0; ptsRedessinerTable(); } };
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
      appeler('fidelisation:points:ecrire', [{ actif: !!(document.getElementById('pt-actif') || {}).checked, ptsParDollar: g('pt-ppd'), valeurPoint: g('pt-vp'), plafondPct: g('pt-pl'), minPoints: g('pt-min') }]).then(function(r){
        be.disabled = false;
        if (!r.ok) { dire(r.motif === 'pts_par_dollar' ? '${T("Points par dollar : entre 0 et 100.")}' : r.motif === 'valeur_point' ? '${T("Valeur d’un point : plus de 0 et au plus 10 $.")}' : r.motif === 'plafond' ? '${T("Plafond : entre 0 et 100 %.")}' : expliquer(r), 'err'); return; }
        dire('${T("Réglages enregistrés.")}', 'bon'); chargerPoints();
      });
    };
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
       : ONGLET === 'points' ? vuePoints() : vueSondages();
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
    if (ONGLET !== 'recompenses' && ONGLET !== 'invitations' && ONGLET !== 'points') {
      var bp = document.getElementById('fi-prec'), bs = document.getElementById('fi-suiv');
      if (bp) bp.onclick = function(){ SPAGE = Math.max(0, SPAGE - 1); dessiner(); };
      if (bs) bs.onclick = function(){ SPAGE = SPAGE + 1; dessiner(); };
      /* Une ligne de moins : la place de la barre de pages, qui n existe pas encore
         au moment ou l on mesure. */
      szAutoPagination('.liste', function(n){ SPARPAGE = Math.max(3, n - 1); SPAGE = 0; dessiner(); });
    }
    brancher();
    if (ONGLET === 'points') brancherPoints();
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
    if (vo) vo.onclick = function(ev){ if (ev.target === vo) { DETAIL = null; dessiner(); } };

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
    if (og) { ONGLET = og.getAttribute('data-onglet'); ARME = ''; dessiner(); if (ONGLET === 'points') chargerPoints(); return; }

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
      if (t.closest('#sd-annuler')) { szBrouillonMaintenant(); EDIT = null; FORM = null; dessiner(); dire(''); return; }
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
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageFidelisation };
