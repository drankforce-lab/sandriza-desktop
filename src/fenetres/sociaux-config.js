'use strict';

/*
 * FENÊTRE « CONFIGURATION DES RÉSEAUX SOCIAUX » — NATIVE (#10)
 * =============================================================================
 * Le DERNIER écran d'administration qui n'avait pas d'équivalent natif — et
 * c'est ce qui l'a fait disparaître un instant lors du ménage de la 3.5.0 :
 * il affichait « cet écran vit dans l'application » alors qu'aucune application
 * ne savait l'ouvrir. Porté ici le 2026-08-14, à sa demande.
 *
 * ⚠ LE JETON NE TRAVERSE JAMAIS. Comme pour les Clés API et les transporteurs,
 * le cœur ne rend qu'un booléen « posé / absent » : une fenêtre n'a aucune
 * raison de connaître un secret qu'elle ne fait qu'enregistrer. Un champ laissé
 * vide CONSERVE le jeton en place — il ne l'efface pas.
 *
 * ⚠ LA FENÊTRE « RÉSEAUX SOCIAUX » (sociaux.js) EST UNE AUTRE CHOSE : elle porte
 * la FILE DE PUBLICATION. Ici, ce sont les comptes et leurs jetons.
 *
 * ⚠ ANCRÉE = PLEINE PAGE. ⚠ Aucun accent grave dans la portion de script.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.55rem 1.1rem;
  border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.ro{flex:0 0 auto;margin:.55rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.45rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.quoi{font-size:.79rem;color:var(--tx2);line-height:1.6;margin:0 0 1rem;max-width:62rem}
.quoi b{color:var(--tx)}
.auto{display:flex;align-items:center;gap:.5rem;font-size:.84rem;margin:0 0 1.2rem;
  background:var(--v03);border:1px solid var(--v08);
  border-radius:10px;padding:.6rem .8rem}
.auto input{width:16px;height:16px;accent-color:#c9a97e}
.grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(27rem,1fr));gap:.9rem}
.res{background:var(--v03);border:1px solid var(--v11);border-radius:13px;padding:1rem 1.1rem}
.res.on{border-color:rgba(201,169,126,.42)}
.res .haut{display:flex;align-items:center;gap:.7rem;margin:0 0 .8rem}
.res .nom{font:700 1rem/1.2 Georgia,serif;flex:1 1 auto}
.res label.bascule{display:flex;align-items:center;gap:.4rem;font-size:.82rem;cursor:pointer}
.res label.bascule input{width:16px;height:16px;accent-color:#c9a97e}
.pill{display:inline-block;font-size:.66rem;font-weight:700;padding:2px 8px;border-radius:99px;white-space:nowrap}
.pill.ok{background:rgba(22,163,74,.2);color:var(--tx-ok2)}
.pill.non{background:rgba(234,179,8,.18);color:#e6c14a}
label.champ{display:block;margin:0 0 .8rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:var(--tx-gris);margin:.25rem 0 0;line-height:1.5}
.rang{display:flex;gap:.45rem}
input.t{flex:1 1 auto;min-width:0;background:var(--f-champ);border:1px solid #2b3444;border-radius:8px;
  color:var(--tx);font:inherit;padding:.45rem .6rem;font-family:Consolas,monospace;font-size:.82rem}
input.t:focus{outline:none;border-color:#c9a97e}
.b{font:inherit;font-size:.79rem;border:1px solid var(--v16);border-radius:8px;
  padding:.4rem .7rem;background:var(--v05);color:var(--tx);cursor:pointer;white-space:nowrap}
.b:hover:not(:disabled){background:var(--v09)}
.b:disabled{opacity:.45;cursor:default}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
.vide{padding:2rem 1rem;text-align:center;color:var(--tx2);font-size:.84rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageSociauxConfig() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Configuration des réseaux sociaux — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.social}</span><h1>Configuration des réseaux sociaux</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter ces réglages, pas les modifier.</div>
<div class="corps"><div id="corps"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; b.style.marginLeft='auto'; t.appendChild(b); }
    if (actif) { b.textContent='⧉ Détacher'; b.title='Ouvrir cet écran dans sa propre fenêtre'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='⚓ Ancrer'; b.title='Ramener cet écran dans la fenêtre principale'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var D = null, RO = true, OCCUPE = false;

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function txv(id){ var e=document.getElementById(id); return e?String(e.value||''):''; }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès aux réseaux sociaux.',
    indisponible:'L’administration n’est pas encore chargée dans la fenêtre principale.',
    invalide:'Renseignement manquant ou invalide.',
    refus:'Le réseau a refusé la connexion.',
    reseau:'Le réseau social est injoignable.',
    pont_indisponible:'La fenêtre principale ne répond pas.',
    delai:"La fenêtre principale n'a pas répondu à temps.",
    operation_inconnue:'Cette version de l’application ne connaît pas cette opération.',
    echec:'L’opération a échoué.'
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('Erreur inattendue ('+esc(m||'?')+').'))+(r&&r.detail?' — '+esc(r.detail):''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }

  function dessiner(){
    var l = D.reseaux || [];
    var h = '<p class="quoi">Chaque réseau se connecte avec un <b>jeton d’accès</b> obtenu chez lui. '
      + 'Le jeton est enregistré dans le nuage et <b>ne se réaffiche jamais</b> : le champ reste vide, '
      + 'et le laisser vide conserve celui qui est en place. Un réseau désactivé n’est jamais publié.</p>';

    h += '<label class="auto"><input type="checkbox" id="s-auto" '+(D.autoPublication?'checked':'')+(RO?' disabled':'')+'>'
      + '<span><b>Publier automatiquement la file, une fois par jour</b> — décoché, la file attend une publication manuelle.</span></label>';

    h += '<div class="grille">';
    for (var i=0;i<l.length;i++){ var r=l[i];
      h += '<div class="res'+(r.actif?' on':'')+'">'
        + '<div class="haut"><div class="nom">'+esc(r.nom)+'</div>'
        + (r.jetonPose ? '<span class="pill ok">Jeton en place</span>' : '<span class="pill non">Aucun jeton</span>')
        + '<label class="bascule"><input type="checkbox" data-actif="'+esc(r.cle)+'" '+(r.actif?'checked':'')+(RO?' disabled':'')+'> Activer</label>'
        + '</div>'
        + '<label class="champ"><span class="lbl">Jeton d’accès</span>'
        + '<span class="rang"><input class="t" type="password" id="tok-'+esc(r.cle)+'" autocomplete="new-password" placeholder="'
        + (r.jetonPose ? 'laisser vide = jeton conservé' : 'coller le jeton ici') + '"'+(RO?' disabled':'')+'>'
        + (RO?'':'<button class="b" data-tok="'+esc(r.cle)+'">Enregistrer</button>')+'</span>'
        + '<span class="sub">'+esc(r.aide)+'</span></label>'
        + '<label class="champ"><span class="lbl">'+esc(r.extraLabel)+'</span>'
        + '<span class="rang"><input class="t" id="ext-'+esc(r.cle)+'" value="'+esc(r.extraValeur)+'" placeholder="identifiant numérique"'+(RO?' disabled':'')+'>'
        + (RO?'':'<button class="b" data-ext="'+esc(r.cle)+'">Enregistrer</button>')+'</span></label>'
        + (r.testable && r.jetonPose ? '<button class="b" data-test="'+esc(r.cle)+'"><span class="ic">🔗</span> Tester la connexion</button>' : '')
        + '</div>';
    }
    h += '</div>';
    corps.innerHTML = h;
    lier();
  }

  function lier(){
    var a=document.getElementById('s-auto');
    if (a) a.onchange=function(){ ecrire('', 'auto', a.checked, 'Publication automatique enregistrée.'); };
    var bs=corps.querySelectorAll('[data-actif]');
    for (var i=0;i<bs.length;i++) bs[i].onchange=function(){
      ecrire(this.getAttribute('data-actif'), 'actif', this.checked, 'Réseau mis à jour.'); };
    var ts=corps.querySelectorAll('[data-tok]');
    for (var j=0;j<ts.length;j++) ts[j].onclick=function(){
      var k=this.getAttribute('data-tok'), v=txv('tok-'+k);
      /* ⚠ VIDE = ON CONSERVE. Enregistrer un champ vide effacerait le jeton en
         place sans que personne l ait demande — et la publication s arreterait
         en silence. Pour retirer un jeton, on desactive le reseau. */
      if (!v.trim()) { dire('Champ vide : le jeton en place est conservé.', 'att'); return; }
      ecrire(k, 'token', v, 'Jeton enregistré.'); };
    var es=corps.querySelectorAll('[data-ext]');
    for (var k2=0;k2<es.length;k2++) es[k2].onclick=function(){
      var k=this.getAttribute('data-ext');
      ecrire(k, 'extra', txv('ext-'+k), 'Identifiant enregistré.'); };
    var ss=corps.querySelectorAll('[data-test]');
    for (var m=0;m<ss.length;m++) ss[m].onclick=function(){ tester(this.getAttribute('data-test'), this); };
  }

  function ecrire(net, champ, valeur, bon){
    if (RO || OCCUPE) return; OCCUPE=true; dire('Enregistrement…');
    appeler('sociaux:config:ecrire',[net, champ, valeur]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ D=r; RO=!r.peutEcrire; dessiner(); dire(bon, 'bon'); }
      else dire('Échec : '+expliquer(r), 'err'); });
  }

  function tester(net, bouton){
    if (OCCUPE) return; OCCUPE=true;
    if (bouton){ bouton.disabled=true; bouton.textContent='⏳ Test…'; }
    dire('Interrogation du réseau…');
    appeler('sociaux:config:tester',[net]).then(function(r){ OCCUPE=false;
      if (bouton){ bouton.disabled=false; bouton.textContent='🔗 Tester la connexion'; }
      if (r&&r.ok) dire('Connecté — '+esc(r.quoi||''), 'bon');
      else dire('Échec : '+expliquer(r), 'err'); });
  }

  function charger(){
    dire('Chargement…');
    appeler('sociaux:config:donnees',[]).then(function(r){
      if (!r||!r.ok){ corps.innerHTML='<div class="vide">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; RO=!r.peutEcrire;
      var av=document.getElementById('ro'); if (av) av.hidden=!RO;
      dessiner(); dire('');
    });
  }

  window.szRevenir = function(){ if (!OCCUPE) charger(); };
  charger();
})();
</script></body></html>`;
}

module.exports = { pageSociauxConfig };
