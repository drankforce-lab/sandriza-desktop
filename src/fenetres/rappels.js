'use strict';

/*
 * FENÊTRE « RAPPELS » — NATIVE (2026-10-02)
 * =============================================================================
 * Sa demande : « un module de rappel, par exemple pour les entrées des
 * dépenses, etc. »
 *
 * À GAUCHE, LES RAPPELS, rangés par ÉCHÉANCE : en retard, aujourd'hui, cette
 * semaine, à venir — et les terminés, repliés. Chaque ligne se traite sur
 * place : « Fait » (le site le pousse à sa prochaine échéance), « Reporter »
 * (+1 j, +3 j, +7 j ou une date), « Ouvrir » (le module qu'il concerne).
 * À DROITE, LES RAPPELS PROPOSÉS (dates de l'ARC et de Revenu Québec, ajoutés
 * d'un clic) ou, quand on en crée ou en modifie un, son formulaire.
 *
 * ⚠ LA FENÊTRE NE CALCULE AUCUNE ÉCHÉANCE. La prochaine date après « Fait », le
 * jour du mois gardé (un rappel du 31 retombe au 30 en avril puis revient au
 * 31), l'état (retard / aujourd'hui / bientôt) : tout vient du site
 * (assets/js/rappels.js). Le seul calcul fait ici est le libellé RELATIF
 * (« dans 5 jours »), à partir de la date du jour que le site envoie.
 *
 * ⚠ LES NOTIFICATIONS DE BUREAU ne vivent pas ici : c'est le processus principal
 * qui les envoie (src/rappels-notif.js). La fenêtre ne fait que montrer et
 * changer leur interrupteur (P.rappelsNotif).
 *
 * ⚠ ON N'ENVOIE JAMAIS UN TEXTE TRADUIT : fréquences, modules et rappels
 * proposés arrivent en français ({ cle, nom }) ; on AFFICHE szTd(nom) et on
 * ENVOIE la clé.
 *
 * ⚠ AUCUN CARACTÈRE accent grave NI ANTISLASH dans la portion de script : elle
 * vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('rappels');

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
/* 2026-10-16 : la grammaire de la Comptabilite (CSS_COMPTA du socle) — tete avec resume et geste
   principal, bande de chiffres, deux colonnes de cartes. */
#corps{overflow:hidden}
select,input,button,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.28rem .5rem;cursor:pointer}
input,textarea{cursor:text}
input[type=checkbox]{width:auto;padding:0;cursor:pointer}
textarea{resize:none}
select:focus,input:focus,button:focus,textarea:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
button.mini{padding:.1rem .42rem;font-size:.74rem}
button.danger{border-color:rgba(248,113,113,.45);color:var(--tx-err2)}
button.aconf{background:rgba(248,113,113,.16);color:var(--tx-err2)}
html.jour button.aconf{color:#7f1d1d}
button.fait{border-color:rgba(74,222,128,.45);color:var(--tx-ok)}
.duo{display:grid;grid-template-columns:minmax(0,1fr) 22rem;gap:.9rem}
.duo>div{display:flex;flex-direction:column;gap:.9rem;min-width:0}
/* 2026-10-12 (<< aucun scroll bar >>) : la colonne des rappels PROPOSES depassait en bas en fenetre basse — et
   comme la page de << Mes rappels >> se reduit tant que le corps deborde, elle tombait a UN rappel par page.
   La duo prend la hauteur qui reste, et les proposes se paginent dans leur carte. */
.duo{flex:1 1 0;min-height:0;grid-template-rows:minmax(0,1fr);align-items:stretch}
#corps>.duo{flex:1 1 0}
.duo>div{min-height:0;max-height:100%}
.duo>div>.sz-pagee{flex:1 1 0;min-height:0}
/* ⚠ LA CARTE DE LA LISTE NE COUPE PAS : c est son debordement qui fait grandir corps.scrollHeight, et
   dessiner() retire une ligne par page tant qu il deborde. Elle grandit jusqu en bas, sans retrecir. */
.duo>div>.cx-carte.liste{flex:1 0 auto;overflow:visible}
.pages{display:flex;align-items:center;gap:.4rem;margin-left:auto;font-size:.74rem;font-weight:400;color:var(--tx2)}
.pages button.pgf{min-width:1.9rem;padding:.08rem .45rem;font-size:.95rem;line-height:1.1}
.gris{color:var(--tx2)}.bon{color:var(--tx-ok)}.mauvais{color:var(--tx-err2)}.attn{color:var(--tx-att)}
.aide{font-size:.76rem;color:var(--tx2);line-height:1.45}
.avis{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}
.appel{display:flex;flex-direction:column;align-items:center;gap:.6rem;padding:1.6rem 1rem;text-align:center}
.appel strong{font-size:.98rem}
.appel .aide{max-width:34rem}
.appel .boutons{justify-content:center}

/* ── La liste ────────────────────────────────────────────────────────────── */
.grp{display:flex;align-items:center;gap:.5rem;font-size:.88rem;font-weight:650;color:var(--tx);padding:.35rem .1rem .05rem}
.grp .nb{font-weight:400;font-size:.75rem;color:var(--tx3);font-variant-numeric:tabular-nums}
.grp.retard{color:var(--tx-err)}.grp.aujourdhui{color:var(--tx-att)}
.grp button{margin-left:auto;font-weight:400}
.rp{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:.4rem .7rem;align-items:center;
  padding:.5rem .75rem;border:1px solid var(--sz-bord);border-radius:11px;border-left:3px solid var(--sz-bord)}
.rp:hover{background:var(--v03)}
.rp.sel{background:rgba(var(--or-rgb),.10)}
/* Sur la ligne choisie (fond or), la pastille rouge tombait a 4.27 la nuit (contrastes Linux, 7.37.0). */
.rp.sel .rf-pill.rouge{color:color-mix(in srgb,var(--tx-err) 72%,var(--tx))}
.rp.retard{border-left-color:color-mix(in srgb,var(--tx-err) 70%,transparent)}
.rp.aujourdhui{border-left-color:color-mix(in srgb,var(--tx-att) 70%,transparent)}
.rp.termine{opacity:.72}
.rp .t{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rp .cx-l2{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rp .act{display:flex;gap:.3rem;align-items:center}
.rep{grid-column:1/-1;display:flex;gap:.35rem;align-items:center;flex-wrap:wrap;
  padding:.35rem .45rem;border-radius:8px;background:var(--v04);border:1px solid var(--v08)}
.rep label{font-size:.74rem;color:var(--tx2)}

/* ── Les rappels proposés ────────────────────────────────────────────────── */
.mdl{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.4rem;align-items:center;
  padding:.32rem 0;border-bottom:1px solid var(--v055)}
.mdl:last-child{border-bottom:0}
.mdl .t{font-weight:600;font-size:.82rem}
.mdl .n{font-size:.71rem;color:var(--tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ── Le formulaire ───────────────────────────────────────────────────────── */
.form2{display:grid;grid-template-columns:1fr 1fr;gap:.42rem .65rem}
.champ{display:flex;flex-direction:column;gap:.16rem;min-width:0}
.champ label{font-size:.71rem;color:var(--tx2)}
.champ input,.champ select,.champ textarea{width:100%;min-width:0}
.large{grid-column:1/-1}
.case{display:flex;align-items:center;gap:.4rem;font-size:.78rem;cursor:pointer}
.boutons{display:flex;gap:.5rem;justify-content:flex-end;align-items:center;margin-top:.55rem;flex-wrap:wrap}
.boutons .gauche{margin-right:auto}
.hist{margin-top:.5rem}
.hist h2{margin-bottom:.15rem}
.notif{display:flex;align-items:center;gap:.35rem;font-size:.76rem;color:var(--tx2);cursor:pointer}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (max-width:980px){.duo{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Rappels ».
 * `ouverture` : '' (la liste), ou un état qui ne s'atteint autrement qu'au clic —
 * 'nouveau' (le formulaire vierge), 'modifier' (le premier rappel ouvert en
 * modification), 'reporter' (le menu « Reporter » du premier rappel actif).
 * ⚠ Ils existent pour le garde-fou de rendu, qui ne simule aucun clic.
 */
function pageRappels(ouverture) {
  const ok = ['nouveau', 'modifier', 'reporter'];
  const etat = ok.indexOf(String(ouverture || '')) >= 0 ? String(ouverture) : '';
  return `${TETE()}
<title>${T("Rappels — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.rappels}</span><h1>${T("Rappels")}</h1>
  <span class="cx-resume" id="sous"></span><div class="cx-actions" id="outils"></div></div>
<div class="cx" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('rappels')}
  var corps = document.getElementById('corps');
  var elOutils = document.getElementById('outils');
  var elSous = document.getElementById('sous');

  var D = null;
  var ETAT = '${etat}';
  var OCCUPE = false;
  var PA = false, PM = false, PS = false;
  var FORM = null;             /* le rappel en cours de saisie */
  var REPORT = '';             /* le rappel dont le menu « Reporter » est ouvert */
  var REPDATE = '';
  var REPLIS = { termine: true };   /* les groupes replies */
  var PG = 0, BU = 0;          /* page de la liste, lignes par page MESUREES */
  var ARME = null;
  var NOTIF = null;            /* l interrupteur des notifications (null : inconnu) */

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas de modifier les rappels.")}',
    indisponible:       '${T("Le module des rappels n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    titre:              '${T("Donnez un titre au rappel.")}',
    date:               '${T("Choisissez la date de la prochaine échéance.")}',
    introuvable:        '${T("Ce rappel n’existe plus — il a peut-être été retiré depuis un autre poste. La liste a été relue.")}',
    deja:               '${T("Ce rappel proposé est déjà dans votre liste.")}',
    nuage:              '${T("Le nuage a refusé l’écriture : elle n’existe que sur ce poste et sera perdue ailleurs. Vérifiez la connexion, puis refaites le geste.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r, geste){
    var m = r && r.motif;
    if (m === 'date' && geste === 'reporter') return '${T("La nouvelle date doit tomber après aujourd’hui.")}';
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

  /* ── Les libelles venus du site ─────────────────────────────────────────── */
  function nomDe(liste, cle){
    var L = (D && D[liste]) || [];
    for (var i = 0; i < L.length; i++) if (L[i].cle === cle) return szTd(L[i].nom);
    return '';
  }
  function nomFreq(c){ return nomDe('frequences', c); }
  function nomModule(c){ return c ? nomDe('modules', c) : ''; }
  function rappel(id){
    var L = (D && D.rappels) || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i];
    return null;
  }
  /* En dates de calendrier, comme le site : un changement d heure ne decale rien. */
  function jours(de, a){
    function t(iso){ return Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)); }
    if (!de || !a) return 0;
    return Math.round((t(a) - t(de)) / 86400000);
  }
  function relatif(r){
    if (r.etat === 'termine') return r.dernierFait ? '${T("fait le")} ' + szJour(r.dernierFait) : '${T("terminé")}';
    var n = jours(D.aujourdhui, r.prochaine);
    if (n < 0) return '${T("en retard de")} ' + (-n) + ' ' + szPl(-n, '${T("jour")}', '${T("jours")}');
    if (n === 0) return '${T("aujourd’hui")}';
    if (n === 1) return '${T("demain")}';
    return '${T("dans")} ' + n + ' ' + szPl(n, '${T("jour")}', '${T("jours")}');
  }

  /* ── LE CHARGEMENT ──────────────────────────────────────────────────────── */
  function charger(){
    if (OCCUPE) return Promise.resolve();
    OCCUPE = true;
    return appeler('rappels:donnees', []).then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) {
        D = null; outils();
        corps.innerHTML = '<div class="appel cx-carte"><strong>${T("Rappels indisponibles")}</strong><div class="aide">' + esc(expliquer(r)) + '</div></div>';
        return;
      }
      D = r;
      PA = !!r.peutAjouter; PM = !!r.peutModifier; PS = !!r.peutSupprimer;
      if (ETAT === 'nouveau' && PA) FORM = vierge();
      if (ETAT === 'modifier' && PM && (r.rappels || []).length) FORM = depuis(r.rappels[0]);
      if (ETAT === 'reporter' && PM) {
        var a = (r.rappels || []).filter(function(x){ return x.etat !== 'termine'; })[0];
        if (a) REPORT = a.id;
      }
      ETAT = '';
      if (FORM && FORM.id && !rappel(FORM.id)) FORM = null;
      if (REPORT && !rappel(REPORT)) REPORT = '';
      dessiner();
    });
  }
  function lireNotif(){
    if (!P || typeof P.rappelsNotif !== 'function') return;
    var p = P.rappelsNotif();
    if (p && typeof p.then === 'function') p.then(function(v){ if (v === true || v === false) { NOTIF = v; outils(); } });
  }

  /* ── LA BARRE D OUTILS ──────────────────────────────────────────────────── */
  function outils(){
    if (!D) { elOutils.innerHTML = ''; return; }
    var h = '';
    if (NOTIF !== null) {
      h += '<label class="notif" for="r-notif" title="${T("Une notification de bureau par rappel dû, une fois par jour ; un clic ouvre le module du rappel.")}">'
        + '<input type="checkbox" id="r-notif"' + (NOTIF ? ' checked' : '') + '> ${T("Notifications de bureau")}</label>';
    }
    if (PA) h += '<button type="button" class="prim" data-act="nouveau">${T("+ Nouveau rappel")}</button>';
    elOutils.innerHTML = h;
  }

  /* ── LES TUILES ─────────────────────────────────────────────────────────── */
  function compte(e){ return ((D && D.rappels) || []).filter(function(r){ return r.etat === e; }).length; }
  /* Sous chaque chiffre : les rappels qu il compte, par leur titre (sinon, ce que le chiffre veut dire). */
  function nomsDe(e){
    return ((D && D.rappels) || []).filter(function(r){ return r.etat === e; })
      .map(function(r){ return szTd(r.titre); }).join(', ');
  }
  function kpi(ton, lbl, n, sous){
    return '<div class="cx-kpi' + (ton ? ' ' + ton : '') + '"><span>' + lbl + '</span><b>' + n + '</b>'
      + '<small title="' + esc(sous) + '">' + esc(sous) + '</small></div>';
  }
  function tuiles(){
    var actifs = ((D && D.rappels) || []).filter(function(r){ return r.actif; }).length;
    return szTuiles('<div class="cx-kpis">'
      + kpi(compte('retard') ? 'err' : '', '${T("En retard")}', compte('retard'), nomsDe('retard') || '${T("échéance passée")}')
      + kpi(compte('aujourdhui') ? 'att' : '', '${T("Aujourd’hui")}', compte('aujourdhui'), nomsDe('aujourdhui') || '${T("à faire dans la journée")}')
      + kpi('', '${T("Cette semaine")}', compte('bientot'), nomsDe('bientot') || '${T("dans les 7 prochains jours")}')
      + kpi('ok', '${T("Actifs")}', actifs, '${T("rappels en service")}')
      + '</div>');
  }

  /* ══ LA LISTE, PAR ÉCHÉANCE ═══════════════════════════════════════════════ */
  var GROUPES = [
    ['retard',     '${T("En retard")}'],
    ['aujourdhui', '${T("Aujourd’hui")}'],
    ['bientot',    '${T("Cette semaine")}'],
    ['avenir',     '${T("À venir")}'],
    ['termine',    '${T("Terminés")}']
  ];
  /* La liste a plat : un en-tete par groupe, puis ses lignes (sauf groupe replie). */
  function aplat(){
    var L = (D.rappels || []), out = [];
    GROUPES.forEach(function(g){
      var dans = L.filter(function(r){ return r.etat === g[0]; });
      if (!dans.length) return;
      out.push({ grp: g[0], nom: g[1], n: dans.length });
      if (!REPLIS[g[0]]) dans.forEach(function(r){ out.push({ r: r, grp: g[0] }); });
    });
    return out;
  }
  function nav(nbp){
    if (nbp <= 1) return '';
    return '<span class="pages">'
      + '<button type="button" class="mini pgf" data-pg="-1" title="${T("Page précédente")}" aria-label="${T("Page précédente")}"' + (PG <= 0 ? ' disabled' : '') + '>‹</button>'
      + '<span>${T("Page")} ' + (PG + 1) + ' / ' + nbp + '</span>'
      + '<button type="button" class="mini pgf" data-pg="1" title="${T("Page suivante")}" aria-label="${T("Page suivante")}"' + (PG >= nbp - 1 ? ' disabled' : '') + '>›</button></span>';
  }
  function enTete(it){
    return '<div class="grp ' + it.grp + '">' + esc(it.nom) + ' <span class="nb">' + it.n + '</span>'
      + (it.grp === 'termine' ? '<button type="button" class="mini" data-repli="termine">'
          + (REPLIS.termine ? '${T("Afficher")}' : '${T("Replier")}') + '</button>' : '') + '</div>';
  }
  function ligne(r){
    var mod = nomModule(r.module);
    var actif = r.etat !== 'termine';
    var h = '<div class="rp ' + r.etat + (FORM && FORM.id === r.id ? ' sel' : '') + '" data-rap="' + esc(r.id) + '"'
      + (PM ? ' title="${T("Double-cliquez pour modifier")}"' : '') + '>'
      + '<div style="min-width:0"><div class="t">' + esc(szTd(r.titre)) + '</div>'
      + '<span class="cx-l2">'
      + (actif && r.prochaine ? esc(szJour(r.prochaine)) + ' · ' : '')
      + esc(nomFreq(r.frequence))
      + (r.courriel ? ' · ${T("courriel")}' : '')
      + (mod ? ' · ${T("ouvre")} ' + esc(mod) : '') + '</span></div>'
      + '<span class="rf-pill' + ({ retard: ' rouge', aujourdhui: ' ambre', bientot: ' bleu', termine: ' vert' }[r.etat] || '') + '">' + esc(relatif(r)) + '</span>'
      + '<div class="act">'
      + (actif && PM ? '<button type="button" class="mini" data-rep="' + esc(r.id) + '" aria-expanded="' + (REPORT === r.id ? 'true' : 'false') + '">${T("Reporter")} ▾</button>'
          + '<button type="button" class="mini fait" data-fait="' + esc(r.id) + '" title="${T("Fait : le rappel passe à sa prochaine échéance.")}">✓ ${T("Fait")}</button>' : '')
      + (r.module ? '<button type="button" class="mini" data-ouvrir="' + esc(r.module) + '" title="${T("Ouvrir")} ' + esc(mod) + '">${T("Ouvrir")}</button>' : '')
      + (PM ? '<button type="button" class="mini" data-mod="' + esc(r.id) + '">${T("Modifier")}</button>' : '')
      + (PS ? '<button type="button" class="mini danger" data-sup="' + esc(r.id) + '" aria-label="${T("Supprimer ce rappel")}">✕</button>' : '')
      + '</div>';
    if (REPORT === r.id) {
      h += '<div class="rep"><label>${T("Reporter de")}</label>'
        + '<button type="button" class="mini" data-repj="1">${T("+1 jour")}</button>'
        + '<button type="button" class="mini" data-repj="3">${T("+3 jours")}</button>'
        + '<button type="button" class="mini" data-repj="7">${T("+7 jours")}</button>'
        + '<label for="r-repdate">${T("ou au")}</label><input type="date" id="r-repdate" value="' + esc(REPDATE) + '">'
        + '<button type="button" class="mini prim" id="r-repok">${T("Reporter")}</button>'
        + '<button type="button" class="mini" id="r-repnon">${T("Annuler")}</button></div>';
    }
    return h + '</div>';
  }
  function liste(){
    var L = (D.rappels || []);
    if (!L.length) {
      var libres = (D.modeles || []).filter(function(m){ return !m.deja; }).length;
      return '<div class="cx-carte appel"><strong>${T("Aucun rappel pour l’instant")}</strong>'
        + '<div class="aide">${T("Un rappel revient à la date voulue, dit ce qu’il faut faire et ouvre le bon module : saisir les dépenses de la semaine, remettre la TPS/TVQ, payer un acompte… Commencez par les rappels proposés, ajustables ensuite.")}</div>'
        + '<div class="boutons">'
        + (PA && libres ? '<button type="button" class="prim" data-act="tout">${T("Ajouter les")} ' + libres + ' ${T("rappels proposés")}</button>' : '')
        + (PA ? '<button type="button" data-act="nouveau">${T("+ Créer mon propre rappel")}</button>' : '')
        + '</div></div>';
    }
    var flat = aplat();
    if (!(BU > 0)) BU = Math.max(4, Math.floor(((corps.clientHeight || 640) - 170) / 49));
    var nbp = Math.max(1, Math.ceil(flat.length / BU));
    if (PG >= nbp) PG = nbp - 1;
    if (PG < 0) PG = 0;
    var vue = flat.slice(PG * BU, (PG + 1) * BU);
    /* Un en-tete seul en bas de page ne dit rien : il passe a la page suivante,
       qui le redit en tete (voir plus bas). */
    var suite = flat[(PG + 1) * BU];
    if (vue.length > 1 && !vue[vue.length - 1].r && suite && suite.r) vue.pop();
    var h = '<div class="cx-carte liste"><h2>${T("Mes rappels")} <span class="cx-sub">' + L.length + ' ' + szPl(L.length, '${T("rappel")}', '${T("rappels")}') + '</span>' + nav(nbp) + '</h2>';
    /* Une page qui commence au milieu d un groupe redit son en-tete. */
    if (vue.length && vue[0].r) {
      var g = null; flat.forEach(function(x){ if (!x.r && x.grp === vue[0].grp) g = x; });
      if (g) h += enTete(g);
    }
    h += vue.map(function(it){ return it.r ? ligne(it.r) : enTete(it); }).join('');
    return h + '</div>';
  }

  /* ══ À DROITE : LES RAPPELS PROPOSÉS, OU LE FORMULAIRE ═════════════════════ */
  function proposes(){
    var M = (D.modeles || []);
    if (!M.length) return '';
    return '<div class="cx-carte sz-pagee"><h2>${T("Rappels proposés")}</h2><div data-pages="rappels-proposes">'
      + M.map(function(m){
          var info = nomFreq(m.frequence) + (m.prochaine ? ' · ${T("prochaine :")} ' + szJour(m.prochaine) : '') + (m.module ? ' · ' + nomModule(m.module) : '');
          return '<div class="mdl"><div style="min-width:0"><div class="t">' + esc(szTd(m.titre)) + '</div>'
            + '<div class="n" title="' + esc(szTd(m.note)) + '">' + esc(info) + '</div></div>'
            + (m.deja ? '<span class="rf-pill vert">${T("déjà ajouté")}</span>'
                : (PA ? '<button type="button" class="mini" data-modele="' + esc(m.cle) + '">${T("Ajouter")}</button>' : ''))
            + '</div>';
        }).join('') + '</div>'
      + '<div class="aide" style="margin-top:.4rem">${T("Dates de l’ARC et de Revenu Québec pour un travailleur autonome qui remet ses taxes au trimestre. Chaque rappel ajouté se modifie ensuite.")}</div>'
      + '</div>';
  }
  function vierge(){
    var d = new Date();
    var iso = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    return { id: '', titre: '', note: '', frequence: 'mensuel', prochaine: (D && D.aujourdhui) || iso, jour: '', module: '', courriel: false, actif: true, historique: [] };
  }
  function depuis(r){
    return { id: r.id, titre: r.titre || '', note: r.note || '', frequence: r.frequence || 'unique', prochaine: r.prochaine || '',
      jour: r.jour != null ? String(r.jour) : '', module: r.module || '', courriel: !!r.courriel, actif: r.actif !== false,
      historique: r.historique || [] };
  }
  function avecJour(f){ return f === 'mensuel' || f === 'trimestriel' || f === 'annuel'; }
  function formulaire(){
    var f = FORM, modif = !!f.id;
    var h = '<div class="cx-carte" id="f-rap"><h2>' + (modif ? '${T("Modifier le rappel")}' : '${T("Nouveau rappel")}') + '</h2><div class="form2">'
      + '<div class="champ large"><label for="r-titre">${T("Titre (obligatoire)")}</label>'
      + '<input type="text" id="r-titre" maxlength="100" value="' + esc(f.titre) + '" placeholder="${T("Ex. : Saisir les reçus d’essence")}"></div>'
      + '<div class="champ large"><label for="r-note">${T("Note (facultative)")}</label>'
      + '<textarea id="r-note" rows="2" maxlength="400" placeholder="${T("Ce qu’il faut faire, où trouver les pièces…")}">' + esc(f.note) + '</textarea></div>'
      + '<div class="champ"><label for="r-freq">${T("Fréquence")}</label><select id="r-freq">'
      + (D.frequences || []).map(function(x){ return '<option value="' + esc(x.cle) + '"' + (f.frequence === x.cle ? ' selected' : '') + '>' + esc(szTd(x.nom)) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="champ"><label for="r-date">${T("Prochaine échéance")}</label><input type="date" id="r-date" value="' + esc(f.prochaine) + '"></div>'
      + (avecJour(f.frequence)
          ? '<div class="champ"><label for="r-jour">${T("Jour du mois")}</label><input type="number" min="1" max="31" step="1" id="r-jour" value="' + esc(f.jour) + '" placeholder="' + esc(String(f.prochaine || '').slice(8, 10)) + '"'
            + ' title="${T("Gardé d’une échéance à l’autre : un rappel du 31 tombe le 30 en avril, puis revient au 31.")}"></div>'
          : '')
      + '<div class="champ' + (avecJour(f.frequence) ? '' : ' large') + '"><label for="r-module">${T("Module à ouvrir")}</label><select id="r-module">'
      + (D.modules || []).map(function(x){ return '<option value="' + esc(x.cle) + '"' + (f.module === x.cle ? ' selected' : '') + '>' + esc(szTd(x.nom)) + '</option>'; }).join('')
      + '</select></div>'
      + '<label class="case large" for="r-courriel"><input type="checkbox" id="r-courriel"' + (f.courriel ? ' checked' : '') + '> ${T("M’envoyer aussi un courriel")}</label>'
      + '<div class="aide large">${T("Le courriel part avec la tâche quotidienne du serveur (cron-rappels.php) : elle doit être activée chez l’hébergeur. La notification de bureau, elle, ne demande rien.")}</div>'
      + (modif ? '<label class="case large" for="r-actif"><input type="checkbox" id="r-actif"' + (f.actif ? ' checked' : '') + '> ${T("Actif (décoché : le rappel est terminé)")}</label>' : '')
      + '</div>';
    var hist = (f.historique || []).slice(0, 3);
    if (modif && hist.length) {
      h += '<div class="hist"><h2>${T("Historique")}</h2>' + hist.map(function(x){
        return '<div class="cx-etat"><span>' + (x.geste === 'reporte'
          ? '${T("Reporté au")} ' + esc(szJour(x.vers))
          : '${T("Fait pour l’échéance du")} ' + esc(szJour(x.echeance)))
          + (x.par ? ' · ' + esc(x.par) : '') + '</span><span class="cx-sub">' + esc(szQuand(x.le)) + '</span></div>';
      }).join('') + '</div>';
    }
    return h + '<div class="boutons"><button type="button" id="r-annuler">${T("Annuler")}</button>'
      + '<button type="button" class="prim" id="r-ok">' + (modif ? '${T("Enregistrer")}' : '${T("+ Créer le rappel")}') + '</button></div></div>';
  }

  /* ── LE DESSIN ──────────────────────────────────────────────────────────── */
  function lecture(){
    if (PA || PM || PS) return '';
    /* ⚠ L enveloppe garde class="avis" : le cas « lecture seule » de verifier-fenetres l exige. */
    return '<div class="avis"><span class="cx-averti" title="${T("Votre rôle permet de consulter les rappels, pas de les modifier.")}"><b>${T("Lecture seule.")}</b>'
      + '<span>${T("Votre rôle permet de consulter les rappels, pas de les modifier.")}</span></span></div>';
  }
  function rendu(){
    return lecture() + tuiles() + '<div class="duo"><div>' + liste() + '</div><div>'
      + (FORM ? formulaire() : proposes()) + '</div></div>';
  }
  function dessiner(){
    outils();
    if (!D) return;
    var dus = compte('retard') + compte('aujourdhui');
    elSous.textContent = '${T("Aujourd’hui :")} ' + szJour(D.aujourdhui) + ' · ' + (dus ? dus + ' ' + szPl(dus, '${T("rappel à faire")}', '${T("rappels à faire")}') : '${T("Rien à faire aujourd’hui")}');
    corps.innerHTML = rendu();
    /* LE BUDGET SE MESURE : une ligne de moins tant que la page deborde. */
    var tours = 0;
    while (corps.scrollHeight > corps.clientHeight + 1 && BU > 2 && tours < 60) {
      BU--; tours++;
      corps.innerHTML = rendu();
    }
  }

  /* ── LA SAISIE suit la frappe ─────────────────────────────────────────── */
  function lu(id){ var e = document.getElementById(id); return (e && typeof e.value === 'string') ? e.value : null; }
  function coche(id){ var e = document.getElementById(id); return (e && typeof e.checked === 'boolean') ? e.checked : null; }
  function ramasser(){
    var v;
    if (FORM && document.getElementById('r-ok')) {
      [['r-titre', 'titre'], ['r-note', 'note'], ['r-freq', 'frequence'], ['r-date', 'prochaine'],
       ['r-jour', 'jour'], ['r-module', 'module']].forEach(function(p){ v = lu(p[0]); if (v != null) FORM[p[1]] = v; });
      v = coche('r-courriel'); if (v != null) FORM.courriel = v;
      v = coche('r-actif'); if (v != null) FORM.actif = v;
    }
    v = lu('r-repdate'); if (v != null) REPDATE = v;
  }

  /* ── LES GESTES ─────────────────────────────────────────────────────────── */
  function apres(r, geste, bon){
    if (!r || !r.ok) {
      szDire(expliquer(r, geste), 'err');
      if (r && r.motif === 'introuvable') charger();
      return false;
    }
    szDire(bon, 'bon');
    charger();
    return true;
  }
  function enregistrer(b){
    ramasser();
    var f = FORM; if (!f) return;
    if (!String(f.titre || '').trim()) { szDire(MOTIFS.titre, 'err'); var t = document.getElementById('r-titre'); if (t) t.focus(); return; }
    if (b) b.disabled = true;
    szDire('${T("Enregistrement…")}');
    appeler('rappels:ecrire', [{ id: f.id || undefined, titre: f.titre, note: f.note, frequence: f.frequence,
      prochaine: f.prochaine, jour: avecJour(f.frequence) ? (parseInt(f.jour, 10) || '') : '', module: f.module,
      courriel: !!f.courriel, actif: f.actif !== false }]).then(function(r){
      if (b) b.disabled = false;
      if (apres(r, 'ecrire', f.id ? '${T("Rappel enregistré.")}' : '${T("Rappel créé.")}')) FORM = null;
    });
  }
  function fait(id){
    var r = rappel(id);
    appeler('rappels:fait', [id]).then(function(x){
      apres(x, 'fait', r && r.frequence === 'unique' ? '${T("C’est fait : le rappel est terminé.")}' : '${T("C’est fait : le rappel revient à sa prochaine échéance.")}');
    });
  }
  function reporter(id, j, date){
    appeler('rappels:reporter', [id, j || null, date || '']).then(function(x){
      if (apres(x, 'reporter', '${T("Rappel reporté.")}')) { REPORT = ''; REPDATE = ''; }
    });
  }
  function ajouterModele(cle, b){
    if (b) b.disabled = true;
    return appeler('rappels:modele', [cle]).then(function(x){
      if (b) b.disabled = false;
      return x;
    });
  }
  /* 2026-10-15 : la confirmation se fait dans une boite a part (szConfirmer),
     plus sur le bouton qui changeait de texte. */
  function armer(b, cle, faire, o){
    if (ARME) desarmer();
    szConfirmer(o || {}).then(function(ok){ if (ok) faire(); });
  }
  function desarmer(){
    if (!ARME) return;
    clearTimeout(ARME.t);
    if (ARME.b) { ARME.b.textContent = ARME.b.getAttribute('data-texte') || '✕'; ARME.b.classList.remove('aconf'); }
    ARME = null;
  }

  document.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var a = t.closest('[data-act]');
    if (a) {
      var act = a.getAttribute('data-act');
      if (act === 'nouveau' && PA) { FORM = vierge(); REPORT = ''; dessiner(); var ti = document.getElementById('r-titre'); if (ti) ti.focus(); return; }
      if (act === 'tout' && PA) {
        var libres = (D.modeles || []).filter(function(m){ return !m.deja; });
        a.disabled = true; szDire('${T("Ajout des rappels proposés…")}');
        var n = 0, faute = null;
        libres.reduce(function(pr, m){
          return pr.then(function(){ return ajouterModele(m.cle).then(function(x){ if (x && x.ok) n++; else if (x && x.motif !== 'deja') faute = x; }); });
        }, Promise.resolve()).then(function(){
          if (faute) szDire(expliquer(faute, 'modele'), 'err');
          else szDire(n + ' ' + szPl(n, '${T("rappel ajouté.")}', '${T("rappels ajoutés.")}'), 'bon');
          charger();
        });
        return;
      }
    }
    var pg = t.closest('[data-pg]');
    if (pg) { PG += parseInt(pg.getAttribute('data-pg'), 10) || 0; desarmer(); dessiner(); return; }
    var rp = t.closest('[data-repli]');
    if (rp) { var g = rp.getAttribute('data-repli'); REPLIS[g] = !REPLIS[g]; dessiner(); return; }
    var fa = t.closest('[data-fait]');
    if (fa) { fa.disabled = true; fait(fa.getAttribute('data-fait')); return; }
    var re = t.closest('[data-rep]');
    if (re) { var id = re.getAttribute('data-rep'); REPORT = (REPORT === id) ? '' : id; REPDATE = ''; dessiner(); return; }
    var rj = t.closest('[data-repj]');
    if (rj) { reporter(REPORT, parseInt(rj.getAttribute('data-repj'), 10), ''); return; }
    if (t.id === 'r-repok') {
      ramasser();
      if (!REPDATE) { szDire('${T("Choisissez une date, ou un des délais proposés.")}', 'att'); return; }
      reporter(REPORT, null, REPDATE); return;
    }
    if (t.id === 'r-repnon') { REPORT = ''; REPDATE = ''; dessiner(); return; }
    var ou = t.closest('[data-ouvrir]');
    if (ou) {
      if (P && P.ouvrirModule) { P.ouvrirModule(ou.getAttribute('data-ouvrir')); szDire('${T("Ouverture du module…")}'); }
      return;
    }
    var mo = t.closest('[data-mod]');
    if (mo) { var r = rappel(mo.getAttribute('data-mod')); if (r) { FORM = depuis(r); REPORT = ''; dessiner(); } return; }
    var sp = t.closest('[data-sup]');
    if (sp) {
      var ids = sp.getAttribute('data-sup');
      var rS = rappel(ids);
      armer(sp, ids, function(){
        appeler('rappels:supprimer', [ids]).then(function(x){
          if (apres(x, 'supprimer', '${T("Rappel supprimé.")}') && FORM && FORM.id === ids) FORM = null;
        });
      }, { danger: true, titre: '${T("Supprimer le rappel")}',
        texte: '${T("Le rappel")}' + ' « ' + (rS ? szTd(rS.titre) : '') + ' » '
          + '${T("sera supprimé définitivement de votre liste. Cette action est irréversible.")}',
        oui: '${T("Supprimer le rappel")}' });
      return;
    }
    var md = t.closest('[data-modele]');
    if (md) {
      ajouterModele(md.getAttribute('data-modele'), md).then(function(x){ apres(x, 'modele', '${T("Rappel ajouté à votre liste.")}'); });
      return;
    }
    if (t.id === 'r-ok') { enregistrer(t); return; }
    if (t.id === 'r-annuler') { FORM = null; dessiner(); return; }
    /* Un clic sur une ligne la MARQUE, sans redessiner : le double-clic doit
       trouver la meme ligne sous le pointeur. */
    var ln = t.closest('[data-rap]');
    if (ln && !t.closest('button') && !t.closest('input')) {
      Array.prototype.forEach.call(corps.querySelectorAll('.rp.sel') || [], function(x){ if (x !== ln) x.classList.remove('sel'); });
      ln.classList.add('sel');
    }
  });
  document.addEventListener('dblclick', function(ev){
    var t = ev.target;
    if (!t || !t.closest || t.closest('button') || t.closest('input')) return;
    var ln = t.closest('[data-rap]');
    if (ln && PM) { var r = rappel(ln.getAttribute('data-rap')); if (r) { FORM = depuis(r); REPORT = ''; dessiner(); } }
  });
  document.addEventListener('input', function(){ ramasser(); });
  document.addEventListener('change', function(ev){
    var t = ev.target;
    ramasser();
    if (t && t.id === 'r-freq') { dessiner(); var e = document.getElementById('r-freq'); if (e) e.focus(); return; }
    if (t && t.id === 'r-notif' && P && typeof P.rappelsNotif === 'function') {
      var v = !!t.checked;
      var p = P.rappelsNotif(v);
      if (p && typeof p.then === 'function') p.then(function(x){
        if (x === true || x === false) NOTIF = x;
        szDire(NOTIF ? '${T("Notifications de rappels activées.")}' : '${T("Notifications de rappels coupées.")}', 'bon');
        outils();
      });
    }
  });
  document.addEventListener('keydown', function(ev){
    var t = ev.target;
    if (ev.key === 'Enter' && t && t.closest && t.tagName !== 'TEXTAREA' && t.tagName !== 'BUTTON') {
      if (t.closest('#f-rap')) { ev.preventDefault(); enregistrer(document.getElementById('r-ok')); return; }
      if (t.id === 'r-repdate') { ev.preventDefault(); ramasser(); if (REPDATE) reporter(REPORT, null, REPDATE); return; }
    }
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    if (ARME) { desarmer(); return; }
    if (REPORT) { REPORT = ''; dessiner(); return; }
    if (FORM) { FORM = null; dessiner(); return; }
    if (P && P.fermer) P.fermer();
  });
  window.addEventListener('resize', function(){
    clearTimeout(window._rpT);
    window._rpT = setTimeout(function(){ BU = 0; if (D) dessiner(); }, 180);
  });
  /* ⚠ JAMAIS PENDANT UNE SAISIE : recharger remettrait le formulaire a zero. */
  function rechargerSiLibre(){ if (!OCCUPE && !FORM && !REPORT) charger(); }
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

  lireNotif();
  charger();
})();
</script></body></html>`;
}

module.exports = { pageRappels };
