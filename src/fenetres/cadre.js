'use strict';

/*
 * FENÊTRE « CADRE » — la zone d'ancrage, et rien d'autre
 * =============================================================================
 * ⚠⚠ POURQUOI CETTE FENÊTRE EXISTE.
 * Le panneau d'administration web n'est pas un ÉCRAN : c'est le CADRE. Trente-six
 * écrans natifs s'y ANCRENT — `admin.js` · `_DOCKABLES` les déclare, le site
 * envoie la position de sa zone `#admin-content` (`dock:zone`, en px CSS), et la
 * coquille pose sa `WebContentsView` par-dessus. Tous les écrans ont beau être
 * portés (5.32 → 5.34), le panneau ne se retire pas : on retirerait la pièce
 * dans laquelle toute l'interface native se dessine.
 *
 * ➡ Cette fenêtre est cette pièce, DESSINÉE PAR LA COQUILLE.
 *
 * ⚠⚠ ELLE N'A PAS DE BARRE LATÉRALE, ET C'EST UNE DÉCISION — PAS UN MANQUE.
 * La première version (5.36.0) en dessinait une, bâtie sur les 92 entrées du
 * modèle de navigation. Sa réponse, en la regardant : « retire la barre
 * latérale, garde juste la zone d'ancrage ». Il a raison, et le dépôt le disait
 * déjà : « Afficher la barre latérale » avait été RETIRÉE du site le
 * 2026-08-17 parce que, dans l'application, LA NAVIGATION EST LE MENU DU HAUT.
 * En redessiner une ici, c'était refaire le doublon qu'on venait d'enlever —
 * la même navigation, pour 268 px de largeur.
 * ⚠ NE PAS LA REMETTRE « pour la découvrabilité ». La question a été posée, elle
 * a été tranchée en regardant, et ce qui manquait à la coquille n'a jamais été
 * une liste d'écrans : c'est LA ZONE.
 *
 * ⚠ Ce qui est parti avec elle : les verbes `cadreNavigation` et `cadreAller`,
 * et leurs deux gestionnaires. Un verbe du préchargement que plus rien n'appelle
 * n'est pas inoffensif — il se lit comme une fonction, et on bâtit dessus.
 *
 * 🔴🔴 CE QUI A ÉTÉ APPRIS EN L'ALLUMANT PAR DÉFAUT (5.40.0 → 5.42.0), ET QUI
 * INTERDIT DE RECOMMENCER : allumé, le CADRE recouvre la page du site — et LA
 * BARRE DE MENU EST DESSINÉE PAR LE SITE (appbar.js). L'utilisateur se retrouve
 * donc sans menu, c'est-à-dire SANS NAVIGATION : « je n'ai plus mon menu »
 * (capture du 2026-09-12). Et comme l'interrupteur vit DANS ce menu, il ne
 * pouvait même plus l'éteindre — la seule issue était la touche Alt, qui révèle
 * le menu natif de Windows.
 * ⚠⚠ C'EST LE MÊME FAIT QUE CELUI QUI A FAIT RETIRER LA BARRE LATÉRALE, VU PAR
 * L'AUTRE BOUT : « dans l'application, la navigation EST le menu du haut ». Le
 * cadre doit donc porter ce menu AVANT de pouvoir devenir le défaut — sinon il
 * ne remplace pas le panneau web, il l'ampute.
 * ⚠ TANT QUE CE N'EST PAS FAIT, cette fenêtre reste un APERÇU qu'on ouvre
 * volontairement, et l'interrupteur reste ÉTEINT par défaut.
 *
 * ⚠ CE QU'ELLE NE FAIT PAS ENCORE, ET ELLE LE DIT À L'ÉCRAN : elle n'a pas
 * remplacé la fenêtre principale. Tant que ce n'est pas fait, c'est toujours le
 * site qui envoie `dock:zone`. La bascule demande de retirer au site son rôle de
 * cadre en lui LAISSANT son rôle de pont — 36 renvois à `mainWindow.webContents`
 * et 8 à `runAdmin` pointent vers la page du site, qui héberge les 429 cœurs.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, il se refermerait. Les
 * noms de code s'y écrivent NUS — la règle est en tête, elle se paie quand même.
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

/* ── LA BARRE DU HAUT ────────────────────────────────────────────────────────
   Elle reste : c est elle qui nommera l ecran ancre. Ce n est pas de la
   navigation — on ne choisit rien ici, on lit ce qui est ouvert. */
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{font-size:1rem;margin:0;font-weight:650}
.tete .sous{font-size:.73rem;color:var(--tx2)}
.tete .fin{margin-left:auto;display:flex;gap:.5rem;align-items:center}

/* ── LA BARRE DE MENUS ───────────────────────────────────────────────────────
   ⚠⚠ ELLE OUVRE LE VRAI MENU NATIF, elle n en fabrique pas une copie. Les
   intitules viennent de la coquille (menuLabels) et le clic lui demande
   d ouvrir SON panneau (menuPanneau) : il n y a donc qu UNE navigation dans
   l application, et elle ne peut pas se desynchroniser de celle du menu.
   ⚠ C est exactement ce que fait deja l ecran de connexion. Reinventer un
   deroulant ici aurait perdu ce que celui-la a appris — le survol qui change de
   menu quand un autre est ouvert, le retour << szBarreFermee >>, le delai de
   fermeture cote coquille quand la souris descend vers le panneau. */
.barre{display:flex;align-items:center;gap:.1rem}
.barre button{background:transparent;border:0;color:var(--tx);font:inherit;
  font-size:.84rem;padding:.3rem .6rem;border-radius:7px;cursor:pointer}
.barre button:hover{background:var(--v08)}
.barre button.on{background:var(--v12)}

/* ── LA ZONE D ANCRAGE — la seule raison d etre de cette fenetre ──────────────
   ⚠ LE DAMIER DIT << RIEN N EST ENCORE POSE ICI >>. Une zone vide et unie se lit
   comme un ecran casse ; le damier dit qu elle attend. */
#ancrage{flex:1 1 auto;min-height:0;display:flex;align-items:center;
  justify-content:center;padding:1.6rem;overflow:auto;
  background:
    linear-gradient(45deg,var(--v04) 25%,transparent 25%,transparent 75%,var(--v04) 75%),
    linear-gradient(45deg,var(--v04) 25%,transparent 25%,transparent 75%,var(--v04) 75%);
  background-size:20px 20px;background-position:0 0,10px 10px}
.carte{max-width:38rem;background:var(--f-carte);border:1px solid var(--v12);
  border-radius:12px;padding:1.15rem 1.25rem}
.carte h2{margin:0 0 .55rem;font-size:.95rem}
.carte p{margin:0 0 .6rem;font-size:.84rem;color:var(--tx2);line-height:1.48}
.carte p:last-child{margin-bottom:0}
.carte strong{color:var(--tx)}
/* Les mesures se lisent en colonne : ce sont des NOMBRES qu on compare a ceux
   que le site envoie, pas de la prose. */
.mes{margin-top:.7rem;padding-top:.6rem;border-top:1px solid var(--v08);
  font-size:.79rem;font-variant-numeric:tabular-nums;color:var(--tx);
  display:flex;flex-wrap:wrap;gap:.25rem 1.4rem}
.mes b{font-weight:650}
.btn{padding:.34rem .7rem;border-radius:7px;border:1px solid var(--v12);
  background:var(--v04);color:var(--tx);font:inherit;font-size:.8rem;cursor:pointer}
.btn:hover{background:var(--v08)}
.pied{flex:0 0 auto;padding:.42rem 1.05rem;border-top:1px solid var(--v08);
  font-size:.76rem;min-height:1.9rem;background:var(--f-carte)}

/* ── LA REPRISE DE JOUR ──────────────────────────────────────────────────────
   ⚠ En mode jour la fenetre passe en clair : une piece laissee sombre y reste
   sombre. Seule la barre du haut porte un degrade en dur, elle a sa reprise. */
html.jour .tete{background:linear-gradient(180deg,#f3f1ec,#e9e6df)}
`;

function pageCadre() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Cadre de l’administration — Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.tableau || ''}</span>
  <div class="barre" id="barre" role="menubar"></div>
  <span class="sous" id="sous"></span>
  <span class="fin"><button class="btn" id="b-mesurer" type="button">↻ Remesurer</button></span></div>
<div id="ancrage" class="zone">
  <div class="carte" id="corps">
    <h2>Cette zone est la place d’un écran</h2>
    <p>Elle est dessinée par l’application, plus par la page web. C’est la pièce qui manquait
       pour que le panneau d’administration web puisse être retiré : <strong>trente-six écrans
       natifs s’y ancrent</strong> aujourd’hui, et c’est le site qui dit où elle se trouve.</p>
    <p><strong>Le menu du haut est le vrai :</strong> les intitulés viennent de l’application, et
       cliquer ouvre <em>son</em> menu — pas une copie. Il n’y a donc qu’une navigation, et elle ne
       peut pas se désynchroniser. Pas de barre latérale : ce serait le doublon retiré en août.</p>
    <p><strong>Ce qui n’est pas encore fait :</strong> cette fenêtre n’a pas remplacé la fenêtre
       principale. Tant que la bascule n’est pas faite, c’est encore le site qui envoie la
       position de la zone, et les écrans s’ancrent là-bas.</p>
    <div class="mes" id="mesures"></div>
  </div>
</div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}

  /* ⚠ ELLE NE S APPELLE PAS mesurer : ce nom est DEJA pris par le socle, et le
     redeclarer ici tuait la sienne en silence — le dernier gagne. C est
     verifier-fenetres qui l a nomme, pas la relecture. ⚠ Et en ecrivant CE
     commentaire la premiere fois, j ai pose un accent grave autour du nom : le
     gabarit s est referme la, et node a refuse le fichier dans la seconde.
     ⚠⚠ ON MESURE LA ZONE, ET ON L AFFICHE. C est exactement le nombre que le
     site envoie aujourd hui (dock:zone) et que cette fenetre devra envoyer a sa
     place. L afficher, c est pouvoir COMPARER les deux au lieu de croire. */
  function mesurerZone(){
    var z = document.getElementById('ancrage');
    var m = document.getElementById('mesures');
    if (!z || !m) return;
    var r = z.getBoundingClientRect();
    var d = window.devicePixelRatio || 1;
    m.innerHTML = '<span><b>Position</b> ' + Math.round(r.left) + ', ' + Math.round(r.top) + ' px</span>'
      + '<span><b>Taille</b> ' + Math.round(r.width) + ' × ' + Math.round(r.height) + ' px</span>'
      + '<span><b>Densité</b> ×' + (Math.round(d * 100) / 100) + '</span>';
    szDire('Zone mesurée : ' + Math.round(r.width) + ' × ' + Math.round(r.height)
      + ' px à ' + Math.round(r.left) + ', ' + Math.round(r.top) + '.', 'bon');
  }

  /* ══ LA BARRE DE MENUS ═══════════════════════════════════════════════════
     ⚠⚠ C EST LA PIECE QUI MANQUAIT, ET SON ABSENCE A COUTE UNE REGRESSION. Le
     cadre recouvre la page du site — or LA BARRE DE MENU EST DESSINEE PAR LE
     SITE. Allume par defaut en 5.40.0, il ne restait donc plus AUCUNE
     navigation : << je n ai plus mon menu >>, et l interrupteur lui-meme vivait
     dans ce menu. Un cadre sans menu n ampute pas un detail : il ampute la
     seule facon de se deplacer.
     ⚠ ON N EN FAIT PAS UN PREALABLE : si les intitules n arrivent pas (le
     modele vient de la page principale, il peut tarder), la fenetre s ouvre
     quand meme. Une barre absente vaut mieux qu un ecran qui attend. */
  var BARRE_FAITE = false, BARRE_OUVERT = null;
  function barreEteindre(){
    if (BARRE_OUVERT) { BARRE_OUVERT.className = ''; BARRE_OUVERT = null; }
  }
  function barreMontrer(b){
    if (!b || !P || !P.menuPanneau) return;
    if (BARRE_OUVERT === b) return;
    barreEteindre();
    BARRE_OUVERT = b;
    b.className = 'on';
    /* Sous le bouton, pas sous le pointeur : un panneau qui s ouvre a deux
       pixels pres de la ou on a clique a l air de flotter. */
    var r = b.getBoundingClientRect();
    P.menuPanneau(b.textContent, Math.round(r.left), Math.round(r.bottom));
  }
  /* La coquille appelle ceci quand le panneau se referme — sans ce retour,
     l intitule resterait allume au-dessus d un menu ferme. */
  window.szBarreFermee = function(){ barreEteindre(); };
  function barrePoser(){
    if (BARRE_FAITE || !P || !P.menuLabels) return;
    P.menuLabels().then(function(noms){
      if (BARRE_FAITE || !noms || !noms.length) return;
      BARRE_FAITE = true;
      var z = document.getElementById('barre');
      if (!z) return;
      noms.forEach(function(nom){
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = nom;
        /* Clic pour ouvrir, survol pour CHANGER — mais seulement si un menu est
           deja ouvert, sinon un simple passage de souris deplierait des menus
           qu on ne demandait pas. */
        b.onclick = function(){ barreMontrer(this); };
        b.onmouseenter = function(){ if (BARRE_OUVERT) barreMontrer(this); };
        z.appendChild(b);
      });
      /* Sortir de la barre referme — la coquille attend un court instant, elle
         sait si la souris est passee DANS le panneau. */
      z.onmouseleave = function(){
        if (P && P.menuPanneauFermer) P.menuPanneauFermer();
        barreEteindre();
      };
      document.getElementById('sous').textContent = noms.length + ' menu(s)';
    }).catch(function(){});
  }
  barrePoser();
  /* Le modele vient de la page principale : il peut arriver en retard. On
     redemande UNE fois, pas en boucle — un sondage permanent pour une barre de
     menus serait hors de proportion. */
  setTimeout(barrePoser, 2000);

  document.getElementById('b-mesurer').addEventListener('click', mesurerZone);
  /* ⚠ LA ZONE SE REMESURE AU REDIMENSIONNEMENT : ses pixels dependent de la
     fenetre, et un nombre fige serait faux des le premier coin tire. */
  window.addEventListener('resize', mesurerZone);

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  mesurerZone();
})();
</script>
</body></html>`;
}

module.exports = { pageCadre };
