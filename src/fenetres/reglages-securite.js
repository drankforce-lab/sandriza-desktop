'use strict';

/*
 * FENÊTRE « RÉGLAGES DE SÉCURITÉ » — NATIVE (#29)
 * =============================================================================
 * Politique des mots de passe, comptes dormants, verrouillage de session à
 * l'écran, restriction géographique.
 *
 * ⚠ SORTIE D'« ACCÈS UTILISATEURS » LE 2026-08-14, À SA DEMANDE. Les deux
 * cohabitaient en onglets : d'un côté la GESTION des comptes (un geste
 * quotidien, sur une personne précise), de l'autre des RÉGLAGES qui valent pour
 * toute l'entreprise et qu'on touche deux fois par an. Les mêler faisait passer
 * devant des réglages structurants à chaque fois qu'on créait un compte — et
 * obligeait à traverser la gestion pour atteindre un réglage.
 *
 * ⚠ AUCUN CŒUR N'A BOUGÉ : cette fenêtre appelle les MÊMES opérations
 * (securite:donnees / pwpolicy / inactivite / geo / verif). La séparation est
 * une affaire de présentation, pas de calcul — sans quoi deux écrans auraient
 * fini par ne plus dire la même chose.
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
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--v03);border:1px solid var(--v08);border-radius:12px;padding:1.1rem 1.2rem;margin:0 0 1.1rem}
.carte h3{margin:0 0 .2rem;font:700 1rem/1.2 Georgia,serif}
.entete{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}
.hint{font-size:.78rem;color:var(--tx2);margin:0 0 .9rem;line-height:1.5}
.grpH{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--tx2);margin:0 0 .55rem}
.cols3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.25rem}
.cols2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.1rem}
@media(max-width:760px){.cols3,.cols2{grid-template-columns:1fr}}
label.champ{display:block;margin:0 0 .75rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:var(--tx-gris);margin:.2rem 0 0}
input.t,textarea.t{width:100%;background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;color:var(--tx);font:inherit;padding:.5rem .65rem}
input.n{width:120px}
textarea.t{resize:vertical;min-height:3.4rem;line-height:1.5}
input.t:focus,textarea.t:focus{outline:none;border-color:#c9a97e}
label.case{display:flex;align-items:center;gap:.45rem;font-size:.84rem;cursor:pointer;margin:0 0 .45rem}
label.case input{width:16px;height:16px;accent-color:#c9a97e}
.prim{font:inherit;font-size:.84rem;font-weight:700;border:0;border-radius:8px;padding:.5rem 1rem;background:#c9a97e;color:#1a1408;cursor:pointer}
.prim:disabled{opacity:.5;cursor:default}
.b{font:inherit;font-size:.8rem;border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;background:var(--v05);color:var(--tx);cursor:pointer}
.b:hover{background:var(--v09)}
.exempts{display:flex;flex-direction:column;gap:.35rem;max-height:240px;overflow-y:auto;
  border:1px solid var(--v08);border-radius:9px;padding:.6rem .7rem}
.vide{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageReglagesSecurite() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Réglages de sécurité — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.securite}</span><h1>Réglages de sécurité</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter ces réglages, pas les modifier.</div>
<div class="corps"><div id="corps"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div></div>
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

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function numv(id, def){ var e=document.getElementById(id); var n=e?parseInt(e.value,10):NaN; return Number.isFinite(n)?n:def; }
  function chkv(id){ var e=document.getElementById(id); return !!(e&&e.checked); }
  function txv(id){ var e=document.getElementById(id); return e?String(e.value||''):''; }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès aux réglages de sécurité.',
    lecture_seule:'Votre rôle est en lecture seule.',
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

  function champNum(id, lbl, val, sub){
    return '<label class="champ"><span class="lbl">'+esc(lbl)+'</span>'
      + '<input class="t n" type="number" id="'+id+'" value="'+esc(val)+'"'+(RO?' disabled':'')+'>'
      + (sub?'<span class="sub">'+esc(sub)+'</span>':'')+'</label>';
  }
  function caseAC(id, lbl, coche){
    return '<label class="case"><input type="checkbox" id="'+id+'" '+(coche?'checked':'')+(RO?' disabled':'')+'> '+esc(lbl)+'</label>';
  }

  function dessiner(){
    var p = D.pwPolicy||{}, c = D.inactivity||{}, g = D.geo||{};
    var comptes = D.comptes||[];
    var h = '';

    h += '<div class="carte"><div class="entete"><h3><span class="ic">🔑</span> Politique des mots de passe</h3>'
      + (RO?'':'<button class="prim" id="s-pw">Enregistrer la politique</button>')+'</div>'
      + '<div class="hint">Ne s’applique pas au super-administrateur.</div>'
      + '<div class="cols3">'
      + '<div><div class="grpH">Expiration</div>'
      + caseAC('pw-exp-on', 'Activer l’expiration', p.expiryEnabled)
      + champNum('pw-exp-days', 'Expiration après (jours)', p.expiryDays, 'Ex. : 60 = tous les 2 mois.')
      + '</div>'
      + '<div><div class="grpH">Complexité</div>'
      + champNum('pw-min', 'Longueur minimale', p.minLength)
      + caseAC('pw-up', 'Exiger une majuscule', p.requireUpper)
      + caseAC('pw-nb', 'Exiger un chiffre', p.requireNumber)
      + caseAC('pw-sp', 'Exiger un caractère spécial', p.requireSpecial)
      + champNum('pw-hist', 'Historique (mdp interdits)', p.historyCount, '0 = aucun historique.')
      + '</div>'
      + '<div><div class="grpH">Fréquence &amp; verrouillage</div>'
      + caseAC('pw-rate-on', 'Activer la limite de fréquence', p.changeRateEnabled)
      + champNum('pw-rate-n', 'Max. de changements…', p.changeRateCount)
      + champNum('pw-rate-h', '… dans cette fenêtre (heures)', p.changeRateHours)
      + champNum('pw-lock-h', 'Durée du verrouillage (heures)', p.changeLockHours)
      + '<label class="champ"><span class="lbl">Notifier (courriel, optionnel)</span>'
      + '<input class="t" type="email" id="pw-notify" value="'+esc(p.changeLockNotifyEmail||'')+'" placeholder="responsable@exemple.com"'+(RO?' disabled':'')+'></label>'
      + '</div>'
      + '</div></div>';

    h += '<div class="carte"><div class="entete"><h3>⏳ Inactivité &amp; verrouillage de session</h3>'
      + (RO?'':'<button class="prim" id="s-inact">Enregistrer</button>')+'</div>'
      + '<div class="cols2">'
      + '<div><div class="grpH">Portail administration — comptes dormants</div>'
      + caseAC('in-staff-on', 'Désactiver les comptes inactifs (sauf superadmin)', c.staffEnabled)
      + champNum('in-staff-d', 'Seuil (jours)', c.staffDays, 'Avertissement 14 jours avant.')
      + (RO?'':'<button class="b" id="in-staff-run">▶ Vérifier maintenant</button>')
      + '</div>'
      + '<div><div class="grpH">Portail client — comptes dormants</div>'
      + caseAC('in-cust-on', 'Désactiver les comptes clients inactifs', c.custEnabled)
      + champNum('in-cust-d', 'Seuil (jours)', c.custDays, 'Avertissement 30 jours avant.')
      + (RO?'':'<button class="b" id="in-cust-run">▶ Vérifier maintenant</button>')
      + '</div>'
      + '</div>'
      + '<div class="grpH" style="margin-top:1rem">Verrouillage de session à l’écran</div>'
      + '<div class="hint">Ferme la session d’administration après un temps sans clic ni changement de page — différent des comptes dormants ci-dessus (jours sans se connecter).</div>'
      + '<div class="cols3">'
      + champNum('idle-warn', 'Avertir après (minutes)', c.idleWarnMin||15, 'Défaut : 15.')
      + champNum('idle-out', 'Décompte avant fermeture (secondes)', c.idleLogoutSec||60, 'Défaut : 60.')
      + champNum('idle-max', 'Plafond absolu (minutes)', c.idleMaxMin||60, 'Même si un éditeur est ouvert. Défaut : 60.')
      + '</div></div>';

    var exempts = '';
    if (comptes.length) {
      for (var i=0;i<comptes.length;i++){ var s=comptes[i];
        var coche = (g.exemptStaffIds||[]).indexOf(s.id) >= 0;
        exempts += '<label class="case"><input type="checkbox" data-geoex="'+esc(s.id)+'" '+(coche?'checked':'')+(RO?' disabled':'')+'> '
          + esc(s.nom||s.email) + ' <span style="color:var(--tx-gris)">('+esc(s.email)+')</span></label>';
      }
    } else exempts = '<div class="vide">Aucun compte.</div>';

    h += '<div class="carte"><div class="entete"><h3><span class="ic">🌍</span> Restriction géographique — administration</h3>'
      + (RO?'':'<button class="prim" id="s-geo">Enregistrer la restriction</button>')+'</div>'
      + '<div class="hint">N’autorise la connexion au portail d’administration que depuis les pays listés (géolocalisation de l’IP publique). La boutique cliente n’est jamais touchée.</div>'
      + caseAC('geo-on', 'Activer la restriction géographique', g.enabled)
      + '<div class="cols2" style="margin-top:.6rem">'
      + '<div>'
      + '<label class="champ"><span class="lbl">Pays autorisés (codes ISO, séparés par des virgules)</span>'
      + '<input class="t" id="geo-pays" value="'+esc((g.allowedCountries||['CA']).join(', '))+'" placeholder="CA"'+(RO?' disabled':'')+'>'
      + '<span class="sub">Ex. : CA ou CA, US.</span></label>'
      + '<label class="champ"><span class="lbl">Adresses IP exclues (une par ligne)</span>'
      + '<textarea class="t" id="geo-ip" rows="3"'+(RO?' disabled':'')+'>'+esc((g.ipExceptions||[]).join('\\n'))+'</textarea>'
      + '<span class="sub">Ces IP restent autorisées peu importe le pays.</span></label>'
      + (RO?'':'<button class="b" id="geo-loc"><span class="ic">🔍</span> Détecter ma localisation actuelle</button>')
      + '</div>'
      + '<div><div class="grpH">Comptes exclus de cette restriction</div>'
      + '<div class="exempts">'+exempts+'</div>'
      + '<div class="sub" style="margin-top:.4rem;color:var(--tx-gris)">Ces comptes peuvent se connecter depuis n’importe quel pays.</div>'
      + '</div>'
      + '</div></div>';

    corps.innerHTML = h;
    lier();
  }

  function lier(){
    var b;
    b=document.getElementById('s-pw');    if (b) b.onclick=enrPw;
    b=document.getElementById('s-inact'); if (b) b.onclick=enrInact;
    b=document.getElementById('s-geo');   if (b) b.onclick=enrGeo;
    b=document.getElementById('in-staff-run'); if (b) b.onclick=function(){ verif('securite:verif:staff','Vérification du personnel…'); };
    b=document.getElementById('in-cust-run');  if (b) b.onclick=function(){ verif('securite:verif:client','Vérification des clients…'); };
    b=document.getElementById('geo-loc'); if (b) b.onclick=localiser;
  }

  function enrPw(){
    if (RO||OCCUPE) return; OCCUPE=true; dire('Enregistrement…');
    var d = {
      expiryEnabled: chkv('pw-exp-on'), expiryDays: numv('pw-exp-days',60),
      minLength: numv('pw-min',8), requireUpper: chkv('pw-up'), requireNumber: chkv('pw-nb'),
      requireSpecial: chkv('pw-sp'), historyCount: numv('pw-hist',5),
      changeRateEnabled: chkv('pw-rate-on'), changeRateCount: numv('pw-rate-n',3),
      changeRateHours: numv('pw-rate-h',24), changeLockHours: numv('pw-lock-h',24),
      changeLockNotifyEmail: txv('pw-notify').trim()
    };
    appeler('securite:pwpolicy:ecrire',[d]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ if (r.pwPolicy) D.pwPolicy=r.pwPolicy; dire('Politique enregistrée.', 'bon'); }
      else dire('Échec : '+expliquer(r), 'err'); });
  }
  function enrInact(){
    if (RO||OCCUPE) return; OCCUPE=true; dire('Enregistrement…');
    var d = {
      staffEnabled: chkv('in-staff-on'), staffDays: numv('in-staff-d',180),
      custEnabled: chkv('in-cust-on'), custDays: numv('in-cust-d',730),
      idleWarnMin: numv('idle-warn',15), idleLogoutSec: numv('idle-out',60), idleMaxMin: numv('idle-max',60)
    };
    appeler('securite:inactivite:ecrire',[d]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ if (r.inactivity) D.inactivity=r.inactivity; dire('Paramètres enregistrés.', 'bon'); }
      else dire('Échec : '+expliquer(r), 'err'); });
  }
  function enrGeo(){
    if (RO||OCCUPE) return; OCCUPE=true; dire('Enregistrement…');
    var pays = txv('geo-pays').split(',').map(function(s){ return s.trim().toUpperCase(); }).filter(Boolean);
    var ips = txv('geo-ip').split('\\n').map(function(s){ return s.trim(); }).filter(Boolean);
    var ex = [];
    var cbs = corps.querySelectorAll('[data-geoex]');
    for (var i=0;i<cbs.length;i++) if (cbs[i].checked) ex.push(cbs[i].getAttribute('data-geoex'));
    var d = { enabled: chkv('geo-on'), allowedCountries: pays, ipExceptions: ips, exemptStaffIds: ex };
    appeler('securite:geo:ecrire',[d]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ if (r.geo) D.geo=r.geo; dire('Restriction enregistrée.', 'bon'); }
      else dire('Échec : '+expliquer(r), 'err'); });
  }
  function verif(op, msg){
    if (RO||OCCUPE) return; OCCUPE=true; dire(msg);
    appeler(op,[]).then(function(r){ OCCUPE=false;
      if (r&&r.ok) dire('Vérification effectuée.', 'bon'); else dire('Échec : '+expliquer(r), 'err'); });
  }
  function localiser(){
    if (OCCUPE) return; OCCUPE=true; dire('Localisation…');
    appeler('securite:geo:malocalisation',[]).then(function(r){ OCCUPE=false;
      if (r&&r.ok) dire('Votre IP : '+r.ip+' — '+(r.drapeau||'')+' '+(r.pays||'emplacement inconnu'), 'bon');
      else dire('Échec : '+expliquer(r), 'err'); });
  }

  function charger(){
    dire('Chargement…');
    appeler('securite:donnees',[]).then(function(r){
      if (!r||!r.ok){ corps.innerHTML='<div class="vide m-'+((r&&r.motif)||'echec')+'">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; RO=!r.peutModifier;
      var av=document.getElementById('ro'); if (av) av.hidden=!RO;
      dessiner(); dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageReglagesSecurite };
