'use strict';

/*
 * LE GARDE DES SAISIES EN COURS — LA DÉCISION, SEULE
 * =============================================================================
 * Sorti de `main.js` pour la même raison que `dossier-exports.js` : `main.js`
 * exige le processus principal d'Electron, donc tout ce qui y dort ne se teste
 * qu'en RECOPIANT la règle dans le banc — c'est ce que `banc-maj.js` a dû faire,
 * et il porte l'avis « doit rester d'accord avec main.js », c'est-à-dire un
 * accord que personne ne vérifie. Ici, les deux côtés importent la même chose.
 *
 * ⚠ CE FICHIER NE CONNAÎT NI FENÊTRE, NI VUE, NI MINUTERIE. Il répond à deux
 * questions, et rien d'autre :
 *   1. laquelle des vues ancrées a une saisie en cours ?
 *   2. que fait-on d'une demande de fermeture ?
 * Le reste — montrer la vue, poser la question, écrire — reste dans `main.js`,
 * où vivent les objets d'Electron.
 */

/* La PREMIÈRE vue ANCRÉE (pas détachée) qui a une saisie en cours.
   ⚠ TROIS EXCLUSIONS, ET CHACUNE A SA RAISON :
   • DÉTACHÉE → elle a sa propre fenêtre, donc son propre garde du X. La traiter
     ici poserait la question DEUX FOIS pour la même saisie.
   • VUE DÉTRUITE → son identifiant a pu être réattribué à un autre webContents ;
     la croire sale ferait refuser la fermeture pour une saisie qui n'existe plus,
     et rien à l'écran ne l'expliquerait.
   • PAS SALE → le cas normal des dizaines d'autres vues. */
const premiereAncreeSale = (ancrees, estSale) => {
  for (const [cle, a] of ancrees) {
    if (!a) continue;
    if (a.fenetre && !a.fenetre.isDestroyed()) continue;
    if (!a.view || !a.view.webContents || a.view.webContents.isDestroyed()) continue;
    if (estSale(a.view.webContents.id)) return [cle, a];
  }
  return null;
};

/* Que faire d'une demande de fermeture ? Quatre réponses, dans CET ordre —
   l'ordre est la règle, pas un détail :
   • 'refuser_maj'  : une mise à jour est en cours. Elle passe avant tout : ce
     n'est pas le moment de poser une question, et une installation à moitié
     faite ne redémarre plus.
   • 'laisser'      : rien à perdre (ou on a déjà répondu). Le cas des dizaines
     de fenêtres ordinaires — on sort AVANT tout le reste, le coût est nul.
   • 'secours'      : la question est déjà posée et on redemande à fermer. On
     part, en tentant une dernière écriture. Une fenêtre incondamnable est PIRE
     que la perte qu'on évite.
   • 'demander'     : le vrai cas.
   ⚠ INVERSER 'refuser_maj' ET 'laisser' CASSERAIT LES MISES À JOUR : une fenêtre
   sans saisie se fermerait pendant l'installation. */
const decisionFermeture = ({ bloqueeParMaj, dejaAutorise, aUneSaisie, demandeEnCours }) => {
  if (bloqueeParMaj) return 'refuser_maj';
  if (dejaAutorise || !aUneSaisie) return 'laisser';
  if (demandeEnCours) return 'secours';
  return 'demander';
};

/* Le choix rapporté par la page → le geste à faire.
   0 = garder, 1 = jeter, 2 = revenir. Tout le reste (y compris `-1`, que rend
   une page qui ne sait pas répondre) vaut GARDER : le défaut d'un mécanisme
   anti-perte ne peut pas être de perdre. */
const gestePourChoix = (choix) => (choix === 2 ? 'revenir' : (choix === 1 ? 'jeter' : 'garder'));

module.exports = { premiereAncreeSale, decisionFermeture, gestePourChoix };
