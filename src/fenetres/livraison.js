'use strict';

/*
 * FENÊTRE « CONFIGURATION DE LA LIVRAISON » — NATIVE (Livraison, palier 5)
 * =============================================================================
 * La livraison internationale et la tarification (frais standard, seuil de
 * livraison gratuite, supplément de traitement prioritaire).
 *
 * ⚠ AUCUN SECRET ICI : ce ne sont que des montants. Les identifiants des
 * transporteurs vivent dans une AUTRE fenêtre (Transporteurs), avec leur propre
 * discipline anti-perte.
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
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:#f0d6a0;border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:grid;grid-template-columns:repeat(auto-fit,minmax(26rem,1fr));gap:1rem;align-content:start}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:1rem 1.1rem;min-width:0;display:flex;flex-direction:column}
.carte h2{margin:0 0 .1rem;font:700 .8rem/1.2 system-ui;text-transform:uppercase;letter-spacing:.05em;color:#cbd8e6}
.carte .sous{margin:0 0 .9rem;font-size:.78rem;color:#6d7f96}
.ch{margin:0 0 .85rem}
.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.25rem;font-size:.78rem;color:#8fa1b8}
.ch .aide{font-size:.72rem;color:#6d7f96;margin-top:.2rem}
.ch input[type=number]{width:12rem;max-width:100%;font:inherit;color:#e8edf5;background:#0f1724;
  border:1px solid #2b3444;border-radius:8px;padding:.42rem .55rem}
.ch input:focus{outline:none;border-color:#c9a97e}
.ch input:disabled{opacity:.55}
.bascule{display:flex;align-items:flex-start;gap:.6rem;font-size:.86rem;cursor:pointer;
  -webkit-user-select:none;user-select:none}
.bascule input{width:1.1rem;height:1.1rem;accent-color:#c9a97e;cursor:pointer;margin-top:.15rem;flex:0 0 auto}
.bascule .d{font-size:.74rem;color:#6d7f96;display:block;margin-top:.1rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.42rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
.vide{padding:1rem;text-align:center;color:#8fa1b8;font-size:.82rem}
/* Pays desservis — la carte occupe toute la largeur : deux cents lignes ne
   tiennent pas dans une demi-colonne. */
