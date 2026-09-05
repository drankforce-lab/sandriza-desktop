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
    // 1.07 · div.info > b « consultations » · analytics/jour images/jour
    '#DBE7FB sur #EBEEF8 @4.5': 15,
    // 1.17 · span.pt.ic > span.ic « 🔗 » · studio/jour
    '#606771 sur #6F7176 @4.5': 2,
    // 1.23 · td > span.pill « ✓ Connexion » · journaux/jour
    '#6EE7A0 sur #D0EDDB @4.5': 1,
    // 1.27 · div.stat > div.v « 13 août 2026, 00:12 » · sauvegarde/jour
    '#6EE7A0 sur #EBE9E4 @4.5': 1,
    // 1.42 · span.phpast > span.pt « ◇ » · studio/jour
    '#56606E sur #46494F @4.5': 2,
    // 1.43 · div.stat > div.v « 1 » · incidents/jour journaux/jour
    '#E6C14A sur #EBE9E4 @3': 2,
    // 1.43 · td > span.pill « ✗ Échec » · journaux/jour
    '#FCA5A5 sur #F9D8D8 @4.5': 1,
    // 1.49 · tr > th « Facture » · etatcompte/nuit
    '#111111 sur #26334A @4.5': 2,
    // 1.52 · tr.lg > td.num « 0,00 $ » · banque/jour
    '#6EE7B7 sur #FFFFFF @4.5': 1,
    // 1.54 · div.stat > div.v « 1 » · securite/jour
    '#B6B9F7 sur #EBE9E4 @3': 1,
    // 1.57 · div.remb > div.fin3 « Frais de service retenus : » · commandes/jour
    '#F0C987 sur #FFFFFF @4.5': 2,
    // 1.68 · div.rangee > button#b-bascule.bsc « Lancer le site au public » · lancement/jour
    '#8B5C5C sur #16A34A @4.5': 1,
    // 1.71 · span.phpast > span.pt.fait « ✓ » · studio/jour
    '#297A46 sur #46494F @4.5': 3,
    // 1.74 · tr > td.num « 75,50 $ » · cartescadeaux/jour logotheque/jour
    '#4ADE80 sur #FFFFFF @4.5': 3,
    // 1.75 · div.etat > span.sp « · » · photos/jour
    '#B6BABC sur #F4F2EC @4.5': 4,
    // 1.76 · td > span.code « DE » · livraison/nuit
    '#3B485A sur #16202F @4.5': 6,
    // 1.86 · td > span.code « DE » · livraison/jour
    '#B8BFC6 sur #FFFFFF @4.5': 6,
    // 1.90 · tr.lg > td.num « 2 210,00 $ » · banque/jour
    '#FCA5A5 sur #FFFFFF @4.5': 1,
    // 1.96 · button.urgent > i « · » · tableau/jour
    '#CAB4B4 sur #FFFFFF @4.5': 3,
    // 2.06 · div.ph > button.phx « ✕ » · avis/jour
    '#AB4E4E sur #393C43 @4.5': 2,
    // 2.08 · span.dt > span.ic « 📅 » · ramassages/jour
    '#ABB0B8 sur #FAF9F6 @4.5': 1,
    // 2.09 · div.nom > span.masq « (masqué) » · accueil/jour
    '#C0B485 sur #FFFFFF @4.5': 1,
    // 2.13 · div.nom > div.d « Bannière bas de page » · accueil/jour
    '#ADB2BA sur #FFFFFF @4.5': 1,
    // 2.13 · div.etat > span.sp « · » · photos/nuit
    '#424D5E sur #0E1522 @4.5': 4,
    // 2.13 · span#p-r2 > a#p-mesurer « mesurer l’espace R2 » · photos/jour
    '#9E9EFF sur #F4F2EC @4.5': 1,
    // 2.15 · span > span « (frais retenus : 2,75 $) » · commandes/jour
    '#F59E0B sur #FFFFFF @4.5': 1,
    // 2.34 · span.mk > span.ic « 🔒 » · config-navigation/jour
    '#A7AAAF sur #FFFFFF @4.5': 2,
    // 2.37 · span.pt.ic > span.ic « 🔗 » · explorateur/jour
    '#8C9299 sur #E1E0DC @4.5': 2,
    // 2.43 · span.pastille > span.coche « ✓ » · apparence/jour apparence/nuit
    '#FDF8F5 sur #C49A6C @4.5': 2,
    // 2.53 · tr.off > td « Allemagne » · livraison/jour
    '#A0A3A9 sur #FFFFFF @4.5': 2,
    // 2.58 · div.haut > span.pill.neutre « 1 colis » · ramassages/jour
    '#9097A3 sur #F0F0EE @4.5': 2,
    // 2.59 · span.dt > span.ic « 📅 » · ramassages/nuit
    '#505D70 sur #121B29 @4.5': 1,
    // 2.61 · button.urgent > i « · » · tableau/nuit
    '#8A6469 sur #2C3037 @4.5': 3,
    // 2.62 · div.nom > div.d « Bannière bas de page » · accueil/nuit
    '#515E71 sur #131C2A @4.5': 1,
    // 2.63 · div.g > div.lg « 🔒 Pré-lancement » · lancement/jour
    '#D97706 sur #F2E8DA @4.5': 1,
    // 2.64 · tr > td.num « 0,00 $ » · cartescadeaux/jour
    '#8FA1B8 sur #FFFFFF @4.5': 1,
    // 2.65 · div.haut > span.pill.err « Annulé » · ramassages/jour
    '#D57A79 sur #F6EDEA @4.5': 1,
    // 2.66 · div.haut > span.dt « 2026-08-08 » · ramassages/jour
    '#949BA7 sur #FAF9F6 @4.5': 3,
    // 2.68 · div.haut > span.pill.err « Annulé » · ramassages/nuit
    '#994C52 sur #261F2C @4.5': 1,
    // 2.73 · div.haut > span.pill.neutre « 1 colis » · ramassages/nuit
    '#5C6A7D sur #1E2736 @4.5': 2,
    // 2.74 · button > i « · » · tableau/jour
    '#999CA3 sur #FFFFFF @4.5': 4,
    // 2.90 · div.haut > span.dt « 2026-08-08 » · ramassages/nuit
    '#576578 sur #121B29 @4.5': 3,
    // 2.98 · span.lock > span.ic « 🔒 » · invmeta/jour
    '#808183 sur #E6E0D6 @4.5': 3,
    // 3.03 · div.src.warn > span.ic « ⚠ » · lancement/jour
    '#998438 sur #F2E8DA @4.5': 1,
    // 3.05 · div.avis.info > span.ic « 🏛 » · impot/jour
    '#6E829A sur #E1E2E7 @4.5': 1,
    // 3.08 · span.pt.retard > span.ic « ⚠ » · explorateur/jour
    '#737B85 sur #DCDBD7 @4.5': 1,
    // 3.14 · div.bloc.off > span.em « 📢 » · accueil/jour config-navigation/jour
    '#8E9299 sur #FFFFFF @4.5': 3,
    // 3.19 · h2 > span.cpt « 2 » · liquidation/jour
    '#D97706 sur #FFFFFF @4.5': 1,
    // 3.21 · div.reco > span.ic « 💡 » · automations/jour
    '#7E8386 sur #EEEBE3 @4.5': 2,
    // 3.30 · div.rangee > button#b-bascule.bsc « Lancer le site au public » · lancement/nuit
    '#FFFFFF sur #16A34A @4.5': 1,
    // 3.36 · span.aide > span.ic « 🔒 » · config-navigation/jour
    '#7A8592 sur #F4F2EC @4.5': 1,
    // 3.37 · div.avis.jaune > span.ic « ⚠ » · expedition/jour
    '#8F826D sur #F8F2E7 @4.5': 1,
    // 3.41 · button.chemin > span.ic « 📂 » · catalogio/jour
    '#8F8B82 sur #FFFFFF @4.5': 1,
    // 3.42 · button#s-purger.b.dgr > span.ic « 🗑 » · sauvegarde/jour
    '#A58282 sur #FFFFFF @4.5': 3,
    // 3.44 · button#btn-etiquette.paie > span.ic « 💳 » · expedition/jour
    '#E1DAFD sur #7859F7 @4.5': 1,
    // 3.49 · div.tete > span#t-av.av « MT » · client/jour client/nuit
    '#17202C sur #8A6F4D @4.5': 2,
    // 3.51 · span > span.ic « ⚠ » · inventaire/jour tableau/jour
    '#93743B sur #EEE6D5 @4.5': 3,
    // 3.57 · div.haut > span « 📦 » · ramassages/jour
    '#80848B sur #FAF9F6 @4.5': 2,
    // 3.58 · tr.off > td « Allemagne » · livraison/nuit
    '#6E7682 sur #16202F @4.5': 2,
    // 3.58 · button > i « · » · tableau/nuit
    '#81858D sur #2C3037 @4.5': 4,
    // 3.60 · div.stitre > span.ic « ☁ » · bd/jour gabarits/jour
    '#82888C sur #FFFFFF @4.5': 3,
    // 3.61 · button.b.dgr > span.ic « 🗑 » · gabarits/jour logotheque/jour
    '#A37E7E sur #FFFFFF @4.5': 3,
    // 3.62 · span.em > span.ic « 📸 » · modeles/jour
    '#7C8896 sur #FFFFFF @4.5': 1,
    // 3.64 · div.sdesc > span.ic « 👁 » · accueil/jour analytics/jour newsletter/jour publicite/jour
    '#7E8793 sur #FFFFFF @4.5': 11,
    // 3.66 · h3 > span.ic « 📈 » · statistiques/jour
    '#82868B sur #FFFFFF @4.5': 2,
    // 3.67 · div.vig > span.rien « Choisirune image » · icones/nuit
    '#6D7F96 sur #F5F2EC @4.5': 2,
    // 3.69 · strong > span.code « US » · livraison/nuit remboursement/nuit
    '#6D7F96 sur #1D2735 @4.5': 3,
    // 3.71 · div.nom > span.masq « (masqué) » · accueil/nuit
    '#86741F sur #131C2A @4.5': 1,
    // 3.79 · span.em > span.ic « 📸 » · modeles/nuit
    '#64758B sur #0F1724 @4.5': 3,
    // 3.85 · span.aide > span.ic « 🔒 » · config-navigation/nuit
    '#64748A sur #0E1522 @4.5': 1,
    // 3.89 · button.b > span.ic « ✏ » · accueil/nuit
    '#767D88 sur #18212F @4.5': 2,
    // 3.90 · span.mk > span.ic « 🔒 » · config-navigation/nuit
    '#757C88 sur #16202F @4.5': 2,
    // 4.00 · div.ch > div.aide « La clé est stockée côté serveur et n’est » · analytics/nuit apparence/nuit automations/nuit bd/nuit caisse/nuit cles/nuit client/nuit config-navigation/nuit config-retours/nuit expedition/nuit footer/nuit icones/nuit images/nuit impot/nuit imprimantes/nuit inventaire/nuit livraison/nuit marque/nuit paiements-config/nuit remboursement/nuit retour/nuit statistiques/nuit studio/nuit tableau/nuit taxes/nuit transporteurs/nuit
    '#6D7F96 sur #16202F @4.5': 105,
    // 4.01 · div.afaire > span.titre « À faire maintenant » · tableau/jour
    '#8A6A3E sur #ECE6D9 @4.5': 1,
    // 4.03 · div.s > div.n « 42 180,00 $ » · impot/jour promo/jour remboursements/jour
    '#8A6A3E sur #E9E7E2 @4.5': 12,
    // 4.06 · div.s > div.sub « 137 commandes » · impot/nuit remboursements/nuit
    '#6D7F96 sur #181E2B @4.5': 8,
    // 4.07 · label.champ > span.sub « La rotation est active : le nom change t » · chat-config/nuit incidents/nuit journaux/nuit reglages-securite/nuit sauvegarde/nuit
    '#6F8098 sur #16202F @4.5': 28,
    // 4.09 · button.mini.actif > span.n.hi « 2 » · messagerie/jour retours/jour
    '#83570B sur #DECFB2 @4.5': 2,
    // 4.12 · span.pill.neutre > span.ic « 📦 » · retours/nuit
    '#8596AC sur #2A3545 @4.5': 1,
    // 4.14 · div.avis.info > span.pill « BC : 84,20 $ » · impot/jour
    '#5A6574 sur #D4D8DF @4.5': 2,
    // 4.16 · div#onglets.onglets > button.actif « ⬇ Exporter » · catalogio/jour invmeta/jour newsletter/jour publicite/jour transferts/jour
    '#6F6A5F sur #E7E2D7 @4.5': 5,
    // 4.16 · div.vign > span.att « nonrangée » · photos/jour
    '#856513 sur #E6E1D6 @4.5': 1,
    // 4.19 · span.pill.neutre > span.ic « 📦 » · retours/jour
    '#667184 sur #EBEDEF @4.5': 1,
    // 4.24 · label.champ > span.sub « Huit caractères au moins. Un mot de pass » · profil/nuit sauvegarde/nuit securite/nuit sociaux-config/nuit
    '#6F8098 sur #151C29 @4.5': 10,
    // 4.25 · div.pied > span#msg.msg.bon « 2 pays inscrits. » · livraison/jour
    '#15803D sur #EFECE4 @4.5': 1,
    // 4.26 · div.tarif > div.n « Par transaction web » · paiements-config/nuit
    '#6D7F96 sur #111A29 @4.5': 4,
    // 4.30 · span.pt.ic > span.ic « 🔗 » · explorateur/nuit
    '#7A8A9F sur #1F2632 @4.5': 2,
    // 4.31 · div.etats > span.pill.on « Actif » · securite/jour sociaux-config/jour
    '#326A49 sur #C0DBC5 @4.5': 4,
    // 4.31 · div.etats > span.pill.moi « vous » · securite/jour
    '#4A627E sur #CBD7E7 @4.5': 1,
    // 4.32 · div.etats > span.pill.role « Super-administrateur » · securite/jour
    '#5F666C sur #DDDEDD @4.5': 2,
    // 4.35 · div.etats > span.pill.warn « MFA exempté » · securite/jour
    '#786426 sur #EBDFBD @4.5': 1,
    // 4.39 · div.sous > div.tt « Sous-menu » · config-navigation/nuit modeles/nuit
    '#6D7F96 sur #0F1724 @4.5': 4,
    // 4.39 · div.pas > span.on « 1 · Étiquette » · expedition/jour
    '#6C675C sur #EAE3D6 @4.5': 1,
    // 4.40 · div.tarif > div.r « 2,8 % + 0,30 $ » · paiements-config/jour
    '#7D694E sur #EEEBE3 @4.5': 4,
    // 4.40 · div.etats > span.pill.mfa « MFA ✓ » · securite/jour
    '#595B79 sur #D2D2E7 @4.5': 1,
    // 4.41 · div#pas.pas > button.on « La collection » · collection/jour fournisseur/jour produit/jour retour/jour
    '#6B665B sur #E9E1D4 @4.5': 4,
    // 4.43 · button.mini.dgr > span.ic « 🔓 » · verrous/nuit
    '#E36A6B sur #222B39 @4.5': 2,
    // 4.44 · div.etat > div.src.warn « Aucune variable dans Render : l’état act » · lancement/jour
    '#80680B sur #F2E8DA @4.5': 1,
    // 4.46 · div.barre > span.aide « Les éléments fixes ne se suppriment pas  » · config-navigation/nuit
    '#6D7F96 sur #0E1522 @4.5': 1,
    // 4.46 · div.haut > div.jeton « BB » · securite/jour
    '#5E656B sur #E5DFD4 @4.5': 2,
    // 4.47 · div.actes > button.b « ️ » · accueil/nuit
    '#808792 sur #18212F @4.5': 2,
    // 4.49 · div.lg > span.mk « ✎ » · config-navigation/nuit
    '#7F8792 sur #16202F @4.5': 1,
  },
};
