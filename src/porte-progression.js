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
/* ⚠⚠ LA LANGUE : sa demande du 2026-09-12, « les écrans de chargement aussi
   devront être traduits ». C'est le SEUL écran que la coquille dessine pendant
   qu'une mise à jour s'installe — celui qu'on lit justement parce qu'on ne peut
   rien faire d'autre. */
const T = require('./langue').tr('porte');
const { langueCourante } = require('./langue');

/* ⚠⚠ LE SÉPARATEUR DÉCIMAL NE PASSE PAS PAR LE DICTIONNAIRE, ET J'AI PAYÉ
   L'ESSAI. `T(fr)` rend la CLÉ telle quelle en français — c'est tout son
   principe : la page naît en français sans dictionnaire. Une entrée
   `'__decimale__'` ressortait donc littéralement, et l'écran affichait
   « 2__decimale__5 Mo ». Le banc l'a dit au premier essai.
   ➡ Une règle de LOCALE (séparateur, ordre de date, unité) n'est pas une
   traduction : elle se lit dans la langue COURANTE, pas dans une table de
   phrases. « 43,0 MB remaining » se lit mal, et « Mo » n'est pas « MB ». */
const _moFr = (n) => (n / 1048576).toFixed(1)
  .replace('.', langueCourante() === 'en' ? '.' : ',');

const _dureeFr = (s) => {
  if (!Number.isFinite(s) || s < 0) return '';
  if (s < 60) return T('environ {0} s', Math.max(1, Math.round(s)));
  if (s < 3600) return T('environ {0} min', Math.round(s / 60));
  return T('plus d’une heure');
};

const texteProgression = (p) => {
  const pct = Math.round(p && Number.isFinite(p.percent) ? p.percent : 0);
  let h = '<div class="dl-pct">' + pct + ' %</div>';

  if (p && p.total > 0 && Number.isFinite(p.transferred)) {
    const reste = Math.max(0, p.total - p.transferred);
    h += '<div class="dl-mo">' + T('{0} Mo restants', _moFr(reste)) + ' '
       + '<span style="opacity:.6">' + T('sur {0} Mo', _moFr(p.total)) + '</span></div>';

    const v = p.bytesPerSecond;
    if (Number.isFinite(v) && v > 1024) {
      const t = _dureeFr(reste / v);
      h += '<div class="dl-vit">' + T('{0} Mo/s', _moFr(v)) + (t ? ' · ' + t : '') + '</div>';
    }
  }

  h += '<div class="dl-fin">' + T('L’application redémarrera à la fin.') + '</div>';
  return h;
};


module.exports = { texteProgression, _moFr, _dureeFr };
