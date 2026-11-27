'use strict';

/*
 * LES BOÎTES-FORMULAIRES EN VRAIES FENÊTRES (2026-11-27, phase 2)
 * =============================================================================
 * Sa demande : « convertis toutes les fenêtres qui ne sont pas encore en natif ».
 * Les confirmations passent par fenetres/dialogue.js ; restaient ~48 boîtes
 * dessinées DANS une fenêtre (`class="voile"`) : formulaires (coupon, carte-cadeau,
 * promotion, dépense, véhicule…), visionneuses (étiquettes PDF, aperçu de
 * courriel), recherches, boîtes à case à cocher.
 *
 * LE PRINCIPE : on ne réécrit pas 48 formulaires. La fenêtre qui ouvrait sa boîte
 * demande à la coquille de la rouvrir dans une FENÊTRE MODALE FILLE (szBoite, socle).
 * La coquille refabrique LA MÊME PAGE (sa recette : `_szRefaire` d'une fenêtre,
 * `refaire` d'un écran ancré) et y injecte ce petit programme : la page charge ses
 * données comme d'habitude, rouvre la boîte demandée (szBoiteSiDemandee, socle),
 * et n'affiche QU'ELLE, pleine fenêtre. Le formulaire garde tout son code — ses
 * contrôles, ses appels au pont, ses messages.
 * Quand la boîte se ferme (enregistrée ou annulée), la fenêtre fille se ferme et
 * la mère recharge ses données ; le dernier message de la fille lui est remis.
 *
 * ⚠ Ce fichier est chargé par main.js (processus principal). La fonction
 * `modeBoite` est INJECTÉE dans la page sous forme de texte : elle ne doit rien
 * utiliser de ce module.
 */

/* Le programme injecté dans la page fille, en tête de <head>. */
function modeBoite(cfg) {
  window.__szBoite = cfg;
  var d = document.documentElement;
  d.classList.add('sz-boite-seule');
  var st = document.createElement('style');
  st.textContent = ''
    // Tout le reste de la page se charge, mais ne se voit pas : seule la boîte est visible.
    + 'html.sz-boite-seule body{visibility:hidden!important;overflow:hidden!important}'
    + 'html.sz-boite-seule .voile:not([hidden]),html.sz-boite-seule .szc-voile{visibility:visible!important;position:fixed!important;inset:0!important;'
    + 'background:var(--f-page,#111827)!important;display:block!important;overflow:auto!important;padding:0!important;z-index:2147483000!important;'
    + 'backdrop-filter:none!important;-webkit-backdrop-filter:none!important;animation:none!important}'
    + 'html.sz-boite-seule .voile:not([hidden]) > *{margin:0 auto!important;max-height:none!important;box-shadow:none!important;border:0!important;'
    + 'border-radius:0!important;transform:none!important;animation:none!important}'
    // Une fois sa largeur naturelle lue, la boîte remplit la fenêtre (plus de bandes sur les côtés).
    + 'html.sz-boite-large .voile:not([hidden]) > *{width:100%!important;max-width:none!important}'
    // Le bouton « Plein écran » du socle n'a pas de sens dans une vraie fenêtre.
    + 'html.sz-boite-seule .sz-btnfen,html.sz-boite-seule .sz-btnplein{display:none!important}'
    // Les bulles de message restent visibles par-dessus la boîte.
    + 'html.sz-boite-seule #sz-bulle,html.sz-boite-seule #sz-bulle *{visibility:visible!important}html.sz-boite-seule #sz-bulle{z-index:2147483600!important}';
  (document.head || d).appendChild(st);

  var P = function () { return window.szPont || {}; };
  var vu = false, vuA = 0, fini = false, dernier = null, tFin = null, tMes = null, larg = 0;
  var ouverte = function () {
    var l = document.querySelectorAll('.voile, .szc-voile');
    for (var i = 0; i < l.length; i++) {
      var v = l[i];
      if (v.hidden) continue;
      var cs = getComputedStyle(v);
      if (cs.display !== 'none') return v;
    }
    return null;
  };
  var mesurer = function () {
    var v = ouverte();
    if (!v) return;
    var b = v.firstElementChild || v;
    var r = b.getBoundingClientRect();
    // La LARGEUR naturelle de la boîte, lue une seule fois (avant que la fenêtre se règle sur elle).
    if (!larg) { larg = Math.ceil(Math.max(r.width, b.scrollWidth)); d.classList.add('sz-boite-large'); }
    var h = Math.ceil(Math.max(r.height, b.scrollHeight));
    try { if (P().boiteTaille) P().boiteTaille(larg, h); } catch (e) {}
  };
  var terminer = function () {
    if (fini) return;
    fini = true;
    // Seul un message dit APRÈS l'ouverture de la boîte remonte (pas une erreur du chargement de la page derrière).
    var dd = window.__szDernierDire;
    var info = dernier || ((dd && dd.t >= vuA) ? dd : {});
    var v = window.__szBoiteValeur;
    var res = { message: info.message || '', type: info.type || '' };
    if (v !== undefined) res.valeur = v;
    try { if (P().boiteFin) P().boiteFin(res); } catch (e) {}
  };
  var regarder = function () {
    var v = ouverte();
    if (v) {
      if (!vu) vuA = Date.now();
      vu = true;
      if (tFin) { clearTimeout(tFin); tFin = null; }
      clearTimeout(tMes); tMes = setTimeout(mesurer, 40);
    } else if (vu && !tFin) {
      // Une boîte qui en ouvre une autre (confirmer puis bilan) : on attend un instant avant de conclure.
      tFin = setTimeout(function () { tFin = null; if (!ouverte()) terminer(); }, 350);
    }
  };
  var demarrer = function () {
    try { new MutationObserver(regarder).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'style', 'class'] }); } catch (e) {}
    regarder();
    // Le dernier message de la page (enregistré, erreur…) sera remis à la fenêtre mère.
    var hook = function () {
      if (typeof window.szDire === 'function' && !window.szDire.__szBoite) {
        var o = window.szDire;
        window.szDire = function (t, g) { if (vu) dernier = { message: String(t == null ? '' : t), type: String(g || '') }; return o.apply(this, arguments); };
        window.szDire.__szBoite = true;
      }
    };
    hook(); setTimeout(hook, 300); setTimeout(hook, 1500);
    // Rien ne s'est ouvert après le chargement : on le dit à la mère (elle ouvrira la boîte chez elle).
    setTimeout(function () { if (!vu && !fini) { fini = true; try { if (P().boiteFin) P().boiteFin({ introuvable: true }); } catch (e) {} } }, 15000);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
}

/* La page refabriquée, avec le programme en tête. */
function pageEnBoite(html, cfg) {
  const inj = '<script>(' + modeBoite.toString() + ')(' + JSON.stringify(cfg).replace(/</g, '\\u003c') + ');</script>';
  const s = String(html || '');
  const m = /<head[^>]*>/i.exec(s);
  return m ? s.slice(0, m.index + m[0].length) + inj + s.slice(m.index + m[0].length) : inj + s;
}

module.exports = { pageEnBoite, modeBoite };
