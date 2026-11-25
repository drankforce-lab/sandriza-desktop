'use strict';

/*
 * LA BOÎTE DE STYLE — COMPOSER, VALIDER, PRÉLEVER (2026-11-23, lot 3)
 * =============================================================================
 * Maquette « Admin » de https://claude.ai/artifact/VcNyTk24C1uJuxij7NM3qr. Une saison (date d'envoi fixe) : la liste
 * des abonnées qui la reçoivent, la boîte de chacune (proposition automatique, à changer), la surprise, la valeur
 * comparée à la visée du palier, « Valider » (refusé par le serveur pendant la grâce de 14 jours), puis « Prélever et
 * expédier les validées » : le serveur débite (par saison) et crée une VRAIE commande, stock compris, tout-ou-rien.
 * Plus les réglages (paliers, prix, allumée ou éteinte).
 * ⚠ TOUTE LA RÈGLE EST AU SERVEUR (lib-boite.php, op bs) : la fenêtre ne fixe aucun montant.
 * ⚠ PAS DE BANDEAU DE TUILES (sa règle du 2026-10-16) : les compteurs tiennent sur une ligne.
 * ⚠ AUCUN CARACTÈRE accent grave dans la portion de script, COMMENTAIRES COMPRIS : le script vit dans un
 * littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('boite');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.tete .cx-resume{color:var(--tx2);font-size:.8rem}
select,input,button,textarea{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:9px;padding:.3rem .55rem;cursor:pointer}
input,textarea{cursor:text}
input[type=checkbox],input[type=radio]{width:auto;padding:0;cursor:pointer}
select:focus,input:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:var(--sz-btn-prim,var(--or));border-color:transparent;color:var(--sz-btn-prim-txt,#1a1208);font-weight:800}
button.dang{color:var(--tx-err2,var(--ep-rouge-t))}
#corps{flex:1 1 auto;min-height:0;overflow:hidden;padding:.9rem 1.1rem .7rem;display:flex;flex-direction:column;gap:.8rem}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.8rem}
.msg.bon{color:var(--tx-ok)} .msg.err{color:var(--tx-err)} .msg.att{color:var(--tx-att)}
.bx-tete{display:flex;align-items:flex-end;gap:.6rem;flex-wrap:wrap}
.bx-tete .g{display:flex;flex-direction:column;gap:.15rem;margin-right:auto}
.bx-tete .g span{font-size:.76rem;color:var(--tx2);font-weight:600}
.bx-tete h2{margin:0;font-size:1.45rem;font-weight:800;letter-spacing:-.02em}
.bx-tete button{height:2.35rem;padding:0 .9rem}
.bx-tete button.prim{height:2.6rem}
.bx-nav{display:flex;align-items:center;gap:.3rem}
.bx-nav button{height:2.35rem;padding:0 .6rem}
.bx-comptes{display:flex;gap:.5rem;flex-wrap:wrap}
.bx-c{display:inline-flex;align-items:center;gap:.4rem;font-size:.78rem;padding:.25rem .7rem;border-radius:99px;background:var(--ep-neutre-f,var(--v06));color:var(--ep-neutre-t,var(--tx))}
.bx-c b{font-variant-numeric:tabular-nums}
.bx-c.a{background:var(--ep-ambre-f);color:var(--ep-ambre-t)}
.bx-grille{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:20rem minmax(0,1fr);gap:.9rem}
.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:16px;padding:.7rem;min-width:0;min-height:0;box-shadow:0 14px 30px -22px rgba(0,0,0,.55)}
.bx-liste{display:flex;flex-direction:column;gap:3px;overflow:hidden}
.bx-l{display:flex;align-items:center;gap:.6rem;padding:.5rem .55rem;border-radius:11px;border:0;background:transparent;text-align:left;width:100%}
.bx-l.on{background:var(--v08)}
.bx-av{flex:none;width:2.1rem;height:2.1rem;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;
  background:color-mix(in srgb,var(--vv-4,#f08fb8) 22%,var(--f-carte));color:color-mix(in srgb,var(--vv-4,#f08fb8) 40%,var(--tx))}
.bx-l .n{display:flex;flex-direction:column;margin-right:auto;min-width:0}
.bx-l .n b{font-size:.84rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bx-l .n span{font-size:.7rem;color:color-mix(in srgb,var(--tx2) 55%,var(--tx));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pill{display:inline-flex;align-items:center;font-size:.68rem;font-weight:700;padding:.12rem .55rem;border-radius:99px;white-space:nowrap;background:var(--ep-neutre-f,var(--v08));color:var(--ep-neutre-t,var(--tx2))}
.pill.a{background:var(--ep-ambre-f);color:var(--ep-ambre-t)}
.pill.ok{background:color-mix(in srgb,var(--vv-1,#5fd4a4) 18%,var(--f-carte));color:color-mix(in srgb,var(--vv-1,#5fd4a4) 40%,var(--tx))}
.pill.r{background:var(--ep-rouge-f);color:var(--ep-rouge-t)}
.bx-pied-l{margin-top:auto;padding:.4rem .4rem 0;font-size:.72rem;color:var(--tx2);display:flex;align-items:center;gap:.4rem}
.bx-pied-l button{padding:.1rem .45rem}
.bx-d{display:flex;flex-direction:column;gap:.6rem;padding:.8rem 1rem;overflow:auto}   /* (2026-11-23) défile : l’encadré de l’IA peut pousser les gestes */
.bx-d .tt{display:flex;align-items:center;gap:.6rem}
.bx-d .tt .g{display:flex;flex-direction:column;margin-right:auto}
.bx-d .tt b{font-size:1rem}
/* (contrastes, 2026-11-23) Le sous-titre SEUL : « .tt span » repeignait aussi la pastille et l'avatar en gris. */
.bx-d .tt .g span{font-size:.76rem;color:var(--tx2)}
.bx-arts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.6rem}
.bx-a{display:flex;flex-direction:column;gap:.3rem;min-width:0}
.bx-a .ph{height:clamp(4.5rem,13vh,13rem);border-radius:12px;background:var(--v06);overflow:hidden}
.bx-a .ph img{width:100%;height:100%;object-fit:cover}
.bx-a b{font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bx-a span{font-size:.7rem;color:var(--tx2)}
.bx-a button{font-size:.72rem;padding:.2rem .4rem}
.bx-ajout{height:clamp(6rem,26vh,13rem);border:1px dashed var(--v16);border-radius:12px;background:transparent;color:var(--tx2);display:flex;align-items:center;justify-content:center;text-align:center;padding:.4rem}
.bx-chercher{display:flex;flex-direction:column;gap:.4rem}
.bx-chercher input{width:100%;height:2.2rem}
.bx-res{display:flex;flex-direction:column;gap:2px;max-height:11rem;overflow:hidden}
.bx-res button{display:flex;justify-content:space-between;gap:.6rem;border:0;background:transparent;text-align:left;border-radius:8px;font-size:.78rem}
.bx-res button:hover{background:var(--v06)}
.bx-ia{display:flex;flex-direction:column;gap:.1rem;padding:.4rem .7rem;border-radius:11px;font-size:.8rem;line-height:1.45;
  background:color-mix(in srgb,var(--vv-3,#b49cf7) 14%,var(--f-carte));border:1px solid color-mix(in srgb,var(--vv-3,#b49cf7) 30%,var(--f-carte))}
.bx-ia b{font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:color-mix(in srgb,var(--vv-3,#b49cf7) 40%,var(--tx))}
.bx-ia span{color:var(--tx);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bx-ia.regle{background:var(--v04,var(--v05));border-color:var(--v08)}
.bx-ia.regle b{color:var(--tx2)}
.bx-sur{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;padding:.55rem .8rem;border-radius:12px;
  background:color-mix(in srgb,var(--vv-4,#f08fb8) 12%,var(--f-carte));border:1px solid color-mix(in srgb,var(--vv-4,#f08fb8) 25%,var(--f-carte));font-size:.8rem}
.bx-sur b{color:color-mix(in srgb,var(--vv-4,#f08fb8) 40%,var(--tx))}
.bx-sur label{display:inline-flex;align-items:center;gap:.3rem}
.bx-sur input[type=text]{flex:1 1 12rem;min-width:10rem}
.bx-val{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;padding:.65rem .85rem;border-radius:12px;background:var(--f-carte2,var(--v04))}
.bx-val .k{display:flex;flex-direction:column}
.bx-val .k span{font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2)}
.bx-val .k b{font-size:1.05rem;font-variant-numeric:tabular-nums}
.bx-val .esp{margin-left:auto;display:flex;gap:.5rem}
.bx-val .esp button{height:2.3rem;padding:0 .95rem}
.bx-note{font-size:.76rem;color:var(--tx2);line-height:1.5}
.vide{color:var(--tx2);text-align:center;padding:1.6rem 1rem}
.bx-rg{display:flex;flex-direction:column;gap:.7rem;padding:1rem 1.1rem;overflow:hidden}
.bx-rg table{width:100%;border-collapse:separate;border-spacing:0 4px;font-size:.8rem}
.bx-rg th{text-align:left;font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx-or,var(--tx2));padding:0 .4rem}
.bx-rg td{padding:0 .3rem}
.bx-rg input{width:100%;height:2.1rem}
.bx-rg .ligne{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
`;

function pageBoite() {
  return `${TETE()}
<title>${T("Boîte de style — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.giftcards}</span><h1>${T("Boîte de style")}</h1>
  <span class="cx-resume" id="sous"></span></div>
<div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps'), elSous = document.getElementById('sous');
  var S = null, REG = null, ENVOI = '', SEL = '', VUE = 'saison', PAGE = 0, CHERCHE = '', RES = [];
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl, ci){ szDire(t, cl, ci); }
  var MOTIFS = {
    session: '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit: '${T("Votre rôle ne permet pas de gérer la boîte de style.")}',
    indisponible: '${T("La boîte de style n’est pas disponible dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    grace: '${T("Cette abonnée est dans sa période de grâce après son renouvellement : sa boîte se valide après la fin de la grâce.")}',
    vide: '${T("La boîte est vide : ajoutez au moins un morceau.")}',
    verrouillee: '${T("Cette boîte est déjà validée ou prélevée : dévalidez-la d’abord.")}',
    conflit: '${T("La boîte a changé entre-temps. La liste a été relue.")}',
    hors_saison: '${T("Cette abonnée ne reçoit pas cette saison.")}',
    paiement_refuse: '${T("Carte refusée.")}',
    epuise: '${T("Un article est épuisé : recomposez la boîte.")}',
    annuel_trop_cher: '${T("Le prix annuel dépasse 3 boîtes par saison : la première boîte ne serait plus offerte.")}',
    prix: '${T("Chaque palier doit avoir un prix par saison et un prix annuel.")}',
    echec: '${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').'); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); } catch (e) { return Promise.resolve({ ok: false, motif: 'indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; }).catch(function(){ return { ok: false, motif: 'echec' }; });
  }
  function argent(n){ return szArgent(Number(n) || 0); }
  var MOIS = ['${T("janvier")}', '${T("février")}', '${T("mars")}', '${T("avril")}', '${T("mai")}', '${T("juin")}', '${T("juillet")}', '${T("août")}', '${T("septembre")}', '${T("octobre")}', '${T("novembre")}', '${T("décembre")}'];
  function saison(iso){ var m = +String(iso).split('-')[1]; return ({ 3: '${T("Printemps")}', 6: '${T("Été")}', 9: '${T("Automne")}', 12: '${T("Hiver")}' }[m] || '') + ' ' + String(iso).slice(0, 4); }
  function jour(iso){ var p = String(iso).split('-'); return (+p[2]) + ' ' + MOIS[(+p[1]) - 1] + ' ' + p[0]; }
  function init(nom){ var p = String(nom || '?').trim().split(' ').filter(Boolean); return ((p[0] || '?').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase(); }
  var ST = { a_composer: ['${T("À composer")}', 'a'], proposee: ['${T("À valider")}', 'a'], validee: ['${T("Validée")}', 'ok'], prelevement: ['${T("En cours")}', ''],
    prelevee: ['${T("Commandée")}', ''], expediee: ['${T("Expédiée")}', ''] };

  function charger(){
    appeler('boite:saison', [ENVOI]).then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="carte vide">' + esc(expliquer(r)) + '</div>'; return; }
      S = r; ENVOI = r.envoi;
      if (!SEL || !r.boites.some(function(b){ return b.aboId === SEL; })) SEL = r.boites.length ? r.boites[0].aboId : '';
      elSous.textContent = r.compteurs.abonnees + ' ' + (r.compteurs.abonnees > 1 ? '${T("abonnées cette saison")}' : '${T("abonnée cette saison")}');
      dessiner();
    });
  }
  function boite(){ return (S && S.boites || []).filter(function(b){ return b.aboId === SEL; })[0] || null; }

  function dessiner(){
    if (VUE === 'reglages') { dessinerReglages(); return; }
    if (!S) return;
    var c = S.compteurs;
    var h = '<div class="bx-tete"><div class="g"><span>' + esc('${T("Expédition prévue le")} ' + jour(ENVOI) + ' · ${T("prélèvement à l’envoi")}') + '</span><h2>' + esc(saison(ENVOI)) + '</h2></div>'
      + '<div class="bx-nav"><button type="button" data-env="-1" aria-label="${T("Saison précédente")}">‹</button><button type="button" data-env="1" aria-label="${T("Saison suivante")}">›</button></div>'
      + '<button type="button" id="bx-rg">${T("Paliers et prix")}</button>'
      + '<button type="button" id="bx-auto"' + (c.aValider ? '' : ' disabled') + '>${T("Composer automatiquement")}</button>'
      + '<button type="button" class="prim" id="bx-prel" title="${T("Le stock n’est retiré qu’au prélèvement. « Prélever et expédier » débite les boîtes par saison et crée une commande par boîte, qui suit la préparation habituelle.")}"' + (c.validees ? '' : ' disabled') + '>' + esc('${T("Prélever et expédier les validées")} (' + c.validees + ')') + '</button></div>'
      + '<div class="bx-comptes"><span class="bx-c"><b>' + c.abonnees + '</b> ${T("abonnées")}</span>'
      + '<span class="bx-c' + (c.aValider ? ' a' : '') + '"><b>' + c.aValider + '</b> ${T("à composer ou valider")}</span>'
      + '<span class="bx-c"><b>' + c.validees + '</b> ${T("validées")}</span>'
      + '<span class="bx-c"><b>' + esc(argent(c.aPrelever)) + '</b> ${T("à prélever (avant taxes)")}</span>'
      + (c.annuelles ? '<span class="bx-c"><b>' + c.annuelles + '</b> ${T("annuelles déjà payées")}</span>' : '')
      + (c.prelevees ? '<span class="bx-c"><b>' + c.prelevees + '</b> ${T("commandées")}</span>' : '') + '</div>';
    if (!S.boites.length) { corps.innerHTML = h + '<div class="carte vide">${T("Aucune abonnée ne reçoit cette saison.")}</div>'; return; }
    corps.innerHTML = h + '<div class="bx-grille"><div class="carte bx-liste" id="bx-liste"></div><div class="carte bx-d" id="bx-d"></div></div>';
    dessinerListe(); dessinerDetail();
  }
  function dessinerListe(){
    var z = document.getElementById('bx-liste'); if (!z) return;
    var l = S.boites, parPage = Math.max(3, Math.floor((z.clientHeight - 40) / 50));
    var pages = Math.max(1, Math.ceil(l.length / parPage)); PAGE = Math.min(PAGE, pages - 1);
    z.innerHTML = l.slice(PAGE * parPage, PAGE * parPage + parPage).map(function(b){
      var st = ST[b.statut] || [b.statut, ''];
      return '<button type="button" class="bx-l' + (b.aboId === SEL ? ' on' : '') + '" data-sel="' + esc(b.aboId) + '"><span class="bx-av">' + esc(init(b.nom)) + '</span>'
        + '<span class="n"><b>' + esc(b.nom || b.email) + '</b><span>' + esc(b.palierNom + ' · ' + (b.formule === 'annuel' ? '${T("annuel")}' : '${T("par saison")}')) + '</span></span>'
        + '<span class="pill ' + st[1] + '">' + esc(b.graceJusqu && b.statut !== 'prelevee' ? '${T("Grâce")}' : st[0]) + '</span></button>';
    }).join('')
      + (pages > 1 ? '<div class="bx-pied-l"><button type="button" data-pg="-1"' + (PAGE ? '' : ' disabled') + '>‹</button><button type="button" data-pg="1"' + (PAGE < pages - 1 ? '' : ' disabled') + '>›</button>'
        + esc((PAGE * parPage + 1) + '–' + Math.min(l.length, PAGE * parPage + parPage) + ' ${T("sur")} ' + l.length) + '</div>' : '');
  }
  function dessinerDetail(){
    var z = document.getElementById('bx-d'); var b = boite(); if (!z) return;
    if (!b) { z.innerHTML = '<div class="vide">${T("Choisissez une abonnée.")}</div>'; return; }
    var modif = b.statut === 'a_composer' || b.statut === 'proposee';
    var sur = b.surprise || {};
    var arts = b.articles || [];
    var h = '<div class="tt"><span class="bx-av">' + esc(init(b.nom)) + '</span><div class="g"><b>' + esc((b.nom || b.email) + ' · ' + b.palierNom) + '</b>'
      + '<span>' + esc(b.email + (b.formule === 'annuel' ? ' · ${T("annuel, déjà payé")}' : ' · ' + argent(b.prixSaison) + ' ${T("par saison")}')) + '</span></div>'
      + (b.orderNumber ? '<span class="pill">' + esc('${T("Commande")} ' + b.orderNumber) + '</span>' : '<span class="pill ' + ((ST[b.statut] || [])[1] || '') + '">' + esc((ST[b.statut] || [b.statut])[0]) + '</span>') + '</div>';
    if (b.erreur) h += '<div class="pill r" style="align-self:flex-start">' + esc(b.erreur) + '</div>';
    // (2026-11-23) La proposition de l'IA dit POURQUOI ; la proposition par règles le dit aussi (l'IA n'a pas répondu, ou pas de clé).
    if (arts.length && b.source === 'ia') h += '<div class="bx-ia"><b>${T("Proposée par l’IA")}</b>' + (b.raison ? '<span title="' + esc(b.raison) + '">' + esc(b.raison) + '</span>' : '') + '</div>';
    else if (arts.length && b.source === 'automatique') h += '<div class="bx-ia regle"><b>${T("Proposée par les règles")}</b><span>${T("En stock dans sa taille, jamais reçu, catégories variées.")}</span></div>';
    h += '<div class="bx-arts">' + arts.map(function(a, i){
      return '<div class="bx-a"><span class="ph">' + (a.image ? '<img src="' + esc(a.image) + '" alt="">' : '') + '</span><b title="' + esc(a.nom) + '">' + esc(a.nom) + '</b>'
        + '<span>' + esc([a.taille, a.couleur, argent(a.prix)].filter(Boolean).join(' · ')) + '</span>'
        + (modif ? '<button type="button" data-retirer="' + i + '">${T("Retirer")}</button>' : '') + '</div>';
    }).join('') + (modif && arts.length < 8 ? '<button type="button" class="bx-ajout" id="bx-ajout">${T("+ Ajouter un morceau")}</button>' : '') + '</div>';
    if (modif && CHERCHE !== null && document.__bxCherche) {
      h += '<div class="bx-chercher"><input type="search" id="bx-q" aria-label="${T("Chercher un produit en stock (nom, SKU)")}" placeholder="${T("Chercher un produit en stock (nom, SKU)")}" value="' + esc(CHERCHE) + '"><div class="bx-res">'
        + RES.slice(0, 8).map(function(p, i){ return '<button type="button" data-pris="' + i + '"><span>' + esc(p.nom + ' · ' + p.taille + (p.couleur ? ' · ' + p.couleur : '')) + '</span><b>' + esc(argent(p.prix)) + '</b></button>'; }).join('') + '</div></div>';
    }
    h += '<div class="bx-sur"><b>${T("Surprise")}</b>'
      + ['', 'rabais', 'cadeau', 'primeur'].map(function(t){ var l = { '': '${T("Aucune")}', rabais: '${T("Rabais surprise")}', cadeau: '${T("Petit cadeau")}', primeur: '${T("Accès en primeur")}' }[t];
          return '<label><input type="radio" name="bx-sur" value="' + t + '"' + ((sur.type || '') === t ? ' checked' : '') + (modif ? '' : ' disabled') + '> ' + l + '</label>'; }).join('')
      + '<input type="text" id="bx-sur-t" maxlength="140" aria-label="${T("Surprise")}" placeholder="${T("Ex. : 15 % sur la prochaine commande — SURPRISE-7K2Q")}" value="' + esc(sur.texte || '') + '"' + (modif ? '' : ' disabled') + '></div>';
    var atteinte = b.valeur >= b.valeurVisee && b.valeurVisee > 0;
    h += '<div class="bx-val"><div class="k"><span>${T("Valeur")}</span><b>' + esc(argent(b.valeur)) + '</b></div>'
      + '<div class="k"><span>${T("Visée du palier")}</span><b>' + esc(argent(b.valeurVisee)) + ' ${T("et plus")}</b></div>'
      + '<span class="pill ' + (atteinte ? 'ok' : 'a') + '">' + (atteinte ? '${T("Atteinte")}' : '${T("Sous la visée")}') + '</span>'
      + '<div class="esp">'
      + (modif ? '<button type="button" id="bx-prop">${T("Proposer avec l’IA")}</button><button type="button" id="bx-enr">${T("Enregistrer")}</button>'
          + '<button type="button" class="prim" id="bx-val"' + (b.graceJusqu ? ' disabled title="' + esc('${T("Grâce jusqu’au")} ' + b.graceJusqu) + '"' : '') + '>${T("Valider la boîte")}</button>' : '')
      + (b.statut === 'validee' ? '<button type="button" id="bx-deval">${T("Dévalider")}</button>' : '') + '</div></div>'
      /* (2026-11-23) La note générale est passée en infobulle de « Prélever et expédier » : elle faisait défiler le panneau
         (travail contrastes, 1080 × 780, polices Linux). Seule la grâce, propre à cette boîte, reste ici. */
      + (b.graceJusqu ? '<p class="bx-note">' + esc('${T("Période de grâce jusqu’au")} ' + b.graceJusqu + ' ${T(": la boîte se valide après.")}') + '</p>' : '');
    z.innerHTML = h;
  }

  function composer(b, articles){
    var t = (document.querySelector('input[name="bx-sur"]:checked') || {}).value || '';
    var sur = t ? { type: t, texte: (document.getElementById('bx-sur-t') || {}).value || '' } : null;
    return appeler('boite:composer', [{ aboId: b.aboId, envoi: ENVOI, articles: articles, surprise: sur }]);
  }
  function remplacerBoite(nb){ S.boites = S.boites.map(function(x){ return x.aboId === nb.aboId ? nb : x; }); }
  function recompter(){ charger(); }

  function dessinerReglages(){
    if (!REG) { corps.innerHTML = '<div class="carte vide">${T("Lecture des réglages…")}</div>'; return; }
    var r = REG;
    corps.innerHTML = '<div class="bx-tete"><div class="g"><span>${T("Boîte de style")}</span><h2>${T("Paliers et prix")}</h2></div>'
      + '<button type="button" id="bx-retour">${T("← Retour à la saison")}</button><button type="button" class="prim" id="bx-rg-ok">${T("Enregistrer les réglages")}</button></div>'
      + '<div class="carte bx-rg"><label class="ligne"><input type="checkbox" id="rg-actif"' + (r.actif ? ' checked' : '') + '> <b>${T("Boîte de style offerte en boutique")}</b>'
      + '<span class="bx-note">${T("Éteinte, la page de la boutique dit « bientôt » et personne ne peut s’inscrire.")}</span></label>'
      + '<table><thead><tr><th>${T("Palier")}</th><th>${T("Prix par saison ($)")}</th><th>${T("Prix annuel ($)")}</th><th>${T("Contenu")}</th><th>${T("Valeur visée ($)")}</th><th>${T("Vedette")}</th></tr></thead><tbody>'
      + r.paliers.map(function(p, i){
          return '<tr data-pal="' + i + '"><td><input data-c="nom" aria-label="${T("Palier")}" value="' + esc(p.nom) + '"></td><td><input type="number" step="1" min="1" data-c="prixSaison" aria-label="${T("Prix par saison ($)")}" value="' + esc(p.prixSaison) + '"></td>'
            + '<td><input type="number" step="1" min="1" data-c="prixAnnuel" aria-label="${T("Prix annuel ($)")}" value="' + esc(p.prixAnnuel) + '"></td><td><input data-c="morceaux" aria-label="${T("Contenu")}" value="' + esc(p.morceaux) + '"></td>'
            + '<td><input type="number" step="1" min="0" data-c="valeurVisee" aria-label="${T("Valeur visée ($)")}" value="' + esc(p.valeurVisee) + '"></td><td><input type="radio" name="rg-ved" data-c="vedette" aria-label="${T("Vedette")}"' + (p.vedette ? ' checked' : '') + '></td></tr>';
        }).join('') + '</tbody></table>'
      + '<p class="bx-note">${T("Le prix annuel ne peut pas dépasser 3 boîtes par saison : la première boîte doit rester offerte. Les abonnements déjà en cours gardent leur prix jusqu’à leur renouvellement, annoncé 30 jours avant.")}</p></div>';
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var b;
    if ((b = t.closest('[data-env]'))) {
      var l = (S && S.envois) || [], d = +b.getAttribute('data-env');
      var i = l.indexOf(ENVOI); if (i < 0) i = 0;
      var cible = l[i + d];
      if (!cible) { var dt = new Date(ENVOI + 'T12:00:00'); dt.setMonth(dt.getMonth() + 3 * d); cible = dt.toISOString().slice(0, 10); }
      ENVOI = cible; SEL = ''; PAGE = 0; charger(); return;
    }
    if ((b = t.closest('[data-sel]'))) { SEL = b.getAttribute('data-sel'); document.__bxCherche = false; dessinerListe(); dessinerDetail(); return; }
    if ((b = t.closest('[data-pg]'))) { PAGE += +b.getAttribute('data-pg'); dessinerListe(); return; }
    var bx = boite();
    if (t.id === 'bx-ajout') { document.__bxCherche = true; CHERCHE = ''; RES = []; dessinerDetail(); var q = document.getElementById('bx-q'); if (q) q.focus(); return; }
    if ((b = t.closest('[data-pris]')) && bx) {
      var p = RES[+b.getAttribute('data-pris')]; if (!p) return;
      document.__bxCherche = false;
      composer(bx, (bx.articles || []).concat([p])).then(function(r){ if (!r.ok) { dire(expliquer(r), 'err'); return; } remplacerBoite(r.boite); dessinerDetail(); dessinerListe(); });
      return;
    }
    if ((b = t.closest('[data-retirer]')) && bx) {
      var n = +b.getAttribute('data-retirer');
      composer(bx, (bx.articles || []).filter(function(x, i){ return i !== n; })).then(function(r){ if (!r.ok) { dire(expliquer(r), 'err'); return; } remplacerBoite(r.boite); dessinerDetail(); });
      return;
    }
    if (t.id === 'bx-enr' && bx) { composer(bx, bx.articles || []).then(function(r){ if (!r.ok) { dire(expliquer(r), 'err'); return; } remplacerBoite(r.boite); dessinerDetail(); dire('${T("Boîte enregistrée.")}', 'bon'); }); return; }
    if (t.id === 'bx-prop' && bx) {
      appeler('boite:proposer', [{ aboId: bx.aboId, envoi: ENVOI }]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        remplacerBoite(r.boite); dessinerDetail(); dessinerListe();
        dire(r.boite.articles.length ? '${T("Proposition prête : vérifiez-la, changez au besoin, puis validez.")}' : '${T("Aucun produit en stock ne convient (taille, déjà reçus). Ajoutez des morceaux à la main.")}', r.boite.articles.length ? 'bon' : 'att');
      });
      return;
    }
    if (t.id === 'bx-val' && bx) { appeler('boite:valider', [{ aboId: bx.aboId, envoi: ENVOI }]).then(function(r){ if (!r.ok) { dire(expliquer(r), 'err'); return; } dire('${T("Boîte validée.")}', 'bon'); recompter(); }); return; }
    if (t.id === 'bx-deval' && bx) { appeler('boite:devalider', [{ aboId: bx.aboId, envoi: ENVOI }]).then(function(r){ if (!r.ok) { dire(expliquer(r), 'err'); return; } recompter(); }); return; }
    if (t.id === 'bx-auto') {
      var aFaire = S.boites.filter(function(x){ return x.statut === 'a_composer' || (x.statut === 'proposee' && !(x.articles || []).length); });
      if (!aFaire.length) { dire('${T("Toutes les boîtes ont déjà une proposition.")}', 'att'); return; }
      t.disabled = true; dire('${T("Composition en cours…")}');
      var k = 0;
      var suite = function(){
        if (k >= aFaire.length) { t.disabled = false; dire(aFaire.length + ' ${T("boîte(s) proposée(s). Vérifiez-les avant de valider.")}', 'bon'); recompter(); return; }
        appeler('boite:proposer', [{ aboId: aFaire[k++].aboId, envoi: ENVOI }]).then(suite);
      };
      suite(); return;
    }
    if (t.id === 'bx-prel') {
      var n2 = S.compteurs.validees;
      szConfirmer({ danger: true, titre: '${T("Prélever et expédier les boîtes validées")}',
        texte: n2 + ' ${T("boîte(s) : les abonnées par saison sont débitées maintenant, et une commande est créée pour chaque boîte (stock retiré).")}',
        oui: '${T("Prélever et expédier")}' }).then(function(ok){
        if (!ok) return;
        dire('${T("Prélèvement en cours…")}');
        appeler('boite:prelever', [{ envoi: ENVOI }]).then(function(r){
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          var res = r.resultats || [], bons = res.filter(function(x){ return x.ok; }).length, mauvais = res.length - bons;
          dire(bons + ' ${T("commande(s) créée(s)")}' + (mauvais ? ' · ' + mauvais + ' ${T("refus (voir chaque boîte)")}' : ''), mauvais ? 'att' : 'bon');
          recompter();
        });
      });
      return;
    }
    if (t.id === 'bx-rg') { VUE = 'reglages'; REG = null; dessinerReglages(); appeler('boite:reglages').then(function(r){ if (!r.ok) { dire(expliquer(r), 'err'); return; } REG = r.reglages; dessinerReglages(); }); return; }
    if (t.id === 'bx-retour') { VUE = 'saison'; dessiner(); return; }
    if (t.id === 'bx-rg-ok' && REG) {
      var pals = REG.paliers.map(function(p, i){
        var tr = corps.querySelector('tr[data-pal="' + i + '"]'), v = function(c){ var e = tr.querySelector('[data-c="' + c + '"]'); return e ? (e.type === 'radio' ? e.checked : e.value) : ''; };
        return Object.assign({}, p, { nom: v('nom'), prixSaison: +v('prixSaison'), prixAnnuel: +v('prixAnnuel'), morceaux: v('morceaux'), valeurVisee: +v('valeurVisee'), vedette: v('vedette') });
      });
      var nouv = Object.assign({}, REG, { actif: document.getElementById('rg-actif').checked, paliers: pals });
      var go = function(){
        appeler('boite:reglagesEcrire', [nouv]).then(function(r){
          if (!r.ok) { dire(expliquer(r) + (r.max ? ' (max ' + r.max + ' $)' : ''), 'err'); return; }
          REG = r.reglages; dessinerReglages(); dire('${T("Réglages enregistrés.")}', 'bon');
        });
      };
      if (nouv.actif && !REG.actif) {
        szConfirmer({ titre: '${T("Offrir la boîte de style en boutique")}', texte: '${T("La page de la boutique acceptera les inscriptions et les paiements. Vérifiez les prix et l’entente avant.")}', oui: '${T("Allumer")}' })
          .then(function(ok){ if (ok) go(); });
      } else go();
      return;
    }
  });
  corps.addEventListener('input', function(ev){
    if (ev.target.id !== 'bx-q') return;
    CHERCHE = ev.target.value;
    var bx = boite();
    clearTimeout(window.__bxT);
    window.__bxT = setTimeout(function(){
      appeler('boite:produits', [CHERCHE, bx ? bx.aboId : '']).then(function(r){
        RES = (r && r.ok) ? r.produits : [];
        var z = document.querySelector('.bx-res');
        if (z) z.innerHTML = RES.slice(0, 8).map(function(p, i){ return '<button type="button" data-pris="' + i + '"><span>' + esc(p.nom + ' · ' + p.taille + (p.couleur ? ' · ' + p.couleur : '')) + '</span><b>' + esc(argent(p.prix)) + '</b></button>'; }).join('');
      });
    }, 220);
  });

  window.szActualiser = function(){ if (VUE === 'saison') charger(); };
  window.szRevenir = function(){ if (VUE === 'saison') charger(); };
  window.addEventListener('resize', function(){ clearTimeout(window.__bxR); window.__bxR = setTimeout(function(){ if (VUE === 'saison' && S) dessinerListe(); }, 120); });
  charger();
})();
</script></body></html>`;
}

module.exports = { pageBoite };
