'use strict';

/*
 * FENÊTRE « VENTE AU COMPTOIR » — NATIVE
 * =============================================================================
 * L'écran le plus utilisé de la boutique, écrit dans l'application. Il ne charge
 * aucune page du site et ne fait aucun appel web : tout passe par le pont, qui
 * interroge la fenêtre principale — seule porteuse de la session.
 *
 * ⚠ ELLE VIT À CÔTÉ DE L'ÉCRAN DU SITE, PAS À SA PLACE (décision du 2026-08-07).
 * Les deux coexistent le temps que la caisse native soit éprouvée en boutique.
 * Ce n'est pas de la prudence de principe : si cette fenêtre a un défaut le jour
 * d'un marché, il doit rester un écran qui encaisse. L'écran du site sera retiré
 * quand celle-ci aura fait ses preuves, pas avant.
 *
 * ⚠⚠ AUCUNE RÈGLE DE VENTE N'EST ÉCRITE ICI. Ni taxes, ni prix, ni rabais, ni
 * statut de commande, ni décompte de stock. Tout cela vit dans le site
 * (`Admin._posVente`, `Cart.calcTotals`) et n'existe qu'en UN exemplaire. Cette
 * fenêtre SAISIT et AFFICHE ; elle ne calcule rien. En recopier ne serait-ce que
 * le calcul de taxes garantirait qu'un jour les deux écrans ne donnent plus le
 * même total pour le même panier — et la différence se verrait en comptabilité,
 * des semaines plus tard, sans qu'on sache lequel a raison.
 *
 * ⚠ ELLE N'ENCAISSE JAMAIS UNE CARTE. Saisir un numéro ici ferait basculer la
 * boutique en PCI SAQ-D. On enregistre un paiement DÉJÀ REÇU (comptant, Interac,
 * terminal), ou l'on envoie un lien de paiement pour une vente au téléphone.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, et un accent grave égaré
 * referme la chaîne et casse toute la fenêtre. C'est arrivé six fois sur ce
 * projet, dont deux fois dans un commentaire.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

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
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:.6rem}

/* ⚠ DEUX COLONNES, ET LE CORPS NE DEFILE PAS. La regle du projet : un ecran de
   travail qui defile cache son bouton d action. Seule la LISTE DES ARTICLES a le
   droit de defiler — elle peut grandir, le reste non. */
.corps{flex:1 1 auto;min-height:0;padding:.85rem 1.05rem;overflow:hidden;
  display:grid;grid-template-columns:minmax(0,1.25fr) minmax(340px,.85fr);gap:.85rem}
.col{min-width:0;min-height:0;display:flex;flex-direction:column;gap:.55rem}

/* ⚠⚠ TROIS ETATS SUCCESSIFS SUR CETTE COLONNE — ET LES DEUX PREMIERS ETAIENT
   FAUX, CHACUN A SA MANIERE. A lire avant d y toucher une quatrieme fois.
   1) overflow:hidden, au nom de la regle << un ecran de travail ne defile pas >>.
      Resultat inverse de l intention : sur un ecran de 1350 px de haut, le bouton
      << Enregistrer la vente >> etait COUPE, donc INATTEIGNABLE. La regle existe
      pour que l action reste a portee ; la elle la cachait.
   2) Totaux et encaissement ANCRES en bas, le reste defilant. Le bouton etait
      atteignable, mais la zone defilante s etirait pour remplir la colonne : entre
      la carte Facture et le sous-total s ouvrait un trou de cent soixante pixels.
      Signale par l utilisateur le 2026-08-07, capture a l appui : sur une caisse,
      un grand vide au milieu de l ecran de l argent ne se justifie par rien.
   3) CE QUI EST EN PLACE : tout est empile a la suite, sans trou, et c est la
      COLONNE ENTIERE qui defile quand elle deborde. On ne perd pas ce que
      l etat 2 protegeait — le bouton reste atteignable, puisqu on peut toujours
      l atteindre en defilant, alors que l etat 1 le coupait pour de bon.
   ⚠ CONSEQUENCE ASSUMEE : sur une fenetre tres courte, le total peut sortir du
   champ. Le bouton PORTE LE TOTAL (<< Enregistrer la vente — 77,61 $ >>) : le
   chiffre reste donc sous les yeux au moment ou il compte, c est-a-dire au moment
   de presser. */
.col.droite{min-height:0}
.defile{flex:1 1 auto;min-height:0;overflow-y:auto;display:flex;
  flex-direction:column;gap:.55rem;padding-right:.2rem;
  /* Les cartes se suivent en haut : sans ceci, une colonne plus haute que son
     contenu les etirerait et le trou reviendrait, ailleurs. */
  justify-content:flex-start}
.defile::-webkit-scrollbar{width:8px}
.defile::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}

/* Sous 1000 px on repasse en UNE colonne et on autorise le defilement general :
   ecraser un champ de montant est plus risque que faire defiler. */
@media (max-width:1000px){
  .corps{grid-template-columns:1fr;overflow-y:auto}
  .col{min-height:auto}
  .defile{overflow:visible;min-height:auto}
}

/* ⚠ RESSERRE (2026-08-07) : meme en plein ecran une glissiere apparaissait dans la
   colonne de droite. Chaque carte y perdait une dizaine de pixels en remplissage et
   les textes d aide en prenaient deux ou trois lignes — cumule, cela depassait la
   hauteur d un ecran. Compacte, mais rien n a ete retire. */
.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:11px;
  padding:.6rem .75rem;flex:0 0 auto;min-height:0}
.carte.plein{flex:1 1 auto;display:flex;flex-direction:column;min-height:0}
.carte h2{margin:0 0 .4rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.09em;color:var(--tx2);font-weight:700}
.carte h2 .note{font-weight:400;text-transform:none;letter-spacing:0;color:var(--tx3)}
/* << requis >> se voit : une vente anonyme est refusee par le site, autant le dire
   AVANT d avoir tout saisi plutot qu au moment d encaisser. */
.carte h2 .req{font-weight:700;text-transform:none;letter-spacing:0;color:var(--tx-or)}
input.manque{border-color:#f87171}
.carte h2 .lie{color:var(--tx-ok);font-size:.68rem;margin-left:.4rem}

input,select{font:inherit;color:var(--tx);background:var(--f-0f1826);
  border:1px solid var(--v16);border-radius:8px;padding:.32rem .5rem;
  width:100%;min-width:0}
input:focus,select:focus{outline:none;border-color:#c9a97e}
input[type=checkbox]{width:auto}
.r3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.4rem}
/* Les champs du client : empiles, pleine largeur. Voir la note dans le gabarit. */
.champs{display:flex;flex-direction:column;gap:.28rem}
.r2{display:grid;grid-template-columns:1fr 1fr;gap:.4rem}
.sous-ch{font-size:.7rem;color:var(--tx3);margin-top:.16rem}

/* Le champ de scan : plus grand que les autres, c est la porte d entree. */
#scan{font-size:1.02rem;padding:.5rem .65rem}

/* Resultats de recherche : hauteur bornee. Huit articles et leurs variantes
   repousseraient les totaux hors de l ecran. */
.res{margin-top:.55rem;border:1px solid var(--v11);border-radius:9px;
  max-height:32vh;overflow-y:auto}
.res .art{padding:.5rem .65rem;border-top:1px solid var(--v05)}
.res .art:first-child{border-top:0}
.res .nom{font-weight:600;font-size:.87rem}
.res .code{font-family:ui-monospace,monospace;font-size:.73rem;opacity:.55;margin-left:.35rem}
.res .vars{display:flex;flex-wrap:wrap;gap:.28rem;margin-top:.3rem}
.res .vars button{font-size:.74rem;padding:.14rem .5rem}
.res .vars button .q{opacity:.6}

/* Liste des articles vendus : la seule zone qui defile. */
.lignes{flex:1 1 auto;min-height:0;overflow-y:auto}
table{width:100%;border-collapse:collapse;font-size:.86rem}
thead th{position:sticky;top:0;background:var(--f-bande);text-align:left;
  padding:.35rem .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700}
thead th.d{text-align:right}
tbody td{padding:.3rem .5rem;border-top:1px solid var(--v05);vertical-align:middle}
tbody td.d{text-align:right;white-space:nowrap}
tbody td.c{text-align:center;white-space:nowrap}
tbody .det{font-size:.74rem;color:var(--tx2)}
/* Le code de variante : c est ce qu on lit sur l etiquette du vetement, donc
   la seule facon de verifier a l ecran qu on a scanne le bon article. */
tbody .code{font-family:ui-monospace,monospace;font-size:.72rem;color:var(--tx3)}
tbody button{padding:.05rem .42rem;font-size:.9rem;line-height:1.3}

/* Totaux : la ligne du total ne peut pas se confondre avec une taxe. */
.tot .l{display:flex;justify-content:space-between;gap:1rem;padding:.12rem 0;font-size:.86rem}
.tot .l.grand{margin-top:.28rem;padding-top:.35rem;
  border-top:1px solid var(--v16);font-size:1.12rem;font-weight:700}
.tot .l.bon{color:var(--tx-ok)}

button{font:inherit;cursor:pointer;border-radius:8px;padding:.36rem .8rem;
  border:1px solid var(--v16);background:var(--v05);
  color:var(--tx);transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:var(--v10);border-color:var(--v30)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
button.prim:hover:not(:disabled){background:#d8bd97;border-color:#d8bd97}
button.large{width:100%;padding:.5rem .8rem;font-size:1rem;margin-top:.4rem}
button.mini{padding:.16rem .45rem;font-size:.75rem}

.cli{padding:.38rem .6rem;cursor:pointer;font-size:.84rem;
  border-top:1px solid var(--v05)}
.cli:first-child{border-top:0}
.cli:hover{background:var(--v05)}
.cli .m{color:var(--tx2);font-size:.77rem}
.liste-cli{margin-top:.4rem;border:1px solid var(--v11);border-radius:9px;overflow:hidden}

.case{display:flex;align-items:flex-start;gap:.45rem;margin-top:.4rem;
  font-size:.78rem;cursor:pointer}
.case .exp{display:block;color:var(--tx3);font-size:.72rem;line-height:1.45}

.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid var(--v08);
  background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
.actions{flex:0 0 auto;display:flex;gap:.4rem}

.aide{font-size:.71rem;color:var(--tx3);line-height:1.4;margin-top:.3rem}
.vide{padding:1.6rem 1rem;text-align:center;color:var(--tx2);font-size:.86rem}

/* Le compte rendu de vente : un voile, pas une autre fenetre. Une boite de
   dialogue du systeme se serait ouverte derriere, comme le decompte d inactivite. */
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.5rem;z-index:50}
.voile .boite{background:var(--f-carte);border:1px solid var(--v11);
  border-radius:13px;padding:1.15rem 1.3rem;max-width:34rem;width:100%}
.voile h3{margin:0 0 .6rem;font:700 1.06rem/1.25 Georgia,serif}
.voile .rangee{display:flex;justify-content:space-between;gap:1rem;
  padding:.26rem 0;font-size:.86rem;border-top:1px solid var(--v05)}
.voile .rangee:first-of-type{border-top:0}
.voile .fin{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.9rem}
.voile .lien{display:flex;gap:.4rem;margin-top:.55rem}
.voile .lien input{font-family:ui-monospace,monospace;font-size:.78rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Vente au comptoir ». */
function pageCaisse(mode) {
  /* ⚠⚠ IDENTIFIANT D OUVERTURE << attente >>. Le compte rendu de vente est un
     VOILE : il n existe qu APRES un clic sur << Encaisser >>, et le banc ne
     clique pas. Or c est l ecran ou l on lit le lien de paiement, ou l on
     reconcilie une vente DEJA PAYEE chez Square, et ou vit desormais le bouton
     << Verifier le paiement >> — de l argent, donc, et pas un affichage. Il
     serait reste hors de tout controle, exactement comme le lanceur de lot mort
     pendant deux versions. Ce mode pose un compte rendu temoin, inerte : aucun
     appel, aucune vente. La coquille ne l ouvre jamais. */
  const attenteTemoin = String(mode || '') === 'attente';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Vente au comptoir — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.payments}</span><h1>Vente au comptoir</h1>
  <button id="btn-afficheur" class="mini" style="margin-left:auto"
    title="Ouvrir l’écran tourné vers le client, à poser sur un second moniteur"><span class="ic">🖥</span> Affichage client</button>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps">
  <div class="col">
    <div class="carte">
      <input id="scan" autocomplete="off" placeholder="Scannez le code-barres, ou tapez un nom d’article…">
      <div id="res"></div>
    </div>
    <div class="carte plein">
      <h2>Articles</h2>
      <div class="lignes" id="lignes"></div>
    </div>
  </div>
  <div class="col droite">
   <div class="defile">
    <div class="carte">
      <h2>Client <span class="req">— requis</span><span class="lie" id="lie"></span></h2>
      <!-- ⚠ TROIS CHAMPS EN COLONNE, ET NON SUR UNE LIGNE. Sur une ligne, dans une
           colonne de 380 px, chacun faisait 120 px : un nom complet et une adresse
           de courriel y etaient coupes, donc illisibles — on ne pouvait pas
           verifier ce qu on venait de saisir. Signale a l usage le 2026-08-07.
           La zone de droite defile maintenant, la hauteur est donc disponible ;
           la lisibilite d une adresse de courriel, elle, ne se negocie pas. -->
      <div class="champs">
        <input id="c-nom" autocomplete="off" placeholder="Nom">
        <input id="c-mail" autocomplete="off" inputmode="email" placeholder="Courriel">
        <input id="c-tel" autocomplete="off" inputmode="tel" placeholder="Téléphone — 000 000-0000">
      </div>
      <div id="c-res"></div>
      <label class="case"><input type="checkbox" id="c-creer">
        <span>Ouvrir un compte et lui envoyer le lien pour le finaliser
        <span class="exp">Courriel requis. Historique et retours pour lui ; aucune
        inscription à l’infolettre.</span></span></label>
      <h2 style="margin-top:.75rem">Vente</h2>
      <div class="r3">
        <select id="v-prov" title="Province — elle détermine les taxes"></select>
        <input id="v-liv" inputmode="decimal" value="0.00" title="Livraison" placeholder="Livraison">
        <input id="v-rab" inputmode="decimal" value="0.00" title="Rabais" placeholder="Rabais">
      </div>
      <div class="sous-ch">Province · Livraison · Rabais</div>
      <h2 style="margin-top:.75rem">Facture</h2>
      <select id="v-remise" title="Ce qu’on fait de la facture après la vente"></select>
      <div class="sous-ch">L’envoi exige une adresse. Toujours consultable dans Facturation.</div>
    </div>
    <!-- ⚠ LES TOTAUX ET L ENCAISSEMENT SONT DANS LE FLUX, a la suite de la carte
         du client — plus ancres en bas. C est ce qui referme le trou de cent
         soixante pixels signale le 2026-08-07 ; voir la note des trois etats dans
         la feuille de style avant de les redescendre. -->
    <div class="carte tot" id="totaux"></div>
    <div class="carte">
      <h2>Encaissement</h2>
      <div class="r2">
        <select id="v-paie"></select>
        <input id="v-note" placeholder="Note interne (facultatif)">
      </div>
      <button class="prim large" id="btn-vendre" disabled>Enregistrer la vente</button>
      <div class="aide">Cet écran n’encaisse jamais la carte.</div>
    </div>
   </div>
  </div>
</div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions">
    <button id="btn-vider">Vider la vente</button>
  </span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; b.style.marginLeft='auto'; t.appendChild(b); }
    if (actif) { b.textContent='⧉ Détacher'; b.title='Ouvrir cet écran dans sa propre fenêtre'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='⚓ Ancrer'; b.title='Ramener cet écran dans la fenêtre principale'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var msg = document.getElementById('msg');
  var CTX = null;            // contexte recu du site (provinces, moyens, droits)
  var LIGNES = [];           // { productId, name, size, color, price, quantity }
  var CLI = null;            // identifiant du compte lie, s il y en a un
  var TOT = null;            // dernier compte rendu de totaux, venu du SITE
  // ⚠ LES FICHES TROUVEES SONT RETENUES, ET C EST LA CORRECTION D UN VRAI
  // DEFAUT (2026-08-07) : au clic, je reconstruisais une fiche a partir des
  // champs de l ecran — qui sont VIDES pour le courriel et le telephone, puisque
  // c est justement ce qu on attend de la recherche. Le nom se remplissait, le
  // reste non, et la vente partait sans adresse : donc sans facture par courriel.
  var TROUVES = [];
  var enVente = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function argent(n){
    var v = (Math.round((parseFloat(n) || 0) * 100) / 100).toFixed(2);
    return v.replace('.', ',') + ' $';
  }

  // ⚠ CHAQUE REFUS DU PONT A SA PHRASE. Un ecran muet sur un refus de droit
  // ressemble a une panne, et on cherche au mauvais endroit — chez l imprimante,
  // dans le reseau, partout sauf dans les permissions.
  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne permet pas d’encaisser une vente.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps. Réessayez ; si cela persiste, rechargez-la (Ctrl+R).',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cet article n’existe plus.',
    aucun_article:      'Aucun article dans la vente.',
    total_invalide:     'Total invalide — la vente n’a pas été enregistrée.',
    client_requis:      'Le nom du client est obligatoire — aucune vente anonyme.',
    courriel_invalide:  'Un courriel valide est requis pour ouvrir un compte.',
    taxes_indisponibles:'Moteur de taxes indisponible — n’encaissez pas.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(m){ return MOTIFS[m] || 'Erreur inattendue (' + esc(m || '?') + ').'; }

  // ⚠ UN SEUL POINT D APPEL, avec le rattrapage CHAINE. Le second argument de
  // << then >> ne rattrape que le rejet de la promesse d avant : ce que le premier
  // LEVE lui passe a cote et devient un rejet non traite, invisible dans une
  // fenetre native. Cette nuance a couche la fenetre Imprimantes pendant quatre
  // versions publiees (2026-08-07). Ici, tout passe par appeler().
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  // ══ TOTAUX ════════════════════════════════════════════════════════════════
  // ⚠ ILS VIENNENT DU SITE, TOUJOURS. Additionner ici serait plus simple et plus
  // rapide — et ce serait la faute la plus couteuse possible : deux calculs de
  // taxes qui divergent d un ecran a l autre, decouverts en comptabilite des
  // semaines plus tard, sans savoir lequel a raison.
  var totT = null;
  function majTotaux(){
    clearTimeout(totT);
    // Anti-rebond : changer la province, la livraison et le rabais a la suite ne
    // doit pas declencher trois allers-retours vers la fenetre principale.
    totT = setTimeout(function(){
      if (!LIGNES.length) { TOT = null; dessinerTotaux(); majBouton(); return; }
      appeler('caisse:totaux', [LIGNES, val('v-prov'), val('v-liv'), val('v-rab')]).then(function(r){
        if (!r.ok) { TOT = null; dire(expliquer(r.motif), 'err'); }
        else { TOT = r; dire(''); }
        dessinerTotaux(); majBouton(); diffuser();
      });
    }, 150);
  }

  /* ⚠ L AFFICHEUR SUIT LE PANIER, ET LE MESSAGE PART DE LA FENETRE PRINCIPALE.
     Le canal de l afficheur n accepte qu elle : cette fenetre ne peut donc pas lui
     parler directement, elle demande au site de le faire (caisse:diffuser). Sans
     cela, l afficheur montrerait au client le panier de l ECRAN DE LA PAGE — un
     ecran vide pendant qu on scanne, ce qui est pire qu un afficheur eteint parce
     qu on le croirait juste.
     ⚠ ET IL EST VIDE QUAND LA VENTE EST VIDE, volontairement : le client suivant
     ne doit pas voir le panier du precedent. */
  function diffuser(){
    appeler('caisse:diffuser', [LIGNES, val('v-prov'), val('v-liv'), val('v-rab')])
      .then(function(){ /* l afficheur ne doit jamais faire tomber la caisse */ });
  }

  function dessinerTotaux(){
    var z = document.getElementById('totaux');
    if (!TOT) {
      z.innerHTML = '<div class="vide">' + (LIGNES.length
        ? 'Calcul des totaux…'
        : 'Aucun article — scannez un code-barres pour commencer.') + '</div>';
      return;
    }
    var h = '<div class="l"><span>Sous-total</span><span>' + argent(TOT.sousTotal) + '</span></div>';
    if (TOT.rabais > 0) h += '<div class="l bon"><span>Rabais</span><span>-' + argent(TOT.rabais) + '</span></div>';
    if (TOT.livraison > 0) h += '<div class="l"><span>Livraison</span><span>' + argent(TOT.livraison) + '</span></div>';
    (TOT.taxes || []).forEach(function(x){
      // Le taux est affiche : c est ce qui permet de verifier une taxe d un coup
      // d oeil quand une vente part vers une autre province.
      var taux = (Math.round((x.taux || 0) * 1000000) / 10000);
      h += '<div class="l"><span>' + esc(x.nom) + ' (' + taux + ' %)</span><span>'
        + argent(x.montant) + '</span></div>';
    });
    h += '<div class="l grand"><span>Total</span><span>' + argent(TOT.total) + '</span></div>';
    z.innerHTML = h;
  }

  function majBouton(){
    var b = document.getElementById('btn-vendre');
    // ⚠ LE NOM DU CLIENT FAIT PARTIE DES CONDITIONS. Le site refuse une vente
    // anonyme (motif client_requis) : laisser le bouton actif ferait scanner,
    // encaisser, presser — et decouvrir le refus a la fin, devant le client.
    var nomOk = !!val('c-nom').trim();
    var champ = document.getElementById('c-nom');
    if (champ) champ.className = (!nomOk && LIGNES.length) ? 'manque' : '';
    var pret = !!(TOT && TOT.total > 0 && LIGNES.length && nomOk && CTX && CTX.peutVendre && !enVente);
    b.disabled = !pret;
    b.textContent = enVente ? 'Enregistrement…'
      : (pret ? 'Enregistrer la vente — ' + argent(TOT.total)
              : (LIGNES.length && !nomOk ? 'Nom du client requis' : 'Enregistrer la vente'));
    document.getElementById('btn-vider').disabled = !LIGNES.length || enVente;
  }

  function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }

  // ══ ARTICLES ══════════════════════════════════════════════════════════════
  function dessinerLignes(){
    var z = document.getElementById('lignes');
    if (!LIGNES.length) {
      z.innerHTML = '<div class="vide">Aucun article — scannez un code-barres pour commencer.</div>';
      return;
    }
    var corps = LIGNES.map(function(l, i){
      var det = [l.size, l.color].filter(Boolean).join(' / ') || '—';
      return '<tr>'
        + '<td><strong>' + esc(l.name) + '</strong><span class="det"> · ' + esc(det) + '</span>'
        + (l.sku ? '<div class="code">' + esc(l.sku) + '</div>' : '') + '</td>'
        + '<td class="c"><button data-q="' + i + '" data-d="-1">−</button>'
        + ' <strong>' + l.quantity + '</strong> '
        + '<button data-q="' + i + '" data-d="1">+</button></td>'
        + '<td class="d">' + argent(l.price) + '</td>'
        + '<td class="d"><strong>' + argent(l.price * l.quantity) + '</strong></td>'
        + '<td class="c"><button data-retirer="' + i + '" title="Retirer">✕</button></td>'
        + '</tr>';
    }).join('');
    z.innerHTML = '<table><thead><tr><th>Article</th><th class="c">Qté</th>'
      + '<th class="d">Prix</th><th class="d">Total</th><th></th></tr></thead>'
      + '<tbody>' + corps + '</tbody></table>';
  }

  function ajouter(pid, taille, couleur){
    var cle = pid + '|' + (taille || '') + '|' + (couleur || '');
    var ex = null;
    for (var i = 0; i < LIGNES.length; i++) {
      if ((LIGNES[i].productId + '|' + LIGNES[i].size + '|' + LIGNES[i].color) === cle) { ex = LIGNES[i]; break; }
    }
    if (ex) { ex.quantity++; apresAjout(); return; }
    // ⚠ LE PRIX EST DEMANDE AU SITE, jamais devine ici : c est lui qui connait les
    // promotions en cours. Un prix recopie dans cette fenetre vendrait au plein
    // tarif un article en solde, et personne ne s en apercevrait avant la facture.
    appeler('caisse:article', [pid, taille, couleur]).then(function(r){
      if (!r.ok) { dire(expliquer(r.motif), 'err'); return; }
      LIGNES.push(r.ligne);
      apresAjout();
    });
  }

  function apresAjout(){
    videRecherche();
    dessinerLignes();
    majTotaux();
    var s = document.getElementById('scan');
    if (s) { s.value = ''; s.focus(); }
  }

  function videRecherche(){ document.getElementById('res').innerHTML = ''; }

  // ══ RECHERCHE ET SCAN ═════════════════════════════════════════════════════
  // ⚠ ON NE REDESSINE QUE #res. Reconstruire la carte entiere detruirait le champ
  // ou l on vient de taper : curseur perdu, focus perdu, saisie impossible. Le
  // lecteur de codes-barres enchaine parfois deux articles sans qu on touche au
  // clavier — il ne doit rien perdre.
  var rechT = null;
  function chercher(texte, entree){
    clearTimeout(rechT);
    var q = String(texte || '').trim();
    if (!q) { videRecherche(); return; }
    // Trois caracteres minimum, la regle de toutes les recherches du projet. En
    // dessous on n affiche RIEN plutot que tout le catalogue.
    if (!entree && q.length < 3) { videRecherche(); return; }
    rechT = setTimeout(function(){
      appeler('caisse:chercher', [q]).then(function(r){
        if (!r.ok) { dire(expliquer(r.motif), 'err'); return; }
        dire('');
        // ⚠ LE CODE EXACT GAGNE TOUJOURS. C est ce que le lecteur envoie, et il
        // doit ajouter l article sans passer par une liste d un seul element.
        if (r.sku) { ajouter(r.sku.produitId, r.sku.taille, r.sku.couleur); return; }
        if (r.court) { videRecherche(); dire('Trois caractères minimum pour chercher.', 'att'); return; }
        dessinerResultats(r.articles || [], q);
      });
    }, entree ? 0 : 160);
  }

  function dessinerResultats(articles, q){
    var z = document.getElementById('res');
    if (!articles.length) {
      z.innerHTML = '<div class="res"><div class="art">Aucun article ne correspond à « '
        + esc(q) + ' ».</div></div>';
      return;
    }
    z.innerHTML = '<div class="res">' + articles.map(function(a){
      // ⚠ ON NE PROPOSE PAS UNE TAILLE ABSENTE. Le bouton est grise : vendre ce
      // qu on n a pas creerait un stock negatif que personne n a demande.
      var vars = (a.variantes || []).map(function(v){
        return '<button data-pid="' + esc(a.id) + '" data-sz="' + esc(v.taille) + '"'
          + ' data-col="' + esc(v.couleur) + '"'
          + (v.quantite <= 0 ? ' disabled title="Aucun en stock"' : '') + '>'
          + esc(v.cle) + ' <span class="q">(' + v.quantite + ')</span></button>';
      }).join('');
      return '<div class="art"><div class="nom">' + esc(a.nom)
        + (a.code ? '<span class="code">' + esc(a.code) + '</span>' : '') + '</div>'
        + '<div class="vars">' + (vars || '<span class="q">aucune variante</span>') + '</div></div>';
    }).join('') + '</div>';
  }

  // ══ CLIENT ════════════════════════════════════════════════════════════════
  var cliT = null;
  function chercherClient(texte){
    clearTimeout(cliT);
    // ⚠ MODIFIER L IDENTITE ROMPT LE LIEN AU COMPTE. Enregistrer la vente sous le
    // compte du client precedent serait la pire erreur de cet ecran, et elle
    // serait invisible.
    CLI = null;
    majLie();
    var q = String(texte || '').trim();
    if (q.length < 3) { document.getElementById('c-res').innerHTML = ''; return; }
    cliT = setTimeout(function(){
      appeler('caisse:client', [q]).then(function(r){
        if (!r.ok) { dire(expliquer(r.motif), 'err'); return; }
        if (r.exact) { remplirClient(r.exact); return; }
        var l = r.trouves || [];
        TROUVES = l;
        document.getElementById('c-res').innerHTML = l.length
          ? '<div class="liste-cli">' + l.map(function(u){
              return '<div class="cli" data-uid="' + esc(u.id) + '">'
                + '<strong>' + esc(u.nom || '(sans nom)') + '</strong>'
                + '<span class="m"> · ' + esc(u.courriel || 'sans courriel')
                + (u.commandes > 0 ? ' · ' + u.commandes + ' commande(s)' : '') + '</span></div>';
            }).join('') + '</div>'
          : '';
      });
    }, 160);
  }

  function remplirClient(u){
    CLI = u.id;
    document.getElementById('c-nom').value = u.nom || '';
    document.getElementById('c-mail').value = u.courriel || '';
    var tel = document.getElementById('c-tel');
    tel.value = u.tel || '';
    masquerTel(tel);
    // ⚠ LA PROVINCE SUIT LE CLIENT : c est elle qui determine les taxes, et la
    // ressaisir a la main est l erreur la plus couteuse de cet ecran.
    if (u.province) {
      var s = document.getElementById('v-prov');
      for (var i = 0; i < s.options.length; i++) {
        if (s.options[i].value === u.province) { s.value = u.province; break; }
      }
    }
    document.getElementById('c-res').innerHTML = '';
    majLie();
    majTotaux();
    dire('Fiche de ' + (u.nom || u.courriel) + ' reprise.', 'bon');
  }

  function majLie(){ document.getElementById('lie').textContent = CLI ? '✓ compte lié' : ''; }

  /* ⚠ MASQUE DU TELEPHONE — 000 000-0000, la forme deja utilisee dans les fiches.
     Il ne gene PAS la recherche : celle-ci compare des chiffres, jamais la mise en
     forme. Et il ne reformate que si le curseur est AU BOUT du champ : sinon,
     corriger un chiffre au milieu renverrait le curseur a la fin a chaque frappe,
     ce qui est plus penible que l absence de masque. */
  function masquerTel(el){
    var auBout = (el.selectionStart == null) || (el.selectionStart === el.value.length);
    var d = String(el.value || '').replace(/[^0-9]/g, '');
    // Un 1 de tete (indicatif pays) est retire : personne ne le note dans une fiche.
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    d = d.slice(0, 10);
    var s = d;
    if (d.length > 6) s = d.slice(0, 3) + ' ' + d.slice(3, 6) + '-' + d.slice(6);
    else if (d.length > 3) s = d.slice(0, 3) + ' ' + d.slice(3);
    if (s === el.value) return;
    el.value = s;
    if (auBout) { try { el.selectionStart = el.selectionEnd = s.length; } catch (e) {} }
  }

  // ══ ENREGISTRER LA VENTE ══════════════════════════════════════════════════
  function vendre(){
    if (enVente || !LIGNES.length || !TOT || !(TOT.total > 0)) return;
    enVente = true; majBouton(); dire('Enregistrement…', 'att');
    appeler('caisse:vendre', [{
      lignes: LIGNES,
      prov: val('v-prov'), liv: val('v-liv'), rab: val('v-rab'),
      nom: val('c-nom').trim(), courriel: val('c-mail').trim(), tel: val('c-tel').trim(),
      moyen: val('v-paie'), note: val('v-note').trim(), remise: val('v-remise'),
      veutCompte: !!document.getElementById('c-creer').checked,
      cliId: CLI
    }]).then(function(r){
      enVente = false;
      if (!r.ok) { majBouton(); dire(expliquer(r.motif), 'err'); return; }
      // La vente est en base : on peut vider CETTE fenetre.
      LIGNES = []; CLI = null; TOT = null;
      document.getElementById('c-nom').value = '';
      document.getElementById('c-mail').value = '';
      document.getElementById('c-tel').value = '';
      document.getElementById('v-note').value = '';
      document.getElementById('c-creer').checked = false;
      document.getElementById('v-liv').value = '0.00';
      document.getElementById('v-rab').value = '0.00';
      majLie(); dessinerLignes(); dessinerTotaux(); majBouton(); dire('');
      diffuser();
      compteRendu(r);
    });
  }

  /* ⚠ LE COMPTE RENDU EST UN VOILE DANS CETTE FENETRE, pas une boite du systeme.
     Une boite de dialogue se serait ouverte derriere la fenetre principale ou sur
     l autre ecran — exactement ce qui a rendu le decompte d inactivite invisible.
     Et il DIT ce qui n a pas marche : stock non decompte, base non confirmee,
     facture non partie. Une vente << reussie >> qui n a pas atteint la base est le
     genre de silence qu on paie a l inventaire. */
  function compteRendu(r){
    var lignes = '';
    lignes += rangee('Commande', esc(r.numero || '—'));
    lignes += rangee('Total', argent(r.total));
    if (r.enAttente) {
      lignes += rangee('Paiement', '<span style="color:var(--tx-att)">en attente — lien à envoyer</span>');
    } else {
      lignes += rangee('Stock décompté', r.stockOk ? 'oui'
        : '<strong style="color:var(--tx-err)">NON — à vérifier</strong>');
    }
    lignes += rangee('Enregistrement en base', r.nuageOk ? 'confirmé'
      : '<strong style="color:var(--tx-err)">non confirmé</strong>');
    if (r.envoiCourriel === true)  lignes += rangee('Facture', 'envoyée par courriel');
    if (r.envoiCourriel === false) lignes += rangee('Facture', '<strong style="color:var(--tx-err)">NON envoyée</strong>');
    if (r.compteNeuf) lignes += rangee('Compte client', 'ouvert · lien de finalisation envoyé');

    var lien = '';
    if (r.enAttente) {
      lien = r.lien && r.lien.url
        ? '<div class="lien"><input id="lien-url" readonly value="' + esc(r.lien.url) + '">'
          + '<button class="mini" id="btn-copier"><span class="ic">📋</span> Copier</button>'
          /* ⚠ LE RECOURS QUAND LA CONFIRMATION AUTOMATIQUE N ARRIVE PAS. Le
             client ferme son onglet, le retour rate : la vente est PAYEE chez
             Square et la facture reste impayee chez nous. Sans ce bouton, il n y
             avait aucun moyen de les reconcilier au comptoir — il n existait que
             dans l ecran web, retire en 3.54.0. */
          + '<button class="mini" id="btn-verif" data-hc="' + esc((r.lien && r.lien.hcId) || '')
          + '" data-cmd="' + esc(r.commandeId || '') + '">↻ Vérifier le paiement</button></div>'
          + '<div class="aide">Le stock sera décompté et la facture marquée payée quand Square '
          + 'confirmera — automatiquement au retour du client. Rien n’est encaissé par cet écran. '
          + 'S’il a payé mais que rien ne bouge, pressez <strong>Vérifier le paiement</strong>.</div>'
        : '<div class="aide" style="color:var(--tx-err)">La commande est enregistrée, mais Square a refusé '
          + 'de créer le lien : ' + esc(r.lienMotif || 'raison inconnue') + '. Réessayez depuis la '
          + 'commande, ou encaissez autrement.</div>';
    }

    var avis = (r.avis || []).map(function(a){
      var c = a.ton === 'error' ? '#f87171' : (a.ton === 'warning' ? '#fbbf24' : '#4ade80');
      return '<div class="aide" style="color:' + c + '">' + esc(a.texte) + '</div>';
    }).join('');

    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite"><h3>' + (r.enAttente ? '<span class="ic">🔗</span> Vente en attente de paiement'
      : '✅ Vente enregistrée') + '</h3>' + lignes + lien + avis
      + '<div class="fin"><button class="prim" id="btn-ok">Continuer</button></div></div>';
    document.body.appendChild(v);
    /* ⚠ LE VERDICT EST DIT DANS LES MOTS DE CET ECRAN, pas herite du site : le
       coeur rend un etat (paye / annule / insuffisant / attente), et c est ici
       qu on choisit la phrase et le ton. Un << underpaid >> brut ne dirait rien
       a quelqu un devant un client. */
    var bvf = document.getElementById('btn-verif');
    if (bvf) bvf.onclick = function(){
      var hc = bvf.getAttribute('data-hc');
      if (!hc) { dire('Aucun lien de paiement a verifier.', 'err'); return; }
      bvf.disabled = true;
      dire('Vérification auprès de Square…');
      appeler('caisse:verifierPaiement', [hc, bvf.getAttribute('data-cmd')]).then(function(res){
        bvf.disabled = false;
        if (!res || !res.ok) { dire(expliquer(res), 'err'); return; }
        if (res.etat === 'paye') {
          dire('Paiement confirmé' + (res.numero ? ' — ' + res.numero : '')
            + (res.stockOk ? ' · stock décompté.' : ' · ⚠ stock à vérifier.'),
            res.stockOk ? 'bon' : 'att');
          v.remove();
          var sc = document.getElementById('scan');
          if (sc) sc.focus();
          return;
        }
        if (res.etat === 'annule') { dire('Paiement annulé par le client.', 'att'); return; }
        if (res.etat === 'insuffisant') {
          dire('⚠ Montant reçu INFÉRIEUR au total — à vérifier dans Square.', 'err');
          return;
        }
        dire('Pas encore payé. Le lien reste valide — réessayez plus tard.', 'att');
      });
    };

    var ok = document.getElementById('btn-ok');
    ok.onclick = function(){
      v.remove();
      var s = document.getElementById('scan');
      if (s) s.focus();
    };
    ok.focus();
    var cp = document.getElementById('btn-copier');
    if (cp) cp.onclick = function(){
      var i = document.getElementById('lien-url');
      i.select();
      // ⚠ execCommand ET NON navigator.clipboard : une fenetre native est
      // chargee en data:, son origine est nulle, donc elle n est PAS un contexte
      // securise — l API moderne du presse-papiers y est refusee. Mesure sur ce
      // projet ; le vieil appel, lui, fonctionne.
      var fait = false;
      try { fait = document.execCommand('copy'); } catch (e) { fait = false; }
      cp.textContent = fait ? '✓ Copié' : 'Ctrl+C pour copier';
    };
  }

  function rangee(k, v){
    return '<div class="rangee"><span style="color:var(--tx2)">' + k + '</span><span>' + v + '</span></div>';
  }

  // ══ DEMARRAGE ═════════════════════════════════════════════════════════════
  function remplirListe(id, options, defaut){
    var s = document.getElementById(id);
    s.innerHTML = options.map(function(o){
      var v = (o.cle != null) ? o.cle : o;
      var t = (o.libelle != null) ? o.libelle : o;
      return '<option value="' + esc(v) + '"' + (v === defaut ? ' selected' : '') + '>' + esc(t) + '</option>';
    }).join('');
  }

  function demarrer(){
    appeler('caisse:contexte').then(function(r){
      if (!r.ok) {
        // ⚠ ON DESARME L ECRAN AU LIEU DE LE LAISSER CROIRE QU IL PEUT VENDRE.
        document.getElementById('corps').innerHTML =
          '<div class="vide" style="grid-column:1/-1"><div style="font-size:1rem;color:var(--tx);margin-bottom:.4rem">'
          + 'Caisse indisponible</div>' + esc(expliquer(r.motif)) + '</div>';
        dire(expliquer(r.motif), 'err');
        return;
      }
      CTX = r;
      remplirListe('v-prov', r.provinces, 'QC');
      remplirListe('v-paie', r.paiements, 'terminal');
      remplirListe('v-remise', r.remises, 'courriel');
      document.getElementById('sous').textContent = r.par
        ? (r.par + (r.peutVendre ? '' : ' · lecture seule')) : '';
      if (!r.peutVendre) dire('Votre rôle ne permet pas d’enregistrer une vente.', 'att');
      dessinerLignes(); dessinerTotaux(); majBouton();
      var s = document.getElementById('scan');
      if (s) s.focus();
    });
  }

  // ── Ecouteurs ──────────────────────────────────────────────────────────────
  document.getElementById('scan').oninput = function(){ chercher(this.value, false); };
  document.getElementById('scan').onkeydown = function(ev){
    if (ev.key === 'Enter') { ev.preventDefault(); chercher(this.value, true); }
  };
  ['c-nom','c-mail'].forEach(function(id){
    document.getElementById(id).oninput = function(){ chercherClient(this.value); majBouton(); };
  });
  document.getElementById('c-tel').oninput = function(){
    masquerTel(this);
    chercherClient(this.value);
  };
  ['v-prov','v-liv','v-rab'].forEach(function(id){
    document.getElementById(id).onchange = function(){ majTotaux(); };
  });
  document.getElementById('btn-vendre').onclick = vendre;
  document.getElementById('btn-vider').onclick = function(){
    LIGNES = []; TOT = null; videRecherche();
    dessinerLignes(); dessinerTotaux(); majBouton(); dire(''); diffuser();
    var s = document.getElementById('scan'); if (s) s.focus();
  };
  document.getElementById('btn-afficheur').onclick = function(){
    var b = this;
    b.disabled = true;
    appeler('caisse:affichage').then(function(r){
      b.disabled = false;
      if (!r.ok) { dire(expliquer(r.motif), 'err'); return; }
      // ⚠ ON DIFFUSE TOUT DE SUITE APRES L OUVERTURE. L afficheur demande bien
      // l etat courant a son ouverture, mais il le demande a la CAISSE DU SITE :
      // ouvert depuis cette fenetre, il afficherait un panier vide devant le
      // client alors que la vente est en cours.
      diffuser();
      dire('Affichage client ouvert.', 'bon');
    });
  };

  // ⚠ ECOUTEURS DELEGUES. Les boutons de variante, de quantite et de retrait sont
  // redessines a chaque changement : un ecouteur pose sur chacun serait reperdu
  // aussitot. On ecoute une fois, sur le corps, en remontant depuis la cible.
  document.getElementById('corps').addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var v = t.closest('.vars button');
    if (v && !v.disabled) {
      ajouter(v.getAttribute('data-pid'), v.getAttribute('data-sz'), v.getAttribute('data-col'));
      return;
    }
    var q = t.closest('[data-q]');
    if (q) {
      var i = parseInt(q.getAttribute('data-q'), 10);
      var d = parseInt(q.getAttribute('data-d'), 10);
      if (LIGNES[i]) {
        LIGNES[i].quantity = Math.max(1, LIGNES[i].quantity + d);
        dessinerLignes(); majTotaux();
      }
      return;
    }
    var rr = t.closest('[data-retirer]');
    if (rr) {
      LIGNES.splice(parseInt(rr.getAttribute('data-retirer'), 10), 1);
      dessinerLignes(); majTotaux();
      return;
    }
    var c = t.closest('.cli');
    if (c) {
      var uid = c.getAttribute('data-uid');
      // La fiche COMPLETE est deja la, retenue au moment du dessin : courriel,
      // telephone et province comprises. Aucun aller-retour, et surtout aucune
      // reconstruction a partir de l ecran.
      for (var k = 0; k < TROUVES.length; k++) {
        if (TROUVES[k].id === uid) { remplirClient(TROUVES[k]); return; }
      }
      dire('Fiche introuvable — relancez la recherche.', 'err');
    }
  });

  // Ctrl+S n a pas de sens ici, mais Echap doit fermer comme partout ailleurs.
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && !document.querySelector('.voile')) { ev.preventDefault(); P.fermer(); }
  });

  demarrer();
  if (${attenteTemoin ? 'true' : 'false'}) {
    /* Un compte rendu TEMOIN, avec un paiement en attente : c est le seul etat
       qui dessine le lien, le bouton << Copier >> et celui de verification. */
    compteRendu({ numero: 'SZ-100252', total: 149.95, enAttente: true,
      commandeId: 'ord_temoin', paiement: 'lien',
      lien: { url: 'https://square.link/u/TEMOIN', hcId: 'hc_temoin' },
      envoiCourriel: true, compteNeuf: false,
      avis: [{ ton: 'warning', texte: 'Temoin : aucune vente n a eu lieu.' }] });
  }
})();
</script>
</body></html>`;
}

module.exports = { pageCaisse };
