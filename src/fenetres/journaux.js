'use strict';

/*
 * FENÊTRE « JOURNAUX » — NATIVE (#7, Lot 7a)
 * =============================================================================
 * Réunit les 4 journaux existants en une fenêtre ancrable : Accès (connexions,
 * MFA, géo, actions), Automatisations (crons), Impressions (agent / navigateur /
 * Bluetooth), SMS, Accès aux liens, Recherches sans résultat.
 * ⚠ Les journaux de RÉVISIONS et d'impressions promo vivent encore dans leurs
 * modules — ils sont attachés à une fiche, pas à l'entreprise.
 *
 * ⚠ LES VERROUS NE SONT PLUS ICI (#35). Ils ont eu leur onglet jusqu'au
 * 3.39.0 : c'était une erreur de rangement. Un journal est une ARCHIVE — on le
 * consulte après coup ; un verrou est un ÉTAT VIVANT — qui travaille sur quoi
 * MAINTENANT. Rangé parmi les archives, l'écran restait figé : un verrou libéré
 * s'affichait encore comme s'il bloquait. Ils vivent désormais dans
 * `verrous.js`, qui se rafraîchit tout seul — le bouton en tête y mène.
 *
 * Lecture par `journal:donnees` (local, rapide). Les EXPORTS CSV suivent le patron « fenêtre pilote » : c'est la PAGE
 * qui télécharge (createObjectURL + suivi des téléchargements), pas la fenêtre.
 *
 * ⚠ ANCRÉE = PLEINE PAGE. ⚠ Aucun caractère accent grave dans la portion script.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la langue du
   poste. ⚠⚠ On ne traduit QUE ce qui se lit — les adresses IP, les noms
   d'imprimante, les termes cherchés et le détail d'une entrée viennent du
   journal lui-même, et ne passent jamais par le dictionnaire. */
const T = require('../langue').tr('journaux');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.55rem 1.1rem;
  border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.onglets{flex:0 0 auto;display:flex;gap:.1rem;flex-wrap:wrap;padding:.35rem 1rem 0;border-bottom:1px solid var(--v08)}
.onglets button{font:inherit;font-size:.82rem;white-space:nowrap;background:none;border:none;color:var(--tx2);padding:.5rem .85rem;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
.onglets button.on{color:var(--tx-or);border-bottom-color:#c9a97e;font-weight:700}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--v03);border:1px solid var(--v08);border-radius:12px;padding:1rem 1.1rem;margin:0 0 1.1rem}
.barre{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin:0 0 .9rem}
.barre .pousse{flex:1}
.stat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.8rem;margin:0 0 1rem}
@media(max-width:820px){.stat-grid{grid-template-columns:repeat(2,1fr)}}
.stat{background:var(--v03);border:1px solid var(--v08);border-radius:11px;padding:.7rem .85rem}
.stat .l{font-size:.7rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.04em}
.stat .v{font:700 1.4rem/1.1 Georgia,serif;margin-top:.2rem}
select.t{background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;color:var(--tx);font:inherit;font-size:.82rem;padding:.4rem .6rem}
.b{font:inherit;font-size:.8rem;border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;background:var(--v05);color:var(--tx);cursor:pointer;white-space:nowrap}
.b:hover{background:var(--v09)}
.b.dgr{color:var(--tx-f6a6a6);border-color:rgba(248,113,113,.35)}
.b.dgr:hover{background:rgba(248,113,113,.16)}
table.tb{width:100%;border-collapse:collapse}
table.tb th{text-align:left;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);padding:.45rem .6rem;border-bottom:1px solid var(--v10);white-space:nowrap}
table.tb td{padding:.5rem .6rem;border-bottom:1px solid var(--v06);font-size:.82rem;vertical-align:top}
.pill{display:inline-block;font-size:.66rem;font-weight:700;padding:2px 7px;border-radius:99px;white-space:nowrap}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
.mut{color:var(--tx2)}.sub{font-size:.72rem;color:var(--tx-gris)}
.kpis{display:flex;gap:.6rem;flex-wrap:wrap;margin:0 0 1rem}
.kpi{background:var(--v03);border:1px solid var(--v08);border-radius:10px;padding:.55rem .8rem;min-width:110px}
.kpi .v{font:700 1.2rem/1 Georgia,serif}.kpi .l{font-size:.7rem;color:var(--tx2)}
.note{background:var(--v04);border:1px solid var(--v10);border-radius:9px;padding:.8rem 1rem;font-size:.82rem;color:var(--tx2);line-height:1.55;margin:0 0 1rem}
.note b{color:var(--tx)}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
.vide{padding:1.5rem;text-align:center;color:var(--tx2);font-size:.82rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer}
/* La zone mesurable de la pagination auto (#31) : une hauteur REELLE. */
.liste{max-height:calc(100vh - 17rem);overflow-y:auto}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.45rem;font-size:.75rem;color:var(--tx2)}
.barre select{font:inherit;font-size:.76rem;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:7px;padding:.12rem .4rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageJournaux(onglet) {
  var brut = String(onglet||'');
  // Ouverture directe sur une RECHERCHE (pour le banc, qui ne clique pas) :
  // 'q-<terme>' ouvre l'onglet Recherche et lance la recherche du terme.
  var RQINIT0 = '';
  if (brut.indexOf('q-') === 0) { RQINIT0 = brut.slice(2).replace(/[^A-Za-z0-9._@-]/g, ''); brut = 'recherche'; }
  /* ⚠ 'journal' EST ENCORE ACCEPTÉ ET MÈNE À L'ONGLET DES ENVOIS. C'était le
     nom de la fenêtre qui a été repliée ici le 2026-09-13 : un raccourci, un
     signet ou une coquille plus ancienne peut encore le passer, et tomber sur
     l'onglet « Accès » sans explication serait pire que d'arriver au bon
     endroit. Même égard que pour 'securite' dans la fenêtre des accès. */
  if (brut === 'journal') brut = 'envois';
  const ONGLET0 = (['recherche','acces','automatisations','envois','impressions','sms','comptable','recherches','jserreurs'].indexOf(brut) >= 0) ? brut : 'acces';
  return `${TETE()}
<title>${T("Journaux — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.journaux}</span><h1>${T("Journaux")}</h1></div>
<div class="onglets" id="onglets"></div>
<div class="corps"><div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; b.style.marginLeft='auto'; t.appendChild(b); }
    if (actif) { b.textContent='${T("⧉ Détacher")}'; b.title='${T("Ouvrir cet écran dans sa propre fenêtre")}'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='${T("⚓ Ancrer")}'; b.title='${T("Ramener cet écran dans la fenêtre principale")}'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
  // Aller directement à un onglet quand la fenêtre est DÉJÀ ouverte (lien de
  // retour depuis une autre fenêtre — #7 7b-2c).
  window.szAllerOnglet = function(t){
    if (['recherche','acces','automatisations','impressions','sms','comptable','recherches','jserreurs'].indexOf(String(t||'')) < 0) return;
    ONGLET = String(t); rendre();
  };
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  /* ⚠⚠ IL Y AVAIT ICI UN cpt(n, tot) QUI DISAIT EXACTEMENT << 300 sur 5 000 >>,
     ET PERSONNE NE L APPELAIT. Ecrit avec la bonne intention, jamais branche :
     les cinq listes de cette fenetre affichaient a cote un total NU, au-dessus
     d un tableau coupe a 300. La regle etait donc ecrite TROIS fois dans le
     depot — ici, dans fidelisation.js, et dans l en-tete d un coeur — et
     appliquee UNE seule.
     Elle vit maintenant dans JS_COMPTE (socle.js) sous le nom szCompte, joint a
     JS_DIRE : une seule definition, 78 fenetres. Ce commentaire reste pour qu on
     n en reecrive pas une quatrieme.
     ⚠ Une fonction utilitaire sans appelant ne se voit pas a la relecture : elle
     ressemble a du soin. C est le banc des plafonds, cote site, qui a mene ici. */
  var ongletsEl = document.getElementById('onglets');
  var D = null, OCCUPE = false;
  // Bouton « Vider » du journal des erreurs : arme au premier clic, agit au
  // second. Desarme en changeant d onglet (voir la fonction rendre).
  var JS_ARME = false;
  var ONGLET = '${ONGLET0}';
  var PF_TYPE = 'all', PF_VIA = 'all';   // filtres de l'onglet Impressions
  var RQ = '', RRES = null;   // recherche inter-journaux : terme + résultats
  var RQINIT = '${RQINIT0}';  // terme à lancer automatiquement à l'ouverture (banc)

  /* ⚠⚠ « JOURNAL D'ENVOI » A REJOINT CETTE FENÊTRE LE 2026-09-13, à sa demande :
     « cela devrait aller dans les journaux et avoir sa propre onglet aussi et
     disparaître de marketing ». Il avait un écran à lui sous Marketing — et
     c'était bien un JOURNAL : qui a reçu quoi, quand, et si c'est parti. Le
     chercher ailleurs que dans les journaux était une devinette de plus.
     ⚠ IL EST PLACÉ APRÈS « Automatisations » et non en fin de liste : les deux
     racontent la même histoire (ce que la boutique a envoyé toute seule), et
     on passe de l'un à l'autre en enquêtant. */
  var ONGLETS = [ ['recherche','${T("Recherche")}'], ['acces','${T("Accès")}'], ['automatisations','${T("Automatisations")}'], ['envois','${T("Journal d’envoi")}'], ['impressions','${T("Impressions")}'], ['sms','SMS'], ['comptable','${T("Accès aux liens")}'], ['recherches','${T("Sans résultat")}'], ['jserreurs','${T("Erreurs des clients")}'] ];
  var SMS_D = null, COMPTA_D = null;   // journaux SERVEUR (chargés à la visite de l'onglet)
  /* ⚠ L'ÉTAT DU JOURNAL D'ENVOI, chargé à la visite de l'onglet comme les deux
     ci-dessus : le coeur journal:liste exige le droit newsletter, qui n'est
     pas celui qui ouvre cette fenêtre. On ne va donc pas le chercher tant que
     personne ne l'a demandé — sinon chaque ouverture des Journaux commencerait
     par un refus inscrit nulle part. */
  var ENV_D = null;
  var ENV_Q = '', ENV_ECHECS = false, ENV_ARME = false;

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function fdate(ts){ if (!ts) return '—'; try { return new Date(ts).toLocaleString('${LIEU()}'); } catch(e){ return '—'; } }

  var MOTIFS = {
    session:'${T("Aucune session ouverte. Connectez-vous dans la fenêtre principale.")}',
    droit:'${T("Votre rôle ne donne pas accès aux journaux.")}',
    pont_indisponible:'${T("La fenêtre principale ne répond pas.")}',
    delai:"${T('La fenêtre principale n\'a pas répondu à temps.')}",
    operation_inconnue:'${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:'${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('${T("Erreur inattendue (")}'+esc(m||'?')+').'))+(r&&r.detail?' — '+esc(r.detail):''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }

  /* ⚠ LE CHEMIN VERS LES VERROUS RESTE VISIBLE (#35). On a deplace un ecran,
     pas supprime une fonction : sans ce bouton, un super-administrateur qui
     connaissait l onglet le chercherait indefiniment. Il n apparait que pour
     ceux qui y ont droit — le COEUR refuse les autres de toute facon. */
  function boutonVerrous(){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('j-verrous');
    if (!(D && D.isSuper)) { if (b && b.parentNode) b.parentNode.removeChild(b); return; }
    if (b) return;
    b = document.createElement('button');
    b.id = 'j-verrous'; b.type = 'button'; b.className = 'mini';
    b.style.marginLeft = '.6rem';
    b.textContent = 'Verrous';
    b.title = '${T("Qui tient une fiche en ce moment (ecran a part, en direct)")}';
    b.onclick = function(){ if (P && P.ouvrirModule) P.ouvrirModule('verrous'); };
    var d = document.getElementById('sz-detacher');
    if (d) t.insertBefore(b, d); else t.appendChild(b);
  }

  function tabs(){
    var h='';
    for (var i=0;i<ONGLETS.length;i++){ var o=ONGLETS[i];
      h+='<button data-k="'+o[0]+'" class="'+(ONGLET===o[0]?'on':'')+'">'+esc(o[1])+'</button>'; }
    ongletsEl.innerHTML=h;
    var bs=ongletsEl.querySelectorAll('button');
    for (var j=0;j<bs.length;j++) bs[j].onclick=function(){ ONGLET=this.getAttribute('data-k'); rendre(); };
  }

  // ── Recherche inter-journaux ─────────────────────────────────────
  function vueRecherche(){
    var h = '<div class="carte"><div class="barre">'
      + '<input aria-label="${T("Rechercher dans TOUS les journaux (IP, nom, courriel, no de commande, imprimante…)")}" class="t" id="r-q" placeholder="${T("Rechercher dans TOUS les journaux (IP, nom, courriel, no de commande, imprimante…)")}" value="'+esc(RQ)+'" style="flex:1;min-width:220px">'
      + '<button class="b" id="r-go"><span class="ic">🔎</span> ${T("Rechercher")}</button></div>'
      + '<div class="sub">${T("Le terme est cherché dans tous les champs de chaque journal (accès, automatisations, impressions). Minimum 2 caractères.")}</div>'
      + '<div id="r-res">'+(RRES ? resultatsHtml() : '<div class="vide">${T("Tapez un terme puis « Rechercher ».")}</div>')+'</div></div>';
    corps.innerHTML = h;
    var q=document.getElementById('r-q');
    var go=document.getElementById('r-go');
    if (go) go.onclick=lancerRecherche;
    if (q){ q.focus(); q.onkeydown=function(e){ if (e.key==='Enter'){ e.preventDefault(); lancerRecherche(); } }; }
    if (RQINIT && RRES===null){ RQ=RQINIT; RQINIT=''; if (q) q.value=RQ; lancerRecherche(); }
  }
  function matchAny(ql, vals){ for (var i=0;i<vals.length;i++){ if (String(vals[i]==null?'':vals[i]).toLowerCase().indexOf(ql) >= 0) return true; } return false; }
  function lancerRecherche(){
    var q=document.getElementById('r-q'); RQ=q?String(q.value||''):RQ;
    var ql = RQ.trim().toLowerCase();
    if (ql.length < 2){ RRES={ tropCourt:true, groupes:[], total:0 }; peindreResultats(); return; }
    if (OCCUPE) return; OCCUPE=true; dire('${T("Recherche dans tous les journaux…")}');
    // Journaux LOCAUX (accès, automatisations, impressions, sans résultat) par le
    // cœur ; journaux SERVEUR (SMS, comptable) récupérés puis filtrés ici — pour
    // que « une IP » ressorte VRAIMENT de tous les journaux.
    appeler('journal:recherche',[RQ]).then(function(r){
      var groupes = (r && r.ok && r.groupes) ? r.groupes.slice() : [];
      var total = (r && r.ok) ? (r.total||0) : 0;
      return Promise.all([ appeler('journal:sms',[]), appeler('liens:journal',[{canal:''}]) ]).then(function(res){
        var smsR=res[0], cpR=res[1];
        if (smsR && smsR.ok){
          var sm=(smsR.sms||[]).filter(function(s){ return matchAny(ql,[s.from,s.to,s.body,s.direction,s.date]); })
            .map(function(s){ return { date:s.date, direction:s.direction, from:s.from, to:s.to, body:s.body }; });
          if (sm.length){ groupes.push({ cle:'sms', label:'SMS', onglet:'sms', total:sm.length, entrees:sm.slice(0,200) }); total+=sm.length; }
        }
        if (cpR && cpR.ok){
          var cp=(cpR.journal||[]).filter(function(e){ return matchAny(ql,[e.canal,e.genre,e.ip,e.lienId,e.detail,e.qui,e.au]); })
            .map(function(e){ return { au:e.au, canal:e.canal, genre:e.genre, ip:e.ip, lienId:e.lienId, detail:e.detail, qui:e.qui }; });
          if (cp.length){ groupes.push({ cle:'comptable', label:'${T("Accès comptables")}', onglet:'comptable', total:cp.length, entrees:cp.slice(0,200) }); total+=cp.length; }
        }
        OCCUPE=false; RRES={ ok:true, q:RQ, total:total, groupes:groupes }; peindreResultats();
        dire(total?(total+' ${T("résultat(s) dans tous les journaux.")}'):'${T("Aucun résultat.")}', 'bon');
      });
    }).catch(function(){ OCCUPE=false; dire('${T("Échec de la recherche.")}', 'err'); });
  }
  function peindreResultats(){ var el=document.getElementById('r-res'); if (el) el.innerHTML=resultatsHtml(); brancherResultats(); }
  function resultatsHtml(){
    if (RRES && RRES.tropCourt) return '<div class="vide">${T("Entrez au moins 2 caractères.")}</div>';
    var groupes = (RRES&&RRES.groupes)||[];
    if (!groupes.length) return '<div class="vide">${T("Aucun résultat pour «")} '+esc(RRES?RRES.q:'')+' ».</div>';
    var h='';
    for (var g=0;g<groupes.length;g++){ var grp=groupes[g], e=grp.entrees||[];
      h += '<div class="barre" style="margin:.9rem 0 .3rem"><strong>'+esc(grp.label)+' <span class="mut">('+(grp.total||e.length)+')</span></strong>'
        + '<span class="pousse"></span><button class="b" data-goto="'+esc(grp.onglet)+'">${T("Ouvrir cet onglet")}</button></div>';
      h += '<table class="tb"><tbody>';
      for (var i=0;i<e.length;i++){ var x=e[i];
        if (grp.cle==='acces'){
          var t=TYPE[x.type]||{bg:'var(--v06)',c:'var(--tx2)',l:x.type};
          h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(x.ts))+'</td>'
            + '<td><span class="pill '+(t.k||'')+'">'+esc(t.l)+'</span></td>'
            + '<td>'+esc(x.nom||'—')+'<div class="sub">'+esc(x.email)+'</div></td>'
            + '<td class="mono">'+esc(x.ip||'—')+'</td><td>'+esc(x.pays||'')+'</td><td>'+esc(x.action||'')+'</td></tr>';
        } else if (grp.cle==='automatisations'){
          h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(x.ts))+'</td><td><span class="pill" style="background:var(--v06);color:var(--tx-c3cede)">'+esc(SECT[x.section]||x.section||'—')+'</span></td><td>'+esc(x.action||'')+'</td></tr>';
        } else if (grp.cle==='recherches'){
          h += '<tr><td><strong>'+esc(x.q)+'</strong></td><td style="text-align:center">'+esc(x.fois||0)+' fois</td><td class="mut">'+esc(x.derniere||'—')+'</td></tr>';
        } else if (grp.cle==='sms'){
          var ent=(x.direction==='inbound');
          h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(x.date))+'</td><td>'+(ent?'${T("⬇ Reçu")}':'${T("⬆ Envoyé")}')+'</td><td class="mono">'+esc(x.from||'')+'</td><td class="mono">'+esc(x.to||'')+'</td><td>'+esc(x.body||'')+'</td></tr>';
        } else if (grp.cle==='comptable'){
          h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(x.au))+'</td><td>'+esc(CANAUX[x.canal]||x.canal||'')+'</td><td>'+esc(EVEN[x.genre]||x.genre||'')+'</td><td class="mono">'+esc(x.ip||'—')+'</td><td>'+esc(x.detail||'')+'</td></tr>';
        } else {
          h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(x.at))+'</td><td><span class="pill" style="background:var(--v06);color:var(--tx-c3cede)">'+esc(x.kindLabel||x.kind)+'</span></td><td>'+esc(x.label||'—')+'</td><td>'+esc(x.printer||'')+'</td><td class="sub">'+esc(x.who||'')+'</td><td>'+(x.ok===false?'<span class="pill err">${T("Échec")}</span>':'<span class="pill bon">${T("Imprimé")}</span>')+'</td></tr>';
        }
      }
      h += '</tbody></table>';
    }
    return h;
  }
  function brancherResultats(){
    var gs=corps.querySelectorAll('[data-goto]');
    for (var i=0;i<gs.length;i++) gs[i].onclick=function(){ ONGLET=this.getAttribute('data-goto'); rendre(); };
  }

  // ── Accès ────────────────────────────────────────────────────────
  /* ⚠⚠ UNE CLASSE, PLUS UNE COULEUR. Cette table portait bg et c, posés en
     STYLE EN LIGNE — et un style en ligne bat toute regle CSS, y compris les
     reprises de mode jour. Ces pastilles ne pouvaient donc pas suivre le theme :
     « ✗ Echec » sortait a 1.43 de contraste en mode clair, c est-a-dire
     illisible. Et aucun banc qui LIT le CSS ne pouvait le voir, puisque la
     couleur vit dans une chaine JavaScript.
     Les classes .pill.bon/.att/.err/.info sont definies dans le socle pour les
     DEUX modes : la pastille n a plus qu a dire ce qu elle EST. */
  var TYPE = {
    login_ok:{k:'bon',l:'${T("✓ Connexion")}'},
    login_fail:{k:'err',l:'${T("✗ Échec")}'},
    logout:{k:'info',l:'${T("⏻ Déconnexion")}'},
    mfa_fail:{k:'att',l:'${T("MFA échoué")}'},
    mfa_timeout:{k:'att',l:'${T("⏱ MFA expiré")}'},
    action:{k:'info',l:'${T("⚙ Action")}'},
    login_blocked_geo:{k:'err',l:'${T("Bloqué (géo)")}'}
  };
  function drapeau(cc){ if (!cc||cc.length!==2) return ''; try { return String.fromCodePoint.apply(null,cc.toUpperCase().split('').map(function(x){return 127397+x.charCodeAt(0);})); } catch(e){ return ''; } }
  function vueAcces(){
    var st = D.stats||{}, rows = D.acces||[];
    var h = '';
    if (!D.statsHidden) h += '<div class="stat-grid">'
      + '<div class="stat"><div class="l">${T("Connexions auj.")}</div><div class="v" style="color:var(--tx-ok2)">'+(st.loginOk||0)+'</div></div>'
      + '<div class="stat"><div class="l">${T("Échecs auj.")}</div><div class="v" style="color:var(--tx-err2)">'+(st.loginFail||0)+'</div></div>'
      + '<div class="stat"><div class="l">${T("Échecs MFA")}</div><div class="v" style="color:var(--tx-att)">'+(st.mfaFail||0)+'</div></div>'
      + '<div class="stat"><div class="l">${T("Bloqués géo")}</div><div class="v" style="color:var(--tx-fda4af)">'+(st.geoBlocked||0)+'</div></div>'
      + '<div class="stat"><div class="l">${T("IPs uniques")}</div><div class="v">'+(st.ips||0)+'</div></div>'
      + '</div>';
    h += '<div class="carte"><div class="barre"><span class="sub">'+szCompte(rows.length, D.accesTotal, '${T("entrée")}', '${T("entrées")}')+'${T(" · conservation 30 jours")}</span><span class="pousse"></span>'
      + '<button class="b" id="a-stats">'+(D.statsHidden?'${T("Afficher les stats")}':'${T("Masquer les stats")}')+'</button>'
      + (D.peutModifier?'<button class="b" id="a-purge">${T("Purger anciens")}</button>':'')
      + '<button class="b" id="a-csv">${T("Exporter CSV")}</button></div>'
      + '<div class="liste"><table class="tb"><thead><tr><th>${T("Date")}</th><th>${T("Type")}</th><th>${T("Utilisateur")}</th><th>IP</th><th>${T("Pays")}</th><th>${T("Action")}</th></tr></thead><tbody>';
    /* ── PAGINATION AUTO (#31) ────────────────────────────────────────────
       Le journal des accès déversait ses trente jours d'un coup. Le nombre de
       lignes se MESURE maintenant sur la hauteur réelle de la fenêtre. */
    var apages = Math.max(1, Math.ceil(rows.length / AC_PARPAGE));
    if (AC_PAGE >= apages) AC_PAGE = apages - 1;
    if (AC_PAGE < 0) AC_PAGE = 0;
    var avue = rows.slice(AC_PAGE * AC_PARPAGE, AC_PAGE * AC_PARPAGE + AC_PARPAGE);
    if (!avue.length) h += '<tr><td colspan="6" class="vide">${T("Aucun journal.")}</td></tr>';
    for (var i=0;i<avue.length;i++){ var l=avue[i]; var t=TYPE[l.type]||{bg:'var(--v06)',c:'var(--tx2)',l:l.type};
      h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(l.ts))+'</td>'
        + '<td><span class="pill '+(t.k||'')+'">'+esc(t.l)+'</span></td>'
        + '<td>'+esc(l.nom||'—')+'<div class="sub">'+esc(l.email)+'</div></td>'
        + '<td class="mono">'+esc(l.ip||'—')+'</td>'
        + '<td style="white-space:nowrap">'+esc(drapeau(l.cc))+' '+esc(l.pays||'—')+(l.ville?'<div class="sub">'+esc(l.ville)+'</div>':'')+'</td>'
        + '<td>'+esc(l.action||'—')+'</td></tr>';
    }
    h += '</tbody></table></div>';
    if (apages > 1) {
      h += '<div class="pagi"><button class="mini" id="ac-prec"'+(AC_PAGE<=0?' disabled':'')+'>${T("‹ Précédent")}</button>'
        + '<span>Page '+(AC_PAGE+1)+' sur '+apages+'</span>'
        + '<button class="mini" id="ac-suiv"'+(AC_PAGE>=apages-1?' disabled':'')+'>${T("Suivant ›")}</button></div>';
    }
    h += '</div>';
    corps.innerHTML = h;
    var bs=document.getElementById('a-stats'); if (bs) bs.onclick=basculerStats;
    var bp=document.getElementById('a-purge'); if (bp) bp.onclick=function(){ purger('journal:purger:acces'); };
    var bc=document.getElementById('a-csv'); if (bc) bc.onclick=function(){ exporter('journal:export:acces'); };
    var ap=document.getElementById('ac-prec'); if (ap) ap.onclick=function(){ AC_PAGE=Math.max(0,AC_PAGE-1); vueAcces(); };
    var as=document.getElementById('ac-suiv'); if (as) as.onclick=function(){ AC_PAGE=AC_PAGE+1; vueAcces(); };
    szAutoPagination('.liste', function(n){ AC_PARPAGE=n; AC_PAGE=0; vueAcces(); });
  }

  // ── Automatisations ──────────────────────────────────────────────
  var SECT = { orders:'${T("Livraison")}', stats:'${T("Statistiques")}', marketing:'${T("Marketing")}', staff:'${T("Mot de passe")}',
    'returns-mgmt':'${T("↩ Retours")}', sociaux:'${T("Réseaux sociaux")}', newsletter:'Infolettre', systeme:'${T("Entretien")}', app:'${T("Application")}' };
  function vueAuto(){
    var rows = D.automations||[];
    var h = '<div class="carte"><div class="barre"><span class="sub">'+szCompte(rows.length, D.autoTotal, '${T("entrée")}', '${T("entrées")}')+'${T(" · conservation 30 jours")}</span><span class="pousse"></span>'
      + (D.peutModifier?'<button class="b" id="au-purge">${T("Purger anciens")}</button>':'')
      + '<button class="b" id="au-csv">${T("Exporter CSV")}</button></div>'
      + '<table class="tb"><thead><tr><th>${T("Date")}</th><th>${T("Automatisation")}</th><th>${T("Action / Détail")}</th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="3" class="vide">${T("Aucune action automatisée.")}</td></tr>';
    for (var i=0;i<rows.length;i++){ var l=rows[i];
      h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(l.ts))+'</td>'
        + '<td><span class="pill" style="background:var(--v06);color:var(--tx-c3cede)">'+esc(SECT[l.section]||l.section||'—')+'</span></td>'
        + '<td>'+esc(l.action||'—')+'</td></tr>';
    }
    h += '</tbody></table></div>';
    corps.innerHTML = h;
    /* ⚠⚠ CES DEUX BOUTONS APPELAIENT LES OPS << ACCES >>, ET RIEN NE LE DISAIT.
       << Exporter CSV >> rendait exportLogsCSV : TOUT le journal, colonnes
       Nom / Courriel / IP / Pays / Ville comprises. On demandait la liste des
       actions automatiques et on recevait les connexions du personnel — un
       fichier telecharge, pas un message d erreur. Et << Purger anciens >>
       annoncait << N conservee(s) >> avec le total de TOUT le journal, sur un
       onglet qui montre les seules automatisations.
       Les ops journal:purger:auto et journal:export:auto (4.58.0) comptent
       et exportent CE QUE CET ONGLET MONTRE. */
    var bp=document.getElementById('au-purge'); if (bp) bp.onclick=function(){ purger('journal:purger:auto'); };
    var bc=document.getElementById('au-csv'); if (bc) bc.onclick=function(){ exporter('journal:export:auto'); };
  }

  // ── Impressions ──────────────────────────────────────────────────
  var VIA = { agent:'${T("Agent (sans dialogue)")}', navigateur:'${T("Navigateur")}', bluetooth:'${T("Bluetooth")}' };
  function vuePrints(){
    var all = D.prints||[], kinds = D.printKinds||[];
    var rows = all;
    if (PF_TYPE!=='all') rows = rows.filter(function(r){ return (r.kind||'autre')===PF_TYPE; });
    if (PF_VIA!=='all') rows = rows.filter(function(r){ return (r.via||'agent')===PF_VIA; });
    var counts = {}, totalDocs = 0;
    for (var a=0;a<all.length;a++){ var k=all[a].kind||'autre'; counts[k]=(counts[k]||0)+(parseInt(all[a].qty,10)||1); if (all[a].ok!==false) totalDocs+=(parseInt(all[a].qty,10)||1); }
    /* ⚠ printsTotal VOYAGEAIT DEPUIS TOUJOURS ET N'ÉTAIT AFFICHÉ NULLE PART.
       La tuile disait « 512 travaux » en comptant les lignes reçues — c'est-à-dire
       le plafond de 500 dès qu'il mord, jamais le vrai nombre des trente jours.
       ⚠ Les DOCUMENTS, eux, restent comptés sur ce qui est là : on ne peut pas
       additionner les copies d'un travail qu'on n'a pas reçu. Un nombre qu'on ne
       peut pas connaître ne s'invente pas — il se laisse tel quel. */
    var kpis = '<div class="kpis"><div class="kpi"><div class="v">'+(D.printsTotal||all.length)+'</div><div class="l">travaux (30 j)</div></div>'
      + '<div class="kpi"><div class="v">'+totalDocs+'</div><div class="l">${T("documents imprimés")}</div></div></div>';
    var kLbl = {}; for (var z=0;z<kinds.length;z++) kLbl[kinds[z].key]=kinds[z].label;
    var typeOpts = '<option value="all"'+(PF_TYPE==='all'?' selected':'')+'>${T("Tous les types")}</option>';
    for (var t=0;t<kinds.length;t++) typeOpts += '<option value="'+esc(kinds[t].key)+'"'+(PF_TYPE===kinds[t].key?' selected':'')+'>'+esc(kinds[t].label)+'</option>';
    var viaKeys = ['all','agent','navigateur','bluetooth'];
    var viaOpts = ''; for (var v=0;v<viaKeys.length;v++) viaOpts += '<option value="'+viaKeys[v]+'"'+(PF_VIA===viaKeys[v]?' selected':'')+'>'+(viaKeys[v]==='all'?'${T("Toutes les voies")}':VIA[viaKeys[v]])+'</option>';

    var h = kpis + '<div class="carte"><div class="barre">'
      + '<select class="t" id="p-type" aria-label="${T("Filtrer par type de document")}">'+typeOpts+'</select>'
      + '<select class="t" id="p-via" aria-label="${T("Filtrer par voie d’impression")}">'+viaOpts+'</select><span class="pousse"></span>'
      + '<span class="sub">${T("Rétention 30 jours")}</span>'
      + (D.peutModifier?'<button class="b" id="p-purge">${T("Appliquer la purge")}</button>':'')
      + '<button class="b" id="p-csv">${T("Exporter CSV")}</button></div>'
      + '<table class="tb"><thead><tr><th>${T("Date")}</th><th>${T("Type")}</th><th>${T("Document")}</th><th>${T("Qté")}</th><th>${T("Imprimante")}</th><th>${T("Par")}</th><th>${T("État")}</th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="7" class="vide">'+(all.length?'${T("Aucune impression ne correspond à ces filtres.")}':'${T("Aucune impression depuis 30 jours.")}')+'</td></tr>';
    for (var i=0;i<rows.length;i++){ var r=rows[i];
      h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(r.at))+'</td>'
        + '<td><span class="pill" style="background:var(--v06);color:var(--tx-c3cede)">'+esc(r.kindLabel||r.kind)+'</span></td>'
        + '<td>'+esc(r.label||'—')+(r.size?'<div class="sub">'+esc(r.size)+(r.dpi?' · '+esc(r.dpi)+' dpi':'')+'</div>':'')+'</td>'
        + '<td style="text-align:center"><strong>'+esc(r.qty||1)+'</strong></td>'
        + '<td>'+esc(r.printer||'—')+'<div class="sub">'+esc(VIA[r.via]||r.via||'')+'</div></td>'
        + '<td class="sub">'+esc(r.who||'—')+(r.poste?'<div class="sub">poste '+esc(r.poste)+'</div>':'')+'</td>'
        + '<td>'+(r.ok===false?'<span class="pill err" title="'+esc(r.note||'')+'">${T("Échec")}</span>':'<span class="pill bon">${T("Imprimé")}</span>')+'</td></tr>';
    }
    h += '</tbody></table></div>';
    corps.innerHTML = h;
    var pt=document.getElementById('p-type'); if (pt) pt.onchange=function(){ PF_TYPE=this.value; vuePrints(); };
    var pv=document.getElementById('p-via'); if (pv) pv.onchange=function(){ PF_VIA=this.value; vuePrints(); };
    var pp=document.getElementById('p-purge'); if (pp) pp.onclick=function(){ purger('journal:purger:prints'); };
    var pc=document.getElementById('p-csv'); if (pc) pc.onclick=function(){ exporter('journal:export:prints'); };
  }

  // ── SMS (#7 Lot 7b-2 — lecture serveur) ──────────────────────────
  function vueSms(){
    if (SMS_D===null){
      corps.innerHTML='<div class="vide charge">${T("Lecture des SMS…")}</div>'; OCCUPE=true;
      appeler('journal:sms',[]).then(function(r){ OCCUPE=false;
        if (r&&r.ok){ SMS_D=r.sms||[]; if (ONGLET==='sms') vueSms(); }
        else { SMS_D=[]; if (ONGLET==='sms') corps.innerHTML='<div class="carte"><div class="vide m-'+((r&&r.motif)||'echec')+'">'+expliquer(r)+'</div></div>'; dire('${T("Échec : ")}'+expliquer(r), 'err'); } });
      return;
    }
    var rows = SMS_D;
    var h = '<div class="note">ℹ ${T("Les SMS reçus et envoyés (Twilio). Leur gestion complète (répondre, marquer lu, supprimer) reste dans ")}<b>${T("Communications → Téléphonie")}</b>.</div>'
      + '<div class="carte"><div class="barre"><span class="sub">'+rows.length+'${T(" message(s)")}</span><span class="pousse"></span><button class="b" id="sms-reload"><span class="ic">🔄</span> ${T("Actualiser")}</button></div>'
      + '<table class="tb"><thead><tr><th>${T("Date")}</th><th>${T("Sens")}</th><th>${T("De")}</th><th>${T("À")}</th><th>${T("Message")}</th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="5" class="vide">${T("Aucun SMS.")}</td></tr>';
    for (var i=0;i<rows.length;i++){ var s=rows[i]; var ent=(s.direction==='inbound');
      h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(s.date))+'</td>'
        + '<td><span class="pill" style="background:'+(ent?'rgba(14,165,233,.18)':'rgba(22,163,74,.2)')+';color:'+(ent?'var(--tx-bleu)':'var(--tx-ok2)')+'">'+(ent?'${T("⬇ Reçu")}':'${T("⬆ Envoyé")}')+'</span></td>'
        + '<td class="mono">'+esc(s.from||'—')+'</td><td class="mono">'+esc(s.to||'—')+'</td>'
        + '<td>'+esc(s.body||'')+'</td></tr>';
    }
    h += '</tbody></table></div>';
    corps.innerHTML = h;
    var rl=document.getElementById('sms-reload'); if (rl) rl.onclick=function(){ SMS_D=null; vueSms(); };
  }

  /* ══ JOURNAL D'ENVOI (venu de sa fenêtre propre, 2026-09-13) ═══════════════
     ⚠⚠ C'EST LA SEULE PIÈCE qui permette de répondre à « je n'ai jamais reçu
     votre courriel ». Les échecs sont donc comptés à part et gardent leur
     message d'erreur : un journal qui ne montrerait que les succès ne servirait
     à rien le jour où ça rate. */
  function vueEnvois(){
    if (ENV_D===null){
      corps.innerHTML='<div class="vide charge">${T("Lecture du journal d’envoi…")}</div>'; OCCUPE=true;
      appeler('journal:liste',[]).then(function(r){ OCCUPE=false;
        if (r&&r.ok){ ENV_D=r; if (ONGLET==='envois') vueEnvois(); }
        else {
          ENV_D=false;
          /* ⚠ LE REFUS EST EXPLIQUE, PAS AVALE. Ce journal exige le droit
             newsletter, que quelqu un qui ouvre les Journaux peut ne pas
             avoir : un onglet vide sans raison ferait croire a une panne. */
          if (ONGLET==='envois') corps.innerHTML='<div class="carte"><div class="vide m-'+((r&&r.motif)||'echec')+'">'+expliquer(r)+'</div></div>';
          dire('${T("Échec : ")}'+expliquer(r), 'err');
        } });
      return;
    }
    if (ENV_D===false){ corps.innerHTML='<div class="carte"><div class="vide">${T("Journal d’envoi indisponible.")}</div></div>'; return; }

    var q = ENV_Q.trim().toLowerCase();
    var rows = (ENV_D.lignes || []).filter(function(l){
      if (ENV_ECHECS && l.envoye) return false;
      if (!q) return true;
      return (String(l.courriel) + ' ' + String(l.reference)).toLowerCase().indexOf(q) !== -1;
    });

    var h = '<div class="kpis">'
      + '<div class="kpi"><div class="l">${T("Envois enregistrés")}</div><div class="v">'+(ENV_D.total||0)+'</div></div>'
      + '<div class="kpi"><div class="l">${T("Partis")}</div><div class="v" style="color:var(--tx-ok2)">'+(ENV_D.envoyes||0)+'</div></div>'
      + '<div class="kpi"><div class="l">${T("Échecs")}</div><div class="v" style="color:var(--tx-err2)">'+(ENV_D.echecs||0)+'</div></div>'
      + '</div>'
      + '<div class="carte"><div class="barre">'
      + '<input aria-label="${T("Adresse ou campagne")}" class="t" type="search" id="env-q" placeholder="${T("Adresse ou campagne…")}" value="'+esc(ENV_Q)+'" style="flex:1;min-width:200px">'
      + '<button class="mini'+(ENV_ECHECS?' actif':'')+'" id="env-echecs">${T("Échecs seulement")}</button>'
      + '<span class="pousse"></span>'
      + '<span class="sub">'+rows.length+' '+(rows.length>1?'${T("lignes")}':'${T("ligne")}')+'</span>'
      + (ENV_D.peutModifier && (ENV_D.total||0)
          ? '<button class="b dgr" id="env-vider">'+(ENV_ARME?'${T("Confirmer ?")}':'${T("Effacer le journal")}')+'</button>' : '')
      + '<button class="b" id="env-reload"><span class="ic">🔄</span> ${T("Actualiser")}</button></div>';

    if (!rows.length) {
      h += '<div class="vide">'+((ENV_Q||ENV_ECHECS)?'${T("Rien ne correspond.")}':'${T("Aucun envoi enregistré.")}')+'</div>';
    } else {
      h += '<table class="tb"><thead><tr><th>${T("Date")}</th><th>${T("Genre")}</th><th>${T("Référence")}</th>'
        + '<th>${T("Destinataire")}</th><th>${T("Résultat")}</th><th>${T("Détail")}</th></tr></thead><tbody>';
      for (var i=0;i<rows.length;i++){ var l=rows[i];
        h += '<tr><td class="mut" style="white-space:nowrap">'+esc(l.date)+'</td>'
          + '<td><span class="pill" style="background:var(--v10);color:var(--tx2)">'+esc(l.genre)+'</span></td>'
          + '<td>'+esc(l.reference || '—')+'</td>'
          + '<td>'+esc(l.courriel)+'</td>'
          + '<td><span class="pill" style="background:'+(l.envoye?'rgba(22,163,74,.2)':'rgba(220,38,38,.18)')
          +   ';color:'+(l.envoye?'var(--tx-ok2)':'var(--tx-err2)')+'">'
          + (l.envoye ? '${T("Parti")}' : '${T("Échec")}')+'</span>'
          + (l.test ? ' <span class="pill" style="background:rgba(234,179,8,.18);color:var(--tx-att)">test</span>' : '')+'</td>'
          /* Le detail porte l identifiant Resend (preuve d envoi) OU le message
             d erreur : c est ce qui permet de repondre a << je n ai rien recu >>. */
          + '<td class="sub" title="'+esc(l.detail || '')+'">'+esc(l.detail || '—')+'</td></tr>';
      }
      h += '</tbody></table>';
    }
    h += '</div>';
    corps.innerHTML = h;

    /* ⚠ LE CHAMP GARDE LE CURSEUR : redessiner a chaque frappe le remettrait au
       debut, et l on taperait << marie >> pour obtenir << eiram >>. */
    var qe=document.getElementById('env-q');
    if (qe) qe.oninput=function(){
      ENV_Q=this.value; var pos=this.selectionStart; ENV_ARME=false; vueEnvois();
      var n=document.getElementById('env-q'); if (n){ n.focus({preventScroll:true}); try { n.setSelectionRange(pos,pos); } catch(e){} }
    };
    var be=document.getElementById('env-echecs'); if (be) be.onclick=function(){ ENV_ECHECS=!ENV_ECHECS; ENV_ARME=false; vueEnvois(); };
    var rl=document.getElementById('env-reload'); if (rl) rl.onclick=function(){ ENV_D=null; ENV_ARME=false; vueEnvois(); };
    var bv=document.getElementById('env-vider');
    if (bv) bv.onclick=function(){
      if (!ENV_ARME){
        ENV_ARME=true; vueEnvois();
        /* Une phrase ENTIERE dans un seul litteral. */
        dire('${T("Cliquez « Confirmer ? » — le journal est effacé, et avec lui la preuve de ce qui est parti. Les envois eux-mêmes ne sont pas annulés.")}', 'att');
        return;
      }
      ENV_ARME=false;
      appeler('journal:vider',[]).then(function(r){
        if (!r.ok){ dire(expliquer(r), 'err'); vueEnvois(); return; }
        /* Deux formes ENTIERES : un fragment recolle ne se traduit pas. */
        dire(r.efface + (r.efface > 1 ? '${T(" entrées effacées.")}' : '${T(" entrée effacée.")}'), 'bon');
        ENV_D=null; vueEnvois();
      });
    };
  }

  // ── Accès comptables (#7 Lot 7b-2 — reutilise liens:journal) ─────
  var CANAUX = { telechargement:'${T("Installation")}', comptable:'${T("Comptable")}', courriel:'${T("Courriel")}' };
  var EVEN = { visite:'${T("Visite")}', refuse:'${T("Refusé")}', ouvert:'${T("Ouvert")}', classeur:'${T("Classeur ouvert")}', cree:'${T("Créé")}', revoque:'${T("Révoqué")}', telecharge:'${T("Téléchargé")}', envoye:'${T("Courriel envoyé")}' };
  /* ══ ACCÈS AUX LIENS — LE JOURNAL UNIFIÉ (#31) ═══════════════════════════
     Sa demande : « les journaux des accès lien devraient aussi être unifiés
     sur journal ». Ils l'étaient déjà à moitié — cet onglet lisait bien TOUS
     les canaux — mais il portait le nom « Accès comptables », qui n'en
     désigne qu'un tiers, et la fenêtre Liens gardait son propre onglet.

     🔎 ET IL NE MONTRAIT RIEN. Le serveur répond « evenements » ; on lisait
     « r.journal », une clé qui n'existe pas. Cet onglet affichait donc
     « Aucun événement » DEPUIS TOUJOURS, sans la moindre erreur. Le même
     genre de faute qu'au sélecteur de photothèque : un nom de clé, et l'écran
     est mort en silence. */
  var CP_CANAL = '', CP_PAGE = 0, CP_PARPAGE = 25;
  var AC_PAGE = 0, AC_PARPAGE = 25;   // onglet Accès

  function vueComptable(){
    if (COMPTA_D===null){
      corps.innerHTML='<div class="vide charge">${T("Lecture du journal des accès…")}</div>'; OCCUPE=true;
      appeler('liens:journal',[{canal:CP_CANAL}]).then(function(r){ OCCUPE=false;
        if (r&&r.ok){ COMPTA_D=r.evenements||[]; if (ONGLET==='comptable') vueComptable(); }
        else { COMPTA_D=[]; if (ONGLET==='comptable') corps.innerHTML='<div class="carte"><div class="vide m-'+((r&&r.motif)||'echec')+'">'+expliquer(r)+'</div></div>'; dire('${T("Échec : ")}'+expliquer(r), 'err'); } });
      return;
    }
    var rows = COMPTA_D;
    var pages = Math.max(1, Math.ceil(rows.length / CP_PARPAGE));
    if (CP_PAGE >= pages) CP_PAGE = pages - 1;
    if (CP_PAGE < 0) CP_PAGE = 0;
    var vue = rows.slice(CP_PAGE * CP_PARPAGE, CP_PAGE * CP_PARPAGE + CP_PARPAGE);
    var h = ''
      + '<div class="carte"><div class="barre">'
      + '<select id="cp-canal"><option value="">${T("Tous les canaux")}</option>'
      + '<option value="installation"' + (CP_CANAL==='installation'?' selected':'') + '>${T("Installation")}</option>'
      + '<option value="comptable"' + (CP_CANAL==='comptable'?' selected':'') + '>${T("Comptable")}</option>'
      + '<option value="courriel"' + (CP_CANAL==='courriel'?' selected':'') + '>${T("Courriel")}</option>'
      + '</select>'
      + '<span class="sub">'+rows.length+'${T(" événement(s)")}</span><span class="pousse"></span>'
      + '<button class="b" id="cp-reload"><span class="ic">🔄</span> ${T("Actualiser")}</button></div>'
      + '<div class="liste"><table class="tb"><thead><tr><th>${T("Quand")}</th><th>${T("Canal")}</th><th>${T("Événement")}</th><th>IP</th><th>${T("Lien")}</th><th>${T("Détail")}</th></tr></thead><tbody>';
    if (!vue.length) h += '<tr><td colspan="6" class="vide">${T("Aucun événement.")}</td></tr>';
    for (var i=0;i<vue.length;i++){ var e=vue[i];
      h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(e.au))+'</td>'
        + '<td>'+esc(CANAUX[e.canal]||e.canal||'—')+'</td><td>'+esc(EVEN[e.genre]||e.genre||'—')+'</td>'
        + '<td class="mono">'+esc(e.ip||'—')+'</td><td class="mono">'+esc((e.lienId||'').slice(0,8))+'</td>'
        + '<td>'+esc(e.detail||'')+(e.qui?' · '+esc(e.qui):'')+'</td></tr>';
    }
    h += '</tbody></table></div>';
    if (pages > 1) {
      h += '<div class="pagi"><button class="mini" id="cp-prec"'+(CP_PAGE<=0?' disabled':'')+'>${T("‹ Précédent")}</button>'
        + '<span>Page '+(CP_PAGE+1)+' sur '+pages+'</span>'
        + '<button class="mini" id="cp-suiv"'+(CP_PAGE>=pages-1?' disabled':'')+'>${T("Suivant ›")}</button></div>';
    }
    h += '</div>';
    corps.innerHTML = h;
    var rl=document.getElementById('cp-reload'); if (rl) rl.onclick=function(){ COMPTA_D=null; vueComptable(); };
    var cc=document.getElementById('cp-canal');
    if (cc) cc.onchange=function(){ CP_CANAL=cc.value; CP_PAGE=0; COMPTA_D=null; vueComptable(); };
    var cpp=document.getElementById('cp-prec');
    if (cpp) cpp.onclick=function(){ CP_PAGE=Math.max(0,CP_PAGE-1); vueComptable(); };
    var cps=document.getElementById('cp-suiv');
    if (cps) cps.onclick=function(){ CP_PAGE=CP_PAGE+1; vueComptable(); };
    // ⚠ Mesure APRES le dessin : la hauteur reelle n existe qu une fois le
    // tableau dans la page. Le socle ne rappelle que si le compte a change.
    szAutoPagination('.liste', function(n){ CP_PARPAGE=n; CP_PAGE=0; vueComptable(); });
  }

  // ── Recherches sans résultat (#7 Lot 7b) ─────────────────────────
  function vueRecherchesRatees(){
    var rows = D.recherches||[];
    var h = ''
      + '<div class="carte"><div class="barre"><span class="sub">'+szCompte(rows.length, D.recherchesTotal, '${T("terme distinct")}', '${T("termes distincts")}')+'</span></div>'
      + '<table class="tb"><thead><tr><th>${T("Terme cherché")}</th><th style="text-align:center">${T("Fois")}</th><th>${T("Dernière fois")}</th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="3" class="vide">${T("Aucune recherche sans résultat.")}</td></tr>';
    for (var i=0;i<rows.length;i++){ var x=rows[i];
      h += '<tr><td><strong>'+esc(x.q)+'</strong></td><td style="text-align:center">'+esc(x.fois||0)+'</td><td class="mut">'+esc(x.derniere||'—')+'</td></tr>';
    }
    h += '</tbody></table></div>';
    corps.innerHTML = h;
  }

  /* ── ERREURS JAVASCRIPT DES CLIENTES ───────────────────────────────
     Ses mots : « Quand une erreur JavaScript survient chez une cliente,
     personne ne l apprend — vous le decouvrez si elle vous ecrit. »

     ⚠ REGROUPEES, ET C EST LA CONDITION POUR QUE CA SERVE. Sa consigne :
     « mille fois la meme erreur = une ligne + compteur, sinon on cesse de le
     lire ». Un journal non regroupe se remplit en une apres-midi, devient
     illisible, donc inutile — c est-a-dire PIRE qu absent, parce qu on croit
     l avoir. Le regroupement se fait au serveur ; ici on affiche le compteur.

     ⚠ LA VERSION DU FICHIER EST MONTREE (le ?v=). Sa demande explicite : sans
     elle, on cherche un defaut dans du code qui n est plus servi. */
  function vueJsErreurs(){
    var rows = D.jsErreurs || [];
    var neuves = D.jsErreursNeuves || 0;
    var h = ''
      + '<div class="carte"><div class="barre">'
      /* ⚠ jsErreursTotal N'ÉTAIT AFFICHÉ NULLE PART, et la liste est coupée à
         300 : on lisait « 300 défauts distincts » sur un site qui en avait mille.
         La pastille des non vus, elle, se compte désormais sur TOUT — sinon elle
         cessait de monter au moment exact où la situation empirait. */
      +   '<span class="sub">' + szCompte(rows.length, D.jsErreursTotal, '${T("défaut distinct")}', '${T("défauts distincts")}')
      +     (neuves ? ' · <b style="color:var(--tx-att)">' + neuves + ' non vu(s)</b>' : '') + '</span>'
      +   (D.peutModifier && neuves ? '<button class="mini" id="js-vues">${T("Tout marquer comme vu")}</button>' : '')
      +   (D.peutModifier && rows.length
            ? '<button class="mini" id="js-purge"' + (JS_ARME ? ' style="border-color:rgba(239,68,68,.6);color:var(--tx-err)"' : '') + '>'
              + (JS_ARME ? '${T("Confirmer — vider définitivement")}' : '${T("Vider")}') + '</button>'
            : '')
      + '</div>'
      + '<table class="tb"><thead><tr>'
      +   '<th>${T("Erreur")}</th><th>${T("Fichier")}</th><th style="text-align:center">${T("Fois")}</th>'
      +   '<th>${T("Où")}</th><th>${T("Dernière fois")}</th>'
      + '</tr></thead><tbody>';
    if (!rows.length) {
      h += '<tr><td colspan="5" class="vide">${T("Aucune erreur rapportée.")} '
        + '${T("C’est la bonne nouvelle — mais elle ne vaut que depuis la mise en place de ce journal.")}</td></tr>';
    }
    for (var i = 0; i < rows.length; i++) {
      var x = rows[i];
      var genre = x.genre === 'ressource' ? '${T("chargement")}'
                : x.genre === 'promesse' ? '${T("⏳ promesse")}' : '${T("erreur")}';
      h += '<tr' + (x.vu ? ' style="opacity:.62"' : '') + '>'
        + '<td><strong>' + esc(x.message) + '</strong>'
        +   '<div class="mut" style="font-size:.72rem">' + genre
        +     (x.pile ? ' · <span title="' + esc(x.pile) + '">pile disponible (survolez)</span>' : '') + '</div></td>'
        /* ⚠ LE FICHIER PORTE SON ?v= : c est la VERSION servie au moment du
           plantage. Sans elle, on relit un fichier qui a change depuis. */
        + '<td class="mut" style="font-size:.76rem;word-break:break-all">' + (x.fichier ? esc(x.fichier) : '—')
        +   (x.ligne ? '<br>ligne ' + esc(x.ligne) + (x.colonne ? ':' + esc(x.colonne) : '') : '') + '</td>'
        + '<td style="text-align:center"><b>' + esc(x.n || 1) + '</b></td>'
        + '<td class="mut" style="font-size:.76rem">'
        +   ((x.routes && x.routes.length) ? x.routes.map(esc).join('<br>') : '—') + '</td>'
        + '<td class="mut" style="font-size:.76rem;white-space:nowrap">' + esc(String(x.dernier || '').slice(0, 16).replace('T', ' '))
        +   (x.premier && x.premier !== x.dernier
                ? '<br><span style="font-size:.7rem">depuis ' + esc(String(x.premier).slice(0, 10)) + '</span>' : '')
        +   (x.agent ? '<br><span style="font-size:.7rem" title="' + esc(x.agent) + '">navigateur</span>' : '') + '</td>'
        + '</tr>';
    }
    h += '</tbody></table></div>';
    corps.innerHTML = h;
    var bv = document.getElementById('js-vues');
    if (bv) bv.onclick = function(){ jsVues(); };
    var bp = document.getElementById('js-purge');
    if (bp) bp.onclick = function(){ jsPurger(); };
  }

  function jsVues(){
    if (OCCUPE) return; OCCUPE = true; dire('${T("Marquage…")}');
    appeler('journal:jsErreursVues', [null]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) recharger((r.n || 0) + ' ${T("erreur(s) marquée(s) comme vue(s).")}', 'bon');
      else dire('${T("Échec : ")}' + expliquer(r), 'err');
    });
  }
  /* ⚠⚠ VIDER EFFACE POUR TOUT LE MONDE, ET LES COMPTEURS AVEC — c est pour ca
     que le bouton s ARME au lieu d agir tout de suite. Les autres purges de
     cette fenetre partent au premier clic, et c est juste : elles ne font
     qu appliquer une retention deja ecrite. Ici, le compteur d une erreur
     ancienne est justement ce qui dit qu elle n a pas cesse, et il ne se
     reconstitue pas. Un clic de trop coute une information qu on ne peut pas
     retrouver.
     ⚠ Le bouton arme se DESARME en changeant d onglet (JS_ARME est remis a faux
     par la fonction rendre), sinon il resterait charge sans qu on s en
     souvienne.
     ⚠ AUCUN ACCENT GRAVE ICI : ce commentaire vit dans un gabarit. */
  function jsPurger(){
    if (OCCUPE) return;
    if (!JS_ARME) {
      JS_ARME = true;
      vueJsErreurs();
      dire('${T("Cliquez de nouveau pour vider — les compteurs ne se reconstituent pas.")}', 'att');
      return;
    }
    JS_ARME = false; OCCUPE = true; dire('${T("Vidage…")}');
    appeler('journal:jsErreursPurger', []).then(function(r){
      OCCUPE = false;
      if (r && r.ok) recharger('${T("Journal vidé — ")}' + (r.efface || 0) + ' ${T("effacée(s).")}', 'bon');
      else dire('${T("Échec : ")}' + expliquer(r), 'err');
    });
  }

  // ── Actions ──────────────────────────────────────────────────────
  function basculerStats(){
    if (OCCUPE) return; OCCUPE=true;
    appeler('journal:stats',[!D.statsHidden]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ D.statsHidden=r.statsHidden; vueAcces(); } else dire('${T("Échec : ")}'+expliquer(r), 'err'); });
  }
  function purger(op){
    if (OCCUPE) return; OCCUPE=true; dire('${T("Purge…")}');
    appeler(op,[]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ recharger('${T("Purge faite — ")}'+(r.conserves||0)+' ${T("conservée(s).")}', 'bon'); } else dire('${T("Échec : ")}'+expliquer(r), 'err'); });
  }
  function exporter(op){
    if (OCCUPE) return; OCCUPE=true; dire('${T("Préparation du document…")}');
    appeler(op,[]).then(function(r){ OCCUPE=false;
      dire(r&&r.ok ? '${T("Document téléchargé depuis la fenêtre principale.")}' : '${T("Échec : ")}'+expliquer(r), r&&r.ok?'bon':'err'); });
  }
  function rendre(){
    tabs();
    boutonVerrous();
    if (ONGLET==='recherche') vueRecherche();
    else if (ONGLET==='automatisations') vueAuto();
    else if (ONGLET==='envois') vueEnvois();
    else if (ONGLET==='impressions') vuePrints();
    else if (ONGLET==='sms') vueSms();
    else if (ONGLET==='comptable') vueComptable();
    else if (ONGLET==='recherches') vueRecherchesRatees();
    else if (ONGLET==='jserreurs') vueJsErreurs();
    else { JS_ARME = false; vueAcces(); }
  }
  function recharger(msg, cl){
    appeler('journal:donnees',[]).then(function(r){ if (r&&r.ok){ D=r; rendre(); } if (msg) dire(msg, cl); });
  }
  /* ⚠⚠ LE REPLI DU MARKETING — 2026-09-14, #106b, ET SANS LUI L'ENTREE EST MORTE.
     Depuis que le menu ouvre les Journaux a << newsletter >> autant qu a
     << staff >>, quelqu un qui ne fait QUE du marketing arrive ici. Or
     journal:donnees exige la lecture de securite : il lui repond << droit >>,
     et la ligne d avant sortait SANS jamais appeler rendre() — donc sans
     tabs(). Cette personne voyait une fenetre vide, pas meme un onglet, et son
     PROPRE journal d envoi restait inatteignable. Une entree de menu qui ouvre
     le vide est pire que pas d entree du tout.
     ⚠ ON NE MONTRE QUE << Journal d envoi >>, et c est sa regle : invisible
     plutot que grise. Les huit autres onglets sont gardes par _secLire() ou
     staff ; les afficher pour qu ils refusent un a un apprendrait a l equipe
     qu un pouvoir existe et qu elle ne l a pas.
     ⚠ vueEnvois() NE LIT PAS D — elle ne depend que de journal:liste, qui exige
     newsletter. Le repli tient donc debout sans D.
     ⚠ SEUL LE MOTIF << droit >> replie. Une panne de reseau ou une session
     perdue doit se dire telle quelle : la deguiser en question de permission
     enverrait chercher un droit qui n a jamais manque. */
  function replierSurEnvois(){
    ONGLETS = [ ['envois','${T("Journal d’envoi")}'] ];
    ONGLET = 'envois';
    rendre();
    dire('');
  }
  function charger(){
    dire('${T("Chargement…")}');
    appeler('journal:donnees',[]).then(function(r){
      if (!r||!r.ok){
        if (r && r.motif === 'droit') { replierSurEnvois(); return; }
        corps.innerHTML='<div class="vide m-'+((r&&r.motif)||'echec')+'">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; rendre(); dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageJournaux };
