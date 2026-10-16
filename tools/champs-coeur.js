/* ============================================================================
   champs-coeur.js — LES CHAMPS ET LEURS ESPACEMENTS, MESURES AU RENDU (2026-10-16)
   ----------------------------------------------------------------------------
   Sa demande du 2026-10-16 : « audite aussi tes espacements et verifie qu'aucun
   champ ne se retrouve deforme, ou pourrait l'etre par un manque de controle de
   champs ».
   ⚠ CE FICHIER N'EST PAS UN MODULE NODE : c'est l'EPILOGUE que
   `audit-boutons.js --champs` (lance par `banc-champs.js`) coud avant le dernier
   </body> d'une fenetre, APRES son script. Le PROLOGUE (faux pont, capteurs
   d'exceptions) reste celui de audit-boutons-coeur.js.

   ── DEUX TEMPS ─────────────────────────────────────────────────────────────
   1. AU REPOS (la page posee, avec son jeu de reponses) :
        ECRASE        champ trop etroit ou trop bas pour etre utilisable ;
        TEXTE_COUPE   la hauteur interieure n'admet pas une ligne de la police ;
        CHOIX_TRONQUE le choix affiche d'une liste ne tient pas dans sa boite ;
        INDICATION_TRONQUEE  le texte d'indication (placeholder) est coupe ;
        DEBORDE       le champ sort de son conteneur ou de la fenetre ;
        CHEVAUCHE     deux controles se recouvrent ;
        COLLE         deux controles voisins a moins de 3 px, sans etre soudes
                      (un groupe soude a ses coins interieurs carres) ;
        HAUTEURS      deux champs cote a cote n'ont pas la meme hauteur.
   2. SOUS CHARGE (« le manque de controle ») : chaque champ de saisie recoit
      la valeur la plus longue qu'il ACCEPTE (sa maxlength, sinon 300 caracteres
      sans espace ; 15 chiffres pour un nombre ; 8 longues lignes pour une zone
      de texte), avec de vrais evenements input + change :
        ERREUR_SAISIE la fenetre leve une exception ;
        S_ETIRE       le champ change de largeur (il se dimensionne sur son
                      contenu : la rangee entiere se deforme) ;
        PAGE_ELARGIE / PAGE_ALLONGEE  la page se met a defiler ;
        POUSSE_HORS   un controle est pousse hors de la fenetre ;
        DEPASSE_LIMITE  un compteur « n / max » montre n > max : la limite
                      est ANNONCEE mais pas tenue (pas de maxlength).
   Et, pour information seulement (rien n'echoue la-dessus) : les champs de
   texte sans maxlength et les nombres sans min/max.

   On ne mesure que ce qui est VISIBLE et AU-DESSUS (le point central de
   l'element le designe) : un fond estompe sous une surcouche n'est pas a
   l'ecran, et ses champs « chevaucheraient » ceux de la boite.
   ⚠ Pas d'accent grave dans ce fichier (il est colle dans des pages).
   ============================================================================ */

/* ==== EPILOGUE ==== */
(function () {
  var A = window.__ab;
  var NOM = __NOM__, SCEN = __SCEN__;
  var envoye = false;
  function rendre(x) {
    if (envoye) return; envoye = true;
    x.nom = NOM; x.scen = SCEN; x.b = -1;
    try { parent.postMessage({ ab: 1, x: x }, '*'); } catch (e) {}
  }
  var SAISIE = 'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range])'
    + ':not([type=color]):not([type=submit]):not([type=button]):not([type=reset]):not([type=image])';
  var CHAMP = SAISIE + ', select, textarea';
  var CTRL = CHAMP + ', button, [role=button]';

  function px(v) { return parseFloat(v) || 0; }
  /* VISIBLE, ancetres compris : un bloc replie (max-height:0, overflow:hidden,
     opacity:0 — le mot de passe de la connexion en mode cle) garde des champs de
     pleine taille dans l'arbre. Sans ce decoupage, le banc les voyait « chevaucher »
     le bouton dessine par-dessus. */
  function rectVu(el) {
    var r = el.getBoundingClientRect();
    var l = r.left, t = r.top, d = r.right, b = r.bottom;
    for (var p = el; p && p !== document.documentElement; p = p.parentElement) {
      var c = getComputedStyle(p);
      if (Number(c.opacity) === 0) return null;
      if (p !== el && (c.overflowX !== 'visible' || c.overflowY !== 'visible')) {
        var q = p.getBoundingClientRect();
        if (c.overflowX !== 'visible') { l = Math.max(l, q.left); d = Math.min(d, q.right); }
        if (c.overflowY !== 'visible') { t = Math.max(t, q.top); b = Math.min(b, q.bottom); }
      }
    }
    if (d - l < 2 || b - t < 2) return null;
    return { left: l, top: t, right: d, bottom: b, width: d - l, height: b - t };
  }
  function visible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    return !!rectVu(el);
  }
  /* Au-dessus : UN des cinq points (centre, et pres des quatre bords) designe
     l'element. Le centre seul ecartait un bouton a moitie recouvert — c'est-a-dire
     exactement celui qu'un CHEVAUCHE doit accuser (vu au temoin). */
  function dessus(el) {
    var r = el.getBoundingClientRect();
    if (r.right < 0 || r.bottom < 0 || r.left >= innerWidth || r.top >= innerHeight) return false;
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var pts = [[cx, cy], [r.left + 3, cy], [r.right - 3, cy], [cx, r.top + 3], [cx, r.bottom - 3]];
    for (var p = 0; p < pts.length; p++) {
      var x = Math.min(Math.max(pts[p][0], 0), innerWidth - 1), y = Math.min(Math.max(pts[p][1], 0), innerHeight - 1);
      var h = document.elementFromPoint(x, y);
      if (!h) continue;
      if (h === el || el.contains(h) || h.contains(el)) return true;
      if (el.labels) for (var i = 0; i < el.labels.length; i++) if (el.labels[i] === h || el.labels[i].contains(h)) return true;
    }
    return false;
  }
  function signature(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) return s + '#' + el.id;
    var c = String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (c.length) s += '.' + c.join('.');
    var d = [];
    for (var i = 0; i < el.attributes.length && d.length < 2; i++) {
      var a = el.attributes[i];
      if (a.name.indexOf('data-') === 0) d.push(a.name + (a.value && a.value.length < 24 ? '=' + a.value : ''));
    }
    if (d.length) s += '[' + d.join('][') + ']';
    // L'ancetre nomme le plus proche : deux « input.mini » ne se confondent pas.
    var p = el.parentElement, k = 0;
    while (p && !p.id && k < 8) { p = p.parentElement; k++; }
    if (p && p.id) s = '#' + p.id + ' ' + s;
    return s;
  }
  function nomDe(el) {
    var t = el.getAttribute('aria-label') || '';
    if (!t && el.labels && el.labels[0]) t = el.labels[0].innerText || el.labels[0].textContent || '';
    if (!t && /^(BUTTON)$/.test(el.tagName)) t = el.innerText || el.textContent || el.title || '';
    if (!t) t = el.getAttribute('placeholder') || el.title || el.name || '';
    t = String(t).replace(/\s+/g, ' ').trim();
    return t.length > 50 ? t.slice(0, 50) + '…' : t;
  }
  function estChamp(el) { return el.matches(CHAMP); }
  function estSaisie(el) { return el.tagName === 'TEXTAREA' || el.matches(SAISIE); }

  var TROUVE = [];
  var vus = {};
  function noter(type, el, detail, autre) {
    var cle = type + '|' + signature(el) + (autre ? '|' + signature(autre) : '');
    if (vus[cle]) return; vus[cle] = 1;
    TROUVE.push({ type: type, sig: signature(el) + (autre ? '  ↔  ' + signature(autre) : ''),
      nom: nomDe(el) + (autre ? '  ↔  ' + nomDe(autre) : ''), detail: String(detail || '') });
  }

  /* La largeur d'un texte dans la police d'un element. */
  var CAN = document.createElement('canvas').getContext('2d');
  function largeurTexte(t, el) {
    var cs = getComputedStyle(el);
    CAN.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    return CAN.measureText(String(t)).width + px(cs.letterSpacing) * String(t).length;
  }
  function interieur(el) {
    var cs = getComputedStyle(el);
    return { l: el.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight),
      h: el.clientHeight - px(cs.paddingTop) - px(cs.paddingBottom), fs: px(cs.fontSize), cs: cs };
  }
  /* Un controle « soude » a son voisin : le coin interieur est carre (groupe de segments, champ + bouton). */
  function soudes(a, b, sens) {
    var ca = getComputedStyle(a), cb = getComputedStyle(b);
    if (sens === 'h') return px(ca.borderTopRightRadius) < 1 || px(cb.borderTopLeftRadius) < 1;
    return px(ca.borderBottomLeftRadius) < 1 || px(cb.borderTopLeftRadius) < 1;
  }
  /* Une BOITE visible : bordure ou fond. Deux onglets sans l'une ni l'autre ne
     se touchent pas a l'oeil — c'est leur marge interieure qui les separe. */
  function transparent(c) { return !c || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c); }
  function aBoite(el) {
    var c = getComputedStyle(el);
    if (!transparent(c.backgroundColor) || c.backgroundImage !== 'none') return true;
    return ['Top', 'Right', 'Bottom', 'Left'].some(function (s) { return px(c['border' + s + 'Width']) > 0 && !transparent(c['border' + s + 'Color']) && c['border' + s + 'Style'] !== 'none'; });
  }
  /* Un GROUPE : le parent commun porte lui-meme une boite (le cadre d'un selecteur segmente). */
  function enGroupe(a, b) { var p = a.parentElement; return p && p === b.parentElement && aBoite(p); }
  function contenant(el) {
    var p = el.parentElement;
    while (p && p !== document.body) {
      var d = getComputedStyle(p).display;
      if (d !== 'inline' && d !== 'contents' && !/^(LABEL|SPAN)$/.test(p.tagName)) return p;
      p = p.parentElement;
    }
    return null;
  }

  function controles() {
    var l = Array.prototype.slice.call(document.querySelectorAll(CTRL));
    return l.filter(function (el) { return visible(el) && dessus(el); });
  }

  function auRepos() {
    var cs = controles();
    var champs = cs.filter(estChamp);
    var stat = { champs: champs.length, controles: cs.length, sansBorne: 0, nombresSansBorne: 0, exSansBorne: [] };
    champs.forEach(function (el) {
      var r = el.getBoundingClientRect(), I = interieur(el), t = el.type;
      // ECRASE
      var minL = el.tagName === 'SELECT' ? 44 : el.tagName === 'TEXTAREA' ? 80 : (t === 'number' ? 40 : 48);
      var minH = el.tagName === 'TEXTAREA' ? 30 : 18;
      if (r.width < minL || r.height < minH) noter('ECRASE', el, Math.round(r.width) + ' × ' + Math.round(r.height) + ' px (minimum ' + minL + ' × ' + minH + ')');
      // TEXTE_COUPE (une ligne)
      if (el.tagName !== 'TEXTAREA' && I.h + 1 < I.fs * 1.1) noter('TEXTE_COUPE', el, 'hauteur interieure ' + Math.round(I.h) + ' px pour une police de ' + Math.round(I.fs) + ' px');
      // CHOIX_TRONQUE
      if (el.tagName === 'SELECT' && el.selectedIndex >= 0 && el.options[el.selectedIndex]) {
        var txt = el.options[el.selectedIndex].text;
        var w = largeurTexte(txt, el), dispo = I.l - (I.cs.appearance === 'none' ? 0 : 16);
        if (txt && w > dispo + 2) noter('CHOIX_TRONQUE', el, '« ' + txt.slice(0, 40) + ' » : ' + Math.round(w) + ' px pour ' + Math.round(dispo) + ' px');
      }
      // INDICATION_TRONQUEE
      if (estSaisie(el) && el.tagName !== 'TEXTAREA' && !el.value && el.placeholder) {
        var wp = largeurTexte(el.placeholder, el);
        if (wp > I.l + 2) noter('INDICATION_TRONQUEE', el, '« ' + el.placeholder.slice(0, 40) + ' » : ' + Math.round(wp) + ' px pour ' + Math.round(I.l) + ' px');
      }
      // DEBORDE
      if (r.right > innerWidth + 1 || r.left < -1) noter('DEBORDE', el, 'hors de la fenetre (' + Math.round(r.left) + ' → ' + Math.round(r.right) + ', fenetre ' + innerWidth + ')');
      else {
        var p = contenant(el);
        if (p) {
          var pr = p.getBoundingClientRect(), pc = getComputedStyle(p);
          var dr = pr.right - px(pc.borderRightWidth), dl = pr.left + px(pc.borderLeftWidth);
          if (r.right > dr + 1.5 || r.left < dl - 1.5) noter('DEBORDE', el, 'sort de ' + signature(p) + ' de ' + Math.round(Math.max(r.right - dr, dl - r.left)) + ' px');
        }
      }
      // pour information
      if (estSaisie(el) && !el.readOnly && !el.disabled) {
        if (t === 'number') { if (el.min === '' || el.max === '') stat.nombresSansBorne++; }
        else if (el.maxLength < 0 && !/^(date|time|datetime-local|month|week)$/.test(t)) { stat.sansBorne++; if (stat.exSansBorne.length < 4) stat.exSansBorne.push(nomDe(el) || signature(el)); }
      }
    });
    // Les paires : CHEVAUCHE, COLLE, HAUTEURS
    var R = cs.map(function (el) { return rectVu(el) || el.getBoundingClientRect(); });
    for (var i = 0; i < cs.length; i++) for (var j = i + 1; j < cs.length; j++) {
      var a = cs[i], b = cs[j];
      if (a.contains(b) || b.contains(a)) continue;
      var ra = R[i], rb = R[j];
      var ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      var iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      // Un bouton loge ENTIER dans un champ (l'oeil du mot de passe, la loupe) est un ornement voulu.
      var dans = function (p, q) { return q.left >= p.left - 1 && q.right <= p.right + 1 && q.top >= p.top - 1 && q.bottom <= p.bottom + 1; };
      if (ix > 2 && iy > 2 && ((estChamp(a) && !estChamp(b) && dans(ra, rb)) || (estChamp(b) && !estChamp(a) && dans(rb, ra)))) continue;
      if (ix > 2 && iy > 2) { noter('CHEVAUCHE', a, Math.round(ix) + ' × ' + Math.round(iy) + ' px en commun', b); continue; }
      var mh = Math.min(ra.height, rb.height), mw = Math.min(ra.width, rb.width);
      // meme rangee
      if (iy > mh * 0.5) {
        var g = ra.left < rb.left ? rb.left - ra.right : ra.left - rb.right;
        var g1 = ra.left < rb.left ? a : b, g2 = ra.left < rb.left ? b : a;
        if (g >= -2 && g < 3 && !soudes(g1, g2, 'h') && aBoite(g1) && aBoite(g2) && !enGroupe(g1, g2)) noter('COLLE', g1, 'ecart de ' + Math.round(g) + ' px dans la rangee', g2);
        if (estChamp(a) && estChamp(b) && g >= -2 && g < 24 && Math.abs(ra.height - rb.height) > 3)
          noter('HAUTEURS', g1, Math.round(ra.left < rb.left ? ra.height : rb.height) + ' px a cote de ' + Math.round(ra.left < rb.left ? rb.height : ra.height) + ' px', g2);
      } else if (ix > mw * 0.5) {
        var gv = ra.top < rb.top ? rb.top - ra.bottom : ra.top - rb.bottom;
        var v1 = ra.top < rb.top ? a : b, v2 = ra.top < rb.top ? b : a;
        if (gv >= -2 && gv < 3 && !soudes(v1, v2, 'v') && aBoite(v1) && aBoite(v2) && !enGroupe(v1, v2)) noter('COLLE', v1, 'ecart de ' + Math.round(gv) + ' px dans la colonne', v2);
      }
    }
    return stat;
  }

  function sousCharge(fin) {
    var cs = controles();
    var avant = cs.map(function (el) { return el.getBoundingClientRect(); });
    var de = document.documentElement;
    var sw0 = de.scrollWidth, sh0 = de.scrollHeight;
    var cibles = cs.filter(function (el) { return estSaisie(el) && !el.readOnly && !el.disabled && !/^(date|time|datetime-local|month|week)$/.test(el.type); });
    var nErr = A.err.length;
    A.phase = 'clic';
    cibles.forEach(function (el) {
      var v;
      if (el.type === 'number') v = '999999999999999';
      else if (el.tagName === 'TEXTAREA') { var lg = new Array(9).join('W'.repeat(80) + '\n'); v = el.maxLength > 0 ? lg.slice(0, el.maxLength) : lg; }
      else v = 'W'.repeat(el.maxLength > 0 ? Math.min(el.maxLength, 500) : 300);
      if (el.type === 'email') v = v.slice(0, Math.max(1, v.length - 12)) + '@exemple.com';
      try {
        el.focus();
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.blur();
      } catch (e) { window.__abErreur('saisie : ' + (e && e.message)); }
    });
    setTimeout(function () {
      A.err.slice(nErr).forEach(function (m) { TROUVE.push({ type: 'ERREUR_SAISIE', sig: '(page)', nom: '', detail: m }); });
      if (de.scrollWidth > innerWidth + 1 && !(sw0 > innerWidth + 1)) TROUVE.push({ type: 'PAGE_ELARGIE', sig: '(page)', nom: '', detail: de.scrollWidth + ' px pour ' + innerWidth });
      if (de.scrollHeight > innerHeight + 1 && !(sh0 > innerHeight + 1)) TROUVE.push({ type: 'PAGE_ALLONGEE', sig: '(page)', nom: '', detail: de.scrollHeight + ' px pour ' + innerHeight });
      cs.forEach(function (el, i) {
        if (!document.contains(el) || !visible(el)) return;
        var r = el.getBoundingClientRect(), r0 = avant[i];
        if (cibles.indexOf(el) >= 0 && Math.abs(r.width - r0.width) > 2) noter('S_ETIRE', el, Math.round(r0.width) + ' → ' + Math.round(r.width) + ' px une fois rempli');
        var dedans0 = r0.right <= innerWidth + 1 && r0.bottom <= innerHeight + 1;
        var dedans = r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1;
        if (dedans0 && !dedans) noter('POUSSE_HORS', el, 'pousse a ' + Math.round(r.right) + ' × ' + Math.round(r.bottom) + ' (fenetre ' + innerWidth + ' × ' + innerHeight + ')');
      });
      /* DEPASSE_LIMITE : le champ ANNONCE sa limite (un compteur « 300 / 100 » a cote)
         mais l'accepte depassee. Vu aux Reseaux sociaux le 2026-10-16 : le titre d'epingle
         prenait 300 caracteres pour 100 permis — Pinterest l'aurait refuse a l'envoi. */
      cibles.forEach(function (el) {
        if (!document.contains(el)) return;
        var zone = el.parentElement, k = 0;
        while (zone && k < 3 && zone.querySelectorAll(CHAMP).length === 1 && !/\d+\s*\/\s*\d+/.test(zone.textContent || '')) { zone = zone.parentElement; k++; }
        if (!zone || k >= 3 || zone.querySelectorAll(CHAMP).length !== 1) return;   // le compteur d'un VOISIN n'est pas le sien
        var m, re = /(^|[^\d])(\d[\d\u00a0\u202f ]*)\s*\/\s*(\d[\d\u00a0\u202f ]*)(?!\d)/g, txt = zone.innerText || '';
        while ((m = re.exec(txt))) {
          var a = Number(m[2].replace(/\D/g, '')), b = Number(m[3].replace(/\D/g, ''));
          if (b > 0 && a > b && a <= String(el.value).length + 1 && a >= String(el.value).length - 1) { noter('DEPASSE_LIMITE', el, 'le compteur dit ' + a + ' / ' + b + ' et le champ l’accepte'); break; }
        }
      });
      fin(cibles.length);
    }, 450);
  }

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
  var tours = 0;
  function tour() {
    tours++;
    if (tours < 6) { setTimeout(tour, 40); return; }
    try {
      var st = document.createElement('style');
      st.textContent = '*,*::before,*::after{animation-name:none!important;transition:none!important}';
      document.head.appendChild(st);
    } catch (e) {}
    stable(function (instable) {
      try {
        var stat = auRepos();
        var nRepos = TROUVE.length;
        sousCharge(function (n) {
          stat.remplis = n;
          rendre({ mode: 'champs', instable: instable, trouve: TROUVE.slice(0, 80), repos: nRepos, stat: stat, errCharge: A.errCharge.slice(0, 5) });
        });
      } catch (e) { rendre({ mode: 'champs', panne: String(e && e.message) }); }
    });
  }
  setTimeout(tour, 40);
})();
