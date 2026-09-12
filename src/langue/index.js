'use strict';

/*
 * LES DEUX LANGUES DE L APPLICATION — le chargeur de dictionnaires
 * =============================================================================
 * ⚠⚠ SA DEMANDE : « traduire l application intégralement en anglais », et
 * « je veux qu elle soit bilingue intégral ». Mesure du 2026-09-12 avant de
 * commencer : 99 fenêtres, 7 288 textes visibles, 3 193 distincts.
 *
 * ══ TROIS DÉCISIONS, ET CHACUNE SE PAIE SI ON LA PREND À L ENVERS ═══════════
 *
 * 1. UN DICTIONNAIRE PLAT DE PHRASES ENTIÈRES, PAS DES MORCEAUX. C est la
 *    doctrine déjà écrite dans `connexion.js`, le seul écran bilingue à ce
 *    jour : « la tentation est de traduire morceau par morceau pour réutiliser
 *    les bouts ; en anglais l ordre des mots change, et on obtient des phrases
 *    qui n en sont pas ». Les valeurs variables passent par {0}, {1}…
 *
 * 2. LA TRADUCTION SE RÉSOUT À LA GÉNÉRATION, PAS DANS LE NAVIGATEUR. Chaque
 *    fenêtre est un littéral de gabarit assemblé par Node : `T('…')` y rend
 *    directement la bonne phrase. Conséquences, toutes bonnes :
 *      · la page NAÎT en anglais — pas de demi-seconde en français puis un
 *        redessin, ce qui est exactement ce qu on voit dans les applications
 *        traduites après coup ;
 *      · AUCUN dictionnaire n est embarqué dans la page (3 193 entrées dans
 *        99 fenêtres, ce serait des mégaoctets pour rien) ;
 *      · les bancs appellent les fabriques sans rien changer : la langue par
 *        défaut est le français, et tout ce qui existe reste vrai.
 *    ⚠ Le SEUL écran qui ne peut pas faire ça est `connexion.js`, parce qu il
 *    porte le sélecteur EN/FR lui-même et doit basculer sans se recharger. Il
 *    garde donc son dictionnaire embarqué — c est un cas particulier justifié,
 *    pas une exception à recopier.
 *
 * 3. UN FICHIER PAR FENÊTRE. Un dictionnaire unique de 3 193 lignes serait
 *    impossible à relire, et deux personnes ne pourraient pas y travailler sans
 *    se marcher dessus. `src/langue/<fenetre>.js` — le nom du fichier dit à quel
 *    écran on est.
 *
 * ╔══ LA RÈGLE QUI PASSE AVANT TOUTES LES AUTRES ═════════════════════════╗
 * ║ ⚠⚠⚠ LA TRADUCTION NE TOUCHE QUE CE QU ON LIT. JAMAIS CE QUI EST ÉCRIT.   ║
 * ║ Sa consigne du 2026-09-12, mot pour mot : « la traduction doit affecter    ║
 * ║ que la lecture et non pas les données enregistrées — autrement dit une      ║
 * ║ donnée écrite en français ne doit pas être altérée. »                        ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 *
 * ⚠ POURQUOI C EST LA PIRE FAUTE POSSIBLE ICI, et pas seulement une erreur de
 * plus : elle est SILENCIEUSE et DIFFÉRÉE. Rien ne casse au moment où on la fait.
 * Elle se découvre des semaines plus tard, quand une fiche ne répond plus à son
 * nom, qu un filtre ne trouve plus rien, ou qu une recherche rate la moitié des
 * lignes — et il est alors trop tard, parce que la donnée fausse est DÉJÀ
 * ENREGISTRÉE. On ne la retrouve pas en relisant le code : il faudrait relire la
 * base.
 *
 * ⚠ LES QUATRE ENDROITS OU LA FAUTE SE GLISSE, dans l ordre de danger :
 *   1. LA VALEUR D UNE OPTION. `<option value="robes">Robes</option>` : on traduit
 *      le LIBELLÉ, jamais le `value` — c est lui qui part dans la base.
 *   2. UN CHAMP PRÉ-REMPLI. `value="Nouvelle diapo"` est du TEXTE QUI SERA
 *      ENREGISTRÉ tel quel si personne ne le change. Le traduire écrit de
 *      l anglais dans les données de quelqu un qui travaille en français.
 *   3. UNE CLÉ D ÉTAT comparée ailleurs (`'paid'`, `'en_cours'`) : la traduire
 *      casse la comparaison, pas l affichage.
 *   4. UN TEXTE ENVOYÉ AU SERVEUR — un motif, une note, une ligne de journal.
 *      Il sera relu par quelqu un d autre, peut-être en français.
 *
 * ⚠⚠ ET CE N EST PAS QU UNE CONSIGNE : `banc-langue-donnees.js` REFUSE qu une
 * chaîne atteignant un chemin d écriture ait une entrée de dictionnaire. Une
 * consigne se re-trompe ; une mesure non — c est la leçon de la journée.
 *
 * ⚠⚠ CE QUI N EST PAS TRADUIT, ET IL FAUT LE DIRE PLUTÔT QUE LE CACHER :
 *   · les DONNÉES (noms de produits, notes, adresses) — c est son contenu ;
 *   · ce que le SERVEUR renvoie, sauf quand un motif connu permet de le
 *     traduire (même règle que `TM` dans connexion.js) ;
 *   · les noms propres et les codes.
 * Un écran à moitié traduit qui le CACHE est pire qu un écran qui l assume.
 */

const fs = require('fs');
const path = require('path');

/* ⚠ LA LANGUE COURANTE VIT ICI, ET NULLE PART AILLEURS. La poser en paramètre
   des fabriques aurait voulu dire toucher la centaine d appels de `main.js` —
   et le jour où l on en oublie un, cette fenêtre-là reste en français sans que
   rien ne le dise. La génération d une page est synchrone et sans concurrence :
   `poserLangue` avant, `T` pendant, c est exact.
   ⚠ `main.js` la pose au démarrage ET à chaque écriture du réglage. */
let _LANGUE = 'fr';
const poserLangue = (l) => { _LANGUE = (String(l || '') === 'en') ? 'en' : 'fr'; return _LANGUE; };
const langueCourante = () => _LANGUE;

/* Les dictionnaires déjà lus. ⚠ On garde aussi les ABSENCES (valeur null) :
   sans ça, une fenêtre sans dictionnaire relit le disque à chaque ouverture. */
const _cache = new Map();

const _dico = (nom) => {
  if (_cache.has(nom)) return _cache.get(nom);
  let d = null;
  try { d = require(path.join(__dirname, nom + '.js')); }
  catch (e) { d = null; }
  _cache.set(nom, d);
  return d;
};

/* ⚠ CE QUE `T` FAIT QUAND LA PHRASE MANQUE : il rend le FRANÇAIS. Pas une clé
   technique, pas une chaîne vide, pas « [missing] » — l écran reste utilisable,
   et c est le banc de couverture qui dit ce qui manque, pas l utilisateur qui le
   découvre en plein travail. */
/* ⚠⚠ LE SOCLE D’ABORD REGARDÉ EN DERNIER, ET C’EST TOUT L’INTÉRÊT. « Plein écran »,
   « Réduire », « Revenir à la taille normale » sont écrits UNE fois dans
   `socle.js` et paraissent dans les 99 fenêtres. Les mettre dans chaque
   dictionnaire, ce serait 99 copies d’une même phrase — et le jour où l’une
   change, 98 mensonges. Une fenêtre peut quand même redéfinir un texte du socle :
   son dictionnaire passe EN PREMIER, parce qu’un cas particulier doit pouvoir
   gagner sans qu’on touche au partagé. */
const SOCLE = 'socle';

const tr = (nom) => {
  const T = (fr, ...a) => {
    let v = fr;
    if (_LANGUE !== 'fr') {
      const d = _dico(nom);
      const s = (nom === SOCLE) ? null : _dico(SOCLE);
      if (d && Object.prototype.hasOwnProperty.call(d, fr)) v = d[fr];
      else if (s && Object.prototype.hasOwnProperty.call(s, fr)) v = s[fr];
    }
    for (let i = 0; i < a.length; i++) v = String(v).split('{' + i + '}').join(String(a[i]));
    return v;
  };
  return T;
};

/* Pour le banc de couverture : la liste des fenêtres qui ont un dictionnaire, et
   le dictionnaire lui-même. ⚠ Lue sur le DISQUE, jamais tenue à la main : une
   liste recopiée se périme au premier fichier ajouté. */
const fenetresTraduites = () => {
  try {
    return fs.readdirSync(__dirname)
      .filter((x) => x.endsWith('.js') && x !== 'index.js')
      .map((x) => x.replace(/\.js$/, '')).sort();
  } catch (e) { return []; }
};

/* Pour le banc de couverture : « ce texte a-t-il une décision », en regardant
   aux DEUX endroits. Sans ça, le banc réclamerait dans chaque fenêtre les
   phrases du socle — et le compteur ne pourrait jamais atteindre zéro. */
const aUneDecision = (nom, fr) => {
  const d = _dico(nom);
  if (d && Object.prototype.hasOwnProperty.call(d, fr)) return true;
  const s = _dico(SOCLE);
  return !!(s && Object.prototype.hasOwnProperty.call(s, fr));
};

module.exports = { poserLangue, langueCourante, tr, dico: _dico, aUneDecision, fenetresTraduites };
