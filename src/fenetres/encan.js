'use strict';

/*
 * ENCAN EN DIRECT — LA CONSOLE (2026-10-20, lot 1 ; refaite le même jour, sa demande : « une interface plus
 * professionnelle, mais le code marche bien »)
 * =============================================================================
 * La fenêtre de l animatrice, en trois zones :
 *   · à gauche, l ARTICLE (recherche ou article libre) et les RÉGLAGES, en onglets ;
 *   · au centre, la SCÈNE : l article en cours, le temps, l enchère, UN bouton principal (Démarrer / Pause /
 *     Reprendre), +15 s et Adjuger ; dessous, À suivre · En attente de « GAGNÉ » · Ventes de la séance ;
 *   · à droite, le FIL DES COMMENTAIRES, avec la modération de l encan (annuler une offre, bloquer un pseudo)
 *     et, en mode essai, la saisie de faux commentaires.
 *
 * ⚠ LA CONSOLE NE TIENT PAS LE TEMPS. Le moteur (src/encan.js) vit dans le processus principal : fermer ou
 * recharger cette fenêtre n arrête pas l encan. Elle envoie des GESTES, le moteur rend l ÉTAT.
 * ⚠ LA MODÉRATION EST CELLE DE L ENCAN : retirer une offre, ignorer un pseudo pour la séance. Supprimer un
 * commentaire ou bloquer quelqu un DANS le direct se fait dans TikTok (aucune voie ouverte aux applications).
 * ⚠ AUCUN ACCENT GRAVE dans la portion de code de la page, commentaires compris.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, TETE } = require('./socle.js');
const T = require('../langue').tr('encan');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;flex-wrap:wrap;gap:.6rem 1rem;padding:.55rem 1.1rem;border-bottom:1px solid var(--v08)}
.tete h1{margin:0;font-size:1.05rem;font-weight:700;letter-spacing:.01em}
.tete .gauche{display:flex;align-items:center;gap:.6rem}
.tete .droite{margin-left:auto;display:flex;align-items:center;flex-wrap:wrap;gap:.5rem}
.phase{font-size:.74rem;font-weight:700;border-radius:99px;padding:.12rem .65rem;border:1px solid var(--v16);color:var(--tx2)}
.seance{font-size:.74rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.phase.vif{border-color:var(--or);color:var(--tx-or)}
.badge{font-size:.68rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;border-radius:6px;padding:.12rem .45rem;
  border:1px dashed var(--or);color:var(--tx-or)}
.bascule{display:flex;align-items:center;gap:.4rem;font-weight:600;font-size:.86rem;cursor:pointer}
.bascule input{width:auto}

.grille{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(250px,300px) minmax(0,1fr) minmax(270px,340px);
  gap:.75rem;padding:.75rem 1rem}
@media (max-width:1000px){.grille{grid-template-columns:1fr;overflow:auto}}
.col{min-width:0;min-height:0;display:flex;flex-direction:column;gap:.75rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:12px;padding:.85rem .95rem;min-height:0}
h2{margin:0;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--tx2);font-weight:700}
.aide{font-size:.8rem;color:var(--tx2)}
input,select{font:inherit;color:var(--tx);background:var(--f-0f1826);border:1px solid var(--v14);border-radius:8px;
  padding:.38rem .55rem;width:100%;min-width:0}
input:focus,select:focus{outline:none;border-color:var(--or)}
button{font:inherit;cursor:pointer;border-radius:8px;padding:.4rem .8rem;border:1px solid var(--v16);background:var(--v05);color:var(--tx)}
button:hover:not(:disabled){background:var(--v10);border-color:var(--v30)}
button:disabled{opacity:.38;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#17202c;font-weight:700}
button.danger{color:var(--tx-err)}
button.lien{background:transparent;border-color:transparent;color:var(--tx2);padding:.3rem .55rem;font-size:.84rem}
button.lien:hover:not(:disabled){color:var(--tx);background:var(--v05)}
button.lien.danger{color:var(--tx-err)}
button.mini{padding:.12rem .45rem;font-size:.74rem;border-radius:6px}

/* Onglets (Article / Reglages ; A suivre / En attente / Ventes) */
.onglets{display:flex;gap:.25rem;border-bottom:1px solid var(--v08);margin:-.15rem 0 .7rem}
.onglets button{background:transparent;border:0;border-bottom:2px solid transparent;border-radius:0;padding:.35rem .6rem;
  color:var(--tx2);font-weight:600;font-size:.84rem}
.onglets button.on{color:var(--tx);border-bottom-color:var(--or)}

/* Colonne de gauche */
.gauche-c{display:flex;flex-direction:column;min-height:0}
.res{display:flex;flex-direction:column;gap:.4rem;margin-top:.55rem;overflow:hidden}
.res .art{border:1px solid var(--v08);border-radius:9px;padding:.45rem .55rem}
.res .art b{display:block;font-size:.88rem}
.vars{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.35rem}
.vars button{padding:.14rem .5rem;font-size:.76rem}
.libre{margin-top:.9rem;padding-top:.75rem;border-top:1px solid var(--v08);display:flex;flex-direction:column;gap:.45rem}
.r2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem}
.champs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem .55rem}
.champ{display:flex;flex-direction:column;gap:.2rem;font-size:.76rem;font-weight:600;color:var(--tx2)}
.unite{position:relative}
.unite input{padding-right:2.1rem}
.unite span{position:absolute;right:.55rem;top:50%;transform:translateY(-50%);font-size:.76rem;color:var(--tx2);pointer-events:none}

/* La scene */
.scene{display:flex;flex-direction:column;gap:.9rem;padding:1rem 1.1rem}
.art-ligne{display:flex;align-items:center;gap:.8rem;min-width:0}
.vign{flex:0 0 auto;width:52px;height:64px;border-radius:9px;background:var(--v06);border:1px solid var(--v08);overflow:hidden;display:flex;align-items:center;justify-content:center}
/* ⚠ UNE VRAIE IMAGE, PAS UN FOND (2026-10-20, sa capture : la robe répétée en mosaïque). Sous les thèmes
   Carbone et Lin, le socle peint le damier de transparence de TOUTES les .vign avec un fond de 12 px :
   une photo posée en background-image prenait cette taille et se répétait. */
.vign img{width:100%;height:100%;object-fit:contain;display:block}
.vign img[hidden]{display:none}
.sur{font-size:.68rem;text-transform:uppercase;letter-spacing:.12em;color:var(--tx2);font-weight:700}
.nom-art{font-size:1.15rem;font-weight:800;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chiffres{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.9rem}
.bloc{border:1px solid var(--v08);border-radius:11px;padding:.75rem .9rem;display:flex;flex-direction:column;gap:.25rem;min-width:0}
.lbl{font-size:.68rem;text-transform:uppercase;letter-spacing:.14em;color:var(--tx2);font-weight:700}
.chrono{font-size:3.2rem;font-weight:800;line-height:1;font-variant-numeric:tabular-nums;color:var(--tx-or)}
.montant{font-size:3.2rem;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}
.qui{font-weight:700;color:var(--tx-or);min-height:1.2em}
.barre{height:6px;border-radius:4px;background:var(--v08);overflow:hidden;margin-top:.35rem}
.barre i{display:block;height:100%;width:0;background:var(--or);transition:width .2s linear}
.actions{display:grid;grid-template-columns:2fr 1fr 1fr;gap:.55rem}
.actions button{padding:.8rem .6rem;font-weight:700;font-size:.95rem}
.actions-sec{display:flex;flex-wrap:wrap;gap:.2rem;justify-content:space-between;border-top:1px solid var(--v08);padding-top:.55rem}
.gagnant{border:1px solid var(--or);border-radius:11px;padding:.75rem .9rem;display:flex;flex-direction:column;gap:.45rem}
.gagnant .qui-g{font-size:1.1rem;font-weight:800}
.copie{font-size:.84rem;background:var(--v05);border-radius:8px;padding:.45rem .6rem}
/* La vente (2026-10-23, lot 2) : le lien de paiement de la gagnante et son etat */
.vente{border-top:1px solid var(--v08);padding-top:.5rem;display:flex;flex-direction:column;gap:.4rem}
.vente .etat-v{font-size:.84rem;font-weight:700}
.vente .etat-v.ok{color:var(--tx-ok)}
.vente .etat-v.err{color:var(--tx-err)}
.vente .lien-v{font-size:.78rem;color:var(--tx2);word-break:break-all;user-select:all}
.puce-v{font-size:.7rem;font-weight:700;border-radius:99px;padding:.05rem .5rem;border:1px solid var(--v14);color:var(--tx2);white-space:nowrap}
.puce-v.ok{border-color:var(--tx-ok);color:var(--tx-ok)}
.puce-v.err{border-color:var(--tx-err);color:var(--tx-err)}

/* Listes du bas */
/* (2026-10-25, audit) BORNEES ET EN PAGES MESUREES (data-pages) : au-dela de quelques articles
   « A suivre », d attentes ou de ventes, les lignes du bas sortaient de la carte avec leurs boutons
   (Retirer, GAGNE recu, Remettre en vente, Copier). Chaque liste vit dans une enveloppe .pgl, que
   l onglet cache : le pied de pages du socle (pose juste apres la liste) se cache avec elle. */
.bas{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
.pgl{flex:1 1 0;min-height:0;display:flex;flex-direction:column}
.liste{display:flex;flex-direction:column;gap:.3rem;overflow:hidden;min-height:0;flex:1 1 0}
.ln{display:flex;justify-content:space-between;align-items:center;gap:.6rem;padding:.38rem .55rem;border-radius:8px;background:var(--v05);font-size:.84rem}
.ln .v{color:var(--tx2);white-space:nowrap}
.ln.bon .v{color:var(--tx-ok);font-weight:700}
.ln .act{display:flex;gap:.3rem;flex:0 0 auto}

/* Le fil des commentaires */
.flux{display:flex;flex-direction:column;min-height:0}
.flux-tete{display:flex;align-items:baseline;justify-content:space-between;gap:.5rem;margin-bottom:.6rem}
.fil{flex:1 1 auto;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:.35rem}
.cm{display:flex;flex-direction:column;gap:.25rem;padding:.42rem .55rem;border-radius:9px;background:var(--v05);border-left:3px solid transparent}
.cm.v-retenue{border-left-color:var(--tx-ok)}
.cm.v-annulee,.cm.v-bloque{opacity:.6}
.cm .h{display:flex;justify-content:space-between;align-items:baseline;gap:.5rem;font-size:.84rem}
.cm .h b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cm .t{font-size:.9rem;word-break:break-word}
.cm .pied-cm{display:flex;justify-content:space-between;align-items:center;gap:.4rem}
.puce{font-size:.7rem;font-weight:700;border-radius:99px;padding:.05rem .5rem;border:1px solid var(--v14);color:var(--tx2);white-space:nowrap}
.cm.v-retenue .puce{border-color:var(--tx-ok);color:var(--tx-ok)}
.modo{display:flex;gap:.25rem}
.compo{border-top:1px solid var(--v08);margin-top:.6rem;padding-top:.6rem;display:flex;flex-direction:column;gap:.45rem}
.compo .ligne{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1fr) auto;gap:.4rem}
.bloques{margin-top:.5rem;display:flex;flex-wrap:wrap;gap:.3rem;align-items:center}

/* La lecture du vrai direct (2026-10-23, lot 3) */
.direct{display:flex;flex-direction:column;gap:.4rem;margin-bottom:.6rem;padding-bottom:.6rem;border-bottom:1px solid var(--v08)}
.direct .ligne-d{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.4rem}
.etat-d{display:flex;align-items:center;gap:.4rem;font-size:.8rem;color:var(--tx2)}
.etat-d i{width:.55rem;height:.55rem;border-radius:50%;background:var(--v30);flex:0 0 auto}
.etat-d.ok i{background:var(--tx-ok)}
.etat-d.att i{background:var(--or)}
.etat-d.err i{background:var(--tx-err)}
.alerte-d{border:1px solid var(--tx-err);color:var(--tx-err);border-radius:10px;padding:.6rem .75rem;font-size:.86rem;font-weight:600;display:flex;gap:.6rem;align-items:center;justify-content:space-between}
.alerte-d.att{border-color:var(--or);color:var(--tx-or)}
.alerte-d[hidden]{display:none}
.src{font-size:.66rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2);margin-left:.35rem}
.pied{flex:0 0 auto;border-top:1px solid var(--v08);padding:.4rem 1.1rem;min-height:2.1rem}
.pied .msg{font-size:.84rem}
`;

function pageEncan() {
  return `${TETE()}
<title>${T("Encan en direct")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete">
  <div class="gauche"><h1>${T("Encan en direct")}</h1><span class="phase" id="phase"></span><span class="badge" id="badge-essai">${T("Mode essai")}</span><span class="seance" id="seance"></span></div>
  <div class="droite">
    <button id="rapports" title="${T("Les rapports de séance : déroulement, argent, acheteuses, comparaison")}">${T("Rapports")}</button>
    <button id="nouvelle-seance" title="${T("Clore la séance en cours ; la suivante commence au prochain encan lancé")}">${T("Nouvelle séance")}</button>
    <label class="bascule"><input type="checkbox" id="essai" checked>${T("Mode essai")}</label>
    <button id="ecran">${T("Écran filmé")}</button>
    <button id="ecran-plein">${T("Plein écran sur l’autre moniteur")}</button>
  </div>
</div>
<div class="grille">
  <div class="col">
    <div class="carte gauche-c" style="flex:1 1 auto">
      <div class="onglets" role="tablist">
        <button type="button" class="on" data-onglet="art" role="tab">${T("Article")}</button>
        <button type="button" data-onglet="reg" role="tab">${T("Réglages")}</button>
      </div>
      <div id="p-art">
        <label class="champ">${T("Chercher un article")}<input id="recherche" maxlength="60" autocomplete="off" placeholder="${T("Nom, SKU ou code-barres")}"></label>
        <div class="res" id="res"></div>
        <div class="libre">
          <div class="champ">${T("Ou un article libre")}</div>
          <input id="libre-nom" maxlength="80" aria-label="${T("Nom de l’article")}" placeholder="${T("Nom de l’article")}">
          <input id="libre-var" maxlength="80" aria-label="${T("Taille, couleur")}" placeholder="${T("Taille, couleur")}">
          <div class="r2"><button id="libre-charger">${T("Mettre à l’encan")}</button><button id="libre-file">${T("Ajouter à la file")}</button></div>
        </div>
      </div>
      <div id="p-reg" hidden>
        <div class="champs">
          <label class="champ">${T("Départ")}<span class="unite"><input id="r-depart" type="number" min="0" max="100000" step="1"><span>$</span></span></label>
          <label class="champ">${T("Durée")}<span class="unite"><input id="r-duree" type="number" min="5" max="600" step="5"><span>s</span></span></label>
          <label class="champ">${T("Ajout par offre")}<span class="unite"><input id="r-ajout" type="number" min="1" max="120" step="1"><span>s</span></span></label>
          <label class="champ">${T("Jamais plus de")}<span class="unite"><input id="r-plafond" type="number" min="5" max="600" step="5"><span>s</span></span></label>
          <label class="champ">${T("Hausse minimale")}<span class="unite"><input id="r-hausse" type="number" min="0.01" max="10000" step="0.5"><span>$</span></span></label>
          <label class="champ">${T("Sans offre, relance à")}<span class="unite"><input id="r-sous" type="number" min="1" max="30" step="1"><span>s</span></span></label>
          <label class="champ">${T("…et repart à")}<span class="unite"><input id="r-a" type="number" min="5" max="120" step="1"><span>s</span></span></label>
          <label class="champ">${T("Délai « GAGNÉ »")}<span class="unite"><input id="r-delai" type="number" min="1" max="60" step="1"><span>${T("min")}</span></span></label>
        </div>
        <div class="aide" style="margin-top:.7rem">${T("Les réglages se changent entre deux encans.")}</div>
      </div>
    </div>
  </div>

  <div class="col">
    <div class="carte scene">
      <div class="alerte-d" id="alerte-d" hidden><span id="alerte-d-texte"></span><button class="mini" id="alerte-d-vu">${T("Compris")}</button></div>
      <div class="art-ligne"><div class="vign"><img id="vign" alt="" hidden></div>
        <div style="min-width:0"><div class="sur">${T("Article en cours")}</div><div class="nom-art" id="article"></div><div class="aide" id="art-sous"></div></div></div>
      <div class="chiffres">
        <div class="bloc"><div class="lbl" id="lbl-temps">${T("Temps restant")}</div><div class="chrono" id="chrono">0:00</div><div class="barre"><i id="barre"></i></div></div>
        <div class="bloc"><div class="lbl" id="lbl-prix">${T("Enchère")}</div><div class="montant" id="prix">—</div><div class="qui" id="meneur"></div><div class="aide" id="prochaine"></div></div>
      </div>
      <div class="gagnant" id="carte-gagnant" hidden>
        <div class="lbl">${T("Gagnante")}</div>
        <div class="qui-g" id="gagnant"></div>
        <div class="aide" id="gagnant-delai"></div>
        <div class="copie" id="copie"></div>
        <div class="r2"><button id="copier">${T("Copier le message pour les commentaires")}</button><button class="prim" id="g-gagne">${T("Message GAGNÉ reçu")}</button></div>
        <div class="vente" id="vente">
          <div class="etat-v" id="vente-etat"></div>
          <div class="lien-v" id="vente-lien"></div>
          <button id="copier-prive" hidden>${T("Copier le message privé (avec son lien de paiement)")}</button>
        </div>
      </div>
      <div class="actions">
        <button class="prim" id="g-principal">${T("Démarrer")}</button>
        <button id="g-plus">${T("+15 s")}</button>
        <button id="g-adjuger">${T("Adjuger")}</button>
      </div>
      <div class="actions-sec">
        <button class="lien" id="g-suivant">${T("Article suivant")}</button>
        <button class="lien" id="g-garde">${T("Page de garde")}</button>
        <button class="lien" id="g-remettre">${T("Remettre à zéro")}</button>
        <button class="lien" id="g-remise">${T("Remettre en vente")}</button>
        <button class="lien danger" id="g-annuler">${T("Annuler l’encan")}</button>
      </div>
    </div>
    <div class="carte bas">
      <div class="onglets" role="tablist">
        <button type="button" class="on" data-liste="file" role="tab">${T("À suivre")}</button>
        <button type="button" data-liste="att" role="tab">${T("En attente de « GAGNÉ »")}</button>
        <button type="button" data-liste="ventes" role="tab">${T("Ventes de la séance")}</button>
      </div>
      <div class="pgl" id="w-file"><div class="liste" id="l-file" data-pages="encan-file"></div></div>
      <div class="pgl" id="w-att" hidden><div class="liste" id="l-att" data-pages="encan-att"></div></div>
      <div class="pgl" id="w-ventes" hidden><div class="liste" id="l-ventes" data-pages="encan-ventes"></div></div>
    </div>
  </div>

  <div class="col">
    <div class="carte flux" style="flex:1 1 auto">
      <div class="flux-tete"><h2>${T("Commentaires du direct")}</h2><span class="aide" id="flux-etat"></span></div>
      <div class="direct" id="bloc-direct">
        <div class="ligne-d">
          <input id="d-compte" maxlength="60" autocomplete="off" aria-label="${T("Compte TikTok du direct")}" placeholder="${T("@compte TikTok")}">
          <button class="prim" id="d-bascule">${T("Se brancher")}</button>
        </div>
        <div class="etat-d" id="d-etat"><i></i><span id="d-texte">${T("Non branché : les commentaires du direct ne sont pas lus.")}</span></div>
        <div class="aide" id="d-silence"></div>
      </div>
      <div class="fil" id="journal"></div>
      <div class="bloques" id="bloques"></div>
      <div class="compo" id="carte-essai">
        <div class="champ" id="compo-titre">${T("Simuler un commentaire")}</div>
        <div class="ligne">
          <input id="e-pseudo" maxlength="40" aria-label="${T("Pseudo")}" value="@essai_1">
          <input id="e-texte" maxlength="140" aria-label="${T("Commentaire")}" placeholder="${T("ex. 25")}">
          <button class="prim" id="e-envoyer">${T("Envoyer")}</button>
        </div>
        <button id="e-rafale">${T("Rafale de 10 offres")}</button>
      </div>
    </div>
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
    introuvable: '${T("Cet élément n’existe plus.")}',
    indisponible: '${T("Cette version de l’application ne connaît pas l’encan.")}',
    /* (2026-10-25, audit) Les refus de la CAISSE (scan, recherche) : sans eux, une session expiree
       se lisait « Article introuvable. » et la recherche restait vide sans un mot. */
    session: '${T("Session expirée : reconnectez-vous dans la fenêtre principale.")}',
    droit: '${T("Votre rôle ne donne pas accès au catalogue de la caisse.")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}'
  };
  /* La vente au serveur (2026-10-23) : pourquoi il n y a pas de lien. */
  var MOTIFS_VENTE = {
    article_catalogue: '${T("Article libre : pas de lien de paiement. Mettez à l’encan un article du catalogue.")}',
    epuise: '${T("Article épuisé : plus aucune unité à réserver. Aucun lien n’a été créé.")}',
    variante_inconnue: '${T("Cette taille ou couleur n’existe plus sur la fiche : aucun lien n’a été créé.")}',
    produit_introuvable: '${T("La fiche de l’article est introuvable : aucun lien n’a été créé.")}',
    session: '${T("Session expirée : reconnectez-vous dans la fenêtre principale.")}',
    droit: '${T("Votre rôle ne permet pas de vendre (droit « commandes »).")}',
    pont_indisponible: '${T("Fenêtre principale fermée : le lien n’a pas pu être créé.")}'
  };
  var PHASES = { garde: '${T("Page de garde")}', pret: '${T("Prêt")}', encours: '${T("En cours")}', pause: '${T("En pause")}',
    adjuge: '${T("Adjugé — en attente de « GAGNÉ »")}', expire: '${T("Délai passé")}', vendu: '${T("Vendu")}', annule: '${T("Annulé")}' };
  var VERDICTS = { retenue: '${T("offre retenue")}', trop_basse: '${T("trop basse")}', sous_depart: '${T("sous le départ")}',
    pas_offre: '${T("commentaire")}', pause: '${T("pendant la pause")}', fermee: '${T("encan fermé")}',
    annulee: '${T("offre annulée")}', bloque: '${T("pseudo bloqué")}', gagne_ecrit: '${T("a écrit GAGNÉ ici — le lien part en message privé")}' };

  function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function argent(n){ return szArgent(Number(n) || 0); }
  function chrono(ms){ var s = Math.ceil(Math.max(0, ms) / 1000), m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
  function deux(n){ return (n < 10 ? '0' : '') + n; }
  function heure(t){ try { var d = new Date(t); return deux(d.getHours()) + ':' + deux(d.getMinutes()) + ':' + deux(d.getSeconds()); } catch (e) { return ''; } }
  function geste(nom, args){
    if (!EN) { szDire(MOTIFS.indisponible, 'err'); return Promise.resolve({ ok: false }); }
    return EN.geste(nom, args || []).then(function(r){
      if (r && !r.ok) szDire(MOTIFS[r.motif] || ('${T("Refusé : ")}' + (r.motif || '?')), 'err');
      return r || { ok: false };
    });
  }

  // ── Onglets ──
  Array.prototype.forEach.call(document.querySelectorAll('[data-onglet]'), function(b){
    b.onclick = function(){
      Array.prototype.forEach.call(document.querySelectorAll('[data-onglet]'), function(x){ x.classList.toggle('on', x === b); });
      $('p-art').hidden = b.getAttribute('data-onglet') !== 'art';
      $('p-reg').hidden = b.getAttribute('data-onglet') !== 'reg';
    };
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-liste]'), function(b){
    b.onclick = function(){
      var k = b.getAttribute('data-liste');
      Array.prototype.forEach.call(document.querySelectorAll('[data-liste]'), function(x){ x.classList.toggle('on', x === b); });
      $('w-file').hidden = k !== 'file'; $('w-att').hidden = k !== 'att'; $('w-ventes').hidden = k !== 'ventes';
      // Un attribut hidden ne reveille pas l observateur du socle : la liste montree se remesure ici.
      if (typeof szPagesTout === 'function') szPagesTout();
    };
  });

  // ── Reglages ──
  function poserReglages(){
    if (!E || !E.reglages) return;
    var g = E.reglages;
    $('r-depart').value = g.depart; $('r-duree').value = g.duree; $('r-ajout').value = g.ajout; $('r-plafond').value = g.plafond; $('r-hausse').value = g.hausse;
    $('r-sous').value = g.relanceSous; $('r-a').value = g.relanceA; $('r-delai').value = Math.round(g.delaiGagne / 60);
  }
  function lireReglages(){
    return { depart: +$('r-depart').value, duree: +$('r-duree').value, ajout: +$('r-ajout').value, plafond: +$('r-plafond').value, hausse: +$('r-hausse').value,
      relanceSous: +$('r-sous').value, relanceA: +$('r-a').value, delaiGagne: (+$('r-delai').value || 15) * 60 };
  }
  ['r-depart','r-duree','r-ajout','r-plafond','r-hausse','r-sous','r-a','r-delai'].forEach(function(id){
    $(id).onchange = function(){ geste('regler', [lireReglages()]).then(function(r){ if (!r.ok) poserReglages(); }); };
  });

  // ── Le dessin ──
  function dessiner(){
    if (!E) return;
    var enJeu = E.phase === 'encours' || E.phase === 'pause';
    var a = E.article, aucune = !E.nbOffres;
    $('phase').textContent = PHASES[E.phase] || E.phase;
    /* (2026-10-25, lot 4) La séance du direct : depuis quand, combien d encans, combien d adjugés. */
    var se = E.seance || null, elSe = $('seance');
    if (elSe) {
      if (se && se.debut) {
        var mn = Math.max(0, Math.round(((se.fin || se.debut) - se.debut) / 60000));
        elSe.textContent = '${T("Séance :")} ' + (mn >= 60 ? Math.floor(mn / 60) + ' h ' + ('0' + (mn % 60)).slice(-2) : mn + ' min') + ' · '
          + se.encans + ' ' + (se.encans > 1 ? '${T("encans")}' : '${T("encan")}') + ' · ' + se.adjuges + ' ' + (se.adjuges > 1 ? '${T("adjugés")}' : '${T("adjugé")}');
      } else elSe.textContent = '${T("Séance : commence au premier encan lancé")}';
    }
    var bNs = $('nouvelle-seance'); if (bNs) bNs.disabled = !(se && se.debut) || enJeu;
    $('phase').classList.toggle('vif', enJeu || E.phase === 'adjuge');
    $('essai').checked = !!E.essai;
    $('badge-essai').hidden = !E.essai;
    /* La saisie : simulee en mode essai ; hors essai, c est le SECOURS (une offre lue dans TikTok, tapee ici). */
    $('carte-essai').hidden = false;
    $('compo-titre').textContent = E.essai ? '${T("Simuler un commentaire")}' : '${T("Saisie manuelle (secours) : une offre lue dans TikTok")}';
    $('e-rafale').hidden = !E.essai;
    if (!E.essai && $('e-pseudo').value === '@essai_1') $('e-pseudo').value = '';
    $('e-pseudo').placeholder = '@pseudo';
    dessinerDirect();
    $('article').textContent = a ? a.nom : '${T("Aucun article")}';
    $('art-sous').textContent = a ? (a.variante || '') : '${T("Cherchez un article à gauche, ou passez à l’article suivant.")}';
    var vi = $('vign'), src = (a && a.image) ? String(a.image) : '';
    if (vi.getAttribute('src') !== src) { if (src) vi.setAttribute('src', src); else vi.removeAttribute('src'); }
    vi.hidden = !src;
    $('lbl-prix').textContent = aucune ? '${T("Mise de départ")}' : '${T("Enchère")}' + ' · ' + E.nbOffres + ' ' + (E.nbOffres > 1 ? '${T("offres")}' : '${T("offre")}');
    $('prix').textContent = argent(aucune ? E.reglages.depart : E.prix);
    $('meneur').textContent = aucune ? '' : E.meneur;
    $('prochaine').textContent = enJeu ? ('${T("Offre suivante : {n} ou plus")}'.replace('{n}', argent(E.prochaine)) + (aucune && E.relances ? ' · ' + '${T("relances : ")}' + E.relances : '')) : '';

    var pr = $('g-principal');
    pr.textContent = E.phase === 'encours' ? '${T("Pause")}' : E.phase === 'pause' ? '${T("Reprendre")}' : '${T("Démarrer")}';
    pr.disabled = !(E.phase === 'pret' || enJeu);
    $('g-plus').textContent = '+' + E.reglages.ajout + ' s';
    $('g-plus').disabled = !enJeu;
    $('g-adjuger').disabled = !enJeu || aucune;
    $('g-suivant').disabled = enJeu || !E.nbFile;
    $('g-garde').disabled = enJeu || E.phase === 'garde';
    $('g-remettre').disabled = !a || E.phase === 'garde' || E.phase === 'pret';
    $('g-remise').hidden = !(E.phase === 'adjuge' || E.phase === 'expire');
    $('g-annuler').disabled = !a || E.phase === 'vendu' || E.phase === 'annule' || E.phase === 'garde';
    if (!REGLAGES_POSES) { poserReglages(); REGLAGES_POSES = true; }
    ['r-depart','r-duree','r-ajout','r-plafond','r-hausse','r-sous','r-a','r-delai'].forEach(function(id){ $(id).disabled = enJeu; });

    var g = E.gagnant, montre = E.phase === 'adjuge' || E.phase === 'expire';
    $('carte-gagnant').hidden = !(g && (montre || E.phase === 'vendu'));
    if (g) {
      $('gagnant').textContent = g.pseudo + ' — ' + argent(g.montant);
      $('copie').textContent = '${T("{p} tu as gagné {a} à {m} ! Écris-nous GAGNÉ en message privé dans les {n} minutes.")}'
        .replace('{p}', g.pseudo).replace('{a}', a ? a.nom : '').replace('{m}', argent(g.montant)).replace('{n}', String(Math.round(E.reglages.delaiGagne / 60)));
      $('g-gagne').disabled = E.phase !== 'adjuge';
      dessinerVente(g, a);
    }

    // Le fil : le plus recent en haut, avec la moderation de l encan.
    var bloques = {}; (E.bloques || []).forEach(function(p){ bloques[p] = true; });
    $('journal').innerHTML = (E.journal || []).map(function(j){
      var pseudoBas = String(j.pseudo || '').toLowerCase();
      var modo = '';
      if (j.verdict === 'retenue' && j.offre && enJeu) modo += '<button class="mini" data-annuler="' + esc(j.offre) + '">${T("Annuler l’offre")}</button>';
      if (!bloques[pseudoBas]) modo += '<button class="mini danger" data-bloquer="' + esc(j.pseudo) + '">${T("Bloquer")}</button>';
      var src = j.source === 'manuel' ? '<span class="src">${T("saisi")}</span>' : j.source === 'essai' ? '<span class="src">${T("simulé")}</span>' : '';
      return '<div class="cm v-' + esc(j.verdict) + '"><div class="h"><b>' + esc(j.pseudo) + src + '</b><span class="aide">' + heure(j.t) + '</span></div>'
        + '<div class="t">' + esc(j.texte) + '</div>'
        + '<div class="pied-cm"><span class="puce">' + esc(VERDICTS[j.verdict] || j.verdict) + '</span><span class="modo">' + modo + '</span></div></div>';
    }).join('') || '<div class="aide">' + (E.essai ? '${T("Aucun commentaire pour l’instant. Simulez-en un ci-dessous.")}' : '${T("Aucun commentaire pour l’instant.")}') + '</div>';
    $('flux-etat').textContent = E.essai ? '${T("mode essai : simulés et direct")}' : '';
    $('bloques').innerHTML = (E.bloques || []).length ? '<span class="aide">${T("Bloqués :")}</span>' + E.bloques.map(function(p){
      return '<button class="mini" data-debloquer="' + esc(p) + '" title="${T("Débloquer")}">' + esc(p) + ' <span class="ic">✕</span></button>';
    }).join('') : '';

    // Les listes du bas.
    $('l-file').innerHTML = (E.file || []).map(function(f){
      return '<div class="ln"><span>' + esc([f.nom, f.variante].filter(Boolean).join(' · ')) + '</span><span class="act"><button class="mini" data-retirer="' + esc(f.cle) + '">${T("Retirer")}</button></span></div>';
    }).join('') || '<div class="aide">${T("Rien en file : ajoutez des articles depuis la gauche.")}</div>';
    $('l-att').innerHTML = (E.attentes || []).map(function(x){
      var lien = x.vente && x.vente.url ? '<button class="mini" data-prive="' + esc(x.cle) + '">${T("Copier le message privé")}</button>' : '';
      return '<div class="ln"><span><b>' + esc(x.pseudo) + '</b> · ' + esc(x.article ? x.article.nom : '') + ' · ' + argent(x.montant)
        + ' · <span class="v" data-reste="' + esc(x.cle) + '">' + chrono(x.restantMs) + '</span> ' + puceVente(x.vente) + '</span>'
        + '<span class="act">' + lien + '<button class="mini" data-gagne="' + esc(x.cle) + '">${T("GAGNÉ reçu")}</button><button class="mini" data-remise="' + esc(x.cle) + '">${T("Remettre en vente")}</button></span></div>';
    }).join('') || '<div class="aide">${T("Personne n’attend : chaque gagnante a écrit « GAGNÉ ».")}</div>';
    $('l-ventes').innerHTML = (E.historique || []).map(function(h){
      var lib = h.issue === 'vendu' ? '${T("vendu")}' : h.issue === 'remis' ? '${T("remis en vente")}' : '${T("annulé")}';
      var v = h.gagnant && h.gagnant.vente;
      var copie = (h.issue === 'vendu' && v && v.url && v.etat === 'attente') ? ' <button class="mini" data-prive-h="' + esc(v.id) + '">${T("Copier le message privé")}</button>' : '';
      return '<div class="ln ' + (h.issue === 'vendu' ? 'bon' : '') + '"><span>' + esc(h.article ? h.article.nom : '') + (h.gagnant ? ' · ' + esc(h.gagnant.pseudo) + ' ' + argent(h.gagnant.montant) : '') + '</span><span class="v">' + lib + ' ' + (h.issue === 'vendu' ? puceVente(v) : '') + copie + '</span></div>';
    }).join('') || '<div class="aide">${T("Aucune vente encore.")}</div>';
    temps();
  }
  /* ── La lecture du vrai direct (2026-10-23, lot 3) ── */
  var D_TEXTES = {
    eteint: '${T("Non branché : les commentaires du direct ne sont pas lus.")}',
    connexion: '${T("Connexion au direct…")}',
    branche: '${T("Branché sur le direct")}',
    hors_ligne: '${T("Ce compte n’est pas en direct : nouvel essai toutes les 30 s.")}',
    coupe: '${T("Lecture coupée : reconnexion…")}',
    fin: '${T("Le direct est terminé.")}',
    erreur: '${T("Lecture impossible")}'
  };
  function dessinerDirect(){
    var d = E && E.direct;
    var st = d ? d.statut : 'eteint';
    var el = $('d-etat');
    el.className = 'etat-d ' + (st === 'branche' ? 'ok' : (st === 'connexion' || st === 'hors_ligne' || st === 'coupe') ? 'att' : (st === 'erreur' || st === 'fin') ? 'err' : '');
    var t = D_TEXTES[st] || st;
    if (d && st === 'branche') t += ' @' + d.compte + ' · ' + d.parMinute + ' ' + '${T("comm./min")}' + ' · ' + d.nb + ' ' + '${T("reçus")}';
    if (d && st === 'erreur' && d.detail) t += ' : ' + d.detail + '. ' + '${T("Utilisez la saisie manuelle.")}';
    if (d && (st === 'coupe' || st === 'hors_ligne') && d.prochainEssai) t += ' (' + Math.max(0, Math.ceil((d.prochainEssai - Date.now()) / 1000)) + ' s)';
    $('d-texte').textContent = t;
    var actif = st !== 'eteint';
    $('d-bascule').textContent = actif ? '${T("Se débrancher")}' : '${T("Se brancher")}';
    $('d-bascule').className = actif ? '' : 'prim';
    $('d-compte').disabled = actif;
    // L alerte de coupure, au centre : l encan a ete mis en pause.
    var al = d && d.alerte ? d.alerte : '', zone = $('alerte-d');
    zone.hidden = !al;
    zone.className = 'alerte-d' + (/_retabli$/.test(al) ? ' att' : '');
    $('alerte-d-texte').textContent = al === 'coupe' ? '${T("Commentaires coupés : l’encan est EN PAUSE. Reconnexion en cours…")}'
      : al === 'fin' ? '${T("Le direct est terminé : l’encan est en pause.")}'
      : /_retabli$/.test(al) ? '${T("Lecture rétablie. L’encan est toujours en pause : vérifiez dans TikTok les offres faites pendant la coupure (saisie manuelle), puis Reprendre.")}' : '';
  }
  // Silence anormal pendant un encan : rien recu depuis 45 s alors que la lecture se dit branchee.
  function silence(){
    var d = E && E.direct;
    if (!d || d.statut !== 'branche' || !E || E.phase !== 'encours') return '';
    var depuis = Date.now() - Math.max(d.dernier || 0, d.depuis || 0);
    return depuis > 45000 ? '${T("Aucun commentaire reçu depuis {n} s : vérifiez que le direct est bien celui-ci.")}'.replace('{n}', String(Math.round(depuis / 1000))) : '';
  }
  setInterval(function(){ if (E) { $('d-silence').textContent = silence(); if (E.direct && (E.direct.statut === 'coupe' || E.direct.statut === 'hors_ligne')) dessinerDirect(); } }, 1000);
  $('d-bascule').onclick = function(){
    if (!EN || !EN.direct) { szDire(MOTIFS.indisponible, 'err'); return; }
    var actif = E && E.direct && E.direct.statut !== 'eteint';
    EN.direct(actif ? { action: 'debrancher' } : { action: 'brancher', compte: $('d-compte').value }).then(function(r){
      if (r && !r.ok) szDire(r.motif === 'compte_invalide' ? '${T("Compte TikTok invalide : écrivez le @pseudo du direct (ou collez son lien).")}' : ('${T("Refusé : ")}' + (r.motif || '?')), 'err');
    });
  };
  $('d-compte').onkeydown = function(ev){ if (ev.key === 'Enter') $('d-bascule').click(); };
  $('alerte-d-vu').onclick = function(){ if (EN && EN.direct) EN.direct({ action: 'vu' }); };

  /* ── La vente de la gagnante (2026-10-23, lot 2) : le lien de paiement personnel et son etat ── */
  function heureFin(t){ try { var d = new Date(t * 1000); return deux(d.getHours()) + ' h ' + deux(d.getMinutes()); } catch (e) { return ''; } }
  function messagePrive(g, a){
    var v = g && g.vente;
    if (!v || !v.url) return '';
    return '${T("Bravo {p} ! Voici ton lien personnel pour payer {a} ({m}) : {u} La livraison et les taxes sont calculées sur la page. Vente finale, aucun retour. Le lien est valide 24 h.")}'
      .replace('{p}', g.pseudo).replace('{a}', a ? a.nom : '').replace('{m}', argent(g.montant)).replace('{u}', v.url);
  }
  function puceVente(v){
    if (!v) return '';
    if (v.etat === 'creation') return '<span class="puce-v">${T("lien en création")}</span>';
    if (v.etat === 'erreur') return '<span class="puce-v err">${T("pas de lien")}</span>';
    if (v.etat === 'payee') return '<span class="puce-v ok">${T("payée")}' + (v.commande ? ' · ' + esc(v.commande) : '') + '</span>';
    if (v.etat === 'expiree') return '<span class="puce-v err">${T("non payée — délai passé")}</span>';
    if (v.etat === 'annulee' || v.etat === 'fermeture') return '<span class="puce-v">${T("lien annulé")}</span>';
    if (v.essai) return '<span class="puce-v">${T("lien d’essai")}</span>';
    return '<span class="puce-v">' + (v.courriel ? '${T("lien envoyé par courriel")}' : v.paiementOuvert ? '${T("paiement en cours")}' : v.adresse ? '${T("adresse saisie")}' : '${T("en attente de paiement")}') + '</span>';
  }
  function dessinerVente(g, a){
    var v = g.vente, et = $('vente-etat'), li = $('vente-lien'), cp = $('copier-prive');
    et.className = 'etat-v'; li.textContent = ''; cp.hidden = true;
    if (!v || v.etat === 'creation') { et.textContent = '${T("Création du lien de paiement…")}'; return; }
    if (v.etat === 'erreur') { et.className = 'etat-v err'; et.textContent = MOTIFS_VENTE[v.motif] || ('${T("Le lien de paiement n’a pas pu être créé : ")}' + (v.motif || '?')); return; }
    if (v.etat === 'payee') { et.className = 'etat-v ok'; et.textContent = '${T("Payé — commande {c}, prête pour la préparation.")}'.replace('{c}', v.commande || ''); return; }
    if (v.etat === 'expiree') { et.className = 'etat-v err'; et.textContent = '${T("Non payé dans le délai : l’article est revenu en stock.")}'; return; }
    if (v.etat === 'annulee' || v.etat === 'fermeture') { et.textContent = '${T("Lien annulé : l’article est revenu en stock.")}'; return; }
    et.textContent = (v.essai ? '${T("Lien d’ESSAI (aucun paiement possible)")}' : v.courriel ? '${T("Lien envoyé par courriel à {c}")}'.replace('{c}', v.courriel)
      : '${T("Lien de paiement prêt — à envoyer en réponse à son message GAGNÉ")}') + (v.expire ? ' · ' + '${T("valide jusqu’à {h}")}'.replace('{h}', heureFin(v.expire)) : '');
    li.textContent = v.url || '';
    cp.hidden = !v.url;
  }
  function trouverVente(id){
    var h = (E.historique || []).find(function(x){ return x.gagnant && x.gagnant.vente && x.gagnant.vente.id === id; });
    return h ? { g: h.gagnant, a: h.article } : null;
  }
  function copierTexte(t, bon){
    if (!EN || !t) return;
    EN.copier(t).then(function(ok){ szDire(ok ? bon : '${T("La copie a échoué.")}', ok ? 'bon' : 'err'); });
  }

  function temps(){
    if (!E) return;
    var r = E.phase === 'encours' ? Math.max(0, E.restantMs - (Date.now() - RECU)) : E.restantMs;
    $('chrono').textContent = chrono(r);
    $('barre').style.width = (E.dureeMs ? Math.max(0, Math.min(100, r / E.dureeMs * 100)) : 0).toFixed(1) + '%';
    $('lbl-temps').textContent = E.phase === 'pause' ? '${T("Temps arrêté")}' : '${T("Temps restant")}';
    if (E.gagnant && E.phase === 'adjuge') $('gagnant-delai').textContent = '${T("« GAGNÉ » attendu encore ")}' + chrono(E.gagnant.restantMs - (Date.now() - RECU));
    else $('gagnant-delai').textContent = '';
    (E.attentes || []).forEach(function(x){
      var el = document.querySelector('[data-reste="' + x.cle + '"]');
      if (el) el.textContent = chrono(x.restantMs - (Date.now() - RECU));
    });
  }
  setInterval(temps, 200);

  var COMPTE_POSE = false;
  function recevoir(etat){
    if (!etat || !etat.reglages) return;
    E = etat; RECU = Date.now();
    if (!COMPTE_POSE && etat.compteDirect !== undefined) { $('d-compte').value = etat.compteDirect ? '@' + etat.compteDirect : ''; COMPTE_POSE = true; }
    dessiner();
  }
  if (EN) { EN.surEtat(recevoir); EN.lire().then(recevoir); }
  else szDire(MOTIFS.indisponible, 'err');

  // ── Les gestes ──
  $('g-principal').onclick = function(){ if (!E) return; geste(E.phase === 'encours' ? 'pause' : E.phase === 'pause' ? 'reprendre' : 'demarrer'); };
  $('g-plus').onclick = function(){ geste('ajouterTemps', [E ? E.reglages.ajout : 15]); };
  $('g-adjuger').onclick = function(){ geste('adjuger'); };
  /* (2026-10-25, audit) Remettre a zero efface les offres (et, apres l adjudication, la gagnante et
     son lien de paiement) : CONFIRME des qu il y a quelque chose a perdre. */
  $('g-remettre').onclick = function(){
    if (!E || (!(E.nbOffres > 0) && E.phase !== 'adjuge')) { geste('remettre'); return; }
    szConfirmer({ danger: true, titre: '${T("Remettre à zéro")}',
      texte: E.phase === 'adjuge'
        ? '${T("L’adjudication est annulée : la gagnante perd l’article et son lien de paiement est annulé. Toutes les offres sont effacées.")}'
        : '${T("Toutes les offres reçues pour cet article sont effacées et l’encan revient au prix de départ.")}',
      details: [['${T("Offres")}', String(E.nbOffres || 0)]],
      oui: '${T("Remettre à zéro")}' }).then(function(ok){ if (ok) geste('remettre'); });
  };
  $('g-remise').onclick = function(){ geste('remettreEnVente'); };
  $('g-annuler').onclick = function(){
    szConfirmer({ danger: true, titre: '${T("Annuler l’encan")}',
      texte: '${T("L’encan de cet article s’arrête sans gagnante : les offres reçues sont abandonnées. L’article reste disponible pour un prochain encan.")}',
      oui: '${T("Annuler l’encan")}' }).then(function(ok){ if (ok) geste('annuler'); });
  };
  $('g-gagne').onclick = function(){ geste('confirmerGagne').then(function(r){ if (r.ok) szDire('${T("Vendu — noté aux ventes de la séance.")}', 'bon'); }); };
  $('g-garde').onclick = function(){ geste('garde'); };
  $('g-suivant').onclick = function(){ geste('suivant'); };
  $('copier').onclick = function(){
    if (!EN) return;
    EN.copier($('copie').textContent).then(function(ok){ szDire(ok ? '${T("Message copié : collez-le dans les commentaires du direct.")}' : '${T("La copie a échoué.")}', ok ? 'bon' : 'err'); });
  };
  $('copier-prive').onclick = function(){
    if (!E || !E.gagnant) return;
    copierTexte(messagePrive(E.gagnant, E.article), '${T("Message copié : collez-le en réponse à son message privé dans TikTok.")}');
  };
  $('l-ventes').onclick = function(ev){
    var b = ev.target.closest('[data-prive-h]'); if (!b) return;
    var x = trouverVente(b.getAttribute('data-prive-h'));
    if (x) copierTexte(messagePrive(x.g, x.a), '${T("Message copié : collez-le en réponse à son message privé dans TikTok.")}');
  };
  $('essai').onchange = function(){ geste('modeEssai', [this.checked]); };
  $('ecran').onclick = function(){ if (EN) EN.ecran({ pleinEcran: false }); };
  $('rapports').onclick = function(){
    var P0 = window.szPont;
    if (P0 && P0.ouvrirModule) { P0.ouvrirModule('encan-rapports'); szDire('${T("Ouverture des rapports d’encan…")}'); }
  };
  $('nouvelle-seance').onclick = function(){
    szConfirmer({ titre: '${T("Nouvelle séance")}',
      texte: '${T("La séance en cours est close et gardée dans les rapports. La suivante commencera au prochain encan lancé. Les ventes en attente de paiement restent suivies.")}',
      oui: '${T("Clore la séance")}' }).then(function(ok){
      if (ok) geste('nouvelleSeance').then(function(r){ if (r && r.ok) szDire('${T("Séance close : elle est dans les rapports.")}', 'bon'); });
    });
  };
  $('ecran-plein').onclick = function(){ if (EN) EN.ecran({ pleinEcran: true }).then(function(r){ if (r && r.motif === 'un_seul_ecran') szDire('${T("Un seul moniteur branché : l’écran s’ouvre en fenêtre.")}', 'att'); }); };
  $('l-file').onclick = function(ev){ var b = ev.target.closest('[data-retirer]'); if (b) geste('retirerDeFile', [b.getAttribute('data-retirer')]); };
  $('l-att').onclick = function(ev){
    var g = ev.target.closest('[data-gagne]'), r = ev.target.closest('[data-remise]'), pv = ev.target.closest('[data-prive]');
    if (pv) {
      var x = (E.attentes || []).find(function(y){ return y.cle === pv.getAttribute('data-prive'); });
      if (x) copierTexte(messagePrive({ pseudo: x.pseudo, montant: x.montant, vente: x.vente }, x.article), '${T("Message copié : collez-le en réponse à son message privé dans TikTok.")}');
      return;
    }
    if (g) geste('confirmerAttente', [g.getAttribute('data-gagne')]).then(function(x){ if (x.ok) szDire('${T("Vendu — noté aux ventes de la séance.")}', 'bon'); });
    else if (r) geste('remettreAttente', [r.getAttribute('data-remise')]).then(function(x){ if (x.ok) szDire('${T("Remis en vente : en tête de la file.")}', 'bon'); });
  };
  // La moderation de l encan, depuis le fil.
  $('journal').onclick = function(ev){
    var an = ev.target.closest('[data-annuler]'), bl = ev.target.closest('[data-bloquer]');
    if (an) geste('annulerOffre', [an.getAttribute('data-annuler')]).then(function(x){ if (x.ok) szDire('${T("Offre annulée : le prix revient à l’offre précédente.")}', 'bon'); });
    else if (bl) {
      var p = bl.getAttribute('data-bloquer');
      szConfirmer({ danger: true, titre: '${T("Bloquer ce pseudo")}',
        texte: '${T("Les offres de {p} sont retirées de cet encan et ne compteront plus de la séance. Son commentaire reste visible dans TikTok : pour le masquer, faites-le dans TikTok.")}'.replace('{p}', p),
        oui: '${T("Bloquer")}' }).then(function(ok){ if (ok) geste('bloquer', [p]); });
    }
  };
  $('bloques').onclick = function(ev){ var b = ev.target.closest('[data-debloquer]'); if (b) geste('debloquer', [b.getAttribute('data-debloquer')]); };

  // ── Le mode essai ──
  $('e-envoyer').onclick = function(){
    geste('commentaire', [$('e-pseudo').value, $('e-texte').value, E && E.essai ? 'essai' : 'manuel']).then(function(r){ if (r.ok) { $('e-texte').value = ''; $('e-texte').focus(); } });
  };
  $('e-texte').onkeydown = function(ev){ if (ev.key === 'Enter') $('e-envoyer').click(); };
  var NOMS = ['@julie.mtl', '@sophie_b', '@marie.g', '@karine.qc', '@ana_lav', '@nath_22'];
  /* (2026-10-25, audit) UNE rafale a la fois : un double-clic lancait deux minuteries (20 offres). */
  var RAFALE = null;
  $('e-rafale').onclick = function(){
    if (RAFALE) return;
    var n = 0, bR = $('e-rafale');
    bR.disabled = true;
    var t = RAFALE = setInterval(function(){
      if (!E || n >= 10 || E.phase !== 'encours') { clearInterval(t); RAFALE = null; bR.disabled = false; return; }
      var monte = (E.nbOffres ? E.prix : E.reglages.depart - E.reglages.hausse) + E.reglages.hausse * (1 + Math.floor(Math.random() * 3));
      geste('commentaire', [NOMS[Math.floor(Math.random() * NOMS.length)], String(Math.ceil(monte)), 'essai']);
      n++;
    }, 900);
  };

  // ── Choisir un article ──
  var minuterie = null, TROUVES = [];
  function articleDe(x, v){
    return { id: x.id + (v ? ':' + v.cle : ''), produitId: x.id, nom: x.nom, image: x.image || '',
      variante: v ? [v.taille, v.couleur].filter(Boolean).join(' · ') : '', taille: v ? v.taille : '', couleur: v ? v.couleur : '' };
  }
  /* LE LECTEUR DE CODES-BARRES (2026-10-20, sa demande : « ça doit fonctionner avec le scan aussi »).
     Le lecteur tape le code puis Entrée ; le site reconnaît le code d une VARIANTE (forme longue ou compacte)
     et répond « sku » — la réponse que la caisse utilise depuis toujours et que cette fenêtre ignorait :
     le code scanné ne trouvait rien. Un code reconnu met l article à l encan (ou en file si un encan
     tourne) sans passer par la liste, et le champ se vide pour le scan suivant. */
  function scanne(sku){
    P.appeler('caisse:article', sku.produitId, sku.taille, sku.couleur).then(function(r){
      if (!r || !r.ok) { szDire((r && MOTIFS[r.motif]) || '${T("Article introuvable.")}', 'err'); return; }
      var l = r.ligne || {};
      var a = { id: l.productId + ':' + [sku.taille, sku.couleur].join('-'), produitId: l.productId, nom: l.name || '', image: r.image || '',
        variante: [sku.taille, sku.couleur].filter(Boolean).join(' · '), taille: sku.taille || '', couleur: sku.couleur || '' };
      var enJeu = E && (E.phase === 'encours' || E.phase === 'pause');
      geste(enJeu ? 'enFile' : 'charger', [a]).then(function(g){
        if (!g.ok) return;
        $('recherche').value = ''; $('res').innerHTML = ''; $('recherche').focus();
        szDire((enJeu ? '${T("Scanné et ajouté à la file :")} ' : '${T("Scanné, prêt à démarrer :")} ') + a.nom + (a.variante ? ' — ' + a.variante : ''), 'bon');
      });
    });
  }
  function chercher(q, entree){
    clearTimeout(minuterie);
    minuterie = setTimeout(function(){
      if (!q.trim()) { $('res').innerHTML = ''; return; }
      if (!entree && q.trim().length < 3) { $('res').innerHTML = ''; return; }
      P.appeler('caisse:chercher', q).then(function(r){
        if (!r || !r.ok) { $('res').innerHTML = '<div class="aide">' + esc((r && MOTIFS[r.motif]) || '${T("La recherche a échoué.")}') + '</div>'; return; }
        if (r.sku) { scanne(r.sku); return; }
        if (r.court) { $('res').innerHTML = '<div class="aide">${T("Trois caractères minimum pour chercher.")}</div>'; return; }
        TROUVES = r.articles || [];
        $('res').innerHTML = TROUVES.slice(0, 5).map(function(x, i){
          return '<div class="art"><b>' + esc(x.nom) + '</b><span class="aide">' + esc(x.code) + '</span><div class="vars">'
            + (x.variantes || []).map(function(v, j){
              return '<button data-a="' + i + '" data-v="' + j + '"' + (v.quantite > 0 ? '' : ' disabled') + '>' + esc([v.taille, v.couleur].filter(Boolean).join(' · ') || '${T("Unique")}') + ' (' + v.quantite + ')</button>';
            }).join('') + '</div></div>';
        }).join('') || '<div class="aide">${T("Aucun article trouvé.")}</div>';
      });
    }, entree ? 0 : 250);
  }
  $('recherche').oninput = function(){ chercher(this.value, false); };
  $('recherche').onkeydown = function(ev){ if (ev.key === 'Enter') { ev.preventDefault(); chercher(this.value, true); } };
  $('res').onclick = function(ev){
    var b = ev.target.closest('[data-a]'); if (!b) return;
    var x = TROUVES[+b.getAttribute('data-a')]; var v = x && (x.variantes || [])[+b.getAttribute('data-v')];
    if (!x) return;
    var enJeu = E && (E.phase === 'encours' || E.phase === 'pause');
    geste(enJeu ? 'enFile' : 'charger', [articleDe(x, v)]).then(function(r){
      if (r.ok) szDire(enJeu ? '${T("Ajouté à la file.")}' : '${T("Article prêt : appuyez sur Démarrer.")}', 'bon');
    });
  };
  function libre(){ var n = $('libre-nom').value.trim(); return n ? { id: 'libre:' + Date.now().toString(36), nom: n, variante: $('libre-var').value.trim() } : null; }
  function viderLibre(r){ if (r.ok) { $('libre-nom').value = ''; $('libre-var').value = ''; } }
  $('libre-charger').onclick = function(){ var a = libre(); if (!a) { szDire(MOTIFS.article_requis, 'err'); return; } geste('charger', [a]).then(viderLibre); };
  $('libre-file').onclick = function(){ var a = libre(); if (!a) { szDire(MOTIFS.article_requis, 'err'); return; } geste('enFile', [a]).then(viderLibre); };
})();
</script></body></html>`;
}

module.exports = { pageEncan };
