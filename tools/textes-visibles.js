'use strict';

/*
 * CE QU UNE FENETRE AFFICHE — la definition, en UN SEUL endroit
 * =============================================================================
 * ⚠⚠ POURQUOI CE MODULE EXISTE. Deux bancs posent la meme question — « quels
 * textes cette fenetre montre-t-elle ? » — pour deux raisons differentes :
 *   · `banc-accents-visibles` : sont-ils ecrits avec leurs accents ?
 *   · `banc-langue-fenetres`  : sont-ils traduits ?
 * Recopier l extraction dans les deux, c est garantir qu elles divergeront, et
 * qu un jour l un des deux mesurera un terrain que l autre ne voit plus. Pire :
 * la divergence ne fait rien tomber — elle fait juste retrecir un banc.
 *
 * ⚠ CE QU IL A FALLU APPRENDRE POUR QUE CETTE EXTRACTION SOIT JUSTE (2026-09-12,
 * 1596 accusations au premier jet, 7 au bout) :
 *   · on retire les BALISES avant de lire : `<div class="etat">` n affiche rien
 *     qui porte un accent, et les noms sont en ASCII par convention ;
 *   · AUCUNE longueur minimale dans la recherche des chaines : elle fausse l
 *     appariement des guillemets, et le banc rapporte du CODE comme du texte ;
 *   · un mot colle a un point, un tiret ou un deux-points est un NOM, pas un mot ;
 *   · deux sources, deux regles : un noeud de texte du HTML est affiche (un mot
 *     seul y compte), une chaine du script peut etre un identifiant.
 */

/* ══ UN `/*` DANS UNE CHAINE N OUVRE PAS UN COMMENTAIRE ═════════════════════
 * ⚠⚠⚠ MESURE DU 2026-09-13 : `accept="image/*"` ouvrait un commentaire FANTOME
 * qui courait jusqu au prochain `*​/` du fichier — souvent des milliers de
 * caracteres plus loin, dans la vraie fiche d une autre fonction. Releve sur les
 * 100 fenetres : 19 faux ouvreurs dans 13 d entre elles, environ 92 000
 * caracteres rendus INVISIBLES a tout ce qui passe par ici.
 * ⚠⚠ CE QUE CA COUTAIT VRAIMENT. Ce n est pas une accusation en trop, c est une
 * absence d accusation : dans ces 92 000 caracteres, le poseur n enveloppait
 * rien, `banc-langue-sur-code` ne voyait aucune enveloppe, et le banc du
 * residuel ne lisait aucune chaine. Trouve en cherchant pourquoi
 * `title="Retirer la photo"` (produit.js:1190) restait en francais alors que sa
 * cle existait : il tombait dans le fantome ouvert par `e.accept = 'image/*'`,
 * 6 600 caracteres plus haut.
 * ⚠ LA SIGNATURE EST NETTE, et c est la meme famille que le `://` de la ligne
 * d en dessous : un VRAI commentaire n est jamais colle a une lettre, a un
 * chiffre ou a un guillemet. Il commence la ligne, ou suit un espace, un `;`,
 * une accolade, une parenthese, une virgule ou un `=`. Dans `'image/*'`, le
 * `/*` est precede d un `e`.
 * ⚠ Un automate a etats aurait ete plus exact, mais ce depot en a deja paye un :
 * il entrait en « chaine » sur le guillemet de `.replace(/"/g, …)`. Une borne
 * qu on peut lire vaut mieux qu un automate qu on ne peut pas relire. */
const sansCommentaires = (s) => s
  .replace(/(^|[\s;{}(),=])\/\*[\s\S]*?\*\//g, (m, p) => p + m.slice(p.length).replace(/[^\n]/g, ' '))
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, ' '));

