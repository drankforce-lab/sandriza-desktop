'use strict';

/*
 * FENÊTRE « AVIS PRODUITS » — NATIVE
 * =============================================================================
 * La modération : deux onglets (EN ATTENTE = la file de travail, TRAITÉS =
 * l'historique), recherche nom ou numéro de commande, note, période. Cliquer
 * une ligne ouvre le PANNEAU DE DÉTAIL dans la fenêtre : le texte entier, la
 * réponse, et les gestes — Approuver, Masquer/Republier, Répondre, Supprimer
 * (armé en deux clics). Les gestes sont les MÊMES cœurs que l'écran du site
 * (Admin._avisApprouverCoeur…), miroir local puis serveur, verdict honnête.
 *
 * Les PHOTOS s'affichent en vignettes et se retirent une par une (#33).
 * ⚠ CE GESTE A MANQUÉ LONGTEMPS, et cette fenêtre en portait le mensonge : elle
 * annonçait « Photos : 3 — gérées à l'écran web » en désignant un écran que
 * personne ne peut plus ouvrir, `reviews` étant ancrable depuis la 1.58.0.
 * Trouvé par l'audit de couverture (#32).
 * ⚠ LES VIGNETTES SONT DES <img>, JAMAIS UN fetch : une balise image n'a pas
 * besoin de CORS, un `fetch` vers R2 échouerait sans un mot.
 * ⚠ ON RETIRE UNE PHOTO, ON NE MASQUE PAS L'AVIS. Un visage de tiers ou un
 * intérieur de domicile ne justifie pas de punir une cliente qui a bien fait
 * son travail. L'objet R2 est détruit APRÈS l'écriture, jamais avant.
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
input[type=search],select,button,textarea{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:220px}
select,button{cursor:pointer}
textarea{width:100%;min-height:4.2em;resize:vertical}
input:focus,select:focus,button:focus,textarea:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
button .n.hi{background:rgba(245,158,11,.25);color:#fbbf24}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:rgba(255,255,255,.04)}
tbody td{padding:.34rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:#8fa1b8}
.etoile{color:#c9a97e;font-weight:800}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:#8fa1b8}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:40rem;width:100%;max-height:84vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .5rem;font:700 .98rem/1.3 Georgia,serif;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.boite .grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.5rem;
  padding:.55rem 0;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);
  margin-bottom:.6rem}
.boite .grille .l{font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}
.boite .grille .v{font-size:.84rem;font-weight:600}
.boite .texte{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.88rem;line-height:1.55;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:.6rem .7rem}
.boite .photos{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 .6rem}
.boite .ph{position:relative;width:86px;height:86px;border-radius:9px;overflow:hidden;
  border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05)}
.boite .ph img{width:100%;height:100%;object-fit:cover;display:block}
.boite .phx{position:absolute;top:3px;right:3px;width:22px;height:22px;padding:0;line-height:1;
  border-radius:50%;background:rgba(6,10,18,.78);border:1px solid rgba(239,68,68,.6);
  color:#f87171;font-size:.76rem;font-weight:700;cursor:pointer}
.boite .phx:hover{background:rgba(239,68,68,.28)}
.boite .phmort{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  color:#6d7f96;font-size:1.5rem}
.boite .reponse{margin-top:.6rem;border-left:3px solid #c9a97e;padding:.4rem .7rem;
  background:rgba(201,169,126,.07);border-radius:0 9px 9px 0;font-size:.85rem}
.boite .pied-boite{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.75rem;justify-content:flex-end}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Avis produits ».
 * `ouverture` = un identifiant d'avis pour ouvrir directement son panneau.
 * ⚠ Le panneau de détail s'atteint par un CLIC, que le garde-fou ne fait pas :
 * sans ce paramètre, les VIGNETTES DE PHOTOS — le geste qui manquait — ne
 * seraient jamais dessinées pendant le contrôle.
 */
function pageAvis(ouverture) {
  const ouv = String(ouverture || '');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Avis produits — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">⭐</span><h1>Avis produits</h1>
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
  var ONGLET = 'pending';   // pending | done
  var ETAT = '';            // '' | published | hidden (onglet done seulement)
  var Q = '';
  var NOTE = '';
  var PER = '';
  var PAGE = 0;
  var TAILLE = 20;
  var DETAIL = null;         // l avis ouvert (avis:lire)
  var OUVERTURE = ${JSON.stringify(ouv)};
  var SUPPR_ARME = false;    // Supprimer attend une confirmation
  var PHOTO_ARMEE = -1;      // retrait d une photo : index arme, -1 = aucun
  var REPONDRE = false;      // le champ de reponse est ouvert

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux avis.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cet avis n’existe plus.',
    moderation:         'Le geste a échoué.',
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

  var ETATS = { pending: ['att', 'En attente'], published: ['bon', 'Publié'], hidden: ['neutre', 'Masqué'] };
  function pastille(st){
    var e = ETATS[st] || ETATS.hidden;
    return '<span class="pill ' + e[0] + '">' + e[1] + '</span>';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var c = D.comptes || {};
    var h = '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'pending' ? ' actif' : '') + '" data-onglet="pending">'
      + 'En attente<span class="n' + (c.attente > 0 ? ' hi' : '') + '">' + (c.attente || 0) + '</span></button>'
      + '<button class="mini' + (ONGLET === 'done' ? ' actif' : '') + '" data-onglet="done">'
      + 'Traités<span class="n">' + (c.traites || 0) + '</span></button>'
      + (ONGLET === 'done'
          ? '<select id="a-etat">'
            + '<option value=""' + (ETAT === '' ? ' selected' : '') + '>Approuvés et refusés</option>'
            + '<option value="published"' + (ETAT === 'published' ? ' selected' : '') + '>Approuvés</option>'
            + '<option value="hidden"' + (ETAT === 'hidden' ? ' selected' : '') + '>Refusés / masqués</option>'
            + '</select>'
          : '')
      + '<input type="search" id="a-q" placeholder="Nom ou n° de commande…" value="' + esc(Q) + '">'
      + '<select id="a-note"><option value=""' + (NOTE === '' ? ' selected' : '') + '>Toutes les notes</option>'
      + [5, 4, 3, 2, 1].map(function(n){
          return '<option value="' + n + '"' + (String(NOTE) === String(n) ? ' selected' : '') + '>' + n + ' ★</option>';
        }).join('')
      + '</select>'
      + '<select id="a-per"><option value=""' + (PER === '' ? ' selected' : '') + '>Toutes les dates</option>'
      + '<option value="7"' + (PER === '7' ? ' selected' : '') + '>7 derniers jours</option>'
      + '<option value="30"' + (PER === '30' ? ' selected' : '') + '>30 derniers jours</option>'
      + '<option value="90"' + (PER === '90' ? ' selected' : '') + '>90 derniers jours</option>'
      + '<option value="365"' + (PER === '365' ? ' selected' : '') + '>Cette année</option>'
      + '</select>'
      + '<span class="droite">'
      + (c.moyenne != null ? 'moyenne ' + c.moyenne + ' <span class="etoile">★</span> · ' : '')
      + (c.publies || 0) + ' publié' + ((c.publies || 0) > 1 ? 's' : '') + '</span>'
      + '</div>';

    h += '<div class="carte">';
    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">' + (ONGLET === 'pending'
        ? 'Rien à approuver. La file est vide.' : 'Aucun avis ne correspond à ces filtres.') + '</div>';
    } else {
      h += '<table><thead><tr><th>État</th><th>Note</th><th>Produit</th>'
        + '<th>Client</th><th>Date</th></tr></thead><tbody>'
        + rows.map(function(r){
            return '<tr data-id="' + esc(r.id) + '" title="Ouvrir l’avis">'
              + '<td>' + pastille(r.statut) + '</td>'
              + '<td><span class="etoile">' + r.note + '★</span></td>'
              + '<td><span class="num">' + esc(r.produit) + '</span></td>'
              + '<td>' + esc(r.client) + (r.verifie ? ' <span class="pill bon">achat vérifié</span>' : '') + '</td>'
              + '<td class="dt">' + esc(r.date) + '</td></tr>';
          }).join('')
        + '</tbody></table>';
      if ((D.pages || 1) > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="a-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="a-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';

    if (DETAIL) h += boiteDetail();
    corps.innerHTML = h;
    brancher();
  }

  function boiteDetail(){
    var r = DETAIL;
    var h = '<div class="voile" id="a-voile"><div class="boite">'
      + '<h3>' + pastille(r.statut) + ' <span class="etoile">' + r.note + '★</span> '
      + esc(r.produit) + '</h3>'
      + '<div class="grille">'
      + '<div><div class="l">Client</div><div class="v">' + esc(r.client)
      + (r.verifie ? ' <span class="pill bon">vérifié</span>' : '') + '</div></div>'
      + (r.commande ? '<div><div class="l">Commande</div><div class="v">' + esc(r.commande) + '</div></div>' : '')
      + (r.taille ? '<div><div class="l">Taille achetée</div><div class="v">' + esc(r.taille) + '</div></div>' : '')
      + '<div><div class="l">Langue</div><div class="v">' + esc(r.langue) + '</div></div>'
      + '<div><div class="l">Déposé le</div><div class="v">' + esc(r.date) + '</div></div>'
      + (r.approuveLe ? '<div><div class="l">Approuvé le</div><div class="v">' + esc(r.approuveLe) + '</div></div>' : '')
      + (r.photos ? '<div><div class="l">Photos</div><div class="v">' + r.photos + '</div></div>' : '')
      + '</div>'
      /* ⚠ LES VIGNETTES SONT DES <img>, PAS UN fetch. Une balise image n a pas
         besoin de CORS ; un fetch vers R2 echouerait sans un mot (voir
         [[reference_r2_never_fetch_from_page]]). L adresse morte retombe sur un
         cadre gris plutot que sur l icone d image brisee du navigateur. */
      + ((r.photosUrl && r.photosUrl.length)
          ? '<div class="photos">' + r.photosUrl.map(function(u, i){
              return '<div class="ph">'
                /* ⚠ alt VIDE : une adresse morte affichait le texte de
                   remplacement en travers de la vignette, ce qui ressemble a un
                   defaut de la fenetre plutot qu a une image introuvable. Le
                   repli se pose en JS, jamais dans un onerror= en ligne (une
                   apostrophe echappee y est avalee par le gabarit). */
                + '<img src="' + esc(u) + '" alt="" title="Photo ' + (i + 1) + ' de l’avis">'
                + (r.peutModifier
                    ? '<button class="phx" data-photo="' + i + '" title="Retirer cette photo de l’avis et du stockage">'
                      + (PHOTO_ARMEE === i ? '?' : '✕') + '</button>'
                    : '')
                + '</div>';
            }).join('') + '</div>'
          : '')
      + (r.titre ? '<div style="font-weight:700;margin-bottom:.35rem">' + esc(r.titre) + '</div>' : '')
      + '<div class="texte">' + esc(r.texte || '(aucun texte)') + '</div>'
      + (r.reponse
          ? '<div class="reponse"><div class="dt" style="font-size:.68rem;color:#8fa1b8;text-transform:uppercase;'
            + 'letter-spacing:.05em">Votre réponse' + (r.reponduLe ? ' · ' + esc(r.reponduLe) : '') + '</div>'
            + esc(r.reponse) + '</div>'
          : '');
    if (REPONDRE) {
      h += '<div style="margin-top:.6rem"><textarea id="a-reptxt" '
        + 'placeholder="Votre réponse sera affichée publiquement sous l’avis.">'
        + esc(r.reponse || '') + '</textarea>'
        + '<div class="pied-boite"><button id="a-repannuler">Annuler</button>'
        + '<button class="prim" id="a-repenvoyer">Enregistrer la réponse</button></div></div>';
    }
    h += '<div class="pied-boite">'
      + '<button class="danger" id="a-supprimer">' + (SUPPR_ARME ? 'Confirmer la suppression ?' : '<span class="ic">🗑</span> Supprimer') + '</button>'
      + (!REPONDRE ? '<button id="a-repondre"><span class="ic">💬</span> Répondre</button>' : '')
      + (r.statut !== 'pending'
          ? '<button id="a-masquer">' + (r.statut === 'hidden' ? '<span class="ic">👁</span> Republier' : '<span class="ic">🙈</span> Masquer') + '</button>'
          : '')
      + (r.statut === 'pending' ? '<button class="prim" id="a-approuver">✓ Approuver</button>' : '')
      + '<button id="a-fermer">Fermer</button>'
      + '</div></div></div>';
    return h;
  }

  /* ── RETIRER UNE PHOTO (#33) ───────────────────────────────────────────────
     ⚠ ARMEE EN DEUX CLICS et l avis reste ouvert : on retire souvent DEUX
     photos d affilee, et refermer le panneau a chaque fois obligerait a
     rouvrir l avis entre chaque geste.
     ⚠ ON RELIT L AVIS APRES COUP plutot que de retirer la vignette a la main :
     les index se decalent des qu une photo part, et un index perime ferait
     retirer la mauvaise image au clic suivant. */
  function retirerPhoto(i){
    if (!DETAIL) return;
    if (PHOTO_ARMEE !== i) {
      PHOTO_ARMEE = i; dessiner();
      dire('Recliquez pour confirmer — la photo quitte l’avis ET le stockage. Le texte reste intact.', 'att');
      return;
    }
    PHOTO_ARMEE = -1;
    var id = DETAIL.id;
    dire('Retrait…');
    appeler('avis:photoRetirer', [id, i]).then(function(r){
      if (!r.ok) { dessiner(); dire('Échec : ' + expliquer(r), 'err'); return; }
      appeler('avis:lire', [id]).then(function(d){
        if (d && d.ok) { DETAIL = d; }
        dessiner();
        dire(r.restantes ? ('Photo retirée — ' + r.restantes + ' restante'
              + (r.restantes > 1 ? 's' : '') + '.') : 'Photo retirée — il n’en reste aucune.', 'bon');
      });
    });
  }

  function geste(op, apres){
    dire('…');
    appeler(op, [DETAIL.id]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire(apres, 'bon');
      DETAIL = null; SUPPR_ARME = false; PHOTO_ARMEE = -1; REPONDRE = false;
      charger();
    });
  }

  function brancher(){
    var q = document.getElementById('a-q');
    if (q) {
      q.oninput = function(){
        Q = q.value; PAGE = 0;
        clearTimeout(window._aq);
        window._aq = setTimeout(function(){ charger(true); }, 300);
      };
    }
    var lie = function(id, fn){
      var e = document.getElementById(id);
      if (e) e.onchange = function(){ fn(e.value); PAGE = 0; charger(); };
    };
    lie('a-etat', function(v){ ETAT = v; });
    lie('a-note', function(v){ NOTE = v; });
    lie('a-per', function(v){ PER = v; });
    var bp = document.getElementById('a-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, (D.page || 0) - 1); charger(); };
    var bs = document.getElementById('a-suiv');
    if (bs) bs.onclick = function(){ PAGE = (D.page || 0) + 1; charger(); };

    var f = document.getElementById('a-fermer');
    if (f) f.onclick = function(){ DETAIL = null; SUPPR_ARME = false; PHOTO_ARMEE = -1; REPONDRE = false; dessiner(); };
    var ap = document.getElementById('a-approuver');
    if (ap) ap.onclick = function(){ geste('avis:approuver', 'Avis approuvé — il est maintenant visible en boutique.'); };
    var ma = document.getElementById('a-masquer');
    if (ma) ma.onclick = function(){
      geste('avis:masquer', DETAIL.statut === 'hidden' ? 'Avis republié.' : 'Avis masqué.');
    };
    var su = document.getElementById('a-supprimer');
    if (su) su.onclick = function(){
      /* Suppression DEFINITIVE : armee en deux clics — masquer suffit
         presque toujours, et c est dit dans la fenetre de detail du site. */
      if (!SUPPR_ARME) {
        SUPPR_ARME = true; dessiner();
        setTimeout(function(){ if (SUPPR_ARME) { SUPPR_ARME = false; if (DETAIL) dessiner(); } }, 4000);
        return;
      }
      SUPPR_ARME = false;
      geste('avis:supprimer', 'Avis supprimé définitivement.');
    };
    /* Une adresse morte devient un cadre neutre plutot qu une icone brisee. */
    var vgs = document.querySelectorAll('.ph img');
    for (var iv = 0; iv < vgs.length; iv++) vgs[iv].onerror = function(){
      var c = this.parentNode; if (!c) return;
      this.style.display = 'none';
      if (!c.querySelector('.phmort')) {
        var m = document.createElement('span');
        m.className = 'phmort'; m.textContent = '⃠';
        m.title = 'Image introuvable à cette adresse';
        c.appendChild(m);
      }
    };
    var phs = document.querySelectorAll('[data-photo]');
    for (var ip = 0; ip < phs.length; ip++) {
      phs[ip].onclick = function(){ retirerPhoto(Number(this.getAttribute('data-photo'))); };
    }
    var re = document.getElementById('a-repondre');
    if (re) re.onclick = function(){ REPONDRE = true; dessiner(); };
    var ra = document.getElementById('a-repannuler');
    if (ra) ra.onclick = function(){ REPONDRE = false; dessiner(); };
    var rv = document.getElementById('a-repenvoyer');
    if (rv) rv.onclick = function(){
      var t = document.getElementById('a-reptxt');
      var txt = t ? t.value : '';
      dire('Enregistrement…');
      appeler('avis:repondre', [DETAIL.id, txt]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Réponse enregistrée.', 'bon');
        REPONDRE = false;
        ouvrirDetail(DETAIL.id);
      });
    };
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); ETAT = ''; PAGE = 0; charger(); return; }
    if (t.closest('.boite')) return;
    var vo = t.closest('#a-voile');
    if (vo) { DETAIL = null; SUPPR_ARME = false; PHOTO_ARMEE = -1; REPONDRE = false; dessiner(); return; }
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-id]');
    if (tr) ouvrirDetail(tr.getAttribute('data-id'));
  };

  function ouvrirDetail(id){
    dire('Lecture…');
    appeler('avis:lire', [id]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('');
      DETAIL = r; SUPPR_ARME = false;
      dessiner();
    });
  }

  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('avis:liste', [{ onglet: ONGLET, etat: ETAT, q: Q, note: NOTE, per: PER,
      page: PAGE, taille: TAILLE }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('Avis indisponibles', expliquer(r)); return; }
      D = r;
      dire('');
      if (garderSaisie) redessinerSansPerdreLaSaisie();
      else dessiner();
      /* Ouverture directe sur un avis (id d ouverture) : une seule fois. */
      if (OUVERTURE && !DETAIL) { var o = OUVERTURE; OUVERTURE = ''; ouvrirDetail(o); }
    });
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('a-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('a-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE — jamais pendant une saisie ni
     pendant qu un avis est ouvert (on redessinerait sous les doigts). */
  window.szActualiser = function(){
    if (DETAIL || REPONDRE) return;
    var q = document.getElementById('a-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ if (!DETAIL) charger(); };

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
      if (DETAIL) { DETAIL = null; SUPPR_ARME = false; PHOTO_ARMEE = -1; REPONDRE = false; dessiner(); return; }
      P.fermer();
    }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageAvis };
