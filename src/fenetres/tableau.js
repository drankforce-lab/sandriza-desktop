'use strict';

/*
 * FENÊTRE « TABLEAU DE BORD » — NATIVE
 * =============================================================================
 * Le premier écran de la journée, en fenêtre de consultation : les tuiles
 * chiffrées (masquables par personne, comme l'écran du site), l'avis de taux
 * de change s'il y a lieu, et les 10 dernières commandes et factures (la suite
 * vit dans « Tout voir », qui ouvre la fenêtre native dans son état retenu).
 * AUCUNE écriture ici, sauf le réglage des tuiles (préférence par personne,
 * tableau:tuiles).
 *
 * ⚠ LE CALCUL VIT DANS LE SITE (Admin._tableauDonnees, sans DOM) : l'écran du
 * site et cette fenêtre consomment le MÊME cœur — dupliquer les sommes ici,
 * c'était garantir deux tableaux qui ne s'accordent plus au premier
 * ajustement (la leçon des collections, le jour même).
 *
 * ⚠ CLIQUER UNE TUILE OUVRE LA CIBLE (tableau:ouvrir) : la fenêtre native
 * quand elle existe (Commandes, Inventaire), l'écran de la fenêtre principale
 * sinon. C'est un clic explicite de l'usager — pas une navigation volée.
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
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:#8fa1b8}
select,button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
.avis{font-size:.78rem;line-height:1.45;border-radius:9px;padding:.45rem .7rem;
  background:rgba(245,158,11,.11);border:1px solid rgba(245,158,11,.42);color:#f0c987}
/* ── Les tuiles ── */
.tuiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.55rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .8rem;min-width:0;cursor:pointer;user-select:none;
  transition:border-color .13s}
