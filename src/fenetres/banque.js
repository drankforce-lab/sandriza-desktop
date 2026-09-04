'use strict';

/*
 * FENÊTRE « CONCILIATION BANCAIRE » — NATIVE
 * =============================================================================
 * Rapprocher le relevé de banque avec les dépôts Square et les sorties, ligne à
 * ligne, jusqu'à ce que l'écart tombe à zéro. Puis verrouiller — c'est ce
 * verrou qui fait du document une pièce comptable opposable.
 *
 * Quatre onglets, parce que ce sont quatre gestes différents et qu'on ne les
 * fait pas dans le même ordre selon le mois : le RELEVÉ (ce que la banque dit),
 * les DÉPÔTS ET SORTIES (ce que Square et les dépenses disent), l'APPARIEMENT
 * (mettre les deux face à face), et le RÉSUMÉ (l'écart, et ce qu'on en note).
 *
 * ⚠ LA FENÊTRE NE DÉCIDE RIEN. Le droit super-administrateur, le verrou, le
 * calcul de l'écart et la règle qui interdit de déclarer « complétée » une
 * conciliation qui ne balance pas vivent tous dans le cœur (BankRec._banque*).
 * Ils y sont descendus AVEC cette fenêtre, et ce n'est pas un détail : avant,
 * c'étaient des boutons masqués dans l'écran du site — donc contournables dès
 * qu'une deuxième surface existe.
 *
 * ⚠ PATRON « FENÊTRE PILOTE » pour le rapport et les exports. Le rapport de
 * conciliation est un IMPRIMÉ (en-tête d'entreprise, colonnes millimétrées,
 * totaux) et le fichier d'année est une archive composée par le site. Les
 * redessiner ici voudrait dire les écrire deux fois — et deux rapports
 * comptables qui divergent, c'est une pièce fausse. La fenêtre COMMANDE.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.onglets{flex:0 0 auto;display:flex;gap:.3rem;padding:.5rem 1.05rem 0;
  border-bottom:1px solid var(--v08)}
.onglets button{background:none;border:0;border-bottom:2px solid transparent;color:var(--tx2);
  font:600 .82rem/1 system-ui;padding:.45rem .7rem;cursor:pointer;border-radius:0}
.onglets button.on{color:var(--tx);border-bottom-color:#c9a97e}
.corps{flex:1 1 auto;min-height:0;padding:.85rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.75rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.carte{background:#16202f;border:1px solid var(--v08);border-radius:11px;
  padding:.8rem .9rem}
.carte h2{margin:0 0 .55rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
label{display:block;font-size:.73rem;color:var(--tx2);margin:.5rem 0 .18rem}
input,select,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.34rem .5rem;width:100%}
textarea{resize:vertical;min-height:4rem}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.34rem .6rem;cursor:pointer;width:auto}
input:focus,select:focus,textarea:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v11)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.mini{font-size:.72rem;padding:.16rem .45rem}
button.dgr{border-color:rgba(248,113,113,.5);color:var(--tx-err2)}
.duo{display:flex;gap:.65rem;flex-wrap:wrap}
.duo>div{flex:1 1 9rem;min-width:0}
.barreoutils{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center}
table{width:100%;border-collapse:collapse;font-size:.79rem}
thead th{text-align:left;padding:.22rem .35rem;font-size:.65rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v11)}
tbody td{padding:.3rem .35rem;border-top:1px solid var(--v05);vertical-align:top}
tbody tr:hover td{background:var(--v03)}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.dt{font-size:.7rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.64rem;padding:.05rem .45rem;border-radius:99px;
  white-space:nowrap;font-weight:700}
.pill.open{background:rgba(59,130,246,.16);color:var(--tx-bleu)}
.pill.in_progress{background:rgba(245,158,11,.16);color:#fcd34d}
.pill.completed{background:rgba(16,185,129,.16);color:#6ee7b7}
.pill.locked{background:rgba(148,163,184,.18);color:var(--tx-gris2)}
.pill.g{background:rgba(148,163,184,.14);color:var(--tx2);font-weight:600}
.lg{cursor:pointer}
.vide{padding:1.1rem .6rem;text-align:center;color:var(--tx2);font-size:.82rem}
/* L ecart : c est LA chose qu on vient regarder. Il se lit sans chercher. */
.ecart{border-radius:11px;padding:.75rem .9rem;display:flex;align-items:center;
  justify-content:space-between;gap:1rem;flex-wrap:wrap}
