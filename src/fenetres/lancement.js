'use strict';

/*
 * FENÊTRE « MODE LANCEMENT » — NATIVE (Configuration, palier 5 — DERNIER onglet)
 * =============================================================================
 * ⚠⚠ GARDE ABSOLUE : « rien indexé avant le vrai feu vert ». Cette fenêtre ne fait
 * que LIRE l'état réel du serveur (launch_toggle.php) et, sur action EXPLICITE avec
 * CONFIRMATION EN DEUX TEMPS, basculer le drapeau. Elle ne change aucun défaut et
 * n'affaiblit aucune garde noindex. L'état durable reste la variable Render
 * ELG_LAUNCHED (un fichier posé ici saute au prochain déploiement).
 *
 * ⚠ ANCRÉE = PLEINE PAGE. ⚠ Aucun caractère ` dans la portion de script.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;
  border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.etat{border-radius:12px;padding:1.25rem 1.4rem;margin:0 0 1.2rem;border:2px solid}
.etat .lg{font-size:1.05rem;font-weight:700;margin:0 0 .2rem}
.etat .ds{font-size:.82rem;color:var(--tx2)}
.etat .rangee{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
.etat .rangee .g{flex:1;min-width:180px}
.src{font-size:.8rem;margin:.7rem 0 0}
.src.ok{color:var(--tx2)}.src.warn{color:var(--tx-jaune)}.src.err{color:var(--tx-err)}
.src code{background:var(--f-champ);border:1px solid var(--v12);border-radius:5px;padding:1px 6px;font-size:.74rem}
.h4{font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2);margin:0 0 .6rem}
.prot{display:flex;flex-direction:column;gap:.5rem;margin:0 0 1.2rem}
.prot .l{display:flex;align-items:center;gap:.7rem;font-size:.85rem}
.prot .l .em{width:1.4em;text-align:center;filter:grayscale(1) brightness(1.7);opacity:.9}
.info{background:var(--v04);border:1px solid var(--v08);border-radius:9px;
  padding:.85rem 1rem;font-size:.8rem;color:var(--tx2);line-height:1.6}
.info b{color:var(--tx)}.info code{background:var(--f-champ);border:1px solid var(--v12);border-radius:5px;padding:1px 6px;font-size:.74rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button.bsc{font:inherit;border:none;border-radius:8px;padding:.65rem 1.25rem;font-size:.88rem;font-weight:700;cursor:pointer;color:var(--tx-blanc);white-space:nowrap}
button.bsc:disabled{opacity:.5;cursor:default}
.vide{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageLancement() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Mode lancement — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.fusee}</span><h1>Mode lancement</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
<div class="corps"><div id="corps"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; b.style.marginLeft='.4rem'; t.appendChild(b); }
    if (actif) { b.textContent='⧉ Détacher'; b.title='Ouvrir cet écran dans sa propre fenêtre'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='⚓ Ancrer'; b.title='Ramener cet écran dans la fenêtre principale'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var D = null, RO = false, OCCUPE = false, CONF = false;

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:'Votre rôle est en lecture seule.',
    indisponible:'État du serveur indisponible (endpoint injoignable).',
    pont_indisponible:'La fenêtre principale ne répond pas.',
    delai:"La fenêtre principale n'a pas répondu à temps.",
    operation_inconnue:'Cette version de l’application ne connaît pas cette opération.',
    refus:'Le serveur a refusé le changement.',
    reseau:'Erreur réseau en joignant le serveur.',
    echec:"L'opération a échoué.",
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('Erreur inattendue ('+esc(m||'?')+').'))+(r&&r.detail?' — '+esc(r.detail):''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }

  function protLigne(em, titre, txt){ return '<div class="l"><span class="em">' + em + '</span><div><strong>' + titre + '</strong> — ' + txt + '</div></div>'; }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    var enLigne = !!D.enLigne;
    var coul = enLigne ? '#16a34a' : '#d97706';
    var fond = enLigne ? 'rgba(22,163,74,.08)' : 'rgba(217,119,6,.08)';
    var lbl = enLigne ? '🌐 En ligne' : '🔒 Pré-lancement';
    var ds = enLigne ? 'Le site est visible par les moteurs de recherche et les visiteurs.'
                     : 'Le site est protégé contre l’indexation. Seules les personnes ayant le lien direct peuvent le visiter.';
    var btnTxt = enLigne ? 'Repasser en pré-lancement' : (CONF ? '⚠ Confirmer le lancement PUBLIC ?' : 'Lancer le site au public');
    var btnCoul = enLigne ? '#ef4444' : (CONF ? '#b91c1c' : '#16a34a');

    var src;
    if (!D.coherent && D.envPresente) src = '<div class="src err">✗ Incohérence : la variable Render <code>ELG_LAUNCHED=' + esc(D.envValeur) + '</code> dit le contraire de l’état actuel. Le prochain déploiement suivra la variable.</div>';
    else if (D.envPresente) src = '<div class="src ok"><span class="ic">🔗</span> État piloté par la variable Render <code>ELG_LAUNCHED=' + esc(D.envValeur) + '</code> — il survit aux déploiements.</div>';
    else src = '<div class="src warn"><span class="ic">⚠</span> Aucune variable <code>ELG_LAUNCHED</code> dans Render : l’état actuel est un simple fichier, effacé au prochain déploiement. Ajoutez-la dans Render pour le rendre durable.</div>';

    var h = '<div class="etat" style="border-color:' + coul + ';background:' + fond + '">'
      + '<div class="rangee"><div class="g"><div class="lg" style="color:' + coul + '">' + lbl + '</div><div class="ds">' + ds + '</div></div>'
      + (RO ? '' : '<button class="bsc" id="b-bascule" style="background:' + btnCoul + '">' + esc(btnTxt) + '</button>')
      + '</div>' + src + '</div>';

    h += '<div class="h4">Mesures de protection</div><div class="prot">'
      + protLigne('☁', 'robots.txt', 'servi par Cloudflare, pas par ce site : ce bouton ne le change pas')
      + protLigne(enLigne ? '✅' : '🔒', 'X-Robots-Tag HTTP', enLigne ? 'en-tête retiré' : 'noindex, nofollow sur toutes les pages')
      + protLigne(enLigne ? '✅' : '🔒', 'Meta robots HTML', enLigne ? 'balise retirée' : 'noindex dans chaque page')
      + protLigne('🛡', 'En-têtes de sécurité', 'X-Frame-Options, CSP, XSS-Protection (toujours actifs)')
      + protLigne('🛡', 'Fichiers sensibles', '.env, Dockerfile, CLAUDE.md inaccessibles (toujours actif)')
      + '</div>';

    h += '<div class="info"><b>ℹ Comment fonctionne le bouton.</b> Il crée ou supprime un fichier '
      + '<code>launch.flag</code> sur le serveur, qui pilote l’en-tête <code>X-Robots-Tag</code> et la balise '
      + '<code>meta robots</code> — effet immédiat, sans redéploiement. <b>Mais l’état durable, c’est la variable '
      + 'Render <code>ELG_LAUNCHED</code></b> : chaque déploiement reconstruit le serveur et repose le drapeau selon '
      + 'elle. Pour lancer <b>pour de bon</b> : <code>ELG_LAUNCHED=1</code> dans Render. Sans elle, le défaut est '
      + '« pré-lancement ».</div>';

    corps.innerHTML = h;
    var b = document.getElementById('b-bascule');
    if (b) b.onclick = function(){ cliquer(); };
  }

  function cliquer(){
    if (RO || OCCUPE) return;
    var enLigne = !!D.enLigne;
    if (enLigne) { basculer('prelaunch'); return; }   // revenir en protégé : sûr, immédiat
    // PASSER EN LIGNE : garde absolue → confirmation en deux temps.
    if (!CONF) {
      CONF = true; dessiner();
      dire('⚠ Cliquez encore pour rendre le site PUBLIC et indexable.', 'att');
      setTimeout(function(){ if (CONF) { CONF = false; dessiner(); } }, 6000);
      return;
    }
    CONF = false;
    basculer('launch');
  }
  function basculer(action){
    OCCUPE = true; dire(action === 'launch' ? 'Lancement…' : 'Retour en pré-lancement…');
    appeler('config:lancement:basculer', [action]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) {
        D = r; RO = !r.peutModifier; dessiner();
        dire(r.enLigne ? '🌐 Site EN LIGNE au public.' : '🔒 Mode pré-lancement activé.', r.enLigne ? 'att' : 'bon');
      } else dire('Échec : ' + expliquer(r), 'err');
    });
  }

  function charger(){
    dire('Lecture de l’état du serveur…');
    appeler('config:lancement:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide m-' + ((r && r.motif) || 'echec') + '">' + expliquer(r) + '</div>'; dire(expliquer(r), 'err'); return; }
      D = r; RO = !r.peutModifier; CONF = false; dessiner(); dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageLancement };
