'use strict';

/*
 * FENÊTRE « VÉHICULES ET DÉPLACEMENTS » — NATIVE (2026-10-02)
 * =============================================================================
 * Sa demande : « un registre des déplacements, le total des kilomètres, la date,
 * la destination, la raison et les kilomètres parcourus, le tout lié aux
 * dépenses de déplacement au niveau de l'impôt ; plusieurs autos, un odomètre de
 * départ qui se met à jour chaque année, un registre des changements de
 * véhicule. Peaufine au maximum, ne rien laisser de côté. »
 *
 * CINQ ONGLETS, CHACUN RÉPOND À UNE QUESTION :
 *   · Registre     — où suis-je allé pour affaires, et combien de kilomètres ?
 *   · Véhicules    — quelles autos, et que disait leur compteur cette année ?
 *   · Changements  — quand ai-je changé de véhicule, à quel odomètre ?
 *   · Dépenses     — ce que m'ont coûté ces véhicules, et quelle part j'en déduis.
 *   · Bilan fiscal — ce que je reporte sur la T2125 (ligne 9281), le TP-80, et
 *                    en CTI (ligne 106) / RTI (ligne 206) — et ce qui manque.
 *
 * ⚠⚠ CETTE FENÊTRE NE CALCULE AUCUNE PART. La part d'affaires (km d'affaires ÷
 * km totaux à l'odomètre), le déductible et les CTI/RTI admissibles viennent du
 * site (`Vehicules.bilanCoeur`, assets/js/vehicules.js) par `vehicules:donnees`.
 * La même formule recopiée ici serait la deuxième source d'un chiffre fiscal —
 * c'est la leçon des quatorze rabais recopiés. Le seul calcul fait ici est
 * l'APERÇU des kilomètres d'un déplacement en cours de saisie, et le site le
 * refait de son côté : c'est lui qui fait foi.
 *
 * ⚠ ON N'ENVOIE JAMAIS UN TEXTE TRADUIT. Les types de frais et les raisons
 * arrivent en français ({ cle, nom }) ; on AFFICHE `szTd(nom)` et on ENVOIE `cle`.
 *
 * ⚠ AUCUNE BARRE DE DÉFILEMENT (sa règle du 2026-09-26) : chaque liste se
 * PAGINE à la hauteur MESURÉE — si la page déborde, une ligne de moins et on
 * redessine, comme le journal du livre de comptes.
 *
 * ⚠ UN CLIC NE REDESSINE PAS LA LISTE. Un clic sur une ligne la marque (une
 * classe, rien d'autre) ; c'est le DOUBLE-clic qui ouvre la modification.
 * Redessiner au premier clic remplacerait la ligne sous le pointeur, et le
 * second clic tomberait sur un élément neuf : le double-clic ne partirait jamais.
 *
 * ⚠ AUCUN CARACTÈRE accent grave NI ANTISLASH dans la portion de script,
 * COMMENTAIRES COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU, SEP_DEC } = require('./socle.js');
/* ⚠ LES DEUX LANGUES, résolues À LA GÉNÉRATION. On ne traduit QUE ce qui se
   lit — jamais une valeur enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('vehicules');

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
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or,#c9a97e)}
.tete .ico svg{width:100%;height:100%}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.onglets{flex:0 0 auto;display:flex;gap:.3rem;padding:.5rem 1.05rem 0;
  border-bottom:1px solid var(--v08)}
.onglets button{background:none;border:0;border-bottom:2px solid transparent;color:var(--tx2);
  font:600 .82rem/1 system-ui;padding:.45rem .7rem;cursor:pointer;border-radius:0}
.onglets button.on{color:var(--tx);border-bottom-color:#c9a97e}
.onglets .nb{font-weight:400;color:var(--tx3);margin-left:.3rem}
.onglets .pt{display:inline-block;width:.45rem;height:.45rem;border-radius:99px;
  background:var(--tx-att);margin-left:.35rem;vertical-align:middle}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;
  padding:.55rem 1.05rem .1rem}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center}
.corps{flex:1 1 auto;min-height:0;padding:.7rem 1.05rem .45rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.75rem .85rem;min-width:0}
.carte h2{margin:0 0 .5rem;font:700 .76rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}
.carte h2 .gris{text-transform:none;letter-spacing:0;font-weight:400}
select,input,button,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.28rem .5rem;cursor:pointer}
input,textarea{cursor:text}
input[type=checkbox]{width:auto;padding:0;cursor:pointer}
textarea{resize:none}
input.n{text-align:right;font-family:ui-monospace,Consolas,monospace;font-size:.8rem}
select:focus,input:focus,button:focus,textarea:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.mini{padding:.1rem .42rem;font-size:.74rem}
button.danger{border-color:rgba(248,113,113,.45);color:var(--tx-err2)}
button.aconf{background:rgba(248,113,113,.16);color:var(--tx-err2)}
html.jour button.aconf{color:#7f1d1d}

/* ── Les grands chiffres ─────────────────────────────────────────────────── */
.chiffres{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:.6rem}
.chiffre{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:.55rem .75rem}
.chiffre .lbl{font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2)}
.chiffre .val{font:700 1.15rem/1.25 ui-monospace,Consolas,monospace;margin-top:.12rem}
.chiffre .sous{font-size:.68rem;color:var(--tx3);margin-top:.08rem}
.chiffre.att .val{color:var(--tx-att)}

/* ── Tableaux serres (un registre est un document, pas une liste de cartes) ── */
.corps table{border-collapse:collapse;border-spacing:0}
.corps tbody td{padding:.24rem .35rem;border:0;border-top:1px solid var(--v055);border-radius:0;background:transparent}
.corps tbody tr:hover>td{background:var(--v03);border-color:var(--v055)}
.corps thead th{padding:.22rem .35rem;background:transparent}
table{width:100%;border-collapse:collapse;font-size:.79rem}
thead th{text-align:left;padding:.22rem .35rem;font-size:.64rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
thead th.n,tbody td.n{text-align:right;font-family:ui-monospace,Consolas,monospace;white-space:nowrap}
tbody td{padding:.24rem .35rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody tr.ligne{cursor:default}
tbody tr.ligne.mod{cursor:pointer}
.corps tbody tr.sel>td{background:rgba(201,169,126,.10)}
.corps tbody tr.tot>td{border-top:1px solid var(--v16);font-weight:700}
.corps tbody tr.grp>td{padding-top:.5rem;font-size:.64rem;text-transform:uppercase;letter-spacing:.06em;
  color:var(--tx2);font-weight:700;border-top:0}
.nowrap{white-space:nowrap}
.sous2{font-size:.7rem;color:var(--tx2);margin-top:.05rem}
.traj{font-weight:600}
.bon{color:var(--tx-ok)}.mauvais{color:var(--tx-err2)}.gris{color:var(--tx2)}.attn{color:var(--tx-att)}
.pill{display:inline-block;font-size:.63rem;padding:.04rem .45rem;border-radius:99px;
  white-space:nowrap;font-weight:700;vertical-align:baseline}
.pill.g{background:rgba(148,163,184,.14);color:var(--tx-94a3b8);font-weight:600}
.pill.ok{background:rgba(74,222,128,.14);color:var(--tx-ok)}
.pill.att{background:rgba(234,179,8,.16);color:var(--tx-att)}
.pill.non{background:rgba(248,113,113,.14);color:var(--tx-err2)}
.pages{display:flex;align-items:center;gap:.4rem;margin-left:auto;font:400 .74rem/1 system-ui;
  text-transform:none;letter-spacing:0;color:var(--tx2)}
.pages button.pgf{min-width:1.9rem;padding:.08rem .45rem;font-size:.95rem;line-height:1.1}

/* ── Mises en page ───────────────────────────────────────────────────────── */
.duo{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(19rem,1fr);gap:.7rem;align-items:start}
.duo>div{display:flex;flex-direction:column;gap:.7rem;min-width:0}
.aide{font-size:.76rem;color:var(--tx2);line-height:1.45}
.aide strong{color:var(--tx)}
.avis{border:1px solid rgba(234,179,8,.45);background:rgba(234,179,8,.09);
  border-radius:10px;padding:.5rem .75rem;font-size:.78rem;line-height:1.45}
.avis strong{color:var(--tx-att)}
.ok-box{border:1px solid rgba(74,222,128,.38);background:rgba(74,222,128,.08);
  border-radius:10px;padding:.5rem .75rem;font-size:.8rem;line-height:1.45}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem;line-height:1.5}
.vide strong{display:block;color:var(--tx);font-size:.92rem;margin-bottom:.3rem}
.appel{display:flex;flex-direction:column;align-items:center;gap:.6rem;padding:1.6rem 1rem;text-align:center}
.appel strong{font-size:.98rem}
.appel .aide{max-width:34rem}

/* ── Formulaires ─────────────────────────────────────────────────────────── */
.form2{display:grid;grid-template-columns:1fr 1fr;gap:.42rem .65rem}
.champ{display:flex;flex-direction:column;gap:.16rem;min-width:0}
.champ label{font-size:.71rem;color:var(--tx2)}
.champ input,.champ select,.champ textarea{width:100%;min-width:0}
.large{grid-column:1/-1}
.ar{display:flex;align-items:center;gap:.4rem;font-size:.76rem;color:var(--tx2);margin-top:.2rem;cursor:pointer}
/* La case garde sa taille : la règle .champ input (largeur 100 %) l étirait sur toute la colonne. */
.champ .ar input{width:auto;flex:0 0 auto;margin:0}
.calc{font-size:.8rem;padding:.35rem .55rem;border-radius:8px;background:var(--v04);border:1px solid var(--v08)}
.boutons{display:flex;gap:.5rem;justify-content:flex-end;align-items:center;margin-top:.55rem;flex-wrap:wrap}
.boutons .gauche{margin-right:auto}

/* ── Les cartes de vehicule ──────────────────────────────────────────────── */
.vgrille{display:grid;grid-template-columns:repeat(auto-fill,minmax(21rem,1fr));gap:.7rem;align-items:start}
.vcarte{display:flex;flex-direction:column;gap:.35rem}
.vcarte .vt{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.vcarte .vt strong{font-size:.95rem}
.vcarte .meta{font-size:.74rem;color:var(--tx2)}
.odo{border-top:1px solid var(--v08);padding-top:.45rem;margin-top:.15rem}
.odo .ot{font-size:.66rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);font-weight:700;margin-bottom:.3rem}
.odo .og{display:grid;grid-template-columns:4.6rem 1fr;gap:.3rem .5rem;align-items:center}
.odo .og label{font-size:.74rem;color:var(--tx2)}
.odo .src{grid-column:2;font-size:.68rem;color:var(--tx3);margin-top:-.15rem}
.kv{display:flex;gap:.9rem;flex-wrap:wrap;font-size:.78rem}
.kv b{font-family:ui-monospace,Consolas,monospace}
.vact{display:flex;gap:.4rem;justify-content:flex-end;margin-top:.2rem}

/* ── Bilan ───────────────────────────────────────────────────────────────── */
.bilan td:first-child{color:var(--tx2)}
.bilan td.n small{display:block;font:400 .64rem/1.2 system-ui;color:var(--tx3)}
.bilan thead th.n{text-transform:none;letter-spacing:0;font-size:.72rem;color:var(--tx)}
.bilan tr.cle>td{font-weight:700;color:var(--tx)}
.manque{margin:.2rem 0 0;padding-left:1.1rem;font-size:.78rem;line-height:1.45}
.manque li{margin-bottom:.3rem}
.lignes{margin:0;padding-left:1.05rem;font-size:.78rem;line-height:1.55}

/* ── La boite du vehicule ───────────────────────────────────────────────── */
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;align-items:center;
  justify-content:center;z-index:50;padding:1rem}
.boite{background:var(--f-carte2);border:1px solid var(--v14);border-radius:13px;
  max-width:44rem;width:100%;max-height:92vh;overflow:hidden;padding:.9rem 1rem}
.boite h3{margin:0 0 .6rem;font:700 .98rem/1.3 system-ui}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (max-width:980px){.duo{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Véhicules et déplacements ».
 * `ouverture` = 'registre' (défaut), 'vehicules', 'changements', 'depenses',
 * 'bilan' — ou deux états qui ne s'atteignent autrement qu'au clic :
 * 'vehicule-nouveau' (la boîte d'inscription d'un véhicule) et
 * 'deplacement-modifier' (le premier déplacement ouvert en modification).
 * ⚠ Ils existent pour le garde-fou de rendu, qui ne simule aucun clic : un
 * panneau jamais dessiné par un jeu d'essai est un panneau qui peut mourir en
 * silence.
 */
function pageVehicules(ouverture) {
  const onglets = ['registre', 'vehicules', 'changements', 'depenses', 'bilan'];
  const etats = ['vehicule-nouveau', 'deplacement-modifier'];
  const o = String(ouverture || '');
  const depart = onglets.indexOf(o) >= 0 ? o
    : (o === 'vehicule-nouveau' ? 'vehicules' : 'registre');
  const etat = etats.indexOf(o) >= 0 ? o : '';
  return `${TETE()}
<title>${T("Véhicules et déplacements — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.vehicule}</span><h1>${T("Véhicules et déplacements")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets" id="onglets"></div>
<div class="barreoutils" id="outils"></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('vehicules')}
  var corps = document.getElementById('corps');
  var elOnglets = document.getElementById('onglets');
  var elOutils = document.getElementById('outils');
  var elSous = document.getElementById('sous');

  var D = null;               /* le registre, tel que le site le rend */
  var ONGLET = '${depart}';
  var ETAT = '${etat}';       /* ouverture directe d un etat (jeu d essai) */
  var ANNEE = 0;
  var OCCUPE = false;
  var PA = false, PM = false, PS = false;   /* droits : ajouter, modifier, supprimer */
  var SAISIE = null;          /* le deplacement en cours de saisie */
  var CHG = null;             /* le changement de vehicule en cours de saisie */
  var VFORM = null;           /* la fiche de vehicule ouverte dans la boite */
  var ODO = {};               /* les odometres tapes et pas encore enregistres */
  var FVEH = '';              /* filtre du registre : un vehicule, ou tous */
  var PG = { reg: 0, veh: 0, chg: 0, dep: 0, bil: 0 };
  var BU = { reg: 0, veh: 0, chg: 0, dep: 0, bil: 4 };   /* lignes par page, MESUREES */
  var ARME = null;            /* la suppression armee : { cle, minuterie } */
  var ECHAP = false;          /* Echap arme sur une boite remplie */
  var SEP = '${SEP_DEC()}';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function argent(n){ return szArgent(n); }
  function km(n){ return (n == null || !isFinite(Number(n))) ? '—' : szNombre(n, 1) + ' km'; }
  function pct(p){
    if (p == null || !isFinite(Number(p))) return '';
    try { return Number(p).toLocaleString('${LIEU()}', { style: 'percent', maximumFractionDigits: 1 }); }
    catch (e) { return Math.round(Number(p) * 1000) / 10 + ' %'; }
  }
  /* Un nombre TAPE : virgule ou point, espaces (y compris insecables) ignores.
     ⚠ SANS EXPRESSION REGULIERE : un antislash se perd dans ce gabarit. On garde
     les chiffres, le premier separateur et un signe ; le reste tombe.
     Rend null pour un champ vide, NaN pour un champ illisible. */
  function lireNombre(v){
    var s = String(v == null ? '' : v), t = '', sep = false;
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c >= '0' && c <= '9') t += c;
      else if ((c === ',' || c === '.') && !sep) { t += '.'; sep = true; }
      else if (c === '-' && !t) t = '-';
      else if (c === ' ' || s.charCodeAt(i) === 160 || s.charCodeAt(i) === 8239) continue;
      else return NaN;
    }
    if (t === '' || t === '-') return null;
    var n = parseFloat(t);
    return isFinite(n) ? n : NaN;
  }
  /* Un nombre REMIS dans un champ : le separateur de la langue, sans groupement
     (un champ est relu par lireNombre, et un espace de milliers y passerait). */
  function champNombre(n){
    if (n == null || n === '' || !isFinite(Number(n))) return '';
    return String(n).split('.').join(SEP);
  }
  function deuxChiffres(n){ return (n < 10 ? '0' : '') + n; }
  function isoJour(d){ return d.getFullYear() + '-' + deuxChiffres(d.getMonth() + 1) + '-' + deuxChiffres(d.getDate()); }
  /* La date proposee : aujourd hui si l annee affichee est l annee courante,
     sinon le 31 decembre de l annee affichee — on saisit l annee qu on regarde. */
  function dateDefaut(){
    var d = new Date();
    return (!ANNEE || d.getFullYear() === ANNEE) ? isoJour(d) : (ANNEE + '-12-31');
  }

  /* ── Les refus du site, mot pour mot ──────────────────────────────────── */
  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas cette opération sur le registre des véhicules.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    module_depenses:    '${T("Le module des dépenses n’a pas pu être chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    nom:                '${T("Donnez un nom au véhicule (par exemple « Civic 2021 »).")}',
    dates:              '${T("La date de retrait précède la date d’acquisition.")}',
    odometre:           '${T("L’odomètre de fin doit dépasser celui du début : un compteur ne recule pas.")}',
    introuvable:        '${T("Cette fiche n’existe plus — elle a peut-être été retirée depuis un autre poste. Le registre a été relu.")}',
    annee:              '${T("Année invalide.")}',
    date:               '${T("Date invalide.")}',
    vehicule:           '${T("Choisissez un véhicule.")}',
    'hors-service':     '${T("Ce véhicule n’était pas en service à cette date (avant son acquisition ou après son retrait).")}',
    destination:        '${T("Indiquez la destination du déplacement.")}',
    raison:             '${T("Choisissez la raison d’affaires du déplacement.")}',
    detail:             '${T("« Autre raison d’affaires » exige une précision : dites ce qui a motivé le déplacement.")}',
    km:                 '${T("Indiquez les kilomètres parcourus, ou l’odomètre au départ et à l’arrivée.")}',
    'km-excessif':      '${T("Plus de 2 000 km pour un seul déplacement : vérifiez la saisie (un zéro de trop ?).")}',
    meme:               '${T("Le véhicule sortant et le véhicule entrant sont le même.")}',
    'odo-ancien':       '${T("Indiquez l’odomètre du véhicule sortant au jour du changement.")}',
    'odo-nouveau':      '${T("Indiquez l’odomètre du véhicule entrant au jour du changement.")}',
    nuage:              '${T("Le nuage a refusé l’écriture : elle n’existe que sur ce poste et sera perdue ailleurs. Vérifiez la connexion, puis refaites la saisie.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  /* ⚠ Un meme motif ne dit pas la meme chose selon le geste : << vehicule >>
     sur un changement veut dire qu AUCUN des deux cotes n est choisi. */
  function expliquer(r, geste){
    var m = r && r.motif;
    if (m === 'utilise') {
      var nd = Number(r.deplacements) || 0, ne = Number(r.depenses) || 0;
      return '${T("Ce véhicule porte")} ' + nd + ' ' + szPl(nd, '${T("déplacement")}', '${T("déplacements")}')
        + ' ${T("et")} ' + ne + ' ' + szPl(ne, '${T("dépense")}', '${T("dépenses")}')
        + ' ${T(": ils justifient des déductions, on ne le supprime pas. Donnez-lui plutôt une date de retrait (bouton Modifier).")}';
    }
    if (m === 'vehicule' && geste === 'changement') return '${T("Choisissez au moins un véhicule : le sortant, l’entrant, ou les deux.")}';
    if (m === 'odometre' && geste === 'vehicule') return '${T("L’odomètre au retrait doit dépasser celui de l’acquisition.")}';
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').');
    if (r && r.detail && m === 'echec') t += ' (' + String(r.detail).slice(0, 150) + ')';
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

  /* ── Les recherches dans le registre ──────────────────────────────────── */
  function vehicule(id){
    var L = (D && D.vehicules) || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i];
    return null;
  }
  function nomVeh(id){
    if (!id) return '';
    var v = vehicule(id);
    return v ? v.nom : '${T("Véhicule retiré du registre")}';
  }
  function libVeh(v){ return v.nom + (v.plaque ? ' · ' + v.plaque : ''); }
  function nomType(cle){
    var L = (D && D.types) || [];
    for (var i = 0; i < L.length; i++) if (L[i].cle === cle) return szTd(L[i].nom);
    return '';
  }
  function typeEntier(cle){
    var L = (D && D.types) || [];
    for (var i = 0; i < L.length; i++) if (L[i].cle === cle) return !!L[i].entiere;
    return false;
  }
  function nomRaison(cle){
    var L = (D && D.raisons) || [];
    for (var i = 0; i < L.length; i++) if (L[i].cle === cle) return szTd(L[i].nom);
    return cle || '';
  }
  function ligneBilan(id){
    var L = (D && D.bilan && D.bilan.vehicules) || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i];
    return null;
  }
  function enServiceListe(garder){
    return ((D && D.vehicules) || []).filter(function(v){ return v.enService || v.id === garder; });
  }
  /* D ou vient un odometre que personne n a tape. Le site ecrit sa source en
     clair (saisi, fin AAAA, debut AAAA, acquisition, retrait) : on la reconnait
     a son PREMIER CARACTERE et a l annee qui la termine, sans recopier ses mots. */
  function source(s){
    s = String(s || '');
    if (!s) return '';
    var c = s.charAt(0), an = parseInt(s.slice(-4), 10);
    if (c === 's') return '${T("saisi")}';
    if (c === 'f' && an > 1900) return '${T("repris de la fin")} ' + an;
    if (c === 'a') return '${T("relevé à l’acquisition")}';
    if (c === 'r') return '${T("relevé au retrait")}';
    if (an > 1900) return '${T("repris du début")} ' + an;
    return '';
  }

  /* ── LE CHARGEMENT — une seule porte, elle rend tout ──────────────────── */
  function charger(){
    if (OCCUPE) return Promise.resolve();
    OCCUPE = true;
    return appeler('vehicules:donnees', [ANNEE || null]).then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) {
        D = null; dessiner();
        corps.innerHTML = '<div class="vide"><strong>${T("Registre indisponible")}</strong>' + esc(expliquer(r)) + '</div>';
        return;
      }
      D = r;
      ANNEE = Number(r.annee) || ANNEE;
      PA = !!r.peutAjouter; PM = !!r.peutModifier; PS = !!r.peutSupprimer;
      if (FVEH && !vehicule(FVEH)) FVEH = '';
      if (!SAISIE) SAISIE = nouveauDeplacement(null);
      if (!CHG) CHG = nouveauChangement();
      if (ETAT === 'vehicule-nouveau' && PA) { VFORM = vehiculeVierge(); ONGLET = 'vehicules'; }
      if (ETAT === 'deplacement-modifier' && PM && (r.deplacements || []).length) {
        SAISIE = depuisDeplacement(r.deplacements[0]); ONGLET = 'registre';
      }
      ETAT = '';
      dessiner();
    });
  }

  /* ── LES ONGLETS ──────────────────────────────────────────────────────── */
  var ONGLETS = [
    ['registre',    '${T("Registre des déplacements")}'],
    ['vehicules',   '${T("Véhicules")}'],
    ['changements', '${T("Changements de véhicule")}'],
    ['depenses',    '${T("Dépenses du véhicule")}'],
    ['bilan',       '${T("Bilan fiscal")}']
  ];
  function onglets(){
    var n = {
      registre: D ? (D.deplacements || []).length : null,
      vehicules: D ? (D.vehicules || []).length : null,
      changements: D ? (D.changements || []).length : null,
      depenses: D ? (D.depenses || []).length : null
    };
    var incomplet = D && D.bilan && !D.bilan.complet;
    elOnglets.innerHTML = ONGLETS.map(function(o){
      return '<button type="button" data-o="' + o[0] + '"' + (ONGLET === o[0] ? ' class="on"' : '') + '>'
        + esc(o[1])
        + (n[o[0]] != null ? '<span class="nb">' + n[o[0]] + '</span>' : '')
        + (o[0] === 'bilan' && incomplet ? '<span class="pt" title="${T("Des renseignements manquent")}"></span>' : '')
        + '</button>';
    }).join('');
  }

  function outils(){
    if (!D) { elOutils.innerHTML = ''; return; }
    var h = '<label for="an" class="gris" style="font-size:.76rem">${T("Année")}</label>'
      + '<select id="an">'
      + (D.annees || []).map(function(a){
          return '<option value="' + esc(a) + '"' + (Number(a) === ANNEE ? ' selected' : '') + '>' + esc(a) + '</option>';
        }).join('') + '</select><span class="droite">';
    if (ONGLET === 'vehicules' && PA) h += '<button type="button" class="prim" data-act="veh-nouveau">${T("+ Inscrire un véhicule")}</button>';
    if (ONGLET === 'depenses') h += '<button type="button" data-act="ouvrir-depenses">${T("Ouvrir les Dépenses")}</button>';
    h += '</span>';
    elOutils.innerHTML = h;
    var sel = document.getElementById('an');
    if (sel) sel.onchange = function(){
      if (formSale()) szDire('${T("La saisie en cours est gardée : elle reste dans le formulaire.")}', 'att');
      ANNEE = parseInt(sel.value, 10) || ANNEE;
      PG = { reg: 0, veh: 0, chg: 0, dep: 0, bil: 0 };
      if (SAISIE && !SAISIE.id && !String(SAISIE.destination || '').trim()) SAISIE = null;
      if (CHG && !CHG.ancienId && !CHG.nouveauId && !String(CHG.motif || '').trim()) CHG = null;
      charger();
    };
  }

  function bandeauLecture(){
    if (PA || PM || PS) return '';
    return '<div class="avis"><strong>${T("Lecture seule.")}</strong> ${T("Votre rôle permet de consulter le registre et le bilan, pas de les modifier.")}</div>';
  }

  /* La navigation d une liste paginee. Des fleches, le nom complet en titre. */
  function nav(cle, nbp){
    if (nbp <= 1) return '';
    return '<span class="pages">'
      + '<button type="button" class="mini pgf" data-pg="' + cle + '" data-d="-1" title="${T("Page précédente")}" aria-label="${T("Page précédente")}"' + (PG[cle] <= 0 ? ' disabled' : '') + '>‹</button>'
      + '<span>${T("Page")} ' + (PG[cle] + 1) + ' / ' + nbp + '</span>'
      + '<button type="button" class="mini pgf" data-pg="' + cle + '" data-d="1" title="${T("Page suivante")}" aria-label="${T("Page suivante")}"' + (PG[cle] >= nbp - 1 ? ' disabled' : '') + '>›</button></span>';
  }
  function estimer(cle){
    var h = corps.clientHeight || 640;
    if (cle === 'reg') return Math.max(4, Math.floor((h - 190) / 37));
    if (cle === 'dep') return Math.max(4, Math.floor((h - 210) / 31));
    if (cle === 'chg') return Math.max(4, Math.floor((h - 90) / 33));
    if (cle === 'veh') return 6;
    return 4;
  }
  function tranche(liste, cle){
    if (!(BU[cle] > 0)) BU[cle] = estimer(cle);
    var bu = BU[cle];
    var nbp = Math.max(1, Math.ceil(liste.length / bu));
    if (PG[cle] >= nbp) PG[cle] = nbp - 1;
    if (PG[cle] < 0) PG[cle] = 0;
    return { vue: liste.slice(PG[cle] * bu, (PG[cle] + 1) * bu), nbp: nbp };
  }

  /* ══ ONGLET REGISTRE ═══════════════════════════════════════════════════ */
  function nouveauDeplacement(avant){
    var deps = (D && D.deplacements) || [];
    var actifs = enServiceListe('');
    var veh = (avant && avant.vehiculeId && vehicule(avant.vehiculeId) && vehicule(avant.vehiculeId).enService) ? avant.vehiculeId
      : (actifs.length === 1 ? actifs[0].id
        : ((deps[0] && vehicule(deps[0].vehiculeId) && vehicule(deps[0].vehiculeId).enService) ? deps[0].vehiculeId : ''));
    return { id: '', date: dateDefaut(), vehiculeId: veh,
      /* Le point de depart revient presque toujours le meme : on reprend celui
         du dernier deplacement inscrit. */
      depart: (avant && avant.depart) || (deps[0] && deps[0].depart) || '',
      destination: '', raison: '', detail: '', km: '', allerRetour: false,
      odoDebut: '', odoFin: '', commande: '' };
  }
  function depuisDeplacement(d){
    var parOdo = d.odoDebut != null && d.odoFin != null;
    return { id: d.id, date: d.date, vehiculeId: d.vehiculeId, depart: d.depart || '',
      destination: d.destination || '', raison: d.raison || '', detail: d.detail || '',
      km: parOdo ? '' : champNombre(d.kmSaisis != null ? d.kmSaisis : d.km),
      allerRetour: !parOdo && !!d.allerRetour,
      odoDebut: champNombre(d.odoDebut), odoFin: champNombre(d.odoFin), commande: d.commande || '' };
  }
  /* L APERCU des kilometres retenus — le site refait le calcul et fait foi. */
  function apercuKm(s){
    if (!s) return '';
    var a = lireNombre(s.odoDebut), b = lireNombre(s.odoFin), k = lireNombre(s.km);
    if (a != null && b != null) {
      if (!isFinite(a) || !isFinite(b)) return '${T("Odomètre illisible : des chiffres seulement.")}';
      if (b <= a) return '${T("L’odomètre d’arrivée doit dépasser celui du départ.")}';
      return '${T("Kilomètres retenus :")} ' + km(Math.round((b - a) * 10) / 10) + ' ${T("(lus à l’odomètre, ils l’emportent)")}';
    }
    if (k != null) {
      if (!isFinite(k) || k <= 0) return '${T("Kilomètres illisibles : un nombre plus grand que zéro.")}';
      return s.allerRetour
        ? '${T("Kilomètres retenus :")} ' + km(Math.round(k * 20) / 10) + ' (' + szNombre(k, 1) + ' × 2, ${T("aller-retour")})'
        : '${T("Kilomètres retenus :")} ' + km(k);
    }
    return '${T("Kilomètres retenus : —")}';
  }
  function vueRegistre(){
    var B = (D.bilan && D.bilan.total) || {};
    var h = szTuiles('<div class="chiffres">'
      + '<div class="chiffre"><div class="lbl">${T("Km d’affaires")}</div><div class="val">' + km(B.kmAffaires || 0) + '</div>'
      + '<div class="sous">${T("la somme du registre")}</div></div>'
      + '<div class="chiffre' + (B.kmTotal ? '' : ' att') + '"><div class="lbl">${T("Km totaux")}</div><div class="val">' + (B.kmTotal ? km(B.kmTotal) : '—') + '</div>'
      + '<div class="sous">' + (B.kmTotal ? '${T("lus à l’odomètre")}' : '${T("odomètre à compléter")}') + '</div></div>'
      + '<div class="chiffre' + (B.part == null ? ' att' : '') + '"><div class="lbl">${T("Part d’affaires")}</div><div class="val">' + (B.part == null ? '${T("À établir")}' : pct(B.part)) + '</div>'
      + '<div class="sous">${T("km d’affaires ÷ km totaux")}</div></div>'
      + '<div class="chiffre"><div class="lbl">${T("Déplacements")}</div><div class="val">' + (B.nDeplacements || 0) + '</div>'
      + '<div class="sous">${T("inscrits en")} ' + ANNEE + '</div></div>'
      + '<div class="chiffre"><div class="lbl">${T("Déductible")}</div><div class="val">' + argent(B.deductible || 0) + '</div>'
      + '<div class="sous">${T("dépenses de véhicule, part appliquée")}</div></div>'
      + '</div>');
    if (!(D.vehicules || []).length) return h + appelPremierVehicule();
    h += '<div class="duo"><div>' + listeDeplacements() + '</div><div>' + formDeplacement() + '</div></div>';
    return h;
  }
  function appelPremierVehicule(){
    return '<div class="carte appel"><strong>${T("Aucun véhicule inscrit")}</strong>'
      + '<div class="aide">${T("Le registre compte les kilomètres d’un véhicule précis : inscrivez d’abord votre véhicule et son odomètre de départ. La part d’affaires de ses dépenses (essence, entretien, assurance…) en découlera, et le bilan fiscal se remplira tout seul.")}</div>'
      + (PA ? '<button type="button" class="prim" data-act="veh-nouveau">${T("+ Inscrire un véhicule")}</button>'
            : '<div class="aide">${T("Votre rôle ne permet pas d’inscrire un véhicule : demandez-le à un administrateur.")}</div>')
      + '</div>';
  }
  function listeDeplacements(){
    var tous = (D.deplacements || []);
    var L = FVEH ? tous.filter(function(d){ return d.vehiculeId === FVEH; }) : tous;
    var total = L.reduce(function(s, d){ return s + (Number(d.km) || 0); }, 0);
    var t = tranche(L, 'reg');
    var vehs = (D.vehicules || []).filter(function(v){
      return v.enService || tous.some(function(d){ return d.vehiculeId === v.id; }); });
    var h = '<div class="carte"><h2>${T("Déplacements")} ' + ANNEE
      + (vehs.length > 1
          ? ' <select id="f-veh" aria-label="${T("Filtrer par véhicule")}" style="text-transform:none;letter-spacing:0;font-weight:400;font-size:.74rem;padding:.1rem .35rem">'
            + '<option value="">${T("Tous les véhicules")}</option>'
            + vehs.map(function(v){ return '<option value="' + esc(v.id) + '"' + (FVEH === v.id ? ' selected' : '') + '>' + esc(v.nom) + '</option>'; }).join('')
            + '</select>'
          : '')
      + nav('reg', t.nbp) + '</h2>';
    if (!L.length) {
      return h + '<div class="vide"><strong>${T("Aucun déplacement inscrit")}</strong>'
        + (FVEH ? '${T("pour ce véhicule en")} ' : '${T("en")} ') + ANNEE + '.<br>'
        + (PA ? '${T("Chaque sortie pour affaires s’inscrit à droite : la date, la destination, la raison et les kilomètres.")}' : '')
        + '</div></div>';
    }
    h += '<table><thead><tr><th>${T("Date")}</th><th>${T("Véhicule")}</th><th>${T("Trajet et raison")}</th>'
      + '<th class="n">${T("Km")}</th><th></th></tr></thead><tbody>';
    h += t.vue.map(function(d){
      var parOdo = d.odoDebut != null && d.odoFin != null;
      var sous = esc(nomRaison(d.raison)) + (d.detail ? ' — ' + esc(d.detail) : '')
        + (d.commande ? ' · ${T("commande")} ' + esc(d.commande) : '');
      return '<tr class="ligne' + (PM ? ' mod' : '') + (SAISIE && SAISIE.id === d.id ? ' sel' : '') + '" data-dep="' + esc(d.id) + '"'
        + (PM ? ' title="${T("Double-cliquez pour modifier")}"' : '') + '>'
        + '<td class="nowrap">' + esc(szJour(d.date)) + '</td>'
        + '<td>' + esc(nomVeh(d.vehiculeId)) + '</td>'
        + '<td><div class="traj">' + (d.depart ? esc(d.depart) + ' → ' : '') + esc(d.destination) + '</div>'
        + '<div class="sous2">' + sous + '</div></td>'
        + '<td class="n">' + km(d.km)
        + (d.allerRetour ? '<div class="sous2"><span class="pill g">${T("aller-retour")}</span></div>' : '')
        + (parOdo ? '<div class="sous2" title="${T("Lus à l’odomètre")}">' + szNombre(d.odoDebut, 1) + ' → ' + szNombre(d.odoFin, 1) + '</div>' : '')
        + '</td><td class="n">'
        + (PS ? '<button type="button" class="mini danger" data-sup-dep="' + esc(d.id) + '" aria-label="${T("Supprimer ce déplacement")}" title="${T("Supprimer ce déplacement")}">${T("Supprimer")}</button>' : '')
        + '</td></tr>';
    }).join('');
    h += '<tr class="tot"><td colspan="3">${T("Total")} ' + (FVEH ? esc(nomVeh(FVEH)) + ' ' : '') + ANNEE + ' — '
      + L.length + ' ' + szPl(L.length, '${T("déplacement")}', '${T("déplacements")}') + '</td>'
      + '<td class="n">' + km(Math.round(total * 10) / 10) + '</td><td></td></tr>';
    return h + '</tbody></table></div>';
  }
  function formDeplacement(){
    var s = SAISIE;
    var modif = !!(s && s.id);
    if (!(modif ? PM : PA)) {
      return '<div class="carte"><h2>${T("Inscrire un déplacement")}</h2><div class="aide">'
        + '${T("Votre rôle permet de consulter le registre, pas d’y inscrire des déplacements.")}</div></div>';
    }
    if (!s) s = SAISIE = nouveauDeplacement();
    var actifs = enServiceListe(s.vehiculeId);
    if (!actifs.length) {
      return '<div class="carte"><h2>${T("Inscrire un déplacement")}</h2><div class="aide">'
        + '${T("Aucun véhicule n’est en service en")} ' + ANNEE + '${T(" : inscrivez le véhicule utilisé, ou corrigez ses dates d’acquisition et de retrait (onglet Véhicules).")}</div>'
        + (PA ? '<div class="boutons"><button type="button" class="prim" data-act="veh-nouveau">${T("+ Inscrire un véhicule")}</button></div>' : '')
        + '</div>';
    }
    var autre = s.raison === 'autre';
    return '<div class="carte" id="f-dep"><h2>' + (modif ? '${T("Modifier le déplacement")}' : '${T("Ajouter un déplacement")}') + '</h2>'
      + '<div class="form2">'
      + '<div class="champ"><label for="d-date">${T("Date")}</label><input type="date" id="d-date" value="' + esc(s.date) + '"></div>'
      + '<div class="champ"><label for="d-veh">${T("Véhicule")}</label><select id="d-veh">'
      + (s.vehiculeId ? '' : '<option value="">${T("— choisir —")}</option>')
      + actifs.map(function(v){ return '<option value="' + esc(v.id) + '"' + (s.vehiculeId === v.id ? ' selected' : '') + '>' + esc(libVeh(v)) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="champ"><label for="d-depart">${T("Départ")}</label><input type="text" id="d-depart" maxlength="120" value="' + esc(s.depart) + '" placeholder="${T("La boutique, le bureau…")}"></div>'
      + '<div class="champ"><label for="d-dest">${T("Destination")}</label><input type="text" id="d-dest" maxlength="120" value="' + esc(s.destination) + '" placeholder="${T("Ville, adresse ou lieu")}"></div>'
      + '<div class="champ"><label for="d-raison">${T("Raison d’affaires")}</label><select id="d-raison">'
      + (s.raison ? '' : '<option value="">${T("— choisir —")}</option>')
      + (D.raisons || []).map(function(r){ return '<option value="' + esc(r.cle) + '"' + (s.raison === r.cle ? ' selected' : '') + '>' + esc(szTd(r.nom)) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="champ"><label for="d-detail" id="d-detail-l">' + (autre ? '${T("Précision (obligatoire)")}' : '${T("Précision (facultative)")}') + '</label>'
      + '<input type="text" id="d-detail" maxlength="200" value="' + esc(s.detail) + '" placeholder="${T("Fournisseur visité, client, objet…")}"></div>'
      + '<div class="champ"><label for="d-km">${T("Kilomètres parcourus")}</label><input type="text" inputmode="decimal" class="n" id="d-km" value="' + esc(s.km) + '" placeholder="0${SEP_DEC()}0">'
      + '<label class="ar" for="d-ar"><input type="checkbox" id="d-ar"' + (s.allerRetour ? ' checked' : '') + '> ${T("Aller-retour (× 2)")}</label></div>'
      + '<div class="champ"><label for="d-cmd">${T("N° de commande (facultatif)")}</label><input type="text" id="d-cmd" maxlength="40" value="' + esc(s.commande) + '" placeholder="${T("pour une livraison")}"></div>'
      + '<div class="champ"><label for="d-odo1">${T("ou odomètre au départ")}</label><input type="text" inputmode="decimal" class="n" id="d-odo1" value="' + esc(s.odoDebut) + '"></div>'
      + '<div class="champ"><label for="d-odo2">${T("odomètre à l’arrivée")}</label><input type="text" inputmode="decimal" class="n" id="d-odo2" value="' + esc(s.odoFin) + '"></div>'
      + '<div class="calc large" id="d-calc" aria-live="polite">' + esc(apercuKm(s)) + '</div>'
      + '</div>'
      + '<div class="boutons">'
      + (modif ? '<button type="button" id="d-annuler">${T("Annuler la modification")}</button>'
               : '<button type="button" class="gauche mini" id="d-vider">${T("Vider")}</button>')
      + '<button type="button" class="prim" id="d-ok">' + (modif ? '${T("Enregistrer")}' : '${T("+ Ajouter le déplacement")}') + '</button>'
      + '</div>'
      + '<div class="aide" style="margin-top:.45rem">${T("Seuls les déplacements d’affaires s’inscrivent ici. L’aller simple de la maison au lieu d’affaires habituel est personnel aux yeux du fisc.")}</div>'
      + '</div>';
  }

  /* ══ ONGLET VEHICULES ══════════════════════════════════════════════════ */
  function vehiculeVierge(){
    return { id: '', nom: '', marque: '', modele: '', annee: '', plaque: '', acquisLe: '',
      odometreAcquis: '', retireLe: '', odometreRetrait: '', notes: '' };
  }
  function depuisVehicule(v){
    return { id: v.id, nom: v.nom || '', marque: v.marque || '', modele: v.modele || '', annee: v.annee || '',
      plaque: v.plaque || '', acquisLe: v.acquisLe || '', odometreAcquis: champNombre(v.odometreAcquis),
      retireLe: v.retireLe || '', odometreRetrait: champNombre(v.odometreRetrait), notes: v.notes || '' };
  }
  function etatVehicule(v){
    if (v.retireLe && v.retireLe.slice(0, 4) <= String(ANNEE)) {
      return '<span class="pill g">${T("Retiré le")} ' + esc(szJour(v.retireLe)) + '</span>';
    }
    if (!v.enService) return '<span class="pill g">${T("Pas en service en")} ' + ANNEE + '</span>';
    return '<span class="pill ok">${T("En service")}</span>'
      + (v.retireLe ? ' <span class="pill g">${T("retrait prévu le")} ' + esc(szJour(v.retireLe)) + '</span>' : '');
  }
  function champOdo(v, champ){
    var o = v.odometre || {};
    var saisi = (o.saisi || {})[champ];
    var deduit = o[champ];
    var src = (o.source || {})[champ];
    var tape = ODO[v.id] && ODO[v.id][champ] != null ? ODO[v.id][champ] : null;
    var val = tape != null ? tape : (saisi != null ? champNombre(saisi) : '');
    var ph = (saisi == null && deduit != null) ? champNombre(deduit) : '';
    var lbl = champ === 'debut' ? '${T("Début")}' : '${T("Fin")}';
    var id = 'o-' + champ + '-' + v.id;
    var note = (saisi == null && deduit != null) ? source(src)
      : (saisi != null ? '' : (champ === 'debut' ? '${T("à saisir : le compteur au 1er janvier")}' : '${T("à saisir : le compteur au 31 décembre")}'));
    return '<label for="' + esc(id) + '">' + lbl + '</label>'
      + '<input type="text" inputmode="decimal" class="n" id="' + esc(id) + '" data-odo="' + esc(v.id) + '" data-champ="' + champ + '"'
      + ' value="' + esc(val) + '" placeholder="' + esc(ph) + '"' + (PM ? '' : ' disabled') + '>'
      + (note ? '<div class="src">' + esc(note) + '</div>' : '');
  }
  function carteVehicule(v){
    var o = v.odometre || {};
    var b = ligneBilan(v.id);
    var meta = [v.marque, v.modele, v.annee].filter(Boolean).join(' ');
    var h = '<div class="carte vcarte' + (PM ? ' mod' : '') + '" data-veh="' + esc(v.id) + '"'
      + (PM ? ' title="${T("Double-cliquez pour modifier la fiche")}"' : '') + '>'
      + '<div class="vt"><strong>' + esc(v.nom) + '</strong>' + etatVehicule(v) + '</div>'
      + '<div class="meta">' + esc(meta || '${T("Marque et modèle non précisés")}') + (v.plaque ? ' · ${T("plaque")} ' + esc(v.plaque) : '') + '</div>'
      + (v.acquisLe ? '<div class="meta">${T("Acquis le")} ' + esc(szJour(v.acquisLe))
          + (v.odometreAcquis != null ? ' — ' + km(v.odometreAcquis) : '') + '</div>' : '')
      + (v.retireLe ? '<div class="meta">${T("Retiré le")} ' + esc(szJour(v.retireLe))
          + (v.odometreRetrait != null ? ' — ' + km(v.odometreRetrait) : '') + '</div>' : '');
    if (v.enService) {
      var manque = (o.manque || []);
      h += '<div class="odo"><div class="ot">${T("Odomètre")} ' + ANNEE + '</div><div class="og">'
        + champOdo(v, 'debut') + champOdo(v, 'fin') + '</div>'
        + '<div class="kv" style="margin-top:.35rem"><span>${T("Km de l’année")} <b>'
        + (o.km != null ? km(o.km) : '—') + '</b></span>'
        + (b ? '<span>${T("d’affaires")} <b>' + km(b.kmAffaires) + '</b></span>'
             + '<span>${T("part")} <b>' + (b.part == null ? '—' : pct(b.part)) + '</b></span>' : '')
        + '</div>'
        + (manque.indexOf('incoherent') >= 0 ? '<div class="sous2 mauvais">${T("La fin est inférieure au début : corrigez l’un des deux.")}</div>' : '')
        + (PM ? '<div class="vact"><button type="button" class="mini" data-odo-enr="' + esc(v.id) + '">${T("Enregistrer l’odomètre")}</button></div>' : '')
        + '</div>';
    } else {
      h += '<div class="odo"><div class="aide">${T("Ce véhicule n’était pas en service en")} ' + ANNEE + '${T(" : aucun odomètre à relever cette année-là.")}</div></div>';
    }
    if (v.notes) h += '<div class="sous2" title="' + esc(v.notes) + '" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(v.notes) + '</div>';
    if (PM || PS) {
      h += '<div class="vact">'
        + (PM ? '<button type="button" class="mini" data-veh-mod="' + esc(v.id) + '">${T("Modifier")}</button>' : '')
        + (PS ? '<button type="button" class="mini danger" data-sup-veh="' + esc(v.id) + '">${T("Supprimer")}</button>' : '')
        + '</div>';
    }
    return h + '</div>';
  }
  function vueVehicules(){
    var L = (D.vehicules || []);
    if (!L.length) return appelPremierVehicule() + boiteVehicule();
    var t = tranche(L, 'veh');
    return '<div class="aide" style="display:flex;gap:.8rem;align-items:center">'
      + '<span>${T("L’odomètre de début d’une année se reprend tout seul de la fin de l’année précédente : relevez le compteur au 31 décembre et saisissez-le en « Fin » — l’année suivante démarre d’elle-même. Une valeur en gris est déduite ; tapez par-dessus pour la remplacer.")}</span>'
      + nav('veh', t.nbp) + '</div>'
      + '<div class="vgrille">' + t.vue.map(carteVehicule).join('') + '</div>'
      + boiteVehicule();
  }
  function boiteVehicule(){
    if (!VFORM) return '';
    var f = VFORM, modif = !!f.id;
    function ch(id, lbl, ctrl, large){
      return '<div class="champ' + (large ? ' large' : '') + '"><label for="' + id + '">' + lbl + '</label>' + ctrl + '</div>';
    }
    return '<div class="voile" id="v-voile"><div class="boite" role="dialog" aria-modal="true" aria-labelledby="v-titre">'
      + '<h3 id="v-titre">' + (modif ? '${T("Modifier le véhicule")}' : '${T("Inscrire un véhicule")}') + '</h3>'
      + '<div class="form2">'
      + ch('v-nom', '${T("Nom (obligatoire)")}', '<input type="text" id="v-nom" aria-label="${T("Nom (obligatoire)")}" maxlength="60" value="' + esc(f.nom) + '" placeholder="${T("Ex. : Civic grise")}">', true)
      + ch('v-marque', '${T("Marque")}', '<input type="text" id="v-marque" aria-label="${T("Marque")}" maxlength="40" value="' + esc(f.marque) + '">')
      + ch('v-modele', '${T("Modèle")}', '<input type="text" id="v-modele" aria-label="${T("Modèle")}" maxlength="40" value="' + esc(f.modele) + '">')
      + ch('v-annee', '${T("Année du modèle")}', '<input type="text" inputmode="numeric" maxlength="4" id="v-annee" aria-label="${T("Année du modèle")}" value="' + esc(f.annee) + '" placeholder="2021">')
      + ch('v-plaque', '${T("Plaque")}', '<input type="text" id="v-plaque" aria-label="${T("Plaque")}" maxlength="12" value="' + esc(f.plaque) + '">')
      + ch('v-acq', '${T("Acquis le")}', '<input type="date" id="v-acq" aria-label="${T("Acquis le")}" value="' + esc(f.acquisLe) + '">')
      + ch('v-oacq', '${T("Odomètre à l’acquisition")}', '<input type="text" inputmode="decimal" class="n" id="v-oacq" aria-label="${T("Odomètre à l’acquisition")}" value="' + esc(f.odometreAcquis) + '">')
      + ch('v-ret', '${T("Retiré le (vendu, remplacé)")}', '<input type="date" id="v-ret" aria-label="${T("Retiré le (vendu, remplacé)")}" value="' + esc(f.retireLe) + '">')
      + ch('v-oret', '${T("Odomètre au retrait")}', '<input type="text" inputmode="decimal" class="n" id="v-oret" aria-label="${T("Odomètre au retrait")}" value="' + esc(f.odometreRetrait) + '">')
      + ch('v-notes', '${T("Notes")}', '<textarea id="v-notes" aria-label="${T("Notes")}" rows="2" maxlength="400">' + esc(f.notes) + '</textarea>', true)
      + '</div>'
      + '<div class="aide" style="margin-top:.5rem">${T("L’odomètre à l’acquisition sert de début d’année l’année où le véhicule entre au registre. Le retrait ne supprime rien : le véhicule reste au registre avec ses kilomètres et ses dépenses, qui justifient les déductions passées.")}</div>'
      + '<div class="boutons"><button type="button" id="v-annuler">${T("Annuler")}</button>'
      + '<button type="button" class="prim" id="v-ok">' + (modif ? '${T("Enregistrer")}' : '${T("+ Inscrire le véhicule")}') + '</button></div>'
      + '</div></div>';
  }

  /* ══ ONGLET CHANGEMENTS ════════════════════════════════════════════════ */
  function nouveauChangement(){
    return { date: dateDefaut(), ancienId: '', odoAncien: '', nouveauId: '', odoNouveau: '', motif: '' };
  }
  function vueChangements(){
    var L = (D.changements || []);
    var t = tranche(L, 'chg');
    var h = '<div class="duo"><div><div class="carte"><h2>${T("Historique des changements")}' + nav('chg', t.nbp) + '</h2>';
    if (!L.length) {
      h += '<div class="vide"><strong>${T("Aucun changement inscrit")}</strong>'
        + '${T("Un changement de véhicule (vente, fin de location, remplacement) se note ici, avec l’odomètre des deux véhicules ce jour-là.")}</div>';
    } else {
      h += '<table><thead><tr><th>${T("Date")}</th><th>${T("Véhicule sortant")}</th><th></th><th>${T("Véhicule entrant")}</th><th>${T("Motif")}</th></tr></thead><tbody>'
        + t.vue.map(function(c){
            return '<tr class="ligne"><td class="nowrap">' + esc(szJour(c.date)) + '</td>'
              + '<td>' + (c.ancienId ? esc(nomVeh(c.ancienId)) + '<div class="sous2">' + km(c.odoAncien) + '</div>' : '<span class="gris">${T("aucun")}</span>') + '</td>'
              + '<td class="gris">→</td>'
              + '<td>' + (c.nouveauId ? esc(nomVeh(c.nouveauId)) + '<div class="sous2">' + km(c.odoNouveau) + '</div>' : '<span class="gris">${T("aucun")}</span>') + '</td>'
              + '<td>' + (c.motif ? esc(c.motif) : '<span class="gris">—</span>') + '</td></tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div></div><div>' + formChangement() + '</div></div>';
    return h;
  }
  function formChangement(){
    if (!PA) return '<div class="carte"><h2>${T("Enregistrer un changement")}</h2><div class="aide">${T("Votre rôle permet de consulter l’historique, pas d’y inscrire un changement.")}</div></div>';
    var c = CHG || (CHG = nouveauChangement());
    var L = (D.vehicules || []);
    if (!L.length) {
      return '<div class="carte"><h2>${T("Enregistrer un changement")}</h2><div class="aide">'
        + '${T("Un changement relie deux véhicules du registre : inscrivez d’abord le véhicule entrant (et le sortant, s’il roulait déjà pour l’entreprise).")}</div>'
        + '<div class="boutons"><button type="button" class="prim" data-act="veh-nouveau">${T("+ Inscrire un véhicule")}</button></div></div>';
    }
    var sortants = L.filter(function(v){ return !v.retireLe || v.id === c.ancienId; });
    return '<div class="carte" id="f-chg"><h2>${T("Enregistrer un changement")}</h2><div class="form2">'
      + '<div class="champ large"><label for="c-date">${T("Date du changement")}</label><input type="date" id="c-date" value="' + esc(c.date) + '"></div>'
      + '<div class="champ"><label for="c-anc">${T("Véhicule sortant")}</label><select id="c-anc">'
      + '<option value="">${T("— aucun (premier véhicule) —")}</option>'
      + sortants.map(function(v){ return '<option value="' + esc(v.id) + '"' + (c.ancienId === v.id ? ' selected' : '') + '>' + esc(libVeh(v)) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="champ"><label for="c-oanc">${T("Son odomètre ce jour-là")}</label><input type="text" inputmode="decimal" class="n" id="c-oanc" value="' + esc(c.odoAncien) + '"></div>'
      + '<div class="champ"><label for="c-nou">${T("Véhicule entrant")}</label><select id="c-nou">'
      + '<option value="">${T("— aucun (non remplacé) —")}</option>'
      + L.filter(function(v){ return !v.retireLe || v.id === c.nouveauId; }).map(function(v){ return '<option value="' + esc(v.id) + '"' + (c.nouveauId === v.id ? ' selected' : '') + '>' + esc(libVeh(v)) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="champ"><label for="c-onou">${T("Son odomètre ce jour-là")} </label><input type="text" inputmode="decimal" class="n" id="c-onou" value="' + esc(c.odoNouveau) + '"></div>'
      + '<div class="champ large"><label for="c-motif">${T("Motif (facultatif)")}</label><input type="text" id="c-motif" maxlength="200" value="' + esc(c.motif) + '" placeholder="${T("Vente, fin de location, accident…")}"></div>'
      + '</div><div class="boutons">'
      + '<button type="button" class="gauche mini" data-act="veh-nouveau">${T("+ Inscrire le nouveau véhicule")}</button>'
      + '<button type="button" class="prim" id="c-ok">${T("Enregistrer le changement")}</button></div>'
      + '<div class="aide" style="margin-top:.5rem">${T("Le véhicule entrant doit être inscrit d’abord. À l’enregistrement, le sortant reçoit cette date comme date de retrait, avec son odomètre ; l’entrant la reçoit comme date d’acquisition, avec le sien. C’est ce qui borne les kilomètres de chacun pour l’année du changement.")}</div>'
      + '</div>';
  }

  /* ══ ONGLET DEPENSES ═══════════════════════════════════════════════════ */
  function vueDepenses(){
    var L = (D.depenses || []);
    var h = '<div class="aide">${T("Les dépenses de véhicule se saisissent dans la fenêtre Dépenses, catégorie « Frais de véhicule à moteur » (ligne 9281) : on y choisit le véhicule et le type de frais. Ce registre en établit la part d’affaires ; la comptabilité, elle, garde la dépense entière.")}</div>';
    if (!L.length) {
      return h + '<div class="carte appel"><strong>${T("Aucune dépense de véhicule en")} ' + ANNEE + '</strong>'
        + '<div class="aide">${T("Essence, entretien, assurance, immatriculation, intérêts du prêt, stationnement d’affaires… Chaque reçu saisi dans les Dépenses avec la catégorie « Frais de véhicule à moteur » paraîtra ici.")}</div>'
        + '<button type="button" class="prim" data-act="ouvrir-depenses">${T("Ouvrir les Dépenses")}</button></div>';
    }
    var nonEtablies = L.filter(function(e){ return !e.partEtablie; }).length;
    var nonRatt = L.filter(function(e){ return !e.vehiculeId; }).length;
    if (nonEtablies) {
      h += '<div class="avis"><strong>' + nonEtablies + ' ' + szPl(nonEtablies, '${T("dépense sans part établie")}', '${T("dépenses sans part établie")}') + '.</strong> '
        + '${T("Faute d’odomètre complet pour l’année, elles se déclarent en entier. Complétez l’odomètre (onglet Véhicules) : la part s’appliquera d’elle-même.")}</div>';
    }
    if (nonRatt) {
      h += '<div class="avis"><strong>' + nonRatt + ' ' + szPl(nonRatt, '${T("dépense non rattachée")}', '${T("dépenses non rattachées")}') + '.</strong> '
        + '${T("Sans véhicule, elles prennent la part globale de l’année. Rattachez-les dans les Dépenses (fiche, Modifier) pour une part exacte.")}</div>';
    }
    var tot = { m: 0, d: 0, tps: 0, tvq: 0 };
    L.forEach(function(e){ tot.m += Number(e.montant) || 0; tot.d += Number(e.deductible) || 0; tot.tps += Number(e.tps) || 0; tot.tvq += Number(e.tvq) || 0; });
    var t = tranche(L, 'dep');
    h += '<div class="carte"><h2>${T("Dépenses de véhicule")} ' + ANNEE + ' <span class="gris">— ' + L.length + ' ' + szPl(L.length, '${T("dépense")}', '${T("dépenses")}') + '</span>' + nav('dep', t.nbp) + '</h2>'
      + '<table><thead><tr><th>${T("Date")}</th><th>${T("Véhicule")}</th><th>${T("Type de frais")}</th><th>${T("Fournisseur / description")}</th>'
      + '<th class="n">${T("Montant (hors taxes)")}</th><th class="n">${T("Part")}</th><th class="n">${T("Déductible")}</th></tr></thead><tbody>'
      + t.vue.map(function(e){
          var type = nomType(e.type) || szTd(e.typeNom) || '';
          var part = !e.partEtablie
            ? '<span class="pill att" title="${T("Odomètre de l’année incomplet : la dépense se déclare en entier.")}">${T("non établie")}</span>'
            : (pct(e.part) + (typeEntier(e.type) ? '<div class="sous2">${T("toujours 100 %")}</div>' : ''));
          return '<tr class="ligne"><td class="nowrap">' + esc(szJour(e.date)) + '</td>'
            + '<td>' + (e.vehiculeId ? esc(nomVeh(e.vehiculeId)) : '<span class="pill g">${T("non rattachée")}</span>') + '</td>'
            + '<td>' + (type ? esc(type) : '<span class="gris">${T("non précisé")}</span>') + '</td>'
            + '<td>' + esc(e.fournisseur || '—') + (e.description ? '<div class="sous2">' + esc(e.description) + '</div>' : '') + '</td>'
            + '<td class="n">' + argent(e.montant) + '</td>'
            + '<td class="n">' + part + '</td>'
            + '<td class="n">' + argent(e.deductible) + '</td></tr>';
        }).join('')
      + '<tr class="tot"><td colspan="4">${T("Total de l’année")}</td><td class="n">' + argent(tot.m) + '</td><td></td>'
      + '<td class="n">' + argent(Math.round(tot.d * 100) / 100) + '</td></tr>'
      + '</tbody></table></div>';
    return h;
  }

  /* ══ ONGLET BILAN FISCAL ═══════════════════════════════════════════════ */
  var MANQUE = {
    'odometre-debut':        '${T("Odomètre du début d’année manquant. Saisissez-le dans l’onglet Véhicules — ou la fin de l’année précédente, qui le reprend tout seul.")}',
    'odometre-fin':          '${T("Odomètre de fin d’année manquant. Relevez le compteur au 31 décembre (ou le jour de la vente) et saisissez-le dans l’onglet Véhicules.")}',
    'odometre-incoherent':   '${T("L’odomètre de fin est inférieur à celui du début : l’un des deux est faux. Corrigez-le dans l’onglet Véhicules.")}',
    'km-affaires-depassent': '${T("Les km d’affaires du registre dépassent les km totaux à l’odomètre : un déplacement est sans doute mal saisi (un zéro de trop ?), ou l’odomètre est faux. La part est plafonnée à 100 % en attendant.")}',
    'aucun-deplacement':     '${T("Des dépenses sont rattachées à ce véhicule, mais aucun déplacement n’est inscrit : sans registre, la part d’affaires ne se défend pas. Inscrivez les déplacements de l’année.")}',
    'depenses-non-rattachees': '${T("Des dépenses de véhicule ne sont rattachées à aucun véhicule : elles prennent la part globale de l’année (ou 100 % si elle n’est pas établie). Rattachez-les dans la fenêtre Dépenses.")}'
  };
  function nomLigne(l){ return l.id ? (l.nom || nomVeh(l.id)) : '${T("Non rattachées")}'; }
  function vueBilan(){
    var B = D.bilan || {};
    var L = B.vehicules || [];
    var T0 = B.total || {};
    if (!L.length) {
      return '<div class="carte appel"><strong>${T("Rien à déclarer pour")} ' + ANNEE + '</strong>'
        + '<div class="aide">${T("Aucun véhicule en service cette année-là et aucune dépense de véhicule. Inscrivez un véhicule pour tenir le registre : le bilan se remplira de lui-même.")}</div>'
        + (PA ? '<button type="button" class="prim" data-act="veh-nouveau">${T("+ Inscrire un véhicule")}</button>' : '') + '</div>';
    }
    var t = tranche(L, 'bil');
    var cols = t.vue;
    /* Les types de frais presents, dans l ordre du site. */
    var types = (D.types || []).filter(function(ty){
      return L.some(function(l){ return l.depenses && l.depenses.parType && l.depenses.parType[ty.cle]; }); });
    function somme(f){ return L.reduce(function(s, l){ return s + (Number(f(l)) || 0); }, 0); }
    function rang(lbl, f, ftot, cl){
      return '<tr' + (cl ? ' class="' + cl + '"' : '') + '><td>' + lbl + '</td>'
        + cols.map(function(l){ return '<td class="n">' + f(l) + '</td>'; }).join('')
        + '<td class="n">' + ftot() + '</td></tr>';
    }
    function grp(lbl){ return '<tr class="grp"><td colspan="' + (cols.length + 2) + '">' + lbl + '</td></tr>'; }
    function odo(l, c){
      if (!l.odometre) return '—';
      var v = l.odometre[c];
      if (v == null) return '<span class="attn">${T("manquant")}</span>';
      var s = source((l.odometre.source || {})[c]);
      return szNombre(v, 1) + (s && s !== '${T("saisi")}' ? '<small>' + esc(s) + '</small>' : '');
    }
    var kmPersoTot = (T0.kmTotal ? Math.max(0, Math.round((T0.kmTotal - (T0.kmAffaires || 0)) * 10) / 10) : null);
    var h = '<div class="duo"><div><div class="carte"><h2>${T("Bilan")} ' + ANNEE + nav('bil', t.nbp) + '</h2>'
      + '<table class="bilan"><thead><tr><th></th>'
      + cols.map(function(l){ return '<th class="n">' + esc(nomLigne(l)) + '</th>'; }).join('')
      + '<th class="n">${T("Total")}</th></tr></thead><tbody>'
      + grp('${T("Kilométrage")}')
      + rang('${T("Odomètre au début")}', function(l){ return odo(l, 'debut'); }, function(){ return ''; })
      + rang('${T("Odomètre à la fin")}', function(l){ return odo(l, 'fin'); }, function(){ return ''; })
      + rang('${T("Km totaux")}', function(l){ return l.kmTotal == null ? (l.id ? '<span class="attn">${T("à établir")}</span>' : '—') : km(l.kmTotal); }, function(){ return T0.kmTotal ? km(T0.kmTotal) : '—'; })
      + rang('${T("Km d’affaires (registre)")}', function(l){ return l.id ? km(l.kmAffaires) : '—'; }, function(){ return km(T0.kmAffaires || 0); })
      + rang('${T("Km personnels")}', function(l){ return l.kmPersonnels == null ? '—' : km(l.kmPersonnels); }, function(){ return kmPersoTot == null ? '—' : km(kmPersoTot); })
      + rang('${T("Part d’affaires")}', function(l){ return l.part == null ? '<span class="attn">${T("à établir")}</span>' : pct(l.part); }, function(){ return T0.part == null ? '<span class="attn">${T("à établir")}</span>' : pct(T0.part); }, 'cle')
      + grp('${T("Dépenses payées (hors taxes)")}')
      + types.map(function(ty){
          return rang(esc(szTd(ty.nom)) + (ty.entiere ? ' <span class="pill g">' + pct(1) + '</span>' : ''),
            function(l){ var v = l.depenses && l.depenses.parType ? l.depenses.parType[ty.cle] : 0; return v ? argent(v) : '<span class="gris">—</span>'; },
            function(){ return argent(somme(function(l){ return l.depenses && l.depenses.parType ? l.depenses.parType[ty.cle] : 0; })); });
        }).join('')
      + rang('${T("Total des dépenses")}', function(l){ return argent(l.depenses ? l.depenses.total : 0); }, function(){ return argent(T0.depenses || 0); }, 'cle')
      + grp('${T("À déclarer")}')
      + rang('${T("Déductible — T2125 ligne 9281 / TP-80")}', function(l){ return argent(l.deductible); }, function(){ return argent(T0.deductible || 0); }, 'cle')
      + rang('${T("TPS payée")}', function(l){ return argent(l.tps); }, function(){ return argent(somme(function(l){ return l.tps; })); })
      + rang('${T("CTI admissibles — ligne 106")}', function(l){ return argent(l.tpsAdmissible); }, function(){ return argent(T0.tpsAdmissible || 0); }, 'cle')
      + rang('${T("TVQ payée")}', function(l){ return argent(l.tvq); }, function(){ return argent(somme(function(l){ return l.tvq; })); })
      + rang('${T("RTI admissibles — ligne 206")}', function(l){ return argent(l.tvqAdmissible); }, function(){ return argent(T0.tvqAdmissible || 0); }, 'cle')
      + '</tbody></table></div></div><div>';
    /* Ce qui manque, vehicule par vehicule, avec le geste qui le corrige. */
    var items = [];
    L.forEach(function(l){
      (l.manque || []).forEach(function(c){
        items.push('<li><strong>' + esc(nomLigne(l)) + '</strong> — ' + esc(MANQUE[c] || c) + '</li>');
      });
    });
    if (items.length) {
      h += '<div class="avis"><strong>${T("À compléter avant de déclarer")}</strong> <span class="gris">— '
        + items.length + ' ' + szPl(items.length, '${T("point")}', '${T("points")}') + '</span>'
        + '<ul class="manque">' + items.join('') + '</ul>'
        + (L.some(function(l){ return l.part == null && l.depenses && l.depenses.n; })
            ? '<div class="aide">${T("Tant qu’une part n’est pas établie, les dépenses de ce véhicule se déclarent en entier : on ne fabrique ni une part de 0 % qui ferait disparaître une déduction, ni une part inventée.")}</div>'
            : '')
        + '</div>';
    } else {
      h += '<div class="ok-box"><strong class="bon">${T("Bilan complet.")}</strong> ${T("Chaque part d’affaires est appuyée par l’odomètre et par le registre des déplacements.")}</div>';
    }
    h += '<div class="carte"><h2>${T("Où reporter ces chiffres")}</h2><ul class="lignes">'
      + '<li>${T("Fédéral — formulaire T2125, ligne 9281 « Frais de véhicule à moteur » : le déductible.")}</li>'
      + '<li>${T("Québec — formulaire TP-80, frais de véhicule à moteur : le même déductible.")}</li>'
      + '<li>${T("Déclaration de TPS — ligne 106 : les CTI admissibles.")}</li>'
      + '<li>${T("Déclaration de TVQ — ligne 206 : les RTI admissibles.")}</li>'
      + '</ul></div>'
      + '<div class="carte"><h2>${T("La règle")}</h2><div class="aide">'
      + '${T("Part d’affaires = km d’affaires de l’année ÷ km totaux à l’odomètre (ARC, guide T4002 ; Revenu Québec). Elle s’applique aux dépenses ET aux taxes récupérables.")} '
      + '<strong>${T("Stationnement et péages d’affaires : 100 %")}</strong>${T(", hors de la répartition.")} '
      + '${T("La comptabilité garde la dépense entière ; seule la déclaration applique la part.")}'
      + '</div></div></div></div>';
    return h;
  }

  /* ── LE DESSIN ──────────────────────────────────────────────────────── */
  function rendu(){
    var h = bandeauLecture();
    if (ONGLET === 'vehicules') h += vueVehicules();
    else if (ONGLET === 'changements') h += vueChangements();
    else if (ONGLET === 'depenses') h += vueDepenses();
    else if (ONGLET === 'bilan') h += vueBilan();
    else h += vueRegistre();
    if (ONGLET !== 'vehicules' && VFORM) h += boiteVehicule();
    return h;
  }
  function cleListe(){
    return ({ registre: 'reg', vehicules: 'veh', changements: 'chg', depenses: 'dep' })[ONGLET] || '';
  }
  function dessiner(){
    onglets(); outils();
    if (!D) return;
    var deps = (D.deplacements || []);
    var kmA = (D.bilan && D.bilan.total) ? D.bilan.total.kmAffaires : 0;
    elSous.textContent = ANNEE + ' · ' + deps.length + ' ' + szPl(deps.length, '${T("déplacement")}', '${T("déplacements")}')
      + ' · ' + km(kmA || 0) + ' ${T("d’affaires")}';
    corps.innerHTML = rendu();
    /* LE BUDGET SE MESURE : si la page deborde, une ligne de moins et on
       redessine (quelques tours au plus) ; jamais de glissiere. */
    var cle = cleListe(), tours = 0;
    while (cle && corps.scrollHeight > corps.clientHeight + 1 && BU[cle] > 1 && tours < 60) {
      BU[cle]--; tours++;
      corps.innerHTML = rendu();
    }
    var b = document.getElementById('v-nom');
    if (b && VFORM && !VFORM._vu) { VFORM._vu = true; try { b.focus(); } catch (e) {} }
  }

  /* ⚠ LA SAISIE EST RAMASSEE A CHAQUE FRAPPE (ecouteurs input et change plus
     bas), PAS AU DEBUT DU DESSIN. Redessiner sans l avoir relue rendrait les
     champs a leur valeur d origine — un changement de page du registre
     effacerait le deplacement a moitie tape a cote.
     ⚠⚠ ET SURTOUT PAS AU DEBUT DU DESSIN, premier jet : quand un geste
     REMPLACE la saisie (enregistrer, annuler, ouvrir une ligne en
     modification), le formulaire encore a l ecran porte l ANCIENNE ; le relire
     a ce moment-la la recopiait dans la nouvelle — le deplacement qu on venait
     d enregistrer revenait dans le formulaire vide. */
  function lu(id){
    var e = document.getElementById(id);
    return (e && typeof e.value === 'string') ? e.value : null;
  }
  function coche(id){
    var e = document.getElementById(id);
    return (e && typeof e.checked === 'boolean') ? e.checked : null;
  }
  function ramasser(){
    var v;
    if (SAISIE && document.getElementById('d-dest')) {
      [['d-date', 'date'], ['d-veh', 'vehiculeId'], ['d-depart', 'depart'], ['d-dest', 'destination'],
       ['d-raison', 'raison'], ['d-detail', 'detail'], ['d-km', 'km'], ['d-odo1', 'odoDebut'],
       ['d-odo2', 'odoFin'], ['d-cmd', 'commande']].forEach(function(p){
        v = lu(p[0]); if (v != null) SAISIE[p[1]] = v;
      });
      v = coche('d-ar'); if (v != null) SAISIE.allerRetour = v;
    }
    if (CHG && document.getElementById('c-ok')) {
      [['c-date', 'date'], ['c-anc', 'ancienId'], ['c-oanc', 'odoAncien'], ['c-nou', 'nouveauId'],
       ['c-onou', 'odoNouveau'], ['c-motif', 'motif']].forEach(function(p){
        v = lu(p[0]); if (v != null) CHG[p[1]] = v;
      });
    }
    if (VFORM && document.getElementById('v-ok')) {
      [['v-nom', 'nom'], ['v-marque', 'marque'], ['v-modele', 'modele'], ['v-annee', 'annee'],
       ['v-plaque', 'plaque'], ['v-acq', 'acquisLe'], ['v-oacq', 'odometreAcquis'], ['v-ret', 'retireLe'],
       ['v-oret', 'odometreRetrait'], ['v-notes', 'notes']].forEach(function(p){
        v = lu(p[0]); if (v != null) VFORM[p[1]] = v;
      });
    }
    Array.prototype.forEach.call(corps.querySelectorAll('input[data-odo]') || [], function(el){
      var id = el.getAttribute('data-odo'), c = el.getAttribute('data-champ');
      if (typeof el.value !== 'string') return;
      if (!ODO[id]) ODO[id] = {};
      ODO[id][c] = el.value;
    });
  }
  function formSale(){
    ramasser();
    var s = SAISIE;
    var dep = !!(s && (s.id || String(s.destination || '').trim() || String(s.km || '').trim()
      || String(s.odoDebut || '').trim() || String(s.detail || '').trim()));
    var chg = !!(CHG && (CHG.ancienId || CHG.nouveauId || String(CHG.odoAncien || '').trim() || String(CHG.motif || '').trim()));
    return dep || chg || !!VFORM;
  }

  /* ── LES GESTES ─────────────────────────────────────────────────────── */
  function ouvrirVehicule(id){
    if (id) { var v = vehicule(id); if (!v) return; VFORM = depuisVehicule(v); }
    else VFORM = vehiculeVierge();
    ECHAP = false;
    dessiner();
  }
  function fermerVehicule(){ VFORM = null; ECHAP = false; dessiner(); }

  function enregistrerDeplacement(b){
    ramasser();
    var s = SAISIE;
    if (!s) return;
    var k = lireNombre(s.km), a = lireNombre(s.odoDebut), z = lireNombre(s.odoFin);
    if ((k != null && !isFinite(k)) || (a != null && !isFinite(a)) || (z != null && !isFinite(z))) {
      szDire('${T("Kilomètres ou odomètre illisibles : des chiffres seulement.")}', 'err'); return;
    }
    var charge = { id: s.id || undefined, date: s.date, vehiculeId: s.vehiculeId, depart: s.depart,
      destination: s.destination, raison: s.raison, detail: s.detail, km: k, allerRetour: !!s.allerRetour,
      odoDebut: a, odoFin: z, commande: s.commande };
    if (b) b.disabled = true;
    szDire('${T("Enregistrement…")}');
    appeler('vehicules:deplacement', [charge]).then(function(r){
      if (b) b.disabled = false;
      if (!r || !r.ok) { szDire(expliquer(r, 'deplacement'), 'err'); if (r && r.motif === 'introuvable') charger(); return; }
      var autreAnnee = String(s.date || '').slice(0, 4) !== String(ANNEE);
      szDire((s.id ? '${T("Déplacement modifié.")}' : '${T("Déplacement inscrit.")}')
        + (autreAnnee ? ' ${T("Il est daté d’une autre année : choisissez-la en haut pour le voir.")}' : ''), autreAnnee ? 'att' : 'bon');
      var garde = SAISIE;
      SAISIE = null;
      SAISIE = nouveauDeplacement(garde);
      charger();
    });
  }
  function enregistrerVehicule(b){
    ramasser();
    var f = VFORM;
    if (!f) return;
    var oa = lireNombre(f.odometreAcquis), orr = lireNombre(f.odometreRetrait);
    if ((oa != null && !isFinite(oa)) || (orr != null && !isFinite(orr))) {
      szDire('${T("Odomètre illisible : des chiffres seulement.")}', 'err'); return;
    }
    if (!String(f.nom || '').trim()) { szDire(MOTIFS.nom, 'err'); var n = document.getElementById('v-nom'); if (n) n.focus(); return; }
    var charge = { id: f.id || undefined, nom: f.nom, marque: f.marque, modele: f.modele, annee: f.annee,
      plaque: f.plaque, acquisLe: f.acquisLe, odometreAcquis: oa, retireLe: f.retireLe,
      odometreRetrait: orr, notes: f.notes };
    if (b) b.disabled = true;
    szDire('${T("Enregistrement…")}');
    appeler('vehicules:ecrire', [charge]).then(function(r){
      if (b) b.disabled = false;
      if (!r || !r.ok) { szDire(expliquer(r, 'vehicule'), 'err'); return; }
      szDire(f.id ? '${T("Fiche du véhicule enregistrée.")}' : '${T("Véhicule inscrit. Saisissez maintenant son odomètre de l’année.")}', 'bon');
      VFORM = null;
      if (!f.id) ONGLET = 'vehicules';
      charger();
    });
  }
  function enregistrerOdometre(id, b){
    ramasser();
    var o = ODO[id] || {};
    var v = vehicule(id);
    if (!v) return;
    var saisi = (v.odometre && v.odometre.saisi) || {};
    function valeur(c){
      var t = o[c] != null ? o[c] : (saisi[c] != null ? String(saisi[c]) : '');
      return lireNombre(t);
    }
    var deb = valeur('debut'), fin = valeur('fin');
    if ((deb != null && !isFinite(deb)) || (fin != null && !isFinite(fin))) {
      szDire('${T("Odomètre illisible : des chiffres seulement.")}', 'err'); return;
    }
    if (b) b.disabled = true;
    szDire('${T("Enregistrement…")}');
    appeler('vehicules:odometre', [id, ANNEE, { debut: deb, fin: fin }]).then(function(r){
      if (b) b.disabled = false;
      if (!r || !r.ok) { szDire(expliquer(r, 'odometre'), 'err'); return; }
      delete ODO[id];
      szDire('${T("Odomètre enregistré pour")} ' + v.nom + ' (' + ANNEE + ').', 'bon');
      charger();
    });
  }
  function enregistrerChangement(b){
    ramasser();
    var c = CHG;
    if (!c) return;
    var oa = lireNombre(c.odoAncien), on = lireNombre(c.odoNouveau);
    if ((oa != null && !isFinite(oa)) || (on != null && !isFinite(on))) {
      szDire('${T("Odomètre illisible : des chiffres seulement.")}', 'err'); return;
    }
    if (b) b.disabled = true;
    szDire('${T("Enregistrement…")}');
    appeler('vehicules:changement', [{ date: c.date, ancienId: c.ancienId, odoAncien: oa,
      nouveauId: c.nouveauId, odoNouveau: on, motif: c.motif }]).then(function(r){
      if (b) b.disabled = false;
      if (!r || !r.ok) { szDire(expliquer(r, 'changement'), 'err'); return; }
      szDire('${T("Changement enregistré : les dates et les odomètres des deux véhicules sont à jour.")}', 'bon');
      CHG = nouveauChangement();
      charger();
    });
  }
  /* ⚠ ON ARME EN DEUX TEMPS, comme toute action qui detruit, et SANS
     REDESSINER : seul le texte du bouton change. Un redessin entre les deux
     clics remplacerait le bouton, et le second clic tomberait dans le vide. */
  function armer(b, cle, faire){
    if (ARME && ARME.cle === cle) {
      clearTimeout(ARME.t); ARME = null;
      b.classList.remove('aconf');
      faire();
      return;
    }
    if (ARME) desarmer();
    b.setAttribute('data-texte', b.textContent);
    b.textContent = '${T("Confirmer ?")}';
    b.classList.add('aconf');
    ARME = { cle: cle, b: b, t: setTimeout(desarmer, 5000) };
  }
  function desarmer(){
    if (!ARME) return;
    clearTimeout(ARME.t);
    if (ARME.b) { ARME.b.textContent = ARME.b.getAttribute('data-texte') || '${T("Supprimer")}'; ARME.b.classList.remove('aconf'); }
    ARME = null;
  }
  function supprimerDeplacement(id){
    appeler('vehicules:deplacementOter', [id]).then(function(r){
      if (!r || !r.ok) { szDire(expliquer(r, 'deplacement'), 'err'); if (r && r.motif === 'introuvable') charger(); return; }
      if (SAISIE && SAISIE.id === id) SAISIE = null;
      szDire('${T("Déplacement retiré du registre.")}', 'bon');
      charger();
    });
  }
  function supprimerVehicule(id){
    appeler('vehicules:supprimer', [id]).then(function(r){
      if (!r || !r.ok) { szDire(expliquer(r, 'vehicule'), r && r.motif === 'utilise' ? 'att' : 'err'); return; }
      szDire('${T("Véhicule retiré du registre.")}', 'bon');
      charger();
    });
  }

  /* ── UN SEUL ECOUTEUR POUR TOUTE LA PAGE ────────────────────────────────
     ⚠ DELEGUE SUR document : chaque dessin remplace le balisage, et un
     ecouteur pose sur un bouton mourrait au premier redessin. */
  document.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var o = t.closest('[data-o]');
    if (o && elOnglets.contains(o)) {
      var n = o.getAttribute('data-o');
      if (n === ONGLET) return;
      desarmer(); ramasser();
      ONGLET = n; dessiner(); return;
    }
    var a = t.closest('[data-act]');
    if (a) {
      var act = a.getAttribute('data-act');
      if (act === 'veh-nouveau') { if (PA) ouvrirVehicule(''); return; }
      if (act === 'ouvrir-depenses') {
        if (P && P.ouvrirModule) { P.ouvrirModule('depenses'); szDire('${T("Les Dépenses s’ouvrent…")}'); }
        return;
      }
    }
    var pg = t.closest('[data-pg]');
    if (pg) {
      var k = pg.getAttribute('data-pg');
      PG[k] = (PG[k] || 0) + (parseInt(pg.getAttribute('data-d'), 10) || 0);
      desarmer(); dessiner(); return;
    }
    var sd = t.closest('[data-sup-dep]');
    if (sd) { var idd = sd.getAttribute('data-sup-dep'); armer(sd, 'dep:' + idd, function(){ supprimerDeplacement(idd); }); return; }
    var sv = t.closest('[data-sup-veh]');
    if (sv) { var idv = sv.getAttribute('data-sup-veh'); armer(sv, 'veh:' + idv, function(){ supprimerVehicule(idv); }); return; }
    var mv = t.closest('[data-veh-mod]');
    if (mv) { ouvrirVehicule(mv.getAttribute('data-veh-mod')); return; }
    var oe = t.closest('[data-odo-enr]');
    if (oe) { enregistrerOdometre(oe.getAttribute('data-odo-enr'), oe); return; }
    var id = t.id || '';
    if (id === 'd-ok') { enregistrerDeplacement(t); return; }
    if (id === 'd-annuler') { SAISIE = nouveauDeplacement(SAISIE); SAISIE.destination = ''; dessiner(); szDire('${T("Modification abandonnée.")}'); return; }
    if (id === 'd-vider') { SAISIE = nouveauDeplacement(null); dessiner(); return; }
    if (id === 'c-ok') { enregistrerChangement(t); return; }
    if (id === 'v-ok') { enregistrerVehicule(t); return; }
    if (id === 'v-annuler') { fermerVehicule(); return; }
    /* Un clic sur une ligne la MARQUE, sans redessiner (voir l en-tete). */
    var tr = t.closest('tr[data-dep]');
    if (tr && !t.closest('button')) {
      Array.prototype.forEach.call(corps.querySelectorAll('tr.sel') || [], function(x){ if (x !== tr && !(SAISIE && x.getAttribute('data-dep') === SAISIE.id)) x.classList.remove('sel'); });
      tr.classList.add('sel');
    }
  });
  document.addEventListener('dblclick', function(ev){
    var t = ev.target;
    if (!t || !t.closest || t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-dep]');
    if (tr && PM) {
      var id = tr.getAttribute('data-dep');
      var d = (D.deplacements || []).filter(function(x){ return x.id === id; })[0];
      if (!d) return;
      SAISIE = depuisDeplacement(d);
      dessiner();
      var f = document.getElementById('d-dest'); if (f) f.focus();
      szDire('${T("Déplacement ouvert en modification.")}');
      return;
    }
    var vc = t.closest('[data-veh]');
    if (vc && PM) ouvrirVehicule(vc.getAttribute('data-veh'));
  });
  /* La saisie suit la frappe : l apercu des km et l etiquette de la precision
     changent EN PLACE, sans redessin (le curseur ne saute pas). */
  document.addEventListener('input', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    ramasser();
    if (t.closest('#f-dep')) {
      var c = document.getElementById('d-calc');
      if (c) c.textContent = apercuKm(SAISIE);
    }
  });
  document.addEventListener('change', function(ev){
    var t = ev.target;
    if (!t) return;
    if (t.id === 'f-veh') { FVEH = t.value; PG.reg = 0; dessiner(); return; }
    ramasser();
    if (t.closest && t.closest('#f-dep')) {
      var c = document.getElementById('d-calc');
      if (c) c.textContent = apercuKm(SAISIE);
      if (t.id === 'd-raison') {
        var l = document.getElementById('d-detail-l');
        if (l) l.textContent = t.value === 'autre' ? '${T("Précision (obligatoire)")}' : '${T("Précision (facultative)")}';
        if (t.value === 'autre') { var dd = document.getElementById('d-detail'); if (dd) dd.focus(); }
      }
    }
  });
  document.addEventListener('keydown', function(ev){
    var t = ev.target;
    if (ev.key === 'Enter' && t && t.closest && t.tagName !== 'TEXTAREA' && t.tagName !== 'BUTTON') {
      if (t.closest('#f-dep')) { ev.preventDefault(); enregistrerDeplacement(document.getElementById('d-ok')); return; }
      if (t.closest('#f-chg')) { ev.preventDefault(); enregistrerChangement(document.getElementById('c-ok')); return; }
      if (t.closest('#v-voile')) { ev.preventDefault(); enregistrerVehicule(document.getElementById('v-ok')); return; }
      if (t.getAttribute && t.getAttribute('data-odo')) { ev.preventDefault(); enregistrerOdometre(t.getAttribute('data-odo'), null); return; }
    }
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    if (ARME) { desarmer(); return; }
    if (VFORM) {
      ramasser();
      var rempli = !!(String(VFORM.nom || '').trim() && !VFORM.id);
      if (rempli && !ECHAP) { ECHAP = true; szDire('${T("Appuyez de nouveau sur Échap pour fermer sans enregistrer.")}', 'att'); return; }
      fermerVehicule(); return;
    }
    if (SAISIE && SAISIE.id) { SAISIE = nouveauDeplacement(SAISIE); dessiner(); szDire('${T("Modification abandonnée.")}'); return; }
    if (formSale()) { szDire('${T("Une saisie est en cours : enregistrez-la ou videz le formulaire avant de fermer.")}', 'att'); return; }
    if (P && P.fermer) P.fermer();
  });
  window.addEventListener('resize', function(){
    clearTimeout(window._vhT);
    window._vhT = setTimeout(function(){ BU = { reg: 0, veh: 0, chg: 0, dep: 0, bil: 4 }; if (D) dessiner(); }, 180);
  });

  /* ⚠ ON RECHARGE QUAND LA FENETRE REVIENT AU PREMIER PLAN : les depenses de
     vehicule se saisissent AILLEURS (fenetre Depenses), et un bilan fige sur
     l etat d il y a une heure est un bilan faux qui ne se declare pas comme tel.
     ⚠⚠ JAMAIS PENDANT UNE SAISIE : recharger la remettrait a zero. */
  function rechargerSiLibre(){ if (!OCCUPE && !formSale()) charger(); }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) rechargerSiLibre(); });
  window.szActualiser = rechargerSiLibre;
  window.szRevenir = rechargerSiLibre;

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

  charger();
})();
</script></body></html>`;
}

module.exports = { pageVehicules };
