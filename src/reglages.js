'use strict';

/*
 * RÉGLAGES PERSISTANTS DE LA COQUILLE
 * =============================================================================
 * Petit registre local à l'application : position du menu, taille, dimensions
 * de la fenêtre détachée. Un fichier JSON dans le dossier de données du poste
 * (`%APPDATA%\SANDRIZA Admin\reglages.json` sous Windows).
 *
 * ⚠ POURQUOI PAS `localStorage` COMME LE RESTE.
 * Le reste des préférences d'administration vit en Turso, par profil — c'est ce
 * qu'on veut pour tout ce qui suit la PERSONNE. Mais la place du menu suit le
 * POSTE : l'écran de gauche du comptoir n'est pas celui du bureau, et une
 * préférence synchronisée déplacerait le menu d'un poste quand on le bouge sur
 * l'autre. En plus, ces réglages doivent être lus AVANT que la page ne charge —
 * `localStorage` appartient au document, il n'existe pas encore à cet instant.
 *
 * ⚠ JAMAIS DE SECRET ICI : ce fichier est en clair et lisible par l'usager.
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const DEFAUTS = {
  // 'haut' | 'gauche' | 'droite' | 'fenetre'
  menuMode: 'haut',
  // Facteur d'échelle du menu (1 = taille de base). Borné à la lecture.
  menuTaille: 1.15,
  // Fenêtre détachée : position et dimensions retenues d'une fois à l'autre,
  // y compris sur un second écran (Electron replace la fenêtre sur l'écran
  // correspondant, et la ramène sur l'écran principal si celui-ci a disparu).
  menuFenetre: { width: 260, height: 620, x: null, y: null },
  menuToujoursDevant: true,
};

let _cache = null;

const chemin = () => path.join(app.getPath('userData'), 'reglages.json');

function lire() {
  if (_cache) return _cache;
  let brut = {};
  try {
    const txt = fs.readFileSync(chemin(), 'utf8');
    brut = JSON.parse(txt) || {};
  } catch { brut = {}; }           // absent ou illisible : on repart des défauts
  _cache = { ...DEFAUTS, ...brut, menuFenetre: { ...DEFAUTS.menuFenetre, ...(brut.menuFenetre || {}) } };
  // Bornes : un fichier édité à la main ne doit pas pouvoir produire un menu
  // invisible (échelle 0) ou plus large que l'écran.
  const t = parseFloat(_cache.menuTaille);
  _cache.menuTaille = Number.isFinite(t) ? Math.max(0.85, Math.min(1.8, t)) : DEFAUTS.menuTaille;
  if (!['haut', 'gauche', 'droite', 'fenetre'].includes(_cache.menuMode)) {
    _cache.menuMode = DEFAUTS.menuMode;
  }
  return _cache;
}

function ecrire(patch) {
  const suivant = { ...lire(), ...patch };
  _cache = suivant;
  try {
    fs.mkdirSync(path.dirname(chemin()), { recursive: true });
    fs.writeFileSync(chemin(), JSON.stringify(suivant, null, 2), 'utf8');
  } catch { /* disque plein ou dossier verrouillé : on garde au moins le cache */ }
  return suivant;
}

const get = (cle) => lire()[cle];
const set = (cle, valeur) => ecrire({ [cle]: valeur });

module.exports = { lire, ecrire, get, set, DEFAUTS };
