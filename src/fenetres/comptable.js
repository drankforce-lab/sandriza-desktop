'use strict';

/*
 * FENÊTRE « LIENS COMPTABLES » — NATIVE
 * =============================================================================
 * Deux choses, deux onglets : le LIEN DE L'EXERCICE qu'on remet au comptable
 * (état comptable complet, en lecture seule, chiffré, à durée limitée) et le
 * CARNET des comptables (nom, cabinet, courriel, téléphone, note).
 *
 * ⚠ LE DROIT SUPER-ADMINISTRATEUR VIT DANS LE CŒUR (Backups._comptable*), pas
 * ici : ce lien ouvre l'exercice ENTIER à un tiers du dehors. La fenêtre ne
 * décide d'aucun droit — elle DEMANDE et AFFICHE. Le refus revient en « droit »
 * et l'écran le dit.
 *
 * ⚠ LE MOT DE PASSE NE REVIENT JAMAIS. Le serveur n'en garde pas de copie en
 * clair — c'est lui qui déchiffre le rapport. Il sort une SEULE fois, à la
 * création, et la fenêtre le dit AVANT qu'on ferme la carte. Recharger la liste
 * ne le fera pas réapparaître.
 *
 * ⚠ UN SEUL LIEN POUR TOUT L'EXERCICE : révoqué d'un coup pour tous les
 * destinataires. Le registre garde qui l'a reçu.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit. Pas de ${ } non plus dans
 * l'IIFE — concaténation par + comme dans liens.js.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, JS_BROUILLON, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('comptable');

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
/* Aucune glissiere (2026-10-12) : chaque liste se pagine dans la hauteur qui
   reste (data-pages, JS_PAGES du socle). */
.corps{flex:1 1 auto;min-height:0;overflow:hidden}
/* ── LA GRAMMAIRE DE LA COMPTABILITE (2026-10-16, esquisse Comptable.dc) ──
   Tete : titre, onglets segmentes, resume, gestes (#actions, rempli par la vue).
   Corps (.cx) : quatre chiffres, puis deux moities — les liens (ou le carnet) a
   gauche, le formulaire ouvert ou les exercices a droite. */
