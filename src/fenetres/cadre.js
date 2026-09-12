'use strict';

/*
 * FENÊTRE « CADRE » — la pièce qui manque pour que le panneau web puisse partir
 * =============================================================================
 * ⚠⚠ POURQUOI CETTE FENÊTRE EXISTE, ET CE QU'ELLE N'EST PAS.
 * Le panneau d'administration web n'est pas un ÉCRAN : c'est le CADRE. Trente-six
 * écrans natifs s'y ANCRENT — `admin.js` · `_DOCKABLES` les déclare, le site
 * envoie la position de sa zone `#admin-content` (`dock:zone`, en px CSS), et la
 * coquille pose sa `WebContentsView` par-dessus. Tous les écrans ont beau être
 * portés (5.32 → 5.34), le panneau ne se retire pas : on retirerait la pièce
 * dans laquelle toute l'interface native se dessine.
 *
 * ➡ Cette fenêtre est ce cadre, DESSINÉ PAR LA COQUILLE : la barre latérale, la
 * barre du haut, et la zone où un écran viendra s'ancrer.
 *
 * ⚠ CE QU'ELLE NE FAIT PAS ENCORE, ET ELLE LE DIT À L'ÉCRAN : elle n'a pas
 * remplacé la fenêtre principale. Tant que ce n'est pas fait, c'est toujours le
 * site qui envoie `dock:zone`, et les écrans s'ancrent toujours là-bas. La
 * bascule demande de retirer au site son rôle de cadre en lui LAISSANT son rôle
 * de pont — 36 renvois à `mainWindow.webContents` et 8 à `runAdmin` pointent
 * aujourd'hui vers la page du site, qui héberge les 429 cœurs. C'est la tranche
 * suivante, et elle ne se fait pas à l'aveugle.
 *
 * ⚠⚠ LA LISTE BLANCHE EST LE MODÈLE LUI-MÊME, ET C'EST VOULU. On ne dessine que
 * les entrées qui portent une clé `app:` — c'est-à-dire celles qui ont une
 * FENÊTRE NATIVE. Une entrée sans `app:` est un repli web ; la dessiner ici
 * refabriquerait exactement la page web déguisée en fenêtre que le dépôt a
 * bannie le 2026-08-19. Aucune liste à tenir à la main : une entrée devient
 * ouvrable en recevant sa fenêtre, et pas avant.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, il se refermerait.
 * ⚠⚠ Les textes visibles portent leurs accents, et les apostrophes s'écrivent ’.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}

/* ── LA BARRE DU HAUT ────────────────────────────────────────────────────── */
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{font-size:1rem;margin:0;font-weight:650}
.tete .sous{font-size:.73rem;color:var(--tx2)}
.tete .fin{margin-left:auto;display:flex;gap:.5rem;align-items:center}
.zone{flex:1 1 auto;min-height:0;display:flex;gap:0}

/* ── LA BARRE LATERALE ───────────────────────────────────────────────────── */
.rail{flex:0 0 268px;border-right:1px solid var(--v08);background:var(--f-carte);
  display:flex;flex-direction:column;min-height:0}
.rail .filtre{flex:0 0 auto;padding:.55rem .6rem;border-bottom:1px solid var(--v08)}
.rail .filtre input{width:100%;padding:.36rem .5rem;background:var(--f-champ);
  color:var(--tx);border:1px solid var(--v12);border-radius:7px;font:inherit;font-size:.82rem}
.rail .liste{flex:1 1 auto;overflow-y:auto;padding:.3rem 0}
.rail .liste::-webkit-scrollbar{width:8px}
.rail .liste::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
/* Un groupe se replie : quatre-vingt-douze entrees d un bloc, ca ne se lit pas. */
.grp{border-bottom:1px solid var(--v04)}
.grp>button{width:100%;display:flex;align-items:center;gap:.4rem;
  padding:.42rem .75rem;background:transparent;border:0;color:var(--tx2);
  font:inherit;font-size:.7rem;font-weight:700;text-transform:uppercase;
  letter-spacing:.05em;cursor:pointer;text-align:left}
.grp>button:hover{background:var(--v04);color:var(--tx)}
.grp>button .chev{margin-left:auto;font-size:.72rem;transition:transform .12s}
.grp.plie>button .chev{transform:rotate(-90deg)}
.grp.plie .items{display:none}
.items{padding:0 0 .25rem}
.ent{width:100%;display:flex;align-items:center;gap:.5rem;padding:.34rem .75rem .34rem 1.15rem;
  background:transparent;border:0;color:var(--tx);font:inherit;font-size:.82rem;
  cursor:pointer;text-align:left}
.ent:hover{background:var(--v08)}
.ent.on{background:var(--v12);font-weight:650}
.ent .nom{flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* ⚠ PAS D OPACITE SUR LE RACCOURCI : c est une information qu on vient CHERCHER,
   et l estomper la rend illisible sur le fond de jour — la lecon du banc au rendu. */
.ent .accel{font-size:.68rem;color:var(--tx2);font-variant-numeric:tabular-nums}

/* ── LA ZONE D ANCRAGE ───────────────────────────────────────────────────── */
.plan{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;min-height:0}
.fil{flex:0 0 auto;padding:.5rem 1.1rem;border-bottom:1px solid var(--v08);
  font-size:.82rem;font-weight:650;background:var(--f-carte2,var(--f-carte))}
.fil .p{font-weight:400;font-size:.73rem;color:var(--tx2);margin-left:.5rem}
/* ⚠ LE DAMIER DIT << RIEN N EST ENCORE POSE ICI >>. Une zone d ancrage vide et
   unie se lit comme un ecran casse ; le damier dit qu elle attend. */
#ancrage{flex:1 1 auto;min-height:0;display:flex;align-items:center;
  justify-content:center;padding:1.4rem;
  background:
    linear-gradient(45deg,var(--v04) 25%,transparent 25%,transparent 75%,var(--v04) 75%),
    linear-gradient(45deg,var(--v04) 25%,transparent 25%,transparent 75%,var(--v04) 75%);
  background-size:20px 20px;background-position:0 0,10px 10px}
.carte{max-width:34rem;background:var(--f-carte);border:1px solid var(--v12);
  border-radius:12px;padding:1.1rem 1.2rem}
.carte h2{margin:0 0 .5rem;font-size:.92rem}
.carte p{margin:0 0 .5rem;font-size:.83rem;color:var(--tx2);line-height:1.45}
.carte p:last-child{margin-bottom:0}
.carte .mes{font-variant-numeric:tabular-nums;color:var(--tx)}
.vide{padding:1.2rem;color:var(--tx2);font-size:.83rem;text-align:center}
.btn{padding:.34rem .7rem;border-radius:7px;border:1px solid var(--v12);
  background:var(--v04);color:var(--tx);font:inherit;font-size:.8rem;cursor:pointer}
.btn:hover{background:var(--v08)}
.pied{flex:0 0 auto;padding:.42rem 1.05rem;border-top:1px solid var(--v08);
  font-size:.76rem;min-height:1.9rem;background:var(--f-carte)}

/* ── LA REPRISE DE JOUR ──────────────────────────────────────────────────────
   ⚠ En mode jour la fenetre passe en clair : une piece laissee sombre y reste
   sombre. Seule la barre du haut porte un degrade en dur, elle a sa reprise. */
html.jour .tete{background:linear-gradient(180deg,#f3f1ec,#e9e6df)}
html.jour .ent.on{background:var(--v12)}
`;

function pageCadre() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Cadre de l’administration — Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.tableau || ''}</span>
  <h1>Cadre de l’administration</h1>
  <span class="sous" id="sous"></span>
  <span class="fin"><button class="btn" id="b-relire" type="button">↻ Relire la navigation</button></span></div>
<div class="zone" id="corps">
  <div class="rail">
    <div class="filtre"><input type="text" id="filtre" aria-label="Filtrer les écrans par leur nom" placeholder="Filtrer les écrans…" autocomplete="off"></div>
    <div class="liste" id="liste"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div>
  </div>
  <div class="plan">
    <div class="fil" id="fil">Aucun écran choisi<span class="p">la zone ci-dessous est celle où un écran viendra s’ancrer</span></div>
    <div id="ancrage">
      <div class="carte">
        <h2>Cette zone est la place d’un écran</h2>
        <p>La barre latérale et cette zone sont dessinées par l’application, plus par la page
           web. C’est la pièce qui manquait pour que le panneau d’administration web puisse
           être retiré : trente-six écrans natifs s’y ancrent aujourd’hui.</p>
        <p><strong>Ce qui n’est pas encore fait :</strong> cette fenêtre n’a pas remplacé la
           fenêtre principale. Tant que la bascule n’est pas faite, c’est encore le site qui
           dit où se trouve la zone, et les écrans s’ancrent là-bas. Choisir une entrée à
           gauche ouvre donc l’écran comme d’habitude.</p>
        <p class="mes" id="mesure"></p>
      </div>
    </div>
  </div>
</div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var MENUS = [];        // la navigation, telle que la coquille la connait
  var PLIES = {};        // les groupes replies, par libelle
  var COURANT = '';      // la cle de l ecran choisi

  var liste = document.getElementById('liste');
  var filtre = document.getElementById('filtre');

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  /* ⚠ LA NAVIGATION NE VIENT PAS DU SITE, ELLE VIENT DE LA COQUILLE. Elle y est
     deja : le site la lui envoie une fois (menu:modele) pour qu elle batisse sa
     barre de menus. La redemander au site ici aurait fait DEUX sources pour la
     meme liste, et deux listes finissent toujours par differer. */
  function lire(){
    dire('Lecture de la navigation…');
    var p;
    try { p = P.cadreNavigation(); }
    catch (e) { p = null; }
    Promise.resolve(p).then(function(r){
      if (!r || !r.ok) {
        liste.innerHTML = '<div class="vide">La navigation n’est pas encore arrivée du site.'
          + ' L’application la reçoit au démarrage ; touchez « ↻ Relire » dans un instant.</div>';
        dire('Navigation indisponible.', 'att');
        return;
      }
      MENUS = r.menus || [];
      var n = 0;
      MENUS.forEach(function(m){ n += (m.entrees || []).length; });
      document.getElementById('sous').textContent =
        MENUS.length + ' groupe(s) · ' + n + ' écran(s) natif(s)';
      /* ⚠ ON DIT CE QU ON N A PAS DESSINE. Une entree sans fenetre native est
         ecartee — la montrer refabriquerait la page web deguisee en fenetre. Le
         taire ferait chercher un ecran qu on croit avoir. */
      if (r.ecartes) dire(n + ' écrans natifs — ' + r.ecartes
        + ' entrée(s) écartée(s) : elles n’ont pas de fenêtre native.', 'att');
      else dire('Navigation lue — ' + n + ' écran(s).', 'bon');
      dessiner();
      mesurerZone();
    });
  }

  function dessiner(){
    var q = (filtre.value || '').trim().toLowerCase();
    var h = '', vus = 0;
    MENUS.forEach(function(m){
      var ents = (m.entrees || []).filter(function(e){
        return !q || e.label.toLowerCase().indexOf(q) >= 0;
      });
      if (!ents.length) return;
      vus += ents.length;
      /* Un filtre DEPLIE tout : sinon on cherche un mot, on le trouve, et il
         reste cache dans un groupe replie — on conclut qu il n existe pas. */
      var plie = !q && PLIES[m.label];
      h += '<div class="grp' + (plie ? ' plie' : '') + '">'
        + '<button type="button" data-grp="' + esc(m.label) + '">' + esc(m.label)
        + '<span class="chev">▾</span></button><div class="items">';
      ents.forEach(function(e){
        h += '<button class="ent' + (e.app === COURANT ? ' on' : '') + '" type="button"'
          + ' data-app="' + esc(e.app) + '"><span class="nom">' + esc(e.label) + '</span>'
          + (e.accel ? '<span class="accel">' + esc(e.accel) + '</span>' : '') + '</button>';
      });
      h += '</div></div>';
    });
    if (!vus) h = '<div class="vide">Aucun écran ne porte ce mot.</div>';
    liste.innerHTML = h;
  }

  /* ⚠ ELLE NE S APPELLE PAS mesurer : ce nom est DEJA pris par le socle, et
     le redeclarer ici tuait la sienne en silence — le dernier gagne. C est
     verifier-fenetres qui l a nomme, pas la relecture. ⚠ Et en ecrivant CE
     commentaire j ai pose un accent grave autour du nom : le gabarit s est
     referme la, et node a refuse le fichier dans la seconde. Les noms de
     code s ecrivent NUS ici — la regle est en tete, elle se paie quand meme.
     ⚠⚠ ON MESURE LA ZONE, ET ON L AFFICHE. C est exactement le nombre que le
     site envoie aujourd hui (dock:zone) et que cette fenetre devra envoyer a sa
     place. L afficher, c est pouvoir comparer les deux au lieu de croire. */
  function mesurerZone(){
    var z = document.getElementById('ancrage');
    if (!z) return;
    var r = z.getBoundingClientRect();
    var m = document.getElementById('mesure');
    if (m) m.textContent = 'Zone d’ancrage mesurée ici : '
      + Math.round(r.left) + ', ' + Math.round(r.top) + ' — '
      + Math.round(r.width) + ' × ' + Math.round(r.height) + ' px.';
  }

  liste.addEventListener('click', function(ev){
    var g = ev.target.closest('[data-grp]');
    if (g) {
      var cle = g.getAttribute('data-grp');
      PLIES[cle] = !PLIES[cle];
      dessiner();
      return;
    }
    var b = ev.target.closest('[data-app]');
    if (!b) return;
    var app = b.getAttribute('data-app');
    COURANT = app;
    dessiner();
    var e = null;
    MENUS.forEach(function(m){ (m.entrees || []).forEach(function(x){ if (x.app === app) e = x; }); });
    document.getElementById('fil').innerHTML = esc(e ? e.label : app)
      + '<span class="p">ouvert comme d’habitude — la bascule du cadre n’est pas faite</span>';
    var p;
    try { p = P.cadreAller(app); }
    catch (er) { p = null; }
    Promise.resolve(p).then(function(ok){
      /* ⚠ UN BOUTON MUET SE LIT COMME UNE FONCTION CASSEE. Si la coquille refuse
         la cle, on le DIT — et on dit pourquoi : la cle n est pas dans le modele. */
      if (ok === false) dire('Cet écran n’a pas pu être ouvert : sa clé n’est pas dans la navigation.', 'err');
      else dire('Ouvert : ' + (e ? e.label : app), 'bon');
    });
  });

  filtre.addEventListener('input', dessiner);
  document.getElementById('b-relire').addEventListener('click', lire);
  window.addEventListener('resize', mesurerZone);

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      var a = document.activeElement;
      if (a === filtre && filtre.value) { filtre.value = ''; dessiner(); return; }
      ev.preventDefault();
      P.fermer();
    }
  });

  lire();
})();
</script>
</body></html>`;
}

module.exports = { pageCadre };
