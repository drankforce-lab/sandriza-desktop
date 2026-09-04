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

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.55rem 1.1rem;
  border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.onglets{flex:0 0 auto;display:flex;gap:.1rem;flex-wrap:wrap;padding:.35rem 1rem 0;border-bottom:1px solid var(--v08)}
.onglets button{font:inherit;font-size:.82rem;white-space:nowrap;background:none;border:none;color:var(--tx2);padding:.5rem .85rem;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
.onglets button.on{color:var(--tx-or);border-bottom-color:#c9a97e;font-weight:700}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.carte{background:var(--v03);border:1px solid var(--v08);border-radius:12px;padding:1rem 1.1rem;margin:0 0 1.1rem}
.barre{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin:0 0 .9rem}
.barre .pousse{flex:1}
.stat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.8rem;margin:0 0 1rem}
@media(max-width:820px){.stat-grid{grid-template-columns:repeat(2,1fr)}}
.stat{background:var(--v03);border:1px solid var(--v08);border-radius:11px;padding:.7rem .85rem}
.stat .l{font-size:.7rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.04em}
.stat .v{font:700 1.4rem/1.1 Georgia,serif;margin-top:.2rem}
select.t{background:#0f1724;border:1px solid #2b3444;border-radius:8px;color:var(--tx);font:inherit;font-size:.82rem;padding:.4rem .6rem}
.b{font:inherit;font-size:.8rem;border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;background:var(--v05);color:var(--tx);cursor:pointer;white-space:nowrap}
.b:hover{background:var(--v08)}
.b.dgr{color:var(--tx-err2);border-color:rgba(248,113,113,.35)}
.b.dgr:hover{background:rgba(248,113,113,.16)}
table.tb{width:100%;border-collapse:collapse}
table.tb th{text-align:left;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);padding:.45rem .6rem;border-bottom:1px solid var(--v11);white-space:nowrap}
table.tb td{padding:.5rem .6rem;border-bottom:1px solid var(--v05);font-size:.82rem;vertical-align:top}
.pill{display:inline-block;font-size:.66rem;font-weight:700;padding:2px 7px;border-radius:99px;white-space:nowrap}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
.mut{color:var(--tx2)}.sub{font-size:.72rem;color:var(--tx-gris)}
.kpis{display:flex;gap:.6rem;flex-wrap:wrap;margin:0 0 1rem}
.kpi{background:var(--v03);border:1px solid var(--v08);border-radius:10px;padding:.55rem .8rem;min-width:110px}
.kpi .v{font:700 1.2rem/1 Georgia,serif}.kpi .l{font-size:.7rem;color:var(--tx2)}
.note{background:var(--v03);border:1px solid var(--v11);border-radius:9px;padding:.8rem 1rem;font-size:.82rem;color:var(--tx2);line-height:1.55;margin:0 0 1rem}
.note b{color:var(--tx)}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:#0b1220}
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
  const ONGLET0 = (['recherche','acces','automatisations','impressions','sms','comptable','recherches','jserreurs'].indexOf(brut) >= 0) ? brut : 'acces';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Journaux — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.journaux}</span><h1>Journaux</h1></div>
<div class="onglets" id="onglets"></div>
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
  // Aller directement à un onglet quand la fenêtre est DÉJÀ ouverte (lien de
  // retour depuis une autre fenêtre — #7 7b-2c).
  window.szAllerOnglet = function(t){
    if (['recherche','acces','automatisations','impressions','sms','comptable','recherches','jserreurs'].indexOf(String(t||'')) < 0) return;
    ONGLET = String(t); rendre();
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  // << 300 sur 5 000 >> quand la lecture est plafonnee, le compte simple sinon.
  function cpt(n, tot){ return (tot && tot > n) ? (n + ' sur ' + tot) : String(tot || n); }
  var ongletsEl = document.getElementById('onglets');
  var D = null, OCCUPE = false;
  // Bouton « Vider » du journal des erreurs : arme au premier clic, agit au
  // second. Desarme en changeant d onglet (voir la fonction rendre).
  var JS_ARME = false;
  var ONGLET = '${ONGLET0}';
  var PF_TYPE = 'all', PF_VIA = 'all';   // filtres de l'onglet Impressions
  var RQ = '', RRES = null;   // recherche inter-journaux : terme + résultats
  var RQINIT = '${RQINIT0}';  // terme à lancer automatiquement à l'ouverture (banc)

  var ONGLETS = [ ['recherche','🔎 Recherche'], ['acces','🔐 Accès'], ['automatisations','🤖 Automatisations'], ['impressions','🖨 Impressions'], ['sms','💬 SMS'], ['comptable','🔗 Accès aux liens'], ['recherches','❓ Sans résultat'], ['jserreurs','⚠ Erreurs des clients'] ];
  var SMS_D = null, COMPTA_D = null;   // journaux SERVEUR (chargés à la visite de l'onglet)

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function fdate(ts){ if (!ts) return '—'; try { return new Date(ts).toLocaleString('fr-CA'); } catch(e){ return '—'; } }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès aux journaux.',
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
    b.textContent = '🔓 Verrous';
    b.title = 'Qui tient une fiche en ce moment (ecran a part, en direct)';
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
      + '<input class="t" id="r-q" placeholder="Rechercher dans TOUS les journaux (IP, nom, courriel, no de commande, imprimante…)" value="'+esc(RQ)+'" style="flex:1;min-width:220px">'
      + '<button class="b" id="r-go"><span class="ic">🔎</span> Rechercher</button></div>'
      + '<div class="sub">Le terme est cherché dans tous les champs de chaque journal (accès, automatisations, impressions). Minimum 2 caractères.</div>'
      + '<div id="r-res">'+(RRES ? resultatsHtml() : '<div class="vide">Tapez un terme puis « Rechercher ».</div>')+'</div></div>';
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
    if (OCCUPE) return; OCCUPE=true; dire('Recherche dans tous les journaux…');
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
          if (sm.length){ groupes.push({ cle:'sms', label:'💬 SMS', onglet:'sms', total:sm.length, entrees:sm.slice(0,200) }); total+=sm.length; }
        }
        if (cpR && cpR.ok){
          var cp=(cpR.journal||[]).filter(function(e){ return matchAny(ql,[e.canal,e.genre,e.ip,e.lienId,e.detail,e.qui,e.au]); })
            .map(function(e){ return { au:e.au, canal:e.canal, genre:e.genre, ip:e.ip, lienId:e.lienId, detail:e.detail, qui:e.qui }; });
          if (cp.length){ groupes.push({ cle:'comptable', label:'🧾 Accès comptables', onglet:'comptable', total:cp.length, entrees:cp.slice(0,200) }); total+=cp.length; }
        }
        OCCUPE=false; RRES={ ok:true, q:RQ, total:total, groupes:groupes }; peindreResultats();
        dire(total?(total+' résultat(s) dans tous les journaux.'):'Aucun résultat.', 'bon');
      });
    }).catch(function(){ OCCUPE=false; dire('Échec de la recherche.', 'err'); });
  }
  function peindreResultats(){ var el=document.getElementById('r-res'); if (el) el.innerHTML=resultatsHtml(); brancherResultats(); }
  function resultatsHtml(){
    if (RRES && RRES.tropCourt) return '<div class="vide">Entrez au moins 2 caractères.</div>';
    var groupes = (RRES&&RRES.groupes)||[];
    if (!groupes.length) return '<div class="vide">Aucun résultat pour « '+esc(RRES?RRES.q:'')+' ».</div>';
    var h='';
    for (var g=0;g<groupes.length;g++){ var grp=groupes[g], e=grp.entrees||[];
      h += '<div class="barre" style="margin:.9rem 0 .3rem"><strong>'+esc(grp.label)+' <span class="mut">('+(grp.total||e.length)+')</span></strong>'
        + '<span class="pousse"></span><button class="b" data-goto="'+esc(grp.onglet)+'">Ouvrir cet onglet</button></div>';
      h += '<table class="tb"><tbody>';
      for (var i=0;i<e.length;i++){ var x=e[i];
        if (grp.cle==='acces'){
          var t=TYPE[x.type]||{bg:'var(--v05)',c:'#8fa1b8',l:x.type};
          h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(x.ts))+'</td>'
            + '<td><span class="pill" style="background:'+t.bg+';color:'+t.c+'">'+esc(t.l)+'</span></td>'
            + '<td>'+esc(x.nom||'—')+'<div class="sub">'+esc(x.email)+'</div></td>'
            + '<td class="mono">'+esc(x.ip||'—')+'</td><td>'+esc(x.pays||'')+'</td><td>'+esc(x.action||'')+'</td></tr>';
        } else if (grp.cle==='automatisations'){
          h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(x.ts))+'</td><td><span class="pill" style="background:var(--v05);color:var(--tx-gris2)">'+esc(SECT[x.section]||x.section||'—')+'</span></td><td>'+esc(x.action||'')+'</td></tr>';
        } else if (grp.cle==='recherches'){
          h += '<tr><td><strong>'+esc(x.q)+'</strong></td><td style="text-align:center">'+esc(x.fois||0)+' fois</td><td class="mut">'+esc(x.derniere||'—')+'</td></tr>';
        } else if (grp.cle==='sms'){
          var ent=(x.direction==='inbound');
          h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(x.date))+'</td><td>'+(ent?'⬇ Reçu':'⬆ Envoyé')+'</td><td class="mono">'+esc(x.from||'')+'</td><td class="mono">'+esc(x.to||'')+'</td><td>'+esc(x.body||'')+'</td></tr>';
        } else if (grp.cle==='comptable'){
          h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(x.au))+'</td><td>'+esc(CANAUX[x.canal]||x.canal||'')+'</td><td>'+esc(EVEN[x.genre]||x.genre||'')+'</td><td class="mono">'+esc(x.ip||'—')+'</td><td>'+esc(x.detail||'')+'</td></tr>';
        } else {
          h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(x.at))+'</td><td><span class="pill" style="background:var(--v05);color:var(--tx-gris2)">'+esc(x.kindLabel||x.kind)+'</span></td><td>'+esc(x.label||'—')+'</td><td>'+esc(x.printer||'')+'</td><td class="sub">'+esc(x.who||'')+'</td><td>'+(x.ok===false?'<span class="pill" style="background:rgba(220,38,38,.18);color:var(--tx-err2)">Échec</span>':'<span class="pill" style="background:rgba(22,163,74,.2);color:var(--tx-ok2)">Imprimé</span>')+'</td></tr>';
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
  var TYPE = {
    login_ok:{bg:'rgba(22,163,74,.2)',c:'#6ee7a0',l:'✓ Connexion'},
    login_fail:{bg:'rgba(220,38,38,.18)',c:'#fca5a5',l:'✗ Échec'},
    logout:{bg:'rgba(14,165,233,.18)',c:'#7dd3fc',l:'⏻ Déconnexion'},
    mfa_fail:{bg:'rgba(234,179,8,.18)',c:'#e6c14a',l:'⚠ MFA échoué'},
    mfa_timeout:{bg:'rgba(234,179,8,.18)',c:'#e6c14a',l:'⏱ MFA expiré'},
    action:{bg:'rgba(147,51,234,.18)',c:'#c4a6f7',l:'⚙ Action'},
    login_blocked_geo:{bg:'rgba(244,63,94,.18)',c:'#fda4af',l:'🌍 Bloqué (géo)'}
  };
  function drapeau(cc){ if (!cc||cc.length!==2) return ''; try { return String.fromCodePoint.apply(null,cc.toUpperCase().split('').map(function(x){return 127397+x.charCodeAt(0);})); } catch(e){ return ''; } }
  function vueAcces(){
    var st = D.stats||{}, rows = D.acces||[];
    var h = '';
    if (!D.statsHidden) h += '<div class="stat-grid">'
      + '<div class="stat"><div class="l">Connexions auj.</div><div class="v" style="color:var(--tx-ok2)">'+(st.loginOk||0)+'</div></div>'
      + '<div class="stat"><div class="l">Échecs auj.</div><div class="v" style="color:var(--tx-err2)">'+(st.loginFail||0)+'</div></div>'
      + '<div class="stat"><div class="l">Échecs MFA</div><div class="v" style="color:#e6c14a">'+(st.mfaFail||0)+'</div></div>'
      + '<div class="stat"><div class="l">Bloqués géo</div><div class="v" style="color:var(--tx-err2)">'+(st.geoBlocked||0)+'</div></div>'
      + '<div class="stat"><div class="l">IPs uniques</div><div class="v">'+(st.ips||0)+'</div></div>'
      + '</div>';
    h += '<div class="carte"><div class="barre"><span class="sub">'+(D.accesTotal||rows.length)+' entrée(s) · conservation 30 jours</span><span class="pousse"></span>'
      + '<button class="b" id="a-stats">'+(D.statsHidden?'Afficher les stats':'Masquer les stats')+'</button>'
      + (D.peutModifier?'<button class="b" id="a-purge">Purger anciens</button>':'')
      + '<button class="b" id="a-csv">Exporter CSV</button></div>'
      + '<div class="liste"><table class="tb"><thead><tr><th>Date</th><th>Type</th><th>Utilisateur</th><th>IP</th><th>Pays</th><th>Action</th></tr></thead><tbody>';
    /* ── PAGINATION AUTO (#31) ────────────────────────────────────────────
       Le journal des accès déversait ses trente jours d'un coup. Le nombre de
       lignes se MESURE maintenant sur la hauteur réelle de la fenêtre. */
    var apages = Math.max(1, Math.ceil(rows.length / AC_PARPAGE));
    if (AC_PAGE >= apages) AC_PAGE = apages - 1;
    if (AC_PAGE < 0) AC_PAGE = 0;
    var avue = rows.slice(AC_PAGE * AC_PARPAGE, AC_PAGE * AC_PARPAGE + AC_PARPAGE);
    if (!avue.length) h += '<tr><td colspan="6" class="vide">Aucun journal.</td></tr>';
    for (var i=0;i<avue.length;i++){ var l=avue[i]; var t=TYPE[l.type]||{bg:'var(--v05)',c:'#8fa1b8',l:l.type};
      h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(l.ts))+'</td>'
        + '<td><span class="pill" style="background:'+t.bg+';color:'+t.c+'">'+esc(t.l)+'</span></td>'
        + '<td>'+esc(l.nom||'—')+'<div class="sub">'+esc(l.email)+'</div></td>'
        + '<td class="mono">'+esc(l.ip||'—')+'</td>'
        + '<td style="white-space:nowrap">'+esc(drapeau(l.cc))+' '+esc(l.pays||'—')+(l.ville?'<div class="sub">'+esc(l.ville)+'</div>':'')+'</td>'
        + '<td>'+esc(l.action||'—')+'</td></tr>';
    }
    h += '</tbody></table></div>';
    if (apages > 1) {
      h += '<div class="pagi"><button class="mini" id="ac-prec"'+(AC_PAGE<=0?' disabled':'')+'>‹ Précédent</button>'
        + '<span>Page '+(AC_PAGE+1)+' sur '+apages+'</span>'
        + '<button class="mini" id="ac-suiv"'+(AC_PAGE>=apages-1?' disabled':'')+'>Suivant ›</button></div>';
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
  var SECT = { orders:'📦 Livraison', stats:'📊 Statistiques', marketing:'🎁 Marketing', staff:'🔑 Mot de passe',
    'returns-mgmt':'↩️ Retours', sociaux:'📱 Réseaux sociaux', newsletter:'🔗 Infolettre', systeme:'🧹 Entretien', app:'🖥 Application' };
  function vueAuto(){
    var rows = D.automations||[];
    var h = '<div class="carte"><div class="barre"><span class="sub">'+(D.autoTotal||rows.length)+' entrée(s) · conservation 30 jours</span><span class="pousse"></span>'
      + (D.peutModifier?'<button class="b" id="au-purge">Purger anciens</button>':'')
      + '<button class="b" id="au-csv">Exporter CSV</button></div>'
      + '<table class="tb"><thead><tr><th>Date</th><th>Automatisation</th><th>Action / Détail</th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="3" class="vide">Aucune action automatisée.</td></tr>';
    for (var i=0;i<rows.length;i++){ var l=rows[i];
      h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(l.ts))+'</td>'
        + '<td><span class="pill" style="background:var(--v05);color:var(--tx-gris2)">'+esc(SECT[l.section]||l.section||'—')+'</span></td>'
        + '<td>'+esc(l.action||'—')+'</td></tr>';
    }
    h += '</tbody></table></div>';
    corps.innerHTML = h;
    var bp=document.getElementById('au-purge'); if (bp) bp.onclick=function(){ purger('journal:purger:acces'); };
    var bc=document.getElementById('au-csv'); if (bc) bc.onclick=function(){ exporter('journal:export:acces'); };
  }

  // ── Impressions ──────────────────────────────────────────────────
  var VIA = { agent:'Agent (sans dialogue)', navigateur:'Navigateur', bluetooth:'Bluetooth' };
  function vuePrints(){
    var all = D.prints||[], kinds = D.printKinds||[];
    var rows = all;
    if (PF_TYPE!=='all') rows = rows.filter(function(r){ return (r.kind||'autre')===PF_TYPE; });
    if (PF_VIA!=='all') rows = rows.filter(function(r){ return (r.via||'agent')===PF_VIA; });
    var counts = {}, totalDocs = 0;
    for (var a=0;a<all.length;a++){ var k=all[a].kind||'autre'; counts[k]=(counts[k]||0)+(parseInt(all[a].qty,10)||1); if (all[a].ok!==false) totalDocs+=(parseInt(all[a].qty,10)||1); }
    var kpis = '<div class="kpis"><div class="kpi"><div class="v">'+all.length+'</div><div class="l">travaux (30 j)</div></div>'
      + '<div class="kpi"><div class="v">'+totalDocs+'</div><div class="l">documents imprimés</div></div></div>';
    var kLbl = {}; for (var z=0;z<kinds.length;z++) kLbl[kinds[z].key]=kinds[z].label;
    var typeOpts = '<option value="all"'+(PF_TYPE==='all'?' selected':'')+'>Tous les types</option>';
    for (var t=0;t<kinds.length;t++) typeOpts += '<option value="'+esc(kinds[t].key)+'"'+(PF_TYPE===kinds[t].key?' selected':'')+'>'+esc(kinds[t].label)+'</option>';
    var viaKeys = ['all','agent','navigateur','bluetooth'];
    var viaOpts = ''; for (var v=0;v<viaKeys.length;v++) viaOpts += '<option value="'+viaKeys[v]+'"'+(PF_VIA===viaKeys[v]?' selected':'')+'>'+(viaKeys[v]==='all'?'Toutes les voies':VIA[viaKeys[v]])+'</option>';

    var h = kpis + '<div class="carte"><div class="barre">'
      + '<select class="t" id="p-type">'+typeOpts+'</select><select class="t" id="p-via">'+viaOpts+'</select><span class="pousse"></span>'
      + '<span class="sub">Rétention 30 jours</span>'
      + (D.peutModifier?'<button class="b" id="p-purge">Appliquer la purge</button>':'')
      + '<button class="b" id="p-csv">Exporter CSV</button></div>'
      + '<table class="tb"><thead><tr><th>Date</th><th>Type</th><th>Document</th><th>Qté</th><th>Imprimante</th><th>Par</th><th>État</th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="7" class="vide">'+(all.length?'Aucune impression ne correspond à ces filtres.':'Aucune impression depuis 30 jours.')+'</td></tr>';
    for (var i=0;i<rows.length;i++){ var r=rows[i];
      h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(r.at))+'</td>'
        + '<td><span class="pill" style="background:var(--v05);color:var(--tx-gris2)">'+esc(r.kindLabel||r.kind)+'</span></td>'
        + '<td>'+esc(r.label||'—')+(r.size?'<div class="sub">'+esc(r.size)+(r.dpi?' · '+esc(r.dpi)+' dpi':'')+'</div>':'')+'</td>'
        + '<td style="text-align:center"><strong>'+esc(r.qty||1)+'</strong></td>'
        + '<td>'+esc(r.printer||'—')+'<div class="sub">'+esc(VIA[r.via]||r.via||'')+'</div></td>'
        + '<td class="sub">'+esc(r.who||'—')+(r.poste?'<div class="sub">poste '+esc(r.poste)+'</div>':'')+'</td>'
        + '<td>'+(r.ok===false?'<span class="pill" style="background:rgba(220,38,38,.18);color:var(--tx-err2)" title="'+esc(r.note||'')+'">Échec</span>':'<span class="pill" style="background:rgba(22,163,74,.2);color:var(--tx-ok2)">Imprimé</span>')+'</td></tr>';
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
      corps.innerHTML='<div class="vide">Lecture des SMS…</div>'; OCCUPE=true;
      appeler('journal:sms',[]).then(function(r){ OCCUPE=false;
        if (r&&r.ok){ SMS_D=r.sms||[]; if (ONGLET==='sms') vueSms(); }
        else { SMS_D=[]; if (ONGLET==='sms') corps.innerHTML='<div class="carte"><div class="vide">'+expliquer(r)+'</div></div>'; dire('Échec : '+expliquer(r), 'err'); } });
      return;
    }
    var rows = SMS_D;
    var h = '<div class="note">ℹ Les SMS reçus et envoyés (Twilio). Leur gestion complète (répondre, marquer lu, supprimer) reste dans <b>Communications → Téléphonie</b>.</div>'
      + '<div class="carte"><div class="barre"><span class="sub">'+rows.length+' message(s)</span><span class="pousse"></span><button class="b" id="sms-reload"><span class="ic">🔄</span> Actualiser</button></div>'
      + '<table class="tb"><thead><tr><th>Date</th><th>Sens</th><th>De</th><th>À</th><th>Message</th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="5" class="vide">Aucun SMS.</td></tr>';
    for (var i=0;i<rows.length;i++){ var s=rows[i]; var ent=(s.direction==='inbound');
      h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(s.date))+'</td>'
        + '<td><span class="pill" style="background:'+(ent?'rgba(14,165,233,.18)':'rgba(22,163,74,.2)')+';color:'+(ent?'#7dd3fc':'#6ee7a0')+'">'+(ent?'⬇ Reçu':'⬆ Envoyé')+'</span></td>'
        + '<td class="mono">'+esc(s.from||'—')+'</td><td class="mono">'+esc(s.to||'—')+'</td>'
        + '<td>'+esc(s.body||'')+'</td></tr>';
    }
    h += '</tbody></table></div>';
    corps.innerHTML = h;
    var rl=document.getElementById('sms-reload'); if (rl) rl.onclick=function(){ SMS_D=null; vueSms(); };
  }

  // ── Accès comptables (#7 Lot 7b-2 — reutilise liens:journal) ─────
  var CANAUX = { telechargement:'Installation', comptable:'Comptable', courriel:'Courriel' };
  var EVEN = { visite:'Visite', refuse:'Refusé', ouvert:'Ouvert', classeur:'Classeur ouvert', cree:'Créé', revoque:'Révoqué', telecharge:'Téléchargé', envoye:'Courriel envoyé' };
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
      corps.innerHTML='<div class="vide">Lecture du journal des accès…</div>'; OCCUPE=true;
      appeler('liens:journal',[{canal:CP_CANAL}]).then(function(r){ OCCUPE=false;
        if (r&&r.ok){ COMPTA_D=r.evenements||[]; if (ONGLET==='comptable') vueComptable(); }
        else { COMPTA_D=[]; if (ONGLET==='comptable') corps.innerHTML='<div class="carte"><div class="vide">'+expliquer(r)+'</div></div>'; dire('Échec : '+expliquer(r), 'err'); } });
      return;
    }
    var rows = COMPTA_D;
    var pages = Math.max(1, Math.ceil(rows.length / CP_PARPAGE));
    if (CP_PAGE >= pages) CP_PAGE = pages - 1;
    if (CP_PAGE < 0) CP_PAGE = 0;
    var vue = rows.slice(CP_PAGE * CP_PARPAGE, CP_PAGE * CP_PARPAGE + CP_PARPAGE);
    var h = '<div class="note">ℹ Tous les accès aux liens émis — installation de l’application, portail comptable et envois par courriel : visite, mot de passe refusé, téléchargement, révocation. La <b>gestion</b> des liens (créer, révoquer, supprimer) reste dans <b>Système → Liens d’installation</b>.</div>'
      + '<div class="carte"><div class="barre">'
      + '<select id="cp-canal"><option value="">Tous les canaux</option>'
      + '<option value="installation"' + (CP_CANAL==='installation'?' selected':'') + '>Installation</option>'
      + '<option value="comptable"' + (CP_CANAL==='comptable'?' selected':'') + '>Comptable</option>'
      + '<option value="courriel"' + (CP_CANAL==='courriel'?' selected':'') + '>Courriel</option>'
      + '</select>'
      + '<span class="sub">'+rows.length+' événement(s)</span><span class="pousse"></span>'
      + '<button class="b" id="cp-reload"><span class="ic">🔄</span> Actualiser</button></div>'
      + '<div class="liste"><table class="tb"><thead><tr><th>Quand</th><th>Canal</th><th>Événement</th><th>IP</th><th>Lien</th><th>Détail</th></tr></thead><tbody>';
    if (!vue.length) h += '<tr><td colspan="6" class="vide">Aucun événement.</td></tr>';
    for (var i=0;i<vue.length;i++){ var e=vue[i];
      h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(e.au))+'</td>'
        + '<td>'+esc(CANAUX[e.canal]||e.canal||'—')+'</td><td>'+esc(EVEN[e.genre]||e.genre||'—')+'</td>'
        + '<td class="mono">'+esc(e.ip||'—')+'</td><td class="mono">'+esc((e.lienId||'').slice(0,8))+'</td>'
        + '<td>'+esc(e.detail||'')+(e.qui?' · '+esc(e.qui):'')+'</td></tr>';
    }
    h += '</tbody></table></div>';
    if (pages > 1) {
      h += '<div class="pagi"><button class="mini" id="cp-prec"'+(CP_PAGE<=0?' disabled':'')+'>‹ Précédent</button>'
        + '<span>Page '+(CP_PAGE+1)+' sur '+pages+'</span>'
        + '<button class="mini" id="cp-suiv"'+(CP_PAGE>=pages-1?' disabled':'')+'>Suivant ›</button></div>';
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
    var h = '<div class="note">ℹ Ce que des visiteurs ont cherché sans rien trouver. Son tableau de bord complet (tendances, archive) reste dans <b>Marketing → Statistiques</b> ; il est rassemblé ici et couvert par la recherche inter-journaux.</div>'
      + '<div class="carte"><div class="barre"><span class="sub">'+(D.recherchesTotal||rows.length)+' terme(s) distinct(s)</span></div>'
      + '<table class="tb"><thead><tr><th>Terme cherché</th><th style="text-align:center">Fois</th><th>Dernière fois</th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="3" class="vide">Aucune recherche sans résultat.</td></tr>';
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
    var h = '<div class="note">ℹ Les erreurs JavaScript survenues chez des <b>visiteuses de la boutique</b>. '
      + 'Elles sont <b>regroupées</b> : une ligne par défaut distinct, avec le nombre de fois. '
      + 'Aucune donnée personnelle n’y entre — courriels, numéros et jetons sont remplacés avant l’envoi.</div>'
      + '<div class="carte"><div class="barre">'
      +   '<span class="sub">' + rows.length + ' défaut(s) distinct(s)'
      +     (neuves ? ' · <b style="color:var(--tx-att)">' + neuves + ' non vu(s)</b>' : '') + '</span>'
      +   (D.peutModifier && neuves ? '<button class="mini" id="js-vues">Tout marquer comme vu</button>' : '')
      +   (D.peutModifier && rows.length
            ? '<button class="mini" id="js-purge"' + (JS_ARME ? ' style="border-color:rgba(239,68,68,.6);color:var(--tx-err)"' : '') + '>'
              + (JS_ARME ? 'Confirmer — vider définitivement' : 'Vider') + '</button>'
            : '')
      + '</div>'
      + '<table class="tb"><thead><tr>'
      +   '<th>Erreur</th><th>Fichier</th><th style="text-align:center">Fois</th>'
      +   '<th>Où</th><th>Dernière fois</th>'
      + '</tr></thead><tbody>';
    if (!rows.length) {
      h += '<tr><td colspan="5" class="vide">Aucune erreur rapportée. '
        + 'C’est la bonne nouvelle — mais elle ne vaut que depuis la mise en place de ce journal.</td></tr>';
    }
    for (var i = 0; i < rows.length; i++) {
      var x = rows[i];
      var genre = x.genre === 'ressource' ? '📦 chargement'
                : x.genre === 'promesse' ? '⏳ promesse' : '⚠ erreur';
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
    if (OCCUPE) return; OCCUPE = true; dire('Marquage…');
    appeler('journal:jsErreursVues', [null]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) recharger((r.n || 0) + ' erreur(s) marquée(s) comme vue(s).', 'bon');
      else dire('Échec : ' + expliquer(r), 'err');
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
      dire('Cliquez de nouveau pour vider — les compteurs ne se reconstituent pas.', 'att');
      return;
    }
    JS_ARME = false; OCCUPE = true; dire('Vidage…');
    appeler('journal:jsErreursPurger', []).then(function(r){
      OCCUPE = false;
      if (r && r.ok) recharger('Journal vidé — ' + (r.efface || 0) + ' effacée(s).', 'bon');
      else dire('Échec : ' + expliquer(r), 'err');
    });
  }

  // ── Actions ──────────────────────────────────────────────────────
  function basculerStats(){
    if (OCCUPE) return; OCCUPE=true;
    appeler('journal:stats',[!D.statsHidden]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ D.statsHidden=r.statsHidden; vueAcces(); } else dire('Échec : '+expliquer(r), 'err'); });
  }
  function purger(op){
    if (OCCUPE) return; OCCUPE=true; dire('Purge…');
    appeler(op,[]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ recharger('Purge faite — '+(r.conserves||0)+' conservée(s).', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); });
  }
  function exporter(op){
    if (OCCUPE) return; OCCUPE=true; dire('Préparation du document…');
    appeler(op,[]).then(function(r){ OCCUPE=false;
      dire(r&&r.ok ? 'Document téléchargé depuis la fenêtre principale.' : 'Échec : '+expliquer(r), r&&r.ok?'bon':'err'); });
  }
  function rendre(){
    tabs();
    boutonVerrous();
    if (ONGLET==='recherche') vueRecherche();
    else if (ONGLET==='automatisations') vueAuto();
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
  function charger(){
    dire('Chargement…');
    appeler('journal:donnees',[]).then(function(r){
      if (!r||!r.ok){ corps.innerHTML='<div class="vide">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; rendre(); dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageJournaux };
