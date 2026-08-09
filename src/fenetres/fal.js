'use strict';

/*
 * FENÊTRE « CONSOMMATION FAL.AI » — NATIVE
 * =============================================================================
 * Ce que les traitements d'image ont coûté, et ce qu'ils ont fait. Deux vues :
 * la CONSOMMATION (par modèle, par jour) et l'HISTORIQUE (chaque appel).
 *
 * ⚠⚠ CE QUE CET ÉCRAN NE MONTRE PAS, ET POURQUOI. Il n'affiche pas le SOLDE du
 * compte fal.ai : leur service n'expose aucune interface publique qui le donne.
 * On pourrait soustraire notre consommation d'un montant saisi à la main — et ce
 * chiffre dériverait au premier achat de crédit fait ailleurs, sans que personne
 * pense à le vérifier. Un solde faux est pire qu'un solde absent : on s'y fie.
 * L'écran renvoie donc au tableau de bord de fal.ai pour le solde, et ne promet
 * que ce qu'il tient : la consommation, elle, est mesurée — chaque appel passe
 * par notre relais.
 *
 * ⚠ ET IL DIT QUELLE PART DU COÛT EST MESURÉE. Fal.ai ne renvoie pas toujours le
 * prix d'un appel ; quand il ne le fait pas, on prend une estimation par modèle.
 * Présenter l'addition sans distinguer les deux, ce serait donner une facture
 * là où l'on n'a qu'un ordre de grandeur.
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
.onglets{flex:0 0 auto;display:flex;gap:.3rem;padding:.5rem 1.05rem 0;
  border-bottom:1px solid rgba(255,255,255,.08)}
.onglets button{background:none;border:0;border-bottom:2px solid transparent;color:#8fa1b8;
  font:600 .82rem/1 system-ui;padding:.45rem .7rem;cursor:pointer;border-radius:0}
.onglets button.on{color:#e8edf5;border-bottom-color:#c9a97e}
.corps{flex:1 1 auto;min-height:0;padding:.85rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.75rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.8rem .9rem}
.carte h2{margin:0 0 .55rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.34rem .6rem;cursor:pointer}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:focus{outline:none;border-color:#c9a97e}
button.mini{font-size:.72rem;padding:.16rem .45rem}
select{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .5rem}
.barreoutils{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center}
.tuiles{display:flex;gap:.6rem;flex-wrap:wrap}
.t{flex:1 1 8rem;background:#16202f;border:1px solid rgba(255,255,255,.07);
  border-radius:11px;padding:.6rem .75rem}
.t .n{font:800 1.5rem/1.1 Georgia,serif;font-variant-numeric:tabular-nums}
.t .l{font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8;font-weight:700}
.t .s{font-size:.7rem;color:#8fa1b8;margin-top:.15rem}
table{width:100%;border-collapse:collapse;font-size:.79rem}
thead th{text-align:left;padding:.22rem .35rem;font-size:.65rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.3rem .35rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:top}
tbody tr:hover td{background:rgba(255,255,255,.03)}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.dt{font-size:.7rem;color:#8fa1b8}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.74rem}
.pill{display:inline-block;font-size:.64rem;padding:.05rem .45rem;border-radius:99px;
  white-space:nowrap;font-weight:700}
.pill.ok{background:rgba(34,197,94,.15);color:#4ade80}
.pill.non{background:rgba(248,113,113,.15);color:#fca5a5}
.pill.g{background:rgba(148,163,184,.14);color:#94a3b8;font-weight:600}
/* La barre des jours : un dessin vaut mieux qu une colonne de nombres pour
   reperer une derive avant la facture. */
.jours{display:flex;align-items:flex-end;gap:2px;height:4.5rem;padding-top:.3rem}
.jours .b{flex:1 1 auto;min-width:3px;background:rgba(201,169,126,.55);border-radius:2px 2px 0 0}
.jours .b:hover{background:#c9a97e}
.vide{padding:1.1rem .6rem;text-align:center;color:#8fa1b8;font-size:.82rem}
/* L avertissement d honnetete : ni replie, ni en gris pale. Il doit se lire. */
.franc{border:1px solid rgba(240,180,80,.35);background:rgba(200,140,40,.1);
  color:#f0d6a0;border-radius:9px;padding:.55rem .75rem;font-size:.76rem;line-height:1.5}
.franc b{color:#fbe3b0}
.franc a{color:#f0d6a0}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** @param {string} ouverture '' (consommation) ou 'historique' */
function pageFal(ouverture) {
  const dep = JSON.stringify(String(ouverture || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Consommation Fal.ai — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🧠</span><h1>Traitements d’image</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets">
  <button id="o-conso" class="on">Consommation</button>
  <button id="o-hist">Historique</button>
</div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var sous  = document.getElementById('sous');
  var VUE = ${dep} === 'historique' ? 'hist' : 'conso';
  var D = null;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    echec:              'La lecture a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
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

  var GESTES = {
    detourage: 'Détourage', fantome: 'Mannequin retiré',
    humain: 'Porté par un mannequin', essayage: 'Essayage virtuel'
  };
  function sous_(v){
    var n = Number(v) || 0;
    return (n < 1 ? n.toFixed(3) : n.toFixed(2)).replace('.', ',') + ' $ US';
  }
  function quand(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return esc(iso);
    return d.toLocaleString('fr-CA', { dateStyle: 'medium', timeStyle: 'short' });
  }
  function duree(ms){
    var n = Number(ms) || 0;
    return n >= 1000 ? (Math.round(n / 100) / 10).toString().replace('.', ',') + ' s' : n + ' ms';
  }

  /* ⚠ LE BLOC QUI DIT CE QU ON NE SAIT PAS. Il est en haut, pas en bas : la
     premiere question qu on se pose devant cet ecran est << combien me
     reste-t-il >>, et la reponse honnete est << pas ici >>. */
  function franchise(){
    var reels = (D.coutsReels || 0), tot = (D.appels || 0);
    var part = tot ? Math.round(reels * 100 / tot) : 0;
    return '<div class="franc">'
      + '<b>Le solde du compte n’est pas affiché ici, et ce n’est pas un oubli.</b> '
      + 'Fal.ai n’expose aucune interface publique qui le donne. Le calculer en '
      + 'soustrayant cette consommation d’un montant saisi à la main dériverait au '
      + 'premier achat de crédit fait ailleurs, sans que personne pense à le '
      + 'vérifier. Le solde se lit sur '
      + '<a href="' + esc(D.tableauDeBord || 'https://fal.ai/dashboard/billing') + '" target="_blank">'
      + 'le tableau de bord de Fal.ai</a>.<br>'
      + 'Ce qui est montré ici est <b>mesuré</b>&nbsp;: chaque appel passe par notre relais. '
      + (tot
          ? ('Sur ' + tot + ' appel' + (tot > 1 ? 's' : '') + ', <b>' + part + '&nbsp;%</b> '
             + 'portent le prix rendu par Fal.ai&nbsp;; les autres sont une estimation par modèle.')
          : '')
      + '</div>';
  }

  // ── CONSOMMATION ────────────────────────────────────────────────────────
  function vueConso(){
    var h = [];
    h.push('<div class="barreoutils"><span class="droite">'
      + '<button id="b-recharger">Recharger</button></span></div>');
    h.push(franchise());

    var reussis = 0;
    (D.parModele || []).forEach(function(m){ reussis += m.reussis; });
    var echecs = (D.appels || 0) - reussis;

    h.push('<div class="tuiles">'
      + '<div class="t"><div class="l">Consommation totale</div><div class="n">' + sous_(D.total) + '</div>'
      + '<div class="s">depuis le début du suivi</div></div>'
      + '<div class="t"><div class="l">Appels</div><div class="n">' + (D.appels || 0) + '</div>'
      + '<div class="s">' + reussis + ' réussis · ' + echecs + ' en échec</div></div>'
      + '<div class="t"><div class="l">Coût moyen</div><div class="n">'
      + sous_((D.appels ? (D.total / D.appels) : 0)) + '</div>'
      + '<div class="s">par appel</div></div>'
      + '</div>');

    // Les trente derniers jours
    var j = (D.parJour || []).slice().reverse();
    if (j.length) {
      var max = 0;
      j.forEach(function(x){ if (x.cout > max) max = x.cout; });
      h.push('<div class="carte"><h2>Trente derniers jours</h2><div class="jours">'
        + j.map(function(x){
            var ht = max ? Math.max(3, Math.round(x.cout * 100 / max)) : 3;
            return '<div class="b" style="height:' + ht + '%" title="' + esc(x.jour) + ' · '
              + x.appels + ' appel(s) · ' + sous_(x.cout) + '"></div>';
          }).join('')
        + '</div><p class="dt">Du ' + esc(j[0].jour) + ' au ' + esc(j[j.length - 1].jour)
        + '. Survolez une barre pour le détail du jour.</p></div>');
    }

    h.push('<div class="carte"><h2>Par traitement</h2>');
    if (!(D.parModele || []).length) {
      h.push('<div class="vide">Aucun traitement n’a encore été lancé.</div>');
    } else {
      h.push('<table><thead><tr><th>Traitement</th><th>Modèle</th><th class="num">Appels</th>'
        + '<th class="num">Réussis</th><th class="num">Coût</th><th class="num">Unitaire</th>'
        + '<th>Prix</th></tr></thead><tbody>');
      D.parModele.forEach(function(m){
        var mesure = m.coutsReels >= m.appels;
        h.push('<tr>'
          + '<td>' + esc(GESTES[m.geste] || m.geste || '—') + '</td>'
          + '<td class="mono">' + esc(m.modele) + '</td>'
          + '<td class="num">' + m.appels + '</td>'
          + '<td class="num">' + m.reussis + '</td>'
          + '<td class="num">' + sous_(m.cout) + '</td>'
          + '<td class="num">' + sous_(m.appels ? (m.cout / m.appels) : 0) + '</td>'
          + '<td><span class="pill ' + (mesure ? 'ok' : 'g') + '">'
          + (mesure ? 'mesuré' : (m.coutsReels ? 'partiel' : 'estimé')) + '</span></td>'
          + '</tr>');
      });
      h.push('</tbody></table>');
    }
    h.push('</div>');
    return h.join('');
  }

  // ── HISTORIQUE ──────────────────────────────────────────────────────────
  function vueHist(){
    var h = [];
    h.push('<div class="barreoutils"><span class="droite">'
      + '<button id="b-recharger">Recharger</button></span></div>');
    h.push('<div class="carte"><h2>Cinq cents derniers appels</h2>');
    if (!(D.evenements || []).length) {
      h.push('<div class="vide">Aucun appel enregistré.</div>');
    } else {
      h.push('<table><thead><tr><th>Quand</th><th>Traitement</th><th>Modèle</th>'
        + '<th>Par</th><th class="num">Durée</th><th class="num">Coût</th>'
        + '<th>État</th></tr></thead><tbody>');
      D.evenements.forEach(function(e){
        h.push('<tr>'
          + '<td class="dt" style="white-space:nowrap">' + quand(e.au) + '</td>'
          + '<td>' + esc(GESTES[e.geste] || e.geste || '—') + '</td>'
          + '<td class="mono">' + esc(e.modele) + '</td>'
          + '<td class="dt">' + esc(e.qui || '—') + '</td>'
          + '<td class="num">' + duree(e.ms) + '</td>'
          + '<td class="num">' + sous_(e.cout) + (e.coutReel ? '' : ' <span class="dt">est.</span>') + '</td>'
          + '<td>' + (e.ok
              ? '<span class="pill ok">réussi</span>'
              : '<span class="pill non">échec</span>') + '</td>'
          + '</tr>'
          // ⚠ LE MESSAGE D ERREUR EST RENDU TEL QUEL. << echec >> tout court
          // n aide personne ; << credit epuise >> ou << cle invalide >> se
          // reglent en une minute.
          + (e.ok || !e.erreur ? ''
              : '<tr><td></td><td colspan="6" class="dt" style="color:#fca5a5">'
                + esc(e.erreur) + '</td></tr>'));
      });
      h.push('</tbody></table>');
    }
    h.push('</div>');
    return h.join('');
  }

  function dessiner(){
    document.getElementById('o-conso').classList.toggle('on', VUE === 'conso');
    document.getElementById('o-hist').classList.toggle('on', VUE === 'hist');
    corps.innerHTML = (VUE === 'hist') ? vueHist() : vueConso();
    var b = document.getElementById('b-recharger');
    if (b) b.onclick = function(){ charger(true); };
  }

  document.getElementById('o-conso').onclick = function(){ VUE = 'conso'; charger(false); };
  document.getElementById('o-hist').onclick = function(){ VUE = 'hist'; charger(false); };

  function charger(dit){
    if (dit) dire('Lecture…');
    appeler('fal:suivi', [VUE === 'hist' ? 'journal' : 'resume']).then(function(r){
      if (!r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r;
      sous.textContent = (D.appels || 0) + ' appel' + ((D.appels || 0) > 1 ? 's' : '')
        + ' · ' + sous_(D.total);
      dessiner();
      if (dit) dire('');
    });
  }

  charger(true);
})();
</script></body></html>`;
}

module.exports = { pageFal };
