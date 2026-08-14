'use strict';

/*
 * FENÊTRE « CHAT EN LIGNE » — NATIVE (1.69.0, palier 4)
 * =============================================================================
 * La file des conversations et le suivi de satisfaction : la liste (avec le
 * nombre en attente), la conversation entière message par message, la réponse
 * sur place, le changement d'état, la suppression armée en deux clics.
 *
 * ⚠ NE COUVRE QUE LES OPÉRATIONS. La configuration du chat et celle de son
 * assistant IA sont des RÉGLAGES : les mêler ici aurait donné une fenêtre à
 * moitié écran de travail, à moitié panneau d'options.
 * ⚠⚠ CETTE PHRASE A COÛTÉ UN ÉCRAN. Elle disait « elles restent à l'écran web
 * et suivront avec la Configuration, au palier 5 » — sauf qu'elles n'ont jamais
 * suivi, et que cette fenêtre-ci prend TOUT l'écran `chat` depuis la 1.69.0.
 * Les réglages sont donc restés joignables NULLE PART pendant des semaines,
 * sans qu'aucun contrôle s'en aperçoive (il vérifiait que le natif existe, pas
 * qu'il couvre le même terrain). Ils ont maintenant leur fenêtre :
 * `chat-config.js`, section `config-chat` (3.9.0, #31).
 * ➡ UN PORTAGE PARTIEL DOIT LE DIRE ICI **ET** LAISSER UNE PORTE OUVERTE.
 *
 * ⚠ LA LISTE ATTEND LA RESYNCHRONISATION (chat:liste est ASYNCHRONE) : une
 * conversation ouverte depuis un autre appareil doit paraître. Sur quelqu'un
 * qui attend une réponse, une file périmée est pire qu'une file lente.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR } = require('./socle.js');

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
input,select,button,textarea{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:190px}
textarea{width:100%;min-height:4.5em;resize:vertical}
select,button{cursor:pointer}
input:focus,select:focus,button:focus,textarea:focus{outline:none;border-color:#c9a97e}
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
button .n.hi{background:rgba(239,68,68,.28);color:#fca5a5}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:#4ade80}.tuile .val.err{color:#f87171}
.tuile .sub{font-size:.66rem;color:#8fa1b8;margin-top:.1rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:#8fa1b8;font-weight:700}
.ligne{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.55rem .75rem;cursor:pointer}
.ligne:hover{border-color:#c9a97e}
.ligne .haut{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}
.ligne .droite{margin-left:auto;text-align:right}
.dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.err{background:rgba(239,68,68,.16);color:#f87171}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:42rem;width:100%;max-height:88vh;display:flex;flex-direction:column;padding:.9rem 1rem}
.boite h3{margin:0 0 .5rem;font:700 .98rem/1.3 Georgia,serif;display:flex;
  align-items:center;gap:.5rem;flex-wrap:wrap}
.fil{flex:1 1 auto;min-height:6rem;overflow-y:auto;display:flex;flex-direction:column;
  gap:.4rem;padding:.5rem;background:rgba(255,255,255,.03);border-radius:9px;
  border:1px solid rgba(255,255,255,.07)}
.bulle{max-width:78%;padding:.4rem .65rem;border-radius:11px;font-size:.86rem;
  white-space:pre-wrap;overflow-wrap:anywhere}
.bulle.visiteur{align-self:flex-start;background:rgba(255,255,255,.07)}
.bulle.agent{align-self:flex-end;background:rgba(201,169,126,.16);border:1px solid rgba(201,169,126,.3)}
.bulle.bot{align-self:flex-start;background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.25)}
.bulle .qd{display:block;font-size:.64rem;color:#8fa1b8;margin-top:.15rem}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.7rem;flex-wrap:wrap}
.vide{padding:1.3rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Chat en ligne ». */
function pageChat() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Chat en ligne — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">💬</span><h1>Chat en ligne</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement… (les conversations se resynchronisent)</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var ONGLET = 'file';       // file | satisfaction
  var FILTRE = '';           // '' | pending | open | closed
  var Q = '';
  var DETAIL = null;
  var SUPPR_ARME = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès au chat.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette conversation n’existe plus.',
    vide:               'Écrivez une réponse avant de l’envoyer.',
    statut:             'État inconnu.',
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

  var TONS = { pending: 'att', open: 'bon', closed: 'neutre' };

  function filtrees(){
    var q = Q.trim().toLowerCase();
    return (D.conversations || []).filter(function(c){
      if (FILTRE && c.statut !== FILTRE) return false;
      if (!q) return true;
      return (String(c.nom) + ' ' + String(c.courriel) + ' ' + String(c.telephone))
        .toLowerCase().indexOf(q) !== -1;
    });
  }

  function vueFile(){
    var rows = filtrees();
    var h = '<div class="barreoutils">'
      + '<input type="search" id="ch-q" placeholder="Nom, courriel, téléphone…" value="' + esc(Q) + '">'
      + [['', 'Toutes'], ['pending', 'En attente'], ['open', 'Ouvertes'], ['closed', 'Fermées']]
          .map(function(f){
            return '<button class="mini' + (FILTRE === f[0] ? ' actif' : '') + '" data-filtre="' + f[0] + '">'
              + f[1] + (f[0] === 'pending' && D.enAttente
                  ? '<span class="n hi">' + D.enAttente + '</span>' : '') + '</button>';
          }).join('')
      + '<div class="droite"><span>' + rows.length + ' conversation' + (rows.length > 1 ? 's' : '')
      + (D.horsLigne ? ' · ' + D.horsLigne + ' hors ligne' : '') + '</span></div></div>';

    if (!rows.length) {
      h += '<div class="vide">' + (Q || FILTRE ? 'Rien ne correspond.' : 'Aucune conversation à traiter.') + '</div>';
      return h;
    }
    h += rows.map(function(c){
      return '<div class="ligne" data-id="' + esc(c.id) + '" title="Ouvrir la conversation">'
        + '<div class="haut"><strong>' + esc(c.nom) + '</strong>'
        + '<span class="pill ' + (TONS[c.statut] || 'neutre') + '">' + esc(c.statutLibelle) + '</span>'
        + (c.horsLigne ? '<span class="pill neutre">hors ligne</span>' : '')
        + '<span class="droite"><span class="dt">' + esc(c.date) + '</span>'
        + '<div class="dt">' + c.nbMessages + ' message' + (c.nbMessages > 1 ? 's' : '') + '</div></span></div>'
        + '<div class="dt">' + esc(c.courriel || '—')
        + (c.telephone ? ' · ' + esc(c.telephone) : '') + '</div>'
        + '</div>';
    }).join('');
    return h;
  }

  function vueSatisfaction(){
    var s = D.satisfaction || {};
    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">Conversations</div><div class="val">' + (s.total || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Évaluées</div><div class="val">' + (s.rated || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Satisfaites</div><div class="val bon">' + (s.satisfied || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Insatisfaites</div><div class="val err">' + (s.unsatisfied || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Taux</div><div class="val">'
      + (s.rate == null ? '—' : s.rate + ' %') + '</div>'
      + '<div class="sub">' + (s.rate == null ? 'aucune évaluation' : 'des évaluations') + '</div></div>'
      + '</div>';

    h += '<div class="carte"><h2>Commentaires laissés</h2>';
    var cs = s.comments || [];
    if (!cs.length) {
      h += '<div class="vide">Aucun commentaire pour l’instant.</div>';
    } else {
      h += cs.map(function(c){
        return '<div style="padding:.35rem 0;border-top:1px solid rgba(255,255,255,.055)">'
          + '<span class="pill ' + (c.score === true ? 'bon' : 'err') + '">'
          + (c.score === true ? 'satisfait' : 'insatisfait') + '</span> '
          + '<strong>' + esc(c.name || 'Visiteur') + '</strong>'
          + '<div style="font-size:.86rem;white-space:pre-wrap;overflow-wrap:anywhere">'
          + esc(c.comment || '') + '</div></div>';
      }).join('');
    }
    h += '</div>';
    return h;
  }

  function boiteDetail(){
    var c = DETAIL;
    if (!c) return '';
    var h = '<div class="voile" id="ch-voile"><div class="boite">'
      + '<h3>' + esc(c.nom)
      + ' <span class="pill ' + (TONS[c.statut] || 'neutre') + '">' + esc(c.statut) + '</span>'
      + (c.horsLigne ? ' <span class="pill neutre">hors ligne</span>' : '') + '</h3>'
      + '<div class="dt" style="margin-bottom:.5rem">' + esc(c.courriel || '—')
      + (c.telephone ? ' · ' + esc(c.telephone) : '')
      + (c.contactVoulu ? ' · préfère ' + esc(c.contactVoulu === 'phone' ? 'le téléphone' : 'le courriel') : '')
      + ' · ouverte le ' + esc(c.ouverte) + '</div>';

    h += '<div class="fil" id="ch-fil">';
    if (!c.messages.length) {
      h += '<div class="vide">Aucun message.</div>';
    } else {
      h += c.messages.map(function(m){
        var cl = m.qui === 'agent' ? 'agent' : (m.qui === 'bot' || m.qui === 'ai') ? 'bot' : 'visiteur';
        return '<div class="bulle ' + cl + '">' + esc(m.texte)
          + '<span class="qd">' + (cl === 'agent' ? 'vous' : cl === 'bot' ? 'assistant' : esc(c.nom))
          + (m.heure ? ' · ' + esc(m.heure) : '') + '</span></div>';
      }).join('');
    }
    h += '</div>';

    if (D.peutModifier) {
      h += '<div style="margin-top:.6rem"><textarea id="ch-reponse" placeholder="Votre réponse…"></textarea></div>'
        + '<div class="pied-boite">'
        + '<button class="mini danger" id="ch-suppr">' + (SUPPR_ARME ? 'Confirmer ?' : 'Supprimer') + '</button>'
        + '<select id="ch-statut" style="max-width:11rem">'
        + '<option value="">Changer l’état…</option>'
        + '<option value="pending">En attente</option>'
        + '<option value="open">Ouverte</option>'
        + '<option value="closed">Fermée</option></select>'
        + '<button class="mini" id="ch-fermer-b">Fermer</button>'
        + '<button class="mini prim" id="ch-envoyer">Envoyer la réponse</button>'
        + '</div>';
    } else {
      h += '<div class="pied-boite"><button class="mini" id="ch-fermer-b">Fermer</button></div>';
    }
    h += '</div></div>';
    return h;
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    if (sous) {
      sous.innerHTML = D.enAttente
        ? '<span class="pill att">' + D.enAttente + ' en attente</span>'
        : '<span class="pill bon">rien en attente</span>';
    }
    var h = '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'file' ? ' actif' : '') + '" data-onglet="file">Conversations</button>'
      + '<button class="mini' + (ONGLET === 'satisfaction' ? ' actif' : '') + '" data-onglet="satisfaction">Satisfaction</button>'
      + '<div class="droite"><span class="dt">Réglages du chat et de l’assistant : '
      + 'Configuration → Communications → Chat en ligne</span></div></div>';
    h += ONGLET === 'satisfaction' ? vueSatisfaction() : vueFile();
    if (DETAIL) h += boiteDetail();
    corps.innerHTML = h;
    brancher();
    // Le fil s ouvre sur le DERNIER message : c est celui qu on vient lire.
    var fil = document.getElementById('ch-fil');
    if (fil) fil.scrollTop = fil.scrollHeight;
  }

  function brancher(){
    var q = document.getElementById('ch-q');
    if (q) q.oninput = function(){ Q = q.value; redessinerSansPerdreLaSaisie(); };

    var bf = document.getElementById('ch-fermer-b');
    if (bf) bf.onclick = function(){ DETAIL = null; SUPPR_ARME = false; dessiner(); };
    var vo = document.getElementById('ch-voile');
    if (vo) vo.onclick = function(ev){ if (ev.target === vo) { DETAIL = null; SUPPR_ARME = false; dessiner(); } };

    var be = document.getElementById('ch-envoyer');
    if (be) be.onclick = function(){
      var ta = document.getElementById('ch-reponse');
      be.disabled = true;
      appeler('chat:repondre', [DETAIL && DETAIL.id, ta ? ta.value : '']).then(function(r){
        be.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Réponse envoyée à ' + (r.nom || '') + '.', 'bon');
        rouvrir(DETAIL.id);
      });
    };

    var st = document.getElementById('ch-statut');
    if (st) st.onchange = function(){
      if (!st.value) return;
      var v = st.value;
      st.disabled = true;
      appeler('chat:statut', [DETAIL && DETAIL.id, v]).then(function(r){
        st.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Conversation de ' + (r.nom || '') + ' marquée « ' + v + ' ».', 'bon');
        rouvrir(DETAIL.id);
      });
    };

    var bs = document.getElementById('ch-suppr');
    if (bs) bs.onclick = function(){
      /* Deux clics : une conversation supprimee emporte tout l echange, et
         c est parfois la seule trace de ce qu on a promis a quelqu un. */
      if (!SUPPR_ARME) {
        SUPPR_ARME = true;
        dessiner();
        dire('Cliquez « Confirmer ? » pour supprimer — tout l’échange sera perdu.', 'att');
        return;
      }
      SUPPR_ARME = false;
      appeler('chat:supprimer', [DETAIL && DETAIL.id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        DETAIL = null;
        dire('Conversation de ' + (r.nom || '') + ' supprimée.', 'bon');
        charger();
      });
    };
  }

  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('ch-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('ch-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  function rouvrir(id){
    appeler('chat:lire', [id]).then(function(r){
      if (r.ok) DETAIL = r.conversation;
      charger();
    });
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest || t.closest('.boite')) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); dessiner(); return; }
    var bf = t.closest('[data-filtre]');
    if (bf) { FILTRE = bf.getAttribute('data-filtre'); dessiner(); return; }
    var li = t.closest('.ligne[data-id]');
    if (li) {
      appeler('chat:lire', [li.getAttribute('data-id')]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        DETAIL = r.conversation; SUPPR_ARME = false; dessiner();
      });
    }
  });

  function charger(){
    appeler('chat:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Chat indisponible', expliquer(r)); return; }
      D = r;
      dessiner();
    });
  }

  window.szActualiser = function(){
    var q = document.getElementById('ch-q');
    if (q && document.activeElement === q && q.value) return;
    var ta = document.getElementById('ch-reponse');
    if (ta && ta.value.trim()) return;   // jamais sous une réponse en cours
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
      if (DETAIL) { DETAIL = null; SUPPR_ARME = false; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageChat };
