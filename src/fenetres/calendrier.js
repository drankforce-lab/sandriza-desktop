'use strict';

/*
 * LE CALENDRIER (2026-11-18, relooking — ajout choisi par elle)
 * =============================================================================
 * « Précommandes, ramassages, échéances fiscales et rappels sur un même mois. » Une fenêtre de LECTURE :
 * chaque événement ouvre le module qui le porte (Rappels, Ramassages, Produits) — on n'y modifie rien ici.
 * ⚠ LA RÈGLE VIT DANS LE SITE (pont.js, calendrierMois) : quelles sources, avec quels droits, quel ton.
 * ⚠ AUCUNE GLISSIÈRE (sa règle) : la grille du mois remplit la fenêtre, chaque case montre ce qui y TIENT
 * (mesuré) et « + k » ouvre le détail du jour dans le panneau de droite, lui-même mesuré.
 * ⚠ TROIS TONS : rouge (en retard), ambre (aujourd'hui ou dans la semaine, une précommande à livrer),
 * neutre (le reste) — rf-pill bleu/ambre/rouge, que le jeu Épuré convertit aux trois tons.
 * ⚠ AUCUN CARACTÈRE accent grave dans la portion de script, COMMENTAIRES COMPRIS : le script vit dans un
 * littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('calendrier');

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
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or,var(--or))}
.tete .ico svg{width:100%;height:100%}
#corps{overflow:hidden}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
/* (même base que Rappels) */
.cx{gap:.7rem}
.cal-nav{display:flex;align-items:center;gap:.45rem;flex:0 0 auto}
.cal-nav h2{margin:0 .4rem;font-size:1rem;min-width:11rem;text-align:center;white-space:nowrap}
.cal-nav h2::first-letter{text-transform:uppercase}
.cal-leg{display:flex;align-items:center;gap:.5rem;margin-left:auto;flex-wrap:wrap}
.cx>.cal-deux{flex:1 1 0;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 19rem;gap:.8rem}
.cal-grille{min-height:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;
  grid-template-rows:auto repeat(var(--cal-rangs,5),minmax(0,1fr))}
.cal-jsem{font-size:.68rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2);padding:0 .3rem .15rem}
.cal-case{min-height:0;min-width:0;overflow:hidden;display:flex;flex-direction:column;gap:3px;padding:.3rem .35rem;
  border:1px solid var(--v08);border-radius:9px;background:var(--f-carte);cursor:pointer}
.cal-case.hors{opacity:.45}
.cal-case.auj{border-color:var(--or);box-shadow:inset 0 0 0 1px var(--or)}
.cal-case.choisi{background:var(--f-carte2);border-color:var(--v20)}
.cal-case .n{flex:none;font-size:.74rem;font-weight:700;color:var(--tx2)}
.cal-case.auj .n{color:var(--tx)}
.rf-pill.cal-ev{flex:none;display:block;max-width:100%;font-size:.66rem;font-weight:600;padding:.08rem .45rem;border-radius:6px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cal-ev::before{display:none}
.cal-ev[hidden]{display:none}
.cal-plus{flex:none;font-size:.66rem;color:var(--tx2);padding:0 .3rem}
.cal-jour{min-height:0;display:flex;flex-direction:column;gap:.45rem;overflow:hidden}
.cal-jour h3{margin:0;font-size:.9rem}
.cal-jour h3::first-letter{text-transform:uppercase}
.cal-items{flex:1 1 0;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:.4rem}
.cal-item{flex:none;display:flex;flex-direction:column;gap:.15rem;padding:.5rem .6rem;border:1px solid var(--v08);border-radius:10px;
  background:var(--f-carte);text-align:left;font:inherit;color:inherit;cursor:pointer}
.cal-item[hidden]{display:none}
.cal-item:hover{background:var(--v05)}
.cal-item .l1{display:flex;align-items:center;gap:.45rem;min-width:0}
.cal-item .l1 b{flex:1 1 auto;min-width:0;font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cal-item .l2{font-size:.72rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cal-reste{flex:none;font-size:.72rem;color:var(--tx2)}
.cal-vide{font-size:.8rem;color:var(--tx2);padding:.4rem 0}
/* (2026-11-22, sa capture : « corriger l’affichage des tâches, ça déborde ») Le panneau du jour a ses marges, chaque
   tâche tient dans sa largeur (un bouton prend sinon la largeur de son texte) et son détail passe sur deux lignes. */
.cal-jour{padding:.75rem .85rem;min-width:0}
.cal-item{width:100%;min-width:0;max-width:100%}
.cal-item .l2{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
.cal-item .l1 .rf-pill{flex:none}
/* Le titre d une tâche passe à la ligne : rien n est coupé dans le panneau du jour. */
.cal-item .l1{flex-wrap:wrap;row-gap:.2rem}
.cal-item .l1 b{white-space:normal;overflow-wrap:anywhere}
/* LES TROIS VUES (2026-11-22, sa demande : « l’affichage du calendrier devrait se faire par jour / semaine de travail / mois ») */
.cal-vues{display:inline-flex;border:1px solid var(--v16);border-radius:9px;overflow:hidden;margin-left:.4rem}
.cal-vues button{font:inherit;font-size:.78rem;font-weight:600;border:0;border-radius:0;background:transparent;color:var(--tx2);padding:.32rem .8rem;cursor:pointer}
.cal-vues>button{background:transparent!important;box-shadow:none!important}
.cal-vues>button.on{background:var(--f-pill)!important;color:var(--tx)!important;box-shadow:inset 0 0 0 1px var(--v20)!important}
.cx>.cal-deux.une{grid-template-columns:minmax(0,1fr)}
.cal-sem{min-height:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.55rem}
.cal-col{min-height:0;min-width:0;display:flex;flex-direction:column;gap:.4rem;padding:.55rem .55rem .6rem;border:1px solid var(--v08);
  border-radius:12px;background:var(--f-carte);overflow:hidden}
.cal-col.auj{border-color:var(--or);box-shadow:inset 0 0 0 1px var(--or)}
.cal-col .cal-ct{flex:none;display:flex;align-items:baseline;gap:.4rem;padding:0 .15rem .35rem;border-bottom:1px solid var(--v08);cursor:pointer}
.cal-ctn{font-size:1.35rem;font-weight:800;line-height:1}
.cal-ctj{font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2)}
.cal-col .cal-items{gap:.35rem}
.cal-col .cal-item{padding:.42rem .5rem}
.cal-col .cal-item .l1{flex-wrap:wrap;gap:.25rem .4rem}
.cal-col .cal-item .l1 b{white-space:normal;overflow-wrap:anywhere;flex-basis:100%}
.cal-unjour{min-height:0;display:flex;flex-direction:column;gap:.6rem;padding:.9rem 1rem;border:1px solid var(--v08);border-radius:14px;background:var(--f-carte);overflow:hidden}
.cal-unjour h3{margin:0;font-size:1.05rem}
.cal-unjour h3::first-letter{text-transform:uppercase}
.cal-unjour .cal-items{display:grid;grid-template-columns:repeat(auto-fill,minmax(20rem,1fr));align-content:start}
.cal-unjour .cal-item{padding:.7rem .8rem}
.cal-unjour .cal-item .l1 b{font-size:.92rem;white-space:normal}
.cal-unjour .cal-item .l2{font-size:.8rem;-webkit-line-clamp:3}
`;

function pageCalendrier() {
  return `${TETE()}
<title>${T("Calendrier — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.rappels}</span><h1>${T("Calendrier")}</h1>
  <span class="cx-resume" id="sous"></span><div class="cx-actions" id="outils"></div></div>
<div class="cx" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var elSous = document.getElementById('sous');
  var D = null, AN = 0, MO = 0, JOUR = '';
  /* (2026-11-22) LA VUE : jour | semaine (de travail, lundi à vendredi) | mois — retenue sur ce poste. Les mois lus sont
     gardés (MC) : une semaine qui chevauche deux mois lit les deux. AUJ : la date du jour selon le site. */
  var VUE = 'mois'; try { VUE = localStorage.getItem('sz-cal-vue') || 'mois'; } catch (e) {}
  if (['jour', 'semaine', 'mois'].indexOf(VUE) < 0) VUE = 'mois';
  var MC = {}, AUJ = '';
  var MOIS = ['${T("janvier")}', '${T("février")}', '${T("mars")}', '${T("avril")}', '${T("mai")}', '${T("juin")}',
    '${T("juillet")}', '${T("août")}', '${T("septembre")}', '${T("octobre")}', '${T("novembre")}', '${T("décembre")}'];
  var JSEM = ['${T("lun.")}', '${T("mar.")}', '${T("mer.")}', '${T("jeu.")}', '${T("ven.")}', '${T("sam.")}', '${T("dim.")}'];
  var SORTES = { rappel: '${T("Rappel")}', fiscal: '${T("Échéance fiscale")}', ramassage: '${T("Ramassage")}', precommande: '${T("Précommande")}' };
  var TON = { n: 'bleu', a: 'ambre', r: 'rouge' };
  var MOTIFS = {
  maj_en_cours: '${T("Une mise à jour s’installe : cette opération est suspendue jusqu’au redémarrage de l’application.")}',
    session: '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}',
    delai: '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec: '${T("L’opération a échoué.")}'
  };
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').'); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; }).catch(function(){ return { ok: false, motif: 'echec' }; });
  }
  function deux(n){ return (n < 10 ? '0' : '') + n; }
  function iso(a, m, j){ return a + '-' + deux(m) + '-' + deux(j); }
  function libJour(d){
    var p = String(d).split('-'); var dt = new Date(+p[0], +p[1] - 1, +p[2]);
    return JSEM[(dt.getDay() + 6) % 7] + ' ' + (+p[2]) + ' ' + MOIS[+p[1] - 1];
  }
  /* La ligne de détail se compose ICI, dans la langue du poste : le site n'envoie que des données. */
  function sousDe(e){
    if (e.sorte === 'ramassage') return '${T("Colis :")} ' + e.colis;
    if (e.sorte === 'precommande') return '${T("Livraison promise des précommandes")}';
    return e.sous || '';
  }
  function duJour(d){ var m = MC[String(d).slice(0, 7)]; return ((m && m.evenements) || []).filter(function(e){ return e.date === d; }); }
  function versDate(d){ var p = String(d).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function versIso(dt){ return iso(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()); }
  function plusJours(d, n){ var dt = versDate(d); dt.setDate(dt.getDate() + n); return versIso(dt); }
  function lundiDe(d){ var dt = versDate(d); dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7)); return versIso(dt); }
  function lireMois(a, m){
    var k = iso(a, m, 1).slice(0, 7);
    if (MC[k]) return Promise.resolve(MC[k]);
    return appeler('calendrier:mois', [a, m]).then(function(r){ if (r && r.ok) { MC[k] = r; if (r.aujourdhui) AUJ = r.aujourdhui; } return r; });
  }
  function itemHtml(e, i){
    return '<button type="button" class="cal-item" data-ev="' + esc(e.date) + '|' + i + '" title="${T("Ouvrir dans son module")}">'
      + '<span class="l1"><span class="rf-pill ' + (TON[e.ton] || 'bleu') + '">' + esc(SORTES[e.sorte] || '') + '</span><b>' + esc(e.titre) + '</b></span>'
      + (sousDe(e) ? '<span class="l2">' + esc(sousDe(e)) + '</span>' : '') + '</button>';
  }
  function barre(titre, prec, suiv){
    var v = function(k, l){ return '<button type="button" class="' + (VUE === k ? 'on' : '') + '" data-vue="' + k + '">' + l + '</button>'; };
    return '<div class="cal-nav"><button type="button" class="mini" data-nav="-1" aria-label="' + prec + '">‹</button>'
      + '<h2>' + esc(titre) + '</h2>'
      + '<button type="button" class="mini" data-nav="1" aria-label="' + suiv + '">›</button>'
      + '<button type="button" class="mini" data-nav="0">${T("Aujourd’hui")}</button>'
      + '<span class="cal-vues" role="group" aria-label="${T("Affichage")}">' + v('jour', '${T("Jour")}') + v('semaine', '${T("Semaine de travail")}') + v('mois', '${T("Mois")}') + '</span>'
      + '<span class="cal-leg"><span class="rf-pill rouge">${T("En retard")}</span><span class="rf-pill ambre">${T("Cette semaine")}</span>'
      + '<span class="rf-pill bleu">${T("À venir")}</span></span></div>';
  }

  function charger(){
    if (!JOUR) {   // premier chargement : le mois courant, pour connaître la date du jour
      appeler('calendrier:mois', [0, 0]).then(function(r){
        if (!r || !r.ok) { corps.innerHTML = '<div class="cal-vide">' + esc(expliquer(r)) + '</div>'; return; }
        MC[iso(r.annee, r.mois, 1).slice(0, 7)] = r; AUJ = r.aujourdhui || iso(r.annee, r.mois, 1);
        JOUR = AUJ; charger();
      });
      return;
    }
    var a = versDate(JOUR); AN = a.getFullYear(); MO = a.getMonth() + 1;
    var besoins = [[AN, MO]];
    if (VUE === 'semaine') { var v = versDate(plusJours(lundiDe(JOUR), 4)); besoins.push([v.getFullYear(), v.getMonth() + 1]);
      var l = versDate(lundiDe(JOUR)); besoins.push([l.getFullYear(), l.getMonth() + 1]); }
    Promise.all(besoins.map(function(b){ return lireMois(b[0], b[1]); })).then(function(rs){
      var mauvais = rs.filter(function(r){ return !r || !r.ok; })[0];
      if (mauvais) { corps.innerHTML = '<div class="cal-vide">' + esc(expliquer(mauvais)) + '</div>'; return; }
      D = MC[iso(AN, MO, 1).slice(0, 7)];
      dessiner();
    });
  }

  function dessiner(){
    if (VUE === 'jour') return dessinerUnJour();
    if (VUE === 'semaine') return dessinerSemaine();
    return dessinerMois();
  }
  function dessinerUnJour(){
    var l = duJour(JOUR);
    elSous.textContent = l.length ? (l.length + ' ' + (l.length > 1 ? '${T("événements ce jour-là")}' : '${T("événement ce jour-là")}')) : '';
    var dt = versDate(JOUR);
    var h = barre(libJour(JOUR) + ' ' + dt.getFullYear(), '${T("Jour précédent")}', '${T("Jour suivant")}')
      + '<div class="cal-deux une"><div class="cal-unjour' + (JOUR === AUJ ? ' auj' : '') + '"><h3>' + esc(libJour(JOUR)) + (JOUR === AUJ ? ' · ${T("aujourd’hui")}' : '') + '</h3>'
      + (l.length ? '<div class="cal-items">' + l.map(itemHtml).join('') + '</div><div class="cal-reste" id="cal-reste" hidden></div>'
                  : '<div class="cal-vide">${T("Rien ce jour-là.")}</div>')
      + '</div></div>';
    corps.innerHTML = h;
    ajusterListe(corps.querySelector('.cal-unjour .cal-items'), document.getElementById('cal-reste'));
  }
  function dessinerSemaine(){
    var lun = lundiDe(JOUR), ven = plusJours(lun, 4), dl = versDate(lun), dv = versDate(ven), n = 0;
    var titre = dl.getMonth() === dv.getMonth()
      ? dl.getDate() + ' – ' + dv.getDate() + ' ' + MOIS[dv.getMonth()] + ' ' + dv.getFullYear()
      : dl.getDate() + ' ' + MOIS[dl.getMonth()] + ' – ' + dv.getDate() + ' ' + MOIS[dv.getMonth()] + ' ' + dv.getFullYear();
    var cols = '';
    for (var k = 0; k < 5; k++) {
      var d = plusJours(lun, k), l = duJour(d); n += l.length;
      cols += '<div class="cal-col' + (d === AUJ ? ' auj' : '') + '"><div class="cal-ct" data-voirjour="' + d + '" title="${T("Voir ce jour")}"><span class="cal-ctj">' + esc(JSEM[k]) + '</span><b class="cal-ctn">' + versDate(d).getDate() + '</b></div>'
        + (l.length ? '<div class="cal-items">' + l.map(itemHtml).join('') + '</div><div class="cal-reste" hidden></div>' : '<div class="cal-vide">—</div>')
        + '</div>';
    }
    elSous.textContent = n ? (n + ' ' + (n > 1 ? '${T("événements cette semaine")}' : '${T("événement cette semaine")}')) : '';
    corps.innerHTML = barre(titre, '${T("Semaine précédente")}', '${T("Semaine suivante")}') + '<div class="cal-deux une"><div class="cal-sem">' + cols + '</div></div>';
    Array.prototype.forEach.call(corps.querySelectorAll('.cal-col'), function(c){ ajusterListe(c.querySelector('.cal-items'), c.querySelector('.cal-reste')); });
  }
  function dessinerMois(){
    var ev = (D && D.evenements) || [];
    elSous.textContent = ev.length ? (ev.length + ' ' + (ev.length > 1 ? '${T("événements ce mois-ci")}' : '${T("événement ce mois-ci")}')) : '';
    var premier = new Date(AN, MO - 1, 1), decal = (premier.getDay() + 6) % 7;
    var nbJours = new Date(AN, MO, 0).getDate();
    var rangs = Math.ceil((decal + nbJours) / 7);
    var h = barre(MOIS[MO - 1] + ' ' + AN, '${T("Mois précédent")}', '${T("Mois suivant")}');
    h += '<div class="cal-deux"><div class="cal-grille" style="--cal-rangs:' + rangs + '">'
      + JSEM.map(function(j){ return '<div class="cal-jsem">' + esc(j) + '</div>'; }).join('');
    for (var c = 0; c < rangs * 7; c++) {
      var j = c - decal + 1;
      if (j < 1 || j > nbJours) { h += '<div class="cal-case hors" aria-hidden="true"></div>'; continue; }
      var d = iso(AN, MO, j), l = duJour(d);
      h += '<div class="cal-case' + (d === AUJ ? ' auj' : '') + (d === JOUR ? ' choisi' : '') + '" data-jour="' + d + '">'
        + '<span class="n">' + j + '</span>'
        + l.map(function(e){ return '<span class="rf-pill cal-ev ' + (TON[e.ton] || 'bleu') + '" title="' + esc(SORTES[e.sorte] || '') + ' — ' + esc(e.titre) + '">' + esc(e.titre) + '</span>'; }).join('')
        + '<span class="cal-plus" hidden></span></div>';
    }
    h += '</div><div class="carte cal-jour" id="cal-jour"></div></div>';
    corps.innerHTML = h;
    dessinerJour();
    ajusterCases();
  }

  function dessinerJour(){
    var z = document.getElementById('cal-jour'); if (!z) return;
    var l = duJour(JOUR);
    var h = '<h3>' + esc(libJour(JOUR)) + '</h3>';
    if (!l.length) h += '<div class="cal-vide">${T("Rien ce jour-là.")}</div>';
    else h += '<div class="cal-items">' + l.map(itemHtml).join('') + '</div>'
      + '<div class="cal-reste" id="cal-reste" hidden></div>';
    z.innerHTML = h;
    ajusterJour();
  }

  /* Mesuré, jamais défilé : ce qui ne tient pas se cache et se compte. */
  function ajusterCases(){
    Array.prototype.forEach.call(corps.querySelectorAll('.cal-case[data-jour]'), function(c){
      var evs = c.querySelectorAll('.cal-ev'), plus = c.querySelector('.cal-plus');
      Array.prototype.forEach.call(evs, function(e){ e.hidden = false; });
      plus.hidden = true;
      if (c.scrollHeight <= c.clientHeight + 1) return;
      plus.hidden = false; var k = 0;
      for (var i = evs.length - 1; i >= 0 && c.scrollHeight > c.clientHeight + 1; i--) { evs[i].hidden = true; k++; plus.textContent = '+ ' + k; }
      if (!k) plus.hidden = true;
    });
  }
  function ajusterListe(z, r){
    if (!z || !r) return;
    var it = z.querySelectorAll('.cal-item');
    Array.prototype.forEach.call(it, function(e){ e.hidden = false; });
    r.hidden = true;
    if (z.scrollHeight <= z.clientHeight + 1) return;
    var k = 0;
    for (var i = it.length - 1; i >= 0 && z.scrollHeight > z.clientHeight + 1; i--) { it[i].hidden = true; k++; }
    r.hidden = !k; r.textContent = '+ ' + k + ' ' + (k > 1 ? '${T("autres")}' : '${T("autre")}');
    r.title = '${T("Passez à la vue Jour pour tout voir.")}';
  }
  function ajusterJour(){
    var z = document.querySelector('#cal-jour .cal-items'), r = document.getElementById('cal-reste'); if (!z || !r) return;
    var it = z.querySelectorAll('.cal-item');
    Array.prototype.forEach.call(it, function(e){ e.hidden = false; });
    r.hidden = true;
    if (z.scrollHeight <= z.clientHeight + 1) return;
    var k = 0;
    for (var i = it.length - 1; i >= 0 && z.scrollHeight > z.clientHeight + 1; i--) { it[i].hidden = true; k++; }
    r.hidden = !k; r.textContent = '${T("+ {0} autres ce jour-là — ouvrez leur module.")}'.split('{0}').join(k);
  }

  corps.onclick = function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var vb = t.closest('[data-vue]');
    if (vb) { VUE = vb.getAttribute('data-vue'); try { localStorage.setItem('sz-cal-vue', VUE); } catch (e) {} charger(); return; }
    var n = t.closest('[data-nav]');
    if (n) {
      var v = +n.getAttribute('data-nav');
      if (v === 0) JOUR = AUJ;
      else if (VUE === 'jour') JOUR = plusJours(JOUR, v);
      else if (VUE === 'semaine') JOUR = plusJours(lundiDe(JOUR), 7 * v);
      else { var dm = versDate(JOUR); dm = new Date(dm.getFullYear(), dm.getMonth() + v, 1); JOUR = versIso(dm);
        if (AUJ && AUJ.slice(0, 7) === JOUR.slice(0, 7)) JOUR = AUJ; }
      charger(); return;
    }
    var vj = t.closest('[data-voirjour]');
    if (vj) { JOUR = vj.getAttribute('data-voirjour'); VUE = 'jour'; try { localStorage.setItem('sz-cal-vue', VUE); } catch (e) {} charger(); return; }
    var it = t.closest('.cal-item');
    if (it) {
      var k = String(it.getAttribute('data-ev') || '').split('|');
      var e = duJour(k[0])[+k[1]];
      if (e && e.ouvrir && P && P.ouvrirModule) { P.ouvrirModule(e.ouvrir); szDire('${T("Ouverture du module…")}'); }
      return;
    }
    var c = t.closest('.cal-case[data-jour]');
    if (c) {
      /* Un double-clic sur une case ouvre la vue Jour. */
      if (ev.detail >= 2) { JOUR = c.getAttribute('data-jour'); VUE = 'jour'; try { localStorage.setItem('sz-cal-vue', VUE); } catch (e2) {} charger(); return; }
      JOUR = c.getAttribute('data-jour');
      Array.prototype.forEach.call(corps.querySelectorAll('.cal-case.choisi'), function(x){ x.classList.remove('choisi'); });
      c.classList.add('choisi'); dessinerJour(); }
  };
  var minut = null;
  window.addEventListener('resize', function(){ clearTimeout(minut); minut = setTimeout(function(){ if (VUE === 'mois') { ajusterCases(); ajusterJour(); } else dessiner(); }, 120); });
  charger();
})();
</script></body></html>`;
}

module.exports = { pageCalendrier };
