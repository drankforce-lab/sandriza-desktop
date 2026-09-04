'use strict';

/*
 * FENÊTRE « DEMANDE DE RETOUR » — NATIVE, TROIS ÉTAPES
 * =============================================================================
 * Demande, traitement, règlement. Écrite ici, aucune page du site chargée :
 * la fenêtre demande au pont, qui fait faire au site ce que lui seul sait —
 * réserver le dossier, générer l'étiquette, rembourser, écrire.
 *
 * ⚠⚠ DE L'ARGENT AUX DEUX BOUTS. Le règlement peut REMBOURSER (Square, ou un
 * crédit boutique qui n'expire jamais), et l'étiquette de retour Postes Canada
 * est une VRAIE étiquette facturée. D'où les mêmes disciplines que la fenêtre
 * Expédition : le service et le poids visibles avant le bouton, une
 * confirmation qui répète les montants, et un bouton qui dépense d'une autre
 * couleur que les autres.
 *
 * ⚠ LA RÈGLE DES MONTANTS VIENT DU SITE. Les suggestions par ligne (2 pour 1
 * réduit de moitié, livraison seulement si faute de la boutique, traitement
 * prioritaire jamais remboursé, fenêtre de jours ouvrables) sont calculées par
 * les MÊMES fonctions que l'écran du site et arrivent par retour:lire — rien
 * n'est recalculé ici, deux calculs finiraient par se contredire.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, et un accent grave égaré
 * referme la chaîne. Neuf fois sur ce projet, dont une en emportant la barre de
 * menu entière.
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
.tete .pill{font-size:.7rem;padding:.14rem .6rem;border-radius:99px;
  border:1px solid var(--v20);margin-left:.6rem}

.pas{flex:0 0 auto;display:flex;gap:.35rem;padding:.45rem 1.1rem;
  border-bottom:1px solid var(--v07);background:#111a28}
.pas button{font:inherit;font-size:.76rem;padding:.24rem .6rem;border-radius:7px;
  border:1px solid transparent;background:transparent;color:var(--tx2);cursor:pointer}
.pas button.on{background:rgba(201,169,126,.16);border-color:rgba(201,169,126,.45);color:var(--tx-creme)}

.corps{flex:1 1 auto;min-height:0;padding:.75rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.55rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}

.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem;flex:0 0 auto}
.carte h2{margin:0 0 .45rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.09em;color:var(--tx2);font-weight:700}
.carte h2 .note{font-weight:400;text-transform:none;letter-spacing:0;color:var(--tx3)}

.info{display:grid;grid-template-columns:1fr 1fr;gap:.5rem 1.2rem;font-size:.86rem}
.info .k{font-size:.7rem;color:var(--tx2)}
.info .v{font-weight:500}
.info .large{grid-column:1/-1}

input,select,textarea{font:inherit;color:var(--tx);background:var(--f-0f1826);
  border:1px solid var(--v14);border-radius:8px;padding:.32rem .5rem;
  width:100%;min-width:0}
input:focus,select:focus,textarea:focus{outline:none;border-color:#c9a97e}
textarea{resize:none}
.r2{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.r3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem}
.ch{display:flex;flex-direction:column;gap:.2rem;min-width:0}
.ch label{font-size:.72rem;color:var(--tx2)}

button{font:inherit;cursor:pointer;border-radius:8px;padding:.32rem .7rem;
  border:1px solid var(--v16);background:var(--v05);
  color:var(--tx);transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:var(--v10);border-color:var(--v30)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
button.paie{background:#7859f7;border-color:#7859f7;color:var(--tx-sur-accent);font-weight:600}
button.paie:hover:not(:disabled){background:#8f74ff;border-color:#8f74ff}
button.mini{padding:.12rem .5rem;font-size:.75rem}

.avis{font-size:.78rem;line-height:1.45;border-radius:9px;padding:.45rem .7rem;margin-top:.4rem}
.avis.jaune{background:rgba(245,158,11,.11);border:1px solid rgba(245,158,11,.42);color:#f0c987}
.avis.vert{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.35);color:#86e5a8}
.avis.rouge{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.38);color:var(--tx-f6a5a5)}
.avis.bleu{background:rgba(96,165,250,.1);border:1px solid rgba(96,165,250,.38);color:#a9c9f7}
.aide{font-size:.73rem;color:var(--tx2);line-height:1.45}

.art{display:flex;align-items:center;gap:.6rem;padding:.4rem .5rem;border-radius:8px;
  background:var(--v03);border:1px solid var(--v06);margin-top:.35rem}
.art .d{flex:1 1 auto;min-width:0}
.art .n{font-size:.88rem;font-weight:600}
.art .v{font-size:.75rem;color:var(--tx2)}
.art select{width:auto}
.ligne{display:flex;align-items:center;justify-content:space-between;gap:.7rem;
  padding:.3rem 0;border-bottom:1px solid var(--v06);font-size:.85rem}
.ligne input{width:6.2rem;text-align:right}
.photo{max-width:200px;max-height:200px;border-radius:8px;border:1px solid var(--v14)}
.jetons{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.4rem}
.jetons button{font-size:.72rem;padding:.14rem .5rem}

.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid var(--v08);
  background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
.actions{flex:0 0 auto;display:flex;gap:.4rem}
.vide{padding:1.6rem 1rem;text-align:center;color:var(--tx2);font-size:.86rem}

.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.5rem;z-index:50}
.voile .boite{background:var(--f-carte);border:1px solid var(--v12);
  border-radius:13px;padding:1.1rem 1.25rem;max-width:34rem;width:100%;
  max-height:82vh;overflow-y:auto}
.voile h3{margin:0 0 .55rem;font:700 1.05rem/1.25 Georgia,serif}
.voile p{margin:.35rem 0;font-size:.86rem}
.voile .fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.85rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Demande de retour ». */
function pageRetour(id) {
  const depart = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Demande de retour — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.returns}</span><h1 id="titre">Demande de retour</h1>
  <span class="pill" id="pill" style="display:none"></span>
  <span class="sous" id="sous"></span></div>
<div class="pas" id="pas"></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions" id="actions"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}${JS_BROUILLON}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var actions = document.getElementById('actions');
  var sous = document.getElementById('sous');

  var ID = ${depart};
  var R = null;              // la reponse complete de retour:lire
  var ETAPE = 0;             // 0 demande, 1 traitement, 2 reglement
  /* ⚠ LES DECISIONS D INVENTAIRE ET LES MONTANTS VIVENT ICI, hors de l ecran :
     changer d etape redessine tout, et lire les champs a la fin ne rendrait que
     l etape affichee. Meme lecon que la grille d inventaire. */
  var DECISIONS = {};        // productId -> { backToStock, reason }
  var MONTANTS = null;       // montants par ligne (copies editables de la suggestion)
  var enCours = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function argent(n){
    var v = (Math.round((parseFloat(n) || 0) * 100) / 100).toFixed(2);
    return v.replace('.', ',') + ' $';
  }
  function dateFr(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  var STATUTS = {
    awaiting_photo: '📷 Photo requise', pending: 'En attente', approved: 'Approuvée',
    rejected: 'Rejetée', in_transit: 'En transit', received: 'Reçu — en traitement',
    refunded: 'Remboursée', completed: 'Complétée', disputed: 'En attente d’analyse'
  };
  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne permet pas de traiter les retours.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette demande n’existe plus.',
    verrou:             'Dossier ouvert par quelqu’un d’autre.',
    echange_indisponible:'Échange impossible : l’article n’est plus disponible.',
    liberation_echouee: 'La taille réservée n’a pas pu être libérée — réessayez.',
    raison_requise:     'Une raison est requise pour chaque article non remis en inventaire.',
    montant_invalide:   'Montant du remboursement invalide.',
    etiquette_absente:  'Aucune étiquette générée pour cette demande.',
    /* Les motifs du RECOURS (reprendre l’étiquette chez Postes Canada). Chacun
       dit où aller : un « échec » sans direction fait rouvrir le dossier demain
       avec la même question. */
    envoi_absent:       'Aucun envoi Postes Canada n’est rattaché à cette demande — il n’y a rien à reprendre. Générez l’étiquette depuis l’étape Décision.',
    identifiants:       'Identifiants Postes Canada indisponibles.',
    config:             'Configuration Postes Canada incomplète — Configuration → Transporteurs.',
    cp_refus:           'Postes Canada a refusé la demande.',
    pdf_absent:         'Postes Canada n’a pas renvoyé de PDF pour cet envoi.',
    reseau:             'Le réseau n’a pas répondu.',
    echec:              'L’opération a échoué.'
  };
  /* Motifs dont le detail est un FRAGMENT a coller apres la phrase, pas une
     phrase de remplacement (voir la fonction expliquer).
     ⚠ AUCUN ACCENT GRAVE DANS CE FICHIER : tout ce script vit dans un gabarit,
     et le premier accent grave le referme. Le module ne se charge plus. */
  var COMPLEMENT = { identifiants: 1, config: 1, cp_refus: 1, reseau: 1 };
  function expliquer(r){
    var m = r && r.motif;
    if (m === 'verrou') return MOTIFS.verrou + (r.parQui ? ' (' + r.parQui + ')' : '');
    if (m === 'echange_indisponible') return MOTIFS.echange_indisponible + ' Basculez sur '
      + (r.modeRepli === 'creditOnly' ? 'un crédit boutique.' : 'un remboursement complet.');
    if (m === 'raison_requise' && r.article) return 'Raison requise pour « ' + r.article + ' ».';
    /* ⚠ POUR CEUX-CI, LE DETAIL COMPLETE LA PHRASE — IL NE LA REMPLACE PAS.
       La regle generale plus bas rend r.detail SEUL des qu il existe : sur le
       recours d etiquette, ca donnait « mot de passe API » tout court, sans dire
       ni ce qui a echoue ni ou aller. Le detail y est un fragment (la liste des
       champs manquants, le message brut de Postes Canada), pas une phrase. */
    if (COMPLEMENT[m]) return MOTIFS[m] + (r.detail ? ' ' + r.detail : '');
    if (r && r.detail) return r.detail;
    return MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
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
    corps.innerHTML = '<div class="carte"><div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div></div>';
    actions.innerHTML = '';
    document.getElementById('pas').innerHTML = '';
  }

  function val(id2){ var e = document.getElementById(id2); return e ? e.value : ''; }
  function coche(id2){ var e = document.getElementById(id2); return !!(e && e.checked); }

  /* Le traitement et le reglement n ont de sens que sur un dossier recu ou
     approuve — comme les actions rapides de l ecran du site. */
  function traitable(){
    var s = R.demande.statut;
    return R.peutEcrire && (s === 'received' || s === 'approved' || s === 'in_transit');
  }

  // ══ DESSIN ════════════════════════════════════════════════════════════════
  function fil(){
    var t = ['1 Demande', '2 Traitement', '3 Règlement'];
    document.getElementById('pas').innerHTML = t.map(function(x, k){
      return '<button type="button" data-et="' + k + '" class="' + (k === ETAPE ? 'on' : '') + '"'
        + ((k > 0 && !traitable()) ? ' disabled title="Le dossier doit être approuvé ou reçu"' : '')
        + '>' + esc(x) + '</button>';
    }).join('');
  }

  /* ⚠ LA PROPOSITION EST ICI, PAS DANS UN CHEMIN D'OUVERTURE. Cette fenetre n'a
     pas de bouton << modifier >> : elle s'ouvre DEJA sur son formulaire, et se
     redessine a chaque etape du fil. On propose donc apres le dessin de la
     premiere etape, et une seule fois — sinon la question reviendrait a chaque
     aller-retour dans le fil, ce qui est plus agacant que la perte qu'on evite. */
  var BR_PROPOSE = false;
  function dessiner(){
    fil();
    if (ETAPE === 0) dessinerDemande();
    else if (ETAPE === 1) dessinerTraitement();
    else dessinerReglement();
    if (!BR_PROPOSE && ETAPE === 0 && document.getElementById('r-notes')) {
      BR_PROPOSE = true;
      szBrouillonProposer();
    }
  }

  function dessinerDemande(){
    var d = R.demande;
    var h = '<div class="carte"><h2>Demande <span class="note">— ' + esc(d.commande)
      + ' · soumise le ' + esc(dateFr(d.creeLe)) + '</span></h2>'
      + '<div class="info">'
      + '<div><div class="k">Client</div><div class="v">' + esc(d.client || '—') + '</div></div>'
      + '<div><div class="k">Courriel</div><div class="v">' + esc(d.courriel || '—') + '</div></div>'
      + '<div class="large"><div class="k">Motif</div><div class="v">' + esc(d.motif || '—') + '</div></div>'
      + (d.description ? '<div class="large"><div class="k">Description du client</div><div class="v" style="white-space:pre-wrap;font-weight:400">' + esc(d.description) + '</div></div>' : '')
      + (d.modeRemboursement ? '<div class="large"><div class="k">Mode communiqué au client</div><div class="v">'
          + (d.modeRemboursement === 'creditOnly' ? '💳 Crédit boutique uniquement' : '💰 Moyen original ou crédit, au choix')
          + (d.preference ? ' · préférence : ' + (d.preference === 'credit' ? 'crédit boutique' : 'moyen original') : '') + '</div></div>' : '')
      + (d.fraisPayesPar ? '<div class="large"><div class="k">Frais de retour</div><div class="v">'
          + (d.fraisPayesPar === 'store' ? '<span class="ic">🛠</span> Pris en charge par la boutique (défaut / erreur)' : '<span class="ic">📦</span> À la charge du client') + '</div></div>' : '')
      + '</div></div>';

    // Articles
    h += '<div class="carte"><h2>Articles <span class="note">— ' + R.articles.length + '</span></h2>'
      + R.articles.map(function(a){
          return '<div class="art"><div class="d"><div class="n">' + esc(a.nom) + '</div>'
            + '<div class="v">' + esc([a.taille, a.couleur].filter(Boolean).join(' · ') || '—')
            + ' · × ' + a.quantite + '</div></div>'
            + '<div>' + argent(a.prix * a.quantite) + '</div></div>'; }).join('')
      + '</div>';

    // Photo — la demande n est pas actionnable sans elle.
    h += '<div class="carte"><h2>Photo de l’article</h2>'
      + (d.photo ? '<img class="photo" src="' + esc(d.photo) + '">'
                 : '<div class="aide">⏳ Le client n’a pas encore téléversé de photo — la demande n’est pas actionnable.</div>')
      + '</div>';

    if (d.suivi) {
      h += '<div class="carte"><h2>Retour expédié par le client</h2>'
        + '<div class="info"><div><div class="k">Transporteur</div><div class="v">' + esc(d.suiviTransporteur || '—') + '</div></div>'
        + '<div><div class="k">Numéro de suivi</div><div class="v" style="font-family:ui-monospace,monospace">' + esc(d.suivi) + '</div></div></div></div>';
    }

    if (d.litige) {
      h += '<div class="carte"><h2>Réponse du client <span class="note">— suite au rejet automatique</span></h2>'
        + (d.litige.message ? '<div style="white-space:pre-wrap;font-size:.87rem">' + esc(d.litige.message) + '</div>'
                            : '<div class="aide">(aucun message écrit)</div>')
        + (d.litige.preuve ? '<div style="margin-top:.5rem"><img class="photo" src="' + esc(d.litige.preuve) + '"></div>' : '')
        + (R.peutEcrire ? '<div style="display:flex;gap:.45rem;margin-top:.6rem">'
          + '<button class="mini" id="btn-rouvrir">↩ Rouvrir la demande</button>'
          + '<button class="mini" id="btn-rejeter">✕ Confirmer le rejet</button></div>' : '')
        + '</div>';
    }

    // Statut, note de refus, etiquette, notes — la partie qui S ENREGISTRE.
    var fige = d.statut === 'awaiting_photo' || d.statut === 'completed' || d.statut === 'refunded' || R.archive;
    h += '<div class="carte"><h2>Décision</h2>';
    if (R.archive) {
      h += '<div class="aide"><span class="ic">🗄</span> Demande archivée — lecture seule.</div>';
    } else if (fige) {
      h += '<div class="aide">' + (d.statut === 'awaiting_photo'
        ? 'Pas de changement de statut tant que la photo n’est pas fournie — seules les notes s’enregistrent.'
        : '✅ Dossier ' + (d.statut === 'refunded' ? 'remboursé' : 'complété') + ' — seules les notes s’enregistrent.') + '</div>';
    } else {
      h += '<div class="r2"><div class="ch"><label for="r-statut">Statut</label><select id="r-statut">'
        + ['pending','approved','rejected','in_transit','received','refunded','completed'].map(function(s){
            return '<option value="' + s + '"' + (d.statut === s ? ' selected' : '') + '>' + esc(STATUTS[s] || s) + '</option>'; }).join('')
        + '</select></div><div class="ch" id="z-refus" style="' + (d.statut === 'rejected' ? '' : 'display:none') + '">'
        + '<label for="r-refus">Note de refus — visible au client</label>'
        + '<input id="r-refus" value="' + esc(d.noteRefus) + '" placeholder="Expliquez la raison du refus…"></div></div>';

      // Etiquette de retour — visible quand on approuve.
      h += '<div id="z-etiq" style="' + (d.statut === 'approved' ? '' : 'display:none') + ';margin-top:.55rem;'
        + 'padding:.55rem .7rem;background:var(--v03);border:1px solid var(--v08);border-radius:9px">'
        + '<div style="font-size:.72rem;color:var(--tx2);font-weight:700;text-transform:uppercase;letter-spacing:.07em"><span class="ic">📦</span> Étiquette de retour</div>'
        + (d.aUneEtiquette ? '<div class="avis jaune"><span class="ic">⚠</span> Une étiquette existe déjà ('
            + (d.etiquetteReelle ? 'réelle Postes Canada — la régénérer sera FACTURÉ une seconde fois' : 'PDF interne')
            + (d.suivi ? ' · suivi ' + esc(d.suivi) : '') + ').</div>' : '')
        + '<div class="r3" style="margin-top:.45rem">'
        + '<div class="ch"><label for="r-transp">Transporteur</label><select id="r-transp">'
        + R.etiquette.transporteurs.map(function(t){
            return '<option value="' + esc(t.cle) + '"' + (t.cle === (d.etiquetteTransporteur || 'postes-canada') ? ' selected' : '') + '>' + esc(t.nom) + '</option>'; }).join('')
        + '</select></div>'
        + '<div class="ch" id="z-cp-serv"><label for="r-service">Service Postes Canada</label><select id="r-service"'
        + (R.etiquette.cpPret ? '' : ' disabled') + '>'
        + R.etiquette.services.map(function(s2){ return '<option value="' + esc(s2.cle) + '">' + esc(s2.libelle) + '</option>'; }).join('')
        + '</select></div>'
        + '<div class="ch"><label for="r-poids">Poids (kg)</label>'
        + '<input id="r-poids" type="number" min="0.001" step="0.001" value="' + esc(R.etiquette.poidsCalcule) + '"></div>'
        + '</div>'
        + '<label style="display:flex;align-items:center;gap:.4rem;font-size:.82rem;margin-top:.5rem;cursor:pointer">'
        + '<input type="checkbox" id="r-generer"' + (d.aUneEtiquette ? '' : ' checked') + '> '
        + (d.aUneEtiquette ? 'Régénérer et joindre au courriel' : 'Générer et joindre l’étiquette au courriel') + '</label>'
        + (R.etiquette.cpPret ? '' : '<div class="aide" style="margin-top:.3rem"><span class="ic">💡</span> Postes Canada non configuré : un PDF interne sera généré (sans suivi réel).</div>')
        + '</div>';
    }
    if (!R.archive) {
      h += '<div class="ch" style="margin-top:.55rem"><label for="r-notes">Notes internes (jamais vues du client)</label>'
        // rows="3" (2026-08-21, sur sa demande) : on y ecrit une vraie phrase, et
        // elle se relit des semaines plus tard. Bloc empile en une colonne, donc la
        // ligne de plus ne deplace rien ; la fenetre a 760 px pour 540 de minimum.
        + '<textarea id="r-notes" rows="3">' + esc(d.notes) + '</textarea></div>';
    }
    h += '</div>';
    corps.innerHTML = h;

    var boutons = '';
    if (d.aUneEtiquette) {
      boutons += '<button id="btn-apercu"><span class="ic">👁</span> Étiquette</button>';
      if (R.peutEcrire) boutons += '<button id="btn-renvoyer"><span class="ic">🔁</span> Renvoyer au client</button>';
    }
    /* ⚠ HORS DU BLOC CI-DESSUS, ET C EST TOUT L INTERET. Le recours sert quand
       le PDF local a disparu — s il etait range sous aUneEtiquette, le bouton
       s effacerait exactement dans le seul cas ou il est le dernier chemin.
       L envoi, lui, existe toujours chez Postes Canada : on redemande l imprime,
       on n en commande pas un second (ce qui serait FACTURE). */
    if (d.aUnEnvoiCP && R.peutEcrire) {
      boutons += '<button id="btn-reprendre" title="Redemande le PDF de l’envoi déjà créé chez Postes Canada. Aucun nouvel envoi n’est commandé, rien n’est facturé.">'
        + '<span class="ic">📥</span> ' + (d.aUneEtiquette ? 'Reprendre chez Postes Canada' : 'Reprendre l’étiquette') + '</button>';
    }
    if (R.peutEcrire && d.statut === 'in_transit') boutons += '<button id="btn-recu"><span class="ic">📬</span> Marquer reçu</button>';
    if (R.peutEcrire && !fige) boutons += '<button class="prim" id="btn-enr">Enregistrer + courriel</button>';
    else if (R.peutEcrire && !R.archive) boutons += '<button class="prim" id="btn-enr">Enregistrer les notes</button>';
    /* ⚠ SUPPRIMER : uniquement sur un dossier TERMINE (#6). C etait impossible
       depuis l application — un retour complete restait dans la liste pour
       toujours. Effacer une demande EN COURS ferait disparaitre un dossier que
       la cliente, elle, suit encore : le coeur du site le refuse aussi. */
    if (['completed', 'refunded'].indexOf(d.statut) >= 0 && !R.archive) {
      boutons += '<button class="danger" id="btn-suppr"><span class="ic">🗑</span> Supprimer</button>';
    }
    actions.innerHTML = boutons;
    brancherDemande(fige);
  }

  function dessinerTraitement(){
    var h = '<div class="carte"><h2>Décision inventaire <span class="note">— par article</span></h2>'
      + '<div class="aide">La remise en stock incrémente la VARIANTE (taille · couleur) reprise de la commande d’origine.</div>'
      + R.articles.map(function(a, i){
          var dec = DECISIONS[a.productId] || { backToStock: true, reason: '' };
          return '<div class="art"><div class="d"><div class="n">' + esc(a.nom) + '</div>'
            + '<div class="v">' + esc([a.taille, a.couleur].filter(Boolean).join(' · ') || '—') + ' · × ' + a.quantite + '</div></div>'
            + '<select data-inv="' + i + '">'
            + '<option value="1"' + (dec.backToStock ? ' selected' : '') + '><span class="ic">✅</span> Remettre en inventaire</option>'
            + '<option value="0"' + (dec.backToStock ? '' : ' selected') + '><span class="ic">❌</span> Ne pas remettre</option>'
            + '</select></div>'
            + '<div class="ch" data-raison-z="' + i + '" style="' + (dec.backToStock ? 'display:none;' : '') + 'margin:.25rem 0 .1rem">'
            + '<label>Raison (obligatoire)</label>'
            + '<input data-raison="' + i + '" value="' + esc(dec.reason) + '" placeholder="Ex : article endommagé, article porté…"></div>';
        }).join('')
      + '</div>';
    h += '<div class="carte"><h2>Réexpédition au client <span class="note">— échange ou renvoi</span></h2>'
      + '<div class="aide">La fenêtre Expédition fait ce travail — service, poids et confirmation avant de dépenser.</div>'
      + '<button class="mini" id="btn-reexp" style="margin-top:.45rem"><span class="ic">🚚</span> Ouvrir l’expédition de la commande</button>'
      + '</div>';
    corps.innerHTML = h;
    actions.innerHTML = '<button class="prim" id="btn-vers-reglement">Vers le règlement →</button>';
    brancherTraitement();
  }

  function dessinerReglement(){
    var rb = R.remboursement;
    var h = '';
    if (!rb) {
      h += '<div class="carte"><div class="vide">Suggestion de remboursement indisponible.</div></div>';
    } else {
      if (!MONTANTS) MONTANTS = rb.lignes.map(function(l){ return l.montant; });
      h += '<div class="carte"><h2><span class="ic">💰</span> Règlement <span class="note">— si « Remboursée »</span></h2>'
        + '<div class="avis ' + (rb.dansFenetre ? 'vert' : 'jaune') + '">'
        + (rb.dansFenetre
            ? '✅ ' + rb.joursOuvrables + ' jours ouvrables — dans la fenêtre de ' + rb.joursFenetre + ' : moyen original ou crédit, au choix.'
            : '⚠ ' + rb.joursOuvrables + ' jours ouvrables — hors fenêtre de ' + rb.joursFenetre + ' : crédit boutique uniquement.')
        + '</div>'
        + rb.lignes.map(function(l, i){
            return '<div class="ligne"><span>' + esc(l.nom)
              + (l.moitie ? ' <span style="color:#f0c987;font-size:.74rem">(2 pour 1 — 50 % suggéré, plein : ' + argent(l.base) + ')</span>' : '')
              + '</span><input type="number" step="0.01" min="0" data-mnt="' + i + '" value="' + (MONTANTS[i]).toFixed(2) + '"></div>'; }).join('')
        + '<label style="display:flex;align-items:center;gap:.4rem;font-size:.84rem;margin-top:.5rem;cursor:pointer'
        + (R.demande.fauteMarchande ? '' : ';opacity:.55') + '">'
        + '<input type="checkbox" id="g-livraison"' + (R.demande.fauteMarchande ? ' checked' : '') + '> '
        + 'Frais de livraison (' + argent(rb.livraisonBase) + ')' + (R.demande.fauteMarchande ? '' : ' — non suggéré (motif client)') + '</label>'
        + '<div class="aide">Traitement prioritaire (' + argent(rb.prioritaireExclu) + ') jamais remboursable — exclu. '
        + 'Les taxes sont recalculées par le site aux taux réels de la commande.</div>'
        + '<div class="r2" style="margin-top:.5rem">'
        + '<label style="display:flex;align-items:center;gap:.4rem;font-size:.84rem;cursor:pointer'
        + ((rb.dansFenetre && rb.squareDisponible) ? '' : ';opacity:.5') + '">'
        + '<input type="radio" name="g-methode" value="original"'
        + ((rb.dansFenetre && rb.squareDisponible) ? ((R.demande.preference !== 'credit') ? ' checked' : '') : ' disabled') + '> '
        + 'Moyen de paiement original' + (rb.squareDisponible ? '' : ' (aucun paiement Square lié)') + '</label>'
        + '<label style="display:flex;align-items:center;gap:.4rem;font-size:.84rem;cursor:pointer">'
        + '<input type="radio" name="g-methode" value="credit"'
        + ((rb.dansFenetre && rb.squareDisponible && R.demande.preference !== 'credit') ? '' : ' checked') + '> Crédit boutique</label>'
        + '</div>'
        + (R.demande.preference ? '<div class="avis bleu"><span class="ic">👤</span> Préférence du client : '
            + (R.demande.preference === 'credit' ? 'crédit boutique' : 'moyen original') + '</div>' : '')
        + '</div>';
    }
    h += '<div class="carte"><h2>Résolution finale</h2>'
      + '<select id="g-statut"><option value="refunded">Remboursée</option>'
      + '<option value="completed">Complétée (échange / crédit — aucun remboursement émis ici)</option></select>'
      + '<div class="jetons">' + (R.modeles || []).map(function(m, i){
          return '<button type="button" data-modele="' + i + '">' + esc(m) + '</button>'; }).join('') + '</div>'
      + '<div class="ch" style="margin-top:.45rem"><label for="g-note">Note pour le client (facultative)</label>'
      + '<textarea id="g-note" rows="3">' + esc(R.demande.notes) + '</textarea></div>'
      + '</div>';
    corps.innerHTML = h;
    actions.innerHTML = '<button class="paie" id="btn-finaliser"' + (R.peutEcrire ? '' : ' disabled') + '><span class="ic">✅</span> Finaliser le traitement</button>';
    brancherReglement();
  }

  // ══ ECOUTEURS ═════════════════════════════════════════════════════════════
  document.getElementById('pas').addEventListener('click', function(ev){
    var b = ev.target.closest('[data-et]');
    if (!b || b.disabled) return;
    ETAPE = parseInt(b.getAttribute('data-et'), 10) || 0;
    dessiner();
  });

  function brancherDemande(fige){
    var st = document.getElementById('r-statut');
    if (st) st.onchange = function(){
      var z = document.getElementById('z-refus'); if (z) z.style.display = this.value === 'rejected' ? '' : 'none';
      var e = document.getElementById('z-etiq'); if (e) e.style.display = this.value === 'approved' ? '' : 'none';
    };
    var enr = document.getElementById('btn-enr');
    if (enr) enr.onclick = function(){ enregistrer(fige); };
    var sp = document.getElementById('btn-suppr');
    if (sp) sp.onclick = flowSupprimer;
    var ap = document.getElementById('btn-apercu');
    if (ap) ap.onclick = apercu;
    var rv = document.getElementById('btn-renvoyer');
    if (rv) rv.onclick = renvoyer;
    var rp = document.getElementById('btn-reprendre');
    if (rp) rp.onclick = reprendre;
    var rc = document.getElementById('btn-recu');
    if (rc) rc.onclick = marquerRecu;
    var ro = document.getElementById('btn-rouvrir');
    if (ro) ro.onclick = function(){ litige('reopen'); };
    var rj = document.getElementById('btn-rejeter');
    if (rj) rj.onclick = function(){ litige('confirm'); };
  }

  function brancherTraitement(){
    corps.onchange = function(ev){
      var t = ev.target;
      var iv = t.getAttribute && t.getAttribute('data-inv');
      if (iv !== null && iv !== undefined) {
        var a = R.articles[parseInt(iv, 10)];
        if (!a) return;
        var d = DECISIONS[a.productId] || (DECISIONS[a.productId] = { backToStock: true, reason: '' });
        d.backToStock = t.value === '1';
        var z = corps.querySelector('[data-raison-z="' + iv + '"]');
        if (z) z.style.display = d.backToStock ? 'none' : '';
      }
    };
    corps.oninput = function(ev){
      var t = ev.target;
      var ir = t.getAttribute && t.getAttribute('data-raison');
      if (ir !== null && ir !== undefined) {
        var a = R.articles[parseInt(ir, 10)];
        if (a) (DECISIONS[a.productId] || (DECISIONS[a.productId] = { backToStock: false, reason: '' })).reason = t.value;
      }
    };
    var re = document.getElementById('btn-reexp');
    if (re) re.onclick = function(){
      // ⚠ L expedition s ouvre sur la COMMANDE D ORIGINE, pas sur le retour : on
      // passe par l operation des listes, qui connait deja le chemin (la coquille
      // ouvre la fenetre Expedition avec service, poids et confirmation).
      if (!R.demande.commandeId) { dire('Commande originale introuvable.', 'err'); return; }
      dire('Ouverture de l’expédition…');
      appeler('commandes:expedier', [R.demande.commandeId]).then(function(r){
        dire(r.ok ? 'Expédition ouverte dans sa fenêtre.' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
    var vg = document.getElementById('btn-vers-reglement');
    if (vg) vg.onclick = function(){ ETAPE = 2; dessiner(); };
  }

  function brancherReglement(){
    corps.oninput = function(ev){
      var t = ev.target;
      var im = t.getAttribute && t.getAttribute('data-mnt');
      if (im !== null && im !== undefined && MONTANTS) MONTANTS[parseInt(im, 10)] = parseFloat(t.value) || 0;
    };
    corps.onclick = function(ev){
      var b = ev.target.closest && ev.target.closest('[data-modele]');
      if (!b) return;
      var n = document.getElementById('g-note');
      var m2 = (R.modeles || [])[parseInt(b.getAttribute('data-modele'), 10)] || '';
      if (n) { n.value = n.value.trim() ? n.value.trim() + ' ' + m2 : m2; n.focus(); }
    };
    var f = document.getElementById('btn-finaliser');
    if (f) f.onclick = finaliser;
  }

  /* == LE BROUILLON D'UNE DEMANDE DE RETOUR =================================
     On y decide un statut, une raison de refus ecrite a la main, un transporteur,
     un service, un poids, et des notes internes. Ce n'est pas une heure de travail,
     mais la raison de refus et les notes sont du texte redige — et il y a une
     ETIQUETTE de transport au bout, donc de l'argent. Refaire la saisie parce
     qu'une fenetre s'est fermee est le genre de contrariete qui fait cliquer trop
     vite la fois suivante.
     ⚠ UNE CLE PAR DEMANDE : les demandes de retour se ressemblent (memes statuts,
     memes transporteurs). Sans la cle, la note d'une demande serait proposee sur la
     suivante, et l'on refuserait la mauvaise.
     ⚠ ET SEULEMENT CE QUI DIFFERE de ce qui est enregistre : on modifie une
     demande EXISTANTE. */
  var BR_CHAMPS = ['r-statut', 'r-refus', 'r-transp', 'r-service', 'r-poids', 'r-notes'];
  szBrouillonBrancher({
    portee: 'retour',
    libelle: 'Une modification de cette demande',
    ttlMin: 720,
    cle: function(){ return 'r:' + ID; },
    actif: function(){ return !!document.getElementById('r-notes'); },
    valeurs: function(){ return szBrouillonDuDom(BR_CHAMPS, ['r-generer']); },
    rempli: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, ['r-generer']); if (!v) return false;
      var d = (R && R.demande) || {};
      if (String(v['r-notes'] || '') !== String(d.notes || '')) return true;
      if (String(v['r-refus'] || '') !== String(d.noteRefus || '')) return true;
      if (String(v['r-statut'] || '') !== String(d.statut || '')) return true;
      return false;
    },
    remplir: function(v){ szBrouillonAuDom(v); },
  });
  szBrouillonEcouter();

  // ══ GESTES ════════════════════════════════════════════════════════════════
  function enregistrer(fige){
    if (enCours) return;
    enCours = true; dire('Enregistrement…', 'att');
    var saisie = fige
      ? { statut: '', notes: val('r-notes') }
      : { statut: val('r-statut'), notes: val('r-notes'), noteRefus: val('r-refus'),
          etiquette: { generer: coche('r-generer'), transporteur: val('r-transp'),
                       service: val('r-service'), poidsKg: parseFloat(val('r-poids')) || 0 } };
    appeler('retour:enregistrer', [ID, saisie]).then(function(r){
      enCours = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      var t = 'Demande mise à jour.';
      if (r.etiquetteErreur) t += ' ⚠ Étiquette : ' + r.etiquetteErreur;
      if (r.courriel) t += r.courriel.envoye ? ' Courriel envoyé.' : (r.courriel.erreur ? ' Courriel NON envoyé : ' + r.courriel.erreur : '');
      /* Le brouillon meurt a l'enregistrement REUSSI, pas avant. */
      szBrouillonJeter();
      dire(t, r.etiquetteErreur || (r.courriel && !r.courriel.envoye && r.courriel.erreur) ? 'att' : 'bon');
      recharger();
    });
  }

  function marquerRecu(){
    voile('<h3><span class="ic">📬</span> Réception du colis</h3><p>Confirmer la réception du colis de retour en entrepôt ?</p>'
      + '<div class="fin2"><button id="v-non">Annuler</button><button class="prim" id="v-oui">Confirmer</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){
          fermer(); dire('Réception…', 'att');
          appeler('retour:recu', [ID]).then(function(r){
            if (!r.ok) { dire(expliquer(r), 'err'); return; }
            dire('Retour marqué reçu.' + (r.courriel && r.courriel.envoye ? ' Courriel envoyé.' : ''), 'bon');
            recharger();
          });
        };
      });
  }

  function litige(action){
    dire('…');
    appeler('retour:litige', [ID, action]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire(action === 'reopen' ? 'Demande rouverte — marquée comme reçue.' : 'Rejet confirmé.', 'bon');
      recharger();
    });
  }

  function voilePdf(b64){
    voile('<h3><span class="ic">👁</span> Étiquette de retour</h3>'
      + '<iframe src="data:application/pdf;base64,' + b64 + '" '
      + 'style="width:100%;height:52vh;border:1px solid var(--v14);border-radius:8px;background:#3c3c3c"></iframe>'
      + '<div class="fin2"><button id="v-non">Fermer</button></div>',
      function(fermer){ document.getElementById('v-non').onclick = fermer; });
  }

  function apercu(){
    appeler('retour:pdf', [ID]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      voilePdf(r.pdf);
    });
  }

  /* LE RECOURS. ⚠ L etiquette est MONTREE tout de suite apres : sans cela, on ne
     saurait pas si ce qui vient d arriver est bien l imprime attendu, et le seul
     moyen de le verifier serait de recommencer. */
  function reprendre(){
    var b = document.getElementById('btn-reprendre');
    if (b) b.disabled = true;
    dire('Reprise de l’étiquette chez Postes Canada…', 'att');
    appeler('retour:reprendreEtiquette', [ID]).then(function(r){
      if (!r.ok) {
        if (b) b.disabled = false;
        dire(expliquer(r), 'err');
        return;
      }
      dire('Étiquette reprise — aucun nouvel envoi n’a été créé, rien n’a été facturé.', 'bon');
      // recharger redessine les boutons (« Étiquette » apparaît), le voile est
      // posé sur le body et survit au redessin.
      recharger();
      voilePdf(r.pdf);
    });
  }

  function renvoyer(){
    dire('Envoi…', 'att');
    appeler('retour:renvoyer', [ID]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire(r.courriel && r.courriel.envoye ? 'Étiquette renvoyée au client.'
        : 'Étiquette prête, mais courriel non envoyé' + (r.courriel && r.courriel.erreur ? ' : ' + r.courriel.erreur : '.'),
        r.courriel && r.courriel.envoye ? 'bon' : 'att');
    });
  }

  function finaliser(){
    if (enCours || !R.peutEcrire) return;
    var decisions = R.articles.map(function(a){
      var d = DECISIONS[a.productId] || { backToStock: true, reason: '' };
      return { productId: a.productId, backToStock: d.backToStock, reason: d.reason };
    });
    // Le refus de raison manquante se dit AVANT la confirmation d argent.
    for (var i = 0; i < decisions.length; i++) {
      if (!decisions[i].backToStock && !String(decisions[i].reason || '').trim()) {
        dire('Raison requise pour « ' + R.articles[i].nom + ' » (étape Traitement).', 'err');
        return;
      }
    }
    var statutFinal = val('g-statut') || 'completed';
    var montants = MONTANTS || [];
    var total = montants.reduce(function(s, v){ return s + (parseFloat(v) || 0); }, 0);
    var livraison = coche('g-livraison');
    if (livraison && R.remboursement) total += R.remboursement.livraisonBase;
    var methode = (document.querySelector('input[name="g-methode"]:checked') || {}).value || 'credit';

    /* ⚠ CONFIRMATION AVANT L ARGENT, montants sous les yeux — taxes en sus,
       recalculees par le site aux taux reels de la commande. */
    voile('<h3>' + (statutFinal === 'refunded' ? '<span class="ic">💳</span> Rembourser et clore ?' : '✅ Clore le dossier ?') + '</h3>'
      + (statutFinal === 'refunded'
          ? '<p>Articles : <strong>' + argent(montants.reduce(function(s,v){ return s+(parseFloat(v)||0); }, 0)) + '</strong>'
            + (livraison && R.remboursement ? ' + livraison <strong>' + argent(R.remboursement.livraisonBase) + '</strong>' : '')
            + ' <span style="color:var(--tx2)">(+ taxes aux taux réels)</span><br>'
            + 'Méthode : <strong>' + (methode === 'original' ? 'moyen de paiement original (Square)' : 'crédit boutique') + '</strong></p>'
            + '<p style="color:var(--tx-att)">Un remboursement ne s’annule pas d’un clic.</p>'
          : '<p>Aucun remboursement ne sera émis ici — le règlement s’est fait autrement (échange, crédit déjà émis…).</p>')
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="paie" id="v-oui">' + (statutFinal === 'refunded' ? 'Rembourser' : 'Clore') + '</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){
          fermer();
          enCours = true; dire('Règlement en cours…', 'att');
          appeler('retour:finaliser', [ID, {
            decisions: decisions, statutFinal: statutFinal,
            remboursement: { montants: montants, livraison: livraison, methode: methode },
            note: val('g-note'),
          }]).then(function(r){
            enCours = false;
            if (!r.ok) { dire(expliquer(r), 'err'); return; }
            var t = 'Retour traité.';
            if (r.credit) t += ' Crédit ' + r.credit.numero + ' (' + argent(r.credit.montant) + ') émis.';
            if (r.squareErreur) t += ' ⚠ Square a échoué : ' + r.squareErreur;
            if (r.nonRestockes && r.nonRestockes.length) t += ' ⚠ Non remis en stock : ' + r.nonRestockes.join(' ; ');
            if (r.courriel) t += r.courriel.envoye ? ' Courriel envoyé.' : '';
            dire(t, (r.squareErreur || (r.nonRestockes || []).length) ? 'att' : 'bon');
            ETAPE = 0;
            recharger();
          });
        };
      });
  }

  // ══ CHARGEMENT ════════════════════════════════════════════════════════════
  /* ⚠ L ETAPE D ARRIVEE SUIT LE STATUT — la lecon de la preparation, apprise le
     meme jour : un dossier RECU s ouvre sur le Traitement (c est le geste que
     l ecran du site propose : << Traiter ce retour >>), tout le reste sur la
     Demande. Reinventer un routage differerait des attentes posees ailleurs. */
  function etapePour(statut){ return statut === 'received' ? 1 : 0; }

  function recharger(){
    return appeler('retour:lire', [ID]).then(function(r){
      if (!r.ok) { vide('Retour indisponible', expliquer(r)); return; }
      R = r;
      ETAPE = etapePour(r.demande.statut);
      DECISIONS = {}; MONTANTS = null;
      document.getElementById('titre').textContent = 'Retour — ' + r.demande.commande;
      var pill = document.getElementById('pill');
      pill.style.display = '';
      pill.textContent = STATUTS[r.demande.statut] || r.demande.statut;
      if (!r.peutEcrire) sous.textContent = r.archive ? '🗄 Archivée' : '👁 Lecture seule';
      dessiner();
    });
  }

  var VERROU_PRIS = false;
  function prendreVerrou(){
    appeler('verrou:prendre', ['return_reqs', ID]).then(function(v){
      if (!v || !v.ok) return;
      VERROU_PRIS = !!v.obtenu;
      if (v.obtenu) { sous.textContent = v.horsLigne ? '🔓 hors ligne' : '🔒 Section verrouillée en modification par : ' + (v.par || 'vous'); return; }
      sous.textContent = '⚠ ouvert par ' + (v.parQui || 'quelqu’un d’autre');
      dire('Ce dossier est déjà ouvert ailleurs — lecture seule conseillée.', 'att');
    });
  }
  function rendreVerrou(){
    if (!VERROU_PRIS) return;
    VERROU_PRIS = false;
    try { P.appeler('verrou:rendre'); } catch (e) {}
  }
  window.addEventListener('beforeunload', function(){ rendreVerrou(); });

  /* ⚠ APPELE PAR LA COQUILLE quand le bouton du site rouvre une fenetre DEJA
     ouverte (ouvrirNative = restore + focus, rien de plus) : on RELIT le dossier
     plutot que de montrer l etat d avant — la lecon de la preparation. */
  window.szRevenir = function(){ recharger(); };

  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    if (apres) apres(fermer);
    return fermer;
  }

  /* ══ SUPPRIMER LA DEMANDE — IRREVERSIBLE, ET LA PREUVE PART AVEC (#6) ══════
     Ce geste n existait pas dans l application : un retour complete restait
     dans la liste pour toujours. L apercu vient du site : c est LUI qui juge
     si le dossier est supprimable, pas cette fenetre. */
  function flowSupprimer(){
    appeler('retour:supprimerApercu', [ID]).then(function(ap){
      if (!ap.ok) {
        dire(ap.motif === 'non_terminee'
          ? 'Seule une demande terminée peut être supprimée.' : expliquer(ap), 'err');
        return;
      }
      voile('<h3 style="color:var(--tx-err)"><span class="ic">🗑</span> Supprimer la demande</h3>'
        + '<p><strong>' + esc(ap.commande) + '</strong>'
        + (ap.client ? ' — ' + esc(ap.client) : '') + '</p>'
        + '<p>La demande disparaît de la liste'
        + (ap.aPhoto ? ', <strong>et la photo envoyée par le client est effacée du stockage</strong>' : '')
        + '.</p>'
        + '<p style="color:var(--tx-err);font-weight:600"><span class="ic">⚠</span> Cette action est irréversible.</p>'
        + '<div class="fin2"><button id="v-non">Annuler</button>'
        + '<button class="prim" id="v-oui" style="background:#dc2626;border-color:#dc2626;color:var(--tx-blanc)">'
        + 'Supprimer définitivement</button></div>',
        function(fermer){
          document.getElementById('v-non').onclick = fermer;
          document.getElementById('v-oui').onclick = function(){
            this.disabled = true;
            appeler('retour:supprimerEcrire', [ID]).then(function(r){
              fermer();
              if (!r.ok) { dire(expliquer(r), 'err'); return; }
              dire('Demande supprimée.', 'bon');
              // Le dossier n existe plus : rester dessus n aurait aucun sens.
              rendreVerrou();
              P.fermer();
            });
          };
        });
    });
  }

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && !document.querySelector('.voile')) { ev.preventDefault(); rendreVerrou(); P.fermer(); }
  });

  recharger().then(function(){ if (R) prendreVerrou(); });
})();
</script>
</body></html>`;
}

module.exports = { pageRetour };
