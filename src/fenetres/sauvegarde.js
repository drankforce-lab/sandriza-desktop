'use strict';

/*
 * FENÊTRE « SAUVEGARDE & RESTAURATION » — NATIVE (#27)
 * =============================================================================
 * Dernière entrée web du menu Sécurité. Chaque sauvegarde capture toute la base
 * Turso, un inventaire des objets Cloudflare R2 et la version du code déployé,
 * compressés puis chiffrés (AES-256-GCM) et gardés douze mois dans R2.
 *
 * Les cœurs vivent dans backup.js (contexte origine-plein) : backup.php est
 * appelé en POST same-origin avec le jeton de session. Rien n'est réécrit ici.
 *
 * ⚠ AUCUN SECRET NE TRAVERSE, ET IL N'Y EN A JAMAIS EU À FAIRE TRAVERSER.
 * `BACKUP_ENC_KEY` est une variable d'environnement du serveur : c'est
 * backup.php qui chiffre et déchiffre. Le champ `encKey` d'une sauvegarde N'EST
 * PAS une clé malgré son nom — c'est le CHEMIN de l'objet dans R2, que le
 * serveur revalide à chaque appel.
 *
 * ⚠⚠ CRÉER / RESTAURER / SUPPRIMER / PURGER = SUPER-ADMINISTRATEUR, et c'est le
 * SERVEUR qui le vérifie depuis le 2026-08-13 (backup.php). Ça ne l'était pas :
 * l'écran l'annonçait, le serveur ne regardait que « session du personnel ».
 * Les boutons masqués ci-dessous sont un confort, pas une protection.
 *
 * ⚠ Le TÉLÉCHARGEMENT se fait dans la PAGE (patron « fenêtre pilote », comme les
 * exports des Journaux) : c'est là que vivent les accroches du panneau
 * « Fichiers téléchargés ».
 *
 * ⚠ ANCRÉE = PLEINE PAGE. ⚠ Aucun caractère accent grave dans la portion script.
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
.carte{background:var(--v03);border:1px solid var(--v08);border-radius:12px;padding:1.1rem 1.2rem;margin:0 0 1.1rem}
.entete{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}
.quoi{font-size:.79rem;color:var(--tx2);line-height:1.6;margin:0;max-width:62rem}
.quoi b{color:var(--tx)}
.outils{display:flex;gap:.5rem;flex-wrap:wrap}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin:0 0 1.2rem}
@media(max-width:760px){.stat-grid{grid-template-columns:1fr}}
.stat{background:var(--v03);border:1px solid var(--v08);border-radius:12px;padding:1rem 1.1rem}
.stat .l{font-size:.74rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em}
.stat .v{font:700 1.5rem/1.15 Georgia,serif;margin-top:.25rem}
.stat .s{font-size:.72rem;color:var(--tx-gris);margin-top:.2rem}
table.tb{width:100%;border-collapse:collapse}
table.tb th{text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);padding:.5rem .7rem;border-bottom:1px solid var(--v11);white-space:nowrap}
table.tb td{padding:.6rem .7rem;border-bottom:1px solid var(--v05);font-size:.85rem;vertical-align:middle}
.mono{font-family:Consolas,monospace;font-size:.7rem;color:var(--tx-gris)}
.prim{font:inherit;font-size:.84rem;font-weight:700;border:0;border-radius:8px;padding:.5rem 1rem;background:#c9a97e;color:#1a1408;cursor:pointer}
.prim:disabled{opacity:.5;cursor:default}
.b{font:inherit;font-size:.8rem;border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;background:var(--v05);color:var(--tx);cursor:pointer}
.b:hover:not(:disabled){background:var(--v08)}
.b:disabled{opacity:.45;cursor:default}
.b.dgr{color:var(--tx-err2);border-color:rgba(248,113,113,.35)}
.b.dgr:hover:not(:disabled){background:rgba(248,113,113,.16)}
.b.att{color:var(--tx-or2);border-color:rgba(240,180,80,.35)}
.b.att:hover:not(:disabled){background:rgba(240,180,80,.14)}
.acts{white-space:nowrap;text-align:right}
.acts .b{margin-left:.3rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
.vide{padding:2.4rem 1rem;text-align:center;color:var(--tx2);font-size:.84rem;line-height:1.7}
/* ── Surcouches ─────────────────────────────────────────────────── */
.sur{position:fixed;inset:0;background:rgba(4,8,15,.72);display:flex;align-items:center;justify-content:center;z-index:60;padding:1.4rem}
.sur .boite{background:var(--f-carte2);border:1px solid var(--v11);border-radius:14px;max-width:620px;width:100%;max-height:92vh;display:flex;flex-direction:column}
.sur .tt{display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-bottom:1px solid var(--v08)}
.sur .tt h3{margin:0;font:700 1rem/1.2 Georgia,serif}
.sur .liste{padding:1rem 1.1rem;overflow-y:auto}
label.champ{display:block;margin:0 0 .9rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:var(--tx-gris);margin:.25rem 0 0;line-height:1.5}
input.t{width:100%;background:var(--f-champ);border:1px solid #2b3444;border-radius:8px;color:var(--tx);font:inherit;padding:.5rem .65rem}
input.t:focus{outline:none;border-color:#c9a97e}
input.t.manque{border-color:#f87171;background:rgba(248,113,113,.08)}
.garde{border-radius:9px;padding:.85rem 1rem;font-size:.83rem;line-height:1.6;margin:0 0 1rem}
.garde.jaune{background:rgba(234,179,8,.12);border:1px solid rgba(234,179,8,.4);color:var(--tx-or2)}
.garde.rouge{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.4);color:var(--tx-err2)}
.garde b{color:var(--tx)}
.nav{display:flex;justify-content:flex-end;align-items:center;gap:.6rem;width:100%}
/* ⚠ LE MESSAGE D'UNE SURCOUCHE VIT DANS LA SURCOUCHE — le pied de la fenêtre est
   derrière le voile, un avertissement s'y perdrait hors du champ de vision
   (défaut signalé le 2026-08-13 sur l'assistant des incidents). */
.msgsur{flex:1 1 auto;min-width:0;font-size:.79rem;color:var(--tx2);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msgsur.err{color:var(--tx-err)}.msgsur.bon{color:var(--tx-ok)}.msgsur.att{color:var(--tx-jaune)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* ⚠ Identifiant d'ouverture pour le banc (son DOM est factice, un clic n'y
   navigue nulle part) : 'creer', 'restaurer-<id>', 'supprimer-<id>'. */
function pageSauvegarde(ouverture) {
  var brut = String(ouverture || '');
  var CREER0 = brut === 'creer' ? '1' : '';
  var REST0 = '', SUPP0 = '';
  if (brut.indexOf('restaurer-') === 0) REST0 = brut.slice(10).replace(/[^A-Za-z0-9_.:/-]/g, '');
  else if (brut.indexOf('supprimer-') === 0) SUPP0 = brut.slice(10).replace(/[^A-Za-z0-9_.:/-]/g, '');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Sauvegarde &amp; Restauration — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.sauvegarde}</span><h1>Sauvegarde &amp; Restauration</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : créer, restaurer, supprimer et purger sont réservés au super-administrateur.</div>
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
  var D = null, RO = true, OCCUPE = false, FIGE = false;
  var CREER = '${CREER0}', REST = '${REST0}', SUPP = '${SUPP0}';

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  // Le message va DANS la surcouche quand il y en a une d'ouverte.
  function dire(t, cl){
    var loc = document.getElementById('s-msg');
    if (loc){ loc.textContent = (t==null?'':String(t)); loc.className = 'msgsur' + (cl?' '+cl:''); }
    szDire(t, cl);
  }
  function txv(id){ var e=document.getElementById(id); return e?String(e.value||''):''; }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès aux sauvegardes.',
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

  // ── Liste ────────────────────────────────────────────────────────
  function vueListe(){
    var l = D.sauvegardes || [];
    var octets = 0; for (var k=0;k<l.length;k++) octets += (+l[k].blobBytes || 0);
    var h = '<div class="entete">'
      + '<p class="quoi">Chaque sauvegarde capture l’intégralité de la base <b>Turso</b> (clients, produits, commandes, factures, remboursements, crédits, configuration), un <b>inventaire des objets Cloudflare R2</b> (images, reçus, documents) et la <b>version du code déployé</b>. Le tout est compressé puis <b>chiffré (AES-256-GCM)</b> et conservé '+(D.retentionMois||12)+' mois. La clé de chiffrement ne quitte jamais le serveur : un fichier téléchargé est illisible sans elle.</p>'
      + '<div class="outils">'
      + (D.peutEcrire ? '<button class="prim" id="s-nouveau">＋ Créer une sauvegarde</button>' : '')
      + '<button class="b" id="s-refresh">↻ Actualiser</button>'
      + (D.peutEcrire ? '<button class="b dgr" id="s-purger"><span class="ic">🗑</span> Purger (&gt; '+(D.retentionMois||12)+' mois)</button>' : '')
      + '</div></div>';

    h += '<div class="stat-grid">'
      + '<div class="stat"><div class="l">Sauvegardes</div><div class="v">'+l.length+'</div><div class="s">rétention '+(D.retentionMois||12)+' mois</div></div>'
      + '<div class="stat"><div class="l">La plus récente</div><div class="v" style="font-size:1.05rem;color:'+(l.length?'#6ee7a0':'#e6c14a')+'">'+(l.length?esc(l[0].quand):'aucune')+'</div><div class="s">'+(l.length?esc(l[0].taille):'le registre est vide')+'</div></div>'
      + '<div class="stat"><div class="l">Espace occupé</div><div class="v" style="font-size:1.3rem">'+fmtO(octets)+'</div><div class="s">dans Cloudflare R2</div></div>'
      + '</div>';

    if (!l.length){
      h += '<div class="carte"><div class="vide">Aucune sauvegarde.<br>'
        + (D.peutEcrire ? 'Cliquez « Créer une sauvegarde » pour en générer une.' : 'Seul le super-administrateur peut en créer une.')
        + '</div></div>';
      corps.innerHTML = h; lier(); return;
    }

    h += '<div class="carte" style="padding:0;overflow-x:auto"><table class="tb"><thead><tr>'
      + '<th>Date</th><th>Contenu</th><th style="text-align:center">Objets R2</th><th>Taille</th><th>Note</th><th></th>'
      + '</tr></thead><tbody>';
    for (var i=0;i<l.length;i++){ var b=l[i];
      h += '<tr><td style="white-space:nowrap;font-weight:600">'+esc(b.quand)
        + (b.commit?'<div class="mono">'+esc(b.commit)+'</div>':'')+'</td>'
        + '<td>'+b.total+' enreg.<div style="font-size:.72rem;color:var(--tx-gris)">'+b.produits+' produits · '+b.commandes+' cmd · '+b.factures+' fact.</div></td>'
        + '<td style="text-align:center">'+(b.r2Objects==null?'—':b.r2Objects)+'</td>'
        + '<td style="white-space:nowrap">'+esc(b.taille)+'</td>'
        + '<td style="color:var(--tx2)">'+esc(b.note||'—')+'</td>'
        + '<td class="acts">'
        + '<button class="b" data-dl="'+esc(b.encKey)+'" data-id="'+esc(b.id)+'" title="Télécharger le fichier chiffré">⬇ Télécharger</button>'
        + (D.peutEcrire ? '<button class="b att" data-rest="'+esc(b.encKey)+'" data-id="'+esc(b.id)+'" title="Réécrire la base à partir de cette sauvegarde">↩ Restaurer</button>' : '')
        + (D.peutEcrire ? '<button class="b dgr" data-del="'+esc(b.encKey)+'" data-id="'+esc(b.id)+'" title="Supprimer définitivement cette sauvegarde"><span class="ic">🗑</span> Supprimer</button>' : '')
        + '</td></tr>';
    }
    h += '</tbody></table></div>';
    corps.innerHTML = h;
    lier();
  }

  function fmtO(n){
    if (!n) return '0 o';
    if (n < 1024) return n + ' o';
    var u=['Ko','Mo','Go'], i=-1;
    do { n/=1024; i++; } while (n>=1024 && i<u.length-1);
    return (n<10 ? n.toFixed(1) : Math.round(n)) + ' ' + u[i];
  }

  function lier(){
    var b;
    b=document.getElementById('s-nouveau'); if (b) b.onclick=ouvrirCreer;
    b=document.getElementById('s-refresh'); if (b) b.onclick=function(){ recharger('Liste actualisée.', 'bon'); };
    b=document.getElementById('s-purger');  if (b) b.onclick=ouvrirPurge;
    var ds=corps.querySelectorAll('[data-dl]');
    for (var i=0;i<ds.length;i++) ds[i].onclick=function(){ telecharger(this.getAttribute('data-dl'), this.getAttribute('data-id')); };
    var rs=corps.querySelectorAll('[data-rest]');
    for (var j=0;j<rs.length;j++) rs[j].onclick=function(){ ouvrirRestaurer(this.getAttribute('data-rest'), this.getAttribute('data-id')); };
    var ss=corps.querySelectorAll('[data-del]');
    for (var k2=0;k2<ss.length;k2++) ss[k2].onclick=function(){ ouvrirSupprimer(this.getAttribute('data-del'), this.getAttribute('data-id')); };
  }

  // ── Surcouche générique ──────────────────────────────────────────
  function fermerSur(){ szPleinReinit(); var s=document.getElementById('sur-s'); if (s) s.remove(); }
  function ouvrirSur(titre, corpsH, piedH, largeur){
    fermerSur();
    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-s';
    sur.innerHTML = '<div class="boite"'+(largeur?' style="max-width:'+largeur+'"':'')+'>'
      + '<div class="tt"><h3>'+titre+'</h3>'
      + '<div><button class="sz-btnplein" id="s-plein" title="Occuper toute la fenêtre">⛶ Plein écran</button>'
      + '<button class="mini" id="s-x">Fermer</button></div></div>'
      + '<div class="liste">'+corpsH+'</div>'
      + '<div class="tt" style="border-bottom:0;border-top:1px solid var(--v08)">'
      + '<div class="nav"><span class="msgsur" id="s-msg"></span>'+piedH+'</div></div></div>';
    document.body.appendChild(sur);
    document.getElementById('s-x').onclick=fermerSur;
    var bp=document.getElementById('s-plein');
    if (bp) bp.onclick=function(){ szPleinBasculer(sur.querySelector('.boite'), bp); };
    return sur;
  }

  // ── Créer ────────────────────────────────────────────────────────
  function ouvrirCreer(){
    if (!D.peutEcrire) { dire(MOTIFS.droit, 'err'); return; }
    ouvrirSur('💾 Nouvelle sauvegarde',
      '<p class="quoi" style="margin:0 0 1rem">Ajoutez une <b>note</b> pour reconnaître cette sauvegarde plus tard — c’est facultatif. L’opération dompe toute la base, elle peut prendre un moment.</p>'
      + '<label class="champ"><span class="lbl">Note (facultatif)</span>'
      + '<input class="t" id="s-note" maxlength="200" placeholder="Ex. : avant mise à jour">'
      + '<span class="sub">200 caractères au plus.</span></label>',
      '<button class="b" id="s-annuler">Annuler</button><button class="prim" id="s-go"><span class="ic">💾</span> Créer la sauvegarde</button>');
    document.getElementById('s-annuler').onclick=fermerSur;
    document.getElementById('s-go').onclick=creer;
    var n=document.getElementById('s-note'); if (n) try { n.focus(); } catch(e){}
  }
  function creer(){
    if (OCCUPE) return; OCCUPE=true;
    var go=document.getElementById('s-go'); if (go){ go.disabled=true; go.textContent='⏳ Sauvegarde en cours…'; }
    dire('Sauvegarde en cours, ne fermez pas cette fenêtre…');
    appeler('sauvegarde:creer',[txv('s-note')]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ fermerSur(); D=r; RO=!r.peutEcrire; vueListe(); dire('Sauvegarde créée ('+(r.taille||'')+').', 'bon'); }
      else { if (go){ go.disabled=false; go.textContent='💾 Créer la sauvegarde'; } dire('Échec : '+expliquer(r), 'err'); }
    });
  }

  // ── Télécharger ──────────────────────────────────────────────────
  function telecharger(encKey, id){
    if (OCCUPE) return; OCCUPE=true; dire('Préparation du fichier…');
    appeler('sauvegarde:telecharger',[encKey, id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok) dire('Fichier chiffré téléchargé — gardez-le en lieu sûr. Il est illisible sans la clé du serveur.', 'bon');
      else dire('Échec : '+expliquer(r), 'err'); });
  }

  // ── Restaurer (confirmation écrite) ──────────────────────────────
  function ouvrirRestaurer(encKey, id){
    if (!D.peutEcrire) { dire(MOTIFS.droit, 'err'); return; }
    ouvrirSur('↩ Restaurer la base de données',
      '<div class="garde jaune"><span class="ic">⚠</span> Cette opération <b>réécrit</b> les données actuelles de Turso avec le contenu de la sauvegarde <b>'+esc(id)+'</b>. Les enregistrements portant le même identifiant seront écrasés. Elle ne supprime pas ce qui a été créé après la sauvegarde.</div>'
      + '<label class="champ"><span class="lbl">Pour confirmer, tapez RESTAURER</span>'
      + '<input class="t" id="s-conf" autocomplete="off" placeholder="RESTAURER"></label>',
      '<button class="b" id="s-annuler">Annuler</button><button class="b dgr" id="s-go">Restaurer maintenant</button>');
    document.getElementById('s-annuler').onclick=fermerSur;
    document.getElementById('s-go').onclick=function(){ restaurer(encKey); };
    var c=document.getElementById('s-conf'); if (c) c.oninput=function(){ c.classList.remove('manque'); };
  }
  function restaurer(encKey){
    if (OCCUPE) return;
    var c=document.getElementById('s-conf');
    if (!c || c.value.trim().toUpperCase() !== 'RESTAURER'){
      if (c) c.classList.add('manque');
      dire('Tapez RESTAURER pour confirmer.', 'att'); return;
    }
    OCCUPE=true;
    var go=document.getElementById('s-go'); if (go){ go.disabled=true; go.textContent='⏳ Restauration…'; }
    dire('Restauration en cours, ne fermez pas cette fenêtre…');
    appeler('sauvegarde:restaurer',[encKey]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){
        fermerSur();
        // ⚠ ON FIGE L'ÉCRAN. La fenêtre principale se recharge pour relire une
        // base qui vient de changer sous elle ; pendant ces quelques secondes le
        // pont ne répond pas. Laisser les boutons vivants inviterait à cliquer
        // dans le vide et à conclure que la restauration a échoué.
        FIGE = true;
        corps.innerHTML = '<div class="carte"><div class="vide"><span class="ic">✅</span> Restauration terminée — <b>'+(r.total||0)+'</b> enregistrements rétablis.<br><br>La fenêtre principale se recharge pour relire la base. Patientez quelques secondes, puis cliquez « ↻ Actualiser ».<br><br><button class="b" id="s-reprendre">↻ Actualiser</button></div></div>';
        var rb=document.getElementById('s-reprendre');
        if (rb) rb.onclick=function(){ FIGE=false; recharger('Liste actualisée.', 'bon'); };
        dire('Restauration terminée ('+(r.total||0)+' enregistrements).', 'bon');
      } else {
        if (go){ go.disabled=false; go.textContent='Restaurer maintenant'; }
        dire('Échec : '+expliquer(r), 'err');
      }
    });
  }

  // ── Supprimer (confirmation écrite) ──────────────────────────────
  function ouvrirSupprimer(encKey, id){
    if (!D.peutEcrire) { dire(MOTIFS.droit, 'err'); return; }
    ouvrirSur('🗑 Supprimer la sauvegarde',
      '<div class="garde rouge"><span class="ic">⚠</span> Cette action supprime <b>définitivement</b> la sauvegarde <b>'+esc(id)+'</b> de Cloudflare R2. Elle sera <b>irrécupérable</b>.</div>'
      + '<label class="champ"><span class="lbl">Pour confirmer, tapez DÉTRUIRE</span>'
      + '<input class="t" id="s-conf" autocomplete="off" placeholder="DÉTRUIRE"></label>',
      '<button class="b" id="s-annuler">Annuler</button><button class="b dgr" id="s-go">Supprimer définitivement</button>');
    document.getElementById('s-annuler').onclick=fermerSur;
    document.getElementById('s-go').onclick=function(){ supprimer(encKey); };
    var c=document.getElementById('s-conf'); if (c) c.oninput=function(){ c.classList.remove('manque'); };
  }
  function supprimer(encKey){
    if (OCCUPE) return;
    var c=document.getElementById('s-conf');
    // On accepte la saisie sans accent : refuser DETRUIRE parce qu'il manque un
    // accent serait un piège, pas un garde-fou.
    var v = c ? c.value.trim().toUpperCase() : '';
    if (v !== 'DÉTRUIRE' && v !== 'DETRUIRE'){
      if (c) c.classList.add('manque');
      dire('Tapez DÉTRUIRE pour confirmer.', 'att'); return;
    }
    OCCUPE=true;
    var go=document.getElementById('s-go'); if (go){ go.disabled=true; go.textContent='⏳ Suppression…'; }
    appeler('sauvegarde:supprimer',[encKey]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ fermerSur(); D=r; RO=!r.peutEcrire; vueListe(); dire('Sauvegarde supprimée.', 'bon'); }
      else { if (go){ go.disabled=false; go.textContent='Supprimer définitivement'; } dire('Échec : '+expliquer(r), 'err'); }
    });
  }

  // ── Purge (rétention) ────────────────────────────────────────────
  function ouvrirPurge(){
    if (!D.peutEcrire) { dire(MOTIFS.droit, 'err'); return; }
    ouvrirSur('🗑 Purger les vieilles sauvegardes',
      '<div class="garde rouge"><span class="ic">⚠</span> Toutes les sauvegardes de plus de <b>'+(D.retentionMois||12)+' mois</b> sont détruites de Cloudflare R2. <b>Irréversible.</b></div>'
      + '<p class="quoi" style="margin:0">Les sauvegardes plus récentes ne sont pas touchées.</p>',
      '<button class="b" id="s-annuler">Annuler</button><button class="b dgr" id="s-go">Purger</button>', '520px');
    document.getElementById('s-annuler').onclick=fermerSur;
    document.getElementById('s-go').onclick=purger;
  }
  function purger(){
    if (OCCUPE) return; OCCUPE=true;
    var go=document.getElementById('s-go'); if (go){ go.disabled=true; go.textContent='⏳ Purge…'; }
    appeler('sauvegarde:purger',[]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ fermerSur(); D=r; RO=!r.peutEcrire; vueListe();
        dire(r.retirees ? (r.retirees+' sauvegarde(s) supprimée(s).') : 'Aucune sauvegarde à purger.', 'bon'); }
      else { if (go){ go.disabled=false; go.textContent='Purger'; } dire('Échec : '+expliquer(r), 'err'); }
    });
  }

  function recharger(msg, cl){
    if (OCCUPE) return; OCCUPE=true; dire('Lecture…');
    appeler('sauvegarde:donnees',[]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ D=r; RO=!r.peutEcrire; rendre(); if (msg) dire(msg, cl); }
      else dire('Échec : '+expliquer(r), 'err'); });
  }

  function rendre(){
    var av=document.getElementById('ro'); if (av) av.hidden=!RO;
    if (!FIGE) vueListe();
  }

  function charger(){
    dire('Chargement…');
    appeler('sauvegarde:donnees',[]).then(function(r){
      if (!r||!r.ok){ corps.innerHTML='<div class="vide">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; RO=!r.peutEcrire; rendre(); dire('');
      if (CREER){ CREER=''; ouvrirCreer(); }
      else if (REST){ var e=REST; REST=''; ouvrirRestaurer(e, e); }
      else if (SUPP){ var s=SUPP; SUPP=''; ouvrirSupprimer(s, s); }
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageSauvegarde };
