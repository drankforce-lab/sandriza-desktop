'use strict';

/*
 * FENÊTRE « PHOTOS » — NATIVE (2.3.0)
 * =============================================================================
 * La médiathèque : importer, isoler le vêtement, choisir un fond, attacher la
 * photo à un article. C'est un écran d'IMPORT, pas de consultation — ce qui
 * entre par ici finit dans le stockage et parfois sur une fiche produit.
 *
 * ⚠ CE QUE CETTE FENÊTRE NE FAIT PAS, ET C'EST VOULU. Elle ne compresse pas,
 * ne dépose rien dans le stockage, ne numérote pas, n'écrit aucune fiche. Elle
 * lit un fichier, l'envoie au site, et affiche le verdict. Toute la règle vit
 * dans photos.js (cœurs sans DOM) : une seconde compression écrite ici aurait
 * fini par produire un autre format que celui de la boutique.
 *
 * ⚠ LES IMAGES NE VOYAGENT QUE DANS UN SENS. Vers le site : le fichier importé,
 * et le fond déposé à la main. Vers la fenêtre : des ADRESSES seulement — des
 * vignettes en base64 feraient passer plusieurs mégaoctets par le pont à chaque
 * rafraîchissement. Une photo dont le dépôt a échoué n'a donc pas d'aperçu, et
 * la fenêtre le DIT plutôt que de montrer un cadre vide.
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
input[type=search],select,button,textarea{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
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

/* Zone de depot : elle doit se voir SANS chercher — c est la porte principale. */
.depot{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:.3rem;border:2px dashed rgba(255,255,255,.2);
  border-radius:12px;padding:1.15rem 1rem;text-align:center;color:#8fa1b8;
  cursor:pointer;transition:border-color .13s,background .13s}
.depot:hover{border-color:#c9a97e}
.depot.survol{border-color:#c9a97e;background:rgba(201,169,126,.08)}
.depot .gros{font-size:.95rem;font-weight:600;color:#e8edf5}
.depot .pt{font-size:.76rem}

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
tbody .num{font-weight:700;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
tbody .dt{font-size:.72rem;color:#8fa1b8}
.vign{width:44px;height:44px;border-radius:7px;overflow:hidden;display:flex;
  align-items:center;justify-content:center;
  background:conic-gradient(#3a4354 25%,#2b3444 0 50%,#3a4354 0 75%,#2b3444 0) 0 0/12px 12px}
.vign img{max-width:100%;max-height:100%;object-fit:contain}
.vign .att{font-size:.6rem;color:#fbbf24;text-align:center;line-height:1.1}
.gain{font-size:.68rem;color:#4ade80;font-weight:700}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.err{background:rgba(239,68,68,.14);color:#f87171}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:#8fa1b8}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}

.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:44rem;width:100%;max-height:88vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .5rem;font:700 .98rem/1.3 Georgia,serif;display:flex;
  align-items:center;gap:.5rem;flex-wrap:wrap}
.boite .apercu{background:conic-gradient(#3a4354 25%,#2b3444 0 50%,#3a4354 0 75%,#2b3444 0) 0 0/14px 14px;
  border-radius:10px;min-height:14rem;max-height:24rem;display:flex;align-items:center;
  justify-content:center;margin-bottom:.7rem;overflow:hidden}
.boite .apercu img{max-width:100%;max-height:24rem;object-fit:contain}
.boite .grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.5rem;
  padding:.55rem 0;border-top:1px solid rgba(255,255,255,.08);
  border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:.6rem}
.boite .grille .l{font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}
.boite .grille .v{font-size:.84rem;font-weight:600;overflow-wrap:anywhere}
.jetons{display:flex;flex-wrap:wrap;gap:.3rem;margin:.15rem 0 .6rem}
.jetons button{font-size:.75rem;padding:.16rem .5rem}
.jetons button.on{border-color:#c9a97e;background:rgba(201,169,126,.16)}
.boite .pied-boite{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.75rem;justify-content:flex-end}
.choix{max-height:17rem;overflow:auto;margin-top:.5rem;display:flex;
  flex-direction:column;gap:.28rem}
.choix .p{display:flex;align-items:center;gap:.55rem;padding:.3rem .4rem;
  border:1px solid rgba(255,255,255,.09);border-radius:8px;cursor:pointer}
.choix .p:hover{border-color:#c9a97e;background:rgba(255,255,255,.04)}
.choix .p img{width:34px;height:34px;object-fit:cover;border-radius:6px;flex:0 0 auto}
.choix .p .creux{width:34px;height:34px;border-radius:6px;flex:0 0 auto;
  background:rgba(255,255,255,.06)}
.choix .p .nm{font-size:.84rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.choix .p .sk{font-size:.7rem;color:#8fa1b8}
.aide{font-size:.75rem;color:#8fa1b8;line-height:1.45}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Photos ». */
function pagePhotos() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Photos — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🖼️</span><h1>Photos</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;
  var Q = '';
  var TRI = 'recent';
  var PAGE = 0;
  var DETAIL = null;        // la ligne ouverte
  var ATTACHE = false;      // le selecteur d article est deploye
  var PRODUITS = null;      // sa derniere reponse
  var PQ = '';
  var SUPPR_ARME = false;
  var VIDER_ARME = false;
  var OCCUPE = false;       // un travail long est en cours : on desarme les gestes

  /* ⚠ UN PLAFOND PAR FICHIER, ET IL EST DIT. L image traverse le pont en clair :
     une photo de 40 Mo bloquerait le canal plusieurs dizaines de secondes pour
     finir en delai. Refuser en NOMMANT le fichier vaut mieux qu un ecran fige. */
  var MAX_OCTETS = 25 * 1024 * 1024;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la photothèque.',
    droit_produit:      'Attacher une photo modifie une fiche produit — votre rôle ne le permet pas.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps. Une photo très lourde peut en être la cause.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    module_photos:      'La photothèque n’a pas pu être chargée dans la fenêtre principale. Rechargez-la (Ctrl+R) ; si le message revient, la session du personnel a peut-être expiré.',
    introuvable:        'Cette photo n’existe plus.',
    produit_introuvable:'Cet article n’existe plus.',
    image_absente:      'Aucune image lisible dans ce fichier.',
    non_isolee:         'Isolez d’abord le vêtement : un fond se pose derrière un détourage.',
    isolation:          'L’isolation a échoué.',
    fond:               'Le fond n’a pas pu être appliqué.',
    attache:            'L’attache a échoué — rien n’a été écrit sur la fiche.',
    import:             'L’import a échoué.',
    nuage:              'Écriture dans le nuage refusée — rien n’a été retiré.',
    usb_hors_app:       'La détection de clé USB n’existe que dans l’application de bureau.',
    export_hors_app:    'L’enregistrement de fichier n’existe que dans l’application de bureau.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 140)) + ')';
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
  function poids(n){
    if (!n) return '—';
    if (n < 1024) return n + ' o';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' Ko';
    return (n / 1048576).toFixed(2) + ' Mo';
  }

  /* ── LE DESSIN ─────────────────────────────────────────────────────────── */
  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var ro = !D.peutModifier;
    var h = '';

    if (ro) {
      h += '<div class="carte" style="border-color:rgba(180,120,10,.4)">'
        + '<span class="pill att">👁 Lecture seule</span> '
        + '<span class="aide">Votre rôle permet de consulter la photothèque, pas de la modifier.</span></div>';
    }

    h += '<div class="barreoutils">'
      + '<button class="prim" id="p-choisir"' + (ro ? ' disabled' : '') + '>＋ Importer des photos</button>'
      + (D.bureau ? '<button id="p-usb"' + (ro ? ' disabled' : '') + '>🔌 Détecter une clé USB</button>' : '')
      + '<input type="search" id="p-q" placeholder="Code, nom, article…" value="' + esc(Q) + '">'
      + '<select id="p-tri">'
      + opt('recent', 'Plus récentes') + opt('code', 'Par code') + opt('name', 'Par nom')
      + opt('linked', 'Liées d’abord') + opt('size', 'Plus lourdes')
      + '</select>'
      + (D.total && !ro
          ? '<button class="danger" id="p-vider">' + (VIDER_ARME ? 'Confirmer — vider les ' + D.total + ' ?' : '🗑 Tout vider') + '</button>'
          : '')
      + '<span class="droite">' + D.trouvees + ' sur ' + D.total + '</span>'
      + '</div>';

    h += '<div class="stats">'
      + tuile(D.total, 'photos')
      + tuile(D.isolees, 'isolées')
      + tuile(D.liees, 'attachées')
      + '<div class="s"><div class="n">' + poids(D.poidsTotal) + '</div><div class="l">poids rangé</div></div>'
      + '</div>';

    if (!ro) {
      h += '<div class="depot" id="p-depot">'
        + '<div class="gros">Glissez-déposez vos photos ici</div>'
        + '<div class="pt">ou cliquez pour choisir des fichiers'
        + (D.bureau ? ' · ou « Détecter une clé USB »' : '') + '</div>'
        + '<div class="pt">Elles sont contenues, réencodées et déposées dans le stockage par la fenêtre principale.</div>'
        + '</div>';
    }

    h += '<div class="carte">';
    var rows = D.lignes || [];
    if (!rows.length) {
      /* ⚠ TROIS ETATS, PAS DEUX. Dire << Aucune photo >> pendant la
         synchronisation ferait croire que la mediatheque a ete perdue. */
      h += '<div class="vide">' + (!D.charge
        ? 'Lecture de la photothèque…'
        : (D.total ? 'Aucune photo ne correspond à cette recherche.'
                   : 'Aucune photo. Déposez-en ci-dessus.')) + '</div>';
    } else {
      h += '<table><thead><tr><th>Aperçu</th><th>Code</th><th>Nom du fichier</th>'
        + '<th>Article lié</th><th>Poids</th><th>État</th></tr></thead><tbody>'
        + rows.map(ligne).join('') + '</tbody></table>';
      if ((D.pages || 1) > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="p-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="p-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';

    if (DETAIL) h += boiteDetail();
    corps.innerHTML = h;
    brancher();
  }

  function opt(v, l){
    return '<option value="' + v + '"' + (TRI === v ? ' selected' : '') + '>' + l + '</option>';
  }
  function tuile(n, l){
    return '<div class="s"><div class="n">' + (n || 0) + '</div><div class="l">' + l + '</div></div>';
  }

  function vignette(r){
    if (r.apercu) return '<div class="vign"><img src="' + esc(r.apercu) + '" alt=""></div>';
    /* Pas d aperçu = l image n a pas atteint le stockage. On le DIT : un cadre
       vide passerait pour une photo perdue. */
    return '<div class="vign"><span class="att">non<br>rangée</span></div>';
  }
  function etat(r){
    if (r.lieId) return '<span class="pill bon">attachée</span>';
    if (r.enAttente) return '<span class="pill err">non rangée</span>';
    if (r.isole) return '<span class="pill att">isolée</span>';
    return '<span class="pill neutre">' + esc(r.statut || 'importée') + '</span>';
  }
  function gain(r){
    var t = poids(r.poids);
    if (r.poidsSrc && r.poids && r.poids < r.poidsSrc * 0.95) {
      t += ' <span class="gain">−' + Math.round((1 - r.poids / r.poidsSrc) * 100) + ' %</span>';
    }
    return t;
  }
  function ligne(r){
    return '<tr data-id="' + esc(r.id) + '" title="Ouvrir la photo">'
      + '<td style="width:52px">' + vignette(r) + '</td>'
      + '<td><span class="num">' + esc(r.code) + '</span></td>'
      + '<td><div class="dt" style="max-width:16rem;overflow:hidden;text-overflow:ellipsis;'
      + 'white-space:nowrap;color:inherit;font-size:.84rem">' + esc(r.nom) + '</div></td>'
      + '<td>' + (r.lieId
          ? esc(r.lieNom) + (r.lieSku ? ' <span class="dt">· ' + esc(r.lieSku) + '</span>' : '')
          : '<span class="dt">—</span>') + '</td>'
      + '<td style="white-space:nowrap">' + gain(r) + '</td>'
      + '<td>' + etat(r) + '</td></tr>';
  }

  /* ── LE PANNEAU DE DETAIL ──────────────────────────────────────────────── */
  function boiteDetail(){
    var r = DETAIL;
    var ro = !D.peutModifier;
    var h = '<div class="voile" id="p-voile"><div class="boite">'
      + '<h3><span class="num">' + esc(r.code) + '</span> ' + esc(r.nom) + ' ' + etat(r) + '</h3>'
      + '<div class="apercu">'
      + (r.apercu ? '<img src="' + esc(r.apercu) + '" alt="">'
                  : '<span class="aide" style="padding:1rem;text-align:center">Cette photo n’a pas atteint le stockage.<br>'
                    + 'Elle reste ouverte dans la fenêtre principale ; réessayez l’import.</span>')
      + '</div>'
      + '<div class="grille">'
      + '<div><div class="l">Poids rangé</div><div class="v">' + gain(r) + '</div></div>'
      + (r.poidsSrc ? '<div><div class="l">Avant compression</div><div class="v">' + poids(r.poidsSrc) + '</div></div>' : '')
      + '<div><div class="l">Détourage</div><div class="v">' + (r.isole ? 'fait' : 'non fait') + '</div></div>'
      + (r.lieId ? '<div><div class="l">Article</div><div class="v">' + esc(r.lieNom)
          + (r.lieSku ? ' · ' + esc(r.lieSku) : '') + '</div></div>' : '')
      + '</div>';

    if (!ro && r.isole && (D.fonds || []).length) {
      h += '<div class="l" style="font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8">Fond</div>'
        + '<div class="jetons">'
        + '<button data-fond="__transp" class="' + (!r.fond || r.fond === '__transp' ? 'on' : '') + '">Transparent</button>'
        + D.fonds.map(function(f){
            return '<button data-fond="' + esc(f.cle) + '" class="' + (r.fond === f.cle ? 'on' : '') + '">'
              + esc(f.libelle) + '</button>';
          }).join('')
        + '<button id="p-fondperso" class="' + (r.fond === '__custom' ? 'on' : '') + '">+ Mon fond…</button>'
        + '</div>';
    }

    if (ATTACHE) {
      h += '<div class="carte" style="margin-top:.4rem">'
        + '<input type="search" id="p-pq" placeholder="Chercher un article (nom ou SKU)…" '
        + 'value="' + esc(PQ) + '" style="width:100%">'
        + '<div class="choix" id="p-choix">' + listeProduits() + '</div></div>';
    }

    h += '<div class="pied-boite">'
      + (ro ? '' : '<button class="danger" id="p-suppr">'
          + (SUPPR_ARME ? 'Confirmer le retrait ?' : '🗑 Retirer de la médiathèque') + '</button>')
      + (D.bureau ? '<button id="p-enreg">⤓ Enregistrer le fichier</button>' : '')
      + (ro || r.isole ? '' : '<button class="prim" id="p-isoler">✂ Isoler le vêtement</button>')
      + (ro ? '' : '<button class="' + (r.isole ? 'prim' : '') + '" id="p-attacher">'
          + (ATTACHE ? 'Annuler l’attache' : '🔗 Attacher à un article') + '</button>')
      + '<button id="p-fermer">Fermer</button>'
      + '</div>';

    if (SUPPR_ARME) {
      h += '<div class="aide" style="margin-top:.5rem">'
        + (r.lieId
            ? 'Cette photo est attachée à <strong>' + esc(r.lieNom) + '</strong>. La fiche de l’article '
              + 'garde son image : elle en possède sa propre copie. Seule l’entrée de la médiathèque disparaît.'
            : 'Le fichier devenu inutile est effacé du stockage par le ménage automatique, après sept jours.')
        + '</div>';
    }

    h += '</div></div>';
    return h;
  }

  function listeProduits(){
    if (!PRODUITS) return '<div class="aide" style="padding:.4rem">Lecture du catalogue…</div>';
    if (!PRODUITS.length) return '<div class="aide" style="padding:.4rem">Aucun article ne correspond.</div>';
    return PRODUITS.map(function(p){
      return '<div class="p" data-pid="' + esc(p.id) + '">'
        + (p.image ? '<img src="' + esc(p.image) + '" alt="">' : '<span class="creux"></span>')
        + '<div style="min-width:0"><div class="nm">' + esc(p.nom) + '</div>'
        + '<div class="sk">' + esc(p.sku || 'sans SKU') + (p.enVente ? '' : ' · hors vente') + '</div></div></div>';
    }).join('');
  }

  /* ── IMPORT ────────────────────────────────────────────────────────────── */
  /* ⚠ UNE PHOTO A LA FOIS, ET ON DIT LAQUELLE. En parallele, dix lectures de
     fichier et dix depots simultanes encombreraient le pont et l on ne saurait
     plus laquelle a echoue. La progression est ANNONCEE : un import muet de
     sept photos passe pour un ecran fige. */
  function lireFichier(f){
    return new Promise(function(res){
      var r = new FileReader();
      r.onload = function(){ res(String(r.result || '')); };
      r.onerror = function(){ res(''); };
      r.readAsDataURL(f);
    });
  }
  function importer(fichiers){
    if (!D || !D.peutModifier) { dire(MOTIFS.droit, 'err'); return; }
    var liste = [];
    for (var i = 0; i < fichiers.length; i++) {
      if (/^image\\//.test(fichiers[i].type || '')) liste.push(fichiers[i]);
    }
    if (!liste.length) { dire('Aucune image dans ce dépôt (JPG, PNG ou WebP).', 'att'); return; }
    if (OCCUPE) { dire('Un import est déjà en cours.', 'att'); return; }
    OCCUPE = true;
    var faites = 0, refuses = [], echoues = [];
    var suite = function(k){
      if (k >= liste.length) {
        OCCUPE = false;
        var t = faites + ' photo' + (faites > 1 ? 's' : '') + ' importée' + (faites > 1 ? 's' : '');
        if (refuses.length) t += ' · ' + refuses.length + ' trop lourde' + (refuses.length > 1 ? 's' : '')
          + ' (' + esc(refuses.slice(0, 2).join(', ')) + ')';
        if (echoues.length) t += ' · ' + echoues.length + ' en échec';
        dire(t + '.', (echoues.length || refuses.length) ? 'att' : 'bon');
        charger();
        return;
      }
      var f = liste[k];
      if (f.size > MAX_OCTETS) { refuses.push(f.name); suite(k + 1); return; }
      dire('Import ' + (k + 1) + ' / ' + liste.length + ' — ' + f.name + '…');
      lireFichier(f).then(function(data){
        if (!data) { echoues.push(f.name); suite(k + 1); return; }
        appeler('photos:importer', [f.name, data, f.size]).then(function(r){
          if (r && r.ok) { faites++; if (!r.rangee) echoues.push(f.name); }
          else { echoues.push(f.name); dire(expliquer(r), 'err'); }
          suite(k + 1);
        });
      });
    };
    suite(0);
  }

  function choisirFichiers(){
    var e = document.createElement('input');
    e.type = 'file'; e.accept = 'image/*'; e.multiple = true;
    e.onchange = function(){ if (e.files && e.files.length) importer(e.files); };
    e.click();
  }

  /* ── LES GESTES ────────────────────────────────────────────────────────── */
  function rouvrir(photo){
    /* Le panneau reste ouvert sur la MEME photo apres un geste : la refermer
       obligerait a la rechercher pour poser un fond apres l avoir isolee. */
    if (photo) DETAIL = photo;
    charger();
  }

  function isoler(){
    if (OCCUPE) return;
    OCCUPE = true;
    dire('Isolation du vêtement… (quelques secondes)');
    appeler('photos:isoler', [DETAIL.id]).then(function(r){
      OCCUPE = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire(r.deja ? 'Cette photo était déjà isolée.' : 'Vêtement isolé — choisissez un fond.', 'bon');
      rouvrir(r.photo);
    });
  }

  function fond(cle, image){
    if (OCCUPE) return;
    OCCUPE = true;
    dire('Application du fond…');
    appeler('photos:fond', [DETAIL.id, cle, image || '']).then(function(r){
      OCCUPE = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Fond appliqué.', 'bon');
      rouvrir(r.photo);
    });
  }

  function chercherProduits(){
    appeler('photos:produits', [PQ]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); PRODUITS = []; }
      else PRODUITS = r.produits || [];
      var z = document.getElementById('p-choix');
      if (z) z.innerHTML = listeProduits();
    });
  }

  function attacher(pid){
    if (OCCUPE) return;
    OCCUPE = true;
    dire('Attache et téléversement…');
    appeler('photos:attacher', [DETAIL.id, pid]).then(function(r){
      OCCUPE = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Photo ' + r.code + ' attachée à ' + r.produit + '.', 'bon');
      ATTACHE = false; PRODUITS = null; PQ = '';
      rouvrir(r.photo);
    });
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

    var ch = document.getElementById('p-choisir');
    if (ch) ch.onclick = choisirFichiers;
    var dp = document.getElementById('p-depot');
    if (dp) dp.onclick = choisirFichiers;

    var usb = document.getElementById('p-usb');
    if (usb) usb.onclick = function(){
      if (OCCUPE) return;
      OCCUPE = true;
      dire('Recherche de clés USB…');
      appeler('photos:usb', []).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        if (!r.trouvees) { dire('Aucune photo trouvée sur une clé USB.', 'att'); return; }
        dire(r.importees + ' photo' + (r.importees > 1 ? 's' : '') + ' importée'
          + (r.importees > 1 ? 's' : '') + ' depuis la clé ' + (r.lecteur || 'USB') + '.', 'bon');
        charger();
      });
    };

    var vd = document.getElementById('p-vider');
    if (vd) vd.onclick = function(){
      /* ⚠ ARME EN DEUX CLICS, et le second dit COMBIEN disparaissent. */
      if (!VIDER_ARME) {
        VIDER_ARME = true; dessiner();
        setTimeout(function(){ if (VIDER_ARME) { VIDER_ARME = false; dessiner(); } }, 5000);
        return;
      }
      VIDER_ARME = false;
      if (OCCUPE) return;
      OCCUPE = true;
      dire('Retrait des entrées…');
      appeler('photos:vider', []).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.echecs
          ? (r.retirees + ' retirée(s), ' + r.echecs + ' refusée(s) par le nuage.')
          : 'Photothèque vidée — les fiches produits gardent leurs images.',
          r.echecs ? 'att' : 'bon');
        DETAIL = null;
        charger();
      });
    };

    if (!DETAIL) return;

    var f = document.getElementById('p-fermer');
    if (f) f.onclick = fermerDetail;
    var iso = document.getElementById('p-isoler');
    if (iso) iso.onclick = isoler;

    var at = document.getElementById('p-attacher');
    if (at) at.onclick = function(){
      ATTACHE = !ATTACHE;
      if (ATTACHE) { PRODUITS = null; dessiner(); chercherProduits(); }
      else { PRODUITS = null; PQ = ''; dessiner(); }
    };
    var pq = document.getElementById('p-pq');
    if (pq) pq.oninput = function(){
      PQ = pq.value;
      clearTimeout(window._ppq);
      window._ppq = setTimeout(chercherProduits, 300);
    };

    var fp = document.getElementById('p-fondperso');
    if (fp) fp.onclick = function(){
      var e = document.createElement('input');
      e.type = 'file'; e.accept = 'image/*';
      e.onchange = function(){
        var fi = e.files && e.files[0];
        if (!fi) return;
        if (fi.size > MAX_OCTETS) { dire('Ce fond est trop lourd (25 Mo maximum).', 'att'); return; }
        lireFichier(fi).then(function(data){
          if (!data) { dire('Fond illisible.', 'err'); return; }
          fond('__custom', data);
        });
      };
      e.click();
    };

    var en = document.getElementById('p-enreg');
    if (en) en.onclick = function(){
      dire('Enregistrement…');
      appeler('photos:enregistrer', [DETAIL.id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Enregistré dans le dossier des exports (' + r.fichier + ').', 'bon');
      });
    };

    var su = document.getElementById('p-suppr');
    if (su) su.onclick = function(){
      if (!SUPPR_ARME) {
        SUPPR_ARME = true; dessiner();
        setTimeout(function(){ if (SUPPR_ARME) { SUPPR_ARME = false; if (DETAIL) dessiner(); } }, 5000);
        return;
      }
      SUPPR_ARME = false;
      dire('Retrait…');
      appeler('photos:supprimer', [DETAIL.id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.code + ' retirée de la médiathèque'
          + (r.lie ? ' — la fiche de l’article garde son image.' : '.'), 'bon');
        DETAIL = null; ATTACHE = false; PRODUITS = null;
        charger();
      });
    };
  }

  function fermerDetail(){
    DETAIL = null; ATTACHE = false; PRODUITS = null; PQ = ''; SUPPR_ARME = false;
    dessiner();
  }

  /* ⚠ UN CLIC SUR UNE COMMANDE EST TRAITE PAR SA COMMANDE, jamais par ce
     gestionnaire general : sans cette garde, le clic qui vient d ARMER un bouton
     remonte jusqu ici et le desarme dans la meme foulee (le piege de 1.72.0). */
  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var jf = t.closest('[data-fond]');
    if (jf) { fond(jf.getAttribute('data-fond'), ''); return; }
    var pp = t.closest('[data-pid]');
    if (pp) { attacher(pp.getAttribute('data-pid')); return; }
    if (t.closest('.boite')) return;
    if (t.closest('#p-voile')) { fermerDetail(); return; }
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-id]');
    if (tr) {
      var id = tr.getAttribute('data-id');
      var r = (D.lignes || []).filter(function(x){ return x.id === id; })[0];
      if (r) { DETAIL = r; SUPPR_ARME = false; ATTACHE = false; dessiner(); }
    }
  };

  /* ── GLISSER-DEPOSER ───────────────────────────────────────────────────────
     ⚠ SUR LE DOCUMENT ENTIER, ET preventDefault DANS LES DEUX. Sans cela, un
     fichier lache sur la fenetre fait NAVIGUER la page vers ce fichier : la
     fenetre native disparait, remplacee par l image. */
  document.addEventListener('dragover', function(ev){
    ev.preventDefault();
    var z = document.getElementById('p-depot');
    if (z) z.classList.add('survol');
  });
  document.addEventListener('dragleave', function(ev){
    if (ev.relatedTarget) return;
    var z = document.getElementById('p-depot');
    if (z) z.classList.remove('survol');
  });
  document.addEventListener('drop', function(ev){
    ev.preventDefault();
    var z = document.getElementById('p-depot');
    if (z) z.classList.remove('survol');
    if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files.length) {
      importer(ev.dataTransfer.files);
    }
  });

  /* ── CHARGEMENT ────────────────────────────────────────────────────────── */
  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('photos:donnees', [{ q: Q, tri: TRI, page: PAGE, taille: 24 }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('Photothèque indisponible', expliquer(r)); return; }
      D = r;
      /* La photo ouverte est RELUE dans la nouvelle liste : sans cela, le
         panneau afficherait encore l etat d avant le geste. */
      if (DETAIL) {
        var maj = (D.lignes || []).filter(function(x){ return x.id === DETAIL.id; })[0];
        if (maj) DETAIL = maj;
      }
      var s = document.getElementById('sous');
      if (s) s.textContent = D.total + ' photo' + (D.total > 1 ? 's' : '') + ' · ' + poids(D.poidsTotal);
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

  /* ⚠ ACTUALISATION POUSSEE — jamais pendant un import, pendant une saisie ni
     sous un panneau ouvert : on redessinerait sous les doigts. */
  window.szActualiser = function(){
    if (OCCUPE || DETAIL) return;
    var q = document.getElementById('p-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ if (!OCCUPE && !DETAIL) charger(); };

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
      if (DETAIL) { fermerDetail(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pagePhotos };
