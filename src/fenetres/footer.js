'use strict';

/*
 * FENÊTRE « PIED DE PAGE » — NATIVE (Configuration, palier 5, 2e onglet)
 * =============================================================================
 * Les coordonnées de la boutique et les numéros de taxes affichés au pied de
 * page (et repris sur les documents). Aucun secret.
 *
 * ⚠ AUCUNE RÈGLE ICI. Lecture `config:footer:donnees`, écriture
 * `config:footer:ecrire` ; le cœur `Admin._footerEcrire` valide et persiste. Le
 * droit d'écriture (`config:edit`) est décidé au cœur, jamais dans la fenêtre.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠⚠ On ne traduit QUE ce qui se lit ICI — jamais l adresse, le
   courriel ni les numeros de taxes, qui s affichent au bas de CHAQUE page du
   site (voir src/langue/footer.js). */
const T = require('../langue').tr('footer');

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
/* ⚠ LA ZONE EST PLEINE PAGE, ET LES CARTES DOIVENT LA REMPLIR (2026-08-10) :
   plafonnees en largeur, elles laissaient la moitie de l ecran vide une fois la
   fenetre ANCREE. On repartit en colonnes qui se replient seules. */
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:grid;grid-template-columns:repeat(auto-fit,minmax(28rem,1fr));
  gap:1rem;align-content:start}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:1rem 1.1rem;margin:0;min-width:0}
.pleine{grid-column:1/-1}
.carte h2{margin:0 0 .8rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
.ch{margin:0 0 .8rem}
.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.25rem;font-size:.78rem;color:var(--tx2)}
.ch label .pt{color:var(--tx3);font-size:.72rem}
.ch input{width:100%;box-sizing:border-box;font:inherit;color:var(--tx);background:var(--f-champ);
  border:1px solid var(--v12);border-radius:8px;padding:.42rem .55rem}
.ch input:focus{outline:none;border-color:#c9a97e}
.deux{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
@media (max-width:560px){.deux{grid-template-columns:1fr}}
.apercu{background:var(--f-champ);border:1px solid var(--v07);border-radius:9px;
  padding:.6rem .75rem;font-size:.82rem;color:var(--tx2);line-height:1.5}
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
.vide{padding:1.1rem .6rem;text-align:center;color:var(--tx2);font-size:.82rem}
/* ⚠ LE BANDEAU DE LECTURE SEULE VIT HORS DE LA GRILLE. Place dedans avec
   << grid-column:1/-1 >>, il OCCUPE la derniere piste : auto-fit ne la voit plus
   vide, ne la replie plus, et les cartes cessent de remplir la largeur (releve
   au rendu le 2026-08-10). */
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;
  padding:.5rem .7rem;font-size:.78rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageFooter() {
  return `${TETE()}
<title>${T("Pied de page — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.pied}</span><h1>${T("Pied de page")}</h1></div>
<div class="ro" id="ro" hidden>${T("Lecture seule : vous pouvez consulter le pied de page, pas le modifier.")}</div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-save" disabled>${T("Enregistrer")}</button></div>
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
  var bsave = document.getElementById('b-save');
  var D = null, RO = false, MARQUE = 'SANDRIZA', ANNEE = 2026;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès à la configuration.")}',
    lecture_seule:      '${T("Votre rôle est en lecture seule : le pied de page ne peut pas être modifié.")}',
    indisponible:       '${T("La configuration n’est pas prête dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    nuage:              '${T("L’enregistrement dans le nuage a échoué. Réessayez.")}',
    echec:              '${T("L’opération a échoué.")}'
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

  function champ(id, lib, val, pt, type){
    return '<div class="ch"><label for="' + id + '">' + esc(lib) + (pt ? ' <span class="pt">' + esc(pt) + '</span>' : '')
      + '</label><input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(val || '') + '"'
      + (RO ? ' disabled' : '') + '></div>';
  }

  function dessiner(){
    var c = D || {};
    var h = [];
    var av = document.getElementById('ro');
    if (av) av.hidden = !RO;
    h.push('<div class="carte"><h2>${T("Colonne marque")}</h2>');
    h.push(champ('fc-tagline', '${T("Tagline")}', c.tagline));
    h.push(champ('fc-address', '${T("Adresse complète (FR)")}', c.address));
    h.push(champ('fc-address-en', '${T("Adresse complète (EN)")}', c.addressEN, '${T("affichée en mode anglais")}'));
    h.push('<div class="deux">' + champ('fc-email', '${T("Courriel de contact")}', c.email, '', 'email')
      + champ('fc-phone', '${T("Téléphone")}', c.phone) + '</div>');
    h.push('</div>');
    h.push('<div class="carte"><h2>${T("Copyright et numéros de taxes")}</h2>');
    h.push('<div class="deux">' + champ('fc-tps', '${T("Numéro TPS")}', c.tps, '${T("ex. 123456789 RT0001")}')
      + champ('fc-tvq', '${T("Numéro TVQ")}', c.tvq, '${T("ex. 9876543210 TQ0001")}') + '</div>');
    h.push('<div class="apercu" id="apercu"></div></div>');
    corps.innerHTML = h.join('');
    // Aperçu du copyright, mis à jour à la frappe.
    function maj(){
      var tps = (document.getElementById('fc-tps') || {}).value || '';
      var tvq = (document.getElementById('fc-tvq') || {}).value || '';
      var el = document.getElementById('apercu');
      if (el) el.textContent = '${T("Aperçu : © ")}' + ANNEE + ' ' + MARQUE + '${T(". Tous droits réservés.")}'
        + (tps ? ' | TPS: ' + tps : '') + (tvq ? ' | TVQ: ' + tvq : '');
    }
    ['fc-tps', 'fc-tvq'].forEach(function(id){
      var e = document.getElementById(id); if (e) e.oninput = maj;
    });
    maj();
    bsave.disabled = RO;
  }

  function lire(){
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    return { tagline: v('fc-tagline'), address: v('fc-address'), addressEN: v('fc-address-en'),
             email: v('fc-email'), phone: v('fc-phone'), tps: v('fc-tps'), tvq: v('fc-tvq') };
  }

  function enregistrer(){
    if (RO) return;
    bsave.disabled = true;
    dire('${T("Enregistrement…")}');
    appeler('config:footer:ecrire', [lire()]).then(function(r){
      bsave.disabled = false;
      if (r && r.ok) { D = r.cfg || D; dire('${T("Pied de page enregistré.")}', 'bon'); }
      else { dire(expliquer(r), 'err'); }
    });
  }
  bsave.onclick = enregistrer;

  function charger(){
    dire('${T("Lecture…")}');
    appeler('config:footer:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte pleine"><div class="vide m-' + ((r && r.motif) || 'echec') + '">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r.cfg || {};
      RO = !r.peutModifier;
      MARQUE = r.marque || 'SANDRIZA';
      ANNEE = r.annee || ANNEE;
      dessiner();
      dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageFooter };
