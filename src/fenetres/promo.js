'use strict';

/*
 * FENÊTRE « CENTRE D'IMPRESSION » — NATIVE (2.4.0)
 * =============================================================================
 * Le pilote du studio d'objets promotionnels : les modèles avec leur aperçu, les
 * formats, et surtout l'IMPRESSION PAR LOT — calibration, quantité, progression,
 * arrêt en cours de route, planche Avery.
 *
 * ⚠ PATRON « FENÊTRE PILOTE », ET CE N'ÉTAIT PAS UN CHOIX. Le rendu d'un objet
 * promotionnel est un CANEVAS : il ne peut vivre que dans la fenêtre principale,
 * seule à posséder l'origine du site (donc le droit de relire une image du
 * stockage sans teindre le canevas) et seule à parler au programme d'impression
 * du poste. Cette fenêtre-ci ne dessine RIEN : elle reçoit des images déjà
 * rendues, et elle commande.
 *
 * ⚠ CE QUI RESTE À L'ÉCRAN WEB, ET C'EST DIT DANS LA FENÊTRE : l'ÉDITEUR (plan
 * de travail, poignées, inspecteur) et la LOGOTHÈQUE (assistant d'import avec
 * rognage). Ce sont des éditeurs visuels — même famille que les Pages du site.
 * Les porter à moitié aurait donné une fenêtre qui montre sans permettre de
 * corriger.
 *
 * ⚠ L'IMPRESSION BOUCLE ICI. Le pont est une question suivie d'une réponse : le
 * site imprime UN lot de 25 et rend son verdict, la fenêtre rappelle jusqu'à la
 * quantité voulue. C'est ce qui donne la progression — et l'arrêt, qui n'est
 * rien d'autre que cesser de rappeler.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:#8fa1b8}
input[type=search],input[type=text],input[type=number],select,button{font:inherit;color:#e8edf5;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.16);
  border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:190px}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;
  color:#8fa1b8;font-weight:700}
.stats{display:flex;gap:.5rem;flex-wrap:wrap}
.stats .s{flex:1 1 7rem;background:rgba(255,255,255,.04);border-radius:9px;padding:.4rem .6rem}
.stats .s .n{font:700 1.05rem/1.2 Georgia,serif;color:#c9a97e}
.stats .s .l{font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}

table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:rgba(255,255,255,.04)}
tbody td{padding:.3rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody .num{font-weight:600}
tbody .dt{font-size:.72rem;color:#8fa1b8}
/* Un damier CLAIR derriere les vignettes : un objet promotionnel est imprime sur
   du blanc, le montrer sur fond sombre mentirait sur son rendu. */
.vign{width:76px;height:44px;border-radius:6px;overflow:hidden;display:flex;
  align-items:center;justify-content:center;background:#f2f2f2}
.vign img{max-width:100%;max-height:100%;object-fit:contain}
.vign .att{font-size:.58rem;color:#b45309;text-align:center;line-height:1.1;padding:2px}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.err{background:rgba(239,68,68,.14);color:#f87171}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:#8fa1b8}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.aide{font-size:.75rem;color:#8fa1b8;line-height:1.45}
.avis{background:rgba(180,120,10,.1);border:1px solid rgba(180,120,10,.4);color:#fbbf24;
  border-radius:9px;padding:.45rem .65rem;font-size:.79rem;line-height:1.5}

/* Le volet d impression : deux colonnes, et une seule barre de progression. */
.deux{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
@media (max-width:860px){.deux{grid-template-columns:1fr}}
.champ{display:flex;flex-direction:column;gap:.2rem;margin-bottom:.55rem}
.champ label{font-size:.7rem;color:#8fa1b8}
.rapide{display:flex;gap:.28rem;flex-wrap:wrap;margin-top:.3rem}
.rang{display:flex;justify-content:space-between;gap:.6rem;font-size:.8rem;
  padding:.16rem 0;border-bottom:1px solid rgba(255,255,255,.055)}
.rang strong{font-weight:600}
.gapercu{background:#f2f2f2;border-radius:10px;min-height:9rem;display:flex;
  align-items:center;justify-content:center;padding:.5rem;overflow:hidden}
.gapercu img{max-width:100%;max-height:16rem;object-fit:contain}
.barre{height:9px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin:.45rem 0}
.barre i{display:block;height:100%;width:0;background:#c9a97e;transition:width .18s}
.cal3{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Centre d'impression ».
 * `onglet` = l'onglet d'ouverture ('modeles' par défaut, ou 'impression' /
 * 'formats'). ⚠ Il n'est pas décoratif : il permet au garde-fou d'ouvrir
 * DIRECTEMENT le volet d'impression, qu'aucun clic simulé n'atteindrait
 * autrement — et c'est le volet où le travail se fait.
 */
function pagePromo(onglet) {
  const depart = (['modeles', 'impression', 'formats'].indexOf(String(onglet || '')) >= 0)
    ? String(onglet) : 'modeles';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Centre d’impression — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🖨️</span><h1>Centre d’impression</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');

  var D = null;
  var ONGLET = '${depart}';   // modeles | impression | formats
  var Q = '';
  var TRI = 'updated';
  var PAGE = 0;
  var CIBLE = '';            // le modele choisi pour l impression
  var APERCU = null;         // reponse de promo:apercu
  var IMPR = null;           // etat de l imprimante
  var CAL = null;            // calibration du modele cible
  var QTE = 100;
  var PLANCHE = '';
  var SUPPR_ARME = '';       // id du modele arme pour suppression
  var FMT_ARME = '';
  var NOUVEAU = false;       // le formulaire de format est deploye
  var EN_COURS = false;      // un travail long est en cours
  var JOB = null;            // { faites, total, arret }

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès au Centre d’impression.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    module_promo:       'Le Centre d’impression n’a pas pu être chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).',
    introuvable:        'Ce modèle n’existe plus.',
    format_introuvable: 'Ce format n’existe plus.',
    nom_requis:         'Donnez un nom au format.',
    dimensions:         'Dimensions invalides — en pouces, au moins 0,2.',
    agent_absent:       'Le programme d’impression n’est pas disponible sur ce poste.',
    imprimante:         'L’imprimante d’étiquettes n’est pas prête.',
    image_illisible:    'Une image de ce modèle n’est pas lisible par le navigateur : rien n’a été imprimé. Réenregistrez-la depuis la logothèque (écran web), puis réessayez.',
    envoi:              'L’envoi à l’imprimante a échoué.',
    aucune_planche:     'Aucun gabarit de planche ne correspond à ce format.',
    planche:            'La planche n’a pas pu être générée.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail && m !== 'image_illisible') t += ' (' + esc(String(r.detail).slice(0, 160)) + ')';
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }
  function dateFr(ts){
    if (!ts) return '—';
    try { return new Date(ts).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch (e) { return '—'; }
  }
  function ligneCible(){
    if (!D) return null;
    var l = D.lignes || [];
    for (var i = 0; i < l.length; i++) if (l[i].id === CIBLE) return l[i];
    return null;
  }

  /* ── LE DESSIN ─────────────────────────────────────────────────────────── */
  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var ro = !D.peutModifier;
    var k = D.kpis || {};
    var h = '';

    if (ro) {
      h += '<div class="avis">👁 Lecture seule — votre rôle permet de consulter, pas de modifier ni d’imprimer.</div>';
    }

    h += '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'modeles' ? ' actif' : '') + '" data-onglet="modeles">Modèles<span></span></button>'
      + '<button class="mini' + (ONGLET === 'impression' ? ' actif' : '') + '" data-onglet="impression">Impression par lot</button>'
      + '<button class="mini' + (ONGLET === 'formats' ? ' actif' : '') + '" data-onglet="formats">Formats</button>'
      + '<span class="droite">' + (k.imprimees || 0) + ' étiquette' + ((k.imprimees || 0) > 1 ? 's' : '') + ' imprimée' + ((k.imprimees || 0) > 1 ? 's' : '') + '</span>'
      + '</div>';

    h += '<div class="stats">'
      + tuile(k.modeles, 'modèles') + tuile(k.formats, 'formats')
      + tuile(k.logos, 'logos') + tuile(D.trouves, 'affichés')
      + '</div>';

    if (ONGLET === 'modeles') h += vueModeles(ro);
    else if (ONGLET === 'formats') h += vueFormats(ro);
    else h += vueImpression(ro);

    /* ⚠ CE QUI N EST PAS ICI EST DIT ICI (regle de la 2.0.0 : une fenetre au
       perimetre partiel annonce ou trouver le reste). */
    h += '<div class="aide" style="padding:.2rem .1rem">'
      + 'La <strong>mise en page d’un modèle</strong> et la <strong>logothèque</strong> '
      + 'restent à l’écran Catalogue → Centre d’impression de la fenêtre principale : '
      + 'ce sont des éditeurs visuels. Le bouton « Ouvrir l’éditeur » vous y mène.'
      + '</div>';

    corps.innerHTML = h;
    brancher();
  }

  function tuile(n, l){
    return '<div class="s"><div class="n">' + (n || 0) + '</div><div class="l">' + l + '</div></div>';
  }
  function vignette(r){
    if (r.vignette) return '<div class="vign"><img src="' + esc(r.vignette) + '" alt=""></div>';
    /* Pas d aperçu = le canevas a ete teinte par une image du modele, et c est
       exactement ce qui empechera de l imprimer. On le DIT ici plutot que de
       laisser decouvrir au moment du lot. */
    return '<div class="vign"><span class="att">image non<br>lisible</span></div>';
  }

  function vueModeles(ro){
    var h = '<div class="barreoutils" style="margin-top:.1rem">'
      + '<input type="search" id="p-q" placeholder="Nom ou format (3 car. min.)" value="' + esc(Q) + '">'
      + '<select id="p-tri">'
      + '<option value="updated"' + (TRI === 'updated' ? ' selected' : '') + '>Modifié récemment</option>'
      + '<option value="name"' + (TRI === 'name' ? ' selected' : '') + '>Nom</option>'
      + '<option value="size"' + (TRI === 'size' ? ' selected' : '') + '>Format</option>'
      + '</select></div>';

    h += '<div class="carte">';
    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">' + (!D.charge
        ? 'Lecture des modèles…'
        : (D.total ? 'Aucun modèle ne correspond.'
                   : 'Aucun modèle. Créez-en un depuis l’onglet Formats.')) + '</div>';
    } else {
      h += '<table><thead><tr><th>Aperçu</th><th>Nom</th><th>Format</th>'
        + '<th style="text-align:center">Éléments</th><th>Modifié</th>'
        + '<th style="text-align:right">Actions</th></tr></thead><tbody>'
        + rows.map(function(r){
            return '<tr data-mod="' + esc(r.id) + '">'
              + '<td style="width:84px">' + vignette(r) + '</td>'
              + '<td><span class="num">' + esc(r.nom) + '</span>'
              + '<div class="dt">' + esc(r.type) + (r.rond ? ' · rond' : '') + '</div></td>'
              + '<td><span class="pill neutre">' + esc(r.dim) + '</span></td>'
              + '<td style="text-align:center">' + r.elements + '</td>'
              + '<td class="dt">' + dateFr(r.modifie) + '</td>'
              + '<td style="text-align:right;white-space:nowrap">'
              + '<button class="mini" data-imprimer="' + esc(r.id) + '">Imprimer</button> '
              + '<button class="mini" data-editeur="' + esc(r.id) + '">Éditeur</button>'
              + (ro ? '' : ' <button class="mini" data-dup="' + esc(r.id) + '">Dupliquer</button>'
                  + ' <button class="mini danger" data-suppr="' + esc(r.id) + '">'
                  + (SUPPR_ARME === r.id ? 'Confirmer ?' : '✕') + '</button>')
              + '</td></tr>';
          }).join('')
        + '</tbody></table>';
      if ((D.pages || 1) > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="p-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="p-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';
    return h;
  }

  function vueFormats(ro){
    var f = D.formats || [];
    var h = '<div class="carte"><h2>Formats disponibles</h2>';
    if (!ro) {
      h += '<div class="barreoutils" style="margin-bottom:.5rem">'
        + '<button class="' + (NOUVEAU ? 'actif' : 'prim') + '" id="p-fmtnouv">'
        + (NOUVEAU ? 'Annuler' : '＋ Ajouter un format') + '</button></div>';
      if (NOUVEAU) {
        h += '<div class="carte" style="margin-bottom:.6rem">'
          + '<div class="deux">'
          + '<div class="champ"><label>Nom</label><input type="text" id="f-nom" placeholder="ex. Étiquette bijou"></div>'
          + '<div class="champ"><label>Type</label><select id="f-type">'
          + '<option value="label">Étiquette</option><option value="stick">Autocollant</option>'
          + '<option value="card">Carte d’affaires</option></select></div>'
          + '<div class="champ"><label>Forme</label><select id="f-forme">'
          + '<option value="rect">Rectangle</option><option value="square">Carré</option>'
          + '<option value="circle">Rond</option></select></div>'
          + '<div class="champ"><label id="f-lw">Largeur (po)</label>'
          + '<input type="number" id="f-w" step="0.1" min="0.4" value="2"></div>'
          + '<div class="champ" id="f-boxh"><label>Hauteur (po)</label>'
          + '<input type="number" id="f-h" step="0.1" min="0.4" value="1"></div>'
          + '</div>'
          + '<div class="aide" style="margin-bottom:.5rem">C’est ce format qui calibrera '
          + 'l’imprimante d’étiquettes au moment d’imprimer.</div>'
          + '<button class="prim" id="p-fmtok">Enregistrer le format</button></div>';
      }
    }
    h += '<table><thead><tr><th>Nom</th><th>Dimensions</th><th>Origine</th><th>Planche</th>'
      + '<th style="text-align:right">Actions</th></tr></thead><tbody>'
      + f.map(function(x){
          return '<tr>'
            + '<td><span class="num">' + esc(x.nom) + '</span><div class="dt">' + esc(x.type) + '</div></td>'
            + '<td><span class="pill neutre">' + esc(x.dim) + '</span></td>'
            + '<td class="dt">' + (x.perso ? 'personnalisé' : 'standard') + '</td>'
            + '<td class="dt">' + (x.planches ? x.planches + ' gabarit' + (x.planches > 1 ? 's' : '') + ' Avery' : 'impression directe') + '</td>'
            + '<td style="text-align:right;white-space:nowrap">'
            + (ro ? '' : '<button class="mini" data-creer="' + esc(x.cle) + '">Créer un modèle</button>'
                + (x.perso ? ' <button class="mini danger" data-fmtsuppr="' + esc(x.id) + '">'
                    + (FMT_ARME === x.id ? 'Confirmer ?' : '✕') + '</button>' : ''))
            + '</td></tr>';
        }).join('')
      + '</tbody></table></div>';
    return h;
  }

  function vueImpression(ro){
    var l = D.lignes || [];
    if (!D.total) {
      return '<div class="carte"><div class="vide">Aucun modèle à imprimer. '
        + 'Créez-en un depuis l’onglet Formats.</div></div>';
    }
    var cible = ligneCible();
    var opts = l.map(function(r){
      return '<option value="' + esc(r.id) + '"' + (r.id === CIBLE ? ' selected' : '') + '>'
        + esc(r.nom) + ' — ' + esc(r.dim) + '</option>';
    }).join('');
    var rapides = [10, 25, 50, 100, 250, 500, 1000];

    var h = '<div class="deux">';

    //  ── Colonne 1 : le travail ──
    h += '<div class="carte"><h2>Impression directe — imprimante d’étiquettes</h2>'
      + '<div class="champ"><label>Modèle</label><select id="p-cible">' + opts + '</select>'
      + (l.length < D.total ? '<div class="aide">Seuls les modèles de la page affichée sont listés — '
          + 'changez de page dans l’onglet Modèles pour en atteindre d’autres.</div>' : '')
      + '</div>'
      + '<div class="champ"><label>Quantité</label>'
      + '<input type="number" id="p-qte" min="1" max="5000" value="' + QTE + '">'
      + '<div class="rapide">' + rapides.map(function(n){
          return '<button class="mini" data-qte="' + n + '">' + n + '</button>'; }).join('') + '</div></div>';

    // L état de l imprimante : un tiret tant qu on ne sait pas, jamais une
    // affirmation qu on dementira 100 ms plus tard.
    h += '<div style="margin:.5rem 0">'
      + rang('Format du modèle', cible ? (cible.dim + (cible.rond ? ' (rond)' : '')) : '—')
      + rang('Imprimante', IMPR ? (IMPR.imprimante || 'non détectée') : '—')
      + rang('Résolution détectée', IMPR ? (IMPR.dpi + ' dpi') : '—')
      + rang('Rendu envoyé', CAL ? CAL.rendu : '—')
      + '</div>';

    if (IMPR && !IMPR.prete) {
      h += '<div class="avis" style="margin-bottom:.5rem">' + esc(IMPR.message || MOTIFS.imprimante) + '</div>';
    }
    if (cible && !cible.rendable) {
      h += '<div class="avis" style="margin-bottom:.5rem">Une image de ce modèle n’est pas lisible '
        + 'par le navigateur : l’impression échouera. Réenregistrez-la depuis la logothèque '
        + '(écran web), puis revenez.</div>';
    }

    if (!ro && CAL) {
      h += '<div class="carte" style="margin-bottom:.5rem"><h2>Ajustement fin (si l’étiquette sort décalée)</h2>'
        + '<div class="cal3">'
        + '<div class="champ"><label>Échelle (%)</label><input type="number" id="c-scale" step="0.5" min="80" max="120" value="' + CAL.echelle + '"></div>'
        + '<div class="champ"><label>Décalage X (mm)</label><input type="number" id="c-x" step="0.5" min="-10" max="10" value="' + CAL.decX + '"></div>'
        + '<div class="champ"><label>Décalage Y (mm)</label><input type="number" id="c-y" step="0.5" min="-10" max="10" value="' + CAL.decY + '"></div>'
        + '</div><div class="aide">Retenu <strong>par imprimante et par format</strong>, dans votre profil.</div></div>';
    }

    if (JOB) {
      var pct = Math.round(JOB.faites / JOB.total * 100);
      h += '<div><div class="rang"><span>Impression en cours</span><strong>'
        + JOB.faites + ' / ' + JOB.total + '</strong></div>'
        + '<div class="barre"><i style="width:' + pct + '%"></i></div>'
        + '<button class="danger" id="p-arret">' + (JOB.arret ? 'Arrêt demandé…' : 'Arrêter') + '</button></div>';
    } else if (!ro) {
      h += '<div class="barreoutils">'
        + '<button class="prim" id="p-lancer"' + (EN_COURS ? ' disabled' : '') + '>Lancer l’impression</button>'
        + '<button id="p-test"' + (EN_COURS ? ' disabled' : '') + '>Imprimer 1 test</button>'
        + '<button id="p-relire">Relire l’imprimante</button>'
        + '</div>';
    }
    h += '</div>';

    //  ── Colonne 2 : aperçu et planche ──
    h += '<div class="carte"><h2>Aperçu — ce qui sera imprimé</h2>'
      + '<div class="gapercu">'
      + (APERCU && APERCU.image ? '<img src="' + esc(APERCU.image) + '" alt="">'
          : '<span class="aide" style="text-align:center;color:#6b7280">'
            + (APERCU ? 'Ce modèle n’a pas pu être rendu.' : 'Rendu…') + '</span>')
      + '</div>'
      + '<div class="aide" style="text-align:center;margin-top:.4rem">Rendu identique à l’impression (même moteur).</div>';

    var pl = (APERCU && APERCU.planches) || [];
    h += '<div style="border-top:1px solid rgba(255,255,255,.08);margin:.7rem 0 .5rem"></div>'
      + '<h2>Planche sur feuille Lettre (imprimante ordinaire)</h2>';
    if (!pl.length) {
      h += '<div class="aide">Aucun gabarit Avery ne correspond exactement à ce format. '
        + 'L’impression directe sur l’imprimante d’étiquettes reste la voie recommandée.</div>';
    } else {
      h += '<div class="champ"><select id="p-planche">'
        + pl.map(function(t){
            return '<option value="' + esc(t.id) + '"' + (PLANCHE === t.id ? ' selected' : '') + '>'
              + esc(t.nom) + '</option>'; }).join('')
        + '</select></div>'
        + '<button id="p-genplanche"' + (ro ? ' disabled' : '') + '>Générer la planche</button>'
        + '<div class="aide" style="margin-top:.35rem">Elle s’ouvre dans la fenêtre principale : '
        + 'c’est une page à imprimer par le navigateur.</div>';
    }
    h += '</div></div>';
    return h;
  }

  function rang(l, v){
    return '<div class="rang"><span>' + esc(l) + '</span><strong>' + esc(v) + '</strong></div>';
  }

  /* ── L IMPRESSION, LOT PAR LOT ─────────────────────────────────────────── */
  function lancer(total){
    if (!CIBLE) { dire('Choisissez un modèle.', 'att'); return; }
    if (EN_COURS) return;
    EN_COURS = true;
    JOB = { faites: 0, total: total, arret: false };
    dessiner();
    var suite = function(){
      if (JOB.arret || JOB.faites >= JOB.total) {
        var faites = JOB.faites, arrete = JOB.arret;
        JOB = null; EN_COURS = false;
        dessiner();
        dire(arrete
          ? ('Impression arrêtée après ' + faites + ' / ' + total + ' étiquette' + (total > 1 ? 's' : '') + '.')
          : (faites + ' étiquette' + (faites > 1 ? 's' : '') + ' envoyée' + (faites > 1 ? 's' : '')
             + ' à ' + ((IMPR && IMPR.imprimante) || 'l’imprimante') + '.'),
          arrete ? 'att' : 'bon');
        charger();
        return;
      }
      var n = Math.min(25, JOB.total - JOB.faites);
      dire('Impression ' + (JOB.faites + n) + ' / ' + JOB.total + '…');
      appeler('promo:lot', [CIBLE, n]).then(function(r){
        if (!r.ok) {
          var faites = JOB.faites;
          JOB = null; EN_COURS = false;
          dessiner();
          dire(expliquer(r) + (faites ? ' — ' + faites + ' étiquette(s) déjà envoyée(s).' : ''), 'err');
          lireImprimante();
          return;
        }
        JOB.faites += r.envoyees || n;
        dessiner();
        suite();
      });
    };
    suite();
  }

  /* ── BRANCHEMENTS ──────────────────────────────────────────────────────── */
  function brancher(){
    var q = document.getElementById('p-q');
    if (q) q.oninput = function(){
      Q = q.value; PAGE = 0;
      clearTimeout(window._pq);
      window._pq = setTimeout(function(){ charger(true); }, 300);
    };
    var tri = document.getElementById('p-tri');
    if (tri) tri.onchange = function(){ TRI = tri.value; PAGE = 0; charger(); };
    var bp = document.getElementById('p-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, (D.page || 0) - 1); charger(); };
    var bs = document.getElementById('p-suiv');
    if (bs) bs.onclick = function(){ PAGE = (D.page || 0) + 1; charger(); };

    var cible = document.getElementById('p-cible');
    if (cible) cible.onchange = function(){ CIBLE = cible.value; APERCU = null; dessiner(); lireApercu(); };
    var qte = document.getElementById('p-qte');
    if (qte) qte.oninput = function(){
      var v = parseInt(qte.value, 10);
      QTE = (v > 0 ? Math.min(5000, v) : 1);
    };
    var lancerB = document.getElementById('p-lancer');
    if (lancerB) lancerB.onclick = function(){
      var v = document.getElementById('p-qte');
      var n = Math.max(1, Math.min(5000, parseInt(v ? v.value : QTE, 10) || QTE));
      QTE = n;
      lancer(n);
    };
    var test = document.getElementById('p-test');
    if (test) test.onclick = function(){ lancer(1); };
    var relire = document.getElementById('p-relire');
    if (relire) relire.onclick = function(){ dire('Lecture de l’imprimante…'); lireImprimante(true); };
    var arret = document.getElementById('p-arret');
    if (arret) arret.onclick = function(){ if (JOB) { JOB.arret = true; dessiner(); } };

    var gp = document.getElementById('p-genplanche');
    if (gp) gp.onclick = function(){
      var s = document.getElementById('p-planche');
      var id = s ? s.value : '';
      PLANCHE = id;
      dire('Génération de la planche…');
      appeler('promo:planche', [CIBLE, id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Planche « ' + r.planche + ' » ouverte dans la fenêtre principale ('
          + r.parFeuille + ' par feuille).', 'bon');
      });
    };

    ['c-scale', 'c-x', 'c-y'].forEach(function(id){
      var e = document.getElementById(id);
      if (!e) return;
      e.onchange = function(){
        var champ = id === 'c-scale' ? 'scale' : (id === 'c-x' ? 'offX' : 'offY');
        appeler('promo:calibrer', [CIBLE, champ, e.value]).then(function(r){
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          CAL = r; dessiner(); dire('Calibration enregistrée.', 'bon');
        });
      };
    });

    var fn = document.getElementById('p-fmtnouv');
    if (fn) fn.onclick = function(){ NOUVEAU = !NOUVEAU; dessiner(); };
    var forme = document.getElementById('f-forme');
    if (forme) forme.onchange = function(){
      var lw = document.getElementById('f-lw');
      var bh = document.getElementById('f-boxh');
      if (lw) lw.textContent = forme.value === 'circle' ? 'Diamètre (po)'
        : (forme.value === 'square' ? 'Côté (po)' : 'Largeur (po)');
      if (bh) bh.style.display = (forme.value === 'rect') ? '' : 'none';
    };
    var fok = document.getElementById('p-fmtok');
    if (fok) fok.onclick = function(){
      var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
      dire('Enregistrement…');
      appeler('promo:formatEcrire', [{ nom: g('f-nom'), type: g('f-type'), forme: g('f-forme'),
        w: g('f-w'), h: g('f-h') }]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Format « ' + r.nom + ' » enregistré (' + r.dim + ').', 'bon');
        NOUVEAU = false;
        charger();
      });
    };
  }

  /* ⚠ UN CLIC SUR UNE COMMANDE EST TRAITE PAR SA COMMANDE : la garde du
     gestionnaire general sort avant de desarmer, sinon le clic qui vient
     d ARMER un bouton le desarme dans la meme foulee (le piege de 1.72.0). */
  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) {
      ONGLET = og.getAttribute('data-onglet');
      SUPPR_ARME = ''; FMT_ARME = '';
      dessiner();
      if (ONGLET === 'impression') preparerImpression();
      return;
    }
    var qb = t.closest('[data-qte]');
    if (qb) {
      QTE = parseInt(qb.getAttribute('data-qte'), 10) || 100;
      var e = document.getElementById('p-qte'); if (e) e.value = QTE;
      return;
    }
    var im = t.closest('[data-imprimer]');
    if (im) {
      CIBLE = im.getAttribute('data-imprimer');
      ONGLET = 'impression'; APERCU = null;
      dessiner(); preparerImpression();
      return;
    }
    var ed = t.closest('[data-editeur]');
    if (ed) {
      var idE = ed.getAttribute('data-editeur');
      dire('Ouverture de l’éditeur…');
      appeler('promo:editeur', [idE]).then(function(r){
        dire(r.ok ? ('« ' + r.nom +' » ouvert dans la fenêtre principale.') : expliquer(r), r.ok ? 'bon' : 'err');
      });
      return;
    }
    var du = t.closest('[data-dup]');
    if (du) {
      dire('Duplication…');
      appeler('promo:dupliquer', [du.getAttribute('data-dup')]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('« ' + r.nom + ' » créé.', 'bon');
        charger();
      });
      return;
    }
    var su = t.closest('[data-suppr]');
    if (su) {
      var idS = su.getAttribute('data-suppr');
      /* ⚠ ARME EN DEUX CLICS : un modele supprime ne se reconstitue pas. */
      if (SUPPR_ARME !== idS) {
        SUPPR_ARME = idS; dessiner();
        setTimeout(function(){ if (SUPPR_ARME === idS) { SUPPR_ARME = ''; dessiner(); } }, 5000);
        return;
      }
      SUPPR_ARME = '';
      appeler('promo:supprimer', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('« ' + r.nom + ' » (' + r.dim + ') supprimé. Les impressions déjà faites ne sont pas touchées.', 'bon');
        if (CIBLE === idS) { CIBLE = ''; APERCU = null; }
        charger();
      });
      return;
    }
    var cr = t.closest('[data-creer]');
    if (cr) {
      dire('Création…');
      appeler('promo:nouveau', [cr.getAttribute('data-creer')]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('« ' + r.nom + ' » créé — ouvrez l’éditeur pour le mettre en page.', 'bon');
        ONGLET = 'modeles';
        charger();
      });
      return;
    }
    var fs = t.closest('[data-fmtsuppr]');
    if (fs) {
      var idF = fs.getAttribute('data-fmtsuppr');
      if (FMT_ARME !== idF) {
        FMT_ARME = idF; dessiner();
        setTimeout(function(){ if (FMT_ARME === idF) { FMT_ARME = ''; dessiner(); } }, 5000);
        return;
      }
      FMT_ARME = '';
      appeler('promo:formatSupprimer', [idF]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Format « ' + r.nom + ' » retiré. Les modèles déjà créés ne changent pas.', 'bon');
        charger();
      });
      return;
    }
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-mod]');
    if (tr) {
      CIBLE = tr.getAttribute('data-mod');
      ONGLET = 'impression'; APERCU = null;
      dessiner(); preparerImpression();
    }
  };

  /* ── CHARGEMENT ────────────────────────────────────────────────────────── */
  function preparerImpression(){
    if (!CIBLE) {
      var l = (D && D.lignes) || [];
      if (l.length) CIBLE = l[0].id;
    }
    if (!CIBLE) return;
    lireApercu();
    lireImprimante();
  }
  function lireApercu(){
    if (!CIBLE) return;
    appeler('promo:apercu', [CIBLE, 320]).then(function(r){
      APERCU = r.ok ? r : { image: '', planches: [] };
      if (r.ok && (r.planches || []).length && !PLANCHE) PLANCHE = r.planches[0].id;
      if (ONGLET === 'impression' && !JOB) dessiner();
    });
  }
  function lireImprimante(annonce){
    appeler('promo:imprimante', []).then(function(r){
      if (r.ok) IMPR = r;
      return appeler('promo:calibration', [CIBLE]);
    }).then(function(c){
      if (c && c.ok) CAL = c;
      if (ONGLET === 'impression' && !JOB) dessiner();
      if (annonce) dire(IMPR && IMPR.prete ? ('Prête — ' + IMPR.imprimante + '.') : (IMPR ? IMPR.message : ''),
        IMPR && IMPR.prete ? 'bon' : 'att');
    });
  }

  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('promo:donnees', [{ q: Q, tri: TRI, page: PAGE, taille: 12 }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('Centre d’impression indisponible', expliquer(r)); return; }
      D = r;
      if (!CIBLE && (D.lignes || []).length) CIBLE = D.lignes[0].id;
      var s = document.getElementById('sous');
      if (s) s.textContent = (D.kpis && D.kpis.modeles || 0) + ' modèle'
        + ((D.kpis && D.kpis.modeles || 0) > 1 ? 's' : '');
      if (garderSaisie) redessinerSansPerdreLaSaisie();
      else dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('p-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('p-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  /* ⚠ JAMAIS PENDANT UNE IMPRESSION : redessiner sous un lot en cours ferait
     disparaitre la progression et le bouton d arret. */
  window.szActualiser = function(){
    if (EN_COURS || JOB) return;
    var q = document.getElementById('p-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ if (!EN_COURS && !JOB) charger(); };

  /* ── MODE ANCRE ── Le meme bouton que les autres ecrans. */
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);'
        + 'color:#e8edf5;cursor:pointer;flex:0 0 auto');
      t.appendChild(b);
    }
    if (actif) {
      b.textContent = '⧉ Détacher';
      b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '⚓ Ancrer';
      b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      /* ⚠ On ne ferme PAS pendant un lot : l impression continuerait sans que
         personne ne puisse plus l arreter ni voir son verdict. */
      if (JOB) { JOB.arret = true; dessiner(); dire('Arrêt demandé.', 'att'); return; }
      P.fermer();
    }
  });

  charger();
  if (ONGLET === 'impression') setTimeout(preparerImpression, 0);
})();
</script>
</body></html>`;
}

module.exports = { pagePromo };
