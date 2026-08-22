'use strict';

/*
 * FENÊTRE « ATTRIBUTS PRODUITS » — NATIVE (3.14.0, #30)
 * =============================================================================
 * Le plus gros écran du projet : HUIT onglets — Tailles, Genres, Groupes d'âge,
 * Styles, Couleurs, Étiquettes, Catégories, Réachat.
 *
 * ⚠⚠ LA FENÊTRE NE CALCULE RIEN et n'écrit jamais dans invMeta/invCats
 * elle-même. Les cœurs sans DOM (`_invMeta*Coeur`) vivent dans admin.js, servent
 * AUSSI l'écran web, et font toute l'écriture sur la page (là où sont DB, Shop,
 * la session). La fenêtre lit `invmeta:donnees` et redessine après chaque geste.
 *
 * ⚠ UNE SUPPRESSION EST BLOQUÉE tant qu'une valeur sert encore à des produits :
 * le cœur rend { motif:'utilise', used:N }, la fenêtre l'explique (pas de modal).
 *
 * ⚠ CHOIX ASSUMÉ (onglet Couleurs) : la pipette EyeDropper et la recherche
 * couleur EN LIGNE ne sont pas reprises. Le sélecteur de couleur natif + un
 * dictionnaire FR (~150 teintes, `invmeta:colorSearch`) les remplacent.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : tout ce script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

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
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.onglets{flex:0 0 auto;display:flex;gap:.25rem;padding:.5rem 1.05rem 0;flex-wrap:wrap;
  border-bottom:1px solid rgba(255,255,255,.08)}
.onglets button{background:transparent;border:none;border-bottom:2px solid transparent;
  color:#8fa1b8;padding:.38rem .6rem;font-weight:600;font-size:.82rem;border-radius:6px 6px 0 0}
.onglets button:hover{background:rgba(255,255,255,.05);color:#e8edf5}
.onglets button.actif{color:#e8dcc6;border-bottom-color:#c9a97e}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
input,button,select{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .5rem}
button{cursor:pointer;-webkit-user-select:none;user-select:none}
input:focus,button:focus,select:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .45rem;font-size:.74rem}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600;padding:.34rem .7rem}
button.prim:hover:not(:disabled){background:#a3824f}
button.ghost{background:transparent}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
button.ic{width:28px;height:28px;padding:0;display:inline-flex;align-items:center;justify-content:center;font-size:1rem;line-height:1}
button.ic.plus{background:#8f6f42;border-color:#a3824f;color:#f7efe2}
.aide{font-size:.79rem;color:#8fa1b8;line-height:1.5;margin:0 0 .6rem}
.avis{background:rgba(148,163,184,.1);border:1px solid rgba(148,163,184,.22);
  border-radius:10px;padding:.5rem .65rem;font-size:.79rem;color:#cbd8e6;line-height:1.5}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.83rem}
thead th{text-align:left;padding:.28rem .45rem;font-size:.66rem;text-transform:uppercase;
  letter-spacing:.05em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.32rem .45rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody tr:hover td{background:rgba(255,255,255,.03)}
tr.edit td{background:rgba(201,169,126,.09)}
code{font:.77rem/1.4 Consolas,monospace;color:#cbd8e6}
.mono{font-family:Consolas,monospace}
.chips{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;width:100%;padding:.45rem .5rem;
  border:1px solid rgba(255,255,255,.16);border-radius:10px;background:rgba(255,255,255,.03);min-height:44px}
.chip{display:inline-flex;align-items:center;gap:.25rem;background:rgba(201,169,126,.14);
  border:1px solid rgba(255,255,255,.14);border-radius:7px;padding:.24rem .2rem .24rem .55rem;font-weight:600;font-size:.82rem}
.chip button{background:none;border:none;color:#8fa1b8;font-size:1.05rem;line-height:1;padding:0 3px}
.chip button:hover{color:#f87171;background:none}
.chip .lock{font-size:.7rem;opacity:.65}
.chips input{flex:1;min-width:110px;border:none;background:transparent;padding:.26rem .2rem}
.badge{display:inline-block;font-size:.7rem;font-weight:700;padding:.08rem .5rem;border-radius:99px}
.pill{display:inline-block;font-size:.64rem;font-weight:700;padding:.05rem .45rem;border-radius:99px}
.pill.used{background:rgba(99,102,241,.2);color:#c7d2fe}
.pill.no{background:rgba(148,163,184,.15);color:#8fa1b8}
.pill.auto{background:rgba(148,163,184,.18);color:#cbd5e1}
.pastille{width:20px;height:20px;border-radius:50%;display:inline-block;border:2px solid rgba(0,0,0,.2);vertical-align:middle}
.tinp{width:100%;padding:.32rem .5rem;font-size:.84rem}
.reco-sec{border:1px solid rgba(255,255,255,.09);border-radius:11px;margin-bottom:.7rem;overflow:hidden}
.reco-head{display:flex;align-items:center;gap:.5rem;padding:.5rem .7rem;cursor:pointer;background:#16202f}
.reco-head:hover{background:#1b2739}
.reco-head .caret{color:#8fa1b8}
.reco-head .titre{font-weight:700;font-size:.86rem;flex:1}
.reco-head .outils{display:flex;gap:.3rem}
.reco-body{padding:.75rem .8rem;border-top:1px solid rgba(255,255,255,.06)}
.champ label{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8;margin:0 0 .25rem}
.rangee{display:flex;gap:.7rem;flex-wrap:wrap;align-items:flex-end}
.swatches{display:flex;flex-wrap:wrap;gap:.4rem}
.sw{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.4rem .3rem;border:1.5px solid rgba(255,255,255,.12);
  border-radius:8px;cursor:pointer;width:70px}
.sw:hover{border-color:#c9a97e}
.sw .pt{width:28px;height:28px;border-radius:50%;border:1px solid rgba(0,0,0,.15)}
.sw .nm{font-size:.6rem;text-align:center;line-height:1.15;word-break:break-word;max-height:2.3em;overflow:hidden}
.cc{display:flex;align-items:center;gap:.6rem;padding:.4rem .2rem;border-bottom:1px solid rgba(255,255,255,.06)}
.cc .nm{flex:1;min-width:0;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cc input{width:84px;text-align:center;text-transform:uppercase;font-family:Consolas,monospace;font-weight:700}
.alerte{background:rgba(220,38,38,.12);border:1px solid rgba(220,38,38,.35);border-radius:9px;
  padding:.5rem .65rem;font-size:.8rem;color:#fca5a5;margin-bottom:.7rem;line-height:1.5}
.cust{display:flex;align-items:center;gap:.65rem;padding:.4rem .2rem;border-bottom:1px solid rgba(255,255,255,.06)}
.cust .nm{flex:1;font-weight:600;font-size:.86rem}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;max-width:26rem;width:100%;padding:.9rem 1rem}
.boite h3{margin:0 0 .7rem;font:700 .98rem/1.3 Georgia,serif}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.85rem}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;
  border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre « Attributs produits ».
 * `ouverture` : '' (Tailles) · un id d'onglet (genres, ageGroups, styles,
 * colors, labels, categories, reachat) · 'attr-nouveau' (onglet Genres, ligne
 * d'ajout ouverte) · 'cat-nouvelle' (onglet Catégories, ligne d'ajout ouverte).
 * ⚠ Les lignes d'AJOUT ont leur id d'ouverture : le banc ne clique pas.
 */
function pageInvMeta(ouverture) {
  const ouv = String(ouverture || '');
  const ONGLETS = ['sizes', 'genres', 'ageGroups', 'styles', 'colors', 'labels', 'categories', 'reachat'];
  const tabDepart = ouv === 'attr-nouveau' ? 'genres'
    : ouv === 'cat-nouvelle' ? 'categories'
    : (ONGLETS.indexOf(ouv) >= 0 ? ouv : 'sizes');
  const ouvreAttr = (ouv === 'attr-nouveau');
  const ouvreCat = (ouv === 'cat-nouvelle');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Attributs produits — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.invmeta}</span><h1>Attributs produits</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets" id="onglets"></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');
  var ongletsEl = document.getElementById('onglets');

  var TAB = '${tabDepart}';
  var D = null;
  var ADDING = null;       // 'genres' | 'ageGroups' | 'styles' | 'labels' — ligne d ajout ouverte
  var CATEDIT = null;      // id | '__new__' — editeur de categorie
  var CFILTER = 'all';     // couleurs integrees : all | used | unused
  var CVARIANTS = null;    // variantes proposees par la recherche couleur
  var EDITCOLOR = null;    // { nom, hex } — surcouche edition couleur perso

  var LIBELLES = { sizes:'Tailles', genres:'Genres', ageGroups:'Groupes d’âge', styles:'Styles',
    colors:'Couleurs', labels:'Étiquettes', categories:'Catégories', reachat:'Réachat' };
  var ATTRLBL = { genres:'genre', ageGroups:'groupe d’âge', styles:'style' };

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function plur(n){ return n === 1 ? '' : 's'; }
  function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }

  var MOTIFS = {
    session:'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne permet pas cette modification.',
    indisponible:'L’administration n’est pas encore chargée dans la fenêtre principale.',
    incomplet:'Remplissez les champs requis.', existe:'Cet élément existe déjà.',
    integree:'C’est déjà une couleur intégrée.', hex:'Format hex invalide (ex : #FF6B6B).',
    nom:'Nom requis.', vide:'Champ vide.', slug:'Identifiant (slug) requis.',
    code:'Le code SKU doit faire au moins 2 lettres.', seuil:'Seuil invalide.',
    limite:'Limite invalide (minimum 1).', introuvable:'Élément introuvable.',
    type:'Type inconnu.', bord:'Déjà à l’extrémité.', echec:'L’opération a échoué.'
  };
  function expliquer(r){
    if (!r) return 'Aucune réponse de la fenêtre principale.';
    if (r.motif === 'utilise') return r.used + ' produit' + plur(r.used) + ' utilisent encore cette valeur — retirez-la d’abord des produits concernés.';
    if (r.motif === 'conflit') return 'Le code « ' + r.code + ' » est déjà pris par « ' + r.autre + ' ». Choisissez-en un autre.';
    if (r.detail) return String(r.detail);
    return MOTIFS[r.motif] || MOTIFS.echec;
  }

  function appeler(op, arg){
    if (!P || !P.appeler) return Promise.resolve({ ok:false, motif:'indisponible' });
    return P.appeler(op, arg).catch(function(){ return { ok:false, motif:'echec' }; });
  }

  function charger(){
    return appeler('invmeta:donnees', {}).then(function(r){
      if (!r || !r.ok) { vide('Attributs indisponibles', expliquer(r)); return false; }
      D = r; return true;
    });
  }
  function vide(titre, detail){
    ongletsEl.innerHTML = '';
    corps.innerHTML = '<div class="vide"><div style="font:700 1.3rem/1 Georgia,serif;color:#e8dcc6">'
      + esc(titre) + '</div><div style="margin-top:.35rem">' + esc(detail || '') + '</div></div>';
  }
  // Recharge puis redessine — après chaque écriture.
  function relire(){ return charger().then(function(ok){ if (ok) dessiner(); return ok; }); }

  // ══ ÉCRITURE générique : appelle l op, explique un refus, recharge sinon ══════
  function ecrire(op, arg, bon){
    return appeler(op, arg).then(function(r){
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return false; }
      return relire().then(function(){ if (bon) dire(bon(r), 'bon'); return true; });
    });
  }

  /* ══ ONGLETS ═══════════════════════════════════════════════════════════════ */
  function dessinerOnglets(){
    ongletsEl.innerHTML = ['sizes','genres','ageGroups','styles','colors','labels','categories','reachat']
      .map(function(id){ return '<button data-tab="' + id + '" class="' + (TAB === id ? 'actif' : '') + '">'
        + esc(LIBELLES[id]) + '</button>'; }).join('');
  }

  /* ══ ONGLET TAILLES ════════════════════════════════════════════════════════ */
  function vueSizes(){
    var chips = D.sizes.map(function(s){
      var lock = s.used > 0 ? '<span class="lock" title="Utilisée par ' + s.used + ' produit' + plur(s.used) + '"><span class="ic">🔒</span></span>' : '';
      var x = D.peut.edit ? '<button data-sizerm="' + esc(s.nom) + '" title="' + (s.used > 0 ? 'Utilisée — suppression bloquée' : 'Retirer') + '">×</button>' : '';
      return '<span class="chip">' + esc(s.nom) + lock + x + '</span>';
    }).join('');
    var inp = D.peut.edit ? '<input id="sz-input" placeholder="' + (D.sizes.length ? 'Ajouter une taille…' : 'Ex : 46, OS, 2XL…') + '" autocomplete="off">' : '';
    return '<p class="aide">Ces tailles s’affichent dans le formulaire d’édition des produits.</p>'
      + '<div class="chips">' + chips + inp + '</div>'
      + (D.peut.edit ? '<div class="aide" style="margin:.5rem 0 0">Tapez une taille puis <strong>Entrée</strong> ou <strong>,</strong> — ou collez-en plusieurs séparées par des virgules. <strong>Retour arrière</strong> (champ vide) retire la dernière.</div>' : '');
  }

  /* ══ ONGLETS GENRES / GROUPES D ÂGE / STYLES ═══════════════════════════════ */
  function vueAttr(type){
    var items = D[type] || [];
    var addRow = (ADDING === type) ? '<tr class="edit">'
      + '<td><input class="tinp mono" id="at-key" placeholder="clé (ex: sport-luxe)"></td>'
      + '<td><input class="tinp" id="at-fr" placeholder="Étiquette FR"></td>'
      + '<td><input class="tinp" id="at-en" placeholder="Étiquette EN"></td>'
      + '<td style="text-align:right"><button class="ic prim" data-attrsave="' + type + '">✓</button> '
      + '<button class="ic" data-attrcancel="1">×</button></td></tr>' : '';
    var rows = items.map(function(it){
      var rm = D.peut.edit ? '<button class="mini danger" data-attrrm="' + type + '|' + esc(it.key) + '" title="' + (it.used > 0 ? it.used + ' produit(s) — bloqué' : 'Supprimer') + '">Retirer</button>' : '';
      return '<tr><td><code>' + esc(it.key) + '</code>' + (it.used > 0 ? ' <span class="pill used">' + it.used + '×</span>' : '') + '</td>'
        + '<td style="font-weight:500">' + esc(it.label) + '</td>'
        + '<td style="color:#8fa1b8">' + esc(it.labelEN || '') + '</td>'
        + '<td style="text-align:right">' + rm + '</td></tr>';
    }).join('');
    var empty = (!items.length && ADDING !== type) ? '<tr><td colspan="4" class="vide">Aucun élément — cliquez sur + pour en ajouter.</td></tr>' : '';
    var plus = (D.peut.edit && ADDING !== type) ? '<button class="ic plus" data-attradd="' + type + '" title="Ajouter">＋</button>' : '';
    return '<p class="aide">Utilisés comme filtres dans la boutique et dans le formulaire produit.</p>'
      + '<div class="carte"><table><thead><tr><th>Clé interne</th><th>Étiquette FR</th><th>Étiquette EN</th>'
      + '<th style="width:90px;text-align:right">' + plus + '</th></tr></thead>'
      + '<tbody>' + addRow + empty + rows + '</tbody></table></div>';
  }

  /* ══ ONGLET ÉTIQUETTES ═════════════════════════════════════════════════════ */
  function vueLabels(){
    var items = D.labels || [];
    var addRow = (ADDING === 'labels') ? '<tr class="edit">'
      + '<td style="color:#8fa1b8;font-size:.78rem">aperçu à l’ajout</td>'
      + '<td><input class="tinp" id="lb-fr" placeholder="Nom FR (ex: Coup de cœur)"></td>'
      + '<td><input class="tinp" id="lb-en" placeholder="Nom EN"></td>'
      + '<td><input type="color" id="lb-color" value="#c0392b" style="width:44px;height:32px;padding:2px"></td>'
      + '<td style="text-align:right"><button class="ic prim" data-labelsave="1">✓</button> '
      + '<button class="ic" data-attrcancel="1">×</button></td></tr>' : '';
    var rows = items.map(function(l){
      var rm = D.peut.edit ? '<button class="mini danger" data-labelrm="' + esc(l.key) + '" title="' + (l.used > 0 ? l.used + ' produit(s) — bloqué' : 'Supprimer') + '">Retirer</button>' : '';
      return '<tr><td><span class="badge" style="background:' + esc(l.color) + ';color:' + esc(l.textColor) + '">' + esc(l.label) + '</span></td>'
        + '<td style="font-weight:500">' + esc(l.label) + (l.used > 0 ? ' <span class="pill used">' + l.used + '×</span>' : '') + '</td>'
        + '<td style="color:#8fa1b8">' + esc(l.labelEN || '') + '</td>'
        + '<td><code>' + esc(l.color) + '</code></td>'
        + '<td style="text-align:right">' + rm + '</td></tr>';
    }).join('');
    var empty = (!items.length && ADDING !== 'labels') ? '<tr><td colspan="5" class="vide">Aucune étiquette — cliquez sur + pour en ajouter.</td></tr>' : '';
    var plus = (D.peut.edit && ADDING !== 'labels') ? '<button class="ic plus" data-attradd="labels" title="Ajouter">＋</button>' : '';
    return '<p class="aide">Étiquettes personnalisées (badge coloré) affichées sur la fiche produit et dans le champ « Étiquette » de l’éditeur. Nom en français et en anglais.</p>'
      + '<div class="carte"><table><thead><tr><th>Aperçu</th><th>Nom FR</th><th>Nom EN</th><th>Couleur</th>'
      + '<th style="width:90px;text-align:right">' + plus + '</th></tr></thead>'
      + '<tbody>' + addRow + empty + rows + '</tbody></table></div>';
  }

  /* ══ ONGLET COULEURS ═══════════════════════════════════════════════════════ */
  function secAdd(){
    return '<div class="rangee">'
      + '<div class="champ"><label>Nom</label><input id="inv-color-name" placeholder="Ex: corail rosé" style="width:170px"></div>'
      + '<div class="champ"><label>Valeur hex</label><div style="display:flex;gap:.35rem;align-items:center">'
      +   '<input id="inv-color-hex" placeholder="#FF6B6B" class="mono" style="width:105px">'
      +   '<input type="color" id="inv-color-picker" value="#FF6B6B" data-syncHex="1" style="width:38px;height:34px;padding:2px"></div></div>'
      + '<div class="champ"><label>Ou chercher par nom</label><button class="ghost mini" data-act="colorsearch"><span class="ic">🔍</span> Chercher</button></div>'
      + '</div>'
      + (CVARIANTS && CVARIANTS.length ? '<div style="margin-top:.6rem"><div class="aide" style="margin:0 0 .35rem">' + CVARIANTS.length + ' variante' + plur(CVARIANTS.length) + ' — cliquez pour choisir</div><div class="swatches">'
          + CVARIANTS.map(function(v){ return '<button class="sw" data-pick="' + esc(v.nom) + '|' + esc(v.hex) + '"><span class="pt" style="background:' + esc(v.hex) + '"></span><span class="nm">' + esc(v.nom) + '</span></button>'; }).join('')
          + '</div></div>' : '')
      + '<div style="margin-top:.7rem"><button class="prim" data-act="coloradd">+ Ajouter la couleur</button></div>';
  }
  function secCodes(){
    var alerte = D.conflits.length ? '<div class="alerte">⚠ <strong>' + D.conflits.length + ' code' + plur(D.conflits.length) + ' porté' + plur(D.conflits.length) + ' par plusieurs couleurs</strong> — '
      + D.conflits.map(function(c){ return '<code>' + esc(c.code) + '</code> : ' + esc(c.noms.join(', ')); }).join(' · ')
      + '. Ces variantes partagent le même code-barres.</div>' : '';
    var bouton = D.suggestions.length ? '<div style="margin-bottom:.7rem"><button class="prim" data-act="codesassign">Attribuer des codes courts (' + D.suggestions.length + ')</button> '
      + '<span class="aide" style="display:inline">Deux caractères distincts. Les codes déjà fixés ne bougent pas.</span></div>' : '';
    var rows = D.codes.length ? D.codes.map(function(c){
      var autoTag = c.hasCode ? '' : ' <span class="pill auto">AUTO</span>';
      var ro = D.peut.edit ? '' : ' disabled';
      var save = D.peut.edit ? '<button class="mini" data-codesave="' + esc(c.nom) + '" title="Enregistrer"><span class="ic">💾</span></button>' : '';
      return '<div class="cc"><span class="pt pastille" style="background:' + esc(c.hex) + ';width:22px;height:22px"></span>'
        + '<span class="nm">' + esc(c.nom) + autoTag + '</span>'
        + '<span class="mono" style="color:#8fa1b8;font-size:.72rem">…-<strong style="color:#e8dcc6">' + esc(c.code) + '</strong></span>'
        + '<input id="cc-' + esc(c.nom) + '" value="' + esc(c.code) + '" maxlength="6"' + ro + '>'
        + save + '</div>';
    }).join('') : '<p class="aide" style="margin:0">Aucune couleur utilisée par un produit pour l’instant.</p>';
    return '<p class="aide">Le code compose le SKU de variante (ex. <code>ROB-000001-XL-RO</code>). <strong>Deux caractères</strong> suffisent à tout distinguer. En gris = code auto (non enregistré) ; saisissez-en un pour le fixer.</p>'
      + alerte + bouton + rows;
  }
  function secCustom(){
    if (!D.custom.length) return '<p class="aide" style="margin:0">Aucune couleur personnalisée. Ajoutez-en via « Ajouter une nouvelle couleur ».</p>';
    return D.custom.map(function(c){
      var use = c.used > 0 ? '<span class="pill used">' + c.used + ' produit' + plur(c.used) + '</span>' : '<span class="pill no">non utilisée</span>';
      var act = D.peut.edit ? '<button class="mini" data-coloredit="' + esc(c.nom) + '|' + esc(c.hex) + '">✏️ Modifier</button> <button class="mini danger" data-colorrm="' + esc(c.nom) + '" title="' + (c.used > 0 ? 'utilisée — bloqué' : 'Supprimer') + '">Supprimer</button>' : '';
      return '<div class="cust"><span class="pastille" style="' + (c.gradient ? 'border-radius:4px;' : '') + 'background:' + esc(c.hex) + '"></span>'
        + '<span class="nm">' + esc(c.nom) + '</span>' + use
        + '<span class="mono" style="color:#8fa1b8;font-size:.72rem">' + (c.gradient ? 'dégradé' : esc(c.hex)) + '</span>' + act + '</div>';
    }).join('');
  }
  function secBuiltin(){
    var list = D.builtin.slice();
    if (CFILTER === 'used') list = list.filter(function(c){ return c.used > 0; });
    else if (CFILTER === 'unused') list = list.filter(function(c){ return !c.used; });
    list.sort(function(a, b){ return (b.used || 0) - (a.used || 0); });
    var used = D.builtin.filter(function(c){ return c.used > 0; }).length;
    var dispo = D.builtin.length - used;
    var fbtn = function(v, txt){ return '<button class="mini ' + (CFILTER === v ? 'actif' : '') + '" data-cfilter="' + v + '">' + txt + '</button>'; };
    var sw = list.map(function(c){
      return '<button class="sw" data-pick="' + esc(c.nom) + '|' + esc(c.hex) + '" title="' + esc(c.nom) + (c.used ? ' — ' + c.used + ' produit' + plur(c.used) : ' — non utilisée') + '"' + (c.used ? '' : ' style="opacity:.55"') + '>'
        + '<span class="pt" style="background:' + esc(c.hex) + '"></span><span class="nm">' + esc(c.nom) + '</span>'
        + (c.used ? '<span class="pill used" style="font-size:.55rem">' + c.used + '×</span>' : '') + '</button>';
    }).join('');
    return '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.4rem;margin-bottom:.5rem">'
      + '<span class="aide" style="margin:0">' + used + ' utilisée' + plur(used) + ' · ' + dispo + ' disponible' + plur(dispo) + '</span>'
      + '<span>' + fbtn('all', 'Toutes') + ' ' + fbtn('used', 'Utilisées (' + used + ')') + ' ' + fbtn('unused', 'Non (' + dispo + ')') + '</span></div>'
      + '<div class="aide" style="margin:0 0 .5rem">Cliquez une couleur pour la sélectionner dans le formulaire d’ajout.</div>'
      + '<div class="swatches">' + sw + '</div>';
  }
  function vueColors(){
    var titres = { add:'Ajouter une nouvelle couleur', codes:'Codes couleur — SKU de variante',
      custom:'Couleurs personnalisées (' + D.custom.length + ')', builtin:'Couleurs intégrées (' + D.builtin.length + ')' };
    var inner = { add:secAdd, codes:secCodes, custom:secCustom, builtin:secBuiltin };
    var order = D.colOrder;
    return order.map(function(k, i){
      var collapsed = !!D.colCollapsed[k];
      return '<div class="reco-sec"><div class="reco-head" data-coltoggle="' + k + '">'
        + '<span class="caret">' + (collapsed ? '▸' : '▾') + '</span>'
        + '<span class="titre">' + esc(titres[k]) + '</span>'
        + '<span class="outils">'
        +   '<button class="mini" ' + (i === 0 ? 'disabled' : '') + ' data-colmove="' + k + '|-1" title="Monter">↑</button>'
        +   '<button class="mini" ' + (i === order.length - 1 ? 'disabled' : '') + ' data-colmove="' + k + '|1" title="Descendre">↓</button>'
        + '</span></div>'
        + (collapsed ? '' : '<div class="reco-body">' + inner[k]() + '</div>') + '</div>';
    }).join('');
  }

  /* ══ ONGLET CATÉGORIES ═════════════════════════════════════════════════════ */
  function catEditRow(cat){
    var isNew = !cat;
    return '<tr class="edit">'
      + '<td><input type="color" id="ic-color" value="' + (cat ? esc(cat.color) : '#888888') + '" style="width:38px;height:30px;padding:2px"></td>'
      + '<td><input class="tinp" id="ic-name" value="' + (cat ? esc(cat.name) : '') + '" placeholder="Nom FR"></td>'
      + '<td><input class="tinp" id="ic-nameen" value="' + (cat ? esc(cat.nameEN) : '') + '" placeholder="Nom EN"></td>'
      + '<td><input class="tinp mono" id="ic-key" value="' + (cat ? esc(cat.catKey) : '') + '" placeholder="slug"' + (isNew ? '' : ' readonly style="opacity:.55"') + '></td>'
      + '<td><input class="tinp mono" id="ic-code" value="' + (cat ? esc(cat.code) : '') + '" maxlength="6" placeholder="ROB" style="width:76px;text-transform:uppercase;font-weight:700"></td>'
      + '<td style="text-align:center"><input type="checkbox" id="ic-ai" ' + (!cat || cat.aiOn ? 'checked' : '') + ' data-excl="simple"></td>'
      + '<td style="text-align:center"><input type="checkbox" id="ic-simple" ' + (cat && cat.simpleOn ? 'checked' : '') + ' data-excl="ai"></td>'
      + '<td style="text-align:center;color:#8fa1b8">' + (isNew ? '—' : cat.used) + '</td>'
      + '<td style="text-align:right"><button class="ic prim" data-catsave="' + (cat ? esc(cat.id) : '') + '">✓</button> '
      + '<button class="ic" data-catcancel="1">×</button></td></tr>';
  }
  function vueCategories(){
    var cats = D.categories || [];
    var rows = cats.map(function(c){
      if (CATEDIT === c.id) return catEditRow(c);
      var edit = D.peut.edit ? '<button class="mini" data-catedit="' + esc(c.id) + '">✏️</button>' : '';
      var del = D.peut.supprime ? ' <button class="mini danger" data-catdel="' + esc(c.id) + '" title="' + (c.used > 0 ? c.used + ' produit(s) — bloqué' : 'Supprimer') + '"><span class="ic">🗑</span></button>' : '';
      return '<tr><td><span class="pastille" style="background:' + esc(c.color) + '"></span></td>'
        + '<td style="font-weight:600">' + esc(c.name) + '</td>'
        + '<td style="color:#8fa1b8">' + esc(c.nameEN || '—') + '</td>'
        + '<td><code>' + esc(c.catKey) + '</code></td>'
        + '<td><span class="mono" style="font-weight:700;background:rgba(150,130,105,.18);padding:.1rem .45rem;border-radius:4px">' + esc(c.code) + '</span></td>'
        + '<td style="text-align:center">' + (c.aiOn ? '<span style="color:#c9a97e" title="Canvas auto">⚡</span>' : '<span style="color:#8fa1b8">—</span>') + '</td>'
        + '<td style="text-align:center">' + (c.simpleOn ? '<span style="color:#c9a97e">✓</span>' : '<span style="color:#8fa1b8">—</span>') + '</td>'
        + '<td style="text-align:center">' + c.used + '</td>'
        + '<td style="text-align:right">' + edit + del + '</td></tr>';
    }).join('');
    var empty = (!cats.length && CATEDIT !== '__new__') ? '<tr><td colspan="9" class="vide">Aucune catégorie — cliquez sur + pour en créer une.</td></tr>' : '';
    var plus = (D.peut.ajout && CATEDIT !== '__new__') ? '<button class="ic plus" data-catadd="1" title="Ajouter">＋</button>' : '';
    return '<p class="aide">Les codes de catégorie définissent les préfixes SKU (ex : ROB-0001). Les cases <strong>IA</strong> et <strong>Photos</strong> choisissent le mode (génération IA des couleurs ou galerie photos simple).</p>'
      + '<div class="carte" style="overflow-x:auto"><table><thead><tr>'
      + '<th>Couleur</th><th>Nom affiché</th><th>Nom EN</th><th>Slug</th><th>Code SKU</th>'
      + '<th style="text-align:center">IA</th><th style="text-align:center">Photos</th><th style="text-align:center">Produits</th>'
      + '<th style="width:90px;text-align:right">' + plus + '</th></tr></thead>'
      + '<tbody>' + (CATEDIT === '__new__' ? catEditRow(null) : '') + empty + rows + '</tbody></table></div>';
  }

  /* ══ ONGLET RÉACHAT ════════════════════════════════════════════════════════ */
  function vueReachat(){
    var r = D.reachat, ro = D.peut.edit ? '' : ' disabled';
    return '<p class="aide">Seuil appliqué aux produits qui n’ont pas le leur. Une variante entre dans la liste de réachat quand sa quantité descend <strong>à ce nombre ou en dessous</strong>.</p>'
      + '<div class="champ" style="max-width:220px"><label>Seuil général</label>'
      + '<input type="number" min="0" step="1" id="rc-low" value="' + r.lowStockDefault + '"' + ro + ' style="width:100%"></div>'
      + '<div class="avis" style="margin:.7rem 0">Le seuil se règle à trois niveaux, <strong>le plus précis l’emporte</strong> : exception sur la variante, sinon seuil du produit, sinon celui-ci.<br>'
      + 'Actuellement : <strong>' + r.regles + '</strong> produit' + (r.regles > 1 ? 's ont' : ' a') + ' son propre seuil, <strong>' + r.exceptions + '</strong> variante' + (r.exceptions > 1 ? 's font' : ' fait') + ' exception.</div>'
      + (D.peut.edit ? '<button class="prim" data-act="reachatlow">Enregistrer le seuil</button>' : '')
      + '<hr style="border:none;border-top:1px solid rgba(255,255,255,.1);margin:1.3rem 0">'
      + '<p class="aide">Nombre maximal d’unités d’une <strong>même variante</strong> qu’un client peut commander, même si le stock est plus grand. La boutique ne révèle ainsi jamais le stock exact.</p>'
      + '<div class="champ" style="max-width:220px"><label>Limite d’achat par commande</label>'
      + '<input type="number" min="1" step="1" id="rc-buymax" value="' + r.buyMax + '"' + ro + ' style="width:100%"></div>'
      + (D.peut.edit ? '<button class="prim" style="margin-top:.7rem" data-act="reachatbuymax">Enregistrer la limite</button>' : '');
  }

  /* ══ DESSIN ════════════════════════════════════════════════════════════════ */
  function dessiner(){
    if (!D) return;
    dessinerOnglets();
    sous.textContent = D.peut.edit ? '' : 'Lecture seule';
    var h;
    if (TAB === 'sizes') h = vueSizes();
    else if (TAB === 'genres' || TAB === 'ageGroups' || TAB === 'styles') h = vueAttr(TAB);
    else if (TAB === 'labels') h = vueLabels();
    else if (TAB === 'colors') h = vueColors();
    else if (TAB === 'categories') h = vueCategories();
    else if (TAB === 'reachat') h = vueReachat();
    if (EDITCOLOR) h += vueEditColor();
    corps.innerHTML = h;
    var sz = document.getElementById('sz-input');
    if (sz) sz.focus();
  }
  function vueEditColor(){
    return '<div class="voile" id="ec-voile"><div class="boite"><h3>Modifier la couleur</h3>'
      + '<div class="champ" style="margin-bottom:.6rem"><label>Nom</label><input id="ec-name" value="' + esc(EDITCOLOR.nom) + '" style="width:100%"></div>'
      + '<div class="champ"><label>Valeur hex</label><div style="display:flex;gap:.4rem;align-items:center">'
      +   '<input id="ec-hex" value="' + esc(EDITCOLOR.hex) + '" class="mono" style="flex:1">'
      +   '<input type="color" id="ec-picker" value="' + (EDITCOLOR.hex.charAt(0) === '#' && EDITCOLOR.hex.length <= 7 ? esc(EDITCOLOR.hex) : '#000000') + '" data-syncEc="1" style="width:38px;height:34px;padding:2px"></div></div>'
      + '<div class="pied-boite"><button data-eccancel="1">Annuler</button><button class="prim" data-ecsave="1">Enregistrer</button></div></div></div>';
  }

  /* ══ GESTES ════════════════════════════════════════════════════════════════ */
  function addSize(){
    var v = val('sz-input');
    if (!v.trim()) return;
    ecrire('invmeta:sizeAdd', { text: v }, function(r){ return r.added ? (r.added > 1 ? r.added + ' tailles ajoutées.' : 'Taille ajoutée.') : 'Cette taille existe déjà.'; });
  }
  function saveAttr(type){
    ecrire('invmeta:attrAdd', { type: type, key: val('at-key'), label: val('at-fr'), labelEN: val('at-en') }, function(){ ADDING = null; return 'Attribut ajouté.'; });
  }
  function saveLabel(){
    ecrire('invmeta:labelAdd', { fr: val('lb-fr'), en: val('lb-en'), color: val('lb-color') }, function(){ ADDING = null; return 'Étiquette ajoutée.'; });
  }
  function addColor(){
    ecrire('invmeta:colorAdd', { name: val('inv-color-name'), hex: val('inv-color-hex') }, function(r){ CVARIANTS = null; return 'Couleur « ' + r.nom + ' » ajoutée.'; });
  }
  function searchColor(){
    var nm = val('inv-color-name');
    if (!nm.trim()) { dire('Entrez un nom de couleur d’abord.', 'att'); return; }
    appeler('invmeta:colorSearch', { name: nm }).then(function(r){
      if (!r || !r.ok) { CVARIANTS = null; dire('Couleur non trouvée. Entrez la valeur hex à la main.', 'err'); dessiner(); return; }
      if (r.variants) { CVARIANTS = r.variants; dessiner(); dire(r.variants.length + ' variante' + plur(r.variants.length) + ' — cliquez pour choisir.', 'bon'); return; }
      CVARIANTS = null;
      var hx = document.getElementById('inv-color-hex'); if (hx) hx.value = r.hex;
      var pk = document.getElementById('inv-color-picker'); if (pk) { try { pk.value = r.hex; } catch(e){} }
      dire('Couleur trouvée : ' + r.hex + (r.source ? ' (' + r.source + ')' : ''), 'bon');
    });
  }
  function saveCode(nm){
    var el = document.getElementById('cc-' + nm);
    ecrire('invmeta:codeSave', { name: nm, code: el ? el.value : '' }, function(r){ return 'Code « ' + r.code + ' » enregistré pour « ' + r.nom + ' ».'; });
  }
  function saveEditColor(){
    ecrire('invmeta:colorEdit', { original: EDITCOLOR.nom, name: val('ec-name'), hex: val('ec-hex') }, function(){ EDITCOLOR = null; return 'Couleur mise à jour.'; });
  }
  function saveCat(id){
    ecrire('invmeta:catSave', {
      id: id, name: val('ic-name'), nameEN: val('ic-nameen'), catKey: val('ic-key'), code: val('ic-code'),
      color: val('ic-color'),
      aiOn: (function(){ var e = document.getElementById('ic-ai'); return e ? e.checked : true; })(),
      simpleOn: (function(){ var e = document.getElementById('ic-simple'); return e ? e.checked : false; })(),
    }, function(r){ CATEDIT = null; return r.cree ? ('Catégorie « ' + r.name + ' » créée (' + r.code + ').') : 'Catégorie mise à jour.'; });
  }
  function saveReachat(which){
    var arg = which === 'low' ? { lowStockDefault: val('rc-low') } : { buyMax: val('rc-buymax') };
    ecrire('invmeta:reachatSave', arg, function(){ return which === 'low' ? 'Seuil enregistré.' : 'Limite enregistrée.'; });
  }

  /* ══ ÉCOUTEURS ═════════════════════════════════════════════════════════════ */
  document.addEventListener('click', function(e){
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest('button'); if (!b) return;
    var g = function(n){ return b.getAttribute(n); };

    if (EDITCOLOR) {
      if (g('data-eccancel')) { EDITCOLOR = null; dessiner(); return; }
      if (g('data-ecsave')) { saveEditColor(); return; }
      return;
    }
    if (g('data-tab')) { TAB = g('data-tab'); ADDING = null; CATEDIT = null; CVARIANTS = null; dessiner(); return; }
    if (g('data-sizerm')) { ecrire('invmeta:sizeRemove', { sz: g('data-sizerm') }, function(){ return 'Taille retirée.'; }); return; }
    if (g('data-attradd')) { ADDING = g('data-attradd'); dessiner(); var f = document.getElementById(ADDING === 'labels' ? 'lb-fr' : 'at-key'); if (f) f.focus(); return; }
    if (g('data-attrcancel')) { ADDING = null; dessiner(); return; }
    if (g('data-attrsave')) { saveAttr(g('data-attrsave')); return; }
    if (g('data-attrrm')) { var p = g('data-attrrm').split('|'); ecrire('invmeta:attrRemove', { type: p[0], key: p[1] }, function(){ return 'Attribut supprimé.'; }); return; }
    if (g('data-labelsave')) { saveLabel(); return; }
    if (g('data-labelrm')) { ecrire('invmeta:labelRemove', { key: g('data-labelrm') }, function(){ return 'Étiquette supprimée.'; }); return; }
    if (g('data-act') === 'coloradd') { addColor(); return; }
    if (g('data-act') === 'colorsearch') { searchColor(); return; }
    if (g('data-act') === 'codesassign') { ecrire('invmeta:codesAssign', {}, function(r){ return r.n + ' code' + plur(r.n) + ' enregistré' + plur(r.n) + '.'; }); return; }
    if (g('data-codesave')) { saveCode(g('data-codesave')); return; }
    if (g('data-coloredit')) { var cp = g('data-coloredit').split('|'); EDITCOLOR = { nom: cp[0], hex: cp[1] }; dessiner(); return; }
    if (g('data-colorrm')) { ecrire('invmeta:colorRemove', { name: g('data-colorrm') }, function(){ return 'Couleur supprimée.'; }); return; }
    if (g('data-pick')) { var pk = g('data-pick').split('|'); var nEl = document.getElementById('inv-color-name'); var hEl = document.getElementById('inv-color-hex'); var pEl = document.getElementById('inv-color-picker'); if (nEl) nEl.value = pk[0]; if (hEl) hEl.value = pk[1]; if (pEl) { try { pEl.value = pk[1]; } catch(er){} } CVARIANTS = null; dire('« ' + pk[0] + ' » sélectionnée.', 'bon'); return; }
    if (g('data-cfilter')) { CFILTER = g('data-cfilter'); dessiner(); return; }
    if (g('data-coltoggle')) { appeler('invmeta:colToggle', { key: g('data-coltoggle') }).then(relire); return; }
    if (g('data-colmove')) { var mv = g('data-colmove').split('|'); appeler('invmeta:colMove', { key: mv[0], dir: parseInt(mv[1], 10) }).then(function(r){ if (r && r.ok) relire(); }); return; }
    if (g('data-catadd')) { CATEDIT = '__new__'; dessiner(); var cf = document.getElementById('ic-name'); if (cf) cf.focus(); return; }
    if (g('data-catedit')) { CATEDIT = g('data-catedit'); dessiner(); var ce = document.getElementById('ic-name'); if (ce) { ce.focus(); ce.select(); } return; }
    if (g('data-catcancel')) { CATEDIT = null; dessiner(); return; }
    if (g('data-catsave') !== null && g('data-catsave') !== undefined) { saveCat(g('data-catsave')); return; }
    if (g('data-catdel')) { ecrire('invmeta:catDelete', { id: g('data-catdel') }, function(r){ return 'Catégorie « ' + r.name + ' » supprimée.'; }); return; }
    if (g('data-act') === 'reachatlow') { saveReachat('low'); return; }
    if (g('data-act') === 'reachatbuymax') { saveReachat('buymax'); return; }
  });

  document.addEventListener('keydown', function(e){
    if (e.target && e.target.id === 'sz-input') {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSize(); }
      else if (e.key === 'Backspace' && !e.target.value && D && D.sizes.length && D.peut.edit) {
        e.preventDefault();
        var last = D.sizes[D.sizes.length - 1];
        ecrire('invmeta:sizeRemove', { sz: last.nom }, function(){ return 'Taille retirée.'; });
      }
      return;
    }
    if (e.key === 'Enter') {
      var id = e.target && e.target.id;
      if (id === 'at-key' || id === 'at-fr' || id === 'at-en') { if (ADDING) saveAttr(ADDING); return; }
      if (id === 'lb-fr' || id === 'lb-en') { saveLabel(); return; }
      if (id && id.indexOf('ic-') === 0) { saveCat(CATEDIT === '__new__' ? '' : CATEDIT); return; }
      if (id && id.indexOf('cc-') === 0) { saveCode(id.slice(3)); return; }
    }
    if (e.key === 'Escape') {
      if (EDITCOLOR) { EDITCOLOR = null; dessiner(); return; }
      if (ADDING) { ADDING = null; dessiner(); return; }
      if (CATEDIT) { CATEDIT = null; dessiner(); return; }
      if (P && P.fermer) P.fermer();
    }
  });

  // Le sélecteur de couleur natif recopie sa valeur dans le champ hex.
  document.addEventListener('input', function(e){
    var t = e.target; if (!t) return;
    if (t.getAttribute && t.getAttribute('data-syncHex')) { var h = document.getElementById('inv-color-hex'); if (h) h.value = t.value; }
    if (t.getAttribute && t.getAttribute('data-syncEc')) { var eh = document.getElementById('ec-hex'); if (eh) eh.value = t.value; }
  });
  // Les deux cases IA / Photos d une categorie sont exclusives.
  document.addEventListener('change', function(e){
    var t = e.target; if (!t || !t.getAttribute) return;
    var ex = t.getAttribute('data-excl');
    if (ex && t.checked) { var o = document.getElementById(ex === 'ai' ? 'ic-ai' : 'ic-simple'); if (o) o.checked = false; }
  });

  window.szModeAncre = function(actif){ document.documentElement.classList.toggle('ancre', !!actif); };

  charger().then(function(ok){
    if (!ok) return;
    ${ouvreAttr ? "ADDING = 'genres';" : ''}
    ${ouvreCat ? "CATEDIT = '__new__';" : ''}
    dessiner();
  });
})();
</script></body></html>`;
}

module.exports = { pageInvMeta };
