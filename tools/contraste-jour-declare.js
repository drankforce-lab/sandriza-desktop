/* ============================================================================
   contraste-jour-declare.js - LA DETTE DE LISIBILITE DU MODE JOUR, CHIFFREE
   ----------------------------------------------------------------------------
   Lu par tools/banc-contraste-jour.js.

   ETAT AU 2026-09-04, apres la conversion en jetons.
   AVANT : 2 300 declarations de couleur de texte ecrites en dur dans les 91
   fenetres, presque toutes des couleurs de mode SOMBRE posees sur le fond CLAIR
   du mode jour. #8fa1b8 a lui seul : 828 endroits, 91 fenetres, ratio 2.36.
   APRES : 111 declarations, 50 couleurs. 96 % de la dette fermee en posant
   DIX-HUIT jetons dans le socle (voir la fiche en tete de CSS_SOCLE).

   CE QUI RESTE, ET POURQUOI ON S ARRETE LA. Chaque ligne ci-dessous est une
   nuance UNIQUE employee a un ou six endroits : #bcd2f0, #e6c14a, #f0c987...
   Les convertir toutes demanderait une cinquantaine de jetons pour une
   cinquantaine d emplois, c est-a-dire troquer une dette contre une autre.

   ⚠ CE NOMBRE EST UN PLAFOND, PAS UN CONSTAT. Le banc refuse une couleur NEUVE
   sous le seuil, et refuse qu un de ces nombres MONTE. On peut donc fermer la
   queue par morceaux sans qu une regression se glisse au milieu. Quand un
   nombre baisse, le banc le DIT et demande de resserrer : sans ca le cliquet
   rouvre ce qu on vient de fermer.
   ⚠ LA BONNE FACON DE FERMER UNE LIGNE : rattacher la nuance a un jeton
   existant quand elle en est un quasi-doublon (l ecart de canal doit rester
   sous ~12, sinon le mode NUIT change visiblement et personne ne l a demande),
   sinon poser une reprise html.jour locale pour ce selecteur precis.
   ============================================================================ */

module.exports = {
  RESTE: {
  "#d8b57a": 9,           // 1.74  2 fenetre(s) : explorateur.js, studio.js
  "#f0c987": 9,           // 1.40  7 fenetre(s) : commande.js, commandes.js, expedition.js…
  "#e6c14a": 8,           // 1.55  6 fenetre(s) : chat-config.js, incidents.js, journaux.js…
  "#86efac": 6,           // 1.25  5 fenetre(s) : catalogio.js, newsletter.js, produit.js…
  "#bcd2f0": 6,           // 1.38  6 fenetre(s) : analytics.js, images.js, paiements-config.js…
  "#dcc39b": 5,           // 1.52  4 fenetre(s) : campagnes.js, studio.js, telephonie.js…
  "#fcd34d": 5,           // 1.29  5 fenetre(s) : banque.js, catalogio.js, newsletter.js…
  "#fde68a": 5,           // 1.11  3 fenetre(s) : campagnes.js, commandes.js, statistiques.js
  "#6ee7b7": 4,           // 1.36  1 fenetre(s) : banque.js
  "#86e5a8": 3,           // 1.36  3 fenetre(s) : expedition.js, remboursement.js, retour.js
  "#8a6a3e": 3,           // 4.45  2 fenetre(s) : socle.js, tableau.js
  "#9fb0c4": 3,           // 1.98  1 fenetre(s) : affichage.js
  "#b6b9f7": 3,           // 1.66  2 fenetre(s) : incidents.js, securite.js
  "#e08a8a": 3,           // 2.30  2 fenetre(s) : fal.js, studio.js
  "#6b7280": 2,           // 4.32  2 fenetre(s) : produit.js, promo.js
  "#dbe7fb": 2,           // 1.11  2 fenetre(s) : analytics.js, images.js
  "#f59e0b": 2,           // 1.92  1 fenetre(s) : commandes.js
  "#15803d": 1,           // 4.48  1 fenetre(s) : socle.js
  "#6b7787": 1,           // 4.07  1 fenetre(s) : profil.js
  "#93e6b5": 1,           // 1.32  1 fenetre(s) : chat-config.js
  "#9a8f7d": 1,           // 2.84  1 fenetre(s) : newsletter.js
  "#a67c4e": 1,           // 3.34  1 fenetre(s) : pages.js
  "#a6a8f6": 1,           // 1.96  1 fenetre(s) : pages.js
  "#a9c9f7": 1,           // 1.51  1 fenetre(s) : retour.js
  "#a9e6c6": 1,           // 1.27  1 fenetre(s) : images.js
  "#b45309": 1,           // 4.49  1 fenetre(s) : promo.js
  "#b6a6f7": 1,           // 1.92  1 fenetre(s) : depenses.js
  "#b9c6d6": 1,           // 1.55  1 fenetre(s) : affichage.js
  "#c7d2fe": 1,           // 1.33  1 fenetre(s) : invmeta.js
  "#c9ead6": 1,           // 1.16  1 fenetre(s) : studio.js
  "#cfe0f5": 1,           // 1.20  1 fenetre(s) : icones.js
  "#d3f6e4": 1,           // 1.04  1 fenetre(s) : images.js
  "#d8bd97": 1,           // 1.61  1 fenetre(s) : fal.js
  "#d9bd94": 1,           // 1.61  1 fenetre(s) : pages.js
  "#d9bd95": 1,           // 1.61  1 fenetre(s) : profil.js
  "#dcfce7": 1,           // 1.02  1 fenetre(s) : commandes.js
  "#e0b47a": 1,           // 1.71  1 fenetre(s) : newsletter.js
  "#e0b93a": 1,           // 1.68  1 fenetre(s) : pages.js
  "#e0c49a": 1,           // 1.50  1 fenetre(s) : pages.js
  "#e2c79b": 1,           // 1.46  1 fenetre(s) : securite.js
  "#e79a9a": 1,           // 1.98  1 fenetre(s) : studio.js
  "#e8d08a": 1,           // 1.36  1 fenetre(s) : chat-config.js
  "#f0a05a": 1,           // 1.90  1 fenetre(s) : explorateur.js
  "#f4b4b4": 1,           // 1.56  1 fenetre(s) : config-navigation.js
  "#f5d18a": 1,           // 1.31  1 fenetre(s) : affichage.js
  "#f6bdbd": 1,           // 1.45  1 fenetre(s) : images.js
  "#fbe3b0": 1,           // 1.12  1 fenetre(s) : fal.js
  "#fdba74": 1,           // 1.51  1 fenetre(s) : commande.js
  "#fecaca": 1,           // 1.29  1 fenetre(s) : transporteurs.js
  "#ffd9d9": 1,           // 1.16  1 fenetre(s) : images.js
  },
};
