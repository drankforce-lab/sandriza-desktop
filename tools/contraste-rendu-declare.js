/* ============================================================================
   contraste-rendu-declare.js — CE QU'ON GARDE SOUS LE SEUIL DANS LES FENÊTRES,
   ET CE QU'ON DOIT ENCORE
   ----------------------------------------------------------------------------
   Lu par tools/banc-contraste-rendu.js. Même grammaire que
   `contraste-jour-declare.js` et que le fichier jumeau du dépôt du site, et
   volontairement SÉPARÉ des deux : une exception accordée à une couleur lue
   dans le CSS n'est pas la même décision qu'une exception accordée à une
   couleur MESURÉE dans une fenêtre, sur son fond réel.

   EXCEPTIONS  On garde ce contraste POUR TOUJOURS, et la raison est écrite.
               Une raison qui dit seulement « décoratif » ne vaut rien : c'est
               exactement ce qu'écrirait un oubli. Dire CE QUE LE TEXTE AFFICHE,
               et pourquoi ne pas le lire ne coûte rien à personne.

   RESTE       Pas encore corrigé, avec le NOMBRE D'ENDROITS mesuré ce jour-là.
               ⚠ CE NOMBRE EST UN PLAFOND, PAS UN CONSTAT : le banc refuse si
               une de ces couleurs GAGNE du terrain. Quand un nombre baisse, le
               banc le DIT et demande de resserrer — sans ça le cliquet rouvre
               ce qu'on vient de fermer.

   ⚠ LA CLÉ EST « #TEXTE sur #FOND @seuil », les DEUX couleurs résolues par le
   navigateur (voiles et dégradés déjà composés). Pas de fichier:ligne : une clé
   fichier:ligne se périme au premier déplacement de code et l'exception devient
   muette, alors qu'une couleur porte sa décision avec elle.

   ── ÉTAT AU 2026-09-05 : PREMIER RELEVÉ ─────────────────────────────────────
   Les deux tables partent VIDES, exprès. Rien n'est déclaré avant d'avoir été
   mesuré : une dette écrite d'avance est une permission accordée à l'aveugle.
   ========================================================================== */

module.exports = {

  /* ── LES FENÊTRES QU'ON NE PEUT PAS MESURER, ET POURQUOI ────────────────────
     ⚠⚠ Une fenêtre absente du relevé DOIT être déclarée ici, sinon le banc
     refuse : « je n'ai pas regardé » n'est pas « c'est bon ». Une déclaration
     sans preuve n'en est pas une — on écrit ce qui a été essayé.
     ⚠ Cette table n'est pas un débarras : chaque entrée est une zone d'ombre
     qui reste à ouvrir, et le banc la rappelle À CHAQUE PASSAGE. */
  /* ⚠ VIDE, ET C'EST UNE BONNE NOUVELLE. `inventaire` y a figuré une journée :
     elle tuait le moteur de rendu et était la seule des 92 hors de portée. La
     cause a été trouvée et corrigée le 2026-09-05 (une cadence de pagination que
     la fenêtre et le site se renvoyaient sans fin) : elle se mesure maintenant.
     ⚠⚠ ET LA PREUVE QUI ACCOMPAGNAIT SA DÉCLARATION ÉTAIT FAUSSE. J'avais écrit
     « vérifié SANS le banc, en --dump-dom, 0 octet » — or `--dump-dom` N'ÉCRIT
     RIEN en `--headless=new` : un témoin trivial (`<h1>bonjour</h1>`) sortait
     lui aussi à 0 octet. La conclusion était juste, la preuve ne prouvait rien.
     → UNE DÉCLARATION D'ANGLE MORT DOIT PORTER UNE PREUVE QUI A ÉTÉ ÉPROUVÉE
     SUR UN TÉMOIN, sinon elle transforme un doute en fait acquis. */
  INMESURABLES: {
  },

  /* ── GARDÉ POUR TOUJOURS, AVEC LA RAISON ────────────────────────────────── */
  EXCEPTIONS: {
  },

  /* ── DETTE CONNUE, AVEC SON PLAFOND ─────────────────────────────────────── */
  RESTE: {
    // 1.10 · div.apercu > span.t « L’élégance au quotidien » · accueil_c1/jour
    '#1D2433 sur #1A1A2E @4.5': 1,
    // 1.18 · div.pop > button.sz-btnplein.flottant « ⛶ Plein écran » · newsletter_c5/nuit
    '#E8EDF5 sur #FFFFFF @4.5': 1,
    // 1.18 · div#avert.avert > b « Identifiants non chargés » · transporteurs_c1/jour
    '#FECACA sur #F4E5E0 @4.5': 1,
    // 1.23 · td > span.pill « ✓ Connexion » · journaux/jour journaux_c13/jour journaux_c7/jour journaux_c8/jour
    '#6EE7A0 sur #D0EDDB @4.5': 4,
    // 1.27 · div.ecart.bon > div.verdict « ✓ Équilibrée » · banque_c5/jour
    '#6EE7B7 sur #E2EDE3 @4.5': 1,
    // 1.27 · div.stat > div.v « 13 août 2026, 00:12 » · sauvegarde/jour sauvegarde_c2/jour
    '#6EE7A0 sur #EBE9E4 @4.5': 2,
    // 1.36 · tr > td.num « 512.00 $ » · publicite_c3/jour
    '#E8DCC6 sur #FFFFFF @4.5': 1,
    // 1.39 · td > span.pill « ⬇ Reçu » · journaux_c5/jour
    '#7DD3FC sur #D4EFFB @4.5': 1,
    // 1.39 · div#cmp.cmp > span.cet.g « Avant » · studio_c5/jour studio_c7/jour
    '#5F666C sur #4D5056 @4.5': 4,
    // 1.41 · div.pop > button.x « × » · newsletter_c5/nuit
    '#FFFFFF sur #D9D9D9 @4.5': 1,
    // 1.42 · span.phpast > span.pt « ◇ » · studio/jour
    '#56606E sur #46494F @4.5': 4,
    // 1.43 · div > span « → » · banque_c3/jour
    '#6EE7B7 sur #EEFAF6 @4.5': 2,
    // 1.43 · div.stat > div.v « 1 » · incidents/jour incidents_c1/jour incidents_c2/jour journaux/jour journaux_c7/jour journaux_c8/jour
    '#E6C14A sur #EBE9E4 @3': 6,
    // 1.43 · td > span.pill « ✗ Échec » · journaux/jour journaux_c7/jour journaux_c8/jour
    '#FCA5A5 sur #F9D8D8 @4.5': 3,
    // 1.43 · div.stat > div.v « aucune » · sauvegarde_c1/jour
    '#E6C14A sur #EBE9E4 @4.5': 1,
    // 1.48 · div.rangee > button#b-bascule.bsc « Repasser en pré-lancement » · lancement_c1/jour
    '#8B5C5C sur #EF4444 @4.5': 1,
    // 1.49 · tr > th « Facture » · etatcompte/nuit
    '#111111 sur #26334A @4.5': 2,
    // 1.52 · tr.lg > td.num « 0,00 $ » · banque/jour
    '#6EE7B7 sur #FFFFFF @4.5': 1,
    // 1.54 · div.stat > div.v « 1 » · securite/jour securite_c1/jour securite_c2/jour
    '#B6B9F7 sur #EBE9E4 @3': 3,
    // 1.57 · div.entete > span.adr « Fragile : verre souffle. » · commande_c1/jour commandes/jour
    '#F0C987 sur #FFFFFF @4.5': 3,
    // 1.66 · div#g-prev-head.head.anim > div.ti « SANDRIZA » · gabarits_c1/jour
    '#1D2433 sur #7C2D12 @4.5': 1,
    // 1.67 · div.boite > div.aide « Temoin : aucune vente n a eu lieu. » · caisse_c1/jour
    '#FBBF24 sur #FFFFFF @4.5': 1,
    // 1.68 · div.rangee > button#b-bascule.bsc « Lancer le site au public » · lancement/jour
    '#8B5C5C sur #16A34A @4.5': 1,
    // 1.71 · span.phpast > span.pt.fait « ✓ » · studio/jour
    '#297A46 sur #46494F @4.5': 3,
    // 1.74 · tr > td.num « 75,50 $ » · cartescadeaux/jour logotheque/jour logotheque_c1/jour publicite_c1/jour publicite_c3/jour
    '#4ADE80 sur #FFFFFF @4.5': 7,
    // 1.74 · div.tuile > div.v « 83% » · publicite_c6/jour
    '#4ADE80 sur #FFFFFF @3': 1,
    // 1.90 · tr.lg > td.num « 2 210,00 $ » · banque/jour
    '#FCA5A5 sur #FFFFFF @4.5': 1,
    // 1.91 · div > button.ghost.mini « ↺ Réinitialiser pour re-tester » · newsletter_c4/jour
    '#E0B47A sur #FFFFFF @4.5': 1,
    // 1.94 · div.boite > p « 2 photos n’ont rien à annuler et ne boug » · explorateur_c1/jour explorateur_c2/jour studio_c2/jour studio_c4/jour studio_c6/jour
    '#D8B57A sur #FFFFFF @4.5': 7,
    // 2.06 · div.ph > button.phx « ✕ » · avis/jour
    '#AB4E4E sur #393C43 @4.5': 2,
    // 2.13 · span#p-r2 > a#p-mesurer « mesurer l’espace R2 » · photos/jour photos_c1/jour photos_c2/jour photos_c4/jour
    '#9E9EFF sur #F4F2EC @4.5': 4,
    // 2.13 · span > span.exp « Aucun paiement Square enregistré sur cet » · remboursement_c1/jour
    '#ADB2BA sur #FFFFFF @4.5': 1,
    // 2.15 · span > span « (frais retenus : 2,75 $) » · commandes/jour
    '#F59E0B sur #FFFFFF @4.5': 1,
    // 2.42 · td > span.num « CRD-0002-010 » · remboursements_c1/jour
    '#B6A48C sur #FFFFFF @4.5': 1,
    // 2.43 · span.pastille > span.coche « ✓ » · apparence/jour apparence/nuit
    '#FDF8F5 sur #C49A6C @4.5': 1,
    // 2.47 · div.lgn > div.pastille « S » · marque_c2/jour
    '#1D2433 sur #4F46E5 @4.5': 2,
    // 2.50 · div.vig > span.rien « Aucun logo » · marque_c1/nuit
    '#8E9CAD sur #F5F2EC @4.5': 2,
    // 2.57 · div.vig > span.rien « Aucun logo » · marque_c1/nuit
    '#8E9CAD sur #F9F5EE @4.5': 2,
    // 2.58 · span > span.exp « Aucun paiement Square enregistré sur cet » · remboursement_c1/nuit
    '#536174 sur #16202F @4.5': 1,
    // 2.62 · td > span.pill.neutre « Expiré » · remboursements_c1/jour
    '#9299A7 sur #F4F5F6 @4.5': 1,
    // 2.63 · div.g > div.lg « 🔒 Pré-lancement » · lancement/jour
    '#D97706 sur #F2E8DA @4.5': 1,
    // 2.64 · tr > td.num « 0,00 $ » · cartescadeaux/jour
    '#8FA1B8 sur #FFFFFF @4.5': 1,
    // 2.65 · td > div.mut « ⏳ promesse » · journaux_c11/jour journaux_c4/jour
    '#99A0A9 sur #FFFFFF @4.5': 10,
    // 2.71 · div.g > div.lg « 🌐 En ligne » · lancement_c1/jour
    '#16A34A sur #E2ECDF @4.5': 1,
    // 2.71 · tr.eteint > td.dt « 12 mars 2026 » · remboursements_c1/jour
    '#979EAB sur #FFFFFF @4.5': 2,
    // 2.75 · div.vig > span.rien « Aucun logo » · marque_c1/jour
    '#576678 sur #1A2035 @4.5': 1,
    // 2.84 · tr.eteint > td.dt « 12 mars 2026 » · remboursements_c1/nuit
    '#59677A sur #16202F @4.5': 2,
    // 3.04 · div.vig > span.rien « Aucun logo » · marque_c1/jour
    '#576678 sur #0F172A @4.5': 1,
    // 3.14 · span > strong « ↩ Moyen de paiement original » · remboursement_c1/jour
    '#8E9299 sur #FFFFFF @4.5': 1,
    // 3.18 · div.d > div.lg « En vous inscrivant, vous acceptez de rec » · newsletter_c5/jour newsletter_c5/nuit
    '#9A8F7D sur #FFFFFF @4.5': 1,
    // 3.19 · h2 > span.cpt « 2 » · liquidation/jour liquidation_c2/jour liquidation_c3/jour
    '#D97706 sur #FFFFFF @4.5': 3,
    // 3.24 · td > div.mut « ⏳ promesse » · journaux_c11/nuit journaux_c4/nuit
    '#617084 sur #16202F @4.5': 10,
    // 3.30 · div.rangee > button#b-bascule.bsc « Lancer le site au public » · lancement/nuit
    '#FFFFFF sur #16A34A @4.5': 1,
    // 3.39 · h2 > span.cpt « 1 » · liquidation_c1/nuit
    '#DC2626 sur #16202F @4.5': 1,
    // 3.49 · div.tete > span#t-av.av « MT » · client/jour client/nuit client_c1/jour client_c1/nuit client_c2/jour client_c2/nuit
    '#17202C sur #8A6F4D @4.5': 3,
    // 3.57 · button.sw > span.nm « rouge » · invmeta_c2/jour
    '#80848B sur #FAF9F6 @4.5': 1,
    // 3.62 · div > label.bascule « Retirer le fond de l’image » · icones_c1/jour remboursements_c1/jour
    '#83878F sur #FFFFFF @4.5': 5,
    // 3.75 · div.lgn > div.ss « Panneau d’administration » · marque_c2/jour marque_c2/nuit
    '#64748B sur #0F172A @4.5': 1,
    // 3.75 · div.vide > span « Non configuré » · modeles_c1/jour
    '#798292 sur #FCFBF9 @4.5': 3,
    // 3.76 · div.rangee > button#b-bascule.bsc « Repasser en pré-lancement » · lancement_c1/nuit
    '#FFFFFF sur #EF4444 @4.5': 1,
    // 3.80 · div.vide > span « Non configuré » · modeles_c1/nuit
    '#687484 sur #0F1623 @4.5': 3,
    // 3.98 · td > span.pill.neutre « Expiré » · remboursements_c1/nuit
    '#7F8996 sur #212C3B @4.5': 1,
    // 4.01 · div.afaire > span.titre « À faire maintenant » · tableau/jour
    '#8A6A3E sur #ECE6D9 @4.5': 1,
    // 4.03 · div.s > div.n « 0.00 $ » · depenses_c2/jour depenses_c3/jour depenses_c4/jour impot/jour promo/jour promo_c1/jour promo_c2/jour remboursements/jour remboursements_c1/jour
    '#8A6A3E sur #E9E7E2 @4.5': 35,
    // 4.09 · button.mini.actif > span.n.hi « 2 » · avis_c2/jour messagerie/jour retours/jour sociaux_c2/jour
    '#83570B sur #DECFB2 @4.5': 4,
    // 4.11 · div.fm > span « 2026-07 · 0,50 $ » · depenses_c2/jour depenses_c4/jour
    '#5A6574 sur #D9D6DC @4.5': 4,
    // 4.16 · div#onglets.onglets > button.actif « ⬇ Exporter » · catalogio/jour catalogio_c1/jour catalogio_c2/jour catalogio_c4/jour invmeta/jour invmeta_c1/jour invmeta_c2/jour invmeta_c3/jour invmeta_c4/jour invmeta_c5/jour invmeta_c6/jour invmeta_c7/jour invmeta_c8/jour newsletter/jour newsletter_c1/jour newsletter_c2/jour newsletter_c3/jour newsletter_c4/jour publicite/jour publicite_c1/jour publicite_c2/jour publicite_c3/jour publicite_c4/jour publicite_c6/jour transferts/jour transferts_c1/jour transferts_c2/jour
    '#6F6A5F sur #E7E2D7 @4.5': 27,
    // 4.25 · div.pied > span#msg.msg.bon « 4 résultat(s) dans tous les journaux. » · journaux_c13/jour livraison/jour
    '#15803D sur #EFECE4 @4.5': 2,
    // 4.31 · div.etats > span.pill.on « Actif » · securite/jour securite_c1/jour securite_c2/jour sociaux-config/jour sociaux-config_c1/jour sociaux-config_c2/jour
    '#326A49 sur #C0DBC5 @4.5': 12,
    // 4.31 · div.etats > span.pill.moi « vous » · securite/jour securite_c1/jour securite_c2/jour
    '#4A627E sur #CBD7E7 @4.5': 3,
    // 4.32 · div.etats > span.pill.role « Super-administrateur » · securite/jour securite_c1/jour securite_c2/jour
    '#5F666C sur #DDDEDD @4.5': 6,
    // 4.35 · td > span.pill « Échec » · journaux_c12/jour journaux_c2/jour
    '#895959 sur #F9D8D8 @4.5': 2,
    // 4.35 · div.etats > span.pill.warn « MFA exempté » · securite/jour securite_c1/jour securite_c2/jour
    '#786426 sur #EBDFBD @4.5': 3,
    // 4.39 · div.pas > span.on « 1 · Étiquette » · expedition/jour expedition_c1/jour expedition_c2/jour
    '#6C675C sur #EAE3D6 @4.5': 3,
    // 4.40 · div.alerte > code « BL » · invmeta_c2/jour
    '#5E656E sur #F1DAD4 @4.5': 1,
    // 4.40 · div.tarif > div.r « 2,8 % + 0,30 $ » · paiements-config/jour paiements-config_c1/jour
    '#7D694E sur #EEEBE3 @4.5': 8,
    // 4.40 · div.etats > span.pill.mfa « MFA ✓ » · securite/jour securite_c1/jour securite_c2/jour
    '#595B79 sur #D2D2E7 @4.5': 3,
    // 4.41 · div#pas.pas > button.on « La collection » · collection/jour collection_c1/jour commande_c1/jour fournisseur/jour fournisseur_c1/jour produit/jour produit_c1/jour produit_c2/jour produit_c3/jour produit_c4/jour retour/jour retour_c1/jour retour_c2/jour retour_c3/jour retour_c4/jour
    '#6B665B sur #E9E1D4 @4.5': 15,
    // 4.42 · div#corps.corps > div.avis.att « Un segment ne fait que la liste des abon » · campagnes_c3/jour statistiques_c1/jour statistiques_c2/jour
    '#73693E sur #EEE6D5 @4.5': 7,
    // 4.43 · div#corps > div.avis.non « Aucune clé Groq enregistrée : l’assistan » · chat-config_c3/jour
    '#746845 sur #EEE6D5 @4.5': 2,
    // 4.44 · div.etat > div.src.warn « Aucune variable dans Render : l’état act » · lancement/jour
    '#80680B sur #F2E8DA @4.5': 1,
    // 4.46 · div.haut > div.jeton « BB » · securite/jour securite_c1/jour securite_c2/jour
    '#5E656B sur #E5DFD4 @4.5': 6,
    // 4.47 · div.cadre > div.bt « Se connecter » · marque_c2/nuit
    '#FFFFFF sur #6366F1 @4.5': 1,
    // 4.48 · div.pas > span.fait « 1 · Étiquette ✓ » · expedition_c1/jour
    '#297A46 sur #EFECE4 @4.5': 1,
    // 4.48 · div#corps.corps > div.avis.bon « Profil complet — vos documents fiscaux s » · impot_c1/jour
    '#287644 sur #EEE6D5 @4.5': 1,
    // 4.48 · td > strong « Promesse rejetée : reseau coupe » · journaux_c11/jour journaux_c4/jour
    '#737781 sur #FFFFFF @4.5': 4,
    // 4.49 · span > strong « ↩ Moyen de paiement original » · remboursement_c1/nuit
    '#7F8792 sur #16202F @4.5': 1,
  },
};
