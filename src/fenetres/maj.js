'use strict';

/*
 * L'INSTALLATION DES MISES À JOUR — EN NATIF
 * =============================================================================
 * Sa demande du 2026-09-10 : « installation des mises à jour aussi doit être en
 * natif ».
 *
 * Deux écrans, et un seul mécanisme derrière :
 *   · PROPOSITION — la version est prête. Installer maintenant, ou plus tard
 *     (2 h / 4 h / 8 h, les trois valeurs qu'il a demandées).
 *   · DÉCOMPTE — les trente secondes avant le redémarrage forcé, « pour donner
 *     le temps de finaliser ses documents ».
 *
 * ⚠⚠ POURQUOI CETTE FENÊTRE EST PLUS SÛRE QUE LE TOAST QU'ELLE REMPLACE, et pas
 * seulement plus jolie. Le toast vivait dans la PAGE : la coquille l'affichait en
 * injectant Admin._majPrete(...) dans la fenêtre principale. Trois façons de ne
 * rien montrer — la page pas encore chargée, la page plus ancienne que la coquille
 * (Admin._majPrete inexistant), la page plantée — et dans les trois cas la
 * coquille se rabattait sur « installer tout de suite, sans rien demander ». Une
 * fenêtre native n'a besoin de RIEN d'autre que la coquille : elle s'affiche même
 * si le site ne répond plus.
 *
 * ⚠⚠ ELLE NE DÉCIDE RIEN, ET ICI C'EST VITAL. Le décompte est DESSINÉ ici, mais
 * l'échéance appartient au processus principal, qui lance quitAndInstall à
 * trente secondes quoi qu'il arrive. Si cette fenêtre ne s'ouvre pas, plante, ou
 * est fermée d'un clic, le redémarrage part quand même — sinon un report se
 * transformerait en mise à jour jamais installée. Elle AFFICHE le temps qui
 * reste ; elle ne l'accorde pas.
 *
 * ⚠ LE DÉCOMPTE EST TOUJOURS AU-DESSUS, la proposition NON. Même raisonnement que
 * inactivite.js : un avertissement dont la visibilité dépend de l'endroit où se
 * trouve une autre fenêtre n'est pas un avertissement. Mais une PROPOSITION qui
 * se clouerait par-dessus le travail serait exactement la boîte modale retirée le
 * 2026-09-09 — « elle interrompait le travail pour une mise à jour qui peut
 * attendre ».
 *
 * ⚠ LES TROIS VALEURS D'HEURES VIENNENT DU PRINCIPAL, pas d'ici. Il les filtre à
 * la réception (MAJ_HEURES.indexOf(h) < 0) : une fenêtre est un document, elle
 * peut envoyer n'importe quoi, et « 9999 » écrirait une échéance dans onze ans.
 * Les recopier ici en aurait fait deux listes à tenir d'accord.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.6rem .95rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#1b2233,#0e1522)}
.tete h1{margin:0;font:700 .95rem/1.3 inherit;color:var(--tx)}
/* La teinte de l entete change avec l ecran : bleu pour une proposition,
   rouge pour un decompte. C est la seule difference de couleur, et elle est
   voulue - le second alarme, le premier informe. */
body.presse .tete{background:linear-gradient(180deg,#2a1418,#0e1522)}
body.presse .tete h1{color:var(--tx-err2)}
.corps{flex:1 1 auto;min-height:0;overflow-y:auto;padding:1rem .95rem}
.pied{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;
  padding:.6rem .95rem;border-top:1px solid var(--v08);background:var(--f-pied)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.45rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:focus{outline:none;border-color:#c9a97e}
button:disabled{opacity:.55;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
.ecart{flex:1 1 auto}
.msg{font-size:.75rem;color:var(--tx2);flex:1 1 100%;min-width:0;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
/* La version, en gros : c est l information qu on cherche du regard. */
.ver{display:flex;align-items:center;gap:.85rem;margin-bottom:.85rem}
.ver .pill{flex:0 0 auto;padding:.35rem .7rem;border-radius:99px;
  background:var(--v08);border:1px solid var(--v18);font:700 1.05rem/1.2 inherit;
  color:var(--tx-or2)}
html.jour .ver .pill{color:#655a41}
.ver .txt{min-width:0}
.ver .txt b{display:block;font-size:.9rem;color:var(--tx)}
.ver .txt span{font-size:.78rem;color:var(--tx2)}
p{margin:0 0 .6rem;font-size:.83rem;line-height:1.55;color:var(--tx-bleute)}
p.fine{font-size:.76rem;color:var(--tx2)}
/* Les trois reports : trois boutons, jamais une liste deroulante. Un report
   se choisit d un clic ou ne se choisit pas. */
.heures{display:flex;gap:.5rem;margin:.2rem 0 0}
.heures button{flex:1 1 0;justify-content:center;text-align:center}
.bloc{background:var(--v03);border:1px solid var(--v08);border-radius:10px;
  padding:.8rem .85rem;margin:.85rem 0 0}
.bloc .t{font:700 .72rem/1.3 inherit;text-transform:uppercase;letter-spacing:.08em;
  color:var(--tx2);margin-bottom:.45rem}
/* L anneau du decompte, comme celui de l inactivite : la meme information
   doit se lire de la meme facon. */
.anneau{flex:0 0 auto;width:84px;height:84px;border-radius:50%;display:flex;
  align-items:center;justify-content:center;font:800 1.7rem/1 system-ui;
  color:var(--tx-blanc);background:conic-gradient(#ef4444 100%,var(--v10) 0)}
.ligne{display:flex;align-items:center;gap:1rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * @param {string} arg  "proposition|<version>" ou "compte|<version>|<secondes>"
 *   ⚠ UN SEUL ARGUMENT, PARCE QUE C EST CE QUE LE REGISTRE DES FENÊTRES SAIT
 *   PASSER (fabrique(id)). Découpé ici plutôt que d'ajouter des paramètres que
 *   le registre ignorerait — et c'est aussi ce qui rend les cas d'épreuve
 *   possibles : un id suffit à choisir l'écran.
 */
function pageMaj(arg) {
  const bouts = String(arg || '').split('|');
  const ecran = bouts[0] === 'compte' ? 'compte' : 'proposition';
  const version = (bouts[1] || '').replace(/[^0-9a-zA-Z.\-]/g, '');
  const secondes = Math.max(5, Math.min(600, parseInt(bouts[2], 10) || 30));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Mise à jour</title>
<style>${CSS}${CSS_JOUR}</style></head><body class="${ecran === 'compte' ? 'presse' : ''}">
<div class="tete"><h1 id="titre"></h1></div>
<div class="corps" id="corps"></div>
<div class="pied" id="pied"></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_DIRE}
  var ECRAN = '${ecran}';
  var VERSION = '${version}';
  var TOTAL = ${secondes};
  var HEURES = [2, 4, 8];
  var depart = Date.now();
  var tic = null;

  function el(id){ return document.getElementById(id); }
  function esc(v){
    return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ⚠ UN APPEL QUI N EST PAS UNE PROMESSE N EST PAS UN APPEL. Si le canal
     manque (coquille plus ancienne que cette fenetre), on le dit au lieu de
     laisser un bouton inerte. */
  function decider(heures){
    var pr;
    try { pr = P.majDecision(heures); } catch (e) { pr = null; }
    if (!pr || typeof pr.then !== 'function') {
      return Promise.resolve({ ok: false, motif: 'indisponible',
        message: 'Ce poste ne sait pas planifier une mise a jour.' });
    }
    return pr.then(function(r){ return r || { ok: false, motif: 'vide' }; })
      .catch(function(e){ return { ok: false, motif: 'echec',
        message: String((e && e.message) || e) }; });
  }

  /* ══ L ECRAN DE PROPOSITION ══════════════════════════════════════════════
     ⚠ << PLUS TARD >> NE FERME PAS LA FENETRE : il ouvre le choix des heures,
     dans le meme ecran. C etait le defaut du premier mecanisme, retire le
     2026-09-09 : son << Plus tard >> ne menait a rien, aucune suite, aucune
     echeance. On demande MAINTENANT quand. */
  function dessinerProposition(){
    el('titre').textContent = 'Mise à jour disponible';
    el('corps').innerHTML =
      '<div class="ver"><span class="pill">' + esc(VERSION || '?') + '</span>'
      + '<div class="txt"><b>Cette version est téléchargée et prête.</b>'
      + '<span>L’installation redémarre l’application.</span></div></div>'
      + '<p>Vous pouvez l’installer tout de suite, ou choisir un moment plus '
      + 'tard dans la journée. Votre travail en cours n’est pas touché tant que '
      + 'vous n’avez pas décidé.</p>'
      + '<div class="bloc" id="zone-heures" hidden>'
      + '<div class="t">Installer dans</div>'
      + '<div class="heures">'
      + '<button data-h="2">2 heures</button>'
      + '<button data-h="4">4 heures</button>'
      + '<button data-h="8">8 heures</button>'
      + '</div>'
      + '<p class="fine" style="margin:.6rem 0 0">À l’heure choisie, un compte à '
      + 'rebours de 30 secondes s’affichera avant le redémarrage — le temps '
      + 'd’enregistrer ce qui est ouvert.</p>'
      + '</div>';
    el('pied').innerHTML =
      '<button id="b-tard">Plus tard…</button>'
      + '<span class="ecart"></span>'
      + '<button class="prim" id="b-maintenant">Installer maintenant</button>'
      + '<span class="msg" id="msg"></span>';
    brancherProposition();
  }

  function brancherProposition(){
    var t = el('b-tard');
    if (t) t.onclick = function(){
      var z = el('zone-heures');
      if (!z) return;
      /* ⚠ ON NE CACHE PAS AVEC style.display : la fenetre est chargee dans un
         document ou l attribut hidden porte une regle du socle, et basculer
         l attribut laisse le CSS decider. */
      z.hidden = false;
      t.disabled = true;
      var b = z.querySelector('button');
      if (b) b.focus();
      szDire('Choisissez dans combien de temps.');
    };
    var m = el('b-maintenant');
    if (m) m.onclick = function(){ envoyer(0, m); };
    var z2 = el('zone-heures');
    if (z2) {
      var bs = z2.querySelectorAll('button');
      for (var i = 0; i < bs.length; i++) {
        (function(b){
          b.onclick = function(){ envoyer(parseInt(b.getAttribute('data-h'), 10) || 0, b); };
        })(bs[i]);
      }
    }
    if (m) m.focus();
  }

  /* ⚠ TOUS LES BOUTONS SE FIGENT PENDANT L ENVOI, pas seulement celui qu on a
     clique : deux decisions envoyees coup sur coup ecriraient deux echeances,
     et la seconde ecraserait la premiere sans que personne le sache. */
  function envoyer(heures, bouton){
    var tous = document.querySelectorAll('button');
    for (var i = 0; i < tous.length; i++) tous[i].disabled = true;
    if (bouton) bouton.textContent = heures ? 'Planification…' : 'Installation…';
    szDire(heures ? 'Planification…' : 'Préparation de l’installation…');
    decider(heures).then(function(r){
      if (r && r.ok) {
        if (!heures) {
          /* L application va redemarrer : on n a rien d autre a dire, et
             surtout rien a reactiver. */
          szDire('L’application redémarre…', 'bon');
          return;
        }
        szDire('Planifié. La fenêtre se ferme.', 'bon');
        setTimeout(function(){ try { P.fermer(); } catch (e) {} }, 900);
        return;
      }
      for (var j = 0; j < tous.length; j++) tous[j].disabled = false;
      var t2 = el('b-tard'); if (t2) t2.disabled = true;   // le choix reste ouvert
      if (bouton) bouton.textContent = heures ? (heures + ' heures') : 'Installer maintenant';
      szDire((r && r.message) || ('Refusé (' + ((r && r.motif) || 'inconnu') + ').'), 'err');
    });
  }

  /* ══ L ECRAN DU DECOMPTE ═════════════════════════════════════════════════
     ⚠⚠ IL N Y A PAS DE BOUTON POUR ANNULER, ET C EST VOULU. Le redemarrage est
     FORCE : le processus principal lance l installation a l echeance, que cette
     fenetre existe ou non. Un bouton << Annuler >> qui ne peut rien annuler
     serait un mensonge de plus dans le pire moment.
     ⚠ << Redemarrer maintenant >> existe, lui, parce qu il fait vraiment
     quelque chose : il n attend pas les trente secondes. */
  function dessinerCompte(){
    el('titre').textContent = 'Redémarrage dans ' + TOTAL + ' secondes';
    el('corps').innerHTML =
      '<div class="ligne">'
      + '<div class="anneau" id="anneau"><span id="n">' + TOTAL + '</span></div>'
      + '<div class="txt">'
      + '<p style="margin:0 0 .3rem"><strong>La version ' + esc(VERSION || '?')
      + ' s’installe.</strong></p>'
      + '<p class="fine" style="margin:0">Enregistrez ce qui est ouvert. '
      + 'L’application va redémarrer d’elle-même.</p>'
      + '</div></div>';
    el('pied').innerHTML =
      '<span class="ecart"></span>'
      + '<button class="prim" id="b-vite">Redémarrer maintenant</button>'
      + '<span class="msg" id="msg"></span>';
    var v = el('b-vite');
    if (v) v.onclick = function(){
      v.disabled = true;
      szDire('Redémarrage…');
      decider(0);
    };
    demarrerTic();
  }

  function demarrerTic(){
    if (tic) clearInterval(tic);
    tic = setInterval(function(){
      var reste = Math.max(TOTAL * 1000 - (Date.now() - depart), 0);
      var s = Math.ceil(reste / 1000);
      var n = el('n');
      if (n) n.textContent = s;
      var t = el('titre');
      if (t) t.textContent = 'Redémarrage dans ' + s + ' seconde' + (s === 1 ? '' : 's');
      var a = el('anneau');
      var pct = Math.max(0, Math.min(100, (reste / (TOTAL * 1000)) * 100));
      if (a) a.style.background = 'conic-gradient(#ef4444 ' + pct + '%,var(--v10) 0)';
      /* ⚠ A ZERO ELLE S IMMOBILISE, elle ne ferme rien. C est le principal qui
         lance l installation ; si elle arrivait a zero avant lui, s arreter est
         la seule chose honnete a faire. */
      if (reste <= 0) { clearInterval(tic); tic = null; }
    }, 250);
  }

  window.addEventListener('beforeunload', function(){ if (tic) clearInterval(tic); });

  if (ECRAN === 'compte') dessinerCompte(); else dessinerProposition();
})();
</script></body></html>`;
}

module.exports = { pageMaj };