.tuile:hover{border-color:#c9a97e}
.tuile .lbl{font-size:.66rem;text-transform:uppercase;letter-spacing:.07em;color:#8fa1b8;
  filter:grayscale(1) brightness(1.45);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tuile .val{font:700 1.5rem/1.3 Georgia,serif}
.tuile .val.att{color:#fbbf24}.tuile .val.err{color:#f87171}
.tuile .sub{font-size:.7rem;color:#6d7f96;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tuile .sub.att{color:#fbbf24}
/* ── LA BANDE « À FAIRE MAINTENANT » ──────────────────────────────────────
   ⚠ ELLE N'APPARAÎT QUE S'IL Y A QUELQUE CHOSE À FAIRE. Une bande permanente
   qui annonce « rien à faire » finit par ne plus être lue — et le jour où elle
   dit quelque chose, elle ne se distingue plus du décor. Rien à faire = pas de
   bande, et l'écran commence directement par les chiffres. */
.afaire{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;
  background:rgba(201,169,126,.09);border:1px solid rgba(201,169,126,.32);
  border-radius:11px;padding:.5rem .7rem}
.afaire .titre{font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;
  color:#c9a97e;font-weight:700;margin-right:.2rem}
.afaire button{font-size:.79rem;padding:.22rem .6rem;border-radius:99px;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14)}
.afaire button:hover{background:rgba(255,255,255,.12)}
.afaire button b{font-weight:800}
.afaire button.urgent{border-color:rgba(248,113,113,.5);color:#fca5a5}
html.jour .afaire{background:rgba(180,140,80,.12);border-color:rgba(150,110,50,.35)}
html.jour .afaire .titre{color:#8a6a3e}
.panneau{background:#16202f;border:1px solid rgba(255,255,255,.09);border-radius:11px;
  padding:.6rem .8rem;display:flex;gap:1rem;flex-wrap:wrap;font-size:.82rem}
.panneau label{display:flex;align-items:center;gap:.4rem;cursor:pointer}
.panneau input{width:auto}
/* ── Les deux cartes récentes ── */
.deux{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;align-items:start}
@media (max-width:900px){.deux{grid-template-columns:1fr}}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .45rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.09em;color:#8fa1b8;font-weight:700;display:flex;align-items:center;gap:.5rem}
.carte h2 .tout{margin-left:auto}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.3rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:#8fa1b8}
.cadslot{display:inline}
.cad{margin-left:.35rem;font-size:.8rem;color:#fbbf24;vertical-align:middle;cursor:default}
.cad.mine{color:#c9a97e}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.err{background:rgba(239,68,68,.16);color:#f87171}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:#8fa1b8}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Tableau de bord ». */
function pageTableau() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Tableau de bord — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">📊</span><h1>Tableau de bord</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;            // les donnees du site (tableau:lire)
  var ANNEE = 'all';
  var PANNEAU = false;     // le panneau << Tuiles >> est ouvert
  var PAR_PAGE = 10;       // les 10 dernieres, d un bloc (demande du 2026-08-08)
  /* L etat de la tuile << Derniere sauvegarde >> (#25). null = pas encore lue.
     ⚠ ELLE SE LIT A PART, APRES le premier dessin : c est le seul indicateur du
     tableau de bord qui passe par le RESEAU (backup.php interroge R2). La mettre
     dans tableau:lire ferait attendre tout l ecran d ouverture de session pour
     une ligne d information. */
  var SAUV = null, SAUV_QUAND = 0, SAUV_EN_COURS = false;
  var VERROUS = {};           // #38 : { <idCommande>: { par, mine } } — sonde toutes les ~3 s
  var VERROU_TIMER = null;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function fmt(n){
    try { return (Number(n) || 0).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }); }
    catch (e) { return (Number(n) || 0).toFixed(2) + ' $'; }
  }
  function fmtDate(d){
    try { return new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch (e) { return String(d || ''); }
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès au tableau de bord.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
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
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  /* Les tuiles. Les sept premieres sont celles de l ecran du site, dans le meme
     ordre. Les suivantes sont propres au natif (#25) : elles disent ce qu il
     RESTE A FAIRE, la ou les premieres disent des totaux.
     ⚠ Chacune reste masquable par personne (panneau << Tuiles >>), et une tuile
     inconnue de la preference est AFFICHEE par defaut — sans quoi personne ne
     verrait jamais une tuile ajoutee apres coup. */
  var TUILES = [
    ['a_traiter', '🎯', 'Commandes à traiter'],
    ['products', '👗', 'Produits actifs'],
    ['orders', '📦', 'Commandes'],
    ['customers', '👥', 'Clients actifs'],
    ['revenue', '💰', 'Revenus (payés)'],
    ['messagerie', '💬', 'Messagerie'],
    ['returns_new', '↩', 'Nouveaux retours'],
    ['returns_expiring', '⏳', 'Retours sur le point d’expirer'],
    ['en_livraison', '🚚', 'En livraison'],
    ['ruptures', '🚫', 'Ruptures de stock'],
    ['avis', '⭐', 'Avis à modérer'],
    ['factures_retard', '⌛', 'Factures en retard'],
    ['incidents', '🛡', 'Incidents ouverts'],
    ['sauvegarde', '💾', 'Dernière sauvegarde']
  ];

  function tuile(cle, ic, lbl, valeur, ton, sousTitre, sousTon){
    return '<div class="tuile" data-tuile="' + cle + '">'
      + '<div class="lbl">' + ic + ' ' + esc(lbl) + '</div>'
      + '<div class="val' + (ton ? ' ' + ton : '') + '">' + valeur + '</div>'
      + '<div class="sub' + (sousTon ? ' ' + sousTon : '') + '">' + sousTitre + '</div></div>';
  }

  /* ⚠ UNE TUILE QU ON N A PAS LE DROIT DE VOIR NE S OFFRE MEME PAS AU REGLAGE.
     Laisser << Derniere sauvegarde >> dans le panneau des tuiles a qui n a pas
     la permission « backups », c est lui apprendre par la bande qu il existe des
     sauvegardes et quand elles datent. Le pont refuse deja l operation ; ici on
     retire aussi la case. */
  function offerte(x){
    if (x[0] !== 'sauvegarde') return true;
    return !(SAUV && SAUV.interdite);
  }

  /* La tuile << Derniere sauvegarde >>. Ecrite a part parce qu elle a QUATRE
     etats, et qu un empilement de ternaires y aurait tot ou tard affiche
     << null j >> : pas encore lue, jamais faite, illisible, ou datee.
     ⚠ LES SEUILS SONT DELIBERES : au-dela de 7 jours on avertit, au-dela de 30
     on alarme, et << jamais >> alarme tout de suite. Une base non sauvegardee
     ne doit pas se lire comme une ligne d information parmi d autres. */
  function tuileSauvegarde(){
    if (SAUV === null) {
      return tuile('sauvegarde', '💾', 'Dernière sauvegarde', '…', '', 'lecture en cours…', '');
    }
    if (SAUV.erreur) {
      return tuile('sauvegarde', '💾', 'Dernière sauvegarde', '—', '', esc(SAUV.erreur), 'att');
    }
    if (SAUV.aucune) {
      return tuile('sauvegarde', '💾', 'Dernière sauvegarde', 'jamais', 'err',
        'la base n’est pas protégée', 'att');
    }
    var j = SAUV.jours;
    // « jours » en toutes lettres (sa demande) : un « j » collé au chiffre se
    // lit mal dans une grande valeur, et rien n oblige a abreger ici.
    var val = (j === 0) ? 'aujourd’hui' : (j === 1 ? 'hier' : j + ' jours');
    var ton = (j > 30) ? 'err' : (j > 7 ? 'att' : '');
    var sous = esc(SAUV.quand) + (SAUV.taille ? ' · ' + esc(SAUV.taille) : '');
    return tuile('sauvegarde', '💾', 'Dernière sauvegarde', val, ton, sous, (j > 7 ? 'att' : ''));
  }

  function pilule(statut, libelle){
    var ton = { paid: 'bon', demo: 'bon', delivered: 'bon', shipped: 'bon',
      pending: 'att', unpaid: 'att', preparing: 'att', verification: 'att', confirmed: 'att',
      overdue: 'err', cancelled: 'err' }[statut] || 'neutre';
    return '<span class="pill ' + ton + '">' + esc(libelle || statut) + '</span>';
  }

  function tableRecent(titre, cibleTout, lignes){
    // Les 10 dernieres, d un bloc — la suite vit dans la fenetre native de la
    // chose, ouverte par << Tout voir >> dans son etat retenu (ancre/detache).
    var vue = lignes.slice(0, PAR_PAGE);
    var h = '<div class="carte"><h2>' + esc(titre)
      + '<button class="mini tout" data-ouvre="' + cibleTout + '">Tout voir →</button></h2>';
    if (!vue.length) {
      h += '<div class="vide">Aucune entrée.</div>';
    } else {
      h += '<table><thead><tr><th>Numéro</th><th>Client</th><th>Total</th><th>Statut</th></tr></thead><tbody>'
        + vue.map(function(r){
            // ⚠ CADENAS DYNAMIQUE (#38) : la case data-cad est remplie/videe par
            // le sondage des verrous, SANS redessiner le tableau. Une commande ET
            // une facture pointent vers le meme ID de commande (r.oid).
            return '<tr><td><span class="num">' + esc(r.numero) + '</span>'
              + '<span class="cadslot" data-cad="' + esc(r.oid || '') + '"></span>'
              + '<div class="dt">' + esc(fmtDate(r.date)) + '</div></td>'
              + '<td>' + esc(r.client || '—') + '</td>'
              + '<td>' + esc(fmt(r.total)) + '</td>'
              + '<td>' + pilule(r.statut, r.statutLibelle) + '</td></tr>';
          }).join('')
        + '</tbody></table>';
    }
    return h + '</div>';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var cfg = D.cfgTuiles || {};
    var t = D.tuiles;
    var f = D.aFaire || {};
    var h = '';

    h += '<div class="barreoutils">'
      + '<select id="tb-annee"><option value="all"' + (ANNEE === 'all' ? ' selected' : '') + '>Tout cumulé</option>'
      + (D.annees || []).map(function(a){
          return '<option value="' + a + '"' + (String(ANNEE) === String(a) ? ' selected' : '') + '>' + a + '</option>'; }).join('')
      + '</select>'
      + '<button class="mini" id="tb-tuiles" title="Afficher ou masquer des tuiles">⚙ Tuiles</button>'
      + '<span class="droite">' + esc(new Date().toLocaleDateString('fr-CA',
          { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })) + '</span>'
      + '</div>';

    // L avis de taux de change — seulement s il y a un probleme, comme le site.
    if (D.taux) {
      h += '<div class="avis"><span class="ic">💱</span> ' + (D.taux.genre === 'secours'
        ? '<strong>Taux de change indisponible.</strong> Les prix affichés en USD utilisent un taux '
          + 'de secours (1 USD = ' + Number(D.taux.rate).toFixed(4) + ' CAD), donc approximatif. '
          + 'Les commandes, elles, sont toujours facturées en dollars canadiens.'
        : '<strong>Taux de change vieux de ' + D.taux.ageHeures + ' h</strong> (relevé du '
          + esc(D.taux.quand || '') + ', 1 USD = ' + Number(D.taux.rate).toFixed(4) + ' CAD). '
          + 'Les prix en USD peuvent s’écarter du marché.') + '</div>';
    }

    /* ── LA BANDE << A FAIRE MAINTENANT >> (#25) ────────────────────────
       Le tableau de bord disait des TOTAUX ; il ne disait pas ce qui attend.
       Cette bande reunit les files qui se VIDENT en travaillant — pas les
       etats. Les ruptures de stock en sont donc absentes : elles ne se
       traitent pas en un clic, elles se commandent, et elles tiendraient la
       bande allumee en permanence. Meme raisonnement que la pastille de la
       barre des taches, qui exclut le stock pour la meme raison. */
    var files = [
      ['orders', f.aTraiter, 'commande à traiter', 'commandes à traiter', false],
      ['support-mgmt', t.messagerie, 'message sans réponse', 'messages sans réponse', false],
      ['returns-pending', t.retoursNouveaux, 'retour à traiter', 'retours à traiter', false],
      ['returns-expiring', t.retoursExpirent, 'retour sur le point d’expirer', 'retours sur le point d’expirer', true],
      ['reviews', f.avis, 'avis à modérer', 'avis à modérer', false],
      ['billing', f.facturesRetard, 'facture en retard', 'factures en retard', true],
      ['security-incidents', f.incidentsCai, 'avis à la CAI à transmettre', 'avis à la CAI à transmettre', true]
    ].filter(function(x){ return (x[1] || 0) > 0; });
    if (files.length) {
      h += '<div class="afaire"><span class="titre">À faire maintenant</span>'
        + files.map(function(x){
            return '<button data-ouvre="' + x[0] + '"' + (x[4] ? ' class="urgent"' : '') + '>'
              + '<b>' + x[1] + '</b> ' + esc(x[1] > 1 ? x[3] : x[2]) + '</button>';
          }).join('')
        + '</div>';
    }

    if (PANNEAU) {
      h += '<div class="panneau">'
        + TUILES.filter(offerte).map(function(x){
            return '<label><input type="checkbox" data-cfg="' + x[0] + '"'
              + (cfg[x[0]] !== false ? ' checked' : '') + '> ' + x[1] + ' ' + esc(x[2]) + '</label>';
          }).join('')
        + '</div>';
    }

    // Le meme contenu de tuiles que l ecran du site, valeur par valeur.
    var an = (ANNEE === 'all') ? '' : ' ' + ANNEE;
    var contenu = {
      products: tuile('products', '👗', 'Produits actifs', t.produits.actifs, '',
        t.produits.produitsBas
          ? t.produits.variantesReappro + ' variante' + (t.produits.variantesReappro > 1 ? 's' : '') + ' à réapprovisionner'
          : 'aucun réapprovisionnement',
        t.produits.produitsBas ? 'att' : ''),
      orders: tuile('orders', '📦', 'Commandes' + an, t.commandes.total, '',
        t.commandes.enAttente + ' en attente', t.commandes.enAttente > 0 ? 'att' : ''),
      customers: tuile('customers', '👥', 'Clients actifs', t.clients.actifs, '',
        t.clients.inactifs > 0 ? 'Comptes inactifs : ' + t.clients.inactifs : '&nbsp;', ''),
      revenue: tuile('revenue', '💰', 'Revenus (net)' + an, esc(fmt(t.revenus.net)), '',
        t.revenus.factures + ' factures encaissées'
          + (t.revenus.rembourse > 0 ? ' · −' + esc(fmt(t.revenus.rembourse)) + ' remboursés' : ''), ''),
      messagerie: tuile('messagerie', '💬', 'Messagerie', t.messagerie, t.messagerie > 0 ? 'att' : '',
        t.messagerie > 0
          ? 'nouveau' + (t.messagerie > 1 ? 'x' : '') + ' message' + (t.messagerie > 1 ? 's' : '') + ' en attente'
          : 'aucun message en attente', ''),
      returns_new: tuile('returns_new', '↩', 'Nouveaux retours', t.retoursNouveaux,
        t.retoursNouveaux > 0 ? 'att' : '',
        t.retoursNouveaux > 0
          ? 'demande' + (t.retoursNouveaux > 1 ? 's' : '') + ' à traiter'
          : 'aucune demande en attente', ''),
      returns_expiring: tuile('returns_expiring', '⏳', 'Retours sur le point d’expirer', t.retoursExpirent,
        t.retoursExpirent > 0 ? 'err' : '',
        t.retoursExpirent > 0 ? 'colis pas encore reçu' : 'aucun retour à risque', ''),
      // ── Ce qu il reste a faire (#25) ──────────────────────────────
      /* ⚠ PAS DE SOUS-TITRE ICI (retire a sa demande, 2026-08-14). Il enumerait
         les trois statuts comptes — un texte trop long pour la tuile, qui
         sortait tronque (<< confirmees, en preparation ou en ver... >>) et
         n apprenait rien de plus que le chiffre. Une ligne coupee au milieu
         d un mot coute plus d attention qu elle n en rend. */
      a_traiter: tuile('a_traiter', '🎯', 'Commandes à traiter', f.aTraiter,
        f.aTraiter > 0 ? 'att' : '', '&nbsp;', ''),
      en_livraison: tuile('en_livraison', '🚚', 'En livraison', f.enLivraison, '',
        f.enLivraison > 0 ? 'colis partis, pas encore livrés' : 'aucun colis en route', ''),
      // ⚠ SANS SOUS-TITRE, comme << Commandes a traiter >> (retire a sa demande,
      // 2026-08-14). Le chiffre et le titre suffisent ; la ligne du dessous
      // n ajoutait qu un commentaire, coupe des que la tuile retrecit.
      ruptures: tuile('ruptures', '🚫', 'Ruptures de stock', f.ruptures,
        f.ruptures > 0 ? 'err' : '', '&nbsp;', ''),
      avis: tuile('avis', '⭐', 'Avis à modérer', f.avis, f.avis > 0 ? 'att' : '',
        f.avis > 0 ? 'en attente d’approbation' : 'aucun avis en attente', ''),
      factures_retard: tuile('factures_retard', '⌛', 'Factures en retard', f.facturesRetard,
        f.facturesRetard > 0 ? 'err' : '',
        f.facturesRetard > 0 ? esc(fmt(f.facturesRetardMontant)) + ' impayés' : 'aucune échéance dépassée',
        f.facturesRetard > 0 ? 'att' : ''),
      incidents: tuile('incidents', '🛡', 'Incidents ouverts', f.incidentsOuverts,
        f.incidentsOuverts > 0 ? 'att' : '',
        f.incidentsCai > 0
          ? f.incidentsCai + ' avis à la CAI à transmettre'
          : (f.incidentsOuverts > 0 ? 'dossiers non clôturés' : 'registre Loi 25 à jour'),
        f.incidentsCai > 0 ? 'att' : ''),
      // ⚠ Elle arrive APRES le premier dessin (reseau) : d ici la, elle dit
      // qu elle cherche, plutot que d afficher un zero qui serait un mensonge.
      sauvegarde: tuileSauvegarde()
    };
    h += '<div class="tuiles">'
      + TUILES.filter(offerte).filter(function(x){ return cfg[x[0]] !== false; })
          .map(function(x){ return contenu[x[0]]; }).join('')
      + '</div>';

    h += '<div class="deux">'
      + tableRecent('Commandes récentes', 'orders', D.recentesCommandes || [])
      + tableRecent('Factures récentes', 'billing', D.recentesFactures || [])
      + '</div>';

    corps.innerHTML = h;
    appliquerVerrous();   // #38 : poser les cadenas connus sur le tableau frais
  }

  // Ecouteur delegue : tout est redessine, rien ne se perd.
  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var ou = t.closest('[data-ouvre]');
    if (ou) { ouvrir(ou.getAttribute('data-ouvre')); return; }
    if (t.closest('#tb-tuiles')) { PANNEAU = !PANNEAU; dessiner(); return; }
    var tu = t.closest('[data-tuile]');
    if (tu) {
      var cibles = { products: 'products', orders: 'orders', customers: 'customers',
        revenue: 'billing', messagerie: 'support-mgmt',
        returns_new: 'returns-pending', returns_expiring: 'returns-expiring',
        a_traiter: 'orders', en_livraison: 'orders', ruptures: 'inventory',
        avis: 'reviews', factures_retard: 'billing',
        incidents: 'security-incidents', sauvegarde: 'sauvegarde' };
      ouvrir(cibles[tu.getAttribute('data-tuile')] || '');
    }
  };
  corps.onchange = function(ev){
    var t = ev.target;
    if (!t) return;
    if (t.id === 'tb-annee') { ANNEE = t.value; charger(); return; }
    var k = t.getAttribute && t.getAttribute('data-cfg');
    if (k) {
      var cfg = (D && D.cfgTuiles) || {};
      cfg[k] = t.checked;
      D.cfgTuiles = cfg;
      dessiner();
      // La preference suit la personne (profil Turso), comme l ecran du site.
      appeler('tableau:tuiles', [cfg]).then(function(r){
        if (!r || !r.ok) dire(expliquer(r), 'err');
      });
    }
  };

  function ouvrir(cible){
    if (!cible) return;
    appeler('tableau:ouvrir', [cible]).then(function(r){
      if (!r || !r.ok) dire(expliquer(r), 'err');
      else dire('');
    });
  }

  function charger(){
    appeler('tableau:lire', [ANNEE]).then(function(r){
      if (!r || !r.ok) { vide('Tableau de bord indisponible', expliquer(r)); return; }
      D = r;
      dire('');
      dessiner();
      chargerSauvegarde();
    });
  }

  /* ⚠ SON ECHEC NE DOIT RIEN CASSER. Le reste du tableau de bord est deja
     dessine et ne depend pas d elle : un droit manquant ou un R2 injoignable
     remplit la tuile d une explication, il ne vide pas l ecran. Un refus de
     DROIT retire la tuile — annoncer l etat des sauvegardes a qui n y a pas
     acces n est pas une information, c est une fuite. */
  function chargerSauvegarde(forcer){
    /* ⚠ ELLE SE RELIT. Le premier jet ne lisait qu UNE SEULE FOIS (garde
       << SAUV !== null >>) : apres avoir cree une sauvegarde, la tuile
       continuait d annoncer << 16 jours >> et aucun rafraichissement n y
       changeait rien (signale le 2026-08-14). Le garde servait a ne pas
       rappeler le reseau a chaque redessin — c est maintenant une FRAICHEUR
       de quinze secondes qui s en charge, et un retour dans la fenetre force
       la relecture. Un indicateur qui ne bouge jamais ne rassure pas : il ment. */
    if (SAUV_EN_COURS) return;
    if (!forcer && SAUV !== null && (Date.now() - SAUV_QUAND) < 15000) return;
    SAUV_EN_COURS = true;
    appeler('tableau:sauvegarde', []).then(function(r){
      SAUV_EN_COURS = false; SAUV_QUAND = Date.now();
      if (r && r.ok) SAUV = r;
      else if (r && r.motif === 'droit') SAUV = { interdite: true };
      else SAUV = { aucune: false, jours: null, quand: '', taille: '', erreur: expliquer(r) };
      if (D) dessiner();
    });
  }

  /* ══ CADENAS DYNAMIQUE (#38) ══════════════════════════════════════════════
     Sondage leger des verrous 'orders' toutes les ~3 s : on pose/retire les
     cadenas SANS redessiner le tableau (pas de clignotement ni de perte de
     focus). Une commande ET sa facture pointent le meme ID de commande. */
  function cadInner(oid){
    if (!oid || !VERROUS[oid]) return '';
    var v = VERROUS[oid];
    var t = v.mine ? 'Vous tenez cette fiche en modification'
      : ('En traitement par ' + (v.par || 'un collegue'));
    return '<span class="cad' + (v.mine ? ' mine' : '') + '" title="' + esc(t) + '"><span class="ic">🔒</span></span>';
  }
  function appliquerVerrous(){
    var slots = document.querySelectorAll('.cadslot');
    for (var i = 0; i < slots.length; i++){
      slots[i].innerHTML = cadInner(slots[i].getAttribute('data-cad'));
    }
  }
  function chargerVerrous(){
    appeler('tableau:verrous', []).then(function(r){
      if (!r || !r.ok || !r.orders) return;
      VERROUS = r.orders;
      appliquerVerrous();
    });
  }
  function demarrerVerrous(){
    if (VERROU_TIMER) return;
    chargerVerrous();
    VERROU_TIMER = setInterval(chargerVerrous, 3000);
  }
  window.addEventListener('pagehide', function(){ if (VERROU_TIMER) { clearInterval(VERROU_TIMER); VERROU_TIMER = null; } });

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : une vente, un produit modifie ou
     un remboursement fait relire les chiffres sans geste — mais jamais pendant
     que le panneau des tuiles est ouvert (on redessinerait sous les doigts). */
  window.szActualiser = function(){
    if (PANNEAU) return;
    charger();
  };
  // Ramenee au premier plan par le menu : les chiffres se relisent.
  window.szRevenir = function(){ SAUV_QUAND = 0; charger(); };

  /* ── MODE ANCRE ── La coquille appelle szModeAncre(true) quand cette page
     vit DANS la fenetre principale : on offre alors << Detacher >>, qui
     emporte la vue — et tout son etat — dans une vraie fenetre. */
  /* \u26a0 LE TABLEAU DE BORD NE SE DETACHE PAS (demande du 2026-08-09) : c est
     l ecran d ouverture de session \u2014 detache, la fenetre principale n aurait
     qu un fond vide. Pas de bouton ; la coquille refuse aussi (dock:detacher,
     NON_DETACHABLES), pour que la regle tienne meme sans ce dessin. */
  window.szModeAncre = function(){
    var b = document.getElementById('sz-detacher');
    if (b) b.remove();
  };


  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
  demarrerVerrous();   // #38 : cadenas en direct sur les commandes/factures verrouillees
})();
</script>
</body></html>`;
}

module.exports = { pageTableau };
