'use strict';

/*
 * FENÊTRE « MON PROFIL » — NATIVE (#30)
 * =============================================================================
 * Un des six écrans qui n'avaient AUCUNE version dans l'application (audit du
 * 2026-08-14). Ses informations, son mot de passe, ses questions de sécurité.
 *
 * ⚠ CET ÉCRAN N'A PAS DE PERMISSION DE SECTION, ET C'EST VOULU : c'est SON
 * compte. Le pont n'exige donc qu'une session — mais les cœurs relisent
 * `getCurrentStaff`, si bien qu'on ne peut modifier que le sien.
 *
 * ⚠ LE MOT DE PASSE ACTUEL EST VÉRIFIÉ PAR LE SERVEUR. Il l'était autrefois
 * dans le navigateur, ce qui ne marchait que parce que le mot de passe en clair
 * y séjournait — il n'y est plus, et une vérification d'authentification se
 * contourne en changeant une variable.
 * ⚠ LES RÉPONSES DE SÉCURITÉ NE SE RÉAFFICHENT JAMAIS : elles sont hachées. On
 * dit seulement si elles sont configurées ; pour les changer, on redonne les
 * deux.
 *
 * ⚠ ANCRÉE = PLEINE PAGE. ⚠ Aucun accent grave dans la portion de script.
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
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.deux{display:grid;grid-template-columns:repeat(auto-fit,minmax(24rem,1fr));gap:1rem;align-items:start}
.carte{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:13px;padding:1.1rem 1.2rem}
.carte h3{margin:0 0 .9rem;font:700 1rem/1.2 Georgia,serif}
.moi{display:flex;align-items:center;gap:.8rem;padding:0 0 .85rem;margin:0 0 .85rem;border-bottom:1px solid rgba(255,255,255,.08)}
.jeton{width:46px;height:46px;border-radius:50%;background:rgba(201,169,126,.16);border:1px solid rgba(201,169,126,.3);
  display:flex;align-items:center;justify-content:center;font-size:1.35rem;flex:0 0 auto}
.moi .nom{font-weight:700;font-size:1rem}
.moi .role{font-size:.78rem;color:#8fa1b8}
.faits{display:grid;grid-template-columns:auto 1fr;gap:.35rem .9rem;font-size:.85rem}
.faits .k{color:#8fa1b8}
.ok{color:#6ee7a0}.att{color:#e6c14a}
label.champ{display:block;margin:0 0 .8rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8;margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:#6f8098;margin:.25rem 0 0;line-height:1.5}
input.t,select.t{width:100%;background:#0f1724;border:1px solid #2b3444;border-radius:8px;color:#e8edf5;font:inherit;padding:.5rem .65rem}
input.t:focus,select.t:focus{outline:none;border-color:#c9a97e}
.prim{font:inherit;font-size:.84rem;font-weight:700;border:0;border-radius:8px;padding:.5rem 1rem;background:#c9a97e;color:#1a1408;cursor:pointer}
.prim:disabled{opacity:.5;cursor:default}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);color:#e8edf5;cursor:pointer;-webkit-user-select:none;user-select:none}
.note{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:9px;
  padding:.75rem .9rem;font-size:.81rem;color:#8fa1b8;line-height:1.6;margin:0 0 .9rem}
.note b{color:#e8edf5}
.ferr{display:none;color:#fca5a5;font-size:.82rem;padding:.5rem .7rem;background:rgba(248,113,113,.1);
  border:1px solid rgba(248,113,113,.3);border-radius:8px;margin:0 0 .8rem}
.cols2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
@media(max-width:640px){.cols2{grid-template-columns:1fr}}
.vide{padding:2.2rem 1rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageProfil() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Mon profil — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🛡</span><h1>Mon profil</h1></div>
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
  var D = null, OCCUPE = false;

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function txv(id){ var e=document.getElementById(id); return e?String(e.value||''):''; }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    invalide:'Saisie invalide.',
    refus:'Le serveur a refusé la modification.',
    indisponible:'L’administration n’est pas encore chargée dans la fenêtre principale.',
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

  function fmtTs(iso){ if (!iso) return '—'; try { return new Date(iso).toLocaleString('fr-CA', { dateStyle:'medium', timeStyle:'short' }); } catch(e){ return '—'; } }
  function qOpts(sel, exclu){
    var l = D.questions || [], o = '<option value="">— Choisir —</option>';
    for (var i=0;i<l.length;i++){
      if (exclu && l[i] === exclu) continue;
      o += '<option value="'+esc(l[i])+'"'+(sel===l[i]?' selected':'')+'>'+esc(l[i])+'</option>';
    }
    return o;
  }

  function dessiner(){
    var h = '<div class="deux">';

    h += '<div class="carte"><h3>Informations</h3>'
      + '<div class="moi"><div class="jeton">'+esc(D.roleIcone||'👤')+'</div>'
      + '<div><div class="nom">'+esc(D.nom)+'</div><div class="role">'+esc(D.role)+'</div></div></div>'
      + '<div class="faits">'
      + '<span class="k">Identifiant</span><span>'+(D.identifiant?'@'+esc(D.identifiant):'—')+'</span>'
      + '<span class="k">Courriel</span><span>'+esc(D.courriel)+'</span>'
      + '<span class="k">Dernière connexion</span><span>'+esc(fmtTs(D.derniereConnexion))+'</span>'
      + '<span class="k">Questions de sécurité</span>'
      + (D.questionsPosees ? '<span class="ok">✓ configurées</span>' : '<span class="att">⚠ non configurées</span>')
      + '</div></div>';

    h += '<div class="carte"><h3>Changer le mot de passe</h3>'
      + '<div class="ferr" id="p-err"></div>'
      + '<label class="champ"><span class="lbl">Mot de passe actuel</span>'
      + '<input class="t" type="password" id="p-cur" autocomplete="current-password"></label>'
      + '<label class="champ"><span class="lbl">Nouveau mot de passe</span>'
      + '<input class="t" type="password" id="p-new" autocomplete="new-password">'
      + '<span class="sub">Huit caractères au moins. Un mot de passe déjà utilisé sera refusé.</span></label>'
      + '<label class="champ"><span class="lbl">Confirmer</span>'
      + '<input class="t" type="password" id="p-cnf" autocomplete="new-password"></label>'
      + '<button class="prim" id="p-go">Enregistrer le nouveau mot de passe</button></div>';

    h += '</div>';

    h += '<div class="carte" style="margin-top:1rem"><h3>Questions de sécurité</h3>'
      + '<div class="note">Elles servent à retrouver votre accès si vous perdez votre mot de passe. '
      + (D.questionsPosees
          ? 'Vos réponses sont <b>enregistrées et chiffrées</b> : elles ne peuvent plus être réaffichées. Pour les changer, redonnez les <b>deux</b>.'
          : '<b>Aucune réponse enregistrée</b> : sans elles, votre compte ne pourra pas être récupéré par cette voie.')
      + '</div>'
      + '<div class="ferr" id="q-err"></div>'
      + '<div class="cols2">'
      + '<label class="champ"><span class="lbl">Question 1</span><select class="t" id="q-q1">'+qOpts(D.q1, D.q2)+'</select></label>'
      + '<label class="champ"><span class="lbl">Réponse 1</span><input class="t" id="q-a1" autocomplete="off"></label>'
      + '<label class="champ"><span class="lbl">Question 2</span><select class="t" id="q-q2">'+qOpts(D.q2, D.q1)+'</select></label>'
      + '<label class="champ"><span class="lbl">Réponse 2</span><input class="t" id="q-a2" autocomplete="off"></label>'
      + '</div>'
      + '<button class="prim" id="q-go">Enregistrer les questions</button></div>';

    corps.innerHTML = h;
    document.getElementById('p-go').onclick = motDePasse;
    document.getElementById('q-go').onclick = questions;
    /* ⚠ LES DEUX LISTES S EXCLUENT L UNE L AUTRE. Choisir deux fois la meme
       question ne protege plus rien, et le serveur refuse : autant l empecher
       AVANT la saisie des reponses, plutot que d annoncer l echec apres. */
    var s1=document.getElementById('q-q1'), s2=document.getElementById('q-q2');
    function resync(){
      var v1=s1.value, v2=s2.value;
      s1.innerHTML=qOpts(v1, v2); s2.innerHTML=qOpts(v2, v1);
    }
    s1.onchange=resync; s2.onchange=resync;
  }

  function ferr(id, msg){ var e=document.getElementById(id); if (e){ e.textContent=msg; e.style.display=msg?'block':'none'; } }

  function motDePasse(){
    if (OCCUPE) return; OCCUPE=true; ferr('p-err',''); dire('Vérification…');
    appeler('profil:motdepasse',[txv('p-cur'), txv('p-new'), txv('p-cnf')]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ dire('Mot de passe modifié.', 'bon'); charger(); }
      else { ferr('p-err', expliquer(r)); dire('Échec : '+expliquer(r), 'err'); } });
  }
  function questions(){
    if (OCCUPE) return; OCCUPE=true; ferr('q-err',''); dire('Enregistrement…');
    appeler('profil:questions',[txv('q-q1'), txv('q-a1'), txv('q-q2'), txv('q-a2')]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ if (r.nom) D=r; dessiner(); dire('Questions de sécurité enregistrées.', 'bon'); }
      else { ferr('q-err', expliquer(r)); dire('Échec : '+expliquer(r), 'err'); } });
  }

  function charger(){
    dire('Chargement…');
    appeler('profil:donnees',[]).then(function(r){
      if (!r||!r.ok){ corps.innerHTML='<div class="vide">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; dessiner(); dire('');
    });
  }

  window.szRevenir = function(){ if (!OCCUPE) charger(); };
  charger();
})();
</script></body></html>`;
}

module.exports = { pageProfil };
