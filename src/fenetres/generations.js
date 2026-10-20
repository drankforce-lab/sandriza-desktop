'use strict';

/*
 * FENÊTRE « GÉNÉRATIONS » — NATIVE (2026-10-18)
 * =============================================================================
 * Sa capture images\93.png : la pastille « 1 génération en cours · 0,65 $ US »,
 * et « je clique, rien ne se passe ». Sa demande : « une belle boîte quand je
 * clique, qui me fait un suivi étape par étape avec description et pourcentage,
 * bouton d'arrêt, et je veux voir toutes mes générations lancées ; de quoi de
 * professionnel ».
 *
 * ⚠⚠ LA PANNE D'AVANT : le petit panneau de la pastille retenait « ouvert » dans
 * localStorage. Une fenêtre native est une page `data:` — localStorage y LÈVE
 * (SecurityError), la lecture rendait toujours « fermé » : le clic ne changeait
 * rien, dans aucune fenêtre. Ici, AUCUN état dans le navigateur : tout vient de la
 * file (generations:etat, page principale) et ce qui doit durer y est écrit
 * (« vu », « retirer »).
 *
 * ── CE QU'ELLE MONTRE ───────────────────────────────────────────────────────
 *   · à gauche, TOUTES les générations lancées (l'historique est gardé par la
 *     file, 200 au plus) : en cours en haut, puis à confirmer, terminées,
 *     échouées / interrompues / rejetées ; date, produit et vignette, type, coût ;
 *   · à droite, celle qu'on a choisie : les onze étapes, chacune avec sa
 *     DESCRIPTION, son état (fait, en cours, à venir) et sa durée ; le
 *     POURCENTAGE global, pondéré par la durée habituelle de chaque étape (celle
 *     de The New Black au temps écoulé sur l'estimation) ; le temps restant ;
 *     les gestes : Arrêter (avec le montant déjà engagé), Publier quand même /
 *     Rejeter quand elle attend, Ouvrir la fiche, Retirer de la liste.
 *
 * ⚠ PAS DE BARRE DE DÉFILEMENT (la règle de la maison) : la liste se découpe en
 * pages d'après la place réellement disponible.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) NI BARRE OBLIQUE INVERSE dans la portion de
 * script, COMMENTAIRES COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
const T = require('../langue').tr('generations');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.05rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.tete h1{margin:0;font:700 1.02rem/1.2 Georgia,serif}
.tete .sous{font-size:.76rem;color:var(--tx2);margin-left:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.corps{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(16rem,22rem) minmax(0,1fr);gap:0}
button{font:inherit;color:var(--tx);background:var(--v05);cursor:pointer;
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .7rem;white-space:nowrap}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button:focus-visible{outline:2px solid var(--or);outline-offset:1px}
button.dgr{border-color:rgba(239,68,68,.55);color:var(--tx-err)}
button.dgr:hover:not(:disabled){background:rgba(239,68,68,.14)}
button.pri{border-color:rgba(var(--or-rgb),.7);color:var(--tx-or)}
button.mini{font-size:.74rem;padding:.14rem .5rem}
/* ── la liste ── */
.gauche{display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--v08);background:var(--f-carte2)}
.filtres{flex:0 0 auto;display:flex;gap:.3rem;padding:.55rem .7rem;border-bottom:1px solid var(--v08);flex-wrap:wrap}
.filtres button{font-size:.72rem;padding:.12rem .55rem;border-radius:99px}
.filtres button.on{background:rgba(var(--or-rgb),.18);border-color:rgba(var(--or-rgb),.7);color:var(--tx-or2)}
.liste{flex:1 1 auto;min-height:0;overflow:hidden;padding:.3rem 0}
.grp{height:1.7rem;display:flex;align-items:flex-end;padding:0 .8rem .2rem;font-size:.66rem;font-weight:700;
  text-transform:uppercase;letter-spacing:.07em;color:var(--tx2)}
.it{height:3.9rem;display:flex;align-items:center;gap:.6rem;padding:0 .8rem;cursor:pointer;border-left:3px solid transparent}
.it:hover{background:var(--v04)}
.it.sel{background:rgba(var(--or-rgb),.12);border-left-color:var(--or)}
.it.sel .vg{color:var(--tx)}
.it:focus-visible{outline:2px solid var(--or);outline-offset:-2px}
.vg{flex:0 0 auto;width:2.7rem;height:2.7rem;border-radius:8px;background:var(--v06) center/cover no-repeat;
  border:1px solid var(--v08);display:flex;align-items:center;justify-content:center;color:var(--tx2);font-size:.7rem}
.it .tx{flex:1 1 auto;min-width:0}
.it .n1{font-weight:600;font-size:.84rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it .n2{font-size:.72rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it .bar{height:.22rem;border-radius:99px;background:var(--v10);margin-top:.25rem;overflow:hidden}
.it .bar i{display:block;height:100%;background:var(--or)}
.it .dr{flex:0 0 auto;text-align:right;font-size:.72rem}
.it .dr .c{color:var(--tx2);font-variant-numeric:tabular-nums;margin-top:.15rem}
.pg{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:.4rem;padding:.4rem .7rem;border-top:1px solid var(--v08);font-size:.74rem;color:var(--tx2)}
.etq{display:inline-block;font-size:.66rem;font-weight:600;padding:.05rem .48rem;border-radius:99px;white-space:nowrap}
.etq.cours{background:rgba(var(--or-rgb),.2);color:var(--tx-or2)}
.etq.attente{background:rgba(251,191,36,.16);color:var(--tx-att)}
.etq.fini{background:rgba(22,163,74,.2);color:var(--tx-ok2)}
.etq.echec{background:rgba(220,38,38,.18);color:var(--tx-err2)}
.etq.interrompu,.etq.rejete{background:var(--v08);color:var(--tx2)}
/* ── le détail ── */
/* Opaque : la texture d un thème (Carbone) ne passe jamais sous un texte — la règle du socle pour les cartes. */
.droite{min-height:0;overflow:hidden;display:flex;flex-direction:column;padding:.9rem 1.15rem;gap:.75rem;background:var(--f-page)}
.vide{margin:auto;text-align:center;color:var(--tx2);font-size:.86rem;max-width:26rem;line-height:1.6}
.ent{display:flex;gap:.9rem;align-items:center}
.ent .vg{width:4.2rem;height:4.2rem;border-radius:10px}
.ent .tx{flex:1 1 auto;min-width:0}
.ent h2{margin:0;font:700 1.06rem/1.25 Georgia,serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ent .meta{font-size:.76rem;color:var(--tx2);margin-top:.15rem}
.ent .pct{flex:0 0 auto;text-align:right}
.ent .pct b{display:block;font:700 1.9rem/1 system-ui,sans-serif;font-variant-numeric:tabular-nums}
.ent .pct span{font-size:.74rem;color:var(--tx2)}
.prog{height:.5rem;border-radius:99px;background:var(--v10);overflow:hidden}
.prog i{display:block;height:100%;background:linear-gradient(90deg,var(--or),var(--or-clair));transition:width .6s ease}
.prog.fini i{background:var(--tx-ok)}
.prog.echec i{background:var(--tx-err)}
.prog.attente i{background:var(--tx-att)}
@media (prefers-reduced-motion:reduce){.prog i{transition:none}}
.etapes{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;border:1px solid var(--v07);border-radius:11px;background:var(--f-carte);overflow:hidden}
.et{flex:1 1 0;min-height:0;display:grid;grid-template-columns:1.6rem minmax(0,1fr) auto;align-items:center;gap:.6rem;padding:0 .8rem;border-top:1px solid var(--v05)}
.et:first-child{border-top:0}
.et .ic{width:1.35rem;height:1.35rem;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;
  border:1.5px solid var(--v22);color:var(--tx3)}
.et.fait .ic{background:rgba(22,163,74,.22);border-color:var(--tx-ok);color:var(--tx-ok)}
.et.cours .ic{border-color:var(--or);color:var(--or);animation:genPulse 1.4s ease-in-out infinite}
.et.err .ic{background:rgba(220,38,38,.2);border-color:var(--tx-err);color:var(--tx-err)}
.et.attente .ic{background:rgba(251,191,36,.16);border-color:var(--tx-att);color:var(--tx-att)}
@keyframes genPulse{50%{box-shadow:0 0 0 4px rgba(var(--or-rgb),.18)}}
@media (prefers-reduced-motion:reduce){.et.cours .ic{animation:none}}
.et .lb{min-width:0}
.et .nm{font-size:.82rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.et.att .nm{color:var(--tx2);font-weight:500}
.et.cours{background:rgba(var(--or-rgb),.07)}
.et .ds{font-size:.71rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.et .du{font-size:.74rem;color:var(--tx2);font-variant-numeric:tabular-nums;white-space:nowrap}
.et.cours .du{color:var(--tx-or2)}
.bilan{font-size:.78rem;line-height:1.5;padding:.45rem .7rem;border-radius:9px;background:var(--v03);border:1px solid var(--v07);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bilan.err{color:var(--tx-err);border-color:rgba(248,113,113,.35)}
.bilan.att{color:var(--tx-att);border-color:rgba(251,191,36,.35)}
.bilan.bon{color:var(--tx-ok);border-color:rgba(74,222,128,.3)}
.gestes{display:flex;gap:.45rem;flex-wrap:wrap;align-items:center}
.gestes .esp{flex:1 1 auto}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
/* Le mode jour : les pastilles et les pictogrammes d étape gardent leur teinte, assombrie au minimum lisible. */
html.jour .vg{color:#4a5668}
html.jour .etq.cours{color:#5a4f38}
html.jour .etq.fini{color:#1f5a36}
html.jour .etq.echec{color:#7a2a2a}
html.jour .etq.interrompu,html.jour .etq.rejete{color:#424b57}
html.jour .et.fait .ic{color:#1b5e33}
html.jour .et.err .ic{color:#8a2c2c}
@media (max-width:760px){.corps{grid-template-columns:minmax(13rem,17rem) minmax(0,1fr)}.et .ds{display:none}}
`;

/** Page complète de la fenêtre native « Générations ». */
function pageGenerations() {
  return `${TETE()}
<title>${T("Générations — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body class="sz-fen-generations">
<div class="tete"><span class="ico">${ICO.fusee}</span><h1>${T("Générations")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps">
  <div class="gauche">
    <div class="filtres" id="filtres" role="tablist" aria-label="${T("Filtrer les générations")}"></div>
    <div class="liste" id="liste" role="listbox" aria-label="${T("Générations lancées")}"></div>
    <div class="pg" id="pg"></div>
  </div>
  <div class="droite" id="detail"><div class="vide">${T("Lecture des générations…")}</div></div>
</div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var listeEl = document.getElementById('liste'), detailEl = document.getElementById('detail');
  var pgEl = document.getElementById('pg'), sousEl = document.getElementById('sous'), filtresEl = document.getElementById('filtres');

  var GENS = null;      // null = pas encore lu
  var SEL = '';         // l identifiant choisi
  var FILTRE = 'tout';  // tout | cours | traiter | fini | echec
  var PAGE = 0;
  var OCC = false;
  var TIMER = null;
  var SIG_LISTE = '';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  // Le coût chez The New Black est en DOLLARS AMÉRICAINS : « 0,65 $ US » / « US$0.65 » — le nombre par le socle (groupement).
  function argent(n){ return '${T("{m} $ US")}'.replace('{m}', szArgentNombre(n, 2)); }
  function fdate(ts){ if (!ts) return ''; try { return new Date(ts).toLocaleString('${LIEU()}', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return ''; } }
  function duree(ms){
    var s = Math.max(0, Math.round((Number(ms) || 0) / 1000));
    if (s < 60) return '${T("{s} s")}'.replace('{s}', String(s));
    var m = Math.floor(s / 60), r = s % 60;
    return '${T("{m} min {s} s")}'.replace('{m}', String(m)).replace('{s}', (r < 10 ? '0' : '') + r);
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application.")}',
    droit:              '${T("Votre rôle ne permet pas de gérer les aperçus 3D.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cette génération n’est plus dans la liste.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 120)) + ')';
    return t;
  }
  function raisonRefaire(m){
    return m === 'original_supprime' ? '${T("Original supprimé après 30 jours — générez un nouvel aperçu 3D pour pouvoir refaire le rendu.")}'
      : '${T("L’original de The New Black n’a pas été conservé pour cet aperçu — générez un nouvel aperçu 3D pour pouvoir refaire le rendu.")}';
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  /* LES ONZE ÉTAPES : le nom, ce qu elle fait, et sa durée HABITUELLE (secondes) — celle qui pondère le
     pourcentage. The New Black : son estimation (dureeEstimee), au temps écoulé. Mêmes noms que la file. */
  var ETAPES = [
    ['${T("Envoi des photos")}', '${T("La photo du devant part chez The New Black avec la demande de modèle 3D.")}', 4],
    ['${T("Génération 3D chez The New Black")}', '${T("The New Black sculpte le vêtement en 3D d’après la photo du devant. Le coût est engagé dès cette étape.")}', 150],
    ['${T("Téléchargement du modèle")}', '${T("Le modèle brut (GLB) est rapatrié sur ce poste.")}', 4],
    ['${T("Détourage et recalage des photos devant/dos")}', '${T("Les photos devant et dos sont détourées, puis alignées sur la silhouette du modèle.")}', 6],
    ['${T("Projection des photos sur le modèle")}', '${T("Vos vraies photos sont peintes sur le modèle : tissu, coutures et boutons viennent d’elles.")}', 8],
    ['${T("Relief inventé effacé sous les photos")}', '${T("Les reliefs ajoutés par The New Black sous les photos sont aplanis ; la silhouette ne bouge pas.")}', 5],
    ['${T("Couleur fidèle")}', '${T("Une seule teinte tout autour, celle de la photo principale — vérifiée au rendu de la boutique sous huit angles.")}', 30],
    ['${T("Compression")}', '${T("Textures et géométrie allégées pour la boutique : 2 Mo au plus.")}', 6],
    ['${T("Contrôle de conformité")}', '${T("Le modèle est comparé aux photos devant et dos ; sous le seuil, il attend votre confirmation.")}', 3],
    ['${T("Dépôt (R2 et photothèque)")}', '${T("Le modèle est déposé dans le stockage, et son rendu rangé dans la photothèque.")}', 4],
    ['${T("Posé sur la fiche")}', '${T("L’aperçu 3D est posé sur la fiche du produit et visible en boutique.")}', 2]
  ];
  var ETATS = { cours: '${T("En cours")}', attente: '${T("À confirmer")}', fini: '${T("Terminée")}',
    echec: '${T("Échouée")}', interrompu: '${T("Interrompue")}', rejete: '${T("Rejetée")}' };
  var RANG = { cours: 0, attente: 1, fini: 2, echec: 3, interrompu: 3, rejete: 3 };
  var GROUPES = ['${T("En cours")}', '${T("À confirmer")}', '${T("Terminées")}', '${T("Échouées, interrompues ou rejetées")}'];

  /* LE VÊTEMENT SANS MANNEQUIN (2026-10-19) entre aussi dans la file : quatre étapes, le travail chez The New Black
     au palier choisi. Chaque genre a ses étapes ; le reste de la fenêtre lit celles de la génération montrée. */
  var ETAPES_FANT = [
    ['${T("Contrôle du prix")}', '${T("Le prix est redemandé et comparé au montant affiché ; s’il a changé, rien ne part.")}', 2],
    ['${T("Retrait du mannequin chez The New Black")}', '${T("The New Black refait le vêtement sans mannequin, au palier choisi (Standard, Pro ou Ultra).")}', 45],
    ['${T("Couleur fidèle")}', '${T("La couleur du rendu est ramenée sur celle de la photo source.")}', 2],
    ['${T("Détourage et finition")}', '${T("Le fond est retiré ou mis à la couleur de l’ambiance, le contour lissé, le cadrage resserré.")}', 6]
  ];
  /* (2026-10-19) les rendus de l Atelier (photo, modèle 3D) : leurs étapes viennent de la file elle-même */
  function etapesDe(g){
    if (g && g.genre === 'fantome') return ETAPES_FANT;
    if (g && (g.genre === 'atelier' || g.genre === 'atelier3d')) return (g.etapes || []).map(function(e){ return [esc(e.lib), '', e.d || (/New Black/.test(e.lib) ? (Number(g.dureeEstimee) || 60) : 4)]; });
    return ETAPES;
  }
  function typeDe(g){ return g && g.genre === 'fantome' ? '${T("Sans mannequin")}' : (g && g.genre === 'atelier' ? '${T("Rendu photo")}' : (g && g.genre === 'atelier3d' ? '${T("Aperçu 3D · Atelier")}' : '${T("Aperçu 3D")}')); }
  function poids(g, i){ var E = etapesDe(g); return i === 1 ? (Number(g.dureeEstimee) || E[1][2]) : E[i][2]; }
  /* Le POURCENTAGE et le TEMPS RESTANT : pondérés par la durée habituelle de chaque étape. L étape en cours compte
     au temps écoulé sur sa durée habituelle, plafonnée à 95 % — elle n est pas finie tant qu elle ne l a pas dit. */
  function avancement(g, maintenant){
    var tot = 0, fait = 0, reste = 0;
    var et = g.etapes || [];
    var E = etapesDe(g);
    for (var i = 0; i < E.length; i++) tot += poids(g, i);
    if (g.etat === 'fini') return { pct: 100, reste: 0 };
    for (var k = 0; k < E.length; k++) {
      var e = et[k] || {}, w = poids(g, k);
      if (e.etat === 'fait') fait += w;
      else if (e.etat === 'cours') {
        var ec = Math.max(0, (maintenant - (e.t0 || maintenant)) / 1000);
        var f = Math.min(0.95, ec / w);
        fait += f * w; reste += Math.max(2, w - ec);
      } else if (e.etat === 'att') reste += w;
    }
    var pct = Math.max(0, Math.min(g.etat === 'cours' ? 99 : 100, Math.round(fait / tot * 100)));
    return { pct: pct, reste: g.etat === 'cours' ? reste * 1000 : 0 };
  }

  function trier(l){
    return l.slice().sort(function(a, b){
      var ra = RANG[a.etat] == null ? 3 : RANG[a.etat], rb = RANG[b.etat] == null ? 3 : RANG[b.etat];
      if (ra !== rb) return ra - rb;
      return (b.debut || 0) - (a.debut || 0);
    });
  }
  function filtrer(l){
    if (FILTRE === 'cours') return l.filter(function(g){ return g.etat === 'cours'; });
    if (FILTRE === 'traiter') return l.filter(function(g){ return g.etat === 'attente' || (g.etat === 'echec' && !g.vu); });
    if (FILTRE === 'fini') return l.filter(function(g){ return g.etat === 'fini'; });
    if (FILTRE === 'echec') return l.filter(function(g){ return g.etat === 'echec' || g.etat === 'interrompu' || g.etat === 'rejete'; });
    return l;
  }
  function choisirDefaut(l){
    if (SEL && l.some(function(g){ return g.id === SEL; })) return;
    var t = trier(l);
    var p = t.filter(function(g){ return g.etat === 'cours'; })[0] || t.filter(function(g){ return g.etat === 'attente'; })[0]
      || t.filter(function(g){ return g.etat === 'echec' && !g.vu; })[0]
      || l.slice().sort(function(a, b){ return (b.debut || 0) - (a.debut || 0); })[0];
    SEL = p ? p.id : '';
  }
  function vignette(g){
    var u = g.vignette || g.imageProduit || '';
    // une adresse, ou la petite vignette JPEG du vêtement sans mannequin (gardée sur ce poste)
    return /^(https?:|data:image[/]jpeg;base64,)/.test(u) ? ' style="background-image:url(' + esc(u).replace(/[()]/g, '') + ')"' : '';
  }

  function peindreFiltres(l){
    var n = function(f){ var x = FILTRE; FILTRE = f; var k = filtrer(l).length; FILTRE = x; return k; };
    var b = function(f, lib){ return '<button type="button" role="tab" data-f="' + f + '" class="' + (FILTRE === f ? 'on' : '') + '" aria-selected="' + (FILTRE === f) + '">'
      + lib + ' · ' + n(f) + '</button>'; };
    filtresEl.innerHTML = b('tout', '${T("Toutes")}') + b('cours', '${T("En cours")}') + b('traiter', '${T("À traiter")}')
      + b('fini', '${T("Terminées")}') + b('echec', '${T("Échouées")}');
  }

  /* LA LISTE EN PAGES, d après la place réelle : un en-tête de groupe compte sa propre hauteur. */
  function pages(l){
    var H = listeEl.clientHeight - 8;
    var rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    var hIt = 3.9 * rem, hGr = 1.7 * rem;
    var out = [], cur = [], h = 0, der = -1;
    l.forEach(function(g){
      var gr = RANG[g.etat] == null ? 3 : RANG[g.etat];
      var besoin = hIt + (gr !== der ? hGr : 0);
      if (cur.length && h + besoin > H) { out.push(cur); cur = []; h = 0; der = -1; besoin = hIt + hGr; }
      cur.push(g); h += besoin; der = gr;
    });
    if (cur.length) out.push(cur);
    return out;
  }
  function peindreListe(maintenant){
    var l = filtrer(trier(GENS || []));
    var pp = pages(l);
    if (PAGE >= pp.length) PAGE = Math.max(0, pp.length - 1);
    var page = pp[PAGE] || [];
    var h = '', der = -1;
    if (!l.length) h = '<div class="vide" style="padding:2rem 1rem">' + (GENS && GENS.length ? '${T("Aucune génération dans ce filtre.")}' : '${T("Aucune génération lancée pour l’instant. Un aperçu 3D se lance depuis la fiche d’un produit.")}') + '</div>';
    page.forEach(function(g){
      var gr = RANG[g.etat] == null ? 3 : RANG[g.etat];
      if (gr !== der) { h += '<div class="grp">' + GROUPES[gr] + '</div>'; der = gr; }
      var av = avancement(g, maintenant);
      var n2 = g.etat === 'cours'
        ? '${T("Étape")} ' + ((g.etapeCourante || 0) + 1) + '/' + etapesDe(g).length + ' · ' + av.pct + ' %'
        : fdate(g.debut);
      h += '<div class="it' + (g.id === SEL ? ' sel' : '') + '" role="option" tabindex="0" aria-selected="' + (g.id === SEL) + '" data-id="' + esc(g.id) + '">'
        + '<span class="vg"' + vignette(g) + '>' + (vignette(g) ? '' : (g.genre === 'fantome' ? '${T("Photo")}' : '3D')) + '</span>'
        + '<span class="tx"><div class="n1">' + esc(g.produitNom || g.produit) + '</div><div class="n2">' + typeDe(g) + ' · ' + n2 + '</div>'
        + (g.etat === 'cours' ? '<div class="bar"><i style="width:' + av.pct + '%"></i></div>' : '') + '</span>'
        + '<span class="dr"><span class="etq ' + esc(g.etat) + '">' + (ETATS[g.etat] || esc(g.etat)) + '</span><div class="c">' + argent(g.cout) + '</div></span></div>';
    });
    poser(listeEl, h);
    poser(pgEl, '<span>' + l.length + ' ' + (l.length > 1 ? '${T("générations")}' : '${T("génération")}') + '</span>'
      + (pp.length > 1 ? '<span><button type="button" class="mini" data-pg="-1"' + (PAGE ? '' : ' disabled') + ' aria-label="${T("Page précédente")}">‹</button> '
        + (PAGE + 1) + ' / ' + pp.length + ' <button type="button" class="mini" data-pg="1"' + (PAGE < pp.length - 1 ? '' : ' disabled') + ' aria-label="${T("Page suivante")}">›</button></span>' : ''));
  }

  function texteConformite(c){
    if (!c || c.devant == null) return '';
    return '${T("Conforme au devant : {d} % · au dos : {o} %")}'.replace('{d}', String(c.devant)).replace('{o}', String(c.dos))
      + (c.reliefEfface != null ? ' · ' + '${T("relief inventé effacé à {r} %")}'.replace('{r}', String(c.reliefEfface)) : '')
      + (c.teinteUniformite != null ? ' · ' + '${T("teinte uniforme à ΔE {u} (face/photo ΔE {p})")}'.replace('{u}', String(c.teinteUniformite)).replace('{p}', String(c.teinteEcartPhoto)) : '')
      + (c.structureDos != null ? ' · ' + '${T("structure du dos {s}")}'.replace('{s}', szNombre(c.structureDos, 2)) : '');
  }
  /* ⚠ ON NE RÉÉCRIT QUE CE QUI A CHANGÉ : la fenêtre se relit chaque seconde ; un bouton remplacé entre l appui
     et le relâchement perd son clic. Les gestes vivent dans leur propre zone, qui ne bouge que si les gestes
     changent. */
  var DER = {};
  function poser(el, h){ var k = el.id || 'detail'; if (DER[k] === h) return; DER[k] = h; el.innerHTML = h; }
  function zones(){
    if (!document.getElementById('d-haut')) { detailEl.innerHTML = '<div id="d-haut" style="display:contents"></div><div id="d-gestes" class="gestes"></div>'; DER['d-haut'] = DER['d-gestes'] = null; DER.detail = null; }
    return { haut: document.getElementById('d-haut'), gestes: document.getElementById('d-gestes') };
  }
  function peindreDetail(maintenant){
    var g = (GENS || []).filter(function(x){ return x.id === SEL; })[0];
    if (!g) {
      DER['d-haut'] = DER['d-gestes'] = null;
      poser(detailEl, '<div class="vide">' + (GENS && GENS.length ? '${T("Choisissez une génération dans la liste pour en voir le détail.")}'
        : '${T("Les aperçus 3D lancés depuis les fiches des produits paraissent ici, avec leur suivi étape par étape.")}') + '</div>');
      return;
    }
    var av = avancement(g, maintenant), et = g.etapes || [];
    var etat = g.etat;
    var sousTitre = etat === 'cours' ? (av.reste > 0 ? '${T("≈ {t} restantes")}'.replace('{t}', duree(av.reste)) : '${T("presque fini")}')
      : (ETATS[etat] || etat);
    var total = (g.fin || maintenant) - (g.debut || maintenant);
    var h = '<div class="ent"><span class="vg"' + vignette(g) + '>' + (vignette(g) ? '' : (g.genre === 'fantome' ? '${T("Photo")}' : '3D')) + '</span>'
      + '<div class="tx"><h2>' + esc(g.produitNom || g.produit) + '</h2>'
      + '<div class="meta">' + (g.genre === 'atelier' ? '${T("Atelier · rendu photo par The New Black")}' + (g.palier ? ' (' + esc(g.palier) + ')' : '')
          : g.genre === 'atelier3d' ? '${T("Atelier · aperçu 3D construit par The New Black (sans mannequin, puis Image to 3D)")}'
          : g.genre === 'fantome' ? '${T("Vêtement sans mannequin · The New Black")}' + (g.palier ? ' (' + esc(g.palier) + ')' : '')
          : (g.refaite ? '${T("Rendu refait · sans nouvel appel payant")}' : '${T("Aperçu 3D · The New Black, Image to 3D")}')) + (g.sku ? ' · ' + esc(g.sku) : '') + '</div>'
      + '<div class="meta">' + '${T("Lancée le {d} par {p}")}'.replace('{d}', fdate(g.debut)).replace('{p}', esc(g.par || '—'))
      + ' · ' + '${T("durée {t}")}'.replace('{t}', duree(total)) + ' · ' + '${T("coût {c}")}'.replace('{c}', argent(g.cout)) + '</div></div>'
      + '<div class="pct"><b>' + av.pct + ' %</b><span>' + sousTitre + '</span></div></div>'
      + '<div class="prog ' + esc(etat) + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + av.pct + '"><i style="width:' + av.pct + '%"></i></div>';
    h += '<div class="etapes">';
    var ET = etapesDe(g);
    for (var i = 0; i < ET.length; i++) {
      var e = et[i] || { etat: 'att' };
      var cl = e.etat === 'fait' ? 'fait' : (e.etat === 'cours' ? 'cours' : (e.etat === 'err' ? 'err' : (e.etat === 'attente' ? 'attente' : 'att')));
      var ic = cl === 'fait' ? '✓' : (cl === 'err' ? '✕' : (cl === 'attente' ? '?' : (cl === 'cours' ? '•' : String(i + 1))));
      var du = '';
      if (cl === 'fait' || cl === 'err') du = (e.t0 && e.t1) ? duree(e.t1 - e.t0) : '';
      else if (cl === 'cours') du = duree(maintenant - (e.t0 || maintenant)) + (i === 1 ? ' / ≈ ' + duree(poids(g, 1) * 1000) : '');
      else if (cl === 'attente') du = '${T("votre décision")}';
      else du = '≈ ' + duree(poids(g, i) * 1000);
      h += '<div class="et ' + cl + '"><span class="ic" aria-hidden="true">' + ic + '</span>'
        + '<div class="lb"><div class="nm">' + ET[i][0] + '</div><div class="ds" title="' + esc(ET[i][1]) + '">' + ET[i][1] + '</div></div>'
        + '<span class="du">' + du + '</span></div>';
    }
    h += '</div>';
    var conf = texteConformite(g.conformite);
    if (etat === 'attente') h += '<div class="bilan att" title="' + esc(g.message || '') + '">? ${T("En attente de votre confirmation")}' + (conf ? ' — ' + esc(conf) : '') + '</div>';
    else if (etat === 'echec') h += '<div class="bilan err" title="' + esc(g.message || '') + '">✕ ' + esc(g.message || '${T("Échec")}') + '</div>';
    else if (etat === 'fini') h += '<div class="bilan bon" title="' + esc(g.message || '') + '">✓ ' + esc(g.message || conf || '${T("Terminée")}') + '</div>';
    else if (etat === 'interrompu' || etat === 'rejete') h += '<div class="bilan" title="' + esc(g.message || '') + '">' + esc(g.message || ETATS[etat]) + '</div>';
    else h += '<div class="bilan">' + '${T("Étape {n} sur {t} : {e}")}'.replace('{n}', String((g.etapeCourante || 0) + 1)).replace('{t}', String(ET.length))
      .replace('{e}', ET[g.etapeCourante || 0] ? ET[g.etapeCourante || 0][0] : '') + ' — ' + (g.genre === 'fantome'
        ? '${T("le résultat s’affiche dans le Studio, où il s’enregistre ou se place.")}' : '${T("Vous pouvez fermer cette fenêtre, la génération continue.")}') + '</div>';
    var z = zones();
    poser(z.haut, h);
    h = '';
    if (etat === 'cours') h += '<button type="button" class="dgr" data-g="interrompre">${T("Arrêter la génération")}</button>';
    if (etat === 'attente') h += '<button type="button" class="pri" data-g="confirmer">${T("Publier quand même")}</button><button type="button" class="dgr" data-g="rejeter">${T("Rejeter")}</button>';
    h += '<span class="esp"></span>';
    /* ⚠ (2026-10-19, sa décision) : « Refaire » ne repart que de l'ORIGINAL de The New Black, gardé 30 jours ; supprimé
       ou jamais conservé, le bouton reste visible mais GRISÉ, avec la raison — une nouvelle génération le réactive. */
    if (g.peutRefaire) h += '<button type="button" data-g="refaire" title="${T("Retraite l’aperçu au poste depuis l’original de The New Black (conservé 30 jours) — sans nouvel appel payant")}">${T("Refaire le rendu")}</button>';
    else if (g.refaireRaison) h += '<button type="button" disabled title="' + esc(raisonRefaire(g.refaireRaison)) + '">${T("Refaire le rendu")}</button>';
    if (g.produit) h += '<button type="button" data-g="fiche">${T("Ouvrir la fiche")}</button>';
    if (etat !== 'cours' && etat !== 'attente') h += '<button type="button" data-g="retirer">${T("Retirer de la liste")}</button>';
    poser(z.gestes, h);
    // Une génération ÉCHOUÉE (ou arrêtée) ouverte ici est VUE : la pastille des fenêtres cesse d alerter.
    if (!g.vu && etat !== 'cours' && etat !== 'attente') { g.vu = true; appeler('generations:agir', [g.id, 'vu']); }
  }

  function peindre(){
    if (GENS === null) return;
    var maintenant = Date.now();
    var cours = GENS.filter(function(g){ return g.etat === 'cours'; });
    var att = GENS.filter(function(g){ return g.etat === 'attente'; }).length;
    var engage = cours.reduce(function(s, g){ return s + (Number(g.cout) || 0); }, 0);
    sousEl.textContent = cours.length
      ? '${T("{n} en cours")}'.replace('{n}', String(cours.length)) + ' · ' + '${T("{m} engagés")}'.replace('{m}', argent(engage))
        + (att ? ' · ' + '${T("{n} à confirmer")}'.replace('{n}', String(att)) : '')
      : (att ? '${T("{n} à confirmer")}'.replace('{n}', String(att)) : '${T("rien en cours")}');
    peindreFiltres(GENS);
    peindreListe(maintenant);
    peindreDetail(maintenant);
  }

  function agir(g, geste){
    if (OCC) return Promise.resolve();
    OCC = true;
    return appeler('generations:agir', [g.id, geste]).then(function(r){
      OCC = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire(geste === 'interrompre' ? '${T("Génération arrêtée.")}' : (geste === 'confirmer' ? '${T("Modèle publié sur la fiche.")}'
        : (geste === 'rejeter' ? '${T("Modèle rejeté.")}' : '${T("Retirée de la liste.")}')), 'bon');
      if (geste === 'retirer') SEL = '';
      charger();
    });
  }
  detailEl.addEventListener('click', function(ev){
    var b = ev.target.closest('button[data-g]'); if (!b) return;
    var geste = b.getAttribute('data-g');
    var g = (GENS || []).filter(function(x){ return x.id === SEL; })[0]; if (!g) return;
    if (geste === 'fiche') {
      appeler('produits:ouvrir', [g.produit]).then(function(r){ if (r && r.ok === false) dire(expliquer(r), 'err'); });
      return;
    }
    if (geste === 'retirer') { agir(g, 'retirer'); return; }
    if (geste === 'refaire') {
      szConfirmer({ prudent: true, titre: '${T("Refaire le rendu de l’aperçu 3D")}',
        texte: '${T("Le modèle est retraité au poste, sans nouvel appel payant : matière mate, relief inventé effacé sous les photos, une seule teinte vérifiée au rendu de la boutique sous huit angles (devant et dos égaux), structure du dos comparée à la photo ; puis l’aperçu est reposé sur la fiche.")}',
        details: [['${T("Produit")}', String(g.produitNom || g.produit)], ['${T("Coût")}', '${T("0 $ — sans nouvel appel")}'],
          ['${T("Source")}', '${T("l’original de The New Black, conservé 30 jours après la génération")}']],
        oui: '${T("Refaire le rendu")}' }).then(function(ok){
          if (!ok) return;
          appeler('generations:refaireCouleur', [g.id]).then(function(r){
            if (!r.ok) { dire(r.motif === 'deja_en_cours' ? '${T("Une génération est déjà en cours pour cet article.")}'
              : (r.motif === 'original_supprime' || r.motif === 'original_absent') ? raisonRefaire(r.motif) : expliquer(r), 'err'); charger(); return; }
            SEL = r.id; dire('${T("Rendu en cours de retraitement.")}', 'bon'); charger();
          });
        });
      return;
    }
    var q;
    if (geste === 'interrompre') q = { danger: true, titre: '${T("Arrêter la génération")}',
      texte: '${T("{n} sont déjà engagés chez The New Black : ce montant ne sera pas remboursé. Les photos de la fiche seront déverrouillées et rien ne sera posé.")}'.replace('{n}', argent(g.cout)),
      details: [['${T("Produit")}', String(g.produitNom || g.produit)], ['${T("Montant engagé")}', argent(g.cout)]],
      oui: '${T("Arrêter la génération")}' };
    else if (geste === 'rejeter') q = { danger: true, titre: '${T("Rejeter le modèle 3D")}',
      texte: '${T("Le modèle sera retiré de la photothèque et rien ne sera posé sur la fiche. Le coût engagé chez The New Black n’est pas remboursé.")}',
      oui: '${T("Rejeter le modèle")}' };
    else q = { prudent: true, titre: '${T("Publier le modèle 3D")}',
      texte: '${T("Le modèle ne correspond pas bien aux photos. Il sera posé sur la fiche tel quel, et visible en boutique.")}' + ' ' + texteConformite(g.conformite),
      oui: '${T("Publier quand même")}' };
    szConfirmer(q).then(function(ok){ if (ok) agir(g, geste); });
  });
  listeEl.addEventListener('pointerdown', function(ev){
    if (ev.button) return;
    var it = ev.target.closest('[data-id]'); if (!it) return;
    SEL = it.getAttribute('data-id'); dire(''); peindre();
  });
  listeEl.addEventListener('keydown', function(ev){
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var it = ev.target.closest('[data-id]'); if (!it) return;
    ev.preventDefault(); SEL = it.getAttribute('data-id'); peindre();
  });
  pgEl.addEventListener('click', function(ev){
    var b = ev.target.closest('button[data-pg]'); if (!b) return;
    PAGE = Math.max(0, PAGE + Number(b.getAttribute('data-pg'))); peindre();
  });
  filtresEl.addEventListener('click', function(ev){
    var b = ev.target.closest('button[data-f]'); if (!b) return;
    FILTRE = b.getAttribute('data-f'); PAGE = 0; peindre();
  });

  function charger(){
    return appeler('generations:etat', []).then(function(r){
      if (!r || !r.ok) {
        if (GENS === null) poser(detailEl, '<div class="vide">' + expliquer(r) + '</div>');
        return;
      }
      GENS = r.liste || [];
      choisirDefaut(GENS);
      peindre();
      /* (2026-10-19, lot VOLUME) La memoire du poste est pleine : la file n est plus gardee — un redemarrage
         perdrait les generations en cours. Le DIRE une fois (pas a chaque seconde de la lecture vivante). */
      if (r.quota && !QUOTA_DIT) { QUOTA_DIT = true; dire('${T("La mémoire du poste est pleine : la file des générations n’est plus gardée — ne fermez pas l’application avant la fin des générations en cours.")}', 'err'); }
      if (!r.quota) QUOTA_DIT = false;
    });
  }
  var QUOTA_DIT = false;
  /* VIVANTE : une lecture par seconde (la file vit dans la page principale, la lecture ne coûte rien) — les durées
     et le pourcentage avancent sous les yeux. On ne redessine pas pendant une confirmation. */
  function suivre(){
    if (TIMER) return;
    TIMER = setInterval(function(){
      if (document.hidden || OCC || document.querySelector('.szc-voile')) return;
      charger();
    }, 1000);
  }
  window.addEventListener('pagehide', function(){ if (TIMER) { clearInterval(TIMER); TIMER = null; } });
  try { new ResizeObserver(function(){ peindre(); }).observe(listeEl); } catch (e) {}

  window.szActualiser = function(){ charger(); };
  window.szRevenir = function(){ return charger(); };
  window.szPret = true;

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && !document.querySelector('.szc-voile')) { ev.preventDefault(); P.fermer(); }
  });

  charger();
  suivre();
})();
</script>
</body></html>`;
}

module.exports = { pageGenerations };
