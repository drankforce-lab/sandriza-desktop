'use strict';

/*
 * LE COLLECTEUR DES SITES FOURNISSEURS (8.33.0, sa demande du 2026-11-17)
 * =============================================================================
 * « On choisit un site de nos fournisseurs ; selon le nom du produit, le module
 *   fait une recherche sur le site, récupère les informations et les photos, et
 *   prépare des fiches produit. »
 *
 * ⚠ POURQUOI ICI, DANS LE PROCESSUS PRINCIPAL, ET PAS DANS LE SITE NI AU SERVEUR.
 *   · Le site (la page) ne peut pas lire une page d'un autre domaine (CORS).
 *   · Le serveur (Render, en Oregon) se ferait refuser par les protections
 *     anti-robots de bien des boutiques, et chaque recherche passerait par lui.
 *   · L'application, elle, lit la page comme le ferait le navigateur du poste.
 *
 * ⚠ TROIS FAÇONS DE TROUVER, DE LA PLUS FIABLE À LA PLUS GÉNÉRALE :
 *   1. SHOPIFY : /search/suggest.json (recherche) et /products/<poignée>.js (la
 *      fiche complète : photos, variantes, tailles, couleurs, prix).
 *   2. WOOCOMMERCE : l'API publique « Store » (/wp-json/wc/store/v1/products).
 *   3. N'IMPORTE QUEL AUTRE SITE : la page de recherche (gabarit réglé dans la
 *      fiche du fournisseur, sinon les adresses usuelles), puis la page du
 *      produit, lue par ses données structurées (JSON-LD schema.org, OpenGraph)
 *      et, en dernier recours, par sa structure (titre, galerie, listes de tailles).
 *      Une page dessinée par JavaScript est RENDUE dans une fenêtre cachée,
 *      cloisonnée (voir rendre()).
 *
 * ⚠ LES ANALYSEURS SONT PURS (des chaînes en entrée, des objets en sortie) : le
 *   banc tools/banc-import-fournisseur.js les éprouve sur des pages d'essai, sans
 *   réseau. Electron n'est chargé qu'au moment de rendre ou de décoder une image.
 *
 * ⚠ SÉCURITÉ.
 *   · Une page de fournisseur est du contenu ÉTRANGER : rendue dans une session
 *     à part (« fournisseurs », jamais celle de l'administration), bac à sable,
 *     sans Node, sans aperçu, sans fenêtres surgissantes ni téléchargements, sans
 *     permission (caméra, notifications…). Rien de ce qu'elle contient n'est
 *     affiché tel quel : on en extrait du TEXTE, que les fenêtres échappent.
 *   · Aucune adresse locale ou privée (localhost, 10.x, 192.168.x…) n'est lue :
 *     une page piégée ne peut pas faire sonder le réseau de la boutique.
 *   · Les liens de produit doivent rester sur le site du fournisseur ; seules
 *     les images peuvent venir d'ailleurs (leurs CDN).
 *   · Aucun renseignement de la boutique ne part vers le fournisseur : on
 *     n'envoie que le nom cherché.
 */

const AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const MAX_HTML = 6 * 1024 * 1024;
const MAX_IMAGE = 15 * 1024 * 1024;
const MAX_IMAGES = 12;
const COTE_MAX = 1600;   // côté le plus long d'une photo rapportée (la boutique la réduit encore)

/* ══ OUTILS PURS ══════════════════════════════════════════════════════════ */

const ENTITES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', eacute: 'é', egrave: 'è', ecirc: 'ê',
  agrave: 'à', acirc: 'â', ccedil: 'ç', ocirc: 'ô', ucirc: 'û', ugrave: 'ù', icirc: 'î', iuml: 'ï', euml: 'ë',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…', ndash: '–', mdash: '—', laquo: '«', raquo: '»',
  deg: '°', reg: '®', trade: '™', copy: '©', times: '×', middot: '·', bull: '•', Eacute: 'É', Agrave: 'À' };
function decoder(s) {
  return String(s == null ? '' : s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return (n > 0 && n < 0x110000) ? String.fromCodePoint(n) : '';
    }
    return Object.prototype.hasOwnProperty.call(ENTITES, e) ? ENTITES[e] : m;
  });
}

/** Du HTML vers un texte lisible : paragraphes et puces gardés, balises et scripts retirés. */
function texteDeHtml(html, max) {
  let s = String(html || '');
  s = s.replace(/<(script|style|noscript|template|svg|iframe)[\s\S]*?<\/\1>/gi, ' ');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<li[^>]*>/gi, '\n• ');
  s = s.replace(/<\/(p|div|li|ul|ol|h[1-6]|tr|section|article|table)>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = decoder(s);
  s = s.replace(/[ \t\f\v ]+/g, ' ');
  const lignes = s.split('\n').map((l) => l.trim()).filter((l) => l && l !== '•');
  // Les lignes répétées (un texte rendu deux fois, version mobile et ordinateur) n'apparaissent qu'une fois.
  const vues = new Set(), out = [];
  lignes.forEach((l) => { const k = l.toLowerCase(); if (!vues.has(k)) { vues.add(k); out.push(l); } });
  const t = out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return max ? t.slice(0, max) : t;
}

function attributs(balise) {
  const a = {};
  String(balise || '').replace(/([\w:.-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>"']+))/g, (m, k, v, d, s2, n) => {
    a[k.toLowerCase()] = decoder(d != null ? d : (s2 != null ? s2 : n));
    return m;
  });
  return a;
}

/** Une adresse absolue, http(s), publique — sinon null. */
function urlSure(brut, base) {
  let u;
  try { u = new URL(String(brut || '').trim(), base || undefined); } catch (e) { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  if (u.username || u.password) return null;
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!h || h === 'localhost' || /\.(local|localhost|internal|lan|home)$/.test(h) || h.indexOf('.') < 0 && h.indexOf(':') < 0) return null;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    const p = h.split('.').map(Number);
    if (p[0] === 10 || p[0] === 127 || p[0] === 0 || (p[0] === 169 && p[1] === 254) || (p[0] === 192 && p[1] === 168)
      || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 100 && p[1] >= 64 && p[1] <= 127) || p[0] >= 224) return null;
  }
  if (h.indexOf(':') >= 0) return null;   // les adresses IPv6 littérales : aucun fournisseur n'en sert
  u.hash = '';
  return u;
}

/** Le domaine « de base » (boutique.exemple.com → exemple.com), pour garder les liens sur le site. */
function domaineDe(h) {
  const p = String(h || '').toLowerCase().replace(/^www\./, '').split('.');
  if (p.length <= 2) return p.join('.');
  // co.uk, com.au, qc.ca… : on garde trois morceaux quand l'avant-dernier est court.
  return (p[p.length - 2].length <= 3 && p[p.length - 1].length === 2) ? p.slice(-3).join('.') : p.slice(-2).join('.');
}
function memeSite(u, base) {
  try { return domaineDe(new URL(u).hostname) === domaineDe(new URL(base).hostname); } catch (e) { return false; }
}

/* ── LA RESSEMBLANCE ENTRE LE NOM CHERCHÉ ET UN RÉSULTAT ──────────────────── */
function normal(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim();
}
const MOTS_VIDES = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'en', 'et', 'a', 'au', 'pour', 'the', 'and', 'of', 'with', 'avec', 'un', 'une']);
function mots(s) { return normal(s).split(' ').filter((m) => m && !MOTS_VIDES.has(m)); }
/** 0 à 1 : la part des mots cherchés présents dans le résultat, tempérée par la longueur du résultat. */
function similarite(cherche, titre) {
  const a = mots(cherche), b = mots(titre);
  if (!a.length || !b.length) return 0;
  const sb = new Set(b);
  let communs = 0;
  a.forEach((m) => {
    if (sb.has(m)) communs += 1;
    else if (m.length >= 4 && b.some((x) => x.indexOf(m) === 0 || m.indexOf(x) === 0 && x.length >= 4)) communs += 0.7;
  });
  const rappel = communs / a.length;
  const precision = Math.min(1, communs / b.length);
  let s = 0.75 * rappel + 0.25 * precision;
  if (normal(titre).indexOf(normal(cherche)) >= 0) s = Math.max(s, 0.95);
  // une référence (sku) cherchée telle quelle et retrouvée : certitude
  if (/\d/.test(cherche) && normal(cherche).replace(/ /g, '').length >= 4 && normal(titre).replace(/ /g, '').indexOf(normal(cherche).replace(/ /g, '')) >= 0) s = 1;
  return Math.round(Math.min(1, s) * 100) / 100;
}

/* ── LES PHOTOS : une seule par image, dans sa plus grande version ──────────── */
function imageGrande(u) {
  let s = String(u || '');
  if (!s) return '';
  if (s.indexOf('//') === 0) s = 'https:' + s;
  // Shopify : …/photo_300x300.jpg?v=1 ou ?width=300 → la grande, bornée à COTE_MAX
  if (/cdn\.shopify\.com|\/cdn\/shop\//i.test(s)) {
    s = s.replace(/_(\d+x\d*|\d*x\d+|small|medium|large|grande|compact|thumb|pico|icon|master)(@2x)?(?=\.(jpe?g|png|webp|gif))/i, '');
    s = s.replace(/([?&])(width|height|crop)=[^&]*/gi, '$1').replace(/[?&]+$/, '').replace(/\?&/, '?');
    // format=jpg : sans lui le CDN sert du WebP, que l'application ne sait ni mesurer ni réduire (nativeImage)
    s = s.replace(/([?&])format=[^&]*/gi, '$1').replace(/[?&]+$/, '');
    s += (s.indexOf('?') >= 0 ? '&' : '?') + 'width=' + COTE_MAX + '&format=jpg';
  }
  // WordPress : photo-300x400.jpg → photo.jpg
  s = s.replace(/-\d{2,4}x\d{2,4}(?=\.(jpe?g|png|webp)(\?|$))/i, '');
  return s;
}
function cleImage(u) {
  return String(u || '').replace(/^https?:/, '').replace(/[?#].*$/, '')
    .replace(/_(\d+x\d*|\d*x\d+)(?=\.\w+$)/, '').replace(/-\d{2,4}x\d{2,4}(?=\.\w+$)/, '').toLowerCase();
}
function imagesUniques(liste, base) {
  const vues = new Set(), out = [];
  (liste || []).forEach((x) => {
    const src = typeof x === 'string' ? x : (x && (x.src || x.url || x.contentUrl || x['@id'])) || '';
    if (!src || /^data:/i.test(src)) return;
    const u = urlSure(imageGrande(src), base);
    if (!u) return;
    if (/\.(svg|gif)(\?|$)/i.test(u.pathname) || /(logo|icon|sprite|placeholder|spinner|loader|badge|flag|payment)/i.test(u.pathname)) return;
    const k = cleImage(u.href);
    if (vues.has(k)) return;
    vues.add(k); out.push(u.href);
  });
  return out.slice(0, MAX_IMAGES);
}

/* ── LES VARIANTES : quelles options sont des tailles, lesquelles des couleurs ── */
const RX_TAILLE = /^(taille|tailles|size|sizes|grandeur|pointure|talla|gr[oö]sse)s?$/i;
const RX_COULEUR = /^(couleur|couleurs|color|colour|colors|colours|coloris|teinte|farbe)s?$/i;
function nomOption(n) { return normal(n).replace(/\s+/g, ''); }
function estTaille(n) { return RX_TAILLE.test(nomOption(n)) || /taille|size|pointure/.test(normal(n)); }
function estCouleur(n) { return RX_COULEUR.test(nomOption(n)) || /couleur|colou?r|coloris/.test(normal(n)); }
function uniques(l) {
  const v = new Set(), o = [];
  (l || []).forEach((x) => { const s = String(x == null ? '' : x).trim(); const k = s.toLowerCase(); if (s && s.length <= 40 && !v.has(k)) { v.add(k); o.push(s); } });
  return o.slice(0, 40);
}

function prixNombre(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null;
  let s = String(v).replace(/[^\d.,-]/g, '');
  if (/,\d{2}$/.test(s) && s.indexOf('.') < 0) s = s.replace(',', '.');
  s = s.replace(/,(?=\d{3}\b)/g, '').replace(/,/g, '.');
  const n = parseFloat(s);
  return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

/* ══ ANALYSEURS DE PAGE ═══════════════════════════════════════════════════ */

/** Les blocs JSON-LD d'une page, à plat (les @graph dépliés). */
function jsonLd(html) {
  const out = [];
  const rx = /<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = rx.exec(String(html || '')))) {
    let t = m[1].trim().replace(/^<!\[CDATA\[|\]\]>$/g, '').replace(/^\s*<!--|-->\s*$/g, '');
    let o = null;
    try { o = JSON.parse(t); } catch (e) {
      try { o = JSON.parse(t.replace(/[\u0000-\u001f]+/g, ' ')); } catch (e2) { o = null; }
    }
    if (!o) continue;
    const pile = Array.isArray(o) ? o.slice() : [o];
    while (pile.length) {
      const x = pile.shift();
      if (!x || typeof x !== 'object') continue;
      if (Array.isArray(x)) { pile.push(...x); continue; }
      out.push(x);
      if (Array.isArray(x['@graph'])) pile.push(...x['@graph']);
      if (x.mainEntity && typeof x.mainEntity === 'object') pile.push(x.mainEntity);
    }
  }
  return out;
}
function aType(o, t) {
  const v = o && o['@type'];
  return Array.isArray(v) ? v.some((x) => String(x).toLowerCase() === t) : String(v || '').toLowerCase() === t;
}

function metas(html) {
  const m = {};
  String(html || '').replace(/<meta\b[^>]*>/gi, (b) => {
    const a = attributs(b);
    const k = (a.property || a.name || a.itemprop || '').toLowerCase();
    if (k && a.content != null && !(k in m)) m[k] = a.content;
    return b;
  });
  return m;
}

/** Une page de produit (HTML) → la fiche brute. `url` : l'adresse de la page (base des liens relatifs). */
function analyserProduitHtml(html, url) {
  const h = String(html || '');
  const blocs = jsonLd(h);
  const groupe = blocs.find((o) => aType(o, 'productgroup'));
  const prod = groupe || blocs.find((o) => aType(o, 'product'));
  const mt = metas(h);
  const f = { url: String(url || ''), plateforme: 'page', titre: '', description: '', marque: '', sku: '', prix: null, devise: '',
    images: [], tailles: [], couleurs: [], composition: '', source: [] };

  if (prod) {
    f.source.push('json-ld');
    f.titre = texteDeHtml(prod.name || '');
    f.description = texteDeHtml(prod.description || '', 4000);
    const br = prod.brand;
    f.marque = texteDeHtml(typeof br === 'string' ? br : (br && br.name) || '');
    f.sku = String(prod.sku || prod.mpn || prod.productGroupID || '').slice(0, 60);
    f.composition = texteDeHtml(prod.material || '', 200);
    let imgs = [].concat(prod.image || []);
    const variantes = [].concat(prod.hasVariant || []);
    const offres = [].concat(prod.offers || []);
    variantes.forEach((v) => {
      if (!v || typeof v !== 'object') return;
      imgs = imgs.concat(v.image || []);
      if (v.size) f.tailles.push(typeof v.size === 'object' ? v.size.name : v.size);
      if (v.color) f.couleurs.push(v.color);
      [].concat(v.offers || []).forEach((o) => offres.push(o));
      (v.additionalProperty || []).forEach((p) => {
        if (p && estTaille(p.name)) f.tailles.push(p.value);
        else if (p && estCouleur(p.name)) f.couleurs.push(p.value);
      });
    });
    if (prod.size) f.tailles = f.tailles.concat(prod.size);
    if (prod.color) f.couleurs = f.couleurs.concat(prod.color);
    f.images = imagesUniques(imgs, url);
    const o = offres.map((x) => (x && x['@type'] === 'AggregateOffer') ? Object.assign({}, x, { price: x.lowPrice || x.price }) : x)
      .find((x) => x && prixNombre(x.price != null ? x.price : (x.priceSpecification && x.priceSpecification.price)) != null);
    if (o) { f.prix = prixNombre(o.price != null ? o.price : o.priceSpecification.price); f.devise = String(o.priceCurrency || (o.priceSpecification && o.priceSpecification.priceCurrency) || ''); }
  }
  // OpenGraph et métadonnées : complètent ce qui manque.
  if (!f.titre) f.titre = texteDeHtml(mt['og:title'] || mt['twitter:title'] || '');
  if (!f.description) f.description = texteDeHtml(mt['og:description'] || mt.description || '', 4000);
  if (!f.marque) f.marque = texteDeHtml(mt['product:brand'] || mt['og:brand'] || '');
  if (f.prix == null) {
    f.prix = prixNombre(mt['product:price:amount'] || mt['og:price:amount'] || mt.price);
    if (f.prix != null) f.devise = mt['product:price:currency'] || mt['og:price:currency'] || f.devise;
  }
  if (mt['og:title']) f.source.push('opengraph');
  const ogImgs = [];
  String(h).replace(/<meta\b[^>]*>/gi, (b) => { const a = attributs(b); if (/^(og:image(:secure_url)?|twitter:image)$/i.test(a.property || a.name || '') && a.content) ogImgs.push(a.content); return b; });
  // Le titre de la page en dernier recours : le <h1>, sinon <title> sans le nom du site.
  if (!f.titre) {
    const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(h);
    f.titre = h1 ? texteDeHtml(h1[1]) : texteDeHtml(((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(h) || [])[1] || '').split(/\s[|–—-]\s/)[0]);
    if (f.titre) f.source.push('structure');
  }
  // Les photos : celles des données structurées d'abord, puis la galerie de la page.
  if (f.images.length < 2) {
    const gal = [];
    String(h).replace(/<img\b[^>]*>/gi, (b) => {
      const a = attributs(b);
      const cands = [a['data-zoom-image'], a['data-large_image'], a['data-zoom'], a['data-full'], a['data-src-large'], a['data-original'], a['data-src'], a.src];
      if (a.srcset || a['data-srcset']) {
        const plus = String(a.srcset || a['data-srcset']).split(',').map((x) => x.trim().split(/\s+/))
          .sort((x, y) => (parseInt(y[1], 10) || 0) - (parseInt(x[1], 10) || 0))[0];
        if (plus && plus[0]) cands.unshift(plus[0]);
      }
      const src = cands.find((x) => x && !/^data:/i.test(x));
      const cl = String((a.class || '') + ' ' + (a.alt || '') + ' ' + (a.id || '')).toLowerCase();
      const larg = parseInt(a.width, 10) || 0;
      if (src && (/(product|produit|gallery|galerie|zoom|main|primary|wp-post-image|featured|slide)/.test(cl) || /\/(products?|produits?|catalog|media\/catalog|uploads)\//i.test(src) || larg >= 400)) gal.push(src);
      return b;
    });
    f.images = imagesUniques(f.images.concat(ogImgs, gal), url);
  } else {
    f.images = imagesUniques(f.images.concat(ogImgs), url);
  }
  // Les tailles et couleurs d'une liste déroulante de variantes.
  String(h).replace(/<select\b([^>]*)>([\s\S]*?)<\/select>/gi, (m, at, corps) => {
    const a = attributs(at);
    const etiq = [a.name, a.id, a['aria-label'], a['data-option-name'], a['data-attribute_name']].filter(Boolean).join(' ');
    const valeurs = [];
    corps.replace(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi, (mm, oa, t) => {
      const v = texteDeHtml(t);
      if (v && !/^(choisir|choose|select|s[eé]lectionne|--|taille|size|couleur|colou?r)/i.test(v)) valeurs.push(v.replace(/\s*[-–(].*(epuis|sold|rupture|indispon).*$/i, '').trim());
      return mm;
    });
    if (estTaille(etiq)) f.tailles = f.tailles.concat(valeurs);
    else if (estCouleur(etiq)) f.couleurs = f.couleurs.concat(valeurs);
    return m;
  });
  f.tailles = uniques(f.tailles.map((x) => texteDeHtml(String(x))));
  f.couleurs = uniques(f.couleurs.map((x) => texteDeHtml(String(x))));
  f.titre = f.titre.slice(0, 160);
  f.marque = f.marque.slice(0, 60);
  return f;
}

/** La fiche d'un produit Shopify (/products/<poignée>.js) → la fiche brute. */
function shopifyVersFiche(p, url) {
  const f = { url: String(url || ''), plateforme: 'shopify', titre: '', description: '', marque: '', sku: '', prix: null, devise: '',
    images: [], tailles: [], couleurs: [], composition: '', source: ['shopify'] };
  if (!p || typeof p !== 'object') return f;
  f.titre = texteDeHtml(p.title || '').slice(0, 160);
  f.description = texteDeHtml(p.description || p.body_html || '', 4000);
  f.marque = texteDeHtml(p.vendor || '').slice(0, 60);
  const vars = Array.isArray(p.variants) ? p.variants : [];
  f.sku = String((vars.find((v) => v && v.sku) || {}).sku || '').slice(0, 60);
  // /products/x.js donne le prix en CENTS ; /products/x.json, en dollars (chaîne « 49.00 »).
  const v0 = vars.find((v) => v && v.price != null);
  if (v0) f.prix = typeof v0.price === 'number' ? prixNombre(v0.price / 100) : prixNombre(v0.price);
  const opts = Array.isArray(p.options) ? p.options : [];
  opts.forEach((o, i) => {
    const nom = typeof o === 'string' ? o : (o && o.name) || '';
    let valeurs = (o && Array.isArray(o.values)) ? o.values : vars.map((v) => v && v['option' + (i + 1)]);
    valeurs = valeurs.map((x) => (x && typeof x === 'object') ? x.name || x.value : x);
    if (estTaille(nom)) f.tailles = f.tailles.concat(valeurs);
    else if (estCouleur(nom)) f.couleurs = f.couleurs.concat(valeurs);
  });
  f.tailles = uniques(f.tailles); f.couleurs = uniques(f.couleurs);
  const imgs = [].concat(p.images || [], (p.media || []).filter((m) => m && (m.media_type === 'image' || !m.media_type)).map((m) => m.src || (m.preview_image && m.preview_image.src)));
  if (p.featured_image) imgs.unshift(p.featured_image);
  f.images = imagesUniques(imgs, url);
  // La composition est souvent écrite dans les étiquettes (« matiere:coton ») — le site la lit aussi dans la description.
  return f;
}

/** Un produit de l'API « Store » de WooCommerce → la fiche brute. */
function wooVersFiche(p) {
  const f = { url: String((p && p.permalink) || ''), plateforme: 'woocommerce', titre: '', description: '', marque: '', sku: '', prix: null, devise: '',
    images: [], tailles: [], couleurs: [], composition: '', source: ['woocommerce'] };
  if (!p || typeof p !== 'object') return f;
  f.titre = texteDeHtml(p.name || '').slice(0, 160);
  f.description = texteDeHtml([p.short_description, p.description].filter(Boolean).join('\n'), 4000);
  f.sku = String(p.sku || '').slice(0, 60);
  const pr = p.prices || {};
  const unite = parseInt(pr.currency_minor_unit, 10);
  if (pr.price != null) f.prix = prixNombre((parseInt(pr.price, 10) || 0) / Math.pow(10, isFinite(unite) ? unite : 2));
  f.devise = String(pr.currency_code || '');
  (p.attributes || []).forEach((a) => {
    const vals = (a.terms || []).map((t) => t && t.name);
    if (estTaille(a.name || a.taxonomy || '')) f.tailles = f.tailles.concat(vals);
    else if (estCouleur(a.name || a.taxonomy || '')) f.couleurs = f.couleurs.concat(vals);
  });
  f.tailles = uniques(f.tailles.map((x) => texteDeHtml(x))); f.couleurs = uniques(f.couleurs.map((x) => texteDeHtml(x)));
  f.images = imagesUniques((p.images || []).map((i) => i && i.src), f.url);
  const marque = (p.brands || [])[0];
  if (marque) f.marque = texteDeHtml(marque.name || '').slice(0, 60);
  return f;
}

/* Les chemins qui ressemblent à une page de produit, toutes plateformes confondues. */
const RX_CHEMIN_PRODUIT = /\/(products?|produits?|product-page|p|item|items|article|articles|shop|boutique|catalogue|catalog|collections\/[^/]+\/products)\/[^/?#]{2,}|-p-\d+|\/\d+-[\w-]+\.html$|\/[\w-]+-\d{3,}\.html$|\.html$/i;
const RX_CHEMIN_EXCLU = /\/(cart|panier|account|compte|login|connexion|search|recherche|blog|blogs|pages?|policies|policy|contact|faq|collections\/?$|tag|categor(y|ie)s?\/?$|wishlist)(\/|\?|$)/i;

/** Les liens de produit d'une page de résultats. Rend [{ url, titre, image }], dans l'ordre de la page. */
function liensProduits(html, base) {
  const out = [], vus = new Set();
  const rx = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  const h = String(html || '').replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ');
  while ((m = rx.exec(h)) && out.length < 80) {
    const a = attributs(m[1]);
    const u = urlSure(a.href, base);
    if (!u || !memeSite(u.href, base)) continue;
    if (!RX_CHEMIN_PRODUIT.test(u.pathname) || RX_CHEMIN_EXCLU.test(u.pathname)) continue;
    u.search = u.search.replace(/[?&](variant|_pos|_sid|_ss|srsltid|utm_[a-z]+)=[^&]*/g, '');
    if (u.search === '?') u.search = '';
    const k = u.origin + u.pathname.replace(/\/$/, '');
    const img = /<img\b[^>]*>/i.exec(m[2]);
    const ia = img ? attributs(img[0]) : {};
    let titre = texteDeHtml(m[2]).replace(/\n+/g, ' ').trim() || a.title || a['aria-label'] || ia.alt || '';
    // Le prix collé au titre dans une vignette (« Robe Mila 49,99 $ ») : retiré.
    titre = titre.replace(/\s+/g, ' ').replace(/\s*(?:(?:CA|US|C)?\s?\$\s?\d[\d\s.,]*|\d[\d\s.,]*\s?\$)(?:\s*(?:CAD|USD))?\s*$/i, '').slice(0, 160);
    const image = ia['data-src'] || ia.src || (ia.srcset ? String(ia.srcset).split(',').pop().trim().split(/\s+/)[0] : '');
    if (vus.has(k)) {
      // le même produit lié deux fois (photo puis titre) : on complète ce qui manquait
      const d = out.find((x) => x.cle === k);
      if (d && !d.titre && titre) d.titre = titre;
      if (d && !d.image && image) d.image = image;
      continue;
    }
    vus.add(k);
    out.push({ cle: k, url: u.href, titre, image });
  }
  // un titre vide se déduit de l'adresse (…/products/robe-mila-fleurie → « robe mila fleurie »)
  return out.map((x) => ({ url: x.url, titre: x.titre || decodeURIComponent(x.url.split('?')[0].replace(/\/$/, '').split('/').pop()).replace(/\.html$/, '').replace(/[-_]+/g, ' '),
    image: (x.image && !/^data:/i.test(x.image)) ? ((urlSure(imageGrande(x.image), base) || {}).href || '') : '' }));
}

/** L'adresse de recherche d'un gabarit réglé (« https://…/recherche?q={q} »). */
function adresseRecherche(gabarit, nom) {
  const g = String(gabarit || '').trim();
  if (!g) return '';
  const q = encodeURIComponent(String(nom || '').trim());
  return g.indexOf('{q}') >= 0 ? g.split('{q}').join(q) : (g + (g.indexOf('?') >= 0 ? '&' : '?') + 'q=' + q);
}

/* ══ RÉSEAU (processus principal) ═════════════════════════════════════════ */

const _platformes = new Map();     // origine → 'shopify' | 'woocommerce' | 'page'
const _gabarits = new Map();       // origine → le gabarit de recherche qui a donné des résultats
const _derniers = new Map();       // hôte → instant de la dernière requête (politesse)

async function attendreTour(hote) {
  const t = _derniers.get(hote) || 0, now = Date.now();
  const d = Math.max(0, t + 350 - now);
  _derniers.set(hote, now + d);
  if (d) await new Promise((r) => setTimeout(r, d));
}

async function lire(url, opts) {
  const o = opts || {};
  const u = urlSure(url);
  if (!u) throw Object.assign(new Error('adresse refusée'), { motif: 'adresse' });
  await attendreTour(u.hostname);
  const r = await fetch(u.href, {
    redirect: 'follow',
    signal: AbortSignal.timeout(o.delai || 15000),
    headers: Object.assign({ 'User-Agent': AGENT, 'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.7',
      Accept: o.json ? 'application/json,text/javascript;q=0.9,*/*;q=0.5' : 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8' }, o.entetes || {}),
  });
  // Une redirection vers une adresse privée : refusée après coup (fetch suit les redirections).
  if (!urlSure(r.url || u.href)) throw Object.assign(new Error('redirection refusée'), { motif: 'adresse' });
  const longueur = parseInt(r.headers.get('content-length'), 10) || 0;
  if (longueur > MAX_HTML) throw Object.assign(new Error('page trop lourde'), { motif: 'trop_lourd' });
  const texte = await r.text();
  return { ok: r.ok, statut: r.status, url: r.url || u.href, type: String(r.headers.get('content-type') || ''), texte: texte.slice(0, MAX_HTML) };
}
async function lireJson(url) {
  try {
    const r = await lire(url, { json: true, delai: 12000 });
    if (!r.ok || !/json|javascript/i.test(r.type) && !/^\s*[[{]/.test(r.texte)) return null;
    return JSON.parse(r.texte);
  } catch (e) { return null; }
}

/* LA FENÊTRE CACHÉE, pour une page dessinée par JavaScript. Une à la fois (_file). */
let _file = Promise.resolve();
let _sessionPrete = false;
function rendre(url, attenteMs) {
  const tache = _file.then(() => _rendre(url, attenteMs));
  _file = tache.catch(() => {});
  return tache;
}
async function _rendre(url, attenteMs) {
  const u = urlSure(url);
  if (!u) return null;
  const { BrowserWindow, session } = require('electron');
  const ses = session.fromPartition('fournisseurs');   // ⚠ PAS « persist: » : rien n'en reste à la fermeture
  if (!_sessionPrete) {
    _sessionPrete = true;
    ses.setPermissionRequestHandler((wc, perm, cb) => cb(false));
    try { ses.setPermissionCheckHandler(() => false); } catch (e) {}
    ses.on('will-download', (ev, item) => { try { item.cancel(); } catch (e) {} ev.preventDefault(); });
    ses.setUserAgent(AGENT, 'fr-CA,fr;q=0.9,en;q=0.7');
    // Rien d'une adresse privée, même demandé par la page (image, script, iframe).
    ses.webRequest.onBeforeRequest((det, cb) => {
      if (/^(data|blob|about):/i.test(det.url)) return cb({});
      cb({ cancel: !urlSure(det.url) || /\.(mp4|webm|mov|m3u8|woff2?|ttf)(\?|$)/i.test(det.url) });
    });
  }
  const w = new BrowserWindow({
    show: false, width: 1280, height: 900, skipTaskbar: true, focusable: false,
    webPreferences: { session: ses, sandbox: true, contextIsolation: true, nodeIntegration: false, nodeIntegrationInSubFrames: false,
      webviewTag: false, images: false, spellcheck: false, backgroundThrottling: false, autoplayPolicy: 'user-gesture-required', javascript: true },
  });
  try {
    w.webContents.setAudioMuted(true);
    w.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    w.webContents.on('will-navigate', (ev, dest) => { if (!urlSure(dest)) ev.preventDefault(); });
    const charge = w.loadURL(u.href, { userAgent: AGENT }).catch(() => {});
    await Promise.race([charge, new Promise((r) => setTimeout(r, 25000))]);
    await new Promise((r) => setTimeout(r, attenteMs || 2200));
    // Un défilement réveille les listes et galeries « paresseuses ».
    await w.webContents.executeJavaScript('window.scrollTo(0, document.body ? document.body.scrollHeight / 2 : 0); 1', true).catch(() => 0);
    await new Promise((r) => setTimeout(r, 900));
    const html = await Promise.race([
      w.webContents.executeJavaScript('document.documentElement ? document.documentElement.outerHTML : ""', true),
      new Promise((r) => setTimeout(() => r(''), 8000)),
    ]).catch(() => '');
    return { html: String(html || '').slice(0, MAX_HTML), url: w.webContents.getURL() || u.href };
  } finally {
    try { w.destroy(); } catch (e) {}
  }
}

/* ══ CHERCHER ═════════════════════════════════════════════════════════════ */

function origineDe(site) {
  const u = urlSure(/^https?:\/\//i.test(String(site || '')) ? site : 'https://' + String(site || '').trim());
  return u ? u.origin : '';
}

async function chercherShopify(origine, nom) {
  const j = await lireJson(origine + '/search/suggest.json?q=' + encodeURIComponent(nom) + '&resources[type]=product&resources[limit]=10&resources[options][unavailable_products]=last');
  const prods = j && j.resources && j.resources.results && j.resources.results.products;
  if (!Array.isArray(prods)) return null;
  return prods.map((p) => {
    const u = urlSure(p.url, origine);
    return { url: u ? u.href.replace(/\?.*$/, '') : '', titre: texteDeHtml(p.title || ''), image: imageGrande(p.image || (p.featured_image && p.featured_image.url) || ''),
      prix: prixNombre(p.price), marque: texteDeHtml(p.vendor || '') };
  }).filter((x) => x.url && memeSite(x.url, origine));
}
async function chercherWoo(origine, nom) {
  const j = await lireJson(origine + '/wp-json/wc/store/v1/products?search=' + encodeURIComponent(nom) + '&per_page=10');
  if (!Array.isArray(j)) return null;
  return j.map((p) => {
    const f = wooVersFiche(p);
    return { url: f.url, titre: f.titre, image: f.images[0] || '', prix: f.prix, marque: f.marque, _woo: p };
  }).filter((x) => x.url && urlSure(x.url) && memeSite(x.url, origine));
}
const GABARITS_USUELS = ['/search?q={q}&type=product', '/search?q={q}', '/recherche?q={q}', '/?s={q}&post_type=product',
  '/catalogsearch/result/?q={q}', '/recherche?controller=search&s={q}', '/search?search_query={q}', '/fr/search?q={q}'];

async function chercherPage(origine, nom, gabarit) {
  const gabs = gabarit ? [gabarit] : GABARITS_USUELS.map((g) => origine + g);
  // Le gabarit qui a marché la dernière fois pour ce site passe en premier (une recherche de 20 noms n'essaie pas 8 adresses 20 fois).
  const connu = _gabarits.get(origine);
  if (connu && !gabarit) gabs.sort((a, b) => (b === connu) - (a === connu));
  let rendus = 0;
  for (const g of gabs) {
    const adr = adresseRecherche(g, nom);
    if (!urlSure(adr)) continue;
    let liens = [];
    let r = null;
    try { r = await lire(adr); } catch (e) { r = null; }
    if (r && r.ok) liens = liensProduits(r.texte, r.url);
    /* Rien dans la page reçue : elle est peut-être dessinée par JavaScript, ou le site refuse les lectures directes
       (401/403/429/503, une protection anti-robots) — on la REND dans la fenêtre cachée, comme un navigateur.
       ⚠ Trois rendus au plus par recherche : chacun coûte quelques secondes. Une page introuvable (404) ne se rend pas. */
    const bloque = r && [401, 403, 429, 503].indexOf(r.statut) >= 0;
    if (!liens.length && rendus < 3 && (gabarit || (r && r.ok) || bloque || !r)) {
      rendus++;
      const rendu = await rendre(adr).catch(() => null);
      if (rendu && rendu.html) liens = liensProduits(rendu.html, rendu.url);
    }
    if (liens.length) { _gabarits.set(origine, g); return { liens, gabarit: g }; }
  }
  return { liens: [], gabarit: '' };
}

/**
 * Chercher un produit par son nom sur le site d'un fournisseur.
 * `o` : { site, recherche (gabarit facultatif, avec {q}), nom, plateforme (indice, facultatif) }.
 * Rend { ok, plateforme, candidats: [{ url, titre, image, prix, score }] } — le meilleur d'abord.
 */
async function chercher(o) {
  const d = o || {};
  const nom = String(d.nom || '').trim().slice(0, 120);
  if (nom.length < 2) return { ok: false, motif: 'nom_requis' };
  const origine = origineDe(d.site);
  if (!origine) return { ok: false, motif: 'site_invalide' };
  const gab = String(d.recherche || '').trim();
  if (gab && !urlSure(adresseRecherche(gab, 'x'))) return { ok: false, motif: 'recherche_invalide' };
  let plate = _platformes.get(origine) || '';
  let cands = null;
  try {
    if (!gab && (!plate || plate === 'shopify')) { cands = await chercherShopify(origine, nom); if (cands) plate = 'shopify'; }
    if (!cands && !gab && (!plate || plate === 'woocommerce')) { cands = await chercherWoo(origine, nom); if (cands) plate = 'woocommerce'; }
    if (!cands) { const r = await chercherPage(origine, nom, gab); cands = r.liens; plate = 'page'; }
  } catch (e) {
    return { ok: false, motif: 'site_injoignable', detail: String((e && e.message) || e).slice(0, 200) };
  }
  _platformes.set(origine, plate);
  const liste = (cands || []).map((c) => Object.assign({}, c, { score: similarite(nom, c.titre) }))
    .sort((a, b) => b.score - a.score).slice(0, 8);
  // L'API Woo donne déjà la fiche entière : on la garde pour l'extraction (aucune seconde requête).
  liste.forEach((c) => { if (c._woo) { c.brut = wooVersFiche(c._woo); delete c._woo; } });
  return { ok: true, plateforme: plate, origine, candidats: liste };
}

/* ══ EXTRAIRE ═════════════════════════════════════════════════════════════ */

/** La fiche brute d'une page de produit du fournisseur. `site` : l'adresse du fournisseur (les liens doivent y rester). */
async function extraire(o) {
  const d = o || {};
  const u = urlSure(d.url);
  if (!u) return { ok: false, motif: 'adresse' };
  if (d.site && !memeSite(u.href, origineDe(d.site))) return { ok: false, motif: 'hors_site' };
  const origine = u.origin;
  try {
    // Shopify : la fiche complète en JSON (cents) — la meilleure source.
    const m = /\/products\/([^/?#]+)/.exec(u.pathname);
    if (m && _platformes.get(origineDe(d.site) || origine) !== 'woocommerce') {
      const j = await lireJson(origine + u.pathname.replace(/\/$/, '').replace(/\.(js|json)$/, '') + '.js');
      if (j && j.title && Array.isArray(j.variants)) {
        const f = shopifyVersFiche(j, u.href);
        // La page complète la matière (souvent dans un onglet « Composition » hors description).
        if (!/\d{1,3}\s?%/.test(f.description)) {
          try {
            const r = await lire(u.href);
            if (r.ok) { const p = analyserProduitHtml(r.texte, r.url); if (p.composition) f.composition = p.composition; f.extrait = composition(texteDeHtml(r.texte)); }
          } catch (e) {}
        }
        return { ok: true, fiche: f };
      }
    }
    let r = await lire(u.href);
    let f = r.ok ? analyserProduitHtml(r.texte, r.url) : null;
    // Une page qui ne dit presque rien (dessinée par JavaScript) : on la rend.
    if (!f || !f.titre || !f.images.length) {
      const rendu = await rendre(u.href).catch(() => null);
      if (rendu && rendu.html) {
        const f2 = analyserProduitHtml(rendu.html, rendu.url);
        if (!f || (f2.titre && f2.images.length >= f.images.length)) f = f2;
        f.source.push('rendu');
        if (!f.extrait) f.extrait = composition(texteDeHtml(rendu.html));
      }
    } else if (!/\d{1,3}\s?%/.test(f.description)) f.extrait = composition(texteDeHtml(r.texte));
    if (!f || !f.titre) return { ok: false, motif: 'page_illisible', statut: r && r.statut };
    return { ok: true, fiche: f };
  } catch (e) {
    return { ok: false, motif: (e && e.motif) || 'site_injoignable', detail: String((e && e.message) || e).slice(0, 200) };
  }
}

/** Une ligne de composition dans un texte (« 95 % coton, 5 % élasthanne »), ou ''. */
function composition(texte) {
  const t = String(texte || '');
  const rx = /(\d{1,3}(?:[.,]\d+)?\s?%\s?[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’ -]{1,24}?)(?:\s*(?:,|\/|;|\+|et|and|&)\s*\d{1,3}(?:[.,]\d+)?\s?%\s?[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’ -]{1,24}?)*(?=[.\n,;)]|$)/g;
  let m, meilleur = '';
  while ((m = rx.exec(t))) {
    const s = m[0].trim();
    const total = (s.match(/\d{1,3}(?:[.,]\d+)?(?=\s?%)/g) || []).reduce((n, x) => n + parseFloat(x.replace(',', '.')), 0);
    if (total >= 95 && total <= 101 && s.length > meilleur.length) meilleur = s;
  }
  return meilleur.slice(0, 200);
}

/* ══ LES PHOTOS ═══════════════════════════════════════════════════════════ */

/** Télécharge des photos : [{ url, ok, data, largeur, hauteur, octets, motif }]. ≤ 12, une à la fois. */
async function telechargerImages(urls) {
  const liste = (Array.isArray(urls) ? urls : []).slice(0, MAX_IMAGES);
  const out = [];
  for (const brut of liste) {
    const u = urlSure(brut);
    if (!u) { out.push({ url: String(brut || ''), ok: false, motif: 'adresse' }); continue; }
    try {
      await attendreTour(u.hostname);
      // On demande du JPEG ou du PNG SEULEMENT : dès que « webp » figure dans Accept, même à q=0.5, le CDN de Shopify sert du WebP (mesuré).
      const r = await fetch(u.href, { redirect: 'follow', signal: AbortSignal.timeout(20000),
        headers: { 'User-Agent': AGENT, Accept: 'image/jpeg,image/png;q=0.9' } });
      if (!urlSure(r.url || u.href)) { out.push({ url: u.href, ok: false, motif: 'adresse' }); continue; }
      const type = String(r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (!r.ok || !/^image\/(jpeg|jpg|png|webp|avif|gif)$/.test(type)) { out.push({ url: u.href, ok: false, motif: r.ok ? 'pas_une_image' : 'http_' + r.status }); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > MAX_IMAGE) { out.push({ url: u.href, ok: false, motif: 'trop_lourde' }); continue; }
      out.push(Object.assign({ url: u.href }, preparerImage(buf, type)));
    } catch (e) {
      out.push({ url: u.href, ok: false, motif: 'injoignable' });
    }
  }
  return out;
}

/** Réduit à COTE_MAX et réencode en JPEG (PNG si transparente). Une image que Chromium seul sait lire passe telle quelle. */
function preparerImage(buf, type) {
  let img = null;
  try { img = require('electron').nativeImage.createFromBuffer(buf); } catch (e) { img = null; }
  if (!img || img.isEmpty()) {
    if (buf.length > 8 * 1024 * 1024) return { ok: false, motif: 'trop_lourde' };
    return { ok: true, data: 'data:' + type + ';base64,' + buf.toString('base64'), octets: buf.length, largeur: 0, hauteur: 0 };
  }
  let { width: l, height: h } = img.getSize();
  if (l < 200 || h < 200) return { ok: false, motif: 'trop_petite', largeur: l, hauteur: h };
  if (Math.max(l, h) > COTE_MAX) {
    const k = COTE_MAX / Math.max(l, h);
    img = img.resize({ width: Math.round(l * k), height: Math.round(h * k), quality: 'best' });
    ({ width: l, height: h } = img.getSize());
  }
  const png = type === 'image/png' && buf.length < 2.5 * 1024 * 1024;
  const sortie = png ? img.toPNG() : img.toJPEG(90);
  return { ok: true, data: 'data:image/' + (png ? 'png' : 'jpeg') + ';base64,' + sortie.toString('base64'), octets: sortie.length, largeur: l, hauteur: h };
}

/** Vérifier un site (le bouton « Vérifier » de la fiche fournisseur) : joignable ? quelle plateforme ? */
async function detecter(o) {
  const origine = origineDe((o || {}).site);
  if (!origine) return { ok: false, motif: 'site_invalide' };
  try {
    const s = await lireJson(origine + '/search/suggest.json?q=a&resources[type]=product&resources[limit]=1');
    if (s && s.resources) { _platformes.set(origine, 'shopify'); return { ok: true, plateforme: 'shopify', origine }; }
    const w = await lireJson(origine + '/wp-json/wc/store/v1/products?per_page=1');
    if (Array.isArray(w)) { _platformes.set(origine, 'woocommerce'); return { ok: true, plateforme: 'woocommerce', origine }; }
    const r = await lire(origine + '/');
    /* 401/403/429 : le site refuse les lectures directes (protection anti-robots). La recherche passera par la
       fenêtre cachée, qui lit la page comme un navigateur — plus lente, mais c'est la seule porte. */
    if (r.statut === 401 || r.statut === 403 || r.statut === 429 || r.statut === 503) { _platformes.set(origine, 'page'); return { ok: true, plateforme: 'page', origine, protege: true }; }
    if (!r.ok) return { ok: false, motif: 'site_injoignable', statut: r.statut };
    _platformes.delete(origine);
    return { ok: true, plateforme: 'page', origine };
  } catch (e) {
    return { ok: false, motif: 'site_injoignable', detail: String((e && e.message) || e).slice(0, 200) };
  }
}

module.exports = {
  chercher, extraire, telechargerImages, detecter, rendre,
  // Les pièces pures, pour le banc.
  _purs: { texteDeHtml, decoder, attributs, urlSure, memeSite, domaineDe, similarite, imageGrande, imagesUniques, jsonLd,
    analyserProduitHtml, shopifyVersFiche, wooVersFiche, liensProduits, adresseRecherche, prixNombre, composition, origineDe },
};
