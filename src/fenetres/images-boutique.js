'use strict';

/*
 * LES IMAGES DE LA BOUTIQUE (2026-11-28, lot A)
 * =============================================================================
 * Sa demande : « comme l'ensemble de ces images risque de changer chaque année, une section où tout serait regroupé,
 * et en un clic une nouvelle génération de tout ce contenu ». Maquette approuvée :
 * https://claude.ai/artifact/3i1KqvCVaLs958rncTikpP
 * LOT A (ici) : l'inventaire de TOUTES les images du site, groupées comme la maquette, avec pour chacune « Remplacer… »
 * (un fichier du poste, déposé sur R2) et « Rétablir » (l'image d'origine). Le manifeste images_cfg est un réglage
 * PUBLIABLE : depuis l'application, il s'écrit dans la boutique préparée ; « Publication » l'envoie en ligne.
 * LOTS B et C (à venir) : l'assistant de collection annuelle — questions, aperçu, génération, test puis production.
 * ⚠ AUCUN CARACTÈRE accent grave dans la portion de script, COMMENTAIRES COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('images-boutique');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522);flex-wrap:wrap}
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.tete .cx-resume{color:var(--tx2);font-size:.8rem}
.seg{margin-left:auto;display:inline-flex;background:var(--v05);border:1px solid var(--v10);border-radius:10px;padding:3px}
.seg button{background:transparent;border:0;color:var(--tx2);font:600 .8rem system-ui;padding:.3rem .75rem;border-radius:7px;cursor:pointer}
.seg button.on{background:var(--v10);color:var(--tx)}
button{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:9px;padding:.3rem .65rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:var(--sz-btn-prim,var(--or));border-color:transparent;color:var(--sz-btn-prim-txt,#1a1208);font-weight:800}
button:focus-visible{outline:2px solid var(--or);outline-offset:2px}
#corps{flex:1 1 auto;min-height:0;overflow:auto;padding:1rem 1.2rem 1.4rem}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.8rem}
.msg.bon{color:var(--tx-ok)} .msg.err{color:var(--tx-err)} .msg.att{color:var(--tx-att)}
.im-resume{display:flex;align-items:center;flex-wrap:wrap;gap:0;padding-bottom:.8rem;margin-bottom:1rem;border-bottom:1px solid var(--v08)}
.im-resume .k{font-size:.8rem;color:var(--tx2)} .im-resume .k b{color:var(--tx);font-size:1rem;margin-right:.25rem;font-variant-numeric:tabular-nums}
.im-resume .k+.k::before{content:"";display:inline-block;width:3px;height:3px;border-radius:50%;background:var(--tx2);opacity:.6;margin:0 .75rem;vertical-align:middle}
.im-resume .esp{margin-left:auto;display:flex;gap:.5rem}
.im-g{margin-bottom:1.4rem}
.im-g h2{display:flex;align-items:baseline;gap:.6rem;margin:0 0 .6rem;font-size:.78rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--tx2)}
.im-g h2 span{font-weight:500;letter-spacing:0;text-transform:none;font-size:.78rem}
.im-grille{display:grid;gap:.65rem}
.im-grille.l{grid-template-columns:repeat(auto-fill,minmax(10rem,1fr))}
.im-grille.p{grid-template-columns:repeat(auto-fill,minmax(7rem,1fr))}
.im-v{position:relative;border-radius:10px;overflow:hidden;background:var(--v05);border:1px solid var(--v08)}
.im-v img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:var(--v05)}
.im-grille.p .im-v img{aspect-ratio:3/4}
.im-v .lb{display:flex;flex-direction:column;gap:.1rem;padding:.4rem .55rem .5rem}
.im-v .lb b{font-size:.78rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.im-v .lb span{font-size:.7rem;color:var(--tx2)}
.im-v .past{position:absolute;top:.4rem;left:.4rem;font-size:.62rem;font-weight:700;padding:.1rem .45rem;border-radius:99px;background:var(--f-page);color:var(--tx);box-shadow:0 1px 4px rgba(0,0,0,.25)}
.im-v .past.neuve{color:var(--tx-att,var(--tx))}
.im-v .gest{display:flex;gap:.3rem;padding:0 .55rem .55rem}
.im-v .gest button{font-size:.72rem;padding:.2rem .5rem}
.im-v.occupe{opacity:.5;pointer-events:none}
.im-s{display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:.7rem}
.im-saison{background:var(--v05);border:1px solid var(--v08);border-radius:12px;padding:.6rem}
.im-saison .t{display:flex;justify-content:space-between;align-items:baseline;margin:0 .1rem .45rem}
.im-saison .t b{font-size:.9rem} .im-saison .t span{font-size:.7rem;color:var(--tx2)}
.im-saison .plans{display:grid;grid-template-columns:repeat(4,1fr);gap:.25rem}
.im-saison .plans img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:5px;display:block}
.im-note{font-size:.76rem;color:var(--tx2);margin:.4rem 0 0}
.im-bientot{max-width:40rem;margin:2rem auto;text-align:center;color:var(--tx2);display:flex;flex-direction:column;gap:.6rem;align-items:center}
.im-bientot b{color:var(--tx);font-size:1rem}

`;

/* L'INVENTAIRE : chaque image du site, par son chemin d'origine (la clé du manifeste images_cfg). */
const INVENTAIRE = {
  saisons: [['printemps', 'Printemps', 'printemps'], ['ete', 'Été', 'ete'], ['automne', 'Automne', 'automne2'], ['hiver', 'Hiver', 'hiver2']],
  categories: [['robes', 'Robes'], ['hauts', 'Hauts & Blouses'], ['pantalons', 'Pantalons & Jeans'], ['jupes', 'Jupes'], ['manteaux', 'Manteaux & Vestes'], ['chaussures', 'Chaussures'], ['accessoires', 'Accessoires']],
  pages: [['livraison', 'Livraison'], ['retours', 'Retours'], ['tailles', 'Guide des tailles'], ['faq', 'FAQ'], ['contact', 'Nous joindre'], ['compte', 'Mon compte'],
    ['cartes-cadeaux', 'Cartes-cadeaux'], ['parrainage', 'Parrainage'], ['politiques', 'Politiques'], ['boite', 'Boîte de style'], ['boite-decouverte', 'Boîte · Découverte'],
    ['boite-classique', 'Boîte · Classique'], ['boite-prestige', 'Boîte · Prestige'], ['anticipe', 'Accès anticipé'], ['ambassadrices', 'Ambassadrices'], ['seconde-main', 'Seconde main'], ['vip', 'Liste VIP']],
  apropos: [['hiver', 'Ouverture'], ['bureau', 'Notre histoire'], ['accessoires', 'Choisie avec soin'], ['soiree', 'Moment · soirée'], ['weekend', 'Moment · week-end']],
  vides: [['favoris-vide', 'Favoris vides'], ['introuvable', 'Page introuvable'], ['panier-vide', 'Panier vide']]
};

/* ══ L'ASSISTANT DE LA NOUVELLE COLLECTION (2026-11-28, lot B) ══════════════════════════════════════════════════════════
   Les questions de la maquette approuvée, la case d'ajustements, le coût, et l'APERÇU : six images Flux Pro Ultra
   VRAIMENT générées (imagesboutique:apercu, 0,06 $ chacune), chacune régénérable et ajustable. Les réponses et l'aperçu
   gardé restent sur ce poste (localStorage). La génération complète (lot C) est annoncée à l'étape 3.
   ⚠ AUCUN CARACTÈRE accent grave ici : ce texte est injecté dans le littéral de la page. */
const CSS_ASSISTANT = `
.as-etapes{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1rem}
.as-etapes button{display:flex;align-items:center;gap:.45rem;background:transparent;border:1px solid var(--v12,var(--v16));color:var(--tx2);font-weight:600;font-size:.8rem;padding:.35rem .75rem;border-radius:99px}
.as-etapes button .n{width:1.25rem;height:1.25rem;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--v08);font-size:.7rem}
.as-etapes button.on{border-color:var(--or);color:var(--tx)} .as-etapes button.on .n{background:var(--sz-accent,var(--or));color:var(--sz-btn-prim-txt)}
.as-grille{display:grid;grid-template-columns:minmax(0,1fr) 18rem;gap:1rem;align-items:start}
@media (max-width:900px){.as-grille{grid-template-columns:1fr}}
.as-q{background:var(--v04,var(--v05));border:1px solid var(--v08);border-radius:12px;padding:.8rem .95rem;margin-bottom:.7rem}
.as-q h3{margin:0 0 .15rem;font-size:.88rem} .as-q p{margin:0 0 .55rem;color:var(--tx2);font-size:.76rem}
.as-chips{display:flex;flex-wrap:wrap;gap:.35rem}
.as-chip{background:var(--v05);border:1px solid var(--v12,var(--v16));color:var(--tx2);font-weight:600;font-size:.78rem;padding:.3rem .7rem;border-radius:99px}
.as-chip.on{border-color:var(--or);color:var(--tx);background:var(--sz-accent-doux,var(--v08))}
.as-lieux{display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:.5rem}
.as-lieux label{display:flex;flex-direction:column;gap:.2rem;font-size:.74rem;color:var(--tx2)}
.as-q input[type=text],.as-q textarea,.as-carte input[type=text]{width:100%;background:var(--v05);border:1px solid var(--v12,var(--v16));border-radius:8px;color:var(--tx);font:inherit;font-size:.82rem;padding:.4rem .55rem}
.as-q textarea{min-height:4.5rem;resize:vertical}
.as-cote{background:var(--v04,var(--v05));border:1px solid var(--v08);border-radius:12px;padding:.85rem .95rem;position:sticky;top:0}
.as-cote h3{margin:0 0 .4rem;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2)}
.as-total{display:flex;align-items:baseline;gap:.35rem;white-space:nowrap} .as-total b{font-size:1.7rem;font-weight:800;font-variant-numeric:tabular-nums} .as-total span{font-size:.8rem;font-weight:700;color:var(--tx-or,var(--or))}
.as-l{list-style:none;margin:.5rem 0 0;padding:0} .as-l li{display:flex;justify-content:space-between;gap:.6rem;padding:.4rem 0;border-bottom:1px solid var(--v08);font-size:.78rem}
.as-l li:last-child{border-bottom:0} .as-l li b{white-space:nowrap;font-variant-numeric:tabular-nums}
.as-fin{font-size:.7rem;color:var(--tx2);margin:.5rem 0 0}
.as-pied{display:flex;justify-content:space-between;gap:.6rem;margin-top:.9rem;flex-wrap:wrap}
.as-apercus{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:.75rem}
.as-carte{background:var(--v04,var(--v05));border:1px solid var(--v08);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
.as-carte .ph{position:relative;aspect-ratio:16/10;background:var(--v05);display:flex;align-items:center;justify-content:center}
.as-carte .ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.as-carte .ph .rond{width:2rem;height:2rem;border-radius:50%;border:3px solid var(--v12,var(--v16));border-top-color:var(--or);animation:asr 1s linear infinite}
@keyframes asr{to{transform:rotate(360deg)}}
.as-carte .c{padding:.55rem .65rem;display:flex;flex-direction:column;gap:.35rem}
.as-carte .c b{font-size:.82rem} .as-carte .c span{font-size:.72rem;color:var(--tx2)}
.as-carte .gest{display:flex;gap:.3rem;flex-wrap:wrap} .as-carte .gest button{font-size:.72rem;padding:.2rem .5rem}
.as-carte.gardee{border-color:var(--or)}
.as-bandeau{padding:.6rem .85rem;border-radius:10px;font-size:.8rem;margin-bottom:.8rem;background:var(--sz-accent-doux,var(--v08));border:1px solid var(--v12,var(--v16));color:var(--tx)}
.as-h{margin:1.1rem 0 .5rem;font-size:.9rem} .as-h span{color:var(--tx2);font-weight:600;font-size:.76rem;margin-left:.3rem}
.as-barre{height:6px;border-radius:99px;background:var(--v08);overflow:hidden;margin:.5rem 0 .8rem} .as-barre i{display:block;height:100%;background:var(--sz-accent,var(--or));transition:width .4s}
.as-etat{display:flex;align-items:center;justify-content:space-between;gap:.8rem;flex-wrap:wrap}
.as-etat div{display:flex;flex-direction:column;gap:.1rem} .as-etat span{font-size:.78rem;color:var(--tx2)}
.as-temps{margin:0 0 .4rem;padding-left:1.2rem;display:flex;flex-direction:column;gap:.55rem;font-size:.84rem}
.as-temps li span{display:block;color:var(--tx2);font-size:.76rem;margin-top:.1rem}
.as-carte.echec{border-color:var(--tx-err,var(--v16))}
@media (prefers-reduced-motion:reduce){.as-carte .ph .rond{animation:none}.as-barre i{transition:none}}
`;



// Les libelles de l'inventaire, dans la langue de la fenetre (ils vivent dans le JSON envoye a la page).
function inventaireTraduit() {
  const tr = (l) => l.map((x) => x.map((v, i) => (i === 1 ? T(v) : v)));
  return { saisons: tr(INVENTAIRE.saisons), categories: tr(INVENTAIRE.categories), pages: tr(INVENTAIRE.pages), apropos: tr(INVENTAIRE.apropos), vides: tr(INVENTAIRE.vides) };
}

function pageImagesBoutique() {
  const INV_JSON = JSON.stringify(inventaireTraduit());
  return `${TETE()}
<title>${T("Images de la boutique — Administration Sandriza")}</title>
<style>${CSS}${CSS_ASSISTANT}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.image}</span><h1>${T("Images de la boutique")}</h1>
  <span class="cx-resume" id="sous"></span>
  <div class="seg" role="group" aria-label="${T("Vue")}"><button type="button" id="v-col" class="on">${T("Collection en ligne")}</button><button type="button" id="v-neuve">${T("Nouvelle collection")}</button></div></div>
<div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<input type="file" id="fichier" accept="image/webp,image/jpeg,image/png" hidden>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var INV = ${INV_JSON};
  var corps = document.getElementById('corps'), elSous = document.getElementById('sous');
  var D = null, VUE = 'col', CIBLE = '';
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  var MOTIFS = {
    session: '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit: '${T("Votre rôle ne permet pas de changer les images de la boutique.")}',
    indisponible: '${T("La fenêtre principale ne répond pas. Rechargez-la (Ctrl+R).")}',
    format: '${T("Choisissez une image WebP, JPEG ou PNG.")}',
    parametre: '${T("Cette image ne peut pas être remplacée ici.")}',
    echec: '${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m = r && r.motif; return (MOTIFS[m] || MOTIFS.echec) + (r && r.detail ? ' (' + r.detail + ')' : ''); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); } catch (e) { return Promise.resolve({ ok: false, motif: 'indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; }).catch(function(){ return { ok: false, motif: 'echec' }; });
  }
  function src(chemin){ var u = D && D.images && D.images[chemin]; return u || ((D && D.site) || '') + '/' + chemin; }
  var SZ_DONNEES = { sujHiver: 'A woman walks through this winter setting wearing a long tailored wool coat, a knit scarf and leather boots. She stands in the RIGHT third of the frame; the left half is calm, softly blurred negative space.',
    sujPrint: 'A woman strolls through this spring setting wearing a light camel trench coat over a silk blouse. She stands in the RIGHT third of the frame; the left half is calm, softly blurred negative space.',
    sujRobes: 'A woman wearing an elegant flowing dress; the dress is the hero of the image, crisp fabric texture.',
    sujLivr: 'Close-up of a woman hands with a gold ring opening a plain cream cardboard box at home, folded soft knitwear wrapped in white tissue paper inside, linen sofa in soft focus.',
    sujHist: 'A calm, elegant small fashion boutique atelier in soft morning light, racks of carefully chosen garments in soft focus, a marble counter with fresh flowers, no people.',
    sujFav: 'A small heart drawn in the condensation of a window, cream linen curtains, warm afternoon light, a folded cashmere sweater on a chair.',
    ambchic: 'chic and luminous',
    ambedito: 'high-fashion magazine editorial',
    ambchaleur: 'warm and natural',
    amburbain: 'urban and graphic',
    ambroman: 'romantic',
    palcreme: 'cream, camel and gold tones',
    palfroid: 'cool neutral greys and ivory',
    palvif: 'vivid seasonal colours',
    palnoir: 'black and white with a single touch of burgundy',
    age25: 'in her late twenties',
    age35: 'in her early forties',
    age50: 'in her fifties with silver hair',
    orig: 'Black|East Asian|South Asian|white|Latina|Middle Eastern',
    silh: 'slender|curvy|petite|tall',
    cadpied: 'full-length framing, the whole outfit visible',
    cadtrois: 'three-quarter framing',
    caddetail: 'close framing on fabric and details',
    decor: 'Setting:',
    qui: 'The woman is',
    avec: 'with a',
    fig: 'figure',
    maq: 'natural makeup.',
    style: 'Luxury fashion editorial photograph,',
    fin: 'soft natural light, photorealistic, natural skin texture.',
    raffine: 'refined',
    evTexte: 'no text, no lettering, no signage, no numbers',
    evLogos: 'no logos, no brand names, no watermark',
    evMains: 'bare hands indoors',
    notes: 'Owner notes:',
    femme: 'A woman wearing',
    droite: 'She stands in the RIGHT third of the frame; the left half is calm, softly blurred negative space.',
    gauche: 'She stands in the LEFT third of the frame; the right half is calm, softly blurred negative space.',
    large: 'Wide cinematic shot, natural candid moment, she is not looking at the camera.',
    video: 'Cinematic fashion film. Keep the woman, her face, her outfit and the setting EXACTLY as in the photo. She moves naturally and gracefully, a few slow steps and a gentle turn of the head, a light breeze in her hair and fabric, slow smooth camera dolly. No text, no logo.',
    vDroite: 'She stays in the right third of the frame.',
    vGauche: 'She stays in the left third of the frame.',
    o_printemps: 'a light camel trench coat over a silk blouse|a floral midi dress and ballet flats|a soft knit cardigan with wide linen trousers|a pastel tailored blazer and a pleated skirt',
    o_ete: 'a flowing linen dress and a straw hat|an elegant maxi sundress|a crisp white shirt and wide tailored shorts|a silk slip dress and leather sandals',
    o_automne: 'a camel wool coat over a turtleneck|a plaid midi skirt with a chunky knit sweater|a cropped leather jacket and straight jeans|a long knit cardigan and suede boots',
    o_hiver: 'a long tailored wool coat, a knit scarf and leather boots|a cashmere sweater and wool trousers under a cape|an elegant quilted coat with a faux fur collar|a belted wrap coat and leather gloves',
    c_robes_a: 'A woman wearing an elegant flowing midi dress; the dress is the hero of the image, crisp fabric texture.',
    c_robes_b: 'A woman walking in a refined satin dress, soft movement of the fabric.',
    c_hauts_a: 'A woman wearing a silk blouse tucked into tailored trousers, upper body focus, fabric sheen visible.',
    c_hauts_b: 'A woman in a fine knit sweater, relaxed pose, the knit texture clearly visible.',
    c_pantalons_a: 'A woman wearing wide-leg tailored trousers, full length, the trousers are the hero of the image.',
    c_pantalons_b: 'A woman wearing well-cut straight jeans with a simple elegant top, full length.',
    c_jupes_a: 'A woman wearing a pleated midi skirt in gentle motion.',
    c_jupes_b: 'A woman wearing an elegant pencil skirt with a fine knit top.',
    c_manteaux_a: 'A woman wearing a long tailored wool coat, the coat is the hero of the image.',
    c_manteaux_b: 'A woman wearing a cropped tweed jacket over a simple top.',
    c_chaussures_a: 'Close framing on elegant leather heels worn by a woman, lower legs and shoes only, the shoes are the hero.',
    c_chaussures_b: 'Stylish leather ankle boots worn by a woman walking on a cobbled street, close framing on the shoes.',
    c_accessoires_a: 'Still life of luxury accessories: a structured leather handbag, a silk scarf, fine gold jewelry and sunglasses on a marble surface, no people.',
    c_accessoires_b: 'Still life of a leather tote bag, a wide-brim hat, a slim belt and gold earrings on cream linen, no people.',
    p_livraison: 'Close-up of hands with a gold ring opening a plain cream cardboard box at home, folded soft knitwear wrapped in white tissue paper inside, linen sofa in soft focus.',
    p_retours: 'A neatly folded garment placed back into a cream gift box with a satin ribbon, on a light wooden table, calm and reassuring.',
    p_tailles: 'A tailor measuring tape draped over a folded wool garment beside a fashion sketchbook on a light desk.',
    p_faq: 'A cozy reading corner in a bright shop, an armchair, a cup of tea and a fashion magazine, no people.',
    p_contact: 'A smiling woman holding a phone at a sunlit coffee shop table, soft focus background.',
    p_compte: 'A woman at home on a linen sofa browsing on a tablet, relaxed, warm light.',
    p_cartes_cadeaux: 'An elegant cream and gold gift envelope tied with a silk ribbon, dried flowers, on marble, no visible writing.',
    p_parrainage: 'Two women friends laughing together while shopping, holding paper shopping bags, sunny street.',
    p_politiques: 'A calm minimalist desk with a fountain pen, a leather notebook and a vase with a single flower.',
    p_boite: 'An open premium cardboard box filled with carefully folded clothing in tissue paper, a blank card on top.',
    p_boite_decouverte: 'A small elegant box with two folded garments and a small accessory, light tissue paper, airy and fresh.',
    p_boite_classique: 'A medium elegant box with three folded garments, a scarf and a jewelry pouch, cream tissue paper.',
    p_boite_prestige: 'A large luxurious black box with gold details, folded cashmere, a silk scarf and fine jewelry, sumptuous.',
    p_anticipe: 'A woman looking through a shop window at dawn before opening, the new collection displayed inside, anticipation.',
    p_ambassadrices: 'Three stylish women of different ages and origins walking together in the city, confident and joyful.',
    p_seconde_main: 'Carefully selected pre-loved garments on a wooden rack in a bright space, natural and sustainable mood.',
    p_vip: 'A private fitting salon with a velvet armchair, a glass of champagne and a curated rail of garments, exclusive mood.',
    a_hiver: 'A woman in a winter coat stepping into a warm, softly lit shop, snow falling outside.',
    a_bureau: 'A calm, elegant small fashion atelier in soft morning light, racks of carefully chosen garments in soft focus, a marble counter with fresh flowers, no people.',
    a_accessoires: 'Hands carefully choosing a fabric swatch among samples on an atelier table.',
    a_soiree: 'A woman in an elegant evening dress on a terrace at dusk, city lights in soft focus.',
    a_weekend: 'A woman in a relaxed chic weekend outfit at a farmers market, carrying a straw bag.',
    v_favoris_vide: 'A small heart drawn in the condensation of a window, cream linen curtains, warm afternoon light, a folded cashmere sweater on a chair.',
    v_introuvable: 'An empty elegant fitting room with an open velvet curtain and soft light, no people.',
    v_panier_vide: 'An empty woven basket on a wooden bench in a bright shop, no people.',
    pourImg: 'For this image:' };
  var AS = { etape: 1, gen: false, depense: 0 };
  var BRIEF_DEF = { annee: '2027', ambiance: ['chic', 'chaleur'], palette: 'creme', ages: ['25', '35', '50'], varie: ['origines', 'silhouettes'],
    cadrage: 'pied', eviter: ['texte', 'logos', 'mains'], ajust: '',
    lieux: { printemps: '${T("Cerisiers en fleurs, terrasse de café, ruelle pavée")}', ete: '${T("Bord de mer, jardin fleuri, marché en plein air")}',
      automne: '${T("Parc aux feuilles rousses, librairie, rue de village")}', hiver: '${T("Forêt enneigée, patinoire au crépuscule, chalet")}' } };
  var BRIEF = (function(){ try { var b = JSON.parse(localStorage.getItem('sz-img-brief') || 'null'); return b && b.lieux ? b : JSON.parse(JSON.stringify(BRIEF_DEF)); } catch (e) { return JSON.parse(JSON.stringify(BRIEF_DEF)); } })();
  function garderBrief(){ try { localStorage.setItem('sz-img-brief', JSON.stringify(BRIEF)); } catch (e) {} }
  var APERCU = [
    { id: 'hiver', titre: '${T("Saison · Hiver, plan 1")}', format: '16:9', modele: true, lieu: 'hiver', sujet: SZ_DONNEES.sujHiver },
    { id: 'printemps', titre: '${T("Saison · Printemps, plan 1")}', format: '16:9', modele: true, lieu: 'printemps', sujet: SZ_DONNEES.sujPrint },
    { id: 'robes', titre: '${T("Catégorie · Robes")}', format: '3:4', modele: true, lieu: 'ete', sujet: SZ_DONNEES.sujRobes },
    { id: 'livraison', titre: '${T("Page · Livraison")}', format: '16:9', modele: false, sujet: SZ_DONNEES.sujLivr },
    { id: 'histoire', titre: '${T("À propos · Notre histoire")}', format: '16:9', modele: false, sujet: SZ_DONNEES.sujHist },
    { id: 'favoris', titre: '${T("Écran vide · Favoris")}', format: '3:4', modele: false, sujet: SZ_DONNEES.sujFav }
  ].map(function(a){ var g = null; try { g = JSON.parse(localStorage.getItem('sz-img-ap-' + a.id) || 'null'); } catch (e) {} a.image = (g && g.image) || ''; a.gardee = !!(g && g.gardee); a.ajout = (g && g.ajout) || ''; a.etat = ''; return a; });
  function garderAp(a){ try { localStorage.setItem('sz-img-ap-' + a.id, JSON.stringify({ image: a.image, gardee: a.gardee, ajout: a.ajout })); } catch (e) { try { localStorage.setItem('sz-img-ap-' + a.id, JSON.stringify({ image: '', gardee: a.gardee, ajout: a.ajout })); } catch (e2) {} } }

  function dn(pre, k){ return SZ_DONNEES[pre + k] || ''; }
  var ORIG = SZ_DONNEES.orig.split('|'), SILH = SZ_DONNEES.silh.split('|');
  function hasard(l){ return l[Math.floor(Math.random() * l.length)]; }
  function consigne(a){
    var p = [];
    p.push(a.sujet);
    var LT = a.lieuTexte || (a.lieu && BRIEF.lieux[a.lieu]);
    if (LT) p.push(SZ_DONNEES.decor + ' ' + LT + '.');
    if (a.modele) {
      var age = dn('age', hasard(BRIEF.ages.length ? BRIEF.ages : ['35'])) || SZ_DONNEES.age35;
      var qui = SZ_DONNEES.qui + ' ' + age;
      if (BRIEF.varie.indexOf('origines') >= 0) qui += ', ' + hasard(ORIG);
      if (BRIEF.varie.indexOf('silhouettes') >= 0) qui += ', ' + SZ_DONNEES.avec + ' ' + hasard(SILH) + ' ' + SZ_DONNEES.fig;
      p.push(qui + ', ' + SZ_DONNEES.maq);
      p.push((dn('cad', BRIEF.cadrage) || SZ_DONNEES.cadpied) + '.');
    }
    p.push(SZ_DONNEES.style + ' ' + (BRIEF.ambiance.map(function(k){ return dn('amb', k); }).filter(Boolean).join(', ') || SZ_DONNEES.ambchic) + ', ' + SZ_DONNEES.raffine + ' ' + (dn('pal', BRIEF.palette) || SZ_DONNEES.palcreme) + ', ' + SZ_DONNEES.fin);
    var ev = [];
    if (BRIEF.eviter.indexOf('texte') >= 0) ev.push(SZ_DONNEES.evTexte);
    if (BRIEF.eviter.indexOf('logos') >= 0) ev.push(SZ_DONNEES.evLogos);
    if (BRIEF.eviter.indexOf('mains') >= 0 && a.modele) ev.push(SZ_DONNEES.evMains);
    if (ev.length) p.push(ev.join(', ') + '.');
    if (BRIEF.ajust) p.push(SZ_DONNEES.notes + ' ' + BRIEF.ajust);
    if (a.ajout) p.push(SZ_DONNEES.pourImg + ' ' + a.ajout);
    return p.join(' ');
  }
  function chips(cle, liste, un){
    var val = BRIEF[cle];
    return '<div class="as-chips" data-cle="' + cle + '"' + (un ? ' data-un="1"' : '') + '>' + liste.map(function(c){
      var on = un ? val === c[0] : (val || []).indexOf(c[0]) >= 0;
      return '<button type="button" class="as-chip' + (on ? ' on' : '') + '" data-v="' + c[0] + '" aria-pressed="' + on + '">' + esc(c[1]) + '</button>'; }).join('') + '</div>';
  }
  function argentUSD(n){ return argentUS(n) + ' US'; }
  function argentUS(n){ return (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') + ' $'; }
  function cote(){
    var nImg = 16 + INV.categories.length * 2 + INV.pages.length + INV.apropos.length + INV.vides.length;
    var photos = nImg * 0.06, videos = 16 * 0.42, ap = 6 * 0.06;
    return '<aside class="as-cote"><h3>${T("Coût estimé")}</h3><div class="as-total"><b>' + argentUS(photos + videos + ap) + '</b><span>US</span></div>'
      + '<ul class="as-l"><li><span>' + nImg + ' ${T("images, une par emplacement")}</span><b>' + argentUS(photos) + '</b></li>'
      + '<li><span>${T("Vidéos de saison (16 × 5 s)")}</span><b>' + argentUS(videos) + '</b></li>'
      + '<li><span>${T("Aperçu (6 images)")}</span><b>' + argentUS(ap) + '</b></li>'
      + (AS.depense ? '<li><span>${T("Déjà dépensé pour l’aperçu")}</span><b>' + argentUS(AS.depense) + '</b></li>' : '') + '</ul>'
      + '<li><span>${T("Chaque image refaite")}</span><b>0,06 $</b></li>'
      + '<p class="as-fin">${T("Prix fal.ai du 27 novembre 2026. Chaque image passe par le plafond de dépense des images.")}</p></aside>';
  }
  function etapes(){
    var l = [[1, '${T("Vos goûts")}'], [2, '${T("Aperçu")}'], [3, '${T("Génération")}'], [4, '${T("Test, puis production")}']];
    return '<nav class="as-etapes" aria-label="${T("Étapes")}">' + l.map(function(e){ return '<button type="button" class="' + (AS.etape === e[0] ? 'on' : '') + '" data-etape="' + e[0] + '"><span class="n">' + e[0] + '</span>' + e[1] + '</button>'; }).join('') + '</nav>';
  }
  function etape1(){
    return '<div class="as-grille"><div>'
      + '<div class="as-q"><h3>${T("Pour quelle année ?")}</h3><p>${T("La collection est rangée à part : celle en ligne reste intacte.")}</p>' + chips('annee', [['2027', '2027'], ['2028', '2028']], true) + '</div>'
      + '<div class="as-q"><h3>${T("Quelle ambiance ?")}</h3><p>${T("Plusieurs choix possibles.")}</p>' + chips('ambiance', [['chic', '${T("Chic et lumineux")}'], ['edito', '${T("Éditorial de magazine")}'], ['chaleur', '${T("Chaleureux et naturel")}'], ['urbain', '${T("Urbain et graphique")}'], ['roman', '${T("Romantique")}']]) + '</div>'
      + '<div class="as-q"><h3>${T("Quelle palette ?")}</h3>' + chips('palette', [['creme', '${T("Crème, camel et or")}'], ['froid', '${T("Neutres froids")}'], ['vif', '${T("Couleurs vives de saison")}'], ['noir', '${T("Noir et blanc, touche bordeaux")}']], true) + '</div>'
      + '<div class="as-q"><h3>${T("Quels lieux pour chaque saison ?")}</h3><div class="as-lieux">'
        + [['printemps', '${T("Printemps")}'], ['ete', '${T("Été")}'], ['automne', '${T("Automne")}'], ['hiver', '${T("Hiver")}']].map(function(s){ return '<label>' + s[1] + '<input type="text" maxlength="200" data-lieu="' + s[0] + '" value="' + esc(BRIEF.lieux[s[0]] || '') + '"></label>'; }).join('') + '</div></div>'
      + '<div class="as-q"><h3>${T("Qui porte les vêtements ?")}</h3><p>${T("Une mannequin différente à chaque plan.")}</p>' + chips('ages', [['25', '${T("25 à 35 ans")}'], ['35', '${T("35 à 50 ans")}'], ['50', '${T("50 ans et plus")}']]) + ' ' + chips('varie', [['origines', '${T("Origines variées")}'], ['silhouettes', '${T("Silhouettes variées")}']]) + '</div>'
      + '<div class="as-q"><h3>${T("Quel cadrage ?")}</h3>' + chips('cadrage', [['pied', '${T("En pied, tenue entière")}'], ['trois', '${T("Trois quarts")}'], ['detail', '${T("Détails et matières")}']], true) + '</div>'
      + '<div class="as-q"><h3>${T("À éviter")}</h3>' + chips('eviter', [['texte', '${T("Aucun texte ni enseigne")}'], ['logos', '${T("Aucun logo de marque")}'], ['mains', '${T("Mains nues à l’intérieur")}']]) + '</div>'
      + '<div class="as-q"><h3>${T("Vos ajustements")}</h3><p>${T("Tout ce que les questions n’ont pas dit, en vos mots.")}</p><textarea id="as-ajust" maxlength="600" aria-label="${T("Vos ajustements")}">' + esc(BRIEF.ajust || '') + '</textarea></div>'
      + '</div>' + cote() + '</div>'
      + '<div class="as-pied"><span></span><button type="button" class="prim" data-etape="2">${T("Voir l’aperçu")}</button></div>';
  }
  function carteAp(a, i){
    return '<div class="as-carte' + (a.gardee ? ' gardee' : '') + '" data-ap="' + i + '"><div class="ph" style="aspect-ratio:' + (a.format === '3:4' ? '3/4' : '16/10') + '">'
      + (a.etat === 'gen' ? '<span class="rond" role="status" aria-label="${T("Génération en cours")}"></span>' : (a.image ? '<img src="' + a.image + '" alt="">' : '<span style="font-size:.74rem;color:var(--tx2)">${T("Pas encore générée")}</span>'))
      + '</div><div class="c"><b>' + esc(a.titre) + '</b>'
      + '<input type="text" maxlength="200" data-ajout="' + i + '" aria-label="${T("Ajuster cette image (facultatif)")}" placeholder="${T("Ajuster cette image (facultatif)")}" value="' + esc(a.ajout || '') + '">'
      + '<div class="gest"><button type="button" data-gen="' + i + '"' + (AS.gen ? ' disabled' : '') + '>' + (a.image ? '${T("Régénérer")}' : '${T("Générer")}') + ' · 0,06 $</button>'
      + (a.image ? '<button type="button" data-garder="' + i + '">' + (a.gardee ? '${T("✓ Gardée")}' : '${T("Garder")}') + '</button>' : '') + '</div></div></div>';
  }
  function etape2(){
    var reste = APERCU.filter(function(a){ return !a.image; }).length;
    return '<div class="as-bandeau">${T("Six images faites avec vos réponses. Ajustez ou régénérez chacune avant la génération complète. Chaque image coûte 0,06 $ US.")}</div>'
      + '<div class="as-apercus">' + APERCU.map(carteAp).join('') + '</div>'
      + '<div class="as-pied"><button type="button" data-etape="1">${T("← Revenir aux questions")}</button><span>'
      + (reste ? '<button type="button" class="prim" id="as-tout"' + (AS.gen ? ' disabled' : '') + '>' + '${T("Générer les images manquantes")}' + ' (' + reste + ' · ' + argentUS(reste * 0.06) + ')</button> ' : '')
      + '<button type="button" data-etape="3">${T("Étape suivante")}</button></span></div>';
  }
  /* ── LOT C : la génération complète. Le travail vit dans la page principale (imagesboutique:lancer…) ; ici on le
     montre, on le relance, on le sonde toutes les 4 s tant qu'il tourne et que la fenêtre est sur l'étape 3. ── */
  var C = null, C_MIN = null, C_AJ = {};
  function nomCle(k){ return String(k).replace(/-/g, '_'); }
  function lieuxDe(s){ var l = String(BRIEF.lieux[s] || '').split(',').map(function(x){ return x.trim(); }).filter(Boolean); return l.length ? l : ['']; }
  function cheminApropos(k){ return (k === 'soiree' || k === 'weekend') ? 'assets/img/apropos/' + k + '-1600.webp' : 'assets/img/apropos/' + k + '-2400.webp'; }
  var GARDE_ID = { hiver: 's-hiver-1', printemps: 's-printemps-1', robes: 'c-robes-a', livraison: 'p-livraison', histoire: 'a-bureau', favoris: 'v-favoris-vide' };
  function planCollection(){
    var l = [];
    INV.saisons.forEach(function(s){
      var lieux = lieuxDe(s[0]), tenues = String(SZ_DONNEES['o_' + s[0]] || '').split('|'), droite = (s[0] === 'printemps' || s[0] === 'hiver');
      for (var i = 1; i <= 4; i++) {
        var a = { sujet: SZ_DONNEES.femme + ' ' + (tenues[i - 1] || tenues[0]) + '. ' + (droite ? SZ_DONNEES.droite : SZ_DONNEES.gauche) + ' ' + SZ_DONNEES.large,
          lieuTexte: lieux[(i - 1) % lieux.length], modele: true };
        l.push({ id: 's-' + s[0] + '-' + i, titre: s[1] + ' · ${T("plan")} ' + i, groupe: 'saisons', saison: s[0], plan: i, cx: droite ? 0.68 : 0.32, format: '16:9', a: a,
          consigneVideo: SZ_DONNEES.video + ' ' + (droite ? SZ_DONNEES.vDroite : SZ_DONNEES.vGauche) });
      }
    });
    INV.categories.forEach(function(c){
      var acc = c[0] === 'accessoires';
      [['a', acc ? 'cat-accessoires-e' : 'cat-' + c[0] + '-a', '1'], ['b', acc ? 'cat-accessoires-f' : 'cat-' + c[0] + '-b', '2']].forEach(function(x){
        l.push({ id: 'c-' + c[0] + '-' + x[0], titre: c[1] + ' · ' + x[2], groupe: 'categories', chemins: ['assets/img/pages/' + x[1] + '-2x.webp'], format: '3:4',
          a: { sujet: SZ_DONNEES['c_' + nomCle(c[0]) + '_' + x[0]] || SZ_DONNEES.sujRobes, modele: !acc } });
      });
    });
    INV.pages.forEach(function(p){ l.push({ id: 'p-' + p[0], titre: p[1], groupe: 'pages', chemins: cheminsDe('assets/img/pages/' + p[0] + '-2400.webp'), format: '16:9',
      a: { sujet: SZ_DONNEES['p_' + nomCle(p[0])] || SZ_DONNEES.sujHist, modele: false } }); });
    INV.apropos.forEach(function(p){ l.push({ id: 'a-' + p[0], titre: p[1], groupe: 'apropos', chemins: cheminsDe(cheminApropos(p[0])), format: '16:9',
      a: { sujet: SZ_DONNEES['a_' + nomCle(p[0])] || SZ_DONNEES.sujHist, modele: false } }); });
    INV.vides.forEach(function(p){ l.push({ id: 'v-' + p[0], titre: p[1], groupe: 'vides', chemins: ['assets/img/pages/' + p[0] + '-2x.webp'], format: '3:4',
      a: { sujet: SZ_DONNEES['v_' + nomCle(p[0])] || SZ_DONNEES.sujFav, modele: false } }); });
    return l;
  }
  function gardeesAp(){ var g = {}; APERCU.forEach(function(a){ if (a.gardee && /^data:image\\//.test(a.image || '') && GARDE_ID[a.id]) g[GARDE_ID[a.id]] = a.image; }); return g; }
  function chargerCol(){
    return appeler('imagesboutique:collection').then(function(r){
      if (!r || !r.ok) { C = null; if (VUE === 'neuve' && AS.etape >= 3) dire(expliquer(r), 'err'); }
      else C = r;
      if (VUE === 'neuve' && AS.etape >= 3) dessinerAssistant();
      sonder();
    });
  }
  function sonder(){
    if (C_MIN) { clearTimeout(C_MIN); C_MIN = null; }
    if (VUE === 'neuve' && AS.etape === 3 && C && (C.etat === 'images' || C.etat === 'videos')) C_MIN = setTimeout(chargerCol, 4000);
  }
  function compte(l, f){ return l.filter(f).length; }
  function vignette(t){
    var st = t.etat === 'faite' ? (t.video ? (t.video.etat === 'prete' ? '${T("vidéo prête")}' : t.video.etat === 'en_cours' || t.video.etat === 'soumise' ? '${T("vidéo en cours")}' : t.video.etat === 'echec' ? '${T("vidéo en échec")}' : '') : '')
      : t.etat === 'en_cours' ? '${T("en cours")}' : t.etat === 'echec' ? '${T("échec")}' : '${T("en attente")}';
    var refaire = C && (C.etat === 'revue' || C.etat === 'prete' || C.etat === 'pause');
    return '<div class="as-carte' + (t.etat === 'echec' ? ' echec' : '') + '"><div class="ph" style="aspect-ratio:' + (t.format === '3:4' ? '3/4' : '16/10') + '">'
      + (t.etat === 'en_cours' ? '<span class="rond" role="status" aria-label="${T("Génération en cours")}"></span>' : t.url ? '<img src="' + esc(t.url) + '" alt="" loading="lazy">' : '')
      + '</div><div class="c"><b>' + esc(t.titre) + '</b>' + (st ? '<span>' + st + '</span>' : '') + (t.erreur ? '<span>' + esc(t.erreur) + '</span>' : '')
      + (refaire && t.etat !== 'en_cours' ? '<input type="text" maxlength="200" data-aj="' + esc(t.id) + '" aria-label="${T("Ajuster (facultatif)")}" placeholder="${T("Ajuster (facultatif)")}" value="' + esc(C_AJ[t.id] || '') + '">'
        + '<div class="gest"><button type="button" data-refaire="' + esc(t.id) + '">${T("Refaire")} · 0,06 $</button></div>' : '')
      + '</div></div>';
  }
  var GROUPES = [['saisons', '${T("Bannières des saisons")}'], ['categories', '${T("Catégories")}'], ['pages', '${T("Pages")}'], ['apropos', '${T("À propos")}'], ['vides', '${T("Écrans vides")}']];
  function grilleCol(){
    return GROUPES.map(function(g){ var l = C.taches.filter(function(t){ return t.groupe === g[0]; }); if (!l.length) return '';
      return '<h3 class="as-h">' + g[1] + ' <span>' + compte(l, function(t){ return t.etat === 'faite'; }) + ' / ' + l.length + '</span></h3><div class="as-apercus">' + l.map(vignette).join('') + '</div>'; }).join('');
  }
  function barre(n, total){ var p = total ? Math.round(n * 100 / total) : 0; return '<div class="as-barre" role="progressbar" aria-valuenow="' + p + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + p + '%"></i></div>'; }
  function etape3(){
    if (!C) return '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>';
    if (C.etat === 'aucune') {
      var pl = planCollection(), g = gardeesAp(), n = pl.length - Object.keys(g).length;
      var par = function(k){ return compte(pl, function(t){ return t.groupe === k; }); };
      return '<div class="as-bandeau">${T("La collection")} ' + esc(BRIEF.annee) + ' : <b>' + pl.length + ' ${T("images")}</b> — ' + par('saisons') + ' ${T("plans de saison")}, '
        + par('categories') + ' ${T("photos de catégorie")}, ' + par('pages') + ' ${T("bannières de page")}, ' + par('apropos') + ' ${T("pour À propos")}, ' + par('vides') + ' ${T("écrans vides")}' + '.'
        + (Object.keys(g).length ? ' ' + Object.keys(g).length + ' ${T("images gardées de l’aperçu sont reprises telles quelles.")}' : '') + '</div>'
        + '<ol class="as-temps"><li><b>${T("Les images")}</b> · ' + n + ' × 0,06 $ = ' + argentUS(n * C.prixImage) + '<span>${T("Elles se font en arrière-plan : vous pouvez fermer cette fenêtre. Chacune se refait ensuite seule.")}</span></li>'
        + '<li><b>${T("Les vidéos des saisons")}</b> · 16 × 0,42 $ = ' + argentUS(16 * C.prixVideo) + '<span>${T("Lancées après votre revue des images, à partir des plans retenus.")}</span></li>'
        + '<li><b>${T("L’écriture dans la boutique préparée")}</b><span>${T("Rien ne change en ligne avant Publication. La collection d’aujourd’hui est gardée pour y revenir.")}</span></li></ol>'
        + '<div class="as-pied"><button type="button" data-etape="2">${T("← Aperçu")}</button><button type="button" class="prim" id="as-lancer" data-prix="' + (Math.round(n * C.prixImage * 100) / 100) + '">${T("Lancer les images")} (' + argentUSD(n * C.prixImage) + ')</button></div>';
    }
    var l = C.taches, faites = compte(l, function(t){ return t.etat === 'faite'; }), echec = compte(l, function(t){ return t.etat === 'echec'; });
    var sais = l.filter(function(t){ return t.saison && t.etat === 'faite'; }), vids = compte(sais, function(t){ return t.video && t.video.etat === 'prete'; });
    var h = '<div class="as-etat"><div><b>${T("Collection")} ' + esc(C.annee) + '</b><span>' + faites + ' / ' + l.length + ' ${T("images")}'
      + (C.phase === 'videos' || vids ? ' · ' + vids + ' / ' + sais.length + ' ${T("vidéos")}' : '') + (echec ? ' · ' + echec + ' ${T("en échec")}' : '')
      + ' · ${T("dépensé")} ' + argentUSD(C.depense || 0) + '</span></div>';
    if (C.etat === 'images' || C.etat === 'videos') h += '<button type="button" id="as-pause">${T("Mettre en pause")}</button>';
    if (C.etat === 'pause') h += '<button type="button" class="prim" id="as-pause">${T("Reprendre")}</button>';
    h += '</div>' + barre(C.etat === 'videos' || C.phase === 'prete' ? vids : faites, C.etat === 'videos' || C.phase === 'prete' ? sais.length : l.length);
    if (C.etat === 'pause' && C.erreur) h += '<div class="as-bandeau">${T("En pause :")} ' + esc(C.erreur) + '</div>';
    if (C.etat === 'images') h += '<p class="as-fin">${T("Les images se font une à une, en arrière-plan. Vous pouvez fermer cette fenêtre : le travail continue dans l’application.")}</p>';
    if (C.etat === 'videos') h += '<p class="as-fin">${T("Les vidéos prennent 1 à 3 minutes chacune chez fal.ai. Vous pouvez fermer cette fenêtre.")}</p>';
    if (C.etat === 'revue') {
      var nv = compte(sais, function(t){ return !(t.video && t.video.etat === 'prete'); });
      h += '<div class="as-bandeau">${T("Les images sont prêtes. Regardez-les et refaites celles qui ne vous plaisent pas, puis animez les saisons.")}</div>'
        + '<div class="as-pied"><button type="button" id="as-ecrire-sans">${T("Écrire sans les vidéos")}</button>'
        + (nv ? '<button type="button" class="prim" id="as-animer" data-prix="' + (Math.round(nv * C.prixVideo * 100) / 100) + '">${T("Animer les plans de saison")} (' + nv + ' · ' + argentUSD(nv * C.prixVideo) + ')</button>' : '') + '</div>';
    }
    if (C.etat === 'prete') h += '<div class="as-bandeau">${T("Images et vidéos prêtes.")}</div><div class="as-pied"><span></span><button type="button" class="prim" id="as-ecrire">${T("Écrire dans la boutique préparée")}</button></div>';
    return h + grilleCol();
  }
  function etape4(){
    var pre = D && D.precedente;
    var h = '<div class="as-bandeau">${T("La collection en place dans la boutique préparée :")} <b>' + esc((D && D.collection) || '2026') + '</b>.'
      + (C && C.ecrite ? ' ${T("Écrite le")} ' + esc(new Date(C.ecrite).toLocaleString()) + '.' : '') + '</div>'
      + '<ol class="as-temps"><li><b>${T("Vérifier sur le site de test")}</b><span>${T("test.sandriza.com montre la boutique préparée : les bannières, les catégories et les pages de la nouvelle collection.")}</span></li>'
      + '<li><b>${T("Publier")}</b><span>${T("Dans Publication, la fiche « Images de la boutique » envoie la collection en ligne.")}</span></li>'
      + '<li><b>${T("Revenir en arrière")}</b><span>${T("La collection précédente est gardée entière : un clic la remet dans la boutique préparée.")}</span></li></ol>'
      + '<div class="as-pied"><button type="button" data-etape="3">${T("← Génération")}</button><span>'
      + (pre ? '<button type="button" id="as-revenir">${T("Revenir à la collection")} ' + esc(pre) + '</button> ' : '')
      + (C && C.etat !== 'aucune' && C.etat !== 'images' && C.etat !== 'videos' ? '<button type="button" id="as-oublier">${T("Préparer une autre collection")}</button>' : '') + '</span></div>';
    return h;
  }
  function consigneDe(id){ var t = planCollection().filter(function(x){ return x.id === id; })[0]; if (!t) return ''; var a = Object.assign({}, t.a, { ajout: C_AJ[id] || '' }); return consigne(a); }
  function colAction(op, args, ok){
    return appeler(op, args || []).then(function(r){
      if (!r || !r.ok) {
        if (r && r.motif === 'prix_change') dire('${T("Le prix a changé : ")}' + argentUSD(r.prixReel) + '. ${T("Rien n’a été lancé.")}', 'err');
        else if (r && r.motif === 'deja_en_cours') dire('${T("Un travail est déjà en cours.")}', 'err');
        else dire(expliquer(r), 'err');
        return chargerCol();
      }
      if (ok) dire(typeof ok === 'function' ? ok(r) : ok, 'bon');
      if (r.taches) { C = r; dessinerAssistant(); sonder(); } else chargerCol();
      return r;
    });
  }
  function dessinerAssistant(){
    if (!AS.vuCol) { AS.vuCol = true; chargerCol().then(function(){ if (C && C.etat !== 'aucune' && AS.etape < 3) { AS.etape = 3; dessinerAssistant(); sonder(); } }); }
    corps.innerHTML = etapes() + (AS.etape === 1 ? etape1() : AS.etape === 2 ? etape2() : AS.etape === 3 ? etape3() : etape4());
  }
  function generer(i){
    var a = APERCU[i]; if (!a || AS.gen) return Promise.resolve();
    AS.gen = true; a.etat = 'gen'; dessinerAssistant();
    dire('${T("Génération de")} « ' + a.titre + ' »…');
    return appeler('imagesboutique:apercu', [consigne(a), a.format]).then(function(r){
      AS.gen = false; a.etat = '';
      if (!r || !r.ok) { dire(expliquer(r), 'err'); dessinerAssistant(); return false; }
      a.image = r.image; a.gardee = false; AS.depense += (r.cout || 0.06); garderAp(a);
      dire('« ' + a.titre + ' » ${T("générée.")}', 'bon'); dessinerAssistant(); return true;
    });
  }
  function genererManquantes(){
    var l = APERCU.map(function(a, i){ return a.image ? -1 : i; }).filter(function(i){ return i >= 0; });
    var k = 0;
    var suite = function(){ if (k >= l.length) return; generer(l[k++]).then(function(ok){ if (ok !== false) suite(); }); };
    suite();
  }
  corps.addEventListener('click', function(ev){
    if (VUE !== 'neuve') return;
    var t = ev.target; if (!t || !t.closest) return;
    var b;
    if ((b = t.closest('[data-etape]'))) { AS.etape = +b.getAttribute('data-etape'); dessinerAssistant(); corps.scrollTop = 0; if (AS.etape >= 3) chargerCol(); return; }
    if ((b = t.closest('.as-chip'))) {
      var g = b.parentNode, cle = g.getAttribute('data-cle'), v = b.getAttribute('data-v');
      if (g.getAttribute('data-un')) BRIEF[cle] = v;
      else { var l = BRIEF[cle] || []; var i = l.indexOf(v); if (i >= 0) l.splice(i, 1); else l.push(v); BRIEF[cle] = l; }
      garderBrief(); dessinerAssistant(); return;
    }
    if ((b = t.closest('[data-gen]'))) { generer(+b.getAttribute('data-gen')); return; }
    if ((b = t.closest('[data-garder]'))) { var a = APERCU[+b.getAttribute('data-garder')]; a.gardee = !a.gardee; garderAp(a); dessinerAssistant(); return; }
    if (t.id === 'as-tout') { genererManquantes(); return; }
    if (t.id === 'as-lancer') {
      var prix = +t.getAttribute('data-prix');
      var pl = planCollection().map(function(x){ var o = Object.assign({}, x); o.consigne = consigne(x.a); delete o.a; return o; });
      szConfirmer({ titre: '${T("Lancer les images")}', texte: '${T("Les images de la collection seront générées en arrière-plan, pour")} ' + argentUSD(prix) + '. ${T("Rien ne change dans la boutique avant l’écriture.")}', oui: '${T("Lancer")}' })
        .then(function(oui){ if (oui) { t.disabled = true; colAction('imagesboutique:lancer', [BRIEF.annee, pl, gardeesAp(), prix], '${T("Génération lancée.")}'); } });
      return;
    }
    if (t.id === 'as-pause') { colAction('imagesboutique:pause', []); return; }
    if ((b = t.closest('[data-refaire]'))) { var id = b.getAttribute('data-refaire'); b.disabled = true; colAction('imagesboutique:refaire', [id, consigneDe(id)], '${T("Image remise dans la file.")}'); return; }
    if (t.id === 'as-animer') {
      var pv = +t.getAttribute('data-prix');
      szConfirmer({ titre: '${T("Animer les plans de saison")}', texte: '${T("Chaque plan devient une vidéo de 5 secondes, sans son. Coût :")} ' + argentUSD(pv) + '.', oui: '${T("Animer")}' })
        .then(function(oui){ if (oui) colAction('imagesboutique:animer', [pv], '${T("Animation lancée.")}'); });
      return;
    }
    if (t.id === 'as-ecrire' || t.id === 'as-ecrire-sans') {
      szConfirmer({ titre: '${T("Écrire dans la boutique préparée")}', texte: '${T("La nouvelle collection remplace celle de la boutique préparée (test.sandriza.com). Rien ne change en ligne avant Publication, et la collection d’aujourd’hui reste disponible pour y revenir.")}', oui: '${T("Écrire")}' })
        .then(function(oui){ if (!oui) return; appeler('imagesboutique:ecrire').then(function(r){
          if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
          dire(r.images + ' ${T("images et")} ' + r.saisons + ' ${T("saisons écrites dans la boutique préparée.")}', 'bon');
          AS.etape = 4; charger(); chargerCol();
        }); });
      return;
    }
    if (t.id === 'as-revenir') {
      szConfirmer({ titre: '${T("Revenir à la collection précédente")}', texte: '${T("La collection précédente revient dans la boutique préparée. À publier ensuite depuis Publication.")}', oui: '${T("Revenir")}' })
        .then(function(oui){ if (!oui) return; appeler('imagesboutique:revenir').then(function(r){
          if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
          dire('${T("Collection")} ' + r.collection + ' ${T("remise dans la boutique préparée.")}', 'bon'); charger();
        }); });
      return;
    }
    if (t.id === 'as-oublier') { colAction('imagesboutique:oublier', []).then(function(){ AS.etape = 1; dessinerAssistant(); }); return; }
  });
  corps.addEventListener('input', function(ev){
    if (VUE !== 'neuve') return;
    var t = ev.target;
    if (t.id === 'as-ajust') { BRIEF.ajust = t.value; garderBrief(); return; }
    if (t.getAttribute && t.getAttribute('data-lieu')) { BRIEF.lieux[t.getAttribute('data-lieu')] = t.value; garderBrief(); return; }
    if (t.getAttribute && t.getAttribute('data-aj') !== null) { C_AJ[t.getAttribute('data-aj')] = t.value; return; }
    if (t.getAttribute && t.getAttribute('data-ajout') !== null) { var a = APERCU[+t.getAttribute('data-ajout')]; if (a) { a.ajout = t.value; garderAp(a); } }
  });
  function carte(chemin, nom, info, remplacable){
    var neuve = !!(D && D.images && D.images[chemin]);
    return '<div class="im-v" data-c="' + esc(chemin) + '"><span class="past' + (neuve ? ' neuve' : '') + '">' + (neuve ? '${T("Remplacée")}' : '${T("Origine")}') + '</span>'
      + '<img src="' + esc(src(chemin)) + '" alt="" loading="lazy"><div class="lb"><b>' + esc(nom) + '</b><span>' + esc(info) + '</span></div>'
      + (remplacable && D && D.peutModifier ? '<div class="gest"><button type="button" data-rempl="' + esc(chemin) + '">${T("Remplacer…")}</button>'
        + (neuve ? '<button type="button" data-retab="' + esc(chemin) + '">${T("Rétablir")}</button>' : '') + '</div>' : '') + '</div>';
  }
  function dessiner(){
    if (!D) return;
    var n = Object.keys(D.images || {}).length;
    elSous.textContent = '${T("Collection")} ' + (D.collection || '2026') + (n ? ' · ' + n + ' ' + (n > 1 ? '${T("images remplacées")}' : '${T("image remplacée")}') : '');
    if (VUE === 'neuve') {
      dessinerAssistant();
      return;
    }
    var h = '<div class="im-resume"><span class="k"><b>' + (INV.categories.length * 2 + INV.pages.length + INV.apropos.length + INV.vides.length) + '</b>${T("photos")}</span>'
      + '<span class="k"><b>16</b>${T("vidéos de saison")}</span><span class="k"><b>' + n + '</b>${T("remplacées")}</span></div>';
    h += '<div data-pages="images-inv">';   // (2026-11-28) paginé : la vue défilait
    h += '<div class="im-g"><h2>${T("Bannières des saisons")} <span>${T("4 plans vidéo par saison — refaits par la nouvelle collection")}</span></h2><div class="im-s">'
      + INV.saisons.map(function(s){ return '<div class="im-saison"><div class="t"><b>' + esc(s[1]) + '</b><span>${T("vidéo")}</span></div><div class="plans">'
        + [1, 2, 3, 4].map(function(i){ var g = D.saisons && D.saisons[s[0]] && D.saisons[s[0]][i - 1]; return '<img src="' + esc((g && g.poster) || src('assets/video/saisons/' + s[2] + '-' + i + '.webp')) + '" alt="" loading="lazy">'; }).join('') + '</div></div>'; }).join('') + '</div></div>';
    h += '<div class="im-g"><h2>${T("Catégories")} <span>${T("2 photos par catégorie · 1200 × 1600")}</span></h2><div class="im-grille p">'
      + INV.categories.map(function(c){
          var a = c[0] === 'accessoires' ? 'cat-accessoires-e' : 'cat-' + c[0] + '-a', b = c[0] === 'accessoires' ? 'cat-accessoires-f' : 'cat-' + c[0] + '-b';
          return carte('assets/img/pages/' + a + '-2x.webp', c[1], '${T("photo 1")}', true) + carte('assets/img/pages/' + b + '-2x.webp', c[1], '${T("photo 2")}', true);
        }).join('') + '</div></div>';
    h += '<div class="im-g"><h2>${T("Pages")} <span>${T("bannière en tête de page · 2400 px")}</span></h2><div class="im-grille l">'
      + INV.pages.map(function(p){ return carte('assets/img/pages/' + p[0] + '-2400.webp', p[1], '2400 px', true); }).join('') + '</div>'
      + '<p class="im-note">${T("Une page remplacée garde la même image sur ordinateur, tablette et téléphone.")}</p></div>';
    h += '<div class="im-g"><h2>${T("À propos")}</h2><div class="im-grille l">'
      + INV.apropos.map(function(a){ var ch = (a[0] === 'soiree' || a[0] === 'weekend') ? 'assets/img/apropos/' + a[0] + '-1600.webp' : 'assets/img/apropos/' + a[0] + '-2400.webp'; return carte(ch, a[1], '', true); }).join('') + '</div></div>';
    h += '<div class="im-g"><h2>${T("Écrans vides")}</h2><div class="im-grille p">'
      + INV.vides.map(function(e){ return carte('assets/img/pages/' + e[0] + '-2x.webp', e[1], '', true); }).join('') + '</div></div>';
    h += '</div>';
    corps.innerHTML = h;
  }
  function charger(){
    appeler('imagesboutique:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; return; }
      D = r; dessiner();
    });
  }
  function occupe(chemin, on){ var v = corps.querySelector('[data-c="' + chemin.replace(/"/g, '') + '"]'); if (v) v.classList.toggle('occupe', !!on); }
  /* Une page « 2400 » est aussi servie en 1400 et en 800 : la même image remplace les trois tailles (le site prend la plus grande). */
  function cheminsDe(chemin){
    var m = /^(assets\\/img\\/(?:pages|apropos)\\/[a-z0-9-]+)-(2400|1600)\\.webp$/.exec(chemin);
    if (!m) return [chemin];
    return m[2] === '2400' ? [m[1] + '-2400.webp', m[1] + '-1600.webp', m[1] + '-1400.webp', m[1] + '-800.webp'] : [m[1] + '-1600.webp', m[1] + '-800.webp'];
  }
  var fichier = document.getElementById('fichier');
  fichier.addEventListener('change', function(){
    var f = fichier.files && fichier.files[0]; var chemin = CIBLE; fichier.value = '';
    if (!f || !chemin) return;
    if (f.size > 15 * 1024 * 1024) { dire('${T("Image trop lourde (15 Mo au plus).")}', 'err'); return; }
    var lu = new FileReader();
    lu.onload = function(){
      occupe(chemin, true); dire('${T("Dépôt de l’image…")}');
      var autres = cheminsDe(chemin).filter(function(c){ return c !== chemin; });
      appeler('imagesboutique:remplacer', [chemin, lu.result, autres]).then(function(r){
        occupe(chemin, false);
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('${T("Image remplacée dans la boutique préparée — publiez-la depuis Publication.")}', 'bon');
        charger();
      });
    };
    lu.onerror = function(){ dire('${T("Ce fichier n’a pas pu être lu.")}', 'err'); };
    lu.readAsDataURL(f);
  });
  corps.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var b;
    if ((b = t.closest('[data-rempl]'))) { CIBLE = b.getAttribute('data-rempl'); fichier.click(); return; }
    if ((b = t.closest('[data-retab]'))) {
      var chemin = b.getAttribute('data-retab');
      szConfirmer({ titre: '${T("Rétablir l’image d’origine")}', texte: '${T("L’image remplacée est retirée de la boutique préparée ; l’image d’origine revient. À publier ensuite depuis Publication.")}', oui: '${T("Rétablir")}' })
        .then(function(oui){
          if (!oui) return;
          occupe(chemin, true);
          appeler('imagesboutique:retablir', [chemin, cheminsDe(chemin).filter(function(c){ return c !== chemin; })]).then(function(r){
            occupe(chemin, false);
            if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
            dire('${T("Image d’origine rétablie dans la boutique préparée.")}', 'bon'); charger();
          });
        });
      return;
    }
    if (t.id === 'b-retour') { basculer('col'); return; }
  });
  function basculer(v){
    VUE = v;
    document.getElementById('v-col').classList.toggle('on', v === 'col');
    document.getElementById('v-neuve').classList.toggle('on', v === 'neuve');
    dessiner();
  }
  document.getElementById('v-col').onclick = function(){ basculer('col'); };
  document.getElementById('v-neuve').onclick = function(){ basculer('neuve'); };
  window.szActualiser = function(){ charger(); };
  window.szRevenir = function(){ return charger(); };
  charger();
})();
</script></body></html>`;
}

module.exports = { pageImagesBoutique };
