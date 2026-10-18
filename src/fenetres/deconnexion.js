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

const { JS_DIRE, CSS_JOUR, TETE } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit (voir src/langue/deconnexion.js). */
const T = require('../langue').tr('deconnexion');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden}
body{background:radial-gradient(ellipse at 50% 0%,rgba(var(--or-rgb),0.10),transparent 60%),var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column}
/* (2026-10-18, sa capture : « refais cette fenêtre, c est pas beau ») UNE CARTE CENTRÉE : qui l on est, la question,
   ce qui se passe. Plus de bandeau de titre (la barre de la fenêtre le dit déjà), plus de texte flottant à gauche. */
.corps{flex:1 1 auto;min-height:0;overflow-y:auto;padding:1.3rem 1.6rem .9rem;
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:.15rem}
.avatar{width:56px;height:56px;border-radius:50%;flex:0 0 auto;margin-bottom:.55rem;
  display:flex;align-items:center;justify-content:center;
  background:var(--f-carte);color:var(--tx);border:2px solid var(--or);
  font:500 1.25rem/1 Georgia,"Times New Roman",serif;letter-spacing:.04em;box-shadow:0 6px 18px rgba(0,0,0,.35)}
.avatar svg{width:24px;height:24px;color:var(--tx-or2)}
.q{margin:0;font-weight:700;font-size:1.08rem;line-height:1.35;font-family:inherit;color:var(--tx)}
.qui{margin:.35rem 0 0;display:flex;align-items:center;justify-content:center;gap:.5rem;flex-wrap:wrap;font-size:.86rem;color:var(--tx2)}
.qui b{color:var(--tx);font-weight:600}
.role{font-size:.7rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;padding:.08rem .55rem;border-radius:999px;
  border:1px solid var(--v16);color:var(--tx2)}
.note{margin:.85rem 0 0;max-width:30rem;display:flex;gap:.5rem;align-items:flex-start;text-align:left;
  font-size:.79rem;line-height:1.45;color:var(--tx2);padding:.55rem .75rem;border-radius:10px;background:var(--v05);border:1px solid var(--v08)}
.note svg{flex:0 0 auto;width:15px;height:15px;margin-top:.1rem;color:var(--tx-or2)}
html.jour .note svg,html.jour .avatar svg{color:#6f5535}
.pied{flex:0 0 auto;display:flex;flex-direction:column;gap:.35rem;padding:.2rem 1.6rem 1.1rem}
.btns{display:flex;gap:.6rem;justify-content:center}
.btns button{flex:1 1 0;max-width:13rem}
/* ⚠ LA LIGNE DE MESSAGE N'EST PAS UNE ANCRE DÉCORATIVE : elle dit pourquoi la réponse n'a pas pu partir. */
.msg{font-size:.78rem;color:var(--tx2);min-height:1em;text-align:center}
button{font:inherit;color:var(--tx);background:var(--v05);display:inline-flex;align-items:center;justify-content:center;gap:.45rem;
  border:1px solid var(--v16);border-radius:10px;padding:.6rem 1rem;cursor:pointer;
  transition:background-color .13s ease,border-color .13s ease}
button svg{width:16px;height:16px}
button:hover{background:var(--v10)}
button:focus-visible{outline:2px solid var(--or);outline-offset:2px}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover{background:var(--or-clair)}
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
  return `${TETE('data-sans-plein')}
<title>${T("Déconnexion")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
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
  // les INITIALES de la personne (deux lettres) ; sans nom, le pictogramme de sortie
  var init = String(D.nom || '').split(' ').filter(Boolean).slice(0, 2).map(function(m){ return m.charAt(0).toUpperCase(); }).join('');
  var sortie = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';
  var qui = D.nom
    ? ('<p class="qui"><span>${T("Session ouverte au nom de ")}<b>' + D.nom + '</b></span>'
      + (D.role ? ('<span class="role">' + D.role + '</span>') : '') + '</p>')
    : '';
  document.getElementById('corps').innerHTML =
    '<div class="avatar" aria-hidden="true">' + (init || sortie) + '</div>'
    + '<p class="q">${T("Voulez-vous vraiment vous déconnecter ?")}</p>' + qui
    /* Une phrase ENTIERE dans un seul litteral. */
    + '<p class="note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12.5"/><circle cx="12" cy="16" r=".6" fill="currentColor"/></svg><span>'
    + '${T("Le travail non enregistré sera perdu. Ce poste restera ouvert : seule la session se ferme.")}'
    + '</span></p>';
  document.getElementById('pied').innerHTML =
    '<div class="btns"><button type="button" id="non">${T("Annuler")}</button>'
    + '<button type="button" id="oui" class="prim">' + sortie + '${T("Se déconnecter")}</button></div>'
    + '<span class="msg" id="msg"></span>';

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
      szDire('${T("La réponse n’a pas pu partir (")}' + ((e && e.message) || e)
        + '${T(") — fermez cette fenêtre et réessayez.")}', 'err');
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
