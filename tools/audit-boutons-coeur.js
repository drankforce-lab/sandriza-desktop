/* ============================================================================
   audit-boutons-coeur.js — CHAQUE BOUTON, ACTIONNÉ ET OBSERVÉ (2026-10-15)
   ----------------------------------------------------------------------------
   ⚠ CE FICHIER N'EST PAS UN MODULE NODE : ce sont DEUX FRAGMENTS de page que
   `audit-boutons.js` découpe sur les marques « ==== PROLOGUE ==== » et
   « ==== EPILOGUE ==== », puis coud dans la page d'une fenêtre :
     · le PROLOGUE entre dans le <head>, AVANT le script de la fenêtre : faux
       pont qui ENREGISTRE chaque appel, capteurs d'exceptions, et neutralisation
       de ce qui sortirait de la page (confirm, prompt, open, presse-papier,
       sélecteur de fichier, téléchargement) — chacun NOTÉ, jamais exécuté ;
     · l'EPILOGUE entre avant le dernier </body>, APRÈS le script de la fenêtre :
       il attend que la page soit stable, puis, selon `?b=` :
         b = -1 → INVENTAIRE : la liste des boutons visibles et actifs, et le
                  bruit de fond (mutations sans aucun geste) ;
         b = i  → CLIC : remplace szConfirmer (accepte tout, note), clique le
                  bouton i, observe ~700 ms, rend ce qu'il a vu.
   Marques remplacées par le banc : __REPONSES__ (prologue), __NOM__, __SCEN__.
   ⚠ Pas d'accent grave nulle part dans ce fichier : il est collé dans des
   pages, et la leçon du gabarit de contraste vaut ici aussi.
   ============================================================================ */

