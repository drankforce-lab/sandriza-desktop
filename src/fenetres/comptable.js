'use strict';

/*
 * FENÊTRE « LIENS COMPTABLES » — NATIVE
 * =============================================================================
 * Deux choses, deux onglets : le LIEN DE L'EXERCICE qu'on remet au comptable
 * (état comptable complet, en lecture seule, chiffré, à durée limitée) et le
 * CARNET des comptables (nom, cabinet, courriel, téléphone, note).
 *
 * ⚠ LE DROIT SUPER-ADMINISTRATEUR VIT DANS LE CŒUR (Backups._comptable*), pas
 * ici : ce lien ouvre l'exercice ENTIER à un tiers du dehors. La fenêtre ne
 * décide d'aucun droit — elle DEMANDE et AFFICHE. Le refus revient en « droit »
 * et l'écran le dit.
 *
 * ⚠ LE MOT DE PASSE NE REVIENT JAMAIS. Le serveur n'en garde pas de copie en
 * clair — c'est lui qui déchiffre le rapport. Il sort une SEULE fois, à la
 * création, et la fenêtre le dit AVANT qu'on ferme la carte. Recharger la liste
 * ne le fera pas réapparaître.
 *
 * ⚠ UN SEUL LIEN POUR TOUT L'EXERCICE : révoqué d'un coup pour tous les
 * destinataires. Le registre garde qui l'a reçu.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit. Pas de ${ } non plus dans
 * l'IIFE — concaténation par + comme dans liens.js.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

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
label{display:block;font-size:.73rem;color:#8fa1b8;margin:.5rem 0 .18rem}
input,select,textarea{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.34rem .5rem;width:100%}
textarea{resize:vertical;min-height:2.6rem}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.34rem .6rem;cursor:pointer;width:auto}
input:focus,select:focus,textarea:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.mini{font-size:.72rem;padding:.16rem .45rem}
button.dgr{border-color:rgba(248,113,113,.5);color:#fca5a5}
.duo{display:flex;gap:.65rem;flex-wrap:wrap}
.duo>div{flex:1 1 10rem;min-width:0}
.barreoutils{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center}
table{width:100%;border-collapse:collapse;font-size:.79rem}
thead th{text-align:left;padding:.22rem .35rem;font-size:.65rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.3rem .35rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:top}
tbody tr:hover td{background:rgba(255,255,255,.03)}
.dt{font-size:.7rem;color:#8fa1b8}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.74rem}
.pill{display:inline-block;font-size:.64rem;padding:.05rem .45rem;border-radius:99px;white-space:nowrap;font-weight:700}
.pill.actif{background:rgba(34,197,94,.15);color:#4ade80}
.pill.expire{background:rgba(148,163,184,.18);color:#94a3b8}
.pill.g{background:rgba(148,163,184,.14);color:#94a3b8;font-weight:600}
.vide{padding:1.1rem .6rem;text-align:center;color:#8fa1b8;font-size:.82rem}
.neuf{border:1px solid rgba(201,169,126,.5);background:rgba(201,169,126,.09)}
.neuf input{background:#0b1220;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
.neuf .gros{font-family:ui-monospace,Consolas,monospace;font-size:1.15rem;letter-spacing:.12em;
  color:#f0d6a0;font-weight:700}
.choix{display:flex;flex-wrap:wrap;gap:.35rem .9rem;margin:.2rem 0 0}
.choix label{display:flex;align-items:center;gap:.35rem;color:#e8edf5;font-size:.78rem;margin:.1rem 0}
.choix input{width:auto;margin:0}
.aide{font-size:.71rem;color:#8fa1b8;margin:.3rem 0 0}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète.
 * @param {string} ouverture '' (les exercices), 'nouveau' (formulaire ouvert), 'carnet'
 */
function pageComptable(ouverture) {
  const dep = JSON.stringify(String(ouverture || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Liens comptables — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.acctlink}</span><h1>Liens comptables</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets">
  <button id="o-partages" class="on">Exercices partagés</button>
  <button id="o-carnet">Carnet des comptables</button>
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
  var DEPART = ${dep};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Seul un super-administrateur peut remettre l’exercice à un comptable.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
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

  var VUE = (DEPART === 'carnet') ? 'carnet' : 'partages';
  var ETAT = { annees: [], annee: 0, contacts: [], partages: [],
               neuf: null, formulaire: (DEPART === 'nouveau'),
               contactForm: false, edition: '', avert: '' };
  var ARME_REV = '';   // token de partage a revoquer
  var ARME_CT  = '';   // courriel de contact a retirer

  function quand(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return esc(iso);
    return d.toLocaleString('fr-CA', { dateStyle: 'medium', timeStyle: 'short' });
  }
  function jour(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return esc(iso);
    return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function copierChamp(champ, bouton){
    champ.select();
    // execCommand ET NON navigator.clipboard : la fenetre est chargee en data:,
    // son origine est nulle, donc l API moderne du presse-papiers y est refusee.
    var fait = false;
    try { fait = document.execCommand('copy'); } catch (e) { fait = false; }
    bouton.textContent = fait ? '✓ Copié' : 'Ctrl+C';
    setTimeout(function(){ bouton.textContent = '📋 Copier'; }, 2500);
  }

  // ════════════════════════════════════════════════════════════════════════
  // VUE « EXERCICES PARTAGÉS »
  // ════════════════════════════════════════════════════════════════════════
  function dessinerPartages(){
    var h = [];
    h.push('<div class="barreoutils"><button class="prim" id="b-nouveau">+ Nouveau lien de l’exercice</button>'
      + '<span class="droite"><button id="b-recharger">Recharger</button></span></div>');

    if (ETAT.avert) {
      h.push('<div class="carte" style="border-color:rgba(234,179,8,.4)"><div class="dt">'
        + 'Le carnet est affiché, mais le registre des liens distants n’a pas répondu : '
        + esc(ETAT.avert) + '</div></div>');
    }
    if (ETAT.neuf) h.push(carteNeuf());
    if (ETAT.formulaire) h.push(formulaire());

    h.push('<div class="carte"><h2>Liens de l’exercice en cours</h2>');
    if (!ETAT.partages.length) {
      h.push('<div class="vide">Aucun exercice n’a encore été partagé.</div>');
    } else {
      h.push('<table><thead><tr><th>État</th><th>Exercice</th><th>Destinataires</th>'
        + '<th>Créé</th><th>Échéance</th><th></th></tr></thead><tbody>');
      ETAT.partages.forEach(function(p){
        var etat = p.expire ? 'expire' : 'actif';
        h.push('<tr>'
          + '<td><span class="pill ' + etat + '">' + (p.expire ? 'Expiré' : 'Actif') + '</span></td>'
          + '<td>' + esc(p.label || p.periode || '—') + '</td>'
          + '<td class="dt">' + esc(p.destinataire || '—') + '</td>'
          + '<td>' + jour(p.creeLe) + '</td>'
          + '<td>' + jour(p.expireLe) + '</td>'
          + '<td style="white-space:nowrap">'
            + '<button class="mini" data-copier="' + esc(p.url) + '"><span class="ic">📋</span></button> '
            + '<button class="mini dgr" data-revoquer="' + esc(p.token) + '">'
            + (ARME_REV === p.token ? 'Confirmer ?' : 'Révoquer') + '</button>'
          + '</td></tr>');
      });
      h.push('</tbody></table>');
    }
    h.push('</div>');

    corps.innerHTML = h.join('');
    brancherPartages();
  }

  function carteNeuf(){
    var n = ETAT.neuf;
    var envoyes = (n.envoyes || []);
    var rates = (n.rates || []);
    return '<div class="carte neuf"><h2>Lien de l’exercice ' + esc(String(n.annee || '')) + '</h2>'
      + '<label for="n-url">Adresse à remettre au comptable</label>'
      + '<input id="n-url" type="text" readonly value="' + esc(n.url) + '">'
      + '<div class="barreoutils" style="margin-top:.4rem"><button id="n-copier"><span class="ic">📋</span> Copier</button>'
      + '<span class="aide">Échéance le ' + jour(n.expireLe) + '</span></div>'
      + '<label style="margin-top:.6rem">Mot de passe d’ouverture</label>'
      + '<div class="gros" id="n-mdp-vue">' + esc(n.motDePasse || '') + '</div>'
      + '<input id="n-mdp" type="text" readonly value="' + esc(n.motDePasse || '') + '" style="position:absolute;left:-9999px">'
      + '<div class="barreoutils" style="margin-top:.4rem">'
      + '<button id="n-copier-mdp"><span class="ic">📋</span> Copier le mot de passe</button></div>'
      + '<p class="aide"><strong>Il ne sera plus jamais affiché</strong> — le serveur n’en garde '
      + 'aucune copie en clair, c’est lui qui déchiffre le rapport. Notez-le ou transmettez-le '
      + 'maintenant, de préférence par un autre canal que le lien.</p>'
      + (envoyes.length
          ? '<p class="aide">Courriel envoyé à : ' + esc(envoyes.join(', ')) + '.</p>' : '')
      + (rates.length
          ? '<p class="aide" style="color:#facc15">Envoi refusé pour : ' + esc(rates.join(', ')) + '.</p>' : '')
      + '<div class="barreoutils" style="margin-top:.5rem">'
      + '<span class="droite"><button id="n-fermer">Fermer</button></span></div>'
      + '</div>';
  }

  function formulaire(){
    var opAns = ETAT.annees.map(function(y){
      return '<option value="' + y + '"' + (y === ETAT.annee ? ' selected' : '') + '>' + y + '</option>';
    }).join('');
    var carnet = ETAT.contacts.length
      ? '<div class="choix">' + ETAT.contacts.map(function(c){
          return '<label><input type="checkbox" class="rcpt" value="' + esc(c.email) + '">'
            + esc(c.name || c.email) + (c.firm ? ' <span class="dt">(' + esc(c.firm) + ')</span>' : '') + '</label>';
        }).join('') + '</div>'
      : '<p class="aide">Le carnet est vide — ajoutez un comptable dans l’onglet Carnet, ou saisissez '
        + 'une adresse ci-dessous.</p>';
    return '<div class="carte"><h2>Nouveau lien de l’exercice</h2>'
      + '<div class="duo">'
      + '<div><label for="f-annee">Exercice</label><select id="f-annee">' + opAns + '</select></div>'
      + '<div><label for="f-duree">Validité</label><select id="f-duree">'
      + '<option value="24">24 heures</option><option value="72">3 jours</option>'
      + '<option value="168" selected>7 jours</option><option value="336">14 jours</option>'
      + '<option value="720">30 jours</option></select></div>'
      + '</div>'
      + '<label style="margin-top:.5rem">Destinataires (dans le carnet)</label>'
      + carnet
      + '<label for="f-manuel" style="margin-top:.5rem">Ajouter une adresse</label>'
      + '<input id="f-manuel" type="email" placeholder="facultatif — comptable@cabinet.com">'
      + '<p class="aide">Un mot de passe d’ouverture est engendré au hasard : il ne sera affiché '
      + 'qu’une seule fois, juste après la création. Le lien peut être créé sans destinataire (à '
      + 'remettre à la main), ou envoyé par courriel à ceux qui sont choisis.</p>'
      + '<div class="barreoutils" style="margin-top:.5rem">'
      + '<button class="prim" id="f-creer">Fabriquer</button>'
      + '<span class="droite"><button id="f-annuler">Annuler</button></span></div>'
      + '</div>';
  }

  function brancherPartages(){
    var bn = document.getElementById('b-nouveau');
    if (bn) bn.onclick = function(){ ETAT.formulaire = !ETAT.formulaire; dessinerPartages(); };
    var br = document.getElementById('b-recharger');
    if (br) br.onclick = function(){ charger(true); };

    var fc = document.getElementById('f-creer');
    if (fc) fc.onclick = creer;
    var fa = document.getElementById('f-annuler');
    if (fa) fa.onclick = function(){ ETAT.formulaire = false; dessinerPartages(); };

    var nc = document.getElementById('n-copier');
    if (nc) nc.onclick = function(){ copierChamp(document.getElementById('n-url'), nc); };
    var nm = document.getElementById('n-copier-mdp');
    if (nm) nm.onclick = function(){ copierChamp(document.getElementById('n-mdp'), nm); };
    var nf = document.getElementById('n-fermer');
    if (nf) nf.onclick = function(){ ETAT.neuf = null; dessinerPartages(); };

    Array.prototype.forEach.call(corps.querySelectorAll('[data-copier]'), function(b){
      b.onclick = function(){
        var z = document.createElement('input');
        z.value = b.getAttribute('data-copier');
        document.body.appendChild(z);
        z.select();
        var fait = false;
        try { fait = document.execCommand('copy'); } catch (e) { fait = false; }
        z.remove();
        dire(fait ? 'Adresse copiée.' : 'Copie refusée par le système.', fait ? 'bon' : 'err');
      };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-revoquer]'), function(b){
      b.onclick = function(){ revoquer(b.getAttribute('data-revoquer')); };
    });
  }

  function creer(){
    var an = document.getElementById('f-annee');
    var du = document.getElementById('f-duree');
    var man = document.getElementById('f-manuel');
    var b = document.getElementById('f-creer');
    var dest = [];
    Array.prototype.forEach.call(corps.querySelectorAll('input.rcpt:checked'), function(x){ dest.push(x.value); });
    if (man && man.value.trim()) dest.push(man.value.trim());
    b.disabled = true;
    dire('Fabrication du lien de l’exercice…');
    appeler('comptable:creer', [{
      annee: an ? parseInt(an.value, 10) : 0,
      heures: du ? parseInt(du.value, 10) : 168,
      destinataires: dest
    }]).then(function(r){
      b.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      ETAT.neuf = { url: r.url, motDePasse: r.motDePasse, expireLe: r.expireLe,
                    annee: r.annee, envoyes: r.envoyes || [], rates: r.rates || [] };
      ETAT.formulaire = false;
      dire('Lien fabriqué.' + ((r.rates && r.rates.length) ? ' Certains courriels ont été refusés.' : ''),
        (r.rates && r.rates.length) ? 'att' : 'bon');
      charger(false);
    });
  }

  /* ⚠ LE BOUTON S ARME, IL NE DEMANDE PAS : confirm() bloque le processus, et
     une fenetre chargee en data: n a pas de boite de dialogue du site. Premier
     clic arme, second agit, le bandeau du bas dit ce qui va se passer. */
  function revoquer(token){
    if (ARME_REV !== token) {
      ARME_REV = token;
      dessinerPartages();
      dire('Cliquez « Confirmer ? » pour révoquer — le lien cessera aussitôt de fonctionner pour tous les destinataires.', 'att');
      return;
    }
    ARME_REV = '';
    dire('Révocation…');
    appeler('comptable:revoquer', [token]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Lien révoqué.', 'bon');
      charger(false);
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // VUE « CARNET DES COMPTABLES »
  // ════════════════════════════════════════════════════════════════════════
  function dessinerCarnet(){
    var h = [];
    h.push('<div class="barreoutils"><button class="prim" id="c-ajouter">+ Ajouter un comptable</button>'
      + '<span class="droite"><button id="c-recharger">Recharger</button></span></div>');

    if (ETAT.contactForm) h.push(contactForm());

    h.push('<div class="carte"><h2>Carnet</h2>');
    if (!ETAT.contacts.length) {
      h.push('<div class="vide">Le carnet est vide.</div>');
    } else {
      h.push('<table><thead><tr><th>Nom</th><th>Cabinet</th><th>Courriel</th>'
        + '<th>Téléphone</th><th>Note</th><th></th></tr></thead><tbody>');
      ETAT.contacts.forEach(function(c){
        h.push('<tr>'
          + '<td>' + esc(c.name || '—') + '</td>'
          + '<td>' + esc(c.firm || '') + '</td>'
          + '<td class="mono">' + esc(c.email) + '</td>'
          + '<td>' + esc(c.phone || '') + '</td>'
          + '<td class="dt">' + esc(c.note || '') + '</td>'
          + '<td style="white-space:nowrap">'
            + '<button class="mini" data-modifier="' + esc(c.email) + '">Modifier</button> '
            + '<button class="mini dgr" data-retirer="' + esc(c.email) + '">'
            + (ARME_CT === c.email ? 'Confirmer ?' : 'Retirer') + '</button>'
          + '</td></tr>');
      });
      h.push('</tbody></table>');
    }
    h.push('</div>');

    corps.innerHTML = h.join('');
    brancherCarnet();
  }

  function contactForm(){
    var c = null;
    if (ETAT.edition) {
      for (var i = 0; i < ETAT.contacts.length; i++) {
        if (ETAT.contacts[i].email === ETAT.edition) { c = ETAT.contacts[i]; break; }
      }
    }
    c = c || { name: '', firm: '', email: '', phone: '', note: '' };
    var fige = ETAT.edition ? ' readonly' : '';
    return '<div class="carte"><h2>' + (ETAT.edition ? 'Modifier le comptable' : 'Nouveau comptable') + '</h2>'
      + '<div class="duo">'
      + '<div><label for="ct-name">Nom</label><input id="ct-name" type="text" value="' + esc(c.name) + '"></div>'
      + '<div><label for="ct-firm">Cabinet</label><input id="ct-firm" type="text" value="' + esc(c.firm) + '"></div>'
      + '</div>'
      + '<div class="duo">'
      + '<div><label for="ct-email">Courriel</label><input id="ct-email" type="email" value="' + esc(c.email) + '"' + fige + '></div>'
      + '<div><label for="ct-phone">Téléphone</label><input id="ct-phone" type="tel" value="' + esc(c.phone) + '"></div>'
      + '</div>'
      + '<label for="ct-note">Note</label><textarea id="ct-note">' + esc(c.note) + '</textarea>'
      + (ETAT.edition ? '<p class="aide">Le courriel est la clé du contact : pour le changer, retirez '
          + 'ce contact et créez-en un nouveau.</p>' : '')
      + '<div class="barreoutils" style="margin-top:.5rem">'
      + '<button class="prim" id="ct-enregistrer">Enregistrer</button>'
      + '<span class="droite"><button id="ct-annuler">Annuler</button></span></div>'
      + '</div>';
  }

  function brancherCarnet(){
    var ba = document.getElementById('c-ajouter');
    if (ba) ba.onclick = function(){ ETAT.edition = ''; ETAT.contactForm = !ETAT.contactForm; dessinerCarnet(); };
    var brc = document.getElementById('c-recharger');
    if (brc) brc.onclick = function(){ charger(true); };

    var ce = document.getElementById('ct-enregistrer');
    if (ce) ce.onclick = enregistrerContact;
    var ca = document.getElementById('ct-annuler');
    if (ca) ca.onclick = function(){ ETAT.contactForm = false; ETAT.edition = ''; dessinerCarnet(); };

    Array.prototype.forEach.call(corps.querySelectorAll('[data-modifier]'), function(b){
      b.onclick = function(){
        ETAT.edition = b.getAttribute('data-modifier');
        ETAT.contactForm = true;
        dessinerCarnet();
      };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-retirer]'), function(b){
      b.onclick = function(){ retirerContact(b.getAttribute('data-retirer')); };
    });
  }

  function enregistrerContact(){
    var b = document.getElementById('ct-enregistrer');
    var contact = {
      name:  (document.getElementById('ct-name')  || {}).value || '',
      firm:  (document.getElementById('ct-firm')  || {}).value || '',
      email: (document.getElementById('ct-email') || {}).value || '',
      phone: (document.getElementById('ct-phone') || {}).value || '',
      note:  (document.getElementById('ct-note')  || {}).value || ''
    };
    if (!contact.email.trim()) { dire('Indiquez un courriel — c’est la clé du contact.', 'err'); return; }
    b.disabled = true;
    dire('Enregistrement…');
    appeler('comptable:contact', [contact]).then(function(r){
      b.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      if (r.contacts) ETAT.contacts = r.contacts;
      ETAT.contactForm = false; ETAT.edition = '';
      dire('Comptable enregistré.', 'bon');
      majSous();
      dessinerCarnet();
    });
  }

  function retirerContact(email){
    if (ARME_CT !== email) {
      ARME_CT = email;
      dessinerCarnet();
      dire('Cliquez « Confirmer ? » pour retirer ce comptable du carnet.', 'att');
      return;
    }
    ARME_CT = '';
    dire('Retrait…');
    appeler('comptable:contact-retirer', [email]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      if (r.contacts) ETAT.contacts = r.contacts;
      dire('Comptable retiré du carnet.', 'bon');
      majSous();
      dessinerCarnet();
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  function marquerOnglets(){
    document.getElementById('o-partages').classList.toggle('on', VUE === 'partages');
    document.getElementById('o-carnet').classList.toggle('on', VUE === 'carnet');
  }
  document.getElementById('o-partages').onclick = function(){
    VUE = 'partages'; marquerOnglets(); dessinerPartages();
  };
  document.getElementById('o-carnet').onclick = function(){
    VUE = 'carnet'; marquerOnglets(); dessinerCarnet();
  };

  function majSous(){
    var actifs = ETAT.partages.filter(function(p){ return !p.expire; }).length;
    sous.textContent = actifs + ' lien' + (actifs > 1 ? 's' : '') + ' actif' + (actifs > 1 ? 's' : '')
      + ' · ' + ETAT.contacts.length + ' comptable' + (ETAT.contacts.length > 1 ? 's' : '');
  }

  function redessiner(){
    if (VUE === 'carnet') dessinerCarnet(); else dessinerPartages();
  }

  function charger(dire_le){
    if (dire_le) dire('Lecture…');
    appeler('comptable:donnees').then(function(r){
      if (!r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      ETAT.annees = r.annees || [];
      ETAT.annee = r.annee || (ETAT.annees[0] || 0);
      ETAT.contacts = r.contacts || [];
      ETAT.partages = r.partages || [];
      ETAT.avert = r.avertissement || '';
      majSous();
      redessiner();
      if (dire_le) dire('');
    });
  }

  marquerOnglets();
  charger(true);
})();
</script></body></html>`;
}

module.exports = { pageComptable };
