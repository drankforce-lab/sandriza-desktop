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

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_JOUR, ICO } = require('./socle.js');

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
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
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
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err)}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:var(--tx-ok)}
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
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx2)}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:var(--f-carte2);border:1px solid var(--v14);border-radius:13px;
  max-width:42rem;width:100%;max-height:88vh;overflow:auto;padding:.9rem 1rem}
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
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Fidélisation et sondages — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.loyalty}</span><h1>Fidélisation et sondages</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement… (les réponses se resynchronisent)</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}${JS_BROUILLON}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var ONGLET = '${depart}';  // sondages | recompenses | invitations
  var DETAIL = null;
  var ARME = '';             // id de sondage armé, ou '__invites'

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

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
        + '<div class="dt" style="margin-bottom:.4rem">Quand un client laisse un commentaire, '
        + 'il vous est transféré à cette adresse. Laissez vide pour ne rien recevoir.</div>'
        + '<div style="display:flex;gap:.5rem;flex-wrap:wrap">'
        + '<input type="email" id="fi-mail" style="flex:1 1 16rem" value="' + esc(D.courrielNotification || '') + '" placeholder="sondages@exemple.com">'
        + '<button class="mini" id="fi-mail-enr">Enregistrer</button></div></div>';
    }

    h += '<div class="carte"><h2>Sondages</h2>';
    if (!(D.sondages || []).length) {
      h += '<div class="vide">Aucun sondage configuré.'
        + (D.peutModifier
            ? '<div style="margin-top:.45rem"><button class="mini prim" id="fi-premier">Créer le premier</button></div>'
            : '') + '</div>';
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
                  ? '<td class="fin"><button class="mini geste" data-modifier-sondage="' + esc(s.id) + '">Modifier</button> '
                    + '<button class="mini geste danger" data-suppr-sondage="' + esc(s.id) + '">'
                    + (ARME === s.id ? 'Confirmer ?' : 'Supprimer') + '</button></td>'
                  : '')
              + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';
    return h;
  }

  /* Les listes de ce cœur sont PLAFONNEES a 100 (la reponse traverserait le pont
     autrement). Afficher << 100 invitations >> quand il y en a 4 500 fait mentir
     l ecran : la tuile du haut, elle, annonce le vrai compte, et les deux se
     contredisent sous les yeux. On dit donc << 100 sur 4 500 >> des que le
     plafond mord, et le compte simple sinon.
     Aucun accent grave ici : le tout part dans un litteral de gabarit. */
  function compte(n, tot, sing, plur){
    if (!tot || tot <= n) return n + ' ' + (n > 1 ? plur : sing);
    return n + ' sur ' + tot + ' ' + plur;
  }

  function vueRecompenses(){
    var rs = D.recompenses || [];
    var h = '<div class="barreoutils"><div class="droite"><span>'
      + compte(rs.length, D.recompensesTotal, 'récompense', 'récompenses') + '</span></div></div>';
    h += '<div class="carte"><h2>Codes de récompense</h2>';
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
      + '<span>' + compte(iv.length, D.invitationsTotal, 'invitation', 'invitations') + '</span></div></div>';
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
    var h = '<div class="voile" id="fi-voile-ed"><div class="boite">'
      + '<h3>' + (e.id ? 'Modifier le sondage' : 'Nouveau sondage') + '</h3>'
      + '<label class="champ"><span class="lbl">Nom</span>'
      + '<input class="t" id="sd-nom" value="' + esc(e.nom) + '" placeholder="Satisfaction après livraison"></label>'
      + '<label class="champ"><span class="lbl">Envoyé quand</span><select class="t" id="sd-decl">'
      + (FORM.declencheurs || []).map(function(d){
          return '<option value="' + esc(d.v) + '"' + (e.declencheur === d.v ? ' selected' : '') + '>'
            + esc(d.l) + '</option>'; }).join('')
      + '</select></label>'
      + '<label class="champ"><span class="lbl">Texte d’introduction du courriel</span>'
      + '<textarea class="t" id="sd-intro" rows="3">' + esc(e.intro) + '</textarea></label>'
      + '<label class="case"><input type="checkbox" id="sd-actif"' + (e.actif ? ' checked' : '')
      + '> Sondage actif</label>';

    h += '<div class="qs"><div class="qstitre">Questions<span class="dt">'
      + e.questions.length + '</span>'
      + '<button class="mini" id="sd-q-plus">+ Ajouter une question</button></div>';
    if (!e.questions.length) {
      h += '<div class="vide" style="padding:.8rem">Aucune question — un sondage vide partirait quand même par courriel.</div>';
    }
    h += e.questions.map(function(q, i){
      return '<div class="qed">'
        + '<div class="qedh"><span class="dt">Question ' + (i + 1) + '</span>'
        + '<button class="mini danger" data-q-suppr="' + i + '">✕</button></div>'
        + '<input class="t" data-q-lib="' + i + '" value="' + esc(q.libelle) + '" placeholder="Que pensez-vous de votre achat ?">'
        + '<div class="qedr"><select class="t" data-q-type="' + i + '">'
        + (FORM.typesQuestion || []).map(function(t){
            return '<option value="' + esc(t.v) + '"' + (q.type === t.v ? ' selected' : '') + '>'
              + esc(t.l) + '</option>'; }).join('')
        + '</select>'
        + '<label class="case"><input type="checkbox" data-q-obl="' + i + '"'
        + (q.obligatoire ? ' checked' : '') + '> Obligatoire</label></div>'
        + (q.type === 'choice'
            ? '<textarea class="t" data-q-opt="' + i + '" rows="3" placeholder="Un choix par ligne">'
              + esc((q.options || []).join('\\n')) + '</textarea>'
            : '')
        + '</div>';
    }).join('');
    h += '</div>';

    var r = e.recompense;
    h += '<label class="case"><input type="checkbox" id="sd-rec"' + (r.active ? ' checked' : '')
      + '> Offrir une récompense pour la réponse</label>';
    if (r.active) {
      h += '<div class="qedr">'
        + '<label class="champ" style="flex:1 1 10rem"><span class="lbl">Type</span>'
        + '<select class="t" id="sd-rec-type">'
        + (FORM.typesRecompense || []).map(function(t){
            return '<option value="' + esc(t.v) + '"' + (r.type === t.v ? ' selected' : '') + '>'
              + esc(t.l) + '</option>'; }).join('')
        + '</select></label>'
        + '<label class="champ" style="flex:0 0 7rem"><span class="lbl">Valeur</span>'
        + '<input class="t" id="sd-rec-val" type="number" min="1" value="' + esc(r.valeur) + '"></label>'
        + '<label class="champ" style="flex:0 0 8rem"><span class="lbl">Valide (jours)</span>'
        + '<input class="t" id="sd-rec-j" type="number" min="1" value="' + esc(r.jours) + '"></label>'
        + '</div>'
        + '<label class="champ"><span class="lbl">Message accompagnant le code</span>'
        + '<input class="t" id="sd-rec-msg" value="' + esc(r.message) + '" placeholder="Merci ! Voici un code pour votre prochaine commande."></label>';
    }

    h += '<div class="pied-boite">'
      + '<button class="mini" id="sd-annuler">Annuler</button>'
      + '<button class="mini prim" id="sd-enr">' + (e.id ? 'Enregistrer' : 'Créer le sondage') + '</button>'
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
      if (!r || !r.ok) { dire('Éditeur indisponible : ' + expliquer(r), 'err'); return; }
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
    libelle: 'Un sondage',
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
    dire('Enregistrement…');
    appeler('fidelisation:sondage:ecrire', [EDIT]).then(function(r){
      if (!r || !r.ok) { dire('Échec : ' + expliquer(r), 'err'); return; }
      szBrouillonJeter();
      EDIT = null; FORM = null;
      charger();
      dire('« ' + r.nom + ' » ' + (r.nouveau ? 'créé' : 'enregistré') + ' — '
        + r.questions + ' question' + (r.questions > 1 ? 's' : '') + '.', 'bon');
    });
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
      + ((D.recompenses || []).length ? '<span class="n">' + (D.recompensesTotal || D.recompenses.length) + '</span>' : '') + '</button>'
      + '<button class="mini' + (ONGLET === 'invitations' ? ' actif' : '') + '" data-onglet="invitations">Invitations'
      + ((D.invitations || []).length ? '<span class="n">' + (D.invitationsTotal || D.invitations.length) + '</span>' : '') + '</button>'
      + '<div class="droite">'
      + (D.peutModifier ? '<button class="mini prim" id="fi-nouveau">+ Nouveau sondage</button>' : '')
      + '</div>'
      + '</div>';

    h += ONGLET === 'recompenses' ? vueRecompenses()
       : ONGLET === 'invitations' ? vueInvitations() : vueSondages();
    if (EDIT) h += boiteEditeur();
    else if (DETAIL) h += boiteDetail();
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
        dire('Cliquez « Annuler » pour fermer — la saisie serait perdue.', 'att');
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
      if (!r || !r.ok) { vide('Fidélisation indisponible', expliquer(r)); return; }
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