/* ==== PROLOGUE ==== */
(function () {
  var REP = __REPONSES__;
  var EMP = REP.__emprunts || {}; delete REP.__emprunts;
  var A = window.__ab = { phase: 'charge', appels: [], natifs: [], hors: [], conf: [], err: [], errCharge: [] };
  function court(v) {
    var s;
    try { s = JSON.stringify(v); } catch (e) { s = '?'; }
    s = String(s === undefined ? '' : s);
    return s.length > 140 ? s.slice(0, 140) + '...' : s;
  }
  /* L'empreinte COMPLETE des arguments : court() les tronque, et deux
     enregistrements qui ne different qu'en fin d'objet passeraient pour egaux. */
  function empreinte(v) {
    var s; try { s = JSON.stringify(v); } catch (e) { s = '?'; }
    s = String(s === undefined ? '' : s);
    var h = 5381; for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36) + '.' + s.length;
  }
  function copie(v) { try { return JSON.parse(JSON.stringify(v)); } catch (e) { return v; } }
  function erreur(m) { (A.phase === 'charge' ? A.errCharge : A.err).push(String(m).slice(0, 300)); }
  window.__abErreur = erreur;
  window.addEventListener('error', function (e) {
    if (e && e.target && e.target !== window && e.target.tagName) return; // une image absente n'est pas une exception
    var m = (e && e.message) || String(e);
    if (e && e.lineno) m += ' (ligne ' + e.lineno + ')';
    erreur(m);
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason;
    erreur('promesse rejetée : ' + ((r && (r.stack || r.message)) ? String(r.message || r.stack) : String(r)));
  });
  function natif(nom, rendu) {
    return function () {
      A.natifs.push({ m: nom, phase: A.phase, args: court(Array.prototype.slice.call(arguments)) });
      return rendu;
    };
  }
  var base = {
    appeler: function (op) {
      var nom = String(op || '');
      var args = Array.prototype.slice.call(arguments, 1);
      var duJeu = Object.prototype.hasOwnProperty.call(REP, nom);
      var emprunt = !duJeu && Object.prototype.hasOwnProperty.call(EMP, nom);
      A.appels.push({ op: nom, jeu: duJeu ? true : (emprunt ? 'emprunt' : false), phase: A.phase, args: court(args), sig: empreinte(args) });
      return Promise.resolve(duJeu ? copie(REP[nom]) : (emprunt ? copie(EMP[nom]) : { ok: true }));
    },
    menuLabels: function () { return Promise.resolve(REP['__menuLabels'] || ['Fichier', 'Affichage', 'Aide']); },
    langue: function () { return Promise.resolve(REP['__langue'] || 'fr'); },
    langueEcrire: function (l) { return Promise.resolve(l); },
  };
  var natifs = {
    menuPanneau: undefined, menuPanneauFermer: undefined, fermer: undefined, brouillonSale: undefined,
    tuilesMasquer: undefined, detacher: false, ancrer: false, pleinEcran: false, imageLocale: null,
  };
  Object.keys(natifs).forEach(function (k) {
    var r = natifs[k];
    base[k] = natif(k, (r === undefined) ? undefined : Promise.resolve(r));
  });
  /* Toute autre méthode demandée au pont : notée, et rend une promesse vide.
     Sans ça, une méthode que ce fichier ne connaît pas encore ferait passer le
     bouton pour MUET ou pour une ERREUR qui ne viendrait que du banc. */
  try {
    window.szPont = new Proxy(base, {
      get: function (t, k) {
        if (typeof k !== 'string' || k === 'then' || k in t) return t[k];
        return natif(k, Promise.resolve(null));
      },
    });
  } catch (e) { window.szPont = base; }

  /* Ce qui sortirait de la page : NOTÉ, jamais exécuté. */
  function hors(quoi) { A.hors.push({ q: String(quoi).slice(0, 160), phase: A.phase }); }
  window.__abHors = hors;
  window.confirm = function (m) { hors('confirm : ' + m); return true; };
  window.prompt = function (m) { hors('prompt : ' + m); return ''; };
  window.alert = function (m) { hors('alert : ' + m); };
  window.open = function (u) { hors('window.open : ' + u); return null; };
  window.print = function () { hors('impression'); };
  window.close = function () { hors('window.close'); };
  try {
    var presse = {
      writeText: function (t) { hors('presse-papier : ' + String(t).slice(0, 60)); return Promise.resolve(); },
      write: function () { hors('presse-papier (riche)'); return Promise.resolve(); },
      readText: function () { hors('lecture du presse-papier'); return Promise.resolve(''); },
      read: function () { hors('lecture du presse-papier'); return Promise.resolve([]); },
    };
    Object.defineProperty(navigator, 'clipboard', { configurable: true, get: function () { return presse; } });
  } catch (e) {}
  try {
    var exec0 = document.execCommand;
    document.execCommand = function (c) {
      if (/^(copy|cut|paste)$/i.test(String(c))) { hors('execCommand ' + c); return true; }
      return exec0.apply(document, arguments);
    };
  } catch (e) {}
  try {
    var clicInput = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function () {
      if (String(this.type).toLowerCase() === 'file') { hors('sélecteur de fichier'); return; }
      return clicInput.apply(this, arguments);
    };
    HTMLInputElement.prototype.showPicker = function () { hors('sélecteur (showPicker) ' + this.type); };
    var clicA = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      var h = this.getAttribute('href') || '';
      if (this.hasAttribute('download') || /^(blob:|data:)/.test(h)) { hors('téléchargement ' + (this.getAttribute('download') || '')); return; }
      if (h && !/^#/.test(h) && !/^javascript:/i.test(h)) { hors('lien : ' + h.slice(0, 80)); return; }
      return clicA.apply(this, arguments);
    };
    HTMLFormElement.prototype.submit = function () { hors('form.submit()'); };
  } catch (e) {}
  try { window.showOpenFilePicker = function () { hors('sélecteur de fichier (showOpenFilePicker)'); return Promise.reject(new DOMException('abandon', 'AbortError')); }; } catch (e) {}
  try { window.showSaveFilePicker = function () { hors('enregistrer sous (showSaveFilePicker)'); return Promise.reject(new DOMException('abandon', 'AbortError')); }; } catch (e) {}
})();

/* ==== EPILOGUE ==== */
(function () {
  var A = window.__ab;
  var NOM = __NOM__, SCEN = __SCEN__;
  var B = -1, MAXB = 40, OBS = 700, MODE = '', S = -1;
  try {
    var q = new URLSearchParams(location.search);
    B = Number(q.get('b')); if (isNaN(B)) B = -1;
    MAXB = Number(q.get('max')) || 40;
    OBS = Number(q.get('obs')) || 700;
    MODE = q.get('m') || '';
    S = q.has('s') ? Number(q.get('s')) : -1; if (isNaN(S)) S = -1;
  } catch (e) {}
  var envoye = false;
  function rendre(x) {
    if (envoye) return; envoye = true;
    x.nom = NOM; x.scen = SCEN; x.b = B;
    try { parent.postMessage({ ab: 1, x: x }, '*'); } catch (e) {}
  }

  var SEL = 'button, [role=button], [role=tab], [role=menuitem], a[href], input[type=button], input[type=submit], input[type=reset], '
    + 'input[type=checkbox], input[type=radio], summary, [onclick], [data-onglet], [data-vue], [data-act], [data-ouvrir], [data-tuile]';

  function visible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') return false;
    if (Number(cs.opacity) === 0) return false;
    return true;
  }
  function actif(el) {
    if (el.disabled) return false;
    if (el.getAttribute('aria-disabled') === 'true') return false;
    if (el.closest('fieldset[disabled]')) return false;
    if (el.closest('[inert]')) return false;
    return true;
  }
  function libelle(el) {
    var t = String(el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!t) t = el.getAttribute('aria-label') || el.getAttribute('title') || el.value || '';
    if (el.type === 'checkbox' || el.type === 'radio') {
      var lab = el.id && document.querySelector('label[for="' + el.id + '"]');
      lab = lab || el.closest('label');
      t = '[' + el.type + '] ' + (lab ? String(lab.innerText || lab.textContent || '').replace(/\s+/g, ' ').trim() : t);
    }
    t = String(t).replace(/\s+/g, ' ').trim();
    return t.length > 60 ? t.slice(0, 60) + '…' : t;
  }
  function signature(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    var c = String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (c.length) s += '.' + c.join('.');
    var d = [];
    for (var i = 0; i < el.attributes.length && d.length < 2; i++) {
      var a = el.attributes[i];
      if (a.name.indexOf('data-') === 0) d.push(a.name + (a.value && a.value.length < 24 ? '=' + a.value : ''));
    }
    if (d.length) s += '[' + d.join('][') + ']';
    return s;
  }
  /* Le bouton est-il ATTEIGNABLE ? Une surcouche (boîte, voile, résumé) peut le
     couvrir : visible en dessous, il ne reçoit aucun clic de l'usager. On ne
     juge que ce qui est dans la fenêtre ; plus bas, on ne sait pas, on garde. */
  function couvert(el) {
    var r = el.getBoundingClientRect();
    var x = r.left + Math.min(r.width / 2, 12), y = r.top + r.height / 2;
    if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false;
    var h = document.elementFromPoint(x, y);
    if (!h || h === el || el.contains(h)) return false;
    if (h.tagName === 'LABEL' && (h.contains(el) || (el.id && h.htmlFor === el.id))) return false;
    if (el.labels) for (var i = 0; i < el.labels.length; i++) if (el.labels[i].contains(h)) return false;
    return true;
  }
  var COUVERTS = 0, COUV_EX = [];
  function boutons() {
    var tous = Array.prototype.slice.call(document.querySelectorAll(SEL));
    var out = [];
    for (var i = 0; i < tous.length; i++) {
      var el = tous[i];
      if (out.indexOf(el) >= 0) continue;
      if (!visible(el) || !actif(el)) continue;
      if (couvert(el)) { COUVERTS++; if (COUV_EX.length < 3) { var r0 = el.getBoundingClientRect(); var h0 = document.elementFromPoint(r0.left + Math.min(r0.width / 2, 12), r0.top + r0.height / 2); COUV_EX.push(libelle(el) + ' sous ' + (h0 ? signature(h0) : '?')); } continue; }
      // Un [data-*] ou un [onclick] posé DANS un bouton déjà retenu : c'est le même geste.
      var p = el.parentElement, dedans = false;
      while (p) { if (out.indexOf(p) >= 0 && /^(BUTTON|A)$/.test(p.tagName)) { dedans = true; break; } p = p.parentElement; }
      if (dedans) continue;
      out.push(el);
    }
    return out;
  }

  /* La page est-elle POSÉE ? On attend 250 ms sans aucune mutation (2,5 s au plus). */
  function stable(cb) {
    var t0 = Date.now(), der = Date.now();
    var mo = new MutationObserver(function () { der = Date.now(); });
    try { mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true }); } catch (e) {}
    (function v() {
      var n = Date.now();
      if (n - der >= 250 || n - t0 > 2500) { mo.disconnect(); cb(n - t0 > 2500); }
      else setTimeout(v, 50);
    })();
  }
  function couperAnimations() {
    try { var as = document.getAnimations ? document.getAnimations() : []; for (var i = 0; i < as.length; i++) { try { as[i].finish(); } catch (e) {} } } catch (e) {}
    try {
      var st = document.createElement('style');
      st.setAttribute('data-ab', '1');
      st.textContent = '*,*::before,*::after{animation-name:none!important;transition:none!important}';
      document.head.appendChild(st);
    } catch (e) {}
  }
  /* Un chemin STABLE pour reconnaître la même mutation d'un clic à l'autre : la
     classe d'un élément peut justement être ce qui change. */
  function chemin(n) {
    var el = n && n.nodeType === 1 ? n : (n && n.parentElement);
    var out = [], k = 0;
    while (el && el !== document.documentElement && k < 6) {
      if (el.id) { out.unshift('#' + el.id); break; }
      var i = 0, s = el; while ((s = s.previousElementSibling)) i++;
      out.unshift(el.tagName.toLowerCase() + ':' + i);
      el = el.parentElement; k++;
    }
    return out.join('>');
  }
  function observer(ignorer) {
    var muts = { n: 0, ignorees: 0, ajouts: 0, retraits: 0, attr: 0, texte: 0, ex: [] };
    var sigs = {};
    var mo = new MutationObserver(function (l) {
      l.forEach(function (m) {
        if (m.target && m.target.getAttribute && m.target.getAttribute('data-ab')) return;
        var cle = m.type + ':' + (m.attributeName || '') + '@' + chemin(m.target);
        sigs[cle] = 1;
        if (ignorer && ignorer[cle]) { muts.ignorees++; return; }
        muts.n++;
        if (m.type === 'childList') { muts.ajouts += m.addedNodes.length; muts.retraits += m.removedNodes.length; }
        else if (m.type === 'attributes') muts.attr++;
        else muts.texte++;
        if (muts.ex.length < 3) {
          var t = m.target && m.target.nodeType === 1 ? m.target : (m.target && m.target.parentElement);
          muts.ex.push(m.type + (m.attributeName ? ':' + m.attributeName : '') + '@' + (t ? signature(t) : '?'));
        }
      });
    });
    try { mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true }); } catch (e) {}
    return { muts: muts, sigs: sigs, fin: function () { try { mo.takeRecords(); } catch (e) {} mo.disconnect(); } };
  }
  function cliquer(el, x, y) {
    var opts = { bubbles: true, cancelable: true, view: window, button: 0, clientX: x, clientY: y };
    el.dispatchEvent(new MouseEvent('mousedown', opts));
    el.dispatchEvent(new MouseEvent('mouseup', opts));
    el.dispatchEvent(new MouseEvent('click', opts));
  }

  function inventaire(instable) {
    var bs = boutons();
    var o = observer();
    setTimeout(function () {
      o.fin();
      rendre({
        mode: 'inv', instable: instable, total: bs.length, couverts: COUVERTS, couvEx: COUV_EX,
        boutons: bs.slice(0, MAXB).map(function (el) { return { l: libelle(el), s: signature(el) }; }),
        bruit: o.muts.n, bruitEx: o.muts.ex,
        errCharge: A.errCharge.slice(0, 5),
        opsCharge: A.appels.map(function (a) { return a.op + (a.jeu ? '' : '*'); }),
      });
    }, OBS);
  }

  function clic(instable) {
    var bs = boutons();
    var el = bs[B];
    if (!el) { rendre({ mode: 'clic', absent: 1, total: bs.length }); return; }
    var lib = libelle(el), sig = signature(el);
    // Un choix DÉJÀ actif (onglet courant, bouton de segment allumé) : le recliquer ne fait rien, et c'est normal.
    var deja = /(^|\s)(on|actif|active|sel|selected|courant|choisi)(\s|$)/.test(String(el.className || ''))
      || el.getAttribute('aria-pressed') === 'true' || el.getAttribute('aria-selected') === 'true' || !!el.getAttribute('aria-current')
      || ((el.type === 'radio') && el.checked);
    poserGardes(function () { fin(); });
    /* L'ÉTALONNAGE : un clic À VIDE sur le fond de la page d'abord. Ce qu'il
       change (un menu qui se referme, une liste de suggestions qui se cache…)
       arrive à TOUT clic : on l'ignore ensuite, sinon un écouteur global ferait
       passer chaque bouton muet pour vivant (vu sur la caisse : #c-res). */
    var cal = observer();
    try { cliquer(document.body, 1, 1); } catch (e) {}
    setTimeout(function () {
      cal.fin();
      etat0 = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : null;
      nOps = A.appels.length; nNat = A.natifs.length; nHors = A.hors.length;
      o = observer(cal.sigs);
      vals0 = valeurs();
      A.phase = 'clic';
      try {
        var r = el.getBoundingClientRect();
        cliquer(el, Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
      } catch (e) { window.__abErreur('dispatch : ' + (e && e.message)); }
      setTimeout(fin, OBS);
    }, 120);
    var o = null, nOps = 0, nNat = 0, nHors = 0, etat0 = null, vals0 = null;
    var fait = false;
    function fin() {
      if (fait || !o) return; fait = true;
      o.fin();
      rendre({
        mode: 'clic', l: lib, s: sig, instable: instable, total: bs.length,
        err: A.err.slice(0, 4),
        ops: A.appels.slice(nOps).map(function (a) { return { op: a.op, jeu: a.jeu, args: a.args }; }).slice(0, 12),
        natifs: A.natifs.slice(nNat).map(function (n) { return n.m; }).slice(0, 8),
        hors: A.hors.slice(nHors).map(function (h) { return h.q; }).slice(0, 6),
        conf: A.conf.slice(0, 3),
        deja: deja ? 1 : 0,
        valeur: (function () { var v = valeurs(); if (!vals0 || v.length !== vals0.length) return 0; for (var i = 0; i < v.length; i++) if (v[i] !== vals0[i]) return 1; return 0; })(),
        focus: document.activeElement && document.activeElement !== document.body && document.activeElement !== el ? signature(document.activeElement) : '',
        coche: (etat0 !== null && el.checked !== etat0) ? 1 : 0,
        muts: o.muts,
      });
    }
  }


  /* ── LES GARDES COMMUNES AU CLIC ET AUX OPTIONS ── */
  function poserGardes(surDepart) {
    // Les boîtes de confirmation du socle : ACCEPTÉES, et notées, pour suivre l'action jusqu'à son appel.
    window.szConfirmer = function (o) {
      o = o || {};
      A.conf.push({ titre: String(o.titre || '').slice(0, 80), oui: String(o.oui || '').slice(0, 60) });
      return Promise.resolve(true);
    };
    // Une navigation de la page (lien, formulaire non retenu) : notée et empêchée, APRÈS les gestionnaires de la fenêtre.
    window.addEventListener('click', function (ev) {
      if (ev.defaultPrevented) return;
      var a = ev.target && ev.target.closest && ev.target.closest('a[href]');
      if (!a) return;
      var h = a.getAttribute('href') || '';
      if (/^#/.test(h) && !a.hasAttribute('download')) return;
      ev.preventDefault();
      window.__abHors((a.hasAttribute('download') ? 'téléchargement ' : 'navigation : ') + h.slice(0, 80));
    });
    window.addEventListener('submit', function (ev) {
      if (ev.defaultPrevented) return;
      ev.preventDefault();
      window.__abHors('soumission de formulaire NON retenue par la fenêtre (rechargerait la page)');
    });
    window.addEventListener('pagehide', function () {
      A.hors.push({ q: 'la page s’en va (navigation)', phase: A.phase });
      surDepart();
    });
  }

  /* La VALEUR des champs : poser « 50 » dans une quantité ne touche pas au DOM
     (c'est une propriété), et le bouton passerait pour MUET. « sauf » : le champ
     qu'on vient soi-même de changer, dont la valeur a forcément bougé. */
  function valeurs(sauf) {
    var out = [];
    Array.prototype.forEach.call(document.querySelectorAll('input, select, textarea'), function (c) {
      if (c === sauf) { out.push('='); return; }
      // Le radio choisi decoche forcement son voisin de groupe : ce n'est pas une reaction.
      if (sauf && sauf.type === 'radio' && c.type === 'radio' && c.name && c.name === sauf.name) { out.push('='); return; }
      out.push((c.type === 'checkbox' || c.type === 'radio') ? String(c.checked) : String(c.value));
    });
    return out;
  }
  function differe(a, b) { if (!a || !b || a.length !== b.length) return 0; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return 1; return 0; }

  /* ==================================================================
     LES OPTIONS (m=opt, 2026-10-16) — UNE OPTION SERT-ELLE A QUELQUE CHOSE ?
     Cocher une case change TOUJOURS son etat : le « case cochee » du clic ne
     prouve donc rien. Ici, pour chaque selecteur, case ou radio :
       1. on change sa valeur (vrais evenements input + change) et on regarde
          la reaction immediate (op, DOM, autre champ) ;
       2. on clique UN des Enregistrer de la page (s = son rang ; le pilote les
          essaie TOUS, quatre au plus), et on prend l'empreinte complete des
          arguments envoyes au pont. Pas le plus proche dans l'arbre : sur les
          paiements, celui des identifiants est dans le pied de page, plus loin
          du choix de mode que celui des modes de paiement — la proximite
          designait le mauvais, et l'option passait pour perdue ;
       3. le pilote compare a un ENREGISTREMENT TEMOIN fait sans rien changer
          (b = -100 - i, i = rang de ce bouton). Memes arguments et aucune
          reaction : l'option est PERDUE — l'usager la regle, rien ne la lit.
     b = -1 : inventaire des options ; b = k : option k.
     ================================================================== */
  var SEL_OPT = 'select, input[type=checkbox], input[type=radio], [role=switch]';
  /* Le verbe qui ENVOIE : « Enregistrer » ne suffit pas — un formulaire de lien
     se termine par « + Creer le lien », celui d'un vehicule par « + Inscrire le
     vehicule », la connexion par « Se connecter ». Avec le seul « Enregistrer »,
     la premiere passe a declare PERDUES les options du vehicule (le bouton
     essaye etait « Mettre a jour la liste ») et muettes celles de dix formulaires. */
  var RE_SAUVE = /^[^A-Za-z\u00C0-\u00FF]*(enregistrer|sauvegarder|appliquer|mettre \u00E0 jour|valider|cr\u00E9er|fabriquer|publier|ajouter|inscrire|g\u00E9n\u00E9rer|envoyer|confirmer|se connecter|connexion|encaisser|programmer|planifier|activer|terminer|acheter|commander|imprimer|exporter|t\u00E9l\u00E9charger|continuer|suivant)/i;
  function profondeur(n) { var d = 0; while (n) { d++; n = n.parentElement; } return d; }
  function commun(a, b) { while (a && !a.contains(b)) a = a.parentElement; return a; }
  /* Les trois Enregistrer les plus PROCHES (ancetre commun le plus profond), par rang
     dans sauveurs() : on les essaie tous les trois, la proximite seule s'est trompee. */
  function candidats(el, ss) {
    return ss.map(function (b, i) { return { i: i, d: profondeur(commun(b, el)) }; })
      .sort(function (a, b) { return b.d - a.d || a.i - b.i; }).slice(0, 3).map(function (x) { return x.i; });
  }
  function porteur(el) {
    // Une bascule stylee cache souvent la vraie case : c'est son etiquette qu'on voit et qu'on clique.
    if (visible(el)) return el;
    var l = (el.labels && el.labels[0]) || el.closest('label');
    return (l && visible(l)) ? l : null;
  }
  function autreChoix(s) {
    var n = s.options.length;
    for (var k = 1; k < n; k++) { var j = (s.selectedIndex + k) % n; if (!s.options[j].disabled) return j; }
    return -1;
  }
  function options() {
    var tous = Array.prototype.slice.call(document.querySelectorAll(SEL_OPT));
    var out = [];
    for (var i = 0; i < tous.length; i++) {
      var el = tous[i];
      if (!actif(el)) continue;
      if (el.type === 'radio' && el.checked) continue;          // deja choisi : le reprendre ne change rien
      if (el.tagName === 'SELECT' && autreChoix(el) < 0) continue;
      var p = porteur(el);
      if (!p || couvert(p)) continue;
      out.push(el);
    }
    return out;
  }
  function libOpt(el) {
    if (el.tagName !== 'SELECT') return libelle(el);
    var lab = (el.labels && el.labels[0]) || el.closest('label');
    var t = lab ? String(lab.innerText || lab.textContent || '') : (el.getAttribute('aria-label') || el.title || el.name || el.id || '');
    t = '[select] ' + String(t).replace(/\s+/g, ' ').trim();
    return t.length > 70 ? t.slice(0, 70) + '…' : t;
  }
  function sauveurs() { return boutons().filter(function (b) { return RE_SAUVE.test(libelle(b)); }); }
  function changer(el) {
    if (el.tagName === 'SELECT') {
      el.selectedIndex = autreChoix(el);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    // Une etiquette relaie le clic a sa case ; un role=switch nu recoit le clic direct.
    var p = porteur(el) || el, r = p.getBoundingClientRect();
    cliquer(p, Math.round(r.left + Math.min(r.width / 2, 12)), Math.round(r.top + r.height / 2));
  }
  /* LE PRE-REMPLISSAGE : un formulaire aux champs obligatoires vides refuse
     d'envoyer, et un enregistrement qui n'envoie rien ne se compare a rien (la
     premiere passe en a laisse 35 « non juges »). Les champs VIDES recoivent une
     valeur plausible, LA MEME dans le passage temoin et dans celui de l'option ;
     l'option, elle, est changee APRES. */
  function preremplir() {
    var n = 0;
    Array.prototype.forEach.call(document.querySelectorAll('input, select, textarea'), function (c) {
      if (c.disabled || c.readOnly || !visible(porteur(c) || c)) return;
      var t = String(c.type || '').toLowerCase();
      if (/^(checkbox|radio|file|hidden|button|submit|reset|image|range|color)$/.test(t)) return;
      if (c.tagName === 'SELECT') {
        if (c.value !== '') return;
        for (var k = 0; k < c.options.length; k++) if (c.options[k].value !== '' && !c.options[k].disabled) { c.selectedIndex = k; break; }
      } else {
        if (c.value !== '') return;
        c.value = t === 'email' ? 'essai@exemple.com' : t === 'tel' ? '5145550123' : t === 'url' ? 'https://exemple.com'
          : t === 'number' ? String(c.min !== '' ? c.min : 1) : t === 'date' ? '2026-10-16' : t === 'time' ? '10:00'
          : t === 'month' ? '2026-10' : t === 'datetime-local' ? '2026-10-16T10:00' : t === 'password' ? 'Essai-12345!' : 'Essai';
      }
      try { c.dispatchEvent(new Event('input', { bubbles: true })); c.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
      n++;
    });
    return n;
  }
  function opsDepuis(n) {
    return A.appels.slice(n).filter(function (a) { return !/^(session:activite|lots:etat|verrous:liste|brouillon:ecrire)$/.test(a.op); });
  }
  function inventaireOpt(instable) {
    var os = options(), ss = sauveurs();
    rendre({
      mode: 'inv', m: 'opt', instable: instable, total: os.length,
      boutons: os.slice(0, MAXB).map(function (el) { return { l: libOpt(el), s: signature(el), cands: candidats(el, ss) }; }),
      sauveurs: ss.map(function (b) { return { l: libelle(b), s: signature(b) }; }),
      errCharge: A.errCharge.slice(0, 5),
    });
  }
  function enregistrer(btn, apres) {
    var n = A.appels.length, nc = A.conf.length;
    A.phase = 'sauve';
    try { var r = btn.getBoundingClientRect(); cliquer(btn, Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)); }
    catch (e) { window.__abErreur('dispatch : ' + (e && e.message)); }
    setTimeout(function () {
      apres({ ops: opsDepuis(n).map(function (a) { return { op: a.op, sig: a.sig, args: a.args, jeu: a.jeu }; }).slice(0, 12),
        conf: A.conf.slice(nc).map(function (c) { return c.titre + ' → ' + c.oui; }) });
    }, Math.round(OBS * 1.5));
  }
  function temoinSauve(instable) {
    var i = -100 - B, ss = sauveurs(), btn = ss[i];
    if (!btn) { rendre({ mode: 'sauveTemoin', i: i, absent: 1 }); return; }
    poserGardes(function () {});
    var lib = libelle(btn), sig = signature(btn);
    var nPre = preremplir();
    setTimeout(function () {
    btn = sauveurs().filter(function (b) { return libelle(b) === lib && signature(b) === sig; })[0] || btn;
    enregistrer(btn, function (s) { s.pre = nPre; rendre({ mode: 'sauveTemoin', i: i, l: lib, s: sig, sauve: s, err: A.err.slice(0, 4), instable: instable }); });
    }, 200);
  }
  function optionner(instable) {
    var os = options(), el = os[B];
    if (!el) { rendre({ mode: 'opt', absent: 1, total: os.length }); return; }
    var lib = libOpt(el), sig = signature(el);
    var ss0 = sauveurs(), cible = (S >= 0 && ss0[S]) ? { l: libelle(ss0[S]), s: signature(ss0[S]) } : null;
    var rendu = false;
    function dire(x) { if (rendu) return; rendu = true; rendre(x); }
    poserGardes(function () { dire({ mode: 'opt', l: lib, s: sig, hors: ['la page s’en va (navigation)'], err: A.err.slice(0, 4) }); });
    preremplir();
    var cal = observer();
    try { cliquer(document.body, 1, 1); } catch (e) {}
    setTimeout(function () {
      cal.fin();
      if (!document.contains(el)) { el = options().filter(function (o) { return signature(o) === sig && libOpt(o) === lib; })[0] || el; }
      var avant = el.tagName === 'SELECT' ? el.value : el.checked;
      var n0 = A.appels.length, nN = A.natifs.length, nH = A.hors.length;
      var o = observer(cal.sigs), v0 = valeurs(el);
      A.phase = 'clic';
      try { changer(el); } catch (e) { window.__abErreur('changement : ' + (e && e.message)); }
      // Pris tout de suite ? Une liste d'outil (police, format) se remet a sa valeur apres usage : ce n'est pas un refus.
      var pris = (el.tagName === 'SELECT' ? el.value : el.checked) !== avant;
      setTimeout(function () {
        o.fin();
        var apres = el.tagName === 'SELECT' ? el.value : el.checked;
        var x = { mode: 'opt', l: lib, s: sig, instable: instable,
          change: avant !== apres ? 1 : 0, pris: pris ? 1 : 0,
          ops: opsDepuis(n0).map(function (a) { return { op: a.op, args: a.args, jeu: a.jeu }; }).slice(0, 12),
          natifs: A.natifs.slice(nN).map(function (q) { return q.m; }).slice(0, 8),
          hors: A.hors.slice(nH).map(function (h) { return h.q; }).slice(0, 6),
          muts: o.muts, valeur: differe(valeurs(el), v0) };
        x.si = S;
        if (!cible) { x.err = A.err.slice(0, 4); dire(x); return; }
        // L'Enregistrer est cherche APRES le changement, par son libelle et sa signature :
        // une fenetre qui REDESSINE au changement a remplace tous ses noeuds.
        var apresS = sauveurs(), btn = null;
        for (var q = 0; q < apresS.length && !btn; q++) if (libelle(apresS[q]) === cible.l && signature(apresS[q]) === cible.s) btn = apresS[q];
        x.sauveL = cible.l; x.sauveS = cible.s;
        if (!btn) { x.err = A.err.slice(0, 4); x.sauveDisparu = 1; dire(x); return; }
        enregistrer(btn, function (r) { x.sauve = r; x.err = A.err.slice(0, 4); dire(x); });
      }, OBS);
    }, 120);
  }

  var tours = 0;
  function tour() {
    tours++;
    if (tours < 6) { setTimeout(tour, 40); return; }
    couperAnimations();
    stable(function (instable) {
      try {
        if (MODE === 'opt') { if (B === -1) inventaireOpt(instable); else if (B <= -100) temoinSauve(instable); else optionner(instable); }
        else if (B < 0) inventaire(instable); else clic(instable);
      }
      catch (e) { rendre({ mode: B < 0 ? 'inv' : 'clic', panne: String(e && e.message) }); }
    });
  }
  setTimeout(tour, 40);
})();
