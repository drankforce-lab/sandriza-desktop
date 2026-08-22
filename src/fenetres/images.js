'use strict';

/*
 * FENÊTRE « IMAGES DES PRODUITS » — NATIVE (Catalogue)
 * =============================================================================
 * Une seule chose ici, et elle est invisible depuis la boutique : les fiches
 * qui portent encore leur image COLLÉE DANS LA FICHE (base64) au lieu d'une
 * adresse vers le seau d'images. Elles s'affichent parfaitement — c'est bien le
 * problème : rien ne les signale, et chacune fait voyager son image entière à
 * CHAQUE chargement du catalogue, sans que le navigateur puisse la garder en
 * cache. Une seule fiche de 2 Mo suffit à rendre la boutique poussive sur un
 * téléphone.
 *
 * ⚠⚠ LA RÈGLE, DANS SES MOTS : « une fiche sans image est pire qu'une image
 * lente ». Le cœur (`assets/js/images.js`) n'efface une image collée QUE si le
 * dépôt a rendu une vraie adresse ET que cette adresse a été relue avec
 * succès. Cette fenêtre ne fait donc RIEN d'astucieux de son côté : elle
 * appelle, elle rappelle tant qu'il reste du travail, et elle MONTRE ce qui a
 * échoué. Un échec masqué serait pire qu'un échec bruyant.
 *
 * ⚠ PAR LOTS, ET C'EST VOULU. Une fiche peut porter vingt images ; tout envoyer
 * d'un coup fait tomber le relais et l'on ne sait plus ce qui est passé. Le
 * cœur borne chaque appel ; la fenêtre boucle, en affichant l'avancement.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;
  border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,#131c2b,#0e1522)}
h1{font-size:1rem;margin:0;font-weight:650}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.zone{columns:34rem;column-gap:1.1rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:1rem 1.1rem;
  margin:0 0 1.1rem;break-inside:avoid;-webkit-column-break-inside:avoid}
.carte h2{font-size:.84rem;margin:0 0 .7rem;color:#c9a97e;letter-spacing:.03em;text-transform:uppercase}
.info{background:rgba(80,120,190,.1);border:1px solid rgba(120,160,220,.28);color:#bcd2f0;
  border-radius:9px;padding:.7rem .85rem;font-size:.78rem;line-height:1.6;margin:0 0 1rem}
.info b{color:#dbe7fb}
.bien{background:rgba(60,160,110,.1);border-color:rgba(90,200,140,.3);color:#a9e6c6}
.bien b{color:#d3f6e4}
.chiffres{display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem;margin:0 0 .9rem}
.kpi{background:#0f1724;border:1px solid #2b3444;border-radius:9px;padding:.6rem .7rem;text-align:center}
.kpi .n{font-size:1.35rem;font-weight:700;line-height:1.15;font-variant-numeric:tabular-nums}
.kpi .l{font-size:.68rem;color:#8fa1b8;margin-top:.15rem}
.kpi.chaud .n{color:#facc15}
table{width:100%;border-collapse:collapse;font-size:.79rem}
thead th{text-align:left;font-weight:600;color:#8fa1b8;font-size:.71rem;letter-spacing:.04em;
  text-transform:uppercase;padding:.3rem .4rem;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.32rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.sku{font-size:.7rem;color:#6d7f96}
.echec{border:1px solid rgba(240,120,120,.35);background:rgba(200,60,60,.09);color:#f6bdbd;
  border-radius:9px;padding:.6rem .8rem;font-size:.77rem;margin-top:.8rem}
.echec b{color:#ffd9d9}
.echec ul{margin:.4rem 0 0;padding-left:1.1rem}
.jauge{height:7px;border-radius:99px;background:#0f1724;border:1px solid #2b3444;overflow:hidden;margin:.6rem 0 .3rem}
.jauge i{display:block;height:100%;background:#c9a97e;width:0;transition:width .25s}
.vide{padding:1rem;text-align:center;color:#8fa1b8;font-size:.82rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.55rem 1.05rem;
  border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
button.prim{font:inherit;background:#c9a97e;border:1px solid #c9a97e;color:#1a1208;font-weight:700;
  border-radius:8px;padding:.42rem .9rem;cursor:pointer}
button.prim:hover:not(:disabled){background:#d8bd97}
button.prim:disabled{opacity:.5;cursor:default}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;border:1px solid rgba(255,255,255,.16);
  border-radius:7px;background:rgba(255,255,255,.05);color:#e8edf5;cursor:pointer;-webkit-user-select:none;user-select:none}
.mini:hover:not(:disabled){background:rgba(255,255,255,.1)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageImages() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Images des produits — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.image}</span><h1>Images des produits</h1></div>
<div class="corps"><div class="zone" id="corps"><div class="vide">Lecture du catalogue…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-migrer" disabled>Déplacer les images</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; t.appendChild(b); }
    if (actif) { b.textContent='⧉ Détacher'; b.title='Ouvrir cet écran dans sa propre fenêtre'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='⚓ Ancrer'; b.title='Ramener cet écran dans la fenêtre principale'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var bmig = document.getElementById('b-migrer');
  var E = null, OCCUPE = false, ECHECS = [], DEPART = 0;

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  function poids(o){
    o = Number(o) || 0;
    if (o >= 1048576) return (o / 1048576).toFixed(1).replace('.', ',') + ' Mo';
    if (o >= 1024) return Math.round(o / 1024) + ' ko';
    return o + ' o';
  }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne permet pas de modifier les fiches produits.',
    indisponible:"Le catalogue n'est pas encore chargé dans la fenêtre principale.",
    pont_indisponible:'La fenêtre principale ne répond pas.',
    delai:"La fenêtre principale n'a pas répondu à temps.",
    operation_inconnue:'Cette version de l’application ne connaît pas cette opération.',
    echec:"L'opération a échoué.",
  };
  /* Les motifs d'un ÉCHEC PAR IMAGE. Ils ne sont pas décoratifs : chacun mène à
     un geste différent, et confondre les deux premiers ferait chercher au
     mauvais endroit pendant des heures. */
  var MOTIFS_IMG = {
    televersement:'le dépôt de l’image a échoué (relais indisponible, ou fichier refusé)',
    illisible:'l’image a bien été déposée, mais impossible de la relire ensuite — rien n’a donc été remplacé',
    enregistrement:'les images sont déposées, mais la fiche n’a pas pu être enregistrée',
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('Erreur inattendue ('+esc(m||'?')+').'))+(r&&r.detail?' ('+esc(r.detail)+')':''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }

  function dessiner(){
    if (!E) { corps.innerHTML = '<div class="vide">Lecture du catalogue…</div>'; return; }
    var h = '';

    if (!E.base64) {
      h += '<div class="carte"><div class="info bien"><span class="ic">✅</span> '
        + '<b>Rien à déplacer.</b> Les ' + E.champs + ' image(s) du catalogue sont déjà dans le seau d’images : '
        + 'le navigateur des clients peut les garder en cache, et le catalogue ne les transporte plus à chaque visite.'
        + '</div>';
      if (ECHECS.length) h += echecsHtml();
      h += '</div>';
      corps.innerHTML = h;
      bmig.disabled = true;
      return;
    }

    h += '<div class="carte">'
      + '<div class="info"><span class="ic">🖼️</span> Ces fiches portent encore leur image <b>collée dans la fiche</b> plutôt qu’une adresse. '
      + 'Elles s’affichent très bien — c’est pour ça que personne ne les voit passer : leur image voyage <b>entière, à chaque chargement du catalogue</b>, '
      + 'et le navigateur ne peut pas la garder en cache.<br><br>'
      + 'Le déplacement <b>ne perd rien</b> : une image n’est retirée de la fiche que si son dépôt a réussi <b>et</b> qu’elle a pu être relue ensuite. '
      + 'Il peut être interrompu et repris — ce qui est déjà fait ne sera pas refait.</div>';

    h += '<div class="chiffres">'
      + '<div class="kpi chaud"><div class="n">' + E.fiches.length + '</div><div class="l">fiche(s) concernée(s)</div></div>'
      + '<div class="kpi chaud"><div class="n">' + E.base64 + '</div><div class="l">image(s) à déplacer</div></div>'
      + '<div class="kpi chaud"><div class="n">' + poids(E.octets) + '</div><div class="l">transportés à chaque visite</div></div>'
      + '</div>';

    if (DEPART > 0) {
      var faits = Math.max(0, DEPART - E.fiches.length);
      h += '<div class="jauge"><i style="width:' + Math.round(faits * 100 / DEPART) + '%"></i></div>'
        + '<div style="font-size:.72rem;color:#8fa1b8">' + faits + ' / ' + DEPART + ' fiche(s) traitée(s)</div>';
    }

    h += '<table><thead><tr><th>Fiche</th><th style="text-align:right">Images</th><th style="text-align:right">Poids</th></tr></thead><tbody>';
    E.fiches.slice(0, 40).forEach(function(f){
      h += '<tr><td><div>' + esc(f.nom || f.id) + '</div>'
        + (f.sku ? '<div class="sku">' + esc(f.sku) + '</div>' : '')
        + '</td><td class="n">' + f.champs + '</td><td class="n">' + poids(f.octets) + '</td></tr>';
    });
    h += '</tbody></table>';
    if (E.fiches.length > 40) h += '<div style="font-size:.72rem;color:#8fa1b8;margin-top:.4rem">… et ' + (E.fiches.length - 40) + ' autre(s).</div>';

    if (ECHECS.length) h += echecsHtml();
    h += '</div>';
    corps.innerHTML = h;
    bmig.disabled = OCCUPE;
  }

  /* ⚠ LES ÉCHECS SONT MONTRÉS, PAS RÉSUMÉS EN « quelques erreurs ». Sans le nom
     de la fiche et le motif, on ne peut rien en faire — et une migration qui se
     bloque toujours sur les deux mêmes fiches passerait pour terminée. */
  function echecsHtml(){
    var h = '<div class="echec"><b>' + ECHECS.length + ' image(s) n’ont pas pu être déplacées</b> — '
      + 'elles sont <b>restées intactes</b> dans leur fiche, rien n’a été perdu. Vous pouvez relancer.<ul>';
    ECHECS.slice(0, 12).forEach(function(e){
      h += '<li>' + esc(e.nom || e.id) + ' <span class="sku">(' + esc(e.chemin) + ')</span> — '
        + esc(MOTIFS_IMG[e.motif] || e.motif) + '</li>';
    });
    h += '</ul>';
    if (ECHECS.length > 12) h += '<div style="margin-top:.3rem">… et ' + (ECHECS.length - 12) + ' autre(s).</div>';
    return h + '</div>';
  }

  function charger(){
    dire('Lecture…');
    return appeler('images:etat').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + expliquer(r) + '</div>'; dire(expliquer(r), 'err'); bmig.disabled = true; return false; }
      E = r; dessiner(); dire(''); return true;
    });
  }

  /* La boucle. Elle s'arrête sur trois conditions, et la troisième est la plus
     importante : SI UN TOUR NE FAIT PLUS RIEN AVANCER, on s'arrête. Sans elle,
     une fiche qui échoue toujours ferait tourner la fenêtre indéfiniment. */
  function migrer(){
    if (OCCUPE || !E || !E.base64) return;
    OCCUPE = true; bmig.disabled = true; ECHECS = []; DEPART = E.fiches.length;
    var tours = 0;

    function tour(){
      tours++;
      dire('Déplacement en cours… (' + Math.max(0, DEPART - (E ? E.fiches.length : 0)) + ' / ' + DEPART + ')', 'att');
      var avant = E.fiches.length;
      return appeler('images:migrer', [{ lot: 3 }]).then(function(r){
        if (!r || !r.ok) { OCCUPE = false; bmig.disabled = false; dire(expliquer(r), 'err'); return; }
        if (r.echecs && r.echecs.length) ECHECS = ECHECS.concat(r.echecs);
        return charger().then(function(bon){
          if (!bon) { OCCUPE = false; return; }
          if (!E.base64) { OCCUPE = false; bmig.disabled = true; dessiner(); dire('Terminé : toutes les images sont dans le seau.', 'bon'); return; }
          if (E.fiches.length >= avant) {
            OCCUPE = false; bmig.disabled = false; dessiner();
            dire('Arrêté : le dernier tour n’a rien fait avancer. Voyez les échecs ci-dessus.', 'err');
            return;
          }
          if (tours > 400) { OCCUPE = false; bmig.disabled = false; dessiner(); dire('Arrêté par sécurité après 400 tours. Relancez pour continuer.', 'att'); return; }
          dessiner();
          return tour();
        });
      });
    }
    tour();
  }
  bmig.onclick = migrer;

  charger();
})();
</script></body></html>`;
}

module.exports = { pageImages };
