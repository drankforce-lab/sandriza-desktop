'use strict';

/*
 * FENÊTRE « LIVRE DE COMPTES » — NATIVE (#128, phase 2)
 * =============================================================================
 * Sa décision du 2026-09-14 : « les deux, en deux temps » — les rapports et le
 * budget d'abord (#116, livrés en 6.1.0), le LIVRE DE COMPTES ensuite.
 *
 * CINQ ONGLETS, ET CHACUN RÉPOND À UNE QUESTION QU'ON POSE VRAIMENT :
 *   · Journal      — qu'est-ce qui s'est passé, dans l'ordre ?
 *   · Grand livre  — que s'est-il passé SUR CE COMPTE-LÀ ?
 *   · Balance      — est-ce que tout balance ? (le seul verdict binaire)
 *   · Bilan        — qu'est-ce que je possède, qu'est-ce que je dois ?
 *   · Écritures    — ce que la boutique ne peut pas savoir, et que je saisis.
 *
 * ⚠⚠ CETTE FENÊTRE NE CALCULE RIEN. Pas un solde, pas un total, pas un écart.
 * Tout vient de `GrandLivre` (assets/js/grandlivre.js), par l'op
 * `compta:livreDonnees`, et y est éprouvé au cent près par
 * `tools/check/banc-grandlivre.js` — avec TROIS pannes provoquées. La raison est
 * déjà payée : quatorze endroits du site recopiaient la même formule de rabais
 * et la comptaient tous DEUX FOIS.
 *
 * ⚠⚠ LE RAPPROCHEMENT EST MIS EN HAUT, PAS EN BAS, ET C'EST LE POINT DE TOUT
 * L'ÉCRAN. Le résultat obtenu par le LIVRE est comparé à celui de `Compta`,
 * calculé par un tout autre chemin. Tant que les deux concordent, on peut lire
 * le reste ; s'ils divergent, RIEN de ce qui suit n'est fiable, et c'est la
 * première chose qu'on doit voir. Un écran qui enterre son propre contrôle de
 * cohérence en bas de page laisse croire au reste.
 *
 * ⚠ CE QU'ELLE DIT ET QUE PERSONNE D'AUTRE NE DIT : l'absence de SOLDE
 * D'OUVERTURE. Le site n'a jamais enregistré l'encaisse ni le stock de départ —
 * le livre part de zéro, l'encaisse plonge dans le négatif dès la première
 * dépense, et ces chiffres-là sont faux SANS QUE RIEN NE CLOCHE. Une seule
 * écriture manuelle, une fois, et tout le reste devient juste.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit. Six fois que ça casse une
 * fenêtre dans ce projet — et une fois de plus, le 2026-09-17, dans un
 * commentaire de `appbar.js` avalé par le shell.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, SEP_DEC } = require('./socle.js');
/* ⚠ LES DEUX LANGUES, résolues À LA GÉNÉRATION. ⚠⚠ On ne traduit QUE ce qui se
   lit — jamais une valeur enregistrable. Les NOMS DE COMPTES viennent du site
   avec les chiffres (le plan comptable déduit des catégories de dépenses) : les
   recopier ici ferait deux listes qui divergeraient au premier poste ajouté. */
const T = require('../langue').tr('livre');

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
.corps{flex:1 1 auto;min-height:0;padding:.7rem 1.05rem .45rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.8rem .9rem}
.carte h2{margin:0 0 .55rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
select,input,button,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
input,textarea{cursor:text}
input.n{text-align:right;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
select:focus,input:focus,button:focus,textarea:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.danger{border-color:rgba(248,113,113,.45);color:var(--tx-err2)}

/* ── LE RAPPROCHEMENT — en haut, et il change de couleur ─────────────────── */
.rappro{border-radius:11px;padding:.65rem .85rem;font-size:.82rem;line-height:1.45;
  border:1px solid transparent;display:flex;gap:.8rem;align-items:center;flex-wrap:wrap}
.rappro.ok{border-color:rgba(74,222,128,.38);background:rgba(74,222,128,.08)}
.rappro.non{border-color:rgba(248,113,113,.5);background:rgba(248,113,113,.10)}
.rappro b{font-family:ui-monospace,Consolas,monospace}
.rappro .t{font-weight:700}
.rappro-p{font-size:.76rem;border:1px solid rgba(74,222,128,.38);background:rgba(74,222,128,.08);
  border-radius:99px;padding:.18rem .65rem;white-space:nowrap;cursor:help}
.rappro-p b{font-family:ui-monospace,Consolas,monospace}

/* ── Les grands chiffres ─────────────────────────────────────────────────── */
.chiffres{display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));gap:.6rem}
.chiffre{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.chiffre .lbl{font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2)}
.chiffre .val{font:700 1.18rem/1.25 ui-monospace,Consolas,monospace;margin-top:.15rem}
.chiffre .sous{font-size:.68rem;color:var(--tx3);margin-top:.1rem}
.chiffre.pos .val{color:var(--tx-ok)}
.chiffre.neg .val{color:var(--tx-err2)}

/* ── Tableaux ────────────────────────────────────────────────────────────── */
/* ⚠⚠ UN LIVRE DE COMPTES EST UN DOCUMENT, PAS UNE LISTE (2026-09-29). La
   couche commune de la refonte (CSS_REFONTE, posee en dernier) fait de chaque
   ligne de tableau une CARTE espacee — le bon dessin pour une liste de commandes,
   le mauvais pour un journal : une ecriture de quatre lignes y prenait quatre
   cartes, et le journal d un exercice 34 000 px. Ces regles, plus precises
   (.corps ...), rendent au livre son tableau serre, comme les feuilles de
   document (.feuille, .papier) du socle. */
.corps table{border-collapse:collapse;border-spacing:0}
.corps tbody td{padding:.26rem .35rem;border:0;border-top:1px solid var(--v055);border-radius:0;background:transparent}
.corps tbody tr:hover>td{background:var(--v03);border-color:var(--v055)}
.corps thead th{padding:.22rem .35rem;background:transparent}
table{width:100%;border-collapse:collapse;font-size:.79rem}
thead th{text-align:left;padding:.22rem .35rem;font-size:.65rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
thead th.n,tbody td.n{text-align:right;font-family:ui-monospace,Consolas,monospace}
tbody td{padding:.26rem .35rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody tr:hover td{background:var(--v03)}
tbody tr.tot td{border-top:1px solid var(--v16);font-weight:700}
tbody tr.ecr td{border-top:1px solid var(--v16);font-weight:600}
tbody tr.ligne td{color:var(--tx2)}
tbody tr.ligne td:first-child{padding-left:1.4rem}
.bon{color:var(--tx-ok)}.mauvais{color:var(--tx-err2)}.gris{color:var(--tx2)}
.pill{display:inline-block;font-size:.64rem;padding:.05rem .45rem;border-radius:99px;
  white-space:nowrap;font-weight:700}
.pill.g{background:rgba(148,163,184,.14);color:var(--tx-94a3b8);font-weight:600}
.pill.att{background:rgba(234,179,8,.16);color:var(--tx-att)}
/* ⚠⚠ PAS #c9a97e EN COULEUR DE TEXTE — << banc-contraste-jour >> a mordu ici, et il
   avait raison : cet or donne 1,98 sur le fond du mode jour, c est-a-dire
   illisible. C est EXACTEMENT la meme faute que la phase 1 a payee en bâtissant
   la fenetre des rapports. L or reste au FOND (un fond n est pas juge au ratio,
   et il tient dans les deux modes) ; le texte prend le jeton, qui a deja sa
   valeur de jour et sa valeur de nuit. */
.pill.man{background:rgba(201,169,126,.18);color:var(--tx)}

/* ── L'avertissement : visible, pas décoratif ────────────────────────────── */
.avert{border:1px solid rgba(234,179,8,.45);background:rgba(234,179,8,.09);
  border-radius:10px;padding:.55rem .75rem;font-size:.78rem;line-height:1.45}
.avert strong{color:var(--tx-att)}
.avert ul{margin:.35rem 0 0;padding-left:1.1rem}
.avert summary{cursor:pointer;list-style-position:inside}
.avert:not([open]){padding:.4rem .75rem}

/* ── Le formulaire d'écriture ────────────────────────────────────────────── */
.form{display:grid;grid-template-columns:auto 1fr;gap:.45rem .7rem;align-items:center}
.form label{font-size:.74rem;color:var(--tx2)}
.lignes{margin-top:.55rem}
.lignes .l{display:grid;grid-template-columns:1fr 7rem 7rem auto;gap:.35rem;margin-bottom:.3rem}
.lignes .l select{min-width:0}
.vide{padding:1.3rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
/* ── AUCUNE BARRE DE DEFILEMENT (sa regle, 2026-09-26) — mesuree au jeu d essai
   du 2026-09-29 : Journal +34 000 px, Grand livre +1 300, Balance +800, Bilan +300.
   Deux colonnes la ou un ecran de 1400 px en tient deux ; le journal se PAGINE
   par ecriture entiere (jamais une ecriture coupee entre deux pages). */
.duo{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;align-items:start}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;align-items:center;justify-content:center;z-index:50;padding:1rem}
.voile .boite{max-width:52rem;width:100%;max-height:88vh;overflow:hidden;margin:0}
.duo>div{display:flex;flex-direction:column;gap:.7rem;min-width:0}
.cols2{columns:2;column-gap:.7rem}
.cols2>.carte{break-inside:avoid;margin-bottom:.7rem}
.pages{display:flex;align-items:center;gap:.5rem;margin-left:auto;font:400 .74rem/1 system-ui;
  text-transform:none;letter-spacing:0;color:var(--tx2)}
.carte h2.aveclien{display:flex;align-items:center;gap:.6rem}
/* Grand livre : la ligne garde la hauteur d une ligne de texte — le bouton
   Detail se fait discret et la pastille de ligne fiscale reste sur la ligne. */
.corps button.mini[data-ouvre]{padding:0 .4rem;font-size:.7rem;line-height:1.45;min-height:0;height:auto}
.corps td .pill{vertical-align:baseline}
.gl td:first-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:0;width:44%}
/* L en-tete Debit / Credit / Solde une fois par colonne : les cartes suivantes
   ont exactement les memes colonnes. */
.gl>div>.carte~.carte thead{display:none}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Livre de comptes ».
 * `onglet` = 'journal', 'grandlivre', 'balance', 'bilan' ou 'ecritures'.
 * ⚠ Sans ce paramètre, le garde-fou de rendu ne dessinerait que le premier
 * onglet : il ne simule aucun clic, et les quatre autres resteraient dans
 * l'ombre — c'est exactement comme ça qu'un écran entier passe des mois sans
 * être regardé (leçon de #116).
 */
function pageLivre(onglet) {
  const ok = ['grandlivre', 'balance', 'bilan', 'ecritures'];
  const depart = (ok.indexOf(String(onglet || '')) >= 0) ? String(onglet) : 'journal';
  return `${TETE()}
<title>${T("Livre de comptes — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.billing}</span><h1>${T("Livre de comptes")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets" id="onglets"></div>
<div class="barreoutils" id="outils"></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('livre')}
  var corps = document.getElementById('corps');
  var elOnglets = document.getElementById('onglets');
  var elOutils = document.getElementById('outils');
  var elSous = document.getElementById('sous');

  var D = null;              /* le livre, tel que le site le rend */
  var ONGLET = '${depart}';
  var ANNEE = 0;
  var RO = true;             /* pas de droit d ecriture tant qu on ne l a pas lu */
  var OCCUPE = false;
  var OUVERT = null;         /* le compte deplie dans le grand livre */
  var JPAGE = 0;             /* page du journal */
  var JBUDGET = 0;           /* lignes par page, MESURE (0 = a estimer) */
  var SAISIE = null;         /* l ecriture en cours de redaction */

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function argent(n){ return szArgent(n); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès au livre de comptes.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    saisie:             '${T("L’écriture envoyée n’a pas la forme attendue.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    /* ⚠ LE MOTIF DU MOTEUR PASSE AVANT LA TABLE. << validerManuelle >> explique
       POURQUOI il refuse — deséquilibre chiffre, compte nomme, ligne a deux
       sens. Le remplacer par un << saisie >> generique obligerait quelqu un qui
       tape des nombres a deviner lequel est faux. */
    if (r && r.motif && !MOTIFS[r.motif] && String(r.motif).length > 12) return esc(r.motif);
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

  /* ── LE CHARGEMENT — une seule porte, elle rend tout ────────────────────── */
  function charger(){
    if (OCCUPE) return Promise.resolve();
    OCCUPE = true;
    return appeler('compta:livreDonnees', [{ annee: ANNEE || undefined }]).then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) { D = null; dessiner(); vide('${T("Livre indisponible")}', expliquer(r)); return; }
      D = r;
      RO = !r.peutEcrire;
      ANNEE = r.annee;
      OUVERT = null;
      dessiner();
    });
  }

  /* ── LES ONGLETS ────────────────────────────────────────────────────────── */
  var ONGLETS = [
    ['journal',    '${T("Journal")}'],
    ['grandlivre', '${T("Grand livre")}'],
    ['balance',    '${T("Balance")}'],
    ['bilan',      '${T("Bilan")}'],
    ['ecritures',  '${T("Écritures manuelles")}']
  ];
  /* Quel document sort de quel onglet. ⚠ << Écritures manuelles >> n en a pas :
     elles sont DANS le journal, et un imprimé qui ne porterait qu elles se
     lirait comme un livre — or il n en serait que le quart. */
  var IMPRIMABLE = {
    journal:    ['livre-journal',  '${T("le journal")}'],
    grandlivre: ['livre-grand',    '${T("le grand livre")}'],
    balance:    ['livre-balance',  '${T("la balance")}'],
    bilan:      ['livre-bilan',    '${T("le bilan")}']
  };

  function onglets(){
    elOnglets.innerHTML = ONGLETS.map(function(o){
      return '<button data-o="' + o[0] + '"' + (ONGLET === o[0] ? ' class="on"' : '') + '>'
           + esc(o[1]) + '</button>';
    }).join('');
    Array.prototype.forEach.call(elOnglets.querySelectorAll('button'), function(b){
      b.onclick = function(){ ONGLET = b.getAttribute('data-o'); SAISIE = null; dessiner(); };
    });
  }

  function outils(){
    if (!D) { elOutils.innerHTML = ''; return; }
    var dispo = D.anneesDisponibles || [];
    var h = '<label for="an" class="gris" style="font-size:.76rem">${T("Exercice")}</label>'
          + '<select id="an" aria-label="${T("Exercice financier à afficher")}">'
          + dispo.map(function(a){
              return '<option value="' + a + '"' + (a === ANNEE ? ' selected' : '') + '>'
                   + '${T("1er janv. au 31 déc.")} ' + a + '</option>';
            }).join('')
          + '</select>' + rapproPastille() + '<span class="droite">';
    /* ⚠⚠ ON IMPRIME L ONGLET QU ON REGARDE, PAS << le livre >>. Un seul bouton
       qui sortirait les quatre documents d un coup obligerait a jeter trois
       liasses pour en garder une — et un comptable ne demande pas << le livre >>,
       il demande LE GRAND LIVRE, ou LA BALANCE. Le bouton dit donc ce qu il va
       sortir : son intitule change avec l onglet. */
    if (IMPRIMABLE[ONGLET]) {
      h += '<button class="mini" id="imprimer">${T("Imprimer")} ' + esc(IMPRIMABLE[ONGLET][1]) + '</button>';
    }
    if (ONGLET === 'ecritures' && !RO) {
      h += '<button class="prim" id="neuve">${T("Nouvelle écriture")}</button>';
    }
    h += '</span>';
    elOutils.innerHTML = h;
    var sel = document.getElementById('an');
    if (sel) sel.onchange = function(){ ANNEE = parseInt(sel.value, 10); charger(); };
    var nv = document.getElementById('neuve');
    if (nv) nv.onclick = function(){ SAISIE = ecritureNeuve(); dessiner(); };
    var im = document.getElementById('imprimer');
    if (im) im.onclick = function(){
      var d = IMPRIMABLE[ONGLET];
      im.disabled = true;
      /* ⚠ LE DOCUMENT S OUVRE DANS LA FENETRE PRINCIPALE, pas ici — c est le
         patron << fenetre pilote >>. On le DIT, sinon le clic parait sans effet :
         l imprime paraitra derriere, dans une autre fenetre. */
      szDire('${T("Le document s’ouvre dans la fenêtre principale…")}', '');
      appeler('compta:livreDocument', [d[0], ANNEE]).then(function(r){
        im.disabled = false;
        if (!r || !r.ok) { szDire(expliquer(r), 'err'); return; }
        szDire('${T("Document ouvert dans la fenêtre principale.")}', 'bon');
      });
    };
  }

  /* ══ LE RAPPROCHEMENT — LA PREMIÈRE CHOSE QU'ON VOIT ═════════════════════
     ⚠ IL EST EN HAUT DE CHAQUE ONGLET, ET CE N EST PAS UNE REDITE. Tant que les
     deux moteurs concordent, on peut lire le reste ; s ils divergent, RIEN de
     ce qui suit n est fiable — et ce serait le seul ecran ou l on pourrait
     lire une balance fausse en la croyant. */
  function rapproPastille(){
    var r = D && D.rapprochement;
    if (!r || !r.concorde || r.resultatDeCompta === null || r.resultatDeCompta === undefined) return '';
    var detail = '${T("Résultat du livre")} ' + argent(r.resultatDuLivre) + ' ${T("= résultat des rapports")} '
      + argent(r.resultatDeCompta) + (r.effetManuel ? ' ${T("+ écritures manuelles")} ' + argent(r.effetManuel) : '');
    return '<span class="rappro-p" title="' + esc(detail) + '">✓ ${T("Les deux moteurs concordent")}'
      + ' <span class="gris">· ${T("Résultat du livre")} <b>' + argent(r.resultatDuLivre) + '</b></span></span>';
  }
  function rapprochement(){
    if (!D || !D.rapprochement) return '';
    var r = D.rapprochement;
    if (r.resultatDeCompta === null || r.resultatDeCompta === undefined) {
      return '<div class="rappro non"><span class="t">${T("Contrôle impossible")}</span>'
           + '<span>${T("Le moteur des rapports n’a pas répondu : le résultat du livre n’a été comparé à rien.")}</span></div>';
    }
    /* ⚠ QUAND ILS CONCORDENT, LE CONTROLE MONTE DANS LA BARRE D OUTILS
       (2026-09-29, sa regle : aucune barre de defilement). Il reste EN HAUT de
       chaque onglet, en une pastille verte, le detail au survol. ⚠⚠ Quand ils
       DIVERGENT, le grand bandeau rouge reste ici : on ne range pas une alerte. */
    if (r.concorde) return '';
    return '<div class="rappro non"><span class="t">${T("LES DEUX MOTEURS DIVERGENT")}</span>'
         + '<span>${T("Livre")} <b>' + argent(r.resultatDuLivre) + '</b> · ${T("Rapports")} <b>'
         + argent(r.attendu) + '</b> · ${T("écart")} <b class="mauvais">' + argent(r.ecart) + '</b></span>'
         + '<span class="gris">${T("L’un des deux est faux. Ne vous fiez à aucun chiffre de cet écran tant que l’écart n’est pas expliqué.")}</span></div>';
  }

  /* ── LES AVERTISSEMENTS — ce que le livre ne sait pas ───────────────────── */
  var AVERT_OUVERT = false;
  document.addEventListener('toggle', function(e){
    var t = e.target; if (t && t.classList && t.classList.contains('avert')) AVERT_OUVERT = t.open;
  }, true);
  function avertissements(){
    if (!D || !D.avertissements || !D.avertissements.length) return '';
    var items = D.avertissements.map(function(a){
      if (a.code === 'sans-solde-ouverture') {
        return '<li><strong>${T("Aucun solde d’ouverture.")}</strong> '
             + '${T("La boutique n’a jamais enregistré l’encaisse ni le stock de départ : le livre part de zéro. L’encaisse affiche")} '
             + '<b>' + argent(a.encaisse) + '</b>'
             + (a.encaisseNegative ? ' — ${T("un négatif qui n’existe pas dans la réalité.")}' : '.')
             + ' ${T("Une seule écriture manuelle d’ouverture, une fois, et tout le reste devient juste.")}</li>';
      }
      if (a.code === 'cout-inconnu') {
        return '<li>' + a.nombre + ' ' + szPl(a.nombre, '${T("unité vendue sans coût d’acquisition connu : sa sortie de stock n’est PAS écrite, et la marge est incomplète.")}', '${T("unités vendues sans coût d’acquisition connu : leur sortie de stock n’est PAS écrite, et la marge est incomplète.")}') + ' '
             + esc((a.produits || []).join(', ')) + '.</li>';
      }
      if (a.code === 'frais-inconnus') {
        return '<li>${T("Les frais d’encaissement n’ont pas été rapatriés pour cet exercice : aucune écriture ne les porte. Ce n’est pas la même chose que « aucun frais ».")}</li>';
      }
      if (a.code === 'frais-au-31-decembre') {
        return '<li>${T("Les frais d’encaissement sont portés en UNE écriture au 31 décembre : l’encaisseur ne rend qu’un total annuel, pas la date de chaque frais.")}</li>';
      }
      if (a.code === 'ecarts-de-total') {
        return '<li>' + a.nombre + ' ' + szPl(a.nombre, '${T("commande dont le total enregistré diffère de quelques cents de la somme de ses composantes (arrondi de la caisse). L’écriture est équilibrée par construction ; aucun total du livre n’en dépend.")}', '${T("commandes dont le total enregistré diffère de quelques cents de la somme de leurs composantes (arrondi de la caisse). Les écritures sont équilibrées par construction ; aucun total du livre n’en dépend.")}') + '</li>';
      }
      if (a.code === 'lignes-hors-plan') {
        return '<li class="mauvais"><strong>' + a.nombre + ' ' + szPl(a.nombre, '${T("ligne posée sur un compte absent du plan.")}', '${T("lignes posées sur un compte absent du plan.")}') + '</strong> '
             + szPl(a.nombre, '${T("Elle n’est dans aucun compte : le livre est amputé. C’est un défaut, pas un réglage.")}', '${T("Elles ne sont dans aucun compte : le livre est amputé. C’est un défaut, pas un réglage.")}') + '</li>';
      }
      if (a.code === 'balance-desequilibree' || a.code === 'bilan-desequilibre') {
        return '<li class="mauvais"><strong>${T("La balance ne balance pas")}</strong> — ${T("écart")} '
             + argent(a.ecart) + '. ${T("Une écriture bancale a franchi le contrôle : signalez-le.")}</li>';
      }
      if (a.code === 'ecritures-refusees') {
        return '<li class="mauvais">' + a.nombre + ' ' + szPl(a.nombre, '${T("écriture refusée parce qu’elle ne s’équilibrait pas. Elle n’est dans aucun total.")}', '${T("écritures refusées parce qu’elles ne s’équilibraient pas. Elles ne sont dans aucun total.")}') + '</li>';
      }
      if (a.code === 'rapprochement-impossible' || a.code === 'rapprochement-diverge') return '';
      return '<li>' + esc(a.code) + '</li>';
    }).filter(Boolean).join('');
    if (!items) return '';
    /* ⚠ REPLIE QUAND RIEN N EST GRAVE (2026-09-29, sa regle : aucune barre de
       defilement). Ouvert, ce bloc prenait ~120 px sur CHAQUE onglet. La ligne
       de titre dit qu il existe et combien de points il porte ; un clic l ouvre.
       ⚠⚠ UN POINT GRAVE (.mauvais : balance qui ne balance pas, ligne hors plan,
       ecriture refusee) GARDE LE BLOC OUVERT : on ne replie pas une alerte. */
    var nb = (items.match(/<li/g) || []).length;
    var grave = items.indexOf('class="mauvais"') >= 0;
    return '<details class="avert"' + (grave || AVERT_OUVERT ? ' open' : '') + '><summary><strong>${T("Ce que ce livre ne dit pas tout seul")}</strong>'
      + ' <span class="gris">— ' + nb + ' ' + szPl(nb, '${T("point")}', '${T("points")}') + '</span></summary><ul>' + items + '</ul></details>';
  }

  /* ══ ONGLET JOURNAL ══════════════════════════════════════════════════════
     ⚠ CHAQUE ÉCRITURE MONTRE SES LIGNES, pas seulement son total. Un journal
     qui ne rend que des totaux ne se verifie pas : c est justement le detail
     debit/credit qui permet de dire ou une somme est partie. */
  var SOURCES = {
    vente:          '${T("Vente")}',
    cmv:            '${T("Coût des marchandises")}',
    remboursement:  '${T("Remboursement")}',
    'cmv-retour':   '${T("Retour au stock")}',
    depense:        '${T("Dépense")}',
    frais:          '${T("Frais d’encaissement")}',
    manuelle:       '${T("Écriture manuelle")}'
  };
  function nomCompte(code){
    if (!D) return code;
    for (var i = 0; i < (D.comptes || []).length; i++) {
      if (D.comptes[i].code === code) return D.comptes[i].nom;
    }
    return code;
  }
  /* Les pages du journal : des ecritures ENTIERES, empilees tant que leurs
     lignes (1 + leurs lignes de compte) tiennent dans le budget mesure. Une
     ecriture plus haute que le budget prend une page a elle seule. */
  function pagesJournal(j, budget){
    var pages = [], cur = [], n = 0;
    j.forEach(function(e, i){
      var h = 1 + ((e.lignes || []).length);
      if (cur.length && n + h > budget) { pages.push(cur); cur = []; n = 0; }
      cur.push(i); n += h;
    });
    if (cur.length) pages.push(cur);
    return pages;
  }
  function vueJournal(){
    var j = (D.journal || []);
    if (!j.length) return '<div class="vide">${T("Aucune écriture pour cet exercice.")}</div>';
    if (!(JBUDGET > 0)) JBUDGET = Math.max(6, Math.floor(((corps.clientHeight || 600) - 170) / 25));
    var pages = pagesJournal(j, JBUDGET);
    if (JPAGE >= pages.length) JPAGE = pages.length - 1;
    if (JPAGE < 0) JPAGE = 0;
    var vue = pages[JPAGE].map(function(i){ return j[i]; });
    var lignes = vue.map(function(e){
      /* ⚠⚠ LE TOTAL EST PORTÉ DANS LES DEUX COLONNES, ET C EST UNE CORRECTION
         VENUE DE LA CAPTURE. Il n était que dans DEBIT : la ligne se lisait
         << debit 5 000, credit rien >>, c est-a-dire une ecriture bancale — sur
         un ecran dont tout le propos est que les deux colonnes s equilibrent.
         Elles sont EGALES par construction ; les montrer toutes les deux dit la
         verite et redit la regle a chaque ligne.
         ⚠ Aucun banc ne pouvait l attraper : le texte etait juste, seule la
         COLONNE etait fausse. C est l image qui l a montre. */
      var h = '<tr class="ecr"><td style="white-space:nowrap">' + esc(szJour(e.date)) + '</td><td>' + esc(e.libelle)
            + ' <span class="pill ' + (e.source === 'manuelle' ? 'man' : 'g') + '">'
            + esc(SOURCES[e.source] || e.source || '') + '</span></td>'
            + '<td class="n">' + argent(e.total) + '</td>'
            + '<td class="n">' + argent(e.total) + '</td></tr>';
      h += (e.lignes || []).map(function(l){
        return '<tr class="ligne"><td></td><td>' + esc(l.compte) + ' — ' + esc(nomCompte(l.compte))
             + '</td><td class="n">' + (l.debit ? argent(l.debit) : '')
             + '</td><td class="n">' + (l.credit ? argent(l.credit) : '') + '</td></tr>';
      }).join('');
      return h;
    }).join('');
    var nav = pages.length > 1
      ? '<span class="pages"><button class="mini" data-jp="-1"' + (JPAGE === 0 ? ' disabled' : '') + '>${T("‹ Précédent")}</button>'
        + '<span>${T("Page")} ' + (JPAGE + 1) + ' / ' + pages.length + '</span>'
        + '<button class="mini" data-jp="1"' + (JPAGE >= pages.length - 1 ? ' disabled' : '') + '>${T("Suivant ›")}</button></span>'
      : '';
    return '<div class="carte" id="journal"><h2 class="aveclien">${T("Journal de l’exercice")} — ' + D.nbDerivees
         + ' ' + szPl(D.nbDerivees, '${T("dérivée")}', '${T("dérivées")}') + ' · ' + D.nbManuelles + ' ' + szPl(D.nbManuelles, '${T("manuelle")}', '${T("manuelles")}') + nav + '</h2>'
         + '<table><thead><tr><th>${T("Date")}</th><th>${T("Libellé / compte")}</th>'
         + '<th class="n">${T("Débit")}</th><th class="n">${T("Crédit")}</th></tr></thead>'
         + '<tbody>' + lignes + '</tbody></table></div>';
  }

  /* ══ ONGLET GRAND LIVRE ══════════════════════════════════════════════════ */
  var TYPES = {
    actif:    '${T("Actif")}',
    passif:   '${T("Passif")}',
    capitaux: '${T("Capitaux propres")}',
    produit:  '${T("Produits")}',
    charge:   '${T("Charges")}'
  };
  function vueGrandLivre(){
    var c = (D.livre || []).filter(function(x){ return x.debit !== 0 || x.credit !== 0; });
    if (!c.length) return '<div class="vide">${T("Aucun compte mouvementé pour cet exercice.")}</div>';
    /* Deux colonnes qui ONT UN SENS : le bilan a gauche, le resultat a droite. */
    var h = '<div class="duo gl"><div>';
    ['actif','passif','capitaux','|','produit','charge'].forEach(function(t){
      if (t === '|') { h += '</div><div>'; return; }
      var g = c.filter(function(x){ return x.type === t; });
      if (!g.length) return;
      h += '<div class="carte"><h2>' + esc(TYPES[t] || t) + '</h2><table>'
         + '<thead><tr><th>${T("Compte")}</th><th class="n">${T("Débit")}</th>'
         + '<th class="n">${T("Crédit")}</th><th class="n">${T("Solde")}</th><th></th></tr></thead><tbody>';
      g.forEach(function(x){
        h += '<tr><td title="' + esc(x.code + ' — ' + x.nom) + '">' + esc(x.code) + ' — ' + esc(x.nom)
           + (x.ligne ? ' <span class="pill g">${T("ligne")} ' + esc(x.ligne) + '</span>' : '')
           + '</td><td class="n">' + argent(x.debit) + '</td><td class="n">' + argent(x.credit)
           + '</td><td class="n">' + argent(x.solde) + '</td>'
           + '<td class="n"><button class="mini" data-ouvre="' + esc(x.code) + '">'
           + '${T("Détail")}' + '</button></td></tr>';
      });
      h += '</tbody></table></div>';
    });
    return h + '</div></div>';
  }

  /* ══ LES MOUVEMENTS D UN COMPTE — DANS UNE BOITE PAR-DESSUS (2026-09-29) ══
     Deplies dans la carte, les 110 mouvements de l Encaisse faisaient defiler
     la fenetre de 3 500 px (sa regle : aucune barre de defilement). Une
     consultation qui ne vit que le temps d un coup d oeil va dans une BOITE,
     paginee a la hauteur mesuree ; Fermer, Echap ou un clic a cote la ferment. */
  var MPAGE = 0, MBUDGET = 0;
  function boiteMouvements(){
    if (!OUVERT || !D) return '';
    var x = null;
    (D.livre || []).forEach(function(c){ if (c.code === OUVERT) x = c; });
    if (!x) return '';
    var mv = x.mouvements || [];
    if (!(MBUDGET > 0)) MBUDGET = Math.max(6, Math.floor(((window.innerHeight || 700) * 0.88 - 170) / 25));
    var nbp = Math.max(1, Math.ceil(mv.length / MBUDGET));
    if (MPAGE >= nbp) MPAGE = nbp - 1;
    if (MPAGE < 0) MPAGE = 0;
    var vue = mv.slice(MPAGE * MBUDGET, (MPAGE + 1) * MBUDGET);
    var nav = nbp > 1
      ? '<span class="pages"><button class="mini" data-mp="-1"' + (MPAGE === 0 ? ' disabled' : '') + '>${T("‹ Précédent")}</button>'
        + '<span>${T("Page")} ' + (MPAGE + 1) + ' / ' + nbp + '</span>'
        + '<button class="mini" data-mp="1"' + (MPAGE >= nbp - 1 ? ' disabled' : '') + '>${T("Suivant ›")}</button></span>'
      : '';
    return '<div class="voile" id="v-mv"><div class="boite carte" id="b-mv">'
      + '<h2 class="aveclien">' + esc(x.code) + ' — ' + esc(x.nom) + ' <span class="gris" style="text-transform:none;letter-spacing:0;font-weight:400">· '
      + mv.length + ' ' + szPl(mv.length, '${T("mouvement")}', '${T("mouvements")}') + '</span>' + nav + '</h2>'
      + (mv.length
        ? '<table><thead><tr><th>${T("Date")}</th><th>${T("Libellé")}</th><th class="n">${T("Débit")}</th><th class="n">${T("Crédit")}</th></tr></thead><tbody>'
          + vue.map(function(m){
              return '<tr><td style="white-space:nowrap">' + esc(szJour(m.date)) + '</td><td>' + esc(m.libelle) + '</td>'
                   + '<td class="n">' + (m.debit ? argent(m.debit) : '') + '</td>'
                   + '<td class="n">' + (m.credit ? argent(m.credit) : '') + '</td></tr>';
            }).join('')
          + '<tr class="tot"><td></td><td>${T("Solde")}</td><td class="n" colspan="2">' + argent(x.solde) + '</td></tr></tbody></table>'
        : '<div class="vide">${T("Aucun mouvement.")}</div>')
      + '<div style="display:flex;justify-content:flex-end;margin-top:.6rem"><button id="mv-fermer">${T("Fermer")}</button></div>'
      + '</div></div>';
  }

  /* ══ ONGLET BALANCE ══════════════════════════════════════════════════════
     ⚠ LE VERDICT EST BINAIRE ET IL EST EN GROS. C est le seul chiffre de cet
     ecran qui n a pas de nuance : ou bien debits = credits, ou bien le livre
     est faux. */
  function vueBalance(){
    var b = D.balance || {};
    function lg(x){
      return '<tr><td>' + esc(x.code) + ' — ' + esc(x.nom) + '</td>'
           + '<td class="n">' + argent(x.debit) + '</td>'
           + '<td class="n">' + argent(x.credit) + '</td></tr>';
    }
    /* Deux colonnes EGALES, dans l ordre du plan : la premiere moitie a gauche,
       la suite a droite (une coupe bilan / resultat laissait 7 comptes d un cote
       et 20 de l autre, et la colonne longue debordait quand meme). */
    var toutes = (b.lignes || []);
    var moitie = Math.ceil(toutes.length / 2);
    var gauche = toutes.slice(0, moitie), droite = toutes.slice(moitie);
    var tete = '<thead><tr><th>${T("Compte")}</th><th class="n">${T("Débit")}</th><th class="n">${T("Crédit")}</th></tr></thead>';
    /* ⚠ szTuiles(...) ENVELOPPE, il ne remplace rien : le bandeau est ecrit tel
       quel, la piece commune y ajoute le bouton de repli et retient l etat pour
       ce poste (#114). Sans elle, ce bandeau-ci serait le seul des vingt-sept a
       ne pas se replier — et une exception qu on ne peut pas expliquer se lit
       comme un oubli. << banc-tuiles-masquables >> a d ailleurs mordu ici. */
    return szTuiles('<div class="chiffres">'
      + '<div class="chiffre ' + (b.equilibree ? 'pos' : 'neg') + '"><div class="lbl">${T("Verdict")}</div>'
      + '<div class="val">' + (b.equilibree ? '${T("Équilibrée")}' : '${T("DÉSÉQUILIBRÉE")}') + '</div>'
      + '<div class="sous">${T("écart")} ' + argent(b.ecart) + '</div></div>'
      + '<div class="chiffre"><div class="lbl">${T("Total des débits")}</div><div class="val">'
      + argent(b.totalDebit) + '</div></div>'
      + '<div class="chiffre"><div class="lbl">${T("Total des crédits")}</div><div class="val">'
      + argent(b.totalCredit) + '</div></div>'
      + '</div>')
      + '<div class="carte"><h2>${T("Balance de vérification")}</h2><div class="duo">'
      + '<div><table>' + tete + '<tbody>' + gauche.map(lg).join('') + '</tbody></table></div>'
      + '<div><table>' + tete + '<tbody>' + droite.map(lg).join('')
      + '<tr class="tot"><td>${T("Totaux")}</td><td class="n">' + argent(b.totalDebit)
      + '</td><td class="n">' + argent(b.totalCredit) + '</td></tr></tbody></table></div>'
      + '</div></div>';
  }

  /* ══ ONGLET BILAN ════════════════════════════════════════════════════════
     ⚠⚠ UN BILAN QUI BALANCE NE PROUVE RIEN, ET L ECRAN LE DIT. Si chaque
     ecriture s equilibre, alors actif = passif + capitaux + resultat, TOUJOURS.
     Ce qui manque vraiment, c est le solde d ouverture — et c est
     l avertissement, pas l equation, qui le signale. */
  function vueBilan(){
    var b = D.bilan || {};
    function bloc(titre, liste, total){
      return '<div class="carte"><h2>' + esc(titre) + '</h2><table><tbody>'
        + (liste || []).map(function(x){
            return '<tr><td>' + esc(x.code) + ' — ' + esc(x.nom) + '</td><td class="n">'
                 + argent(x.solde) + '</td></tr>'; }).join('')
        + '<tr class="tot"><td>${T("Total")}</td><td class="n">' + argent(total) + '</td></tr>'
        + '</tbody></table></div>';
    }
    var h = '<div class="duo"><div>' + bloc('${T("Actif")}', b.actif, b.totalActif) + '</div><div>';
    h += bloc('${T("Passif")}', b.passif, b.totalPassif);
    h += '<div class="carte"><h2>${T("Capitaux propres")}</h2><table><tbody>'
      + (b.capitaux || []).map(function(x){
          return '<tr><td>' + esc(x.code) + ' — ' + esc(x.nom) + '</td><td class="n">'
               + argent(x.solde) + '</td></tr>'; }).join('')
      + '<tr><td>${T("Résultat de l’exercice")}</td><td class="n">' + argent(b.resultatExercice) + '</td></tr>'
      + '<tr class="tot"><td>${T("Total")}</td><td class="n">' + argent(b.totalCapitaux) + '</td></tr>'
      + '</tbody></table></div></div></div>';
    h += '<div class="carte"><h2>${T("L’équation")}</h2>'
      + '<div style="font-size:.82rem;line-height:1.6">${T("Actif")} <b>' + argent(b.totalActif)
      /* ⚠ LES SIGNES SONT ECRITS EN ENTITES, ET CE N EST PAS DE LA COQUETTERIE.
         Ecrit << = ${'$'}{T("Passif")} >>, << banc-langue-sur-code >> refuse l enveloppe :
         il voit un signe egal juste devant et croit a une AFFECTATION. Il a
         raison de s en mefier — c est exactement la forme d une valeur qu on ne
         doit jamais traduire. Les entites disent la meme chose a l ecran et
         lèvent l ambiguite dans la source. */
      + '</b> &nbsp;=&nbsp; ${T("Passif")} <b>' + argent(b.totalPassif)
      + '</b> &nbsp;+&nbsp; ${T("Capitaux propres")} <b>'
      + argent(b.totalCapitaux) + '</b>'
      + '<div class="gris" style="margin-top:.35rem">'
      + '${T("Elle est toujours vraie dès que chaque écriture s’équilibre : elle ne prouve donc pas que les chiffres sont justes, seulement que le journal est sain.")}'
      + '</div></div></div>';
    return h;
  }

  /* ══ ONGLET ÉCRITURES MANUELLES ══════════════════════════════════════════
     ⚠⚠ ON NE MODIFIE PAS UNE ÉCRITURE, ON LA CONTRE-PASSE. Un livre dont on
     peut reecrire une ecriture passee n est pas un livre : on ne peut plus dire
     ce qui a ete declare l an dernier. La suppression reste offerte pour la
     faute de frappe du jour meme. */
  function ecritureNeuve(){
    var d = new Date();
    var iso = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    return { date: iso, libelle: '', lignes: [{ compte: '', debit: '', credit: '' },
                                              { compte: '', debit: '', credit: '' }] };
  }
  function optionsComptes(choisi){
    return '<option value="">${T("— choisir un compte —")}</option>'
      + (D.comptes || []).map(function(c){
          return '<option value="' + esc(c.code) + '"' + (c.code === choisi ? ' selected' : '') + '>'
               + esc(c.code) + ' — ' + esc(c.nom) + '</option>'; }).join('');
  }
  function vueEcritures(){
    var h = '';
    if (SAISIE) {
      h += '<div class="carte"><h2>${T("Nouvelle écriture")}</h2><div class="form">'
        + '<label for="ec-date">${T("Date")}</label><input type="date" id="ec-date" value="' + esc(SAISIE.date) + '">'
        + '<label for="ec-lib">${T("Libellé")}</label><input type="text" id="ec-lib" value="' + esc(SAISIE.libelle) + '" placeholder="${T("Apport du propriétaire, amortissement, retrait…")}">'
        + '</div><div class="lignes" id="ec-lignes">'
        + SAISIE.lignes.map(function(l, i){
            return '<div class="l"><select data-l="' + i + '" data-k="compte"'
                 + ' aria-label="${T("Compte")} — ${T("ligne")} ' + (i + 1) + '">' + optionsComptes(l.compte) + '</select>'
                 /* ⚠ UN aria-label PAR CHAMP, ET PAS SEULEMENT UN placeholder. Le
                    placeholder DISPARAIT des qu on tape : quelqu un au lecteur
                    d ecran, revenu sur la sixieme ligne, n entendrait plus que
                    << zone de texte >>. Et << verifier-mise-en-page >> le refuse —
                    il a mordu ici meme. Le NUMERO est dans l etiquette : douze
                    champs qui s annoncent tous << Debit >> ne se distinguent pas. */
                 + '<input class="n" data-l="' + i + '" data-k="debit" value="' + esc(l.debit) + '" placeholder="${T("Débit")}"'
                 + ' aria-label="${T("Débit")} — ${T("ligne")} ' + (i + 1) + '">'
                 + '<input class="n" data-l="' + i + '" data-k="credit" value="' + esc(l.credit) + '" placeholder="${T("Crédit")}"'
                 + ' aria-label="${T("Crédit")} — ${T("ligne")} ' + (i + 1) + '">'
                 + '<button class="mini" data-retire="' + i + '">✕</button></div>'; }).join('')
        + '</div><div style="margin-top:.5rem;display:flex;gap:.5rem">'
        + '<button class="mini" id="ec-plus">${T("Ajouter une ligne")}</button>'
        + '<button class="prim" id="ec-enr">${T("Enregistrer l’écriture")}</button>'
        + '<button class="mini" id="ec-annul">${T("Annuler")}</button></div>'
        + '<div class="gris" style="margin-top:.5rem;font-size:.76rem">'
        + '${T("Débits et crédits doivent s’équilibrer au cent. Une même ligne ne porte jamais les deux.")}</div>'
        + '</div>';
    }
    var man = (D.journal || []).filter(function(e){ return e.source === 'manuelle'; });
    if (!man.length) {
      h += '<div class="vide">${T("Aucune écriture manuelle pour cet exercice.")}<br>'
        + '${T("C’est ici que vivent les apports, les retraits, les prêts, l’amortissement et les ajustements de votre comptable — tout ce que la boutique ne peut pas savoir.")}</div>';
      return h;
    }
    h += '<div class="carte"><h2>${T("Écritures manuelles")}</h2><table>'
      + '<thead><tr><th>${T("Date")}</th><th>${T("Libellé / compte")}</th>'
      + '<th class="n">${T("Débit")}</th><th class="n">${T("Crédit")}</th><th></th></tr></thead><tbody>';
    man.forEach(function(e){
      /* ⚠ Les deux colonnes, comme au journal — voir la note de vueJournal. */
      h += '<tr class="ecr"><td>' + esc(e.date) + '</td><td>' + esc(e.libelle) + '</td>'
         + '<td class="n">' + argent(e.total) + '</td>'
         + '<td class="n">' + argent(e.total) + '</td><td class="n">'
         + (RO ? '' : '<button class="mini danger" data-sup="' + esc(e.ref) + '">${T("Supprimer")}</button>')
         + '</td></tr>';
      h += (e.lignes || []).map(function(l){
        return '<tr class="ligne"><td></td><td>' + esc(l.compte) + ' — ' + esc(nomCompte(l.compte))
             + '</td><td class="n">' + (l.debit ? argent(l.debit) : '')
             + '</td><td class="n">' + (l.credit ? argent(l.credit) : '') + '</td><td></td></tr>';
      }).join('');
    });
    h += '</tbody></table></div>';
    return h;
  }

  /* ── LE DESSIN ──────────────────────────────────────────────────────────── */
  function dessiner(){
    onglets(); outils();
    if (!D) return;
    elSous.textContent = ANNEE + ' · ' + (D.journal || []).length + ' ' + szPl((D.journal || []).length, '${T("écriture")}', '${T("écritures")}');
    var h = rapprochement() + avertissements();
    if (ONGLET === 'grandlivre') h += vueGrandLivre();
    else if (ONGLET === 'balance') h += vueBalance();
    else if (ONGLET === 'bilan') h += vueBilan();
    else if (ONGLET === 'ecritures') h += vueEcritures();
    else h += vueJournal();
    if (ONGLET === 'grandlivre') h += boiteMouvements();
    corps.innerHTML = h;
    var bmv = document.getElementById('b-mv'), tmv = 0;
    while (bmv && bmv.scrollHeight > bmv.clientHeight + 1 && MBUDGET > 4 && tmv < 60) {
      MBUDGET--; tmv++;
      var vv = document.getElementById('v-mv');
      vv.outerHTML = boiteMouvements();
      bmv = document.getElementById('b-mv');
    }
    /* LE BUDGET SE MESURE : si la page deborde, une ligne de moins et on
       redessine (quelques tours au plus) ; jamais de glissiere. */
    if (ONGLET !== 'grandlivre' && ONGLET !== 'balance' && ONGLET !== 'bilan' && ONGLET !== 'ecritures'
        && D.journal && D.journal.length) {
      var tours = 0;
      while (corps.scrollHeight > corps.clientHeight + 1 && JBUDGET > 4 && tours < 60) {
        JBUDGET--; tours++;
        corps.innerHTML = rapprochement() + avertissements() + vueJournal();
      }
    }
    brancher();
  }
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && OUVERT) { OUVERT = null; dessiner(); }
  });
  window.addEventListener('resize', function(){
    clearTimeout(window._lvT);
    window._lvT = setTimeout(function(){ JBUDGET = 0; MBUDGET = 0; if (D) dessiner(); }, 180);
  });

  function brancher(){
    Array.prototype.forEach.call(corps.querySelectorAll('button[data-jp]'), function(b){
      b.onclick = function(){ JPAGE += parseInt(b.getAttribute('data-jp'), 10) || 0; dessiner(); };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('button[data-ouvre]'), function(b){
      b.onclick = function(){
        var c = b.getAttribute('data-ouvre');
        OUVERT = (OUVERT === c) ? null : c;
        MPAGE = 0; MBUDGET = 0;
        dessiner();
      };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('button[data-mp]'), function(b){
      b.onclick = function(){ MPAGE += parseInt(b.getAttribute('data-mp'), 10) || 0; dessiner(); };
    });
    var fm = document.getElementById('mv-fermer');
    if (fm) fm.onclick = function(){ OUVERT = null; dessiner(); };
    var vm = document.getElementById('v-mv');
    if (vm) vm.onclick = function(ev){ if (ev.target === vm) { OUVERT = null; dessiner(); } };
    if (!SAISIE) { brancherSup(); return; }
    /* ⚠ ON RAMASSE LA SAISIE À CHAQUE FRAPPE. Redessiner sans la relire d abord
       rendrait les champs a leur valeur d origine — la faute qu on ne voit
       qu apres avoir tape dix lignes. */
    function ramasser(){
      Array.prototype.forEach.call(corps.querySelectorAll('[data-l]'), function(el){
        var i = parseInt(el.getAttribute('data-l'), 10);
        var k = el.getAttribute('data-k');
        if (SAISIE.lignes[i]) SAISIE.lignes[i][k] = el.value;
      });
      var d = document.getElementById('ec-date'); if (d) SAISIE.date = d.value;
      var l = document.getElementById('ec-lib');  if (l) SAISIE.libelle = l.value;
    }
    Array.prototype.forEach.call(corps.querySelectorAll('[data-l]'), function(el){
      el.onchange = ramasser; el.oninput = ramasser;
    });
    Array.prototype.forEach.call(corps.querySelectorAll('button[data-retire]'), function(b){
      b.onclick = function(){
        ramasser();
        var i = parseInt(b.getAttribute('data-retire'), 10);
        if (SAISIE.lignes.length > 2) SAISIE.lignes.splice(i, 1);
        else szDire('${T("Une écriture en partie double garde au moins deux lignes.")}', 'att');
        dessiner();
      };
    });
    var plus = document.getElementById('ec-plus');
    if (plus) plus.onclick = function(){ ramasser(); SAISIE.lignes.push({ compte: '', debit: '', credit: '' }); dessiner(); };
    var annul = document.getElementById('ec-annul');
    if (annul) annul.onclick = function(){ SAISIE = null; dessiner(); };
    var enr = document.getElementById('ec-enr');
    if (enr) enr.onclick = function(){
      ramasser();
      /* ⚠ LES MONTANTS SONT DES TEXTES TANT QU ILS SONT DANS UN CHAMP. On les
         convertit ICI, en acceptant la virgule decimale : quelqu un qui travaille
         en francais tape << 1200,50 >>, et parseFloat en ferait 1200.
         ⚠⚠ ET L ACCENT GRAVE A ENCORE REFERME CE GABARIT — SEPTIEME FOIS, dans
         le fichier meme ou l en-tete le met en garde, et trois lignes sous ce
         garde. La garde ecrite ne suffit pas : ce qui attrape, c est
         << node --check >> juste apres avoir ecrit, et c est lui qui l a eu. */
      var lignes = SAISIE.lignes.filter(function(l){ return l.compte; }).map(function(l){
        return { compte: l.compte,
                 debit:  parseFloat(String(l.debit  || '0').replace(',', '.')) || 0,
                 credit: parseFloat(String(l.credit || '0').replace(',', '.')) || 0 };
      });
      enr.disabled = true;
      appeler('compta:ecritureAjouter', [{ date: SAISIE.date, libelle: SAISIE.libelle, lignes: lignes }])
        .then(function(r){
          enr.disabled = false;
          if (!r || !r.ok) { szDire(expliquer(r), 'err'); return; }
          SAISIE = null;
          szDire('${T("Écriture enregistrée.")}', 'bon');
          charger();
        });
    };
    brancherSup();
  }

  function brancherSup(){
    Array.prototype.forEach.call(corps.querySelectorAll('button[data-sup]'), function(b){
      /* ⚠ ON ARME EN DEUX TEMPS, comme toute action qui detruit : un clic
         distrait ne doit pas retirer une ecriture d un livre de comptes. */
      var arme = false;
      b.onclick = function(){
        if (!arme) {
          arme = true;
          b.textContent = '${T("Confirmer")}';
          setTimeout(function(){ if (arme) { arme = false; b.textContent = '${T("Supprimer")}'; } }, 5000);
          return;
        }
        appeler('compta:ecritureSupprimer', [b.getAttribute('data-sup')]).then(function(r){
          if (!r || !r.ok) { szDire(expliquer(r), 'err'); return; }
          szDire('${T("Écriture supprimée.")}', 'bon');
          charger();
        });
      };
    });
  }

  /* ⚠ ON RECHARGE QUAND LA FENETRE REVIENT AU PREMIER PLAN : les ventes et les
     depenses se saisissent AILLEURS, et un livre fige sur l etat d il y a deux
     heures est un livre faux qui ne se declare pas comme tel.
     ⚠⚠ ON NE RECHARGE PAS PENDANT UNE SAISIE : recharger remet << SAISIE >> a
     zero, et quelqu un qui a tape six lignes et change de fenetre pour verifier
     un montant perdrait tout, sans message. */
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden && !SAISIE) charger();
  });

  charger();
})();
</script></body></html>`;
}

module.exports = { pageLivre };
