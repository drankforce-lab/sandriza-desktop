/* Plafond de pictogrammes encore hors de la regle .ic. Lu par
 * tools/banc-pictogrammes.js. Il ne peut que DESCENDRE.
 *
 * ETAT AU 2026-09-04. Avant : 415 pictogrammes hors de la regle, donc en
 * couleur, contre la norme du noir et blanc posee le 2026-08-19. 118 ont ete
 * envelopees dans <span class="ic"> le meme jour - toutes celles qui vivent
 * dans du BALISAGE.
 *
 * CE QUI RESTE, ET POURQUOI ON NE LE CONVERTIT PAS MECANIQUEMENT : ces 269-la
 * vivent dans des textes rendus par textContent - les messages de szDire, les
 * titres de fenetre. Y mettre un <span class="ic"> afficherait le balisage EN
 * CLAIR a l ecran. La seule voie propre est de RETIRER le pictogramme du texte,
 * comme on le fait deja pour les courriels ou aucun filtre CSS ne tient. C est
 * une decision de redaction, message par message, pas un remplacement en masse.
 *
 * En attendant, le nombre est plafonne : le banc refuse qu il remonte. */
module.exports = { HORS_IC: 269 };
