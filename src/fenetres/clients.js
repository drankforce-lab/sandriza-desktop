'use strict';

/*
 * FENÊTRE « CLIENTS » — NATIVE
 * =============================================================================
 * La liste des clients : onglets Actifs / Inactifs / Supprimés, recherche,
 * pagination. Chaque ligne porte le nombre de commandes et l'achat total (la
 * même somme que l'écran du site — par identifiant OU par courriel de
 * livraison). Cliquer une ligne ouvre la FICHE CLIENT native (clients:ouvrir),
 * qui prend elle-même son verrou. AUCUNE écriture ici.
 *
 * ⚠ LES ONGLETS, LA RECHERCHE ET LA PAGINATION VIVENT DANS LE SITE (le cœur
 * Admin._clientsDonnees) : la fenêtre envoie ses filtres et ne reçoit que SA
 * page, en lignes allégées. Patron de la fenêtre Produits en vente.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit (voir src/langue/clients.js). */
const T = require('../langue').tr('clients');

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
/* Les tuiles de tete (refonte du 2026-09-25), aux mesures de l Inventaire.
   La tuile de la liste affichee porte le cadre or. */
.tuiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem;flex:0 0 auto;margin-bottom:.6rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);min-width:0}
.tuile .sub{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tuile.cliq{cursor:pointer;user-select:none}
.tuile.cliq:hover{border-color:rgba(var(--or-rgb),.6)}
.tuile.on{border-color:var(--or)}
/* LA BASCULE D AFFICHAGE (2026-10-14, sa demande : « met un mode compact ici ») — la MEME que Commandes,
   l Inventaire et Produits en vente, en icones : le libelle est dans l infobulle et pour le lecteur d ecran. */
.vue-bascule{display:inline-flex;align-items:stretch;gap:2px;padding:3px;border-radius:10px;
  background:var(--v04);border:1px solid var(--v12);flex:0 0 auto}
.vue-bascule button{display:inline-flex;align-items:center;height:2rem;padding:0 .6rem;
  border:0!important;border-radius:7px;background:transparent!important;color:var(--tx2)}
.vue-bascule button svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}
.vue-bascule button:hover:not(.on){color:var(--tx);background:var(--v06)!important}
.vue-bascule button.on{background:var(--or)!important;color:#1a1208}
/* L AFFICHAGE COMPACT : une ligne par client — nom et courriel cote a cote, l avatar devient un point, des
   pastilles plus petites. La pagination mesuree (szAutoPagination) en tire plus de lignes : elle mesure la
   PREMIERE ligne dessinee, donc la hauteur compacte. Aucune glissiere : la liste reste bornee. */
.liste.compacte tbody td{padding-top:.2rem!important;padding-bottom:.2rem!important}
.liste.compacte .rf-prod{gap:.55rem}
.liste.compacte .rf-av{width:.55rem!important;height:.55rem!important;min-width:0!important;font-size:0!important;
  border-radius:50%!important;background:var(--or)!important;opacity:.75}
.liste.compacte .rf-prod>div{display:flex;align-items:baseline;gap:.7rem;min-width:0}
.liste.compacte .rf-nom{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.liste.compacte .rf-sous{margin-top:0!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-wrap:nowrap}
.liste.compacte .rf-pill{font-size:.6875rem;padding:.02rem .4rem}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input[type=search],select,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:210px}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
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
.pill{display:inline-block;font-size:.6875rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:var(--tx2)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Clients ». */
function pageClients() {
  return `${TETE()}
<title>${T("Clients — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.customers}</span><h1>${T("Clients")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps plein" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES()}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;
  var ONGLET = 'active';
  var Q = '';
  var PAGE = 0;
  /* La taille de page est MESUREE (szAutoPagination, apres chaque dessin) :
     25 n est que le repli tant que la liste n a pas encore ete disposee. */
  var TAILLE = 25;
  /* L AFFICHAGE COMPACT (2026-10-14, sa demande : « met un mode compact ici »), le meme que Commandes,
     l Inventaire et Produits en vente : une ligne par client, retenu sur le poste (sous garde). */
  var COMPACT = false;
  try { COMPACT = localStorage.getItem('sz-cli-compact') === '1'; } catch (e) {}

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  /* ══ LA PASTILLE DE SEGMENT (#150, 2026-09-24) ════════════════════════════
     ⚠⚠ AUCUNE REGLE ICI, ET AUCUN LIBELLE NON PLUS. Le site envoie << segment >>
     (la cle) et << segLabel >> (le mot), tous deux issus de la MEME regle qui
     classe l ecran web — Analytics._segmentCoeur. La fenetre ne fait que
     peindre. Recopier les cinq seuils ici aurait tenu jusqu au premier seuil
     change d un seul cote.

     ⚠⚠ ET AUCUNE COULEUR NEUVE, C EST UNE DECISION. Cinq segments, quatre
     pastilles deja mesurees (bon, att, err, neutre). Inventer une pastille
     bleue pour << Nouveau >> aurait ajoute un couple de couleurs que le banc
     de contraste juge — et ce banc-la ne peut PAS tourner sur ce poste (il
     relance le moteur par scenario). On n ajoute pas une couleur qu on ne peut
     pas eprouver avant de la pousser.
     ➡ C est le MOT qui distingue les segments ; la couleur ne fait que separer
     << ce qu on cherche >> de << l ordinaire >>. << Prospect >> et
     << Inactif >> partagent donc le gris, et se lisent quand meme.

     ⚠ UNE CLE INCONNUE GARDE SON MOT plutot que de disparaitre : le jour ou un
     sixieme segment nait cote site, il paraitra en gris au lieu de laisser une
     cellule vide qu on lirait comme une donnee manquante.

     ⚠⚠ ET LE MOT SE TRADUIT ICI, PAS AU SITE. << segLabel >> arrive en FRANCAIS
     (SEG_META sert l ecran web, qui n a qu une langue) : l afficher tel quel
     mettrait << Régulier >> sur la page anglaise. La fenetre traduit donc
     depuis la CLE, comme le fait deja << libelleStatut >> dans messagerie. Le
     libellé du site reste le repli — mieux vaut un mot francais qu une cellule
     vide le jour ou une cle nouvelle arrive. */
  /* Refonte du 2026-09-25 : la pastille a point de l Inventaire (rf-pill).
     VIP en or-ambre (a soigner), regulier en vert (fidele), nouveau en bleu (en
     train de venir), prospect et inactif en gris. */
  var TONS_SEG = { vip: 'ambre', regulier: 'vert', nouveau: 'bleu',
    prospect: '', inactif: '' };
  var MOTS_SEG = {
    prospect: '${T("Prospect")}', nouveau: '${T("Nouveau")}',
    regulier: '${T("Régulier")}', vip: '${T("VIP")}', inactif: '${T("Inactif")}',
  };
  /* Les initiales, pour la pastille (Marie Tremblay -> MT). ⚠ Decoupe sur
     l espace : une expression \s ecrite ici deviendrait s dans le gabarit. */
  function initiales(nom){
    var m = String(nom || '').trim().split(' ').filter(Boolean);
    if (!m.length || m[0] === '—') return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
  }
  function pastilleSegment(r){
    var mot = MOTS_SEG[r.segment] || r.segLabel || '';
    if (!mot) return '<span class="dt">—</span>';
    return '<span class="rf-pill ' + (TONS_SEG[r.segment] || '') + '">'
      + esc(mot) + '</span>';
  }

  function fmt(n){
    return szArgent(n);   /* voir szArgent (socle) : le repli aussi place le symbole */
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux clients.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cette fiche n’existe plus.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    return MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
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

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    var c = D.comptes || {};
    var onglets = [
      ['active', '${T("Actifs")}', c.actifs || 0],
      ['inactive', '${T("Inactifs")}', c.inactifs || 0],
      ['deleted', '${T("Supprimés")}', c.supprimes || 0]
    ];
    /* ══ LA REFONTE DE L INVENTAIRE, APPLIQUEE A CLIENTS (2026-09-25) ═════════
       Tuiles en tete (les trois comptes, qui basculent la liste comme les
       onglets), barre sur une ligne a loupe, et la ligne riche : initiales,
       nom, courriel dessous, total en gras, segment et statut en pastilles a
       point. Crochets gardes : data-onglet, #c-q, tr[data-id]. */
    var tuile = function(o, sous, ton){
      return '<div class="tuile cliq' + (ONGLET === o[0] ? ' on' : '') + '" data-onglet="' + o[0] + '"'
        + ' title="${T("Cliquer pour afficher")}"><div class="lbl">' + o[1] + '</div>'
        + '<div class="val' + (ton ? ' ' + ton : '') + '">' + o[2] + '</div><div class="sub">' + sous + '</div></div>';
    };
    var h = szTuiles('<div class="tuiles">'
      + tuile(onglets[0], '${T("comptes en service")}', '')
      + tuile(onglets[1], '${T("sans activité récente")}', '')
      + tuile(onglets[2], '${T("dans la corbeille")}', '')
      + '</div>');
    h += '<div class="carte"><div class="rf-tb">'
      /* ⚠ L etiquette ENTIERE : une cle courte posee dans une phrase plus
         longue laisse l autre moitie en francais. */
      + '<label class="rf-rch">${ICO.loupe}<input aria-label="${T("Nom ou courriel")}" type="search" id="c-q" placeholder="${T("Nom ou courriel…")}" value="' + esc(Q) + '"></label>'
      + onglets.map(function(o){
          return '<button class="rf-jet' + (ONGLET === o[0] ? ' on' : '') + '" data-onglet="' + o[0] + '">'
            + o[1] + ' (' + o[2] + ')</button>';
        }).join('')
      + '<span class="rf-droite">'
      + '<span class="vue-bascule" role="group" aria-label="${T("Affichage de la liste")}">'
      +   '<button type="button" data-vue="detail" aria-label="${T("Affichage détaillé")}" aria-pressed="' + (!COMPACT) + '" class="' + (!COMPACT ? 'on' : '') + '" title="${T("Affichage détaillé")}">'
      +     '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2.5" width="12" height="4.5" rx="1.2"/><rect x="2" y="9" width="12" height="4.5" rx="1.2"/></svg></button>'
      +   '<button type="button" data-vue="compact" aria-label="${T("Affichage compact : une ligne par client, plus de clients par page")}" aria-pressed="' + COMPACT + '" class="' + (COMPACT ? 'on' : '') + '" title="${T("Affichage compact : une ligne par client, plus de clients par page")}">'
      +     '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3.5h12M2 6.5h12M2 9.5h12M2 12.5h12"/></svg></button>'
      + '</span>'
      + '<span class="dt">' + (D.total || 0) + ' '
      + (D.total > 1 ? '${T("clients")}' : '${T("client")}') + '</span></span>'
      + '</div></div>';

    /* ⚠ PLEINE HAUTEUR (2026-09-19) : la carte prend tout l espace restant et
       c est la LISTE qui defile, pas le corps. Avant, une liste de trois lignes
       s arretait a trois lignes et laissait 446 px morts sous elle — mesure. */
    h += '<div class="carte plein">';
    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">${T("Aucun client ne correspond.")}</div>';
    } else {
      h += '<div class="liste' + (COMPACT ? ' compacte' : '') + '"><table><thead><tr><th>${T("Client")}</th>'
        + '<th style="text-align:center">${T("Commandes")}</th><th style="text-align:right">${T("Achat total")}</th>'
        + '<th>${T("Segment")}</th><th>${T("Statut")}</th></tr></thead><tbody>'
        + rows.map(function(r){
            var st = r.supprime ? '<span class="rf-pill rouge">${T("Supprimé")}</span>'
              : (r.actif ? '<span class="rf-pill vert">${T("Actif")}</span>' : '<span class="rf-pill">${T("Inactif")}</span>');
            return '<tr data-id="' + esc(r.id) + '" data-ctx-titre="' + esc(r.nom || r.courriel || '') + '" title="${T("Ouvrir la fiche client")}">'
              // ⚠ LE CADENAS EST SUR LA LIGNE, pas seulement dans la fiche ouverte.
        // Sans lui, un collegue devait CLIQUER pour decouvrir que la fiche
        // etait prise — l information existait, mais pas la ou l on regarde.
        + '<td><div class="rf-prod"><span class="rf-av" aria-hidden="true">' + esc(initiales(r.nom)) + '</span>'
        + '<div style="min-width:0"><div class="rf-nom">' + esc(r.nom || '—') + szVerrouCase('users', r.id) + '</div>'
        + '<div class="rf-sous">' + esc(r.courriel || '') + '</div></div></div></td>'
              + '<td style="text-align:center">' + r.commandes + '</td>'
              + '<td style="text-align:right"><span class="rf-mont">' + esc(fmt(r.achats)) + '</span></td>'
              + '<td>' + pastilleSegment(r) + '</td>'
              + '<td>' + st + '</td></tr>';
          }).join('')
        + '</tbody></table></div>';
      /* ⚠ Le pied de pages est TOUJOURS pose, meme sur une seule page : s il
         apparaissait apres la mesure, il mangerait la hauteur deja comptee et
         la derniere ligne passerait sous le bas du cadre. */
      if (rows.length) {
        h += '<div class="pagi">'
          + '<button class="mini" id="c-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>${T("Page")} ' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="c-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';
    /* ⚠⚠ LE PIED DE LISTE, ET L EXPORT QUI DIT SON PÉRIMÈTRE (2026-09-19).
       Cet écran est PAGINÉ : la fenêtre ne détient que la page courante
       (D.lignes, sans accent grave : on est dans un gabarit). Exporter en silence « tous les clients » serait un
       mensonge ; exporter la page sans le dire en serait un autre. Le pied
       compte donc ce qui est affiché SUR le total, et le message d'écriture
       nomme la page quand il y en a plusieurs. */
    if (rows.length) {
      var multi = (D.pages || 1) > 1;
      h += szPied(
        multi ? (rows.length + '${T(" sur ")}' + (D.total || 0))
              : (rows.length + ' ' + (rows.length > 1 ? '${T("clients")}' : '${T("client")}')),
        '<button class="mini" id="c-exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>');
    }
    corps.innerHTML = h;
    // Reposer les cadenas deja connus sur le tableau frais : sans cela, ils
    // disparaitraient a chaque redessin et ne reviendraient qu au sondage
    // suivant — un clignotement toutes les trois secondes.
    szVerrousPeindre();
    // La mesure : combien de lignes tiennent VRAIMENT dans la liste bornee.
    szAutoPagination('.liste', function(n){ if (n === TAILLE) return; TAILLE = n; PAGE = 0; charger(); });

    var q = document.getElementById('c-q');
    if (q) {
      q.oninput = function(){
        Q = q.value; PAGE = 0;
        clearTimeout(window._cq);
        window._cq = setTimeout(function(){ charger(true); }, 300);
      };
    }
    var bp = document.getElementById('c-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, (D.page || 0) - 1); charger(); };
    var bs = document.getElementById('c-suiv');
    if (bs) bs.onclick = function(){ PAGE = (D.page || 0) + 1; charger(); };

    /* ⚠ LE FICHIER PORTE LE PÉRIMÈTRE DANS SON NOM, pas seulement dans un
       message qui disparaît. Retrouvé sur un bureau trois semaines plus tard,
       « clients-2026-09-19-p2.csv » se relit tout seul ; « clients.csv » ne
       dit pas s'il contient tout ou une page.
       ⚠ Et la valeur d'achat part en NOMBRE, pas en « 1 234,56 $ » : un
       montant mis en forme pour l'œil n'est plus additionnable dans un
       tableur, et c'est précisément ce qu'on va en faire. */
    var ex = document.getElementById('c-exporter');
    if (ex) ex.onclick = function(){
      var lignes = (D.lignes || []).map(function(r){
        /* ⚠ LE SEGMENT PART EN TEXTE, PAS EN PASTILLE, et par le MEME mot que
           l ecran affiche (MOTS_SEG) : c est un critere de tri dans un tableur
           — << tous mes VIP >> est exactement la question qu on lui pose. */
        return [r.nom || '', r.courriel || '', r.commandes, r.achats,
          (MOTS_SEG[r.segment] || r.segLabel || ''),
          r.supprime ? '${T("Supprimé")}' : (r.actif ? '${T("Actif")}' : '${T("Inactif")}')];
      });
      if (!lignes.length) { dire('${T("Rien à exporter.")}', 'att'); return; }
      var csv = szCSV(['${T("Nom")}', '${T("Courriel")}', '${T("Commandes")}',
        '${T("Achat total")}', '${T("Segment")}', '${T("Statut")}'], lignes);
      var jour = new Date().toISOString().slice(0, 10);
      var multi = (D.pages || 1) > 1;
      szExporter('clients-' + jour + (multi ? '-p' + ((D.page || 0) + 1) : '') + '.csv', csv,
        multi ? '${T("La page affichée")}' : '${T("La liste des clients")}');
    };
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); PAGE = 0; Q = ''; charger(); return; }
    var vb = t.closest('[data-vue]');
    if (vb) {
      var c = vb.getAttribute('data-vue') === 'compact';
      if (c !== COMPACT) {
        COMPACT = c;
        try { localStorage.setItem('sz-cli-compact', COMPACT ? '1' : '0'); } catch (e) {}
        /* Le dessin D ABORD (la mesure lit la hauteur de la nouvelle ligne), puis la page 1 : la taille
           mesuree change, l ancien numero de page ne designe plus les memes clients. */
        PAGE = 0; dessiner();
      }
      return;
    }
    if (t.closest('button') || t.closest('input')) return;
    var tr = t.closest('tr[data-id]');
    if (!tr) return;
    ouvrirFiche(tr.getAttribute('data-id'), '');
  };

  /* Ouvrir la fiche, avec une INTENTION au besoin (« modifier », « supprimer », « purger ») : la fiche
     s ouvre et lance elle-meme son geste — meme bouton, memes droits, meme confirmation en deux temps. Le
     modele de Commandes (« id@supprimer ») : la confirmation montre le nom, le courriel et ce qui est
     conserve avant le second clic, ce qu un menu ne peut pas dire. */
  function ouvrirFiche(id, intention){
    dire('${T("Ouverture…")}');
    appeler('clients:ouvrir', [id + (intention ? '@' + intention : '')]).then(function(r){
      dire(r.ok ? '${T("Fiche client ouverte dans sa fenêtre.")}' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  }

  /* ══ LE CLIC DROIT SUR UN CLIENT (2026-10-14) ═════════════════════════════════════════════════════════
     Sa demande : « le menu contextuel dans les clients tu ne me donnes que le choix Ouvrir, tu dois me donner
     les autres options aussi ». La ligne n a aucun bouton : le menu automatique du socle n y trouvait que
     << Ouvrir >>. Les gestes sont ceux de la FICHE (client.js), rien de plus — memes operations du pont
     (client:etat, client:restaurer, client:etatCompte), memes droits (peutEcrire = customers:edit,
     peutSupprimer = customers:delete, poses par clients:liste) :
     · les gestes reversibles d un clic (activer, desactiver, restaurer, etat de compte) partent d ici ;
     · << Modifier >> et les deux suppressions OUVRENT LA FICHE, confirmation armee — la mise a la corbeille dit
       ce qui est conserve, la purge dit qu elle est IRREVERSIBLE ; un menu ne le dirait pas.
     ⚠ LA PURGE n est offerte que sur un dossier PURGEABLE (supprime ET zero commande, la meme regle que la
       fiche : 6 ans de conservation fiscale). Un geste qui refuse toujours fait chercher la panne ailleurs.
     ⚠ FICHE TENUE PAR UN COLLEGUE (cadenas 'users') : la fiche se mettrait en lecture seule ; le menu fait
       pareil — il le dit, et n offre plus les gestes d ecriture.
     ⚠ UN SITE ANTERIEUR n envoie ni peutEcrire ni peutSupprimer : les gestes d ecriture n y paraissent pas,
       la fiche reste la porte. */
  window.szCtxEntrees = function(ligne){
    if (!ligne.matches || !ligne.matches('tr[data-id]') || !D) return null;
    var id = ligne.getAttribute('data-id');
    var r = (D.lignes || []).filter(function(x){ return String(x.id) === id; })[0];
    if (!r) return null;
    var v = (typeof _szVerrous !== 'undefined' && _szVerrous) ? _szVerrous['users|' + id] : null;
    var pris = !!(v && !v.mine);
    var ecrire = !!D.peutEcrire && !pris;
    var l = [{ lib: '${T("Ouvrir la fiche")}', fn: function(){ ouvrirFiche(id, ''); } }];
    if (ecrire && !r.supprime) l.push({ lib: '${T("Modifier la fiche…")}', fn: function(){ ouvrirFiche(id, 'modifier'); } });
    l.push({ lib: '${T("État de compte")}', fn: function(){
      dire('${T("Impression de l’état de compte…")}');
      appeler('client:etatCompte', [id]).then(function(x){
        dire(x.ok ? '${T("État de compte envoyé à l’impression.")}' : expliquer(x), x.ok ? 'bon' : 'err');
      }); } });
    if (r.courriel) l.push({ lib: '${T("Copier le courriel")}', fn: function(){
      try { navigator.clipboard.writeText(r.courriel); dire('${T("Courriel copié : ")}' + r.courriel, 'bon'); } catch (e) {} } });
    if (pris) {
      l.push({ trait: true });
      l.push({ lib: '${T("En traitement par")} ' + (v.par || '${T("un collègue")}'), off: true });
    } else if (ecrire) {
      l.push({ trait: true });
      if (r.supprime) l.push({ lib: '${T("Restaurer le client")}', fn: function(){
        appeler('client:restaurer', [id]).then(function(x){
          if (!x.ok) { dire(expliquer(x), 'err'); return; }
          dire('${T("Client restauré.")}', 'bon'); charger();
        }); } });
      else l.push({ lib: r.actif ? '${T("Désactiver le compte")}' : '${T("Activer le compte")}', fn: function(){
        var versActif = !r.actif;
        appeler('client:etat', [id, versActif]).then(function(x){
          if (!x.ok) { dire(expliquer(x), 'err'); return; }
          dire(versActif ? '${T("Compte activé.")}' : '${T("Compte désactivé.")}', 'bon'); charger();
        }); } });
    }
    if (D.peutSupprimer) {
      if (!r.supprime) {
        l.push({ trait: true });
        l.push({ lib: '${T("Supprimer le client…")}', dgr: true, fn: function(){ ouvrirFiche(id, 'supprimer'); } });
      } else if (!r.commandes) {
        l.push({ trait: true });
        l.push({ lib: '${T("Supprimer définitivement…")}', dgr: true, fn: function(){ ouvrirFiche(id, 'purger'); } });
      }
    }
    return l;
  };

  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('clients:liste', [{ onglet: ONGLET, q: Q, page: PAGE, taille: TAILLE }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('${T("Clients indisponibles")}', expliquer(r)); return; }
      D = r;
      dire('');
      if (garderSaisie) redessinerSansPerdreLaSaisie();
      else dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('c-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('c-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : une vente ou une ecriture de
     fiche font relire la page — jamais pendant une saisie dans la recherche. */
  window.szActualiser = function(){
    var q = document.getElementById('c-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ charger(); };

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
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
  szVerrousSuivre(['users']);
})();
</script>
</body></html>`;
}

module.exports = { pageClients };
