'use strict';

/*
 * FENÊTRE « GESTION DES TAXES » — NATIVE (Configuration, palier 5, 6e onglet)
 * =============================================================================
 * Les taux perçus par province de livraison, et par pays pour l'international.
 * Aucun secret — mais c'est la grille qui décide de ce que la cliente PAIE.
 *
 * ⚠ AUCUNE RÈGLE FISCALE ICI. Ni les taux de référence, ni l'ordre des
 * provinces, ni la comparaison : tout vient de `config:taxes:donnees`. La
 * fenêtre ne fait que montrer et transmettre.
 *
 * ⚠ LE REFUS DE CONCURRENCE SE DIT, ET LA VRAIE GRILLE REVIENT. Si quelqu'un
 * d'autre a modifié les taux pendant la saisie, le cœur refuse ET renvoie la
 * grille courante : on redessine avec elle. Annoncer « enregistré » alors que
 * rien ne l'est serait le pire des verdicts sur cet écran-la.
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
.tete .rev{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:#f0d6a0;border-radius:9px;
  padding:.5rem .7rem;font-size:.78rem}
/* ⚠ Corps en COLONNE : une carte pleine largeur dans une grille auto-fit
   empeche les autres de se replier (voir icones.js). */
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:1rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:1rem 1.1rem;min-width:0}
.carte h2{margin:0 0 .2rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8}
.carte .sous{margin:0 0 .9rem;font-size:.78rem;color:#6d7f96}
.avis{border-radius:9px;padding:.5rem .7rem;font-size:.78rem;margin:0 0 .9rem;
  border:1px solid rgba(240,180,80,.3);background:rgba(200,140,40,.09);color:#f0d6a0}
.avis.calme{border-color:rgba(120,160,220,.28);background:rgba(80,120,190,.1);color:#bcd2f0}
table{width:100%;border-collapse:collapse;font-size:.86rem}
th{text-align:left;padding:.35rem .5rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;border-bottom:1px solid rgba(255,255,255,.12)}
td{padding:.4rem .5rem;border-bottom:1px solid rgba(255,255,255,.05);vertical-align:middle}
tr:last-child td{border-bottom:none}
td.prov{font-weight:700;white-space:nowrap;width:13rem}
td.prov .n{font-weight:400;color:#6d7f96;font-size:.75rem}
td.dr{text-align:right;white-space:nowrap}
.comp{display:inline-flex;align-items:center;gap:.3rem;margin:.15rem .8rem .15rem 0}
.comp .org{font-size:.7rem;color:#6d7f96}
input[type=text],input[type=number]{font:inherit;color:#e8edf5;background:#0f1724;
  border:1px solid #2b3444;border-radius:7px;padding:.25rem .4rem}
input[type=text]:focus,input[type=number]:focus{outline:none;border-color:#c9a97e}
input:disabled{opacity:.55}
.nom{width:5.5rem}
.taux{width:5.5rem;text-align:right}
.cc{width:5rem;text-transform:uppercase}
.gestes{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.9rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.4rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
button.pt{font-size:.76rem;padding:.22rem .5rem}
button.dgr{color:#f87171;border-color:rgba(248,113,113,.4)}
.vide{padding:1rem .6rem;text-align:center;color:#8fa1b8;font-size:.82rem}
/* Les ecarts avec la reference. */
.ec td{font-size:.83rem}
.ec .av{color:#f87171;text-align:right;white-space:nowrap}
.ec .ap{color:#4ade80;font-weight:700;text-align:right;white-space:nowrap}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* ⚠ L ETAT D OUVERTURE EST UN PARAMETRE. Le panneau de comparaison et la ligne
   d ajout d un pays ne s atteignent qu au CLIC : sans cela, aucun jeu d essai ne
   les dessine et ils resteraient hors du garde-fou. */
function pageTaxes(ouverture) {
  const o = String(ouverture || '');
  const ecartsDepart = o === 'ecarts' ? 'true' : 'false';
  const ajoutDepart = o === 'pays' ? 'true' : 'false';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Gestion des taxes — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">💰</span><h1>Gestion des taxes</h1>
  <span class="rev" id="rev"></span></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter les taux, pas les modifier.</div>
<div class="corps" id="corps"><div class="carte"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button id="b-verifier">Comparer à la référence</button>
  <button class="prim" id="b-save" disabled>Enregistrer les taux</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var rev = document.getElementById('rev');
  var bsave = document.getElementById('b-save');
  var bver = document.getElementById('b-verifier');
  var D = null, RO = false, OCCUPE = false, AJOUT = ${ajoutDepart}, ECARTS = ${ecartsDepart};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule : les taux ne peuvent pas être modifiés.',
    pays_requis:        'Code de pays requis (deux lettres, par exemple US).',
    taux_invalide:      'Ce taux n’est pas un nombre valide.',
    introuvable:        'Ce pays n’est plus dans la grille.',
    indisponible:       'La configuration n’est pas prête dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    nuage:              'Taux NON enregistrés. Rien n’a été modifié — réessayez.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    if (m === 'concurrence') {
      return 'Taux NON enregistrés : la grille a changé'
        + (r.par ? ' par ' + esc(r.par) : '')
        + (r.le ? ' (révision du ' + esc(r.le) + ')' : '')
        + ' pendant votre saisie. La grille affichée vient d’être rechargée — refaites vos changements.';
    }
    return (MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').'))
      + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  function champNom(cle, i, val){
    return '<input type="text" class="nom" data-c="' + esc(cle) + '" data-i="' + i
      + '" data-f="name" value="' + esc(val) + '"' + (RO ? ' disabled' : '') + '>';
  }
  function champTaux(cle, i, val){
    return '<input type="number" step="0.001" min="0" class="taux" data-c="' + esc(cle) + '" data-i="' + i
      + '" data-f="pct" value="' + esc(val == null ? '' : val) + '"' + (RO ? ' disabled' : '') + '>';
  }

  function dessiner(){
    var av = document.getElementById('ro');
    if (av) av.hidden = !RO;
    var d = D || {};
    rev.textContent = d.lastReviewed
      ? ('Dernière révision : ' + d.lastReviewed + (d.updatedBy ? ' · ' + d.updatedBy : '')) : '';
    var h = [];

    // ── Canada ─────────────────────────────────────────────────────────────
    h.push('<div class="carte"><h2>Canada — par province de livraison</h2>');
    h.push('<div class="avis">Les taux sont appliqués selon la province de <strong>livraison</strong> '
      + 'de chaque commande. Confirmez-les avec votre comptable, ainsi que les inscriptions requises.</div>');
    h.push('<table><thead><tr><th>Province ou territoire</th><th>Composantes — nom, taux, organisme</th></tr></thead><tbody>');
    (d.provinces || []).forEach(function(p){
      h.push('<tr><td class="prov">' + esc(p.code) + '<div class="n">' + esc(p.nom) + '</div></td><td>');
      if (!p.composantes.length) h.push('<span style="color:#6d7f96">—</span>');
      p.composantes.forEach(function(c, i){
        h.push('<span class="comp">' + champNom('ca:' + p.code, i, c.name) + champTaux('ca:' + p.code, i, c.pct)
          + '<span class="org">% · remis à ' + esc(c.remitTo || '—') + '</span></span>');
      });
      h.push('</td></tr>');
    });
    h.push('</tbody></table>');
    h.push('<div class="gestes"><button id="b-reinit"' + (RO ? ' disabled' : '') + '>Réinitialiser aux défauts</button></div>');
    h.push('</div>');

    // ── Écarts avec la référence (seulement si on a demandé la comparaison) ──
    if (ECARTS) {
      var ec = d.ecarts || [];
      h.push('<div class="carte"><h2>Comparaison aux taux de référence</h2>');
      if (!ec.length) {
        h.push('<div class="vide">Vos taux correspondent à la référence.</div>');
      } else {
        h.push('<div class="avis">Appliquer remplace les composantes canadiennes par les taux de référence. '
          + 'N’appliquez pas si vous avez ajusté un taux selon vos inscriptions.</div>');
        h.push('<table class="ec"><thead><tr><th>Prov.</th><th>Taxe</th><th style="text-align:right">Vos taux</th>'
          + '<th style="text-align:right">Référence</th></tr></thead><tbody>');
        ec.forEach(function(x){
          h.push('<tr><td style="font-weight:700">' + esc(x.prov) + '</td><td>' + esc(x.nom)
            + ' <span style="color:#6d7f96">(' + esc(x.code) + ')</span></td>'
            + '<td class="av">' + (x.actuel == null ? 'absent' : x.actuel + ' %') + '</td>'
            + '<td class="ap">' + (x.reference == null ? 'à retirer' : x.reference + ' %') + '</td></tr>');
        });
        h.push('</tbody></table>');
        h.push('<div class="gestes"><button class="prim" id="b-appliquer"' + (RO ? ' disabled' : '')
          + '>Appliquer la référence</button><button id="b-fermer-ecarts">Fermer</button></div>');
      }
      h.push('</div>');
    }

    // ── International ──────────────────────────────────────────────────────
    h.push('<div class="carte"><h2>International — par pays</h2>');
    h.push('<div class="avis' + (d.intlLivraison ? '' : ' calme') + '">'
      + (d.intlLivraison ? 'Livraison internationale activée. ' : 'Livraison internationale désactivée : cette section ne s’applique que si vous l’activez. ')
      + 'Une commande hors Canada est <strong>détaxée</strong> par défaut. N’ajoutez un pays que si vous y êtes '
      + 'inscrit pour percevoir une taxe.</div>');
    h.push('<table><thead><tr><th style="width:9rem">Pays</th><th>Taxes — nom et taux</th>'
      + '<th style="width:8rem"></th></tr></thead><tbody>');
    if (AJOUT) {
      h.push('<tr><td><input type="text" class="cc" id="a-cc" placeholder="US"></td>'
        + '<td><input type="text" class="nom" id="a-nom" placeholder="TVA" style="width:9rem"> '
        + '<input type="number" step="0.001" min="0" class="taux" id="a-pct" placeholder="20"> %</td>'
        + '<td class="dr"><button class="pt prim" id="b-ajout-ok">Ajouter</button> '
        + '<button class="pt" id="b-ajout-non">Annuler</button></td></tr>');
    }
    var intl = d.international || [];
    if (!intl.length && !AJOUT) {
      h.push('<tr><td colspan="3" class="vide">Aucun pays configuré.</td></tr>');
    }
    intl.forEach(function(p){
      h.push('<tr><td style="font-weight:700">' + esc(p.cc) + '</td><td>');
      p.composantes.forEach(function(c, i){
        h.push('<span class="comp">' + champNom('in:' + p.cc, i, c.name) + champTaux('in:' + p.cc, i, c.pct) + '<span class="org">%</span></span>');
      });
      h.push('</td><td class="dr"><button class="pt dgr" data-oter="' + esc(p.cc) + '"'
        + (RO ? ' disabled' : '') + '>Retirer</button></td></tr>');
    });
    h.push('</tbody></table>');
    if (!AJOUT) h.push('<div class="gestes"><button id="b-ajout"' + (RO ? ' disabled' : '') + '>+ Ajouter un pays</button></div>');
    h.push('</div>');

    corps.innerHTML = h.join('');
    brancher();
    bsave.disabled = RO || OCCUPE;
  }

  function sur(id, gest){ var e = document.getElementById(id); if (e) e.onclick = gest; }
  function brancher(){
    sur('b-reinit', reinit);
    sur('b-appliquer', appliquer);
    sur('b-fermer-ecarts', function(){ ECARTS = false; dessiner(); });
    sur('b-ajout', function(){ AJOUT = true; dessiner();
      var e = document.getElementById('a-cc'); if (e) e.focus(); });
    sur('b-ajout-non', function(){ AJOUT = false; dessiner(); });
    sur('b-ajout-ok', ajouterPays);
    var n = corps.querySelectorAll('[data-oter]');
    for (var i = 0; i < n.length; i++) n[i].onclick = function(e){ oterPays(e.currentTarget.getAttribute('data-oter')); };
  }

  // Simple LECTEUR de la grille : la regle d ecriture vit au coeur.
  function lire(){
    var canada = {}, international = {};
    var ch = corps.querySelectorAll('[data-c]');
    for (var k = 0; k < ch.length; k++) {
      var el = ch[k];
      var cle = el.getAttribute('data-c') || '';
      var i = parseInt(el.getAttribute('data-i'), 10);
      var f = el.getAttribute('data-f');
      if (isNaN(i)) continue;
      var cible = cle.indexOf('ca:') === 0 ? canada : international;
      var nom = cle.slice(3);
      if (!cible[nom]) cible[nom] = [];
      if (!cible[nom][i]) cible[nom][i] = {};
      cible[nom][i][f] = el.value;
    }
    return { canada: canada, international: international };
  }

  function occuper(o){
    OCCUPE = o;
    bsave.disabled = o || RO;
    bver.disabled = o;
  }
  // ⚠ TOUT verdict passe par ici : reussite comme refus rendent la grille
  // COURANTE, et c est elle qu on redessine.
  function verdict(r, okMsg){
    occuper(false);
    if (r && r.ok) {
      D = r; RO = !r.peutModifier;
      dessiner();
      dire(okMsg, 'bon');
      return;
    }
    if (r && r.motif === 'concurrence') {
      D = r; RO = !r.peutModifier;
      AJOUT = false;
      dessiner();
      dire(expliquer(r), 'err');
      return;
    }
    dire(expliquer(r), 'err');
  }

  function enregistrer(){
    if (RO || OCCUPE) return;
    occuper(true); dire('Enregistrement…');
    appeler('config:taxes:ecrire', [lire()]).then(function(r){ verdict(r, 'Taux enregistrés.'); });
  }
  bsave.onclick = enregistrer;

  function reinit(){
    if (RO || OCCUPE) return;
    occuper(true); dire('Réinitialisation…');
    appeler('config:taxes:reinit').then(function(r){ verdict(r, 'Taux réinitialisés aux valeurs par défaut.'); });
  }
  function appliquer(){
    if (RO || OCCUPE) return;
    occuper(true); dire('Application de la référence…');
    appeler('config:taxes:reference').then(function(r){ ECARTS = false; verdict(r, 'Taux mis à jour selon la référence.'); });
  }
  bver.onclick = function(){
    if (OCCUPE) return;
    var ec = (D && D.ecarts) || [];
    if (ec.length) { ECARTS = true; dessiner(); dire(ec.length + ' écart' + (ec.length > 1 ? 's' : '') + ' avec la référence.', 'att'); return; }
    if (RO) { dire('Vos taux correspondent à la référence.', 'bon'); return; }
    occuper(true); dire('Marquage de la révision…');
    appeler('config:taxes:revision').then(function(r){ verdict(r, 'Vos taux correspondent à la référence. Date de révision actualisée.'); });
  };
  function ajouterPays(){
    if (RO || OCCUPE) return;
    var cc = (document.getElementById('a-cc') || {}).value || '';
    var nom = (document.getElementById('a-nom') || {}).value || '';
    var pct = (document.getElementById('a-pct') || {}).value || '';
    occuper(true); dire('Ajout du pays…');
    appeler('config:taxes:pays', [{ cc: cc, nom: nom, pct: pct }]).then(function(r){
      if (r && r.ok) AJOUT = false;
      verdict(r, 'Pays ajouté.');
    });
  }
  function oterPays(cc){
    if (RO || OCCUPE) return;
    occuper(true); dire('Retrait…');
    appeler('config:taxes:paysoter', [cc]).then(function(r){ verdict(r, 'Pays ' + cc + ' retiré.'); });
  }

  function charger(){
    dire('Lecture…');
    appeler('config:taxes:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r;
      RO = !r.peutModifier;
      dessiner();
      dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageTaxes };
