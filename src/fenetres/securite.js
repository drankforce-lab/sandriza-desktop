'use strict';

/*
 * FENÊTRE « ACCÈS UTILISATEURS » — NATIVE
 * =============================================================================
 * LA GESTION DES COMPTES DU PERSONNEL, ET RIEN D'AUTRE : liste, création,
 * modification, permissions, questions de sécurité, MFA, invitation, suppression.
 *
 * ⚠ LES RÉGLAGES DE SÉCURITÉ SONT PARTIS (2026-08-14, à sa demande) dans leur
 * propre fenêtre — `reglages-securite.js`, entrée de menu séparée. Ils vivaient
 * ici en onglet : d'un côté la GESTION (un geste quotidien, sur une personne
 * précise), de l'autre des RÉGLAGES qui valent pour toute l'entreprise et qu'on
 * touche deux fois par an. Les mêler faisait passer devant des réglages
 * structurants à chaque création de compte.
 *
 * ⚠ AUCUN CŒUR N'A BOUGÉ : mêmes opérations `securite:*`. La séparation est une
 * affaire de présentation — sinon deux écrans finiraient par ne plus dire la
 * même chose.
 *
 * ⚠ LE RÔLE N'EST PAS COLORÉ (sa demande) : une couleur y faisait croire à une
 * alerte alors qu'un rôle est un simple fait. Seuls l'état du compte et le MFA
 * gardent une couleur — eux appellent une décision.
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
.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.entete{display:flex;justify-content:space-between;align-items:center;gap:.8rem;margin-bottom:1rem;flex-wrap:wrap}
.prim{font:inherit;font-size:.84rem;font-weight:700;border:0;border-radius:8px;padding:.5rem 1rem;background:#c9a97e;color:#1a1408;cursor:pointer}
.prim:disabled{opacity:.5;cursor:default}
.b{font:inherit;font-size:.8rem;border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;background:var(--v05);color:var(--tx);cursor:pointer}
.b:hover:not(:disabled){background:var(--v08)}
.b:disabled{opacity:.45;cursor:default}
.b.dgr{color:var(--tx-err2);border-color:rgba(248,113,113,.35)}
.b.dgr:hover:not(:disabled){background:rgba(248,113,113,.16)}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.recherche{flex:1 1 15rem;max-width:24rem;background:var(--f-champ);border:1px solid #2b3444;border-radius:8px;
  color:var(--tx);font:inherit;padding:.45rem .7rem}
.recherche:focus{outline:none;border-color:#c9a97e}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin:0 0 1.2rem}
@media(max-width:700px){.stat-grid{grid-template-columns:1fr}}
.stat{background:var(--v03);border:1px solid var(--v08);border-radius:12px;padding:1rem 1.1rem}
.stat .l{font-size:.74rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em}
.stat .v{font:700 1.7rem/1.1 Georgia,serif;margin-top:.25rem}
.pill{display:inline-block;font-size:.66rem;font-weight:700;padding:2px 8px;border-radius:99px;white-space:nowrap}
.pill.on{background:rgba(22,163,74,.2);color:var(--tx-ok2)}
.pill.off{background:rgba(220,38,38,.18);color:var(--tx-err2)}
.pill.mfa{background:rgba(99,102,241,.18);color:#b6b9f7}
.pill.warn{background:rgba(234,179,8,.18);color:#e6c14a}
.pill.moi{background:rgba(59,130,246,.18);color:var(--tx-bleu)}
/* ⚠ LE RÔLE EN PASTILLE NEUTRE — jamais coloré. */
.pill.role{background:rgba(148,163,184,.16);color:var(--tx-gris2);font-weight:600}
/* ── LES COMPTES EN FICHES ────────────────────────────────────────────────
   Le tableau dense convenait à des transactions ; ici chaque ligne est une
   PERSONNE — un nom, un rôle, un état, des choses qu'on lit, pas qu'on compare
   colonne par colonne. La fiche laisse respirer l'essentiel et met les actions
   à portée sans les entasser au bout d'une rangée. */
.fiches{display:grid;grid-template-columns:repeat(auto-fill,minmax(24rem,1fr));gap:.8rem}
.fiche{background:var(--v03);border:1px solid var(--v08);border-radius:13px;
  padding:.9rem 1rem;display:flex;flex-direction:column;gap:.65rem;transition:border-color .13s}
.fiche:hover{border-color:rgba(201,169,126,.45)}
.fiche.inactif{opacity:.72}
.fiche .haut{display:flex;align-items:center;gap:.75rem;min-width:0}
.jeton{flex:0 0 auto;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font:700 .95rem/1 Georgia,serif;background:rgba(201,169,126,.16);
  color:#e2c79b;border:1px solid rgba(201,169,126,.3);text-transform:uppercase}
.fiche .qui{min-width:0;flex:1 1 auto}
.fiche .nom{font-weight:700;font-size:.95rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fiche .coord{font-size:.75rem;color:var(--tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fiche .etats{display:flex;gap:.32rem;flex-wrap:wrap;align-items:center}
.fiche .quand{font-size:.74rem;color:var(--tx-gris)}
.fiche .barre{display:flex;gap:.35rem;flex-wrap:wrap;border-top:1px solid var(--v08);padding-top:.65rem;margin-top:auto}
.fiche .barre .b{font-size:.76rem;padding:.3rem .62rem}
.vide{padding:2.2rem 1rem;text-align:center;color:var(--tx2);font-size:.84rem;line-height:1.7}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
/* ── Éditeur de compte (surcouche) ───────────────────────────────── */
.sur{position:fixed;inset:0;background:rgba(4,8,15,.72);display:flex;align-items:center;justify-content:center;z-index:60;padding:1.4rem}
.sur .boite{background:var(--f-carte2);border:1px solid var(--v11);border-radius:14px;max-width:900px;width:100%;max-height:92vh;display:flex;flex-direction:column}
.sur .tt{display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-bottom:1px solid var(--v08)}
.sur .tt h3{margin:0;font:700 1rem/1.2 Georgia,serif}
.sur .liste{padding:1rem 1.1rem;overflow-y:auto}
.sur .liste::-webkit-scrollbar{width:8px}
.sur .liste::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
/* ── LES ONGLETS DE L'ÉDITEUR (sa demande, 2026-08-14) ────────────────────
   Créer un accès, ce sont QUATRE questions distinctes — qui est cette
   personne, avec quel accès, quelles réponses de secours, quels droits — et
   les empiler sur une même colonne obligeait à faire défiler un formulaire
   pour trouver la case cherchée. Chacune a maintenant son onglet, et l'onglet
   courant se voit d'un coup d'œil. */
.ongEd{display:flex;gap:.15rem;flex-wrap:wrap;padding:0 1.1rem;border-bottom:1px solid var(--v08)}
.ongEd button{font:inherit;font-size:.82rem;white-space:nowrap;background:none;border:none;
  color:var(--tx2);padding:.55rem .9rem;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
.ongEd button:hover{color:var(--tx)}
.ongEd button.on{color:var(--tx-or);border-bottom-color:#c9a97e;font-weight:700}
.vol{display:none}
.vol.on{display:block}
.aideOng{font-size:.78rem;color:var(--tx2);line-height:1.55;margin:0 0 1rem}
.cols2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
@media(max-width:760px){.cols2{grid-template-columns:1fr}}
label.champ{display:block;margin:0 0 .9rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:var(--tx-gris);margin:.25rem 0 0;line-height:1.5}
label.champ .req{color:var(--tx-err2)}
input.t,select.t,textarea.t{width:100%;background:var(--f-champ);border:1px solid #2b3444;border-radius:8px;color:var(--tx);font:inherit;padding:.5rem .65rem}
input.t:focus,select.t:focus,textarea.t:focus{outline:none;border-color:#c9a97e}
label.case{display:flex;align-items:flex-start;gap:.5rem;font-size:.84rem;cursor:pointer;margin:0 0 .55rem;line-height:1.45}
label.case input{width:16px;height:16px;accent-color:#c9a97e;margin-top:.15rem;flex:0 0 auto}
label.case .quoi{color:var(--tx2);font-size:.75rem;display:block}
.note{background:var(--v03);border:1px solid var(--v11);border-radius:9px;padding:.8rem .95rem;font-size:.81rem;color:var(--tx2);line-height:1.6;margin:0 0 1rem}
.note b{color:var(--tx)}
.ferr{display:none;color:var(--tx-err2);font-size:.82rem;padding:.5rem .7rem;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);border-radius:8px;margin:0 0 .8rem}
.permtb{width:100%;border-collapse:collapse}
.permtb th{font-size:.68rem;color:var(--tx2);font-weight:600;padding:.3rem .5rem;text-align:center;white-space:nowrap}
.permtb th.mod{text-align:left}
.permtb td{padding:.24rem .5rem;text-align:center;font-size:.8rem}
.permtb td.mod{text-align:left;white-space:nowrap}
.permtb tr.grp td{font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--tx-or);background:var(--v03);padding:.5rem .5rem .3rem;border-top:1px solid var(--v11);text-align:left}
.permtb tbody tr:not(.grp):hover{background:var(--v03)}
.permtb input{accent-color:#c9a97e}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* ⚠ Identifiant d'ouverture pour le banc (son DOM est factice, un clic n'y
   navigue nulle part) : 'user-new', 'user-<id>', 'mfa-<id>'.
   ⚠ 'securite' est encore ACCEPTÉ et mène à la liste : une coquille récente
   pourrait le passer par habitude, et tomber sur un écran vide serait pire que
   d'arriver sur la gestion. */
function pageSecurite(onglet) {
  var brut = String(onglet || '');
  var UOUV0 = '', MOUV0 = '';
  if (brut.indexOf('user-') === 0) UOUV0 = brut.slice(5).replace(/[^A-Za-z0-9_-]/g, '');
  else if (brut.indexOf('mfa-') === 0) MOUV0 = brut.slice(4).replace(/[^A-Za-z0-9_-]/g, '');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Accès Utilisateurs — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.acces}</span><h1>Accès Utilisateurs</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter les comptes, pas les modifier.</div>
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
  var D = null, RO = false, OCCUPE = false;
  var UOUV = '${UOUV0}';   // ouverture directe de l editeur (banc) : 'new' ou '<id>'
  var MOUV = '${MOUV0}';   // ouverture directe de la modale MFA (banc) : '<id>'
  var DELU = '';           // compte en attente de confirmation de suppression (2 clics)
  var FILTRE = '';         // recherche
  var ONGED = 'identite';  // onglet courant de l editeur

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function chkv(id){ var e=document.getElementById(id); return !!(e&&e.checked); }
  function txv(id){ var e=document.getElementById(id); return e?String(e.value||''):''; }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès aux comptes du personnel.',
    lecture_seule:'Votre rôle est en lecture seule.',
    invalide:'Formulaire invalide.',
    introuvable:'Compte introuvable.',
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

  function fmtTs(iso){ if (!iso) return 'Jamais connecté'; try { return new Date(iso).toLocaleString('fr-CA'); } catch(e){ return '—'; } }
  // Les initiales : deux lettres au plus, prises sur le nom, sinon le courriel.
  function initiales(s){
    var src = String(s.nom || s.email || '?').trim();
    var m = src.split(/[\\s._-]+/).filter(Boolean);
    if (m.length >= 2) return (m[0].charAt(0) + m[1].charAt(0));
    return src.slice(0, 2);
  }

  // ── LA LISTE ─────────────────────────────────────────────────────
  function vueUsers(){
    var st = D.stats||{}, comptes = D.comptes||[];
    var superActifs = 0; for (var k=0;k<comptes.length;k++) if (comptes[k].estSuper && comptes[k].active) superActifs++;

    var h = '<div class="entete">'
      + '<input class="recherche" id="u-q" placeholder="Rechercher un nom, un courriel, un rôle…" value="'+esc(FILTRE)+'">'
      + (D.peutModifier ? '<button class="prim" id="u-nouveau">＋ Créer un accès</button>' : '')
      + '</div>';

    h += '<div class="stat-grid">'
      + '<div class="stat"><div class="l">Comptes</div><div class="v">'+(st.total||0)+'</div></div>'
      + '<div class="stat"><div class="l">Actifs</div><div class="v" style="color:var(--tx-ok2)">'+(st.actifs||0)+'</div></div>'
      + '<div class="stat"><div class="l">MFA activé</div><div class="v" style="color:#b6b9f7">'+(st.mfa||0)+'</div></div>'
      + '</div>';

    var q = FILTRE.trim().toLowerCase();
    var vus = comptes.filter(function(s){
      if (!q) return true;
      return [s.nom, s.email, s.username, s.roleLabel, s.role].join(' ').toLowerCase().indexOf(q) >= 0;
    });

    if (!comptes.length) {
      h += '<div class="vide">Aucun compte du personnel.</div>';
    } else if (!vus.length) {
      h += '<div class="vide">Aucun compte ne correspond à « '+esc(FILTRE)+' ».</div>';
    } else {
      h += '<div class="fiches">';
      for (var i=0;i<vus.length;i++){ var s=vus[i];
        var peutSuppr = !s.estMoi && (!s.estSuper || superActifs > 1);
        var etats = '<span class="pill role">'+esc(s.roleLabel||s.role||'—')+'</span>'
          + (s.active ? '<span class="pill on">Actif</span>' : '<span class="pill off">Désactivé</span>')
          + (s.mfaEnabled ? '<span class="pill mfa">MFA ✓</span>'
             : (s.requireMfaSetup ? '<span class="pill warn">MFA à configurer</span>'
             : (s.mfaExempt ? '<span class="pill warn">MFA exempté</span>' : '')))
          + (s.estMoi ? '<span class="pill moi">vous</span>' : '');
        h += '<div class="fiche'+(s.active?'':' inactif')+'">'
          + '<div class="haut"><div class="jeton">'+esc(initiales(s))+'</div>'
          + '<div class="qui"><div class="nom">'+esc(s.nom||'—')+'</div>'
          + '<div class="coord">'+(s.username?'@'+esc(s.username)+' · ':'')+esc(s.email||'')+'</div></div></div>'
          + '<div class="etats">'+etats+'</div>'
          + '<div class="quand">'+esc(fmtTs(s.derniereConnexion))+' · '+(s.nbConnexions||0)+' connexion'+((s.nbConnexions||0)>1?'s':'')+'</div>';
        if (D.peutModifier){
          h += '<div class="barre">'
            + '<button class="b" data-edit="'+esc(s.id)+'"><span class="ic">✏</span> Modifier</button>'
            + '<button class="b" data-mfa="'+esc(s.id)+'" title="Gérer l’authentification à deux facteurs"><span class="ic">🔐</span> MFA</button>'
            + (!s.estSuper ? '<button class="b" data-invite="'+esc(s.id)+'" title="Renvoyer un mot de passe temporaire par courriel"><span class="ic">📧</span> Renvoyer</button>' : '')
            + (peutSuppr ? '<button class="b dgr" data-del="'+esc(s.id)+'">'+(DELU===s.id?'✓ Confirmer':'Supprimer')+'</button>' : '')
            + '</div>';
        }
        h += '</div>';
      }
      h += '</div>';
    }

    corps.innerHTML = h;

    var q2=document.getElementById('u-q');
    if (q2) {
      q2.oninput=function(){ FILTRE=this.value; var pos=this.selectionStart; vueUsers();
        var n=document.getElementById('u-q'); if (n){ n.focus(); try { n.setSelectionRange(pos,pos); } catch(e){} } };
    }
    var nv=document.getElementById('u-nouveau'); if (nv) nv.onclick=function(){ ouvrirEditeurCompte(''); };
    var eds=corps.querySelectorAll('[data-edit]'); for (var e=0;e<eds.length;e++) eds[e].onclick=function(){ ouvrirEditeurCompte(this.getAttribute('data-edit')); };
    var mfas=corps.querySelectorAll('[data-mfa]'); for (var mm=0;mm<mfas.length;mm++) mfas[mm].onclick=function(){ ouvrirMfa(this.getAttribute('data-mfa')); };
    var invs=corps.querySelectorAll('[data-invite]'); for (var v=0;v<invs.length;v++) invs[v].onclick=function(){ inviterCompte(this.getAttribute('data-invite')); };
    var dels=corps.querySelectorAll('[data-del]'); for (var d=0;d<dels.length;d++) dels[d].onclick=function(){ var id=this.getAttribute('data-del');
      if (DELU===id){ DELU=''; supprimerCompte(id); } else { DELU=id; vueUsers(); dire('Cliquez encore pour supprimer ce compte.', 'att'); } };
  }

  // ── ÉDITEUR DE COMPTE (à onglets) ────────────────────────────────
  function ouvrirEditeurCompte(id){
    if (OCCUPE) return; OCCUPE=true; dire('Ouverture…');
    appeler('securite:form',[id||'']).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ dire(''); ONGED='identite'; dessinerEditeurCompte(r); } else dire('Échec : '+expliquer(r), 'err'); });
  }
  function fermerEditeurCompte(){ szPleinReinit(); var s=document.getElementById('sur-u'); if (s) s.remove(); }

  function permMatrice(F){
    var acts = F.actions||[], lbls = F.actionLabels||{}, model = F.permModel||[];
    var eff = (F.compte&&F.compte.effectivePerms)||[];
    var h = '<table class="permtb"><thead><tr><th class="mod">Module</th>';
    for (var a=0;a<acts.length;a++) h += '<th>'+esc(lbls[acts[a]]||acts[a])+'</th>';
    h += '</tr></thead><tbody>';
    for (var g=0;g<model.length;g++){ var grp=model[g];
      h += '<tr class="grp"><td colspan="'+(acts.length+1)+'">'+esc(grp.label)+'</td></tr>';
      for (var m=0;m<grp.modules.length;m++){ var mod=grp.modules[m];
        h += '<tr><td class="mod">'+esc(mod.label)+'</td>';
        for (var a2=0;a2<acts.length;a2++){ var act=acts[a2];
          if (mod.actions.indexOf(act)<0){ h += '<td style="color:#3a465a">—</td>'; continue; }
          var key = mod.key+':'+act;
          h += '<td><input type="checkbox" data-perm="'+esc(key)+'" '+(eff.indexOf(key)>=0?'checked':'')+'></td>';
        }
        h += '</tr>';
      }
    }
    return h + '</tbody></table>';
  }

  function dessinerEditeurCompte(F){
    var nouv = (F.mode!=='edit');
    var c = F.compte||{};
    var roles = F.roles||[];
    var roleOpts=''; for (var i=0;i<roles.length;i++) roleOpts += '<option value="'+esc(roles[i].key)+'"'+((c.role||'admin')===roles[i].key?' selected':'')+'>'+esc(roles[i].icon||'')+' '+esc(roles[i].label)+'</option>';
    var qs = F.questions||[];
    var qOpts=function(sel){ var o='<option value="">— Choisir —</option>'; for (var i=0;i<qs.length;i++) o+='<option value="'+esc(qs[i])+'"'+(sel===qs[i]?' selected':'')+'>'+esc(qs[i])+'</option>'; return o; };
    var ansSet = !!c.securityAnswersSet;

    var ONG = [
      ['identite', '👤 Identité'],
      ['acces', '🔑 Accès'],
      ['questions', '🔐 Questions' + (nouv ? '' : (ansSet ? ' ✓' : ' ⚠'))],
      ['perms', '⚙ Permissions']
    ];
    var tabs = '';
    for (var t=0;t<ONG.length;t++) tabs += '<button data-ong="'+ONG[t][0]+'" class="'+(ONGED===ONG[t][0]?'on':'')+'">'+esc(ONG[t][1])+'</button>';

    var volIdentite = '<p class="aideOng">Qui est cette personne. Le <b>nom d’utilisateur</b> lui sert à se connecter ; le courriel reçoit l’invitation et les avis de sécurité.</p>'
      + '<div class="cols2">'
      + '<label class="champ"><span class="lbl">Prénom</span><input class="t" id="u-first" value="'+esc(c.firstName||'')+'"></label>'
      + '<label class="champ"><span class="lbl">Nom</span><input class="t" id="u-last" value="'+esc(c.lastName||'')+'"></label>'
      + '<label class="champ"><span class="lbl">Nom d’utilisateur</span><input class="t" id="u-username" value="'+esc(c.username||'')+'" placeholder="ex : marie_b">'
      + '<span class="sub">Minuscules, chiffres, tiret et soulignement.</span></label>'
      + '<label class="champ"><span class="lbl">Courriel'+(nouv?' <span class="req">*</span>':' (non modifiable)')+'</span>'
      + '<input class="t" type="email" id="u-email" value="'+esc(c.email||'')+'"'+(nouv?'':' readonly style="opacity:.7"')+'></label>'
      + '</div>';

    var volAcces = '<p class="aideOng">Ce que cette personne peut faire, et comment elle prouve son identité.</p>'
      + '<div class="cols2">'
      + '<label class="champ"><span class="lbl">Rôle</span><select class="t" id="u-role">'+roleOpts+'</select>'
      + '<span class="sub">Le rôle coche les permissions par défaut. L’onglet <b>Permissions</b> permet de s’en écarter.</span></label>'
      + '<label class="champ"><span class="lbl">'+(nouv?'Mot de passe':'Nouveau mot de passe')+'</span>'
      + '<input class="t" type="password" id="u-pw" autocomplete="new-password" placeholder="'+(nouv?'laisser vide = généré et envoyé par courriel':'laisser vide = inchangé')+'">'
      + '<span class="sub">'+(nouv?'Vide : un mot de passe temporaire est créé et envoyé.':'Vide : le mot de passe actuel est conservé.')+'</span></label>'
      + '</div>'
      + '<label class="case"><input type="checkbox" id="u-active" '+(c.active!==false?'checked':'')+'>'
      + '<span>Compte actif<span class="quoi">Décoché, la personne ne peut plus se connecter — sans que le compte ni son historique soient supprimés.</span></span></label>'
      + '<label class="case"><input type="checkbox" id="u-reqmfa" '+(c.requireMfaSetup&&!c.mfaEnabled?'checked':'')+'>'
      + '<span>Exiger la configuration MFA à la 1<sup>re</sup> connexion<span class="quoi">Elle devra lier une application d’authentification avant d’accéder à l’administration.</span></span></label>'
      + '<label class="case"><input type="checkbox" id="u-exempt" '+(c.mfaExempt?'checked':'')+'>'
      + '<span>Exempté de MFA<span class="quoi">À réserver aux cas où le second facteur est impossible : c’est un rempart en moins.</span></span></label>';

    var volQuestions = '<p class="aideOng">Elles servent à retrouver un accès quand le mot de passe est perdu. Les réponses sont <b>chiffrées</b> et ne se réaffichent jamais — laisser vide conserve celles déjà enregistrées.</p>'
      + (nouv ? '' : '<div class="note">'+(ansSet?'✓ Des réponses sont déjà enregistrées pour ce compte.':'⚠ Aucune réponse enregistrée : ce compte ne pourra pas être récupéré par cette voie.')+'</div>')
      + '<div class="cols2">'
      + '<label class="champ"><span class="lbl">Question 1</span><select class="t" id="u-q1">'+qOpts(c.securityQ1||'')+'</select></label>'
      + '<label class="champ"><span class="lbl">Réponse 1</span><input class="t" id="u-a1" autocomplete="off" placeholder="'+(ansSet?'Inchangée':'Réponse')+'"></label>'
      + '<label class="champ"><span class="lbl">Question 2</span><select class="t" id="u-q2">'+qOpts(c.securityQ2||'')+'</select></label>'
      + '<label class="champ"><span class="lbl">Réponse 2</span><input class="t" id="u-a2" autocomplete="off" placeholder="'+(ansSet?'Inchangée':'Réponse')+'"></label>'
      + '</div>';

    var volPerms = '<p class="aideOng">Ces cases partent du rôle choisi. Les modifier crée des droits <b>personnalisés</b> pour cette personne ; changer de rôle les remet à ceux du rôle.</p>'
      + '<div id="u-perms">'+permMatrice(F)+'</div>';

    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-u';
    sur.innerHTML = '<div class="boite">'
      + '<div class="tt"><h3>'+(nouv?'＋ Créer un accès':'✏ '+esc(((c.firstName||'')+' '+(c.lastName||'')).trim()||c.email||'Compte'))+'</h3>'
      + '<div><button class="sz-btnplein" id="u-plein" title="Occuper toute la fenêtre">⛶ Plein écran</button>'
      + '<button class="mini" id="u-x">Fermer</button></div></div>'
      + '<div class="ongEd" id="u-ong">'+tabs+'</div>'
      + '<div class="liste">'
      + '<div class="ferr" id="u-err"></div>'
      + '<div class="vol'+(ONGED==='identite'?' on':'')+'" data-vol="identite">'+volIdentite+'</div>'
      + '<div class="vol'+(ONGED==='acces'?' on':'')+'" data-vol="acces">'+volAcces+'</div>'
      + '<div class="vol'+(ONGED==='questions'?' on':'')+'" data-vol="questions">'+volQuestions+'</div>'
      + '<div class="vol'+(ONGED==='perms'?' on':'')+'" data-vol="perms">'+volPerms+'</div>'
      + '</div>'
      + '<div class="tt" style="justify-content:flex-end;gap:.5rem;border-bottom:0;border-top:1px solid var(--v08)">'
      + '<button class="b" id="u-annuler">Annuler</button>'
      + '<button class="prim" id="u-enr">'+(nouv?'Créer le compte':'Enregistrer')+'</button></div></div>';
    document.body.appendChild(sur);

    document.getElementById('u-x').onclick=fermerEditeurCompte;
    document.getElementById('u-annuler').onclick=fermerEditeurCompte;
    document.getElementById('u-enr').onclick=function(){ enregistrerCompte(nouv?'':(c.id||'')); };
    var bp=document.getElementById('u-plein');
    if (bp) bp.onclick=function(){ szPleinBasculer(sur.querySelector('.boite'), bp); };

    /* ⚠ ON NE REDESSINE PAS L EDITEUR EN CHANGEANT D ONGLET : on montre et on
       cache. Le redessiner perdrait tout ce qui est saisi et non encore
       enregistre — quatre onglets, donc quatre occasions de tout perdre. */
    var bs=sur.querySelectorAll('#u-ong button');
    for (var b2=0;b2<bs.length;b2++) bs[b2].onclick=function(){
      ONGED=this.getAttribute('data-ong');
      var tous=sur.querySelectorAll('#u-ong button');
      for (var i2=0;i2<tous.length;i2++) tous[i2].className = (tous[i2].getAttribute('data-ong')===ONGED)?'on':'';
      var vols=sur.querySelectorAll('[data-vol]');
      for (var j2=0;j2<vols.length;j2++) vols[j2].className = 'vol' + (vols[j2].getAttribute('data-vol')===ONGED?' on':'');
    };

    var un=document.getElementById('u-username'); if (un) un.oninput=function(){ un.value=un.value.toLowerCase().replace(/[^a-z0-9_-]/g,''); };
    var rs=document.getElementById('u-role'); if (rs) rs.onchange=function(){
      var role=rs.value, def=null; for (var i3=0;i3<roles.length;i3++) if (roles[i3].key===role) def=roles[i3];
      var perms=(def&&def.permissions)||[];
      var cbs=document.querySelectorAll('#u-perms [data-perm]');
      for (var j3=0;j3<cbs.length;j3++) cbs[j3].checked = perms.indexOf(cbs[j3].getAttribute('data-perm'))>=0;
      dire('Permissions replacées sur celles du rôle.', 'att');
    };
  }

  /* ⚠ L ERREUR RAMENE SUR L ONGLET CONCERNE. Afficher « courriel invalide »
     pendant que l on regarde les permissions laisse chercher le champ fautif. */
  function ferr(msg, ong){
    var e=document.getElementById('u-err'); if (e){ e.textContent=msg; e.style.display='block'; }
    if (!ong) return;
    var b=document.querySelector('#u-ong button[data-ong="'+ong+'"]'); if (b) b.click();
  }

  function enregistrerCompte(id){
    if (OCCUPE) return;
    var perms=[]; var cbs=document.querySelectorAll('#u-perms [data-perm]');
    for (var i=0;i<cbs.length;i++) if (cbs[i].checked) perms.push(cbs[i].getAttribute('data-perm'));
    var d = {
      firstName: txv('u-first').trim(), lastName: txv('u-last').trim(),
      username: txv('u-username').trim(), email: txv('u-email').trim(),
      password: txv('u-pw'), role: txv('u-role'),
      active: chkv('u-active'), requireMfaSetup: chkv('u-reqmfa'), mfaExempt: chkv('u-exempt'),
      perms: perms,
      securityQ1: txv('u-q1').trim(), securityA1: txv('u-a1').trim(),
      securityQ2: txv('u-q2').trim(), securityA2: txv('u-a2').trim()
    };
    if (!d.email) { ferr('Le courriel est obligatoire.', 'identite'); return; }
    OCCUPE=true; dire('Enregistrement…');
    appeler('securite:compte:ecrire',[id||'', d]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){
        fermerEditeurCompte();
        var msg = (r.mode==='create')
          ? ('Compte créé.' + (r.courrielEnvoye ? ' Courriel d’accueil envoyé à '+(r.courriel||'')+'.' : (r.tempPassword ? ' Mot de passe temporaire : '+r.tempPassword+' (courriel non envoyé).' : ' (courriel non envoyé).')))
          : 'Compte modifié.';
        recharger(msg, 'bon');
      } else { ferr(expliquer(r), 'identite'); dire('Échec : '+expliquer(r), 'err'); }
    });
  }
  function supprimerCompte(id){
    if (OCCUPE) return; OCCUPE=true; dire('Suppression…');
    appeler('securite:compte:supprimer',[id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok) recharger('Compte supprimé.', 'bon'); else dire('Échec : '+expliquer(r), 'err'); });
  }
  function inviterCompte(id){
    if (OCCUPE) return; OCCUPE=true; dire('Envoi de l’invitation…');
    appeler('securite:compte:invitation',[id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok) dire('Invitation renvoyée à '+(r.email||'')+'.', 'bon'); else dire('Échec : '+expliquer(r), 'err'); });
  }

  // ── MFA — activation TOTP / exemption / désactivation ────────────
  function ouvrirMfa(id){
    if (OCCUPE) return; OCCUPE=true; dire('Lecture MFA…');
    appeler('securite:mfa:etat',[id]).then(function(r){ OCCUPE=false;
      if (!r||!r.ok){ dire('Échec : '+expliquer(r), 'err'); return; }
      if (r.mfaEnabled){ dire(''); dessinerMfaGerer(id, r); }
      else { OCCUPE=true; dire('Préparation de la liaison…');
        appeler('securite:mfa:init',[id]).then(function(r2){ OCCUPE=false;
          if (r2&&r2.ok){ dire(''); dessinerMfaSetup(id, r2); } else dire('Échec : '+expliquer(r2), 'err'); }); }
    });
  }
  function fermerMfa(){ szPleinReinit(); var s=document.getElementById('sur-mfa'); if (s) s.remove(); }
  function dessinerMfaGerer(id, e){
    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-mfa';
    sur.innerHTML='<div class="boite" style="max-width:520px"><div class="tt"><h3><span class="ic">🔐</span> MFA — '+esc(e.nom||'')+'</h3><button class="mini" id="m-x">Fermer</button></div>'
      + '<div class="liste">'
      + '<div class="note" style="background:rgba(22,163,74,.12);border-color:rgba(22,163,74,.3);color:var(--tx-ok2)"><span class="ic">✅</span> Authentification à deux facteurs activée pour ce compte.</div>'
      + '<label class="case"><input type="checkbox" id="m-exempt" '+(e.mfaExempt?'checked':'')+'> <span><b>Exempter ce compte</b><span class="quoi">Connexion autorisée sans code — un rempart en moins.</span></span></label>'
      + '</div>'
      + '<div class="tt" style="justify-content:flex-end;gap:.5rem;border-bottom:0;border-top:1px solid var(--v08)">'
      + '<button class="b" id="m-annuler">Annuler</button><button class="b dgr" id="m-off">Désactiver MFA</button><button class="prim" id="m-save">Enregistrer</button></div></div>';
    document.body.appendChild(sur);
    document.getElementById('m-x').onclick=fermerMfa;
    document.getElementById('m-annuler').onclick=fermerMfa;
    document.getElementById('m-save').onclick=function(){ mfaExempter(id, chkv('m-exempt')); };
    document.getElementById('m-off').onclick=function(){ mfaDesactiver(id); };
  }
  function dessinerMfaSetup(id, s){
    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-mfa';
    sur.innerHTML='<div class="boite" style="max-width:520px"><div class="tt"><h3><span class="ic">🔐</span> Activer MFA — '+esc(s.nom||'')+'</h3><button class="mini" id="m-x">Fermer</button></div>'
      + '<div class="liste">'
      + '<p class="aideOng"><b>Étape 1</b> — Scannez le QR avec Google Authenticator, Authy ou une application TOTP compatible, ou entrez la clé manuellement.</p>'
      + '<div style="text-align:center;background:var(--f-pied);padding:1rem;border-radius:9px;margin:.6rem 0">'
      + '<img id="m-qr" src="'+esc(s.qrUrl)+'" alt="QR MFA" style="width:190px;height:190px;border-radius:8px;background:#fff"></div>'
      + '<div style="text-align:center;background:var(--f-champ);border:1px solid #2b3444;border-radius:9px;padding:.6rem">'
      + '<div class="sub" style="color:var(--tx2);text-transform:uppercase;letter-spacing:.05em;font-size:.72rem">Clé secrète (saisie manuelle)</div>'
      + '<code style="font-size:.9rem;letter-spacing:.12em;word-break:break-all;color:var(--tx)">'+esc(s.secretGroupe||s.secret||'')+'</code>'
      + '<div style="font-size:.72rem;color:var(--tx-gris)">Base32 · SHA-1 · 6 chiffres · 30 s</div></div>'
      + '<label class="champ" style="margin-top:.9rem"><span class="lbl">Étape 2 — Code à 6 chiffres</span>'
      + '<input class="t" id="m-code" inputmode="numeric" maxlength="6" placeholder="000000" style="font-family:monospace;letter-spacing:.3em;text-align:center;font-size:1.2rem"></label>'
      + '<div class="ferr" id="m-err"></div>'
      + '<label class="case"><input type="checkbox" id="m-exempt" '+(s.mfaExempt?'checked':'')+'> <span>Exempter ce compte<span class="quoi">Activer sans l’exiger à la connexion.</span></span></label>'
      + '</div>'
      + '<div class="tt" style="justify-content:flex-end;gap:.5rem;border-bottom:0;border-top:1px solid var(--v08)">'
      + '<button class="b" id="m-annuler">Annuler</button><button class="prim" id="m-activer">✓ Activer MFA</button></div></div>';
    document.body.appendChild(sur);
    document.getElementById('m-x').onclick=fermerMfa;
    document.getElementById('m-annuler').onclick=fermerMfa;
    document.getElementById('m-activer').onclick=function(){ mfaConfirmer(id); };
    var cc=document.getElementById('m-code'); if (cc) cc.oninput=function(){ cc.value=cc.value.replace(/[^0-9]/g,''); };
    // Repli du QR câblé en JS : un guillemet imbriqué dans un attribut serait
    // avalé par le littéral de gabarit de cette fenêtre (piège vécu, Lot B2).
    var qi=document.getElementById('m-qr'); if (qi) qi.onerror=function(){ qi.onerror=null; if (s.qrFallback) qi.src=s.qrFallback; };
  }
  function mfaExempter(id, exempt){
    if (OCCUPE) return; OCCUPE=true; dire('Enregistrement…');
    appeler('securite:mfa:exempter',[id, exempt]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ fermerMfa(); recharger(exempt?'Compte exempté de MFA.':'Exemption retirée.', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); });
  }
  function mfaDesactiver(id){
    if (OCCUPE) return; OCCUPE=true; dire('Désactivation…');
    appeler('securite:mfa:desactiver',[id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ fermerMfa(); recharger('MFA désactivé.', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); });
  }
  function mfaConfirmer(id){
    if (OCCUPE) return;
    var code=txv('m-code'), exempt=chkv('m-exempt');
    OCCUPE=true; dire('Vérification du code…');
    appeler('securite:mfa:confirmer',[id, code, exempt]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ fermerMfa(); recharger('MFA activé.', 'bon'); }
      else { var e=document.getElementById('m-err'); if (e){ e.textContent=expliquer(r); e.style.display='block'; } dire('Échec : '+expliquer(r), 'err'); } });
  }

  function recharger(msg, cl){
    appeler('securite:donnees',[]).then(function(r){
      if (r&&r.ok){ D=r; RO=!r.peutModifier; DELU=''; rendre(); if (msg) dire(msg, cl); }
      else if (msg) dire(msg, cl); });
  }

  function rendre(){
    var av=document.getElementById('ro'); if (av) av.hidden=!RO;
    vueUsers();
  }

  function charger(){
    dire('Chargement…');
    appeler('securite:donnees',[]).then(function(r){
      if (!r||!r.ok){ corps.innerHTML='<div class="vide">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; RO=!r.peutModifier; rendre(); dire('');
      if (UOUV){ var u=UOUV; UOUV=''; ouvrirEditeurCompte(u==='new' ? '' : u); }
      else if (MOUV){ var m=MOUV; MOUV=''; ouvrirMfa(m); }
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageSecurite };
