'use strict';

/*
 * LES DEUX SEULS <select> QUE RIEN N ANNONCE, ET POURQUOI ON LES LAISSE
 * =============================================================================
 * Le controle de la 4e section de `verifier-mise-en-page.js` refuse tout
 * <select> sans nom accessible. Ces deux-la sont NOMMES ICI, un par un, avec
 * leur raison — un CLIQUET, pas une porte fermee : un nouveau select sans nom
 * fait echouer le controle, et cette liste ne peut que RETRECIR.
 *
 * ⚠⚠ POURQUOI UNE LISTE NOMMEE PLUTOT QU UN PLAFOND CHIFFRE. Les deux cas
 * ci-dessous sont des FAUX POSITIFS de la lecture statique : le champ EST nomme,
 * mais par un moyen qu on ne voit pas en lisant la balise. Un plafond « 2 »
 * laisserait passer n importe quels deux autres. Et surtout : un controle
 * d accessibilite incomplet ACCUSE DU TRAVAIL DEJA FAIT — c est arrive deux fois
 * le meme jour le 2026-09-06. On nomme, donc, et la raison est ecrite.
 */

module.exports = {
  /* L etiquette ENVELOPPE le champ, mais elle est assemblee APRES lui dans le
     code : `ctrl` est bati d abord, puis rendu dans
     `<label class="champ"><span class="lbl">...</span>' + ctrl`. Une lecture qui
     regarde EN ARRIERE depuis la balise ne peut pas la voir. Le champ est
     correctement nomme a l ecran comme au lecteur d ecran. */
  'incidents.js': ['f-'],

};
