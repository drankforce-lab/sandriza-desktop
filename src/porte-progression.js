'use strict';

/*
 * CE QUE DIT L'ÉCRAN PENDANT LE TÉLÉCHARGEMENT D'UNE MISE À JOUR
 * =============================================================================
 * Sa demande du 2026-09-06 : « des pourcentages en plus des Mo restants ».
 *
 * ⚠ LE POURCENTAGE Y ÉTAIT DÉJÀ, ET C'EST TOUT LE PROBLÈME. Il était écrit
 * « Nouvelle version : 47 % », à la même taille que le reste de la phrase. On ne
 * regarde pas un écran d'attente, on le CONSULTE du coin de l'œil en faisant
 * autre chose — un chiffre noyé dans une phrase n'existe pas. La correction
 * n'était donc pas d'ajouter une donnée, c'était de lui donner sa place.
 *
 * ⚠ « RESTANTS » PLUTÔT QUE « SUR ». « 38 Mo sur 81 » demande une soustraction
 * pour répondre à la seule question qu'on se pose : combien de temps encore.
 * « 43 Mo restants » y répond directement.
 *
 * ⚠⚠ LA VITESSE ET LE TEMPS SONT LA PARTIE FRAGILE, et elle se casse en silence.
 * `bytesPerSecond` peut valoir 0 au tout premier événement (rien n'a encore eu le
 * temps de s'écouler) : diviser par lui rendrait `Infinity`, et l'écran
 * afficherait « environ Infinity s ». On n'affiche donc la ligne QUE si la
 * vitesse est un nombre fini et franchement positif — sinon on la tait, ce qui
 * est toujours mieux qu'un chiffre absurde.
 */
const _moFr = (n) => (n / 1048576).toFixed(1).replace('.', ',');

const _dureeFr = (s) => {
  if (!Number.isFinite(s) || s < 0) return '';
  if (s < 60) return 'environ ' + Math.max(1, Math.round(s)) + ' s';
  if (s < 3600) return 'environ ' + Math.round(s / 60) + ' min';
  return 'plus d’une heure';
};

const texteProgression = (p) => {
  const pct = Math.round(p && Number.isFinite(p.percent) ? p.percent : 0);
  let h = '<div class="dl-pct">' + pct + ' %</div>';

  if (p && p.total > 0 && Number.isFinite(p.transferred)) {
    const reste = Math.max(0, p.total - p.transferred);
    h += '<div class="dl-mo">' + _moFr(reste) + ' Mo restants '
       + '<span style="opacity:.6">sur ' + _moFr(p.total) + ' Mo</span></div>';

    const v = p.bytesPerSecond;
    if (Number.isFinite(v) && v > 1024) {
      const t = _dureeFr(reste / v);
      h += '<div class="dl-vit">' + _moFr(v) + ' Mo/s' + (t ? ' · ' + t : '') + '</div>';
    }
  }

  h += '<div class="dl-fin">L’application redémarrera à la fin.</div>';
  return h;
};


module.exports = { texteProgression, _moFr, _dureeFr };
