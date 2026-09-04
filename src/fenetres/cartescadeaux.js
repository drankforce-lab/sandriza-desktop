'use strict';

/*
 * FENÊTRE « CARTES-CADEAUX » — NATIVE (1.63.0, palier 4)
 * =============================================================================
 * Le premier écran du Marketing à passer en natif. Trois tuiles (cartes
 * actives, solde en circulation, cartes entièrement utilisées), la liste avec
 * recherche et filtre par statut, le détail d'une carte avec son historique
 * d'utilisation, la création à la main, l'activation manuelle et le réglage de
 * la récompense à l'achat.
 *
 * ⚠ LA LISTE ATTEND LA RESYNCHRONISATION (cartescadeaux:liste est ASYNCHRONE,
 * comme les retours et la messagerie). Ce sont des SOLDES D'ARGENT : afficher
 * un chiffre périmé parce qu'on n'a pas voulu attendre deux secondes, c'est
 * envoyer quelqu'un encaisser une carte déjà vidée.
 *
 * ⚠ LE CODE D'UNE CARTE EST ENGENDRÉ PAR LE SITE, jamais ici. Deux
 * générateurs, c'est deux formats le jour où l'un des deux change.
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
  padding:.6rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input,select,button,textarea{font:inherit;color:var(--tx);background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
select,button{cursor:pointer}
input:focus,select:focus,button:focus,textarea:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-creme2);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:var(--tx-ok)}
.tuile .sub{font-size:.66rem;color:var(--tx2);margin-top:.1rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:var(--tx2);font-weight:700}
.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.55rem}
.ch{display:flex;flex-direction:column;gap:.22rem;min-width:0}
.ch label{font-size:.72rem;color:var(--tx2)}
.ch input,.ch select{width:100%}
.ch .req{color:var(--tx-or)}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody tr[data-id]{cursor:pointer}
tbody tr:hover td{background:rgba(255,255,255,.04)}
tbody td{padding:.32rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
.num{font-family:'Courier New',monospace;text-align:right;white-space:nowrap}
.code{font-family:'Courier New',monospace;letter-spacing:1px;background:rgba(255,255,255,.06);
  border-radius:4px;padding:.06rem .35rem}
.dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx2)}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:38rem;width:100%;max-height:86vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .6rem;font:700 .98rem/1.3 Georgia,serif;display:flex;
  align-items:center;gap:.5rem;flex-wrap:wrap}
.boite .pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.85rem;flex-wrap:wrap}
.avis{font-size:.78rem;line-height:1.5;border-radius:9px;padding:.55rem .7rem;
  background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.4);margin-top:.6rem}
.vide{padding:1.3rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Cartes-cadeaux ». */
function pageCartesCadeaux() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Cartes-cadeaux — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.giftcards}</span><h1>Cartes-cadeaux</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement… (les cartes se resynchronisent)</div></div>
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
  var STATUT = '';
  var BOITE = null;        // null | 'creer' | 'recompense' | detail
  var DETAIL = null;

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

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux cartes-cadeaux.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette carte n’existe plus.',
    montant:            'Le montant doit être d’au moins 1 $.',
    destinataire:       'Le nom et un courriel valide du destinataire sont requis.',
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

  var TONS = { active: 'bon', used: 'neutre', expired: 'err', pending: 'att' };

  function filtrees(){
    var q = Q.trim().toLowerCase();
    return (D.cartes || []).filter(function(g){
      if (STATUT && g.statut !== STATUT) return false;
      if (!q) return true;
      return (String(g.code) + ' ' + String(g.destinataire) + ' ' + String(g.courriel)
        + ' ' + String(g.expediteur)).toLowerCase().indexOf(q) !== -1;
    });
  }

  function boiteCreer(){
    return '<div class="voile" id="cc-voile"><div class="boite">'
      + '<h3>Créer une carte-cadeau</h3>'
      + '<div class="grille">'
      + '<div class="ch"><label>Montant <span class="req">*</span></label>'
      + '<input type="number" id="cc-montant" min="1" max="5000" step="0.01" placeholder="50.00"></div>'
      + '<div class="ch"><label>Statut</label><select id="cc-statut">'
      + '<option value="active">Active (prête à utiliser)</option>'
      + '<option value="pending">En attente d’activation</option></select></div>'
      + '<div class="ch"><label>Nom du destinataire <span class="req">*</span></label>'
      + '<input id="cc-dest" placeholder="Marie"></div>'
      + '<div class="ch"><label>Courriel du destinataire <span class="req">*</span></label>'
      + '<input type="email" id="cc-mail" placeholder="marie@exemple.com"></div>'
      + '<div class="ch"><label>Expéditeur</label><input id="cc-exp" placeholder="la boutique"></div>'
      + '<div class="ch"><label>Note interne</label><input id="cc-note" placeholder="Cadeau, correction…"></div>'
      + '</div>'
      + '<div class="pied-boite"><button class="mini" id="cc-annuler">Annuler</button>'
      + '<button class="mini prim" id="cc-creer">Créer la carte</button></div>'
      + '</div></div>';
  }

  function boiteRecompense(){
    var c = D.recompense || {};
    return '<div class="voile" id="cc-voile"><div class="boite">'
      + '<h3>Récompense à l’achat d’une carte</h3>'
      + '<div style="font-size:.8rem;color:var(--tx2);margin-bottom:.6rem">'
      + 'Un code promotionnel est remis à qui achète une carte-cadeau.</div>'
      + '<div class="grille">'
      + '<div class="ch"><label>Activer</label><select id="cc-r-on">'
      + '<option value="1"' + (c.enabled ? ' selected' : '') + '>Oui</option>'
      + '<option value="0"' + (!c.enabled ? ' selected' : '') + '>Non</option></select></div>'
      + '<div class="ch"><label>Type</label><select id="cc-r-type">'
      + '<option value="percent"' + ((c.type || 'percent') === 'percent' ? ' selected' : '') + '>Pourcentage (%)</option>'
      + '<option value="fixed"' + (c.type === 'fixed' ? ' selected' : '') + '>Montant fixe ($)</option></select></div>'
      + '<div class="ch"><label>Valeur</label>'
      + '<input type="number" id="cc-r-val" min="1" value="' + esc(c.value || 10) + '"></div>'
      + '<div class="ch"><label>Validité du code (jours)</label>'
      + '<input type="number" id="cc-r-exp" min="1" value="' + esc(c.expiryDays || 30) + '"></div>'
      + '</div>'
      + '<div class="pied-boite"><button class="mini" id="cc-annuler">Annuler</button>'
      + '<button class="mini prim" id="cc-r-enr">Enregistrer</button></div>'
      + '</div></div>';
  }

  function boiteDetail(){
    var g = DETAIL;
    if (!g) return '';
    var h = '<div class="voile" id="cc-voile"><div class="boite">'
      + '<h3><span class="code">' + esc(g.code) + '</span>'
      + '<span class="pill ' + (TONS[g.statut] || 'neutre') + '">'
      + esc({ active: 'Active', used: 'Utilisée', expired: 'Expirée', pending: 'Activation requise' }[g.statut] || g.statut)
      + '</span></h3>'
      + '<div class="grille" style="margin-bottom:.6rem">'
      + '<div class="ch"><label>Destinataire</label><div>' + esc(g.destinataire || '—')
      + '<div class="dt">' + esc(g.courriel || '') + '</div></div></div>'
      + '<div class="ch"><label>Expéditeur</label><div>' + esc(g.expediteur || '—') + '</div></div>'
      + '<div class="ch"><label>Valeur initiale</label><div>' + fmt(g.initial) + '</div></div>'
      + '<div class="ch"><label>Solde restant</label>'
      + '<div style="font-weight:800;color:' + (g.solde > 0 ? '#4ade80' : '#8fa1b8') + '">'
      + fmt(g.solde) + '</div></div>'
      + '<div class="ch"><label>Émise le</label><div>' + esc(g.date) + '</div></div>'
      + '</div>';
    if (g.message) {
      h += '<div class="ch"><label>Message</label><div style="font-style:italic;color:var(--tx2)">'
        + esc(g.message) + '</div></div>';
    }
    if (g.note) {
      h += '<div class="ch" style="margin-top:.4rem"><label>Note interne</label><div>' + esc(g.note) + '</div></div>';
    }
    if (g.statut === 'pending') {
      h += '<div class="avis">En attente d’activation — un courriel est parti'
        + (g.courrielExpediteur ? ' à ' + esc(g.courrielExpediteur) : '')
        + '. Si l’acheteur ne l’a jamais reçu, activez la carte à la main ci-dessous.</div>';
    }
    h += '<h3 style="margin-top:.9rem;font-size:.9rem">Historique d’utilisation</h3>';
    if (!g.transactions.length) {
      h += '<div class="vide" style="padding:.7rem">Carte jamais utilisée.</div>';
    } else {
      h += '<table><thead><tr><th>Date</th><th>Commande</th>'
        + '<th class="num">Montant</th><th class="num">Solde après</th></tr></thead><tbody>'
        + g.transactions.map(function(x){
            return '<tr><td>' + esc(x.date) + '</td><td>' + esc(x.commande || '—') + '</td>'
              + '<td class="num" style="color:var(--tx-err)">−' + fmt(x.montant) + '</td>'
              + '<td class="num">' + fmt(x.soldeApres) + '</td></tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '<div class="pied-boite">'
      + (g.statut === 'pending' && D.peutModifier
          ? '<button class="mini prim" id="cc-activer">Activer à la main</button>' : '')
      + '<button class="mini" id="cc-annuler">Fermer</button></div>'
      + '</div></div>';
    return h;
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var rows = filtrees();
    var t = D.tuiles;

    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">Cartes actives</div><div class="val">' + t.actives
      + '</div><div class="sub">' + t.total + ' au total</div></div>'
      + '<div class="tuile"><div class="lbl">Solde en circulation</div><div class="val bon">'
      + fmt(t.enCirculation) + '</div><div class="sub">sur ' + fmt(t.emis) + ' émis</div></div>'
      + '<div class="tuile"><div class="lbl">Entièrement utilisées</div><div class="val">'
      + t.utilisees + '</div></div>'
      + '</div>';

    h += '<div class="barreoutils">'
      + '<input type="search" id="cc-q" placeholder="Code, destinataire, courriel…" value="' + esc(Q) + '">'
      + '<select id="cc-f-statut">'
      + '<option value="">Tous les statuts</option>'
      + '<option value="active"' + (STATUT === 'active' ? ' selected' : '') + '>Actives</option>'
      + '<option value="pending"' + (STATUT === 'pending' ? ' selected' : '') + '>Activation requise</option>'
      + '<option value="used"' + (STATUT === 'used' ? ' selected' : '') + '>Utilisées</option>'
      + '<option value="expired"' + (STATUT === 'expired' ? ' selected' : '') + '>Expirées</option>'
      + '</select>'
      + '<div class="droite">'
      + '<button class="mini" id="cc-recompense">Récompense à l’achat</button>'
      + (D.peutModifier ? '<button class="mini prim" id="cc-nouvelle">+ Créer une carte</button>' : '')
      + '<span>' + rows.length + ' carte' + (rows.length > 1 ? 's' : '') + '</span>'
      + '</div></div>';

    h += '<div class="carte">';
    if (!rows.length) {
      h += '<div class="vide">' + (Q || STATUT ? 'Rien ne correspond.' : 'Aucune carte-cadeau.') + '</div>';
    } else {
      h += '<table><thead><tr><th>Code</th><th>Destinataire</th><th class="num">Valeur</th>'
        + '<th class="num">Solde</th><th>Acheteur</th><th>Date</th><th>Statut</th></tr></thead><tbody>'
        + rows.map(function(g){
            return '<tr data-id="' + esc(g.id) + '" title="Voir le détail">'
              + '<td><span class="code">' + esc(g.code) + '</span></td>'
              + '<td>' + esc(g.destinataire || '—') + '<div class="dt">' + esc(g.courriel || '') + '</div></td>'
              + '<td class="num">' + fmt(g.initial) + '</td>'
              + '<td class="num" style="font-weight:700;color:' + (g.solde > 0 ? '#4ade80' : '#8fa1b8') + '">'
              + fmt(g.solde) + '</td>'
              + '<td>' + esc(g.expediteur || '—') + '</td>'
              + '<td class="dt">' + esc(g.date) + '</td>'
              + '<td><span class="pill ' + (TONS[g.statut] || 'neutre') + '">' + esc(g.statutLibelle) + '</span>'
              + (g.courrielEnvoye ? ' <span class="pill neutre">courriel ✓</span>' : '') + '</td></tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';

    if (BOITE === 'creer') h += boiteCreer();
    else if (BOITE === 'recompense') h += boiteRecompense();
    else if (BOITE === 'detail') h += boiteDetail();

    corps.innerHTML = h;
    brancher();
  }

  function brancher(){
    var q = document.getElementById('cc-q');
    if (q) q.oninput = function(){ Q = q.value; redessinerSansPerdreLaSaisie(); };
    var fs = document.getElementById('cc-f-statut');
    if (fs) fs.onchange = function(){ STATUT = fs.value; dessiner(); };
    var bn = document.getElementById('cc-nouvelle');
    if (bn) bn.onclick = function(){ BOITE = 'creer'; dessiner(); szBrouillonProposer(); };
    var br = document.getElementById('cc-recompense');
    if (br) br.onclick = function(){ BOITE = 'recompense'; dessiner(); };
    var ba = document.getElementById('cc-annuler');
    if (ba) ba.onclick = fermerBoite;
    var vo = document.getElementById('cc-voile');
    if (vo) vo.onclick = function(ev){ if (ev.target === vo) fermerBoite(); };

    var bc = document.getElementById('cc-creer');
    if (bc) bc.onclick = function(){
      bc.disabled = true;
      appeler('cartescadeaux:creer', [{
        montant: (document.getElementById('cc-montant') || {}).value,
        destinataire: (document.getElementById('cc-dest') || {}).value,
        courriel: (document.getElementById('cc-mail') || {}).value,
        expediteur: (document.getElementById('cc-exp') || {}).value,
        note: (document.getElementById('cc-note') || {}).value,
        statut: (document.getElementById('cc-statut') || {}).value
      }]).then(function(r){
        bc.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        szBrouillonJeter();
        BOITE = null;
        dire('Carte créée — code ' + r.code + '.', 'bon');
        charger();
      });
    };

    var bre = document.getElementById('cc-r-enr');
    if (bre) bre.onclick = function(){
      bre.disabled = true;
      appeler('cartescadeaux:recompense', [{
        enabled: (document.getElementById('cc-r-on') || {}).value === '1',
        type: (document.getElementById('cc-r-type') || {}).value,
        value: (document.getElementById('cc-r-val') || {}).value,
        expiryDays: (document.getElementById('cc-r-exp') || {}).value
      }]).then(function(r){
        bre.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        BOITE = null;
        dire('Récompense enregistrée.', 'bon');
        charger();
      });
    };

    var bac = document.getElementById('cc-activer');
    if (bac) bac.onclick = function(){
      bac.disabled = true;
      appeler('cartescadeaux:activer', [DETAIL && DETAIL.id]).then(function(r){
        bac.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        BOITE = null;
        dire('Carte ' + (r.code || '') + ' activée.', 'bon');
        charger();
      });
    };
  }

  /* ══ LE BROUILLON DE LA CARTE-CADEAU ════════════════════════
     Six champs, dont le nom et le courriel d une destinataire — recopies depuis
     une commande ou un courriel, donc penibles a retrouver. Ils ne vivent que
     dans la boite, qui se ferme au moindre clic a cote.
     ⚠ SEULE LA CREATION EST GARDEE. Les deux autres boites (la recompense de
     fidelisation, le detail d une carte) montrent un reglage ou une fiche
     existants : un brouillon y ferait concurrence a ce qui est deja enregistre
     sans qu on sache lequel des deux fait foi. C est la meme regle que pour
     l assistant Produit. */
  var BR_CHAMPS = ['cc-montant', 'cc-statut', 'cc-dest', 'cc-mail', 'cc-exp', 'cc-note'];
  szBrouillonBrancher({
    portee: 'cartecadeau',
    libelle: 'Une carte-cadeau',
    ttlMin: 720,
    cle: function(){ return '__new__'; },
    actif: function(){ return BOITE === 'creer'; },
    valeurs: function(){ return szBrouillonDuDom(BR_CHAMPS, []); },
    rempli: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, []); if (!v) return false;
      /* Le statut est une liste deroulante avec un defaut : il ne dit pas qu on a
         commence a travailler. */
      return szBrouillonQuelqueChose(v, ['cc-montant', 'cc-dest', 'cc-mail', 'cc-exp', 'cc-note']);
    },
    remplir: function(v){ szBrouillonAuDom(v); },
  });
  szBrouillonEcouter();

  /* ⚠ TOUS LES CHEMINS DE FERMETURE DE LA BOITE PASSENT PAR ICI (le bouton
     Annuler, le clic a cote, la touche Echap) : une seule ligne suffit donc, et
     l ecriture est IMMEDIATE, avec les valeurs prises AVANT que la boite ne
     disparaisse. C est le defaut n°1 des Depenses, qui ne gardait que la
     categorie parce que l ecriture etait differee de trois secondes. */
  function fermerBoite(){ szBrouillonMaintenant(); BOITE = null; DETAIL = null; dessiner(); }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('cc-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('cc-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('.boite')) return;
    var tr = t.closest('tr[data-id]');
    if (!tr) return;
    appeler('cartescadeaux:lire', [tr.getAttribute('data-id')]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      DETAIL = r.carte; BOITE = 'detail'; dessiner();
    });
  });

  function charger(){
    appeler('cartescadeaux:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Cartes-cadeaux indisponibles', expliquer(r)); return; }
      D = r;
      if (sous) sous.textContent = D.peutModifier ? '' : 'consultation seulement';
      dessiner();
    });
  }

  window.szActualiser = function(){
    var q = document.getElementById('cc-q');
    if (q && document.activeElement === q && q.value) return;
    if (BOITE) return;      // on ne redessine pas sous une boîte ouverte
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
        + 'border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);'
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
      if (BOITE) { fermerBoite(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageCartesCadeaux };
