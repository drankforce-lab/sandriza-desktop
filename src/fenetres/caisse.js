'use strict';

/*
 * FENÊTRE « VENTE AU COMPTOIR » — NATIVE
 * =============================================================================
 * L'écran le plus utilisé de la boutique, écrit dans l'application. Il ne charge
 * aucune page du site et ne fait aucun appel web : tout passe par le pont, qui
 * interroge la fenêtre principale — seule porteuse de la session.
 *
 * ⚠ ELLE VIT À CÔTÉ DE L'ÉCRAN DU SITE, PAS À SA PLACE (décision du 2026-08-07).
 * Les deux coexistent le temps que la caisse native soit éprouvée en boutique.
 * Ce n'est pas de la prudence de principe : si cette fenêtre a un défaut le jour
 * d'un marché, il doit rester un écran qui encaisse. L'écran du site sera retiré
 * quand celle-ci aura fait ses preuves, pas avant.
 *
 * ⚠⚠ AUCUNE RÈGLE DE VENTE N'EST ÉCRITE ICI. Ni taxes, ni prix, ni rabais, ni
 * statut de commande, ni décompte de stock. Tout cela vit dans le site
 * (`Admin._posVente`, `Cart.calcTotals`) et n'existe qu'en UN exemplaire. Cette
 * fenêtre SAISIT et AFFICHE ; elle ne calcule rien. En recopier ne serait-ce que
 * le calcul de taxes garantirait qu'un jour les deux écrans ne donnent plus le
 * même total pour le même panier — et la différence se verrait en comptabilité,
 * des semaines plus tard, sans qu'on sache lequel a raison.
 *
 * ⚠ ELLE N'ENCAISSE JAMAIS UNE CARTE. Saisir un numéro ici ferait basculer la
 * boutique en PCI SAQ-D. On enregistre un paiement DÉJÀ REÇU (comptant, Interac,
 * terminal), ou l'on envoie un lien de paiement pour une vente au téléphone.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, et un accent grave égaré
 * referme la chaîne et casse toute la fenêtre. C'est arrivé six fois sur ce
 * projet, dont deux fois dans un commentaire.
 */

const { JS_ACTIVITE } = require('./socle.js');

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
.tete .ic{font-size:1.05rem}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{margin-left:auto;font-size:.73rem;color:#8fa1b8}

/* ⚠ DEUX COLONNES, ET LE CORPS NE DEFILE PAS. La regle du projet : un ecran de
   travail qui defile cache son bouton d action. Seule la LISTE DES ARTICLES a le
   droit de defiler — elle peut grandir, le reste non. */
.corps{flex:1 1 auto;min-height:0;padding:.85rem 1.05rem;overflow:hidden;
  display:grid;grid-template-columns:minmax(0,1.25fr) minmax(340px,.85fr);gap:.85rem}
.col{min-width:0;min-height:0;display:flex;flex-direction:column;gap:.7rem}
/* Sous 1000 px on repasse en UNE colonne et on autorise le defilement : ecraser
   un champ de montant est plus risque que faire defiler. */
@media (max-width:1000px){
  .corps{grid-template-columns:1fr;overflow-y:auto}
  .col{min-height:auto}
}

.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.8rem .9rem;flex:0 0 auto;min-height:0}
.carte.plein{flex:1 1 auto;display:flex;flex-direction:column;min-height:0}
.carte h2{margin:0 0 .55rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.09em;color:#8fa1b8;font-weight:700}
.carte h2 .note{font-weight:400;text-transform:none;letter-spacing:0;color:#6d7f96}
.carte h2 .lie{color:#4ade80;font-size:.68rem;margin-left:.4rem}

input,select{font:inherit;color:#e8edf5;background:#0f1826;
  border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:.38rem .55rem;
  width:100%;min-width:0}
input:focus,select:focus{outline:none;border-color:#c9a97e}
input[type=checkbox]{width:auto}
.r3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.4rem}
.r2{display:grid;grid-template-columns:1fr 1fr;gap:.4rem}
.sous-ch{font-size:.71rem;color:#6d7f96;margin-top:.22rem}

/* Le champ de scan : plus grand que les autres, c est la porte d entree. */
#scan{font-size:1.02rem;padding:.5rem .65rem}

/* Resultats de recherche : hauteur bornee. Huit articles et leurs variantes
   repousseraient les totaux hors de l ecran. */
.res{margin-top:.55rem;border:1px solid rgba(255,255,255,.1);border-radius:9px;
  max-height:32vh;overflow-y:auto}
.res .art{padding:.5rem .65rem;border-top:1px solid rgba(255,255,255,.06)}
.res .art:first-child{border-top:0}
.res .nom{font-weight:600;font-size:.87rem}
.res .code{font-family:ui-monospace,monospace;font-size:.73rem;opacity:.55;margin-left:.35rem}
.res .vars{display:flex;flex-wrap:wrap;gap:.28rem;margin-top:.3rem}
.res .vars button{font-size:.74rem;padding:.14rem .5rem}
.res .vars button .q{opacity:.6}

/* Liste des articles vendus : la seule zone qui defile. */
.lignes{flex:1 1 auto;min-height:0;overflow-y:auto}
table{width:100%;border-collapse:collapse;font-size:.86rem}
thead th{position:sticky;top:0;background:#1b2635;text-align:left;
  padding:.35rem .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700}
thead th.d{text-align:right}
tbody td{padding:.3rem .5rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody td.d{text-align:right;white-space:nowrap}
tbody td.c{text-align:center;white-space:nowrap}
tbody .det{font-size:.74rem;color:#8fa1b8}
/* Le code de variante : c est ce qu on lit sur l etiquette du vetement, donc
   la seule facon de verifier a l ecran qu on a scanne le bon article. */
tbody .code{font-family:ui-monospace,monospace;font-size:.72rem;color:#6d7f96}
tbody button{padding:.05rem .42rem;font-size:.9rem;line-height:1.3}

/* Totaux : la ligne du total ne peut pas se confondre avec une taxe. */
.tot .l{display:flex;justify-content:space-between;gap:1rem;padding:.16rem 0;font-size:.87rem}
.tot .l.grand{margin-top:.35rem;padding-top:.45rem;
  border-top:1px solid rgba(255,255,255,.14);font-size:1.12rem;font-weight:700}
.tot .l.bon{color:#4ade80}

button{font:inherit;cursor:pointer;border-radius:8px;padding:.36rem .8rem;
  border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);
  color:#e8edf5;transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
button.prim:hover:not(:disabled){background:#d8bd97;border-color:#d8bd97}
button.large{width:100%;padding:.6rem .8rem;font-size:1.02rem;margin-top:.5rem}
button.mini{padding:.16rem .45rem;font-size:.75rem}

.cli{padding:.38rem .6rem;cursor:pointer;font-size:.84rem;
  border-top:1px solid rgba(255,255,255,.06)}
.cli:first-child{border-top:0}
.cli:hover{background:rgba(255,255,255,.05)}
.cli .m{color:#8fa1b8;font-size:.77rem}
.liste-cli{margin-top:.4rem;border:1px solid rgba(255,255,255,.1);border-radius:9px;overflow:hidden}

.case{display:flex;align-items:flex-start;gap:.45rem;margin-top:.5rem;
  font-size:.79rem;cursor:pointer}
.case .exp{display:block;color:#6d7f96;font-size:.72rem;line-height:1.45}

.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);
  background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
.actions{flex:0 0 auto;display:flex;gap:.4rem}

.aide{font-size:.72rem;color:#6d7f96;line-height:1.45;margin-top:.4rem}
.vide{padding:1.6rem 1rem;text-align:center;color:#8fa1b8;font-size:.86rem}

/* Le compte rendu de vente : un voile, pas une autre fenetre. Une boite de
   dialogue du systeme se serait ouverte derriere, comme le decompte d inactivite. */
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.5rem;z-index:50}
.voile .boite{background:#16202f;border:1px solid rgba(255,255,255,.12);
  border-radius:13px;padding:1.15rem 1.3rem;max-width:34rem;width:100%}
.voile h3{margin:0 0 .6rem;font:700 1.06rem/1.25 Georgia,serif}
.voile .rangee{display:flex;justify-content:space-between;gap:1rem;
  padding:.26rem 0;font-size:.86rem;border-top:1px solid rgba(255,255,255,.06)}
.voile .rangee:first-of-type{border-top:0}
.voile .fin{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.9rem}
.voile .lien{display:flex;gap:.4rem;margin-top:.55rem}
.voile .lien input{font-family:ui-monospace,monospace;font-size:.78rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Vente au comptoir ». */
function pageCaisse() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Vente au comptoir — Administration Sandriza</title>
<style>${CSS}</style></head><body>
<div class="tete"><span class="ic">🧾</span><h1>Vente au comptoir</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps">
  <div class="col">
    <div class="carte">
      <input id="scan" autocomplete="off" placeholder="Scannez le code-barres, ou tapez un nom d’article…">
      <div id="res"></div>
    </div>
    <div class="carte plein">
      <h2>Articles</h2>
      <div class="lignes" id="lignes"></div>
    </div>
  </div>
  <div class="col">
    <div class="carte">
      <h2>Client <span class="note">— facultatif</span><span class="lie" id="lie"></span></h2>
      <div class="r3">
        <input id="c-nom" autocomplete="off" placeholder="Nom">
        <input id="c-mail" autocomplete="off" placeholder="Courriel">
        <input id="c-tel" autocomplete="off" placeholder="Téléphone">
      </div>
      <div id="c-res"></div>
      <label class="case"><input type="checkbox" id="c-creer">
        <span>Ouvrir un compte et lui envoyer le lien pour le finaliser
        <span class="exp">Courriel requis. Il garde l’historique de ses achats et peut demander
        un retour. Aucune inscription à l’infolettre : il choisira lui-même.</span></span></label>
      <h2 style="margin-top:.75rem">Vente</h2>
      <div class="r3">
        <select id="v-prov" title="Province — elle détermine les taxes"></select>
        <input id="v-liv" inputmode="decimal" value="0.00" title="Livraison" placeholder="Livraison">
        <input id="v-rab" inputmode="decimal" value="0.00" title="Rabais" placeholder="Rabais">
      </div>
      <div class="sous-ch">Province · Livraison · Rabais</div>
      <h2 style="margin-top:.75rem">Facture</h2>
      <select id="v-remise" title="Ce qu’on fait de la facture après la vente"></select>
      <div class="sous-ch">L’envoi par courriel exige une adresse. Elle reste
        toujours consultable dans Facturation.</div>
    </div>
    <div class="carte tot" id="totaux"></div>
    <div class="carte">
      <h2>Encaissement</h2>
      <div class="r2">
        <select id="v-paie"></select>
        <input id="v-note" placeholder="Note interne (facultatif)">
      </div>
      <button class="prim large" id="btn-vendre" disabled>Enregistrer la vente</button>
      <div class="aide">Cet écran n’encaisse jamais la carte : saisir un numéro ici
        sortirait la boutique de son régime de conformité.</div>
    </div>
  </div>
</div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions">
    <button id="btn-vider">Vider la vente</button>
    <button id="btn-fermer">Fermer</button>
  </span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}
  var msg = document.getElementById('msg');
  var CTX = null;            // contexte recu du site (provinces, moyens, droits)
  var LIGNES = [];           // { productId, name, size, color, price, quantity }
  var CLI = null;            // identifiant du compte lie, s il y en a un
  var TOT = null;            // dernier compte rendu de totaux, venu du SITE
  var enVente = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ msg.className = 'msg' + (cl ? ' ' + cl : ''); msg.textContent = t || ''; }
  function argent(n){
    var v = (Math.round((parseFloat(n) || 0) * 100) / 100).toFixed(2);
    return v.replace('.', ',') + ' $';
  }

  // ⚠ CHAQUE REFUS DU PONT A SA PHRASE. Un ecran muet sur un refus de droit
  // ressemble a une panne, et on cherche au mauvais endroit — chez l imprimante,
  // dans le reseau, partout sauf dans les permissions.
  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne permet pas d’encaisser une vente.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps. Réessayez ; si cela persiste, rechargez-la (Ctrl+R).',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cet article n’existe plus.',
    aucun_article:      'Aucun article dans la vente.',
    total_invalide:     'Total invalide — la vente n’a pas été enregistrée.',
    courriel_invalide:  'Un courriel valide est requis pour ouvrir un compte.',
    taxes_indisponibles:'Moteur de taxes indisponible — n’encaissez pas.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(m){ return MOTIFS[m] || 'Erreur inattendue (' + esc(m || '?') + ').'; }

  // ⚠ UN SEUL POINT D APPEL, avec le rattrapage CHAINE. Le second argument de
  // << then >> ne rattrape que le rejet de la promesse d avant : ce que le premier
  // LEVE lui passe a cote et devient un rejet non traite, invisible dans une
  // fenetre native. Cette nuance a couche la fenetre Imprimantes pendant quatre
  // versions publiees (2026-08-07). Ici, tout passe par appeler().
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  // ══ TOTAUX ════════════════════════════════════════════════════════════════
  // ⚠ ILS VIENNENT DU SITE, TOUJOURS. Additionner ici serait plus simple et plus
  // rapide — et ce serait la faute la plus couteuse possible : deux calculs de
  // taxes qui divergent d un ecran a l autre, decouverts en comptabilite des
  // semaines plus tard, sans savoir lequel a raison.
  var totT = null;
  function majTotaux(){
    clearTimeout(totT);
    // Anti-rebond : changer la province, la livraison et le rabais a la suite ne
    // doit pas declencher trois allers-retours vers la fenetre principale.
    totT = setTimeout(function(){
      if (!LIGNES.length) { TOT = null; dessinerTotaux(); majBouton(); return; }
      appeler('caisse:totaux', [LIGNES, val('v-prov'), val('v-liv'), val('v-rab')]).then(function(r){
        if (!r.ok) { TOT = null; dire(expliquer(r.motif), 'err'); }
        else { TOT = r; dire(''); }
        dessinerTotaux(); majBouton();
      });
    }, 150);
  }

  function dessinerTotaux(){
    var z = document.getElementById('totaux');
    if (!TOT) {
      z.innerHTML = '<div class="vide">' + (LIGNES.length
        ? 'Calcul des totaux…'
        : 'Aucun article — scannez un code-barres pour commencer.') + '</div>';
      return;
    }
    var h = '<div class="l"><span>Sous-total</span><span>' + argent(TOT.sousTotal) + '</span></div>';
    if (TOT.rabais > 0) h += '<div class="l bon"><span>Rabais</span><span>-' + argent(TOT.rabais) + '</span></div>';
    if (TOT.livraison > 0) h += '<div class="l"><span>Livraison</span><span>' + argent(TOT.livraison) + '</span></div>';
    (TOT.taxes || []).forEach(function(x){
      // Le taux est affiche : c est ce qui permet de verifier une taxe d un coup
      // d oeil quand une vente part vers une autre province.
      var taux = (Math.round((x.taux || 0) * 1000000) / 10000);
      h += '<div class="l"><span>' + esc(x.nom) + ' (' + taux + ' %)</span><span>'
        + argent(x.montant) + '</span></div>';
    });
    h += '<div class="l grand"><span>Total</span><span>' + argent(TOT.total) + '</span></div>';
    z.innerHTML = h;
  }

  function majBouton(){
    var b = document.getElementById('btn-vendre');
    var pret = !!(TOT && TOT.total > 0 && LIGNES.length && CTX && CTX.peutVendre && !enVente);
    b.disabled = !pret;
    b.textContent = enVente ? 'Enregistrement…'
      : (pret ? 'Enregistrer la vente — ' + argent(TOT.total) : 'Enregistrer la vente');
    document.getElementById('btn-vider').disabled = !LIGNES.length || enVente;
  }

  function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }

  // ══ ARTICLES ══════════════════════════════════════════════════════════════
  function dessinerLignes(){
    var z = document.getElementById('lignes');
    if (!LIGNES.length) {
      z.innerHTML = '<div class="vide">Aucun article — scannez un code-barres pour commencer.</div>';
      return;
    }
    var corps = LIGNES.map(function(l, i){
      var det = [l.size, l.color].filter(Boolean).join(' / ') || '—';
      return '<tr>'
        + '<td><strong>' + esc(l.name) + '</strong><span class="det"> · ' + esc(det) + '</span>'
        + (l.sku ? '<div class="code">' + esc(l.sku) + '</div>' : '') + '</td>'
        + '<td class="c"><button data-q="' + i + '" data-d="-1">−</button>'
        + ' <strong>' + l.quantity + '</strong> '
        + '<button data-q="' + i + '" data-d="1">+</button></td>'
        + '<td class="d">' + argent(l.price) + '</td>'
        + '<td class="d"><strong>' + argent(l.price * l.quantity) + '</strong></td>'
        + '<td class="c"><button data-retirer="' + i + '" title="Retirer">✕</button></td>'
        + '</tr>';
    }).join('');
    z.innerHTML = '<table><thead><tr><th>Article</th><th class="c">Qté</th>'
      + '<th class="d">Prix</th><th class="d">Total</th><th></th></tr></thead>'
      + '<tbody>' + corps + '</tbody></table>';
  }

  function ajouter(pid, taille, couleur){
    var cle = pid + '|' + (taille || '') + '|' + (couleur || '');
    var ex = null;
    for (var i = 0; i < LIGNES.length; i++) {
      if ((LIGNES[i].productId + '|' + LIGNES[i].size + '|' + LIGNES[i].color) === cle) { ex = LIGNES[i]; break; }
    }
    if (ex) { ex.quantity++; apresAjout(); return; }
    // ⚠ LE PRIX EST DEMANDE AU SITE, jamais devine ici : c est lui qui connait les
    // promotions en cours. Un prix recopie dans cette fenetre vendrait au plein
    // tarif un article en solde, et personne ne s en apercevrait avant la facture.
    appeler('caisse:article', [pid, taille, couleur]).then(function(r){
      if (!r.ok) { dire(expliquer(r.motif), 'err'); return; }
      LIGNES.push(r.ligne);
      apresAjout();
    });
  }

  function apresAjout(){
    videRecherche();
    dessinerLignes();
    majTotaux();
    var s = document.getElementById('scan');
    if (s) { s.value = ''; s.focus(); }
  }

  function videRecherche(){ document.getElementById('res').innerHTML = ''; }

  // ══ RECHERCHE ET SCAN ═════════════════════════════════════════════════════
  // ⚠ ON NE REDESSINE QUE #res. Reconstruire la carte entiere detruirait le champ
  // ou l on vient de taper : curseur perdu, focus perdu, saisie impossible. Le
  // lecteur de codes-barres enchaine parfois deux articles sans qu on touche au
  // clavier — il ne doit rien perdre.
  var rechT = null;
  function chercher(texte, entree){
    clearTimeout(rechT);
    var q = String(texte || '').trim();
    if (!q) { videRecherche(); return; }
    // Trois caracteres minimum, la regle de toutes les recherches du projet. En
    // dessous on n affiche RIEN plutot que tout le catalogue.
    if (!entree && q.length < 3) { videRecherche(); return; }
    rechT = setTimeout(function(){
      appeler('caisse:chercher', [q]).then(function(r){
        if (!r.ok) { dire(expliquer(r.motif), 'err'); return; }
        dire('');
        // ⚠ LE CODE EXACT GAGNE TOUJOURS. C est ce que le lecteur envoie, et il
        // doit ajouter l article sans passer par une liste d un seul element.
        if (r.sku) { ajouter(r.sku.produitId, r.sku.taille, r.sku.couleur); return; }
        if (r.court) { videRecherche(); dire('Trois caractères minimum pour chercher.', 'att'); return; }
        dessinerResultats(r.articles || [], q);
      });
    }, entree ? 0 : 160);
  }

  function dessinerResultats(articles, q){
    var z = document.getElementById('res');
    if (!articles.length) {
      z.innerHTML = '<div class="res"><div class="art">Aucun article ne correspond à « '
        + esc(q) + ' ».</div></div>';
      return;
    }
    z.innerHTML = '<div class="res">' + articles.map(function(a){
      // ⚠ ON NE PROPOSE PAS UNE TAILLE ABSENTE. Le bouton est grise : vendre ce
      // qu on n a pas creerait un stock negatif que personne n a demande.
      var vars = (a.variantes || []).map(function(v){
        return '<button data-pid="' + esc(a.id) + '" data-sz="' + esc(v.taille) + '"'
          + ' data-col="' + esc(v.couleur) + '"'
          + (v.quantite <= 0 ? ' disabled title="Aucun en stock"' : '') + '>'
          + esc(v.cle) + ' <span class="q">(' + v.quantite + ')</span></button>';
      }).join('');
      return '<div class="art"><div class="nom">' + esc(a.nom)
        + (a.code ? '<span class="code">' + esc(a.code) + '</span>' : '') + '</div>'
        + '<div class="vars">' + (vars || '<span class="q">aucune variante</span>') + '</div></div>';
    }).join('') + '</div>';
  }

  // ══ CLIENT ════════════════════════════════════════════════════════════════
  var cliT = null;
  function chercherClient(texte){
    clearTimeout(cliT);
    // ⚠ MODIFIER L IDENTITE ROMPT LE LIEN AU COMPTE. Enregistrer la vente sous le
    // compte du client precedent serait la pire erreur de cet ecran, et elle
    // serait invisible.
    CLI = null;
    majLie();
    var q = String(texte || '').trim();
    if (q.length < 3) { document.getElementById('c-res').innerHTML = ''; return; }
    cliT = setTimeout(function(){
      appeler('caisse:client', [q]).then(function(r){
        if (!r.ok) { dire(expliquer(r.motif), 'err'); return; }
        if (r.exact) { remplirClient(r.exact); return; }
        var l = r.trouves || [];
        document.getElementById('c-res').innerHTML = l.length
          ? '<div class="liste-cli">' + l.map(function(u){
              return '<div class="cli" data-uid="' + esc(u.id) + '">'
                + '<strong>' + esc(u.nom || '(sans nom)') + '</strong>'
                + '<span class="m"> · ' + esc(u.courriel || 'sans courriel')
                + (u.commandes > 0 ? ' · ' + u.commandes + ' commande(s)' : '') + '</span></div>';
            }).join('') + '</div>'
          : '';
      });
    }, 160);
  }

  function remplirClient(u){
    CLI = u.id;
    document.getElementById('c-nom').value = u.nom || '';
    document.getElementById('c-mail').value = u.courriel || '';
    document.getElementById('c-tel').value = u.tel || '';
    // ⚠ LA PROVINCE SUIT LE CLIENT : c est elle qui determine les taxes, et la
    // ressaisir a la main est l erreur la plus couteuse de cet ecran.
    if (u.province) {
      var s = document.getElementById('v-prov');
      for (var i = 0; i < s.options.length; i++) {
        if (s.options[i].value === u.province) { s.value = u.province; break; }
      }
    }
    document.getElementById('c-res').innerHTML = '';
    majLie();
    majTotaux();
    dire('Fiche de ' + (u.nom || u.courriel) + ' reprise.', 'bon');
  }

  function majLie(){ document.getElementById('lie').textContent = CLI ? '✓ compte lié' : ''; }

  // ══ ENREGISTRER LA VENTE ══════════════════════════════════════════════════
  function vendre(){
    if (enVente || !LIGNES.length || !TOT || !(TOT.total > 0)) return;
    enVente = true; majBouton(); dire('Enregistrement…', 'att');
    appeler('caisse:vendre', [{
      lignes: LIGNES,
      prov: val('v-prov'), liv: val('v-liv'), rab: val('v-rab'),
      nom: val('c-nom').trim(), courriel: val('c-mail').trim(), tel: val('c-tel').trim(),
      moyen: val('v-paie'), note: val('v-note').trim(), remise: val('v-remise'),
      veutCompte: !!document.getElementById('c-creer').checked,
      cliId: CLI
    }]).then(function(r){
      enVente = false;
      if (!r.ok) { majBouton(); dire(expliquer(r.motif), 'err'); return; }
      // La vente est en base : on peut vider CETTE fenetre.
      LIGNES = []; CLI = null; TOT = null;
      document.getElementById('c-nom').value = '';
      document.getElementById('c-mail').value = '';
      document.getElementById('c-tel').value = '';
      document.getElementById('v-note').value = '';
      document.getElementById('c-creer').checked = false;
      document.getElementById('v-liv').value = '0.00';
      document.getElementById('v-rab').value = '0.00';
      majLie(); dessinerLignes(); dessinerTotaux(); majBouton(); dire('');
      compteRendu(r);
    });
  }

  /* ⚠ LE COMPTE RENDU EST UN VOILE DANS CETTE FENETRE, pas une boite du systeme.
     Une boite de dialogue se serait ouverte derriere la fenetre principale ou sur
     l autre ecran — exactement ce qui a rendu le decompte d inactivite invisible.
     Et il DIT ce qui n a pas marche : stock non decompte, base non confirmee,
     facture non partie. Une vente << reussie >> qui n a pas atteint la base est le
     genre de silence qu on paie a l inventaire. */
  function compteRendu(r){
    var lignes = '';
    lignes += rangee('Commande', esc(r.numero || '—'));
    lignes += rangee('Total', argent(r.total));
    if (r.enAttente) {
      lignes += rangee('Paiement', '<span style="color:#fbbf24">en attente — lien à envoyer</span>');
    } else {
      lignes += rangee('Stock décompté', r.stockOk ? 'oui'
        : '<strong style="color:#f87171">NON — à vérifier</strong>');
    }
    lignes += rangee('Enregistrement en base', r.nuageOk ? 'confirmé'
      : '<strong style="color:#f87171">non confirmé</strong>');
    if (r.envoiCourriel === true)  lignes += rangee('Facture', 'envoyée par courriel');
    if (r.envoiCourriel === false) lignes += rangee('Facture', '<strong style="color:#f87171">NON envoyée</strong>');
    if (r.compteNeuf) lignes += rangee('Compte client', 'ouvert · lien de finalisation envoyé');

    var lien = '';
    if (r.enAttente) {
      lien = r.lien && r.lien.url
        ? '<div class="lien"><input id="lien-url" readonly value="' + esc(r.lien.url) + '">'
          + '<button class="mini" id="btn-copier">📋 Copier</button></div>'
          + '<div class="aide">Le stock sera décompté et la facture marquée payée quand Square '
          + 'confirmera — automatiquement au retour du client. Rien n’est encaissé par cet écran.</div>'
        : '<div class="aide" style="color:#f87171">La commande est enregistrée, mais Square a refusé '
          + 'de créer le lien : ' + esc(r.lienMotif || 'raison inconnue') + '. Réessayez depuis la '
          + 'commande, ou encaissez autrement.</div>';
    }

    var avis = (r.avis || []).map(function(a){
      var c = a.ton === 'error' ? '#f87171' : (a.ton === 'warning' ? '#fbbf24' : '#4ade80');
      return '<div class="aide" style="color:' + c + '">' + esc(a.texte) + '</div>';
    }).join('');

    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite"><h3>' + (r.enAttente ? '🔗 Vente en attente de paiement'
      : '✅ Vente enregistrée') + '</h3>' + lignes + lien + avis
      + '<div class="fin"><button class="prim" id="btn-ok">Continuer</button></div></div>';
    document.body.appendChild(v);
    var ok = document.getElementById('btn-ok');
    ok.onclick = function(){
      v.remove();
      var s = document.getElementById('scan');
      if (s) s.focus();
    };
    ok.focus();
    var cp = document.getElementById('btn-copier');
    if (cp) cp.onclick = function(){
      var i = document.getElementById('lien-url');
      i.select();
      // ⚠ execCommand ET NON navigator.clipboard : une fenetre native est
      // chargee en data:, son origine est nulle, donc elle n est PAS un contexte
      // securise — l API moderne du presse-papiers y est refusee. Mesure sur ce
      // projet ; le vieil appel, lui, fonctionne.
      var fait = false;
      try { fait = document.execCommand('copy'); } catch (e) { fait = false; }
      cp.textContent = fait ? '✓ Copié' : 'Ctrl+C pour copier';
    };
  }

  function rangee(k, v){
    return '<div class="rangee"><span style="color:#8fa1b8">' + k + '</span><span>' + v + '</span></div>';
  }

  // ══ DEMARRAGE ═════════════════════════════════════════════════════════════
  function remplirListe(id, options, defaut){
    var s = document.getElementById(id);
    s.innerHTML = options.map(function(o){
      var v = (o.cle != null) ? o.cle : o;
      var t = (o.libelle != null) ? o.libelle : o;
      return '<option value="' + esc(v) + '"' + (v === defaut ? ' selected' : '') + '>' + esc(t) + '</option>';
    }).join('');
  }

  function demarrer(){
    appeler('caisse:contexte').then(function(r){
      if (!r.ok) {
        // ⚠ ON DESARME L ECRAN AU LIEU DE LE LAISSER CROIRE QU IL PEUT VENDRE.
        document.getElementById('corps').innerHTML =
          '<div class="vide" style="grid-column:1/-1"><div style="font-size:1rem;color:#e8edf5;margin-bottom:.4rem">'
          + 'Caisse indisponible</div>' + esc(expliquer(r.motif)) + '</div>';
        dire(expliquer(r.motif), 'err');
        return;
      }
      CTX = r;
      remplirListe('v-prov', r.provinces, 'QC');
      remplirListe('v-paie', r.paiements, 'terminal');
      remplirListe('v-remise', r.remises, 'courriel');
      document.getElementById('sous').textContent = r.par
        ? (r.par + (r.peutVendre ? '' : ' · lecture seule')) : '';
      if (!r.peutVendre) dire('Votre rôle ne permet pas d’enregistrer une vente.', 'att');
      dessinerLignes(); dessinerTotaux(); majBouton();
      var s = document.getElementById('scan');
      if (s) s.focus();
    });
  }

  // ── Ecouteurs ──────────────────────────────────────────────────────────────
  document.getElementById('scan').oninput = function(){ chercher(this.value, false); };
  document.getElementById('scan').onkeydown = function(ev){
    if (ev.key === 'Enter') { ev.preventDefault(); chercher(this.value, true); }
  };
  ['c-nom','c-mail','c-tel'].forEach(function(id){
    document.getElementById(id).oninput = function(){ chercherClient(this.value); };
  });
  ['v-prov','v-liv','v-rab'].forEach(function(id){
    document.getElementById(id).onchange = function(){ majTotaux(); };
  });
  document.getElementById('btn-vendre').onclick = vendre;
  document.getElementById('btn-vider').onclick = function(){
    LIGNES = []; TOT = null; videRecherche();
    dessinerLignes(); dessinerTotaux(); majBouton(); dire('');
    var s = document.getElementById('scan'); if (s) s.focus();
  };
  document.getElementById('btn-fermer').onclick = function(){ P.fermer(); };

  // ⚠ ECOUTEURS DELEGUES. Les boutons de variante, de quantite et de retrait sont
  // redessines a chaque changement : un ecouteur pose sur chacun serait reperdu
  // aussitot. On ecoute une fois, sur le corps, en remontant depuis la cible.
  document.getElementById('corps').addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var v = t.closest('.vars button');
    if (v && !v.disabled) {
      ajouter(v.getAttribute('data-pid'), v.getAttribute('data-sz'), v.getAttribute('data-col'));
      return;
    }
    var q = t.closest('[data-q]');
    if (q) {
      var i = parseInt(q.getAttribute('data-q'), 10);
      var d = parseInt(q.getAttribute('data-d'), 10);
      if (LIGNES[i]) {
        LIGNES[i].quantity = Math.max(1, LIGNES[i].quantity + d);
        dessinerLignes(); majTotaux();
      }
      return;
    }
    var rr = t.closest('[data-retirer]');
    if (rr) {
      LIGNES.splice(parseInt(rr.getAttribute('data-retirer'), 10), 1);
      dessinerLignes(); majTotaux();
      return;
    }
    var c = t.closest('.cli');
    if (c) {
      var uid = c.getAttribute('data-uid');
      appeler('caisse:client', [uid]).then(function(){ /* rien : on relit ci-dessous */ });
      // On a deja la fiche dans la liste affichee : inutile de la redemander.
      var nom = c.querySelector('strong');
      remplirClient({ id: uid, nom: nom ? nom.textContent : '',
        courriel: (document.getElementById('c-mail').value || ''),
        tel: (document.getElementById('c-tel').value || ''), province: '' });
    }
  });

  // Ctrl+S n a pas de sens ici, mais Echap doit fermer comme partout ailleurs.
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && !document.querySelector('.voile')) { ev.preventDefault(); P.fermer(); }
  });

  demarrer();
})();
</script>
</body></html>`;
}

module.exports = { pageCaisse };
