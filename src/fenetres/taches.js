'use strict';

/*
 * LA PETITE FENÊTRE DU SUIVI DES GÉNÉRATIONS (2026-10-19)
 * =============================================================================
 * Sa décision : « le suivi des photos devient LE MODÈLE. Reproduis EXACTEMENT ce
 * graphisme et ce comportement pour les générations (fiche produit, Atelier,
 * Studio) ». La boîte est donc CELLE de la fenêtre Photos — même feuille
 * (CSS_SUIVI, extraite du socle sans rien y changer), même balisage :
 *   · en tête, le titre (type · produit) et « n / N » ;
 *   · une ligne par ÉTAPE de la génération : « Étape n/N · libellé », son état
 *     (en attente, en cours, faite, échec) et sa durée mesurée ;
 *   · la jauge, le pourcentage, la phrase d'état (temps restant, montant engagé) ;
 *   · Annuler (= arrêter la génération, le montant engagé dit AVANT) et Fermer.
 * Un clic sur le titre ouvre la fenêtre Générations. Terminée : « ✓ Terminé »,
 * puis la boîte s'en va d'elle-même au bout de 8 s.
 *
 * Seule différence avec les Photos : la boîte n'est plus posée en position fixe
 * sur une fenêtre de travail — elle est dans SA fenêtre (src/taches.js, processus
 * principal), qui suit sa hauteur. Rien d'autre ne bouge.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) NI BARRE OBLIQUE INVERSE dans la portion de
 * script, COMMENTAIRES COMPRIS : le script vit dans un littéral de gabarit.
 */

const { CSS_JOUR, CSS_SUIVI, TETE, JS_MESURES } = require('./socle.js');
const T = require('../langue').tr('taches');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;background:transparent!important}
body{color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;overflow:hidden}
button{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;
  padding:.3rem .55rem;cursor:pointer}
button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
/* La pile : les boîtes de suivi, l une sous l autre, la plus récente en bas, la marge de leur ombre autour. */
#pile{display:flex;flex-direction:column;justify-content:flex-end;gap:.6rem;padding:14px 16px 16px}
${CSS_SUIVI}
/* Dans SA fenêtre, la boîte n est plus posée en position fixe : la fenêtre la suit. */
#pile .suivi{position:relative;right:auto;bottom:auto;width:100%;max-height:none}
#pile .suivi .lst{max-height:16rem}
#pile .suivi .st .lien{cursor:pointer;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pile .suivi .st .lien:hover{text-decoration:underline}
/* Un refus du pont (l arrêt n a pas pu être demandé) se dit ICI, sous la pile ; vide, la zone ne prend aucune place. */
#msg{margin:-.4rem 16px 12px;padding:.4rem .7rem;border-radius:9px;font-size:.74rem;background:var(--f-carte);
  color:var(--tx-err);border:1px solid rgba(248,113,113,.45)}
#msg:empty{display:none}
`;

/* LA RÈGLE — écrite UNE fois, ici, et servie à deux endroits : la page (sa première peinture) et le processus principal
   (src/taches.js l'évalue). Ce qui se montre : les générations EN COURS, À CONFIRMER, ÉCHOUÉES pas encore vues ;
   TERMINÉES ou ARRÊTÉES depuis moins de 8 s ; rien d'autre (vues, rejetées, anciennes). L'avancement : pondéré par la
   durée habituelle de chaque étape (celle chez The New Black, son estimation ; les autres, quelques secondes) ; l'étape
   en cours compte au temps écoulé, plafonnée à 95 % — jamais 100 % avant la fin.
   ⚠ Ni barre oblique inverse ni accent grave : c'est un littéral de gabarit, et du JavaScript de navigateur. */
const REGLE = `<script>
var TERMINE_MS = 8000;
function chezTnb(lib){ return /New Black/.test(String(lib || '')); }
function poids(g, e){ return chezTnb(e && e.lib) ? (Number(g.dureeEstimee) || 60) : 4; }
function avancement(g, maintenant){
  var et = Array.isArray(g.etapes) ? g.etapes : [];
  var tot = 0, fait = 0, reste = 0, n = 0;
  et.forEach(function(e){
    var w = poids(g, e); tot += w;
    if (e.etat === 'fait') { fait += w; n++; }
    else if (e.etat === 'cours') {
      var ec = Math.max(0, (maintenant - (e.t0 || maintenant)) / 1000);
      fait += Math.min(0.95, ec / w) * w; reste += Math.max(2, w - ec);
    } else if (e.etat === 'att') reste += w;
  });
  if (g.etat === 'fini') return { pct: 100, reste: 0, n: et.length, N: et.length };
  var pct = tot ? Math.max(0, Math.min(g.etat === 'cours' ? 99 : 100, Math.round(fait / tot * 100))) : 0;
  return { pct: pct, reste: g.etat === 'cours' ? Math.round(reste) : 0, n: n, N: et.length };
}
function lignes(g, maintenant){
  var ET = { fait: 'faite', cours: 'cours', err: 'echec', att: 'attente' };
  return (Array.isArray(g.etapes) ? g.etapes : []).map(function(e){
    return { lib: String(e.lib || ''), etat: ET[e.etat] || 'attente',
      duree: e.t0 ? Math.max(0, Math.round(((e.t1 || (e.etat === 'cours' ? maintenant : e.t0)) - e.t0) / 1000)) : null };
  });
}
function aMontrer(liste, maintenant){
  var out = [];
  (Array.isArray(liste) ? liste : []).forEach(function(g){
    if (!g || !g.id) return;
    var recente = !!g.fin && (maintenant - g.fin) < TERMINE_MS;
    var garder = g.etat === 'cours' || g.etat === 'attente' || (g.etat === 'echec' && !g.vu)
      || ((g.etat === 'fini' || g.etat === 'interrompu') && recente);
    if (!garder) return;
    var a = avancement(g, maintenant);
    out.push({ id: String(g.id), genre: String(g.genre || '3d'), titre: String(g.produitNom || g.produit || ''),
      etat: g.etat, n: a.n, N: a.N, pct: a.pct, reste: a.reste, cout: Number(g.cout) || 0,
      message: String(g.message || '').slice(0, 200), etapes: lignes(g, maintenant),
      resteAffiche: recente ? TERMINE_MS - (maintenant - g.fin) : 0 });
  });
  var RANG = { cours: 0, attente: 1, echec: 2, interrompu: 3, fini: 3 };
  return out.sort(function(x, y){ return RANG[x.etat] - RANG[y.etat]; });
}
</script>`;
// Le texte de la règle sans ses balises : il ouvre le script de la page (une page, un script — comme les autres fenêtres).
const REGLE_JS = REGLE.slice('<script>'.length, REGLE.length - '</script>'.length);

/** Page de la petite fenêtre de suivi. Le processus principal lui passe la liste par szMaj(liste) ; elle rend sa hauteur. */
function pageTaches() {
  return `${TETE()}
<title>${T("Suivi des générations")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body class="sz-fen-taches">
<div id="pile" role="status" aria-live="polite"></div>
<div id="msg" role="alert"></div>
<script>
${REGLE_JS}
(function(){
  'use strict';
  var P = window.szPont;
${JS_MESURES()}
  var pile = document.getElementById('pile');
  var msg = document.getElementById('msg');
  var LISTE = [];
  var FERMES = {};      // les boîtes fermées à la main (la génération continue, la fenêtre Générations la garde)
  var CONF = {};        // les boîtes où « Annuler » attend sa confirmation
  var ARRET = {};       // l arrêt demandé, en attendant que la file le dise
  var FIN = {};         // les minuteries de « Terminé » : la boîte part à l heure dite

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  // Le coût chez The New Black est en DOLLARS AMÉRICAINS : « 0,07 $ US » / « US$0.07 » — le nombre par le socle (groupement).
  function argent(n){ return '${T("{m} $ US")}'.replace('{m}', szArgentNombre(n, 2)); }
  function duree(s){
    s = Math.max(0, Math.round(Number(s) || 0));
    if (s < 60) return '${T("{s} s")}'.replace('{s}', String(s));
    var m = Math.floor(s / 60), r = s % 60;
    return '${T("{m} min {s} s")}'.replace('{m}', String(m)).replace('{s}', (r < 10 ? '0' : '') + r);
  }
  function type(g){
    return g.genre === 'fantome' ? '${T("Sans mannequin")}' : (g.genre === 'atelier' ? '${T("Rendu photo")}' : '${T("Aperçu 3D")}');
  }
  var MOTS = { attente: '${T("en attente")}', cours: '${T("en cours")}', faite: '${T("faite")}', echec: '${T("échec")}' };

  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); } catch (e) { return Promise.resolve({ ok: false }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false });
    return p.then(function(r){ return r || { ok: false }; }).catch(function(){ return { ok: false }; });
  }
  function ouvrirGenerations(){
    var repli = function(){ appeler('generations:ouvrir', []); };
    try {
      var r = P.ouvrirModule ? P.ouvrirModule('generations') : null;
      if (r && typeof r.then === 'function') r.then(function(ok){ if (!ok) repli(); }).catch(repli); else repli();
    } catch (e) { repli(); }
  }

  /* La phrase d état, sous la jauge : ce qui se passe, ce qui reste, ce qui est engagé. */
  function phrase(g){
    if (CONF[g.id]) return '${T("{m} sont déjà engagés chez The New Black : ce montant ne sera pas remboursé. Arrêter la génération ?")}'.replace('{m}', argent(g.cout));
    if (ARRET[g.id] && g.etat === 'cours') return '${T("Arrêt demandé…")}';
    if (g.etat === 'fini') return '✓ ${T("Terminé.")}';
    if (g.etat === 'interrompu') return '${T("Génération arrêtée.")}';
    if (g.etat === 'attente') return '${T("En attente de votre confirmation — ouvrez la fenêtre Générations.")}';
    if (g.etat === 'echec') return g.message ? esc(g.message) : '${T("La génération a échoué.")}';
    return (g.reste ? '${T("Environ {t} restantes")}'.replace('{t}', duree(g.reste)) : '${T("Préparation…")}')
      + (g.cout ? ' · ' + '${T("{m} engagés")}'.replace('{m}', argent(g.cout)) : '');
  }

  /* LA BOÎTE : le balisage de suiviOuvrir (fenêtre Photos), une ligne par étape. */
  function boite(g){
    var N = g.etapes.length;
    var h = '<div class="st"><span class="lien" data-ouvrir="1" role="link" title="${T("Ouvrir la fenêtre Générations")}">'
      + esc(type(g) + ' · ' + g.titre) + '</span><span class="n">' + g.n + ' / ' + N + '</span></div>'
      + '<div class="lst">'
      + g.etapes.map(function(e, i){
          var c = e.etat === 'cours' ? 'encours' : (e.etat === 'faite' ? 'ok' : (e.etat === 'echec' ? 'non' : ''));
          var m = e.etat === 'cours' ? '…' : (e.etat === 'faite' ? '✓' : (e.etat === 'echec' ? '✕' : ''));
          return '<div class="lg"><span class="nm">' + '${T("Étape {n}/{N}")}'.replace('{n}', String(i + 1)).replace('{N}', String(N))
            + ' · ' + esc(e.lib) + '</span><span class="et ' + e.etat + '">' + MOTS[e.etat] + '</span>'
            + '<span class="ep">' + (e.duree != null && c ? '<i class="' + c + '">' + m + ' ' + duree(e.duree) + '</i>' : '') + '</span></div>';
        }).join('')
      + '</div><div class="pd">'
      + '<div class="jauge"><i style="width:' + g.pct + '%"></i></div>'
      + '<span class="pc">' + g.pct + ' %</span><span>' + phrase(g) + '</span>'
      + '<span class="bt">';
    if (CONF[g.id]) h += '<button class="mini dgr" data-g="arreter">${T("Arrêter la génération")}</button>'
      + '<button class="mini" data-g="continuer">${T("Continuer")}</button>';
    else {
      if (g.etat === 'cours' && !ARRET[g.id]) h += '<button class="mini dgr" data-g="annuler">${T("Annuler")}</button>';
      h += '<button class="mini" data-g="fermer">${T("Fermer")}</button>';
    }
    return h + '</span></div>';
  }

  function peindre(){
    var vis = LISTE.filter(function(g){ return !FERMES[g.id]; });
    pile.innerHTML = vis.map(function(g){
      return '<div class="suivi' + ((CONF[g.id] || ARRET[g.id] || g.etat === 'interrompu') ? ' annule' : '') + '" data-id="' + esc(g.id) + '">' + boite(g) + '</div>';
    }).join('');
    if (!vis.length) { if (msg) msg.textContent = ''; return 0; }
    return Math.ceil(pile.getBoundingClientRect().height + (msg && msg.textContent ? msg.getBoundingClientRect().height + 12 : 0));
  }

  /* Le processus principal pose la liste (toutes les 1,5 s) et lit la hauteur à donner à la fenêtre ; 0 = la cacher. */
  window.szMaj = function(liste){
    LISTE = Array.isArray(liste) ? liste : [];
    LISTE.forEach(function(g){
      if (g.resteAffiche && !FIN[g.id]) FIN[g.id] = setTimeout(function(){ FERMES[g.id] = true; peindre(); }, g.resteAffiche + 50);
      if (g.etat !== 'cours') { delete CONF[g.id]; }
    });
    return peindre();
  };

  pile.addEventListener('click', function(ev){
    var b = ev.target.closest('[data-g],[data-ouvrir]'); if (!b) return;
    var box = b.closest('.suivi'); if (!box) return;
    var id = box.getAttribute('data-id');
    var g = LISTE.filter(function(x){ return x.id === id; })[0]; if (!g) return;
    if (b.hasAttribute('data-ouvrir')) { ouvrirGenerations(); return; }
    var geste = b.getAttribute('data-g');
    if (geste === 'annuler') { CONF[id] = true; peindre(); return; }
    if (geste === 'continuer') { delete CONF[id]; peindre(); return; }
    if (geste === 'arreter') {
      delete CONF[id]; ARRET[id] = true; peindre();
      appeler('generations:agir', [id, 'interrompre']).then(function(r){
        if (r.ok) { if (msg) msg.textContent = ''; return; }
        delete ARRET[id];
        if (msg) msg.textContent = '${T("L’arrêt n’a pas pu être demandé — ouvrez la fenêtre Générations.")}';
        peindre();
      });
      return;
    }
    if (geste === 'fermer') {
      FERMES[id] = true;
      // une génération échouée, fermée ici, a été vue : la fenêtre Générations ne la signale plus
      if (g.etat === 'echec') appeler('generations:agir', [id, 'vu']);
      peindre();
    }
  });

  /* LA PREMIÈRE PEINTURE : la page lit la file elle-même (même règle que le processus principal, aMontrer), sans
     attendre sa première lecture ; ensuite, c est lui qui la tient à jour. */
  appeler('generations:etat', []).then(function(r){ if (r && r.ok && !LISTE.length) window.szMaj(aMontrer(r.liste, Date.now())); });

  window.szPret = true;
})();
</script>
</body></html>`;
}

module.exports = { pageTaches, REGLE_JS };
