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

/* ══ DEPUIS QUAND ÇA NE MARCHE PLUS — #100, 2026-09-14 ═══════════════════════
 * ⚠⚠ CE QUI MANQUAIT, ET CE QUE ÇA COÛTAIT. La ligne d'état disait BIEN que la
 * veille était en échec — mais `dernierEchec` ne vivait QU'EN MÉMOIRE. Donc :
 *   · au redémarrage de l'application, l'ardoise était effacée. Une veille en
 *     panne depuis trois jours repartait en disant « à l'écoute » jusqu'au tour
 *     suivant, puis « réseau indisponible » — comme si ça venait d'arriver ;
 *   · et même sans redémarrage, « ⚠ Réseau indisponible » ne dit pas si c'est
 *     depuis deux minutes (on attend) ou depuis mardi (les commandes se sont
 *     empilées sans un son). C'est la MÊME phrase pour deux situations qui
 *     n'appellent pas du tout le même geste.
 *
 * ➡ Trois choses se gardent donc sur le disque : le DÉBUT de la série d'échecs
 *   en cours, son motif courant, et la date du DERNIER SUCCÈS.
 *
 * ⚠ LE DÉBUT NE BOUGE PAS QUAND LE MOTIF CHANGE. Un réseau qui tombe, puis un
 * serveur qui refuse, puis un délai dépassé : c'est UNE panne qui dure, pas
 * trois pannes courtes. Remettre le compteur à zéro à chaque changement de
 * motif ferait dire « depuis 30 secondes » à une veille morte depuis mardi —
 * exactement le mensonge qu'on vient corriger.
 *
 * ⚠ ET LE DERNIER SUCCÈS SE GARDE MÊME PENDANT L'ÉCHEC : c'est lui qui répond
 * « jusqu'à quand ça marchait », quand le début de la série ne suffit pas (une
 * application éteinte tout le week-end n'a pas « échoué » pendant ce temps).
 */
function majEchec(etat, res, maintenant) {
  const e = etat || {};
  const t = String(maintenant || '');
  if (res && res.ok) return { succes: t, echecDepuis: null, echecMotif: '' };
  const motif = String((res && res.motif) || '');
  return {
    succes: e.succes || null,
    echecDepuis: e.echecDepuis || t,   // ⚠ le PREMIER, pas le dernier
    echecMotif: motif,
  };
}

/* Combien de temps sépare deux instants, en mots — pour la ligne d'état.
 * ⚠ ON NE DESCEND PAS SOUS LA MINUTE. « depuis 3 secondes » sur une icône qu'on
 * regarde une fois par heure n'apprend rien, et donne une précision que la
 * cadence du veilleur (une minute) ne porte pas.
 * ⚠ RIEN N'EST RENDU POUR UN DÉBUT ABSENT OU ILLISIBLE : mieux vaut « ⚠ Réseau
 * indisponible » tout court qu'un « depuis Invalid Date » qui fait douter du
 * reste de la ligne. */
function depuisQuand(debutIso, maintenantIso) {
  const a = Date.parse(String(debutIso || ''));
  const b = Date.parse(String(maintenantIso || ''));
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
  const min = Math.floor((b - a) / 60000);
  if (min < 1)   return { unite: 'minute', n: 0 };
  if (min < 60)  return { unite: 'minute', n: min };
  const h = Math.floor(min / 60);
  if (h < 24)    return { unite: 'heure', n: h };
  return { unite: 'jour', n: Math.floor(h / 24) };
}

module.exports = { curseurSuivant, aAnnoncer, majEchec, depuisQuand };
