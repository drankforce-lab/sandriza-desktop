'use strict';

/*
 * FENÊTRE « RÉSEAUX SOCIAUX » — NATIVE (1.70.0, palier 4)
 * =============================================================================
 * La FILE d'attente et l'HISTORIQUE des publications : quatre compteurs, chaque
 * entrée avec son contenu et ses réseaux, publier une entrée ou toute la file,
 * ignorer, vider le journal.
 *
 * ⚠⚠ LES PATRONS DE PUBLICATION SONT ICI DEPUIS #33. Cet en-tête disait qu'ils
 * « restaient à l'écran web et suivraient avec la Configuration, au palier 5 ».
 * Les jetons ont suivi (3.7.0) ; les patrons, jamais — et l'écran web ne
 * s'ouvre plus depuis que cette section est ancrable. Ils sont donc restés
 * joignables NULLE PART, comme la configuration du chat. Trouvé par l'audit
 * de couverture (#32).
 * ⚠ Ils vivent dans la fenêtre des OPÉRATIONS, pas dans celle de la
 * configuration : on ajuste un patron en regardant la file qu'il produit.
 * Les COMPTES et JETONS, eux, restent dans Configuration → Communications.
 *
 * ⚠ PUBLIER ENGAGE L'EXTÉRIEUR. Le message part chez Facebook, Instagram ou X
 * et ne se rattrape pas : le bouton s'arme en deux clics, et le verdict est
 * donné RÉSEAU PAR RÉSEAU. Annoncer « publié » sur un envoi partiel enverrait
 * chercher longtemps une publication qui n'est jamais partie.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v11)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err)}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
button .n.hi{background:rgba(245,158,11,.25);color:var(--tx-att)}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:var(--f-carte);border:1px solid var(--v08);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.att{color:var(--tx-att)}.tuile .val.bon{color:var(--tx-ok)}.tuile .val.err{color:var(--tx-err)}
.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:var(--tx2);font-weight:700}
.entree{border-top:1px solid var(--v05);padding:.5rem .1rem}
.entree:first-of-type{border-top:0}
.entree .haut{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.entree .droite{margin-left:auto;display:flex;gap:.35rem;align-items:center}
.entree .texte{font-size:.84rem;white-space:pre-wrap;overflow-wrap:anywhere;
  margin-top:.25rem;color:var(--tx-bleute);max-height:5.5rem;overflow:auto}
.res{display:inline-flex;gap:.3rem;align-items:center}
.res span{font-size:1rem}
.dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx2)}
.detail{margin-top:.35rem;display:flex;gap:.4rem;flex-wrap:wrap}
/* ── Editeur de patron (#33) ── */
label.champ{display:block;margin:0 0 .7rem}
label.champ .lbl{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;
  color:var(--tx2);margin:0 0 .22rem}
label.champ .sub{display:block;font-size:.68rem;color:var(--tx3);margin:.2rem 0 0;line-height:1.5}
input.t,select.t,textarea.t{width:100%;background:var(--f-champ);border:1px solid #2b3444;border-radius:8px;
  color:var(--tx);font:inherit;font-size:.85rem;padding:.4rem .55rem}
