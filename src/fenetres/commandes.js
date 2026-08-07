'use strict';

/*
 * FENÊTRE « COMMANDES » ET « EXPÉDITIONS » — NATIVE
 * =============================================================================
 * ⚠ UN SEUL FICHIER POUR LES DEUX LISTES, ET C'EST DÉLIBÉRÉ. Ce sont les mêmes
 * lignes, filtrées autrement : « Commandes » montre ce qui est en cours,
 * « Expéditions » ce qui est parti. En faire deux fenêtres jumelles, c'est la
 * garantie qu'elles divergeront — le menu détaché l'a déjà vécu : sa feuille
 * avait été recopiée, et un mois plus tard les deux menus, censés être le même,
 * ne se ressemblaient plus.
 *
 * ⚠ ELLE N'ÉCRIT RIEN. C'est une liste : on y cherche, on y filtre, et l'on
 * ouvre la fenêtre qui, elle, travaille — Préparation ou Expédition, toutes deux
 * natives. Y ajouter un jour une action d'écriture obligerait à reprendre le
 * verrou, qui appartient aux fenêtres de travail.
 *
 * ⚠ LA PAGE SEULE VOYAGE. Le tri, le filtre et la pagination se font dans le
 * site ; le pont ne porte que les vingt lignes affichées. Tout envoyer pour en
 * montrer vingt ferait passer plusieurs mégaoctets à chaque frappe.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, et un accent grave égaré
 * referme la chaîne. Huit fois sur ce projet, dont une en emportant la barre de
 * menu entière.
 */

const { JS_ACTIVITE } = require('./socle.js');

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
.tete .ic{font-size:1.05rem}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}

/* ⚠ LE CORPS NE DEFILE PAS : seule la LISTE le fait, et elle est paginee pour
   que ce soit rare. La barre de recherche et les filtres restent en vue. */
.corps{flex:1 1 auto;min-height:0;padding:.75rem 1.05rem;overflow:hidden;
  display:flex;flex-direction:column;gap:.55rem}

.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem;flex:0 0 auto}
.carte.plein{flex:1 1 auto;display:flex;flex-direction:column;min-height:0}

input,select{font:inherit;color:#e8edf5;background:#0f1826;
  border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:.32rem .5rem;
  width:100%;min-width:0}
input:focus,select:focus{outline:none;border-color:#c9a97e}
#rech{font-size:1rem;padding:.45rem .6rem}

button{font:inherit;cursor:pointer;border-radius:8px;padding:.3rem .7rem;
  border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);
  color:#e8edf5;transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
button.mini{padding:.1rem .45rem;font-size:.75rem}
/* En traitement : AMBRE et pleine opacite, comme le bouton verrouille du site —
   griser par transparence le rendait presque invisible sur fond sombre alors
   qu il porte une information importante. */
button.traite{background:#78350f;color:#fde68a;border-color:#b45309;
  cursor:not-allowed;opacity:1}

.filtres{display:flex;gap:.45rem;align-items:center;flex-wrap:wrap;margin-top:.45rem}
.filtres .lbl{font-size:.72rem;color:#8fa1b8}
.filtres select{width:auto}
.jetons{display:flex;gap:.28rem;flex-wrap:wrap}
.jetons button{font-size:.74rem;padding:.1rem .5rem;border-radius:99px}
.jetons button.on{background:rgba(201,169,126,.18);border-color:#c9a97e;color:#e8dcc6}

/* La liste : la seule zone qui defile. */
.liste{flex:1 1 auto;min-height:0;overflow-y:auto}
.liste::-webkit-scrollbar{width:8px}
.liste::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
table{width:100%;border-collapse:collapse;font-size:.85rem}
thead th{position:sticky;top:0;background:#1b2635;text-align:left;
  padding:.34rem .5rem;font-size:.7rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700}
thead th.d{text-align:right}
tbody td{padding:.3rem .5rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody td.d{text-align:right;white-space:nowrap}
tbody td.c{text-align:center;white-space:nowrap}
tbody tr:hover{background:rgba(255,255,255,.04)}
tbody .num{font-family:ui-monospace,monospace;font-size:.78rem;color:#c9a97e}
tbody .det{font-size:.75rem;color:#8fa1b8}
/* Une commande ETIQUETEE mais pas encore expediee : c est exactement celle qu on
   cherche en reprenant le travail. Elle se repere sans lire. */
tbody tr.attente{background:rgba(124,92,255,.09)}
.et{font-size:.68rem;padding:.06rem .45rem;border-radius:99px;white-space:nowrap;
  border:1px solid rgba(255,255,255,.16);color:#8fa1b8}
.et.vert{border-color:rgba(74,222,128,.45);color:#4ade80}
.et.bleu{border-color:rgba(96,165,250,.5);color:#93c5fd}
.et.jaune{border-color:rgba(245,158,11,.5);color:#f0c987}
.et.rouge{border-color:rgba(248,113,113,.5);color:#f6a5a5}

.pagi{flex:0 0 auto;display:flex;align-items:center;gap:.5rem;padding-top:.45rem;
  margin-top:.35rem;border-top:1px solid rgba(255,255,255,.07);
  font-size:.78rem;color:#8fa1b8;flex-wrap:wrap}
.pagi .pos{margin-left:auto}
.pagi select{width:auto;padding:.14rem .35rem;font-size:.76rem}

.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);
  background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
.actions{flex:0 0 auto;display:flex;gap:.4rem}
.vide{padding:1.6rem 1rem;text-align:center;color:#8fa1b8;font-size:.86rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète. `mode` vaut 'commandes' (en cours) ou 'expeditions' (parties).
 */
function pageCommandes(mode) {
  const m = (String(mode || '') === 'expeditions') ? 'expeditions' : 'commandes';
  const depart = JSON.stringify(m);
  const titre = (m === 'expeditions') ? 'Expéditions' : 'Commandes';
  const icone = (m === 'expeditions') ? '🚚' : '🛒';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>${titre} — Administration Sandriza</title>
<style>${CSS}</style></head><body>
<div class="tete"><span class="ic">${icone}</span><h1 id="titre">${titre}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions" id="actions"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var actions = document.getElementById('actions');
  var sous = document.getElementById('sous');

  var MODE = ${depart};
  var CTX = null;
  var DONNEES = null;                       // derniere page recue
  // ⚠ L ETAT DU FILTRE VIT ICI, HORS DE LA LISTE : elle est redessinee a chaque
  // frappe, et lire les champs au moment de paginer ne rendrait que l affichage.
  var F = { q: '', statuts: [], annee: 'all', page: 0, parPage: 20 };
  var enCours = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ msg.className = 'msg' + (cl ? ' ' + cl : ''); msg.textContent = t || ''; }
  function argent(n){
    var v = (Math.round((parseFloat(n) || 0) * 100) / 100).toFixed(2);
    return v.replace('.', ',') + ' $';
  }
  function dateCourte(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('fr-CA', { day: '2-digit', month: 'short', year: '2-digit' });
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux commandes.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    version_coquille:   'Cette version de l’application ne sait pas ouvrir cette fenêtre — quittez et relancez pour la mettre à jour.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    if (r && r.detail) return r.detail;
    return MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
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
    corps.innerHTML = '<div class="carte plein"><div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div></div>';
    actions.innerHTML = '<button id="btn-fermer">Fermer</button>';
    brancherFermer();
  }

  function libelleStatut(cle){
    var l = (CTX && CTX.statuts) || [];
    for (var i = 0; i < l.length; i++) if (l[i].cle === cle) return l[i].libelle;
    return cle || '—';
  }
  function couleurStatut(cle){
    if (cle === 'delivered') return 'vert';
    if (cle === 'shipped') return 'bleu';
    if (cle === 'cancelled') return 'rouge';
    if (cle === 'pending' || cle === 'preparing') return 'jaune';
    return '';
  }

  // ══ DESSIN ════════════════════════════════════════════════════════════════
  function dessiner(){
    var d = DONNEES;
    var expedition = MODE === 'expeditions';

    var h = '<div class="carte">'
      + '<input id="rech" autocomplete="off" placeholder="Numéro de commande, nom, courriel'
      + (expedition ? ', numéro de suivi' : '') + '…" value="' + esc(F.q) + '">'
      + '<div class="filtres"><span class="lbl">Statut :</span><span class="jetons">'
      + ((CTX && CTX.statuts) || []).filter(function(s){
          // Chaque liste ne propose que SES statuts : offrir << Livrée >> dans
          // Commandes donnerait toujours zero resultat, et l on chercherait pourquoi.
          return expedition ? (s.cle === 'shipped' || s.cle === 'delivered')
                            : (s.cle !== 'shipped' && s.cle !== 'delivered');
        }).map(function(s){
          return '<button class="mini' + (F.statuts.indexOf(s.cle) >= 0 ? ' on' : '')
            + '" data-st="' + esc(s.cle) + '">' + esc(s.libelle) + '</button>'; }).join('')
      + (F.statuts.length ? '<button class="mini" data-vider="1">Tout afficher</button>' : '')
      + '</span>';
    if (expedition && CTX && (CTX.annees || []).length) {
      h += '<span class="lbl" style="margin-left:.4rem">Année :</span><select id="f-annee">'
        + '<option value="all"' + (F.annee === 'all' ? ' selected' : '') + '>Toutes</option>'
        + CTX.annees.map(function(a){
            return '<option value="' + a + '"' + (String(F.annee) === String(a) ? ' selected' : '')
              + '>' + a + '</option>'; }).join('')
        + '</select>';
    }
    h += '</div></div>';

    h += '<div class="carte plein">';
    if (!d || !d.lignes.length) {
      h += '<div class="vide">' + (F.q || F.statuts.length || F.annee !== 'all'
        ? 'Aucune commande ne correspond à ces filtres.'
        : (expedition ? 'Aucune commande expédiée.' : 'Aucune commande en cours.')) + '</div>';
    } else {
      h += '<div class="liste"><table><thead><tr>'
        + '<th>Commande</th><th>Client</th><th class="c">Date</th>'
        + (expedition ? '<th>Suivi</th>' : '<th class="c">Articles</th>')
        + '<th class="d">Total</th><th class="c">Statut</th><th class="c"></th>'
        + '</tr></thead><tbody>';
      d.lignes.forEach(function(o){
        // ⚠ Etiquetee mais pas partie : la ligne se teinte. C est l etat qui se
        // perd le plus facilement, entre l impression et le depot au comptoir.
        var attente = o.aUneEtiquette && o.statut !== 'shipped' && o.statut !== 'delivered';
        h += '<tr class="' + (attente ? 'attente' : '') + '">'
          + '<td><span class="num">' + esc(o.numero) + '</span>'
          + (attente ? '<div class="det">étiquette prête</div>' : '') + '</td>'
          + '<td>' + esc(o.client) + (o.ville ? '<div class="det">' + esc(o.ville) + '</div>' : '') + '</td>'
          + '<td class="c det">' + esc(dateCourte(o.date)) + '</td>'
          + (expedition
              ? '<td>' + (o.suivi ? '<span class="num">' + esc(o.suivi) + '</span>'
                                  : '<span class="det">sans numéro</span>') + '</td>'
              : '<td class="c">' + o.articles + '</td>')
          + '<td class="d">' + argent(o.total) + '</td>'
          + '<td class="c"><span class="et ' + couleurStatut(o.statut) + '">'
          + esc(libelleStatut(o.statut)) + '</span></td>'
          /* ⚠ UN SEUL BOUTON, DEUX ETATS (demande le 2026-08-07 : << il y a trop
             de boutons differents a ce niveau >>). Verrou tenu par QUICONQUE —
             soi compris, sa propre fenetre de preparation ouverte est un
             traitement en cours — la ligne dit 🔒 En traitement, et par qui.
             Libre : 🚀 Preparer, qui ouvre l assistant (lequel se place tout
             seul a la bonne etape depuis la 1.28.0, et fabrique l etiquette a
             son etape 2 : plus besoin d un bouton Expedier separe ici).
             Et AUCUN bouton sur une commande expediee ou livree — la vue
             Expeditions n en porte donc pas. */
          + '<td class="c">'
          + (expedition || o.statut === 'shipped' || o.statut === 'delivered' ? ''
             : (o.enTraitement
                ? '<button class="mini traite" disabled>🔒 En traitement' + (o.par ? ' — ' + esc(o.par) : '') + '</button>'
                : (CTX.peutEditer
                   ? '<button class="mini" data-prep="' + esc(o.id) + '">🚀 Préparer</button>' : '')))
          + '</td></tr>';
      });
      h += '</tbody></table></div>';

      h += '<div class="pagi"><span>Afficher</span><select id="pg-taille">'
        + [10, 20, 50, 100].map(function(n){
            return '<option value="' + n + '"' + (F.parPage === n ? ' selected' : '') + '>' + n + '</option>';
          }).join('')
        + '</select><span>par page</span>'
        + '<span class="pos">'
        + '<button class="mini" id="pg-prec"' + (d.page <= 0 ? ' disabled' : '') + '>← Préc.</button>'
        + ' ' + (d.page * d.parPage + 1) + '–' + Math.min((d.page + 1) * d.parPage, d.total)
        + ' sur ' + d.total + ' '
        + '<button class="mini" id="pg-suiv"' + (d.page >= d.pages - 1 ? ' disabled' : '') + '>Suiv. →</button>'
        + '</span></div>';
    }
    h += '</div>';
    corps.innerHTML = h;

    actions.innerHTML = '<button id="btn-rafraichir">⟳ Rafraîchir</button>'
      + '<button id="btn-fermer">Fermer</button>';
    brancher();
  }

  // ══ ECOUTEURS ═════════════════════════════════════════════════════════════
  function brancherFermer(){
    var f = document.getElementById('btn-fermer');
    if (f) f.onclick = function(){ P.fermer(); };
  }

  var rechT = null;
  function brancher(){
    brancherFermer();
    var r = document.getElementById('btn-rafraichir');
    if (r) r.onclick = function(){ charger(); };

    var champ = document.getElementById('rech');
    if (champ) {
      champ.oninput = function(){
        F.q = this.value; F.page = 0;
        clearTimeout(rechT);
        rechT = setTimeout(charger, 230);
      };
      // ⚠ ON RETABLIT LE CURSEUR APRES REDESSIN : sans cela, taper un nom fait
      // sauter le curseur au debut a chaque lettre, et l on ecrit a l envers.
      if (document.activeElement !== champ && F.q) { /* laisse le focus ou il est */ }
    }
    var an = document.getElementById('f-annee');
    if (an) an.onchange = function(){ F.annee = this.value; F.page = 0; charger(); };
    var pt = document.getElementById('pg-taille');
    if (pt) pt.onchange = function(){ F.parPage = parseInt(this.value, 10) || 20; F.page = 0; charger(); };
    var pp = document.getElementById('pg-prec');
    if (pp) pp.onclick = function(){ F.page--; charger(); };
    var ps = document.getElementById('pg-suiv');
    if (ps) ps.onclick = function(){ F.page++; charger(); };

    // Ecouteur DELEGUE : la liste est redessinee a chaque frappe, un ecouteur
    // pose sur chaque bouton serait reperdu aussitot.
    corps.onclick = function(ev){
      var t = ev.target;
      if (!t || !t.closest) return;
      var st = t.closest('[data-st]');
      if (st) {
        var cle = st.getAttribute('data-st');
        var i = F.statuts.indexOf(cle);
        if (i >= 0) F.statuts.splice(i, 1); else F.statuts.push(cle);
        F.page = 0; charger();
        return;
      }
      if (t.closest('[data-vider]')) { F.statuts = []; F.page = 0; charger(); return; }
      var pr = t.closest('[data-prep]');
      if (pr) {
        ouvrir('commandes:preparer', pr.getAttribute('data-prep'), 'Préparation');
        // La ligne passe << En traitement >> des que la fenetre a pris son
        // verrou : on recharge sans attendre le prochain battement.
        setTimeout(charger, 1200);
        return;
      }
    };
  }

  function ouvrir(op, id, quoi){
    dire('Ouverture…');
    appeler(op, [id]).then(function(r){
      dire(r.ok ? (quoi + ' ouverte dans sa fenêtre.') : expliquer(r), r.ok ? 'bon' : 'err');
    });
  }

  // ══ CHARGEMENT ════════════════════════════════════════════════════════════
  function charger(){
    if (enCours) return;
    enCours = true;
    appeler('commandes:liste', [MODE, F]).then(function(r){
      enCours = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      DONNEES = r;
      dire('');
      // On retient la position du curseur AVANT de redessiner : la barre de
      // recherche est reconstruite, et sans cela on taperait a l envers.
      var av = document.getElementById('rech');
      var focus = av && document.activeElement === av;
      var pos = focus ? av.selectionStart : null;
      dessiner();
      if (focus) {
        var neuf = document.getElementById('rech');
        if (neuf) { neuf.focus(); try { neuf.setSelectionRange(pos, pos); } catch (e) {} }
      }
    });
  }

  function demarrer(){
    appeler('commandes:contexte').then(function(c){
      if (!c || !c.ok) { vide('Commandes indisponibles', expliquer(c)); return; }
      CTX = c;
      sous.textContent = c.peutEditer ? '' : '👁 Lecture seule';
      charger();
    });
  }

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  setInterval(function(){
    if (enCours) return;
    var a = document.activeElement;
    if (a && (a.tagName === 'INPUT' || a.tagName === 'SELECT')) return;
    if (CTX && DONNEES) charger();
  }, 5000);

  demarrer();
})();
</script>
</body></html>`;
}

module.exports = { pageCommandes };
