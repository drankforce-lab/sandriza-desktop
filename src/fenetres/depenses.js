'use strict';

/*
 * FENÊTRE « DÉPENSES D'ENTREPRISE » — NATIVE (2.5.0)
 * =============================================================================
 * Premier écran du palier 5. La saisie des dépenses déductibles : liste filtrée
 * par année, mois et catégorie fiscale, tuiles de période, fiche de détail avec
 * son reçu, formulaire de saisie DANS la fenêtre — et la lecture automatique
 * d'une facture par glisser-déposer.
 *
 * ⚠ TOUT CE QUI COÛTE RESTE AU SITE. La fenêtre lit un fichier et affiche des
 * champs ; la compression du reçu, son dépôt dans le stockage, l'écriture entrée
 * par entrée et surtout la LECTURE de la facture (clé du service d'IA, pdf.js,
 * canevas, taux de change) vivent dans expenses.js. La clé ne voyage jamais
 * jusqu'ici : ce serait la poser dans un document local.
 *
 * ⚠ RIEN N'EST ENREGISTRÉ AUTOMATIQUEMENT après une lecture de facture. Les
 * champs sont pré-remplis, la personne vérifie, puis confirme. C'est la règle de
 * l'écran web, conservée mot pour mot — une dépense inventée par un modèle et
 * enregistrée toute seule finirait dans une déclaration de revenus.
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
input,select,button,textarea{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
select,button{cursor:pointer}
input:focus,select:focus,button:focus,textarea:focus{outline:none;border-color:#c9a97e}
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
.stats .s{flex:1 1 8rem;background:rgba(255,255,255,.04);border-radius:9px;padding:.4rem .6rem}
.stats .s .n{font:700 1.05rem/1.2 Georgia,serif;color:#c9a97e}
.stats .s .l{font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}
.stats .s .sub{font-size:.66rem;color:#6d7f96}

/* La zone de depot : c est la porte la plus rapide vers une depense saisie. */
.depot{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:.25rem;border:2px dashed rgba(255,255,255,.2);
  border-radius:12px;padding:.85rem 1rem;text-align:center;color:#8fa1b8;
  cursor:pointer;transition:border-color .13s,background .13s}
.depot:hover,.depot.survol{border-color:#c9a97e;background:rgba(201,169,126,.08)}
.depot .gros{font-size:.9rem;font-weight:600;color:#e8edf5}
.depot .pt{font-size:.74rem}

table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:rgba(255,255,255,.04)}
tbody td{padding:.3rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody .num{font-weight:600;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
tbody .dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.info{background:rgba(59,130,246,.18);color:#93c5fd}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:#8fa1b8}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.aide{font-size:.75rem;color:#8fa1b8;line-height:1.45}
.avis{background:rgba(180,120,10,.1);border:1px solid rgba(180,120,10,.4);color:#fbbf24;
  border-radius:9px;padding:.45rem .65rem;font-size:.79rem;line-height:1.5}

.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:44rem;width:100%;max-height:90vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .5rem;font:700 .98rem/1.3 Georgia,serif;display:flex;
  align-items:center;gap:.5rem;flex-wrap:wrap}
.boite .grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem;
  padding:.55rem 0;border-top:1px solid rgba(255,255,255,.08);
  border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:.6rem}
.boite .grille .l{font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}
.boite .grille .v{font-size:.86rem;font-weight:600;overflow-wrap:anywhere}
.boite .texte{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.88rem;line-height:1.5;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:9px;
  padding:.5rem .7rem}
.boite .pied-boite{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.75rem;justify-content:flex-end}
.gros-montant{font:800 1.7rem/1 Georgia,serif;text-align:center;padding:.3rem 0 .1rem}
.rang{display:flex;justify-content:space-between;gap:1rem;padding:.28rem 0;
  border-bottom:1px solid rgba(255,255,255,.06);font-size:.86rem}
.rang.total{border-bottom:none;border-top:2px solid rgba(255,255,255,.18);
  margin-top:.2rem;font-weight:700}
.recu{background:#f2f2f2;border-radius:10px;margin-top:.6rem;padding:.4rem;
  display:flex;align-items:center;justify-content:center;max-height:22rem;overflow:hidden}
.recu img{max-width:100%;max-height:21rem;object-fit:contain}

/* Le formulaire : deux colonnes, et le bloc des montants mis en evidence. */
.form{display:grid;grid-template-columns:1fr 1fr;gap:.5rem .8rem}
.form .large{grid-column:1/-1}
.champ{display:flex;flex-direction:column;gap:.2rem}
.champ label{font-size:.7rem;color:#8fa1b8}
.champ input,.champ select{width:100%}
.bloc-montants{grid-column:1/-1;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:.55rem .7rem}
.trois{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:.5rem;align-items:end}
@media (max-width:620px){.form,.trois{grid-template-columns:1fr}}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Dépenses ».
 * `ouverture` = 'nouvelle' pour ouvrir directement sur le formulaire de saisie.
 * ⚠ Ce n'est pas un ornement : le garde-fou ne simule AUCUN clic, donc sans ce
 * paramètre le FORMULAIRE — la moitié utile de cette fenêtre — ne serait jamais
 * dessiné par un jeu d'essai, et pourrait mourir en silence. Mesuré : une sonde
 * posée dans `boiteForm` n'était pas vue tant que la fenêtre s'ouvrait sur la
 * liste.
 */
function pageDepenses(ouverture) {
  const depart = (String(ouverture || '') === 'nouvelle') ? 'nouvelle' : 'liste';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Dépenses d’entreprise — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">💳</span><h1>Dépenses d’entreprise</h1>
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
  var ANNEE = 0, MOIS = 0, CAT = '';
  var PAGE = 0;
  var DETAIL = null;         // la depense ouverte (depenses:lire)
  var FORM = null;           // { id, date, categorie, paiement, description, fournisseur, montant, tps, tvq, recu }
  var SUPPR_ARME = false;
  var OCCUPE = false;
  var OUVERTURE = '${depart}';

  /* ⚠ MÊME PLAFOND QUE L'ÉCRAN WEB : 8 Mo. Au-delà, le fichier traverse le pont
     pour finir refusé plus loin — autant le dire tout de suite, en le nommant. */
  var MAX_OCTETS = 8 * 1024 * 1024;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux dépenses.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    module_depenses:    'Le module des dépenses n’a pas pu être chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).',
    introuvable:        'Cette dépense n’existe plus.',
    montant:            'Le montant doit être supérieur à 0.',
    recu:               'Le reçu n’a pas pu être déposé dans le stockage — RIEN n’a été enregistré. Une dépense sans sa pièce justificative n’est pas défendable.',
    nuage:              'Le nuage a refusé l’écriture — rien n’est conservé. Reconnectez-vous et refaites la saisie.',
    total_absent:       'Saisissez d’abord le total payé (taxes incluses) dans « Montant ».',
    format:             'Format non pris en charge — image ou PDF seulement.',
    trop_lourd:         'Fichier trop volumineux (8 Mo maximum).',
    fichier_illisible:  'Ce fichier n’a pas pu être lu.',
    image_illisible:    'Cette image n’a pas pu être lue.',
    aucun_recu:         'Cette dépense n’a pas de reçu.',
    echec:              'L’opération a échoué.'
  };
  var LECTURE = {
    cle_absente: 'Reçu joint. Lecture automatique indisponible : aucune clé du service d’IA n’est enregistrée (écran Configuration → Clés API).',
    pdf:         'Reçu joint. Le PDF n’a pas pu être converti pour la lecture — saisie manuelle.',
    illisible:   'Reçu joint. La réponse du service n’était pas exploitable — saisie manuelle.',
    service:     'Reçu joint. Le service de lecture n’a pas répondu — saisie manuelle.',
    non_fiable:  'Reçu joint. La lecture a été refusée : elle ne correspondait pas au document.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail && m !== 'recu') t += ' (' + esc(String(r.detail).slice(0, 150)) + ')';
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

  /* ── LE DESSIN ─────────────────────────────────────────────────────────── */
  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var h = '';

    if (!D.peutModifier && !D.peutAjouter) {
      h += '<div class="avis">👁 Lecture seule — votre rôle permet de consulter les dépenses, pas de les saisir.</div>';
    }

    h += '<div class="barreoutils">'
      + '<select id="d-annee">' + (D.annees || []).map(function(a){
          return '<option value="' + a + '"' + (String(a) === String(D.annee) ? ' selected' : '') + '>' + a + '</option>';
        }).join('') + '</select>'
      + '<select id="d-mois"><option value="0"' + (!D.mois ? ' selected' : '') + '>Tous les mois</option>'
      + (D.moisNoms || []).map(function(m, i){
          return '<option value="' + (i + 1) + '"' + (D.mois === i + 1 ? ' selected' : '') + '>' + esc(m) + '</option>';
        }).join('') + '</select>'
      + '<select id="d-cat"><option value="">Toutes catégories</option>'
      + (D.categories || []).map(function(c){
          return '<option value="' + esc(c.cle) + '"' + (D.categorie === c.cle ? ' selected' : '') + '>'
            + esc(c.libelle) + '</option>';
        }).join('') + '</select>'
      + (D.peutAjouter ? '<button class="prim" id="d-nouvelle">＋ Nouvelle dépense</button>' : '')
      + '<span class="droite">' + D.nombre + ' dépense' + (D.nombre > 1 ? 's' : '') + '</span>'
      + '</div>';

    h += '<div class="stats">'
      + '<div class="s"><div class="n">' + esc(D.total) + '</div><div class="l">Total — ' + esc(D.periode) + '</div>'
      + '<div class="sub">hors taxes, déductible</div></div>'
      + '<div class="s"><div class="n">' + esc(D.totalTps) + '</div><div class="l">TPS payée</div>'
      + '<div class="sub">crédit sur intrants</div></div>'
      + '<div class="s"><div class="n">' + esc(D.totalTvq) + '</div><div class="l">TVQ payée</div>'
      + '<div class="sub">remboursement sur intrants</div></div>'
      + '<div class="s"><div class="n">' + D.nombre + '</div><div class="l">Dépenses</div>'
      + '<div class="sub">' + esc(D.periode) + '</div></div>'
      + '</div>';

    if (D.peutAjouter) {
      h += '<div class="depot" id="d-depot">'
        + '<div class="gros">Glissez-déposez une facture ici</div>'
        + '<div class="pt">' + (D.lectureAuto
            ? 'Elle est lue automatiquement — vous vérifiez les champs avant d’enregistrer.'
            : 'Elle sera jointe comme reçu. La lecture automatique demande une clé (écran Configuration → Clés API).')
        + '</div></div>';
    }

    h += '<div class="carte">';
    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">Aucune dépense pour ' + esc(D.periode) + '.</div>';
    } else {
      h += '<table><thead><tr><th>Date</th><th>Catégorie</th><th>Description</th>'
        + '<th>Paiement</th><th style="text-align:right">Montant</th>'
        + '<th style="text-align:right">Taxes</th><th style="text-align:center">Reçu</th></tr></thead><tbody>'
        + rows.map(function(r){
            return '<tr data-id="' + esc(r.id) + '" title="Voir le détail">'
              + '<td class="dt" style="white-space:nowrap">' + esc(r.dateFr) + '</td>'
              + '<td>' + esc(r.categorieLbl)
              + (r.ligne ? ' <span class="dt">· L.' + esc(r.ligne) + '</span>' : '') + '</td>'
              + '<td>' + esc(r.description || '—')
              + (r.fournisseur ? ' <span class="dt">· ' + esc(r.fournisseur) + '</span>' : '')
              + (r.usd ? ' <span class="pill info">USD</span>' : '') + '</td>'
              + '<td class="dt">' + esc(r.paiement) + '</td>'
              + '<td class="num">' + esc(r.montant) + '</td>'
              + '<td class="dt" style="text-align:right;white-space:nowrap">'
              + (r.aTaxes ? esc(r.tps) + ' · ' + esc(r.tvq) : '—') + '</td>'
              + '<td style="text-align:center">' + (r.recu ? '📎' : '<span class="dt">—</span>') + '</td>'
              + '</tr>';
          }).join('')
        + '</tbody></table>';
      if ((D.pages || 1) > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="d-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="d-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';

    h += '<div class="aide" style="padding:.1rem">Les <strong>frais de traitement Square</strong> '
      + 'sont déjà comptés dans l’Impôt (ligne 8710) — ne les ressaisissez pas ici. '
      + 'La <strong>fiscalité</strong> et la <strong>conciliation bancaire</strong> restent à '
      + 'l’écran Comptabilité de la fenêtre principale.</div>';

    if (FORM) h += boiteForm();
    else if (DETAIL) h += boiteDetail();

    corps.innerHTML = h;
    brancher();
  }

  function boiteDetail(){
    var e = DETAIL;
    var h = '<div class="voile" id="d-voile"><div class="boite">'
      + '<h3>' + esc(e.fournisseur || e.description || 'Dépense') + '</h3>'
      + '<div style="text-align:center"><span class="pill neutre">' + esc(e.categorieLbl)
      + (e.ligne ? ' · L.' + esc(e.ligne) : '') + '</span></div>'
      + '<div class="gros-montant">' + esc(e.totalTTC)
      + (e.usd ? ' <span class="pill info">USD→CAD</span>' : '') + '</div>'
      + '<div class="aide" style="text-align:center;margin-bottom:.5rem">Total payé'
      + (e.aTaxes ? ' (taxes incluses)' : '') + '</div>'
      + '<div class="grille">'
      + '<div><div class="l">Date</div><div class="v">' + esc(e.dateFr) + '</div></div>'
      + '<div><div class="l">Mode de paiement</div><div class="v">' + esc(e.paiementLbl) + '</div></div>'
      + '</div>'
      + '<div class="texte">' + esc(e.description || '(aucune description)') + '</div>';

    if (e.aTaxes) {
      h += '<div class="carte" style="margin-top:.6rem">'
        + '<div class="rang"><span>Montant (hors taxes)</span><strong>' + esc(e.montant) + '</strong></div>'
        + '<div class="rang"><span>TPS payée</span><strong>' + esc(e.tps) + '</strong></div>'
        + '<div class="rang"><span>TVQ payée</span><strong>' + esc(e.tvq) + '</strong></div>'
        + '<div class="rang total"><span>Total payé</span><strong>' + esc(e.totalTTC) + '</strong></div>'
        + '</div>';
    }
    if (e.usd) {
      h += '<div class="avis" style="margin-top:.6rem">Facture en dollars US — origine <strong>'
        + esc(e.origine || '—') + '</strong>'
        + (e.fxTaux ? ' × taux <strong>' + esc(e.fxTaux) + '</strong>'
            + (e.fxDate ? ' (' + esc(e.fxDate) + ')' : '')
            + (e.fxApprox ? ' approximatif' : '') : '') + '.</div>';
    }
    if (e.aRecu) {
      /* ⚠ L IMAGE S AFFICHE ICI, LE PDF S OUVRE DANS LA FENETRE PRINCIPALE : un
         PDF distant ne se rend pas dans un document local, et promettre un
         apercu qui reste blanc est pire que renvoyer ailleurs. */
      if (e.recu && !e.recuPdf) h += '<div class="recu"><img src="' + esc(e.recu) + '" alt=""></div>';
      else h += '<div class="aide" style="margin-top:.6rem">Reçu en PDF — il s’ouvre dans la fenêtre principale.</div>';
    }

    h += '<div class="pied-boite">'
      + (D.peutSupprimer ? '<button class="danger" id="d-suppr">'
          + (SUPPR_ARME ? 'Confirmer la suppression ?' : '🗑 Supprimer') + '</button>' : '')
      + (e.aRecu ? '<button id="d-recu">📎 Ouvrir le reçu</button>' : '')
      + (D.peutModifier ? '<button class="prim" id="d-modifier">✎ Modifier</button>' : '')
      + '<button id="d-fermer">Fermer</button>'
      + '</div>';
    if (SUPPR_ARME) {
      h += '<div class="aide" style="margin-top:.5rem">Elle disparaît de la comptabilité et des '
        + 'rapports d’impôt. Irréversible.</div>';
    }
    h += '</div></div>';
    return h;
  }

  function boiteForm(){
    var f = FORM;
    var neuf = (f.id === '__new__');
    var h = '<div class="voile" id="d-voile"><div class="boite">'
      + '<h3>' + (neuf ? '➕ Nouvelle dépense' : '✎ Modifier la dépense') + '</h3>';

    /* ⚠ LA ZONE DE DEPOT S EFFACE UNE FOIS LA FACTURE PRISE (demande du
       2026-08-09 : << quand on glisse une facture, plus besoin de montrer ca >>).
       Elle occupait le haut du formulaire pour proposer un geste deja fait, et
       repoussait les champs a verifier — qui sont, eux, ce qui reste a faire.
       Une ligne discrete la remplace : le fichier reste remplacable. */
    if (neuf && !f.recu) {
      h += '<div class="depot" id="d-depot-form" style="margin-bottom:.6rem">'
        + '<div class="gros">📄 Importer une facture</div>'
        + '<div class="pt">' + (D.lectureAuto
            ? 'Photo, image ou PDF — les champs sont pré-remplis, vous vérifiez avant d’enregistrer.'
            : 'Elle sera jointe comme reçu (lecture automatique indisponible sans clé).') + '</div>'
        + '</div>';
    }
    if (f.lecture) {
      h += '<div class="' + (f.lectureErr ? 'avis' : 'carte') + '" style="margin-bottom:.6rem;font-size:.79rem;line-height:1.5">'
        + esc(f.lecture) + '</div>';
    }

    h += '<div class="form">'
      + champ('Date', '<input type="date" id="f-date" value="' + esc(f.date) + '">')
      + champ('Mode de paiement', '<select id="f-pay">' + (D.paiements || []).map(function(p){
          return '<option value="' + esc(p.cle) + '"' + (f.paiement === p.cle ? ' selected' : '') + '>'
            + esc(p.libelle) + '</option>'; }).join('') + '</select>')
      + '<div class="champ large"><label>Catégorie (ligne fiscale)</label><select id="f-cat">'
      + (D.categories || []).map(function(c){
          return '<option value="' + esc(c.cle) + '"' + (f.categorie === c.cle ? ' selected' : '') + '>'
            + esc(c.libelle) + ' · L.' + esc(c.ligne) + '</option>'; }).join('')
      + '</select></div>'
      + champ('Description', '<input type="text" id="f-desc" value="' + esc(f.description)
          + '" placeholder="Ex : Publicité Meta juillet">')
      + champ('Fournisseur', '<input type="text" id="f-four" value="' + esc(f.fournisseur)
          + '" placeholder="Ex : Meta Platforms">')
      + '<div class="bloc-montants"><div class="trois">'
      + '<div class="champ"><label>Montant (hors taxes)</label>'
      + '<input type="number" step="0.01" min="0" id="f-montant" value="' + esc(f.montant) + '" placeholder="0.00"></div>'
      + '<div class="champ"><label>TPS payée</label>'
      + '<input type="number" step="0.01" min="0" id="f-tps" value="' + esc(f.tps) + '" placeholder="0.00"></div>'
      + '<div class="champ"><label>TVQ payée</label>'
      + '<input type="number" step="0.01" min="0" id="f-tvq" value="' + esc(f.tvq) + '" placeholder="0.00"></div>'
      + '<button id="f-taxes" title="Déduire TPS et TVQ d’un total payé saisi dans Montant">↧ Calc. taxes</button>'
      + '</div><div class="aide" style="margin-top:.3rem">Saisissez le <strong>total payé</strong> dans '
      + '« Montant » puis « Calc. taxes » pour en déduire la TPS et la TVQ.</div></div>'
      + '<div class="champ large"><label>Reçu (image ou PDF — facultatif)</label>'
      + '<button id="f-recu">' + (f.recu ? '✓ Reçu joint — remplacer' : '📎 Joindre un reçu') + '</button></div>'
      + '</div>';

    h += '<div class="pied-boite">'
      + '<button id="f-annuler">Annuler</button>'
      + '<button class="prim" id="f-ok"' + (OCCUPE ? ' disabled' : '') + '>'
      + (neuf ? '+ Ajouter la dépense' : '✓ Enregistrer') + '</button>'
      + '</div></div></div>';
    return h;
  }
  function champ(l, ctrl){
    return '<div class="champ"><label>' + esc(l) + '</label>' + ctrl + '</div>';
  }

  /* ── LECTURE DU FICHIER, PUIS LE SITE FAIT LE RESTE ────────────────────── */
  function lireFichier(f){
    return new Promise(function(res){
      var r = new FileReader();
      r.onload = function(){ res(String(r.result || '')); };
      r.onerror = function(){ res(''); };
      r.readAsDataURL(f);
    });
  }
  function choisirFichier(cb){
    var e = document.createElement('input');
    e.type = 'file'; e.accept = 'image/*,application/pdf';
    e.onchange = function(){ if (e.files && e.files[0]) cb(e.files[0]); };
    e.click();
  }

  function memoriserForm(){
    if (!FORM) return;
    var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    FORM.date = g('f-date'); FORM.paiement = g('f-pay'); FORM.categorie = g('f-cat');
    FORM.description = g('f-desc'); FORM.fournisseur = g('f-four');
    FORM.montant = g('f-montant'); FORM.tps = g('f-tps'); FORM.tvq = g('f-tvq');
  }

  function importerFacture(file){
    if (!file) return;
    if (file.size > MAX_OCTETS) { dire(MOTIFS.trop_lourd + ' (' + file.name + ')', 'att'); return; }
    if (OCCUPE) { dire('Une lecture est déjà en cours.', 'att'); return; }
    OCCUPE = true;
    if (!FORM) FORM = formVierge();
    else memoriserForm();
    dessiner();
    dire('Lecture de la facture… (quelques secondes)');
    lireFichier(file).then(function(data){
      if (!data) { OCCUPE = false; dire(MOTIFS.fichier_illisible, 'err'); dessiner(); return; }
      appeler('depenses:facture', [file.name, data]).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        FORM.recu = !!r.recu;
        if (r.lu && r.champs) {
          var c = r.champs;
          /* ⚠ ON NE REMPLACE QUE CE QUI A ÉTÉ TROUVÉ : écraser un champ déjà
             saisi par un null effacerait le travail de la personne. */
          if (c.date) FORM.date = c.date;
          if (c.fournisseur) FORM.fournisseur = c.fournisseur;
          if (c.description) FORM.description = c.description;
          if (c.categorie) FORM.categorie = c.categorie;
          if (c.montant != null) FORM.montant = c.montant.toFixed(2);
          if (c.tps != null) FORM.tps = c.tps.toFixed(2);
          if (c.tvq != null) FORM.tvq = c.tvq.toFixed(2);
          var complet = (parseFloat(FORM.montant) || 0) > 0 && FORM.date
            && (FORM.description || FORM.fournisseur);
          /* ⚠ ON DIT SI LA LECTURE A ÉTÉ RECOUPÉE AVEC LE DOCUMENT. Sur une photo
             ou un PDF numérisé il n y a aucun texte a comparer : la personne est
             alors la seule verification, et elle doit le savoir. */
          /* ⚠ ON DIT D'OÙ VIENT CHAQUE CHOSE. « Lu dans le document » et
             « proposé par la lecture automatique » n'engagent pas la même
             confiance, et la personne doit pouvoir régler son attention en
             conséquence : ce qui vient du document ne se vérifie qu'au coup
             d'oeil, ce qui vient du modèle se relit. */
          FORM.lectureErr = !r.verifie;
          var dd = (r.depuisDocument || []);
          FORM.lecture = (r.verifie
              ? ('✓ Lu directement dans le document : ' + esc(dd.join(', ') || 'les montants') + '.')
              : '⚠ Aucun texte à lire dans ce document (photo ou numérisation) : tout vient de la lecture automatique. Vérifiez CHAQUE champ.')
            + (r.modeleEcarte
                ? ' La lecture automatique a été écartée (elle ne correspondait pas au document) — complétez la description et la catégorie.'
                : '')
            + (r.preuve && !r.verifie ? ' Lu : « ' + esc(r.preuve) + ' »' : '')
            + (r.devise === 'USD' && r.fxTaux
                ? ' Montants convertis depuis le dollar US au taux ' + esc(r.fxTaux)
                  + (r.fxDate ? ' du ' + esc(r.fxDate) : '') + (r.fxApprox ? ' (approximatif)' : '') + '.'
                : '');
          dire(complet
            ? 'Facture lue — vérifiez les informations, puis enregistrez.'
            : 'Facture lue — complétez ce qui manque, puis enregistrez.',
            complet ? 'bon' : 'att');
        } else {
          /* ⚠ REFUS DE LECTURE : les champs restent VIDES, et l on dit pourquoi.
             Un champ faux est pire qu un champ vide — il finit dans une
             declaration de revenus, alors qu un champ vide se remarque. */
          FORM.lectureErr = true;
          FORM.lecture = (r.motifLecture === 'non_fiable')
            ? ('⛔ Lecture REFUSÉE : ce qui a été proposé ne correspond pas au document ('
               + esc((r.ecarts || []).join(' ; ') || 'écart détecté')
               + '), et le document lui-même n’a pas pu être lu (photo ou numérisation). '
               + 'Rien n’a été rempli — saisissez à la main. Le reçu, lui, est joint.')
            : (LECTURE[r.motifLecture] || 'Reçu joint — saisie manuelle.');
          dire(r.motifLecture === 'non_fiable'
            ? 'Lecture refusée — elle ne correspondait pas au document.'
            : 'Reçu joint — saisie manuelle.', 'att');
        }
        dessiner();
      });
    });
  }

  function formVierge(){
    var auj = new Date().toISOString().slice(0, 10);
    var cat = ((D.categories || [])[0] || {}).cle || 'autre';
    var pay = ((D.paiements || [])[0] || {}).cle || 'card';
    return { id: '__new__', date: auj, categorie: cat, paiement: pay,
      description: '', fournisseur: '', montant: '', tps: '', tvq: '', recu: false,
      lecture: '', lectureErr: false };
  }

  function enregistrer(){
    if (OCCUPE) return;
    memoriserForm();
    OCCUPE = true;
    dessiner();
    dire('Enregistrement…');
    appeler('depenses:enregistrer', [{
      id: FORM.id, date: FORM.date, categorie: FORM.categorie, paiement: FORM.paiement,
      description: FORM.description, fournisseur: FORM.fournisseur,
      montant: FORM.montant, tps: FORM.tps, tvq: FORM.tvq,
    }]).then(function(r){
      OCCUPE = false;
      if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
      dire('Dépense enregistrée — ' + r.montant + ' · ' + r.categorie + '.', 'bon');
      var etaitNeuve = (FORM.id === '__new__');
      FORM = null; DETAIL = null;
      /* Enchaîner : après un AJOUT on rouvre un formulaire vierge, comme
         l'écran web le propose — on saisit rarement une seule facture. */
      charger().then(function(){
        if (etaitNeuve && D && D.peutAjouter) { FORM = formVierge(); dessiner(); }
      });
    });
  }

  /* ── BRANCHEMENTS ──────────────────────────────────────────────────────── */
  function brancher(){
    var lie = function(id, fn){ var e = document.getElementById(id); if (e) e.onchange = fn; };
    lie('d-annee', function(){ ANNEE = parseInt(this.value, 10) || 0; PAGE = 0; charger(); });
    lie('d-mois', function(){ MOIS = parseInt(this.value, 10) || 0; PAGE = 0; charger(); });
    lie('d-cat', function(){ CAT = this.value; PAGE = 0; charger(); });
    var bp = document.getElementById('d-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, (D.page || 0) - 1); charger(); };
    var bs = document.getElementById('d-suiv');
    if (bs) bs.onclick = function(){ PAGE = (D.page || 0) + 1; charger(); };
    var nv = document.getElementById('d-nouvelle');
    if (nv) nv.onclick = function(){ DETAIL = null; FORM = formVierge(); dessiner(); };

    var dep = document.getElementById('d-depot');
    if (dep) dep.onclick = function(){ choisirFichier(importerFacture); };
    var depF = document.getElementById('d-depot-form');
    if (depF) depF.onclick = function(){ choisirFichier(importerFacture); };

    // ── Fiche de détail
    var f = document.getElementById('d-fermer');
    if (f) f.onclick = fermer;
    var mo = document.getElementById('d-modifier');
    if (mo) mo.onclick = function(){
      FORM = { id: DETAIL.id, date: DETAIL.date, categorie: DETAIL.categorie,
        paiement: DETAIL.paiement, description: DETAIL.description, fournisseur: DETAIL.fournisseur,
        montant: DETAIL.montantN ? String(DETAIL.montantN) : '',
        tps: DETAIL.tpsN ? String(DETAIL.tpsN) : '', tvq: DETAIL.tvqN ? String(DETAIL.tvqN) : '',
        recu: DETAIL.aRecu };
      dessiner();
    };
    var rc = document.getElementById('d-recu');
    if (rc) rc.onclick = function(){
      dire('Ouverture du reçu…');
      appeler('depenses:recuOuvrir', [DETAIL.id]).then(function(r){
        dire(r.ok ? 'Reçu ouvert dans la fenêtre principale.' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
    var su = document.getElementById('d-suppr');
    if (su) su.onclick = function(){
      if (!SUPPR_ARME) {
        SUPPR_ARME = true; dessiner();
        setTimeout(function(){ if (SUPPR_ARME) { SUPPR_ARME = false; if (DETAIL) dessiner(); } }, 5000);
        return;
      }
      SUPPR_ARME = false;
      dire('Suppression…');
      appeler('depenses:supprimer', [DETAIL.id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Dépense supprimée (' + r.montant + ' · ' + r.categorie + ').', 'bon');
        DETAIL = null;
        charger();
      });
    };

    // ── Formulaire
    var an = document.getElementById('f-annuler');
    if (an) an.onclick = function(){ FORM = null; dire(''); dessiner(); };
    var ok = document.getElementById('f-ok');
    if (ok) ok.onclick = enregistrer;
    var tx = document.getElementById('f-taxes');
    if (tx) tx.onclick = function(){
      memoriserForm();
      appeler('depenses:taxes', [FORM.montant]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'att'); return; }
        FORM.montant = r.montant.toFixed(2);
        FORM.tps = r.tps.toFixed(2);
        FORM.tvq = r.tvq.toFixed(2);
        dessiner();
        dire('Taxes déduites du total payé.', 'bon');
      });
    };
    var rj = document.getElementById('f-recu');
    if (rj) rj.onclick = function(){
      choisirFichier(function(file){
        if (file.size > MAX_OCTETS) { dire(MOTIFS.trop_lourd, 'att'); return; }
        memoriserForm();
        dire('Préparation du reçu…');
        lireFichier(file).then(function(data){
          if (!data) { dire(MOTIFS.fichier_illisible, 'err'); return; }
          appeler('depenses:recu', [file.name, data]).then(function(r){
            if (!r.ok) { dire(expliquer(r), 'err'); return; }
            FORM.recu = true;
            dessiner();
            dire('Reçu joint — il partira dans le stockage à l’enregistrement.', 'bon');
          });
        });
      });
    };
  }

  function fermer(){ DETAIL = null; SUPPR_ARME = false; dessiner(); }

  /* ⚠ La garde du gestionnaire général : un clic sur une commande est traité par
     SA commande, jamais ici — sinon le clic qui arme un bouton le désarme. */
  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('.boite')) return;
    if (t.closest('#d-voile')) { if (FORM) { FORM = null; dessiner(); } else fermer(); return; }
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-id]');
    if (tr) ouvrirDetail(tr.getAttribute('data-id'));
  };

  function ouvrirDetail(id){
    dire('Lecture…');
    appeler('depenses:lire', [id]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('');
      DETAIL = r; SUPPR_ARME = false; FORM = null;
      dessiner();
    });
  }

  /* ── GLISSER-DEPOSER ──────────────────────────────────────────────────────
     ⚠ SUR LE DOCUMENT, ET preventDefault DANS LES DEUX : sans cela, un fichier
     lache sur la fenetre la fait NAVIGUER vers ce fichier — la fenetre native
     disparait, remplacee par le PDF. */
  document.addEventListener('dragover', function(ev){
    ev.preventDefault();
    var z = document.getElementById('d-depot-form') || document.getElementById('d-depot');
    if (z) z.classList.add('survol');
  });
  document.addEventListener('dragleave', function(ev){
    if (ev.relatedTarget) return;
    ['d-depot', 'd-depot-form'].forEach(function(id){
      var z = document.getElementById(id); if (z) z.classList.remove('survol');
    });
  });
  document.addEventListener('drop', function(ev){
    ev.preventDefault();
    ['d-depot', 'd-depot-form'].forEach(function(id){
      var z = document.getElementById(id); if (z) z.classList.remove('survol');
    });
    if (!D || !D.peutAjouter) { dire(MOTIFS.droit, 'att'); return; }
    var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
    if (f) importerFacture(f);
  });

  /* ── CHARGEMENT ────────────────────────────────────────────────────────── */
  var enCours = false, RELANCE = false;
  function charger(){
    if (enCours) { RELANCE = true; return Promise.resolve(); }
    enCours = true;
    return appeler('depenses:donnees', [{ annee: ANNEE, mois: MOIS, categorie: CAT,
      page: PAGE, taille: 25 }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; return charger(); }
      if (!r || !r.ok) { vide('Dépenses indisponibles', expliquer(r)); return; }
      D = r;
      ANNEE = D.annee; MOIS = D.mois; CAT = D.categorie;
      var s = document.getElementById('sous');
      if (s) s.textContent = D.periode + ' · ' + D.total;
      if (OUVERTURE === 'nouvelle' && D.peutAjouter && !FORM) { OUVERTURE = 'liste'; FORM = formVierge(); }
      dessiner();
    });
  }

  /* ⚠ JAMAIS PENDANT UNE SAISIE : le formulaire perdrait ce qui y est écrit. */
  window.szActualiser = function(){ if (!OCCUPE && !FORM && !DETAIL) charger(); };
  window.szRevenir = function(){ if (!OCCUPE && !FORM && !DETAIL) charger(); };

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
      /* ⚠ On ne ferme pas la fenetre sous une saisie en cours : le formulaire
         se ferme d abord, et la personne voit ce qu elle perd. */
      if (FORM) { FORM = null; dessiner(); return; }
      if (DETAIL) { fermer(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageDepenses };
