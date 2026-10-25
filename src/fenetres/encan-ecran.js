'use strict';

/*
 * ENCAN EN DIRECT — L ÉCRAN FILMÉ (2026-10-20, lot 1)
 * =============================================================================
 * L écran vertical que la caméra du direct (ou LIVE Studio, en capture de
 * fenêtre) montre aux spectatrices : le minuteur, l enchère, le pseudo en tête.
 * Sa capture « live bon plan » en modèle, aux couleurs de Sandriza (caramel).
 *
 * ⚠ CE QUE CETTE FENÊTRE NE FAIT JAMAIS : elle n écrit rien, ne décide de rien.
 * Le moteur (src/encan.js, processus principal) POUSSE son état ; elle l affiche.
 * Comme l affichage client du comptoir — on la met devant tout le monde.
 *
 * ⚠ JAMAIS DE LIEN NI DE CODE À L ÉCRAN (sa décision) : une autre personne le
 * prendrait. La gagnante écrit « GAGNÉ » en message privé ; le lien lui répond là.
 *
 * ⚠ AUCUN ACCENT GRAVE dans la portion de code de la page, commentaires compris.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, TETE } = require('./socle.js');
const T = require('../langue').tr('encan-ecran');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden;background:#111111}
/* ⚠ L ECRAN FILME RESTE SOMBRE, QUEL QUE SOIT LE THEME DU POSTE : le mode jour repeignait son fond en
   creme, et le caramel n y etait plus lisible (1,9 : 1). C est un ecran de diffusion, pas un ecran de travail. */
html.jour,html.jour body,.scene{background:#111111;color:#F8F6F3}
body{color:#F8F6F3;font:16px/1.3 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;align-items:center;justify-content:center}
/* La scene garde le format vertical 9:16 quelle que soit la fenetre : la camera
   du direct la cadre telle quelle. Les tailles suivent la HAUTEUR (vh). */
.scene{position:relative;height:100vh;width:56.25vh;max-width:100vw;overflow:hidden;
  display:flex;flex-direction:column;align-items:center;padding:4vh 3.6vh 0;gap:2.2vh}
.marque{display:flex;align-items:center;gap:1vh;font-size:1.55vh;letter-spacing:.32em;color:#C9C2B8}
.marque .sz{font-family:Georgia,serif;font-size:2.3vh;letter-spacing:0;color:#D9A86C}
.marque .sz i{font-style:italic}
.marque .filet{width:1px;height:2vh;background:#D9A86C}
.essai{position:absolute;top:1.4vh;right:1.4vh;font-size:1.25vh;font-weight:800;letter-spacing:.14em;
  color:#111;background:#F8F6F3;border-radius:99px;padding:.35vh 1vh}
.titre{text-align:center}
.titre .n{font-size:4.4vh;font-weight:900;line-height:1.05;color:#D9A86C;text-transform:uppercase}
.titre .v{font-size:2.2vh;font-weight:600;margin-top:.6vh}
.temps{width:100%;border:.3vh solid #D9A86C;border-radius:1.8vh;padding:1.8vh 2.4vh 2.2vh;
  display:flex;flex-direction:column;align-items:center;gap:.6vh;position:relative}
.temps.pause{border-style:dashed;border-color:#8A8A8A}
.temps.plus{background:#241C12}
.lbl{font-size:1.5vh;font-weight:800;letter-spacing:.2em;color:#C9C2B8}
.chrono{font-size:12vh;font-weight:900;line-height:1;color:#D9A86C;font-variant-numeric:tabular-nums}
.temps.pause .chrono{color:#F8F6F3}
.barre{width:100%;height:1vh;border-radius:.6vh;background:#2B2B2B;overflow:hidden;margin-top:.8vh}
.barre i{display:block;height:100%;background:#D9A86C;transition:width .2s linear}
.bulle{position:absolute;top:-1.8vh;right:1.8vh;background:#D9A86C;color:#111;font-weight:900;
  font-size:2.2vh;padding:.4vh 1.4vh;border-radius:99px;display:none}
.temps.plus .bulle{display:block}
.prix{display:flex;flex-direction:column;align-items:center;gap:.8vh}
.prix .m{font-size:13.2vh;font-weight:900;line-height:.95;font-variant-numeric:tabular-nums}
.pastille{background:#D9A86C;color:#111;font-weight:800;font-size:2.4vh;padding:.6vh 1.8vh;border-radius:.8vh}
.pastille.vide{background:transparent;color:#F8F6F3;border:1px solid #3A3A3A}
.appel{font-size:2.2vh;font-weight:600;margin-top:.4vh;text-align:center}
.sous{font-size:1.7vh;color:#C9C2B8;margin-top:-1.4vh;text-align:center}
.bas{position:absolute;left:0;right:0;bottom:0;background:#D9A86C;color:#111;display:flex;
  flex-direction:column;padding:1.4vh 2.4vh 1.8vh;gap:.4vh}
.bas .l{display:flex;justify-content:space-between;font-size:1.8vh;font-weight:600}
.bas .l:first-child{font-size:2.2vh;font-weight:800}
.bas .l:nth-child(2){opacity:.78}.bas .l:nth-child(3){opacity:.62}
/* Page de garde */
.garde{justify-content:space-between;padding:7vh 4vh 5.6vh}
.logo{display:flex;align-items:center;gap:2.2vh;margin-top:9vh}
.logo .sz{font-family:Georgia,serif;font-size:9.6vh;line-height:1}
.logo .sz i{color:#D9A86C}
.logo .filet{width:.2vh;height:9.6vh;background:#D9A86C}
.logo .nom{font-family:Georgia,serif;font-size:4vh;letter-spacing:.16em}
.logo .dev{font-size:1.2vh;letter-spacing:.3em;color:#C9C2B8;margin-top:.8vh}
.annonce{display:flex;flex-direction:column;align-items:center;gap:2.8vh}
.annonce .t{font-size:3vh;font-weight:800;text-align:center;line-height:1.25}
.annonce .s{font-size:1.8vh;color:#C9C2B8;text-align:center}
.regles{width:100%;border:1px solid #3A3A3A;border-radius:1.6vh;padding:2.2vh 2.4vh;display:flex;flex-direction:column;gap:1.4vh}
.regles .h{font-size:1.4vh;font-weight:800;letter-spacing:.2em;color:#D9A86C}
.regles .r{display:flex;gap:1.4vh;font-size:1.8vh;line-height:1.35}
.regles .r b.k{font-weight:900;color:#D9A86C}
.regles .f{font-size:1.4vh;color:#C9C2B8}
/* Adjuge */
.adj{padding-bottom:4.8vh;gap:2.4vh}
.adj .mot{font-family:Georgia,serif;font-size:9.6vh;font-weight:700;color:#D9A86C;margin-top:4vh}
.adj .art{font-size:2.6vh;font-weight:600;text-align:center}
.adj .m{font-size:15vh;font-weight:900;line-height:.95;font-variant-numeric:tabular-nums}
.adj .pastille{font-size:3.4vh;padding:1vh 2.6vh;border-radius:1vh;font-weight:900}
.cadre{width:100%;border:1px solid #3A3A3A;border-radius:1.6vh;padding:2.2vh 2.4vh;display:flex;
  flex-direction:column;gap:1vh;margin-top:auto}
.cadre .a{font-size:2.2vh;font-weight:800}
.cadre .b{font-size:2.6vh;font-weight:900;color:#D9A86C;line-height:1.25}
.cadre .d{font-size:1.8vh;line-height:1.4;color:#E4DED5}
.cadre .e{font-size:1.4vh;color:#C9C2B8}
`;

function pageEncanEcran() {
  return `${TETE()}
<title>${T("Écran de l’encan")}</title>
<style>${CSS_JOUR}${CSS}</style></head><body>
<div class="scene" id="scene"></div>
<div id="msg" hidden></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var scene = document.getElementById('scene');
  var E = null, RECU = 0, PLUS_JUSQUA = 0;

  function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  /* L argent comme la boutique : « 45 $ », « 45,50 $ » (le symbole suit la langue du poste). */
  function argent(n){
    var v = Math.round((Number(n) || 0) * 100) / 100;
    return szArgentSymbole(szArgentNombre(v, v % 1 === 0 ? 0 : 2));
  }
  function chrono(ms){
    var s = Math.ceil(Math.max(0, ms) / 1000), m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }
  function marque(){
    return '<div class="marque"><span class="sz">${T("S")}<i>${T("z")}</i></span><span class="filet"></span><span>${T("SANDRIZA · ENCAN")}</span></div>'
      + (E && E.essai ? '<div class="essai">${T("MODE ESSAI")}</div>' : '');
  }
  function restant(){
    if (!E) return 0;
    if (E.phase !== 'encours') return E.restantMs;
    return Math.max(0, E.restantMs - (Date.now() - RECU));
  }

  function garde(){
    scene.className = 'scene garde';
    scene.innerHTML = (E && E.essai ? '<div class="essai">${T("MODE ESSAI")}</div>' : '')
      + '<div class="annonce"><div class="logo"><div class="sz">${T("S")}<i>${T("z")}</i></div><div class="filet"></div>'
      + '<div><div class="nom">${T("SANDRIZA")}</div><div class="dev">${T("ÉLÉGANCE · RAFFINEMENT · STYLE")}</div></div></div>'
      + '<div style="width:12vh;height:1px;background:#3A3A3A"></div>'
      + '<div class="t">${T("Prochain article")}<br>${T("dans un instant")}</div></div>'
      + '<div class="regles"><div class="h">${T("COMMENT GAGNER")}</div>'
      + '<div class="r"><b class="k">1</b><span>${T("Écris ton prix en commentaire")}</span></div>'
      + '<div class="r"><b class="k">2</b><span>${T("Le plus haut prix à la fin du temps gagne")}</span></div>'
      + '<div class="r"><b class="k">3</b><span>${T("Tu gagnes ? Envoie « GAGNÉ » en message privé")} <b>' + '${T("dans les {n} minutes")}'.replace('{n}', String(Math.round(((E && E.reglages && E.reglages.delaiGagne) || 900) / 60))) + '</b>${T(". Sinon, l’article est remis en vente.")}</span></div>'
      + '<div class="f">${T("Tu reçois ton lien pour payer · vente finale, aucun retour")}</div></div>';
  }

  function encan(){
    var a = E.article || {}, pause = E.phase === 'pause';
    var aucune = !E.nbOffres;
    var r = restant(), pct = E.dureeMs ? Math.max(0, Math.min(100, r / E.dureeMs * 100)) : 0;
    var plus = Date.now() < PLUS_JUSQUA;
    var h = marque()
      + '<div class="titre"><div class="n">' + esc(a.nom) + '</div>' + (a.variante ? '<div class="v">' + esc(a.variante) + '</div>' : '') + '</div>'
      + '<div class="temps' + (pause ? ' pause' : '') + (plus ? ' plus' : '') + '"><div class="bulle">+' + (E.reglages.ajout | 0) + ' s</div>'
      + '<div class="lbl">' + (pause ? '${T("TEMPS ARRÊTÉ")}' : '${T("TEMPS RESTANT")}') + '</div>'
      + '<div class="chrono" id="chrono">' + chrono(r) + '</div>'
      + (pause ? '' : '<div class="barre"><i id="barre" style="width:' + pct.toFixed(1) + '%"></i></div>') + '</div>'
      + '<div class="prix"><div class="lbl">' + (aucune ? '${T("MISE DE DÉPART")}' : '${T("ENCHÈRE ACTUELLE")}') + '</div>'
      + '<div class="m">' + argent(aucune ? E.reglages.depart : E.prix) + '</div>'
      + (aucune ? '<div class="pastille vide">${T("Sois la première !")}</div>' : '<div class="pastille">' + esc(E.meneur) + '</div>') + '</div>';
    if (pause) {
      h += '<div class="appel" style="font-size:3vh;font-weight:800;margin-top:1vh">${T("Pause — on revient vite")}</div>'
        + '<div class="sous">${T("Les prix écrits pendant la pause ne comptent pas")}</div>';
    } else {
      h += '<div class="appel">${T("Écris ton prix en commentaire")}</div>'
        + '<div class="sous">' + (aucune ? '${T("Plus haut prix à la fin du temps = gagnant")}'
            : '${T("Pour passer devant : {n} ou plus")}'.replace('{n}', argent(E.prochaine))) + '</div>';
    }
    if (!pause && E.offres && E.offres.length) {
      h += '<div class="bas">' + E.offres.slice(0, 3).map(function(o, i){
        return '<div class="l"><span>' + esc(o.pseudo) + '</span><span>' + argent(o.montant) + (i === 0 ? ' <span class="ic">★</span>' : '') + '</span></div>';
      }).join('') + '</div>';
    }
    scene.className = 'scene';
    scene.innerHTML = h;
  }

  function adjuge(){
    var a = E.article || {}, g = E.gagnant || {};
    var art = [a.nom, a.variante].filter(Boolean).join(' · ');
    var h = marque() + '<div class="mot">' + (E.phase === 'vendu' ? '${T("Vendu")}' : '${T("Adjugé")}') + '</div>'
      + '<div class="art">' + esc(art) + '</div>'
      + '<div class="m">' + argent(g.montant) + '</div>'
      + '<div class="pastille">' + esc(g.pseudo) + '</div><div class="cadre">';
    if (E.phase === 'adjuge') {
      /* (2026-10-20, sa remarque) PAS DE MINUTEUR ICI : on enchaîne sur l'article suivant. Le délai court quand
         même (console : « En attente de GAGNÉ ») ; l'écran ne dit que la règle. */
      h += '<div class="a">${T("Bravo, tu as gagné !")}</div>'
        + '<div class="b">${T("Envoie « GAGNÉ » en message privé")}</div>'
        + '<div class="d">' + '${T("Tu as {n} minutes pour nous écrire ; sinon, l’article est remis en vente. On te répond avec ton lien pour payer.")}'.replace('{n}', String(Math.round((E.reglages.delaiGagne || 900) / 60))) + '</div>';
    } else if (E.phase === 'expire') {
      h += '<div class="a">${T("Délai passé")}</div><div class="d">${T("L’article est remis en vente dans un instant.")}</div>';
    } else {
      h += '<div class="a">${T("Merci !")}</div><div class="d">${T("Ta commande est en préparation.")}</div>';
    }
    h += '<div class="e">${T("Vente finale · aucun retour")}</div></div>';
    scene.className = 'scene adj';
    scene.innerHTML = h;
  }

  function dessiner(){
    if (!E || E.phase === 'garde' || E.phase === 'annule') { garde(); return; }
    if (E.phase === 'adjuge' || E.phase === 'expire' || E.phase === 'vendu') { adjuge(); return; }
    encan();
  }

  /* Entre deux poussees, le chrono et la barre avancent seuls (aucun aller-retour). */
  function battre(){
    if (E && E.phase === 'encours') {
      var c = document.getElementById('chrono'), b = document.getElementById('barre');
      var r = restant();
      if (c) c.textContent = chrono(r);
      if (b && E.dureeMs) b.style.width = Math.max(0, Math.min(100, r / E.dureeMs * 100)).toFixed(1) + '%';
    }
  }

  function recevoir(etat){
    if (!etat || !etat.reglages) return;
    var avant = E;
    RECU = Date.now();
    /* La bulle « +15 s » s allume une seconde et demie quand une offre allonge le temps. */
    if (avant && avant.phase === 'encours' && etat.phase === 'encours' && etat.nbOffres > (avant.nbOffres || 0)) PLUS_JUSQUA = RECU + 1500;
    var redessiner = !avant || avant.phase !== etat.phase || avant.nbOffres !== etat.nbOffres || avant.prix !== etat.prix
      || avant.essai !== etat.essai || JSON.stringify(avant.article) !== JSON.stringify(etat.article)
      || (PLUS_JUSQUA && RECU > PLUS_JUSQUA - 200)
      /* (2026-10-25, audit) Hors du decompte, un reglage change (duree, « +15 s », delai GAGNE) se
         redessine aussi : battre() n avance le chrono qu en cours, l ecran filmé gardait l ancien chiffre. */
      || JSON.stringify(avant.reglages) !== JSON.stringify(etat.reglages)
      || (etat.phase !== 'encours' && avant.restantMs !== etat.restantMs);
    E = etat;
    if (redessiner) dessiner();
  }

  if (P && P.encan && typeof P.encan.lire === 'function') {
    P.encan.surEtat(recevoir);
    P.encan.lire().then(recevoir);
  } else {
    garde();
  }
  setInterval(function(){ if (PLUS_JUSQUA && Date.now() > PLUS_JUSQUA) { PLUS_JUSQUA = 0; dessiner(); } }, 250);
  /* 10 fois par seconde : le chrono descend net, sans demander quoi que ce soit au moteur. */
  setInterval(battre, 100);
})();
</script></body></html>`;
}

module.exports = { pageEncanEcran };
