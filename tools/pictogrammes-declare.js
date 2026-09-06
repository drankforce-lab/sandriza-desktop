/* Plafond de pictogrammes encore hors de la regle .ic. Lu par
 * tools/banc-pictogrammes.js. Il ne peut que DESCENDRE.
 *
 * ZERO DEPUIS LE 2026-09-05. Il a tranche : << les 269 pictogrammes, retire
 * les >>. Ils sont partis, et le plafond avec eux : desormais UN SEUL
 * pictogramme hors de la regle .ic refuse le push.
 *
 * L HISTOIRE, PARCE QU ELLE EXPLIQUE POURQUOI C EST ZERO ET PAS UN CHIFFRE.
 * Le 2026-09-04, 415 pictogrammes echappaient a la norme du noir et blanc
 * posee le 2026-08-19. 118 ont ete enveloppes dans <span class="ic"> - ceux
 * qui vivent dans du BALISAGE. Les 269 restants vivaient dans des textes
 * rendus par textContent (messages de szDire, titres de fenetre), ou un
 * <span class="ic"> se serait affiche EN CLAIR a l ecran. La seule voie
 * propre etait de les RETIRER, comme pour les courriels ou aucun filtre CSS
 * ne tient. C etait une decision de redaction : elle lui a ete posee, et il a
 * repondu.
 *
 * ⚠ CE QUI A ETE RETIRE N EST PAS QUE DE LA DECORATION, et c est la seule
 * chose a savoir avant de rouvrir ce fichier : la ou le pictogramme portait
 * l UNITE (la note d un avis : << 4 ★ >>), il a ete remplace par des mots
 * (<< 4 sur 5 >>), pas efface. Un chiffre nu aurait ete moins clair qu avant.
 *
 * ⚠ Les colonnes d emblemes ont ete retirees AVEC leur contenu (tuiles du
 * tableau de bord, modes du studio, transporteurs, protections du lancement,
 * jauges de la base). Laisser le champ vide aurait garde un retrait devant
 * chaque titre, et un parametre que plus rien ne remplit se fait recopier. */
module.exports = { HORS_IC: 0 };
