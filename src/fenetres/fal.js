'use strict';

/*
 * FENÊTRE « TRAITEMENTS D'IMAGE » — NATIVE
 * =============================================================================
 * Ce que les traitements d'image ont coûté, et ce qu'ils ont fait.
 *
 * ⚠⚠ UN ONGLET PAR FOURNISSEUR, DES SOUS-ONGLETS DANS CHACUN (2026-10-18, sa
 * demande : « le tableau des événements devrait avoir son propre onglet et même
 * chose pour les autres traitements AI ; c'est trop petit comme ça dans le bas ;
 * mets des sous-onglets et rends ça plus professionnel »). Avant : l'onglet The
 * New Black entassait le solde, le registre et les générations, et ces
 * dernières n'avaient plus qu'UNE ligne visible, coupée, au bas de l'écran.
 *   · Vue d'ensemble — Résumé (plafond, trente jours, par fournisseur) ·
 *                      Par traitement · Journal complet
 *   · Fal.ai          — Aperçu (solde, coût par traitement) · Appels
 *   · Photoroom       — Aperçu (crédits, coût par traitement) · Appels
 *   · The New Black   — Aperçu (solde, forfait, dépenses, paliers) ·
 *                       Générations · Mouvements (registre de The New Black)
 * Chaque tableau prend TOUTE la hauteur qui reste et se lit en PAGES mesurées
 * (JS_PAGES du socle) : aucune glissière, rien de coupé.
 * Le fournisseur d'un appel se lit dans son modèle : « photoroom/… »,
 * « tnb/… », sinon fal.ai — exactement ce que les trois relais inscrivent.
 *
 * ⚠⚠ CE QUE CET ÉCRAN NE MONTRE PAS, ET POURQUOI. fal.ai n'expose aucun solde :
 * le « restant » est un solde SAISI à la main moins la consommation MESURÉE
 * depuis sa saisie, et l'écran le dit. Un solde faux est pire qu'un solde
 * absent : on s'y fie.
 *
 * ⚠ ET IL DIT QUELLE PART DU COÛT EST MESURÉE. Fal.ai ne renvoie pas toujours le
 * prix d'un appel ; quand il ne le fait pas, on prend une estimation par modèle.
 *
 * ⚠ LES MOTS DE THE NEW BLACK (« delivered », « image_to_ghost_mannequin »,
 * « hold », « settle »…) NE S'AFFICHENT JAMAIS BRUTS : chaque mouvement du
 * registre est traduit (TYPES_TNB, NOTES_TNB) ; un mot inconnu est au moins
 * dépouillé de ses soulignés.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) ni antislash dans la portion de script,
 * COMMENTAIRES COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU, SEP_DEC } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('fal');

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
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.onglets{flex:0 0 auto;display:flex;gap:.3rem;padding:.5rem 1.05rem 0;
  border-bottom:1px solid var(--v08)}
.onglets button{background:none;border:0;border-bottom:2px solid transparent;color:var(--tx2);
  font:600 .82rem/1 system-ui;padding:.45rem .7rem;cursor:pointer;border-radius:0}
.onglets button.on{color:var(--tx);border-bottom-color:var(--or)}
/* Aucune glissiere (2026-10-12) : le corps ne defile plus, les listes vont en PAGES mesurees (JS_PAGES du socle). */
.corps{flex:1 1 auto;min-height:0;padding:.85rem 1.05rem;overflow:hidden;
  display:flex;flex-direction:column;gap:.75rem}
.corps>*{flex:0 0 auto}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.8rem .9rem;min-width:0}
.carte h2{margin:0 0 .55rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);display:flex;align-items:center;gap:.5rem}
.carte h2 .cpt{margin-left:auto;text-transform:none;letter-spacing:0;font-weight:600;font-size:.74rem}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.34rem .6rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:focus{outline:none;border-color:var(--or)}
button.mini{font-size:.72rem;padding:.16rem .45rem}
select{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .5rem}
/* La barre des sous-onglets : les choix a gauche (groupe .ed-seg du socle), les filtres, puis l heure de la
   derniere lecture a droite. */
.fl-barre{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap}
.fl-barre .droite{margin-left:auto;font-size:.74rem;color:var(--tx2);white-space:nowrap}
.fl-barre .fl-q{flex:1 1 13rem;min-width:11rem;max-width:22rem;background:var(--v05);color:var(--tx);
  border:1px solid var(--v16);border-radius:8px;padding:.32rem .55rem;font:inherit}
table{width:100%;border-collapse:collapse;font-size:.79rem}
thead th{text-align:left;padding:.22rem .35rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10);white-space:nowrap}
tbody td{padding:.3rem .35rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody tr:hover td{background:var(--v03)}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
td.nw{white-space:nowrap}
.dt{font-size:.7rem;color:var(--tx2)}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.74rem}
.err-l{display:block;font-size:.7rem;color:var(--tx-err2);margin-top:.1rem;max-width:34rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.plus{color:var(--tx-ok)}
/* La pastille a point de la refonte (2026-09-26) : la forme de rf-pill, les memes sens. */
.pill{display:inline-flex;align-items:center;gap:.4rem;font-size:.72rem;font-weight:600;padding:.22rem .65rem;border-radius:99px;white-space:nowrap}
.pill::before{content:"";width:6px;height:6px;border-radius:99px;background:currentColor;flex:0 0 auto}
.pill.ok{background:rgba(34,197,94,.15);color:var(--tx-ok)}
.pill.non{background:rgba(248,113,113,.15);color:var(--tx-err2)}
.pill.g{background:rgba(148,163,184,.14);color:var(--tx-94a3b8);font-weight:600}
.pill.apr{background:rgba(96,165,250,.14);color:var(--tx-bleu)}
/* La photo d un appel : une vignette de la phototheque quand elle y est encore, une case neutre sinon. */
.ph{display:flex;align-items:center;gap:.55rem;min-width:0}
.ph .vg{flex:0 0 auto;width:34px;height:34px;border-radius:7px;overflow:hidden;background:var(--v05);
  border:1px solid var(--v10);display:flex;align-items:center;justify-content:center}
.ph .vg img{width:100%;height:100%;object-fit:cover;display:block}
.ph .vg i{width:12px;height:12px;border-radius:3px;border:1.5px solid var(--v22)}
.ph .tx{display:flex;flex-direction:column;min-width:0}
.ph .tx .dt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:16rem}
/* La barre des jours : un dessin vaut mieux qu une colonne de nombres pour
   reperer une derive avant la facture. Barres bornees a 46 px (2026-09-29). */
.jours{display:flex;align-items:flex-end;justify-content:space-around;gap:3px;height:4.5rem;padding-top:.3rem;
  border-bottom:1px solid var(--v12)}
.jours .b{flex:1 1 0;max-width:46px;min-width:3px;background:rgba(var(--or-rgb),.55);border-radius:2px 2px 0 0}
.jours .b:hover{background:var(--or)}
html.jour .jours .b{background:rgba(168,128,78,.55)}html.jour .jours .b:hover{background:rgba(168,128,78,.85)}
.vide{padding:1.1rem .6rem;text-align:center;color:var(--tx2);font-size:.82rem}
/* L avertissement d honnetete : ni replie, ni en gris pale. Il doit se lire. */
.franc{border:1px solid rgba(240,180,80,.35);background:rgba(200,140,40,.1);
  color:var(--tx-or2);border-radius:9px;padding:.55rem .75rem;font-size:.76rem;line-height:1.5}
.franc b{color:#fbe3b0}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}

/* Deux par rangee (2026-09-26, aucune barre de defilement). */
.rang2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.8rem;align-items:stretch}
.rang2 > div{min-width:0;display:flex;flex-direction:column}
.rang2 .carte{margin:0;flex:1 1 auto}
/* La fiche du fournisseur a gauche, son tableau a droite : le tableau prend la hauteur qui reste. */
.fl-deux{flex:1 1 0!important;min-height:0;display:grid;grid-template-columns:minmax(15rem,21rem) minmax(0,1fr);
  grid-template-rows:minmax(0,1fr);gap:.8rem}
.fl-deux>.carte{min-height:0;overflow:hidden}
.fl-deux>.colonne{display:flex;flex-direction:column;gap:.8rem;min-height:0;overflow:hidden}
.corps>.sz-pagee{flex:1 1 0}
/* Les fiches « libelle : valeur » : lisibles d un coup d oeil, sans bande de chiffres (sa regle du
   2026-10-16 : aucune tuile hors du tableau de bord). */
.fl-gros{font-size:1.55rem;font-weight:750;line-height:1.15;margin:.1rem 0 .15rem;font-variant-numeric:tabular-nums}
.fl-gros small{font-size:.8rem;font-weight:500;color:var(--tx2);margin-left:.35rem}
.fl-dl{display:grid;grid-template-columns:minmax(0,auto) minmax(0,1fr);gap:.42rem 1rem;margin:.55rem 0 0;font-size:.8rem}
.fl-dl dt{color:var(--tx2)}
.fl-dl dd{margin:0;text-align:right;font-weight:600;font-variant-numeric:tabular-nums;min-width:0;overflow-wrap:anywhere}
.fl-note{font-size:.72rem;color:var(--tx2);margin:.6rem 0 0;line-height:1.5}
.part{display:inline-block;width:5rem;height:.4rem;border-radius:99px;background:var(--v08);overflow:hidden;vertical-align:middle;margin-right:.45rem}
.part i{display:block;height:100%;background:rgba(var(--or-rgb),.75)}
tr.aller{cursor:pointer}
@media (max-width:1000px){.rang2{grid-template-columns:1fr}}
@media (max-width:980px){.fl-deux{grid-template-columns:minmax(13rem,17rem) minmax(0,1fr)}}
`;

/** @param {string} ouverture '' (vue d'ensemble), 'historique' (journal complet), 'tnb', 'fal' ou 'photoroom' */
function pageFal(ouverture) {
  const dep = JSON.stringify(String(ouverture || ''));
  return `${TETE()}
<title>${T("Traitements d’image — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.cerveau}</span><h1>${T("Traitements d’image")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets" role="tablist">
  <button id="o-ens" data-vue="ens" role="tab" class="on">${T("Vue d’ensemble")}</button>
  <button id="o-fal" data-vue="fal" role="tab">Fal.ai</button>
  <button id="o-pr" data-vue="pr" role="tab">Photoroom</button>
  <button id="o-tnb" data-vue="tnb" role="tab">The New Black</button>
</div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; b.style.marginLeft='.6rem'; t.appendChild(b); }
    if (actif) { b.textContent='${T("⧉ Détacher")}'; b.title='${T("Ouvrir cet écran dans sa propre fenêtre")}'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='${T("⚓ Ancrer")}'; b.title='${T("Ramener cet écran dans la fenêtre principale")}'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('fal')}
  var corps = document.getElementById('corps');
  var sous  = document.getElementById('sous');
  var OUV = ${dep};
  /* L onglet (un fournisseur) et, pour chacun, son sous-onglet retenu : revenir sur un fournisseur rouvre la
     vue qu on y regardait. */
  var VUE = OUV === 'tnb' ? 'tnb' : OUV === 'fal' ? 'fal' : OUV === 'photoroom' ? 'pr' : 'ens';
  var SOUS = { ens: OUV === 'historique' ? 'journal' : 'resume', fal: 'apercu', pr: 'apercu', tnb: 'apercu' };
  var SOUS_LISTE = {
    ens: [['resume', '${T("Résumé")}'], ['traitements', '${T("Par traitement")}'], ['journal', '${T("Journal complet")}']],
    fal: [['apercu', '${T("Aperçu")}'], ['appels', '${T("Appels")}']],
    pr:  [['apercu', '${T("Aperçu")}'], ['appels', '${T("Appels")}']],
    tnb: [['apercu', '${T("Aperçu")}'], ['generations', '${T("Générations")}'], ['mouvements', '${T("Mouvements")}']]
  };
  var D = null;      // le résumé fal:suivi (par modèle, par jour, solde fal.ai, plafond)
  var EVTS = null;   // les 500 derniers appels (fal:suivi « journal »), lus quand un tableau d appels est ouvert
  var TN = null;     // le détail The New Black (fal:suivi « tnb ») : solde, forfait, registre, nos générations
  var PR = null;     // le compte Photoroom
  var PHOTOS = {};   // code PH-xxxxxx → adresse de la vignette (photothèque de la session)
  // Filtres des tableaux d appels + horodatage de la dernière lecture (l écran se rafraîchit seul).
  var FILT_PROV = 'tous', FILT_Q = '', MAJ = '';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès à la configuration.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:              '${T("La lecture a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').'))
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
     separement est ce qui permet de voir OU l argent passe. */
  var GESTES = {
    detourage: '${T("Détourage")}', masque: '${T("Repérage du vêtement")}',
    fantome: '${T("Mannequin retiré")}',
    humain: '${T("Porté par un mannequin")}', essayage: '${T("Essayage virtuel")}',
    plat: '${T("Mise à plat")}', apercu3d: '${T("Aperçu 3D")}',
    gros_plan: '${T("Gros plan de la fibre")}', gros_plan_pro: '${T("Gros plan de la fibre (rendu IA)")}'
  };
  // Un mot que la fenêtre ne connaît pas encore se lit au moins sans ses soulignés.
  function lisible(k){ var s = String(k || '').split('_').join(' ').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'; }
  function geste(k){ return GESTES[k] || lisible(k); }
  /* ⚠ LES TROIS DECIMALES SOUS UN DOLLAR RESTENT : un traitement coute des
     fractions de cent, et arrondir a deux ferait lire « 0,00 $ ». Le groupement
     des milliers et la place du symbole appartiennent a la langue. */
  function sous_(v){
    var n = Number(v) || 0;
    return szArgentSymbole(szArgentNombre(n, Math.abs(n) < 1 ? 3 : 2)) + ' US';
  }
  function nbr(v){ return szArgentNombre(Number(v) || 0, 0); }
  function quand(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return esc(iso);
    return d.toLocaleString('${LIEU()}', { dateStyle: 'medium', timeStyle: 'short' });
  }
  function jourCourt(iso){
    if (!iso) return '';
    /* Une date SEULE (AAAA-MM-JJ) est un jour LOCAL : new Date('2026-08-07')
       serait minuit UTC, donc le 6 au Quebec. */
    var z = String(iso);
    var d = (z.length === 10 && z.charAt(4) === '-')
      ? new Date(+z.slice(0, 4), +z.slice(5, 7) - 1, +z.slice(8, 10)) : new Date(iso);
    if (isNaN(d.getTime())) return esc(iso);
    return d.toLocaleDateString('${LIEU()}', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function duree(ms){
    var n = Number(ms) || 0;
    return n >= 1000 ? (Math.round(n / 100) / 10).toString().replace('.', '${SEP_DEC()}') + ' s' : n + ' ms';
  }
  function remplir(modele, valeurs){
    var s = String(modele);
    for (var i = 0; i < valeurs.length; i++) s = s.split('{' + i + '}').join(valeurs[i]);
    return s;
  }

  /* LE SOLDE DANS LE RÉSUMÉ (2026-10-16) : Photoroom (réel, lu en direct) et fal.ai (restant calculé). */
  function soldeFal(){
    var solde = Number(D && D.soldeSaisi) || 0, conso = Number(D && D.consoDepuis) || 0;
    return solde > 0 ? Math.max(0, solde - conso) : null;
  }
  function resumeCredits(){
    var morceaux = [];
    if (PR && PR.compte && PR.compte.available != null) {
      morceaux.push('${T("Photoroom : {0} crédits")}'.split('{0}').join(PR.compte.available
        + (PR.compte.subscription != null ? ' / ' + PR.compte.subscription : '')));
    } else {
      morceaux.push('${T("Photoroom : solde non lu")}');
    }
    var rf = soldeFal();
    morceaux.push(rf != null ? '${T("fal.ai : {0} restants")}'.split('{0}').join(sous_(rf))
      : '${T("fal.ai : solde à saisir en Configuration")}');
    return morceaux.join(' · ');
  }

  /* Le fournisseur d un appel ou d un modèle : chaque relais signe son modèle. */
  function provDe(modele){ var m = String(modele || ''); return m.indexOf('photoroom') === 0 ? 'pr' : m.indexOf('tnb/') === 0 ? 'tnb' : 'fal'; }
  var NOMS_PROV = { fal: 'Fal.ai', pr: 'Photoroom', tnb: 'The New Black' };

  /* ══ LE PLAFOND MENSUEL DE DÉPENSE (lot 2 du #29) ═════════════════════════
     ⚠⚠ UN SEUL PLAFOND POUR LES TROIS FOURNISSEURS : ils inscrivent leur coût
     dans la MÊME table ; un plafond par relais ne plafonnerait rien du tout.
     ⚠ IL NE SE CONFOND PAS AVEC LE SOLDE : le solde dit ce qu il reste CHEZ LE
     FOURNISSEUR, le plafond ce que l entreprise s autorise CE MOIS-CI. */
  function cartePlafond(){
    var b = D.budget || { actif: false, mensuel: 0, depense: 0, restant: null, mois: '' };
    var pct = (b.actif && b.mensuel > 0)
      ? Math.min(100, Math.round((b.depense / b.mensuel) * 100)) : 0;
    /* La jauge change de couleur AVANT d être pleine. */
    var teinte = pct >= 100 ? '#e08a8a' : pct >= 80 ? '#d8b57a' : '#6ea8a1';
    var h = '<div class="carte"><h2>${T("Plafond mensuel de dépense")}</h2>';
    h += '<label class="rc bascule" style="display:flex;gap:.5rem;align-items:center;margin:.4rem 0 .5rem">'  // bascule : interrupteur (socle, 2026-10-04)
      + '<input type="checkbox" id="pl-actif"' + (b.actif ? ' checked' : '') + '> '
      + '<span><strong>${T("Appliquer un plafond mensuel")}</strong></span></label>';
    h += '<div class="ch" style="max-width:16rem"><label for="pl-montant">${T("Montant autorisé par mois ($US)")}</label>'
      + '<input id="pl-montant" type="number" min="0" step="1" value="'
      + (Number(b.mensuel) || 0) + '"></div>';
    if (b.actif && b.mensuel > 0) {
      h += '<div style="margin:.7rem 0 .2rem;height:.5rem;border-radius:99px;background:#22303f;overflow:hidden">'
        + '<i style="display:block;height:100%;width:' + pct + '%;background:' + teinte + '"></i></div>'
        + '<p class="dt">' + sous_(b.depense) + '${T(" dépensés sur ")}' + sous_(b.mensuel)
        + '${T(" pour ")}' + esc(b.mois || '') + '${T(" — il reste ")}<strong>' + sous_(b.restant) + '</strong>.</p>';
    } else if (b.actif) {
      h += '<p class="dt" style="color:#e08a8a">${T("Plafond actif mais fixé à 0 : <strong>tout traitement ")}'
        + '${T("payant est refusé</strong>. Posez un montant, ou décochez.")}</p>';
    } else {
      h += '<p class="dt">' + sous_(b.depense) + '${T(" dépensés ce mois-ci")}'
        + (b.mois ? ' (' + esc(b.mois) + ')' : '')
        + '${T(". Aucun plafond n’est appliqué : rien n’arrêtera un lot.")}</p>';
    }
    h += '<div class="fin2" style="margin-top:.5rem"><button class="prim" id="pl-poser">${T("Enregistrer le plafond")}</button>'
      + ' <span id="pl-dit" class="dt"></span></div>';
    return h + '</div>';
  }

  /* ── LA BARRE DES SOUS-ONGLETS ──────────────────────────────────────────
     Les choix du fournisseur (groupe .ed-seg), les filtres du tableau s il y en
     a un, et « Dernière actualisation » : l écran se rafraîchit seul, il dit
     donc quand les chiffres ont été relus. */
  function barre(filtres){
    var s = SOUS_LISTE[VUE].map(function(x){
      var on = SOUS[VUE] === x[0];
      return '<button type="button" data-sous="' + x[0] + '" role="tab" aria-selected="' + on + '"' + (on ? ' class="on"' : '') + '>' + x[1] + '</button>';
    }).join('');
    return '<div class="fl-barre"><span class="ed-seg" role="tablist" aria-label="${T("Vues")}">' + s + '</span>'
      + (filtres || '')
      + '<span class="droite"><span id="maj">' + (MAJ ? '${T("Dernière actualisation le ")}' + esc(MAJ) : '${T("Actualisation…")}') + '</span></span></div>';
  }
  function filtrePhoto(){
    return '<input id="h-q" class="fl-q" type="search" aria-label="${T("Filtrer par photo")}" placeholder="${T("Filtrer par photo (nom ou PH-000000)")}" value="' + esc(FILT_Q || '') + '">';
  }
  function filtreProv(){
    var opt = function(v, t){ return '<option value="' + v + '"' + (FILT_PROV === v ? ' selected' : '') + '>' + t + '</option>'; };
    return '<select id="h-prov" aria-label="${T("Filtrer par service")}">'
      + opt('tous', '${T("Tous les fournisseurs")}') + opt('fal', 'Fal.ai') + opt('pr', 'Photoroom') + opt('tnb', 'The New Black') + '</select>';
  }

  /* La photo d un appel : sa vignette quand la photothèque de la session l a encore, son code, son nom. */
  function cellPhoto(code, nom){
    var src = code ? PHOTOS[code] : '';
    var vg = '<span class="vg">' + (src ? '<img src="' + esc(src) + '" alt="" loading="lazy">' : '<i></i>') + '</span>';
    var tx = code
      ? '<span class="mono">' + esc(code) + '</span>' + (nom ? '<span class="dt" title="' + esc(nom) + '">' + esc(nom) + '</span>' : '')
      : (nom ? '<span class="dt" title="' + esc(nom) + '">' + esc(nom) + '</span>' : '<span class="dt">—</span>');
    return '<div class="ph">' + vg + '<span class="tx">' + tx + '</span></div>';
  }
  function pillEtat(ok, apercu){
    return ok ? (apercu ? '<span class="pill apr">${T("Aperçu gratuit")}</span>' : '<span class="pill ok">${T("réussi")}</span>')
      : '<span class="pill non">${T("échec")}</span>';
  }
  /* ⚠ LE MESSAGE D ERREUR EST RENDU TEL QUEL, sous le traitement, DANS la même rangée : « crédit épuisé » ou
     « clé invalide » se règlent vite. (Une seconde rangée était mise en page à part et pouvait se retrouver
     seule en haut de la page suivante.) */
  function ligneErreur(e){ return (e.ok || !e.erreur) ? '' : '<span class="err-l" title="' + esc(e.erreur) + '">' + esc(e.erreur) + '</span>'; }

  // ── LES TABLEAUX D APPELS (journal complet, Fal.ai, Photoroom) ──────────
  function evtsFiltres(prov){
    var q = (FILT_Q || '').trim().toLowerCase();
    return (EVTS || []).filter(function(e){
      var p = provDe(e.modele);
      if (prov && p !== prov) return false;
      if (!prov && FILT_PROV !== 'tous' && p !== FILT_PROV) return false;
      if (q) {
        var hay = ((e.photoCode || '') + ' ' + (e.photoNom || '')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }
  function lignesAppels(prov){
    var arr = evtsFiltres(prov);
    var nc = prov ? 7 : 8;
    if (!arr.length) return '<tr><td colspan="' + nc + '" class="vide">' + (EVTS && EVTS.length && (FILT_Q || FILT_PROV !== 'tous')
      ? '${T("Aucun appel pour ce filtre.")}' : '${T("Aucun appel n’a encore été fait.")}') + '</td></tr>';
    return arr.map(function(e){
      return '<tr>'
        + '<td class="dt nw">' + quand(e.au) + '</td>'
        + (prov ? '' : '<td><span class="pill g">' + NOMS_PROV[provDe(e.modele)] + '</span></td>')
        + '<td>' + esc(geste(e.geste)) + ligneErreur(e) + '</td>'
        + '<td>' + cellPhoto(e.photoCode, e.photoNom) + '</td>'
        + '<td class="dt">' + esc(e.qui || '—') + '</td>'
        + '<td class="num">' + duree(e.ms) + '</td>'
        + '<td class="num">' + sous_(e.cout) + (e.coutReel ? '' : ' <span class="dt">${T("est.")}</span>') + '</td>'
        + '<td>' + pillEtat(e.ok, e.apercu) + '</td>'
        + '</tr>';
    }).join('');
  }
  function tableAppels(prov, titre){
    var nb = evtsFiltres(prov).length;
    return '<div class="carte sz-pagee"><h2>' + titre + '<span class="cpt">' + nb + ' ' + szPl(nb, '${T("appel")}', '${T("appels")}') + '</span></h2>'
      + '<div data-pages="fal-appels-' + (prov || 'tous') + '"><table><thead><tr><th>${T("Quand")}</th>'
      + (prov ? '' : '<th>${T("Fournisseur")}</th>')
      + '<th>${T("Traitement")}</th><th>${T("Photo")}</th><th>${T("Par")}</th><th class="num">${T("Durée")}</th>'
      + '<th class="num">${T("Coût")}</th><th>${T("État")}</th></tr></thead><tbody id="h-body" data-prov="' + (prov || '') + '">'
      + lignesAppels(prov) + '</tbody></table></div></div>';
  }

  // ── LE COÛT PAR TRAITEMENT (tous, ou un fournisseur) ────────────────────
  function tableTraitements(prov, titre){
    var rows = (D.parModele || []).filter(function(m){ return !prov || provDe(m.modele) === prov; });
    var h = '<div class="carte sz-pagee"><h2>' + titre + '</h2>';
    if (!rows.length) return h + '<div class="vide">${T("Aucun traitement n’a encore été lancé.")}</div></div>';
    h += '<div data-pages="fal-traitements-' + (prov || 'tous') + '"><table><thead><tr><th>${T("Traitement")}</th>'
      + (prov ? '' : '<th>${T("Fournisseur")}</th>')
      + '<th>${T("Modèle")}</th><th class="num">${T("Appels")}</th>'
      + '<th class="num">${T("Réussis")}</th><th class="num">${T("Coût")}</th><th class="num">${T("Unitaire")}</th>'
      + '<th>${T("Prix")}</th></tr></thead><tbody>';
    h += rows.map(function(m){
      var mesure = m.coutsReels >= m.appels;
      return '<tr>'
        + '<td>' + esc(geste(m.geste)) + '</td>'
        + (prov ? '' : '<td><span class="pill g">' + NOMS_PROV[provDe(m.modele)] + '</span></td>')
        + '<td class="mono">' + esc(m.modele) + '</td>'
        + '<td class="num">' + m.appels + '</td>'
        + '<td class="num">' + m.reussis + '</td>'
        + '<td class="num">' + sous_(m.cout) + '</td>'
        + '<td class="num">' + sous_(m.appels ? (m.cout / m.appels) : 0) + '</td>'
        + '<td><span class="pill ' + (mesure ? 'ok' : 'g') + '">'
        + (mesure ? '${T("mesuré")}' : (m.coutsReels ? '${T("partiel")}' : '${T("estimé")}')) + '</span></td>'
        + '</tr>';
    }).join('');
    return h + '</tbody></table></div></div>';
  }

  // ══ VUE D ENSEMBLE ═════════════════════════════════════════════════════
  function carteJours(){
    var j = (D.parJour || []).slice().reverse();
    if (!j.length) return '<div class="carte"><h2>${T("Trente derniers jours")}</h2><div class="vide">${T("Aucun traitement ces trente derniers jours.")}</div></div>';
    var max = 0, tot = 0, nb = 0;
    j.forEach(function(x){ if (x.cout > max) max = x.cout; tot += Number(x.cout) || 0; nb += Number(x.appels) || 0; });
    return '<div class="carte"><h2>${T("Trente derniers jours")}<span class="cpt">' + sous_(tot) + ' · ' + nb + ' ' + szPl(nb, '${T("appel")}', '${T("appels")}') + '</span></h2><div class="jours">'
      + j.map(function(x){
          var ht = max ? Math.max(3, Math.round(x.cout * 100 / max)) : 3;
          return '<div class="b" style="height:' + ht + '%" title="' + esc(x.jour) + ' · '
            + x.appels + ' ' + szPl(x.appels, '${T("appel")}', '${T("appels")}') + ' · ' + sous_(x.cout) + '"></div>';
        }).join('')
      + '</div><p class="dt">${T("Du ")}' + jourCourt(j[0].jour) + '${T(" au ")}' + jourCourt(j[j.length - 1].jour)
      + '${T(". Survolez une barre pour le détail du jour.")}</p></div>';
  }
  function soldeProv(p){
    if (p === 'pr') return (PR && PR.compte && PR.compte.available != null)
      ? nbr(PR.compte.available) + ' ${T("crédits")}' : '<span class="dt">${T("non lu")}</span>';
    if (p === 'fal') { var rf = soldeFal(); return rf != null ? sous_(rf) + ' <span class="dt">${T("estimé")}</span>' : '<span class="dt">${T("à saisir en Configuration")}</span>'; }
    if (TN && TN.credits != null) return nbr(TN.credits) + ' ${T("crédits")}';
    return '<span class="dt">${T("non lu")}</span>';
  }
  function carteFournisseurs(){
    var tot = { fal: { a: 0, r: 0, c: 0 }, pr: { a: 0, r: 0, c: 0 }, tnb: { a: 0, r: 0, c: 0 } }, total = 0;
    (D.parModele || []).forEach(function(m){
      var t = tot[provDe(m.modele)];
      t.a += Number(m.appels) || 0; t.r += Number(m.reussis) || 0; t.c += Number(m.cout) || 0; total += Number(m.cout) || 0;
    });
    return '<div class="carte"><h2>${T("Par fournisseur")}<span class="cpt">${T("depuis le début")}</span></h2>'
      + '<table><thead><tr><th>${T("Fournisseur")}</th><th class="num">${T("Appels")}</th><th class="num">${T("Réussis")}</th>'
      + '<th class="num">${T("Coût")}</th><th>${T("Part du coût")}</th><th class="num">${T("Solde")}</th></tr></thead><tbody>'
      + ['fal', 'pr', 'tnb'].map(function(p){
          var t = tot[p], pct = total > 0 ? Math.round(t.c * 100 / total) : 0;
          return '<tr class="aller" data-aller="' + p + '" title="${T("Ouvrir l’onglet de ce fournisseur")}">'
            + '<td><strong>' + NOMS_PROV[p] + '</strong></td><td class="num">' + nbr(t.a) + '</td><td class="num">' + nbr(t.r) + '</td>'
            + '<td class="num">' + sous_(t.c) + '</td><td class="nw"><span class="part"><i style="width:' + pct + '%"></i></span><span class="dt">' + pct + ' %</span></td>'
            + '<td class="num">' + soldeProv(p) + '</td></tr>';
        }).join('')
      + '</tbody></table></div>';
  }
  function vueEns(){
    var s = SOUS.ens;
    if (s === 'traitements') return barre() + tableTraitements('', '${T("Coût par traitement")}');
    if (s === 'journal') return barre(filtreProv() + filtrePhoto()) + tableAppels('', '${T("Cinq cents derniers appels")}');
    return barre() + '<div class="rang2"><div>' + cartePlafond() + '</div><div>' + carteJours() + '</div></div>' + carteFournisseurs();
  }

  // ══ FAL.AI ═════════════════════════════════════════════════════════════
  function vueFal(){
    if (SOUS.fal === 'appels') return barre(filtrePhoto()) + tableAppels('fal', '${T("Appels à Fal.ai")}');
    var solde = Number(D.soldeSaisi) || 0, rf = soldeFal();
    var f = '<div class="carte"><h2>${T("Solde Fal.ai")}</h2>';
    if (rf != null) {
      f += '<div class="fl-gros">' + sous_(rf) + '<small>${T("restants (estimé)")}</small></div>'
        + '<dl class="fl-dl"><dt>${T("Solde saisi")}</dt><dd>' + sous_(solde) + '</dd>'
        + '<dt>${T("Saisi le")}</dt><dd>' + (D.soldeDate ? jourCourt(D.soldeDate) : '—') + '</dd>'
        + '<dt>${T("Consommé depuis")}</dt><dd>' + sous_(D.consoDepuis) + '</dd></dl>';
    } else {
      f += '<div class="fl-gros">—</div><p class="fl-note">${T("Aucun solde saisi : Configuration › Sécurité › Clé et plafond de dépense IA.")}</p>';
    }
    f += '<p class="franc" style="margin:.7rem 0 0">${T("Fal.ai ne donne pas son solde : c’est le montant saisi moins notre consommation mesurée depuis. Un achat de crédit fait ailleurs ne s’y voit pas.")}</p></div>';
    return barre() + '<div class="fl-deux"><div class="colonne">' + f + '</div>'
      + tableTraitements('fal', '${T("Coût par traitement")}') + '</div>';
  }

  // ══ PHOTOROOM ══════════════════════════════════════════════════════════
  function vuePr(){
    if (SOUS.pr === 'appels') return barre(filtrePhoto()) + tableAppels('pr', '${T("Appels à Photoroom")}');
    var c = (PR && PR.compte) || null, sb = (PR && PR.sandbox) || null;
    var f = '<div class="carte"><h2>${T("Crédits Photoroom")}</h2>';
    if (c && c.available != null) {
      f += '<div class="fl-gros">' + nbr(c.available) + '<small>${T("crédits disponibles")}</small></div><dl class="fl-dl">'
        + (c.subscription != null ? '<dt>${T("Crédits du forfait")}</dt><dd>' + nbr(c.subscription) + '</dd>' : '')
        + (c.plan ? '<dt>${T("Forfait")}</dt><dd>' + esc(lisible(c.plan)) + '</dd>' : '')
        + (PR.prixEdit != null ? '<dt>${T("Prix d’une retouche")}</dt><dd>' + sous_(PR.prixEdit) + '</dd>' : '')
        + '</dl>';
    } else {
      f += '<div class="fl-gros">—</div><p class="fl-note">${T("Le solde Photoroom n’a pas pu être lu.")}</p>';
    }
    if (sb) f += '<dl class="fl-dl"><dt>${T("Aperçus gratuits ce mois-ci")}</dt><dd>' + nbr(sb.utilise) + ' / ' + nbr(sb.quotaMois) + '</dd>'
      + '<dt>${T("Plafond par jour")}</dt><dd>' + nbr(sb.quotaJour) + '</dd></dl>'
      + (sb.estime ? '<p class="fl-note">${T("Le compte d’aperçus est tenu par nos journaux : une estimation.")}</p>' : '');
    f += '</div>';
    return barre() + '<div class="fl-deux"><div class="colonne">' + f + '</div>'
      + tableTraitements('pr', '${T("Coût par traitement")}') + '</div>';
  }

  /* ══ THE NEW BLACK (2026-10-18) ══════════════════════════════════════════
     Le solde est LU chez The New Black (crédits) ; son équivalent en dollars vient du FORFAIT (prix du mois ÷
     crédits du mois), une constante unique au serveur. La dépense du mois vient de NOTRE journal ; celle des
     trente jours, du registre de The New Black. L API ne donne pas la date du prochain renouvellement : on
     montre le dernier versement du forfait, rien d inventé. */
  var PALIERS_TNB = { standard: '${T("Standard (1K)")}', pro: '${T("Pro (2K)")}', ultra: '${T("Ultra (4K)")}' };
  var TYPES_TNB = { plan: '${T("Forfait")}', grant: '${T("Offerts")}', hold: '${T("Retenue")}', settle: '${T("Règlement")}', refund: '${T("Remboursement")}', purchase: '${T("Achat")}' };
  // Ce que chaque mouvement veut dire, en une phrase : « Retenue −1 » puis « Règlement 0 » se lisaient comme deux dépenses.
  var SENS_TNB = { plan: '${T("Versement mensuel du forfait")}', grant: '${T("Crédits offerts par The New Black")}',
    hold: '${T("Crédits réservés au lancement")}', settle: '${T("Retenue confirmée à la livraison")}',
    refund: '${T("Crédits rendus")}', purchase: '${T("Achat de crédits")}' };
  var PILL_TNB = { plan: 'ok', grant: 'ok', purchase: 'ok', refund: 'ok', hold: 'apr', settle: 'g' };
  var NOTES_TNB = { delivered: '${T("génération livrée")}', failed: '${T("génération échouée")}', error: '${T("génération échouée")}',
    refunded: '${T("remboursée")}', cancelled: '${T("annulée")}', canceled: '${T("annulée")}', expired: '${T("expirée")}',
    image_to_ghost_mannequin: '${T("vêtement sans mannequin")}', ghost_mannequin: '${T("vêtement sans mannequin")}',
    monthly: '${T("forfait mensuel")}', subscription: '${T("abonnement")}', renewal: '${T("renouvellement")}' };
  function noteTnb(n){
    var k = String(n || '').trim();
    if (!k) return '';
    var base = k.toLowerCase();
    var tiret = base.lastIndexOf('-v');   // « image_to_ghost_mannequin-v1 » : la version du flux ne se lit pas
    if (tiret > 0 && /^[0-9]+$/.test(base.slice(tiret + 2))) base = base.slice(0, tiret);
    return NOTES_TNB[base] || lisible(base);
  }
  function prixCredit(){ return Number(TN && TN.prixCredit) || 0; }
  function vueTnbApercu(){
    var t = TN || {}, fo = t.forfait || {};
    var solde = '<div class="carte"><h2>${T("Solde")}</h2>';
    if (!t.clePosee) solde += '<div class="fl-gros">—</div><p class="fl-note">${T("Aucune clé The New Black : Configuration › Sécurité › Clé et plafond de dépense IA.")}</p>';
    else if (t.credits == null) solde += '<div class="fl-gros">—</div><p class="fl-note" style="color:var(--tx-err)">${T("Solde non lu :")} ' + esc(t.error || t.motif || '?') + '</p>';
    else solde += '<div class="fl-gros">' + nbr(t.credits) + '<small>${T("crédits")}</small></div>'
      + '<dl class="fl-dl"><dt>${T("Équivalent")}</dt><dd>≈ ' + sous_(t.dollars) + '</dd>'
      + '<dt>${T("Prix du crédit")}</dt><dd>' + sous_(t.prixCredit) + '</dd></dl>';
    var dernier = (t.registre || []).filter(function(x){ return x.type === 'plan'; })[0];
    solde += '</div>';
    var forfait = '<div class="carte"><h2>${T("Forfait")}</h2><dl class="fl-dl" style="margin-top:0">'
      + '<dt>${T("Forfait")}</dt><dd>' + esc(fo.nom || '—') + '</dd>'
      + '<dt>${T("Prix par mois")}</dt><dd>' + sous_(fo.prixMois) + '</dd>'
      + '<dt>${T("Crédits par mois")}</dt><dd>' + nbr(fo.creditsMois) + '</dd>'
      + '<dt>${T("Cumul permis")}</dt><dd>' + nbr(fo.cumulMax) + ' ${T("crédits")}</dd>'
      + '<dt>${T("Dernier versement")}</dt><dd>' + (dernier ? jourCourt(dernier.au) : '—') + '</dd></dl>'
      + '<p class="fl-note">${T("The New Black ne communique pas la date du prochain renouvellement.")}</p></div>';
    var mo = t.mois || {}, d30 = t.depense30j || null;
    var dep = '<div class="carte"><h2>${T("Dépenses")}</h2><dl class="fl-dl" style="margin-top:0">'
      + '<dt>' + remplir('${T("Ce mois-ci ({0})")}', [esc(mo.mois || '')]) + '</dt><dd>' + sous_(mo.dollars) + '</dd>'
      + '<dt>${T("Générations réussies ce mois-ci")}</dt><dd>' + nbr(mo.generations) + '</dd>'
      + (d30 ? '<dt>${T("Trente derniers jours (The New Black)")}</dt><dd>' + nbr(d30.credits) + ' ${T("cr.")} · ' + sous_(d30.dollars) + '</dd>' : '')
      + '</dl><p class="fl-note">${T("Le détourage qui suit chaque génération (fal.ai) est compté à part, avec les autres traitements.")}</p></div>';
    var pal = t.paliers || {};
    var cles = Object.keys(pal);
    var tarif = '<div class="carte"><h2>${T("Tarif par palier")}</h2>' + (cles.length
      ? '<table><thead><tr><th>${T("Palier")}</th><th class="num">${T("Crédits")}</th><th class="num">${T("Coût")}</th></tr></thead><tbody>'
        + cles.map(function(k){ var c = Number(pal[k] && pal[k].credits) || 0;
            return '<tr><td>' + esc(PALIERS_TNB[k] || lisible(k)) + '</td><td class="num">' + nbr(c) + '</td><td class="num">≈ ' + sous_(c * prixCredit()) + '</td></tr>'; }).join('')
        + '</tbody></table>'
      : '<div class="vide">—</div>') + '</div>';
    return barre() + '<div class="rang2"><div>' + solde + '</div><div>' + dep + '</div></div>'
      + '<div class="rang2"><div>' + forfait + '</div><div>' + tarif + '</div></div>';
  }
  function lignesGen(){
    var g = (TN && TN.generations) || [];
    var q = (FILT_Q || '').trim().toLowerCase();
    var arr = g.filter(function(e){ return !q || ((e.photoCode || '') + ' ' + (e.photoNom || '')).toLowerCase().indexOf(q) >= 0; });
    if (!arr.length) return '<tr><td colspan="7" class="vide">' + (g.length ? '${T("Aucune génération pour ce filtre.")}'
      : '${T("Aucune génération The New Black n’a encore été lancée.")}') + '</td></tr>';
    return arr.map(function(e){
      return '<tr><td class="dt nw">' + quand(e.au) + '</td>'
        + '<td>' + cellPhoto(e.photoCode, e.photoNom) + ligneErreur(e) + '</td>'
        + '<td class="nw">' + esc(PALIERS_TNB[e.palier] || lisible(e.palier)) + '</td><td class="dt">' + esc(e.qui || '—') + '</td>'
        + '<td class="num">' + duree(e.ms) + '</td><td class="num">' + sous_(e.cout) + '</td>'
        + '<td>' + pillEtat(e.ok, false) + '</td></tr>';
    }).join('');
  }
  function vueTnbGen(){
    var n = ((TN && TN.generations) || []).length;
    return barre(filtrePhoto()) + '<div class="carte sz-pagee"><h2>${T("Générations The New Black")}<span class="cpt">'
      + remplir('${T("{0} plus récentes")}', [n]) + '</span></h2>'
      + '<div data-pages="tnb-generations"><table><thead><tr><th>${T("Quand")}</th><th>${T("Photo")}</th><th>${T("Palier")}</th>'
      + '<th>${T("Par")}</th><th class="num">${T("Durée")}</th><th class="num">${T("Coût")}</th><th>${T("État")}</th></tr></thead>'
      + '<tbody id="h-body" data-gen="1">' + lignesGen() + '</tbody></table></div></div>';
  }
  function vueTnbMouv(){
    var reg = (TN && TN.registre) || [];
    var h = barre() + '<div class="carte sz-pagee"><h2>${T("Registre The New Black")}<span class="cpt">${T("trente derniers jours")}</span></h2>';
    if (!reg.length) return h + '<div class="vide">' + ((TN && TN.clePosee === false) ? '${T("Aucune clé The New Black : Configuration › Sécurité › Clé et plafond de dépense IA.")}'
      : '${T("Aucun mouvement ces trente derniers jours.")}') + '</div></div>';
    h += '<div data-pages="tnb-registre"><table><thead><tr><th>${T("Quand")}</th><th>${T("Mouvement")}</th><th>${T("Détail")}</th>'
      + '<th class="num">${T("Crédits")}</th><th class="num">${T("Équivalent")}</th></tr></thead><tbody>';
    h += reg.map(function(x){
      var c = Number(x.credits) || 0, note = noteTnb(x.note);
      var sens = SENS_TNB[x.type] || '';
      return '<tr><td class="dt nw">' + quand(x.au) + '</td>'
        + '<td><span class="pill ' + (PILL_TNB[x.type] || 'g') + '">' + esc(TYPES_TNB[x.type] || lisible(x.type)) + '</span></td>'
        + '<td>' + esc(sens) + (note ? (sens ? ' <span class="dt">· ' + esc(note) + '</span>' : esc(note)) : '') + '</td>'
        + '<td class="num' + (c > 0 ? ' plus' : '') + '">' + (c > 0 ? '+' : c < 0 ? '−' : '') + nbr(Math.abs(c)) + '</td>'
        + '<td class="num dt">' + (c ? (c > 0 ? '+' : '−') + sous_(Math.abs(c) * prixCredit()) : '—') + '</td></tr>';
    }).join('');
    return h + '</tbody></table></div></div>';
  }
  function vueTnb(){
    if (SOUS.tnb === 'generations') return vueTnbGen();
    if (SOUS.tnb === 'mouvements') return vueTnbMouv();
    return vueTnbApercu();
  }

  function dessiner(){
    Array.prototype.forEach.call(document.querySelectorAll('.onglets [data-vue]'), function(b){
      var on = b.getAttribute('data-vue') === VUE;
      b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    corps.innerHTML = VUE === 'fal' ? vueFal() : VUE === 'pr' ? vuePr() : VUE === 'tnb' ? vueTnb() : vueEns();
    brancherFiltres();
    if (VUE === 'ens' && SOUS.ens === 'resume') brancherPlafond();
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
      /* ⚠ ON REFUSE AVANT D ÉCRIRE, ET ON DIT POURQUOI : un plafond actif à 0 refuse tout traitement payant. */
      if (actif && mensuel <= 0) {
        if (dt) { dt.style.color = '#e08a8a';
          dt.textContent = '${T("Un plafond actif à 0 $ refuse tout traitement. Posez un montant, ou décochez.")}'; }
        return;
      }
      bt.disabled = true;
      if (dt) { dt.style.color = ''; dt.textContent = '${T("Enregistrement…")}'; }
      appeler('fal:plafondPoser', [{ actif: actif, mensuel: mensuel }]).then(function(r){
        bt.disabled = false;
        if (!r || !r.ok) {
          if (dt) { dt.style.color = '#e08a8a'; dt.textContent = expliquer(r); }
          dire(expliquer(r), 'err');
          return;
        }
        dire('${T("Plafond enregistré.")}', 'bon');
        /* ⚠ ON RECHARGE : la jauge se calcule sur la dépense du mois, que seul le relais connaît. */
        charger(false);
      });
    };
  }
  /* Les filtres se posent APRÈS le dessin. Ils ne redessinent que le CORPS du
     tableau (h-body), pour ne pas voler le foyer du champ pendant la frappe. */
  function brancherFiltres(){
    var sp = document.getElementById('h-prov');
    if (sp) sp.onchange = function(){ FILT_PROV = sp.value; refiltrer(); };
    var q = document.getElementById('h-q');
    if (q) q.oninput = function(){ FILT_Q = q.value; refiltrer(); };
  }
  function refiltrer(){
    var b = document.getElementById('h-body');
    if (!b) return;
    if (b.getAttribute('data-gen')) { b.innerHTML = lignesGen(); return; }
    var prov = b.getAttribute('data-prov') || '';
    b.innerHTML = lignesAppels(prov);
    var c = b.closest('.carte'), cpt = c && c.querySelector('h2 .cpt');
    if (cpt) { var nb = evtsFiltres(prov).length; cpt.textContent = nb + ' ' + szPl(nb, '${T("appel")}', '${T("appels")}'); }
  }

  /* Ce que la vue affichée demande au pont : le journal des appels n est lu que pour un tableau d appels, le
     détail The New Black que pour son onglet (et le résumé, pour son solde), la photothèque que pour les
     vignettes. */
  function besoinJournal(){ return (VUE === 'ens' && SOUS.ens === 'journal') || ((VUE === 'fal' || VUE === 'pr') && SOUS[VUE] === 'appels'); }
  function besoinTnb(){ return VUE === 'tnb' || (VUE === 'ens' && SOUS.ens === 'resume'); }
  function besoinPhotos(){ return besoinJournal() || (VUE === 'tnb' && SOUS.tnb === 'generations'); }
  function pret(){ return !!D && (!besoinJournal() || EVTS !== null) && (!besoinTnb() || TN !== null); }
  function aller(vue, sousVue){
    VUE = vue; if (sousVue) SOUS[vue] = sousVue;
    if (pret()) { dessiner(); charger(false); } else charger(false);
  }
  document.querySelector('.onglets').addEventListener('click', function(ev){
    var b = ev.target.closest('[data-vue]'); if (!b) return;
    aller(b.getAttribute('data-vue'));
  });
  corps.addEventListener('click', function(ev){
    var s = ev.target.closest('[data-sous]');
    if (s) { if (SOUS[VUE] !== s.getAttribute('data-sous')) aller(VUE, s.getAttribute('data-sous')); return; }
    var a = ev.target.closest('[data-aller]');
    if (a) aller(a.getAttribute('data-aller'));
  });

  var LECTURE = 0;
  function charger(dit){
    if (dit) dire('${T("Lecture…")}');
    var no = ++LECTURE;
    var vJ = besoinJournal(), vT = besoinTnb(), vP = besoinPhotos();
    Promise.all([
      appeler('fal:suivi', [vJ ? 'journal' : 'resume']),
      appeler('photoroom:compte'),
      vT ? appeler('fal:suivi', ['tnb']) : Promise.resolve(null),
      vP ? appeler('photos:liste') : Promise.resolve(null)
    ]).then(function(rs){
      if (no !== LECTURE) return;   // une lecture plus récente est partie : on ne dessine pas la vieille
      var r = rs[0];
      // le VŒU de la pastille The New Black du tableau de bord : l écran s ouvre (ou se tourne) sur son onglet
      if ((r && r.voeu === 'tnb') || (rs[2] && rs[2].voeu === 'tnb')) { if (VUE !== 'tnb') { VUE = 'tnb'; SOUS.tnb = 'apercu'; charger(false); return; } }
      if (vT) TN = (rs[2] && rs[2].ok) ? rs[2] : { clePosee: true, credits: null, error: expliquer(rs[2]) };
      // Le compteur Photoroom ne bloque pas l écran : s il échoue, sa fiche le dit.
      PR = (rs[1] && rs[1].ok) ? rs[1] : null;
      if (rs[3] && rs[3].ok && Array.isArray(rs[3].photos)) {
        PHOTOS = {};
        rs[3].photos.forEach(function(p){ if (p && p.code && p.src) PHOTOS[p.code] = p.src; });
      }
      if (!r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide m-' + ((r && r.motif) || 'echec') + '">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r;
      if (vJ) EVTS = r.evenements || [];
      MAJ = _horoNow();
      /* ⚠ Le singulier et le pluriel, chacun entier. */
      sous.textContent = resumeCredits() + ' · ' + (D.appels || 0) + ((D.appels || 0) > 1 ? '${T(" appels")}' : '${T(" appel")}')
        + ' · ' + sous_(D.total);
      dessiner();
      if (dit) dire('');
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     RAFRAÎCHISSEMENT AUTOMATIQUE — plus de bouton « Recharger »
     ⚠ On SONDE léger (le résumé, sans les 500 événements) toutes les 5 s ; si
     quelque chose a bougé, on recharge la vue ouverte ; sinon on rafraîchit
     juste l horodatage.
     ⚠⚠ ON NE REDESSINE JAMAIS PENDANT UNE SAISIE : sinon la frappe serait avalée. */
  function _horoNow(){
    try { return new Date().toLocaleString('${LIEU()}', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (e) { return ''; }
  }
  /* ⚠ LE PLAFOND FAIT PARTIE DE LA SIGNATURE : posé depuis un autre poste, il doit apparaître ici. */
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
    /* ⚠⚠ LE MONTANT DU PLAFOND EN FAIT PARTIE : un montant à moitié tapé serait effacé sous les doigts. */
    return !!(a && (a.id === 'h-q' || a.id === 'h-prov'
      || a.id === 'pl-montant' || a.id === 'pl-actif'));
  }
  function veille(){
    setInterval(function(){
      if (saisieActive()) return;
      var avant = signatureCourante();
      Promise.all([appeler('fal:suivi', ['resume']), appeler('photoroom:compte')]).then(function(rs){
        var r = rs[0];
        if (!r || !r.ok) return;   // une lecture ratée ne casse pas l écran affiché
        if (r.voeu === 'tnb' && VUE !== 'tnb') { aller('tnb', 'apercu'); return; }
        var prNew = (rs[1] && rs[1].ok) ? rs[1] : PR;
        var pa = (prNew && prNew.compte && prNew.compte.available != null) ? prNew.compte.available : '-';
        var apres = [r.appels, r.total, pa, r.soldeSaisi, r.consoDepuis, sigPlafond(r.budget)].join('|');
        MAJ = _horoNow();
        if (apres !== avant) {
          PR = prNew;
          charger(false);   // rechargement complet et silencieux de la vue ouverte
        } else {
          var el = document.getElementById('maj');
          if (el) el.textContent = '${T("Dernière actualisation le ")}' + MAJ;
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
