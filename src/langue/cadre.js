'use strict';

/*
 * CADRE DE L ADMINISTRATION — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CETTE FENETRE EST UN CHANTIER, ET SES TROIS PARAGRAPHES LE DISENT. Le
 * troisieme est le plus important : « Ce qui n’est pas encore fait » — la
 * bascule n est PAS faite, c est encore le site qui envoie la position de la
 * zone, et les ecrans s ancrent la-bas. Le perdre, ou l adoucir, ferait croire
 * que le portage est termine alors qu il ne l est pas.
 *
 * ⚠⚠ « LE MENU DU HAUT EST LE VRAI » n est pas une formule : les intitules
 * viennent de l APPLICATION et cliquer ouvre SON menu, pas une copie. C est ce
 * qui garantit qu il n y a qu une navigation et qu elle ne peut pas se
 * desynchroniser. Le mot « copie » doit rester.
 *
 * ⚠ « Zone mesurée » et les trois mesures existent pour COMPARER ce que cette
 * fenetre voit avec ce que le site envoie (dock:zone) — au lieu de croire. Les
 * nombres, les unites (px) et le signe × ne se traduisent pas.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Cadre de l’administration — Sandriza': 'Administration frame — Sandriza',
  ' Remesurer': ' Measure again',
  '↻ Remesurer': '↻ Measure again',

  /* ══ CE QUE LA ZONE EST ════════════════════════════════════════════════════ */
  'Cette zone est la place d’un écran': 'This area is the place of a screen',
  'Elle est dessinée par l’application, plus par la page web. C’est la pièce qui manquait pour que le panneau d’administration web puisse être retiré : <strong>trente-six écrans natifs s’y ancrent</strong> aujourd’hui, et c’est le site qui dit où elle se trouve.':
    'It is drawn by the application, no longer by the web page. It is the piece that was missing so the web administration panel could be taken away: <strong>thirty-six native screens dock into it</strong> today, and it is the site that says where it sits.',
  /* ⚠⚠ Le VRAI menu, pas une copie. */
  '<strong>Le menu du haut est le vrai :</strong> les intitulés viennent de l’application, et cliquer ouvre <em>son menu</em> — pas une copie. Il n’y a donc qu’une navigation, et elle ne peut pas se désynchroniser. Pas de barre latérale : ce serait le doublon retiré en août.':
    '<strong>The menu at the top is the real one:</strong> the labels come from the application, and clicking opens <em>its own menu</em> — not a copy. So there is only one navigation, and it cannot fall out of step. No side bar: that would be the duplicate taken away in August.',
  /* ⚠⚠⚠ CE QUI N EST PAS ENCORE FAIT. Voir l en-tete : ne pas l adoucir. */
  '<strong>Ce qui n’est pas encore fait :</strong> cette fenêtre n’a pas remplacé la fenêtre principale. Tant que la bascule n’est pas faite, c’est encore le site qui envoie la position de la zone, et les écrans s’ancrent là-bas.':
    '<strong>What is not done yet:</strong> this window has not replaced the main window. Until the switch is made, it is still the site that sends the position of the area, and the screens dock over there.',

  /* Les formes RENDUES, pour le compteur : les balises sont tombees. */
  'Elle est dessinée par l’application, plus par la page web. C’est la pièce qui manquait pour que le panneau d’administration web puisse être retiré :':
    'It is drawn by the application, no longer by the web page. It is the piece that was missing so the web administration panel could be taken away:',
  'trente-six écrans natifs s’y ancrent': 'thirty-six native screens dock into it',
  'aujourd’hui, et c’est le site qui dit où elle se trouve.':
    'today, and it is the site that says where it sits.',
  'Le menu du haut est le vrai :': 'The menu at the top is the real one:',
  'les intitulés viennent de l’application, et cliquer ouvre':
    'the labels come from the application, and clicking opens',
  'son menu': 'its own menu',
  '— pas une copie. Il n’y a donc qu’une navigation, et elle ne peut pas se désynchroniser. Pas de barre latérale : ce serait le doublon retiré en août.':
    '— not a copy. So there is only one navigation, and it cannot fall out of step. No side bar: that would be the duplicate taken away in August.',
  'Ce qui n’est pas encore fait :': 'What is not done yet:',
  'cette fenêtre n’a pas remplacé la fenêtre principale. Tant que la bascule n’est pas faite, c’est encore le site qui envoie la position de la zone, et les écrans s’ancrent là-bas.':
    'this window has not replaced the main window. Until the switch is made, it is still the site that sends the position of the area, and the screens dock over there.',

  /* ══ LES MESURES ═══════════════════════════════════════════════════════════
   * ⚠ Les nombres, px et × ne se traduisent pas. */
  'Position': 'Position',
  'Taille': 'Size',
  'Densité': 'Density',
  'Densité ×': 'Density ×',
  'Zone mesurée : ': 'Area measured: ',
  'Zone mesurée :': 'Area measured:'
};
