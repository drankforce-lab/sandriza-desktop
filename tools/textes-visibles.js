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
  /* ⚠⚠ ET IL POUVAIT AUSSI COMMENCER DANS UN ATTRIBUT. La source ecrit
     `value="'+esc(x)+'" placeholder="Bonjour !…"` : la chaine que le decoupeur
     ramene est `" placeholder="Bonjour !…"`, scaffolding compris. Ce texte-la
     n a evidemment aucune DECISION dans un dictionnaire — on accusait donc
     d etre reste francais un texte qu on avait DELIBEREMENT garde francais
     (l exemple du message d accueil du chat, lu par la cliente). ⚠ On coupe donc
     le `nom="` de tete : ce qui reste est la valeur de l attribut, et elle, se
     verifie.
     ⚠⚠ ET LA BORNE EST ETROITE, PARCE QU UNE BORNE LARGE A ACCUSE AUTRE CHOSE :
     coupee a n importe quel `="`, la regle transformait le selecteur
     `input[type="number"], #t-number` en `number"], #t-number` — un texte que
     plus rien ne reconnaissait comme du code, donc une faute inventee. On
     n agit donc que si le fragment COMMENCE par le guillemet qui ferme
     l attribut precedent, suivi d un nom d attribut : c est exactement la forme
     que produit la coupure, et elle seule. */
  const a = /^"\s*[A-Za-z-]+="/.exec(t);
  if (a) t = t.slice(a[0].length).replace(/"\s*$/, '');
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

/* ══ LE MOT SEUL — LE DISCRIMINATEUR QUI MANQUAIT ══════════════════════════
 * ⚠⚠⚠ SON SIGNALEMENT DU 2026-09-13, CAPTURE A L APPUI : « il manque plein de
 * traduction encore ». Sur l ecran ANGLAIS du Studio virtuel : « Ambiance »,
 * « Agrandissement », « PROFIL », « Explorateur ». Le compteur annoncait ZERO.
 *
 * LA CAUSE TIENT EN UNE LIGNE, ecrite ici : `if (!/\s/.test(t)) continue;` —
 * << un seul mot : pas de la prose >>. Elle ecarte TOUT texte visible d un seul
 * mot. Et le banc du residuel ne les rattrape pas non plus : sa signature est
 * l ACCENT, et aucun de ces quatre-la n en porte un.
 * ⚠ La question << qui LIT cette chaine ? >> etait notee comme << non faite a
 * dessein >>. Elle vient de couter 257 mots visibles sans traduction, dans 73
 * fenetres sur 99 — soit les trois quarts du parc.
 *
 * ⚠ POURQUOI LA LIGNE EXISTAIT, ET ELLE AVAIT SA RAISON. Un mot seul dans un
 * script est presque toujours un IDENTIFIANT : `'flex'`, `'click'`, `'div'`,
 * une cle, un nom de classe. Les prendre pour du texte, c est le banc qui crie
 * sur du code — la faute payee au premier jet de cette extraction (1596
 * accusations). On ne retire donc pas la borne : ON LA REMPLACE PAR UNE
 * QUESTION PLUS PRECISE — non pas << est-ce une phrase ? >> mais
 * << cette chaine est-elle AFFICHEE ? >>. Deux signatures, et deux seulement :
 *
 *   1. ELLE EST COLLEE A DU BALISAGE que le script ecrit lui-meme :
 *      `'>Agrandissement</div>'`, `'<span>Ambiance'`. Ce qui est entre deux
 *      chevrons est lu par quelqu un, par construction.
 *   2. ELLE EST LA VALEUR D UNE PROPRIETE DE LIBELLE : `t:`, `titre:`,
 *      `label:`, `libelle:`, `nom:`, `texte:`, `placeholder:`. C est la forme
 *      des tables d onglets et d etapes — `{ cle: 'ambiance', t: 'Ambiance' }`,
 *      celle-la meme qu il a vue a l ecran.
 *
 * ⚠ ET LA MAJUSCULE INITIALE EST EXIGEE. Un libelle commence par une majuscule ;
 * une cle technique, presque jamais (`'ambiance'` est la CLE, `'Ambiance'` est
 * le LIBELLE, et ils sont cote a cote sur la meme ligne). C est ce qui separe
 * les deux sans rien savoir du JavaScript.
 */
const CLES_LIBELLE = /\b(?:t|titre|title|label|libelle|nom|texte|legende|placeholder|aria)\s*:\s*$/;
const MOT_AFFICHE  = /^[A-ZÀ-ÖØ-Þ]/;

/* ══ LE FRAGMENT TOUT EN MINUSCULES — LE SECOND ANGLE MORT ═════════════════
 * ⚠⚠ MEME JOURNEE, MEME SIGNALEMENT. Sa capture du tableau de bord montrait
 * « 11 variantes to restock » : une phrase a MOITIE traduite. Le morceau
 * francais etait `' variante'`, colle a un nombre.
 *
 * LA CAUSE EST LE FILTRE `PHRASE`, quelques lignes plus haut : il exige une
 * MAJUSCULE ou une PONCTUATION pour reconnaitre une phrase. Or les morceaux
 * qu on colle a une donnee n ont ni l une ni l autre — ils commencent au milieu
 * d une phrase : `' en attente'`, `'aucun message en attente'`, `' jours'`,
 * `' · vous seriez en lecture seule'`. Ce dernier etait dans les QUATRE-VINGT-
 * DIX-HUIT fenetres.
 *
 * ⚠ ON NE PEUT PAS SE CONTENTER DE RETIRER `PHRASE` : une chaine en minuscules
 * est aussi bien un selecteur, une classe, une valeur d attribut. La borne est
 * donc un LEXIQUE — les MOTS-OUTILS du francais. Ils ne s ecrivent pas ainsi en
 * anglais, ils sont invariables, et une phrase francaise en contient presque
 * toujours un. C est la meme mecanique que `banc-langue-residuel`, qui a fait
 * ses preuves : reconnaitre une LANGUE, pas une forme.
 *
 * ⚠ PAS DE MOT-OUTIL, PAS D ACCUSATION. Un fragment francais qui n en contient
 * aucun passe encore — on le dit plutot que de le cacher. La couverture n est
 * pas totale ; elle est mesurable, et elle vaut 309 releves le premier jour.
 */
const MOTS_OUTILS_FR = new RegExp(
  '(^|[\\s\'’(«])(' + [
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'au', 'aux', 'et', 'ou',
    'en', 'est', 'sont', 'sur', 'dans', 'pour', 'par', 'avec', 'sans',
    'aucun', 'aucune', 'plus', 'moins', 'tous', 'toutes', 'ce', 'cette', 'ces',
    'son', 'sa', 'ses', 'leur', 'leurs', 'qui', 'que', 'dont', 'vers', 'chez',
    'depuis', 'deja', 'déjà', 'encore', 'toujours', 'jamais',
    'hier', 'aujourd', 'demain', 'jour', 'jours', 'mois', 'semaine',
    'heure', 'heures', 'minute', 'minutes', 'attente', 'seriez', 'seule',
    'lecture', 'file', 'variante', 'variantes', 'restent', 'reste',
  ].join('|') + ')([\\s\'’),.·…:;!?]|$)', 'i');

/* Les chaines du script qui ressemblent a de la prose. */
const chainesProse = (js) => {
  const out = [];
  const re = /'([^'\\\n]*)'|"([^"\\\n]*)"/g;
  let m;
  while ((m = re.exec(js))) {
    const brut = m[1] !== undefined ? m[1] : m[2];
    const t = texteVisible(brut);
    if (t.length < 3) continue;
    if (!/\s/.test(t)) {
      /* UN SEUL MOT — il ne passe que s il porte une des deux signatures. */
      if (t.length < 3 || t.length > 30) continue;
      if (!MOT_AFFICHE.test(t)) continue;
      const colleAuBalisage = /[<>]/.test(brut);
      const valeurDeLibelle = CLES_LIBELLE.test(js.slice(Math.max(0, m.index - 40), m.index));
      if (!colleAuBalisage && !valeurDeLibelle) continue;
      out.push({ texte: t, index: m.index, ou: 'script' });
      continue;
    }
    if (t.length < 6) continue;
    if (!/[a-z]/.test(t)) continue;              // que des majuscules : un libelle technique
    if (/^[\w.:\-\/#]+$/.test(t)) continue;      // chemin, selecteur, cle
    if (/===|!==|\|\||&&|\breturn\b|\bfunction\b/.test(t)) continue;   // du code
    /* ⚠ UNE VALEUR CSS N EST PAS UNE PHRASE, meme si elle a des espaces et des
       virgules. Mesure du 2026-09-13, dans `apparence` : l ombre du theme choisi
       (<< 0 0 0 2px @,0 4px 12px rgba(0,0,0,.25) >>) etait comptee comme un
       texte a traduire. Une valeur d ombre ou de longueur commence par un
       NOMBRE — jamais une phrase, qui commence par un mot. */
    if (/^[-.\d]/.test(t) && /\b(?:px|rem|em|%|rgba?\(|hsla?\()/.test(t)) continue;
    /* ⚠ NI MAJUSCULE NI PONCTUATION : c est un nom… OU un fragment francais
       colle a une donnee. Le lexique des mots-outils tranche — voir sa fiche
       au-dessus de MOTS_OUTILS_FR. */
    if (!PHRASE.test(t) && !MOTS_OUTILS_FR.test(t)) continue;
    if (/[{};=<>]/.test(t)) continue;            // du balisage ou du code
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
