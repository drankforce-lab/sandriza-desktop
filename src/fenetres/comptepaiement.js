'use strict';

/*
 * FENÊTRE « COMPTE DE PAIEMENT » — NATIVE (#118)
 * =============================================================================
 * Le fil chronologique de l'argent chez le processeur, sur le modèle du
 * « Payment account » d'Etsy : une vente entre, ses frais sortent, un
 * remboursement sort, un dépôt s'en va vers la banque — et un solde court le
 * long de la colonne.
 *
 * ⚠⚠ POURQUOI CET ÉCRAN ALORS QUE « PAIEMENTS SQUARE » EXISTE. Paiements liste
 * les encaissements et les remboursements de l'année, par paquets, avec des
 * totaux. Il ne répond pas à « combien y a-t-il dans le compte en ce moment, et
 * d'où vient chaque cent » — il n'y a ni ordre commun ni solde. C'est cette
 * question-là, et c'est celle qu'on se pose quand la banque ne dit pas le même
 * chiffre.
 *
 * ⚠⚠ ET LE SOLDE SAIT QU'IL PEUT ÊTRE FAUX. Les dépôts sont SAISIS À LA MAIN à
 * la conciliation bancaire : tant qu'aucun n'est enregistré, le solde montre
 * comme détenu par le processeur de l'argent qui dort déjà à la banque. La
 * fenêtre l'affiche en toutes lettres — un chiffre faux sans réserve est pire
 * que pas de chiffre, parce que celui-là, on le croit.
 *
 * ⚠ AUCUNE ARITHMÉTIQUE ICI. Le fil, les signes, le solde, les mois et le
 * contrôle d'équilibre viennent de `comptepaiement.js` par le pont. La fenêtre
 * montre et met en forme.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('comptepaiement');

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
.tete select{font:inherit;font-size:.8rem;color:var(--tx);background:var(--f-champ);
  border:1px solid var(--v12);border-radius:7px;padding:.18rem .4rem;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:1rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:1rem 1.1rem;min-width:0}
.carte h2{margin:0 0 .2rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
.carte .sous{margin:0 0 .9rem;font-size:.78rem;color:var(--tx3)}
.avis{border-radius:9px;padding:.55rem .75rem;font-size:.79rem;margin:0 0 .9rem;
  border:1px solid rgba(240,180,80,.3);background:rgba(200,140,40,.09);color:var(--tx-or2)}
.avis.dur{border-color:rgba(248,113,113,.35);background:rgba(190,60,60,.12);color:var(--tx-err)}
/* ⚠ REPRISE DU MODE JOUR — la meme que dans conformite.js, et le chiffre
   vient de la meme mesure : sur #eedcd7, var(--tx-err) rend #ab4e4e (4.03,
   sous le seuil) ; assombri du MINIMUM necessaire, 92 % de la teinte, 4.59. */
html.jour .avis.dur{color:#9d4848}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));gap:.7rem}
.tuile{background:var(--v03);border:1px solid var(--v07);border-radius:10px;padding:.65rem .8rem}
.tuile .t{font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.tuile .v{font-size:1.15rem;font-weight:700;margin-top:.15rem;white-space:nowrap}
.tuile.fort .v{font-size:1.4rem}
table{width:100%;border-collapse:collapse;font-size:.85rem}
th{text-align:left;padding:.35rem .5rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);border-bottom:1px solid var(--v12);
  position:sticky;top:0;background:var(--f-carte)}
td{padding:.35rem .5rem;border-bottom:1px solid var(--v05);vertical-align:middle}
tr:last-child td{border-bottom:none}
td.dr,th.dr{text-align:right;white-space:nowrap}
td.ref{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.78rem;color:var(--tx3)}
td.sol{font-weight:700;white-space:nowrap}
.plus{color:var(--tx-ok)}.moins{color:var(--tx-err)}
.nat{display:inline-flex;align-items:center;gap:.35rem;white-space:nowrap}
.pt{width:.5rem;height:.5rem;border-radius:50%;flex:0 0 auto}
.n-vente{background:#4ade80}.n-frais{background:#fbbf24}
.n-remboursement{background:#f87171}.n-frais_retenus{background:#7dd3fc}
.n-depot{background:#a78bfa}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.82rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.4rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageComptePaiement(annee) {
  const anDepart = JSON.stringify(String(annee || ''));
  return `${TETE()}
<title>${T("Compte de paiement — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.payments}</span><h1>${T("Compte de paiement")}</h1>
  <select id="an" aria-label="${T("Année du compte")}"></select></div>
<div class="corps" id="corps"><div class="carte"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button id="b-imprimer">${T("Imprimer le relevé")}</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

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
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
      t.appendChild(b);
    }
    if (actif) {
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('comptepaiement')}
  var corps = document.getElementById('corps');
  var selAn = document.getElementById('an');
  var D = null, OCCUPE = false, AN = ${anDepart};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  /* ⚠⚠ ON PASSE PAR << szArgent >>, LA PIECE COMMUNE — ET C EST LE BANC QUI L A
     EXIGE, pas la relecture. J avais refabrique une mise en forme de monnaie
     ici meme : elle collait le symbole << $ >> APRES le nombre, ce qui est juste
     en francais et faux en anglais (le symbole passe devant). Une fenetre qui
     fabrique sa propre mesure sort du jour ou la regle change, et personne ne
     s en apercoit — c est exactement ce que #119 a corrige pour le repli des
     tuiles. << szArgent >> arrive par JS_DIRE(), deja pose dans les 99 fenetres. */
  var arg = function(n){ return szArgent(n); };

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux paiements.")}',
    indisponible:       '${T("Le compte de paiement n’est pas prêt dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').'))
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

  var NATURES = {
    vente:         '${T("Vente")}',
    frais:         '${T("Frais de traitement")}',
    remboursement: '${T("Remboursement")}',
    frais_retenus: '${T("Frais retenus")}',
    depot:         '${T("Dépôt à la banque")}'
  };

  function htmlAvis(){
    var h = '';
    if (D.resume && D.resume.soldeIncomplet) {
      /* ⚠ ON DIT LE POURQUOI ET LE QUOI FAIRE. << Solde incomplet >> tout seul
         ferait deviner ; ici on nomme la cause (aucun depot saisi) et le geste
         (les saisir a la conciliation bancaire). */
      h += '<div class="avis">${T("Aucun dépôt n’est enregistré pour cette année. Les dépôts se saisissent à la Conciliation bancaire — tant qu’ils manquent, le solde ci-dessous compte comme détenu par le processeur de l’argent qui est peut-être déjà à la banque.")}</div>';
    }
    if (D.controle && !D.controle.equilibre) {
      h += '<div class="avis dur">${T("Le solde du fil et le total par nature ne concordent pas — écart de ")}'
        + esc(arg(D.controle.ecart)) + '${T(". Un mouvement manque, ou un signe est faux.")}</div>';
    }
    if (D.bacASable) {
      h += '<div class="avis">${T("Bac à sable : ces chiffres ne sont pas ceux de la production.")}</div>';
    }
    if (!D.charge) {
      h += '<div class="avis">${T("Aucune transaction en cache pour cette année. Ouvrez « Paiements Square » et chargez-les — cet écran ne va pas chercher les données lui-même.")}</div>';
    }
    return h;
  }

  function htmlTuiles(){
    var r = D.resume || {};
    var t = function(cl, lbl, val, sup){
      return '<div class="tuile' + (cl ? ' ' + cl : '') + '"><div class="t">' + esc(lbl)
        + '</div><div class="v' + (sup || '') + '">' + esc(arg(val)) + '</div></div>';
    };
    return szTuiles('<div class="stat-grid">'
      + t('fort', '${T("Solde chez le processeur")}', r.solde)
      + t('', '${T("Ventes")}', r.ventes, ' plus')
      + t('', '${T("Frais de traitement")}', -r.frais, ' moins')
      + t('', '${T("Remboursements")}', -r.remboursements, ' moins')
      + t('', '${T("Frais retenus")}', r.fraisRetenus, ' plus')
      + t('', '${T("Déposé à la banque")}', -r.depots, ' moins')
      + '</div>');
  }

  function htmlFil(){
    var l = (D && D.mouvements) || [];
    if (!l.length) return '<div class="carte"><h2>${T("Mouvements")}</h2>'
      + '<div class="vide">${T("Aucun mouvement pour cette année.")}</div></div>';
    var lignes = l.map(function(m){
      var signe = (m.effet >= 0) ? 'plus' : 'moins';
      return '<tr><td>' + esc(m.date || '${T("(date illisible)")}') + '</td>'
        + '<td><span class="nat"><span class="pt n-' + esc(m.nature) + '" aria-hidden="true"></span>'
        + esc(NATURES[m.nature] || m.nature) + '</span></td>'
        + '<td class="ref">' + esc(m.ref) + '</td>'
        + '<td>' + esc(m.libelle) + '</td>'
        + '<td class="dr ' + signe + '">' + esc((m.effet >= 0 ? '+' : '') + arg(m.effet)) + '</td>'
        + '<td class="dr sol">' + esc(arg(m.solde)) + '</td></tr>';
    }).join('');
    return '<div class="carte"><h2>${T("Mouvements")}</h2>'
      + '<p class="sous">${T("Du plus ancien au plus récent. Une vente donne deux lignes : le brut entre, les frais sortent.")}</p>'
      + '<table><thead><tr><th>${T("Date")}</th><th>${T("Nature")}</th><th>${T("Référence")}</th>'
      + '<th>${T("Détail")}</th><th class="dr">${T("Effet")}</th><th class="dr">${T("Solde")}</th>'
      + '</tr></thead><tbody>' + lignes + '</tbody></table></div>';
  }

  function htmlMois(){
    var m = (D && D.mois) || [];
    if (!m.length) return '';
    var lignes = m.map(function(x){
      return '<tr><td>' + esc(x.mois) + '</td>'
        + '<td class="dr">' + esc(arg(x.ventes)) + '</td>'
        + '<td class="dr">' + esc(arg(x.frais)) + '</td>'
        + '<td class="dr">' + esc(arg(x.remboursements)) + '</td>'
        + '<td class="dr">' + esc(arg(x.depots)) + '</td>'
        + '<td class="dr sol">' + esc((x.net >= 0 ? '+' : '') + arg(x.net)) + '</td></tr>';
    }).join('');
    return '<div class="carte"><h2>${T("Par mois")}</h2>'
      + '<table><thead><tr><th>${T("Mois")}</th><th class="dr">${T("Ventes")}</th>'
      + '<th class="dr">${T("Frais")}</th><th class="dr">${T("Remboursements")}</th>'
      + '<th class="dr">${T("Dépôts")}</th><th class="dr">${T("Variation")}</th>'
      + '</tr></thead><tbody>' + lignes + '</tbody></table></div>';
  }

  function majAnnees(){
    var an = (D && D.annees) || [];
    selAn.innerHTML = an.map(function(y){
      return '<option value="' + esc(y) + '"' + (String(y) === String(D.annee) ? ' selected' : '') + '>'
        + esc(y) + '</option>'; }).join('');
  }

  function dessiner(){
    if (!D) return;
    majAnnees();
    corps.innerHTML = '<div class="carte">' + htmlAvis() + htmlTuiles() + '</div>'
      + htmlFil() + htmlMois();
  }

  function charger(an){
    if (OCCUPE) return;
    OCCUPE = true; dire('${T("Chargement…")}', 'att');
    return appeler('paiements:compte', [an || AN || '']).then(function(r){
      OCCUPE = false;
      if (!r.ok) { corps.innerHTML = '<div class="carte"><div class="vide">' + esc(expliquer(r)) + '</div></div>';
                   dire(expliquer(r), 'err'); return; }
      D = r; AN = String(r.annee); dessiner(); dire('');
    });
  }

  selAn.addEventListener('change', function(){ charger(selAn.value); });
  document.getElementById('b-imprimer').addEventListener('click', function(){
    /* ⚠ L IMPRESSION EST CELLE DE LA PAGE, ET C EST ASSUME : le releve tient
       dans deux tableaux deja mis en forme. Passer par un imprime compose par
       le site (patron << fenetre pilote >>) ajouterait un gabarit de plus a
       tenir d accord avec celui-ci, pour le meme contenu. */
    window.print();
  });

  charger();
})();
</script></body></html>`;
}

module.exports = { pageComptePaiement };
