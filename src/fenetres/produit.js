'use strict';

/*
 * ASSISTANT « PRODUIT » — NATIF, SEPT ÉTAPES
 * =============================================================================
 * La réécriture fidèle de l'éditeur de produit : identité, classement, tailles
 * et couleurs, prix et poids, photo, détails, stock. Écrit ici, aucune page du
 * site chargée, aucun appel web.
 *
 * ⚠ L'ENREGISTREMENT PASSE PAR `Admin._pfDoSave`, LA MÊME FONCTION QUE L'ÉDITEUR
 * DU SITE. Elle prend ses données en paramètre — elle ne lit pas le DOM — donc la
 * fenêtre native peut s'en servir telle quelle. C'est ce qui garantit que la
 * détection de conflit, le dépôt des images vers R2 et le ménage des images
 * orphelines se comportent EXACTEMENT pareil selon la fenêtre d'où l'on part.
 * Réécrire tout cela ici aurait créé une seconde façon d'enregistrer un produit,
 * qui aurait dérivé de la première au premier ajustement.
 *
 * ⚠ CE QUI N'EST PAS ICI, ET POURQUOI.
 * L'aperçu boutique de l'éditeur du site est la fiche RÉELLE, dessinée par les
 * feuilles de style de la boutique. Le reproduire ici en ferait une IMITATION —
 * et une imitation qui diverge est pire qu'aucun aperçu, parce qu'on y croit.
 * ⚠⚠ CE PARAGRAPHE A ÉTÉ CORRIGÉ LE 2026-08-20 : il disait le contraire de la
 * réalité depuis des semaines, et la déclaration de couverture le répétait.
 * L'APERÇU BOUTIQUE EST ICI, et ce n'est pas une imitation : le SITE le dessine
 * (`produit:apercu` → `Admin._pfApercuHtml` → `Shop.renderProductCard`), règles
 * CSS vivantes comprises. La génération par IA, le détourage et la teinte sont
 * ici aussi (`produit:photoIa` / `detourer` / `teinter`) : c'est toujours le site
 * qui appelle les services, avec ses clés — aucune clé ne traverse le pont — mais
 * le geste part d'ici. Il ne reste AUCUN renvoi vers l'éditeur du site.
 *
 * ⚠ LE COIN DROIT DE L'EN-TÊTE EST RÉSERVÉ AU VERROU, et à rien d'autre.
 */

const { CSS_SOCLE, JS_SOCLE } = require('./socle');

const CSS_PROPRE = `
.jetons{display:flex;flex-wrap:wrap;gap:.35rem;align-content:flex-start;
  flex:1 1 auto;min-height:0;overflow:hidden}
.jeton{display:inline-flex;align-items:center;gap:.32rem;padding:.2rem .55rem;
  border:1px solid rgba(255,255,255,.16);border-radius:99px;font-size:.82rem;
  cursor:pointer;user-select:none;height:1.75rem}
.jeton.on{background:rgba(201,169,126,.18);border-color:#c9a97e;color:#f0e4d2}
.jeton .pt{width:10px;height:10px;border-radius:50%;border:1px solid rgba(255,255,255,.3);flex:0 0 auto}
.photo{display:flex;gap:.85rem;align-items:flex-start}
/* ── LA LIGNE UNIQUE DES PHOTOS (fusion demandee le 2026-08-08) ──
   Principale et secondaires cote a cote ; la principale se reconnait a son
   contour PLEIN or et a son libelle, les secondaires restent en POINTILLE
   meme remplies. Tout se glisse : une secondaire deposee sur la principale
   prend sa place (l ancienne descend dans la ligne). */
.ligne-photos{display:flex;gap:.7rem;align-items:flex-start;flex-wrap:wrap}
.vue-principale{flex:0 0 auto;width:160px}
/* ⚠ STYLE COMPLET, pas un simple habillage : la vignette vivait dans .photo
   et ses regles (centrage flex, couleurs, curseur) etaient prefixees .photo —
   sortie du conteneur a la fusion, elle avait tout perdu et << aucune photo >>
   collait au coin (2026-08-08). */
.ligne-photos .vign{position:relative;width:160px;height:160px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;color:#8fa1b8;
  font-size:.75rem;overflow:hidden;text-align:center;cursor:pointer;
  background:#0f1826;border:2px solid #c9a97e}
.ligne-photos .vign:hover{border-color:#d8bd97}
.ligne-photos .vign img{width:100%;height:100%;object-fit:cover}
.lgd-principale{font-size:.68rem;color:#c9a97e;text-align:center;margin-top:.22rem;
  font-weight:700;text-transform:uppercase;letter-spacing:.04em}
#p-vues .vue .cadre{width:100%;height:160px}
#p-vues .cadre.pleine{border-style:dashed;border-color:rgba(255,255,255,.4)}
.cadre.survol,.vign.survol{outline:3px solid #4ade80;outline-offset:2px}
.mini-decor{display:block;width:100%;margin-top:.3rem;font-size:.72rem;
  padding:.14rem .3rem;border-radius:7px;border:1px solid rgba(255,255,255,.16);
  background:rgba(255,255,255,.05);color:#e8edf5;cursor:pointer}
.mini-decor:hover:not(:disabled){border-color:#c9a97e}
.mini-decor:disabled{opacity:.35;cursor:default}
.fonds{display:flex;gap:.4rem;flex-wrap:wrap;margin:.5rem 0}
.fonds button{display:inline-flex;align-items:center;gap:.35rem;font-size:.76rem;
  padding:.2rem .5rem;border-radius:99px;border:1px solid rgba(255,255,255,.18);
  background:rgba(255,255,255,.05);color:#e8edf5;cursor:pointer}
.fonds button.on{border-color:#c9a97e;background:rgba(201,169,126,.18);color:#f0e4d2}
.fonds .past{width:12px;height:12px;border-radius:50%;border:1px solid rgba(0,0,0,.3);flex:0 0 auto}
.modeles{display:flex;gap:.45rem;flex-wrap:wrap;margin:.4rem 0}
.modeles .md{width:64px;cursor:pointer;text-align:center}
.modeles .md .cd{height:84px;border-radius:7px;overflow:hidden;
  border:2px solid rgba(255,255,255,.16)}
.modeles .md.on .cd{border-color:#c9a97e}
.modeles .md img{width:100%;height:100%;object-fit:cover;display:block}
.modeles .md .nm{font-size:.62rem;color:#8fa1b8;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;margin-top:.1rem}
[draggable=true]{cursor:grab}
.photo .vign{position:relative;flex:0 0 auto;width:172px;height:172px;border-radius:10px;
  border:1px dashed rgba(255,255,255,.18);display:flex;align-items:center;
  justify-content:center;color:#8fa1b8;font-size:.75rem;overflow:hidden;text-align:center;
  cursor:pointer;background:#0f1826}
.photo .vign:hover{border-color:#c9a97e}
.photo .vign.pleine{border-style:solid;border-color:rgba(255,255,255,.22)}
.photo .vign img{width:100%;height:100%;object-fit:cover}
.photo .cmd{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:.45rem}
#p-coul-sug{position:absolute;top:100%;left:0;right:5.5rem;z-index:40;margin-top:2px;
  background:#16202f;border:1px solid rgba(255,255,255,.14);border-radius:9px;
  box-shadow:0 10px 28px rgba(0,0,0,.45);max-height:230px;overflow-y:auto;display:none}
#p-coul-sug.on{display:block}
#p-coul-sug .s{display:flex;align-items:center;gap:.5rem;padding:.3rem .55rem;cursor:pointer;font-size:.85rem}
#p-coul-sug .s:hover,#p-coul-sug .s.vis{background:rgba(201,169,126,.16)}
#p-coul-sug .s .pt{width:16px;height:16px;border-radius:50%;flex:0 0 auto;
  border:1px solid rgba(255,255,255,.25)}
#p-coul-sug .s .deja{margin-left:auto;font-size:.72rem;color:#8fa1b8;flex:0 0 auto}
.jeton .x{margin-left:.15rem;opacity:.55}
.jeton:hover .x{opacity:1}
.vues{display:flex;flex-wrap:wrap;gap:.5rem;align-content:flex-start;overflow:hidden}
.vue{position:relative;width:88px;flex:0 0 auto}
.vue .cadre{width:88px;height:88px;border-radius:9px;border:1px dashed rgba(255,255,255,.18);
  display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;
  background:#0f1826;color:#8fa1b8;font-size:.68rem;text-align:center;padding:.2rem}
.vue .cadre:hover{border-color:#c9a97e}
.vue .cadre.pleine{border-style:solid;border-color:rgba(255,255,255,.22)}
.vue img{width:100%;height:100%;object-fit:cover}
.vue .lgd{font-size:.68rem;color:#8fa1b8;text-align:center;margin-top:.18rem;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vue .x,.vign .x{position:absolute;top:3px;right:3px;width:20px;height:20px;padding:0;
  border-radius:50%;font-size:.78rem;line-height:1;font-weight:700;
  background:rgba(200,40,40,.94);border:1px solid rgba(255,255,255,.28);color:#fff}
.vue .x:hover,.vign .x:hover{background:#e04141;border-color:rgba(255,255,255,.5)}
/* ⚠ CINQ CADRES, UNE SEULE LIGNE, A TOUTE LARGEUR DE FENETRE. Une largeur fixe
   ne peut pas tenir les deux promesses a la fois : assez grande sur une fenetre
   large, elle passe a deux lignes des qu on la reduit — or le nombre de photos
   ne depend pas de la taille de la fenetre. Les cadres se PARTAGENT donc la
   largeur disponible ; « aspect-ratio » tient le carre, donc ils grandissent et
   se resserrent sans jamais se deformer, et « nowrap » interdit le retour a la
   ligne au lieu de compter sur la chance. */
#p-vues{flex-wrap:nowrap}
#p-vues .vue{flex:0 0 auto;width:160px;max-width:160px}
#p-vues .vue .cadre{width:100%;height:auto;aspect-ratio:1/1;font-size:.72rem}
.lgstk{display:flex;align-items:center;gap:.5rem;padding:.2rem .3rem;border-radius:6px}
.lgstk .c1{flex:0 0 4.5rem}
/* ⚠ LA COULEUR NE PREND PLUS TOUTE LA LARGEUR RESTANTE, l ENTREPOT l absorbe.
   Un nom de couleur tient en un mot ; un entrepot porte son CODE et sa
   reference — c est lui qui manquait de place, et sa liste etait coupee. */
/* ⚠ LES DEUX COLONNES SE PARTAGENT LE RESTE, a parts egales. Donner toute la
   largeur restante a l entrepot le rendait demesurement large sur une grande
   fenetre — un menu de quarante caracteres pour choisir un code de trois. Et la
   lui refuser entierement coupait sa liste. Les deux grandissent donc ensemble,
   et l entrepot est PLAFONNE : au-dela, le surplus retourne a la couleur. */
.lgstk .c2{flex:1 1 9rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lgstk .c3{flex:0 0 7.4rem;display:flex;align-items:center;gap:.35rem}
.lgstk .c3 .q{width:4.9rem;flex:0 0 auto}
.lgstk .c4{flex:1 1 12rem;max-width:22rem;min-width:0}
/* Sous le seuil : un AVERTISSEMENT, pas un refus. On peut tres bien enregistrer
   une variante juste sous son seuil — mais on doit le savoir, et savoir combien
   il en manque, sans avoir a faire la soustraction soi-meme. */
.lgstk .al{flex:0 0 auto;font-size:.86rem;line-height:1;cursor:help;color:#fbbf24}
.lgstk.entete{font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8;
  border-bottom:1px solid rgba(255,255,255,.12);padding-bottom:.3rem;margin-bottom:.25rem;flex:0 0 auto}
.lgstk:not(.entete):hover{background:rgba(255,255,255,.04)}
/* ⚠ UNE LIGNE QUI PORTE DU STOCK SE VOIT, comme dans le tableau d inventaire du
   site : on balaie la liste et l on sait ou il y a de la marchandise sans lire
   les chiffres un par un. Le site teinte a 6 % sur un fond CLAIR ; sur ce fond
   sombre la meme valeur est invisible — c est la teinte qui s adapte au fond,
   pas l intention qui change. */
.lgstk.enstock{background:rgba(34,197,94,.10)}
.lgstk.enstock:hover{background:rgba(34,197,94,.15)}
.lgstk.enstock .c1,.lgstk.enstock .c2{color:#86efac;font-weight:600}
/* ⚠ EMPLACEMENT OBLIGATOIRE DES QUE LA QUANTITE DEPASSE ZERO — et depuis le
   2026-08-08, une CREATION exige au moins une variante avec une quantite
   (une fiche entiere a zero se creait sans un mot). Sans ce rappel on
   enregistre de la marchandise que l inventaire ne sait pas ou aller
   chercher. */
.lgstk select.manque{border-color:#f87171}
.theque{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:.5rem;
  max-height:46vh;overflow-y:auto;padding-right:.2rem}
.theque .ph{cursor:pointer;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,.12);
  background:#0f1826}
.theque .ph:hover{border-color:#c9a97e}
.theque .ph img{width:100%;height:88px;object-fit:cover;display:block}
.theque .ph .lg{font-size:.66rem;color:#8fa1b8;padding:.16rem .25rem;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis}
/* Le code de l article qui se sert deja de la photo — en couleur d accent, pour
   qu il se distingue du code de la photo elle-meme juste au-dessus. */
.theque .ph .lg.sku{color:#c9a97e;font-weight:700;padding-top:0;
  font-family:ui-monospace,Consolas,monospace}
.theque .ph .lg.libre{color:#4ade80;padding-top:0}
.avis{display:none;font-size:.74rem;line-height:1.4;color:#fbbf24;margin-top:.3rem}
.avis.on{display:block}
.voile{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;
  background:rgba(8,12,18,.6);padding:1.2rem}
.voile .boite{width:100%;max-width:460px;background:#16202f;border:1px solid rgba(255,255,255,.1);
  border-radius:12px;padding:1rem 1.1rem;box-shadow:0 24px 64px rgba(0,0,0,.5)}
.voile h3{margin:0 0 .5rem;font:700 1rem/1.3 Georgia,serif;color:#fca5a5}
.voile p{margin:0 0 .7rem;font-size:.86rem;line-height:1.5;color:#cbd8e6}
.voile .pied2{display:flex;justify-content:flex-end;gap:.45rem;margin-top:.8rem}
.cote{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;align-items:start}
.cote .grille{grid-template-columns:repeat(2,minmax(0,1fr))}
.prixgrille{display:grid;grid-template-columns:repeat(3,1fr);gap:.65rem .9rem;align-items:start}
@media (max-width:980px){.cote{grid-template-columns:1fr}}
.prixgrille .ch label{display:flex;align-items:center;gap:.4rem}
.pastille{margin-left:auto;padding:.06rem .4rem;border-radius:99px;background:#c9a97e;
  color:#17202c;font-size:.7rem;font-weight:700;display:none}
.pastille.on{display:inline-block}
.rabais{display:flex;gap:.28rem;flex-wrap:wrap;margin-top:.35rem}
.rabais button{padding:.14rem .4rem;font-size:.72rem;border-radius:6px}
.rabais button.on{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
@media (max-width:700px){.prixgrille{grid-template-columns:1fr}}
.paire{display:flex;gap:.4rem;align-items:center}
.paire input{flex:1 1 auto}
.paire select{flex:0 0 5rem}
.stk{width:100%;border-collapse:collapse}
.stk th{font-size:.69rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8;
  text-align:left;padding:.22rem .35rem;border-bottom:1px solid rgba(255,255,255,.1)}
.stk td{padding:.14rem .35rem;border-bottom:1px solid rgba(255,255,255,.05)}
.stk input,.stk select{padding:.18rem .35rem;font-size:.83rem}
.stk .q{width:5rem}
.bascules{display:flex;flex-direction:column;gap:.45rem}
/* ⚠ LES OUTILS SE POSENT APRES LE TITRE, JAMAIS AU COIN DROIT — celui-la est
   reserve au verrou (.sous, qui garde son margin-left:auto). */
.tete .outils{display:flex;align-items:center;gap:.3rem;flex:0 0 auto}
.tete .outils button{padding:.14rem .45rem;font-size:.78rem;line-height:1.35}
.tete .outils .n{font-variant-numeric:tabular-nums;font-weight:700}
/* Journal des modifications — une boite qui SE LIT, donc elle peut defiler : la
   regle « aucun defilement » vise les etapes du formulaire, pas la consultation
   d une liste dont on ne connait pas la longueur (meme choix que .theque). */
.jrn{max-height:52vh;overflow-y:auto;padding-right:.2rem;text-align:left}
.jrn .sec{display:flex;align-items:center;gap:.4rem;margin:.5rem 0 .5rem}
.jrn .sec .t{font-size:.66rem;font-weight:800;letter-spacing:.06em;
  text-transform:uppercase;color:#c9a97e;flex:0 0 auto}
.jrn .sec .tr{flex:1 1 auto;height:1px;background:rgba(255,255,255,.12)}
.jrn .bl{padding:.5rem .6rem;border:1px solid rgba(255,255,255,.1);border-radius:8px;
  background:#0f1826;margin-bottom:.45rem}
.jrn .bl.cliq{cursor:pointer;user-select:none}
.jrn .bl.cliq:hover{border-color:rgba(201,169,126,.45)}
.jrn .et{font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;
  color:#8fa1b8;margin-bottom:.15rem}
.jrn .dif{display:flex;align-items:center;gap:.4rem;font-size:.82rem;flex-wrap:wrap}
.jrn .dif .av{color:#8fa1b8;text-decoration:line-through;opacity:.75;word-break:break-word}
.jrn .dif .fl{color:#c9a97e;flex:0 0 auto}
.jrn .dif .ap{color:#e8edf5;font-weight:600;word-break:break-word}
.jrn .qd{display:flex;justify-content:space-between;align-items:center;gap:.4rem;
  font-size:.68rem;color:#8fa1b8;margin-bottom:.35rem}
.jrn .qui{margin-top:.45rem;padding-top:.4rem;border-top:1px dashed rgba(255,255,255,.14);
  font-size:.72rem;color:#8fa1b8;line-height:1.5}
.jrn .an{font-size:.72rem;font-weight:800;letter-spacing:.06em;color:#c9a97e;
  text-transform:uppercase;margin:.2rem 0 .5rem;border-bottom:1px solid rgba(255,255,255,.12);
  padding-bottom:.3rem}
.jrn .fin{font-size:.7rem;color:#8fa1b8;text-align:center;line-height:1.45;margin-top:.5rem}
.jrn .lien{color:#c9a97e;text-decoration:none;font-weight:600;cursor:pointer}
`;

/** Page complète de l'assistant. `id` vide = création. */
function pageProduit(id) {
  const ident = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Produit — Administration Sandriza</title>
<style>${CSS_SOCLE}${CSS_PROPRE}</style></head><body>
<div class="tete"><span class="ic">🧵</span><h1 id="titre">Produit</h1>
  <span class="outils">
    <button type="button" id="btn-jrn" title="Modifications de cette fiche" style="display:none"><span class="ic">🕘</span> <span class="n" id="jrn-n">0</span></button>
    <button type="button" id="btn-apercu" title="Aperçu boutique — dessiné par le site, avec ses vraies fonctions"><span class="ic">👁</span> Aperçu</button>
  </span>
  <span class="sous" id="sous"></span></div>
<div class="pas" id="pas"></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions">
    <button id="btn-prec">Précédent</button>
    <button id="btn-suiv">Suivant</button>
    <button id="btn-annuler">Annuler</button>
    <button id="btn-enr" class="prim" disabled>Enregistrer</button>
  </span></div>
<script>
(function(){
  'use strict';
  ${JS_SOCLE}
  MOTIFS.prix_invalide  = 'Le prix doit être supérieur à zéro.';
  MOTIFS.cout_requis    = 'Le coût d’acquisition est obligatoire.';
  MOTIFS.poids_requis   = 'Le poids unitaire est obligatoire.';
  // Les motifs du DOUBLE FILET du pont (produit:enregistrer). Les gardes
  // locales les attrapent avant lui en temps normal : s’ils arrivent ici,
  // c’est qu’une garde a été contournée — ils doivent avoir une phrase,
  // sinon le socle dirait « Erreur inattendue » sur un refus légitime.
  MOTIFS.photo_requise = 'La photo principale est obligatoire.';
  MOTIFS.tailles_couleurs_requises = 'Choisissez au moins une taille ET une couleur.';
  MOTIFS.emplacement_requis = 'Un emplacement d’entrepôt manque pour des variantes en stock.';
  MOTIFS.stock_requis = 'Saisissez une quantité pour au moins une variante.';
  MOTIFS.couleur_non_mappee = 'Cette couleur n’a pas de teinte unie attribuée.';
  MOTIFS.non_enregistre = 'La fiche n’a PAS été enregistrée. Voyez l’avis dans la fenêtre principale — le plus souvent, un collègue vient de modifier la même fiche.';

  var ID   = ${ident};
  var bEnr = document.getElementById('btn-enr');
  var sous = document.getElementById('sous');
  var CTX = null, FICHE = null, IMAGE = '', STOCK = {}, LOCS = {}, PAGI = null;
  // ⚠ CES DEUX-LA ETAIENT DEJA ENVOYES AU PONT MAIS JAMAIS REMPLIS : la fenetre
  // expediait deux objets vides, et modifier une fiche depuis l application lui
  // FAISAIT PERDRE ses photos par couleur. Un defaut qui ne se voit pas a
  // l enregistrement — il se decouvre plus tard, sur la boutique.
  var VUES = {};      // { 'vue-2': dataUrl | url, … }
  var PARCOUL = {};   // { 'Noir': { principale: dataUrl | url }, … }
  // ⚠ LES VUES SUIVENT LA CATEGORIE, comme dans l editeur du site. Une categorie
  // en mode « standard » demande une serie de vues sans couleur ; les autres
  // demandent des vues par ANGLE plus une photo par couleur. Ce reglage vit dans
  // Inventaire → Categories : si la fenetre en decidait autrement, deux ecrans du
  // meme produit ne demanderaient pas les memes photos.
  var ANGLES = { devant: 'Devant', derriere: 'Derrière', coteG: 'Côté gauche', coteD: 'Côté droit', autres: 'Autre' };
  function modeStandard(){
    var c = val('p-cat');
    return !!(c && CTX.modesPhoto && CTX.modesPhoto[c] === 'standard');
  }
  // ⚠ ABSENTE = ACTIVÉE, la règle de l’éditeur du site (_catHasAiColorGen) :
  // une catégorie qui n’a jamais réglé aiColorGen est en mode auto. Un site
  // antérieur à couleursAuto ne l’envoie pas — même défaut, même résultat.
  function modeAutoCouleur(){
    var c = val('p-cat');
    if (!c || !CTX.couleursAuto) return true;
    return CTX.couleursAuto[c] !== false;
  }
  // ⚠ EN MODE MANUEL, LES PHOTOS N ONT PAS DE ROLE FIXE. La categorie dit
  // « manuel » justement parce que ces articles ne se photographient pas selon
  // des angles convenus : imposer cinq cases nommees aurait redonne la
  // contrainte que le reglage sert a lever. On ajoute autant de photos qu il en
  // faut, et l ordre est celui de l ajout.
  function clesVues(){
    if (modeStandard()) {
      var n = Object.keys(VUES).filter(function(k){ return k.indexOf('libre') === 0; }).length;
      var l = [];
      // Une case vide au bout TANT QU IL RESTE DE LA PLACE : en proposer une
      // sixieme laisserait croire qu on peut depasser, et le refus arriverait
      // apres avoir choisi le fichier.
      var max = Math.min(n + 1, MAX_PHOTOS);
      for (var i = 1; i <= max; i++) l.push('libre' + i);
      return l;
    }
    return (CTX.vuesAngles || ['devant', 'derriere', 'coteG', 'coteD', 'autres']);
  }
  function nomVue(k){ return ANGLES[k] || ('Photo ' + String(k).replace(/^libre/, '')); }

  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function vide(titre, detail){
    document.getElementById('corps').innerHTML =
      '<div class="vide"><div class="gros">' + esc(titre) + '</div><div>' + esc(detail || '') + '</div></div>';
    document.getElementById('pas').innerHTML = '';
    ['btn-enr','btn-prec','btn-suiv'].forEach(function(b){ document.getElementById(b).disabled = true; });
  }

  function ch(id, lbl, o){
    o = o || {};
    return '<div class="ch' + (o.large ? ' large' : '') + '">'
      + '<label for="' + id + '">' + esc(lbl) + (o.requis ? ' <span class="req">*</span>' : '') + '</label>'
      + (o.multi ? '<textarea id="' + id + '" rows="' + (o.rows || 4) + '"></textarea>'
                 : '<input id="' + id + '" type="' + (o.argent ? 'text' : (o.type || 'text')) + '"'
                   + (o.argent ? ' inputmode="decimal" class="argent"' : '')
                   + (o.pas ? ' step="' + o.pas + '"' : '') + (o.min !== undefined ? ' min="' + o.min + '"' : '')
                   + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') + '>')
      + '</div>';
  }
  function sel(id, lbl, opts, o){
    o = o || {};
    return '<div class="ch' + (o.large ? ' large' : '') + '">'
      + '<label for="' + id + '">' + esc(lbl) + (o.requis ? ' <span class="req">*</span>' : '') + '</label>'
      + '<select id="' + id + '">'
      + opts.map(function(x){ return '<option value="' + esc(x.v) + '">' + esc(x.l) + '</option>'; }).join('')
      + '</select></div>';
  }
  function bascule(id, lbl){
    return '<label style="display:flex;align-items:center;gap:.45rem;font-size:.86rem;cursor:pointer">'
      + '<input type="checkbox" id="' + id + '">' + esc(lbl) + '</label>';
  }
  var rien = [{ v: '', l: 'Non précisé' }];
  function opt(l, cV, cL){ return l.map(function(x){ return { v: x[cV], l: x[cL] }; }); }

  function dessiner(){
    var h = [];

    // 1 — Identité ET classement (fusionnées : elles décrivent la même chose,
    // et les séparer obligeait à un aller-retour pour une poignée de listes).
    h.push('<div class="etape">'
      + '<div class="carte"><h2>Identification</h2><div class="grille">'
      + ch('p-nom', 'Nom du produit', { requis: true, large: true, placeholder: 'Ex : Robe fleurie été' })
      + sel('p-cat', 'Catégorie', rien.concat(opt(CTX.categories, 'cle', 'libelle')), { requis: true })
      // ⚠ LE SKU EST VISIBLE, en lecture seule. Un code attribué « quelque part
      // plus tard » ne peut ni être lu, ni recopié sur une étiquette, ni
      // vérifié. Il se calcule dès que la catégorie est choisie.
      + '<div class="ch"><label for="p-sku">Code (SKU)</label>'
      + '<input id="p-sku" readonly style="font-family:ui-monospace,Consolas,monospace;'
      + 'background:#0b1220;color:#c9a97e" placeholder="choisissez une catégorie"></div>'
      + ch('p-marque', 'Marque')
      // Le poids appartient a l identite du vetement, pas au prix : c est une
      // caracteristique de l article, et il tenait seul dans une carte entiere.
      + '<div class="ch"><label for="p-poids">Poids unitaire <span class="req">*</span></label>'
      + '<div class="paire"><input id="p-poids" type="number" step="0.001" min="0" placeholder="Ex : 350">'
      + '<select id="p-unite"><option value="g">g</option><option value="kg">kg</option>'
      + '<option value="lb">lb</option></select></div>'
      + '<div class="aide" style="margin-top:.2rem">Sert au calcul des frais d’expédition.</div></div>'
      + '<div class="ch large"><label for="p-desc">Description'
      + '<span id="p-desc-etat" style="float:right;color:#8fa1b8;font-size:.72rem"></span></label>'
      + '<textarea id="p-desc" rows="3"></textarea>'
      // La redaction par IA passe par le PONT : la fenetre envoie la photo et les
      // renseignements, le SITE interroge le service avec sa cle. Rien ne sort
      // d ici, aucune cle ne voyage.
      + '<div style="margin-top:.35rem">'
      + '<button type="button" id="p-ia">✨ Rédiger avec l’IA</button></div></div>'
      + '</div></div>'
      + '<div class="cote">'
      + '<div class="carte"><h2>Classement</h2><div class="grille">'
      + sel('p-genre', 'Genre', rien.concat(opt(CTX.genres, 'cle', 'libelle')))
      + sel('p-age', 'Groupe d’âge', rien.concat(opt(CTX.groupesAge, 'cle', 'libelle')))
      + sel('p-style', 'Style', rien.concat(opt(CTX.styles, 'cle', 'libelle')))
      + sel('p-guide', 'Guide des tailles', rien.concat(opt(CTX.guides, 'id', 'nom')))
      + sel('p-etiq', 'Étiquette', [{ v: '', l: 'Aucune' }, { v: 'Populaire', l: 'Populaire' },
            { v: 'Solde', l: 'Solde' }].concat(opt(CTX.etiquettes, 'cle', 'libelle')))
      + sel('p-fourn', 'Fournisseur', rien.concat(opt(CTX.fournisseurs, 'id', 'nom')))
      + '</div></div>'
      + '<div class="carte"><h2>Prix</h2>'
      + '<div class="prixgrille">'
      + ch('p-prix', 'Prix de vente ($)', { requis: true, argent: true })
      + '<div class="ch"><label for="p-solde">Prix soldé ($)'
      + '<span id="p-pastille" class="pastille"></span></label>'
      + '<input id="p-solde" type="text" inputmode="decimal" class="argent" placeholder="aucun">'
      + '<div id="p-rabais" class="rabais"></div></div>'
      + ch('p-cout', 'Coût d’acquisition ($)', { requis: true, argent: true })
      + '</div>'
      + '<div class="aide" id="p-marge" style="margin-top:.5rem"></div>'
      + '<div id="p-alerte" style="display:none;color:#f87171;font-size:.78rem;margin-top:.4rem"></div></div>'
      + '</div></div>');

    // 3 — Tailles et couleurs
    h.push('<div class="etape">'
      + '<div class="carte"><h2>Tailles offertes</h2><div class="jetons" id="p-tailles">'
      + (CTX.tailles.length
          ? CTX.tailles.map(function(t){ return '<span class="jeton" data-t="' + esc(t) + '">' + esc(t) + '</span>'; }).join('')
          : '<span class="aide">Aucune taille au référentiel.</span>')
      + '</div></div>'
      + '<div class="carte plein"><h2>Couleurs offertes</h2>'
      // ⚠ UNE RECHERCHE, PAS UN MUR DE JETONS. Le moteur de couleurs en propose
      // des centaines : les afficher toutes etait impossible, et c est
      // exactement pour cela que l editeur du site propose une recherche.
      // Les jetons montrent les couleurs CHOISIES ; la recherche sert a en
      // ajouter, du referentiel ou hors referentiel.
      + '<div class="rech" style="margin-bottom:.4rem;position:relative">'
      + '<input id="p-coul-libre" autocomplete="off" placeholder="Chercher une couleur, ou en saisir une nouvelle…">'
      + '<button type="button" id="p-coul-add">Ajouter</button>'
      + '<div id="p-coul-sug"></div></div>'
      + '<div class="jetons" id="p-couleurs"></div>'
      + '<div class="aide" id="p-coul-vide" style="margin-top:.3rem">Aucune couleur choisie.</div>'
      + '</div></div>');

    // 5 — Photos : principale, vues supplémentaires, et par couleur
    h.push('<div class="etape">'
      // ⚠ LA VIGNETTE EST LE CONTROLE, plus un bouton a cote d elle. Un bouton
      // « Retirer » pose sous la carte n indique pas a quelle photo il
      // s applique, et il occupait la place d une action principale pour un
      // geste secondaire. On clique la photo pour la choisir, on clique la
      // pastille rouge de son coin pour la retirer — la ou l oeil est deja.
      /* ⚠ COTE A COTE, SANS TEXTE D AIDE (demande le 2026-08-07) : la vignette
         principale laissait toute sa moitie droite vide, et les deux phrases
         d explication n apprenaient rien apres la premiere utilisation. Le
         MAXIMUM, seul renseignement qui compte, vit dans le TITRE. */
      + '<div class="carte"><h2 id="p-vues-titre">Photos</h2>'
      + '<div class="ligne-photos">'
      + '<div class="vue-principale">'
      + '<div class="vign" id="p-vign" title="Photo principale — cliquer pour choisir, ou déposer une secondaire ici">choisir une photo</div>'
      + '<div class="lgd-principale">Photo principale</div>'
      + '<button type="button" id="p-detourer" class="mini-decor" disabled '
      + 'title="Détourer la photo et poser un décor (studio, jardin, Paris…)">✂ Décor</button>'
      + '<button type="button" id="p-mannequin" class="mini-decor" disabled '
      + 'title="Faire porter le vêtement par un modèle (IA Fal.ai — chaque génération consomme des crédits)">✨ Mannequin IA</button></div>'
      + '<div class="vues" id="p-vues"></div>'
      + '</div></div>'
      /* ⚠ DEUX MODES, DÉCIDÉS PAR LA CATÉGORIE, comme l’éditeur du site :
         AUTO (aiColorGen) = les variantes se GÉNÈRENT en teintant les photos
         du produit au canevas — par le site, via le pont — et se régénèrent à
         l’enregistrement ; MANUEL = on dépose une photo par couleur. La
         1ʳᵉ couleur n’a jamais de variante : ses photos SONT celles du
         produit (la boutique ne lit une variante que pour les autres). */
      + '<div class="carte plein"><h2 id="p-parcoul-titre">Photo par couleur</h2>'
      + '<div class="aide" id="p-parcoul-aide" style="margin-bottom:.5rem"></div>'
      + '<div class="vues" id="p-parcoul"></div>'
      + '<div style="margin-top:.5rem"><button type="button" id="p-cv-gen" style="display:none" '
      + 'title="Teinter les photos du produit pour chaque couleur — local, sans crédit ni service">'
      + '⚡ Tout générer</button></div></div></div>');

    // 6 — Détails
    // ⚠ LE REGIME DE VENTE N EST PAS UN JEU DE CASES INDEPENDANTES. Mes cases
    // permettaient « vente finale ET aucun retour ET liquidation » — une
    // combinaison que l editeur du site ne peut pas produire et que la boutique
    // ne sait pas afficher. D ou deux menus dont les valeurs se contraignent.
    h.push('<div class="etape"><div class="carte"><h2>Mise en marché</h2><div class="bascules">'
      + bascule('p-actif', 'Produit actif (visible en boutique)')
      // ⚠ DEUX CONTROLES, LES MEMES QUATRE ETATS QU AVANT. Un menu unique
      // melangeait deux questions sans rapport : comment l article est mis en
      // marche, et si la cliente peut le retourner. Rien ne disait que
      // << Vente finale >> excluait les retours — il fallait le savoir.
      // Combinaisons : normal+retour, normal+aucun, liquidation, vente finale.
      // Soit les quatre d origine, ni plus ni moins.
      + '<div class="cote" style="margin-top:.3rem">'
      + '<div class="ch"><label for="p-regime">Régime de vente</label>'
      + '<select id="p-regime">'
      + '<option value="normal"><span class="ic">🛍</span> Normal</option>'
      + '<option value="liq"><span class="ic">🟡</span> Liquidation</option>'
      + '<option value="final"><span class="ic">🔴</span> Vente finale</option>'
      + '</select></div>'
      + '<div class="ch"><label for="p-retours">Retours</label>'
      + '<select id="p-retours">'
      + '<option value="ok">✅ Acceptés</option>'
      + '<option value="aucun"><span class="ic">🚫</span> Aucun retour</option>'
      + '</select></div>'
      + '</div>'
      // ⚠ DEUX ENCARTS RETIRES le 2026-08-07, a la demande : ils EXPLIQUAIENT ce
      // que l ecran montrait deja. Un champ grise et desactive dit tout seul qu il
      // est impose ; lui ajouter << Impose par le regime de vente choisi >> ne
      // renseigne personne et occupe la place utile. Meme chose pour le paragraphe
      // sur l etiquette de mise en marche : le champ Etiquette se vide sous les
      // yeux, ce qui est plus clair que trois lignes pour le dire.
      // ⚠ « VENTE FINALE, MAIS RETOUR ACCEPTE MALGRE TOUT » A ETE RETIRE, et il
      // n aurait jamais du reapparaitre ici. Le site a ABANDONNE ce reglage :
      // admin.js le dit explicitement (<< finalSaleReturnOk n a donc plus de
      // mode qui le mette a true, ancien mode liq_ok retire >>) et ses trois
      // modes le forcent tous a false. Cette fenetre etait devenue le SEUL
      // endroit du projet capable de le remettre a vrai — donc de produire une
      // fiche que l editeur du site ne sait pas representer, et dont la boutique
      // afficherait deux promesses contraires a la meme cliente.
      + '</div></div>'
      // ⚠ « Repères » retire a la demande. L emoji et la couleur d accent ne
      // servent qu au rendu interne des listes ; les demander a la creation d un
      // produit occupait une carte entiere pour deux reglages qu on ne touche
      // jamais. Le SEUIL, lui, reste : il declenche les alertes de stock.
      + '<div class="carte"><h2>Alerte et limites</h2><div class="grille">'
      + ch('p-seuil', 'Seuil d’alerte', { type: 'number', min: 0, pas: '1' })
      // ⚠ LIMITE PAR CLIENT (2026-08-08) : toutes commandes confondues, par
      // adresse courriel — le cumul est tranché par le SERVEUR à la caisse
      // (client_limit_check). Vide = aucune limite propre au produit.
      // ⚠ SANS texte d aide (retire a la demande, 2026-08-08) : l explication
      // vit dans l INFOBULLE, comme le veut la regle des encarts qui expliquent
      // ce que l ecran montre deja.
      + '<div class="ch"><label for="p-limclient">Limite par client</label>'
      + '<input id="p-limclient" type="number" min="1" step="1" placeholder="aucune" '
      + 'title="Unités de ce produit qu’un même client peut acheter, toutes commandes confondues (par adresse courriel)."></div>'
      + '</div></div></div>');

    // 7 — Stock
    h.push('<div class="etape"><div class="carte plein" id="p-zone"><h2>Stock par variante</h2>'
      // ⚠ LA REGLE DE L EDITEUR DU SITE, DITE ICI AUSSI. Sans entrepot configure,
      // la colonne disparaissait sans un mot : on saisissait des quantites en
      // croyant l emplacement facultatif, alors qu il est obligatoire des que la
      // quantite depasse zero.
      + (CTX.entrepots.length
          ? '<div class="aide" style="margin:-.2rem 0 .5rem">Au moins une variante doit porter '
            + 'une quantité, et un emplacement d’entrepôt est obligatoire dès qu’une quantité '
            + 'dépasse zéro.</div>'
          : '<div class="aide" style="margin:-.2rem 0 .5rem;color:#fbbf24">⚠ Aucun emplacement '
            + 'configuré — créez-en un dans Inventaire → Entrepôt pour pouvoir en assigner un aux '
            + 'variantes en stock.</div>')
      + '<div class="rech"><input placeholder="Filtrer par taille ou couleur…"><span class="cpt" id="p-somme"></span></div>'
      + '<div class="lgstk entete"><span class="c1">Taille</span><span class="c2">Couleur</span>'
      + '<span class="c3">Quantité</span><span class="c4">Entrepôt</span></div>'
      + '<div class="liste"></div><div class="pagi"></div></div></div>');

    document.getElementById('corps').innerHTML = h.join('');
    brancher();
    if (FICHE) remplir(FICHE);
    else {
      document.getElementById('p-actif').checked = true;
      poser('p-seuil', String(CTX.seuilDefaut));
      poser('p-regime', 'normal');
      poser('p-retours', 'ok');
      // Une categorie deja choisie n emet aucun evenement : on demande le code
      // des l ouverture, sinon il n arrive qu au premier changement.
      if (val('p-cat')) majSku();
    }
    dessinerJetons();
    majMarge();

    Assist.poser([
      // ⚠ Les obligations du prix rejoignent la PREMIERE etape avec ses champs :
      // une etape ne peut pas exiger un champ qui vit ailleurs — le fil dirait
      // « incomplet » sur une etape ou rien ne manque a l ecran.
      { t: 'Identité, prix et poids', obl: ['p-nom', 'p-cat', 'p-poids', 'p-prix', 'p-cout'] },
      { t: 'Tailles et couleurs',     obl: [] },
      { t: 'Photo',                   obl: [] },
      { t: 'Mise en marché',          obl: [] },
      { t: 'Stock',                   obl: [] }
    ], function(i){ if (i === 2) dessinerVues(); if (i === 4) majStock(); });

    bEnr.disabled = !(ID ? CTX.peutModifier : CTX.peutAjouter);
    if (bEnr.disabled) dire('Consultation seulement — votre rôle ne permet pas d’enregistrer.', 'att');
  }

  function brancher(){
    document.getElementById('corps').addEventListener('click', function(ev){
      var x = ev.target.closest('[data-coulretire]');
      if (x) { retirerCouleur(x.getAttribute('data-coulretire')); return; }
      // Les TAILLES restent des jetons a bascule ; les COULEURS sont une liste
      // qu on alimente par la recherche, donc leurs jetons ne basculent plus.
      var j = ev.target.closest('#p-tailles .jeton');
      if (j) j.classList.toggle('on');
    });
    ['p-prix', 'p-cout', 'p-solde'].forEach(function(i){
      var e = document.getElementById(i); if (!e) return;
      e.onfocus = function(){ argentFocus(this); };
      e.onblur  = function(){ argentBlur(this); this.classList.remove('manque'); };
      e.oninput = majMarge;
    });
    ['p-nom', 'p-cat', 'p-poids'].forEach(function(i){
      var e = document.getElementById(i);
      if (e) e.oninput = e.onchange = function(){ this.classList.remove('manque'); Assist.fil(); majNom(); };
    });
    var nm = document.getElementById('p-nom');
    if (nm) nm.setAttribute('maxlength', '70');
    majNom();
    var bIa = document.getElementById('p-ia');
    if (bIa) bIa.onclick = rediger;
    majIa();
    // Le SKU suit la categorie — sauf sur une fiche existante, dont le code est
    // deja attribue : le recalculer lui en donnerait un autre a chaque ouverture.
    // ⚠ CHANGER L UNITE NE CHANGE PAS LE POIDS. Passer de « 350 g » a « kg »
    // doit donner « 0.35 », pas « 350 kg ». Sans cette conversion, on croit
    // corriger une unite et l on multiplie le poids par mille — les frais
    // d expedition suivent.
    var uni = document.getElementById('p-unite');
    if (uni) {
      uni.dataset.prec = uni.value;
      uni.onchange = function(){
        var v = parseFloat(val('p-poids')) || 0;
        if (v > 0) {
          var kg = enKg(v, this.dataset.prec || 'g');
          var n = (this.value === 'kg') ? kg : (this.value === 'lb') ? kg / 0.45359237 : kg * 1000;
          poser('p-poids', String(Math.round(n * 1000) / 1000));
        }
        this.dataset.prec = this.value;
      };
    }
    // ⚠ « VENTE FINALE » (1) ET « LIQUIDATION » (3) RETIRENT L ETIQUETTE, pas
    // « aucun retour » (4) : ce dernier bloque les retours sans etre un mode de
    // solde, et son etiquette marketing reste donc legitime. Confondre les trois
    // aurait efface une etiquette voulue.
    // ⚠ LE CHAMP « RETOURS » EST UN MIROIR DE LA CONSEQUENCE, PAS UN 2e REGLAGE.
    // Sur liquidation ou vente finale, il affiche << Aucun retour >>, se grise et
    // se desactive : ces regimes excluent deja les retours par finalSale et
    // liquidation, que la boutique lit depuis toujours.
    // ⚠ ET noReturn N EST PAS FORCE A VRAI POUR AUTANT. Il ne vaut vrai que
    // dans le cas << normal + aucun retour >>, exactement comme avant : l ecrire
    // aussi pour la liquidation reecrirait des donnees que personne n a demande
    // de changer, et la colonne aucun_retour de l export CSV s en trouverait
    // modifiee sur tout le catalogue. Ce qui change, c est ce qu on MONTRE.
    var reg = document.getElementById('p-regime');
    var ret = document.getElementById('p-retours');
    if (reg) reg.onchange = majRegime;
    if (ret) ret.onchange = majRegime;
    majRegime();
    var cat = document.getElementById('p-cat');
    if (cat) cat.addEventListener('change', function(){ if (!ID) majSku(); dessinerVues(); });
    var rab = document.getElementById('p-rabais');
    if (rab) rab.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-pct]'); if (!b || b.disabled) return;
      var pr = argentNombre(val('p-prix')) || 0;
      if (!pr) return;
      // ⚠ RECLIQUER SUR LE RABAIS ACTIF LE RETIRE. Sans cela, il fallait vider le
      // champ a la main pour revenir au plein prix — et l on garde un solde qu on
      // ne voulait plus, sans s en apercevoir.
      if (b.classList.contains('on')) { poser('p-solde', ''); majMarge(); return; }
      poser('p-solde', (pr * (1 - parseInt(b.getAttribute('data-pct'), 10) / 100)).toFixed(2) + ' $');
      majMarge();
    });
    document.getElementById('corps').addEventListener('click', function(ev){
      // ⚠ LA PASTILLE DE RETRAIT SE TESTE AVANT LE CADRE QUI LA PORTE. Elle est
      // DANS la vignette : chercher le cadre d abord aurait rouvert le selecteur
      // au moment ou l on voulait retirer la photo.
      if (ev.target.closest('#p-vider')) {
        IMAGE = ''; montrerImage(''); majIa(); dire('');
        return;
      }
      if (ev.target.closest('#p-detourer')) { ouvrirDetourage(); return; }
      if (ev.target.closest('#p-mannequin')) { ouvrirMannequin(); return; }
      if (ev.target.closest('#p-cv-gen')) { genererVariantes(); return; }
      if (ev.target.closest('#p-vign')) {
        choisirPhoto(function(ds){ IMAGE = ds[0]; montrerImage(IMAGE); majIa(); });
        return;
      }
      var c = ev.target.closest('[data-vue]');
      if (c) {
        var k = c.getAttribute('data-vue');
        // Les cases NOMMEES (angles) prennent une photo chacune ; les cases
        // LIBRES du mode manuel se remplissent en serie.
        var libre = k.indexOf('libre') === 0;
        choisirPhoto(function(ds){
          if (!libre) { VUES[k] = ds[0]; dessinerVues(); return; }
          var deja = Object.keys(VUES).filter(function(x){ return x.indexOf('libre') === 0; }).length;
          var place = Math.max(0, MAX_PHOTOS - deja);
          if (ds.length > place) {
            dire('Maximum ' + MAX_PHOTOS + ' photos supplémentaires — '
              + (ds.length - place) + ' ignorée(s).', 'att');
          }
          ds.slice(0, place).forEach(function(d, i){ VUES['libre' + (deja + i + 1)] = d; });
          dessinerVues();
        }, libre);
        return;
      }
      var x = ev.target.closest('[data-vuex]');
      if (x) { delete VUES[x.getAttribute('data-vuex')]; dessinerVues(); return; }
      var p = ev.target.closest('[data-coul]');
      if (p) {
        var n = p.getAttribute('data-coul');
        // ⚠ « main », JAMAIS « principale » : la boutique lit main (et les clés
        // d’angle) dans colorVariants. La fenêtre a déposé sous « principale »
        // de 1.40.1 à 1.43.0 — des photos enregistrées que la boutique
        // n’affichait jamais. Le pont traduit encore l’ancienne clé, mais plus
        // personne ne doit l’écrire.
        choisirPhoto(function(ds){
          PARCOUL[n] = PARCOUL[n] || {};
          PARCOUL[n].main = ds[0];
          delete PARCOUL[n].principale;
          dessinerVues();
        });
        return;
      }
      var px = ev.target.closest('[data-coulx]');
      if (px) { delete PARCOUL[px.getAttribute('data-coulx')]; dessinerVues(); }
    });
    var ca = document.getElementById('p-coul-add');
    if (ca) ca.onclick = function(){ ajouterCouleur(); };
    var cl = document.getElementById('p-coul-libre');
    if (cl) {
      cl.oninput = function(){ chercher(this.value); };
      cl.onkeydown = function(ev){
        if (ev.key === 'ArrowDown') { ev.preventDefault(); viser(1); return; }
        if (ev.key === 'ArrowUp')   { ev.preventDefault(); viser(-1); return; }
        if (ev.key === 'Escape')    { if (SUG.length) { ev.stopPropagation(); cacherSug(); } return; }
        if (ev.key === 'Enter') {
          ev.preventDefault();
          // Entree prend la suggestion visee si elle existe, la saisie sinon :
          // c est ce qui permet d ajouter une couleur qui n est pas au catalogue.
          ajouterCouleur(SUG.length && SUGi >= 0 ? SUG[SUGi].nom : null);
        }
      };
      cl.onblur = function(){ setTimeout(cacherSug, 160); };
    }
    var zs = document.getElementById('p-coul-sug');
    if (zs) zs.addEventListener('mousedown', function(ev){
      var e = ev.target.closest('[data-sug]'); if (!e) return;
      ev.preventDefault(); ajouterCouleur(e.getAttribute('data-sug'));
    });
  }

  // ⚠ La marge se calcule sur le prix REELLEMENT paye : un solde actif remplace
  // le prix de vente. L afficher sur le prix barre donnerait une marge que
  // personne n encaisse.
  // Le prochain code libre pour la categorie choisie. "configure: false" veut
  // dire qu aucun prefixe n est defini pour cette categorie : on le DIT, au lieu
  // de laisser un champ vide qui ressemble a un chargement qui n arrive jamais.
  function majSku(){
    var c = val('p-cat');
    if (!c) { poser('p-sku', ''); return; }
    var e = document.getElementById('p-sku');
    if (e) e.placeholder = 'calcul du code…';
    P.appeler('produit:sku', c).then(function(r){
      if (!e) return;
      // ⚠ UN ECHEC NE DOIT PAS VIDER LE CHAMP EN SILENCE. C est ce que je faisais :
      // le code n apparaissait pas et rien ne disait pourquoi — coquille trop
      // ancienne pour connaitre l operation, droit refuse, ou simplement aucun
      // prefixe configure. Trois causes, un seul symptome, aucun message.
      if (!r || !r.ok) {
        poser('p-sku', '');
        e.placeholder = 'code indisponible';
        dire('Code (SKU) : ' + expliquer(r), 'att');
        return;
      }
      poser('p-sku', r.sku);
      e.placeholder = r.configure ? '' : 'aucun code configuré pour cette catégorie';
      if (!r.configure) {
        dire('Aucun préfixe de code n’est configuré pour cette catégorie — voyez Inventaire → Catégories.', 'att');
      } else { dire(''); }
    });
  }

  function majNom(){
    var e = document.getElementById('p-nom'), z = document.getElementById('p-desc-etat');
    if (e && z) z.textContent = (e.value || '').length + '/70';
  }

  // ⚠ AU NIVEAU DU MODULE, PAS DANS brancher. Elle etait imbriquee dans
  // brancher(), donc invisible depuis la reprise d un brouillon : l appeler de
  // la aurait leve une erreur, et le champ des retours serait reste modifiable
  // sur une fiche en vente finale.
  // ⚠ LE CHAMP « RETOURS » EST UN MIROIR DE LA CONSEQUENCE, PAS UN 2e REGLAGE.
  // Sur liquidation ou vente finale, il affiche << Aucun retour >>, se grise et
  // se desactive : ces regimes excluent deja les retours par finalSale et
  // liquidation, que la boutique lit depuis toujours.
  // ⚠ ET noReturn N EST PAS FORCE A VRAI POUR AUTANT (voir pont.js) : il ne
  // vaut vrai que dans le cas << normal + aucun retour >>, exactement comme
  // avant. Ce qui change ici est ce qu on MONTRE, pas ce qu on ecrit.
  function majRegime(){
    var reg = document.getElementById('p-regime');
    var ret = document.getElementById('p-retours');
    var impose = !!reg && reg.value !== 'normal';
    if (impose) { var t = document.getElementById('p-etiq'); if (t) t.value = ''; }
    if (ret) {
      if (impose) {
        // On garde le choix precedent : revenir a << Normal >> doit rendre ce qui
        // avait ete pose, pas un defaut arbitraire.
        if (!ret.disabled) ret.dataset.avant = ret.value;
        ret.value = 'aucun';
        ret.disabled = true;
        ret.style.opacity = '.55';
        ret.style.cursor = 'not-allowed';
      } else {
        if (ret.disabled && ret.dataset.avant) ret.value = ret.dataset.avant;
        ret.disabled = false;
        ret.style.opacity = '';
        ret.style.cursor = '';
      }
    }
    majMarge();
  }

  // Le bouton de redaction n a de sens qu avec une photo : le service regarde
  // le vetement. On le DIT plutot que de laisser cliquer pour rien.
  function majIa(){
    var b = document.getElementById('p-ia');
    if (!b) return;
    var pret = !!IMAGE;
    b.disabled = !pret;
    // ⚠ L explication passe par l INFOBULLE, pas par une ligne sous le bouton.
    // Une phrase d aide permanente occupe la place du formulaire pour dire une
    // chose qu on n a besoin de lire qu une fois.
    b.title = pret
      ? 'Analyse la photo du produit et propose une description.'
      : 'Ajoutez d’abord une photo à l’étape « Photo » : le service regarde le vêtement.';
  }

  function rediger(){
    var b = document.getElementById('p-ia');
    b.disabled = true; dire('Rédaction en cours…');
    var cat = (CTX.categories.find(function(c){ return c.cle === val('p-cat'); }) || {}).libelle || '';
    P.appeler('produit:decrire', {
      nom: val('p-nom'), categorie: cat, couleurs: couleurs(), imageDataUrl: IMAGE
    }).then(function(r){
      b.disabled = false;
      if (!r || !r.ok) { dire(expliquer(r) + (r && r.detail ? ' — ' + r.detail : ''), 'err'); return; }
      poser('p-desc', r.texte);
      dire('Description rédigée — relisez-la avant d’enregistrer.', 'bon');
    });
  }

  // Les couleurs CHOISIES vivent dans ce tableau, pas dans le DOM : les jetons
  // sont redessines a chaque ajout.
  var CHOIX = [];
  function teinte(nom){
    var c = CTX.couleurs.find(function(x){ return x.nom === nom; });
    return (c && c.hex) || '#888';
  }
  function dessinerJetons(){
    var z = document.getElementById('p-couleurs');
    if (!z) return;
    z.innerHTML = CHOIX.map(function(n){
      return '<span class="jeton on" data-c="' + esc(n) + '">'
        + '<span class="pt" style="background:' + esc(teinte(n)) + '"></span>'
        + esc(n) + '<span class="x" data-coulretire="' + esc(n) + '">×</span></span>';
    }).join('');
    var v = document.getElementById('p-coul-vide');
    if (v) v.style.display = CHOIX.length ? 'none' : '';
    dessinerVues();
  }
  function ajouterCouleur(nom){
    var e = document.getElementById('p-coul-libre');
    var v = String(nom != null ? nom : (e ? e.value : '')).trim();
    if (!v) return;
    if (CHOIX.indexOf(v) >= 0) { dire('« ' + v +' » est déjà dans la liste.', 'att'); }
    else { CHOIX.push(v); dire(''); }
    if (e) e.value = '';
    cacherSug();
    dessinerJetons();
  }
  function retirerCouleur(nom){
    var i = CHOIX.indexOf(nom);
    if (i >= 0) CHOIX.splice(i, 1);
    dessinerJetons();
  }

  // ── Suggestions, calquees sur l editeur du site ─────────────────────────
  // Celles qui COMMENCENT par la saisie viennent d abord : c est ce qu on
  // cherche quand on tape « no » pour « noir ».
  var SUG = [], SUGi = -1;
  function cacherSug(){
    var z = document.getElementById('p-coul-sug');
    if (z) { z.classList.remove('on'); z.innerHTML = ''; }
    SUG = []; SUGi = -1;
  }
  function chercher(q){
    q = String(q || '').trim().toLowerCase();
    var z = document.getElementById('p-coul-sug');
    if (!z) return;
    if (!q) { cacherSug(); return; }
    SUG = CTX.couleurs.filter(function(c){ return c.nom.toLowerCase().indexOf(q) >= 0; })
      .sort(function(a, b){
        return (a.nom.toLowerCase().indexOf(q) === 0 ? 0 : 1) - (b.nom.toLowerCase().indexOf(q) === 0 ? 0 : 1);
      }).slice(0, 40);
    if (!SUG.length) { cacherSug(); return; }
    SUGi = 0;
    z.innerHTML = SUG.map(function(c, i){
      var deja = CHOIX.indexOf(c.nom) >= 0;
      return '<div class="s' + (i === 0 ? ' vis' : '') + '" data-sug="' + esc(c.nom) + '">'
        + '<span class="pt" style="background:' + esc(c.hex || '#888') + '"></span>'
        + '<span style="text-transform:capitalize">' + esc(c.nom) + '</span>'
        + (deja ? '<span class="deja">déjà choisie</span>' : '') + '</div>';
    }).join('');
    z.classList.add('on');
  }
  function viser(d){
    if (!SUG.length) return;
    SUGi = Math.max(0, Math.min(SUG.length - 1, SUGi + d));
    var z = document.getElementById('p-coul-sug');
    Array.prototype.forEach.call(z.querySelectorAll('.s'), function(e, i){
      e.classList.toggle('vis', i === SUGi);
      if (i === SUGi) e.scrollIntoView({ block: 'nearest' });
    });
  }

  // ── Champs d argent, calques sur l editeur du site ──────────────────────
  // ⚠ LA VIRGULE EST ACCEPTEE. C est le separateur decimal d ici : quelqu un qui
  // tape « 125,50 » a raison, et un champ qui lui rend zero a tort.
  // A la prise de focus on montre le nombre NU — on ne corrige pas « 125.00 $ »
  // en se battant contre le curseur. Au depart du champ, on met en forme.
  function argentNombre(v){
    var n = parseFloat(String(v || '').replace(/[^0-9.,-]/g, '').replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  function argentFocus(e){ var n = argentNombre(e.value); e.value = (n === null) ? '' : String(n); }
  function argentBlur(e){
    var n = argentNombre(e.value);
    e.value = (n === null) ? '' : n.toFixed(2) + ' $';
    majMarge(); Assist.fil();
  }

  var PCTS = [10, 15, 20, 25, 30, 40, 50];
  function majMarge(){
    // ⚠ On lit par "argentNombre" : le champ contient « 125.00 $ » une fois mis
    // en forme, et "parseFloat" s arreterait au premier caractere non numerique
    // — ce qui marche par hasard ici, mais pas avec une virgule decimale.
    var p = argentNombre(val('p-prix')) || 0;
    var s = argentNombre(val('p-solde')) || 0;
    var c = argentNombre(val('p-cout')) || 0;
    var eff = (s > 0 && s < p) ? s : p;

    // Rabais rapides — un bouton par pourcentage, DESACTIVE si le prix obtenu
    // passe sous le cout. Proposer un rabais qui fait vendre a perte, c est
    // proposer une erreur.
    // Sans etiquette : les boutons sont sous le champ qu ils modifient, et
    // « -10% » se comprend seul.
    var z = document.getElementById('p-rabais');
    if (z) {
      z.innerHTML = PCTS.map(function(pct){
        var sp = p ? +(p * (1 - pct / 100)).toFixed(2) : 0;
        var sousCout = c > 0 && sp > 0 && sp < c;
        var actif = s > 0 && p > 0 && Math.round((1 - s / p) * 100) === pct;
        return '<button type="button" data-pct="' + pct + '"' + (actif ? ' class="on"' : '')
          + (!p || sousCout ? ' disabled' : '')
          + ' title="' + (sousCout ? 'sous le coût d’acquisition'
              : (actif ? 'recliquez pour retirer le rabais' : (sp ? sp.toFixed(2) + ' $' : ''))) + '">'
          + '-' + pct + '%</button>';
      }).join('');
    }
    // La pastille se pose DANS l etiquette du prix solde, a droite : c est la
    // qu on regarde pour savoir de combien on rabat.
    var pa = document.getElementById('p-pastille');
    if (pa) {
      var remise = (s > 0 && p > 0 && s < p) ? Math.round((1 - s / p) * 100) : 0;
      pa.textContent = remise ? '-' + remise + '%' : '';
      pa.classList.toggle('on', !!remise);
    }

    // ⚠ ETIQUETTE « SOLDE » AUTOMATIQUE, comme dans l editeur du site — mais
    // JAMAIS sur un produit deja en liquidation ou en vente finale : ces regimes
    // ont leur propre etiquette, et en poser une seconde par-dessus donne deux
    // messages contradictoires sur la meme fiche.
    var etiq = document.getElementById('p-etiq');
    var reg = val('p-regime');
    if (etiq && reg === 'normal') {
      if (p && s && s < p) etiq.value = 'Solde';
      else if (etiq.value === 'Solde') etiq.value = '';
    }

    var al = document.getElementById('p-alerte');
    if (al) {
      if (c > 0 && eff > 0 && eff < c) {
        al.textContent = '⚠ Le prix de vente effectif (' + eff.toFixed(2) + ' $) est inférieur au coût d’acquisition ('
          + c.toFixed(2) + ' $).';
        al.style.display = 'block';
      } else { al.style.display = 'none'; }
    }

    var el = document.getElementById('p-marge'); if (!el) return;
    if (!(eff > 0) || !(c > 0)) { el.textContent = ''; return; }
    var m = eff - c, pct = Math.round((m / eff) * 100);
    el.innerHTML = 'Marge : <strong>' + m.toFixed(2) + ' $</strong> (' + pct + ' %)'
      + (s > 0 && s < p ? ' — calculée sur le prix soldé' : '')
      + (m <= 0 ? ' <span style="color:#f87171">— vente à perte</span>' : '');
  }

  // Un cadre par vue : on clique, on choisit un fichier. Le « x » retire.
  function dessinerVues(){
    var t = document.getElementById('p-vues-titre');
    if (t) t.textContent = modeStandard()
      ? 'Photos — 1 principale + ' + MAX_PHOTOS + ' supplémentaires maximum'
      : 'Photos — principale + vues';
    var z = document.getElementById('p-vues');
    if (z) {
      z.innerHTML = clesVues().map(function(cle){
        var src = VUES[cle] || '';
        return '<div class="vue"><div class="cadre' + (src ? ' pleine" draggable="true' : '') + '" data-vue="' + esc(cle) + '"'
          + (src ? ' title="Glisser pour réordonner, ou déposer sur la principale"' : '') + '>'
          + (src ? '<img src="' + esc(src) + '" alt="">' : 'ajouter') + '</div>'
          + (src ? '<button type="button" class="x" data-vuex="' + esc(cle) + '" title="Retirer">×</button>' : '')
          + '<div class="lgd">' + esc(nomVue(cle)) + '</div></div>';
      }).join('');
    }
    var p = document.getElementById('p-parcoul');
    if (!p) return;
    // ⚠ ON MASQUE LA CARTE ENTIERE, on n y met pas un message d excuse. Une carte
    // qui explique pourquoi elle est vide occupe la place d une carte utile, et
    // laisse croire qu il manque quelque chose alors que le reglage est respecte.
    var carte = p.closest('.carte');
    if (modeStandard()) {
      if (carte) carte.style.display = 'none';
      return;
    }
    if (carte) carte.style.display = '';
    var auto = modeAutoCouleur();
    var titre = document.getElementById('p-parcoul-titre');
    if (titre) titre.textContent = auto ? '⚡ Variantes de couleur (Auto)' : 'Photo par couleur (Manuel)';
    var aide = document.getElementById('p-parcoul-aide');
    if (aide) aide.textContent = auto
      ? 'Générées en teintant les photos du produit — et régénérées automatiquement '
        + 'à l’enregistrement. Le client voit la photo de la couleur qu’il choisit.'
      : 'Ajoutez une photo par couleur. Le client voit la photo de la couleur qu’il '
        + 'choisit ; sans photo, c’est la photo principale qui s’affiche.';
    var cs = couleurs();
    var bg = document.getElementById('p-cv-gen');
    // ⚠ LA 1ʳᵉ COULEUR N’A PAS DE CASE : ses photos sont celles du produit, et
    // la boutique ne lit jamais de variante pour elle. Lui offrir une case
    // faisait déposer une photo qui ne s’affichait nulle part.
    var variantes = cs.slice(1);
    if (bg) bg.style.display = (auto && variantes.length && IMAGE) ? '' : 'none';
    if (!cs.length) {
      p.innerHTML = '<div class="aide">Choisissez d’abord des couleurs à l’étape « Tailles et couleurs ».</div>';
      return;
    }
    if (!variantes.length) {
      p.innerHTML = '<div class="aide">Ajoutez au moins une couleur de plus — « ' + esc(cs[0])
        + ' » est la couleur principale, ses photos sont celles du produit.</div>';
      return;
    }
    p.innerHTML = variantes.map(function(c){
      var src = (PARCOUL[c] && (PARCOUL[c].main || PARCOUL[c].principale)) || '';
      // En mode AUTO la case ne se clique pas : un dépôt manuel serait écrasé
      // par la régénération de l’enregistrement, sans un mot.
      return '<div class="vue"><div class="cadre' + (src ? ' pleine' : '')
        + (auto ? '" style="cursor:default" title="Générée par « Tout générer » et à l’enregistrement"'
                : '" data-coul="' + esc(c) + '"')
        + '>' + (src ? '<img src="' + esc(src) + '" alt="">' : (auto ? 'à générer' : 'ajouter')) + '</div>'
        + (src && !auto ? '<button type="button" class="x" data-coulx="' + esc(c) + '" title="Retirer">×</button>' : '')
        + '<div class="lgd">' + esc(c) + '</div></div>';
    }).join('');
  }

  // Un seul sélecteur de fichier, réutilisé : en créer un par cadre laisserait
  // autant d’éléments invisibles dans la page, et le navigateur n’en garde pas
  // la trace une fois le cadre redessiné.
  // ⚠ PLUSIEURS PHOTOS D UN COUP. On en depose rarement une seule : obliger a
  // rouvrir le selecteur cinq fois pour cinq vues d un meme vetement transforme
  // une minute de travail en cinq. Le selecteur accepte donc une selection
  // multiple, et les fichiers remplissent les cases libres dans l ordre.
  var MAX_PHOTOS = 5;
  function choisirFichier(surCharge, multiple){
    var e = document.createElement('input');
    e.type = 'file'; e.accept = 'image/*';
    if (multiple) e.multiple = true;
    e.onchange = function(){
      var fs = Array.prototype.slice.call(e.files || []);
      if (!fs.length) return;
      var trop = fs.filter(function(f){ return f.size > MAX_MO * 1024 * 1024; });
      fs = fs.filter(function(f){ return f.size <= MAX_MO * 1024 * 1024; });
      if (trop.length) {
        dire(trop.length + (trop.length > 1 ? ' photos ignorées : plus de ' : ' photo ignorée : plus de ')
          + MAX_MO + ' Mo.', 'att');
      }
      if (!fs.length) return;
      // ⚠ Les lectures sont ASYNCHRONES : sans ce compteur, les photos
      // arriveraient dans le desordre et la derniere lue ecraserait l ordre
      // choisi. On les repose a leur rang une fois toutes lues.
      var lues = new Array(fs.length), reste = fs.length;
      fs.forEach(function(f, i){
        var l = new FileReader();
        l.onload = function(){
          lues[i] = String(l.result || '');
          if (--reste === 0) { surCharge(lues.filter(Boolean)); if (!trop.length) dire(''); }
        };
        l.onerror = function(){ if (--reste === 0) { surCharge(lues.filter(Boolean)); } };
        l.readAsDataURL(f);
      });
    };
    e.click();
  }

  // ⚠ LA PHOTOTHEQUE D ABORD, L ORDINATEUR ENSUITE — pour TOUS les emplacements
  // photo, pas seulement la principale. Une photo deja importee dans la session a
  // deja ete choisie et nommee : aller la rechercher dans un dossier refait un
  // travail deja fait, et depose un second exemplaire du meme fichier dans le
  // stockage. L import reste offert, dans la meme boite — il n est pas cache, il
  // est second.
  // La fonction de retour recoit TOUJOURS un TABLEAU, quelle que soit la porte
  // empruntee : sans quoi chaque appelant devrait distinguer les deux cas, et
  // l un d eux l aurait oublie.
  function choisirPhoto(surChoix, multiple){
    ouvrirTheque(surChoix, multiple);
  }

  // ⚠ ELLE DIT CE QU ELLE EST. La photothèque se vide à chaque démarrage : sans
  // cette phrase, un sélecteur vide ressemble à une panne alors que c est un plan
  // de travail neuf. On renvoie aussi vers l endroit où l on importe.
  function ouvrirTheque(surChoix, multiple){
    P.appeler('photos:liste').then(function(r){
      var v = document.createElement('div');
      v.className = 'voile';
      var corps;
      if (!r || !r.ok) {
        // ⚠ « INDISPONIBLE » N EST PAS « VIDE ». Un refus du pont affiche ici son
        // motif : sans lui, on croirait la photothèque vide et l on importerait
        // a la main sans jamais savoir qu elle n avait pas repondu.
        corps = '<p style="font-size:.86rem;line-height:1.5;color:#fbbf24">Photothèque '
          + 'indisponible : ' + esc(expliquer(r)) + '</p>';
      } else if (r.photos.length) {
        // ⚠ ON MONTRE LE CODE DE L ARTICLE QUI SE SERT DEJA DE CETTE PHOTO.
        // Deux articles peuvent porter des noms voisins ; le SKU, lui, ne trompe
        // pas — et c est celui qu on relit sur l etiquette et sur le bon. Une
        // photo deja employee ailleurs n est pas interdite, mais on doit le
        // SAVOIR avant de la reprendre.
        corps = '<div class="theque">' + r.photos.map(function(x){
            var sku = x.codeProduit || '';
            // ⚠ DOUBLE ANTISLASH VOULU. Ce script part dans un litteral de
            // gabarit : un « \\n » simple serait resolu ICI, a la lecture du
            // module, et la page recevrait un vrai saut de ligne au milieu d une
            // chaine entre apostrophes — donc un script casse. Le garde-fou l a
            // attrape, sinon la fenetre serait restee sur « Chargement… ».
            var bulle = x.nom + (x.rattacheA ? '\\nDéjà utilisée par : ' + x.rattacheA
              + (sku ? ' (' + sku + ')' : '') : '\\nJamais utilisée');
            return '<div class="ph" data-src="' + esc(x.src) + '" title="' + esc(bulle) + '">'
              + '<img src="' + esc(x.src) + '" alt="">'
              + '<div class="lg">' + esc(x.code) + '</div>'
              + (x.rattacheA
                  ? '<div class="lg sku" title="' + esc(x.rattacheA) + '">'
                    + esc(sku || x.rattacheA) + '</div>'
                  : '<div class="lg libre">libre</div>')
              + '</div>';
          }).join('') + '</div>';
      } else {
        corps = '<p style="font-size:.86rem;line-height:1.5;color:#8fa1b8">La photothèque est vide. '
          + 'Elle se remplit par <strong>Catalogue → Photos</strong>, dans la fenêtre principale, '
          + 'et repart à zéro à chaque démarrage de l’application.</p>';
      }
      v.innerHTML = '<div class="boite" style="max-width:620px"><h3 style="color:#e8dcc6">Photothèque</h3>'
        + corps
        + '<div class="pied2" style="justify-content:space-between">'
        + '<button type="button" id="th-fich"><span class="ic">📂</span> Importer de l’ordinateur…</button>'
        + '<button type="button" id="th-non">Annuler</button></div></div>';
      document.body.appendChild(v);
      document.getElementById('th-non').onclick = function(){ v.remove(); };
      document.getElementById('th-fich').onclick = function(){
        v.remove(); choisirFichier(surChoix, multiple);
      };
      v.addEventListener('click', function(ev){
        if (ev.target === v) { v.remove(); return; }
        var p2 = ev.target.closest('.ph'); if (!p2) return;
        v.remove();
        surChoix([p2.getAttribute('data-src')]);
        dire('Photo reprise de la photothèque.', 'bon');
      });
    });
  }

  function montrerImage(src){
    var v = document.getElementById('p-vign'); if (!v) return;
    v.classList.toggle('pleine', !!src);
    v.setAttribute('draggable', src ? 'true' : 'false');
    var bd = document.getElementById('p-detourer');
    if (bd) bd.disabled = !src;
    var bm = document.getElementById('p-mannequin');
    if (bm) bm.disabled = !src;
    v.innerHTML = src
      ? '<img src="' + esc(src) + '" alt="">'
        + '<button type="button" class="x" id="p-vider" title="Retirer la photo">×</button>'
      : 'choisir une photo';
  }

  /* ── GLISSER-DEPOSER DES PHOTOS (demande le 2026-08-08) ──
     Une secondaire deposee sur la principale PREND SA PLACE, et l ancienne
     principale descend dans la ligne : rien ne se perd. Les cases libres se
     reordonnent en glissant sur la ligne ; les vues NOMMEES (devant,
     derriere...) gardent leur sens, elles ne font que s echanger. Tout vit
     dans IMAGE et VUES, jamais dans l ecran : le redessin repart de l etat. */
  function libresOrdonnees(){
    return Object.keys(VUES).filter(function(k){ return k.indexOf('libre') === 0; })
      .sort(function(a, b){ return parseInt(a.slice(5), 10) - parseInt(b.slice(5), 10); })
      .map(function(k){ return VUES[k]; });
  }
  function poserLibres(arr){
    Object.keys(VUES).forEach(function(k){ if (k.indexOf('libre') === 0) delete VUES[k]; });
    arr.forEach(function(src, i){ VUES['libre' + (i + 1)] = src; });
  }
  var GLISSE = null; // 'principale' | cle de la vue tiree
  function nettoyerSurvol(){
    Array.prototype.forEach.call(document.querySelectorAll('.survol'), function(el){
      el.classList.remove('survol');
    });
  }
  document.getElementById('corps').addEventListener('dragstart', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('#p-vign')) {
      if (!IMAGE) return;
      GLISSE = 'principale';
      try { ev.dataTransfer.setData('text/plain', 'principale'); } catch (e) {}
      return;
    }
    var c = t.closest('[data-vue]');
    if (c && c.classList.contains('pleine')) {
      GLISSE = c.getAttribute('data-vue');
      try { ev.dataTransfer.setData('text/plain', GLISSE); } catch (e) {}
    }
  });
  document.getElementById('corps').addEventListener('dragover', function(ev){
    if (!GLISSE) return;
    var t = ev.target && ev.target.closest ? (ev.target.closest('#p-vign') || ev.target.closest('[data-vue]')) : null;
    if (!t) return;
    ev.preventDefault();
    nettoyerSurvol();
    t.classList.add('survol');
  });
  document.getElementById('corps').addEventListener('dragend', function(){
    GLISSE = null;
    nettoyerSurvol();
  });
  document.getElementById('corps').addEventListener('drop', function(ev){
    if (!GLISSE) return;
    var src = GLISSE;
    GLISSE = null;
    nettoyerSurvol();
    var surVign = ev.target.closest ? ev.target.closest('#p-vign') : null;
    var surVue = ev.target.closest ? ev.target.closest('[data-vue]') : null;
    if (!surVign && !surVue) return;
    ev.preventDefault();
    if (surVign) {
      if (src === 'principale') return;
      var neuve = VUES[src];
      if (!neuve) return;
      var ancienne = IMAGE;
      IMAGE = neuve;
      if (src.indexOf('libre') === 0) {
        var arr = libresOrdonnees();
        var i = arr.indexOf(neuve);
        if (i >= 0) { if (ancienne) arr[i] = ancienne; else arr.splice(i, 1); }
        poserLibres(arr);
      } else {
        if (ancienne) VUES[src] = ancienne; else delete VUES[src];
      }
      montrerImage(IMAGE); dessinerVues(); majIa();
      dire('Photo principale remplacée — l’ancienne est restée dans la ligne.', 'bon');
      return;
    }
    var cible = surVue.getAttribute('data-vue');
    if (src === 'principale') {
      if (!IMAGE) return;
      var valC = VUES[cible];
      if (valC) { VUES[cible] = IMAGE; IMAGE = valC; }
      else if (cible.indexOf('libre') === 0) {
        var a0 = libresOrdonnees();
        if (a0.length >= MAX_PHOTOS) { dire('Maximum ' + MAX_PHOTOS + ' photos supplémentaires.', 'att'); return; }
        a0.push(IMAGE); poserLibres(a0); IMAGE = '';
      } else { VUES[cible] = IMAGE; IMAGE = ''; }
      montrerImage(IMAGE); dessinerVues(); majIa();
      return;
    }
    if (src === cible) return;
    if (src.indexOf('libre') === 0 && cible.indexOf('libre') === 0) {
      var a = libresOrdonnees();
      var de = a.indexOf(VUES[src]);
      if (de < 0) return;
      var val = a.splice(de, 1)[0];
      var vers = VUES[cible] ? a.indexOf(VUES[cible]) : a.length;
      if (vers < 0) vers = a.length;
      a.splice(vers, 0, val);
      poserLibres(a);
      dessinerVues();
      return;
    }
    var tmp = VUES[src];
    if (VUES[cible]) { VUES[src] = VUES[cible]; } else { delete VUES[src]; }
    VUES[cible] = tmp;
    dessinerVues();
  });
  var MAX_MO = 8;

  function tailles(){
    return Array.prototype.filter.call(document.querySelectorAll('#p-tailles .jeton'), function(j){
      return j.classList.contains('on'); }).map(function(j){ return j.getAttribute('data-t'); });
  }
  function couleurs(){ return CHOIX.slice(); }

  // ⚠ LA CLE DE STOCK EST « taille-couleur », exactement comme dans le site. Une
  // autre convention aurait produit un stock que l inventaire ne sait pas lire :
  // invisible, et donc jamais commande.
  // ⚠ LES QUANTITES VIVENT DANS "STOCK", PAS DANS LES CHAMPS. La liste est
  // paginee et redessinee : lire les champs a l enregistrement n aurait rendu
  // que la page affichee, et le reste aurait ete perdu sans un mot.
  // ⚠ LE SEUIL A ZERO VEUT DIRE « NE JAMAIS ALERTER », c est la regle du projet
  // (cascade variante -> produit -> general). Le traiter comme un seuil ordinaire
  // aurait fait crier une alerte sur toutes les variantes vides d un produit dont
  // on a justement decide qu il ne devait pas en declencher.
  // ⚠ ET RIEN SUR UNE QUANTITE DE ZERO : une variante a zero sur une fiche neuve
  // n est pas « sous le seuil », elle n est pas encore approvisionnee. Avertir
  // partout a la creation, c est n avertir nulle part — on apprend a ne plus voir
  // le symbole.
  // ⚠ ATTEINDRE LE SEUIL SUFFIT — il n y a pas a le depasser. Le seuil est le
  // plancher a partir duquel on reappprovisionne : y etre, c est etre au minimum
  // voulu, pas en dessous. J exigeais une unite de plus, ce qui faisait persister
  // l avertissement sur une variante pourtant conforme.
  function alerteSeuil(q){
    var s = parseInt(val('p-seuil'), 10);
    if (!(s > 0) || !(q > 0) || q >= s) return '';
    return '<span class="al" title="Sous le seuil d’alerte (' + s + '). '
      + 'Il en manque ' + (s - q) + ' pour l’atteindre.">⚠</span>';
  }

  function majStock(){
    var t = tailles(), c = couleurs();
    var lignes = [];
    t.forEach(function(ta){ c.forEach(function(co){
      lignes.push({ cle: ta + '-' + co, taille: ta, couleur: co, nom: ta + ' ' + co });
    }); });
    var zone = document.getElementById('p-zone');
    if (!PAGI) {
      PAGI = new Pagi(zone, {
        // ⚠ UN VRAI TABLEAU, avec ses en-tetes. Sans eux, on voyait quatre
        // colonnes sans savoir laquelle se saisit et laquelle se choisit — et la
        // quantite ressemblait a un identifiant.
        ligne: function(x){
          var q = STOCK[x.cle] || 0, lo = LOCS[x.cle] || '';
          // Une variante SANS emplacement alors qu elle porte du stock est
          // signalee des le dessin, pas seulement quand on y touche : une liste
          // paginee se rouvre a la page 2 et le rappel doit y etre deja.
          var manque = (q > 0 && CTX.entrepots.length && !lo);
          return '<div class="lgstk' + (q > 0 ? ' enstock' : '') + '">'
            + '<span class="c1">' + esc(x.taille) + '</span>'
            + '<span class="c2">' + esc(x.couleur) + '</span>'
            + '<span class="c3"><input class="q" type="number" min="0" step="1" placeholder="0"'
            + ' data-cle="' + esc(x.cle) + '" value="' + esc(q) + '">' + alerteSeuil(q) + '</span>'
            + (CTX.entrepots.length
                ? '<span class="c4"><select class="loc' + (manque ? ' manque' : '') + '" data-cle="' + esc(x.cle) + '">'
                  + '<option value="">Choisir l’emplacement</option>'
                  + CTX.entrepots.map(function(w){
                      return '<option value="' + esc(w.id) + '"' + (lo === w.id ? ' selected' : '') + '>' + esc(w.nom) + '</option>';
                    }).join('') + '</select></span>'
                : '')
            + '</div>';
        },
        surMaj: function(){
          var n = 0;
          Object.keys(STOCK).forEach(function(k){ n += STOCK[k] || 0; });
          var s = document.getElementById('p-somme');
          if (s) s.textContent = n + (n > 1 ? ' unités au total' : ' unité au total');
        }
      });
      PAGI.brancher();
      // ⚠ ON REPEINT LA LIGNE, ON NE REDESSINE PAS LA LISTE. Un redessin
      // remplacerait le champ pendant la frappe : le curseur repartirait au
      // debut et l on perdrait le deuxieme chiffre d une quantite a deux
      // chiffres. La ligne existe deja — on ne fait que changer son etat.
      var peindre = function(el, cle){
        if (!el) return;
        var q = STOCK[cle] || 0;
        el.classList.toggle('enstock', q > 0);
        var s = el.querySelector('.loc');
        if (s) s.classList.toggle('manque', q > 0 && !s.value);
        // L avertissement de seuil suit la frappe : on remplace le seul marqueur,
        // jamais la cellule — reecrire la cellule emporterait le champ en cours
        // de saisie et le curseur avec lui.
        var c3 = el.querySelector('.c3');
        if (c3) {
          var vieux = c3.querySelector('.al');
          if (vieux) vieux.remove();
          var neuf = alerteSeuil(q);
          if (neuf) c3.insertAdjacentHTML('beforeend', neuf);
        }
      };
      zone.querySelector('.liste').addEventListener('input', function(ev){
        var q = ev.target.closest('.q');
        if (q) {
          STOCK[q.dataset.cle] = parseInt(q.value, 10) || 0;
          peindre(q.closest('.lgstk'), q.dataset.cle);
          PAGI.surMaj();
          return;
        }
      });
      zone.querySelector('.liste').addEventListener('change', function(ev){
        var l = ev.target.closest('.loc');
        if (l) { LOCS[l.dataset.cle] = l.value; peindre(l.closest('.lgstk'), l.dataset.cle); }
      });
    }
    PAGI.tout = lignes;
    if (!lignes.length) {
      zone.querySelector('.liste').innerHTML =
        '<div class="aide">Choisissez au moins une taille et une couleur à l’étape « Tailles et couleurs ».</div>';
      zone.querySelector('.pagi').innerHTML = '';
      return;
    }
    PAGI.dessiner();
  }

  function remplir(p){
    poser('p-nom', p.name); poser('p-cat', p.category); poser('p-sku', p.sku);
    poser('p-marque', p.brand); poser('p-desc', p.description);
    poser('p-genre', p.genre || ''); poser('p-age', p.ageGroup || '');
    poser('p-style', p.style || ''); poser('p-guide', p.sizeGuideId || '');
    poser('p-etiq', p.tag || ''); poser('p-fourn', p.supplierId || '');
    poser('p-prix', p.price != null ? p.price.toFixed(2) + ' $' : '');
    poser('p-solde', p.salePrice != null ? p.salePrice.toFixed(2) + ' $' : '');
    poser('p-cout', p.acquisitionCost != null ? p.acquisitionCost.toFixed(2) + ' $' : '');
    // Le poids est conserve en KILOGRAMMES : on l affiche en grammes, l unite la
    // plus lisible pour un vetement.
    poser('p-poids', p.weight ? String(Math.round(p.weight * 1000 * 10) / 10) : '');
    poser('p-unite', 'g');
    poser('p-seuil', p.lowStock != null ? String(p.lowStock) : String(CTX.seuilDefaut));
    poser('p-limclient', (Number(p.buyMaxClient) >= 1) ? String(Math.floor(Number(p.buyMaxClient))) : '');
    document.getElementById('p-actif').checked = p.active !== false;
    // ⚠ LES DEUX AXES SE LISENT SEPAREMENT, comme dans l editeur du site : la
    // liquidation et la vente finale sont des REGIMES, noReturn est la politique
    // de retour d un article par ailleurs normal. Les confondre ferait perdre
    // l un des deux a chaque ouverture.
    poser('p-regime', p.liquidation ? 'liq' : (p.finalSale ? 'final' : 'normal'));
    poser('p-retours', p.noReturn ? 'aucun' : 'ok');
    (p.sizes || []).forEach(function(t){
      var j = document.querySelector('#p-tailles .jeton[data-t="' + String(t).replace(/"/g, '') + '"]');
      if (j) j.classList.add('on');
    });
    CHOIX = (p.colors || []).map(String);
    dessinerJetons();
    STOCK = Object.assign({}, p.stock || {});
    // ⚠ LE CHAMP DU PRODUIT EST warehouseLocations. Cette fenêtre lisait
    // « stockLoc », un nom qu'elle avait inventé : les emplacements existants
    // ne s'affichaient JAMAIS (tout restait à « Choisir l'emplacement »), et
    // ceux qu'on choisissait n'étaient jamais écrits — le pont traduit
    // désormais l'envoi (la fenêtre continue d'expédier « stockLoc » sur le
    // fil, c'est le contrat des coquilles déjà installées).
    LOCS = Object.assign({}, p.warehouseLocations || p.stockLoc || {});
    if (p.image) { IMAGE = p.image; montrerImage(IMAGE); }
    VUES = vuesDepuisFiche(p.additionalImages);
    // ⚠ COPIE PROFONDE : chaque couleur porte son propre objet. Une copie de
    // surface les partagerait avec la fiche d origine, et retirer une photo ici
    // la retirerait aussi de la reference qui sert a detecter les conflits.
    PARCOUL = parcoulDepuisFiche(p.colorVariants);
  }

  // ⚠ LA FICHE PEUT PORTER TROIS FORMES de photos supplémentaires : un TABLEAU
  // (la forme que le pont écrit depuis le 2026-08-08), des clés d’ANGLE
  // (l’éditeur du site), ou des clés libre1..5 (cette fenêtre, 1.15.0 à
  // 1.43.0). On traduit vers ce que le MODE de la catégorie attend — sans ça,
  // les photos existaient dans la fiche mais les cases restaient vides ici.
  // La catégorie est déjà posée quand remplir nous appelle.
  function vuesDepuisFiche(brut){
    var angles = ['devant', 'derriere', 'coteG', 'coteD', 'autres'];
    var liste = [];
    if (Array.isArray(brut)) {
      liste = brut.filter(Boolean);
    } else if (brut && typeof brut === 'object') {
      if (!modeStandard()) {
        // Mode angles : les clés d’angle se gardent telles quelles ; des clés
        // libres héritées s’ajoutent à la suite, dans les angles encore vides.
        var v = {};
        angles.forEach(function(k){ if (brut[k]) v[k] = brut[k]; });
        Object.keys(brut).filter(function(k){ return k.indexOf('libre') === 0 && brut[k]; })
          .sort(function(a, b){ return (parseInt(a.slice(5), 10) || 0) - (parseInt(b.slice(5), 10) || 0); })
          .forEach(function(k){
            for (var i = 0; i < angles.length; i++) {
              if (!v[angles[i]]) { v[angles[i]] = brut[k]; return; }
            }
          });
        return v;
      }
      // Mode standard : angles puis libres, dans l’ordre, vers libre1..N.
      liste = angles.map(function(k){ return brut[k]; }).filter(Boolean)
        .concat(Object.keys(brut).filter(function(k){ return k.indexOf('libre') === 0 && brut[k]; })
          .sort(function(a, b){ return (parseInt(a.slice(5), 10) || 0) - (parseInt(b.slice(5), 10) || 0); })
          .map(function(k){ return brut[k]; }));
    } else { return {}; }
    var res = {};
    if (modeStandard()) {
      liste.slice(0, MAX_PHOTOS).forEach(function(src, i){ res['libre' + (i + 1)] = src; });
    } else {
      liste.slice(0, angles.length).forEach(function(src, i){ res[angles[i]] = src; });
    }
    return res;
  }
  // « principale » était la clé de cette fenêtre ; la boutique lit « main ».
  function parcoulDepuisFiche(brut){
    var g = {};
    Object.keys(brut || {}).forEach(function(c){
      var v = Object.assign({}, brut[c] || {});
      if (v.principale && !v.main) v.main = v.principale;
      delete v.principale;
      g[c] = v;
    });
    return g;
  }

  function enKg(v, u){
    var n = parseFloat(v) || 0;
    if (u === 'kg') return n;
    if (u === 'lb') return n * 0.45359237;
    return n / 1000;
  }

  // ══ PLEIN ÉCRAN — RETIRÉ D'ICI (3.11.0) ═══════════════════════════════════
  // ⚠ SON BOUTON ÉCRIT À LA MAIN A ÉTÉ SUPPRIMÉ, ET CE N'EST PAS UNE PERTE :
  // l'installateur du socle (JS_FENPLEIN) le pose maintenant dans les 83
  // fenêtres, celle-ci comprise. Garder les deux, c'était deux mécanismes pour
  // un geste, et le nôtre était le moins bon : il ne se mettait à jour QUE sur
  // ses propres clics, donc il annonçait encore « Plein écran » après une sortie
  // par la touche du système. Mesuré : 9 verdicts sur 10, celui-là en échec.
  // Celui du socle observe la classe « sz-zoom-fen » et ne peut pas mentir.
  // ⚠ Il reste ici la seule chose qui soit propre à cette fenêtre : l'aperçu.
  /* ── APERCU BOUTIQUE ── Le SITE dessine (produit:apercu → Shop.renderProductCard
     et la vue page produit de _pfApercuHtml, avec ses regles vivantes) ; ici on
     ne fait que poser le document sur fond clair. Deux onglets, comme l editeur
     du site. La saisie part TELLE QUELLE : l apercu montre ce qu on est en
     train d ecrire, pas la fiche enregistree. */
  var APERCU_ONGLET = 'card';
  function saisieApercu(){
    return {
      name: val('p-nom').trim(), category: val('p-cat'),
      price: argentNombre(val('p-prix')) || 0, salePrice: argentNombre(val('p-solde')) || null,
      description: val('p-desc'), brand: val('p-marque'), tag: val('p-etiq'),
      active: coché('p-actif'), image: IMAGE || null,
      sizes: tailles(), colors: couleurs()
    };
  }
  function ouvrirApercu(){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite" style="max-width:36rem">'
      + '<h3><span class="ic">👁</span> Aperçu boutique</h3>'
      + '<div style="display:flex;gap:.4rem;margin:.45rem 0 .6rem">'
      + '<button type="button" id="ap-card">Grille boutique</button>'
      + '<button type="button" id="ap-detail">Page produit</button></div>'
      + '<div id="ap-zone" style="background:#f6f4ef;border-radius:10px;padding:.85rem;'
      + 'color:#1a1a1a;max-height:62vh;overflow-y:auto"></div>'
      + '<div class="pied2"><button type="button" id="ap-non">Fermer</button></div></div>';
    document.body.appendChild(v);
    function peindre(){
      var c = document.getElementById('ap-card'), d = document.getElementById('ap-detail');
      if (c) c.className = APERCU_ONGLET === 'card' ? 'prim' : '';
      if (d) d.className = APERCU_ONGLET === 'detail' ? 'prim' : '';
    }
    function chargerApercu(){
      var z = document.getElementById('ap-zone');
      if (z) z.innerHTML = '<div style="padding:2rem;text-align:center;color:#6b7280">Chargement…</div>';
      P.appeler('produit:apercu', saisieApercu(), APERCU_ONGLET).then(function(r){
        var z2 = document.getElementById('ap-zone');
        if (!z2) return;
        if (!r || !r.ok) {
          z2.innerHTML = '<div style="padding:1.5rem;text-align:center;color:#b91c1c">' + esc(expliquer(r)) + '</div>';
          return;
        }
        z2.innerHTML = '<style>' + (r.css || '') + '</style>' + (r.html || '');
      });
    }
    document.getElementById('ap-card').onclick = function(){ APERCU_ONGLET = 'card'; peindre(); chargerApercu(); };
    document.getElementById('ap-detail').onclick = function(){ APERCU_ONGLET = 'detail'; peindre(); chargerApercu(); };
    document.getElementById('ap-non').onclick = function(){ v.remove(); };
    peindre();
    chargerApercu();
  }

  /* ── DETOURAGE ── Le SITE fait le travail (produit:detourer : retrait local
     du fond au canevas + decor compose), et il CACHE la transparente : changer
     de decor est instantane. Le resultat ne REMPLACE la photo principale que
     sur << Utiliser cette photo >> — jamais a l aveugle. */
  var FOND_CHOISI = 'studio';
  function ouvrirDetourage(){
    if (!IMAGE) return;
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite" style="max-width:32rem">'
      + '<h3>✂ Détourer et changer le décor</h3>'
      + '<div class="fonds" id="dt-fonds"></div>'
      + '<div id="dt-zone" style="background:#0f1826;border-radius:10px;min-height:14rem;'
      + 'display:flex;align-items:center;justify-content:center;overflow:hidden"></div>'
      + '<div class="pied2"><button type="button" id="dt-non">Annuler</button>'
      + '<button type="button" class="prim" id="dt-oui" disabled>✓ Utiliser cette photo</button></div></div>';
    document.body.appendChild(v);
    var RESULTAT = '';
    function zone(html){ var z = document.getElementById('dt-zone'); if (z) z.innerHTML = html; }
    function lancer(){
      zone('<div style="padding:2rem;text-align:center;color:#8fa1b8">Détourage…</div>');
      var oui = document.getElementById('dt-oui');
      if (oui) oui.disabled = true;
      P.appeler('produit:detourer', IMAGE, FOND_CHOISI).then(function(r){
        if (!r || !r.ok) {
          zone('<div style="padding:1.5rem;text-align:center;color:#f87171">'
            + esc((r && r.detail) || expliquer(r)) + '</div>');
          return;
        }
        RESULTAT = r.image || '';
        zone('<img src="' + esc(RESULTAT) + '" style="max-width:100%;max-height:20rem;object-fit:contain" alt="">');
        var oui2 = document.getElementById('dt-oui');
        if (oui2) oui2.disabled = !RESULTAT;
      });
    }
    function peindreFonds(fonds){
      var z = document.getElementById('dt-fonds');
      if (!z) return;
      z.innerHTML = fonds.map(function(f){
        return '<button type="button" data-fond="' + esc(f.cle) + '"'
          + (f.cle === FOND_CHOISI ? ' class="on"' : '') + '>'
          + '<span class="past" style="background:' + esc(f.couleur) + '"></span>'
          + esc(f.libelle) + '</button>'; }).join('');
      z.onclick = function(ev){
        var b = ev.target && ev.target.closest ? ev.target.closest('[data-fond]') : null;
        if (!b) return;
        FOND_CHOISI = b.getAttribute('data-fond');
        peindreFonds(fonds);
        lancer();
      };
    }
    P.appeler('produit:fonds').then(function(r){
      if (!r || !r.ok) { zone('<div style="padding:1.5rem;text-align:center;color:#f87171">' + esc(expliquer(r)) + '</div>'); return; }
      peindreFonds(r.fonds || []);
      lancer();
    });
    document.getElementById('dt-non').onclick = function(){ v.remove(); };
    document.getElementById('dt-oui').onclick = function(){
      if (!RESULTAT) return;
      IMAGE = RESULTAT;
      montrerImage(IMAGE); majIa();
      v.remove();
      dire('Photo principale remplacée par la version détourée.', 'bon');
    };
  }

  /* ── MANNEQUIN IA ── Essayage virtuel Fal.ai, EXECUTE PAR LE SITE
     (produit:photoIa — la cle ne voyage jamais). ⚠ CHAQUE GENERATION COUTE des
     credits : le geste explicite << Generer >> confirme, le bouton se desarme
     pendant le travail (jusqu a 2 minutes), et le resultat ne remplace la
     photo principale que sur << Utiliser cette photo >>. Les modeles de pose
     viennent de la phototheque du site (Configuration). */
  function ouvrirMannequin(){
    if (!IMAGE) return;
    var MODELE = '', RES = '';
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite" style="max-width:34rem">'
      + '<h3>✨ Mannequin IA</h3>'
      + '<div class="aide">Le vêtement de la photo principale sera porté par le modèle choisi. '
      + 'Chaque génération consomme des crédits Fal.ai.</div>'
      + '<div class="modeles" id="ia-modeles"><span class="aide">Chargement…</span></div>'
      + '<div class="grille" style="grid-template-columns:1fr 1fr;margin:.3rem 0 .5rem">'
      + '<div class="ch"><label for="ia-cat">Type de vêtement</label><select id="ia-cat">'
      + '<option value="one-pieces">Robes / Combinaisons</option>'
      + '<option value="upper_body">Hauts / Vestes / Manteaux</option>'
      + '<option value="lower_body">Bas — Pantalons / Jupes</option></select></div>'
      + '<div class="ch"><label for="ia-desc">Description courte</label>'
      + '<input id="ia-desc" type="text" placeholder="Ex : robe fleurie été"></div></div>'
      + '<div id="ia-zone" style="background:#0f1826;border-radius:10px;min-height:10rem;'
      + 'display:flex;align-items:center;justify-content:center;overflow:hidden"></div>'
      + '<div class="pied2"><button type="button" id="ia-non">Fermer</button>'
      + '<button type="button" id="ia-gen">✨ Générer</button>'
      + '<button type="button" class="prim" id="ia-oui" disabled>✓ Utiliser cette photo</button></div></div>';
    document.body.appendChild(v);
    // La categorie part de celle du produit : robes -> one-pieces, bas -> lower_body.
    var cat = val('p-cat');
    var ic = document.getElementById('ia-cat');
    if (ic) ic.value = (cat === 'pantalons' || cat === 'jupes') ? 'lower_body'
      : (cat === 'hauts' || cat === 'manteaux') ? 'upper_body' : 'one-pieces';
    var idn = document.getElementById('ia-desc');
    if (idn) idn.value = val('p-nom').trim();
    function zone(html){ var z = document.getElementById('ia-zone'); if (z) z.innerHTML = html; }
    zone('<span class="aide">Choisissez un modèle, puis ✨ Générer.</span>');
    P.appeler('produit:modeles').then(function(r){
      var z = document.getElementById('ia-modeles');
      if (!z) return;
      if (!r || !r.ok) { z.innerHTML = '<span class="aide" style="color:#f87171">' + esc(expliquer(r)) + '</span>'; return; }
      if (!r.cleConfiguree) {
        z.innerHTML = '<span class="aide" style="color:#fbbf24">⚠ Clé Fal.ai non configurée — '
          + 'Configuration de la fenêtre principale.</span>';
        return;
      }
      if (!(r.modeles || []).length) {
        // ⚠ CE RENVOI ETAIT FAUX JUSQU AU 2026-08-20 : il envoyait vers
        // << Configuration >>, ou RIEN ne gerait cette bibliotheque — elle ne
        // vivait que dans la modale de l ecran web de l editeur produit. La
        // fenetre << Modeles par vue >> la porte maintenant. On nomme le chemin
        // exact : un renvoi vague fait chercher, et c est ce qui l avait cache.
        z.innerHTML = '<span class="aide" style="color:#fbbf24">⚠ Aucun mannequin enregistré — '
          + 'ajoutez-en dans <strong>Configuration → Apparence → Modèles par vue</strong>, '
          + 'section « Mannequins ».</span>';
        return;
      }
      z.innerHTML = r.modeles.map(function(m){
        return '<div class="md" data-modele="' + esc(m.id) + '"><div class="cd">'
          + '<img src="' + esc(m.image) + '" alt=""></div>'
          + '<div class="nm">' + esc(m.nom) + '</div></div>'; }).join('');
      z.onclick = function(ev){
        var d = ev.target && ev.target.closest ? ev.target.closest('[data-modele]') : null;
        if (!d) return;
        MODELE = d.getAttribute('data-modele');
        Array.prototype.forEach.call(z.querySelectorAll('.md'), function(x){
          x.classList.toggle('on', x.getAttribute('data-modele') === MODELE);
        });
      };
    });
    document.getElementById('ia-non').onclick = function(){ v.remove(); };
    document.getElementById('ia-gen').onclick = function(){
      if (!MODELE) { zone('<span class="aide" style="color:#fbbf24">Choisissez d’abord un modèle.</span>'); return; }
      var g = this;
      g.disabled = true; // anti double-clic : chaque generation COUTE
      var oui = document.getElementById('ia-oui');
      if (oui) oui.disabled = true;
      zone('<span class="aide">Génération en cours — jusqu’à 2 minutes…</span>');
      P.appeler('produit:photoIa', IMAGE, MODELE,
        (document.getElementById('ia-cat') || {}).value,
        (document.getElementById('ia-desc') || {}).value).then(function(r){
        g.disabled = false;
        g.textContent = '↻ Régénérer';
        if (!r || !r.ok) {
          zone('<span class="aide" style="color:#f87171">'
            + esc((r && r.detail) || (r && r.motif === 'cle_absente' ? 'Clé Fal.ai non configurée.'
              : r && r.motif === 'modele_absent' ? 'Ce modèle n’existe plus — rechargez.' : expliquer(r))) + '</span>');
          return;
        }
        RES = r.image || '';
        zone('<img src="' + esc(RES) + '" style="max-width:100%;max-height:22rem;object-fit:contain" alt="">');
        var oui2 = document.getElementById('ia-oui');
        if (oui2) oui2.disabled = !RES;
      });
    };
    document.getElementById('ia-oui').onclick = function(){
      if (!RES) return;
      IMAGE = RES;
      montrerImage(IMAGE); majIa();
      v.remove();
      dire('Photo principale remplacée par la photo portée.', 'bon');
    };
  }

  /* ── VARIANTES PAR COULEUR ── ⚠ PAS FAL.AI : le site TEINTE au canevas, en
     local, sans clé ni crédit (produit:teinter — la même mécanique que « Tout
     générer » de l’éditeur du site). La boucle vit ICI : une image et une
     couleur par appel, le canal du pont porte les images une à la fois. La
     1ʳᵉ couleur est sautée (ses photos SONT celles du produit), une couleur
     sans teinte attribuée est sautée EN LE DISANT. Et comme l’éditeur du
     site, tout se REGÉNÈRE à l’enregistrement en mode auto. */
  var GEN_ENCOURS = false;
  function slotsSources(){
    var l = [];
    if (IMAGE) l.push({ cle: 'main', src: IMAGE });
    if (!modeStandard()) {
      (CTX.vuesAngles || []).forEach(function(k){ if (VUES[k]) l.push({ cle: k, src: VUES[k] }); });
    }
    return l;
  }
  function genererVariantes(fini){
    if (GEN_ENCOURS) { if (fini) fini(); return; }
    var cibles = couleurs().slice(1);
    var slots = slotsSources();
    if (!cibles.length || !slots.length) { if (fini) fini(); return; }
    GEN_ENCOURS = true;
    var b = document.getElementById('p-cv-gen');
    if (b) { b.disabled = true; b.textContent = '⏳ Génération…'; }
    var total = cibles.length * slots.length, fait = 0;
    var sautees = [], iC = 0, iS = 0, arret = '';
    function conclure(){
      GEN_ENCOURS = false;
      if (b) { b.disabled = false; b.textContent = '⚡ Tout générer'; }
      dessinerVues();
      if (arret) { dire('Variantes de couleur : ' + arret, 'err'); }
      else {
        dire('Variantes de couleur générées'
          + (sautees.length ? ' — sans teinte attribuée pour : ' + sautees.join(', ')
            + ' (Inventaire → Références)' : '') + '.', sautees.length ? 'att' : 'bon');
      }
      if (fini) fini(arret || null);
    }
    function suivant(){
      if (iC >= cibles.length) { conclure(); return; }
      if (iS >= slots.length) { iC++; iS = 0; suivant(); return; }
      var coul = cibles[iC], slot = slots[iS];
      fait++;
      dire('Variantes de couleur : ' + coul + ' (' + fait + '/' + total + ')…');
      P.appeler('produit:teinter', slot.src, coul).then(function(r){
        if (!r || !r.ok) {
          if (r && r.motif === 'couleur_non_mappee') {
            // Inutile d’essayer les autres vues de cette couleur.
            if (sautees.indexOf(coul) < 0) sautees.push(coul);
            iC++; iS = 0; suivant(); return;
          }
          if (r && (r.motif === 'operation_inconnue' || r.motif === 'session' || r.motif === 'droit')) {
            // Un refus qui frappera CHAQUE appel : on s’arrête au premier au
            // lieu de le collectionner N fois.
            arret = expliquer(r); conclure(); return;
          }
          // Échec d’une seule image : on continue, la photo principale de la
          // couleur peut réussir même si une vue échoue.
          iS++; suivant(); return;
        }
        PARCOUL[coul] = PARCOUL[coul] || {};
        PARCOUL[coul][slot.cle] = r.image;
        delete PARCOUL[coul].principale;
        iS++; suivant();
      });
    }
    suivant();
  }

  function brancherApercu(){
    var ba = document.getElementById('btn-apercu');
    if (ba) ba.onclick = ouvrirApercu;
  }

  // ══ JOURNAL DES MODIFICATIONS ═════════════════════════════════════════════
  // Reprise du « Résumé des changements » de l'éditeur du site : les mêmes champs
  // suivis, dans le même ordre, avec les mêmes mises en forme.
  // ⚠ DEUX PARTIES DE NATURES DIFFÉRENTES, et il faut les garder distinctes :
  //   — NON ENREGISTRÉES : écart entre l'état courant et celui pris à l'ouverture.
  //     Purement local, aucune question au serveur.
  //   — ENREGISTRÉES depuis moins de 24 h : c'est la BASE qui décide de la
  //     fenêtre de 24 h (colonne summary_until), pas l'horloge de ce poste. Un
  //     cache vidé ou une horloge décalée ne doivent pas changer ce qui est récent.
  var BASE = null;      // instantané pris à l'ouverture (modification seulement)
  var RECENT = null;    // { etat: 'attente'|'pret'|'erreur', entrees, motif }
  var OUVERT = {};      // horodatages dont l'auteur est révélé
  var JRN_T = null;

  function libCat(c){
    var x = (CTX.categories || []).find(function(y){ return y.cle === c; });
    return (x && x.libelle) || c || '';
  }
  function libEtiq(t){
    if (!t) return '';
    var x = (CTX.etiquettes || []).find(function(y){ return y.cle === t; });
    return (x && x.libelle) || String(t).replace(/^lbl:/, '');
  }
  function argentTxt(v){
    var n = argentNombre(v);
    return (n === null) ? '' : n.toFixed(2) + ' $';
  }
  // ⚠ LA MÊME LISTE QUE _PF_CHG_FIELDS DE L'ÉDITEUR DU SITE, VOLONTAIREMENT.
  // Le site n'y résout PAS les libellés du genre, du groupe d'âge, du style ni du
  // guide des tailles : il affiche la valeur brute. Je le reproduis tel quel — si
  // cet écran montrait « Chic décontracté » là où l'éditeur web montre
  // « chic_decontracte », les deux écrans ne diraient plus la même chose de la
  // même modification. À corriger DES DEUX CÔTÉS, pas d'un seul.
  var SUIVIS = [
    { c: 'nom',      l: 'Nom' },
    { c: 'cat',      l: 'Catégorie',            f: libCat },
    { c: 'marque',   l: 'Marque' },
    { c: 'etiq',     l: 'Étiquette',            f: libEtiq },
    { c: 'actif',    l: 'Visible en boutique',  f: function(x){ return x === '1' ? 'Oui' : 'Non'; } },
    { c: 'prix',     l: 'Prix régulier',        f: argentTxt },
    { c: 'solde',    l: 'Prix soldé',           f: argentTxt },
    { c: 'cout',     l: 'Coût d’acquisition',   f: argentTxt },
    { c: 'genre',    l: 'Genre' },
    { c: 'age',      l: 'Groupe d’âge' },
    { c: 'style',    l: 'Style' },
    { c: 'guide',    l: 'Guide des tailles' },
    { c: 'desc',     l: 'Description' },
    { c: 'tailles',  l: 'Tailles',   f: function(x){ return String(x).split(',').filter(Boolean).join(', '); } },
    { c: 'couleurs', l: 'Couleurs',  f: function(x){ return String(x).split(',').filter(Boolean).join(', '); } }
  ];
  function instantane(){
    return {
      nom: val('p-nom').trim(), cat: val('p-cat'), marque: val('p-marque').trim(),
      etiq: val('p-etiq'), actif: coché('p-actif') ? '1' : '0',
      prix: val('p-prix'), solde: val('p-solde'), cout: val('p-cout'),
      genre: val('p-genre'), age: val('p-age'), style: val('p-style'),
      guide: val('p-guide'), desc: val('p-desc').trim(),
      tailles: tailles().join(','), couleurs: couleurs().join(',')
    };
  }
  function enAttente(){
    if (!BASE) return [];
    var m = instantane(), l = [];
    SUIVIS.forEach(function(s){
      var a = BASE[s.c] == null ? '' : BASE[s.c];
      var b = m[s.c] == null ? '' : m[s.c];
      if (String(a) === String(b)) return;
      l.push({ l: s.l, av: (s.f ? s.f(a) : a) || '—', ap: (s.f ? s.f(b) : b) || '—' });
    });
    return l;
  }
  // Reprise de _pfAgo : « à l’instant », « il y a 12 min », « il y a 3 h 20 min ».
  function ilYa(ts){
    var m = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (m < 1) return 'à l’instant';
    if (m < 60) return 'il y a ' + m + ' min';
    var h = Math.floor(m / 60);
    return 'il y a ' + h + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '');
  }
  function dateLongue(ts){
    try { return new Date(ts).toLocaleString('fr-CA', { dateStyle: 'long', timeStyle: 'short' }); }
    catch (e) { return String(ts); }
  }
  function dateCourte(ts){
    try { return new Date(ts).toLocaleString('fr-CA', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (e) { return String(ts); }
  }

  function chargerRecent(){
    if (!ID) return;
    RECENT = { etat: 'attente', entrees: (RECENT && RECENT.entrees) || [], motif: '' };
    P.appeler('produit:changements', ID).then(function(r){
      if (!r || !r.ok) {
        RECENT = { etat: 'erreur', entrees: [], motif: expliquer(r) };
      } else {
        RECENT = { etat: 'pret', entrees: r.entrees || [], motif: '' };
      }
      majPastille();
      if (document.getElementById('jrn-corps')) dessinerJournal();
    });
  }
  function majPastille(){
    var b = document.getElementById('btn-jrn'), n = document.getElementById('jrn-n');
    if (!b || !n) return;
    if (!ID) { b.style.display = 'none'; return; }
    b.style.display = '';
    var enr = 0;
    if (RECENT && RECENT.etat === 'pret') {
      (RECENT.entrees || []).forEach(function(e){ enr += (e.changements || []).length; });
    }
    n.textContent = String(enAttente().length + enr);
  }

  function dif(av, ap){
    return '<div class="dif"><span class="av">' + esc(av) + '</span>'
      + '<span class="fl">→</span><span class="ap">' + esc(ap) + '</span></div>';
  }
  function sec(t){ return '<div class="sec"><span class="t">' + esc(t) + '</span><span class="tr"></span></div>'; }

  function dessinerJournal(){
    var z = document.getElementById('jrn-corps');
    if (!z) return;
    var att = enAttente();
    var h = '';
    if (att.length) {
      h += sec('Non enregistrées')
        + att.map(function(r){
            return '<div class="bl"><div class="et">' + esc(r.l) + '</div>' + dif(r.av, r.ap) + '</div>';
          }).join('');
    }
    if (RECENT && RECENT.etat === 'attente' && !(RECENT.entrees || []).length) {
      h += '<div class="fin">Lecture des modifications enregistrées…</div>';
    } else if (RECENT && RECENT.etat === 'erreur') {
      // ⚠ « INDISPONIBLE » N EST PAS « AUCUNE MODIFICATION ». Afficher une fiche
      // vierge sur une panne de réseau ferait croire qu’elle n’a jamais été
      // touchée — exactement l’inverse de ce qu’un journal doit garantir.
      h += '<div class="fin" style="color:#fbbf24">Modifications enregistrées indisponibles ('
        + esc(RECENT.motif) + ') — <span class="lien" id="jrn-retry">réessayer</span>.</div>';
    } else if (RECENT && (RECENT.entrees || []).length) {
      h += sec('Enregistrées — dernières 24 h')
        + RECENT.entrees.map(function(e){
            var k = String(e.ts), vu = !!OUVERT[k];
            return '<div class="bl cliq" data-qui="' + esc(k) + '" title="Cliquer pour voir qui a fait cette modification">'
              + '<div class="qd"><span title="' + esc(dateCourte(e.ts)) + '">' + esc(ilYa(e.ts)) + '</span>'
              + '<span style="opacity:.7">' + (vu ? '▴' : '▾') + '</span></div>'
              + (e.changements || []).map(function(c){
                  return '<div style="margin-bottom:.3rem"><div class="et">' + esc(c.libelle) + '</div>'
                    + dif(c.avant || '—', c.apres || '—') + '</div>';
                }).join('')
              + (vu ? '<div class="qui"><span class="ic">👤</span> <strong style="color:#e8edf5">'
                  + esc(e.par || 'Auteur non enregistré') + '</strong><br><span class="ic">🕘</span> '
                  + esc(dateLongue(e.ts)) + '</div>' : '')
              + '</div>';
          }).join('')
        + '<div class="fin">Après 24 h, ces modifications ne s’affichent plus ici — elles restent '
        + 'consultables dans <span class="lien" id="jrn-tout"><span class="ic">🕘</span> tout l’historique</span>.</div>';
    } else if (RECENT && RECENT.etat === 'pret' && !att.length) {
      h += '<div class="fin">Aucune modification depuis l’ouverture, et aucune enregistrée '
        + 'dans les dernières 24 h. <span class="lien" id="jrn-tout"><span class="ic">🕘</span> Tout l’historique</span></div>';
    }
    if (!h) h = '<div class="fin">Aucune modification.</div>';
    z.innerHTML = h;
  }

  function ouvrirJournal(){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite" style="max-width:640px">'
      + '<h3 style="color:#e8dcc6"><span class="ic">🕘</span> Modifications de cette fiche</h3>'
      + '<div class="jrn" id="jrn-corps"></div>'
      + '<div class="pied2"><button type="button" id="jrn-non">Fermer</button></div></div>';
    document.body.appendChild(v);
    dessinerJournal();
    document.getElementById('jrn-non').onclick = function(){ v.remove(); };
    v.addEventListener('click', function(ev){
      if (ev.target === v) { v.remove(); return; }
      if (ev.target.closest('#jrn-retry')) { chargerRecent(); dessinerJournal(); return; }
      if (ev.target.closest('#jrn-tout')) { v.remove(); ouvrirHistorique(); return; }
      // L'auteur n'est PAS montré d'office : on le révèle au clic sur le bloc
      // concerné, comme dans l'éditeur du site. L'état ouvert survit aux redessins.
      var b = ev.target.closest('[data-qui]');
      if (b) {
        var k = b.getAttribute('data-qui');
        OUVERT[k] = !OUVERT[k];
        dessinerJournal();
      }
    });
  }

  // L'historique COMPLET, groupé par année — le pendant de _pfShowHistory.
  function ouvrirHistorique(){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite" style="max-width:640px">'
      + '<h3 style="color:#e8dcc6"><span class="ic">🕘</span> Historique complet</h3>'
      + '<div class="jrn" id="hist-corps"><div class="fin">Lecture…</div></div>'
      + '<div class="pied2"><button type="button" id="hist-non">Fermer</button></div></div>';
    document.body.appendChild(v);
    document.getElementById('hist-non').onclick = function(){ v.remove(); };
    v.addEventListener('click', function(ev){ if (ev.target === v) v.remove(); });
    P.appeler('produit:historique', ID).then(function(r){
      var z = document.getElementById('hist-corps');
      if (!z) return;
      if (!r || !r.ok) {
        z.innerHTML = '<div class="fin" style="color:#fbbf24">Historique indisponible : '
          + esc(expliquer(r)) + '.<br>Rien n’est perdu — réessayez une fois reconnecté.</div>';
        return;
      }
      var e2 = r.entrees || [];
      if (!e2.length) { z.innerHTML = '<div class="fin">Aucune modification enregistrée pour cet article.</div>'; return; }
      var parAn = {};
      e2.forEach(function(e){
        var a;
        try { a = new Date(e.ts).getFullYear(); } catch (x) { a = '?'; }
        (parAn[a] = parAn[a] || []).push(e);
      });
      var ans = Object.keys(parAn).sort(function(a, b){ return b - a; });
      z.innerHTML = '<div class="fin" style="text-align:left;margin:0 0 .6rem">Modifications conservées '
        + 'jusqu’au retrait de l’article, archivées par année, purgées au-delà de 5 ans.</div>'
        + ans.map(function(a){
            var l = parAn[a];
            return '<div class="an">' + esc(a) + ' · ' + l.length + ' modification'
              + (l.length > 1 ? 's' : '') + '</div>'
              + l.map(function(e){
                  return '<div class="bl"><div class="qd"><span>' + esc(dateCourte(e.ts)) + '</span>'
                    + (e.par ? '<span>par ' + esc(e.par) + '</span>' : '') + '</div>'
                    + (e.changements || []).map(function(c){
                        return '<div style="margin-bottom:.3rem"><div class="et">' + esc(c.libelle) + '</div>'
                          + dif(c.avant || '—', c.apres || '—') + '</div>';
                      }).join('') + '</div>';
                }).join('');
          }).join('');
    });
  }

  // ══ BROUILLON AUTOMATIQUE ═════════════════════════════════════════════════
  // ⚠ IL NE PEUT PAS VIVRE ICI. Cette fenêtre est chargée en data:text/html :
  // son origine est nulle et localStorage y lève SecurityError — mesuré, pas
  // supposé. Le brouillon passe donc par le pont, dans le stockage du site, sous
  // une sous-clé qui lui est propre (voir pont.js).
  // ⚠ EN CRÉATION SEULEMENT, comme l'éditeur du site : sur une fiche existante, un
  // brouillon ferait concurrence à la fiche enregistrée sans qu'on sache laquelle
  // fait foi.
  var BR_DERNIER = '', BR_T = null, BR_FINI = false;
  function brCapturer(){
    return {
      ts: Date.now(),
      etape: Assist.i,
      f: {
        nom: val('p-nom'), cat: val('p-cat'), sku: val('p-sku'), marque: val('p-marque'),
        desc: val('p-desc'), genre: val('p-genre'), age: val('p-age'), style: val('p-style'),
        guide: val('p-guide'), etiq: val('p-etiq'), fourn: val('p-fourn'),
        prix: val('p-prix'), solde: val('p-solde'), cout: val('p-cout'),
        poids: val('p-poids'), unite: val('p-unite'), seuil: val('p-seuil'),
        limclient: val('p-limclient'),
        regime: val('p-regime'), retours: val('p-retours'), actif: coché('p-actif')
      },
      tailles: tailles(), couleurs: couleurs(),
      image: IMAGE || '', vues: VUES, parcoul: PARCOUL, stock: STOCK, locs: LOCS
    };
  }
  // « Utile » = la personne a réellement saisi quelque chose. On EXCLUT les
  // tailles, comme le site : sur une fiche neuve elles peuvent être cochées par
  // défaut, et l'on garderait un brouillon d'un formulaire vierge.
  function brUtile(d){
    return !!(d && d.f && (d.f.nom || d.f.prix || d.f.cout || d.image || d.f.desc
      || d.f.marque || (d.couleurs && d.couleurs.length)));
  }
  function brEnregistrer(){
    if (ID || BR_FINI) return;
    var d = brCapturer();
    if (!brUtile(d)) return;
    var s = JSON.stringify(d);
    // ⚠ ON N ENVOIE QUE SI QUELQUE CHOSE A CHANGÉ. Un brouillon porte des photos
    // en base64 : le repousser toutes les cinq secondes sans raison ferait voyager
    // plusieurs mégaoctets pour rien, à travers le pont, en continu.
    if (s === BR_DERNIER) return;
    BR_DERNIER = s;
    P.appeler('produit:brouillonEcrire', d).then(function(r){
      if (r && r.ok) return;
      // ⚠ UN BROUILLON QUI N EST PAS GARDÉ DOIT LE DIRE. Le site avale l'échec de
      // quota en silence ; ici on l'annonce, parce que se croire à l'abri est pire
      // que de savoir qu'on ne l'est pas.
      BR_DERNIER = '';
      dire('⚠ Brouillon non conservé — ' + expliquer(r), 'att');
    });
  }
  function brArreter(){ if (BR_T) { clearInterval(BR_T); BR_T = null; } }

  function brReprendre(d){
    var f = d.f || {};
    poser('p-nom', f.nom); poser('p-cat', f.cat); poser('p-sku', f.sku);
    poser('p-marque', f.marque); poser('p-desc', f.desc);
    poser('p-genre', f.genre); poser('p-age', f.age); poser('p-style', f.style);
    poser('p-guide', f.guide); poser('p-etiq', f.etiq); poser('p-fourn', f.fourn);
    poser('p-prix', f.prix); poser('p-solde', f.solde); poser('p-cout', f.cout);
    poser('p-poids', f.poids); poser('p-seuil', f.seuil);
    poser('p-limclient', f.limclient || '');
    // ⚠ UN BROUILLON ECRIT PAR LA VERSION PRECEDENTE ne porte que l ancien code
    // ('0' | '1' | '3' | '4'). On le traduit : sans cela la reprise reposerait
    // << Normal >> sur une fiche mise en vente finale, a l endroit precis ou l on
    // croit tout retrouver.
    poser('p-regime', f.regime === 'liq' || f.regime === '3' ? 'liq'
      : (f.regime === 'final' || f.regime === '1' ? 'final' : 'normal'));
    poser('p-retours', f.retours === 'aucun' || f.regime === '4' ? 'aucun' : 'ok');
    majRegime();
    // ⚠ L UNITÉ ET SA MÉMOIRE VONT ENSEMBLE. dataset.prec sert à convertir le
    // poids au changement d'unité ; le laisser sur « g » après avoir restauré
    // « kg » ferait multiplier le poids par mille au premier changement.
    var uni = document.getElementById('p-unite');
    if (uni) { uni.value = f.unite || 'g'; uni.dataset.prec = uni.value; }
    var a = document.getElementById('p-actif'); if (a) a.checked = f.actif !== false;
    Array.prototype.forEach.call(document.querySelectorAll('#p-tailles .jeton'), function(j){
      j.classList.toggle('on', (d.tailles || []).indexOf(j.getAttribute('data-t')) >= 0);
    });
    CHOIX = (d.couleurs || []).map(String);
    IMAGE = d.image || '';
    VUES = Object.assign({}, d.vues || {});
    // Un brouillon d’une version antérieure porte encore la clé « principale ».
    PARCOUL = parcoulDepuisFiche(d.parcoul);
    STOCK = Object.assign({}, d.stock || {});
    LOCS = Object.assign({}, d.locs || {});
    montrerImage(IMAGE);
    dessinerJetons(); majMarge(); majIa(); majNom();
    // On repart de l'étape où la personne s'était arrêtée : la ramener à la
    // première l'obligerait à retraverser ce qu'elle avait déjà rempli.
    if (typeof d.etape === 'number') Assist.aller(Math.max(0, Math.min(4, d.etape)));
    else Assist.fil();
    // Le brouillon restauré est déjà celui du stockage : sans cette ligne, le
    // premier tic le réécrirait à l'identique.
    BR_DERNIER = JSON.stringify(brCapturer());
    dire('Brouillon repris.', 'bon');
  }

  // ⚠ UNE BOÎTE, PAS UN BANDEAU. L'éditeur du site pose un bandeau au-dessus du
  // formulaire parce que sa page défile ; ici une étape doit tenir dans la
  // fenêtre, et un bandeau permanent volerait la place d'une carte. La question
  // se pose une fois, à l'ouverture, et disparaît.
  function brProposer(){
    if (ID) return Promise.resolve();
    return P.appeler('produit:brouillonLire').then(function(r){
      if (!r || !r.ok || !r.brouillon || !brUtile(r.brouillon)) return;
      return new Promise(function(resoudre){
        var v = document.createElement('div');
        v.className = 'voile';
        v.innerHTML = '<div class="boite"><h3 style="color:#e8dcc6"><span class="ic">📝</span> Un brouillon non terminé</h3>'
          + '<p>Une saisie a été laissée en cours <strong>' + esc(ilYa(r.brouillon.ts))
          + '</strong>. La reprendre, ou repartir d’une fiche vierge ?</p>'
          + '<p style="font-size:.78rem;color:#8fa1b8">Un brouillon est gardé 15 minutes, '
          + 'puis il disparaît de lui-même.</p>'
          + '<div class="pied2"><button type="button" id="br-non">Repartir à neuf</button>'
          + '<button type="button" class="prim" id="br-oui">Reprendre</button></div></div>';
        document.body.appendChild(v);
        document.getElementById('br-oui').onclick = function(){
          v.remove(); brReprendre(r.brouillon); resoudre();
        };
        document.getElementById('br-non').onclick = function(){
          v.remove(); P.appeler('produit:brouillonJeter'); BR_DERNIER = ''; resoudre();
        };
      });
    });
  }

  function verrou(){
    if (!ID) return Promise.resolve();
    return P.appeler('verrou:prendre', 'products', ID).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      if (v.obtenu) { sous.textContent = v.horsLigne ? '🔓 hors ligne' : '🔒 Section verrouillée en modification par : ' + (v.par || 'vous'); return; }
      sous.textContent = '⚠ ouverte par ' + (v.parQui || 'quelqu’un d’autre');
      bEnr.disabled = true;
      dire('Enregistrement bloqué : cette fiche est ouverte ailleurs.', 'err');
    });
  }

  function charger(){
    P.appeler('produit:contexte').then(function(c){
      if (!c || !c.ok) { vide('Formulaire indisponible', expliquer(c)); return; }
      CTX = c;
      return P.appeler('produit:lire', ID).then(function(r){
        if (!r || !r.ok) { vide('Fiche indisponible', expliquer(r)); return; }
        FICHE = r.fiche;
        document.getElementById('titre').textContent = ID ? 'Modifier le produit' : 'Nouveau produit';
        dessiner();
        brancherApercu();
        if (ID) {
          // ⚠ L INSTANTANÉ SE PREND APRÈS remplir, jamais avant : pris trop tôt
          // il serait vide, et la fiche entière passerait pour « modifiée » dès
          // l'ouverture — un journal qui crie au loup ne se lit plus.
          BASE = instantane();
          chargerRecent();
          // La fenêtre des 24 h expire côté serveur pendant qu'on travaille : on
          // redemande chaque minute, comme l'éditeur du site, plutôt que de
          // recalculer une échéance ici avec l'horloge de ce poste.
          JRN_T = setInterval(chargerRecent, 60000);
          var bj = document.getElementById('btn-jrn');
          if (bj) bj.onclick = ouvrirJournal;
          // La pastille suit la saisie : un écart apparaît dès qu'on touche un champ.
          document.getElementById('corps').addEventListener('input', majPastille);
          document.getElementById('corps').addEventListener('change', majPastille);
          majPastille();
        } else {
          // Autosauvegarde toutes les 5 secondes, comme l'éditeur du site.
          BR_T = setInterval(brEnregistrer, 5000);
        }
        return verrou().then(function(){ return brProposer(); });
      });
    });
  }

  // ⚠ VENDRE SOUS LE COUT RESTE POSSIBLE — c est parfois voulu (ecoulement, fin
  // de serie) — mais jamais SANS TRACE ni sans autorisation. La raison est
  // ecrite dans la fiche, et un code est exige s il en existe un.
  var SOUSCOUT = null;   // { raison, nip } une fois accorde
  var VAR_FAITES = false; // variantes de couleur regenerees pour CET envoi
  function demanderSousCout(eff, cout){
    return P.appeler('produit:nipExige').then(function(x){
      var exige = !!(x && x.exige);
      return new Promise(function(resoudre){
        var v = document.createElement('div');
        v.className = 'voile';
        v.innerHTML = '<div class="boite"><h3>⚠ Prix inférieur au coût d’acquisition</h3>'
          + '<p>Le prix de vente effectif (<strong>' + eff.toFixed(2) + ' $</strong>) est inférieur '
          + 'au coût d’acquisition (<strong>' + cout.toFixed(2) + ' $</strong>).</p>'
          + '<div class="ch"><label for="bc-raison">Raison <span class="req">*</span></label>'
          + '<textarea id="bc-raison" rows="3" placeholder="Écoulement de fin de série, article abîmé…"></textarea></div>'
          + (exige ? '<div class="ch" style="margin-top:.5rem"><label for="bc-nip">Code d’autorisation <span class="req">*</span></label>'
              + '<input id="bc-nip" type="password" autocomplete="off"></div>' : '')
          + '<div class="msg err" id="bc-err" style="min-height:1.1em;margin-top:.4rem"></div>'
          + '<div class="pied2"><button type="button" id="bc-non">Annuler</button>'
          + '<button type="button" class="prim" id="bc-oui">Autoriser et enregistrer</button></div></div>';
        document.body.appendChild(v);
        var r = document.getElementById('bc-raison'); if (r) r.focus();
        document.getElementById('bc-non').onclick = function(){ v.remove(); resoudre(null); };
        document.getElementById('bc-oui').onclick = function(){
          var raison = (document.getElementById('bc-raison').value || '').trim();
          var err = document.getElementById('bc-err');
          if (!raison) { err.textContent = 'La raison est obligatoire.'; return; }
          var nip = exige ? (document.getElementById('bc-nip').value || '') : '';
          P.appeler('produit:nip', nip).then(function(z){
            if (!z || !z.ok) { err.textContent = expliquer(z); return; }
            if (!z.valide) { err.textContent = 'Code incorrect — réessayez.'; return; }
            v.remove(); resoudre({ raison: raison });
          });
        };
      });
    });
  }

  function enregistrer(){
    if (!Assist.toutValide()) return;
    if (!tailles().length || !couleurs().length) {
      Assist.aller(1);
      dire('Choisissez au moins une taille ET une couleur avant d’enregistrer.', 'err');
      return;
    }
    if (!IMAGE) {
      Assist.aller(2);
      dire('La photo principale est obligatoire.', 'err');
      return;
    }
    // ⚠ REGLE ARRETEE le 2026-08-08 (2e passe, a sa demande) : l emplacement
    // suit la QUANTITE — une variante a zero n en exige pas — mais une
    // CREATION doit porter du stock : au moins une variante avec une
    // quantite. La fiche << tout a zero >> se creait sans un mot. En
    // MODIFICATION, pas d exigence : un produit vendu a zero reste modifiable.
    var enStock = [];
    tailles().forEach(function(t){ couleurs().forEach(function(c){
      if ((STOCK[t + '-' + c] || 0) > 0) enStock.push(t + '-' + c);
    }); });
    if (!ID && !enStock.length) {
      Assist.aller(4);
      dire('Saisissez une quantité pour au moins une variante avant d’enregistrer.', 'err');
      return;
    }
    if (CTX && (CTX.entrepots || []).length) {
      var sansLieu = enStock.filter(function(k){ return !LOCS[k]; });
      if (sansLieu.length) {
        Assist.aller(4);
        dire('Sélectionnez un emplacement d’entrepôt pour : '
          + sansLieu.slice(0, 3).join(', ')
          + (sansLieu.length > 3 ? '… (' + sansLieu.length + ' variantes)' : '') + '.', 'err');
        return;
      }
    }
    // On regarde AVANT d envoyer : le refus doit arriver pendant qu on a encore
    // le formulaire sous les yeux.
    var pr = argentNombre(val('p-prix')) || 0;
    var so = argentNombre(val('p-solde')) || 0;
    var co = argentNombre(val('p-cout')) || 0;
    var eff = (so > 0 && so < pr) ? so : pr;
    if (co > 0 && eff > 0 && eff < co && !SOUSCOUT) {
      demanderSousCout(eff, co).then(function(a){
        if (!a) { dire('Enregistrement annulé.', 'att'); return; }
        SOUSCOUT = a; enregistrer();
      });
      return;
    }
    // ⚠ COMME L’ÉDITEUR DU SITE : en mode auto, les variantes de couleur se
    // RÉGÉNÈRENT à l’enregistrement (le bouton de l’éditeur affiche le même
    // « ⏳ Génération… » avant d’écrire). Après la question du sous-coût, pour
    // ne pas faire attendre la personne avant de l’interroger. Un échec de
    // teinte n’empêche PAS d’enregistrer : générer est un plus, pas une porte.
    if (!VAR_FAITES && modeAutoCouleur() && IMAGE && couleurs().length > 1) {
      bEnr.disabled = true;
      genererVariantes(function(){
        bEnr.disabled = false;
        VAR_FAITES = true;
        enregistrer();
      });
      return;
    }
    // Le stock est purge des variantes qui n existent plus : garder une quantite
    // sur une couleur retiree la ferait compter dans l inventaire sans qu aucun
    // ecran ne la montre.
    var valides = {};
    tailles().forEach(function(t){ couleurs().forEach(function(c){ valides[t + '-' + c] = true; }); });
    var stock = {}, locs = {};
    Object.keys(STOCK).forEach(function(k){ if (valides[k] && STOCK[k] > 0) stock[k] = STOCK[k]; });
    Object.keys(LOCS).forEach(function(k){ if (valides[k] && LOCS[k]) locs[k] = LOCS[k]; });

    bEnr.disabled = true;
    dire(IMAGE && IMAGE.indexOf('data:') === 0 ? 'Dépôt de la photo et enregistrement…' : 'Enregistrement…');
    P.appeler('produit:enregistrer', ID, {
      name: val('p-nom').trim(), category: val('p-cat'), sku: val('p-sku'),
      brand: val('p-marque'), description: val('p-desc'),
      genre: val('p-genre'), ageGroup: val('p-age'), style: val('p-style'),
      sizeGuideId: val('p-guide'), tag: val('p-etiq'), supplierId: val('p-fourn'),
      price: argentNombre(val('p-prix')),
      salePrice: argentNombre(val('p-solde')),
      acquisitionCost: argentNombre(val('p-cout')),
      weight: enKg(val('p-poids'), val('p-unite')),
      lowStock: parseInt(val('p-seuil'), 10),
      buyMaxClient: (parseInt(val('p-limclient'), 10) >= 1) ? parseInt(val('p-limclient'), 10) : null,
      active: coché('p-actif'), regime: val('p-regime'), retours: val('p-retours'),
      sizes: tailles(), colors: couleurs(),
      image: IMAGE,
      belowCost: !!SOUSCOUT,
      belowCostReason: SOUSCOUT ? SOUSCOUT.raison : '',
      additionalImages: VUES,
      // Les photos des couleurs RETIREES ne partent pas : le site les
      // televerserait puis les garderait dans le stockage sans que rien ne les
      // affiche jamais.
      colorVariants: (function(){
        var g = {}, cs = couleurs();
        cs.forEach(function(c){ if (PARCOUL[c]) g[c] = PARCOUL[c]; });
        return g;
      })(),
      stock: stock, stockLoc: locs
    }).then(function(r){
      // Le prochain envoi repart de zéro : les photos ont pu changer entre-temps.
      VAR_FAITES = false;
      if (!r || !r.ok) {
        bEnr.disabled = false;
        if (r && r.motif === 'delai') {
          // ⚠ Le plafond du pont a sonne mais le SITE continue le depot de la
          // photo : la fiche est souvent enregistree quand meme. Recommencer
          // tout de suite fabriquerait un DOUBLON.
          dire('L’enregistrement prend du temps (dépôt de la photo) et se poursuit '
            + 'peut-être — vérifiez la liste des produits avant de recommencer.', 'att');
          return;
        }
        // Le DOUBLE FILET du pont : on RAMÈNE à l’étape fautive, exactement
        // comme les gardes locales — un refus sans l’écran concerné sous les
        // yeux oblige à chercher ce qui manque.
        if (r && r.motif === 'tailles_couleurs_requises') Assist.aller(1);
        if (r && r.motif === 'photo_requise') Assist.aller(2);
        if (r && r.motif === 'stock_requis') Assist.aller(4);
        if (r && r.motif === 'emplacement_requis') {
          Assist.aller(4);
          dire('Sélectionnez un emplacement d’entrepôt pour : '
            + (r.manquants || []).join(', ') + '.', 'err');
          return;
        }
        dire(expliquer(r), 'err');
        return;
      }
      // ⚠ LE BROUILLON SE JETTE SEULEMENT MAINTENANT, et l'autosauvegarde s'arrête
      // AVANT : sans cela, un dernier tic le réécrirait juste après l'avoir jeté,
      // et la prochaine ouverture proposerait de reprendre une fiche déjà créée.
      BR_FINI = true; brArreter();
      if (!ID) P.appeler('produit:brouillonJeter');
      dire('Enregistré.', 'bon');
      setTimeout(function(){ P.fermer(); }, 700);
    });
  }

  // ⚠ ON NE FERME PAS SANS AVOIR GARDÉ LA SAISIE. Fermer par mégarde après dix
  // minutes de travail est exactement le cas où un brouillon sert à quelque chose.
  // On attend la réponse du pont avant de fermer : la fenêtre disparue, plus
  // personne ne porte l'écriture.
  function fermerProprement(){
    brArreter();
    if (ID || BR_FINI) { P.fermer(); return; }
    var d = brCapturer();
    if (!brUtile(d)) { P.fermer(); return; }
    dire('Brouillon conservé…');
    P.appeler('produit:brouillonEcrire', d).then(function(){ P.fermer(); });
  }

  /* ⚠⚠ AUCUNE GLISSIERE, A AUCUNE ETAPE — ET QUE CA LE RESTE MALGRE LES AJOUTS.
     Le corps ne defile pas (regle du socle) : quand une etape est plus haute que
     la fenetre, elle etait COUPEE en bas (vu sur << Identite, prix et poids >>,
     2026-08-07). La fenetre se met donc A LA TAILLE DE SON CONTENU :
     - a chaque etape et a CHAQUE changement du contenu (MutationObserver — un
       jeton de couleur ajoute, une ligne de stock de plus, tout est vu, y
       compris ce qu on ajoutera plus tard), la hauteur necessaire est mesuree
       et demandee au processus principal ;
     - << garder >> : la fenetre reste ou la personne l a posee (juste ramenee dans
       l ecran si le bas sort), au lieu d etre recentree a chaque etape ;
     - le principal PLAFONNE a la hauteur de l ecran ; si malgre tout ca ne
       tient pas (petit ecran), on REDUIT LE RENDU (zoom) plutot que de couper
       ou de faire apparaitre une glissiere. */
  var calT = null, calDern = 0;
  function caler(){
    if (!P || !P.ajusterHauteur) return;
    var corps = document.getElementById('corps');
    if (!corps || !corps.style) return;
    corps.style.zoom = '';
    var besoin = document.body.scrollHeight - corps.clientHeight + corps.scrollHeight;
    if (!(besoin > 0)) return;
    // On ne redemande pas la meme hauteur en boucle : l observateur voit aussi
    // nos propres retouches de style.
    if (Math.abs(besoin - calDern) < 3) { secours(); return; }
    calDern = besoin;
    P.ajusterHauteur(besoin + 2, true);
  }
  function secours(){
    var corps = document.getElementById('corps');
    if (!corps || !corps.style) return;
    corps.style.zoom = '';
    var deb = corps.scrollHeight, vu = corps.clientHeight;
    if (deb > 0 && vu > 0 && deb > vu + 4) corps.style.zoom = String(Math.max(0.7, vu / deb));
  }
  function calerBientot(){ clearTimeout(calT); calT = setTimeout(caler, 120); }
  window.addEventListener('resize', function(){ clearTimeout(calT); calT = setTimeout(secours, 150); });
  if (typeof MutationObserver !== 'undefined') {
    // childList + subtree SEULEMENT : observer les attributs verrait nos propres
    // changements de style (zoom) et tournerait en rond.
    new MutationObserver(calerBientot).observe(document.getElementById('corps'), { childList: true, subtree: true });
  }
  document.getElementById('pas').addEventListener('click', calerBientot);
  document.getElementById('btn-prec').addEventListener('click', calerBientot);
  document.getElementById('btn-suiv').addEventListener('click', calerBientot);
  calerBientot();

  bEnr.onclick = enregistrer;
  document.getElementById('btn-annuler').onclick = fermerProprement;
  document.addEventListener('keydown', function(ev){
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 's' || ev.key === 'S')) {
      ev.preventDefault(); if (!bEnr.disabled) enregistrer();
    }
    if (ev.key === 'Escape') {
      ev.preventDefault();
      // ⚠ ÉCHAP FERME D ABORD CE QUI EST PAR-DESSUS. Sans ce test, fermer une
      // boîte de dialogue fermait LA FENÊTRE : on demandait à quitter un journal
      // et l'on perdait la fiche en cours de saisie.
      var voiles = document.querySelectorAll('.voile');
      if (voiles.length) { voiles[voiles.length - 1].remove(); return; }
      fermerProprement();
    }
  });
  charger();
})();
</script></body></html>`;
}

module.exports = { pageProduit };
