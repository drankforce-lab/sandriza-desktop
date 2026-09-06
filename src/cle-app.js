'use strict';

/*
 * LA CLÉ D'APPLICATION — UNE SEULE LECTURE, DEUX PROCESSUS
 * =============================================================================
 * Sortie de `main.js` le jour où le VEILLEUR a eu besoin de la même clé (le
 * 2026-09-06), et pour la raison qui revient sans cesse dans ce dépôt : une
 * valeur partagée qu'on lit à deux endroits finit par diverger. Ici en plus le
 * veilleur ne peut PAS la prendre à `main.js`, qui lui rend la main à sa
 * première ligne (`--veilleur`) sans jamais définir la constante.
 *
 * ⚠ LA CLÉ N'EST PAS DANS CE FICHIER — CE DÉPÔT EST PUBLIC. Elle est écrite dans
 * `src/cle.js` AU MOMENT DE LA CONSTRUCTION, depuis le secret `ELG_APP_KEY` du
 * dépôt. `cle.js` est ignoré par git : il n'existe que sur la machine de
 * construction et dans le paquet produit.
 *
 * ⚠ CE QUE ÇA PROTÈGE, ET CE QUE ÇA NE PROTÈGE PAS. La clé reste extractible de
 * n'importe quel installateur (l'`app.asar` d'Electron n'est pas chiffré). Ce
 * qu'on évite, c'est qu'elle soit GREPPABLE sur le web par le premier scanner
 * venu — très différent d'avoir à obtenir un installateur distribué sous mot de
 * passe temporaire.
 *
 * Rotation sans rebâtir : variable d'environnement `ELG_APP_KEY` (elle doit alors
 * changer AUSSI côté serveur, sur Render).
 */

const APP_KEY = (() => {
  if (process.env.ELG_APP_KEY) return process.env.ELG_APP_KEY;
  try { return require('./cle').APP_KEY || ''; } catch (e) { return ''; }
})();

module.exports = { APP_KEY };
