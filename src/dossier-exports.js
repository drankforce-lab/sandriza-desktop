'use strict';

/*
 * OÙ LES FICHIERS D'EXPORT ATTERRISSENT — LA RÈGLE, SEULE
 * =============================================================================
 * Trois lignes de décision, sorties de `main.js` pour UNE raison : elles doivent
 * pouvoir être ÉPROUVÉES. `main.js` a besoin du processus principal d'Electron
 * pour se charger, donc tout ce qui y dort ne se teste qu'en RECOPIANT la règle
 * dans le banc — c'est ce que `banc-maj.js` a dû faire, et il porte l'avis « doit
 * rester d'accord avec main.js », c'est-à-dire un accord que personne ne vérifie.
 * Ici la règle est importée par les deux côtés : elle ne peut pas diverger.
 *
 * ⚠⚠ LE REPLI EST LE CŒUR DE CE FICHIER, pas un cas limite. Un dossier choisi
 * peut DISPARAÎTRE entre deux exports : clé USB retirée, lecteur réseau
 * déconnecté, dossier renommé. Sans repli, chaque export échouerait — et le
 * message aurait parlé d'écriture, pas de dossier absent : on aurait cherché la
 * panne dans l'export.
 *
 * ⚠ ON NE REMET PAS LE CHOIX À `null` EN PASSANT. Ce serait oublier sa décision
 * parce qu'une clé était débranchée une fois. Le choix reste, et redevient
 * effectif dès que le dossier réapparaît.
 */

const fs = require('fs');

/* Un dossier utilisable = il existe (ou peut être créé) ET on peut y écrire.
   ⚠ `mkdirSync` SEUL NE SUFFIT PAS : un dossier réseau en lecture seule se crée
   sans erreur et refuse le premier fichier. C'est précisément le cas qu'on veut
   attraper au moment de CHOISIR, pas au premier export. */
const utilisable = (d) => {
  try {
    fs.mkdirSync(d, { recursive: true });
    fs.accessSync(d, fs.constants.W_OK);
    return true;
  } catch { return false; }
};

/* Rend l'état COMPLET, jamais seulement le chemin : `dir` (où ça part), `choisi`
   (ce qu'on a réglé, même s'il ne répond pas), `defaut` (le dossier standard) et
   `repli` (le choix existe mais ne répond pas).
   ⚠ `repli` N'EST PAS « dir !== choisi » : sans choix du tout, `dir` vaut le
   défaut et il n'y a AUCUN repli à annoncer — la fenêtre afficherait un bandeau
   jaune permanent à qui n'a jamais rien réglé.
   ⚠ `estUtilisable` est injectable pour le banc SEULEMENT : fabriquer un dossier
   en lecture seule sous Windows demande de toucher aux ACL, et un banc qui
   modifie les droits d'un dossier réel est un banc qu'on finit par ne plus
   lancer. */
const info = (defaut, choisiBrut, estUtilisable) => {
  const u = estUtilisable || utilisable;
  const choisi = String(choisiBrut || '');
  if (choisi && u(choisi)) return { dir: choisi, choisi, defaut, repli: false };
  const repli = !!choisi;              // il y avait un choix, il ne répond pas
  u(defaut);                           // le standard, lui, se crée au besoin
  return { dir: defaut, choisi, defaut, repli };
};

module.exports = { utilisable, info };
