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

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('bd');

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
/* ⚠ PAS << .info >> : le socle peint ce nom en panneau BLEU en mode jour (2026-09-29). */
.expl{color:var(--tx2);font-size:.79rem;line-height:1.6;margin:0 0 .6rem}
.expl b{color:var(--tx-bleute)}
/* ⚠ UNE GRILLE 2 x 2, VOULUE (2026-09-25). Les quatre gestes debordaient de la
   demi-carte et le quatrieme tombait seul a la ligne. Sa regle : << sur une
   ligne, ou propose-moi quelque chose sans perdre le contenu >>. Quatre libelles
   longs ne tiennent pas sur une ligne dans une demi-carte : deux rangees EGALES,
   de meme largeur, se lisent comme une disposition, pas comme un debordement. */
.gestes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem;margin:0 0 .6rem}
.gestes > *{width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stock{display:flex;gap:1.5rem;flex-wrap:wrap}
.jauge{flex:1;min-width:15rem}
.jauge .lg{display:flex;align-items:baseline;gap:.4rem;font-size:.8rem;margin-bottom:.25rem}
.jauge .lg .em{filter:grayscale(1) brightness(1.6)}
.jauge .lg .v{margin-left:auto;color:var(--tx2);font-size:.74rem}
.jauge .barre{height:.55rem;background:var(--f-champ);border:1px solid var(--v12);border-radius:99px;overflow:hidden}
.jauge .barre i{display:block;height:100%;background:var(--or)}
.jauge .sous{font-size:.7rem;color:var(--tx3);margin-top:.2rem}
/* (2026-11-24) Le titre sur sa ligne, le chiffre dessous : « Turso (base de données) » ne se casse plus en deux. */
.jauge .lg{flex-wrap:wrap}
.jauge .lg strong{flex:1 1 100%}
.jauge .lg .v{margin-left:0}
.jauge .barre i{min-width:3px}
.r2d{margin-top:.9rem;border-top:1px solid var(--v08);padding-top:.7rem}
.r2d .t{font-size:.76rem;font-weight:700;color:var(--tx-bleute);margin:0 0 .45rem}
.r2d .l{display:grid;grid-template-columns:minmax(0,1fr) 7rem 4.2rem;gap:.15rem .7rem;align-items:center;font-size:.76rem}
.r2d .n{color:var(--tx);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.r2d .n small{color:var(--tx3);margin-left:.35rem}
.r2d .b{height:.4rem;background:var(--f-champ);border:1px solid var(--v12);border-radius:99px;overflow:hidden}
.r2d .b i{display:block;height:100%;background:var(--or);min-width:2px}
.r2d .o{color:var(--tx2);text-align:right;font-variant-numeric:tabular-nums}
.cles{display:flex;flex-wrap:wrap;gap:.3rem}
.cles code{font-size:.6875rem;background:var(--f-champ);border:1px solid var(--v12);border-radius:4px;padding:.12rem .38rem;color:var(--tx2)}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.55rem 1.05rem;
  border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button.b{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);
  border-radius:8px;padding:.42rem .8rem;cursor:pointer;font-size:.8rem}
button.b:hover:not(:disabled){background:var(--v10)}
button.b:disabled{opacity:.5;cursor:default}
button.b.dgr{color:var(--tx-err2);border-color:rgba(248,113,113,.4)}
button.prim{font:inherit;background:var(--or);border:1px solid var(--or);color:#1a1208;font-weight:700;
  border-radius:8px;padding:.42rem .8rem;cursor:pointer;font-size:.8rem}
button.prim:hover:not(:disabled){background:var(--or-clair)}
button.prim:disabled{opacity:.5;cursor:default}
.vide{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;border:1px solid var(--v16);
  border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.mini:hover:not(:disabled){background:var(--v10)}
/* La boutique de test — sa porte (2026-11-24) */
.bt-moi{display:flex;flex-wrap:wrap;gap:.4rem .9rem;align-items:center;font-size:.8rem;margin:0 0 .6rem}
.bt-moi code{font-size:.78rem;background:var(--f-champ);border:1px solid var(--v12);border-radius:5px;padding:.1rem .4rem;color:var(--tx)}
.bt-ch{display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;color:var(--tx2);margin:0 0 .6rem}
.bt-ch textarea,.bt-ch input{font:inherit;font-size:.82rem;color:var(--tx);background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;padding:.45rem .6rem;width:100%}
.bt-ch textarea{min-height:5.2rem;resize:vertical;font-family:ui-monospace,Consolas,monospace}
.bt-etat{font-size:.76rem;color:var(--tx2);margin:.2rem 0 .6rem}
.bt-etat .ok{color:var(--tx-ok)}.bt-etat .non{color:var(--tx-err)}
.bt-jr{max-height:13rem;overflow-y:auto;background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;padding:.45rem .6rem;font-size:.74rem;line-height:1.55}
.bt-jr div{color:var(--tx2)}.bt-jr .ok{color:var(--tx-ok)}.bt-jr .err{color:var(--tx-err)}.bt-jr .att{color:var(--tx-jaune)}
.bt-jr time{color:var(--tx3);margin-right:.4rem;font-variant-numeric:tabular-nums}
.bt-prog{height:.5rem;background:var(--f-champ);border:1px solid var(--v12);border-radius:99px;overflow:hidden;margin:0 0 .5rem}
.bt-prog i{display:block;height:100%;background:var(--or);transition:width .3s}
.bt-etat .att{color:var(--tx-jaune)}
.sy-res{font-size:.8rem;margin:0 0 .6rem}.sy-res .ok{color:var(--tx-ok)}.sy-res .non{color:var(--tx-err);font-weight:700}
.sy-av{font-size:.76rem;color:var(--tx-jaune);margin:0 0 .6rem}
.sy-liste{display:flex;flex-direction:column;gap:.5rem;max-height:26rem;overflow-y:auto;margin:0 0 .7rem;padding-right:.2rem}
.sy-el{border:1px solid var(--v12);border-left:3px solid var(--v12);border-radius:8px;padding:.5rem .65rem;background:var(--f-champ)}
.sy-el.sy-test,.sy-el.sy-mixte{border-left-color:var(--tx-ok)}.sy-el.sy-conflit{border-left-color:var(--tx-err)}.sy-el.sy-prod{border-left-color:var(--tx3)}
.sy-t{display:flex;flex-wrap:wrap;align-items:baseline;gap:.2rem .5rem;font-size:.82rem}
.sy-t small{color:var(--tx3)}
.sy-b{font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:.05rem .4rem;border-radius:99px;border:1px solid currentColor}
.sy-test .sy-b,.sy-mixte .sy-b{color:var(--tx-ok)}.sy-conflit .sy-b{color:var(--tx-err)}.sy-prod .sy-b{color:var(--tx3)}
.sy-cs{margin:.35rem 0}
.sy-c{display:grid;grid-template-columns:8rem minmax(0,1fr) minmax(0,1fr);gap:.1rem .6rem;font-size:.72rem;padding:.12rem 0;border-top:1px dashed var(--v08)}
.sy-c .n{color:var(--tx2);font-weight:600}.sy-c.sy-conflit .n{color:var(--tx-err)}
.sy-c .v{color:var(--tx2);overflow-wrap:anywhere}.sy-c .v b{color:var(--tx3);font-weight:600}
.sy-ch{font-size:.76rem;color:var(--tx2);display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
.sy-ch select,.vr-urg select,.vr-urg input{background:var(--f-page);color:var(--tx);border:1px solid var(--v12);border-radius:6px;padding:.25rem .4rem;font:inherit;font-size:.78rem}
.sy-hi{display:flex;flex-direction:column;gap:.25rem;font-size:.76rem}
.sy-hi div{display:flex;align-items:center;gap:.6rem}.sy-hi time{color:var(--tx3);font-variant-numeric:tabular-nums;min-width:8.5rem}
.sy-hi span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sy-hi small{color:var(--tx3)}
.sy-hi button{flex:none;width:auto;min-height:1.8rem;padding:.2rem .8rem;font-size:.74rem}
.vr-urg{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.5rem}.vr-urg input{flex:1 1 14rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageBd() {
  return `${TETE()}
<title>${T("Base de données — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.nuage}</span><h1>${T("Base de données")}</h1></div>
<div class="ro" id="ro" hidden>${T("Lecture seule : vous pouvez consulter, pas modifier.")}</div>
<div class="corps"><div class="zone" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; t.appendChild(b); }
    if (actif) { b.textContent='${T("⧉ Détacher")}'; b.title='${T("Ouvrir cet écran dans sa propre fenêtre")}'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='${T("⚓ Ancrer")}'; b.title='${T("Ramener cet écran dans la fenêtre principale")}'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var D = null, RO = false, OCCUPE = false, STOCK = null, CONF = '', BT = null, JR = [], JR_ID = 0, CP = null, SY = null, HI = null;

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  /* ⚠ Ko, Mo, Go sont FRANCAIS — l anglais ecrit KB, MB, GB. La recette unique
     est szOctets, posee par le socle dans les 99 fenetres. */
  function octets(n){ return szOctets(n); }

  var MOTIFS = {
  maj_en_cours: '${T("Une mise à jour s’installe : cette opération est suspendue jusqu’au redémarrage de l’application.")}',
    session:'${T("Aucune session ouverte. Connectez-vous dans la fenêtre principale.")}',
    droit:'${T("Votre rôle ne donne pas accès à la configuration.")}',
    lecture_seule:'${T("Votre rôle est en lecture seule.")}',
    indisponible:"${T('L\'administration n\'est pas encore chargée dans la fenêtre principale.')}",
    pont_indisponible:'${T("La fenêtre principale ne répond pas.")}',
    delai:"${T('La fenêtre principale n\'a pas répondu à temps.')}",
    operation_inconnue:'${T("Cette version de l’application ne connaît pas cette opération.")}',
    r2_indispo:'${T("Le stockage R2 n’est pas disponible.")}',
    echec:"${T('L\'opération a échoué.')}",
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('${T("Erreur inattendue (")}'+esc(m||'?')+').'))+(r&&r.detail?' ('+esc(r.detail)+')':''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }
  function occuper(o){ OCCUPE = o; var bs = corps.querySelectorAll('button[data-act]'); for (var i=0;i<bs.length;i++) bs[i].disabled = o || (RO && bs[i].getAttribute('data-act') !== 'tester'); }

  function jauge(titre, sous, bytes, limit){
    var pct = (limit > 0) ? Math.min(100, Math.round(bytes / limit * 100)) : 0;
    return '<div class="jauge"><div class="lg"><strong>' + esc(titre) + '</strong>'
      + '<span class="v">' + octets(bytes) + (limit > 0 ? ' / ' + octets(limit) + ' (' + pct + '%)' : '') + '</span></div>'
      + '<div class="barre"><i style="width:' + pct + '%"></i></div>'
      + '<div class="sous">' + esc(sous) + '</div></div>';
  }
  var R2NOMS = { 'sauvegardes-nuit': '${T("Sauvegardes de nuit (chiffrées)")}', products: '${T("Photos des produits")}', produits: '${T("Photos des produits")}',
    vignettes: '${T("Vignettes (miniatures)")}', cabine: '${T("Cabine d’essayage")}', videos: '${T("Vidéos")}', receipts: '${T("Reçus")}',
    'rh-coffre': '${T("Talons de paie (RH, chiffrés)")}', corbeille: '${T("Corbeille")}', tnb: '${T("Photos détourées")}', '(racine)': '${T("Hors dossier")}' };
  function stockHtml(){
    if (STOCK === null) return '<div class="vide charge">${T("Lecture de l’occupation…")}</div>';
    if (STOCK.erreur) return '<div class="vide">' + esc(STOCK.erreur) + '</div>';
    var h = '<div class="stock">';
    if (STOCK.turso && STOCK.turso.bytes != null) h += jauge('${T("Turso (base de données)")}', '${T("Produits, commandes, clients, dépenses…")}', STOCK.turso.bytes, STOCK.turso.limit);
    // (audit H2-m18) une liste R2 interrompue donne un MINIMUM : on le dit plutôt que d'afficher un chiffre faux
    if (STOCK.r2 && STOCK.r2.bytes != null) h += jauge('${T("Cloudflare R2 (fichiers)")}', '${T("Reçus, photos, logos, documents, sauvegardes…")}' + (STOCK.r2.complet === false ? ' ${T("— au moins : l’inventaire s’est arrêté avant la fin.")}' : ''), STOCK.r2.bytes, STOCK.r2.limit);
    else h += '<div class="jauge"><div class="sous"><span class="ic">📦</span>${T(" Cloudflare R2 : en attente de connexion.")}</div></div>';
    h += '</div>';
    /* (2026-11-24, sa question : « 1,2 Go, ça se compose de quoi ? ») Le détail par dossier, du plus lourd au plus léger. */
    var ds = (STOCK.r2 && STOCK.r2.dossiers) || [];
    if (ds.length) {
      var max = ds[0].bytes || 1;
      h += '<div class="r2d"><div class="t">${T("Ce qui occupe Cloudflare R2")}</div><div class="l">' + ds.map(function(d){
        return '<span class="n" title="' + esc(d.nom) + '/">' + esc(R2NOMS[d.nom] || d.nom) + '<small>' + d.n + ' ' + szPl(d.n, '${T("fichier")}', '${T("fichiers")}') + '</small></span>'
          + '<span class="b"><i style="width:' + Math.max(1, Math.round(d.bytes / max * 100)) + '%"></i></span><span class="o">' + octets(d.bytes) + '</span>';
      }).join('') + '</div></div>';
    }
    return h;
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    var dis = RO ? ' disabled' : '';
    var h = '<div class="carte"><div class="stitre"><span class="ic">☁</span>${T(" Turso Cloud DB")}</div>'
      + '<div class="expl">${T("Toute la configuration (thèmes, logos, clés API, navigation, profil…) est ")}'
      + '${T("synchronisée vers Turso à <b>chaque sauvegarde</b>. Ces boutons servent à forcer une synchronisation, ")}'
      + '${T("par exemple après avoir vidé le cache du navigateur.")}</div>'
      + '<div class="gestes">'
      + '<button class="prim" type="button" data-act="pousser"' + dis + '>${T("↑ Pousser tout vers Turso")}</button>'
      + '<button class="b" type="button" data-act="restaurer"' + dis + '>${T("↓ Restaurer depuis Turso")}</button>'
      + '<button class="b" type="button" data-act="tester">${T("Tester la connexion")}</button>'
      + '<button class="b" type="button" data-act="migrer"' + dis + '>${T("↦ Migrer les images vers R2")}</button>'
      + '</div>'
      + '<div class="expl" style="margin:0">${T("<b>Pousser</b> : envoie toutes les configs locales vers Turso. ")}'
      + '${T("<b>Restaurer</b> : recharge depuis Turso puis recharge la fenêtre principale (utile après un vidage de cache). ")}'
      + '${T("<b>Migrer</b> : déplace vers R2 les images encore stockées en base64 (à lancer une fois).")}</div></div>';
    h += btHtml();
    h += '<div class="carte"><div class="stitre">${T("Occupation du stockage")}</div>' + stockHtml() + '</div>';
    var cles = (D && D.cles) || [];
    h += '<div class="carte"><div class="stitre">${T("Clés synchronisées (")}' + cles.length + ')</div>'
      + '<div class="cles">' + cles.map(function(k){ return '<code>' + esc(k) + '</code>'; }).join('') + '</div></div>';
    corps.innerHTML = h;
    brancher();
    /* (2026-10-25, audit) Les boutons recrees ne prenaient que RO : pendant une migration de plusieurs
       minutes, ils paraissaient actifs. occuper() les redesactive. */
    if (OCCUPE) occuper(true);
  }
  function brancher(){
    var bs = corps.querySelectorAll('button[data-act]');
    for (var i=0;i<bs.length;i++) bs[i].onclick = function(){ agir(this.getAttribute('data-act')); };
    var b1 = document.getElementById('bt-moi'); if (b1) b1.onclick = btAjouterMoi;
    var b2 = document.getElementById('bt-ok'); if (b2) b2.onclick = btEnregistrer;
    var b3 = document.getElementById('bt-copier'); if (b3) b3.onclick = btCopier;
    if (BT && BT.ok) { syBrancher(); vrBrancher(); }
  }
  /* LA BOUTIQUE DE TEST — SA PORTE (2026-11-24). Seules ces IP (et ces pays, si on en met) ouvrent test.sandriza.com.
     Liste vide = personne. Super-administrateur seulement (le serveur le vérifie). */
  function btHtml(){
    var h = '<div class="carte"><div class="stitre">${T("Boutique de test — accès")}</div>'
      + '<div class="expl">${T("Seules les adresses IP de cette liste ouvrent <b>test.sandriza.com</b>. Une liste vide ferme le test à tout le monde. Les pays, s’il y en a, s’ajoutent comme seconde condition.")}</div>';
    if (!BT) return h + '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div></div>';
    if (!BT.ok) return h + '<div class="vide">' + (BT.motif === 'droit' ? '${T("Réservé aux super-administrateurs.")}' : expliquer(BT)) + '</div></div>';
    var a = BT.acces || { ips: [], pays: [] }, moi = BT.moi || {};
    h += '<div class="bt-moi">${T("Votre adresse :")} <code>' + esc(moi.ip || '?') + '</code> ${T("pays :")} <code>' + esc(moi.pays || '?') + '</code>'
      + '<button class="b" type="button" id="bt-moi">${T("Ajouter mon adresse")}</button></div>'
      + '<label class="bt-ch">${T("Adresses IP autorisées (une par ligne ; un bloc comme 203.0.113.0/24 est accepté)")}'
      + '<textarea id="bt-ips" spellcheck="false" aria-label="${T("Adresses IP autorisées")}">' + esc((a.ips || []).join('\\n')) + '</textarea></label>'
      + '<label class="bt-ch">${T("Pays autorisés (codes à deux lettres, séparés par des virgules ; vide = tous)")}'
      + '<input id="bt-pays" spellcheck="false" aria-label="${T("Pays autorisés")}" value="' + esc((a.pays || []).join(', ')) + '"></label>'
      + '<label class="bt-ch">${T("Courriels du test envoyés à (tous, quel que soit le destinataire ; vide = aucun courriel)")}'
      + '<input id="bt-courriel" type="email" spellcheck="false" aria-label="${T("Adresse de redirection des courriels du test")}" value="' + esc(a.courriel || '') + '"></label>'
      + '<div class="expl" style="margin:.2rem 0 .5rem">${T("Les textos ne partent jamais du test : il n’a pas la configuration de Twilio.")}</div>'
      + '<div class="bt-etat">' + (BT.jeton ? '<span class="ok">${T("✓ Base de test branchée")}</span>' : '<span class="non">${T("✗ Jeton de la base de test absent du serveur (TESTBD_SANDRIZA)")}</span>')
      + (BT.durci ? '' : ' · ${T("Conseil : poser SZ_CF_SECRET durcit cette porte.")}') + '</div>'
      + '<div class="gestes"><button class="prim" type="button" id="bt-ok">${T("Enregistrer l’accès")}</button></div></div>';
    /* LA COPIE PRODUCTION → TEST (lot 3) : son bouton, sa progression, son journal en direct. */
    h += '<div class="carte"><div class="stitre">${T("Boutique de test — copie depuis la production")}</div>'
      + '<div class="expl">${T("Remplace le contenu du test par celui de la production : catalogue et réglages tels quels, <b>clients brouillés</b> (noms, courriels, téléphones, adresses). Les <b>finances et le RH ne sont jamais copiés</b> ; Square passe en bac à sable.")}</div>'
      + (BT.derniere ? '<div class="bt-etat">${T("Dernière copie :")} ' + esc(String(BT.derniere.le || '').replace('T', ' ').slice(0, 16)) + ' UTC</div>' : '')
      + (CP ? '<div class="bt-prog" role="progressbar" aria-label="${T("Progression de la copie")}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + CP.pct + '"><i style="width:' + CP.pct + '%"></i></div>' : '')
      + '<div class="gestes"><button class="b" type="button" id="bt-copier"' + (CP ? ' disabled' : '') + '>${T("Copier la production vers le test")}</button></div></div>';
    h += syHtml() + vrHtml();
    h += '<div class="carte"><div class="stitre">${T("Journal de la boutique de test")}</div>'
      + '<div class="bt-jr" id="bt-jr" role="log" aria-label="${T("Journal de la boutique de test")}">' + (JR.length ? JR.map(jrLigne).join('') : '<div>${T("Le journal est vide.")}</div>') + '</div></div>';
    return h;
  }
  /* LA SYNCHRONISATION TEST → PRODUCTION (lot 4, 2026-11-24). SA DEMANDE : un résumé des changements faits en test,
     un journal pendant la réplication, des indications et des options en cas de conflit. Le serveur compare à
     TROIS voies (test, production, référence de la dernière copie) ; cette fenêtre montre et fait choisir. */
  var CHN = { name: '${T("Nom")}', price: '${T("Prix")}', salePrice: '${T("Prix soldé")}', compareAtPrice: '${T("Prix barré")}', description: '${T("Description")}',
    images: '${T("Photos")}', image: '${T("Photo principale")}', category: '${T("Catégorie")}', sizes: '${T("Tailles")}', colors: '${T("Couleurs")}', tags: '${T("Étiquettes")}',
    sku: '${T("UGS")}', active: '${T("Active")}', visible: '${T("Visible")}', featured: '${T("En vedette")}', '(fiche)': '${T("Fiche entière")}', '(valeur)': '${T("Valeur")}' };
  var TYN = { ajout: '${T("Nouveau dans le test")}', suppression: '${T("Supprimé dans le test")}', ajout_prod: '${T("Créé en production seulement")}',
    suppression_prod: '${T("Supprimé en production seulement")}', modif: '${T("Modifié")}', creation_double: '${T("Créé des deux côtés sous le même numéro")}' };
  var SEN = { test: '${T("À envoyer")}', mixte: '${T("À envoyer")}', conflit: '${T("Conflit")}', prod: '${T("Changé en production")}' };
  function syCle(e){ return e.tbl + ':' + e.cle; }
  function syOptions(e){
    var o = [];
    var entier = /^(ajout|suppression|ajout_prod|suppression_prod)$/.test(e.type);
    if (e.sens === 'conflit') {
      o.push(['', '${T("— Choisir —")}']);
      o.push(['test', '${T("Le test l’emporte")}']);
      if (!entier) o.push(['fusion', '${T("Fusionner : le reste part, la production garde ses valeurs en conflit")}']);
      o.push(['prod', '${T("La production l’emporte (le test est réaligné)")}']);
    } else if (e.sens === 'prod') {
      o.push(['prod', '${T("Reprendre dans le test")}']);
      if (entier) o.push(['test', '${T("Imposer la version du test en production")}']);
    } else {
      o.push(['test', e.type === 'suppression' ? '${T("Supprimer aussi en production")}' : '${T("Envoyer en production")}']);
      o.push(['prod', '${T("Abandonner ce changement (le test reprend la production)")}']);
    }
    o.push(['sauter', '${T("Plus tard")}']);
    return o;
  }
  function syDefaut(e){ return e.sens === 'conflit' ? '' : (e.sens === 'prod' ? 'prod' : 'test'); }
  function syVal(v){ return v == null ? '<i>${T("(absent)")}</i>' : esc(v); }
  function syElHtml(e, i){
    var k = syCle(e), ch = SY.choix[k] != null ? SY.choix[k] : syDefaut(e);
    var champs = (e.champs || []).slice(0, 12).map(function(c){
      var n = CHN[c.champ] || c.champ;
      return '<div class="sy-c sy-' + esc(c.sens) + '"><span class="n">' + esc(n) + (c.sens === 'conflit' ? ' <span class="ic">⚠</span>' : '') + '</span>'
        + '<span class="v"><b>${T("Production :")}</b> ' + syVal(c.prod) + '</span><span class="v"><b>${T("Test :")}</b> ' + syVal(c.test) + '</span></div>';
    }).join('') + ((e.champs || []).length > 12 ? '<div class="sy-c"><span class="n">+' + (e.champs.length - 12) + ' ${T("autres champs")}</span></div>' : '');
    return '<div class="sy-el sy-' + esc(e.sens) + '"><div class="sy-t"><span class="sy-b">' + esc(SEN[e.sens] || e.sens) + '</span>'
      + '<b>' + esc(e.titre || e.cle) + '</b><small>' + (e.tbl === 'products' ? '${T("Produit")}' : '${T("Réglage")}') + ' · ' + esc(TYN[e.type] || e.type) + '</small></div>'
      + (e.avert === 'ugs_double' ? '<div class="sy-av"><span class="ic">⚠</span> ${T("Cette UGS existe déjà en production sur un autre produit : l’envoi sera refusé tant qu’elle n’est pas changée dans le test.")}</div>' : '')
      + '<div class="sy-cs">' + champs + '</div>'
      + '<label class="sy-ch">${T("Que faire :")} <select data-sy="' + i + '" aria-label="${T("Que faire de cet élément")}">' + syOptions(e).map(function(o){
          return '<option value="' + o[0] + '"' + (o[0] === ch ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></label></div>';
  }
  function syAFaire(){ if (!SY || !SY.res) return []; return SY.res.elements.filter(function(e){ var c = SY.choix[syCle(e)] != null ? SY.choix[syCle(e)] : syDefaut(e); return c === 'test' || c === 'fusion' || c === 'prod'; }); }
  function syHtml(){
    var h = '<div class="carte"><div class="stitre">${T("Boutique de test — synchronisation vers la production")}</div>'
      + '<div class="expl">${T("Compare le test à la production, champ par champ, depuis la dernière copie. Seuls le <b>catalogue</b> et les <b>réglages de la boutique</b> partent — jamais les clients, les commandes, les finances ni le RH. Le <b>stock</b> reste celui de la production. Chaque envoi est sauvegardé et peut être annulé.")}</div>';
    if (SY && SY.res) {
      var n = SY.res.compte || {}, l = SY.res.elements || [];
      h += '<div class="sy-res">' + (l.length
        ? '<span class="ok">' + (n.test || 0) + ' ${T("à envoyer")}</span> · <span class="' + (n.conflit ? 'non' : '') + '">' + (n.conflit || 0) + ' ${T("conflit(s)")}</span> · <span>' + (n.prod || 0) + ' ${T("changé(s) en production seulement")}</span>'
        : '<span class="ok">${T("✓ Rien à synchroniser : le test et la production sont pareils.")}</span>') + '</div>';
      if (SY.res.reference_empreinte_seule) h += '<div class="sy-av">${T("La dernière copie date d’avant ce module : la comparaison est moins fine (tout écart touchant un produit vendu depuis passe pour un conflit). Une nouvelle copie la rendra exacte.")}</div>';
      if (SY.res.trop) h += '<div class="sy-av">${T("Plus de 400 éléments : seuls les 400 premiers sont montrés. Synchronisez-les, puis relancez l’analyse.")}</div>';
      if (l.length) h += '<div class="sy-liste">' + l.map(syElHtml).join('') + '</div>';
    } else if (SY && SY.err) h += '<div class="sy-av">' + SY.err + '</div>';
    if (SY && SY.pct != null) h += '<div class="bt-prog" id="sy-prog" role="progressbar" aria-label="${T("Progression de la synchronisation")}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + SY.pct + '"><i style="width:' + SY.pct + '%"></i></div>';
    var nb = syAFaire().length, occ = SY && (SY.lecture || SY.pct != null);
    h += '<div class="gestes"><button class="b" type="button" id="sy-analyser"' + (occ ? ' disabled' : '') + '>' + (SY && SY.res ? '${T("Relancer l’analyse")}' : '${T("Analyser les changements")}') + '</button>'
      + (SY && SY.res && SY.res.elements.length ? '<button class="prim" type="button" id="sy-envoyer"' + (occ || !nb ? ' disabled' : '') + '>${T("Appliquer les choix")} (' + nb + ')</button>' : '') + '</div>';
    if (HI && HI.length) {
      h += '<div class="r2d"><div class="t">${T("Derniers envois en production")}</div><div class="sy-hi">' + HI.map(function(x){
        var d = new Date(x.le * 1000);
        return '<div><time>' + d.toLocaleDateString() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + '</time><span>' + esc(x.titre || x.cle)
          + ' <small>' + (x.creation ? '${T("créé")}' : x.suppression ? '${T("supprimé")}' : '${T("modifié")}') + '</small></span>'
          + (x.annule ? '<small>${T("annulé")}</small>' : '<button class="b" type="button" data-annuler="' + x.id + '">${T("Annuler")}</button>') + '</div>';
      }).join('') + '</div></div>';
    }
    return h + '</div>';
  }
  function syBrancher(){
    var a = document.getElementById('sy-analyser'); if (a) a.onclick = syAnalyser;
    var e = document.getElementById('sy-envoyer'); if (e) e.onclick = syEnvoyer;
    var ss = corps.querySelectorAll('select[data-sy]');
    for (var i = 0; i < ss.length; i++) ss[i].onchange = function(){
      var el = SY.res.elements[+this.getAttribute('data-sy')]; SY.choix[syCle(el)] = this.value;
      var b = document.getElementById('sy-envoyer'), nb = syAFaire().length;
      if (b) { b.disabled = !nb; b.textContent = '${T("Appliquer les choix")} (' + nb + ')'; }
    };
    var hs = corps.querySelectorAll('button[data-annuler]');
    for (var j = 0; j < hs.length; j++) hs[j].onclick = function(){ syAnnuler(+this.getAttribute('data-annuler')); };
  }
  function syMotif(r){
    var m = r && r.motif;
    return m === 'jamais_copie' ? '${T("Aucune copie de référence : lancez d’abord « Copier la production vers le test ».")}'
      : m === 'change_depuis_analyse' ? '${T("Cet élément a changé depuis l’analyse : relancez-la.")}'
      : m === 'ugs_double' ? '${T("UGS déjà prise en production.")}'
      : m === 'modifie_depuis' ? '${T("L’élément a été modifié en production depuis cet envoi : l’annulation l’écraserait. Rien n’est fait.")}'
      : m === 'production_occupee' ? '${T("La production change sans arrêt (ventes en cours ?) : réessayez dans un instant.")}'
      : expliquer(r);
  }
  function syAnalyser(){
    SY = SY || { choix: {} }; SY.lecture = true; SY.err = null; dessiner();
    dire('${T("Analyse du test et de la production…")}');
    appeler('config:bt:sync', ['analyser']).then(function(r){
      SY.lecture = false;
      if (!r || !r.ok) { SY.res = null; SY.err = syMotif(r); dessiner(); dire('${T("Échec : ")}' + SY.err, 'err'); return; }
      SY.res = r; SY.choix = {}; dessiner();
      dire(r.elements.length ? '${T("Analyse terminée : vérifiez chaque élément, puis appliquez.")}' : '${T("Rien à synchroniser.")}', 'bon');
    });
    syHistorique();
  }
  function syHistorique(){ appeler('config:bt:sync', ['historique']).then(function(r){ if (r && r.ok) { HI = r.envois || []; if (!SY || SY.pct == null) dessiner(); } }); }
  function syEnvoyer(){
    var l = syAFaire(); if (!l.length || !SY || SY.pct != null) return;
    var nT = 0, nP = 0; l.forEach(function(e){ var c = SY.choix[syCle(e)] != null ? SY.choix[syCle(e)] : syDefaut(e); if (c === 'prod') nP++; else nT++; });
    var sans = SY.res.elements.filter(function(e){ return e.sens === 'conflit' && !SY.choix[syCle(e)]; }).length;
    szConfirmer({ danger: nT > 0, titre: '${T("Appliquer les choix")}',
      texte: nT + ' ${T("élément(s) partiront en PRODUCTION (la boutique en ligne change aussitôt) ;")} ' + nP + ' ${T("seront repris dans le test.")}'
        + (sans ? ' ' + sans + ' ${T("conflit(s) sans choix resteront en attente.")}' : '') + ' ${T("Chaque envoi est sauvegardé : il pourra être annulé.")}',
      oui: '${T("Appliquer")}' }).then(function(ok){ if (ok) syLancer(l); });
  }
  function syLancer(l){
    SY.pct = 0; dessiner(); dire('${T("Synchronisation en cours…")}', 'att');
    var minuteur = setInterval(jrLire, 1500), i = 0, err = 0;
    appeler('config:bt:sync', ['debut', { n: l.length }]).then(function(){ jrLire(); suivant(); });
    function suivant(){
      if (i >= l.length) {
        return appeler('config:bt:sync', ['fin', { n: l.length, erreurs: err }]).then(function(){
          clearInterval(minuteur); jrLire(); SY.pct = null;
          dire(err ? (err + ' ${T("élément(s) en échec : voir le journal.")}') : '${T("Synchronisation terminée.")}', err ? 'err' : 'bon');
          syAnalyser();
        });
      }
      var e = l[i], c = SY.choix[syCle(e)] != null ? SY.choix[syCle(e)] : syDefaut(e);
      appeler('config:bt:sync', ['appliquer', { tbl: e.tbl, cle: e.cle, choix: c, jeton: e.jeton }]).then(function(r){
        if (!r || !r.ok) err++;
        i++; SY.pct = Math.round(i * 100 / l.length);
        var b = document.getElementById('sy-prog'); if (b) { b.setAttribute('aria-valuenow', SY.pct); b.firstChild.style.width = SY.pct + '%'; }
        suivant();
      });
    }
  }
  function syAnnuler(id){
    var x = (HI || []).filter(function(h){ return h.id === id; })[0]; if (!x) return;
    szConfirmer({ danger: true, titre: '${T("Annuler cet envoi")}', texte: '${T("La production retrouve la version d’avant l’envoi pour :")} « ' + (x.titre || x.cle) + ' ». ${T("Le stock actuel est gardé. Le test, lui, ne change pas.")}', oui: '${T("Annuler l’envoi")}' })
      .then(function(ok){ if (!ok) return;
        dire('${T("Annulation…")}');
        appeler('config:bt:sync', ['annuler', { id: id }]).then(function(r){ jrLire(); syHistorique();
          dire(r && r.ok ? '${T("Envoi annulé : la production a retrouvé sa version d’avant.")}' : ('${T("Échec : ")}' + syMotif(r)), r && r.ok ? 'bon' : 'err'); }); });
  }

  /* LE VERROU DE LA PRODUCTION (lot 4) : SA RÈGLE — « toute modification devra impérativement passer en test avant
     d’être poussée en production » (la boutique seulement). L’urgence rouvre pour un temps, avec un motif, et tout est noté. */
  function vrHtml(){
    var v = (BT && BT.verrou) || { actif: false }, u = v.urgence;
    var h = '<div class="carte"><div class="stitre">${T("Production verrouillée")}</div>'
      + '<div class="expl">${T("Verrouillée, la production refuse toute création ou modification de produit (le stock reste permis) et de réglage de la boutique : tout passe par le test, puis par la synchronisation. Les finances et le RH ne sont pas touchés. Une <b>urgence</b> rouvre la production pour un temps, avec un motif ; chaque modification faite pendant ce temps va au journal.")}</div>'
      + '<div class="bt-etat">' + (v.actif ? '<span class="non"><span class="ic">🔒</span> ${T("Verrouillée")}</span>' : '<span><span class="ic">🔓</span> ${T("Déverrouillée : le catalogue se modifie encore directement en production.")}</span>')
      + (u ? ' · <span class="att">${T("Urgence ouverte jusqu’à")} ' + new Date(u.jusqu * 1000).toLocaleTimeString().slice(0, 5) + ' — ' + esc(u.motif) + '</span>' : '') + '</div>';
    if (!v.actif) h += '<div class="sy-av">${T("À activer une fois que l’application sait basculer vers la boutique de test (prochaine étape) : d’ici là, le catalogue ne se modifierait plus nulle part.")}</div>';
    h += '<div class="gestes"><button class="b" type="button" id="vr-bascule">' + (v.actif ? '${T("Déverrouiller la production")}' : '${T("Verrouiller la production")}') + '</button></div>';
    if (v.actif && !u) h += '<div class="vr-urg"><input id="vr-motif" maxlength="200" placeholder="${T("Motif de l’urgence (obligatoire)")}" aria-label="${T("Motif de l’urgence")}">'
      + '<select id="vr-min" aria-label="${T("Durée de l’urgence")}"><option value="15">15 min</option><option value="30" selected>30 min</option><option value="60">60 min</option><option value="120">120 min</option></select>'
      + '<button class="b" type="button" id="vr-urgence">${T("Ouvrir une urgence")}</button></div>';
    if (u) h += '<div class="gestes"><button class="b" type="button" id="vr-fin">${T("Fermer l’urgence")}</button></div>';
    return h + '</div>';
  }
  function vrBrancher(){
    var b = document.getElementById('vr-bascule'); if (b) b.onclick = function(){
      var actif = BT.verrou && BT.verrou.actif;
      szConfirmer({ danger: !actif, titre: actif ? '${T("Déverrouiller la production")}' : '${T("Verrouiller la production")}',
        texte: actif ? '${T("Le catalogue et les réglages de la boutique se modifieront de nouveau directement en production, sans passer par le test.")}'
                     : '${T("Dès maintenant, la production refuse les créations et modifications de produits et de réglages de la boutique. Tout se fera dans le test, puis par la synchronisation.")}',
        oui: actif ? '${T("Déverrouiller")}' : '${T("Verrouiller")}' }).then(function(ok){ if (ok) vrAgir(actif ? 'desactiver' : 'activer'); });
    };
    var u = document.getElementById('vr-urgence'); if (u) u.onclick = function(){
      var m = (document.getElementById('vr-motif') || {}).value || '', mi = +((document.getElementById('vr-min') || {}).value || 30);
      if (m.trim().length < 5) { dire('${T("Donnez le motif de l’urgence (5 caractères au moins).")}', 'err'); return; }
      vrAgir('urgence', { motif: m.trim(), minutes: mi });
    };
    var f = document.getElementById('vr-fin'); if (f) f.onclick = function(){ vrAgir('fin_urgence'); };
  }
  function vrAgir(quoi, p){
    dire('${T("Enregistrement…")}');
    appeler('config:bt:verrou', [quoi, p || {}]).then(function(r){
      if (r && r.ok) { BT.verrou = r.verrou; dessiner(); jrLire(); dire(quoi === 'activer' ? '${T("Production verrouillée.")}' : quoi === 'desactiver' ? '${T("Production déverrouillée.")}' : quoi === 'urgence' ? '${T("Urgence ouverte : chaque modification est notée au journal.")}' : '${T("Urgence fermée.")}', 'bon'); return; }
      dire(r && r.motif === 'motif_requis' ? '${T("Donnez le motif de l’urgence (5 caractères au moins).")}' : ('${T("Échec : ")}' + expliquer(r)), 'err');
    });
  }

  function jrLigne(l){ var d = new Date((l.le || 0) * 1000); var hh = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
    return '<div class="' + esc(l.niveau || '') + '"><time>' + hh + '</time>' + esc(l.texte || '') + '</div>'; }
  function jrLire(){ return appeler('config:bt:journal', [JR_ID]).then(function(r){
    if (r && r.ok && r.lignes && r.lignes.length) { JR = JR.concat(r.lignes).slice(-300); JR_ID = JR[JR.length - 1].id; var b = document.getElementById('bt-jr');
      if (b) { b.innerHTML = JR.map(jrLigne).join(''); b.scrollTop = b.scrollHeight; } } }); }
  function cpMaj(pct){ CP.pct = Math.max(0, Math.min(100, Math.round(pct))); var b = document.querySelector('.bt-prog'); if (b) { b.setAttribute('aria-valuenow', CP.pct); b.firstChild.style.width = CP.pct + '%'; } }
  function btCopier(){
    if (CP) return;
    dire('${T("Lecture de la production…")}');
    appeler('config:bt:copie', ['plan']).then(function(p){
      if (!p || !p.ok) { dire('${T("Échec : ")}' + expliquer(p), 'err'); return; }
      var total = 0; var lst = (p.tables || []).map(function(t){ total += t.lignes; return t.nom + ' (' + t.lignes + ')'; }).join(', ');
      return szConfirmer({ danger: true, titre: '${T("Copier la production vers le test")}',
        texte: '${T("Tout le contenu actuel du test sera remplacé, y compris ce qui y a été modifié et pas encore synchronisé vers la production. Tables copiées : ")}' + lst + '.',
        oui: '${T("Remplacer le test")}' }).then(function(ok){ if (ok) btCopieLancer(p.tables || [], total); else dire(''); });
    });
  }
  function btCopieLancer(tables, total){
    CP = { pct: 0, fait: 0 }; dessiner(); dire('${T("Copie en cours…")}', 'att');
    var minuteur = setInterval(jrLire, 2000);
    function finir(ok, msg){ clearInterval(minuteur); CP = null; jrLire().then(function(){ btCharger(); }); dire(msg, ok ? 'bon' : 'err'); }
    appeler('config:bt:copie', ['preparer', { ecraser: true }]).then(function(r){
      if (!r || !r.ok) return finir(false, '${T("Échec : ")}' + expliquer(r));
      var i = 0;
      function suivante(apres){
        if (i >= tables.length) return appeler('config:bt:copie', ['fin']).then(function(f){ finir(f && f.ok, f && f.ok ? '${T("Copie terminée : le test est à jour.")}' : ('${T("Échec : ")}' + expliquer(f))); });
        var t = tables[i];
        appeler('config:bt:copie', ['table', { table: t.nom, apres: apres }]).then(function(x){
          if (!x || !x.ok) return finir(false, '${T("Échec : ")}' + expliquer(x));
          CP.fait += (x.copiees || 0) + (x.ecartees || 0); cpMaj(total ? CP.fait * 100 / total : 100);
          if (x.suivant != null) suivante(x.suivant); else { i++; suivante(0); }
        });
      }
      suivante(0);
    });
  }
  function btLire(){ var t = document.getElementById('bt-ips'), p = document.getElementById('bt-pays');
    return { ips: (t ? t.value : '').split(/[\\s,;]+/).map(function(x){ return x.trim(); }).filter(Boolean),
             pays: (p ? p.value : '').split(/[\\s,;]+/).map(function(x){ return x.trim().toUpperCase(); }).filter(Boolean),
             courriel: ((document.getElementById('bt-courriel') || {}).value || '').trim() }; }
  function btAjouterMoi(){
    var t = document.getElementById('bt-ips'); var ip = BT && BT.moi && BT.moi.ip; if (!t || !ip) return;
    var l = btLire().ips; if (l.indexOf(ip) < 0) l.push(ip); t.value = l.join('\\n');
    var p = document.getElementById('bt-pays'), pays = BT.moi.pays;
    if (p && pays && /^[A-Z]{2}$/.test(pays)) { var lp = btLire().pays; if (lp.length && lp.indexOf(pays) < 0) { lp.push(pays); p.value = lp.join(', '); } }
    dire('${T("Adresse ajoutée à la liste : enregistrez pour l’appliquer.")}', 'att');
  }
  function btEnregistrer(){
    var v = btLire(); var b = document.getElementById('bt-ok'); if (b) b.disabled = true;
    dire('${T("Enregistrement de l’accès…")}');
    appeler('config:bt:accesEcrire', [v]).then(function(r){
      if (b) b.disabled = false;
      if (r && r.ok) { BT.acces = r.acces; BT.jeton = true; dessiner(); btCharger(); dire(r.acces.ips.length ? '${T("Accès enregistré : la boutique de test s’ouvre à ces adresses.")}' : '${T("Liste vide : la boutique de test est fermée à tout le monde.")}', 'bon'); return; }
      dire(r && r.motif === 'courriel_invalide' ? ('${T("Adresse courriel invalide : ")}' + esc(r.valeur || '')) : r && r.motif === 'ip_invalide' ? ('${T("Adresse IP invalide : ")}' + esc(r.valeur || '')) : r && r.motif === 'droit' ? '${T("Réservé aux super-administrateurs.")}' : r && r.motif === 'jeton_test_absent' ? '${T("Le serveur n’a pas le jeton de la base de test (TESTBD_SANDRIZA).")}' : ('${T("Échec : ")}' + expliquer(r)), 'err');
    });
  }
  function btCharger(){ appeler('config:bt:acces').then(function(r){ BT = r || { ok: false, motif: 'echec' };
    if (!BT.ok) { dessiner(); return; }
    appeler('config:bt:copie', ['plan']).then(function(p){ if (p && p.ok) BT.derniere = p.derniere; dessiner(); jrLire(); syHistorique(); }); }); }

  function agir(act){
    if (OCCUPE) return;
    if (act === 'tester') return tester();
    // Restaurer et migrer : gestes lourds, confirmes dans une boite a part (szConfirmer, 2026-10-15).
    // (2026-10-25, audit) Pousser aussi : la configuration LOCALE remplace celle du nuage pour tous les postes.
    if (act === 'restaurer' || act === 'migrer' || act === 'pousser') {
      if (CONF !== act) {
        var oC = (act === 'pousser')
          ? { prudent: true, titre: '${T("Pousser la configuration locale")}',
              texte: '${T("La configuration de ce poste remplacera celle enregistrée dans Turso, pour tous les postes. Si ce poste a un cache périmé, il écrasera les réglages faits ailleurs.")}',
              oui: '${T("Pousser vers Turso")}' }
          : (act === 'restaurer')
          ? { danger: true, titre: '${T("Restaurer depuis Turso")}',
              texte: '${T("La configuration enregistrée dans Turso remplacera la configuration locale, puis la fenêtre principale sera rechargée. Les réglages locaux qui n’ont pas été poussés vers Turso seront perdus.")}',
              oui: '${T("Restaurer la configuration")}' }
          : { prudent: true, titre: '${T("Migrer les images vers R2")}',
              texte: '${T("Les images encore stockées en base64 dans la base de données seront déplacées vers Cloudflare R2. L’opération peut durer plusieurs minutes et n’est à lancer qu’une seule fois.")}',
              oui: '${T("Lancer la migration")}' };
        szConfirmer(oC).then(function(ok){ if (ok) { CONF = act; agir(act); } });
        return;
      }
      CONF = '';
      return (act === 'restaurer') ? restaurer() : (act === 'pousser') ? pousser() : migrer();
    }
  }
  function tester(){
    dire('${T("Test de la connexion…")}');
    appeler('config:bd:tester').then(function(r){ dire(r && r.ok ? '${T("Connexion Turso OK.")}' : ('${T("Échec : ")}' + expliquer(r)), r && r.ok ? 'bon' : 'err'); });
  }
  function pousser(){
    occuper(true); dessiner(); dire('${T("Synchronisation vers Turso…")}');
    appeler('config:bd:pousser').then(function(r){
      occuper(false); dessiner();
      if (r && r.ok) dire(r.pousse + ' ' + szPl(r.pousse, '${T("clé poussée")}', '${T("clés poussées")}') + (r.retenu ? ' — ' + r.retenu + ' ' + szPl(r.retenu, '${T("gérée entrée par entrée par le serveur.")}', '${T("gérées entrée par entrée par le serveur.")}') : '.'), 'bon');
      else dire('${T("Échec : ")}' + expliquer(r), 'err');
    });
  }
  function restaurer(){
    occuper(true); dessiner(); dire('${T("Restauration depuis Turso…")}');
    appeler('config:bd:restaurer').then(function(r){
      // (2026-10-25, audit) Le succes libere aussi les boutons : ils restaient bloques jusqu a la reouverture.
      occuper(false); dessiner();
      if (r && r.ok) dire('${T("Restauré — la fenêtre principale se recharge…")}', 'bon');
      else dire('${T("Échec : ")}' + expliquer(r), 'err');
    });
  }
  function migrer(){
    occuper(true); dessiner(); dire('${T("Migration des images vers R2… (peut durer)")}');
    appeler('config:bd:migrer').then(function(r){
      occuper(false); dessiner();
      if (r && r.ok) { dire('${T("Migration terminée : ")}' + (r.migrated || 0) + ' ' + szPl(r.migrated || 0, '${T("image déplacée")}', '${T("images déplacées")}') + (r.errors ? ', ' + r.errors + ' ' + szPl(r.errors, '${T("erreur.")}', '${T("erreurs.")}') : '.'), r.errors ? 'att' : 'bon'); chargerStock(); }
      else dire('${T("Échec : ")}' + expliquer(r), 'err');
    });
  }
  function chargerStock(){
    appeler('config:bd:stockage').then(function(r){
      STOCK = (r && r.ok) ? r : { erreur: '${T("Occupation indisponible pour le moment.")}' };
      dessiner();
    });
  }

  function charger(){
    dire('${T("Lecture…")}');
    appeler('config:bd:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide m-' + ((r && r.motif) || 'echec') + '">' + expliquer(r) + '</div>'; dire(expliquer(r), 'err'); return; }
      D = r; RO = !r.peutModifier; dessiner(); dire('');
      chargerStock(); btCharger();
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageBd };
