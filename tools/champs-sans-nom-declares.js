'use strict';

/*
 * LES CHAMPS QUE LA LECTURE STATIQUE CROIT MUETS, ET POURQUOI ILS NE LE SONT PAS
 * =============================================================================
 * Le controle des champs sans nom accessible (`verifier-mise-en-page.js`) refuse
 * tout champ atteignable sans etiquette ni `aria-label`. Ceux nommes ici sont des
 * FAUX POSITIFS : le champ EST nomme, mais par un moyen qu on ne voit pas en
 * lisant sa balise. Chacun porte sa raison.
 *
 * ⚠⚠ UN CLIQUET, PAS UNE PORTE OUVERTE. Un champ vraiment muet ajoute demain
 * fait echouer le controle ; cette liste ne peut que RETRECIR.
 *
 * ⚠⚠ POURQUOI UNE LISTE NOMMEE PLUTOT QU UN PLAFOND CHIFFRE. Un plafond
 * << 5 >> laisserait passer n importe quels cinq autres. Et surtout : UN
 * CONTROLE D ACCESSIBILITE INCOMPLET ACCUSE DU TRAVAIL DEJA FAIT — c est arrive
 * deux fois le meme jour le 2026-09-06. On nomme, donc.
 *
 * ⚠ ON APPARIE SUR UN FRAGMENT DE CONTEXTE, JAMAIS SUR UN NUMERO DE LIGNE : une
 * ligne se decale au premier ajout, et le cliquet se rouvrirait tout seul.
 *
 * ══ CE FICHIER S APPELAIT `selects-sans-nom-declares.js` ═════════════════════
 * Renomme le 2026-09-09, quand le controle a cesse de ne juger que les
 * `<select>` pour juger TOUS les champs atteignables. Un nom de fichier qui
 * annonce << selects >> devant une liste qui porte des `input` est un nom faux,
 * et un nom faux est pire que pas de nom.
 */

module.exports = {
  /* L etiquette ENVELOPPE le champ, mais elle est assemblee APRES lui dans le
     code : `ctrl` est bati d abord, puis rendu dans
     `<label class="champ"><span class="lbl">...</span>' + ctrl`. Une lecture qui
     regarde EN ARRIERE depuis la balise ne peut pas la voir. Le champ est
     correctement nomme a l ecran comme au lecteur d ecran. */
  'incidents.js': ['f-'],

  /* ⚠⚠ L AIDE `champ(libelle, ctrl, id)` EMET L ETIQUETTE ELLE-MEME :
       return '<div class="champ"><label' + (id ? ' for="' + id + '"' : '') + '>'
              + esc(l) + '</label>' + ctrl + '</div>';
     Le `for=` est donc CALCULE, et il porte la MEME expression que l id du
     champ — ils ne peuvent pas diverger. Mais l etiquette et le champ arrivent
     par DEUX CHEMINS (le 1er et le 3e argument), donc aucune lecture du code ne
     peut les rapprocher : la balise, vue seule, n a ni `for=` avant elle ni
     `aria-label` sur elle.
     ⚠ C est exactement le cas decrit le 2026-09-08 en fermant le chantier des
     etiquettes : << un `for=` CALCULE est SAIN dans une fabrique ; ce que le
     controle refuse, c est un `for=` LITTERAL face a un id CALCULE >>. Ne pas
     confondre les deux, et surtout ne pas affaiblir le controle pour trois
     champs — c est la fabrique qui recoit le nom.
     Les trois appels concernes, nommes un par un plutot que par un `f-` large :
     le fichier en porte d autres, et un fragment large excuserait un vrai
     defaut ajoute demain. */
  'depenses.js': ["champ('Date'", "champ('Description'", "champ('Fournisseur'"],

};
