'use strict';

/*
 * FENÊTRE « NOS RETOURS » — NATIVE
 * =============================================================================
 * La liste des demandes de retour : les neuf onglets de statut avec compteurs
 * (la sémantique — « complétées » = remboursées + complétées, « expire
 * bientôt » — vit dans le cœur du site, Admin._retoursDonnees), la recherche
 * (nom, courriel, numéro de commande), l'alerte d'expiration. Cliquer une
 * ligne ouvre la FENÊTRE DE RETOUR native (retours:ouvrir). AUCUNE écriture
 * ici : approuver, rembourser, marquer reçu sont des gestes de la fenêtre.
 *
 * ⚠ retours:liste ATTEND LA RESYNCHRONISATION des demandes avant de répondre
 * (le site relit le nuage, comme son écran) : le premier chargement peut
 * prendre quelques secondes — c'est la fraîcheur, pas une panne.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit — jamais le motif, qui est ce que
   la cliente a ecrit (voir src/langue/retours.js). */
const T = require('../langue').tr('retours');

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
.barreoutils{flex:0 0 auto;display:flex;gap:.4rem;align-items:center;flex-wrap:wrap}
input[type=search],button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:220px;margin-left:auto}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
button .n.hi{background:rgba(245,158,11,.25);color:var(--tx-att)}
/* Les tuiles de tete (refonte du 2026-09-25), aux mesures de l Inventaire. */
.tuiles{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.6rem;flex:0 0 auto;margin-bottom:.6rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);min-width:0;cursor:pointer;user-select:none}
.tuile .sub{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tuile:hover{border-color:rgba(201,169,126,.6)}
.tuile.on{border-color:#c9a97e}
.val.att{color:var(--tx-att)}.val.err{color:var(--tx-err)}
.ligne{display:flex;align-items:center;gap:.8rem;padding:.6rem .75rem;cursor:pointer;
  background:var(--f-carte);border:1px solid var(--v07);border-radius:11px}
.ligne:hover{border-color:#c9a97e}
.ligne .gauche{flex:1 1 auto;min-width:0}
.ligne .haut{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}
.ligne .num{font-weight:700}
.ligne .dt{font-size:.72rem;color:var(--tx2)}
.ligne .droite{flex:0 0 auto;text-align:right;font-size:.74rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.pill.info{background:rgba(59,130,246,.16);color:var(--tx-bleu)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Nos Retours ». */
function pageRetours() {
  return `${TETE()}
<title>${T("Nos Retours — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.returns}</span><h1>${T("Nos Retours")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps plein" id="corps"><div class="vide charge">${T("Chargement… (les demandes se resynchronisent)")}</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES()}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;
  var ONGLET = 'pending';
  var Q = '';

  var ONGLETS = [
    ['pending', '${T("En attente")}'], ['approved', '${T("Approuvées")}'], ['in_transit', '${T("En transit")}'],
    ['expiring_soon', '${T("Expire bientôt")}'], ['received', '${T("Reçues")}'], ['disputed', '${T("À analyser")}'],
    ['rejected', '${T("Rejetées")}'], ['completed', '${T("Complétées")}'], ['all', '${T("Toutes")}']
  ];
  /* La pastille a point de l Inventaire (rf-pill, refonte du 2026-09-25) : ambre
     ce qui attend un geste, bleu ce qui avance, vert ce qui est regle, rouge ce
     qui est refuse ou conteste, gris le reste. */
  var TONS = { pending: 'ambre', approved: 'vert', in_transit: 'bleu', received: 'ambre',
    refunded: 'vert', completed: 'vert', rejected: 'rouge', disputed: 'rouge', awaiting_photo: '' };
  /* Les cinq etats qui DEMANDENT UN GESTE deviennent des tuiles ; les quatre
     autres restent en pastilles dans la barre. Neuf pastilles et la recherche
     ne tenaient pas sur une ligne en anglais. Rien ne se perd : les neuf listes
     restent a un clic. */
  var EN_TUILE = { pending: '${T("à traiter")}', in_transit: '${T("en route vers nous")}',
    received: '${T("à inspecter")}', disputed: '${T("à trancher")}', expiring_soon: '${T("délai qui s’achève")}' };
  function initiales(nom){
    var m = String(nom || '').trim().split(' ').filter(Boolean);
    if (!m.length || m[0] === '—') return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
  }

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function fmtDate(d){
    try { return new Date(d).toLocaleDateString('${LIEU()}'); } catch (e) { return String(d || ''); }
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux retours.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cette demande n’existe plus.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    return MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
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

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide charge">${T("Chargement… (les demandes se resynchronisent)")}</div>'; return; }
    var c = D.comptes || {};
    /* ══ LA REFONTE DE L INVENTAIRE, APPLIQUEE A RETOURS (2026-09-25) ═════════
       Tuiles pour ce qui demande un geste (ambre, ou rouge pour ce qui expire
       et ce qui est conteste, des qu il y en a), barre sur une ligne a loupe,
       lignes riches aux initiales. Crochets gardes : data-onglet, #r-q,
       .ligne[data-id], le verrou, #r-exporter. */
    var h = szTuiles('<div class="tuiles">' + ONGLETS.filter(function(o){ return EN_TUILE[o[0]]; }).map(function(o){
        var n = c[o[0]] || 0;
        var ton = !n ? '' : ((o[0] === 'disputed' || o[0] === 'expiring_soon') ? 'err' : 'att');
        return '<div class="tuile' + (ONGLET === o[0] ? ' on' : '') + '" data-onglet="' + o[0] + '"'
          + ' title="${T("Cliquer pour afficher")}"><div class="lbl">' + o[1] + '</div>'
          + '<div class="val ' + ton + '">' + n + '</div><div class="sub">' + EN_TUILE[o[0]] + '</div></div>';
      }).join('') + '</div>');
    h += '<div class="carte"><div class="rf-tb">'
      + '<label class="rf-rch">${ICO.loupe}<input aria-label="${T("Nom, courriel, n° commande")}" type="search" id="r-q" placeholder="${T("Nom, courriel, n° commande…")}" value="' + esc(Q) + '"></label>'
      + ONGLETS.filter(function(o){ return !EN_TUILE[o[0]]; }).map(function(o){
          var n = c[o[0]] || 0;
          return '<button class="rf-jet' + (ONGLET === o[0] ? ' on' : '') + '" data-onglet="' + o[0] + '">'
            + o[1] + '<span class="n">' + n + '</span></button>';
        }).join('')
      + '</div></div>';

    var rows = D.lignes || [];
    if (!rows.length) {
      /* Deux phrases ENTIERES, pas un fragment recolle. */
      h += '<div class="vide">'
        + (ONGLET !== 'all' ? '${T("Aucune demande dans cette catégorie.")}' : '${T("Aucune demande.")}')
        + '</div>';
    } else {
      /* ⚠ PLEINE HAUTEUR (2026-09-19) : cet ecran n a PAS de carte, ses lignes
         sont riches. La zone defilante est donc fille du CORPS, pas d une
         carte — le socle couvre les deux formes. */
      h += '<div class="liste">' + rows.map(function(r){
        var badges = '<span class="rf-pill ' + (TONS[r.statut] || '') + '">' + esc(szTd(r.statutLibelle)) + '</span>';
        if (r.expireAuto) badges += ' <span class="rf-pill rouge">${T("Expirée automatiquement")}</span>';
        if (r.expireBientot) badges += ' <span class="rf-pill rouge">${T("Expire le ")}' + esc(r.expireLe) + '</span>';
        if (r.suivi) badges += ' <span class="rf-pill"><span class="rf-code">' + esc(r.suivi) + '</span></span>';
        if (r.etiquette === 'reelle') badges += ' <span class="rf-pill bleu">${T("Étiquette réelle")}</span>';
        else if (r.etiquette === 'generee') badges += ' <span class="rf-pill bleu">${T("Étiquette générée")}</span>';
        if (r.fraisBoutique) badges += ' <span class="rf-pill bleu">${T("Frais pris en charge")}</span>';
        return '<div class="ligne" data-id="' + esc(r.id) + '" title="${T("Ouvrir la demande de retour")}">'
          + '<span class="rf-av" aria-hidden="true">' + esc(initiales(r.client)) + '</span>'
          + '<div class="gauche">'
          + '<div class="haut"><span class="rf-nom">' + esc(r.client || '—') + '</span>'
          + szVerrouCase('return_reqs', r.id) + badges + '</div>'
          + '<div class="rf-sous"><span class="rf-code">' + esc(r.commande) + '</span>'
          + (r.courriel ? '<span>·</span><span>' + esc(r.courriel) + '</span>' : '') + '</div>'
          + '<div class="dt">${T("Motif : ")}' + esc(r.motif || '–') + '</div>'
          + '</div>'
          + '<div class="droite">' + esc(fmtDate(r.date)) + '</div>'
          + '</div>';
      }).join('') + '</div>';
      /* Le pied ferme la liste et porte l export (2026-09-19). ⚠ Cet ecran
         n est PAS un tableau : ce sont des lignes riches. Le fichier, lui, est
         tabulaire — et c est justement pour ca qu il sert a autre chose. */
      h += szPied(
        rows.length + ' ' + (rows.length > 1 ? '${T("demandes")}' : '${T("demande")}'),
        '<button class="mini" id="r-exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>');
    }
    corps.innerHTML = h;
    szVerrousPeindre();   // reposer les cadenas connus sur la liste fraiche

    /* ⚠ LES PASTILLES DEVIENNENT DES COLONNES. A l ecran, << expiree
       automatiquement >>, << frais pris en charge >> et le mode d etiquette
       sont des marques posees a cote du nom ; dans un fichier ce sont les
       criteres sur lesquels on va trier et compter. Une pastille perdue dans
       un export, c est une question a laquelle le fichier ne repondra pas. */
    var exr = document.getElementById('r-exporter');
    if (exr) exr.onclick = function(){
      var lignes = (D.lignes || []).map(function(r){
        return [r.commande || '', r.client || '', r.courriel || '', r.motif || '',
          r.statutLibelle || '', fmtDate(r.date), r.suivi || '',
          r.etiquette || '',
          r.expireAuto ? '${T("Oui")}' : '${T("Non")}',
          r.fraisBoutique ? '${T("Oui")}' : '${T("Non")}'];
      });
      if (!lignes.length) { dire('${T("Rien à exporter.")}', 'att'); return; }
      var csv = szCSV(['${T("Commande")}', '${T("Client")}', '${T("Courriel")}',
        '${T("Motif")}', '${T("Statut")}', '${T("Date")}', '${T("Suivi")}',
        '${T("Étiquette")}', '${T("Expirée automatiquement")}',
        '${T("Frais pris en charge")}'], lignes);
      szExporter('retours-' + new Date().toISOString().slice(0, 10) + '.csv', csv,
        '${T("La liste des retours")}');
    };

    var q = document.getElementById('r-q');
    if (q) {
      q.oninput = function(){
        Q = q.value;
        clearTimeout(window._rq);
        window._rq = setTimeout(function(){ charger(true); }, 300);
      };
    }
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); charger(); return; }
    if (t.closest('button') || t.closest('input')) return;
    var li = t.closest('.ligne[data-id]');
    if (!li) return;
    dire('${T("Ouverture…")}');
    appeler('retours:ouvrir', [li.getAttribute('data-id')]).then(function(r){
      dire(r.ok ? '${T("Demande ouverte dans sa fenêtre.")}' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  };

  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('retours:liste', [{ onglet: ONGLET, q: Q }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('${T("Retours indisponibles")}', expliquer(r)); return; }
      D = r;
      dire('');
      if (garderSaisie) redessinerSansPerdreLaSaisie();
      else dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('r-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('r-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : un retour enregistré, reçu ou
     finalisé fait relire la liste — jamais pendant une saisie. */
  window.szActualiser = function(){
    var q = document.getElementById('r-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ charger(); };

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
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
  szVerrousSuivre(['return_reqs']);
})();
</script>
</body></html>`;
}

module.exports = { pageRetours };
