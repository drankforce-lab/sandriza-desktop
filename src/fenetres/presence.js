'use strict';

/*
 * FENÊTRE « PERSONNEL CONNECTÉ » — NATIVE
 * =============================================================================
 * Sa demande du 2026-09-08, mot pour mot : « le menu de l'icône doit encore
 * porter : voir les connectés · déconnecter à distance · envoyer un message,
 * pour le super-administrateur seulement ».
 *
 * ⚠⚠ POURQUOI UNE FENÊTRE ET NON TROIS ENTRÉES DANS LE MENU DE L'ICÔNE.
 * C'est de l'icône qu'il part, et l'icône reste le point d'entrée — mais un menu
 * de zone de notification est construit d'un seul coup, sans attendre : il ne
 * peut pas afficher une liste qui vient du réseau sans la sonder d'avance, et
 * sonder d'avance c'est le second sondage que sa consigne interdit
 * explicitement. Un menu ne peut pas non plus recevoir un texte : Electron
 * n'offre aucun champ de saisie dans un menu. Les trois gestes demandent donc
 * une surface ; le menu de l'icône y mène, et n'a rien à sonder.
 *
 * ⚠⚠ SUPER-ADMINISTRATEUR — ET CETTE FENÊTRE NE DÉCIDE DE RIEN. Le droit est
 * vérifié par le SERVEUR (`case 'presence'` dans turso-proxy.php refuse tout
 * autre rôle) et par le cœur du site. Ici, on ne fait que ne pas dessiner ce
 * qu'on n'a pas le droit de montrer — même montage que « Verrous » (#35), dont
 * ce fichier reprend la facture.
 *
 * ⚠⚠ CE QUE CET ÉCRAN NE PRÉTEND PAS SAVOIR, ET C'EST LE POINT LE PLUS
 * IMPORTANT. Il n'affiche PAS un point vert « connecté / déconnecté ». Une
 * session vit douze heures : « session active » ne veut pas dire « quelqu'un est
 * devant l'écran ». Et une fenêtre réduite dans la zone de notification voit son
 * sondage RALENTI par le système, donc son dernier passage recule sans que
 * personne soit parti. On montre donc toute session vivante avec l'heure de son
 * DERNIER PASSAGE — « à l'écran », « vu il y a 6 min » — et celui qui décide de
 * couper décide en sachant. Un voyant binaire aurait menti dans les deux sens.
 *
 * ⚠ DEUX CLICS POUR DÉCONNECTER, comme pour forcer un verrou : le geste fait
 * perdre le travail en cours de quelqu'un d'autre, et la ligne d'à côté est
 * celle d'un collègue.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit. Neuf fois payé dans ce
 * dépôt, dont trois fois en silence — `node --check` passe quand le compte est
 * pair.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.05rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{margin:0;font:700 1.05rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barre{display:flex;gap:.45rem;align-items:center;flex-wrap:wrap}
button{font:inherit;color:var(--tx);background:var(--v05);cursor:pointer;
  border:1px solid var(--v16);border-radius:8px;padding:.28rem .55rem}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button:focus{outline:none;border-color:#c9a97e}
button.dgr{border-color:rgba(239,68,68,.5);color:var(--tx-err)}
button.dgr:hover:not(:disabled){background:rgba(239,68,68,.14)}
button.mini{font-size:.74rem;padding:.14rem .45rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h3{margin:0 0 .5rem;font:700 .92rem/1.2 Georgia,serif}
.note{font-size:.78rem;color:var(--tx2);line-height:1.6;background:var(--v03);
  border:1px solid var(--v07);border-radius:10px;padding:.5rem .7rem}
table{width:100%;border-collapse:collapse;font-size:.82rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.67rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.34rem .4rem;border-top:1px solid var(--v05);vertical-align:top}
.sub{font-size:.71rem;color:var(--tx2)}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.72rem}
.mut{color:var(--tx2)}
/* ⚠⚠ LES PASTILLES VIENNENT DU SOCLE, ET C'EST LE BANC QUI M'A RAMENÉ ICI.
   J'avais recopié celles de la fenêtre « Verrous » — .vif, .moi, .role, avec
   leurs couleurs en dur. Deux bancs ont refusé, et ils avaient raison sur les
   deux points :
     • .pill.role tombait à 4,21 en mode jour (seuil 4,5) : une pastille qui dit
       à quel niveau de droits on va couper une session ne peut pas être
       illisible ;
     • .pill.moi réutilisait #dcc39b, une couleur de la DETTE déclarée, plafonnée
       à cinq endroits — j'en ajoutais un sixième. « La dette gagne du terrain »,
       dit le banc, et c'est exactement ce que je faisais.
   Le socle porte DÉJÀ .pill.bon, .att, .err, .info et .neutre, avec leur reprise
   de mode jour vérifiée. On les emploie, et il n'y a plus une seule couleur en
   dur dans ce fichier — donc plus rien à corriger le jour où le thème bouge.
   ⚠ ET .pill.moi A SIMPLEMENT DISPARU : la colonne d'actions écrit déjà « vous »
   pour sa propre ligne. La pastille disait la même chose deux fois. */
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.vide{padding:1.4rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
/* La zone d ecriture du message : elle n apparait que pour une personne a la
   fois, sous sa ligne — jamais un formulaire flottant qui masquerait la liste
   au moment ou l on veut verifier a qui l on ecrit. */
.ecrire{margin:.5rem 0 0;padding:.55rem .65rem;border-radius:10px;
  background:var(--v03);border:1px solid var(--v10)}
.ecrire label{display:block;font-size:.72rem;color:var(--tx2);margin-bottom:.3rem}
.ecrire textarea{width:100%;min-height:4.4rem;resize:vertical;font:inherit;
  color:var(--tx);background:var(--f-page);border:1px solid var(--v16);
  border-radius:8px;padding:.4rem .5rem}
.ecrire textarea:focus{outline:none;border-color:#c9a97e}
.ecrire .pieds{display:flex;align-items:center;gap:.45rem;margin-top:.4rem}
.ecrire .cpt{font-size:.71rem;color:var(--tx2);margin-left:auto;font-variant-numeric:tabular-nums}
.ecrire .cpt.trop{color:var(--tx-err)}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Personnel connecté ». */
function pagePresence() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Personnel connecté — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.staffaccess}</span><h1>Personnel connecté</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide charge">Lecture des sessions…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var sousEl = document.getElementById('sous');

  var SESS = null;      // null = pas encore lu ; [] = lu, et il n y a personne
  var FRAIS = 120;      // secondes au-dela desquelles on dit << vu il y a … >>
  var CONF = '';        // confirmation deux clics pour la deconnexion
  var ECRIS = '';       // staffId dont la zone d ecriture est ouverte
  var BROUILLON = {};   // staffId -> texte en cours (voir plus bas, c est capital)
  var OCC = false;
  var TIMER = null;
  var MAX = 500;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function fdate(ts){ if (!ts) return ''; try { return new Date(ts).toLocaleString('fr-CA'); } catch (e) { return ''; } }

  /* << vu il y a … >> en mots, pas en secondes. 340 s ne se lit pas ; << il y a
     6 min >> se lit. Au-dela d une heure on donne l heure de l horloge : << il y
     a 7 h >> oblige a faire le calcul de tete. */
  function depuis(sec){
    if (sec === null || sec === undefined) return '';
    if (sec < 15) return 'a l instant';
    if (sec < 90) return 'il y a ' + Math.round(sec) + ' s';
    if (sec < 3600) return 'il y a ' + Math.round(sec / 60) + ' min';
    return 'il y a ' + Math.round(sec / 3600) + ' h';
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application.',
    /* ⚠⚠ DEUX CAUSES NE PEUVENT PAS PORTER LA MEME PHRASE — corrige le
       2026-09-09, apres son signalement << pourquoi je ne vois pas ma session
       active ? ca devrait >>.
       Ces deux motifs disaient MOT POUR MOT la meme chose. Quand la fenetre lui
       a refuse SA propre session, la capture ne permettait pas de savoir si
       c etait la PAGE qui avait mal lu son role ou le SERVEUR qui refusait — et
       ici, diagnostiquer par hypotheses coute un cycle construction +
       publication + installation PAR hypothese. C est la faute payee le
       2026-09-06, et je l ai refaite.
       ⚠ Le motif << droit >> N EXISTE PLUS COTE PAGE : le pre-controle qui le produisait est
       retire (voir admin.js). Le motif reste ici au cas ou une version plus
       ancienne du site le renvoie encore — et il DIT qu il vient de la page. */
    droit:              'La page a refusé : elle ne vous voit pas comme super-administrateur. '
                        + '(Si vous l’êtes, l’administration de cette fenêtre est plus ancienne que le site.)',
    superadmin_required:'Le serveur refuse : cette action est réservée au super-administrateur.',
    session_serveur:    'Le serveur ne reconnaît plus cette session — reconnectez-vous.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    base_injoignable:   'La base de données n’a pas répondu.',
    parametre:          'Demande incomplète.',
    trop_long:          'Le message dépasse ' + MAX + ' caractères.',
    soi_meme:           'Pour vous déconnecter vous-même, utilisez Fichier → Déconnexion : elle prévient de ce qu’elle emporte.',
    echec:              'L’opération a échoué.'
  };
  /* ⚠⚠ UN REFUS DIT CE QUE LA PAGE VOIT (2026-09-09). Il a signale un refus, et
     sa capture ne permettait pas de savoir d ou il venait : la page ? le
     serveur ? une session absente ? J ai du l isoler par elimination en lisant
     trois fichiers, alors que l ecran pouvait le dire.
     C est la lecon du 2026-09-06 : << un desaccord doit se VOIR a l ecran,
     sinon il est INDECIDABLE >> — et ici chaque hypothese coute un cycle
     construction + publication + installation.
     ⚠ Le code du motif est ecrit AUSSI, en petit : le libelle est pour lui, le
     code est pour moi quand il m envoie une capture. */
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 120)) + ')';
    return t;
  }
  function diagnostic(r){
    if (!r) return '';
    var v = r.vu || null;
    var bouts = [];
    if (r.motif) bouts.push('motif : ' + esc(r.motif));
    if (v) {
      bouts.push('jeton de session dans la page : ' + (v.session ? 'oui' : 'NON'));
      bouts.push('rôle vu par la page : ' + esc(v.role || '(aucun)'));
    }
    if (!bouts.length) return '';
    /* ⚠⚠ PAS D OPACITE ICI, ET C EST LE BANC AU RENDU QUI L A TROUVE. Le
       estompage a 0,8 posait --tx2 a 4,48:1 sur le fond de nuit — sous le
       seuil, donc sous-lisible — sur la SEULE ligne de tout l ecran dont le
       but est d etre LUE et recopiee : c est elle qu on demande de nous
       transmettre quand la fenetre refuse. Estomper le diagnostic pour qu il
       se fasse discret, c est le rendre penible a lire au moment ou il sert.
       ⚠ Et il n a ete mesure qu au jour ou un jeu de reponses a enfin dessine
       le cas du refus : la couleur existait depuis la naissance de la fenetre,
       aucun controle ne la voyait parce que RIEN NE L AFFICHAIT. Un vert ne
       vaut que ce que l outil regarde. */
    return '<div class="sub" style="margin-top:.6rem">' + bouts.join(' · ') + '</div>';
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  /* ⚠⚠ ON RETIENT LE TEXTE EN COURS DE FRAPPE AVANT CHAQUE REDESSIN, ET C EST
     OBLIGATOIRE. Cet ecran se rafraichit tout seul aux 4 s. Sans cette capture,
     un message a moitie ecrit disparaitrait sous les doigts au premier
     rafraichissement — le defaut le plus enrageant qu un formulaire puisse
     avoir, et celui que ce depot a deja paye sur les listes a cadenas (<< on ne
     redessine pas sous les doigts de quelqu un >>).
     ⚠ Le sondage saute d ailleurs les tours pendant qu une zone d ecriture est
     ouverte (voir la fonction suivre) : ceci est la seconde ceinture, pour les redessins
     provoques par un clic. */
  function retenirBrouillon(){
    var ta = document.getElementById('p-texte');
    if (ta && ECRIS) BROUILLON[ECRIS] = ta.value;
  }

  function ligne(s){
    var moi = !!s.moi;
    var etat = s.frais
      ? '<span class="pill bon">a l ecran</span>'
      : '<span class="pill att">' + esc(depuis(s.vuDepuisSec)) + '</span>';
    /* ⚠ AUCUN BOUTON SUR SA PROPRE LIGNE, et pas seulement grise : le serveur
       refuse de toute facon (motif soi_meme), donc un bouton la serait une
       porte qui ne mene nulle part. On dit << vous >> et on s arrete la. */
    var actions = moi
      ? '<span class="sub mut">vous</span>'
      : '<button class="mini" data-ecrire="' + esc(s.staffId) + '">Message…</button>'
        + ' <button class="mini dgr" data-dec="' + esc(s.staffId) + '">'
        + (CONF === s.staffId ? 'Confirmer la déconnexion' : 'Déconnecter') + '</button>';
    var h = '<tr><td><strong>' + esc(s.nom || '—') + '</strong>'
      + (moi ? '' : '')
      + (s.courriel ? '<div class="sub">' + esc(s.courriel) + '</div>' : '')
      + '</td>'
      + '<td><span class="pill neutre">' + esc(s.role || '—') + '</span></td>'
      + '<td>' + etat
      + (s.vu ? '<div class="sub">' + esc(fdate(s.vu)) + '</div>' : '<div class="sub mut">pas encore vu</div>')
      + '</td>'
      + '<td style="white-space:nowrap"><div class="sub">' + esc(fdate(s.depuis)) + '</div></td>'
      + '<td style="text-align:right;white-space:nowrap">' + actions + '</td></tr>';
    if (ECRIS === s.staffId) {
      var t = BROUILLON[s.staffId] || '';
      h += '<tr><td colspan="5"><div class="ecrire">'
        + '<label for="p-texte">Message a ' + esc(s.nom || 'cette personne')
        + ' — il s affichera sur son ecran dans quelques secondes.</label>'
        + '<textarea id="p-texte" maxlength="' + MAX + '" '
        + 'placeholder="Ce que vous voulez lui dire.">' + esc(t) + '</textarea>'
        + '<div class="pieds"><button class="mini" id="p-envoyer">Envoyer</button>'
        + '<button class="mini" id="p-annuler">Annuler</button>'
        + '<span class="cpt" id="p-cpt"></span></div>'
        + '</div></td></tr>';
    }
    return h;
  }

  function dessiner(){
    if (SESS === null) { corps.innerHTML = '<div class="vide charge">Lecture des sessions…</div>'; return; }
    sousEl.textContent = SESS.length
      ? (SESS.length + ' session' + (SESS.length > 1 ? 's' : '') + ' ouverte' + (SESS.length > 1 ? 's' : ''))
      : 'personne n est connecte';

    var h = '<div class="barre"><button class="mini" id="p-reload">Actualiser</button></div>';

    /* ⚠ CETTE NOTE RESTE, contrairement a celles qu on a retirees ailleurs. Les
       exposes retires expliquaient a quelqu un un mecanisme qu il avait sous les
       yeux (<< ce que vous regardez >>). Celle-ci previent d une CONSEQUENCE
       avant le geste qui la provoque, et elle nomme la limite de ce que l ecran
       peut savoir. Les deux sont utiles au moment ou on les lit. */
    h += '<div class="note">'
      + '<strong>Deconnecter quelqu un coupe sa session sans lui demander</strong> : '
      + 'son travail non enregistre est perdu, et ses fiches ouvertes se liberent. '
      + 'Deux clics sont demandes.<br>'
      + '<strong>« A l ecran »</strong> veut dire que le poste s est manifeste il y a '
      + 'moins de ' + FRAIS + ' s. Une fenêtre réduite dans la zone de notification '
      + 'se manifeste moins souvent : la personne reste connectee et joignable, '
      + 'seul son dernier passage recule.'
      + '</div>';

    h += '<div class="carte"><h3>Sessions ouvertes (' + SESS.length + ')</h3>';
    if (!SESS.length) {
      h += '<div class="vide">Personne n est connecte en ce moment.</div>';
    } else {
      h += '<table><thead><tr><th>Personne</th><th>Role</th><th>Dernier passage</th>'
        + '<th>Connecte depuis</th><th></th></tr></thead><tbody>';
      for (var i = 0; i < SESS.length; i++) h += ligne(SESS[i]);
      h += '</tbody></table>';
    }
    h += '</div>';

    corps.innerHTML = h;

    var pr = document.getElementById('p-reload');
    if (pr) pr.onclick = function(){ CONF = ''; charger(true); };

    var es = corps.querySelectorAll('[data-ecrire]');
    for (var e = 0; e < es.length; e++) {
      es[e].onclick = function(){
        retenirBrouillon();
        var id = this.getAttribute('data-ecrire');
        ECRIS = (ECRIS === id) ? '' : id;
        CONF = '';
        dessiner();
        var ta = document.getElementById('p-texte');
        if (ta) { ta.focus(); majCompteur(); }
      };
    }
    var ds = corps.querySelectorAll('[data-dec]');
    for (var d = 0; d < ds.length; d++) {
      ds[d].onclick = function(){
        var id = this.getAttribute('data-dec');
        if (CONF === id) { CONF = ''; deconnecter(id); }
        else {
          CONF = id;
          retenirBrouillon();
          dessiner();
          dire('Cliquez encore pour deconnecter cette personne.', 'att');
        }
      };
    }
    var ta2 = document.getElementById('p-texte');
    if (ta2) {
      ta2.oninput = function(){ BROUILLON[ECRIS] = ta2.value; majCompteur(); };
      /* Ctrl+Entree envoie : c est le geste attendu dans une zone de texte
         multiligne, ou Entree doit rester un retour a la ligne. */
      ta2.onkeydown = function(ev){
        if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); envoyer(); }
      };
      majCompteur();
    }
    var pe = document.getElementById('p-envoyer');
    if (pe) pe.onclick = envoyer;
    var pa = document.getElementById('p-annuler');
    if (pa) pa.onclick = function(){
      /* ⚠ ANNULER JETTE LE BROUILLON, EXPRES. Le garder ferait reapparaitre un
         vieux texte a la prochaine ouverture de la zone, et on l enverrait sans
         le relire. Un brouillon qu on retient doit etre celui qu on est en train
         d ecrire, pas celui qu on a renonce a envoyer. */
      delete BROUILLON[ECRIS];
      ECRIS = '';
      dessiner();
      dire('');
    };
  }

  function majCompteur(){
    var ta = document.getElementById('p-texte');
    var c = document.getElementById('p-cpt');
    if (!ta || !c) return;
    var n = ta.value.length;
    c.textContent = n + ' / ' + MAX;
    c.className = 'cpt' + (n > MAX ? ' trop' : '');
  }

  function envoyer(){
    if (OCC) return;
    var ta = document.getElementById('p-texte');
    if (!ta) return;
    var t = ta.value.trim();
    var cible = ECRIS;
    if (!t) { dire('Le message est vide.', 'att'); ta.focus(); return; }
    if (t.length > MAX) { dire('Le message depasse ' + MAX + ' caracteres.', 'err'); return; }
    OCC = true; dire('Envoi…');
    appeler('presence:message', [cible, t]).then(function(r){
      OCC = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      /* ⚠ ON NE JETTE LE BROUILLON QU APRES UN VRAI SUCCES. Le vider avant la
         reponse ferait perdre le texte sur un echec reseau, et il faudrait le
         reecrire de memoire. */
      delete BROUILLON[cible];
      ECRIS = '';
      dessiner();
      /* ⚠ << REMIS DANS QUELQUES SECONDES >>, ET PAS << ENVOYE >>. Le message
         attend le prochain sondage des verrous du poste destinataire (3 s, ou
         jusqu a une minute si sa fenetre est reduite : le systeme ralentit les
         minuteurs des fenetres cachees). Annoncer << envoye >> ferait croire a
         une remise immediate et douter du mecanisme cinq secondes plus tard. */
      dire('Message deposé pour ' + (r.nom || 'cette personne')
        + ' — il s affichera sur son ecran dans quelques secondes.', 'bon');
    });
  }

  function deconnecter(id){
    if (OCC) return; OCC = true; dire('Deconnexion…');
    appeler('presence:deconnecter', [id]).then(function(r){
      OCC = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire((r.nom || 'La personne') + ' est deconnectee.', 'bon');
      charger(true);
    });
  }

  function charger(fort){
    if (OCC) return;
    appeler('presence:liste', []).then(function(r){
      if (!r || !r.ok) {
        if (SESS === null) corps.innerHTML = '<div class="carte"><div class="vide m-' + esc((r && r.motif) || 'echec') + '">'
          + expliquer(r) + diagnostic(r) + '</div></div>';
        if (fort) dire(expliquer(r), 'err');
        return;
      }
      SESS = r.sessions || [];
      if (r.fraisSec) FRAIS = r.fraisSec;
      retenirBrouillon();
      dessiner();
      if (fort) dire('');
    });
  }

  /* ⚠ RAFRAICHISSEMENT VIVANT, MEME RAISON QUE << VERROUS >> : la question posee
     est << qui travaille EN CE MOMENT >>, pas << qui a travaille >>. Un ecran
     fige montrerait comme connectee une personne partie depuis dix minutes, et
     on lui ecrirait.
     ⚠ 4 s ET NON 3 : cet ecran n est ouvert que par un super-administrateur, et
     il n a pas besoin de la meme vivacite qu un cadenas de liste. Un tour de
     moins par minute et par fenetre ouverte, pour rien de perdu.
     ⚠⚠ ON NE SONDE PAS PENDANT QU UNE ZONE D ECRITURE EST OUVERTE NI PENDANT UNE
     CONFIRMATION : le texte en cours de frappe et le bouton arme disparaitraient
     sous les doigts. La fonction retenirBrouillon est la seconde ceinture ; celle-ci est la
     premiere, et c est elle qui evite le clignotement. */
  function suivre(){
    if (TIMER) return;
    TIMER = setInterval(function(){
      if (document.hidden || OCC || CONF || ECRIS) return;
      charger(false);
    }, 4000);
  }
  window.addEventListener('pagehide', function(){ if (TIMER) { clearInterval(TIMER); TIMER = null; } });

  window.szActualiser = function(){ if (!CONF && !ECRIS) charger(false); };
  window.szRevenir = function(){ if (!ECRIS) charger(true); };

  document.addEventListener('keydown', function(ev){
    /* ⚠ ECHAP FERME LA ZONE D ECRITURE D ABORD, LA FENETRE ENSUITE. Sans ce
       degre, on perdrait un message a moitie ecrit en voulant seulement
       refermer le formulaire — et c est le reflexe de tout le monde. */
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    if (ECRIS) { delete BROUILLON[ECRIS]; ECRIS = ''; dessiner(); dire(''); return; }
    P.fermer();
  });

  charger(true);
  suivre();
})();
</script>
</body></html>`;
}

module.exports = { pagePresence };
