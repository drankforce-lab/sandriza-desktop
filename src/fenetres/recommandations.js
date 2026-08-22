'use strict';

/*
 * FENÊTRE « RECOMMANDATIONS » — NATIVE (1.72.0, palier 4)
 * =============================================================================
 * Trois onglets : RÈGLES (l'ordre décide de ce que la cliente voit en premier
 * sur une fiche), LIAISONS MANUELLES (rapprocher deux produits à la main) et
 * STATISTIQUES (la couverture de chaque règle, les articles qui reviennent).
 *
 * ⚠⚠ LE GÉNÉRATEUR D'AGENCEMENT EST ICI DEPUIS #33. Cet en-tête disait qu'il
 * « restait à l'écran web » — un écran que plus personne ne peut ouvrir depuis
 * que la section est ancrable (1.72.0). La fenêtre y renvoyait quand même, en
 * toutes lettres. Trouvé par l'audit de couverture (#32).
 * ⚠ Le look reste DANS la fenêtre jusqu'à la publication : l'écran web
 * réenregistrait à chaque clic sur un article, ce qui écrivait des liaisons à
 * moitié faites. Un seul appel pose les liaisons ET la règle.
 *
 * ⚠ UNE RÈGLE PAR DÉFAUT SUPPRIMÉE N'EST PAS DÉTRUITE : elle est mise de côté
 * et se restaure. La fenêtre les montre, sans quoi on croirait les avoir
 * perdues.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_JOUR, ICO } = require('./socle.js');

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
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:#8fa1b8}
input,select,button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:190px}
input[type=checkbox]{width:auto;margin:0}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:#8fa1b8;font-weight:700;
  /* ⚠ FLEX, sinon le compteur de droite se colle au titre : on lisait
     << ARTICLES0 retenu >> en un seul mot (vu en capture). */
  display:flex;align-items:baseline;gap:.5rem;flex-wrap:wrap}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.32rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody tr:hover td{background:rgba(255,255,255,.04)}
.num{text-align:right;white-space:nowrap}
.fin{white-space:nowrap;text-align:right}
.rang{font-family:'Courier New',monospace;color:#8fa1b8;width:2.2rem}
.dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap;margin-right:.2rem}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.jauge{height:.4rem;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;min-width:5rem}
.jauge i{display:block;height:100%;background:#c9a97e}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:36rem;width:100%;max-height:86vh;display:flex;flex-direction:column;padding:.9rem 1rem}
.boite h3{margin:0 0 .6rem;font:700 .98rem/1.3 Georgia,serif}
.choix{flex:1 1 auto;min-height:6rem;overflow:auto;border:1px solid rgba(255,255,255,.1);
  border-radius:9px;padding:.4rem .5rem}
.choix label{display:flex;align-items:center;gap:.45rem;padding:.14rem 0;font-size:.83rem}
.choix .sku{font-family:'Courier New',monospace;font-size:.72rem;color:#8fa1b8;margin-left:auto}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.8rem;flex-wrap:wrap}
/* ── Generateur d agencement (#33) ── */
.styles{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center}
button.sty{font:inherit;font-size:.79rem;padding:.24rem .7rem;border-radius:99px;
  border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);color:#e8edf5;
  cursor:pointer;white-space:nowrap;-webkit-user-select:none;user-select:none}
button.sty:hover{background:rgba(255,255,255,.1)}
button.sty.actif{border-color:#c9a97e;background:rgba(201,169,126,.16);font-weight:700}
label.champ{display:block;margin:0 0 .6rem}
label.champ .lbl{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;
  color:#8fa1b8;margin:0 0 .22rem}
input.t{width:100%;background:#0f1724;border:1px solid #2b3444;border-radius:8px;
  color:#e8edf5;font:inherit;font-size:.85rem;padding:.4rem .55rem}
input.t:focus{outline:none;border-color:#c9a97e}
label.case{display:inline-flex;align-items:center;gap:.35rem;font-size:.82rem;cursor:pointer;
  border:1px solid rgba(255,255,255,.12);border-radius:9px;padding:.22rem .55rem;
  background:rgba(255,255,255,.03);-webkit-user-select:none;user-select:none}
label.case input{width:15px;height:15px;accent-color:#c9a97e}
.carte h2 .n{margin-left:auto;font-weight:400;text-transform:none;letter-spacing:0;
  font-size:.72rem;color:#8fa1b8}
.carte h2 .n.hi{color:#fbbf24}
.vide{padding:1.3rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Recommandations ».
 * `onglet` = 'liaisons', 'stats' ou 'agencement' pour ouvrir dessus.
 * ⚠ Le garde-fou ne clique pas : sans ce paramètre, le générateur — celui qui
 * avait disparu — resterait invisible pour lui.
 */
function pageRecommandations(onglet) {
  const depart = (['liaisons', 'stats', 'agencement'].indexOf(String(onglet || '')) >= 0)
    ? String(onglet) : 'regles';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Recommandations — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.reco}</span><h1>Recommandations</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}${JS_BROUILLON}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var STATS = null;
  var ONGLET = '${depart}';  // regles | liaisons | stats | agencement
  /* ── GENERATEUR D AGENCEMENT (#33) ──────────────────────────────────────────
     ⚠ IL N ETAIT JOIGNABLE NULLE PART : cette fenetre affichait << Generateur
     d agencement : ecran Recommandations, fenetre principale >> en designant un
     ecran que la section ancrable a rendu inatteignable. Trouve par l audit #32.
     ⚠ LE LOOK RESTE DANS LA FENETRE jusqu a la publication. L ecran web
     reenregistrait a chaque clic sur un article, ce qui ecrivait des liaisons a
     moitie faites ; ici un seul appel pose les liaisons ET la regle. */
  var AGEN = null;           // reco:agencement — styles, categories, catalogue
  var STYLE = null;          // style choisi (filtre le catalogue)
  var LOOK = [];             // ids des articles retenus
  var CATF = 'all';          // filtre de categorie
  var ARME = '';
  var LIAISON = null;        // { id, nom, choisis:[] } en cours d'édition
  var REG_FORM = null;       // { mode:'creer' } | { mode:'editer', r } — formulaire de règle
  var QPROD = '';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux recommandations.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cet élément n’existe plus.',
    nom:                'Le nom interne est requis.',
    titre:              'Le titre affiché est requis.',
    bord:               'Cette règle est déjà au bout de la liste.',
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
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  /* Formulaire natif : créer / modifier une règle typée (op reco:creer /
     reco:editer). En édition, le TYPE n'est pas modifiable (comme le web). */
  function formulaireRegle(){
    var f = REG_FORM, creer = f.mode === 'creer', r = f.r || {};
    var sur = (r.surBrut && r.surBrut.length) ? r.surBrut : ['product'];
    var typeSel = creer
      ? '<label class="champ"><span class="lbl">Type de règle</span><select class="t" id="reg-type">'
        + (D.types || []).map(function(ty){ return '<option value="' + esc(ty.v) + '">' + esc(ty.l) + '</option>'; }).join('')
        + '</select></label>'
      : '';
    return '<div class="carte"><h2>' + (creer ? 'Nouvelle règle' : 'Modifier la règle') + '</h2>'
      + '<label class="champ"><span class="lbl">Nom interne *</span><input class="t" id="reg-nom" placeholder="Ex : Accessoires tendance" value="' + esc(creer ? '' : (r.nom || '')) + '"></label>'
      + typeSel
      + '<label class="champ"><span class="lbl">Titre affiché *</span><input class="t" id="reg-titre" placeholder="Ex : Vous aimerez aussi" value="' + esc(creer ? '' : (r.titre || '')) + '"></label>'
      + '<label class="champ"><span class="lbl">Sous-titre (optionnel)</span><input class="t" id="reg-sous" placeholder="Description courte" value="' + esc(creer ? '' : (r.soustitre || '')) + '"></label>'
      + '<label class="champ"><span class="lbl">Articles max (1 à 16)</span><input class="t" type="number" id="reg-max" min="1" max="16" value="' + esc(creer ? '4' : String(r.max || 4)) + '" style="max-width:120px"></label>'
      + '<div class="lbl" style="margin:.35rem 0 .2rem">Afficher sur</div>'
      + '<div class="styles">'
      + '<label class="case"><input type="checkbox" id="reg-on-product"' + (sur.indexOf('product') >= 0 ? ' checked' : '') + '> Fiche produit</label>'
      + '<label class="case"><input type="checkbox" id="reg-on-cart"' + (sur.indexOf('cart') >= 0 ? ' checked' : '') + '> Panier</label>'
      + '<label class="case"><input type="checkbox" id="reg-on-home"' + (sur.indexOf('home') >= 0 ? ' checked' : '') + '> Accueil</label>'
      + '</div>'
      + '<div class="pied-boite"><button class="mini" id="reg-annuler">Annuler</button> '
      + '<button class="mini prim" id="reg-ok">' + (creer ? 'Créer la règle' : 'Enregistrer') + '</button></div>'
      + '</div>';
  }

  function soumettreRegle(){
    if (!REG_FORM) return;
    var creer = REG_FORM.mode === 'creer';
    var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    var ck = function(id){ var e = document.getElementById(id); return !!(e && e.checked); };
    if (!g('reg-nom').trim())   { dire('Le nom interne est requis.', 'err'); return; }
    if (!g('reg-titre').trim()) { dire('Le titre affiché est requis.', 'err'); return; }
    var on = [];
    if (ck('reg-on-product')) on.push('product');
    if (ck('reg-on-cart'))    on.push('cart');
    if (ck('reg-on-home'))     on.push('home');
    var payload = { name: g('reg-nom'), title: g('reg-titre'), subtitle: g('reg-sous'), max: g('reg-max'), on: on };
    var btn = document.getElementById('reg-ok'); if (btn) btn.disabled = true;
    dire(creer ? 'Création…' : 'Enregistrement…');
    if (creer) {
      payload.type = g('reg-type');
      appeler('reco:creer', [payload]).then(function(r){
        if (!r || !r.ok) { if (btn) btn.disabled = false; dire('Échec : ' + expliquer(r), 'err'); return; }
        /* ⚠ LE BROUILLON MEURT ICI, et seulement ici : le garder ferait
           concurrence a la fiche enregistree sans qu on sache laquelle fait foi. */
        szBrouillonJeter(); REG_FORM = null; charger(); dire('Règle « ' + (r.nom || '') + ' » créée.', 'bon');
      });
    } else {
      appeler('reco:editer', [REG_FORM.r.id, payload]).then(function(r){
        if (!r || !r.ok) { if (btn) btn.disabled = false; dire('Échec : ' + expliquer(r), 'err'); return; }
        szBrouillonJeter(); REG_FORM = null; charger(); dire('Règle mise à jour.', 'bon');
      });
    }
  }

  function vueRegles(){
    var h = '';
    if (REG_FORM) h += formulaireRegle();
    h += '<div class="carte"><h2>Ordre d’affichage</h2>'
      + '<div class="dt" style="margin-bottom:.45rem">Une règle plus haute passe avant : '
      + 'c’est elle que la cliente voit en premier sur une fiche.</div>'
      + (D.peutModifier && !REG_FORM
          ? '<div style="margin:0 0 .7rem"><button class="mini prim" id="reg-nouvelle">+ Nouvelle règle</button></div>'
          : '');
    if (!(D.regles || []).length) {
      h += '<div class="vide">Aucune règle pour l’instant'
        + (D.peutModifier ? ' — utilisez « + Nouvelle règle » ci-dessus pour en créer une.' : '.') + '</div>';
    } else {
      h += '<table><thead><tr><th></th><th>Règle</th><th>Type</th><th>Affichée sur</th>'
        + '<th class="num">Max</th><th>État</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + D.regles.map(function(r, i){
            var gestes = '';
            if (D.peutModifier) {
              gestes = '<button class="mini geste" data-monter="' + esc(r.id) + '"'
                + (r.premiere ? ' disabled' : '') + ' title="Monter">&#9650;</button> '
                + '<button class="mini geste" data-descendre="' + esc(r.id) + '"'
                + (r.derniere ? ' disabled' : '') + ' title="Descendre">&#9660;</button> '
                + '<button class="mini geste" data-basculer="' + esc(r.id) + '" data-actif="'
                + (r.active ? '0' : '1') + '">' + (r.active ? 'Désactiver' : 'Activer') + '</button> '
                + '<button class="mini geste" data-editer="' + esc(r.id) + '">Modifier</button> '
                + '<button class="mini geste danger" data-suppr="' + esc(r.id) + '" data-defaut="'
                + (r.pardefaut ? '1' : '0') + '">' + (ARME === r.id ? 'Confirmer ?' : 'Supprimer') + '</button>';
            }
            return '<tr><td class="rang">' + (i + 1) + '</td>'
              + '<td><strong>' + esc(r.nom) + '</strong>'
              + (r.pardefaut ? ' <span class="pill neutre">par défaut</span>' : '') + '</td>'
              + '<td class="dt">' + esc(r.typeLibelle) + '</td>'
              + '<td>' + (r.ou.length
                  ? r.ou.map(function(x){ return '<span class="pill neutre">' + esc(x) + '</span>'; }).join('')
                  : '<span class="dt">—</span>') + '</td>'
              + '<td class="num">' + (r.max || '—') + '</td>'
              + '<td><span class="pill ' + (r.active ? 'bon' : 'neutre') + '">'
              + (r.active ? 'Active' : 'Inactive') + '</span></td>'
              + (D.peutModifier ? '<td class="fin">' + gestes + '</td>' : '') + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';

    /* Les regles par defaut RETIREES : sans cette liste on les croirait
       perdues, alors qu elles se restaurent d un clic. */
    if ((D.supprimees || []).length) {
      h += '<div class="carte"><h2>Règles par défaut retirées</h2>'
        + '<div class="dt" style="margin-bottom:.4rem">Elles ne sont pas détruites : '
        + 'vous pouvez les remettre en service.</div>'
        + D.supprimees.map(function(s){
            return '<div style="display:flex;align-items:center;gap:.5rem;padding:.25rem 0">'
              + '<strong>' + esc(s.nom) + '</strong>'
              + '<span class="dt">' + esc(s.typeLibelle) + '</span>'
              + (D.peutModifier
                  ? '<button class="mini geste" style="margin-left:auto" data-restaurer="' + esc(s.id) + '">Restaurer</button>'
                  : '') + '</div>';
          }).join('')
        + '</div>';
    }
    return h;
  }

  function vueLiaisons(){
    var ls = D.liaisons || [];
    var h = '<div class="barreoutils">'
      + (D.peutModifier ? '<button class="mini prim" id="rc-lier">Associer des produits</button>' : '')
      + '<div class="droite">'
      + (D.peutModifier && ls.length
          ? '<button class="mini danger" id="rc-vider">'
            + (ARME === '__liaisons' ? 'Confirmer ?' : 'Tout effacer') + '</button>' : '')
      + '<span>' + ls.length + ' produit' + (ls.length > 1 ? 's liés' : ' lié') + '</span></div></div>';
    h += '<div class="carte">';
    if (!ls.length) {
      h += '<div class="vide">Aucune liaison manuelle.'
        + '<div style="margin-top:.35rem">Les recommandations automatiques s’appliquent seules.</div></div>';
    } else {
      h += ls.map(function(l){
        return '<div style="border-top:1px solid rgba(255,255,255,.055);padding:.4rem 0">'
          + '<div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">'
          + '<strong>' + esc(l.nom) + '</strong>'
          + '<span class="dt">' + l.lies.length + ' article' + (l.lies.length > 1 ? 's' : '') + '</span>'
          + (D.peutModifier
              ? '<button class="mini geste" style="margin-left:auto" data-modifier-liaison="' + esc(l.id) + '">Modifier</button>'
              : '') + '</div>'
          + '<div class="dt" style="margin-top:.15rem">'
          + l.lies.map(function(x){ return esc(x.nom); }).join(' · ') + '</div></div>';
      }).join('');
    }
    h += '</div>';
    return h;
  }

  function vueStats(){
    if (!STATS) return '<div class="vide">Chargement des statistiques…</div>';
    var max = 0;
    (STATS.regles || []).forEach(function(r){ if (r.couverture > max) max = r.couverture; });
    var h = '<div class="carte"><h2>Couverture des règles</h2>';
    if (!(STATS.regles || []).length) {
      h += '<div class="vide">Aucune règle.</div>';
    } else {
      h += '<table><thead><tr><th>Règle</th><th>État</th><th class="num">Articles couverts</th>'
        + '<th style="width:40%"></th></tr></thead><tbody>'
        + STATS.regles.map(function(r){
            var pc = max ? Math.round(r.couverture / max * 100) : 0;
            return '<tr><td>' + esc(r.nom) + '</td>'
              + '<td><span class="pill ' + (r.active ? 'bon' : 'neutre') + '">'
              + (r.active ? 'Active' : 'Inactive') + '</span></td>'
              + '<td class="num">' + r.couverture + '</td>'
              + '<td><div class="jauge"><i style="width:' + pc + '%"></i></div></td></tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';

    h += '<div class="carte"><h2>Articles les plus demandés</h2>';
    if (!(STATS.populaires || []).length) {
      h += '<div class="vide">Pas encore assez de commandes pour en tirer un classement.</div>';
    } else {
      h += '<table><thead><tr><th></th><th>Article</th><th class="num">Score</th></tr></thead><tbody>'
        + STATS.populaires.map(function(p, i){
            return '<tr><td class="rang">' + (i + 1) + '</td><td>' + esc(p.nom) + '</td>'
              + '<td class="num">' + p.score + '</td></tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';
    return h;
  }

  function boiteLiaison(){
    var L = LIAISON;
    if (!L) return '';
    var q = QPROD.trim().toLowerCase();
    var tout = D.catalogue || [];
    var choisis = tout.filter(function(p){ return L.choisis.indexOf(p.id) >= 0; });
    var reste = tout.filter(function(p){
      if (p.id === L.id || L.choisis.indexOf(p.id) >= 0) return false;
      if (!q) return true;
      return (String(p.nom) + ' ' + String(p.sku)).toLowerCase().indexOf(q) !== -1;
    });
    var vus = choisis.concat(q ? reste.slice(0, 120) : reste.slice(0, 40));

    return '<div class="voile" id="rc-voile"><div class="boite">'
      + '<h3>' + (L.nom ? 'Articles liés à « ' + esc(L.nom) + ' »' : 'Associer des produits') + '</h3>'
      + (L.id ? '' : '<div class="ch" style="margin-bottom:.5rem"><select id="rc-source">'
          + '<option value="">— Choisir le produit source —</option>'
          + tout.map(function(p){ return '<option value="' + esc(p.id) + '">' + esc(p.nom) + '</option>'; }).join('')
          + '</select></div>')
      + '<input type="search" id="rc-qprod" placeholder="Chercher un nom ou un SKU…" value="' + esc(QPROD) + '" style="margin-bottom:.4rem">'
      + '<div class="choix" id="rc-choix">'
      + (vus.length ? vus.map(function(p){
          return '<label><input type="checkbox" class="rc-p" value="' + esc(p.id) + '"'
            + (L.choisis.indexOf(p.id) >= 0 ? ' checked' : '') + '> ' + esc(p.nom)
            + '<span class="sku">' + esc(p.sku || '') + '</span></label>';
        }).join('') : '<div class="dt">Aucun produit ne correspond.</div>')
      + '</div>'
      + '<div class="dt" style="margin-top:.35rem" id="rc-cpt">' + L.choisis.length
      + ' article' + (L.choisis.length > 1 ? 's choisis' : ' choisi') + '</div>'
      + '<div class="pied-boite"><button class="mini" id="rc-annuler">Annuler</button>'
      + '<button class="mini prim" id="rc-enr">Enregistrer</button></div>'
      + '</div></div>';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    if (sous) sous.textContent = D.peutModifier ? '' : 'consultation seulement';

    var h = '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'regles' ? ' actif' : '') + '" data-onglet="regles">Règles'
      + ((D.regles || []).length ? '<span class="n">' + D.regles.length + '</span>' : '') + '</button>'
      + '<button class="mini' + (ONGLET === 'liaisons' ? ' actif' : '') + '" data-onglet="liaisons">Liaisons manuelles'
      + ((D.liaisons || []).length ? '<span class="n">' + D.liaisons.length + '</span>' : '') + '</button>'
      + '<button class="mini' + (ONGLET === 'stats' ? ' actif' : '') + '" data-onglet="stats">Statistiques</button>'
      + '<button class="mini' + (ONGLET === 'agencement' ? ' actif' : '') + '" data-onglet="agencement">Générateur d’agencement'
      + (LOOK.length ? '<span class="n hi">' + LOOK.length + '</span>' : '') + '</button>'
      + '</div>';

    h += ONGLET === 'liaisons' ? vueLiaisons()
       : ONGLET === 'stats' ? vueStats()
       : ONGLET === 'agencement' ? vueAgencement()
       : vueRegles();
    if (LIAISON) h += boiteLiaison();
    corps.innerHTML = h;
    brancher();
  }

  function brancher(){
    var bl = document.getElementById('rc-lier');
    if (bl) bl.onclick = function(){ LIAISON = { id: '', nom: '', choisis: [] }; QPROD = ''; dessiner(); };
    var ba = document.getElementById('rc-annuler');
    if (ba) ba.onclick = function(){ LIAISON = null; dessiner(); };
    var vo = document.getElementById('rc-voile');
    if (vo) vo.onclick = function(ev){ if (ev.target === vo) { LIAISON = null; dessiner(); } };

    var src = document.getElementById('rc-source');
    if (src) src.onchange = function(){
      var p = (D.catalogue || []).filter(function(x){ return x.id === src.value; })[0];
      var l = (D.liaisons || []).filter(function(x){ return x.id === src.value; })[0];
      LIAISON = { id: src.value, nom: (p && p.nom) || '',
                  choisis: l ? l.lies.map(function(x){ return x.id; }) : [] };
      dessiner();
    };

    var qp = document.getElementById('rc-qprod');
    if (qp) qp.oninput = function(){
      QPROD = qp.value;
      var z = document.getElementById('rc-choix');
      if (!z) return;
      // On ne redessine QUE la liste : le champ garde le curseur.
      var deb = qp.selectionStart, fin = qp.selectionEnd;
      dessiner();
      var q2 = document.getElementById('rc-qprod');
      if (q2) { q2.focus({ preventScroll: true }); try { q2.setSelectionRange(deb, fin); } catch (e) {} }
    };

    [].forEach.call(document.querySelectorAll('.rc-p'), function(cb){
      cb.onchange = function(){
        if (!LIAISON) return;
        var i = LIAISON.choisis.indexOf(cb.value);
        if (cb.checked && i < 0) LIAISON.choisis.push(cb.value);
        if (!cb.checked && i >= 0) LIAISON.choisis.splice(i, 1);
        var c = document.getElementById('rc-cpt');
        if (c) c.textContent = LIAISON.choisis.length + ' article'
          + (LIAISON.choisis.length > 1 ? 's choisis' : ' choisi');
      };
    });

    var be = document.getElementById('rc-enr');
    if (be) be.onclick = function(){
      if (!LIAISON || !LIAISON.id) { dire('Choisissez d’abord le produit source.', 'err'); return; }
      be.disabled = true;
      appeler('reco:liaisons', [LIAISON.id, LIAISON.choisis]).then(function(r){
        be.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        LIAISON = null;
        dire(r.nb ? ('« ' + r.nom + ' » : ' + r.nb + ' article' + (r.nb > 1 ? 's liés.' : ' lié.'))
                  : ('Liaisons de « ' + r.nom + ' » retirées.'), 'bon');
        charger();
      });
    };

    var bv = document.getElementById('rc-vider');
    if (bv) bv.onclick = function(){
      if (ARME !== '__liaisons') {
        ARME = '__liaisons'; dessiner();
        dire('Cliquez « Confirmer ? » — tous les rapprochements faits à la main seront perdus, '
          + 'les recommandations automatiques reprennent seules.', 'att');
        return;
      }
      ARME = '';
      appeler('reco:viderLiaisons', []).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(r.efface + ' liaison' + (r.efface > 1 ? 's effacées' : ' effacée') + '.', 'bon');
        charger();
      });
    };
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest || t.closest('.boite')) return;

    var og = t.closest('[data-onglet]');
    if (og) {
      ONGLET = og.getAttribute('data-onglet'); ARME = '';
      if (ONGLET === 'stats' && !STATS) { chargerStats(); return; }
      if (ONGLET === 'agencement' && !AGEN) { chargerAgencement(); dessiner(); return; }
      dessiner();
      return;
    }

    var st = t.closest('[data-style]');
    if (st) {
      var v = st.getAttribute('data-style');
      /* Recliquer le style actif le retire : c est le geste qu on cherche
         quand on s est trompe, et il evite un bouton de plus. */
      STYLE = (STYLE === v) ? null : v;
      CATF = 'all'; AGEN = null; dessiner(); chargerAgencement();
      return;
    }
    var cf = t.closest('[data-catf]');
    if (cf) { CATF = cf.getAttribute('data-catf'); dessiner(); return; }
    var lk = t.closest('[data-look]');
    if (lk) {
      var id = lk.getAttribute('data-look');
      var k = LOOK.indexOf(id);
      if (k >= 0) LOOK.splice(k, 1); else LOOK.push(id);
      dessiner();
      return;
    }
    if (t.closest('#ag-reinit')) { STYLE = null; LOOK = []; CATF = 'all'; AGEN = null; dessiner(); chargerAgencement(); return; }
    if (t.closest('#ag-publier')) { publierAgencement(); return; }

    /* ⚠ << dessiner() >> D ABORD, << szBrouillonProposer() >> ENSUITE : la boite de reprise
       remplit des champs, et ces champs n existent qu apres le dessin. */
    if (t.closest('#reg-nouvelle')) { REG_FORM = { mode: 'creer' }; ARME = ''; dessiner(); szBrouillonProposer(); return; }
    var bed = t.closest('[data-editer]');
    if (bed) {
      var idE = bed.getAttribute('data-editer');
      var rr = (D.regles || []).filter(function(x){ return x.id === idE; })[0];
      if (rr) { REG_FORM = { mode: 'editer', r: rr }; ARME = ''; dessiner(); szBrouillonProposer(); }
      return;
    }
    /* ⚠ << Annuler >> N EFFACE PAS LE BROUILLON, et c est voulu : la personne
       ferme son formulaire, elle ne declare pas jeter son travail. Il lui sera
       propose a la reouverture. Pour repartir a neuf, la boite de reprise a son
       bouton — le geste est explicite.
       ⚠ ET L ECRITURE EST IMMEDIATE, avec les valeurs prises MAINTENANT : trois
       lignes plus bas le formulaire n existe plus. C est le defaut n°1 des
       Depenses, qui ne gardait que la categorie. */
    if (t.closest('#reg-annuler')) { szBrouillonMaintenant(); REG_FORM = null; dessiner(); return; }
    if (t.closest('#reg-ok')) { soumettreRegle(); return; }

    var bm = t.closest('[data-monter]');
    var bd = t.closest('[data-descendre]');
    if (bm || bd) {
      var b = bm || bd;
      b.disabled = true;
      appeler('reco:deplacer', [b.getAttribute(bm ? 'data-monter' : 'data-descendre'), bm ? -1 : 1])
        .then(function(r){
          if (!r.ok) { b.disabled = false; dire(expliquer(r), 'err'); return; }
          dire('Ordre modifié — « ' + (r.nom || '') + ' » a changé de place.', 'bon');
          charger();
        });
      return;
    }

    var bb = t.closest('[data-basculer]');
    if (bb) {
      bb.disabled = true;
      appeler('reco:basculer', [bb.getAttribute('data-basculer'), bb.getAttribute('data-actif') === '1'])
        .then(function(r){
          if (!r.ok) { bb.disabled = false; dire(expliquer(r), 'err'); return; }
          dire('« ' + (r.nom || '') + ' » ' + (r.active ? 'activée.' : 'désactivée.'), 'bon');
          charger();
        });
      return;
    }

    var bs = t.closest('[data-suppr]');
    if (bs) {
      var idS = bs.getAttribute('data-suppr');
      var pard = bs.getAttribute('data-defaut') === '1';
      if (ARME !== idS) {
        ARME = idS; dessiner();
        dire(pard
          ? 'Cliquez « Confirmer ? » — cette règle par défaut sera retirée, mais vous pourrez la restaurer.'
          : 'Cliquez « Confirmer ? » pour supprimer cette règle.', 'att');
        return;
      }
      ARME = '';
      appeler('reco:supprimer', [idS, pard]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire('« ' + (r.nom || '') + ' » supprimée'
          + (r.restaurable ? ' — restaurable plus bas.' : '.'), 'bon');
        charger();
      });
      return;
    }

    var br = t.closest('[data-restaurer]');
    if (br) {
      br.disabled = true;
      appeler('reco:restaurer', [br.getAttribute('data-restaurer')]).then(function(r){
        if (!r.ok) { br.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('« ' + (r.nom || '') + ' » remise en service.', 'bon');
        charger();
      });
      return;
    }

    var bml = t.closest('[data-modifier-liaison]');
    if (bml) {
      var idL = bml.getAttribute('data-modifier-liaison');
      var l = (D.liaisons || []).filter(function(x){ return x.id === idL; })[0];
      if (l) { LIAISON = { id: l.id, nom: l.nom, choisis: l.lies.map(function(x){ return x.id; }) }; QPROD = ''; dessiner(); }
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
    appeler('reco:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Recommandations indisponibles', expliquer(r)); return; }
      D = r;
      if (ONGLET === 'stats') { chargerStats(); return; }
      dessiner();
      if (ONGLET === 'agencement' && !AGEN) chargerAgencement();
      if (ONGLET === 'stats' && !STATS) chargerStats();
    });
  }
  /* ── GENERATEUR D AGENCEMENT : LA VUE ─────────────────────────────────────
     Trois temps, dans l ordre ou on travaille : choisir un STYLE (qui filtre le
     catalogue), cocher les ARTICLES, nommer et publier. */
  function vueAgencement(){
    if (!AGEN) return '<div class="carte"><div class="vide">Lecture du catalogue…</div></div>';
    var h = '<div class="carte"><h2>1 · Style</h2>'
      + '<div class="styles">'
      + (AGEN.styles || []).map(function(s){
          return '<button class="sty' + (STYLE === s.v ? ' actif' : '') + '" data-style="' + esc(s.v) + '">'
            + esc(s.icone) + ' ' + esc(s.nom) + '</button>';
        }).join('')
      + (STYLE ? '<button class="mini" id="ag-reinit">✕ Réinitialiser</button>' : '')
      + '</div>';
    var S = (AGEN.styles || []).find(function(x){ return x.v === STYLE; });
    h += S
      ? '<div class="dt" style="margin-top:.45rem"><strong>' + esc(S.quoi) + '</strong>'
        + '<div>Recette : ' + esc(S.recette) + ' · Catégories : ' + esc(S.categories.join(', ')) + '</div></div>'
      : '<div class="dt" style="margin-top:.45rem">Choisissez un style pour filtrer le catalogue. '
        + 'Sans style, tous les articles actifs sont proposés.</div>';
    h += '</div>';

    h += '<div class="carte"><h2>2 · Articles<span class="n">' + LOOK.length + ' retenu'
      + (LOOK.length > 1 ? 's' : '') + '</span></h2>'
      + '<div class="styles" style="margin-bottom:.45rem">'
      + '<button class="sty' + (CATF === 'all' ? ' actif' : '') + '" data-catf="all">Toutes</button>'
      + (AGEN.categories || []).map(function(c){
          return '<button class="sty' + (CATF === c.v ? ' actif' : '') + '" data-catf="' + esc(c.v) + '">'
            + esc(c.l) + '</button>'; }).join('')
      + '</div>';
    var liste = (AGEN.produits || []).filter(function(p){ return CATF === 'all' || p.categorie === CATF; });
    if (!liste.length) {
      h += '<div class="vide">Aucun article actif dans cette catégorie.</div>';
    } else {
      h += '<div class="choix" style="max-height:22rem">' + liste.map(function(p){
        return '<label><input type="checkbox" data-look="' + esc(p.id) + '"'
          + (LOOK.indexOf(p.id) >= 0 ? ' checked' : '') + (AGEN.peutEcrire ? '' : ' disabled') + '> '
          + esc(p.nom) + '<span class="sku">' + esc(p.categorieLibelle) + ' · '
          + p.prix.toFixed(2) + ' $</span></label>';
      }).join('') + '</div>';
    }
    h += '</div>';

    var total = (AGEN.produits || []).filter(function(p){ return LOOK.indexOf(p.id) >= 0; })
      .reduce(function(s, p){ return s + p.prix; }, 0);
    h += '<div class="carte"><h2>3 · Publier<span class="n">' + total.toFixed(2) + ' $ au total</span></h2>';
    if (!AGEN.peutEcrire) {
      h += '<div class="vide">Consultation seulement.</div></div>';
      return h;
    }
    h += '<label class="champ"><span class="lbl">Nom de la suggestion</span>'
      + '<input class="t" id="ag-nom" placeholder="Look d’automne" value=""></label>'
      + '<div class="styles">'
      + '<label class="case"><input type="checkbox" id="ag-produit" checked> Sur les fiches produit</label>'
      + '<label class="case"><input type="checkbox" id="ag-panier"> Dans le panier</label>'
      + '</div>'
      /* ⚠ ON DIT LE MINIMUM AVANT LE CLIC, pas apres : une suggestion d une
         seule piece renverrait le client vers le produit qu il regarde deja. */
      + '<div class="dt" style="margin-top:.4rem">Deux articles au minimum — chaque pièce du look sera '
      + 'liée à toutes les autres.</div>'
      + '<div class="pied-boite"><button class="mini prim" id="ag-publier"'
      + (LOOK.length < 2 ? ' disabled' : '') + '>Publier la suggestion</button></div>'
      + '</div>';
    return h;
  }

  function chargerAgencement(){
    appeler('reco:agencement', [STYLE || '']).then(function(r){
      if (!r || !r.ok) { dire('Catalogue illisible : ' + expliquer(r), 'err'); return; }
      AGEN = r;
      if (ONGLET === 'agencement') dessiner();
    });
  }

  function publierAgencement(){
    var n = document.getElementById('ag-nom');
    var ou = [];
    var cp = document.getElementById('ag-produit');
    var cc = document.getElementById('ag-panier');
    if (cp && cp.checked) ou.push('product');
    if (cc && cc.checked) ou.push('cart');
    dire('Publication…');
    appeler('reco:agencement:publier', [{
      nom: n ? n.value : '', style: STYLE || '', articles: LOOK, afficher: ou
    }]).then(function(r){
      if (!r || !r.ok) { dire('Échec : ' + expliquer(r), 'err'); return; }
      LOOK = []; STYLE = null; CATF = 'all'; AGEN = null;
      chargerAgencement();
      /* On revient aux REGLES : la suggestion vient d y naitre, et c est la
         qu on verifie qu elle est bien en place. */
      ONGLET = 'regles';
      charger();
      dire('« ' + r.nom + ' » publiée — ' + r.pieces + ' pièces, visible sur ' + r.ou + '.', 'bon');
    });
  }

  function chargerStats(){
    appeler('reco:stats', []).then(function(r){
      STATS = r && r.ok ? r : { regles: [], populaires: [] };
      dessiner();
    });
  }

  /* ══ LE BROUILLON DU FORMULAIRE DE REGLE ═══════════════════════
     ⚠ LES VALEURS NE VIVENT QUE DANS LE DOM. << REG_FORM >> ne porte que le MODE et
     la fiche d origine ; ce qu on tape n existe nulle part ailleurs que dans les
     champs. Un redessin, une fermeture, et c est perdu sans un mot.
     ⚠ LA CLE DISTINGUE CREATION ET FICHE. Sans elle, une saisie laissee sur une
     regle serait proposee pour la suivante — un formulaire qui a l air simplement
     rempli, la perte la plus difficile a voir. */
  var _brChamps = ['reg-nom', 'reg-type', 'reg-titre', 'reg-sous', 'reg-max'];
  var _brCases = ['reg-on-product', 'reg-on-cart', 'reg-on-home'];
  szBrouillonBrancher({
    portee: 'reco-regle',
    libelle: 'Une r\u00e8gle de recommandation',
    ttlMin: 720,
    cle: function(){
      if (!REG_FORM) return '';
      return REG_FORM.mode === 'creer' ? '__new__' : ('r:' + ((REG_FORM.r || {}).id || ''));
    },
    actif: function(){ return !!REG_FORM; },
    /* Y a-t-il quelque chose a perdre ? En creation, le moindre mot tape. En
       modification, seulement ce qui DIFFERE de la fiche enregistree — sinon on
       proposerait de << reprendre >> un formulaire identique a ce qui est en base. */
    rempli: function(){
      if (!REG_FORM) return false;
      var v = this.valeurs(); if (!v) return false;
      if (REG_FORM.mode === 'creer') {
        return !!(String(v.nom || '').trim() || String(v.titre || '').trim()
          || String(v.sous || '').trim());
      }
      var r = REG_FORM.r || {};
      return String(v.nom || '') !== String(r.nom || '')
        || String(v.titre || '') !== String(r.titre || '')
        || String(v.sous || '') !== String(r.soustitre || '')
        || String(v.max || '') !== String(r.max || 4)
        || v.on.join(',') !== ((r.surBrut && r.surBrut.length ? r.surBrut : ['product']).join(','));
    },
    /* ⚠ SYNCHRONE, et appele AU MOMENT OU l on ferme : les champs existent encore. */
    valeurs: function(){
      if (!document.getElementById('reg-nom')) return null;
      var v = { on: [] };
      _brChamps.forEach(function(id){
        var e = document.getElementById(id);
        v[id.slice(4)] = e ? e.value : '';
      });
      _brCases.forEach(function(id){
        var e = document.getElementById(id);
        if (e && e.checked) v.on.push(id.slice(7));
      });
      return v;
    },
    remplir: function(v){
      _brChamps.forEach(function(id){
        var e = document.getElementById(id);
        if (e && v[id.slice(4)] !== undefined) e.value = v[id.slice(4)];
      });
      var on = v.on || [];
      _brCases.forEach(function(id){
        var e = document.getElementById(id);
        if (e) e.checked = on.indexOf(id.slice(7)) >= 0;
      });
    },
  });
  szBrouillonEcouter();

  window.szActualiser = function(){ if (!LIAISON && !ARME && !REG_FORM) charger(); };
  window.szRevenir = function(){ if (!LIAISON && !REG_FORM) charger(); };

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
      if (LIAISON) { LIAISON = null; dessiner(); return; }
      if (ARME) { ARME = ''; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageRecommandations };
