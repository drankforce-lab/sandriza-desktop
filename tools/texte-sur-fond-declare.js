'use strict';

/*
 * LE PLAFOND DU MODE NUIT — CE QUE LE RELEVÉ A TROUVÉ SANS POUVOIR LE JUGER
 * =============================================================================
 * `banc-texte-sur-fond.js` a gagné un passage en mode NUIT le 2026-09-14. Au
 * premier passage : 10 couples sous 4,5, dans 4 fenêtres. Aucun banc local ne
 * les avait jamais regardés — les trois bancs de couleur ne mesuraient que le
 * jour, alors que la nuit est le mode PAR DÉFAUT.
 *
 * ⚠⚠ POURQUOI UN PLAFOND ET PAS UN ÉCHEC IMMÉDIAT. Au moment où ce relevé est
 * écrit, le travail `contrastes` — celui qui mesure la page ASSEMBLÉE, dans un
 * navigateur — est VERT. Les deux ne peuvent pas avoir raison en même temps, et
 * c'est le rendu qui tranche : une couleur ne se déduit pas du CSS.
 * Trois explications possibles, et elles ne se départagent qu'au rendu :
 *   · l'élément n'est JAMAIS VISIBLE dans cet état (une coche qui n'existe que
 *     cochée, et qui change alors de fond) ;
 *   · le texte est GRAND ou GRAS, et le seuil est alors 3,0 et non 4,5 ;
 *   · c'est une vraie faute, que le rendu n'atteint pas faute de scénario.
 *
 * ⚠ CE POSTE NE PEUT PAS TRANCHER. `banc-contraste-rendu` lance Chrome des
 * dizaines de fois ; il a épuisé la mémoire de la machine et fait tomber
 * l'affichage deux fois. Il ne tourne QUE sur GitHub. Accuser dix règles sans
 * les avoir mesurées serait refaire l'épisode des « 55 fautes » de la première
 * version du banc au rendu — cinquante-cinq accusations qui n'existaient pas.
 *
 * ➡ LE PLAFOND FAIT DONC EXACTEMENT UNE CHOSE, ET ELLE EST UTILE : il refuse la
 *   ONZIÈME. Une couleur de nuit ajoutée demain est arrêtée sur ce poste, en
 *   quelques millisecondes, au lieu d'aller échouer sur GitHub quatre minutes
 *   plus tard — ce qui est arrivé cinq fois sur six en septembre.
 *
 * ⚠ ET LA LISTE S'IMPRIME À CHAQUE PASSAGE. Un plafond muet devient une dette
 * invisible ; celui-ci se rappelle à chaque exécution. Chaque ligne réglée fait
 * baisser le nombre, et le banc réclame alors qu'on resserre le plafond — c'est
 * ainsi qu'il ne peut pas rester à 10 pour toujours.
 */

module.exports = {
  /* Le nombre de couples DISTINCTS tolérés en mode nuit. Il ne doit que
     BAISSER. Voir la tâche #121 pour le règlement de chacun, au rendu. */
  NUIT_PLAFOND: 10,

  /* Le relevé du 2026-09-14, pour mémoire — ce que le plafond recouvre.
     ⚠ Il n'est pas confronté ligne à ligne par le banc (le libellé d'un
     sélecteur change quand on touche à la règle, et un plafond qui exige
     l'identité au caractère près devient un faux garde). Il sert à RELIRE :
     quand le nombre bouge, on sait de quoi on partait. */
  NUIT_RELEVE_2026_09_14: [
    'connexion  .admlogin-back                 #7d5f3c sur #1e2129   2.74',
    'connexion  .admlogin-forgot               #7d5f3c sur #1e2129   2.74',
    'connexion  .admlogin-nipbox .npr button   #6b4a20 sur #24252b   1.91',
    'connexion  .admlogin-forgot,.admlogin-back #5a4527 sur #26262c  1.66',
    'connexion  .cx-voie .n                    #fff    sur #C49A6C   2.57',
    'connexion  .cx-cle button                 #6b4a20 sur #27282c   1.84',
    'connexion  .cx-exig li                    #6b5a48 sur #202229   2.41',
    'explorateur  .coche                       #17202c sur #1c232f   1.04',
    'inventaire  button.vert                   #fff    sur #16a34a   3.30',
    'studio  .phcoche                          #17202c sur #0a0f18   1.17',
  ],

  /* ⚠ SEPT DES DIX SONT DANS `connexion.js`, QUI EST UN FICHIER GÉNÉRÉ. Il ne
     se corrige pas à la main : sa source est ailleurs. C'est une raison de plus
     pour ne pas les traiter dans le même geste que la pose du garde. */
};