textarea.t{resize:vertical;line-height:1.5}
input.t:focus,select.t:focus,textarea.t:focus{outline:none;border-color:#c9a97e}
.cases{display:flex;flex-wrap:wrap;gap:.5rem}
label.case{display:inline-flex;align-items:center;gap:.35rem;font-size:.82rem;cursor:pointer;
  border:1px solid var(--v11);border-radius:9px;padding:.25rem .55rem;
  background:var(--v03);-webkit-user-select:none;user-select:none}
label.case input{width:15px;height:15px;accent-color:#c9a97e}
.vide{padding:1.3rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Réseaux sociaux ».
 * `onglet` = 'historique' ou 'patrons' pour ouvrir directement dessus.
 * ⚠ Sans ce paramètre, le garde-fou ne verrait QUE la file : il ne simule aucun
 * clic, et l'onglet des patrons — celui qui avait disparu — resterait dans
 * l'ombre exactement comme avant.
 */
function pageSociaux(onglet) {
  const depart = (['historique', 'patrons'].indexOf(String(onglet || '')) >= 0) ? String(onglet) : 'file';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Réseaux sociaux — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.social}</span><h1>Réseaux sociaux</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}${JS_BROUILLON}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var ONGLET = '${depart}';  // file | historique | patrons
  var ARME = '';             // id arme pour publication, ou '__tout', ou '__vider'
  var OCCUPE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux réseaux sociaux.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette publication n’existe plus.',
    file_vide:          'Il n’y a rien à publier.',
    publication:        'La publication a échoué.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 160)) + ')';
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

  var LIB = { published: 'Publiée', partial: 'Partielle', failed: 'Échouée',
              skipped: 'Ignorée', pending: 'En attente' };
  var TONS = { published: 'bon', partial: 'att', failed: 'err',
               skipped: 'neutre', pending: 'att' };

  function reseaux(list){
    if (!list.length) return '<span class="dt">aucun réseau</span>';
    return '<span class="res">' + list.map(function(r){
      return '<span title="' + esc(r.nom) + '">' + esc(r.icone || r.nom) + '</span>';
    }).join('') + '</span>';
  }

  /* Le detail PAR RESEAU : c est lui qui distingue << tout est parti >> de
     << deux sur trois >>. Sans lui, une publication partielle passe pour un
     succes et l on cherche longtemps ce qui n est jamais parti. */
  function detailResultats(rs){
    if (!rs || !rs.length) return '';
    return '<div class="detail">' + rs.map(function(x){
      return '<span class="pill ' + (x.ok ? 'bon' : 'err') + '" title="' + esc(x.detail || '') + '">'
        + esc(x.reseau) + (x.ok ? ' ✓' : ' ✕') + '</span>';
    }).join('') + '</div>';
  }

  function entree(e, avecGestes){
    var h = '<div class="entree"><div class="haut">'
      + '<strong>' + esc(e.patron || 'Publication') + '</strong>'
      + '<span class="pill ' + (TONS[e.statut] || 'neutre') + '">' + esc(LIB[e.statut] || e.statut) + '</span>'
      + reseaux(e.reseaux || [])
      + (e.image ? '<span class="pill neutre">image</span>' : '')
      + '<span class="droite">';
    if (avecGestes && D.peutModifier) {
      h += '<button class="mini geste prim" data-publier="' + esc(e.id) + '">'
        + (ARME === e.id ? 'Confirmer l’envoi ?' : 'Publier') + '</button>'
        + '<button class="mini geste" data-ignorer="' + esc(e.id) + '">Ignorer</button>';
    }
    h += '<span class="dt">' + esc(e.partie || e.creee) + '</span>'
      + '</span></div>'
      + '<div class="texte">' + esc(e.contenu || '') + '</div>'
      + detailResultats(e.resultats)
      + '</div>';
    return h;
  }

  /* ══ PATRONS DE PUBLICATION (#33) ═══════════════════════════════════════════
     ⚠ ILS N ETAIENT JOIGNABLES NULLE PART. L en-tete de ce fichier promettait
     qu ils << suivraient avec la Configuration, au palier 5 >> ; les jetons ont
     suivi en 3.7.0, les patrons jamais — et l ecran web ne s ouvre plus depuis
     que cette section est ancrable (1.70.0). Trouve par l audit #32.
     ⚠ ILS VIVENT ICI ET NON DANS LA FENETRE DE CONFIGURATION : on ajuste un
     patron en regardant la file qu il produit, pas en saisissant un jeton.
     ⚠ UN PATRON FOURNI D ORIGINE NE SE SUPPRIME PAS, il se desactive : le
     retirer le ferait reapparaitre au prochain chargement, puisque la liste
     enregistree est FUSIONNEE avec les defauts. Le coeur refuse, on le dit. */
  var PAT = null;        // patrons:liste
  var EDIT = null;       // patron en cours d edition, ou 'nouveau'
  var PAT_ARME = '';     // suppression armee

  function vuePatrons(){
    if (!PAT) return '<div class="carte"><div class="vide">Lecture des patrons…</div></div>';
    if (EDIT) return vuePatronEditeur();
    var l = PAT.patrons || [];
    var h = '<div class="carte">';
    if (PAT.peutEcrire) {
      h += '<div style="text-align:right;margin-bottom:.4rem">'
        + '<button class="mini prim" id="pa-nouveau">+ Nouveau patron</button></div>';
    }
    if (!l.length) { h += '<div class="vide">Aucun patron.</div></div>'; return h; }
    h += l.map(function(p){
      return '<div class="entree">'
        + '<div class="haut"><strong>' + esc(p.nom) + '</strong>'
        + '<span class="pill ' + (p.actif ? 'bon' : 'neutre') + '">' + (p.actif ? 'actif' : 'inactif') + '</span>'
        + (p.defaut ? '<span class="pill neutre">fourni</span>' : '')
        + '<span class="droite"><span class="dt">' + esc(p.declencheurLibelle) + '</span></span></div>'
        + '<div class="dt" style="white-space:pre-wrap;overflow-wrap:anywhere">'
        /* ⚠ DOUBLE ANTISLASH OBLIGATOIRE : ce script vit dans un litteral de
           gabarit, ou un antislash-n simple devient un VRAI saut de ligne. La
           regex se retrouvait coupee en deux — << Invalid regular expression >>,
           attrape par le banc a l instant meme ou j ai ecrit cette ligne. */
        + esc(String(p.gabarit).replace(/\\n/g, ' ').slice(0, 120))
        + (String(p.gabarit).length > 120 ? '…' : '') + '</div>'
        + '<div class="dt">' + (p.reseaux.length
            ? p.reseaux.map(function(r){ return '<span class="pill neutre">' + esc(r) + '</span>'; }).join('')
            : '<span class="pill neutre">aucun réseau</span>')
          + (p.motsCles.length ? ' <span class="dt">#' + p.motsCles.map(esc).join(' #') + '</span>' : '')
          + '</div>'
        + '<div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.3rem">'
        + '<button class="mini" data-apercu="' + esc(p.id) + '">Aperçu</button>'
        + (PAT.peutEcrire
            ? '<button class="mini" data-modifier="' + esc(p.id) + '">Modifier</button>'
              + '<button class="mini" data-bascule="' + esc(p.id) + '">' + (p.actif ? 'Désactiver' : 'Activer') + '</button>'
              + (p.defaut ? ''
                  : '<button class="mini danger" data-patsuppr="' + esc(p.id) + '">'
                    + (PAT_ARME === p.id ? 'Confirmer ?' : 'Supprimer') + '</button>')
            : '')
        + '</div></div>';
    }).join('');
    h += '</div>';
    return h;
  }

  function vuePatronEditeur(){
    var p = (EDIT === 'nouveau')
      ? { id: '', nom: '', gabarit: '', declencheur: 'manual', reseaux: [], motsCles: [], image: true, actif: true }
      : (PAT.patrons || []).find(function(x){ return x.id === EDIT; });
    if (!p) { EDIT = null; return vuePatrons(); }
    var h = '<div class="carte">'
      + '<div class="haut" style="margin-bottom:.5rem"><strong>'
      + (EDIT === 'nouveau' ? 'Nouveau patron' : 'Modifier « ' + esc(p.nom) + ' »') + '</strong></div>'
      + '<label class="champ"><span class="lbl">Nom du patron</span>'
      + '<input class="t" id="pa-nom" value="' + esc(p.nom) + '" placeholder="Annonce d’un nouveau produit"></label>'
      + '<label class="champ"><span class="lbl">Déclencheur</span><select class="t" id="pa-decl">'
      + (PAT.declencheurs || []).map(function(d){
          return '<option value="' + esc(d.v) + '"' + (p.declencheur === d.v ? ' selected' : '') + '>'
            + esc(d.l) + '</option>'; }).join('')
      + '</select></label>'
      + '<label class="champ"><span class="lbl">Réseaux</span><span class="cases">'
      + (PAT.reseaux || []).map(function(r){
          return '<label class="case"><input type="checkbox" data-net="' + esc(r.v) + '"'
            + (p.reseaux.indexOf(r.v) >= 0 ? ' checked' : '') + '> ' + esc(r.icone) + ' ' + esc(r.l) + '</label>';
        }).join('')
      + '</span></label>'
      + '<label class="champ"><span class="lbl">Texte publié</span>'
      + '<textarea class="t" id="pa-gab" rows="5">' + esc(p.gabarit) + '</textarea>'
      + '<span class="sub">Variables : '
      + (PAT.variables || []).map(function(v){ return esc(v.v) + ' (' + esc(v.l) + ')'; }).join(' · ')
      + '</span></label>'
      + '<label class="champ"><span class="lbl">Mots-clics</span>'
      + '<input class="t" id="pa-tags" value="' + esc(p.motsCles.join(', ')) + '" placeholder="mode, quebec, nouveaute">'
      + '<span class="sub">Séparés par des virgules, sans le croisillon.</span></label>'
      + '<label class="case"><input type="checkbox" id="pa-img"' + (p.image ? ' checked' : '')
      + '> Joindre l’image du produit</label>'
      + '<div style="display:flex;gap:.4rem;margin-top:.7rem">'
      + '<button class="mini prim" id="pa-enr">Enregistrer</button>'
      + '<button class="mini" id="pa-annuler">Annuler</button></div>'
      + '</div>';
    return h;
  }

  function brancherPatrons(){
    var n = document.getElementById('pa-nouveau');
    if (n) n.onclick = function(){ EDIT = 'nouveau'; dessiner(); szBrouillonProposer(); };
    var a = document.getElementById('pa-annuler');
    /* ⚠ << Annuler >> N EFFACE PAS LE BROUILLON : la personne ferme son
       formulaire, elle ne declare pas jeter son texte. Il lui sera propose a la
       reouverture, et la boite de reprise a son bouton pour repartir a neuf. */
    if (a) a.onclick = function(){ szBrouillonMaintenant(); EDIT = null; dessiner(); dire(''); };
    var e = document.getElementById('pa-enr');
    if (e) e.onclick = enregistrerPatron;
  }

  /* ══ LE BROUILLON D UN PATRON DE PUBLICATION ═══════════════════
     C est le formulaire ou l on perd le plus : le gabarit est du TEXTE LIBRE, une
     annonce redigee mot a mot, avec ses mots-cles. Rien ne le gardait — le bouton
     Annuler remettait EDIT a null et redessinait par-dessus.
     ⚠ LA CLE DISTINGUE LE NOUVEAU PATRON DE CHAQUE PATRON EXISTANT. Sans elle,
     un texte laisse sur un patron serait propose sur le suivant, et l on
     publierait l annonce d un produit sous le nom d un autre.
     ⚠ LES RESEAUX SONT DES CASES SANS IDENTIFIANT (attribut data-net) : elles ne
     passent pas par l aide generique, d ou la liste explicite. */
  var BR_CHAMPS = ['pa-nom', 'pa-decl', 'pa-gab', 'pa-tags'];
  function brNets(){
    var l = document.querySelectorAll('[data-net]'), r = [];
    for (var i = 0; i < l.length; i++) if (l[i].checked) r.push(l[i].getAttribute('data-net'));
    return r;
  }
  szBrouillonBrancher({
    portee: 'patron-social',
    libelle: 'Un patron de publication',
    ttlMin: 720,
    cle: function(){ return EDIT ? (EDIT === 'nouveau' ? '__new__' : ('p:' + EDIT)) : ''; },
    actif: function(){ return !!EDIT && !!document.getElementById('pa-nom'); },
    valeurs: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, ['pa-img']);
      if (v) v._nets = brNets();
      return v;
    },
    rempli: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, ['pa-img']); if (!v) return false;
      return szBrouillonQuelqueChose(v, ['pa-nom', 'pa-gab', 'pa-tags']);
    },
    remplir: function(v){
      szBrouillonAuDom(v);
      var nets = v._nets || [];
      var l = document.querySelectorAll('[data-net]');
      for (var i = 0; i < l.length; i++) l[i].checked = nets.indexOf(l[i].getAttribute('data-net')) >= 0;
    },
  });
  szBrouillonEcouter();

  function enregistrerPatron(){
    var v = function(id){ var el = document.getElementById(id); return el ? el.value : ''; };
    var nets = [];
    var cs = document.querySelectorAll('[data-net]');
    for (var i = 0; i < cs.length; i++) if (cs[i].checked) nets.push(cs[i].getAttribute('data-net'));
    var img = document.getElementById('pa-img');
    dire('Enregistrement…');
    appeler('patrons:ecrire', [{
      id: EDIT === 'nouveau' ? '' : EDIT,
      nom: v('pa-nom'), gabarit: v('pa-gab'), declencheur: v('pa-decl'),
      reseaux: nets, motsCles: v('pa-tags'), image: !!(img && img.checked)
    }]).then(function(r){
      if (!r || !r.ok) { dire('Échec : ' + expliquer(r), 'err'); return; }
      szBrouillonJeter(); PAT = r; EDIT = null; dessiner();
      dire('Patron enregistré.', 'bon');
    });
  }

  /* ⚠ LU A LA DEMANDE, comme le profil fiscal : on ne fait pas attendre la file
     des publications pour une liste qu on ouvre rarement. */
  function chargerPatrons(){
    if (PAT) return;
    appeler('patrons:liste', []).then(function(r){
      if (!r || !r.ok) { dire('Patrons illisibles : ' + expliquer(r), 'err'); return; }
      PAT = r;
      if (ONGLET === 'patrons') dessiner();
    });
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var t = D.tuiles || {};
    if (sous) {
      sous.innerHTML = (D.reseauxActifs || []).length
        ? (D.reseauxActifs || []).map(function(r){
            return '<span title="' + esc(r.nom) + '">' + esc(r.icone || '') + '</span>';
          }).join(' ')
        : '<span class="pill neutre">aucun réseau branché</span>';
    }

    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">En attente</div><div class="val att">' + (t.enAttente || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Publiées</div><div class="val bon">' + (t.publiees || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Échouées</div><div class="val err">' + (t.echouees || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Ignorées</div><div class="val">' + (t.ignorees || 0) + '</div></div>'
      + '</div>';

    h += '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'file' ? ' actif' : '') + '" data-onglet="file">File d’attente'
      + ((D.file || []).length ? '<span class="n hi">' + D.file.length + '</span>' : '') + '</button>'
      + '<button class="mini' + (ONGLET === 'historique' ? ' actif' : '') + '" data-onglet="historique">Historique'
      + ((D.historique || []).length ? '<span class="n">' + D.historique.length + '</span>' : '') + '</button>'
      + '<button class="mini' + (ONGLET === 'patrons' ? ' actif' : '') + '" data-onglet="patrons">Patrons'
      + (PAT && (PAT.patrons || []).length
          ? '<span class="n">' + PAT.patrons.filter(function(p){ return p.actif; }).length + '</span>' : '')
      + '</button>'
      + '<div class="droite"><span class="dt">Comptes et jetons des réseaux : '
      + 'Configuration → Communications → Réseaux sociaux</span>';
    if (ONGLET === 'file' && D.peutModifier && (D.file || []).length) {
      h += '<button class="mini prim" id="so-tout"' + (OCCUPE ? ' disabled' : '') + '>'
        + (OCCUPE ? 'Publication…' : (ARME === '__tout' ? 'Confirmer — tout publier ?' : 'Tout publier')) + '</button>';
    }
    if (ONGLET === 'historique' && D.peutModifier && (D.historique || []).length) {
      h += '<button class="mini danger" id="so-vider">'
        + (ARME === '__vider' ? 'Confirmer ?' : 'Vider le journal') + '</button>';
    }
    h += '</div></div>';

    if (ONGLET === 'patrons') {
      h += vuePatrons();
    } else {
      var pile = ONGLET === 'file' ? (D.file || []) : (D.historique || []);
      h += '<div class="carte">';
      if (!pile.length) {
        h += '<div class="vide">' + (ONGLET === 'file'
          ? 'Aucune publication en attente.' : 'Rien au journal pour l’instant.') + '</div>';
      } else {
        h += pile.map(function(e){ return entree(e, ONGLET === 'file'); }).join('');
      }
      h += '</div>';
    }

    corps.innerHTML = h;
    if (ONGLET === 'patrons') brancherPatrons();

    var bt = document.getElementById('so-tout');
    if (bt) bt.onclick = function(){
      if (ARME !== '__tout') {
        ARME = '__tout'; dessiner();
        dire('Cliquez de nouveau pour publier toute la file — les messages partent chez les réseaux et ne se rattrapent pas.', 'att');
        return;
      }
      ARME = ''; OCCUPE = true; dessiner();
      dire('Publication de la file…', 'att');
      appeler('sociaux:publierTout', []).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        var bilan = r.completes + ' publiée' + (r.completes > 1 ? 's' : '')
          + (r.partielles ? ', ' + r.partielles + ' partielle' + (r.partielles > 1 ? 's' : '') : '')
          + (r.echecs ? ', ' + r.echecs + ' en échec' : '')
          + ' sur ' + r.tentees + '.';
        dire(bilan, (r.partielles || r.echecs) ? 'att' : 'bon');
        ONGLET = 'historique';
        charger();
      });
    };

    var bv = document.getElementById('so-vider');
    if (bv) bv.onclick = function(){
      if (ARME !== '__vider') {
        ARME = '__vider'; dessiner();
        dire('Cliquez « Confirmer ? » — le journal est effacé, mais les publications restent en ligne sur les réseaux.', 'att');
        return;
      }
      ARME = '';
      appeler('sociaux:viderHistorique', []).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(r.efface + ' entrée' + (r.efface > 1 ? 's effacées' : ' effacée') + ' du journal.', 'bon');
        charger();
      });
    };
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;

    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); ARME = ''; PAT_ARME = ''; EDIT = null;
      dessiner(); if (ONGLET === 'patrons') chargerPatrons(); return; }

    var pm = t.closest('[data-modifier]');
    if (pm) { EDIT = pm.getAttribute('data-modifier'); dessiner(); szBrouillonProposer(); return; }
    var pb = t.closest('[data-bascule]');
    if (pb) {
      var idB = pb.getAttribute('data-bascule');
      var cur = (PAT.patrons || []).find(function(x){ return x.id === idB; });
      dire('…');
      appeler('patrons:basculer', [idB, !(cur && cur.actif)]).then(function(r){
        if (!r || !r.ok) { dire('Echec : ' + expliquer(r), 'err'); return; }
        PAT = r; dessiner(); dire(cur && cur.actif ? 'Patron desactive.' : 'Patron active.', 'bon');
      });
      return;
    }
    var ps = t.closest('[data-patsuppr]');
    if (ps) {
      var idS = ps.getAttribute('data-patsuppr');
      if (PAT_ARME !== idS) {
        PAT_ARME = idS; dessiner();
        dire('Recliquez pour confirmer — le gabarit disparait. Les publications deja faites ne bougent pas.', 'att');
        return;
      }
      PAT_ARME = '';
      appeler('patrons:supprimer', [idS]).then(function(r){
        if (!r || !r.ok) { dessiner(); dire('Echec : ' + expliquer(r), 'err'); return; }
        PAT = r; dessiner(); dire('Patron supprime.', 'bon');
      });
      return;
    }
    var pa = t.closest('[data-apercu]');
    if (pa) {
      dire('Composition de l’aperçu…');
      appeler('patrons:apercu', [pa.getAttribute('data-apercu')]).then(function(r){
        if (!r || !r.ok) { dire('Echec : ' + expliquer(r), 'err'); return; }
        /* ⚠ L APERCU SE LIT DANS L ECRAN, pas dans le bandeau : un texte de
           publication tient sur plusieurs lignes, et le bandeau en montrerait
           la premiere moitie avec des points de suspension. */
        var z = document.createElement('div');
        z.className = 'carte';
        z.style.marginTop = '.5rem';
        z.innerHTML = '<div class="haut"><strong>Aperçu — ' + esc(r.nom) + '</strong>'
          + '<span class="droite"><span class="dt">'
          + (r.produit ? 'exemple : ' + esc(r.produit) : 'aucun produit actif pour l’exemple')
          + '</span></span></div>'
          + '<div class="dt" style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:.85rem;color:var(--tx)">'
          + esc(r.texte) + '</div>'
          + '<div class="dt" style="margin-top:.3rem">' + (r.reseaux.length
              ? r.reseaux.map(function(x){ return '<span class="pill neutre">' + esc(x) + '</span>'; }).join('')
              : '<span class="pill att">aucun réseau — ce patron ne publiera nulle part</span>') + '</div>';
        var anc = pa.closest('.entree');
        if (anc && anc.parentNode) anc.parentNode.insertBefore(z, anc.nextSibling);
        dire('');
      });
      return;
    }

    var bp = t.closest('[data-publier]');
    if (bp) {
      var idP = bp.getAttribute('data-publier');
      /* ARME EN DEUX CLICS : le message part a l exterieur et ne revient pas. */
      if (ARME !== idP) {
        ARME = idP; dessiner();
        dire('Cliquez « Confirmer l’envoi ? » — la publication part chez les réseaux et ne se rattrape pas.', 'att');
        return;
      }
      ARME = '';
      bp.disabled = true;
      dire('Publication…', 'att');
      appeler('sociaux:publier', [idP]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        if (r.complet) {
          dire('« ' + (r.patron || '') + ' » publiée sur tous les réseaux.', 'bon');
        } else {
          var rates = (r.resultats || []).filter(function(x){ return !x.ok; })
            .map(function(x){ return x.reseau; }).join(', ');
          dire('Envoi partiel — ' + (rates || 'un réseau') + ' n’a pas reçu la publication. Voir le journal.', 'att');
        }
        charger();
      });
      return;
    }

    var bi = t.closest('[data-ignorer]');
    if (bi) {
      ARME = '';
      bi.disabled = true;
      appeler('sociaux:ignorer', [bi.getAttribute('data-ignorer')]).then(function(r){
        if (!r.ok) { bi.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('« ' + (r.patron || '') + ' » retirée de la file.', 'bon');
        charger();
      });
      return;
    }

    /* ⚠⚠ UN CLIC SUR UN BOUTON NE DOIT PAS DÉSARMER CE QU'IL VIENT D'ARMER.
       Les boutons branches par la fonction de branchement posent l armement,
       puis le clic REMONTE jusqu ici : la ligne de desarmement ci-dessous
       s executait dans la foulee, et le bouton revenait a son libelle
       d origine : on voyait l avertissement sans jamais voir Confirmer ?
       (2026-08-09). Un clic sur une commande est traite par SA commande. */
    if (t.closest('button, input, select, label')) return;
    if (ARME) { ARME = ''; dessiner(); }
  });

  function charger(){
    appeler('sociaux:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Réseaux sociaux indisponibles', expliquer(r)); return; }
      D = r;
      dessiner();
      if (ONGLET === 'patrons') chargerPatrons();
    });
  }

  window.szActualiser = function(){ if (!OCCUPE && !ARME) charger(); };
  window.szRevenir = function(){ if (!OCCUPE) charger(); };

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
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);'
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto');
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
      if (ARME) { ARME = ''; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageSociaux };
