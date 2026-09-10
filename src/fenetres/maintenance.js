'use strict';

/*
 * FENÊTRE « MODE USAGE EXCLUSIF » — NATIVE, DÉTACHÉE
 * =============================================================================
 * Sa demande du 2026-09-09, en trois temps — et les trois comptent :
 *
 *   1. « Une option usage exclusif dans l'application que je peux activer dans
 *      un mode de maintenance si je veux m'assurer que personne ne se connecte
 *      pendant cette période […] une bannière dans l'écran de connexion pour
 *      toutes les autres instances […] si je me déconnecte même avec ce mode
 *      activé je dois pouvoir me reconnecter. »
 *   2. « Mets le bouton mode exclusif dans le tableau de bord plutôt et non
 *      dans personnel connecté. »
 *   3. « Si je clique sur mode exclusif, une autre fenêtre native s'ouvre en
 *      détaché et me propose les options. »
 *
 * ⚠⚠ POURQUOI CETTE FENÊTRE EXISTE, ET CE QU'ELLE CORRIGE. Ce formulaire a
 * d'abord vécu DANS « Personnel connecté ». Cette fenêtre-là rafraîchit sa liste
 * toutes les quatre secondes et redessine son corps entier : le sélecteur de
 * date natif que le système venait d'ouvrir disparaissait avec, une seconde
 * après le clic. Son signalement, mot pour mot : « on sélectionne et il
 * rafraîchit et tout disparaît ». Un formulaire n'a rien à faire dans un écran
 * qui se réécrit tout seul — c'est la règle « un écran, une fenêtre », et elle
 * n'est pas de la mise en ordre : ici, l'ignorer rendait le formulaire
 * inutilisable.
 *
 * ⚠⚠ RIEN NE SE RAFRAÎCHIT ICI. Aucun sondage, aucune minuterie, aucun redessin
 * qui ne vienne d'un geste. C'est la propriété qui rend le sélecteur de date
 * utilisable, et il faut la garder : ajouter un rafraîchissement « pour voir si
 * quelqu'un d'autre a levé le mode » ramènerait exactement le défaut d'hier.
 *
 * ⚠⚠ SUPER-ADMINISTRATEUR — ET CETTE FENÊTRE NE DÉCIDE DE RIEN. Le droit est
 * vérifié par le SERVEUR (`case 'maintenance_exclusif'` dans turso-proxy.php
 * refuse tout autre rôle). Ici, on ne fait que ne pas dessiner ce qu'on n'a pas
 * le droit de montrer. Même montage que « Personnel connecté » et « Verrous ».
 *
 * ⚠ LE NIP EST DEMANDÉ ICI ET NULLE PART AILLEURS, parce que c'est le seul
 * moment possible : il sert à SORTIR du mode, et poser le mode sans lui, c'est
 * se mettre dehors sans clé.
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
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.75rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
button{font:inherit;color:var(--tx);background:var(--v05);cursor:pointer;
  border:1px solid var(--v16);border-radius:8px;padding:.34rem .7rem}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button:focus{outline:none;border-color:#c9a97e}
button.dgr{border-color:rgba(239,68,68,.5);color:var(--tx-err)}
button.dgr:hover:not(:disabled){background:rgba(239,68,68,.14)}
button.prim{border-color:rgba(201,169,126,.55);color:var(--tx-or2)}
button.prim:hover:not(:disabled){background:rgba(201,169,126,.14)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.85rem .95rem}
.carte.on{border-color:rgba(240,180,80,.45);background:rgba(240,180,80,.08)}
.carte h3{margin:0 0 .45rem;font:700 .95rem/1.2 Georgia,serif;
  display:flex;align-items:center;gap:.5rem}
.expl{font-size:.82rem;line-height:1.6;color:var(--tx2)}
.grille{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin:.85rem 0 0}
@media (max-width:620px){.grille{grid-template-columns:1fr}}
label{display:block;font-size:.75rem;color:var(--tx2);margin:0 0 .28rem}
input{width:100%;padding:.52rem .65rem;border-radius:9px;
  border:1px solid var(--v12);background:var(--f-champ);color:var(--tx);
  font:400 .88rem/1.2 system-ui}
input:focus{outline:none;border-color:#c9a97e}
input.manque{border-color:var(--tx-err)}
.champ{margin-top:.7rem}
.pieds{display:flex;gap:.55rem;margin:1rem 0 0;flex-wrap:wrap}
.avert{font-size:.79rem;line-height:1.6;color:var(--tx2);background:var(--v03);
  border:1px solid var(--v07);border-radius:10px;padding:.55rem .7rem;margin-top:.8rem}
.vide{padding:1.6rem .8rem;text-align:center;color:var(--tx2);font-size:.85rem}
.vide .ic{display:block;font-size:1.5rem;margin-bottom:.5rem;opacity:.7}
.diag{font-size:.71rem;color:var(--tx2);margin-top:.6rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Mode usage exclusif ». */
function pageMaintenance() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Mode usage exclusif — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.verrou}</span><h1>Mode usage exclusif</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide charge">Lecture de l’état…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
  var corps = document.getElementById('corps');
  var sousEl = document.getElementById('sous');

  ${JS_DIRE}
  ${JS_ACTIVITE}

  /* ⚠⚠ CE « dire » MANQUAIT, ET LE BOUTON << Activer le mode >> NE FAISAIT RIEN.
     Son signalement : << quand je clique sur activer rien ne se passe >>.
     « poser() » appelle « dire('Activation…') » avant l appel au pont ; « dire » 
     n etait defini nulle part ici — seul « szDire » existe, fourni par le socle.
     Le gestionnaire de clic levait donc une ReferenceError et mourait AVANT de
     rien envoyer. Aucun message, aucune trace : << rien ne se passe >> est la
     description exacte.
     ⚠ ET AUCUN CONTROLE NE POUVAIT L ATTRAPER : « node --check » compile (un
     identifiant libre est licite a la compilation), et le harnais des fenetres
     n execute que le CHARGEMENT — il ne clique jamais. Mes trois cas de
     reponses prouvaient que les trois ECRANS se dessinent ; ils ne pouvaient
     pas prouver qu un bouton fonctionne. Les deux fenetres soeurs (presence,
     tableau) portent cette meme ligne : je l ai simplement oubliee. */
  function dire(t, cl){ szDire(t, cl); }

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application.',
    superadmin_required:'Le serveur refuse : cette action est réservée au super-administrateur.',
    session_serveur:    'Le serveur ne reconnaît plus cette session — reconnectez-vous.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    base_injoignable:   'La base de données n’a pas répondu.',
    parametre:          'Demande incomplète.',
    echec:              'L’opération a échoué.'
  };
  /* Le code du motif est ecrit AUSSI, en petit : le libelle est pour lui, le
     code est pour moi quand il m envoie une capture. Meme regle que la fenetre
     Personnel connecte, et pour la meme raison — chaque hypothese coute un
     cycle construction + publication + installation. */
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 140)) + ')';
    return t;
  }

  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  var MX = null;

  function dessiner(){
    if (!MX) { corps.innerHTML = '<div class="vide charge">Lecture de l’état…</div>'; return; }

    if (!MX.ok) {
      sousEl.textContent = '';
      corps.innerHTML = '<div class="carte"><div class="vide">'
        + '<span class="ic">\\u26a0</span>' + expliquer(MX)
        + '<div class="diag">motif : ' + esc((MX && MX.motif) || '?') + '</div>'
        + '</div></div>';
      return;
    }

    if (MX.actif) {
      sousEl.textContent = 'actif';
      corps.innerHTML = '<div class="carte on">'
        + '<h3><span>\\u{1F512}</span><span>Le mode est ACTIF</span></h3>'
        + '<div class="expl">' + esc(MX.phrase || '') + '<br><br>'
        + 'Personne ne peut se connecter, sauf '
        + (MX.moi ? '<strong>vous</strong> (vous l’avez activé)' : 'la personne qui l’a activé')
        + '. Vous pouvez vous déconnecter et vous reconnecter sans problème.'
        + (MX.moi ? '' : '<br><br><strong>Attention :</strong> ce mode a été activé par quelqu’un d’autre. '
            + 'Le lever rouvre les connexions pendant qu’il travaille peut-être dessus.')
        + '</div>'
        /* ══ PROLONGER, SANS RELANCER — sa demande du 2026-09-10 ══════════════
           « Je préfère que ça se lève automatiquement, et de toute façon si j ai
           besoin de plus de temps je pourrai en ajouter dans les options du mode
           exclusif ; fais juste sûr que si je rajoute du temps en prolongeant la
           période, cela soit effectif sans devoir relancer le mode. »
           ⚠⚠ TROIS BOUTONS D ABORD, LE CHAMP ENSUITE. Prolonger arrive quand la
           maintenance déborde — donc les mains dans le moteur, pas dans un
           formulaire. << +1 h >> est un clic ; retaper une date complète en est
           dix, et c est le moment où l on en a le moins envie. Le champ reste
           là pour une heure précise.
           ⚠ ON CALCULE DEPUIS LA FIN ACTUELLE, PAS DEPUIS MAINTENANT : << +1 h >>
           veut dire << une heure de plus >>, pas << une heure à partir de ce
           clic >>. Depuis maintenant, prolonger de 1 h une maintenance qui a
           encore 40 minutes la RACCOURCIRAIT de 20 minutes.
           ⚠ ET SI LA FIN EST DÉJÀ PASSÉE, on repart de maintenant : sinon << +1 h >>
           sur une période finie depuis deux heures rendrait une fin encore dans
           le passé, donc un refus incompréhensible. */
        + '<div class="champ"><label for="mx-fin2">Prolonger jusqu’à</label>'
        + '<input type="datetime-local" id="mx-fin2" value="' + esc(mxLocal(mxBase())) + '"></div>'
        + '<div class="pieds">'
        + '<button id="mx-p1" data-h="1">+ 1 h</button>'
        + '<button id="mx-p2" data-h="2">+ 2 h</button>'
        + '<button id="mx-p4" data-h="4">+ 4 h</button>'
        + '<button class="prim" id="mx-prolonger">Prolonger</button>'
        + '</div>'
        + '<div class="avert"><strong>Le mode se lève tout seul à l’heure de fin.</strong> '
        + 'Aucun geste à faire — les connexions rouvrent à la seconde dite, sur tous les '
        + 'postes, sans que personne ait à fermer ou rouvrir l’application.<br>'
        + 'Depuis l’écran de connexion, <strong>Ctrl + Maj + 0</strong> demande le NIP '
        + 'et lève la maintenance immédiatement.</div>'
        + '<div class="pieds"><button class="dgr" id="mx-lever">Lever maintenant</button>'
        + '<button id="mx-fermer">Fermer</button></div>'
        + '</div>';
      brancher();
      return;
    }

    sousEl.textContent = 'inactif';
    corps.innerHTML = '<div class="carte">'
      + '<h3><span>\\u{1F512}</span><span>Activer le mode</span></h3>'
      + '<div class="expl">Personne d’autre ne pourra se connecter, et une bannière annoncera '
      + 'la période sur l’écran de connexion de tous les postes. '
      + '<strong>Vous resterez le seul à pouvoir entrer</strong>, même après vous être '
      + 'déconnecté.</div>'
      + '<div class="grille">'
      + '<div><label for="mx-debut">Début de la période</label>'
      + '<input type="datetime-local" id="mx-debut"></div>'
      + '<div><label for="mx-fin">Fin de la période</label>'
      + '<input type="datetime-local" id="mx-fin"></div>'
      + '</div>'
      + '<div class="champ"><label for="mx-msg">Message ajouté à la bannière (facultatif)</label>'
      + '<input type="text" id="mx-msg" maxlength="300" '
      + 'placeholder="Ex. : mise à jour du système de facturation."></div>'
      + '<div class="champ"><label for="mx-nip">NIP de désactivation d’urgence '
      + '(' + (MX.nipMin || 6) + ' à ' + (MX.nipMax || 12) + ' chiffres)</label>'
      + '<input type="password" id="mx-nip" inputmode="numeric" autocomplete="new-password" '
      + 'maxlength="' + (MX.nipMax || 12) + '"></div>'
      + '<div class="avert"><strong>Notez ce NIP ailleurs.</strong> Il se saisit depuis l’écran '
      + 'de connexion avec <strong>Ctrl + Maj + 0</strong>, et il lève la maintenance '
      + 'immédiatement.<br>'
      + '<strong>Le mode se lève tout seul à l’heure de fin</strong> — vous pourrez le '
      + 'prolonger en cours de route sans le relancer, et sans changer ce NIP.</div>'
      + '<div class="pieds"><button class="prim" id="mx-poser">Activer le mode</button>'
      + '<button id="mx-fermer">Annuler</button></div>'
      + '</div>';
    brancher();
    var d = document.getElementById('mx-debut');
    if (d) d.focus();
  }

  /* La fin depuis laquelle on compte un << +N h >> : la fin annoncée si elle est
     encore devant, maintenant sinon. Voir la note de l ecran ACTIF. */
  function mxBase(){
    var t = MX && MX.fin ? Date.parse(MX.fin) : 0;
    if (!t || t < Date.now()) t = Date.now();
    return t + 3600000;          // par defaut, une heure de plus
  }
  /* ⚠ « datetime-local » VEUT DE L HEURE LOCALE, PAS DE L ISO UTC. « toISOString() » 
     rend du Z : le champ afficherait l heure de Greenwich, donc quatre heures de
     décalage l été à Montréal — et il aurait prolongé dans le passé sans
     comprendre pourquoi. */
  function mxLocal(ms){
    var d = new Date(ms);
    var p = function(n){ return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
      + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function brancher(){
    var p = document.getElementById('mx-poser');
    if (p) p.onclick = poser;
    var l = document.getElementById('mx-lever');
    if (l) l.onclick = lever;
    var pr = document.getElementById('mx-prolonger');
    if (pr) pr.onclick = function(){ prolonger(null); };
    /* Les trois raccourcis POSENT la valeur dans le champ au lieu d envoyer tout
       de suite : on voit ce qu on va faire avant de le faire, et on peut ajuster
       de dix minutes sans repartir de zéro. */
    ['mx-p1', 'mx-p2', 'mx-p4'].forEach(function(id){
      var b = document.getElementById(id);
      if (!b) return;
      b.onclick = function(){
        var h = parseInt(b.getAttribute('data-h'), 10) || 1;
        var t = MX && MX.fin ? Date.parse(MX.fin) : 0;
        if (!t || t < Date.now()) t = Date.now();
        var c = document.getElementById('mx-fin2');
        if (c) c.value = mxLocal(t + h * 3600000);
      };
    });
    var f = document.getElementById('mx-fermer');
    if (f) f.onclick = function(){ P.fermer(); };
  }

  function poser(){
    var d = document.getElementById('mx-debut');
    var f = document.getElementById('mx-fin');
    var m = document.getElementById('mx-msg');
    var n = document.getElementById('mx-nip');
    if (!d || !f || !n) return;
    /* ⚠ ON MONTRE LE CHAMP FAUTIF, PAS SEULEMENT LA PHRASE. Devant quatre
       champs, savoir POURQUOI ne suffit pas : il faut savoir LEQUEL. */
    [d, f, n].forEach(function(e){ e.classList.remove('manque'); });
    if (!d.value) { d.classList.add('manque'); d.focus(); dire('Indiquez le début de la période.', 'att'); return; }
    if (!f.value) { f.classList.add('manque'); f.focus(); dire('Indiquez la fin de la période.', 'att'); return; }
    var min = MX.nipMin || 6, max = MX.nipMax || 12;
    if (!new RegExp('^[0-9]{' + min + ',' + max + '}$').test(n.value || '')) {
      n.classList.add('manque'); n.focus();
      dire('Le NIP doit compter de ' + min + ' à ' + max + ' chiffres.', 'att');
      return;
    }
    var b = document.getElementById('mx-poser');
    if (b) b.disabled = true;
    dire('Activation…');
    appeler('maintenance:ecrire',['poser', { debut: d.value, fin: f.value,
      message: m ? m.value : '', nip: n.value }]).then(function(r){
      var b2 = document.getElementById('mx-poser');
      if (b2) b2.disabled = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Mode activé. Personne d’autre ne peut se connecter.', 'bon');
      /* ⚠ LE TABLEAU DE BORD DOIT LE SAVOIR TOUT DE SUITE : c est lui qui porte
         le bouton, et son libelle change avec l etat. Sans cet avis, il
         annoncerait << inactif >> jusqu a sa prochaine ouverture. */
      try { P.appeler('tableau:rafraichirMaintenance'); } catch (e) {}
      charger();
    });
  }

  function prolonger(){
    var f = document.getElementById('mx-fin2');
    if (!f) return;
    f.classList.remove('manque');
    if (!f.value) { f.classList.add('manque'); f.focus(); dire('Indiquez la nouvelle heure de fin.', 'att'); return; }
    if (Date.parse(f.value) <= Date.now()) {
      f.classList.add('manque'); f.focus();
      dire('Cette heure est déjà passée.', 'att');
      return;
    }
    var b = document.getElementById('mx-prolonger');
    if (b) b.disabled = true;
    dire('Prolongation…');
    /* ⚠ ON N ENVOIE QUE LA FIN. Le NIP, l initiateur et le compte de tentatives
       restent ceux du mode en cours — c est tout le sens de << sans devoir
       relancer >> : le NIP noté ailleurs reste valable. */
    appeler('maintenance:ecrire',['prolonger', { fin: f.value }]).then(function(r){
      var b2 = document.getElementById('mx-prolonger');
      if (b2) b2.disabled = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Maintenance prolongée. Le NIP n’a pas changé.', 'bon');
      try { P.appeler('tableau:rafraichirMaintenance'); } catch (e) {}
      charger();
    });
  }

  function lever(){
    var l = document.getElementById('mx-lever');
    if (l) l.disabled = true;
    dire('Levée…');
    appeler('maintenance:ecrire',['lever', {}]).then(function(r){
      var l2 = document.getElementById('mx-lever');
      if (l2) l2.disabled = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Mode levé. Les connexions sont de nouveau possibles.', 'bon');
      try { P.appeler('tableau:rafraichirMaintenance'); } catch (e) {}
      charger();
    });
  }

  function charger(){
    appeler('maintenance:etat',[]).then(function(r){
      MX = r || { ok: false, motif: 'echec' };
      dessiner();
    });
  }

  /* ⚠ RAMENEE AU PREMIER PLAN : on relit. C est le SEUL rafraichissement de
     cette fenetre, et il vient d un geste — quelqu un a pu lever le mode
     ailleurs pendant qu elle etait derriere. Une minuterie, elle, refermerait le
     selecteur de date : c est exactement le defaut qui a fait sortir ce
     formulaire de la fenetre Personnel connecte. */
  window.szRevenir = function(){ charger(); };
  window.szActualiser = function(){};

  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    P.fermer();
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageMaintenance };
