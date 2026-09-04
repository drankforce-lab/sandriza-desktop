'use strict';

/*
 * FENÊTRE « EXPÉDIER UNE COMMANDE » — NATIVE
 * =============================================================================
 * ⚠⚠ CET ÉCRAN DÉPENSE DE L'ARGENT, et c'est ce qui le distingue de tous les
 * autres. Une étiquette de transporteur est FACTURÉE dès sa création — il n'y a
 * pas d'annulation d'un clic. Deux conséquences dans le dessin de cette fenêtre :
 *   • le service ET le poids sont visibles et modifiables AVANT le bouton, jamais
 *     devinés : `createCPLabel` lisait ces deux valeurs dans le formulaire du
 *     site, et appelée d'ici elle aurait commandé une étiquette au service par
 *     défaut et à 0,5 kg. Un colis de quatre kilos étiqueté pour cinq cents
 *     grammes, c'est un refus au comptoir ou une facture de rajustement ;
 *   • « une étiquette existe déjà » se dit AVANT le clic, pas après.
 *
 * ⚠ CRÉER UNE ÉTIQUETTE N'EXPÉDIE RIEN. C'est un second geste, après impression
 * réelle, qui marque la commande et prévient le client. Fusionner les deux
 * enverrait un courriel de suivi pour un colis encore posé sur la table.
 *
 * ⚠ ET ON N'INVENTE JAMAIS UN NUMÉRO DE SUIVI. Expédier sans numéro reste
 * possible (remise en main propre, cueillette, transporteur local) mais exige un
 * aveu explicite : un numéro fabriqué, la cliente le cherche chez le
 * transporteur, ne trouve rien, et écrit au service à la clientèle.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, et un accent grave égaré
 * referme la chaîne. C'est arrivé huit fois sur ce projet, dont trois le même
 * jour — et une fois en emportant la barre de menu entière.
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

.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.6rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}

.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:11px;
  padding:.65rem .8rem;flex:0 0 auto}
.carte h2{margin:0 0 .45rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.09em;color:var(--tx2);font-weight:700}
.carte h2 .note{font-weight:400;text-transform:none;letter-spacing:0;color:var(--tx3)}

input,select{font:inherit;color:var(--tx);background:var(--f-0f1826);
  border:1px solid var(--v16);border-radius:8px;padding:.34rem .5rem;
  width:100%;min-width:0}
input:focus,select:focus{outline:none;border-color:#c9a97e}

button{font:inherit;cursor:pointer;border-radius:8px;padding:.34rem .75rem;
  border:1px solid var(--v16);background:var(--v05);
  color:var(--tx);transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:var(--v10);border-color:var(--v30)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
button.prim:hover:not(:disabled){background:#d8bd97;border-color:#d8bd97}
/* ⚠ LE BOUTON QUI DEPENSE est d une AUTRE couleur que celui qui confirme : on ne
   doit jamais les confondre du coin de l oeil. */
button.paie{background:#7c5cff;border-color:#7c5cff;color:var(--tx-sur-accent);font-weight:600}
button.paie:hover:not(:disabled){background:#8f74ff;border-color:#8f74ff}
button.mini{padding:.14rem .5rem;font-size:.76rem}

.adresse{font-size:.86rem;line-height:1.5}
.adresse .nom{font-weight:600}
.adresse .det{color:var(--tx2)}

.r2{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.r3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem}
.ch{display:flex;flex-direction:column;gap:.2rem;min-width:0}
.ch label{font-size:.72rem;color:var(--tx2)}

.avis{font-size:.78rem;line-height:1.45;border-radius:9px;padding:.45rem .7rem;margin-top:.4rem}
.avis.jaune{background:rgba(245,158,11,.11);border:1px solid rgba(245,158,11,.42);color:#f0c987}
.avis.vert{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.35);color:#86e5a8}
.avis.rouge{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.38);color:var(--tx-f6a5a5)}
.aide{font-size:.73rem;color:var(--tx2);line-height:1.45}

/* Le pas-a-pas : cree, imprime, expedie. Il dit ce qui est FAIT. */
.pas{display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.5rem}
.pas span{font-size:.72rem;padding:.16rem .5rem;border-radius:99px;
  border:1px solid var(--v16);color:var(--tx2)}
.pas span.fait{border-color:rgba(74,222,128,.45);color:var(--tx-ok)}
.pas span.on{border-color:#c9a97e;color:var(--tx-creme);background:rgba(201,169,126,.14)}

.lignes{display:flex;flex-direction:column;gap:.28rem}
.lg{display:flex;align-items:center;gap:.6rem;padding:.28rem .4rem;border-radius:7px;
  cursor:pointer;font-size:.85rem;border-top:1px solid var(--v05)}
.lg:first-child{border-top:0}
.lg:hover{background:var(--v055)}
.lg .principal{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lg .fin{flex:0 0 auto;font-size:.78rem;color:var(--tx2);white-space:nowrap}

.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid var(--v08);
  background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
.actions{flex:0 0 auto;display:flex;gap:.4rem}
.vide{padding:1.5rem 1rem;text-align:center;color:var(--tx2);font-size:.86rem}

.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.5rem;z-index:50}
.voile .boite{background:var(--f-carte);border:1px solid var(--v11);
  border-radius:13px;padding:1.1rem 1.25rem;max-width:34rem;width:100%;
  max-height:80vh;overflow-y:auto}
.voile h3{margin:0 0 .55rem;font:700 1.05rem/1.25 Georgia,serif}
.voile p{margin:.35rem 0;font-size:.86rem}
.voile .fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.85rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Expédier une commande ». */
function pageExpedition(id) {
  const depart = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Expédier une commande — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.shipping}</span><h1 id="titre">Expédier une commande</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions" id="actions"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var actions = document.getElementById('actions');
  var sous = document.getElementById('sous');

  var CTX = null;        // transporteurs, services, droit d expedier
  var CMD = null;        // { commande, destinataire, poids }
  var TRANSPORTEUR = '';
  var PDF = null;        // etiquette en base64, gardee pour imprimer sans repasser par le nuage
  var enCours = false;
  var aveuSansSuivi = false;   // second geste avant d expedier sans numero

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne permet pas d’expédier une commande.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'Le transporteur n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette commande n’existe plus.',
    verrou:             'Commande ouverte par quelqu’un d’autre.',
    suivi_requis:       'Un numéro de suivi est requis — ou confirmez l’envoi sans numéro.',
    poids_invalide:     'Le poids du colis doit être supérieur à zéro.',
    deja_etiquetee:     'Une étiquette existe déjà pour cette commande — rien n’a été commandé.',
    secrets:            'Identifiants du transporteur indisponibles. Reconnectez-vous, puis réessayez.',
    config:             'Configuration du transporteur incomplète.',
    origine:            'Adresse d’expédition incomplète — Configuration puis Transporteurs.',
    destination:        'Adresse du destinataire incomplète dans la commande.',
    refus_transporteur: 'Le transporteur a refusé la demande.',
    etiquette_absente:  'Aucune étiquette enregistrée pour cette commande.',
    impression:         'L’impression a échoué.',
    reseau:             'Le réseau a échoué — rien n’a été commandé.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    if (m === 'verrou') return MOTIFS.verrou + (r.parQui ? ' (' + r.parQui + ')' : '');
    // ⚠ LE DETAIL DU TRANSPORTEUR EST CONSERVE TEL QUEL : les codes AA de Postes
    // Canada designent TOUJOURS les identifiants, jamais l etiquette, et le site
    // le dit deja en clair. Le remplacer par une phrase generique ferait chercher
    // la panne du mauvais cote pendant des heures.
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
  }

  function transporteurCourant(){
    var l = (CTX && CTX.transporteurs) || [];
    for (var i = 0; i < l.length; i++) if (l[i].cle === TRANSPORTEUR) return l[i];
    return null;
  }

  // ══ DESSIN ════════════════════════════════════════════════════════════════
  function dessiner(){
    var c = CMD.commande, d = CMD.destinataire, pw = CMD.poids;
    var t = transporteurCourant();
    var expediee = c.statut === 'shipped' || c.statut === 'delivered';

    var h = '';

    // Pas-a-pas : ce qui est fait, ce qui reste.
    h += '<div class="pas">'
      + '<span class="' + (c.aUneEtiquette ? 'fait' : 'on') + '">1 · Étiquette'
      + (c.aUneEtiquette ? ' ✓' : '') + '</span>'
      + '<span class="' + (c.aUneEtiquette && !expediee ? 'on' : (expediee ? 'fait' : '')) + '">2 · Impression</span>'
      + '<span class="' + (expediee ? 'fait' : '') + '">3 · Expédiée' + (expediee ? ' ✓' : '') + '</span>'
      + '</div>';

    h += '<div class="carte"><h2>Commande <span class="note">— ' + esc(c.numero)
      + ' · ' + c.articles + ' article' + (c.articles > 1 ? 's' : '') + '</span></h2>'
      + '<div class="adresse"><div class="nom">' + esc(d.nom || 'Destinataire') + '</div>'
      + '<div class="det">' + esc(d.rue) + '<br>' + esc(d.ville) + ', ' + esc(d.province)
      + ' ' + esc(d.codePostal) + (d.tel ? ' · ' + esc(d.tel) : '') + '</div></div>';
    if (!d.codePostal) {
      h += '<div class="avis rouge"><span class="ic">⚠</span> Aucun code postal sur cette commande — aucun transporteur '
        + 'n’acceptera l’envoi. Corrigez l’adresse avant de commander une étiquette.</div>';
    }
    h += '</div>';

    // ── Etiquette ───────────────────────────────────────────────────────────
    h += '<div class="carte"><h2>Étiquette</h2>';
    if (c.aUneEtiquette) {
      // ⚠ ON LE DIT AVANT LE CLIC. Une etiquette est facturee : mieux vaut le
      // savoir en regardant l ecran qu apres avoir presse le bouton.
      h += '<div class="avis jaune"><span class="ic">⚠</span> Une étiquette a déjà été créée pour cette commande'
        + (c.suivi ? ' (suivi <strong>' + esc(c.suivi) + '</strong>)' : '')
        + '. En commander une seconde serait <strong>facturé une seconde fois</strong>.</div>';
    }
    h += '<div class="r3" style="margin-top:.45rem">'
      + '<div class="ch"><label for="e-transporteur">Transporteur</label>'
      +   '<select id="e-transporteur">'
      +   ((CTX && CTX.transporteurs) || []).map(function(x){
            return '<option value="' + esc(x.cle) + '"' + (x.cle === TRANSPORTEUR ? ' selected' : '')
              + '>' + esc(x.nom) + (x.pret ? '' : ' — non configuré') + '</option>'; }).join('')
      +   '</select></div>'
      + '<div class="ch"><label for="e-service">Service</label>'
      +   '<select id="e-service"' + (t && t.pret && t.services.length ? '' : ' disabled') + '>'
      +   ((t && t.services) || []).map(function(s){
            return '<option value="' + esc(s.cle) + '">' + esc(s.libelle) + '</option>'; }).join('')
      +   ((t && t.services.length) ? '' : '<option value="">—</option>')
      +   '</select></div>'
      // ⚠ LE POIDS EST MODIFIABLE, ET PRE-REMPLI PAR LE CALCUL : c est lui qui
      // decide du prix. Le figer serait aussi faux que le deviner.
      + '<div class="ch"><label for="e-poids">Poids du colis (kg)</label>'
      +   '<input id="e-poids" type="number" min="0.001" step="0.001" value="'
      +   esc(pw.calcule > 0 ? pw.calcule : 0.5) + '"></div>'
      + '</div>';
    h += pw.estime
      ? '<div class="avis jaune"><span class="ic">⚠</span> Certains articles n’ont pas de poids configuré — estimation à '
        + '300 g par article. Vérifiez avant de commander : c’est le poids qui fixe le prix.</div>'
      : '<div class="avis vert"><span class="ic">✅</span> Poids calculé depuis les articles de la commande'
        + (pw.remboursements ? ' (remboursements déduits)' : '') + '.</div>';
    if (t && !t.pret) {
      h += '<div class="avis jaune"><span class="ic">💡</span> ' + esc(t.nom) + ' n’est pas configuré — aucune étiquette '
        + 'réelle n’est possible. Configuration puis Transporteurs dans la fenêtre principale.</div>';
    }
    h += '</div>';

    // ── Expedition ──────────────────────────────────────────────────────────
    h += '<div class="carte"><h2>Marquer expédiée</h2>'
      + '<div class="r2">'
      + '<div class="ch"><label for="e-suivi">Numéro de suivi</label>'
      +   '<input id="e-suivi" autocomplete="off" value="' + esc(c.suivi || '')
      +   '" placeholder="Rempli tout seul par l’étiquette"></div>'
      + '<div class="ch"><label>&nbsp;</label>'
      +   '<button id="btn-expedier"' + (expediee ? ' disabled' : '') + '>'
      +   (expediee ? '✓ Déjà expédiée' : '✓ Marquer expédiée') + '</button></div>'
      + '</div>'
      + '<div class="aide" style="margin-top:.4rem">Créer l’étiquette n’expédie pas : '
      + 'c’est ce bouton qui marque la commande et envoie le courriel de suivi au client.</div>'
      + '</div>';
    corps.innerHTML = h;

    var pret = !!(t && t.pret) && !!CTX.peutExpedier && !expediee;
    actions.innerHTML =
        '<button id="btn-apercu"' + (c.aUneEtiquette ? '' : ' disabled') + '><span class="ic">👁</span> Aperçu</button>'
      + '<button id="btn-imprimer"' + (c.aUneEtiquette ? '' : ' disabled') + '><span class="ic">🖨</span> Étiquette + bordereau</button>'
      + '<button id="btn-bordereau"><span class="ic">🧾</span> Bordereau seul</button>'
      + '<button class="paie" id="btn-etiquette"' + (pret ? '' : ' disabled') + '>'
      + (c.aUneEtiquette ? '<span class="ic">💳</span> Créer une AUTRE étiquette' : '<span class="ic">💳</span> Créer l’étiquette') + '</button>';
    brancher();
  }

  // ══ ECOUTEURS ═════════════════════════════════════════════════════════════
  function brancher(){
    var tr = document.getElementById('e-transporteur');
    if (tr) tr.onchange = function(){ TRANSPORTEUR = this.value; dessiner(); };
    var su = document.getElementById('e-suivi');
    // Retaper le numero annule l aveu : on ne veut pas expedier sans numero
    // alors que la personne vient d en saisir un.
    if (su) su.oninput = function(){ aveuSansSuivi = false; majBoutonExpedier(); };
    var be = document.getElementById('btn-etiquette');
    if (be) be.onclick = commanderEtiquette;
    var bx = document.getElementById('btn-expedier');
    if (bx) bx.onclick = expedier;
    var ba = document.getElementById('btn-apercu');
    if (ba) ba.onclick = apercu;
    var bi = document.getElementById('btn-imprimer');
    if (bi) bi.onclick = function(){ imprimer(); };
    var bb = document.getElementById('btn-bordereau');
    if (bb) bb.onclick = function(){
      dire('Impression du bordereau…');
      appeler('expedition:bordereau', [CMD.commande.id]).then(function(r){
        dire(r.ok ? 'Bordereau envoyé à l’impression.' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
  }

  function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }

  function majBoutonExpedier(){
    var b = document.getElementById('btn-expedier');
    if (!b) return;
    b.textContent = aveuSansSuivi ? '✓ Expédier SANS numéro' : '✓ Marquer expédiée';
  }

  // ══ ETIQUETTE — LE GESTE QUI COUTE ════════════════════════════════════════
  function commanderEtiquette(){
    if (enCours) return;
    var t = transporteurCourant();
    var poids = parseFloat(val('e-poids'));
    if (!(poids > 0)) { dire(MOTIFS.poids_invalide, 'err'); return; }
    var service = val('e-service');
    var libelle = '';
    ((t && t.services) || []).forEach(function(s){ if (s.cle === service) libelle = s.libelle; });

    /* ⚠ CONFIRMATION AVANT DE DEPENSER, avec les trois valeurs sous les yeux.
       Ce n est pas de la politesse : le service et le poids sont exactement ce
       que l ancienne version allait chercher dans un formulaire absent. Les
       relire ici, en toutes lettres, est la derniere occasion de voir qu on
       s apprete a etiqueter quatre kilos pour cinq cents grammes. */
    voile('<h3><span class="ic">💳</span> Commander l’étiquette ?</h3>'
      + '<p>Une étiquette est <strong>facturée dès sa création</strong> et ne s’annule pas.</p>'
      + '<p>Transporteur : <strong>' + esc(t ? t.nom : TRANSPORTEUR) + '</strong><br>'
      + 'Service : <strong>' + esc(libelle || service || '—') + '</strong><br>'
      + 'Poids : <strong>' + esc(poids) + ' kg</strong></p>'
      + (CMD.commande.aUneEtiquette
          ? '<p style="color:var(--tx-att)"><span class="ic">⚠</span> Une étiquette existe déjà pour cette commande. '
            + 'En commander une seconde sera facturé une seconde fois.</p>' : '')
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="paie" id="v-oui">Commander</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){
          fermer();
          lancerEtiquette(service, poids);
        };
      });
  }

  function lancerEtiquette(service, poids){
    enCours = true;
    var b = document.getElementById('btn-etiquette');
    if (b) { b.disabled = true; b.textContent = '⏳ Création… (jusqu’à 35 s)'; }
    dire('Demande au transporteur…', 'att');
    appeler('expedition:etiquette', [CMD.commande.id, TRANSPORTEUR, service, poids]).then(function(r){
      enCours = false;
      if (!r.ok) {
        if (b) { b.disabled = false; b.textContent = '💳 Créer l’étiquette'; }
        dire(expliquer(r), 'err');
        return;
      }
      PDF = r.pdf || null;
      dire('Étiquette créée — suivi ' + (r.suivi || '?') + '.', 'bon');
      // ⚠ ON RELIT LA COMMANDE plutot que de rafistoler l etat en memoire : le
      // suivi, l historique et le drapeau d etiquette viennent du site.
      recharger().then(function(){
        voile('<h3><span class="ic">✅</span> Étiquette créée</h3>'
          + '<p>Suivi : <strong>' + esc(r.suivi || '—') + '</strong></p>'
          + '<p>Imprimez-la, puis revenez confirmer l’expédition. '
          + '<strong>La commande n’est pas encore marquée expédiée</strong> — fermer cette '
          + 'fenêtre est sans risque, vous pourrez y revenir.</p>'
          + '<div class="fin2"><button id="v-non">Plus tard</button>'
          + '<button class="prim" id="v-oui"><span class="ic">🖨</span> Imprimer maintenant</button></div>',
          function(fermer){
            document.getElementById('v-non').onclick = fermer;
            document.getElementById('v-oui').onclick = function(){ fermer(); imprimer(); };
          });
      });
    });
  }

  // ══ IMPRESSION ET APERCU ══════════════════════════════════════════════════
  function imprimer(){
    dire('Impression de l’étiquette et du bordereau…');
    appeler('expedition:imprimer', [CMD.commande.id, PDF]).then(function(r){
      dire(r.ok ? 'Étiquette et bordereau envoyés à l’impression.' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  }

  /* ⚠ L APERCU PASSE PAR LE PONT, JAMAIS PAR UN FETCH DIRECT. L etiquette vit
     dans R2, qui ne repond pas aux requetes de cette fenetre (aucun CORS) : un
     appel direct echouerait, et un await non rattrape dans un onclick fait un
     bouton MORT, sans message. Le site relaie et rend le PDF en base64. */
  function apercu(){
    var b = document.getElementById('btn-apercu');
    if (b) b.disabled = true;
    dire('Lecture de l’étiquette…');
    appeler('expedition:pdf', [CMD.commande.id]).then(function(r){
      if (b) b.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      PDF = r.pdf;
      dire('');
      voile('<h3><span class="ic">👁</span> Étiquette — ' + esc(CMD.commande.numero) + '</h3>'
        + '<p>Suivi : <strong>' + esc(CMD.commande.suivi || '—') + '</strong></p>'
        + '<iframe src="data:application/pdf;base64,' + r.pdf + '" '
        + 'style="width:100%;height:52vh;border:1px solid var(--v16);border-radius:8px;background:#3c3c3c"></iframe>'
        + '<div class="fin2"><button id="v-non">Fermer</button>'
        + '<button class="prim" id="v-oui"><span class="ic">🖨</span> Imprimer</button></div>',
        function(fermer){
          document.getElementById('v-non').onclick = fermer;
          document.getElementById('v-oui').onclick = function(){ fermer(); imprimer(); };
        });
    });
  }

  // ══ EXPEDIER ══════════════════════════════════════════════════════════════
  function expedier(){
    if (enCours) return;
    var suivi = val('e-suivi').trim();
    /* ⚠ LE DOUBLE GESTE, ET IL N EST PAS DECORATIF. Sans numero, le site refuse
       (motif suivi_requis) tant qu on n a pas explicitement assume : c est ce qui
       remplace le faux numero d autrefois, que la cliente cherchait en vain chez
       le transporteur avant d ecrire au service a la clientele. */
    if (!suivi && !aveuSansSuivi) {
      aveuSansSuivi = true;
      majBoutonExpedier();
      dire('Aucun numéro de suivi : le client recevra un courriel SANS lien de suivi. '
         + 'Recliquez pour confirmer, ou collez le numéro du transporteur.', 'att');
      return;
    }
    enCours = true;
    var b = document.getElementById('btn-expedier');
    if (b) { b.disabled = true; b.textContent = 'Enregistrement…'; }
    appeler('expedition:confirmer', [CMD.commande.id,
      { carrier: TRANSPORTEUR, tracking: suivi, sansNumero: !suivi }]).then(function(r){
      enCours = false;
      aveuSansSuivi = false;
      if (!r.ok) {
        if (b) { b.disabled = false; }
        majBoutonExpedier();
        dire(expliquer(r), 'err');
        return;
      }
      dire('Commande ' + (r.numero || '') + ' expédiée — courriel envoyé.', 'bon');
      recharger();
    });
  }

  // ══ CHARGEMENT ════════════════════════════════════════════════════════════
  function recharger(){
    return appeler('expedition:lire', [CMD.commande.id]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      CMD = r;
      dessiner();
    });
  }

  function charger(depart){
    appeler('expedition:contexte').then(function(c){
      if (!c || !c.ok) { vide('Expédition indisponible', expliquer(c)); return; }
      CTX = c;
      TRANSPORTEUR = c.dernier || 'postes-canada';
      sous.textContent = c.peutExpedier ? '' : '👁 Lecture seule';
      if (!depart) { vide('Aucune commande', 'Ouvrez une commande depuis l’écran Expéditions.'); return; }
      return appeler('expedition:lire', [depart]).then(function(r){
        if (!r.ok) { vide('Commande indisponible', expliquer(r)); return; }
        CMD = r;
        // Le transporteur DEJA choisi sur la commande gagne sur le dernier utilise :
        // une etiquette FedEx deja creee ne doit pas se poursuivre en Postes Canada.
        if (r.commande.transporteur) TRANSPORTEUR = r.commande.transporteur;
        document.getElementById('titre').textContent = 'Expédier ' + r.commande.numero;
        dessiner();
        prendreVerrou(depart);
      });
    });
  }

  var VERROU_PRIS = false;
  function prendreVerrou(cid){
    appeler('verrou:prendre', ['orders', cid]).then(function(v){
      if (!v || !v.ok) { return; }
      VERROU_PRIS = !!v.obtenu;
      if (v.obtenu) { sous.textContent = v.horsLigne ? '🔓 hors ligne' : '🔒 Section verrouillée en modification par : ' + (v.par || 'vous'); return; }
      sous.textContent = '⚠ ouverte par ' + (v.parQui || 'quelqu’un d’autre');
      ['btn-etiquette', 'btn-expedier'].forEach(function(k){
        var b = document.getElementById(k); if (b) b.disabled = true;
      });
      dire('Expédition bloquée : cette commande est ouverte ailleurs.', 'err');
    });
  }
  function rendreVerrou(){
    if (!VERROU_PRIS) return;
    VERROU_PRIS = false;
    appeler('verrou:rendre');
  }

  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    if (apres) apres(fermer);
    return fermer;
  }

  function quitter(){ rendreVerrou(); P.fermer(); }

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && !document.querySelector('.voile')) { ev.preventDefault(); quitter(); }
  });
  window.addEventListener('beforeunload', function(){ rendreVerrou(); });

  charger(${depart});
})();
</script>
</body></html>`;
}

module.exports = { pageExpedition };
