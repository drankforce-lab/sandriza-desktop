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

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('cartescadeaux');

const CSS = `
.sz-fiche-corps:has(.cc-apercu-sect){align-items:stretch!important}
.sz-fiche-col:has(.cc-apercu-sect){display:flex!important;flex-direction:column;align-self:stretch}
.cc-apercu-sect{flex:1 1 auto;display:flex;flex-direction:column}
.cc-apercu-sect #cc-apercu{flex:1 1 auto;display:flex;align-items:center;justify-content:center}
.cc-apercu-sect #cc-apercu > *{width:100%;max-width:26rem}

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
/* Aucune glissiere (2026-10-12) : la liste se pagine (data-pages, JS_PAGES du socle). */
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow:hidden;
  display:flex;flex-direction:column;gap:.7rem}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input,select,button,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
select,button{cursor:pointer}
input:focus,select:focus,button:focus,textarea:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:.5rem .65rem}
/* La jauge de solde restant (refonte du 2026-09-25) : la part de la carte qui
   reste a depenser. */
/* Les colonnes chiffrees gardent la police des autres modules refaits. */
th.num,td.num{font-family:inherit}
.jaugec{height:5px;border-radius:3px;background:var(--v10);margin-top:.35rem;max-width:7rem;overflow:hidden;margin-left:auto}
.jaugec i{display:block;height:100%;border-radius:3px;background:color-mix(in srgb,var(--tx-ok,#4ade80) 55%,transparent)}
.tuile .lbl{font-size:.6875rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:var(--tx-ok)}
.tuile .sub{font-size:.6875rem;color:var(--tx2);margin-top:.1rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:var(--tx2);font-weight:700}
.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.55rem}
.ch{display:flex;flex-direction:column;gap:.22rem;min-width:0}
.ch label{font-size:.72rem;color:var(--tx2)}
.ch input,.ch select{width:100%}
.ch .req{color:var(--tx-or)}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody tr[data-id]{cursor:pointer}
tbody tr:hover td{background:var(--v04)}
tbody td{padding:.32rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
/* Refonte fine (2026-09-26) : un MONTANT n est pas un code — chiffres alignes
   dans la police de l ecran ; la chasse fixe reste aux codes (rf-code). */
.num{font-variant-numeric:tabular-nums;font-weight:700;text-align:right;white-space:nowrap}
.code{font-family:'Courier New',monospace;letter-spacing:1px;background:var(--v06);
  border-radius:4px;padding:.06rem .35rem}
.dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.6875rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:var(--f-carte2);border:1px solid var(--v14);border-radius:13px;
  max-width:38rem;width:100%;max-height:86vh;overflow:auto;padding:.9rem 1rem}
/* La fiche d une carte : son historique grandit a chaque achat. La boite devient
   une colonne bornee (86vh) et l historique s y pagine au lieu de defiler (2026-10-12). */
.boite.fiche-cc{display:flex;flex-direction:column;overflow:hidden}
.boite.fiche-cc>*{flex:0 0 auto}
.boite.fiche-cc>[data-pages]{flex:0 1 auto;min-height:4.5rem}
.boite h3{margin:0 0 .6rem;font:700 .98rem/1.3 Georgia,serif;display:flex;
  align-items:center;gap:.5rem;flex-wrap:wrap}
.boite .pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.85rem;flex-wrap:wrap}
.avis{font-size:.78rem;line-height:1.5;border-radius:9px;padding:.55rem .7rem;
  background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.4);margin-top:.6rem}
.vide{padding:1.3rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
/* La carte-cadeau en apercu (2026-10-04). */
.gc-rapides{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:.3rem;margin-top:.45rem}
.gc-rapide{min-width:0;padding-left:.2rem!important;padding-right:.2rem!important;font-size:.72rem!important}
.gc-carte{position:relative;border-radius:14px;padding:1.1rem 1.2rem 1rem;min-height:11rem;color:#f7efe2;
  background:linear-gradient(135deg,#1c2541 0%,#2a3358 55%,#8f6f42 140%);box-shadow:0 8px 24px rgba(0,0,0,.35);
  display:flex;flex-direction:column;gap:.35rem;overflow:hidden}
.gc-carte::after{content:"";position:absolute;right:-2.5rem;top:-2.5rem;width:9rem;height:9rem;border-radius:50%;
  border:1px solid rgba(240,214,160,.35)}
.gc-marque{font:700 .78rem/1 Georgia,serif;letter-spacing:.32em;color:#f0d6a0}
.gc-montant{font-size:2rem;font-weight:800;margin-top:auto;font-variant-numeric:tabular-nums}
.gc-pour{font-size:.84rem}
.gc-de{font-size:.74rem;color:rgba(247,239,226,.75)}
/* La liste refaite (2026-10-15, lot B) : un rang par carte, qui commence par la carte elle-meme en petit. */
.cc-rang{grid-template-columns:minmax(0,1.9fr) 10rem minmax(0,1fr) minmax(0,1fr) 1.2rem;cursor:pointer}
.gc-mini{flex:0 0 auto;width:6.6rem;height:4.1rem;border-radius:9px;padding:.45rem .6rem;display:flex;flex-direction:column;justify-content:space-between;
  color:#f7efe2;background:linear-gradient(135deg,#1c2541 0%,#2a3358 55%,#8f6f42 140%);box-shadow:0 4px 12px rgba(0,0,0,.3)}
.gc-mini b{font:700 .5rem/1 Georgia,serif;letter-spacing:.24em;color:#f0d6a0}
.gc-mini strong{font-size:.9rem;font-weight:800;font-variant-numeric:tabular-nums}
.cc-rang.eteinte .gc-mini{filter:grayscale(.85)}
.cc-rang .bilan small{font-size:.76rem;font-weight:500;color:var(--tx2)}
.cc-rang .jaugec{margin-top:.3rem;width:100%}
.cc-rang .etat{flex-direction:row;flex-wrap:wrap;gap:.35rem}
.cc-ouvrir{font-size:1.3rem;color:var(--tx2);text-align:center}
.cc-rang:hover .cc-ouvrir{color:var(--tx)}
`;

/** Page complète de la fenêtre native « Cartes-cadeaux ». */
function pageCartesCadeaux() {
  return `${TETE()}
<title>${T("Cartes-cadeaux — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.giftcards}</span><h1>${T("Cartes-cadeaux")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide charge">${T("Chargement… (les cartes se resynchronisent)")}</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_BROUILLON()}${JS_TUILES('cartescadeaux')}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var Q = '';
  var STATUT = '';
  var BOITE = null;        // null | 'creer' | 'recompense' | detail
  var DETAIL = null;
  /* (2026-10-19, audit — lot VOLUME 2) LA PAGE EST FAITE PAR LE COEUR : { page, parPage, q, statut } →
     la page, le vrai total, les tuiles sur TOUTES les cartes. Ancien site (sans pagine) : filtre local. */
  var PG = 0, PAR_PAGE = 50, MINU_Q = null;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function fmt(n){
    return szArgent(n);   /* voir szArgent (socle) : le repli aussi place le symbole */
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux cartes-cadeaux.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cette carte n’existe plus.")}',
    montant:            '${T("Le montant doit être d’au moins 1 $.")}',
    destinataire:       '${T("Le nom et un courriel valide du destinataire sont requis.")}',
    // (2026-10-25, audit) Les bornes du serveur pour la recompense (il refuse au-dela, et rien ne partait).
    pct_max:            '${T("Un pourcentage de récompense ne peut pas dépasser 90 %.")}',
    valeur_max:         '${T("Une récompense en montant fixe ne peut pas dépasser 1 000 $.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  // (2026-10-25, audit) Texte BRUT : szDire / ferr l ecrivent en textContent (echappe, « & » s y lisait « &amp; »).
  // Ce qui part dans du HTML est echappe a l endroit ou on l y met.
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').');
    if (r && r.detail) t += ' (' + String(r.detail).slice(0, 140) + ')';
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

  /* La pastille a point (rf-pill, refonte du 2026-09-25) : active en vert,
     activation requise en ambre, expiree en rouge, utilisee en gris. */
  var TONS = { active: 'vert', used: '', expired: 'rouge', pending: 'ambre' };
  function initiales(nom){
    var m = String(nom || '').trim().split(' ').filter(Boolean);
    if (!m.length || m[0] === '—') return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
  }

  function filtrees(){
    if (D && D.pagine) return D.cartes || [];   // deja filtrees et coupees par le coeur
    var q = Q.trim().toLowerCase();
    return (D.cartes || []).filter(function(g){
      if (STATUT && g.statut !== STATUT) return false;
      if (!q) return true;
      return (String(g.code) + ' ' + String(g.destinataire) + ' ' + String(g.courriel)
        + ' ' + String(g.expediteur)).toLowerCase().indexOf(q) !== -1;
    });
  }

  /* ══ RELOOKING 2026 (2026-10-04) ══════════════════════════════════════════
     Creation : la carte a gauche (montant avec montants rapides, statut, note),
     le destinataire a droite, et l APERCU de la carte telle qu elle partira.
     Recompense : << Activer >> devient un interrupteur. Les identifiants des
     champs ne changent pas (lecture, brouillon) ; cc-r-on est lu par .checked. */
  var MONTANTS_RAPIDES = [25, 50, 75, 100, 150, 200];
  function apercuCarte(montant, dest, exp){
    var m = parseFloat(String(montant || '').replace(',', '.'));
    return '<div class="gc-carte"><div class="gc-marque">SANDRIZA</div>'
      + '<div class="gc-montant">' + (m > 0 ? fmt(m) : szArgentSymbole('—')) + '</div>'   // (2026-10-25, audit) « $— » en anglais
      + '<div class="gc-pour">${T("Pour")} <strong>' + esc(dest || '${T("le destinataire")}') + '</strong></div>'
      + '<div class="gc-de">${T("De la part de")} ' + esc(exp || '${T("la boutique")}') + '</div></div>';
  }
  function boiteCreer(){
    return '<div class="voile" id="cc-voile"><div class="boite sz-fiche" role="dialog" aria-modal="true" style="max-width:56rem">'
      + '<div class="sz-fiche-tete"><h3>${T("Créer une carte-cadeau")}</h3>'
      + '<span class="st">${T("Le code est engendré à la création et envoyé au destinataire.")}</span></div>'
      + '<div class="sz-fiche-corps"><div class="sz-fiche-col">'
      + '<section class="sz-sect"><h4>${T("La carte")}</h4>'
      + '<div class="ch"><label>${T("Montant")} <span class="req">*</span></label>'
      /* ⚠ L etiquette porte un <span class="req">*</span> : elle N EST PAS un
         texte pur, et aucune lecture par motif ne pouvait la reprendre. Le nom
         est ecrit ici, sans l asterisque — << obligatoire >> se dit au champ par
         l attribut required, pas dans son nom. */
      + '<input type="number" id="cc-montant" aria-label="${T("Montant")}" min="1" max="5000" step="0.01" placeholder="50.00"></div>'
      + '<div class="gc-rapides">' + MONTANTS_RAPIDES.map(function(v){
          return '<button type="button" class="mini gc-rapide" data-montant="' + v + '">' + fmt(v) + '</button>'; }).join('') + '</div>'
      + '<div class="sz-g2" style="margin-top:.6rem">'
      + '<div class="ch"><label for="cc-statut">${T("Statut")}</label><select id="cc-statut">'
      + '<option value="active">${T("Active (prête à utiliser)")}</option>'
      + '<option value="pending">${T("En attente d’activation")}</option></select></div>'
      + '<div class="ch"><label for="cc-note">${T("Note interne")}</label><input id="cc-note" placeholder="${T("Cadeau, correction…")}"></div>'
      + '</div></section>'
      + '<section class="sz-sect"><h4>${T("Le destinataire")}</h4><div class="sz-g2">'
      + '<div class="ch"><label>${T("Nom du destinataire")} <span class="req">*</span></label>'
      + '<input id="cc-dest" aria-label="${T("Nom du destinataire")}" placeholder="${T("Marie")}"></div>'
      + '<div class="ch"><label>${T("Courriel du destinataire")} <span class="req">*</span></label>'
      + '<input type="email" id="cc-mail" aria-label="${T("Courriel du destinataire")}" placeholder="${T("marie@exemple.com")}"></div>'
      + '<div class="ch"><label for="cc-exp">${T("Expéditeur")}</label><input id="cc-exp" placeholder="${T("la boutique")}"></div>'
      + '</div></section>'
      + '</div><div class="sz-fiche-col">'
      /* L APERÇU S ETIRE SUR TOUTE LA HAUTEUR (2026-10-11, lisibilité étape 2) : seul dans sa colonne, il
         laissait un grand vide sous lui ; la carte est maintenant centrée dans une section aussi haute
         que la colonne de gauche. */
      + '<section class="sz-sect cc-apercu-sect"><h4>${T("Aperçu")}</h4><div id="cc-apercu">' + apercuCarte('', '', '') + '</div></section>'
      + '</div></div>'
      + '<div class="pied-boite"><button class="mini" id="cc-annuler">${T("Annuler")}</button>'
      + '<button class="mini prim" id="cc-creer">${T("Créer la carte")}</button></div>'
      + '</div></div>';
  }
  function brancherApercuCarte(){
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    var maj = function(){ var z = document.getElementById('cc-apercu'); if (z) z.innerHTML = apercuCarte(v('cc-montant'), v('cc-dest'), v('cc-exp')); };
    ['cc-montant', 'cc-dest', 'cc-exp'].forEach(function(id){ var e = document.getElementById(id); if (e) e.addEventListener('input', maj); });
    [].forEach.call(document.querySelectorAll('.gc-rapide'), function(bt){
      bt.onclick = function(){ var m = document.getElementById('cc-montant'); if (m) { m.value = bt.getAttribute('data-montant'); m.dispatchEvent(new Event('input')); } };
    });
    maj();
  }

  function boiteRecompense(){
    var c = D.recompense || {};
    return '<div class="voile" id="cc-voile"><div class="boite sz-fiche" role="dialog" aria-modal="true" style="max-width:38rem">'
      + '<div class="sz-fiche-tete"><h3>${T("Récompense à l’achat d’une carte")}</h3>'
      + '<span class="st">${T("Un code promotionnel est remis à qui achète une carte-cadeau.")}</span></div>'
      + '<div class="sz-fiche-corps" style="grid-template-columns:minmax(0,1fr)"><div class="sz-fiche-col">'
      + szInter('cc-r-on', '${T("Activer")}', '${T("Chaque achat de carte-cadeau en boutique reçoit un code de réduction.")}', !!c.enabled)
      + '<section class="sz-sect"><h4>${T("Le code remis")}</h4><div class="sz-g2">'
      + '<div class="ch"><label for="cc-r-type">${T("Type")}</label><select id="cc-r-type">'
      + '<option value="percent"' + ((c.type || 'percent') === 'percent' ? ' selected' : '') + '>${T("Pourcentage (%)")}</option>'
      + '<option value="fixed"' + (c.type === 'fixed' ? ' selected' : '') + '>${T("Montant fixe ($)")}</option></select></div>'
      + '<div class="ch"><label for="cc-r-val">${T("Valeur")}</label>'
      + '<input type="number" id="cc-r-val" min="1" max="' + (c.type === 'fixed' ? '1000' : '90') + '" value="' + esc(c.value || 10) + '"></div>'
      + '<div class="ch"><label for="cc-r-exp">${T("Validité du code (jours)")}</label>'
      + '<input type="number" id="cc-r-exp" min="1" value="' + esc(c.expiryDays || 30) + '"></div>'
      + '</div></section></div></div>'
      + '<div class="pied-boite"><button class="mini" id="cc-annuler">${T("Annuler")}</button>'
      + '<button class="mini prim" id="cc-r-enr">${T("Enregistrer")}</button></div>'
      + '</div></div>';
  }

  function boiteDetail(){
    var g = DETAIL;
    if (!g) return '';
    var h = '<div class="voile" id="cc-voile"><div class="boite fiche-cc">'
      + '<h3><span class="code">' + esc(g.code) + '</span>'
      + '<span class="pill ' + (TONS[g.statut] || 'neutre') + '">'
      + esc({ active: '${T("Active")}', used: '${T("Utilisée")}', expired: '${T("Expirée")}', pending: '${T("Activation requise")}' }[g.statut] || g.statut)
      + '</span></h3>'
      + '<div class="grille" style="margin-bottom:.6rem">'
      + '<div class="ch"><label>${T("Destinataire")}</label><div>' + esc(g.destinataire || '—')
      + '<div class="dt">' + esc(g.courriel || '') + '</div></div></div>'
      + '<div class="ch"><label>${T("Expéditeur")}</label><div>' + esc(g.expediteur || '—') + '</div></div>'
      + '<div class="ch"><label>${T("Valeur initiale")}</label><div>' + fmt(g.initial) + '</div></div>'
      + '<div class="ch"><label>${T("Solde restant")}</label>'
      + '<div style="font-weight:800;color:' + (g.solde > 0 ? 'var(--tx-ok)' : 'var(--tx2)') + '">'
      + fmt(g.solde) + '</div></div>'
      + '<div class="ch"><label>${T("Émise le")}</label><div>' + esc(szQuand(g.date)) + '</div></div>'
      + '</div>';
    if (g.message) {
      h += '<div class="ch"><label>${T("Message")}</label><div style="font-style:italic;color:var(--tx2)">'
        + esc(g.message) + '</div></div>';
    }
    if (g.note) {
      h += '<div class="ch" style="margin-top:.4rem"><label>${T("Note interne")}</label><div>' + esc(g.note) + '</div></div>';
    }
    if (g.statut === 'pending') {
      h += '<div class="avis">${T("En attente d’activation — un courriel est parti")}'
        + (g.courrielExpediteur ? '${T(" à ")}' + esc(g.courrielExpediteur) : '')
        + '${T(". Si l’acheteur ne l’a jamais reçu, activez la carte à la main ci-dessous.")}</div>';
    }
    h += '<h3 style="margin-top:.9rem;font-size:.9rem">${T("Historique d’utilisation")}</h3>';
    if (!g.transactions.length) {
      h += '<div class="vide" style="padding:.7rem">${T("Carte jamais utilisée.")}</div>';
    } else {
      h += '<div data-pages="cartescadeaux-historique"><table><thead><tr><th>${T("Date")}</th><th>${T("Commande")}</th>'
        + '<th class="num">${T("Montant")}</th><th class="num">${T("Solde après")}</th></tr></thead><tbody>'
        + g.transactions.map(function(x){
            return '<tr><td>' + esc(szQuand(x.date)) + '</td><td>' + esc(x.commande || '—') + '</td>'
              + '<td class="num" style="color:var(--tx-err)">−' + fmt(x.montant) + '</td>'
              + '<td class="num">' + fmt(x.soldeApres) + '</td></tr>';
          }).join('')
        + '</tbody></table></div>';
    }
    /* SUPPRIMER (2026-10-13, sa demande) : droit DEDIE (D.peutSupprimer = giftcards:delete), confirmation
       dans une boite a part (szConfirmer, 2026-10-15) qui DIT le solde perdu. Le serveur la garde 30 jours en corbeille. */
    h += '<div class="pied-boite">'
      + (D.peutSupprimer
          ? '<button class="mini danger" id="cc-suppr" style="margin-right:auto">'
            + '${T("Supprimer la carte")}' + '</button>' : '')
      + (g.statut === 'pending' && D.peutModifier
          ? '<button class="mini prim" id="cc-activer">${T("Activer à la main")}</button>' : '')
      + '<button class="mini" id="cc-annuler">${T("Fermer")}</button></div>'
      + '</div></div>';
    return h;
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    var rows = filtrees();
    var t = D.tuiles;

    /* ⚠ szTuiles(...) ENVELOPPE, il ne remplace rien : le bandeau est ecrit tel
       quel, la piece commune y ajoute le bouton de repli et l etat retenu pour
       ce poste. Voir JS_TUILES dans socle.js. */
    var h = szTuiles('<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">${T("Cartes actives")}</div><div class="val">' + t.actives
      + '</div><div class="sub">' + t.total + '${T(" au total")}</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Solde en circulation")}</div><div class="val">'
      + fmt(t.enCirculation) + '</div><div class="sub">${T("sur ")}' + fmt(t.emis) + '${T(" émis")}</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Entièrement utilisées")}</div><div class="val">'
      + t.utilisees + '</div></div>'
      + '</div>');

    /* ══ LA LISTE REFAITE (2026-10-15, lot B de la refonte du marketing) ═════
       Meme langage que Campagnes : une TETE (les statuts en boutons a choix —
       le mot seul, jamais de compte —, recherche, recompense et creation a
       droite), puis un RANG aere par carte, qui commence par la carte ELLE-MEME
       en petit (son solde). Un clic ouvre la fiche, comme avant. Crochets
       gardes : #cc-q, data-ccst, #cc-recompense, #cc-nouvelle, [data-id]. */
    var jet = function(v, lib){
      return '<button type="button" class="' + (STATUT === v ? 'on' : '') + '" data-ccst="' + v + '">' + lib + '</button>';
    };
    h = '<div class="ls">' + '<div class="ls-tete"><div class="ed-seg ls-onglets">'
      + jet('', '${T("Tous les statuts")}') + jet('active', '${T("Actives")}') + jet('pending', '${T("Activation requise")}')
      + jet('used', '${T("Utilisées")}') + jet('expired', '${T("Expirées")}')
      + '</div><div class="droite">'
      + '<label class="ls-rch">${ICO.loupe}<input aria-label="${T("Code, destinataire, courriel")}" type="search" id="cc-q" placeholder="${T("Code, destinataire, courriel…")}" value="' + esc(Q) + '"></label>'
      + '<button class="ed-bt" id="cc-recompense">${T("Récompense à l’achat")}</button>'
      + (D.peutModifier ? '<button class="ed-bt fort" id="cc-nouvelle">${T("+ Créer une carte")}</button>' : '')
      + '</div></div>' + h;

    // La liste en PAGES mesurees, jamais de glissiere (JS_PAGES du socle, 2026-10-12).
    h += '<div class="ls-liste sz-pagee">';
    if (!rows.length) {
      h += '<div class="ls-vide">' + (Q || STATUT ? '${T("Rien ne correspond.")}' : '${T("Aucune carte-cadeau.")}') + '</div>';
    } else {
      h += '<div data-pages="cartescadeaux"' + szPagesCoeurAttr(D) + '>' + rows.map(function(g){
        var pc = g.initial > 0 ? Math.max(0, Math.min(100, Math.round(100 * g.solde / g.initial))) : 0;
        return '<div class="ls-rang cc-rang' + (g.statut === 'active' || g.statut === 'pending' ? '' : ' eteinte') + '" data-id="' + esc(g.id) + '" title="${T("Voir le détail")}">'
          + '<div class="qui"><span class="gc-mini" aria-hidden="true"><b>SANDRIZA</b><strong>' + fmt(g.solde) + '</strong></span>'
          + '<div class="tx"><b>' + esc(g.destinataire || '—') + '</b><span><span class="rf-code">' + esc(g.code) + '</span>'
          + (g.courriel ? ' · ' + esc(g.courriel) : '') + '</span></div></div>'
          + '<div class="bilan"><b>' + fmt(g.solde) + '<small> / ' + fmt(g.initial) + '</small></b>'
          + (g.initial > 0 ? '<div class="jaugec" title="' + pc + ' %"><i style="width:' + pc + '%"></i></div>' : '') + '</div>'
          + '<div class="ou"><b>' + esc(g.expediteur || '—') + '</b><span>' + esc(szQuand(g.date)) + '</span></div>'
          + '<div class="etat"><span class="rf-pill ' + (TONS[g.statut] || '') + '">' + esc(szTd(g.statutLibelle)) + '</span>'
          + (g.courrielEnvoye ? '<span class="rf-pill bleu">${T("courriel ✓")}</span>' : '') + '</div>'
          + '<span class="cc-ouvrir" aria-hidden="true">›</span></div>';
      }).join('') + '</div>';
    }
    h += '</div></div>';

    if (BOITE === 'creer') h += boiteCreer();
    else if (BOITE === 'recompense') h += boiteRecompense();
    else if (BOITE === 'detail') h += boiteDetail();

    corps.classList.add('ls-corps');
    corps.innerHTML = h;
    brancher();
  }

  function brancher(){
    var q = document.getElementById('cc-q');
    if (q) q.oninput = function(){
      Q = q.value;
      if (!D || !D.pagine) { redessinerSansPerdreLaSaisie(); return; }
      // (lot VOLUME 2) Le filtre part au coeur, temporise, et revient a la premiere page.
      clearTimeout(MINU_Q);
      MINU_Q = setTimeout(function(){ PG = 0; charger(); }, 250);
    };
    var refiltrer = function(){ if (D && D.pagine) { PG = 0; charger(); } else dessiner(); };
    // Les statuts en pastilles (refonte du 2026-09-25).
    corps.querySelectorAll('[data-ccst]').forEach(function(b){
      b.onclick = function(){ STATUT = b.getAttribute('data-ccst') || ''; refiltrer(); };
    });
    var bn = document.getElementById('cc-nouvelle');
    if (bn) bn.onclick = function(){ BOITE = 'creer'; dessiner(); szBrouillonProposer(); };
    var br = document.getElementById('cc-recompense');
    if (br) br.onclick = function(){ BOITE = 'recompense'; dessiner(); };
    var ba = document.getElementById('cc-annuler');
    if (ba) ba.onclick = fermerBoite;
    var vo = document.getElementById('cc-voile');

    if (document.getElementById('cc-apercu')) brancherApercuCarte();
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
        dire('${T("Carte créée — code ")}' + r.code + '.', 'bon');
        charger();
      });
    };

    // La borne du champ suit le type : 90 % ou 1 000 $ (les memes que le serveur).
    var brt = document.getElementById('cc-r-type');
    if (brt) brt.onchange = function(){ var v = document.getElementById('cc-r-val'); if (v) v.max = brt.value === 'fixed' ? '1000' : '90'; };
    var bre = document.getElementById('cc-r-enr');
    if (bre) bre.onclick = function(){
      bre.disabled = true;
      appeler('cartescadeaux:recompense', [{
        enabled: !!(document.getElementById('cc-r-on') || {}).checked,
        type: (document.getElementById('cc-r-type') || {}).value,
        value: (document.getElementById('cc-r-val') || {}).value,
        expiryDays: (document.getElementById('cc-r-exp') || {}).value
      }]).then(function(r){
        bre.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        BOITE = null;
        dire('${T("Récompense enregistrée.")}', 'bon');
        charger();
      });
    };

    var bsu = document.getElementById('cc-suppr');
    if (bsu) bsu.onclick = function(){
      if (!SUPPR_ARME) {
        var gS = DETAIL || {};
        var dS = [['${T("Solde perdu")}', fmt(gS.solde || 0)]];
        if (gS.destinataire) dS.push(['${T("Destinataire")}', gS.destinataire]);
        szConfirmer({ danger: true, titre: '${T("Supprimer la carte-cadeau")}',
          texte: '${T("La carte-cadeau")}' + ' « ' + (gS.code || '') + ' » ' + '${T("sera supprimée et ne pourra plus être utilisée en boutique.")}'
            + (gS.solde > 0 ? ' ' + '${T("Son solde restant sera perdu.")}' : '')
            // (2026-10-15, vérifié au serveur : turso-proxy recopie la carte dans corbeille_serveur, catégorie « finances ».)
            + ' ' + '${T("Elle reste restaurable pendant 30 jours depuis Gardien → Corbeille.")}',
          details: dS,
          /* (2026-10-25, audit) L id est retenu AVANT la boite et passe tel quel : la suppression ne
             depend plus de ce que DETAIL ou le bouton sont devenus pendant la confirmation. */
          oui: '${T("Supprimer la carte")}' }).then(function(ok){ if (ok) { SUPPR_ARME = true; supprimerCarte(gS.id); } });
        return;
      }
      supprimerCarte(DETAIL && DETAIL.id);
    };
    function supprimerCarte(idC){
      if (!idC) return;
      var bsu = document.getElementById('cc-suppr');
      if (bsu) bsu.disabled = true;
      appeler('cartescadeaux:supprimer', [idC]).then(function(r){
        SUPPR_ARME = false;
        if (!r || !r.ok) { if (bsu) bsu.disabled = false; dire(expliquer(r), 'err'); dessiner(); return; }
        BOITE = null; DETAIL = null;
        dire('${T("Carte ")}' + (r.code || '') + '${T(" supprimée.")}', 'bon');
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
        dire('${T("Carte ")}' + (r.code || '') + '${T(" activée.")}', 'bon');
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
    libelle: '${T("Une carte-cadeau")}',
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
  function fermerBoite(){ szFermerBoite(function(){ BOITE = null; DETAIL = null; SUPPR_ARME = false; dessiner(); }); }

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

  var SUPPR_ARME = false;
  function ouvrirCarte(id, armer){
    appeler('cartescadeaux:lire', [id]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      DETAIL = r.carte; BOITE = 'detail'; SUPPR_ARME = false; dessiner();
      /* « Supprimer la carte… » du clic droit : la fiche s ouvre derriere, et la
         boite de confirmation (szConfirmer) se pose dessus avec le solde perdu. */
      if (armer) { var bsA = document.getElementById('cc-suppr'); if (bsA && bsA.onclick) bsA.onclick(); }
    });
  }
  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('.boite')) return;
    var tr = t.closest('.cc-rang[data-id]');
    if (!tr) return;
    ouvrirCarte(tr.getAttribute('data-id'), false);
  });

  /* (2026-10-25, audit) COPIER SANS SE TAIRE. La page est chargee en data: (origine opaque) :
     navigator.clipboard peut y manquer ou refuser, et l exception etait avalee — rien dans le
     presse-papiers, aucun message. Repli : la copie par selection (comme la logotheque), puis,
     si elle echoue aussi, le code est affiche pour etre copie a la main. */
  function copierCode(code){
    var parSelection = function(){
      var ok = false;
      try { var ta = document.createElement('textarea'); ta.value = code; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta); } catch (e) { ok = false; }
      dire(ok ? '${T("Code copié : ")}' + code : code, ok ? 'bon' : 'att');
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function(){ dire('${T("Code copié : ")}' + code, 'bon'); }, parSelection);
        return;
      }
    } catch (e) {}
    parSelection();
  }
  /* LE CLIC DROIT SUR UNE CARTE (2026-10-13) — memes gestes que la fiche, memes droits. « Supprimer… » ouvre
     la fiche et pose dessus la boite de confirmation, qui dit le solde perdu. */
  window.szCtxEntrees = function(ligne){
    if (!ligne.matches || !ligne.matches('.cc-rang[data-id]') || !D) return null;
    var id = ligne.getAttribute('data-id');
    var c = (D.cartes || []).filter(function(x){ return x.id === id; })[0];
    if (!c) return null;
    var l = [{ lib: '${T("Ouvrir la carte")}', fn: function(){ ouvrirCarte(id, false); } },
      { lib: '${T("Copier le code")}', fn: function(){ copierCode(c.code); } }];
    if (c.statut === 'pending' && D.peutModifier) l.push({ lib: '${T("Activer à la main")}', fn: function(){
      appeler('cartescadeaux:activer', [id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('${T("Carte ")}' + (r.code || '') + '${T(" activée.")}', 'bon'); charger();
      }); } });
    if (D.peutSupprimer) { l.push({ trait: true }); l.push({ lib: '${T("Supprimer la carte…")}', dgr: true, fn: function(){ ouvrirCarte(id, true); } }); }
    return l;
  };

  function charger(){
    appeler('cartescadeaux:liste', [{ page: PG, parPage: PAR_PAGE, q: Q, statut: STATUT }]).then(function(r){
      if (!r || !r.ok) { vide('${T("Cartes-cadeaux indisponibles")}', expliquer(r)); return; }
      D = r;
      if (D.pagine) PG = D.page || 0;
      if (sous) sous.textContent = D.peutModifier ? '' : '${T("consultation seulement")}';
      var qa = document.getElementById('cc-q');
      if (qa && document.activeElement === qa) redessinerSansPerdreLaSaisie(); else dessiner();
    });
  }
  // (lot VOLUME 2) Le pied du socle demande la page voisine au coeur.
  (window.szPagesCoeur = window.szPagesCoeur || {}).cartescadeaux = function(p){ PG = p; charger(); };

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
