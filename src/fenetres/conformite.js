'use strict';

/*
 * FENÊTRE « CONFORMITÉ INTERNATIONALE » — NATIVE (#117)
 * =============================================================================
 * Le registre des mandats par pays de l'Union : la personne responsable établie
 * dans l'Union, le guichet IOSS, et les immatriculations de responsabilité
 * élargie du producteur (emballages, textiles).
 *
 * ⚠⚠ AUCUNE RÈGLE DE CONFORMITÉ ICI. Ni les exigences, ni leur gravité, ni les
 * bases légales : tout vient de `config:conformite:donnees`, qui les tient de
 * `conformite.js`. La fenêtre ne fait que montrer et transmettre — même
 * discipline que la fenêtre des taxes. Une règle recopiée dans un écran finit
 * par diverger de celle qui décide, et c'est l'écran qu'on croit.
 *
 * ⚠ CE QUE CET ÉCRAN PEUT FERMER. Un pays sans mandat disparaît de la caisse et
 * la commande y est refusée. C'est voulu — en Allemagne, distribuer sans
 * immatriculation à l'emballage est interdit, pas seulement passible d'amende.
 * La dérogation existe pour le cas « dossier déposé, en attente », et elle
 * EXIGE un motif : un contournement anonyme rendrait une case verte
 * indiscernable d'une adhésion réelle.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('conformite');

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
.tete .rev{font-size:.73rem;color:var(--tx2);margin-left:auto}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;
  padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:1rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:1rem 1.1rem;min-width:0}
.carte h2{margin:0 0 .2rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
.carte .sous{margin:0 0 .9rem;font-size:.78rem;color:var(--tx3)}
.avis{border-radius:9px;padding:.5rem .7rem;font-size:.78rem;margin:0 0 .9rem;
  border:1px solid rgba(240,180,80,.3);background:rgba(200,140,40,.09);color:var(--tx-or2)}
.avis.calme{border-color:rgba(120,160,220,.28);background:rgba(80,120,190,.1);color:var(--tx2)}
.avis.dur{border-color:rgba(248,113,113,.35);background:rgba(190,60,60,.12);color:var(--tx-err)}
/* ⚠ REPRISE DU MODE JOUR, ET LE CHIFFRE EST MESURE, PAS CHOISI. Sur le fond
   de l avis (#eedcd7 une fois le voile rouge pose sur la page claire),
   var(--tx-err) rend #ab4e4e : ratio 4.03, sous le seuil. Assombri du
   MINIMUM necessaire (92 % de la teinte d origine) : 4.59. */
html.jour .avis.dur{color:#9d4848}
table{width:100%;border-collapse:collapse;font-size:.86rem}
th{text-align:left;padding:.35rem .5rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);border-bottom:1px solid var(--v12)}
td{padding:.4rem .5rem;border-bottom:1px solid var(--v05);vertical-align:middle}
tr:last-child td{border-bottom:none}
td.pays{font-weight:700;white-space:nowrap;width:14rem}
td.pays .cc{font-weight:400;color:var(--tx3);font-size:.75rem;margin-left:.35rem}
td.dr{text-align:right;white-space:nowrap}
tr.sel td{background:var(--v05)}
.etat{display:inline-flex;align-items:center;gap:.35rem;font-size:.78rem;white-space:nowrap}
.pastille{width:.55rem;height:.55rem;border-radius:50%;flex:0 0 auto}
.p-pret{background:#4ade80}.p-avertir{background:#fbbf24}
.p-bloque{background:#f87171}.p-derogation{background:#a78bfa}
.t-pret{color:var(--tx-ok)}.t-avertir{color:var(--tx-jaune)}
.t-bloque{color:var(--tx-err)}.t-derogation{color:var(--tx)}
input[type=text],input[type=date]{font:inherit;color:var(--tx);background:var(--f-champ);
  border:1px solid var(--v12);border-radius:7px;padding:.25rem .4rem;width:100%}
input:focus{outline:none;border-color:#c9a97e}
input:disabled{opacity:.55}
label.ch{display:block;font-size:.72rem;color:var(--tx2);margin:0 0 .18rem}
.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:.7rem}
.manque{border-left:3px solid var(--v16);padding:.45rem .7rem;margin:.45rem 0;
  background:var(--v03);border-radius:0 8px 8px 0}
.manque.bloquant{border-left-color:#f87171}
.manque.avertir{border-left-color:#fbbf24}
.manque .q{font-weight:700;font-size:.84rem}
.manque .b{font-size:.73rem;color:var(--tx3);margin-top:.2rem}
.manque .p{font-size:.78rem;color:var(--tx2);margin-top:.3rem;line-height:1.4}
.gestes{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.9rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.4rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
button.pt{font-size:.76rem;padding:.22rem .5rem}
button.dgr{color:var(--tx-err);border-color:rgba(248,113,113,.4)}
.vide{padding:1rem .6rem;text-align:center;color:var(--tx2);font-size:.82rem}
.coche{display:inline-flex;align-items:center;gap:.4rem;font-size:.82rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* ⚠ LE PAYS OUVERT EST UN PARAMÈTRE. Le panneau d'un pays ne s'atteint qu'au
   CLIC : sans cela, aucun jeu d'essai ne le dessine et il resterait hors des
   gardes (contraste, libellés, traduction). Même raison qu'aux taxes. */
function pageConformite(ouverture) {
  const paysDepart = JSON.stringify(String(ouverture || ''));
  return `${TETE()}
<title>${T("Conformité internationale — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.shipping}</span><h1>${T("Conformité internationale")}</h1>
  <span class="rev" id="rev"></span></div>
<div class="ro" id="ro" hidden>${T("Lecture seule : vous pouvez consulter le registre, pas le modifier.")}</div>
<div class="corps" id="corps"><div class="carte"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-save" disabled>${T("Enregistrer le registre")}</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

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
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var rev = document.getElementById('rev');
  var bsave = document.getElementById('b-save');
  var D = null, RO = false, OCCUPE = false, OUVERT = ${paysDepart};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès à la configuration.")}',
    lecture_seule:      '${T("Votre rôle est en lecture seule : le registre ne peut pas être modifié.")}',
    indisponible:       '${T("La configuration n’est pas prête dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    nuage:              '${T("Registre NON enregistré. Rien n’a été modifié — réessayez.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    if (m === 'concurrence') {
      return '${T("Registre NON enregistré : il a changé")}'
        + (r.par ? '${T(" par ")}' + esc(r.par) : '')
        + (r.le ? ' (' + esc(r.le) + ')' : '')
        + '${T(" pendant votre saisie. Le registre affiché vient d’être rechargé — refaites vos changements.")}';
    }
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

  var ETATS = {
    pret:       '${T("Prêt")}',
    avertir:    '${T("À confirmer")}',
    bloque:     '${T("Fermé")}',
    derogation: '${T("Dérogation")}'
  };
  var FLUX_NOMS = {
    emballages: '${T("Emballages")}',
    textiles:   '${T("Textiles, linge et chaussures")}',
    deee:       '${T("Équipements électriques (DEEE)")}',
    piles:      '${T("Piles et accumulateurs")}'
  };

  /* Le pays ouvert, dans la copie de travail. On cree l entree a la volee :
     un pays dont on n a rien saisi n existe pas encore dans le registre. */
  function entree(cc){
    if (!D || !D.registre) return null;
    if (!D.registre.pays) D.registre.pays = {};
    if (!D.registre.pays[cc]) {
      D.registre.pays[cc] = { mandataire: '', notes: '', verifieLe: '',
                              mandats: [], derogation: { active: false, motif: '', parQui: '', le: '' } };
    }
    var p = D.registre.pays[cc];
    if (!p.mandats) p.mandats = [];
    if (!p.derogation) p.derogation = { active: false, motif: '', parQui: '', le: '' };
    return p;
  }

  function champ(id, lbl, val, type){
    return '<div><label class="ch" for="' + esc(id) + '">' + esc(lbl) + '</label>'
      + '<input type="' + (type || 'text') + '" id="' + esc(id) + '" value="' + esc(val || '')
      + '" aria-label="' + esc(lbl) + '"' + (RO ? ' disabled' : '') + '></div>';
  }

  function htmlIdentite(){
    var r = D.registre || {};
    var ru = r.responsableUE || {}, io = r.ioss || {};
    return '<div class="carte"><h2>${T("Identité européenne")}</h2>'
      + '<p class="sous">${T("Ces deux blocs valent pour les 27 États membres : sans eux, aucun pays de l’Union ne s’ouvre.")}</p>'
      + '<div class="grille">'
      + champ('r-nom', '${T("Personne responsable dans l’Union — nom")}', ru.nom)
      + champ('r-adr', '${T("Personne responsable — adresse complète")}', ru.adresse)
      + champ('r-cou', '${T("Personne responsable — courriel")}', ru.courriel)
      + champ('r-tel', '${T("Personne responsable — téléphone")}', ru.telephone)
      + '</div><div class="grille" style="margin-top:.7rem">'
      + champ('i-num', '${T("Numéro IOSS (guichet TVA à l’importation)")}', io.numero)
      + champ('i-int', '${T("Intermédiaire établi dans l’Union")}', io.intermediaire)
      + '</div></div>';
  }

  function htmlEcheances(){
    var e = (D && D.echeances) || [];
    if (!e.length) return '';
    var passees = e.filter(function(x){ return x.expire; }).length;
    var l = e.map(function(x){
      return '<li>' + esc(x.nom) + ' — ' + esc(FLUX_NOMS[x.flux] || x.flux)
        + ' — ' + esc(x.valideJusqu) + (x.expire ? ' ${T("(échue)")}' : '') + '</li>';
    }).join('');
    return '<div class="avis ' + (passees ? 'dur' : '') + '">'
      + (passees ? '${T("Des adhésions sont ÉCHUES. Une adhésion expirée vaut une adhésion absente : le pays se referme.")}'
                 : '${T("Des adhésions arrivent à échéance dans les quatre prochains mois.")}')
      + '<ul style="margin:.4rem 0 0;padding-left:1.1rem">' + l + '</ul></div>';
  }

  function htmlTableau(){
    var r = (D && D.resume) || [];
    var lignes = r.map(function(l){
      var sel = (l.cc === OUVERT) ? ' class="sel"' : '';
      return '<tr' + sel + '><td class="pays"><span class="rf-nom">' + esc(l.nom) + '</span>'
        + '<span class="cc">' + esc(l.cc) + '</span></td>'
        /* La pastille a point de la refonte (2026-09-25) : une couleur = un sens —
           le violet de la derogation devient le bleu d information. */
        + '<td><span class="rf-pill ' + ({ pret: 'vert', avertir: 'ambre', bloque: 'rouge', derogation: 'bleu' }[l.etat] || '')
        + '">' + esc(ETATS[l.etat] || l.etat) + '</span></td>'
        + '<td>' + (l.bloquants ? esc(String(l.bloquants)) : '—') + '</td>'
        + '<td>' + (l.avertissements ? esc(String(l.avertissements)) : '—') + '</td>'
        + '<td>' + (l.mandats ? esc(String(l.mandats)) : '—') + '</td>'
        + '<td class="dr"><button class="pt" data-ouvrir="' + esc(l.cc) + '" aria-label="'
        + esc('${T("Ouvrir le dossier de ")}' + l.nom) + '">'
        + ((l.cc === OUVERT) ? '${T("Fermer")}' : '${T("Ouvrir")}') + '</button></td></tr>';
    }).join('');
    return '<div class="carte"><h2>${T("Les 27 États membres")}</h2>'
      + '<p class="sous">${T("Un pays fermé disparaît du choix à la caisse et la commande y est refusée.")}</p>'
      + '<table><thead><tr><th>${T("Pays")}</th><th>${T("État")}</th>'
      + '<th>${T("Bloquants")}</th><th>${T("À confirmer")}</th><th>${T("Mandats")}</th>'
      + '<th class="dr">${T("Dossier")}</th></tr></thead><tbody>' + lignes + '</tbody></table>'
      /* Le pied ferme le tableau et porte l export (2026-09-24). ⚠ IL VA DANS
         LA CARTE DU TABLEAU, pas au bas du corps : cet ecran empile quatre
         cartes (echeances, identite, tableau, dossier), et un pied pose tout
         en bas fermerait le DOSSIER d un pays en ayant l air de compter les
         pays. Un pied ferme la liste a laquelle il appartient. */
      /* ⚠ << PAYS >> EST INVARIABLE EN FRANCAIS, PAS EN ANGLAIS. Un
         dictionnaire est classe par la phrase FRANCAISE : deux entrees
         << pays >> ne peuvent pas coexister, et une seule sortirait
         << 1 countries >>. Le singulier porte donc son article
         (<< un pays >> / << one country >>), le pluriel prend le chiffre. */
      + szPied(
          (r.length > 1 ? (r.length + ' ${T("pays")}') : '${T("un pays")}'),
          '<button class="mini" id="cf-exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>')
      + '</div>';
  }

  function htmlManques(cc){
    var d = (D && D.detail && D.detail[cc]) || [];
    if (!d.length) return '<div class="avis calme">${T("D’après ce que le registre détient, rien ne s’oppose à l’expédition dans ce pays.")}</div>';
    return d.map(function(m){
      return '<div class="manque ' + esc(m.gravite) + '">'
        + '<div class="q">' + esc(m.quoi)
        + (m.motif === 'expire' ? ' ${T("— adhésion échue le ")}' + esc(m.valideJusqu) : '')
        + '</div>'
        + '<div class="p">' + esc(m.pourquoi) + '</div>'
        + '<div class="b">' + esc(m.base) + '</div></div>';
    }).join('');
  }

  function htmlMandats(cc, p){
    if (!p.mandats.length) return '<div class="vide">${T("Aucun mandat enregistré pour ce pays.")}</div>';
    var opts = Object.keys(FLUX_NOMS).map(function(f){ return f; });
    return p.mandats.map(function(m, i){
      var sel = opts.map(function(f){
        return '<option value="' + esc(f) + '"' + (m.flux === f ? ' selected' : '') + '>'
          + esc(FLUX_NOMS[f]) + '</option>';
      }).join('');
      return '<div class="grille" style="margin-bottom:.6rem;align-items:end">'
        + '<div><label class="ch" for="m-f-' + i + '">${T("Filière")}</label>'
        + '<select id="m-f-' + i + '" data-m="' + i + '" data-k="flux" aria-label="'
        + esc('${T("Filière du mandat ")}' + (i + 1)) + '"' + (RO ? ' disabled' : '')
        + ' style="font:inherit;color:var(--tx);background:var(--f-champ);border:1px solid var(--v12);border-radius:7px;padding:.25rem .4rem;width:100%">'
        + sel + '</select></div>'
        + '<div><label class="ch" for="m-o-' + i + '">${T("Organisme")}</label>'
        + '<input type="text" id="m-o-' + i + '" data-m="' + i + '" data-k="organisme" value="'
        + esc(m.organisme) + '" aria-label="' + esc('${T("Organisme du mandat ")}' + (i + 1)) + '"'
        + (RO ? ' disabled' : '') + '></div>'
        + '<div><label class="ch" for="m-n-' + i + '">${T("Numéro d’immatriculation")}</label>'
        + '<input type="text" id="m-n-' + i + '" data-m="' + i + '" data-k="numero" value="'
        + esc(m.numero) + '" aria-label="' + esc('${T("Numéro du mandat ")}' + (i + 1)) + '"'
        + (RO ? ' disabled' : '') + '></div>'
        + '<div><label class="ch" for="m-v-' + i + '">${T("Valide jusqu’au")}</label>'
        + '<input type="date" id="m-v-' + i + '" data-m="' + i + '" data-k="valideJusqu" value="'
        + esc(m.valideJusqu) + '" aria-label="' + esc('${T("Échéance du mandat ")}' + (i + 1)) + '"'
        + (RO ? ' disabled' : '') + '></div>'
        + '<div><button class="pt dgr" data-retirer="' + i + '" aria-label="'
        + esc('${T("Retirer le mandat ")}' + (i + 1)) + '"' + (RO ? ' disabled' : '') + '>'
        + '${T("Retirer")}</button></div></div>';
    }).join('');
  }

  function htmlDossier(){
    if (!OUVERT) return '';
    var p = entree(OUVERT);
    var nom = (D.paysNoms && D.paysNoms[OUVERT]) || OUVERT;
    var der = p.derogation;
    return '<div class="carte"><h2>' + esc(nom) + '</h2>'
      + '<p class="sous">${T("Ce qui manque, la base légale qui l’exige, et les mandats détenus.")}</p>'
      + htmlManques(OUVERT)
      + '<h2 style="margin-top:1rem">${T("Mandats détenus")}</h2>'
      + htmlMandats(OUVERT, p)
      + '<div class="gestes"><button class="pt" id="b-mandat" aria-label="${T("Ajouter un mandat")}"'
      + (RO ? ' disabled' : '') + '>${T("Ajouter un mandat")}</button></div>'
      + '<div class="grille" style="margin-top:.9rem">'
      + champ('p-mandataire', '${T("Mandataire dans le pays")}', p.mandataire)
      + champ('p-verifie', '${T("Vérifié le")}', p.verifieLe, 'date')
      + '</div>'
      + '<h2 style="margin-top:1rem">${T("Dérogation")}</h2>'
      + '<p class="sous">${T("Laisse passer un pays fermé — pour un dossier déposé et en attente. Le motif est obligatoire : sans lui, la dérogation ne vaut rien, et une case verte deviendrait indiscernable d’une adhésion réelle.")}</p>'
      + '<label class="coche"><input type="checkbox" id="d-active"' + (der.active ? ' checked' : '')
      + (RO ? ' disabled' : '') + ' aria-label="${T("Activer la dérogation pour ce pays")}">'
      + '<span>${T("Activer la dérogation")}</span></label>'
      + '<div class="grille" style="margin-top:.6rem">'
      + champ('d-motif', '${T("Motif (obligatoire)")}', der.motif)
      + champ('d-qui', '${T("Posée par")}', der.parQui)
      + champ('d-le', '${T("Posée le")}', der.le, 'date')
      + '</div></div>';
  }

  function dessiner(){
    if (!D) return;
    RO = !D.peutModifier;
    document.getElementById('ro').hidden = !RO;
    bsave.disabled = RO || OCCUPE;
    rev.textContent = D.intlLivraison ? '${T("Livraison internationale : active")}'
                                      : '${T("Livraison internationale : éteinte")}';
    corps.innerHTML = htmlEcheances() + htmlIdentite() + htmlTableau() + htmlDossier();
    brancher();
  }

  function brancher(){
    /* ⚠⚠ LES COMPTES PARTENT EN NOMBRES, ET LE TIRET DEVIENT ZERO. A l ecran,
       un pays sans bloquant affiche << — >> : c est lisible, et ca evite une
       colonne de zeros. Dans un tableur, ce tiret n est ni triable ni
       additionnable — << — >> se classe avec le texte, et une somme de
       bloquants devient impossible. C est exactement pour COMPTER qu on sort
       ce fichier : 0 est la bonne valeur.
       ⚠ LE CODE DU PAYS PREND SA PROPRE COLONNE. A l ecran il est colle au nom
       dans la meme cellule ; dans un fichier c est la cle sur laquelle on
       rapproche deux tableaux (transporteur, comptable, registre).
       ⚠ CE FICHIER EST LE RESUME, PAS LE DETAIL. Ce qui manque pays par pays
       (D.detail) est d une AUTRE forme — un manque a plusieurs lignes par
       pays. Les melanger demanderait des cellules vides partout, et une
       cellule vide ne dit pas si la donnee manque ou ne s applique pas. */
    var exc = document.getElementById('cf-exporter');
    if (exc) exc.onclick = function(){
      var r = (D && D.resume) || [];
      var lignes = r.map(function(l){
        return [l.nom || '', l.cc || '', (ETATS[l.etat] || l.etat || ''),
          Number(l.bloquants || 0), Number(l.avertissements || 0), Number(l.mandats || 0)];
      });
      if (!lignes.length) { dire('${T("Rien à exporter.")}', 'att'); return; }
      var csv = szCSV(['${T("Pays")}', '${T("Code")}', '${T("État")}',
        '${T("Bloquants")}', '${T("À confirmer")}', '${T("Mandats")}'], lignes);
      szExporter('conformite-' + new Date().toISOString().slice(0, 10) + '.csv', csv,
        '${T("Le tableau de conformité")}');
    };

    Array.prototype.forEach.call(corps.querySelectorAll('[data-ouvrir]'), function(b){
      b.addEventListener('click', function(){
        var cc = b.getAttribute('data-ouvrir');
        OUVERT = (OUVERT === cc) ? '' : cc;
        lireIdentite(); dessiner();
      });
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-retirer]'), function(b){
      b.addEventListener('click', function(){
        if (RO) return;
        var p = entree(OUVERT);
        p.mandats.splice(parseInt(b.getAttribute('data-retirer'), 10), 1);
        lireIdentite(); dessiner();
      });
    });
    var bm = document.getElementById('b-mandat');
    if (bm) bm.addEventListener('click', function(){
      if (RO) return;
      var p = entree(OUVERT);
      p.mandats.push({ flux: 'emballages', organisme: '', numero: '', valideJusqu: '' });
      lireIdentite(); dessiner();
    });
  }

  /* Ramasse la saisie dans la copie de travail. ⚠ APPELE AVANT CHAQUE REDESSIN :
     sans cela, cliquer << Ajouter un mandat >> effacerait ce qui vient d etre
     tape dans les champs — le genre de perte qu on met du temps a imputer au
     bouton, parce qu on croit avoir mal tape. */
  function lireIdentite(){
    if (!D || !D.registre) return;
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : undefined; };
    var r = D.registre;
    if (!r.responsableUE) r.responsableUE = {};
    if (!r.ioss) r.ioss = {};
    var m = { 'r-nom': ['responsableUE', 'nom'], 'r-adr': ['responsableUE', 'adresse'],
              'r-cou': ['responsableUE', 'courriel'], 'r-tel': ['responsableUE', 'telephone'],
              'i-num': ['ioss', 'numero'], 'i-int': ['ioss', 'intermediaire'] };
    Object.keys(m).forEach(function(id){
      var x = v(id); if (x !== undefined) r[m[id][0]][m[id][1]] = x;
    });
    if (!OUVERT) return;
    var p = entree(OUVERT);
    var pm = v('p-mandataire'); if (pm !== undefined) p.mandataire = pm;
    var pv = v('p-verifie'); if (pv !== undefined) p.verifieLe = pv;
    var da = document.getElementById('d-active');
    if (da) p.derogation.active = !!da.checked;
    var dm = v('d-motif'); if (dm !== undefined) p.derogation.motif = dm;
    var dq = v('d-qui'); if (dq !== undefined) p.derogation.parQui = dq;
    var dl = v('d-le'); if (dl !== undefined) p.derogation.le = dl;
    p.mandats.forEach(function(md, i){
      ['flux', 'organisme', 'numero', 'valideJusqu'].forEach(function(k){
        var e = corps.querySelector('[data-m="' + i + '"][data-k="' + k + '"]');
        if (e) md[k] = e.value;
      });
    });
  }

  function charger(){
    OCCUPE = true;
    return appeler('config:conformite:donnees').then(function(r){
      OCCUPE = false;
      if (!r.ok) { corps.innerHTML = '<div class="carte"><div class="vide">' + esc(expliquer(r)) + '</div></div>';
                   bsave.disabled = true; dire(expliquer(r), 'err'); return; }
      D = r; dessiner(); dire('');
    });
  }

  bsave.addEventListener('click', function(){
    if (RO || OCCUPE || !D) return;
    lireIdentite();
    OCCUPE = true; bsave.disabled = true; dire('${T("Enregistrement…")}', 'att');
    appeler('config:conformite:ecrire', [D.registre]).then(function(r){
      OCCUPE = false;
      if (r.ok) { D = r; dessiner(); dire('${T("Registre enregistré.")}', 'bon'); return; }
      /* ⚠ SUR UNE COLLISION, LE COEUR RENVOIE LE REGISTRE COURANT : on redessine
         avec LUI. Annoncer un echec en gardant a l ecran ce qui n a pas ete
         ecrit ferait croire que la saisie tient. */
      if (r.registre) { D = r; dessiner(); }
      else bsave.disabled = RO;
      dire(expliquer(r), 'err');
    });
  });

  charger();
})();
</script></body></html>`;
}

module.exports = { pageConformite };
