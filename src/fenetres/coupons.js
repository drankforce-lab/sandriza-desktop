'use strict';

/*
 * FENÊTRE « COUPONS » — NATIVE (1.64.0, palier 4)
 * =============================================================================
 * Les codes de réduction appliqués au paiement : la liste complète, la création
 * et la modification DANS la fenêtre, l'activation d'un clic, la suppression
 * armée en deux clics.
 *
 * ⚠ UN COUPON TOUCHE LA CAISSE. Sa valeur, son sous-total minimum et son cumul
 * avec les soldes décident de ce que la cliente paie. Rien n'est décidé ici :
 * la fenêtre porte la saisie, le site tranche (Promo._couponEcrire) — y compris
 * le refus d'un code déjà pris, qui empêche deux réductions de porter le même
 * nom. La fenêtre se contente d'annoncer le verdict.
 *
 * ⚠ « LIVRAISON GRATUITE » N'A PAS DE VALEUR À SAISIR : le champ se retire de
 * lui-même, sinon on demande un chiffre qui ne sera jamais lu.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('coupons');
const LANGUE = require('../langue');
// Le separateur decimal de la langue du poste (apercu du coupon, 2026-10-04).
const SEP_DEC = () => (LANGUE.langueCourante() === 'en' ? '.' : ',');

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
/* Aucune glissiere (2026-10-12) : la liste se pagine (data-pages, JS_PAGES du socle). */
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow:hidden;
  display:flex;flex-direction:column;gap:.7rem}
/* Les tuiles de tete et la jauge d utilisation (refonte du 2026-09-25), aux
   mesures de l Inventaire. */
.tuiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem;flex:0 0 auto;margin-bottom:.6rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);min-width:0}
.tuile .sub{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tuile.cliq{cursor:pointer;user-select:none}
.tuile.cliq:hover{border-color:rgba(var(--or-rgb),.6)}
.tuile.on{border-color:var(--or)}
.jaugeu{height:5px;border-radius:3px;background:var(--v10);margin-top:.35rem;max-width:8rem;overflow:hidden}
.jaugeu i{display:block;height:100%;border-radius:3px;background:color-mix(in srgb,var(--tx-ok,#4ade80) 55%,transparent)}
.jaugeu i.plein{background:var(--tx-att)}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
/* Un en-tete de colonne chiffree garde la police des intitules. */
thead th.num{font-family:inherit}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input,select,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
input[type=checkbox]{width:auto;margin:0}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.32rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody tr:hover td{background:var(--v04)}
/* Refonte fine (2026-09-26) : un MONTANT n est pas un code — chiffres alignes
   dans la police de l ecran ; la chasse fixe reste aux codes (rf-code). */
.num{font-variant-numeric:tabular-nums;font-weight:700;text-align:right;white-space:nowrap}
.fin{white-space:nowrap;text-align:right}
.code{font-family:'Courier New',monospace;letter-spacing:1px;background:var(--v06);
  border-radius:4px;padding:.06rem .4rem;font-weight:700}
.dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.6875rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:var(--f-carte2);border:1px solid var(--v14);border-radius:13px;
  max-width:40rem;width:100%;max-height:88vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .7rem;font:700 .98rem/1.3 Georgia,serif}
.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.55rem}
.ch{display:flex;flex-direction:column;gap:.22rem;min-width:0}
.ch.large{grid-column:1/-1}
.ch label{font-size:.72rem;color:var(--tx2)}
.ch input,.ch select{width:100%}
.ch .req{color:var(--tx-or)}
.ch .aide{font-size:.6875rem;color:var(--tx3)}
.cases{display:flex;flex-wrap:wrap;gap:.4rem 1rem;margin-top:.5rem}
.cases label{display:inline-flex;align-items:center;gap:.4rem;font-size:.83rem;cursor:pointer}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.9rem;flex-wrap:wrap}
.vide{padding:1.3rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
/* L apercu du coupon (2026-10-04) : ce que le client tape -> ce qu il obtient. */
.cp-apercu{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-top:.75rem;padding:.55rem .75rem;
  border:1px dashed var(--v16);border-radius:10px;font-size:.84rem;color:var(--tx2)}
.cp-apercu .cp-code{font-family:'Courier New',monospace;font-weight:700;letter-spacing:1px;color:var(--tx);
  padding:.15rem .55rem;border-radius:6px;background:var(--v06)}
.cp-apercu .cp-fl{color:var(--tx3)}
/* La liste refaite (2026-10-15, lot B) : un rang par coupon, qui commence par le coupon lui-meme (son code sur un ticket). */
.cp-rang{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) 8rem minmax(0,1.1fr) 17rem}
.cp-ticket{flex:0 0 auto;width:9.5rem;height:2.6rem;padding:0 .8rem;display:flex;align-items:center;justify-content:center;
  border:1.5px dashed var(--sz-accent);border-radius:9px;background:var(--sz-accent-doux);color:var(--tx);
  font:700 .8rem/1 ui-monospace,"Courier New",monospace;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cp-rang.eteint .cp-ticket{border-color:var(--sz-bord-fort);background:transparent;color:var(--tx2)}
.cp-rang .ou b.cp-red{font-size:1.05rem;font-weight:700}
.cp-rang .bilan small{font-size:.76rem;font-weight:500;color:var(--tx2)}
.cp-rang .jaugeu{margin-top:.25rem;width:100%}
`;

/** Page complète de la fenêtre native « Coupons ». */
function pageCoupons() {
  return `${TETE()}
<title>${T("Coupons — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.promotions}</span><h1>${T("Coupons")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps plein" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_BROUILLON()}${JS_TUILES()}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var Q = '';
  var ETAT = '';            // '' | 'actifs' | 'inactifs'
  var FORM = null;          // null | {} (creation) | {…} (modification)
  var SUPPR_ARME = '';
  /* (2026-10-19, audit — lot VOLUME 2) LA PAGE EST FAITE PAR LE COEUR : on demande { page, parPage, q, etat }
     et on recoit la page, le vrai total et les comptes des tuiles (sur TOUS les coupons). Un ancien site
     (reponse sans pagine) rend toute la liste : la fenetre filtre alors elle-meme, comme avant. */
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
  function jour(d){
    if (!d) return '';
    try { return (String(d).length === 10 && String(d).charAt(4) === '-' ? new Date(+String(d).slice(0, 4), +String(d).slice(5, 7) - 1, +String(d).slice(8, 10)) : new Date(d)).toLocaleDateString('${LIEU()}', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return String(d); }
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux promotions.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Ce coupon n’existe plus.")}',
    doublon:            '${T("Ce code est déjà pris par un autre coupon.")}',
    valeur:             '${T("Un code et une valeur supérieure à zéro sont requis.")}',
    pct_max:            '${T("Un pourcentage ne peut pas dépasser 100 %.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
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

  function filtres(){
    if (D && D.pagine) return D.coupons || [];   // deja filtres et coupes par le coeur
    return filtrerListe(D.coupons || []);
  }
  function filtrerListe(liste){
    var q = Q.trim().toLowerCase();
    return (liste || []).filter(function(c){
      if (ETAT === 'actifs' && !c.enCours) return false;
      if (ETAT === 'inactifs' && c.enCours) return false;
      if (!q) return true;
      return (String(c.code) + ' ' + String(c.nom)).toLowerCase().indexOf(q) !== -1;
    });
  }

  /* ══ RELOOKING 2026 (2026-10-04) : la meme facture que les Offres ══════════
     A gauche ce que fait le coupon (code, reduction, conditions), a droite sa
     validite et ses trois oui/non en interrupteurs, avec l apercu de ce que le
     client tape et obtient. Les identifiants des champs ne changent pas : le
     branchement, le brouillon et l enregistrement les lisent tels quels. */
  function apercuCoupon(code, type, val){
    var r = type === 'freeshipping' ? '${T("Livraison gratuite")}'
      : type === 'fixed' ? (val ? ${LANGUE.langueCourante() === 'en' ? "'$' + String(val) + ' off'" : "String(val).replace('.', '${SEP_DEC()}') + ' $ de rabais'"} : '${T("un montant de rabais")}')
      : (val ? val + ' % ${T("de rabais")}' : '${T("un pourcentage de rabais")}');
    return '<span class="cp-code">' + esc(String(code || '${T("CODE")}').toUpperCase()) + '</span><span class="cp-fl">→</span><span>' + esc(r) + '</span>';
  }
  function boiteForm(){
    var c = FORM || {};
    var creation = !c.id;
    var type = c.type || 'percent';
    var valeur = type === 'freeshipping' ? '' : (c.valeur != null ? c.valeur : '');
    return '<div class="voile" id="cp-voile"><div class="boite sz-fiche" role="dialog" aria-modal="true">'
      + '<div class="sz-fiche-tete"><h3>' + (creation ? '${T("Nouveau coupon")}' : '${T("Modifier le coupon")}') + '</h3>'
      + '<span class="st">${T("Un code que le client tape au paiement pour obtenir une réduction.")}</span></div>'
      + '<div class="sz-fiche-corps"><div class="sz-fiche-col">'
      + '<section class="sz-sect"><h4>${T("Le coupon")}</h4><div class="sz-g2">'
      + '<div class="ch"><label>${T("Code ")}<span class="req">*</span></label>'
      + '<input id="cp-code" aria-label="${T("Code du coupon")}" value="' + esc(c.code || '') + '" placeholder="${T("PROMO20")}" '
      + 'style="font-family:Courier New,monospace;letter-spacing:1px;text-transform:uppercase"></div>'
      + '<div class="ch"><label for="cp-nom">${T("Nom interne")}</label>'
      + '<input id="cp-nom" value="' + esc(c.nom || '') + '" placeholder="${T("Promo printemps")}"></div>'
      + '<div class="ch"><label for="cp-type">${T("Type de réduction")}</label><select id="cp-type">'
      + '<option value="percent"' + (type === 'percent' ? ' selected' : '') + '>${T("Pourcentage (%)")}</option>'
      + '<option value="fixed"' + (type === 'fixed' ? ' selected' : '') + '>${T("Montant fixe ($)")}</option>'
      + '<option value="freeshipping"' + (type === 'freeshipping' ? ' selected' : '') + '>${T("Livraison gratuite")}</option>'
      + '</select></div>'
      + '<div class="ch" id="cp-ch-val"' + (type === 'freeshipping' ? ' style="visibility:hidden"' : '') + '>'
      + '<label>${T("Valeur ")}<span class="req">*</span></label>'
      /* ⚠ LA PHRASE ENTIERE : deux cles voisines (<< Valeur >> et << coupon >>)
         avaient laisse le << du >> nu au milieu, et le banc sur-code a lu un
         morceau de nom. Un nom accessible se traduit d un seul tenant. */
      + '<input type="number" id="cp-val" aria-label="${T("Valeur du coupon")}" min="0" step="0.01" value="' + esc(valeur) + '"></div>'
      + '</div>'
      + '<div class="cp-apercu" id="cp-apercu" aria-live="polite">' + apercuCoupon(c.code, type, valeur) + '</div>'
      + '</section>'
      + '<section class="sz-sect"><h4>${T("Conditions")}</h4><div class="sz-g2">'
      + '<div class="ch"><label for="cp-min">${T("Sous-total minimum")}</label>'
      + '<input type="number" id="cp-min" min="0" step="0.01" value="' + esc(c.minimum || 0) + '">'
      + '<span class="aide">${T("0 = aucun minimum.")}</span></div>'
      + '<div class="ch"><label for="cp-max">${T("Nombre d’utilisations maximum")}</label>'
      + '<input type="number" id="cp-max" min="0" step="1" value="' + esc(c.maximum || '') + '" placeholder="${T("illimité")}"></div>'
      + '</div></section>'
      + '</div><div class="sz-fiche-col">'
      + '<section class="sz-sect"><h4>${T("Validité")}</h4><div class="sz-g2">'
      + '<div class="ch"><label for="cp-sd">${T("Début")}</label><input type="date" id="cp-sd" value="' + esc(c.debut || '') + '"></div>'
      + '<div class="ch"><label for="cp-ed">${T("Fin")}</label><input type="date" id="cp-ed" value="' + esc(c.fin || '') + '"></div>'
      + '</div></section>'
      + '<section class="sz-sect"><h4>${T("Règles")}</h4>'
      + szInter('cp-act', '${T("Actif")}', '${T("Le code est accepté au paiement pendant sa période.")}', c.actif !== false)
      + szInter('cp-per', '${T("Une seule fois par client")}', '${T("Un même client ne peut l’utiliser qu’une fois.")}', !!c.parClient)
      + szInter('cp-onsale', '${T("Cumulable avec les soldes et promotions")}', '${T("Sinon, le code est refusé si le panier contient un article en solde ou en promotion.")}', !!c.cumulSolde)
      + '</section></div></div>'
      + '<div class="pied-boite"><button class="mini" id="cp-annuler">${T("Annuler")}</button>'
      + '<button class="mini prim" id="cp-enr">' + (creation ? '${T("Créer le coupon")}' : '${T("Enregistrer")}') + '</button></div>'
      + '</div></div>';
  }
  function brancherApercuCoupon(){
    var val = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    var maj = function(){
      var z = document.getElementById('cp-apercu'); if (!z) return;
      var t = val('cp-type');
      z.innerHTML = apercuCoupon(val('cp-code'), t, t === 'freeshipping' ? '' : val('cp-val'));
      var cv = document.getElementById('cp-ch-val'); if (cv) cv.style.visibility = t === 'freeshipping' ? 'hidden' : '';
    };
    ['cp-code', 'cp-val'].forEach(function(id){ var e = document.getElementById(id); if (e) e.addEventListener('input', maj); });
    var ty = document.getElementById('cp-type'); if (ty) ty.addEventListener('change', maj);
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    var rows = filtres();

    /* ══ LA REFONTE DE L INVENTAIRE, APPLIQUEE A COUPONS (2026-09-25) ═════════
       Tuiles calculees sur TOUS les coupons (pas sur la recherche) : en cours,
       hors service, utilisations. Barre sur une ligne a loupe, filtres en
       pastilles ; ligne riche et jauge d utilisation quand un plafond existe.
       Crochets gardes : #cp-q, data-etat, #cp-nouveau, data-modifier /
       data-basculer / data-suppr, #cp-exporter. */
    var tous = D.coupons || [];
    var nEnCours = tous.filter(function(c){ return c.enCours; }).length;
    var nUtil = tous.reduce(function(a, c){ return a + (Number(c.utilise) || 0); }, 0);
    var nTous = tous.length;
    if (D.pagine && D.comptes) { nTous = D.comptes.tous || 0; nEnCours = D.comptes.enCours || 0; nUtil = D.comptes.utilisations || 0; }
    var tu = function(etat, lib, val, sous){
      // etat null = un COMPTEUR, pas un filtre : ni clic, ni cadre.
      var f = etat !== null;
      return '<div class="tuile' + (f ? ' cliq' + (ETAT === etat ? ' on' : '') + '" data-etat="' + etat + '"'
        + ' title="${T("Cliquer pour afficher")}' : '') + '"><div class="lbl">' + lib + '</div><div class="val">' + val + '</div>'
        + '<div class="sub">' + sous + '</div></div>';
    };
    /* ══ LA LISTE REFAITE (2026-10-15, lot B de la refonte du marketing) ═════
       Meme langage que Campagnes : une TETE (filtres en boutons a choix — le
       mot seul, jamais de compte —, recherche et creation a droite), puis un
       RANG aere par coupon, qui commence par le coupon LUI-MEME (son code sur
       un ticket). Crochets gardes : #cp-q, data-etat, #cp-nouveau,
       data-modifier / data-basculer / data-suppr, #cp-exporter. */
    var h = '<div class="ls">';
    h += '<div class="ls-tete"><div class="ed-seg ls-onglets">'
      + '<button type="button" class="' + (ETAT === '' ? 'on' : '') + '" data-etat="">${T("Tous")}</button>'
      + '<button type="button" class="' + (ETAT === 'actifs' ? 'on' : '') + '" data-etat="actifs">${T("En cours")}</button>'
      + '<button type="button" class="' + (ETAT === 'inactifs' ? 'on' : '') + '" data-etat="inactifs">${T("Hors service")}</button>'
      + '</div><div class="droite">'
      + '<label class="ls-rch">${ICO.loupe}<input aria-label="${T("Code ou nom")}" type="search" id="cp-q" placeholder="${T("Code ou nom…")}" value="' + esc(Q) + '"></label>'
      + (D.peutModifier ? '<button class="ed-bt fort" id="cp-nouveau">${T("+ Nouveau coupon")}</button>' : '')
      + '</div></div>';
    h += szTuiles('<div class="tuiles">'
      + tu('actifs', '${T("En cours")}', nEnCours, '${T("utilisables en boutique")}')
      + tu('inactifs', '${T("Hors service")}', nTous - nEnCours,'${T("désactivés ou hors période")}')
      + tu(null, '${T("Utilisations")}', nUtil, '${T("tous coupons confondus")}')
      + '</div>');

    // La liste en PAGES mesurees, jamais de glissiere (JS_PAGES du socle, 2026-10-12).
    h += '<div class="ls-liste sz-pagee">';
    if (!rows.length) {
      h += '<div class="ls-vide">' + (Q || ETAT ? '${T("Rien ne correspond.")}' : '${T("Aucun coupon. Créez le premier.")}') + '</div>';
    } else {
      h += '<div data-pages="coupons"' + szPagesCoeurAttr(D) + '>' + rows.map(function(c){
        var gestes = '';
        if (D.peutModifier) {
          gestes = '<button class="mini geste" data-modifier="' + esc(c.id) + '">${T("Modifier")}</button>'
            + '<button class="mini geste" data-basculer="' + esc(c.id) + '">'
            + (c.actif ? '${T("Désactiver")}' : '${T("Activer")}') + '</button>'
            + '<button class="mini geste danger" data-suppr="' + esc(c.id) + '">'
            + '${T("Supprimer")}' + '</button>';
        }
        return '<div data-ctx-ligne class="ls-rang cp-rang' + (c.enCours ? '' : ' eteint') + '">'
          + '<div class="qui"><span class="cp-ticket">' + esc(c.code) + '</span>'
          + '<div class="tx"><b>' + esc(c.nom || c.code) + '</b><span>'
          + (c.cumulSolde ? '${T("Cumulable avec les soldes et promotions")}' : '${T("Cumul soldes")} : ${T("refusé")}') + '</span></div></div>'
          + '<div class="ou"><b class="cp-red">' + esc(c.reduction) + '</b><span>'
          + (c.minimum ? '${T("Minimum")} ' + fmt(c.minimum) : '—') + '</span></div>'
          + '<div class="bilan"><b>' + c.utilise + '<small> / ' + (c.maximum ? c.maximum : '∞') + '</small></b>'
          /* La jauge d utilisation, quand il y a un plafond : ambre des qu il est atteint (le coupon ne passera plus). */
          + (c.maximum ? '<div class="jaugeu" title="' + c.utilise + ' / ' + c.maximum + '"><i'
              + (c.utilise >= c.maximum ? ' class="plein"' : '') + ' style="width:'
              + Math.min(100, Math.round(100 * c.utilise / c.maximum)) + '%"></i></div>' : '<span>${T("Utilisations")}</span>')
          + '</div>'
          + '<div class="etat"><span class="rf-pill ' + (c.enCours ? 'vert' : '') + '">'
          + (c.enCours ? '${T("En cours")}' : '${T("Hors service")}') + '</span>'
          + '<span>' + (c.debut ? esc(jour(c.debut)) : '—') + (c.fin ? ' → ' + esc(jour(c.fin)) : '') + '</span></div>'
          + '<div class="gestes">' + gestes + '</div></div>';
      }).join('') + '</div>';
    }
    h += '</div>';
    h += '</div>';

    /* ⚠ LE PIED SE POSE AVANT LE VOILE DU FORMULAIRE, jamais apres : il
       appartient a la liste, et un pied dessine par-dessus une boite ouverte
       flotterait au milieu de rien. */
    if (rows.length) {
      var nPied = D.pagine ? (D.total || 0) : rows.length;
      h += szPied(
        nPied + ' ' + (nPied > 1 ? '${T("coupons")}' : '${T("coupon")}'),
        '<button class="mini" id="cp-exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>');
    }

    if (FORM) h += boiteForm();
    corps.classList.add('ls-corps');
    corps.innerHTML = h;
    brancher();

    /* ⚠ ON EXPORTE LE RESULTAT DU FILTRE (rows), pas D.lignes : l ecran a des
       onglets, et le fichier doit ressembler a ce qu on regarde.
       ⚠ Les dates partent en ISO, pas en << 19 sept. >> : un tableur sait
       trier du 2026-09-19, il ne sait pas trier un mois abrege. */
    var exc = document.getElementById('cp-exporter');
    /* (lot VOLUME 2) En pages, la fenetre ne tient que la page : l export RELIT la liste ENTIERE
       (appel sans parPage) et la filtre comme l ecran. */
    function exporterListe(liste){
      var lignes = liste.map(function(c){
        return [c.code || '', c.reduction || '', c.minimum || 0,
          c.cumulSolde ? '${T("autorisé")}' : '${T("refusé")}',
          c.utilise, c.maximum || '', c.debut || '', c.fin || '',
          c.enCours ? '${T("En cours")}' : '${T("Hors service")}'];
      });
      if (!lignes.length) { dire('${T("Rien à exporter.")}', 'att'); return; }
      var csv = szCSV(['${T("Code")}', '${T("Réduction")}', '${T("Minimum")}',
        '${T("Cumul avec solde")}', '${T("Utilisé")}', '${T("Maximum")}',
        '${T("Début")}', '${T("Fin")}', '${T("Statut")}'], lignes);
      szExporter('coupons-' + new Date().toISOString().slice(0, 10) + '.csv', csv,
        '${T("La liste des coupons")}');
    }
    if (exc) exc.onclick = function(){
      if (!D.pagine) { exporterListe(rows); return; }
      exc.disabled = true;
      appeler('coupons:liste', []).then(function(r){
        exc.disabled = false;
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        exporterListe(filtrerListe(r.coupons || []));
      });
    };
  }

  function brancher(){
    var q = document.getElementById('cp-q');
    if (q) q.oninput = function(){
      Q = q.value;
      if (!D || !D.pagine) { redessinerSansPerdreLaSaisie(); return; }
      // (lot VOLUME 2) Le filtre part au coeur, temporise, et revient a la premiere page.
      clearTimeout(MINU_Q);
      MINU_Q = setTimeout(function(){ PG = 0; charger(); }, 250);
    };
    var bn = document.getElementById('cp-nouveau');
    if (bn) bn.onclick = function(){ FORM = {}; dessiner(); szBrouillonProposer(); };
    var ba = document.getElementById('cp-annuler');
    /* ⚠ TROIS CHEMINS FERMENT CETTE BOITE : le bouton Annuler, le clic a cote,
       et la touche Echap. Les trois doivent ecrire le brouillon MAINTENANT, avec
       les valeurs prises avant que la boite ne disparaisse. En oublier un, c est
       exactement le defaut n°1 des Depenses — et le clic a cote est celui qui
       arrive le plus souvent par accident, donc celui qui cout le plus cher. */
    if (ba) ba.onclick = function(){ szFermerBoite(function(){ FORM = null; dessiner(); }); };
    var vo = document.getElementById('cp-voile');

    // « Livraison gratuite » : le champ de valeur s efface (sans decaler la grille),
    // et l apercu suit la saisie.
    brancherApercuCoupon();

    var be = document.getElementById('cp-enr');
    if (be) be.onclick = function(){
      var v = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
      var k = function(id){ var e = document.getElementById(id); return !!(e && e.checked); };
      be.disabled = true;
      appeler('coupons:enregistrer', [(FORM && FORM.id) || '', {
        code: v('cp-code'), nom: v('cp-nom'), type: v('cp-type'), valeur: v('cp-val'),
        minimum: v('cp-min'), maximum: v('cp-max'), debut: v('cp-sd'), fin: v('cp-ed'),
        parClient: k('cp-per'), cumulSolde: k('cp-onsale'), actif: k('cp-act')
      }]).then(function(r){
        be.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        /* Le brouillon meurt a l enregistrement reussi, pas avant. */
        szBrouillonJeter();
        FORM = null;
        dire('${T("Coupon ")}' + r.code + (r.creation ? '${T(" créé.")}' : '${T(" mis à jour.")}'), 'bon');
        charger();
      });
    };
  }

  /* ══ LE BROUILLON DU COUPON ═══════════════════════════════
     Un coupon se remplit en une dizaine de champs, dont deux dates. Ce n est pas
     une heure de travail, mais c est assez pour ne pas vouloir le refaire — et
     rien n en gardait trace : les valeurs ne vivent que dans les champs de la
     boite, qui disparait au moindre clic a cote.
     ⚠ UNE CLE PAR COUPON : une saisie laissee sur un coupon ne doit pas etre
     proposee sur le suivant. */
  var BR_CHAMPS = ['cp-code', 'cp-nom', 'cp-type', 'cp-val', 'cp-min', 'cp-max', 'cp-sd', 'cp-ed'];
  var BR_CASES = ['cp-per', 'cp-onsale', 'cp-act'];
  szBrouillonBrancher({
    portee: 'coupon',
    libelle: '${T("Un coupon")}',
    ttlMin: 720,
    cle: function(){ return FORM ? (FORM.id ? ('c:' + FORM.id) : '__new__') : ''; },
    actif: function(){ return !!FORM; },
    valeurs: function(){ return szBrouillonDuDom(BR_CHAMPS, BR_CASES); },
    /* En creation, le code ou le nom suffit. En modification, on compare au
       coupon d origine : un formulaire identique a ce qui est en base n a rien a
       proposer. */
    rempli: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, BR_CASES); if (!v) return false;
      if (!FORM || !FORM.id) return szBrouillonQuelqueChose(v, ['cp-code', 'cp-nom', 'cp-val']);
      var c = FORM;
      return String(v['cp-code'] || '') !== String(c.code || '')
        || String(v['cp-nom'] || '') !== String(c.nom || '')
        || String(v['cp-type'] || '') !== String(c.type || 'percent')
        || String(v['cp-val'] || '') !== String(c.valeur != null ? c.valeur : '')
        /* (2026-10-25, audit) Les autres champs comptent aussi : changer seulement le
           minimum, le maximum, les dates ou un interrupteur se perdait sans question. */
        || (parseFloat(v['cp-min']) || 0) !== (parseFloat(c.minimum) || 0)
        || String(v['cp-max'] || '') !== String(c.maximum || '')
        || String(v['cp-sd'] || '') !== String(c.debut || '')
        || String(v['cp-ed'] || '') !== String(c.fin || '')
        || !!(v._c && v._c['cp-act']) !== (c.actif !== false)
        || !!(v._c && v._c['cp-per']) !== !!c.parClient
        || !!(v._c && v._c['cp-onsale']) !== !!c.cumulSolde;
    },
    remplir: function(v){ szBrouillonAuDom(v); },
  });
  szBrouillonEcouter();

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('cp-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('cp-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest || t.closest('.boite')) return;

    var be = t.closest('[data-etat]');
    if (be) { ETAT = be.getAttribute('data-etat'); SUPPR_ARME = ''; if (D && D.pagine) { PG = 0; charger(); } else dessiner(); return; }

    var bm = t.closest('[data-modifier]');
    if (bm) {
      var idM = bm.getAttribute('data-modifier');
      var c = (D.coupons || []).filter(function(x){ return x.id === idM; })[0];
      if (c) { FORM = c; SUPPR_ARME = ''; dessiner(); szBrouillonProposer(); }
      return;
    }

    var bb = t.closest('[data-basculer]');
    if (bb) {
      SUPPR_ARME = '';
      bb.disabled = true;
      appeler('coupons:basculer', [bb.getAttribute('data-basculer')]).then(function(r){
        if (!r.ok) { bb.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('${T("Coupon ")}' + (r.code || '') + (r.actif ? '${T(" activé.")}' : '${T(" désactivé.")}'), 'bon');
        charger();
      });
      return;
    }

    var bs = t.closest('[data-suppr]');
    if (bs) {
      var idS = bs.getAttribute('data-suppr');
      /* Suppression CONFIRMEE dans une boite a part (szConfirmer, 2026-10-15).
         Elle ne touche pas aux commandes deja reglees : le coupon disparait pour
         l avenir, les reductions passees restent — c est ce que dit le message. */
      if (SUPPR_ARME !== idS) {
        var cS = (D.coupons || []).filter(function(c){ return c.id === idS; })[0];
        szConfirmer({ danger: true, titre: '${T("Supprimer le coupon")}',
          texte: '${T("Le coupon")}' + ' « ' + (cS ? cS.code : '') + ' » ' + '${T("sera supprimé définitivement et ne pourra plus être utilisé. Les commandes déjà réglées conservent leur réduction. Cette action est irréversible.")}',
          details: cS ? [['${T("Réduction")}', String(cS.reduction || '')], ['${T("Utilisations")}', String(cS.utilise || 0)]] : [],
          oui: '${T("Supprimer le coupon")}' }).then(function(ok){ if (ok) { SUPPR_ARME = idS; bs.click(); } });
        return;
      }
      SUPPR_ARME = '';
      appeler('coupons:supprimer', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire('${T("Coupon ")}' + (r.code || '') + '${T(" supprimé.")}', 'bon');
        charger();
      });
      return;
    }

    if (SUPPR_ARME) { SUPPR_ARME = ''; dessiner(); }
  });

  function charger(){
    appeler('coupons:liste', [{ page: PG, parPage: PAR_PAGE, q: Q, etat: ETAT }]).then(function(r){
      if (!r || !r.ok) { vide('${T("Coupons indisponibles")}', expliquer(r)); return; }
      D = r;
      if (D.pagine) PG = D.page || 0;
      if (sous) sous.textContent = D.peutModifier ? '' : '${T("Consultation seulement")}';
      // La recherche en cours garde son curseur (le rechargement vient de la frappe).
      var qa = document.getElementById('cp-q');
      if (qa && document.activeElement === qa) redessinerSansPerdreLaSaisie(); else dessiner();
    });
  }
  // (lot VOLUME 2) Le pied du socle demande la page voisine au coeur.
  (window.szPagesCoeur = window.szPagesCoeur || {}).coupons = function(p){ PG = p; charger(); };

  window.szActualiser = function(){
    var q = document.getElementById('cp-q');
    if (q && document.activeElement === q && q.value) return;
    if (FORM) return;          // on ne redessine pas sous un formulaire ouvert
    charger();
  };
  window.szRevenir = function(){ if (!FORM) charger(); };

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
      if (FORM) { szFermerBoite(function(){ FORM = null; dessiner(); }); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageCoupons };
