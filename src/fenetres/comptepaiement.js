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
  border:1px solid var(--v12);border-radius:7px;padding:.18rem .4rem}
/* LA REFONTE DE LA COMPTABILITE (2026-10-16) : la grammaire .cx du socle (CSS_COMPTA). La tete porte le
   resume, l annee et l impression ; le corps : les avis en pastilles, quatre chiffres, puis le fil et les mois
   cote a cote. Aucune glissiere (2026-10-12) : mouvements et mois en PAGES mesurees (JS_PAGES du socle).
   A l impression du releve, TOUTES les lignes reviennent et le pied de pages s efface. */
@media print{body,.cx,.cx [data-pages],.cx-carte,.cx-deux{overflow:visible!important;height:auto!important}
  .cx>.cx-deux{display:block!important}.cx [data-pages]{flex:0 0 auto!important}
  .cx [data-pages] tbody>tr{display:table-row!important}.cx [data-pages]>.cp-mois{display:block!important}
  .sz-pages,.szbd-b{display:none!important}}
/* Les avis : une PASTILLE courte ; le texte complet s ouvre dessous, rien n est efface. */
.cp-avis{display:flex;flex-wrap:wrap;align-items:flex-start;gap:.5rem}
/* Le detail flotte SOUS la pastille, par-dessus la page : l ouvrir ne pousse rien (les pages mesurees tiennent).
   A l impression, il reprend sa place dans le flux, ouvert. */
.cp-avis details{position:relative;min-width:0;max-width:100%}
.cp-avis summary{list-style:none;cursor:pointer}
.cp-avis summary::-webkit-details-marker{display:none}
.cp-avis details>p{position:absolute;z-index:20;top:calc(100% + .35rem);left:0;width:min(40rem,80vw);margin:0;
  padding:.6rem .8rem;border-radius:12px;background:var(--f-carte2);border:1px solid var(--sz-bord,var(--v14));
  box-shadow:0 12px 28px rgba(0,0,0,.35);font-size:.78rem;line-height:1.45;color:var(--tx)}
@media print{.cp-avis details>p{position:static;box-shadow:none;width:auto}}
.cx-averti.dur{border-color:color-mix(in srgb,var(--tx-err) 40%,transparent);
  background:color-mix(in srgb,var(--tx-err) 9%,transparent);color:var(--tx-err)}
/* ⚠ REPRISE DU MODE JOUR — la meme que dans conformite.js, et le chiffre
   vient de la meme mesure : sur #eedcd7, var(--tx-err) rend #ab4e4e (4.03,
   sous le seuil) ; assombri du MINIMUM necessaire, 92 % de la teinte, 4.59. */
html.jour .cx-averti.dur{color:#9d4848}
.cp-mois{padding-bottom:.35rem}
.cp-mois .cx-etat:last-child{border-bottom:0}
table{width:100%;border-collapse:collapse;font-size:.85rem}
th{text-align:left;padding:.35rem .5rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);border-bottom:1px solid var(--v12);
  position:sticky;top:0;background:var(--f-carte)}
td{padding:.35rem .5rem;border-bottom:1px solid var(--v05);vertical-align:middle}
/* (Plus de « tr:last-child td{border-bottom:none} » : chaque ligne est une carte, la derniere garde son bord — 2026-09-26.) */
td.dr,th.dr{text-align:right;white-space:nowrap}
td.sol{font-weight:700;white-space:nowrap}
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
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageComptePaiement(annee) {
  const anDepart = JSON.stringify(String(annee || ''));
  return `${TETE()}
<title>${T("Compte de paiement — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.payments}</span><h1>${T("Compte de paiement")}</h1>
  <span class="cx-resume">${T("Le compte Square, comme un relevé bancaire")}</span>
  <div class="cx-actions"><select id="an" aria-label="${T("Année du compte")}"></select>
  <button id="b-imprimer" class="prim">${T("Imprimer le relevé")}</button></div></div>
<div class="cx" id="corps"><div class="cx-carte"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
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
    // (2026-10-25, audit) Texte BRUT : szDire l ecrit en textContent ; le corps l echappe a l endroit ou il le pose.
    return (MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').'))
      + (r && r.detail ? ' (' + r.detail + ')' : '');
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

  /* LES AVIS EN PASTILLES (refonte 2026-10-16) : un mot court, et le texte
     complet s ouvre dessous au clic — on n efface aucune information. */
  function avis(cl, court, long){
    return '<details><summary class="cx-averti' + (cl ? ' ' + cl : '') + '"><span>' + court + '</span></summary>'
      + '<p>' + long + '</p></details>';
  }
  function htmlAvis(){
    var h = '';
    if (D.resume && D.resume.soldeIncomplet) {
      /* ⚠ ON DIT LE POURQUOI ET LE QUOI FAIRE. << Solde incomplet >> tout seul
         ferait deviner ; ici on nomme la cause (aucun depot saisi) et le geste
         (les saisir a la conciliation bancaire). */
      h += avis('', '${T("Solde incomplet — aucun dépôt saisi")}',
        '${T("Aucun dépôt n’est enregistré pour cette année. Les dépôts se saisissent à la Conciliation bancaire — tant qu’ils manquent, le solde ci-dessous compte comme détenu par le processeur de l’argent qui est peut-être déjà à la banque.")}');
    }
    if (D.controle && !D.controle.equilibre) {
      h += avis('dur', '${T("Écart dans le solde :")} ' + esc(arg(D.controle.ecart)),
        '${T("Le solde du fil et le total par nature ne concordent pas — écart de ")}'
        + esc(arg(D.controle.ecart)) + '${T(". Un mouvement manque, ou un signe est faux.")}');
    }
    if (D.bacASable) {
      h += avis('', '${T("Bac à sable")}', '${T("Bac à sable : ces chiffres ne sont pas ceux de la production.")}');
    }
    if (!D.charge) {
      h += avis('', '${T("Aucune transaction en cache")}',
        '${T("Aucune transaction en cache pour cette année. Ouvrez « Paiements Square » et chargez-les — cet écran ne va pas chercher les données lui-même.")}');
    }
    return h ? '<div class="cp-avis">' + h + '</div>' : '';
  }

  /* LES QUATRE CHIFFRES (refonte 2026-10-16). Ils s ADDITIONNENT : ventes,
     moins frais et remboursements (les frais retenus rendus deduits), moins les
     depots, donne le solde. Tout vient de D.resume — aucune arithmetique neuve
     hors de cette somme d affichage. Le bandeau reste MASQUABLE (szTuiles). */
  function htmlTuiles(){
    var r = D.resume || {};
    var kpi = function(cl, lbl, val, sous, titre){
      return '<div class="cx-kpi' + (cl ? ' ' + cl : '') + '"' + (titre ? ' title="' + esc(titre) + '"' : '') + '><span>' + esc(lbl)
        + '</span><b>' + esc(val) + '</b><small>' + esc(sous) + '</small></div>';
    };
    var sortis = -(Number(r.frais) || 0) - (Number(r.remboursements) || 0) + (Number(r.fraisRetenus) || 0);
    var detSortis = '${T("frais")} ' + arg(r.frais) + ' · ${T("remboursements")} ' + arg(r.remboursements)
      + ((Number(r.fraisRetenus) || 0) ? ' · ${T("frais retenus")} +' + arg(r.fraisRetenus) : '');
    return szTuiles('<div class="cx-kpis">'
      + kpi('ok', '${T("Ventes entrées")}', '+' + arg(r.ventes), '${T("brut des paiements")}')
      + kpi('err', '${T("Frais et remboursements")}', arg(sortis), detSortis, detSortis)
      + kpi('', '${T("Dépôts vers la banque")}', arg(r.depots), '${T("virés au compte d’entreprise")}')
      + kpi(r.soldeIncomplet ? 'att' : 'or', '${T("Solde chez le processeur")}',
          ((Number(r.solde) || 0) >= 0 ? '+' : '') + arg(r.solde),
          '${T("variation de l’exercice")} ' + (D.annee || ''))
      + '</div>');
  }

  var PILLS = { vente: 'vert', frais: 'ambre', remboursement: 'rouge', frais_retenus: 'bleu', depot: '' };
  function htmlFil(){
    var l = (D && D.mouvements) || [];
    if (!l.length) return '<div class="cx-carte"><h2>${T("Mouvements")}</h2>'
      + '<div class="vide">${T("Aucun mouvement pour cette année.")}</div></div>';
    var lignes = l.map(function(m){
      var signe = (m.effet >= 0) ? 'cx-pos' : 'cx-neg';
      return '<tr><td>' + esc(szQuand(m.date) || '${T("(date illisible)")}') + '</td>'
        + '<td><span class="rf-pill ' + (PILLS[m.nature] || '') + '">'
        + esc(NATURES[m.nature] || m.nature) + '</span></td>'
        + '<td><span class="cx-code">' + esc(m.ref) + '</span></td>'
        + '<td>' + esc(m.libelle) + '</td>'
        + '<td class="dr ' + signe + '">' + esc((m.effet >= 0 ? '+' : '') + arg(m.effet)) + '</td>'
        + '<td class="dr sol">' + esc(arg(m.solde)) + '</td></tr>';
    }).join('');
    // La liste en PAGES mesurees, jamais de glissiere (2026-10-12).
    return '<div class="cx-carte"><h2>${T("Mouvements")} <span class="cx-sub">${T("Du plus ancien au plus récent. Une vente donne deux lignes : le brut entre, les frais sortent.")}</span></h2>'
      + '<div class="cx-pages" data-pages="comptepaiement-mouvements"><table><thead><tr><th>${T("Date")}</th><th>${T("Nature")}</th><th>${T("Référence")}</th>'
      + '<th>${T("Détail")}</th><th class="dr">${T("Effet")}</th><th class="dr">${T("Solde")}</th>'
      + '</tr></thead><tbody>' + lignes + '</tbody></table></div></div>';
  }

  /* PAR MOIS, en releve (refonte 2026-10-16) : le mois et sa variation, puis ses
     quatre postes en retrait. Un bloc par mois : la page ne coupe jamais un mois. */
  function htmlMois(){
    var m = (D && D.mois) || [];
    if (!m.length) return '<div class="cx-carte"><h2>${T("Par mois")}</h2>'
      + '<div class="vide">${T("Aucun mouvement pour cette année.")}</div></div>';
    var etat = function(lbl, v){
      return '<div class="cx-etat ret"><span>' + esc(lbl) + '</span><span>' + esc(arg(v)) + '</span></div>';
    };
    var blocs = m.map(function(x){
      return '<div class="cp-mois"><div class="cx-etat"><span><b>' + esc(x.mois) + '</b></span>'
        + '<span class="' + (x.net >= 0 ? 'cx-pos' : 'cx-neg') + '" title="${T("Variation")}"><b>'
        + esc((x.net >= 0 ? '+' : '') + arg(x.net)) + '</b></span></div>'
        + etat('${T("Ventes")}', x.ventes) + etat('${T("Frais")}', x.frais)
        + etat('${T("Remboursements")}', x.remboursements) + etat('${T("Dépôts")}', x.depots) + '</div>';
    }).join('');
    // En PAGES aussi : douze mois ne tiennent pas dans la colonne.
    return '<div class="cx-carte"><h2>${T("Par mois")}</h2>'
      + '<div class="cx-pages" data-pages="comptepaiement-mois">' + blocs + '</div>'
      + (m.length < 12 ? '<div class="cx-sub">${T("Les autres mois de l’exercice n’ont aucun mouvement.")}</div>' : '')
      + '</div>';
  }

  function majAnnees(){
    var an = (D && D.annees) || [];
    selAn.innerHTML = an.map(function(y){
      return '<option value="' + esc(y) + '"' + (String(y) === String(D.annee) ? ' selected' : '') + '>'
        + '${T("Exercice")} ' + esc(y) + '</option>'; }).join('');
  }

  function dessiner(){
    if (!D) return;
    majAnnees();
    corps.innerHTML = htmlAvis() + htmlTuiles()
      + '<div class="cx-deux">' + htmlFil() + htmlMois() + '</div>';
  }

  function charger(an){
    if (OCCUPE) return;
    OCCUPE = true; dire('${T("Chargement…")}', 'att');
    return appeler('paiements:compte', [an || AN || '']).then(function(r){
      OCCUPE = false;
      if (!r.ok) { corps.innerHTML = '<div class="cx-carte"><div class="vide">' + esc(expliquer(r)) + '</div></div>';
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
