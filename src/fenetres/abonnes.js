'use strict';

/*
 * FENÊTRE « ABONNÉS DE L'INFOLETTRE » — NATIVE (1.74.0, palier 4)
 * =============================================================================
 * La liste des abonnés : trois compteurs, filtres (tous / actifs / désabonnés),
 * recherche, ajout à la main, import en vrac, désabonnement et retrait.
 *
 * ⚠ NE COUVRE QUE LES ABONNÉS. La configuration Resend, les campagnes, les
 * chaînes automatisées, l'offre de bienvenue et l'historique d'envoi restent à
 * l'écran web : réglages d'un côté, envois en masse de l'autre — chacun mérite
 * son propre passage.
 *
 * ⚠⚠ « DÉSABONNER » N'EST PAS « RETIRER ». Le premier garde la trace du refus,
 * et c'est elle qui empêche de réinscrire quelqu'un qui s'est retiré. Le second
 * efface tout, y compris cette trace : il est armé en deux clics et le dit.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input,button,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
textarea{width:100%;min-height:8em;resize:vertical;font-family:'Courier New',monospace;font-size:.84rem}
button{cursor:pointer}
input:focus,button:focus,textarea:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v11)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-creme2);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err)}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:#16202f;border:1px solid var(--v08);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:var(--tx-ok)}.tuile .val.neutre{color:var(--tx2)}
.carte{background:#16202f;border:1px solid var(--v08);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.85rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v11)}
tbody td{padding:.3rem .4rem;border-top:1px solid var(--v05);vertical-align:middle}
tbody tr:hover td{background:var(--v03)}
.fin{white-space:nowrap;text-align:right}
.dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx2)}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid var(--v16);border-radius:13px;
  max-width:34rem;width:100%;padding:.9rem 1rem}
.boite h3{margin:0 0 .6rem;font:700 .98rem/1.3 Georgia,serif}
.ch{display:flex;flex-direction:column;gap:.22rem;margin-bottom:.5rem}
.ch label{font-size:.72rem;color:var(--tx2)}
.ch input{width:100%}
.ch .aide{font-size:.68rem;color:var(--tx3)}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.8rem;flex-wrap:wrap}
.vide{padding:1.4rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:#0b1220}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Abonnés de l'infolettre ». */
function pageAbonnes() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Abonnés de l’infolettre — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.newsletter}</span><h1>Abonnés de l’infolettre</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement… (la liste se resynchronise)</div></div>
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
  var Q = '';
  var FILTRE = 'all';        // all | actifs | retires
  var BOITE = null;          // null | 'ajout' | 'import'
  var SUPPR_ARME = '';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à l’infolettre.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cet abonné n’existe plus.',
    refus:              'Inscription refusée.',
    vide:               'Collez au moins une adresse.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' ' + esc(String(r.detail).slice(0, 140));
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

  function filtres(){
    var q = Q.trim().toLowerCase();
    return (D.abonnes || []).filter(function(a){
      if (FILTRE === 'actifs' && !a.actif) return false;
      if (FILTRE === 'retires' && a.actif) return false;
      if (!q) return true;
      return (String(a.courriel) + ' ' + String(a.prenom)).toLowerCase().indexOf(q) !== -1;
    });
  }

  function boiteAjout(){
    return '<div class="voile" id="ab-voile"><div class="boite">'
      + '<h3>Ajouter un abonné</h3>'
      + '<div class="ch"><label>Courriel</label><input type="email" id="ab-mail" placeholder="marie@exemple.com"></div>'
      + '<div class="ch"><label>Prénom</label><input id="ab-prenom" placeholder="Marie">'
      + '<span class="aide">Sert à personnaliser les envois.</span></div>'
      + '<div class="pied-boite"><button class="mini" id="ab-annuler">Annuler</button>'
      + '<button class="mini prim" id="ab-ajouter">Ajouter</button></div>'
      + '</div></div>';
  }

  function boiteImport(){
    return '<div class="voile" id="ab-voile"><div class="boite">'
      + '<h3>Importer des abonnés</h3>'
      + '<div class="dt" style="margin-bottom:.4rem">Une adresse par ligne, ou '
      + '« courriel,prénom ». Les adresses déjà inscrites sont ignorées, pas dupliquées.</div>'
      + '<textarea id="ab-vrac" placeholder="marie@exemple.com,Marie'
      + String.fromCharCode(10) + 'sophie@exemple.com"></textarea>'
      + '<div class="pied-boite"><button class="mini" id="ab-annuler">Annuler</button>'
      + '<button class="mini prim" id="ab-importer">Importer</button></div>'
      + '</div></div>';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var rows = filtres();
    if (sous) sous.textContent = D.peutModifier ? '' : 'consultation seulement';

    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">Abonnés actifs</div><div class="val bon">'
      + (D.actifs || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Désabonnés</div><div class="val neutre">'
      + (D.desabonnes || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Au total</div><div class="val">'
      + ((D.abonnes || []).length) + '</div></div>'
      + '</div>';

    h += '<div class="barreoutils">'
      + '<input type="search" id="ab-q" placeholder="Courriel ou prénom…" value="' + esc(Q) + '">'
      + [['all', 'Tous'], ['actifs', 'Actifs'], ['retires', 'Désabonnés']].map(function(f){
          return '<button class="mini' + (FILTRE === f[0] ? ' actif' : '') + '" data-filtre="' + f[0] + '">'
            + f[1] + '</button>';
        }).join('')
      + '<div class="droite">'
      + (D.peutModifier
          ? '<button class="mini" id="ab-import">Importer</button>'
            + '<button class="mini prim" id="ab-nouveau">+ Ajouter</button>' : '')
      + '<span>' + rows.length + ' abonné' + (rows.length > 1 ? 's' : '') + '</span>'
      + '</div></div>';

    h += '<div class="carte">';
    if (!rows.length) {
      h += '<div class="vide">' + (Q || FILTRE !== 'all' ? 'Rien ne correspond.' : 'Aucun abonné.') + '</div>';
    } else {
      h += '<table><thead><tr><th>Courriel</th><th>Prénom</th><th>Venu par</th>'
        + '<th>Inscription</th><th>État</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + rows.map(function(a){
            var gestes = '';
            if (D.peutModifier) {
              gestes = '<button class="mini geste" data-basculer="' + esc(a.id) + '" data-actif="'
                + (a.actif ? '0' : '1') + '">' + (a.actif ? 'Désabonner' : 'Réactiver') + '</button> '
                + '<button class="mini geste danger" data-suppr="' + esc(a.id) + '">'
                + (SUPPR_ARME === a.id ? 'Confirmer ?' : 'Retirer') + '</button>';
            }
            return '<tr><td><strong>' + esc(a.courriel) + '</strong></td>'
              + '<td>' + esc(a.prenom || '—') + '</td>'
              + '<td class="dt">' + esc(a.sourceLibelle) + '</td>'
              + '<td class="dt">' + esc(a.date) + '</td>'
              + '<td><span class="pill ' + (a.actif ? 'bon' : 'neutre') + '">'
              + (a.actif ? 'Abonné' : 'Désabonné') + '</span>'
              + (!a.actif && a.retireLe ? '<div class="dt">le ' + esc(a.retireLe) + '</div>' : '') + '</td>'
              + (D.peutModifier ? '<td class="fin">' + gestes + '</td>' : '') + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';

    if (BOITE === 'ajout') h += boiteAjout();
    else if (BOITE === 'import') h += boiteImport();

    corps.innerHTML = h;
    brancher();
  }

  function brancher(){
    var q = document.getElementById('ab-q');
    if (q) q.oninput = function(){ Q = q.value; redessinerSansPerdreLaSaisie(); };
    var bn = document.getElementById('ab-nouveau');
    if (bn) bn.onclick = function(){ BOITE = 'ajout'; SUPPR_ARME = ''; dessiner(); };
    var bi = document.getElementById('ab-import');
    if (bi) bi.onclick = function(){ BOITE = 'import'; SUPPR_ARME = ''; dessiner(); szBrouillonProposer(); };
    /* == LE BROUILLON DE L'IMPORT EN VRAC ===================================
       ⚠ ON NE GARDE PAS LE FORMULAIRE << Ajouter >> : deux champs, dont un courriel
       qu'on a sous les yeux au moment de le taper. Un brouillon y serait de la
       machinerie pour rien.
       C'est l'IMPORT qui est a risque : on y collE une LISTE — parfois deux cents
       adresses sorties d'un tableur ou d'un autre service. La perdre, c'est
       refaire l'export. */
    szBrouillonBrancher({
      portee: 'abonnes-import',
      libelle: 'Une liste a importer',
      ttlMin: 720,
      cle: function(){ return '__new__'; },
      actif: function(){ return BOITE === 'import' && !!document.getElementById('ab-vrac'); },
      valeurs: function(){ return szBrouillonDuDom(['ab-vrac'], []); },
      rempli: function(){
        var v = szBrouillonDuDom(['ab-vrac'], []); if (!v) return false;
        return szBrouillonQuelqueChose(v, ['ab-vrac']);
      },
      remplir: function(v){ szBrouillonAuDom(v); },
    });
    szBrouillonEcouter();

    var ba = document.getElementById('ab-annuler');
    if (ba) ba.onclick = function(){ szBrouillonMaintenant(); BOITE = null; dessiner(); };
    var vo = document.getElementById('ab-voile');
    if (vo) vo.onclick = function(ev){ if (ev.target === vo) { szBrouillonMaintenant(); BOITE = null; dessiner(); } };

    var bAjout = document.getElementById('ab-ajouter');
    if (bAjout) bAjout.onclick = function(){
      var m = document.getElementById('ab-mail');
      var pr = document.getElementById('ab-prenom');
      bAjout.disabled = true;
      appeler('abonnes:ajouter', [m ? m.value : '', pr ? pr.value : '']).then(function(r){
        bAjout.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        BOITE = null;
        dire(r.reactive ? (r.courriel + ' réactivé.') : (r.courriel + ' ajouté à la liste.'), 'bon');
        charger();
      });
    };

    var bim = document.getElementById('ab-importer');
    if (bim) bim.onclick = function(){
      var z = document.getElementById('ab-vrac');
      bim.disabled = true;
      appeler('abonnes:importer', [z ? z.value : '']).then(function(r){
        bim.disabled = false;
        /* ⚠ EN CAS D'ECHEC, ON NE JETTE RIEN ET LA BOITE RESTE : la liste collee est
           peut-etre longue, et la refaire est un vrai travail. */
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        szBrouillonJeter();
        BOITE = null;
        /* Le compte rendu distingue les trois cas : << 12 traitees >> ne
           dirait pas ce qui s est passe. */
        dire(r.ajoutes + ' ajoutée' + (r.ajoutes > 1 ? 's' : '')
          + (r.deja ? ', ' + r.deja + ' déjà inscrite' + (r.deja > 1 ? 's' : '') : '')
          + (r.refuses ? ', ' + r.refuses + ' refusée' + (r.refuses > 1 ? 's' : '') : '')
          + ' sur ' + r.lues + ' ligne' + (r.lues > 1 ? 's' : '') + '.',
          r.refuses ? 'att' : 'bon');
        charger();
      });
    };
  }

  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('ab-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('ab-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest || t.closest('.boite')) return;

    var bf = t.closest('[data-filtre]');
    if (bf) { FILTRE = bf.getAttribute('data-filtre'); SUPPR_ARME = ''; dessiner(); return; }

    var bb = t.closest('[data-basculer]');
    if (bb) {
      SUPPR_ARME = '';
      bb.disabled = true;
      appeler('abonnes:basculer', [bb.getAttribute('data-basculer'), bb.getAttribute('data-actif') === '1'])
        .then(function(r){
          if (!r.ok) { bb.disabled = false; dire(expliquer(r), 'err'); return; }
          dire(r.courriel + (r.actif ? ' réabonné.' : ' désabonné — la trace du refus est gardée.'), 'bon');
          charger();
        });
      return;
    }

    var bs = t.closest('[data-suppr]');
    if (bs) {
      var idS = bs.getAttribute('data-suppr');
      /* ⚠ RETIRER efface AUSSI la trace du refus : sans elle, plus rien
         n empeche de reinscrire quelqu un qui s etait desabonne. */
      if (SUPPR_ARME !== idS) {
        SUPPR_ARME = idS;
        dessiner();
        dire('Cliquez « Confirmer ? » — le retrait efface aussi la trace du refus. '
          + 'Pour seulement arrêter les envois, utilisez « Désabonner ».', 'att');
        return;
      }
      SUPPR_ARME = '';
      appeler('abonnes:supprimer', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(r.courriel + ' retiré de la liste.', 'bon');
        charger();
      });
      return;
    }

    /* Un clic sur une commande est traite par SA commande : sans cette garde,
       le clic remonterait ici et desarmerait ce qu il vient d armer. */
    if (t.closest('button, input, select, label')) return;
    if (SUPPR_ARME) { SUPPR_ARME = ''; dessiner(); }
  });

  function charger(){
    appeler('abonnes:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Abonnés indisponibles', expliquer(r)); return; }
      D = r;
      dessiner();
    });
  }

  window.szActualiser = function(){
    var q = document.getElementById('ab-q');
    if (q && document.activeElement === q && q.value) return;
    if (BOITE || SUPPR_ARME) return;
    charger();
  };
  window.szRevenir = function(){ if (!BOITE) charger(); };

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
      if (BOITE) { BOITE = null; dessiner(); return; }
      if (SUPPR_ARME) { SUPPR_ARME = ''; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageAbonnes };
