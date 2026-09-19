'use strict';

/*
 * FENÊTRE « FOURNISSEURS » — NATIVE
 * =============================================================================
 * La liste des fournisseurs : recherche (nom, contact, courriel), catégories,
 * statut. Cliquer une ligne ouvre la FICHE FOURNISSEUR native
 * (fournisseurs:ouvrir) ; « + Nouveau fournisseur » ouvre l'assistant vierge.
 * AUCUNE écriture ici : la suppression reste un geste de l'écran du site.
 *
 * ⚠ LA RECHERCHE VIT DANS LE SITE (le cœur Admin._fournisseursDonnees) : la
 * fenêtre envoie son filtre et reçoit les lignes allégées.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit — jamais le nom, le contact ni les
   categories d un fournisseur (voir src/langue/fournisseurs.js). */
const T = require('../langue').tr('fournisseurs');

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
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input[type=search],button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:220px}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.mini{padding:.12rem .45rem;font-size:.74rem;-webkit-user-select:none;user-select:none}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
button.danger:hover:not(:disabled){background:rgba(239,68,68,.12)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:var(--v04)}
tbody td{padding:.34rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap;
  margin-right:.2rem}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
/* Repertoire de grossistes : des cartes, comme sur l ecran du site. */
.repgrille{display:grid;grid-template-columns:repeat(auto-fill,minmax(17rem,1fr));gap:.6rem}
.repcarte{background:var(--f-carte);border:1px solid var(--v08);border-radius:11px;
  padding:.6rem .7rem;display:flex;flex-direction:column;gap:.25rem}
.reptete{display:flex;align-items:flex-start;gap:.5rem;justify-content:space-between}
.reptete strong{font-size:.88rem;line-height:1.3}
.repquoi{font-size:.76rem;color:var(--tx-bleute);line-height:1.5;margin:.15rem 0}
.repfin{margin-top:auto;padding-top:.4rem;display:flex;justify-content:flex-end}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Fournisseurs ». */
function pageFournisseurs() {
  return `${TETE()}
<title>${T("Fournisseurs — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.suppliers}</span><h1>${T("Fournisseurs")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps plein" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;
  var Q = '';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux fournisseurs.")}',
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

  /* ══ LE REPERTOIRE DE GROSSISTES (#6) ═════════════════════════════════════
     L ecran web offrait un carnet de grossistes connus, avec un ajout en un
     clic. Cette fenetre ne l avait pas : il fallait ressaisir nom, courriel,
     telephone et site a la main, pour un fournisseur deja repertorie. */
  var REP = null;         // { entrees, cats, pays, peutAjouter } ou null
  var REP_Q = '', REP_CAT = '', REP_PAYS = '';

  function vueRepertoire(){
    var d = REP;
    var h = '<div class="barreoutils">'
      + '<button class="mini" id="rep-retour">${T("← Mes fournisseurs")}</button>'
      + '<input aria-label="${T("Nom, description, ville")}" type="search" id="rep-q" placeholder="${T("Nom, description, ville…")}" value="' + esc(REP_Q) + '">'
      + '<select id="rep-cat"><option value="">${T("Toutes catégories")}</option>'
      + (d.cats || []).map(function(c){
          return '<option value="' + esc(c) + '"' + (REP_CAT === c ? ' selected' : '') + '>'
            + esc(c) + '</option>'; }).join('') + '</select>'
      + '<select id="rep-pays"><option value="">${T("Tous les pays")}</option>'
      + (d.pays || []).map(function(p){
          return '<option value="' + esc(p.cle) + '"' + (REP_PAYS === p.cle ? ' selected' : '') + '>'
            + esc(p.nom) + '</option>'; }).join('') + '</select>'
      + '<span class="droite">' + (d.entrees || []).length + '${T(" sur ")}' + (d.total || 0) + '</span></div>';

    if (!(d.entrees || []).length) {
      return h + '<div class="carte"><div class="vide">${T("Aucun résultat pour cette recherche.")}</div></div>';
    }
    h += '<div class="repgrille">' + d.entrees.map(function(s){
      return '<div class="repcarte">'
        + '<div class="reptete"><strong>' + esc(s.nom) + '</strong>'
        + '<span class="pill neutre">' + esc(s.cat) + '</span></div>'
        + '<div class="dt">' + esc(s.paysLibelle) + ' · ' + esc(s.lieu) + '</div>'
        + '<div class="repquoi">' + esc(s.quoi) + '</div>'
        + '<div class="dt">' + (s.courriel ? esc(s.courriel) : '')
        + (s.tel ? (s.courriel ? ' · ' : '') + esc(s.tel) : '') + '</div>'
        + (s.site ? '<div class="dt">' + esc(s.site) + '</div>' : '')
        + '<div class="repfin">'
        // ⚠ Deja present : on le DIT au lieu d offrir un bouton qui refuse.
        + (s.dejaAjoute
            ? '<span class="pill bon">${T("Déjà dans vos fournisseurs")}</span>'
            : (d.peutAjouter
                ? '<button class="mini prim" data-repadd="' + esc(s.nom) + '">${T("+ Ajouter")}</button>'
                : '<span class="dt">${T("consultation seulement")}</span>'))
        + '</div></div>'; }).join('') + '</div>';
    return h;
  }

  function chargerRepertoire(){
    dire('${T("Lecture du répertoire…")}');
    appeler('repertoire:donnees', [REP_Q, REP_CAT, REP_PAYS]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      REP = r; dire(''); dessiner();
    });
  }

  function dessiner(){
    /* ⚠⚠ LA PLEINE HAUTEUR NE VAUT QUE POUR LA LISTE (2026-09-19). Le
       REPERTOIRE dessine une grille de cartes SANS conteneur defilant : sous
       << corps plein >> (overflow:hidden) une longue liste de grossistes serait
       COUPEE, sans barre de defilement et sans que rien ne le dise. On rend
       donc le corps a son defilement normal des qu on entre dans le repertoire.
       ⚠ C est la contrepartie annoncee par le socle : l adoption de la pleine
       hauteur est un choix par ECRAN, et ici par VUE. */
    corps.className = REP ? 'corps' : 'corps plein';
    if (REP) { corps.innerHTML = vueRepertoire(); brancherRepertoire(); return; }
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    var rows = D.lignes || [];
    var h = '<div class="barreoutils">'
      + '<input aria-label="${T("Nom, contact ou courriel")}" type="search" id="f-q" placeholder="${T("Nom, contact ou courriel…")}" value="' + esc(Q) + '">'
      + '<span class="droite">' + (D.total || 0) + '${T(" au total")}'
      + '<button class="mini" id="f-repertoire" title="${T("Un carnet de grossistes connus, à ajouter en un clic")}"><span class="ic">🔎</span>${T(" Répertoire")}</button>'
      + '<button class="prim" id="f-nouveau">${T("+ Nouveau fournisseur")}</button></span>'
      + '</div>';
        /* ⚠ PLEINE HAUTEUR (2026-09-19) : la carte prend tout l espace restant et
       c est la LISTE qui defile. Sans ca, une liste courte s arrete a sa
       derniere ligne et laisse des centaines de pixels morts sous elle. */
    h += '<div class="carte plein">';
    if (!rows.length) {
      h += '<div class="vide">' + (D.total ? '${T("Aucun résultat.")}' : '${T("Aucun fournisseur — créez-en un pour commencer.")}') + '</div>';
    } else {
      h += '<div class="liste"><table><thead><tr><th>${T("Fournisseur")}</th><th>${T("Contact")}</th><th>${T("Courriel / Tél.")}</th>'
        + '<th>${T("Catégories")}</th><th>${T("Statut")}</th>' + (D.peutSupprimer ? '<th></th>' : '') + '</tr></thead><tbody>'
        + rows.map(function(r){
            return '<tr data-id="' + esc(r.id) + '" title="${T("Ouvrir la fiche fournisseur")}">'
              + '<td><span class="num">' + esc(r.nom) + '</span>'
              + szVerrouCase('suppliers', r.id)
              + (r.site ? '<div class="dt">' + esc(r.site) + '</div>' : '') + '</td>'
              + '<td>' + esc(r.contact || '—') + '</td>'
              + '<td>' + esc(r.courriel || '—')
              + (r.telephone ? '<div class="dt">' + esc(r.telephone) + '</div>' : '') + '</td>'
              + '<td>' + ((r.categories || []).map(function(c){
                  return '<span class="pill neutre">' + esc(c) + '</span>'; }).join('') || '—') + '</td>'
              + '<td>' + (r.actif ? '<span class="pill bon">${T("Actif")}</span>' : '<span class="pill neutre">${T("Inactif")}</span>') + '</td>'
              /* ⚠ ARME EN DEUX CLICS, comme partout ailleurs : une fiche
                 supprimee ne se reconstitue pas, et la ligne entiere est deja
                 cliquable pour OUVRIR — un bouton a un seul clic juste a cote
                 serait un piege. */
              + (D.peutSupprimer
                  ? '<td style="text-align:right"><button class="mini danger" data-suppr="' + esc(r.id) + '">'
                    + (SUPPR_ARME === r.id ? '${T("Confirmer ?")}' : '${T("Supprimer")}') + '</button></td>'
                  : '')
              + '</tr>';
          }).join('')
        + '</tbody></table></div>';
    }
    h += '</div>';
    /* ⚠⚠ LE PIED DE LISTE (mesure du 2026-09-19). Cet écran était le pire du
       relevé des zones mortes : un trou de 1100 x 567 px — 75 % de la fenêtre —
       sous une carte de quelques lignes. Devant ça, l'œil ne sait pas s'il a
       tout vu ou si le chargement s'est arrêté.
       ➡ Le pied FERME la liste et porte les gestes suivants là où le regard
       tombe. Il ne REMPLIT pas le vide : étirer la carte aurait donné une
       grande carte vide, pire qu'une page vide.
       ⚠ RIEN SOUS UNE LISTE VIDE : l'état vide a déjà son propre dessin, et
       « fin de la liste » sous une liste qui n'a jamais commencé serait faux. */
    if (rows.length) {
      /* ⚠ LE PLURIEL S ACCORDE, il ne se met pas entre parenthèses. C'est la
         règle de ce dépôt, et le banc des pluriels la garde : « 1 fournisseur
         (s) » n'existe dans aucune langue, et l'anglais n'a pas les mêmes
         formes que le français. */
      h += szPied(
        rows.length === (D.total || rows.length)
          ? rows.length + ' ' + (rows.length > 1 ? '${T("fournisseurs")}' : '${T("fournisseur")}')
          : rows.length + '${T(" sur ")}' + (D.total || 0),
        '<button class="mini" id="f-exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>'
        + '<button class="mini" id="f-repertoire2"><span class="ic">🔎</span>${T(" Répertoire")}</button>'
        + '<button class="mini" id="f-nouveau2">${T("+ Nouveau fournisseur")}</button>');
    }
    corps.innerHTML = h;
    szVerrousPeindre();   // reposer les cadenas connus sur le tableau frais

    var q = document.getElementById('f-q');
    if (q) {
      q.oninput = function(){
        Q = q.value;
        clearTimeout(window._fq);
        window._fq = setTimeout(function(){ charger(true); }, 300);
      };
    }
    /* ⚠ LES DEUX GESTES SONT BRANCHÉS AUX DEUX ENDROITS, par le même
       gestionnaire. Le pied de liste répète les boutons de la barre d'outils
       là où le regard tombe après avoir lu la liste ; deux gestionnaires
       différents pour un même geste finiraient par diverger, et c'est celui
       qu'on ne lit pas qui déciderait. */
    var ouvrirNouveau = function(){
      dire('${T("Ouverture…")}');
      appeler('fournisseurs:nouveau', []).then(function(r){
        dire(r.ok ? '${T("Assistant fournisseur ouvert dans sa fenêtre.")}' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
    var ouvrirRepertoire = function(){ REP_Q = ''; REP_CAT = ''; REP_PAYS = ''; chargerRepertoire(); };
    ['f-nouveau', 'f-nouveau2'].forEach(function(id){
      var b = document.getElementById(id); if (b) b.onclick = ouvrirNouveau;
    });
    ['f-repertoire', 'f-repertoire2'].forEach(function(id){
      var b = document.getElementById(id); if (b) b.onclick = ouvrirRepertoire;
    });

    /* ⚠⚠ ON EXPORTE CE QUI EST À L'ÉCRAN, PAS LA BASE ENTIÈRE. Si une recherche
       filtre la liste, le fichier porte le résultat filtré — c'est ce que la
       personne voit et ce qu'elle croit demander. Exporter silencieusement les
       400 fournisseurs alors que l'écran en montre 3 serait la pire des
       surprises : un fichier qui ne ressemble pas à l'écran d'où il sort.
       ⚠ Et le nom du fichier PORTE LA DATE : deux exports du même écran à deux
       jours d'intervalle ne doivent pas s'écraser l'un l'autre. */
    var ex = document.getElementById('f-exporter');
    if (ex) ex.onclick = function(){
      var lignes = (D.lignes || []).map(function(r){
        return [r.nom || '', r.contact || '', r.courriel || '', r.telephone || '',
          (r.categories || []).join(' · '),
          r.actif ? '${T("Actif")}' : '${T("Inactif")}', r.site || ''];
      });
      if (!lignes.length) { dire('${T("Rien à exporter.")}', 'att'); return; }
      var csv = szCSV(['${T("Fournisseur")}', '${T("Contact")}', '${T("Courriel")}',
        '${T("Téléphone")}', '${T("Catégories")}', '${T("Statut")}', '${T("Site")}'], lignes);
      var jour = new Date().toISOString().slice(0, 10);
      szExporter('fournisseurs-' + jour + '.csv', csv, '${T("La liste des fournisseurs")}');
    };
  }

  function brancherRepertoire(){
    var r = document.getElementById('rep-retour');
    // ⚠ Quitter le repertoire RECHARGE la liste : un grossiste ajoute doit y
    // apparaitre tout de suite, sinon on croit que l ajout n a pas pris.
    if (r) r.onclick = function(){ REP = null; charger(); };
    var q = document.getElementById('rep-q');
    if (q) q.oninput = function(){
      REP_Q = q.value;
      clearTimeout(window._rq);
      window._rq = setTimeout(chargerRepertoire, 300);
    };
    var c = document.getElementById('rep-cat');
    if (c) c.onchange = function(){ REP_CAT = c.value; chargerRepertoire(); };
    var p = document.getElementById('rep-pays');
    if (p) p.onchange = function(){ REP_PAYS = p.value; chargerRepertoire(); };
    if (q) { try { q.focus({ preventScroll: true }); q.setSelectionRange(q.value.length, q.value.length); } catch (e) {} }
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var ra = t.closest('[data-repadd]');
    if (ra) {
      var nom = ra.getAttribute('data-repadd');
      ra.disabled = true;
      appeler('repertoire:ajouter', [nom]).then(function(r){
        if (!r.ok) {
          ra.disabled = false;
          dire(r.motif === 'deja_present'
            ? (esc(nom) + '${T(" est déjà dans vos fournisseurs.")}') : expliquer(r), 'err');
          return;
        }
        dire(esc(r.nom) + '${T(" ajouté à vos fournisseurs.")}', 'bon');
        chargerRepertoire();   // la carte passe a << Deja dans vos fournisseurs >>
      });
      return;
    }
    if (REP) return;   // rien d autre ne s ecoute dans le repertoire
    var su = t.closest('[data-suppr]');
    if (su) { supprimer(su.getAttribute('data-suppr')); return; }
    if (t.closest('button') || t.closest('input')) return;
    var tr = t.closest('tr[data-id]');
    if (!tr) return;
    dire('${T("Ouverture…")}');
    appeler('fournisseurs:ouvrir', [tr.getAttribute('data-id')]).then(function(r){
      dire(r.ok ? '${T("Fiche fournisseur ouverte dans sa fenêtre.")}' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  };

  /* ── SUPPRIMER UN FOURNISSEUR (#33) ────────────────────────────────────────
     Ce geste manquait, et l en-tete de ce fichier l ecrivait : << la suppression
     reste un geste de l ecran du site >>. Cet ecran ne s ouvre plus depuis que
     la section est ancrable — le geste avait donc disparu pour tout le monde.
     ⚠ ON DIT CE QUI ARRIVE AUX PRODUITS RATTACHES. Ils restent en place, sans
     fournisseur : c est le seul effet de bord, et il est invisible d ici. */
  var SUPPR_ARME = null;
  function supprimer(id){
    if (SUPPR_ARME !== id) {
      SUPPR_ARME = id; dessiner();
      dire('${T("Recliquez pour confirmer — la fiche disparaît, les produits rattachés restent sans fournisseur.")}', 'att');
      return;
    }
    SUPPR_ARME = null;
    dire('${T("Suppression…")}');
    appeler('fournisseurs:supprimer', [id]).then(function(r){
      if (!r || !r.ok) { dessiner(); dire('${T("Échec : ")}' + expliquer(r), 'err'); return; }
      charger();
      /* ⚠ PAS DE esc() DANS UN MESSAGE : szDire ecrit en textContent, donc un
         nom echappe s afficherait avec ses entites en toutes lettres. */
      /* Deux formes ENTIERES : un << s >> colle a part ne se traduit pas. */
      dire('« ' + (r.nom || '') + '${T(" » supprimé.")}'
        + (r.rattaches ? ' ' + r.rattaches
            + (r.rattaches > 1 ? '${T(" produits restent sans fournisseur.")}'
                               : '${T(" produit reste sans fournisseur.")}') : ''), 'bon');
    });
  }

  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('fournisseurs:liste', [{ q: Q }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('${T("Fournisseurs indisponibles")}', expliquer(r)); return; }
      D = r;
      dire('');
      if (garderSaisie) redessinerSansPerdreLaSaisie();
      else dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('f-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('f-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  window.szActualiser = function(){
    // ⚠ Ne jamais redessiner par-dessus le repertoire ouvert : on perdrait la
    // recherche en cours et la place dans la liste.
    if (REP) return;
    var q = document.getElementById('f-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ if (!REP) charger(); };

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
  szVerrousSuivre(['suppliers']);
})();
</script>
</body></html>`;
}

module.exports = { pageFournisseurs };
