'use strict';

/*
 * LES NOMS DE COULEUR — les deux langues
 * =============================================================================
 * ⚠⚠⚠ SA CAPTURE DU 2026-09-13 : un tableau dont l'en-tête disait
 * « SIZE / COLOUR » et dont les lignes disaient « XS / rouge », « XS / vert ».
 *
 * ⚠⚠ CE QUI EST TRADUIT ET CE QUI NE L'EST JAMAIS, et c'est toute la difficulté
 * de ce fichier. Le nom de couleur est à la fois :
 *   · une DONNÉE — il est écrit sur la variante du produit, il sert de clé de
 *     stock (« XS-rouge »), il repart au site et il est relu par la boutique ;
 *   · un TEXTE — il se lit dans un tableau, dans un jeton, dans un filtre.
 * Traduire la donnée casserait le stock : « XS-rouge » et « XS-red » seraient
 * deux variantes différentes, et l'inventaire se scinderait en silence.
 * ➡ LE SITE ENVOIE DONC LES DEUX : `nom` (la donnée, intacte) et `libelle`
 *   (ce qui s'affiche). Seul le second passe par ce fichier — c'est la règle
 *   `*Libelle` du pont, celle qui existe depuis les pastilles de statut.
 *
 * ⚠⚠ LA PALETTE EST FERMÉE, MAIS PAS LA LISTE. `_COLOR_MAP` (assets/js/shop.js)
 * en compte 247 ; à côté, `customColors` laisse ajouter une couleur à la main.
 * Une couleur ajoutée par la boutique N'EST PAS ICI et ne le sera jamais : elle
 * s'affiche telle qu'elle a été tapée, dans les deux langues. C'est le bon
 * comportement — c'est le mot de la boutique, pas notre libellé.
 *
 * ⚠ QUAND LE FRANÇAIS EST RESTÉ, C'EST UN CHOIX. « écru », « taupe »,
 * « chartreuse », « aqua » sont les mots de la mode EN ANGLAIS AUSSI. Les
 * remplacer par une périphrase rendrait la liste moins juste, pas plus
 * anglaise. Là où l'anglais a son mot, il l'a.
 *
 * ⚠ LES NOMS DE PIGMENT gardent leur forme consacrée (« Payne's grey »,
 * « Prussian blue », « Naples yellow ») : ce sont des noms de produits
 * historiques, pas des descriptions.
 */

const COULEURS_EN = {
  /* ── Neutres et bases ──────────────────────────────────────────────────── */
  'noir': 'black',
  'blanc': 'white',
  'blanc cassé': 'off-white',
  'blanc optique': 'optical white',
  'blanc lunaire': 'moon white',
  'ivoire': 'ivory',
  'écru': 'ecru',
  'crème': 'cream',
  'nude': 'nude',

  /* ── Gris ──────────────────────────────────────────────────────────────── */
  'gris': 'grey',
  'gris clair': 'light grey',
  'gris chiné': 'heather grey',
  'gris perle': 'pearl grey',
  'gris souris': 'mouse grey',
  'gris foncé': 'dark grey',
  'gris anthracite': 'charcoal grey',
  'gris acier': 'steel grey',
  'gris fer': 'iron grey',
  'gris de payne': 'Payne’s grey',
  'anthracite': 'charcoal',
  'acier': 'steel',
  'ardoise': 'slate',
  'fumée': 'smoke',
  'tourterelle': 'dove grey',

  /* ── Blancs et beiges ──────────────────────────────────────────────────── */
  'beige': 'beige',
  'sable': 'sand',
  'champagne': 'champagne',
  'vanille': 'vanilla',
  'lin': 'linen',
  'ficelle': 'twine',
  'camel': 'camel',
  'paille': 'straw',
  'chamois': 'chamois',
  'grège': 'greige',
  'mastic': 'putty',
  'beurre': 'butter',
  'bisque': 'bisque',
  'coquille d\'œuf': 'eggshell',
  'cuisse de nymphe': 'nymph’s thigh',
  'nacre': 'mother-of-pearl',

  /* ── Jaunes ────────────────────────────────────────────────────────────── */
  'jaune': 'yellow',
  'jaune pâle': 'pale yellow',
  'jaune moutarde': 'mustard yellow',
  'jaune canari': 'canary yellow',
  'jaune citron': 'lemon yellow',
  'jaune de cobalt': 'cobalt yellow',
  'jaune de mars': 'Mars yellow',
  'jaune de naples': 'Naples yellow',
  'jaune impérial': 'imperial yellow',
  'jaune mimosa': 'mimosa yellow',
  'bouton d\'or': 'buttercup',
  'nankin': 'nankeen',
  'soufre': 'sulphur',
  'blé': 'wheat',
  'maïs': 'corn',
  'topaze': 'topaz',
  'orpiment': 'orpiment',

  /* ── Oranges ───────────────────────────────────────────────────────────── */
  'orange': 'orange',
  'orange brûlé': 'burnt orange',
  'abricot': 'apricot',
  'mandarine': 'tangerine',
  'capucine': 'nasturtium',
  'carotte': 'carrot',
  'citrouille': 'pumpkin',
  'aurore': 'dawn',
  'isabelle': 'isabelline',

  /* ── Rouges ────────────────────────────────────────────────────────────── */
  'rouge': 'red',
  'rouge vif': 'bright red',
  'rouge bordeaux': 'burgundy red',
  'vermillon': 'vermilion',
  'vermeil': 'vermeil',
  'carmin': 'carmine',
  'cramoisi': 'crimson',
  'écarlate': 'scarlet',
  'cinabre': 'cinnabar',
  'rouge feu': 'fire red',
  'rouge tomate': 'tomato red',
  'ponceau': 'poppy red',
  'garance': 'madder',
  'groseille': 'redcurrant',
  'rouge cerise': 'cherry red',
  'rouge sang': 'blood red',
  'rouge cardinal': 'cardinal red',
  'rouge anglais': 'English red',
  'rouge indien': 'Indian red',
  'rouge de falun': 'Falun red',
  'rouge tomette': 'terracotta red',
  'rouge d\'andrinople': 'Turkey red',
  'sanguine': 'sanguine',
  'nacarat': 'nacarat',

  /* ── Roses ─────────────────────────────────────────────────────────────── */
  'rose': 'pink',
  'rose poudré': 'powder pink',
  'rose vif': 'bright pink',
  'rose nude': 'nude pink',
  'rose gold': 'rose gold',
  'rose bonbon': 'candy pink',
  'rose mountbatten': 'Mountbatten pink',
  'incarnat': 'carnation',
  'pelure d\'oignon': 'onion skin',

  /* ── Corail et saumon ──────────────────────────────────────────────────── */
  'corail': 'coral',
  'saumon': 'salmon',
  'pêche': 'peach',
  'terracotta': 'terracotta',

  /* ── Bruns et terres ───────────────────────────────────────────────────── */
  'marron': 'brown',
  'brun': 'brown',
  'chocolat': 'chocolate',
  'noisette': 'hazel',
  'moka': 'mocha',
  'cognac': 'cognac',
  'caramel': 'caramel',
  'cannelle': 'cinnamon',
  'fauve': 'tawny',
  'acajou': 'mahogany',
  'tabac': 'tobacco',
  'brou de noix': 'walnut stain',
  'cachou': 'catechu',
  'cacao': 'cocoa',
  'café': 'coffee',
  'bistre': 'bistre',
  'bitume': 'bitumen',
  'sépia': 'sepia',
  'taupe': 'taupe',
  'lavallière': 'lavallière brown',
  'poil de chameau': 'camel hair',

  /* ── Rouille et brique ─────────────────────────────────────────────────── */
  'rouille': 'rust',
  'brique': 'brick',
  'tomette': 'terracotta tile',
  'puce': 'puce',
  'chaudron': 'cauldron',
  'sang de bœuf': 'oxblood',

  /* ── Ocres et terres ───────────────────────────────────────────────────── */
  'ocre jaune': 'yellow ochre',
  'ocre rouge': 'red ochre',
  'terre d\'ombre': 'umber',
  'basané': 'swarthy brown',

  /* ── Bordeaux et vins ──────────────────────────────────────────────────── */
  'bordeaux': 'burgundy',
  'grenat': 'garnet',
  'lie de vin': 'wine lees',
  'prune': 'plum',
  'aubergine': 'aubergine',
  'rubis': 'ruby',
  'grenadine': 'grenadine',

  /* ── Roses foncés et framboise ─────────────────────────────────────────── */
  'framboise': 'raspberry',
  'fraise': 'strawberry',

  /* ── Mauves et violets ─────────────────────────────────────────────────── */
  'violet': 'purple',
  'mauve': 'mauve',
  'lavande': 'lavender',
  'lilas': 'lilac',
  'parme': 'parma violet',
  'améthyste': 'amethyst',
  'pourpre': 'purple',
  'zinzolin': 'zinzolin',
  'amarante': 'amaranth',
  'magenta': 'magenta',
  'fuchsia': 'fuchsia',
  'héliotrope': 'heliotrope',
  'orchidée': 'orchid',
  'glycine': 'wisteria',
  'pervenche': 'periwinkle',
  'jacinthe': 'hyacinth',
  'indigo teinture': 'dye indigo',
  'violet d\'évêque': 'bishop’s purple',

  /* ── Bleus ─────────────────────────────────────────────────────────────── */
  'bleu': 'blue',
  'bleu denim': 'denim blue',
  'bleu marine': 'navy blue',
  'marine': 'navy',
  'bleu ciel': 'sky blue',
  'bleu royal': 'royal blue',
  'bleu nuit': 'midnight blue',
  'bleu glacier': 'glacier blue',
  'bleu pétrole': 'petrol blue',
  'indigo': 'indigo',
  'cobalt': 'cobalt',
  'bleu acier': 'steel blue',
  'bleu bleuet': 'cornflower blue',
  'bleu canard': 'teal blue',
  'bleu charrette': 'cart blue',
  'bleu de cobalt': 'cobalt blue',
  'bleu de prusse': 'Prussian blue',
  'bleu électrique': 'electric blue',
  'bleu givré': 'frosted blue',
  'bleu outremer': 'ultramarine',
  'bleu paon': 'peacock blue',
  'bleu persan': 'Persian blue',
  'bleu roi': 'king’s blue',
  'bleu saphir': 'sapphire blue',
  'bleu turquin': 'turquin blue',
  'azur': 'azure',
  'safre': 'smalt blue',
  'smalt': 'smalt',
  'lapis-lazuli': 'lapis lazuli',
  'cœruleum': 'cerulean',

  /* ── Verts ─────────────────────────────────────────────────────────────── */
  'vert': 'green',
  'vert foncé': 'dark green',
  'émeraude': 'emerald',
  'sauge': 'sage',
  'vert kaki': 'khaki green',
  'olive': 'olive',
  'kaki': 'khaki',
  'pistache': 'pistachio',
  'anis': 'anise',
  'forêt': 'forest',
  'mousse': 'moss',
  'vert bouteille': 'bottle green',
  'vert céladon': 'celadon green',
  'vert d\'eau': 'water green',
  'vert-de-gris': 'verdigris',
  'vert de hooker': 'Hooker’s green',
  'vert de vessie': 'sap green',
  'vert épinard': 'spinach green',
  'vert impérial': 'imperial green',
  'vert lichen': 'lichen green',
  'vert oxyde de chrome': 'chrome oxide green',
  'vert perroquet': 'parrot green',
  'vert poireau': 'leek green',
  'vert pomme': 'apple green',
  'vert prairie': 'meadow green',
  'vert printemps': 'spring green',
  'vert sapin': 'fir green',
  'vert sauge': 'sage green',
  'vert tilleul': 'linden green',
  'vert véronèse': 'Veronese green',
  'avocat': 'avocado',
  'malachite': 'malachite',
  'jade': 'jade',
  'sinople': 'vert',
  'prasin': 'prasine',
  'viride': 'viridian',
  'glauque': 'glaucous',
  'lime': 'lime',
  'amande': 'almond',
  'chartreuse': 'chartreuse',

  /* ── Turquoises et cyans ───────────────────────────────────────────────── */
  'turquoise': 'turquoise',
  'cyan': 'cyan',
  'aqua': 'aqua',
  'menthe': 'mint',
  'aigue-marine': 'aquamarine',
  'sarcelle': 'teal',
  'bis': 'bis',

  /* ── Métaux et autres ──────────────────────────────────────────────────── */
  'or': 'gold',
  'doré': 'golden',
  'argent': 'silver',
  'argenté': 'silvery',
  'bronze': 'bronze',
  'cuivre': 'copper',
  'safran': 'saffron',
  'ambre': 'amber',
  'flave': 'flavescent'
};

module.exports = { COULEURS_EN };
