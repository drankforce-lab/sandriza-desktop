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
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ TRANCHÉ LE 2026-09-17 (#122) — ET LA PHRASE CI-DESSUS ÉTAIT TROP LARGE
 * ═══════════════════════════════════════════════════════════════════════════
 * « Ce poste ne peut pas trancher » était vrai de `banc-contraste-rendu`, qui
 * peint 339 scénarios. Ce n'était PAS vrai des dix couples : ils tiennent dans
 * QUATRE fenêtres. Ouvertes une par une dans Electron — quatre chargements
 * successifs dans un seul processus, l'ordre de grandeur des étapes 2 et 3 du
 * vérificateur — et la couleur RÉELLEMENT PEINTE se lit.
 * ➡ **UN OUTIL TROP GROS POUR LA QUESTION N'EST PAS UNE RAISON DE NE PAS
 *   RÉPONDRE.** Il a suffi de mesurer ce qu'on voulait savoir, et rien d'autre.
 *
 * ⚠⚠ ET IL A FALLU ALLER CHERCHER L'ÉTAT. Au premier passage, les dix étaient
 * ABSENTS de la page : l'écran d'accueil ne les dessine pas. En conclure « donc
 * tout va bien » aurait été le même « ça fonctionne » qui ne couvre que ce
 * qu'on a traversé — et c'est EXACTEMENT pour ça que le travail `contrastes`
 * reste vert pendant que ce relevé-ci compte dix fautes : ils ne regardent pas
 * la même chose. On a donc cliqué (« Mot de passe oublié ? »), retiré le voile,
 * et inséré les fragments inatteignables DANS LEUR VRAI PARENT.
 *
 * LE VERDICT, AU RENDU :
 *   · 2 VRAIES FAUTES, corrigées :
 *       `.cx-voie .n`  blanc sur or  2,57 → texte #1a1208, 7,22
 *       `button.vert`  blanc sur #16a34a 3,30 → fond #15803d, 5,02
 *       ⚠ et le SURVOL de ce bouton était PIRE que le repos (2,28) : on règle
 *         l'état au repos et on laisse celui qu'on déclenche en visant.
 *   · 6 FAUX POSITIFS mesurés bons (5,76 à 7,73) : tout l'écran de connexion
 *     vit dans `.admlogin-form-panel`, dont le fond est **#faf8f5 — CLAIR, dans
 *     LES DEUX MODES**. Ce relevé-ci les comparait au fond de nuit de la page,
 *     c'est-à-dire à un fond qu'ils n'ont jamais.
 *   · 2 JAMAIS DESSINÉS : `.coche` et `.phcoche`. Leur glyphe `✓` n'existe QUE
 *     dans l'état coché — et cet état change le fond pour #c9a97e. Le couple
 *     relevé (sombre sur sombre) ne porte donc JAMAIS de caractère.
 *
 * ➡ LES HUIT QUI RESTENT SONT MESURÉS, PAS TOLÉRÉS. Le plafond ne recouvre plus
 *   une ignorance : il recouvre une limite connue du RELEVÉ STATIQUE — il ne
 *   sait pas dans quel conteneur une règle atterrit, ni si un état porte du
 *   texte. Les huit ne se régleront donc pas en changeant une couleur ; ils se
 *   régleront le jour où le relevé saura lire le fond réel.
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
     BAISSER. 10 → 8 le 2026-09-17 (#122) : les dix ont enfin été MESURÉS AU
     RENDU, et deux étaient de vraies fautes. Voir le relevé ci-dessous. */
  NUIT_PLAFOND: 8,

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

  /* ⚠ LA MESURE AU RENDU DU 2026-09-17 (#122) — le fond RÉELLEMENT PEINT, et
     le seuil LU (la taille et la graisse décident de 4,5 ou 3,0).
     Ce tableau est la raison pour laquelle le plafond peut rester à 8 sans
     être une dette : on sait de quoi il est fait. */
  NUIT_MESURE_2026_09_17: [
    'CORRIGÉ  connexion  .cx-voie .n          #fff→#1a1208 sur #c49a6c   2.57 → 7.22',
    'CORRIGÉ  inventaire button.vert          #fff sur #16a34a→#15803d   3.30 → 5.02',
    '         inventaire button.vert:hover    #fff sur #22c55e→#166534   2.28 → 7.13',
    'BON      connexion  .admlogin-forgot     #5a4527 sur #f3ece3        7.73',
    'BON      connexion  .admlogin-back       #5a4527 sur #f3ece3        7.73',
    'BON      connexion  .npr button          #6b4a20 sur #ede6db        6.44',
    'BON      connexion  .cx-cle button       #6b4a20 sur #efe4d8        6.40',
    'BON      connexion  .cx-exig li          #6b5a48 sur #f5efe7        5.76',
    'JAMAIS   explorateur .coche              le ✓ n’existe que coché, fond #c9a97e',
    'JAMAIS   studio      .phcoche            le ✓ n’existe que coché, fond #c9a97e',
  ],

  /* ⚠ SEPT DES DIX SONT DANS `connexion.js`, QUI EST UN FICHIER GÉNÉRÉ. Il ne
     se corrige pas à la main : sa source est ailleurs. C'est une raison de plus
     pour ne pas les traiter dans le même geste que la pose du garde. */
};
