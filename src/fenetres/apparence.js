'use strict';

/*
 * FENÊTRE « THÈME ET APPARENCE » — NATIVE (Configuration, palier 5, 3e onglet)
 * =============================================================================
 * Deux réglages : la couleur de la barre latérale du panneau d'administration
 * et la palette de la boutique. Aucun secret.
 *
 * ⚠ AUCUNE RÈGLE ICI. Lecture `config:apparence:donnees`, écriture
 * `config:apparence:ecrire` ; le cœur `Admin._apparenceEcrire` valide le thème,
 * l'applique et le persiste. Le droit d'écriture (`config:edit`) est décidé au
 * cœur, jamais dans la fenêtre.
 *
 * ⚠ LA LISTE DES THÈMES VIENT DU SITE. Elle n'est pas recopiée ici : un thème
 * ajouté là-bas doit apparaître ici sans qu'on y touche, et deux listes
 * finiraient par diverger.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit — jamais le nom d un theme, qui
   vient du coeur (voir src/langue/apparence.js). */
const T = require('../langue').tr('apparence');

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
.carte h2{margin:0 0 .25rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
.carte p{margin:0 0 .9rem;font-size:.79rem;color:var(--tx3)}
/* ── RELOOKING (2026-10-04) : chaque palette est un APERCU de la vitrine (barre,
   photo, prix, bouton), assez grand pour juger, au lieu d une pastille de 56 px.
   ⚠ L APERCU NE PORTE AUCUN TEXTE : ses couleurs sont celles du theme (donnees),
   et un mot pose dessus serait juge au contraste sans qu on choisisse ses
   couleurs. Le nom et l etat vivent SOUS l apercu, dans les couleurs de la fenetre. */
.rang{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:1rem}
.th{display:flex;flex-direction:column;gap:.55rem;text-align:left;
  background:var(--f-carte2);border:1px solid var(--v08);border-radius:14px;padding:.7rem;
  cursor:pointer;font:inherit;color:inherit;-webkit-user-select:none;user-select:none;
  transition:border-color .15s,box-shadow .15s,transform .15s}
.th:hover:not(:disabled){border-color:var(--v28);transform:translateY(-1px)}
.th:disabled{cursor:default;opacity:.6}
.th[aria-pressed="true"]{border-color:#c9a97e;box-shadow:0 0 0 1px #c9a97e}
.th:focus-visible{outline:2px solid #c9a97e;outline-offset:3px}
.vit{border-radius:10px;overflow:hidden;border:1px solid rgba(0,0,0,.18);aspect-ratio:16/10;display:flex;flex-direction:column}
.vit .bar{height:16%;background:#ffffff;display:flex;align-items:center;gap:6%;padding:0 7%;border-bottom:1px solid rgba(0,0,0,.08)}
.vit .bar i{display:block;height:28%;border-radius:3px;background:#1d2433;opacity:.75}
.vit .bar i:first-child{width:22%}.vit .bar i:nth-child(2){width:9%;opacity:.25;margin-left:auto}.vit .bar i:nth-child(3){width:9%;opacity:.25}
.vit .bas{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:6%;padding:6% 7%}
.vit .prod{display:flex;flex-direction:column;gap:7%}
.vit .photo{flex:1;border-radius:6px;background:rgba(0,0,0,.08)}
.vit .l1{height:7%;width:70%;border-radius:3px;background:rgba(0,0,0,.35)}
.vit .l2{height:7%;width:40%;border-radius:3px}
.vit .btn{height:14%;border-radius:99px}
.th .pied-th{display:flex;align-items:center;gap:.5rem}
.th .nom{font-size:.88rem;font-weight:600;color:var(--tx)}
.th .pastille-etat{margin-left:auto;font-size:.7rem;font-weight:700;padding:.12rem .55rem;border-radius:99px;
  background:rgba(201,169,126,.18);color:var(--tx-or)}
.th .gouttes{display:flex;gap:.3rem;margin-left:auto}
.th .gouttes span{width:14px;height:14px;border-radius:99px;border:1px solid var(--v16)}
.note{display:flex;gap:.8rem;align-items:flex-start}
.note .ic-note{flex:0 0 auto;width:2.2rem;height:2.2rem;border-radius:10px;background:var(--v06);display:flex;align-items:center;justify-content:center;color:var(--tx2)}
.note .ic-note svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.note p{margin:0 0 .35rem}
html.jour .th[aria-pressed="true"]{border-color:#8a6a3e;box-shadow:0 0 0 1px #8a6a3e}
html.jour .th .pastille-etat{background:rgba(138,106,62,.12);color:#6f5530}
/* L apercu est une VITRINE : sa barre reste blanche et ses traits sombres, de jour comme de nuit. */
html.jour .vit .bar i{background:#1d2433}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
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

function pageApparence() {
  return `${TETE()}
<title>${T("Thème et apparence — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.apparence}</span><h1>${T("Thème et apparence")}</h1></div>
<div class="ro" id="ro" hidden>${T("Lecture seule : vous pouvez consulter les thèmes, pas les changer.")}</div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
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
  var D = null, RO = false, OCCUPE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès à la configuration.")}',
    lecture_seule:      '${T("Votre rôle est en lecture seule : le thème ne peut pas être changé.")}',
    theme_inconnu:      '${T("Ce thème n’existe pas dans cette version.")}',
    rien_a_ecrire:      '${T("Aucun changement à enregistrer.")}',
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


  // Un apercu = un bouton. Le champ (store) et l identifiant du theme voyagent en
  // attributs : le gestionnaire est pose UNE fois, apres le dessin.
  function apercu(champ, th, choisi){
    var sel = th.id === choisi;
    return '<button type="button" class="th" data-champ="' + esc(champ) + '" data-id="' + esc(th.id) + '"'
      + ' aria-pressed="' + (sel ? 'true' : 'false') + '" aria-label="' + esc(szTd(th.label)) + '"'
      + (RO ? ' disabled' : '') + '>'
      + '<span class="vit" aria-hidden="true" style="background:' + esc(th.bg) + '">'
      + '<span class="bar"><i></i><i></i><i></i></span>'
      + '<span class="bas">'
      + '<span class="prod"><span class="photo"></span><span class="l1"></span><span class="l2" style="background:' + esc(th.accent) + '"></span></span>'
      + '<span class="prod"><span class="photo"></span><span class="l1"></span><span class="btn" style="background:' + esc(th.accent) + '"></span></span>'
      + '</span></span>'
      + '<span class="pied-th"><span class="nom">' + esc(szTd(th.label)) + '</span>'
      + (sel ? '<span class="pastille-etat">${T("Active")}</span>'
             : '<span class="gouttes" aria-hidden="true"><span style="background:' + esc(th.bg) + '"></span><span style="background:' + esc(th.accent) + '"></span></span>')
      + '</span></button>';
  }

  function dessiner(){
    var d = D || {};
    var h = [];
    var av = document.getElementById('ro');
    if (av) av.hidden = !RO;
    h.push('<div class="carte pleine"><h2>${T("Boutique")}</h2>');
    h.push('<p>${T("Palette de couleurs vue par la clientèle. Visible immédiatement dans la boutique.")}</p>');
    h.push('<div class="rang">' + (d.storeThemes || []).map(function(t){
      return apercu('store', t, d.store || ''); }).join('') + '</div></div>');
    /* ⚠ CE REGLAGE NE S APPLIQUE PLUS ICI, ET ON LE DIT (#26) : le jeu de couleurs
       de l application vit dans le MENU, et il est PAR POSTE. Deux paragraphes
       ENTIERS, chacun dans un seul litteral : coupes, ils se traduiraient en
       morceaux qui ne se recollent pas. */
    h.push('<div class="carte pleine note"><span class="ic-note"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M8 21h8"/></svg></span><div>'
      + '<h2>${T("Panneau d’administration")}</h2>'
      + '<p>${T("Le jeu de couleurs de l’application a déménagé : <strong>menu « Affichage » → « Jeu de couleurs »</strong>. Il habille les fenêtres entières — fonds, cartes, boutons, survol et menus — et il est réglé <strong>par poste</strong> : votre choix ne s’impose pas à vos collègues.")}</p>'
      + '<p class="aide">${T("L’ancien réglage ne teintait que la barre latérale de l’écran web, qui n’existe plus.")}</p>'
      + '</div></div>');
    corps.innerHTML = h.join('');
    var bs = corps.querySelectorAll('button.th');
    for (var i = 0; i < bs.length; i++) bs[i].onclick = surClic;
  }

  function surClic(e){
    if (RO || OCCUPE) return;
    var b = e.currentTarget;
    var champ = b.getAttribute('data-champ');
    var id = b.getAttribute('data-id') || '';
    var deja = (champ === 'adm' ? (D && D.adm) : (D && D.store)) || '';
    if (id === deja) return;
    var saisie = {};
    saisie[champ] = id;
    OCCUPE = true;
    dire('${T("Enregistrement…")}');
    appeler('config:apparence:ecrire', [saisie]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) {
        // Le coeur renvoie l etat complet : on redessine a partir de LUI, jamais
        // a partir de ce qu on croyait avoir envoye.
        D = r; RO = !r.peutModifier;
        dessiner();
        dire('${T("Thème appliqué.")}', 'bon');
      } else {
        dire(expliquer(r), 'err');
      }
    });
  }

  function charger(){
    dire('${T("Lecture…")}');
    appeler('config:apparence:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte pleine"><div class="vide m-' + ((r && r.motif) || 'echec') + '">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r;
      RO = !r.peutModifier;
      dessiner();
      dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageApparence };
