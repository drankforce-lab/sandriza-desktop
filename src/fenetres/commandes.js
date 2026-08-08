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
 * ⚠ DEPUIS 1.37.0 ELLE PORTE AUSSI LE DÉTAIL D'UNE COMMANDE (clic sur la
 * ligne) avec les actions de la fiche du site : changement de statut (sélecteur
 * ET clic droit sur la ligne, avec la case « réautoriser les courriels » du
 * retour en arrière), remboursement (renvoi vers la fenêtre native), frais de
 * service retenus, suppression avec sa cascade complète, bon de commande et
 * facture. LE DÉTAIL PREND LE VERROU 'orders' à l'ouverture : chez les autres,
 * la fiche s'ouvre en LECTURE SEULE (statut, remboursement, destruction
 * désactivés) et la ligne dit « En traitement ». Tous les montants et toutes
 * les règles viennent du site (commandes:detail, _statutEcrire,
 * _commandeSupprimerEcrire, _fraisRetenusEcrire) — la fenêtre ne calcule RIEN.
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
/* Prioritaires : l ambre du site, et un compte qui dit le RESTE-A-FAIRE.
   ⚠ Regles AUTONOMES : le bouton vit HORS du groupe .jetons, une regle
   prefixee .jetons ne l atteignait jamais - le bouton ne s allumait pas
   (signale le 2026-08-07). */
button.prio{border-color:rgba(245,158,11,.55);color:#f0c987;border-radius:99px;
  font-size:.74rem;padding:.1rem .5rem;margin-left:.4rem}
button.prio.on{background:#f59e0b;border-color:#f59e0b;color:#1a1a2e;font-weight:700}
button.prio.on:hover{background:#fbbf24;border-color:#fbbf24}
.eclair{color:#f59e0b;margin-right:.2rem}

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

/* ── Le detail d une commande ── */
.det2{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-top:.55rem}
.bloc h3{margin:0 0 .25rem;font-size:.67rem;text-transform:uppercase;
  letter-spacing:.08em;color:#8fa1b8;font-weight:700}
.bloc .l{font-size:.85rem}
.bloc .mut{color:#8fa1b8;font-size:.8rem;line-height:1.5}
.badge2{display:inline-block;font-size:.62rem;padding:.04rem .45rem;border-radius:99px;
  margin-left:.4rem;vertical-align:1px;background:rgba(148,163,184,.18);color:#cbd8e6}
.badge2.or{background:#f59e0b;color:#1a1a2e;font-weight:700}
.badge2.vertf{background:#166534;color:#dcfce7;font-weight:700}
select.statut{width:auto;font-size:.78rem;padding:.16rem .4rem}
.totaux{display:flex;justify-content:flex-end;gap:2.2rem;font-size:.84rem;
  margin-top:.6rem;border-top:1px solid rgba(255,255,255,.08);padding-top:.55rem}
.totaux .d{text-align:right}
.totaux .tt{font-weight:700;margin-top:.2rem}
.remb{margin-top:.7rem;border-top:2px dashed rgba(245,158,11,.5);padding-top:.45rem}
.remb .t{font-size:.69rem;font-weight:700;text-transform:uppercase;
  letter-spacing:.06em;color:#fbbf24;margin-bottom:.25rem}
.remb .lg2{display:flex;justify-content:space-between;gap:1rem;font-size:.8rem;
  padding:.18rem 0;border-bottom:1px solid rgba(255,255,255,.05)}
.remb .fin3{text-align:right;font-size:.8rem;font-weight:700;color:#fbbf24;margin-top:.3rem}
.banniere{flex:0 0 auto;background:#7f1d1d;color:#fff;border-radius:9px;
  padding:.5rem .8rem;font-size:.82rem;line-height:1.5}
button.danger{border-color:rgba(239,68,68,.55);color:#f6a5a5}
button.danger:hover:not(:disabled){background:rgba(239,68,68,.15);border-color:#ef4444}

/* ── Menu contextuel (clic droit sur une ligne) ── */
.ctx{position:fixed;z-index:60;background:#16202f;border:1px solid rgba(255,255,255,.16);
  border-radius:10px;box-shadow:0 14px 34px rgba(0,0,0,.5);padding:.3rem;min-width:210px}
.ctx .t{font-size:.67rem;text-transform:uppercase;letter-spacing:.07em;
  color:#8fa1b8;padding:.28rem .5rem;font-weight:700}
.ctx button{display:block;width:100%;text-align:left;border:none;
  background:transparent;padding:.3rem .5rem;border-radius:6px;font-size:.83rem}
.ctx button:hover{background:rgba(255,255,255,.08)}
.ctx .warn{background:#7f1d1d;color:#fff;border-radius:6px;padding:.5rem .65rem;
  font-size:.79rem;line-height:1.5;max-width:290px;margin:.2rem}

/* Confirmations : un voile, jamais une boite du systeme (elle s ouvrirait
   DERRIERE la fenetre, comme le decompte d inactivite l a fait). */
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.5rem;z-index:50}
.voile .boite{background:#16202f;border:1px solid rgba(255,255,255,.12);
  border-radius:13px;padding:1.1rem 1.25rem;max-width:36rem;width:100%;
  max-height:84vh;overflow-y:auto}
.voile h3{margin:0 0 .55rem;font:700 1.05rem/1.25 Georgia,serif}
.voile p{margin:.35rem 0;font-size:.86rem;line-height:1.5}
.voile ul{font-size:.83rem;color:#cbd8e6;line-height:1.7;margin:.5rem 0 0;padding-left:1.1rem}
.voile li.item{list-style:none;background:rgba(255,255,255,.05);border-radius:6px;
  padding:.3rem .6rem;margin:.25rem 0}
.voile label.rc{display:flex;align-items:flex-start;gap:.5rem;margin-top:.9rem;
  font-size:.82rem;line-height:1.5;cursor:pointer;background:rgba(245,158,11,.1);
  border:1px solid rgba(245,158,11,.4);border-radius:8px;padding:.5rem .65rem}
.voile label.rc input{width:auto;margin-top:2px}
.voile .fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.9rem}

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
  const brut = String(mode || '');
  const idDetail = brut.indexOf('@') > 0 ? brut.slice(brut.indexOf('@') + 1) : '';
  const mBase = brut.indexOf('@') > 0 ? brut.slice(0, brut.indexOf('@')) : brut;
  const m = (mBase === 'expeditions') ? 'expeditions' : 'commandes';
  const depart = JSON.stringify(m + (idDetail ? '@' + idDetail : ''));
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
  // << mode@identifiant >> : la fenetre s ouvre directement sur ce detail.
  var DET_DEPART = '';
  if (MODE.indexOf('@') > 0) { DET_DEPART = MODE.slice(MODE.indexOf('@') + 1); MODE = MODE.slice(0, MODE.indexOf('@')); }
  var CTX = null;
  var DONNEES = null;                       // derniere page recue
  // ⚠ L ETAT DU FILTRE VIT ICI, HORS DE LA LISTE : elle est redessinee a chaque
  // frappe, et lire les champs au moment de paginer ne rendrait que l affichage.
  // Auto par defaut : autant de lignes que la hauteur reelle, jamais de glissiere.
  var F = { q: '', statuts: [], annee: 'all', prioritaires: false, page: 0, parPage: 20, auto: true };
  var enCours = false;
  var VUE = 'liste';        // 'liste' | 'detail'
  // Ouverte par << mode@identifiant >>, la fenetre EST un detail : pas de
  // << Liste >>, et fermer le detail ferme la fenetre (demande le 2026-08-07 :
  // le detail s ouvre dans une fenetre native separee).
  var SEUL = !!DET_DEPART;
  var DET = null, DET_ID = '';
  var VERROU_PRIS = false;  // le detail tient le verrou 'orders'
  var VERROU_PAR = '';      // tenu par quelqu un d autre -> lecture seule

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var direT = null;
  function dire(t, cl){
    clearTimeout(direT);
    msg.className = 'msg' + (cl ? ' ' + cl : '');
    msg.textContent = t || '';
    if (cl === 'bon' && t) {
      direT = setTimeout(function(){
        if (msg.textContent === t) { msg.textContent = ''; msg.className = 'msg'; }
      }, 6000);
    }
  }
  function argent(n){
    var v = (Math.round((parseFloat(n) || 0) * 100) / 100).toFixed(2);
    return v.replace('.', ',') + ' $';
  }
  function dateCourte(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux commandes.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    version_coquille:   'Cette version de l’application ne sait pas ouvrir cette fenêtre — quittez et relancez pour la mettre à jour.',
    introuvable:        'Cette commande n’existe plus.',
    sans_facture:       'Aucune facture liée à cette commande.',
    sans_paiement:      'Aucun paiement Square associé à cette commande.',
    rien_a_rembourser:  'Aucun frais retenu restant à rembourser.',
    serveur:            'Suppression non confirmée par le serveur — réessayez.',
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
    if (VUE === 'detail') { dessinerDetail(); return; }
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
      + '</span>'
      + '<button class="mini prio' + (F.prioritaires ? ' on' : '') + '" data-prio="1" '
      + 'title="N’afficher que les commandes prioritaires — le compte est celui des prioritaires pas encore expédiées">'
      + '⚡ Prioritaires' + (d && d.prioritairesNonTraitees
          ? ' · ' + d.prioritairesNonTraitees + ' non traitée' + (d.prioritairesNonTraitees > 1 ? 's' : '')
          : '') + '</button>';
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
      h += '<div class="vide">' + (F.q || F.statuts.length || F.annee !== 'all' || F.prioritaires
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
        h += '<tr class="' + (attente ? 'attente' : '') + '" data-id="' + esc(o.id)
          + '" style="cursor:pointer" title="Clic : détails · clic droit : changer le statut">'
          + '<td>' + (o.prioritaire ? '<span class="eclair" title="Traitement prioritaire">⚡</span>' : '')
          + '<span class="num">' + esc(o.numero) + '</span>'
          + (attente ? '<div class="det">étiquette prête</div>' : '') + '</td>'
          + '<td>' + esc(o.client) + '</td>'
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
        + '<option value="auto"' + (F.auto ? ' selected' : '') + '>Auto</option>'
        + [10, 20, 50, 100].map(function(n){
            return '<option value="' + n + '"' + (!F.auto && F.parPage === n ? ' selected' : '') + '>' + n + '</option>';
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
    listeAutoAjuste();
  }

  /* ── PAGINATION AUTO : autant de lignes que la hauteur REELLE le permet —
     mesuree, jamais devinee. Stable : on ne recharge que si le compte differe. */
  var autoT = null;
  function listeAutoAjuste(){
    if (!F.auto || VUE !== 'liste') return;
    var g = corps.querySelector('.liste');
    if (!g) return;
    var th = g.querySelector('thead');
    var tr = g.querySelector('tbody tr');
    var hL = tr ? tr.offsetHeight : 0;
    if (!(hL > 0)) hL = 36;
    var dispo = g.clientHeight - ((th && th.offsetHeight) || 30);
    if (!(dispo > 0)) return; // le banc mesure NaN : on ne touche a rien
    var n = Math.max(5, Math.floor(dispo / hL));
    if (isFinite(n) && n !== F.parPage) { F.parPage = n; F.page = 0; charger(); }
  }
  window.addEventListener('resize', function(){
    clearTimeout(autoT);
    autoT = setTimeout(listeAutoAjuste, 180);
  });

  // ══ DETAIL D UNE COMMANDE ═══════════════════════════════════════
  function dessinerDetail(){
    var d = DET;
    if (!d) {
      corps.innerHTML = '<div class="carte plein"><div class="vide">Chargement…</div></div>';
      actions.innerHTML = SEUL ? '' : '<button id="btn-retour">← Liste</button>';
      brancherDetail();
      return;
    }
    var c = d.commande;
    var ro = !!VERROU_PAR; // tenue par quelqu un d autre -> LECTURE SEULE
    var h = '';
    if (ro) {
      h += '<div class="banniere">🔒 En traitement par <strong>' + esc(VERROU_PAR)
        + '</strong> — changement de statut, remboursement et suppression désactivés '
        + 'le temps que cette personne termine.</div>';
    }
    h += '<div class="carte">'
      + '<div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">'
      + '<strong style="font-size:1rem">Commande <span class="num">' + esc(c.numero) + '</span></strong>';
    if (d.droits.statut && !ro) {
      // ⚠ MEME REGLE QUE LA FICHE DU SITE : ni << En attente >> ni << Annulee >>
      // dans le selecteur, sauf si c est deja le statut courant.
      h += '<select class="statut" id="det-statut">'
        + (d.statuts || []).filter(function(x){
            return ['pending', 'cancelled'].indexOf(x.cle) < 0 || x.cle === c.statut;
          }).map(function(x){
            return '<option value="' + esc(x.cle) + '"' + (x.cle === c.statut ? ' selected' : '')
              + '>' + esc(x.libelle) + '</option>'; }).join('')
        + '</select>';
    } else {
      h += '<span class="et ' + couleurStatut(c.statut) + '">' + esc(libelleStatut(c.statut)) + '</span>';
    }
    h += (c.prioritaire ? '<span class="badge2 or">⚡ Prioritaire</span>' : '')
      + (d.remboursements.complet ? '<span class="badge2 vertf">✅ Remboursée</span>'
          : (d.remboursements.lignes.length
              ? '<span class="badge2 or">↩ ' + d.remboursements.lignes.length + ' remb.</span>' : ''))
      + '<span style="margin-left:auto" class="mut">' + esc(dateCourte(c.creeLe)) + '</span>'
      + '</div>';
    h += '<div class="det2">'
      + '<div class="bloc"><h3>Client</h3>'
      + '<div class="l"><strong>' + esc(c.client.nom || '—') + '</strong>'
      + '<span class="badge2">' + (c.membre ? 'membre' : 'invité') + '</span></div>'
      + (c.client.entreprise ? '<div class="l">' + esc(c.client.entreprise) + '</div>' : '')
      + '<div class="mut">' + esc(c.client.courriel) + (c.client.tel ? '<br>' + esc(c.client.tel) : '') + '</div>'
      + '<div class="mut" style="margin-top:.4rem">💳 '
      + (c.paiementSquare ? '<span class="num">' + esc(c.paiementSquare) + '</span>'
                          : '<span style="color:#fbbf24">Commande démo — aucun paiement Square</span>')
      + (c.afterpay ? '<span class="badge2">AFTERPAY</span>' : '') + '</div></div>'
      + '<div class="bloc"><h3>Livraison</h3>'
      + '<div class="mut">' + esc(c.adresse.rue) + '<br>'
      + esc(c.adresse.ville) + (c.adresse.province ? ', ' + esc(c.adresse.province) : '')
      + ' ' + esc(c.adresse.cp) + '</div>'
      + (c.livreLe ? '<div class="mut" style="margin-top:.3rem">✅ Livrée le ' + esc(dateCourte(c.livreLe)) + '</div>' : '')
      + (c.suivi ? '<div class="mut" style="margin-top:.3rem">📡 <span class="num">' + esc(c.suivi) + '</span>'
          + (c.suiviStatut ? ' — ' + esc(c.suiviStatut)
            + (c.suiviVerifieLe ? ' (vérifié le ' + esc(dateCourte(c.suiviVerifieLe)) + ')' : '') : '') + '</div>' : '')
      + '</div></div></div>';

    h += '<div class="carte plein"><div class="liste">'
      + '<table><thead><tr><th>Article</th><th class="c">Taille / Couleur</th>'
      + '<th class="c">Qté</th><th class="d">Prix</th></tr></thead><tbody>'
      + d.articles.map(function(a){
          return '<tr><td>' + esc(a.nom)
            + (a.rembourseQte > 0 ? ' <span style="font-size:.7rem;color:#fbbf24">(' + a.rembourseQte + ' remb.)</span>' : '')
            + '</td><td class="c det">' + esc(a.taille) + ' / ' + esc(a.couleur) + '</td>'
            + '<td class="c">' + a.qte + '</td>'
            + '<td class="d">' + argent(a.montant) + '</td></tr>'; }).join('')
      + '</tbody></table>';

    var t = d.totaux;
    h += '<div class="totaux"><div>'
      + '<div>Sous-total</div>'
      + t.taxes.map(function(x){ return '<div>' + esc(x.nom) + ' (' + (Math.round(x.taux * 1000000) / 10000) + ' %)</div>'; }).join('')
      + (t.livraison > 0 ? '<div>Livraison</div>' : '')
      + (t.prioritaire > 0 ? '<div>⚡ Traitement prioritaire</div>' : '')
      + (t.coupon > 0 ? '<div style="color:#4ade80">Coupon</div>' : '')
      + '<div class="tt">Total</div></div>'
      + '<div class="d"><div>' + argent(t.sousTotal) + '</div>'
      + t.taxes.map(function(x){ return '<div>' + argent(x.montant) + '</div>'; }).join('')
      + (t.livraison > 0 ? '<div>' + argent(t.livraison) + '</div>' : '')
      + (t.prioritaire > 0 ? '<div>' + argent(t.prioritaire) + '</div>' : '')
      + (t.coupon > 0 ? '<div style="color:#4ade80">−' + argent(t.coupon) + '</div>' : '')
      + '<div class="tt">' + argent(t.total) + '</div></div></div>';

    var rb = d.remboursements;
    if (rb.lignes.length) {
      h += '<div class="remb"><div class="t">↩ Remboursements émis</div>'
        + rb.lignes.map(function(r){
            return '<div class="lg2"><span><strong>' + esc(r.numero) + '</strong> · '
              + esc(dateCourte(r.date)) + ' · <em>' + esc(r.type) + '</em>'
              + (r.fraisRetenus > 0 ? ' <span style="color:#f59e0b;font-size:.72rem">(frais retenus : ' + argent(r.fraisRetenus) + ')</span>' : '')
              + '</span><span style="font-weight:700;color:#fbbf24">−' + argent(r.montant) + '</span></div>'; }).join('');
      if (rb.fraisRetenus > 0) {
        h += '<div class="fin3" style="color:#f0c987;font-weight:400">Frais de service retenus : <strong>'
          + argent(rb.fraisRetenus) + '</strong> '
          + (rb.fraisRestants < 0.01 ? '<span class="badge2 vertf">✅ Remboursés au client</span>'
             : rb.fraisRembourses > 0
               ? '<span class="badge2 or">⚠ Partiel — remb. ' + argent(rb.fraisRembourses) + ' · reste ' + argent(rb.fraisRestants) + '</span>'
               : '<span class="badge2 or">⏳ Non remboursés</span>') + '</div>';
      }
      h += '<div class="fin3">Total remboursé : −' + argent(rb.total)
        + (rb.complet ? ' <span class="badge2 vertf">✅ Entièrement remboursée</span>' : '') + '</div></div>';
    }
    if (c.notes) h += '<div class="mut" style="margin-top:.6rem"><strong>Notes :</strong> ' + esc(c.notes) + '</div>';
    h += '</div></div>';
    corps.innerHTML = h;

    actions.innerHTML = (SEUL ? '' : '<button id="btn-retour">← Liste</button>')
      + (d.droits.bon && !ro ? '<button id="det-bon">🖨 Bon de commande</button>' : '')
      + (c.aFacture ? '<button id="det-fact">🧾 Facture</button>' : '')
      + (d.droits.frais && !ro ? '<button id="det-frais">💰 Frais retenus (' + argent(rb.fraisRestants) + ')</button>' : '')
      + (d.droits.rembourser && !ro ? '<button id="det-remb">↩ Rembourser</button>' : '')
      + (d.droits.supprimer && !ro ? '<button class="danger" id="det-suppr">🗑 Supprimer</button>' : '');
    brancherDetail();
  }

  function brancherDetail(){
    var r = document.getElementById('btn-retour');
    if (r) r.onclick = retourListe;
    var st = document.getElementById('det-statut');
    if (st) st.onchange = function(){
      var cible = this.value;
      var courant = DET.commande.statut;
      this.value = courant; // le selecteur ne bouge qu apres la CONFIRMATION
      flowStatut(DET_ID, courant, cible, rechargerDetail);
    };
    var b = document.getElementById('det-bon');
    if (b) b.onclick = function(){
      this.disabled = true;
      var moi = this;
      dire('Impression…');
      appeler('commande:bon', [DET_ID]).then(function(z){
        moi.disabled = false;
        dire(z.ok ? 'Bon de commande envoyé à l’impression.' : expliquer(z), z.ok ? 'bon' : 'err');
      });
    };
    var f = document.getElementById('det-fact');
    if (f) f.onclick = function(){
      appeler('commandes:facture', [DET_ID]).then(function(z){
        dire(z.ok ? (z.web ? 'Facture ouverte dans la fenêtre principale.' : 'Facture ouverte dans sa fenêtre.') : expliquer(z), z.ok ? 'bon' : 'err');
      });
    };
    var fr = document.getElementById('det-frais');
    if (fr) fr.onclick = flowFrais;
    var rb = document.getElementById('det-remb');
    if (rb) rb.onclick = function(){
      // La fenetre Remboursement prend SON verrou sur la meme commande : on rend
      // le notre d abord, sinon elle se croirait ouverte par quelqu un d autre.
      rendreVerrou();
      appeler('commandes:rembourser', [DET_ID]).then(function(z){
        dire(z.ok ? 'Remboursement ouvert dans sa fenêtre.' : expliquer(z), z.ok ? 'bon' : 'err');
        if (z.ok) retourListe();
        else prendreVerrou(DET_ID); // refus d ouverture : on reprend la fiche
      });
    };
    var sp = document.getElementById('det-suppr');
    if (sp) sp.onclick = flowSupprimer;
    corps.onclick = null;
    corps.oncontextmenu = null;
  }

  function ouvrirDetail(id){
    DET_ID = id; DET = null; VUE = 'detail';
    dire('');
    dessiner();
    appeler('commandes:detail', [id]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); retourListe(); return; }
      DET = r;
      if (SEUL) {
        document.getElementById('titre').textContent = 'Commande ' + (r.commande.numero || '');
        document.title = 'Commande ' + (r.commande.numero || '') + ' — Administration Sandriza';
      }
      dessiner();
      prendreVerrou(id);
    });
  }

  function rechargerDetail(){
    if (VUE !== 'detail' || !DET_ID) return;
    appeler('commandes:detail', [DET_ID]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); retourListe(); return; }
      DET = r;
      dessiner();
    });
  }

  // ⚠ A L OUVERTURE DU DETAIL, comme les fenetres de travail : chez les autres
  // la ligne passe << En traitement >> et LEUR detail s ouvre en lecture seule.
  function prendreVerrou(id){
    appeler('verrou:prendre', ['orders', id]).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      if (v.obtenu) {
        VERROU_PRIS = true; VERROU_PAR = '';
        sous.textContent = v.horsLigne ? '🔓 hors ligne'
          : '🔒 Section verrouillée en modification par : ' + (v.par || 'vous');
      } else {
        VERROU_PRIS = false; VERROU_PAR = v.parQui || 'quelqu’un d’autre';
        sous.textContent = '⚠ en traitement par ' + VERROU_PAR;
      }
      if (VUE === 'detail') dessiner();
    });
  }
  function rendreVerrou(){
    if (!VERROU_PRIS) return;
    VERROU_PRIS = false;
    appeler('verrou:rendre');
  }
  function retourListe(){
    rendreVerrou();
    if (SEUL) { P.fermer(); return; }
    VERROU_PAR = ''; DET = null; DET_ID = '';
    VUE = 'liste';
    sous.textContent = (CTX && CTX.peutEditer) ? '' : '👁 Lecture seule';
    charger(true);
  }

  // Rouvrir la meme commande ramene cette fenetre : elle RELIT la fiche.
  window.szRevenir = function(){
    if (VUE === 'detail' && DET_ID) rechargerDetail();
  };

  // ══ CHANGEMENT DE STATUT (selecteur du detail ET clic droit de la liste) ══
  // L apercu vient du site (implications, case courriels) ; << En livraison >>
  // n ecrit rien ici : il ouvre le flux d expedition, comme la fiche du site.
  function flowStatut(id, de, a, apresOK){
    appeler('commandes:statutApercu', [id, a]).then(function(ap){
      if (!ap.ok) {
        if (ap.motif !== 'inchange') dire(expliquer(ap), 'err');
        return;
      }
      var h = '<h3>Changer le statut</h3>'
        + '<p>Passer <strong>' + esc(ap.numero) + '</strong> de « <strong>' + esc(ap.deLibelle)
        + '</strong> » à « <strong>' + esc(ap.aLibelle) + '</strong> » ?</p>'
        + ((ap.implications || []).length
            ? '<ul>' + ap.implications.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '')
        + (ap.peutReinitCourriels
            ? '<label class="rc"><input type="checkbox" id="v-reinit"><span>🧪 <strong>Tests</strong> — '
              + 'réautoriser l’envoi des courriels de cette commande (le client pourra les recevoir '
              + 'à nouveau). Sinon, la protection anti-doublon reste active.</span></label>' : '')
        + '<div class="fin2"><button id="v-non">Annuler</button>'
        + '<button class="prim" id="v-oui">Confirmer</button></div>';
      voile(h, function(fermer){
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){
          this.disabled = true;
          if (ap.versExpedition) {
            // Le passage a << En livraison >> se fait DANS le flux d expedition
            // (transporteur + etiquette), jamais par une simple etiquette de statut.
            fermer();
            ouvrir('commandes:expedier', id, 'Expédition');
            return;
          }
          var reinit = !!(document.getElementById('v-reinit') && document.getElementById('v-reinit').checked);
          appeler('commandes:statutEcrire', [id, ap.de, a, reinit]).then(function(r){
            fermer();
            if (!r.ok) {
              dire(r.motif === 'conflit_statut'
                ? 'Statut déjà changé ailleurs (actuel : ' + (r.actuelLibelle || '?') + ').'
                : expliquer(r), 'err');
            } else if (!r.inchange) {
              dire('Statut mis à jour.', 'bon');
            }
            if (apresOK) apresOK(); else charger(true);
          });
        };
      });
    });
  }

  // ══ FRAIS DE SERVICE RETENUS — de l argent SORT (Square) ══════════════
  function flowFrais(){
    appeler('commandes:fraisApercu', [DET_ID]).then(function(ap){
      if (!ap.ok) { dire(expliquer(ap), 'err'); return; }
      voile('<h3>Rembourser les frais de service</h3>'
        + '<p>Rembourser <strong>' + argent(ap.montant) + '</strong> de frais de service retenus '
        + 'au client via Square ?'
        + (ap.dejaRembourse > 0 ? '<br><span style="color:#8fa1b8">(' + argent(ap.dejaRembourse)
            + ' déjà remboursés sur ' + argent(ap.totalRetenu) + ' retenus)</span>' : '')
        + ' <strong>Cette opération est irréversible.</strong></p>'
        + '<div class="fin2"><button id="v-non">Annuler</button>'
        + '<button class="prim" id="v-oui">Rembourser</button></div>',
        function(fermer){
          document.getElementById('v-non').onclick = fermer;
          document.getElementById('v-oui').onclick = function(){
            this.disabled = true; // anti double-clic : de l argent part
            appeler('commandes:fraisEcrire', [DET_ID]).then(function(r){
              fermer();
              if (!r.ok) { dire(expliquer(r), 'err'); return; }
              var sq = r.square || {};
              if (sq.etat === 'initie') dire(r.numero + ' — ' + argent(r.montant) + ' de frais de service remboursés via Square.', 'bon');
              else if (sq.etat === 'echec') dire('Enregistrement local créé mais Square a échoué : ' + (sq.detail || '?'), 'err');
              else if (sq.etat === 'reseau') dire('Enregistrement local créé mais erreur réseau Square : ' + (sq.detail || '?'), 'err');
              else dire(r.numero + ' — frais remboursés (aucun jeton Square configuré).', 'att');
              rechargerDetail();
            });
          };
        });
    });
  }

  // ══ SUPPRESSION — IRREVERSIBLE, cascade annoncee AVANT le bouton ════════
  function flowSupprimer(){
    appeler('commandes:supprimerApercu', [DET_ID]).then(function(ap){
      if (!ap.ok) { dire(expliquer(ap), 'err'); return; }
      voile('<h3 style="color:#f87171">🗑 Supprimer la commande</h3>'
        + '<p><strong>' + esc(ap.numero) + '</strong> — ' + esc(ap.client) + '<br>'
        + '<span style="color:#8fa1b8">' + esc(dateCourte(ap.date)) + ' · ' + argent(ap.total)
        + ' · ' + esc(ap.statutLibelle) + '</span></p>'
        + '<p style="font-weight:600;margin-top:.6rem">Éléments qui seront supprimés :</p>'
        + '<ul style="padding-left:0">' + (ap.elements || []).map(function(x){
            return '<li class="item">' + esc(x) + '</li>'; }).join('') + '</ul>'
        + '<p style="color:#f87171;font-weight:600">⚠ Cette action est irréversible.</p>'
        + '<div class="fin2"><button id="v-non">Annuler</button>'
        + '<button class="prim" id="v-oui" style="background:#dc2626;border-color:#dc2626;color:#fff">Supprimer définitivement</button></div>',
        function(fermer){
          document.getElementById('v-non').onclick = fermer;
          document.getElementById('v-oui').onclick = function(){
            this.disabled = true; // anti double-clic : Square peut rembourser
            appeler('commandes:supprimerEcrire', [DET_ID]).then(function(r){
              fermer();
              var sq = r.square || {};
              var note = sq.etat === 'initie' ? ' Remboursement Square de ' + argent(sq.montant) + ' initié.'
                : sq.etat === 'deja' ? ' Déjà entièrement remboursée — rien de plus envoyé à Square.'
                : sq.etat === 'echec' ? ' ⚠ Remboursement Square échoué : ' + (sq.detail || '?')
                : sq.etat === 'reseau' ? ' ⚠ Erreur réseau Square : ' + (sq.detail || '?') : '';
              if (!r.ok) {
                dire('Suppression non confirmée par le serveur (' + (r.detail || 'erreur inconnue') + ') — réessayez.' + note, 'err');
                rechargerDetail();
                return;
              }
              dire('Commande supprimée — inventaire rétabli.' + note, sq.etat === 'echec' || sq.etat === 'reseau' ? 'att' : 'bon');
              retourListe();
            });
          };
        });
    });
  }

  // ══ MENU CONTEXTUEL (clic droit sur une ligne) ════════════════════
  // ⚠ AUCUNE option quand la commande est en traitement — juste la raison,
  // comme le menu du site (la neutralisation d une fiche ne l atteignait pas).
  var menuEl = null;
  function fermerMenu(){
    if (menuEl && menuEl.parentNode) menuEl.parentNode.removeChild(menuEl);
    menuEl = null;
  }
  function menuStatut(ev, o){
    fermerMenu();
    if (!CTX || !CTX.peutEditer) return;
    menuEl = document.createElement('div');
    menuEl.className = 'ctx';
    if (o.enTraitement) {
      menuEl.innerHTML = '<div class="t">🔒 ' + esc(o.numero) + '</div>'
        + '<div class="warn">En traitement par <strong>' + esc(o.par || 'quelqu’un d’autre')
        + '</strong>.<br>Changement de statut impossible pour l’instant.</div>';
    } else {
      var cibles = ((CTX && CTX.statuts) || []).filter(function(x){
        return ['pending', 'cancelled'].indexOf(x.cle) < 0 && x.cle !== o.statut;
      });
      menuEl.innerHTML = '<div class="t">Statut de ' + esc(o.numero) + '</div>'
        + cibles.map(function(x){
            return '<button data-ctx="' + esc(x.cle) + '"><span class="et ' + couleurStatut(x.cle)
              + '">' + esc(x.libelle) + '</span></button>'; }).join('');
    }
    document.body.appendChild(menuEl);
    menuEl.style.left = Math.max(6, Math.min(ev.clientX, window.innerWidth - menuEl.offsetWidth - 8)) + 'px';
    menuEl.style.top = Math.max(6, Math.min(ev.clientY, window.innerHeight - menuEl.offsetHeight - 8)) + 'px';
    menuEl.onclick = function(e2){
      var b = e2.target && e2.target.closest ? e2.target.closest('[data-ctx]') : null;
      if (!b) return;
      var cible = b.getAttribute('data-ctx');
      fermerMenu();
      flowStatut(o.id, o.statut, cible, null);
    };
  }
  document.addEventListener('mousedown', function(ev){
    if (menuEl && ev.target && menuEl !== ev.target && !menuEl.contains(ev.target)) fermerMenu();
  }, true);

  // ══ VOILE ══════════════════════════════════════════════════════════
  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    if (apres) apres(fermer);
    return fermer;
  }

  // ══ ECOUTEURS ═════════════════════════════════════════════════════════════
  function brancherFermer(){
    var f = document.getElementById('btn-fermer');
    if (f) f.onclick = function(){ rendreVerrou(); P.fermer(); };
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
    if (pt) pt.onchange = function(){
      if (this.value === 'auto') { F.auto = true; F.page = 0; dessiner(); listeAutoAjuste(); }
      else { F.auto = false; F.parPage = parseInt(this.value, 10) || 20; F.page = 0; charger(); }
    };
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
        F.page = 0; dessiner(); charger();
        return;
      }
      if (t.closest('[data-vider]')) { F.statuts = []; F.page = 0; dessiner(); charger(); return; }
      if (t.closest('[data-prio]')) { F.prioritaires = !F.prioritaires; F.page = 0; dessiner(); charger(); return; }
      var pr = t.closest('[data-prep]');
      if (pr) {
        ouvrir('commandes:preparer', pr.getAttribute('data-prep'), 'Préparation');
        // La ligne passe << En traitement >> des que la fenetre a pris son
        // verrou : on recharge sans attendre le prochain battement.
        setTimeout(function(){ charger(); }, 1200);
        return;
      }
      // Le reste de la ligne ouvre le DETAIL — dans SA fenetre native.
      var tr = t.closest('tr[data-id]');
      if (tr) {
        ouvrir('commandes:ouvrirDetail', tr.getAttribute('data-id'), 'Détail');
        // Le detail prend le verrou : la ligne passe << En traitement >>.
        setTimeout(function(){ charger(); }, 1200);
      }
    };
    // Clic droit sur une ligne : changer le statut (jamais quand elle est tenue).
    corps.oncontextmenu = function(ev){
      var t = ev.target;
      var tr = t && t.closest ? t.closest('tr[data-id]') : null;
      if (!tr) return;
      ev.preventDefault();
      var id = tr.getAttribute('data-id');
      var o = ((DONNEES && DONNEES.lignes) || []).filter(function(x){ return x.id === id; })[0];
      if (o) menuStatut(ev, o);
    };
  }

  function ouvrir(op, id, quoi){
    dire('Ouverture…');
    appeler(op, [id]).then(function(r){
      dire(r.ok ? (quoi + ' ouverte dans sa fenêtre.') : expliquer(r), r.ok ? 'bon' : 'err');
    });
  }

  // ══ CHARGEMENT ════════════════════════════════════════════════════════════
  var RELANCE = false;
  function charger(forcer){
    /* ⚠ NE JAMAIS AVALER UN CLIC. Avant, un appel deja en vol (le battement
       des 5 s, ou la frappe precedente) faisait simplement RETURN : le filtre
       clique n agissait qu au battement suivant — vecu comme << plusieurs
       secondes de delai >> (2026-08-07). On note la demande, et la reponse
       perimee (celle de l ANCIEN filtre) n est pas dessinee. */
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('commandes:liste', [MODE, F]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(forcer); return; }
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      DONNEES = r;
      // La reponse arrivee APRES l ouverture d un detail ne doit pas l ecraser.
      if (VUE !== 'liste') return;
      if (!forcer) dire('');
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
      if (DET_DEPART) { ouvrirDetail(DET_DEPART); DET_DEPART = ''; return; }
      charger();
    });
  }

  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    if (menuEl) { fermerMenu(); return; }
    var v = document.querySelector('.voile');
    if (v && v.parentNode) { v.parentNode.removeChild(v); return; }
    if (VUE === 'detail') { retourListe(); return; }
    rendreVerrou();
    P.fermer();
  });
  window.addEventListener('beforeunload', function(){ rendreVerrou(); });

  setInterval(function(){
    if (enCours || VUE !== 'liste') return;
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
