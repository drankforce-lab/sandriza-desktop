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

const { JS_ACTIVITE, CSS_JOUR } = require('./socle.js');

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
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tuile .val{font:700 1.5rem/1.3 Georgia,serif}
.tuile .val.att{color:#fbbf24}.tuile .val.err{color:#f87171}
.tuile .sub{font-size:.7rem;color:#6d7f96;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tuile .sub.att{color:#fbbf24}
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
${JS_ACTIVITE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;            // les donnees du site (tableau:lire)
  var ANNEE = 'all';
  var PANNEAU = false;     // le panneau << Tuiles >> est ouvert
  var PAR_PAGE = 10;       // les 10 dernieres, d un bloc (demande du 2026-08-08)

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var _direT = null;
  function dire(t, cl){
    msg.className = 'msg' + (cl ? ' ' + cl : ''); msg.textContent = t || '';
    clearTimeout(_direT);
    /* Un message de SUCCES s'efface seul apres quelques secondes : il restait
       sinon a l'ecran pour toujours (2026-08-09, << Facture ouverte dans sa
       fenetre >>). Les ERREURS restent : on doit pouvoir les lire. */
    if (t && cl === 'bon') _direT = setTimeout(function(){
      if (msg.textContent === t) { msg.textContent = ''; msg.className = 'msg'; }
    }, 4000);
  }
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

  // Les memes tuiles que l ecran du site, dans le meme ordre — meme dictionnaire.
  var TUILES = [
    ['products', '👗', 'Produits actifs'],
    ['orders', '📦', 'Commandes'],
    ['customers', '👥', 'Clients actifs'],
    ['revenue', '💰', 'Revenus (payés)'],
    ['messagerie', '💬', 'Messagerie'],
    ['returns_new', '↩', 'Nouveaux retours'],
    ['returns_expiring', '⏳', 'Retours sur le point d’expirer']
  ];

  function tuile(cle, ic, lbl, valeur, ton, sousTitre, sousTon){
    return '<div class="tuile" data-tuile="' + cle + '">'
      + '<div class="lbl">' + ic + ' ' + esc(lbl) + '</div>'
      + '<div class="val' + (ton ? ' ' + ton : '') + '">' + valeur + '</div>'
      + '<div class="sub' + (sousTon ? ' ' + sousTon : '') + '">' + sousTitre + '</div></div>';
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
            return '<tr><td><span class="num">' + esc(r.numero) + '</span>'
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
      h += '<div class="avis">💱 ' + (D.taux.genre === 'secours'
        ? '<strong>Taux de change indisponible.</strong> Les prix affichés en USD utilisent un taux '
          + 'de secours (1 USD = ' + Number(D.taux.rate).toFixed(4) + ' CAD), donc approximatif. '
          + 'Les commandes, elles, sont toujours facturées en dollars canadiens.'
        : '<strong>Taux de change vieux de ' + D.taux.ageHeures + ' h</strong> (relevé du '
          + esc(D.taux.quand || '') + ', 1 USD = ' + Number(D.taux.rate).toFixed(4) + ' CAD). '
          + 'Les prix en USD peuvent s’écarter du marché.') + '</div>';
    }

    if (PANNEAU) {
      h += '<div class="panneau">'
        + TUILES.map(function(x){
            return '<label><input type="checkbox" data-cfg="' + x[0] + '"'
              + (cfg[x[0]] !== false ? ' checked' : '') + '> ' + x[1] + ' ' + esc(x[2]) + '</label>';
          }).join('')
        + '</div>';
    }

    // Le meme contenu de tuiles que l ecran du site, valeur par valeur.
    var an = (ANNEE === 'all') ? '' : ' — ' + ANNEE;
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
        t.retoursExpirent > 0 ? 'colis pas encore reçu' : 'aucun retour à risque', '')
    };
    h += '<div class="tuiles">'
      + TUILES.filter(function(x){ return cfg[x[0]] !== false; })
          .map(function(x){ return contenu[x[0]]; }).join('')
      + '</div>';

    h += '<div class="deux">'
      + tableRecent('Commandes récentes', 'orders', D.recentesCommandes || [])
      + tableRecent('Factures récentes', 'billing', D.recentesFactures || [])
      + '</div>';

    corps.innerHTML = h;
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
        returns_new: 'returns-pending', returns_expiring: 'returns-expiring' };
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
    });
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : une vente, un produit modifie ou
     un remboursement fait relire les chiffres sans geste — mais jamais pendant
     que le panneau des tuiles est ouvert (on redessinerait sous les doigts). */
  window.szActualiser = function(){
    if (PANNEAU) return;
    charger();
  };
  // Ramenee au premier plan par le menu : les chiffres se relisent.
  window.szRevenir = function(){ charger(); };

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
})();
</script>
</body></html>`;
}

module.exports = { pageTableau };
