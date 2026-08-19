'use strict';

/*
 * FENÊTRE « CAMPAGNES ET CHAÎNES » — NATIVE (2.1.0, palier 4)
 * =============================================================================
 * Deux onglets : les CAMPAGNES (un envoi, toute la liste, une fois) et les
 * CHAÎNES (des séquences qui partent toutes seules, selon un déclencheur).
 *
 * ⚠⚠ CE SONT DE VRAIS COURRIELS VERS DE VRAIES PERSONNES, et ils ne se
 * rattrapent pas. Les deux gestes qui envoient — « Envoyer » et « Traiter les
 * étapes échues » — sont armés en deux clics, annoncent d'avance combien de
 * personnes sont concernées, et rendent le verdict RÉEL (partis / échoués).
 *
 * ⚠ TROIS PIÈGES ANNONCÉS DANS LA FENÊTRE, parce qu'ils se paient en courriels :
 *   ① suspendre une chaîne n'arrête pas seulement ses envois — au traitement
 *      suivant, ses inscriptions en cours sont abandonnées pour de bon ;
 *   ② si « Séquences automatisées » est en pause dans les contrôles d'envoi,
 *      traiter ne ferait que brûler les inscriptions : c'est refusé, et dit ;
 *   ③ « en attente » n'est pas « échu » : seules les étapes dont le délai est
 *      écoulé partiront.
 *
 * ⚠ PÉRIMÈTRE PARTIEL, ET LA FENÊTRE LE DIT : la RÉDACTION du contenu (éditeur
 * visuel par blocs), la configuration Resend et l'offre de bienvenue restent à
 * l'écran Infolettre de la fenêtre principale.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:#8fa1b8}
input,button,textarea,select{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
button{cursor:pointer}
input:focus,button:focus,select:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
button.arme{border-color:#fbbf24;background:rgba(251,191,36,.16);color:#fde68a}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:#4ade80}.tuile .val.neutre{color:#8fa1b8}
.tuile .val.att{color:#fbbf24}.tuile .val.mal{color:#f87171}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte + .carte{margin-top:.5rem}
.chaine .entete{display:flex;align-items:flex-start;gap:.6rem;flex-wrap:wrap}
.chaine .entete h3{margin:0;font:700 .9rem/1.3 Georgia,serif}
.chaine .entete .gestes{margin-left:auto;display:flex;gap:.4rem;flex-wrap:wrap}
.chaine .desc{font-size:.76rem;color:#8fa1b8;margin-top:.1rem}
.chaine .compte{font-size:.74rem;color:#8fa1b8;margin:.45rem 0 .35rem}
.etapes{display:flex;flex-wrap:wrap;gap:.35rem}
.etape{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
  border-radius:8px;padding:.28rem .5rem;font-size:.72rem;max-width:15rem}
.etape .no{color:#c9a97e;font-weight:700}
.etape .suj{color:#cbd5e1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
table{width:100%;border-collapse:collapse;font-size:.85rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.3rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody tr:hover td{background:rgba(255,255,255,.04)}
.fin{white-space:nowrap;text-align:right}
.num{text-align:right;white-space:nowrap}
.dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pill.att{background:rgba(251,191,36,.16);color:#fbbf24}
.pill.acc{background:rgba(201,169,126,.16);color:#dcc39b}
.avis{border-radius:9px;padding:.42rem .65rem;font-size:.78rem;line-height:1.55}
.avis.att{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.32);color:#fde68a}
.avis.mal{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.34);color:#fca5a5}
.note{font-size:.73rem;color:#8fa1b8;line-height:1.6;border-top:1px solid rgba(255,255,255,.07);
  padding-top:.5rem;margin-top:.2rem}
.vide{padding:1.4rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
/* ── Formulaires de creation / modification (campagne et chaine) ─────────── */
.form .rang{display:grid;grid-template-columns:1fr 1fr;gap:.55rem}
.form .champ{display:flex;flex-direction:column;gap:.18rem;margin-bottom:.55rem}
.form .champ .lbl{font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}
.form .champ .aide{font-size:.71rem;color:#8fa1b8;line-height:1.5}
.form input,.form select,.form textarea{width:100%}
.form textarea{resize:vertical;font-family:Consolas,"Courier New",monospace;font-size:.78rem;
  line-height:1.55;min-height:9rem}
.form textarea.sms{font-family:inherit;font-size:.83rem;min-height:4.5rem}
.form .duo{display:flex;gap:.4rem;align-items:center}
.form .duo input{width:5rem}
.form .duo span{font-size:.76rem;color:#8fa1b8}
.form .fin3{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.7rem;
  border-top:1px solid rgba(255,255,255,.08);padding-top:.6rem}
.form .fin3 .gauche{margin-right:auto}
/* ══ L EDITEUR PAR BLOCS (3.53.0) ══════════════════════════════════════════
   Il etait le DERNIER trou declare PARTIEL dans la couverture, donc le dernier
   obstacle au retrait du web. Une carte par bloc, dans l ordre du courriel : on
   deplace, on retire, on ajoute — et l on ne voit jamais une balise. */
.bqbar{display:flex;gap:.3rem;flex-wrap:wrap;margin:.35rem 0 .5rem}
.bqbar button{font-size:.72rem;padding:.2rem .45rem;border-radius:7px}
.bloc{border:1px solid rgba(255,255,255,.12);border-radius:9px;background:rgba(255,255,255,.03);
  padding:.5rem .6rem;margin-bottom:.4rem}
.bloc .bt{display:flex;align-items:center;gap:.4rem;margin-bottom:.35rem}
.bloc .bt .bi{font-size:.82rem;opacity:.85;width:1.3rem;text-align:center}
.bloc .bt b{font:700 .78rem/1.2 system-ui;flex:1 1 auto;min-width:0}
.bloc .bt button{font-size:.7rem;padding:.1rem .35rem;border-radius:6px}
.bloc .bg{display:grid;grid-template-columns:1fr;gap:.3rem}
.bloc .bg .duo2{display:grid;grid-template-columns:1fr 1fr;gap:.3rem}
.bloc label{font-size:.7rem;color:#8fa1b8;display:block;margin-bottom:.1rem}
.bloc input,.bloc select,.bloc textarea{width:100%;font-size:.8rem;padding:.24rem .4rem}
.bloc textarea{min-height:3.4rem;font-family:inherit}
.bloc input[type=color]{padding:.1rem;height:1.7rem}
.bvide{padding:1rem;text-align:center;color:#8fa1b8;font-size:.8rem;
  border:1.5px dashed rgba(255,255,255,.16);border-radius:9px}
.apercu{border:1px solid rgba(255,255,255,.14);border-radius:9px;overflow:hidden;
  margin-top:.4rem;background:#fff}
.apercu .chrome{background:#0f1826;color:#8fa1b8;font-size:.7rem;padding:.24rem .55rem;
  border-bottom:1px solid rgba(255,255,255,.12)}
.apercu iframe{display:block;width:100%;height:20rem;border:none;background:#fff}
.etapef{border:1px solid rgba(255,255,255,.12);border-radius:9px;padding:.55rem .65rem;
  margin-bottom:.5rem;background:rgba(255,255,255,.025)}
.etapef .tete2{display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem}
.etapef .tete2 strong{font-size:.8rem}
.etapef .tete2 .gestes{margin-left:auto;display:flex;gap:.3rem}
.vars{font-size:.71rem;color:#8fa1b8;line-height:1.7;margin-top:.25rem}
.vars code{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
  border-radius:4px;padding:.02rem .28rem;color:#dcc39b}
/* ── Criteres d un segment : une ligne = champ, operateur, valeur ────────── */
.critere{display:flex;gap:.4rem;align-items:center;margin-bottom:.4rem;flex-wrap:wrap}
.critere select,.critere input{width:auto;min-width:8rem}
.critere select:first-child{min-width:14rem}
.critere input[type=number]{min-width:6rem;width:6rem}
.critere .u{font-size:.76rem;color:#8fa1b8}
.critere button{margin-left:auto}
.portee{margin-top:.6rem;padding:.45rem .65rem;border-radius:9px;font-size:.82rem;
  background:rgba(201,169,126,.1);border:1px solid rgba(201,169,126,.3);color:#e8dcc6;
  display:flex;align-items:center;gap:.5rem}
.portee strong{font-size:.95rem;color:#f0e2c8}
.portee button{margin-left:auto}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Campagnes et chaînes ». */
function pageCampagnes(ongletDepart) {
  /* ⚠ IDENTIFIANTS D OUVERTURE << campagnes:neuve >> et << chaines:neuve >> :
     le banc ne clique pas. Sans eux, les DEUX ecrans qui ECRIVENT — les seuls
     ajouts de ce lot — seraient invisibles au controle. Angle mort de #32. */
  const brut = String(ongletDepart || '');
  const neuf = brut.indexOf(':neuve') > 0;
  const base = neuf ? brut.slice(0, brut.indexOf(':neuve')) : brut;
  const dep = (base === 'chaines') ? 'chaines'
            : (base === 'segments') ? 'segments' : 'campagnes';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Campagnes et chaînes — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">📣</span><h1>Campagnes et chaînes</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var ONGLET = ${JSON.stringify(dep)};   // campagnes | chaines
  var FORM_DEPART = ${neuf ? 'true' : 'false'};
  var DC = null;             // donnees des campagnes
  var DH = null;             // donnees des chaines
  var DS = null;             // donnees des segments
  var CRITERES = null;       // criteres en cours d edition (segment seulement)
  var Q = '';
  var ARME = '';             // un seul geste arme a la fois
  var OCCUPE = false;        // un envoi est en cours : on ne redessine pas
  // { type:'campagne'|'chaine', id:'' , d:{...} } — formulaire ouvert, ou null
  var FORM = null;

  /* ══ L EDITEUR PAR BLOCS (3.53.0) ══════════════════════════════════════════
     Sa demande : << porte l editeur en natif >>. C etait le dernier trou declare
     PARTIEL dans la couverture, donc le dernier obstacle au retrait du web.

     ⚠⚠ LA MISE EN PAGE DU COURRIEL N EST PAS ICI, ET NE DOIT JAMAIS Y ETRE.
     Cette fenetre edite des BLOCS — un titre, un texte, un bouton — et rien de
     plus. C est _b2hOne (newsletter.js, cote site) qui decide qu un titre pese
     28 px et qu un bouton a 14 px de fond. Recopier ces regles ici, ce serait
     ecrire la mise en page du courriel DEUX fois, dans DEUX depots : au premier
     ajustement de marge, l apercu cesserait de correspondre a ce que la cliente
     recoit, et personne ne le verrait avant l envoi. On envoie donc les blocs et
     l on recoit du HTML — la lecon du filigrane, appliquee.
     ⚠ LE CATALOGUE VIENT AUSSI DU SITE (nl:blocsCatalogue) : les valeurs de
     depart d un bloc neuf y sont deja ecrites. Les redeclarer ici ferait deux
     verites de plus. */
  var BMODE = 'visuel';   // visuel | html
  var BLOCS = [];         // [{type, ...champs}]
  var BTYPES = [];        // catalogue venu du site : [{cle,label,icone,defaut}]
  var BMODELES = {};      // jeux de blocs de depart, par modele — venus du site aussi

  function typeDe(cle){
    for (var i = 0; i < BTYPES.length; i++) { if (BTYPES[i].cle === cle) return BTYPES[i]; }
    return { cle: cle, label: cle, icone: '?', defaut: { type: cle } };
  }

  /* Les champs de chaque type. ⚠ ILS SONT DECRITS, PAS DESSINES UN PAR UN : une
     liste de champs par type tient dans dix lignes, alors que neuf rendus
     separes en feraient deux cents — et l on en oublierait un a chaque ajout. */
  var BCHAMPS = {
    heading:      [['text', 'Titre', 'texte'], ['size', 'Taille', 'choix:h1=Grand,h2=Moyen'],
                   ['align', 'Alignement', 'choix:left=Gauche,center=Centre,right=Droite'],
                   ['color', 'Couleur', 'couleur']],
    text:         [['content', 'Texte', 'long'],
                   ['align', 'Alignement', 'choix:left=Gauche,center=Centre,right=Droite']],
    button:       [['text', 'Libellé', 'texte'], ['url', 'Lien', 'texte'],
                   ['bgColor', 'Fond', 'couleur'], ['textColor', 'Texte', 'couleur'],
                   ['align', 'Alignement', 'choix:left=Gauche,center=Centre,right=Droite']],
    divider:      [],
    spacer:       [['height', 'Hauteur (px)', 'nombre']],
    codeBox:      [['label', 'Intitulé', 'texte'], ['code', 'Code', 'texte'],
                   ['note', 'Note', 'texte']],
    discountHero: [['subtitle', 'Sur-titre', 'texte'], ['percent', 'Pourcentage', 'texte'],
                   ['label2', 'Sous-titre', 'texte']],
    highlightBox: [['title', 'Titre', 'texte'], ['desc', 'Description', 'texte'],
                   ['code', 'Code (facultatif)', 'texte'], ['icon', 'Pictogramme', 'texte']],
    rawHtml:      [['content', 'HTML', 'long']]
  };

  function champBloc(i, cle, lib, genre, val){
    var id = 'b-' + i + '-' + cle;
    var v = (val === undefined || val === null) ? '' : String(val);
    if (genre === 'long') {
      return '<div><label for="' + id + '">' + esc(lib) + '</label>'
        + '<textarea id="' + id + '" data-bi="' + i + '" data-bc="' + cle + '">' + esc(v) + '</textarea></div>';
    }
    if (genre === 'couleur') {
      return '<div><label for="' + id + '">' + esc(lib) + '</label>'
        + '<input type="color" id="' + id + '" data-bi="' + i + '" data-bc="' + cle + '" value="'
        + esc(/^#[0-9a-f]{6}$/i.test(v) ? v : '#111111') + '"></div>';
    }
    if (genre === 'nombre') {
      return '<div><label for="' + id + '">' + esc(lib) + '</label>'
        + '<input type="number" min="4" max="200" id="' + id + '" data-bi="' + i + '" data-bc="' + cle
        + '" value="' + esc(v || '24') + '"></div>';
    }
    if (genre.indexOf('choix:') === 0) {
      var opts = genre.slice(6).split(',').map(function(o){
        var q = o.split('='), sel = (v === q[0]) ? ' selected' : '';
        return '<option value="' + esc(q[0]) + '"' + sel + '>' + esc(q[1]) + '</option>';
      }).join('');
      return '<div><label for="' + id + '">' + esc(lib) + '</label>'
        + '<select id="' + id + '" data-bi="' + i + '" data-bc="' + cle + '">' + opts + '</select></div>';
    }
    return '<div><label for="' + id + '">' + esc(lib) + '</label>'
      + '<input id="' + id + '" data-bi="' + i + '" data-bc="' + cle + '" value="' + esc(v) + '"></div>';
  }

  function blocsHtml(){
    var pal = '<div class="bqbar">' + BTYPES.map(function(t){
      return '<button class="mini" data-bajout="' + esc(t.cle) + '" title="Ajouter : '
        + esc(t.label) + '"><span class="ic">' + esc(t.icone) + '</span> ' + esc(t.label) + '</button>';
    }).join('') + '</div>';
    if (!BLOCS.length) {
      return pal + '<div class="bvide">Aucun bloc. Ajoutez-en un ci-dessus, ou chargez un modèle.</div>';
    }
    var cartes = BLOCS.map(function(b, i){
      var t = typeDe(b.type);
      var champs = (BCHAMPS[b.type] || []).map(function(c){
        return champBloc(i, c[0], c[1], c[2], b[c[0]]);
      }).join('');
      return '<div class="bloc">'
        + '<div class="bt"><span class="bi ic">' + esc(t.icone) + '</span><b>' + esc(t.label) + '</b>'
        + '<button class="mini" data-bhaut="' + i + '"' + (i === 0 ? ' disabled' : '')
        + ' title="Monter">\u2191</button>'
        + '<button class="mini" data-bbas="' + i + '"' + (i === BLOCS.length - 1 ? ' disabled' : '')
        + ' title="Descendre">\u2193</button>'
        + '<button class="mini" data-bsupp="' + i + '" title="Retirer ce bloc">\u2715</button></div>'
        + (champs ? '<div class="bg">' + champs + '</div>' : '')
        + '</div>';
    }).join('');
    return pal + cartes;
  }

  // Ne repeint QUE la zone des blocs : un redessin du formulaire perdrait le
  // sujet, le segment et le SMS deja saisis.
  function majBlocs(){
    var z = document.getElementById('f-blocs');
    if (!z) return;
    z.innerHTML = blocsHtml();
    brancherBlocs();
  }

  /* ⚠ ON DEMANDE LE HTML AU SITE, on ne le fabrique pas. */
  function blocsVersHtml(apres){
    appeler('nl:blocsHtml', [BLOCS]).then(function(r){
      apres((r && r.ok) ? (r.html || '') : '');
    });
  }

  function brancherBlocs(){
    var z = document.getElementById('f-blocs');
    if (!z) return;
    z.querySelectorAll('[data-bajout]').forEach(function(el){
      el.onclick = function(){
        var t = typeDe(el.getAttribute('data-bajout'));
        BLOCS.push(JSON.parse(JSON.stringify(t.defaut || { type: t.cle })));
        majBlocs();
      };
    });
    z.querySelectorAll('[data-bsupp]').forEach(function(el){
      el.onclick = function(){ BLOCS.splice(Number(el.getAttribute('data-bsupp')), 1); majBlocs(); };
    });
    var bouger = function(att, pas){
      z.querySelectorAll('[' + att + ']').forEach(function(el){
        el.onclick = function(){
          var i = Number(el.getAttribute(att)), j = i + pas;
          if (j < 0 || j >= BLOCS.length) return;
          var t = BLOCS[i]; BLOCS[i] = BLOCS[j]; BLOCS[j] = t;
          majBlocs();
        };
      });
    };
    bouger('data-bhaut', -1);
    bouger('data-bbas', 1);
    /* ⚠ UNE SAISIE NE REDESSINE JAMAIS : le curseur repartirait au debut a
       chaque lettre. On note la valeur dans le bloc, et c est tout. */
    z.querySelectorAll('[data-bi]').forEach(function(el){
      var i = Number(el.getAttribute('data-bi')), c = el.getAttribute('data-bc');
      var poser = function(){
        if (!BLOCS[i]) return;
        BLOCS[i][c] = (el.type === 'number') ? (Number(el.value) || 24) : el.value;
      };
      el.oninput = poser;
      el.onchange = poser;
    });
  }

  var ETAPES = null;         // etapes en cours d edition (chaine seulement)

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function pluriel(n, mot){ return n + ' ' + mot + (n > 1 ? 's' : ''); }

  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à l’infolettre.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps. L’envoi peut avoir continué : vérifiez le journal d’envoi avant de recommencer.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cet élément n’existe plus.',
    deja_envoyee:       'Cette campagne est déjà partie. Une campagne ne s’envoie pas deux fois.',
    resend_absent:      'Aucune clé Resend n’est configurée : rien ne peut partir. Écran Infolettre, onglet Configuration.',
    envois_suspendus:   'Les « Séquences automatisées » sont en pause dans les contrôles d’envoi. Traiter maintenant abandonnerait les inscriptions sans rien envoyer.',
    rien_en_attente:    'Aucune inscription en attente.',
    rien_echu:          'Des inscriptions attendent, mais aucune étape n’est échue : leur délai n’est pas écoulé.',
    refus:              'L’envoi a été refusé.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' ' + esc(String(r.detail).slice(0, 160));
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  function onglets(){
    return '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'campagnes' ? ' actif' : '') + '" data-onglet="campagnes">Campagnes</button>'
      + '<button class="mini' + (ONGLET === 'chaines' ? ' actif' : '') + '" data-onglet="chaines">Chaînes automatisées</button>'
      + '<button class="mini' + (ONGLET === 'segments' ? ' actif' : '') + '" data-onglet="segments">Segments</button>'
      // ⚠ LA RECHERCHE N EST PLUS ICI (demande du 2026-08-14 : << pas beau a
      // cote des onglets >>). Elle vit desormais dans la barre qui surplombe
      // la liste, la ou porte son effet.
      + '</div>';
  }

  /* ── LE RENVOI VERS LE RESTE DE L ECRAN ───────────────────────────────────
     Regle nee de << ou sont mes configurations ? >> : une fenetre qui ne
     couvre qu une partie d un ecran doit dire ou trouver le reste. */
  function renvoi(){
    /* ⚠ L EDITEUR PAR BLOCS EST ICI DEPUIS LA 3.53.0 : ce renvoi ne doit plus le
       nommer comme un manque, sinon il envoie chercher a l ecran web quelque
       chose qui est sous les yeux. */
    return '<div class="note">Créer et modifier se fait ici, corps du courriel compris — '
      + 'en <strong>blocs</strong> ou en <strong>HTML</strong>, au choix. La '
      + '<strong>configuration Resend</strong> et l’<strong>offre de bienvenue</strong> '
      + 'restent à l’écran Infolettre. Le détail des envois se lit dans la fenêtre '
      + '<strong>Journal d’envoi</strong>.</div>';
  }

  /* ══ FORMULAIRES — CREER / MODIFIER ═══════════════════════════════════════
     Le trou #4 : cette fenetre savait tout faire SAUF en creer une.
     ⚠ LE CORPS S EDITE EN BLOCS **OU** EN HTML depuis la 3.53.0 : l editeur
     visuel a ete porte ici, et la couverture est passee de PARTIEL a COMPLET.
     C etait le dernier trou declare, donc le dernier obstacle au retrait du web. */

  var VARS_CAMP = ['{{firstName}}', '{{shopUrl}}', '{{promoCode}}',
    '{{discountPercent}}', '{{expiryDate}}', '{{collectionName}}'];
  var VARS_CHAINE = ['{{firstName}}', '{{panier}}', '{{panierTotal}}', '{{panierNb}}',
    '{{premierProduit}}', '{{lienPanier}}', '{{lienBoutique}}'];

  function ligneVars(liste, note){
    return '<div class="vars">Variables : '
      + liste.map(function(v){ return '<code>' + esc(v) + '</code>'; }).join(' ')
      + (note ? '<br>' + note : '') + '</div>';
  }

  function choixModeles(id, modeles){
    return '<select id="' + id + '"><option value="">Charger un modèle…</option>'
      + (modeles || []).map(function(m){
          return '<option value="' + esc(m.cle) + '">' + esc(m.nom) + '</option>'; }).join('')
      + '</select>';
  }

  function vueFormCampagne(){
    var f = FORM, d = f.d, c = d.campagne || {};
    var h = '<div class="carte form">'
      + '<h3 style="margin:0 0 .6rem;font:700 .92rem/1.3 Georgia,serif">'
      + (f.id ? 'Modifier la campagne' : 'Nouvelle campagne') + '</h3>'
      + '<div class="rang">'
      + '<div class="champ"><span class="lbl">Nom interne</span>'
      + '<input id="f-nom" value="' + esc(c.nom || '') + '" placeholder="Infolettre de septembre"></div>'
      // ⚠ CHAQUE SEGMENT MONTRE SA PORTEE : on choisit en voyant combien de
      // personnes il atteint MAINTENANT, pas en devinant. Un segment a 0 se
      // remarque avant l envoi, pas apres.
      + '<div class="champ"><span class="lbl">Segment</span><select id="f-seg">'
      + (d.segments || []).map(function(s){
          return '<option value="' + esc(s.cle) + '"' + ((c.segment || 'all') === s.cle ? ' selected' : '')
            + '>' + esc(s.nom) + ' (' + (s.compte || 0) + ')' + '</option>';
        }).join('') + '</select>'
      + '<span class="aide" id="f-seg-quoi"></span></div></div>'
      + '<div class="champ"><span class="lbl">Sujet du courriel</span>'
      + '<input id="f-suj" value="' + esc(c.sujet || '') + '" placeholder="Nos nouveautés sont arrivées !"></div>'
      + '<div class="rang">'
      + '<div class="champ"><span class="lbl">Canal d’envoi</span><select id="f-canal">'
      + (d.canaux || []).map(function(x){
          return '<option value="' + esc(x.cle) + '"' + ((c.canal || 'email') === x.cle ? ' selected' : '')
            + '>' + esc(x.nom) + '</option>'; }).join('') + '</select></div>'
      + '<div class="champ"><span class="lbl">Destinataires SMS</span>'
      + '<div class="aide" style="padding-top:.35rem">' + (d.smsDestinataires || 0)
      + ' client(s) ayant consenti, avec un téléphone.'
      + (d.smsPret ? '' : '<br><span style="color:#f87171">⚠ Téléphonie non configurée : l’envoi SMS échouera.</span>')
      + '</div></div></div>'
      + '<div class="champ" id="f-sms-bloc"><span class="lbl">Message texte (SMS)</span>'
      + '<textarea id="f-sms" class="sms" maxlength="480" placeholder="SANDRIZA : nos nouveautés sont arrivées !">'
      + esc(c.sms || '') + '</textarea>'
      + '<div class="aide"><span id="f-sms-n">0</span>/480 · Variable : <code>{{firstName}}</code>. '
      + 'Twilio gère STOP et AIDE automatiquement.</div></div>'
      + '<div class="champ"><span class="lbl">Corps du courriel</span>'
      + '<div class="duo" style="margin-bottom:.3rem">' + choixModeles('f-tpl', d.modeles)
      + '<button class="mini" id="f-charger">Charger</button>'
      + '<button class="mini" id="f-apercu">Aperçu</button></div>'
      /* ⚠ DEUX MODES, ET LE VISUEL EST LE DEFAUT. Le mode HTML reste : c est le
         seul moyen de coller un gabarit venu d ailleurs, et de relire ce qui
         part vraiment. Basculer vers HTML CONVERTIT les blocs ; revenir au
         visuel remet le HTML dans un bloc << HTML libre >>, sans rien perdre. */
      + '<div class="bqbar">'
      + '<button class="mini' + (BMODE === 'visuel' ? ' on' : '') + '" id="f-m-vis">Visuel</button>'
      + '<button class="mini' + (BMODE === 'html' ? ' on' : '') + '" id="f-m-htm">HTML</button>'
      + '</div>'
      + '<div id="f-blocs"' + (BMODE === 'visuel' ? '' : ' style="display:none"') + '>'
      + blocsHtml() + '</div>'
      + '<textarea id="f-html" spellcheck="false"'
      + (BMODE === 'visuel' ? ' style="display:none"' : '') + '>' + esc(c.html || '') + '</textarea>'
      + ligneVars(VARS_CAMP) + '</div>'
      + '<div class="apercu" id="f-apercu-bloc" style="display:none">'
      + '<div class="chrome">✉ Aperçu — marie@example.com</div>'
      + '<iframe id="f-frame" sandbox=""></iframe></div>'
      + '<div class="fin3"><span class="gauche aide">Enregistrée en <strong>brouillon</strong> : '
      + 'rien ne part tant que vous n’appuyez pas sur « Envoyer ».</span>'
      + '<button id="f-annuler">Annuler</button>'
      + '<button class="prim" id="f-ok">Enregistrer</button></div></div>';
    return h;
  }

  function vueFormChaine(){
    var f = FORM, d = f.d, ch = d.chaine || {};
    var h = '<div class="carte form">'
      + '<h3 style="margin:0 0 .6rem;font:700 .92rem/1.3 Georgia,serif">'
      + (f.id ? 'Modifier la chaîne' : 'Nouvelle chaîne') + '</h3>'
      + '<div class="rang">'
      + '<div class="champ"><span class="lbl">Nom</span>'
      + '<input id="f-nom" value="' + esc(ch.nom || '') + '" placeholder="Bienvenue en trois temps"></div>'
      + '<div class="champ"><span class="lbl">Déclencheur</span><select id="f-decl">'
      + (d.declencheurs || []).map(function(x){
          return '<option value="' + esc(x.cle) + '"'
            + ((ch.declencheur || 'subscribe') === x.cle ? ' selected' : '') + '>'
            + esc(x.nom) + '</option>'; }).join('') + '</select></div></div>'
      + '<div class="rang">'
      + '<div class="champ"><span class="lbl">Description</span>'
      + '<input id="f-desc" value="' + esc(ch.description || '') + '"></div>'
      + '<div class="champ"><span class="lbl">Statut</span><select id="f-statut">'
      + '<option value="active"' + (ch.statut !== 'paused' ? ' selected' : '') + '>Active</option>'
      + '<option value="paused"' + (ch.statut === 'paused' ? ' selected' : '') + '>Suspendue</option>'
      + '</select></div></div>'
      + '<div class="barreoutils" style="margin:.5rem 0 .4rem">'
      + '<strong style="font-size:.8rem">Étapes</strong>'
      + '<button class="mini" id="f-etape-plus">+ Ajouter une étape</button></div>'
      + '<div id="f-etapes">' + vueEtapes() + '</div>'
      + ligneVars(VARS_CHAINE, '⚠ Les variables de panier ne se remplissent que dans une chaîne '
          + 'dont le déclencheur est <strong>Panier abandonné</strong>. Ailleurs, elles ressortent vides.')
      + '<div class="apercu" id="f-apercu-bloc" style="display:none">'
      + '<div class="chrome">✉ Aperçu — marie@example.com</div>'
      + '<iframe id="f-frame" sandbox=""></iframe></div>'
      + '<div class="fin3"><button id="f-annuler">Annuler</button>'
      + '<button class="prim" id="f-ok">Enregistrer</button></div></div>';
    return h;
  }

  function vueEtapes(){
    var et = ETAPES || [];
    if (!et.length) {
      return '<div class="vide" style="padding:.9rem">Aucune étape : cette chaîne n’enverrait rien. '
        + 'Cliquez « + Ajouter une étape ».</div>';
    }
    var mods = (FORM && FORM.d && FORM.d.modeles) || [];
    return et.map(function(s, i){
      return '<div class="etapef"><div class="tete2"><strong>Étape ' + (i + 1) + '</strong>'
        + '<div class="gestes">'
        + (i > 0 ? '<button class="mini" data-mont="' + i + '" title="Monter">↑</button>' : '')
        + (i < et.length - 1 ? '<button class="mini" data-desc="' + i + '" title="Descendre">↓</button>' : '')
        + '<button class="mini danger" data-etsup="' + i + '">Retirer</button></div></div>'
        + '<div class="rang"><div class="champ"><span class="lbl">Délai depuis le déclenchement</span>'
        + '<div class="duo"><input type="number" min="0" id="e-j-' + i + '" value="' + (s.jours || 0)
        + '"><span>jours</span><input type="number" min="0" max="23" id="e-h-' + i + '" value="'
        + (s.heures || 0) + '"><span>heures</span></div></div>'
        + '<div class="champ"><span class="lbl">Sujet</span>'
        + '<input id="e-s-' + i + '" value="' + esc(s.sujet || '') + '"></div></div>'
        + '<div class="champ"><span class="lbl">Corps du courriel (HTML)</span>'
        + '<div class="duo" style="margin-bottom:.3rem">' + choixModeles('e-t-' + i, mods)
        + '<button class="mini" data-etcharger="' + i + '">Charger</button>'
        + '<button class="mini" data-etapercu="' + i + '">Aperçu</button></div>'
        + '<textarea id="e-b-' + i + '" spellcheck="false">' + esc(s.html || '') + '</textarea></div>'
        + '</div>';
    }).join('');
  }

  /* ⚠ LA SAISIE VIT DANS ETAPES, PAS DANS LE DOM : ajouter ou retirer une
     etape redessine la liste, et ce qui n aurait pas ete releve avant serait
     perdu. On releve donc AVANT chaque redessin. */
  function releverEtapes(){
    (ETAPES || []).forEach(function(s, i){
      var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
      s.sujet = g('e-s-' + i);
      s.html = g('e-b-' + i);
      s.jours = parseInt(g('e-j-' + i), 10) || 0;
      s.heures = parseInt(g('e-h-' + i), 10) || 0;
    });
  }

  function redessinerEtapes(){
    releverEtapes();
    var z = document.getElementById('f-etapes');
    if (z) z.innerHTML = vueEtapes();
  }

  /* Le catalogue des blocs, demande UNE fois. ⚠ S il n arrive pas, la palette
     reste vide et le mode HTML prend le relais : on ne bloque pas l ecran pour
     une liste de types — mais on le DIT, sinon on chercherait pourquoi aucun
     bouton n apparait. */
  function chargerBlocsCatalogue(){
    appeler('nl:blocsCatalogue', []).then(function(r){
      if (!r || !r.ok) {
        dire('Les types de blocs n’ont pas pu être lus — le mode HTML reste disponible.', 'att');
        return;
      }
      BTYPES = r.types || [];
      BMODELES = r.modeles || {};
      // La palette n existe qu une fois le formulaire ouvert : on la repeint si
      // elle est deja a l ecran.
      if (document.getElementById('f-blocs')) majBlocs();
    });
  }

  function ouvrirForm(type, id){
    // Le segment n a pas d op de formulaire dediee : ses champs, operateurs,
    // categories et segments automatiques viennent tous de segments:donnees,
    // qu on a deja pour dessiner la liste.
    var op = (type === 'chaine') ? 'chaines:form'
           : (type === 'segment') ? 'segments:donnees' : 'campagnes:form';
    appeler(op, [id || '']).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      if (!r.peutModifier) { dire('Vous êtes en consultation seulement.', 'err'); return; }
      FORM = { type: type, id: id || '', d: r };
      /* ⚠ LES BLOCS PARTENT DU HTML EXISTANT, dans un bloc << HTML libre >>.
         Une campagne deja ecrite n a pas de blocs : la deviner en la decoupant
         serait inventer une structure qu on n a pas, et le premier
         enregistrement REECRIRAIT son corps autrement. On la montre telle
         quelle, et qui veut des blocs les ajoute. */
      if (type === 'campagne') {
        var htm0 = String((r.campagne && r.campagne.html) || '');
        BLOCS = htm0 ? [{ type: 'rawHtml', content: htm0 }] : [];
        BMODE = htm0 ? 'html' : 'visuel';
      }
      ETAPES = (type === 'chaine')
        ? JSON.parse(JSON.stringify((r.chaine && r.chaine.etapes) || [])) : null;
      CRITERES = null;
      if (type === 'segment') {
        var s = (r.segments || []).filter(function(x){ return x.id === id; })[0];
        FORM.nom = s ? s.nom : '';
        CRITERES = s ? JSON.parse(JSON.stringify(s.criteres || [])) : [];
      }
      ARME = '';
      dessiner();
    });
  }

  function fermerForm(){ FORM = null; ETAPES = null; CRITERES = null; charger(); }

  function apercuDans(html){
    var bloc = document.getElementById('f-apercu-bloc');
    var cadre = document.getElementById('f-frame');
    if (!bloc || !cadre) return;
    dire('Construction de l’aperçu…');
    appeler('nl:apercu', [html]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      bloc.style.display = '';
      // ⚠ srcdoc avec un bac a sable VIDE : le courriel est du HTML etranger,
      // il ne doit ni executer de script ni atteindre cette fenetre.
      cadre.setAttribute('srcdoc', r.html);
      dire('');
      cadre.scrollIntoView({ block: 'nearest' });
    });
  }

  function soumettreForm(){
    var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    var b = document.getElementById('f-ok');
    if (FORM.type === 'campagne') {
      /* ⚠⚠ EN MODE VISUEL, LE CHAMP HTML EST VIDE — il est masque et personne ne
         l a rempli. Enregistrer g(f-html) tel quel ecrirait un corps VIDE sur
         une campagne pleine de blocs, et l on ne s en apercevrait qu a l envoi.
         On convertit donc d abord, puis on repasse par ici. */
      if (BMODE === 'visuel') {
        if (b) b.disabled = true;
        dire('Assemblage du courriel…');
        blocsVersHtml(function(htm){
          var ta = document.getElementById('f-html');
          if (ta) ta.value = htm;
          BMODE = 'html';              // on ne reconvertira pas deux fois
          if (b) b.disabled = false;
          soumettreForm();
        });
        return;
      }
      var data = { nom: g('f-nom').trim(), sujet: g('f-suj').trim(), segment: g('f-seg'),
        canal: g('f-canal'), sms: g('f-sms').trim(), html: g('f-html') };
      if (!data.nom) { dire('Le nom interne est requis.', 'err'); return; }
      if (!data.sujet) { dire('Le sujet est requis.', 'err'); return; }
      if ((data.canal === 'sms' || data.canal === 'both') && !data.sms) {
        dire('Le message texte est requis pour ce canal.', 'err'); return;
      }
      if (b) b.disabled = true;
      dire('Enregistrement…');
      appeler('campagnes:ecrire', [FORM.id, data]).then(function(r){
        if (b) b.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(esc(r.nom) + (r.cree ? ' créée' : ' mise à jour') + ' — en brouillon.', 'bon');
        fermerForm();
      });
      return;
    }
    releverEtapes();
    var dch = { nom: g('f-nom').trim(), description: g('f-desc').trim(),
      declencheur: g('f-decl'), statut: g('f-statut'), etapes: ETAPES || [] };
    if (!dch.nom) { dire('Le nom est requis.', 'err'); return; }
    if (!dch.etapes.length) { dire('Ajoutez au moins une étape.', 'err'); return; }
    if (dch.etapes.some(function(s){ return !String(s.sujet || '').trim(); })) {
      dire('Chaque étape doit avoir un sujet.', 'err'); return;
    }
    if (b) b.disabled = true;
    dire('Enregistrement…');
    appeler('chaines:ecrire', [FORM.id, dch]).then(function(r){
      if (b) b.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire(esc(r.nom) + (r.cree ? ' créée' : ' mise à jour') + ' — '
        + pluriel(r.etapes, 'étape') + '.', 'bon');
      fermerForm();
    });
  }

  function brancherForm(){
    var a = document.getElementById('f-annuler');
    if (a) a.onclick = fermerForm;
    var o = document.getElementById('f-ok');
    if (o) o.onclick = (FORM.type === 'segment') ? soumettreSegment : soumettreForm;

    if (FORM.type === 'segment') {
      var cp = document.getElementById('f-crit-plus');
      if (cp) cp.onclick = function(){
        releverCriteres();
        // Premier critere par defaut : le plus parlant et le plus courant.
        var d0 = (FORM.d.champs || [])[0] || { cle: 'totalDepense', ops: [{ cle: 'gte' }] };
        CRITERES.push({ champ: d0.cle, op: (d0.ops[0] || {}).cle, valeur: '' });
        redessinerCriteres();
      };
      var bc = document.getElementById('f-compter');
      if (bc) bc.onclick = compterPortee;
      return;
    }

    if (FORM.type === 'campagne') {
      var canal = document.getElementById('f-canal');
      var bloc = document.getElementById('f-sms-bloc');
      var majSms = function(){
        var v = canal ? canal.value : 'email';
        if (bloc) bloc.style.display = (v === 'sms' || v === 'both') ? '' : 'none';
      };
      if (canal) canal.onchange = majSms;
      majSms();
      // La recette du segment choisi, sous le menu : on sait ce qu on cible.
      var seg = document.getElementById('f-seg');
      var quoi = document.getElementById('f-seg-quoi');
      var majSeg = function(){
        if (!seg || !quoi) return;
        var s = (FORM.d.segments || []).filter(function(x){ return x.cle === seg.value; })[0];
        quoi.textContent = (s && s.phrase) ? s.phrase : '';
      };
      if (seg) seg.onchange = majSeg;
      majSeg();
      var sms = document.getElementById('f-sms');
      var cpt = document.getElementById('f-sms-n');
      var majN = function(){ if (cpt && sms) cpt.textContent = String(sms.value.length); };
      if (sms) sms.oninput = majN;
      majN();
      /* ══ LA BASCULE VISUEL / HTML ═══════════════════════════════════════
         ⚠ ELLE NE PERD RIEN, DANS AUCUN SENS. Vers HTML : on demande au site de
         convertir les blocs (il est le seul a savoir). Vers le visuel : le HTML
         entre dans un bloc << HTML libre >> — on ne tente pas de le decouper en
         blocs, ce serait inventer une structure et reecrire son corps au premier
         enregistrement. */
      var ta = document.getElementById('f-html');
      var zb = document.getElementById('f-blocs');
      var bv = document.getElementById('f-m-vis');
      var bh = document.getElementById('f-m-htm');
      var majMode = function(){
        if (zb) zb.style.display = (BMODE === 'visuel') ? '' : 'none';
        if (ta) ta.style.display = (BMODE === 'visuel') ? 'none' : '';
        if (bv) bv.className = 'mini' + (BMODE === 'visuel' ? ' on' : '');
        if (bh) bh.className = 'mini' + (BMODE === 'html' ? ' on' : '');
      };
      if (bv) bv.onclick = function(){
        if (BMODE === 'visuel') return;
        var htm = ta ? ta.value : '';
        BLOCS = htm.trim() ? [{ type: 'rawHtml', content: htm }] : [];
        BMODE = 'visuel';
        majMode(); majBlocs();
        dire('Mode visuel. Le HTML est rangé dans un bloc « HTML libre ».', 'att');
      };
      if (bh) bh.onclick = function(){
        if (BMODE === 'html') return;
        blocsVersHtml(function(htm){
          if (ta) ta.value = htm;
          BMODE = 'html';
          majMode();
          dire('Mode HTML — c’est exactement ce qui partira.', 'att');
        });
      };
      majMode();
      brancherBlocs();

      var ch = document.getElementById('f-charger');
      if (ch) ch.onclick = function(){
        var cle = document.getElementById('f-tpl').value;
        if (!cle) { dire('Choisissez un modèle.', 'att'); return; }
        /* ⚠ EN MODE VISUEL, ON CHARGE LES BLOCS DU MODELE, pas son HTML. Charger
           le HTML puis le ranger dans un bloc << HTML libre >> donnerait un
           modele qu on ne peut plus modifier bloc par bloc — c est-a-dire tout
           l inverse de ce que l editeur sert a faire. */
        if (BMODE === 'visuel' && BMODELES[cle]) {
          BLOCS = JSON.parse(JSON.stringify(BMODELES[cle]));
          majBlocs();
          dire('Modèle chargé en blocs — ajustez-les à votre guise.', 'bon');
          return;
        }
        appeler('nl:modele', [cle]).then(function(r){
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          document.getElementById('f-html').value = r.html;
          var s = document.getElementById('f-suj');
          if (s && !s.value.trim()) s.value = r.sujet;
          dire('Modèle « ' + esc(r.nom) + ' » chargé.', 'bon');
        });
      };
      var ap = document.getElementById('f-apercu');
      if (ap) ap.onclick = function(){
        // ⚠ L apercu montre TOUJOURS ce qui partira : en mode visuel, on convertit
        // d abord. Montrer le contenu du champ HTML — vide en visuel — annoncerait
        // un courriel vide sur une campagne pleine.
        if (BMODE === 'visuel') { blocsVersHtml(function(h){ apercuDans(h); }); return; }
        apercuDans(document.getElementById('f-html').value);
      };
      return;
    }

    var plus = document.getElementById('f-etape-plus');
    if (plus) plus.onclick = function(){
      releverEtapes();
      ETAPES.push({ sujet: '', html: '', jours: ETAPES.length === 0 ? 0 : 3, heures: 0 });
      var z = document.getElementById('f-etapes');
      if (z) z.innerHTML = vueEtapes();
    };
  }

  /* ══ ONGLET SEGMENTS ══════════════════════════════════════════════════════
     Un segment est une RECETTE reevaluee a chaque envoi, pas une liste figee :
     une cliente qui franchit le seuil entre la creation et l envoi y entre
     d elle-meme. ⚠ Un segment ne fait que RETRECIR la liste des abonnees
     actives — il n ajoute jamais personne (consentement, LCAP / Loi 25). */
  function vueSegments(){
    var D = DS;
    if (!D) return '<div class="vide">Chargement…</div>';
    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">Abonnés actifs</div><div class="val bon">'
      + (D.abonnesActifs || 0) + '</div><div class="dt">le point de départ</div></div>'
      + '<div class="tuile"><div class="lbl">Segments composés</div><div class="val">'
      + (D.segments || []).length + '</div></div></div>';

    h += '<div class="avis att">Un segment ne fait que <strong>restreindre</strong> la liste '
      + 'des abonnées actives : il ne peut jamais joindre quelqu’un qui n’a pas consenti '
      + 'à recevoir l’infolettre.</div>';

    if (D.peutModifier) {
      h += '<div class="barreoutils"><button class="mini prim" id="cp-nouvseg">'
        + '+ Nouveau segment</button></div>';
    }

    if (!(D.segments || []).length) {
      h += '<div class="carte"><div class="vide">Aucun segment composé. Les campagnes '
        + 'disposent tout de même de « Tous les abonnés » et « Clients avec commandes ».</div></div>';
      return h + renvoi();
    }

    h += '<div class="carte"><table><thead><tr><th>Segment</th><th>Critères</th>'
      + '<th class="num">Portée</th><th class="num">Utilisé par</th>'
      + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
      + D.segments.map(function(s){
          var gestes = '';
          if (D.peutModifier) {
            gestes += '<button class="mini geste" data-segmodif="' + esc(s.id) + '">Modifier</button> ';
            var armeS = (ARME === 'segsup:' + s.id);
            gestes += '<button class="mini geste danger' + (armeS ? ' arme' : '') + '" data-segsup="'
              + esc(s.id) + '">' + (armeS ? 'Confirmer ?' : 'Supprimer') + '</button>';
          }
          return '<tr><td><strong>' + esc(s.nom) + '</strong></td>'
            + '<td class="dt">' + esc(s.phrase || '—') + '</td>'
            + '<td class="num"><span class="pill ' + (s.compte ? 'bon' : 'neutre') + '">'
            + s.compte + '</span></td>'
            + '<td class="num dt">' + (s.utilisePar ? pluriel(s.utilisePar, 'campagne') : '—') + '</td>'
            + (D.peutModifier ? '<td class="fin">' + gestes + '</td>' : '') + '</tr>';
        }).join('')
      + '</tbody></table></div>';
    return h + renvoi();
  }

  function vueFormSegment(){
    var f = FORM, d = f.d;
    return '<div class="carte form">'
      + '<h3 style="margin:0 0 .6rem;font:700 .92rem/1.3 Georgia,serif">'
      + (f.id ? 'Modifier le segment' : 'Nouveau segment') + '</h3>'
      + '<div class="champ"><span class="lbl">Nom du segment</span>'
      + '<input id="f-nom" value="' + esc(f.nom || '') + '" placeholder="Clientes robes, 300 $ et plus"></div>'
      + '<div class="barreoutils" style="margin:.5rem 0 .4rem">'
      + '<strong style="font-size:.8rem">Critères</strong>'
      + '<span class="dt">toutes ces conditions doivent être remplies</span>'
      + '<button class="mini" id="f-crit-plus">+ Ajouter un critère</button></div>'
      + '<div id="f-criteres">' + vueCriteres() + '</div>'
      + '<div class="portee" id="f-portee">Portée : <strong id="f-portee-n">—</strong> '
      + 'sur ' + (d.abonnesActifs || 0) + ' abonnées actives '
      + '<button class="mini" id="f-compter">Compter</button></div>'
      + '<div class="fin3"><button id="f-annuler">Annuler</button>'
      + '<button class="prim" id="f-ok">Enregistrer</button></div></div>';
  }

  function champDef(cle){
    var l = (FORM && FORM.d && FORM.d.champs) || [];
    for (var i = 0; i < l.length; i++) { if (l[i].cle === cle) return l[i]; }
    return null;
  }

  // Le controle de VALEUR depend du type du champ : un nombre, une categorie,
  // un segment automatique, un oui/non, ou du texte libre.
  function champValeur(i, c){
    var def = champDef(c.champ);
    var d = FORM.d;
    var id = 'c-v-' + i;
    if (!def) return '<input id="' + id + '" value="' + esc(c.valeur) + '">';
    if (def.type === 'nombre') {
      return '<input type="number" min="0" step="any" id="' + id + '" value="'
        + esc(c.valeur) + '">' + (def.unite ? '<span class="u">' + esc(def.unite) + '</span>' : '');
    }
    if (def.type === 'categorie' || def.type === 'segauto') {
      var opts = (def.type === 'categorie' ? (d.categories || []) : (d.segmentsAuto || []));
      return '<select id="' + id + '">' + opts.map(function(o){
        return '<option value="' + esc(o.cle) + '"' + (String(c.valeur) === o.cle ? ' selected' : '')
          + '>' + esc(o.nom) + '</option>'; }).join('') + '</select>';
    }
    if (def.type === 'booleen') {
      var oui = (c.valeur === true || c.valeur === 'true');
      return '<select id="' + id + '"><option value="true"' + (oui ? ' selected' : '') + '>Oui</option>'
        + '<option value="false"' + (oui ? '' : ' selected') + '>Non</option></select>';
    }
    return '<input id="' + id + '" value="' + esc(c.valeur) + '">';
  }

  function vueCriteres(){
    var cr = CRITERES || [];
    if (!cr.length) {
      return '<div class="vide" style="padding:.9rem">Aucun critère : ce segment vaudrait '
        + '« tous les abonnés ». Ajoutez-en au moins un.</div>';
    }
    var champs = (FORM.d && FORM.d.champs) || [];
    return cr.map(function(c, i){
      var def = champDef(c.champ) || { ops: [] };
      return '<div class="critere">'
        + '<select id="c-c-' + i + '" data-critchamp="' + i + '">'
        + champs.map(function(x){
            return '<option value="' + esc(x.cle) + '"' + (x.cle === c.champ ? ' selected' : '')
              + '>' + esc(x.nom) + '</option>'; }).join('') + '</select>'
        + '<select id="c-o-' + i + '">'
        + (def.ops || []).map(function(o){
            return '<option value="' + esc(o.cle) + '"' + (o.cle === c.op ? ' selected' : '')
              + '>' + esc(o.nom) + '</option>'; }).join('') + '</select>'
        + champValeur(i, c)
        + '<button class="mini danger" data-critsup="' + i + '">✕</button></div>';
    }).join('');
  }

  /* ⚠ MEME PIEGE QUE LES ETAPES : la saisie vit dans CRITERES, pas dans le DOM.
     Ajouter, retirer ou changer un champ redessine la liste — on releve donc
     AVANT chaque redessin, sinon la frappe en cours disparait. */
  function releverCriteres(){
    (CRITERES || []).forEach(function(c, i){
      var g = function(id){ var e = document.getElementById(id); return e ? e.value : null; };
      var ch = g('c-c-' + i); if (ch != null) c.champ = ch;
      var op = g('c-o-' + i); if (op != null) c.op = op;
      var v = g('c-v-' + i); if (v != null) c.valeur = v;
    });
  }

  function redessinerCriteres(){
    var z = document.getElementById('f-criteres');
    if (z) z.innerHTML = vueCriteres();
    var p = document.getElementById('f-portee-n');
    if (p) p.textContent = '—';   // la portee affichee ne vaut plus rien
  }

  function compterPortee(){
    releverCriteres();
    var p = document.getElementById('f-portee-n');
    if (p) p.textContent = '…';
    appeler('segments:apercu', [CRITERES || []]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); if (p) p.textContent = '—'; return; }
      if (p) p.textContent = String(r.compte);
      dire(r.compte === 0
        ? 'Aucune abonnée ne correspond : ce segment n’enverrait rien.'
        : pluriel(r.compte, 'abonnée') + ' sur ' + r.total + '.', r.compte === 0 ? 'att' : 'bon');
    });
  }

  function soumettreSegment(){
    releverCriteres();
    var nom = (document.getElementById('f-nom').value || '').trim();
    if (!nom) { dire('Le nom est requis.', 'err'); return; }
    if (!(CRITERES || []).length) { dire('Ajoutez au moins un critère.', 'err'); return; }
    var b = document.getElementById('f-ok');
    if (b) b.disabled = true;
    dire('Enregistrement…');
    appeler('segments:ecrire', [FORM.id, { nom: nom, criteres: CRITERES }]).then(function(r){
      if (b) b.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire(esc(r.nom) + (r.cree ? ' créé' : ' mis à jour') + ' — ' + pluriel(r.compte, 'abonnée') + '.'
        + (r.nuage ? '' : ' ⚠ Enregistré sur ce poste seulement — le nuage n’a pas confirmé.'),
        r.nuage ? 'bon' : 'att');
      fermerForm();
    });
  }

  /* ══ ONGLET CAMPAGNES ═══════════════════════════════════════════════════ */
  function vueCampagnes(){
    var D = DC;
    if (!D) return '<div class="vide">Chargement…</div>';
    var q = Q.trim().toLowerCase();
    var rows = (D.campagnes || []).filter(function(c){
      if (!q) return true;
      return (String(c.nom) + ' ' + String(c.sujet)).toLowerCase().indexOf(q) !== -1;
    });

    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">Abonnés actifs</div><div class="val bon">'
      + (D.abonnesActifs || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Brouillons</div><div class="val neutre">'
      + (D.brouillons || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Campagnes parties</div><div class="val">'
      + (D.envoyees || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Courriels partis</div><div class="val">'
      + (D.courrielsEnvoyes || 0) + '</div>'
      + (D.courrielsEchoues ? '<div class="dt">' + pluriel(D.courrielsEchoues, 'échec') + '</div>' : '')
      + '</div></div>';

    /* Ce qui empeche un envoi, ou le detourne, se dit AVANT le clic. */
    if (!D.resendPret) {
      h += '<div class="avis mal">Aucune clé Resend n’est configurée : <strong>rien ne peut partir</strong>. '
        + 'Écran Infolettre → Configuration, dans la fenêtre principale.</div>';
    } else if (D.modeTest) {
      h += '<div class="avis att">Mode test allumé : les courriels partiront <strong>uniquement</strong> à '
        + esc(D.courrielTest) + ', et la campagne restera en brouillon. Les SMS, eux, ne partent pas du tout.</div>';
    }
    if (D.resendPret && D.expediteur) {
      h += '<div class="dt">Expéditeur : ' + esc(D.expediteur) + '</div>';
    }

    // La barre qui surplombe la LISTE : creation a gauche, recherche a droite,
    // juste au-dessus de ce sur quoi elles agissent.
    h += '<div class="barreoutils">'
      + (D.peutModifier ? '<button class="mini prim" id="cp-nouvelle">+ Nouvelle campagne</button>' : '')
      + '<div class="droite"><input type="search" id="cp-q" placeholder="Nom ou sujet…" value="'
      + esc(Q) + '"></div></div>';

    h += '<div class="carte">';
    if (!rows.length) {
      h += '<div class="vide">' + (q ? 'Rien ne correspond.'
        : 'Aucune campagne pour l’instant. Cliquez « + Nouvelle campagne ».') + '</div>';
    } else {
      h += '<table><thead><tr><th>Campagne</th><th>Envoyé à</th><th>Canal</th>'
        + '<th class="num">Destinataires</th><th>État</th><th class="num">Partis / échecs</th>'
        + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + rows.map(function(c){
            var gestes = '';
            if (D.peutModifier) {
              // ⚠ MEME REGLE QUE LE WEB : une campagne PARTIE ne se modifie plus.
              if (c.etat !== 'sent') {
                gestes += '<button class="mini geste" data-modif="' + esc(c.id) + '">Modifier</button> ';
              }
              if (c.etat !== 'sent') {
                var armeE = (ARME === 'env:' + c.id);
                gestes += '<button class="mini geste' + (armeE ? ' arme' : ' prim') + '" data-envoyer="'
                  + esc(c.id) + '"' + (D.resendPret || c.canal === 'sms' ? '' : ' disabled')
                  + '>' + (armeE ? 'Confirmer l’envoi ?' : 'Envoyer') + '</button> ';
              }
              var armeS = (ARME === 'sup:' + c.id);
              gestes += '<button class="mini geste danger' + (armeS ? ' arme' : '') + '" data-suppr="'
                + esc(c.id) + '">' + (armeS ? 'Confirmer ?' : 'Supprimer') + '</button>';
            }
            return '<tr><td><strong>' + esc(c.nom) + '</strong>'
              + '<div class="dt">' + esc(c.sujet) + '</div></td>'
              + '<td class="dt">' + esc(c.segmentLibelle) + '</td>'
              + '<td class="dt">' + esc(c.canalLibelle) + '</td>'
              + '<td class="num">' + (c.canal === 'sms' ? (D.smsDestinataires || 0) : c.destinataires)
              + (c.canal === 'both' ? ' + ' + (D.smsDestinataires || 0) + ' SMS' : '') + '</td>'
              + '<td><span class="pill ' + (c.etat === 'sent' ? 'bon' : (c.etat === 'sending' ? 'att' : 'neutre'))
              + '">' + esc(c.etatLibelle) + '</span>'
              + (c.date ? '<div class="dt">' + esc(c.date) + '</div>' : '') + '</td>'
              + '<td class="num">' + c.envoyes
              + (c.echecs ? ' / <span style="color:#f87171">' + c.echecs + '</span>' : '') + '</td>'
              + (D.peutModifier ? '<td class="fin">' + gestes + '</td>' : '') + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>' + renvoi();
    return h;
  }

  /* ══ ONGLET CHAINES ═════════════════════════════════════════════════════ */
  function vueChaines(){
    var D = DH;
    if (!D) return '<div class="vide">Chargement…</div>';

    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">Chaînes actives</div><div class="val bon">'
      + (D.actives || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Inscriptions en cours</div><div class="val">'
      + (D.enAttente || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Étapes échues</div><div class="val '
      + (D.dues ? 'att' : 'neutre') + '">' + (D.dues || 0) + '</div>'
      + '<div class="dt">prêtes à partir</div></div>'
      + '</div>';

    if (!D.envoisPermis) {
      h += '<div class="avis mal">Les « Séquences automatisées » sont <strong>en pause</strong> dans les '
        + 'contrôles d’envoi (écran Infolettre → Configuration). Aucune étape ne partira, et les traiter '
        + 'dans cet état abandonnerait les inscriptions sans rien envoyer.</div>';
    }

    if (D.peutModifier) {
      var armeT = (ARME === 'traiter');
      h += '<div class="barreoutils"><button class="mini' + (armeT ? ' arme' : ' prim') + '" id="cp-traiter"'
        + ((!D.dues || !D.envoisPermis) ? ' disabled' : '') + '>'
        + (armeT ? 'Confirmer — envoyer ' + pluriel(D.dues || 0, 'étape') + ' ?' : 'Traiter les étapes échues')
        + '</button>'
        + '<div class="droite">' + (D.dues
            ? pluriel(D.dues, 'étape') + ' échue' + ((D.dues > 1) ? 's' : '')
            : 'Rien d’échu pour l’instant') + '</div></div>';
    }

    if (D.peutModifier) {
      h += '<div class="barreoutils"><button class="mini prim" id="cp-nouvchaine">'
        + '+ Nouvelle chaîne</button></div>';
    }

    if (!(D.chaines || []).length) {
      h += '<div class="carte"><div class="vide">Aucune chaîne pour l’instant. '
        + 'Cliquez « + Nouvelle chaîne ».</div></div>';
    } else {
      h += (D.chaines || []).map(function(ch){
        var gestes = '';
        if (D.peutModifier) {
          gestes += '<button class="mini geste" data-chmodif="' + esc(ch.id) + '">Modifier</button>';
          var armeB = (ARME === 'bas:' + ch.id);
          gestes += '<button class="mini geste' + (armeB ? ' arme' : '') + '" data-basculer="' + esc(ch.id)
            + '" data-active="' + (ch.active ? '0' : '1') + '">'
            + (armeB ? 'Confirmer ?' : (ch.active ? 'Suspendre' : 'Activer')) + '</button>';
          var armeS = (ARME === 'chsup:' + ch.id);
          gestes += '<button class="mini geste danger' + (armeS ? ' arme' : '') + '" data-chsuppr="'
            + esc(ch.id) + '">' + (armeS ? 'Confirmer ?' : 'Supprimer') + '</button>';
        }
        return '<div class="carte chaine">'
          + '<div class="entete"><div><h3>' + esc(ch.nom) + '</h3>'
          + (ch.description ? '<div class="desc">' + esc(ch.description) + '</div>' : '') + '</div>'
          + '<span class="pill ' + (ch.active ? 'bon' : 'neutre') + '">'
          + (ch.active ? 'Active' : 'Suspendue') + '</span>'
          + '<span class="pill acc">' + esc(ch.declencheurLibelle) + '</span>'
          + '<div class="gestes">' + gestes + '</div></div>'
          + '<div class="compte">' + pluriel((ch.etapes || []).length, 'étape') + ' · '
          + ch.inscriptionsActives + ' en cours · ' + ch.inscriptionsFinies + ' terminée'
          + (ch.inscriptionsFinies > 1 ? 's' : '') + '</div>'
          + ((ch.etapes || []).length
              ? '<div class="etapes">' + ch.etapes.map(function(e){
                  return '<div class="etape"><span class="no">' + e.no + '.</span> '
                    + esc(e.delai) + '<div class="suj">' + esc(e.sujet) + '</div></div>';
                }).join('') + '</div>'
              : '<div class="dt">Aucune étape : cette chaîne n’enverra rien.</div>')
          + '</div>';
      }).join('');
    }

    h += renvoi();
    return h;
  }

  function dessiner(){
    if (OCCUPE) return;
    // ⚠ UN FORMULAIRE OUVERT PREND TOUTE LA VUE : pas d onglets, pas de liste.
    // Redessiner la liste sous un formulaire ferait perdre la saisie en cours.
    if (FORM) {
      if (sous) sous.textContent = '';
      corps.innerHTML = (FORM.type === 'chaine') ? vueFormChaine()
        : (FORM.type === 'segment') ? vueFormSegment() : vueFormCampagne();
      brancherForm();
      return;
    }
    // La mention suit l ONGLET affiche : dire << consultation seulement >> en
    // regardant les segments parce que les campagnes le sont serait faux.
    var vu = (ONGLET === 'chaines') ? DH : (ONGLET === 'segments') ? DS : DC;
    if (sous) sous.textContent = (vu && !vu.peutModifier) ? 'consultation seulement' : '';
    corps.innerHTML = onglets() + (ONGLET === 'chaines' ? vueChaines()
      : ONGLET === 'segments' ? vueSegments() : vueCampagnes());
    brancher();
  }

  function brancher(){
    var q = document.getElementById('cp-q');
    if (q) q.oninput = function(){ Q = q.value; redessinerSansPerdreLaSaisie(); };
    var bn = document.getElementById('cp-nouvelle');
    if (bn) bn.onclick = function(){ ouvrirForm('campagne', ''); };
    var bnc = document.getElementById('cp-nouvchaine');
    if (bnc) bnc.onclick = function(){ ouvrirForm('chaine', ''); };
    var bns = document.getElementById('cp-nouvseg');
    if (bns) bns.onclick = function(){ ouvrirForm('segment', ''); };
    var bt = document.getElementById('cp-traiter');
    if (bt) bt.onclick = function(){
      if (ARME !== 'traiter') {
        ARME = 'traiter';
        dessiner();
        dire('Ces étapes partiront pour de bon, par courriel. Cliquez pour confirmer.', 'att');
        return;
      }
      ARME = '';
      OCCUPE = true;
      bt.disabled = true;
      bt.textContent = 'Envoi en cours…';
      dire('Envoi des étapes échues… ne fermez pas cette fenêtre.', 'att');
      appeler('chaines:traiter', []).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); charger(); return; }
        /* Le verdict dit ce qui est PARTI, pas ce qui a ete tente. */
        dire(pluriel(r.envoyes, 'courriel') + ' parti' + (r.envoyes > 1 ? 's' : '')
          + (r.echecs ? ', ' + pluriel(r.echecs, 'échec') : '')
          + ' sur ' + pluriel(r.traitees, 'étape') + ' traitée' + (r.traitees > 1 ? 's' : '') + '.',
          r.echecs ? 'att' : 'bon');
        charger();
      });
    };
  }

  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('cp-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('cp-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;

    /* ── Gestes PROPRES AU FORMULAIRE (etapes d une chaine, criteres) ───── */
    if (FORM) {
      var cs = t.closest('[data-critsup]');
      if (cs) {
        releverCriteres();
        CRITERES.splice(parseInt(cs.getAttribute('data-critsup'), 10), 1);
        redessinerCriteres();
        return;
      }
      var sup = t.closest('[data-etsup]');
      if (sup) {
        releverEtapes();
        ETAPES.splice(parseInt(sup.getAttribute('data-etsup'), 10), 1);
        var z1 = document.getElementById('f-etapes');
        if (z1) z1.innerHTML = vueEtapes();
        return;
      }
      var mnt = t.closest('[data-mont]');
      var dsc = t.closest('[data-desc]');
      if (mnt || dsc) {
        releverEtapes();
        var i0 = parseInt((mnt || dsc).getAttribute(mnt ? 'data-mont' : 'data-desc'), 10);
        var j0 = mnt ? i0 - 1 : i0 + 1;
        var tmp = ETAPES[i0]; ETAPES[i0] = ETAPES[j0]; ETAPES[j0] = tmp;
        var z2 = document.getElementById('f-etapes');
        if (z2) z2.innerHTML = vueEtapes();
        return;
      }
      var etc = t.closest('[data-etcharger]');
      if (etc) {
        var ic = etc.getAttribute('data-etcharger');
        var sel = document.getElementById('e-t-' + ic);
        if (!sel || !sel.value) { dire('Choisissez un modèle.', 'att'); return; }
        appeler('nl:modele', [sel.value]).then(function(r){
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          var b2 = document.getElementById('e-b-' + ic);
          if (b2) b2.value = r.html;
          var s2 = document.getElementById('e-s-' + ic);
          if (s2 && !s2.value.trim()) s2.value = r.sujet;
          dire('Modèle « ' + esc(r.nom) + ' » chargé dans l’étape ' + (parseInt(ic, 10) + 1) + '.', 'bon');
        });
        return;
      }
      var eta = t.closest('[data-etapercu]');
      if (eta) {
        var b3 = document.getElementById('e-b-' + eta.getAttribute('data-etapercu'));
        apercuDans(b3 ? b3.value : '');
        return;
      }
      return;   // rien d autre ne s ecoute tant qu un formulaire est ouvert
    }

    var bm = t.closest('[data-modif]');
    if (bm) { ouvrirForm('campagne', bm.getAttribute('data-modif')); return; }
    var bcm = t.closest('[data-chmodif]');
    if (bcm) { ouvrirForm('chaine', bcm.getAttribute('data-chmodif')); return; }
    var bsm = t.closest('[data-segmodif]');
    if (bsm) { ouvrirForm('segment', bsm.getAttribute('data-segmodif')); return; }

    var bss = t.closest('[data-segsup]');
    if (bss) {
      var idSg = bss.getAttribute('data-segsup');
      if (ARME !== 'segsup:' + idSg) {
        ARME = 'segsup:' + idSg;
        dessiner();
        dire('Cliquez « Confirmer ? » — le segment disparaît. Les campagnes qui '
          + 's’en servent doivent d’abord en choisir un autre.', 'att');
        return;
      }
      ARME = '';
      appeler('segments:supprimer', [idSg]).then(function(r){
        if (!r.ok) {
          // ⚠ Le refus le plus utile : on NOMME les campagnes qui bloquent,
          // sinon il faudrait les chercher une par une.
          dire(r.motif === 'utilise'
            ? ('Impossible : ' + pluriel(r.combien, 'campagne') + ' s’en sert encore ('
               + (r.campagnes || []).join(', ') + '). Changez leur segment d’abord.')
            : expliquer(r), 'err');
          dessiner();
          return;
        }
        dire(esc(r.nom) + ' supprimé.'
          + (r.nuage ? '' : ' ⚠ Retiré sur ce poste seulement — le nuage n’a pas confirmé.'),
          r.nuage ? 'bon' : 'att');
        charger();
      });
      return;
    }

    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); ARME = ''; charger(); return; }

    var be = t.closest('[data-envoyer]');
    if (be && !be.disabled) {
      var idE = be.getAttribute('data-envoyer');
      var camp = (DC && DC.campagnes || []).filter(function(c){ return c.id === idE; })[0];
      if (ARME !== 'env:' + idE) {
        ARME = 'env:' + idE;
        dessiner();
        /* ⚠ On annonce le nombre et le canal AVANT : c est la derniere
           occasion de se raviser, et rien ne se rattrape apres. */
        var combien = camp
          ? (camp.canal === 'sms' ? ((DC.smsDestinataires || 0) + ' SMS')
             : (pluriel(camp.destinataires, 'courriel')
                + (camp.canal === 'both' ? ' et ' + (DC.smsDestinataires || 0) + ' SMS' : '')))
          : 'les destinataires';
        dire((DC && DC.modeTest)
          ? ('Mode test : un seul courriel partira, à ' + (DC.courrielTest || 'l’adresse de test') + '.')
          : ('Cliquez pour confirmer : ' + combien + ' vont partir, sans retour possible.'), 'att');
        return;
      }
      ARME = '';
      OCCUPE = true;
      be.disabled = true;
      be.textContent = 'Envoi…';
      dire('Envoi en cours… ne fermez pas cette fenêtre.', 'att');
      appeler('campagnes:envoyer', [idE]).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); charger(); return; }
        dire(esc(r.nom) + ' — ' + pluriel(r.envoyes, 'envoi') + ' réussi' + (r.envoyes > 1 ? 's' : '')
          + (r.echecs ? ', ' + pluriel(r.echecs, 'échec') : '')
          + (r.modeTest ? ' (mode test : la campagne reste en brouillon).' : '.'),
          r.echecs ? 'att' : 'bon');
        charger();
      });
      return;
    }

    var bs = t.closest('[data-suppr]');
    if (bs) {
      var idS = bs.getAttribute('data-suppr');
      if (ARME !== 'sup:' + idS) {
        ARME = 'sup:' + idS;
        dessiner();
        dire('Cliquez « Confirmer ? » — la campagne et ses images sont supprimées pour de bon.', 'att');
        return;
      }
      ARME = '';
      appeler('campagnes:supprimer', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(esc(r.nom) + ' supprimée.', 'bon');
        charger();
      });
      return;
    }

    var bb = t.closest('[data-basculer]');
    if (bb) {
      var idB = bb.getAttribute('data-basculer');
      var versActive = bb.getAttribute('data-active') === '1';
      var ch = (DH && DH.chaines || []).filter(function(c){ return c.id === idB; })[0];
      var enCours = ch ? ch.inscriptionsActives : 0;
      /* ⚠ SUSPENDRE N EST PAS METTRE EN PAUSE : au traitement suivant, les
         inscriptions en cours sont marquees faites et ne repartiront jamais.
         On ne l arme que s il y a vraiment quelque chose a perdre. */
      if (!versActive && enCours && ARME !== 'bas:' + idB) {
        ARME = 'bas:' + idB;
        dessiner();
        dire('Suspendre abandonnera ' + pluriel(enCours, 'inscription') + ' en cours : '
          + (enCours > 1 ? 'ces personnes ne recevront jamais' : 'cette personne ne recevra jamais')
          + ' la suite de la séquence. Cliquez pour confirmer.', 'att');
        return;
      }
      ARME = '';
      bb.disabled = true;
      appeler('chaines:basculer', [idB, versActive]).then(function(r){
        if (!r.ok) { bb.disabled = false; dire(expliquer(r), 'err'); return; }
        dire(esc(r.nom) + (r.active ? ' est active.' : ' est suspendue.')
          + (r.nuage ? '' : ' ⚠ Enregistré sur ce poste seulement — le nuage n’a pas confirmé.'),
          r.nuage ? 'bon' : 'att');
        charger();
      });
      return;
    }

    var bcs = t.closest('[data-chsuppr]');
    if (bcs) {
      var idC = bcs.getAttribute('data-chsuppr');
      var chS = (DH && DH.chaines || []).filter(function(c){ return c.id === idC; })[0];
      if (ARME !== 'chsup:' + idC) {
        ARME = 'chsup:' + idC;
        dessiner();
        dire('Cliquez « Confirmer ? » — la chaîne, ses étapes et '
          + pluriel(chS ? chS.inscriptionsActives : 0, 'inscription') + ' en cours disparaissent.', 'att');
        return;
      }
      ARME = '';
      appeler('chaines:supprimer', [idC]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(esc(r.nom) + ' supprimée'
          + (r.perdues ? ' — ' + pluriel(r.perdues, 'inscription') + ' abandonnée'
             + (r.perdues > 1 ? 's' : '') + '.' : '.')
          + (r.nuage ? '' : ' ⚠ Retiré sur ce poste seulement — le nuage n’a pas confirmé.'),
          r.nuage ? 'bon' : 'att');
        charger();
      });
      return;
    }

    /* Un clic sur une commande est traite par SA commande : sans cette garde,
       le clic remonterait ici et desarmerait ce qu il vient d armer. */
    if (t.closest('button, input, select, label')) return;
    if (ARME) { ARME = ''; dessiner(); }
  });

  /* ⚠ CHANGER LE CHAMP D UN CRITERE CHANGE SES OPERATEURS ET SON CONTROLE DE
     VALEUR : << Ville au moins 300 >> n existe pas. On redessine donc la ligne,
     apres avoir releve la saisie, et on remet la valeur a vide — la garder
     ferait un critere qui montre autre chose que ce qu il contient. */
  corps.addEventListener('change', function(ev){
    var t = ev.target;
    if (!FORM || FORM.type !== 'segment' || !t || !t.getAttribute) return;
    var i = t.getAttribute('data-critchamp');
    if (i == null) return;
    releverCriteres();
    var c = CRITERES[parseInt(i, 10)];
    var def = champDef(c.champ);
    c.op = (def && def.ops[0]) ? def.ops[0].cle : 'eq';
    c.valeur = '';
    redessinerCriteres();
  });

  function charger(){
    if (ONGLET === 'segments') {
      appeler('segments:donnees', []).then(function(r){
        if (!r || !r.ok) { vide('Segments indisponibles', expliquer(r)); return; }
        DS = r;
        dessiner();
      });
      return;
    }
    var op = (ONGLET === 'chaines') ? 'chaines:liste' : 'campagnes:liste';
    appeler(op, []).then(function(r){
      if (!r || !r.ok) {
        vide(ONGLET === 'chaines' ? 'Chaînes indisponibles' : 'Campagnes indisponibles', expliquer(r));
        return;
      }
      if (ONGLET === 'chaines') DH = r; else DC = r;
      dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER PAR-DESSUS UNE SAISIE : un formulaire ouvert bloque
     l actualisation, sinon la campagne en cours de redaction disparaitrait. */
  window.szActualiser = function(){
    if (OCCUPE || ARME || FORM) return;
    var q = document.getElementById('cp-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ if (!OCCUPE && !FORM) charger(); };

  /* ── MODE ANCRE ── Le meme bouton que les autres ecrans. */
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);'
        + 'color:#e8edf5;cursor:pointer;flex:0 0 auto');
      t.appendChild(b);
    }
    if (actif) {
      b.textContent = '⧉ Détacher';
      b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '⚓ Ancrer';
      b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      /* ⚠ Un envoi en cours ne se ferme pas d un coup d Echap. */
      if (OCCUPE) { dire('Un envoi est en cours : attendez le compte rendu.', 'att'); return; }
      // ⚠ Echap ferme le FORMULAIRE avant la fenetre : sinon une frappe de trop
      // ferait disparaitre tout ce qui vient d etre saisi.
      if (FORM) { fermerForm(); return; }
      if (ARME) { ARME = ''; dessiner(); return; }
      P.fermer();
    }
  });

  /* Le catalogue des blocs, demande des l ouverture : la palette doit etre prete
     quand le formulaire s ouvre, pas trois secondes apres. */
  chargerBlocsCatalogue();

  if (FORM_DEPART) {
    ouvrirForm(ONGLET === 'chaines' ? 'chaine'
             : ONGLET === 'segments' ? 'segment' : 'campagne', '');
  } else charger();
})();
</script>
</body></html>`;
}

module.exports = { pageCampagnes };
