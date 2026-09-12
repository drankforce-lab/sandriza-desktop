'use strict';

/*
 * LA CONFIRMATION DE DÉCONNEXION — EN NATIF
 * =============================================================================
 * Sa demande, qu'il a dû faire DEUX FOIS parce que je ne l'avais pas notée la
 * première : « refaire la boîte Déconnexion en natif et plus belle ».
 *
 * ⚠⚠ ET CE N'EST PAS QU'UNE QUESTION D'APPARENCE. La boîte qu'elle remplace
 * était dessinée DANS LA PAGE (`askEmpile`). Une boîte dessinée dans la page
 * passe SOUS toute vue native ancrée — c'est écrit dans `src/menubar.js` depuis
 * la 1.56.1, et ça m'a coûté trois versions sur l'écran de connexion avant que
 * je le relise. Concrètement : cliquer « Déconnexion » pendant qu'un écran natif
 * est ancré posait la question SOUS l'écran. On ne voyait rien, et rien ne se
 * passait — la pire des deux façons d'échouer, puisqu'elle ressemble à un clic
 * qui n'a pas pris.
 *
 * ⚠ UNE FENÊTRE DE L'APPLICATION, pas un `dialog.showMessageBox` du système :
 * celui-ci impose le décor de Windows au milieu d'une application qui a le sien,
 * et c'est exactement le reproche qu'il a fait à l'écran de connexion.
 *
 * ⚠ LE FOYER PART SUR « ANNULER », ET C'EST DÉLIBÉRÉ — la boîte web le faisait
 * déjà, et on ne perd pas une garde en changeant de support : une frappe
 * d'Entrée restée dans les doigts ne doit pas déconnecter. Échap et la croix
 * annulent aussi.
 *
 * ⚠ ELLE NE DÉCONNECTE RIEN ELLE-MÊME. Elle rend « oui » ou « non », et c'est le
 * site qui appelle `Staff.logout()`. Une fenêtre qui fermerait la session
 * elle-même court-circuiterait tout ce que la déconnexion fait d'autre côté
 * site — et sa fermeture accidentelle deviendrait une déconnexion.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.85rem 1.05rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#1b2233,#0e1522)}
.tete h1{margin:0;font:700 .98rem/1.3 inherit;color:var(--tx)}
/* La pastille porte le seul accent de couleur de la boîte. Elle ne crie pas :
   une déconnexion demandée n'est pas un incident, c'est une fin de journée. */
.rond{flex:0 0 auto;width:30px;height:30px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  background:rgba(201,169,126,0.16);color:var(--tx-or2)}
.rond svg{width:17px;height:17px}
/* ⚠ EN MODE JOUR, LA PASTILLE CHANGE DE TON — et ce n'est pas une coquetterie :
   le bronze clair (#d8bc95) posé sur le fond crème donne 1,47:1, mesuré par
   << banc-texte-sur-fond >> (4,35 puis 5,14 apres correction). Un pictogramme n'est pas du texte, mais il PORTE le
   sens de la boîte, et un sens qu'on ne distingue pas du fond n'est pas porté.
   Le bronze de la marque, lui, tient le seuil sur ce fond-là. */
html.jour .rond{background:rgba(125,95,60,0.14);color:#6f5535}
.corps{flex:1 1 auto;min-height:0;overflow-y:auto;padding:1.05rem;
  display:flex;flex-direction:column;justify-content:center}
.q{margin:0;font:600 1rem/1.45 inherit;color:var(--tx)}
.qui{margin:.55rem 0 0;font-size:.85rem;color:var(--tx2)}
.qui b{color:var(--tx);font-weight:600}
.note{margin:.85rem 0 0;font-size:.79rem;color:var(--tx2)}
.pied{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;
  padding:.7rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.ecart{flex:1 1 auto}
/* ⚠ LA LIGNE DE MESSAGE N'EST PAS UNE ANCRE DÉCORATIVE. Elle sert au seul cas
   qui compte ici : la réponse n'a pas pu partir (pont absent, fenêtre déjà
   détachée). Sans elle, un clic sur « Se déconnecter » qui n'aboutit pas ne
   laisse RIEN — ni déconnexion, ni explication. */
.msg{font-size:.78rem;color:var(--tx2);min-height:1em}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:9px;padding:.5rem .95rem;cursor:pointer;
  transition:background-color .13s ease,border-color .13s ease}
button:hover{background:var(--v10)}
button:focus-visible{outline:2px solid #c9a97e;outline-offset:2px}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover{background:#d8bc95}
@media (prefers-reduced-motion:reduce){button{transition:none}}
`;

/**
 * La boîte. `arg` est « nom|role », les deux facultatifs — une boîte qui
 * refuserait de s'ouvrir faute de nom transformerait une confirmation en
 * impossibilité de se déconnecter.
 */
function pageDeconnexion(arg) {
  const bouts = String(arg || '').split('|');
  const propre = (x) => String(x || '').replace(/[<>&"]/g, '').slice(0, 60);
  const nom = propre(bouts[0]);
  const role = propre(bouts[1]);
  /* ⚠ `data-sans-plein` : cette fenetre REFUSE le bouton de plein ecran que le
     socle pose partout ailleurs. Elle fait 560 x 340, elle n est pas
     redimensionnable, et sa carte remplit deja tout — proposer d << occuper
     toute la fenetre >> n y veut rien dire. Sa remarque du 2026-09-12. */
  return `<!doctype html><html lang="fr" data-sans-plein><head><meta charset="utf-8">
<title>Déconnexion</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete">
  <span class="rond"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"
    ><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"
    /><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
  <h1>Déconnexion</h1>
</div>
<div class="corps" id="corps"></div>
<div class="pied" id="pied"></div>
<script>
${JS_DIRE()}
(function(){
  'use strict';
  var P = window.szPont;
  var repondu = false;
  var D = ${JSON.stringify({ nom, role })};

  /* ⚠⚠ LE CORPS SE DESSINE ICI, IL N EST PAS ECRIT EN DUR DANS LA PAGE. Premier
     jet : tout le balisage etait statique, et le banc << verifier-fenetres >> n a
     RIEN pu en prouver — il ne releve que ce qu une fenetre ECRIT a l ecran.
     Une fenetre qui ne dessine rien ne se distingue pas d une fenetre cassee :
     dans les deux cas le relevé est vide.
     ⚠ Ce n est donc pas une contorsion pour faire plaisir a un outil : c est la
     convention de toutes les autres fenetres de ce dossier, et elle existe pour
     que chacune soit EPROUVABLE. */
  var qui = D.nom
    ? ('<p class="qui">Session ouverte au nom de <b>' + D.nom + '</b>'
      + (D.role ? (' — ' + D.role) : '') + '.</p>')
    : '';
  document.getElementById('corps').innerHTML =
    '<p class="q">Voulez-vous vraiment vous déconnecter ?</p>' + qui
    + '<p class="note">Le travail non enregistré sera perdu. Ce poste restera '
    + 'ouvert : seule la session se ferme.</p>';
  document.getElementById('pied').innerHTML =
    '<span class="msg" id="msg"></span><span class="ecart"></span>'
    + '<button type="button" id="non">Annuler</button>'
    + '<button type="button" id="oui" class="prim">Se déconnecter</button>';

  /* ⚠ UNE SEULE REPONSE, ET LA FERMETURE EN EST UNE. Sans ce drapeau, fermer la
     fenetre APRES avoir clique enverrait un second message — et cote site, une
     promesse deja resolue avalerait le second en silence aujourd hui, mais
     rien ne garantit qu elle le fera toujours. On tranche ici. */
  function repondre(oui){
    if (repondu) return;
    repondu = true;
    try {
      if (!P || !P.deconnexionReponse) { throw new Error('pont indisponible'); }
      P.deconnexionReponse(!!oui);
    } catch (e) {
      /* ⚠ ON REND LA MAIN plutot que de rester bloque : le drapeau retombe, les
         boutons redeviennent utiles, et on DIT pourquoi. Un bouton qui a l air
         de ne rien faire est le pire des trois. */
      repondu = false;
      szDire('La reponse n a pas pu partir (' + ((e && e.message) || e)
        + ') — fermez cette fenêtre et réessayez.', 'err');
    }
  }

  var non = document.getElementById('non');
  var oui = document.getElementById('oui');
  if (non) non.onclick = function(){ repondre(false); };
  if (oui) oui.onclick = function(){ repondre(true); };

  /* ⚠ ECHAP ANNULE. La boite web le faisait ; une boite native qui ne le ferait
     pas serait un recul deguise en modernisation. */
  window.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { e.preventDefault(); repondre(false); }
  });

  /* ⚠ ET LA CROIX AUSSI : la coquille traite la fermeture comme un NON, mais on
     le dit quand meme d ici — deux chemins pour le meme refus valent mieux
     qu un seul, quand le seul est une fenetre qui disparait. */
  window.addEventListener('beforeunload', function(){ repondre(false); });

  /* ⚠⚠ LE FOYER PART SUR << ANNULER >>, JAMAIS SUR L ACTION. Quelqu un qui
     arrive sur cette boite avec une frappe d Entree encore dans les doigts ne
     doit pas se retrouver deconnecte. La boite web le faisait deja : on ne perd
     pas une garde en changeant de support. */
  if (non) non.focus();
})();
</script></body></html>`;
}

module.exports = { pageDeconnexion };