.ecart.bon{border:2px solid rgba(16,185,129,.5);background:rgba(16,185,129,.08)}
.ecart.mauvais{border:2px solid rgba(248,113,113,.5);background:rgba(248,113,113,.08)}
.ecart .col{min-width:7rem}
.ecart .k{font-size:.64rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);font-weight:700}
.ecart .v{font:700 1.05rem/1.2 system-ui;font-variant-numeric:tabular-nums}
.ecart .verdict{font:700 1rem/1.2 system-ui}
.ecart.bon .verdict{color:#6ee7b7}.ecart.mauvais .verdict{color:var(--tx-err2)}
.paire{border:1px solid rgba(16,185,129,.35);background:rgba(16,185,129,.07);
  border-radius:8px;padding:.35rem .5rem;margin-bottom:.3rem;display:flex;
  align-items:center;gap:.5rem}
.paire .d{flex:1 1 auto;min-width:0}
.seule{border:1px solid var(--v11);border-radius:8px;padding:.35rem .5rem;
  margin-bottom:.3rem;display:flex;align-items:center;gap:.5rem}
.seule .d{flex:1 1 auto;min-width:0}
.franc{border:1px solid rgba(240,180,80,.35);background:rgba(200,140,40,.1);
  color:var(--tx-or2);border-radius:9px;padding:.45rem .65rem;font-size:.74rem}
.aide{font-size:.71rem;color:var(--tx2);margin:.3rem 0 0}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:#0b1220}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * @param {string} ouverture '' (la liste) ou l'onglet du PREMIER rapprochement :
 *        'releve' | 'depots' | 'appariement' | 'resume'
 */
function pageBanque(ouverture) {
  const dep = JSON.stringify(String(ouverture || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Conciliation bancaire — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.bankrec}</span><h1>Conciliation bancaire</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets" id="onglets"></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}${JS_BROUILLON}
  var corps = document.getElementById('corps');
  var sous  = document.getElementById('sous');
  var barre = document.getElementById('onglets');
  var DEPART = ${dep};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'La conciliation bancaire est réservée au super-administrateur.',
    indisponible:       'Le module de conciliation n’est pas chargé dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette conciliation n’existe plus.',
    verrouille:         'Cette conciliation est verrouillée : elle ne peut plus être modifiée.',
    cache_vide:         'Aucune transaction Square en mémoire pour cette année. Chargez-les d’abord depuis l’écran Paiements.',
    aucune_depense:     'Aucune dépense enregistrée pour cette année.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var base = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    return base + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  var D = null;                 // la reponse de banque:donnees
  var ANNEE = 0;
  var REC = '';                 // le rapprochement ouvert
  var VUE = 'releve';
  var EDIT_E = null;            // '' = nouveau, sinon l id
  var EDIT_V = null;
  var ARME = '';

  var STATUTS = { open: 'Ouvert', in_progress: 'En cours', completed: 'Complété', locked: 'Verrouillé' };
  var ONGLETS = [['releve', 'Relevé bancaire'], ['depots', 'Dépôts et sorties'],
                 ['appariement', 'Appariement'], ['resume', 'Résumé']];

  function sou(n){
    var v = parseFloat(n) || 0;
    var a = Math.abs(v).toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ' ').replace('.', ',');
    return (v < 0 ? '− ' : '') + a + ' $';
  }
  function jour(s){
    if (!s) return '—';
    var d = new Date(s);
    if (isNaN(d.getTime())) return esc(s);
    return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // ════════════════════════════════════════════════════════════════════════
  function dessinerOnglets(){
    if (!REC) { barre.innerHTML = ''; return; }
    barre.innerHTML = ONGLETS.map(function(o){
      return '<button data-vue="' + o[0] + '"' + (VUE === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>';
    }).join('');
    Array.prototype.forEach.call(barre.querySelectorAll('[data-vue]'), function(b){
      b.onclick = function(){ VUE = b.getAttribute('data-vue'); EDIT_E = null; EDIT_V = null; dessiner(); };
    });
  }

  function barreAnnees(){
    var a = (D.annees || []).map(function(y){
      return '<option value="' + y + '"' + (y === ANNEE ? ' selected' : '') + '>' + y + '</option>';
    }).join('');
    return '<label style="margin:0">Année</label><select id="b-annee" style="width:auto">' + a + '</select>';
  }

  // ── LISTE ───────────────────────────────────────────────────────────────
  function dessinerListe(){
    var h = [];
    h.push('<div class="barreoutils">' + barreAnnees()
      + (D.peutEcrire ? '<button class="prim" id="b-nouveau">+ Nouvelle conciliation</button>' : '')
      + '<span class="droite">'
      + '<button id="b-zip">Archive de l’année</button>'
      + '<button id="b-recharger">Recharger</button></span></div>');

    h.push('<div class="carte"><h2>Conciliations ' + ANNEE + '</h2>');
    if (!(D.liste || []).length) {
      h.push('<div class="vide">Aucune conciliation pour cette année.</div>');
    } else {
      h.push('<table><thead><tr><th>État</th><th>Nom</th><th class="num">Relevé</th>'
        + '<th class="num">Dépôts</th><th class="num">Écart</th><th>Lignes</th><th>Modifié</th><th></th></tr></thead><tbody>');
      D.liste.forEach(function(r){
        var s = r.resume || {};
        h.push('<tr class="lg" data-ouvrir="' + esc(r.id) + '">'
          + '<td><span class="pill ' + esc(r.status) + '">' + esc(STATUTS[r.status] || r.status) + '</span></td>'
          + '<td>' + esc(r.label || '—') + '</td>'
          + '<td class="num">' + sou(s.bankTotal) + '</td>'
          + '<td class="num">' + sou(s.squareTotal) + '</td>'
          + '<td class="num" style="color:' + (s.isBalanced ? '#6ee7b7' : '#fca5a5') + '">' + sou(s.difference) + '</td>'
          + '<td class="dt">' + r.nbBanque + ' / ' + r.nbVersements + '</td>'
          + '<td class="dt">' + jour(r.updatedAt) + '</td>'
          + '<td style="white-space:nowrap">'
            + '<button class="mini" data-pdf="' + esc(r.id) + '">Rapport</button> '
            + (D.peutEcrire
                ? '<button class="mini dgr" data-jeter="' + esc(r.id) + '">'
                  + (ARME === r.id ? 'Confirmer ?' : 'Supprimer') + '</button>'
                : '')
          + '</td></tr>');
      });
      h.push('</tbody></table>');
    }
    h.push('</div>');
    corps.innerHTML = h.join('');
    brancherListe();
  }

  function brancherListe(){
    var an = document.getElementById('b-annee');
    if (an) an.onchange = function(){ ANNEE = parseInt(an.value, 10); REC = ''; charger(); };
    var nv = document.getElementById('b-nouveau');
    if (nv) nv.onclick = creer;
    var rc = document.getElementById('b-recharger');
    if (rc) rc.onclick = function(){ charger(); };
    var zp = document.getElementById('b-zip');
    if (zp) zp.onclick = function(){ document_(''); };
    Array.prototype.forEach.call(corps.querySelectorAll('[data-ouvrir]'), function(tr){
      tr.onclick = function(ev){
        if (ev.target && ev.target.tagName === 'BUTTON') return;
        REC = tr.getAttribute('data-ouvrir'); VUE = 'releve'; charger();
      };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-pdf]'), function(b){
      b.onclick = function(){ REC = b.getAttribute('data-pdf'); document_('pdf'); };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-jeter]'), function(b){
      b.onclick = function(){ supprimer(b.getAttribute('data-jeter')); };
    });
  }

  // ── ENTÊTE DU DÉTAIL ────────────────────────────────────────────────────
  function enteteDetail(){
    var r = D.rec, s = D.resume || {};
    return '<div class="barreoutils">'
      + '<button id="b-retour">← Toutes les conciliations</button>'
      + '<span class="pill ' + esc(r.status) + '">' + esc(STATUTS[r.status] || r.status) + '</span>'
      + '<strong>' + esc(r.label || '') + '</strong>'
      + (D.verrouille ? '<span class="pill g">verrouillée le ' + jour(r.lockedAt) + '</span>' : '')
      + '<span class="droite">'
      + '<button id="b-csv">CSV</button>'
      + '<button id="b-pdf">Rapport</button>'
      + '</span></div>'
      + '<div class="ecart ' + (s.isBalanced ? 'bon' : 'mauvais') + '">'
      + '<div class="col"><div class="k">Relevé</div><div class="v">' + sou(s.bankTotal) + '</div></div>'
      + '<div class="col"><div class="k">Dépôts et sorties</div><div class="v">' + sou(s.squareTotal) + '</div></div>'
      + '<div class="col"><div class="k">Écart</div><div class="v">' + sou(s.difference) + '</div></div>'
      + '<div class="verdict">' + (s.isBalanced ? '✓ Équilibrée' : '⚠ Écart non résolu') + '</div>'
      + '</div>';
  }

  // ── ONGLET RELEVÉ ───────────────────────────────────────────────────────
  function vueReleve(){
    var r = D.rec;
    var h = [enteteDetail()];
    h.push('<div class="carte"><div class="barreoutils"><h2 style="margin:0">Lignes du relevé</h2>'
      + (D.verrouille || !D.peutEcrire ? '' : '<span class="droite"><button class="prim" id="e-ajouter">+ Ligne</button></span>')
      + '</div>');
    if (EDIT_E !== null) h.push(formEntree());
    if (!r.bankEntries.length) {
      h.push('<div class="vide">Aucune ligne. Saisissez le relevé, ou collez-le ligne par ligne.</div>');
    } else {
      h.push('<table><thead><tr><th>Date</th><th>Description</th><th>Type</th>'
        + '<th class="num">Montant</th><th>État</th><th></th></tr></thead><tbody>');
      r.bankEntries.forEach(function(e){
        h.push('<tr><td class="dt">' + esc(e.date || '—') + '</td>'
          + '<td>' + esc(e.description || '—')
            + (e.notes ? '<div class="dt">' + esc(e.notes) + '</div>' : '') + '</td>'
          + '<td class="dt">' + esc(e.type || '—') + '</td>'
          + '<td class="num">' + sou(e.amount) + '</td>'
          + '<td>' + (e.status === 'matched'
              ? '<span class="pill completed">apparié</span>'
              : '<span class="pill g">seul</span>') + '</td>'
          + '<td style="white-space:nowrap">'
            + (D.verrouille || !D.peutEcrire ? ''
                : '<button class="mini" data-e-mod="' + esc(e.id) + '">Modifier</button> '
                  + '<button class="mini dgr" data-e-jeter="' + esc(e.id) + '">'
                  + (ARME === e.id ? 'Confirmer ?' : 'Retirer') + '</button>')
          + '</td></tr>');
      });
      h.push('</tbody></table>');
    }
    h.push('</div>');
    return h.join('');
  }

  function formEntree(){
    var e = null;
    if (EDIT_E) {
      for (var i = 0; i < D.rec.bankEntries.length; i++) {
        if (D.rec.bankEntries[i].id === EDIT_E) { e = D.rec.bankEntries[i]; break; }
      }
    }
    e = e || {};
    return '<div class="carte" style="margin:.4rem 0">'
      + '<h2>' + (EDIT_E ? 'Modifier la ligne' : 'Nouvelle ligne du relevé') + '</h2>'
      + '<div class="duo">'
      + '<div><label for="e-date">Date</label><input id="e-date" type="date" value="' + esc(e.date || '') + '"></div>'
      + '<div style="flex:2 1 16rem"><label for="e-desc">Description</label>'
      + '<input id="e-desc" type="text" value="' + esc(e.description || '') + '"></div>'
      + '<div><label for="e-type">Type</label><input id="e-type" type="text" value="' + esc(e.type || '') + '" placeholder="dépôt, retrait…"></div>'
      + '<div><label for="e-mnt">Montant</label><input id="e-mnt" type="number" step="0.01" value="' + esc(e.amount != null ? e.amount : '') + '"></div>'
      + '</div>'
      + '<label for="e-notes">Note</label><input id="e-notes" type="text" value="' + esc(e.notes || '') + '">'
      + '<p class="aide">Une SORTIE se saisit en négatif — c’est ce qui fait que l’écart tombe à zéro quand elle est appariée.</p>'
      + '<div class="barreoutils" style="margin-top:.5rem"><button class="prim" id="e-enregistrer">Enregistrer</button>'
      + '<span class="droite"><button id="e-annuler">Annuler</button></span></div></div>';
  }

  // ── ONGLET DÉPÔTS ET SORTIES ────────────────────────────────────────────
  function vueDepots(){
    var r = D.rec, sq = D.square || {};
    var h = [enteteDetail()];
    h.push('<div class="carte"><div class="barreoutils"><h2 style="margin:0">Dépôts Square et sorties</h2>'
      + (D.verrouille || !D.peutEcrire ? '' : '<span class="droite">'
          + '<button id="v-square">Importer Square</button>'
          + '<button id="v-depenses">Importer les dépenses</button>'
          + '<button class="prim" id="v-ajouter">+ Ligne</button></span>')
      + '</div>');
    h.push('<p class="aide">Square en mémoire pour ' + ANNEE + '&nbsp;: ' + (sq.nbTx || 0)
      + ' transaction' + ((sq.nbTx || 0) > 1 ? 's' : '') + ' · brut ' + sou(sq.brut)
      + ' · frais ' + sou(sq.frais) + ' · net ' + sou(sq.net) + '.</p>');
    if (EDIT_V !== null) h.push(formVersement());
    if (!r.squarePayouts.length) {
      h.push('<div class="vide">Aucun dépôt ni sortie.</div>');
    } else {
      h.push('<table><thead><tr><th>Arrivée</th><th>Description</th><th>Période</th>'
        + '<th class="num">Montant</th><th>État</th><th></th></tr></thead><tbody>');
      r.squarePayouts.forEach(function(p){
        h.push('<tr><td class="dt">' + esc(p.arrivalDate || '—') + '</td>'
          + '<td>' + esc(p.description || '—')
            + (p.notes ? '<div class="dt">' + esc(p.notes) + '</div>' : '')
            + (p.source ? ' <span class="pill g">' + esc(p.source === 'expense' ? 'dépense' : 'Square') + '</span>' : '') + '</td>'
          + '<td class="dt">' + esc(p.periodFrom || '?') + ' → ' + esc(p.periodTo || '?') + '</td>'
          + '<td class="num">' + sou(p.amount) + '</td>'
          + '<td>' + (p.status === 'matched'
              ? '<span class="pill completed">apparié</span>'
              : '<span class="pill g">seul</span>') + '</td>'
          + '<td style="white-space:nowrap">'
            + (D.verrouille || !D.peutEcrire ? ''
                : '<button class="mini" data-v-mod="' + esc(p.id) + '">Modifier</button> '
                  + '<button class="mini dgr" data-v-jeter="' + esc(p.id) + '">'
                  + (ARME === p.id ? 'Confirmer ?' : 'Retirer') + '</button>')
          + '</td></tr>');
      });
      h.push('</tbody></table>');
    }
    h.push('</div>');
    return h.join('');
  }

  function formVersement(){
    var p = null;
    if (EDIT_V) {
      for (var i = 0; i < D.rec.squarePayouts.length; i++) {
        if (D.rec.squarePayouts[i].id === EDIT_V) { p = D.rec.squarePayouts[i]; break; }
      }
    }
    p = p || {};
    return '<div class="carte" style="margin:.4rem 0">'
      + '<h2>' + (EDIT_V ? 'Modifier la ligne' : 'Nouveau dépôt ou sortie') + '</h2>'
      + '<div class="duo">'
      + '<div><label for="v-date">Arrivée</label><input id="v-date" type="date" value="' + esc(p.arrivalDate || '') + '"></div>'
      + '<div><label for="v-du">Période du</label><input id="v-du" type="date" value="' + esc(p.periodFrom || '') + '"></div>'
      + '<div><label for="v-au">au</label><input id="v-au" type="date" value="' + esc(p.periodTo || '') + '"></div>'
      + '<div><label for="v-mnt">Montant</label><input id="v-mnt" type="number" step="0.01" value="' + esc(p.amount != null ? p.amount : '') + '"></div>'
      + '</div>'
      + '<label for="v-desc">Description</label><input id="v-desc" type="text" value="' + esc(p.description || '') + '">'
      + '<label for="v-notes">Note</label><input id="v-notes" type="text" value="' + esc(p.notes || '') + '">'
      + '<p class="aide">Une SORTIE (dépense payée) se saisit en négatif.</p>'
      + '<div class="barreoutils" style="margin-top:.5rem"><button class="prim" id="v-enregistrer">Enregistrer</button>'
      + '<span class="droite"><button id="v-annuler">Annuler</button></span></div></div>';
  }

  // ── ONGLET APPARIEMENT ──────────────────────────────────────────────────
  function vueAppariement(){
    var r = D.rec;
    var seulesB = r.bankEntries.filter(function(e){ return e.status !== 'matched'; });
    var seulesV = r.squarePayouts.filter(function(p){ return p.status !== 'matched'; });
    var paires  = r.bankEntries.filter(function(e){ return e.status === 'matched'; });
    var h = [enteteDetail()];

    h.push('<div class="duo" style="align-items:flex-start">');
    h.push('<div style="flex:1 1 20rem"><div class="carte"><h2>Relevé — non appariés (' + seulesB.length + ')</h2>');
    if (!seulesB.length) h.push('<div class="vide">Toutes les lignes du relevé sont appariées ✓</div>');
    seulesB.forEach(function(e){
      h.push('<div class="seule"><div class="d"><div>' + esc(e.description || '—') + '</div>'
        + '<div class="dt">' + esc(e.date || '—') + ' · ' + esc(e.type || '—') + '</div></div>'
        + '<div style="font-variant-numeric:tabular-nums;font-weight:700">' + sou(e.amount) + '</div>'
        + (D.verrouille || !D.peutEcrire || !seulesV.length ? ''
            : '<select data-app="' + esc(e.id) + '" style="width:auto;max-width:11rem">'
              + '<option value="">— apparier avec…</option>'
              + seulesV.map(function(p){
                  return '<option value="' + esc(p.id) + '">' + esc(p.arrivalDate || '?') + ' · ' + sou(p.amount) + '</option>';
                }).join('') + '</select>')
        + '</div>');
    });
    h.push('</div></div>');

    h.push('<div style="flex:1 1 20rem"><div class="carte"><h2>Dépôts et sorties — non appariés (' + seulesV.length + ')</h2>');
    if (!seulesV.length) h.push('<div class="vide">Tout est apparié ✓</div>');
    seulesV.forEach(function(p){
      h.push('<div class="seule"><div class="d"><div>' + esc(p.description || '—') + '</div>'
        + '<div class="dt">' + esc(p.arrivalDate || '—') + '</div></div>'
        + '<div style="font-variant-numeric:tabular-nums;font-weight:700">' + sou(p.amount) + '</div></div>');
    });
    h.push('</div></div>');
    h.push('</div>');

    if (paires.length) {
      h.push('<div class="carte"><h2>Appariements confirmés (' + paires.length + ')</h2>');
      paires.forEach(function(e){
        var p = null;
        for (var i = 0; i < r.squarePayouts.length; i++) {
          if (r.squarePayouts[i].id === e.matchedPayoutId) { p = r.squarePayouts[i]; break; }
        }
        var ec = p ? (parseFloat(e.amount) - parseFloat(p.amount)) : null;
        h.push('<div class="paire"><div class="d">'
          + '<div>' + esc(e.description || '—') + ' <span style="color:#6ee7b7">→</span> '
          + esc((p && p.description) || '—') + '</div>'
          + '<div class="dt">' + esc(e.date || '—') + ' · relevé ' + sou(e.amount)
          + ' · dépôt ' + sou(p ? p.amount : 0) + ' · '
          + (ec !== null && Math.abs(ec) > 0.005
              ? '<span style="color:var(--tx-err2)">écart ' + sou(ec) + '</span>'
              : '<span style="color:#6ee7b7">exact</span>') + '</div></div>'
          + (D.verrouille || !D.peutEcrire ? ''
              : '<button class="mini" data-desapp="' + esc(e.id) + '">Défaire</button>')
          + '</div>');
      });
      h.push('</div>');
    }
    return h.join('');
  }

  // ── ONGLET RÉSUMÉ ───────────────────────────────────────────────────────
  function vueResume(){
    var r = D.rec, s = D.resume || {};
    var h = [enteteDetail()];
    h.push('<div class="carte"><h2>Compte des lignes</h2><table><tbody>'
      + '<tr><td>Lignes du relevé appariées</td><td class="num">' + s.matchedBank + '</td></tr>'
      + '<tr><td>Lignes du relevé seules</td><td class="num">' + s.unmatchedBank + '</td></tr>'
      + '<tr><td>Dépôts et sorties seuls</td><td class="num">' + s.unmatchedSquare + '</td></tr>'
      + '<tr><td>Ajustements</td><td class="num">' + sou(s.adjTotal) + '</td></tr>'
      + '</tbody></table></div>');

    h.push('<div class="carte"><h2>Notes de conciliation</h2>'
      + '<textarea id="r-notes"' + (D.verrouille || !D.peutEcrire ? ' readonly' : '') + '>' + esc(r.notes || '') + '</textarea>'
      + (D.verrouille || !D.peutEcrire ? ''
          : '<div class="barreoutils" style="margin-top:.4rem"><button id="r-notes-ok">Enregistrer les notes</button></div>')
      + '</div>');

    if (!D.verrouille && D.peutEcrire) {
      h.push('<div class="carte"><h2>Clore</h2>'
        + '<div class="barreoutils">'
        + '<button id="r-completer">Marquer complétée</button>'
        + '<button class="prim' + (s.isBalanced ? '' : ' ') + '" id="r-verrouiller">'
        + (ARME === 'verrou' ? 'Confirmer le verrouillage ?' : 'Verrouiller') + '</button>'
        + '</div>'
        + '<p class="aide">« Complétée » n’est accordé que si l’écart est nul&nbsp;: sinon le statut '
        + 'reste « en cours ». Le bouton ne peut donc pas mentir.</p>'
        + '<div class="franc" style="margin-top:.5rem"><b>Le verrouillage est définitif.</b> '
        + 'La conciliation ne pourra plus jamais être modifiée — c’est ce qui en fait une pièce '
        + 'comptable opposable. Elle restera consultable et imprimable.'
        + (s.isBalanced ? '' : ' <strong>L’écart n’est pas nul&nbsp;;</strong> verrouiller le fige tel quel.')
        + '</div></div>');
    }
    return h.join('');
  }

  // ════════════════════════════════════════════════════════════════════════
  function dessiner(){
    if (!D || !D.ok) return;
    dessinerOnglets();
    if (!REC || !D.rec) { dessinerListe(); return; }
    corps.innerHTML = VUE === 'depots' ? vueDepots()
      : VUE === 'appariement' ? vueAppariement()
      : VUE === 'resume' ? vueResume() : vueReleve();
    brancherDetail();
  }

  /* == LE BROUILLON DES DEUX FORMULAIRES DE BANQUE ==========================
     Le rapprochement bancaire se fait ligne par ligne, chacune avec sa date, sa
     description, son type, son montant et sa note. On en saisit plusieurs de
     suite, et c'est de l'ARGENT : recommencer une ligne veut dire retourner au
     releve pour relire un chiffre.
     ⚠ DEUX FORMULAIRES DISTINCTS — les lignes du releve (EDIT_E) et les depots ou
     sorties (EDIT_V) — avec des champs differents. La cle porte donc lequel des
     deux, et l'identifiant de la ligne modifiee : sans elle, une saisie laissee sur
     une ligne serait proposee sur la suivante, dans un rapprochement ou toutes les
     lignes se ressemblent. C'est le pire endroit pour confondre deux fiches. */
  var BR_E = ['e-date', 'e-desc', 'e-type', 'e-mnt', 'e-notes'];
  var BR_V = ['v-date', 'v-du', 'v-au', 'v-mnt', 'v-desc', 'v-notes'];
  function brQuel(){
    if (EDIT_E !== null && document.getElementById('e-desc')) return 'e';
    if (EDIT_V !== null && document.getElementById('v-desc')) return 'v';
    return '';
  }
  szBrouillonBrancher({
    portee: 'banque',
    libelle: 'Une ligne',
    ttlMin: 720,
    cle: function(){
      var q = brQuel(); if (!q) return '';
      var id = q === 'e' ? EDIT_E : EDIT_V;
      return q + ':' + (id || '__new__');
    },
    actif: function(){ return !!brQuel(); },
    valeurs: function(){
      var q = brQuel(); if (!q) return null;
      var v = szBrouillonDuDom(q === 'e' ? BR_E : BR_V, []);
      if (v) v._quel = q;
      return v;
    },
    rempli: function(){
      var q = brQuel(); if (!q) return false;
      var l = q === 'e' ? BR_E : BR_V;
      var v = szBrouillonDuDom(l, []); if (!v) return false;
      /* La date d'un champ << date >> peut etre prete d'avance : on ne compte que
         la description, le montant et la note — ce qu'on tape vraiment. */
      return szBrouillonQuelqueChose(v, q === 'e'
        ? ['e-desc', 'e-type', 'e-mnt', 'e-notes']
        : ['v-desc', 'v-mnt', 'v-notes']);
    },
    remplir: function(v){
      /* Un brouillon de l'AUTRE formulaire ne se repose pas : ses champs n'ont
         rien a voir, et remplir une ligne de releve avec un depot ferait un
         formulaire incoherent. La cle l'evite deja ; ceci est la ceinture. */
      if (v._quel && v._quel !== brQuel()) return;
      szBrouillonAuDom(v);
    },
  });
  szBrouillonEcouter();

  function brancherDetail(){
    var ret = document.getElementById('b-retour');
    if (ret) ret.onclick = function(){ REC = ''; ARME = ''; charger(); };
    var csv = document.getElementById('b-csv');
    if (csv) csv.onclick = function(){ document_('csv'); };
    var pdf = document.getElementById('b-pdf');
    if (pdf) pdf.onclick = function(){ document_('pdf'); };

    var ea = document.getElementById('e-ajouter');
    if (ea) ea.onclick = function(){ EDIT_E = ''; dessiner(); szBrouillonProposer(); };
    var eo = document.getElementById('e-enregistrer');
    if (eo) eo.onclick = enregistrerEntree;
    var en = document.getElementById('e-annuler');
    /* ⚠ IMMEDIAT, valeurs prises MAINTENANT : le formulaire disparait a la ligne
       suivante. */
    if (en) en.onclick = function(){ szBrouillonMaintenant(); EDIT_E = null; dessiner(); };
    Array.prototype.forEach.call(corps.querySelectorAll('[data-e-mod]'), function(b){
      b.onclick = function(){ EDIT_E = b.getAttribute('data-e-mod'); dessiner(); szBrouillonProposer(); };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-e-jeter]'), function(b){
      b.onclick = function(){ jeter('banque:entree-jeter', b.getAttribute('data-e-jeter'), 'cette ligne du relevé'); };
    });

    var va = document.getElementById('v-ajouter');
    if (va) va.onclick = function(){ EDIT_V = ''; dessiner(); szBrouillonProposer(); };
    var vo = document.getElementById('v-enregistrer');
    if (vo) vo.onclick = enregistrerVersement;
    var vn = document.getElementById('v-annuler');
    if (vn) vn.onclick = function(){ EDIT_V = null; dessiner(); };
    Array.prototype.forEach.call(corps.querySelectorAll('[data-v-mod]'), function(b){
      b.onclick = function(){ EDIT_V = b.getAttribute('data-v-mod'); dessiner(); };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-v-jeter]'), function(b){
      b.onclick = function(){ jeter('banque:versement-jeter', b.getAttribute('data-v-jeter'), 'ce dépôt ou cette sortie'); };
    });
    var vs = document.getElementById('v-square');
    if (vs) vs.onclick = function(){ importer('square'); };
    var vd = document.getElementById('v-depenses');
    if (vd) vd.onclick = function(){ importer('depenses'); };

    Array.prototype.forEach.call(corps.querySelectorAll('[data-app]'), function(sel){
      sel.onchange = function(){
        if (!sel.value) return;
        agir('banque:apparier', [ANNEE, REC, sel.getAttribute('data-app'), sel.value], 'Apparié.');
      };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-desapp]'), function(b){
      b.onclick = function(){
        agir('banque:desapparier', [ANNEE, REC, b.getAttribute('data-desapp')], 'Appariement défait.');
      };
    });

    var no = document.getElementById('r-notes-ok');
    if (no) no.onclick = function(){
      var t = document.getElementById('r-notes');
      agir('banque:notes', [ANNEE, REC, t ? t.value : ''], 'Notes enregistrées.');
    };
    var cp = document.getElementById('r-completer');
    if (cp) cp.onclick = function(){
      dire('Vérification de l’écart…');
      appeler('banque:completer', [ANNEE, REC]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.equilibre
          ? 'Conciliation marquée complétée — l’écart est nul.'
          : 'L’écart n’est pas nul : le statut reste « en cours ».', r.equilibre ? 'bon' : 'att');
        charger();
      });
    };
    var vr = document.getElementById('r-verrouiller');
    if (vr) vr.onclick = function(){
      if (ARME !== 'verrou') {
        ARME = 'verrou'; dessiner();
        dire('Cliquez de nouveau pour verrouiller — la conciliation ne pourra plus jamais être modifiée.', 'att');
        return;
      }
      ARME = '';
      agir('banque:verrouiller', [ANNEE, REC], 'Conciliation verrouillée.');
    };
  }

  // ── Gestes ──────────────────────────────────────────────────────────────
  /* ⚠ UNE SUITE APPELEE SEULEMENT AU SUCCES, et elle repare un defaut plus ancien :
     les deux formulaires se refermaient (EDIT_E = null) AVANT de savoir si
     l'ecriture avait abouti. En cas d'echec, la saisie etait donc perdue et il ne
     restait qu'un message d'erreur. Avec le brouillon elle survit — a condition de
     ne le jeter QU'ICI. */
  function agir(op, args, mot, apres){
    dire('…');
    appeler(op, args).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      if (typeof apres === 'function') apres();
      dire(mot, 'bon');
      charger();
    });
  }
  function jeter(op, id, quoi){
    if (ARME !== id) {
      ARME = id; dessiner();
      dire('Cliquez « Confirmer ? » pour retirer ' + quoi + '. Un appariement lié sera défait.', 'att');
      return;
    }
    ARME = '';
    agir(op, [ANNEE, REC, id], 'Ligne retirée.');
  }
  function supprimer(id){
    if (ARME !== id) {
      ARME = id; dessinerListe();
      dire('Cliquez « Confirmer ? » pour supprimer cette conciliation. Les transactions bancaires, elles, restent intactes.', 'att');
      return;
    }
    ARME = '';
    dire('Suppression…');
    appeler('banque:supprimer', [ANNEE, id]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Conciliation supprimée.', 'bon');
      charger();
    });
  }
  function creer(){
    // ⚠ Aucun prompt() : l ancien ecran en posait un, et une boite du systeme
    // bloque le processus. Le nom se corrige de toute facon en deux clics.
    var nom = 'Conciliation ' + new Date().toLocaleDateString('fr-CA');
    dire('Création…');
    appeler('banque:creer', [ANNEE, nom]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      REC = r.id; VUE = 'releve';
      dire('Conciliation créée.', 'bon');
      charger();
    });
  }
  function enregistrerEntree(){
    var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    /* Le brouillon est mis a jour AVANT que le formulaire ne se referme : sans
       cela, enregistrer moins de trois secondes apres la derniere frappe laisserait
       un brouillon perime derriere, si l'ecriture echouait. */
    szBrouillonMaintenant();
    agir('banque:entree', [ANNEE, REC, EDIT_E || '', {
      date: g('e-date'), description: g('e-desc'), type: g('e-type'),
      amount: g('e-mnt'), notes: g('e-notes')
    }], 'Ligne enregistrée.', szBrouillonJeter);
    EDIT_E = null;
  }
  function enregistrerVersement(){
    var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    szBrouillonMaintenant();
    agir('banque:versement', [ANNEE, REC, EDIT_V || '', {
      arrivalDate: g('v-date'), periodFrom: g('v-du'), periodTo: g('v-au'),
      amount: g('v-mnt'), description: g('v-desc'), notes: g('v-notes')
    }], 'Ligne enregistrée.', szBrouillonJeter);
    EDIT_V = null;
  }
  function importer(quoi){
    dire('Import…');
    appeler('banque:importer', [ANNEE, REC, quoi]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire(r.ajoutes
        ? (r.ajoutes + ' ligne' + (r.ajoutes > 1 ? 's' : '') + ' importée' + (r.ajoutes > 1 ? 's' : '') + '.')
        : 'Rien de neuf à importer — tout y était déjà.', r.ajoutes ? 'bon' : 'att');
      charger();
    });
  }
  /* ⚠ PATRON << FENETRE PILOTE >> : le rapport et l archive sont composes par le
     SITE, dans la fenetre principale. Les redessiner ici, ce serait ecrire deux
     fois le meme document comptable — et deux qui divergent, c est une piece
     fausse. */
  function document_(quoi){
    dire('Préparation du document…');
    appeler('banque:document', [ANNEE, REC, quoi]).then(function(r){
      dire(r.ok ? 'Document préparé dans la fenêtre principale.' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  function charger(){
    appeler('banque:donnees', [{ annee: ANNEE || undefined, id: REC || undefined }]).then(function(r){
      if (!r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r;
      ANNEE = r.annee;
      if (REC && !r.rec) { REC = ''; }
      sous.textContent = (r.liste || []).length + ' conciliation'
        + ((r.liste || []).length > 1 ? 's' : '') + ' · ' + ANNEE
        + (r.peutEcrire ? '' : ' · lecture seule');
      // L etat d ouverture : on ouvre le PREMIER rapprochement sur l onglet
      // demande. Sans lui, aucun jeu d essai ne dessinerait jamais les trois
      // autres onglets — ils ne s atteignent qu au clic.
      if (DEPART && !REC && (r.liste || []).length) {
        REC = r.liste[0].id;
        VUE = DEPART;
        DEPART = '';
        charger();
        return;
      }
      dessiner();
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageBanque };
