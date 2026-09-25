'use strict';

/*
 * FENÊTRE « RAPPORTS ET BUDGET » — NATIVE (#116, phase 1)
 * =============================================================================
 * Sa demande du 2026-09-14 : « un outil de génération de rapports efficace qui
 * peut me donner des résultats pour les années demandées, la possibilité de
 * consulter les données des années précédentes, et la possibilité de créer une
 * gestion budgétaire pour l'entreprise ».
 *
 * TROIS ONGLETS, UN PAR PHRASE DE SA DEMANDE :
 *   · Résultats — l'état des résultats d'un exercice, mois par mois ;
 *   · Comparer  — plusieurs exercices côte à côte, avec les variations ;
 *   · Budget    — le prévu par poste, et l'écart contre le réel.
 *
 * ⚠⚠ CETTE FENÊTRE NE CALCULE RIEN. Pas une addition, pas un pourcentage. Tout
 * vient de `Compta` (assets/js/compta.js), par l'op `compta:donnees`, et y est
 * éprouvé au cent près par `tools/check/banc-compta.js`. La raison est concrète
 * et déjà payée : quatorze endroits du site recopiaient la même formule de
 * rabais et la comptaient tous DEUX FOIS. Un quinzième ici n'aurait fait
 * qu'agrandir le problème. La fenêtre affiche.
 *
 * ⚠⚠ ELLE DIT CE QU'ELLE IGNORE, ET CE N'EST PAS UNE POLITESSE. Ces chiffres se
 * calculent sur ce que le SITE enregistre : un apport du propriétaire, un prêt,
 * un amortissement, une paie hors dépenses ou un ajustement du comptable n'y
 * sont pas. Un rapport muet sur ses trous se lit comme un rapport complet — et
 * un résultat net qu'on croit exact oriente de vraies décisions. La mention est
 * portée par le RAPPORT lui-même (champ << limite >>), pas écrite en dur ici :
 * ainsi elle ne peut pas être oubliée à l'écran le jour où quelqu'un remanie
 * cette fenêtre.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit. Cinq fois que ça casse
 * une fenêtre dans ce projet.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU, SEP_DEC } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la langue du
   poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur enregistrable
   (voir src/langue/index.js). Les LIBELLÉS DES POSTES, eux, viennent du site
   avec les chiffres : les recopier ici ferait deux listes qui divergeraient. */
const T = require('../langue').tr('comptabilite');
const LANGUE = require('../langue');

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
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;
  padding:.55rem 1.05rem .1rem}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center}
.corps{flex:1 1 auto;min-height:0;padding:.7rem 1.05rem .9rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.8rem .9rem}
.carte h2{margin:0 0 .55rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
select,input,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
input{cursor:text;text-align:right;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
select:focus,input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
/* ── Les grands chiffres du haut ─────────────────────────────────────────── */
.chiffres{display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));gap:.6rem}
.chiffre{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.chiffre .lbl{font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2)}
.chiffre .val{font:700 1.18rem/1.25 ui-monospace,Consolas,monospace;margin-top:.15rem}
.chiffre .sous{font-size:.68rem;color:var(--tx3);margin-top:.1rem}
.chiffre.pos .val{color:var(--tx-ok)}
.chiffre.neg .val{color:var(--tx-err2)}
/* ── Tableaux ────────────────────────────────────────────────────────────── */
table{width:100%;border-collapse:collapse;font-size:.79rem}
thead th{text-align:left;padding:.22rem .35rem;font-size:.65rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
thead th.n,tbody td.n{text-align:right;font-family:ui-monospace,Consolas,monospace}
tbody td{padding:.26rem .35rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody tr:hover td{background:var(--v03)}
tbody tr.tot td{border-top:1px solid var(--v16);font-weight:700}
tbody tr.sous td{color:var(--tx2)}
.bon{color:var(--tx-ok)}.mauvais{color:var(--tx-err2)}.gris{color:var(--tx2)}
.pill{display:inline-block;font-size:.64rem;padding:.05rem .45rem;border-radius:99px;
  white-space:nowrap;font-weight:700}
.pill.g{background:rgba(148,163,184,.14);color:var(--tx-94a3b8);font-weight:600}
.pill.att{background:rgba(234,179,8,.16);color:var(--tx-att)}
/* ── L'avertissement : visible, pas décoratif ────────────────────────────── */
.avert{border:1px solid rgba(234,179,8,.45);background:rgba(234,179,8,.09);
  border-radius:10px;padding:.55rem .75rem;font-size:.78rem;line-height:1.45}
.avert strong{color:var(--tx-att)}
.avert ul{margin:.35rem 0 0;padding-left:1.1rem}
.limite{font-size:.75rem;color:var(--tx2);line-height:1.5;
  border-left:2px solid var(--v16);padding-left:.6rem}
/* ── Le budget ───────────────────────────────────────────────────────────── */
.mois12{display:grid;grid-template-columns:repeat(12,1fr);gap:.25rem;margin-top:.3rem}
.mois12 label{display:block;font-size:.6rem;color:var(--tx3);text-align:center}
.mois12 input{width:100%;padding:.18rem .2rem;font-size:.7rem}
.vide{padding:1.3rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Rapports et budget ».
 * `onglet` = 'resultats', 'comparer' ou 'budget' pour ouvrir dessus.
 * ⚠ Sans ce paramètre, le garde-fou ne dessinerait que le premier onglet : il
 * ne simule aucun clic, et les deux autres resteraient dans l'ombre — c'est
 * exactement comme ça qu'un écran entier passe des mois sans être regardé.
 */
function pageComptabilite(onglet) {
  const ok = ['comparer', 'budget'];
  const depart = (ok.indexOf(String(onglet || '')) >= 0) ? String(onglet) : 'resultats';
  return `${TETE()}
<title>${T("Rapports et budget — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.mktstats}</span><h1>${T("Rapports et budget")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets" id="onglets"></div>
<div class="barreoutils" id="outils"></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('comptabilite')}
  var corps = document.getElementById('corps');
  var elOnglets = document.getElementById('onglets');
  var elOutils = document.getElementById('outils');
  var elSous = document.getElementById('sous');

  var D = null;              /* le rapport, tel que le site le rend */
  var ONGLET = '${depart}';
  var ANNEES = [];           /* les exercices demandes, tries */
  var RO = true;             /* pas de droit d ecriture tant qu on ne l a pas lu */
  var OCCUPE = false;
  var SAISIE = null;         /* le budget en cours d edition : { cle: [12] } */
  var OUVERTS = {};          /* postes dont les douze mois sont deplies */

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function argent(n){ return szArgent(n); }
  function pct(n){
    if (n === null || n === undefined) return '—';
    return (n > 0 ? '+' : '') + String(n).replace('.', '${SEP_DEC()}') + ' %';
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux rapports comptables.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    annee:              '${T("Cette année n’est pas valable.")}',
    saisie:             '${T("Le budget envoyé n’a pas la forme attendue.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 150)) + ')';
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
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  var MOIS = ['${T("Jan")}','${T("Fév")}','${T("Mar")}','${T("Avr")}','${T("Mai")}','${T("Jun")}',
              '${T("Jul")}','${T("Aoû")}','${T("Sep")}','${T("Oct")}','${T("Nov")}','${T("Déc")}'];

  /* ── LE CHARGEMENT ────────────────────────────────────────────────────────
     ⚠ UNE SEULE PORTE, ET ELLE REND TOUT : les resultats des annees demandees,
     la comparaison, le budget de la derniere annee et ses ecarts. Deux portes
     pour la meme donnee, ce sont deux reponses qui peuvent diverger d un
     rafraichissement a l autre. */
  function charger(){
    if (OCCUPE) return Promise.resolve();
    OCCUPE = true;
    return appeler('compta:donnees', [{ annees: ANNEES }]).then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) { D = null; dessiner(); vide('${T("Rapports indisponibles")}', expliquer(r)); return; }
      D = r;
      RO = !r.peutEcrire;
      ANNEES = (r.annees || []).slice();
      SAISIE = null; OUVERTS = {};
      dessiner();
    });
  }

  /* ── LE CHOIX DES EXERCICES ───────────────────────────────────────────────
     ⚠ SUR L ONGLET << COMPARER >>, ON COCHE PLUSIEURS ANNEES ; ailleurs, on en
     choisit UNE. C est la difference entre ses deux phrases : << des resultats
     pour les annees demandees >> et << consulter les donnees des annees
     precedentes >>. Un seul selecteur pour les deux aurait force a choisir
     laquelle des deux demandes on servait. */
  function outils(){
    if (!D) { elOutils.innerHTML = ''; return; }
    var dispo = D.anneesDisponibles || [];
    var h = '';
    if (ONGLET === 'comparer') {
      h += '<span class="gris" style="font-size:.76rem">${T("Exercices comparés :")}</span>';
      h += dispo.map(function(a){
        var on = ANNEES.indexOf(a) >= 0;
        return '<button class="mini' + (on ? ' actif' : '') + '" data-an="' + a + '">' + a + '</button>';
      }).join('');
    } else {
      var an = ANNEES.length ? ANNEES[ANNEES.length - 1] : (dispo[0] || 0);
      h += '<label for="an" class="gris" style="font-size:.76rem">${T("Exercice")}</label>'
         + '<select id="an" aria-label="${T("Exercice financier à afficher")}">'
         + dispo.map(function(a){
             return '<option value="' + a + '"' + (a === an ? ' selected' : '') + '>'
                  + '${T("1er janv. au 31 déc.")} ' + a + '</option>';
           }).join('')
         + '</select>';
    }
    h += '<span class="droite">';
    if (ONGLET === 'budget' && !RO) {
      h += '<button class="mini" id="egal">${T("Répartir également")}</button>'
         + '<button class="prim" id="enr">${T("Enregistrer le budget")}</button>';
    }
    h += '</span>';
    elOutils.innerHTML = h;

    var sel = document.getElementById('an');
    if (sel) sel.onchange = function(){ ANNEES = [parseInt(sel.value, 10)]; charger(); };
    Array.prototype.forEach.call(elOutils.querySelectorAll('button[data-an]'), function(b){
      b.onclick = function(){
        var a = parseInt(b.getAttribute('data-an'), 10);
        var i = ANNEES.indexOf(a);
        /* ⚠ ON NE DESELECTIONNE PAS LA DERNIERE : un ecran de comparaison sans
           aucun exercice n a rien a montrer, et le bouton semblerait casse. */
        if (i >= 0) { if (ANNEES.length > 1) ANNEES.splice(i, 1); else { dire('${T("Gardez au moins un exercice.")}', 'att'); return; } }
        else ANNEES.push(a);
        ANNEES.sort(function(x, y){ return x - y; });
        charger();
      };
    });
    var eg = document.getElementById('egal'); if (eg) eg.onclick = repartirEgalement;
    var en = document.getElementById('enr');  if (en) en.onclick = enregistrer;
  }

  function onglets(){
    var L = [['resultats', '${T("Résultats")}'], ['comparer', '${T("Comparer")}'], ['budget', '${T("Budget")}']];
    elOnglets.innerHTML = L.map(function(o){
      return '<button data-o="' + o[0] + '" class="' + (ONGLET === o[0] ? 'on' : '') + '">' + o[1] + '</button>';
    }).join('');
    Array.prototype.forEach.call(elOnglets.querySelectorAll('button[data-o]'), function(b){
      b.onclick = function(){
        ONGLET = b.getAttribute('data-o');
        /* ⚠ PASSER A << COMPARER >> N AJOUTE PAS D ANNEE TOUT SEUL : on montre ce
           qui est deja choisi. Ajouter d office l annee precedente ferait
           apparaitre des chiffres que personne n a demandes. */
        dessiner();
      };
    });
  }

  /* ── ONGLET 1 : LES RÉSULTATS D UN EXERCICE ───────────────────────────── */
  function vueResultats(){
    var r = D.resultats[D.resultats.length - 1];
    if (!r) return '<div class="vide">${T("Aucun exercice à afficher.")}</div>';
    var h = '';

    /* ⚠ szTuiles(...) ENVELOPPE, il ne remplace rien : le bandeau est ecrit tel
       quel, la piece commune y ajoute le bouton de repli et retient l etat pour
       ce poste (#114). Sans elle, ce bandeau-ci serait le seul des vingt-six a
       ne pas se replier — et une exception qu on ne peut pas expliquer se lit
       comme un oubli. */
    h += szTuiles('<div class="chiffres">'
      + tuile('${T("Revenu total")}', argent(r.revenuTotal), '${T("Ventes nettes + livraison, retours déduits")}')
      + tuile('${T("Marge brute")}', argent(r.margeBrute),
              r.margePct === null ? '${T("Aucune vente")}' : (pct(r.margePct) + ' ${T("du revenu")}'))
      + tuile('${T("Charges")}', argent(r.chargesTotal), '${T("Dépenses d’exploitation + frais d’encaissement")}')
      + tuile('${T("Résultat net")}', argent(r.resultatNet), '${T("Avant impôt")}', r.resultatNet >= 0 ? 'pos' : 'neg')
      + '</div>');

    h += avertissements();

    /* ── L état des résultats, ligne par ligne ───────────────────────────── */
    h += '<div class="carte"><h2>${T("État des résultats")} ' + r.annee + '</h2><table><tbody>'
      + lig('${T("Ventes brutes de marchandise")}', r.ventesBrutes)
      + lig('${T("Moins : rabais et coupons")}', -r.rabais, 'sous')
      + lig('${T("Moins : retours de marchandise")}', -r.retoursMarchandise, 'sous')
      + lig('${T("Ventes nettes")}', r.ventesNettes, 'tot')
      + lig('${T("Livraison facturée")}', r.livraison)
      + lig('${T("Moins : livraison remboursée")}', -r.retoursLivraison, 'sous')
      + lig('${T("REVENU TOTAL")}', r.revenuTotal, 'tot')
      + lig('${T("Coût des marchandises vendues")}', -r.coutMarchandises,
            r.coutComplet ? '' : 'sous')
      + lig('${T("MARGE BRUTE")}', r.margeBrute, 'tot')
      + lig('${T("Frais d’encaissement")}', -r.fraisPaiement)
      + lig('${T("Dépenses d’exploitation")}', -r.depensesExploitation)
      + lig('${T("RÉSULTAT NET")}', r.resultatNet, 'tot')
      + '</tbody></table>'
      + (r.achatsMarchandise
          ? '<div class="gris" style="font-size:.73rem;margin-top:.5rem">'
            + '${T("Achats de marchandise saisis dans les Dépenses :")} ' + argent(r.achatsMarchandise)
            + ' — ${T("écartés des charges à dessein : ils appartiennent au coût des marchandises, déjà calculé ci-dessus sur les unités vendues. Les additionner facturerait la même marchandise deux fois.")}</div>'
          : '')
      + '</div>';

    /* ── Les douze mois ──────────────────────────────────────────────────── */
    h += '<div class="carte"><h2>${T("Mois par mois")}</h2><table>'
      + '<thead><tr><th>${T("Mois")}</th><th class="n">${T("Cmd")}</th><th class="n">${T("Revenu")}</th>'
      + '<th class="n">${T("Coût")}</th><th class="n">${T("Marge")}</th><th class="n">${T("Dépenses")}</th>'
      + '<th class="n">${T("Résultat")}</th></tr></thead><tbody>'
      + r.mois.map(function(m, i){
          return '<tr><td>' + MOIS[i] + '</td><td class="n">' + (m.commandes || '—') + '</td>'
            + '<td class="n">' + argent(m.revenu) + '</td>'
            + '<td class="n">' + argent(m.coutMarchandises) + '</td>'
            + '<td class="n">' + argent(m.margeBrute) + '</td>'
            + '<td class="n">' + argent(m.depenses) + '</td>'
            + '<td class="n ' + (m.resultat >= 0 ? 'bon' : 'mauvais') + '">' + argent(m.resultat) + '</td></tr>';
        }).join('')
      + '</tbody></table></div>';

    h += limite();
    return h;
  }

  function tuile(lbl, val, sous, cl){
    return '<div class="chiffre ' + (cl || '') + '"><div class="lbl">' + esc(lbl) + '</div>'
      + '<div class="val">' + esc(val) + '</div>'
      + (sous ? '<div class="sous">' + esc(sous) + '</div>' : '') + '</div>';
  }
  function lig(lbl, montant, cl){
    return '<tr class="' + (cl || '') + '"><td>' + esc(lbl) + '</td>'
      + '<td class="n">' + argent(montant) + '</td></tr>';
  }

  /* ── ONGLET 2 : COMPARER DES EXERCICES ────────────────────────────────── */
  function vueComparer(){
    var c = D.comparaison;
    if (!c || c.resultats.length < 1) return '<div class="vide">${T("Choisissez au moins un exercice.")}</div>';
    var LIGNES = [
      ['revenuTotal', '${T("Revenu total")}'],
      ['ventesNettes', '${T("Ventes nettes")}'],
      ['coutMarchandises', '${T("Coût des marchandises")}'],
      ['margeBrute', '${T("Marge brute")}'],
      ['depensesExploitation', '${T("Dépenses d’exploitation")}'],
      ['chargesTotal', '${T("Charges totales")}'],
      ['resultatNet', '${T("Résultat net")}'],
      ['nbCommandes', '${T("Commandes")}']
    ];
    var h = '';
    if (c.resultats.length === 1) {
      h += '<div class="avert">${T("Un seul exercice est choisi : il n’y a rien à comparer. Cochez une autre année dans la barre du haut.")}</div>';
    }
    h += '<div class="carte"><h2>${T("Exercices côte à côte")}</h2><table>'
      + '<thead><tr><th>${T("Poste")}</th>'
      + c.resultats.map(function(r){ return '<th class="n">' + r.annee + '</th>'; }).join('')
      + (c.resultats.length > 1 ? '<th class="n">${T("Écart")}</th><th class="n">${T("Variation")}</th>' : '')
      + '</tr></thead><tbody>'
      + LIGNES.map(function(L){
          var derniere = c.variations.length ? c.variations[c.variations.length - 1].champs[L[0]] : null;
          var tr = '<tr><td>' + L[1] + '</td>'
            + c.resultats.map(function(r){
                var v = r[L[0]];
                return '<td class="n">' + (L[0] === 'nbCommandes' ? String(v) : argent(v)) + '</td>';
              }).join('');
          if (c.resultats.length > 1 && derniere) {
            var bon = derniere.ecart >= 0;
            /* ⚠ LE SENS DU BON DEPEND DE LA LIGNE : une hausse des CHARGES n est
               pas une bonne nouvelle. Peindre tout ce qui monte en vert
               obligerait a relire chaque ligne pour savoir quoi en penser. */
            if (L[0] === 'coutMarchandises' || L[0] === 'depensesExploitation' || L[0] === 'chargesTotal') bon = derniere.ecart <= 0;
            tr += '<td class="n ' + (bon ? 'bon' : 'mauvais') + '">'
               + (L[0] === 'nbCommandes' ? (derniere.ecart > 0 ? '+' : '') + derniere.ecart : argent(derniere.ecart)) + '</td>'
               + '<td class="n ' + (bon ? 'bon' : 'mauvais') + '">' + pct(derniere.pct) + '</td>';
          }
          return tr + '</tr>';
        }).join('')
      + '</tbody></table>'
      + (c.resultats.length > 1
          ? '<div class="gris" style="font-size:.73rem;margin-top:.5rem">'
            + '${T("Écart et variation portent sur les deux derniers exercices affichés.")}</div>'
          : '')
      + '</div>';

    if (c.resultats.length > 1) {
      h += '<div class="carte"><h2>${T("Cumul des")} ' + c.resultats.length + ' ${T("exercices")}</h2><table><tbody>'
        + lig('${T("Revenu total")}', c.cumul.revenuTotal)
        + lig('${T("Marge brute")}', c.cumul.margeBrute)
        + lig('${T("Charges totales")}', c.cumul.chargesTotal)
        + lig('${T("Résultat net")}', c.cumul.resultatNet, 'tot')
        + '</tbody></table></div>';
    }
    h += avertissements() + limite();
    return h;
  }

  /* ── ONGLET 3 : LE BUDGET ─────────────────────────────────────────────────
     ⚠⚠ DOUZE MONTANTS PAR POSTE, PAS UN. Un budget annuel unique ne repond pas
     a la seule question qu on se pose en cours d annee : << suis-je en avance
     ou en retard, MAINTENANT ? >> Avec un montant annuel on ne peut comparer
     qu a un douzieme theorique, ce qui est faux des qu un poste est saisonnier
     — et dans le vetement, tout est saisonnier.
     ⚠ MAIS ON NE FORCE PERSONNE A SAISIR DOUZE CASES : on tape le total annuel,
     et << Repartir egalement >> remplit les douze. Le detail ne s ouvre que si
     on le demande. L inverse (douze cases obligatoires) aurait fait abandonner
     l ecran a la troisieme ligne. */
  function vueBudget(){
    if (!SAISIE) {
      SAISIE = {};
      var b = (D.budget && D.budget.postes) || {};
      Object.keys(b).forEach(function(k){ SAISIE[k] = b[k].slice(); });
    }
    var e = D.ecart || { lignes: [] };
    var postes = D.postes || [];
    var reelPar = {};
    e.lignes.forEach(function(l){ reelPar[l.cle] = l; });

    var h = '';
    h += '<div class="carte"><h2>${T("Budget")} ' + (D.budget ? D.budget.annee : '') + '</h2>'
      + '<div class="gris" style="font-size:.75rem;margin-bottom:.5rem">'
      + '${T("Le prévu est comparé au réel jusqu’au mois")} ' + MOIS[(e.jusquAuMois || 12) - 1]
      + ' ${T("inclusivement — comparer douze mois de budget à quelques mois de ventes annoncerait une catastrophe tous les printemps.")}'
      + '</div>'
      + '<table><thead><tr><th>${T("Poste")}</th><th class="n">${T("Prévu (année)")}</th>'
      + '<th class="n">${T("Prévu à ce jour")}</th><th class="n">${T("Réel")}</th>'
      + '<th class="n">${T("Écart")}</th><th></th></tr></thead><tbody>'
      + postes.map(function(p){ return ligneBudget(p, reelPar[p.cle]); }).join('')
      + '</tbody></table></div>';

    if (RO) {
      h += '<div class="avert">${T("Lecture seule — votre rôle ne permet pas de poser un budget.")}</div>';
    }
    h += avertissements();
    return h;
  }

  /* Le nom d un poste A L AFFICHAGE : le site envoie aussi son nom anglais
     (libelleEn, 2026-09-25). ⚠ Lecture seule : la cle reste p.cle, et rien de
     ce nom ne repart vers le site. Un poste sans nom anglais garde le sien. */
  var EN = ${LANGUE.langueCourante() === 'en' ? 'true' : 'false'};
  function nomPoste(p){ return (EN && p && p.libelleEn) ? p.libelleEn : (p ? p.libelle : ''); }

  function ligneBudget(p, l){
    var douze = SAISIE[p.cle] || [0,0,0,0,0,0,0,0,0,0,0,0];
    var annuel = douze.reduce(function(s, v){ return s + (parseFloat(v) || 0); }, 0);
    var ouvert = !!OUVERTS[p.cle];
    var h = '<tr><td>' + esc(nomPoste(p))
      + (p.sens === 'revenu' ? ' <span class="pill g">${T("revenu")}</span>' : '')
      + '</td>'
      + '<td class="n"><input data-an="' + esc(p.cle) + '" value="' + (annuel ? annuel.toFixed(2) : '')
      + '" placeholder="0${SEP_DEC()}00" aria-label="' + esc(nomPoste(p)) + ' — ${T("budget annuel")}"'
      + (RO ? ' disabled' : '') + ' style="width:6.2rem"></td>'
      + '<td class="n gris">' + (l ? argent(l.prevu) : '—') + '</td>'
      + '<td class="n">' + (l ? argent(l.reel) : '—') + '</td>';
    if (l && l.budgete) {
      h += '<td class="n ' + (l.favorable ? 'bon' : 'mauvais') + '">' + argent(l.ecart)
        + (l.partiel && p.sens === 'charge' ? ' <span class="pill att" title="${T("Le réel de ce poste est annuel ; le prévu est coupé au mois. L’écart est indicatif.")}">${T("partiel")}</span>' : '')
        + '</td>';
    } else {
      h += '<td class="n gris">${T("non budgété")}</td>';
    }
    h += '<td><button class="mini" data-ouvre="' + esc(p.cle) + '">'
      + (ouvert ? '${T("Replier")}' : '${T("Détailler")}') + '</button></td></tr>';
    if (ouvert) {
      h += '<tr><td colspan="6"><div class="mois12">'
        + douze.map(function(v, i){
            return '<div><label for="m_' + esc(p.cle) + '_' + i + '">' + MOIS[i] + '</label>'
              + '<input id="m_' + esc(p.cle) + '_' + i + '" data-m="' + esc(p.cle) + '" data-i="' + i
              + '" value="' + (v ? Number(v).toFixed(2) : '') + '" placeholder="0"'
              + ' aria-label="' + esc(nomPoste(p)) + ' — ' + MOIS[i] + '"' + (RO ? ' disabled' : '') + '></div>';
          }).join('')
        + '</div></td></tr>';
    }
    return h;
  }

  /* ⚠ LA SAISIE SE RELIT DEPUIS LE DOM AVANT TOUT REDESSIN. Sans ca, deplier un
     poste effacerait ce qu on venait de taper dans un autre — le genre de perte
     silencieuse qui fait abandonner un ecran de saisie pour de bon. */
  function ramasser(){
    if (!SAISIE) return;
    Array.prototype.forEach.call(corps.querySelectorAll('input[data-an]'), function(inp){
      var cle = inp.getAttribute('data-an');
      var v = parseFloat(String(inp.value).replace(',', '.')) || 0;
      var actuel = (SAISIE[cle] || []).reduce(function(s, x){ return s + (parseFloat(x) || 0); }, 0);
      if (Math.abs(v - actuel) < 0.005) return;   /* inchange : on garde le detail mensuel */
      /* Le total annuel a change : on repartit egalement, c est le geste attendu. */
      var par = Math.round((v / 12) * 100) / 100;
      var t = []; for (var i = 0; i < 12; i++) t.push(par);
      SAISIE[cle] = t;
    });
    Array.prototype.forEach.call(corps.querySelectorAll('input[data-m]'), function(inp){
      var cle = inp.getAttribute('data-m'), i = parseInt(inp.getAttribute('data-i'), 10);
      if (!SAISIE[cle]) SAISIE[cle] = [0,0,0,0,0,0,0,0,0,0,0,0];
      SAISIE[cle][i] = parseFloat(String(inp.value).replace(',', '.')) || 0;
    });
  }

  function repartirEgalement(){
    ramasser();
    Object.keys(SAISIE || {}).forEach(function(cle){
      var t = SAISIE[cle].reduce(function(s, v){ return s + (parseFloat(v) || 0); }, 0);
      var par = Math.round((t / 12) * 100) / 100;
      var n = []; for (var i = 0; i < 12; i++) n.push(par);
      SAISIE[cle] = n;
    });
    dessiner();
    dire('${T("Chaque poste a été réparti également sur les douze mois.")}', 'bon');
  }

  function enregistrer(){
    if (RO || OCCUPE) return;
    ramasser();
    var annee = D.budget ? D.budget.annee : (ANNEES[ANNEES.length - 1] || 0);
    OCCUPE = true;
    dire('${T("Enregistrement…")}', 'att');
    appeler('compta:budgetEcrire', [annee, SAISIE]).then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      SAISIE = null;
      /* ⚠ ON RELIT TOUT APRES L ECRITURE. Les ecarts dependent du budget : garder
         l affichage d avant montrerait des ecarts calcules contre un budget qui
         n existe plus, et ils auraient l air justes. */
      charger().then(function(){ dire('${T("Budget enregistré.")}', 'bon'); });
    });
  }

  /* ── CE QUE LE RAPPORT NE SAIT PAS ───────────────────────────────────────
     ⚠⚠ C EST LA PARTIE LA PLUS IMPORTANTE DE L ECRAN, et c est pour ca qu elle
     n est pas en bas en petit. Un rapport muet sur ses trous se lit comme un
     rapport complet. */
  function avertissements(){
    var A = (D && D.avertissements) || [];
    if (!A.length) return '';
    var items = A.map(function(a){
      if (a.code === 'cout-inconnu') {
        return '<li>' + a.annee + ' — <strong>' + a.nombre + ' ${T("unité(s) vendue(s) sans coût d’acquisition connu")}</strong>. '
          + '${T("La marge et le résultat net sont donc SURESTIMÉS : un produit sans coût est compté comme gratuit. Inscrivez le coût d’acquisition sur")} '
          + esc((a.produits || []).join(', ')) + '.</li>';
      }
      if (a.code === 'frais-inconnus') {
        return '<li>' + a.annee + ' — ${T("les frais d’encaissement n’ont pas été rapatriés pour cet exercice : ils comptent pour zéro, ce qui n’est pas la même chose que « aucun frais ». Ouvrez Paiements et actualisez l’année.")}</li>';
      }
      if (a.code === 'aucun-budget') {
        return '<li>' + a.annee + ' — ${T("aucun budget n’a été posé : la colonne « écart » ne compare rien.")}</li>';
      }
      return '<li>' + esc(a.code) + '</li>';
    }).join('');
    return '<div class="avert"><strong>${T("Ce que ces chiffres ne disent pas")}</strong><ul>' + items + '</ul></div>';
  }

  /* ⚠ LA LIMITE VIENT DU RAPPORT (champ << limite >>), PAS D UNE CHAINE ECRITE
     ICI : le jour ou la phase 2 arrive et que la limite tombe, le site cesse de
     l envoyer et l ecran cesse de l afficher, sans qu il faille y penser. */
  function limite(){
    if (!D || !D.limite) return '';
    return '<div class="limite">' + '${T("Ces chiffres se calculent sur ce que la boutique enregistre : ventes, remboursements, dépenses, encaissements et stock. Un apport du propriétaire, un prêt, un amortissement, une paie hors dépenses ou un ajustement demandé par votre comptable n’y figurent pas — ce sera l’objet du livre de comptes complet.")}' + '</div>';
  }

  function dessiner(){
    onglets(); outils();
    if (!D) return;
    elSous.textContent = (D.annees || []).join(' · ');
    var h = '';
    if (ONGLET === 'comparer') h = vueComparer();
    else if (ONGLET === 'budget') h = vueBudget();
    else h = vueResultats();
    corps.innerHTML = h;
    brancher();
  }

  function brancher(){
    Array.prototype.forEach.call(corps.querySelectorAll('button[data-ouvre]'), function(b){
      b.onclick = function(){
        var cle = b.getAttribute('data-ouvre');
        ramasser();
        OUVERTS[cle] = !OUVERTS[cle];
        dessiner();
      };
    });
  }

  /* ⚠ ON RECHARGE QUAND LA FENETRE REVIENT AU PREMIER PLAN : les depenses et les
     commandes se saisissent AILLEURS, et un rapport fige sur l etat d il y a
     deux heures est un rapport faux qui ne se declare pas comme tel.
     ⚠⚠ ON NE RECHARGE PAS PENDANT UNE SAISIE DE BUDGET. Recharger remet
     << SAISIE >> a zero : quelqu un qui a tape dix postes, change de fenetre pour
     verifier un chiffre et revient perdrait tout, sans message. */
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden && !SAISIE) charger();
  });

  charger();
})();
</script></body></html>`;
}

module.exports = { pageComptabilite };
