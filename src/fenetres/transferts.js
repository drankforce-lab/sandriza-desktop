'use strict';

/*
 * FENÊTRE « TRANSFERTS DE STOCK » — NATIVE (4.9.0)
 * =============================================================================
 * Sa demande, dans ses mots : « Les entrepôts existent, le déplacement de stock
 * d'un lieu à l'autre non — il se fait par deux ajustements manuels, sans trace.
 * Un vrai transfert (parti / reçu) évite l'écart d'inventaire. »
 *
 * ⚠⚠ TOUT L'ÉCRAN EST BÂTI AUTOUR D'UNE SEULE PHRASE : l'écart entre ce qui est
 * PARTI et ce qui est REÇU doit être VISIBLE et NOMMÉ. C'est pourquoi la
 * réception ne se valide PAS tant qu'un manque n'a pas sa cause, et pourquoi
 * l'historique montre l'écart en rouge avec son motif plutôt qu'un simple
 * « reçu ». Un écart qu'on peut fermer d'un clic est un écart qui disparaît.
 *
 * ⚠ LA FENÊTRE NE CALCULE RIEN. Les règles (transit, refus d'un écart sans
 * motif, retour du stock à l'annulation, journal) vivent dans les cœurs de
 * `assets/js/transferts.js`, côté site — les mêmes que celles qu'éprouve
 * `tools/check/banc-transferts.js`.
 *
 * ⚠ CE QUE CET ÉCRAN NE FAIT PAS, ET IL LE DIT LUI-MÊME À L'USAGE : il ne scinde
 * pas une variante entre deux entrepôts. Le stock du site n'est pas par
 * entrepôt (une quantité, un emplacement) — décision prise avec lui le
 * 2026-08-22 : le transfert COMPLET d'une variante maintenant, le stock par
 * entrepôt plus tard s'il le décide.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

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
.onglets{flex:0 0 auto;display:flex;gap:.4rem;padding:.5rem 1.05rem 0;
  border-bottom:1px solid var(--v08)}
.onglets button{background:transparent;border:none;border-bottom:2px solid transparent;
  color:var(--tx2);padding:.4rem .7rem;font-weight:600;font-size:.86rem;border-radius:6px 6px 0 0}
.onglets button:hover{background:var(--v05);color:var(--tx)}
.onglets button.actif{color:var(--tx-creme);border-bottom-color:#c9a97e}
.onglets .pastille{display:inline-block;min-width:1.15rem;padding:0 .3rem;margin-left:.35rem;
  border-radius:99px;background:#c9a97e;color:#1a1207;font-size:.68rem;font-weight:800;text-align:center}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
input,button,select{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.32rem .55rem}
input[type=search]{min-width:220px}
button{cursor:pointer;-webkit-user-select:none;user-select:none}
input:focus,button:focus,select:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .45rem;font-size:.74rem}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600;padding:.36rem .8rem}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte.transit{border-left:3px solid #fbbf24}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;
  color:var(--tx2);font-weight:700}
.ligne{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}
.ligne .nom{font-weight:600}
.ligne .sku{font:.76rem/1.3 Consolas,monospace;color:var(--tx2)}
/* ⚠ LE TRAJET TENAIT SUR DEUX LIGNES ET MANGEAIT LA MOITIE DU TABLEAU (sa
   capture du 2026-08-22). Un libelle complet fait « Maison - Casier 1 - Section
   A » : encadre et laisse libre de revenir a la ligne, il pousse les colonnes
   qui portent les CHIFFRES — parti, recu, ecart — a l extreme droite, la ou on
   ne les lit plus ensemble. On empile donc le lieu (en gras) et le detail
   casier/section (en petit, gris), sans cadre, sans retour a la ligne. */
.trajet{display:inline-flex;align-items:center;gap:.55rem;font-size:.82rem;white-space:nowrap}
.trajet .lieu{display:inline-block;line-height:1.25}
.trajet .lieu b{font-weight:600}
.trajet .lieu i{display:block;font-style:normal;font-size:.72rem;color:var(--tx2)}
.trajet .fleche{color:var(--tx-or);font-weight:800;font-size:1rem}
.qte{font-variant-numeric:tabular-nums;font-weight:800;font-size:1.05rem}
.dt{font-size:.72rem;color:var(--tx2)}
.avis{background:rgba(148,163,184,.1);border:1px solid rgba(148,163,184,.22);
  border-radius:10px;padding:.5rem .65rem;font-size:.79rem;color:var(--tx-bleute);line-height:1.55}
.avis.jaune{background:rgba(217,119,6,.12);border-color:rgba(217,119,6,.3);color:var(--tx-fcd9a6)}
table{width:100%;border-collapse:collapse;font-size:.85rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.66rem;text-transform:uppercase;
  letter-spacing:.05em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.32rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody tr:hover td{background:var(--v04)}
.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
/* ⚠ « Robe ZENXAS · S-rouge » se coupait au milieu de « S-rouge » (sa capture).
   Un identifiant de variante coupe en deux ne se lit plus : on preserve les
   mots, et le SKU — qui n a aucune raison de revenir a la ligne — reste d un
   bloc. La colonne prend la largeur qu il faut, pas celle qui reste. */
th.art,td.art{min-width:13rem}
td.art .nom{font-weight:600;overflow-wrap:normal;word-break:keep-all}
td.art .sku{white-space:nowrap}
/* La date et son auteur : deux lignes voulues, pas trois subies. */
td.quand{white-space:nowrap;font-size:.78rem;line-height:1.35}
td.quand .qui{color:var(--tx2);font-size:.72rem}
/* ⚠ L ECART SE VOIT DE LOIN, ET C EST LE POINT DE TOUT L ECRAN. Un manque ecrit
   en gris se lit comme une colonne de plus ; en rouge, avec son motif a cote,
   il se lit comme un evenement. */
.ecart{color:var(--tx-err);font-weight:800}
.ecart0{color:var(--tx-ok)}
.pill{display:inline-block;font-size:.66rem;padding:.05rem .5rem;border-radius:99px;font-weight:700}
.pill.transit{background:rgba(251,191,36,.2);color:#fcd34d}
.pill.recu{background:rgba(74,222,128,.18);color:#86efac}
.pill.annule{background:rgba(148,163,184,.2);color:var(--tx-gris2)}
.recevoir{margin-top:.6rem;padding-top:.6rem;border-top:1px solid var(--v08);
  display:flex;flex-direction:column;gap:.5rem}
.recevoir .rangee{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap}
.recevoir label{font-size:.74rem;color:var(--tx2)}
.recevoir input[type=number]{width:6.5rem;text-align:right}
.vide{padding:1.6rem .6rem;text-align:center;color:var(--tx2);font-size:.85rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* Page complète de la fenêtre native « Transferts de stock ».
   `ouverture` : '' (En transit) · 'histo' · 'neuf'.
   ⚠ CE PARAMÈTRE N'EST PAS DU CONFORT, IL REND L'ÉCRAN ÉPROUVABLE. Le contrôle
   qui exécute les fenêtres ne CLIQUE PAS — il le dit lui-même. Sans une porte
   d'entrée par onglet, l'historique (la seule vue qui dessine l'écart et son
   motif, c'est-à-dire le cœur de cet écran) ne serait jamais atteint, et la
   fenêtre serait déclarée « saine » sur sa moitié la moins importante.
   Vérifié en injectant une variable libre dans `vueHisto` : sans ce paramètre,
   le contrôle ne l'accusait pas. */
function pageTransferts(ouverture) {
  const ouv = (String(ouverture || '') === 'histo') ? 'histo'
            : (String(ouverture || '') === 'neuf') ? 'neuf' : 'transit';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Transferts de stock — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.shipping}</span><h1>Transferts de stock</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets" id="onglets"></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
  var corps = document.getElementById('corps');
  var ongletsEl = document.getElementById('onglets');
  var sousEl = document.getElementById('sous');

  var D = null;              // reponse de transfert:donnees
  var TAB = ${JSON.stringify(ouv)};   // transit | histo | neuf
  var CAND = null;           // candidats de l onglet Nouveau
  var RECH = '';
  var F_LIEU = '';           // filtre par lieu (ou '_sans')
  var F_SECTION = '';        // filtre par section
  var OUVERT = '';           // id du transfert dont le volet Recevoir est ouvert
  var BUSY = false;

${JS_ACTIVITE}${JS_DIRE}

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function plur(n){ return n > 1 ? 's' : ''; }
  function dateCourte(iso){
    if (!iso) return '';
    try { var d = new Date(iso);
      return d.toLocaleDateString('fr-CA') + ' ' + d.toLocaleTimeString('fr-CA', {hour:'2-digit',minute:'2-digit'}); }
    catch(e){ return String(iso).slice(0,16).replace('T',' '); }
  }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès à l’inventaire.',
    indisponible:'L’administration n’est pas encore chargée dans la fenêtre principale.',
    introuvable:'Ce transfert n’existe plus.',
    produit_disparu:'La fiche produit n’existe plus — le stock ne peut pas être remis.',
    deja_clos:'Ce transfert est déjà clos.',
    sans_stock:'Cette variante n’a plus de stock à envoyer.',
    sans_origine:'Cette variante n’a pas d’emplacement : on ne saurait pas d’où elle part.',
    destination_inconnue:'Choisissez un entrepôt de destination.',
    meme_entrepot:'L’origine et la destination sont le même entrepôt.',
    deja_en_transit:'Un transfert est déjà en cours pour cette variante.',
    quantite_invalide:'Saisissez une quantité reçue valide.',
    verrou:'La fiche produit est ouverte par un collègue — réessayez dans un moment.',
    grille_incomplete:'La fiche produit a changé (tailles ou couleurs). Rouvrez cet écran.',
    echec:'L’opération a échoué.',
  };
  function expliquer(r){
    if (!r) return 'Aucune réponse de la fenêtre principale.';
    if (r.detail) return String(r.detail);
    if (r.motif === 'plus_que_parti') return 'Vous ne pouvez pas recevoir plus que les ' + r.parti + ' unité' + plur(r.parti) + ' parties.';
    if (r.motif === 'ecart_sans_motif') return 'Il manque ' + r.ecart + ' unité' + plur(r.ecart) + ' : dites pourquoi avant d’enregistrer.';
    return MOTIFS[r.motif] || ('Erreur inattendue (' + esc(r.motif || '?') + ').');
  }

  function appeler(op, args){
    if (!P || !P.appeler) return Promise.resolve({ ok:false, motif:'indisponible' });
    return P.appeler.apply(P, [op].concat(args || []))
      .catch(function(){ return { ok:false, motif:'echec' }; });
  }

  /* ══ CHARGEMENT ══════════════════════════════════════════════════════════ */
  function charger(){
    return appeler('transfert:donnees', []).then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>';
        ongletsEl.innerHTML = '';
        return false;
      }
      D = r; dessiner(); return true;
    });
  }

  function enTransit(){ return (D.transferts || []).filter(function(t){ return t.etat === 'transit'; }); }
  function clos(){ return (D.transferts || []).filter(function(t){ return t.etat !== 'transit'; }); }

  /* ══ DESSIN ══════════════════════════════════════════════════════════════ */
  function dessiner(){
    if (!D) return;
    var nT = enTransit().length;
    ongletsEl.innerHTML =
        '<button data-tab="transit" class="' + (TAB==='transit'?'actif':'') + '">En transit'
      +   (nT ? '<span class="pastille">' + nT + '</span>' : '') + '</button>'
      + '<button data-tab="histo" class="' + (TAB==='histo'?'actif':'') + '">Historique</button>'
      + (D.peutEcrire ? '<button data-tab="neuf" class="' + (TAB==='neuf'?'actif':'') + '">Nouveau transfert</button>' : '');

    var ecarts = clos().reduce(function(s,t){ return s + (t.ecart || 0); }, 0);
    sousEl.textContent = nT + ' en transit'
      + (ecarts ? '  ·  ' + ecarts + ' unité' + plur(ecarts) + ' d’écart cumulé' : '');

    if (TAB === 'transit') corps.innerHTML = vueTransit();
    else if (TAB === 'histo') corps.innerHTML = vueHisto();
    else corps.innerHTML = vueNeuf();
  }

  /* Le lieu en gras, le casier et la section en dessous, en petit.
     ⚠ ON DECOUPE LE LIBELLE plutot que d exiger des champs separes du coeur :
     deNom et versNom portent le libelle compose (« Maison - Casier 1 - Section
     A »), et un transfert ANCIEN garde le sien meme si l emplacement a ete
     renomme depuis. Le decouper a l affichage n invente rien ; demander les
     parties au coeur ferait mentir l historique.
     ⚠ AUCUN ACCENT GRAVE ICI : ce commentaire vit dans un gabarit. */
  function lieuHtml(libelle){
    var s = String(libelle || '—');
    var i = s.indexOf(' - ');
    if (i < 0) return '<span class="lieu"><b>' + esc(s) + '</b></span>';
    return '<span class="lieu"><b>' + esc(s.slice(0, i)) + '</b>'
      + '<i>' + esc(s.slice(i + 3)) + '</i></span>';
  }
  function trajet(t){
    return '<span class="trajet">' + lieuHtml(t.deNom)
      + '<span class="fleche">→</span>' + lieuHtml(t.versNom) + '</span>';
  }

  function vueTransit(){
    var l = enTransit();
    if (!l.length) {
      return '<div class="vide">Aucun transfert en cours.'
        + (D.peutEcrire ? '<br><span class="dt">Onglet <strong>Nouveau transfert</strong> pour en lancer un.</span>' : '')
        + '</div>';
    }
    /* ⚠ L AVIS EST EN HAUT, PAS DANS UNE INFOBULLE. Pendant le trajet, l article
       est EPUISE sur la boutique : c est exact (il est dans un camion), mais
       quelqu un qui l ignore croira a un defaut. On le dit avant, pas apres. */
    return '<div class="avis jaune">Les unités en transit sont <strong>retirées du stock vendable</strong> : '
      + 'l’article s’affiche épuisé sur la boutique le temps du trajet, et les clients inscrits à l’alerte '
      + '« de retour en stock » sont prévenus à la réception.</div>'
      + l.map(carteTransit).join('');
  }

  function carteTransit(t){
    var ouvert = (OUVERT === t.id);
    return '<div class="carte transit">'
      + '<div class="ligne">'
      +   '<span class="qte">' + t.quantite + '</span>'
      +   '<span><span class="nom">' + esc(t.nom) + '</span> · ' + esc(t.cle) + '<br>'
      +     '<span class="sku">' + esc(t.sku) + '</span></span>'
      +   trajet(t)
      +   '<span class="pill transit">en transit</span>'
      +   '<span style="margin-left:auto;display:flex;gap:.4rem">'
      +     (D.peutEcrire ? '<button class="prim mini" data-rec="' + t.id + '">' + (ouvert ? 'Fermer' : '✓ Recevoir') + '</button>' : '')
      +     (D.peutEcrire ? '<button class="mini danger" data-ann="' + t.id + '">Annuler</button>' : '')
      +   '</span>'
      + '</div>'
      + '<div class="dt" style="margin-top:.3rem">Parti le ' + esc(dateCourte(t.partiLe))
      +   (t.partiPar ? ' par ' + esc(t.partiPar) : '') + (t.note ? ' — ' + esc(t.note) : '') + '</div>'
      + (ouvert ? voletRecevoir(t) : '')
      + '</div>';
  }

  /* ⚠ LE MOTIF N APPARAIT QUE QUAND IL Y A UN ECART, et il devient alors
     OBLIGATOIRE. L afficher tout le temps ferait choisir une cause a une
     reception complete ; ne jamais l afficher laisserait le manque passer. */
  function voletRecevoir(t){
    return '<div class="recevoir">'
      + '<div class="rangee">'
      +   '<label for="rq-' + t.id + '">Quantité réellement reçue</label>'
      +   '<input type="number" id="rq-' + t.id + '" min="0" max="' + t.quantite + '" value="' + t.quantite + '" data-qte="' + t.id + '">'
      +   '<span class="dt">sur ' + t.quantite + ' partie' + plur(t.quantite) + '</span>'
      + '</div>'
      + '<div class="rangee" id="rm-' + t.id + '" style="display:none">'
      +   '<label for="rmo-' + t.id + '">Motif de l’écart</label>'
      +   '<select id="rmo-' + t.id + '"><option value="">— choisir —</option>'
      +     (D.motifs || []).map(function(m){ return '<option value="' + esc(m.v) + '">' + esc(m.l) + '</option>'; }).join('')
      +   '</select>'
      +   '<input type="text" id="rn-' + t.id + '" placeholder="Note (facultative)" style="flex:1;min-width:12rem">'
      + '</div>'
      + '<div class="rangee" id="rw-' + t.id + '" style="display:none">'
      +   '<div class="avis jaune" style="flex:1">Il manque <strong id="re-' + t.id + '">0</strong> unité(s). '
      +     'Ce manque sera <strong>inscrit au journal</strong> avec son motif — il ne disparaît pas de l’inventaire tout seul.</div>'
      + '</div>'
      + '<div class="rangee">'
      +   '<button class="prim" data-recok="' + t.id + '"' + (BUSY ? ' disabled' : '') + '>Enregistrer la réception</button>'
      + '</div>'
      + '</div>';
  }

  function vueHisto(){
    var l = clos();
    if (!l.length) return '<div class="vide">Aucun transfert terminé.</div>';
    /* ⚠ L ORDRE DES COLONNES A CHANGE (sa capture du 2026-08-22) : l ETAT vient
       juste apres le trajet, et les trois CHIFFRES sont cote a cote a la fin.
       Parti / recu / ecart se lisent ENSEMBLE ou ne se lisent pas — separes par
       un motif et un etat, l oeil doit sauter par-dessus pour comparer. */
    return '<div class="carte"><table><thead><tr>'
      + '<th class="art">Article</th><th>Trajet</th><th>État</th>'
      + '<th class="num">Parti</th><th class="num">Reçu</th><th class="num">Écart</th>'
      + '<th>Motif</th><th>Le</th>'
      + '</tr></thead><tbody>'
      + l.map(function(t){
          var ec = t.ecart || 0;
          return '<tr>'
            + '<td class="art"><span class="nom">' + esc(t.nom) + '</span> · ' + esc(t.cle)
            +   '<br><span class="sku">' + esc(t.sku) + '</span></td>'
            + '<td>' + trajet(t) + '</td>'
            + '<td><span class="pill ' + esc(t.etat) + '">' + (t.etat === 'recu' ? 'reçu' : 'annulé') + '</span></td>'
            + '<td class="num">' + t.quantite + '</td>'
            + '<td class="num">' + (t.quantiteRecue === null ? '—' : t.quantiteRecue) + '</td>'
            + '<td class="num ' + (ec ? 'ecart' : 'ecart0') + '">' + (t.etat === 'annule' ? '—' : (ec ? '−' + ec : '0')) + '</td>'
            + '<td>' + (t.motifLbl ? esc(t.motifLbl) : '<span class="dt">—</span>')
            +   (t.noteEcart ? '<br><span class="dt">' + esc(t.noteEcart) + '</span>' : '') + '</td>'
            + '<td class="quand">' + esc(dateCourte(t.recuLe))
            +   (t.recuPar ? '<br><span class="qui">' + esc(t.recuPar) + '</span>' : '') + '</td>'
            + '</tr>';
        }).join('')
      + '</tbody></table></div>';
  }

  function vueNeuf(){
    if (!(D.entrepots || []).length) {
      return '<div class="vide">Aucun entrepôt n’est configuré.<br>'
        + '<span class="dt">Créez-en au moins deux dans <strong>Inventaire → Emplacements</strong>.</span></div>';
    }
    if ((D.entrepots || []).length < 2) {
      return '<div class="vide">Un seul entrepôt est configuré.<br>'
        + '<span class="dt">Un transfert va d’un lieu à un autre : il en faut au moins deux.</span></div>';
    }
    /* ⚠ CHERCHER PAR NOM SUPPOSE QU ON SAIT LEQUEL ON CHERCHE. Devant les
       etageres, la question est plutot << qu est-ce qui est a la Maison ? >> ou
       << tout ce qui est en Section L >>. D ou les deux filtres, demandes le
       2026-08-22 — ils repondent a la question qu on se pose vraiment. */
    var haut = '<div class="carte"><h2>Choisir la variante à envoyer</h2>'
      + '<div class="ligne">'
      +   '<select id="f-lieu"><option value="">Tous les lieux</option>'
      +     (D.lieux || []).map(function(l){
              return '<option value="' + esc(l.id) + '"' + (F_LIEU === l.id ? ' selected' : '') + '>'
                + esc(l.nom) + '</option>'; }).join('')
      +     '<option value="_sans"' + (F_LIEU === '_sans' ? ' selected' : '') + '>— sans lieu —</option>'
      +   '</select>'
      +   '<input type="search" id="f-section" placeholder="Section…" value="' + esc(F_SECTION) + '" style="min-width:9rem">'
      +   '<input type="search" id="q" placeholder="Nom, SKU ou taille-couleur…" value="' + esc(RECH) + '">'
      +   '<button class="mini" data-act="chercher">Chercher</button>'
      + '</div>'
      + '<div class="dt" style="margin-top:.4rem">Le transfert emporte <strong>toute</strong> la quantité de la variante.</div></div>';
    if (!CAND) return haut + '<div class="vide">Lancez une recherche pour voir ce qui peut partir.</div>';
    if (!CAND.length) return haut + '<div class="vide">Aucune variante avec du stock <em>et</em> un emplacement connu.</div>';
    return haut + '<div class="carte"><table><thead><tr>'
      + '<th>Article</th><th class="num">Qté</th><th>Depuis</th><th>Vers</th><th></th>'
      + '</tr></thead><tbody>'
      + CAND.map(function(c){
          var id = c.productId + '|' + c.cle;
          return '<tr>'
            + '<td><strong>' + esc(c.nom) + '</strong> · ' + esc(c.cle) + '<br><span class="sku">' + esc(c.sku) + '</span></td>'
            + '<td class="num qte">' + c.qte + '</td>'
            /* ⚠ ON MONTRE CE SUR QUOI ON FILTRE. Filtrer par section sans
               afficher la section, c est demander de faire confiance a un tri
               qu on ne peut pas verifier. */
            + '<td><span class="lieu">' + esc(c.deNom) + '</span>'
            +   (c.lieuNom || c.section
                  ? '<br><span class="dt">' + esc([c.lieuNom, c.section].filter(Boolean).join(' · ')) + '</span>'
                  : '') + '</td>'
            + '<td><select data-vers="' + esc(id) + '"><option value="">— destination —</option>'
            +   (D.entrepots || []).filter(function(w){ return w.id !== c.de; })
                .map(function(w){ return '<option value="' + esc(w.id) + '">' + esc(w.code || w.nom) + '</option>'; }).join('')
            + '</select></td>'
            + '<td class="num"><button class="prim mini" data-part="' + esc(id) + '"' + (BUSY ? ' disabled' : '') + '>Envoyer</button></td>'
            + '</tr>';
        }).join('')
      + '</tbody></table></div>';
  }

  /* ══ GESTES ══════════════════════════════════════════════════════════════ */
  function chercher(){
    var el = document.getElementById('q');
    RECH = el ? el.value : '';
    var fl = document.getElementById('f-lieu');
    var fs = document.getElementById('f-section');
    F_LIEU = fl ? fl.value : '';
    F_SECTION = fs ? fs.value : '';
    dire('Recherche…');
    appeler('transfert:candidats', [{ q: RECH, lieuId: F_LIEU, section: F_SECTION }]).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      CAND = r.lignes || [];
      dessiner();
      dire(CAND.length + ' variante' + plur(CAND.length) + ' peut partir.', CAND.length ? 'bon' : 'att');
    });
  }

  function partir(id){
    if (BUSY) return;
    var i = id.indexOf('|');
    var productId = id.slice(0, i), cle = id.slice(i + 1);
    var sel = document.querySelector('[data-vers="' + id.replace(/"/g,'') + '"]');
    var vers = sel ? sel.value : '';
    if (!vers) { dire('Choisissez d’abord un entrepôt de destination.', 'att'); return; }
    BUSY = true; dessiner();
    dire('Envoi en cours…');
    appeler('transfert:partir', [{ productId: productId, cle: cle, vers: vers }]).then(function(r){
      BUSY = false;
      if (!r || !r.ok) { dessiner(); dire(expliquer(r), 'err'); return; }
      CAND = null; TAB = 'transit';
      charger().then(function(){ dire('Transfert lancé — les unités sont en transit.', 'bon'); });
    });
  }

  function recevoir(id){
    if (BUSY) return;
    var t = enTransit().filter(function(x){ return x.id === id; })[0];
    if (!t) return;
    var q = document.getElementById('rq-' + id);
    var recue = q ? parseInt(q.value, 10) : NaN;
    if (!isFinite(recue) || recue < 0) { dire('Saisissez une quantité reçue valide.', 'att'); return; }
    var ecart = t.quantite - recue;
    var mo = document.getElementById('rmo-' + id);
    var no = document.getElementById('rn-' + id);
    /* ⚠ ON REFUSE ICI AUSSI, PAS SEULEMENT DANS LE COEUR. Le coeur est l autorite
       — il refusera de toute facon — mais laisser partir l appel pour recevoir un
       refus fait clignoter l ecran sans expliquer OU regarder. Ici on peut poser
       le curseur sur le champ qui manque. */
    if (ecart > 0 && (!mo || !mo.value)) {
      dire('Il manque ' + ecart + ' unité' + plur(ecart) + ' : choisissez le motif de l’écart.', 'att');
      if (mo) mo.focus();
      return;
    }
    BUSY = true;
    appeler('transfert:recevoir', [{
      id: id, quantiteRecue: recue,
      motifEcart: mo ? mo.value : '', noteEcart: no ? no.value : '',
    }]).then(function(r){
      BUSY = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      OUVERT = '';
      charger().then(function(){
        dire(r.ecart
          ? 'Réception enregistrée — écart de ' + r.ecart + ' unité' + plur(r.ecart) + ', inscrit au journal.'
          : 'Réception enregistrée — tout est arrivé.', r.ecart ? 'att' : 'bon');
      });
    });
  }

  function annuler(id){
    if (BUSY) return;
    BUSY = true;
    appeler('transfert:annuler', [{ id: id }]).then(function(r){
      BUSY = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      OUVERT = '';
      charger().then(function(){ dire('Transfert annulé — le stock est rendu à l’entrepôt d’origine.', 'bon'); });
    });
  }

  /* ══ ÉCOUTEURS ═══════════════════════════════════════════════════════════ */
  document.addEventListener('click', function(e){
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest('button'); if (!b) return;
    var tab = b.getAttribute('data-tab');
    if (tab) { TAB = tab; OUVERT = ''; dessiner(); return; }
    var act = b.getAttribute('data-act');
    if (act === 'chercher') { chercher(); return; }
    var rec = b.getAttribute('data-rec');
    if (rec) { OUVERT = (OUVERT === rec) ? '' : rec; dessiner(); return; }
    var ok = b.getAttribute('data-recok');
    if (ok) { recevoir(ok); return; }
    var ann = b.getAttribute('data-ann');
    if (ann) { annuler(ann); return; }
    var part = b.getAttribute('data-part');
    if (part) { partir(part); return; }
  });

  /* La quantité change → l écart se recalcule SOUS LES YEUX, et le motif
     apparaît au moment exact où il devient obligatoire. */
  document.addEventListener('input', function(e){
    var t = e.target; if (!t || !t.getAttribute) return;
    var id = t.getAttribute('data-qte');
    if (!id) return;
    var tr = enTransit().filter(function(x){ return x.id === id; })[0];
    if (!tr) return;
    var recue = parseInt(t.value, 10);
    var ecart = (isFinite(recue) ? tr.quantite - recue : 0);
    var rm = document.getElementById('rm-' + id);
    var rw = document.getElementById('rw-' + id);
    var re = document.getElementById('re-' + id);
    if (rm) rm.style.display = ecart > 0 ? '' : 'none';
    if (rw) rw.style.display = ecart > 0 ? '' : 'none';
    if (re) re.textContent = ecart > 0 ? ecart : 0;
  });

  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    if (OUVERT) { OUVERT = ''; dessiner(); return; }
    if (P && P.fermer) P.fermer();
  });

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher'; b.type = 'button'; b.className = 'mini';
      b.style.cssText = 'margin-left:.5rem;flex:0 0 auto';
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

  // Rouvert apres avoir ete cache : les transferts ont pu bouger ailleurs.
  window.szRevenir = function(){ charger(); };

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageTransferts };
