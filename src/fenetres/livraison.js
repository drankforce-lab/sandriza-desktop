'use strict';

/*
 * FENÊTRE « CONFIGURATION DE LA LIVRAISON » — NATIVE (Livraison, palier 5)
 * =============================================================================
 * La livraison internationale et la tarification (frais standard, seuil de
 * livraison gratuite, supplément de traitement prioritaire).
 *
 * DEUX ONGLETS depuis 7.10.0 (2026-10-09, sa demande : « crée-moi un onglet
 * particulier pour les pays, c'est tout déformé ») : « Tarifs » et « Pays
 * desservis ». La liste des pays avait sa propre zone qui défilait DANS la
 * fenêtre qui défile, et son en-tête collant passait par-dessus les lignes.
 * Dans son onglet, elle prend toute la hauteur et l'en-tête a un fond plein.
 *
 * ⚠ AUCUN SECRET ICI : ce ne sont que des montants. Les identifiants des
 * transporteurs vivent dans une AUTRE fenêtre (Transporteurs), avec leur propre
 * discipline anti-perte.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit — jamais le nom d un pays ou d un
   Etat, qui vient de la liste des pays du site, ni la devise CA$ (voir src/langue/livraison.js). */
const T = require('../langue').tr('livraison');

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
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.6fr);gap:1rem;align-content:start}  /* deux cartes en haut, sans troisieme piste vide (2026-10-04) */
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:1rem 1.1rem;min-width:0;display:flex;flex-direction:column}
.carte h2{margin:0 0 .1rem;font:700 .8rem/1.2 system-ui;text-transform:uppercase;letter-spacing:.05em;color:var(--tx-bleute)}
.carte .sous{margin:0 0 .9rem;font-size:.78rem;color:var(--tx3)}
.ch{margin:0 0 .85rem}
.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.25rem;font-size:.78rem;color:var(--tx2)}
.ch .aide{font-size:.72rem;color:var(--tx3);margin-top:.2rem}
.ch input[type=number]{width:12rem;max-width:100%;font:inherit;color:var(--tx);background:var(--f-champ);
  border:1px solid var(--v12);border-radius:8px;padding:.42rem .55rem}
.ch input:focus{outline:none;border-color:#c9a97e}
.ch input:disabled{opacity:.55}
.bascule,.ch label.bascule{display:flex;align-items:flex-start;gap:.6rem;font-size:.86rem;cursor:pointer;
  -webkit-user-select:none;user-select:none}
.bascule input{width:1.1rem;height:1.1rem;accent-color:#c9a97e;cursor:pointer;margin-top:.15rem;flex:0 0 auto}
.bascule .d{font-size:.74rem;color:var(--tx3);display:block;margin-top:.1rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
.vide{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
/* Pays desservis — la carte occupe toute la largeur : deux cents lignes ne
   tiennent pas dans une demi-colonne. */
.carte.large{grid-column:1/-1}
/* LES ONGLETS : hors de la zone qui défile. */
.onglets{flex:0 0 auto;display:flex;gap:.25rem;align-items:center;flex-wrap:wrap;
  padding:.5rem 1.05rem;border-bottom:1px solid var(--v08);background:var(--f-page)}
.onglets > button{background:transparent;border:1px solid transparent;color:var(--tx2);padding:.36rem .8rem;
  display:inline-flex;align-items:center;gap:.4rem;font-weight:600}
.onglets > button:hover{background:var(--v05);color:var(--tx)}
.onglets .nb{font-size:.68rem;font-weight:700;padding:.04rem .4rem;border-radius:999px;background:var(--v08);color:var(--tx2)}
html.jour .onglets .nb{color:#3f4955}
/* L onglet des pays : une seule carte qui remplit la fenêtre, le tableau défile seul. */
.corps.plein{display:flex;flex-direction:column;overflow:hidden}
.corps.plein .carte.large{flex:1 1 auto;min-height:0}
.corps.plein .ptab{flex:1 1 auto;min-height:0;max-height:none}
.pbarre{display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem;flex-wrap:wrap}
/* PAS << .info >> : le socle le peint en panneau BLEU en mode jour. */
.pbarre .pinfo{font-size:.74rem;color:var(--tx2);flex:1 1 12rem;min-width:0}
.ptab{max-height:22rem;overflow-y:auto;border:1px solid var(--v07);border-radius:9px}
.ptab::-webkit-scrollbar{width:8px}
.ptab::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
table.pays{width:100%;border-collapse:collapse}
table.pays th{position:sticky;top:0;z-index:1;background:var(--f-carte);box-shadow:0 1px 0 var(--v10);text-align:left;font:700 .68rem/1.3 system-ui;
  text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);padding:.45rem .7rem;
  border-bottom:1px solid var(--v10)}
table.pays td{padding:.38rem .7rem;border-bottom:1px solid var(--v05);font-size:.84rem}
/* ⚠ ESTOMPER N'EST PAS EFFACER. Une ligne de pays NON DESSERVI était à .42 :
   son nom et son code sortaient à 1.7 de contraste, c'est-à-dire illisibles.
   Or c'est justement là qu'il faut lire — on regarde cette liste POUR SAVOIR
   quels pays sont fermés. Le gris dit « inactif » ; il ne doit pas dire « rien ».
   ⚠ Ce n'est pas un contrôle inactif au sens de la norme (WCAG 1.4.3 exempte les
   COMMANDES inactives, pas le texte d'un tableau) : ici, l'information reste
   l'information. .9 se lit encore comme un retrait, et le texte se lit — c'est
   la valeur MESUREE au banc, pas une estimation. */
table.pays tr.off td{opacity:.9}
table.pays .code{color:var(--tx3);font:.72rem ui-monospace,Menlo,Consolas,monospace;margin-left:.35rem}
table.pays .oui{color:var(--tx-ok);font-weight:600;font-size:.78rem}
table.pays .non{color:var(--tx3);font-size:.78rem}
table.pays .ets{font-size:.7rem;color:var(--tx2);margin-top:1px}
table.pays tr.paystete td{background:var(--v03)}
table.pays td.etatnom{padding-left:1.9rem;font-size:.82rem}
table.pays .verrou{color:var(--tx3);font-size:.74rem}
table.pays td.mid{text-align:center}
table.pays input[type=checkbox]{width:1rem;height:1rem;accent-color:#c9a97e;cursor:pointer}
.pfiltre{font:inherit;color:var(--tx);background:var(--f-champ);border:1px solid var(--v12);
  border-radius:8px;padding:.32rem .5rem;width:12rem}
.pfiltre:focus{outline:none;border-color:#c9a97e}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
/* Relooking 2026 (2026-10-04) : tarifs cote a cote, resume en une phrase. */
.tarifs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem}
.tarifs .ch{margin:0}
.resume-liv{margin-top:.8rem;padding:.6rem .8rem;border-radius:10px;background:var(--v04);border:1px solid var(--v08);
  font-size:.82rem;color:var(--tx2);line-height:1.5}
.resume-liv strong{color:var(--tx)}
`;

function pageLivraison() {
  return `${TETE()}
<title>${T("Configuration de la livraison — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.shipping}</span><h1>${T("Configuration de la livraison")}</h1></div>
<nav class="onglets" id="ong" role="tablist" aria-label="${T("Sections de la livraison")}" hidden></nav>
<div class="ro" id="ro" hidden>${T("Lecture seule : vous pouvez consulter les réglages, pas les modifier.")}</div>
<div class="corps" id="corps"><div class="carte"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-save" disabled>${T("Enregistrer")}</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  /* ── MODE ANCRE ── le meme bouton d'ancrage/detachement que les autres ecrans.
     La coquille appelle szModeAncre(true) quand la vue est ANCREE, (false) quand
     elle est DETACHEE ; on montre le bon libelle et on route vers le pont. */
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
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
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
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var bsave = document.getElementById('b-save');
  var D = null, RO = false, OCCUPE = false;
  var PAYS = null;      // { pays:[...], nbLivres } — tous les pays, moins les exclusions
  var FILTRE = '';      // filtre de la liste (deux cents lignes)
  var ONG = 'tarifs';   // 'tarifs' | 'pays'
  var ongEl = document.getElementById('ong');
  var piedBtn = bsave;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès à la configuration.")}',
    lecture_seule:      '${T("Votre rôle est en lecture seule : la livraison ne peut pas être modifiée.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    nuage:              '${T("L’enregistrement dans le nuage a échoué. Réessayez.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').'))
      + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function num(v){ return (v == null || v === '') ? '' : String(v); }
  // Le montant dans la phrase : szArgent du socle (symbole devant en anglais).
  function argentCourt(v){
    var n = parseFloat(String(v == null ? '' : v).replace(',', '.'));
    return szArgent(isNaN(n) ? 0 : n);
  }
  /* Ce que le client paie, en une phrase (2026-10-04). */
  function resumeLivraison(cout, seuil, prio, seuilIntl){
    var c = parseFloat(cout) || 0, sl = parseFloat(seuil) || 0, pr = parseFloat(prio) || 0;
    var si = (seuilIntl == null) ? 0 : (parseFloat(seuilIntl) || 0);
    var t = sl > 0
      ? '${T("Sous")} <strong>' + argentCourt(sl) + '</strong>${T(", la livraison coûte")} <strong>' + argentCourt(c) + '</strong>${T(" ; dès")} <strong>' + argentCourt(sl) + '</strong>${T(", elle est gratuite.")}'
      : '${T("La livraison coûte toujours")} <strong>' + argentCourt(c) + '</strong>${T(" — aucun seuil de gratuité.")}';
    /* LE SEUIL INTERNATIONAL (2026-10-07) : 100 $ au Canada, 150 $ ailleurs. */
    if (seuilIntl != null) t += ' ' + (si > 0
      ? '${T("À l’international, la livraison est gratuite dès")} <strong>' + argentCourt(si) + '</strong>.'
      : '${T("À l’international, la livraison n’est jamais gratuite.")}');
    if (pr > 0) t += ' ${T("Traitement prioritaire :")} <strong>+' + argentCourt(pr) + '</strong>.';
    return t;
  }

  function dessinerOnglets(){
    var d = D || {};
    if (!d.international) { ongEl.hidden = true; ONG = 'tarifs'; return; }
    ongEl.hidden = false;
    var n = PAYS ? PAYS.nbLivres : null;
    ongEl.innerHTML = [['tarifs', '${T("Tarifs")}'], ['pays', '${T("Pays desservis")}']].map(function(o){
      var on = o[0] === ONG;
      return '<button role="tab" data-ong="' + o[0] + '" aria-selected="' + on + '"' + (on ? ' class="on"' : '') + '>' + o[1]
        + (o[0] === 'pays' && n != null ? '<span class="nb">' + n + '</span>' : '') + '</button>';
    }).join('');
    ongEl.querySelectorAll('[data-ong]').forEach(function(b){
      b.onclick = function(){
        var k = b.getAttribute('data-ong'); if (k === ONG) return;
        /* Les tarifs non enregistrés survivent au changement d onglet : on les
           relit dans D avant de redessiner. */
        if (ONG === 'tarifs') lireTarifs();
        ONG = k; dessiner();
      };
    });
  }
  function lireTarifs(){
    if (!D) return;
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : null; };
    var c = function(id){ var e = document.getElementById(id); return e ? e.checked : null; };
    var x;
    if ((x = v('f-cost')) !== null) D.shippingCost = x;
    if ((x = v('f-thr')) !== null) D.freeThreshold = x;
    if ((x = v('f-thr-intl')) !== null) D.freeThresholdIntl = x;
    if ((x = v('f-prio')) !== null) D.priorityCost = x;
    if ((x = c('f-intl')) !== null) D.international = x;
  }
  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    var d = D || {};
    dessinerOnglets();
    corps.classList.toggle('plein', ONG === 'pays');
    /* Les pays s enregistrent case par case : le bouton Enregistrer ne sert
       qu aux tarifs. */
    piedBtn.hidden = ONG === 'pays';
    if (ONG === 'pays') { corps.innerHTML = paysHtml(); brancherPays(); return; }
    var dis = RO ? ' disabled' : '';
    var h = [];
    /* RELOOKING 2026 (2026-10-04) : l international en interrupteur (f-intl,
       lu par .checked comme avant), les trois tarifs cote a cote, et une phrase
       qui dit ce que le client paie — le seuil s ajuste, la phrase suit. */
    h.push('<div class="carte"><h2>${T("Livraison internationale")}</h2>'
      + '<p class="sous">${T("Permet aux clients de saisir une adresse hors Canada.")}</p>'
      + szInter('f-intl', '${T("Activer la livraison internationale")}',
          '${T("La recherche d’adresse s’adapte au monde entier et un champ Pays apparaît à la caisse.")}', !!d.international, RO ? 'disabled' : '')
      + '</div>');
    h.push('<div class="carte"><h2>${T("Tarification")}</h2><div class="tarifs">'
      + '<div class="ch"><label for="f-cost">${T("Frais de livraison standard (CA$)")}</label>'
      + '<input id="f-cost" type="number" min="0" step="0.01" value="' + esc(num(d.shippingCost)) + '"' + dis + '>'
      + '<div class="aide">${T("Facturé quand la commande n’atteint pas le seuil de livraison gratuite.")}</div></div>'
      + '<div class="ch"><label for="f-thr">${T("Seuil de livraison gratuite au Canada (CA$)")}</label>'
      + '<input id="f-thr" type="number" min="0" step="1" value="' + esc(num(d.freeThreshold)) + '"' + dis + '>'
      + '<div class="aide">${T("Au-dessus de ce montant, la livraison est gratuite. <strong>0</strong> désactive.")}</div></div>'
      /* Le seuil INTERNATIONAL n existe que si l international est allume (2026-10-07). */
      + (d.international ? '<div class="ch"><label for="f-thr-intl">${T("Seuil de livraison gratuite à l’international (CA$)")}</label>'
      + '<input id="f-thr-intl" type="number" min="0" step="1" value="' + esc(num(d.freeThresholdIntl)) + '"' + dis + '>'
      + '<div class="aide">${T("Hors du Canada, au-dessus de ce montant, la livraison est gratuite. <strong>0</strong> désactive.")}</div></div>' : '')
      + '<div class="ch"><label for="f-prio">${T("Frais traitement prioritaire (CA$)")}</label>'
      + '<input id="f-prio" type="number" min="0" step="0.01" value="' + esc(num(d.priorityCost)) + '"' + dis + '>'
      + '<div class="aide">${T("Supplément si le client choisit le traitement prioritaire. <strong>0</strong> masque l’option.")}</div></div></div>'
      + '<div class="resume-liv" id="f-resume">' + resumeLivraison(d.shippingCost, d.freeThreshold, d.priorityCost, d.international ? d.freeThresholdIntl : null) + '</div></div>');
    /* ⚠ LE TABLEAU N EXISTE QUE SI L INTERNATIONAL EST ALLUME. Demande expresse :
       decoche, on ne doit plus rien voir ni toucher de ce qui a trait a
       l international. On lit l etat REEL de la case a l ecran (pas seulement
       celui charge) pour que le tableau apparaisse et disparaisse tout de suite. */
    corps.innerHTML = h.join('');
    bsave.disabled = RO || OCCUPE;
    var fintl = document.getElementById('f-intl');
    if (fintl) fintl.onchange = function(){
      if (!D) D = {};
      lireTarifs();
      D.international = fintl.checked;
      if (fintl.checked && !PAYS) chargerPays();
      dessiner();
      dire(fintl.checked
        ? '${T("Enregistrez pour activer la livraison internationale.")}'
        : '${T("Enregistrez pour désactiver.")}', 'att');
    };
    brancherPays();
    var majResume = function(){
      var z = document.getElementById('f-resume'); if (!z) return;
      var v = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
      var ei = document.getElementById('f-thr-intl');
      z.innerHTML = resumeLivraison(v('f-cost'), v('f-thr'), v('f-prio'), ei ? ei.value : null);
    };
    ['f-cost', 'f-thr', 'f-thr-intl', 'f-prio'].forEach(function(id){ var e = document.getElementById(id); if (e) e.addEventListener('input', majResume); });
  }

  /* ══ PAYS DESSERVIS ════════════════════════════════════════════════════════
     ⚠ DEPUIS LE 2026-10-02 : TOUS LES PAYS, SAUF CEUX QU ON DECOCHE. Aucune taxe
     n est percue hors du Canada, donc les inscriptions Stripe ne decident plus
     de rien (la colonne << Inscription Stripe >> et << Relire Stripe >> sont
     parties). On n enregistre que les EXCLUSIONS, par pays ou par Etat (US). */
  function paysHtml(){
    if (!PAYS) {
      return '<div class="carte large"><h2>${T("Pays desservis")}</h2>'
        + '<div class="vide charge">${T("Lecture des destinations…")}</div></div>';
    }
    var q = FILTRE.toLowerCase();
    var l = PAYS.pays.filter(function(p){
      return !q || p.nom.toLowerCase().indexOf(q) !== -1 || p.code.toLowerCase().indexOf(q) !== -1;
    });
    var dis = RO ? ' disabled' : '';
    // ⚠ UNE LIGNE PAR ÉTAT pour les États-Unis : ligne d en-tete du pays (avec
    // sa case), puis un etat par ligne avec son NOM complet et SA case.
    var ligne = function(p){
      var ets = p.etats || [];
      var nomCol = esc(p.nom) + '<span class="code">' + esc(p.code) + '</span>';
      var cl = (ets.length ? 'paystete' : '') + (p.livre ? '' : (ets.length ? ' off' : 'off'));
      var h = '<tr' + (cl ? ' class="' + cl + '"' : '') + '><td>'
        + (ets.length ? '<strong>' + nomCol + '</strong>' : nomCol) + '</td>'
        + '<td class="mid"><input type="checkbox" data-pays="' + esc(p.code) + '"'
        + ' aria-label="' + esc('${T("Livrer vers ")}' + (p.nom || p.code)) + '"'
        + (p.livre ? ' checked' : '') + dis + '></td></tr>';
      if (ets.length && p.livre) {
        h += ets.map(function(e){
          return '<tr><td class="etatnom">↳ ' + esc(e.name || e.code) + ' <span class="code">' + esc(e.code) + '</span></td>'
            + '<td class="mid"><input type="checkbox" data-pays="' + esc(p.code) + '" data-etat="' + esc(e.code) + '"'
            + ' aria-label="' + esc('${T("Livrer vers ")}' + (e.name || e.code) + ', ' + (p.nom || p.code)) + '"'
            + (e.livre ? ' checked' : '') + dis + '></td></tr>';
        }).join('');
      }
      return h;
    };
    return '<div class="carte large"><h2>${T("Pays desservis")}</h2>'
      + '<div class="pbarre">'
      + '<input aria-label="${T("Filtrer")}" class="pfiltre" id="p-filtre" type="search" placeholder="${T("Filtrer…")}" value="' + esc(FILTRE) + '">'
      /* Deux formes ENTIERES : un << s >> colle a part ne se traduit pas. */
      + '<span class="pinfo">' + PAYS.nbLivres
      + (PAYS.nbLivres > 1 ? '${T(" pays desservis")}' : '${T(" pays desservi")}')
      + '${T(" · aucune taxe hors du Canada")}</span></div>'
      + '<div class="ptab"><table class="pays"><thead><tr>'
      + '<th>${T("Pays")}</th><th style="text-align:center">${T("On livre")}</th>'
      + '</tr></thead><tbody>'
      + (l.length ? l.map(ligne).join('')
                  : '<tr><td colspan="2" class="vide">${T("Aucun pays ne correspond.")}</td></tr>')
      + '</tbody></table></div></div>';
  }

  function brancherPays(){
    var f = document.getElementById('p-filtre');
    if (f) {
      f.oninput = function(){
        FILTRE = f.value;
        // On ne redessine QUE le tableau : redessiner la fenetre entiere
        // ferait perdre le focus a chaque frappe.
        var c = corps.querySelector('.carte.large .ptab');
        if (!c) return;
        var neuf = document.createElement('div');
        neuf.innerHTML = paysHtml();
        var t = neuf.querySelector('.ptab'), info = neuf.querySelector('.pinfo'), i0 = corps.querySelector('.pinfo');
        if (t) c.parentNode.replaceChild(t, c);
        if (info && i0) i0.innerHTML = info.innerHTML;
        brancherPays();
        var f2 = document.getElementById('p-filtre');
        if (f2) { f2.focus(); try { f2.setSelectionRange(f2.value.length, f2.value.length); } catch (e) {} }
      };
    }
    corps.querySelectorAll('input[data-pays]').forEach(function(el){
      el.onchange = function(){ exclurePays(el); };
    });
  }

  function chargerPays(){
    appeler('config:pays:donnees').then(function(r){
      if (!r || !r.ok) return;      // la livraison reste utilisable sans le tableau
      PAYS = r;
      if (D && D.international) { if (ONG === 'pays') dessiner(); else dessinerOnglets(); }
    });
  }

  /* ⚠ UN ENREGISTREMENT ECHOUE REMET LA CASE COMME ELLE ETAIT. Laisser une case
     cochee qui n a pas ete enregistree ferait croire qu on livre la ou l on ne
     livre pas — sur un ecran qui decide ou l on vend, c est le pire des
     silences. */
  function exclurePays(el){
    if (RO) { el.checked = !el.checked; return; }
    var pays = el.getAttribute('data-pays');
    var etat = el.getAttribute('data-etat');
    var code = etat ? (pays + '-' + etat) : pays;   // exclusion par etat : « US-NY »
    var veut = el.checked;
    el.disabled = true;
    appeler('config:pays:exclure', [code, veut]).then(function(r){
      el.disabled = false;
      if (!r || !r.ok) { el.checked = !veut; dire(expliquer(r), 'err'); return; }
      PAYS = r;
      // Le compte change, et les États des États-Unis paraissent ou disparaissent.
      dessiner();
      /* Quatre phrases ENTIERES : un mot recolle a un fragment ne se traduit
         pas, il se devine — et pas dans toutes les langues. */
      dire(etat
        ? (veut ? '${T("État desservi.")}' : '${T("État retiré.")}')
        : (veut ? '${T("Pays desservi.")}' : '${T("Pays retiré.")}'), 'bon');
    });
  }

  function enregistrer(){
    if (RO || OCCUPE) return;
    var chk = function(id){ var e = document.getElementById(id); return !!(e && e.checked); };
    var val = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    OCCUPE = true; bsave.disabled = true; dire('${T("Enregistrement…")}');
    var saisie = { international: chk('f-intl'), shippingCost: val('f-cost'),
      freeThreshold: val('f-thr'), priorityCost: val('f-prio') };
    // Absent quand l international est eteint : le coeur garde alors la valeur enregistree.
    if (document.getElementById('f-thr-intl')) saisie.freeThresholdIntl = val('f-thr-intl');
    appeler('config:livraison:ecrire', [saisie]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) { D = r; RO = !r.peutModifier; dessiner(); dire('${T("Livraison enregistrée.")}', 'bon'); }
      else { bsave.disabled = RO; dire(expliquer(r), 'err'); }
    });
  }
  bsave.onclick = enregistrer;

  function charger(){
    dire('${T("Lecture…")}');
    appeler('config:livraison:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide m-' + ((r && r.motif) || 'echec') + '">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r; RO = !r.peutModifier; dessiner(); dire('');
      if (r.international) chargerPays();
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageLivraison };
