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

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('avis');

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
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow:hidden;
  display:flex;flex-direction:column;gap:.7rem}
/* << Aucun scroll bar dans l application >> (2026-10-12) : la liste ne defile
   plus, elle est BORNEE (carte pleine, liste flex) et sa hauteur reelle decide
   du nombre de lignes demandees au site (szAutoPagination). */
.corps.plein .carte.plein{flex:1 1 0;min-height:0}
.corps.plein .carte.plein>.liste{flex:1 1 auto;min-height:0;overflow:hidden}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input[type=search],select,button,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:220px}
select,button{cursor:pointer}
textarea{width:100%;min-height:4.2em;resize:vertical}
input:focus,select:focus,button:focus,textarea:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
button .n{display:inline-block;margin-left:.3rem;font-size:.6875rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
button .n.hi{background:rgba(245,158,11,.25);color:var(--tx-att)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:var(--v04)}
tbody td{padding:.34rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:var(--tx2)}
.etoile{color:var(--tx-or);font-weight:800}
/* ── La refonte de l Inventaire (2026-09-25) ── */
.tuiles{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.6rem;flex:0 0 auto}
.tuile{background:var(--f-carte);border:1px solid var(--v07);min-width:0}
.tuile .sub{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tuile.cliq{cursor:pointer;user-select:none;position:relative}
.tuile.cliq:hover{border-color:var(--or)}
.tuile.cliq::after{content:"›";position:absolute;top:.55rem;right:.8rem;font-size:1.1rem;color:var(--tx3)}
.tuile.on{border-color:var(--or)}
.val.att{color:var(--tx-att)}
.rf-tb select{height:2.4rem;border-radius:10px;background:var(--f-0f1826);border-color:var(--v10);max-width:12rem}
/* La note : le chiffre, puis cinq segments dessines (pas de glyphe etoile —
   un pictogramme hors de .ic enfreint la norme du noir et blanc). */
.etoiles{display:inline-flex;align-items:center;gap:.5rem;white-space:nowrap}
.etoiles b{font-size:.95rem}
.etoiles .seg{display:inline-flex;gap:3px}
.etoiles .seg i{width:10px;height:6px;border-radius:2px;background:var(--v12)}
.etoiles .seg i.p{background:var(--or)}
.pill{display:inline-block;font-size:.6875rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:var(--tx2)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:var(--f-carte2);border:1px solid var(--v14);border-radius:13px;
  max-width:40rem;width:100%;max-height:84vh;overflow:hidden;padding:.9rem 1rem;
  display:flex;flex-direction:column}
/* ⚠ LA BOITE NE DEFILE PLUS (2026-10-12) : un avis gonfle (douze photos, un
   texte de trois pages) la faisait defiler de 1500 px. Tout y garde sa taille,
   sauf le TEXTE, qui prend ce qui reste et se lit par pages (data-pages, par
   morceaux de paragraphe) ; les photos tiennent sur UNE rangee, en pages
   elles aussi. */
.boite>*{flex:0 0 auto}
.boite>.texte{flex:0 1 auto;min-height:4.8em}
.boite .texte p{margin:0 0 .45em;white-space:pre-wrap;overflow-wrap:anywhere}
.boite .texte p:last-child{margin-bottom:0}
.boite h3{margin:0 0 .5rem;font:700 .98rem/1.3 Georgia,serif;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.boite .grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.5rem;
  padding:.55rem 0;border-top:1px solid var(--v08);border-bottom:1px solid var(--v08);
  margin-bottom:.6rem}
.boite .grille .l{font-size:.6875rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2)}
.boite .grille .v{font-size:.84rem;font-weight:600}
.boite .texte{overflow-wrap:anywhere;font-size:.88rem;line-height:1.55;
  background:var(--v03);border:1px solid var(--v07);border-radius:9px;padding:.6rem .7rem}
.boite .photos{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 .6rem;height:86px}
.boite .ph{position:relative;width:86px;height:86px;border-radius:9px;overflow:hidden;
  border:1px solid var(--v14);background:var(--v05)}
.boite .ph img{width:100%;height:100%;object-fit:cover;display:block}
.boite .phx{position:absolute;top:3px;right:3px;width:22px;height:22px;padding:0;line-height:1;
  border-radius:50%;background:rgba(6,10,18,.78);border:1px solid rgba(239,68,68,.6);
  color:var(--tx-err);font-size:.76rem;font-weight:700;cursor:pointer}
.boite .phx:hover{background:rgba(239,68,68,.28)}
/* En jour la pastille passe au CLAIR : le rouge de jour (fonce) tombait a 2:1 sur le rond sombre. */
html.jour .boite .phx{background:rgba(255,255,255,.94)}
.boite .phmort{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  color:var(--tx3);font-size:1.5rem}
.boite .reponse{margin-top:.6rem;border-left:3px solid var(--or);padding:.4rem .7rem;
  background:rgba(var(--or-rgb),.07);border-radius:0 9px 9px 0;font-size:.85rem}
/* La reponse publiee se lit sur quatre lignes au plus ; le texte entier est
   dans la bulle, et le bouton Repondre le rouvre en entier dans le champ. */
.boite .reponse .rtx{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}
.boite .pied-boite{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.75rem;justify-content:flex-end}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}
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
  return `${TETE()}
<title>${T("Avis produits — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.star}</span><h1>${T("Avis produits")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES()}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;
  var ONGLET = 'pending';   // pending | done
  var ETAT = '';            // '' | published | hidden (onglet done seulement)
  var Q = '';
  var NOTE = '';
  var PER = '';
  var PAGE = 0;
  /* La taille de page est MESUREE (szAutoPagination, apres chaque dessin) :
     20 n est que le repli tant que la liste n a pas encore ete disposee. */
  var TAILLE = 20;
  var DETAIL = null;         // l avis ouvert (avis:lire)
  var OUVERTURE = ${JSON.stringify(ouv)};
  var SUPPR_ARME = false;    // Supprimer attend une confirmation
  var PHOTO_ARMEE = -1;      // retrait d une photo : index arme, -1 = aucun
  var REPONDRE = false;      // le champ de reponse est ouvert
  /* (2026-10-25, audit) Le texte de la reponse EN COURS : un redessin (photo retiree, etc.) reposait
     la reponse enregistree et jetait la frappe. null = rien tape depuis l ouverture du champ. */
  var REP_TXT = null;
  var OCCUPE = false;        // (2026-10-25, audit) un geste (approuver, masquer, supprimer) est parti

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux avis.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cet avis n’existe plus.")}',
    moderation:         '${T("Le geste a échoué.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
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

  /* La pastille a point (rf-pill, refonte du 2026-09-25) : ambre ce qui attend
     la moderation, vert ce qui est en boutique, gris ce qui en est retire. */
  var ETATS = { pending: ['ambre', '${T("En attente")}'], published: ['vert', '${T("Publié")}'], hidden: ['', '${T("Masqué")}'] };
  function pastille(st){
    var e = ETATS[st] || ETATS.hidden;
    return '<span class="rf-pill ' + e[0] + '">' + e[1] + '</span>';
  }
  function initiales(nom){
    var m = String(nom || '').trim().split(' ').filter(Boolean);
    if (!m.length) return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
  }
  // La note : le chiffre (arrondi pour les segments), puis cinq segments dont n pleins.
  function etoiles(n, sansChiffre){
    var r = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
    var seg = '';
    for (var k = 0; k < 5; k++) seg += '<i' + (k < r ? ' class="p"' : '') + '></i>';
    return '<span class="etoiles" title="' + esc(n) + '${T(" sur 5")}">'
      + (sansChiffre ? '' : '<b>' + esc(n) + '</b>') + '<span class="seg" aria-hidden="true">' + seg + '</span></span>';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    var c = D.comptes || {};
    /* ══ LA REFONTE DE L INVENTAIRE, APPLIQUEE AUX AVIS (2026-09-25) ══════════
       Tuiles comptees par le SITE sur TOUS les avis (comptes), qui menent d un
       clic a la file ou a l etat qu elles comptent ; barre sur une ligne a
       loupe ; ligne riche (initiales du client, achat verifie, produit
       dessous), note en etoiles. Crochets gardes : data-onglet, #a-etat, #a-q,
       #a-note, #a-per, #a-prec, #a-suiv, #a-exporter, tr[data-id]. */
    var choix = ONGLET === 'pending' ? 'pending' : (ETAT || 'done');
    var tu = function(g, lib, val, sous, ton){
      return '<div class="tuile' + (g ? ' cliq' + (choix === g ? ' on' : '') + '" data-avt="' + g
          + '" title="${T("Cliquer pour afficher")}' : '') + '">'
        + '<div class="lbl">' + lib + '</div><div class="val' + (ton ? ' ' + ton : '') + '">' + val + '</div>'
        + '<div class="sub">' + sous + '</div></div>';
    };
    var h = szTuiles('<div class="tuiles">'
      + tu('pending', '${T("En attente")}', c.attente || 0, '${T("à modérer")}', c.attente ? 'att' : '')
      + tu('published', '${T("Publiés")}', c.publies || 0, '${T("visibles en boutique")}', '')
      + tu('hidden', '${T("Masqués")}', c.masques || 0, '${T("retirés de la boutique")}', '')
      + tu('done', '${T("Traités")}', c.traites || 0, '${T("approuvés et refusés")}', '')
      + tu('', '${T("Note moyenne")}', (c.moyenne != null ? szNombre(c.moyenne) : '—'),
          (c.moyenne != null ? etoiles(c.moyenne, true) : '${T("aucun avis publié")}'), '')
      + '</div>');
    h += '<div class="carte"><div class="rf-tb">'
      + '<label class="rf-rch">${ICO.loupe}<input aria-label="${T("Nom ou n° de commande")}" type="search" id="a-q" placeholder="${T("Nom ou n° de commande…")}" value="' + esc(Q) + '"></label>'
      + '<button class="rf-jet' + (ONGLET === 'pending' ? ' on' : '') + '" data-onglet="pending">'
      + '${T("En attente")}<span class="n' + (c.attente > 0 ? ' hi' : '') + '">' + (c.attente || 0) + '</span></button>'
      + '<button class="rf-jet' + (ONGLET === 'done' ? ' on' : '') + '" data-onglet="done">'
      + '${T("Traités")}<span class="n">' + (c.traites || 0) + '</span></button>'
      + (ONGLET === 'done'
          ? '<select id="a-etat" aria-label="${T("Filtrer par état de traitement")}">'
            + '<option value=""' + (ETAT === '' ? ' selected' : '') + '>${T("Approuvés et refusés")}</option>'
            + '<option value="published"' + (ETAT === 'published' ? ' selected' : '') + '>${T("Approuvés")}</option>'
            + '<option value="hidden"' + (ETAT === 'hidden' ? ' selected' : '') + '>${T("Refusés / masqués")}</option>'
            + '</select>'
          : '')
      + '<select id="a-note"><option value=""' + (NOTE === '' ? ' selected' : '') + '>${T("Toutes les notes")}</option>'
      + [5, 4, 3, 2, 1].map(function(n){
          return '<option value="' + n + '"' + (String(NOTE) === String(n) ? ' selected' : '') + '>' + n + '${T(" sur 5")}</option>';
        }).join('')
      + '</select>'
      + '<select id="a-per"><option value=""' + (PER === '' ? ' selected' : '') + '>${T("Toutes les dates")}</option>'
      + '<option value="7"' + (PER === '7' ? ' selected' : '') + '>${T("7 derniers jours")}</option>'
      + '<option value="30"' + (PER === '30' ? ' selected' : '') + '>${T("30 derniers jours")}</option>'
      + '<option value="90"' + (PER === '90' ? ' selected' : '') + '>${T("90 derniers jours")}</option>'
      + '<option value="365"' + (PER === '365' ? ' selected' : '') + '>${T("Cette année")}</option>'
      + '</select>'
      + '<span class="rf-droite"><span class="dt">' + (D.total || 0) + ' ${T("avis")}</span></span>'
      + '</div></div>';

    /* ⚠ PLEINE HAUTEUR (2026-09-19) : la carte prend le reste du corps, la liste
       defile, la pagination reste collee au bas. La boite de detail est un
       voile en position:fixed — elle flotte et n est pas coupee. */
    h += '<div class="carte plein">';
    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">' + (ONGLET === 'pending'
        ? '${T("Rien à approuver. La file est vide.")}' : '${T("Aucun avis ne correspond à ces filtres.")}') + '</div>';
    } else {
      h += '<div class="liste"><table><thead><tr><th>${T("Client")}</th><th>${T("Note")}</th>'
        + '<th>${T("Date")}</th><th>${T("État")}</th></tr></thead><tbody>'
        + rows.map(function(r){
            return '<tr data-id="' + esc(r.id) + '" title="${T("Ouvrir l’avis")}">'
              + '<td><div class="rf-prod"><span class="rf-av" aria-hidden="true">' + esc(initiales(r.client)) + '</span>'
              + '<div style="min-width:0"><div class="rf-nom">' + esc(r.client || '—')
              + (r.verifie ? ' <span class="rf-pill bleu">${T("achat vérifié")}</span>' : '') + '</div>'
              + '<div class="rf-sous"><span>' + esc(r.produit) + '</span></div></div></div></td>'
              + '<td>' + etoiles(r.note) + '</td>'
              + '<td class="dt">' + esc(szQuand(r.date)) + '</td>'
              + '<td>' + pastille(r.statut) + '</td></tr>';
          }).join('')
        + '</tbody></table></div>';
      /* ⚠ Le pied de pages est TOUJOURS pose, meme sur une seule page : s il
         apparaissait apres la mesure, il mangerait la hauteur deja comptee. */
      if (rows.length) {
        h += '<div class="pagi">'
          + '<button class="mini" id="a-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>' + '${T("Page {0} / {1}")}'.split('{0}').join(D.page + 1).split('{1}').join(D.pages) + '</span>'
          + '<button class="mini" id="a-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';

    /* ⚠⚠ LE PIED DE LISTE, ET L EXPORT QUI DIT SON PERIMETRE (2026-09-19).
       Cet ecran est PAGINE et FILTRE par onglet : la fenetre ne detient que la
       page courante. Annoncer << les avis >> serait un mensonge ; le pied
       compte donc ce qui est AFFICHE, et nomme la page quand il y en a
       plusieurs. L etat part en CLAIR (En attente / Publie / Masque), pas en
       code interne : le fichier se lit sans l ecran sous les yeux. */
    if (rows.length) {
      var multiA = (D.pages || 1) > 1;
      h += szPied(
        multiA ? (rows.length + '${T(" sur cette page")}')
               : (rows.length + ' ${T("avis")}'),   /* invariable au pluriel */
        '<button class="mini" id="a-exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>');
    }
    if (DETAIL) h += boiteDetail();
    corps.className = 'corps plein';
    corps.innerHTML = h;
    var exA = document.getElementById('a-exporter');
    if (exA) exA.onclick = function(){
      var lignes = rows.map(function(r){
        var e = ETATS[r.statut] || ETATS.hidden;
        return [e[1], String(r.note == null ? '' : r.note), r.produit || '', r.client || '',
                r.verifie ? '${T("oui")}' : '${T("non")}', r.date || ''];
      });
      if (!lignes.length) { szDire('${T("Rien à exporter.")}', 'att'); return; }
      var csv = szCSV(['${T("État")}', '${T("Note")}', '${T("Produit")}', '${T("Client")}',
        '${T("Achat vérifié")}', '${T("Date")}'], lignes);
      szExporter('avis-' + new Date().toISOString().slice(0, 10) + '.csv', csv,
        (D.pages || 1) > 1 ? '${T("La page affichée")}' : '${T("Les avis affichés")}');
    };
    brancher();
    // La mesure : combien de lignes tiennent VRAIMENT dans la liste bornee.
    szAutoPagination('.liste', function(n){ if (n === TAILLE) return; TAILLE = n; PAGE = 0; charger(); });
  }

  /* Le texte de l avis en MORCEAUX (2026-10-12), pour qu il se lise par pages
     dans la boite plutot que de la faire defiler : un morceau par ligne du
     texte, et une longue ligne coupee entre deux phrases (puis entre deux mots
     si une seule phrase est demesuree). ⚠ Aucune barre oblique inverse ici :
     le gabarit l avalerait — le saut de ligne s ecrit par son code. */
  function morceaux(t){
    var out = [], MAX = 420;
    String(t || '').split(String.fromCharCode(10)).forEach(function(par){
      if (!par.trim()) return;
      var ph = par.split('. '), cur = '';
      for (var i = 0; i < ph.length; i++) {
        var x = ph[i] + (i < ph.length - 1 ? '. ' : '');
        if (cur && (cur + x).length > MAX) { out.push(cur); cur = ''; }
        cur += x;
        while (cur.length > MAX * 1.5) {
          var cp = cur.lastIndexOf(' ', MAX);
          if (cp < MAX / 2) cp = MAX;
          out.push(cur.slice(0, cp)); cur = cur.slice(cp).replace(/^ +/, '');
        }
      }
      if (cur) out.push(cur);
    });
    return out;
  }

  function boiteDetail(){
    var r = DETAIL;
    var h = '<div class="voile" id="a-voile"><div class="boite">'
      + '<h3>' + pastille(r.statut) + ' <span class="etoile">' + r.note + '${T(" sur 5")}</span> '
      + esc(r.produit) + '</h3>'
      + '<div class="grille">'
      + '<div><div class="l">${T("Client")}</div><div class="v">' + esc(r.client)
      + (r.verifie ? ' <span class="pill bon">${T("vérifié")}</span>' : '') + '</div></div>'
      + (r.commande ? '<div><div class="l">${T("Commande")}</div><div class="v">' + esc(r.commande) + '</div></div>' : '')
      + (r.taille ? '<div><div class="l">${T("Taille achetée")}</div><div class="v">' + esc(r.taille) + '</div></div>' : '')
      + '<div><div class="l">${T("Langue")}</div><div class="v">' + esc(r.langue) + '</div></div>'
      + '<div><div class="l">${T("Déposé le")}</div><div class="v">' + esc(szQuand(r.date)) + '</div></div>'
      + (r.approuveLe ? '<div><div class="l">${T("Approuvé le")}</div><div class="v">' + esc(szQuand(r.approuveLe)) + '</div></div>' : '')
      + (r.photos ? '<div><div class="l">${T("Photos")}</div><div class="v">' + r.photos + '</div></div>' : '')
      + '</div>'
      /* ⚠ LES VIGNETTES SONT DES <img>, PAS UN fetch. Une balise image n a pas
         besoin de CORS ; un fetch vers R2 echouerait sans un mot (voir
         [[reference_r2_never_fetch_from_page]]). L adresse morte retombe sur un
         cadre gris plutot que sur l icone d image brisee du navigateur. */
      + ((r.photosUrl && r.photosUrl.length)
          ? '<div class="photos" data-pages="avis-photos">' + r.photosUrl.map(function(u, i){
              return '<div class="ph">'
                /* ⚠ alt VIDE : une adresse morte affichait le texte de
                   remplacement en travers de la vignette, ce qui ressemble a un
                   defaut de la fenetre plutot qu a une image introuvable. Le
                   repli se pose en JS, jamais dans un onerror= en ligne (une
                   apostrophe echappee y est avalee par le gabarit). */
                + '<img src="' + esc(u) + '" alt="" title="' + '${T("Photo {0} de l’avis")}'.split('{0}').join(i + 1) + '">'
                + (r.peutModifier
                    ? '<button class="phx" data-photo="' + i + '" title="${T("Retirer cette photo de l’avis et du stockage")}">'
                      + '✕' + '</button>'
                    : '')
                + '</div>';
            }).join('') + '</div>'
          : '')
      + (r.titre ? '<div style="font-weight:700;margin-bottom:.35rem">' + esc(r.titre) + '</div>' : '')
      + '<div class="texte" data-pages="avis-texte">' + (morceaux(r.texte).map(function(m){
          return '<p>' + esc(m) + '</p>'; }).join('') || '<p>' + esc('${T("(aucun texte)")}') + '</p>') + '</div>'
      + (r.reponse
          ? '<div class="reponse"><div class="dt" style="font-size:.6875rem;color:var(--tx2);text-transform:uppercase;'
            + 'letter-spacing:.05em">${T("Votre réponse")}' + (r.reponduLe ? ' · ' + esc(szQuand(r.reponduLe)) : '') + '</div>'
            + '<div class="rtx" title="' + esc(r.reponse) + '">' + esc(r.reponse) + '</div></div>'
          : '');
    if (REPONDRE) {
      /* ⚠ LA PHRASE ENTIERE, PAS LA CLE COURTE DEDANS. Avec la seule cle
         << Votre réponse >> au debut, ces deux textes sortaient a moitie
         anglais — le banc du residuel les a dits. */
      h += '<div style="margin-top:.6rem"><textarea id="a-reptxt" aria-label="${T("Votre réponse publique à cet avis")}" '
        + 'placeholder="${T("Votre réponse sera affichée publiquement sous l’avis.")}">'
        + esc(REP_TXT != null ? REP_TXT : (r.reponse || '')) + '</textarea>'
        + '<div class="pied-boite"><button id="a-repannuler">${T("Annuler")}</button>'
        + '<button class="prim" id="a-repenvoyer">${T("Enregistrer la réponse")}</button></div></div>';
    }
    h += '<div class="pied-boite">'
      + '<button class="danger" id="a-supprimer">' + '<span class="ic">🗑</span> ${T("Supprimer")}' + '</button>'
      + (!REPONDRE ? '<button id="a-repondre"><span class="ic">💬</span>${T(" Répondre")}</button>' : '')
      + (r.statut !== 'pending'
          ? '<button id="a-masquer">' + (r.statut === 'hidden' ? '<span class="ic">👁</span>${T(" Republier")}' : '<span class="ic">🙈</span>${T(" Masquer")}') + '</button>'
          : '')
      + (r.statut === 'pending' ? '<button class="prim" id="a-approuver">${T("✓ Approuver")}</button>' : '')
      + '<button id="a-fermer">${T("Fermer")}</button>'
      + '</div></div></div>';
    return h;
  }

  /* ── RETIRER UNE PHOTO (#33) ───────────────────────────────────────────────
     ⚠ CONFIRMEE DANS UNE BOITE A PART (szConfirmer, 2026-10-15) et l avis reste ouvert : on retire souvent DEUX
     photos d affilee, et refermer le panneau a chaque fois obligerait a
     rouvrir l avis entre chaque geste.
     ⚠ ON RELIT L AVIS APRES COUP plutot que de retirer la vignette a la main :
     les index se decalent des qu une photo part, et un index perime ferait
     retirer la mauvaise image au clic suivant. */
  function retirerPhoto(i){
    if (!DETAIL) return;
    if (PHOTO_ARMEE !== i) {
      szConfirmer({ danger: true, titre: '${T("Retirer la photo")}',
        texte: '${T("La photo")}' + ' ' + (i + 1) + ' ' + '${T("sera retirée de l’avis et supprimée du stockage. Le texte de l’avis n’est pas modifié. Cette action est irréversible.")}',
        details: [['${T("Client")}', DETAIL.client || '—'], ['${T("Produit")}', DETAIL.produit || '—']],
        oui: '${T("Retirer la photo")}' }).then(function(ok){ if (ok && DETAIL) { PHOTO_ARMEE = i; retirerPhoto(i); } });
      return;
    }
    PHOTO_ARMEE = -1;
    var id = DETAIL.id;
    dire('${T("Retrait…")}');
    appeler('avis:photoRetirer', [id, i]).then(function(r){
      if (!r.ok) { dessiner(); dire('${T("Échec : ")}' + expliquer(r), 'err'); return; }
      appeler('avis:lire', [id]).then(function(d){
        if (d && d.ok) { DETAIL = d; }
        dessiner();
        /* ⚠ Le singulier et le pluriel, chacun entier. */
        dire(r.restantes
          ? ('${T("Photo retirée — ")}' + r.restantes + (r.restantes > 1 ? '${T(" restantes.")}' : '${T(" restante.")}'))
          : '${T("Photo retirée — il n’en reste aucune.")}', 'bon');
      });
    });
  }

  /* (2026-10-25, audit) UN GESTE A LA FOIS. « Masquer » est une BASCULE au site : un double-clic
     masquait puis republiait l avis. Les boutons du pied restent desactives jusqu a la reponse. */
  function geste(op, apres){
    if (OCCUPE || !DETAIL) return;
    OCCUPE = true;
    var pb = document.querySelectorAll('#a-voile .pied-boite button');
    for (var ib = 0; ib < pb.length; ib++) pb[ib].disabled = true;
    dire('…');
    appeler(op, [DETAIL.id]).then(function(r){
      OCCUPE = false;
      if (!r.ok) { for (var jb = 0; jb < pb.length; jb++) pb[jb].disabled = false; dire(expliquer(r), 'err'); return; }
      /* Les avis récompensés (2026-10-07) : le serveur dit ce qu il vient de verser. */
      dire(apres + (r.points > 0 ? ' ' + szNombre(r.points, 0) + ' ${T("points versés au client.")}' : ''), 'bon');
      DETAIL = null; SUPPR_ARME = false; PHOTO_ARMEE = -1; REPONDRE = false; REP_TXT = null;
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
    if (f) f.onclick = function(){ fermerAvis(); };
    var ap = document.getElementById('a-approuver');
    if (ap) ap.onclick = function(){ geste('avis:approuver', '${T("Avis approuvé — il est maintenant visible en boutique.")}'); };
    var ma = document.getElementById('a-masquer');
    if (ma) ma.onclick = function(){
      geste('avis:masquer', DETAIL.statut === 'hidden' ? '${T("Avis republié.")}' : '${T("Avis masqué.")}');
    };
    var su = document.getElementById('a-supprimer');
    if (su) su.onclick = function(){
      /* Suppression DEFINITIVE : confirmee dans une boite a part (szConfirmer,
         2026-10-15) — masquer suffit presque toujours, et la boite le dit. */
      if (!SUPPR_ARME) {
        var aS = DETAIL || {};
        szConfirmer({ danger: true, titre: '${T("Supprimer l’avis")}',
          texte: '${T("L’avis de")}' + ' ' + (aS.client || '') + ' ' + '${T("sur")}' + ' « ' + (aS.produit || '') + ' » '
            + '${T("sera supprimé définitivement, avec ses photos et sa réponse. Pour le retirer de la boutique sans le perdre, utilisez plutôt « Masquer ». Cette action est irréversible.")}',
          details: [['${T("Note")}', (aS.note || 0) + '${T(" sur 5")}']],
          oui: '${T("Supprimer l’avis")}' }).then(function(ok){ if (ok && DETAIL) { SUPPR_ARME = true; su.onclick(); } });
        return;
      }
      SUPPR_ARME = false;
      geste('avis:supprimer', '${T("Avis supprimé définitivement.")}');
    };
    /* Une adresse morte devient un cadre neutre plutot qu une icone brisee. */
    var vgs = document.querySelectorAll('.ph img');
    for (var iv = 0; iv < vgs.length; iv++) vgs[iv].onerror = function(){
      var c = this.parentNode; if (!c) return;
      this.style.display = 'none';
      if (!c.querySelector('.phmort')) {
        var m = document.createElement('span');
        m.className = 'phmort'; m.textContent = '⃠';
        m.title = '${T("Image introuvable à cette adresse")}';
        c.appendChild(m);
      }
    };
    var phs = document.querySelectorAll('[data-photo]');
    for (var ip = 0; ip < phs.length; ip++) {
      phs[ip].onclick = function(){ retirerPhoto(Number(this.getAttribute('data-photo'))); };
    }
    var re = document.getElementById('a-repondre');
    if (re) re.onclick = function(){ REPONDRE = true; REP_TXT = null; dessiner(); };
    var ra = document.getElementById('a-repannuler');
    if (ra) ra.onclick = function(){ REPONDRE = false; REP_TXT = null; dessiner(); };
    var rt = document.getElementById('a-reptxt');
    if (rt) rt.oninput = function(){ REP_TXT = rt.value; };
    var rv = document.getElementById('a-repenvoyer');
    if (rv) rv.onclick = function(){
      var t = document.getElementById('a-reptxt');
      var txt = t ? t.value : '';
      dire('${T("Enregistrement…")}');
      appeler('avis:repondre', [DETAIL.id, txt]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('${T("Réponse enregistrée.")}', 'bon');
        REPONDRE = false; REP_TXT = null;
        ouvrirDetail(DETAIL.id);
      });
    };
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); ETAT = ''; PAGE = 0; charger(); return; }
    // Les tuiles (refonte du 2026-09-25) : la file, ou l onglet Traites sur l etat compte.
    var av = t.closest('[data-avt]');
    if (av) {
      var g = av.getAttribute('data-avt');
      if (g === 'pending') { ONGLET = 'pending'; ETAT = ''; }
      else { ONGLET = 'done'; ETAT = (g === 'done' ? '' : g); }
      PAGE = 0; charger(); return;
    }
    if (t.closest('.boite')) return;
    var vo = t.closest('#a-voile');
    if (vo) return;   // le voile ne ferme plus (2026-10-07) : seulement Fermer
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-id]');
    if (tr) ouvrirDetail(tr.getAttribute('data-id'));
  };

  function ouvrirDetail(id){
    dire('${T("Lecture…")}');
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
      if (!r || !r.ok) { vide('${T("Avis indisponibles")}', expliquer(r)); return; }
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
  /* (2026-10-25, audit) Fermer l avis avec une reponse TAPEE et non enregistree DEMANDE d abord :
     Echap jetait la reponse publique en cours. */
  function fermerAvis(){
    var t = document.getElementById('a-reptxt');
    var tape = REPONDRE && t && t.value.trim() && t.value !== ((DETAIL && DETAIL.reponse) || '');
    var clore = function(){ DETAIL = null; SUPPR_ARME = false; PHOTO_ARMEE = -1; REPONDRE = false; REP_TXT = null; dessiner(); };
    if (!tape) { clore(); return; }
    szConfirmer({ prudent: true, titre: '${T("Abandonner la réponse")}',
      texte: '${T("La réponse tapée n’a pas été enregistrée. Fermer l’avis l’abandonne.")}',
      oui: '${T("Abandonner la réponse")}' }).then(function(ok){
        if (ok) { clore(); return; }
        var t2 = document.getElementById('a-reptxt'); if (t2) t2.focus();
      });
  }

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
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (DETAIL) { fermerAvis(); return; }
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
