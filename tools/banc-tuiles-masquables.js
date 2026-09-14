'use strict';

/*
 * LE 42ᵉ BANC — UN BANDEAU DE TUILES CHIFFRÉES DOIT POUVOIR SE MASQUER
 * =============================================================================
 * Sa demande du 2026-09-14, capture à l'appui (les quatre tuiles de
 * Remboursements) : « nouvelle audit partout où tu as ces tuiles, je dois
 * pouvoir les retirer au besoin en les masquant », puis « et passe TOUTES les
 * fenêtres ».
 *
 * ⚠⚠ POURQUOI UN BANC ET PAS SEULEMENT VINGT-CINQ CORRECTIONS.
 * Le bandeau a été RECOPIÉ de fenêtre en fenêtre, et son nom a dérivé en
 * chemin : `.tuiles/.tuile` dans dix-sept fenêtres, `.stats/.s` dans cinq,
 * `.stat-grid/.stat` dans trois. Personne n'a décidé ça ; c'est ce qui arrive
 * quand on copie. La 27ᵉ fenêtre arrivera de la même façon — copiée sur une
 * voisine — et elle arrivera SANS le bouton de repli si rien ne le réclame.
 * C'est exactement l'histoire de « Afficher la barre latérale » : une commande
 * qui manque ne lève aucune erreur, elle manque simplement, et on s'en aperçoit
 * des mois plus tard.
 *
 * ⚠ CE BANC NE CHERCHE PAS UN NOM DE CLASSE, IL CHERCHE LA FORME.
 * Chercher `.tuiles` aurait donné un relevé qui rassure et qui ment : il aurait
 * ignoré les huit fenêtres où le bandeau s'appelle autrement. Un bandeau, c'est
 *   ① une classe dont les descendants portent ENSEMBLE un GROS NOMBRE
 *     (≥ .9rem, gras ≥ 700) et un LIBELLÉ EN CAPITALES en petit corps ;
 *   ② employée dans le HTML de la fenêtre.
 * Les deux ensemble, sinon c'est un formulaire ou une carte.
 *
 * ⚠ LA DÉROGATION EST NOMMÉE, DATÉE ET MOTIVÉE (voir DEROGATIONS). Une liste
 * d'exceptions sans motif redevient un trou au bout de trois mois.
 *
 * PANNE PROVOQUÉE (à rejouer si on touche à ce banc) : retirer `szTuiles(` d'une
 * fenêtre convertie — par exemple remboursements.js — et relancer. Il doit
 * nommer la fenêtre, pas passer au vert.
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'src', 'fenetres');
const DICO = path.join(__dirname, '..', 'src', 'langue', 'socle.js');

/* ══ LES DÉROGATIONS ═══════════════════════════════════════════════════════
   ⚠ JOURNAUX A DÉJÀ SON INTERRUPTEUR, et il est ANTÉRIEUR à la pièce commune :
   un bouton « Masquer les stats » dans sa barre, dont l'état vit côté SITE, par
   PROFIL (`journaux_stats_hidden`, cœur `Staff.journalStatsToggleCoeur`). Il
   fait donc déjà ce qu'il a demandé, sur cet écran-là.
   ⚠ On ne l'a PAS converti dans le même geste, et c'est délibéré : convertir
   signifierait supprimer un cœur du site, une opération du pont et une
   préférence déjà posée par des gens — c'est-à-dire modifier ce qui marche en
   même temps qu'on ajoute, la façon la plus sûre de ne plus savoir lequel des
   deux a cassé quelque chose. Unification à faire, séparément.
   ⚠ La conséquence assumée : sur Journaux le repli suit la PERSONNE, ailleurs
   il suit le POSTE. */
const DEROGATIONS = {
  journaux: 'garde son propre interrupteur, antérieur et côté site, par profil '
    + '(journaux_stats_hidden) — unification à faire séparément',
};

/* ══ CE QUI A LA FORME SANS ÊTRE UN BANDEAU ════════════════════════════════
   ⚠ LA RECHERCHE PAR LA FORME RAMASSE AUSSI DES VOISINS. Un gros nombre plus un
   libellé en capitales, c'est la signature d'une tuile — c'est aussi celle d'un
   en-tête de marque, d'un encadré de solde ou d'une boîte modale. Les nommer un
   par un, avec leur motif, vaut mieux que de durcir le filtre jusqu'à ce qu'il
   laisse passer un VRAI bandeau : un relevé trop fin rend zéro et se prend pour
   une bonne nouvelle (mesuré, deux fois, en écrivant ce banc).
   ⚠ Chaque ligne dit CE QUE C'EST. « faux positif » tout seul ne se relit pas. */
const PAS_UN_BANDEAU = {
  affichage: 'en-tête de l’écran client : le nom de la marque en gros, « Votre commande » '
    + 'en capitales dessous. Un en-tête, pas des totaux',
  banque: 'l’encadré d’ÉCART du rapprochement — une seule valeur, verte ou rouge, '
    + 'qui est le verdict de l’écran. La masquer viderait l’écran de son sens',
  marque: 'l’aperçu d’un thème de marque (pastille, titre, sous-titre) : c’est un '
    + 'échantillon de couleurs, il ne compte rien',
  promotions: 'la boîte modale d’édition — son h3 est gras et ses h4 sont en capitales. '
    + 'Un formulaire, pas un bandeau',
};

const GROS = (c) => /font\s*:\s*[5-9]00\s+[\d.]+rem/.test(c)
  || (/font-weight\s*:\s*([5-9]00|bold)/.test(c) && /font-size\s*:\s*(\.9\d*|[1-9][\d.]*)rem/.test(c));
const PETIT_CAP = (c) => /text-transform\s*:\s*uppercase/.test(c)
  && /font-size\s*:\s*(\.[5-8]\d*rem|1[01]px)/.test(c);

/** Les classes de TUILE d'un fichier : gros nombre ET libellé en capitales. */
const tuilesDe = (src) => {
  const info = new Map();
  const noter = (c, champ) => { if (!info.has(c)) info.set(c, {}); info.get(c)[champ] = true; };
  const re = /([^{}\n;]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(src))) {
    const corps = m[2];
    if (!GROS(corps) && !PETIT_CAP(corps)) continue;
    m[1].split(',').forEach((s) => {
      const parts = s.trim().split(/\s+/).filter(Boolean)
        .map((p) => p.replace(/^(\.[a-z0-9_-]+)(?:[.:][a-z0-9_()-]+)*$/i, '$1'));
      if (parts.length < 2) return;
      const cible = parts[parts.length - 2];
      if (!/^\.[a-z0-9_-]+$/i.test(cible)) return;
      if (GROS(corps)) noter(cible, 'gros');
      if (PETIT_CAP(corps)) noter(cible, 'cap');
    });
  }
  const out = [];
  info.forEach((v, c) => { if (v.gros && v.cap) out.push(c.slice(1)); });
  return out;
};

const fautes = [];
const fichiers = fs.readdirSync(DIR).filter((f) => f.endsWith('.js') && f !== 'socle.js').sort();

let avecBandeau = 0;
let couverts = 0;
let derogees = 0;
let ecartes = 0;

fichiers.forEach((f) => {
  const nom = f.replace(/\.js$/, '');
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');

  const tuiles = tuilesDe(src);
  if (!tuiles.length) return;
  // La tuile doit être EMPLOYÉE dans le HTML, sinon c'est du CSS mort.
  const employee = tuiles.some((t) =>
    new RegExp('class=\\\\?["\'][^"\']*\\b' + t + '\\b').test(src));
  if (!employee) return;

  /* ⚠ ÉCARTÉ AVANT D'ÊTRE COMPTÉ : ce n'est pas un bandeau, donc il n'entre même
     pas dans le total. Le compter puis l'excuser gonflerait le chiffre annoncé. */
  if (PAS_UN_BANDEAU[nom]) { ecartes += 1; return; }

  avecBandeau += 1;

  if (DEROGATIONS[nom]) { derogees += 1; return; }

  const declare = src.match(/JS_TUILES\(\s*'([a-z0-9_-]+)'\s*\)/);
  const enveloppe = (src.match(/szTuiles\(/g) || []).length;

  if (!declare) {
    fautes.push(nom + ' porte un bandeau de tuiles (.' + tuiles.join(' .')
      + ') mais n’appelle pas JS_TUILES(...) : le bandeau ne pourra pas se masquer');
    return;
  }
  if (!/JS_TUILES/.test((src.match(/require\('\.\/socle\.js'\)/) ? src.split('require(\'./socle.js\')')[0] : ''))) {
    fautes.push(nom + ' appelle JS_TUILES(...) sans l’importer du socle');
    return;
  }
  if (declare[1] !== nom) {
    fautes.push(nom + ' déclare la clé « ' + declare[1] + ' » : elle doit porter le nom de la fenêtre, '
      + 'sinon deux écrans se replieraient ensemble sans qu’on sache pourquoi');
    return;
  }
  if (!enveloppe) {
    fautes.push(nom + ' déclare JS_TUILES(...) mais n’enveloppe AUCUN bandeau avec szTuiles(...) : '
      + 'le bouton n’apparaîtra nulle part');
    return;
  }
  couverts += 1;
});

/* ══ LES DEUX LIBELLÉS VIVENT DANS LE DICTIONNAIRE COMMUN ══════════════════
   ⚠ Ils ne sont PAS recopiés dans les 25 dictionnaires de fenêtres : le
   mécanisme est commun, ses mots le sont aussi. Sans ce contrôle, un ménage du
   lexique les emporterait et le bouton parlerait français sur la page anglaise
   — sans qu aucun autre banc ne s en aperçoive, puisqu il est fabriqué par le
   socle et non par la fenêtre. */
{
  const dico = fs.readFileSync(DICO, 'utf8');
  ['Masquer les totaux', 'Afficher les totaux'].forEach((cle) => {
    if (dico.indexOf('\'' + cle + '\'') < 0) {
      fautes.push('src/langue/socle.js n’a plus « ' + cle + ' » : le bouton de repli resterait français en anglais');
    }
  });
}

/* ⚠ ET LA DÉROGATION DOIT RESTER VRAIE. Une exception qui désigne une fenêtre
   disparue est un trou déguisé en décision. */
[[DEROGATIONS, 'dérogation'], [PAS_UN_BANDEAU, 'mise à l’écart']].forEach(([table, mot]) => {
  Object.keys(table).forEach((nom) => {
    if (!fs.existsSync(path.join(DIR, nom + '.js'))) {
      fautes.push('la ' + mot + ' « ' + nom + ' » ne désigne aucune fenêtre : à retirer');
    }
  });
});

if (fautes.length) {
  console.log('✗ ' + fautes.length + ' bandeau(x) de tuiles hors du mécanisme commun :');
  fautes.forEach((x) => console.log('   — ' + x));
  process.exit(1);
}

console.log('✓ ' + avecBandeau + ' fenêtre(s) portent un bandeau de tuiles chiffrées · '
  + couverts + ' masquable(s) par la pièce commune · ' + derogees + ' dérogation(s) motivée(s) · '
  + ecartes + ' ressemblance(s) écartée(s) et nommée(s)');