const texteVisible = (s) => {
  let t = s.replace(/<[^>]*>/g, ' ').replace(/<[^>]*$/, ' ');
  const g = t.indexOf('>');                      // le fragment commencait DANS une balise
  if (g >= 0) t = t.slice(g + 1);
  return t.replace(/&[a-z#0-9]{2,8};/gi, ' ').replace(/\s+/g, ' ').trim();
};

/* De la PROSE porte une majuscule, un accent ou une ponctuation. « etat non »
   est un nom de classe. ⚠ On ne peut PAS exiger un accent : c est justement ce
   qui manque dans le defaut que cherche le banc des accents. */
const PHRASE = /[A-ZÀ-ɏ]|[.,;:!?…’—]/;

const blanchir = (s, re) => s.replace(re, (m) => m.replace(/[^\n]/g, ' '));

/* Les noeuds de texte du HTML engendre, et les attributs qui S AFFICHENT. */
const texteAffiche = (page) => {
  const sans = blanchir(blanchir(page, /<script[\s\S]*?<\/script>/gi),
    /<style[\s\S]*?<\/style>/gi);
  const out = [];
  let m;
  const re = />([^<>]+)</g;
  while ((m = re.exec(sans))) {
    const t = m[1].replace(/&[a-z#0-9]{2,8};/gi, ' ').replace(/\s+/g, ' ').trim();
    if (t) out.push({ texte: t, index: m.index, ou: 'html' });
  }
  const ra = /\b(?:title|placeholder|aria-label|alt)\s*=\s*"([^"<>]+)"/gi;
  while ((m = ra.exec(sans))) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (t && PHRASE.test(t)) out.push({ texte: t, index: m.index, ou: 'attribut' });
  }
  return out;
};

/* Les chaines du script qui ressemblent a de la prose. */
const chainesProse = (js) => {
  const out = [];
  const re = /'([^'\\\n]*)'|"([^"\\\n]*)"/g;
  let m;
  while ((m = re.exec(js))) {
    const t = texteVisible(m[1] !== undefined ? m[1] : m[2]);
    if (t.length < 6) continue;
    if (!/\s/.test(t)) continue;                 // un seul mot : pas de la prose
    if (!/[a-z]/.test(t)) continue;              // que des majuscules : un libelle technique
    if (/^[\w.:\-\/#]+$/.test(t)) continue;      // chemin, selecteur, cle
    if (/===|!==|\|\||&&|\breturn\b|\bfunction\b/.test(t)) continue;   // du code
    if (!PHRASE.test(t)) continue;               // ni majuscule ni ponctuation : un nom
    out.push({ texte: t, index: m.index, ou: 'script' });
  }
  return out;
};

/* Tout ce qu une page engendree affiche, les deux sources reunies. */
/* ══ LES DONNEES PAR DEFAUT, DECLAREES DANS LA FENETRE ══════════════════════
 * ⚠⚠⚠ IL MANQUAIT UNE FACON DE DIRE « CECI EST UNE DONNEE ». Le 2026-09-13, en
 * traduisant `pages`, cinq chaines ont resiste a tout classement :
 *   · « Foire aux questions » — le titre PAR DEFAUT de la page FAQ ;
 *   · « Nouveau guide », « Taille », « Mesure 1 (cm) », « Mesure 2 (cm) » — le
 *     nom et les en-tetes PAR DEFAUT d un guide des tailles.
 * Elles sont ECRITES dans la base et relues PAR LA CLIENTE sur la boutique. Les
 * traduire ecrirait de l anglais dans les donnees d une boutique francaise —
 * c est le cas 2 de `src/langue/index.js`, la faute la plus silencieuse du lot.
 *
 * ⚠⚠ ET AUCUN DES TROIS OUTILS NE POUVAIT LE SAVOIR. `banc-langue-donnees`
 * reconnait `value="…"` et l argument direct d une operation d ecriture ; il
 * NOMME lui-meme son angle mort : « une chaine qui passe par une variable avant
 * d etre ecrite ». Le compteur, lui, les reclamait — donc `pages` ne pouvait pas
 * atteindre zero, et un compteur qui ne peut pas atteindre zero se lit vite
 * comme « c est normal qu il en reste ».
 *
 * ⚠⚠ LE FAUX REMEDE, ET IL FAUT LE NOMMER : une entree qui rend le MEME texte
 * (« Taille » -> « Taille »). Elle ferait taire le compteur ET laisserait le
 * poseur envelopper une valeur de donnee — exactement la cle « code » -> « code »
 * retiree d `invmeta` le meme jour, qui s etait posee neuf fois sur du code sans
 * qu un seul banc bronche. Une entree dont la valeur egale la cle sur un chemin
 * d ecriture est un permis de se tromper plus tard.
 *
 * ➡ LA DECLARATION : un bloc `var SZ_DONNEES = { … };` dans le script de la
 * fenetre. Ce qu il contient n est ni traduit, ni compte, ni enveloppable :
 *   · ici — les textes disparaissent du compteur et du banc du residuel ;
 *   · `langue-poser` en fait une zone interdite ;
 *   · `banc-langue-donnees` REFUSE qu un de ces textes ait une entree.
 * ⚠ LE BLOC EST PLAT, sans accolade imbriquee — la borne `[^{}]*` le dit, et
 * c est ce qui rend la reconnaissance sure sans analyser du JavaScript. */
const RE_SZ_DONNEES = /var\s+SZ_DONNEES\s*=\s*\{[^{}]*\}\s*;/g;
const sansDonneesDeclarees = (s) => String(s)
  .replace(RE_SZ_DONNEES, (m) => m.replace(/[^\n]/g, ' '));

/* Les textes declares comme DONNEES dans une fenetre — pour les bancs qui
   doivent les refuser plutot que les ignorer. */
const donneesDeclarees = (s) => {
  const out = [];
  const re = new RegExp(RE_SZ_DONNEES.source, 'g');
  let b;
  while ((b = re.exec(String(s)))) {
    const rs = /'([^'\\\n]*)'|"([^"\\\n]*)"/g;
    let m;
    while ((m = rs.exec(b[0]))) {
      const t = (m[1] !== undefined ? m[1] : m[2]).trim();
      if (t) out.push(t);
    }
  }
  return out;
};

const toutLeTexte = (page) => {
  const propre = sansDonneesDeclarees(page);
  const out = texteAffiche(propre);
  const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let bloc;
  while ((bloc = re.exec(propre))) {
    for (const c of chainesProse(sansCommentaires(bloc[1]))) out.push(c);
  }
  return out;
};

module.exports = { sansCommentaires, texteVisible, texteAffiche, chainesProse, toutLeTexte,
  sansDonneesDeclarees, donneesDeclarees, RE_SZ_DONNEES, PHRASE };
