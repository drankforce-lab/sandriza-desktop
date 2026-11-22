'use strict';
/*
 * OBJECTIFS ET DÉFIS DE VENTE — fenêtre native (2026-11-20)
 * =============================================================================
 * Module choisi sur la page « Douze nouveaux modules » : « Objectifs et défis de
 * vente (tableau de bord) ».
 *
 * Un objectif = une cible chiffrée sur une période (ventes, commandes, articles
 * d'une catégorie, comptoir, panier moyen, nouveaux clients). Un défi = même
 * moteur, affiché comme un défi d'équipe. La PROGRESSION se recalcule côté site à
 * chaque lecture depuis les commandes (assets/js/objectifs.js) : cette fenêtre ne
 * fait qu'afficher et envoyer la définition.
 *
 *   objectifs:donnees   → { objectifs[], mesures, genres, categories, propositions, peutEcrire }
 *   objectifs:ecrire    (saisie) → { ok, id }
 *   objectifs:supprimer (id)     → { ok }
 *
 * Chaque carte : la valeur atteinte sur la cible, une barre qui montre aussi où
 * l'on DEVRAIT être aujourd'hui (le repère), le rythme à tenir par jour, et une
 * courbe cumulée contre la droite de l'objectif.
 *
 * États d'ouverture (pour les bancs de rendu, qui ne cliquent pas) :
 *   'nouveau'  → le formulaire vide est ouvert
 *   'modifier' → le formulaire du premier objectif est ouvert
 */
const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
const T = require('../langue').tr('objectifs');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.tete .cx-resume{color:var(--tx2);font-size:.8rem}
.tete .cx-actions{margin-left:auto;display:flex;gap:.5rem}
select,input,button,textarea{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;
  padding:.32rem .55rem;cursor:pointer}
input,textarea{cursor:text}
input[type=checkbox]{width:auto;padding:0;cursor:pointer}
textarea{resize:none}
select:focus,input:focus,button:focus,textarea:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.dang{color:var(--tx-err2)}
#corps{flex:1 1 auto;min-height:0;overflow:hidden;padding:1rem 1.1rem .8rem;display:flex;flex-direction:column}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.8rem}
.msg.bon{color:var(--tx-ok)} .msg.err{color:var(--tx-err)}
.grp{margin:0 0 1.2rem}
.grp>h2{margin:0 0 .6rem;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:var(--tx2)}
.ob-l{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:.85rem;flex:1 1 auto;min-height:0;align-content:start}
.ob{background:var(--f-carte);border:1px solid var(--v08);border-radius:14px;padding:.95rem 1rem;display:flex;flex-direction:column;gap:.55rem;min-width:0}
.ob.epingle{border-color:rgba(var(--or-rgb),.55)}
.ob-h{display:flex;align-items:flex-start;gap:.6rem}
.ob-h .t{flex:1;min-width:0}
.ob-h b{display:block;font-size:.98rem;line-height:1.3}
.ob-h .m{font-size:.76rem;color:var(--tx2)}
.pill{display:inline-flex;align-items:center;font-size:.7rem;font-weight:700;padding:.1rem .5rem;border-radius:999px;white-space:nowrap;
  background:var(--v08);color:var(--tx2)}
.pill.defi{background:rgba(180,156,247,.16);color:#c9b8fa}
.pill.atteint{background:rgba(74,222,128,.14);color:var(--tx-ok)}
.pill.enavance{background:rgba(96,165,250,.14);color:var(--tx-bleu)}
.pill.enretard{background:rgba(251,191,36,.14);color:var(--tx-att)}
.pill.manque{background:rgba(248,113,113,.14);color:var(--tx-err2)}
html.jour .pill{color:#47505e} html.jour .pill.defi{color:#5b3fa0} html.jour .pill.enavance{color:#2f5f96} html.jour .pill.atteint{color:#1d6a3b}
.ob-v{display:flex;align-items:baseline;gap:.4rem;flex-wrap:wrap}
.ob-v .n{font-size:1.55rem;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.ob-v .c{color:var(--tx2);font-size:.85rem;font-variant-numeric:tabular-nums}
.ob-v .p{margin-left:auto;font-weight:800;font-size:.95rem;font-variant-numeric:tabular-nums}
.jauge{position:relative;height:9px;border-radius:99px;background:var(--v08);overflow:visible}
.jauge i{display:block;height:100%;border-radius:99px;background:var(--or);max-width:100%}
.jauge.atteint i{background:var(--vv,#5fd4a4)} .jauge.enavance i{background:var(--vv-2,#7cb4f5)} .jauge.enretard i{background:#f2c26b} .jauge.manque i{background:#f08a8a}
.jauge .rep{position:absolute;top:-3px;bottom:-3px;width:2px;border-radius:2px;background:var(--tx)}
.ob-r{font-size:.8rem;color:var(--tx2)}
.ob-r b{color:var(--tx)}
.ob svg.cb{display:block;width:100%;height:46px}
.ob svg .cible{stroke:var(--v30);stroke-dasharray:3 4;fill:none}
.ob svg .reel{fill:none;stroke:var(--or);stroke-width:2}
.ob svg .aire{fill:rgba(var(--or-rgb),.14);stroke:none}
.ob-a{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.1rem}
.ob-a button{font-size:.78rem;padding:.22rem .6rem}
.vide-ob{display:flex;flex-direction:column;align-items:center;text-align:center;gap:.6rem;padding:2rem 1rem}
.vide-ob .vo-ic{width:56px;height:56px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;
  background:rgba(var(--or-rgb),.14);color:var(--or);box-shadow:inset 0 0 0 1px rgba(var(--or-rgb),.3)}
.vide-ob .vo-ic svg{width:28px;height:28px}
.vide-ob h2{margin:.2rem 0 0;font-size:1.1rem}
.vide-ob p{margin:0;max-width:34rem;color:var(--tx2)}
.props{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:.6rem;width:100%;max-width:820px;margin-top:.6rem}
.prop{background:var(--f-carte);border:1px solid var(--v08);border-radius:12px;padding:.7rem .8rem;text-align:left;display:flex;flex-direction:column;gap:.35rem}
.prop b{font-size:.9rem} .prop span{font-size:.76rem;color:var(--tx2)}
.prop button{align-self:flex-start;margin-top:.2rem;font-size:.78rem}
#f-ob{background:var(--f-carte);border:1px solid rgba(var(--or-rgb),.35);border-radius:14px;padding:1rem 1.1rem;max-width:760px;margin:0 0 1.2rem}
#f-ob h2{margin:0 0 .8rem;font-size:1rem}
.chps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem .9rem}
.ch{display:flex;flex-direction:column;gap:.25rem;min-width:0}
.ch.l2{grid-column:1/-1}
.ch label{font-size:.76rem;color:var(--tx2);font-weight:600}
.ch input,.ch select,.ch textarea{width:100%}
.coche{display:flex;align-items:center;gap:.45rem;font-size:.84rem}
.f-act{display:flex;gap:.5rem;margin-top:.95rem;justify-content:flex-end}
.avis{font-size:.8rem;color:var(--tx2);margin:0 0 .8rem}
`;

function pageObjectifs(ouverture) {
  const ok = ['nouveau', 'modifier'];
  const etat = ok.indexOf(String(ouverture || '')) >= 0 ? String(ouverture) : '';
  return `${TETE()}
<title>${T("Objectifs et défis — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.objectifs}</span><h1>${T("Objectifs et défis")}</h1>
  <span class="cx-resume" id="sous"></span><div class="cx-actions" id="outils"></div></div>
<div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var elOutils = document.getElementById('outils');
  var elSous = document.getElementById('sous');
  var LIEU = '${LIEU()}';
  var D = null;
  var ETAT = '${etat}';
  var OCCUPE = false;
  var FORM = null;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

  var MOTIFS = {
    maj_en_cours:       '${T("Une mise à jour s’installe : cette opération est suspendue jusqu’au redémarrage de l’application.")}',
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas de modifier les objectifs.")}',
    indisponible:       '${T("Le module des objectifs n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    titre:              '${T("Donnez un titre à l’objectif.")}',
    mesure:             '${T("Choisissez ce que l’objectif mesure.")}',
    cible:              '${T("La cible doit être un nombre plus grand que zéro.")}',
    periode:            '${T("La date de fin doit suivre la date de début (400 jours au plus).")}',
    introuvable:        '${T("Cet objectif n’existe plus — il a peut-être été retiré depuis un autre poste. La liste a été relue.")}',
    nuage:              '${T("Le nuage a refusé l’écriture : elle n’existe que sur ce poste. Vérifiez la connexion, puis refaites le geste.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
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

  /* ── Formats ─────────────────────────────────────────────────────────── */
  function mesure(cle){
    var L = (D && D.mesures) || [];
    for (var i = 0; i < L.length; i++) if (L[i].cle === cle) return L[i];
    return { cle: cle, nom: cle, unite: '' };
  }
  function nomDe(liste, cle){
    var L = (D && D[liste]) || [];
    for (var i = 0; i < L.length; i++) if (L[i].cle === cle) return szTd(L[i].nom);
    return '';
  }
  function nombre(v, unite){
    var n = Number(v) || 0;
    if (unite === '$') return szArgent(n);
    try { return n.toLocaleString(LIEU, { maximumFractionDigits: 1 }); } catch (e) { return String(n); }
  }
  function jour(s){
    var p = String(s || '').split('-');
    if (p.length !== 3) return String(s || '');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    try { return d.toLocaleDateString(LIEU, { day: 'numeric', month: 'short' }); } catch (e) { return s; }
  }
  var STATUTS = {
    atteint:  '${T("Atteint")}',
    enavance: '${T("Dans les temps")}',
    enretard: '${T("En retard")}',
    manque:   '${T("Non atteint")}',
    avenir:   '${T("À venir")}'
  };

  /* La courbe cumulée de la période contre la droite de l'objectif. */
  function courbe(o){
    var pj = o.parJour || [];
    if (pj.length < 2 || !(o.cible > 0)) return '';
    var n = pj.length, ecoules = Math.max(1, Math.min(n, o.joursEcoules || n));
    var cum = [], s = 0;
    for (var i = 0; i < ecoules; i++) { s += Number(pj[i]) || 0; cum.push(s); }
    var haut = Math.max(o.cible, s) || 1;
    var X = function(i){ return Math.round(i / (n - 1) * 1000) / 10; };
    var Y = function(v){ return Math.round((44 - v / haut * 40) * 10) / 10; };
    var pts = cum.map(function(v, i){ return X(i) + ' ' + Y(v); });
    var ligne = 'M' + pts.join(' L');
    var aire = ligne + ' L' + X(ecoules - 1) + ' 46 L0 46Z';
    return '<svg class="cb" viewBox="0 0 100 46" preserveAspectRatio="none" aria-hidden="true">'
      + '<path class="cible" vector-effect="non-scaling-stroke" d="M0 44 L100 ' + Y(o.cible) + '"></path>'
      + '<path class="aire" d="' + aire + '"></path>'
      + '<path class="reel" vector-effect="non-scaling-stroke" d="' + ligne + '"></path></svg>';
  }

  function carte(o){
    var m = mesure(o.mesure), u = m.unite;
    var pct = Math.max(0, Math.min(100, Number(o.pct) || 0));
    var rep = (o.joursTotal > 0 && o.statut !== 'avenir' && o.mesure !== 'panier') ? Math.max(0, Math.min(100, o.joursEcoules / o.joursTotal * 100)) : -1;
    var quoi = szTd(m.nom) + (o.categorie ? ' · ' + nomDe('categories', o.categorie) : '');
    var quand = jour(o.debut) + ' → ' + jour(o.fin);
    var rythme = '';
    if (o.statut === 'atteint') rythme = '${T("Cible atteinte. Bravo !")}';
    else if (o.statut === 'manque') rythme = '${T("Période terminée. Il manquait {0}.")}'.split('{0}').join('<b>' + esc(nombre(o.reste, u)) + '</b>');
    else if (o.statut === 'avenir') rythme = '${T("Commence le {0}")}'.split('{0}').join(esc(jour(o.debut)));
    else if (o.mesure === 'panier') rythme = '${T("Panier moyen de la période, sur la cible.")}';
    else if (o.rythme > 0) rythme = '${T("Il faut {0} par jour pendant {1} jours pour y arriver.")}'.split('{0}').join('<b>' + esc(nombre(o.rythme, u)) + '</b>').split('{1}').join(String(o.joursRestants));
    var h = '<article class="ob' + (o.epingle ? ' epingle' : '') + '" data-ob="' + esc(o.id) + '">'
      + '<div class="ob-h"><div class="t"><b>' + esc(szTd(o.titre)) + '</b><span class="m">' + esc(quoi) + ' · ' + esc(quand) + '</span></div>'
      + (o.genre === 'defi' ? '<span class="pill defi">${T("Défi")}</span>' : '')
      + '<span class="pill ' + esc(o.statut) + '">' + esc(STATUTS[o.statut] || '') + '</span></div>'
      + '<div class="ob-v"><span class="n">' + esc(nombre(o.valeur, u)) + '</span><span class="c">/ ' + esc(nombre(o.cible, u)) + '</span>'
      + '<span class="p">' + esc(nombre(o.pct, '')) + ' %</span></div>'
      + '<div class="jauge ' + esc(o.statut) + '" title="${T("Le trait montre où il faudrait être aujourd’hui.")}"><i style="width:' + pct + '%"></i>'
      + (rep >= 0 ? '<span class="rep" style="left:calc(' + rep.toFixed(1) + '% - 1px)"></span>' : '') + '</div>'
      + (rythme ? '<div class="ob-r">' + rythme + '</div>' : '')
      + courbe(o)
      + (o.note ? '<div class="ob-r">' + esc(o.note) + '</div>' : '');
    if (D.peutEcrire) h += '<div class="ob-a"><button type="button" data-modif="' + esc(o.id) + '">${T("Modifier")}</button>'
      + '<button type="button" data-epingle="' + esc(o.id) + '">' + (o.epingle ? '${T("Retirer du tableau de bord")}' : '${T("Afficher au tableau de bord")}') + '</button>'
      + '<button type="button" class="dang" data-suppr="' + esc(o.id) + '">${T("Supprimer")}</button></div>';
    return h + '</article>';
  }

  function options(liste, choisi){
    return ((D && D[liste]) || []).map(function(x){
      return '<option value="' + esc(x.cle) + '"' + (x.cle === choisi ? ' selected' : '') + '>' + esc(szTd(x.nom)) + '</option>';
    }).join('');
  }
  function formulaire(){
    var f = FORM;
    return '<form id="f-ob" onsubmit="return false"><h2>' + (f.id ? '${T("Modifier l’objectif")}' : '${T("Nouvel objectif")}') + '</h2><div class="chps">'
      + '<div class="ch l2"><label for="o-titre">${T("Titre")}</label><input id="o-titre" maxlength="120" value="' + esc(f.titre) + '" placeholder="${T("Ex. : Ventes de novembre")}"></div>'
      + '<div class="ch"><label for="o-genre">${T("Genre")}</label><select id="o-genre">' + options('genres', f.genre) + '</select></div>'
      + '<div class="ch"><label for="o-mesure">${T("Ce qui se mesure")}</label><select id="o-mesure">' + options('mesures', f.mesure) + '</select></div>'
      + (f.mesure === 'articles' ? '<div class="ch l2"><label for="o-cat">${T("Catégorie")}</label><select id="o-cat">' + options('categories', f.categorie) + '</select></div>' : '')
      + '<div class="ch"><label for="o-cible">${T("Cible")}' + (mesure(f.mesure).unite === '$' ? ' ($)' : '') + '</label><input id="o-cible" inputmode="decimal" value="' + esc(f.cible) + '"></div>'
      + '<div class="ch"><label>&nbsp;</label><label class="coche"><input type="checkbox" id="o-epingle"' + (f.epingle ? ' checked' : '') + '> ${T("Afficher au tableau de bord")}</label></div>'
      + '<div class="ch"><label for="o-debut">${T("Du")}</label><input id="o-debut" type="date" value="' + esc(f.debut) + '"></div>'
      + '<div class="ch"><label for="o-fin">${T("Au")}</label><input id="o-fin" type="date" value="' + esc(f.fin) + '"></div>'
      + '<div class="ch l2"><label for="o-note">${T("Note (facultatif)")}</label><textarea id="o-note" rows="2" maxlength="300">' + esc(f.note) + '</textarea></div>'
      + '</div><div class="f-act"><button type="button" id="o-annuler">${T("Annuler")}</button>'
      + '<button type="button" class="prim" id="o-ok">' + (f.id ? '${T("Enregistrer")}' : '${T("Créer l’objectif")}') + '</button></div></form>';
  }
  function ramasser(){
    if (!FORM) return;
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : null; };
    var x;
    if ((x = v('o-titre')) != null) FORM.titre = x;
    if ((x = v('o-genre')) != null) FORM.genre = x;
    if ((x = v('o-mesure')) != null) FORM.mesure = x;
    if ((x = v('o-cat')) != null) FORM.categorie = x;
    if ((x = v('o-cible')) != null) FORM.cible = x;
    if ((x = v('o-debut')) != null) FORM.debut = x;
    if ((x = v('o-fin')) != null) FORM.fin = x;
    if ((x = v('o-note')) != null) FORM.note = x;
    var e = document.getElementById('o-epingle'); if (e) FORM.epingle = !!e.checked;
  }
  function objectif(id){
    var L = (D && D.objectifs) || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i];
    return null;
  }
  function depuis(o){
    return { id: o.id || '', titre: o.titre || '', genre: o.genre || 'objectif', mesure: o.mesure || 'ventes', categorie: o.categorie || '',
      cible: o.cible != null ? String(o.cible) : '', debut: o.debut || (D && D.aujourdhui) || '', fin: o.fin || (D && D.aujourdhui) || '',
      note: o.note || '', epingle: !!o.epingle, actif: o.actif !== false };
  }

  function outils(){
    elOutils.innerHTML = (D && D.peutEcrire && !FORM) ? '<button type="button" class="prim" id="o-nouveau">${T("+ Nouvel objectif")}</button>' : '';
  }
  function dessiner(){
    outils();
    if (!D) return;
    var L = D.objectifs || [], auj = D.aujourdhui;
    var enCours = L.filter(function(o){ return o.statut !== 'avenir' && o.fin >= auj; });
    var avenir = L.filter(function(o){ return o.statut === 'avenir'; });
    var finis = L.filter(function(o){ return o.fin < auj; }).sort(function(a, b){ return String(b.fin).localeCompare(String(a.fin)); });
    elSous.textContent = enCours.length ? '${T("{0} en cours").split("{0}").join("' + enCours.length + '")}' : '';
    var h = '';
    if (!D.peutEcrire) h += '<p class="avis">${T("Lecture seule : votre rôle ne permet pas de créer ni de modifier les objectifs.")}</p>';
    if (FORM) h += formulaire();
    if (!L.length && !FORM) {
      h += '<div class="vide-ob"><span class="vo-ic" aria-hidden="true">${ICO.objectifs}</span><h2>${T("Fixez votre premier objectif")}</h2>'
        + '<p>${T("Une cible chiffrée pour la semaine ou le mois : l’application suit la progression toute seule, à partir des ventes.")}</p>';
      if (D.peutEcrire) h += '<div class="props">' + (D.propositions || []).map(function(p){
        var m = mesure(p.mesure);
        return '<div class="prop"><b>' + esc(szTd(p.titre)) + '</b><span>' + esc(nombre(p.cible, m.unite)) + ' · ' + esc(jour(p.debut)) + ' → ' + esc(jour(p.fin)) + '</span>'
          + '<button type="button" class="prim" data-prop="' + esc(p.cle) + '">${T("Ajouter")}</button></div>';
      }).join('') + '</div>';
      corps.innerHTML = h + '</div>';
      return;
    }
    /* ⚠ AUCUNE GLISSIÈRE (sa règle) : une seule grille, PAGINÉE par le socle (data-pages) — en cours, puis à venir,
       puis terminés ; la pastille de chaque carte dit où elle en est. */
    h += '<div class="ob-l" data-pages="objectifs">' + enCours.concat(avenir, finis).map(carte).join('') + '</div>';
    corps.innerHTML = h;
    if (FORM) { var t = document.getElementById('o-titre'); if (t && !t.value) t.focus(); }
  }

  function charger(){
    appeler('objectifs:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; elOutils.innerHTML = ''; return; }
      D = r;
      if (ETAT === 'nouveau' && D.peutEcrire) FORM = depuis({});
      else if (ETAT === 'modifier' && D.peutEcrire && D.objectifs && D.objectifs[0]) FORM = depuis(D.objectifs[0]);
      ETAT = '';
      dessiner();
    });
  }
  function enregistrer(btn, saisie, apres){
    if (OCCUPE) return;
    OCCUPE = true; if (btn) btn.disabled = true;
    szDire('${T("Enregistrement…")}');
    appeler('objectifs:ecrire', [saisie]).then(function(r){
      OCCUPE = false; if (btn) btn.disabled = false;
      if (!r.ok) { szDire(expliquer(r), 'err'); if (r.motif === 'introuvable') { FORM = null; charger(); } return; }
      szDire(apres || '${T("Objectif enregistré.")}', 'bon');
      FORM = null; charger();
    });
  }
  function supprimer(id){
    var o = objectif(id); if (!o) return;
    szConfirmer({ prudent: true, titre: '${T("Supprimer l’objectif")}', texte: '${T("« {0} » sera retiré pour tout le monde.")}'.split('{0}').join(o.titre),
      oui: '${T("Supprimer")}' }).then(function(oui){
      if (!oui) return;
      appeler('objectifs:supprimer', [id]).then(function(r){
        if (!r.ok) { szDire(expliquer(r), 'err'); charger(); return; }
        szDire('${T("Objectif supprimé.")}', 'bon'); charger();
      });
    });
  }

  document.addEventListener('click', function(ev){
    var t = ev.target && ev.target.closest ? ev.target.closest('button') : null;
    if (!t) return;
    if (t.id === 'o-nouveau') { FORM = depuis({}); dessiner(); return; }
    if (t.id === 'o-annuler') { FORM = null; dessiner(); return; }
    if (t.id === 'o-ok') { ramasser(); enregistrer(t, FORM); return; }
    var id;
    if ((id = t.getAttribute('data-modif'))) { var o = objectif(id); if (o) { FORM = depuis(o); dessiner(); corps.scrollTop = 0; } return; }
    if ((id = t.getAttribute('data-suppr'))) { supprimer(id); return; }
    if ((id = t.getAttribute('data-epingle'))) { var e = objectif(id); if (e) { var s = depuis(e); s.epingle = !e.epingle; enregistrer(t, s, s.epingle ? '${T("Affiché au tableau de bord.")}' : '${T("Retiré du tableau de bord.")}'); } return; }
    if ((id = t.getAttribute('data-prop'))) {
      var L = (D && D.propositions) || [];
      for (var i = 0; i < L.length; i++) if (L[i].cle === id) { var p = depuis(L[i]); p.titre = szTd(L[i].titre); p.epingle = (i === 0); enregistrer(t, p, '${T("Objectif ajouté.")}'); }
      return;
    }
  });
  document.addEventListener('input', function(){ ramasser(); });
  document.addEventListener('change', function(ev){
    ramasser();
    if (ev.target && ev.target.id === 'o-mesure') { dessiner(); var e = document.getElementById('o-mesure'); if (e) e.focus(); }
  });
  document.addEventListener('keydown', function(ev){
    var t = ev.target;
    if (ev.key === 'Enter' && t && t.closest && t.closest('#f-ob') && t.tagName !== 'TEXTAREA' && t.tagName !== 'BUTTON') {
      ev.preventDefault(); ramasser(); enregistrer(document.getElementById('o-ok'), FORM); return;
    }
    if (ev.key !== 'Escape') return;
    if (document.querySelector('.szc-voile')) return;
    ev.preventDefault();
    if (FORM) { FORM = null; dessiner(); return; }
    if (P && P.fermer) P.fermer();
  });
  function rechargerSiLibre(){ if (!OCCUPE && !FORM) charger(); }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) rechargerSiLibre(); });
  window.szActualiser = rechargerSiLibre;
  window.szRevenir = rechargerSiLibre;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;flex:0 0 auto');
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

module.exports = { pageObjectifs };
