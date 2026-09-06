'use strict';

/*
 * LE CURSEUR DU VEILLEUR — LA DÉCISION, SANS ELECTRON
 * =============================================================================
 * Sorti de `veilleur.js` pour la même raison que `brouillon-garde.js` l'a été de
 * `main.js` : ces fichiers-là exigent Electron, donc rien de ce qu'ils contiennent
 * ne peut être éprouvé. Ici il n'y a que des chaînes et des nombres, et
 * `tools/banc-veilleur.js` les met à l'épreuve en une seconde.
 *
 * ⚠⚠ C'EST LA PIÈCE QUI PERD DES COMMANDES SI ELLE SE TROMPE, et son erreur est
 * MUETTE : un curseur trop avancé ne provoque aucune panne, aucun message, aucune
 * trace. Il fait simplement qu'une commande ne sonne jamais. On ne s'en aperçoit
 * qu'en la découvrant, froide, dans la liste. D'où un module à part et un banc.
 *
 * ══ LES DEUX FAÇONS DE SE TROMPER ═══════════════════════════════════════════
 *   • TROP AVANCER  → une commande passe inaperçue. C'est la faute grave : elle
 *     se paie en délai de traitement, et rien ne la signale.
 *   • PAS ASSEZ     → la même commande sonne deux fois. C'est agaçant, et c'est
 *     tout. En cas de doute, on choisit donc de ne pas assez avancer.
 *
 * ⚠ POURQUOI PAS `depuis = maintenant` APRÈS UN TOUR RÉUSSI. C'est l'écriture
 * qui vient naturellement, et elle perd des commandes : une commande créée
 * PENDANT l'aller-retour porte un horodatage antérieur à `maintenant` sans avoir
 * été comptée par la requête. Elle tomberait entre les deux, définitivement.
 * On n'avance donc QUE jusqu'au plus récent élément réellement compté.
 *
 * ⚠ ET POURQUOI ON NE RECULE JAMAIS. Un serveur qui rendrait un horodatage plus
 * ancien que le curseur (horloge remise à l'heure, réplique en retard) ferait
 * resonner tout l'historique. Le curseur est monotone par construction.
 */

/**
 * @param {string|null} actuel   le curseur en mémoire ('' ou null au premier tour)
 * @param {object} rep           la réponse de notif-feed.php
 * @returns {string|null}        le curseur à retenir
 */
function curseurSuivant(actuel, rep) {
  const cur = (typeof actuel === 'string' && actuel !== '') ? actuel : null;
  if (!rep || typeof rep !== 'object') return cur;

  const vus = [
    rep.commandes && rep.commandes.dernier,
    rep.retours && rep.retours.dernier,
  ].filter((v) => typeof v === 'string' && v !== '');

  if (!vus.length) {
    // Rien de nouveau. Au TOUT premier tour, la route rend `maintenant` et
    // aucune nouveauté : c'est l'amorce, on pose le curseur pour ne pas
    // annoncer d'un coup toutes les commandes jamais passées. Ensuite, on garde.
    if (cur === null && typeof rep.maintenant === 'string' && rep.maintenant !== '') {
      return rep.maintenant;
    }
    return cur;
  }

  // Le plus récent effectivement vu. `sort()` sur des ISO 8601 en UTC trie bien
  // chronologiquement — c'est vrai parce que le format est à largeur fixe et que
  // le fuseau est toujours Z ; ce serait faux avec des décalages horaires.
  let candidat = vus.slice().sort()[vus.length - 1];
  // Monotone : jamais en arrière.
  if (cur !== null && candidat <= cur) return cur;
  return candidat;
}

/**
 * Que faut-il annoncer ? Rendu à part pour que le banc puisse vérifier qu'on ne
 * sonne PAS sur une amorce, et qu'un flux à zéro reste silencieux.
 * @returns {Array<{type:'commande'|'retour', n:number}>}
 */
function aAnnoncer(rep) {
  const out = [];
  if (!rep || typeof rep !== 'object' || rep.amorce === true) return out;
  const c = Number((rep.commandes && rep.commandes.nouvelles) || 0);
  const r = Number((rep.retours && rep.retours.nouvelles) || 0);
  if (Number.isFinite(c) && c > 0) out.push({ type: 'commande', n: c });
  if (Number.isFinite(r) && r > 0) out.push({ type: 'retour', n: r });
  return out;
}

module.exports = { curseurSuivant, aAnnoncer };
