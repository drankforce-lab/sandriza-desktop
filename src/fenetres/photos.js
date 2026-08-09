'use strict';

/*
 * FENÊTRE « PHOTOS » — NATIVE (2.3.0)
 * =============================================================================
 * La médiathèque : importer, isoler le vêtement, choisir un fond, attacher la
 * photo à un article. C'est un écran d'IMPORT, pas de consultation — ce qui
 * entre par ici finit dans le stockage et parfois sur une fiche produit.
 *
 * ⚠ CE QUE CETTE FENÊTRE NE FAIT PAS, ET C'EST VOULU. Elle ne compresse pas,
 * ne dépose rien dans le stockage, ne numérote pas, n'écrit aucune fiche. Elle
 * lit un fichier, l'envoie au site, et affiche le verdict. Toute la règle vit
 * dans photos.js (cœurs sans DOM) : une seconde compression écrite ici aurait
 * fini par produire un autre format que celui de la boutique.
 *
 * ⚠ LES IMAGES NE VOYAGENT QUE DANS UN SENS. Vers le site : le fichier importé,
 * et le fond déposé à la main. Vers la fenêtre : des ADRESSES seulement — des
 * vignettes en base64 feraient passer plusieurs mégaoctets par le pont à chaque
 * rafraîchissement. Une photo dont le dépôt a échoué n'a donc pas d'aperçu, et
 * la fenêtre le DIT plutôt que de montrer un cadre vide.
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
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:#8fa1b8}
input[type=search],select,button,textarea{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}

/* Zone de depot : elle doit se voir SANS chercher — c est la porte principale. */
.depot{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:.3rem;border:2px dashed rgba(255,255,255,.2);
  border-radius:12px;padding:1.15rem 1rem;text-align:center;color:#8fa1b8;
  cursor:pointer;transition:border-color .13s,background .13s}
.depot:hover{border-color:#c9a97e}
.depot.survol{border-color:#c9a97e;background:rgba(201,169,126,.08)}
.depot .gros{font-size:.95rem;font-weight:600;color:#e8edf5}
.depot .pt{font-size:.76rem}

.stats{display:flex;gap:.5rem;flex-wrap:wrap}
.stats .s{flex:1 1 7rem;background:rgba(255,255,255,.04);border-radius:9px;padding:.4rem .6rem}
.stats .s .n{font:700 1.05rem/1.2 Georgia,serif;color:#c9a97e}
.stats .s .l{font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}

table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:rgba(255,255,255,.04)}
tbody td{padding:.3rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody .num{font-weight:700;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
tbody .dt{font-size:.72rem;color:#8fa1b8}
.vign{width:44px;height:44px;border-radius:7px;overflow:hidden;display:flex;
  align-items:center;justify-content:center;
  background:conic-gradient(#3a4354 25%,#2b3444 0 50%,#3a4354 0 75%,#2b3444 0) 0 0/12px 12px}
.vign img{max-width:100%;max-height:100%;object-fit:contain}
.vign .att{font-size:.6rem;color:#fbbf24;text-align:center;line-height:1.1}
.gain{font-size:.68rem;color:#4ade80;font-weight:700}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.err{background:rgba(239,68,68,.14);color:#f87171}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:#8fa1b8}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}

.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:44rem;width:100%;max-height:88vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .5rem;font:700 .98rem/1.3 Georgia,serif;display:flex;
  align-items:center;gap:.5rem;flex-wrap:wrap}
.boite .apercu{background:conic-gradient(#3a4354 25%,#2b3444 0 50%,#3a4354 0 75%,#2b3444 0) 0 0/14px 14px;
  border-radius:10px;min-height:14rem;max-height:24rem;display:flex;align-items:center;
  justify-content:center;margin-bottom:.7rem;overflow:hidden}
.boite .apercu img{max-width:100%;max-height:24rem;object-fit:contain}
.boite .grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.5rem;
  padding:.55rem 0;border-top:1px solid rgba(255,255,255,.08);
  border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:.6rem}
.boite .grille .l{font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}
.boite .grille .v{font-size:.84rem;font-weight:600;overflow-wrap:anywhere}
.jetons{display:flex;flex-wrap:wrap;gap:.3rem;margin:.15rem 0 .6rem}
.jetons button{font-size:.75rem;padding:.16rem .5rem}
.jetons button.on{border-color:#c9a97e;background:rgba(201,169,126,.16)}
.boite .pied-boite{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.75rem;justify-content:flex-end}
.choix{max-height:17rem;overflow:auto;margin-top:.5rem;display:flex;
  flex-direction:column;gap:.28rem}
.choix .p{display:flex;align-items:center;gap:.55rem;padding:.3rem .4rem;
  border:1px solid rgba(255,255,255,.09);border-radius:8px;cursor:pointer}
.choix .p:hover{border-color:#c9a97e;background:rgba(255,255,255,.04)}
.choix .p img{width:34px;height:34px;object-fit:cover;border-radius:6px;flex:0 0 auto}
.choix .p .creux{width:34px;height:34px;border-radius:6px;flex:0 0 auto;
  background:rgba(255,255,255,.06)}
.choix .p .nm{font-size:.84rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.choix .p .sk{font-size:.7rem;color:#8fa1b8}
.aide{font-size:.75rem;color:#8fa1b8;line-height:1.45}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
/* Le SUIVI d import : une ligne par fichier, son etat, et ce qui lui arrive.
   ⚠ Un compteur << 3 / 12 >> dans le bandeau ne dit pas LESQUELLES ont echoue,
   ni pourquoi. Sur douze photos dont deux sont refusees, c est precisement ce
   qu on veut savoir. */
.suivi{position:fixed;right:1rem;bottom:3rem;width:min(26rem,calc(100vw - 2rem));
  max-height:60vh;display:flex;flex-direction:column;background:#16202f;
  border:1px solid rgba(201,169,126,.45);border-radius:11px;
  box-shadow:0 18px 44px rgba(0,0,0,.5);z-index:60}
.suivi .st{display:flex;align-items:center;gap:.5rem;padding:.55rem .8rem;
  border-bottom:1px solid rgba(255,255,255,.08);font:700 .78rem/1.2 system-ui;
  text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.suivi .st .n{margin-left:auto;font-weight:600;text-transform:none;letter-spacing:0}
.suivi .lst{flex:1 1 auto;overflow-y:auto;padding:.3rem .5rem .5rem}
.suivi .lg{display:flex;align-items:center;gap:.5rem;padding:.26rem .3rem;
  border-top:1px solid rgba(255,255,255,.05);font-size:.76rem}
.suivi .lg:first-child{border-top:0}
.suivi .lg{flex-wrap:wrap}
.suivi .lg .nm{flex:1 1 8rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Les etapes, sous le nom : ce que l import a REELLEMENT fait, avec ses
   chiffres. << 6,2 Mo vers 88 Ko >> se verifie ; << compression reussie >> non. */
.suivi .lg .ep{flex:1 0 100%;font-size:.68rem;color:#8fa1b8;padding-left:.1rem;
  display:flex;gap:.45rem;flex-wrap:wrap}
.suivi .lg .ep i{font-style:normal}
.suivi .lg .ep i.ok{color:#4ade80}
.suivi .lg .ep i.non{color:#fca5a5}
.suivi .lg .ep i.encours{color:#f0d6a0}
.suivi .lg .et{flex:0 0 auto;font-size:.68rem;font-weight:700;padding:.03rem .4rem;border-radius:99px}
.suivi .lg .et.attente{background:rgba(148,163,184,.16);color:#94a3b8}
.suivi .lg .et.cours{background:rgba(201,169,126,.2);color:#f0d6a0}
.suivi .lg .et.faite{background:rgba(34,197,94,.15);color:#4ade80}
.suivi .lg .et.double{background:rgba(234,179,8,.15);color:#facc15}
.suivi .lg .et.echec{background:rgba(248,113,113,.15);color:#fca5a5}
.suivi .pd{padding:.45rem .8rem;border-top:1px solid rgba(255,255,255,.08);
  display:flex;align-items:center;gap:.5rem;font-size:.74rem;color:#8fa1b8}
.suivi .pd button{margin-left:auto}
/* La barre de LOT : elle ne parait que s il y a un choix, et elle dit ce que
   les traitements engendrent — une image inventee n a pas la meme valeur qu une
   photo, et cela doit se lire avant de cliquer. */
.lot{position:sticky;bottom:0;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;
  margin-top:.6rem;padding:.5rem .7rem;background:#16202f;
  border:1px solid rgba(201,169,126,.45);border-radius:11px}
.lot .cnt{font-weight:700;font-size:.8rem}
.lot .av{flex:1 0 100%;font-size:.7rem;color:#8fa1b8}
input.chx{width:auto;cursor:pointer;accent-color:#c9a97e}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Photos ». */
function pagePhotos() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Photos — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🖼️</span><h1>Photos</h1>
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

  var D = null;
  var Q = '';
  var TRI = 'recent';
  var PAGE = 0;
  var DETAIL = null;        // la ligne ouverte
  var ATTACHE = false;      // le selecteur d article est deploye
  var PRODUITS = null;      // sa derniere reponse
  var PQ = '';
  var SUPPR_ARME = false;
  var VIDER_ARME = false;
  var OCCUPE = false;       // un travail long est en cours : on desarme les gestes
  var VEILLE = null;        // le chien de garde de ce travail
  /* Le CHOIX vit hors du dessin : il survit a un changement de page et de tri.
     ⚠ Sans cela, cocher douze photos puis trier par poids les decocherait
     toutes, et l on s en apercevrait apres avoir lance le traitement. */
  var CHOIX = {};

  /* ⚠⚠ UN DRAPEAU QUI NE SE LEVE PAS BLOQUE LA FENETRE POUR TOUJOURS.
     Signale le 2026-08-09 : << Recherche de cles USB... >> restait a l ecran, et
     tout import suivant repondait << un import est deja en cours >> alors que
     rien ne tournait. La cause n est pas dans un appel precis : c est que
     OCCUPE etait pose a la main et rendu a la main, sur le seul chemin de
     succes. Une reponse perdue — quelle qu en soit la raison — laissait la
     fenetre morte jusqu a sa reouverture, sans un mot.

     Deux regles, ici, une fois pour toutes :
       ① ON POSE ET ON REND AU MEME ENDROIT (occuper / liberer) ;
       ② UN TRAVAIL QUI NE REPOND PAS FINIT PAR LE DIRE. Le chien de garde rend
          le drapeau et NOMME le silence. Mieux vaut une fenetre qui avoue
          n avoir pas eu de reponse qu une fenetre qui refuse tout sans raison. */
  var VEILLE_MS = 60000;
  function occuper(mot){
    OCCUPE = true;
    dire(mot);
    clearTimeout(VEILLE);
    VEILLE = setTimeout(function(){
      if (!OCCUPE) return;
      liberer();
      dire('Aucune réponse de la fenêtre principale pour cette opération. '
        + 'Elle a peut-être abouti quand même — rechargez la liste pour voir.', 'err');
    }, VEILLE_MS);
  }
  function liberer(){
    OCCUPE = false;
    clearTimeout(VEILLE);
    VEILLE = null;
  }
  /* ⚠ ON NE REFUSE JAMAIS EN SILENCE. Un bouton qui ne fait rien passe pour
     casse ; un bouton qui dit pourquoi il attend passe pour occupe. */
  function occupeDeja(quoi){
    if (!OCCUPE) return false;
    dire(quoi + ' — un travail est déjà en cours dans cette fenêtre. Patientez, '
      + 'ou rechargez la liste s’il ne se termine pas.', 'att');
    return true;
  }

  /* ⚠ UN PLAFOND PAR FICHIER, ET IL EST DIT. L image traverse le pont en clair :
     une photo de 40 Mo bloquerait le canal plusieurs dizaines de secondes pour
     finir en delai. Refuser en NOMMANT le fichier vaut mieux qu un ecran fige. */
  var MAX_OCTETS = 25 * 1024 * 1024;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la photothèque.',
    droit_produit:      'Attacher une photo modifie une fiche produit — votre rôle ne le permet pas.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps. Une photo très lourde peut en être la cause.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    module_photos:      'La photothèque n’a pas pu être chargée dans la fenêtre principale. Rechargez-la (Ctrl+R) ; si le message revient, la session du personnel a peut-être expiré.',
    introuvable:        'Cette photo n’existe plus.',
    produit_introuvable:'Cet article n’existe plus.',
    image_absente:      'Aucune image lisible dans ce fichier.',
    non_isolee:         'Isolez d’abord le vêtement : un fond se pose derrière un détourage.',
    isolation:          'L’isolation a échoué.',
    fond:               'Le fond n’a pas pu être appliqué.',
    attache:            'L’attache a échoué — rien n’a été écrit sur la fiche.',
    import:             'L’import a échoué.',
    nuage:              'Écriture dans le nuage refusée — rien n’a été retiré.',
    usb_hors_app:       'La détection de clé USB n’existe que dans l’application de bureau.',
    export_hors_app:    'L’enregistrement de fichier n’existe que dans l’application de bureau.',
    echec:              'L’opération a échoué.'
  };
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
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }
  function poids(n){
    if (!n) return '—';
    if (n < 1024) return n + ' o';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' Ko';
    return (n / 1048576).toFixed(2) + ' Mo';
  }

  /* ── LE DESSIN ─────────────────────────────────────────────────────────── */
  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var ro = !D.peutModifier;
    var h = '';

    if (ro) {
      h += '<div class="carte" style="border-color:rgba(180,120,10,.4)">'
        + '<span class="pill att">👁 Lecture seule</span> '
        + '<span class="aide">Votre rôle permet de consulter la photothèque, pas de la modifier.</span></div>';
    }

    h += '<div class="barreoutils">'
      + '<button class="prim" id="p-choisir"' + (ro ? ' disabled' : '') + '>＋ Importer des photos</button>'
      + (D.bureau ? '<button id="p-usb"' + (ro ? ' disabled' : '') + '>🔌 Détecter une clé USB</button>' : '')
      + '<input type="search" id="p-q" placeholder="Code, nom, article…" value="' + esc(Q) + '">'
      + '<select id="p-tri">'
      + opt('recent', 'Plus récentes') + opt('code', 'Par code') + opt('name', 'Par nom')
      + opt('linked', 'Liées d’abord') + opt('size', 'Plus lourdes')
      + '</select>'
      + (D.total && !ro
          ? '<button class="danger" id="p-vider">' + (VIDER_ARME ? 'Confirmer — vider les ' + D.total + ' ?' : '🗑 Tout vider') + '</button>'
          : '')
      + '<span class="droite">' + D.trouvees + ' sur ' + D.total + '</span>'
      + '</div>';

    h += '<div class="stats">'
      + tuile(D.total, 'photos')
      + tuile(D.isolees, 'isolées')
      + tuile(D.liees, 'attachées')
      + '<div class="s"><div class="n">' + poids(D.poidsTotal) + '</div><div class="l">poids rangé</div></div>'
      + '</div>';

    if (!ro) {
      h += '<div class="depot" id="p-depot">'
        + '<div class="gros">Glissez-déposez vos photos ici</div>'
        + '<div class="pt">ou cliquez pour choisir des fichiers'
        + (D.bureau ? ' · ou « Détecter une clé USB »' : '') + '</div>'
        + '<div class="pt">Elles sont contenues, réencodées et déposées dans le stockage par la fenêtre principale.</div>'
        + '</div>';
    }

    h += '<div class="carte">';
    var rows = D.lignes || [];
    if (!rows.length) {
      /* ⚠ TROIS ETATS, PAS DEUX. Dire << Aucune photo >> pendant la
         synchronisation ferait croire que la mediatheque a ete perdue. */
      h += '<div class="vide">' + (!D.charge
        ? 'Lecture de la photothèque…'
        : (D.total ? 'Aucune photo ne correspond à cette recherche.'
                   : 'Aucune photo. Déposez-en ci-dessus.')) + '</div>';
    } else {
      h += '<table><thead><tr>'
        + '<th style="width:26px"><input type="checkbox" id="p-tout" title="Tout choisir sur cette page"></th>'
        + '<th>Aperçu</th><th>Code</th><th>Nom du fichier</th>'
        + '<th>Article lié</th><th>Poids</th><th>État</th></tr></thead><tbody>'
        + rows.map(ligne).join('') + '</tbody></table>';
      if ((D.pages || 1) > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="p-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="p-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';

    h += barreLot();
    if (DETAIL) h += boiteDetail();
    corps.innerHTML = h;
    brancher();
  }

  function nbChoisies(){ return Object.keys(CHOIX).length; }

  /* ══════════════════════════════════════════════════════════════════════════
     LE TRAITEMENT EN LOT
     ⚠ LA FENETRE MENE LA SUITE, ELLE N ENVOIE PAS UN LOT EN BLOC. L operation
     photos:lot existe (c est la definition, et l ecran du site s en sert), mais
     l appeler d ici rendrait la main seulement a la fin : sur trente photos et
     deux echecs, on veut savoir LESQUELLES pendant que ca tourne. On boucle donc
     photo par photo et l on rend compte a chaque pas.
     ══════════════════════════════════════════════════════════════════════════ */
  var LOTS = [
    ['detourage', '✂ Détourer', 'Isole le vêtement de son fond.'],
    ['fantome', '👻 Retirer le mannequin', 'Ne garde que le vêtement, col et manches reconstruits.'],
    ['humain', '🧍 Mettre sur un mannequin', 'Fait porter le vêtement par une personne engendrée.'],
  ];

  function barreLot(){
    var n = nbChoisies();
    if (!n || !D.peutModifier) return '';
    return '<div class="lot"><span class="cnt">' + n + ' photo' + (n > 1 ? 's' : '')
      + ' choisie' + (n > 1 ? 's' : '') + '</span>'
      + LOTS.map(function(l){
          return '<button class="mini" data-lot="' + l[0] + '" title="' + esc(l[2]) + '">' + l[1] + '</button>';
        }).join('')
      + '<button class="mini" id="p-rien">Tout décocher</button>'
      + '<span class="av">Les deux derniers traitements <strong>engendrent</strong> une image&nbsp;: '
      + 'l’original est conservé à côté.</span></div>';
  }

  function lancerLot(quoi){
    var ids = Object.keys(CHOIX);
    if (!ids.length) return;
    if (occupeDeja('Traitement en lot')) return;
    var nom = {};
    (D.photos || []).forEach(function(r){ nom[r.id] = r.code + ' · ' + r.nom; });
    var titres = ids.map(function(i){ return nom[i] || i; });
    occuper('Traitement de ' + ids.length + ' photo' + (ids.length > 1 ? 's' : '') + '…');
    suiviOuvrir(titres);
    var faites = 0, echecs = 0, replis = 0;
    var suite = function(k){
      suiviCompte(k, ids.length);
      if (k >= ids.length) {
        liberer();
        var t = faites + ' traitée' + (faites > 1 ? 's' : '');
        if (replis) t += ' · ' + replis + ' en repli local';
        if (echecs) t += ' · ' + echecs + ' en échec';
        suiviFin(t + '.');
        if (!echecs && !replis) setTimeout(suiviFermer, 2500);
        dire(t + '.', echecs ? 'att' : 'bon');
        CHOIX = {};
        charger();
        return;
      }
      suiviLigne(k, 'cours', 'en cours');
      suiviEtapes(k, [{ nom: 'envoi au modèle', etat: 'encours' }]);
      occuper('Traitement ' + (k + 1) + ' / ' + ids.length + '…');
      appeler('photos:traiter', [ids[k], quoi, {}]).then(function(r){
        if (r && r.ok) {
          faites++;
          if (r.par === 'canevas') replis++;
          suiviLigne(k, r.par === 'canevas' ? 'double' : 'faite',
            r.par === 'canevas' ? 'repli local' : 'traitée');
          suiviEtapes(k, [
            { nom: (r.par === 'canevas' ? 'détourage local' : 'modèle'), ok: true,
              chiffre: r.ms ? (Math.round(r.ms / 100) / 10) + ' s' : '' },
            { nom: 'dépôt', ok: true },
          ]);
        } else {
          echecs++;
          suiviLigne(k, 'echec', 'refusée');
          suiviEtapes(k, [{ nom: 'modèle', ok: false,
                            chiffre: (r && (r.detail || r.motif)) || '' }]);
        }
        suite(k + 1);
      });
    };
    suite(0);
  }

  function opt(v, l){
    return '<option value="' + v + '"' + (TRI === v ? ' selected' : '') + '>' + l + '</option>';
  }
  function tuile(n, l){
    return '<div class="s"><div class="n">' + (n || 0) + '</div><div class="l">' + l + '</div></div>';
  }

  function vignette(r){
    if (r.apercu) return '<div class="vign"><img src="' + esc(r.apercu) + '" alt=""></div>';
    /* Pas d aperçu = l image n a pas atteint le stockage. On le DIT : un cadre
       vide passerait pour une photo perdue. */
    return '<div class="vign"><span class="att">non<br>rangée</span></div>';
  }
  function etat(r){
    if (r.lieId) return '<span class="pill bon">attachée</span>';
    if (r.enAttente) return '<span class="pill err">non rangée</span>';
    if (r.isole) return '<span class="pill att">isolée</span>';
    return '<span class="pill neutre">' + esc(r.statut || 'importée') + '</span>';
  }
  function gain(r){
    var t = poids(r.poids);
    if (r.poidsSrc && r.poids && r.poids < r.poidsSrc * 0.95) {
      t += ' <span class="gain">−' + Math.round((1 - r.poids / r.poidsSrc) * 100) + ' %</span>';
    }
    return t;
  }
  function ligne(r){
    return '<tr data-id="' + esc(r.id) + '" title="Ouvrir la photo">'
      + '<td style="width:26px"><input type="checkbox" class="chx" data-chx="' + esc(r.id) + '"'
      + (CHOIX[r.id] ? ' checked' : '') + '></td>'
      + '<td style="width:52px">' + vignette(r) + '</td>'
      + '<td><span class="num">' + esc(r.code) + '</span></td>'
      + '<td><div class="dt" style="max-width:16rem;overflow:hidden;text-overflow:ellipsis;'
      + 'white-space:nowrap;color:inherit;font-size:.84rem">' + esc(r.nom) + '</div></td>'
      + '<td>' + (r.lieId
          ? esc(r.lieNom) + (r.lieSku ? ' <span class="dt">· ' + esc(r.lieSku) + '</span>' : '')
          : '<span class="dt">—</span>') + '</td>'
      + '<td style="white-space:nowrap">' + gain(r) + '</td>'
      + '<td>' + etat(r) + '</td></tr>';
  }

  /* ── LE PANNEAU DE DETAIL ──────────────────────────────────────────────── */
  function boiteDetail(){
    var r = DETAIL;
    var ro = !D.peutModifier;
    var h = '<div class="voile" id="p-voile"><div class="boite">'
      + '<h3><span class="num">' + esc(r.code) + '</span> ' + esc(r.nom) + ' ' + etat(r) + '</h3>'
      + '<div class="apercu">'
      + (r.apercu ? '<img src="' + esc(r.apercu) + '" alt="">'
                  : '<span class="aide" style="padding:1rem;text-align:center">Cette photo n’a pas atteint le stockage.<br>'
                    + 'Elle reste ouverte dans la fenêtre principale ; réessayez l’import.</span>')
      + '</div>'
      + '<div class="grille">'
      + '<div><div class="l">Poids rangé</div><div class="v">' + gain(r) + '</div></div>'
      + (r.poidsSrc ? '<div><div class="l">Avant compression</div><div class="v">' + poids(r.poidsSrc) + '</div></div>' : '')
      + '<div><div class="l">Détourage</div><div class="v">' + (r.isole ? 'fait' : 'non fait') + '</div></div>'
      + (r.lieId ? '<div><div class="l">Article</div><div class="v">' + esc(r.lieNom)
          + (r.lieSku ? ' · ' + esc(r.lieSku) : '') + '</div></div>' : '')
      + '</div>';

    if (!ro && r.isole && (D.fonds || []).length) {
      h += '<div class="l" style="font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8">Fond</div>'
        + '<div class="jetons">'
        + '<button data-fond="__transp" class="' + (!r.fond || r.fond === '__transp' ? 'on' : '') + '">Transparent</button>'
        + D.fonds.map(function(f){
            return '<button data-fond="' + esc(f.cle) + '" class="' + (r.fond === f.cle ? 'on' : '') + '">'
              + esc(f.libelle) + '</button>';
          }).join('')
        + '<button id="p-fondperso" class="' + (r.fond === '__custom' ? 'on' : '') + '">+ Mon fond…</button>'
        + '</div>';
    }

    if (ATTACHE) {
      h += '<div class="carte" style="margin-top:.4rem">'
        + '<input type="search" id="p-pq" placeholder="Chercher un article (nom ou SKU)…" '
        + 'value="' + esc(PQ) + '" style="width:100%">'
        + '<div class="choix" id="p-choix">' + listeProduits() + '</div></div>';
    }

    h += '<div class="pied-boite">'
      + (ro ? '' : '<button class="danger" id="p-suppr">'
          + (SUPPR_ARME ? 'Confirmer le retrait ?' : '🗑 Retirer de la médiathèque') + '</button>')
      + (D.bureau ? '<button id="p-enreg">⤓ Enregistrer le fichier</button>' : '')
      + (ro || r.isole ? '' : '<button class="prim" id="p-isoler">✂ Isoler le vêtement</button>')
      + (ro ? '' : '<button class="' + (r.isole ? 'prim' : '') + '" id="p-attacher">'
          + (ATTACHE ? 'Annuler l’attache' : '🔗 Attacher à un article') + '</button>')
      + '<button id="p-fermer">Fermer</button>'
      + '</div>';

    if (SUPPR_ARME) {
      h += '<div class="aide" style="margin-top:.5rem">'
        + (r.lieId
            ? 'Cette photo est attachée à <strong>' + esc(r.lieNom) + '</strong>. La fiche de l’article '
              + 'garde son image : elle en possède sa propre copie. Seule l’entrée de la médiathèque disparaît.'
            : 'Le fichier devenu inutile est effacé du stockage par le ménage automatique, après sept jours.')
        + '</div>';
    }

    h += '</div></div>';
    return h;
  }

  function listeProduits(){
    if (!PRODUITS) return '<div class="aide" style="padding:.4rem">Lecture du catalogue…</div>';
    if (!PRODUITS.length) return '<div class="aide" style="padding:.4rem">Aucun article ne correspond.</div>';
    return PRODUITS.map(function(p){
      return '<div class="p" data-pid="' + esc(p.id) + '">'
        + (p.image ? '<img src="' + esc(p.image) + '" alt="">' : '<span class="creux"></span>')
        + '<div style="min-width:0"><div class="nm">' + esc(p.nom) + '</div>'
        + '<div class="sk">' + esc(p.sku || 'sans SKU') + (p.enVente ? '' : ' · hors vente') + '</div></div></div>';
    }).join('');
  }

  /* ── IMPORT ────────────────────────────────────────────────────────────── */
  /* ⚠ UNE PHOTO A LA FOIS, ET ON DIT LAQUELLE. En parallele, dix lectures de
     fichier et dix depots simultanes encombreraient le pont et l on ne saurait
     plus laquelle a echoue. La progression est ANNONCEE : un import muet de
     sept photos passe pour un ecran fige. */
  function lireFichier(f){
    return new Promise(function(res){
      var r = new FileReader();
      r.onload = function(){ res(String(r.result || '')); };
      r.onerror = function(){ res(''); };
      r.readAsDataURL(f);
    });
  }
  /* ══════════════════════════════════════════════════════════════════════════
     LE SUIVI D IMPORT
     ⚠ IL SURVIT A LA FIN DU TRAVAIL. Un suivi qui disparait au dernier fichier
     ne sert qu a celui qui regardait l ecran ; celui qui revient deux minutes
     plus tard n a aucun moyen de savoir laquelle des douze photos a ete refusee.
     Il se ferme a la main.
     ══════════════════════════════════════════════════════════════════════════ */
  var SUIVI = null;

  function suiviOuvrir(noms){
    suiviFermer();
    var d = document.createElement('div');
    d.className = 'suivi';
    d.innerHTML = '<div class="st"><span>Import en cours</span><span class="n" id="sv-n">0 / '
      + noms.length + '</span></div><div class="lst" id="sv-l">'
      + noms.map(function(n, i){
          return '<div class="lg" id="sv-' + i + '"><span class="nm">' + esc(n)
            + '</span><span class="et attente">en attente</span>'
            + '<span class="ep" id="sv-e-' + i + '"></span></div>';
        }).join('')
      + '</div><div class="pd" id="sv-p"><span id="sv-r">Préparation…</span>'
      + '<button class="mini" id="sv-x">Fermer</button></div>';
    document.body.appendChild(d);
    SUIVI = d;
    var x = document.getElementById('sv-x');
    if (x) x.onclick = suiviFermer;
  }
  function suiviFermer(){
    if (SUIVI && SUIVI.parentNode) SUIVI.parentNode.removeChild(SUIVI);
    SUIVI = null;
  }
  function suiviLigne(i, etat, mot){
    if (!SUIVI) return;
    var l = document.getElementById('sv-' + i);
    if (!l) return;
    var e = l.querySelector('.et');
    if (e) { e.className = 'et ' + etat; e.textContent = mot; }
    if (etat === 'cours') l.scrollIntoView({ block: 'nearest' });
  }
  /* Les etapes d une ligne. L etat << encours >> marque celle qui tourne ; les autres
     portent leur verdict ET leur mesure. */
  function suiviEtapes(i, etapes){
    var z = document.getElementById('sv-e-' + i);
    if (!z) return;
    z.innerHTML = (etapes || []).map(function(e){
      var c = (e.etat === 'encours') ? 'encours' : (e.ok ? 'ok' : 'non');
      var m = (e.etat === 'encours') ? '…' : (e.ok ? '✓' : '✕');
      return '<i class="' + c + '">' + m + ' ' + esc(e.nom)
        + (e.chiffre ? ' ' + esc(e.chiffre) : '') + '</i>';
    }).join('');
  }
  function suiviCompte(fait, total){
    var n = document.getElementById('sv-n');
    if (n) n.textContent = fait + ' / ' + total;
  }
  function suiviFin(mot){
    var r = document.getElementById('sv-r');
    if (r) r.textContent = mot;
    var t = SUIVI && SUIVI.querySelector('.st span');
    if (t) t.textContent = 'Import terminé';
  }

  function importer(fichiers){
    if (!D || !D.peutModifier) { dire(MOTIFS.droit, 'err'); return; }
    var liste = [];
    for (var i = 0; i < fichiers.length; i++) {
      if (/^image\\//.test(fichiers[i].type || '')) liste.push(fichiers[i]);
    }
    if (!liste.length) { dire('Aucune image dans ce dépôt (JPG, PNG ou WebP).', 'att'); return; }
    if (occupeDeja('Import')) return;
    occuper('Préparation de l’import…');
    suiviOuvrir(liste.map(function(f){ return f.name; }));
    var faites = 0, doubles = 0, refuses = 0, echoues = 0;
    var suite = function(k){
      suiviCompte(k, liste.length);
      if (k >= liste.length) {
        liberer();
        var t = faites + ' importée' + (faites > 1 ? 's' : '');
        if (doubles) t += ' · ' + doubles + ' déjà présente' + (doubles > 1 ? 's' : '');
        if (refuses) t += ' · ' + refuses + ' trop lourde' + (refuses > 1 ? 's' : '');
        if (echoues) t += ' · ' + echoues + ' en échec';
        suiviFin(t + '.');
        /* ⚠ IL SE FERME TOUT SEUL QUAND TOUT EST PASSE (demande du 2026-08-09) :
           il n y a rien a y lire, et un panneau qui reste apres coup encombre.
           ⚠ MAIS IL RESTE DES QU IL Y A QUELQUE CHOSE A VOIR — un echec, une
           trop lourde, un doublon. C est precisement le cas ou l on veut savoir
           LAQUELLE, et le faire disparaitre effacerait la seule reponse. */
        if (!echoues && !refuses && !doubles) setTimeout(suiviFermer, 2500);
        dire(t + '.', (echoues || refuses) ? 'att' : 'bon');
        charger();
        return;
      }
      var f = liste[k];
      if (f.size > MAX_OCTETS) {
        refuses++;
        suiviLigne(k, 'echec', 'trop lourde');
        suite(k + 1); return;
      }
      suiviLigne(k, 'cours', 'en cours');
      suiviEtapes(k, [{ nom: 'lecture', etat: 'encours' }]);
      // Chaque fichier relance le chien de garde : c est le TRAVAIL qui doit
      // avancer, pas l ensemble qui doit tenir dans une minute.
      occuper('Import ' + (k + 1) + ' / ' + liste.length + ' · ' + f.name + '…');
      lireFichier(f).then(function(data){
        if (!data) {
          echoues++;
          suiviLigne(k, 'echec', 'illisible');
          suiviEtapes(k, [{ nom: 'lecture', ok: false }]);
          suite(k + 1); return;
        }
        suiviEtapes(k, [{ nom: 'lecture', ok: true, chiffre: poids(f.size) },
                        { nom: 'compression', etat: 'encours' }]);
        appeler('photos:importer', [f.name, data, f.size]).then(function(r){
          /* ⚠ LES ETAPES VIENNENT DU COEUR, pas d une supposition d ici : c est
             lui qui compresse et qui depose, et lui seul sait ce que ca a donne. */
          if (r && r.etapes) {
            suiviEtapes(k, [{ nom: 'lecture', ok: true, chiffre: poids(f.size) }].concat(
              r.etapes.map(function(e){
                return { nom: e.nom, ok: e.ok,
                  chiffre: (e.nom === 'compression' && e.avant)
                    ? (poids(e.avant) + ' → ' + poids(e.apres))
                    : (e.detail || '') };
              })));
          }
          if (r && r.ok && r.doublon) {
            suiviEtapes(k, [{ nom: 'lecture', ok: true, chiffre: poids(f.size) },
                            { nom: 'reconnue au contenu', ok: true, chiffre: r.code || '' }]);
            /* ⚠ RECONNUE A SON CONTENU, PAS A SON NOM — et l on donne le CODE de
               celle qui existe deja : << deja presente >> tout court n aide
               personne a la retrouver. */
            doubles++;
            suiviLigne(k, 'double', 'déjà là · ' + (r.code || ''));
          } else if (r && r.ok) {
            faites++;
            suiviLigne(k, r.rangee ? 'faite' : 'echec', r.rangee ? 'importée' : 'non rangée');
            if (!r.rangee) { echoues++; faites--; }
          } else {
            echoues++;
            suiviLigne(k, 'echec', 'refusée');
            dire(expliquer(r), 'err');
          }
          suite(k + 1);
        });
      });
    };
    suite(0);
  }

  function choisirFichiers(){
    var e = document.createElement('input');
    e.type = 'file'; e.accept = 'image/*'; e.multiple = true;
    e.onchange = function(){ if (e.files && e.files.length) importer(e.files); };
    e.click();
  }

  /* ── LES GESTES ────────────────────────────────────────────────────────── */
  function rouvrir(photo){
    /* Le panneau reste ouvert sur la MEME photo apres un geste : la refermer
       obligerait a la rechercher pour poser un fond apres l avoir isolee. */
    if (photo) DETAIL = photo;
    charger();
  }

  function isoler(){
    if (occupeDeja('Opération')) return;
    occuper('Isolation du vêtement… (quelques secondes)');
    appeler('photos:isoler', [DETAIL.id]).then(function(r){
      liberer();
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      /* ⚠ ON DIT PAR QUOI. Le detourage local devine l arriere-plan a partir des
         pixels de bordure : sur une photo reelle il mange le vetement ou garde
         le mur. Laisser croire que le modele a travaille, c est mettre en ligne
         une photo qu on croit traitee correctement. */
      dire(r.deja ? 'Cette photo était déjà isolée.'
        : (r.par === 'canevas'
            ? ('Vêtement isolé LOCALEMENT — le modèle n’a pas répondu'
               + (r.repli ? ' (' + esc(r.repli) + ')' : '') + '. Le résultat est moins net.')
            : 'Vêtement isolé par le modèle. Choisissez un fond.'),
        r.par === 'canevas' ? 'att' : 'bon');
      rouvrir(r.photo);
    });
  }

  function fond(cle, image){
    if (occupeDeja('Opération')) return;
    occuper('Application du fond…');
    appeler('photos:fond', [DETAIL.id, cle, image || '']).then(function(r){
      liberer();
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Fond appliqué.', 'bon');
      rouvrir(r.photo);
    });
  }

  function chercherProduits(){
    appeler('photos:produits', [PQ]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); PRODUITS = []; }
      else PRODUITS = r.produits || [];
      var z = document.getElementById('p-choix');
      if (z) z.innerHTML = listeProduits();
    });
  }

  function attacher(pid){
    if (occupeDeja('Opération')) return;
    occuper('Attache et téléversement…');
    appeler('photos:attacher', [DETAIL.id, pid]).then(function(r){
      liberer();
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Photo ' + r.code + ' attachée à ' + r.produit + '.', 'bon');
      ATTACHE = false; PRODUITS = null; PQ = '';
      rouvrir(r.photo);
    });
  }

  /* ── BRANCHEMENTS ──────────────────────────────────────────────────────── */
  function brancher(){
    var q = document.getElementById('p-q');
    if (q) q.oninput = function(){
      Q = q.value; PAGE = 0;
      clearTimeout(window._pq);
      window._pq = setTimeout(function(){ charger(true); }, 300);
    };
    var tri = document.getElementById('p-tri');
    if (tri) tri.onchange = function(){ TRI = tri.value; PAGE = 0; charger(); };
    var bp = document.getElementById('p-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, (D.page || 0) - 1); charger(); };
    var bs = document.getElementById('p-suiv');
    if (bs) bs.onclick = function(){ PAGE = (D.page || 0) + 1; charger(); };

    var ch = document.getElementById('p-choisir');
    if (ch) ch.onclick = choisirFichiers;
    var dp = document.getElementById('p-depot');
    if (dp) dp.onclick = choisirFichiers;

    /* ⚠ LA CASE NE DOIT PAS OUVRIR LA PHOTO : la ligne entiere est cliquable,
       et sans ce garde, cocher ouvrirait le panneau de detail par-dessus. */
    Array.prototype.forEach.call(corps.querySelectorAll('[data-chx]'), function(c){
      c.onclick = function(ev){ ev.stopPropagation(); };
      c.onchange = function(){
        var id = c.getAttribute('data-chx');
        if (c.checked) CHOIX[id] = true; else delete CHOIX[id];
        dessiner();
      };
    });
    var tt = document.getElementById('p-tout');
    if (tt) tt.onchange = function(){
      (D.photos || []).forEach(function(r){
        if (tt.checked) CHOIX[r.id] = true; else delete CHOIX[r.id];
      });
      dessiner();
    };
    var rien = document.getElementById('p-rien');
    if (rien) rien.onclick = function(){ CHOIX = {}; dessiner(); };
    Array.prototype.forEach.call(corps.querySelectorAll('[data-lot]'), function(b){
      b.onclick = function(){ lancerLot(b.getAttribute('data-lot')); };
    });

    var usb = document.getElementById('p-usb');
    if (usb) usb.onclick = function(){
      if (occupeDeja('Détection de clé USB')) return;
      occuper('Recherche de clés USB…');
      appeler('photos:usb', []).then(function(r){
        liberer();
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        if (!r.trouvees) { dire('Aucune photo trouvée sur une clé USB.', 'att'); return; }
        var t = r.importees + ' photo' + (r.importees > 1 ? 's' : '') + ' importée'
          + (r.importees > 1 ? 's' : '') + ' depuis la clé ' + (r.lecteur || 'USB');
        if (r.doublons) t += ' · ' + r.doublons + ' déjà présente' + (r.doublons > 1 ? 's' : '');
        if (r.echecs) t += ' · ' + r.echecs + ' en échec';
        dire(t + '.', r.importees ? 'bon' : 'att');
        charger();
      });
    };

    var vd = document.getElementById('p-vider');
    if (vd) vd.onclick = function(){
      /* ⚠ ARME EN DEUX CLICS, et le second dit COMBIEN disparaissent. */
      if (!VIDER_ARME) {
        VIDER_ARME = true; dessiner();
        setTimeout(function(){ if (VIDER_ARME) { VIDER_ARME = false; dessiner(); } }, 5000);
        return;
      }
      VIDER_ARME = false;
      if (occupeDeja('Vidage de la photothèque')) return;
      occuper('Retrait des entrées…');
      appeler('photos:vider', []).then(function(r){
        liberer();
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.echecs
          ? (r.retirees + ' retirée(s), ' + r.echecs + ' refusée(s) par le nuage.')
          : 'Photothèque vidée — les fiches produits gardent leurs images.',
          r.echecs ? 'att' : 'bon');
        DETAIL = null;
        charger();
      });
    };

    if (!DETAIL) return;

    var f = document.getElementById('p-fermer');
    if (f) f.onclick = fermerDetail;
    var iso = document.getElementById('p-isoler');
    if (iso) iso.onclick = isoler;

    var at = document.getElementById('p-attacher');
    if (at) at.onclick = function(){
      ATTACHE = !ATTACHE;
      if (ATTACHE) { PRODUITS = null; dessiner(); chercherProduits(); }
      else { PRODUITS = null; PQ = ''; dessiner(); }
    };
    var pq = document.getElementById('p-pq');
    if (pq) pq.oninput = function(){
      PQ = pq.value;
      clearTimeout(window._ppq);
      window._ppq = setTimeout(chercherProduits, 300);
    };

    var fp = document.getElementById('p-fondperso');
    if (fp) fp.onclick = function(){
      var e = document.createElement('input');
      e.type = 'file'; e.accept = 'image/*';
      e.onchange = function(){
        var fi = e.files && e.files[0];
        if (!fi) return;
        if (fi.size > MAX_OCTETS) { dire('Ce fond est trop lourd (25 Mo maximum).', 'att'); return; }
        lireFichier(fi).then(function(data){
          if (!data) { dire('Fond illisible.', 'err'); return; }
          fond('__custom', data);
        });
      };
      e.click();
    };

    var en = document.getElementById('p-enreg');
    if (en) en.onclick = function(){
      dire('Enregistrement…');
      appeler('photos:enregistrer', [DETAIL.id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Enregistré dans le dossier des exports (' + r.fichier + ').', 'bon');
      });
    };

    var su = document.getElementById('p-suppr');
    if (su) su.onclick = function(){
      if (!SUPPR_ARME) {
        SUPPR_ARME = true; dessiner();
        setTimeout(function(){ if (SUPPR_ARME) { SUPPR_ARME = false; if (DETAIL) dessiner(); } }, 5000);
        return;
      }
      SUPPR_ARME = false;
      dire('Retrait…');
      appeler('photos:supprimer', [DETAIL.id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.code + ' retirée de la médiathèque'
          + (r.lie ? ' — la fiche de l’article garde son image.' : '.'), 'bon');
        DETAIL = null; ATTACHE = false; PRODUITS = null;
        charger();
      });
    };
  }

  function fermerDetail(){
    DETAIL = null; ATTACHE = false; PRODUITS = null; PQ = ''; SUPPR_ARME = false;
    dessiner();
  }

  /* ⚠ UN CLIC SUR UNE COMMANDE EST TRAITE PAR SA COMMANDE, jamais par ce
     gestionnaire general : sans cette garde, le clic qui vient d ARMER un bouton
     remonte jusqu ici et le desarme dans la meme foulee (le piege de 1.72.0). */
  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var jf = t.closest('[data-fond]');
    if (jf) { fond(jf.getAttribute('data-fond'), ''); return; }
    var pp = t.closest('[data-pid]');
    if (pp) { attacher(pp.getAttribute('data-pid')); return; }
    if (t.closest('.boite')) return;
    if (t.closest('#p-voile')) { fermerDetail(); return; }
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-id]');
    if (tr) {
      var id = tr.getAttribute('data-id');
      var r = (D.lignes || []).filter(function(x){ return x.id === id; })[0];
      if (r) { DETAIL = r; SUPPR_ARME = false; ATTACHE = false; dessiner(); }
    }
  };

  /* ── GLISSER-DEPOSER ───────────────────────────────────────────────────────
     ⚠ SUR LE DOCUMENT ENTIER, ET preventDefault DANS LES DEUX. Sans cela, un
     fichier lache sur la fenetre fait NAVIGUER la page vers ce fichier : la
     fenetre native disparait, remplacee par l image. */
  document.addEventListener('dragover', function(ev){
    ev.preventDefault();
    var z = document.getElementById('p-depot');
    if (z) z.classList.add('survol');
  });
  document.addEventListener('dragleave', function(ev){
    if (ev.relatedTarget) return;
    var z = document.getElementById('p-depot');
    if (z) z.classList.remove('survol');
  });
  document.addEventListener('drop', function(ev){
    ev.preventDefault();
    var z = document.getElementById('p-depot');
    if (z) z.classList.remove('survol');
    if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files.length) {
      importer(ev.dataTransfer.files);
    }
  });

  /* ── CHARGEMENT ────────────────────────────────────────────────────────── */
  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('photos:donnees', [{ q: Q, tri: TRI, page: PAGE, taille: 24 }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('Photothèque indisponible', expliquer(r)); return; }
      D = r;
      /* La photo ouverte est RELUE dans la nouvelle liste : sans cela, le
         panneau afficherait encore l etat d avant le geste. */
      if (DETAIL) {
        var maj = (D.lignes || []).filter(function(x){ return x.id === DETAIL.id; })[0];
        if (maj) DETAIL = maj;
      }
      var s = document.getElementById('sous');
      if (s) s.textContent = D.total + ' photo' + (D.total > 1 ? 's' : '') + ' · ' + poids(D.poidsTotal);
      if (garderSaisie) redessinerSansPerdreLaSaisie();
      else dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('p-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('p-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  /* ⚠ ACTUALISATION POUSSEE — jamais pendant un import, pendant une saisie ni
     sous un panneau ouvert : on redessinerait sous les doigts. */
  window.szActualiser = function(){
    if (OCCUPE || DETAIL) return;
    var q = document.getElementById('p-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ if (!OCCUPE && !DETAIL) charger(); };

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
      if (DETAIL) { fermerDetail(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pagePhotos };
