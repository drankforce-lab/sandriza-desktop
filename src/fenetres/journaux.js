'use strict';

/*
 * FENÊTRE « JOURNAUX » — NATIVE (#7, Lot 7a)
 * =============================================================================
 * Réunit les 4 journaux existants en une fenêtre ancrable : Accès (connexions,
 * MFA, géo, actions), Automatisations (crons), Impressions (agent / navigateur /
 * Bluetooth), Verrous (super-administrateur seulement — forcer un déverrouillage).
 * ⚠ Les AUTRES journaux (accès comptables, SMS, recherches sans résultat,
 * révisions, impressions promo) vivent dans d'autres modules → Lot 7b.
 *
 * Lecture par `journal:donnees` (local, rapide) ; les verrous par `journal:verrous`
 * (serveur). Les EXPORTS CSV suivent le patron « fenêtre pilote » : c'est la PAGE
 * qui télécharge (createObjectURL + suivi des téléchargements), pas la fenêtre.
 *
 * ⚠ ANCRÉE = PLEINE PAGE. ⚠ Aucun caractère accent grave dans la portion script.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.55rem 1.1rem;
  border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.onglets{flex:0 0 auto;display:flex;gap:.1rem;flex-wrap:wrap;padding:.35rem 1rem 0;border-bottom:1px solid rgba(255,255,255,.08)}
.onglets button{font:inherit;font-size:.82rem;white-space:nowrap;background:none;border:none;color:#8fa1b8;padding:.5rem .85rem;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
.onglets button.on{color:#c9a97e;border-bottom-color:#c9a97e;font-weight:700}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:1rem 1.1rem;margin:0 0 1.1rem}
.barre{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin:0 0 .9rem}
.barre .pousse{flex:1}
.stat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.8rem;margin:0 0 1rem}
@media(max-width:820px){.stat-grid{grid-template-columns:repeat(2,1fr)}}
.stat{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:.7rem .85rem}
.stat .l{font-size:.7rem;color:#8fa1b8;text-transform:uppercase;letter-spacing:.04em}
.stat .v{font:700 1.4rem/1.1 Georgia,serif;margin-top:.2rem}
select.t{background:#0f1724;border:1px solid #2b3444;border-radius:8px;color:#e8edf5;font:inherit;font-size:.82rem;padding:.4rem .6rem}
.b{font:inherit;font-size:.8rem;border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.42rem .8rem;background:rgba(255,255,255,.05);color:#e8edf5;cursor:pointer;white-space:nowrap}
.b:hover{background:rgba(255,255,255,.09)}
.b.dgr{color:#f6a6a6;border-color:rgba(248,113,113,.35)}
.b.dgr:hover{background:rgba(248,113,113,.16)}
table.tb{width:100%;border-collapse:collapse}
table.tb th{text-align:left;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8;padding:.45rem .6rem;border-bottom:1px solid rgba(255,255,255,.1);white-space:nowrap}
table.tb td{padding:.5rem .6rem;border-bottom:1px solid rgba(255,255,255,.06);font-size:.82rem;vertical-align:top}
.pill{display:inline-block;font-size:.66rem;font-weight:700;padding:2px 7px;border-radius:99px;white-space:nowrap}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
.mut{color:#8fa1b8}.sub{font-size:.72rem;color:#6f8098}
.kpis{display:flex;gap:.6rem;flex-wrap:wrap;margin:0 0 1rem}
.kpi{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:.55rem .8rem;min-width:110px}
.kpi .v{font:700 1.2rem/1 Georgia,serif}.kpi .l{font-size:.7rem;color:#8fa1b8}
.note{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:.8rem 1rem;font-size:.82rem;color:#8fa1b8;line-height:1.55;margin:0 0 1rem}
.note b{color:#e8edf5}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
.vide{padding:1.5rem;text-align:center;color:#8fa1b8;font-size:.82rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);color:#e8edf5;cursor:pointer}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageJournaux(onglet) {
  const ONGLET0 = (['acces','automatisations','impressions','verrous'].indexOf(String(onglet||'')) >= 0) ? String(onglet) : 'acces';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Journaux — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">📋</span><h1>Journaux</h1></div>
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
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var ongletsEl = document.getElementById('onglets');
  var D = null, OCCUPE = false;
  var ONGLET = '${ONGLET0}';
  var VERR = null;      // verrous chargés (async) ; null = pas encore lus
  var CONFV = '';       // confirmation 2 clics : '' | 'tout' | scope+'\\u0001'+id
  var PF_TYPE = 'all', PF_VIA = 'all';   // filtres de l'onglet Impressions

  var ONGLETS = [ ['acces','🔐 Accès'], ['automatisations','🤖 Automatisations'], ['impressions','🖨 Impressions'], ['verrous','🔓 Verrous'] ];

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

  function tabs(){
    var h='';
    for (var i=0;i<ONGLETS.length;i++){ var o=ONGLETS[i];
      if (o[0]==='verrous' && !(D&&D.isSuper)) continue;   // verrous = super-admin
      h+='<button data-k="'+o[0]+'" class="'+(ONGLET===o[0]?'on':'')+'">'+esc(o[1])+'</button>'; }
    ongletsEl.innerHTML=h;
    var bs=ongletsEl.querySelectorAll('button');
    for (var j=0;j<bs.length;j++) bs[j].onclick=function(){ ONGLET=this.getAttribute('data-k'); CONFV=''; rendre(); };
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
      + '<div class="stat"><div class="l">Connexions auj.</div><div class="v" style="color:#6ee7a0">'+(st.loginOk||0)+'</div></div>'
      + '<div class="stat"><div class="l">Échecs auj.</div><div class="v" style="color:#fca5a5">'+(st.loginFail||0)+'</div></div>'
      + '<div class="stat"><div class="l">Échecs MFA</div><div class="v" style="color:#e6c14a">'+(st.mfaFail||0)+'</div></div>'
      + '<div class="stat"><div class="l">Bloqués géo</div><div class="v" style="color:#fda4af">'+(st.geoBlocked||0)+'</div></div>'
      + '<div class="stat"><div class="l">IPs uniques</div><div class="v">'+(st.ips||0)+'</div></div>'
      + '</div>';
    h += '<div class="carte"><div class="barre"><span class="sub">'+(D.accesTotal||rows.length)+' entrée(s) · conservation 30 jours</span><span class="pousse"></span>'
      + '<button class="b" id="a-stats">'+(D.statsHidden?'Afficher les stats':'Masquer les stats')+'</button>'
      + (D.peutModifier?'<button class="b" id="a-purge">Purger anciens</button>':'')
      + '<button class="b" id="a-csv">Exporter CSV</button></div>'
      + '<table class="tb"><thead><tr><th>Date</th><th>Type</th><th>Utilisateur</th><th>IP</th><th>Pays</th><th>Action</th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="6" class="vide">Aucun journal.</td></tr>';
    for (var i=0;i<rows.length;i++){ var l=rows[i]; var t=TYPE[l.type]||{bg:'rgba(255,255,255,.06)',c:'#8fa1b8',l:l.type};
      h += '<tr><td class="mut" style="white-space:nowrap">'+esc(fdate(l.ts))+'</td>'
        + '<td><span class="pill" style="background:'+t.bg+';color:'+t.c+'">'+esc(t.l)+'</span></td>'
        + '<td>'+esc(l.nom||'—')+'<div class="sub">'+esc(l.email)+'</div></td>'
        + '<td class="mono">'+esc(l.ip||'—')+'</td>'
        + '<td style="white-space:nowrap">'+esc(drapeau(l.cc))+' '+esc(l.pays||'—')+(l.ville?'<div class="sub">'+esc(l.ville)+'</div>':'')+'</td>'
        + '<td>'+esc(l.action||'—')+'</td></tr>';
    }
    h += '</tbody></table></div>';
    corps.innerHTML = h;
    var bs=document.getElementById('a-stats'); if (bs) bs.onclick=basculerStats;
    var bp=document.getElementById('a-purge'); if (bp) bp.onclick=function(){ purger('journal:purger:acces'); };
    var bc=document.getElementById('a-csv'); if (bc) bc.onclick=function(){ exporter('journal:export:acces'); };
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
        + '<td><span class="pill" style="background:rgba(255,255,255,.06);color:#c3cede">'+esc(SECT[l.section]||l.section||'—')+'</span></td>'
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
        + '<td><span class="pill" style="background:rgba(255,255,255,.06);color:#c3cede">'+esc(r.kindLabel||r.kind)+'</span></td>'
        + '<td>'+esc(r.label||'—')+(r.size?'<div class="sub">'+esc(r.size)+(r.dpi?' · '+esc(r.dpi)+' dpi':'')+'</div>':'')+'</td>'
        + '<td style="text-align:center"><strong>'+esc(r.qty||1)+'</strong></td>'
        + '<td>'+esc(r.printer||'—')+'<div class="sub">'+esc(VIA[r.via]||r.via||'')+'</div></td>'
        + '<td class="sub">'+esc(r.who||'—')+(r.poste?'<div class="sub">poste '+esc(r.poste)+'</div>':'')+'</td>'
        + '<td>'+(r.ok===false?'<span class="pill" style="background:rgba(220,38,38,.18);color:#fca5a5" title="'+esc(r.note||'')+'">Échec</span>':'<span class="pill" style="background:rgba(22,163,74,.2);color:#6ee7a0">Imprimé</span>')+'</td></tr>';
    }
    h += '</tbody></table></div>';
    corps.innerHTML = h;
    var pt=document.getElementById('p-type'); if (pt) pt.onchange=function(){ PF_TYPE=this.value; vuePrints(); };
    var pv=document.getElementById('p-via'); if (pv) pv.onchange=function(){ PF_VIA=this.value; vuePrints(); };
    var pp=document.getElementById('p-purge'); if (pp) pp.onclick=function(){ purger('journal:purger:prints'); };
    var pc=document.getElementById('p-csv'); if (pc) pc.onclick=function(){ exporter('journal:export:prints'); };
  }

  // ── Verrous (super-admin) ────────────────────────────────────────
  function vueVerrous(){
    if (VERR===null){
      corps.innerHTML = '<div class="vide">Lecture des verrous…</div>';
      OCCUPE=true;
      appeler('journal:verrous',[]).then(function(r){ OCCUPE=false;
        if (r&&r.ok){ VERR=r.locks||[]; if (ONGLET==='verrous') vueVerrous(); }
        else { VERR=[]; if (ONGLET==='verrous') { corps.innerHTML='<div class="carte"><div class="vide">'+expliquer(r)+'</div></div>'; } dire('Échec : '+expliquer(r), 'err'); }
      });
      return;
    }
    var actifs = VERR.filter(function(l){ return !l.expired && l.sessionAlive!==false; });
    var morts = VERR.filter(function(l){ return l.expired || l.sessionAlive===false; });
    function tbl(list, vide){
      if (!list.length) return '<div class="vide">'+vide+'</div>';
      var h='<table class="tb"><thead><tr><th>Section</th><th>Enregistrement</th><th>Détenu par</th><th>Depuis</th><th>État</th><th></th></tr></thead><tbody>';
      for (var i=0;i<list.length;i++){ var l=list[i]; var mort=l.expired||l.sessionAlive===false; var motif=l.expired?'Périmé':(l.sessionAlive===false?'Session fermée':'');
        var cle=l.scope+'\\u0001'+l.id;
        h += '<tr><td><strong>'+esc(l.scopeLabel||l.scope)+'</strong><div class="sub mono">'+esc(l.scope)+'</div></td>'
          + '<td>'+(l.label?'<strong>'+esc(l.label)+'</strong>':'<em class="mut">sans libellé</em>')+'<div class="sub mono">'+esc(l.id)+'</div></td>'
          + '<td>'+esc(l.who||'—')+'</td>'
          + '<td style="white-space:nowrap">'+esc(l.age)+'<div class="sub">'+esc(l.since?fdate(l.since):'')+'</div></td>'
          + '<td>'+(mort?'<span class="pill" style="background:rgba(220,38,38,.18);color:#fca5a5">'+esc(motif)+'</span>':'<span class="pill" style="background:rgba(22,163,74,.2);color:#6ee7a0">actif · '+Math.max(0,l.expiresIn)+' s</span>')+'</td>'
          + '<td style="text-align:right"><button class="b dgr" data-unl="'+esc(cle)+'">'+(CONFV===cle?'✓ Confirmer':'🔓 Déverrouiller')+'</button></td></tr>';
      }
      return h+'</tbody></table>';
    }
    var h = '<div class="note"><b>À quoi sert cette page.</b> Une fiche ouverte par quelqu’un est verrouillée pour éviter que deux personnes écrasent leur travail. Un verrou se libère seul (fermeture, 90 s sans activité, ou fin de session) — normalement rien à faire ici. Forcer un déverrouillage ne sert que si un poste est parti en laissant une fiche ouverte ; la personne pourra alors se faire refuser son enregistrement. Chaque déverrouillage forcé est inscrit au journal d’accès.</div>'
      + '<div class="barre"><button class="b" id="v-reload">🔄 Actualiser</button>'
      + (VERR.length && D.peutModifier ? '<button class="b dgr" id="v-all">'+(CONFV==='tout'?'✓ Confirmer — tout déverrouiller':'🔓 Tout déverrouiller ('+VERR.length+')')+'</button>' : '')+'</div>'
      + '<div class="carte"><h3 style="margin:0 0 .5rem;font:700 .95rem Georgia,serif">Verrous actifs ('+actifs.length+')</h3>'+tbl(actifs,'Aucun verrou actif.')+'</div>'
      + '<div class="carte"><h3 style="margin:0 0 .5rem;font:700 .95rem Georgia,serif">Verrous éteints ('+morts.length+')</h3><div class="sub" style="margin:0 0 .5rem">Ne bloquent personne — affichés pour information.</div>'+tbl(morts,'Aucun.')+'</div>';
    corps.innerHTML = h;
    var vr=document.getElementById('v-reload'); if (vr) vr.onclick=function(){ VERR=null; CONFV=''; vueVerrous(); };
    var va=document.getElementById('v-all'); if (va) va.onclick=function(){ if (CONFV==='tout'){ CONFV=''; deverrouillerTout(); } else { CONFV='tout'; vueVerrous(); dire('Cliquez encore pour tout déverrouiller.', 'att'); } };
    var us=corps.querySelectorAll('[data-unl]');
    for (var u=0;u<us.length;u++) us[u].onclick=function(){ var cle=this.getAttribute('data-unl');
      if (CONFV===cle){ CONFV=''; var parts=cle.split('\\u0001'); deverrouiller(parts[0], parts[1]); }
      else { CONFV=cle; vueVerrous(); dire('Cliquez encore pour forcer ce déverrouillage.', 'att'); } };
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
  function deverrouiller(scope, id){
    if (OCCUPE) return; OCCUPE=true; dire('Déverrouillage…');
    appeler('journal:deverrouiller',[scope, id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ VERR=null; recharger('Verrou libéré.', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); });
  }
  function deverrouillerTout(){
    if (OCCUPE) return; OCCUPE=true; dire('Libération de tous les verrous…');
    appeler('journal:deverrouiller:tout',[]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ VERR=null; recharger('Verrous libérés.', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); });
  }

  function rendre(){
    tabs();
    if (ONGLET==='verrous' && !(D&&D.isSuper)) ONGLET='acces';
    if (ONGLET==='automatisations') vueAuto();
    else if (ONGLET==='impressions') vuePrints();
    else if (ONGLET==='verrous') vueVerrous();
    else vueAcces();
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
