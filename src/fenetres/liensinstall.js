'use strict';

/*
 * FENÊTRE « LIENS D'INSTALLATION » — NATIVE
 * =============================================================================
 * Fabriquer, à la main, une adresse qui remet l'application à quelqu'un : une
 * déclinaison précise (Windows 64, 32, ARM, macOS Apple ou Intel), une durée de
 * validité choisie, et si on le veut un code dit de vive voix.
 *
 * ⚠ POURQUOI CE N'EST PAS LA MÊME CHOSE QUE L'INVITATION DU PERSONNEL.
 * `adm-download.php` part d'un COMPTE : son lien se calcule à partir de
 * l'identifiant, et il faut le mot de passe temporaire du courriel d'accueil.
 * Excellent pour une embauche. Mais se réinstaller sur un deuxième poste,
 * dépanner quelqu'un, confier un paquet à un comptable externe le temps d'un
 * mandat — rien de tout cela ne passe par un compte neuf. D'où cette fenêtre.
 *
 * ⚠ LA SIGNATURE NE SE CALCULE PAS ICI, ET CE N'EST PAS UN DÉTAIL. Le secret
 * qui tient les liens est une variable d'environnement du serveur. S'il
 * descendait jusqu'ici, il descendrait aussi dans l'app.asar — qui n'est pas
 * chiffré — et n'importe qui pourrait se fabriquer des liens. La fenêtre DÉCRIT
 * ce qu'elle veut ; c'est adm-invite.php qui signe.
 *
 * ⚠ ON NE PROMET PAS L'USAGE UNIQUE, ET ON LE DIT. Un lien signé sans stockage
 * ne peut pas se souvenir d'avoir servi. Qui détient l'adresse peut la réutiliser
 * jusqu'à l'échéance. La fenêtre l'écrit noir sur blanc au moment de remettre le
 * lien : une garantie qu'on ne tient pas est pire que pas de garantie.
 *
 * ⚠ ON N'OFFRE QUE CE QUI EST PUBLIÉ. Les déclinaisons viennent du manifeste
 * réel du dépôt. Une case << macOS >> proposée alors qu'aucun paquet Mac n'a été
 * construit fabriquerait un lien mort chez quelqu'un d'autre, des heures plus
 * tard, sans que personne sache pourquoi.
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
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.8rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.85rem .95rem}
.carte h2{margin:0 0 .6rem;font:700 .8rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8}
label{display:block;font-size:.75rem;color:#8fa1b8;margin:.55rem 0 .2rem}
input,select,button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.36rem .55rem}
input,select{width:100%}
button{cursor:pointer;width:auto}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
.duo{display:flex;gap:.7rem}
.duo>div{flex:1 1 0;min-width:0}
/* Les declinaisons : une par ligne, cliquable en entier — viser un rond de
   12 px a la souris est une source d erreur inutile. */
.decl{display:block;border:1px solid rgba(255,255,255,.12);border-radius:9px;
  padding:.45rem .6rem;margin-bottom:.35rem;cursor:pointer;font-size:.83rem}
.decl:hover{background:rgba(255,255,255,.045)}
.decl.on{border-color:#c9a97e;background:rgba(201,169,126,.1)}
.decl input{width:auto;margin-right:.5rem;vertical-align:-1px}
.decl b{font-weight:600}
.decl span{display:block;color:#8fa1b8;font-size:.72rem;margin-left:1.35rem}
.aide{font-size:.72rem;color:#8fa1b8;margin:.35rem 0 0}
/* Le rappel d honnetete : il ne se lit pas comme une decoration, et il ne se
   ferme pas. Le lien N EST PAS a usage unique, et celui qui le fabrique doit
   le savoir AVANT de l envoyer, pas apres. */
.franc{border:1px solid rgba(240,180,80,.35);background:rgba(200,140,40,.1);
  color:#f0d6a0;border-radius:9px;padding:.5rem .7rem;font-size:.76rem}
.res{border:1px solid rgba(34,197,94,.35);background:rgba(34,197,94,.08)}
.res input{font-family:ui-monospace,Consolas,monospace;font-size:.78rem;
  background:#0b1220;margin-bottom:.5rem}
.res .lg{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Liens d'installation ». */
function pageLiensInstall() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Liens d’installation — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🔗</span><h1>Liens d’installation</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var sous  = document.getElementById('sous');

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne permet pas de distribuer l’application.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var base = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    // ⚠ LE DETAIL DU SERVEUR EST RENDU TEL QUEL. << L operation a echoue >> ne
    // dit pas si le paquet manque, si la version n existe pas ou si le depot
    // est muet — et sans cela on cherche au mauvais endroit.
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

  var ETAT = { version: '', paquets: [], choix: '' };

  var DUREES = [
    ['1', '1 heure'], ['4', '4 heures'], ['24', '24 heures'],
    ['72', '3 jours'], ['168', '7 jours'], ['720', '30 jours']
  ];

  function dessiner(){
    if (!ETAT.paquets.length) {
      corps.innerHTML = '<div class="carte"><div class="vide">'
        + 'Aucun paquet n’est publié dans le dépôt.<br>'
        + 'Publiez une version de l’application avant de fabriquer un lien.'
        + '</div></div>';
      return;
    }
    var h = [];
    h.push('<div class="carte"><h2>Déclinaison</h2>');
    ETAT.paquets.forEach(function(p){
      var mo = p.taille ? (Math.round(p.taille / 1048576) + ' Mo') : '';
      h.push('<label class="decl' + (p.cle === ETAT.choix ? ' on' : '') + '" data-cle="' + esc(p.cle) + '">'
        + '<input type="radio" name="decl" value="' + esc(p.cle) + '"'
        + (p.cle === ETAT.choix ? ' checked' : '') + '>'
        + '<b>' + esc(p.nom) + '</b>'
        + '<span>' + esc(p.note) + (mo ? ' · ' + mo : '') + '</span></label>');
    });
    // ⚠ CE QUI MANQUE SE DIT AUSSI. Sans cette ligne, l absence de paquet Mac
    // ressemble a un oubli d affichage, et l on cherche un bogue de fenetre
    // alors que la construction a simplement ete lancee sans macOS.
    var mac = ETAT.paquets.filter(function(p){ return p.cle.indexOf('mac-') === 0; }).length;
    if (!mac) {
      h.push('<p class="aide">Aucun paquet macOS n’a été publié pour cette version. '
        + 'Pour en obtenir un, relancez la construction avec l’option macOS activée.</p>');
    }
    h.push('</div>');

    h.push('<div class="carte"><h2>Validité et protection</h2><div class="duo">');
    h.push('<div><label for="f-duree">Le lien reste valable</label><select id="f-duree">');
    DUREES.forEach(function(d){
      h.push('<option value="' + d[0] + '"' + (d[0] === '24' ? ' selected' : '') + '>' + d[1] + '</option>');
    });
    h.push('</select></div>');
    h.push('<div><label for="f-version">Version</label>'
      + '<input id="f-version" type="text" value="' + esc(ETAT.version) + '" placeholder="' + esc(ETAT.version) + '"></div>');
    h.push('</div>');
    h.push('<label for="f-code">Code d’accès (facultatif)</label>'
      + '<input id="f-code" type="text" autocomplete="off" placeholder="laisser vide pour un lien sans code">');
    h.push('<p class="aide">Si vous mettez un code, dites-le de vive voix — jamais dans le même courriel que le lien.</p>');
    h.push('</div>');

    h.push('<div class="carte franc">'
      + '<b>Ce lien n’est pas à usage unique.</b> Qui possède l’adresse peut '
      + 'télécharger autant de fois qu’il le veut, jusqu’à l’échéance. C’est '
      + 'pourquoi la durée par défaut est courte et le code existe.</div>');

    h.push('<div><button class="prim" id="f-creer">Fabriquer le lien</button></div>');
    h.push('<div id="zone-res"></div>');
    corps.innerHTML = h.join('');
    brancher();
  }

  function brancher(){
    Array.prototype.forEach.call(corps.querySelectorAll('.decl'), function(l){
      l.onclick = function(){
        ETAT.choix = l.getAttribute('data-cle');
        Array.prototype.forEach.call(corps.querySelectorAll('.decl'), function(x){
          x.classList.toggle('on', x === l);
        });
      };
    });
    var b = document.getElementById('f-creer');
    if (b) b.onclick = creer;
  }

  function creer(){
    if (!ETAT.choix) { dire('Choisissez d’abord une déclinaison.', 'err'); return; }
    var b = document.getElementById('f-creer');
    var duree = document.getElementById('f-duree');
    var vers  = document.getElementById('f-version');
    var code  = document.getElementById('f-code');
    b.disabled = true;
    dire('Fabrication du lien…');
    appeler('install:lien', [{
      arch: ETAT.choix,
      heures: duree ? duree.value : '24',
      version: vers ? vers.value.trim() : '',
      code: code ? code.value.trim() : ''
    }]).then(function(r){
      b.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Lien prêt.', 'bon');
      montrer(r, code && code.value.trim() !== '');
    });
  }

  function quand(ts){
    var d = new Date(Number(ts) * 1000);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('fr-CA', { dateStyle: 'long', timeStyle: 'short' });
  }

  function montrer(r, avecCode){
    var z = document.getElementById('zone-res');
    if (!z) return;
    z.innerHTML = '<div class="carte res"><h2>Lien à remettre</h2>'
      + '<input id="r-url" type="text" readonly value="' + esc(r.url) + '">'
      + '<div class="lg"><button id="r-copier">📋 Copier</button>'
      + '<span class="aide">' + esc(r.nom) + ' · version ' + esc(r.version)
      + ' · valable jusqu’au ' + esc(quand(r.expire)) + '</span></div>'
      + (avecCode
          ? '<p class="aide">Ce lien demande le code. Communiquez-le séparément du lien.</p>'
          : '<p class="aide">Ce lien ne demande aucun code : quiconque l’obtient peut télécharger l’installateur.</p>')
      + '</div>';
    var i = document.getElementById('r-url');
    var c = document.getElementById('r-copier');
    if (c) c.onclick = function(){
      i.select();
      // ⚠ execCommand ET NON navigator.clipboard : une fenetre native est
      // chargee en data:, son origine est nulle, donc elle n est PAS un contexte
      // securise — l API moderne du presse-papiers y est refusee. Mesure sur ce
      // projet ; le vieil appel, lui, fonctionne.
      var fait = false;
      try { fait = document.execCommand('copy'); } catch (e) { fait = false; }
      c.textContent = fait ? '✓ Copié' : 'Ctrl+C pour copier';
    };
    i.scrollIntoView({ block: 'nearest' });
  }

  function charger(){
    appeler('install:paquets').then(function(r){
      if (!r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      ETAT.version = r.version || '';
      ETAT.paquets = r.paquets || [];
      ETAT.choix = ETAT.paquets.length ? ETAT.paquets[0].cle : '';
      sous.textContent = ETAT.version ? ('Version publiée : ' + ETAT.version) : '';
      dessiner();
      dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageLiensInstall };
