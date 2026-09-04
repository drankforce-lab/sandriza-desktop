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
 * ⚠ ANCRÉE = PLEINE PAGE.
 * ⚠⚠ AUCUN ACCENT GRAVE ( ` ) DANS LA PORTION DE SCRIPT — il refermerait le
 * littéral de gabarit et la fenêtre tomberait. ⚠ « Accent grave » désigne LE
 * CARACTÈRE ` , PAS les lettres accentuées : les textes VISIBLES doivent être en
 * français correct, avec leurs é, è, ê, à, ç. J'ai confondu les deux en écrivant
 * la refonte du 2026-08-19 et livré « Questions de securite » à l'écran : une
 * faute, pas un choix. Ce qui n'a pas d'accents, ce sont les COMMENTAIRES.
 *
 * ── REFONTE DU 2026-08-19 (#43) ──────────────────────────────────
 * Sa demande, capture à l'appui : « plus beau visuellement que ça ».
 *
 * CE QUI N'ALLAIT PAS, ET QUI SE VOYAIT SUR LA CAPTURE :
 *   1. ⚠ LA COURONNE ÉTAIT EN COULEUR. L'avatar affichait l'émoji du rôle
 *      (`roleIcone`), et il échappait à la règle « tout pictogramme en gris » de
 *      la 3.52.0 : le filtre du socle ne porte que sur `.tete .ic`, pas sur le
 *      contenu d'un rond d'avatar. **Le corriger par un filtre aurait été un
 *      palliatif** — on grise le dessin, on ne le remplace pas. L'avatar porte
 *      donc un MONOGRAMME (les initiales), qui n'est pas un pictogramme du tout.
 *   2. Une GRILLE À DEUX COLONNES avec une carte courte (Informations) à côté
 *      d'une carte longue (mot de passe) : un trou béant sous la première.
 *   3. TROIS FORMULAIRES OUVERTS EN MÊME TEMPS, tous au même poids visuel — or
 *      on ne change pas son mot de passe et ses questions dans le même geste.
 *      Un mur de champs vides, et rien qui dise où regarder.
 *
 * CE QUE C'EST MAINTENANT : une CARTE D'IDENTITÉ en haut (monogramme, nom,
 * pastille de rôle, et les quatre faits), puis DEUX ONGLETS — Mot de passe,
 * Questions de sécurité. Deux et non trois : un onglet « Informations » aurait
 * été VIDE, puisque la carte d'identité porte déjà tout ce qu'il aurait dit.
 * L'état des questions est une pastille SUR l'onglet : c'est le seul fait qui
 * demande une action, il doit se voir sans cliquer.
 *
 * ⚠ LES CŒURS N'ONT PAS BOUGÉ. C'est une refonte d'APPARENCE : `profil:donnees`,
 * `profil:motdepasse` et `profil:questions` sont appelés exactement comme avant,
 * avec les mêmes identifiants de champ. Rien à revérifier côté sécurité.
 * ⚠ `roleIcone` reste dans le cœur (staff.js) : d'autres écrans s'en servent.
 * Il n'est simplement plus AFFICHÉ ici.
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
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}

/* ── LA CARTE D IDENTITE ───────────────────────────────────────
   Elle est en PLEINE LARGEUR, et c est le point : la version d avant mettait
   une carte courte a cote d une carte longue, ce qui laissait un trou beant. */
.ident{display:flex;align-items:center;gap:1.1rem;flex-wrap:wrap;
  background:var(--v03);border:1px solid var(--v08);
  border-radius:14px;padding:1.15rem 1.3rem;margin:0 0 1.05rem}
/* ⚠ UN MONOGRAMME, PAS UN PICTOGRAMME. C est ce qui regle la couronne en
   couleur : il n y a plus d emoji du tout, donc rien a griser. */
.mono{width:60px;height:60px;flex:0 0 auto;border-radius:50%;
  background:linear-gradient(145deg,rgba(201,169,126,.26),rgba(201,169,126,.1));
  border:1px solid rgba(201,169,126,.42);color:var(--tx-e7cfa8);
  display:flex;align-items:center;justify-content:center;
  font:700 1.35rem/1 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.03em;
  -webkit-user-select:none;user-select:none}
.qui{flex:1 1 14rem;min-width:0}
.qui .nom{font-weight:700;font-size:1.22rem;line-height:1.25;letter-spacing:-.01em}
.qui .sous2{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin:.3rem 0 0}
.qui .id{font-size:.82rem;color:var(--tx2)}
.faits{display:grid;grid-template-columns:auto auto;gap:.3rem 1rem;font-size:.83rem;
  align-content:center;flex:0 0 auto}
.faits .k{color:var(--tx2);white-space:nowrap}
.faits .v{white-space:nowrap}

/* ── LES PASTILLES ───────────────────────────────────────────
   Le socle habille deja .pill.bon/.att/.neutre en mode CLAIR : on ne
   redefinit donc que la base sombre, et le mode jour suit tout seul. */
.pill{display:inline-flex;align-items:center;gap:.3rem;font-size:.72rem;font-weight:700;
  letter-spacing:.02em;padding:.18rem .55rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(74,222,128,.14);color:var(--tx-ok2)}
.pill.att{background:rgba(250,204,21,.14);color:#e6c14a}
.pill.neutre{background:rgba(201,169,126,.14);color:#d9bd95}

/* ── LES ONGLETS ───────────────────────────────────────────
   DEUX, pas trois : un onglet << Informations >> aurait ete vide. Et on ne
   montre qu un formulaire a la fois — on ne change pas son mot de passe et ses
   questions dans le meme geste. */
.onglets{display:flex;gap:.35rem;margin:0 0 -1px;padding:0 .2rem;position:relative;z-index:1}
.onglet{font:inherit;font-size:.85rem;font-weight:600;color:var(--tx2);cursor:pointer;
  display:inline-flex;align-items:center;gap:.45rem;
  background:transparent;border:1px solid transparent;border-bottom:0;
  border-radius:10px 10px 0 0;padding:.5rem .95rem}
.onglet:hover{color:var(--tx);background:var(--v04)}
.onglet.on{color:var(--tx);background:var(--v03);
  border-color:var(--v08);border-bottom:0}
.onglet:focus-visible{outline:2px solid #c9a97e;outline-offset:2px}
.panneau{background:var(--v03);border:1px solid var(--v08);
  border-radius:0 13px 13px 13px;padding:1.15rem 1.25rem}
.panneau h3{margin:0 0 .25rem;font:700 1.02rem/1.25 system-ui,-apple-system,"Segoe UI",sans-serif}
.panneau .intro{margin:0 0 1rem;font-size:.85rem;color:var(--tx2);max-width:44rem;line-height:1.6}
.panneau .intro b{color:var(--tx)}

/* ⚠ UNE COLONNE ETROITE POUR LES MOTS DE PASSE. Un champ de mot de passe large
   de 800 px est laid ET faux : il suggere une saisie longue. */
.mince{max-width:23rem}
label.champ{display:block;margin:0 0 .8rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:var(--tx-gris);margin:.25rem 0 0;line-height:1.5}
input.t,select.t{width:100%;background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;color:var(--tx);font:inherit;padding:.5rem .65rem}
input.t:focus,select.t:focus{outline:none;border-color:#c9a97e}
.prim{font:inherit;font-size:.84rem;font-weight:700;border:0;border-radius:8px;padding:.55rem 1.05rem;background:#c9a97e;color:#1a1408;cursor:pointer}
.prim:disabled{opacity:.5;cursor:default}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.ferr{display:none;color:var(--tx-err2);font-size:.82rem;padding:.5rem .7rem;background:rgba(248,113,113,.1);
  border:1px solid rgba(248,113,113,.3);border-radius:8px;margin:0 0 .8rem}
.cols2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
@media(max-width:640px){.cols2{grid-template-columns:1fr}}
.vide{padding:2.2rem 1rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}

/* ── MODE CLAIR ───────────────────────────────────────────
   Le socle habille body, input, select, button.prim, .pill.*, .sub,
   .vide, .msg et .pied — mais PAS les classes propres a cette fenetre.
   Un fond clair avec une encre pensee pour le sombre est illisible : on les
   ecrit donc explicitement, sinon la moitie de l ecran disparait en mode jour. */
html.jour .ident{background:#fff;border-color:rgba(15,23,42,.1)}
html.jour .mono{background:linear-gradient(145deg,#f0e2cc,#e6d3b6);
  border-color:rgba(160,120,60,.35);color:#6b4d1f}
html.jour .qui .id{color:#5b6779}
html.jour .faits .k{color:#5b6779}
html.jour .onglet{color:#5b6779}
html.jour .onglet:hover{color:#141c28;background:rgba(15,23,42,.04)}
html.jour .onglet.on{color:#141c28;background:#fff;border-color:rgba(15,23,42,.1)}
html.jour .panneau{background:#fff;border-color:rgba(15,23,42,.1)}
html.jour .panneau .intro{color:#5b6779}
html.jour .panneau .intro b{color:#141c28}
html.jour label.champ .lbl{color:#5b6779}
html.jour label.champ .sub{color:#6b7787}
html.jour .mini{background:#f1f3f7;border-color:rgba(15,23,42,.14);color:#141c28}
html.jour .ferr{color:#9b1c1c;background:#fdecec;border-color:#f3b9b9}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageProfil() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Mon profil — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.staffaccess}</span><h1>Mon profil</h1></div>
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

  /* L onglet courant. Il SURVIT a un rechargement de donnees : apres avoir
     enregistre ses questions, on reste sur les questions — se faire renvoyer
     ailleurs par sa propre reussite est desagreable. */
  var ONGLET = 'pw';

  /* Les INITIALES, tirees du nom. Meme regle que la pastille du compte dans la
     barre de menu : on coupe sur les espaces et les separateurs, on garde les
     deux premieres lettres. Si le nom est en fait un courriel (le coeur y
     retombe quand il n y a ni prenom ni nom), on prend ce qui precede l arobase
     — sinon on afficherait la premiere lettre du domaine. */
  function initiales(nom){
    var t = String(nom || '').trim();
    var a = t.indexOf('@');
    if (a > 0) t = t.slice(0, a);
    var m = t.split(/[\s._\-]+/).filter(function(x){ return x; });
    var r = '';
    for (var i = 0; i < m.length && r.length < 2; i++) r += m[i].charAt(0);
    return r.toUpperCase() || '?';
  }

  function carteIdentite(){
    return '<div class="ident">'
      + '<div class="mono" aria-hidden="true">' + esc(initiales(D.nom)) + '</div>'
      + '<div class="qui">'
        + '<div class="nom">' + esc(D.nom) + '</div>'
        + '<div class="sous2">'
          + '<span class="pill neutre">' + esc(D.role) + '</span>'
          + (D.identifiant ? '<span class="id">@' + esc(D.identifiant) + '</span>' : '')
        + '</div>'
      + '</div>'
      + '<div class="faits">'
        + '<span class="k">Courriel</span><span class="v">' + esc(D.courriel || '\u2014') + '</span>'
        + '<span class="k">Dernière connexion</span><span class="v">' + esc(fmtTs(D.derniereConnexion)) + '</span>'
      + '</div>'
      + '</div>';
  }

  function barreOnglets(){
    var etat = D.questionsPosees
      ? '<span class="pill bon">✓</span>'
      : '<span class="pill att"><span class="ic">⚠</span></span>';
    return '<div class="onglets" role="tablist">'
      + '<button type="button" class="onglet' + (ONGLET === 'pw' ? ' on' : '') + '"'
        + ' data-ong="pw" role="tab" aria-selected="' + (ONGLET === 'pw') + '">Mot de passe</button>'
      + '<button type="button" class="onglet' + (ONGLET === 'q' ? ' on' : '') + '"'
        + ' data-ong="q" role="tab" aria-selected="' + (ONGLET === 'q') + '">'
        + 'Questions de sécurité' + etat + '</button>'
      + '</div>';
  }

  function panneauMotDePasse(){
    return '<div class="panneau">'
      + '<h3>Changer le mot de passe</h3>'
      + '<p class="intro">Le mot de passe <b>actuel</b> est vérifié par le serveur, pas par cette fenêtre.</p>'
      + '<div class="ferr" id="p-err"></div>'
      + '<div class="mince">'
      + '<label class="champ"><span class="lbl">Mot de passe actuel</span>'
      + '<input class="t" type="password" id="p-cur" autocomplete="current-password"></label>'
      + '<label class="champ"><span class="lbl">Nouveau mot de passe</span>'
      + '<input class="t" type="password" id="p-new" autocomplete="new-password">'
      + '<span class="sub">Huit caractères au moins. Un mot de passe déjà utilisé sera refusé.</span></label>'
      + '<label class="champ"><span class="lbl">Confirmer</span>'
      + '<input class="t" type="password" id="p-cnf" autocomplete="new-password"></label>'
      + '<button class="prim" id="p-go">Enregistrer le nouveau mot de passe</button>'
      + '</div></div>';
  }

  function panneauQuestions(){
    return '<div class="panneau">'
      + '<h3>Questions de sécurité</h3>'
      + '<p class="intro">Elles servent à retrouver votre accès si vous perdez votre mot de passe. '
      + (D.questionsPosees
          ? 'Vos réponses sont <b>enregistrées et chiffrées</b> : elles ne peuvent plus être réaffichées. Pour les changer, redonnez les <b>deux</b>.'
          : '<b>Aucune réponse enregistrée</b> : sans elles, votre compte ne pourra pas être récupéré par cette voie.')
      + '</p>'
      + '<div class="ferr" id="q-err"></div>'
      + '<div class="cols2">'
      + '<label class="champ"><span class="lbl">Question 1</span><select class="t" id="q-q1">' + qOpts(D.q1, D.q2) + '</select></label>'
      + '<label class="champ"><span class="lbl">Réponse 1</span><input class="t" id="q-a1" autocomplete="off"></label>'
      + '<label class="champ"><span class="lbl">Question 2</span><select class="t" id="q-q2">' + qOpts(D.q2, D.q1) + '</select></label>'
      + '<label class="champ"><span class="lbl">Réponse 2</span><input class="t" id="q-a2" autocomplete="off"></label>'
      + '</div>'
      + '<button class="prim" id="q-go">Enregistrer les questions</button></div>';
  }

  function dessiner(){
    corps.innerHTML = carteIdentite() + barreOnglets()
      + (ONGLET === 'q' ? panneauQuestions() : panneauMotDePasse());

    var ongs = corps.querySelectorAll('.onglet');
    for (var i = 0; i < ongs.length; i++) {
      ongs[i].onclick = function(){ ONGLET = this.getAttribute('data-ong'); dessiner(); };
    }

    if (ONGLET === 'q') {
      document.getElementById('q-go').onclick = questions;
      /* ⚠ LES DEUX LISTES S EXCLUENT L UNE L AUTRE. Choisir deux fois la meme
         question ne protege plus rien, et le serveur refuse : autant l empecher
         AVANT la saisie des reponses, plutot que d annoncer l echec apres. */
      var s1 = document.getElementById('q-q1'), s2 = document.getElementById('q-q2');
      function resync(){
        var v1 = s1.value, v2 = s2.value;
        s1.innerHTML = qOpts(v1, v2); s2.innerHTML = qOpts(v2, v1);
      }
      s1.onchange = resync; s2.onchange = resync;
    } else {
      document.getElementById('p-go').onclick = motDePasse;
    }
  }
  function ferr(id, msg){ var e=document.getElementById(id); if (e){ e.textContent=msg; e.style.display=msg?'block':'none'; } }

  function motDePasse(){
    if (OCCUPE) return; OCCUPE=true; ferr('p-err',''); dire('Vérification…');
    appeler('profil:motdepasse',[txv('p-cur'), txv('p-new'), txv('p-cnf')]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ ONGLET='pw'; dire('Mot de passe modifié.', 'bon'); charger(); }
      else { ferr('p-err', expliquer(r)); dire('Échec : '+expliquer(r), 'err'); } });
  }
  function questions(){
    if (OCCUPE) return; OCCUPE=true; ferr('q-err',''); dire('Enregistrement…');
    appeler('profil:questions',[txv('q-q1'), txv('q-a1'), txv('q-q2'), txv('q-a2')]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ if (r.nom) D=r; ONGLET='q'; dessiner(); dire('Questions de sécurité enregistrées.', 'bon'); }
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
