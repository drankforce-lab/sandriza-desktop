'use strict';

/*
 * FENÊTRE « CONSOMMATION FAL.AI » — NATIVE
 * =============================================================================
 * Ce que les traitements d'image ont coûté, et ce qu'ils ont fait. Deux vues :
 * la CONSOMMATION (par modèle, par jour) et l'HISTORIQUE (chaque appel).
 *
 * ⚠⚠ CE QUE CET ÉCRAN NE MONTRE PAS, ET POURQUOI. Il n'affiche pas le SOLDE du
 * compte fal.ai : leur service n'expose aucune interface publique qui le donne.
 * On pourrait soustraire notre consommation d'un montant saisi à la main — et ce
 * chiffre dériverait au premier achat de crédit fait ailleurs, sans que personne
 * pense à le vérifier. Un solde faux est pire qu'un solde absent : on s'y fie.
 * L'écran renvoie donc au tableau de bord de fal.ai pour le solde, et ne promet
 * que ce qu'il tient : la consommation, elle, est mesurée — chaque appel passe
 * par notre relais.
 *
 * ⚠ ET IL DIT QUELLE PART DU COÛT EST MESURÉE. Fal.ai ne renvoie pas toujours le
 * prix d'un appel ; quand il ne le fait pas, on prend une estimation par modèle.
 * Présenter l'addition sans distinguer les deux, ce serait donner une facture
 * là où l'on n'a qu'un ordre de grandeur.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.onglets{flex:0 0 auto;display:flex;gap:.3rem;padding:.5rem 1.05rem 0;
  border-bottom:1px solid var(--v08)}
.onglets button{background:none;border:0;border-bottom:2px solid transparent;color:var(--tx2);
  font:600 .82rem/1 system-ui;padding:.45rem .7rem;cursor:pointer;border-radius:0}
.onglets button.on{color:var(--tx);border-bottom-color:#c9a97e}
.corps{flex:1 1 auto;min-height:0;padding:.85rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.75rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.carte{background:#16202f;border:1px solid var(--v08);border-radius:11px;
  padding:.8rem .9rem}
.carte h2{margin:0 0 .55rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.34rem .6rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v11)}
button:focus{outline:none;border-color:#c9a97e}
button.mini{font-size:.72rem;padding:.16rem .45rem}
select{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .5rem}
.barreoutils{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center}
.tuiles{display:flex;gap:.6rem;flex-wrap:wrap}
.t{flex:1 1 8rem;background:#16202f;border:1px solid var(--v08);
  border-radius:11px;padding:.6rem .75rem}
.t .n{font:800 1.5rem/1.1 Georgia,serif;font-variant-numeric:tabular-nums}
.t .l{font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);font-weight:700}
.t .s{font-size:.7rem;color:var(--tx2);margin-top:.15rem}
table{width:100%;border-collapse:collapse;font-size:.79rem}
thead th{text-align:left;padding:.22rem .35rem;font-size:.65rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v11)}
tbody td{padding:.3rem .35rem;border-top:1px solid var(--v05);vertical-align:top}
tbody tr:hover td{background:var(--v03)}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.dt{font-size:.7rem;color:var(--tx2)}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.74rem}
.pill{display:inline-block;font-size:.64rem;padding:.05rem .45rem;border-radius:99px;
  white-space:nowrap;font-weight:700}
.pill.ok{background:rgba(34,197,94,.15);color:var(--tx-ok)}
.pill.non{background:rgba(248,113,113,.15);color:var(--tx-err2)}
.pill.g{background:rgba(148,163,184,.14);color:var(--tx2);font-weight:600}
.pill.apr{background:rgba(201,169,126,.18);color:#d8bd97}
/* La barre des jours : un dessin vaut mieux qu une colonne de nombres pour
   reperer une derive avant la facture. */
.jours{display:flex;align-items:flex-end;gap:2px;height:4.5rem;padding-top:.3rem}
.jours .b{flex:1 1 auto;min-width:3px;background:rgba(201,169,126,.55);border-radius:2px 2px 0 0}
.jours .b:hover{background:#c9a97e}
.vide{padding:1.1rem .6rem;text-align:center;color:var(--tx2);font-size:.82rem}
/* L avertissement d honnetete : ni replie, ni en gris pale. Il doit se lire. */
.franc{border:1px solid rgba(240,180,80,.35);background:rgba(200,140,40,.1);
  color:var(--tx-or2);border-radius:9px;padding:.55rem .75rem;font-size:.76rem;line-height:1.5}
.franc b{color:#fbe3b0}
.franc a{color:var(--tx-or2)}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:#0b1220}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** @param {string} ouverture '' (consommation) ou 'historique' */
function pageFal(ouverture) {
  const dep = JSON.stringify(String(ouverture || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Traitements d’image — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.cerveau}</span><h1>Traitements d’image</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets">
  <button id="o-conso" class="on">Consommation</button>
  <button id="o-hist">Historique</button>
</div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; b.style.marginLeft='auto'; t.appendChild(b); }
    if (actif) { b.textContent='⧉ Détacher'; b.title='Ouvrir cet écran dans sa propre fenêtre'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='⚓ Ancrer'; b.title='Ramener cet écran dans la fenêtre principale'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var sous  = document.getElementById('sous');
  var VUE = ${dep} === 'historique' ? 'hist' : 'conso';
  var D = null;
  var PR = null;
  // Filtres de l'historique + horodatage de la dernière lecture (l'écran se
  // rafraîchit seul, sans bouton).
  var FILT_PROV = 'tous', FILT_Q = '', MAJ = '';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    echec:              'La lecture a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').'))
      + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  /* ⚠ LE RETRAIT DE MANNEQUIN COMPTE TROIS LIGNES, PAS UNE : reperage du
     mannequin, reconstruction sous le masque, puis detourage. Les nommer
     separement est ce qui permet de voir OU l argent passe — et, le jour ou le
     resultat decoit, laquelle des trois etapes a mal travaille. */
  var GESTES = {
    detourage: 'Détourage', masque: 'Repérage du vêtement',
    fantome: 'Mannequin retiré',
    humain: 'Porté par un mannequin', essayage: 'Essayage virtuel'
  };
  function sous_(v){
    var n = Number(v) || 0;
    return (n < 1 ? n.toFixed(3) : n.toFixed(2)).replace('.', ',') + ' $ US';
  }
  function quand(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return esc(iso);
    return d.toLocaleString('fr-CA', { dateStyle: 'medium', timeStyle: 'short' });
  }
  function jourCourt(iso){
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return esc(iso);
    return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function duree(ms){
    var n = Number(ms) || 0;
    return n >= 1000 ? (Math.round(n / 100) / 10).toString().replace('.', ',') + ' s' : n + ' ms';
  }

  /* La carte des CRÉDITS PHOTOROOM — le fournisseur principal du retrait et de
     l’ajout de mannequin. Le restant est RÉEL, lu de /v2/account ; le sandbox
     est notre compte estimé (Photoroom ne l’expose pas). */
  function carteCredits(){
    // Photoroom : credits reels (lus par API) + apercus sandbox (comptes par nous).
    var reel;
    if (PR && PR.compte && PR.compte.available != null) {
      var c = PR.compte;
      reel = '<div class="t"><div class="l">Crédits Photoroom (réels)</div><div class="n">'
        + c.available + (c.subscription != null ? ' <span class="s">/ ' + c.subscription + '</span>' : '')
        + '</div><div class="s">' + (c.plan ? 'offre ' + esc(c.plan) + ' · ' : '')
        + 'lus en direct de Photoroom</div></div>';
    } else {
      reel = '<div class="t"><div class="l">Crédits Photoroom (réels)</div><div class="n">—</div>'
        + '<div class="s">' + (PR ? 'indisponible (clé de production requise)' : 'non lu') + '</div></div>';
    }
    var sb = (PR && PR.sandbox) ? PR.sandbox : { utilise: 0, quotaMois: 1000 };
    var sand = '<div class="t"><div class="l">Aperçus sandbox</div><div class="n">'
      + (sb.utilise || 0) + ' <span class="s">/ ' + (sb.quotaMois || 1000) + '</span></div>'
      + '<div class="s">ce mois · estimé · filigrané</div></div>';
    /* fal.ai : un SOLDE RESTANT, comme Photoroom, mais calculé — fal n'expose
       aucun solde par API. Restant = montant saisi en Configuration MOINS la
       consommation mesurée depuis la saisie ; il diminue donc à chaque traitement
       fal. Un chiffre honnête et daté plutôt qu'un paragraphe. */
    var solde = Number(D.soldeSaisi) || 0, conso = Number(D.consoDepuis) || 0;
    var reste = solde - conso; if (reste < 0) { reste = 0; }
    var fal;
    if (solde > 0) {
      fal = '<div class="t"><div class="l">Solde fal.ai (restant)</div><div class="n">' + sous_(reste)
        + '</div><div class="s">' + (D.soldeDate ? 'saisi le ' + esc(jourCourt(D.soldeDate)) + ' · ' : '')
        + 'diminue à chaque traitement</div></div>';
    } else {
      fal = '<div class="t"><div class="l">Solde fal.ai (restant)</div><div class="n">—</div>'
        + '<div class="s">à saisir en Configuration</div></div>';
    }
    return '<div class="carte"><h2>Crédits &amp; solde</h2><div class="tuiles">'
      + reel + sand + fal + '</div></div>';
  }

  /* ══ LE PLAFOND MENSUEL DE DÉPENSE (lot 2 du #29) ═════════════════════════
     ⚠⚠ UN SEUL PLAFOND POUR LES DEUX FOURNISSEURS, et c est ce qui le rend utile.
     Photoroom et fal.ai inscrivent leur coût dans la MÊME table : un plafond par
     relais ne plafonnerait rien du tout, la dépense continuerait tranquillement
     par l autre porte pendant que l écran afficherait deux limites respectées.

     ⚠ ET IL NE SE CONFOND PAS AVEC LE SOLDE fal.ai juste au-dessus : le solde dit
     ce qu il reste CHEZ LE FOURNISSEUR, le plafond ce que l entreprise s autorise
     à dépenser CE MOIS-CI. Deux limites différentes ; c est la plus basse qui
     mord la première, et il faut pouvoir les lire séparément.

     ⚠ IL EST ICI, dans l écran de la dépense, et pas dans le Studio : le Studio
     RENCONTRE le plafond, il ne le déplace pas (droit « config » contre
     « photos »). */
  function cartePlafond(){
    var b = D.budget || { actif: false, mensuel: 0, depense: 0, restant: null, mois: '' };
    var pct = (b.actif && b.mensuel > 0)
      ? Math.min(100, Math.round((b.depense / b.mensuel) * 100)) : 0;
    /* La jauge change de couleur AVANT d être pleine : découvrir le plafond au
       moment où la file s arrête, c est le découvrir trop tard. */
    var teinte = pct >= 100 ? '#e08a8a' : pct >= 80 ? '#d8b57a' : '#6ea8a1';
    var h = '<div class="carte"><h2>Plafond mensuel de dépense</h2>';
    h += '<p class="dt">Photoroom et fal.ai comptent ensemble : c est la dépense TOTALE '
      + 'du mois en traitements d’image qui est plafonnée. Atteint, il arrête les lots '
      + 'en cours au lieu de les laisser courir — les photos non traitées restent à faire, '
      + 'elles ne sont pas marquées en échec. Les aperçus sandbox, gratuits, ne sont jamais bloqués.</p>';
    h += '<label class="rc" style="display:flex;gap:.5rem;align-items:center;margin:.6rem 0">'
      + '<input type="checkbox" id="pl-actif"' + (b.actif ? ' checked' : '') + '> '
      + '<span><strong>Appliquer un plafond mensuel</strong></span></label>';
    h += '<div class="ch" style="max-width:16rem"><label for="pl-montant">Montant autorisé par mois ($US)</label>'
      + '<input id="pl-montant" type="number" min="0" step="1" value="'
      + (Number(b.mensuel) || 0) + '"></div>';
    if (b.actif && b.mensuel > 0) {
      h += '<div style="margin:.8rem 0 .2rem;height:.5rem;border-radius:99px;background:#22303f;overflow:hidden">'
        + '<i style="display:block;height:100%;width:' + pct + '%;background:' + teinte + '"></i></div>'
        + '<p class="dt">' + sous_(b.depense) + ' dépensés sur ' + sous_(b.mensuel)
        + ' pour ' + esc(b.mois || '') + ' — il reste <strong>' + sous_(b.restant) + '</strong>.</p>';
    } else if (b.actif) {
      h += '<p class="dt" style="color:#e08a8a">Plafond actif mais fixé à 0 : <strong>tout traitement '
        + 'payant est refusé</strong>. Posez un montant, ou décochez.</p>';
    } else {
      h += '<p class="dt">' + sous_(b.depense) + ' dépensés ce mois-ci (' + esc(b.mois || '')
        + '). Aucun plafond n’est appliqué : rien n’arrêtera un lot.</p>';
    }
    h += '<div class="fin2" style="margin-top:.6rem"><button class="prim" id="pl-poser">Enregistrer le plafond</button>'
      + ' <span id="pl-dit" class="dt"></span></div>';
    return h + '</div>';
  }

  /* La ligne « dernière actualisation » — l'écran se rafraîchit tout seul (plus de
     bouton Recharger), donc on DIT quand les chiffres ont été relus pour la
     dernière fois, sinon un écran figé passerait pour à jour. */
  function ligneMaj(){
    return '<div class="barreoutils"><span class="droite" style="font-size:.74rem;color:var(--tx2)">'
      + '<span id="maj">' + (MAJ ? 'Dernière actualisation le ' + esc(MAJ) : 'Actualisation…') + '</span>'
      + '</span></div>';
  }

  // ── CONSOMMATION ────────────────────────────────────────────────────────
  function vueConso(){
    var h = [];
    h.push(ligneMaj());
    h.push(carteCredits());
    h.push(cartePlafond());

    var reussis = 0;
    (D.parModele || []).forEach(function(m){ reussis += m.reussis; });
    var echecs = (D.appels || 0) - reussis;

    h.push('<div class="tuiles">'
      + '<div class="t"><div class="l">Consommation totale</div><div class="n">' + sous_(D.total) + '</div>'
      + '<div class="s">depuis le début du suivi</div></div>'
      + '<div class="t"><div class="l">Appels</div><div class="n">' + (D.appels || 0) + '</div>'
      + '<div class="s">' + reussis + ' réussis · ' + echecs + ' en échec</div></div>'
      + '<div class="t"><div class="l">Coût moyen</div><div class="n">'
      + sous_((D.appels ? (D.total / D.appels) : 0)) + '</div>'
      + '<div class="s">par appel</div></div>'
      + '</div>');

    // Les trente derniers jours
    var j = (D.parJour || []).slice().reverse();
    if (j.length) {
      var max = 0;
      j.forEach(function(x){ if (x.cout > max) max = x.cout; });
      h.push('<div class="carte"><h2>Trente derniers jours</h2><div class="jours">'
        + j.map(function(x){
            var ht = max ? Math.max(3, Math.round(x.cout * 100 / max)) : 3;
            return '<div class="b" style="height:' + ht + '%" title="' + esc(x.jour) + ' · '
              + x.appels + ' appel(s) · ' + sous_(x.cout) + '"></div>';
          }).join('')
        + '</div><p class="dt">Du ' + esc(j[0].jour) + ' au ' + esc(j[j.length - 1].jour)
        + '. Survolez une barre pour le détail du jour.</p></div>');
    }

    h.push('<div class="carte"><h2>Par traitement</h2>');
    if (!(D.parModele || []).length) {
      h.push('<div class="vide">Aucun traitement n’a encore été lancé.</div>');
    } else {
      h.push('<table><thead><tr><th>Traitement</th><th>Modèle</th><th class="num">Appels</th>'
        + '<th class="num">Réussis</th><th class="num">Coût</th><th class="num">Unitaire</th>'
        + '<th>Prix</th></tr></thead><tbody>');
      D.parModele.forEach(function(m){
        var mesure = m.coutsReels >= m.appels;
        h.push('<tr>'
          + '<td>' + esc(GESTES[m.geste] || m.geste || '—') + '</td>'
          + '<td class="mono">' + esc(m.modele) + '</td>'
          + '<td class="num">' + m.appels + '</td>'
          + '<td class="num">' + m.reussis + '</td>'
          + '<td class="num">' + sous_(m.cout) + '</td>'
          + '<td class="num">' + sous_(m.appels ? (m.cout / m.appels) : 0) + '</td>'
          + '<td><span class="pill ' + (mesure ? 'ok' : 'g') + '">'
          + (mesure ? 'mesuré' : (m.coutsReels ? 'partiel' : 'estimé')) + '</span></td>'
          + '</tr>');
      });
      h.push('</tbody></table>');
    }
    h.push('</div>');
    return h.join('');
  }

  // ── HISTORIQUE ──────────────────────────────────────────────────────────
  /* L'opération d'un appel se lit dans son modèle : Photoroom loggue toujours
     « photoroom/… », fal.ai loggue « fal-ai/… ». Un seul test suffit à ranger. */
  function evtProv(e){ return (String(e.modele || '').indexOf('photoroom') === 0) ? 'photoroom' : 'fal'; }
  function evtsFiltres(){
    var q = (FILT_Q || '').trim().toLowerCase();
    return (D.evenements || []).filter(function(e){
      if (FILT_PROV !== 'tous' && evtProv(e) !== FILT_PROV) return false;
      if (q) {
        var hay = ((e.photoCode || '') + ' ' + (e.photoNom || '')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }
  function lignesHist(){
    var arr = evtsFiltres();
    if (!arr.length) { return '<tr><td colspan="8" class="vide">Aucun appel pour ce filtre.</td></tr>'; }
    var out = [];
    arr.forEach(function(e){
      var prov = evtProv(e);
      var photo = e.photoCode
        ? ('<span class="mono">' + esc(e.photoCode) + '</span>'
           + (e.photoNom ? ' <span class="dt">' + esc(e.photoNom) + '</span>' : ''))
        : (e.photoNom ? '<span class="dt">' + esc(e.photoNom) + '</span>' : '—');
      out.push('<tr>'
        + '<td class="dt" style="white-space:nowrap">' + quand(e.au) + '</td>'
        + '<td><span class="pill g">' + (prov === 'photoroom' ? 'Photoroom' : 'Fal.ai') + '</span></td>'
        + '<td>' + esc(GESTES[e.geste] || e.geste || '—') + '</td>'
        + '<td>' + photo + '</td>'
        + '<td class="dt">' + esc(e.qui || '—') + '</td>'
        + '<td class="num">' + duree(e.ms) + '</td>'
        + '<td class="num">' + sous_(e.cout) + (e.coutReel ? '' : ' <span class="dt">est.</span>') + '</td>'
        + '<td>' + (e.ok
            ? (e.apercu ? '<span class="pill apr">Aperçu gratuit</span>' : '<span class="pill ok">réussi</span>')
            : '<span class="pill non">échec</span>') + '</td>'
        + '</tr>'
        // ⚠ LE MESSAGE D ERREUR EST RENDU TEL QUEL : << echec >> tout court n aide
        // personne ; << credit epuise >> ou << cle invalide >> se reglent vite.
        + (e.ok || !e.erreur ? ''
            : '<tr><td></td><td colspan="7" class="dt" style="color:var(--tx-err2)">' + esc(e.erreur) + '</td></tr>'));
    });
    return out.join('');
  }
  function vueHist(){
    var opt = function(v, t){ return '<option value="' + v + '"' + (FILT_PROV === v ? ' selected' : '') + '>' + t + '</option>'; };
    var h = [];
    h.push('<div class="barreoutils">'
      + '<select id="h-prov">' + opt('tous', 'Toutes les opérations') + opt('fal', 'Fal.ai') + opt('photoroom', 'Photoroom') + '</select>'
      + '<input id="h-q" type="search" placeholder="Filtrer par photo (nom ou PH-000000)" value="' + esc(FILT_Q || '')
      + '" style="flex:1;min-width:13rem;background:var(--v05);color:var(--tx);'
      + 'border:1px solid var(--v16);border-radius:8px;padding:.32rem .55rem;font:inherit">'
      + '<span class="droite" style="font-size:.74rem;color:var(--tx2)"><span id="maj">'
      + (MAJ ? 'Dernière actualisation le ' + esc(MAJ) : 'Actualisation…') + '</span></span></div>');
    h.push('<div class="carte"><h2>Cinq cents derniers appels</h2>');
    h.push('<table><thead><tr><th>Quand</th><th>Opération</th><th>Traitement</th>'
      + '<th>Photo</th><th>Par</th><th class="num">Durée</th><th class="num">Coût</th>'
      + '<th>État</th></tr></thead><tbody id="h-body">' + lignesHist() + '</tbody></table>');
    h.push('</div>');
    return h.join('');
  }

  function dessiner(){
    document.getElementById('o-conso').classList.toggle('on', VUE === 'conso');
    document.getElementById('o-hist').classList.toggle('on', VUE === 'hist');
    corps.innerHTML = (VUE === 'hist') ? vueHist() : vueConso();
    if (VUE === 'hist') { brancherHist(); } else { brancherPlafond(); }
  }
  function brancherPlafond(){
    var bt = document.getElementById('pl-poser');
    if (!bt) return;
    bt.onclick = function(){
      var ac = document.getElementById('pl-actif');
      var mo = document.getElementById('pl-montant');
      var dt = document.getElementById('pl-dit');
      var actif = !!(ac && ac.checked);
      var mensuel = mo ? (parseFloat(mo.value) || 0) : 0;
      /* ⚠ ON REFUSE AVANT D ÉCRIRE, ET ON DIT POURQUOI. Un plafond actif à 0
         refuse absolument tout traitement payant : c est un réglage légitime, mais
         il ne doit pas s obtenir par un champ laissé vide. */
      if (actif && mensuel <= 0) {
        if (dt) { dt.style.color = '#e08a8a';
          dt.textContent = 'Un plafond actif à 0 $ refuse tout traitement. Posez un montant, ou décochez.'; }
        return;
      }
      bt.disabled = true;
      if (dt) { dt.style.color = ''; dt.textContent = 'Enregistrement…'; }
      appeler('fal:plafondPoser', [{ actif: actif, mensuel: mensuel }]).then(function(r){
        bt.disabled = false;
        if (!r || !r.ok) {
          if (dt) { dt.style.color = '#e08a8a'; dt.textContent = expliquer(r); }
          dire(expliquer(r), 'err');
          return;
        }
        dire('Plafond enregistré.', 'bon');
        /* ⚠ ON RECHARGE : la jauge se calcule sur la dépense du mois, que seul le
           relais connaît. La redessiner sur la valeur qu on vient de taper
           afficherait un restant inventé. */
        charger(false);
      });
    };
  }
  /* Les filtres de l'historique se posent APRÈS le dessin. Ils ne redessinent que
     le CORPS du tableau (h-body), pour ne pas voler le foyer du champ de
     recherche pendant la frappe. */
  function brancherHist(){
    var sp = document.getElementById('h-prov');
    if (sp) sp.onchange = function(){ FILT_PROV = sp.value; refiltrer(); };
    var q = document.getElementById('h-q');
    if (q) q.oninput = function(){ FILT_Q = q.value; refiltrer(); };
  }
  function refiltrer(){
    var b = document.getElementById('h-body');
    if (b) b.innerHTML = lignesHist();
  }

  document.getElementById('o-conso').onclick = function(){ VUE = 'conso'; charger(false); };
  document.getElementById('o-hist').onclick = function(){ VUE = 'hist'; charger(false); };

  function charger(dit){
    if (dit) dire('Lecture…');
    Promise.all([
      appeler('fal:suivi', [VUE === 'hist' ? 'journal' : 'resume']),
      appeler('photoroom:compte')
    ]).then(function(rs){
      var r = rs[0];
      // Le compteur Photoroom ne bloque pas l’écran : s’il échoue, la carte le dit.
      PR = (rs[1] && rs[1].ok) ? rs[1] : null;
      if (!r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r;
      MAJ = _horoNow();
      sous.textContent = (D.appels || 0) + ' appel' + ((D.appels || 0) > 1 ? 's' : '')
        + ' · ' + sous_(D.total);
      dessiner();
      if (dit) dire('');
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     RAFRAÎCHISSEMENT AUTOMATIQUE — plus de bouton « Recharger »
     ⚠ On SONDE léger (le résumé, sans les 500 événements) toutes les 5 s pour
     DÉTECTER un changement du flux de la photothèque (un traitement de plus
     bouge le nombre d'appels, le total, les crédits ou le solde). S'il a bougé,
     on recharge complètement ; sinon on rafraîchit juste l'horodatage.
     ⚠⚠ ON NE REDESSINE JAMAIS PENDANT UNE SAISIE : si le champ de filtre ou le
     menu d'opération a le foyer, on saute ce tour — sinon la frappe serait
     avalée. */
  function _horoNow(){
    try { return new Date().toLocaleString('fr-CA', { dateStyle: 'short', timeStyle: 'short' }); }
    catch (e) { return ''; }
  }
  /* La signature dit « quelque chose a-t-il bougé ». ⚠ LE PLAFOND EN FAIT PARTIE :
     posé depuis un autre poste, il doit apparaître ici sans qu on ait à rouvrir
     l écran — c est une limite qui gouverne la dépense, pas une préférence. */
  function sigPlafond(b){
    b = b || {};
    return [b.actif ? 1 : 0, b.mensuel || 0, b.depense || 0].join(',');
  }
  function signatureCourante(){
    var pa = (PR && PR.compte && PR.compte.available != null) ? PR.compte.available : '-';
    return [D ? D.appels : 0, D ? D.total : 0, pa, D ? D.soldeSaisi : 0, D ? D.consoDepuis : 0,
      sigPlafond(D && D.budget)].join('|');
  }
  function saisieActive(){
    var a = document.activeElement;
    /* ⚠⚠ LE MONTANT DU PLAFOND EN FAIT PARTIE. L écran se recharge tout seul
       toutes les 5 s : sans ce garde, un montant à moitié tapé serait effacé sous
       les doigts, et l on ne comprendrait pas pourquoi le champ « saute ». */
    return !!(a && (a.id === 'h-q' || a.id === 'h-prov'
      || a.id === 'pl-montant' || a.id === 'pl-actif'));
  }
  function veille(){
    setInterval(function(){
      if (saisieActive()) return;
      var avant = signatureCourante();
      Promise.all([appeler('fal:suivi', ['resume']), appeler('photoroom:compte')]).then(function(rs){
        var r = rs[0];
        if (!r || !r.ok) return;   // une lecture ratée ne casse pas l'écran affiché
        var prNew = (rs[1] && rs[1].ok) ? rs[1] : PR;
        var pa = (prNew && prNew.compte && prNew.compte.available != null) ? prNew.compte.available : '-';
        var apres = [r.appels, r.total, pa, r.soldeSaisi, r.consoDepuis, sigPlafond(r.budget)].join('|');
        MAJ = _horoNow();
        if (apres !== avant) {
          PR = prNew;
          charger(false);   // rechargement complet et silencieux (journal si historique)
        } else {
          var el = document.getElementById('maj');
          if (el) el.textContent = 'Dernière actualisation le ' + MAJ;
        }
      });
    }, 5000);
  }

  charger(true);
  veille();
})();
</script></body></html>`;
}

module.exports = { pageFal };
