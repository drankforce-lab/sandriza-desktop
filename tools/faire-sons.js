'use strict';

/*
 * FABRIQUE DES DEUX SONS DU VEILLEUR
 * =============================================================================
 *   node tools/faire-sons.js
 *   → src/sons/commande.wav   ·   src/sons/retour.wav
 *
 * Sa demande du 2026-08-07 : « émet un toast et un son UNIQUE pour les commandes
 * et un AUTRE pour les retours ». Le mot qui commande tout est « unique » : on
 * doit savoir lequel des deux vient de sonner SANS REGARDER L'ÉCRAN. C'est la
 * seule exigence de ce fichier, et elle est plus dure qu'elle n'en a l'air.
 *
 * ══ POURQUOI DEUX SONS FABRIQUÉS ICI, ET PAS DEUX FICHIERS TROUVÉS ══════════
 * Un son téléchargé, c'est une licence à démontrer et un fichier que personne ne
 * peut expliquer dans six mois. Ces deux-là se régénèrent d'une commande, tiennent
 * en quelques kilo-octets, et leur différence est ÉCRITE plutôt que subie.
 *
 * ══⚠ CE QUI LES REND RECONNAISSABLES — LE SENS, PAS LA HAUTEUR ══════════════
 * Deux notes aiguës et deux notes graves se confondent dès qu'un ventilateur
 * tourne ou que le son du poste est bas. Ce qui survit, c'est la DIRECTION :
 *
 *   • COMMANDE  — deux notes qui MONTENT (La5 → Mi6). Quelque chose ARRIVE.
 *   • RETOUR    — deux notes qui DESCENDENT (Ré5 → Sol4). Quelque chose REVIENT.
 *
 * La direction s'entend même à faible volume, même de l'autre bout de la pièce,
 * et même par quelqu'un qui n'a aucune oreille musicale. Un aigu contre un grave
 * ne survit à rien de tout cela.
 *
 * ⚠ Le retour est aussi plus SOURD (moins d'harmonique) et un peu plus long. Une
 * commande est une bonne nouvelle, un retour est un travail à faire : le son ne
 * doit pas se réjouir de la même façon. C'est le même principe que les toasts de
 * la boutique — le ton dit déjà de quoi il s'agit.
 *
 * ══ L'ENVELOPPE N'EST PAS UN ORNEMENT ═══════════════════════════════════════
 * Une sinusoïde qui commence et s'arrête net produit un CLAQUEMENT (la
 * discontinuité est un bruit large bande, que les petits haut-parleurs de
 * portable amplifient). D'où l'attaque et l'extinction progressives, et le
 * passage par zéro à la fin. Sans elles, les deux sons se ressembleraient — par
 * leur clic.
 */

const fs = require('fs');
const path = require('path');

const TAUX = 44100;          // Hz — le seul taux que TOUT lit sans rééchantillonner
const AMPLITUDE = 0.32;      // sous 1 pour laisser la place aux deux partiels

/**
 * Une note. `harmonique` = poids du deuxième partiel (l'octave) : c'est lui qui
 * fait la différence entre un son clair (commande) et un son sourd (retour).
 */
function note(hz, ms, harmonique) {
  const n = Math.round((ms / 1000) * TAUX);
  const ech = new Float64Array(n);
  const attaque = Math.round(TAUX * 0.008);          // 8 ms — assez pour ne pas claquer
  const extinction = Math.round(n * 0.55);           // longue : la note « s'éteint »
  for (let i = 0; i < n; i++) {
    const t = i / TAUX;
    let v = Math.sin(2 * Math.PI * hz * t)
          + harmonique * Math.sin(2 * Math.PI * hz * 2 * t);
    v /= (1 + harmonique);
    // Enveloppe : montée courte, descente en cloche jusqu'à zéro exact.
    let g = 1;
    if (i < attaque) g = i / attaque;
    if (i > n - extinction) {
      const k = (n - i) / extinction;
      g *= k * k;                                    // décroissance douce, pas linéaire
    }
    ech[i] = v * g * AMPLITUDE;
  }
  return ech;
}

const silence = (ms) => new Float64Array(Math.round((ms / 1000) * TAUX));

function coller(morceaux) {
  const total = morceaux.reduce((a, m) => a + m.length, 0);
  const out = new Float64Array(total);
  let o = 0;
  for (const m of morceaux) { out.set(m, o); o += m.length; }
  return out;
}

/** WAV PCM 16 bits mono — le format que Chromium, Windows et macOS lisent tous. */
function wav(ech) {
  const donnees = Buffer.alloc(ech.length * 2);
  for (let i = 0; i < ech.length; i++) {
    // Bornage AVANT l'arrondi : un dépassement se replierait en craquement.
    const v = Math.max(-1, Math.min(1, ech[i]));
    donnees.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const tete = Buffer.alloc(44);
  tete.write('RIFF', 0);
  tete.writeUInt32LE(36 + donnees.length, 4);
  tete.write('WAVE', 8);
  tete.write('fmt ', 12);
  tete.writeUInt32LE(16, 16);          // taille du bloc fmt
  tete.writeUInt16LE(1, 20);           // 1 = PCM entier
  tete.writeUInt16LE(1, 22);           // mono
  tete.writeUInt32LE(TAUX, 24);
  tete.writeUInt32LE(TAUX * 2, 28);    // octets par seconde
  tete.writeUInt16LE(2, 32);           // octets par trame
  tete.writeUInt16LE(16, 34);          // bits par échantillon
  tete.write('data', 36);
  tete.writeUInt32LE(donnees.length, 40);
  return Buffer.concat([tete, donnees]);
}

// ── COMMANDE : ça MONTE, et c'est clair ─────────────────────────────────────
// La5 (880) → Mi6 (1318,5) : une quinte juste ascendante. L'harmonique à 0,35
// donne le côté « clochette » qui perce le bruit d'un atelier.
const commande = coller([
  note(880.0, 130, 0.35),
  silence(25),
  note(1318.5, 300, 0.35),
]);

// ── RETOUR : ça DESCEND, et c'est sourd ─────────────────────────────────────
// Ré5 (587,3) → Sol4 (392,0) : la même quinte, à l'envers et plus bas.
// Harmonique à 0,10 : presque une sinusoïde pure, donc un son mat qui ne
// ressemble à rien de festif. Un peu plus long : on ne le confond pas non plus
// par sa durée.
const retour = coller([
  note(587.3, 160, 0.10),
  silence(30),
  note(392.0, 380, 0.10),
]);

const dossier = path.join(__dirname, '..', 'src', 'sons');
fs.mkdirSync(dossier, { recursive: true });

for (const [nom, ech] of [['commande', commande], ['retour', retour]]) {
  const f = path.join(dossier, nom + '.wav');
  const buf = wav(ech);
  fs.writeFileSync(f, buf);
  console.log(nom + '.wav — ' + (ech.length / TAUX).toFixed(2) + ' s, ' + buf.length + ' octets');
}
