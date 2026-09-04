'use strict';

/*
 * FENÊTRE « INCIDENTS DE SÉCURITÉ » — NATIVE (#26)
 * =============================================================================
 * Registre des incidents de confidentialité exigé par la LOI 25 : tout incident
 * doit y être consigné, qu'il présente ou non un risque de préjudice sérieux, et
 * le registre doit pouvoir être remis à la Commission d'accès à l'information
 * sur demande. Conservation : cinq ans après la prise de connaissance.
 *
 * Les cœurs vivent dans admin.js (contexte origine-plein) : la clé
 * `elg_privacy_incidents` passe par TursoDB.syncPrivateList, donc l'écriture
 * atteint la base comme au web. Rien n'est local seulement.
 *
 * ⚠ LE FORMULAIRE N'EST PAS ÉCRIT ICI. Ses étapes et ses champs arrivent du
 * cœur (`etapes`), qui les tient de SECINC_STEPS. Les recopier de ce côté ferait
 * deux listes à garder d'accord, et ce qui manquerait au registre est justement
 * ce qu'on doit produire à la CAI.
 *
 * ⚠ Permission `security-incidents` (et `:edit` / `:delete`), PAS `staff` : on
 * peut avoir à tenir ce registre sans toucher aux accès utilisateurs.
 *
 * ⚠ ANCRÉE = PLEINE PAGE (aucun max-width sur le conteneur).
 * ⚠ Aucun caractère accent grave dans la portion de script.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_JOUR, ICO } = require('./socle.js');

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
.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.carte{background:var(--v03);border:1px solid var(--v08);border-radius:12px;padding:1.1rem 1.2rem;margin:0 0 1.1rem}
.entete{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}
.loi{font-size:.79rem;color:var(--tx2);line-height:1.6;margin:0;max-width:62rem}
.loi b{color:var(--tx)}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin:0 0 1.2rem}
@media(max-width:820px){.stat-grid{grid-template-columns:repeat(2,1fr)}}
.stat{background:var(--v03);border:1px solid var(--v08);border-radius:12px;padding:1rem 1.1rem}
.stat .l{font-size:.74rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em}
.stat .v{font:700 1.7rem/1.1 Georgia,serif;margin-top:.25rem}
table.tb{width:100%;border-collapse:collapse}
table.tb th{text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);padding:.5rem .7rem;border-bottom:1px solid var(--v11);white-space:nowrap}
table.tb td{padding:.6rem .7rem;border-bottom:1px solid var(--v05);font-size:.85rem;vertical-align:middle}
.pill{display:inline-block;font-size:.66rem;font-weight:700;padding:2px 7px;border-radius:99px;white-space:nowrap}
.pill.grave{background:rgba(220,38,38,.18);color:var(--tx-err2)}
.pill.eval{background:rgba(234,179,8,.18);color:#e6c14a}
.pill.sain{background:rgba(22,163,74,.2);color:var(--tx-ok2)}
.pill.ouvert{background:rgba(234,179,8,.18);color:#e6c14a}
.pill.surveille{background:rgba(99,102,241,.18);color:#b6b9f7}
.pill.clos{background:rgba(22,163,74,.2);color:var(--tx-ok2)}
.prim{font:inherit;font-size:.84rem;font-weight:700;border:0;border-radius:8px;padding:.5rem 1rem;background:#c9a97e;color:#1a1408;cursor:pointer}
.prim:disabled{opacity:.5;cursor:default}
.b{font:inherit;font-size:.8rem;border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;background:var(--v05);color:var(--tx);cursor:pointer}
.b:hover{background:var(--v08)}
.b.dgr{color:var(--tx-err2);border-color:rgba(248,113,113,.35)}
.b.dgr:hover{background:rgba(248,113,113,.16)}
.acts{white-space:nowrap;text-align:right}
.acts .b{margin-left:.3rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
.vide{padding:2.4rem 1rem;text-align:center;color:var(--tx2);font-size:.84rem;line-height:1.7}
/* ── Assistant (surcouche) ───────────────────────────────────────── */
.sur{position:fixed;inset:0;background:rgba(4,8,15,.72);display:flex;align-items:center;justify-content:center;z-index:60;padding:1.4rem}
.sur .boite{background:var(--f-carte2);border:1px solid var(--v11);border-radius:14px;max-width:860px;width:100%;max-height:92vh;display:flex;flex-direction:column}
.sur .tt{display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-bottom:1px solid var(--v08)}
.sur .tt h3{margin:0;font:700 1rem/1.2 Georgia,serif}
.sur .liste{padding:1rem 1.1rem;overflow-y:auto}
.sur .liste::-webkit-scrollbar{width:8px}
.sur .liste::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
label.champ{display:block;margin:0 0 .9rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:var(--tx-gris);margin:.25rem 0 0;line-height:1.5}
label.champ .req{color:var(--tx-err2)}
input.t,textarea.t,select.t{width:100%;background:var(--f-champ);border:1px solid #2b3444;border-radius:8px;color:var(--tx);font:inherit;padding:.5rem .65rem}
textarea.t{resize:vertical;min-height:3.6rem;line-height:1.55}
input.t:focus,textarea.t:focus,select.t:focus{outline:none;border-color:#c9a97e}
input.t.manque{border-color:#f87171;background:rgba(248,113,113,.08)}
.ferr{display:none;color:var(--tx-err2);font-size:.82rem;padding:.5rem .7rem;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);border-radius:8px;margin:.3rem 0 .8rem}
/* Fil des étapes : cliquable, l'étape faite se marque d'un crochet.
   ⚠ EN GRILLE, PAS EN FLEX — et ce n'est pas un choix de style. Le premier jet
   empilait rang + nom dans un .et en colonne flex : mesuré, deux des trois blocs
   sortaient a 96,2 px de haut contre 45,4 px pour le troisieme, leur contenu s y
   trouvait centre, et les trois ronds se retrouvaient sur trois hauteurs. Le
   libelle le plus long debordait en prime de sa colonne au lieu de s y replier.
   Ici, la RANGEE DES RONDS est une rangee de grille de hauteur FIXE (26px) et
   les colonnes sont d egale largeur : l alignement ne depend plus de la longueur
   des libelles, donc renommer une etape ne peut plus casser le fil. */
.fil{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(74px,1fr);
  align-items:start;margin:0 0 1.3rem}
.fil .et{display:grid;grid-template-rows:26px auto;justify-items:center;min-width:0;cursor:pointer}
.fil .rang{display:flex;align-items:center;width:100%;height:26px}
.fil .tr{flex:1;height:2px;background:var(--v16)}
.fil .tr.fait{background:#4ade80}
.fil .tr.vide{background:transparent}
.fil .rond{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:.75rem;font-weight:700;flex-shrink:0;border:2px solid var(--v16);
  background:transparent;color:var(--tx2);box-sizing:border-box}
.fil .et.fait .rond{background:#4ade80;border-color:#4ade80;color:#08240f}
.fil .et.ici .rond{background:#c9a97e;border-color:#c9a97e;color:#1a1408}
.fil .nom{width:100%;font-size:.68rem;margin-top:.4rem;text-align:center;color:var(--tx2);
  line-height:1.25;overflow-wrap:break-word;padding:0 .2rem}
.fil .et.ici .nom{color:var(--tx);font-weight:700}
.fil .et.fait .nom{color:var(--tx)}
.pas{display:none}
.pas.ici{display:block}
.pas h4{margin:0 0 .9rem;font:700 .95rem/1.2 Georgia,serif}
.nav{display:flex;justify-content:space-between;align-items:center;gap:.75rem;width:100%}
/* ⚠ LE MESSAGE DE L'ASSISTANT VIT DANS L'ASSISTANT. Il partait au pied de la
   FENÊTRE, c'est-à-dire DERRIÈRE le voile de la surcouche : l'avertissement
   « la date de prise de connaissance est obligatoire » s'affichait tout en bas,
   hors du champ de vision, sous le panneau qu'on est justement en train de
   remplir (signalé le 2026-08-13, capture à l'appui). Il se pose maintenant
   entre les deux boutons de navigation, là où le regard revient. */
.msgsur{flex:1 1 auto;min-width:0;font-size:.79rem;color:var(--tx2);text-align:center;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msgsur.err{color:var(--tx-err)}.msgsur.bon{color:var(--tx-ok)}.msgsur.att{color:var(--tx-jaune)}
/* Fiche de consultation */
.fiche .grp{margin:0 0 1.1rem}
.fiche .grpT{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--tx-or);margin:0 0 .3rem}
.fiche .li{display:flex;gap:.9rem;padding:.38rem 0;border-bottom:1px solid var(--v08)}
.fiche .li .k{flex:0 0 42%;font-size:.78rem;color:var(--tx2)}
.fiche .li .v{flex:1;font-size:.83rem;white-space:pre-wrap;word-break:break-word}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* ⚠ La fenêtre accepte un identifiant d'ouverture, comme Pages et Sécurité : le
   DOM du banc est factice, un clic n'y navigue nulle part. 'inc-new' ouvre
   l'assistant en création, 'inc-<id>' en modification, 'vue-<id>' la fiche. */
function pageIncidents(ouverture) {
  var brut = String(ouverture || '');
  var NOUV0 = brut === 'inc-new' ? '1' : '';
  var EDIT0 = '', VUE0 = '';
  if (!NOUV0 && brut.indexOf('inc-') === 0) EDIT0 = brut.slice(4).replace(/[^A-Za-z0-9_-]/g, '');
  else if (brut.indexOf('vue-') === 0) VUE0 = brut.slice(4).replace(/[^A-Za-z0-9_-]/g, '');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Incidents de sécurité — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.secincident}</span><h1>Incidents de sécurité</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter le registre, pas le modifier.</div>
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
${JS_ACTIVITE}${JS_DIRE}${JS_BROUILLON}
  var corps = document.getElementById('corps');
  var D = null, RO = false, OCCUPE = false;
  var NOUV = '${NOUV0}', EDIT = '${EDIT0}', VUE = '${VUE0}';
  var ETAPE = 0;         // etape courante de l'assistant
  var EDITID = '';       // id en cours d'edition ('' = creation)
  var DELID = '';        // id en attente de confirmation de suppression (2 clics)

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  // ⚠ SI UNE SURCOUCHE EST OUVERTE, LE MESSAGE VA DEDANS. Le pied de la fenêtre
  // est derrière le voile : un avertissement de saisie s'y perdait hors du champ
  // de vision. On garde le pied en second (il reste lisible une fois refermé).
  function dire(t, cl){
    var loc = document.getElementById('a-msg');
    if (loc){ loc.textContent = (t==null?'':String(t)); loc.className = 'msgsur' + (cl?' '+cl:''); }
    szDire(t, cl);
  }
  function txv(id){ var e=document.getElementById(id); return e?String(e.value||''):''; }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès au registre des incidents.',
    lecture_seule:'Votre rôle est en lecture seule.',
    invalide:'Formulaire invalide.',
    introuvable:'Incident introuvable.',
    refus:'Action refusée par le serveur.',
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

  // ── Registre ─────────────────────────────────────────────────────
  function pilRisque(v){
    if (v==='oui') return '<span class="pill grave">Préjudice sérieux</span>';
    if (v==='evaluation') return '<span class="pill eval">En évaluation</span>';
    return '<span class="pill sain">Sans risque sérieux</span>';
  }
  function pilEtat(v){
    if (v==='clos') return '<span class="pill clos">Clôturé</span>';
    if (v==='surveille') return '<span class="pill surveille">Surveillé</span>';
    return '<span class="pill ouvert">Ouvert</span>';
  }

  function vueRegistre(){
    var st = D.stats||{}, lg = D.lignes||[];
    var h = '<div class="entete">'
      + '<p class="loi">La <b>Loi 25</b> impose de consigner <b>tout</b> incident de confidentialité — même sans risque de préjudice sérieux — et de pouvoir remettre ce registre à la <b>Commission d’accès à l’information</b> sur demande. Chaque entrée est conservée <b>cinq ans</b> après la prise de connaissance, puis retirée d’elle-même. Ce registre n’est pas public.</p>'
      + (D.peutModifier ? '<button class="prim" id="i-nouveau">＋ Consigner un incident</button>' : '')
      + '</div>';
    h += '<div class="stat-grid">'
      + '<div class="stat"><div class="l">Au registre</div><div class="v">'+(st.total||0)+'</div></div>'
      + '<div class="stat"><div class="l">Dossiers ouverts</div><div class="v" style="color:#e6c14a">'+(st.ouverts||0)+'</div></div>'
      + '<div class="stat"><div class="l">Préjudice sérieux</div><div class="v" style="color:var(--tx-err2)">'+(st.serieux||0)+'</div></div>'
      + '<div class="stat"><div class="l">Avis CAI à faire</div><div class="v" style="color:var(--tx-err2)">'+(st.caiAFaire||0)+'</div></div>'
      + '</div>';

    if (!lg.length){
      h += '<div class="carte"><div class="vide">Aucun incident consigné.<br>C’est la bonne nouvelle — le registre doit tout de même exister et être tenu à jour.</div></div>';
      corps.innerHTML = h; lier(); return;
    }

    var nc = 7 + (D.peutModifier||D.peutSupprimer ? 1 : 0);
    h += '<div class="carte" style="padding:0;overflow-x:auto"><table class="tb"><thead><tr>'
      + '<th>Prise de connaissance</th><th>Survenance</th><th>Type</th><th style="text-align:center">Personnes</th>'
      + '<th>Risque</th><th>Avis CAI</th><th>État</th>'
      + ((D.peutModifier||D.peutSupprimer) ? '<th></th>' : '')
      + '</tr></thead><tbody>';
    for (var i=0;i<lg.length;i++){ var r=lg[i];
      var acts = '';
      if (D.peutModifier||D.peutSupprimer){
        acts = '<td class="acts"><button class="b" data-vue="'+esc(r.id)+'" title="Voir le détail"><span class="ic">👁</span> Détail</button>'
          + (D.peutModifier ? '<button class="b" data-edit="'+esc(r.id)+'">✏ Modifier</button>' : '')
          + (D.peutSupprimer ? '<button class="b dgr" data-del="'+esc(r.id)+'">'+(DELID===r.id?'✓ Confirmer':'Retirer')+'</button>' : '')
          + '</td>';
      }
      h += '<tr><td style="white-space:nowrap;font-weight:600">'+esc(r.knownAt||'—')+'</td>'
        + '<td style="white-space:nowrap;color:var(--tx2)">'+esc(r.occurredAt||'—')+'</td>'
        + '<td>'+esc(r.type||'—')+(r.ref?'<div style="font-size:.72rem;color:var(--tx-gris)">'+esc(r.ref)+'</div>':'')+'</td>'
        + '<td style="text-align:center">'+esc(r.peopleCount||'—')+'</td>'
        + '<td>'+pilRisque(r.seriousRisk)+'</td>'
        + '<td style="white-space:nowrap;color:var(--tx2)">'+esc(r.cai||'—')+'</td>'
        + '<td>'+pilEtat(r.status)+'</td>'
        + acts + '</tr>';
    }
    h += '</tbody></table></div>';
    corps.innerHTML = h;
    lier();
    if (!lg.length) return;
  }

  function lier(){
    var nv=document.getElementById('i-nouveau'); if (nv) nv.onclick=function(){ ouvrirAssistant(''); };
    var vs=corps.querySelectorAll('[data-vue]'); for (var a=0;a<vs.length;a++) vs[a].onclick=function(){ ouvrirFiche(this.getAttribute('data-vue')); };
    var es=corps.querySelectorAll('[data-edit]'); for (var b=0;b<es.length;b++) es[b].onclick=function(){ ouvrirAssistant(this.getAttribute('data-edit')); };
    var ds=corps.querySelectorAll('[data-del]'); for (var c=0;c<ds.length;c++) ds[c].onclick=function(){
      var id=this.getAttribute('data-del');
      if (DELID===id){ DELID=''; supprimer(id); }
      else { DELID=id; vueRegistre(); dire('Le registre se conserve CINQ ANS. Ne retirez qu’une saisie erronée, jamais un incident réel — cliquez encore pour confirmer.', 'att'); }
    };
  }

  // ── Assistant (création / modification) ──────────────────────────
  function incParId(id){ var l=D.incidents||[]; for (var i=0;i<l.length;i++) if (l[i].id===id) return l[i]; return null; }

  function champHtml(c, inc){
    var v = inc ? (inc[c.cle]==null?'':inc[c.cle]) : (c.defaut||'');
    var req = c.requis ? ' <span class="req">*</span>' : '';
    var ctrl;
    if (c.type==='textarea'){
      ctrl = '<textarea class="t" id="f-'+esc(c.cle)+'" rows="3" placeholder="'+esc(c.exemple||'')+'"'+(RO?' disabled':'')+'>'+esc(v)+'</textarea>';
    } else if (c.type==='select'){
      var o='', opts=c.options||[];
      for (var i=0;i<opts.length;i++) o += '<option value="'+esc(opts[i][0])+'"'+(String(v)===String(opts[i][0])?' selected':'')+'>'+esc(opts[i][1])+'</option>';
      ctrl = '<select class="t" id="f-'+esc(c.cle)+'"'+(RO?' disabled':'')+'>'+o+'</select>';
    } else {
      ctrl = '<input class="t" type="'+esc(c.type||'text')+'" id="f-'+esc(c.cle)+'" value="'+esc(v)+'" placeholder="'+esc(c.exemple||'')+'"'+(RO?' disabled':'')+'>';
    }
    return '<label class="champ"><span class="lbl">'+esc(c.label)+req+'</span>'+ctrl
      + (c.indice?'<span class="sub">'+esc(c.indice)+'</span>':'')+'</label>';
  }

  function filHtml(){
    var et = D.etapes||[], h='';
    for (var i=0;i<et.length;i++){
      var cl = i<ETAPE ? 'fait' : (i===ETAPE ? 'ici' : '');
      h += '<div class="et '+cl+'" data-etape="'+i+'">'
        + '<div class="rang">'
        + '<div class="tr '+(i===0?'vide':(i<=ETAPE?'fait':''))+'"></div>'
        + '<div class="rond">'+(i<ETAPE?'✓':(i+1))+'</div>'
        + '<div class="tr '+(i===et.length-1?'vide':(i<ETAPE?'fait':''))+'"></div>'
        + '</div>'
        + '<div class="nom">'+esc(et[i].label)+'</div></div>';
    }
    return h;
  }

  function navHtml(){
    var dernier = (D.etapes||[]).length - 1;
    return '<button class="b" id="a-prec"'+(ETAPE===0?' style="visibility:hidden"':'')+'>← Précédent</button>'
      + '<span class="msgsur" id="a-msg"></span>'
      + (ETAPE<dernier
          ? '<button class="prim" id="a-suiv">Suivant →</button>'
          : (RO ? '<button class="b" id="a-fermer2">Fermer</button>'
                : '<button class="prim" id="a-enr">✓ '+(EDITID?'Enregistrer les modifications':'Enregistrer')+'</button>'));
  }

  function majAssistant(){
    var f=document.getElementById('a-fil'); if (f){ f.innerHTML=filHtml(); lierFil(); }
    var pas=document.querySelectorAll('#sur-inc .pas');
    for (var i=0;i<pas.length;i++) pas[i].className = 'pas' + (i===ETAPE?' ici':'');
    var n=document.getElementById('a-nav'); if (n){ n.innerHTML=navHtml(); lierNav(); }
  }
  function lierFil(){
    var es=document.querySelectorAll('#a-fil .et');
    for (var i=0;i<es.length;i++) es[i].onclick=function(){
      var i2=parseInt(this.getAttribute('data-etape'),10)||0;
      if (i2>ETAPE && !valider()) return;
      ETAPE=i2; majAssistant();
    };
  }
  function lierNav(){
    var p=document.getElementById('a-prec'); if (p) p.onclick=function(){ if (ETAPE>0){ ETAPE--; majAssistant(); } };
    var s=document.getElementById('a-suiv'); if (s) s.onclick=function(){ if (!valider()) return; ETAPE++; majAssistant(); };
    var e=document.getElementById('a-enr'); if (e) e.onclick=enregistrer;
    var f=document.getElementById('a-fermer2'); if (f) f.onclick=fermerAssistant;
  }
  // Seule la date de prise de connaissance est exigee : c'est elle qui fait
  // courir les delais legaux. Le reste se complete au fil de l'enquete, et un
  // formulaire qui refuse une saisie partielle ferait REPORTER la consignation.
  function valider(){
    if (ETAPE!==0) return true;
    var el=document.getElementById('f-knownAt');
    if (el && !String(el.value||'').trim()){
      el.classList.add('manque');
      dire('La date de prise de connaissance est obligatoire — elle fait courir les délais légaux.', 'att');
      try { el.focus(); } catch(e){}
      return false;
    }
    return true;
  }

  function ouvrirAssistant(id){
    if (!D) return;
    if (id && !incParId(id)) { dire('Incident introuvable.', 'err'); return; }
    EDITID = id||''; ETAPE = 0;
    var inc = id ? incParId(id) : null;
    var et = D.etapes||[];
    var pasH='';
    for (var i=0;i<et.length;i++){
      var ch='';
      for (var j=0;j<et[i].champs.length;j++) ch += champHtml(et[i].champs[j], inc);
      pasH += '<div class="pas'+(i===0?' ici':'')+'"><h4>'+esc(et[i].icone||'')+' '+esc(et[i].label)+'</h4>'+ch+'</div>';
    }
    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-inc';
    sur.innerHTML = '<div class="boite"><div class="tt"><h3><span class="ic">🛡</span> '+(id?'Modifier l’incident':'Consigner un incident')+'</h3>'
      + '<div><button class="sz-btnplein" id="a-plein" title="Occuper toute la fenêtre">⛶ Plein écran</button>'
      + '<button class="mini" id="a-x">Fermer</button></div></div>'
      + '<div class="liste">'
      + '<p class="loi" style="margin:0 0 1rem">Registre des incidents de sécurité (Loi 25) — parcourez les étapes ; seule la <b>date de prise de connaissance</b> est obligatoire.</p>'
      + '<div class="ferr" id="a-err"></div>'
      + '<div class="fil" id="a-fil">'+filHtml()+'</div>'
      + pasH
      + '</div>'
      + '<div class="tt" style="border-bottom:0;border-top:1px solid var(--v08)"><div class="nav" id="a-nav">'+navHtml()+'</div></div></div>';
    document.body.appendChild(sur);
    document.getElementById('a-x').onclick=fermerAssistant;
    var bp=document.getElementById('a-plein');
    if (bp) bp.onclick=function(){ szPleinBasculer(sur.querySelector('.boite'), bp); };
    lierFil(); lierNav();
    var k=document.getElementById('f-knownAt'); if (k) k.oninput=function(){ k.classList.remove('manque'); };
    /* Apres le dessin : la boite de reprise remplit des champs qui n existent
       qu une fois l assistant pose. */
    szBrouillonProposer();
  }
  // ⚠ szPleinReinit À LA FERMETURE, sans exception : la classe de zoom vit sur
  // <html>, pas sur la surcouche. L'oublier laisserait toute la fenêtre en gros
  // caractères après avoir fermé un assistant, sans rien pour l'expliquer.
  /* ⚠ L ECRITURE EST IMMEDIATE ET AVANT LE remove() : une ligne plus bas la
     surcouche n existe plus, donc ses champs non plus, et il n y aurait plus rien
     a garder. C est exactement le defaut n°1 des Depenses. */
  function fermerAssistant(){ szBrouillonMaintenant(); szPleinReinit(); var s=document.getElementById('sur-inc'); if (s) s.remove(); DELID=''; }

  /* ══ LE BROUILLON DU REGISTRE DES INCIDENTS ════════════════════
     Un incident se consigne en plusieurs etapes, avec des recits en texte libre —
     et souvent dans l urgence, ce qui est exactement le moment ou l on ferme une
     fenetre par erreur.
     ⚠ LES CHAMPS SONT DYNAMIQUES : ils viennent de D.etapes, pas d une liste
     ecrite ici. Recopier les identifiants serait les figer, et un champ ajoute au
     formulaire demain sortirait silencieusement du brouillon — le genre de perte
     qui ne se remarque qu apres. On lit donc la MEME source que l enregistrement. */
  function brIds(){
    var et = (D && D.etapes) || [], l = [];
    for (var i = 0; i < et.length; i++)
      for (var j = 0; j < et[i].champs.length; j++) l.push('f-' + et[i].champs[j].cle);
    return l;
  }
  szBrouillonBrancher({
    portee: 'incident',
    libelle: 'Un incident',
    ttlMin: 720,
    cle: function(){ return EDITID ? ('i:' + EDITID) : '__new__'; },
    actif: function(){ return !!document.getElementById('sur-inc'); },
    valeurs: function(){ return szBrouillonDuDom(brIds(), []); },
    rempli: function(){
      var v = szBrouillonDuDom(brIds(), []); if (!v) return false;
      return szBrouillonQuelqueChose(v, brIds());
    },
    remplir: function(v){ szBrouillonAuDom(v); },
  });
  szBrouillonEcouter();

  function enregistrer(){
    if (RO||OCCUPE) return;
    if (!valider()){ ETAPE=0; majAssistant(); return; }
    var d={}, et=D.etapes||[];
    for (var i=0;i<et.length;i++) for (var j=0;j<et[i].champs.length;j++){
      var c=et[i].champs[j]; d[c.cle]=txv('f-'+c.cle);
    }
    OCCUPE=true; dire('Enregistrement…');
    appeler('incidents:ecrire',[EDITID||'', d]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){
        /* ⚠ JETER AVANT DE FERMER : fermerAssistant() ecrit le brouillon, et il le
           reecrirait par-dessus celui qu on vient de jeter. */
        szBrouillonJeter();
        fermerAssistant();
        D=r; RO=!r.peutModifier; DELID=''; vueRegistre();
        dire(r.mode==='create' ? 'Incident consigné au registre.' : 'Incident mis à jour.', 'bon');
      } else {
        var e=document.getElementById('a-err'); if (e){ e.textContent=expliquer(r); e.style.display='block'; }
        dire('Échec : '+expliquer(r), 'err');
      }
    });
  }

  function supprimer(id){
    if (OCCUPE) return; OCCUPE=true; dire('Retrait…');
    appeler('incidents:supprimer',[id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ D=r; RO=!r.peutModifier; DELID=''; vueRegistre(); dire('Entrée retirée du registre.', 'bon'); }
      else dire('Échec : '+expliquer(r), 'err'); });
  }

  // ── Fiche de consultation ────────────────────────────────────────
  function libelleOption(c, v){
    var o=c.options||[];
    for (var i=0;i<o.length;i++) if (String(o[i][0])===String(v)) return o[i][1];
    return String(v);
  }
  function ouvrirFiche(id){
    var inc = incParId(id); if (!inc){ dire('Incident introuvable.', 'err'); return; }
    var et=D.etapes||[], h='';
    for (var i=0;i<et.length;i++){
      var lignes='';
      for (var j=0;j<et[i].champs.length;j++){
        var c=et[i].champs[j], v=inc[c.cle];
        if (v==null||v==='') continue;
        if (c.type==='select') v=libelleOption(c, v);
        lignes += '<div class="li"><div class="k">'+esc(c.label)+'</div><div class="v">'+esc(v)+'</div></div>';
      }
      if (lignes) h += '<div class="grp"><div class="grpT">'+esc(et[i].icone||'')+' '+esc(et[i].label)+'</div>'+lignes+'</div>';
    }
    if (!h) h = '<div class="vide">Aucun détail saisi.</div>';
    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-vue';
    sur.innerHTML = '<div class="boite" style="max-width:720px"><div class="tt">'
      + '<h3>Incident — '+esc(inc.knownAt||'')+' '+pilRisque(inc.seriousRisk)+'</h3>'
      + '<div><button class="sz-btnplein" id="v-plein" title="Occuper toute la fenêtre">⛶ Plein écran</button>'
      + '<button class="mini" id="v-x">Fermer</button></div></div>'
      + '<div class="liste fiche">'+h+'</div>'
      + '<div class="tt" style="justify-content:flex-end;gap:.5rem;border-bottom:0;border-top:1px solid var(--v08)">'
      + '<button class="b" id="v-fermer">Fermer</button>'
      + (D.peutModifier ? '<button class="prim" id="v-edit">✏ Modifier</button>' : '')
      + '</div></div>';
    document.body.appendChild(sur);
    function fermer(){ szPleinReinit(); var s=document.getElementById('sur-vue'); if (s) s.remove(); }
    document.getElementById('v-x').onclick=fermer;
    document.getElementById('v-fermer').onclick=fermer;
    var vp=document.getElementById('v-plein');
    if (vp) vp.onclick=function(){ szPleinBasculer(sur.querySelector('.boite'), vp); };
    var ed=document.getElementById('v-edit'); if (ed) ed.onclick=function(){ fermer(); ouvrirAssistant(id); };
  }

  function rendre(){
    var av=document.getElementById('ro'); if (av) av.hidden=!RO;
    vueRegistre();
  }

  function charger(){
    dire('Chargement…');
    appeler('incidents:donnees',[]).then(function(r){
      if (!r||!r.ok){ corps.innerHTML='<div class="vide">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; RO=!r.peutModifier; rendre(); dire('');
      // Ouverture directe (banc / lien profond), une fois D disponible et le
      // registre dessiné — sinon l'assistant n'aurait ni etapes ni incident.
      if (NOUV){ NOUV=''; ouvrirAssistant(''); }
      else if (EDIT){ var e=EDIT; EDIT=''; ouvrirAssistant(e); }
      else if (VUE){ var v=VUE; VUE=''; ouvrirFiche(v); }
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageIncidents };
