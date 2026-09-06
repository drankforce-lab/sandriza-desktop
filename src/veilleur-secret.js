'use strict';

/*
 * LE JETON DU VEILLEUR — RANGÉ CHIFFRÉ SUR LE POSTE
 * =============================================================================
 * Le veilleur interroge `notif-feed.php` avec un jeton dédié en lecture seule.
 * Ce jeton doit vivre SUR LE POSTE (le veilleur démarre avec Windows, bien avant
 * qu'une session d'administration existe) — donc la seule question est : où, sans
 * le laisser en clair ?
 *
 * ⚠⚠ PAS DANS `reglages.json`, ET SON EN-TÊTE LE DIT DÉJÀ : « JAMAIS DE SECRET
 * ICI : ce fichier est en clair et lisible par l'usager ». La règle existait
 * avant ce module ; l'enfreindre « juste pour un jeton de lecture seule » est
 * exactement la façon dont une règle meurt. Le jeton part donc dans un fichier à
 * lui, chiffré.
 *
 * ══ `safeStorage`, ET CE QU'IL PROTÈGE VRAIMENT ═════════════════════════════
 * Electron chiffre par le magasin du système (DPAPI sous Windows, le Trousseau
 * sous macOS) : la clé est liée AU COMPTE OUVERT DE SESSION. Un fichier
 * `veilleur.dat` recopié sur un autre poste, ou lu par un autre compte Windows,
 * ne se déchiffre pas.
 * ⚠ Ce qu'il NE protège PAS, et il faut le savoir : quelqu'un qui ouvre une
 * session AVEC ce compte peut le lire. C'est acceptable ICI, et seulement ici,
 * parce que le jeton n'ouvre qu'une route qui ne rend QUE DES NOMBRES — pas une
 * commande, pas un nom, pas un montant. C'est toute la raison pour laquelle la
 * route est aussi pauvre.
 *
 * ⚠ `safeStorage` PEUT NE PAS ÊTRE DISPONIBLE (session Linux sans trousseau,
 * appel trop tôt avant `app.whenReady`). On REFUSE alors d'écrire, et on le DIT —
 * écrire en clair « en attendant » laisserait un secret nu sur le disque pour
 * toujours, et personne ne repasserait jamais derrière.
 */

const fs = require('fs');
const path = require('path');
const { app, safeStorage } = require('electron');

// ⚠ Le fichier vit dans le dossier de données de l'APPLICATION PRINCIPALE, pas
// dans celui du processus veilleur : c'est l'administration qui pose le jeton, et
// le veilleur qui le lit. Deux dossiers, ce serait deux jetons à synchroniser.
// `_racine` est injectable pour que le veilleur, qui déplace son `userData`,
// puisse quand même désigner celui de l'application.
/* ⚠⚠ LA RACINE EST DONNÉE, PLUS DEVINÉE — ET C'EST LA CORRECTION DU 2026-09-06.
   Les deux processus la CALCULAIENT chacun de leur côté, par
   `app.getPath('userData')`, en supposant qu'ils tomberaient sur le même
   dossier. Ils n'y tombaient pas : sa capture montre l'administration qui lit le
   jeton (« se termine par 9d44 ») et le veilleur qui répond « jeton absent », au
   même instant. Les deux disaient vrai.
   Je n'ai pas cherché POURQUOI ils divergeaient — il y a plusieurs candidats
   crédibles (une application lancée une fois en tant qu'administrateur n'a pas
   le même `%APPDATA%`, et DPAPI ne déchiffre pas d'un compte à l'autre) et le
   diagnostic aurait coûté un cycle d'installation par hypothèse.
   ⚠ On supprime la CLASSE de défaut au lieu de trancher entre les causes :
   l'administration PASSE le chemin au veilleur (`--racine=…`), qui ne calcule
   donc plus rien. Deux processus qui doivent s'accorder sur un chemin ne doivent
   pas le déduire séparément — l'un le dit, l'autre l'écoute.
   Le calcul reste en repli, pour un veilleur lancé à la main sans argument. */
let _racine = null;
const definirRacine = (dossier) => { _racine = dossier || null; };

/** La racine passée en ligne de commande, si elle y est. */
const racineDesArguments = () => {
  const a = (process.argv || []).find((x) => String(x).startsWith('--racine='));
  return a ? String(a).slice('--racine='.length) : '';
};

const chemin = () => path.join(_racine || app.getPath('userData'), 'veilleur.dat');

const disponible = () => {
  try { return safeStorage.isEncryptionAvailable(); } catch { return false; }
};

/** @returns {string} le jeton, ou '' s'il n'y en a pas (ou s'il est illisible). */
function lire() {
  try {
    if (!disponible()) return '';
    const buf = fs.readFileSync(chemin());
    // ⚠ Un `.dat` d'un AUTRE compte Windows lève ici. Ce n'est pas une panne :
    // c'est le chiffrement qui fait son travail. On rend '' et l'appelant dira
    // « pas configuré », ce qui est vrai pour CE compte.
    return String(safeStorage.decryptString(buf) || '');
  } catch { return ''; }
}

/** @returns {{ok:boolean, motif?:string}} — jamais un booléen nu : l'appelant
 *  doit pouvoir DIRE pourquoi ça n'a pas marché. */
function ecrire(jeton) {
  const v = String(jeton || '').trim();
  if (v === '') {
    // Effacer, c'est légitime : « désactiver le veilleur » doit pouvoir retirer
    // le jeton du poste, pas seulement cesser de s'en servir.
    try { fs.unlinkSync(chemin()); } catch {}
    return { ok: true, efface: true };
  }
  // Le même plancher que la route : un jeton court est un jeton deviné.
  if (v.length < 24) return { ok: false, motif: 'trop_court' };
  if (!disponible()) return { ok: false, motif: 'chiffrement_indisponible' };
  try {
    const buf = safeStorage.encryptString(v);
    fs.mkdirSync(path.dirname(chemin()), { recursive: true });
    fs.writeFileSync(chemin(), buf);
    return { ok: true };
  } catch (e) {
    return { ok: false, motif: 'ecriture' };
  }
}

const existe = () => lire() !== '';

module.exports = { definirRacine, racineDesArguments, lire, ecrire, existe, disponible, chemin };
