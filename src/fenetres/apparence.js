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

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
/* ⚠ LA ZONE EST PLEINE PAGE, ET LES CARTES DOIVENT LA REMPLIR (2026-08-10) :
   plafonnees en largeur, elles laissaient la moitie de l ecran vide une fois la
   fenetre ANCREE. On repartit en colonnes qui se replient seules. */
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:grid;grid-template-columns:repeat(auto-fit,minmax(28rem,1fr));
  gap:1rem;align-content:start}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:1rem 1.1rem;margin:0;min-width:0}
.pleine{grid-column:1/-1}
.carte h2{margin:0 0 .25rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
.carte p{margin:0 0 .9rem;font-size:.79rem;color:var(--tx3)}
.rang{display:flex;flex-wrap:wrap;gap:1rem}
.th{display:flex;flex-direction:column;align-items:center;gap:.4rem;
  background:none;border:none;padding:0;cursor:pointer;font:inherit;color:inherit;
  -webkit-user-select:none;user-select:none}
.th:disabled{cursor:default;opacity:.55}
.th .pastille{width:56px;height:56px;border-radius:12px;position:relative;overflow:hidden;
  display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;
  border:3px solid transparent;box-shadow:0 2px 8px rgba(0,0,0,.25);transition:box-shadow .2s}
.th .barre{width:70%;height:6px;border-radius:4px;opacity:.9}
.th .coche{position:absolute;top:4px;right:4px;width:14px;height:14px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;font-size:8px;line-height:1}
.th .nom{font-size:.72rem;color:var(--tx2);white-space:nowrap}
.th[aria-pressed="true"] .nom{color:var(--tx);font-weight:700}
.th:hover:not(:disabled) .pastille{box-shadow:0 4px 14px rgba(0,0,0,.4)}
.th:focus-visible .pastille{outline:2px solid #c9a97e;outline-offset:3px}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
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
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Thème et apparence — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.apparence}</span><h1>Thème et apparence</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter les thèmes, pas les changer.</div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
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
        + 'border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);'
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
  var D = null, RO = false, OCCUPE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule : le thème ne peut pas être changé.',
    theme_inconnu:      'Ce thème n’existe pas dans cette version.',
    rien_a_ecrire:      'Aucun changement à enregistrer.',
    indisponible:       'La configuration n’est pas prête dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    nuage:              'L’enregistrement dans le nuage a échoué. Réessayez.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
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

  // Une pastille = un bouton. Le champ (adm / store) et l identifiant du theme
  // voyagent en attributs : le gestionnaire est pose UNE fois, apres le dessin.
  function pastille(champ, th, choisi){
    var sel = th.id === choisi;
    var bord = sel ? th.accent : 'transparent';
    var ombre = sel ? '0 0 0 2px ' + th.accent + ',0 4px 12px rgba(0,0,0,.25)' : '';
    return '<button type="button" class="th" data-champ="' + esc(champ) + '" data-id="' + esc(th.id) + '"'
      + ' aria-pressed="' + (sel ? 'true' : 'false') + '" title="' + esc(th.label) + '"'
      + (RO ? ' disabled' : '') + '>'
      + '<span class="pastille" style="background:' + esc(th.bg) + ';border-color:' + esc(bord) + ';'
      + (ombre ? 'box-shadow:' + ombre + ';' : '') + '">'
      + '<span class="barre" style="background:' + esc(th.accent) + '"></span>'
      + (sel ? '<span class="coche" style="background:' + esc(th.accent) + ';color:' + esc(th.bg) + '">✓</span>' : '')
      + '</span><span class="nom">' + esc(th.label) + '</span></button>';
  }

  function dessiner(){
    var d = D || {};
    var h = [];
    var av = document.getElementById('ro');
    if (av) av.hidden = !RO;
    /* ⚠ CE RÉGLAGE NE S APPLIQUE PLUS, ET ON LE DIT (#26). Il teintait la
       BARRE LATÉRALE de l écran web — disparue avec le lot 5 de #10. Le laisser
       cliquable laissait croire qu il faisait quelque chose : c est ce qui a
       fait dire << ça ne s applique plus >>. Le jeu de couleurs de
       l application vit maintenant dans le MENU, et il est PAR POSTE — donc il
       n a pas sa place ici, où tout est partagé par toute l équipe. */
    h.push('<div class="carte"><h2>Panneau d’administration</h2>');
    h.push('<p>Le jeu de couleurs de l’application a déménagé : <strong>menu '
      + '« Affichage » → « Jeu de couleurs »</strong>. Il habille les fenêtres '
      + 'entières — fonds, cartes, boutons, survol et menus — et il est réglé '
      + '<strong>par poste</strong> : votre choix ne s’impose pas à vos collègues.</p>');
    h.push('<p class="aide">L’ancien réglage ne teintait que la barre latérale '
      + 'de l’écran web, qui n’existe plus.</p></div>');
    h.push('<div class="carte"><h2>Boutique</h2>');
    h.push('<p>Palette de couleurs vue par la clientèle. Visible immédiatement dans la boutique.</p>');
    h.push('<div class="rang">' + (d.storeThemes || []).map(function(t){
      return pastille('store', t, d.store || ''); }).join('') + '</div></div>');
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
    dire('Enregistrement…');
    appeler('config:apparence:ecrire', [saisie]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) {
        // Le coeur renvoie l etat complet : on redessine a partir de LUI, jamais
        // a partir de ce qu on croyait avoir envoye.
        D = r; RO = !r.peutModifier;
        dessiner();
        dire('Thème appliqué.', 'bon');
      } else {
        dire(expliquer(r), 'err');
      }
    });
  }

  function charger(){
    dire('Lecture…');
    appeler('config:apparence:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte pleine"><div class="vide">' + expliquer(r) + '</div></div>';
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
