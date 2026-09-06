'use strict';

/*
 * FENÊTRE « VEILLEUR DE COMMANDES » — NATIVE
 * =============================================================================
 * Son point 6, mot pour mot : « on pourrait le désactiver au besoin et le
 * réinstaller manuellement via l'application ». C'est cet écran.
 *
 * ⚠⚠ IL N'A PAS DE JUMEAU WEB, ET IL NE PEUT PAS EN AVOIR. Tout ce qu'il règle
 * vit SUR LE POSTE : une entrée de registre, un réglage de poste, un autre
 * processus. Une page web n'a accès à aucun des trois. C'est le même cas que
 * « Verrous » — un écran né natif — et il est donc branché comme lui : une
 * fenêtre à part, pas une section ancrable du dock (le chemin ancrable demande au
 * SITE de naviguer vers une section du même nom, qui n'existe pas ici, et le clic
 * de menu n'ouvrirait RIEN).
 *
 * ══⚠⚠ CET ÉCRAN A PERDU SA MOITIÉ LE 2026-09-06, ET C'EST UN PROGRÈS ═════════
 * Il portait une carte « Jeton de veille » : un secret à coller sur CHAQUE
 * poste, avec ses règles (champ vide = inchangé, retrait explicite, chiffrement
 * du magasin système). Tout cela était soigné — et tout cela était de trop.
 * Ses mots : « je ne veux pas de jeton configuré côté poste pour le veilleur, il
 * faut considérer que ce dernier pourra être installé aussi par nos employés et
 * ça doit être simple ».
 * Il a raison, et c'est la source des trois signalements précédents : un secret
 * à poser à la main est une consigne à transmettre, un secret qui circule, et un
 * employé bloqué le jour où il ne l'a pas. Le veilleur porte désormais la CLÉ DE
 * L'APPLICATION, comme le canal de mise à jour. Rien à saisir.
 * ⚠ La bonne question n'était pas « comment bien faire circuler ce secret »,
 * c'était « pourquoi un secret de plus ». Un mécanisme irréprochable au service
 * d'un besoin qui n'existe pas reste du travail à jeter.
 *
 * ⚠ DEUX ÉTATS À NE PAS CONFONDRE : « en marche » (le processus tourne) et « à
 * l'écoute » (il n'est pas en pause). Sans les distinguer, « ça ne marche pas »
 * n'a pas de réponse. (Il y en avait TROIS ; « configuré » est parti avec le
 * jeton, et c'est autant de moins à expliquer.)
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.55rem 1.1rem;
  border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.quoi{font-size:.79rem;color:var(--tx2);line-height:1.6;margin:0 0 1rem}
.quoi b{color:var(--tx)}
.carte{background:var(--v03);border:1px solid var(--v10);border-radius:13px;
  padding:1rem 1.1rem;margin:0 0 .9rem}
.carte h2{margin:0 0 .8rem;font:700 .93rem/1.2 Georgia,serif}
/* L'ÉTAT — trois lignes, une par question, parce que ce sont trois questions. */
.etats{display:grid;gap:.5rem}
.et{display:flex;align-items:center;gap:.6rem;font-size:.85rem}
.pastille{flex:0 0 auto;width:10px;height:10px;border-radius:50%;background:var(--v16)}
.pastille.bon{background:#4ade80}
.pastille.mal{background:#f87171}
.pastille.att{background:#fbbf24}
.et .sub{color:var(--tx-gris);font-size:.76rem}
label.champ{display:block;margin:0 0 .8rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;
  letter-spacing:.05em;color:var(--tx2);margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:var(--tx-gris);margin:.25rem 0 0;line-height:1.5}
input.t{width:100%;background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;
  color:var(--tx);font:inherit;font-size:.85rem;padding:.45rem .6rem}
input.t:focus{outline:none;border-color:#c9a97e}
label.bascule{display:flex;align-items:center;gap:.45rem;font-size:.84rem;cursor:pointer;
  -webkit-user-select:none;user-select:none;margin:.2rem 0 0}
label.bascule input{width:16px;height:16px;accent-color:#c9a97e;flex:0 0 auto}
/* Le diagnostic : discret quand tout va, ROUGE quand les deux chemins diffèrent. */
.diag{font-size:.7rem;color:var(--tx-gris);line-height:1.5;margin:.7rem 0 0;
  word-break:break-all;font-family:ui-monospace,Consolas,monospace}
.diag.mal{color:var(--tx-err2)}
.rangee{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin:.7rem 0 0}
button{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);
  border-radius:8px;padding:.4rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:focus{outline:none;border-color:#c9a97e}
button:disabled{opacity:.45;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.dgr{border-color:rgba(248,113,113,.5);color:var(--tx-err2)}
.pied{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;padding:.55rem 1.05rem;
  border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.75rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageVeilleurConfig() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Veilleur de commandes</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><h1>Veilleur de commandes</h1></div>
<div class="corps" id="corps">
  <p class="quoi">Le veilleur est un petit programme qui reste dans la
    <b>zone de notification</b>, à côté de l'horloge. Il annonce les
    <b>nouvelles commandes</b> et les <b>nouvelles demandes de retour</b> par une
    bulle et un son — <b>un son qui monte</b> pour une commande, <b>un son qui
    descend</b> pour un retour. Il continue de veiller <b>même quand cette
    application est fermée</b>.</p>
  <p class="quoi"><b>Rien à configurer.</b> Le veilleur s'installe avec
    l'application et se sert de la même autorisation qu'elle : aucun code, aucune
    clé à saisir. Sur un poste d'employé, il suffit d'installer l'application.</p>

  <div class="carte">
    <h2>État</h2>
    <div class="etats">
      <div class="et"><span class="pastille" id="p-marche"></span>
        <span id="t-marche">Lecture…</span></div>
      <div class="et"><span class="pastille" id="p-ecoute"></span>
        <span id="t-ecoute">Lecture…</span></div>
    </div>
    <div class="rangee">
      <button class="prim" id="b-relancer">Démarrer / réinstaller le veilleur</button>
      <button class="dgr" id="b-arreter">Arrêter le veilleur</button>
      <button id="b-pause">Mettre en pause</button>
      <button id="b-relire">Actualiser</button>
    </div>
    <label class="bascule"><input type="checkbox" id="c-demarrage">
      Démarrer le veilleur en même temps que Windows</label>
    <label class="bascule"><input type="checkbox" id="c-avecapp">
      Démarrer le veilleur en même temps que cette application</label>
    <p class="diag" id="diag"></p>
  </div>

</div>
<div class="pied">
  <span class="msg" id="msg"></span>
  <button id="b-fermer">Fermer</button>
</div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_DIRE}

  var $ = function(id){ return document.getElementById(id); };
  var V = (P && P.veilleur) ? P.veilleur : null;
  var etat = null;

  /* Le pont peut manquer : fenetre ouverte dans un navigateur pour la mettre au
     point, ou coquille trop ancienne. On le DIT, et on desactive tout — des
     boutons qui ne font rien sont pires qu'un message. */
  if (!V) {
    dire('Cette version de l application ne connait pas le veilleur.', 'err');
    var tous = document.querySelectorAll('button, input');
    for (var i = 0; i < tous.length; i++) tous[i].disabled = true;
    $('b-fermer').disabled = false;
  }

  var pose = function(idP, idT, classe, texte){
    $(idP).className = 'pastille ' + classe;
    $(idT).textContent = texte;
  };

  var dessiner = function(e){
    if (!e) return;
    etat = e;

    /* TROIS QUESTIONS, TROIS LIGNES. Les fondre en une seule pastille verte ou
       rouge etait tentant, et c est exactement ce qui rend << ca ne marche pas >>
       impossible a diagnostiquer : un veilleur qui tourne sans jeton et un
       veilleur eteint donneraient le meme rouge. */
    if (e.enMarche) pose('p-marche','t-marche','bon','Le veilleur tourne sur ce poste.');
    else pose('p-marche','t-marche','mal','Le veilleur ne tourne pas.');

    if (!e.actif) pose('p-ecoute','t-ecoute','att','En pause : il ne signale rien.');
    else if (e.vu) pose('p-ecoute','t-ecoute','bon','A l ecoute. Dernier controle : ' + heure(e.vu) + '.');
    else pose('p-ecoute','t-ecoute','att','A l ecoute, pas encore de controle.');

    $('b-pause').textContent = e.actif ? 'Mettre en pause' : 'Reprendre la veille';
    $('c-demarrage').checked = !!e.demarrageAuto;
    $('c-avecapp').checked = e.avecApp !== false;

    /* ⚠⚠ LES DEUX CHEMINS, AFFICHÉS. Le 2026-09-06, cet écran annonçait « jeton
       enregistre » pendant que la zone de notification annoncait « jeton
       absent » : les deux disaient vrai, ils ne regardaient pas le meme fichier,
       et RIEN a l ecran ne permettait de s en apercevoir. Un desaccord entre
       deux processus doit se VOIR, sinon il se paie en cycles d installation. */
    var d = $('diag');
    var ici = e.jetonChemin || '(inconnu)';
    var la = e.veilleurJetonChemin || '';
    if (!la) {
      d.className = 'diag';
      d.textContent = 'Jeton lu ici : ' + ici;
    } else if (la === ici) {
      d.className = 'diag';
      d.textContent = 'Jeton : ' + ici + ' — le veilleur lit le meme fichier'
        + (e.veilleurJetonVu ? ' et l y trouve.' : ' mais ne l y trouve PAS.');
    } else {
      d.className = 'diag mal';
      d.textContent = 'DESACCORD : cette application lit ' + ici
        + ' — le veilleur, lui, lit ' + la + '. Cliquez sur Demarrer / reinstaller.';
    }
    $('b-arreter').disabled = !e.enMarche;
  };

  var heure = function(iso){
    try { return new Date(iso).toLocaleTimeString('fr-CA', {hour:'2-digit', minute:'2-digit'}); }
    catch (e) { return iso; }
  };

  /* Un seul chemin pour toutes les operations : on desactive, on attend le
     VERDICT, on redessine avec ce que le principal a REELLEMENT constate.
     ⚠ Jamais dessiner ce qu on vient de demander : c est ainsi qu une case
     reste cochee alors que rien n a ete ecrit (le defaut de << Demarrer avec
     Windows >>, deja paye une fois). */
  var faire = function(promesse, enCours, reussi){
    if (!V) return;
    dire(enCours, 'att');
    var b = document.querySelectorAll('.carte button, .carte input');
    for (var i = 0; i < b.length; i++) b[i].disabled = true;
    promesse.then(function(r){
      dessiner(r);
      if (r && r.ok) dire(typeof reussi === 'function' ? reussi(r) : reussi, 'bon');
      else dire(motif(r), 'err');
    }).catch(function(){
      dire('L operation n a pas abouti.', 'err');
      relire();
    });
  };

  var MOTIFS = {
    sans_cle: 'Cette version de l application n a pas de cle (defaut de construction).',
    refus: 'Le serveur a refuse cette version de l application.',
    ecriture: 'L enregistrement a echoue.',
    indisponible: 'L application n a pas repondu.'
  };
  var motif = function(r){
    var m = r && r.motif;
    if (m && MOTIFS[m]) return MOTIFS[m];
    if (r && r.detail) return 'Windows a refuse : ' + r.detail;
    return 'L operation n a pas abouti.';
  };

  var relire = function(){
    if (!V) return;
    V.etat().then(function(r){ dessiner(r); }).catch(function(){
      dire('Impossible de lire l etat du veilleur.', 'err');
    });
  };

  $('b-relire').onclick = relire;
  $('b-fermer').onclick = function(){ if (P && P.fermer) P.fermer(); else window.close(); };

  $('b-relancer').onclick = function(){
    faire(V.relancer(), 'Demarrage du veilleur…', function(r){
      /* ⚠ ON NE DIT PAS << c est fait >> QUAND SEULE UNE MOITIE A MARCHE. Le
         processus peut tourner alors que l entree de demarrage n a pas ete
         posee : au prochain redemarrage il ne reviendrait pas, et personne ne
         l apprendrait avant d avoir manque une commande. */
      if (r.demarrageDetail) return 'Le veilleur tourne, mais le demarrage automatique n a pas ete pose : ' + r.demarrageDetail;
      return 'Le veilleur tourne. Son icone est a cote de l horloge.';
    });
  };

  $('b-arreter').onclick = function(){
    faire(V.arreter(), 'Arret du veilleur…',
      'Le veilleur est arrete, et il ne redemarrera pas avec Windows.');
  };

  $('b-pause').onclick = function(){
    var vers = !(etat && etat.actif);
    faire(V.activer(vers), vers ? 'Reprise…' : 'Mise en pause…',
      vers ? 'Le veilleur signale de nouveau les commandes et les retours.'
           : 'Le veilleur reste en place mais ne signale plus rien.');
  };

  $('c-avecapp').onchange = function(){
    faire(V.avecApp($('c-avecapp').checked), 'Enregistrement…',
      function(r){ return r.avecApp !== false
        ? 'Le veilleur partira avec cette application.'
        : 'Le veilleur ne partira plus avec cette application.'; });
  };

  $('c-demarrage').onchange = function(){
    faire(V.demarrageAuto($('c-demarrage').checked), 'Enregistrement…',
      function(r){ return r.demarrageAuto
        ? 'Le veilleur demarrera avec Windows.'
        : 'Le veilleur ne demarrera plus avec Windows.'; });
  };

  relire();
  /* Le processus veille de son cote : cet ecran se rafraichit tout seul pour que
     << il tourne >> ne reste pas affiche apres un arret venu d ailleurs (clic
     << Quitter le veilleur >> dans son propre menu, par exemple). */
  setInterval(relire, 15000);
})();
</script></body></html>`;
}

module.exports = { pageVeilleurConfig };
