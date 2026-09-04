'use strict';

/*
 * FENÊTRE « REMBOURSEMENT » — NATIVE, UN SEUL ÉCRAN
 * =============================================================================
 * ⚠⚠ ELLE REMBOURSE — Square rend l'argent sur la carte du client, ou un crédit
 * boutique est émis. Les disciplines des écrans d'argent s'appliquent toutes :
 *   • AUCUN calcul ici : les totaux (taxes aux taux figés de la commande, frais
 *     Square proportionnels, net au client) viennent du site par
 *     remboursement:totaux à chaque changement — deux calculs d'argent
 *     finissent toujours par se contredire ;
 *   • les PRIX ne partent jamais de la fenêtre : elle n'envoie que des
 *     quantités, le site reprend les prix dans la commande et PLAFONNE au
 *     pas-encore-remboursé de chaque variante ;
 *   • confirmation qui répète les montants, bouton d'argent d'une autre
 *     couleur, et un garde anti-double-clic À NOUS — le garde central du site
 *     ne couvre pas les fenêtres natives ;
 *   • renoncer aux frais Square exige le NIP, demandé ici ET revérifié au cœur.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS — dixième rappel du projet.
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
.corps{flex:1 1 auto;min-height:0;padding:.75rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.55rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:11px;
  padding:.6rem .75rem;flex:0 0 auto}
.carte h2{margin:0 0 .45rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.09em;color:var(--tx2);font-weight:700}
.carte h2 .note{font-weight:400;text-transform:none;letter-spacing:0;color:var(--tx3)}
input,select,textarea{font:inherit;color:var(--tx);background:var(--f-0f1826);
  border:1px solid var(--v16);border-radius:8px;padding:.32rem .5rem;
  width:100%;min-width:0}
input:focus,select:focus,textarea:focus{outline:none;border-color:#c9a97e}
textarea{resize:none}
input[type=checkbox],input[type=radio]{width:auto}
button{font:inherit;cursor:pointer;border-radius:8px;padding:.32rem .7rem;
  border:1px solid var(--v16);background:var(--v05);
  color:var(--tx);transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:var(--v10);border-color:var(--v30)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
button.paie{background:#7c5cff;border-color:#7c5cff;color:var(--tx-sur-accent);font-weight:600}
button.paie:hover:not(:disabled){background:#8f74ff;border-color:#8f74ff}
.art{display:flex;align-items:center;gap:.6rem;padding:.35rem .45rem;border-radius:8px;
  background:var(--v03);border:1px solid var(--v05);margin-top:.3rem}
.art .d{flex:1 1 auto;min-width:0}
.art .n{font-size:.87rem;font-weight:600}
.art .v{font-size:.74rem;color:var(--tx2)}
.art input[type=number]{width:4.4rem;text-align:center}
.art .max{font-size:.68rem;color:var(--tx3);white-space:nowrap}
.tot .l{display:flex;justify-content:space-between;padding:.14rem 0;font-size:.85rem}
.tot .l.grand{font-size:1.02rem;font-weight:700;border-top:1px solid var(--v16);
  margin-top:.3rem;padding-top:.4rem}
.tot .l.frais{color:var(--tx-f6a5a5)}
.tot .l.net{color:var(--tx-ok);font-weight:700}
.avis{font-size:.78rem;line-height:1.45;border-radius:9px;padding:.45rem .7rem;margin-top:.4rem}
.avis.jaune{background:rgba(245,158,11,.11);border:1px solid rgba(245,158,11,.42);color:#f0c987}
.avis.vert{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.35);color:#86e5a8}
.aide{font-size:.73rem;color:var(--tx2);line-height:1.45}
.choix{display:flex;flex-direction:column;gap:.4rem;margin-top:.2rem}
.choix label{display:flex;align-items:flex-start;gap:.5rem;font-size:.85rem;cursor:pointer}
.choix .exp{display:block;font-size:.72rem;color:var(--tx2)}
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
.voile .boite{background:var(--f-carte);border:1px solid var(--v11);
  border-radius:13px;padding:1.1rem 1.25rem;max-width:32rem;width:100%}
.voile h3{margin:0 0 .55rem;font:700 1.05rem/1.25 Georgia,serif}
.voile p{margin:.35rem 0;font-size:.86rem}
.voile .fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.85rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Remboursement ». `id` = commande. */
function pageRemboursement(id) {
  const depart = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Remboursement — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.refunds}</span><h1 id="titre">Remboursement</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
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

  var ID = ${depart};
  var R = null;            // remboursement:lire
  var TOT = null;          // derniers totaux, rendus par le SITE
  /* ⚠ LA SAISIE VIT HORS DE L ECRAN — quantites par variante, choix, NIP valide. */
  var QTE = {};            // cle variante -> qty
  var NIP_OK = false;      // le NIP d exemption a ete accepte dans CETTE fenetre
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
  function cle(a){ return a.productId + '|' + a.taille + '|' + a.couleur; }

  var MOTIFS = {
    session: 'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit: 'Votre rôle ne permet pas de rembourser.',
    indisponible: 'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible: 'La fenêtre principale ne répond pas.',
    delai: 'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable: 'Cette commande n’existe plus.',
    verrou: 'Commande ouverte par quelqu’un d’autre.',
    motif_requis: 'Indiquez le motif du remboursement.',
    aucun_article: 'Sélectionnez au moins un article.',
    deja_remboursee: 'Commande déjà entièrement remboursée.',
    montant_invalide: 'Montant du remboursement invalide.',
    square_indisponible: 'Aucun paiement Square lié à cette commande.',
    nip_requis: 'Le code d’exemption est requis pour renoncer aux frais.',
    nip_incorrect: 'Code d’exemption incorrect.',
    echec: 'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    if (m === 'verrou') return MOTIFS.verrou + (r.parQui ? ' (' + r.parQui + ')' : '');
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
  function val(id2){ var e = document.getElementById(id2); return e ? e.value : ''; }
  function coche(id2){ var e = document.getElementById(id2); return !!(e && e.checked); }

  function saisie(){
    var articles = [];
    R.articles.forEach(function(a){
      var q = QTE[cle(a)] || 0;
      if (q > 0) articles.push({ productId: a.productId, taille: a.taille, couleur: a.couleur, qty: q });
    });
    var methode = (document.querySelector('input[name="m-type"]:checked') || {}).value || 'credit';
    var retenir = methode !== 'original' ? true : !NIP_OK;
    return { articles: articles, livraison: coche('m-livraison'), methode: methode,
      retenirFrais: retenir, motif: val('m-motif') };
  }

  // ══ DESSIN ════════════════════════════════════════════════════════════════
  function dessiner(){
    if (R.complet || !R.articles.length) {
      corps.innerHTML = '<div class="carte">' + (R.complet
        ? '<div class="avis vert" style="margin:0"><span class="ic">✅</span> Commande entièrement remboursée — total : '
          + argent(R.dejaRembourse) + '.</div>'
        : '<div class="avis jaune" style="margin:0">Tous les articles de cette commande ont déjà été remboursés.</div>')
        + '</div>';
      actions.innerHTML = '';
      return;
    }
    var h = '<div class="carte"><h2>Articles à rembourser <span class="note">— quantités plafonnées au pas-encore-remboursé</span></h2>'
      + R.articles.map(function(a, i){
          var q = QTE[cle(a)] || 0;
          return '<div class="art"><div class="d"><div class="n">' + esc(a.nom) + '</div>'
            + '<div class="v">' + esc([a.taille, a.couleur].filter(Boolean).join(' · ') || '—')
            + ' · ' + argent(a.prix) + ' / unité</div></div>'
            + '<input type="number" min="0" max="' + a.maxQty + '" value="' + q + '" data-q="' + i + '">'
            + '<span class="max">max ' + a.maxQty + '</span></div>';
        }).join('')
      + '</div>';

    if (R.livraison.cout > 0) {
      h += '<div class="carte"><h2>Livraison <span class="note">— ' + argent(R.livraison.cout)
        + (R.livraison.prioritaire ? ' · ⚡ prioritaire' : '') + '</span></h2>'
        + '<label style="display:flex;align-items:center;gap:.45rem;font-size:.85rem;cursor:pointer">'
        + '<input type="checkbox" id="m-livraison"> Inclure les frais de livraison</label>'
        + '<div class="aide" style="margin-top:.3rem">' + (R.livraison.nonExpediee
            ? 'La commande n’a pas encore été expédiée — frais remboursables.'
            : '⚠ Déjà expédiée : le transporteur a été payé. À votre discrétion (erreur, défaut, geste commercial).')
        + '</div></div>';
    }

    h += '<div class="carte"><h2>Mode de remboursement</h2><div class="choix">'
      + '<label><input type="radio" name="m-type" value="credit" checked>'
      + '<span><strong><span class="ic">💳</span> Crédit boutique</strong>'
      + '<span class="exp">Lié au compte du client, n’expire jamais, courriel envoyé automatiquement.</span></span></label>'
      + '<label style="' + (R.squareDisponible ? '' : 'opacity:.5;cursor:not-allowed') + '">'
      + '<input type="radio" name="m-type" value="original"' + (R.squareDisponible ? '' : ' disabled') + '>'
      + '<span><strong>↩ Moyen de paiement original</strong>'
      + '<span class="exp">' + (R.squareDisponible
          ? 'Sur la carte d’origine via Square — 5 à 7 jours ouvrables.'
          : 'Aucun paiement Square enregistré sur cette commande.') + '</span></span></label>'
      + '</div>'
      + (R.squareDisponible
        ? '<div id="z-frais" style="display:none;margin-top:.5rem;padding:.5rem .65rem;'
          + 'background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.3);border-radius:9px">'
          + '<div style="font-size:.83rem"><strong>Frais de service Square retenus</strong> — proportionnels ('
          + argent(R.frais.commande) + ' sur ' + argent(R.frais.baseHT) + ' HT). Square ne rembourse pas ses frais.</div>'
          + '<button class="mini" id="btn-nip" style="margin-top:.4rem;font-size:.75rem;padding:.14rem .5rem">'
          + '<span class="ic">🔐</span> Renoncer aux frais (rembourser au complet)</button>'
          + '<div id="z-nip-ok" style="display:none;font-size:.78rem;color:var(--tx-ok);margin-top:.3rem">'
          + '✓ Exemption accordée — les frais ne seront pas retenus.</div>'
          + '</div>' : '')
      + '</div>';

    h += '<div class="carte"><h2>Motif <span class="note">— obligatoire</span></h2>'
      // rows="3" (2026-08-21) : motif OBLIGATOIRE d'un remboursement — de l'argent
      // au bout, et c'est la piece qu'on relit si la cliente conteste.
      + '<textarea id="m-motif" rows="3" placeholder="Ex : article défectueux, mauvaise taille reçue, retour volontaire…"></textarea>'
      + '</div>';

    h += '<div class="carte tot" id="z-totaux"><h2>Totaux <span class="note">— calculés par le site</span></h2>'
      + '<div class="vide" style="padding:.6rem">Choisissez des articles…</div></div>';
    corps.innerHTML = h;

    actions.innerHTML = '<button class="paie" id="btn-rembourser" disabled>Confirmer le remboursement</button>';
    brancher();
  }

  function dessinerTotaux(){
    var z = document.getElementById('z-totaux');
    if (!z) return;
    if (!TOT || !TOT.nbArticles) {
      z.innerHTML = '<h2>Totaux <span class="note">— calculés par le site</span></h2>'
        + '<div class="vide" style="padding:.6rem">Choisissez des articles…</div>';
      majBouton();
      return;
    }
    var h = '<h2>Totaux <span class="note">— calculés par le site</span></h2>'
      + '<div class="l"><span>Sous-total (' + TOT.nbArticles + ' unité' + (TOT.nbArticles > 1 ? 's' : '') + ')</span><span>' + argent(TOT.sousTotal) + '</span></div>';
    if (TOT.livraison > 0) h += '<div class="l"><span>Livraison</span><span>' + argent(TOT.livraison) + '</span></div>';
    (TOT.taxes || []).forEach(function(t){
      h += '<div class="l"><span>' + esc(t.nom) + ' (' + (Math.round(t.taux * 1000000) / 10000) + ' %)</span><span>' + argent(t.montant) + '</span></div>';
    });
    h += '<div class="l grand"><span>Total brut</span><span>' + argent(TOT.total) + '</span></div>';
    if (TOT.retenu) {
      h += '<div class="l frais"><span>Frais Square retenus</span><span>−' + argent(TOT.frais) + '</span></div>'
        + '<div class="l net"><span>Net au client</span><span>' + argent(TOT.net) + '</span></div>';
    }
    z.innerHTML = h;
    majBouton();
  }

  function majBouton(){
    var b = document.getElementById('btn-rembourser');
    if (!b) return;
    var pret = !!(TOT && TOT.nbArticles && TOT.total > 0) && !enCours;
    b.disabled = !pret;
    b.textContent = enCours ? 'Remboursement…'
      : (pret ? 'Rembourser — ' + argent(TOT.retenu ? TOT.net : TOT.total) : 'Confirmer le remboursement');
  }

  var totT = null;
  function majTotaux(){
    clearTimeout(totT);
    totT = setTimeout(function(){
      appeler('remboursement:totaux', [ID, saisie()]).then(function(r){
        TOT = r.ok ? r : null;
        if (!r.ok) dire(expliquer(r), 'err'); else dire('');
        dessinerTotaux();
      });
    }, 160);
  }

  // ══ ECOUTEURS ═════════════════════════════════════════════════════════════
  function brancher(){
    corps.oninput = function(ev){
      var t = ev.target;
      var iq = t.getAttribute && t.getAttribute('data-q');
      if (iq !== null && iq !== undefined) {
        var a = R.articles[parseInt(iq, 10)];
        if (!a) return;
        var v = Math.min(Math.max(0, parseInt(t.value, 10) || 0), a.maxQty);
        QTE[cle(a)] = v;
        majTotaux();
        return;
      }
      if (t.id === 'm-motif') return; // le motif ne change pas les montants
    };
    corps.onchange = function(ev){
      var t = ev.target;
      if (t.name === 'm-type') {
        var z = document.getElementById('z-frais');
        if (z) z.style.display = t.value === 'original' ? '' : 'none';
        majTotaux();
        return;
      }
      if (t.id === 'm-livraison') { majTotaux(); }
    };
    var bn = document.getElementById('btn-nip');
    if (bn) bn.onclick = demanderNip;
    var br = document.getElementById('btn-rembourser');
    if (br) br.onclick = confirmer;
  }

  /* ⚠ LE NIP D EXEMPTION : demande ICI, mais c est le COEUR qui tranche — la
     fenetre ne connait jamais le code, elle transmet ce qui a ete tape et le
     site compare. Sans code configure, le coeur accorde l exemption librement. */
  var NIP_SAISI = '';
  function demanderNip(){
    if (!R.nipConfigure) {
      NIP_OK = true;
      apresNip();
      return;
    }
    voile('<h3><span class="ic">🔐</span> Code d’exemption</h3>'
      + '<p>Renoncer aux frais de service Square exige le code confidentiel.</p>'
      + '<input type="password" id="v-nip" autocomplete="off" '
      + 'style="letter-spacing:.14em;text-align:center;font-family:ui-monospace,monospace">'
      + '<div id="v-nip-err" style="display:none;font-size:.78rem;color:var(--tx-err);margin-top:.35rem">Code incorrect — réessayez.</div>'
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="prim" id="v-oui">Confirmer</button></div>',
      function(fermer){
        var champ = document.getElementById('v-nip');
        champ.focus();
        champ.onkeydown = function(ev){ if (ev.key === 'Enter') document.getElementById('v-oui').click(); };
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){
          // ⚠ C EST LE SITE QUI COMPARE (remboursement:nip) : le code configure
          // ne voyage jamais vers cette fenetre, seul le verdict revient. Et le
          // coeur REVERIFIERA a l ecriture — deux controles valent mieux qu un
          // sur un geste d argent.
          var essai = champ.value || '';
          appeler('remboursement:nip', [essai]).then(function(r){
            if (!r.ok) { dire(expliquer(r), 'err'); return; }
            if (!r.valide) {
              document.getElementById('v-nip-err').style.display = '';
              champ.value = ''; champ.focus();
              return;
            }
            NIP_SAISI = essai;
            NIP_OK = true;
            fermer();
            apresNip();
          });
        };
      });
  }
  function apresNip(){
    var ok = document.getElementById('z-nip-ok');
    if (ok) ok.style.display = '';
    var bn = document.getElementById('btn-nip');
    if (bn) bn.style.display = 'none';
    majTotaux();
  }

  function confirmer(){
    if (enCours || !TOT || !TOT.nbArticles) return;
    var s = saisie();
    if (!String(s.motif || '').trim()) { dire(MOTIFS.motif_requis, 'err'); return; }
    var enCredit = s.methode !== 'original';
    voile('<h3><span class="ic">💳</span> Confirmer le remboursement ?</h3>'
      + '<p>' + TOT.nbArticles + ' unité' + (TOT.nbArticles > 1 ? 's' : '')
      + (TOT.livraison > 0 ? ' + livraison' : '') + ' — total <strong>' + argent(TOT.total) + '</strong>'
      + (TOT.retenu ? ', net au client <strong>' + argent(TOT.net) + '</strong> (frais ' + argent(TOT.frais) + ' retenus)' : '')
      + '</p><p>Méthode : <strong>' + (enCredit ? 'crédit boutique (n’expire jamais)' : 'moyen de paiement original — Square') + '</strong></p>'
      + '<p style="color:var(--tx-att)">Un remboursement ne s’annule pas d’un clic.</p>'
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="paie" id="v-oui">Rembourser ' + argent(TOT.retenu ? TOT.net : TOT.total) + '</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){
          fermer();
          enCours = true; majBouton(); dire('Remboursement en cours…', 'att');
          s.nipFrais = s.retenirFrais ? '' : NIP_SAISI;
          appeler('remboursement:ecrire', [ID, s]).then(function(r){
            enCours = false;
            if (!r.ok) { majBouton(); dire(expliquer(r), 'err'); return; }
            var t = r.refundNumber + ' émis.';
            if (r.credit) t += ' Crédit ' + r.credit.numero + ' (' + argent(r.credit.montant) + '), courriel envoyé.';
            if (r.squareErreur) t += ' ⚠ Remboursement local créé mais Square a échoué : ' + r.squareErreur;
            else if (!r.credit) t += ' Square : ' + argent(r.net) + ' initié.';
            dire(t, r.squareErreur ? 'att' : 'bon');
            QTE = {}; TOT = null;
            recharger();
          });
        };
      });
  }

  // ══ CHARGEMENT ════════════════════════════════════════════════════════════
  function recharger(){
    return appeler('remboursement:lire', [ID]).then(function(r){
      if (!r.ok) { vide('Remboursement indisponible', expliquer(r)); return; }
      R = r;
      document.getElementById('titre').textContent = 'Remboursement — ' + r.numero;
      if (r.dejaRembourse > 0 && !r.complet) {
        sous.textContent = argent(r.dejaRembourse) + ' déjà remboursés';
      }
      dessiner();
    });
  }

  var VERROU_PRIS = false;
  function prendreVerrou(){
    appeler('verrou:prendre', ['orders', ID]).then(function(v){
      if (!v || !v.ok) return;
      VERROU_PRIS = !!v.obtenu;
      if (v.obtenu) { sous.textContent = (sous.textContent ? sous.textContent + ' · ' : '') + '🔒 Section verrouillée en modification par : ' + (v.par || 'vous'); return; }
      sous.textContent = '⚠ ouverte par ' + (v.parQui || 'quelqu’un d’autre');
      var b = document.getElementById('btn-rembourser');
      if (b) b.disabled = true;
      dire('Cette commande est ouverte ailleurs — remboursement bloqué.', 'err');
    });
  }
  function rendreVerrou(){
    if (!VERROU_PRIS) return;
    VERROU_PRIS = false;
    try { P.appeler('verrou:rendre'); } catch (e) {}
  }
  window.addEventListener('beforeunload', function(){ rendreVerrou(); });
  window.szRevenir = function(){ QTE = {}; TOT = null; NIP_OK = false; NIP_SAISI = ''; recharger(); };

  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    if (apres) apres(fermer);
    return fermer;
  }

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && !document.querySelector('.voile')) { ev.preventDefault(); rendreVerrou(); P.fermer(); }
  });

  recharger().then(function(){ if (R) prendreVerrou(); });
})();
</script>
</body></html>`;
}

module.exports = { pageRemboursement };
