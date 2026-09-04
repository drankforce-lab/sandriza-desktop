'use strict';

/*
 * FENÊTRE « CONFIGURATION DU CHAT EN LIGNE » — NATIVE (3.9.0, #31)
 * =============================================================================
 * L'écran qui avait disparu sans que rien ne le signale. La fenêtre `chat.js`
 * (1.69.0) porte les OPÉRATIONS — la file, les réponses, la satisfaction — et
 * elle écrivait elle-même dans son en-tête que « la configuration suivra avec
 * la Configuration, au palier 5 ». Elle ne l'a jamais suivie. Comme la fenêtre
 * native gagne désormais toujours sur l'écran web, les réglages du chat sont
 * devenus INATTEIGNABLES : le repli web les portait encore, mais plus personne
 * n'y passait. Signalé le 2026-08-14 : « il n'existe plus nulle part et
 * pourtant je l'avais en mode web ».
 *
 * ⚠ MÊME DÉCOUPE QUE LES RÉSEAUX SOCIAUX : `sociaux.js` = la file de
 * publication, `sociaux-config.js` = les comptes et les jetons. Ici,
 * `chat.js` = les conversations, cette fenêtre = les réglages.
 *
 * ⚠ LE NOM DE L'AGENT SE LIT BRUT. Quand la rotation est active, le site
 * remplace le nom configuré par celui de l'agent du moment ; le cœur nous rend
 * les DEUX (`nomAgent`, le nom de repli enregistré, et `nomAffiche`, celui qui
 * parle en ce moment). Ne jamais réenregistrer le second à la place du premier.
 *
 * ⚠ LA PHOTO NE MONTE PAS D'ICI : la fenêtre lit le fichier, envoie l'image à
 * la page, et c'est ELLE qui la range dans R2 (op `chat:cfg:photo`). Un `fetch`
 * vers R2 depuis une fenêtre échouerait sans un mot.
 *
 * ⚠ ANCRÉE = PLEINE PAGE (aucun max-width sur le conteneur).
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
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
.ong{flex:0 0 auto;display:flex;gap:.4rem;padding:.5rem 1.05rem 0;border-bottom:1px solid var(--v08)}
.ong button{font:inherit;font-size:.83rem;padding:.35rem .85rem;border:1px solid transparent;border-bottom:none;
  border-radius:9px 9px 0 0;background:transparent;color:var(--tx2);cursor:pointer;margin-bottom:-1px;
  -webkit-user-select:none;user-select:none}
.ong button:hover{color:var(--tx)}
.ong button.actif{background:var(--f-page);border-color:var(--v12);color:var(--tx);font-weight:600}
.ro{flex:0 0 auto;margin:.55rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.45rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.quoi{font-size:.79rem;color:var(--tx2);line-height:1.6;margin:0 0 1rem}
.quoi b{color:var(--tx)}
.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(28rem,1fr));gap:.9rem;align-items:start}
.carte{background:var(--v03);border:1px solid var(--v10);border-radius:13px;padding:1rem 1.1rem}
.carte h2{margin:0 0 .8rem;font:700 .93rem/1.2 Georgia,serif}
.carte.large{grid-column:1/-1}
.bascules{display:flex;gap:1.4rem;flex-wrap:wrap;margin:0 0 .9rem}
label.bascule{display:flex;align-items:center;gap:.45rem;font-size:.84rem;cursor:pointer;-webkit-user-select:none;user-select:none}
label.bascule input{width:16px;height:16px;accent-color:#c9a97e;flex:0 0 auto}
label.champ{display:block;margin:0 0 .8rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:var(--tx-gris);margin:.25rem 0 0;line-height:1.5}
input.t,textarea.t{width:100%;background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;
  color:var(--tx);font:inherit;font-size:.85rem;padding:.45rem .6rem}
textarea.t{min-height:4.2em;resize:vertical;line-height:1.5}
input.t:focus,textarea.t:focus{outline:none;border-color:#c9a97e}
input.t:disabled,textarea.t:disabled{opacity:.45}
.rang{display:flex;gap:.45rem;align-items:center}
.rang input.t{flex:1 1 auto;min-width:0}
.sources{display:grid;grid-template-columns:repeat(auto-fill,minmax(13rem,1fr));gap:.45rem;margin:0 0 .9rem}
.sources label{display:flex;align-items:center;gap:.45rem;font-size:.82rem;cursor:pointer;
  border:1px solid var(--v10);border-radius:9px;padding:.35rem .6rem;background:var(--v03)}
.sources input{width:15px;height:15px;accent-color:#7c5fce}
.agent{display:flex;align-items:center;gap:.45rem;padding:.45rem .55rem;margin:0 0 .5rem;
  background:var(--v03);border:1px solid var(--v10);border-radius:10px}
.agent input.nom{flex:0 0 9rem}
.agent input.ph{flex:1 1 auto;min-width:0;font-family:Consolas,monospace;font-size:.76rem}
.agent .vign{width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid var(--v18);flex:0 0 auto}
.agent .sansph{width:32px;height:32px;border-radius:50%;background:var(--v08);display:flex;
  align-items:center;justify-content:center;font-size:.95rem;flex:0 0 auto}
.pill{display:inline-block;font-size:.66rem;font-weight:700;padding:2px 8px;border-radius:99px;white-space:nowrap}
.pill.ok{background:rgba(22,163,74,.2);color:var(--tx-ok2)}
.pill.non{background:rgba(234,179,8,.18);color:#e6c14a}
.avis{border-radius:9px;padding:.5rem .75rem;font-size:.79rem;margin:0 0 .9rem;line-height:1.5}
.avis.ok{background:rgba(22,163,74,.1);border:1px solid rgba(22,163,74,.3);color:#93e6b5}
.avis.non{background:rgba(234,179,8,.1);border:1px solid rgba(234,179,8,.3);color:#e8d08a}
.avis code{font-family:Consolas,monospace;font-size:.94em}
.b{font:inherit;font-size:.79rem;border:1px solid var(--v16);border-radius:8px;
  padding:.4rem .7rem;background:var(--v05);color:var(--tx);cursor:pointer;white-space:nowrap}
.b:hover:not(:disabled){background:var(--v09)}
.b:disabled{opacity:.45;cursor:default}
.b.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
.b.prim:hover:not(:disabled){background:#a3824f}
.b.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err);padding:.2rem .45rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;
  background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;
  border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
.vide{padding:2rem 1rem;text-align:center;color:var(--tx2);font-size:.84rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageChatConfig(onglet) {
  const ONG0 = (onglet === 'ia') ? 'ia' : 'widget';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Configuration du chat en ligne — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.chat}</span><h1>Configuration du chat en ligne</h1></div>
<div class="ong">
  <button type="button" id="o-widget" data-onglet="widget">⚙ Widget</button>
  <button type="button" id="o-ia" data-onglet="ia"><span class="ic">🤖</span> Assistant IA</button>
</div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter ces réglages, pas les modifier.</div>
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
  var D = null, RO = true, OCCUPE = false;
  var ONGLET = ${JSON.stringify(ONG0)};
  /* Les agents s editent EN MEMOIRE et ne partent qu au clic sur Enregistrer :
     une frappe par requete ferait un aller-retour par lettre tapee. */
  var AGENTS = [];

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function el(id){ return document.getElementById(id); }
  function txv(id){ var e=el(id); return e?String(e.value||''):''; }
  function coche(id){ var e=el(id); return !!(e&&e.checked); }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès au chat en ligne.',
    indisponible:'L’administration n’est pas encore chargée dans la fenêtre principale.',
    invalide:'Ce fichier n’est pas une image.',
    trop_gros:'Image trop lourde : 800 Ko au maximum.',
    courriel:'Le courriel de notification est mal écrit.',
    agents:'Il faut au moins un agent portant un nom.',
    pont_indisponible:'La fenêtre principale ne répond pas.',
    delai:'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue:'Cette version de l’application ne connaît pas cette opération.',
    echec:'L’opération a échoué.'
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('Erreur inattendue ('+esc(m||'?')+').'))+(r&&r.detail?' — '+esc(String(r.detail).slice(0,140)):''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }

  /* ⚠ L ECHEC DE CHARGEMENT SE CABLE EN JS, JAMAIS DANS UN onerror= EN LIGNE :
     une apostrophe echappee dans un attribut est AVALEE par le litteral de
     gabarit de la fenetre et casse tout le script (piege vecu en 2.67.0). Une
     photo dont l adresse ne repond plus laisserait sinon une icone brisee, ce
     qui ressemble a un defaut de la fenetre et non a une adresse morte. */
  function reparerVignettes(){
    var v = document.querySelectorAll('img.vign');
    for (var i=0;i<v.length;i++) v[i].onerror = function(){
      var s = document.createElement('span');
      s.className = 'sansph'; s.textContent = '👤'; s.title = 'Photo introuvable à cette adresse';
      if (this.parentNode) this.parentNode.replaceChild(s, this);
    };
  }

  function majOnglets(){
    var w=el('o-widget'), i=el('o-ia');
    if (w) w.className = (ONGLET==='widget'?'actif':'');
    if (i) i.className = (ONGLET==='ia'?'actif':'');
  }

  /* ── ONGLET WIDGET ─────────────────────────────────────────────────────── */
  function vueWidget(){
    var d = D || {};
    var dis = RO ? ' disabled' : '';
    var h = '<p class="quoi">Le bouton flottant en bas à droite de la boutique. '
      + '<b>Actif</b> le fait paraître ; <b>En ligne</b> décide s’il ouvre une vraie conversation '
      + 'ou le formulaire hors ligne. Les messages sont servis <b>en français ou en anglais</b> '
      + 'selon la langue du visiteur.</p>';

    h += '<div class="grille">';

    h += '<div class="carte"><h2>Présence</h2>'
      + '<div class="bascules">'
      + '<label class="bascule"><input type="checkbox" id="c-actif"'+(d.actif?' checked':'')+dis+'> Actif</label>'
      + '<label class="bascule"><input type="checkbox" id="c-enligne"'+(d.enLigne?' checked':'')+dis+'> En ligne</label>'
      + '<label class="bascule"><input type="checkbox" id="c-rotation"'+(d.rotation?' checked':'')+dis+'> Rotation des noms</label>'
      + '</div>'
      + '<label class="champ"><span class="lbl">Nom de l’agent</span>'
      + '<input class="t" id="c-nom" value="'+esc(d.nomAgent||'')+'" placeholder="Support"'+dis+'>'
      + '<span class="sub">'
      + (d.rotation
          ? 'La rotation est active : le nom change toutes les 2 heures parmi les agents ci-dessous — actuellement <b>'+esc(d.nomAffiche||'')+'</b>. Ce champ reste le nom de repli, servi si plus aucun agent n’est actif.'
          : 'Nom fixe, affiché à tous les visiteurs.')
      + '</span></label>'
      + '<label class="champ"><span class="lbl">Courriel d’avis (hors ligne)</span>'
      + '<input class="t" id="c-courriel" type="email" value="'+esc(d.courrielAvis||'')+'" placeholder="admin@sandriza.com"'+dis+'>'
      + '<span class="sub">Prévenu quand quelqu’un laisse un message pendant que le chat est hors ligne. Vide : personne n’est prévenu.</span></label>'
      + '</div>';

    /* La photo de l agent fixe et la liste de rotation sont DANS LA MEME
       CARTE : ce sont les deux moities d une seule question — qui repond, et
       avec quel visage. Separees, la premiere laissait une carte presque vide
       a cote d une carte pleine, et rien ne disait qu elles s excluent. */
    h += '<div class="carte"><h2>Qui répond</h2>'
      + '<label class="champ"><span class="lbl">Photo de l’agent fixe</span>'
      + '<span class="rang">'
      + (d.photoAgent
          ? '<img class="vign" src="'+esc(d.photoAgent)+'" alt="">'
          : '<span class="sansph"><span class="ic">👤</span></span>')
      + '<input class="t" id="c-photo" value="'+esc(d.photoAgent||'')+'" placeholder="https://…"'+dis+'>'
      + (RO ? '' : '<button class="b" type="button" id="c-photo-imp"><span class="ic">📁</span> Importer</button>')
      + '</span>'
      + '<span class="sub">Servie quand la rotation des noms est <b>désactivée</b>.</span></label>'
      + '<input type="file" id="c-photo-f" accept="image/*" hidden>'
      + '<label class="champ" style="margin-bottom:.35rem"><span class="lbl">Agents de la rotation</span></label>'
      + '<p class="quoi" style="margin:0 0 .6rem">Chacun a son nom et sa photo. Décoché, un agent est sauté par la rotation sans être perdu.</p>'
      + '<div id="c-agents"></div>'
      + (RO ? '' : '<button class="b" type="button" id="c-agent-plus">＋ Ajouter un agent</button>')
      + '<input type="file" id="c-agent-f" accept="image/*" hidden>'
      + '</div>';

    h += '<div class="carte large"><h2>Messages</h2>'
      + '<label class="champ"><span class="lbl">Accueil — français</span>'
      + '<input class="t" id="c-accueil" value="'+esc(d.accueil||'')+'" placeholder="Bonjour ! Mon nom est {{AGENT}}, comment puis-je vous aider ?"'+dis+'>'
      + '<span class="sub">Écrivez <b>{{AGENT}}</b> là où le nom de l’agent doit paraître.</span></label>'
      + '<label class="champ"><span class="lbl">Accueil — anglais</span>'
      + '<input class="t" id="c-accueil-en" value="'+esc(d.accueilEN||'')+'" placeholder="Hello! My name is {{AGENT}}, how can I help you today?"'+dis+'></label>'
      + '<label class="champ"><span class="lbl">Hors ligne — français</span>'
      + '<textarea class="t" id="c-horsligne"'+dis+'>'+esc(d.horsLigne||'')+'</textarea></label>'
      + '<label class="champ"><span class="lbl">Hors ligne — anglais</span>'
      + '<textarea class="t" id="c-horsligne-en" placeholder="We are currently offline. Leave us your contact details and we will get back to you as soon as possible."'+dis+'>'+esc(d.horsLigneEN||'')+'</textarea></label>'
      + '</div>';

    h += '</div>';
    if (!RO) h += '<div style="margin-top:1rem"><button class="b prim" type="button" id="c-enr">Enregistrer les réglages du widget</button></div>';
    return h;
  }

  function dessinerAgents(){
    var z = el('c-agents'); if (!z) return;
    if (!AGENTS.length) { z.innerHTML = '<div class="vide" style="padding:1rem">Aucun agent. La rotation servira le nom de repli.</div>'; return; }
    var dis = RO ? ' disabled' : '';
    var h = '';
    for (var i=0;i<AGENTS.length;i++){ var a = AGENTS[i];
      h += '<div class="agent">'
        + '<input type="checkbox" data-ag-actif="'+i+'"'+(a.actif?' checked':'')+dis+' style="width:15px;height:15px;accent-color:#c9a97e;flex:0 0 auto">'
        + '<input class="t nom" data-ag-nom="'+i+'" value="'+esc(a.nom)+'" placeholder="Nom"'+dis+'>'
        + '<input class="t ph" data-ag-photo="'+i+'" value="'+esc(a.photo)+'" placeholder="URL de la photo (vide = sans photo)"'+dis+'>'
        + (RO ? '' : '<button class="mini" type="button" data-ag-imp="'+i+'" title="Importer une photo"><span class="ic">📁</span></button>')
        + (a.photo ? '<img class="vign" src="'+esc(a.photo)+'" alt="">' : '<span class="sansph"><span class="ic">👤</span></span>')
        + (RO ? '' : '<button class="b danger" type="button" data-ag-suppr="'+i+'" title="Retirer cet agent">✕</button>')
        + '</div>';
    }
    z.innerHTML = h;
    lierAgents();
    reparerVignettes();
  }

  function lierAgents(){
    var z = el('c-agents'); if (!z) return;
    var n = z.querySelectorAll('[data-ag-nom]');
    for (var i=0;i<n.length;i++) n[i].oninput = function(){ AGENTS[+this.getAttribute('data-ag-nom')].nom = this.value; };
    var p = z.querySelectorAll('[data-ag-photo]');
    for (var j=0;j<p.length;j++) p[j].oninput = function(){ AGENTS[+this.getAttribute('data-ag-photo')].photo = this.value; };
    var c = z.querySelectorAll('[data-ag-actif]');
    for (var k=0;k<c.length;k++) c[k].onchange = function(){ AGENTS[+this.getAttribute('data-ag-actif')].actif = this.checked; };
    var s = z.querySelectorAll('[data-ag-suppr]');
    for (var m=0;m<s.length;m++) s[m].onclick = function(){ AGENTS.splice(+this.getAttribute('data-ag-suppr'),1); dessinerAgents(); dire('Agent retiré — pensez à enregistrer.', 'att'); };
    var im = z.querySelectorAll('[data-ag-imp]');
    for (var q=0;q<im.length;q++) im[q].onclick = function(){ choisirPhoto(+this.getAttribute('data-ag-imp')); };
  }

  /* ── PHOTOS ────────────────────────────────────────────────────────────────
     Un seul champ de fichier sert tous les agents : CIBLE dit lequel attend
     (-1 = la photo de l agent fixe). Sans ca, il faudrait un champ par ligne et
     les recabler a chaque redessin. */
  var CIBLE = -1;
  function choisirPhoto(idx){
    if (RO) return;
    CIBLE = idx;
    var f = el(idx < 0 ? 'c-photo-f' : 'c-agent-f');
    if (f) { f.value = ''; f.click(); }
  }

  function lirePhoto(input){
    var fichier = input && input.files && input.files[0];
    if (!fichier) return;
    if (fichier.size > 800000) { dire('Image trop lourde : 800 Ko au maximum.', 'err'); return; }
    var lecteur = new FileReader();
    lecteur.onerror = function(){ dire('Lecture du fichier impossible.', 'err'); };
    lecteur.onload = function(ev){
      if (OCCUPE) return; OCCUPE = true;
      dire('Envoi de la photo…');
      appeler('chat:cfg:photo', [String(ev.target.result||'')]).then(function(r){
        OCCUPE = false;
        if (!r || !r.ok) { dire('Échec : '+expliquer(r), 'err'); return; }
        if (CIBLE < 0) { var e = el('c-photo'); if (e) e.value = r.url; }
        else if (AGENTS[CIBLE]) { AGENTS[CIBLE].photo = r.url; dessinerAgents(); }
        dire('Photo rangée dans le nuage — pensez à enregistrer.', 'att');
      });
    };
    lecteur.readAsDataURL(fichier);
  }

  function enregistrerWidget(){
    if (RO || OCCUPE) return; OCCUPE = true;
    dire('Enregistrement…');
    appeler('chat:cfg:ecrire', [{
      actif:        coche('c-actif'),
      enLigne:      coche('c-enligne'),
      rotation:     coche('c-rotation'),
      nomAgent:     txv('c-nom'),
      photoAgent:   txv('c-photo'),
      courrielAvis: txv('c-courriel'),
      accueil:      txv('c-accueil'),
      accueilEN:    txv('c-accueil-en'),
      horsLigne:    txv('c-horsligne'),
      horsLigneEN:  txv('c-horsligne-en'),
      agents:       AGENTS
    }]).then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) { dire('Échec : '+expliquer(r), 'err'); return; }
      poser(r); dessiner(); dire('Réglages du widget enregistrés.', 'bon');
    });
  }

  /* ── ONGLET ASSISTANT IA ───────────────────────────────────────────────── */
  var SOURCES = [
    ['produits','Produits et inventaire'], ['collections','Collections'], ['faq','FAQ'],
    ['retours','Politique de retours'], ['expedition','Politique d’expédition'], ['promotions','Promotions en cours']
  ];

  function vueIa(){
    var d = D || {}, ia = d.ia || {};
    var dis = RO ? ' disabled' : '';
    var h = '<p class="quoi">L’assistant répond seul aux questions courantes en puisant dans les données de la '
      + 'boutique. Il passe la main à l’équipe dès qu’il ne sait pas.</p>';

    h += d.groqPosee
      ? '<div class="avis ok">Clé Groq en place — modèle <code>'+esc(d.groqModele||'')+'</code>.</div>'
      : '<div class="avis non">Aucune clé Groq enregistrée : l’assistant ne peut pas répondre. Elle se pose dans <b>Configuration → Clés API</b>.</div>';

    h += '<div class="grille">';
    h += '<div class="carte large">'
      + '<div class="bascules"><label class="bascule"><input type="checkbox" id="i-actif"'+(ia.active?' checked':'')+dis+'> <b>Activer l’assistant</b></label></div>'
      + '<label class="champ"><span class="lbl">Ce qu’il a le droit de lire</span></label>'
      + '<div class="sources">';
    for (var i=0;i<SOURCES.length;i++){
      h += '<label><input type="checkbox" id="i-'+SOURCES[i][0]+'"'+(ia[SOURCES[i][0]]?' checked':'')+dis+'> <span>'+esc(SOURCES[i][1])+'</span></label>';
    }
    h += '</div>'
      + '<label class="champ"><span class="lbl">Règles maison</span>'
      + '<textarea class="t" id="i-regles" style="min-height:6em" placeholder="Exemple : ne jamais nommer un concurrent. Toujours proposer le programme de fidélité."'+dis+'>'+esc(ia.regles||'')+'</textarea>'
      + '<span class="sub">Instructions supplémentaires, suivies à chaque réponse.</span></label>'
      + '<label class="champ"><span class="lbl">Message de passage à l’équipe</span>'
      + '<input class="t" id="i-transfert" value="'+esc(ia.transfert||'')+'" placeholder="Je transmets votre question à notre équipe. Merci de patienter."'+dis+'>'
      + '<span class="sub">Affiché quand l’assistant préfère ne pas répondre.</span></label>'
      + '</div>';
    h += '</div>';
    if (!RO) h += '<div style="margin-top:1rem"><button class="b prim" type="button" id="i-enr">Enregistrer l’assistant</button></div>';
    return h;
  }

  function enregistrerIa(){
    if (RO || OCCUPE) return; OCCUPE = true;
    dire('Enregistrement…');
    var p = { active: coche('i-actif'), regles: txv('i-regles'), transfert: txv('i-transfert') };
    for (var i=0;i<SOURCES.length;i++) p[SOURCES[i][0]] = coche('i-'+SOURCES[i][0]);
    appeler('chat:cfg:ia', [p]).then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) { dire('Échec : '+expliquer(r), 'err'); return; }
      poser(r); dessiner(); dire('Assistant enregistré.', 'bon');
    });
  }

  /* ── SOCLE ─────────────────────────────────────────────────────────────── */
  function poser(r){
    D = r; RO = !r.peutEcrire;
    AGENTS = (r.agents||[]).map(function(a){ return { nom:a.nom, photo:a.photo, actif:a.actif }; });
    var av = el('ro'); if (av) av.hidden = !RO;
  }

  function dessiner(){
    majOnglets();
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    corps.innerHTML = (ONGLET === 'ia') ? vueIa() : vueWidget();
    if (ONGLET === 'ia') {
      var bi = el('i-enr'); if (bi) bi.onclick = enregistrerIa;
      return;
    }
    dessinerAgents();
    reparerVignettes();
    var b = el('c-enr'); if (b) b.onclick = enregistrerWidget;
    var pl = el('c-agent-plus');
    if (pl) pl.onclick = function(){ AGENTS.push({ nom:'', photo:'', actif:true }); dessinerAgents();
      var z = el('c-agents'), der = z && z.querySelector('.agent:last-child .nom'); if (der) der.focus(); };
    var imp = el('c-photo-imp'); if (imp) imp.onclick = function(){ choisirPhoto(-1); };
    var f1 = el('c-photo-f'); if (f1) f1.onchange = function(){ lirePhoto(this); };
    var f2 = el('c-agent-f'); if (f2) f2.onchange = function(){ lirePhoto(this); };
    /* La rotation change ce que dit le champ du nom : on redessine pour que
       l explication suive, sans rien enregistrer. */
    var rot = el('c-rotation');
    if (rot) rot.onchange = function(){ if (D) { D.rotation = this.checked; } var g=el('c-nom'); if (g) D.nomAgent = g.value;
      var etat = { photoAgent: txv('c-photo'), courrielAvis: txv('c-courriel'), accueil: txv('c-accueil'),
                   accueilEN: txv('c-accueil-en'), horsLigne: txv('c-horsligne'), horsLigneEN: txv('c-horsligne-en') };
      D.photoAgent=etat.photoAgent; D.courrielAvis=etat.courrielAvis; D.accueil=etat.accueil;
      D.accueilEN=etat.accueilEN; D.horsLigne=etat.horsLigne; D.horsLigneEN=etat.horsLigneEN;
      dessiner(); dire('Rotation modifiée — pensez à enregistrer.', 'att'); };
  }

  var ow = el('o-widget'), oi = el('o-ia');
  if (ow) ow.onclick = function(){ if (ONGLET!=='widget'){ ONGLET='widget'; dessiner(); } };
  if (oi) oi.onclick = function(){ if (ONGLET!=='ia'){ ONGLET='ia'; dessiner(); } };

  function charger(){
    dire('Chargement…');
    appeler('chat:cfg:donnees', []).then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      poser(r); dessiner(); dire('');
    });
  }

  /* ⚠ On ne recharge PAS pendant une saisie : la fenetre revient au premier
     plan des qu on clique dedans, et ecraser ce qui est tape serait pire que
     des donnees d une minute. */
  window.szRevenir = function(){
    if (OCCUPE) return;
    var a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA)$/.test(a.tagName)) { dire('Saisie en cours : les réglages ne sont pas rechargés.', 'att'); return; }
    charger();
  };
  charger();
})();
</script></body></html>`;
}

module.exports = { pageChatConfig };
