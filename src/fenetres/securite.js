'use strict';

/*
 * FENÊTRE « ACCÈS UTILISATEURS » (SÉCURITÉ) — NATIVE (palier 5, #6)
 * =============================================================================
 * LOT A : l'onglet « Sécurité » (politique de mots de passe, inactivité du
 * personnel et des clients, verrouillage de session à l'écran, restriction
 * géographique) et l'onglet « Utilisateurs » EN LECTURE (liste + statistiques).
 *
 * ⚠ LOT B À VENIR : création/édition d'un compte, MATRICE DE PERMISSIONS, MFA,
 * invitations, suppression, réactivation. En attendant, ces actions restent dans
 * l'écran web (le bouton renvoie vers le repli). C'est écrit dans l'onglet.
 *
 * Les cœurs vivent dans staff.js (contexte origine-plein) : les clés pw_policy /
 * inactivity_cfg / geo_restrict_cfg sont dans _CFG_MAP, donc un enregistrement
 * pousse vers Turso comme le reste de la configuration. Rien n'est local seulement.
 *
 * ⚠ ANCRÉE = PLEINE PAGE (aucun max-width sur le conteneur des cartes).
 * ⚠ Aucun caractère accent grave dans la portion de script.
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
.ro{flex:0 0 auto;margin:.55rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:#f0d6a0;border-radius:9px;padding:.45rem .7rem;font-size:.78rem}
.onglets{flex:0 0 auto;display:flex;gap:.1rem;flex-wrap:wrap;
  padding:.35rem 1rem 0;border-bottom:1px solid rgba(255,255,255,.08)}
.onglets button{font:inherit;font-size:.82rem;white-space:nowrap;background:none;border:none;
  color:#8fa1b8;padding:.5rem .85rem;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
.onglets button.on{color:#c9a97e;border-bottom-color:#c9a97e;font-weight:700}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:1.1rem 1.2rem;margin:0 0 1.1rem}
.carte h3{margin:0 0 .2rem;font:700 1rem/1.2 Georgia,serif}
.entete{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}
.hint{font-size:.78rem;color:#8fa1b8;margin:0 0 .9rem;line-height:1.5}
.grpH{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#8fa1b8;margin:0 0 .55rem}
.cols3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.25rem}
.cols2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.1rem}
@media(max-width:760px){.cols3,.cols2{grid-template-columns:1fr}}
label.champ{display:block;margin:0 0 .75rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8;margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:#6f8098;margin:.2rem 0 0}
input.t,textarea.t{width:100%;background:#0f1724;border:1px solid #2b3444;border-radius:8px;color:#e8edf5;font:inherit;padding:.5rem .65rem}
input.n{width:120px}
textarea.t{resize:vertical;min-height:3.4rem;line-height:1.5}
input.t:focus,textarea.t:focus{outline:none;border-color:#c9a97e}
label.case{display:flex;align-items:center;gap:.45rem;font-size:.84rem;cursor:pointer;margin:0 0 .45rem}
label.case input{width:16px;height:16px;accent-color:#c9a97e}
.prim{font:inherit;font-size:.84rem;font-weight:700;border:0;border-radius:8px;padding:.5rem 1rem;background:#c9a97e;color:#1a1408;cursor:pointer}
.prim:disabled{opacity:.5;cursor:default}
.b{font:inherit;font-size:.8rem;border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.42rem .8rem;background:rgba(255,255,255,.05);color:#e8edf5;cursor:pointer}
.b:hover{background:rgba(255,255,255,.09)}
.exempts{display:flex;flex-direction:column;gap:.35rem;max-height:240px;overflow-y:auto;
  border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:.6rem .7rem}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin:0 0 1.2rem}
.stat{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:1rem 1.1rem}
.stat .l{font-size:.74rem;color:#8fa1b8;text-transform:uppercase;letter-spacing:.05em}
.stat .v{font:700 1.7rem/1.1 Georgia,serif;margin-top:.25rem}
table.tb{width:100%;border-collapse:collapse}
table.tb th{text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8;padding:.5rem .7rem;border-bottom:1px solid rgba(255,255,255,.1)}
table.tb td{padding:.6rem .7rem;border-bottom:1px solid rgba(255,255,255,.06);font-size:.85rem;vertical-align:middle}
.pill{display:inline-block;font-size:.66rem;font-weight:700;padding:2px 7px;border-radius:99px;white-space:nowrap}
.pill.on{background:rgba(22,163,74,.2);color:#6ee7a0}
.pill.off{background:rgba(220,38,38,.18);color:#fca5a5}
.pill.mfa{background:rgba(99,102,241,.18);color:#b6b9f7;margin-left:4px}
.pill.warn{background:rgba(234,179,8,.18);color:#e6c14a;margin-left:4px}
.pill.moi{background:rgba(59,130,246,.18);color:#93c5fd;margin-left:5px}
.note{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:.85rem 1rem;font-size:.82rem;color:#8fa1b8;line-height:1.6}
.note b{color:#e8edf5}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
.vide{padding:1rem;text-align:center;color:#8fa1b8;font-size:.82rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);color:#e8edf5;cursor:pointer;-webkit-user-select:none;user-select:none}
.b.dgr{color:#f6a6a6;border-color:rgba(248,113,113,.35)}
.b.dgr:hover{background:rgba(248,113,113,.16)}
.acts{white-space:nowrap;text-align:right}
.acts .b{margin-left:.3rem}
/* ── Éditeur de compte (surcouche) ──────────────────────────────── */
.sur{position:fixed;inset:0;background:rgba(4,8,15,.72);display:flex;align-items:center;justify-content:center;z-index:60;padding:1.4rem}
.sur .boite{background:#131c2b;border:1px solid rgba(255,255,255,.12);border-radius:14px;max-width:820px;width:100%;max-height:92vh;display:flex;flex-direction:column}
.sur .tt{display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08)}
.sur .tt h3{margin:0;font:700 1rem/1.2 Georgia,serif}
.sur .liste{padding:1rem 1.1rem;overflow-y:auto}
select.t{width:100%;background:#0f1724;border:1px solid #2b3444;border-radius:8px;color:#e8edf5;font:inherit;padding:.5rem .65rem}
select.t:focus{outline:none;border-color:#c9a97e}
details.bloc{border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:.6rem .85rem;margin:.2rem 0 .8rem}
details.bloc summary{font-size:.82rem;font-weight:600;cursor:pointer;color:#8fa1b8}
.permtb{width:100%;border-collapse:collapse;margin-top:.6rem}
.permtb th{font-size:.68rem;color:#8fa1b8;font-weight:600;padding:.25rem .5rem;text-align:center;white-space:nowrap}
.permtb th.mod{text-align:left}
.permtb td{padding:.2rem .5rem;text-align:center;font-size:.8rem}
.permtb td.mod{text-align:left;white-space:nowrap}
.permtb tr.grp td{font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#8fa1b8;background:rgba(255,255,255,.03);padding:.45rem .5rem .25rem;border-top:1px solid rgba(255,255,255,.1);text-align:left}
.permtb input{accent-color:#c9a97e}
.ferr{display:none;color:#fca5a5;font-size:.82rem;padding:.5rem .7rem;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);border-radius:8px;margin:.3rem 0}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* ⚠ La fenêtre accepte un ONGLET d'ouverture (comme Pages), pour que le banc
   puisse atteindre chaque onglet : son DOM est factice, un clic n'y navigue nulle
   part. 'securite' (réglages) par défaut, 'users' pour la liste des comptes. */
function pageSecurite(onglet) {
  var brut = String(onglet || '');
  // Ouverture directe de l'éditeur de compte pour le BANC (le DOM factice ne
  // clique pas) : 'user-new' (création) ou 'user-<id>' (édition).
  var UOUV0 = '';
  if (brut.indexOf('user-') === 0) { UOUV0 = brut.slice(5).replace(/[^A-Za-z0-9_-]/g, ''); brut = 'users'; }
  const ONGLET0 = (['securite', 'users'].indexOf(brut) >= 0) ? brut : 'securite';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Accès Utilisateurs — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🛡</span><h1>Accès Utilisateurs</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
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
  var D = null, RO = false, OCCUPE = false;
  var ONGLET = '${ONGLET0}';
  var UOUV = '${UOUV0}';   // ouverture directe de l'éditeur de compte (banc) : 'new' ou '<id>'
  var DELU = '';   // id du compte en attente de confirmation de suppression (2 clics)

  var ONGLETS = [ ['securite','🔒 Sécurité'], ['users','👥 Utilisateurs'] ];

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function numv(id, def){ var e=document.getElementById(id); var n=e?parseInt(e.value,10):NaN; return Number.isFinite(n)?n:def; }
  function chkv(id){ var e=document.getElementById(id); return !!(e&&e.checked); }
  function txv(id){ var e=document.getElementById(id); return e?String(e.value||''):''; }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès aux accès utilisateurs.',
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

  function tabs(){
    var h='';
    for (var i=0;i<ONGLETS.length;i++){ var o=ONGLETS[i];
      h+='<button data-k="'+o[0]+'" class="'+(ONGLET===o[0]?'on':'')+'">'+esc(o[1])+'</button>'; }
    ongletsEl.innerHTML=h;
    var bs=ongletsEl.querySelectorAll('button');
    for (var j=0;j<bs.length;j++) bs[j].onclick=function(){ ONGLET=this.getAttribute('data-k'); rendre(); };
  }

  // ── Petits fabricants de champs ──────────────────────────────────
  function champNum(id, lbl, val, sub){
    return '<label class="champ"><span class="lbl">'+esc(lbl)+'</span>'
      + '<input class="t n" type="number" id="'+id+'" value="'+esc(val)+'"'+(RO?' disabled':'')+'>'
      + (sub?'<span class="sub">'+esc(sub)+'</span>':'')+'</label>';
  }
  function caseAC(id, lbl, coche){
    return '<label class="case"><input type="checkbox" id="'+id+'" '+(coche?'checked':'')+(RO?' disabled':'')+'> '+esc(lbl)+'</label>';
  }

  // ── ONGLET SÉCURITÉ ──────────────────────────────────────────────
  function vueSecurite(){
    var p = D.pwPolicy||{}, c = D.inactivity||{}, g = D.geo||{};
    var comptes = D.comptes||[];

    var h = '';

    // Politique de mots de passe
    h += '<div class="carte"><div class="entete"><h3>🔑 Politique des mots de passe</h3>'
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
      + '<div><div class="grpH">Fréquence & verrouillage</div>'
      + caseAC('pw-rate-on', 'Activer la limite de fréquence', p.changeRateEnabled)
      + champNum('pw-rate-n', 'Max. de changements…', p.changeRateCount)
      + champNum('pw-rate-h', '… dans cette fenêtre (heures)', p.changeRateHours)
      + champNum('pw-lock-h', 'Durée du verrouillage (heures)', p.changeLockHours)
      + '<label class="champ"><span class="lbl">Notifier (courriel, optionnel)</span>'
      + '<input class="t" type="email" id="pw-notify" value="'+esc(p.changeLockNotifyEmail||'')+'" placeholder="responsable@exemple.com"'+(RO?' disabled':'')+'></label>'
      + '</div>'
      + '</div></div>';

    // Inactivité + verrouillage de session
    h += '<div class="carte"><div class="entete"><h3>⏳ Inactivité & verrouillage de session</h3>'
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

    // Restriction géographique
    var exempts = '';
    if (comptes.length) {
      for (var i=0;i<comptes.length;i++){ var s=comptes[i];
        var coche = (g.exemptStaffIds||[]).indexOf(s.id) >= 0;
        exempts += '<label class="case"><input type="checkbox" data-geoex="'+esc(s.id)+'" '+(coche?'checked':'')+(RO?' disabled':'')+'> '
          + esc(s.nom||s.email) + ' <span style="color:#6f8098">('+esc(s.email)+')</span></label>';
      }
    } else exempts = '<div class="vide">Aucun compte.</div>';

    h += '<div class="carte"><div class="entete"><h3>🌍 Restriction géographique — administration</h3>'
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
      + (RO?'':'<button class="b" id="geo-loc">🔍 Détecter ma localisation actuelle</button>')
      + '</div>'
      + '<div><div class="grpH">Comptes exclus de cette restriction</div>'
      + '<div class="exempts">'+exempts+'</div>'
      + '<div class="sub" style="margin-top:.4rem;color:#6f8098">Ces comptes peuvent se connecter depuis n’importe quel pays.</div>'
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

  // ── ONGLET UTILISATEURS (lecture) ────────────────────────────────
  function fmtTs(iso){ if (!iso) return 'Jamais'; try { return new Date(iso).toLocaleString('fr-CA'); } catch(e){ return '—'; } }
  function vueUsers(){
    var st = D.stats||{}, comptes = D.comptes||[];
    var superActifs = 0; for (var k=0;k<comptes.length;k++) if (comptes[k].estSuper && comptes[k].active) superActifs++;
    var h = '<div class="entete"><div></div>'
      + (D.peutModifier ? '<button class="prim" id="u-nouveau">＋ Créer un accès</button>' : '') + '</div>';
    h += '<div class="stat-grid">'
      + '<div class="stat"><div class="l">Comptes totaux</div><div class="v">'+(st.total||0)+'</div></div>'
      + '<div class="stat"><div class="l">Comptes actifs</div><div class="v" style="color:#6ee7a0">'+(st.actifs||0)+'</div></div>'
      + '<div class="stat"><div class="l">MFA activé</div><div class="v" style="color:#b6b9f7">'+(st.mfa||0)+'</div></div>'
      + '</div>';
    var colspan = D.peutModifier ? 5 : 4;
    h += '<div class="carte"><table class="tb"><thead><tr><th>Utilisateur</th><th>Rôle</th><th>Statut</th><th>Dernière connexion</th>'+(D.peutModifier?'<th></th>':'')+'</tr></thead><tbody>';
    if (!comptes.length) h += '<tr><td colspan="'+colspan+'" class="vide">Aucun utilisateur.</td></tr>';
    for (var i=0;i<comptes.length;i++){ var s=comptes[i];
      var mfa = s.mfaEnabled ? '<span class="pill mfa">MFA ✓</span>'
        : (s.requireMfaSetup ? '<span class="pill warn">MFA à configurer</span>'
        : (s.mfaExempt ? '<span class="pill warn">Exempté</span>' : ''));
      var peutSuppr = !s.estMoi && (!s.estSuper || superActifs > 1);
      var acts = '';
      if (D.peutModifier){
        acts = '<td class="acts"><button class="b" data-edit="'+esc(s.id)+'">✏ Modifier</button>'
          + (!s.estSuper ? '<button class="b" data-invite="'+esc(s.id)+'" title="Renvoyer un mot de passe temporaire par courriel">📧 Renvoyer</button>' : '')
          + (peutSuppr ? '<button class="b dgr" data-del="'+esc(s.id)+'">'+(DELU===s.id?'✓ Confirmer':'Supprimer')+'</button>' : '')
          + '</td>';
      }
      h += '<tr><td><strong>'+esc(s.nom||'—')+'</strong>'+(s.estMoi?'<span class="pill moi">vous</span>':'')
        + '<div style="font-size:.74rem;color:#6f8098">'+(s.username?'@'+esc(s.username)+' · ':'')+esc(s.email)+'</div></td>'
        + '<td><span style="font-weight:600;color:'+esc(s.roleColor||'#8fa1b8')+'">'+esc(s.roleIcon||'')+' '+esc(s.roleLabel||s.role)+'</span></td>'
        + '<td>'+(s.active?'<span class="pill on">Actif</span>':'<span class="pill off">Désactivé</span>')+mfa+'</td>'
        + '<td style="font-size:.8rem;color:#8fa1b8">'+fmtTs(s.derniereConnexion)+'<div style="font-size:.7rem">'+(s.nbConnexions||0)+' connexion(s)</div></td>'
        + acts + '</tr>';
    }
    h += '</tbody></table></div>';
    h += '<div class="note">ℹ La gestion du <b>MFA</b> (activation par QR / code, exemption, désactivation) se fait pour l’instant dans l’<b>écran web</b> — elle arrive à la prochaine étape (Lot B2).</div>';
    corps.innerHTML = h;
    var nv=document.getElementById('u-nouveau'); if (nv) nv.onclick=function(){ ouvrirEditeurCompte(''); };
    var eds=corps.querySelectorAll('[data-edit]'); for (var e=0;e<eds.length;e++) eds[e].onclick=function(){ ouvrirEditeurCompte(this.getAttribute('data-edit')); };
    var invs=corps.querySelectorAll('[data-invite]'); for (var v=0;v<invs.length;v++) invs[v].onclick=function(){ inviterCompte(this.getAttribute('data-invite')); };
    var dels=corps.querySelectorAll('[data-del]'); for (var d=0;d<dels.length;d++) dels[d].onclick=function(){ var id=this.getAttribute('data-del');
      if (DELU===id){ DELU=''; supprimerCompte(id); } else { DELU=id; vueUsers(); dire('Cliquez encore pour supprimer ce compte.', 'att'); } };
  }

  // ── Création / édition d'un compte (Lot B1) ──────────────────────
  function ouvrirEditeurCompte(id){
    if (OCCUPE) return; OCCUPE=true; dire('Ouverture…');
    appeler('securite:form',[id||'']).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ dire(''); dessinerEditeurCompte(r); } else dire('Échec : '+expliquer(r), 'err'); });
  }
  function fermerEditeurCompte(){ var s=document.getElementById('sur-u'); if (s) s.remove(); }
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
    h += '</tbody></table>';
    return h;
  }
  function dessinerEditeurCompte(F){
    var nouv = (F.mode!=='edit');
    var c = F.compte||{};
    var roles = F.roles||[];
    var roleOpts=''; for (var i=0;i<roles.length;i++) roleOpts += '<option value="'+esc(roles[i].key)+'"'+((c.role||'admin')===roles[i].key?' selected':'')+'>'+esc(roles[i].icon||'')+' '+esc(roles[i].label)+'</option>';
    var qs = F.questions||[];
    var qOpts=function(sel){ var o='<option value="">— Choisir —</option>'; for (var i=0;i<qs.length;i++) o+='<option value="'+esc(qs[i])+'"'+(sel===qs[i]?' selected':'')+'>'+esc(qs[i])+'</option>'; return o; };
    var ansSet = !!c.securityAnswersSet;

    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-u';
    var h='<div class="boite"><div class="tt"><h3>'+(nouv?'Créer un accès':'Modifier — '+esc((c.firstName||'')+' '+(c.lastName||'')))+'</h3>'
      + '<button class="mini" id="u-x">Fermer</button></div>'
      + '<div class="liste">'
      + '<div class="ferr" id="u-err"></div>'
      + '<div class="cols2">'
      + '<label class="champ"><span class="lbl">Prénom</span><input class="t" id="u-first" value="'+esc(c.firstName||'')+'"></label>'
      + '<label class="champ"><span class="lbl">Nom</span><input class="t" id="u-last" value="'+esc(c.lastName||'')+'"></label>'
      + '<label class="champ"><span class="lbl">Nom d’utilisateur</span><input class="t" id="u-username" value="'+esc(c.username||'')+'" placeholder="ex : marie_b"></label>'
      + '<label class="champ"><span class="lbl">Courriel'+(nouv?'':' (non modifiable)')+'</span><input class="t" type="email" id="u-email" value="'+esc(c.email||'')+'"'+(nouv?'':' readonly style="opacity:.7"')+'></label>'
      + '</div>'
      + '<label class="champ"><span class="lbl">'+(nouv?'Mot de passe (vide = généré automatiquement)':'Nouveau mot de passe (vide = inchangé)')+'</span><input class="t" type="password" id="u-pw" autocomplete="new-password"></label>'
      + '<div class="cols2">'
      + '<label class="champ" style="margin:0"><span class="lbl">Rôle</span><select class="t" id="u-role">'+roleOpts+'</select></label>'
      + '<div style="display:flex;flex-direction:column;justify-content:flex-end;gap:.2rem">'
      + '<label class="case"><input type="checkbox" id="u-active" '+(c.active!==false?'checked':'')+'> Compte actif</label>'
      + '<label class="case"><input type="checkbox" id="u-reqmfa" '+(c.requireMfaSetup&&!c.mfaEnabled?'checked':'')+'> Exiger la configuration MFA à la 1ʳᵉ connexion</label>'
      + '<label class="case"><input type="checkbox" id="u-exempt" '+(c.mfaExempt?'checked':'')+'> Exempté de MFA</label>'
      + '</div></div>'
      + '<details class="bloc"'+((!nouv && !(c.securityQ1&&c.securityQ2))?' open':'')+'><summary>🔐 Questions de sécurité'+(nouv?'':(ansSet?' — ✓ configurées':' — ⚠ non configurées'))+'</summary>'
      + '<div class="cols2" style="margin-top:.6rem">'
      + '<label class="champ" style="margin:0"><span class="lbl">Question 1</span><select class="t" id="u-q1">'+qOpts(c.securityQ1||'')+'</select></label>'
      + '<label class="champ" style="margin:0"><span class="lbl">Réponse 1</span><input class="t" id="u-a1" autocomplete="off" placeholder="'+(ansSet?'Inchangée':'Réponse')+'"></label>'
      + '<label class="champ" style="margin:0"><span class="lbl">Question 2</span><select class="t" id="u-q2">'+qOpts(c.securityQ2||'')+'</select></label>'
      + '<label class="champ" style="margin:0"><span class="lbl">Réponse 2</span><input class="t" id="u-a2" autocomplete="off" placeholder="'+(ansSet?'Inchangée':'Réponse')+'"></label>'
      + '</div><div class="sub" style="margin-top:.4rem;color:#6f8098">Les réponses sont chiffrées et ne se réaffichent plus. Vide = conserver.</div></details>'
      + '<details class="bloc"><summary>⚙ Permissions personnalisées (modifient les droits du rôle)</summary><div id="u-perms">'+permMatrice(F)+'</div></details>'
      + '</div>'
      + '<div class="tt" style="justify-content:flex-end;gap:.5rem;border-bottom:0;border-top:1px solid rgba(255,255,255,.08)">'
      + '<button class="b" id="u-annuler">Annuler</button>'
      + '<button class="prim" id="u-enr">'+(nouv?'Créer le compte':'Enregistrer')+'</button></div></div>';
    sur.innerHTML=h;
    document.body.appendChild(sur);
    document.getElementById('u-x').onclick=fermerEditeurCompte;
    document.getElementById('u-annuler').onclick=fermerEditeurCompte;
    document.getElementById('u-enr').onclick=function(){ enregistrerCompte(nouv?'':(c.id||'')); };
    // Slug du nom d'utilisateur : minuscules/chiffres/_/-
    var un=document.getElementById('u-username'); if (un) un.oninput=function(){ un.value=un.value.toLowerCase().replace(/[^a-z0-9_-]/g,''); };
    // Changer de rôle recoche la matrice selon les permissions du rôle.
    var rs=document.getElementById('u-role'); if (rs) rs.onchange=function(){
      var role=rs.value, def=null; for (var i=0;i<roles.length;i++) if (roles[i].key===role) def=roles[i];
      var perms=(def&&def.permissions)||[];
      var cbs=document.querySelectorAll('#u-perms [data-perm]');
      for (var j=0;j<cbs.length;j++) cbs[j].checked = perms.indexOf(cbs[j].getAttribute('data-perm'))>=0;
    };
  }
  function ferr(msg){ var e=document.getElementById('u-err'); if (e){ e.textContent=msg; e.style.display='block'; } }
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
    OCCUPE=true; dire('Enregistrement…');
    appeler('securite:compte:ecrire',[id||'', d]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){
        fermerEditeurCompte();
        var msg = (r.mode==='create')
          ? ('Compte créé.' + (r.courrielEnvoye ? ' Courriel d’accueil envoyé à '+(r.courriel||'')+'.' : (r.tempPassword ? ' Mot de passe temporaire : '+r.tempPassword+' (courriel non envoyé).' : ' (courriel non envoyé).')))
          : 'Compte modifié.';
        recharger(msg, 'bon');
      } else { ferr(expliquer(r)); dire('Échec : '+expliquer(r), 'err'); }
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
  function recharger(msg, cl){
    appeler('securite:donnees',[]).then(function(r){ if (r&&r.ok){ D=r; RO=!r.peutModifier; DELU=''; if (ONGLET==='users') vueUsers(); if (msg) dire(msg, cl); } else if (msg) dire(msg, cl); });
  }

  function rendre(){
    var av=document.getElementById('ro'); if (av) av.hidden=!RO;
    tabs();
    if (ONGLET==='users') vueUsers(); else vueSecurite();
  }

  function charger(){
    dire('Chargement…');
    appeler('securite:donnees',[]).then(function(r){
      if (!r||!r.ok){ corps.innerHTML='<div class="vide">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; RO=!r.peutModifier; rendre(); dire('');
      // Ouverture directe de l'éditeur de compte (banc / lien profond), après le
      // dessin de la liste et une fois D disponible.
      if (UOUV){ ouvrirEditeurCompte(UOUV==='new' ? '' : UOUV); UOUV=''; }
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageSecurite };
