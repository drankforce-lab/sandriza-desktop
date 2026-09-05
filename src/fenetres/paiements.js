'use strict';

/*
 * FENÊTRE « PAIEMENTS SQUARE » — NATIVE (1.62.0, palier 4)
 * =============================================================================
 * Deux onglets : TRANSACTIONS (les encaissements et les remboursements de
 * l'année, avec les quatre tuiles) et RÉCONCILIATION (la comparaison entre le
 * système et Square, avec le verdict d'équilibre). Le choix de l'année vit ici.
 *
 * ⚠ LIRE ET CHARGER SONT DEUX GESTES. `paiements:lire` sert ce qui est en cache
 * — instantané, jamais de réseau. `paiements:charger` va chez Square : ça prend
 * du temps et ça peut échouer, donc c'est DEMANDÉ, et le bouton dit ce qu'il
 * fait (« Charger » quand rien n'est en cache, « Actualiser » ensuite).
 *
 * ⚠ MASQUER DES TRANSACTIONS EST RÉSERVÉ AU BAC À SABLE. Masquer un
 * encaissement réel fausserait le revenu, donc la conciliation, donc les
 * chiffres remis au comptable. Les boutons disparaissent en production — et le
 * cœur du site refuse de toute façon.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

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
select,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:.5rem .65rem}
.tuile.bon{border-color:rgba(34,197,94,.4)}
.tuile.err{border-color:rgba(239,68,68,.4)}
.tuile.att{border-color:rgba(245,158,11,.45)}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:var(--tx-ok)}.tuile .val.att{color:var(--tx-att)}.tuile .val.err{color:var(--tx-err)}
.tuile .sub{font-size:.66rem;color:var(--tx2);margin-top:.1rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:var(--tx2);font-weight:700}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.3rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
.num{font-family:'Courier New',monospace;text-align:right;white-space:nowrap}
.ref{font-family:'Courier New',monospace;font-size:.72rem;color:var(--tx2)}
.tot{font-weight:800;border-top:2px solid var(--v16)!important;background:var(--v03)}
.err{color:var(--tx-err)}.bon{color:var(--tx-ok)}.att{color:var(--tx-att)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.avis{font-size:.78rem;line-height:1.5;border-radius:9px;padding:.55rem .7rem}
.avis.bon{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.35)}
.avis.att{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.4)}
.vide{padding:1.4rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.vide .gros{font-size:1.4rem;margin-bottom:.4rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Paiements Square ». */
function pagePaiements() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Paiements Square — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.payments}</span><h1>Paiements Square</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var ONGLET = 'transactions';   // transactions | reconciliation
  var ANNEE = 0;                 // 0 = celle que le site propose
  var OCCUPE = false;            // une requete Square est en cours

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function fmt(n){
    try { return (Number(n) || 0).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }); }
    catch (e) { return (Number(n) || 0).toFixed(2) + ' $'; }
  }
  function signe(n){ return (Number(n) >= 0 ? '+' : '') + fmt(n); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux paiements.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    non_configure:      'La connexion Square n’est pas configurée (Configuration → Paiement).',
    production:         'Réservé au bac à sable — on ne masque pas des paiements réels.',
    rien_en_cache:      'Aucune transaction en mémoire à masquer.',
    square:             'Square n’a pas répondu.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
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

  function tuile(lbl, val, ton, sub){
    return '<div class="tuile' + (ton ? ' ' + ton : '') + '"><div class="lbl">' + lbl + '</div>'
      + '<div class="val' + (ton ? ' ' + ton : '') + '">' + val + '</div>'
      + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>';
  }

  function barre(){
    var h = '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'transactions' ? ' actif' : '') + '" data-onglet="transactions">Transactions</button>'
      + '<button class="mini' + (ONGLET === 'reconciliation' ? ' actif' : '') + '" data-onglet="reconciliation">Réconciliation</button>'
      + '<select id="p-annee" title="Année">'
      + (D.annees || []).map(function(a){
          return '<option value="' + a + '"' + (a === D.annee ? ' selected' : '') + '>' + a + '</option>';
        }).join('')
      + '</select>'
      + '<div class="droite">';
    if (D.bacASable && D.masquees) {
      h += '<button class="mini" id="p-reafficher" title="Réafficher les transactions masquées (bac à sable seulement)">↺ Réafficher (' + D.masquees + ')</button>';
    }
    if (D.bacASable && D.charge && D.tuiles && D.tuiles.nb > 0) {
      h += '<button class="mini danger" id="p-masquer" title="Masquer ces transactions d’essai — bac à sable seulement">Masquer tout</button>';
    }
    h += '<button class="mini prim" id="p-charger"' + (OCCUPE ? ' disabled' : '') + '>'
      + (OCCUPE ? 'Lecture chez Square…' : (D.charge ? '↻ Actualiser' : '⬇ Charger les transactions'))
      + '</button>';
    h += '</div></div>';
    return h;
  }

  function vueTransactions(){
    var h = '';
    var t = D.tuiles;
    if (t) {
      h += '<div class="tuiles">'
        + tuile('Transactions', String(t.nb), '', 'complétées · ' + D.annee)
        + tuile('Revenu brut', fmt(t.brut), '', 'avant frais')
        + tuile('Frais Square', fmt(t.frais), 'err',
            t.fraisRecuperes > 0 ? ('dont ' + fmt(t.fraisRecuperes) + ' récupérés · nets ' + fmt(t.fraisNets)) : 'déductibles d’impôt')
        + tuile('Revenu net', fmt(t.net), 'bon', 'après remb. et frais nets')
        + '</div>';
    }

    h += '<div class="carte"><h2>Transactions — ' + D.annee + '</h2>';
    if (!D.paiements.length) {
      h += '<div class="vide">Aucune transaction pour ' + D.annee + '.</div>';
    } else {
      h += '<table><thead><tr><th>Date</th><th>Réf. Square</th><th>Mode de paiement</th>'
        + '<th class="num">Brut</th><th class="num">Frais</th><th class="num">Net reçu</th></tr></thead><tbody>'
        + D.paiements.map(function(p){
            return '<tr><td style="white-space:nowrap">' + esc(p.date) + '</td>'
              + '<td class="ref">' + esc(p.ref) + '</td>'
              + '<td>' + esc(p.moyen) + '</td>'
              + '<td class="num">' + fmt(p.brut) + '</td>'
              + '<td class="num err">' + (p.frais > 0 ? '−' + fmt(p.frais) : '—') + '</td>'
              + '<td class="num bon">' + fmt(p.net) + '</td></tr>';
          }).join('')
        + '<tr class="tot"><td colspan="3">Total ' + D.annee + '</td>'
        + '<td class="num">' + fmt(t.brut) + '</td>'
        + '<td class="num err">−' + fmt(t.frais) + '</td>'
        + '<td class="num bon">' + fmt(t.net + t.rembourse) + '</td></tr>'
        + '</tbody></table>';
    }
    h += '</div>';

    if (D.remboursements.length) {
      h += '<div class="carte"><h2>Remboursements — ' + D.annee
        + ' <span class="pill neutre">' + D.remboursements.length + '</span></h2>'
        + '<table><thead><tr><th>Date</th><th>Réf.</th><th>Paiement d’origine</th><th>Motif</th>'
        + '<th class="num">Montant</th></tr></thead><tbody>'
        + D.remboursements.map(function(r){
            return '<tr><td style="white-space:nowrap">' + esc(r.date) + '</td>'
              + '<td class="ref">' + esc(r.ref) + '</td>'
              + '<td class="ref">' + esc(r.paiement) + '</td>'
              + '<td>' + esc(r.motif || '—')
              + (r.enAttente ? ' <span class="pill att">en attente</span>' : '') + '</td>'
              + '<td class="num err">−' + fmt(r.montant) + '</td></tr>';
          }).join('')
        + '<tr class="tot"><td colspan="4">Total des remboursements</td>'
        + '<td class="num err">−' + fmt(t.rembourse) + '</td></tr>'
        + '</tbody></table></div>';
    }
    return h;
  }

  function vueReconciliation(){
    var R = D.reconciliation;
    if (!R) return '<div class="vide">Chargez d’abord les transactions, dans l’onglet Transactions.</div>';
    var ton = R.equilibre ? 'bon' : 'att';
    var h = '<div class="tuiles">'
      + tuile('Commandes ' + esc(R.marque), String(R.nbCommandes), '', 'non annulées · ' + D.annee)
      + tuile('Transactions Square', String(R.nbSquare)
          + (R.nbRemboursementsSquare ? ' / ' + R.nbRemboursementsSquare + ' remb.' : ''), '', 'complétées · ' + D.annee)
      + tuile('Écart', fmt(Math.abs(R.ecart)), ton, R.equilibre ? 'Équilibré' : 'Vérification requise')
      + '</div>';

    h += '<div class="carte"><h2>Comparaison système et Square — ' + D.annee + '</h2>'
      + '<table><thead><tr><th>Source</th><th class="num">Brut</th><th class="num">Remboursements</th>'
      + '<th class="num">Frais Square</th><th class="num">Net</th><th class="num">Nb</th></tr></thead><tbody>'
      + '<tr><td style="font-weight:600">Système ' + esc(R.marque) + '</td>'
      + '<td class="num">' + fmt(R.site.brut) + '</td>'
      + '<td class="num err">' + (R.site.rembourse > 0 ? '−' + fmt(R.site.rembourse) : '—') + '</td>'
      + '<td class="num err">' + ((R.site.fraisRetenus > 0 || R.site.fraisRembourses > 0)
          ? ((R.site.fraisRetenus > 0 ? '−' + fmt(R.site.fraisRetenus) : '')
            + (R.site.fraisRembourses > 0 ? '<div style="font-size:.85em">−' + fmt(R.site.fraisRembourses) + ' remb.</div>' : ''))
          : '—') + '</td>'
      + '<td class="num" style="font-weight:800">' + fmt(R.site.net) + '</td>'
      + '<td class="num">' + R.nbCommandes + '</td></tr>'
      + '<tr><td style="font-weight:600">Square (données réelles)</td>'
      + '<td class="num">' + fmt(R.square.brut) + '</td>'
      + '<td class="num err">' + (R.square.rembourse > 0 ? '−' + fmt(R.square.rembourse) : '—') + '</td>'
      + '<td class="num err">' + (R.square.frais > 0 ? '−' + fmt(R.square.frais) : '—') + '</td>'
      + '<td class="num bon" style="font-weight:800">' + fmt(R.square.net) + '</td>'
      + '<td class="num">' + R.nbSquare + '</td></tr>'
      + '<tr class="tot"><td>Écart</td>'
      + '<td class="num ' + ton + '">' + signe(R.square.brut - R.site.brut) + '</td>'
      + '<td class="num">' + signe(R.square.rembourse - R.site.rembourse) + '</td>'
      + '<td class="num">' + signe(-R.square.frais + (R.site.fraisRetenus + R.site.fraisRembourses)) + '</td>'
      + '<td class="num ' + ton + '">' + signe(R.ecart) + '</td>'
      + '<td class="num">' + (R.nbSquare >= R.nbCommandes ? '+' : '') + (R.nbSquare - R.nbCommandes) + '</td></tr>'
      + '</tbody></table></div>';

    h += R.equilibre
      ? '<div class="avis bon"><strong class="bon">Réconciliation équilibrée</strong> — les montants de Square et ceux du système correspondent (écart de moins d’un dollar).</div>'
      : '<div class="avis att"><strong class="att">Écart de ' + fmt(Math.abs(R.ecart)) + '</strong> — causes possibles : '
        + 'transactions faites hors du système, remboursements partiels, paiements par carte-cadeau, '
        + 'ou commandes réglées par un autre moyen.</div>';
    return h;
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div>'; return; }
    if (sous) {
      sous.innerHTML = D.connecte
        ? '<span class="pill bon">' + (D.mode === 'production' ? 'Production' : 'Bac à sable') + '</span>'
        : '<span class="pill neutre">non configuré</span>';
    }
    if (!D.connecte) {
      corps.innerHTML = '<div class="vide"><div class="gros"><span class="ic">🔑</span></div>'
        + 'Configurez d’abord la connexion Square dans <strong>Configuration → Paiement</strong>, '
        + 'dans la fenêtre principale.</div>';
      return;
    }

    var h = barre();
    if (!D.charge && !OCCUPE) {
      h += '<div class="vide">Aucune donnée pour ' + D.annee + '.'
        + '<div style="margin-top:.4rem">Cliquez « Charger les transactions » pour les lire chez Square.</div></div>';
    } else if (OCCUPE && !D.charge) {
      h += '<div class="vide charge">Lecture des paiements et des remboursements chez Square pour ' + D.annee + '…</div>';
    } else {
      h += ONGLET === 'reconciliation' ? vueReconciliation() : vueTransactions();
    }
    corps.innerHTML = h;

    var sel = document.getElementById('p-annee');
    if (sel) sel.onchange = function(){ ANNEE = +sel.value; charger(); };
    var bc = document.getElementById('p-charger');
    if (bc) bc.onclick = chercherChezSquare;
    var bm = document.getElementById('p-masquer');
    if (bm) bm.onclick = function(){
      bm.disabled = true;
      appeler('paiements:masquer', [D.annee]).then(function(r){
        if (!r.ok) { bm.disabled = false; dire(expliquer(r), 'err'); return; }
        dire(r.nb + ' entrée' + (r.nb > 1 ? 's masquées' : ' masquée') + '.', 'bon');
        charger();
      });
    };
    var br = document.getElementById('p-reafficher');
    if (br) br.onclick = function(){
      br.disabled = true;
      appeler('paiements:reafficher', []).then(function(r){
        if (!r.ok) { br.disabled = false; dire(expliquer(r), 'err'); return; }
        dire(r.nb + ' entrée' + (r.nb > 1 ? 's de nouveau visibles' : ' de nouveau visible') + '.', 'bon');
        charger();
      });
    };
  }

  function chercherChezSquare(){
    if (OCCUPE) return;
    OCCUPE = true;
    dire('Lecture chez Square…', 'att');
    dessiner();
    appeler('paiements:charger', [D ? D.annee : ANNEE]).then(function(r){
      OCCUPE = false;
      if (!r.ok) {
        /* ⚠ UN ECHEC RESEAU N EFFACE RIEN : ce qui etait en memoire reste
           affiche. Dire << aucune donnee >> apres un refus de Square ferait
           croire a des transactions disparues. */
        dire(expliquer(r), 'err');
        dessiner();
        return;
      }
      dire(r.nb + ' paiement' + (r.nb > 1 ? 's' : '')
        + (r.nbRemboursements ? ' et ' + r.nbRemboursements + ' remboursement' + (r.nbRemboursements > 1 ? 's' : '') : '')
        + ' relus chez Square.', 'bon');
      charger();
    });
  }

  function charger(){
    appeler('paiements:lire', [ANNEE || undefined]).then(function(r){
      if (!r || !r.ok) { vide('Paiements indisponibles', expliquer(r)); return; }
      D = r;
      ANNEE = r.annee;
      dessiner();
    });
  }

  window.szActualiser = function(){ if (!OCCUPE) charger(); };
  window.szRevenir = function(){ if (!OCCUPE) charger(); };

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
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);'
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto');
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

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); dessiner(); }
  });

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pagePaiements };
