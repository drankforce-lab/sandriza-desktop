'use strict';

/*
 * FENÊTRE « RÉSEAUX SOCIAUX » — NATIVE (1.70.0, palier 4)
 * =============================================================================
 * La FILE d'attente et l'HISTORIQUE des publications : quatre compteurs, chaque
 * entrée avec son contenu et ses réseaux, publier une entrée ou toute la file,
 * ignorer, vider le journal.
 *
 * ⚠⚠ LES PATRONS DE PUBLICATION SONT ICI DEPUIS #33. Cet en-tête disait qu'ils
 * « restaient à l'écran web et suivraient avec la Configuration, au palier 5 ».
 * Les jetons ont suivi (3.7.0) ; les patrons, jamais — et l'écran web ne
 * s'ouvre plus depuis que cette section est ancrable. Ils sont donc restés
 * joignables NULLE PART, comme la configuration du chat. Trouvé par l'audit
 * de couverture (#32).
 * ⚠ Ils vivent dans la fenêtre des OPÉRATIONS, pas dans celle de la
 * configuration : on ajuste un patron en regardant la file qu'il produit.
 * Les COMPTES et JETONS, eux, restent dans Configuration → Communications.
 *
 * ⚠ PUBLIER ENGAGE L'EXTÉRIEUR. Le message part chez Facebook, Instagram ou X
 * et ne se rattrape pas : le bouton s'arme en deux clics, et le verdict est
 * donné RÉSEAU PAR RÉSEAU. Annoncer « publié » sur un envoi partiel enverrait
 * chercher longtemps une publication qui n'est jamais partie.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, JS_TUILES, CSS_JOUR, ICO, TETE } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('sociaux');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
button .n.hi{background:rgba(245,158,11,.25);color:var(--tx-att)}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.att{color:var(--tx-att)}.tuile .val.bon{color:var(--tx-ok)}.tuile .val.err{color:var(--tx-err)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:var(--tx2);font-weight:700}
.entree{border-top:1px solid var(--v055);padding:.5rem .1rem}
.entree:first-of-type{border-top:0}
.entree .haut{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.entree .droite{margin-left:auto;display:flex;gap:.35rem;align-items:center}
.entree .texte{font-size:.84rem;white-space:pre-wrap;overflow-wrap:anywhere;
  margin-top:.25rem;color:var(--tx-bleute);max-height:5.5rem;overflow:auto}
.res{display:inline-flex;gap:.3rem;align-items:center}
.res span{font-size:1rem}
.dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.detail{margin-top:.35rem;display:flex;gap:.4rem;flex-wrap:wrap}
/* ── Editeur de patron (#33) ── */
label.champ{display:block;margin:0 0 .7rem}
label.champ .lbl{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;
  color:var(--tx2);margin:0 0 .22rem}
label.champ .sub{display:block;font-size:.68rem;color:var(--tx3);margin:.2rem 0 0;line-height:1.5}
input.t,select.t,textarea.t{width:100%;background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;
  color:var(--tx);font:inherit;font-size:.85rem;padding:.4rem .55rem}
textarea.t{resize:vertical;line-height:1.5}
input.t:focus,select.t:focus,textarea.t:focus{outline:none;border-color:#c9a97e}
.cases{display:flex;flex-wrap:wrap;gap:.5rem}
label.case{display:inline-flex;align-items:center;gap:.35rem;font-size:.82rem;cursor:pointer;
  border:1px solid var(--v12);border-radius:9px;padding:.25rem .55rem;
  background:var(--v03);-webkit-user-select:none;user-select:none}
label.case input{width:15px;height:15px;accent-color:#c9a97e}
.vide{padding:1.3rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
/* ══ L EPINGLE PINTEREST (#115, 2026-09-14) ═════════════════════════════════
   Deux colonnes : ce qu on ecrit a gauche, ce que Pinterest montrera a droite.
   ⚠ L APERCU GARDE SON RAPPORT PAR aspect-ratio, ET PAS PAR UNE HAUTEUR EN
   PIXELS — et ce rapport est POSE EN LIGNE, depuis la fiche du reseau choisi.
   Chaque reseau ne montre en entier qu un format ; un apercu qui mentirait d un
   cheveu sur la proportion ferait valider un cadrage qui sera rogne. Le 2:3
   ci-dessous n est que le defaut, celui de Pinterest.
   ⚠ AUCUNE OPACITE SUR UN TEXTE (lecon du 2026-09-14) : --tx2 est mesure. */
.epg{display:grid;grid-template-columns:minmax(0,1fr) 20rem;gap:.9rem;align-items:start}
@media (max-width:52rem){.epg{grid-template-columns:minmax(0,1fr)}}
.epg .cg,.epg .cd{display:flex;flex-direction:column;gap:.5rem;min-width:0}
.epia{border:1px solid var(--v16);border-radius:9px;background:var(--v05);padding:.55rem .65rem}
.epia .tt{display:flex;align-items:center;gap:.4rem;margin-bottom:.45rem}
.epia .tt .ic{font-size:.85rem}
.epia .tt b{font:700 .8rem/1.2 system-ui;flex:1 1 auto;min-width:0}
.epia .tt button{font-size:.72rem;padding:.2rem .5rem;border-radius:7px}
.epg .g{display:grid;grid-template-columns:repeat(auto-fit,minmax(8.5rem,1fr));gap:.35rem;margin-bottom:.35rem}
.epg .plein{grid-column:1/-1}
.epg label{font-size:.7rem;color:var(--tx2);display:block;margin-bottom:.1rem}
.epg input,.epg select,.epg textarea{width:100%;font-size:.8rem;padding:.26rem .4rem}
.epg textarea{font-family:inherit;min-height:3.2rem}
.epg .pied{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
.epg .pied .aide{color:var(--tx2);font-size:.72rem;margin-left:auto}
.epg .cnt{font-size:.68rem;color:var(--tx2);text-align:right}
.epg .cnt.trop{color:var(--tx-err)}
.epvue{border:1px solid var(--v16);border-radius:9px;overflow:hidden;background:#F8F6F3;
  aspect-ratio:2/3;display:flex;align-items:center;justify-content:center}
.epvue img{display:block;width:100%;height:100%;object-fit:contain}
.epvue .rien{font-size:.76rem;color:#4A4A4A;padding:1rem;text-align:center}
.epinfo{font-size:.7rem;color:var(--tx2);text-align:center}
.epenv{border-top:1px solid var(--v12);padding-top:.5rem;margin-top:.2rem;
  display:grid;grid-template-columns:1fr auto;gap:.35rem;align-items:end}
.epenv label{grid-column:1/-1;font-size:.7rem;color:var(--tx2);display:block;margin-bottom:.1rem}
.epenv input{width:100%;font-size:.8rem;padding:.26rem .4rem}
.epenv .epinfo{grid-column:1/-1;text-align:left}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Réseaux sociaux ».
 * `onglet` = 'historique', 'patrons' ou 'epingle' pour ouvrir directement dessus.
 * ⚠ Sans ce paramètre, le garde-fou ne verrait QUE la file : il ne simule aucun
 * clic, et l'onglet des patrons — celui qui avait disparu — resterait dans
 * l'ombre exactement comme avant.
 * ⚠ `epingle` y est entré le 2026-09-14 EN MÊME TEMPS QUE L'ONGLET, et pas
 * après : un onglet qu'aucun banc n'ouvre est un onglet dont on n'apprend la
 * panne que par lui.
 */
function pageSociaux(onglet) {
  /* ⚠⚠ « PUBLICATION IA » EST L'ONGLET PAR DÉFAUT DEPUIS LE 2026-09-14, à sa
     demande. Et ce n'est pas un raccourci de confort : cette fenêtre a changé de
     métier. La FILE d'attente était sa raison d'être quand elle ne servait qu'à
     pousser des publications déjà écrites ailleurs ; depuis que l'écriture se
     fait ICI, on l'ouvre pour CRÉER neuf fois sur dix. Un écran s'ouvre sur ce
     qu'on vient y faire, pas sur ce qu'il faisait avant.
     ⚠ ÇA VAUT POUR LES DEUX PORTES — le menu « Édition publicitaire » et
     l'entrée « Réseaux sociaux » de Marketing mènent à la MÊME fenêtre, et il
     n'y en a qu'une. Lui donner deux onglets de départ selon l'entrée
     emprunterait deux vérités pour un seul écran ; la file reste à un clic. */
  const depart = (['historique', 'patrons', 'file', 'epingle'].indexOf(String(onglet || '')) >= 0)
    ? String(onglet) : 'epingle';
  return `${TETE()}
<title>${T("Réseaux sociaux — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.social}</span><h1>${T("Réseaux sociaux")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_BROUILLON()}${JS_TUILES('sociaux')}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var ONGLET = '${depart}';  // file | historique | patrons
  var ARME = '';             // id arme pour publication, ou '__tout', ou '__vider'
  var OCCUPE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux réseaux sociaux.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cette publication n’existe plus.")}',
    file_vide:          '${T("Il n’y a rien à publier.")}',
    publication:        '${T("La publication a échoué.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 160)) + ')';
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  var LIB = { published: '${T("Publiée")}', partial: '${T("Partielle")}', failed: '${T("Échouée")}',
              skipped: '${T("Ignorée")}', pending: '${T("En attente")}' };
  var TONS = { published: 'bon', partial: 'att', failed: 'err',
               skipped: 'neutre', pending: 'att' };

  function reseaux(list){
    if (!list.length) return '<span class="dt">${T("aucun réseau")}</span>';
    return '<span class="res">' + list.map(function(r){
      return '<span title="' + esc(r.nom) + '">' + esc(r.icone || r.nom) + '</span>';
    }).join('') + '</span>';
  }

  /* Le detail PAR RESEAU : c est lui qui distingue << tout est parti >> de
     << deux sur trois >>. Sans lui, une publication partielle passe pour un
     succes et l on cherche longtemps ce qui n est jamais parti. */
  function detailResultats(rs){
    if (!rs || !rs.length) return '';
    return '<div class="detail">' + rs.map(function(x){
      return '<span class="pill ' + (x.ok ? 'bon' : 'err') + '" title="' + esc(x.detail || '') + '">'
        + esc(x.reseau) + (x.ok ? ' ✓' : ' ✕') + '</span>';
    }).join('') + '</div>';
  }

  function entree(e, avecGestes){
    var h = '<div class="entree"><div class="haut">'
      + '<strong>' + esc(e.patron || '${T("Publication")}') + '</strong>'
      + '<span class="pill ' + (TONS[e.statut] || 'neutre') + '">' + esc(LIB[e.statut] || e.statut) + '</span>'
      + reseaux(e.reseaux || [])
      + (e.image ? '<span class="pill neutre">${T("image")}</span>' : '')
      + '<span class="droite">';
    if (avecGestes && D.peutModifier) {
      h += '<button class="mini geste prim" data-publier="' + esc(e.id) + '">'
        + (ARME === e.id ? '${T("Confirmer l’envoi ?")}' : '${T("Publier")}') + '</button>'
        + '<button class="mini geste" data-ignorer="' + esc(e.id) + '">${T("Ignorer")}</button>';
    }
    h += '<span class="dt">' + esc(e.partie || e.creee) + '</span>'
      + '</span></div>'
      + '<div class="texte">' + esc(e.contenu || '') + '</div>'
      + detailResultats(e.resultats)
      + '</div>';
    return h;
  }

  /* ══ PATRONS DE PUBLICATION (#33) ═══════════════════════════════════════════
     ⚠ ILS N ETAIENT JOIGNABLES NULLE PART. L en-tete de ce fichier promettait
     qu ils << suivraient avec la Configuration, au palier 5 >> ; les jetons ont
     suivi en 3.7.0, les patrons jamais — et l ecran web ne s ouvre plus depuis
     que cette section est ancrable (1.70.0). Trouve par l audit #32.
     ⚠ ILS VIVENT ICI ET NON DANS LA FENETRE DE CONFIGURATION : on ajuste un
     patron en regardant la file qu il produit, pas en saisissant un jeton.
     ⚠ UN PATRON FOURNI D ORIGINE NE SE SUPPRIME PAS, il se desactive : le
     retirer le ferait reapparaitre au prochain chargement, puisque la liste
     enregistree est FUSIONNEE avec les defauts. Le coeur refuse, on le dit. */
  var PAT = null;        // patrons:liste
  var EDIT = null;       // patron en cours d edition, ou 'nouveau'
  var PAT_ARME = '';     // suppression armee

  /* ══ L EPINGLE PINTEREST (#115, 2026-09-14) ═══════════════════════════════
     Sa demande, dans ses mots : << le plus important pinterest >>.

     ⚠⚠ ET C EST LE RESEAU QUI RESSEMBLE LE MOINS AUX AUTRES. Une publication
     Facebook est un texte avec une image en piece jointe ; une epingle est une
     IMAGE, verticale, dont le texte fait partie du dessin. Pinterest est un
     MOTEUR DE RECHERCHE, pas un fil : une epingle se retrouve six mois plus
     tard par ses MOTS, pas par sa date. C est pourquoi cet onglet ecrit trois
     choses a la fois — le texte peint dans l image, le titre, et une
     description faite pour etre CHERCHEE.

     ⚠⚠ LA FENETRE NE PEINT PAS L EPINGLE. Elle envoie un modele et recoit une
     image : seule la page du site a l origine du stockage, et un canevas qui
     dessinerait ici une photo de produit serait TEINT — l apercu marcherait,
     l export echouerait, et l erreur parlerait de securite au lieu d image.
     C est mot pour mot la lecon de l editeur d objets promotionnels.

     ⚠⚠ TOUT CE QUE L IA ECRIT EST DANS UN CHAMP, PAS DANS UN BLOC DE TEXTE.
     Sa demande vaut ici comme pour le courriel : << je dois etre en mesure
     d apporter des modifications >>. Chaque champ redessine l apercu — on voit
     donc ce qu on change pendant qu on le change, au lieu de deviner. */
  /* ⚠⚠ UN CHOIX DE RESEAU, PAS TROIS ONGLETS (#115, Facebook et Instagram).
     Sa demande dit exactement la forme : << si je choisis Facebook ca me genere
     un post […] meme chose pour Instagram, et le plus important Pinterest >>.
     C est UN flux dont la SORTIE s adapte, pas trois outils cote a cote. Trois
     onglets auraient fait retaper la meme demande trois fois pour la meme
     annonce — et auraient invite a trois bouts de code qui divergent.
     ⚠ Le format, les bornes et le droit de poser un lien viennent du COEUR
     (nl:epingleDonnees rend la table des reseaux). Les recopier ici ferait deux
     verites : le jour ou Instagram change de format, l apercu mentirait sur ce
     que l export produit. */
  var EPRES = 'pinterest'; // pinterest | instagram | facebook
  var EPD = null;        // nl:epingleDonnees
  var EP = null;         // le modele en cours : { produitId, sur, gros, sous, titre, description, alt, motsCles, lien }
  var EPIMG = '';        // la derniere image rendue (data URL)
  var EPMODE = 'simple'; // simple | avance
  var EPOCC = false;     // un appel IA est en cours
  var EPRENDU = false;   // un rendu est en cours
  var EPETAT = null;     // nl:iaEtat — cle posee ? plafond ?
  var EPMINUT = null;    // le rendu differe apres une frappe

  /* ⚠⚠ LE MODELE PORTE UNE SUITE DE DIAPOS, MEME QUAND IL N EN A QU UNE.
     TikTok publie plusieurs images ; les trois autres une seule. Ecrire << si
     tiktok, alors une boucle >> aurait mis ce << si >> dans l edition, dans le
     rendu, dans l apercu et dans l export — quatre endroits a tenir d accord.
     Ici, tout le monde a une liste ; elle est simplement longue de un. */
  function epVide(){
    return { produitId: '', diapos: [{ sur: '', gros: '', sous: '' }], iDia: 0,
             titre: '', description: '', alt: '', motsCles: [],
             lien: (EPD && EPD.siteUrl) || '' };
  }
  // La diapo en cours d edition — jamais nulle, meme sur un modele abime.
  function epDia(){
    if (!EP.diapos || !EP.diapos.length) EP.diapos = [{ sur: '', gros: '', sous: '' }];
    if (EP.iDia >= EP.diapos.length || EP.iDia < 0) EP.iDia = 0;
    return EP.diapos[EP.iDia];
  }
  function epProduit(){
    if (!EPD || !EP || !EP.produitId) return null;
    var l = EPD.produits || [];
    for (var i = 0; i < l.length; i++) { if (l[i].id === EP.produitId) return l[i]; }
    return null;
  }
  /* Le modele envoye au rendu. ⚠ La PHOTO et le nom de l entreprise viennent du
     coeur, pas de la fenetre : deux sources feraient deux epingles differentes
     selon l ecran qui les a composees. */
  function epModeleRendu(i){
    var p = epProduit();
    var n = (typeof i === 'number') ? i : EP.iDia;
    var d = (EP.diapos && EP.diapos[n]) || { sur: '', gros: '', sous: '' };
    return { reseau: EPRES, photo: p ? p.photo : '', entreprise: (EPD && EPD.entreprise) || '',
             sur: d.sur, gros: d.gros, sous: d.sous,
             no: n + 1, total: (EP.diapos || []).length };
  }
  // La fiche du reseau choisi, telle que le coeur la decrit.
  function epFiche(){
    var l = (EPD && EPD.reseaux) || [];
    for (var i = 0; i < l.length; i++) { if (l[i].cle === EPRES) return l[i]; }
    return { cle: EPRES, nom: EPRES, largeur: 1000, hauteur: 1500,
             titre: 100, description: 500, lienCliquable: true };
  }

  /* ⚠ ON NE REND QUE LA DIAPO REGARDEE, pas les six. Peindre toute la suite a
     chaque frappe ferait six images de 1080 x 1920 par lettre tapee. Les autres
     se peignent au moment ou on les regarde, et TOUTES a l export — la seule
     fois ou l on en a vraiment besoin. */
  function epDemanderRendu(){
    if (!EP || EPRENDU) return;
    EPRENDU = true;
    appeler('nl:epingleRendu', [epModeleRendu()]).then(function(r){
      EPRENDU = false;
      if (r && r.ok) { EPIMG = r.image || ''; epMajVue(); }
      else { EPIMG = ''; epMajVue(); if (r && r.motif) dire(epExpliquer(r), 'err'); }
    });
  }
  /* ⚠ LE RENDU EST DIFFERE, PAS IMMEDIAT. Chaque frappe demanderait sinon une
     image de 1000 x 1500 a la page principale — des dizaines d allers-retours
     pour taper un titre, et un apercu qui saccade a chaque lettre. */
  function epRenduBientot(){
    if (EPMINUT) clearTimeout(EPMINUT);
    EPMINUT = setTimeout(function(){ EPMINUT = null; epDemanderRendu(); }, 400);
  }

  function epMajVue(){
    var z = document.getElementById('ep-vue');
    if (!z) return;
    z.innerHTML = EPIMG
      ? '<img src="' + esc(EPIMG) + '" alt="${T("Aperçu de la publication")}">'
      : '<div class="rien">' + (EPRENDU ? '${T("Rendu…")}' : '${T("Choisissez un produit, ou écrivez une accroche.")}') + '</div>';
  }

  function epChoix(id, lib, opts, val){
    var o = opts.map(function(q){
      return '<option value="' + esc(q[0]) + '"' + (q[0] === val ? ' selected' : '') + '>' + esc(q[1]) + '</option>';
    }).join('');
    return '<div><label for="' + id + '">' + esc(lib) + '</label>'
      + '<select id="' + id + '">' + o + '</select></div>';
  }
  /* Un champ du modele, avec son compteur quand le reseau impose une borne.
     ⚠ LE COMPTEUR N EST PAS DU DECOR : chaque reseau COUPE — un titre a 100
     caracteres chez Pinterest, une legende a 2000 chez Instagram. Sans le
     chiffre a l ecran, on s en apercoit apres publication, chez les autres.
     ⚠ La borne vient de la fiche du reseau, jamais d un nombre ecrit ici. */
  // Les trois lignes PEINTES vivent dans la diapo regardee ; le reste (titre,
  // texte, lien) appartient a la publication entiere. Une seule fonction sait
  // ou chercher, pour que l edition et le rendu ne divergent jamais.
  var EP_LIGNES = { sur: 1, gros: 1, sous: 1 };
  function epLire(cle){
    if (EP_LIGNES[cle]) return String(epDia()[cle] || '');
    return String((EP && EP[cle]) || '');
  }
  function epEcrire(cle, v){
    if (EP_LIGNES[cle]) { epDia()[cle] = v; return; }
    EP[cle] = v;
  }
  function epChamp(cle, lib, max, longue){
    var id = 'ep-' + cle, v = epLire(cle);
    var n = v.length, trop = (max && n > max);
    var corps2 = longue
      ? '<textarea id="' + id + '" data-epc="' + cle + '">' + esc(v) + '</textarea>'
      : '<input id="' + id + '" data-epc="' + cle + '" value="' + esc(v) + '">';
    return '<div class="plein"><label for="' + id + '">' + esc(lib) + '</label>' + corps2
      + (max ? '<div class="cnt' + (trop ? ' trop' : '') + '" id="' + id + '-n">'
               + n + ' / ' + max + '</div>' : '')
      + '</div>';
  }

  function vueEpingle(){
    if (!EPD) return '<div class="carte"><div class="vide charge">${T("Lecture du catalogue…")}</div></div>';
    if (!EP) EP = epVide();
    var pret = !!(EPETAT && EPETAT.clePosee);
    var h = '<div class="epg"><div class="cg">';

    // ── Le choix du reseau : la MEME demande, une sortie differente ────────
    h += '<div class="bqbar" style="margin-bottom:.5rem">'
      + (EPD.reseaux || []).map(function(r){
          return '<button class="mini' + (r.cle === EPRES ? ' actif' : '') + '" data-epres="'
            + esc(r.cle) + '">' + esc(r.nom) + '</button>';
        }).join('')
      + '</div>';

    // ── Le panneau d ecriture IA ──────────────────────────────────────────
    h += '<div class="epia" id="ep-ia"><div class="tt"><span class="ic">✶</span>'
      + '<b>${T("Écrire avec l’IA pour ")}' + esc(epFiche().nom) + '</b>'
      + '<button class="mini' + (EPMODE === 'simple' ? ' actif' : '') + '" id="ep-simple">${T("Simple")}</button>'
      + '<button class="mini' + (EPMODE === 'avance' ? ' actif' : '') + '" id="ep-avance">${T("Avancé")}</button>'
      + '</div>';
    if (EPETAT && !pret) {
      h += '<div class="vide">${T("Aucune clé d’écriture IA n’est enregistrée. Elle se pose dans Configuration ▸ Clés API.")}</div>';
    } else {
      var opts = [['', '${T("— aucun produit —")}']].concat((EPD.produits || []).map(function(p){
        return [p.id, p.nom + (p.categorie ? ' · ' + p.categorie : '')];
      }));
      h += '<div class="g">' + epChoix('ep-prod', '${T("Produit mis en avant")}', opts, EP.produitId) + '</div>'
        + '<div class="g"><div class="plein"><label for="ep-but">${T("Que faut-il annoncer ?")}</label>'
        + '<input id="ep-but" placeholder="${T("ex. la coupe et la matière de ce manteau, pour l’automne")}"></div></div>';
      if (EPMODE === 'avance') {
        h += '<div class="g">'
          + epChoix('ep-ton', '${T("Ton")}', [['chaleureux', '${T("Chaleureux")}'], ['elegant', '${T("Élégant")}'],
              ['enjoue', '${T("Enjoué")}'], ['urgent', '${T("Pressant")}']], 'elegant')
          + epChoix('ep-langue', '${T("Langue")}', [['fr', '${T("Français")}'], ['en', '${T("Anglais")}']], 'fr')
          + '</div><div class="g"><div class="plein">'
          + '<label for="ep-plus">${T("Consignes supplémentaires")}</label>'
          + '<textarea id="ep-plus" rows="2" placeholder="${T("ex. viser la recherche « manteau de laine Québec »")}"></textarea>'
          + '</div></div>';
      }
      h += '<div class="pied"><button class="mini prim" id="ep-go"' + (EPOCC ? ' disabled' : '') + '>'
        + (EPOCC ? '${T("Rédaction…")}' : '${T("Rédiger")}') + '</button>'
        + '<span class="aide">' + esc(epSousBudget()) + '</span></div>';
    }
    h += '</div>';

    // ── Le modele, entierement modifiable ─────────────────────────────────
    var F = epFiche();
    var multi = (F.diapos && F.diapos[1] > 1);
    h += '<div class="carte">';
    /* ⚠ LA BANDE DES DIAPOS N APPARAIT QUE LA OU IL Y EN A PLUSIEURS. Sur
       Pinterest, un bandeau << Diapo 1 sur 1 >> avec un bouton << ajouter >>
       ferait croire qu on peut publier une suite la ou le reseau n en veut pas. */
    if (multi) {
      h += '<div class="bqbar">'
        + (EP.diapos || []).map(function(d, i){
            return '<button class="mini' + (i === EP.iDia ? ' actif' : '') + '" data-epdia="' + i + '">'
              + (i + 1) + '</button>';
          }).join('')
        + ((EP.diapos || []).length < F.diapos[1]
            ? '<button class="mini" id="ep-dia-plus" title="${T("Ajouter une diapo")}">+</button>' : '')
        + ((EP.diapos || []).length > 1
            ? '<button class="mini" id="ep-dia-moins" title="${T("Retirer cette diapo")}">✕</button>' : '')
        + '<span class="aide" style="margin-left:auto">${T("Diapo ")}' + (EP.iDia + 1)
        + '${T(" sur ")}' + (EP.diapos || []).length + '</span>'
        + '</div>';
    }
    h += '<div class="g">'
      + epChamp('sur', '${T("Sur-titre (dans l’image)")}', 0, false)
      + epChamp('gros', '${T("Accroche (dans l’image)")}', 0, false)
      + epChamp('sous', '${T("Précision (dans l’image)")}', 0, false)
      /* ⚠ LE TITRE N EXISTE QUE CHEZ PINTEREST. Facebook et Instagram n en ont
         pas : dessiner un champ vide qui ne part nulle part ferait ecrire un
         titre que personne ne verra jamais. La fiche du reseau le dit (0). */
      + (F.titre ? epChamp('titre', '${T("Titre de l’épingle")}', F.titre, false) : '')
      + epChamp('description', F.cle === 'pinterest'
          ? '${T("Description (elle sert à être trouvée)")}'
          : '${T("Texte de la publication")}', F.description, true)
      + epChamp('alt', '${T("Texte de remplacement de l’image")}', 0, true)
      /* ⚠⚠ ET LE LIEN DISPARAIT LA OU IL NE CLIQUE PAS. Instagram ne rend
         AUCUNE adresse cliquable dans une legende : laisser le champ inviterait
         a coller une adresse que personne ne peut suivre — on renvoie vers le
         lien de la bio, et on le DIT. */
      + (F.lienCliquable ? epChamp('lien', '${T("Lien de destination")}', 0, false) : '')
      + '</div>';
    if (!F.lienCliquable) {
      h += '<div class="epinfo">${T("Ce réseau ne rend pas les liens cliquables : mettez l’adresse dans la bio du compte.")}</div>';
    }
    if ((EP.motsCles || []).length) {
      h += '<div class="epinfo">' + (F.cle === 'pinterest'
            ? '${T("Mots de recherche : ")}' : '${T("Mots-clics : ")}')
        + esc(EP.motsCles.map(function(m){ return F.cle === 'pinterest' ? m : ('#' + m); }).join(' ')) + '</div>';
    }
    h += '</div></div>';

    // ── L apercu, au format que CE reseau-la montre ───────────────────────
    h += '<div class="cd"><div class="epvue" id="ep-vue" style="aspect-ratio:'
      + F.largeur + '/' + F.hauteur + '"></div>'
      + '<div class="epinfo">' + F.largeur + ' &times; ' + F.hauteur + ' ${T("px · le format que ")}'
      + esc(F.nom) + '${T(" montre en entier")}</div>'
      + '<div class="pied"><button class="mini prim" id="ep-enr"' + (EPIMG ? '' : ' disabled') + '>'
      + '${T("Enregistrer la publication")}</button>'
      + '<button class="mini" id="ep-copier">${T("Copier le texte")}</button></div>'
      + '<div class="pied"><button class="mini" id="ep-dossier">${T("Ouvrir le dossier des exports")}</button></div>'
      /* ⚠⚠ L ENVOI PAR COURRIEL N EST PAS UN CONFORT, C EST LE SEUL PONT VERS LE
         TELEPHONE. Instagram et TikTok ne se publient pas depuis un navigateur
         de bureau : il faut que l image ARRIVE sur l appareil. On compose ici,
         on s envoie le tout, on ouvre le message sur le telephone, on enregistre
         les images et l on colle le texte. Sans ce bouton, deux des quatre
         reseaux s arretaient dans un dossier que le telephone ne voit pas. */
      + '<div class="epenv"><label for="ep-a">${T("Envoyer par courriel")}</label>'
      + '<input id="ep-a" type="email" value="' + esc((EPD && EPD.courrielDefaut) || '')
      + '" placeholder="${T("votre@courriel.com")}"'
      + ((EPD && EPD.resendPret === false) ? ' disabled' : '') + '>'
      + '<button class="mini" id="ep-envoi"'
      + ((EPIMG && !(EPD && EPD.resendPret === false)) ? '' : ' disabled')
      + '>${T("Envoyer")}</button>'
      + ((EPD && EPD.resendPret === false)
          ? '<div class="epinfo">${T("Aucune clé Resend : l’envoi de courriel n’est pas configuré.")}</div>'
          : '<div class="epinfo">${T("Les images partent en pièces jointes, à enregistrer sur le téléphone.")}</div>')
      + '</div>'
      + '<textarea id="ep-presse" aria-hidden="true" tabindex="-1" style="position:absolute;left:-9999px;top:0;width:1px;height:1px"></textarea>'
      + '</div></div>';
    return h;
  }

  function epSousBudget(){
    if (!EPETAT || !EPETAT.budget) return '';
    var p = Number(EPETAT.budget.plafond || 0), d = Number(EPETAT.budget.depense || 0);
    if (!p) return szArgent(d) + ' ${T(" ce mois-ci (aucun plafond)")}';
    return szArgent(d) + ' ${T(" sur ")}' + szArgent(p) + ' ${T(" ce mois-ci")}';
  }

  function epExpliquer(r){
    var m = (r && (r.motif || r.error)) || '';
    if (m === 'budget') return r.error || '${T("Le plafond mensuel d’écriture IA est atteint. Il se règle dans Configuration ▸ Clés API.")}';
    if (m === 'sans_but') return '${T("Dites d’abord ce qu’il faut annoncer.")}';
    if (m === 'epingle_vide') return '${T("Le modèle n’a rien produit d’utilisable. Reformulez la demande.")}';
    if (m === 'canevas_teint') return r.detail || '${T("Cette photo ne peut pas être relue pour l’export.")}';
    /* ⚠ LES QUATRE REFUS DE L ENVOI DISENT CHACUN QUOI FAIRE. << Echec de
       l envoi >> pour les quatre ferait chercher la panne dans le reseau alors
       qu il suffit parfois de retirer deux diapos ou de poser une cle. */
    if (m === 'sans_destinataire') return '${T("Indiquez une adresse courriel.")}';
    if (m === 'adresse') return '${T("Cette adresse ne ressemble pas à une adresse courriel : ")}' + esc(r.detail || '');
    if (m === 'resend_absent') return '${T("Aucune clé Resend n’est enregistrée. Elle se pose dans Configuration ▸ Clés API.")}';
    if (m === 'sans_image') return '${T("Aucune image à envoyer.")}';
    if (m === 'trop_lourd') return '${T("Le message est trop lourd (")}' + esc(r.detail || '')
      + '${T("). Retirez des diapos, ou envoyez-les en deux fois.")}';
    if (m === 'envoi') return '${T("L’envoi a échoué : ")}' + esc(r.detail || '');
    if (m === 'json_illisible') return '${T("La réponse du modèle n’a pas pu être lue. Réessayez.")}';
    if (m === 'lecture_seule') return '${T("Vous n’avez pas le droit de composer des publications.")}';
    if (m === 'injoignable') return '${T("La passerelle d’écriture IA est injoignable.")}';
    return (r && r.error) || MOTIFS[m] || '${T("La rédaction a échoué.")}';
  }

  function epRediger(){
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    var but = v('ep-but').trim();
    if (!but) { dire('${T("Dites d’abord ce qu’il faut annoncer.")}', 'att'); return; }
    var p = epProduit();
    var d = { reseau: EPRES, but: but, ton: v('ep-ton') || 'elegant', langue: v('ep-langue') || 'fr',
      consignesLibres: v('ep-plus') || '',
      produit: p ? { nom: p.nom, categorie: p.categorie, prix: p.prix } : null };
    EPOCC = true; dessiner();
    dire('${T("Rédaction en cours — cela prend une dizaine de secondes.")}');
    appeler('nl:iaEpingle', [d]).then(function(r){
      EPOCC = false;
      if (!r || !r.ok) { dessiner(); dire(epExpliquer(r), 'err'); return; }
      if (r.budget) { EPETAT = EPETAT || {}; EPETAT.budget = r.budget; EPETAT.clePosee = true; }
      EP.diapos = (r.diapos && r.diapos.length) ? r.diapos : [{ sur: '', gros: '', sous: '' }];
      EP.iDia = 0;
      EP.titre = r.titre || ''; EP.description = r.description || '';
      EP.alt = r.altTexte || ''; EP.motsCles = r.motsCles || [];
      /* ⚠ LE LIEN N EST PAS ECRIT PAR L IA. Une adresse inventee par un modele
         menerait quelque part — et sur Pinterest, ou l epingle vit des annees,
         personne ne verifierait jamais. Il vient du catalogue, ou du site. */
      if (p && p.lien) EP.lien = p.lien;
      else if (!EP.lien) EP.lien = EPD.siteUrl || '';
      dessiner();
      epDemanderRendu();
      dire('${T("Publication rédigée : ")}' + (r.cout ? szArgent(r.cout) : '${T("prête")}'), 'bon');
    });
  }

  function epEnregistrer(){
    if (!EPIMG) { dire('${T("Aucune image à enregistrer.")}', 'att'); return; }
    /* ⚠⚠ L IMAGE ET SON TEXTE PARTENT ENSEMBLE, EN DEUX FICHIERS D UN SEUL
       GESTE. Une publication sans son texte est a moitie faite : il faudrait
       revenir le recopier a la main au moment de la deposer sur le reseau, et
       c est exactement la ou l on colle n importe quoi pour en finir.
       ⚠ LE NOM DU FICHIER PORTE LE RESEAU : trois epingles du meme jour dans le
       meme dossier, et l on ne sait plus laquelle va ou. */
    var F = epFiche();
    var base = F.cle + '-' + new Date().toISOString().slice(0, 10) + '-'
      + String(Date.now()).slice(-5);
    /* ⚠ LE TEXTE EXPORTE EST CELUI QU ON COLLE, PAS UNE FICHE. Les mots-clics
       sont donc DANS le texte, a la fin — comme ils doivent l etre sur le
       reseau — et non sur une ligne intitulee. Le reste (lien, texte de
       remplacement) vient apres une separation, pour ne pas etre colle par
       megarde dans la legende. */
    var clics = (EP.motsCles || []).length
      ? (F.cle === 'pinterest' ? '' : EP.motsCles.map(function(m){ return '#' + m; }).join(' '))
      : '';
    var texte = [EP.titre, EP.titre ? '' : null, EP.description, clics ? '' : null, clics,
      '', '---',
      F.lienCliquable ? ('${T("Lien : ")}' + EP.lien) : '${T("Lien : à mettre dans la bio du compte")}',
      '${T("Texte de remplacement : ")}' + EP.alt,
      (F.cle === 'pinterest' && (EP.motsCles || []).length)
        ? ('${T("Mots de recherche : ")}' + EP.motsCles.join(', ')) : ''
    ].filter(function(x){ return x !== '' && x !== null; }).join('\\n');
    dire('${T("Enregistrement…")}');
    epPeindreTout(base, function(images, rates){
      if (!images.length) { dire('${T("L’image n’a pas pu être enregistrée.")}', 'err'); return; }
      var faites = 0, restant = images.length;
      images.forEach(function(im){
        P.enregistrerExport(im.nom, im.dataUrl).then(function(rr){
          if (rr && rr.ok) faites++;
          if (--restant > 0) return;
          P.enregistrerExport(base + '.txt', texte).then(function(r2){
            var n = (EP.diapos || []).length;
            var bon = faites === n && !rates && r2 && r2.ok;
            dire(bon
              ? ('${T("Enregistré : ")}' + faites + ' ${T("image(s) et le texte")}')
              : ('${T("Enregistré partiellement : ")}' + faites + ' ${T("image(s) sur ")}' + n),
              bon ? 'bon' : 'att');
          });
        });
      });
    });
  }

  /* ⚠⚠ UNE SEULE ROUTINE PEINT LA SUITE, POUR L EXPORT COMME POUR LE COURRIEL.
     Les deux ont besoin de TOUTES les diapos — l apercu, lui, n en rend qu une.
     Ecrire la boucle deux fois, c etait la certitude qu un jour l export en
     sorte six et le courriel cinq, sans que rien ne s en plaigne.
     ⚠ Numerotees sur 2 chiffres : sans ca, le dossier range 10 avant 2. */
  function epPeindreTout(base, apres){
    var n = (EP.diapos || []).length;
    var images = [], rates = 0, reste = n;
    if (!n) { apres([], 0); return; }
    var poser = function(i, dataUrl){
      if (dataUrl) {
        images.push({ i: i, nom: base + (n > 1 ? ('-' + (i < 9 ? '0' : '') + (i + 1)) : '') + '.png',
                      dataUrl: dataUrl });
      } else { rates++; }
      if (--reste > 0) return;
      // Remises dans l ordre : les rendus reviennent comme ils veulent.
      images.sort(function(a, b){ return a.i - b.i; });
      apres(images, rates);
    };
    for (var i = 0; i < n; i++) {
      (function(k){
        appeler('nl:epingleRendu', [epModeleRendu(k)]).then(function(r){
          poser(k, (r && r.ok && r.image) ? r.image : '');
        });
      })(i);
    }
  }

  function epEnvoyer(){
    var ch = document.getElementById('ep-a');
    var a = ch ? String(ch.value || '').trim() : '';
    if (!a) { dire('${T("Indiquez une adresse courriel.")}', 'att'); return; }
    var F = epFiche();
    var base = F.cle + '-' + new Date().toISOString().slice(0, 10);
    var clics = (F.cle === 'pinterest') ? ''
      : (EP.motsCles || []).map(function(m){ return '#' + m; }).join(' ');
    /* ⚠ LE TEXTE ENVOYE EST CELUI QU ON COLLERA, exactement — c est un bloc a
       copier d un geste sur le telephone, pas une fiche a relire. */
    var texte = [EP.titre, EP.titre ? '' : null, EP.description,
      clics ? '' : null, clics,
      F.lienCliquable ? '' : null, F.lienCliquable ? EP.lien : null]
      .filter(function(x){ return x !== null; }).join('\\n');
    var b = document.getElementById('ep-envoi');
    if (b) b.disabled = true;
    dire('${T("Préparation des images…")}');
    epPeindreTout(base, function(images, rates){
      if (!images.length) { if (b) b.disabled = false; dire('${T("Aucune image à envoyer.")}', 'err'); return; }
      dire('${T("Envoi…")}');
      appeler('nl:publicationCourriel', [{ reseau: F.cle, a: a, texte: texte,
        note: EP.alt || '', images: images }]).then(function(r){
        if (b) b.disabled = false;
        if (r && r.ok) {
          dire('${T("Envoyé à ")}' + esc(a) + ' ${T("· ")}' + r.images + ' ${T("image(s)")}'
            + (rates ? (' ${T(" — ")}' + rates + ' ${T("non rendue(s)")}') : ''),
            rates ? 'att' : 'bon');
        } else dire(epExpliquer(r), 'err');
      });
    });
  }

  function epCopier(){
    var ta = document.getElementById('ep-presse');
    if (!ta) return;
    /* ⚠ ON COPIE CE QUI SE COLLE, ET RIEN D AUTRE. Le presse-papiers sert a
       deposer la legende sur le reseau : y glisser le texte de remplacement ou
       une etiquette << Lien : >> ferait coller ces mots-la dans la publication.
       Le LIEN n y entre que la ou il clique. */
    var F = epFiche();
    var clics = (F.cle === 'pinterest') ? ''
      : (EP.motsCles || []).map(function(m){ return '#' + m; }).join(' ');
    ta.value = [EP.titre, EP.titre ? '' : null, EP.description,
      clics ? '' : null, clics,
      F.lienCliquable ? '' : null, F.lienCliquable ? EP.lien : null]
      .filter(function(x){ return x !== null; }).join('\\n');
    ta.select();
    // execCommand ET NON navigator.clipboard : la fenetre est chargee en data:,
    // son origine est nulle, donc l API moderne du presse-papiers y est refusee.
    var fait = false;
    try { fait = document.execCommand('copy'); } catch (e) { fait = false; }
    dire(fait ? '${T("Texte de la publication copié.")}' : '${T("Copie refusée — utilisez Ctrl+C.")}',
      fait ? 'bon' : 'att');
  }

  function brancherEpingle(){
    var b;
    /* ⚠ CHANGER DE RESEAU NE JETTE PAS CE QUI EST ECRIT. On garde le modele et
       l on redemande seulement l image au bon format : la meme annonce sert aux
       trois, et c est tout l interet d un choix de sortie plutot que de trois
       outils. Le texte, lui, se reecrit d un clic sur << Rédiger >> si l on veut
       qu il colle vraiment aux usages du reseau choisi. */
    var zres = document.getElementById('corps');
    (zres ? zres.querySelectorAll('[data-epres]') : []).forEach(function(el){
      el.onclick = function(){
        var cle = el.getAttribute('data-epres');
        if (cle === EPRES) return;
        EPRES = cle; EPIMG = '';
        dessiner();
        epDemanderRendu();
      };
    });
    // La bande des diapos : changer, ajouter, retirer.
    var zdia = document.getElementById('corps');
    (zdia ? zdia.querySelectorAll('[data-epdia]') : []).forEach(function(el){
      el.onclick = function(){
        var i = Number(el.getAttribute('data-epdia'));
        if (i === EP.iDia) return;
        EP.iDia = i; EPIMG = ''; dessiner(); epDemanderRendu();
      };
    });
    b = document.getElementById('ep-dia-plus');
    if (b) b.onclick = function(){
      EP.diapos.push({ sur: '', gros: '', sous: '' });
      EP.iDia = EP.diapos.length - 1; EPIMG = ''; dessiner(); epDemanderRendu();
    };
    b = document.getElementById('ep-dia-moins');
    if (b) b.onclick = function(){
      /* ⚠ ON NE DESCEND JAMAIS SOUS UNE DIAPO : une publication sans image n est
         pas une publication, et l ecran n aurait plus rien a montrer. Le bouton
         disparait deja a une seule, mais la garde est ecrite ici aussi — un
         bouton qu on croit absent revient toujours un jour. */
      if (EP.diapos.length <= 1) return;
      EP.diapos.splice(EP.iDia, 1);
      if (EP.iDia >= EP.diapos.length) EP.iDia = EP.diapos.length - 1;
      EPIMG = ''; dessiner(); epDemanderRendu();
    };
    b = document.getElementById('ep-simple');
    if (b) b.onclick = function(){ EPMODE = 'simple'; dessiner(); };
    b = document.getElementById('ep-avance');
    if (b) b.onclick = function(){ EPMODE = 'avance'; dessiner(); };
    b = document.getElementById('ep-go');
    if (b) b.onclick = epRediger;
    b = document.getElementById('ep-enr');
    if (b) b.onclick = epEnregistrer;
    b = document.getElementById('ep-copier');
    if (b) b.onclick = epCopier;
    b = document.getElementById('ep-dossier');
    if (b) b.onclick = function(){ P.ouvrirDossierExports(); };
    b = document.getElementById('ep-envoi');
    if (b) b.onclick = epEnvoyer;
    var sel = document.getElementById('ep-prod');
    if (sel) sel.onchange = function(){
      EP.produitId = sel.value;
      var p = epProduit();
      if (p && p.lien) { EP.lien = p.lien; var li = document.getElementById('ep-lien'); if (li) li.value = EP.lien; }
      epDemanderRendu();
    };
    /* ⚠ ON NE REDESSINE PAS LE FORMULAIRE A CHAQUE FRAPPE : le champ perdrait
       le curseur au milieu d un mot. On met a jour le modele, le compteur et
       l apercu — trois choses qui ne touchent pas le champ ou l on tape. */
    var zone = document.getElementById('corps');
    (zone ? zone.querySelectorAll('[data-epc]') : []).forEach(function(el){
      el.oninput = function(){
        var cle = el.getAttribute('data-epc');
        epEcrire(cle, el.value);
        var cnt = document.getElementById('ep-' + cle + '-n');
        if (cnt) {
          /* ⚠ LA BORNE VIENT DE LA FICHE DU RESEAU, jamais d un nombre ecrit
             ici : 100 et 500 etaient ceux de Pinterest, et le compteur aurait
             menti sur Instagram (2000) des le premier essai. */
          var fx = epFiche();
          var max = (cle === 'titre') ? fx.titre : (cle === 'description' ? fx.description : 0);
          if (max) {
            cnt.textContent = el.value.length + ' / ' + max;
            cnt.className = 'cnt' + (el.value.length > max ? ' trop' : '');
          }
        }
        if (cle === 'sur' || cle === 'gros' || cle === 'sous') epRenduBientot();
      };
    });
    epMajVue();
  }

  function chargerEpingle(){
    if (EPD) return;
    appeler('nl:epingleDonnees', []).then(function(r){
      EPD = (r && r.ok) ? r : { produits: [], siteUrl: '', entreprise: '' };
      if (!EP) EP = epVide();
      if (ONGLET === 'epingle') dessiner();
    });
    if (!EPETAT) {
      appeler('nl:iaEtat', []).then(function(r){
        EPETAT = (r && r.ok) ? r : { clePosee: false, budget: {} };
        if (ONGLET === 'epingle') dessiner();
      });
    }
  }

  function vuePatrons(){
    if (!PAT) return '<div class="carte"><div class="vide charge">${T("Lecture des patrons…")}</div></div>';
    if (EDIT) return vuePatronEditeur();
    var l = PAT.patrons || [];
    var h = '<div class="carte">';
    if (PAT.peutEcrire) {
      h += '<div style="text-align:right;margin-bottom:.4rem">'
        + '<button class="mini prim" id="pa-nouveau">${T("+ Nouveau patron")}</button></div>';
    }
    if (!l.length) { h += '<div class="vide">${T("Aucun patron.")}</div></div>'; return h; }
    h += l.map(function(p){
      return '<div class="entree">'
        + '<div class="haut"><strong>' + esc(p.nom) + '</strong>'
        + '<span class="pill ' + (p.actif ? 'bon' : 'neutre') + '">' + (p.actif ? '${T("actif")}' : '${T("inactif")}') + '</span>'
        + (p.defaut ? '<span class="pill neutre">${T("fourni")}</span>' : '')
        + '<span class="droite"><span class="dt">' + esc(p.declencheurLibelle) + '</span></span></div>'
        + '<div class="dt" style="white-space:pre-wrap;overflow-wrap:anywhere">'
        /* ⚠ DOUBLE ANTISLASH OBLIGATOIRE : ce script vit dans un litteral de
           gabarit, ou un antislash-n simple devient un VRAI saut de ligne. La
           regex se retrouvait coupee en deux — << Invalid regular expression >>,
           attrape par le banc a l instant meme ou j ai ecrit cette ligne. */
        + esc(String(p.gabarit).replace(/\\n/g, ' ').slice(0, 120))
        + (String(p.gabarit).length > 120 ? '…' : '') + '</div>'
        + '<div class="dt">' + (p.reseaux.length
            ? p.reseaux.map(function(r){ return '<span class="pill neutre">' + esc(r) + '</span>'; }).join('')
            : '<span class="pill neutre">${T("aucun réseau")}</span>')
          + (p.motsCles.length ? ' <span class="dt">#' + p.motsCles.map(esc).join(' #') + '</span>' : '')
          + '</div>'
        + '<div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.3rem">'
        + '<button class="mini" data-apercu="' + esc(p.id) + '">${T("Aperçu")}</button>'
        + (PAT.peutEcrire
            ? '<button class="mini" data-modifier="' + esc(p.id) + '">${T("Modifier")}</button>'
              + '<button class="mini" data-bascule="' + esc(p.id) + '">' + (p.actif ? '${T("Désactiver")}' : '${T("Activer")}') + '</button>'
              + (p.defaut ? ''
                  : '<button class="mini danger" data-patsuppr="' + esc(p.id) + '">'
                    + (PAT_ARME === p.id ? '${T("Confirmer ?")}' : '${T("Supprimer")}') + '</button>')
            : '')
        + '</div></div>';
    }).join('');
    h += '</div>';
    return h;
  }

  function vuePatronEditeur(){
    var p = (EDIT === 'nouveau')
      ? { id: '', nom: '', gabarit: '', declencheur: 'manual', reseaux: [], motsCles: [], image: true, actif: true }
      : (PAT.patrons || []).find(function(x){ return x.id === EDIT; });
    if (!p) { EDIT = null; return vuePatrons(); }
    var h = '<div class="carte">'
      + '<div class="haut" style="margin-bottom:.5rem"><strong>'
      + (EDIT === 'nouveau' ? '${T("Nouveau patron")}' : '${T("Modifier « ")}' + esc(p.nom) + ' »') + '</strong></div>'
      + '<label class="champ"><span class="lbl">${T("Nom du patron")}</span>'
      + '<input class="t" id="pa-nom" value="' + esc(p.nom) + '" placeholder="${T("Annonce d’un nouveau produit")}"></label>'
      + '<label class="champ"><span class="lbl">${T("Déclencheur")}</span><select class="t" id="pa-decl">'
      + (PAT.declencheurs || []).map(function(d){
          return '<option value="' + esc(d.v) + '"' + (p.declencheur === d.v ? ' selected' : '') + '>'
            + esc(d.l) + '</option>'; }).join('')
      + '</select></label>'
      + '<label class="champ"><span class="lbl">${T("Réseaux")}</span><span class="cases">'
      + (PAT.reseaux || []).map(function(r){
          return '<label class="case"><input type="checkbox" data-net="' + esc(r.v) + '"'
            + (p.reseaux.indexOf(r.v) >= 0 ? ' checked' : '') + '> ' + esc(r.icone) + ' ' + esc(r.l) + '</label>';
        }).join('')
      + '</span></label>'
      + '<label class="champ"><span class="lbl">${T("Texte publié")}</span>'
      + '<textarea class="t" id="pa-gab" rows="5">' + esc(p.gabarit) + '</textarea>'
      + '<span class="sub">${T("Variables : ")}'
      + (PAT.variables || []).map(function(v){ return esc(v.v) + ' (' + esc(v.l) + ')'; }).join(' · ')
      + '</span></label>'
      + '<label class="champ"><span class="lbl">${T("Mots-clics")}</span>'
      + '<input class="t" id="pa-tags" value="' + esc(p.motsCles.join(', ')) + '" placeholder="${T("mode, quebec, nouveaute")}">'
      + '<span class="sub">${T("Séparés par des virgules, sans le croisillon.")}</span></label>'
      + '<label class="case"><input type="checkbox" id="pa-img"' + (p.image ? ' checked' : '')
      + '> ${T("Joindre l’image du produit")}</label>'
      + '<div style="display:flex;gap:.4rem;margin-top:.7rem">'
      + '<button class="mini prim" id="pa-enr">${T("Enregistrer")}</button>'
      + '<button class="mini" id="pa-annuler">${T("Annuler")}</button></div>'
      + '</div>';
    return h;
  }

  function brancherPatrons(){
    var n = document.getElementById('pa-nouveau');
    if (n) n.onclick = function(){ EDIT = 'nouveau'; dessiner(); szBrouillonProposer(); };
    var a = document.getElementById('pa-annuler');
    /* ⚠ << Annuler >> N EFFACE PAS LE BROUILLON : la personne ferme son
       formulaire, elle ne declare pas jeter son texte. Il lui sera propose a la
       reouverture, et la boite de reprise a son bouton pour repartir a neuf. */
    if (a) a.onclick = function(){ szBrouillonMaintenant(); EDIT = null; dessiner(); dire(''); };
    var e = document.getElementById('pa-enr');
    if (e) e.onclick = enregistrerPatron;
  }

  /* ══ LE BROUILLON D UN PATRON DE PUBLICATION ═══════════════════
     C est le formulaire ou l on perd le plus : le gabarit est du TEXTE LIBRE, une
     annonce redigee mot a mot, avec ses mots-cles. Rien ne le gardait — le bouton
     Annuler remettait EDIT a null et redessinait par-dessus.
     ⚠ LA CLE DISTINGUE LE NOUVEAU PATRON DE CHAQUE PATRON EXISTANT. Sans elle,
     un texte laisse sur un patron serait propose sur le suivant, et l on
     publierait l annonce d un produit sous le nom d un autre.
     ⚠ LES RESEAUX SONT DES CASES SANS IDENTIFIANT (attribut data-net) : elles ne
     passent pas par l aide generique, d ou la liste explicite. */
  var BR_CHAMPS = ['pa-nom', 'pa-decl', 'pa-gab', 'pa-tags'];
  function brNets(){
    var l = document.querySelectorAll('[data-net]'), r = [];
    for (var i = 0; i < l.length; i++) if (l[i].checked) r.push(l[i].getAttribute('data-net'));
    return r;
  }
  szBrouillonBrancher({
    portee: 'patron-social',
    libelle: '${T("Un patron de publication")}',
    ttlMin: 720,
    cle: function(){ return EDIT ? (EDIT === 'nouveau' ? '__new__' : ('p:' + EDIT)) : ''; },
    actif: function(){ return !!EDIT && !!document.getElementById('pa-nom'); },
    valeurs: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, ['pa-img']);
      if (v) v._nets = brNets();
      return v;
    },
    rempli: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, ['pa-img']); if (!v) return false;
      return szBrouillonQuelqueChose(v, ['pa-nom', 'pa-gab', 'pa-tags']);
    },
    remplir: function(v){
      szBrouillonAuDom(v);
      var nets = v._nets || [];
      var l = document.querySelectorAll('[data-net]');
      for (var i = 0; i < l.length; i++) l[i].checked = nets.indexOf(l[i].getAttribute('data-net')) >= 0;
    },
  });
  szBrouillonEcouter();

  function enregistrerPatron(){
    var v = function(id){ var el = document.getElementById(id); return el ? el.value : ''; };
    var nets = [];
    var cs = document.querySelectorAll('[data-net]');
    for (var i = 0; i < cs.length; i++) if (cs[i].checked) nets.push(cs[i].getAttribute('data-net'));
    var img = document.getElementById('pa-img');
    dire('${T("Enregistrement…")}');
    appeler('patrons:ecrire', [{
      id: EDIT === 'nouveau' ? '' : EDIT,
      nom: v('pa-nom'), gabarit: v('pa-gab'), declencheur: v('pa-decl'),
      reseaux: nets, motsCles: v('pa-tags'), image: !!(img && img.checked)
    }]).then(function(r){
      if (!r || !r.ok) { dire('${T("Échec : ")}' + expliquer(r), 'err'); return; }
      szBrouillonJeter(); PAT = r; EDIT = null; dessiner();
      dire('${T("Patron enregistré.")}', 'bon');
    });
  }

  /* ⚠ LU A LA DEMANDE, comme le profil fiscal : on ne fait pas attendre la file
     des publications pour une liste qu on ouvre rarement. */
  function chargerPatrons(){
    if (PAT) return;
    appeler('patrons:liste', []).then(function(r){
      if (!r || !r.ok) { dire('${T("Patrons illisibles : ")}' + expliquer(r), 'err'); return; }
      PAT = r;
      if (ONGLET === 'patrons') dessiner();
    });
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    var t = D.tuiles || {};
    if (sous) {
      sous.innerHTML = (D.reseauxActifs || []).length
        ? (D.reseauxActifs || []).map(function(r){
            return '<span title="' + esc(r.nom) + '">' + esc(r.icone || '') + '</span>';
          }).join(' ')
        : '<span class="pill neutre">${T("aucun réseau branché")}</span>';
    }

    /* ⚠ szTuiles(...) ENVELOPPE, il ne remplace rien : le bandeau est ecrit tel
       quel, la piece commune y ajoute le bouton de repli et l etat retenu pour
       ce poste. Voir JS_TUILES dans socle.js. */
    var h = szTuiles('<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">${T("En attente")}</div><div class="val att">' + (t.enAttente || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Publiées")}</div><div class="val bon">' + (t.publiees || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Échouées")}</div><div class="val err">' + (t.echouees || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Ignorées")}</div><div class="val">' + (t.ignorees || 0) + '</div></div>'
      + '</div>');

    h += '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'file' ? ' actif' : '') + '" data-onglet="file">${T("File d’attente")}'
      + ((D.file || []).length ? '<span class="n hi">' + D.file.length + '</span>' : '') + '</button>'
      + '<button class="mini' + (ONGLET === 'historique' ? ' actif' : '') + '" data-onglet="historique">${T("Historique")}'
      + ((D.historique || []).length ? '<span class="n">' + D.historique.length + '</span>' : '') + '</button>'
      + '<button class="mini' + (ONGLET === 'patrons' ? ' actif' : '') + '" data-onglet="patrons">${T("Patrons")}'
      + (PAT && (PAT.patrons || []).length
          ? '<span class="n">' + PAT.patrons.filter(function(p){ return p.actif; }).length + '</span>' : '')
      + '</button>'
      /* ⚠ L EPINGLE EST UN ONGLET, PAS UNE FENETRE A PART. Elle vit ou vivent
         deja les publications : on compose, on regarde la file juste a cote.
         Une fenetre separee aurait demande son entree de menu, son droit et son
         lexique — pour le meme sujet, a un clic d ici. */
      + '<button class="mini' + (ONGLET === 'epingle' ? ' actif' : '') + '" data-onglet="epingle">'
      + '${T("Publication IA")}</button>'
      + '<div class="droite"><span class="dt">${T("Comptes et jetons des réseaux : ")}'
      + '${T("Configuration → Communications → Réseaux sociaux")}</span>';
    if (ONGLET === 'file' && D.peutModifier && (D.file || []).length) {
      h += '<button class="mini prim" id="so-tout"' + (OCCUPE ? ' disabled' : '') + '>'
        + (OCCUPE ? '${T("Publication…")}' : (ARME === '__tout' ? '${T("Confirmer — tout publier ?")}' : '${T("Tout publier")}')) + '</button>';
    }
    if (ONGLET === 'historique' && D.peutModifier && (D.historique || []).length) {
      h += '<button class="mini danger" id="so-vider">'
        + (ARME === '__vider' ? '${T("Confirmer ?")}' : '${T("Vider le journal")}') + '</button>';
    }
    h += '</div></div>';

    if (ONGLET === 'patrons') {
      h += vuePatrons();
    } else if (ONGLET === 'epingle') {
      h += vueEpingle();
    } else {
      var pile = ONGLET === 'file' ? (D.file || []) : (D.historique || []);
      h += '<div class="carte">';
      if (!pile.length) {
        h += '<div class="vide">' + (ONGLET === 'file'
          ? '${T("Aucune publication en attente.")}' : '${T("Rien au journal pour l’instant.")}') + '</div>';
      } else {
        h += pile.map(function(e){ return entree(e, ONGLET === 'file'); }).join('');
      }
      h += '</div>';
    }

    corps.innerHTML = h;
    if (ONGLET === 'patrons') brancherPatrons();
    if (ONGLET === 'epingle') brancherEpingle();

    var bt = document.getElementById('so-tout');
    if (bt) bt.onclick = function(){
      if (ARME !== '__tout') {
        ARME = '__tout'; dessiner();
        dire('${T("Cliquez de nouveau pour publier toute la file — les messages partent chez les réseaux et ne se rattrapent pas.")}', 'att');
        return;
      }
      ARME = ''; OCCUPE = true; dessiner();
      dire('${T("Publication de la file…")}', 'att');
      appeler('sociaux:publierTout', []).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        /* ⚠ Le singulier et le pluriel, chacun entier. */
        var bilan = r.completes + (r.completes > 1 ? '${T(" publiées")}' : '${T(" publiée")}')
          + (r.partielles ? ', ' + r.partielles + (r.partielles > 1 ? '${T(" partielles")}' : '${T(" partielle")}') : '')
          + (r.echecs ? ', ' + r.echecs + '${T(" en échec")}' : '')
          + '${T(" sur ")}' + r.tentees + '.';
        dire(bilan, (r.partielles || r.echecs) ? 'att' : 'bon');
        ONGLET = 'historique';
        charger();
      });
    };

    var bv = document.getElementById('so-vider');
    if (bv) bv.onclick = function(){
      if (ARME !== '__vider') {
        ARME = '__vider'; dessiner();
        dire('${T("Cliquez « Confirmer ? » — le journal est effacé, mais les publications restent en ligne sur les réseaux.")}', 'att');
        return;
      }
      ARME = '';
      appeler('sociaux:viderHistorique', []).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(r.efface + (r.efface > 1 ? '${T(" entrées effacées du journal.")}' : '${T(" entrée effacée du journal.")}'), 'bon');
        charger();
      });
    };
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;

    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); ARME = ''; PAT_ARME = ''; EDIT = null;
      dessiner();
      if (ONGLET === 'patrons') chargerPatrons();
      if (ONGLET === 'epingle') chargerEpingle();
      return; }

    var pm = t.closest('[data-modifier]');
    if (pm) { EDIT = pm.getAttribute('data-modifier'); dessiner(); szBrouillonProposer(); return; }
    var pb = t.closest('[data-bascule]');
    if (pb) {
      var idB = pb.getAttribute('data-bascule');
      var cur = (PAT.patrons || []).find(function(x){ return x.id === idB; });
      dire('…');
      appeler('patrons:basculer', [idB, !(cur && cur.actif)]).then(function(r){
        /* ⚠ LES ACCENTS SONT DES TEXTES VISIBLES, pas du code : « Echec »,
           « desactive », « active », « supprime » s affichaient nus dans le
           bandeau. Corrige le 2026-09-13, en traduisant la fenetre. */
        if (!r || !r.ok) { dire('${T("Échec : ")}' + expliquer(r), 'err'); return; }
        PAT = r; dessiner(); dire(cur && cur.actif ? '${T("Patron désactivé.")}' : '${T("Patron activé.")}', 'bon');
      });
      return;
    }
    var ps = t.closest('[data-patsuppr]');
    if (ps) {
      var idS = ps.getAttribute('data-patsuppr');
      if (PAT_ARME !== idS) {
        PAT_ARME = idS; dessiner();
        dire('${T("Recliquez pour confirmer — le gabarit disparaît. Les publications déjà faites ne bougent pas.")}', 'att');
        return;
      }
      PAT_ARME = '';
      appeler('patrons:supprimer', [idS]).then(function(r){
        if (!r || !r.ok) { dessiner(); dire('${T("Échec : ")}' + expliquer(r), 'err'); return; }
        PAT = r; dessiner(); dire('${T("Patron supprimé.")}', 'bon');
      });
      return;
    }
    var pa = t.closest('[data-apercu]');
    if (pa) {
      dire('${T("Composition de l’aperçu…")}');
      appeler('patrons:apercu', [pa.getAttribute('data-apercu')]).then(function(r){
        if (!r || !r.ok) { dire('${T("Échec : ")}' + expliquer(r), 'err'); return; }
        /* ⚠ L APERCU SE LIT DANS L ECRAN, pas dans le bandeau : un texte de
           publication tient sur plusieurs lignes, et le bandeau en montrerait
           la premiere moitie avec des points de suspension. */
        var z = document.createElement('div');
        z.className = 'carte';
        z.style.marginTop = '.5rem';
        z.innerHTML = '<div class="haut"><strong>${T("Aperçu — ")}' + esc(r.nom) + '</strong>'
          + '<span class="droite"><span class="dt">'
          + (r.produit ? '${T("exemple : ")}' + esc(r.produit) : '${T("aucun produit actif pour l’exemple")}')
          + '</span></span></div>'
          + '<div class="dt" style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:.85rem;color:var(--tx)">'
          + esc(r.texte) + '</div>'
          + '<div class="dt" style="margin-top:.3rem">' + (r.reseaux.length
              ? r.reseaux.map(function(x){ return '<span class="pill neutre">' + esc(x) + '</span>'; }).join('')
              : '<span class="pill att">${T("aucun réseau — ce patron ne publiera nulle part")}</span>') + '</div>';
        var anc = pa.closest('.entree');
        if (anc && anc.parentNode) anc.parentNode.insertBefore(z, anc.nextSibling);
        dire('');
      });
      return;
    }

    var bp = t.closest('[data-publier]');
    if (bp) {
      var idP = bp.getAttribute('data-publier');
      /* ARME EN DEUX CLICS : le message part a l exterieur et ne revient pas. */
      if (ARME !== idP) {
        ARME = idP; dessiner();
        dire('${T("Cliquez « Confirmer l’envoi ? » — la publication part chez les réseaux et ne se rattrape pas.")}', 'att');
        return;
      }
      ARME = '';
      bp.disabled = true;
      dire('${T("Publication…")}', 'att');
      appeler('sociaux:publier', [idP]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        if (r.complet) {
          dire('« ' + (r.patron || '') + '${T(" » publiée sur tous les réseaux.")}', 'bon');
        } else {
          var rates = (r.resultats || []).filter(function(x){ return !x.ok; })
            .map(function(x){ return x.reseau; }).join(', ');
          dire('${T("Envoi partiel — ")}' + (rates || '${T("un réseau")}') + '${T(" n’a pas reçu la publication. Voir le journal.")}', 'att');
        }
        charger();
      });
      return;
    }

    var bi = t.closest('[data-ignorer]');
    if (bi) {
      ARME = '';
      bi.disabled = true;
      appeler('sociaux:ignorer', [bi.getAttribute('data-ignorer')]).then(function(r){
        if (!r.ok) { bi.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('« ' + (r.patron || '') + '${T(" » retirée de la file.")}', 'bon');
        charger();
      });
      return;
    }

    /* ⚠⚠ UN CLIC SUR UN BOUTON NE DOIT PAS DÉSARMER CE QU'IL VIENT D'ARMER.
       Les boutons branches par la fonction de branchement posent l armement,
       puis le clic REMONTE jusqu ici : la ligne de desarmement ci-dessous
       s executait dans la foulee, et le bouton revenait a son libelle
       d origine : on voyait l avertissement sans jamais voir Confirmer ?
       (2026-08-09). Un clic sur une commande est traite par SA commande. */
    if (t.closest('button, input, select, label')) return;
    if (ARME) { ARME = ''; dessiner(); }
  });

  function charger(){
    appeler('sociaux:liste', []).then(function(r){
      if (!r || !r.ok) { vide('${T("Réseaux sociaux indisponibles")}', expliquer(r)); return; }
      D = r;
      dessiner();
      if (ONGLET === 'patrons') chargerPatrons();
      if (ONGLET === 'epingle') chargerEpingle();
    });
  }

  window.szActualiser = function(){ if (!OCCUPE && !ARME) charger(); };
  window.szRevenir = function(){ if (!OCCUPE) charger(); };

  /* ── MODE ANCRE ── Le meme bouton que les autres ecrans.
     ⚠⚠ LE PARAMETRE NE S APPELLE PLUS << actif >> ICI, ET C EST DELIBERE. Le
     dictionnaire de cette fenetre traduit le mot << actif >> (la pastille d un
     patron), et le poseur l a enveloppe DANS LE NOM DU PARAMETRE et DANS LA
     CONDITION — le nom du parametre est devenu une enveloppe. La page francaise restait
     identique — T rend le meme mot — donc rien ne criait ; en anglais, le
     parametre se serait appele << active >> et la condition aurait lu une
     variable qui n existe pas. Un nom de code ne doit jamais pouvoir etre une
     cle de dictionnaire. */
  window.szModeAncre = function(estAncree){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);'
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto');
      t.appendChild(b);
    }
    if (estAncree) {
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (ARME) { ARME = ''; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageSociaux };
