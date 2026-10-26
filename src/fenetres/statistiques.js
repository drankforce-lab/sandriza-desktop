'use strict';

/*
 * FENÊTRE « STATISTIQUES » — NATIVE (2.2.0, palier 4)
 * =============================================================================
 * Deux onglets : GOOGLE ANALYTICS (la fréquentation de la boutique) et
 * TÉLÉPHONIE (les appels Twilio, leur coût et le solde prépayé).
 *
 * ⚠⚠ CES CHIFFRES NE VIENNENT PAS DE LA BASE. Ils sont demandés à Google et à
 * Twilio par le réseau, à chaque affichage. Deux conséquences tenues ici :
 *   ① la lecture est LONGUE et peut échouer sans que rien ne soit cassé ;
 *   ② un refus NE VIDE JAMAIS L'ÉCRAN — les chiffres déjà affichés restent, et
 *      l'erreur est dite en bas avec l'heure de la dernière lecture réussie.
 *      « Aucune donnée » après une panne de réseau ferait croire à une chute
 *      de fréquentation, ce qui est un mensonge coûteux.
 *
 * ⚠ La PÉRIODE est envoyée en paramètre à chaque appel : elle n'est l'état de
 * personne d'autre que cette fenêtre.
 *
 * ⚠ PÉRIMÈTRE : les RÉGLAGES (clé du compte de service Google, compte Twilio)
 * restent à l'écran Configuration de la fenêtre principale — la fenêtre le dit.
 * L'onglet « Recherche invalide » du même écran a sa propre fenêtre.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('statistiques');

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
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow:hidden;
  display:flex;flex-direction:column;gap:.7rem}
/* Aucune glissiere (2026-10-12) : le corps ne defile plus ; le journal des appels va en
   PAGES mesurees (JS_PAGES du socle). */
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input,button,select{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
button{cursor:pointer}
input:focus,button:focus,select:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:.5rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.5rem .65rem;text-align:center}
.tuile .val{font-size:1.15rem;font-weight:800;line-height:1.2;white-space:nowrap}
.tuile .lbl{font-size:.6875rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);margin-top:.12rem}
.tuile .val.or{color:var(--tx-or)}.tuile .val.bon{color:var(--tx-ok)}.tuile .val.mal{color:var(--tx-err)}
.tuile .val.att{color:var(--tx-att)}
/* ── La refonte de l Inventaire (2026-09-25) : onglets et periodes en pastilles
   de barre, libelle AU-DESSUS du chiffre, une jauge par ligne de tableau. ── */
.barreoutils .rf-jet{height:2.4rem;padding:0 .75rem;border-radius:10px;font-size:.8rem;background:var(--f-0f1826);
  border:1px solid var(--v10);color:var(--tx-gris2)}
.barreoutils .rf-jet.on{background:rgba(var(--or-rgb),.14);border-color:rgba(var(--or-rgb),.55);color:var(--tx-or2);font-weight:700}
.barreoutils .sep{width:1px;height:1.6rem;background:var(--v10);margin:0 .2rem}
.tuile{display:flex;flex-direction:column}
.tuile .lbl{order:0;text-transform:none;letter-spacing:0;font-size:.76rem;font-weight:600;margin:0 0 .2rem}
.tuile .val{order:1;font-size:1.6rem}
.jaugel{height:4px;border-radius:3px;background:var(--v10);margin-top:.3rem;overflow:hidden;max-width:18rem}
.jaugel i{display:block;height:100%;border-radius:3px;background:rgba(var(--or-rgb),.7)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h3{margin:0 0 .4rem;font:700 .82rem/1.3 Georgia,serif;color:var(--tx-gris2)}
.grilles{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.55rem}
table{width:100%;border-collapse:collapse;font-size:.83rem}
thead th{text-align:left;padding:.22rem .4rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.26rem .4rem;border-top:1px solid var(--v055);vertical-align:top}
tbody tr:hover td{background:var(--v04)}
.num{text-align:right;white-space:nowrap}
.dt{font-size:.72rem;color:var(--tx2)}
.chemin{font-size:.6875rem;color:var(--tx3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tronq{max-width:20rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Graphique : des barres qui montent, une graduation, rien de plus.
   ⚠ LARGEUR BORNEE (2026-09-29) : sur sept jours dont deux seulement ont des
   chiffres, chaque barre prenait un tiers de la carte — deux blocs bruns qui se
   lisaient comme un aplat, pas comme un graphique. Une barre ne depasse plus
   46 px, en or adouci (la couleur ne crie pas, c est la hauteur qui parle), et
   la date se lit dessous. */
.graph{display:flex;align-items:flex-end;justify-content:space-around;gap:4px;height:130px;
  border-bottom:1px solid var(--v12);padding:0 .2rem}
.col{flex:1 1 0;max-width:46px;min-width:2px;background:rgba(var(--or-rgb),.5);border-radius:4px 4px 0 0;position:relative}
.col:hover{background:rgba(var(--or-rgb),.85)}
html.jour .col{background:rgba(168,128,78,.55)}html.jour .col:hover{background:rgba(168,128,78,.85)}
.axe{display:flex;justify-content:space-around;gap:4px;padding:0 .2rem;margin-top:.25rem}
.axe span{flex:1 1 0;max-width:46px;min-width:2px;text-align:center;font-size:.6875rem;color:var(--tx2);white-space:nowrap}
.gmax{font-size:.6875rem;color:var(--tx2);margin-bottom:.15rem}
.avis{border-radius:9px;padding:.42rem .65rem;font-size:.78rem;line-height:1.55}
.avis.att{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.32);color:#fde68a}
.avis.mal{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.34);color:var(--tx-err2)}
.note{font-size:.73rem;color:var(--tx2);line-height:1.6;border-top:1px solid var(--v07);
  padding-top:.5rem;margin-top:.2rem}
.vide{padding:1.4rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}

.tuiles.sept{grid-template-columns:repeat(auto-fit,minmax(130px,1fr))}
.rang2{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:.7rem;align-items:start}
.rang2 > .carte{margin:0}
@media (max-width:1000px){.rang2{grid-template-columns:1fr}}
/* La tête refaite (2026-10-15, lot F). */
.st-tete .st-lu{font-size:.76rem;color:var(--tx2)}
.corps{padding:1rem 1.6rem .9rem}
/* (2026-10-25, audit) LA VUE GOOGLE ANALYTICS NE SORT PLUS DU CORPS : les cinq tableaux du bas
   prennent la hauteur QUI RESTE (rangees egales), et chacun va en pages mesurees (data-pages) ;
   les « Pages populaires » ont la hauteur du graphique voisin. Avant, rien n etait pagine et
   .corps{overflow:hidden} coupait Appareils, Sources et Nouveaux / connus. */
.grilles{flex:1 1 0;min-height:9rem;grid-auto-rows:minmax(0,1fr)}
.grilles>.carte{display:flex;flex-direction:column;min-height:0;overflow:hidden}
.grilles>.carte>[data-pages]{flex:1 1 0;min-height:0}
/* ══ LOT F (2026-10-26) : LES TABLEAUX DU BAS, REFAITS. Quatre cartes au lieu de cinq, et chacune a la HAUTEUR
   DE CE QU ELLE MONTRE — avant, cinq cartes s etiraient jusqu au pied pour deux lignes chacune : de grands
   cadres vides. Une carte trop longue reste bornee par la rangee (max-height) et va en pages, comme avant.
   Appareils et Nouveaux / connus (deux ou trois valeurs) deviennent des PARTS : une barre coupee, une
   legende — un tableau de deux lignes disait la meme chose moins bien. */
/* ⚠ La rangee GARDE sa hauteur bornee (minmax(0,1fr) : ce qui reste du corps) — c est elle qui donne un sens au
   max-height:100% des cartes ; en rangee « auto », une longue liste sortait du corps sans aller en pages. */
.grilles.st4{grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);align-items:start}
.grilles.st4>.carte{max-height:100%;padding:.85rem 1rem}
.grilles.st4>.carte>[data-pages]{flex:0 1 auto}
@media (max-width:1000px){.grilles.st4{grid-template-columns:repeat(2,minmax(0,1fr))}}
.st-pc{font-weight:400;color:var(--tx2);font-size:.74rem;margin-left:.45rem}
.st-parts+.st-parts{margin-top:1rem;padding-top:.85rem;border-top:1px solid var(--v07)}
.st-parts h4{margin:0 0 .5rem;font-size:.76rem;font-weight:600;color:var(--tx2)}
.st-barre{display:flex;height:.7rem;border-radius:99px;overflow:hidden;background:var(--v10);gap:2px}
.st-barre i{display:block;height:100%}
.st-leg{display:flex;flex-direction:column;gap:.3rem;margin-top:.55rem;font-size:.82rem}
.st-leg div{display:flex;align-items:center;gap:.5rem;min-width:0}
.st-leg .pt{width:.6rem;height:.6rem;border-radius:3px;flex:0 0 auto}
.st-leg .nm{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.st-leg b{font-variant-numeric:tabular-nums}
/* La valeur AU-DESSUS de chaque barre, quand il y en a peu (14 au plus) : on lit le jour sans survoler. */
.graph.chiffres{padding-top:1.1rem}
/* Le graphique un peu plus haut (170 px) : c est la piece principale de l onglet, et sa hauteur donne aux Pages
   populaires voisines la place de deux pages par page. */
.rang2 .graph{height:170px}
.col>b{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:2px;font-size:.6875rem;
  font-weight:600;color:var(--tx2);white-space:nowrap}
.rang2>.carte.pop{display:flex;flex-direction:column}
.rang2 .pgpop{height:9.5rem}
/* Lot F (2026-10-26) : les Pages populaires ont la hauteur du GRAPHIQUE voisin, plus une hauteur fixe (9,5 rem
   ne laissait voir qu une page sur deux, quand le graphique en offrait la place). */
.rang2{align-items:stretch}
.rang2 .pgpop{height:auto;flex:1 1 0;min-height:4rem}
`;

/** Page complète de la fenêtre native « Statistiques ». */
function pageStatistiques(ongletDepart) {
  const dep = (ongletDepart === 'tel') ? 'tel' : 'ga';
  return `${TETE()}
<title>${T("Statistiques — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.mktstats}</span><h1>${T("Statistiques")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('statistiques')}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var ONGLET = ${JSON.stringify(dep)};   // ga | tel
  var DGA = null, DTEL = null;           // la DERNIERE lecture REUSSIE
  var LUGA = '', LUTEL = '';             // heure de cette lecture
  var AVGA = '', AVTEL = '';             // le refus a afficher SANS effacer les chiffres
  var PLAGE = '7d';                      // 7d | 30d | 90d
  var JOURS = 30;                        // 7 | 30 | 90
  var CHARGE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function nb(n){ return Number(n || 0).toLocaleString('${LIEU()}'); }
  /* « 16 h 06 » en francais, et non « 16:06 » (2026-10-01). ⚠ Toujours AVEC les
     options : sans elles, fr-CA ecrit « 16 h 06 min 00 s ». */
  function heure(){
    var d = new Date();
    try { return d.toLocaleTimeString('${LIEU()}', { hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  }

  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux statistiques.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("Le service n’a pas répondu à temps. Réessayez : les chiffres affichés sont ceux de la dernière lecture réussie.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    ga_desactive:       '${T("Le suivi Google Analytics est désactivé. Configuration → Statistiques, dans la fenêtre principale.")}',
    ga_sans_propriete:  '${T("Aucun identifiant de propriété GA4 n’est renseigné. Configuration → Statistiques.")}',
    ga_sans_cle:        '${T("Aucune clé de compte de service Google n’est enregistrée. Configuration → Statistiques.")}',
    tel_desactive:      '${T("La téléphonie est désactivée. Configuration → Téléphonie, dans la fenêtre principale.")}',
    tel_sans_compte:    '${T("Aucun compte Twilio n’est enregistré. Configuration → Téléphonie.")}',
    reseau:             '${T("Le service n’a pas pu être joint.")}',
    refus:              '${T("Le service a refusé la demande.")}',
    echec:              '${T("La lecture a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
    if (r && r.detail) t += ' ' + esc(String(r.detail).slice(0, 160));
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

  /* Un refus qui EMPECHE toute lecture (pas encore configuré, pas le droit) se
     montre en pleine page ; un refus PASSAGER se met en bandeau au-dessus des
     chiffres deja lus. La difference n est pas cosmetique : dans le second cas
     les chiffres affiches sont encore vrais, ils sont juste vieux. */
  function bloquant(m){
    return m === 'droit' || m === 'ga_desactive' || m === 'ga_sans_propriete'
        || m === 'ga_sans_cle' || m === 'tel_desactive' || m === 'tel_sans_compte'
        || m === 'operation_inconnue' || m === 'session';
  }

  function onglets(){
    /* ══ LA TÊTE REFAITE (2026-10-15, lot F) : la SOURCE puis la PÉRIODE, chacune en boutons à
       choix ; « lu à » et « Relire » à droite. Crochets gardés : data-onglet, data-plage, data-jours,
       #st-relire. */
    var jet = function(attr, v, on, lib){
      return '<button type="button" class="' + (on ? 'on' : '') + '" ' + attr + '="' + v + '">' + lib + '</button>';
    };
    var h = '<div class="ls-tete st-tete"><div class="ed-seg ls-onglets">'
      + jet('data-onglet', 'ga', ONGLET === 'ga', '${T("Google Analytics")}')
      + jet('data-onglet', 'tel', ONGLET === 'tel', '${T("Téléphonie")}')
      + '</div><div class="ed-seg ls-onglets">';
    if (ONGLET === 'ga') {
      h += [['7d', '${T("7 jours")}'], ['30d', '${T("30 jours")}'], ['90d', '${T("90 jours")}']].map(function(p){
        return jet('data-plage', p[0], PLAGE === p[0], p[1]);
      }).join('');
    } else {
      h += [[7, '${T("7 jours")}'], [30, '${T("30 jours")}'], [90, '${T("90 jours")}']].map(function(p){
        return jet('data-jours', p[0], JOURS === p[0], p[1]);
      }).join('');
    }
    h += '</div>';
    var lu = (ONGLET === 'ga') ? LUGA : LUTEL;
    h += '<div class="droite">'
      + (lu ? '<span class="st-lu">${T("lu à ")}' + esc(lu) + '</span>' : '')
      + '<button class="ed-bt" id="st-relire"' + (CHARGE ? ' disabled' : '') + '>'
      + (CHARGE ? '${T("Lecture…")}' : '${T("↻ Relire")}') + '</button>'
      + '</div></div>';
    return h;
  }

  function renvoi(){
    return '';
  }

  function tuile(lbl, val, cl){
    return '<div class="tuile"><div class="val' + (cl ? ' ' + cl : '') + '">' + esc(val)
      + '</div><div class="lbl">' + esc(lbl) + '</div></div>';
  }

  /* Le graphique : des barres proportionnelles au plus haut jour. Le maximum
     est ECRIT au-dessus — une barre sans echelle ne dit rien. */
  function graphique(serie, cle, mot){
    if (!serie || !serie.length) return '<div class="vide">${T("Aucune donnée sur la période.")}</div>';
    var max = 1, i;
    for (i = 0; i < serie.length; i++) if (Number(serie[i][cle]) > max) max = Number(serie[i][cle]);
    var peu = serie.length <= 14;
    var cols = serie.map(function(s){
      var v = Number(s[cle]) || 0;
      var h = Math.max(v > 0 ? 3 : 0, Math.round(v / max * 100));
      return '<div class="col" style="height:' + h + '%" title="' + esc(szQuand(s.date)) + ' — '
        + nb(v) + ' ' + esc(mot) + '">' + (peu && v > 0 ? '<b>' + nb(v) + '</b>' : '') + '</div>';
    }).join('');
    /* La date sous la barre ; au-dela d une douzaine de jours, une sur k
       seulement — les autres cases restent vides pour garder l alignement. */
    var pas = Math.max(1, Math.ceil(serie.length / 10));
    var axe = serie.map(function(s, k){
      return '<span>' + (k % pas === 0 ? esc(jourCourt(s.date)) : '') + '</span>';
    }).join('');
    return '<div class="gmax">${T("Maximum : ")}' + nb(max) + ' ' + esc(mot) + '${T(" en une journée")}</div>'
      + '<div class="graph' + (peu ? ' chiffres' : '') + '">' + cols + '</div><div class="axe">' + axe + '</div>';
  }

  /* « 6 août » : la date ISO (AAAA-MM-JJ) lue comme un jour LOCAL — un
     new Date('2026-08-06') serait minuit UTC, donc la veille au Quebec. */
  function jourCourt(iso){
    var m = String(iso || '').slice(0, 10).split('-');
    if (m.length !== 3 || !(+m[0] > 0)) return String(iso || '');
    try { return new Date(+m[0], +m[1] - 1, +m[2]).toLocaleDateString('${LIEU()}', { day: 'numeric', month: 'short' }); }
    catch (e) { return String(iso); }
  }

  function tableau(titre, colonne, valeur, lignes, cleNom, cleVal, clePg, total){
    var maxT = (lignes || []).reduce(function(m, x){ return Math.max(m, Number(x[cleVal]) || 0); }, 0) || 1;
    var corpsT = lignes && lignes.length
      ? lignes.map(function(x){
          return '<tr><td class="tronq">' + esc(x[cleNom])
            + '<div class="jaugel"><i style="width:' + Math.max(3, Math.round(100 * (Number(x[cleVal]) || 0) / maxT)) + '%"></i></div>'
            + '</td><td class="num"><b>' + nb(x[cleVal]) + '</b>' + pct(x[cleVal], total) + '</td></tr>';
        }).join('')
      : '<tr><td colspan="2" class="dt" style="text-align:center">—</td></tr>';
    return '<div class="carte"><h3>' + esc(titre) + '</h3><div data-pages="stat-' + clePg + '"><table><thead><tr><th>'
      + esc(colonne) + '</th><th class="num">' + esc(valeur) + '</th></tr></thead><tbody>'
      + corpsT + '</tbody></table></div></div>';
  }

  /* La part d un total, ecrite en clair (« 86 % ») — rien si le total manque. */
  function pct(v, total){
    var t = Number(total) || 0;
    if (!(t > 0)) return '';
    return '<span class="st-pc">' + Math.round(100 * (Number(v) || 0) / t) + ' %</span>';
  }

  /* LES PARTS (lot F, 2026-10-26) : une barre coupee en morceaux et sa legende. Pour les series de deux ou
     trois valeurs (appareils, nouveaux / connus), ou un tableau ne montrait que deux lignes. Les teintes sont
     celles de l accent, de la plus franche a la plus douce : la couleur ne juge rien. */
  var TEINTES = ['rgba(var(--or-rgb),.85)', 'rgba(var(--or-rgb),.5)', 'rgba(var(--or-rgb),.3)', 'var(--v16)'];
  function parts(titre, lignes, cleVal){
    lignes = (lignes || []).filter(function(x){ return (Number(x[cleVal]) || 0) > 0; });
    var tot = lignes.reduce(function(m, x){ return m + (Number(x[cleVal]) || 0); }, 0);
    /* Quatre morceaux au plus (la carte n a pas de pages) : au-dela, le reste est reuni sous « Autres ». */
    if (lignes.length > 4) {
      var reste = lignes.slice(3).reduce(function(m, x){ return m + (Number(x[cleVal]) || 0); }, 0);
      var autre = { nom: '${T("Autres")}' }; autre[cleVal] = reste;
      lignes = lignes.slice(0, 3).concat([autre]);
    }
    if (!tot) return '<div class="st-parts"><h4>' + esc(titre) + '</h4><div class="dt">—</div></div>';
    var barre = '', leg = '';
    lignes.forEach(function(x, i){
      var v = Number(x[cleVal]) || 0, c = TEINTES[Math.min(i, TEINTES.length - 1)];
      barre += '<i style="flex:' + v + ' 1 0;background:' + c + '" title="' + esc(x.nom) + ' — ' + nb(v) + '"></i>';
      leg += '<div><span class="pt" style="background:' + c + '"></span><span class="nm">' + esc(x.nom) + '</span>'
        + '<b>' + nb(v) + '</b><span class="st-pc">' + Math.round(100 * v / tot) + ' %</span></div>';
    });
    return '<div class="st-parts"><h4>' + esc(titre) + '</h4><div class="st-barre">' + barre + '</div><div class="st-leg">' + leg + '</div></div>';
  }

  /* ══ ONGLET GOOGLE ANALYTICS ════════════════════════════════════════════ */
  function vueGa(){
    var h = '';
    if (AVGA) h += '<div class="avis att">' + AVGA + '</div>';
    if (!DGA) {
      return h + (AVGA ? '' : '<div class="vide charge">${T("Lecture des statistiques…")}</div>');
    }
    var t = DGA.totaux;
    /* ⚠ szTuiles(...) ENVELOPPE, il ne remplace rien : le bandeau est ecrit tel
       quel, la piece commune y ajoute le bouton de repli et l etat retenu pour
       ce poste. Les TROIS bandeaux de cette fenetre partagent la meme cle et se
       replient ensemble. Voir JS_TUILES dans socle.js. */
    /* ⚠ UNE SEULE RANGEE DE TUILES, et le graphique A COTE des pages populaires
       (sa demande : aucune barre de defilement — deux bandeaux et deux cartes
       empiles depassaient la fenetre de 142 px). */
    /* ⚠ CHIFFRES NEUTRES (2026-10-01) : l or est la couleur du bouton principal
       et de la selection, pas d un compte de visiteurs. */
    var tu = tuile('${T("Visiteurs")}', nb(t.visiteurs), '')
      + tuile('${T("Sessions")}', nb(t.sessions), '')
      + tuile('${T("Pages vues")}', nb(t.pagesVues), '');
    if (DGA.engagement) {
      tu += tuile('${T("Durée moyenne")}', DGA.engagement.dureeMoyenne)
        + tuile('${T("Taux de rebond")}', DGA.engagement.rebond)
        + tuile('${T("Pages / session")}', DGA.engagement.pagesParSession)
        + tuile('${T("Taux d’engagement")}', DGA.engagement.engagement);
    }
    h += szTuiles('<div class="tuiles sept">' + tu + '</div>');
    h += '<div class="rang2">';
    h += '<div class="carte"><h3><span class="ic">📈</span>${T(" Pages vues par jour — ")}' + esc(DGA.plageLibelle) + '</h3>'
      + graphique(DGA.serie, 'vues', '${T("pages vues")}') + '</div>';

    var pages = (DGA.pages || []).length
      ? DGA.pages.map(function(p){
          return '<tr><td class="tronq"><div class="rf-nom">' + esc(p.titre) + '</div>'
            + (p.chemin && p.chemin !== p.titre ? '<div class="rf-sous"><span class="rf-code">' + esc(p.chemin) + '</span></div>' : '')
            + '</td><td class="num">' + nb(p.vues) + '</td></tr>';
        }).join('')
      : '<tr><td colspan="2" class="dt" style="text-align:center">—</td></tr>';
    h += '<div class="carte pop"><h3><span class="ic">🔝</span>${T(" Pages populaires")}</h3><div class="pgpop" data-pages="stat-pages"><table><thead><tr><th>${T("Page")}</th>'
      + '<th class="num">${T("Vues")}</th></tr></thead><tbody>' + pages + '</tbody></table></div></div>';
    h += '</div>';

    /* Lot F (2026-10-26) : trois classements (pays, villes, sources), puis les PARTS (appareils, nouveaux /
       connus) reunies dans une quatrieme carte. Chaque nombre dit sa part du total de la periode. */
    h += '<div class="grilles st4">'
      + tableau('${T("Pays")}', '${T("Pays")}', '${T("Visiteurs")}', DGA.pays, 'nom', 'visiteurs', 'pays', t.visiteurs)
      + tableau('${T("Villes")}', '${T("Ville")}', '${T("Visiteurs")}', DGA.villes, 'nom', 'visiteurs', 'villes', t.visiteurs)
      + tableau('${T("Sources de trafic")}', '${T("Canal")}', '${T("Sessions")}', DGA.sources, 'nom', 'sessions', 'sources', t.sessions)
      + '<div class="carte"><h3>${T("Qui visite")}</h3>'
      +   parts('${T("Appareils")}', DGA.appareils, 'visiteurs')
      +   parts('${T("Nouveaux / connus")}', DGA.nouveauxConnus, 'visiteurs')
      + '</div></div>';
    return h;
  }

  /* ══ ONGLET TÉLÉPHONIE ══════════════════════════════════════════════════ */
  function vueTel(){
    var h = '';
    if (AVTEL) h += '<div class="avis att">' + AVTEL + '</div>';
    if (!DTEL) {
      return h + (AVTEL ? '' : '<div class="vide charge">${T("Lecture des appels…")}</div>');
    }
    var t = DTEL.totaux;
    /* ⚠ Le solde prepaye : quand il tombe a zero, la ligne cesse de repondre.
       Absent, on le DIT — un solde vide n est pas un solde nul. */
    h += '<div class="avis' + (DTEL.solde ? ' att' : ' mal') + '" style="display:flex;'
      + 'justify-content:space-between;gap:1rem;flex-wrap:wrap">'
      + '<span><span class="ic">📞</span>${T(" Appels des <strong>")}' + DTEL.jours + '${T(" derniers jours</strong>. ")}'
      + '${T("Coûts en dollars US, la devise de facturation.")}</span>'
      + '<span>' + (DTEL.solde ? '<span class="ic">💰</span>${T(" Solde restant : <strong>")}' + esc(DTEL.solde) + '</strong>'
                               : '${T("Solde indisponible")}') + '</span></div>';
    h += szTuiles('<div class="tuiles">' + tuile('${T("Appels")}', nb(t.appels), '')
      + tuile('${T("Entrants")}', nb(t.entrants))
      + tuile('${T("Répondus")}', nb(t.repondus), 'bon')
      + tuile('${T("Manqués")}', nb(t.manques), t.manques ? 'mal' : '')
      + tuile('${T("Minutes")}', nb(t.minutes))
      + tuile('${T("Durée moyenne")}', t.dureeMoyenne)
      + tuile('${T("Coût total")}', t.cout, 'att') + '</div>');
    h += '<div class="carte"><h3><span class="ic">📈</span>${T(" Appels par jour")}</h3>'
      + graphique(DTEL.serie, 'appels', '${T("appels")}') + '</div>';

    /* Refonte (2026-09-26) : le statut d un appel se DIT en pastille. Le site
       l envoie en francais (_PH_STATUTS, admin.js) ; un statut inconnu garde
       la pastille neutre plutot qu une couleur devinee. */
    /* ⚠ DES DONNEES, PAS DU TEXTE : ce sont les valeurs que le site envoie
       (_PH_STATUTS), comparees ici, jamais affichees par cette table. */
    var SZ_DONNEES = { termine: 'terminé', sansReponse: 'sans réponse', occupe: 'occupé',
      echec: 'échec', annule: 'annulé', enCours: 'en cours', sonne: 'sonne' };
    function pastilleAppel(st){
      var v = String(st || ''), D2 = SZ_DONNEES;
      var cl = v === D2.termine ? ' vert' : (v === D2.sansReponse || v === D2.occupe) ? ' ambre'
        : (v === D2.echec || v === D2.annule) ? ' rouge' : (v === D2.enCours || v === D2.sonne) ? ' bleu' : '';
      return '<span class="rf-pill' + cl + '">' + esc(v || '—') + '</span>';
    }
    var rows = (DTEL.appels || []).length
      ? DTEL.appels.map(function(c){
          return '<tr><td><span class="rf-nom">' + esc(c.de) + '</span></td><td class="dt">' + esc(c.sens) + '</td>'
            + '<td>' + pastilleAppel(c.statut) + '</td><td class="num">' + c.duree + ' s</td>'
            + '<td class="num">' + esc(c.cout || '—') + '</td>'
            + '<td class="dt">' + esc(szQuand(c.date)) + '</td></tr>';
        }).join('')
      : '<tr><td colspan="6" class="dt" style="text-align:center">${T("Aucun appel.")}</td></tr>';
    // Les appels en PAGES mesurees : la carte prend la hauteur qui reste (2026-10-12).
    h += '<div class="carte sz-pagee"><h3><span class="ic">📋</span>${T(" Appels récents")}</h3><div data-pages="statistiques-appels"><table><thead><tr><th>${T("Appelant")}</th>'
      + '<th>${T("Sens")}</th><th>${T("Statut")}</th><th class="num">${T("Durée")}</th><th class="num">${T("Coût")}</th>'
      + '<th>${T("Date")}</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
    return h;
  }

  function dessiner(){
    corps.innerHTML = onglets() + (ONGLET === 'ga' ? vueGa() : vueTel()) + renvoi();
    var b = document.getElementById('st-relire');
    if (b) b.onclick = function(){ charger(true); };
  }

  function charger(demande){
    if (CHARGE) return;
    CHARGE = true;
    dessiner();
    var pourGa = (ONGLET === 'ga');
    var op = pourGa ? 'stats:ga' : 'stats:telephonie';
    var arg = pourGa ? PLAGE : JOURS;
    appeler(op, [arg]).then(function(r){
      CHARGE = false;
      if (r && r.ok) {
        if (pourGa) { DGA = r; LUGA = heure(); AVGA = ''; }
        else        { DTEL = r; LUTEL = heure(); AVTEL = ''; }
        dessiner();
        if (demande) dire('${T("Chiffres à jour.")}', 'bon');
        return;
      }
      var texte = expliquer(r);
      /* ⚠ ON N EFFACE RIEN. Les chiffres deja lus restent a l ecran, avec la
         raison du refus au-dessus et l heure de la derniere lecture reussie. */
      if (bloquant(r && r.motif)) {
        if (pourGa) { DGA = null; AVGA = texte; } else { DTEL = null; AVTEL = texte; }
      } else {
        var vieux = pourGa ? LUGA : LUTEL;
        var suffixe = vieux ? ('${T(" Les chiffres affichés sont ceux de ")}' + vieux + '.') : '';
        if (pourGa) AVGA = texte + suffixe; else AVTEL = texte + suffixe;
      }
      dessiner();
      dire(texte, 'err');
    });
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) {
      var v = og.getAttribute('data-onglet');
      if (v === ONGLET) return;
      ONGLET = v;
      /* On ne relit que si cet onglet n a rien : revenir sur un onglet deja lu
         doit etre instantane, pas repayer une seconde d attente. */
      if ((ONGLET === 'ga' && !DGA && !AVGA) || (ONGLET === 'tel' && !DTEL && !AVTEL)) charger(false);
      else dessiner();
      return;
    }
    var bp = t.closest('[data-plage]');
    if (bp) { PLAGE = bp.getAttribute('data-plage'); charger(true); return; }
    var bj = t.closest('[data-jours]');
    if (bj) { JOURS = parseInt(bj.getAttribute('data-jours'), 10) || 30; charger(true); return; }
  });

  window.szActualiser = function(){ if (!CHARGE) charger(false); };
  window.szRevenir = function(){ if (!CHARGE) charger(false); };

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
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  if (sous) sous.textContent = '${T("chiffres demandés à Google et à Twilio")}';
  charger(false);
})();
</script>
</body></html>`;
}

module.exports = { pageStatistiques };
