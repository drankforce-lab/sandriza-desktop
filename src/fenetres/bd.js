'use strict';

/*
 * FENÊTRE « BASE DE DONNÉES » — NATIVE (Configuration, palier 5)
 * =============================================================================
 * Synchronisation Turso + stockage R2 : pousser la config vers Turso, restaurer
 * depuis Turso, tester la connexion, migrer les images base64 vers R2, et voir
 * l'occupation (Turso / Cloudflare R2). Aucun secret exposé — le jeton Turso vit
 * côté serveur (variable d'environnement Render).
 *
 * ⚠ Les actions tournent dans la FENÊTRE PRINCIPALE (c'est là que vit TursoDB ; la
 * restauration y recharge la page). Le pont relaie ; cette fenêtre ne fait que
 * demander et afficher le résultat.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
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
/* ⚠ ANCRÉE = PLEINE PAGE : les cartes se répartissent en colonnes pour remplir la
   largeur (pas de max-width qui laisse du vide à droite). Voir la règle mémoire. */
.zone{columns:32rem;column-gap:1.1rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:1rem 1.1rem;
  margin:0 0 1.1rem;break-inside:avoid;-webkit-column-break-inside:avoid}
.stitre{font-size:.86rem;font-weight:700;color:var(--tx-bleute);margin:0 0 .5rem}
.info{color:var(--tx2);font-size:.79rem;line-height:1.6;margin:0 0 .6rem}
.info b{color:var(--tx-bleute)}
.gestes{display:flex;gap:.5rem;flex-wrap:wrap;margin:0 0 .6rem}
.stock{display:flex;gap:1.5rem;flex-wrap:wrap}
.jauge{flex:1;min-width:15rem}
.jauge .lg{display:flex;align-items:baseline;gap:.4rem;font-size:.8rem;margin-bottom:.25rem}
.jauge .lg .em{filter:grayscale(1) brightness(1.6)}
.jauge .lg .v{margin-left:auto;color:var(--tx2);font-size:.74rem}
.jauge .barre{height:.55rem;background:var(--f-champ);border:1px solid var(--v12);border-radius:99px;overflow:hidden}
.jauge .barre i{display:block;height:100%;background:#c9a97e}
.jauge .sous{font-size:.7rem;color:var(--tx3);margin-top:.2rem}
.cles{display:flex;flex-wrap:wrap;gap:.3rem}
.cles code{font-size:.66rem;background:var(--f-champ);border:1px solid var(--v12);border-radius:4px;padding:.12rem .38rem;color:var(--tx2)}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.55rem 1.05rem;
  border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button.b{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);
  border-radius:8px;padding:.42rem .8rem;cursor:pointer;font-size:.8rem}
button.b:hover:not(:disabled){background:var(--v10)}
button.b:disabled{opacity:.5;cursor:default}
button.b.dgr{color:var(--tx-err2);border-color:rgba(248,113,113,.4)}
button.prim{font:inherit;background:#c9a97e;border:1px solid #c9a97e;color:#1a1208;font-weight:700;
  border-radius:8px;padding:.42rem .8rem;cursor:pointer;font-size:.8rem}
button.prim:hover:not(:disabled){background:#d8bd97}
button.prim:disabled{opacity:.5;cursor:default}
.vide{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;border:1px solid var(--v16);
  border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.mini:hover:not(:disabled){background:var(--v10)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageBd() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Base de données — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.nuage}</span><h1>Base de données</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
<div class="corps"><div class="zone" id="corps"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
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
  var D = null, RO = false, OCCUPE = false, STOCK = null, CONF = '';

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function octets(n){
    n = Number(n) || 0;
    if (n < 1024) return n + ' o';
    var u = ['Ko','Mo','Go','To'], i = -1;
    do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
    return (n < 10 ? n.toFixed(1) : Math.round(n)) + ' ' + u[i];
  }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:'Votre rôle est en lecture seule.',
    indisponible:"L'administration n'est pas encore chargée dans la fenêtre principale.",
    pont_indisponible:'La fenêtre principale ne répond pas.',
    delai:"La fenêtre principale n'a pas répondu à temps.",
    operation_inconnue:'Cette version de l’application ne connaît pas cette opération.',
    r2_indispo:'Le stockage R2 n’est pas disponible.',
    echec:"L'opération a échoué.",
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('Erreur inattendue ('+esc(m||'?')+').'))+(r&&r.detail?' ('+esc(r.detail)+')':''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }
  function occuper(o){ OCCUPE = o; var bs = corps.querySelectorAll('button[data-act]'); for (var i=0;i<bs.length;i++) bs[i].disabled = o || (RO && bs[i].getAttribute('data-act') !== 'tester'); }

  function jauge(em, titre, sous, bytes, limit){
    var pct = (limit > 0) ? Math.min(100, Math.round(bytes / limit * 100)) : 0;
    return '<div class="jauge"><div class="lg"><span class="em">' + em + '</span><strong>' + esc(titre) + '</strong>'
      + '<span class="v">' + octets(bytes) + (limit > 0 ? ' / ' + octets(limit) + ' (' + pct + '%)' : '') + '</span></div>'
      + '<div class="barre"><i style="width:' + pct + '%"></i></div>'
      + '<div class="sous">' + esc(sous) + '</div></div>';
  }
  function stockHtml(){
    if (STOCK === null) return '<div class="vide">Lecture de l’occupation…</div>';
    if (STOCK.erreur) return '<div class="vide">' + esc(STOCK.erreur) + '</div>';
    var h = '<div class="stock">';
    if (STOCK.turso && STOCK.turso.bytes != null) h += jauge('☁️', 'Turso (base de données)', 'Produits, commandes, clients, dépenses…', STOCK.turso.bytes, STOCK.turso.limit);
    if (STOCK.r2 && STOCK.r2.bytes != null) h += jauge('📦', 'Cloudflare R2 (fichiers)', 'Reçus, photos, logos, documents, sauvegardes…', STOCK.r2.bytes, STOCK.r2.limit);
    else h += '<div class="jauge"><div class="sous"><span class="ic">📦</span> Cloudflare R2 : en attente de connexion.</div></div>';
    return h + '</div>';
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    var dis = RO ? ' disabled' : '';
    var h = '<div class="carte"><div class="stitre"><span class="ic">☁</span>️ Turso Cloud DB</div>'
      + '<div class="info">Toute la configuration (thèmes, logos, clés API, navigation, profil…) est '
      + 'synchronisée vers Turso à <b>chaque sauvegarde</b>. Ces boutons servent à forcer une synchronisation, '
      + 'par exemple après avoir vidé le cache du navigateur.</div>'
      + '<div class="gestes">'
      + '<button class="prim" type="button" data-act="pousser"' + dis + '>↑ Pousser tout vers Turso</button>'
      + '<button class="b" type="button" data-act="restaurer"' + dis + '>' + (CONF === 'restaurer' ? 'Confirmer la restauration ?' : '↓ Restaurer depuis Turso') + '</button>'
      + '<button class="b" type="button" data-act="tester">Tester la connexion</button>'
      + '<button class="b" type="button" data-act="migrer"' + dis + '>' + (CONF === 'migrer' ? 'Confirmer la migration ?' : '↦ Migrer les images vers R2') + '</button>'
      + '</div>'
      + '<div class="info" style="margin:0"><b>Pousser</b> : envoie toutes les configs locales vers Turso. '
      + '<b>Restaurer</b> : recharge depuis Turso puis recharge la fenêtre principale (utile après un vidage de cache). '
      + '<b>Migrer</b> : déplace vers R2 les images encore stockées en base64 (à lancer une fois).</div></div>';
    h += '<div class="carte"><div class="stitre">Occupation du stockage</div>' + stockHtml() + '</div>';
    var cles = (D && D.cles) || [];
    h += '<div class="carte"><div class="stitre">Clés synchronisées (' + cles.length + ')</div>'
      + '<div class="cles">' + cles.map(function(k){ return '<code>' + esc(k) + '</code>'; }).join('') + '</div></div>';
    corps.innerHTML = h;
    brancher();
  }
  function brancher(){
    var bs = corps.querySelectorAll('button[data-act]');
    for (var i=0;i<bs.length;i++) bs[i].onclick = function(){ agir(this.getAttribute('data-act')); };
  }

  function agir(act){
    if (OCCUPE) return;
    if (act === 'tester') return tester();
    if (act === 'pousser') return pousser();
    // Restaurer et migrer : confirmation en deux temps (gestes lourds).
    if (act === 'restaurer' || act === 'migrer') {
      if (CONF !== act) { CONF = act; dessiner(); setTimeout(function(){ if (CONF === act) { CONF=''; dessiner(); } }, 5000); return; }
      CONF = '';
      return (act === 'restaurer') ? restaurer() : migrer();
    }
  }
  function tester(){
    dire('Test de la connexion…');
    appeler('config:bd:tester').then(function(r){ dire(r && r.ok ? 'Connexion Turso OK.' : ('Échec : ' + expliquer(r)), r && r.ok ? 'bon' : 'err'); });
  }
  function pousser(){
    occuper(true); dessiner(); dire('Synchronisation vers Turso…');
    appeler('config:bd:pousser').then(function(r){
      occuper(false); dessiner();
      if (r && r.ok) dire(r.pousse + ' clé(s) poussée(s)' + (r.retenu ? ' — ' + r.retenu + ' gérée(s) entrée par entrée par le serveur.' : '.'), 'bon');
      else dire('Échec : ' + expliquer(r), 'err');
    });
  }
  function restaurer(){
    occuper(true); dessiner(); dire('Restauration depuis Turso…');
    appeler('config:bd:restaurer').then(function(r){
      if (r && r.ok) dire('Restauré — la fenêtre principale se recharge…', 'bon');
      else { occuper(false); dessiner(); dire('Échec : ' + expliquer(r), 'err'); }
    });
  }
  function migrer(){
    occuper(true); dessiner(); dire('Migration des images vers R2… (peut durer)');
    appeler('config:bd:migrer').then(function(r){
      occuper(false); dessiner();
      if (r && r.ok) { dire('Migration terminée : ' + (r.migrated || 0) + ' image(s) déplacée(s)' + (r.errors ? ', ' + r.errors + ' erreur(s).' : '.'), r.errors ? 'att' : 'bon'); chargerStock(); }
      else dire('Échec : ' + expliquer(r), 'err');
    });
  }
  function chargerStock(){
    appeler('config:bd:stockage').then(function(r){
      STOCK = (r && r.ok) ? r : { erreur: 'Occupation indisponible pour le moment.' };
      dessiner();
    });
  }

  function charger(){
    dire('Lecture…');
    appeler('config:bd:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + expliquer(r) + '</div>'; dire(expliquer(r), 'err'); return; }
      D = r; RO = !r.peutModifier; dessiner(); dire('');
      chargerStock();
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageBd };
