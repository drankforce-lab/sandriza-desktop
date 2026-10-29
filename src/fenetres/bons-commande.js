'use strict';

/*
 * FENÊTRE « BONS DE COMMANDE FOURNISSEURS » — NATIVE (8.10.0, 2026-10-27)
 * =============================================================================
 * Sa demande (refonte de l'administration, point C) : « depuis À commander,
 * produire un bon par fournisseur (articles, quantités, coût), puis le marquer
 * reçu pour que l'inventaire monte tout seul ».
 *
 * ⚠⚠ « BON DE COMMANDE » SEUL EST DÉJÀ PRIS : c'est le document de préparation
 * d'une commande CLIENT. Ici on écrit toujours « bon de commande FOURNISSEUR »,
 * ou « bon » quand le contexte de la fenêtre le dit déjà.
 *
 * ⚠ LA FENÊTRE NE CALCULE RIEN QUI COMPTE. Les propositions (sous le seuil,
 * moins ce qui est déjà en commande) viennent des cœurs de
 * `assets/js/bons-commande.js` ; le cycle du bon et le stock vivent au serveur
 * (opération `bon_commande`). Elle affiche, recueille la saisie, et dit le refus.
 *
 * Trois onglets : « En cours » (brouillons, envoyés, reçus en partie — on y
 * reçoit), « À commander » (les propositions par fournisseur) et « Historique ».
 * `ouverture` : '' (En cours) · 'proposer' · 'histo'. ⚠ Ce paramètre rend chaque
 * onglet atteignable par le contrôle qui exécute les fenêtres sans cliquer.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION. On ne traduit QUE ce qui se lit —
   jamais une valeur enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('bons-commande');

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
.onglets button.actif{color:var(--tx-creme);border-bottom-color:var(--or)}
.onglets .pastille{display:inline-block;min-width:1.15rem;padding:0 .3rem;margin-left:.35rem;
  border-radius:99px;background:var(--or);color:#1a1207;font-size:.6875rem;font-weight:800;text-align:center}
.onglets .droite{margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow:hidden;
  display:flex;flex-direction:column;gap:.7rem}
.pile{display:flex;flex-direction:column;gap:.7rem}
/* La rangee d en-tete d un fournisseur, dans le tableau « A commander ». */
tr.groupe td{background:var(--v04);border-top:1px solid var(--v10);padding:.45rem .5rem}
tr.groupe:hover td{background:var(--v05)}
input,button,select,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.32rem .55rem}
input[type=search]{min-width:220px}
button{cursor:pointer;-webkit-user-select:none;user-select:none}
input:focus,button:focus,select:focus,textarea:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .45rem;font-size:.74rem}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600;padding:.36rem .8rem}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;
  color:var(--tx2);font-weight:700}
/* « .rang » et non « .ligne » : le socle habille .ligne en CARTE de jour (fond blanc, bordure). */
.rang{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}
.num-bc{font:700 .95rem/1.2 Consolas,monospace;color:var(--tx-creme)}
.four{font-weight:600}
.sku{font:.76rem/1.3 Consolas,monospace;color:var(--tx2)}
.dt{font-size:.72rem;color:var(--tx2)}
.montant{font-variant-numeric:tabular-nums;font-weight:700}
.prog{font-variant-numeric:tabular-nums;font-size:.8rem;color:var(--tx2)}
.gestes{margin-left:auto;display:flex;gap:.4rem;flex-wrap:wrap}
.avis{background:rgba(148,163,184,.1);border:1px solid rgba(148,163,184,.22);
  border-radius:10px;padding:.5rem .65rem;font-size:.79rem;color:var(--tx-bleute);line-height:1.55}
.avis.jaune{background:rgba(217,119,6,.12);border-color:rgba(217,119,6,.3);color:var(--tx-fcd9a6)}
table{width:100%;border-collapse:collapse;font-size:.85rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.05em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.32rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody tr:hover td{background:var(--v04)}
.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
td.art{min-width:12rem}
td.art .nom{font-weight:600}
input.q{width:5.2rem;text-align:right}
input.c{width:6.4rem;text-align:right}
.volet{margin-top:.6rem;padding-top:.6rem;border-top:1px solid var(--v08);display:flex;flex-direction:column;gap:.5rem}
.volet .rangee{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap}
.volet label{font-size:.74rem;color:var(--tx2)}
.vide{padding:1.6rem .6rem;text-align:center;color:var(--tx2);font-size:.85rem}
/* LES CASES A COCHER (gestes groupes, 2026-10-29) : « En cours » est fait de CARTES, pas d un tableau. La case
   du socle (szCoches) y est posee dans un <span class="szk-c"> ; la carte cochee est surlignee ici (le socle ne
   surligne qu un <tr>). « Historique » est un tableau : la case y est une cellule, comme ailleurs. */
.lot-rang{flex:0 0 auto;display:flex;align-items:center;gap:.5rem}
.lot-rang .szk-barre{flex:1 1 auto;margin:0}
.lot-rang .lot-tout{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:1.4rem;
  margin-left:calc(.75rem + 1px);cursor:pointer}
span.szk-c.lot-c{display:inline-flex;align-items:center;justify-content:center;width:1.4rem;cursor:pointer}
.pile>.carte.coche{border-color:rgba(var(--or-rgb),.6);background:rgba(var(--or-rgb),.1)}
.lot-motif{width:100%;margin:.9rem 0 0}
.lot-motif-err{min-height:1.1em;margin-top:.3rem;font-size:.76rem;color:var(--tx-err)}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageBonsCommande(ouverture) {
  const o = String(ouverture || '');
  const ouv = (o === 'histo') ? 'histo' : (o === 'proposer') ? 'proposer' : 'cours';
  return `${TETE()}
<title>${T("Bons de commande fournisseurs — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.shipping}</span><h1>${T("Bons de commande fournisseurs")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets" id="onglets"></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
  var corps = document.getElementById('corps');
  var ongletsEl = document.getElementById('onglets');
  var sousEl = document.getElementById('sous');

  var D = null;              // reponse de bc:donnees
  var PROP = null;           // reponse de bc:propositions (onglet A commander)
  var TAB = ${JSON.stringify(ouv)};   // cours | proposer | histo
  var OUVERT = '';           // id du bon dont un volet est ouvert
  var VOLET = '';            // recevoir | clore
  var EDIT = null;           // le bon en cours d edition : { id, fournisseurId, note, lignes:[...] }
  var TROUVES = null;        // resultats de la recherche d articles dans l editeur
  var BUSY = false;
  /* LA SAISIE DES VOLETS, PAR BON : { q: {n: valeur}, note, motif }. Un redessin (fenetre ramenee,
     actualisation) la remettait aux valeurs par defaut ; elle est relevee avant chaque dessin. */
  var SAISIE = {};

${JS_ACTIVITE()}${JS_DIRE()}

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  // La monnaie dans la langue de la page : szArgent du socle (le « $ » passe devant en anglais).
  function argent(n){ return szArgent(n); }
  // Un cout dans un champ numerique : deux decimales (12.50, pas 12.5). Le point est celui que le champ attend.
  function deux(n){ var v = Number(n); return isFinite(v) ? v.toFixed(2) : ''; }
  function dateCourte(iso){
    if (!iso) return '';
    try { return new Date(iso).toLocaleString('${LIEU()}', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch(e){ return String(iso).slice(0,16).replace('T',' '); }
  }

  var MOTIFS = {
    session:'${T("Aucune session ouverte. Connectez-vous dans la fenêtre principale.")}',
    droit:'${T("Votre rôle ne permet pas de gérer les bons de commande fournisseurs.")}',
    indisponible:'${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    introuvable:'${T("Ce bon n’existe plus.")}',
    fournisseur_requis:'${T("Choisissez un fournisseur de la liste.")}',
    bon_vide:'${T("Le bon n’a aucune ligne.")}',
    trop_de_lignes:'${T("Un bon ne peut pas dépasser 200 lignes.")}',
    produit_introuvable:'${T("Une fiche produit du bon n’existe plus.")}',
    produit_disparu:'${T("Une fiche produit du bon a été supprimée : rien n’a été reçu. Mettez sa ligne à 0 pour recevoir le reste, puis utilisez « Clore ».")}',
    ligne_changee:'${T("Le bon a été modifié sur un autre poste : rien n’a été reçu. Rouvrez-le et recommencez.")}',
    modifie_ailleurs:'${T("Ce brouillon a été modifié sur un autre poste entre-temps. Abandonnez et rouvrez-le pour voir sa version.")}',
    reseau:'${T("Le serveur ne répond pas. Réessayez dans un moment : un geste déjà appliqué ne le sera pas deux fois.")}',
    variante_inconnue:'${T("Une variante du bon n’existe plus dans sa fiche (taille ou couleur retirée).")}',
    variante_illisible:'${T("Une variante du bon a un nom illisible.")}',
    ligne_en_double:'${T("La même variante figure deux fois sur le bon.")}',
    quantite_invalide:'${T("Saisissez des quantités entières, de 1 à 100 000.")}',
    cout_invalide:'${T("Un coût est invalide (nombre positif attendu).")}',
    deja_envoye:'${T("Ce bon a déjà été envoyé : il ne se modifie plus.")}',
    deja_clos:'${T("Ce bon est déjà clos.")}',
    deja_recu_en_partie:'${T("Une partie a déjà été reçue : utilisez « Clore » pour renoncer au reste.")}',
    pas_partiel:'${T("Seul un bon reçu en partie se clôt.")}',
    motif_requis:'${T("Dites pourquoi le reste ne viendra pas.")}',
    rien_a_recevoir:'${T("Saisissez au moins une quantité reçue.")}',
    ligne_inconnue:'${T("Une ligne du bon a changé. Rouvrez l’écran.")}',
    conflit:'${T("Un collègue modifie les bons en même temps. Réessayez.")}',
    lecture_seule:'${T("Votre accès est en consultation seule.")}',
    impression:'${T("L’impression a échoué.")}',
    plafond_atteint:'${T("La liste des bons est pleine (5 000).")}',
    echec:'${T("L’opération a échoué.")}',
  };
  function expliquer(r){
    if (!r) return '${T("Aucune réponse de la fenêtre principale.")}';
    if (r.motif === 'plus_que_commande') {
      return '${T("Ligne ")}' + ((r.ligne | 0) + 1) + '${T(" : vous ne pouvez pas recevoir plus que le reste (")}' + (r.reste | 0) + ').';
    }
    if (MOTIFS[r.motif]) return MOTIFS[r.motif];
    if (r.detail) return String(r.detail);
    return '${T("Erreur inattendue (")}' + esc(r.motif || '?') + ').';
  }

  function appeler(op, args){
    if (!P || !P.appeler) return Promise.resolve({ ok:false, motif:'indisponible' });
    return P.appeler.apply(P, [op].concat(args || []))
      .catch(function(){ return { ok:false, motif:'echec' }; });
  }

  /* ══ LES GESTES GROUPES (2026-10-29, sa demande : cases toujours visibles) ═══════════════════
     Imprimer (tous), Marquer envoyes (brouillons), Clore (recus en partie, UN motif pour tous), Annuler
     (brouillons et envoyes — la regle du serveur : un bon recu en partie se clot, il ne s annule pas).
     Chaque geste passe par l op UNITAIRE du pont, bon par bon, avec les memes arguments qu un clic sur la
     carte : bc:envoyer [id], bc:annuler [id, ''], bc:clore [id, motif]. Le serveur reverifie l etat de
     chaque bon (deja envoye, deja clos, recu entre-temps) : un refus est nomme au bilan, les autres passent.
     ⚠ JAMAIS LA RECEPTION EN LOT : elle fait entrer du stock, ligne par ligne, avec sa propre confirmation.
     ⚠ PAS DE CASES dans « A commander » : ce sont des propositions, pas des bons (elles ont deja leurs cases,
     qui disent quelles lignes partent sur le bon).
     ⚠ « Tout cocher » = ce qu on VOIT : les cartes cachees par la pagination mesuree ne comptent pas. */
  function lotListe(){
    if (!D || EDIT) return [];
    if (TAB === 'histo') return fermes();
    if (TAB === 'cours' && !(OUVERT && VOLET === 'recevoir')) return ouverts();
    return [];
  }
  function lotVisibles(L){
    var V = L.filter(function(b){ var c = corps.querySelector('[data-szk="' + String(b.id).replace(/"/g, '') + '"]');
      return !!(c && c.getClientRects && c.getClientRects().length); });
    return V.length ? V : L;
  }
  function lotEcrit(){ return !(D && D.peutEcrire) || TAB !== 'cours'; }
  var CK = szCoches({
    zone: corps, barre: 'k-barre',
    lignes: function(){ return lotVisibles(lotListe()); },
    // Un autre onglet, l editeur ou la reception ouverts : la selection est videe.
    contexte: function(){ return TAB + '|' + (EDIT ? 'edit' : '') + '|' + ((OUVERT && VOLET === 'recevoir') ? 'rec' : ''); },
    id: function(b){ return b.id; },
    nom: function(b){ return (b.numero || '') + (b.fournisseurNom ? ' — ' + b.fournisseurNom : ''); },
    fiche: function(b){ return Object.assign({}, b); },
    compte: ['${T("{0} bon sélectionné")}', '${T("{0} bons sélectionnés")}'],
    actions: [
      { cle: 'envoyer', libelle: '${T("Marquer envoyés")}', prim: true, cache: lotEcrit,
        aide: '${T("Seulement les brouillons : un bon envoyé ne se modifie plus.")}',
        pour: function(f){ return f.etat === 'brouillon'; } },
      { cle: 'imprimer', libelle: '${T("Imprimer")}' },
      { cle: 'clore', libelle: '${T("Clore")}', cache: lotEcrit,
        aide: '${T("Seulement les bons reçus en partie : le reste ne sera plus attendu.")}',
        pour: function(f){ return f.etat === 'partiel'; } },
      { cle: 'annuler', libelle: '${T("Annuler les bons")}', danger: true, cache: lotEcrit,
        aide: '${T("Seulement les brouillons et les bons envoyés dont rien n’a été reçu.")}',
        pour: function(f){ return f.etat === 'brouillon' || f.etat === 'envoye'; } }
    ],
    geste: function(cle, ids, tous){ return lotGeste(cle, ids, tous); }
  });
  /* La case du socle est une cellule de tableau ; sur une carte, elle devient un <span>. */
  function lotCase(h, cl){
    return String(h).replace('class="c szk-c"', 'class="szk-c ' + cl + '"')
      .replace('<td', '<span').replace('<th', '<span').replace('</td>', '</span>').replace('</th>', '</span>');
  }
  function lotSurligner(){
    corps.querySelectorAll('.pile [data-szk]').forEach(function(c){ var k = c.closest('.carte'); if (k) k.classList.toggle('coche', !!c.checked); });
  }
  function lotApres(){ CK.apres(); lotSurligner(); }
  function lotFiche(id){ return CK.fiches()[id] || {}; }
  function lotNom(id){ var f = lotFiche(id); return (f.numero || id) + (f.fournisseurNom ? ' — ' + f.fournisseurNom : ''); }
  function lotMotif(r){ return expliquer(r); }
  function lotEcartes(ids, tous){
    var n = tous.length - ids.length;
    return n ? ' ' + szPl(n, '${T("{0} autre bon sélectionné ne s’y prête pas : il ne change pas.")}', '${T("{0} autres bons sélectionnés ne s’y prêtent pas : ils ne changent pas.")}').split('{0}').join(n) : '';
  }
  function lotDetails(ids){
    return ids.slice(0, 8).map(function(id){ var f = lotFiche(id); return [f.numero || id, (f.fournisseurNom || '—') + ' · ' + argent(f.total)]; })
      .concat(ids.length > 8 ? [['…', '${T("et {0} autres")}'.split('{0}').join(ids.length - 8)]] : []);
  }
  /* Le motif de cloture, demande UNE fois pour le lot : la boite de confirmation du socle n a pas de champ.
     Meme habit (szc-voile), meme clavier : Echap annule, Entree ne valide pas (le geste est sans retour). */
  function lotDemanderMotif(o){
    if (document.querySelector('.szc-voile')) return Promise.resolve(null);
    return new Promise(function(resoudre){
      var v = document.createElement('div');
      v.className = 'szc-voile';
      v.innerHTML = '<div class="szc-boite danger" role="dialog" aria-modal="true" aria-labelledby="lot-m-t">'
        + '<h3 id="lot-m-t">' + esc(o.titre) + '</h3><p>' + esc(o.texte) + '</p>'
        + ((o.details && o.details.length) ? '<dl class="szc-details">' + o.details.map(function(d){
            return '<dt>' + esc(d[0]) + '</dt><dd>' + esc(d[1]) + '</dd>'; }).join('') + '</dl>' : '')
        + '<input type="text" class="lot-motif" maxlength="500" aria-label="${T("Motif")}" placeholder="${T("Motif — ex. rupture chez le fournisseur")}">'
        + '<div class="lot-motif-err" role="alert"></div>'
        + '<div class="szc-pied"><button type="button" class="szc-non">${T("Annuler")}</button>'
        + '<button type="button" class="szc-oui">' + esc(o.oui) + '</button></div></div>';
      document.body.appendChild(v);
      var champ = v.querySelector('.lot-motif');
      var fini = function(r){
        if (v.parentNode) v.parentNode.removeChild(v);
        document.removeEventListener('keydown', clavier, true);
        resoudre(r);
      };
      var valider = function(){
        var m = champ.value.trim();
        if (!m) { v.querySelector('.lot-motif-err').textContent = '${T("Dites pourquoi le reste ne viendra pas.")}'; champ.focus(); return; }
        fini(m);
      };
      var clavier = function(ev){
        if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fini(null); }
        /* Entrée dans le champ VALIDE (le motif est exigé, valider le redemande s il est vide) ; sur un bouton, elle
           laisse le bouton agir. Ailleurs, rien. (relecture du 2026-10-29) */
        else if (ev.key === 'Enter') {
          var a = document.activeElement;
          if (a && a.tagName === 'BUTTON') return;
          ev.preventDefault(); ev.stopPropagation();
          if (a === champ) valider();
        }
      };
      document.addEventListener('keydown', clavier, true);
      // Un clic à côté ne ferme la boîte que si rien n est encore tapé : le motif ne se perd pas.
      v.addEventListener('mousedown', function(ev){ if (ev.target === v && !String(champ.value || '').trim()) fini(null); });
      v.querySelector('.szc-non').onclick = function(){ fini(null); };
      v.querySelector('.szc-oui').onclick = valider;
      try { champ.focus(); } catch (e) {}
    });
  }
  /* Le deroulement commun aux gestes qui ECRIVENT : BUSY tient les gestes unitaires a l ecart, puis on relit. */
  function lotDerouler(cle, titre, ids, op, args, fait){
    BUSY = true;
    var fin = function(){
      BUSY = false;
      if (cle !== 'envoyer') ids.forEach(function(id){ delete SAISIE[id]; if (OUVERT === id) { OUVERT = ''; VOLET = ''; } });
      CK.vider(); return charger();
    };
    return szLotDerouler({ titre: titre, ids: ids, nom: lotNom, motif: lotMotif,
      faire: function(id){ return appeler(op, args(id)); }, fait: fait }).then(fin, fin);
  }
  function lotGeste(cle, ids, tous){
    if (!ids.length) return;
    if (BUSY) { dire('${T("Un geste est déjà en cours. Réessayez dans un instant.")}', 'att'); return; }
    var n = ids.length;
    if (cle === 'imprimer') return szLotDerouler({ titre: '${T("Impression des bons")}', ids: ids, nom: lotNom, motif: lotMotif,
      faire: function(id){ return appeler('bc:imprimer', [id]); },
      fait: function(k){ return szPl(k, '${T("{0} bon envoyé à l’impression.")}', '${T("{0} bons envoyés à l’impression.")}').split('{0}').join(k); } });
    if (cle === 'clore') {
      var reste = ids.reduce(function(m, id){ return m + (Number(lotFiche(id).reste) || 0); }, 0);
      return lotDemanderMotif({ titre: '${T("Clore les bons")}',
        texte: szPl(n, '${T("{0} bon reçu en partie sera clos : ce qui reste à recevoir ne viendra plus. Le motif est inscrit sur le bon et au journal.")}', '${T("{0} bons reçus en partie seront clos : ce qui reste à recevoir ne viendra plus. Le motif est inscrit sur chaque bon et au journal.")}').split('{0}').join(n) + lotEcartes(ids, tous),
        details: [['${T("Unités qui ne viendront pas")}', String(reste)]].concat(lotDetails(ids)),
        oui: szPl(n, '${T("Clore {0} bon")}', '${T("Clore {0} bons")}').split('{0}').join(n) }).then(function(motif){
        if (motif == null) return;
        return lotDerouler(cle, '${T("Clôture des bons")}', ids, 'bc:clore', function(id){ return [id, motif]; },
          function(k){ return szPl(k, '${T("{0} bon clos — le reste n’est plus attendu.")}', '${T("{0} bons clos — le reste n’est plus attendu.")}').split('{0}').join(k); });
      });
    }
    if (cle === 'envoyer') {
      return szConfirmer({ prudent: true, titre: '${T("Marquer les bons envoyés")}',
        texte: szPl(n, '${T("{0} brouillon sera marqué envoyé : il ne se modifiera plus.")}', '${T("{0} brouillons seront marqués envoyés : ils ne se modifieront plus.")}').split('{0}').join(n) + lotEcartes(ids, tous),
        details: lotDetails(ids),
        oui: szPl(n, '${T("Marquer {0} bon envoyé")}', '${T("Marquer {0} bons envoyés")}').split('{0}').join(n) }).then(function(oui){
        if (!oui) return;
        return lotDerouler(cle, '${T("Envoi des bons")}', ids, 'bc:envoyer', function(id){ return [id]; },
          function(k){ return szPl(k, '${T("{0} bon marqué envoyé.")}', '${T("{0} bons marqués envoyés.")}').split('{0}').join(k); });
      });
    }
    if (cle !== 'annuler') return;
    var somme = ids.reduce(function(m, id){ return m + (Number(lotFiche(id).total) || 0); }, 0);
    return szConfirmer({ danger: true, titre: '${T("Annuler les bons")}',
      texte: szPl(n, '${T("{0} bon sera classé annulé. Rien n’a été reçu : le stock ne bouge pas.")}', '${T("{0} bons seront classés annulés. Rien n’a été reçu : le stock ne bouge pas.")}').split('{0}').join(n) + lotEcartes(ids, tous),
      details: [['${T("Montant total")}', argent(somme)]].concat(lotDetails(ids)),
      oui: szPl(n, '${T("Annuler {0} bon")}', '${T("Annuler {0} bons")}').split('{0}').join(n), non: '${T("Garder les bons")}' }).then(function(oui){
      if (!oui) return;
      return lotDerouler(cle, '${T("Annulation des bons")}', ids, 'bc:annuler', function(id){ return [id, '']; },
        function(k){ return szPl(k, '${T("{0} bon annulé.")}', '${T("{0} bons annulés.")}').split('{0}').join(k); });
    });
  }

  /* ══ CHARGEMENT ══════════════════════════════════════════════════════════ */
  /* LE VOEU (bouton « Commander » de l Inventaire) : lu une fois, a l ouverture comme au retour. Il
     l emporte sur une edition en cours seulement s il existe — sinon rien ne change sous les yeux. */
  function charger(){
    return appeler('bc:voeu', []).then(function(v){
      if (v && v.ok && v.voeu) { TAB = v.voeu; EDIT = null; OUVERT = ''; VOLET = ''; PROP = null; }
      return chargerDonnees();
    });
  }
  function chargerDonnees(){
    return appeler('bc:donnees', []).then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>';
        ongletsEl.innerHTML = '';
        return false;
      }
      D = r;
      if (TAB === 'proposer') return chargerPropositions();
      dessiner(); return true;
    });
  }
  function chargerPropositions(){
    return appeler('bc:propositions', []).then(function(r){
      if (!r || !r.ok) { PROP = { groupes: [] }; dessiner(); dire(expliquer(r), 'err'); return false; }
      PROP = r; dessiner(); return true;
    });
  }

  function ouverts(){ return (D.bons || []).filter(function(b){ return ['brouillon','envoye','partiel'].indexOf(b.etat) >= 0; }); }
  function fermes(){ return (D.bons || []).filter(function(b){ return ['brouillon','envoye','partiel'].indexOf(b.etat) < 0; }); }
  function bonPar(id){ return (D.bons || []).filter(function(b){ return b.id === id; })[0] || null; }

  function etatLbl(e){
    return ({ brouillon:'${T("brouillon")}', envoye:'${T("envoyé")}', partiel:'${T("reçu en partie")}',
      recu:'${T("reçu")}', annule:'${T("annulé")}', clos:'${T("clos")}' })[e] || e;
  }
  function pastille(e){
    var ton = ({ brouillon:'', envoye:'bleu', partiel:'ambre', recu:'vert', annule:'', clos:'' })[e] || '';
    return '<span class="rf-pill ' + ton + '">' + esc(etatLbl(e)) + '</span>';
  }

  /* ══ SAISIE GARDEE ═══════════════════════════════════════════════════════ */
  function retenir(){
    if (!OUVERT) return;
    var s = SAISIE[OUVERT] || (SAISIE[OUVERT] = { q: {}, note: '', motif: '' });
    var qs = document.querySelectorAll('[data-rq]');
    for (var i = 0; i < qs.length; i++) s.q[qs[i].getAttribute('data-rq')] = qs[i].value;
    var n = document.getElementById('v-note'); if (n) s.note = n.value;
    var m = document.getElementById('v-motif'); if (m) s.motif = m.value;
  }
  function retenirEdit(){
    if (!EDIT) return;
    var f = document.getElementById('e-four'); if (f) EDIT.fournisseurId = f.value;
    var n = document.getElementById('e-note'); if (n) EDIT.note = n.value;
  }

  /* ══ DESSIN ══════════════════════════════════════════════════════════════ */
  function dessiner(){
    if (!D) return;
    retenir(); retenirEdit();
    var nO = ouverts().length;
    ongletsEl.innerHTML =
        '<button data-tab="cours" class="' + (TAB==='cours'?'actif':'') + '">${T("En cours")}'
      +   (nO ? '<span class="pastille">' + nO + '</span>' : '') + '</button>'
      + (D.peutEcrire ? '<button data-tab="proposer" class="' + (TAB==='proposer'?'actif':'') + '">${T("À commander")}</button>' : '')
      + '<button data-tab="histo" class="' + (TAB==='histo'?'actif':'') + '">${T("Historique")}</button>'
      + (D.peutEcrire ? '<span class="droite"><button class="mini" data-act="nouveau">${T("＋ Bon vide")}</button></span>' : '');

    var enAttente = 0;
    ouverts().forEach(function(b){
      (b.lignes || []).forEach(function(l){ enAttente += Math.max(0, (l.quantite || 0) - (l.recue || 0)) * (Number(l.cout) || 0); });
    });
    sousEl.textContent = nO + (nO > 1 ? '${T(" bons en cours")}' : '${T(" bon en cours")}')
      + (enAttente ? '  ·  ' + argent(enAttente) + '${T(" attendus")}' : '');

    if (EDIT) { corps.innerHTML = vueEditeur(); lotApres(); return; }
    if (TAB === 'proposer') { corps.innerHTML = vuePropositions(); lotApres(); return; }

    /* ⚠ PAS DE BANDEAU DE TUILES : retires de tous les modules (sa decision du 2026-10-12, redite le
       2026-10-16). Le total attendu est dans l en-tete, a droite. */
    corps.innerHTML = (TAB === 'histo' ? vueHisto() : vueCours());
    lotApres();
  }

  /* ⚠ LA RECEPTION S OUVRE SEULE A L ECRAN. Une liste paginee ne prend sa hauteur que si elle est un enfant
     DIRECT de la colonne (.corps) ; logee dans une carte parmi d autres, le tableau des lignes n avait plus
     de place et n en montrait aucune (capture du 2026-10-27). Le bon recu occupe donc la fenetre : son
     en-tete, ses lignes en pages, puis la note et le bouton. « ← Tous les bons » ramene a la liste. */
  function vueCours(){
    var l = ouverts();
    var br = (OUVERT && VOLET === 'recevoir') ? bonPar(OUVERT) : null;
    if (br) return '<div class="rang"><button class="mini" data-act="retour">${T("← Tous les bons")}</button></div>'
      + carteBon(br) + voletRecevoir(br);
    if (!l.length) {
      return '<div class="vide">${T("Aucun bon en cours.")}'
        + (D.peutEcrire ? '<br><span class="dt">${T("L’onglet <strong>À commander</strong> propose un bon par fournisseur à partir des articles sous leur seuil.")}</span>' : '')
        + '</div>';
    }
    return '<div class="lot-rang">' + lotCase(CK.th(), 'lot-tout') + CK.barre() + '</div>'
      + '<div class="sz-pagee"><div class="pile" data-pages="bc-cours">' + l.map(function(b){ return carteBon(b, true); }).join('') + '</div></div>';
  }

  function carteBon(b, avecCase){
    var ouvert = (OUVERT === b.id);
    var g = '';
    if (D.peutEcrire) {
      if (b.etat === 'brouillon') g += '<button class="mini" data-modif="' + b.id + '">${T("Modifier")}</button>';
      g += '<button class="mini" data-imp="' + b.id + '"><span class="ic">🖨</span> ${T("Imprimer")}</button>';
      if (b.etat === 'brouillon') g += '<button class="mini" data-env="' + b.id + '">${T("Marquer envoyé")}</button>';
      g += '<button class="prim mini" data-rec="' + b.id + '">' + ((ouvert && VOLET === 'recevoir') ? '${T("Fermer")}' : '${T("✓ Recevoir")}') + '</button>';
      if (b.etat === 'partiel') g += '<button class="mini danger" data-clore="' + b.id + '">${T("Clore")}</button>';
      else g += '<button class="mini danger" data-ann="' + b.id + '">${T("Annuler")}</button>';
    } else {
      g += '<button class="mini" data-imp="' + b.id + '"><span class="ic">🖨</span> ${T("Imprimer")}</button>';
    }
    return '<div class="carte' + (avecCase ? CK.classe(b) : '') + '" data-id="' + esc(b.id) + '">'
      + '<div class="rang">'
      +   (avecCase ? lotCase(CK.td(b), 'lot-c') : '')
      +   '<span class="num-bc">' + esc(b.numero) + '</span>'
      +   '<span class="four">' + esc(b.fournisseurNom) + '</span>'
      +   pastille(b.etat)
      +   '<span class="prog">' + b.recues + ' / ' + b.unites + '${T(" reçues")}</span>'
      +   '<span class="montant">' + argent(b.total) + '</span>'
      +   '<span class="gestes">' + g + '</span>'
      + '</div>'
      + '<div class="dt" style="margin-top:.3rem">'
      +   (b.envoyeLe ? '${T("Envoyé le ")}' + esc(dateCourte(b.envoyeLe)) + (b.envoyePar ? '${T(" par ")}' + esc(b.envoyePar) : '')
                      : '${T("Créé le ")}' + esc(dateCourte(b.creeLe)) + (b.creePar ? '${T(" par ")}' + esc(b.creePar) : ''))
      +   ' · ' + b.nbLignes + (b.nbLignes > 1 ? '${T(" lignes")}' : '${T(" ligne")}')
      +   (b.note ? ' — ' + esc(b.note) : '')
      + '</div>'
      + (ouvert && VOLET === 'clore' ? voletClore(b) : '')
      + '</div>';
  }

  /* ⚠ LA QUANTITE PROPOSEE EST LE RESTE, PAS ZERO : la livraison la plus courante est la livraison
     complete. On corrige les lignes qui manquent ; on ne retape pas celles qui sont arrivees. */
  function voletRecevoir(b){
    var s = SAISIE[b.id] || { q: {}, note: '' };
    var lignes = (b.lignes || []).map(function(l, n){
      var reste = Math.max(0, (l.quantite || 0) - (l.recue || 0));
      var v = (s.q[n] != null) ? s.q[n] : String(reste);
      return '<tr>'
        + '<td class="art"><span class="nom">' + esc(l.nom) + '</span> · ' + esc(l.cle) + '<br><span class="sku">' + esc(l.sku || '') + '</span></td>'
        + '<td class="num">' + (l.quantite || 0) + '</td>'
        + '<td class="num">' + (l.recue || 0) + '</td>'
        + '<td class="num">' + reste + '</td>'
        + '<td class="num">' + (reste > 0
            ? '<input class="q" type="number" min="0" max="' + reste + '" data-rq="' + n + '" value="' + esc(v) + '"'
              + ' aria-label="' + esc('${T("Quantité reçue — ")}' + (l.nom || '') + ' ' + (l.cle || '')) + '">'
            : '<span class="dt">${T("complet")}</span>') + '</td>'
        + '</tr>';
    }).join('');
    return '<div class="carte sz-pagee"><div data-pages="bc-recevoir"><table><thead><tr>'
      +   '<th>${T("Article")}</th><th class="num">${T("Commandé")}</th><th class="num">${T("Déjà reçu")}</th>'
      +   '<th class="num">${T("Reste")}</th><th class="num">${T("Reçu maintenant")}</th>'
      + '</tr></thead><tbody>' + lignes + '</tbody></table></div></div>'
      + '<div class="carte volet" style="margin-top:0;border-top:1px solid var(--v07)"><div class="rangee">'
      +   '<input aria-label="${T("Note de réception (facultative)")}" type="text" id="v-note" value="' + esc(s.note || '') + '" placeholder="${T("Note de réception (facultative) — n° de bordereau…")}" style="flex:1;min-width:14rem">'
      +   '<button class="mini" data-act="rien">${T("Tout à zéro")}</button>'
      +   '<button class="prim" data-recok="' + b.id + '"' + (BUSY ? ' disabled' : '') + '>${T("Entrer en stock")}</button>'
      + '</div>'
      + '<div class="dt">${T("Les quantités saisies entrent en stock tout de suite. Ce qui manque reste attendu : le bon passe « reçu en partie ».")}</div>'
      + '</div>';
  }

  function voletClore(b){
    var s = SAISIE[b.id] || {};
    return '<div class="volet">'
      + '<div class="avis jaune">${T("Clore le bon renonce au reste : ")}<strong>' + b.reste + '</strong> '
      +   (b.reste > 1 ? '${T("unités ne viendront pas.")}' : '${T("unité ne viendra pas.")}')
      +   '${T(" Le motif est inscrit sur le bon et au journal.")}</div>'
      + '<div class="rangee">'
      +   '<input aria-label="${T("Motif")}" type="text" id="v-motif" value="' + esc(s.motif || '') + '" placeholder="${T("Motif — ex. rupture chez le fournisseur")}" style="flex:1;min-width:14rem">'
      +   '<button class="prim" data-clook="' + b.id + '"' + (BUSY ? ' disabled' : '') + '>${T("Clore le bon")}</button>'
      + '</div></div>';
  }

  function vueHisto(){
    var l = fermes();
    if (!l.length) return '<div class="vide">${T("Aucun bon terminé.")}</div>';
    return '<div class="carte sz-pagee">' + CK.barre() + '<div data-pages="bc-histo"><table><thead><tr>'
      + CK.th() + '<th>${T("Bon")}</th><th>${T("Fournisseur")}</th><th>${T("État")}</th>'
      + '<th class="num">${T("Commandé")}</th><th class="num">${T("Reçu")}</th><th class="num">${T("Montant")}</th>'
      + '<th>${T("Clos le")}</th><th></th>'
      + '</tr></thead><tbody>'
      + l.map(function(b){
          return '<tr data-id="' + esc(b.id) + '" class="' + CK.classe(b) + '">'
            + CK.td(b)
            + '<td><span class="num-bc">' + esc(b.numero) + '</span></td>'
            + '<td>' + esc(b.fournisseurNom) + (b.motifCloture ? '<br><span class="dt">' + esc(b.motifCloture) + '</span>' : '') + '</td>'
            + '<td>' + pastille(b.etat) + '</td>'
            + '<td class="num">' + b.unites + '</td>'
            + '<td class="num">' + b.recues + '</td>'
            + '<td class="num">' + argent(b.total) + '</td>'
            + '<td class="dt">' + esc(dateCourte(b.closLe)) + (b.closPar ? '<br>' + esc(b.closPar) : '') + '</td>'
            + '<td class="num"><button class="mini" data-imp="' + b.id + '"><span class="ic">🖨</span> ${T("Imprimer")}</button></td>'
            + '</tr>';
        }).join('')
      + '</tbody></table></div>'
      + szPied(l.length + ' ' + (l.length > 1 ? '${T("bons terminés")}' : '${T("bon terminé")}'),
          '<button class="mini" data-act="exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>')
      + '</div>';
  }

  function exporterHisto(){
    var l = fermes();
    if (!l.length) { dire('${T("Rien à exporter.")}', 'att'); return; }
    var lignes = [];
    l.forEach(function(b){
      (b.lignes || []).forEach(function(x){
        lignes.push([b.numero || '', b.fournisseurNom || '', etatLbl(b.etat), x.nom || '', x.cle || '', x.sku || '',
          Number(x.quantite || 0), Number(x.recue || 0), Number(x.cout || 0),
          String(b.envoyeLe || b.creeLe || '').slice(0, 10), String(b.closLe || '').slice(0, 10), b.motifCloture || '']);
      });
    });
    var csv = szCSV(['${T("Bon")}', '${T("Fournisseur")}', '${T("État")}', '${T("Article")}', '${T("Variante")}', '${T("SKU")}',
      '${T("Commandé")}', '${T("Reçu")}', '${T("Coût unitaire")}', '${T("Émis le")}', '${T("Clos le")}', '${T("Motif")}'], lignes);
    szExporter('bons-commande-fournisseurs-' + new Date().toISOString().slice(0, 10) + '.csv', csv,
      '${T("L’historique des bons de commande fournisseurs")}');
  }

  /* ══ A COMMANDER ═════════════════════════════════════════════════════════
     Un groupe par fournisseur, une ligne par variante sous son seuil, MOINS ce qui est deja en commande
     (le coeur le retire). Les quantites et les couts se corrigent ici ; une ligne decochee ne part pas. */
  /* nomChoisi : un fournisseur DESACTIVE depuis la creation du brouillon n est plus dans la liste ; on le garde en tete,
     sinon ouvrir « Modifier » effacait le choix et l enregistrement etait refuse. */
  function optionsFournisseurs(choisi, nomChoisi){
    var connu = (D.fournisseurs || []).some(function(f){ return f.id === choisi; });
    return '<option value="">${T("— choisir un fournisseur —")}</option>'
      + ((choisi && !connu) ? '<option value="' + esc(choisi) + '" selected>' + esc(nomChoisi || choisi) + '</option>' : '')
      + (D.fournisseurs || []).map(function(f){
          return '<option value="' + esc(f.id) + '"' + (choisi === f.id ? ' selected' : '') + '>' + esc(f.nom) + '</option>'; }).join('');
  }
  function vuePropositions(){
    if (!PROP) return '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>';
    var g = PROP.groupes || [];
    if (!g.length) {
      return '<div class="vide">${T("Rien à commander : toutes les variantes sont au-dessus de leur seuil, ou déjà en commande.")}</div>';
    }
    var haut = '<div class="rang"><span class="dt">${T("Quantité proposée : de quoi revenir au double du seuil, moins ce qui est déjà en commande. Coût : celui de la fiche produit.")}</span>'
      + '<span class="gestes"><button class="prim" data-act="tousbons"' + (BUSY ? ' disabled' : '') + '>${T("Créer tous les bons (brouillons)")}</button></span></div>';
    /* ⚠ UN SEUL TABLEAU, une rangee d en-tete par fournisseur : la liste paginee coupe par RANGEES, et un groupe
       de trente lignes dans une carte depassait la page (la carte entiere etait l element a placer). */
    return haut + '<div class="carte sz-pagee"><div data-pages="bc-proposer"><table><thead><tr><th></th><th>${T("Article")}</th><th class="num">${T("Stock")}</th><th class="num">${T("Seuil")}</th>'
      + '<th class="num">${T("En commande")}</th><th class="num">${T("Quantité")}</th><th class="num">${T("Coût unitaire")}</th></tr></thead><tbody>'
      + g.map(function(gr, i){
      var sel = (gr.fournisseurId && !gr.inconnu) ? gr.fournisseurId : (gr.choix || '');
      var titre = (gr.fournisseurId && !gr.inconnu)
        ? '<span class="four">' + esc(gr.fournisseurNom) + '</span>'
        : '<select data-gfour="' + i + '" aria-label="${T("Fournisseur de ce groupe")}">' + optionsFournisseurs(sel) + '</select>'
          + '<span class="dt">' + (gr.inconnu ? '${T("Le fournisseur des fiches a été supprimé : choisissez-en un.")}' : '${T("Ces fiches n’ont pas de fournisseur : choisissez-en un.")}') + '</span>';
      return '<tr class="groupe"><td colspan="7"><div class="rang">' + titre
        +   '<span class="montant" style="margin-left:auto" id="gtot-' + i + '">' + argent(totalGroupe(gr)) + '</span>'
        +   '<button class="prim mini" data-gcreer="' + i + '"' + (BUSY ? ' disabled' : '') + '>${T("Créer ce bon")}</button>'
        + '</div></td></tr>'
        + gr.lignes.map(function(l, j){
            var id = i + ':' + j;
            return '<tr>'
              + '<td><input type="checkbox" data-gpris="' + id + '"' + (l.exclu ? '' : ' checked') + ' aria-label="' + esc('${T("Commander ")}' + l.nom + ' ' + l.cle) + '"></td>'
              + '<td class="art"><span class="nom">' + esc(l.nom) + '</span> · ' + esc(l.cle) + '<br><span class="sku">' + esc(l.sku || '') + '</span></td>'
              + '<td class="num">' + l.stock + '</td><td class="num">' + l.seuil + '</td>'
              + '<td class="num">' + (l.enCommande || '—') + '</td>'
              + '<td class="num"><input class="q" type="number" min="1" data-gq="' + id + '" value="' + esc(l.quantite) + '" aria-label="${T("Quantité")}"></td>'
              + '<td class="num"><input class="c" type="number" min="0" step="0.01" data-gc="' + id + '" value="' + esc(deux(l.cout)) + '" aria-label="${T("Coût unitaire")}"></td>'
              + '</tr>';
          }).join('');
    }).join('') + '</tbody></table></div></div>';
  }
  function totalGroupe(gr){
    return gr.lignes.reduce(function(s, l){ return l.exclu ? s : s + (parseInt(l.quantite, 10) || 0) * (Number(l.cout) || 0); }, 0);
  }
  function groupePret(gr){
    var fid = (gr.fournisseurId && !gr.inconnu) ? gr.fournisseurId : (gr.choix || '');
    return { fournisseurId: fid, lignes: gr.lignes.filter(function(l){ return !l.exclu; })
      .map(function(l){ return { productId: l.productId, cle: l.cle, quantite: l.quantite, cout: l.cout }; }) };
  }
  /* « tous » : « Creer tous les bons » cree ceux qui sont PRETS et laisse de cote (en le disant) les groupes sans
     fournisseur choisi — un groupe en attente ne bloque pas les autres. Un seul groupe : on reste sur l onglet,
     ses lignes disparaissent (elles sont desormais « en commande ») et l on enchaine avec le suivant. */
  function creerGroupes(idx, tous){
    if (BUSY) return;
    var envoi = [], sansFour = 0;
    for (var k = 0; k < idx.length; k++) {
      var gp = groupePret(PROP.groupes[idx[k]]);
      if (!gp.lignes.length) continue;
      if (!gp.fournisseurId) {
        if (tous) { sansFour++; continue; }
        dire('${T("Choisissez d’abord le fournisseur de ce groupe.")}', 'att');
        var se = document.querySelector('[data-gfour="' + idx[k] + '"]'); if (se) se.focus();
        return;
      }
      envoi.push(gp);
    }
    if (!envoi.length) { dire(sansFour ? '${T("Choisissez le fournisseur des groupes qui n’en ont pas.")}' : '${T("Aucune ligne cochée.")}', 'att'); return; }
    BUSY = true; dessiner(); dire('${T("Création des bons…")}');
    appeler('bc:creerGroupes', [envoi]).then(function(r){
      BUSY = false;
      if (!r || (!r.ok && !(r.faits && r.faits.length))) { dessiner(); dire(expliquer(r), 'err'); return; }
      var n = (r.faits || []).length, ko = (r.refus || []).length;
      if (tous) TAB = 'cours';
      PROP = null;
      chargerDonnees().then(function(){
        dire(n + (n > 1 ? '${T(" bons créés en brouillon")}' : '${T(" bon créé en brouillon")}')
          + (ko ? ' — ' + ko + '${T(" refusé(s) : ")}' + expliquer(r.refus[0]) : '')
          + (sansFour ? ' — ' + sansFour + '${T(" groupe(s) sans fournisseur laissé(s) dans « À commander ».")}' : (ko ? '' : '.')),
          (ko || sansFour) ? 'att' : 'bon');
      });
    });
  }

  /* ══ EDITEUR (brouillon, ou bon vide) ════════════════════════════════════ */
  function vueEditeur(){
    var e = EDIT;
    var total = e.lignes.reduce(function(s, l){ return s + (parseInt(l.quantite, 10) || 0) * (Number(l.cout) || 0); }, 0);
    var h = '<div class="carte"><div class="rang">'
      + '<h2 style="margin:0">' + (e.id ? '${T("Modifier le bon ")}' + esc(e.numero || '') : '${T("Nouveau bon de commande fournisseur")}') + '</h2>'
      + '<span class="gestes"><button class="mini" data-act="editAnnuler">${T("Abandonner")}</button>'
      + '<button class="prim" data-act="editEnregistrer"' + (BUSY ? ' disabled' : '') + '>${T("Enregistrer le brouillon")}</button></span></div>'
      + '<div class="rang" style="margin-top:.5rem">'
      +   '<label for="e-four" class="dt">${T("Fournisseur")}</label><select id="e-four">' + optionsFournisseurs(e.fournisseurId, e.fournisseurNom) + '</select>'
      +   '<input id="e-note" type="text" aria-label="${T("Note pour le fournisseur")}" placeholder="${T("Note pour le fournisseur (imprimée)")}" value="' + esc(e.note || '') + '" style="flex:1;min-width:14rem">'
      +   '<span class="montant">' + argent(total) + '</span>'
      + '</div></div>';
    h += '<div class="carte sz-pagee"><div data-pages="bc-edit"><table><thead><tr><th>${T("Article")}</th><th class="num">${T("Quantité")}</th><th class="num">${T("Coût unitaire")}</th><th></th></tr></thead><tbody>'
      + (e.lignes.length ? e.lignes.map(function(l, j){
          return '<tr><td class="art"><span class="nom">' + esc(l.nom) + '</span> · ' + esc(l.cle) + '<br><span class="sku">' + esc(l.sku || '') + '</span></td>'
            + '<td class="num"><input class="q" type="number" min="1" data-eq="' + j + '" value="' + esc(l.quantite) + '" aria-label="${T("Quantité")}"></td>'
            + '<td class="num"><input class="c" type="number" min="0" step="0.01" data-ec="' + j + '" value="' + esc(deux(l.cout)) + '" aria-label="${T("Coût unitaire")}"></td>'
            + '<td class="num"><button class="mini danger" data-eoter="' + j + '" aria-label="${T("Retirer la ligne")}">×</button></td></tr>';
        }).join('') : '<tr><td colspan="4" class="dt">${T("Aucune ligne. Cherchez un article ci-dessous pour l’ajouter.")}</td></tr>')
      + '</tbody></table></div></div>';
    h += '<div class="carte"><div class="rang">'
      + '<input type="search" id="e-q" aria-label="${T("Chercher un article")}" placeholder="${T("Nom, SKU ou taille-couleur (3 caractères)…")}">'
      + '<button class="mini" data-act="editChercher">${T("Chercher")}</button>'
      + (TROUVES && !TROUVES.length ? '<span class="dt">${T("Aucun article trouvé.")}</span>' : '')
      + '</div></div>'
      /* Les resultats : un bloc FRERE, pas loge dans la carte de recherche — une liste paginee ne prend sa
         hauteur que comme enfant direct de la colonne. Les lignes du bon et les resultats se la partagent. */
      + ((TROUVES && TROUVES.length)
          ? '<div class="carte sz-pagee"><div data-pages="bc-trouves"><table><tbody>' + TROUVES.map(function(t, k){
              return '<tr><td class="art"><span class="nom">' + esc(t.nom) + '</span> · ' + esc(t.cle) + ' <span class="sku">' + esc(t.sku || '') + '</span></td>'
                + '<td class="num dt">${T("stock ")}' + t.stock + '</td>'
                + '<td class="num"><button class="mini" data-eajout="' + k + '">${T("＋ Ajouter")}</button></td></tr>';
            }).join('') + '</tbody></table></div></div>'
          : '');
    return h;
  }
  function ouvrirEditeur(b){
    TROUVES = null; OUVERT = '';
    EDIT = b ? { id: b.id, numero: b.numero, fournisseurId: b.fournisseurId || '', fournisseurNom: b.fournisseurNom || '', version: b.modifieLe || '', note: b.note || '',
                 lignes: (b.lignes || []).map(function(l){ return { productId: l.productId, cle: l.cle, nom: l.nom, sku: l.sku, quantite: l.quantite, cout: l.cout }; }) }
             : { id: '', fournisseurId: '', note: '', lignes: [] };
    dessiner();
  }
  function enregistrerEdit(){
    if (BUSY || !EDIT) return;
    retenirEdit();
    if (!EDIT.fournisseurId) { dire('${T("Choisissez un fournisseur de la liste.")}', 'att'); var f = document.getElementById('e-four'); if (f) f.focus(); return; }
    if (!EDIT.lignes.length) { dire('${T("Le bon n’a aucune ligne.")}', 'att'); return; }
    BUSY = true; dessiner(); dire('${T("Enregistrement…")}');
    appeler('bc:ecrire', [{ id: EDIT.id || '', version: EDIT.version || '', fournisseurId: EDIT.fournisseurId, note: EDIT.note, lignes: EDIT.lignes }]).then(function(r){
      BUSY = false;
      if (!r || !r.ok) { dessiner(); dire(expliquer(r), 'err'); return; }
      EDIT = null; TAB = 'cours';
      charger().then(function(){ dire('${T("Bon ")}' + r.bon.numero + '${T(" enregistré en brouillon.")}', 'bon'); });
    });
  }

  /* ══ GESTES SUR UN BON ═══════════════════════════════════════════════════ */
  function imprimer(id){
    dire('${T("Impression…")}');
    appeler('bc:imprimer', [id]).then(function(r){
      dire(r && r.ok ? '${T("Bon ")}' + r.numero + '${T(" envoyé à l’impression.")}' : expliquer(r), r && r.ok ? 'bon' : 'err');
    });
  }
  function envoyer(id){
    if (BUSY) return;
    BUSY = true;
    appeler('bc:envoyer', [id]).then(function(r){
      BUSY = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      charger().then(function(){ dire('${T("Bon ")}' + r.bon.numero + '${T(" marqué envoyé — il ne se modifie plus.")}', 'bon'); });
    });
  }
  /* ⚠ (relecture du 2026-10-27) LES LIGNES DES AUTRES PAGES COMPTENT AUSSI : la pagination cache des rangees, elle ne
     les retire pas, et chaque champ vaut d avance le reste de sa ligne. Corriger la page 1 d un bon de soixante lignes
     puis valider faisait entrer les cinquante autres sans qu on les ait vues. D ou la CONFIRMATION, qui dit le total
     et le nombre de lignes. Une valeur fautive est nommee par son numero de ligne (le champ peut etre sur une page cachee). */
  function recevoir(id, confirme){
    if (BUSY) return;
    retenir();
    var b = bonPar(id); if (!b) return;
    var lignes = [], total = 0;
    var qs = document.querySelectorAll('[data-rq]');
    for (var i = 0; i < qs.length; i++) {
      var n = parseInt(qs[i].getAttribute('data-rq'), 10);
      var brut = String(qs[i].value).trim();
      var v = brut === '' ? 0 : Number(brut);
      if (!isFinite(v) || v < 0 || Math.floor(v) !== v) { dire('${T("Ligne ")}' + (n + 1) + '${T(" : saisissez une quantité entière positive.")}', 'att'); if (qs[i].offsetParent) qs[i].focus(); return; }
      var reste = Math.max(0, (b.lignes[n].quantite || 0) - (b.lignes[n].recue || 0));
      if (v > reste) { dire(expliquer({ motif: 'plus_que_commande', ligne: n, reste: reste }), 'att'); if (qs[i].offsetParent) qs[i].focus(); return; }
      if (v > 0) { lignes.push({ n: n, qte: v }); total += v; }
    }
    if (!total) { dire('${T("Saisissez au moins une quantité reçue.")}', 'att'); return; }
    if (!confirme) {
      szConfirmer({ titre: '${T("Entrer en stock")}',
        texte: '${T("Les quantités saisies entrent en stock tout de suite, y compris celles des autres pages du tableau.")}',
        details: [['${T("Bon")}', b.numero || '—'], ['${T("Lignes reçues")}', lignes.length + ' / ' + (b.lignes || []).length],
          ['${T("Unités")}', String(total)]],
        oui: '${T("Entrer en stock")}', non: '${T("Revoir les quantités")}' }).then(function(ok){ if (ok) recevoir(id, true); });
      return;
    }
    var note = (document.getElementById('v-note') || {}).value || '';
    BUSY = true; dire('${T("Entrée en stock…")}');
    appeler('bc:recevoir', [{ id: id, lignes: lignes, note: note }]).then(function(r){
      BUSY = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      OUVERT = ''; VOLET = ''; delete SAISIE[id];
      charger().then(function(){
        var t = r.recues + (r.recues > 1 ? '${T(" unités entrées en stock")}' : '${T(" unité entrée en stock")}')
          + (r.bon.etat === 'partiel' ? '${T(" — reste attendu : ")}' + r.bon.reste : '${T(" — bon reçu au complet.")}');
        if (r.courriels) t += '${T(" Avis « de retour en stock » envoyés : ")}' + r.courriels + '.';
        else if (r.aPrevenir) t += '${T(" Clients à prévenir (infolettre non configurée) : ")}' + r.aPrevenir + '.';
        dire(t, 'bon');
      });
    });
  }
  function annuler(id, confirme){
    if (BUSY) return;
    var b = bonPar(id) || {};
    if (!confirme) {
      szConfirmer({ danger: true, titre: '${T("Annuler le bon")}',
        texte: '${T("Le bon est classé annulé. Rien n’a été reçu : le stock ne bouge pas.")}',
        details: [['${T("Bon")}', b.numero || '—'], ['${T("Fournisseur")}', b.fournisseurNom || '—'], ['${T("Montant")}', argent(b.total)]],
        oui: '${T("Annuler le bon")}', non: '${T("Garder le bon")}' }).then(function(ok){ if (ok) annuler(id, true); });
      return;
    }
    BUSY = true;
    appeler('bc:annuler', [id, '']).then(function(r){
      BUSY = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      OUVERT = '';
      charger().then(function(){ dire('${T("Bon ")}' + r.bon.numero + '${T(" annulé.")}', 'bon'); });
    });
  }
  function clore(id){
    if (BUSY) return;
    var m = document.getElementById('v-motif');
    var motif = m ? m.value.trim() : '';
    if (!motif) { dire('${T("Dites pourquoi le reste ne viendra pas.")}', 'att'); if (m) m.focus(); return; }
    BUSY = true;
    appeler('bc:clore', [id, motif]).then(function(r){
      BUSY = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      OUVERT = ''; VOLET = ''; delete SAISIE[id];
      charger().then(function(){ dire('${T("Bon ")}' + r.bon.numero + '${T(" clos — le reste n’est plus attendu.")}', 'bon'); });
    });
  }

  /* ══ ECOUTEURS ═══════════════════════════════════════════════════════════ */
  function changerOnglet(t){
    TAB = t; OUVERT = ''; VOLET = ''; EDIT = null;
    if (t === 'proposer') { PROP = null; dessiner(); chargerPropositions(); return; }
    dessiner();
  }
  document.addEventListener('click', function(e){
    var t = e.target; if (!t || !t.closest) return;
    if (CK.clic(e)) { lotSurligner(); return; }   // une case, « tout cocher » ou la barre d actions
    var b = t.closest('button'); if (!b) return;
    var tab = b.getAttribute('data-tab');
    if (tab) { changerOnglet(tab); return; }
    var act = b.getAttribute('data-act');
    if (act === 'exporter') { exporterHisto(); return; }
    if (act === 'retour') { retenir(); OUVERT = ''; VOLET = ''; dessiner(); return; }
    if (act === 'nouveau') { ouvrirEditeur(null); return; }
    if (act === 'editAnnuler') { EDIT = null; TROUVES = null; dessiner(); return; }
    if (act === 'editEnregistrer') { enregistrerEdit(); return; }
    if (act === 'editChercher') {
      var q = (document.getElementById('e-q') || {}).value || '';
      retenirEdit();
      appeler('bc:chercher', [q]).then(function(r){
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        if (r.court) { dire('${T("Trois caractères au moins.")}', 'att'); return; }
        TROUVES = r.lignes || []; dessiner();
        var qe = document.getElementById('e-q'); if (qe) qe.value = q;
      });
      return;
    }
    if (act === 'tousbons') { creerGroupes(PROP.groupes.map(function(x, i){ return i; }), true); return; }
    if (act === 'rien') { var qs = document.querySelectorAll('[data-rq]'); for (var i = 0; i < qs.length; i++) qs[i].value = '0'; return; }
    var v;
    if ((v = b.getAttribute('data-gcreer')) !== null) { creerGroupes([parseInt(v, 10)]); return; }
    if ((v = b.getAttribute('data-eoter')) !== null) { retenirEdit(); EDIT.lignes.splice(parseInt(v, 10), 1); dessiner(); return; }
    if ((v = b.getAttribute('data-eajout')) !== null) {
      retenirEdit();
      var tr = TROUVES[parseInt(v, 10)];
      if (EDIT.lignes.some(function(l){ return l.productId === tr.productId && l.cle === tr.cle; })) { dire('${T("Cette variante est déjà sur le bon.")}', 'att'); return; }
      EDIT.lignes.push({ productId: tr.productId, cle: tr.cle, nom: tr.nom, sku: tr.sku, quantite: 1, cout: tr.cout });
      if (!EDIT.fournisseurId && tr.fournisseurId) EDIT.fournisseurId = tr.fournisseurId;
      dessiner(); return;
    }
    if ((v = b.getAttribute('data-modif'))) { ouvrirEditeur(bonPar(v)); return; }
    if ((v = b.getAttribute('data-imp'))) { imprimer(v); return; }
    if ((v = b.getAttribute('data-env'))) { envoyer(v); return; }
    if ((v = b.getAttribute('data-ann'))) { annuler(v); return; }
    if ((v = b.getAttribute('data-rec'))) { retenir(); var r1 = (OUVERT === v && VOLET === 'recevoir'); OUVERT = r1 ? '' : v; VOLET = r1 ? '' : 'recevoir'; dessiner(); return; }
    if ((v = b.getAttribute('data-clore'))) { retenir(); var r2 = (OUVERT === v && VOLET === 'clore'); OUVERT = r2 ? '' : v; VOLET = r2 ? '' : 'clore'; dessiner(); return; }
    if ((v = b.getAttribute('data-recok'))) { recevoir(v); return; }
    if ((v = b.getAttribute('data-clook'))) { clore(v); return; }
  });

  // Les saisies de l onglet A commander et de l editeur vivent dans l etat : un redessin ne les perd pas.
  document.addEventListener('input', function(e){
    var t = e.target; if (!t || !t.getAttribute) return;
    var a, i, j, p;
    if ((a = t.getAttribute('data-gq')) || (a = t.getAttribute('data-gc'))) {
      p = a.split(':'); i = +p[0]; j = +p[1];
      var l = PROP.groupes[i].lignes[j];
      if (t.hasAttribute('data-gq')) l.quantite = t.value; else l.cout = t.value;
      var gt = document.getElementById('gtot-' + i); if (gt) gt.textContent = argent(totalGroupe(PROP.groupes[i]));
      return;
    }
    if ((a = t.getAttribute('data-eq')) !== null) { EDIT.lignes[+a].quantite = t.value; return; }
    if ((a = t.getAttribute('data-ec')) !== null) { EDIT.lignes[+a].cout = t.value; return; }
  });
  document.addEventListener('change', function(e){
    var t = e.target; if (!t || !t.getAttribute) return;
    var a;
    if ((a = t.getAttribute('data-gpris'))) {
      var p = a.split(':'); var gr = PROP.groupes[+p[0]];
      gr.lignes[+p[1]].exclu = !t.checked;
      var gt = document.getElementById('gtot-' + p[0]); if (gt) gt.textContent = argent(totalGroupe(gr));
      return;
    }
    if ((a = t.getAttribute('data-gfour')) !== null) { PROP.groupes[+a].choix = t.value; return; }
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && e.target && e.target.id === 'e-q') {
      var bt = document.querySelector('[data-act="editChercher"]'); if (bt) bt.click(); return;
    }
    if (e.key !== 'Escape') return;
    if (OUVERT) { retenir(); OUVERT = ''; VOLET = ''; dessiner(); return; }
    if (EDIT) { EDIT = null; TROUVES = null; dessiner(); return; }
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
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  // Rouvert apres avoir ete cache : les bons ont pu bouger ailleurs. Une edition en cours est gardee — sauf voeu.
  window.szRevenir = function(){
    appeler('bc:voeu', []).then(function(v){
      if (v && v.ok && v.voeu) { TAB = v.voeu; EDIT = null; OUVERT = ''; VOLET = ''; PROP = null; chargerDonnees(); return; }
      if (!EDIT) chargerDonnees();
    });
  };

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageBonsCommande };
