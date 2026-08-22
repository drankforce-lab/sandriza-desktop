'use strict';

/*
 * FENÊTRE « LOGOS ET MARQUE » — NATIVE (Configuration, palier 5, 4e onglet)
 * =============================================================================
 * Le nom de marque, les slogans, les six logos, et les couleurs des deux pages
 * de connexion (cliente et personnel). Aucun secret.
 *
 * ⚠ AUCUNE RÈGLE ICI. Lecture `config:marque:donnees`, écriture
 * `config:marque:ecrire`, remise à zéro `config:marque:reinit`. Le cœur
 * `Admin._marqueEcrire` dépose les logos dans R2, valide et persiste ; le droit
 * d'écriture (`config:edit`) est décidé au cœur.
 *
 * ⚠ UN LOGO CHOISI N'EST PAS UN LOGO ENREGISTRÉ. La fenêtre lit le fichier et
 * en garde le base64 EN MÉMOIRE, pour l'aperçu ; il ne part qu'à
 * « Enregistrer » — comme l'écran web. Le pied dit combien sont en attente,
 * sinon on ferme la fenêtre en croyant avoir posé son logo.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
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
.onglets{flex:0 0 auto;display:flex;gap:.2rem;padding:.35rem .9rem 0;
  border-bottom:1px solid rgba(255,255,255,.08);background:#111a29}
.onglets button{font:inherit;font-size:.8rem;color:#8fa1b8;background:none;border:none;
  border-bottom:2px solid transparent;padding:.45rem .8rem;cursor:pointer;
  -webkit-user-select:none;user-select:none}
.onglets button:hover{color:#e8edf5}
.onglets button[aria-selected="true"]{color:#c9a97e;border-bottom-color:#c9a97e;font-weight:700}
/* ⚠ LA ZONE EST PLEINE PAGE, ET LES CARTES DOIVENT LA REMPLIR. Plafonnees en
   largeur, elles laissaient la moitie de l ecran vide une fois la fenetre
   ANCREE (releve le 2026-08-10, capture a l appui). Une colonne unique etiree a
   1900 px serait pire : on repartit donc en colonnes qui se replient seules. */
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:grid;grid-template-columns:repeat(auto-fit,minmax(30rem,1fr));
  gap:1rem;align-content:start}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:1rem 1.1rem;margin:0;min-width:0}
.pleine{grid-column:1/-1}
.carte h2{margin:0 0 .2rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8}
.carte .sous{margin:0 0 .9rem;font-size:.78rem;color:#6d7f96}
.ch{margin:0 0 .8rem}
.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.25rem;font-size:.78rem;color:#8fa1b8}
.ch label .pt{color:#6d7f96;font-size:.72rem}
.ch input[type=text]{width:100%;box-sizing:border-box;font:inherit;color:#e8edf5;background:#0f1724;
  border:1px solid #2b3444;border-radius:8px;padding:.42rem .55rem}
.ch input[type=text]:focus{outline:none;border-color:#c9a97e}
.deux{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
.trois{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.8rem}
@media (max-width:620px){.deux,.trois{grid-template-columns:1fr}}
select{font:inherit;color:#e8edf5;background:#0f1724;border:1px solid #2b3444;
  border-radius:8px;padding:.4rem .5rem;width:100%}
input[type=color]{width:100%;height:2.1rem;padding:0;border:1px solid #2b3444;
  border-radius:8px;background:#0f1724;cursor:pointer}
input[type=color]:disabled,input[type=text]:disabled,select:disabled{opacity:.55;cursor:default}
.bascule{display:flex;align-items:center;gap:.5rem;font-size:.82rem;cursor:pointer;
  -webkit-user-select:none;user-select:none}
.bascule input{width:1rem;height:1rem;accent-color:#c9a97e;cursor:pointer}
/* Un logo : sa vignette, son bouton de choix, son retrait. Les six se
   repartissent en colonnes plutot qu en une pile etiree. */
.logos{display:grid;grid-template-columns:repeat(auto-fit,minmax(24rem,1fr));gap:.9rem}
.logo{display:grid;grid-template-columns:9.5rem 1fr;gap:.9rem;align-items:start;min-width:0;
  border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:.7rem .8rem;background:#111a29}
@media (max-width:620px){.logo{grid-template-columns:1fr}}
.vig{height:5rem;border-radius:9px;display:flex;align-items:center;justify-content:center;
  padding:.5rem;overflow:hidden;border:1px solid rgba(255,255,255,.08)}
.vig img{max-width:100%;max-height:100%;object-fit:contain;display:block}
.vig .rien{font-size:.72rem;color:#6d7f96;text-align:center;line-height:1.35}
.logo .nom{font-size:.82rem;font-weight:700;margin:0 0 .15rem}
.logo .aide{font-size:.75rem;color:#6d7f96;margin:0 0 .5rem}
.logo .gestes{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center}
.att{font-size:.72rem;color:#facc15}
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
button.pt{font-size:.76rem;padding:.25rem .55rem}
button.dgr{color:#f87171;border-color:rgba(248,113,113,.4)}
.vide{padding:1.1rem .6rem;text-align:center;color:#8fa1b8;font-size:.82rem}
/* ⚠ LE BANDEAU DE LECTURE SEULE VIT HORS DE LA GRILLE. Place dedans avec
   << grid-column:1/-1 >>, il OCCUPE la derniere piste : auto-fit ne la voit plus
   vide, ne la replie plus, et les cartes cessent de remplir la largeur (releve
   au rendu le 2026-08-10). */
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:#f0d6a0;border-radius:9px;
  padding:.5rem .7rem;font-size:.78rem}
/* Apercus des deux pages de connexion. */
.apc{border-radius:10px;padding:1.4rem 1rem;text-align:center;min-height:7rem;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem}
.apc img{max-width:12rem;max-height:3.4rem;object-fit:contain}
.apc .nm{font:700 1.05rem/1.2 Georgia,serif;letter-spacing:.1em}
.apc .st{font-size:.76rem;opacity:.8}
.lgn{border-radius:10px;padding:1.1rem .9rem;display:flex;flex-direction:column;
  align-items:center;gap:.35rem}
.lgn .pastille{width:2.4rem;height:2.4rem;border-radius:10px;display:flex;align-items:center;
  justify-content:center;font:800 1.05rem/1 Georgia,serif;color:#fff}
.lgn .tt{font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.lgn .ss{font-size:.62rem;letter-spacing:.1em;text-transform:uppercase}
.lgn .cadre{border-radius:8px;padding:.6rem;width:100%;max-width:15rem;margin-top:.2rem}
.lgn .champ{background:#0f172a;border:1px solid #334155;border-radius:4px;
  padding:.25rem .45rem;margin-bottom:.35rem;color:#f1f5f9;font-size:.62rem;text-align:left}
.lgn .bt{border-radius:4px;padding:.28rem;text-align:center;color:#fff;font-size:.62rem;font-weight:600}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* ⚠ L ONGLET D OUVERTURE EST UN PARAMETRE, pas un etat interne : sans lui,
   aucun jeu d essai ne peut atteindre les onglets « Logos » et « Pages de
   connexion » — ils ne sont joignables qu au clic, et le garde-fou ne clique
   pas. Trois cas d ouverture sont declares dans reponses-fenetres.js. */
const ONGLETS_VALIDES = ['marque', 'logos', 'connexion'];

function pageMarque(onglet) {
  const depart = ONGLETS_VALIDES.indexOf(String(onglet || '')) >= 0 ? String(onglet) : 'marque';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Logos et marque — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.image}</span><h1>Logos et marque</h1></div>
<div class="onglets" id="onglets"></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter les logos, pas les modifier.</div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button id="b-reinit" disabled>Réinitialiser</button>
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
  var ongl = document.getElementById('onglets');
  var bsave = document.getElementById('b-save');
  var breinit = document.getElementById('b-reinit');
  var D = null, RO = false, ONGLET = '${depart}';
  // Les logos choisis mais PAS ENCORE ENREGISTRES : type -> base64.
  var ENATTENTE = {};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule : les logos ne peuvent pas être modifiés.',
    depot:              'Le dépôt du logo dans le stockage a échoué. Rien n’a été modifié.',
    pas_une_image:      'Ce fichier n’est pas une image.',
    logo_inconnu:       'Ce type de logo n’existe pas dans cette version.',
    quoi_inconnu:       'Cette remise à zéro n’existe pas dans cette version.',
    rien_a_ecrire:      'Aucun changement à enregistrer.',
    indisponible:       'La configuration n’est pas prête dans la fenêtre principale.',
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

  /* ── Les six logos, leur libelle et le fond sur lequel on les juge ────────
     ⚠ Le fond compte : un logo blanc sur fond blanc parait absent. Chacun est
     montre sur le fond ou il servira vraiment. */
  var LOGOS = [
    { t:'store',          nom:'Boutique — FR',    aide:'Barre de navigation et connexion cliente.', fond:'#f5f2ec' },
    { t:'store_en',       nom:'Boutique — EN',    aide:'Utilise le logo français si vide.',         fond:'#f5f2ec' },
    { t:'admin',          nom:'Barre latérale',   aide:'Remplace l’icône lettre si défini.',        fond:'#1a2035' },
    { t:'login',          nom:'Connexion du personnel', aide:'Indépendant de la barre latérale.',   fond:'#0f172a' },
    { t:'transparent',    nom:'Sans fond — FR',   aide:'Factures et courriels.',                    fond:'#f9f5ee' },
    { t:'transparent_en', nom:'Sans fond — EN',   aide:'Utilise le logo français si vide.',         fond:'#f9f5ee' }
  ];

  // Valeur d un champ, quel que soit son type. Absent = chaine vide.
  function v(id){ var e = document.getElementById(id); return e ? e.value : ''; }
  function coche(id){ var e = document.getElementById(id); return !!(e && e.checked); }

  function champ(id, lib, val, pt){
    return '<div class="ch"><label>' + esc(lib) + (pt ? ' <span class="pt">' + esc(pt) + '</span>' : '')
      + '</label><input id="' + id + '" type="text" value="' + esc(val || '') + '"'
      + (RO ? ' disabled' : '') + '></div>';
  }
  function couleur(id, lib, val){
    return '<div class="ch"><label>' + esc(lib) + '</label><input id="' + id + '" type="color" value="'
      + esc(val || '#000000') + '"' + (RO ? ' disabled' : '') + '></div>';
  }

  /* ── ONGLET 1 : la marque ────────────────────────────────────────────── */
  function dessinerMarque(){
    var m = (D && D.marque) || {}, g = m.gradient || {};
    var h = [];
    h.push('<div class="carte"><h2>Identité</h2>');
    h.push('<p class="sous">Le nom et les slogans repris partout : boutique, courriels, documents.</p>');
    h.push(champ('m-name', 'Nom de marque', m.name));
    h.push('<div class="deux">' + champ('m-slogan', 'Slogan — FR', m.slogan, 'sous le nom, dans la barre')
      + champ('m-slogan-en', 'Slogan — EN', m.sloganEN) + '</div>');
    h.push(champ('m-sub', 'Sous-titre de la connexion cliente', m.sub));
    h.push(champ('m-letter', 'Lettre de l’icône', m.letter, '1 ou 2 caractères, si aucun logo'));
    h.push('</div>');
    h.push('<div class="carte"><h2>Dégradé sur le nom</h2>');
    h.push('<p class="sous">Appliqué au nom de marque quand aucun logo d’image ne le remplace.</p>');
    h.push('<label class="bascule"><input type="checkbox" id="m-grad"' + (g.enabled ? ' checked' : '')
      + (RO ? ' disabled' : '') + '> Colorer le nom en dégradé</label>');
    h.push('<div class="trois" id="m-grad-opts" style="margin-top:.7rem'
      + (g.enabled ? '' : ';display:none') + '">');
    h.push(couleur('m-grad-from', 'Couleur A', g.from));
    h.push(couleur('m-grad-to', 'Couleur B', g.to));
    h.push('<div class="ch"><label>Direction</label><select id="m-grad-dir"' + (RO ? ' disabled' : '') + '>'
      + ['135deg,↗ Diagonale', '90deg,→ Horizontale', '180deg,↓ Verticale'].map(function(o){
          var p = o.split(','); return '<option value="' + p[0] + '"'
            + ((g.dir || '135deg') === p[0] ? ' selected' : '') + '>' + esc(p[1]) + '</option>'; }).join('')
      + '</select></div>');
    h.push('</div></div>');
    h.push('<div class="carte"><h2>Aperçu</h2><div id="m-apercu"></div></div>');
    corps.innerHTML = h.join('');
    var gb = document.getElementById('m-grad');
    if (gb) gb.onchange = function(){
      var o = document.getElementById('m-grad-opts');
      if (o) o.style.display = gb.checked ? 'grid' : 'none';
      majApercuMarque();
    };
    ['m-name', 'm-letter', 'm-grad-from', 'm-grad-to'].forEach(function(id){
      var e = document.getElementById(id); if (e) e.oninput = majApercuMarque; });
    var dir = document.getElementById('m-grad-dir');
    if (dir) dir.onchange = majApercuMarque;
    majApercuMarque();
  }
  function styleDegrade(){
    if (!coche('m-grad')) return '';
    return 'background:linear-gradient(' + v('m-grad-dir') + ',' + v('m-grad-from') + ',' + v('m-grad-to')
      + ');-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text';
  }
  function logoActuel(type){
    // Le choix en attente prime sur ce qui est enregistre : c est ce qu on verra.
    if (ENATTENTE[type]) return ENATTENTE[type];
    return (D && D.logos && D.logos[type]) || '';
  }
  function majApercuMarque(){
    var el = document.getElementById('m-apercu');
    if (!el) return;
    var nom = v('m-name') || 'SANDRIZA';
    var img = logoActuel('store');
    var gs = styleDegrade();
    var h = '<div class="apc" style="background:#f5f2ec;color:#1d2433">';
    h += img ? '<img src="' + esc(img) + '" alt="">'
             : '<div class="nm" style="' + (gs || 'color:#1d2433') + '">' + esc(nom) + '</div>';
    var sl = v('m-slogan');
    if (!img && sl) h += '<div class="st" style="letter-spacing:.18em;font-size:.62rem;text-transform:uppercase">' + esc(sl) + '</div>';
    h += '</div>';
    el.innerHTML = h;
  }

  /* ── ONGLET 2 : les logos ────────────────────────────────────────────── */
  function dessinerLogos(){
    var h = ['<div class="carte pleine"><h2>Les six logos</h2>'];
    h.push('<p class="sous">Un logo choisi n’est déposé qu’à l’enregistrement. PNG ou SVG, fond transparent recommandé.</p>');
    h.push('<div class="logos">');
    LOGOS.forEach(function(L){
      var src = logoActuel(L.t);
      var enAttente = !!ENATTENTE[L.t];
      h.push('<div class="logo">');
      h.push('<div class="vig" style="background:' + esc(L.fond) + '">'
        + (src ? '<img src="' + esc(src) + '" alt="">'
               : '<span class="rien">Aucun logo</span>') + '</div>');
      h.push('<div><p class="nom">' + esc(L.nom) + (enAttente ? ' <span class="att">· en attente</span>' : '')
        + '</p><p class="aide">' + esc(L.aide) + '</p><div class="gestes">');
      h.push('<button class="pt" data-choisir="' + esc(L.t) + '"' + (RO ? ' disabled' : '') + '>Choisir un fichier…</button>');
      if (enAttente) h.push('<button class="pt" data-annuler="' + esc(L.t) + '">Annuler ce choix</button>');
      else if (src) h.push('<button class="pt dgr" data-effacer="' + esc(L.t) + '"' + (RO ? ' disabled' : '') + '>✕ Supprimer</button>');
      h.push('</div></div></div>');
    });
    h.push('</div></div>');
    corps.innerHTML = h.join('');
    brancherLogos();
  }
  function brancherLogos(){
    var bs = corps.querySelectorAll('[data-choisir]');
    for (var i = 0; i < bs.length; i++) bs[i].onclick = function(e){ choisirFichier(e.currentTarget.getAttribute('data-choisir')); };
    var an = corps.querySelectorAll('[data-annuler]');
    for (var j = 0; j < an.length; j++) an[j].onclick = function(e){
      delete ENATTENTE[e.currentTarget.getAttribute('data-annuler')]; dessiner(); dire('Choix annulé.'); };
    var ef = corps.querySelectorAll('[data-effacer]');
    for (var k = 0; k < ef.length; k++) ef[k].onclick = function(e){ effacerLogo(e.currentTarget.getAttribute('data-effacer')); };
  }
  function choisirFichier(type){
    if (RO) return;
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = function(){
      var f = inp.files && inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function(){
        ENATTENTE[type] = String(r.result || '');
        dessiner();
        dire('Logo prêt. Il partira à l’enregistrement.', 'att');
      };
      r.onerror = function(){ dire('Ce fichier n’a pas pu être lu.', 'err'); };
      r.readAsDataURL(f);
    };
    inp.click();
  }
  function effacerLogo(type){
    if (RO) return;
    occuper(true);
    dire('Suppression…');
    appeler('config:marque:ecrire', [{ logosEffaces: [type] }]).then(function(r){
      occuper(false);
      if (r && r.ok) { D = r; RO = !r.peutModifier; dessiner(); dire('Logo supprimé.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }

  /* ── ONGLET 3 : les deux pages de connexion ──────────────────────────── */
  function dessinerConnexion(){
    var c = (D && D.clientLogin) || {}, t = (D && D.loginTheme) || {};
    var h = [];
    h.push('<div class="carte"><h2>Connexion de la clientèle</h2>');
    h.push('<p class="sous">Couleurs de l’en-tête de la page de connexion de la boutique.</p>');
    h.push('<div class="trois">' + couleur('c-from', 'Fond — couleur A', c.bgFrom)
      + couleur('c-to', 'Fond — couleur B', c.bgTo)
      + couleur('c-text', 'Texte', c.textColor) + '</div>');
    h.push('<div id="c-apercu" style="margin-top:.6rem"></div></div>');
    h.push('<div class="carte"><h2>Connexion du personnel</h2>');
    h.push('<p class="sous">La page par laquelle on entre dans l’administration.</p>');
    h.push(champ('t-sub', 'Sous-titre', t.subtitleText));
    h.push('<div class="trois">' + couleur('t-bg-from', 'Fond — couleur A', t.bgFrom)
      + couleur('t-bg-mid', 'Fond — couleur B', t.bgMid)
      + couleur('t-card', 'Fond de la carte', t.cardBg) + '</div>');
    h.push('<div class="trois">' + couleur('t-logo-from', 'Icône — couleur A', t.logoGradFrom)
      + couleur('t-logo-to', 'Icône — couleur B', t.logoGradTo)
      + couleur('t-title', 'Couleur du titre', t.titleColor) + '</div>');
    h.push('<div class="trois">' + couleur('t-btn-from', 'Bouton — couleur A', t.btnGradFrom)
      + couleur('t-btn-to', 'Bouton — couleur B', t.btnGradTo)
      + couleur('t-sub-col', 'Couleur du sous-titre', t.subtitleColor) + '</div>');
    h.push('<div id="t-apercu" style="margin-top:.6rem"></div></div>');
    corps.innerHTML = h.join('');
    ['c-from', 'c-to', 'c-text'].forEach(function(id){
      var e = document.getElementById(id); if (e) e.oninput = majApercuClient; });
    ['t-sub', 't-bg-from', 't-bg-mid', 't-card', 't-logo-from', 't-logo-to',
     't-title', 't-btn-from', 't-btn-to', 't-sub-col'].forEach(function(id){
      var e = document.getElementById(id); if (e) e.oninput = majApercuPersonnel; });
    majApercuClient();
    majApercuPersonnel();
  }
  function majApercuClient(){
    var el = document.getElementById('c-apercu');
    if (!el) return;
    var m = (D && D.marque) || {};
    var img = logoActuel('store');
    var txt = v('c-text') || '#ffffff';
    var h = '<div class="apc" style="background:linear-gradient(135deg,' + v('c-from') + ',' + v('c-to') + ')">';
    h += img ? '<img src="' + esc(img) + '" alt="">'
             : '<div class="nm" style="color:' + esc(txt) + '">' + esc(m.name || 'SANDRIZA') + '</div>';
    h += '<div class="st" style="color:' + esc(txt) + '">' + esc(m.sub || '') + '</div></div>';
    el.innerHTML = h;
  }
  function majApercuPersonnel(){
    var el = document.getElementById('t-apercu');
    if (!el) return;
    var m = (D && D.marque) || {};
    var img = logoActuel('login') || logoActuel('admin');
    var h = '<div class="lgn" style="background:linear-gradient(135deg,' + v('t-bg-from') + ' 0%,'
      + v('t-bg-mid') + ' 50%,' + v('t-bg-from') + ' 100%)">';
    h += img ? '<img src="' + esc(img) + '" alt="" style="max-width:11rem;max-height:3rem;object-fit:contain">'
             : '<div class="pastille" style="background:linear-gradient(135deg,' + v('t-logo-from') + ','
               + v('t-logo-to') + ')">' + esc(m.letter || 'É') + '</div>';
    h += '<div class="tt" style="color:' + esc(v('t-title')) + '">' + esc(m.name || 'SANDRIZA') + '</div>';
    h += '<div class="ss" style="color:' + esc(v('t-sub-col')) + '">' + esc(v('t-sub')) + '</div>';
    h += '<div class="cadre" style="background:' + esc(v('t-card')) + ';border:1px solid #334155">'
      + '<div class="champ">utilisateur</div><div class="champ">••••••••</div>'
      + '<div class="bt" style="background:linear-gradient(135deg,' + v('t-btn-from') + ',' + v('t-btn-to') + ')">Se connecter</div>'
      + '</div></div>';
    el.innerHTML = h;
  }

  /* ── Coquille : onglets, pied, lecture, ecriture ─────────────────────── */
  var ONGLETS = [
    { k:'marque',   lib:'Marque' },
    { k:'logos',    lib:'Logos' },
    { k:'connexion', lib:'Pages de connexion' }
  ];
  function dessinerOnglets(){
    ongl.innerHTML = ONGLETS.map(function(o){
      var att = o.k === 'logos' && Object.keys(ENATTENTE).length
        ? ' (' + Object.keys(ENATTENTE).length + ')' : '';
      return '<button data-ong="' + o.k + '" aria-selected="' + (ONGLET === o.k ? 'true' : 'false') + '">'
        + esc(o.lib) + att + '</button>';
    }).join('');
    var bs = ongl.querySelectorAll('[data-ong]');
    for (var i = 0; i < bs.length; i++) bs[i].onclick = function(e){
      // ⚠ On RETIENT la saisie de l onglet quitte avant de le remplacer :
      // changer d onglet ne doit pas effacer ce qui vient d etre tape.
      retenir();
      ONGLET = e.currentTarget.getAttribute('data-ong');
      dessiner();
    };
  }
  /* La saisie en cours, gardee dans D. Sans cela, ecrire depuis l onglet
     << Logos >> renverrait les valeurs LUES au chargement pour les deux autres. */
  function retenir(){
    if (!D) return;
    if (ONGLET === 'marque' && document.getElementById('m-name')) {
      D.marque = { name: v('m-name'), sub: v('m-sub'), slogan: v('m-slogan'),
        sloganEN: v('m-slogan-en'), letter: v('m-letter'),
        gradient: { enabled: coche('m-grad'), from: v('m-grad-from'),
                    to: v('m-grad-to'), dir: v('m-grad-dir') } };
    }
    if (ONGLET === 'connexion' && document.getElementById('c-from')) {
      D.clientLogin = { bgFrom: v('c-from'), bgTo: v('c-to'), textColor: v('c-text') };
      D.loginTheme = { bgFrom: v('t-bg-from'), bgMid: v('t-bg-mid'),
        logoGradFrom: v('t-logo-from'), logoGradTo: v('t-logo-to'),
        btnGradFrom: v('t-btn-from'), btnGradTo: v('t-btn-to'),
        cardBg: v('t-card'), titleColor: v('t-title'),
        subtitleColor: v('t-sub-col'), subtitleText: v('t-sub') };
    }
  }
  function dessiner(){
    var av = document.getElementById('ro');
    if (av) av.hidden = !RO;
    dessinerOnglets();
    if (ONGLET === 'marque') dessinerMarque();
    else if (ONGLET === 'logos') dessinerLogos();
    else dessinerConnexion();
    bsave.disabled = RO;
    breinit.disabled = RO;
    breinit.textContent = ONGLET === 'connexion' ? 'Réinitialiser les couleurs' : 'Réinitialiser';
  }
  function occuper(o){
    bsave.disabled = o || RO;
    breinit.disabled = o || RO;
  }

  function enregistrer(){
    if (RO) return;
    retenir();
    var saisie = { marque: D.marque, clientLogin: D.clientLogin, loginTheme: D.loginTheme };
    var n = Object.keys(ENATTENTE).length;
    if (n) saisie.logosNouveaux = ENATTENTE;
    occuper(true);
    dire(n ? 'Dépôt de ' + n + ' logo' + (n > 1 ? 's' : '') + '…' : 'Enregistrement…');
    appeler('config:marque:ecrire', [saisie]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        ENATTENTE = {};
        D = r; RO = !r.peutModifier;
        dessiner();
        dire('Logos et marque enregistrés.', 'bon');
      } else {
        // ⚠ On GARDE les choix en attente : un depot refuse ne doit pas faire
        // perdre le fichier que la personne vient de choisir.
        dire(expliquer(r), 'err');
      }
    });
  }
  bsave.onclick = enregistrer;

  breinit.onclick = function(){
    if (RO) return;
    var quoi = ONGLET === 'connexion' ? 'theme' : 'logos';
    occuper(true);
    dire('Remise à zéro…');
    appeler('config:marque:reinit', [quoi]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        if (quoi === 'logos') ENATTENTE = {};
        D = r; RO = !r.peutModifier;
        dessiner();
        dire(quoi === 'theme' ? 'Couleurs de connexion réinitialisées.' : 'Marque et logos réinitialisés.', 'bon');
      } else dire(expliquer(r), 'err');
    });
  };

  function charger(){
    dire('Lecture…');
    appeler('config:marque:donnees').then(function(r){
      if (!r || !r.ok) {
        ongl.innerHTML = '';
        corps.innerHTML = '<div class="carte pleine"><div class="vide">' + expliquer(r) + '</div></div>';
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

module.exports = { pageMarque };
