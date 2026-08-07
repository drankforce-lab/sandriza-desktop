'use strict';

/*
 * AFFICHAGE CLIENT DE LA CAISSE — NATIF
 * =============================================================================
 * La vitrine du deuxième écran : ce que la caissière scanne, le prix, et le total
 * qui monte. C'est ce que fait l'afficheur d'une vraie caisse, et c'est ce qui
 * évite la question « ça fait combien ? » au moment de payer.
 *
 * ⚠ POURQUOI ELLE A CHANGÉ DE TRANSPORT.
 * La version précédente chargeait une page du site : une fenêtre qui téléchargeait
 * le site ENTIER — 34 modules, la session, l'administration — pour afficher une
 * liste de prix, puis effaçait tout le document pour dessiner la sienne. Ça
 * fonctionnait, mais c'était une page web déguisée, avec le décor de la boutique
 * à un défaut de masquage près.
 *
 * ⚠ ET LES DEUX ANCIENS CANAUX SONT IMPOSSIBLES ICI. La caisse diffusait son état
 * par BroadcastChannel et, en repli, par l'événement « storage » du stockage
 * local. Les deux exigent une ORIGINE COMMUNE. Une fenêtre native est chargée en
 * « data: » : son origine est nulle, le stockage local y lève SecurityError
 * (mesuré, pas supposé) et aucun canal ne peut la rejoindre. D'où un troisième
 * transport : la caisse POUSSE son état au processus principal, qui le relaie ici.
 * Aucun aller-retour réseau, donc l'affichage suit le scan à l'instant près.
 *
 * ⚠ CE QUE CETTE FENÊTRE NE FAIT JAMAIS. Elle n'écrit rien, n'appelle aucune API,
 * ne décide de rien. Elle AFFICHE. La caisse reste la seule autorité — c'est ce
 * qui permet de la poser devant une cliente sans y penser à deux fois.
 *
 * ⚠ AUCUN ACCENT GRAVE dans la portion de code de la page, commentaires compris :
 * le contenu part dans un littéral de gabarit, et un seul le referme. Vécu cinq
 * fois sur ce projet, dont quatre le 2026-08-07. Le garde-fou
 * (tools/verifier-fenetres.js) le vérifie avant chaque publication.
 */

const { JS_ACTIVITE } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden}
body{background:linear-gradient(160deg,#0d1420 0%,#141d2c 55%,#0d1420 100%);
  color:#f1ece4;font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column}
.tete{display:flex;align-items:center;justify-content:space-between;gap:1rem;
  padding:1.1rem 1.8rem;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0}
.tete img{max-height:46px;width:auto;display:block}
.tete .nom{font-family:Georgia,serif;font-size:1.5rem;font-weight:800;letter-spacing:.06em}
.tete .sous{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:#9fb0c4}
.corps{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;padding:1.1rem 1.8rem}
/* ⚠ C'est la LISTE qui defile, pas la page : le bloc des totaux doit rester
   visible en permanence, c'est la seule chose que la cliente cherche. */
.liste{flex:1 1 auto;overflow-y:auto;min-height:0}
.liste::-webkit-scrollbar{width:8px}
.liste::-webkit-scrollbar-thumb{background:rgba(255,255,255,.14);border-radius:8px}
.ln{display:flex;align-items:baseline;gap:1rem;padding:.72rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.ln .q{flex:0 0 auto;min-width:2.6rem;font-variant-numeric:tabular-nums;color:#c9a97e;font-weight:700;font-size:1.05rem}
.ln .d{flex:1 1 auto;min-width:0}
.ln .n{font-size:1.12rem;font-weight:600;line-height:1.3}
.ln .v{font-size:.82rem;color:#9fb0c4;margin-top:.15rem}
.ln .p{flex:0 0 auto;font-variant-numeric:tabular-nums;font-size:1.12rem;font-weight:600}
/* Le dernier article scanne se signale une seconde : la cliente voit CE qu'on
   vient d'ajouter, sans avoir a comparer deux listes. */
.ln.neuf{animation:surligne 1.4s ease-out}
@keyframes surligne{0%{background:rgba(201,169,126,.22)}100%{background:transparent}}
.bas{flex:0 0 auto;border-top:1px solid rgba(255,255,255,.1);padding-top:.9rem;margin-top:.6rem}
.sl{display:flex;justify-content:space-between;font-size:.95rem;color:#b9c6d6;padding:.2rem 0}
.sl b{font-variant-numeric:tabular-nums;font-weight:600;color:#e6ded2}
.tot{display:flex;justify-content:space-between;align-items:baseline;margin-top:.7rem;
  padding-top:.8rem;border-top:2px solid rgba(201,169,126,.45)}
.tot .lb{font-size:1.15rem;letter-spacing:.12em;text-transform:uppercase;color:#c9a97e;font-weight:700}
.tot .vl{font-variant-numeric:tabular-nums;font-size:3.1rem;font-weight:800;line-height:1;
  font-family:Georgia,serif;color:#fff}
.vide{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;text-align:center}
.vide img{max-width:min(340px,60vw);height:auto}
.vide .msg{font-size:1.05rem;color:#9fb0c4}
/* ⚠ UN ETAT << PAS ENCORE RELIE >> DISTINCT DU PANIER VIDE. Si la fenetre
   principale ne repond pas, la cliente verrait << Bienvenue >> alors que rien
   n'est branche — et la caissiere croirait l'afficheur en marche. */
.avis{position:fixed;left:50%;transform:translateX(-50%);bottom:1rem;
  background:rgba(200,140,40,.16);border:1px solid rgba(240,180,80,.5);color:#f5d18a;
  border-radius:99px;padding:.3rem .9rem;font-size:.78rem;display:none}
.avis.on{display:block}
@media (max-width:760px){.tot .vl{font-size:2.3rem}.corps{padding:.9rem 1.1rem}}
@media (prefers-reduced-motion:reduce){.ln.neuf{animation:none}}
`;

/** Page complète de l'affichage client. */
function pageAffichage() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Affichage client</title>
<style>${CSS}</style></head><body>
<div class="tete" id="tete"><div class="nom">SANDRIZA</div>
  <div class="sous">Votre commande</div></div>
<div class="corps" id="corps"></div>
<div class="avis" id="msg"></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}
  var corps = document.getElementById('corps');
  var avis  = document.getElementById('msg');
  var MARQUE = { logo: '', nom: 'SANDRIZA' };

  function fmt(n){
    return (Math.round((Number(n) || 0) * 100) / 100).toFixed(2).replace('.', ',') + ' $';
  }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function dire(t){
    avis.textContent = t || '';
    avis.classList.toggle('on', !!t);
  }

  function enTete(){
    var t = document.getElementById('tete');
    var g = MARQUE.logo
      ? '<img src="' + esc(MARQUE.logo) + '" alt="">'
      : '<div class="nom">' + esc(MARQUE.nom) + '</div>';
    t.innerHTML = g + '<div class="sous">Votre commande</div>';
  }

  function accueil(){
    return '<div class="vide">'
      + (MARQUE.logo ? '<img src="' + esc(MARQUE.logo) + '" alt="">'
                     : '<div class="nom">' + esc(MARQUE.nom) + '</div>')
      + '<div class="msg">Bienvenue. Votre commande s’affichera ici.</div></div>';
  }

  var dernierNb = 0;

  function dessiner(etat){
    var lignes = (etat && etat.lignes) || [];
    if (!lignes.length) { corps.innerHTML = accueil(); dernierNb = 0; return; }

    // Le dernier article ajoute se surligne : on compare le NOMBRE de lignes, pas
    // leur contenu — une quantite qui monte sur une ligne existante n'est pas un
    // article neuf, et la faire clignoter attirerait l'oeil au mauvais endroit.
    var neuve = lignes.length > dernierNb ? lignes.length - 1 : -1;
    dernierNb = lignes.length;

    var t = etat.totaux || {};
    var h = ['<div class="liste">'];
    lignes.forEach(function(l, i){
      var variante = [l.size, l.color].filter(Boolean).join(' · ');
      h.push('<div class="ln' + (i === neuve ? ' neuf' : '') + '">'
        + '<div class="q">' + (l.quantity || 1) + '×</div>'
        + '<div class="d"><div class="n">' + esc(l.name) + '</div>'
        + (variante ? '<div class="v">' + esc(variante) + '</div>' : '')
        + '</div>'
        + '<div class="p">' + fmt((l.price || 0) * (l.quantity || 1)) + '</div></div>');
    });
    h.push('</div><div class="bas">');
    if (t.sousTotal != null) h.push('<div class="sl"><span>Sous-total</span><b>' + fmt(t.sousTotal) + '</b></div>');
    if (t.rabais)    h.push('<div class="sl"><span>Rabais</span><b>− ' + fmt(t.rabais) + '</b></div>');
    if (t.livraison) h.push('<div class="sl"><span>Livraison</span><b>' + fmt(t.livraison) + '</b></div>');
    (t.taxes || []).forEach(function(x){
      h.push('<div class="sl"><span>' + esc(x.nom) + '</span><b>' + fmt(x.montant) + '</b></div>');
    });
    h.push('<div class="tot"><span class="lb">Total</span><span class="vl">' + fmt(t.total) + '</span></div>');
    h.push('</div>');
    corps.innerHTML = h.join('');
  }

  corps.innerHTML = accueil();

  // ⚠ REPRISE DE L ETAT DEJA EN COURS. Ouvrir l afficheur au milieu d une vente ne
  // doit pas montrer un ecran vide devant la cliente. La poussee ne porte que les
  // changements A VENIR : l etat courant se demande une fois, a l ouverture.
  // C est aussi ce qui rapporte la MARQUE — le logo et le nom vivent dans le
  // stockage du site, inatteignable depuis un document local.
  function initial(){
    P.appeler('caisse:etat').then(function(r){
      if (!r || !r.ok) {
        // ⚠ ON LE DIT. Sans cet avis, la cliente verrait << Bienvenue >> et la
        // caissiere croirait l afficheur branche alors qu il ne recoit rien.
        dire('Pas encore relié à la caisse');
        return;
      }
      dire('');
      if (r.marque) { MARQUE = r.marque; enTete(); }
      if (r.etat) dessiner(r.etat);
      else corps.innerHTML = accueil();
    });
  }

  // La poussee : la caisse envoie son etat a chaque changement, le processus
  // principal le relaie ici. Aucun reseau, donc aucun delai visible.
  if (P && P.surEtatCaisse) {
    P.surEtatCaisse(function(etat){
      dire('');
      if (etat && etat.marque) { MARQUE = etat.marque; enTete(); }
      dessiner(etat);
    });
  } else {
    dire('Cette version de l’application ne relaie pas la caisse');
  }

  initial();

  // ⚠ ON REDEMANDE L ETAT AU RETOUR DE VEILLE. Un ecran de comptoir reste ouvert
  // des heures ; si une poussee a ete perdue pendant une mise en veille, la cliente
  // suivante verrait le panier de la precedente. Le cout est nul quand rien n a
  // bouge.
  window.addEventListener('focus', initial);
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden) initial();
  });
})();
</script></body></html>`;
}

module.exports = { pageAffichage };
