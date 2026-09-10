'use strict';

/*
 * LES FENÊTRES QUI N'ONT PAS DE MODE JOUR — ET POURQUOI CE N'EST PAS UNE DISPENSE
 * =============================================================================
 * Trois bancs — `banc-contraste-jour`, `banc-fonds-jour`, `banc-texte-sur-fond` —
 * répondent tous à la même question : « quand cette fenêtre passe en mode jour,
 * son texte reste-t-il lisible et ses surfaces s'éclaircissent-elles ? » C'est LA
 * bonne question pour 94 fenêtres sur 95, et le défaut du 2026-09-04 (« en mode
 * jour regarde, ce n'est pas beau », 2 300 couleurs de mode sombre posées sur un
 * fond clair) a montré ce qu'il coûte de ne pas la poser.
 *
 * ⚠⚠ MAIS ELLE N'A PAS DE SENS POUR UNE FENÊTRE QUI NE PASSE JAMAIS EN MODE JOUR.
 * Une fenêtre bascule parce qu'elle inclut `CSS_JOUR` du socle, qui porte les
 * reprises `html.jour`. Celle qui ne l'inclut pas n'a qu'UN seul mode : les bancs
 * mesurent alors ses couleurs contre un fond de jour (#f4f2ec) qui n'existera
 * jamais, et rapportent des ratios de 1,10 pour du texte blanc qui vit en réalité
 * sur un fond sombre. Ce sont les mêmes faux positifs que les « 55 fautes »
 * annoncées par la première version du banc au rendu — celles qu'une capture
 * d'écran a fait disparaître.
 *
 * ⚠ CE N'EST DONC PAS UNE LISTE DE PARDONS, C'EST UN CRITÈRE VÉRIFIABLE :
 * `verifie()` ci-dessous REFUSE une fenêtre déclarée ici si elle inclut quand même
 * `CSS_JOUR`. Une déclaration qui ne se vérifie pas serait exactement le trou
 * qu'on croit éviter en la lisant.
 *
 * ⚠ ET CE QUI CONTINUE DE LES COUVRIR : `banc-jetons` (tout var() employé doit
 * être défini — il n'accorde aucune dispense), `verifier-fenetres` (les écrans se
 * dessinent, cas par cas), `verifier-appels-fenetres` (aucun appel dans le vide),
 * `verifier-mise-en-page` (étiquettes, champs sans nom), `banc-accent-grave`.
 * Seule la question du BASCULEMENT est écartée, et seulement là où il n'existe pas.
 *
 * ⚠ POUR ENTRER ICI : la fenêtre doit être mono-mode PAR CONCEPTION, et la raison
 * doit être dans le texte — pas « ses couleurs ne passaient pas ». Une fenêtre
 * ordinaire qui échoue à ces bancs doit être CORRIGÉE ; l'ajouter ici serait
 * éteindre l'alarme au lieu du feu.
 */

const fs = require('fs');
const path = require('path');

const RAISONS = {
  /* L'écran de connexion (#57, 2026-09-10). Sa demande : « fait la page native de
     connexion, et je veux que tu gardes LE PLUS POSSIBLE notre interface actuelle
     mais en natif ». Son CSS est EXTRAIT de `_loginCSS` (assets/js/staff.js) :
     c'est l'écran de marque, et il est clair dans les deux modes depuis toujours —
     panneau beige #faf8f5 à droite, aurore violette sombre à gauche. Le faire
     basculer serait précisément ne pas garder son interface.
     ⚠ Les blancs translucides que les bancs signalent (7 emplois) et le texte
     blanc de `.admlogin-feat .al-ic` vivent sur le panneau SOMBRE de gauche ; le
     fond de jour contre lequel les bancs les mesurent n'y arrive jamais.
     ⚠ `.cx-err.sombre` (#172033) est un avis DÉLIBÉRÉMENT sombre dans le panneau
     clair — celui du mot de passe expiré, repris tel quel du web, où il sert à
     distinguer « un courriel est parti » d'un refus.
     ⚠ Ce qui A ÉTÉ CORRIGÉ plutôt que déclaré, parce que c'était une vraie dette :
     `.admlogin-back` et `.admlogin-forgot` étaient à 4,15:1 (#8a6a44 sur le beige).
     Corrigé À LA SOURCE, dans staff.js, en #7d5f3c — 4,91:1 — donc l'écran web en
     profite aussi. Les quatre jetons `--al-*` ont reçu un repli au `:root` : posés
     en style en ligne, ils laissaient le panneau transparent si ce style manquait. */
  'connexion.js': 'écran de marque, clair dans les deux modes (identique au web) — #57',
};

/**
 * ⚠ LA DÉCLARATION SE VÉRIFIE. Une fenêtre déclarée mono-mode qui inclurait
 * `CSS_JOUR` basculerait pour de vrai, et sa dispense serait alors un mensonge.
 * @returns {string[]} les fautes trouvées (vide si tout est cohérent)
 */
function verifie(dossierFenetres) {
  const fautes = [];
  const d = dossierFenetres || path.join(__dirname, '..', 'src', 'fenetres');
  for (const nom of Object.keys(RAISONS)) {
    const p = path.join(d, nom);
    if (!fs.existsSync(p)) {
      fautes.push(nom + ' est déclarée mono-mode mais le fichier n’existe plus — retirer la ligne.');
      continue;
    }
    const src = fs.readFileSync(p, 'utf8');
    if (/CSS_JOUR/.test(src)) {
      fautes.push(nom + ' est déclarée mono-mode mais inclut CSS_JOUR : elle bascule '
        + 'vraiment, donc les bancs du mode jour doivent la contrôler. Retirer la déclaration.');
    }
  }
  return fautes;
}

const estMonoMode = (nom) => Object.prototype.hasOwnProperty.call(RAISONS, nom);

module.exports = { RAISONS, verifie, estMonoMode };
