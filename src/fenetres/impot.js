'use strict';

/*
 * FENÊTRE « FISCALITÉ ET IMPÔT » — NATIVE (2.8.0)
 * =============================================================================
 * Les chiffres qui vont dans une déclaration : TPS/TVQ à remettre après crédits
 * sur intrants, résumé trimestriel et mensuel, état des résultats — et les
 * documents fiscaux, imprimés d'un clic.
 *
 * ⚠ PATRON « FENÊTRE PILOTE », comme le Centre d'impression. Les documents
 * fiscaux (GST34, FPZ-500-V, T2125, TP-80, grand livre, inventaire) sont des
 * IMPRIMÉS de plusieurs pages composés par le site : en-tête d'entreprise,
 * attestation, blocs de signature, millimétrage. Les redessiner ici voudrait
 * dire les écrire deux fois — et deux formulaires fiscaux qui divergent, c'est
 * une déclaration fausse. La fenêtre affiche les chiffres et commande.
 *
 * ⚠ CE QUI RESTE À L'ÉCRAN WEB : le PROFIL D'ENTREPRISE (des réglages —
 * numéros de TPS/TVQ, NEQ, adresse), l'onglet Inventaire et l'aide-mémoire des
 * dates. La fenêtre le dit et y renvoie quand le profil est incomplet, parce
 * qu'un document imprimé sans numéro de taxe ne vaut rien.
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
.barreoutils .droite{margin-left:auto;font-size:.78rem;color:#8fa1b8}
select,button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;
  color:#8fa1b8;font-weight:700;display:flex;align-items:baseline;gap:.5rem;flex-wrap:wrap}
.carte h2 .n{font-weight:400;text-transform:none;letter-spacing:0;font-size:.72rem;color:#6d7f96}
.stats{display:flex;gap:.5rem;flex-wrap:wrap}
.stats .s{flex:1 1 8rem;background:rgba(255,255,255,.04);border-radius:9px;padding:.45rem .65rem}
.stats .s .n{font:700 1.05rem/1.2 Georgia,serif;color:#c9a97e}
.stats .s .n.du{color:#f87171}
.stats .s .n.ok{color:#4ade80}
.stats .s .l{font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}
.stats .s .sub{font-size:.66rem;color:#6d7f96}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.28rem .4rem;border-top:1px solid rgba(255,255,255,.055)}
tbody .arg{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
tbody tr.total td{border-top:2px solid rgba(255,255,255,.22);font-weight:700}
tbody tr.credit td{color:#4ade80}
.rang{display:flex;justify-content:space-between;gap:1rem;padding:.26rem 0;
  border-bottom:1px solid rgba(255,255,255,.06);font-size:.86rem}
.rang .l .sub{font-size:.68rem;color:#6d7f96;margin-left:.4rem}
.rang.fort{border-bottom:none;border-top:2px solid rgba(255,255,255,.2);
  margin-top:.2rem;font-weight:700;font-size:.95rem}
.rang b{font-variant-numeric:tabular-nums}
.avis{background:rgba(180,120,10,.1);border:1px solid rgba(180,120,10,.4);color:#fbbf24;
  border-radius:9px;padding:.45rem .65rem;font-size:.79rem;line-height:1.5}
.avis.bon{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.4);color:#4ade80}
.avis.info{background:rgba(59,130,246,.12);border-color:rgba(59,130,246,.4);color:#93c5fd}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap;
  background:rgba(148,163,184,.16);color:#8fa1b8;margin:.1rem .25rem 0 0}
.docs{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:.5rem}
.doc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);
  border-radius:10px;padding:.55rem .7rem;display:flex;flex-direction:column;gap:.25rem}
.doc .t{font-weight:600;font-size:.88rem}
.doc .d{font-size:.72rem;color:#8fa1b8;line-height:1.4;flex:1 1 auto}
.doc .b{display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.2rem}
/* Un graphe MINUSCULE, en barres : douze mois se lisent d un coup d oeil, et
   une colonne vide dit tout de suite qu il n y a rien eu ce mois-la. */
.graphe{display:flex;align-items:flex-end;gap:.25rem;height:5rem;margin-top:.4rem}
.graphe .b{flex:1 1 0;background:rgba(201,169,126,.5);border-radius:3px 3px 0 0;min-height:2px}
.graphe .b:hover{background:#c9a97e}
.mois{display:flex;gap:.25rem;margin-top:.2rem}
.mois span{flex:1 1 0;text-align:center;font-size:.6rem;color:#6d7f96}
.aide{font-size:.75rem;color:#8fa1b8;line-height:1.45}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Fiscalité et impôt ».
 * `onglet` = 'revenus' ou 'documents' pour ouvrir directement dessus.
 * ⚠ Sans ce paramètre, le garde-fou ne dessinerait que l'onglet des taxes : il
 * ne simule aucun clic, et les deux autres resteraient dans l'ombre.
 */
function pageImpot(onglet) {
  const ok = ['revenus', 'documents'];
  const depart = (ok.indexOf(String(onglet || '')) >= 0) ? String(onglet) : 'taxes';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Fiscalité et impôt — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🏛️</span><h1>Fiscalité et impôt</h1>
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
  var ONGLET = '${depart}';
  var ANNEE = 0;
  var TRIM = 0;             // trimestre choisi pour les documents trimestriels
  var OCCUPE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la fiscalité.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    document_inconnu:   'Ce document n’existe pas.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 150)) + ')';
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

  /* ── LES DOCUMENTS ─────────────────────────────────────────────────────────
     ⚠ CHACUN DIT A QUOI IL SERT ET A QUI IL VA. Un nom de formulaire seul
     (<< FPZ-500-V >>) ne dit rien a qui ne le manipule pas tous les jours. */
  var DOCS = [
    { cle: 'tps-trim', trim: true, titre: 'Remise TPS / TVQ — trimestrielle',
      desc: 'GST34 (ARC) et FPZ-500-V (Revenu Québec) pour un trimestre, avec les crédits sur intrants déjà déduits.' },
    { cle: 'tps-annuel', trim: false, titre: 'Remise TPS / TVQ — annuelle',
      desc: 'Le même sommaire pour l’année entière, si votre fréquence de remise est annuelle.' },
    { cle: 't2125', trim: false, titre: 'T2125 — État des résultats (fédéral)',
      desc: 'Revenus et dépenses ventilés par ligne fiscale, prêts à reporter dans votre déclaration.' },
    { cle: 'tp80', trim: false, titre: 'TP-80-V — État des résultats (Québec)',
      desc: 'L’équivalent québécois, aux mêmes chiffres.' },
    { cle: 'grand-livre', trim: false, titre: 'Grand livre des dépenses',
      desc: 'Chaque dépense de l’année, regroupée par catégorie — la pièce que demande un comptable.' },
    { cle: 'inventaire', trim: false, titre: 'Inventaire de fin d’exercice',
      desc: 'La valeur du stock à la date de clôture, au coût — nécessaire au calcul du coût des marchandises vendues.' }
  ];

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var h = '';

    /* ⚠ LE PROFIL INCOMPLET SE DIT EN HAUT, TOUJOURS : un document imprime sans
       numero de TPS ni de TVQ ne vaut rien, et l on ne s en apercoit qu apres
       l avoir envoye. */
    if (!D.profil.complet) {
      h += '<div class="avis">⚠ <strong>Profil d’entreprise incomplet</strong> — il manque le nom, '
        + 'le NEQ ou vos numéros de TPS/TVQ. Les documents s’imprimeront sans eux, et ils ne '
        + 'seront pas recevables. Complétez-le à l’écran <strong>Comptabilité → Fiscalité et '
        + 'impôt</strong>, onglet « Mon entreprise », dans la fenêtre principale.</div>';
    }

    h += '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'taxes' ? ' actif' : '') + '" data-onglet="taxes">TPS / TVQ</button>'
      + '<button class="mini' + (ONGLET === 'revenus' ? ' actif' : '') + '" data-onglet="revenus">Revenus</button>'
      + '<button class="mini' + (ONGLET === 'documents' ? ' actif' : '') + '" data-onglet="documents">Documents</button>'
      + '<select id="i-annee">' + (D.annees || []).map(function(a){
          return '<option value="' + a + '"' + (String(a) === String(D.annee) ? ' selected' : '') + '>'
            + a + '</option>'; }).join('') + '</select>'
      + '<span class="droite">' + esc(D.profil.nom || 'entreprise sans nom') + '</span>'
      + '</div>';

    if (ONGLET === 'revenus') h += vueRevenus();
    else if (ONGLET === 'documents') h += vueDocuments();
    else h += vueTaxes();

    corps.innerHTML = h;
    brancher();
  }

  function vueTaxes(){
    var t = D.taxes;
    var h = '<div class="stats">'
      + tuile(t.ventesNettes, 'Ventes nettes taxables', t.nbCommandes + ' commande' + (t.nbCommandes > 1 ? 's' : ''), '')
      + tuile(t.tps, 'TPS perçue (5 %)', 'à remettre — ARC', '')
      + tuile(t.tvq, 'TVQ perçue (9,975 %)', 'à remettre — Revenu Québec', '')
      + tuile(t.totalRemettre, 'Net à remettre', t.enFaveur ? 'remboursement en votre faveur' : 'après crédits sur intrants',
          t.enFaveur ? 'ok' : 'du')
      + '</div>';

    /* ⚠ LE SEUIL DE PETIT FOURNISSEUR EST LA PREMIERE QUESTION qu on se pose
       quand on demarre : sous 30 000 $, l inscription n est pas obligatoire. */
    h += '<div class="avis ' + (t.souSeuil ? 'bon' : '') + '">'
      + (t.souSeuil
          ? ('Vos ventes (' + esc(t.ventesNettes) + ') sont sous le seuil de ' + esc(t.seuil)
             + ' : l’inscription aux taxes n’est pas obligatoire. À confirmer avec votre comptable.')
          : ('Vos ventes dépassent le seuil de ' + esc(t.seuil)
             + ' : l’inscription aux taxes est obligatoire, et les remises doivent être faites régulièrement.'))
      + '</div>';

    if (t.nbRemb) {
      h += '<div class="aide">↩ ' + t.nbRemb + ' remboursement' + (t.nbRemb > 1 ? 's' : '')
        + ' déduit' + (t.nbRemb > 1 ? 's' : '') + ' de ces chiffres : −' + esc(t.rembSousTotal)
        + ' taxable, −' + esc(t.rembTps) + ' TPS, −' + esc(t.rembTvq) + ' TVQ.</div>';
    }

    if ((t.pst || []).length) {
      /* ⚠ LA PST NE SE DECLARE PAS SUR LES MEMES FORMULAIRES : elle se remet a
         CHAQUE province de destination. La taire ferait croire a une remise
         complete alors qu il en manque une par province. */
      h += '<div class="avis info">🏛 <strong>Taxes provinciales perçues (PST / RST)</strong> — '
        + 'à remettre à CHAQUE province séparément, elles ne sont ni dans les chiffres '
        + 'ci-dessus ni dans GST34 / FPZ-500-V :<br>'
        + t.pst.map(function(p){
            return '<span class="pill">' + esc(p.province) + ' : ' + esc(p.montant) + '</span>'; }).join('')
      + '</div>';
    }

    h += '<div class="carte"><h2>Taxe nette à remettre <span class="n">après crédits sur intrants (CTI / RTI)</span></h2>'
      + '<table><thead><tr><th></th><th style="text-align:right">TPS</th>'
      + '<th style="text-align:right">TVQ</th><th style="text-align:right">Total</th></tr></thead><tbody>'
      + '<tr><td>Taxes perçues sur les ventes</td><td class="arg">' + esc(t.tps)
      + '</td><td class="arg">' + esc(t.tvq) + '</td><td class="arg">' + esc(t.total) + '</td></tr>'
      + '<tr class="credit"><td>Moins : taxes payées sur les dépenses</td><td class="arg">−' + esc(t.cti)
      + '</td><td class="arg">−' + esc(t.rti) + '</td><td class="arg">−' + esc(t.ctiTotal) + '</td></tr>'
      + '<tr class="total"><td>Net à remettre</td><td class="arg">' + esc(t.tpsRemettre)
      + '</td><td class="arg">' + esc(t.tvqRemettre) + '</td><td class="arg">'
      + esc(t.totalRemettre) + '</td></tr>'
      + '</tbody></table>'
      + '<div class="aide" style="margin-top:.4rem">'
      + (t.aucunCredit
          ? 'Aucune taxe payée sur des dépenses n’est saisie — vos crédits sur intrants sont donc à zéro. Saisissez vos dépenses avec leur TPS et leur TVQ pour les récupérer.'
          : 'Un montant négatif est un remboursement de taxe en votre faveur, pas une erreur.')
      + '</div></div>';

    h += '<div class="carte"><h2>Résumé trimestriel <span class="n">fréquence de remise habituelle d’une PME</span></h2>'
      + '<table><thead><tr><th>Trimestre</th><th style="text-align:right">Ventes nettes</th>'
      + '<th style="text-align:right">TPS</th><th style="text-align:right">TVQ</th>'
      + '<th style="text-align:right">À remettre</th><th style="text-align:right">Cmdes</th></tr></thead><tbody>'
      + (t.trimestres || []).map(function(q){
          return '<tr><td>' + esc(q.libelle) + '</td><td class="arg">' + esc(q.net)
            + '</td><td class="arg">' + esc(q.tps) + '</td><td class="arg">' + esc(q.tvq)
            + '</td><td class="arg">' + esc(q.total) + '</td><td class="arg">' + q.n + '</td></tr>';
        }).join('')
      + '<tr class="total"><td>Année ' + D.annee + '</td><td class="arg">' + esc(t.ventesNettes)
      + '</td><td class="arg">' + esc(t.tps) + '</td><td class="arg">' + esc(t.tvq)
      + '</td><td class="arg">' + esc(t.total) + '</td><td class="arg">' + t.nbCommandes + '</td></tr>'
      + '</tbody></table></div>';

    h += '<div class="carte"><h2>Détail mensuel</h2>'
      + '<table><thead><tr><th>Mois</th><th style="text-align:right">Ventes nettes</th>'
      + '<th style="text-align:right">TPS</th><th style="text-align:right">TVQ</th>'
      + '<th style="text-align:right">Cmdes</th></tr></thead><tbody>'
      + (t.mensuel || []).map(function(m){
          return '<tr><td>' + esc(m.mois) + '</td><td class="arg">' + esc(m.net)
            + '</td><td class="arg">' + esc(m.tps) + '</td><td class="arg">' + esc(m.tvq)
            + '</td><td class="arg">' + m.n + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    return h;
  }

  function vueRevenus(){
    var r = D.revenus;
    var h = '<div class="carte"><h2>État des résultats <span class="n">T2125 fédéral · TP-80-V Québec</span></h2>'
      + rang('Ventes brutes de marchandises', r.brut, 'ligne 8000')
      + rang('Remises et coupons', '−' + r.remises, '')
      + (r.nbRemb ? rang('Remboursements émis', '−' + r.rembourse, r.nbRemb + ' remb.') : '')
      + rang('Revenus d’expédition facturés', r.livraison, 'ligne 8290')
      + rang('Revenus nets d’entreprise', r.totalRevenus, 'ligne 8299', true)
      + rang('Total des dépenses', '−' + r.depenses, 'section Dépenses')
      + rang(r.perte ? 'Perte nette d’entreprise' : 'Bénéfice net d’entreprise', r.benefice, 'ligne 9946', true)
      + '</div>';

    if (D.square) {
      h += '<div class="carte"><h2>Encaissements réels <span class="n">Square</span></h2>'
        + rang('Revenu brut encaissé', D.square.brut, D.square.n + ' transaction' + (D.square.n > 1 ? 's' : ''))
        + rang('Frais de traitement', '−' + D.square.frais, 'déductibles · ligne 8710')
        + rang('Revenu net après frais', D.square.net, '', true)
        + '</div>';
    }

    if ((r.categories || []).length) {
      h += '<div class="carte"><h2>Dépenses par ligne fiscale</h2><table><thead><tr>'
        + '<th>Catégorie</th><th>Ligne</th><th style="text-align:right">Montant</th>'
        + '</tr></thead><tbody>'
        + r.categories.map(function(c){
            return '<tr><td>' + esc(c.libelle) + '</td><td>' + esc(c.ligne)
              + '</td><td class="arg">' + esc(c.montant) + '</td></tr>'; }).join('')
        + '<tr class="total"><td colspan="2">Total</td><td class="arg">' + esc(r.depenses)
        + '</td></tr></tbody></table></div>';
    } else {
      h += '<div class="aide">Aucune dépense saisie pour ' + D.annee
        + ' — le bénéfice net ci-dessus ne tient donc compte d’aucune déduction.</div>';
    }

    var mx = r.maxMois || 1;
    h += '<div class="carte"><h2>Ventes nettes par mois</h2>'
      + '<div class="graphe">' + (r.mensuel || []).map(function(m){
          var p = Math.max(2, Math.round((m.brutN / mx) * 100));
          return '<div class="b" style="height:' + p + '%" title="' + esc(m.mois) + ' : '
            + esc(m.net) + '"></div>'; }).join('') + '</div>'
      + '<div class="mois">' + (r.mensuel || []).map(function(m){
          return '<span>' + esc(m.mois) + '</span>'; }).join('') + '</div></div>';
    return h;
  }

  function vueDocuments(){
    var h = '<div class="aide">Chaque document s’ouvre dans la fenêtre principale, prêt à imprimer '
      + 'ou à enregistrer en PDF. Les chiffres sont ceux de l’année choisie ci-dessus.</div>';
    h += '<div class="carte"><h2>Trimestre <span class="n">pour les documents trimestriels</span></h2>'
      + '<div class="barreoutils">'
      + ['T1 — jan · mar', 'T2 — avr · juin', 'T3 — juil · sep', 'T4 — oct · déc'].map(function(l, i){
          return '<button class="mini' + (TRIM === i ? ' actif' : '') + '" data-trim="' + i + '">'
            + l + '</button>'; }).join('')
      + '</div></div>';
    h += '<div class="docs">' + DOCS.map(function(d){
        return '<div class="doc"><div class="t">' + esc(d.titre) + '</div>'
          + '<div class="d">' + esc(d.desc) + '</div>'
          + '<div class="b"><button class="prim" data-doc="' + esc(d.cle) + '"'
          + (OCCUPE ? ' disabled' : '') + '>Ouvrir'
          + (d.trim ? ' — T' + (TRIM + 1) : '') + '</button></div></div>';
      }).join('') + '</div>';
    h += '<div class="aide">Le <strong>profil d’entreprise</strong> (nom, NEQ, numéros de TPS et '
      + 'de TVQ, adresse) se remplit à l’écran de la fenêtre principale — c’est lui qui garnit '
      + 'l’en-tête de ces documents.</div>';
    return h;
  }

  function tuile(v, l, sub, cl){
    return '<div class="s"><div class="n' + (cl ? ' ' + cl : '') + '">' + esc(v) + '</div>'
      + '<div class="l">' + esc(l) + '</div><div class="sub">' + esc(sub) + '</div></div>';
  }
  function rang(l, v, sub, fort){
    return '<div class="rang' + (fort ? ' fort' : '') + '"><span class="l">' + esc(l)
      + (sub ? '<span class="sub">' + esc(sub) + '</span>' : '') + '</span><b>' + esc(v) + '</b></div>';
  }

  function brancher(){
    var a = document.getElementById('i-annee');
    if (a) a.onchange = function(){ ANNEE = parseInt(a.value, 10) || 0; charger(); };
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); dessiner(); return; }
    var tq = t.closest('[data-trim]');
    if (tq) { TRIM = parseInt(tq.getAttribute('data-trim'), 10) || 0; dessiner(); return; }
    var dc = t.closest('[data-doc]');
    if (dc) {
      if (OCCUPE) return;
      OCCUPE = true; dessiner();
      dire('Composition du document…');
      appeler('impot:document', [dc.getAttribute('data-doc'), D.annee, TRIM]).then(function(r){
        OCCUPE = false; dessiner();
        dire(r.ok ? 'Document ouvert dans la fenêtre principale — prêt à imprimer.' : expliquer(r),
          r.ok ? 'bon' : 'err');
      });
    }
  };

  var enCours = false;
  function charger(){
    if (enCours) return;
    enCours = true;
    appeler('impot:donnees', [{ annee: ANNEE, onglet: ONGLET }]).then(function(r){
      enCours = false;
      if (!r || !r.ok) { vide('Fiscalité indisponible', expliquer(r)); return; }
      D = r;
      ANNEE = D.annee;
      var s = document.getElementById('sous');
      if (s) s.textContent = D.annee + ' · ' + D.taxes.totalRemettre + ' à remettre';
      dessiner();
    });
  }

  /* ⚠ JAMAIS PENDANT LA COMPOSITION D UN DOCUMENT. */
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
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageImpot };
