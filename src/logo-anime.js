'use strict';

/* ══ LE LOGO ANIMÉ — CONNEXION ET MISE À JOUR (2026-11-26) ═══════════════════════════════════════════════
   Sa demande : « une animation comme tu m'avais fait pour le portail RH pour le logo dans la page de connexion
   et dans les mises à jour, dans le thème sombre et clair ». Les trois gestes du portail RH (portail-rh.php,
   .vitrine) : un REFLET doré qui traverse le logo, le HALO qui respire, une POUSSIÈRE d'or qui monte.

   ⚠ PAS LE GIF DU PORTAIL. Il est peint sur un fond NOIR (#111) : posé sur la carte blanche du jour, il
   ferait un rectangle. Ici le reflet est un dégradé MASQUÉ PAR LE LOGO LUI-MÊME (le PNG est transparent) :
   il ne colore que les lettres, quelle que soit la couleur du fond — et quel que soit le logo capturé.
   ⚠ Un seul module pour les deux écrans (src/main.js, la porte ; src/fenetres/connexion.js) : passer de la
   connexion à la mise à jour ne doit rien faire « sauter ».
   ⚠ prefers-reduced-motion n'est PAS suivi : voir la note sous le CSS. */

// Le CSS. `plaque` : le sélecteur de la plaque du logo (son ::before est le halo) ; `zone` : le panneau de marque.
const css = (plaque, zone) => ''
  + '.sz-logo{position:relative;display:block;margin:0 auto;line-height:0}'
  + '.sz-reflet{position:absolute;inset:0;z-index:2;pointer-events:none;'
  +   '-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;'
  +   'background:linear-gradient(105deg,transparent 0%,transparent 38%,rgba(255,236,200,.0) 42%,rgba(232,196,140,.95) 49%,rgba(255,244,222,1) 50%,rgba(232,196,140,.95) 51%,rgba(255,236,200,0) 58%,transparent 62%,transparent 100%);'
  +   'background-size:300% 100%;background-repeat:no-repeat;background-position:85% 0;animation:sz-reflet 6s cubic-bezier(.45,.05,.35,1) 1.2s infinite}'
  + plaque + '::before{animation:sz-respire 7s ease-in-out infinite}'
  + '.sz-pous{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}'
  + '.sz-pous i{position:absolute;bottom:-10px;width:4px;height:4px;border-radius:50%;background:rgb(var(--cx-a-rgb,196,154,108));box-shadow:0 0 6px rgba(var(--cx-a-rgb,196,154,108),.7);opacity:0;animation:sz-monte 9s linear infinite}'
  + '.sz-pous i:nth-child(1){left:8%;animation-delay:0s}.sz-pous i:nth-child(2){left:17%;animation-delay:2.2s;width:2px;height:2px}'
  + '.sz-pous i:nth-child(3){left:26%;animation-delay:4.1s}.sz-pous i:nth-child(4){left:35%;animation-delay:1.3s;width:4px;height:4px}'
  + '.sz-pous i:nth-child(5){left:44%;animation-delay:6.2s}.sz-pous i:nth-child(6){left:53%;animation-delay:3.4s;width:2px;height:2px}'
  + '.sz-pous i:nth-child(7){left:62%;animation-delay:5.1s}.sz-pous i:nth-child(8){left:71%;animation-delay:.7s;width:4px;height:4px}'
  + '.sz-pous i:nth-child(9){left:80%;animation-delay:7.3s}.sz-pous i:nth-child(10){left:89%;animation-delay:2.9s;width:2px;height:2px}'
  + '.sz-pous i:nth-child(11){left:95%;animation-delay:8.1s}.sz-pous i:nth-child(12){left:4%;animation-delay:5.7s;width:2px;height:2px}'
  + '@keyframes sz-reflet{0%{background-position:85% 0}45%,100%{background-position:15% 0}}'
  + '@keyframes sz-respire{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.12);opacity:1}}'
  + '@keyframes sz-monte{0%{transform:translateY(0);opacity:0}10%{opacity:.85}100%{transform:translateY(-105vh);opacity:0}}'
  + '';
/* ⚠ PAS DE prefers-reduced-motion ICI, ET C'EST VOULU (2026-11-26). Son Windows a les « effets d'animation »
   coupés (UserPreferencesMask) : Chrome et Electron le lisent comme « réduire les animations », et la première
   version, qui le respectait, n'animait RIEN chez lui — capture à l'appui. Le portail RH, qu'il a aimé, ne le
   respecte pas non plus. L'animation est lente et discrète (un reflet toutes les 6 s, un halo qui respire). */

const POUSSIERE = '<span class="sz-pous" aria-hidden="true">' + new Array(13).join('<i></i>') + '</span>';

module.exports = { css, POUSSIERE };
