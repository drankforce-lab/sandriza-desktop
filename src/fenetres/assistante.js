'use strict';
/*
 * « DEMANDE À TA BOUTIQUE » — L'ASSISTANTE D'EXPLOITATION, fenêtre native (2026-11-22, grand chantier)
 * =============================================================================
 * Une question en mots simples ; la réponse chiffrée (assets/js/assistante.js, par le relais ia-texte-proxy.php)
 * et jusqu'à deux écrans à ouvrir. LECTURE SEULE : la fenêtre n'a aucun geste d'écriture.
 *
 *   assistante:demander (question, historique) → { ok, reponse, liens:[{cle, libelle}], cout }
 *   assistante:ouvrir (cle)                    → { ok }   (liste blanche côté site)
 *
 * ⚠ La conversation ne vit que dans la fenêtre (rien n'est enregistré) ; les trois derniers échanges repartent
 *   avec la question suivante, pour les questions de suite (« et le mois dernier ? »).
 * ⚠ AUCUN CARACTÈRE accent grave dans la portion de script.
 */
const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
const T = require('../langue').tr('assistante');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.tete .as-sous{font-size:.76rem;color:var(--tx2)}
button,textarea{font:inherit;color:var(--tx)}
button{background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.32rem .6rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
#corps{flex:1 1 auto;min-height:0;overflow:hidden;padding:.9rem 1.1rem;display:flex;flex-direction:column;gap:.6rem}
.fil{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;justify-content:flex-end;gap:.6rem;overflow:hidden}
.bulle{max-width:82%;padding:.6rem .85rem;border-radius:14px;font-size:.88rem;line-height:1.55;white-space:pre-wrap}
.bulle.moi{align-self:flex-end;background:rgba(var(--or-rgb),.16);border-bottom-right-radius:4px}
.bulle.ia{align-self:flex-start;background:var(--f-carte);border:1px solid var(--v08);border-bottom-left-radius:4px}
.bulle.err{align-self:flex-start;background:rgba(240,138,138,.12);color:var(--tx-err2);border:1px solid rgba(240,138,138,.3)}
html.jour .bulle.err{color:#a3302b}
.bulle .liens{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.5rem}
.bulle .liens button{font-size:.78rem;padding:.25rem .6rem}
.bulle .cout{display:block;margin-top:.35rem;font-size:.7rem;color:var(--tx2)}
.accueil{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8rem;text-align:center;min-height:0}
.accueil h2{margin:0;font-size:1.15rem}
.accueil p{margin:0;font-size:.85rem;color:var(--tx2);max-width:34rem}
.idees{display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center;max-width:44rem}
.idees button{font-size:.8rem;border-radius:99px;padding:.35rem .8rem}
.saisie{flex:0 0 auto;display:flex;gap:.5rem;align-items:flex-end;background:var(--f-carte);border:1px solid var(--v12);border-radius:14px;padding:.5rem .55rem .5rem .8rem}
.saisie textarea{flex:1 1 auto;min-width:0;background:transparent;border:0;resize:none;outline:none;font-size:.9rem;line-height:1.45;max-height:6.5rem;min-height:2rem}
.saisie:focus-within{border-color:var(--or)}
/* Le champ n a pas son propre cadre : c est la bande de saisie qui le porte (le look Épuré en posait un second). */
.saisie textarea,.saisie textarea:focus,.saisie textarea:hover{border:0!important;box-shadow:none!important;background:transparent!important;padding:.3rem 0!important;min-height:2rem!important}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.75rem;color:var(--tx2)}
.msg.err{color:var(--tx-err)}
/* (2026-11-22, sa demande : « un bouton pour vider et exporter la conversation, et pour imprimer aussi ») */
.as-gestes{display:flex;gap:.3rem;margin-left:auto}
.as-gestes button{height:1.9rem;padding:0 .7rem;border-radius:8px;border:0;background:transparent;color:var(--tx2);font:inherit;font-size:.78rem;font-weight:600;cursor:pointer}
.as-gestes button:hover:not(:disabled){background:var(--v06);color:var(--tx)}
.as-gestes button:disabled{opacity:.4;cursor:default}
#as-impr{display:none}
@media print{body>*:not(#as-impr){display:none!important}#as-impr{display:block!important;color:#000;font:12pt/1.45 system-ui,sans-serif}
  #as-impr h1{font-size:16pt;margin:0 0 .3rem}#as-impr .d{color:#555;margin-bottom:1rem}#as-impr .q{font-weight:700;margin:.9rem 0 .2rem}#as-impr .r{white-space:pre-wrap}}
`;

function pageAssistante() {
  return `${TETE()}
<title>${T("Demande à ta boutique — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.assistante}</span><h1>${T("Demande à ta boutique")}</h1><span class="as-sous">${T("lecture seule · réponses tirées de vos données")}</span>
  <span class="as-gestes"><button type="button" id="as-vider">${T("Vider")}</button><button type="button" id="as-exporter">${T("Exporter")}</button><button type="button" id="as-imprimer">${T("Imprimer")}</button></span></div>
<div id="as-impr"></div>
<div id="corps"><div class="fil" id="fil"></div>
  <div class="saisie"><textarea id="q" rows="1" maxlength="500" placeholder="${T("Posez une question sur vos ventes, votre stock, vos clients…")}" aria-label="${T("Votre question")}"></textarea>
  <button type="button" class="prim" id="envoyer">${T("Demander")}</button></div></div>
<div class="pied"><span class="msg" id="msg">${T("Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne. Chaque question coûte quelques sous, sous le plafond mensuel de l’IA.")}</span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var fil = document.getElementById('fil'), q = document.getElementById('q'), btn = document.getElementById('envoyer');
  var HIST = [], ECH = [], OCCUPE = false;
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas d’interroger l’assistante.")}',
    indisponible:       '${T("L’assistante n’est pas chargée dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    cle_absente:        '${T("La clé de l’IA n’est pas configurée : Configuration › Sécurité › Clé et plafond de dépense IA.")}',
    budget:             '${T("Le plafond mensuel de dépense IA est atteint. Il se relève dans Configuration › Sécurité › Clé et plafond de dépense IA.")}',
    injoignable:        '${T("Le service d’IA est injoignable. Vérifiez la connexion, puis réessayez.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("L’assistante a mis trop de temps à répondre. Réessayez.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:              '${T("L’assistante n’a pas pu répondre.")}'
  };
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || MOTIFS.echec; }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(){ return { ok: false, motif: 'echec' }; });
  }
  var IDEES = [
    '${T("Combien ai-je vendu cette semaine, comparé à la semaine dernière ?")}',
    '${T("Quelles robes se vendent le mieux en taille M ce mois-ci ?")}',
    '${T("Quels produits risquent d’être en rupture bientôt ?")}',
    '${T("Quelles pièces ne se vendent plus depuis longtemps ?")}',
    '${T("Combien de commandes attendent d’être préparées ?")}'
  ];
  /* ⚠ AUCUNE GLISSIÈRE : le fil garde les échanges qui TIENNENT dans la fenêtre — les plus anciens sortent par le haut. */
  function dessiner(){
    if (!fil) return;
    if (!ECH.length) {
      fil.innerHTML = '<div class="accueil"><h2>${T("Que voulez-vous savoir ?")}</h2><p>${T("L’assistante lit vos ventes, votre stock, vos commandes et vos promotions, et répond avec des chiffres. Elle ne modifie rien, et aucune donnée personnelle de vos clients ne lui est envoyée.")}</p>'
        + '<div class="idees">' + IDEES.map(function(t){ return '<button type="button" data-idee="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div></div>';
      return;
    }
    fil.innerHTML = ECH.map(function(e){
      if (e.qui === 'moi') return '<div class="bulle moi">' + esc(e.texte) + '</div>';
      if (e.qui === 'err') return '<div class="bulle err">' + esc(e.texte) + '</div>';
      if (e.qui === 'att') return '<div class="bulle ia">${T("Je regarde vos données…")}</div>';
      return '<div class="bulle ia">' + esc(e.texte)
        + (e.liens && e.liens.length ? '<div class="liens">' + e.liens.map(function(l){ return '<button type="button" data-ouvre="' + esc(l.cle) + '">' + esc(l.libelle) + ' →</button>'; }).join('') + '</div>' : '')
        + (e.cout ? '<span class="cout">' + '${T("coût : {0}")}'.split('{0}').join(esc(szArgent(e.cout))) + '</span>' : '') + '</div>';
    }).join('');
    // Ce qui ne tient pas sort par le haut (jamais de glissière).
    var b = fil.children;
    while (b && fil.scrollHeight > fil.clientHeight + 1 && b.length > 1) fil.removeChild(b[0]);
  }
  /* LA CONVERSATION ENTIÈRE (le fil n'en montre que ce qui tient) : texte brut pour l'export, page pour l'impression. */
  function textes(){
    return ECH.filter(function(e){ return e.qui === 'moi' || e.qui === 'ia'; });
  }
  function majGestes(){
    var n = textes().length;
    ['as-vider', 'as-exporter', 'as-imprimer'].forEach(function(id){ var b = document.getElementById(id); if (b) b.disabled = !n; });
  }
  function exporter(){
    var L = textes(); if (!L.length) return;
    var d = new Date().toLocaleString('${LIEU()}');
    // ⚠ La page est un gabarit : la barre oblique est DOUBLÉE ici pour arriver simple dans la page.
    var t = '${T("Demande à ta boutique")} — ' + d + '\\n\\n' + L.map(function(e){
      return (e.qui === 'moi' ? '${T("Question")} : ' : '${T("Réponse")} : ') + e.texte; }).join('\\n\\n') + '\\n';
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\\ufeff' + t], { type: 'text/plain;charset=utf-8' }));
    a.download = 'demande-a-ta-boutique-' + new Date().toISOString().slice(0, 10) + '.txt';
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    szDire('${T("Conversation exportée.")}', 'bon');
  }
  function imprimer(){
    var L = textes(); if (!L.length) return;
    var z = document.getElementById('as-impr'); if (!z) return;
    z.innerHTML = '<h1>${T("Demande à ta boutique")}</h1><div class="d">' + esc(new Date().toLocaleString('${LIEU()}')) + '</div>'
      + L.map(function(e){ return e.qui === 'moi' ? '<div class="q">' + esc(e.texte) + '</div>' : '<div class="r">' + esc(e.texte) + '</div>'; }).join('');
    window.print();
  }
  function vider(){
    if (!textes().length) return;
    szConfirmer({ titre: '${T("Vider la conversation")}', texte: '${T("Les questions et réponses affichées seront effacées. Rien n’est enregistré ailleurs.")}', oui: '${T("Vider")}' })
      .then(function(ok){ if (!ok) return; ECH = []; HIST = []; dessiner(); majGestes(); if (q) q.focus(); });
  }
  function envoyer(texte){
    var t = String(texte || (q && q.value) || '').trim();
    if (!t || OCCUPE) return;
    OCCUPE = true; if (btn) btn.disabled = true; if (q) q.value = '';
    ECH.push({ qui: 'moi', texte: t }); ECH.push({ qui: 'att' }); dessiner();
    appeler('assistante:demander', [t, HIST]).then(function(r){
      OCCUPE = false; if (btn) btn.disabled = false; ECH.pop();
      if (!r || !r.ok) { ECH.push({ qui: 'err', texte: expliquer(r) }); dessiner(); if (q) q.focus(); return; }
      ECH.push({ qui: 'ia', texte: r.reponse, liens: r.liens || [], cout: r.cout || 0 });
      HIST.push({ q: t, r: r.reponse }); if (HIST.length > 3) HIST.shift();
      dessiner(); majGestes(); if (q) q.focus();
    });
  }
  if (btn) btn.addEventListener('click', function(){ envoyer(); });
  (function(){ var v = document.getElementById('as-vider'), x = document.getElementById('as-exporter'), i = document.getElementById('as-imprimer');
    if (v) v.onclick = vider; if (x) x.onclick = exporter; if (i) i.onclick = imprimer; })();
  if (q) q.addEventListener('keydown', function(ev){
    if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); envoyer(); }
  });
  document.addEventListener('click', function(ev){
    var t = ev.target && ev.target.closest ? ev.target.closest('button') : null; if (!t) return;
    var idee = t.getAttribute('data-idee'); if (idee) { envoyer(idee); return; }
    var o = t.getAttribute('data-ouvre');
    if (o) appeler('assistante:ouvrir', [o]).then(function(r){ if (!r || !r.ok) szDire('${T("Cet écran n’a pas pu s’ouvrir.")}', 'err'); });
  });
  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape') return;
    if (document.querySelector('.szc-voile')) return;
    ev.preventDefault(); if (P && P.fermer) P.fermer();
  });
  try { if (window.ResizeObserver) new ResizeObserver(function(){ dessiner(); }).observe(fil); } catch (e) {}
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id = 'sz-detacher'; b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:auto;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;flex:0 0 auto');
      t.appendChild(b); }
    if (actif) { b.textContent = '${T("⧉ Détacher")}'; b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}'; b.onclick = function(){ if (P && P.detacher) P.detacher(); }; }
    else { b.textContent = '${T("⚓ Ancrer")}'; b.title = '${T("Ramener cet écran dans la fenêtre principale")}'; b.onclick = function(){ if (P && P.ancrer) P.ancrer(); }; }
  };
  dessiner(); majGestes(); if (q) q.focus();
})();
</script></body></html>`;
}

module.exports = { pageAssistante };
