'use strict';

/*
 * CE QUI MONTRE DU TEXTE SANS ETRE UNE FENETRE — LA CARTE DES ANGLES MORTS
 * =============================================================================
 * ⚠⚠ POURQUOI CE FICHIER EXISTE. Presque tous les bancs de langue, de contraste
 * et de rendu lisent `src/fenetres/`. C est un choix defendable — c est la que
 * vivent 98 ecrans sur 99 — mais il laisse dehors tout ce qui parle a quelqu un
 * SANS etre une fenetre :
 *
 *   . les boites de dialogue du systeme (`dialog.showMessageBox`) ;
 *   . les notifications (`new Notification`) ;
 *   . les menus (barre de menus, menu de la zone de notification) ;
 *   . l infobulle de l icone (`setToolTip`) ;
 *   . les selecteurs de fichiers du systeme.
 *
 * Aucun de ces textes n est dessine dans une page. Aucun banc de fenetre ne les
 * voit. Et un verdict vert ne dit JAMAIS ou s arrete le terrain qu il a balaye —
 * c est la lecon payee neuf fois le 2026-09-13, et deux fois de plus le
 * 2026-09-14 (le travail `contrastes` rouge pendant cinq versions, les 42 gardes
 * du pont qu aucun releve ne lisait).
 *
 * ➡ CE FICHIER REND CE TERRAIN EXPLICITE. Chaque famille de surface y declare
 *   COMBIEN d endroits elle occupe, et QUEL banc mesure son texte — ou dit
 *   franchement qu AUCUN ne le fait, et pourquoi.
 *
 * ⚠⚠ LE COMPTE EST UN CLIQUET. Ajouter une boite de dialogue fait changer le
 * compte, donc echouer `banc-surface-hors-fenetre.js`. On est alors OBLIGE de
 * revenir ici et de repondre a la question : ce texte-la, qui le mesure ? C est
 * le seul mecanisme qui force la question au moment ou l on ajoute l ecran —
 * meme patron que `couverture-declaree.js` cote site.
 *
 * ⚠ `banc:` N EST PAS UNE PROMESSE, C EST UNE VERIFICATION. Le banc contrôle que
 * le banc nomme LIT vraiment le fichier concerne. Une couverture affirmee et
 * fausse serait pire que pas de couverture du tout : on cesserait de regarder.
 */

module.exports = {
  /* clef : <fichier>|<api>   valeur : { n, banc, quoi } */
  SURFACES: {
    /* ⚠ LES COMPTES SONT CEUX DU CODE, COMMENTAIRES RETIRES — et ils ont
       corrige ma premiere ecriture des son premier passage. J avais compte a la
       main, sur la source brute : `showMessageBoxSync` n existait QUE dans un
       commentaire, et deux des appels du veilleur aussi. Un releve qui compte
       les citations accuse la documentation qui garde la regle. */
    'src/main.js|dialog.showMessageBox': {
      n: 10,
      banc: 'tools/banc-langue-processus-principal.js',
      quoi: 'Les questions posees par le processus principal (quitter, restaurer, '
          + 'remplacer un fichier, confirmer une purge). Elles sortent AVANT toute '
          + 'fenetre, donc aucun banc de page ne peut les atteindre.',
    },
    'src/main.js|new Notification': {
      n: 2,
      banc: 'tools/banc-langue-processus-principal.js',
      quoi: 'Les avis du processus principal (mise a jour prete, sauvegarde faite).',
    },
    'src/main.js|Menu.buildFromTemplate': {
      n: 1,
      banc: 'tools/banc-menu-langue.js',
      quoi: 'LA BARRE DE MENUS. Elle n est pas une page : ses libelles sont poses '
          + 'par Electron, et aucun rendu ne les relit.',
    },
    'src/main.js|dialog.showOpenDialog': {
      n: 2,
      banc: 'AUCUN',
      quoi: 'Les selecteurs de fichiers du SYSTEME. Leurs boutons et leur titre '
          + 'viennent de Windows, pas de nous : seule la propriete `title` nous '
          + 'appartient, et elle est courte. ⚠ CE QUI N EST PAS MESURE ICI : que '
          + 'ce `title` soit traduit. Le dire vaut mieux que le laisser croire.',
    },
    'src/veilleur.js|new Notification': {
      n: 1,
      banc: 'tools/banc-langue-processus-principal.js',
      quoi: 'Les deux toasts de la veille — nouvelle commande, nouvelle demande de '
          + 'retour. Ce sont eux qui portent toute la fonction : s ils sortent en '
          + 'francais sur une session anglaise, personne ne le voit passer.',
    },
    'src/veilleur.js|Menu.buildFromTemplate': {
      n: 1,
      banc: 'tools/banc-langue-processus-principal.js',
      quoi: 'Le menu de la zone de notification — son sous-menu des dernieres '
          + 'notifications est bati dans le MEME gabarit, d ou un seul appel.',
    },
    'src/veilleur.js|setToolTip': {
      n: 1,
      banc: 'tools/banc-langue-processus-principal.js',
      quoi: 'L infobulle de l icone — c est elle qui porte la ligne d etat, donc '
          + '« depuis quand ca ne marche pas » (#100).',
    },
  },
};
