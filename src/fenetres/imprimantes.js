'use strict';

/*
 * FENÊTRE « IMPRIMANTES » — NATIVE
 * =============================================================================
 * Écrite ici, dans l'application. Elle ne charge AUCUNE page du site, n'hérite
 * d'aucune de ses feuilles de style, et ne fait aucun appel web. Tout ce qu'elle
 * sait, elle le demande par le pont — qui interroge la fenêtre principale, seule
 * porteuse de la session.
 *
 * ⚠ POURQUOI ELLE EST RÉÉCRITE ET NON HABILLÉE.
 * La version précédente ouvrait `adm.sandriza.com` dans une fenêtre et masquait
 * le décor par-dessus. Résultat : la barre de menu et le rail d'icônes du site
 * revenaient au moindre défaut de masquage — et c'est arrivé. Une fenêtre qui
 * doit cacher ce qu'elle contient n'est pas une fenêtre d'application, c'est une
 * page web déguisée.
 *
 * ⚠ AUCUNE DONNÉE N'EST INVENTÉE ICI. Quand le pont ne répond pas, la fenêtre le
 * DIT. Elle ne montre jamais un état d'imprimante plausible faute de réponse :
 * on croirait l'imprimante prête alors que rien n'a été vérifié.
 */

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;
  font:14px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.75rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.1rem}
.tete h1{margin:0;font:700 1.02rem/1.2 Georgia,serif;letter-spacing:.01em}
.tete .sous{margin-left:auto;font-size:.74rem;color:#8fa1b8}
.corps{flex:1 1 auto;overflow-y:auto;padding:1.1rem}
.corps::-webkit-scrollbar{width:9px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.13);border-radius:9px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.95rem 1.05rem;margin-bottom:.85rem}
.carte h2{margin:0 0 .55rem;font-size:.76rem;text-transform:uppercase;
  letter-spacing:.09em;color:#8fa1b8;font-weight:700}
.lg{display:flex;gap:.9rem;align-items:baseline;padding:.34rem 0;
  border-top:1px solid rgba(255,255,255,.055)}
.lg:first-of-type{border-top:0}
.lg .k{flex:0 0 10.5rem;font-size:.75rem;color:#8fa1b8}
.lg .v{flex:1 1 auto;min-width:0;word-break:break-word}
.pastille{display:inline-block;padding:.04rem .5rem;border-radius:99px;
  font-size:.7rem;font-weight:600;border:1px solid currentColor}
.ok{color:#4ade80}.att{color:#fbbf24}.non{color:#f87171}.gris{color:#8fa1b8}
.svc{display:flex;align-items:center;gap:.9rem;padding:.7rem 0;
  border-top:1px solid rgba(255,255,255,.055)}
.svc:first-of-type{border-top:0}
.svc .d{flex:1 1 auto;min-width:0}
.svc .n{font-weight:600;font-size:.95rem}
.svc .m{font-size:.78rem;color:#8fa1b8;margin-top:.12rem}
/* La liste deroulante EST le controle : elle prend la largeur, comme un champ de
   formulaire, et non la taille d un bouton perdu au bout de la ligne. */
.svc .d select{width:100%;max-width:34rem;margin-top:.35rem;font:inherit;
  color:#e8edf5;background:#0f1826;border:1px solid rgba(255,255,255,.16);
  border-radius:8px;padding:.4rem .55rem}
.svc .d select:focus{outline:none;border-color:#c9a97e}
.svc .d select:disabled{opacity:.5}
.svc .a{flex:0 0 auto;display:flex;gap:.4rem;align-self:flex-end}
button{font:inherit;cursor:pointer;border-radius:8px;padding:.36rem .8rem;
  border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);
  color:#e8edf5;transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
button.prim:hover:not(:disabled){background:#d8bd97;border-color:#d8bd97}
.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.65rem 1.1rem;border-top:1px solid rgba(255,255,255,.08);
  background:#0b1220}
.msg{font-size:.8rem;color:#8fa1b8;min-height:1.2em}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}
.vide{padding:2.2rem 1rem;text-align:center;color:#8fa1b8}
.vide .gros{font-size:1.02rem;color:#e8edf5;margin-bottom:.4rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Imprimantes ». */
function pageImprimantes() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Imprimantes — Administration Sandriza</title>
<style>${CSS}</style></head><body>
<div class="tete"><span class="ic">🖨</span><h1>Imprimantes</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Lecture de l’état…</div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span><button id="btn-relire">Actualiser</button>
  <button id="btn-fermer">Fermer</button></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
  var corps = document.getElementById('corps');
  var msg   = document.getElementById('msg');
  var sous  = document.getElementById('sous');

  function dire(t, genre){ msg.textContent = t || ''; msg.className = 'msg' + (genre ? ' ' + genre : ''); }

  /* ══ DIAGNOSTIC AFFICHE DANS LA FENETRE ════════════════════════════════════
     ⚠ POURQUOI IL EST LA. Cette fenetre est restee bloquee sur
     << Lecture de l etat… >> a travers QUATRE versions. Les outils de
     developpement ne s ouvrent pas dans une fenetre native, donc l erreur — s il
     y en avait une — n etait visible de personne : ni de l usager, ni de moi. J ai
     publie trois correctifs sur des hypotheses, dont deux fausses.
     Une fenetre qui ne peut pas dire ce qui lui arrive est une fenetre qu on ne
     peut pas reparer. Celle-ci le dit maintenant, a l ecran, sans outil.
     Le journal reste DISCRET quand tout va bien : il n apparait que si l ecran
     n a rien affiche au bout de trois secondes, ou si une erreur survient. */
  var JOURNAL = [];
  var rendu = false;
  function noter(t){
    JOURNAL.push(new Date().toLocaleTimeString('fr-CA') + ' — ' + t);
    var z = document.getElementById('diag');
    if (z) z.textContent = JOURNAL.join('\n');
  }
  function montrerJournal(titre){
    corps.innerHTML = '<div class="vide"><div class="gros">' + esc(titre) + '</div>'
      + '<div style="font-size:.82rem;margin-bottom:.6rem">Ce que la fenêtre a pu faire, étape par étape :</div>'
      + '<pre id="diag" style="text-align:left;white-space:pre-wrap;font:12px/1.5 ui-monospace,Consolas,monospace;'
      + 'background:#0b1220;border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:.7rem .8rem;'
      + 'max-width:52rem;color:#cbd8e6">' + esc(JOURNAL.join('\n')) + '</pre></div>';
  }
  // ⚠ UNE ERREUR NON RATTRAPEE NE DOIT PLUS ETRE INVISIBLE. Sans ces deux
  // ecouteurs, un defaut de script laissait la fenetre sur son message initial —
  // exactement ce qu on a vu pendant quatre versions.
  window.onerror = function(m, src, l, c){
    noter('ERREUR : ' + m + ' (ligne ' + l + ')');
    montrerJournal('Une erreur a interrompu la fenêtre');
    return true;
  };
  window.addEventListener('unhandledrejection', function(ev){
    noter('PROMESSE REJETEE : ' + ((ev.reason && ev.reason.message) || ev.reason));
    montrerJournal('Une opération a échoué');
  });
  noter('page chargée');
  noter('pont : ' + (P ? 'présent' : 'ABSENT') + (P && P.appeler ? ', appeler présent' : ', appeler ABSENT'));
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

  // ⚠ CE QUE CETTE FENETRE FAIT QUAND ELLE NE SAIT PAS : elle le dit.
  // Un ecran d imprimantes qui affiche « pret » faute de reponse est pire
  // qu un ecran vide — on lance une impression en croyant que c est verifie.
  var MOTIFS = {
    session:        'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:          'Votre rôle ne donne pas accès à la configuration des imprimantes.',
    agent_absent:   'L’agent d’impression n’est pas joignable sur ce poste.',
    indisponible:   'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible: 'La fenêtre principale ne répond pas.',
    // ⚠ Cette fenêtre a sa PROPRE table de motifs (elle n'utilise pas le socle) :
    // un motif ajouté au socle doit aussi l'être ici, sinon il s'affiche comme
    // « Erreur inattendue » — c'est-à-dire comme rien.
    delai:          'La fenêtre principale n’a pas répondu à temps. « Actualiser » pour réessayer ; si cela persiste, rechargez la fenêtre principale (Ctrl+R).',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    echec:          'L’opération a échoué.'
  };
  function expliquer(m){ return MOTIFS[m] || 'Erreur inattendue (' + esc(m || '?') + ').'; }

  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><div class="gros">' + esc(titre) + '</div>'
      + '<div>' + esc(detail || '') + '</div></div>';
  }

  function fmtFormat(l, h){
    if (!l || !h) return 'format non défini';
    return 'format ' + l + ' × ' + h + ' po';
  }

  function dessiner(e){
    var dispo = e.disponible;
    var etatPastille = dispo
      ? '<span class="pastille ok">détecté</span>'
      : '<span class="pastille non">absent</span>';
    var aJour = !e.versionDisponible || e.version === e.versionDisponible;
    var h = [];

    h.push('<div class="carte"><h2>Agent d’impression de ce poste</h2>');
    h.push('<div class="lg"><div class="k">État</div><div class="v">' + etatPastille + '</div></div>');
    if (dispo) {
      h.push('<div class="lg"><div class="k">Ordinateur</div><div class="v">' + (esc(e.poste) || '—') + '</div></div>');
      h.push('<div class="lg"><div class="k">Version installée</div><div class="v">' + (esc(e.version) || '—')
        + (aJour ? ' <span class="pastille ok">à jour</span>'
                 : ' <span class="pastille att">' + esc(e.versionDisponible) + ' disponible</span>') + '</div></div>');
      h.push('<div class="lg"><div class="k">Aide PDF</div><div class="v">'
        + (e.aidePdf
            ? '<span class="pastille ok">' + (esc(e.aidePdfNom) || 'présente') + '</span>'
            : '<span class="pastille att">absente</span> <span style="color:#8fa1b8;font-size:.8rem">— requise pour les étiquettes d’expédition, qui arrivent en PDF du transporteur.</span>')
        + '</div></div>');
    }
    h.push('</div>');

    h.push('<div class="carte"><h2>Association par service</h2>');
    if (!e.services || !e.services.length) {
      h.push('<div class="lg"><div class="v" style="color:#8fa1b8">Aucun service à associer.</div></div>');
    } else {
      // ⚠ UNE LISTE DEROULANTE, PLUS UN BOUTON QUI OUVRE UNE BOITE AILLEURS.
      // << Choisir… >> deleguait la selection a la fenetre PRINCIPALE : on quittait
      // cette fenetre pour choisir, et sur un second ecran la boite apparaissait
      // sur l autre moniteur — on la cherchait. Le choix se fait ici, sur place.
      // ⚠ LES IMPRIMANTES VIRTUELLES (PDF, fax, OneNote) SONT RANGEES A PART :
      // elles n impriment sur rien, et les proposer au meme rang qu une vraie
      // machine fait choisir << Microsoft Print to PDF >> pour des etiquettes.
      var opts = '';
      if (!IMPRS) {
        opts = '<option value="">Liste non chargée…</option>';
      } else {
        var reelles = IMPRS.filter(function(p){ return !p.virtuelle; });
        var virt    = IMPRS.filter(function(p){ return p.virtuelle; });
        var ligne = function(p, choisie){
          return '<option value="' + esc(p.nom) + '"' + (p.nom === choisie ? ' selected' : '') + '>'
            + esc(p.nom) + (p.defaut ? ' (par défaut)' : '') + '</option>';
        };
        opts = '<option value="">— aucune —</option>';
        // ⚠ Une imprimante ASSOCIEE mais ABSENTE de la liste doit rester visible,
        // sinon on croirait qu elle a ete effacee alors qu elle est seulement
        // eteinte ou debranchee — et l enregistrer a nouveau la remplacerait.
        var connue = IMPRS.some(function(p){ return p.nom === s.imprimante; });
        if (s.imprimante && !connue) {
          opts += '<option value="' + esc(s.imprimante) + '" selected>' + esc(s.imprimante) + ' (hors ligne)</option>';
        }
        opts += reelles.map(function(p){ return ligne(p, s.imprimante); }).join('');
        if (virt.length) {
          opts += '<optgroup label="Sorties virtuelles (n’impriment sur rien)">'
            + virt.map(function(p){ return ligne(p, s.imprimante); }).join('') + '</optgroup>';
        }
      }
      h.push('<div class="svc"><div class="d">'
        + '<div class="n">' + esc(s.titre) + '</div>'
        + '<div class="m">' + esc(fmtFormat(s.largeurPo, s.hauteurPo))
        + (s.imprimante ? '' : ' · <span class="att">aucune imprimante choisie</span>') + '</div>'
        + '<select data-svc="' + esc(s.cle) + '"' + (dispo && IMPRS ? '' : ' disabled') + '>' + opts + '</select>'
        + '</div><div class="a">'
        + '<button data-tester="' + esc(s.cle) + '"' + (dispo && s.imprimante ? '' : ' disabled') + '>Test d’impression</button>'
        + '</div></div>');
    }
    h.push('</div>');
    corps.innerHTML = h.join('');
    sous.textContent = dispo ? 'agent détecté' : 'agent absent';
  }

  // ⚠ LA LISTE DES IMPRIMANTES EST LUE UNE FOIS, PAS A CHAQUE REDESSIN.
  // Interroger l agent ouvre LE PILOTE DE CHAQUE IMPRIMANTE (c est ecrit dans
  // printagent.js) : le refaire a chaque changement bloquerait une thermique
  // Bluetooth en train de recevoir. null = pas encore lue, ce qui n est pas la
  // meme chose qu une liste vide — et la fenetre le dit.
  var IMPRS = null;

  // ⚠⚠ ON N ATTEND JAMAIS LA LISTE POUR AFFICHER L ECRAN. C etait ma regression :
  // je demandais la liste des imprimantes AVANT de dessiner, et la fenetre restait
  // sur << Lecture de l etat… >> indefiniment. Enumerer les imprimantes OUVRE LE
  // PILOTE DE CHACUNE — c est ecrit dans printagent.js — et une thermique Bluetooth
  // peut mettre tres longtemps a repondre, voire ne jamais repondre. L ancienne
  // version ne la demandait jamais au chargement, et c etait la bonne intuition.
  // L etat se lit donc SEUL et s affiche tout de suite ; la liste arrive apres, en
  // arriere-plan, et les menus se remplissent quand elle est la.
  var enCours = false;
  function relire(){
    if (enCours) { noter('relire ignoré : une lecture est déjà en cours'); return; }
    enCours = true;
    dire('Lecture…');
    noter('appel de imprimantes:etat…');
    // ⚠ ON JOURNALISE LES TROIS ISSUES : la reponse, le refus, et l exception
    // synchrone. C est la troisieme qui nous a echappe pendant quatre versions —
    // un « then » ne rattrape pas une erreur levee AVANT lui.
    var p;
    try { p = P.appeler('imprimantes:etat'); }
    catch (e) {
      enCours = false;
      noter('APPEL IMPOSSIBLE : ' + (e && e.message));
      montrerJournal('Le pont a refusé l’appel');
      return;
    }
    if (!p || typeof p.then !== 'function') {
      enCours = false;
      noter('le pont n’a pas rendu de promesse (type ' + typeof p + ')');
      montrerJournal('Réponse inattendue du pont');
      return;
    }
    p.then(function(r){
      enCours = false;
      noter('réponse reçue : ' + (r ? ('ok=' + r.ok + (r.motif ? ' motif=' + r.motif : '')) : 'vide'));
      if (!r || !r.ok) { sous.textContent = ''; vide('État indisponible', expliquer(r && r.motif)); dire(''); return; }
      rendu = true;
      DERNIER = r;
      dessiner(r);
      dire(IMPRS ? '' : 'Liste des imprimantes : lecture en cours…');
    }, function(e){
      enCours = false;
      noter('PROMESSE REJETEE : ' + (e && e.message));
      montrerJournal('L’appel au pont a échoué');
    });
  }

  // ⚠ LE GARDE QUI MANQUAIT A TOUS LES AUTRES. Si rien n est dessine au bout de
  // trois secondes, la fenetre montre son journal AU LIEU de rester sur son
  // message d attente. Trois secondes, parce que l usager a demande cinq au pire.
  setTimeout(function(){
    if (rendu) return;
    noter('rien n’est arrivé après 3 s — le pont ne répond pas');
    montrerJournal('La fenêtre n’a pas reçu de réponse');
  }, 3000);

  // Le dernier etat lu, pour redessiner quand la liste arrive sans redemander
  // l etat a l agent.
  var DERNIER = null;
  var listeEnCours = false;

  // ⚠ AVEC UN PLAFOND. Sans lui, une imprimante qui ne repond pas laisserait le
  // message << lecture en cours >> pour toujours — le defaut qu on vient de
  // corriger, deplace d un cran. Au-dela, on le DIT et on offre de reessayer.
  function chargerListe(){
    if (listeEnCours) return;
    listeEnCours = true;
    var fini = false;
    var minuterie = setTimeout(function(){
      if (fini) return;
      fini = true; listeEnCours = false;
      dire('Liste des imprimantes trop longue à lire — « Actualiser » pour réessayer.', 'att');
    }, 12000);
    P.appeler('imprimantes:liste').then(function(l){
      if (fini) return;
      fini = true; clearTimeout(minuterie); listeEnCours = false;
      if (!l || !l.ok) {
        // Un echec de liste n empeche PAS d utiliser l ecran : les associations
        // existantes restent visibles, et le test reste possible.
        dire('Liste des imprimantes indisponible : ' + expliquer(l && l.motif), 'att');
        return;
      }
      IMPRS = l.imprimantes || [];
      if (DERNIER) dessiner(DERNIER);
      dire('');
    });
  }

  // ⚠ DELEGATION plutot qu un ecouteur par bouton : le corps est REDESSINE a
  // chaque lecture, et des ecouteurs poses sur les anciens boutons seraient
  // perdus sans que rien ne le signale — les boutons cesseraient de repondre.
  corps.addEventListener('click', function(ev){
    var b = ev.target.closest('button'); if (!b || b.disabled) return;
    var t = b.getAttribute('data-tester');
    if (t) {
      dire('Envoi du test…');
      b.disabled = true;
      P.appeler('imprimantes:tester', t).then(function(r){
        b.disabled = false;
        if (!r || !r.ok) { dire(expliquer(r && r.motif), 'err'); return; }
        dire('Test envoyé à l’imprimante.', 'bon');
      });
    }
  });

  // ⚠ LE CHOIX S ENREGISTRE AU CHANGEMENT, et l on RELIT ensuite. C est l agent
  // qui fait foi : croire la reponse afficherait un format que l agent n a peut-
  // etre pas retenu. Le << change >> est delegue pour la meme raison que les
  // boutons — le corps est redessine a chaque lecture.
  corps.addEventListener('change', function(ev){
    var s = ev.target.closest('select[data-svc]'); if (!s || s.disabled) return;
    var cle = s.getAttribute('data-svc');
    var nom = s.value;
    s.disabled = true;
    dire(nom ? 'Association…' : 'Retrait de l’association…');
    P.appeler('imprimantes:definir', cle, nom).then(function(r){
      s.disabled = false;
      if (!r || !r.ok) { dire(expliquer(r && r.motif), 'err'); relire(); return; }
      relire();
      dire(nom ? 'Imprimante associée.' : 'Association retirée.', 'bon');
    });
  });

  // « Relire » recharge AUSSI la liste des imprimantes : c est le geste qu on fait
  // apres avoir branche une machine, et ne relire que l etat ne la ferait pas
  // apparaitre.
  // « Actualiser » relit l état ET retente la liste : c est le geste qu on fait
  // apres avoir branche une machine, ou quand la liste n a pas abouti.
  document.getElementById('btn-relire').onclick = function(){ IMPRS = null; relire(); chargerListe(); };
  document.getElementById('btn-fermer').onclick = function(){ P.fermer(); };
  relire();
  chargerListe();
})();
</script></body></html>`;
}

module.exports = { pageImprimantes };
