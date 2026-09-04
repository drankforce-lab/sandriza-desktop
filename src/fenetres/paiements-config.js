'use strict';

/*
 * FENÊTRE « CONFIGURATION DES PAIEMENTS » — NATIVE (Configuration, palier 5)
 * =============================================================================
 * Les identifiants Square, le choix de l'environnement, et les modes de paiement
 * offerts à la caisse.
 *
 * ⚠⚠ LE JETON D'ACCÈS N'ARRIVE JAMAIS ICI. Le cœur ne rend que son EXISTENCE et
 * ses quatre derniers caractères. Conséquence directe, et elle est visible à
 * l'écran : un champ « jeton » laissé VIDE veut dire « garde celui qui est
 * enregistré », jamais « efface-le ». Sans cette règle, ouvrir la fenêtre et
 * changer une option effacerait le jeton de production.
 *
 * ⚠ AUCUNE RÈGLE ICI. Le refus d'un environnement incomplet (jeton, application
 * et emplacement) vit au cœur : c'est lui qui empêche des paiements de test de
 * partir vers l'emplacement réel de la boutique.
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
.tete .env{font-size:.72rem;margin-left:auto;border-radius:99px;padding:.12rem .6rem;font-weight:700}
.tete .env.prod{background:rgba(248,113,113,.16);color:var(--tx-err2);border:1px solid rgba(248,113,113,.45)}
.tete .env.bac{background:rgba(250,204,21,.14);color:var(--tx-jaune);border:1px solid rgba(250,204,21,.4)}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;
  padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:1rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
/* ⚠ LES CARTES D UNE MEME RANGEE SE TERMINENT A LA MEME HAUTEUR (2026-08-10,
   capture a l appui). Avec << align-items:start >>, chacune prenait sa hauteur
   naturelle et la rangee finissait en escalier. On laisse donc l etirement par
   defaut, et les contenus restent en haut de leur carte. */
.rangee{display:grid;grid-template-columns:repeat(auto-fit,minmax(28rem,1fr));gap:1rem}
.carte{background:#16202f;border:1px solid var(--v08);border-radius:11px;
  padding:1rem 1.1rem;min-width:0}
.carte h2{margin:0 0 .2rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
.carte .sous{margin:0 0 .9rem;font-size:.78rem;color:var(--tx3)}
.ch{margin:0 0 .8rem}
.ch label{display:block;margin-bottom:.25rem;font-size:.78rem;color:var(--tx2)}
.ch .aide{font-size:.72rem;color:var(--tx3);margin-top:.2rem}
.ch input{width:100%;font:inherit;font-family:ui-monospace,Consolas,monospace;font-size:.84rem;
  color:var(--tx);background:#0f1724;border:1px solid #2b3444;border-radius:8px;padding:.42rem .55rem}
.ch input:focus{outline:none;border-color:#c9a97e}
.ch input:disabled{opacity:.55}
.modes{display:flex;gap:1.2rem;margin:0 0 .9rem;flex-wrap:wrap}
.modes label{display:flex;align-items:center;gap:.4rem;font-size:.84rem;cursor:pointer;
  -webkit-user-select:none;user-select:none}
.modes input{accent-color:#c9a97e;cursor:pointer}
.bascule{display:flex;align-items:flex-start;gap:.6rem;font-size:.85rem;cursor:pointer;
  margin:0 0 .7rem;-webkit-user-select:none;user-select:none}
.bascule input{width:1.05rem;height:1.05rem;accent-color:#c9a97e;cursor:pointer;margin-top:.15rem;flex:0 0 auto}
.bascule .d{font-size:.76rem;color:var(--tx3);display:block;margin-top:.1rem}
.note{border-radius:9px;padding:.5rem .7rem;font-size:.78rem;margin:0 0 .8rem;
  border:1px solid rgba(120,160,220,.28);background:rgba(80,120,190,.1);color:#bcd2f0}
.note.garde{border-color:rgba(240,180,80,.35);background:rgba(200,140,40,.1);color:var(--tx-or2)}
.jeton{font-size:.76rem;color:var(--tx2);margin-top:.2rem}
.jeton b{color:var(--tx-ok)}
.jeton.non b{color:var(--tx-jaune)}
.tarifs{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:.6rem}
.tarif{background:#111a29;border:1px solid var(--v08);border-radius:9px;padding:.55rem .7rem}
.tarif .t{font-size:.76rem;font-weight:700}
.tarif .r{font-size:.95rem;font-weight:700;color:var(--tx-or);margin:.1rem 0}
.tarif .n{font-size:.7rem;color:var(--tx3)}
.res{font-size:.8rem;margin-top:.6rem;line-height:1.6}
.res.bon{color:var(--tx-ok)}.res.err{color:var(--tx-err)}.res.att{color:var(--tx-jaune)}
.res .id{font-family:ui-monospace,Consolas,monospace;font-size:.74rem;color:var(--tx2)}
.gestes{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.9rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:#0b1220}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.4rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v11)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
.vide{padding:1rem .6rem;text-align:center;color:var(--tx2);font-size:.82rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pagePaiementsConfig() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Configuration des paiements — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.payments}</span><h1>Configuration des paiements</h1>
  <span class="env" id="env" hidden></span></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter les réglages, pas les modifier.</div>
<div class="corps" id="corps"><div class="carte"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button id="b-tester">Tester la connexion</button>
  <button class="prim" id="b-save" disabled>Enregistrer les identifiants</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  /* ── MODE ANCRE ── le meme bouton d'ancrage/detachement que les autres ecrans.
     La coquille appelle szModeAncre(true) quand la vue est ANCREE, (false) quand
     elle est DETACHEE ; on montre le bon libelle et on route vers le pont. */
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
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
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
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var envEl = document.getElementById('env');
  var bsave = document.getElementById('b-save');
  var btest = document.getElementById('b-tester');
  var D = null, RO = false, OCCUPE = false;
  // Le mode AFFICHE, qui n est pas encore le mode ENREGISTRE : il ne le devient
  // qu a << Enregistrer >>. Basculer une case ne doit pas activer la production.
  var MODE = 'sandbox';
  var TEST = null;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux paiements.',
    lecture_seule:      'Votre rôle est en lecture seule : les paiements ne peuvent pas être modifiés.',
    sans_jeton:         'Entrez d’abord un jeton d’accès, puis enregistrez.',
    api:                'Square a refusé la connexion.',
    rien_a_ecrire:      'Aucun changement à enregistrer.',
    indisponible:       'Le module de paiement n’est pas prêt dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    nuage:              'L’enregistrement dans le nuage a échoué. Réessayez.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    if (m === 'incomplet') return r.message || 'Environnement incomplet.';
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

  var TARIFS = [
    ['En ligne (carte)', '2,8 % + 0,30 $', 'Par transaction web'],
    ['En personne (lecteur)', '2,65 %', 'Glissement, puce, sans contact'],
    ['Saisie manuelle', '3,5 % + 0,15 $', 'Numéro entré à la main'],
    ['Virement ACH', '1 % (max 10 $)', 'Transfert bancaire']
  ];

  function envDe(m){ return (D && D[m]) || { appId: '', locId: '', jeton: { defini: false, fin: '' } }; }

  function dessiner(){
    var av = document.getElementById('ro');
    if (av) av.hidden = !RO;
    var d = D || {};
    envEl.hidden = false;
    envEl.className = 'env ' + (d.mode === 'production' ? 'prod' : 'bac');
    envEl.textContent = d.mode === 'production' ? 'Production — paiements réels' : 'Bac à sable — paiements de test';

    var e = envDe(MODE);
    var h = [];
    h.push('<div class="rangee">');

    // ── Identifiants ───────────────────────────────────────────────────────
    h.push('<div class="carte"><h2>Identifiants Square</h2>');
    h.push('<p class="sous">Chaque environnement garde ses propres identifiants. Le mode enregistré '
      + 'ne change qu’au moment où vous enregistrez.</p>');
    h.push('<div class="modes">'
      + '<label><input type="radio" name="mode" value="sandbox"' + (MODE !== 'production' ? ' checked' : '')
      + (RO ? ' disabled' : '') + '> Bac à sable — test</label>'
      + '<label><input type="radio" name="mode" value="production"' + (MODE === 'production' ? ' checked' : '')
      + (RO ? ' disabled' : '') + '> Production — réel</label></div>');
    if (MODE === 'production') {
      h.push('<div class="note garde">Environnement de production : les paiements sont réels et les '
        + 'cartes sont débitées.</div>');
    }
    h.push('<div class="ch"><label>Identifiant d’application</label>'
      + '<input id="f-app" type="text" value="' + esc(e.appId) + '" placeholder="sq0idp-…"'
      + (RO ? ' disabled' : '') + '>'
      + '<div class="aide">Tableau de bord développeur, section Credentials.</div></div>');
    h.push('<div class="ch"><label>Jeton d’accès</label>'
      + '<input id="f-jeton" type="password" value="" placeholder="' + (e.jeton.defini ? 'inchangé' : 'EAAAl…')
      + '" autocomplete="off"' + (RO ? ' disabled' : '') + '>'
      + '<div class="jeton' + (e.jeton.defini ? '' : ' non') + '">'
      + (e.jeton.defini
          ? 'Jeton <b>enregistré</b> (se termine par ' + esc(e.jeton.fin) + '). Laissez le champ vide pour le conserver.'
          : 'Aucun jeton <b>enregistré</b> pour cet environnement.')
      + '</div></div>');
    h.push('<div class="ch"><label>Identifiant d’emplacement</label>'
      + '<input id="f-loc" type="text" value="' + esc(e.locId) + '" placeholder="L…"'
      + (RO ? ' disabled' : '') + '>'
      + '<div class="aide">Testez la connexion pour voir vos emplacements.</div></div>');
    h.push('<div class="res" id="res"></div>');
    h.push('</div>');

    // ── Où la cliente saisit sa carte ──────────────────────────────────────
    h.push('<div class="carte"><h2>Où le client saisit sa carte</h2>');
    h.push('<p class="sous">Par défaut, le champ de carte de Square s’affiche dans notre page de caisse. '
      + 'S’il ne se charge pas, le client est bloqué au pire moment.</p>');
    h.push('<label class="bascule"><input type="checkbox" id="o-heb"' + (d.hebergee ? ' checked' : '')
      + (RO ? ' disabled' : '') + '><span><strong>Payer sur la page sécurisée de Square</strong>'
      + '<span class="d">Le client est dirigé vers Square, paie, puis revient sur un écran d’attente. '
      + 'Aucun numéro de carte ne passe par notre site.</span></span></label>');
    h.push('<div class="note">Apple Pay et Google Pay restent offerts sur la page de Square. Afterpay, lui, '
      + 'exige le champ intégré. Un bouton de secours vers la page de Square apparaît toujours si le champ '
      + 'intégré refuse de s’afficher.</div>');
    if (d.mode !== 'production') {
      h.push('<div class="note garde">En bac à sable, Square ouvre un panneau de simulation qui ne revient '
        + 'jamais sur le site. Revenez à la boutique après l’avoir terminé : un bandeau « Vérifier mon '
        + 'paiement » termine la commande. Le parcours complet ne se voit qu’en production.</div>');
    }
    h.push('<h2 style="margin-top:1.1rem">Modes de paiement à la caisse</h2>');
    h.push('<label class="bascule"><input type="checkbox" id="o-after"' + (d.afterpay ? ' checked' : '')
      + (RO ? ' disabled' : '') + '><span><strong>Afterpay</strong>'
      + '<span class="d">À activer d’abord dans le tableau de bord Square.</span></span></label>');
    h.push('<label class="bascule"><input type="checkbox" id="o-apple"' + (d.applepay ? ' checked' : '')
      + (RO ? ' disabled' : '') + '><span><strong>Apple Pay</strong>'
      + '<span class="d">Visible seulement dans Safari, sur un appareil compatible.</span></span></label>');
    h.push('<label class="bascule"><input type="checkbox" id="o-express"' + (d.express ? ' checked' : '')
      + (RO ? ' disabled' : '') + '><span><strong>Paiement express sur la fiche et le panier</strong>'
      + '<span class="d">Le client paie sans passer par le tunnel de commande. À éprouver en bac à sable '
      + 'avant de l’offrir.</span></span></label>');
    h.push('<div class="gestes"><button class="prim" id="b-options"' + (RO ? ' disabled' : '')
      + '>Enregistrer les modes de paiement</button></div>');
    h.push('</div>');
    h.push('</div>');

    // ── Tarifs (informatif) ────────────────────────────────────────────────
    h.push('<div class="carte"><h2>Tarifs Square — Canada</h2><div class="tarifs">');
    TARIFS.forEach(function(t){
      h.push('<div class="tarif"><div class="t">' + esc(t[0]) + '</div><div class="r">' + esc(t[1])
        + '</div><div class="n">' + esc(t[2]) + '</div></div>');
    });
    h.push('</div><p class="sous" style="margin:.7rem 0 0">Tarifs en vigueur au Canada, à vérifier sur '
      + 'squareup.com/ca.</p></div>');

    corps.innerHTML = h.join('');
    brancher();
    montrerTest();
    bsave.disabled = RO || OCCUPE;
  }

  function brancher(){
    var r = corps.querySelectorAll('input[name="mode"]');
    for (var i = 0; i < r.length; i++) r[i].onchange = surMode;
    var bo = document.getElementById('b-options');
    if (bo) bo.onclick = enregistrerOptions;
  }

  function surMode(e){
    if (RO) return;
    MODE = e.currentTarget.value === 'production' ? 'production' : 'sandbox';
    TEST = null;
    dessiner();
    var en = envDe(MODE);
    dire(en.jeton.defini
      ? 'Identifiants du mode ' + (MODE === 'production' ? 'production' : 'bac à sable') + ' rechargés. Enregistrez pour l’activer.'
      : 'Aucun identifiant mémorisé pour ce mode. Saisissez-les, puis enregistrez.',
      en.jeton.defini ? 'att' : 'err');
  }

  function montrerTest(){
    var el = document.getElementById('res');
    if (!el || !TEST) return;
    if (TEST.ok) {
      el.className = 'res bon';
      el.innerHTML = 'Connexion réussie — ' + TEST.emplacements.length + ' emplacement'
        + (TEST.emplacements.length > 1 ? 's' : '') + ' :<br>'
        + TEST.emplacements.map(function(l){
            return '<strong>' + esc(l.nom) + '</strong> <span class="id">' + esc(l.id) + '</span>'; }).join('<br>');
    } else {
      el.className = 'res ' + (TEST.motif === 'sans_jeton' ? 'att' : 'err');
      el.textContent = expliquer(TEST);
    }
  }

  function occuper(o){
    OCCUPE = o;
    bsave.disabled = o || RO;
    btest.disabled = o;
    var bo = document.getElementById('b-options');
    if (bo) bo.disabled = o || RO;
  }

  function enregistrer(){
    if (RO || OCCUPE) return;
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    occuper(true); dire('Enregistrement…');
    appeler('config:paiements:ecrire', [{ mode: MODE, appId: v('f-app'), locId: v('f-loc'), jeton: v('f-jeton') }])
      .then(function(r){
        occuper(false);
        if (r && r.ok) {
          D = r; RO = !r.peutModifier; MODE = r.mode; TEST = null;
          dessiner();
          dire('Identifiants enregistrés — environnement ' + (r.mode === 'production' ? 'production' : 'bac à sable') + '.', 'bon');
        } else dire(expliquer(r), 'err');
      });
  }
  bsave.onclick = enregistrer;

  function enregistrerOptions(){
    if (RO || OCCUPE) return;
    var c = function(id){ var e = document.getElementById(id); return !!(e && e.checked); };
    occuper(true); dire('Enregistrement…');
    appeler('config:paiements:options', [{ hebergee: c('o-heb'), afterpay: c('o-after'),
      applepay: c('o-apple'), express: c('o-express') }]).then(function(r){
      occuper(false);
      if (r && r.ok) { D = r; RO = !r.peutModifier; dessiner(); dire('Modes de paiement enregistrés.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }

  btest.onclick = function(){
    if (OCCUPE) return;
    occuper(true); dire('Connexion à Square…');
    appeler('config:paiements:tester').then(function(r){
      occuper(false);
      TEST = r;
      montrerTest();
      dire(r && r.ok ? 'Connexion réussie.' : expliquer(r), r && r.ok ? 'bon' : 'err');
    });
  };

  function charger(){
    dire('Lecture…');
    appeler('config:paiements:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r;
      RO = !r.peutModifier;
      MODE = r.mode === 'production' ? 'production' : 'sandbox';
      dessiner();
      dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pagePaiementsConfig };