.carte.large{grid-column:1/-1}
.pbarre{display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem;flex-wrap:wrap}
.pbarre .info{font-size:.74rem;color:#8fa1b8;flex:1 1 12rem;min-width:0}
.ptab{max-height:22rem;overflow-y:auto;border:1px solid rgba(255,255,255,.07);border-radius:9px}
.ptab::-webkit-scrollbar{width:8px}
.ptab::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
table.pays{width:100%;border-collapse:collapse}
table.pays th{position:sticky;top:0;background:#131c2b;text-align:left;font:700 .68rem/1.3 system-ui;
  text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8;padding:.45rem .7rem;
  border-bottom:1px solid rgba(255,255,255,.1)}
table.pays td{padding:.38rem .7rem;border-bottom:1px solid rgba(255,255,255,.05);font-size:.84rem}
table.pays tr.off td{opacity:.42}
table.pays .code{color:#6d7f96;font:.72rem ui-monospace,Menlo,Consolas,monospace;margin-left:.35rem}
table.pays .oui{color:#4ade80;font-weight:600;font-size:.78rem}
table.pays .non{color:#6d7f96;font-size:.78rem}
table.pays .ets{font-size:.7rem;color:#8fa1b8;margin-top:1px}
table.pays .etschk{display:flex;flex-wrap:wrap;gap:.2rem .6rem;justify-content:center}
table.pays .etschk label{display:inline-flex;align-items:center;gap:.25rem;font-size:.76rem;cursor:pointer;color:#e8edf5;-webkit-user-select:none;user-select:none}
table.pays .verrou{color:#6d7f96;font-size:.74rem}
table.pays td.mid{text-align:center}
table.pays input[type=checkbox]{width:1rem;height:1rem;accent-color:#c9a97e;cursor:pointer}
.pfiltre{font:inherit;color:#e8edf5;background:#0f1724;border:1px solid #2b3444;
  border-radius:8px;padding:.32rem .5rem;width:12rem}
.pfiltre:focus{outline:none;border-color:#c9a97e}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageLivraison() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Configuration de la livraison — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🚚</span><h1>Configuration de la livraison</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter les réglages, pas les modifier.</div>
<div class="corps" id="corps"><div class="carte"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-save" disabled>Enregistrer</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  /* ── MODE ANCRE ── le meme bouton d'ancrage/detachement que les autres ecrans.
     La coquille appelle szModeAncre(true) quand la vue est ANCREE, (false) quand
     elle est DETACHEE ; on montre le bon libelle et on route vers le pont. */
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
        + 'color:#e8edf5;cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
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
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var bsave = document.getElementById('b-save');
  var D = null, RO = false, OCCUPE = false;
  var PAYS = null;      // { pays:[...], nbInscrits, maj } — lu chez Stripe, jamais recopie
  var FILTRE = '';      // filtre de la liste (deux cents lignes)

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule : la livraison ne peut pas être modifiée.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    nuage:              'L’enregistrement dans le nuage a échoué. Réessayez.',
    echec:              'L’opération a échoué.'
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
  function num(v){ return (v == null || v === '') ? '' : String(v); }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    var d = D || {};
    var dis = RO ? ' disabled' : '';
    var h = [];
    h.push('<div class="carte"><h2>Livraison internationale</h2>'
      + '<p class="sous">Permet aux clientes de saisir une adresse hors Canada.</p>'
      + '<label class="bascule"><input type="checkbox" id="f-intl"' + (d.international ? ' checked' : '') + dis + '>'
      + '<span><strong>Activer la livraison internationale</strong>'
      + '<span class="d">La recherche d’adresse s’adapte au monde entier et un champ Pays apparaît à la caisse.</span></span></label></div>');
    h.push('<div class="carte"><h2>Tarification</h2>'
      + '<div class="ch"><label>Frais de livraison standard (CA$)</label>'
      + '<input id="f-cost" type="number" min="0" step="0.01" value="' + esc(num(d.shippingCost)) + '"' + dis + '>'
      + '<div class="aide">Facturé quand la commande n’atteint pas le seuil de livraison gratuite.</div></div>'
      + '<div class="ch"><label>Seuil pour la livraison gratuite (CA$)</label>'
      + '<input id="f-thr" type="number" min="0" step="1" value="' + esc(num(d.freeThreshold)) + '"' + dis + '>'
      + '<div class="aide">Au-dessus de ce montant, la livraison est gratuite. <strong>0</strong> désactive.</div></div>'
      + '<div class="ch"><label>Frais traitement prioritaire ⚡ (CA$)</label>'
      + '<input id="f-prio" type="number" min="0" step="0.01" value="' + esc(num(d.priorityCost)) + '"' + dis + '>'
      + '<div class="aide">Supplément si la cliente choisit le traitement prioritaire. <strong>0</strong> masque l’option.</div></div></div>');
    /* ⚠ LE TABLEAU N EXISTE QUE SI L INTERNATIONAL EST ALLUME. Demande expresse :
       decoche, on ne doit plus rien voir ni toucher de ce qui a trait a
       l international. On lit l etat REEL de la case a l ecran (pas seulement
       celui charge) pour que le tableau apparaisse et disparaisse tout de suite. */
    if (d.international) h.push(paysHtml());
    corps.innerHTML = h.join('');
    bsave.disabled = RO || OCCUPE;
    var fintl = document.getElementById('f-intl');
    if (fintl) fintl.onchange = function(){
      if (!D) D = {};
      D.international = fintl.checked;
      dessiner();
      dire(fintl.checked
        ? 'Enregistrez pour activer, puis relisez vos inscriptions Stripe.'
        : 'Enregistrez pour désactiver.', 'att');
    };
    brancherPays();
  }

  /* ══ PAYS DESSERVIS ════════════════════════════════════════════════════════
     ⚠ CE TABLEAU N EST PAS UNE LISTE D AUTORISATIONS. La colonne << Inscription
     Stripe >> est LUE CHEZ STRIPE, pas conservee chez nous : une copie
     vieillirait, et un pays retire la-bas resterait propose ici. La seule chose
     qu on enregistre est l inverse — les pays ou l on ne veut PAS livrer malgre
     l inscription. Ajouter un pays chez Stripe l ouvre tout seul. */
  function paysHtml(){
    if (!PAYS) {
      return '<div class="carte large"><h2>Pays desservis</h2>'
        + '<div class="vide">Lecture des destinations…</div></div>';
    }
    var q = FILTRE.toLowerCase();
    var l = PAYS.pays.filter(function(p){
      return !q || p.nom.toLowerCase().indexOf(q) !== -1 || p.code.toLowerCase().indexOf(q) !== -1;
    });
    // Les pays inscrits d abord : c est la seule partie actionnable.
    var inscrits = l.filter(function(p){ return p.inscrit; });
    var autres = l.filter(function(p){ return !p.inscrit; });
    var dis = RO ? ' disabled' : '';
    var ligne = function(p){
      // ⚠ p.etats = [{code, livre}] : chaque etat inscrit a SA case (on peut livrer
      // a NY et pas au TX). Sans etats : une seule case pour le pays.
      var ets = p.etats || [];
      var etsCodes = ets.map(function(e){ return e.code; });
      var cell;
      if (!p.inscrit) cell = '<span class="verrou" title="Ajoutez l inscription fiscale dans Stripe pour ouvrir ce pays">verrouillé</span>';
      else if (ets.length) cell = '<div class="etschk">' + ets.map(function(e){
          return '<label><input type="checkbox" data-pays="' + esc(p.code) + '" data-etat="' + esc(e.code) + '"'
            + (e.livre ? ' checked' : '') + dis + '>' + esc(e.code) + '</label>';
        }).join('') + '</div>';
      else cell = '<input type="checkbox" data-pays="' + esc(p.code) + '"' + (p.livre ? ' checked' : '') + dis + '>';
      return '<tr class="' + (p.inscrit ? '' : 'off') + '">'
        + '<td>' + esc(p.nom) + '<span class="code">' + esc(p.code) + '</span></td>'
        + '<td>' + (p.inscrit
            ? '<span class="oui">✓ inscrit</span>'
              + (etsCodes.length ? '<div class="ets">' + esc(etsCodes.join(', ')) + '</div>' : '')
            : '<span class="non">—</span>') + '</td>'
        + '<td class="mid">' + cell + '</td></tr>';
    };
    var maj = PAYS.maj ? new Date(PAYS.maj).toLocaleString('fr-CA') : 'jamais';
    return '<div class="carte large"><h2>Pays desservis</h2>'
      + '<p class="sous">Un pays n’est livrable que si une <strong>inscription fiscale active</strong> '
      + 'existe dans Stripe — c’est ce qui garantit qu’on perçoit la bonne taxe au lieu de zéro. '
      + 'Décochez un pays pour ne pas y livrer malgré l’inscription.</p>'
      + '<div class="pbarre">'
      + '<input class="pfiltre" id="p-filtre" type="search" placeholder="Filtrer…" value="' + esc(FILTRE) + '">'
      + '<span class="info">' + PAYS.nbInscrits + ' pays inscrit' + (PAYS.nbInscrits > 1 ? 's' : '')
      + ' · dernière lecture : ' + esc(maj) + '</span>'
      + '<button id="p-relire"' + (OCCUPE ? ' disabled' : '') + '>↻ Relire Stripe</button></div>'
      + '<div class="ptab"><table class="pays"><thead><tr>'
      + '<th>Pays</th><th>Inscription Stripe</th><th style="text-align:center">On livre</th>'
      + '</tr></thead><tbody>'
      + (l.length ? inscrits.map(ligne).join('') + autres.map(ligne).join('')
                  : '<tr><td colspan="3" class="vide">Aucun pays ne correspond.</td></tr>')
      + '</tbody></table></div></div>';
  }

  function brancherPays(){
    var f = document.getElementById('p-filtre');
    if (f) {
      f.oninput = function(){
        FILTRE = f.value;
        // On ne redessine QUE le tableau : redessiner la fenetre entiere
        // ferait perdre le focus a chaque frappe.
        var c = corps.querySelector('.carte.large');
        if (!c) return;
        var neuf = document.createElement('div');
        neuf.innerHTML = paysHtml();
        c.parentNode.replaceChild(neuf.firstChild, c);
        brancherPays();
        var f2 = document.getElementById('p-filtre');
        if (f2) { f2.focus(); try { f2.setSelectionRange(f2.value.length, f2.value.length); } catch (e) {} }
      };
    }
    var b = document.getElementById('p-relire');
    if (b) b.onclick = relirePays;
    corps.querySelectorAll('input[data-pays]').forEach(function(el){
      el.onchange = function(){ exclurePays(el); };
    });
  }

  function chargerPays(){
    appeler('config:pays:donnees').then(function(r){
      if (!r || !r.ok) return;      // la livraison reste utilisable sans le tableau
      PAYS = r;
      if (D && D.international) dessiner();
    });
  }

  function relirePays(){
    if (OCCUPE) return;
    OCCUPE = true; dire('Lecture des inscriptions chez Stripe…');
    appeler('config:pays:relire').then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      PAYS = r; dessiner();
      dire(r.nbInscrits ? (r.nbInscrits + ' pays inscrit' + (r.nbInscrits > 1 ? 's' : '') + '.')
                        : 'Aucune inscription active dans Stripe.', r.nbInscrits ? 'bon' : 'att');
    });
  }

  /* ⚠ UN ENREGISTREMENT ECHOUE REMET LA CASE COMME ELLE ETAIT. Laisser une case
     cochee qui n a pas ete enregistree ferait croire qu on livre la ou l on ne
     livre pas — sur un ecran qui decide ou l on vend, c est le pire des
     silences. */
  function exclurePays(el){
    if (RO) { el.checked = !el.checked; return; }
    var pays = el.getAttribute('data-pays');
    var etat = el.getAttribute('data-etat');
    var code = etat ? (pays + '-' + etat) : pays;   // exclusion par etat : « US-NY »
    var veut = el.checked;
    el.disabled = true;
    appeler('config:pays:exclure', [code, veut]).then(function(r){
      el.disabled = false;
      if (!r || !r.ok) { el.checked = !veut; dire(expliquer(r), 'err'); return; }
      PAYS = r;
      var quoi = etat ? 'État' : 'Pays';
      dire(veut ? (quoi + ' desservi.') : (quoi + ' retiré.'), 'bon');
    });
  }

  function enregistrer(){
    if (RO || OCCUPE) return;
    var chk = function(id){ var e = document.getElementById(id); return !!(e && e.checked); };
    var val = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    OCCUPE = true; bsave.disabled = true; dire('Enregistrement…');
    appeler('config:livraison:ecrire', [{
      international: chk('f-intl'), shippingCost: val('f-cost'),
      freeThreshold: val('f-thr'), priorityCost: val('f-prio') }]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) { D = r; RO = !r.peutModifier; dessiner(); dire('Livraison enregistrée.', 'bon'); }
      else { bsave.disabled = RO; dire(expliquer(r), 'err'); }
    });
  }
  bsave.onclick = enregistrer;

  function charger(){
    dire('Lecture…');
    appeler('config:livraison:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r; RO = !r.peutModifier; dessiner(); dire('');
      // ⚠ RELECTURE AUTOMATIQUE a l'ouverture : on lit les inscriptions chez Stripe
      // tout de suite (et pas seulement le miroir local), pour un tableau a jour des
      // l'entree — demande expresse. relirePays force le cache du relais.
      if (r.international) relirePays();
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageLivraison };
