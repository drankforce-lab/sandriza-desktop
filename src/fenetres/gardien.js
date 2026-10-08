'use strict';

/*
 * FENÊTRE « GARDIEN » — NATIVE (2026-10-08, défense contre un intrus, palier 2)
 * =============================================================================
 * Le gardien vit AU SERVEUR (lib-gardien.php) : il compte les gestes lourds de
 * chaque compte du personnel (suppressions de factures, d inventaire, de
 * clients, de photos, de listes de configuration, lectures complètes) sur une
 * fenêtre glissante. Au-delà du seuil, il refuse, ferme les sessions du compte,
 * le VERROUILLE et envoie une alerte par texto et par courriel.
 *
 * Cette fenêtre en montre l état, et n en décide aucune. CINQ ONGLETS depuis
 * la 7.9.0 (2026-10-09, sa demande : « que la fenêtre soit ancrée, et fais-moi
 * des onglets comme Réglages… que ça soit beau ») — tout empilé, il fallait
 * défiler quatre tableaux pour trouver les réglages :
 *   1. Tableau de bord : l état, les comptes verrouillés (et le geste qui les
 *      rouvre, deux clics), puis le bouton panique en zone de danger ;
 *   2. Activité : les 50 derniers gestes comptés (lectures complètes exceptées) ;
 *   3. Journal inviolable ; 4. Corbeille du serveur ;
 *   5. Réglages : interrupteur, fenêtre, seuils, destinataires des alertes.
 * Elle s ANCRE dans la fenêtre principale comme les autres écrans de Sécurité
 * (section hôte « gardien » côté site, _DOCKABLES dans admin.js).
 *
 * ⚠⚠ ENREGISTRER LES RÉGLAGES DÉCLENCHE UNE ALERTE, vers les ANCIENS et les
 * NOUVEAUX destinataires. C est voulu (turso-proxy.php, gardien_regler) : un
 * intrus qui a pris un compte super-administrateur et relève les seuils, ou
 * remplace le numéro d alerte par le sien, est vu. Le bouton le dit avant le
 * second clic — sans quoi la première alerte reçue ferait croire à une attaque.
 *
 * ⚠ SON PROPRE COMPTE NE SE DÉVERROUILLE PAS D ICI : il se rouvre par le lien
 * signé de l alerte. (Et une session verrouillée n ouvrirait pas cette fenêtre.)
 *
 * ⚠ SUPER-ADMINISTRATEUR SEULEMENT — vérifié dans le cœur (staff.js) ET au
 * serveur (require_superadmin). Cette fenêtre ne fait que dire le refus.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');

/* La langue du poste, résolue À LA GÉNÉRATION (voir src/langue/gardien.js).
   ⚠ Les noms, courriels, numéros et détails viennent du serveur : des DONNÉES. */
const T = require('../langue').tr('gardien');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.05rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .etat{display:inline-flex;align-items:center;gap:.45rem;margin-left:auto;font-size:.74rem;color:var(--tx2);
  padding:.2rem .65rem;border:1px solid var(--v10);border-radius:999px;background:var(--v03)}
.tete .etat i{width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.18)}
.tete .etat.att i{background:#fbbf24;box-shadow:0 0 0 3px rgba(251,191,36,.2)}
.tete .etat.err i{background:#f87171;box-shadow:0 0 0 3px rgba(248,113,113,.2)}
/* LES ONGLETS : hors de la zone qui défile, ils restent sous les yeux. */
.onglets{flex:0 0 auto;display:flex;gap:.25rem;align-items:center;flex-wrap:wrap;
  padding:.5rem 1.05rem;border-bottom:1px solid var(--v08);background:var(--f-page)}
.onglets > button{background:transparent;border:1px solid transparent;color:var(--tx2);padding:.36rem .75rem;
  display:inline-flex;align-items:center;gap:.4rem;font-weight:600}
.onglets > button:hover{background:var(--v05);color:var(--tx)}
.onglets > button:focus-visible{border-color:#c9a97e}
.onglets .nb{font-size:.68rem;font-weight:700;min-width:1.35rem;text-align:center;padding:.04rem .38rem;border-radius:999px;
  background:var(--v08);color:var(--tx2)}
.onglets .nb.att{background:rgba(251,191,36,.18);color:var(--tx-att)}
.onglets .droite{margin-left:auto}
.onglets .droite button{font-weight:400}
.tuiles.tuiles4{grid-template-columns:repeat(4,minmax(0,1fr))}
.carte h3{display:flex;align-items:center;gap:.5rem}
.intro{font-size:.78rem;color:var(--tx2);margin:-.2rem 0 .6rem}
tbody tr:hover td{background:var(--v03)}
.danger{border-color:rgba(239,68,68,.45);background:linear-gradient(180deg,rgba(239,68,68,.06),transparent 70%),var(--f-carte)}
.danger h3{color:var(--tx-err)}
.section{padding:.15rem 0 .8rem;margin-bottom:.8rem;border-bottom:1px solid var(--v06)}
.section:last-of-type{border-bottom:0;margin-bottom:.2rem}
.section h4{margin:0 0 .45rem;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--tx2)}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barre{display:flex;gap:.45rem;align-items:center;flex-wrap:wrap}
button{font:inherit;color:var(--tx);background:var(--v05);cursor:pointer;
  border:1px solid var(--v16);border-radius:8px;padding:.28rem .55rem}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button:focus{outline:none;border-color:#c9a97e}
button.dgr{border-color:rgba(239,68,68,.5);color:var(--tx-err)}
button.dgr:hover:not(:disabled){background:rgba(239,68,68,.14)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d6b98f}
button.mini{font-size:.74rem;padding:.14rem .45rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h3{margin:0 0 .5rem;font:700 .92rem/1.2 Georgia,serif}
.note{font-size:.78rem;color:var(--tx2);line-height:1.6;background:var(--v03);
  border:1px solid var(--v07);border-radius:10px;padding:.5rem .7rem}
table{width:100%;border-collapse:collapse;font-size:.82rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.67rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.3rem .4rem;border-top:1px solid var(--v05);vertical-align:top}
.sub{font-size:.71rem;color:var(--tx2)}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.72rem}
.mut{color:var(--tx2)}
.tuiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem;flex:0 0 auto}
.tuile{background:var(--f-carte);border:1px solid var(--v07);min-width:0}
.tuile .sub{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.val.att{color:var(--tx-att)}
.val.err{color:var(--tx-err)}
.vide{padding:1.1rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.grille{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.55rem .8rem}
.champ{display:flex;flex-direction:column;gap:.2rem;min-width:0}
.champ label{font-size:.74rem;color:var(--tx2)}
.champ input,.champ textarea{font:inherit;font-size:.84rem;color:var(--tx);background:var(--v03);
  border:1px solid var(--v12);border-radius:8px;padding:.3rem .5rem;width:100%}
.champ textarea{min-height:4.2rem;resize:vertical;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
.champ input:focus,.champ textarea:focus{outline:none;border-color:#c9a97e}
.deux{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem .8rem;margin-top:.6rem}
.inter{display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem;font-size:.86rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (max-width:820px){.tuiles.tuiles4{grid-template-columns:repeat(2,minmax(0,1fr))}.grille{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Gardien ». */
function pageGardien() {
  return `${TETE()}
<title>${T("Gardien — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.securite}</span><h1>${T("Gardien")}</h1>
  <span class="etat" id="sous"><i></i><span id="sous-t"></span></span></div>
<nav class="onglets" id="ong" role="tablist" aria-label="${T("Sections du gardien")}"></nav>
<div class="corps" id="corps"><div class="vide charge">${T("Lecture du gardien…")}</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES()}
  var corps = document.getElementById('corps');
  var sousEl = document.getElementById('sous');
  var sousT = document.getElementById('sous-t');
  var ongEl = document.getElementById('ong');
  /* L onglet ouvert survit aux rafraîchissements et à la fermeture (confort de
     ce poste : rien de grave si la préférence se perd). */
  var ONGLETS = [
    ['bord', '${T("Tableau de bord")}'], ['activite', '${T("Activité")}'],
    ['journal', '${T("Journal inviolable")}'], ['corbeille', '${T("Corbeille")}'],
    ['reglages', '${T("Réglages")}']
  ];
  var ONG = 'bord';
  try { var _o = localStorage.getItem('sz-gardien-onglet'); if (_o && ONGLETS.some(function(x){ return x[0] === _o; })) ONG = _o; } catch (e) {}

  var ETAT = null;      // null = pas encore lu ; sinon { cfg, verrous, evenements }
  var CONF = '';        // confirmation deux clics : '' | 'regler' | user_id
  var SALE = false;     // le formulaire des réglages a été touché : on ne le redessine pas
  var PANIQ = false;    // un mot est tapé dans la case du bouton panique : on ne l efface pas
  var OCC = false;
  var TIMER = null;
  var CATS = ['finances', 'inventaire', 'clients', 'photos', 'donnees', 'export'];
  var NOMS = {
    finances:   '${T("Finances (factures, remboursements, crédits)")}',
    inventaire: '${T("Inventaire (produits, stock mis à zéro)")}',
    clients:    '${T("Clients")}',
    photos:     '${T("Photos")}',
    donnees:    '${T("Listes de configuration")}',
    export:     '${T("Lectures complètes (alerte seulement)")}'
  };
  var COURTS = {
    finances: '${T("Finances")}', inventaire: '${T("Inventaire")}', clients: '${T("Clients")}',
    photos: '${T("Photos")}', donnees: '${T("Configuration")}', export: '${T("Lectures complètes")}',
    panique: '${T("Bouton panique")}'
  };

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function fdate(sec){
    var n = Number(sec); if (!n) return '';
    try { return new Date(n * 1000).toLocaleString('${LIEU()}', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return ''; }
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application.")}',
    droit:              '${T("Seul un super-administrateur peut voir et régler le gardien.")}',
    soi:                '${T("Votre propre compte se déverrouille par le lien reçu dans l’alerte.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 120)) + ')';
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

  function qui(l){
    var h = '<div class="rf-nom">' + (l.nom ? esc(l.nom) : '<em class="mut">${T("compte inconnu")}</em>')
      + (l.moi ? ' <span class="rf-pill bleu">${T("vous")}</span>' : '') + '</div>';
    h += '<div class="sub">' + (l.courriel ? esc(l.courriel) + ' · ' : '') + '<span class="mono">' + esc(l.user_id || '') + '</span></div>';
    return h;
  }

  /* ── LES COMPTES VERROUILLÉS ─────────────────────────────────────────── */
  function zoneVerrous(){
    var v = ETAT.verrous || [];
    var h = '<div class="carte" id="z-verrous"><h3>${T("Comptes verrouillés (")}' + v.length + ')</h3>';
    if (!v.length) return h + '<div class="vide">${T("Aucun compte verrouillé.")}</div></div>';
    /* Tous d un coup : l issue normale après le bouton panique (le même
       geste armé en deux clics, la clé « * » est comprise par le serveur). */
    if (v.length > 1) h += '<div class="barre" style="margin:0 0 .5rem"><button class="mini dgr" data-dev="*">'
      + (CONF === '*' ? '${T("✓ Confirmer — tout rouvrir")}' : '<span class="ic" aria-hidden="true">🔓</span>${T(" Tout déverrouiller (")}' + v.length + ')')
      + '</button></div>';
    h += '<table><thead><tr><th>${T("Compte")}</th><th>${T("Depuis")}</th><th>${T("Motif")}</th><th></th></tr></thead><tbody>';
    for (var i = 0; i < v.length; i++) {
      var l = v[i];
      h += '<tr><td>' + qui(l) + '</td>'
        + '<td style="white-space:nowrap">' + esc(fdate(l.le)) + '</td>'
        + '<td>' + esc(COURTS[l.cat] || l.cat || '') + (l.total ? ' · ' + esc(l.total) + '${T(" gestes")}' : '')
        + (l.detail ? '<div class="sub">' + esc(String(l.detail).slice(0, 160)) + '</div>' : '') + '</td>'
        + '<td style="text-align:right">' + (l.moi
            ? '<span class="sub">${T("par le lien de l’alerte")}</span>'
            : '<button class="mini dgr" data-dev="' + esc(l.user_id) + '">'
              + (CONF === String(l.user_id) ? '${T("✓ Confirmer")}' : '<span class="ic" aria-hidden="true">🔓</span>${T(" Déverrouiller")}')
              + '</button>') + '</td></tr>';
    }
    return h + '</tbody></table>'
      + '<div class="sub" style="margin-top:.45rem">${T("Déverrouiller rouvre la connexion de ce compte et remet son compteur à zéro. Vérifiez d’abord, dans l’onglet Activité, que les gestes étaient bien les siens.")}</div></div>';
  }

  /* ── LES DERNIERS ÉVÉNEMENTS ─────────────────────────────────────────── */
  function zoneEvenements(){
    var e = ETAT.evenements || [];
    var h = '<div class="carte"><h3>${T("Derniers gestes comptés (")}' + e.length + ')</h3>'
      + '<div class="intro">${T("Les 50 plus récents. Les lectures complètes n’y figurent pas : trop nombreuses, elles noieraient le reste.")}</div>';
    if (!e.length) return h + '<div class="vide">${T("Aucun geste compté.")}</div></div>';
    h += '<table><thead><tr><th>${T("Quand")}</th><th>${T("Compte")}</th><th>${T("Catégorie")}</th><th>${T("Nombre")}</th><th>${T("Détail")}</th><th>${T("Adresse IP")}</th></tr></thead><tbody>';
    for (var i = 0; i < e.length; i++) {
      var l = e[i];
      h += '<tr><td style="white-space:nowrap">' + esc(fdate(l.ts)) + '</td>'
        + '<td>' + qui(l) + '</td>'
        + '<td>' + esc(COURTS[l.cat] || l.cat || '') + '</td>'
        + '<td>' + esc(l.n || '') + '</td>'
        + '<td class="sub">' + esc(String(l.detail || '').slice(0, 160)) + '</td>'
        + '<td class="mono">' + esc(l.ip || '') + '</td></tr>';
    }
    return h + '</tbody></table></div>';
  }

  /* ── LE JOURNAL INVIOLABLE (palier 3) ─────────────────────────────────
     Écrit par le serveur seul, jamais réécrit. Les lignes qui disent qu on a
     TOUCHÉ au journal d accès (entrée réécrite, retirée, journal remplacé en
     bloc) sont mises en avant : c est exactement ce qu un intrus ferait. */
  var SOURCES = {
    serveur: '${T("Serveur")}', poste: '${T("Poste")}',
    reecrit: '${T("Entrée réécrite")}', retrait: '${T("Entrée retirée")}', bloc: '${T("Journal remplacé")}'
  };
  function zoneJournal(){
    var j = ETAT.journal || [];
    var touches = j.filter(function(l){ return l.src === 'reecrit' || l.src === 'retrait' || l.src === 'bloc'; }).length;
    var h = '<div class="carte"><h3>${T("Journal inviolable (")}' + j.length + ')</h3>'
      + '<div class="intro">${T("Les 100 dernières entrées. Écrit par le serveur seul : aucune session, même super-administrateur, ne peut le modifier ni le vider. Une entrée du journal d’accès réécrite ou retirée y laisse une trace.")}</div>';
    if (touches) h += '<div class="note" style="margin:0 0 .5rem;color:var(--tx-att)">' + touches
      + (touches > 1 ? '${T(" modifications du journal d’accès dans ces entrées — vérifiez qui les a faites.")}'
                     : '${T(" modification du journal d’accès dans ces entrées — vérifiez qui l’a faite.")}') + '</div>';
    if (!j.length) return h + '<div class="vide">${T("Aucune entrée pour l’instant.")}</div></div>';
    h += '<table><thead><tr><th>${T("Quand")}</th><th>${T("Compte")}</th><th>${T("Action")}</th><th>${T("Origine")}</th><th>${T("Adresse IP")}</th></tr></thead><tbody>';
    for (var i = 0; i < j.length; i++) {
      var l = j[i];
      var vif = l.src === 'reecrit' || l.src === 'retrait' || l.src === 'bloc';
      h += '<tr><td style="white-space:nowrap">' + esc(fdate(l.ts)) + '</td>'
        + '<td>' + (l.user_id ? qui(l) : '<span class="mut">—</span>') + '</td>'
        + '<td>' + esc(String(l.action || '').slice(0, 220))
        + (l.section ? '<div class="sub">' + esc(l.section) + '</div>' : '') + '</td>'
        + '<td style="white-space:nowrap' + (vif ? ';color:var(--tx-att);font-weight:700' : '') + '">' + (vif ? '<span class="ic" aria-hidden="true">⚠</span> ' : '') + esc(SOURCES[l.src] || l.src || '') + '</td>'
        + '<td class="mono">' + esc(l.ip || '') + '</td></tr>';
    }
    return h + '</tbody></table></div>';
  }

  /* ── LA CORBEILLE DU SERVEUR (palier 3) ───────────────────────────────
     Toute fiche supprimée (commande, facture, produit, client…) et toute
     entrée retirée d une liste qui vaut quelque chose y dort 30 jours. Le
     serveur refuse de restaurer par-dessus une fiche qui existe de nouveau. */
  var SRC = {
    orders: '${T("Commande")}', invoices: '${T("Facture")}', refunds: '${T("Remboursement")}',
    store_credits: '${T("Crédit en magasin")}', products: '${T("Produit")}', users: '${T("Client")}',
    r2: '${T("Fichier (photo, reçu…)")}'
  };
  function nomSource(s){
    s = String(s || '');
    if (SRC[s]) return SRC[s];
    if (s.indexOf('cfg:') === 0) return '${T("Liste : ")}' + esc(s.slice(4));
    return esc(s);
  }
  function zoneCorbeille(){
    var c = ETAT.corbeille || [];
    var h = '<div class="carte"><h3>${T("Corbeille du serveur (")}' + c.length + ')</h3>'
      + '<div class="intro">${T("Ce qui a été supprimé dort ici pendant ")}' + esc(ETAT.corbeilleJours || 30)
      + '${T(" jours avant d’être effacé pour de bon. Restaurer remet la fiche telle qu’elle était au moment de la suppression, ou le fichier à son adresse d’origine.")}</div>';
    if (!c.length) return h + '<div class="vide">${T("La corbeille est vide.")}</div></div>';
    h += '<table><thead><tr><th>${T("Supprimé le")}</th><th>${T("Quoi")}</th><th>${T("Par")}</th><th></th></tr></thead><tbody>';
    for (var i = 0; i < c.length; i++) {
      var l = c[i], cle = 'r' + l.id;
      h += '<tr><td style="white-space:nowrap">' + esc(fdate(l.quand)) + '</td>'
        + '<td><div class="rf-nom">' + (l.libelle ? esc(l.libelle) : '<em class="mut">${T("sans libellé")}</em>') + '</div>'
        + '<div class="sub">' + nomSource(l.source) + ' · <span class="mono">' + esc(l.rec_id || '') + '</span></div></td>'
        + '<td>' + (l.user_id ? qui(l) : '<span class="mut">—</span>') + '</td>'
        + '<td style="text-align:right"><button class="mini" data-rest="' + esc(l.id) + '">'
        + (CONF === cle ? '${T("✓ Confirmer")}' : '<span class="ic" aria-hidden="true">↩</span>${T(" Restaurer")}') + '</button></td></tr>';
    }
    return h + '</tbody></table></div>';
  }

  /* ── LE BOUTON PANIQUE (palier 3) ──────────────────────────────────────
     En haut de la fenêtre : en cas d intrusion, on ne cherche pas. Armé par
     le mot PANIQUE tapé en toutes lettres (le serveur l exige aussi) — un
     clic égaré mettrait toute l équipe dehors. */
  function zonePanique(){
    return '<div class="carte danger" id="z-pan"><h3><span class="ic" aria-hidden="true">⚠</span>${T("Bouton panique")}</h3>'
      + '<div class="intro">${T("En cas d’intrusion : toutes les sessions du personnel sont fermées, sauf celle-ci, et tous les autres comptes sont verrouillés. Personne ne peut se reconnecter tant que vous ne rouvrez pas les comptes ici. Une alerte part par texto et par courriel.")}</div>'
      + '<div class="barre" style="align-items:flex-end"><div class="champ" style="max-width:17rem">'
      + '<label for="g-pan">${T("Tapez PANIQUE pour armer le bouton")}</label><input id="g-pan" autocomplete="off" spellcheck="false"></div>'
      + '<button class="dgr" id="g-pan-go" disabled>${T("Activer le bouton panique")}</button></div></div>';
  }

  /* ── LES RÉGLAGES ────────────────────────────────────────────────────── */
  function zoneReglages(){
    var c = ETAT.cfg || {};
    var s = c.seuils || {};
    var h = '<div class="carte" id="z-cfg"><h3>${T("Réglages")}</h3>'
      + '<div class="section"><h4>${T("Général")}</h4>'
      + '<label class="inter"><input type="checkbox" id="g-actif"' + (c.actif !== false ? ' checked' : '') + '> '
      + '${T("Gardien actif")}</label>'
      + '<div class="grille"><div class="champ"><label for="g-fen">${T("Fenêtre de comptage (minutes)")}</label>'
      + '<input id="g-fen" type="number" min="1" max="1440" value="' + esc(c.fenetreMin || 10) + '"></div></div></div>'
      + '<div class="section"><h4>${T("Seuils")}</h4>'
      + '<div class="intro">${T("Seuils : au-delà, dans la fenêtre, le geste est refusé et le compte verrouillé.")}</div>'
      + '<div class="grille">';
    for (var i = 0; i < CATS.length; i++) {
      h += '<div class="champ"><label for="g-s-' + CATS[i] + '">' + NOMS[CATS[i]] + '</label>'
        + '<input id="g-s-' + CATS[i] + '" type="number" min="1" max="100000" value="' + esc(s[CATS[i]] || '') + '"></div>';
    }
    h += '</div></div><div class="section"><h4>${T("Destinataires des alertes")}</h4><div class="deux" style="margin-top:0">'
      + '<div class="champ"><label for="g-tel">${T("Textos d’alerte (un numéro par ligne, ex. +14185551234)")}</label>'
      + '<textarea id="g-tel">' + esc((c.alerteTel || []).join('\\n')) + '</textarea></div>'
      + '<div class="champ"><label for="g-mel">${T("Courriels d’alerte (un par ligne)")}</label>'
      + '<textarea id="g-mel">' + esc((c.alerteCourriel || []).join('\\n')) + '</textarea></div></div>'
      + '<div class="sub" style="margin-top:.45rem">${T("Le courriel de l’entreprise reçoit aussi chaque alerte.")}</div></div>'
      + '<div class="barre" style="margin-top:.6rem"><button class="prim" id="g-save">'
      + (CONF === 'regler' ? '${T("✓ Confirmer — une alerte partira")}' : '${T("Enregistrer les réglages")}') + '</button>'
      + (SALE ? '<button id="g-annuler">${T("Annuler les modifications")}</button>' : '') + '</div>'
      + '<div class="note" style="margin-top:.6rem">${T("Chaque enregistrement envoie une alerte aux anciens ET aux nouveaux destinataires : personne ne peut changer les seuils ou les numéros en silence.")}</div>'
      + '</div>';
    return h;
  }

  function lignes(id){
    var el = document.getElementById(id);
    return String(el ? el.value : '').split(/[\\n,;]+/).map(function(x){ return x.trim(); }).filter(Boolean);
  }
  function lireForm(){
    var cfg = { actif: !!(document.getElementById('g-actif') || {}).checked, seuils: {} };
    var fen = parseInt((document.getElementById('g-fen') || {}).value, 10);
    if (!(fen >= 1 && fen <= 1440)) return { faute: '${T("La fenêtre doit être entre 1 et 1440 minutes.")}' };
    cfg.fenetreMin = fen;
    for (var i = 0; i < CATS.length; i++) {
      var n = parseInt((document.getElementById('g-s-' + CATS[i]) || {}).value, 10);
      if (!(n >= 1 && n <= 100000)) return { faute: '${T("Chaque seuil doit être un nombre entre 1 et 100000 : ")}' + NOMS[CATS[i]] };
      cfg.seuils[CATS[i]] = n;
    }
    var tel = lignes('g-tel').map(function(t){ return t.replace(/[\\s().-]/g, ''); });
    for (var j = 0; j < tel.length; j++) {
      if (!/^\\+[1-9][0-9]{7,14}$/.test(tel[j])) return { faute: '${T("Numéro invalide (forme +14185551234) : ")}' + esc(tel[j]) };
    }
    var mel = lignes('g-mel');
    for (var k = 0; k < mel.length; k++) {
      if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(mel[k])) return { faute: '${T("Courriel invalide : ")}' + esc(mel[k]) };
    }
    if (!tel.length && !mel.length) return { faute: '${T("Gardez au moins un destinataire : sans lui, une alerte ne partirait que vers le courriel de l’entreprise.")}' };
    cfg.alerteTel = tel; cfg.alerteCourriel = mel;
    return { cfg: cfg };
  }

  function nbJournalTouche(){
    return (ETAT.journal || []).filter(function(l){ return l.src === 'reecrit' || l.src === 'retrait' || l.src === 'bloc'; }).length;
  }
  function dessinerOnglets(){
    var nb = {
      bord: [(ETAT.verrous || []).length, true],
      activite: [(ETAT.evenements || []).length, false],
      journal: [nbJournalTouche(), true],
      corbeille: [(ETAT.corbeille || []).length, false]
    };
    var h = '';
    for (var i = 0; i < ONGLETS.length; i++) {
      var k = ONGLETS[i][0], on = k === ONG, n = nb[k];
      h += '<button role="tab" data-ong="' + k + '" id="o-' + k + '" aria-selected="' + on + '" tabindex="' + (on ? '0' : '-1') + '"'
        + (on ? ' class="on"' : '') + '>' + ONGLETS[i][1]
        + (n && n[0] ? '<span class="nb' + (n[1] ? ' att' : '') + '">' + n[0] + '</span>' : '') + '</button>';
    }
    h += '<span class="droite"><button class="mini" id="g-reload"><span class="ic" aria-hidden="true">🔄</span>${T(" Actualiser")}</button></span>';
    ongEl.innerHTML = h;
    var bs = ongEl.querySelectorAll('[data-ong]');
    for (var j = 0; j < bs.length; j++) bs[j].onclick = function(){ choisir(this.getAttribute('data-ong')); };
    var gr = document.getElementById('g-reload');
    if (gr) gr.onclick = function(){ CONF = ''; charger(true); };
  }
  /* Changer d onglet abandonne un formulaire de réglages entamé : on le DIT
     (il ne disparaît pas en silence), on ne bloque pas. */
  function choisir(k){
    if (k === ONG) return;
    if (ONG === 'reglages' && SALE) dire('${T("Modifications des réglages abandonnées.")}', 'att');
    PANIQ = false; SALE = false; CONF = ''; ONG = k;
    try { localStorage.setItem('sz-gardien-onglet', k); } catch (e) {}
    dessiner(); corps.scrollTop = 0;
    var o = document.getElementById('o-' + k); if (o) o.focus();
  }
  ongEl.addEventListener('keydown', function(ev){
    if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
    if (!ev.target || !ev.target.getAttribute || !ev.target.getAttribute('data-ong')) return;
    var i = 0; for (; i < ONGLETS.length; i++) if (ONGLETS[i][0] === ONG) break;
    i = (i + (ev.key === 'ArrowRight' ? 1 : ONGLETS.length - 1)) % ONGLETS.length;
    ev.preventDefault(); choisir(ONGLETS[i][0]);
  });

  function tuilesBord(){
    var c = ETAT.cfg || {};
    var nv = (ETAT.verrous || []).length, ne = (ETAT.evenements || []).length, nc = (ETAT.corbeille || []).length;
    var tu = function(lib, val, sous, ton){
      return '<div class="tuile"><div class="lbl">' + lib + '</div><div class="val' + (ton ? ' ' + ton : '') + '">'
        + val + '</div><div class="sub">' + sous + '</div></div>';
    };
    return szTuiles('<div class="tuiles tuiles4" id="z-tuiles">'
      + tu('${T("État")}', c.actif === false ? '${T("Éteint")}' : '${T("Actif")}', '${T("le serveur compte les gestes lourds")}', c.actif === false ? 'err' : '')
      + tu('${T("Comptes verrouillés")}', nv, '${T("connexion refusée")}', nv ? 'att' : '')
      + tu('${T("Gestes comptés")}', ne, '${T("fenêtre de ")}' + esc(c.fenetreMin || 10) + ' min', '')
      + tu('${T("Corbeille")}', nc, esc(ETAT.corbeilleJours || 30) + '${T(" jours avant effacement")}', '')
      + '</div>');
  }
  function contenu(){
    var c = ETAT.cfg || {};
    if (ONG === 'activite') return zoneEvenements();
    if (ONG === 'journal') return zoneJournal();
    if (ONG === 'corbeille') return zoneCorbeille();
    if (ONG === 'reglages') return zoneReglages();
    return tuilesBord()
      + (c.actif === false ? '<div class="note">${T("Le gardien est éteint : aucun geste n’est compté, aucun compte ne sera verrouillé, aucune alerte ne partira.")}</div>' : '')
      + zoneVerrous() + zonePanique();
  }
  function dessinerEtat(){
    var c = ETAT.cfg || {};
    var nv = (ETAT.verrous || []).length;
    sousEl.className = 'etat' + (c.actif === false ? ' err' : (nv ? ' att' : ''));
    sousT.textContent = c.actif === false ? '${T("gardien ÉTEINT")}'
      : (nv ? (nv + (nv > 1 ? '${T(" comptes verrouillés")}' : '${T(" compte verrouillé")}')) : '${T("actif · aucun compte verrouillé")}');
  }
  function dessiner(){
    if (ETAT === null) { corps.innerHTML = '<div class="vide charge">${T("Lecture du gardien…")}</div>'; return; }
    dessinerEtat(); dessinerOnglets();
    corps.innerHTML = contenu();
    brancher();
  }
  /* Le rafraîchissement automatique ne touche pas un formulaire qu on est en
     train de remplir : Réglages modifiés → rien ; case PANIQUE remplie → seuls
     les tuiles et les verrous du tableau de bord bougent. */
  function redessinerVivant(){
    if (ETAT === null) { dessiner(); return; }
    dessinerEtat(); dessinerOnglets();
    if (ONG === 'reglages' && SALE) return;
    if (ONG === 'bord' && PANIQ) {
      var zt = document.getElementById('z-tuiles'), zv = document.getElementById('z-verrous');
      if (zt) zt.outerHTML = tuilesBord();
      if (zv) zv.outerHTML = zoneVerrous();
      brancherVivant(); return;
    }
    var y = corps.scrollTop;
    corps.innerHTML = contenu();
    brancher();
    corps.scrollTop = y;
  }

  function brancherVivant(){
    var rs = corps.querySelectorAll('[data-rest]');
    for (var q = 0; q < rs.length; q++) {
      rs[q].onclick = function(){
        var id = this.getAttribute('data-rest');
        if (CONF === 'r' + id) { CONF = ''; restaurer(id); }
        else { CONF = 'r' + id; redessinerVivant(); dire('${T("Cliquez encore pour restaurer cette fiche.")}', 'att'); }
      };
    }
    var us = corps.querySelectorAll('[data-dev]');
    for (var u = 0; u < us.length; u++) {
      us[u].onclick = function(){
        var id = this.getAttribute('data-dev');
        if (CONF === id) { CONF = ''; deverrouiller(id); }
        else { CONF = id; redessinerVivant(); dire(id === '*' ? '${T("Cliquez encore pour rouvrir tous les comptes.")}' : '${T("Cliquez encore pour rouvrir ce compte.")}', 'att'); }
      };
    }
  }
  function brancher(){
    brancherVivant();
    var gp = document.getElementById('g-pan'), gpb = document.getElementById('g-pan-go');
    if (gp && gpb) {
      gp.oninput = function(){ PANIQ = gp.value !== ''; gpb.disabled = gp.value.trim() !== 'PANIQUE'; };
      gpb.onclick = function(){ if (gp.value.trim() === 'PANIQUE') panique(); };
    }
    var zc = document.getElementById('z-cfg');
    if (zc) zc.addEventListener('input', function(){
      if (!SALE) { SALE = true; var b = document.getElementById('g-save'); if (b && b.parentNode && !document.getElementById('g-annuler')) {
        var a = document.createElement('button'); a.id = 'g-annuler'; a.textContent = '${T("Annuler les modifications")}';
        a.onclick = annuler; b.parentNode.appendChild(a); } }
      if (CONF === 'regler') { CONF = ''; var bs = document.getElementById('g-save'); if (bs) bs.textContent = '${T("Enregistrer les réglages")}'; }
    });
    var ga = document.getElementById('g-annuler');
    if (ga) ga.onclick = annuler;
    var gs = document.getElementById('g-save');
    if (gs) gs.onclick = function(){
      var f = lireForm();
      if (f.faute) { CONF = ''; this.textContent = '${T("Enregistrer les réglages")}'; dire(f.faute, 'err'); return; }
      if (CONF === 'regler') { CONF = ''; regler(f.cfg); return; }
      CONF = 'regler';
      this.textContent = '${T("✓ Confirmer — une alerte partira")}';
      dire('${T("Cliquez encore : une alerte partira aux anciens et aux nouveaux destinataires.")}', 'att');
    };
  }
  function annuler(){ SALE = false; CONF = ''; dessiner(); dire(''); }

  function deverrouiller(id){
    if (OCC) return; OCC = true; dire('${T("Déverrouillage…")}');
    appeler('gardien:deverrouiller', [id]).then(function(r){
      OCC = false;
      if (!r.ok) { dire(expliquer(r), 'err'); redessinerVivant(); return; }
      ETAT = { cfg: SALE ? ETAT.cfg : r.cfg, verrous: r.verrous || [], evenements: r.evenements || [], journal: r.journal || [], corbeille: r.corbeille || [], corbeilleJours: r.corbeilleJours };
      redessinerVivant();
      dire(id === '*' ? '${T("Tous les comptes sont rouverts.")}' : '${T("Compte rouvert : il peut se connecter de nouveau.")}', 'bon');
    });
  }
  var REFUS_REST = {
    existe_deja: '${T("Une fiche porte de nouveau cet identifiant : la restaurer l’écraserait. Rien n’a été changé.")}',
    introuvable: '${T("Cette entrée n’est plus dans la corbeille.")}',
    copie_disparue: '${T("La copie de ce fichier n’existe plus dans le stockage : il ne peut pas être remis.")}',
    stockage_refuse: '${T("Le stockage a refusé de remettre le fichier. Réessayez dans un moment.")}',
    stockage_non_configure: '${T("Le stockage des fichiers n’est pas configuré sur ce serveur.")}'
  };
  function restaurer(id){
    if (OCC) return; OCC = true; dire('${T("Restauration…")}');
    appeler('gardien:restaurer', [id]).then(function(r){
      OCC = false;
      if (!r.ok) {
        var d = String((r && r.detail) || '');
        dire(REFUS_REST[d] || (d.indexOf('existe_deja') >= 0 ? REFUS_REST.existe_deja : expliquer(r)), 'err');
        redessinerVivant(); return;
      }
      ETAT = { cfg: SALE ? ETAT.cfg : r.cfg, verrous: r.verrous || [], evenements: r.evenements || [], journal: r.journal || [], corbeille: r.corbeille || [], corbeilleJours: r.corbeilleJours };
      redessinerVivant();
      dire('${T("Restauré. Rechargez l’écran concerné pour le revoir.")}', 'bon');
    });
  }
  function panique(){
    if (OCC) return; OCC = true; dire('${T("Bouton panique : fermeture des sessions…")}', 'att');
    appeler('gardien:panique', ['PANIQUE']).then(function(r){
      OCC = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      ETAT = { cfg: SALE ? ETAT.cfg : r.cfg, verrous: r.verrous || [], evenements: r.evenements || [], journal: r.journal || [], corbeille: r.corbeille || [], corbeilleJours: r.corbeilleJours };
      PANIQ = false; CONF = ''; dessiner();
      dire('${T("Fait : les autres sessions sont fermées et les comptes verrouillés. Changez les mots de passe avant de rouvrir.")}', 'bon');
    });
  }
  function regler(cfg){
    if (OCC) return; OCC = true; dire('${T("Enregistrement…")}');
    appeler('gardien:regler', [cfg]).then(function(r){
      OCC = false;
      if (!r.ok) { dire(expliquer(r), 'err'); dessinerBouton(); return; }
      ETAT = { cfg: r.cfg, verrous: r.verrous || [], evenements: r.evenements || [], journal: r.journal || [], corbeille: r.corbeille || [], corbeilleJours: r.corbeilleJours };
      SALE = false; dessiner();
      dire('${T("Réglages enregistrés — l’alerte de changement est partie.")}', 'bon');
    });
  }
  function dessinerBouton(){ var b = document.getElementById('g-save'); if (b) b.textContent = '${T("Enregistrer les réglages")}'; }

  function charger(fort){
    if (OCC) return;
    appeler('gardien:etat', []).then(function(r){
      if (!r || !r.ok) {
        if (ETAT === null) corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        if (fort) dire(expliquer(r), 'err');
        return;
      }
      var premier = ETAT === null;
      ETAT = { cfg: (SALE && ETAT) ? ETAT.cfg : r.cfg, verrous: r.verrous || [], evenements: r.evenements || [], journal: r.journal || [], corbeille: r.corbeille || [], corbeilleJours: r.corbeilleJours };
      if (premier || (fort && !SALE)) dessiner(); else redessinerVivant();
      if (fort) dire('');
    });
  }

  /* Suivi toutes les 15 s : un verrouillage doit se voir sans cliquer. On ne
     redessine pas pendant une confirmation (le bouton armé disparaîtrait). */
  function suivre(){
    if (TIMER) return;
    TIMER = setInterval(function(){
      if (document.hidden || OCC || CONF) return;
      charger(false);
    }, 15000);
  }
  window.addEventListener('pagehide', function(){ if (TIMER) { clearInterval(TIMER); TIMER = null; } });

  window.szActualiser = function(){ if (!CONF) charger(false); };
  window.szRevenir = function(){ charger(!SALE); };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  charger(true);
  suivre();
})();
</script>
</body></html>`;
}

module.exports = { pageGardien };
