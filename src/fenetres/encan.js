'use strict';

/*
 * ENCAN EN DIRECT — LA CONSOLE (2026-10-20, lot 1)
 * =============================================================================
 * La fenêtre de l animatrice : l article mis à l encan, les réglages, les gestes
 * (démarrer, pause, +15 s, remettre à zéro, adjuger), les commentaires lus et leur
 * verdict, et le MODE ESSAI qui simule des commentaires sans aucun direct public.
 *
 * ⚠ LA CONSOLE NE TIENT PAS LE TEMPS. Le moteur (src/encan.js) vit dans le
 * processus principal : fermer, recharger ou détacher cette fenêtre n arrête pas
 * l encan, et l écran filmé ne dépend pas d elle. Elle envoie des GESTES, le
 * moteur rend l ÉTAT, et c est cet état qu elle dessine.
 *
 * ⚠ LOT 1 : pas encore de vente (lot 2) ni de vrai direct (lot 3). « Message
 * GAGNÉ reçu » marque l article vendu à l historique de la séance, rien de plus.
 *
 * ⚠ AUCUN ACCENT GRAVE dans la portion de code de la page, commentaires compris.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, TETE } = require('./socle.js');
const T = require('../langue').tr('encan');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;flex-wrap:wrap;gap:.7rem;padding:.6rem 1.1rem;border-bottom:1px solid var(--v08)}
.tete h1{margin:0;font-size:1.05rem}
.tete .droite{margin-left:auto;display:flex;align-items:center;flex-wrap:wrap;gap:.5rem}
.tete label{display:flex;align-items:center;gap:.4rem;font-weight:600}
.tete label input{width:auto}
.corps{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(260px,1fr) minmax(320px,1.35fr) minmax(260px,1fr);
  gap:.7rem;padding:.8rem 1.05rem;overflow:auto;scrollbar-gutter:stable}
@media (max-width:1050px){.corps{grid-template-columns:1fr}}
.col{display:flex;flex-direction:column;gap:.7rem;min-width:0}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:.85rem 1rem}
.carte h2{margin:0 0 .5rem;font-size:.71rem;text-transform:uppercase;letter-spacing:.09em;color:var(--tx2);font-weight:700}
input,select{font:inherit;color:var(--tx);background:var(--f-0f1826);border:1px solid var(--v14);border-radius:8px;padding:.34rem .5rem;width:100%;min-width:0}
input:focus,select:focus{outline:none;border-color:var(--or)}
label.ch{display:flex;flex-direction:column;gap:.2rem;font-size:.8rem;font-weight:600}
.r2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem}
.r3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem .55rem}
button{font:inherit;cursor:pointer;border-radius:8px;padding:.4rem .8rem;border:1px solid var(--v16);background:var(--v05);color:var(--tx)}
button:hover:not(:disabled){background:var(--v10);border-color:var(--v30)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#17202c;font-weight:700}
button.danger{border-color:var(--tx-err);color:var(--tx-err)}
.gestes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}
.gestes button{padding:.75rem .5rem;font-weight:700}
.compte{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem;align-items:end}
.compte .lbl{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--tx2);font-weight:700}
.compte .gros{font-size:3.4rem;font-weight:900;line-height:1;font-variant-numeric:tabular-nums}
.compte .gros.or{color:var(--tx-or)}
.compte .qui{font-weight:700;color:var(--tx-or)}
.phase{display:inline-block;font-size:.75rem;font-weight:700;border-radius:99px;padding:.1rem .6rem;border:1px solid var(--v16);margin-bottom:.5rem}
.aide{font-size:.8rem;color:var(--tx2)}
.liste{display:flex;flex-direction:column;gap:.3rem;max-height:30vh;overflow:hidden}
.ln{display:flex;justify-content:space-between;gap:.6rem;padding:.35rem .55rem;border-radius:7px;background:var(--v05);font-size:.84rem}
.ln .v{color:var(--tx2);white-space:nowrap}
.ln.bon{background:rgba(46,139,78,.16)}.ln.bon .v{color:var(--tx-ok);font-weight:700}
.ln.non .v{color:var(--tx2)}
.res{display:flex;flex-direction:column;gap:.4rem;margin-top:.5rem}
.res .art{border:1px solid var(--v08);border-radius:8px;padding:.45rem .55rem}
.res .art b{display:block}
.vars{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.3rem}
.vars button{padding:.15rem .5rem;font-size:.78rem}
.copie{font-size:.86rem;background:var(--v05);border-radius:8px;padding:.5rem .6rem;margin:.4rem 0}
.pied{flex:0 0 auto;border-top:1px solid var(--v08);padding:.45rem 1.1rem;min-height:2.2rem}
.pied .msg{font-size:.84rem}
`;

function pageEncan() {
  return `${TETE()}
<title>${T("Encan en direct")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><h1>${T("Encan en direct")}</h1>
  <div class="droite">
    <label><input type="checkbox" id="essai" checked>${T("Mode essai (aucun direct, rien ne part)")}</label>
    <button id="ecran">${T("Ouvrir l’écran")}</button>
    <button id="ecran-plein">${T("Plein écran sur l’autre moniteur")}</button>
  </div></div>
<div class="corps">
  <div class="col">
    <div class="carte"><h2>${T("Article à mettre à l’encan")}</h2>
      <label class="ch">${T("Chercher (nom, SKU ou code-barres)")}<input id="recherche" maxlength="60" autocomplete="off" placeholder="${T("Au moins 3 lettres…")}"></label>
      <div class="res" id="res"></div>
      <div class="aide" style="margin-top:.6rem">${T("Ou un article libre :")}</div>
      <div class="r2" style="margin-top:.3rem">
        <input id="libre-nom" maxlength="80" aria-label="${T("Nom de l’article")}" placeholder="${T("Nom de l’article")}">
        <input id="libre-var" maxlength="80" aria-label="${T("Taille, couleur")}" placeholder="${T("Taille, couleur")}">
      </div>
      <div class="r2" style="margin-top:.45rem"><button id="libre-charger">${T("Mettre à l’encan")}</button><button id="libre-file">${T("Ajouter à la file")}</button></div>
    </div>
    <div class="carte"><h2>${T("Réglages")}</h2>
      <div class="r3">
        <label class="ch">${T("Prix de départ ($)")}<input id="r-depart" type="number" min="0" max="100000" step="1"></label>
        <label class="ch">${T("Durée au départ (s)")}<input id="r-duree" type="number" min="5" max="600" step="5"></label>
        <label class="ch">${T("Ajout par offre (s)")}<input id="r-ajout" type="number" min="1" max="120" step="1"></label>
        <label class="ch">${T("Hausse minimale ($)")}<input id="r-hausse" type="number" min="0.01" max="10000" step="0.5"></label>
        <label class="ch">${T("Sans offre : relance sous (s)")}<input id="r-sous" type="number" min="1" max="30" step="1"></label>
        <label class="ch">${T("…repart à (s)")}<input id="r-a" type="number" min="5" max="120" step="1"></label>
        <label class="ch">${T("Délai « GAGNÉ » (min)")}<input id="r-delai" type="number" min="1" max="60" step="1"></label>
      </div>
      <div class="aide" style="margin-top:.4rem">${T("Les réglages se changent entre deux encans.")}</div>
    </div>
  </div>
  <div class="col">
    <div class="carte"><span class="phase" id="phase"></span><div id="article" style="font-weight:800;font-size:1.05rem"></div>
      <div class="compte" style="margin-top:.6rem">
        <div><div class="lbl" id="lbl-temps">${T("Temps restant")}</div><div class="gros or" id="chrono">0:00</div></div>
        <div><div class="lbl" id="lbl-prix">${T("Enchère")}</div><div class="gros" id="prix">—</div><div class="qui" id="meneur"></div></div>
      </div></div>
    <div class="gestes">
      <button class="prim" id="g-demarrer">${T("Démarrer")}</button>
      <button id="g-pause">${T("Pause")}</button>
      <button id="g-plus">${T("+15 s")}</button>
      <button id="g-remettre">${T("Remettre à zéro")}</button>
      <button id="g-adjuger">${T("Adjuger maintenant")}</button>
      <button class="danger" id="g-annuler">${T("Annuler l’encan")}</button>
    </div>
    <div class="carte" id="carte-gagnant" style="display:none"><h2>${T("Gagnante")}</h2>
      <div id="gagnant" style="font-weight:800;font-size:1.1rem"></div>
      <div class="aide" id="gagnant-delai"></div>
      <div class="copie" id="copie"></div>
      <div class="r2"><button id="copier">${T("Copier le message pour les commentaires")}</button><button class="prim" id="g-gagne">${T("Message GAGNÉ reçu")}</button></div>
      <button id="g-remise" style="margin-top:.5rem;width:100%">${T("Remettre en vente")}</button>
    </div>
    <div class="r2"><button id="g-garde">${T("Afficher la page de garde")}</button><button id="g-suivant2">${T("Article suivant")}</button></div>
    <div class="carte"><h2>${T("Ventes de la séance")}</h2><div class="liste" id="histo" style="max-height:18vh"></div></div>
  </div>
  <div class="col">
    <div class="carte"><h2>${T("Commentaires lus")}</h2><div class="liste" id="journal" style="max-height:30vh"></div></div>
    <div class="carte" id="carte-essai"><h2>${T("Mode essai — simuler un commentaire")}</h2>
      <div class="r2"><input id="e-pseudo" maxlength="40" aria-label="${T("Pseudo")}" value="@essai_1"><input id="e-texte" maxlength="140" aria-label="${T("Commentaire")}" placeholder="${T("ex. 25")}"></div>
      <div class="r2" style="margin-top:.45rem"><button class="prim" id="e-envoyer">${T("Envoyer")}</button><button id="e-rafale">${T("Rafale de 10 offres")}</button></div>
    </div>
    <div class="carte"><h2 id="file-titre">${T("À suivre")}</h2><div class="liste" id="file" style="max-height:16vh"></div>
      <button id="suivant" style="margin-top:.5rem;width:100%">${T("Article suivant")}</button></div>
  </div>
</div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var E = null, RECU = 0, REGLAGES_POSES = false;
  /* Le canal de l encan, s il existe VRAIMENT (une coquille plus ancienne, ou un banc, n en a pas). */
  var EN = (P && P.encan && typeof P.encan.geste === 'function') ? P.encan : null;
  var $ = function(id){ return document.getElementById(id); };
  var MOTIFS = {
    encan_en_cours: '${T("Un encan est en cours : terminez-le avant.")}',
    article_requis: '${T("Choisissez d’abord un article.")}',
    deja_lance: '${T("L’encan est déjà lancé.")}',
    pas_en_cours: '${T("Aucun encan en cours.")}',
    pas_en_pause: '${T("L’encan n’est pas en pause.")}',
    aucune_offre: '${T("Aucune offre : impossible d’adjuger.")}',
    pas_adjuge: '${T("Rien n’est adjugé.")}',
    file_vide: '${T("La file est vide.")}',
    file_pleine: '${T("La file est pleine (200 articles).")}',
    pseudo_requis: '${T("Le pseudo est obligatoire.")}',
    essai_coupe: '${T("Le mode essai est coupé.")}',
    indisponible: '${T("Cette version de l’application ne connaît pas l’encan.")}'
  };
  var PHASES = { garde: '${T("Page de garde")}', pret: '${T("Prêt")}', encours: '${T("En cours")}', pause: '${T("En pause")}',
    adjuge: '${T("Adjugé — en attente de « GAGNÉ »")}', expire: '${T("Délai passé")}', vendu: '${T("Vendu")}', annule: '${T("Annulé")}' };
  var VERDICTS = { retenue: '${T("offre retenue")}', trop_basse: '${T("trop basse")}', sous_depart: '${T("sous le départ")}',
    pas_offre: '${T("pas une offre")}', pause: '${T("pendant la pause")}', fermee: '${T("encan fermé")}' };

  function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function argent(n){ return szArgent(Number(n) || 0); }
  function chrono(ms){ var s = Math.ceil(Math.max(0, ms) / 1000), m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
  function geste(nom, args){
    if (!EN) { szDire(MOTIFS.indisponible, 'err'); return Promise.resolve({ ok: false }); }
    return EN.geste(nom, args || []).then(function(r){
      if (r && !r.ok) szDire(MOTIFS[r.motif] || ('${T("Refusé : ")}' + (r.motif || '?')), 'err');
      return r || { ok: false };
    });
  }

  function poserReglages(){
    if (!E || !E.reglages) return;
    var g = E.reglages;
    $('r-depart').value = g.depart; $('r-duree').value = g.duree; $('r-ajout').value = g.ajout; $('r-hausse').value = g.hausse;
    $('r-sous').value = g.relanceSous; $('r-a').value = g.relanceA; $('r-delai').value = Math.round(g.delaiGagne / 60);
    $('g-plus').textContent = '+' + g.ajout + ' s';
  }
  function lireReglages(){
    return { depart: +$('r-depart').value, duree: +$('r-duree').value, ajout: +$('r-ajout').value, hausse: +$('r-hausse').value,
      relanceSous: +$('r-sous').value, relanceA: +$('r-a').value, delaiGagne: (+$('r-delai').value || 15) * 60 };
  }
  ['r-depart','r-duree','r-ajout','r-hausse','r-sous','r-a','r-delai'].forEach(function(id){
    $(id).onchange = function(){ geste('regler', [lireReglages()]).then(function(r){ if (!r.ok) poserReglages(); }); };
  });

  function dessiner(){
    if (!E) return;
    var enJeu = E.phase === 'encours' || E.phase === 'pause';
    var a = E.article;
    $('phase').textContent = PHASES[E.phase] || E.phase;
    $('article').textContent = a ? [a.nom, a.variante].filter(Boolean).join(' · ') : '${T("Aucun article")}';
    $('essai').checked = !!E.essai;
    $('carte-essai').style.display = E.essai ? '' : 'none';
    var aucune = !E.nbOffres;
    $('lbl-prix').textContent = aucune ? '${T("Mise de départ")}' : '${T("Enchère")}' + ' · ' + E.nbOffres + ' ' + (E.nbOffres > 1 ? '${T("offres")}' : '${T("offre")}');
    $('prix').textContent = argent(aucune ? E.reglages.depart : E.prix);
    $('meneur').textContent = aucune ? (E.relances ? '${T("Aucune offre · relances : ")}' + E.relances : '') : E.meneur;
    $('g-demarrer').disabled = E.phase !== 'pret';
    $('g-pause').disabled = !enJeu;
    $('g-pause').textContent = E.phase === 'pause' ? '${T("Reprendre")}' : '${T("Pause")}';
    $('g-plus').disabled = !enJeu;
    $('g-remettre').disabled = !a || E.phase === 'garde';
    $('g-adjuger').disabled = !enJeu || aucune;
    $('g-annuler').disabled = !a || E.phase === 'vendu' || E.phase === 'annule';
    $('g-garde').disabled = enJeu;
    $('suivant').disabled = $('g-suivant2').disabled = enJeu || !E.nbFile;
    REGLAGES_POSES || (poserReglages(), REGLAGES_POSES = true);
    ['r-depart','r-duree','r-ajout','r-hausse','r-sous','r-a','r-delai'].forEach(function(id){ $(id).disabled = enJeu; });

    var g = E.gagnant, montre = E.phase === 'adjuge' || E.phase === 'expire';
    $('carte-gagnant').style.display = (g && (montre || E.phase === 'vendu')) ? '' : 'none';
    if (g) {
      $('gagnant').textContent = g.pseudo + ' — ' + argent(g.montant);
      $('copie').textContent = '${T("{p} tu as gagné {a} à {m} ! Écris-nous GAGNÉ en message privé dans les {n} minutes.")}'
        .replace('{p}', g.pseudo).replace('{a}', a ? a.nom : '').replace('{m}', argent(g.montant)).replace('{n}', String(Math.round(E.reglages.delaiGagne / 60)));
      $('g-gagne').disabled = E.phase !== 'adjuge';
      $('g-remise').disabled = !montre;
    }

    $('journal').innerHTML = (E.journal || []).map(function(j){
      return '<div class="ln ' + (j.verdict === 'retenue' ? 'bon' : 'non') + '"><span><b>' + esc(j.pseudo) + '</b> ' + esc(j.texte) + '</span><span class="v">' + esc(VERDICTS[j.verdict] || j.verdict) + '</span></div>';
    }).join('') || '<div class="aide">${T("Aucun commentaire pour l’instant.")}</div>';
    $('file-titre').textContent = '${T("À suivre")}' + ' (' + (E.nbFile || 0) + ')';
    $('file').innerHTML = (E.file || []).map(function(f){
      return '<div class="ln"><span>' + esc([f.nom, f.variante].filter(Boolean).join(' · ')) + '</span><button class="mini" data-retirer="' + esc(f.cle) + '" aria-label="${T("Retirer")}"><span class="ic">✕</span></button></div>';
    }).join('') || '<div class="aide">${T("Rien en file.")}</div>';
    $('histo').innerHTML = (E.historique || []).map(function(h){
      var lib = h.issue === 'vendu' ? '${T("vendu")}' : h.issue === 'remis' ? '${T("remis en vente")}' : '${T("annulé")}';
      return '<div class="ln ' + (h.issue === 'vendu' ? 'bon' : 'non') + '"><span>' + esc(h.article ? h.article.nom : '') + (h.gagnant ? ' · ' + esc(h.gagnant.pseudo) + ' ' + argent(h.gagnant.montant) : '') + '</span><span class="v">' + lib + '</span></div>';
    }).join('') || '<div class="aide">${T("Aucune vente encore.")}</div>';
    temps();
  }
  function temps(){
    if (!E) return;
    var r = E.phase === 'encours' ? Math.max(0, E.restantMs - (Date.now() - RECU)) : E.restantMs;
    $('chrono').textContent = chrono(r);
    $('lbl-temps').textContent = E.phase === 'pause' ? '${T("Temps arrêté")}' : '${T("Temps restant")}';
    if (E.gagnant && E.phase === 'adjuge') $('gagnant-delai').textContent = '${T("« GAGNÉ » attendu encore ")}' + chrono(E.gagnant.restantMs - (Date.now() - RECU));
    else if (E.phase === 'expire') $('gagnant-delai').textContent = '${T("Délai passé : remettez l’article en vente.")}';
    else $('gagnant-delai').textContent = '';
  }
  setInterval(temps, 200);

  function recevoir(etat){ if (!etat || !etat.reglages) return; E = etat; RECU = Date.now(); dessiner(); }
  if (EN) { EN.surEtat(recevoir); EN.lire().then(recevoir); }
  else szDire(MOTIFS.indisponible, 'err');

  // ── Les gestes ──
  $('g-demarrer').onclick = function(){ geste('demarrer'); };
  $('g-pause').onclick = function(){ geste(E && E.phase === 'pause' ? 'reprendre' : 'pause'); };
  $('g-plus').onclick = function(){ geste('ajouterTemps', [E ? E.reglages.ajout : 15]); };
  $('g-remettre').onclick = function(){ geste('remettre'); };
  $('g-adjuger').onclick = function(){ geste('adjuger'); };
  $('g-annuler').onclick = function(){
    szConfirmer({ danger: true, titre: '${T("Annuler l’encan")}',
      texte: '${T("L’encan de cet article s’arrête sans gagnante : les offres reçues sont abandonnées. L’article reste disponible pour un prochain encan.")}',
      oui: '${T("Annuler l’encan")}' }).then(function(ok){ if (ok) geste('annuler'); });
  };
  $('g-gagne').onclick = function(){ geste('confirmerGagne').then(function(r){ if (r.ok) szDire('${T("Vendu — noté aux ventes de la séance.")}', 'bon'); }); };
  $('g-remise').onclick = function(){ geste('remettreEnVente'); };
  $('g-garde').onclick = function(){ geste('garde'); };
  $('suivant').onclick = $('g-suivant2').onclick = function(){ geste('suivant'); };
  $('copier').onclick = function(){
    if (!EN) return;
    EN.copier($('copie').textContent).then(function(ok){ szDire(ok ? '${T("Message copié : collez-le dans les commentaires du direct.")}' : '${T("La copie a échoué.")}', ok ? 'bon' : 'err'); });
  };
  $('essai').onchange = function(){ geste('modeEssai', [this.checked]); };
  $('ecran').onclick = function(){ if (EN) EN.ecran({ pleinEcran: false }); };
  $('ecran-plein').onclick = function(){ if (EN) EN.ecran({ pleinEcran: true }).then(function(r){ if (r && r.motif === 'un_seul_ecran') szDire('${T("Un seul moniteur branché : l’écran s’ouvre en fenêtre.")}', 'att'); }); };
  document.getElementById('file').onclick = function(ev){
    var b = ev.target.closest('[data-retirer]'); if (b) geste('retirerDeFile', [b.getAttribute('data-retirer')]);
  };

  // ── Le mode essai ──
  $('e-envoyer').onclick = function(){
    geste('commentaire', [$('e-pseudo').value, $('e-texte').value, 'essai']).then(function(r){ if (r.ok) { $('e-texte').value = ''; $('e-texte').focus(); } });
  };
  $('e-texte').onkeydown = function(ev){ if (ev.key === 'Enter') $('e-envoyer').click(); };
  var NOMS = ['@julie.mtl', '@sophie_b', '@marie.g', '@karine.qc', '@ana_lav', '@nath_22'];
  $('e-rafale').onclick = function(){
    var n = 0;
    var t = setInterval(function(){
      if (!E || n >= 10 || E.phase !== 'encours') { clearInterval(t); return; }
      var monte = (E.nbOffres ? E.prix : E.reglages.depart - E.reglages.hausse) + E.reglages.hausse * (1 + Math.floor(Math.random() * 3));
      geste('commentaire', [NOMS[Math.floor(Math.random() * NOMS.length)], String(Math.ceil(monte)), 'essai']);
      n++;
    }, 900);
  };

  // ── Choisir un article ──
  var minuterie = null;
  function articleDe(x, v){
    return { id: x.id + (v ? ':' + v.cle : ''), produitId: x.id, nom: x.nom, image: x.image || '',
      variante: v ? [v.taille, v.couleur].filter(Boolean).join(' · ') : '', taille: v ? v.taille : '', couleur: v ? v.couleur : '' };
  }
  var TROUVES = [];
  $('recherche').oninput = function(){
    clearTimeout(minuterie);
    var q = this.value;
    minuterie = setTimeout(function(){
      if (q.trim().length < 3) { $('res').innerHTML = ''; return; }
      P.appeler('caisse:chercher', q).then(function(r){
        if (!r || !r.ok) { $('res').innerHTML = '<div class="aide">' + esc(expliquer ? expliquer(r) : '') + '</div>'; return; }
        TROUVES = r.articles || [];
        $('res').innerHTML = TROUVES.map(function(x, i){
          return '<div class="art"><b>' + esc(x.nom) + '</b><span class="aide">' + esc(x.code) + '</span><div class="vars">'
            + (x.variantes || []).map(function(v, j){
              return '<button data-a="' + i + '" data-v="' + j + '"' + (v.quantite > 0 ? '' : ' disabled') + '>' + esc([v.taille, v.couleur].filter(Boolean).join(' · ') || '${T("Unique")}') + ' (' + v.quantite + ')</button>';
            }).join('') + '</div></div>';
        }).join('') || '<div class="aide">${T("Aucun article trouvé.")}</div>';
      });
    }, 250);
  };
  $('res').onclick = function(ev){
    var b = ev.target.closest('[data-a]'); if (!b) return;
    var x = TROUVES[+b.getAttribute('data-a')]; var v = x && (x.variantes || [])[+b.getAttribute('data-v')];
    if (!x) return;
    var art = articleDe(x, v);
    var enJeu = E && (E.phase === 'encours' || E.phase === 'pause');
    geste(enJeu ? 'enFile' : 'charger', [art]).then(function(r){
      if (r.ok) szDire(enJeu ? '${T("Ajouté à la file.")}' : '${T("Article prêt : appuyez sur Démarrer.")}', 'bon');
    });
  };
  function libre(){ var n = $('libre-nom').value.trim(); return n ? { id: 'libre:' + Date.now().toString(36), nom: n, variante: $('libre-var').value.trim() } : null; }
  $('libre-charger').onclick = function(){ var a = libre(); if (!a) { szDire(MOTIFS.article_requis, 'err'); return; } geste('charger', [a]).then(function(r){ if (r.ok) { $('libre-nom').value = ''; $('libre-var').value = ''; } }); };
  $('libre-file').onclick = function(){ var a = libre(); if (!a) { szDire(MOTIFS.article_requis, 'err'); return; } geste('enFile', [a]).then(function(r){ if (r.ok) { $('libre-nom').value = ''; $('libre-var').value = ''; } }); };
  var expliquer = function(r){ return (r && r.motif) ? (MOTIFS[r.motif] || r.motif) : ''; };
})();
</script></body></html>`;
}

module.exports = { pageEncan };
