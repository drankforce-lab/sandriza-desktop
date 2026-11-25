'use strict';

/*
 * FENÊTRE « RAMASSAGES ET RAPPORT » — NATIVE
 * =============================================================================
 * Deux onglets d'expédition :
 *  · RAMASSAGES — les ramassages planifiés (transporteur, date, colis,
 *    confirmation, commandes), l'annulation AUPRÈS DU TRANSPORTEUR (le cœur
 *    Admin._ramassageAnnulerCoeur vit dans le site, la fenêtre ne porte que
 *    l'identifiant), et « Planifier » qui renvoie à l'assistant du site (le
 *    flux engage les transporteurs — dates, poids, XML — et reste là-bas).
 *  · RAPPORT — les sommes par transporteur et les 60 dernières expéditions
 *    (le cœur Admin._rapportTransporteursDonnees, le même que la fenêtre
 *    modale du site).
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('ramassages');

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
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
/* ── La refonte de l Inventaire (2026-09-25) ── */
.tuiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem;flex:0 0 auto;margin-bottom:.6rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);min-width:0}
.tuile .sub{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rf-pill.mono{font-family:ui-monospace,monospace;font-size:.7rem}
.rf-pill.mono::before{display:none}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:700}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .45rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.09em;color:var(--tx2);font-weight:700}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.3rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tfoot td{padding:.34rem .4rem;border-top:2px solid var(--v16);font-weight:800}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:var(--tx2)}
.mono{font-family:'Courier New',monospace;font-size:.78rem}
.pill{display:inline-block;font-size:.6875rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap;
  margin-right:.2rem}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.pill.info{background:rgba(59,130,246,.16);color:var(--tx-bleu)}
.ligne{padding:.55rem .7rem;background:var(--f-carte);border:1px solid var(--v07);
  border-radius:11px}
/* ⚠ UN RAMASSAGE ANNULÉ RESTE À LIRE. À .55, sa date, son nombre de colis et
   sa pastille « Annulé » tombaient sous 2.9 de contraste : on voyait qu'il y
   avait quelque chose, sans pouvoir lire QUOI. C'est l'inverse du besoin —
   on ouvre cet écran pour savoir ce qui a été annulé, et quand.
   ⚠ .95 : sa pastille rouge etait deja limite a pleine opacite, donc le peu
   qu'on retire compte double. Valeur MESUREE au banc. */
.ligne.annule{opacity:.95}
.ligne .haut{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}
.ligne .dt{font-size:.72rem;color:var(--tx2);margin-top:.2rem}
input[type=number],input[type=text]{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem;width:100%}
input:focus{outline:none;border-color:var(--or)}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:var(--f-carte2);border:1px solid var(--v14);border-radius:13px;
  max-width:34rem;width:100%;max-height:84vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .5rem;font:700 .98rem/1.3 Georgia,serif}
.boite .grp{border:1px solid var(--v10);border-radius:9px;padding:.5rem .6rem;margin:.4rem 0}
.boite .champs{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.5rem;margin-top:.6rem}
.boite .champs .l{font-size:.6875rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);margin-bottom:.2rem}
.boite .pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.7rem}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Ramassages et rapport ». */
function pageRamassages() {
  return `${TETE()}
<title>${T("Ramassages et rapport — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.orders}</span><h1>${T("Ramassages et rapport")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps plein" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES()}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var ONGLET = 'ramassages';   // ramassages | rapport
  var RAM = null;              // lignes de ramassages:liste
  var RAP = null;              // donnees d expeditions:rapport
  var ANNULER_ARME = '';       // id du ramassage dont Annuler attend confirmation
  var PLAN = null;             // le formulaire de planification (ramassages:preparer)

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl, ci){ szDire(t, cl, ci); }
  function fmt(n){
    return szArgent(n);   /* voir szArgent (socle) : le repli aussi place le symbole */
  }
  function fmtDate(d){
    if (!d) return '—';
    try { return (String(d).length === 10 && String(d).charAt(4) === '-' ? new Date(+String(d).slice(0, 4), +String(d).slice(5, 7) - 1, +String(d).slice(8, 10)) : new Date(d)).toLocaleDateString('${LIEU()}', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return String(d); }
  }

  var MOTIFS = {
  maj_en_cours: '${T("Une mise à jour s’installe : cette opération est suspendue jusqu’au redémarrage de l’application.")}',
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux expéditions.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    annulation:         '${T("L’annulation a échoué auprès du transporteur.")}',
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
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  /* ══ LA REFONTE DE L INVENTAIRE, APPLIQUEE AUX RAMASSAGES (2026-09-25) ════
     Tuiles sur la liste ENTIERE, barre sur une ligne (onglets en pastilles,
     le geste a droite), pastilles a point. Crochets gardes : data-onglet,
     #rm-planifier, data-annuler, #rm-exporter, la boite de planification. */
  function barre(){
    return '<div class="carte" style="margin-bottom:.6rem"><div class="rf-tb">'
      + '<button class="rf-jet' + (ONGLET === 'ramassages' ? ' on' : '') + '" data-onglet="ramassages">${T("Ramassages")}</button>'
      + '<button class="rf-jet' + (ONGLET === 'rapport' ? ' on' : '') + '" data-onglet="rapport">${T("Rapport transporteurs")}</button>'
      + (ONGLET === 'ramassages'
          ? '<span class="rf-droite"><button class="prim" id="rm-planifier" style="height:2.4rem;padding:0 .9rem" '
            + 'title="${T("Choisir les colis, la date et le poids du ramassage")}">'
            + '${T("Planifier un ramassage")}</button></span>'
          : '')
      + '</div></div>';
  }
  function tuilesRamassages(rows){
    var act = rows.filter(function(r){ return !r.annule; });
    var colis = act.reduce(function(s, r){ return s + (Number(r.colis) || 0); }, 0);
    var tu = function(lib, val, sous){
      return '<div class="tuile"><div class="lbl">' + lib + '</div><div class="val">' + val + '</div><div class="sub">' + sous + '</div></div>';
    };
    return szTuiles('<div class="tuiles">'
      + tu('${T("Planifiés")}', act.length, '${T("ramassages à venir ou faits")}')
      + tu('${T("Colis")}', colis, '${T("dans les ramassages planifiés")}')
      + tu('${T("Annulés")}', rows.length - act.length, '${T("gardés au registre")}')
      + '</div>');
  }

  function dessinerRamassages(){
    var rows = RAM || [];
    var h = (rows.length ? tuilesRamassages(rows) : '') + barre();
    if (!rows.length) {
      h += '<div class="vide">${T("Aucun ramassage planifié.")}</div>';
    } else {
      /* ⚠ PLEINE HAUTEUR (2026-09-19) : lignes riches, pas de carte — la zone
         defilante est fille du CORPS. La boite de planification est un voile
         en position:fixed, elle flotte et n est donc pas coupee. */
      // 2026-10-12 : plus de defilement, la liste est en PAGES mesurees (JS_PAGES du socle).
      h += '<div class="liste" data-pages="ramassages">' + rows.map(function(r){
        var etat = r.annule ? '<span class="rf-pill rouge">${T("Annulé")}</span>' : '<span class="rf-pill vert">${T("Planifié")}</span>';
        return '<div class="ligne' + (r.annule ? ' annule' : '') + '">'
          + '<div class="haut">'
          + '<span>' + r.logo + '</span><span class="rf-nom">' + esc(r.transporteur) + '</span>'
          + '<span class="dt"><span class="ic" aria-hidden="true">📅</span> ' + esc(szQuand(r.date)) + '</span>'
          + '<span class="rf-pill">' + r.colis + '${T(" colis")}</span>'
          + etat
          + (!r.annule
              ? '<button class="mini danger" style="margin-left:auto" data-annuler="' + esc(r.id) + '">'
                + '${T("Annuler")}</button>'
              : '')
          + '</div>'
          + '<div class="dt">${T("Confirmation :")} <span class="mono">' + esc(r.confirmation || '—') + '</span>'
          + (r.par ? ' ${T("· planifié par")} ' + esc(r.par) : '')
          + (r.annule && r.annulePar ? ' ${T("· annulé par")} ' + esc(r.annulePar) : '') + '</div>'
          + (r.commandes.length
              ? '<div class="dt">' + r.commandes.map(function(n){
                  return '<span class="rf-pill mono">' + esc(n) + '</span>'; }).join(' ') + '</div>'
              : '')
          + '</div>';
      }).join('') + '</div>';
      /* Le pied ferme la liste et porte l export (2026-09-19). ⚠ Il se pose
         AVANT la boite de planification, jamais apres : il appartient a la
         liste. */
      h += szPied(
        rows.length + ' ' + (rows.length > 1 ? '${T("ramassages")}' : '${T("ramassage")}'),
        '<button class="mini" id="rm-exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>');
    }
    if (PLAN) h += boitePlan();
    corps.innerHTML = h;

    /* ⚠ LES NUMEROS DE COMMANDE PARTENT DANS UNE COLONNE, separes par un
       point-virgule. A l ecran ce sont des pastilles cote a cote ; dans un
       fichier il faut qu ils tiennent dans UNE cellule sans casser le CSV —
       d ou le point-virgule et non la virgule, qui est notre separateur. */
    var exrm = document.getElementById('rm-exporter');
    if (exrm) exrm.onclick = function(){
      var lignes = (RAM || []).map(function(r){
        return [r.date || '', r.transporteur || '', r.colis,
          r.annule ? '${T("Annulé")}' : '${T("Planifié")}',
          r.confirmation || '', r.par || '', r.annulePar || '',
          (r.commandes || []).join(' ; ')];
      });
      if (!lignes.length) { dire('${T("Rien à exporter.")}', 'att'); return; }
      var csv = szCSV(['${T("Date")}', '${T("Transporteur")}', '${T("Colis")}',
        '${T("Statut")}', '${T("Confirmation")}', '${T("Planifié par")}',
        '${T("Annulé par")}', '${T("Commandes")}'], lignes);
      szExporter('ramassages-' + new Date().toISOString().slice(0, 10) + '.csv', csv,
        '${T("La liste des ramassages")}');
    };
  }

  function boitePlan(){
    var p = PLAN;
    var h = '<div class="voile" id="rm-voile"><div class="boite">'
      + '<h3><span class="ic">📦</span> ${T("Planifier les ramassages —")} ' + (p.total || 0) + '${T(" colis")}</h3>';
    if (!p.total) {
      h += '<div class="vide">${T("Aucun colis à ramasser pour l’instant.")}<br>'
        + '${T("Une commande doit être marquée Expédiée et avoir un numéro de suivi.")}</div>'
        + '<div class="pied-boite"><button id="rm-p-annuler">${T("Fermer")}</button></div></div></div>';
      return h;
    }
    h += '<div class="dt"><span class="ic" aria-hidden="true">📅</span>${T(" Prévu le ")}<strong>' + esc(szQuand(p.date)) + '</strong>${T(", entre 09 h et 17 h")}'
      + (p.adresse ? ' · ' + esc(p.adresse) : '') + '</div>';
    h += (p.groupes || []).map(function(g){
      return '<div class="grp"><div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">'
        + '<span>' + g.logo + '</span><span class="num">' + esc(g.nom) + '</span>'
        + '<span class="rf-pill">' + g.colis + '${T(" colis")}</span>'
        + (g.api ? '<span class="rf-pill vert">${T("API — demande automatique")}</span>'
                 : '<span class="rf-pill ambre">${T("à contacter manuellement")}</span>')
        + '</div><div class="dt">' + (g.commandes || []).map(function(n){
            return '<span class="rf-pill mono">' + esc(n) + '</span>'; }).join(' ') + '</div></div>';
    }).join('');
    h += '<div class="champs">'
      + '<div><div class="l">${T("Poids estimé par colis (kg)")}</div>'
      + '<input type="number" id="rm-p-poids" aria-label="${T("Poids estimé par colis en kilogrammes")}" value="0.5" min="0.05" step="0.05"></div>'
      + '<div><div class="l">${T("Endroit du ramassage")}</div>'
      + '<input type="text" id="rm-p-endroit" aria-label="${T("Endroit du ramassage")}" value="Porte principale"></div>'
      + '</div>'
      + '<div class="pied-boite"><button id="rm-p-annuler">${T("Annuler")}</button>'
      + '<button class="prim" id="rm-p-envoyer"><span class="ic">📨</span> ${T("Envoyer les demandes")}</button></div>'
      + '</div></div>';
    return h;
  }

  function dessinerRapport(){
    var h = barre();
    if (!RAP || !RAP.total) {
      h += '<div class="vide">${T("Aucune expédition enregistrée.")}</div>';
      corps.innerHTML = h;
      return;
    }
    h += '<div class="carte"><h2>${T("Par transporteur —")} ' + RAP.total + ' '
      + (RAP.total > 1 ? '${T("expéditions")}' : '${T("expédition")}') + '</h2>'
      + '<table><thead><tr><th>${T("Transporteur")}</th><th style="text-align:center">${T("Colis")}</th>'
      + '<th style="text-align:right">${T("Total frais")}</th><th style="text-align:right">${T("Moy. par colis")}</th></tr></thead><tbody>'
      + (RAP.transporteurs || []).map(function(t){
          return '<tr><td>' + t.logo + ' <span class="num">' + esc(t.nom) + '</span></td>'
            + '<td style="text-align:center;font-weight:700">' + t.colis + '</td>'
            + '<td style="text-align:right">' + esc(fmt(t.frais)) + '</td>'
            + '<td style="text-align:right" class="dt">' + esc(fmt(t.moyen)) + '</td></tr>';
        }).join('')
      + '</tbody><tfoot><tr><td>TOTAL</td><td style="text-align:center">' + RAP.total + '</td>'
      + '<td style="text-align:right">' + esc(fmt(RAP.totalFrais)) + '</td><td></td></tr></tfoot></table></div>';

    // Les expeditions en PAGES mesurees (JS_PAGES du socle) : la carte prend la hauteur qui reste.
    h += '<div class="carte plein sz-pagee"><h2>${T("Les 60 dernières expéditions")}</h2>'
      + '<div data-pages="ramassages-expeditions"><table><thead><tr><th>${T("Commande")}</th><th>${T("Date")}</th><th>${T("Transporteur")}</th>'
      + '<th>${T("Suivi")}</th><th style="text-align:right">${T("Frais")}</th><th>${T("Statut")}</th></tr></thead><tbody>'
      + (RAP.expeditions || []).map(function(o){
          return '<tr><td><span class="num">' + esc(o.numero) + '</span></td>'
            + '<td class="dt">' + esc(fmtDate(o.date)) + '</td>'
            + '<td>' + o.logo + ' ' + esc(o.transporteur) + '</td>'
            + '<td class="mono">' + esc(o.suivi || '—') + '</td>'
            + '<td style="text-align:right">' + esc(fmt(o.frais)) + '</td>'
            + '<td>' + (o.livree ? '<span class="rf-pill vert">${T("Livrée")}</span>' : '<span class="rf-pill bleu">${T("Expédiée")}</span>')
            + (o.ramasse ? ' <span class="rf-pill vert">${T("ramassé")}</span>' : '') + '</td></tr>';
        }).join('')
      + '</tbody></table></div></div>';
    corps.innerHTML = h;
  }

  function dessiner(){
    if (ONGLET === 'rapport') dessinerRapport();
    else dessinerRamassages();
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); ANNULER_ARME = ''; charger(); return; }
    var pl = t.closest('#rm-planifier');
    if (pl) {
      /* NATIF (1.59.1) : le formulaire s ouvre ICI — le renvoi a l assistant
         web contredisait la regle << plus rien au format web >> (releve du
         2026-08-09). */
      /* (2026-11-22) La planification a SA fenêtre ; une coquille sans le verbe garde la boîte d avant. */
      if (P && typeof P.ouvrirRamassagePlan === 'function') { P.ouvrirRamassagePlan(); return; }
      dire('${T("Lecture des colis prêts…")}');
      appeler('ramassages:preparer', []).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('');
        PLAN = r;
        dessiner();
      });
      return;
    }
    if (t.closest('#rm-p-annuler')) { PLAN = null; dessiner(); return; }
    var env = t.closest('#rm-p-envoyer');
    if (env) {
      var poids = parseFloat((document.getElementById('rm-p-poids') || {}).value) || 0.5;
      var endroit = ((document.getElementById('rm-p-endroit') || {}).value || '').trim();
      env.disabled = true;
      dire('${T("Demandes envoyées aux transporteurs…")}');
      appeler('ramassages:planifier', [{ poids: poids, endroit: endroit }]).then(function(r){
        if (!r.ok) {
          dire(r.motif === 'aucun_colis' ? '${T("Aucun colis à ramasser.")}' : expliquer(r), 'err');
          env.disabled = false;
          return;
        }
        dire('${T("Ramassage")} ' + r.date + ' — ' + r.total + ' ${T("colis")}'
          + ((r.parties || []).length ? ' · ' + r.parties.join(' · ') : ''), r.echec ? 'err' : 'bon');
        PLAN = null;
        charger();
      });
      return;
    }
    if (t.closest('.boite')) return;
    if (t.closest('#rm-voile')) return;   // le voile ne ferme plus (2026-10-07) : seulement Fermer
    var an = t.closest('[data-annuler]');
    if (an) {
      var id = an.getAttribute('data-annuler');
      /* ⚠ L ANNULATION EST UN GESTE AUPRES DU TRANSPORTEUR : elle se confirme dans
         une boite a part (szConfirmer, 2026-10-15 ; jamais de boite native). */
      if (ANNULER_ARME !== id) {
        var rA = (RAM || []).filter(function(x){ return x.id === id; })[0];
        szConfirmer({ danger: true, titre: '${T("Annuler le ramassage")}',
          texte: '${T("Le ramassage")}' + (rA ? ' ' + rA.transporteur + ' ${T("du")} ' + szQuand(rA.date) : '')
            + ' ${T("sera annulé auprès du transporteur. Pour le rétablir, il faudra en planifier un nouveau.")}',
          details: rA ? [['${T("Colis")}', String(rA.colis)], ['${T("Confirmation")}', rA.confirmation || '—']] : [],
          oui: '${T("Annuler le ramassage")}', non: '${T("Conserver")}' }).then(function(ok){ if (ok) { ANNULER_ARME = id; an.click(); } });
        return;
      }
      ANNULER_ARME = '';
      an.disabled = true;
      dire('${T("Annulation auprès du transporteur…")}');
      appeler('ramassages:annuler', [id]).then(function(r){
        if (r.ok) { dire('${T("Ramassage annulé.")}', 'bon'); charger(); }
        else { dire(expliquer(r), 'err'); dessiner(); }
      });
      return;
    }
  };

  /* (2026-10-25, audit) LA REPONSE EST RANGEE SELON L ONGLET DEMANDE, pas celui de l arrivee : un clic
     sur « Rapport transporteurs » pendant la lecture des ramassages rangeait la liste dans RAP. Si
     l onglet a change entre-temps, on relit celui qui est affiche. */
  var enCours = false, RELIRE = false;
  function charger(){
    if (enCours) { RELIRE = true; return; }
    enCours = true; RELIRE = false;
    var pour = ONGLET;
    var op = (pour === 'rapport') ? 'expeditions:rapport' : 'ramassages:liste';
    appeler(op, []).then(function(r){
      enCours = false;
      if (RELIRE || ONGLET !== pour) { if (r && r.ok) { if (pour === 'rapport') RAP = r; else RAM = r.lignes || []; } charger(); return; }
      if (!r || !r.ok) { vide('${T("Expéditions indisponibles")}', expliquer(r)); return; }
      if (pour === 'rapport') RAP = r;
      else RAM = r.lignes || [];
      dire('');
      dessiner();
    });
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : une expedition confirmee ou un
     statut qui change font relire l onglet courant. */
  window.szActualiser = function(){ if (!ANNULER_ARME && !PLAN) charger(); };
  window.szRevenir = function(){ ANNULER_ARME = ''; charger(); };

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
      if (PLAN) { PLAN = null; dessiner(); return; }
      P.fermer();
    }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
})();
</script>
</body></html>`;
}

/* ══ LA PLANIFICATION, DANS SA PROPRE FENÊTRE (2026-11-22, sa demande : « améliore la planification et fais de vraies
   fenêtres séparées pour la planification ») ═════════════════════════════════════════════════════════════════════
   QUAND (la date — prochain jour ouvrable par défaut, trois raccourcis —, la plage horaire), OÙ (l endroit, le poids par
   colis, l adresse d origine), QUOI (les colis par transporteur, à cocher un par un ou par transporteur). Le site
   recalcule tout à l envoi (Admin._ramassagePlanifierCoeur) : un choix ne peut pas ajouter un colis qui n est pas prêt.
   Envoyé : la fenêtre se ferme, la liste des Ramassages se relit (main.js, ramassages:planifier). */
const CSS_PLAN = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);background:var(--f-pied)}
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.pl{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(17rem,22rem) minmax(0,1fr);gap:.8rem;padding:.9rem 1rem;overflow:hidden}
.pl-g{display:flex;flex-direction:column;gap:.8rem;min-height:0}
.pl-c{background:var(--f-carte);border:1px solid var(--v08);border-radius:14px;padding:.85rem .95rem;display:flex;flex-direction:column;gap:.55rem;min-width:0}
.pl-c h2{margin:0;font-size:.74rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--tx2)}
.pl-c label{display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;font-weight:600;color:var(--tx2)}
.pl-c input,.pl-c select{font:inherit;font-size:.86rem;color:var(--tx);background:var(--f-champ);border:1px solid var(--v16);border-radius:9px;padding:.42rem .6rem;height:2.3rem}
.pl-2{display:grid;grid-template-columns:1fr 1fr;gap:.55rem}
.pl-jours{display:flex;gap:.35rem;flex-wrap:wrap}
.pl-jours button{font:inherit;font-size:.76rem;font-weight:600;border:1px solid var(--v16);background:var(--v05);color:var(--tx);border-radius:99px;padding:.3rem .7rem;cursor:pointer}
.pl-jours button.on{background:var(--f-pill);border-color:var(--or)}
.pl-org{font-size:.78rem;color:var(--tx2);line-height:1.4}
.pl-colis{min-height:0;overflow:hidden}
.pl-gr{border:1px solid var(--v08);border-radius:12px;padding:.6rem .7rem;display:flex;flex-direction:column;gap:.45rem}
.pl-gr.off{opacity:1;background:var(--v03)}
.pl-gr .t{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;font-size:.86rem}
.pl-gr .t b{font-weight:700}
.pl-cmd{display:grid;grid-template-columns:repeat(auto-fill,minmax(13.5rem,1fr));gap:.3rem .6rem}
.pl-cmd label{flex-direction:row;align-items:center;gap:.45rem;font-size:.8rem;font-weight:500;color:var(--tx);min-width:0}
.pl-cmd label span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.pl-cmd label small{color:var(--tx2)}
input[type=checkbox]{width:auto;height:auto;accent-color:var(--or)}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.6rem 1rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.pied .res{flex:1 1 auto;min-width:0;font-size:.84rem}
.pied .res b{font-variant-numeric:tabular-nums}
.pied button{font:inherit;font-size:.84rem;font-weight:600;border-radius:10px;padding:.5rem 1rem;cursor:pointer;border:1px solid var(--v16);background:var(--v05);color:var(--tx)}
.pied button.prim{background:var(--or);border-color:var(--or);color:var(--tx-sur-accent,#1a1208)}
.pied button:disabled{opacity:.5;cursor:default}
.msg{font-size:.79rem;color:var(--tx2)}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
.vide{margin:auto;text-align:center;color:var(--tx2);font-size:.9rem;line-height:1.6;padding:2rem}
@media (max-width:760px){.pl{grid-template-columns:1fr}}
`;
function pageRamassagePlan() {
  return `${TETE()}
<title>${T("Planifier un ramassage")}</title>
<style>${CSS_PLAN}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.orders}</span><h1>${T("Planifier un ramassage")}</h1></div>
<div class="pl" id="pl"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="res" id="res"></span><span class="msg" id="msg"></span>
  <button type="button" id="pl-annuler">${T("Annuler")}</button>
  <button type="button" class="prim" id="pl-envoyer" disabled>${T("Envoyer les demandes")}</button></div>
<script>
(function(){
  'use strict';
  var PP = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var zone = document.getElementById('pl');
  var D = null, CHOIX = {}, TR = {};
  var MOIS = ['${T("janvier")}', '${T("février")}', '${T("mars")}', '${T("avril")}', '${T("mai")}', '${T("juin")}', '${T("juillet")}', '${T("août")}', '${T("septembre")}', '${T("octobre")}', '${T("novembre")}', '${T("décembre")}'];
  var JOURS = ['${T("dim.")}', '${T("lun.")}', '${T("mar.")}', '${T("mer.")}', '${T("jeu.")}', '${T("ven.")}', '${T("sam.")}'];
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function appeler(op, args){
    var p; try { p = PP.appeler.apply(PP, [op].concat(args || [])); } catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; }).catch(function(){ return { ok: false, motif: 'echec' }; });
  }
  function versDate(iso){ var q = String(iso).split('-'); return new Date(+q[0], +q[1] - 1, +q[2]); }
  function iso(d){ return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function libJour(isoD){ var d = versDate(isoD); return JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()]; }
  function ouvrables(n){ var d = new Date(), l = []; while (l.length < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) l.push(iso(d)); } return l; }
  function heures(sel){ var h = ''; for (var m = 7 * 60; m <= 19 * 60; m += 30) { var t = ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); h += '<option' + (t === sel ? ' selected' : '') + '>' + t + '</option>'; } return h; }
  function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }

  function dessiner(){
    if (!D.total) {
      zone.innerHTML = '<div class="vide" style="grid-column:1/-1">${T("Aucun colis à ramasser pour l’instant.")}<br>${T("Une commande doit être marquée Expédiée et avoir un numéro de suivi.")}</div>';
      majResume(); return;
    }
    var jr = ouvrables(3);
    var h = '<div class="pl-g">'
      + '<section class="pl-c"><h2>${T("Quand")}</h2>'
      + '<div class="pl-jours" role="group" aria-label="${T("Jours ouvrables")}">' + jr.map(function(j){ return '<button type="button" data-jour="' + j + '">' + esc(libJour(j)) + '</button>'; }).join('') + '</div>'
      + '<label>${T("Date du ramassage")}<input type="date" id="pl-date" value="' + esc(D.date) + '" min="' + esc(D.aujourdhui || '') + '" max="' + esc(D.max || '') + '"></label>'
      + '<div class="pl-2"><label>${T("À partir de")}<select id="pl-de">' + heures(D.de || '09:00') + '</select></label>'
      + '<label>${T("Jusqu’à")}<select id="pl-a">' + heures(D.a || '17:00') + '</select></label></div></section>'
      + '<section class="pl-c"><h2>${T("Où")}</h2>'
      + '<label>${T("Endroit du ramassage")}<input type="text" id="pl-endroit" maxlength="80" value="Porte principale"></label>'
      + '<label>${T("Poids estimé par colis (kg)")}<input type="number" id="pl-poids" value="0.5" min="0.05" step="0.05"></label>'
      + (D.adresse ? '<div class="pl-org">${T("Adresse de la boutique :")} ' + esc(D.adresse) + '</div>' : '')
      + '</section></div>'
      + '<section class="pl-c pl-colis"><h2>${T("Colis à faire ramasser")}</h2>'
      + (D.groupes || []).map(function(g){
          var on = TR[g.cle] !== false;
          return '<div class="pl-gr' + (on ? '' : ' off') + '"><div class="t"><input type="checkbox" data-tr="' + esc(g.cle) + '"' + (on ? ' checked' : '') + ' aria-label="' + esc(g.nom) + '">'
            + '<span>' + g.logo + '</span><b>' + esc(g.nom) + '</b><span class="rf-pill">' + g.colis + ' ${T("colis")}</span>'
            + (g.api ? '<span class="rf-pill vert">${T("demande automatique")}</span>' : '<span class="rf-pill ambre">${T("à contacter manuellement")}</span>') + '</div>'
            + '<div class="pl-cmd">' + (g.detail || (g.commandes || []).map(function(n){ return { id: n, numero: n }; })).map(function(c){
                return '<label><input type="checkbox" data-cmd="' + esc(c.id) + '" data-gr="' + esc(g.cle) + '"' + (CHOIX[c.id] !== false ? ' checked' : '') + (on ? '' : ' disabled') + '>'
                  + '<span><b>' + esc(c.numero) + '</b>' + (c.client || c.ville ? ' <small>' + esc([c.client, c.ville].filter(Boolean).join(' · ')) + '</small>' : '') + '</span></label>';
              }).join('') + '</div></div>';
        }).join('')
      + '</section>';
    zone.innerHTML = h;
    majJours(); majResume();
  }
  function choisis(){
    var ids = [], trs = {};
    (D.groupes || []).forEach(function(g){
      if (TR[g.cle] === false) return;
      (g.detail || []).forEach(function(c){ if (CHOIX[c.id] !== false) { ids.push(c.id); trs[g.cle] = 1; } });
    });
    return { ids: ids, transporteurs: Object.keys(trs) };
  }
  function majJours(){ var d = val('pl-date'); Array.prototype.forEach.call(zone.querySelectorAll('[data-jour]'), function(b){ b.className = b.getAttribute('data-jour') === d ? 'on' : ''; }); }
  function majResume(){
    var c = D && D.total ? choisis() : { ids: [], transporteurs: [] };
    var r = document.getElementById('res');
    var dt = val('pl-date');
    r.innerHTML = c.ids.length ? '<b>' + c.ids.length + '</b> ' + (c.ids.length > 1 ? '${T("colis")}' : '${T("colis")}') + ' · ' + c.transporteurs.length + ' ' + (c.transporteurs.length > 1 ? '${T("transporteurs")}' : '${T("transporteur")}')
      + (dt ? ' · ' + esc(libJour(dt)) + ', ' + esc(val('pl-de')) + '–' + esc(val('pl-a')) : '') : '${T("Aucun colis choisi.")}';
    document.getElementById('pl-envoyer').disabled = !c.ids.length;
  }

  zone.addEventListener('click', function(ev){
    var b = ev.target.closest && ev.target.closest('[data-jour]');
    if (b) { document.getElementById('pl-date').value = b.getAttribute('data-jour'); majJours(); majResume(); }
  });
  zone.addEventListener('change', function(ev){
    var t = ev.target;
    if (t.hasAttribute('data-tr')) { TR[t.getAttribute('data-tr')] = t.checked; dessiner(); return; }
    if (t.hasAttribute('data-cmd')) { CHOIX[t.getAttribute('data-cmd')] = t.checked; majResume(); return; }
    if (t.id === 'pl-date') majJours();
    majResume();
  });
  document.getElementById('pl-annuler').onclick = function(){ try { window.close(); } catch (e) {} };
  document.getElementById('pl-envoyer').onclick = function(){
    var c = choisis(); if (!c.ids.length) return;
    var de = val('pl-de'), a = val('pl-a');
    if (a <= de) { szDire('${T("L’heure de fin doit suivre l’heure de début (au moins 2 h d’écart).")}', 'err'); return; }
    var btn = this; btn.disabled = true; szDire('${T("Demandes envoyées aux transporteurs…")}', 'att');
    appeler('ramassages:planifier', [{ date: val('pl-date'), de: de, a: a, poids: parseFloat(val('pl-poids')) || 0.5,
      endroit: val('pl-endroit').trim(), transporteurs: c.transporteurs, commandes: c.ids }]).then(function(r){
      if (!r.ok) { btn.disabled = false; szDire(r.motif === 'aucun_colis' ? '${T("Aucun colis à ramasser.")}' : r.motif === 'deja_en_cours' ? '${T("Ces colis sont déjà en cours de planification sur un autre poste.")}' : '${T("L’opération a échoué.")}', 'err'); return; }
      szDire('${T("Ramassage")} ' + libJour(r.date) + ' — ' + r.total + ' ${T("colis")}' + ((r.parties || []).length ? ' · ' + r.parties.join(' · ') : ''), r.echec ? 'err' : 'bon');
      if (!r.echec) setTimeout(function(){ try { window.close(); } catch (e) {} }, 1600); else btn.disabled = false;
    });
  };
  document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape') { try { window.close(); } catch (e) {} } });
  appeler('ramassages:preparer', []).then(function(r){
    if (!r || !r.ok) { zone.innerHTML = '<div class="vide" style="grid-column:1/-1">${T("Les colis prêts n’ont pas pu être lus.")}</div>'; return; }
    D = r; dessiner();
  });
})();
</script></body></html>`;
}

module.exports = { pageRamassages, pageRamassagePlan };