.cx>.sz-pagee,.cx-deux>.sz-pagee{flex:1 1 0;min-height:0}
.cx-deux{grid-template-rows:minmax(0,1fr)}
.cx-col{display:flex;flex-direction:column;gap:.9rem;min-height:0;min-width:0;overflow:hidden}
.cx-col>.cx-carte{flex:0 1 auto}
.cx-liste{display:flex;flex-direction:column;gap:.6rem}
.cx-tuile .t1{display:flex;align-items:center;gap:.6rem;min-width:0}
.cx-tuile .t1 b{font-size:.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cx-tuile .t1 .cx-sub{margin-left:auto;white-space:nowrap}
.cx-val{display:block;margin-top:.2rem;padding:.38rem .6rem;border-radius:8px;background:var(--f-champ);
  border:1px solid var(--sz-bord);font-family:ui-monospace,Consolas,monospace;font-size:.76rem;color:var(--tx);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cx-gestes{display:flex;align-items:center;gap:.5rem}
.cx-gestes .droite{margin-left:auto;display:flex;gap:.5rem}
.cx-annees{display:flex;gap:.5rem;flex-wrap:wrap}
details.cx-det>summary{list-style:none;cursor:pointer;display:inline-flex}
details.cx-det>summary::-webkit-details-marker{display:none}
details.cx-det>.cx-sub{margin:.4rem 0 0 .2rem}
td.r{text-align:right;white-space:nowrap}
label{display:block;font-size:.73rem;color:var(--tx2);margin:.5rem 0 .18rem}
input,select,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.34rem .5rem;width:100%}
textarea{resize:vertical;min-height:2.6rem}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.34rem .6rem;cursor:pointer;width:auto}
input:focus,select:focus,textarea:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
button.mini{font-size:.72rem;padding:.16rem .45rem}
button.dgr{border-color:rgba(248,113,113,.5);color:var(--tx-err2)}
.duo{display:flex;gap:.65rem;flex-wrap:wrap}
.duo>div{flex:1 1 10rem;min-width:0}
.barreoutils{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center}
table{width:100%;border-collapse:collapse;font-size:.79rem}
thead th{text-align:left;padding:.22rem .35rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.3rem .35rem;border-top:1px solid var(--v055);vertical-align:top}
tbody tr:hover td{background:var(--v03)}
.dt{font-size:.7rem;color:var(--tx2)}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.74rem}
.pill{display:inline-block;font-size:.6875rem;padding:.05rem .45rem;border-radius:99px;white-space:nowrap;font-weight:700}
.pill.actif{background:rgba(34,197,94,.15);color:var(--tx-ok)}
.pill.expire{background:rgba(148,163,184,.18);color:var(--tx-gris2)}
.pill.g{background:rgba(148,163,184,.14);color:var(--tx-94a3b8);font-weight:600}
.vide{padding:1.1rem .6rem;text-align:center;color:var(--tx2);font-size:.82rem}
.neuf{border:1px solid rgba(var(--or-rgb),.5);background:rgba(var(--or-rgb),.09)}
.neuf input{background:var(--f-pied);font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
.neuf .gros{font-family:ui-monospace,Consolas,monospace;font-size:1.15rem;letter-spacing:.12em;
  color:var(--tx-or2);font-weight:700}
/* Les destinataires du carnet : une boite bornee, paginee par rangees (2026-10-12). */
.choix{display:flex;flex-wrap:wrap;gap:.35rem .9rem;margin:.2rem 0 0;max-height:5.6rem}
.choix label{display:flex;align-items:center;gap:.35rem;color:var(--tx);font-size:.78rem;margin:.1rem 0}
.choix input{width:auto;margin:0}
.aide{font-size:.71rem;color:var(--tx2);margin:.3rem 0 0}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète.
 * @param {string} ouverture '' (les exercices), 'nouveau' (formulaire ouvert), 'carnet'
 */
function pageComptable(ouverture) {
  const dep = JSON.stringify(String(ouverture || ''));
  return `${TETE()}
<title>${T("Liens comptables — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.acctlink}</span><h1>${T("Liens comptables")}</h1>
  <div class="ed-seg" role="tablist">
    <button id="o-partages" class="on">${T("Exercices partagés")}</button>
    <button id="o-carnet">${T("Carnet des comptables")}</button>
  </div>
  <span class="cx-resume" id="sous"></span>
  <div class="cx-actions" id="actions"></div></div>
<div class="corps cx" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('comptable')}${JS_BROUILLON()}
  var corps = document.getElementById('corps');
  var sous  = document.getElementById('sous');
  var actions = document.getElementById('actions');
  var DEPART = ${dep};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Seul un super-administrateur peut remettre l’exercice à un comptable.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var base = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
    return base + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  var VUE = (DEPART === 'carnet') ? 'carnet' : 'partages';
  var ETAT = { annees: [], annee: 0, contacts: [], partages: [],
               neuf: null, formulaire: (DEPART === 'nouveau'),
               contactForm: false, edition: '', avert: '' };
  var ARME_REV = '';   // token de partage a revoquer
  var ARME_CT  = '';   // courriel de contact a retirer

  function quand(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return esc(iso);
    return d.toLocaleString('${LIEU()}', { dateStyle: 'medium', timeStyle: 'short' });
  }
  function jour(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return esc(iso);
    return d.toLocaleDateString('${LIEU()}', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  // Les initiales de l avatar du carnet (Julie Bergeron -> JB).
  function initiales(nom){
    var m = String(nom || '').split('@')[0].split(' ').filter(function(x){ return x; });
    return ((m[0] || '?').charAt(0) + (m.length > 1 ? m[m.length - 1].charAt(0) : '')).toUpperCase();
  }
  function copierChamp(champ, bouton){
    champ.select();
    // execCommand ET NON navigator.clipboard : la fenetre est chargee en data:,
    // son origine est nulle, donc l API moderne du presse-papiers y est refusee.
    var fait = false;
    try { fait = document.execCommand('copy'); } catch (e) { fait = false; }
    bouton.textContent = fait ? '${T("✓ Copié")}' : 'Ctrl+C';
    setTimeout(function(){ bouton.textContent = '${T("Copier")}'; }, 2500);
  }

  // ════════════════════════════════════════════════════════════════════════
  // VUE « EXERCICES PARTAGÉS »
  // ════════════════════════════════════════════════════════════════════════
  /* ══ LA GRAMMAIRE DE LA COMPTABILITE (2026-10-16, esquisse Comptable.dc) ══
     Quatre chiffres tires de comptable:donnees (rien d autre), les liens en
     CARTES (.cx-tuile) au lieu d un tableau, le formulaire ouvert dans la moitie
     droite. Crochets gardes : #b-nouveau, #b-recharger (montes dans la tete),
     data-copier, data-revoquer, data-pages="comptable-partages". */
  function kpi(lib, val, sous, ton){
    return '<div class="cx-kpi' + (ton ? ' ' + ton : '') + '"><span>' + lib + '</span><b>' + val
      + '</b><small>' + sous + '</small></div>';
  }
  function bandeau(){
    var nExp = ETAT.partages.filter(function(p){ return p.expire; }).length;
    var nAct = ETAT.partages.length - nExp;
    var an = ETAT.annees || [];
    return szTuiles('<div class="cx-kpis">'
      + kpi('${T("Liens actifs")}', nAct, '${T("le comptable peut ouvrir l’exercice")}', nAct ? 'ok' : '')
      + kpi('${T("Expirés")}', nExp, '${T("n’ouvrent plus rien")}', '')
      + kpi('${T("Comptables au carnet")}', ETAT.contacts.length, '${T("destinataires possibles d’un lien")}', '')
      + kpi('${T("Exercices disponibles")}', an.length,
          an.length ? (esc(an[an.length - 1]) + ' – ' + esc(an[0])) : '—', '')
      + '</div>');
  }
  /* Le registre distant muet : une PASTILLE, le detail au clic (rien n est efface). */
  function avertissement(){
    if (!ETAT.avert) return '';
    return '<div class="cx-barre"><details class="cx-det"><summary class="cx-averti"><span><b>${T("Registre des liens injoignable")}</b>'
      + ' ${T("· détail")}</span></summary>'
      + '<div class="cx-sub">${T("Le carnet est affiché, mais le registre des liens distants n’a pas répondu : ")}'
      + esc(ETAT.avert) + '</div></details></div>';
  }
  function carteExercices(){
    var an = ETAT.annees || [];
    return '<div class="cx-carte"><h2>${T("Exercices disponibles")}</h2>'
      + (an.length
          ? '<div class="cx-annees">' + an.map(function(y){
              return '<span class="rf-pill' + (y === ETAT.annee ? ' bleu' : '') + '">' + esc(y) + '</span>';
            }).join('') + '</div>'
          : '<div class="vide">—</div>')
      + '<div class="cx-sub">${T("Un seul lien pour tout l’exercice : le révoquer le coupe pour tous ses destinataires.")}</div>'
      + '<div class="cx-sub">${T("Réservé au super-administrateur.")}</div>'
      + '</div>';
  }
  function tuilePartage(p){
    return '<div class="cx-tuile' + (p.expire ? '' : ' ok') + '">'
      + '<div class="t1"><b>' + esc(p.label || p.periode || '—') + '</b>'
      + '<span class="rf-pill ' + (p.expire ? '' : 'vert') + '">' + (p.expire ? '${T("Expiré")}' : '${T("Actif")}') + '</span>'
      + '<span class="cx-sub">${T("Créé")} ' + jour(p.creeLe) + ' · ${T("Échéance")} ' + jour(p.expireLe) + '</span></div>'
      + (p.url ? '<div><span class="cx-sub">${T("Adresse à transmettre")}</span><span class="cx-val">' + esc(p.url) + '</span></div>' : '')
      + '<div class="cx-sub">' + (p.destinataire ? ('${T("Envoyé à")} ' + esc(p.destinataire)) : '${T("Aucun destinataire enregistré")}') + '</div>'
      + '<div class="cx-gestes">'
        + '<button class="mini" data-copier="' + esc(p.url) + '" title="${T("Copier le lien pour le comptable")}">${T("Copier le lien")}</button>'
        + '<span class="droite"><button class="mini dgr" data-revoquer="' + esc(p.token) + '">${T("Révoquer")}</button></span>'
      + '</div></div>';
  }

  /* ⚠ LA SAISIE SURVIT AUX REDESSINS (2026-10-25, audit). << Recharger >>, un
     aller-retour d onglet ou une revocation redessinent tout, et les champs
     repartaient de ETAT (ou vides) : une fiche de comptable ou un << Nouveau
     lien >> a moitie rempli etait vide en silence. On ramasse les champs avant
     chaque dessin et on les repose apres. Ouvrir un formulaire (nouveau,
     modifier) oublie la saisie precedente : elle appartenait a un autre. */
  var SAISIE_IDS = ['ct-name', 'ct-firm', 'ct-email', 'ct-phone', 'ct-note', 'f-annee', 'f-duree', 'f-manuel'];
  var SAISIE = {}, SAISIE_SAUTER = false;
  function oublierSaisie(){ SAISIE = {}; SAISIE_SAUTER = true; }
  function garderSaisie(){
    if (SAISIE_SAUTER) { SAISIE_SAUTER = false; return; }
    SAISIE_IDS.forEach(function(id){ var el = document.getElementById(id); if (el) SAISIE[id] = el.value; });
    if (document.getElementById('f-creer')) {
      SAISIE.__rcpt = [];
      Array.prototype.forEach.call(corps.querySelectorAll('input.rcpt:checked'), function(x){ SAISIE.__rcpt.push(x.value); });
    }
  }
  function reposerSaisie(){
    SAISIE_IDS.forEach(function(id){ var el = document.getElementById(id); if (el && SAISIE[id] !== undefined) el.value = SAISIE[id]; });
    if (SAISIE.__rcpt) Array.prototype.forEach.call(corps.querySelectorAll('input.rcpt'), function(x){ x.checked = SAISIE.__rcpt.indexOf(x.value) >= 0; });
  }

  function dessinerPartages(){
    garderSaisie();
    var h = [];
    // Le geste principal dans la tete, a DROITE, comme dans toute la comptabilite.
    actions.innerHTML = '<button id="b-recharger">${T("Recharger")}</button>'
      + '<button class="prim" id="b-nouveau">${T("+ Nouveau lien de l’exercice")}</button>';

    h.push(bandeau());
    h.push(avertissement());

    h.push('<div class="cx-deux moitie">');
    // La liste en PAGES mesurees, jamais de glissiere (JS_PAGES du socle, 2026-10-12).
    h.push('<div class="cx-carte sz-pagee"><h2>${T("Liens de l’exercice en cours")}'
      + ' <span class="cx-sub">${T("un lien par exercice, à durée limitée")}</span></h2>');
    if (!ETAT.partages.length) {
      h.push('<div class="vide">${T("Aucun exercice n’a encore été partagé.")}</div>');
    } else {
      h.push('<div class="cx-pages cx-liste" data-pages="comptable-partages">');
      ETAT.partages.forEach(function(p){ h.push(tuilePartage(p)); });
      h.push('</div>');
    }
    h.push('</div>');

    h.push('<div class="cx-col">');
    if (ETAT.neuf) h.push(carteNeuf());
    if (ETAT.formulaire) h.push(formulaire());
    if (!ETAT.neuf && !ETAT.formulaire) h.push(carteExercices());
    h.push('</div></div>');

    corps.innerHTML = h.join('');
    reposerSaisie();
    brancherPartages();
  }

  function carteNeuf(){
    var n = ETAT.neuf;
    var envoyes = (n.envoyes || []);
    var rates = (n.rates || []);
    return '<div class="cx-carte neuf"><h2>${T("Lien de l’exercice ")}' + esc(String(n.annee || '')) + '</h2>'
      + '<label for="n-url">${T("Adresse à remettre au comptable")}</label>'
      + '<input id="n-url" type="text" readonly value="' + esc(n.url) + '">'
      + '<div class="barreoutils" style="margin-top:.4rem"><button id="n-copier"><span class="ic">📋</span> ${T("Copier")}</button>'
      + '<span class="aide">${T("Échéance le ")}' + jour(n.expireLe) + '</span></div>'
      + '<label style="margin-top:.6rem">${T("Mot de passe d’ouverture")}</label>'
      + '<div class="gros" id="n-mdp-vue">' + esc(n.motDePasse || '') + '</div>'
      /* ⚠ CE CHAMP N EST PAS CACHE, IL EST SEULEMENT HORS DE L ECRAN. Il ne sert
         qu a la copie dans le presse-papiers, et left:-9999px — contrairement a
         display:none — laisse le champ ATTEIGNABLE AU CLAVIER : on tabulait
         dans un champ invisible qui repete le mot de passe deja affiche juste
         au-dessus. aria-hidden le retire du lecteur d ecran, tabindex -1 du
         parcours de tabulation. */
      + '<input id="n-mdp" type="text" readonly aria-hidden="true" tabindex="-1" value="' + esc(n.motDePasse || '') + '" style="position:absolute;left:-9999px">'
      + '<div class="barreoutils" style="margin-top:.4rem">'
      + '<button id="n-copier-mdp"><span class="ic">📋</span> ${T("Copier le mot de passe")}</button></div>'
      + '<p class="aide"><strong>${T("Il ne sera plus jamais affiché")}</strong>${T(" — le serveur n’en garde ")}'
      + '${T("aucune copie en clair, c’est lui qui déchiffre le rapport. Notez-le ou transmettez-le ")}'
      + '${T("maintenant, de préférence par un autre canal que le lien.")}</p>'
      + (envoyes.length
          ? '<p class="aide">${T("Courriel envoyé à : ")}' + esc(envoyes.join(', ')) + '.</p>' : '')
      + (rates.length
          ? '<p class="aide" style="color:var(--tx-jaune)">${T("Envoi refusé pour : ")}' + esc(rates.join(', ')) + '.</p>' : '')
      + '<div class="barreoutils" style="margin-top:.5rem">'
      + '<span class="droite"><button id="n-fermer">${T("Fermer")}</button></span></div>'
      + '</div>';
  }

  function formulaire(){
    var opAns = ETAT.annees.map(function(y){
      return '<option value="' + y + '"' + (y === ETAT.annee ? ' selected' : '') + '>' + y + '</option>';
    }).join('');
    var carnet = ETAT.contacts.length
      ? '<div class="choix" data-pages="comptable-destinataires">' + ETAT.contacts.map(function(c){
          return '<label><input type="checkbox" class="rcpt" value="' + esc(c.email) + '">'
            + esc(c.name || c.email) + (c.firm ? ' <span class="dt">(' + esc(c.firm) + ')</span>' : '') + '</label>';
        }).join('') + '</div>'
      : '<p class="aide">${T("Le carnet est vide — ajoutez un comptable dans l’onglet Carnet, ou saisissez ")}'
        + '${T("une adresse ci-dessous.")}</p>';
    return '<div class="cx-carte"><h2>${T("Nouveau lien de l’exercice")}</h2>'
      + '<div class="duo">'
      + '<div><label for="f-annee">${T("Exercice")}</label><select id="f-annee">' + opAns + '</select></div>'
      + '<div><label for="f-duree">${T("Validité")}</label><select id="f-duree">'
      + '<option value="24">${T("24 heures")}</option><option value="72">${T("3 jours")}</option>'
      + '<option value="168" selected>${T("7 jours")}</option><option value="336">${T("14 jours")}</option>'
      + '<option value="720">${T("30 jours")}</option></select></div>'
      + '</div>'
      + '<label style="margin-top:.5rem">${T("Destinataires (dans le carnet)")}</label>'
      + carnet
      + '<label for="f-manuel" style="margin-top:.5rem">${T("Ajouter une adresse")}</label>'
      + '<input id="f-manuel" type="email" placeholder="${T("facultatif — comptable@cabinet.com")}">'
      + '<p class="aide">${T("Un mot de passe d’ouverture est engendré au hasard : il ne sera affiché ")}'
      + '${T("qu’une seule fois, juste après la création. Le lien peut être créé sans destinataire (à ")}'
      + '${T("remettre à la main), ou envoyé par courriel à ceux qui sont choisis.")}</p>'
      + '<div class="barreoutils" style="margin-top:.5rem">'
      + '<button class="prim" id="f-creer">${T("Fabriquer")}</button>'
      + '<span class="droite"><button id="f-annuler">${T("Annuler")}</button></span></div>'
      + '</div>';
  }

  function brancherPartages(){
    var bn = document.getElementById('b-nouveau');
    if (bn) bn.onclick = function(){ oublierSaisie(); ETAT.formulaire = !ETAT.formulaire; dessinerPartages(); };
    var br = document.getElementById('b-recharger');
    if (br) br.onclick = function(){ charger(true); };

    var fc = document.getElementById('f-creer');
    if (fc) fc.onclick = creer;
    var fa = document.getElementById('f-annuler');
    if (fa) fa.onclick = function(){ ETAT.formulaire = false; dessinerPartages(); };

    var nc = document.getElementById('n-copier');
    if (nc) nc.onclick = function(){ copierChamp(document.getElementById('n-url'), nc); };
    var nm = document.getElementById('n-copier-mdp');
    if (nm) nm.onclick = function(){ copierChamp(document.getElementById('n-mdp'), nm); };
    var nf = document.getElementById('n-fermer');
    if (nf) nf.onclick = function(){ ETAT.neuf = null; dessinerPartages(); };

    Array.prototype.forEach.call(corps.querySelectorAll('[data-copier]'), function(b){
      b.onclick = function(){
        var z = document.createElement('input');
        z.value = b.getAttribute('data-copier');
        document.body.appendChild(z);
        z.select();
        var fait = false;
        try { fait = document.execCommand('copy'); } catch (e) { fait = false; }
        z.remove();
        dire(fait ? '${T("Adresse copiée.")}' : '${T("Copie refusée par le système.")}', fait ? 'bon' : 'err');
      };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-revoquer]'), function(b){
      b.onclick = function(){ revoquer(b.getAttribute('data-revoquer')); };
    });
  }

  function creer(){
    var an = document.getElementById('f-annee');
    var du = document.getElementById('f-duree');
    var man = document.getElementById('f-manuel');
    var b = document.getElementById('f-creer');
    var dest = [];
    Array.prototype.forEach.call(corps.querySelectorAll('input.rcpt:checked'), function(x){ dest.push(x.value); });
    /* (2026-10-25, audit) Une adresse mal formee etait ecartee EN SILENCE par le
       coeur : le lien partait sans elle et rien ne la nommait. On la refuse ici,
       avec la meme regle que le Gardien, avant de fabriquer quoi que ce soit. */
    if (man && man.value.trim()) {
      var mv = man.value.trim();
      if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(mv)) { dire('${T("Courriel invalide : ")}' + mv, 'err'); man.focus(); return; }
      dest.push(mv);
    }
    b.disabled = true;
    dire('${T("Fabrication du lien de l’exercice…")}');
    appeler('comptable:creer', [{
      annee: an ? parseInt(an.value, 10) : 0,
      heures: du ? parseInt(du.value, 10) : 168,
      destinataires: dest
    }]).then(function(r){
      b.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      ETAT.neuf = { url: r.url, motDePasse: r.motDePasse, expireLe: r.expireLe,
                    annee: r.annee, envoyes: r.envoyes || [], rates: r.rates || [] };
      ETAT.formulaire = false;
      dire('${T("Lien fabriqué.")}' + ((r.rates && r.rates.length) ? ' ${T("Certains courriels ont été refusés.")}' : ''),
        (r.rates && r.rates.length) ? 'att' : 'bon');
      charger(false);
    });
  }

  /* ⚠ PAS DE confirm() : il bloque le processus, et une fenetre chargee en
     data: n a pas de boite de dialogue du site. La confirmation passe par la
     boite a part du socle (szConfirmer, 2026-10-15) ; confirme, on arme et on
     rejoue le geste. */
  function revoquer(token){
    if (ARME_REV !== token) {
      var pR = (ETAT.partages || []).filter(function(x){ return x.token === token; })[0] || {};
      szConfirmer({ danger: true, titre: '${T("Révoquer le lien de partage")}',
        texte: '${T("Le lien de partage")}' + ' « ' + (pR.label || pR.periode || '—') + ' » ' + '${T("cessera immédiatement de fonctionner pour tous ses destinataires. Les documents comptables ne seront plus accessibles par ce lien. Cette action est irréversible.")}',
        details: [['${T("Destinataire")}', pR.destinataire || '—'], ['${T("Échéance")}', pR.expireLe ? jour(pR.expireLe) : '—']],
        oui: '${T("Révoquer le lien")}' }).then(function(ok){ if (ok) { ARME_REV = token; revoquer(token); } });
      return;
    }
    ARME_REV = '';
    dire('${T("Révocation…")}');
    appeler('comptable:revoquer', [token]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('${T("Lien révoqué.")}', 'bon');
      charger(false);
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // VUE « CARNET DES COMPTABLES »
  // ════════════════════════════════════════════════════════════════════════
  function dessinerCarnet(){
    garderSaisie();
    var h = [];
    // Les gestes dans la tete, le principal a DROITE (grammaire du 2026-10-16).
    actions.innerHTML = '<button id="c-recharger">${T("Recharger")}</button>'
      + '<button class="prim" id="c-ajouter">${T("+ Ajouter un comptable")}</button>';

    h.push(bandeau());
    h.push(avertissement());

    h.push('<div class="cx-deux moitie">');
    // Le carnet en PAGES mesurees, jamais de glissiere (2026-10-12).
    h.push('<div class="cx-carte sz-pagee"><h2>${T("Carnet")}</h2>');
    if (!ETAT.contacts.length) {
      h.push('<div class="vide">${T("Le carnet est vide.")}</div>');
    } else {
      h.push('<div class="cx-pages" data-pages="comptable-carnet"><table><thead><tr><th>${T("Nom")}</th><th>${T("Courriel")}</th>'
        + '<th></th></tr></thead><tbody>');
      ETAT.contacts.forEach(function(c){
        var l2 = [c.firm, c.note].filter(function(x){ return x; }).map(esc).join(' · ');
        h.push('<tr>'
          + '<td><div class="cx-qui"><span class="cx-av">' + esc(initiales(c.name || c.email)) + '</span>'
            + '<div><b>' + esc(c.name || '—') + '</b>' + (l2 ? '<span class="cx-l2">' + l2 + '</span>' : '') + '</div></div></td>'
          + '<td><span class="mono">' + esc(c.email) + '</span>'
            + (c.phone ? '<span class="cx-l2">' + esc(c.phone) + '</span>' : '') + '</td>'
          + '<td class="r">'
            + '<button class="mini" data-modifier="' + esc(c.email) + '">${T("Modifier")}</button> '
            + '<button class="mini dgr" data-retirer="' + esc(c.email) + '">'
            + '${T("Retirer")}' + '</button>'
          + '</td></tr>');
      });
      h.push('</tbody></table></div>');
    }
    h.push('</div>');

    h.push('<div class="cx-col">');
    h.push(ETAT.contactForm ? contactForm() : carteExercices());
    h.push('</div></div>');

    corps.innerHTML = h.join('');
    reposerSaisie();
    brancherCarnet();
  }

  function contactForm(){
    var c = null;
    if (ETAT.edition) {
      for (var i = 0; i < ETAT.contacts.length; i++) {
        if (ETAT.contacts[i].email === ETAT.edition) { c = ETAT.contacts[i]; break; }
      }
    }
    c = c || { name: '', firm: '', email: '', phone: '', note: '' };
    var fige = ETAT.edition ? ' readonly' : '';
    return '<div class="cx-carte"><h2>' + (ETAT.edition ? '${T("Modifier le comptable")}' : '${T("Nouveau comptable")}') + '</h2>'
      + '<div class="duo">'
      + '<div><label for="ct-name">${T("Nom")}</label><input id="ct-name" type="text" value="' + esc(c.name) + '"></div>'
      + '<div><label for="ct-firm">${T("Cabinet")}</label><input id="ct-firm" type="text" value="' + esc(c.firm) + '"></div>'
      + '</div>'
      + '<div class="duo">'
      + '<div><label for="ct-email">${T("Courriel")}</label><input id="ct-email" type="email" value="' + esc(c.email) + '"' + fige + '></div>'
      + '<div><label for="ct-phone">${T("Téléphone")}</label><input id="ct-phone" type="tel" value="' + esc(c.phone) + '"></div>'
      + '</div>'
      // rows="3" POSÉ LE 2026-08-21 : sans lui, cette zone tombait sur le
      // plancher partagé de la feuille de style (textarea{min-height:2.6rem}),
      // soit deux lignes — on écrivait une note de contact dans une fente. C'est
      // la SEULE zone de texte des fenêtres où personne n'avait choisi : partout
      // ailleurs le rows est explicite, donc voulu.
      + '<label for="ct-note">${T("Note")}</label><textarea id="ct-note" rows="3">' + esc(c.note) + '</textarea>'
      + (ETAT.edition ? '<p class="aide">${T("Le courriel est la clé du contact : pour le changer, retirez ")}'
          + '${T("ce contact et créez-en un nouveau.")}</p>' : '')
      + '<div class="barreoutils" style="margin-top:.5rem">'
      + '<button class="prim" id="ct-enregistrer">${T("Enregistrer")}</button>'
      + '<span class="droite"><button id="ct-annuler">${T("Annuler")}</button></span></div>'
      + '</div>';
  }

  /* == LE BROUILLON DU CARNET DES COMPTABLES ================================
     Nom, cabinet, courriel, telephone, note : cinq champs recopies depuis une
     carte d'affaires ou un courriel. Le formulaire se replie au moindre clic sur
     << Ajouter un comptable >> (c'est une bascule) et sur << Annuler >>.
     ⚠ UNE CLE PAR FICHE : ETAT.edition porte l'identifiant en modification, vide
     en creation. */
  var BR_CHAMPS = ['ct-name', 'ct-firm', 'ct-email', 'ct-phone', 'ct-note'];
  szBrouillonBrancher({
    portee: 'comptable-carnet',
    libelle: '${T("Une fiche de comptable")}',
    ttlMin: 720,
    cle: function(){ return (ETAT && ETAT.edition) ? ('c:' + ETAT.edition) : '__new__'; },
    actif: function(){ return !!(ETAT && ETAT.contactForm) && !!document.getElementById('ct-name'); },
    valeurs: function(){ return szBrouillonDuDom(BR_CHAMPS, []); },
    rempli: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, []); if (!v) return false;
      return szBrouillonQuelqueChose(v, BR_CHAMPS);
    },
    remplir: function(v){ szBrouillonAuDom(v); },
  });
  szBrouillonEcouter();

  function brancherCarnet(){
    var ba = document.getElementById('c-ajouter');
    /* ⚠ C'EST UNE BASCULE : le meme bouton ouvre ET replie. On ecrit donc avant de
       replier, et l'on propose apres avoir ouvert. */
    if (ba) ba.onclick = function(){
      if (ETAT.contactForm) szBrouillonMaintenant();
      oublierSaisie(); ETAT.edition = ''; ETAT.contactForm = !ETAT.contactForm;
      dessinerCarnet();
      if (ETAT.contactForm) szBrouillonProposer();
    };
    var brc = document.getElementById('c-recharger');
    if (brc) brc.onclick = function(){ charger(true); };

    var ce = document.getElementById('ct-enregistrer');
    if (ce) ce.onclick = enregistrerContact;
    var ca = document.getElementById('ct-annuler');
    if (ca) ca.onclick = function(){ szFermerBoite(function(){ ETAT.contactForm = false; ETAT.edition = ''; dessinerCarnet(); }); };

    Array.prototype.forEach.call(corps.querySelectorAll('[data-modifier]'), function(b){
      b.onclick = function(){
        oublierSaisie(); ETAT.edition = b.getAttribute('data-modifier');
        ETAT.contactForm = true;
        dessinerCarnet();
        szBrouillonProposer();
      };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-retirer]'), function(b){
      b.onclick = function(){ retirerContact(b.getAttribute('data-retirer')); };
    });
  }

  function enregistrerContact(){
    var b = document.getElementById('ct-enregistrer');
    var contact = {
      name:  (document.getElementById('ct-name')  || {}).value || '',
      firm:  (document.getElementById('ct-firm')  || {}).value || '',
      email: (document.getElementById('ct-email') || {}).value || '',
      phone: (document.getElementById('ct-phone') || {}).value || '',
      note:  (document.getElementById('ct-note')  || {}).value || ''
    };
    if (!contact.email.trim()) { dire('${T("Indiquez un courriel — c’est la clé du contact.")}', 'err'); return; }
    b.disabled = true;
    dire('${T("Enregistrement…")}');
    appeler('comptable:contact', [contact]).then(function(r){
      b.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      if (r.contacts) ETAT.contacts = r.contacts;
      /* Le brouillon meurt a l'enregistrement REUSSI, et seulement la : le garder
         ferait concurrence a la fiche enregistree. */
      szBrouillonJeter();
      ETAT.contactForm = false; ETAT.edition = '';
      dire('${T("Comptable enregistré.")}', 'bon');
      majSous();
      dessinerCarnet();
    });
  }

  function retirerContact(email){
    if (ARME_CT !== email) {
      var cR = (ETAT.contacts || []).filter(function(x){ return x.email === email; })[0] || {};
      szConfirmer({ danger: true, titre: '${T("Retirer le comptable du carnet")}',
        texte: '${T("Le comptable")}' + ' ' + (cR.name || email) + ' ' + '${T("sera retiré du carnet. Les liens de partage déjà envoyés restent actifs jusqu’à leur échéance ou leur révocation.")}',
        details: [['${T("Courriel")}', email]].concat(cR.firm ? [['${T("Cabinet")}', cR.firm]] : []),
        oui: '${T("Retirer du carnet")}' }).then(function(ok){ if (ok) { ARME_CT = email; retirerContact(email); } });
      return;
    }
    ARME_CT = '';
    dire('${T("Retrait…")}');
    appeler('comptable:contact-retirer', [email]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      if (r.contacts) ETAT.contacts = r.contacts;
      dire('${T("Comptable retiré du carnet.")}', 'bon');
      majSous();
      dessinerCarnet();
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  function marquerOnglets(){
    document.getElementById('o-partages').classList.toggle('on', VUE === 'partages');
    document.getElementById('o-carnet').classList.toggle('on', VUE === 'carnet');
  }
  document.getElementById('o-partages').onclick = function(){
    VUE = 'partages'; marquerOnglets(); dessinerPartages();
  };
  document.getElementById('o-carnet').onclick = function(){
    VUE = 'carnet'; marquerOnglets(); dessinerCarnet();
  };

  function majSous(){
    var actifs = ETAT.partages.filter(function(p){ return !p.expire; }).length;
    /* ⚠ Le singulier et le pluriel, chacun entier : coupes en morceaux, ils ne
       laissaient au poseur que des bouts de mots. */
    sous.textContent = actifs + (actifs > 1 ? '${T(" liens actifs")}' : '${T(" lien actif")}')
      + ' · ' + ETAT.contacts.length
      + (ETAT.contacts.length > 1 ? '${T(" comptables")}' : '${T(" comptable")}');
  }

  function redessiner(){
    if (VUE === 'carnet') dessinerCarnet(); else dessinerPartages();
  }

  function charger(dire_le){
    if (dire_le) dire('${T("Lecture…")}');
    appeler('comptable:donnees').then(function(r){
      if (!r.ok) {
        corps.innerHTML = '<div class="cx-carte"><div class="vide m-' + ((r && r.motif) || 'echec') + '">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      ETAT.annees = r.annees || [];
      ETAT.annee = r.annee || (ETAT.annees[0] || 0);
      ETAT.contacts = r.contacts || [];
      ETAT.partages = r.partages || [];
      ETAT.avert = r.avertissement || '';
      majSous();
      redessiner();
      if (dire_le) dire('');
    });
  }

  marquerOnglets();
  charger(true);
})();
</script></body></html>`;
}

module.exports = { pageComptable };
