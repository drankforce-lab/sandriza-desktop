'use strict';

/*
 * FENÊTRE « MESSAGERIE CLIENTS » — NATIVE
 * =============================================================================
 * Les demandes de support : deux piles (EN ATTENTE = la file de travail,
 * ARCHIVE = les répondues) et « Toutes ». Cliquer une demande ouvre son
 * panneau : le message du client, le contexte (commande, courriel), votre
 * réponse — qui est ENVOYÉE PAR COURRIEL au client à l'envoi. Le verdict
 * distingue « réponse envoyée » de « enregistrée mais courriel NON parti »
 * (repli Newsletter). Supprimer s'arme en deux clics.
 *
 * ⚠ messagerie:liste ATTEND LA RESYNCHRONISATION des billets (le site relit
 * le nuage, comme les retours) : le premier chargement peut prendre quelques
 * secondes — c'est la fraîcheur, pas une panne.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit — jamais le message de la cliente
   ni la reponse qui part par courriel (voir src/langue/messagerie.js). */
const T = require('../langue').tr('messagerie');

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
/* ── La refonte de l Inventaire (2026-09-25) ── */
.tuiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem;flex:0 0 auto}
.tuile{background:var(--f-carte);border:1px solid var(--v07);min-width:0}
.tuile .sub{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tuile.cliq{cursor:pointer;user-select:none;position:relative}
.tuile.cliq:hover{border-color:#c9a97e}
.tuile.cliq::after{content:"›";position:absolute;top:.55rem;right:.8rem;font-size:1.1rem;color:var(--tx3)}
.tuile.on{border-color:#c9a97e}
.val.att{color:var(--tx-att)}
.ligne{display:flex;align-items:center;gap:.8rem}
.ligne .gauche{flex:1 1 auto;min-width:0}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
button,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
button{cursor:pointer}
textarea{width:100%;min-height:5em;resize:vertical}
button:focus,textarea:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
button .n.hi{background:rgba(245,158,11,.25);color:var(--tx-att)}
.ligne{padding:.55rem .7rem;background:var(--f-carte);border:1px solid var(--v07);
  border-radius:11px;cursor:pointer}
.ligne:hover{border-color:#c9a97e}
.ligne .haut{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}
.ligne .num{font-weight:700}
.ligne .dt{font-size:.72rem;color:var(--tx2);margin-top:.15rem}
.ligne .droite{margin-left:auto;font-size:.74rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:var(--f-carte2);border:1px solid var(--v14);border-radius:13px;
  max-width:40rem;width:100%;max-height:84vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .5rem;font:700 .98rem/1.3 Georgia,serif;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.boite .grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem;
  padding:.55rem 0;border-top:1px solid var(--v08);border-bottom:1px solid var(--v08);
  margin-bottom:.6rem}
.boite .grille .l{font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2)}
.boite .grille .v{font-size:.84rem;font-weight:600;overflow-wrap:anywhere}
.boite .texte{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.88rem;line-height:1.55;
  background:var(--v03);border:1px solid var(--v07);border-radius:9px;padding:.6rem .7rem}
.boite .reponse{margin-top:.6rem;border-left:3px solid #c9a97e;padding:.4rem .7rem;
  background:rgba(201,169,126,.07);border-radius:0 9px 9px 0;font-size:.85rem;white-space:pre-wrap}
.boite .pied-boite{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.75rem;justify-content:flex-end}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Messagerie clients ». */
function pageMessagerie() {
  return `${TETE()}
<title>${T("Messagerie clients — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.support}</span><h1>${T("Messagerie clients")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide charge">${T("Chargement… (les demandes se resynchronisent)")}</div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span id="ret" hidden style="margin-left:auto;display:flex;align-items:center;gap:.4rem;font-size:.76rem;color:var(--tx2)">
    <span title="${T("Les demandes répondues sont supprimées passé ce délai. Les demandes en attente ne le sont jamais.")}">${T("Réponses conservées")}</span>
    <input id="ret-mois" aria-label="${T("Durée de conservation en mois")}" type="number" min="1" max="120" style="width:4.2rem;font:inherit;font-size:.78rem;color:var(--tx);background:var(--f-champ);border:1px solid var(--v12);border-radius:6px;padding:.2rem .35rem">
    <span>${T("mois")}</span>
    <button id="ret-save" style="font:inherit;font-size:.74rem;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:6px;padding:.22rem .5rem;cursor:pointer">${T("Enregistrer")}</button>
  </span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES()}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;
  var ONGLET = 'pending';   // pending | answered | all
  var DETAIL = null;        // la demande ouverte (messagerie:lire)
  var SUPPR_ARME = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès à la messagerie.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cette demande n’existe plus.")}',
    reponse:            '${T("La réponse a échoué.")}',
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
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  function initiales(nom){
    var m = String(nom || '').trim().split(' ').filter(Boolean);
    if (!m.length || m[0] === '—') return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
  }
  function pastille(st){
    return st === 'answered' ? '<span class="rf-pill vert">${T("Répondu")}</span>'
      : st === 'pending' ? '<span class="rf-pill ambre">${T("En attente")}</span>'
      : '<span class="rf-pill">' + esc(st) + '</span>';
  }

  /* ⚠ LA PASTILLE EST DU HTML, LE FICHIER VEUT DU TEXTE. Verser la pastille
     telle quelle mettrait << <span class="pill bon">Répondu</span> >> dans une
     cellule — et ca ne se voit qu une fois le fichier ouvert. Meme decision,
     deux rendus : c est pour ca que les deux lisent le MEME statut brut. */
  function libelleStatut(st){
    return st === 'answered' ? '${T("Répondu")}'
      : st === 'pending' ? '${T("En attente")}'
      : String(st || '');
  }

  /* ══ LE VOCABULAIRE DE LA PILE — pied et nom de fichier ═══════════════════
     ⚠ LES DEUX PLURIELS POUR CHACUNE DES TROIS PILES, comme pour les onglets
     de promotions. Un pluriel decide dans le socle serait faux une fois sur
     deux, et un fragment recolle (<< demandes >> + << en attente >>) ne se
     traduit pas : il se PLACE. L anglais dit << pending requests >>, le
     francais << demandes en attente >> — l ordre des mots change, donc chaque
     phrase existe en entier dans le dictionnaire.
     ⚠ LE NOM DU FICHIER PORTE LA PILE, LUI AUSSI. Trois exports faits le meme
     jour depuis trois onglets se seraient ecrases l un l autre sous le meme
     nom, et rien ne l aurait dit : le dernier ecrit aurait simplement gagne. */
  function motsPile(n){
    var p = (n > 1);
    if (ONGLET === 'pending')  return p ? '${T("demandes en attente")}' : '${T("demande en attente")}';
    if (ONGLET === 'answered') return p ? '${T("demandes répondues")}'  : '${T("demande répondue")}';
    return p ? '${T("demandes")}' : '${T("demande")}';
  }
  function nomPile(){
    return ONGLET === 'pending' ? 'demandes-attente'
      : ONGLET === 'answered' ? 'demandes-repondues'
      : 'demandes';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide charge">${T("Chargement… (les demandes se resynchronisent)")}</div>'; return; }
    var c = D.comptes || {};
    /* ══ LA REFONTE DE L INVENTAIRE, APPLIQUEE A LA MESSAGERIE (2026-09-25) ═══
       Les trois piles deviennent des tuiles (comptes du SITE, sur toutes les
       demandes) qui portent data-onglet, le crochet des anciens boutons.
       Lignes riches aux initiales du client. Crochets gardes : data-onglet,
       .ligne[data-id], #m-exporter, la boite de detail. */
    var tu = function(o, lib, val, sous, ton){
      return '<div class="tuile cliq' + (ONGLET === o ? ' on' : '') + '" data-onglet="' + o + '" title="${T("Cliquer pour afficher")}">'
        + '<div class="lbl">' + lib + '</div><div class="val' + (val && ton ? ' ' + ton : '') + '">' + (val || 0) + '</div>'
        + '<div class="sub">' + sous + '</div></div>';
    };
    var h = szTuiles('<div class="tuiles">'
      + tu('pending', '${T("En attente")}', c.attente, '${T("à répondre")}', 'att')
      + tu('answered', '${T("Archive")}', c.repondues, '${T("demandes répondues")}', '')
      + tu('all', '${T("Toutes")}', c.toutes, '${T("depuis le début")}', '')
      + '</div>');

    var rows = D.lignes || [];
    if (!rows.length) {
      /* Deux phrases ENTIERES, pas un fragment recolle : « dans cette
         categorie » seul ne se traduit pas, il se place. */
      h += '<div class="vide">'
        + (ONGLET !== 'all' ? '${T("Aucune demande dans cette catégorie.")}' : '${T("Aucune demande.")}')
        + '</div>';
    } else {
      h += rows.map(function(r){
        return '<div class="ligne" data-id="' + esc(r.id) + '" title="${T("Ouvrir la demande")}">'
          + '<span class="rf-av" aria-hidden="true">' + esc(initiales(r.client)) + '</span>'
          + '<div class="gauche">'
          + '<div class="haut"><span class="rf-nom">' + esc(r.client || '—') + '</span>'
          + pastille(r.statut)
          + '<span class="droite">' + esc(r.date) + '</span></div>'
          + '<div class="rf-sous"><span class="rf-code">' + esc(r.commande) + '</span>'
          + (r.courriel ? '<span>·</span><span>' + esc(r.courriel) + '</span>' : '')
          + '<span>·</span><span>${T("Raison : ")}' + esc(r.raison || '–') + '</span></div>'
          + '</div></div>';
      }).join('');
      /* Le pied ferme la liste et porte l export (2026-09-24). ⚠ Le compte se
         dit dans le VOCABULAIRE DE LA PILE : une demande repondue n est pas
         une demande en attente, et << 12 demandes >> sous l onglet Archive
         laisserait croire a douze demandes a traiter. */
      h += szPied(
        rows.length + ' ' + motsPile(rows.length),
        '<button class="mini" id="m-exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>');
    }
    if (DETAIL) h += boiteDetail();
    corps.innerHTML = h;
    brancher();
  }

  function boiteDetail(){
    var r = DETAIL;
    return '<div class="voile" id="m-voile"><div class="boite">'
      + '<h3>' + pastille(r.statut) + ' ' + esc(r.commande) + '</h3>'
      + '<div class="grille">'
      + '<div><div class="l">${T("Client")}</div><div class="v">' + esc(r.client) + '</div></div>'
      + '<div><div class="l">${T("Courriel")}</div><div class="v">' + esc(r.courriel || '–') + '</div></div>'
      + '<div><div class="l">${T("Raison")}</div><div class="v">' + esc(r.raison || '–') + '</div></div>'
      + '<div><div class="l">${T("Déposée le")}</div><div class="v">' + esc(r.date) + '</div></div>'
      + (r.reponduLe ? '<div><div class="l">${T("Répondu le")}</div><div class="v">' + esc(r.reponduLe) + '</div></div>' : '')
      + '</div>'
      + '<div class="l" style="font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);'
      + 'margin-bottom:.25rem">${T("Message du client")}</div>'
      + '<div class="texte">' + esc(r.message || '${T("(aucun message)")}') + '</div>'
      + (r.reponse && r.statut === 'answered'
          ? '<div class="reponse"><div style="font-size:.68rem;color:var(--tx2);text-transform:uppercase;'
            + 'letter-spacing:.05em">${T("Votre réponse")}' + (r.reponduLe ? ' · ' + esc(r.reponduLe) : '') + '</div>'
            + esc(r.reponse) + '</div>'
          : '')
      + '<div style="margin-top:.6rem"><div class="l" style="font-size:.62rem;text-transform:uppercase;'
      + 'letter-spacing:.05em;color:var(--tx2);margin-bottom:.25rem">'
      + (r.statut === 'answered' ? '${T("Modifier la réponse (renvoyée par courriel)")}' : '${T("Votre réponse (envoyée par courriel au client)")}') + '</div>'
      + '<textarea aria-label="${T("Rédigez votre réponse")}" id="m-reptxt" placeholder="${T("Rédigez votre réponse…")}">' + esc(r.reponse || '') + '</textarea></div>'
      + '<div class="pied-boite">'
      + '<button class="danger" id="m-supprimer">' + (SUPPR_ARME ? '${T("Confirmer la suppression ?")}' : '<span class="ic">🗑</span> ${T("Supprimer")}') + '</button>'
      + '<button id="m-fermer">${T("Fermer")}</button>'
      + '<button class="prim" id="m-envoyer"><span class="ic">📨</span>${T(" Envoyer la réponse")}</button>'
      + '</div></div></div>';
  }

  function brancher(){
    /* ⚠⚠ LE MESSAGE DE LA CLIENTE N EST PAS DANS LE FICHIER, ET CE N EST PAS UN
       OUBLI. << messagerie:liste >> ne le rapporte pas : seul << messagerie:lire >> le
       porte, une demande a la fois. Un fichier de cinquante lignes coutrait
       donc cinquante allers-retours par le pont, et l export resterait fige le
       temps qu ils reviennent. Le fichier sert a TRIER (qui a ecrit, quand,
       pour quel motif, est-ce repondu) ; pour LIRE, on ouvre la demande.
       ➡ L elargir voudrait dire elargir << _messagerieLigne >> cote site, donc
       faire voyager chaque message a CHAQUE dessin de la liste. Ce n est pas
       une ligne a ecrire ici, c est une decision a prendre ailleurs. */
    var exm = document.getElementById('m-exporter');
    if (exm) exm.onclick = function(){
      var lignes = ((D && D.lignes) || []).map(function(r){
        return [r.commande || '', r.client || '', r.courriel || '',
          r.raison || '', libelleStatut(r.statut), r.date || ''];
      });
      if (!lignes.length) { dire('${T("Rien à exporter.")}', 'att'); return; }
      var csv = szCSV(['${T("Commande")}', '${T("Client")}', '${T("Courriel")}',
        '${T("Raison")}', '${T("Statut")}', '${T("Déposée le")}'], lignes);
      szExporter(nomPile() + '-' + new Date().toISOString().slice(0, 10) + '.csv', csv,
        '${T("La liste des demandes")}');
    };

    var f = document.getElementById('m-fermer');
    if (f) f.onclick = function(){ DETAIL = null; SUPPR_ARME = false; dessiner(); };
    var su = document.getElementById('m-supprimer');
    if (su) su.onclick = function(){
      if (!SUPPR_ARME) {
        SUPPR_ARME = true; dessiner();
        setTimeout(function(){ if (SUPPR_ARME) { SUPPR_ARME = false; if (DETAIL) dessiner(); } }, 4000);
        return;
      }
      SUPPR_ARME = false;
      dire('${T("Suppression…")}');
      appeler('messagerie:supprimer', [DETAIL.id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('${T("Demande supprimée.")}', 'bon');
        DETAIL = null;
        charger();
      });
    };
    var en = document.getElementById('m-envoyer');
    if (en) en.onclick = function(){
      var t = document.getElementById('m-reptxt');
      var txt = (t ? t.value : '').trim();
      if (!txt) { dire('${T("Rédigez une réponse d’abord.")}', 'err'); return; }
      en.disabled = true;
      dire('${T("Envoi de la réponse…")}');
      appeler('messagerie:repondre', [DETAIL.id, txt]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); en.disabled = false; return; }
        /* Le verdict distingue les deux issues : la reponse est toujours
           ENREGISTREE, mais le courriel peut ne pas etre parti (repli
           Newsletter) — et ca doit se dire, pas se deviner. */
        if (r.courriel) dire('${T("Réponse envoyée au client.")}', 'bon');
        else dire('${T("Réponse enregistrée — courriel NON envoyé (vérifiez Infolettre).")}', 'att');
        DETAIL = null;
        charger();
      });
    };
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); charger(); return; }
    if (t.closest('.boite')) return;
    var vo = t.closest('#m-voile');
    if (vo) { DETAIL = null; SUPPR_ARME = false; dessiner(); return; }
    var li = t.closest('.ligne[data-id]');
    if (li) ouvrirDetail(li.getAttribute('data-id'));
  };

  function ouvrirDetail(id){
    dire('${T("Lecture…")}');
    appeler('messagerie:lire', [id]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('');
      DETAIL = r; SUPPR_ARME = false;
      dessiner();
    });
  }

  var enCours = false, RELANCE = false;
  function charger(){
    // ⚠ Cliquer un onglet PENDANT un chargement ne doit pas laisser l'onglet
    // actif ≠ contenu affiché : on note la demande et on redemande avec l'onglet
    // courant à la fin, la réponse périmée n'est pas dessinée (patron commandes.js).
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('messagerie:liste', [{ onglet: ONGLET }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(); return; }
      if (!r || !r.ok) { vide('${T("Messagerie indisponible")}', expliquer(r)); return; }
      D = r;
      dire('');
      dessiner();
      majRetention();
    });
  }

  /* Conservation des demandes répondues — ex-onglet Config « Messagerie clients »,
     rapatrié ici (une seule maison pour la messagerie). En lecture seule sans le
     droit de configuration. */
  function majRetention(){
    var box = document.getElementById('ret'); if (!box) return;
    box.hidden = false;
    var inp = document.getElementById('ret-${T("mois")}');
    var btn = document.getElementById('ret-save');
    if (inp) inp.value = (D && D.retention) || 12;
    var ro = !(D && D.peutModifier);
    if (inp) inp.disabled = ro;
    if (btn) { btn.disabled = ro;
      btn.onclick = function(){
        if (ro) return;
        var v = inp ? inp.value : '';
        btn.disabled = true; dire('${T("Enregistrement…")}');
        appeler('messagerie:retention', [v]).then(function(r){
          btn.disabled = false;
          if (r && r.ok) { if (D) D.retention = r.retention; dire('${T("Conservation enregistrée.")}', 'bon'); }
          else dire(r && r.motif === 'invalide' ? '${T("Valeur entre 1 et 120 mois.")}' : expliquer(r), 'err');
        });
      };
    }
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE — jamais pendant qu une demande
     est ouverte (on redessinerait sous la reponse en cours de redaction). */
  window.szActualiser = function(){ if (!DETAIL) charger(); };
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
      if (DETAIL) { DETAIL = null; SUPPR_ARME = false; dessiner(); return; }
      P.fermer();
    }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageMessagerie };
