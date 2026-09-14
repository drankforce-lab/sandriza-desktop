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

/* ══ L'HISTORIQUE DES NOTIFICATIONS — GARDER 7 JOURS, PUIS OUBLIER ════════════
 * Sa demande du 2026-09-14 : « cela doit être conservé que 7 jours, ensuite il
 * doit s'effacer seul ».
 *
 * ⚠⚠ POURQUOI CETTE DÉCISION EST ICI, DANS LE MODULE PUR, ET PAS DANS
 * `veilleur.js`. Une purge est le genre de mécanisme qui cesse de fonctionner
 * SANS RIEN DIRE : il ne lève pas, il n'affiche rien, il ne fait simplement plus
 * son travail — et l'on ne s'en aperçoit que le jour où le fichier a grossi
 * pendant six mois, ou, pire, le jour où il a effacé ce qu'il fallait garder.
 * Une purge qu'aucun banc n'éprouve est une purge qu'on croit sur parole.
 * Ici, elle est une fonction sans horloge, sans disque et sans Electron : on lui
 * donne une liste et un instant, elle rend une liste. `banc-veilleur.js` la met
 * à l'épreuve avec des dates choisies.
 *
 * ⚠ LE PLAFOND EN NOMBRE RESTE, DERRIÈRE LA DATE. Sept jours de veille normale,
 * c'est quelques dizaines de lignes ; sept jours d'un site qui s'emballe, ou
 * d'une boucle d'erreur, c'en est des milliers — et ce fichier est réécrit à
 * chaque tour de veille. La date décide de ce qu'on garde, le plafond empêche
 * l'accident.
 *
 * ⚠ ON NE JETTE PAS UNE LIGNE DONT LA DATE EST ILLISIBLE. Elle vient d'une
 * version antérieure, ou d'un fichier abîmé : la traiter comme « vieille » la
 * ferait disparaître silencieusement, ce qui est exactement le défaut qu'on
 * cherche à éviter. Elle est gardée, et elle sortira par le plafond.
 */
const NOTIFS_JOURS = 7;
const NOTIFS_PLAFOND = 200;

function purgerNotifs(liste, maintenantIso, jours, plafond) {
  const n = Date.parse(String(maintenantIso || ''));
  const j = Number.isFinite(jours) ? jours : NOTIFS_JOURS;
  const max = Number.isFinite(plafond) ? plafond : NOTIFS_PLAFOND;
  const src = Array.isArray(liste) ? liste : [];
  const limite = Number.isFinite(n) ? (n - j * 86400000) : null;
  const gardees = src.filter((x) => {
    if (!x || typeof x !== 'object') return false;
    if (limite === null) return true;          // instant illisible : on ne purge rien
    const t = Date.parse(String(x.t || ''));
    if (!Number.isFinite(t)) return true;      // date illisible : on garde (voir l'en-tête)
    return t >= limite;
  });
  /* ⚠ LES PLUS RÉCENTES D'ABORD, ET C'EST LE PLAFOND QUI L'EXIGE. La liste est
     déjà tenue dans cet ordre (`unshift`), mais si elle ne l'était pas, couper
     à 200 jetterait les nouvelles au lieu des vieilles. On trie donc avant de
     couper, plutôt que de faire confiance à l'ordre d'arrivée. */
  gardees.sort((a, b) => (Date.parse(String(b.t || '')) || 0) - (Date.parse(String(a.t || '')) || 0));
  return gardees.slice(0, max);
}

/* ══ CE QUI SE VOIT TOUT DE SUITE, ET CE QUI EST DERRIÈRE ════════════════════
 * Sa demande : « toujours placer les dernières notifications au plus haut et
 * visible ; pour voir les autres on doit appuyer sur historique des 7 derniers
 * jours ».
 *
 * ⚠⚠ ET C'EST L'INVERSE DE CE QUI EXISTAIT. Tout l'historique vivait dans UN
 * sous-menu : pour savoir s'il était arrivé une commande, il fallait ouvrir le
 * menu, viser une ligne, attendre que le sous-menu se déplie. Trois gestes pour
 * une question qu'on se pose en passant devant l'écran. Les dernières sont
 * maintenant À PLAT dans le menu — on les lit sans rien ouvrir.
 *
 * ⚠ TROIS, ET PAS DIX. Un menu de zone de notification qui déroule dix lignes
 * d'historique repousse « Ouvrir l'administration » hors de portée du regard,
 * et c'est le geste qu'on vient chercher neuf fois sur dix.
 */
const NOTIFS_EN_TETE = 3;

function partagerNotifs(liste, enTete) {
  const src = Array.isArray(liste) ? liste.filter((x) => x && x.titre) : [];
  const k = Number.isFinite(enTete) ? enTete : NOTIFS_EN_TETE;
  return { tete: src.slice(0, k), reste: src.slice(k) };
}

module.exports = { curseurSuivant, aAnnoncer, majEchec, depuisQuand,
                   purgerNotifs, partagerNotifs, NOTIFS_JOURS, NOTIFS_PLAFOND, NOTIFS_EN_TETE };
