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
      A.appels.push({ op: nom, jeu: duJeu ? true : (emprunt ? 'emprunt' : false), phase: A.phase, args: court(args) });
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
  var B = -1, MAXB = 40, OBS = 700;
  try {
    var q = new URLSearchParams(location.search);
    B = Number(q.get('b')); if (isNaN(B)) B = -1;
    MAXB = Number(q.get('max')) || 40;
    OBS = Number(q.get('obs')) || 700;
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
      A.hors.push({ q: 'la page s’en va (navigation)', phase: 'clic' });
      fin();
    });
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
    /* La VALEUR des champs : poser « 50 » dans une quantité ne touche pas au DOM
       (c'est une propriété), et le bouton passerait pour MUET. */
    function valeurs() {
      var out = [];
      Array.prototype.forEach.call(document.querySelectorAll('input, select, textarea'), function (c) {
        out.push((c.type === 'checkbox' || c.type === 'radio') ? String(c.checked) : String(c.value));
      });
      return out;
    }
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

  var tours = 0;
  function tour() {
    tours++;
    if (tours < 6) { setTimeout(tour, 40); return; }
    couperAnimations();
    stable(function (instable) {
      try { if (B < 0) inventaire(instable); else clic(instable); }
      catch (e) { rendre({ mode: B < 0 ? 'inv' : 'clic', panne: String(e && e.message) }); }
    });
  }
  setTimeout(tour, 40);
})();
