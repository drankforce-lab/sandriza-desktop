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

  var enCours = false;
  function relire(rechargerListe){
    if (enCours) return;
    enCours = true;
    dire('Lecture…');
    var suite = function(){
      P.appeler('imprimantes:etat').then(function(r){
        enCours = false;
        if (!r || !r.ok) { sous.textContent = ''; vide('État indisponible', expliquer(r && r.motif)); dire(''); return; }
        dessiner(r);
        dire('');
      });
    };
    if (IMPRS && !rechargerListe) { suite(); return; }
    P.appeler('imprimantes:liste').then(function(l){
      // Un echec de liste n empeche PAS de lire l etat : on montre les
      // associations existantes, avec la liste desactivee et le motif affiche.
      IMPRS = (l && l.ok) ? (l.imprimantes || []) : null;
      if (!IMPRS) dire('Liste des imprimantes indisponible : ' + expliquer(l && l.motif), 'att');
      suite();
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
  document.getElementById('btn-relire').onclick = function(){ relire(true); };
  document.getElementById('btn-fermer').onclick = function(){ P.fermer(); };
  relire();
})();
</script></body></html>`;
}

module.exports = { pageImprimantes };
