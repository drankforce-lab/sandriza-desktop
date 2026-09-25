'use strict';

/*
 * FENÊTRE « LISTE NOIRE » — NATIVE (#30)
 * =============================================================================
 * Un des six écrans qui n'avaient AUCUNE version dans l'application (audit du
 * 2026-08-14). Les règles — format du courriel, refus des doublons,
 * normalisation — vivent dans les cœurs (admin.js), partagées avec l'écran web.
 *
 * ⚠ L'AUTOCOMPLÉTION D'ADRESSE NE SUIT PAS, ET C'EST DIT À L'ÉCRAN. L'écran web
 * branche le champ « rue » sur le moteur de la caisse, qui vit dans la page. Ici
 * on demande la rue ET la ville à la main : mieux vaut une saisie manuelle
 * assumée qu'un champ qui promet des suggestions et n'en donne jamais.
 *
 * ⚠ ANCRÉE = PLEINE PAGE. ⚠ Aucun accent grave dans la portion de script.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit — jamais la valeur d une entree,
   qui est comparee A LA CAISSE (voir src/langue/listenoire.js). */
const T = require('../langue').tr('listenoire');

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
.entete{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}
.quoi{font-size:.79rem;color:var(--tx2);line-height:1.6;margin:0;max-width:60rem}
.quoi b{color:var(--tx)}
/* ── La refonte de l Inventaire (2026-09-25) ── */
.tuiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem;flex:0 0 auto;margin-bottom:.7rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);min-width:0}
.tuile .sub{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tuile.cliq{cursor:pointer;user-select:none;position:relative}
.tuile.cliq:hover{border-color:#c9a97e}
.tuile.cliq::after{content:"›";position:absolute;top:.55rem;right:.8rem;font-size:1.1rem;color:var(--tx3)}
.tuile.on{border-color:#c9a97e}
table{width:100%;font-size:.85rem}
thead th{text-align:left;text-transform:uppercase;font-weight:700;white-space:nowrap}
tbody td{vertical-align:middle}
td.acts{text-align:right;white-space:nowrap}
.rf-nom code{font-family:ui-monospace,monospace;font-size:.88rem;background:none;padding:0;border:0}
.carte{background:var(--v03);border:1px solid var(--v08);border-radius:12px;padding:1rem 1.1rem;margin:0 0 1rem}
.carte.ajout{border-color:rgba(201,169,126,.42)}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:.8rem}
label.champ{display:block;margin:0}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:var(--tx-gris);margin:.25rem 0 0;line-height:1.5}
input.t,select.t{width:100%;background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;color:var(--tx);font:inherit;padding:.45rem .6rem}
input.t:focus,select.t:focus{outline:none;border-color:#c9a97e}
.sug{position:absolute;left:0;right:0;top:100%;z-index:20;margin-top:2px;background:var(--f-carte2);
  border:1px solid var(--v12);border-radius:8px;box-shadow:0 10px 28px rgba(0,0,0,.5);
  max-height:15rem;overflow:auto;display:none}
.sug-it{padding:.45rem .6rem;cursor:pointer;border-bottom:1px solid var(--v05)}
.sug-it:hover{background:rgba(201,169,126,.14)}
.sug-it .r{font-weight:600;font-size:.84rem}
.sug-it .v{font-size:.72rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sug-vide{padding:.5rem .6rem;font-size:.8rem;color:var(--tx2)}
.sug-src{padding:.25rem .6rem;font-size:.66rem;color:var(--tx2);border-top:1px solid var(--v06)}
.prim{font:inherit;font-size:.84rem;font-weight:700;border:0;border-radius:8px;padding:.5rem 1rem;background:#c9a97e;color:#1a1408;cursor:pointer}
.prim:disabled{opacity:.5;cursor:default}
.b{font:inherit;font-size:.8rem;border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;background:var(--v05);color:var(--tx);cursor:pointer}
.b:hover:not(:disabled){background:var(--v09)}
.b.dgr{color:var(--tx-f6a6a6);border-color:rgba(248,113,113,.35)}
.b.dgr:hover{background:rgba(248,113,113,.16)}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.pied2{display:flex;justify-content:flex-end;gap:.5rem;margin-top:.9rem}
code{font-family:Consolas,monospace;font-size:.82rem;background:var(--v05);padding:1px 6px;border-radius:5px}
.acts{text-align:right;white-space:nowrap}
.vide{padding:2.2rem 1rem;text-align:center;color:var(--tx2);font-size:.84rem;line-height:1.7}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageListeNoire(ouverture) {
  var AJOUT0 = String(ouverture || '') === 'ajout' ? '1' : '';
  return `${TETE()}
<title>${T("Liste noire — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.blacklist}</span><h1>${T("Liste noire")}</h1></div>
<div class="ro" id="ro" hidden>${T("Lecture seule : vous pouvez consulter la liste, pas la modifier.")}</div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
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
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES()}
  var corps = document.getElementById('corps');
  var D = null, RO = true, OCCUPE = false;
  var AJOUT = '${AJOUT0}' === '1';
  var TYPE = 'email';
  var DELID = '';
  var SUG_TIMER = null;   // #42 : anti-rebond des suggestions d'adresse

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function txv(id){ var e=document.getElementById(id); return e?String(e.value||''):''; }

  var MOTIFS = {
    session:'${T("Aucune session ouverte. Connectez-vous dans la fenêtre principale.")}',
    droit:'${T("Votre rôle ne donne pas accès à la liste noire.")}',
    invalide:'${T("Saisie invalide.")}',
    doublon:'${T("Cette valeur est déjà dans la liste.")}',
    introuvable:'${T("Entrée introuvable.")}',
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

  /* Le type se dit dans la langue du poste : le libelle du site (typeLabel)
     arrive en francais. On le garde en repli pour un type nouveau. */
  var LIB_TYPE = { email: '${T("Courriel")}', postal: '${T("Code postal")}', address: '${T("Adresse")}' };
  var AV_TYPE = { email: '@', postal: '#', address: '⌂' };
  var FT = '';      // '' | email | postal | address — filtre local (la liste est entiere)
  var QL = '';      // recherche locale
  function libType(e){ return LIB_TYPE[e.type] || szTd(e.typeLabel || ''); }
  function dessiner(){
    var toutes = D.entrees || [];
    var ql = QL.trim().toLowerCase();
    var l = toutes.filter(function(e){
      if (FT && e.type !== FT) return false;
      if (ql && (String(e.valeur || '') + ' ' + String(e.note || '')).toLowerCase().indexOf(ql) < 0) return false;
      return true;
    });
    var compte = function(t){ return toutes.filter(function(e){ return e.type === t; }).length; };
    var h = '<div class="entete">'
      + '<p class="quoi">${T("Une commande dont le <b>courriel</b>, le <b>code postal</b> ou l’<b>adresse de livraison</b> figure ici est refusée à la caisse. Retirer une entrée redonne le droit de commander.")}</p>'
      + (D.peutAjouter && !AJOUT ? '<button class="prim" id="l-nouveau">${T("＋ Ajouter une entrée")}</button>' : '')
      + '</div>';
    /* ══ LA REFONTE DE L INVENTAIRE, APPLIQUEE A LA LISTE NOIRE (2026-09-25) ══
       Trois tuiles par type (la liste arrive entiere : le compte est honnete),
       qui filtrent d un clic ; recherche locale ; ligne riche (la valeur en
       gras, le type et la note dessous). Crochets gardes : #l-nouveau,
       #l-type, #l-valeur, #l-ville, #l-note, #l-ajouter, #l-annuler, data-del,
       #ln-exporter. */
    if (toutes.length) {
      var tu = function(t, lib, sous){
        return '<div class="tuile cliq' + (FT === t ? ' on' : '') + '" data-lnt="' + t + '" title="${T("Cliquer pour filtrer")}">'
          + '<div class="lbl">' + lib + '</div><div class="val">' + compte(t) + '</div><div class="sub">' + sous + '</div></div>';
      };
      h += szTuiles('<div class="tuiles">'
        + tu('email', '${T("Courriels")}', '${T("refusés à la caisse")}')
        + tu('postal', '${T("Codes postaux")}', '${T("toute adresse du secteur")}')
        + tu('address', '${T("Adresses")}', '${T("adresse de livraison exacte")}')
        + '</div>');
      h += '<div class="carte" style="margin-bottom:.7rem"><div class="rf-tb">'
        + '<label class="rf-rch">${ICO.loupe}<input aria-label="${T("Rechercher dans la liste noire")}" type="search" id="ln-q" placeholder="${T("Valeur ou note…")}" value="' + esc(QL) + '"></label>'
        + ['', 'email', 'postal', 'address'].map(function(t){
            return '<button class="rf-jet' + (FT === t ? ' on' : '') + '" data-lnt="' + t + '">'
              + (t ? LIB_TYPE[t] : '${T("Tous les types")}') + '</button>';
          }).join('')
        + '<span class="rf-droite"><span class="dt">' + l.length + ' ' + (l.length > 1 ? '${T("entrées")}' : '${T("entrée")}') + '</span></span>'
        + '</div></div>';
    }

    if (AJOUT && D.peutAjouter) {
      h += '<div class="carte ajout"><div class="cols">'
        + '<label class="champ"><span class="lbl">${T("Type")}</span><select class="t" id="l-type">'
        + '<option value="email"'+(TYPE==='email'?' selected':'')+'>${T("Courriel")}</option>'
        + '<option value="postal"'+(TYPE==='postal'?' selected':'')+'>${T("Code postal")}</option>'
        + '<option value="address"'+(TYPE==='address'?' selected':'')+'>${T("Adresse de livraison")}</option>'
        + '</select></label>';
      if (TYPE === 'address') {
        h += '<label class="champ" style="position:relative"><span class="lbl">${T("Rue")}</span>'
          + '<input class="t" id="l-valeur" placeholder="${T("1234 rue Principale")}" autocomplete="off">'
          + '<div class="sug" id="l-sug"></div></label>'
          + '<label class="champ"><span class="lbl">${T("Ville")}</span><input class="t" id="l-ville" placeholder="${T("Québec")}"></label>';
      } else {
        h += '<label class="champ"><span class="lbl">${T("Valeur")}</span><input class="t" id="l-valeur" placeholder="'
          + (TYPE==='postal' ? '${T("G1H 1T4")}' : '${T("client@exemple.com")}') + '"></label>';
      }
      h += '<label class="champ"><span class="lbl">${T("Note (facultatif)")}</span><input class="t" id="l-note" placeholder="${T("Raison, numéro de commande…")}"></label>'
        + '</div><div class="pied2"><button class="b" id="l-annuler">${T("Annuler")}</button>'
        + '<button class="prim" id="l-ajouter">${T("Ajouter")}</button></div></div>';
    }

    if (!l.length && toutes.length) {
      h += '<div class="carte"><div class="vide">${T("Aucune entrée ne correspond.")}</div></div>';
    } else if (!l.length) {
      h += '<div class="carte"><div class="vide">${T("Aucune entrée.<br>C’est la bonne nouvelle — la liste ne sert qu’à écarter ce qui pose problème.")}</div></div>';
    } else {
      h += '<div class="carte plein"><div class="liste" style="overflow-x:auto"><table><thead><tr>'
        + '<th>${T("Entrée")}</th><th>${T("Ajouté le")}</th>'
        + (D.peutRetirer ? '<th></th>' : '') + '</tr></thead><tbody>';
      for (var i=0;i<l.length;i++){ var e=l[i];
        h += '<tr><td><div class="rf-prod"><span class="rf-av" aria-hidden="true">' + esc(AV_TYPE[e.type] || '?') + '</span>'
          + '<div style="min-width:0"><div class="rf-nom"><code>' + esc(e.valeur) + '</code></div>'
          + '<div class="rf-sous"><span>' + esc(libType(e)) + '</span>'
          + (e.note ? '<span>·</span><span>' + esc(e.note) + '</span>' : '') + '</div></div></div></td>'
          + '<td style="white-space:nowrap;color:var(--tx2)">'+esc(e.quand)+'</td>'
          + (D.peutRetirer ? '<td class="acts"><button class="b dgr" data-del="'+esc(e.id)+'">'
              +(DELID===e.id?'${T("✓ Confirmer")}':'${T("Retirer")}')+'</button></td>' : '')
          + '</tr>';
      }
      h += '</tbody></table></div></div>';
      /* Le pied ferme la liste et porte l export (2026-09-19). ⚠ Il n est PAS
         dessine sous une liste vide : ici l etat vide dit une bonne nouvelle
         (<< la liste ne sert qu a ecarter ce qui pose probleme >>), et lui
         coller un compte a zero dessous en ferait un constat d echec. */
      h += szPied(
        l.length + ' ' + (l.length > 1 ? '${T("entrées")}' : '${T("entrée")}'),
        '<button class="b" id="ln-exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>');
    }
    /* ⚠⚠ PLEINE HAUTEUR, MAIS PAS TOUJOURS (2026-09-19). Le tableau doit
       descendre jusqu au bas de la fenetre — sauf que cet ecran est le seul a
       n avoir AUCUN position:fixed : son formulaire d ajout vit DANS le flux.
       Sous << corps plein >> (overflow:hidden), une fenetre courte le
       couperait sans barre de defilement et sans rien dire. Le corps reprend
       donc son defilement normal tant que le formulaire est ouvert — et aussi
       sur la liste vide, ou il n y a rien a etirer. Meme regle que le
       repertoire de fournisseurs : l adoption est un choix par VUE. */
    corps.className = (l.length && !(AJOUT && D.peutAjouter)) ? 'corps plein' : 'corps';
    corps.innerHTML = h;
    lier();

    /* ⚠ LE TYPE PART EN CLAIR (typeLabel), pas en code interne : le fichier
       se lit par quelqu un qui n a pas l ecran sous les yeux. */
    var exl = document.getElementById('ln-exporter');
    if (exl) exl.onclick = function(){
      var lignes = l.map(function(e){
        return [libType(e), e.valeur || '', e.note || '', e.quand || ''];
      });
      if (!lignes.length) { dire('${T("Rien à exporter.")}', 'att'); return; }
      var csv = szCSV(['${T("Type")}', '${T("Valeur")}', '${T("Note")}', '${T("Ajouté le")}'], lignes);
      szExporter('liste-noire-' + new Date().toISOString().slice(0, 10) + '.csv', csv,
        '${T("La liste noire")}');
    };
  }

  function lier(){
    var b;
    b=document.getElementById('l-nouveau'); if (b) b.onclick=function(){ AJOUT=true; dessiner();
      var v=document.getElementById('l-valeur'); if (v) try { v.focus(); } catch(e){} };
    b=document.getElementById('l-annuler'); if (b) b.onclick=function(){ AJOUT=false; dessiner(); dire(''); };
    b=document.getElementById('l-ajouter'); if (b) b.onclick=ajouter;
    var lt=corps.querySelectorAll('[data-lnt]');
    for (var j=0;j<lt.length;j++) lt[j].onclick=function(){
      var v=this.getAttribute('data-lnt')||''; FT=(FT===v && this.classList.contains('tuile'))?'':v; dessiner(); };
    var lq=document.getElementById('ln-q');
    if (lq) lq.oninput=function(){
      QL=lq.value; var a=lq.selectionStart, z=lq.selectionEnd; dessiner();
      var q2=document.getElementById('ln-q'); if (q2) { q2.focus({ preventScroll: true }); try { q2.setSelectionRange(a, z); } catch(e){} }
    };
    var t=document.getElementById('l-type');
    // ⚠ Changer le type REDESSINE le formulaire : une adresse demande deux
    // champs, un courriel un seul. Garder un champ inadapte inviterait a saisir
    // une adresse dans une case prevue pour un courriel.
    if (t) t.onchange=function(){ TYPE=this.value; dessiner(); };
    var ds=corps.querySelectorAll('[data-del]');
    for (var i=0;i<ds.length;i++) ds[i].onclick=function(){
      var id=this.getAttribute('data-del');
      if (DELID===id){ DELID=''; retirer(id); }
      else { DELID=id; dessiner(); dire('${T("Cliquez encore pour retirer — cette adresse pourra de nouveau commander.")}', 'att'); }
    };
    brancherSuggestions();
  }

  /* ⚠ SUGGESTIONS D'ADRESSE (#42) — comme la caisse. Le moteur (Mapbox puis
     repli Nominatim) vit dans la page (op adresse:suggerer) ; ici on affiche la
     liste et on remplit rue + ville au clic. Anti-rebond 350 ms. Aucune taxe
     (contrairement a la caisse) : c est juste un champ a saisir.
     ⚠ AUCUN accent grave dans ce commentaire (litteral de gabarit). */
  function brancherSuggestions(){
    var inp = document.getElementById('l-valeur');
    var sug = document.getElementById('l-sug');
    if (!inp || !sug || TYPE !== 'address') return;
    inp.oninput = function(){
      var q = inp.value.trim();
      clearTimeout(SUG_TIMER);
      if (q.length < 3) { sug.innerHTML=''; sug.style.display='none'; return; }
      SUG_TIMER = setTimeout(function(){
        appeler('adresse:suggerer',[q]).then(function(r){
          if (!r || !r.ok || !r.suggestions || !r.suggestions.length) {
            sug.innerHTML = '<div class="sug-vide">${T("Aucun résultat — vérifiez l’adresse")}</div>'; sug.style.display='block'; return;
          }
          sug.innerHTML = r.suggestions.map(function(s,idx){
            return '<div class="sug-it" data-i="'+idx+'"><div class="r">'+esc(s.rue||s.ville||'—')
              + '</div><div class="v">'+esc(s.label||'')+'</div></div>';
          }).join('') + '<div class="sug-src">'+(r.source==='mapbox'?'<span class="ic">🗺️</span>${T(" Mapbox")}':'<span class="ic">🌍</span>${T(" OpenStreetMap")}')+'</div>';
          sug.style.display='block';
          var its = sug.querySelectorAll('.sug-it');
          for (var k=0;k<its.length;k++) its[k].onmousedown=function(e){
            e.preventDefault();
            var s = r.suggestions[parseInt(this.getAttribute('data-i'),10)] || {};
            if (inp) inp.value = s.rue || '';
            var vl = document.getElementById('l-ville'); if (vl && s.ville) vl.value = s.ville;
            sug.innerHTML=''; sug.style.display='none';
          };
        });
      }, 350);
    };
    // Un clic hors de la liste la referme.
    inp.onblur = function(){ setTimeout(function(){ if (sug) sug.style.display='none'; }, 180); };
  }

  function ajouter(){
    if (OCCUPE) return; OCCUPE=true; dire('${T("Ajout…")}');
    appeler('listenoire:ajouter',[TYPE, txv('l-valeur'), txv('l-ville'), txv('l-note')]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ D=r; RO=!r.peutAjouter; AJOUT=false; DELID=''; dessiner(); dire('${T("Entrée ajoutée.")}', 'bon'); }
      else dire('${T("Échec : ")}'+expliquer(r), 'err'); });
  }
  function retirer(id){
    if (OCCUPE) return; OCCUPE=true; dire('${T("Retrait…")}');
    appeler('listenoire:retirer',[id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ D=r; DELID=''; dessiner(); dire('${T("Entrée retirée.")}', 'bon'); }
      else dire('${T("Échec : ")}'+expliquer(r), 'err'); });
  }

  function charger(){
    dire('${T("Chargement…")}');
    appeler('listenoire:donnees',[]).then(function(r){
      if (!r||!r.ok){ corps.innerHTML='<div class="vide m-'+((r&&r.motif)||'echec')+'">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; RO=!r.peutAjouter;
      var av=document.getElementById('ro'); if (av) av.hidden=!(!r.peutAjouter && !r.peutRetirer);
      dessiner(); dire('');
    });
  }

  window.szRevenir = function(){ if (!OCCUPE && !AJOUT) charger(); };
  charger();
})();
</script></body></html>`;
}

module.exports = { pageListeNoire };
