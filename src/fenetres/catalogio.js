'use strict';

/*
 * FENÊTRE « IMPORT / EXPORT DE LA BOUTIQUE » — NATIVE (3.13.0, #30)
 * =============================================================================
 * Le dernier gros écran qui n'existait qu'en version web. Deux onglets :
 * EXPORTER (sortir le catalogue ou l'inventaire en fichier tableur) et IMPORTER
 * (remonter un fichier modifié pour ajuster des centaines de fiches d'un coup,
 * avec un aperçu ligne par ligne AVANT d'écrire quoi que ce soit).
 *
 * ⚠⚠ LA FENÊTRE NE CALCULE RIEN. Le décodage ANSI, la reconnaissance de la
 * feuille et du séparateur, les règles d'affaires, le garde-fou des variantes
 * en stock, la reprise des photos et l'écriture par lots vivent dans
 * catalogio.js (cœurs sans DOM) et servent AUSSI l'écran du site. La fenêtre
 * lit le fichier, le DÉCODE (mêmes octets, même repli Windows-1252) et envoie le
 * TEXTE ; tout le reste se fait sur la page principale, là où sont DB, la
 * session et les coûts.
 *
 * ⚠ LES TÉLÉCHARGEMENTS PARTENT DE LA PAGE PRINCIPALE (export, modèle, rapport)
 * — exactement comme la sauvegarde. La fenêtre ne fait qu'en donner l'ordre au
 * pont ; c'est la page principale qui déclenche le Blob. Le fichier à importer,
 * lui, se lit DANS la fenêtre (un <input type=file>, comme le studio et la
 * logothèque le font déjà).
 *
 * ⚠ L'ÉTAT DE L'IMPORT VIT SUR LA PAGE (dans le module CatalogIO), pas ici : la
 * fenêtre restaure l'aperçu ou le rapport en cours depuis « catalogio:etat ».
 * C'est ce qui permet au banc d'atteindre l'aperçu, le résumé et le rapport
 * SANS téléverser de fichier (le banc ne clique ni ne dépose rien) — chacun a
 * son identifiant d'ouverture plus bas.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : tout ce script vit dans un littéral de gabarit. Écrire « ainsi »,
 * jamais avec un accent grave.
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
.onglets{flex:0 0 auto;display:flex;gap:.4rem;padding:.5rem 1.05rem 0;
  border-bottom:1px solid rgba(255,255,255,.08)}
.onglets button{background:transparent;border:none;border-bottom:2px solid transparent;
  color:#8fa1b8;padding:.4rem .7rem;font-weight:600;font-size:.86rem;border-radius:6px 6px 0 0}
.onglets button:hover{background:rgba(255,255,255,.05);color:#e8edf5}
.onglets button.actif{color:#e8dcc6;border-bottom-color:#c9a97e}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.8rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
input,button,select{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.32rem .55rem}
button{cursor:pointer;-webkit-user-select:none;user-select:none}
input:focus,button:focus,select:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .45rem;font-size:.74rem}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600;
  padding:.4rem .8rem}
button.prim:hover:not(:disabled){background:#a3824f}
button.ghost{background:transparent}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
input[type=file]{padding:.5rem;width:100%;max-width:34rem}
.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
  gap:1rem;align-items:start}
.lbl{font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8;
  font-weight:700;margin:0 0 .35rem}
.radio{display:flex;gap:.5rem;align-items:flex-start;padding:.5rem .6rem;
  border:1px solid rgba(255,255,255,.14);border-radius:9px;cursor:pointer;
  -webkit-user-select:none;user-select:none;margin-bottom:.4rem}
.radio.pris{border-color:#c9a97e;background:rgba(201,169,126,.1)}
.radio input{margin-top:.2rem;accent-color:#c9a97e;flex:0 0 auto}
.radio .t{font-weight:600;font-size:.86rem}
.radio .s{font-size:.74rem;color:#8fa1b8;line-height:1.45}
.case{display:flex;gap:.5rem;align-items:flex-start;font-size:.83rem;cursor:pointer;
  -webkit-user-select:none;user-select:none;margin-bottom:.4rem}
.case input{margin-top:.15rem;accent-color:#c9a97e;flex:0 0 auto}
.case .s{font-size:.72rem;color:#8fa1b8}
.barre{display:flex;gap:.7rem;align-items:center;flex-wrap:wrap;
  padding-top:.9rem;margin-top:.3rem;border-top:1px solid rgba(255,255,255,.08)}
.barre .compte{font-size:.8rem;color:#8fa1b8}
.avis{background:rgba(148,163,184,.1);border:1px solid rgba(148,163,184,.22);
  border-radius:10px;padding:.5rem .65rem;font-size:.79rem;color:#cbd8e6;line-height:1.55}
.avis.jaune{background:rgba(217,119,6,.12);border-color:rgba(217,119,6,.3);color:#fcd9a6}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.55rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.5rem .7rem}
.tuile .k{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.tuile .v{font-size:1.1rem;font-weight:800;margin-top:.1rem}
.tuile .z{font-size:.66rem;color:#8fa1b8;margin-top:.05rem}
.tuile.err .v{color:#f87171}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;
  color:#8fa1b8;font-weight:700}
table{width:100%;border-collapse:collapse;font-size:.83rem}
thead th{text-align:left;padding:.26rem .4rem;font-size:.66rem;text-transform:uppercase;
  letter-spacing:.05em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.3rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:top}
tbody tr:hover td{background:rgba(255,255,255,.04)}
code{font:.76rem/1.4 Consolas,monospace;color:#cbd8e6}
.dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.05rem .5rem;border-radius:99px;font-weight:700}
.pill.creation{background:rgba(59,130,246,.2);color:#93c5fd}
.pill.maj{background:rgba(217,119,6,.2);color:#fcd34d}
.pill.inchange{background:rgba(148,163,184,.18);color:#cbd5e1}
.pill.erreur,.pill.conflit,.pill.echec{background:rgba(220,38,38,.2);color:#fca5a5}
.pill.fait{background:rgba(22,163,74,.2);color:#86efac}
.chg{display:inline-block;margin:0 .3rem .22rem 0;padding:.08rem .42rem;border-radius:5px;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);font-size:.74rem}
.chg .de{color:#8fa1b8;text-decoration:line-through}
.rouge{color:#f87171}
.filtres{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;margin-bottom:.6rem}
.pager{display:flex;align-items:center;gap:.6rem;justify-content:flex-end;margin-top:.5rem;
  font-size:.75rem;color:#8fa1b8;flex-wrap:wrap}
.pager .gauche{margin-right:auto;display:flex;align-items:center;gap:.35rem}
.pager select{padding:.1rem .3rem;font-size:.74rem}
.vide{padding:1.4rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.centre{max-width:60rem}
.avancement{max-width:32rem;margin:2.5rem auto;text-align:center}
.avancement .tourne{width:34px;height:34px;margin:1rem auto 0;border-radius:50%;
  border:3px solid rgba(255,255,255,.14);border-top-color:#c9a97e;animation:tr 1s linear infinite}
@keyframes tr{to{transform:rotate(360deg)}}
/* ── Surcouche de confirmation (structure .voile > .boite reconnue par le socle,
   le bouton de plein ecran s y pose tout seul). ─────────────────────────────── */
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:34rem;width:100%;max-height:88vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .6rem;font:700 .98rem/1.3 Georgia,serif}
.boite ul{margin:0 0 .7rem;padding-left:1.15rem;line-height:1.85;font-size:.86rem}
.gare{padding:.5rem .65rem;border-radius:9px;background:rgba(148,163,184,.1);
  border:1px solid rgba(148,163,184,.22);font-size:.78rem;color:#cbd8e6;line-height:1.55}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.85rem;flex-wrap:wrap}
.pied-boite .gauche{margin-right:auto}
.notif{display:flex;justify-content:space-between;align-items:center;gap:1rem;
  padding:.4rem 0;border-top:1px solid rgba(255,255,255,.07);font-size:.83rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

/**
 * Page complète de la fenêtre « Import / Export ».
 * `ouverture` : '' (onglet Exporter) · 'import' (onglet Importer, choix du
 * fichier) · 'apercu' (l'aperçu d'un import — restauré depuis catalogio:etat) ·
 * 'confirmer' (l'aperçu AVEC le résumé de confirmation ouvert) · 'rapport' (le
 * rapport d'un import terminé).
 * ⚠ CHAQUE ÉCRAN A SON IDENTIFIANT : le banc ne téléverse pas de fichier. Sans
 * eux, l'aperçu, le résumé de confirmation et le rapport lui resteraient
 * invisibles — l'angle mort exact qui a laissé passer les six trous de #32.
 */
function pageCatalogio(ouverture) {
  const ouv = String(ouverture || '');
  const ouvImport = (ouv === 'import');
  const ouvApercu = (ouv === 'apercu');
  const ouvConfirmer = (ouv === 'confirmer');
  const ouvRapport = (ouv === 'rapport');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Import / Export — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">⇅</span><h1>Import / Export de la boutique</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets" id="onglets"></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var corps   = document.getElementById('corps');
  var sous    = document.getElementById('sous');
  var ongletsEl = document.getElementById('onglets');

  var TAB = 'export';        // export | import
  var SHEET = 'catalogue';   // catalogue | inventaire
  var SEP = ';';             // ; | ,
  var INCL_HV = false;       // inclure les produits hors vente
  var INCL_COUT = false;     // inclure le cout d acquisition (donnee de marge)
  var ETAT = null;           // derniere reponse de catalogio:etat
  var PEUT = { vue:true, edit:false, ajout:false };
  var IMP = null;            // resume de l analyse en cours (ou null)
  var LIGNES = null;         // une page de l apercu (catalogio:lignes)
  var FILTRE = 'tous';
  var PAGE = 0, TAILLE = 50;
  var RAP = null;            // rapport d un import termine
  var BUSY = false;          // application en cours
  var CONFIRM = false;       // surcouche de confirmation ouverte

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function plur(n){ return n === 1 ? '' : 's'; }

  var MOTIFS = {
    session:      'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:        'Votre rôle ne donne pas accès à cette opération.',
    indisponible: 'L’administration n’est pas encore chargée dans la fenêtre principale.',
    occupe:       'Un import est déjà en cours.',
    couts:        'Coûts non relus depuis le serveur — décochez la colonne Coût, ou actualisez la fenêtre principale.',
    rien:         'Aucun fichier analysé.',
    refus:        'Fichier refusé.',
    illisible:    'Fichier illisible.',
    introuvable:  'Élément introuvable.',
    echec:        'L’opération a échoué.'
  };
  function expliquer(r){
    if (!r) return 'Aucune réponse de la fenêtre principale.';
    if (r.detail) return String(r.detail);
    return MOTIFS[r.motif] || MOTIFS.echec;
  }

  function appeler(op, arg){
    if (!P || !P.appeler) return Promise.resolve({ ok:false, motif:'indisponible' });
    return P.appeler(op, arg).catch(function(){ return { ok:false, motif:'echec' }; });
  }
  function optsExport(){ return { sheet:SHEET, sep:SEP, inclHorsVente:INCL_HV, inclCout:INCL_COUT }; }

  function vide(titre, detail){
    ongletsEl.innerHTML = '';
    corps.innerHTML = '<div class="vide"><div style="font:700 1.3rem/1 Georgia,serif;color:#e8dcc6">'
      + esc(titre) + '</div><div style="margin-top:.35rem">' + esc(detail || '') + '</div></div>';
  }

  /* ══ DÉCODAGE DU FICHIER (dans la fenêtre) ═══════════════════════════════════
     ⚠ MÊME LOGIQUE QUE _decoder DU SITE : Excel Windows n’écrit PAS de l’UTF-8.
     BOM ou UTF-8 valide -> UTF-8 ; séquence invalide -> repli Windows-1252, sinon
     les accents remontent en charabia et l’import renommerait les fiches. */
  function decoder(buf){
    var u8 = new Uint8Array(buf);
    if (u8.length >= 3 && u8[0] === 0xEF && u8[1] === 0xBB && u8[2] === 0xBF) return new TextDecoder('utf-8').decode(u8);
    try { return new TextDecoder('utf-8', { fatal:true }).decode(u8); }
    catch(e){ try { return new TextDecoder('windows-1252').decode(u8); } catch(e2){ return new TextDecoder('utf-8').decode(u8); } }
  }

  /* ══ LECTURE DE L ÉTAT ═══════════════════════════════════════════════════════ */
  function chargerEtat(){
    return appeler('catalogio:etat', optsExport()).then(function(r){
      if (!r || !r.ok) { vide('Import / Export indisponible', expliquer(r)); return false; }
      ETAT = r; PEUT = r.peut || PEUT;
      if (r.imp && !IMP) IMP = r.imp;       // restauration d un import en cours
      if (r.rapport && !RAP) RAP = r.rapport;
      return true;
    });
  }
  function chargerLignes(){
    return appeler('catalogio:lignes', { filtre:FILTRE, page:PAGE, taille:TAILLE }).then(function(r){
      if (!r || !r.ok) { if (r && r.motif === 'rien') IMP = null; LIGNES = null; dessiner(); return false; }
      LIGNES = r; PAGE = r.page; dessiner(); return true;
    });
  }

  /* ══ ONGLETS ═════════════════════════════════════════════════════════════════ */
  function dessinerOnglets(){
    ongletsEl.innerHTML =
        '<button data-tab="export" class="' + (TAB === 'export' ? 'actif' : '') + '">⬇ Exporter</button>'
      + '<button data-tab="import" class="' + (TAB === 'import' ? 'actif' : '') + '">⬆ Importer</button>';
  }

  /* ══ ONGLET EXPORTER ═════════════════════════════════════════════════════════ */
  function radio(nom, val, cur, titre, sousT, attr){
    return '<label class="radio' + (cur === val ? ' pris' : '') + '">'
      + '<input type="radio" name="' + nom + '" ' + (cur === val ? 'checked' : '') + ' ' + attr + '>'
      + '<span><span class="t">' + esc(titre) + '</span><br><span class="s">' + esc(sousT) + '</span></span></label>';
  }
  function vueExport(){
    var e = ETAT || {};
    var coutsOk = !!e.coutsCharges;
    var compte = SHEET === 'inventaire'
      ? ((e.nbVariantes || 0) + ' variante' + plur(e.nbVariantes || 0) + ' sur ' + (e.nbProduits || 0) + ' produit' + plur(e.nbProduits || 0))
      : ((e.nbProduits || 0) + ' produit' + plur(e.nbProduits || 0));
    var caseCout = PEUT.edit
      ? '<label class="case"><input type="checkbox" data-opt="cout"' + (INCL_COUT ? ' checked' : '')
        + (coutsOk ? '' : ' disabled') + '><span>Inclure le coût d’acquisition et le motif de vente à perte'
        + '<br><span class="s">' + (coutsOk
            ? 'Données de marge — le fichier ne devrait pas sortir de l’entreprise.'
            : '⚠ Coûts non relus : actualisez la fenêtre principale pour activer cette option.') + '</span></span></label>'
      : '';
    var lignesCol = (e.colonnes || []).map(function(c){
      var tags = '';
      if (c.key)  tags += '<span class="pill creation">clé</span> ';
      if (c.info) tags += '<span class="pill inchange">information</span> ';
      if (c.req)  tags += '<span class="pill maj">requise à la création</span> ';
      if (c.priv) tags += '<span class="pill erreur">donnée de marge</span> ';
      return '<tr><td style="white-space:nowrap"><strong>' + esc(c.lbl) + '</strong></td><td>'
        + tags + esc(c.aide || '') + '</td></tr>';
    }).join('');

    return '<div class="centre">'
      + '<div class="grille">'
      +   '<div><div class="lbl">Feuille</div>'
      +     radio('sheet', 'catalogue', SHEET, 'Catalogue', 'Une ligne par produit : prix, soldes, noms, catégorie, étiquettes, tailles et couleurs.', 'data-sheet="catalogue"')
      +     radio('sheet', 'inventaire', SHEET, 'Inventaire', 'Une ligne par variante taille × couleur : quantité et emplacement d’entrepôt.', 'data-sheet="inventaire"')
      +   '</div>'
      +   '<div><div class="lbl">Séparateur de colonnes</div>'
      +     radio('sep', ';', SEP, 'Point-virgule', 'Excel en français ouvre directement en colonnes ; les montants s’écrivent « 89,00 ».', 'data-sep=";"')
      +     radio('sep', ',', SEP, 'Virgule', 'Google Sheets et les outils anglophones ; les montants s’écrivent « 89.00 ».', 'data-sep=","')
      +     '<div style="margin-top:.7rem">'
      +       '<label class="case"><input type="checkbox" data-opt="hv"' + (INCL_HV ? ' checked' : '') + '><span>Inclure les produits hors vente</span></label>'
      +       caseCout
      +     '</div>'
      +   '</div>'
      + '</div>'
      + '<div class="barre">'
      +   '<button class="prim" data-act="exporter">⬇ Sortir le CSV</button>'
      +   '<button class="ghost mini" data-act="modele">Modèle vide (en-têtes seuls)</button>'
      +   '<span class="compte">' + compte + '</span>'
      + '</div>'
      + '<div style="margin-top:1.4rem">'
      +   '<div class="lbl">Colonnes de la feuille ' + esc(SHEET) + '</div>'
      +   '<div class="avis" style="margin-bottom:.7rem">À l’import, <strong>seules les colonnes présentes dans votre fichier sont touchées</strong> : '
      +     'un fichier « SKU ; Prix » ne change que le prix. Les colonnes <em>information</em> sont exportées pour vous repérer et ignorées à la relecture.</div>'
      +   '<div class="carte"><table><thead><tr><th>Colonne</th><th>Rôle</th></tr></thead><tbody>' + lignesCol + '</tbody></table></div>'
      + '</div>'
      + '</div>';
  }

  /* ══ ONGLET IMPORTER ═════════════════════════════════════════════════════════ */
  function vueImportDepart(){
    return '<div class="centre">'
      + '<div class="lbl">Fichier CSV</div>'
      + '<input type="file" id="fichier" accept=".csv,.txt,text/csv">'
      + '<div class="avis" style="margin-top:.7rem">La feuille (catalogue ou inventaire) et le séparateur sont '
      +   '<strong>reconnus automatiquement</strong> d’après les en-têtes, qui acceptent les accents, les majuscules '
      +   'et les noms anglais courants (<em>price</em>, <em>sale price</em>, <em>qty</em>…).<br>'
      +   'Maximum 8 Mo et 5000 lignes. <strong>Rien n’est écrit avant l’aperçu et votre confirmation.</strong></div>'
      + '<div class="avis" style="margin-top:.7rem">Pas de fichier sous la main ? Passez par l’onglet '
      +   '<strong>Exporter</strong> : le fichier obtenu se remonte tel quel après modification.</div>'
      + '</div>';
  }

  function badge(etat){
    var M = { creation:'À créer', maj:'À modifier', inchange:'Inchangée', erreur:'Erreur',
              fait:'Écrit', conflit:'Conflit', echec:'Échec' };
    return '<span class="pill ' + etat + '">' + (M[etat] || etat) + '</span>';
  }
  function ligneApercu(L, inv){
    var quoi = L.err
      ? '<span class="rouge">' + esc(L.err) + '</span>'
      : ((L.diffs && L.diffs.length)
          ? L.diffs.map(function(d){ return '<span class="chg">' + esc(d.lbl)
              + ' : <span class="de">' + esc(d.de) + '</span> → <strong>' + esc(d.vers) + '</strong></span>'; }).join('')
          : '<span class="dt">—</span>');
    var qui = inv
      ? (esc(L.nom || '—') + ' <span class="dt">· ' + esc(L.taille + ' / ' + L.couleur) + '</span>')
      : esc(L.nom || '—');
    return '<tr><td class="dt">' + L.n + '</td>'
      + '<td><code>' + esc(L.sku || '—') + '</code></td>'
      + '<td>' + qui + '</td>'
      + '<td>' + badge(L.etat) + '</td>'
      + '<td>' + quoi + '</td></tr>';
  }
  function pager(){
    if (!LIGNES) return '';
    var opts = [50,100,200].map(function(n){
      return '<option value="' + n + '"' + (TAILLE === n ? ' selected' : '') + '>' + n + '</option>'; }).join('');
    var nav = '';
    if (LIGNES.pages > 1) {
      nav = '<button class="mini" data-page="' + (LIGNES.page - 1) + '"' + (LIGNES.page === 0 ? ' disabled' : '') + '>← Précédent</button>'
        + '<span>Page ' + (LIGNES.page + 1) + ' / ' + LIGNES.pages + '</span>'
        + '<button class="mini" data-page="' + (LIGNES.page + 1) + '"' + (LIGNES.page >= LIGNES.pages - 1 ? ' disabled' : '') + '>Suivant →</button>';
    }
    return '<div class="pager"><span class="gauche">Afficher <select id="taille">' + opts + '</select> par page · '
      + LIGNES.total + ' ligne' + plur(LIGNES.total) + '</span>' + nav + '</div>';
  }
  function vueApercu(){
    var c = IMP.compte, inv = IMP.feuille === 'inventaire';
    var filtres = [['tous','Tout',IMP.total],['creation','À créer',c.creation],['maj','À modifier',c.maj],
                   ['inchange','Inchangées',c.inchange],['erreur','Erreurs',c.erreur]];
    var lignes = (LIGNES && LIGNES.lignes.length)
      ? LIGNES.lignes.map(function(L){ return ligneApercu(L, inv); }).join('')
      : '<tr><td colspan="5" class="vide">Aucune ligne dans ce filtre.</td></tr>';
    var noteIgn = (IMP.ignorees && IMP.ignorees.length)
      ? '<div class="avis" style="margin-bottom:.7rem">Colonne(s) non reconnue(s), donc <strong>ignorée(s)</strong> : '
        + esc(IMP.ignorees.slice(0,12).join(', ')) + (IMP.ignorees.length > 12 ? '…' : '') + '</div>' : '';
    var notePhoto = IMP.nbPhotos
      ? '<div class="avis jaune" style="margin-bottom:.7rem">📷 <strong>' + IMP.nbPhotos + ' photo' + plur(IMP.nbPhotos)
        + '</strong> seront téléchargées depuis les adresses du fichier et copiées dans votre stockage — la boutique '
        + 'ne pointera jamais sur le site du fournisseur. Une photo introuvable n’empêche pas le reste de sa ligne de passer.</div>' : '';
    return ''
      + '<div class="barre" style="border:none;padding:0;margin:0 0 .3rem">'
      +   '<div style="font-size:.85rem"><strong>' + esc(IMP.fichier) + '</strong> · feuille <strong>' + esc(IMP.feuille)
      +     '</strong> · ' + IMP.total + ' ligne' + plur(IMP.total) + '</div>'
      +   '<span style="flex:1"></span>'
      +   '<button class="ghost mini" data-act="reinit">Choisir un autre fichier</button>'
      + '</div>'
      + noteIgn + notePhoto
      + '<div class="tuiles" style="margin-bottom:.2rem">'
      +   '<div class="tuile"><div class="k">À créer</div><div class="v">' + c.creation + '</div><div class="z">hors vente</div></div>'
      +   '<div class="tuile"><div class="k">À modifier</div><div class="v">' + c.maj + '</div><div class="z">' + (inv ? 'variantes' : 'fiches') + '</div></div>'
      +   '<div class="tuile"><div class="k">Inchangées</div><div class="v">' + c.inchange + '</div><div class="z">rien à écrire</div></div>'
      +   '<div class="tuile' + (c.erreur ? ' err' : '') + '"><div class="k">Erreurs</div><div class="v">' + c.erreur + '</div><div class="z">ignorées</div></div>'
      + '</div>'
      + '<div class="carte">'
      +   '<div class="filtres">'
      +     filtres.map(function(f){ return '<button class="mini ' + (FILTRE === f[0] ? 'actif' : '')
              + '" data-filtre="' + f[0] + '">' + f[1] + ' (' + f[2] + ')</button>'; }).join('')
      +     '<span style="flex:1"></span>'
      +     '<button class="ghost mini" data-act="rapport">⬇ Aperçu en CSV</button>'
      +   '</div>'
      +   '<table><thead><tr><th style="width:52px">Ligne</th><th style="width:120px">SKU</th>'
      +     '<th>' + (inv ? 'Variante' : 'Produit') + '</th><th style="width:96px">État</th><th>Ce qui change</th></tr></thead>'
      +     '<tbody>' + lignes + '</tbody></table>' + pager()
      + '</div>'
      + '<div class="barre">'
      +   '<button class="prim" ' + ((c.creation + c.maj) ? '' : 'disabled') + ' data-act="confirmer">Appliquer '
      +     (c.creation + c.maj) + ' changement' + plur(c.creation + c.maj) + '</button>'
      +   '<span class="compte">Les lignes en erreur et inchangées sont ignorées. Aucun produit n’est supprimé, '
      +     'et aucun produit absent du fichier n’est touché.</span>'
      + '</div>';
  }

  function vueRapport(){
    var r = RAP, refus = (r.conflits.length + r.echecs.length);
    var cartesPhoto = (r.photos || r.photosEchecs.length)
      ? '<div class="tuile"><div class="k">Photos reprises</div><div class="v">' + r.photos + '</div>'
        + (r.photosEchecs.length ? '<div class="z rouge">' + r.photosEchecs.length + ' échec' + plur(r.photosEchecs.length) + '</div>' : '') + '</div>' : '';
    var tblPhotos = r.photosEchecs.length
      ? '<div class="carte" style="margin-top:.8rem"><h2>Photos non reprises — le reste de la ligne est passé</h2>'
        + '<table><thead><tr><th style="width:52px">Ligne</th><th style="width:120px">SKU</th><th>Adresse</th><th>Motif</th></tr></thead><tbody>'
        + r.photosEchecs.map(function(x){ return '<tr><td class="dt">' + x.n + '</td><td><code>' + esc(x.sku || '—') + '</code></td>'
            + '<td style="word-break:break-all"><code>' + esc(x.src) + '</code></td><td class="rouge">' + esc(x.msg) + '</td></tr>'; }).join('')
        + '</tbody></table></div>' : '';
    var noteCrees = r.crees
      ? '<div class="avis" style="margin-top:.8rem">Les ' + r.crees + ' produit' + plur(r.crees)
        + ' créés sont <strong>hors vente</strong> : ils attendent dans <strong>Inventaire</strong>. Ajoutez leurs photos, puis mettez-les en vente.</div>' : '';
    var noteHist = r.histEchecs
      ? '<div class="avis" style="margin-top:.8rem">' + r.histEchecs + ' modification' + plur(r.histEchecs)
        + ' enregistrée' + plur(r.histEchecs) + ' mais absente' + plur(r.histEchecs) + ' de l’historique du produit.</div>' : '';
    var blocNotifs = r.notifs.length
      ? '<div class="carte" style="margin-top:.8rem"><h2>🔔 Demandes « avisez-moi » satisfaites</h2>'
        + '<div class="dt" style="margin-bottom:.4rem">Des clients attendaient le retour de ces articles. Les avis ne partent pas tout seuls.</div>'
        + r.notifs.map(function(g){ return '<div class="notif"><span>' + esc(g.nom) + ' <span class="dt">— ' + g.count + ' personne' + plur(g.count) + '</span></span>'
            + '<button class="mini" data-avis="' + esc(g.pid) + '">Envoyer les avis (' + g.count + ')</button></div>'; }).join('')
        + '</div>' : '';
    var tblRefus = refus
      ? '<div class="carte" style="margin-top:.8rem"><h2>Lignes refusées — rien n’a été écrit pour celles-ci</h2>'
        + '<table><thead><tr><th style="width:52px">Ligne</th><th style="width:120px">SKU</th><th>Produit</th><th>Motif</th></tr></thead><tbody>'
        + r.conflits.map(function(c){ return '<tr><td class="dt">' + c.n + '</td><td><code>' + esc(c.sku || '—') + '</code></td><td>' + esc(c.nom || '—') + '</td>'
            + '<td class="rouge">Un collègue vient de modifier : ' + esc((c.champs || []).join(', ')) + '. Valeur actuelle : ' + esc(c.actuel || '') + '</td></tr>'; }).join('')
        + r.echecs.map(function(c){ return '<tr><td class="dt">' + c.n + '</td><td><code>' + esc(c.sku || '—') + '</code></td><td>' + esc(c.nom || '—') + '</td>'
            + '<td class="rouge">' + esc(c.msg) + '</td></tr>'; }).join('')
        + '</tbody></table></div>' : '';
    return ''
      + '<div class="tuiles">'
      +   '<div class="tuile"><div class="k">Créés</div><div class="v">' + r.crees + '</div></div>'
      +   '<div class="tuile"><div class="k">Modifiés</div><div class="v">' + r.majs + '</div></div>'
      +   cartesPhoto
      +   '<div class="tuile' + (refus ? ' err' : '') + '"><div class="k">Refusés</div><div class="v">' + refus + '</div></div>'
      + '</div>'
      + tblPhotos + noteCrees + noteHist + blocNotifs + tblRefus
      + '<div class="barre">'
      +   '<button class="prim" data-act="reinit">Importer un autre fichier</button>'
      +   '<button class="ghost" data-act="rapport">⬇ Télécharger le rapport</button>'
      + '</div>';
  }

  /* ══ SURCOUCHE DE CONFIRMATION ═══════════════════════════════════════════════
     Le dernier écran avant une écriture qui touche des centaines de fiches. */
  function vueConfirmer(){
    if (!IMP) return '';
    var c = IMP.compte, inv = IMP.feuille === 'inventaire', parts = [];
    if (c.creation) parts.push('<li><strong>' + c.creation + '</strong> produit' + plur(c.creation) + ' <strong>créé' + plur(c.creation) + '</strong> — hors vente, à relire et publier ensuite</li>');
    if (c.maj) parts.push('<li><strong>' + c.maj + '</strong> ' + (inv ? 'variante' + plur(c.maj) : 'fiche' + plur(c.maj)) + ' <strong>modifiée' + plur(c.maj) + '</strong></li>');
    if (IMP.nbPhotos) parts.push('<li><strong>' + IMP.nbPhotos + '</strong> photo' + plur(IMP.nbPhotos) + ' <strong>téléchargée' + plur(IMP.nbPhotos) + '</strong> depuis des sites externes et copiée' + plur(IMP.nbPhotos) + ' dans votre stockage</li>');
    if (c.inchange) parts.push('<li>' + c.inchange + ' ligne' + plur(c.inchange) + ' identique' + plur(c.inchange) + ' : rien ne sera écrit</li>');
    if (c.erreur) parts.push('<li>' + c.erreur + ' ligne' + plur(c.erreur) + ' en erreur : <strong>ignorée' + plur(c.erreur) + '</strong></li>');
    return '<div class="voile" id="conf-voile"><div class="boite">'
      + '<h3>Appliquer l’import</h3>'
      + '<p style="margin:0 0 .6rem;font-size:.86rem">Fichier <strong>' + esc(IMP.fichier) + '</strong> — feuille ' + esc(IMP.feuille) + '.</p>'
      + '<ul>' + parts.join('') + '</ul>'
      + '<div class="gare">Aucun produit absent du fichier n’est touché, et rien n’est supprimé. Une fiche '
      +   'qu’un collègue est en train de modifier sera refusée et listée à la fin.</div>'
      + '<div class="pied-boite">'
      +   '<button class="gauche" data-conf="annuler">Annuler</button>'
      +   '<button class="prim" data-conf="appliquer">Appliquer</button>'
      + '</div>'
      + '</div></div>';
  }

  /* ══ DESSIN ══════════════════════════════════════════════════════════════════ */
  function dessiner(){
    dessinerOnglets();
    var total = ETAT ? ((ETAT.nbProduits || 0)) : 0;
    sous.textContent = PEUT.edit ? '' : (PEUT.vue ? 'Lecture seule' : '');

    if (BUSY) {
      ongletsEl.innerHTML = '';
      corps.innerHTML = '<div class="avancement"><div style="font-size:.9rem">Import en cours — ne fermez pas cette fenêtre.</div>'
        + '<div class="tourne"></div></div>';
      return;
    }
    var h;
    if (TAB === 'import') {
      if (RAP) h = vueRapport();
      else if (IMP) h = vueApercu();
      else h = vueImportDepart();
    } else {
      h = vueExport();
    }
    if (CONFIRM) h += vueConfirmer();
    corps.innerHTML = h;
    brancherFichier();
  }
  /* ⚠ L input file se rebranche a chaque dessin (innerHTML le recree). */
  function brancherFichier(){
    var f = document.getElementById('fichier');
    if (f) f.onchange = function(){ if (f.files && f.files[0]) onFichier(f.files[0]); };
  }

  /* ══ ACTIONS ═════════════════════════════════════════════════════════════════ */
  function exporter(){
    dire('Préparation du fichier…');
    appeler('catalogio:exporter', optsExport()).then(function(r){
      if (r && r.ok) dire('Fichier téléchargé dans la fenêtre principale.', 'bon');
      else dire(expliquer(r), 'err');
    });
  }
  function modele(){
    dire('Préparation du modèle…');
    appeler('catalogio:modele', optsExport()).then(function(r){
      if (r && r.ok) dire('Modèle vide téléchargé dans la fenêtre principale.', 'bon');
      else dire(expliquer(r), 'err');
    });
  }
  function onFichier(f){
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { dire('Fichier trop volumineux (8 Mo maximum).', 'err'); return; }
    var nom = f.name;
    var fr = new FileReader();
    fr.onerror = function(){ dire('Lecture du fichier impossible.', 'err'); };
    fr.onload = function(){
      var texte;
      try { texte = decoder(fr.result); }
      catch(e){ dire('Fichier illisible.', 'err'); return; }
      analyser(texte, nom);
    };
    fr.readAsArrayBuffer(f);
  }
  function analyser(texte, nom){
    dire('Analyse du fichier…');
    appeler('catalogio:analyser', { text:texte, nom:nom }).then(function(r){
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
      IMP = r.imp; if (r.peut) PEUT = r.peut;
      RAP = null; FILTRE = 'tous'; PAGE = 0; LIGNES = null;
      chargerLignes().then(function(){ dire('Aperçu prêt. Rien n’est encore écrit.', 'bon'); });
    });
  }
  function ouvrirConfirmer(){
    if (!IMP) return;
    if (!(IMP.compte.creation + IMP.compte.maj)) { dire('Rien à appliquer.', 'att'); return; }
    CONFIRM = true; dessiner();
  }
  function appliquer(){
    if (BUSY) return;
    CONFIRM = false; BUSY = true; dessiner();
    dire('Application en cours, ne fermez pas cette fenêtre…');
    appeler('catalogio:appliquer', {}).then(function(r){
      BUSY = false;
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); dessiner(); return; }
      RAP = r.rapport; IMP = null; LIGNES = null;
      dessiner();
      var tot = (RAP.crees || 0) + (RAP.majs || 0);
      var refus = (RAP.conflits.length + RAP.echecs.length);
      dire(tot + ' fiche' + plur(tot) + ' enregistrée' + plur(tot) + (refus ? ', ' + refus + ' refusée' + plur(refus) : '') + '.', refus ? 'att' : 'bon');
    });
  }
  function reinit(){
    appeler('catalogio:reinit', {}).then(function(){
      IMP = null; RAP = null; LIGNES = null; FILTRE = 'tous'; PAGE = 0; dessiner();
    });
  }
  function telechargerRapport(){
    appeler('catalogio:rapport', { sep:SEP }).then(function(r){
      if (r && r.ok) dire('Rapport téléchargé dans la fenêtre principale.', 'bon');
      else dire(expliquer(r), 'err');
    });
  }
  function envoyerAvis(pid){
    dire('Envoi des avis…');
    appeler('catalogio:avis', pid).then(function(r){
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
      if (r.rapport) RAP = r.rapport;
      dessiner();
      dire(r.sent ? (r.sent + ' avis envoyé' + plur(r.sent) + '.') : 'Aucun avis envoyé — voir la configuration des courriels.', r.sent ? 'bon' : 'att');
    });
  }

  /* ══ ÉCOUTEURS (un seul jeu pour toute la fenêtre) ═══════════════════════════ */
  document.addEventListener('click', function(e){
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest('button'); if (!b) return;
    // Surcouche de confirmation
    if (CONFIRM) {
      if (b.getAttribute('data-conf') === 'annuler') { CONFIRM = false; dessiner(); return; }
      if (b.getAttribute('data-conf') === 'appliquer') { appliquer(); return; }
      return;
    }
    var tab = b.getAttribute('data-tab');
    if (tab) { TAB = tab; dessiner(); return; }
    var act = b.getAttribute('data-act');
    if (act === 'exporter') { exporter(); return; }
    if (act === 'modele') { modele(); return; }
    if (act === 'reinit') { reinit(); return; }
    if (act === 'rapport') { telechargerRapport(); return; }
    if (act === 'confirmer') { ouvrirConfirmer(); return; }
    var filtre = b.getAttribute('data-filtre');
    if (filtre) { FILTRE = filtre; PAGE = 0; chargerLignes(); return; }
    var page = b.getAttribute('data-page');
    if (page !== null) { PAGE = Math.max(0, parseInt(page, 10) || 0); chargerLignes(); return; }
    var avis = b.getAttribute('data-avis');
    if (avis) { envoyerAvis(avis); return; }
  });

  document.addEventListener('change', function(e){
    var t = e.target; if (!t || !t.getAttribute) return;
    var sh = t.getAttribute('data-sheet');
    if (sh) { SHEET = sh; chargerEtat().then(function(ok){ if (ok) dessiner(); }); return; }
    var sp = t.getAttribute('data-sep');
    if (sp) { SEP = sp; dessiner(); return; }
    var opt = t.getAttribute('data-opt');
    if (opt === 'hv') { INCL_HV = t.checked; chargerEtat().then(function(ok){ if (ok) dessiner(); }); return; }
    if (opt === 'cout') { INCL_COUT = t.checked; dessiner(); return; }
    var tl = t.getAttribute('id');
    if (tl === 'taille') { TAILLE = parseInt(t.value, 10) || 50; PAGE = 0; chargerLignes(); return; }
  });

  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    if (CONFIRM) { CONFIRM = false; dessiner(); return; }
    if (P && P.fermer) P.fermer();
  });

  /* ⚠ MODE ANCRE : la coquille le dit, la fenetre n a qu a s y plier. */
  window.szModeAncre = function(actif){
    document.documentElement.classList.toggle('ancre', !!actif);
  };

  chargerEtat().then(function(ok){
    if (!ok) return;
    ${ouvImport || ouvApercu || ouvConfirmer || ouvRapport ? "TAB = 'import';" : ''}
    if (RAP) { dessiner(); return; }
    if (IMP) { chargerLignes().then(function(){ ${ouvConfirmer ? 'ouvrirConfirmer();' : ''} }); return; }
    dessiner();
  });
})();
</script></body></html>`;
}

module.exports = { pageCatalogio };
