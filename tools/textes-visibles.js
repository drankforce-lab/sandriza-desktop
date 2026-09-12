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

const sansCommentaires = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
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
const toutLeTexte = (page) => {
  const out = texteAffiche(page);
  const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let bloc;
  while ((bloc = re.exec(page))) {
    for (const c of chainesProse(sansCommentaires(bloc[1]))) out.push(c);
  }
  return out;
};

module.exports = { sansCommentaires, texteVisible, texteAffiche, chainesProse, toutLeTexte, PHRASE };
